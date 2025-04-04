const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration
const CSV_FILE_PATH = '../banned_books.csv';
const OUTPUT_DIR = '../src/pages';
const COLLECTION_COLUMN = 'collection_name';
const FILE_EXTENSION = '.md';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to sanitize filename
function sanitizeFilename(name) {
  if (!name) return 'unnamed-collection';
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Track which files we're going to create
const filesToCreate = new Set();

// Group books by collection
const collections = {};

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (row) => {
    const collectionName = row[COLLECTION_COLUMN];
    
    if (!collectionName) {
      console.error('Row missing collection name:', row);
      return;
    }
    
    if (!collections[collectionName]) {
      collections[collectionName] = {
        subtitle: row['collection_subtitle'],
        lastUpdated: row['last_updated'],
        email: row['contact_email'],
        books: []
      };
      
      // Add this filename to our tracking set
      const filename = sanitizeFilename(collectionName) + FILE_EXTENSION;
      filesToCreate.add(filename);
    }
    
    collections[collectionName].books.push({
      title: row['book_title'],
      author: row['book_author'],
      isbn: row['book_isbn']
    });
  })
  .on('end', () => {
    // Get list of existing files
    const existingFiles = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith(FILE_EXTENSION));
    
    // Delete files that shouldn't exist anymore
    existingFiles.forEach(file => {
      if (!filesToCreate.has(file)) {
        const filePath = path.join(OUTPUT_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath} (no longer in CSV)`);
      }
    });
    
    // Create markdown files for each collection
    Object.entries(collections).forEach(([collectionName, data]) => {
      const filename = sanitizeFilename(collectionName) + FILE_EXTENSION;
      const filePath = path.join(OUTPUT_DIR, filename);
      
      // Create frontmatter
      let content = `---
title: ${collectionName}
subtitle: ${data.subtitle || ''}
author: ${data.lastUpdated || ''}
email: ${data.email || ''}
lang: en
---

## Book Collections

<div class="books-grid">
<div class="book-header">
<p><strong>Title</strong></p>
<p><strong>Author</strong></p>
<p><strong>ISBN</strong></p>
</div>
`;

      // Add book items
      data.books.forEach(book => {
        content += `
<div class="book-item">
<p>${book.title}</p>
<p>${book.author}</p>
<p>${book.isbn}</p>
</div>
`;
      });
      
      content += `
</div>
`;
      
      fs.writeFileSync(filePath, content);
      console.log(`Created: ${filePath}`);
    });
    
    console.log('CSV processing complete!');
  })
  .on('error', (error) => {
    console.error('Error processing CSV:', error);
  });
