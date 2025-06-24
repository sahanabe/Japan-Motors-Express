const path = require('path');
const fs = require('fs');

// Deployment script for Japan Car Express
console.log('🚀 Starting deployment process...');

// Check if build folder exists
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  console.log('✅ Build folder found');
  
  // Check for CSS files
  const cssPath = path.join(buildPath, 'static', 'css');
  if (fs.existsSync(cssPath)) {
    const cssFiles = fs.readdirSync(cssPath);
    console.log('✅ CSS files found:', cssFiles);
  } else {
    console.log('❌ CSS folder not found');
  }
  
  // Check for JS files
  const jsPath = path.join(buildPath, 'static', 'js');
  if (fs.existsSync(jsPath)) {
    const jsFiles = fs.readdirSync(jsPath);
    console.log('✅ JS files found:', jsFiles);
  } else {
    console.log('❌ JS folder not found');
  }
  
  console.log('🎉 Deployment ready! You can deploy the frontend/build folder to any static hosting service.');
  console.log('📁 Deploy the contents of: ' + buildPath);
  
} else {
  console.log('❌ Build folder not found. Run "npm run build" in the frontend directory first.');
}

// Instructions for different hosting platforms
console.log('\n📋 Deployment Instructions:');
console.log('─────────────────────────────');
console.log('🌐 Netlify: Drag and drop the frontend/build folder to netlify.com/drop');
console.log('🚀 Vercel: Run "npx vercel" in the frontend directory');
console.log('📦 GitHub Pages: Push build folder and configure GitHub Pages');
console.log('☁️  AWS S3: Upload build folder contents to S3 bucket');
console.log('🔥 Firebase: Run "firebase deploy" after configuring firebase.json'); 