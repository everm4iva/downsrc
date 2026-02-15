/**
 * ☆=========================================☆
 * Logic.js - The actual main logic of the service.
 * ☆=========================================☆
 */

import fs from 'fs';
import path from 'path';
import {URL} from 'url';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

import * as terminal from './terminal-wowies.js';
import * as fsUtils from './fs.js';
import * as debug from './debugger.js';
import * as settings from './settings.js';

import * as network from './network.js';
import * as parser from './parser.js';
import * as utils from './utils.js';

// == Re-export functions from other modules
export {downloadFile, fetchHTML, checkUrl} from './network.js';
export {extractResources, extractUrlsFromCss, extractLinks, updateHtmlPaths, updateCssPaths} from './parser.js';
export {parseFileExtensions, filterResourcesByExtension} from './utils.js';

/* == Download from a URL (single file or webpage with resources) == */
export async function downloadFromUrl(url, options = {}) {
	const stats = debug.createStats();
	const config = settings.loadConfig();

	try {
		// == Check if URL is a direct file
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const isDirectFile =
			pathname.match(/\.[a-z0-9]+$/i) && !pathname.endsWith('.html') && !pathname.endsWith('.htm');

		if (isDirectFile) {
			// == Download single file
			return await downloadSingleFile(url, options, stats);
		} else {
			// == Download webpage with resources
			return await downloadWebpage(url, options, stats);
		}
	} catch (error) {
		debug.logError(error, 'Download failed');
		throw error;
	}
}

/* == Downloads a single file == */
export async function downloadSingleFile(url, options, stats) {
	const urlObj = new URL(url);
	const filename = path.basename(urlObj.pathname) || 'downloaded_file';
	const sanitized = fsUtils.sanitizeFilename(filename);

	// == Check file extension filter
	if (options.fileExtension) {
		const extensionFilter = utils.parseFileExtensions(options.fileExtension);
		if (extensionFilter) {
			const ext = path.extname(sanitized).toLowerCase().replace(/^\./, '');
			if (!extensionFilter.includes(ext)) {
				terminal.printWarn(`File extension '${ext}' does not match filter (${extensionFilter.join(', ')})!`);
				terminal.printInfo('Skipping download due to extension filter');
				stats.totalFiles = 0;
				stats.successfulDownloads = 0;
				throw new Error(`File extension '${ext}' does not match filter!!!`);
			}
		}
	}

	// == Determine output path
	let outputPath;
	if (options.path) {
		outputPath = path.join(options.path, sanitized);
	} else {
		const tempDir = path.join(process.cwd(), '.downsrc_temp');
		fsUtils.ensureDir(tempDir);
		outputPath = path.join(tempDir, sanitized);
	}

	outputPath = fsUtils.getUniqueFilename(outputPath);
	terminal.printDownloading(sanitized);

	const progressBar = terminal.createProgressBar();
	progressBar.start(100, 0);

	try {
		const result = await network.downloadFile(url, outputPath, (current, total) => {
			const progress = Math.floor((current / total) * 100);
			progressBar.update(progress);
		});

		progressBar.stop();

		stats.totalFiles = 1;
		stats.successfulDownloads = 1;
		stats.totalBytes = result.size;

		return {outputPath, stats, files: [outputPath], isMultiFile: false};
	} catch (error) {
		progressBar.stop();
		stats.totalFiles = 1;
		stats.failedDownloads = 1;
		stats.errors.push({url, error: error.message});
		debug.logError(error, 'Download failed');
		throw error;
	}
}

