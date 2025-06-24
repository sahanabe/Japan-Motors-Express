const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config({ path: './config.env' });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB using our database config
const { connectDB, testConnection, seedDatabase } = require('./config/database');

// Initialize database connection
connectDB().then(async () => {
  // Test the connection
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Database connection established successfully');
    
    // Seed initial data in development
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
  }
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Socket.IO for real-time auction bidding
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  // Handle new bid
  socket.on('newBid', (data) => {
    io.to(`auction_${data.auctionId}`).emit('bidUpdate', data);
  });

  // Handle auction end
  socket.on('auctionEnded', (data) => {
    io.to(`auction_${data.auctionId}`).emit('auctionEnded', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 