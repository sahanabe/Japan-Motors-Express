const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide bid amount'],
    min: [0, 'Bid amount cannot be negative']
  },
  bidType: {
    type: String,
    enum: ['manual', 'auto'],
    default: 'manual'
  },
  
  // Auto-bid settings
  maxAutoBid: {
    type: Number,
    min: [0, 'Max auto bid cannot be negative']
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  
  // Bid status
  status: {
    type: String,
    enum: ['active', 'outbid', 'winning', 'lost'],
    default: 'active'
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  placedAt: {
    type: Date,
    default: Date.now
  },
  
  // IP and browser info for security
  ipAddress: String,
  userAgent: String,
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes
BidSchema.index({ auction: 1, amount: -1 });
BidSchema.index({ bidder: 1, placedAt: -1 });
BidSchema.index({ auction: 1, placedAt: -1 });

// Static method to get highest bid for an auction
BidSchema.statics.getHighestBid = function(auctionId) {
  return this.findOne({ auction: auctionId })
    .sort({ amount: -1 })
    .populate('bidder', 'name email');
};

// Method to check if bid is valid
BidSchema.methods.isValid = async function() {
  const auction = await mongoose.model('Auction').findById(this.auction);
  if (!auction) return false;
  
  // Check if auction is active
  if (!auction.isActive()) return false;
  
  // Check if bid meets minimum increment
  const highestBid = await this.constructor.getHighestBid(this.auction);
  const minBid = highestBid ? highestBid.amount + auction.bidIncrement : auction.startingPrice;
  
  return this.amount >= minBid;
};

module.exports = mongoose.model('Bid', BidSchema); 