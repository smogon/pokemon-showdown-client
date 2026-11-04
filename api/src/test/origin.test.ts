import { strict as assert } from 'node:assert';
import { IncomingMessage, ServerResponse, type IncomingHttpHeaders } from 'node:http';
import { Socket } from 'node:net';
import { TLSSocket } from 'node:tls';
import { test } from 'node:test';

import { OAuth } from '../oauth.ts';
import { ActionContext } from '../server.ts';

function sameOrigin(headers: IncomingHttpHeaders, tls = false, remoteAddress = '192.0.2.1') {
	const socket = tls ? new TLSSocket(new Socket()) : new Socket();
	Object.defineProperty(socket, 'remoteAddress', { value: remoteAddress });
	const request = new IncomingMessage(socket);
	request.headers = headers;
	const context = new ActionContext(request, new ServerResponse(request), { act: '' });
	try {
		return OAuth.isSameOriginRequest(context);
	} finally {
		socket.destroy();
	}
}

void test('origin fallback compares scheme, host, and port', () => {
	assert(sameOrigin({ host: 'login.example', origin: 'http://login.example' }));
	assert(sameOrigin({ host: 'login.example', origin: 'https://login.example' }, true));
	assert(sameOrigin({ host: 'LOGIN.EXAMPLE:443', origin: 'https://login.example' }, true));
	assert(sameOrigin({ host: 'login.example:80', origin: 'http://login.example' }));
	assert(!sameOrigin({ host: 'login.example', origin: 'https://login.example' }));
	assert(!sameOrigin({ host: 'login.example', origin: 'http://login.example' }, true));
	assert(!sameOrigin({ host: 'login.example', origin: 'https://other.example' }, true));
	assert(!sameOrigin({ host: 'login.example:8443', origin: 'https://login.example' }, true));
	assert(!sameOrigin({ host: 'login.example', origin: 'https://login.example:8443' }, true));
});

void test('explicit Fetch Metadata cannot fall back to a matching host', () => {
	for (const site of ['same-site', 'cross-site', 'none', '']) {
		assert(!sameOrigin({
			host: 'login.example', origin: 'https://login.example', 'sec-fetch-site': site,
		}, true), site);
	}
	assert(sameOrigin({
		host: 'internal.example:8000', origin: 'https://login.example', 'sec-fetch-site': 'same-origin',
	}));
	assert(!sameOrigin({ host: 'login.example', 'sec-fetch-site': 'same-origin' }));
});

void test('origin fallback uses forwarding headers only from a trusted proxy', () => {
	const headers = {
		host: 'internal.example:8000', origin: 'https://login.example',
		'x-forwarded-host': 'login.example:443', 'x-forwarded-proto': 'https',
	};
	assert(sameOrigin(headers, false, '127.0.0.1'));
	assert(!sameOrigin(headers));
	assert(!sameOrigin({ ...headers, origin: 'http://login.example' }, false, '127.0.0.1'));
	assert(sameOrigin({
		host: 'login.example', origin: 'https://login.example', 'x-forwarded-proto': 'https',
	}, false, '127.0.0.1'));
	// Untrusted headers must not change the directly observed target origin.
	assert(sameOrigin({ ...headers, origin: 'http://internal.example:8000' }));
});

void test('origin fallback rejects missing, opaque, malformed, and ambiguous values', () => {
	assert(!sameOrigin({ origin: 'http://login.example' }));
	for (const origin of [undefined, 'null', 'not a URL', 'file://login.example']) {
		assert(!sameOrigin({ host: 'login.example', origin }));
	}
	for (const protocol of ['https,http', 'ftp', ['https', 'http']]) {
		assert(!sameOrigin({
			host: 'login.example', origin: 'https://login.example', 'x-forwarded-proto': protocol,
		}, false, '127.0.0.1'));
	}
	for (const host of ['login.example, other.example', ['login.example', 'other.example']]) {
		assert(!sameOrigin({
			host: 'login.example', origin: 'https://login.example',
			'x-forwarded-proto': 'https', 'x-forwarded-host': host,
		}, false, '127.0.0.1'));
	}
});
