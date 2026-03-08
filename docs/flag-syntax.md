# Command-Line Flag Syntax

## Important: Use Double-Dash for Multi-Character Flags!

Due to how the command-line parser (minimist) works, **multi-character flags require double-dash (`--`)** syntax.

### Correct Syntax

#### Single-Character Flags (use single dash `-`)

```bash
-o    # Open file after download
-c    # Check link accessibility
-z    # Zip files
-d    # Include debug in zip
-v    # Check vulnerabilities
-y    # Yes to all
-n    # No to all
-p    # Path (takes value)
```

#### Multi-Character Flags (use double dash `--`)

```bash
--tl    # Time limit
--ms    # Max size
--mss   # Max size pause
--hr    # HTML report
--hh    # HTML host
--dr    # Download report
--fe    # File extension filter
--as    # Advanced scraping
--debug-on    # Enable debug
--debug-off   # Disable debug
```

### Examples of Correct Usage

```bash
# ✅ Correct - using double-dash for multi-character flags
downsrc --fe "svg" https://example.com/assets
downsrc --as 5 https://example.com
downsrc --as 3 --fe "pdf" https://example.com/docs

# ❌ Wrong - single dash doesn't work for multi-character flags
downsrc -fe "svg" https://example.com/assets   # Parsed as -f -e "svg"
downsrc -as 5 https://example.com              # Parsed as -a -s 5
```

### Why This Matters

When you use `-as`, the parser sees it as TWO separate flags:

- `-a` (boolean flag, set to true)
- `-s` (with value `5`)

This means `options.DeepScraping` remains `undefined`!

With `--as`, the parser correctly sees it as ONE flag:

- `--as` (with value `5`)
- `options.DeepScraping` = `'5'` ✅

## Updated Command Examples

### Download only SVG files

```bash
downsrc --fe "svg" https://umaera.github.io/assets
```

### Download page + 5 linked pages (same domain)

```bash
downsrc --as 5 https://umaera.github.io
```

### Combine advanced scraping with file filtering

```bash
downsrc --as 3 --fe "png & jpg & svg" https://example.com/gallery
```

### Complete workflow

```bash
downsrc -z --dr --hr --as 5 --fe "pdf & docx" -p ./downloads https://example.com
```

## Summary

- **Single character flags**: Use `-` (e.g., `-o`, `-z`, `-c`)
- **Multi-character flags**: Use `--` (e.g., `--as`, `--fe`, `--tl`)
- Always check the help: `downsrc help`
