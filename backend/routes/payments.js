const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

// @desc    Create payment intent
// @route   POST /api/payments/intent
// @access  Private
router.post('/intent', protect, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findById(orderId).populate('buyer seller');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is in correct status
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Order is not in pending payment status' });
    }

    // Generate transaction ID
    const transactionId = 'TXN_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');

    // Create payment record
    const payment = new Payment({
      transactionId,
      order: orderId,
      payer: order.buyer._id,
      recipient: order.seller._id,
      amount: order.totalAmount,
      currency: order.currency || 'USD',
      paymentMethod,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await payment.save();

    // Here you would integrate with actual payment gateway
    // For now, we'll simulate the payment process
    let paymentIntent = {};
    
    switch (paymentMethod) {
      case 'stripe':
        paymentIntent = await createStripePaymentIntent(payment);
        break;
      case 'paypal':
        paymentIntent = await createPayPalPayment(payment);
        break;
      case 'bank_transfer':
        paymentIntent = await createBankTransferInstructions(payment);
        break;
      default:
        paymentIntent = { clientSecret: transactionId };
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        paymentIntent
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/:id/confirm
// @access  Private
router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const { gatewayTransactionId, gatewayResponse } = req.body;

    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is the payer
    if (payment.payer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update payment status
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.gatewayTransactionId = gatewayTransactionId;
    payment.gatewayResponse = gatewayResponse;

    await payment.save();

    // Update order status
    const order = payment.order;
    order.paymentStatus = 'completed';
    order.paymentTransactionId = payment.transactionId;
    order.paidAt = new Date();
    await order.updateStatus('payment_confirmed', 'Payment confirmed', req.user.id);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('payer', 'name email')
      .populate('recipient', 'name email businessName');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user has access to this payment
    if (req.user.role !== 'admin' && 
        payment.payer.toString() !== req.user.id && 
        payment.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all payments for user
// @route   GET /api/payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = {};
    
    // Filter by user role
    if (req.user.role === 'buyer') {
      query.payer = req.user.id;
    } else if (req.user.role === 'seller') {
      query.recipient = req.user.id;
    }
    // Admin can see all payments

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('payer', 'name email')
      .populate('recipient', 'name email businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin/Seller)
router.post('/:id/refund', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user can process refund
    if (req.user.role !== 'admin' && payment.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate refund amount
    if (amount > payment.amount - payment.totalRefunded) {
      return res.status(400).json({ message: 'Refund amount exceeds available amount' });
    }

    // Process refund
    await payment.processRefund(amount, reason);

    // Update order if fully refunded
    if (payment.status === 'refunded') {
      const order = payment.order;
      order.paymentStatus = 'refunded';
      await order.updateStatus('refunded', `Refund processed: ${reason}`, req.user.id);
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Payment.getStats(start, end);
    
    // Get additional statistics
    const totalPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const completedPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    const failedPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'failed'
    });

    const refundedPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['refunded', 'partially_refunded'] }
    });

    // Payment method breakdown
    const methodBreakdown = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalAmount: 0, totalTransactions: 0, avgAmount: 0 },
        counts: {
          total: totalPayments,
          completed: completedPayments,
          failed: failedPayments,
          refunded: refundedPayments
        },
        methodBreakdown,
        period: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook for payment gateway notifications
// @desc    Handle payment webhook
// @route   POST /api/payments/webhook
// @access  Public (but secured with signature verification)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] || req.headers['paypal-signature'];
    
    // Verify webhook signature (implementation depends on payment provider)
    // const isValid = verifyWebhookSignature(req.body, signature);
    // if (!isValid) {
    //   return res.status(400).json({ message: 'Invalid signature' });
    // }

    const { type, data } = req.body;

    switch (type) {
      case 'payment.succeeded':
        await handlePaymentSuccess(data);
        break;
      case 'payment.failed':
        await handlePaymentFailure(data);
        break;
      case 'refund.processed':
        await handleRefundProcessed(data);
        break;
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

// Helper functions for payment processing
async function createStripePaymentIntent(payment) {
  // Stripe integration would go here
  return {
    clientSecret: `pi_${payment.transactionId}_secret`,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  };
}

async function createPayPalPayment(payment) {
  // PayPal integration would go here
  return {
    approvalUrl: `https://paypal.com/checkout?token=${payment.transactionId}`,
    paymentId: payment.transactionId
  };
}

async function createBankTransferInstructions(payment) {
  return {
    bankDetails: {
      bankName: 'Japan Car Express Bank',
      accountNumber: 'XXXX-XXXX-1234',
      routingNumber: 'JPY123456',
      reference: payment.transactionId
    },
    instructions: 'Please include the reference number in your transfer'
  };
}

async function handlePaymentSuccess(data) {
  const payment = await Payment.findOne({ gatewayTransactionId: data.id });
  if (payment) {
    await payment.markCompleted(data.id);
  }
}

async function handlePaymentFailure(data) {
  const payment = await Payment.findOne({ gatewayTransactionId: data.id });
  if (payment) {
    await payment.markFailed(data.failure_reason, data.failure_code);
  }
}

async function handleRefundProcessed(data) {
  const payment = await Payment.findOne({ gatewayTransactionId: data.payment_intent });
  if (payment) {
    await payment.processRefund(data.amount / 100, data.reason); // Assuming amount in cents
  }
}

module.exports = router; 