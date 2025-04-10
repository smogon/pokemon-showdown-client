/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { TeamViewer } from './teams-view';
import { TeamIndex } from './teams-index';
import { TeamSearcher } from './teams-search';

declare const Config: any;
export type PageProps = { args: Record<string, string> };

export const PSRouter = new class {
	routes: Record<string, (new (props: PageProps) => preact.Component<PageProps>)> = {};

	setRoutes(routes: typeof PSRouter['routes']) {
		Object.assign(this.routes, routes);
	}

	// @ts-expect-error 'no reachable end point' YES THERE IS changing href stops execution after it
	redir(path: string): never {
		location.href = path;
	}

	go() {
		const params = location.pathname.split('/');
		let args: PageProps['args'] = {};
		let Element;
		for (const k in this.routes) {
			let matched = false;
			const routeParts = k.split('/');
			for (let i = 0; i < routeParts.length; i++) {
				const part = params[i];
				if (routeParts[i].startsWith('?')) {
					routeParts[i] = routeParts[i].slice(1);
					if (!part.trim()) break; // can end here
				}
				if (routeParts[i]?.startsWith(':')) {
					args[routeParts[i].slice(1)] = part;
					continue;
				}
				if (part !== routeParts[i]) {
					matched = false;
					args = {}; // don't accidentally dupe over args
					break;
				} else {
					matched = true;
				}
			}
			if (matched) {
				Element = this.routes[k];
				break;
			}
		}
		if (!Element) {
			this.redir('//' + Config.routes.teams + "/404.html");
		} else {
			preact.render(<Element args={args} />, document.getElementById('main')!);
		}
	}
};

if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
	localStorage.setItem('darkmode', 'true');
}
if (localStorage.getItem('darkmode')) {
	document.querySelector('html')?.classList.add('dark');
}

PSRouter.setRoutes({
	'/view/:id': TeamViewer,
	'/': TeamIndex,
	'/search/?:type/?:val': TeamSearcher,
});
PSRouter.go();
