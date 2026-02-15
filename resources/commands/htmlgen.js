/**
 * ☆=========================================☆
 * Htmlgen.js - Generates the html file for the full report.
 * ☆=========================================☆
 */

import fs from 'fs';
import path from 'path';

/* == Generate HTMLL report == */
function generateReport(stats, options = {}) {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downsrc - Download Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #fff;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        h1 {
            color: #ff8c00;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #888;
            margin-bottom: 30px;
        }
        .stats {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #3a3a3a;
        }
        .stat-row:last-child {
            border-bottom: none;
        }
        .stat-label {
            color: #888;
        }
        .stat-value {
            color: #ff8c00;
            font-weight: bold;
        }
        .errors {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
        }
        .error-item {
            background: #3a2020;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            border-left: 3px solid #ff4444;
        }
        .error-url {
            color: #ff8c00;
            word-break: break-all;
        }
        .error-msg {
            color: #ff4444;
            margin-top: 5px;
            font-size: 0.9em;
        }
        .success {
            color: #44ff44;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>» Downsrc Download Report</h1>
        <div class="subtitle">Generated at ${new Date().toLocaleString()}</div>
        
        <div class="stats">
            <h2>Download Statistics</h2>
            <div class="stat-row">
                <span class="stat-label">Total Files</span>
                <span class="stat-value">${stats.totalFiles}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Successful Downloads</span>
                <span class="stat-value success">${stats.successfulDownloads}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Failed Downloads</span>
                <span class="stat-value">${stats.failedDownloads}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Total Size</span>
                <span class="stat-value">${(stats.totalBytes / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Duration</span>
                <span class="stat-value">${stats.durationSeconds}s</span>
            </div>
        </div>
        
        ${
			stats.errors && stats.errors.length > 0
				? `
        <div class="errors">
            <h2>Errors (${stats.errors.length})</h2>
            ${stats.errors
				.map(
					(err) => `
            <div class="error-item">
                <div class="error-url">${err.url}</div>
                <div class="error-msg">- ${err.error}</div>
            </div>
            `,
				)
				.join('')}
        </div>
        `
				: ''
		}
        
        <div class="footer">
            Report by: U! (heart emoji, star emoji, pretend like it's here or smth)
            Downsrc by everm4iva
        </div>
    </div>
</body>
</html>
    `;

	return html;
}

/* == Save HTML report to file == */
function saveReport(html, outputPath) {
	try {
		fs.writeFileSync(outputPath, html, 'utf8');
		return true;
	} catch (error) {
		console.error('Error saving report:', error.message);
		return false;
	}
}

export {generateReport, saveReport};
