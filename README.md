# Japan Car Express 🚗

A comprehensive car selling platform connecting Japanese car dealers with global buyers through direct sales and real-time auctions.

## Features

### 🚀 Core Features
- **Direct Car Sales**: Browse and purchase cars directly from verified Japanese dealers
- **Real-time Auctions**: Participate in live car auctions with real-time bidding
- **Multi-role System**: Support for buyers, sellers, and administrators
- **Advanced Search & Filters**: Find cars by make, model, year, price, and location
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Real-time Notifications**: Socket.IO powered real-time updates for auctions and bids

### 🔧 Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Communication**: Socket.IO for live auction updates
- **Image Management**: Cloudinary integration for car image uploads
- **Search Optimization**: Text search with MongoDB indexes
- **API Documentation**: RESTful API with comprehensive endpoints
- **Security**: Rate limiting, helmet.js, and input validation

### 👥 User Roles

#### Buyers
- Browse car listings and auctions
- Place bids on auctions
- Save favorite cars
- View bidding history
- Contact sellers directly

#### Sellers
- List cars for direct sale or auction
- Manage listings and auctions
- View sales analytics
- Respond to buyer inquiries
- Track auction performance

#### Administrators
- Manage users and verify sellers
- Moderate listings and auctions
- View platform analytics
- Handle disputes and support

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - Image management
- **Nodemailer** - Email services

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **React Query** - Data fetching and caching
- **Socket.IO Client** - Real-time updates
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/japan-car-express.git
   cd japan-car-express
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend Environment** (`backend/config.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/japan-car-express
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend Environment** (`frontend/.env`):
   ```env
   REACT_APP_SERVER_URL=http://localhost:5000
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. **Database Setup**
   - Make sure MongoDB is running locally or update the connection string to your cloud database
   - The application will automatically create necessary collections and indexes

5. **Start the Development Servers**
   
   **Option 1: Start both servers simultaneously (from root directory)**
   ```bash
   npm run dev
   ```

   **Option 2: Start servers separately**
   
   Backend (from root directory):
   ```bash
   npm run server
   ```
   
   Frontend (from root directory):
   ```bash
   npm run client
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
```
POST /api/auth/register          # Register user
POST /api/auth/login             # Login user
GET  /api/auth/user              # Get current user
POST /api/auth/forgot-password   # Password reset request
POST /api/auth/reset-password    # Reset password
```

### Cars
```
GET    /api/cars                 # Get all cars (with filters)
GET    /api/cars/:id             # Get single car
POST   /api/cars                 # Create car listing (Seller)
PUT    /api/cars/:id             # Update car listing (Owner/Admin)
DELETE /api/cars/:id             # Delete car listing (Owner/Admin)
POST   /api/cars/:id/favorite    # Add/remove from favorites
```

### Auctions
```
GET    /api/auctions             # Get all auctions
GET    /api/auctions/:id         # Get single auction
POST   /api/auctions             # Create auction (Seller)
POST   /api/auctions/:id/watch   # Add/remove from watchlist
PUT    /api/auctions/:id         # Update auction (Owner/Admin)
POST   /api/auctions/:id/register # Register for auction
```

### Bidding
```
POST   /api/bids                 # Place a bid
GET    /api/bids/auction/:id     # Get auction bids
GET    /api/bids/my-bids         # Get user's bids
GET    /api/bids/highest/:id     # Get highest bid for auction
```

### Users
```
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update profile
POST   /api/users/change-password # Change password
GET    /api/users/:id            # Get public user profile
GET    /api/users               # Get all users (Admin)
```

## Socket.IO Events

### Client → Server
```javascript
'joinAuction'    // Join auction room
'leaveAuction'   // Leave auction room
'newBid'         // Place new bid
```

### Server → Client
```javascript
'bidUpdate'      // New bid placed
'auctionEnded'   // Auction ended
'auctionStarted' // Auction started
'outbid'         // User was outbid
'auctionReminder' // Auction ending soon
```

## Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Enable automatic deploys

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder to your hosting service
3. Set environment variables on the hosting platform

### Database
- Use MongoDB Atlas for production database
- Update the `MONGODB_URI` in your environment variables

## Project Structure

```
japan-car-express/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config.env       # Environment variables
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context providers
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   ├── public/          # Public assets
│   └── tailwind.config.js
├── package.json         # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@japancarexpress.com or create an issue in the repository.

## Acknowledgments

- Japanese automotive industry for inspiration
- React and Node.js communities for excellent documentation
- Tailwind CSS for the amazing utility-first framework
- Socket.IO for real-time communication capabilities 