/**
 * ☆=========================================☆
 * Ulils - Utilities for file filtering and processing
 * ☆=========================================☆
 */

import path from 'path';
import {URL} from 'url';

/* == Parse file extension filter string (ex: "png & jpg & webp") == */
export function parseFileExtensions(filterString) {
	if (!filterString) return null;

	// Split by & and clean up each extension
	const extensions = filterString
		.split('&')
		.map((ext) => ext.trim().toLowerCase().replace(/^\./, ''))
		.filter((ext) => ext.length > 0);

	return extensions.length > 0 ? extensions : null;
}


/* == Filter resources by file extension == */
export function filterResourcesByExtension(resources, extensionFilter) {
	if (!extensionFilter || extensionFilter.length === 0) {
		return resources; // If no filter, return all
	}

	return resources.filter((url) => {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const ext = path.extname(pathname).toLowerCase().replace(/^\./, '');
			return extensionFilter.includes(ext);
		} catch (error) {
			return false; // If invalid URL, skip
		}
	});
}
