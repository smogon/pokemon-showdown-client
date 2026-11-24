import type { APIRoute } from 'astro';
import { User } from '../../api/src/user.ts';
import { News } from '../../lib/news.ts';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
	const post = await News.getPost(params.newsid, url.searchParams.has('source'));
	return Response.json(post, {
		status: post ? 200 : 404,
		headers: { 'Access-Control-Allow-Origin': '*' },
	});
};

export const PUT: APIRoute = context => News.handleWrite(context, User);
