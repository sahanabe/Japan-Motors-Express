const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide auction title'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Auction Settings
  startingPrice: {
    type: Number,
    required: [true, 'Please provide starting price'],
    min: [0, 'Starting price cannot be negative']
  },
  reservePrice: {
    type: Number,
    min: [0, 'Reserve price cannot be negative']
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.startingPrice;
    }
  },
  bidIncrement: {
    type: Number,
    default: 1000,
    min: [100, 'Bid increment must be at least 100']
  },
  
  // Timing
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  duration: {
    type: Number, // in hours
    default: 168 // 7 days
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled'],
    default: 'draft'
  },
  
  // Bidding
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  totalBids: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Auto-bid settings
  allowAutoBid: {
    type: Boolean,
    default: true
  },
  
  // Auction Rules
  requireRegistration: {
    type: Boolean,
    default: false
  },
  requireDeposit: {
    type: Boolean,
    default: false
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  
  // Participants
  registeredBidders: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    depositPaid: {
      type: Boolean,
      default: false
    }
  }],
  
  // Watchers
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Results
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winningBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  finalPrice: Number,
  reserveMet: {
    type: Boolean,
    default: false
  },
  
  // Payment and Completion
  paymentCompleted: {
    type: Boolean,
    default: false
  },
  paymentDueDate: Date,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Extensions
  extensionCount: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 extensions allowed']
  },
  lastExtendedAt: Date,
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  uniqueViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Admin fields
  featured: {
    type: Boolean,
    default: false
  },
  adminNotes: String
}, {
  timestamps: true
});

// Indexes for performance
AuctionSchema.index({ status: 1 });
AuctionSchema.index({ startDate: 1 });
AuctionSchema.index({ endDate: 1 });
AuctionSchema.index({ currentPrice: 1 });
AuctionSchema.index({ seller: 1 });
AuctionSchema.index({ featured: 1 });

// Virtual for time remaining
AuctionSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'active') {
    const now = new Date();
    const timeLeft = this.endDate - now;
    return Math.max(0, timeLeft);
  }
  return 0;
});

// Method to check if auction is active
AuctionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

// Method to extend auction
AuctionSchema.methods.extend = function(hours = 24) {
  if (this.extensionCount < 3) {
    this.endDate = new Date(this.endDate.getTime() + (hours * 60 * 60 * 1000));
    this.extensionCount += 1;
    this.lastExtendedAt = new Date();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Auction', AuctionSchema); 