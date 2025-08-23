#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

/**
 * Generates feature-flags.json from environment variables
 * Places the file in src/ for import compatibility and public/ for client access
 * This script runs during the build process to create the feature flags file
 * from environment variables, ensuring compatibility with Vercel and other platforms
 */

// Define default flags (must match DEFAULT_FLAGS in feature-flags.ts)
const DEFAULT_FLAGS = {
  enableAuthentication: true,
  FF_Chat_Analysis_Screen: true,
  FF_Full_Page_Navigation: true,
  FF_Side_NavBar: true,
  FF_Modals: true,
  FF_Raw_Data_Navigation: false,
};

// Helper function for handling environment variables
const handleEnvFlag = (key, envKey, defaultValue) => {
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return envValue.toLowerCase() === 'true';
  } else {
    process.env[envKey] = String(defaultValue);
    return defaultValue;
  }
};

// Generate flags from environment variables
const flags = {};

const ENV_KEYS = {
  enableAuthentication: 'FEATURE_FLAG_ENABLE_AUTHENTICATION',
  FF_Chat_Analysis_Screen: 'FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN',
  FF_Full_Page_Navigation: 'FF_FULL_PAGE_NAVIGATION',
  FF_Side_NavBar: 'FF_SIDE_NAVBAR',
  FF_Modals: 'FF_MODALS',
  FF_Raw_Data_Navigation: 'FF_RAW_DATA_NAVIGATION',
};

Object.keys(DEFAULT_FLAGS).forEach((key) => {
  const envKey = ENV_KEYS[key];
  if (envKey) {
    flags[key] = handleEnvFlag(key, envKey, DEFAULT_FLAGS[key]);
  } else {
    flags[key] = DEFAULT_FLAGS[key];
  }
});

// Create the JSON content
const jsonContent = JSON.stringify(flags, null, 2);

// 1. Write to src/ for import usage (primary location)
const srcFlagsPath = path.join(process.cwd(), 'src', 'feature-flags.json');

try {
  // Ensure src directory exists
  const srcDir = path.dirname(srcFlagsPath);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  fs.writeFileSync(srcFlagsPath, jsonContent);
} catch (error) {
  console.error('❌ Error generating src/feature-flags.json:', error.message);
  process.exit(1);
}

// 2. Write to root for backward compatibility (development/debugging)
const rootFlagsPath = path.join(process.cwd(), 'feature-flags.json');

try {
  fs.writeFileSync(rootFlagsPath, jsonContent);
} catch {
  // Silent fail for backup file
}

// 3. Write to public/ for client-side access if needed
const publicFlagsPath = path.join(
  process.cwd(),
  'public',
  'feature-flags.json'
);

try {
  // Ensure public directory exists
  const publicDir = path.dirname(publicFlagsPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(publicFlagsPath, jsonContent);
} catch (error) {
  // Silent fail for public file
  console.warn('Failed to write public feature-flags.json:', error.message);
}

// 4. Update .env.local if it doesn't exist for local development
const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
}

// Add feature flag environment variables if they don't exist
let envUpdated = false;
Object.keys(DEFAULT_FLAGS).forEach((key) => {
  // Use proper naming convention
  let properEnvKey;

  properEnvKey = ENV_KEYS[key] ?? `FEATURE_FLAG_${key.toUpperCase()}`;

  if (!envContent.includes(properEnvKey)) {
    envContent += `\n# Feature Flag: ${key}\n${properEnvKey}=${flags[key]}\n`;
    envUpdated = true;
  }
});

if (envUpdated) {
  try {
    fs.writeFileSync(envLocalPath, envContent);
  } catch {
    // Silent fail for env update
  }
}
