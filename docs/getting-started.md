# Getting Started with Downsrc

Downsrc is a simple, powerful command-line tool for downloading files and websites.

## Installation

Install Downsrc globally using npm:

```bash
npm install -g @everm4iva/downsrc
```

Or with a package manager alternative:

```bash
yarn global add @everm4iva/downsrc
```

## Basic Usage

### Download a Single File

```bash
downsrc https://example.com/file.zip
```

Downloads the file and prompts you where to save it.

### Download a Webpage

```bash
downsrc https://example.com/page.html
```

Downloads the HTML page and all its resources (images, CSS, JavaScript).

### Check If a Link is Accessible

```bash
downsrc -c https://example.com/file.zip
```

Checks if the URL is accessible without downloading.

### Check Security/Certificates

```bash
downsrc -v https://example.com
```

Checks SSL certificates and security of the website.

## Common Flags

- `-o` - Open the file after downloading
- `-z` - Zip the downloaded files
- `-p <path>` - Specify where to save files
- `-dr` - Show download quality report
- `-hr` - Generate HTML report
- `-as <num>` - Advanced scraping (follow same-domain links)
- `-fe <extensions>` - Filter by file extension (e.g., "png & jpg")

For a complete list of flags, see [Flags Reference](flags.md).

## Advanced Features

### Advanced Scraping

Download a page and follow links recursively:

```bash
# Follow 3 same-domain links
downsrc -as 3 https://example.com/website

# Follow all links (will prompt if many)
downsrc -as https://example.com/site
```

### File Extension Filtering

Download only specific file types:

```bash
# Only download images
downsrc -fe "png & jpg & svg" https://example.com/gallery

# Only download documents
downsrc -fe "pdf & docx" https://example.com/resources
```

### Combining Features

```bash
# Scrape 5 links, download only PDFs, and zip the results
downsrc -as 5 -fe pdf -z https://example.com/papers
```

## Next Steps

- Learn about all available [flags](flags.md)
- Configure Downsrc [settings](configuration.md)
- Create custom [actions](actions.md)
- See more [examples](examples.md)
