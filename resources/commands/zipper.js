/**
 * ☆=========================================☆
 * Zipper.js - Handles zipping files for the service.
 * ☆=========================================☆
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import * as fsUtils from '../fs.js';

/* == Zip files or dircrtory == */
async function zipFiles(sourcePath, outputPath, options = {}) {
	return new Promise((resolve, reject) => {
		// == Ensure output directory exists
		fsUtils.ensureDir(path.dirname(outputPath));

		const output = fs.createWriteStream(outputPath);
		const archive = archiver('zip', {
			zlib: {level: 9}, // == Compression level
		});

		output.on('close', () => {
			resolve({outputPath, size: archive.pointer()});
		});

		archive.on('error', (err) => {
			reject(err);
		});

		archive.pipe(output);

		// == Check if source is a directory or file
		const stats = fs.statSync(sourcePath);

		if (stats.isDirectory()) {
			// == Add directory contents
			archive.directory(sourcePath, false);
		} else {
			// == Add single file
			archive.file(sourcePath, {name: path.basename(sourcePath)});
		}

		// == Add debug file if requested
		if (options.includeDebug && options.debugContent) {
			archive.append(options.debugContent, {name: 'debug.txt'});
		}

		archive.finalize();
	});
}

/* == Zip multiple files into one archive == */
async function zipMultipleFiles(files, outputPath, options = {}) {
	return new Promise((resolve, reject) => {
		fsUtils.ensureDir(path.dirname(outputPath));

		const output = fs.createWriteStream(outputPath);
		const archive = archiver('zip', {zlib: {level: 9}});

		output.on('close', () => {
			resolve({outputPath, size: archive.pointer()});
		});

		archive.on('error', (err) => {
			reject(err);
		});

		archive.pipe(output);

		// == Add each file
		files.forEach((filePath) => {
			if (fs.existsSync(filePath)) {
				archive.file(filePath, {name: path.basename(filePath)});
			}
		});

		// == Add debug file if requested
		if (options.includeDebug && options.debugContent) {
			archive.append(options.debugContent, {name: 'debug.txt'});
		}

		archive.finalize();
	});
}

export {zipFiles, zipMultipleFiles};
