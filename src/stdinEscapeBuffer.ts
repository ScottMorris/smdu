// Reassemble split ANSI escape sequences from stdin before Ink parses them
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: MIT

import { Readable } from 'stream';

const ESCAPE_BYTE = 0x1b;

/**
 * Terminal input can deliver a multi-byte escape sequence (e.g. the right arrow
 * key's `\x1b[C`) split across separate reads under real-world conditions such as
 * SSH/tmux/mosh latency. Ink's keypress parser treats a lone `\x1b` byte as a
 * standalone Escape keypress with no way to know more bytes are coming, which
 * causes bound actions (e.g. quit-on-escape) to fire on what was actually the
 * start of an arrow key. This stream holds a lone leading escape byte briefly to
 * see whether the rest of the sequence arrives, then forwards the reassembled
 * chunk to whatever reads from it.
 */
export class StdinEscapeBuffer extends Readable {
	private pendingEscape: Buffer | null = null;
	private flushTimer: NodeJS.Timeout | null = null;

	constructor(
		private readonly source: NodeJS.ReadStream,
		private readonly holdMs = 50,
	) {
		super();
	}

	private readonly onData = (chunk: Buffer | string): void => {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

		if (this.pendingEscape) {
			const combined = Buffer.concat([this.pendingEscape, buffer]);
			this.clearPending();
			this.push(combined);
			return;
		}

		if (buffer.length === 1 && buffer[0] === ESCAPE_BYTE) {
			this.pendingEscape = buffer;
			this.flushTimer = setTimeout(() => this.flushPending(), this.holdMs);
			return;
		}

		this.push(buffer);
	};

	private flushPending(): void {
		if (this.pendingEscape) {
			this.push(this.pendingEscape);
		}
		this.clearPending();
	}

	private clearPending(): void {
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
		}
		this.flushTimer = null;
		this.pendingEscape = null;
	}

	override _read(): void {
		// No-op: data is pushed as it arrives from `onData`.
	}

	get isTTY(): boolean | undefined {
		return this.source.isTTY;
	}

	setRawMode(mode: boolean): this {
		this.source.setRawMode?.(mode);
		if (mode) {
			this.source.on('data', this.onData);
		} else {
			this.source.removeListener('data', this.onData);
			this.flushPending();
		}
		return this;
	}

	ref(): this {
		this.source.ref?.();
		return this;
	}

	unref(): this {
		this.source.unref?.();
		return this;
	}
}
