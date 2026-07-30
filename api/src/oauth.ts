/**
 * Code for managing OAuth clients and tokens.
 *
 * @author mia-pi-git, Zarel
 */
import { readFileSync } from 'node:fs';
import * as crypto from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';
import * as url from 'node:url';

import { ActionError } from './server.ts';
import * as tables from './tables.ts';
import { escapeHTML } from './utils.ts';

export type OAuthClient = {
	owner: string,
	client_title: string,
	id: string,
	origin_url: string,
};

export const OAuth = new class {
	readonly tokenTime = 14 * 24 * 60 * 60 * 1000;
	// intentionally not documented; I don't really want consumers relying on it
	readonly refreshGraceTime = 7 * 24 * 60 * 60 * 1000;

	readonly authorizePage = readFileSync(
		import.meta.dirname + "/public/oauth-authorize.html",
		'utf-8'
	);
	readonly authorizedPage = readFileSync(
		import.meta.dirname + "/public/oauth-authorized.html",
		'utf-8'
	);

	parseURL(rawUrl: string, label: string) {
		let parsed: url.URL;
		try {
			parsed = new url.URL(rawUrl);
		} catch {
			throw new ActionError(`Invalid ${label}.`);
		}
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			throw new ActionError(`Invalid ${label}.`);
		}
		return parsed;
	}

	isSameOriginRequest(headers: IncomingHttpHeaders) {
		const rawOrigin = headers.origin;
		if (!rawOrigin) return false;
		if (headers['sec-fetch-site'] === 'same-origin') return true;

		const rawHost = headers.host;
		if (!rawHost) return false;
		const origin = this.parseURL(rawOrigin, 'request origin');
		const host = rawHost.toLowerCase();
		if (host === origin.host) return true;
		const defaultPort = origin.protocol === 'https:' ? 443 : 80;
		return !origin.port && host === `${origin.host}:${defaultPort}`;
	}

	async getClient(clientId?: string, rawUrl?: string, label = 'request origin') {
		if (!clientId) throw new ActionError("No client_id provided.");
		const client = await tables.oauthClients.get(clientId);
		if (!client) throw new ActionError("Invalid client_id");
		if (rawUrl) this.validateOrigin(client, rawUrl, label);
		return client;
	}

	validateOrigin(client: OAuthClient, rawUrl: string, label = 'request origin') {
		const registeredOrigin = this.parseURL(client.origin_url, 'OAuth client origin').origin;
		const requestedURL = this.parseURL(rawUrl, label);
		if (requestedURL.origin !== registeredOrigin) {
			throw new ActionError("This origin is not permitted to use this OAuth client.");
		}
		return requestedURL;
	}

	renderAuthorizePage(client: OAuthClient) {
		return this.authorizePage
			.replace(/\{\{client\}\}/g, escapeHTML(client.client_title))
			.replace(/\{\{client_name\}\}/g, escapeHTML(client.owner));
	}

	async rotateToken(token: { id: string }) {
		const id = crypto.randomBytes(16).toString('hex');
		const result = await tables.oauthTokens.update(token.id, {
			id,
			time: Date.now(),
		});
		return result.affectedRows === 1 ? id : null;
	}

	async authorize(client: OAuthClient, owner: string) {
		const existing = await (
			tables.oauthTokens.selectOne()
		)`WHERE client = ${client.id} AND owner = ${owner}`;
		if (existing) {
			if (Date.now() - existing.time > this.tokenTime) {
				const id = await this.rotateToken(existing);
				if (!id) return { success: false, user: owner };
				return {
					success: id,
					expires: Date.now() + this.tokenTime,
					user: owner,
				};
			}
			return { success: existing.id, user: owner };
		}

		const id = crypto.randomBytes(16).toString('hex');
		await tables.oauthTokens.insert({
			id, owner, client: client.id, time: Date.now(),
		});
		return {
			success: id,
			expires: Date.now() + this.tokenTime,
			user: owner,
		};
	}

	async refreshToken(client: OAuthClient, token: string) {
		const tokenEntry = await tables.oauthTokens.get(token);
		if (tokenEntry?.client !== client.id) {
			return { success: false };
		}
		if (Date.now() - tokenEntry.time > this.tokenTime + this.refreshGraceTime) {
			await tables.oauthTokens.delete(tokenEntry.id);
			return { success: false };
		}
		const id = await this.rotateToken(tokenEntry);
		if (!id) return { success: false };
		return { success: id, expires: Date.now() + this.tokenTime };
	}

	async getTokenOwner(client: OAuthClient, token: string) {
		const tokenEntry = await tables.oauthTokens.get(token);
		if (tokenEntry?.client !== client.id) return null;

		const tokenAge = Date.now() - tokenEntry.time;
		if (tokenAge > this.tokenTime) {
			if (tokenAge > this.tokenTime + this.refreshGraceTime) {
				await tables.oauthTokens.delete(tokenEntry.id);
			}
			return null;
		}
		return tokenEntry.owner;
	}

	async getAuthorizedApplications(owner: string) {
		const applications = [];
		const tokens = await tables.oauthTokens.selectAll()`WHERE owner = ${owner}`;
		for (const token of tokens) {
			const client = await tables.oauthClients.get(token.client);
			if (!client) throw new Error("Tokens exist for nonexistent application");
			applications.push({ title: client.client_title, url: client.origin_url });
		}
		return applications;
	}

	async revoke(owner: string, uri?: string) {
		if (!uri) {
			throw new ActionError("Specify the URL of the application you wish to revoke access for.");
		}
		const client = await tables.oauthClients.selectOne()`WHERE origin_url = ${uri}`;
		if (!client) {
			throw new ActionError('No client found with that URL.');
		}
		const tokenEntry = await (
			tables.oauthTokens.selectOne()
		)`WHERE client = ${client.id} AND owner = ${owner}`;
		if (!tokenEntry) {
			throw new ActionError("That application doesn't have access granted to your account.");
		}
		await tables.oauthTokens.deleteAll()`WHERE client = ${client.id} AND owner = ${owner}`;
		return { success: true };
	}
};
