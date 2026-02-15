/**
 * ☆=========================================☆
 * Server.js - The server for the service, handles requests and responses.
 * Normally not used. If not used a command to host a website or another service wants to use, then stays closed.
 * ☆=========================================☆
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import open from 'open';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server = null;
let downloadStats = null;


/* == Start server == */
function startServer(port = 12321) {
	return new Promise((resolve, reject) => {
		downloadStats = {status: 'starting', progress: 0, currentFile: '', stats: {}};

		server = http.createServer((req, res) => {
			// == Serve index file
			if (req.url === '/' || req.url === '/index.html') {
				const htmlPath = path.join(__dirname, 'html', 'index.html');
				const html = fs.readFileSync(htmlPath, 'utf8');
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(html);
			}
			// == Serve CSS
			else if (req.url === '/root.css') {
				const cssPath = path.join(__dirname, 'html', 'root.css');
				const css = fs.readFileSync(cssPath, 'utf8');
				res.writeHead(200, {'Content-Type': 'text/css'});
				res.end(css);
			}
			// == Serve JavaScript
			else if (req.url === '/script.js') {
				const jsPath = path.join(__dirname, 'html', 'script.js');
				const js = fs.readFileSync(jsPath, 'utf8');
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.end(js);
			}
			// == API endpoint for download status
			else if (req.url === '/api/status') {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(downloadStats));
			}
			// == 404 RAWWWHHHHR
			else {
				res.writeHead(404);
				res.end('Not Found. Umhum.. Nothing to see here, move on.');
			}
		});

		server.on('error', reject);

		server.listen(port, () => {
			resolve(port);
		});
	});
}

/* == Stop the server == */
function stopServer() {
	return new Promise((resolve) => {
		if (server) {
			server.close(() => {
				server = null;
				resolve();
			});
		} else {
			resolve();
		}
	});
}

/* == Update download stats == */
function updateStats(stats) {
	if (downloadStats) {
		downloadStats.status = stats.status || 'downloading';
		downloadStats.progress = stats.progress || 0;
		downloadStats.currentFile = stats.currentFile || '';
		downloadStats.stats = stats.stats || {};
	}
}

/* == Open browser to server URL == */
async function openBrowser(port) {
	try {
		await open(`http://localhost:${port}`);
		return true;
	} catch (error) {
		console.error('Error opening browser:', error.message);
		return false;
	}
}

export {startServer, stopServer, updateStats, openBrowser};
