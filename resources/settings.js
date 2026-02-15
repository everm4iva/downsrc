/**
 * ☆=========================================☆
 * Settings.js - Settings of the project!
 * Handles the settings for the service, such as configuration and options.
 * All connected to the .json files
 * ☆=========================================☆
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COOLSHITS_PATH = path.join(__dirname, 'coolshits.json');
const ACTIONS_PATH = path.join(__dirname, 'actions.json');


/* == Load good looking config file name == */
function loadConfig() {
	try {
		const data = fs.readFileSync(COOLSHITS_PATH, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error loading coolshits.json:', error.message);
		return getDefaultConfig();
	}
}

/* == Save good looking config file name configuration == */
function saveConfig(config) {
	try {
		fs.writeFileSync(COOLSHITS_PATH, JSON.stringify(config, null, '\t'), 'utf8');
		return true;
	} catch (error) {
		console.error('Error saving coolshits.json:', error.message);
		return false;
	}
}

/* == Get a specific setting value == */
function getSetting(key) {
	const config = loadConfig();
	return config[key];
}

/* == Set a specific setting value == */
function setSetting(key, value) {
	const config = loadConfig();
	config[key] = value;
	return saveConfig(config);
}

/* == Get default configuration == */
function getDefaultConfig() {
	return {
		accentColor: 'orange',
		symbolsPath: './resources/symbols',
		defaultDownloadDir: './downloads',
		showProgress: true,
		maxConcurrentDownloads: 3,
		defaultZipAfterDownload: false,
	};
}


/* ==  Load actions.json == */
function loadActions() {
	try {
		const data = fs.readFileSync(ACTIONS_PATH, 'utf8');
		const parsed = JSON.parse(data);
		return parsed.actions || [];
	} catch (error) {
		// If file is empty or invalid, return absolutely nothing
		console.error('Error loading actions.json:', error.message);
		return [];
	}
}

/* ==  Save actions.json == */
function saveActions(actions) {
	try {
		fs.writeFileSync(ACTIONS_PATH, JSON.stringify({actions}, null, '\t'), 'utf8');
		return true;
	} catch (error) {
		console.error('Error saving actions.json:', error.message);
		return false;
	}
}

/* ==  Get a specific action by name == */
function getAction(name) {
	const actions = loadActions();
	return actions.find((action) => action.name === name);
}

/* == Add or update an action == */
function setAction(name, command) {
	const actions = loadActions();
	const existingIndex = actions.findIndex((action) => action.name === name);

	if (existingIndex >= 0) {
		actions[existingIndex].command = command;
	} else {
		actions.push({name, command});
	}

	return saveActions(actions);
}

/* == Remove an action == */
function removeAction(name) {
	const actions = loadActions();
	const filtered = actions.filter((action) => action.name !== name);
	return saveActions(filtered);
}

/* == List all actions == */
function listActions() {
	return loadActions();
}

export {
	loadConfig, saveConfig, getSetting, setSetting,
	getDefaultConfig, loadActions, saveActions, getAction,
	setAction, removeAction, listActions,
};
