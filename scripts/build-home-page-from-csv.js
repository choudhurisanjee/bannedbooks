const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to your files
const csvFilePath = '../banned_books.csv';
const homepageFilePath = path.join(__dirname, '../index.md');

async function buildHomepage() {
  try {
    // Read the CSV file
    const books = await readCsvFile(csvFilePath);
    
    // Group books by district and collection
    const groupedCollections = groupBooksByDistrictAndCollection(books);
    
    // Generate the collections HTML
    const collectionsHtml = generateCollectionsHtml(groupedCollections);
    
    // Read the current homepage content
    let homepageContent = fs.readFileSync(homepageFilePath, 'utf8');
    
    // Find the collections section and replace it
    const collectionsStartMarker = '## Collections {#collections}';
    const nextSectionMarker = '## Contact {#contact}';
    
    const startIndex = homepageContent.indexOf(collectionsStartMarker);
    const endIndex = homepageContent.indexOf(nextSectionMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not find the collections section in the homepage file');
    }
    
    // Replace the collections section
    const newHomepageContent = 
      homepageContent.substring(0, startIndex) + 
      collectionsStartMarker + '\n\n' + 
      collectionsHtml + '\n' + 
      homepageContent.substring(endIndex);
    
    // Write the updated content back to the file
    fs.writeFileSync(homepageFilePath, newHomepageContent);
    
    console.log('Homepage updated successfully!');
  } catch (error) {
    console.error('Error updating homepage:', error);
  }
}

function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

function groupBooksByDistrictAndCollection(books) {
  const groupedCollections = {};
  
  books.forEach(book => {
    const state = book.state;
    const district = book.district;
    const collection = book.collection_name;
    const email = book.contact_email;
    
    // Keep the sort key as "State, District" for sorting purposes
    const sortKey = `${state}, ${district}`;
    // But use "District - State" as the display format
    const displayKey = `${district}, ${state}`;
    
    if (!groupedCollections[sortKey]) {
      groupedCollections[sortKey] = {
        displayName: displayKey,
        collections: {}
      };
    }
    
    if (!groupedCollections[sortKey].collections[collection]) {
      groupedCollections[sortKey].collections[collection] = {
        name: collection,
        email: email,
        slug: slugify(collection)
      };
    }
  });
  
  return groupedCollections;
}

function generateCollectionsHtml(groupedCollections) {
  let html = '<div class="districts-list">\n';
  
  // Sort by state and district alphabetically
  const sortedKeys = Object.keys(groupedCollections).sort();
  
  sortedKeys.forEach(sortKey => {
    const districtInfo = groupedCollections[sortKey];
    html += `<details>\n<summary>${districtInfo.displayName}</summary>\n<div class="collections">\n`;
    
    // Sort collections alphabetically within each district
    const collections = Object.values(districtInfo.collections);
    collections.sort((a, b) => a.name.localeCompare(b.name));
    
    collections.forEach(collection => {
      html += `<div class="collection">\n`;
      html += `<p><strong>Collection:</strong> ${collection.name}</p>\n`;
      html += `<p><strong>Contact:</strong> <a href="mailto:${collection.email}">${collection.email}</a></p>\n`;
      html += `<p><strong>Book List:</strong> <a href="${collection.slug}.html">View Books</a></p>\n`;
      html += `</div>\n`;
    });
    
    html += `</div>\n</details>\n`;
  });
  
  html += '</div>';
  
  return html;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Run the script
buildHomepage();
