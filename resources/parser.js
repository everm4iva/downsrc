/**
 * ☆=========================================☆
 * Parser.js - Da Parser!
 * Extracts resources from HTML and CSS, updates paths for offline use, and handles link extraction.
 * ☆=========================================☆
 */

/* == Parser utilzs == */
import * as cheerio from 'cheerio';
import {URL} from 'url';
import fs from 'fs';
import path from 'path';

/* == Extract URLs from CSS content == */
export function extractUrlsFromCss(cssContent, baseUrl) {
	const urls = [];
	const urlMatches = cssContent.match(/url\(['"]?([^'"\)]+)['"]?\)/gi);
	if (urlMatches) {
		urlMatches.forEach((match) => {
			const url = match.replace(/url\(['"]?([^'"\)]+)['"]?\)/i, '$1');
			// Skip data URLs
			if (!url.startsWith('data:')) {
				urls.push(url);
			}
		});
	}
	return urls;
}

/* == Extract all resource URLs == */
export function extractResources(html, baseUrl) {
	const $ = cheerio.load(html);
	const resources = new Set();

	// Check for <base> tag
	const baseHref = $('base').attr('href');
	if (baseHref) {
		try {
			baseUrl = new URL(baseHref, baseUrl).href;
		} catch (error) {
			// Invalid base href, ignore it!! bueh
		}
	}

	// == Images
	$('img[src]').each((i, el) => {
		resources.add($(el).attr('src'));
	});

	// == Image srcset attributes
	$('img[srcset]').each((i, el) => {
		const srcset = $(el).attr('srcset');
		if (srcset) {
			// Parse srcset: "image1.jpg 1x, image2.jpg 2x" or "image1.jpg 100w, image2.jpg 200w"
			const urls = srcset.split(',').map((part) => part.trim().split(/\s+/)[0]);
			urls.forEach((url) => resources.add(url));
		}
	});

	// == Inline style background images
	$('[style*="background"]').each((i, el) => {
		const style = $(el).attr('style');
		if (style) {
			const urls = extractUrlsFromCss(style, baseUrl);
			urls.forEach((url) => resources.add(url));
		}
	});

	// == Extract from <style> tags
	$('style').each((i, el) => {
		const cssContent = $(el).html();
		if (cssContent) {
			const urls = extractUrlsFromCss(cssContent, baseUrl);
			urls.forEach((url) => resources.add(url));
		}
	});

	// == Scripts
	$('script[src]').each((i, el) => {
		resources.add($(el).attr('src'));
	});

	// == Stylesheets
	$('link[rel="stylesheet"][href]').each((i, el) => {
		resources.add($(el).attr('href'));
	});

	// == Manifest and other JSON files
	$('link[rel="manifest"][href]').each((i, el) => {
		resources.add($(el).attr('href'));
	});

	// == Other links (favicon, etc)
	$('link[href]').each((i, el) => {
		const href = $(el).attr('href');
		if (href && href.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|json)$/i)) {
			resources.add(href);
		}
	});

	// == Convert relative URLs to absolute
	const absoluteUrls = [];
	resources.forEach((resource) => {
		try {
			const absoluteUrl = new URL(resource, baseUrl).href;
			absoluteUrls.push(absoluteUrl);
		} catch (error) {
			// Invalid URL, skip, move on, that's life
		}
	});

	return absoluteUrls;
}

/* == Extract all links == */
export function extractLinks(html, baseUrl) {
	const $ = cheerio.load(html);
	const links = new Set();

	// == Check for <base> tag
	const baseHref = $('base').attr('href');
	if (baseHref) {
		try {
			baseUrl = new URL(baseHref, baseUrl).href;
		} catch (error) {
			// == Invalid base href, ignore it, next line
		}
	}

	$('a[href]').each((i, el) => {
		const href = $(el).attr('href');
		if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
			try {
				const absoluteUrl = new URL(href, baseUrl).href;
				links.add(absoluteUrl);
			} catch (error) {
				// == Invalid URL, skip
			}
		}
	});

	return Array.from(links);
}

