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
};

// Generate flags from environment variables
const flags = {};

Object.keys(DEFAULT_FLAGS).forEach((key) => {
  // Use proper naming convention: FEATURE_FLAG_ENABLE_AUTHENTICATION
  const envKey = `FEATURE_FLAG_${key.toUpperCase().replace('AUTHENTICATION', 'AUTHENTICATION')}`;
  // For enableAuthentication, use FEATURE_FLAG_ENABLE_AUTHENTICATION
  const properEnvKey =
    key === 'enableAuthentication'
      ? 'FEATURE_FLAG_ENABLE_AUTHENTICATION'
      : envKey;

  const envValue = process.env[properEnvKey];

  if (envValue !== undefined) {
    flags[key] = envValue.toLowerCase() === 'true';
  } else {
    flags[key] = DEFAULT_FLAGS[key];
    // Set the environment variable for the current process
    process.env[properEnvKey] = String(flags[key]);
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
} catch (error) {
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
  const properEnvKey =
    key === 'enableAuthentication'
      ? 'FEATURE_FLAG_ENABLE_AUTHENTICATION'
      : `FEATURE_FLAG_${key.toUpperCase()}`;

  if (!envContent.includes(properEnvKey)) {
    envContent += `\n# Feature Flag: ${key}\n${properEnvKey}=${flags[key]}\n`;
    envUpdated = true;
  }
});

if (envUpdated) {
  try {
    fs.writeFileSync(envLocalPath, envContent);
  } catch (error) {
    // Silent fail for env update
  }
}
