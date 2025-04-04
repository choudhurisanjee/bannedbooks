const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to find all .md files recursively
function findMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return fileList;
  }
  
  console.log(`Scanning directory: ${dir}`);
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      console.log(`Found subdirectory: ${filePath}`);
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      console.log(`Found Markdown file: ${filePath}`);
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all .md files in the src directory and its subdirectories
const srcDir = path.join(__dirname, '../src');
console.log(`Searching for Markdown files in: ${srcDir}`);

// List all directories in src to debug
try {
  const srcContents = fs.readdirSync(srcDir);
  console.log(`Contents of ${srcDir}:`, srcContents);
  
  // Check if pages directory exists
  const pagesDir = path.join(srcDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    console.log(`Pages directory exists: ${pagesDir}`);
    const pagesContents = fs.readdirSync(pagesDir);
    console.log(`Contents of ${pagesDir}:`, pagesContents);
    
    // Check each collection directory
    pagesContents.forEach(collectionDir => {
      const collectionPath = path.join(pagesDir, collectionDir);
      if (fs.statSync(collectionPath).isDirectory()) {
        console.log(`Collection directory: ${collectionPath}`);
        const collectionContents = fs.readdirSync(collectionPath);
        console.log(`Contents of ${collectionPath}:`, collectionContents);
      }
    });
  } else {
    console.error(`Pages directory does not exist: ${pagesDir}`);
  }
} catch (error) {
  console.error(`Error listing directories:`, error);
}

const markdownFiles = findMarkdownFiles(srcDir);
console.log(`Found ${markdownFiles.length} Markdown files:`, markdownFiles);

if (markdownFiles.length === 0) {
  console.log('No Markdown files found to process.');
  process.exit(0);
}

// Process each file
markdownFiles.forEach(file => {
  const outputFile = file.replace('.md', '.html');
  console.log(`Processing ${file} -> ${outputFile}`);
  
  try {
    const command = `pandoc "${file}" --template=collection-template.html --standalone -o "${outputFile}" --from markdown+raw_html-smart --no-highlight`;
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log('Collection pages built successfully!');