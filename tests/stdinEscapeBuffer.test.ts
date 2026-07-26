// Unit tests for reassembling split ANSI escape sequences from stdin
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: MIT

import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { EventEmitter } from 'events';
import { StdinEscapeBuffer } from '../src/stdinEscapeBuffer.js';

const createFakeSource = () => {
	const emitter = new EventEmitter() as EventEmitter & Partial<NodeJS.ReadStream>;
	emitter.isTTY = true;
	emitter.setRawMode = jest.fn();
	emitter.ref = jest.fn();
	emitter.unref = jest.fn();
	return emitter as EventEmitter &
		Pick<NodeJS.ReadStream, 'isTTY' | 'setRawMode' | 'ref' | 'unref'>;
};

const readAllChunks = (stream: StdinEscapeBuffer): Buffer[] => {
	const chunks: Buffer[] = [];
	let chunk;
	while ((chunk = stream.read()) !== null) {
		chunks.push(chunk);
	}
	return chunks;
};

describe('StdinEscapeBuffer', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	it('forwards non-escape input immediately', () => {
		const source = createFakeSource();
		const stdin = new StdinEscapeBuffer(source, 50);
		stdin.setRawMode(true);

		source.emit('data', Buffer.from('j'));

		expect(readAllChunks(stdin)).toEqual([Buffer.from('j')]);
	});

	it('reassembles an escape sequence split across two reads', () => {
		jest.useFakeTimers();
		const source = createFakeSource();
		const stdin = new StdinEscapeBuffer(source, 50);
		stdin.setRawMode(true);

		source.emit('data', Buffer.from([0x1b]));
		expect(readAllChunks(stdin)).toEqual([]); // held, not yet forwarded

		jest.advanceTimersByTime(10);
		source.emit('data', Buffer.from('[C'));

		expect(readAllChunks(stdin)).toEqual([Buffer.from('\x1b[C')]);
	});

	it('flushes a lone escape byte as a real Escape keypress after the hold window', () => {
		jest.useFakeTimers();
		const source = createFakeSource();
		const stdin = new StdinEscapeBuffer(source, 50);
		stdin.setRawMode(true);

		source.emit('data', Buffer.from([0x1b]));
		expect(readAllChunks(stdin)).toEqual([]);

		jest.advanceTimersByTime(50);

		expect(readAllChunks(stdin)).toEqual([Buffer.from([0x1b])]);
	});

	it('flushes a pending escape byte immediately when raw mode is disabled', () => {
		jest.useFakeTimers();
		const source = createFakeSource();
		const stdin = new StdinEscapeBuffer(source, 50);
		stdin.setRawMode(true);

		source.emit('data', Buffer.from([0x1b]));
		stdin.setRawMode(false);

		expect(readAllChunks(stdin)).toEqual([Buffer.from([0x1b])]);
		expect(source.setRawMode).toHaveBeenCalledWith(false);
	});

	it('proxies isTTY, ref, and unref to the underlying source', () => {
		const source = createFakeSource();
		const stdin = new StdinEscapeBuffer(source, 50);

		expect(stdin.isTTY).toBe(true);
		stdin.ref();
		stdin.unref();

		expect(source.ref).toHaveBeenCalled();
		expect(source.unref).toHaveBeenCalled();
	});
});
