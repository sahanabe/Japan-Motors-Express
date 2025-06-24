const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Car = require('../models/Car');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10 // Maintain up to 10 socket connections
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Initialize database indexes and collections
    await initializeDatabase();
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    console.log('Initializing database indexes...');

    // Create text indexes for search functionality
    await Car.collection.createIndex({
      make: 'text',
      model: 'text',
      title: 'text',
      description: 'text'
    }, { name: 'car_search_index' });

    // Additional performance indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isVerified: 1 });
    
    await Car.collection.createIndex({ seller: 1, status: 1 });
    await Car.collection.createIndex({ listingType: 1 });
    await Car.collection.createIndex({ price: 1 });
    await Car.collection.createIndex({ createdAt: -1 });
    await Car.collection.createIndex({ 'location.city': 1, 'location.prefecture': 1 });
    
    await Auction.collection.createIndex({ seller: 1, status: 1 });
    await Auction.collection.createIndex({ endDate: 1 });
    await Auction.collection.createIndex({ currentPrice: 1 });
    await Auction.collection.createIndex({ featured: 1 });
    
    await Bid.collection.createIndex({ auction: 1, amount: -1 });
    await Bid.collection.createIndex({ bidder: 1, placedAt: -1 });
    
    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    await Order.collection.createIndex({ buyer: 1, createdAt: -1 });
    await Order.collection.createIndex({ seller: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1 });
    
    await Payment.collection.createIndex({ transactionId: 1 }, { unique: true });
    await Payment.collection.createIndex({ order: 1 });
    await Payment.collection.createIndex({ payer: 1, createdAt: -1 });
    await Payment.collection.createIndex({ status: 1 });

    console.log('Database indexes created successfully');
    
    // Log collection stats
    await logCollectionStats();
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const logCollectionStats = async () => {
  try {
    const collections = ['users', 'cars', 'auctions', 'bids', 'orders', 'payments'];
    
    console.log('\n=== Database Collection Stats ===');
    for (const collection of collections) {
      try {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        console.log(`${collection}: ${count} documents`);
      } catch (error) {
        console.log(`${collection}: 0 documents (collection not yet created)`);
      }
    }
    console.log('=====================================\n');
  } catch (error) {
    console.error('Error logging collection stats:', error);
  }
};

// Seed initial data for development
const seedDatabase = async () => {
  try {
    console.log('Checking for initial data...');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@japancarexpress.com',
        password: 'admin123456', // Will be hashed by the pre-save middleware
        role: 'admin',
        isVerified: true,
        emailVerified: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }
    
    // Check if any sample data exists
    const carCount = await Car.countDocuments();
    
    if (carCount === 0) {
      console.log('Creating sample car listings...');
      
      // Create a sample seller
      const seller = new User({
        name: 'Tokyo Motors',
        email: 'seller@tokyomotors.jp',
        password: 'seller123456',
        role: 'seller',
        businessName: 'Tokyo Motors Co. Ltd.',
        isVerified: true,
        emailVerified: true,
        address: {
          city: 'Tokyo',
          state: 'Tokyo',
          country: 'Japan'
        }
      });
      
      await seller.save();
      
      // Create sample cars
      const sampleCars = [
        {
          seller: seller._id,
          title: '2019 Toyota Prius Hybrid - Excellent Condition',
          description: 'Well-maintained Toyota Prius with low mileage. Perfect for eco-conscious buyers.',
          make: 'Toyota',
          model: 'Prius',
          year: 2019,
          mileage: 25000,
          bodyType: 'Hatchback',
          fuelType: 'Hybrid',
          transmission: 'CVT',
          engine: { displacement: 1.8, cylinders: 4, power: 121 },
          condition: 'Excellent',
          price: 18500,
          currency: 'USD',
          location: { city: 'Tokyo', prefecture: 'Tokyo', country: 'Japan' },
          listingType: 'direct_sale',
          images: [{ url: 'https://via.placeholder.com/800x600?text=Toyota+Prius' }],
          features: ['Navigation System', 'Backup Camera', 'Bluetooth', 'Air Conditioning'],
          exportReady: true
        },
        {
          seller: seller._id,
          title: '2020 Honda Civic Type R - Track Ready',
          description: 'High-performance Honda Civic Type R in pristine condition. Ready for export.',
          make: 'Honda',
          model: 'Civic Type R',
          year: 2020,
          mileage: 15000,
          bodyType: 'Hatchback',
          fuelType: 'Gasoline',
          transmission: 'Manual',
          engine: { displacement: 2.0, cylinders: 4, power: 306 },
          condition: 'Excellent',
          price: 35000,
          currency: 'USD',
          location: { city: 'Osaka', prefecture: 'Osaka', country: 'Japan' },
          listingType: 'auction',
          images: [{ url: 'https://via.placeholder.com/800x600?text=Honda+Civic+Type+R' }],
          features: ['Turbo Engine', 'Sport Suspension', 'Brembo Brakes', 'Racing Seats'],
          exportReady: true
        }
      ];
      
      await Car.insertMany(sampleCars);
      console.log('Sample car listings created');
    }
    
    console.log('Database seeding completed');
    
  } catch (error) {
    console.error('Database seeding error:', error);
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
  connectDB,
  initializeDatabase,
  seedDatabase,
  testConnection,
  logCollectionStats
}; 