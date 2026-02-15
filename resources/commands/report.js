/**
 * ☆=========================================☆
 * Report.js - Generates the report for the service, optionally passes to other files and the server.
 * ☆=========================================☆
 */

import * as terminal from '../terminal-wowies.js';

/* == Use advanced math to determine the download quality wowies, nerds == */
function calculateQuality(stats) {
	if (stats.totalFiles === 0) return {rating: 0, description: 'No downloads'};

	const successRate = (stats.successfulDownloads / stats.totalFiles) * 100;
	const avgSpeed = stats.totalBytes / (stats.duration / 1000); // ! bytes per second
	const speedMBps = avgSpeed / (1024 * 1024);

	let rating = 0;
	let description = '';

	// == Success rate component (0-50 points)
	rating += (successRate / 100) * 50;

	// ==  Speed component (0-30 points)
	if (speedMBps > 5) rating += 30;
	else if (speedMBps > 2) rating += 20;
	else if (speedMBps > 1) rating += 10;
	else if (speedMBps > 0.5) rating += 5;

	// == No errors bonus (20 points)
	if (stats.failedDownloads === 0) rating += 20;

	// ==  Determine description
	if (rating >= 90) description = 'Excellent';
	else if (rating >= 75) description = 'Good';
	else if (rating >= 50) description = 'Fair';
	else if (rating >= 25) description = 'Poor';
	else description = 'Failed';

	return {
		rating: Math.round(rating),
		description,
		successRate: successRate.toFixed(1),
		speedMBps: speedMBps.toFixed(2),
	};
}

/* == Generate and display download quality report == */
function generateQualityReport(stats) {
	const quality = calculateQuality(stats);

	terminal.printHeader('Download Quality Report');

	console.log(
		terminal.colors.white('  Quality Rating: ') +
			terminal.colors.accent(`${quality.rating}/100 (${quality.description})`),
	);
	console.log(terminal.colors.white('  Success Rate: ') + terminal.colors.accent(`${quality.successRate}%`));
	console.log(terminal.colors.white('  Avg Speed: ') + terminal.colors.accent(`${quality.speedMBps} MB/s`));
	console.log(
		terminal.colors.white('  Total Downloaded: ') +
			terminal.colors.accent(`${(stats.totalBytes / (1024 * 1024)).toFixed(2)} MB`),
	);
	console.log(terminal.colors.white('  Duration: ') + terminal.colors.accent(`${stats.durationSeconds}s`));

	if (stats.failedDownloads > 0) {
		terminal.printWarn(`${stats.failedDownloads} file(s) failed to download`);
	} else {
		terminal.printSuccess('All files downloaded successfully');
	}

	console.log('');
}

export {calculateQuality, generateQualityReport};
