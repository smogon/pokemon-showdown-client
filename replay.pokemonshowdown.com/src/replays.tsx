/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, PSModel } from './utils';
import { BattlePanel } from './replays-battle';
type ID = Lowercase<string>;
declare function toID(input: string): ID;
declare const Config: any;

interface ReplayResult {
	uploadtime: number;
	id: string;
	format: string;
	players: string[];
	password?: string;
	private?: number;
	rating?: number;
}

class SearchPanel extends preact.Component<{ id: string }> {
	results: ReplayResult[] | null = null;
	resultError: string | null = null;
	format = '';
	user = '';
	isPrivate = false;
	byRating = false;
	page = 1;
	loggedInUser: string | null = null;
	loggedInUserIsSysop = false;
	sort = 'date';
	override componentDidMount() {
		if (!Net.defaultRoute) Net(`/check-login.php`).get().then(result => {
			if (!result.startsWith(']')) return;
			const [userid, sysop] = result.slice(1).split(',');
			this.loggedInUser = userid;
			this.loggedInUserIsSysop = !!sysop;
			this.forceUpdate();
		});
		this.updateSearch(Net.decodeQuery(this.props.id));
	}
	override componentDidUpdate(previousProps: this['props']) {
		if (this.props.id === previousProps.id) return;
		const query = Net.decodeQuery(this.props.id);
		const page = parseInt(query.page || '1');
		const byRating = (query.sort === 'rating');
		if (page !== this.page || byRating !== this.byRating) this.updateSearch(query);
	}
	updateSearch(query: { [k: string]: string }) {
		const user = query.user || '';
		const format = query.format || '';
		const page = parseInt(query.page || '1');
		const isPrivate = !!query.private;
		this.byRating = (query.sort === 'rating');
		this.search(user, format, isPrivate, page);
	}
	parseResponse(response: string, isPrivate?: boolean) {
		this.results = null;
		this.resultError = null;

		if (isPrivate) {
			if (!response.startsWith(']')) {
				this.resultError = `Unrecognized response: ${response}`;
				return;
			}
			response = response.slice(1);
		}
		const results = JSON.parse(response);
		if (!Array.isArray(results)) {
			this.resultError = results.actionerror || `Unrecognized response: ${response}`;
			return;
		}
		this.results = results;
	}
	search(user: string, format: string, isPrivate?: boolean, page = 1) {
		this.base!.querySelector<HTMLInputElement>('input[name=user]')!.value = user;
		this.base!.querySelector<HTMLInputElement>('input[name=format]')!.value = format;
		this.base!.querySelectorAll<HTMLInputElement>('input[name=private]')[isPrivate ? 1 : 0].checked = true;

		if (!format && !user) return this.recent();
		this.user = user;
		this.format = format;
		this.isPrivate = !!isPrivate;
		this.page = page;
		this.results = null;
		this.resultError = null;
		if (user || !format) this.byRating = false;

		if (!format && !user) {
			PSRouter.replace('');
		} else {
			PSRouter.replace('?' + Net.encodeQuery({
				user: user || undefined,
				format: format || undefined,
				private: isPrivate ? '1' : undefined,
				page: page === 1 ? undefined : page,
				sort: this.byRating ? 'rating' : undefined,
			}));
		}
		this.forceUpdate();
		Net(`/api/replays/${isPrivate ? 'searchprivate' : 'search'}`).get({
			query: {
				username: this.user,
				format: this.format,
				page,
				sort: this.byRating ? 'rating' : undefined,
			},
		}).then(response => {
			if (this.format !== format || this.user !== user) return;
			this.parseResponse(response, true);
			this.forceUpdate();
		}).catch(error => {
			if (this.format !== '' || this.user !== '') return;
			this.resultError = '' + error;
			this.forceUpdate();
		});
	}
	modLink(overrides: { page?: number, sort?: string }) {
		const newPage = (overrides.page !== undefined ? this.page + overrides.page : 1);
		return PSRouter.href('?' + Net.encodeQuery({
			user: this.user || undefined,
			format: this.format || undefined,
			private: this.isPrivate ? '1' : undefined,
			page: newPage === 1 ? undefined : newPage,
			sort: (overrides.sort ? overrides.sort === 'rating' : this.byRating) ? 'rating' : undefined,
		}));
	}
	recent() {
		this.format = '';
		this.user = '';
		this.results = null;
		this.forceUpdate();
		Net(`/api/replays/recent`).get().then(response => {
			if (this.format !== '' || this.user !== '') return;
			this.parseResponse(response, true);
			this.forceUpdate();
		}).catch(error => {
			if (this.format !== '' || this.user !== '') return;
			this.resultError = '' + error;
			this.forceUpdate();
		});
	}
	submitForm = (e: Event) => {
		e.preventDefault();
		const format = this.base!.querySelector<HTMLInputElement>('input[name=format]')?.value || '';
		const user = this.base!.querySelector<HTMLInputElement>('input[name=user]')?.value || '';
		const isPrivate = !this.base!.querySelector<HTMLInputElement>('input[name=private]')?.checked;
		this.search(user, format, isPrivate);
	};
	cancelForm = (e: Event) => {
		e.preventDefault();
		this.search('', '');
	};
	searchLoggedIn = (e: Event) => {
		if (!this.loggedInUser) return; // shouldn't happen
		this.base!.querySelector<HTMLInputElement>('input[name=user]')!.value = this.loggedInUser;
		this.submitForm(e);
	};
	url(replay: ReplayResult) {
		const viewpointSwitched = (toID(replay.players[1]) === toID(this.user));
		return replay.id + (replay.password ? `-${replay.password}pw` : '') + (viewpointSwitched ? '?p2' : '');
	}
	formatid(replay: ReplayResult) {
		let formatid = replay.format;
		if (!formatid.startsWith('gen') || !/[0-9]/.test(formatid.charAt(3))) {
			// 2013 Oct 14, two days after X and Y were released; good enough
			// estimate for when we renamed `ou` to `gen5ou`.
			formatid = (replay.uploadtime > 1381734000 ? 'gen6' : 'gen5') + formatid;
		}
		if (!/^gen[0-9]+-/.test(formatid)) {
			formatid = formatid.slice(0, 4) + '-' + formatid.slice(4);
		}
		return formatid;
	}
	override render() {
		const activelySearching = !!(this.format || this.user);
		const hasNextPageLink = (this.results?.length || 0) > 50;
		const results = hasNextPageLink ? this.results!.slice(0, 50) : this.results;
		const searchResults = <ul class="linklist">
			{(this.resultError && <li>
				<strong class="message-error">{this.resultError}</strong>
			</li>) ||
			(!results && <li>
				<em>Loading...</em>
			</li>) ||
			(results?.map(result => <li>
				<ReplayLink replay={result} user={toID(this.user)}></ReplayLink>
			</li>))}
		</ul>;
		return <div class={PSRouter.showingRight() ? 'sidebar' : ''}>
			<section class="section first-section">
				<h1>Search replays</h1>
				<form onSubmit={this.submitForm}>
					<p>
						<label>
							Username:<br />
							<input type="search" class="textbox" name="user" placeholder="(blank = any user)" size={20} /> {}
							{this.loggedInUser &&
								<button type="button" class="button" onClick={this.searchLoggedIn}>{this.loggedInUser}'s replays</button>}
						</label>
					</p>
					<p>
						<label>Format:<br />
							<input type="search" class="textbox" name="format" placeholder="(blank = any format)" size={30} /></label>
					</p>
					<p>
						<label class="checkbox inline"><input type="radio" name="private" value="" /> Public</label> {}
						<label class="checkbox inline"><input type="radio" name="private" value="1" /> Private (your own replays only)</label>
					</p>
					<p>
						<button type="submit" class="button"><i class="fa fa-search" aria-hidden></i> <strong>Search</strong></button> {}
						{activelySearching && <button class="button" onClick={this.cancelForm}>Cancel</button>}
					</p>
					{activelySearching && <h1 aria-label="Results"></h1>}
					{activelySearching && this.format && !this.user && <p>
						Sort by: {}
						<a href={this.modLink({ sort: 'date' })} class={`button button-first${this.byRating ? '' : ' disabled'}`}>
							Date
						</a>
						<a href={this.modLink({ sort: 'rating' })} class={`button button-last${this.byRating ? ' disabled' : ''}`}>
							Rating
						</a>
					</p>}
					{activelySearching && this.page > 1 && <p class="pagelink">
						<a href={this.modLink({ page: -1 })} class="button"><i class="fa fa-caret-up"></i><br />Page {this.page - 1}</a>
					</p>}
					{activelySearching && searchResults}
					{activelySearching && (this.results?.length || 0) > 50 && <p class="pagelink">
						<a href={this.modLink({ page: 1 })} class="button">Page {this.page + 1}<br /><i class="fa fa-caret-down"></i></a>
					</p>}
				</form>
			</section>
			{!activelySearching && <FeaturedReplays />}
			{!activelySearching && <section class="section">
				<h1>Recent replays</h1>
				<ul class="linklist">
					{searchResults}
				</ul>
			</section>}
		</div>;
	}
}

class FeaturedReplays extends preact.Component {
	moreFun = false;
	moreCompetitive = false;
	showMoreFun = (e: Event) => {
		e.preventDefault();
		this.moreFun = true;
		this.forceUpdate();
	};
	showMoreCompetitive = (e: Event) => {
		e.preventDefault();
		this.moreCompetitive = true;
		this.forceUpdate();
	};
	override render() {
		return <section class="section">
			<h1>Featured replays</h1>
			<ul class="linklist">
				<li><h2>Fun</h2></li>
				<li><ReplayLink
					replay={{ id: 'oumonotype-82345404', format: 'gen6-oumonotype', players: ['kdarewolf', 'Onox'] }}
				>
					Protean + prediction
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'anythinggoes-218380995', format: 'gen6-anythinggoes', players: ['Anta2', 'dscottnew'] }}
				>
					Cheek Pouch
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'uberssuspecttest-147833524', format: 'gen6-ubers', players: ['Metal Brellow', 'zig100'] }}
				>
					Topsy-Turvy
				</ReplayLink></li>
				{!this.moreFun && <li style={{ paddingLeft: '8px' }}>
					<button class="button" onClick={this.showMoreFun}>More <i class="fa fa-caret-right" aria-hidden></i></button>
				</li>}
				{this.moreFun && <li><ReplayLink
					replay={{ id: 'smogondoubles-75588440', format: 'gen6-smogondoubles', players: ['jamace6', 'DubsWelder'] }}
				>
					Garchomp sweeps 11 pokemon
				</ReplayLink></li>}
				{this.moreFun && <li><ReplayLink
					replay={{ id: 'ou-20651579', format: 'gen5-ou', players: ['RainSeven07', 'my body is regi'] }}
				>
					An entire team based on Assist V-create
				</ReplayLink></li>}
				{this.moreFun && <li><ReplayLink
					replay={{ id: 'balancedhackmons7322360', format: 'gen5-balancedhackmons', players: ['a ver', 'Shuckie'] }}
				>
					To a ver's frustration, PP stall is viable in Balanced Hackmons
				</ReplayLink></li>}
				<h2>Competitive</h2>
				<li><ReplayLink
					replay={{ id: 'doublesou-232753081', format: 'gen6-doublesou', players: ['Electrolyte', 'finally'] }}
				>
					finally steals Electrolyte's spot in the finals of the Doubles Winter Seasonal by outplaying Toxic Aegislash.
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'smogtours-gen5ou-59402', format: 'gen5-ou', players: ['Reymedy', 'Leftiez'] }}
				>
					Reymedy's superior grasp over BW OU lead to his claim of victory over Leftiez in the No Johns Tournament.
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'smogtours-gen3ou-56583', format: 'gen3-ou', players: ['pokebasket', "Alf'"] }}
				>
					pokebasket proved Blissey isn't really one to take a Focus Punch well in his victory match over Alf' in the
					Fuck Trappers ADV OU tournament.
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'smogtours-ou-55891', format: 'gen6-ou', players: ['Marshall.Law', 'Malekith'] }}
				>
					In a "match full of reverses", Marshall.Law takes on Malekith in the finals of It's No Use.
				</ReplayLink></li>
				<li><ReplayLink
					replay={{ id: 'smogtours-ubers-54583', format: 'gen6-custom', players: ['hard', 'panamaxis'] }}
				>
					Dark horse panamaxis proves his worth as the rightful winner of The Walkthrough Tournament in this exciting
					final versus hard.
				</ReplayLink></li>
				{!this.moreCompetitive && <li style={{ paddingLeft: '8px' }}>
					<button class="button" onClick={this.showMoreCompetitive}>More <i class="fa fa-caret-right" aria-hidden></i></button>
				</li>}
				{this.moreCompetitive && <li><ReplayLink
					replay={{ id: 'smogtours-ubers-34646', format: 'gen6-ubers', players: ['steelphoenix', 'Jibaku'] }}
				>
					In this SPL Week 4 battle, Jibaku's clever plays with Mega Sableye keep the momentum mostly in his favor.
				</ReplayLink></li>}
				{this.moreCompetitive && <li><ReplayLink
					replay={{ id: 'smogtours-uu-36860', format: 'gen6-uu', players: ['IronBullet93', 'Laurel'] }}
				>
					Laurel outplays IronBullet's Substitute Tyrantrum with the sly use of a Shuca Berry Cobalion, but luck was
					inevitably the deciding factor in this SPL Week 6 match.
				</ReplayLink></li>}
				{this.moreCompetitive && <ReplayLink
					replay={{ id: 'smogtours-gen5ou-36900', format: 'gen5-ou', players: ['Lowgock', 'Meridian'] }}
				>
					This SPL Week 6 match features impressive plays, from Jirachi sacrificing itself to paralysis to avoid a
					burn to some clever late-game switches.
				</ReplayLink>}
				{this.moreCompetitive && <li><ReplayLink
					replay={{ id: 'smogtours-gen4ou-36782', format: 'gen4-ou', players: ['Heist', 'liberty32'] }}
				>
					Starting out as an entry hazard-filled stallfest, this close match is eventually decided by liberty32's
					efficient use of Aerodactyl.
				</ReplayLink></li>}
				{this.moreCompetitive && <li><ReplayLink
					replay={{ id: 'randombattle-213274483', format: 'gen6-randombattle', players: ['The Immortal', 'Amphinobite'] }}
				>
					Substitute Lugia and Rotom-Fan take advantage of Slowking's utility and large HP stat, respectively,
					in this high ladder match.
				</ReplayLink></li>}
			</ul>
		</section>;
	}
}

function ReplayLink(props: {
	user?: ID, replay: {
		id: string, format?: string, players: string[], password?: string, rating?: number, private?: number,
	}, children?: preact.ComponentChildren,
}) {
	const user = props.user;
	const replay = props.replay;
	const viewpointSwitched = (toID(replay.players[1]) === user);
	const url = replay.id + (replay.password ? `-${replay.password}pw` : '') + (viewpointSwitched ? '?p2' : '');

	return <a href={PSRouter.href(url)} class="blocklink">
		<small>{replay.format}{replay.rating ? ` (Rating: ${replay.rating})` : ''}<br /></small>
		{!!replay.private && <i class="fa fa-lock"></i>} {}
		<strong>{replay.players[0]}</strong> vs. <strong>{replay.players[1]}</strong>
		{props.children && <small><br />
			{props.children}
		</small>}
	</a>;
}

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
		if (!loc || loc.startsWith('?')) {
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
		return <div
			class={'bar-wrapper' + (PSRouter.showingLeft() && PSRouter.showingRight() ? ' has-sidebar' : '')} style={position}
		>
			{PSRouter.showingLeft() && <SearchPanel id={PSRouter.leftLoc!} />}
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
