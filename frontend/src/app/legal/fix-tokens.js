const fs = require('fs');
const glob = require('glob');
const path = require('path');

const mapTokens = (content) => {
  return content
    // Backgrounds
    .replace(/bg-soil-50/g, 'bg-background')
    .replace(/bg-soil-100/g, 'bg-surface-container-low')
    .replace(/bg-soil-200/g, 'bg-surface-container')
    .replace(/bg-white/g, 'bg-surface-container-lowest')
    
    // Emerald backgrounds
    .replace(/bg-emerald-50\b|bg-emerald-100/g, 'bg-primary-container')
    .replace(/bg-emerald-500\b|bg-emerald-600\b|bg-emerald-700/g, 'bg-primary')
    
    // Emerald text
    .replace(/text-emerald-600\b|text-emerald-700\b|text-emerald-800/g, 'text-primary')
    .replace(/text-emerald-50\b/g, 'text-on-primary')
    
    // Soil text
    .replace(/text-soil-300\b|text-soil-400\b|text-soil-500\b|text-soil-600/g, 'text-on-surface-variant')
    .replace(/text-soil-700\b|text-soil-800\b|text-soil-900/g, 'text-on-surface')
    
    // Borders
    .replace(/border-soil-200\b|border-soil-300\b|border-emerald-200\b|border-emerald-100\b/g, 'border-outline-variant')
    .replace(/border-emerald-600/g, 'border-primary')
    .replace(/hover:border-emerald-300\b/g, 'hover:border-primary')
    .replace(/hover:border-soil-300\b/g, 'hover:border-outline-variant')
    
    // Rings
    .replace(/ring-emerald-500\b|ring-emerald-600/g, 'ring-primary')
    .replace(/ring-emerald-50\b/g, 'ring-primary-container')
    .replace(/ring-emerald-600\/20/g, 'ring-primary/20')
    .replace(/ring-emerald-600\/25/g, 'ring-primary/25')
    .replace(/ring-emerald-500\/20/g, 'ring-primary/20')
    .replace(/ring-amber-200\/60/g, 'ring-warning/60')
    
    // Typography
    .replace(/font-display text-2xl font-semibold/g, 'text-headline-md')
    .replace(/font-display text-2xl/g, 'text-headline-md')
    .replace(/font-display/g, 'font-bold')
    
    // Shadows
    .replace(/shadow-emerald-600\/25\b/g, 'shadow-lg shadow-primary/25')
    .replace(/shadow-emerald-600\/20\b/g, 'shadow-lg shadow-primary/20')

    // White text when inside primary
    .replace(/text-white/g, 'text-on-primary')
    
    // Amber colors maps
    .replace(/bg-amber-100\b/g, 'bg-warning-container')
    
    // Common hover states
    .replace(/hover:bg-emerald-700/g, 'hover:bg-primary/90')
    .replace(/hover:text-soil-800/g, 'hover:text-on-surface')
    .replace(/hover:bg-soil-50/g, 'hover:bg-surface-container-low')
    
    // Fix any duplicates or double replacements
    .replace(/text-headline-md font-semibold/g, 'text-headline-md')
    .replace(/text-on-primary-container container/g, 'text-primary') // just in case
};

// Target all legacy pages using these classes
const files = [
  'register/page.tsx', 
  'verify-email/page.tsx', 
  'reset-password/page.tsx', 
  'onboarding/page.tsx', 
  'payment/success/page.tsx', 
  'payment/failed/page.tsx', 
  'payment/pending/page.tsx', 
  'support/page.tsx',
  'states/page.tsx',
  'states/empty/page.tsx',
  'states/no-results/page.tsx',
  'states/loading/page.tsx',
  'states/error/page.tsx',
  'states/success/page.tsx',
  'states/session-expired/page.tsx',
  'forbidden/page.tsx',
  'maintenance/page.tsx',
  'offline/page.tsx'
].map(f => path.join('D:/claude/Claude Code Projects/PS 33/frontend/src/app', f));

files.forEach(file => {
  if (fs.existsSync(file)) {
    let raw = fs.readFileSync(file, 'utf8');
    let mod = mapTokens(raw);
    fs.writeFileSync(file, mod, 'utf8');
    console.log(`Updated ${file}`);
  }
});
