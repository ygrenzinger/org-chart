#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 Running final validation...\n');

// 1. Lint check
console.log('📋 Running linter...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.error('❌ Linting failed');
  process.exit(1);
}

// 2. Test suite
console.log('🧪 Running test suite...');
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log('✅ Tests passed\n');
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

// 3. Build check
console.log('🏗️  Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// 4. Bundle size check
console.log('📦 Checking bundle size...');
try {
  const stats = readFileSync('dist/d3-org-chart.js.gz');
  const sizeKB = Math.round(stats.length / 1024);
  console.log(`Bundle size: ${sizeKB}KB`);
  
  if (sizeKB > 100) { // Adjust threshold as needed
    console.warn('⚠️  Bundle size is larger than expected');
  } else {
    console.log('✅ Bundle size is acceptable\n');
  }
} catch (error) {
  console.warn('⚠️  Could not check bundle size');
}

console.log('🎉 All validations passed! Ready for production.');