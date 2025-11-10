#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const svgTemplate = `<svg width="SIZE" height="SIZE" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#3b82f6"/>
  <path d="M96 48C69.5 48 48 69.5 48 96C48 122.5 69.5 144 96 144C122.5 144 144 122.5 144 96C144 69.5 122.5 48 96 48ZM96 132C76.1 132 60 115.9 60 96C60 76.1 76.1 60 96 60C115.9 60 132 76.1 132 96C132 115.9 115.9 132 96 132Z" fill="white"/>
  <path d="M96 72C84.9 72 76 80.9 76 92C76 103.1 84.9 112 96 112C107.1 112 116 103.1 116 92C116 80.9 107.1 72 96 72ZM96 100C91.6 100 88 96.4 88 92C88 87.6 91.6 84 96 84C100.4 84 104 87.6 104 92C104 96.4 100.4 100 96 100Z" fill="white"/>
  <circle cx="96" cy="96" r="8" fill="white"/>
</svg>`;

// Create different sized icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svg = svgTemplate.replace(/SIZE/g, size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`Created ${filename}`);
});

// Create badge icon
const badgeSvg = `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="72" height="72" rx="16" fill="#3b82f6"/>
  <circle cx="36" cy="36" r="20" fill="white"/>
  <circle cx="36" cy="36" r="8" fill="#3b82f6"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSvg);
console.log('Created badge-72x72.svg');

// Create action icons
const actions = [
  { name: 'study-icon', color: '#10b981' },
  { name: 'exam-icon', color: '#f59e0b' },
  { name: 'analytics-icon', color: '#8b5cf6' },
  { name: 'explore-icon', color: '#3b82f6' },
  { name: 'close-icon', color: '#ef4444' }
];

actions.forEach(action => {
  const actionSvg = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" rx="20" fill="${action.color}"/>
    <circle cx="48" cy="48" r="24" fill="white"/>
    <circle cx="48" cy="48" r="12" fill="${action.color}"/>
  </svg>`;
  
  const filename = `${action.name}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, actionSvg);
  console.log(`Created ${filename}`);
});

console.log('All icons generated successfully!');