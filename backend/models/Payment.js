const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'JPY', 'EUR', 'GBP']
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: true,
    enum: [
      'credit_card',
      'debit_card',
      'bank_transfer',
      'paypal',
      'stripe',
      'bitcoin',
      'ethereum',
      'cash',
      'check'
    ]
  },
  
  // Payment Gateway Information
  gatewayProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'bank', 'crypto_exchange']
  },
  gatewayTransactionId: String,
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Card Information (if applicable, stored securely)
  cardLast4: String,
  cardBrand: String,
  cardExpiryMonth: Number,
  cardExpiryYear: Number,
  
  // Bank Transfer Information
  bankTransferDetails: {
    bankName: String,
    accountNumber: String, // Last 4 digits only
    routingNumber: String,
    wireTransferNumber: String
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded',
      'disputed',
      'chargeback'
    ],
    default: 'pending'
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Failure Information
  failureReason: String,
  failureCode: String,
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    },
    processedAt: Date,
    gatewayRefundId: String
  }],
  
  totalRefunded: {
    type: Number,
    default: 0
  },
  
  // Fees
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    gatewayFee: {
      type: Number,
      default: 0
    }
  },
  
  // Security
  ipAddress: String,
  userAgent: String,
  fingerprint: String,
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskFactors: [String],
  
  // Compliance
  amlChecked: {
    type: Boolean,
    default: false
  },
  amlResult: String,
  
  // Dispute Information
  disputes: [{
    disputeId: String,
    reason: String,
    amount: Number,
    status: {
      type: String,
      enum: ['open', 'under_review', 'won', 'lost', 'warning_closed']
    },
    evidence: [{
      type: String,
      url: String,
      uploadedAt: Date
    }],
    createdAt: Date,
    resolvedAt: Date
  }],
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Internal Notes
  internalNotes: String,
  
  // Notification Status
  notifications: {
    payerNotified: {
      type: Boolean,
      default: false
    },
    recipientNotified: {
      type: Boolean,
      default: false
    },
    adminNotified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for performance and queries
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ payer: 1, createdAt: -1 });
PaymentSchema.index({ recipient: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentMethod: 1 });
PaymentSchema.index({ gatewayTransactionId: 1 });
PaymentSchema.index({ initiatedAt: -1 });

// Virtual for net amount (after fees)
PaymentSchema.virtual('netAmount').get(function() {
  const totalFees = this.fees.processingFee + this.fees.platformFee + this.fees.gatewayFee;
  return this.amount - totalFees - this.totalRefunded;
});

// Method to process refund
PaymentSchema.methods.processRefund = function(refundAmount, reason) {
  const refund = {
    refundId: 'RF_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    amount: refundAmount,
    reason: reason,
    status: 'pending',
    processedAt: new Date()
  };
  
  this.refunds.push(refund);
  
  if (refundAmount === this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
    this.totalRefunded += refundAmount;
  }
  
  return this.save();
};

// Method to mark as completed
PaymentSchema.methods.markCompleted = function(gatewayTransactionId) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayTransactionId) {
    this.gatewayTransactionId = gatewayTransactionId;
  }
  return this.save();
};

// Method to mark as failed
PaymentSchema.methods.markFailed = function(reason, code) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  this.failureCode = code;
  return this.save();
};

// Static method to get payment statistics
PaymentSchema.statics.getStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', PaymentSchema); 