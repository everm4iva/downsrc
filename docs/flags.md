# Flags Reference

Complete reference for all Downsrc command-line flags.

## Download Flags

### `-o, --open`

Opens the downloaded file after completion.

```bash
downsrc -o https://example.com/document.pdf
```

### `-z, --zip`

Creates a zip archive of the downloaded files.

```bash
downsrc -z https://example.com/website
```

### `-p, --path <path>`

Specifies the download destination path.

```bash
downsrc -p ./downloads https://example.com/file.zip
```

### `-as, --advanced-scraping <root-num>`

Enables advanced scraping mode. Downloads the page and follows same-domain links recursively.

- If `root-num` is `0`: Downloads only the provided link and its assets
- If `root-num` is a number (e.g., `5`): Scans and downloads that many links plus their assets
- If `root-num` is not provided or invalid: Scans all same-domain links (warns if >10)

**Note:** Only follows links within the same domain. External domain links are not followed.

```bash
# Download page and follow 3 same-domain links
downsrc -as 3 https://example.com/website

# Download only the page itself (no link following)
downsrc -as 0 https://example.com/page

# Download all same-domain links (will prompt if many links found)
downsrc -as https://example.com/site
```

### `-fe, --file-extension <extensions>`

Filters downloads to only include files with specified extensions. Supports multiple extensions separated by `&`.

```bash
# Download only PNG files
downsrc -fe png https://example.com/gallery

# Download multiple file types
downsrc -fe "png & jpg & webp & svg" https://example.com/images

# Download only documents
downsrc -fe "pdf & docx & txt" https://example.com/documents

# Combine with advanced scraping
downsrc -as 5 -fe "pdf & pptx" https://example.com/resources
```

## Time and Size Limits

### `-tl, --timelimit <seconds>`

Sets a time limit for the download. Cancels if exceeded.

```bash
downsrc -tl 30 https://example.com/file.zip
```

### `-ms, --max-size <mb>`

Skips files larger than the specified size in MB.

```bash
downsrc -ms 100 https://example.com/website
```

### `-mss, --max-size-pause <mb>`

Pauses and asks before downloading files larger than the specified size.

```bash
downsrc -mss 50 https://example.com/website
```

## Reports and Output

### `-hr, --html-report`

Generates an HTML report of the download.

```bash
downsrc -hr https://example.com/website
```

### `-hh, --html-host`

Starts a local web server and displays download progress in the browser.

```bash
downsrc -hh https://example.com/website
```

### `-dr, --download-report`

Displays a quality report after download completion.

```bash
downsrc -dr https://example.com/website
```

### `-d, --debug-zip`

Includes debug.txt file with logs in the zip archive.

```bash
downsrc -z -d https://example.com/website
```

## Checking and Validation

### `-c, --check`

Checks if the URL is accessible without downloading.

```bash
downsrc -c https://example.com/file.zip
```

### `-v, --vulnerable`

Checks SSL certificates and security vulnerabilities.

```bash
downsrc -v https://example.com
```

## Automation Flags

### `-y, --yes`

Automatically answers "yes" to all prompts.

```bash
downsrc -y https://example.com/website
```

### `-n, --no`

Automatically answers "no" to all prompts.

```bash
downsrc -n https://example.com/website
```

## Debug Mode

### `-debug-on`

Enables debug mode. Logs everything to files in Documents/downsrc.

```bash
downsrc -debug-on
```

### `-debug-off`

Disables debug mode.

```bash
downsrc -debug-off
```

## Combining Flags

Flags can be combined for powerful workflows:

```bash
# Download, zip, generate report, and open
downsrc -z -dr -o https://example.com/website

# Download with time limit and size limit
downsrc -tl 60 -ms 100 https://example.com/website

# Download to specific path and auto-confirm
downsrc -p ./my-downloads -y https://example.com/file.zip

# Advanced scraping with file filtering
downsrc -as 5 -fe "png & jpg" https://example.com/gallery

# Complete workflow: scrape, filter, zip, and report
downsrc -as 3 -fe pdf -z -dr -p ./documents https://example.com/resources
```
