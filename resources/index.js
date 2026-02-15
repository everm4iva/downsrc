/**
 * ☆=========================================☆
 * Index.js - Just imports a cute bridge :3
 * ☆=========================================☆
 */

import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import open from 'open';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ! Import modules
import * as terminal from './terminal-wowies.js';
import * as logic from './logic.js';
import * as fsUtils from './fs.js';
import * as debug from './debugger.js';
import * as settings from './settings.js';
import * as zipper from './commands/zipper.js';
import * as htmlgen from './commands/htmlgen.js';
import * as report from './commands/report.js';
import * as checkVul from './commands/check-vul.js';
import * as actions from './commands/actions.js';
import * as timelimit from './commands/timelimit.js';
import * as server from './server.js';

/* == main Point == */
async function run(args) {
	const argv = minimist(args, {
		string: ['tl', 'ms', 'mss', 'p', 'fe', 'as'],
		boolean: ['o', 'hr', 'hh', 'c', 'z', 'd', 'dr', 'v', 'y', 'n', 'debug-on', 'debug-off'],
		alias: {
			o: 'open',
			tl: 'timelimit',
			hr: 'html-report',
			hh: 'html-host',
			c: 'check',
			ms: 'max-size',
			mss: 'max-size-pause',
			z: 'zip',
			d: 'debug-zip',
			dr: 'download-report',
			v: 'vulnerable',
			p: 'path',
			y: 'yes',
			n: 'no',
			fe: 'file-extension',
			as: 'advanced-scraping',
		},
	});

	// ! Enable/disable debug mode
	if (argv['debug-on']) {
		debug.enableDebug();
		terminal.printSuccess('Debug mode enabled');
		process.exit(0);
	}

	if (argv['debug-off']) {
		debug.disableDebug();
		terminal.printSuccess('Debug mode disabled');
		process.exit(0);
	}

	const command = argv._[0];

	// ! Handle special commands
	if (!command || command === 'help') {
		terminal.printHelp();
		process.exit(0);
	}

	if (command === 'commands') {
		terminal.printCommands();
		process.exit(0);
	}

	if (command === 'details') {
		terminal.printDetails();
		process.exit(0);
	}

	if (command === 'cat') {
		const symbolsDir = path.join(__dirname, 'symbols');
		let catFiles = [];
		try {
			catFiles = fs.readdirSync(symbolsDir).filter((f) => /^cat.*\.txt$/i.test(f));
		} catch (e) {
			catFiles = [];
		}

		if (catFiles.length === 0) {
			const catPath = path.join(symbolsDir, 'cat.txt');
			if (fs.existsSync(catPath)) {
				const catContent = fs.readFileSync(catPath, 'utf8');
				terminal.printCat(catContent);
				process.exit(0);
			}
			terminal.printError('Cat symbol not found');
			process.exit(1);
		}

		const chosen = catFiles[Math.floor(Math.random() * catFiles.length)];
		const catPath = path.join(symbolsDir, chosen);
		const catContent = fs.readFileSync(catPath, 'utf8');
		terminal.printCat(catContent);
		process.exit(0);
	}

	/* ########## */
	if (command === 'sheep') {
		const symbolsDir = path.join(__dirname, 'symbols');
		let sheepFiles = [];
		try {
			sheepFiles = fs.readdirSync(symbolsDir).filter((f) => /^sheep.*\.txt$/i.test(f));
		} catch (e) {
			sheepFiles = [];
		}

		if (sheepFiles.length === 0) {
			const sheepPath = path.join(symbolsDir, 'sheep.txt');
			if (fs.existsSync(sheepPath)) {
				const sheepContent = fs.readFileSync(sheepPath, 'utf8');
				terminal.printSheep(sheepContent);
				process.exit(0);
			}
			terminal.printError('Sheep symbol not found');
			process.exit(1);
		}

		const chosen = sheepFiles[Math.floor(Math.random() * sheepFiles.length)];
		const sheepPath = path.join(symbolsDir, chosen);
		const sheepContent = fs.readFileSync(sheepPath, 'utf8');
		terminal.printSheep(sheepContent);
		process.exit(0);
	}

	/* ########## */
	if (command === 'bee') {
		const symbolsDir = path.join(__dirname, 'symbols');
		let beeFiles = [];
		try {
			beeFiles = fs.readdirSync(symbolsDir).filter((f) => /^bee.*\.txt$/i.test(f));
		} catch (e) {
			beeFiles = [];
		}

		if (beeFiles.length === 0) {
			const beePath = path.join(symbolsDir, 'bee.txt');
			if (fs.existsSync(beePath)) {
				const beeContent = fs.readFileSync(beePath, 'utf8');
				terminal.printBee(beeContent);
				process.exit(0);
			}
			terminal.printError('Bee symbol not found');
			process.exit(1);
		}

		const chosen = beeFiles[Math.floor(Math.random() * beeFiles.length)];
		const beePath = path.join(symbolsDir, chosen);
		const beeContent = fs.readFileSync(beePath, 'utf8');
		terminal.printBee(beeContent);
		process.exit(0);
	}

	/* ########## */
	// ! Handle settings command: downsrc set <var> <value>
	if (command === 'set') {
		const key = argv._[1];
		const value = argv._[2];

		// == Interactive mode when no args are provided
		if (!key && value === undefined) {
			const config = settings.loadConfig();
			const keys = Object.keys(config);

			const pick = await prompts({
				type: 'select',
				name: 'key',
				message: 'Select setting to change',
				choices: keys.map((k) => ({title: `${k} — ${JSON.stringify(config[k])}`, value: k})),
			});

			if (!pick.key) {
				terminal.printInfo('Cancelled');
				process.exit(0);
			}

			let parsedValue;

			if (pick.key === 'accentColor') {
				// == keep prompting until valid or cancelled
				while (true) {
					const resp = await prompts({
						type: 'text',
						name: 'value',
						message: `New value for ${pick.key} (hex #RRGGBB or name)`,
						initial: String(config[pick.key]),
					});

					if (resp.value === undefined) {
						terminal.printInfo('Cancelled');
						process.exit(0);
					}

					parsedValue = resp.value.trim();

					// == validate
					if (!terminal.isValidAccentColor(parsedValue)) {
						terminal.printError('Invalid color. Use hex (#RRGGBB) or a simple color name (e.g. purple).');
						continue; // == re-prompt
					}

					terminal.setAccentColor(parsedValue);
					terminal.printInfo('Preview:');
					console.log('  ' + terminal.colors.accent('This is the accent color preview') + '  ' + parsedValue);

					const ok = await prompts({
						type: 'confirm',
						name: 'yes',
						message: 'Save this color?',
						initial: true,
					});
					if (!ok.yes) {
						terminal.printInfo('Cancelled');
						process.exit(0);
					}

					break;
				}
			} else {
				const resp = await prompts({
					type: 'text',
					name: 'value',
					message: `New value for ${pick.key}`,
					initial: String(config[pick.key]),
				});

				if (resp.value === undefined) {
					terminal.printInfo('Cancelled');
					process.exit(0);
				}

				parsedValue = resp.value;
				const currentType = typeof config[pick.key];
				if (currentType === 'number') {
					const n = Number(parsedValue);
					parsedValue = isNaN(n) ? parsedValue : n;
				} else if (currentType === 'boolean') {
					if (String(parsedValue).toLowerCase() === 'true') parsedValue = true;
					else if (String(parsedValue).toLowerCase() === 'false') parsedValue = false;
					else parsedValue = Boolean(parsedValue);
				}
			}

			if (settings.setSetting(pick.key, parsedValue)) {
				if (pick.key === 'accentColor') terminal.setAccentColor(parsedValue);
				terminal.printSuccess(`Set ${pick.key} = ${parsedValue}`);
				process.exit(0);
			} else {
				terminal.printError('Failed to save settings');
				process.exit(1);
			}
		}

		// == Non-interactive usage validation
		if (!key || value === undefined) {
			terminal.printError('Usage: downsrc set <var> <value> - run just "downsrc set" for interactive mode');
			process.exit(1);
		}

		// == If changing accentColor, validate and show preview
		if (key === 'accentColor') {
			if (!terminal.isValidAccentColor(value)) {
				terminal.printError('Invalid color. Use hex (#RRGGBB) or a simple color name (e.g. purple).');
				process.exit(1);
			}

			// == apply preview in this process
			terminal.setAccentColor(value);
			terminal.printInfo('Preview:');
			console.log('  ' + terminal.colors.accent('This is the accent color preview') + '  ' + value);
		}

		if (settings.setSetting(key, value)) {
			if (key === 'accentColor') terminal.setAccentColor(value);
			terminal.printSuccess(`Set ${key} = ${value}`);
			process.exit(0);
		} else {
			terminal.printError('Failed to save settings');
			process.exit(1);
		}
	}

	// ! Handle action commands
	if (command === 'action') {
		const def = argv._[1]; // ! add, remove, list
		const actionName = argv._[2];
		const actionCommand = argv._[3];

		// == Interactive menu when no subcommand provided
		let mode = def;
		if (!mode) {
			const pick = await prompts({
				type: 'select',
				name: 'mode',
				message: 'Action - choose operation',
				choices: [
					{title: 'List actions', value: 'list'},
					{title: 'Add action', value: 'add'},
					{title: 'Remove action', value: 'remove'},
				],
			});
			mode = pick.mode;
			if (!mode) {
				terminal.printInfo('Cancelled');
				process.exit(0);
			}
		}

		if (mode === 'list') {
			actions.listActions();
			process.exit(0);
		} else if (mode === 'add') {
			let name = actionName;
			let cmd = actionCommand;
			if (!name || !cmd) {
				const resp = await prompts([
					{type: 'text', name: 'name', message: 'Action name:'},
					{type: 'text', name: 'command', message: 'Shell command to run:'},
				]);
				name = name || resp.name;
				cmd = cmd || resp.command;
			}

			if (!name || !cmd) {
				terminal.printError(
					'Usage: downsrc action add <name> <command> - run just "downsrc action" for interactive mode',
				);
				process.exit(1);
			}
			if (settings.setAction(name, cmd)) {
				terminal.printSuccess(`Action '${name}' added`);
				process.exit(0);
			} else {
				terminal.printError('Failed to save action');
				process.exit(1);
			}
		} else if (mode === 'remove') {
			let name = actionName;
			if (!name) {
				const all = settings.loadActions();
				if (all.length === 0) {
					terminal.printInfo('No actions defined');
					process.exit(0);
				}
				const resp = await prompts({
					type: 'select',
					name: 'name',
					message: 'Select action to remove',
					choices: all.map((a) => ({title: `${a.name} — ${a.command}`, value: a.name})),
				});
				name = resp.name;
			}
			if (!name) {
				terminal.printError(
					'Usage: downsrc action remove <name> - run just "downsrc action" for interactive mode',
				);
				process.exit(1);
			}
			if (settings.removeAction(name)) {
				terminal.printSuccess(`Action '${name}' removed`);
				process.exit(0);
			} else {
				terminal.printError('Failed to remove action');
				process.exit(1);
			}
		}
	}

	// ! Handle run action command
	if (command === 'run') {
		const actionName = argv._[1];
		if (!actionName) {
			terminal.printError('Usage: downsrc run <action-name> - run just "downsrc run" for interactive mode');
			process.exit(1);
		}
		await actions.runAction(actionName);
		process.exit(0);
	}

	// ! Handle URL download
	const url = command;

	if (!url || !url.match(/^https?:\/\//i)) {
		terminal.printError('Invalid URL. Must start with http:// or https://');
		terminal.printInfo('Use "downsrc help" for usage information');
		process.exit(1);
	}

	// ! Check vulnerability flag
	if (argv.v || argv.vulnerable) {
		const results = await checkVul.checkVulnerability(url);
		checkVul.displayResults(url, results);
		process.exit(0);
	}

	// ! Check accessibility flag
	if (argv.c || argv.check) {
		terminal.printInfo('Checking URL accessibility...');
		const result = await logic.checkUrl(url);
		if (result.accessible) {
			terminal.printSuccess(`URL is accessible (Status: ${result.statusCode})`);
			process.exit(0);
		} else {
			terminal.printError(`URL is not accessible (Status: ${result.statusCode})`);
			process.exit(1);
		}
	}

	// ! Prepare download options
	const options = {
		yes: argv.y || argv.yes,
		no: argv.n || argv.no,
		path: argv.p || argv.path,
		maxSize: argv.ms || argv['max-size'],
		maxSizePause: argv.mss || argv['max-size-pause'],
		timeLimit: argv.tl || argv.timelimit,
		fileExtension: argv.fe || argv['file-extension'],
		DeepScraping: argv.as || argv['Deep-scraping'],
	};

	// ! Debug: Show parsed options
	if (options.fileExtension) {
		terminal.printInfo(`File extension filter: ${options.fileExtension}`);
	}
	if (options.DeepScraping !== undefined) {
		terminal.printInfo(`Deep scraping: ${options.DeepScraping}`);
	}

	// ! Start server if -hh flag
	let serverPort = null;
	if (argv.hh || argv['html-host']) {
		terminal.printInfo('Starting web server...');
		try {
			serverPort = await server.startServer();
			terminal.printSuccess(`Server running at http://localhost:${serverPort}`);
			await server.openBrowser(serverPort);
			terminal.printInfo('Download will be visible in browser');
		} catch (error) {
			terminal.printError('Failed to start server: ' + error.message);
			return;
		}
	}

	try {
		terminal.printHeader(`Downsrc - Downloading from ${url}`);

		// ! Download with optional time limit
		let downloadPromise = logic.downloadFromUrl(url, options);

		if (options.timeLimit) {
			const timeMs = parseInt(options.timeLimit) * 1000;
			terminal.printWarn(`Time limit: ${options.timeLimit}s`);
			downloadPromise = timelimit.withTimeout(downloadPromise, timeMs, () => {
				terminal.printError('Download cancelled: time limit exceeded');
			});
		}

		const result = await downloadPromise;
		const stats = debug.finalizeStats(result.stats);

		// == Display summary
		terminal.printSummary(debug.formatStats(stats));

		// == Generate quality report if requested
		if (argv.dr || argv['download-report']) {
			report.generateQualityReport(stats);
		}

		// ! Zip files if requested, if default setting, or if multiple files downloaded
		const config = settings.loadConfig();
		const shouldZip = argv.z || argv.zip || config.defaultZipAfterDownload || result.isMultiFile;

		let finalPath = result.outputPath;

		if (shouldZip) {
			terminal.printInfo('Creating zip file...');

			const zipOptions = {};
			if (argv.d || argv['debug-zip']) {
				zipOptions.includeDebug = true;
				zipOptions.debugContent = debug.getAllLogs();
			}

			// ! Extract website name from URL for the zip filename
			let websiteName = 'download';
			try {
				const urlObj = new URL(url);
				const hostname = urlObj.hostname.replace(/^www\./, '');

				// == Get path and sanitize it (replace slashes with dots)
				let pathName = urlObj.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '.');

				// == If path is epty, use 'home' or just the hostname
				if (pathName) {
					websiteName = `${hostname}.${pathName}`;
				} else {
					websiteName = hostname;
				}
			} catch (e) {}

			const zipName = `${websiteName}.zip`;
			let zipPath;

			// ==  If path is specified with -p flag, use that directory
			if (options.path) {
				zipPath = path.join(options.path, zipName);
				// == Make sure we have a unique filename to prevent da overwriting
				zipPath = fsUtils.getUniqueFilename(zipPath);
			} else {
				// == No path specified - prompt user for save location
				const defaultPath = path.join(process.cwd(), zipName);
				const userPath = await fsUtils.promptSaveLocation(zipName);
				zipPath = userPath || defaultPath;
			}

			await zipper.zipFiles(result.outputPath, zipPath, zipOptions);
			terminal.printSuccess(`Saved: ${zipPath}`);
			finalPath = zipPath;

			// == Clean up temp directory
			if (result.outputPath.includes('.downsrc_temp')) {
				fsUtils.deleteDirectory(result.outputPath);
			}
		}

		// == Generate HTML report if requested
		if (argv.hr || argv['html-report']) {
			const reportHtml = htmlgen.generateReport(stats);
			const reportPath = path.join(process.cwd(), `downsrc_report_${Date.now()}.html`);
			htmlgen.saveReport(reportHtml, reportPath);
			terminal.printSuccess(`HTML report saved: ${reportPath}`);
		}

		// == Open file if requested
		if (argv.o || argv.open) {
			terminal.printInfo('Opening file...');
			await open(finalPath);
		}

		// == Prompt for save location if not specified
		if (!options.path && !shouldZip) {
			const savePath = await fsUtils.promptSaveLocation(path.basename(finalPath));
			if (savePath) {
				fs.renameSync(finalPath, savePath);
				terminal.printSuccess(`Saved to: ${savePath}`);
			}
		}

		terminal.printSuccess('Download complete!');
	} catch (error) {
		terminal.printError('Download failed: ' + error.message);
		debug.logError(error, 'Main download process');
		process.exit(1);
	} finally {
		// == Stop server if it was started
		if (serverPort) {
			await server.stopServer();
			terminal.printInfo('Server stopped');
		}
		// == Exit cleanly after download completes
		process.exit(0);
	}
}

export {run};
