const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Generating Markdown files from CSV data...');

// Check if the CSV file exists
const csvPath = path.join(__dirname, '../banned_books.csv');
if (!fs.existsSync(csvPath)) {
  console.error(`Error: CSV file not found at ${csvPath}`);
  console.log('Please create a banned_books.csv file in the root directory with the following columns:');
  console.log('state,district,collection_name,collection_subtitle,contact_email,last_updated,book_title,book_author,book_isbn');
  console.log('\nExample:');
  console.log('FL,Flagler County School District,A Fun Collection,Banned Books Collection,flagler@example.com,2025-03-29,To Kill a Mockingbird,Harper Lee,9780060935467');
  process.exit(1);
}

try {
  // Get the path to the csv-to-site.js script
  const csvToSitePath = path.join(__dirname, 'csv-to-site.js');
  
  // Check if the script exists
  if (!fs.existsSync(csvToSitePath)) {
    console.error(`Error: Script not found at ${csvToSitePath}`);
    process.exit(1);
  }
  
  // Execute the script
  execSync(`node "${csvToSitePath}"`, { stdio: 'inherit' });
  
  console.log('Successfully generated Markdown files from CSV data!');
  console.log('To build the site with these new files, run: npm run build');
} catch (error) {
  console.error('Error generating Markdown files:', error.message);
  process.exit(1);
}