const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CarSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Basic Information
  title: {
    type: String,
    required: [true, 'Please provide a car title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description can not be more than 2000 characters']
  },
  
  // Car Details
  make: {
    type: String,
    required: [true, 'Please provide car make'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide manufacturing year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  mileage: {
    type: Number,
    required: [true, 'Please provide mileage'],
    min: [0, 'Mileage cannot be negative']
  },
  bodyType: {
    type: String,
    required: true,
    enum: ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Convertible', 'Wagon', 'Truck', 'Van', 'Minivan', 'Sports Car']
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'LPG', 'CNG']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  engine: {
    displacement: {
      type: Number,
      required: true
    },
    cylinders: Number,
    power: Number, // HP
    torque: Number
  },
  drivetrain: {
    type: String,
    enum: ['FWD', 'RWD', 'AWD', '4WD']
  },
  
  // Japan Specific
  grade: String, // Japanese car grade (e.g., X, G, Z)
  chassisNumber: String,
  auctionSheet: String, // URL to auction sheet
  
  // Condition
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
  },
  accidentHistory: {
    type: Boolean,
    default: false
  },
  modifications: [{
    type: String
  }],
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'JPY', 'EUR', 'GBP']
  },
  priceNegotiable: {
    type: Boolean,
    default: true
  },
  
  // Location
  location: {
    city: {
      type: String,
      required: true
    },
    prefecture: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Japan'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    caption: String
  }],
  videos: [{
    url: String,
    publicId: String,
    caption: String
  }],
  
  // Features
  features: [{
    type: String
  }],
  
  // Export Information
  exportReady: {
    type: Boolean,
    default: true
  },
  exportDocuments: {
    deRegistration: Boolean,
    exportCertificate: Boolean,
    radiationCertificate: Boolean
  },
  
  // Listing Status
  status: {
    type: String,
    enum: ['active', 'sold', 'reserved', 'draft', 'expired'],
    default: 'active'
  },
  listingType: {
    type: String,
    enum: ['direct_sale', 'auction'],
    required: true
  },
  
  // Auction specific (if listingType is auction)
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  
  // Views and favorites
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Timestamps
  publishedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Index for search optimization
CarSchema.index({
  make: 'text',
  model: 'text',
  title: 'text',
  description: 'text'
});

CarSchema.index({ price: 1 });
CarSchema.index({ year: 1 });
CarSchema.index({ mileage: 1 });
CarSchema.index({ 'location.city': 1 });
CarSchema.index({ status: 1 });

// Add pagination plugin
CarSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Car', CarSchema); 