/**
 * ☆=========================================☆
 * Terminal-Wowies.js - Interface, animations, colors, and normal terminal stuff.
 * ☆=========================================☆
 */

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import * as settings from './settings.js';

/* == Color pallete == */
function resolveAccentColor(value) {
	if (!value) return chalk.hex('#FF8C00');
	const s = String(value).trim().toLowerCase();
	// hex (with or without #)
	if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
		const hex = s.startsWith('#') ? s : `#${s}`;
		return chalk.hex(hex);
	}

	// == Map common names to hex to ensure consistent rendering across terminals
	const nameMap = {
		'purple': '#800080',
		'orange': '#ff8c00',
		'red': '#ff0000',
		'green': '#00aa00',
		'blue': '#0000ff',
		'yellow': '#ffff00',
		'cyan': '#00ffff',
		'magenta': '#ff00ff',
		'pink': '#ff69b4',
		'gray': '#808080',
		'grey': '#808080',
		'black': '#000000',
		'white': '#ffffff',
		'brown': '#8b4513',
	};
	if (nameMap[s]) return chalk.hex(nameMap[s]);

	// == fallback to chalk keyword if still wanted
	try {
		return chalk.keyword(s);
	} catch (e) {
		return chalk.hex('#FF8C00');
	}
}

const initialConfig = settings.loadConfig();
const colors = {
	accent: resolveAccentColor(initialConfig.accentColor),
	success: chalk.green,
	error: chalk.red,
	info: chalk.cyan,
	warn: chalk.yellow,
	dim: chalk.gray,
	bold: chalk.bold,
	white: chalk.white,
};

function setAccentColor(value) {
	colors.accent = resolveAccentColor(value);
}

