/**
 * ☆=========================================☆
 * Debugger.js - Handles the debugging of the service, such as error handling and logging.
 * ☆=========================================☆
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

let debugMode = false;
let currentLogFile = null;
let logBuffer = [];

/* == Debug directory in user's documents folder == */
const DEBUG_DIR = path.join(os.homedir(), 'Documents', 'downsrc');

/* == Enable debug mode == */
function enableDebug() {
	debugMode = true;
	ensureDebugDir();
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	currentLogFile = path.join(DEBUG_DIR, `download_${timestamp}.txt`);
	log('DEBUG MODE ENABLED', 'SYSTEM');
}

/* == Disable debug mode == */
function disableDebug() {
	if (debugMode) {
		log('DEBUG MODE DISABLED', 'SYSTEM');
		flushLogs();
	}
	debugMode = false;
	currentLogFile = null;
	logBuffer = [];
}

/* == Check if debug mode is enabled (do not exists.. i think) == */
function isDebugMode() {
	return debugMode;
}

/* == Debug directory exists? == */
function ensureDebugDir() {
	if (!fs.existsSync(DEBUG_DIR)) {
		fs.mkdirSync(DEBUG_DIR, {recursive: true});
	}
}

/* == Logs debug message == */
function log(message, category = 'INFO') {
	const timestamp = new Date().toISOString();
	const logEntry = `[${timestamp}] [${category}] ${message}`;

	if (debugMode) {
		logBuffer.push(logEntry);

		// Flush every 10 entries
		if (logBuffer.length >= 10) {
			flushLogs();
		}
	}
}

/* == Log an error == */
function logError(error, context = '') {
	const message = context ? `${context}: ${error.message}` : error.message;
	log(message, 'ERROR');
	if (error.stack && debugMode) {
		log(error.stack, 'STACK');
	}
}

/* == Log download start == */
function logDownloadStart(url) {
	log(`Starting download: ${url}`, 'DOWNLOAD');
}

/* == Log download complete == */
function logDownloadComplete(url, size, duration) {
	log(`Completed download: ${url} (${size} bytes in ${duration}ms)`, 'DOWNLOAD');
}

/* == Log download error == */
function logDownloadError(url, error) {
	log(`Failed download: ${url} - ${error}`, 'ERROR');
}

/* == Flush log buffer to file == */
function flushLogs() {
	if (!debugMode || !currentLogFile || logBuffer.length === 0) {
		return;
	}

	try {
		const content = logBuffer.join('\n') + '\n';
		fs.appendFileSync(currentLogFile, content, 'utf8');
		logBuffer = [];
	} catch (error) {
		console.error('Error writing debug log:', error.message);
	}
}

/* == Get al logs as a string == */
function getAllLogs() {
	flushLogs();
	if (currentLogFile && fs.existsSync(currentLogFile)) {
		return fs.readFileSync(currentLogFile, 'utf8');
	}
	return logBuffer.join('\n');
}

/* == Create donwload statistics object == */
function createStats() {
	return {
		startTime: Date.now(),
		endTime: null,
		totalFiles: 0,
		successfulDownloads: 0,
		failedDownloads: 0,
		totalBytes: 0,
		errors: [],
	};
}

/* == Finalize stats == */
function finalizeStats(stats) {
	stats.endTime = Date.now();
	stats.duration = stats.endTime - stats.startTime;
	stats.durationSeconds = (stats.duration / 1000).toFixed(2);
	return stats;
}

/* == Format stats for display == */
function formatStats(stats) {
	return {
		'Total Files': stats.totalFiles,
		'Successful': stats.successfulDownloads,
		'Failed': stats.failedDownloads,
		'Total Size': `${(stats.totalBytes / (1024 * 1024)).toFixed(2)} MB`,
		'Duration': `${stats.durationSeconds}s`,
	};
}

// ! Ensure logs are flushed on exit
process.on('exit', () => {
	if (debugMode) {
		flushLogs();
	}
});

export {
	enableDebug, disableDebug, isDebugMode, log, logError, logDownloadStart, logDownloadComplete,
	logDownloadError, flushLogs, getAllLogs, createStats, finalizeStats, formatStats,
};