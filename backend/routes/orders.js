const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Car = require('../models/Car');
const User = require('../models/User');
const Auction = require('../models/Auction');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      carId,
      auctionId,
      orderType,
      shippingAddress,
      shippingMethod,
      paymentMethod
    } = req.body;

    // Get car details
    const car = await Car.findById(carId).populate('seller');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if car is available
    if (car.status !== 'active') {
      return res.status(400).json({ message: 'Car is not available for purchase' });
    }

    // Calculate pricing
    let carPrice = car.price;
    
    // If it's an auction win, get the winning bid amount
    if (orderType === 'auction_win' && auctionId) {
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return res.status(404).json({ message: 'Auction not found' });
      }
      carPrice = auction.finalPrice || auction.currentPrice;
    }

    // Calculate additional costs
    const shippingCost = calculateShippingCost(shippingMethod, shippingAddress.country);
    const insuranceCost = carPrice * 0.02; // 2% of car price
    const serviceFee = carPrice * 0.05; // 5% service fee
    const taxAmount = calculateTax(carPrice, shippingAddress.country);

    // Create order
    const order = new Order({
      buyer: req.user.id,
      seller: car.seller._id,
      car: carId,
      auction: auctionId || null,
      orderType,
      carPrice,
      shippingCost,
      insuranceCost,
      taxAmount,
      serviceFee,
      shippingAddress,
      shippingMethod,
      paymentMethod
    });

    await order.save();

    // Add initial timeline entry
    await order.addTimelineEntry('pending_payment', 'Order created', req.user.id);

    // Update car status to reserved
    car.status = 'reserved';
    await car.save();

    // Populate order for response
    await order.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email businessName' },
      { path: 'car', select: 'title make model year price images' }
    ]);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = {};
    
    // Filter by user role
    if (req.user.role === 'buyer') {
      query.buyer = req.user.id;
    } else if (req.user.role === 'seller') {
      query.seller = req.user.id;
    }
    // Admin can see all orders

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const options = {
      page,
      limit,
      populate: [
        { path: 'buyer', select: 'name email' },
        { path: 'seller', select: 'name email businessName' },
        { path: 'car', select: 'title make model year price images' },
        { path: 'auction', select: 'title currentPrice endDate' }
      ],
      sort: { createdAt: -1 }
    };

    const orders = await Order.paginate(query, options);

    res.json({
      success: true,
      data: orders.docs,
      pagination: {
        page: orders.page,
        pages: orders.totalPages,
        total: orders.totalDocs,
        limit: orders.limit
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone businessName')
      .populate('car')
      .populate('auction')
      .populate('timeline.updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user.role !== 'admin' && 
        order.buyer.toString() !== req.user.id && 
        order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, description } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     order.seller.toString() === req.user.id ||
                     (order.buyer.toString() === req.user.id && 
                      ['cancelled'].includes(status));

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await order.updateStatus(status, description, req.user.id);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add message to order
// @route   POST /api/orders/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user.role !== 'admin' && 
        order.buyer.toString() !== req.user.id && 
        order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.messages.push({
      sender: req.user.id,
      message
    });

    await order.save();

    // Populate the new message
    await order.populate('messages.sender', 'name email');

    res.json({
      success: true,
      data: order.messages[order.messages.length - 1]
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update shipping tracking
// @route   PUT /api/orders/:id/tracking
// @access  Private (Seller/Admin)
router.put('/:id/tracking', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { trackingNumber, shippingProvider, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the seller or admin
    if (req.user.role !== 'admin' && order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.trackingNumber = trackingNumber;
    order.shippingProvider = shippingProvider;
    order.estimatedDelivery = estimatedDelivery;
    
    if (trackingNumber && order.status === 'processing') {
      await order.updateStatus('shipped', 'Order shipped with tracking number', req.user.id);
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions - buyer can cancel pending orders, admin can cancel any
    const canCancel = req.user.role === 'admin' ||
                     (order.buyer.toString() === req.user.id && 
                      ['pending_payment', 'payment_confirmed'].includes(order.status));

    if (!canCancel) {
      return res.status(403).json({ message: 'Cannot cancel order at this stage' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.cancelledBy = req.user.id;

    await order.save();
    await order.addTimelineEntry('cancelled', reason || 'Order cancelled', req.user.id);

    // Update car status back to active
    const car = await Car.findById(order.car);
    if (car && car.status === 'reserved') {
      car.status = 'active';
      await car.save();
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function calculateShippingCost(method, country) {
  const baseCosts = {
    sea_freight: 1500,
    air_freight: 3000,
    land_transport: 800
  };
  
  const countryMultipliers = {
    'USA': 1.0,
    'Canada': 1.2,
    'UK': 1.1,
    'Australia': 1.3,
    'Germany': 1.1
  };
  
  const baseCost = baseCosts[method] || baseCosts.sea_freight;
  const multiplier = countryMultipliers[country] || 1.5;
  
  return Math.round(baseCost * multiplier);
}

function calculateTax(amount, country) {
  const taxRates = {
    'USA': 0.08,
    'Canada': 0.13,
    'UK': 0.20,
    'Australia': 0.10,
    'Germany': 0.19
  };
  
  const rate = taxRates[country] || 0.10;
  return Math.round(amount * rate);
}

module.exports = router; 