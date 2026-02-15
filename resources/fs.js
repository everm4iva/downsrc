/**
 * ☆=========================================☆
 * FS.js - Handles file system operations for the service.
 * ☆=========================================☆
 */

import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

/* == Directory exists?, create if not == */
function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, {recursive: true});
	}
}

/* == Check if file exists == */
function fileExists(filePath) {
	return fs.existsSync(filePath);
}

/* == Get file size in bytes == */
function getFileSize(filePath) {
	try {
		const stats = fs.statSync(filePath);
		return stats.size;
	} catch (error) {
		return 0;
	}
}

/* == Convert bytes to MB == */
function bytesToMB(bytes) {
	return (bytes / (1024 * 1024)).toFixed(2);
}

/* == Convert MB to bytes == */
function mbToBytes(mb) {
	return mb * 1024 * 1024;
}

/* == Prompt user for save location == */
async function promptSaveLocation(defaultName) {
	const response = await prompts({
		type: 'text',
		name: 'path',
		message: 'Where to save the file?',
		initial: path.join(process.cwd(), defaultName),
	});

	return response.path;
}

/* == Prompt user for yes/no question == */
async function promptYesNo(message, initial = true) {
	const response = await prompts({type: 'confirm', name: 'value', message: message, initial: initial});

	return response.value;
}

/* == Write file == */
function writeFile(filePath, content) {
	try {
		ensureDir(path.dirname(filePath));
		fs.writeFileSync(filePath, content);
		return true;
	} catch (error) {
		console.error('Error writing file:', error.message);
		return false;
	}
}

/* == Read file == */
function readFile(filePath) {
	try {
		return fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		console.error('Error reading file:', error.message);
		return null;
	}
}

/* == Delete file == */
function deleteFile(filePath) {
	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		return true;
	} catch (error) {
		console.error('Error deleting file:', error.message);
		return false;
	}
}

/* == Delete directory == */
function deleteDirectory(dirPath) {
	try {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, {recursive: true, force: true});
		}
		return true;
	} catch (error) {
		console.error('Error deleting directory:', error.message);
		return false;
	}
}

/* == Get sanitized filename from URL == */
function sanitizeFilename(filename) {
	return filename.replace(/[^a-z0-9._-]/gi, '_').substring(0, 255);
}

/* == Sanitize a file path (handles directory separators well) == */
function sanitizePath(filePath) {
	const parts = filePath.split(/[\\/]/);
	const sanitizedParts = parts.map((part) => {
		if (!part) return part;
		return part.replace(/[^a-z0-9._-]/gi, '_').substring(0, 255);
	});
	return path.join(...sanitizedParts);
}

/* == Get extension from filename == */
function getExtension(filename) {
	return path.extname(filename);
}

/* == Generate unique filename if file exists == */
function getUniqueFilename(filePath) {
	if (!fs.existsSync(filePath)) {
		return filePath;
	}

	const dir = path.dirname(filePath);
	const ext = path.extname(filePath);
	const name = path.basename(filePath, ext);

	let counter = 1;
	let newPath;
	do {
		newPath = path.join(dir, `${name}_${counter}${ext}`);
		counter++;
	} while (fs.existsSync(newPath));

	return newPath;
}

export {
	ensureDir, fileExists, getFileSize, bytesToMB, mbToBytes, promptSaveLocation,
	promptYesNo, writeFile, readFile, deleteFile, deleteDirectory, sanitizeFilename,
	sanitizePath, getExtension, getUniqueFilename,
};
