import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBot from '../components/common/ChatBot';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [liveAuctions, setLiveAuctions] = useState(3);
  const [activeCars, setActiveCars] = useState(1247);
  const [onlineUsers, setOnlineUsers] = useState(89);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hero carousel slides
  const heroSlides = [
    {
      title: "Premium JDM Legends",
      subtitle: "Discover Authentic Japanese Performance",
      description: "From Tokyo's underground to your driveway",
      image: "bg-gradient-to-r from-red-600 via-purple-600 to-blue-600",
      cta: "Explore JDM Collection"
    },
    {
      title: "Luxury Meets Innovation",
      subtitle: "Experience Japanese Craftsmanship",
      description: "Lexus, Infiniti, Acura - Refined Excellence",
      image: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
      cta: "Browse Luxury Cars"
    },
    {
      title: "Live Auction Excitement",
      subtitle: "Bid on Rare Japanese Classics",
      description: "Real-time bidding on exclusive vehicles",
      image: "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600",
      cta: "Join Live Auctions"
    }
  ];

  // Japanese car brands with premium models
  const featuredBrands = [
    { name: 'Toyota', models: ['Supra', 'GT86', 'Prius'], count: 342, logo: '🏎️' },
    { name: 'Honda', models: ['NSX', 'Type R', 'S2000'], count: 189, logo: '🚗' },
    { name: 'Nissan', models: ['GT-R', 'Z', '370Z'], count: 156, logo: '⚡' },
    { name: 'Mazda', models: ['RX-7', 'MX-5', 'RX-8'], count: 98, logo: '🌪️' },
    { name: 'Subaru', models: ['WRX', 'STI', 'BRZ'], count: 87, logo: '⭐' },
    { name: 'Mitsubishi', models: ['Evo', 'Eclipse', '3000GT'], count: 64, logo: '💎' }
  ];

  // Real-time stats simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAuctions(prev => prev + Math.floor(Math.random() * 3) - 1);
      setActiveCars(prev => prev + Math.floor(Math.random() * 5) - 2);
      setOnlineUsers(prev => Math.max(50, prev + Math.floor(Math.random() * 10) - 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Hero carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const quickSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedBrand) params.append('brand', selectedBrand);
    params.append('minPrice', priceRange[0]);
    params.append('maxPrice', priceRange[1]);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Advanced Hero Section with Parallax */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            hsl(${mousePosition.x * 3.6}, 70%, 50%) 0%, 
            hsl(${(mousePosition.x + 60) % 360}, 60%, 40%) 100%)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Floating 3D Cards */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl transform-gpu"
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + (i % 2) * 40}%`,
                transform: `translateZ(${mousePosition.x * 0.5}px) rotateY(${mousePosition.x * 0.1}deg) rotateX(${mousePosition.y * 0.1}deg)`,
                animation: `float 6s ease-in-out infinite ${i * 0.5}s`
              }}
            >
              <div className="p-4 text-white/80 text-sm">
                {['🏎️ JDM', '⚡ Fast', '🌟 Premium', '🔥 Rare', '💎 Luxury', '🚀 Sport'][i]}
              </div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <div className="transform transition-all duration-1000 hover:scale-105">
            <h1 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
              {heroSlides[currentSlide].title}
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-blue-100">
              {heroSlides[currentSlide].subtitle}
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-blue-200 max-w-3xl mx-auto leading-relaxed">
              {heroSlides[currentSlide].description}
            </p>
          </div>

          {/* Advanced Search Bar */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cars, models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all"
                />
                <div className="absolute right-3 top-3 text-white/70">🔍</div>
              </div>
              
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all"
              >
                <option value="">All Brands</option>
                {featuredBrands.map(brand => (
                  <option key={brand.name} value={brand.name} className="text-gray-800">
                    {brand.logo} {brand.name}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-blue-500"
                />
                <div className="text-white/90 text-sm mt-1">
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </div>
              </div>

              <button
                onClick={quickSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transform hover:scale-105 transition-all shadow-2xl hover:shadow-blue-500/50"
              >
                🚀 Search Now
              </button>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              to="/cars"
              className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-12 rounded-2xl text-xl transform hover:scale-110 transition-all shadow-2xl hover:shadow-yellow-500/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">🏎️ {heroSlides[currentSlide].cta}</span>
            </Link>
            
            <Link
              to="/auctions"
              className="group border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-12 rounded-2xl text-xl transform hover:scale-110 transition-all backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                🔴 Live Auctions ({liveAuctions})
              </span>
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Real-time Statistics Dashboard */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xl">
                🚗
              </div>
              <div className="text-4xl font-black mb-2 tabular-nums">{activeCars.toLocaleString()}</div>
              <div className="text-blue-300">Active Listings</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xl">
                🔥
              </div>
              <div className="text-4xl font-black mb-2 tabular-nums">{liveAuctions}</div>
              <div className="text-red-300">Live Auctions</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xl">
                👥
              </div>
              <div className="text-4xl font-black mb-2 tabular-nums">{onlineUsers}</div>
              <div className="text-green-300">Online Now</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xl">
                ⭐
              </div>
              <div className="text-4xl font-black mb-2">98.5%</div>
              <div className="text-yellow-300">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Brand Showcase */}
      <section id="brands" data-animate className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Legendary Japanese Brands
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the finest collection of authentic Japanese vehicles from iconic manufacturers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBrands.map((brand, index) => (
              <div
                key={brand.name}
                className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden ${
                  isVisible.brands ? 'animate-fadeInUp' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/cars?brand=${brand.name}`)}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {brand.logo}
                  </div>
                  
                  <h3 className="text-3xl font-black text-gray-900 mb-2">
                    {brand.name}
                  </h3>
                  
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    {brand.count} Cars Available
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {brand.models.map(model => (
                      <div key={model} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">{model}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-center group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                    Explore {brand.name} →
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 rounded-3xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section id="features" data-animate className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Experience the future of car buying with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔮',
                title: 'AI-Powered Matching',
                description: 'Our advanced AI learns your preferences and suggests perfect cars',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '📱',
                title: 'AR Visualization',
                description: 'See how cars look in your driveway with augmented reality',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🔒',
                title: 'Blockchain Security',
                description: 'Secure transactions and verified vehicle history on blockchain',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '⚡',
                title: 'Real-time Bidding',
                description: 'Lightning-fast auction system with live notifications',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '🌍',
                title: 'Global Shipping',
                description: 'Track your car in real-time from Japan to your doorstep',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: '🤖',
                title: 'Virtual Assistant',
                description: '24/7 AI assistant for instant help and recommendations',
                color: 'from-red-500 to-pink-500'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transform hover:-translate-y-4 transition-all duration-500 ${
                  isVisible.features ? 'animate-fadeInUp' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent filter drop-shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-purple-200 leading-relaxed">
                  {feature.description}
                </p>

                <div className={`mt-6 w-full h-1 bg-gradient-to-r ${feature.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action with Floating Elements */}
      <section className="py-20 bg-gradient-to-r from-black via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 border border-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `spin ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-6xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Ready for Your Dream Car?
          </h2>
          
          <p className="text-2xl mb-12 text-gray-300 leading-relaxed">
            Join thousands of satisfied customers who found their perfect Japanese car through our revolutionary platform
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="group bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-black py-6 px-12 rounded-2xl text-xl transform hover:scale-110 transition-all shadow-2xl hover:shadow-yellow-500/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">🚀 Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black py-6 px-12 rounded-2xl text-xl transform hover:scale-110 transition-all shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">🎯 Start Your Journey</span>
                </Link>
                
                <Link
                  to="/login"
                  className="group border-2 border-white text-white hover:bg-white hover:text-black font-black py-6 px-12 rounded-2xl text-xl transform hover:scale-110 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <span className="relative z-10">🔑 Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsChatOpen(true)}
          className="group bg-gradient-to-r from-pink-500 to-violet-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 transition-all animate-bounce"
        >
          <div className="w-8 h-8 text-2xl">💬</div>
          <div className="absolute bottom-16 right-0 bg-black text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
            Need Help?
          </div>
        </button>
      </div>

      {/* ChatBot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home; 