const express = require('express');
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all cars with filters and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      make,
      model,
      year,
      minPrice,
      maxPrice,
      bodyType,
      fuelType,
      transmission,
      condition,
      location,
      listingType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = year;
    if (bodyType) filter.bodyType = bodyType;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (condition) filter.condition = condition;
    if (listingType) filter.listingType = listingType;
    if (location) filter['location.city'] = new RegExp(location, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'seller', select: 'name businessName isVerified' },
        { path: 'auction', select: 'endDate currentPrice status' }
      ]
    };

    const cars = await Car.paginate(filter, options);

    res.json({
      cars: cars.docs,
      totalPages: cars.totalPages,
      currentPage: cars.page,
      totalCars: cars.totalDocs,
      hasNextPage: cars.hasNextPage,
      hasPrevPage: cars.hasPrevPage
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('seller', 'name businessName isVerified avatar phone email')
      .populate('auction', 'endDate currentPrice status totalBids highestBidder');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Increment view count
    car.views += 1;
    await car.save();

    res.json(car);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/cars
// @desc    Create new car listing
// @access  Private (Seller only)
router.post('/', [
  protect,
  authorize('seller', 'admin'),
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('make', 'Make is required').not().isEmpty(),
    body('model', 'Model is required').not().isEmpty(),
    body('year', 'Year is required').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('mileage', 'Mileage is required').isInt({ min: 0 }),
    body('price', 'Price is required').isFloat({ min: 0 }),
    body('bodyType', 'Body type is required').not().isEmpty(),
    body('fuelType', 'Fuel type is required').not().isEmpty(),
    body('transmission', 'Transmission is required').not().isEmpty(),
    body('condition', 'Condition is required').not().isEmpty(),
    body('listingType', 'Listing type is required').isIn(['direct_sale', 'auction'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const carData = {
      ...req.body,
      seller: req.user.id,
      publishedAt: new Date()
    };

    // Set expiration date (90 days from now)
    carData.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const car = new Car(carData);
    await car.save();

    await car.populate('seller', 'name businessName isVerified');

    res.status(201).json(car);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/cars/:id
// @desc    Update car listing
// @access  Private (Owner or Admin)
router.put('/:id', [protect], async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user owns the car or is admin
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow updates if car is sold
    if (car.status === 'sold') {
      return res.status(400).json({ message: 'Cannot update sold car' });
    }

    car = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('seller', 'name businessName isVerified');

    res.json(car);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete car listing
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user owns the car or is admin
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ message: 'Car listing removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/cars/:id/favorite
// @desc    Add/remove car from favorites
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const userId = req.user.id;
    const favoriteIndex = car.favorites.indexOf(userId);

    if (favoriteIndex > -1) {
      // Remove from favorites
      car.favorites.splice(favoriteIndex, 1);
      await car.save();
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // Add to favorites
      car.favorites.push(userId);
      await car.save();
      res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cars/seller/:sellerId
// @desc    Get cars by seller
// @access  Public
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const cars = await Car.find({ 
      seller: req.params.sellerId,
      status: 'active'
    })
      .populate('seller', 'name businessName isVerified')
      .populate('auction', 'endDate currentPrice status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Car.countDocuments({ 
      seller: req.params.sellerId,
      status: 'active'
    });

    res.json({
      cars,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/cars/my-listings
// @desc    Get current user's car listings
// @access  Private (Seller)
router.get('/my/listings', [protect, authorize('seller', 'admin')], async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const filter = { seller: req.user.id };
    if (status) filter.status = status;

    const cars = await Car.find(filter)
      .populate('auction', 'endDate currentPrice status totalBids')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Car.countDocuments(filter);

    res.json({
      cars,
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