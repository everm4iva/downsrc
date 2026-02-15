/**
 * ☆=========================================☆
 * Actions.js - Set quick automatic actions for the service.
 * ☆=========================================☆
 */

import {exec} from 'child_process';
import * as terminal from '../terminal-wowies.js';
import * as settings from '../settings.js';

/* == Run a custom action == */
async function runAction(actionName) {
	const action = settings.getAction(actionName);

	if (!action) {
		terminal.printError(`Action '${actionName}' not found`);
		return false;
	}

	terminal.printInfo(`Running action: ${actionName}`);
	terminal.printDim(`Command: ${action.command}`);

	return new Promise((resolve) => {
		exec(action.command, (error, stdout, stderr) => {
			if (error) {
				terminal.printError(`Action failed: ${error.message}`);
				resolve(false);
				return;
			}

			if (stdout) console.log(stdout);
			if (stderr) console.error(stderr);

			terminal.printSuccess('Action completed');
			resolve(true);
		});
	});
}

/* == List all actions == */
function listActions() {
	const actions = settings.listActions();

	if (actions.length === 0) {
		terminal.printInfo('No actions defined');
		return;
	}

	terminal.printHeader('Custom Actions');
	actions.forEach((action) => {
		console.log(terminal.colors.accent(`  ${action.name}`) + terminal.colors.dim(` - ${action.command}`));
	});
	console.log('');
}

export {runAction, listActions};
