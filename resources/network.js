/**
 * ☆=========================================☆
 * network.js - Network utilities for downloading and checking URLs.
 * ☆=========================================☆
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import {URL} from 'url';
import * as debug from './debugger.js';

/* == Download a file from a URL == */
export async function downloadFile(url, outputPath, onProgress) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		debug.logDownloadStart(url);

		const urlObj = new URL(url);
		const client = urlObj.protocol === 'https:' ? https : http;

		const file = fs.createWriteStream(outputPath);

		client
			.get(url, (response) => {
				if (response.statusCode === 301 || response.statusCode === 302) {
					// == Handle redirects
					file.close();
					fs.unlinkSync(outputPath);
					return downloadFile(response.headers.location, outputPath, onProgress).then(resolve).catch(reject);
				}

				if (response.statusCode !== 200) {
					file.close();
					fs.unlinkSync(outputPath);
					const error = `HTTP ${response.statusCode}`;
					debug.logDownloadError(url, error);
					return reject(new Error(error));
				}

				const totalSize = parseInt(response.headers['content-length'], 10);
				let downloadedSize = 0;

				response.on('data', (chunk) => {
					downloadedSize += chunk.length;
					if (onProgress && totalSize) {
						onProgress(downloadedSize, totalSize);
					}
				});

				response.pipe(file);

				file.on('finish', () => {
					file.close();
					const duration = Date.now() - startTime;
					debug.logDownloadComplete(url, downloadedSize, duration);
					resolve({size: downloadedSize, duration});
				});
			})
			.on('error', (err) => {
				file.close();
				if (fs.existsSync(outputPath)) {
					fs.unlinkSync(outputPath);
				}
				debug.logDownloadError(url, err.message);
				reject(err);
			});
	});
}

/*
==
* Fetch HTML content from a URL
* Returning content and the final URL (after redirects)
==
*/

export async function fetchHTML(url) {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);
		const client = urlObj.protocol === 'https:' ? https : http;

		client
			.get(url, (response) => {
				if (response.statusCode === 301 || response.statusCode === 302) {
					const redirectUrl = new URL(response.headers.location, url).href;
					return fetchHTML(redirectUrl).then(resolve).catch(reject);
				}

				if (response.statusCode !== 200) {
					return reject(new Error(`HTTP ${response.statusCode}`));
				}

				let data = '';
				response.on('data', (chunk) => (data += chunk));
				response.on('end', () => resolve({content: data, finalUrl: url}));
			})
			.on('error', reject);
	});
}

/* == Check if URL is accessible == */
export async function checkUrl(url) {
	return new Promise((resolve) => {
		try {
			const urlObj = new URL(url);
			const client = urlObj.protocol === 'https:' ? https : http;

			const options = {
				method: 'HEAD',
				hostname: urlObj.hostname,
				port: urlObj.port,
				path: urlObj.pathname + urlObj.search,
			};

			const req = client.request(options, (res) => {
				resolve({accessible: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode});
			});

			req.on('error', () => {
				resolve({accessible: false, statusCode: 0});
			});

			req.setTimeout(5000, () => {
				req.destroy();
				resolve({accessible: false, statusCode: 0});
			});

			req.end();
		} catch (error) {
			resolve({accessible: false, statusCode: 0});
		}
	});
}
