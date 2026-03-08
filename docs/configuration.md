# Configuration

Downsrc can be customized through the `coolshits.json` configuration file.

## Configuration File Location

The configuration file is located at:

```
resources/coolshits.json
```

## Available Settings

### `accentColor`

The accent color used in the terminal interface.

Default: `"orange"`

### `symbolsPath`

Path to the symbols directory.

Default: `"./resources/symbols"`

### `defaultDownloadDir`

Default directory for downloads when no path is specified.

Default: `"./downloads"`

### `showProgress`

Whether to show progress bars during downloads.

Default: `true`

### `maxConcurrentDownloads`

Maximum number of concurrent file downloads when downloading multiple files.

Default: `3`

### `defaultZipAfterDownload`

Whether to automatically zip files after download without using the `-z` flag.

Default: `false`

## Changing Settings

### Via Command Line

Use the `set` command to change settings:

```bash
downsrc set maxConcurrentDownloads 5
downsrc set defaultZipAfterDownload true
downsrc set defaultDownloadDir C:/Downloads
```

### Via Direct Edit

You can also edit the `coolshits.json` file directly:

```json
{
	"accentColor": "orange",
	"symbolsPath": "./resources/symbols",
	"defaultDownloadDir": "./downloads",
	"showProgress": true,
	"maxConcurrentDownloads": 5,
	"defaultZipAfterDownload": true
}
```

## Example Configurations

### High-Speed Configuration

Maximize concurrent downloads for faster completion:

```json
{"maxConcurrentDownloads": 10, "showProgress": true}
```

### Minimal Configuration

Reduce resource usage:

```json
{"maxConcurrentDownloads": 1, "showProgress": false}
```

### Auto-Zip Configuration

Always zip downloads by default:

```json
{"defaultZipAfterDownload": true, "defaultDownloadDir": "C:/MyDownloads"}
```
