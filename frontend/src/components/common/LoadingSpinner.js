import React from 'react';

const LoadingSpinner = ({ size = 'md', variant = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variants = {
    default: (
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    ),
    dots: (
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    ),
    pulse: (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse`} />
    ),
    wave: (
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 bg-blue-600 rounded-full animate-pulse"
            style={{ 
              height: `${16 + Math.sin(i) * 8}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    ),
    car: (
      <div className="relative">
        <div className="text-4xl animate-bounce">🏎️</div>
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" />
      </div>
    ),
    premium: (
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-spin" />
          <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
            <div className="text-2xl">⚡</div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {variants[variant]}
      {text && (
        <div className="text-gray-600 font-medium animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
};

// Page Loader with advanced animations
export const PageLoader = ({ message = "Loading your perfect car..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
    <div className="text-center text-white">
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
            <div className="text-4xl animate-bounce">🏎️</div>
          </div>
        </div>
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-ping"
            style={{
              left: `${20 + i * 10}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
      
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
        {message}
      </h2>
      
      <div className="flex justify-center space-x-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      
      <div className="text-blue-200 text-lg">
        Preparing something amazing...
      </div>
    </div>
  </div>
);

// Inline Loader for content sections
export const InlineLoader = ({ size = 'md', message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <LoadingSpinner size={size} variant="car" />
      <div className="mt-4 text-gray-600 font-medium">
        {message}
      </div>
    </div>
  </div>
);

// Button Loader for form submissions
export const ButtonLoader = () => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    <span>Processing...</span>
  </div>
);

// Search Loader with car animation
export const SearchLoader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="text-6xl animate-bounce">🔍</div>
        <div className="absolute -top-2 -right-2 text-3xl animate-pulse">🏎️</div>
      </div>
      <div className="text-xl font-semibold text-gray-700 mb-2">
        Searching for your dream car...
      </div>
      <div className="flex justify-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-8 bg-blue-600 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Live Auction Loader
export const AuctionLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="relative mb-4">
        <div className="text-5xl animate-pulse">🔴</div>
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
      </div>
      <div className="text-lg font-bold text-red-600 mb-2">
        LIVE AUCTION
      </div>
      <div className="text-gray-600">
        Connecting to auction room...
      </div>
    </div>
  </div>
);

export default LoadingSpinner; 