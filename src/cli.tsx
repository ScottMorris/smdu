#!/usr/bin/env node
// CLI entrypoint that parses options and renders the Ink app
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: MIT

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './App.js';
import { VERSION } from './version.js';
import { StdinEscapeBuffer } from './stdinEscapeBuffer.js';

const program = new Command();

program
	.name('smdu')
	.description('See My Disk Usage - A clone of ncdu')
	.version(VERSION, '-v, --version')
	.argument('[paths...]', 'Path to scan')
	.option('-t, --theme <theme>', 'Theme (default, classic, dracula)')
	.option('-u, --units <units>', 'Display units (iec, si)')
	.option('--no-fullscreen', 'Do not use alternate screen buffer')
	.action((paths: string[], options) => {
		const startPaths = paths.length > 0 ? paths : [process.cwd()];

		const useFullscreen = options.fullscreen !== false;
		const hasTty = process.stdout.isTTY;
		const shouldUseAltBuffer = useFullscreen && hasTty;

		if (shouldUseAltBuffer) {
			process.stdout.write('\u001b[?1049h');
		}

		const handleSuspend = () => {
			if (shouldUseAltBuffer) {
				process.stdout.write('\u001b[?1049l');
			}
			process.stdin.setRawMode?.(false);
			process.kill(process.pid, 'SIGTSTP');
		};

		process.on('SIGCONT', () => {
			process.stdin.setRawMode?.(true);
			process.stdin.resume();
			if (shouldUseAltBuffer) {
				process.stdout.write('\u001b[?1049h');
			}
		});

		const instance = render(
			<App
				startPaths={startPaths}
				themeName={options.theme}
				units={options.units}
				onSuspend={handleSuspend}
			/>,
			{ stdin: new StdinEscapeBuffer(process.stdin) as unknown as NodeJS.ReadStream },
		);

		if (shouldUseAltBuffer) {
			const restoreAltBuffer = () => {
				process.stdout.write('\u001b[?1049l');
			};

			instance.waitUntilExit().then(restoreAltBuffer);
			process.once('exit', restoreAltBuffer);
		}
	});

program.parse(process.argv);
