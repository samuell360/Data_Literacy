// frontend-cleanup-detector.ts
// FIXED VERSION - Corrected regex escaping

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as crypto from 'crypto';

const SRC_DIR = './src';
const UNUSED_FILES: string[] = [];
const DUPLICATE_FILES: Map<string, string[]> = new Map();

function getAllFiles(dir: string, ext: string[] = ['.ts', '.tsx', '.jsx', '.js']): string[] {
  let results: string[] = [];
  
  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory not found: ${dir}`);
    return results;
  }
  
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, build, dist
      if (!file.startsWith('.') && 
          file !== 'node_modules' && 
          file !== 'build' && 
          file !== 'dist' &&
          file !== 'coverage') {
        results = results.concat(getAllFiles(filePath, ext));
      }
    } else if (ext.some(e => file.endsWith(e))) {
      results.push(filePath);
    }
  });
  
  return results;
}

function isFileImported(filePath: string, allFiles: string[]): boolean {
  const fileName = path.basename(filePath, path.extname(filePath));
  const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, '/');
  
  // Entry points and special files are always considered used
  const alwaysUsed = [
    'main.tsx', 'main.ts', 'App.tsx', 'App.jsx',
    'index.tsx', 'index.ts', 'index.jsx', 'index.js',
    'vite-env.d.ts', 'setupTests.ts', 'reportWebVitals.ts'
  ];
  
  if (alwaysUsed.includes(fileName + path.extname(filePath))) {
    return true;
  }
  
  // Check if imported in any other file
  for (const otherFile of allFiles) {
    if (otherFile === filePath) continue;
    
    try {
      const content = fs.readFileSync(otherFile, 'utf-8');
      
      // Check various import patterns
      const importPatterns = [
        new RegExp(`from ['"\`].*${fileName}['"\`]`),
        new RegExp(`import.*${fileName}`),
        new RegExp(`require\\(['"\`].*${fileName}['"\`]\\)`),
        // Check relative imports
        new RegExp(`from ['"\`]\\.\\.?\\/.*${fileName}['"\`]`),
      ];
      
      if (importPatterns.some(pattern => pattern.test(content))) {
        return true;
      }
    } catch (err) {
      // Skip files that can't be read
      continue;
    }
  }
  
  return false;
}

function getFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Normalize content: remove comments and excess whitespace
    // Fixed regex - properly escaped
    const noComments = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
      .replace(/\/\/.*?/g, '') // Single-line comments (FIXED)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('md5').update(noComments).digest('hex');
  } catch (err) {
    return '';
  }
}

function findDuplicates(files: string[]) {
  const hashMap = new Map<string, string[]>();
  
  files.forEach(file => {
    const hash = getFileHash(file);
    if (hash) {
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(file);
    }
  });
  
  hashMap.forEach((fileList, hash) => {
    if (fileList.length > 1) {
      DUPLICATE_FILES.set(hash, fileList);
    }
  });
}

function generateReport() {
  console.log('\n📄 FRONTEND CLEANUP REPORT');
  console.log('='.repeat(60));
  
  if (UNUSED_FILES.length > 0) {
    console.log('\n🗑️  POTENTIALLY UNUSED FILES:\n');
    UNUSED_FILES.forEach(f => {
      const relPath = path.relative(process.cwd(), f);
      console.log(`  ❌ ${relPath}`);
    });
    console.log(`\n  Total: ${UNUSED_FILES.length} files`);
  } else {
    console.log('\n✅ No unused files detected');
  }
  
  if (DUPLICATE_FILES.size > 0) {
    console.log('\n📋 DUPLICATE FILE SETS:\n');
    DUPLICATE_FILES.forEach((files, hash) => {
      console.log(`  🔗 Hash ${hash.substring(0, 8)}:`);
      files.forEach(f => {
        const relPath = path.relative(process.cwd(), f);
        console.log(`     - ${relPath}`);
      });
      console.log('');
    });
    console.log(`  Total: ${DUPLICATE_FILES.size} duplicate sets`);
  } else {
    console.log('\n✅ No duplicate files detected');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Unused files: ${UNUSED_FILES.length}`);
  console.log(`  Duplicate sets: ${DUPLICATE_FILES.size}`);
  console.log('='.repeat(60));
}

function main() {
  console.log('🔍 Scanning frontend codebase...\n');
  
  const allFiles = getAllFiles(SRC_DIR);
  console.log(`Found ${allFiles.length} source files\n`);
  
  if (allFiles.length === 0) {
    console.error('❌ No files found. Make sure you run this from the frontend root directory.');
    process.exit(1);
  }
  
  // Check for unused files
  console.log('🗑️  Checking for unused files...');
  allFiles.forEach(file => {
    // Skip test files
    if (file.includes('.test.') || 
        file.includes('.spec.') || 
        file.includes('__tests__') ||
        file.includes('__mocks__')) {
      return;
    }
    
    if (!isFileImported(file, allFiles)) {
      UNUSED_FILES.push(file);
    }
  });
  
  console.log(`Found ${UNUSED_FILES.length} potentially unused files\n`);
  
  // Check for duplicates
  console.log('📋 Checking for duplicate files...');
  findDuplicates(allFiles);
  console.log(`Found ${DUPLICATE_FILES.size} duplicate sets\n`);
  
  // Generate report
  generateReport();
}

// Run
main();


