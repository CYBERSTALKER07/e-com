const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const publicDir = path.join(__dirname, 'public');
  
  // Icon sizes needed for iOS PWA
  const iconSizes = [
    { size: 64, name: 'pwa-64x64.png' },
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    { size: 180, name: 'apple-touch-icon-180x180.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 144, name: 'apple-touch-icon-144x144.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 114, name: 'apple-touch-icon-114x114.png' },
    { size: 76, name: 'apple-touch-icon-76x76.png' },
    { size: 72, name: 'apple-touch-icon-72x72.png' },
    { size: 60, name: 'apple-touch-icon-60x60.png' },
    { size: 57, name: 'apple-touch-icon-57x57.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' }
  ];

  // Convert SVG to PNG for different sizes
  for (const icon of iconSizes) {
    try {
      const svgPath = path.join(publicDir, 'pwa-512x512.svg');
      const pngPath = path.join(publicDir, icon.name);
      
      await sharp(svgPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(pngPath);
        
      console.log(`✓ Created ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to create ${icon.name}:`, error.message);
    }
  }

  // Create favicon.ico from 32x32 PNG
  try {
    const favicon32Path = path.join(publicDir, 'favicon-32x32.png');
    const faviconPath = path.join(publicDir, 'favicon.ico');
    
    if (fs.existsSync(favicon32Path)) {
      fs.copyFileSync(favicon32Path, faviconPath);
      console.log('✓ Created favicon.ico');
    }
  } catch (error) {
    console.error('✗ Failed to create favicon.ico:', error.message);
  }

  console.log('\n🎉 PWA icons generation complete!');
}

convertSvgToPng().catch(console.error);