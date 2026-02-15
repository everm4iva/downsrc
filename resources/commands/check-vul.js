/**
 * ☆=========================================☆
 * Check-vul.js - Checks source & checks vulnerabilities of it.
 * ☆=========================================☆
 */

import https from 'https';
import {URL} from 'url';
import * as terminal from '../terminal-wowies.js';

/* == Check SSL certificate and security == */
async function checkVulnerability(url) {
	return new Promise((resolve) => {
		try {
			const urlObj = new URL(url);

			if (urlObj.protocol !== 'https:') {
				return resolve({secure: false, reason: 'Not using HTTPS', details: {}});
			}

			const options = {
				hostname: urlObj.hostname,
				port: 443,
				path: '/',
				method: 'HEAD',
				rejectUnauthorized: false, // ! Allow checking expired certs
			};

			const req = https.request(options, (res) => {
				const cert = res.socket.getPeerCertificate();

				if (!cert || Object.keys(cert).length === 0) {
					return resolve({secure: false, reason: 'No certificate found', details: {}});
				}

				const now = new Date();
				const validFrom = new Date(cert.valid_from);
				const validTo = new Date(cert.valid_to);
				const isValid = now >= validFrom && now <= validTo;

				resolve({
					secure: isValid && res.socket.authorized,
					reason: isValid
						? res.socket.authorized
							? 'Valid certificate'
							: 'Certificate not authorized'
						: 'Certificate expired or not yet valid',
					details: {
						issuer: cert.issuer ? cert.issuer.O : 'Unknown',
						validFrom: cert.valid_from,
						validTo: cert.valid_to,
						subject: cert.subject ? cert.subject.CN : 'Unknown',
						authorized: res.socket.authorized,
					},
				});
			});

			req.on('error', (err) => {
				resolve({secure: false, reason: err.message, details: {}});
			});

			req.setTimeout(5000, () => {
				req.destroy();
				resolve({secure: false, reason: 'Connection timeout', details: {}});
			});

			req.end();
		} catch (error) {
			resolve({secure: false, reason: error.message, details: {}});
		}
	});
}

/* == Display vulnerability check results == */
function displayResults(url, results) {
	terminal.printHeader(`Security Check: ${url}`);

	if (results.secure) {
		terminal.printSuccess('Website is secure');
	} else {
		terminal.printError('Website may not be secure');
		terminal.printWarn(`Reason: ${results.reason}`);
	}

	if (Object.keys(results.details).length > 0) {
		console.log('\n' + terminal.colors.white('Certificate Details:'));
		for (const [key, value] of Object.entries(results.details)) {
			console.log(`  ${terminal.colors.dim(key)}: ${terminal.colors.accent(value)}`);
		}
	}

	console.log('');
}

export {checkVulnerability, displayResults};