/* == Scrap - follow links on the page == */
async function performDeepScraping(
	html, baseUrl, baseDomain, tempDir, options,
	stats, resourceMap, downloadedFiles, config,
	limit, failedUrls,
) {
	terminal.printWarn('Initiating deep scraping...');

	// == Extract all links from the page
	const links = parser.extractLinks(html, baseUrl);

	terminal.printInfo(`Found ${links.length} total links on page`);

	// == Filter to same domain only
	const sameDomainLinks = links.filter((link) => {
		try {
			const linkUrl = new URL(link);
			return linkUrl.hostname === baseDomain;
		} catch (error) {
			return false;
		}
	});

	terminal.printInfo(`${sameDomainLinks.length} links belong to same domain (${baseDomain})`);

	// == Parse root number (how many links to follow)
	let rootNum = parseInt(options.DeepScraping);
	if (isNaN(rootNum) || rootNum < 0) {
		// ==  If undefined or invalid, scan all links but warn if > 10
		rootNum = sameDomainLinks.length;
		if (rootNum > 10 && !options.yes) {
			terminal.printWarn(`Found ${rootNum} links to scrape. This may take a while!`);
			const response = await fsUtils.promptYesNo('Continue with deep scraping?', true);
			if (!response) {
				terminal.printInfo('Deep scraping cancelled.');
				return;
			}
		}
	}

	// == Limit to rootNum links
	const linksToScrape = sameDomainLinks.slice(0, rootNum);
	if (linksToScrape.length === 0) {
		terminal.printInfo('No same-domain links found for deep scraping.');
		return;
	}

	terminal.printInfo(`Deep scraping: Following ${linksToScrape.length} link(s)...`);

	// == Track already scraped URLs to avoid duplicates
	const scrapedUrls = new Set([baseUrl]);

	// == Download each linked page
	for (const linkUrl of linksToScrape) {
		if (scrapedUrls.has(linkUrl)) continue;
		scrapedUrls.add(linkUrl);

		try {
			terminal.printInfo(`Scraping: ${linkUrl}`);

			// == Fetch the linked page
			const {content: linkedHtml, finalUrl} = await network.fetchHTML(linkUrl);
			// == Use finalUrl for resource extraction
			const effectiveUrl = finalUrl || linkUrl;

			const linked$ = cheerio.load(linkedHtml);
			let linkedResources = parser.extractResources(linkedHtml, effectiveUrl);

			// == Apply file extension filter if specified
			if (options.fileExtension) {
				const extensionFilter = utils.parseFileExtensions(options.fileExtension);
				if (extensionFilter) {
					linkedResources = utils.filterResourcesByExtension(linkedResources, extensionFilter);
				}
			}

			stats.totalFiles += linkedResources.length + 1;

			// == Download resources from linked page
			const linkDownloadPromises = linkedResources.map((resourceUrl) => {
				return limit(async () => {
					try {
						const urlObj = new URL(resourceUrl);
						const isExternal = urlObj.hostname !== baseDomain;

						let relativePath;
						let outputPath;

						if (isExternal) {
							const filename = fsUtils.sanitizeFilename(path.basename(urlObj.pathname) || `resource`);
							const domain = fsUtils.sanitizeFilename(urlObj.hostname);
							relativePath = path.join('othersource', domain, filename);
							outputPath = path.join(tempDir, relativePath);
						} else {
							let urlPath = urlObj.pathname;
							if (urlPath.startsWith('/')) urlPath = urlPath.substring(1);
							if (!urlPath || urlPath.endsWith('/')) {
								urlPath = path.join(urlPath, 'index.html');
							}
							relativePath = fsUtils.sanitizePath(urlPath);
							outputPath = path.join(tempDir, relativePath);
						}

						// == Skip if already downloaded
						if (resourceMap.has(resourceUrl)) return;

						fsUtils.ensureDir(path.dirname(outputPath));
						const uniquePath = fsUtils.getUniqueFilename(outputPath);

						terminal.printDownloading(path.basename(uniquePath));
						const result = await network.downloadFile(resourceUrl, uniquePath);

						const actualRelativePath = path.relative(tempDir, uniquePath).replace(/\\/g, '/');
						resourceMap.set(resourceUrl, actualRelativePath);

						downloadedFiles.push(uniquePath);
						stats.successfulDownloads++;
						stats.totalBytes += result.size || 0;
						terminal.printSuccess(path.basename(uniquePath));
					} catch (error) {
						stats.failedDownloads++;
						stats.errors.push({url: resourceUrl, error: error.message});
						failedUrls.add(resourceUrl);
						terminal.printError(`Failed: ${path.basename(resourceUrl)} - ${error.message}`);
					}
				});
			});

			await Promise.all(linkDownloadPromises);

			// == Save the linked HTML page only if the damn filter allows
			let shouldSaveLinkedHtml = true;
			if (options.fileExtension) {
				const extensionFilter = utils.parseFileExtensions(options.fileExtension);
				if (extensionFilter) {
					shouldSaveLinkedHtml = extensionFilter.includes('html') || extensionFilter.includes('htm');
				}
			}

			if (shouldSaveLinkedHtml) {
				const linkUrlObj = new URL(effectiveUrl);
				let linkPath = linkUrlObj.pathname;
				if (linkPath.startsWith('/')) linkPath = linkPath.substring(1);
				if (!linkPath || linkPath.endsWith('/')) {
					linkPath = path.join(linkPath, 'index.html');
				}

				const linkedHtmlPath = path.join(tempDir, fsUtils.sanitizePath(linkPath));
				fsUtils.ensureDir(path.dirname(linkedHtmlPath));
				const uniqueHtmlPath = fsUtils.getUniqueFilename(linkedHtmlPath);

				// == Add this HTML page to resourceMap so other pages can link to it
				const actualRelativeHtmlPath = path.relative(tempDir, uniqueHtmlPath).replace(/\\/g, '/');
				resourceMap.set(effectiveUrl, actualRelativeHtmlPath);

				// == Update linked HTML paths
				parser.updateHtmlPaths(linked$, effectiveUrl, resourceMap, uniqueHtmlPath, tempDir);
				const updatedLinkedHtml = linked$.html();

				fs.writeFileSync(uniqueHtmlPath, updatedLinkedHtml);
				downloadedFiles.push(uniqueHtmlPath);
				stats.successfulDownloads++;

				if (fs.existsSync(uniqueHtmlPath)) {
					const linkedHtmlStats = fs.statSync(uniqueHtmlPath);
					stats.totalBytes += linkedHtmlStats.size;
				}
				terminal.printSuccess(`Scraped: ${path.basename(uniqueHtmlPath)}`);
			} else {
				terminal.printInfo(`Skipping HTML page: ${linkUrl} (not in extension filter)`);
			}
		} catch (error) {
			stats.failedDownloads++;
			stats.errors.push({url: linkUrl, error: error.message});
			terminal.printError(`Failed to scrape: ${linkUrl} - ${error.message}`);
		}
	}
}