/* ==  Update resource paths - to match downloaded file structure == */
export function updateHtmlPaths($, baseUrl, resourceMap, htmlFilePath, tempDir) {
	// == Check for <base> tag for resolution
	let effectiveBaseUrl = baseUrl;
	const baseHref = $('base').attr('href');
	if (baseHref) {
		try {
			effectiveBaseUrl = new URL(baseHref, baseUrl).href;
		} catch (error) {
			// ==  Invalid base href, ignore it, just ignore...
		}
	}

	// == Remove <base> tag - this is local lol
	$('base').remove();

	// == Remove integrity and crossorigin attributes to prevent SRI issues. (local files are boring)
	$('script, link, img').removeAttr('integrity').removeAttr('crossorigin');

	// == A helper (supa cute) to calculate relative path from the current HTML file to the target resource
	const getRelativePath = (targetRelPath) => {
		if (!htmlFilePath || !tempDir) return targetRelPath;

		const absTarget = path.join(tempDir, targetRelPath);
		const absHtmlDir = path.dirname(htmlFilePath);

		// == relative path
		let relPath = path.relative(absHtmlDir, absTarget).replace(/\\/g, '/');

		// == Makes sure that it doesn't look like a computer path if it stays in same folder (e.g. just "file.js")
		// == but if it goes up, it should be "../file.js" or smth
		return relPath;
	};

	// == Update script sources
	$('script[src]').each((i, el) => {
		const src = $(el).attr('src');
		try {
			const absoluteUrl = new URL(src, effectiveBaseUrl).href;
			if (resourceMap.has(absoluteUrl)) {
				const targetRelPath = resourceMap.get(absoluteUrl);
				$(el).attr('src', getRelativePath(targetRelPath));
			}
		} catch (error) {
			// == Skip invalid URLs, tired of writing this comment, just skip
		}
	});

	// == Update stylesheet hrefs
	$('link[rel="stylesheet"][href]').each((i, el) => {
		const href = $(el).attr('href');
		try {
			const absoluteUrl = new URL(href, effectiveBaseUrl).href;
			if (resourceMap.has(absoluteUrl)) {
				const targetRelPath = resourceMap.get(absoluteUrl);
				$(el).attr('href', getRelativePath(targetRelPath));
			}
		} catch (error) {
			// == Skip invalid URLs, gooooshhhhh
		}
	});

	// == Update clickable links (anchors)
	$('a[href]').each((i, el) => {
		const href = $(el).attr('href');
		// Ignore anchors, JS, mailto
		if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;

		try {
			const absoluteUrl = new URL(href, effectiveBaseUrl).href;
			if (resourceMap.has(absoluteUrl)) {
				const targetRelPath = resourceMap.get(absoluteUrl);
				$(el).attr('href', getRelativePath(targetRelPath));
			}
		} catch (error) {
			// == Skip invalid U-R-L-s-----??!??!?!? RAAAAHHH
		}
	});

	// == Update image sources
	$('img[src]').each((i, el) => {
		const src = $(el).attr('src');
		try {
			const absoluteUrl = new URL(src, effectiveBaseUrl).href;
			if (resourceMap.has(absoluteUrl)) {
				const targetRelPath = resourceMap.get(absoluteUrl);
				$(el).attr('src', getRelativePath(targetRelPath));
			}
		} catch (error) {}
	});

	// == Update image srcset attributes
	$('img[srcset]').each((i, el) => {
		const srcset = $(el).attr('srcset');
		if (srcset) {
			let updatedSrcset = srcset;
			// == Parse srcset and replace URLs
			const parts = srcset.split(',').map((part) => part.trim());
			const updatedParts = parts.map((part) => {
				const [url, ...rest] = part.split(/\s+/);
				try {
					const absoluteUrl = new URL(url, effectiveBaseUrl).href;
					if (resourceMap.has(absoluteUrl)) {
						const targetRelPath = resourceMap.get(absoluteUrl);
						return [getRelativePath(targetRelPath), ...rest].join(' ');
					}
				} catch (error) {}
				return part;
			});
			$(el).attr('srcset', updatedParts.join(', '));
		}
	});

	// == Update inline style background images
	$('[style*="background"]').each((i, el) => {
		const style = $(el).attr('style');
		if (style) {
			let updatedStyle = style;
			const matches = style.match(/url\(['"]?([^'"\)]+)['"]?\)/gi);
			if (matches) {
				matches.forEach((match) => {
					const url = match.replace(/url\(['"]?([^'"\)]+)['"]?\)/i, '$1');
					try {
						const absoluteUrl = new URL(url, effectiveBaseUrl).href;
						if (resourceMap.has(absoluteUrl)) {
							const targetRelPath = resourceMap.get(absoluteUrl);
							updatedStyle = updatedStyle.replace(match, `url('${getRelativePath(targetRelPath)}')`);
						}
					} catch (error) {
						// u alreayd know the drill, skip invalid URLs
					}
				});
				$(el).attr('style', updatedStyle);
			}
		}
	});

	// == Update other links (favicon, manifest, etc)
	$('link[href]').each((i, el) => {
		const href = $(el).attr('href');
		if (href && href.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|json|xml)$/i)) {
			try {
				const absoluteUrl = new URL(href, effectiveBaseUrl).href;
				if (resourceMap.has(absoluteUrl)) {
					const targetRelPath = resourceMap.get(absoluteUrl);
					$(el).attr('href', getRelativePath(targetRelPath));
				}
			} catch (error) {
				// repeat after me: skip invalid URLs, just skip, move on, next one
			}
		}
	});
}

/* == Update CSS files to reference new local paths == */
export function updateCssPaths(tempDir, resourceMap, baseUrl) {
	for (const [resourceUrl, localPath] of resourceMap.entries()) {
		if (resourceUrl.match(/\.css$/i)) {
			try {
				const cssFilePath = path.join(tempDir, localPath);
				if (fs.existsSync(cssFilePath)) {
					let cssContent = fs.readFileSync(cssFilePath, 'utf8');

					// == Find all url() references
					const urlMatches = cssContent.match(/url\(['"]?([^'"\)]+)['"]?\)/gi);
					if (urlMatches) {
						urlMatches.forEach((match) => {
							const url = match.replace(/url\(['"]?([^'"\)]+)['"]?\)/i, '$1');

							// == Skip data URLs
							if (url.startsWith('data:')) return;

							try {
								// == Convert to absolute URL based on CSS file location
								const absoluteUrl = new URL(url, resourceUrl).href;

								if (resourceMap.has(absoluteUrl)) {
									const newPath = resourceMap.get(absoluteUrl);
									// == make calculus on relative path from CSS file to resource
									const cssDir = path.dirname(path.join(tempDir, localPath));
									const resourcePath = path.join(tempDir, newPath);
									const relativePath = path.relative(cssDir, resourcePath).replace(/\\/g, '/');

									// == Replace in CSS content
									cssContent = cssContent.replace(match, `url('${relativePath}')`);
								}
							} catch (e) {
								// == skip skip skip skip skip
							}
						});

						// == Write updated CSS back
						fs.writeFileSync(cssFilePath, cssContent, 'utf8');
					}
				}
			} catch (error) {
				// error.
			}
		}
	}
}
