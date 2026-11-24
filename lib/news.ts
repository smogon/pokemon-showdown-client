import type { APIContext } from 'astro';
import * as fs from 'node:fs/promises';
import type { User as UserAPI } from '../api/src/user.ts';
import { escapeHTML, time } from '../api/src/utils.ts';

const directory = import.meta.dirname + '/../config';
const clientCaches = import.meta.dirname + '/../play.pokemonshowdown.com/caches';

export interface LegacyPost {
	topic_id: string;
	title: string;
	authorname: string;
	date: number | string;
	topic_time?: string;
	summary?: string;
	details?: string;
	title_html?: string;
	summary_html?: string;
	details_html?: string | null;
}

export interface NewsSource {
	title: string;
	summary: string;
	details: string;
}

interface LegacyNewsFile {
	latest: string[];
	news: Record<string, LegacyPost>;
}

function formatPost(post: LegacyPost) {
	return {
		id: post.topic_id,
		title: post.title,
		author: post.authorname,
		date: Number(post.date),
		summaryHTML: post.summary_html ?? null,
		detailsHTML: post.details_html ?? null,
	};
}

function formatPostWithSource(post: LegacyPost) {
	return {
		...formatPost(post),
		readableDate: News.formatDate(post.date),
		summary: post.summary ?? post.summary_html ?? '',
		details: post.details ?? post.details_html ?? '',
	};
}

export type EditableNewsPost = ReturnType<typeof formatPostWithSource>;

