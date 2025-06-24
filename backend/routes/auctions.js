const express = require('express');
const { body, validationResult } = require('express-validator');
const Auction = require('../models/Auction');
const Car = require('../models/Car');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/auctions
// @desc    Get all active auctions with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status = 'active',
      featured,
      sortBy = 'endDate',
      sortOrder = 'asc'
    } = req.query;

    const filter = { status };
    if (featured) filter.featured = featured === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const auctions = await Auction.find(filter)
      .populate('car', 'title make model year images price')
      .populate('seller', 'name businessName isVerified')
      .populate('highestBidder', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(filter);

    res.json({
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auctions/:id
// @desc    Get single auction by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('car')
      .populate('seller', 'name businessName isVerified avatar phone email')
      .populate('highestBidder', 'name')
      .populate({
        path: 'bids',
        populate: {
          path: 'bidder',
          select: 'name'
        },
        options: { sort: { amount: -1 }, limit: 10 }
      });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Increment view count
    auction.views += 1;
    await auction.save();

    res.json(auction);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auctions
// @desc    Create new auction
// @access  Private (Seller only)
router.post('/', [
  protect,
  authorize('seller', 'admin'),
  [
    body('car', 'Car ID is required').not().isEmpty(),
    body('title', 'Title is required').not().isEmpty(),
    body('startingPrice', 'Starting price is required').isFloat({ min: 0 }),
    body('startDate', 'Start date is required').isISO8601(),
    body('endDate', 'End date is required').isISO8601()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { car, title, description, startingPrice, reservePrice, startDate, endDate, bidIncrement } = req.body;

    // Check if car exists and belongs to seller
    const carDoc = await Car.findById(car);
    if (!carDoc) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (carDoc.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (carDoc.listingType !== 'auction') {
      return res.status(400).json({ message: 'Car must be listed for auction' });
    }

    // Check if car already has an active auction
    const existingAuction = await Auction.findOne({ 
      car, 
      status: { $in: ['draft', 'scheduled', 'active'] }
    });

    if (existingAuction) {
      return res.status(400).json({ message: 'Car already has an active auction' });
    }

    const auctionData = {
      car,
      seller: req.user.id,
      title,
      description,
      startingPrice,
      reservePrice,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      bidIncrement: bidIncrement || 1000,
      currentPrice: startingPrice
    };

    // Determine status based on start date
    const now = new Date();
    if (new Date(startDate) > now) {
      auctionData.status = 'scheduled';
    } else if (new Date(startDate) <= now && new Date(endDate) > now) {
      auctionData.status = 'active';
    }

    const auction = new Auction(auctionData);
    await auction.save();

    // Update car with auction reference
    carDoc.auction = auction._id;
    await carDoc.save();

    await auction.populate('car seller');

    res.status(201).json(auction);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auctions/:id/register
// @desc    Register for auction (if required)
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (!auction.requireRegistration) {
      return res.status(400).json({ message: 'This auction does not require registration' });
    }

    // Check if already registered
    const isRegistered = auction.registeredBidders.some(
      bidder => bidder.user.toString() === req.user.id
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'Already registered for this auction' });
    }

    auction.registeredBidders.push({
      user: req.user.id,
      registeredAt: new Date()
    });

    await auction.save();

    res.json({ message: 'Successfully registered for auction' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auctions/:id/watch
// @desc    Add/remove auction from watchlist
// @access  Private
router.post('/:id/watch', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const userId = req.user.id;
    const watcherIndex = auction.watchers.indexOf(userId);

    if (watcherIndex > -1) {
      // Remove from watchers
      auction.watchers.splice(watcherIndex, 1);
      await auction.save();
      res.json({ message: 'Removed from watchlist', isWatching: false });
    } else {
      // Add to watchers
      auction.watchers.push(userId);
      await auction.save();
      res.json({ message: 'Added to watchlist', isWatching: true });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/auctions/:id
// @desc    Update auction (only if not started)
// @access  Private (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user owns the auction or is admin
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow updates if auction has started
    if (auction.status === 'active' || auction.status === 'ended') {
      return res.status(400).json({ message: 'Cannot update active or ended auction' });
    }

    auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('car seller');

    res.json(auction);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auctions/:id/extend
// @desc    Extend auction (admin only)
// @access  Private (Admin only)
router.post('/:id/extend', [protect, authorize('admin')], async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const { hours = 24 } = req.body;

    if (auction.extend(hours)) {
      await auction.save();
      res.json({ 
        message: `Auction extended by ${hours} hours`,
        newEndDate: auction.endDate,
        extensionsUsed: auction.extensionCount
      });
    } else {
      res.status(400).json({ message: 'Maximum extensions reached' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auctions/:id/cancel
// @desc    Cancel auction
// @access  Private (Owner or Admin)
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user owns the auction or is admin
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (auction.status === 'ended') {
      return res.status(400).json({ message: 'Cannot cancel ended auction' });
    }

    auction.status = 'cancelled';
    await auction.save();

    res.json({ message: 'Auction cancelled successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auctions/my/created
// @desc    Get auctions created by current user
// @access  Private (Seller)
router.get('/my/created', [protect, authorize('seller', 'admin')], async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const filter = { seller: req.user.id };
    if (status) filter.status = status;

    const auctions = await Auction.find(filter)
      .populate('car', 'title make model year images')
      .populate('highestBidder', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(filter);

    res.json({
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auctions/my/watching
// @desc    Get auctions being watched by current user
// @access  Private
router.get('/my/watching', protect, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const auctions = await Auction.find({ watchers: req.user.id })
      .populate('car', 'title make model year images')
      .populate('seller', 'name businessName')
      .populate('highestBidder', 'name')
      .sort({ endDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments({ watchers: req.user.id });

    res.json({
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 