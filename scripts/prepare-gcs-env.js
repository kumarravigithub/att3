#!/usr/bin/env node

/**
 * Helper script to convert gcs-service-account.json to environment variable format
 * 
 * Usage:
 *   node scripts/prepare-gcs-env.js
 * 
 * This will output the JSON content as a single-line string that can be used
 * as the GCS_SERVICE_ACCOUNT_JSON environment variable.
 */

const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'gcs-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: gcs-service-account.json not found in project root');
  process.exit(1);
}

try {
  const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccountJson = JSON.parse(serviceAccountContent);
  
  // Minify JSON (remove all whitespace)
  const minifiedJson = JSON.stringify(serviceAccountJson);
  
  console.log('\n✅ GCS Service Account JSON (ready for environment variable):\n');
  console.log(minifiedJson);
  console.log('\n📋 Instructions:');
  console.log('1. Copy the JSON string above');
  console.log('2. Set it as GCS_SERVICE_ACCOUNT_JSON environment variable in your deployment platform');
  console.log('3. For Vercel: Project Settings → Environment Variables → Add');
  console.log('4. For Railway/Render: Add as environment variable in dashboard\n');
} catch (error) {
  console.error('Error reading or parsing service account file:', error.message);
  process.exit(1);
}

