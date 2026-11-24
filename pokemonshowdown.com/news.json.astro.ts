import type { APIRoute } from 'astro';
import { User } from '../api/src/user.ts';
import { News } from '../lib/news.ts';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const id = url.searchParams.get('id');
	const data = id && id !== '0' ? await News.getPost(id) : await News.getFeed();
	return Response.json(data, {
		status: data ? 200 : 404,
		headers: { 'Access-Control-Allow-Origin': '*' },
	});
};

export const POST: APIRoute = context => News.handleWrite(context, User);
