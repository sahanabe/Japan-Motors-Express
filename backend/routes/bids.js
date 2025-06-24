const express = require('express');
const { body, validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bids
// @desc    Place a bid on an auction
// @access  Private
router.post('/', [
  protect,
  [
    body('auction', 'Auction ID is required').not().isEmpty(),
    body('amount', 'Bid amount is required').isFloat({ min: 0 })
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auction, amount, maxAutoBid } = req.body;

    // Get auction details
    const auctionDoc = await Auction.findById(auction).populate('car');
    if (!auctionDoc) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if auction is active
    if (!auctionDoc.isActive()) {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if user is not the seller
    if (auctionDoc.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot bid on your own auction' });
    }

    // Check if bid meets minimum requirements
    const currentHighestBid = await Bid.getHighestBid(auction);
    const minBid = currentHighestBid 
      ? currentHighestBid.amount + auctionDoc.bidIncrement 
      : auctionDoc.startingPrice;

    if (amount < minBid) {
      return res.status(400).json({ 
        message: `Bid must be at least $${minBid.toLocaleString()}` 
      });
    }

    // Check if user has sufficient funds (if deposit system is implemented)
    if (auctionDoc.requireDeposit) {
      const userRegistration = auctionDoc.registeredBidders.find(
        reg => reg.user.toString() === req.user.id
      );
      
      if (!userRegistration || !userRegistration.depositPaid) {
        return res.status(400).json({ 
          message: 'Deposit required to bid on this auction' 
        });
      }
    }

    // Create new bid
    const newBid = new Bid({
      auction,
      bidder: req.user.id,
      amount,
      maxAutoBid,
      bidType: maxAutoBid ? 'auto' : 'manual',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await newBid.save();

    // Update auction
    auctionDoc.currentPrice = amount;
    auctionDoc.highestBidder = req.user.id;
    auctionDoc.totalBids += 1;
    auctionDoc.bids.push(newBid._id);

    // Check if reserve price is met
    if (auctionDoc.reservePrice && amount >= auctionDoc.reservePrice) {
      auctionDoc.reserveMet = true;
    }

    await auctionDoc.save();

    // Update previous bids status
    await Bid.updateMany(
      { auction, _id: { $ne: newBid._id } },
      { status: 'outbid', isWinning: false }
    );

    // Set current bid as winning
    newBid.status = 'winning';
    newBid.isWinning = true;
    await newBid.save();

    // Populate bid with user info
    await newBid.populate('bidder', 'name');

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: newBid,
      auction: {
        currentPrice: auctionDoc.currentPrice,
        totalBids: auctionDoc.totalBids,
        reserveMet: auctionDoc.reserveMet
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bids/auction/:auctionId
// @desc    Get all bids for an auction
// @access  Public
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'name')
      .sort({ amount: -1, placedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bid.countDocuments({ auction: req.params.auctionId });

    res.json({
      bids,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bids/my-bids
// @desc    Get current user's bids
// @access  Private
router.get('/my-bids', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = { bidder: req.user.id };
    if (status) filter.status = status;

    const bids = await Bid.find(filter)
      .populate({
        path: 'auction',
        populate: {
          path: 'car',
          select: 'title make model year images'
        }
      })
      .sort({ placedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bid.countDocuments(filter);

    res.json({
      bids,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bids/:id
// @desc    Get single bid details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('bidder', 'name email')
      .populate({
        path: 'auction',
        populate: {
          path: 'car',
          select: 'title make model year'
        }
      });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user owns the bid or is the auction seller or admin
    const auction = await Auction.findById(bid.auction._id);
    const canView = bid.bidder._id.toString() === req.user.id || 
                   auction.seller.toString() === req.user.id || 
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Not authorized to view this bid' });
    }

    res.json(bid);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Bid not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/bids/:id
// @desc    Cancel/withdraw a bid (only if auction hasn't ended)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user owns the bid
    if (bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if auction is still active
    const auction = await Auction.findById(bid.auction);
    if (!auction.isActive()) {
      return res.status(400).json({ message: 'Cannot withdraw bid from ended auction' });
    }

    // Check if this is the highest bid
    if (bid.isWinning) {
      return res.status(400).json({ 
        message: 'Cannot withdraw winning bid. Place a higher bid to change your position.' 
      });
    }

    await Bid.findByIdAndDelete(req.params.id);

    res.json({ message: 'Bid withdrawn successfully' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Bid not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bids/highest/:auctionId
// @desc    Get highest bid for an auction
// @access  Public
router.get('/highest/:auctionId', async (req, res) => {
  try {
    const highestBid = await Bid.getHighestBid(req.params.auctionId);
    
    if (!highestBid) {
      return res.status(404).json({ message: 'No bids found for this auction' });
    }

    res.json(highestBid);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 