function formatBody(source: string) {
	const html = source.replace(/\r/g, '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')
		.replace(/\[url=(?:"([^"]+)"|([^\]]+))\]/g, (_match, quoted, plain) => `<a href="${quoted ?? plain}" target="_blank">`)
		.replace(/\[\/url\]/g, '</a>').replace(/\[(\/?)b\]/g, '<$1strong>').replace(/\[(\/?)i\]/g, '<$1em>')
		.replace(/\[psicon (pokemon|item|type|category)=(?:"([^"]+)"|([^\]]+))\]/g,
			(_match, kind, quoted, plain) => `<psicon ${kind}="${quoted ?? plain}" />`);
	return `<p>${html}</p>`;
}

async function replaceFile(path: string, data: string) {
	const temp = path + '.new';
	try {
		await fs.writeFile(temp, data, { mode: (await fs.stat(path)).mode });
		await fs.rename(temp, path);
	} finally {
		await fs.unlink(temp).catch(error => { if (error?.code !== 'ENOENT') throw error; });
	}
}

const timeZone = 'America/Los_Angeles';
const dateFormat = new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' });
const yearFormat = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' });

export const News = {
	formatDate(unixSeconds: LegacyPost['date']) {
		return dateFormat.format(Number(unixSeconds) * 1000);
	},
	formatYear(unixSeconds: LegacyPost['date']) {
		return yearFormat.format(Number(unixSeconds) * 1000);
	},

	async read(): Promise<LegacyNewsFile> {
		try {
			const source = await fs.readFile(directory + '/news.json', 'utf8');
			return JSON.parse(source);
		} catch (error) {
			if ((error as any)?.code === 'ENOENT') return { latest: [], news: {} };
			throw error;
		}
	},

	async getFeed() {
		const { latest, news } = await this.read();
		return latest.slice(0, 3).map(id => news[id]).filter(Boolean).map(formatPost);
	},

	async getLegacyPost(id?: string) {
		if (!id || !/^\d+$/.test(id)) return null;
		const { news } = await this.read();
		return news[id] ?? null;
	},

	async getPost(id?: string, includeSource = false) {
		const post = await this.getLegacyPost(id);
		if (!post) return null;
		return includeSource ? formatPostWithSource(post) : formatPost(post);
	},

	renderEmbed(post: LegacyPost) {
		const date = this.formatDate(post.date);
		const more = post.details_html ? ` <small><a href="https://pokemonshowdown.com/news/${post.topic_id}" target="_blank">Read more</a></small>` : '';
		return `<div class="newsentry" data-newsid="${post.topic_id}" data-date="${post.date}"><h4>${post.title_html ?? escapeHTML(post.title)}</h4>` +
			`${post.summary_html ?? ''}<p>&mdash;<strong>${escapeHTML(post.authorname)}</strong> <small class="date">on ${date}</small>${more}</p></div>`;
	},

	async updateClientIndexes(data: LegacyNewsFile, editedId: string) {
		const latest = data.latest.slice(0, 2);
		const files = new Map<string, string>();
		if (!latest.includes(editedId)) return files;

		const embed = latest.map(key => this.renderEmbed(data.news[key])).join('');
		for (const [name, container] of [
			['old', '<div class="pm-log" style="max-height:none">'],
			['new', '<div class="readable-bg">'],
		]) {
			const path = clientCaches + '/index-' + name + '.html';
			let html;
			try {
				html = await fs.readFile(path, 'utf8');
			} catch (error) {
				if ((error as any)?.code === 'ENOENT') continue;
				throw error;
			}
			const section = new RegExp('^(\\t+)' + container + '\\n[\\s\\S]*?\\n\\1</div>', 'm');
			if (!section.test(html)) throw new Error('Missing news section in ' + path);
			html = html.replace(/ data-newsid="[^"]*">/, ` data-newsid="${latest[0]}">`);
			files.set(path, html.replace(section, (_match, indent) =>
				indent + container + '\n' + indent + '\t' + embed + '\n' + indent + '</div>'));
		}
		return files;
	},

	async updatePost(id: string | undefined, edit: NewsSource) {
		if (!id || !/^\d+$/.test(id)) return null;
		return this.writePost(data => {
			const post = data.news[id];
			if (!post) return null;
			if (edit.title !== post.title) {
				post.title = edit.title;
				post.title_html = escapeHTML(edit.title);
			}
			// older posts might only have rendered HTML
			if (edit.summary !== (post.summary ?? post.summary_html ?? '')) {
				post.summary = edit.summary;
				post.summary_html = formatBody(edit.summary);
			}
			if (!edit.details) {
				delete post.details;
				delete post.details_html;
			} else if (edit.details !== (post.details ?? post.details_html)) {
				post.details = edit.details;
				post.details_html = formatBody(edit.details);
			}
			return post;
		});
	},

	async createPost(author: string, edit: NewsSource) {
		return this.writePost(data => {
			let id = Number(data.latest[0] || 0) + 1;
			while (data.news[id]) id++;
			const date = String(time());
			const post: LegacyPost = {
				topic_id: String(id), authorname: author, date, topic_time: date,
				title: edit.title, title_html: escapeHTML(edit.title),
				summary: edit.summary, summary_html: formatBody(edit.summary),
			};
			if (edit.details) {
				post.details = edit.details;
				post.details_html = formatBody(edit.details);
			}
			data.news[post.topic_id] = post;
			data.latest.unshift(post.topic_id);
			return post;
		});
	},

	async writePost(change: (data: LegacyNewsFile) => LegacyPost | null) {
		const newsPath = directory + '/news.json';
		/** temp file for partially-written updates, also functions as a lock */
		const tempPath = newsPath + '.new';
		await fs.writeFile(tempPath, '', { flag: 'wx', mode: 0o600 });
		let published = false;
		try {
			const data = await this.read();
			const post = change(data);
			if (!post) return null;

			await fs.writeFile(tempPath, JSON.stringify(data, null, 4) + '\n');
			const stat = await fs.stat(newsPath).catch(error => {
				if (error?.code !== 'ENOENT') throw error;
			});
			await fs.chmod(tempPath, stat ? stat.mode & 0o777 : 0o666 & ~process.umask());
			const files = await this.updateClientIndexes(data, post.topic_id);
			for (const [path, html] of files) await replaceFile(path, html);

			// publish and release the lock
			await fs.rename(tempPath, newsPath);
			published = true;
			return formatPostWithSource(post);
		} finally {
			// something went wrong, release the lock
			if (!published) await fs.unlink(tempPath);
		}
	},

	async handleWrite({ params, request, url, cookies }: APIContext, User: typeof UserAPI) {
		const origin = request.headers.get('origin');
		// Apache may receive HTTP from the site's HTTPS reverse proxy.
		if (origin !== url.origin && origin !== 'https://' + url.host) return new Response(null, { status: 403 });
		if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
			return new Response(null, { status: 415 });
		}

		const user = await User.fromSid(cookies.get('sid')?.value);
		if (!user?.isLeader()) return new Response(null, { status: 403 });

		const edit = await request.json().catch(() => null);
		if (
			typeof edit?.title !== 'string' || !edit.title.trim() ||
			typeof edit.summary !== 'string' || typeof edit.details !== 'string' || Object.keys(edit).length !== 3
		) {
			return new Response(null, { status: 400 });
		}
		try {
			if (request.method === 'POST') {
				const post = await News.createPost(user.name, edit);
				return Response.json(post, { status: 201, headers: { Location: `/news/${post!.id}.json` } });
			}
			const updated = await News.updatePost(params.newsid, edit);
			return updated ? Response.json(updated) : new Response(null, { status: 404 });
		} catch (error) {
			if ((error as any)?.code === 'EEXIST') return new Response(null, { status: 409 });
			throw error;
		}
	},
};