function isValidAccentColor(value) {
	if (!value) return false;
	const s = String(value).trim();
	// ! hex (#RRGGBB or RRGGBB)
	if (/^#?[0-9a-fA-F]{6}$/.test(s)) return true;
	// ! simple keyword validation (letters and hyphen)
	if (/^[a-zA-Z\-]{2,30}$/.test(s)) return true;
	return false;
}

/* == Symbols == */
const symbols = {
	progress: '»',
	success: '+',
	error: '-',
	info: '*',
	warn: '!',
	download: '»',
	zip: '#',
	check: '$',
	pause: '/',
	arrow: '>',
	bullet: '&',
};

/* == Header/title thingy == */
function printHeader(text) {
	console.log('\n' + colors.accent.bold(text));
	console.log(colors.dim('='.repeat(text.length)));
}

/* == print success == */
function printSuccess(text) {
	console.log(colors.success(`${symbols.success} ${text}`));
}

/* == print error :( == */
function printError(text) {
	console.log(colors.error(`${symbols.error} ${text}`));
}

/* == print info == */
function printInfo(text) {
	console.log(colors.info(`${symbols.info} ${text}`));
}

/* == print warning == */
function printWarn(text) {
	console.log(colors.warn(`${symbols.warn} ${text}`));
}

/* == print dim text - aka: secondary text == */
function printDim(text) {
	console.log(colors.dim(text));
}

/* == print download status/state == */
function printDownloading(filename) {
	console.log(colors.accent(`${symbols.download} Downloading: `) + colors.white(filename));
}

/* == progress bar (stole code mueheheh) == */
function createProgressBar(format) {
	return new cliProgress.SingleBar({
		format: format || colors.accent(symbols.progress + ' {bar}') + ' {percentage}% | {value}/{total} | ETA: {eta}s',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
	});
}

/* == multi progressbar (multibar) - multiple downloads == */
function createMultiBar() {
	return new cliProgress.MultiBar(
		{
			format: colors.accent(symbols.progress + ' {filename}') + ' {bar} {percentage}% | {value}/{total}',
			barCompleteChar: '\u2588',
			barIncompleteChar: '\u2591',
			hideCursor: true,
			clearOnComplete: false,
			stopOnComplete: true,
		},
		cliProgress.Presets.shades_classic,
	);
}

/* == print summary == */
function printSummary(data) {
	console.log('\n' + colors.accent.bold('Download Summary'));
	console.log(colors.dim('─'.repeat(40)));
	for (const [key, value] of Object.entries(data)) {
		console.log(colors.white(`  ${key}: `) + colors.accent(value));
	}
	console.log(colors.dim('─'.repeat(40)) + '\n');
}

/* == print crazy symbols (yes, necessary) == */
function printCat(catContent) {
	console.log(colors.accent(catContent));
}

function printSheep(sheepContent) {
	console.log(colors.accent(sheepContent));
}

function printBee(beeContent) {
	console.log(colors.accent(beeContent));
}

/* == print commands == */
function printCommands() {
	printHeader('Downsrc - Available Commands');
	console.log(colors.white('\nBasic Usage:'));
	console.log(colors.accent('  downsrc <link>') + colors.dim(' - Download from a URL'));

	console.log(colors.white('\nFlags:'));
	const flags = [
		['-o', 'Open file after download'],
		['--tl <s>', 'Time limit in seconds'],
		['--hr', 'Generate HTML report'],
		['--hh', 'Host interactive HTML UI'],
		['-c', 'Check link accessibility'],
		['--ms <size>', 'Maximum file size in MB (skip)'],
		['--mss <size>', 'Maximum file size in MB (pause)'],
		['-z', 'Zip files after download'],
		['-d', 'Include debug.txt in zip'],
		['--dr', 'Download quality report'],
		['-v', 'Check vulnerabilities/certificates'],
		['-p <path>', 'Specify download path'],
		['--fe <ext>', 'Filter by file extension (e.g., "png & jpg")'],
		['--as <num>', 'Advanced scraping - follow N links'],
		['--debug-on', 'Enable debug mode'],
		['--debug-off', 'Disable debug mode'],
		['-y', 'Yes to everything'],
		['-n', 'No to everything'],
	];

	flags.forEach(([flag, desc]) => {
		console.log('  ' + colors.accent(flag.padEnd(15)) + colors.dim(desc));
	});

	console.log(colors.white('\nOther Commands:'));
	console.log('  ' + colors.accent('downsrc set <var> <value>') + colors.dim(' - Change settings'));
	console.log('  ' + colors.accent('downsrc action <def> <action>') + colors.dim(' - Manage actions'));
	console.log('  ' + colors.accent('downsrc run <action-name>') + colors.dim(' - Run action'));
	console.log('  ' + colors.accent('downsrc cat') + colors.dim(' - Display cat symbol'));
	console.log('  ' + colors.accent('downsrc sheep') + colors.dim(' - Display sheep symbol'));
	console.log('  ' + colors.accent('downsrc bee') + colors.dim(' - Display bee symbol'));
	console.log('  ' + colors.accent('downsrc details') + colors.dim(' - Package info'));
	console.log('  ' + colors.accent('downsrc help') + colors.dim(' - Show help with examples\n'));
}

/* == print help+examples == */
function printHelp() {
	printCommands();
	console.log(colors.accent.bold('Example Usage:'));
	console.log(colors.dim('  $ ') + colors.white('downsrc https://example.com/page'));
	console.log(colors.dim('    Downloads all resources from the page\n'));
}

/* == print package details == */
function printDetails() {
	printHeader('Downsrc (DownSource)');
	console.log(colors.white('  Created by: ') + colors.accent('m4iva (everm4iva)'));
	console.log(colors.white('  Version: ') + colors.accent('1.1.0'));
	console.log(colors.white('  GitHub: ') + colors.accent('github.com/everm4iva/downsrc'));
	console.log(colors.white('  Description: ') + colors.dim('"I just want to download my stuff ugh.."\n'));
}

export {
	colors,
	symbols,
	printHeader,
	printSuccess,
	printError,
	printInfo,
	printWarn,
	printDim,
	printDownloading,
	createProgressBar,
	createMultiBar,
	printSummary,
	printCat,
	printSheep,
	printBee,
	setAccentColor,
	isValidAccentColor,
	printCommands,
	printHelp,
	printDetails,
};
