# The Banned Books Collection

A website for preserving literary freedom in an age of censorship. This project provides a platform to catalog and share books that have been challenged or banned in various school districts.

## About

The Banned Books Collection preserves access to literary works that have been challenged or banned in various school districts. Users can browse collections organized by district and state, view book details, and contact collection maintainers to borrow books.

## Features

- Browse collections by school district and state
- View detailed book information including title, author, and ISBN
- Contact collection maintainers via email
- Responsive, accessible design based on The Monospace Web framework

## Development

### Prerequisites

- Node.js
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### CSV Data Format

The site is built from a CSV file (`banned_books.csv`) with the following columns:
- state
- district
- collection_name
- collection_subtitle
- contact_email
- last_updated
- book_title
- book_author
- book_isbn

### Development Workflow

1. **Generate pages from CSV:**
   ```
   npm run generate
   ```
   This processes the CSV file to create collection pages and update the homepage.

2. **Build the site:**
   ```
   npm run build
   ```
   This builds the HTML files from markdown using Pandoc.

3. **Development server:**
   ```
   npm run dev
   ```
   This starts a local development server with live reloading.

### Scripts

- `generate`: Processes the CSV file to create markdown pages and update the homepage
- `build`: Builds the site using Pandoc
- `dev`: Runs a development server with live reloading
- `watch`: Watches for file changes and rebuilds the site
- `serve`: Serves the built site locally

## License

[MIT](MIT_LICENSE.md)
[MONOSPACE_WEB](MONOSPACE_WEB_LICENSE.md)

## Acknowledgments

Website design based on [The Monospace Web](https://github.com/owickstrom/the-monospace-web) by Oskar Wickström.