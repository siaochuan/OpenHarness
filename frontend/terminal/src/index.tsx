import React from 'react';
import {render} from 'ink';

import {App} from './App.js';
import type {FrontendConfig} from './types.js';

// Guard against EIO crashes in both stdin reads and setRawMode calls.
// Ink's React reconciler calls setRawMode during mount/unmount which can
// throw EIO in certain terminal environments (SSH, tmux, Docker).
process.stdin.on('error', (err: NodeJS.ErrnoException) => {
	if (err.code === 'EIO' || err.code === 'EAGAIN') {
		process.exit(1);
	}
	throw err;
});

if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
	const origSetRawMode = process.stdin.setRawMode.bind(process.stdin);
	process.stdin.setRawMode = (mode: boolean) => {
		try {
			return origSetRawMode(mode);
		} catch (err: any) {
			if (err?.code === 'EIO' || err?.code === 'EAGAIN') {
				// TTY lost — exit gracefully instead of crashing
				process.exit(1);
			}
			throw err;
		}
	};
}

// Global fallback for any uncaught EIO from React reconciler internals
process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
	if (err.code === 'EIO' || err.code === 'EAGAIN') {
		process.exit(1);
	}
	throw err;
});

const config = JSON.parse(process.env.OPENHARNESS_FRONTEND_CONFIG ?? '{}') as FrontendConfig;

render(<App config={config} />);
