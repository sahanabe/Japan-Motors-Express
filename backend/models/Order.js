const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'JCE-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    default: null
  },
  
  // Order Type
  orderType: {
    type: String,
    enum: ['direct_purchase', 'auction_win'],
    required: true
  },
  
  // Pricing Details
  carPrice: {
    type: Number,
    required: true,
    min: [0, 'Car price cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  insuranceCost: {
    type: Number,
    default: 0,
    min: [0, 'Insurance cost cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'JPY', 'EUR', 'GBP']
  },
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending_payment',
      'payment_confirmed',
      'processing',
      'shipped',
      'in_transit',
      'delivered',
      'completed',
      'cancelled',
      'refunded'
    ],
    default: 'pending_payment'
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'crypto', 'cash']
  },
  paymentTransactionId: String,
  paidAt: Date,
  
  // Shipping Information
  shippingAddress: {
    recipientName: {
      type: String,
      required: true
    },
    company: String,
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phone: String
  },
  
  shippingMethod: {
    type: String,
    enum: ['sea_freight', 'air_freight', 'land_transport'],
    default: 'sea_freight'
  },
  shippingProvider: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Export Documentation
  exportDocuments: {
    deRegistrationCertificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      documentUrl: String
    },
    exportCertificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      documentUrl: String
    },
    radiationCertificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      documentUrl: String
    },
    billOfLading: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      documentUrl: String
    }
  },
  
  // Timeline
  timeline: [{
    status: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Additional Information
  notes: String,
  adminNotes: String,
  
  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to calculate total amount
OrderSchema.pre('save', function(next) {
  this.totalAmount = this.carPrice + this.shippingCost + this.insuranceCost + this.taxAmount + this.serviceFee;
  next();
});

// Method to add timeline entry
OrderSchema.methods.addTimelineEntry = function(status, description, updatedBy) {
  this.timeline.push({
    status,
    description,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
OrderSchema.methods.updateStatus = function(newStatus, description, updatedBy) {
  this.status = newStatus;
  return this.addTimelineEntry(newStatus, description, updatedBy);
};

// Add pagination plugin
OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', OrderSchema); 