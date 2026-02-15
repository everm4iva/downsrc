/**
 * ☆=========================================☆
 * Timelimit.js - Sets time limits for certain operations in the service.
 * ☆=========================================☆
 */

/* == Create a timeout wrapper for a promiiee == */
function withTimeout(promise, timeoutMs, onTimeout) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			if (onTimeout) onTimeout();
			reject(new Error(`Operation timed out after ${timeoutMs}ms`));
		}, timeoutMs);

		promise
			.then((result) => {
				clearTimeout(timer);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timer);
				reject(error);
			});
	});
}

/* ==  Create an abortable donwload operatio == */
function createAbortable() {
	let aborted = false;
	let abortCallback = null;

	return {
		abort: () => {
			aborted = true;
			if (abortCallback) abortCallback();
		},
		isAborted: () => aborted,
		onAbort: (callback) => {
			abortCallback = callback;
		},
	};
}

export {withTimeout, createAbortable};