/* == Download a webpage == */
export async function downloadWebpage(url, options, stats) {
	terminal.printInfo('Fetching webpage...');

	const baseUrlObj = new URL(url);
	const baseDomain = baseUrlObj.hostname;

	const {content: html, finalUrl} = await network.fetchHTML(url);
	// == Use finalUrl for resource extraction
	const effectiveUrl = finalUrl || url;

	// == Log if redirect happened
	if (finalUrl && finalUrl !== url) {
		terminal.printInfo(`Followed redirect to: ${finalUrl}`);
	}

	const $ = cheerio.load(html);
	let resources = parser.extractResources(html, effectiveUrl);

	// == Apply file extension filter if specified
	if (options.fileExtension) {
		const extensionFilter = utils.parseFileExtensions(options.fileExtension);
		if (extensionFilter) {
			const originalCount = resources.length;
			resources = utils.filterResourcesByExtension(resources, extensionFilter);
			terminal.printInfo(
				`Filtered to ${resources.length}/${originalCount} resources (extensions: ${extensionFilter.join(', ')})`,
			);
		}
	}

	terminal.printInfo(`Found ${resources.length} resources`);

	// == Create temporary directory
	const tempDir = path.join(process.cwd(), '.downsrc_temp');
	fsUtils.ensureDir(tempDir);

	const downloadedFiles = [];
	const resourceMap = new Map(); // ! Map original URL to new path
	const failedUrls = new Set(); // ! Track failed URLs to avoid infinite retry
	stats.totalFiles = resources.length + 1;
	stats.successfulDownloads = 0;

	// == Add Main html index point to resourceMap
	const htmlPath = path.join(tempDir, 'index.html');
	// == Returns to same URL if we click a home link
	resourceMap.set(effectiveUrl, 'index.html');

	// == Download resorce with concurrency limit
	const config = settings.loadConfig();
	const limit = pLimit(config.maxConcurrentDownloads || 3);

	const downloadPromises = resources.map((resourceUrl, index) => {
		return limit(async () => {
			try {
				const urlObj = new URL(resourceUrl);
				const isExternal = urlObj.hostname !== baseDomain;

				// == Determine output path based on wenether it's external
				let relativePath;
				let outputPath;

				if (isExternal) {
					// == External resource - goes to othersource folder
					const filename = fsUtils.sanitizeFilename(path.basename(urlObj.pathname) || `resource_${index}`);
					const domain = fsUtils.sanitizeFilename(urlObj.hostname);
					relativePath = path.join('othersource', domain, filename);
					outputPath = path.join(tempDir, relativePath);
				} else {
					// == Same domain - preserve original path structure
					let urlPath = urlObj.pathname;
					// == Remove leading slash
					if (urlPath.startsWith('/')) urlPath = urlPath.substring(1);
					// == If it's just a directory or empty, create a meaningful filename !!
					if (!urlPath || urlPath.endsWith('/')) {
						const ext = path.extname(urlObj.pathname) || '.html';
						urlPath = path.join(urlPath, `resource_${index}${ext}`);
					}
					relativePath = fsUtils.sanitizePath(urlPath);
					outputPath = path.join(tempDir, relativePath);
				}

				// == Ensure directory exists
				fsUtils.ensureDir(path.dirname(outputPath));
				const uniquePath = fsUtils.getUniqueFilename(outputPath);

				terminal.printDownloading(path.basename(uniquePath));

				const result = await network.downloadFile(resourceUrl, uniquePath);

				// == Store the mapping (original URL -> relative path from tempDir)
				const actualRelativePath = path.relative(tempDir, uniquePath).replace(/\\/g, '/');
				resourceMap.set(resourceUrl, actualRelativePath);

				downloadedFiles.push(uniquePath);
				stats.successfulDownloads++;
				stats.totalBytes += result.size || 0;

				terminal.printSuccess(path.basename(uniquePath));
			} catch (error) {
				stats.failedDownloads++;
				stats.errors.push({url: resourceUrl, error: error.message});

				terminal.printError(`Failed: ${path.basename(resourceUrl)} - ${error.message}`);
			}
		});
	});

	await Promise.all(downloadPromises);

	// == Recursively parse downloaded CSS files for additional resources
	// == This handles cases where CSS imports other CSS files with fonts, etc.
	let foundNewResources = true;
	let passNumber = 1;
	const maxPasses = 10; // ! Safety limit

	while (foundNewResources && passNumber <= maxPasses) {
		const cssResources = new Set();

		for (const [resourceUrl, localPath] of resourceMap.entries()) {
			if (resourceUrl.match(/\.css$/i)) {
				try {
					const cssFilePath = path.join(tempDir, localPath);
					if (fs.existsSync(cssFilePath)) {
						const cssContent = fs.readFileSync(cssFilePath, 'utf8');
						const cssUrls = parser.extractUrlsFromCss(cssContent, resourceUrl);

						// == Convert relative URLs to absolute based on CSS file location
						cssUrls.forEach((cssUrl) => {
							try {
								const absoluteUrl = new URL(cssUrl, resourceUrl).href;
								// Only add if not already downloaded or failed
								if (!resourceMap.has(absoluteUrl) && !failedUrls.has(absoluteUrl)) {
									cssResources.add(absoluteUrl);
								}
							} catch (e) {
								//  man.. Invalid URL in CSS, skip it
							}
						});
					}
				} catch (error) {
					// whatevers, skip on error
				}
			}
		}

		// == If no new resources found, exit loop
		if (cssResources.size === 0) {
			foundNewResources = false;
			break;
		}

		// == Apply file extension filter to CSS resources if specified
		let filteredCssResources = Array.from(cssResources);
		if (options.fileExtension) {
			const extensionFilter = utils.parseFileExtensions(options.fileExtension);
			if (extensionFilter) {
				const originalCount = filteredCssResources.length;
				filteredCssResources = utils.filterResourcesByExtension(filteredCssResources, extensionFilter);
				terminal.printInfo(
					`Pass ${passNumber}: Found ${filteredCssResources.length}/${originalCount} resources in CSS (filtered by: ${extensionFilter.join(', ')})`,
				);
			} else {
				terminal.printInfo(
					`Pass ${passNumber}: Found ${filteredCssResources.length} additional resources in CSS`,
				);
			}
		} else {
			terminal.printInfo(`Pass ${passNumber}: Found ${filteredCssResources.length} additional resources in CSS`);
		}

		stats.totalFiles += filteredCssResources.length;
		passNumber++;

		const cssDownloadPromises = filteredCssResources.map((resourceUrl, index) => {
			return limit(async () => {
				try {
					const urlObj = new URL(resourceUrl);
					const isExternal = urlObj.hostname !== baseDomain;

					let relativePath;
					let outputPath;

					if (isExternal) {
						const filename = fsUtils.sanitizeFilename(
							path.basename(urlObj.pathname) || `css_resource_${index}`,
						);
						const domain = fsUtils.sanitizeFilename(urlObj.hostname);
						relativePath = path.join('othersource', domain, filename);
						outputPath = path.join(tempDir, relativePath);
					} else {
						let urlPath = urlObj.pathname;
						if (urlPath.startsWith('/')) urlPath = urlPath.substring(1);
						if (!urlPath || urlPath.endsWith('/')) {
							const ext = path.extname(urlObj.pathname) || '.png';
							urlPath = path.join(urlPath, `css_resource_${index}${ext}`);
						}
						relativePath = fsUtils.sanitizePath(urlPath);
						outputPath = path.join(tempDir, relativePath);
					}

					fsUtils.ensureDir(path.dirname(outputPath));
					const uniquePath = fsUtils.getUniqueFilename(outputPath);

					terminal.printDownloading(path.basename(uniquePath));
					const result = await network.downloadFile(resourceUrl, uniquePath);

					const actualRelativePath = path.relative(tempDir, uniquePath).replace(/\\/g, '/');
					resourceMap.set(resourceUrl, actualRelativePath);

					downloadedFiles.push(uniquePath);
					stats.successfulDownloads++;
					stats.totalBytes += result.size || 0;
					terminal.printSuccess(path.basename(uniquePath));
				} catch (error) {
					stats.failedDownloads++;
					stats.errors.push({url: resourceUrl, error: error.message});
					failedUrls.add(resourceUrl); // == Track failed URL to prevent retry
					terminal.printError(`Failed: ${path.basename(resourceUrl)} - ${error.message}`);
				}
			});
		});

		await Promise.all(cssDownloadPromises);
	}

	// == Update CSS files to reference new paths
	parser.updateCssPaths(tempDir, resourceMap, effectiveUrl);

	// == Deep scraping - follow links if requested
	// == Run this BEFORE updating/saving the main HTML so that this beautiful downloaded registers scraped pages in resourceMap
	if (options.DeepScraping !== undefined) {
		terminal.printInfo(`Deep scraping option detected: ${options.DeepScraping}`);
		await performDeepScraping(
			html,
			effectiveUrl,
			baseDomain,
			tempDir,
			options,
			stats,
			resourceMap,
			downloadedFiles,
			config,
			limit,
			failedUrls,
		);
	}

	// == Update HTML to reference new paths and save only if filter allows
	parser.updateHtmlPaths($, effectiveUrl, resourceMap, htmlPath, tempDir);
	const updatedHtml = $.html();

	// == Check if HTML should be saved basd on file extension filter
	let shouldSaveHtml = true;
	if (options.fileExtension) {
		const extensionFilter = utils.parseFileExtensions(options.fileExtension);
		if (extensionFilter) {
			// == Only save HTML if 'html' or 'htm'' is in the filter
			shouldSaveHtml = extensionFilter.includes('html') || extensionFilter.includes('htm');
			if (!shouldSaveHtml) {
				terminal.printInfo('Skipping HTML file (not in extension filter)');
			}
		}
	}

	if (shouldSaveHtml) {
		// == Save updated HTML
		fs.writeFileSync(htmlPath, updatedHtml);
		downloadedFiles.push(htmlPath);
		stats.successfulDownloads++;

		// == Add HTML file size to total
		if (fs.existsSync(htmlPath)) {
			const htmlStats = fs.statSync(htmlPath);
			stats.totalBytes += htmlStats.size;
		}
	}

	// == Check if any files were downloaded
	if (downloadedFiles.length === 0) {
		terminal.printWarn('No files were downloaded (possibly due to extension filter)');
		// == Clean up empty temp directory
		if (fs.existsSync(tempDir)) {
			fsUtils.deleteDirectory(tempDir);
		}
		throw new Error('No files matched the specified criteria');
	}

	return {outputPath: tempDir, stats, files: downloadedFiles, isMultiFile: true};
}
