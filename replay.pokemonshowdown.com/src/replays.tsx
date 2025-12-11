/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, PSModel } from './utils';
import { BattlePanel } from './replays-battle';
import { SearchPanel, FavoritesPanel } from './replays-index';
declare const Config: any;

export const PSRouter = new class extends PSModel {
	baseLoc: string;
	leftLoc: string | null = null;
	rightLoc: string | null = null;
	forceSinglePanel = false;
	stickyRight = true;
	constructor() {
		super();
		const baseLocSlashIndex = document.location.href.lastIndexOf('/');
		this.baseLoc = document.location.href.slice(0, baseLocSlashIndex + 1);
		if (Net.defaultRoute) {
			this.baseLoc = document.location.href.replace(/#.*/, '') + '#';
		}
		this.go(document.location.href);
		this.setSinglePanel(true);
		if (window.history) window.addEventListener('popstate', e => {
			PSRouter.popState(e);
			this.update();
		});
		window.onresize = () => {
			PSRouter.setSinglePanel();
		};
	}
	showingLeft() {
		return this.leftLoc !== null && (!this.forceSinglePanel || this.rightLoc === null);
	}
	showingRight() {
		return this.rightLoc !== null;
	}
	href(route: string | null) {
		return `${Net.defaultRoute ? '#' : route?.startsWith('?') ? './' : ''}${route || ''}` || '.';
	}
	setSinglePanel(init?: boolean) {
		const singlePanel = window.innerWidth < 1300;
		const stickyRight = (window.innerHeight > 614);
		if (this.forceSinglePanel !== singlePanel || this.stickyRight !== stickyRight) {
			this.forceSinglePanel = singlePanel;
			this.stickyRight = stickyRight;
			if (!init) this.update();
		}
	}
	push(href: string): boolean {
		if (!href.startsWith(this.baseLoc)) return false;

		if (this.go(href)) {
			window.history?.pushState([this.leftLoc, this.rightLoc], '', href);
		}
		return true;
	}
	/** returns whether the URL should change */
	go(href: string): boolean {
		if (!href.startsWith(this.baseLoc) && href + '#' !== this.baseLoc) return false;

		const loc = href.slice(this.baseLoc.length);
		if (!loc || loc.startsWith('?') || loc.startsWith('favorites')) {
			this.leftLoc = loc;
			if (this.forceSinglePanel) {
				this.rightLoc = null;
			} else {
				return this.rightLoc === null;
			}
		} else {
			this.rightLoc = loc;
		}
		return true;
	}
	replace(loc: string) {
		const href = this.baseLoc + loc;
		if (this.go(href)) {
			window.history?.replaceState([this.leftLoc, this.rightLoc], '', href);
		}
		return true;
	}
	popState(e: PopStateEvent) {
		if (Array.isArray(e.state)) {
			const [leftLoc, rightLoc] = e.state;
			this.leftLoc = leftLoc;
			this.rightLoc = rightLoc;
			if (this.forceSinglePanel) this.leftLoc = null;
		} else {
			this.leftLoc = null;
			this.rightLoc = null;
			this.go(document.location.href);
		}
		this.update();
	}
};

export class PSReplays extends preact.Component {
	static darkMode: 'dark' | 'light' | 'auto' = 'auto';
	static updateDarkMode() {
		let dark = this.darkMode === 'dark' ? 'dark' : '';
		if (this.darkMode === 'auto') {
			dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : '';
		}
		document.documentElement.className = dark;
	}
	override componentDidMount() {
		PSRouter.subscribe(() => this.forceUpdate());
		if (window.history) {
			this.base!.addEventListener('click', e => {
				let el = e.target as HTMLElement;
				for (; el; el = el.parentNode as HTMLElement) {
					if (el.tagName === 'A' && PSRouter.push((el as HTMLAnchorElement).href)) {
						e.preventDefault();
						e.stopImmediatePropagation();
						this.forceUpdate();
						return;
					}
				}
			});
		}
		// load custom colors from loginserver
		Net(`https://${Config.routes.client}/config/colors.json`).get().then(response => {
			const data = JSON.parse(response);
			Object.assign(Config.customcolors, data);
		});
	}
	override render() {
		const position = PSRouter.showingLeft() && PSRouter.showingRight() && !PSRouter.stickyRight ?
			{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } : {};
		const leftLoc = PSRouter.leftLoc || '';
		const isFavorites = leftLoc.startsWith('favorites');
		return <div
			class={'bar-wrapper' + (PSRouter.showingLeft() && PSRouter.showingRight() ? ' has-sidebar' : '')} style={position}
		>
			{PSRouter.showingLeft() && !isFavorites && <SearchPanel id={leftLoc} />}
			{PSRouter.showingLeft() && isFavorites && <FavoritesPanel id={leftLoc} />}
			{PSRouter.showingRight() && <BattlePanel id={PSRouter.rightLoc!} />}
			<div style={{ clear: 'both' }}></div>
		</div>;
	}
}

preact.render(<PSReplays />, document.getElementById('main')!);

if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
	document.documentElement.className = 'dark';
}
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
	if (PSReplays.darkMode === 'auto') document.documentElement.className = event.matches ? "dark" : "";
});
