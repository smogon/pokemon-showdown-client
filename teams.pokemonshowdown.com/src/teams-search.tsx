/** @jsx preact.h */
/** @jsxFrag preact.Fragment */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, type ServerTeam, MiniTeam } from './utils';
import type { PageProps } from './teams';

declare const toID: (val: any) => string;
declare const BattleAliases: Record<string, string>;

const SEARCH_KEYS = ['format', 'owner', 'gen'];

export class TeamSearcher extends preact.Component<PageProps> {
	override state = {
		result: [] as ServerTeam[],
		curCount: 20,
		search: {} as Record<string, string>,
		loading: false,
		searchUnchanged: null as null | boolean,
	};
	constructor(props: PageProps) {
		super(props);

		const url = new URL(location.href);
		let makeSearch = false;
		for (const key of SEARCH_KEYS) {
			const val = url.searchParams.get(key);
			if (toID(val)) {
				this.state.search[key] = toID(val);
				makeSearch = true;
			}
			if (this.props.args.type === key) { // prioritize url where applicable
				const propVal = toID(this.props.args.val);
				if (propVal) {
					this.state.search[key] = propVal;
					makeSearch = true;
				}
			}
		}
		const count = Number(url.searchParams.get('count'));
		if (!isNaN(count) && count > 0) {
			this.state.curCount = count;
		}
		if (makeSearch) {
			this.search(0, true);
		}
	}
	// todo: find proper type. preact docs unhelpful.
	onInput(key: string, { currentTarget }: any) {
		this.state.search[key] = toID(currentTarget.value);
		this.setState({ search: this.state.search });
	}
	// format, owner, gen, count params. maxes out at 200. start at 20 and paginate
	search(incrementCount = 0, noSetUrl = false) {
		this.state.curCount += incrementCount;
		this.setState({
			loading: true,
			stateUnchanged: true,
			curCount: this.state.curCount,
		});

		const url = new URL(location.href);
		// clear out old ones so they don't dupe
		for (const val in url.searchParams) url.searchParams.delete(val);
		// then set new ones
		for (const k in this.state.search) {
			url.searchParams.set(k, this.state.search[k]);
		}
		url.searchParams.set('count', `${this.state.curCount}`);
		if (!noSetUrl) history.pushState({}, '', url);

		let format = this.state.search.format ?
			toID(BattleAliases?.[this.state.search.format]) || this.state.search.format :
			undefined;

		if (format) {
			if (!format.startsWith('gen')) {
				format = `gen${this.state.search.gen || 9}${format}`;
				delete this.state.search.gen; // don't let them conflict
			}
		} else {
			format = undefined;
		}
		for (const k in this.state.search) {
			if (!this.state.search[k]) delete this.state.search[k];
		}
		void Net('/api/searchteams').get({
			query: { ...this.state.search, format, count: this.state.curCount },
		}).then(resultText => {
			if (resultText.startsWith(']')) resultText = resultText.slice(1);
			let result;
			try {
				result = JSON.parse(resultText);
			} catch {
				result = { actionerror: "Malformed response received. Try again later." };
			}
			this.setState({ ...result, loading: false });
		});
	}

	render() {
		if (this.state.loading) {
			return <div class="section" style={{ wordWrap: 'break-word' }}>Loading...</div>;
		}
		return <div class="section" style={{ wordWrap: 'break-word', textAlign: 'center' }}>
			<small><a href={'//' + Config.routes.teams}><i style={{ float: 'left' }} class="fa fa-arrow-left"></i></a></small>
			<h1>Search Teams</h1>
			<br />
			<div name="searchsection">
				<label>Format: </label>
				<input value={this.state.search.format} onInput={e => this.onInput('format', e)} /><br />
				<label>Owner: </label>
				<input value={this.state.search.owner} onInput={e => this.onInput('owner', e)} /><br />
				<label>Generation: </label>
				<input value={this.state.search.gen} onInput={e => this.onInput('gen', e)} /><br />
				<button class="button notifying" onClick={() => this.search()}>Search!</button>
			</div>
			<hr />
			{!this.state.result.length ? <></> :
			<ul class="teamlist">{
				this.state.result.map(team => <li><MiniTeam team={team} fullTeam /></li>)
			}</ul>}
			{(this.state.result as any).actionerror ?
				<div class="message-error">{(this.state.result as any).actionerror}</div> :
				<></>}
			{
				this.state.result.length === this.state.curCount ?
					<button class="button notifying" onClick={() => this.search(20)}>More</button> :
					<></>
			}
		</div>;
	}
}
