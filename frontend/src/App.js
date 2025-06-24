import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner, { PageLoader } from './components/common/LoadingSpinner';
import NotificationSystem, { LiveStatsWidget } from './components/common/NotificationSystem';
import ScrollProgress from './components/common/ScrollProgress';

// Public Pages
import Home from './pages/Home';
import CarListings from './pages/CarListings';
import CarDetail from './pages/CarDetail';
import AuctionListings from './pages/AuctionListings';
import AuctionDetail from './pages/AuctionDetail';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import MyListings from './pages/dashboard/MyListings';
import MyBids from './pages/dashboard/MyBids';
import Favorites from './pages/dashboard/Favorites';
import AddCar from './pages/dashboard/AddCar';
import EditCar from './pages/dashboard/EditCar';
import CreateAuction from './pages/dashboard/CreateAuction';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageListings from './pages/seller/ManageListings';
import ManageAuctions from './pages/seller/ManageAuctions';
import SellerAnalytics from './pages/seller/SellerAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCars from './pages/admin/ManageCars';
import AdminAuctions from './pages/admin/AdminAuctions';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader message="Loading Japan Car Express..." />;
  }

  return (
    <div className="App min-h-screen bg-secondary-50">
      <Navbar />
      
      {/* Advanced Features */}
      <NotificationSystem />
      <LiveStatsWidget />
      <ScrollProgress />
      
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarListings />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/auctions" element={<AuctionListings />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes - All authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bids"
            element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/add-car"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <AddCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/edit-car/:id"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <EditCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/listings"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <ManageListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/auctions"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <ManageAuctions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/create-auction"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <CreateAuction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cars"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/auctions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuctions />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 