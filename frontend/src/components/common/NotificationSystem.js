import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulate real-time notifications
  useEffect(() => {
    const notificationTypes = [
      {
        type: 'auction',
        title: 'New Live Auction',
        message: '1994 Toyota Supra RZ just started bidding!',
        icon: '🔴',
        color: 'from-red-500 to-pink-500'
      },
      {
        type: 'bid',
        title: 'Outbid Alert',
        message: 'Someone outbid you on the Nissan GT-R',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        type: 'new-car',
        title: 'New Car Added',
        message: 'Honda NSX Type R just listed for $89,000',
        icon: '🚗',
        color: 'from-blue-500 to-purple-500'
      },
      {
        type: 'price-drop',
        title: 'Price Drop Alert',
        message: 'Mazda RX-7 price dropped by $5,000!',
        icon: '📉',
        color: 'from-green-500 to-emerald-500'
      },
      {
        type: 'ending-soon',
        title: 'Auction Ending Soon',
        message: 'Subaru WRX STI auction ends in 5 minutes',
        icon: '⏰',
        color: 'from-purple-500 to-indigo-500'
      }
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 5 seconds
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const notification = {
          id: Date.now(),
          ...randomNotification,
          timestamp: new Date()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 8000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`transform transition-all duration-500 ease-out ${
            index === 0 ? 'animate-slideInRight' : ''
          }`}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className={`bg-gradient-to-r ${notification.color} p-1 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
            <div className="bg-white rounded-xl p-4 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent transform rotate-45" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {notification.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">
                  {notification.message}
                </p>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    className={`bg-gradient-to-r ${notification.color} text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    onClick={() => removeNotification(notification.id)}
                  >
                    View
                  </button>
                  <button 
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => removeNotification(notification.id)}
                  >
                    Dismiss
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${notification.color} animate-shrink`}
                    style={{ animationDuration: '8s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Global Notification Controls */}
      {notifications.length > 1 && (
        <div className="mt-4">
          <button
            onClick={() => setNotifications([])}
            className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300 w-full shadow-2xl"
          >
            Clear All ({notifications.length})
          </button>
        </div>
      )}
      
      {/* Custom CSS */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-shrink {
          animation: shrink linear forwards;
        }
      `}</style>
    </div>,
    document.body
  );
};

// Floating Live Stats Widget
export const LiveStatsWidget = () => {
  const [stats, setStats] = useState({
    activeUsers: 127,
    liveBids: 8,
    newListings: 23
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: Math.max(50, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
        liveBids: Math.max(0, prev.liveBids + Math.floor(Math.random() * 3) - 1),
        newListings: Math.max(0, prev.newListings + Math.floor(Math.random() * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-white/10">
        <div className="text-xs font-bold text-blue-400 mb-2 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
          LIVE STATS
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">👥 Online</span>
            <span className="font-bold text-green-400 tabular-nums">{stats.activeUsers}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">🔥 Live Bids</span>
            <span className="font-bold text-red-400 tabular-nums">{stats.liveBids}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">🆕 New Today</span>
            <span className="font-bold text-blue-400 tabular-nums">{stats.newListings}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement/Badge Popup
export const AchievementPopup = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-1 rounded-3xl max-w-md mx-4 animate-scaleIn">
        <div className="bg-white rounded-2xl p-8 text-center relative overflow-hidden">
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Achievement Unlocked!
            </h2>
            <h3 className="text-xl font-bold text-yellow-600 mb-3">
              {achievement.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {achievement.description}
            </p>
            
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NotificationSystem; 