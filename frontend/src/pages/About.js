import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Japan Car Express</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting global car enthusiasts with Japan's finest automotive heritage since 2020.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Japan Car Express was founded with a simple mission: to make the world's most reliable and innovative cars accessible to everyone, everywhere. Born from our passion for Japanese automotive excellence, we bridge the gap between Japan's exceptional car culture and international buyers.
              </p>
              <p className="text-gray-600 mb-4">
                Our founders, having lived in Japan for over a decade, witnessed firsthand the meticulous care Japanese owners put into their vehicles and the incredible engineering that goes into every car. We wanted to share this automotive excellence with the world.
              </p>
              <p className="text-gray-600">
                Today, we're proud to be one of the most trusted platforms for Japanese car exports, having successfully delivered over 5,000 vehicles to customers in more than 50 countries.
              </p>
            </div>
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Company Story Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Passion</h3>
              <p className="text-gray-600">
                We're genuine car enthusiasts who understand the emotional connection between people and their vehicles.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-gray-600">
                Transparency and honesty in every transaction. We provide detailed inspections and honest assessments.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We maintain the highest standards in vehicle selection, customer service, and delivery experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Dedicated professionals with deep expertise in Japanese automotive culture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500">Photo</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Hiroshi Tanaka</h3>
              <p className="text-primary-600 mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                20+ years in Japanese automotive industry. Former Toyota engineer with deep knowledge of Japanese car culture.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500">Photo</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Sarah Johnson</h3>
              <p className="text-primary-600 mb-2">Head of Global Operations</p>
              <p className="text-gray-600 text-sm">
                International logistics expert specializing in automotive shipping and customs procedures worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500">Photo</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Kenji Yamamoto</h3>
              <p className="text-primary-600 mb-2">Chief Inspector</p>
              <p className="text-gray-600 text-sm">
                Certified automotive technician with expertise in Japanese vehicle inspection and quality assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-primary-100 max-w-4xl mx-auto">
            To democratize access to Japan's exceptional automotive heritage by providing a transparent, 
            secure, and reliable platform that connects global buyers with the finest Japanese vehicles, 
            while maintaining the highest standards of quality and customer service.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About; 