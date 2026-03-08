# Examples

Real-world examples of using Downsrc.

## Basic Downloads

### Download a Single File

```bash
downsrc https://example.com/document.pdf
```

Downloads the PDF and asks where to save it.

### Download and Open

```bash
downsrc -o https://example.com/image.jpg
```

Downloads the image and opens it immediately.

### Download to Specific Location

```bash
downsrc -p ./my-files https://example.com/data.zip
```

Downloads directly to the `my-files` directory.

## Webpage Downloads

### Download Complete Website

```bash
downsrc https://example.com/page.html
```

Downloads the HTML page and all resources (CSS, JS, images).

### Download and Zip Website

```bash
downsrc -z https://example.com/portfolio
```

Downloads the website and creates a zip archive.

### Download with HTML Report

```bash
downsrc -hr https://example.com/blog
```

Downloads the website and generates a detailed HTML report.

## Advanced Downloads

### Time-Limited Download

```bash
downsrc -tl 30 https://slow-server.com/large-file.zip
```

Cancels download if it takes longer than 30 seconds.

### Size-Limited Download

```bash
downsrc -ms 50 https://media-site.com/gallery
```

Skips any files larger than 50 MB.

### Interactive Size Check

```bash
downsrc -mss 100 https://example.com/files
```

Asks for confirmation before downloading files larger than 100 MB.

## Quality and Reports

### Download with Quality Report

```bash
downsrc -dr https://example.com/content
```

Downloads and displays a quality rating of the download.

### Complete Workflow with Reports

```bash
downsrc -z -hr -dr https://example.com/project
```

Downloads, zips, generates HTML report, and shows quality report.

### Debug Download

```bash
downsrc -z -d https://problematic-site.com
```

Downloads with debug logging included in the zip file.

## Advanced Scraping

### Basic Advanced Scraping

```bash
downsrc -as 3 https://example.com/docs
```

Downloads the page and follows up to 3 same-domain links, downloading each with their resources.

### Download Only Main Page

```bash
downsrc -as 0 https://example.com/page
```

Downloads only the specified page and its resources (no link following).

### Scrape Entire Site

```bash
downsrc -as https://example.com/wiki
```

Follows all same-domain links. Will prompt for confirmation if more than 10 links found.

### Scraping with Auto-Confirm

```bash
downsrc -as 15 -y https://example.com/blog
```

Automatically follows 15 links without prompting for confirmation.

## File Extension Filtering

### Download Only Images

```bash
downsrc -fe "png & jpg & webp" https://example.com/gallery
```

Downloads only image files with specified extensions.

### Download Only Documents

```bash
downsrc -fe "pdf & docx & txt" https://example.com/resources
```

Filters to download only document files.

### Single Extension Filter

```bash
downsrc -fe svg https://example.com/icons
```

Downloads only SVG files from the page.

## Combined Features

### Scrape and Filter

```bash
downsrc -as 5 -fe "png & jpg" https://example.com/photos
```

Follows 5 links and downloads only PNG and JPG images from all pages.

### Complete Scraping Workflow

```bash
downsrc -as 10 -fe pdf -z -dr -p ./documents https://example.com/papers
```

Follows 10 links, downloads only PDFs, zips results, shows quality report, saves to specific path.

### Filtered Download with Report

```bash
downsrc -fe "mp3 & wav & flac" -z -hr https://example.com/music
```

Downloads only audio files, creates zip archive, and generates HTML report.

## Checking and Validation

### Check Accessibility

```bash
downsrc -c https://example.com/file.zip
```

Checks if the file is accessible without downloading.

### Security Check

```bash
downsrc -v https://example.com
```

Checks SSL certificate and security of the website.

### Batch Accessibility Check

Check multiple URLs (using actions):

```bash
downsrc action add check-urls "downsrc -c https://site1.com && downsrc -c https://site2.com"
downsrc run check-urls
```

## Interactive UI

### Web-Based Download UI

```bash
downsrc -hh https://example.com/large-site
```

Opens a browser with live download progress and statistics.

## Automation

### Auto-Confirm All Prompts

```bash
downsrc -y -z https://example.com/files
```

Downloads and zips without asking for confirmation.

### Silent Download with Path

```bash
downsrc -y -p ./downloads https://example.com/file.zip
```

Downloads silently to specified directory.

## Workflows

### Complete Download Workflow

```bash
downsrc -z -dr -hr -p ./projects/website https://example.com
```

Downloads website, zips it, shows quality report, generates HTML report, saves to specific path.

### Quick Check and Download

```bash
downsrc -c https://example.com/file.zip
# If accessible, then:
downsrc -o -p ./downloads https://example.com/file.zip
```

First checks accessibility, then downloads and opens if available.

### Development Workflow

```bash
# Download with debug logging
downsrc -debug-on
downsrc -z -d https://example.com/project
downsrc -debug-off
```

Enables debug mode, downloads with debug info, then disables debug mode.

## Custom Actions

### Create Backup Action

```bash
downsrc action add backup-downloads "tar -czf downloads_$(date +%Y%m%d).tar.gz ./downloads"
```

### Create Download-and-Backup Workflow

```bash
downsrc -p ./downloads https://example.com/file.zip
downsrc run backup-downloads
```

## Multiple Downloads

While not directly supported with a single command, you can use actions:

```bash
downsrc action add multi-download "downsrc https://site1.com/file1.zip && downsrc https://site2.com/file2.zip"
downsrc run multi-download
```

## Tips and Tricks

### Quick Cat Display

Show the cat symbol for fun:

```bash
downsrc cat
```

### View Package Details

```bash
downsrc details
```

Shows information about Downsrc and its creator.

### Customize Settings

```bash
downsrc set maxConcurrentDownloads 10
downsrc set defaultZipAfterDownload true
```

Customize behavior without command-line flags.
