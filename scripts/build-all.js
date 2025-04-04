const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Check if template.html exists
const templatePath = path.join(__dirname, '../template.html');
if (!fs.existsSync(templatePath)) {
  console.error('template.html not found at:', templatePath);
  process.exit(1);
}

// Build index.html
console.log('Building index.html...');
try {
  const indexPath = path.join(__dirname, '../index.md');
  const templatePath = path.join(__dirname, '../template.html');
  
  console.log(`Using index.md at: ${indexPath}`);
  console.log(`Using template at: ${templatePath}`);
  
  execSync(`pandoc "${indexPath}" --template="${templatePath}" --standalone --toc -o "${outputDir}/index.html" --from markdown+raw_html-smart --no-highlight`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error building index.html:', error);
  process.exit(1); // Exit with error if index.html build fails
}

// Find all collection Markdown files in the pages directory
const pagesDir = path.join(__dirname, '../src/pages');
console.log(`Searching for Markdown files in: ${pagesDir}`);

let markdownFiles = [];
if (fs.existsSync(pagesDir)) {
  markdownFiles = fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(pagesDir, file));
}

console.log(`Found ${markdownFiles.length} Markdown files`);

// Build each collection page
markdownFiles.forEach(file => {
  const fileName = path.basename(file, '.md');
  const outputFile = path.join(outputDir, `${fileName}.html`);
  const templatePath = path.join(__dirname, '../collection-template.html');
  
  console.log(`Building ${file} -> ${outputFile}`);
  
  try {
    execSync(`pandoc "${file}" --template="${templatePath}" --standalone -o "${outputFile}" --from markdown+raw_html-smart --no-highlight`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error building ${file}:`, error);
  }
});

// Copy CSS and JS files to output directory
const filesToCopy = [
  { src: 'src/index.css', dest: 'output/index.css' },
  { src: 'src/reset.css', dest: 'output/reset.css' },
  { src: 'src/index.js', dest: 'output/index.js' }
];

filesToCopy.forEach(({ src, dest }) => {
  console.log(`Copying ${src} -> ${dest}`);
  try {
    fs.copyFileSync(path.join(__dirname, '..', src), path.join(__dirname, '..', dest));
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error);
  }
});

console.log('Build completed successfully!');
