import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [auctionUpdates, setAuctionUpdates] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        query: {
          userId: user.id,
        },
      });

      setSocket(newSocket);

      // Listen for connection
      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      // Listen for auction bid updates
      newSocket.on('bidUpdate', (data) => {
        setAuctionUpdates(prev => ({
          ...prev,
          [data.auctionId]: data
        }));
        
        // Show toast notification for new bids
        if (data.bidder !== user.id) {
          toast.success(
            `New bid: $${data.amount.toLocaleString()}`,
            {
              icon: '🔨',
              duration: 3000,
            }
          );
        }
      });

      // Listen for auction end
      newSocket.on('auctionEnded', (data) => {
        toast.success(
          `Auction ended! Final price: $${data.finalPrice?.toLocaleString()}`,
          {
            icon: '🏁',
            duration: 5000,
          }
        );
        
        setAuctionUpdates(prev => ({
          ...prev,
          [data.auctionId]: { ...data, ended: true }
        }));
      });

      // Listen for auction start notifications
      newSocket.on('auctionStarted', (data) => {
        toast.success(
          `Auction started: ${data.title}`,
          {
            icon: '🚗',
            duration: 4000,
          }
        );
      });

      // Listen for outbid notifications
      newSocket.on('outbid', (data) => {
        toast.error(
          `You've been outbid on "${data.carTitle}"`,
          {
            icon: '⚠️',
            duration: 5000,
          }
        );
      });

      // Listen for auction reminders
      newSocket.on('auctionReminder', (data) => {
        toast(
          `Auction ending soon: ${data.title} (${data.timeLeft})`,
          {
            icon: '⏰',
            duration: 6000,
          }
        );
      });

      // Handle connection errors
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Some real-time features may not work.');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Join auction room
  const joinAuction = (auctionId) => {
    if (socket) {
      socket.emit('joinAuction', auctionId);
    }
  };

  // Leave auction room
  const leaveAuction = (auctionId) => {
    if (socket) {
      socket.emit('leaveAuction', auctionId);
    }
  };

  // Send new bid
  const sendBid = (bidData) => {
    if (socket) {
      socket.emit('newBid', bidData);
    }
  };

  // Send auction end notification
  const endAuction = (auctionData) => {
    if (socket) {
      socket.emit('auctionEnded', auctionData);
    }
  };

  // Get auction updates for specific auction
  const getAuctionUpdate = (auctionId) => {
    return auctionUpdates[auctionId] || null;
  };

  // Clear auction updates
  const clearAuctionUpdate = (auctionId) => {
    setAuctionUpdates(prev => {
      const newUpdates = { ...prev };
      delete newUpdates[auctionId];
      return newUpdates;
    });
  };

  const value = {
    socket,
    onlineUsers,
    auctionUpdates,
    joinAuction,
    leaveAuction,
    sendBid,
    endAuction,
    getAuctionUpdate,
    clearAuctionUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 