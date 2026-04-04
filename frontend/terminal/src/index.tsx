import React from 'react';
import {render} from 'ink';

import {App} from './App.js';
import type {FrontendConfig} from './types.js';

// Prevent unhandled EIO/EAGAIN crashes when Ink enables stdin raw mode
process.stdin.on('error', (err: NodeJS.ErrnoException) => {
	if (err.code === 'EIO' || err.code === 'EAGAIN') {
		// Graceful exit — terminal I/O lost (SSH drop, PTY issue, etc.)
		process.exit(1);
	}
	throw err;
});

const config = JSON.parse(process.env.OPENHARNESS_FRONTEND_CONFIG ?? '{}') as FrontendConfig;

render(<App config={config} />);
