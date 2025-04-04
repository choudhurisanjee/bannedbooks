const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const CSV_FILE_PATH = '//banned_books.csv'; // Path to your CSV file
const OUTPUT_DIR = '//output/markdown'; // Directory where markdown files will be saved
const FILENAME_COLUMN = 'title'; // CSV column to use for filenames (adjust as needed)

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to convert a row of CSV data to markdown content
function convertToMarkdown(row) {
  let markdown = `# ${row[FILENAME_COLUMN]}\n\n`;
  
  // Add other fields from the CSV
  Object.entries(row).forEach(([key, value]) => {
    if (key !== FILENAME_COLUMN) {
      markdown += `## ${key}\n\n${value}\n\n`;
    }
  });
  
  return markdown;
}

// Function to sanitize filename
function sanitizeFilename(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Process the CSV file
fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (row) => {
    const filename = sanitizeFilename(row[FILENAME_COLUMN]) + '.md';
    const filePath = path.join(OUTPUT_DIR, filename);
    const content = convertToMarkdown(row);
    
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  })
  .on('end', () => {
    console.log('CSV processing complete!');
  })
  .on('error', (error) => {
    console.error('Error processing CSV:', error);
  });
