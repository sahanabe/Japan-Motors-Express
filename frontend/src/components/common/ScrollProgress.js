import React, { useState, useEffect } from 'react';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/20 backdrop-blur-sm z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out shadow-lg"
          style={{ width: `${scrollProgress}%` }}
        >
          <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1.5 animate-pulse" />
        </div>
      </div>

      {/* Scroll to Top Button */}
      <div className={`fixed bottom-32 right-8 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}>
        <button
          onClick={scrollToTop}
          className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transform hover:scale-110 transition-all duration-300 relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative z-10 flex items-center justify-center w-6 h-6">
            <svg 
              className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          
          {/* Progress Ring */}
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
                strokeDasharray={`${scrollProgress * 1.005}, 100.5`}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>
          </div>
        </button>
        
        {/* Progress Text */}
        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          {Math.round(scrollProgress)}%
        </div>
      </div>

      {/* Reading Progress Indicator */}
      <div className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-black/10 backdrop-blur-sm rounded-full p-2">
          <div className="relative w-2 h-32">
            <div className="absolute inset-0 bg-gray-300/50 rounded-full" />
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-200"
              style={{ height: `${scrollProgress}%` }}
            />
            <div 
              className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1 -translate-y-1/2 border-2 border-blue-500 transition-all duration-200"
              style={{ top: `${100 - scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrollProgress; 