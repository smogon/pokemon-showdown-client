/** @jsx preact.h */
/** @jsxFrag preact.Fragment */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, PSIcon, getShowdownUsername, unpackTeam } from './utils';
import { BattleLog } from '../../play.pokemonshowdown.com/src/battle-log';
import type { PageProps } from './teams';
import { Dex } from '../../play.pokemonshowdown.com/src/battle-dex';
import { BattleStatNames } from '../../play.pokemonshowdown.com/src/battle-dex-data';

declare const toID: (str: any) => string;
declare const BattleAliases: Record<string, string>;

interface Team {
	team: string;
	title: string;
	views: number;
	ownerid: string;
	format: string;
	teamid: string;
	private: number;
}

function exportSet(set: Dex.PokemonSet) {
	let out = ``;

	// core
	if (set.name && set.name !== set.species) {
		out += `${set.name} (${set.species})`;
	} else {
		out += set.species;
	}
	if (set.gender === 'M') out += ` (M)`;
	if (set.gender === 'F') out += ` (F)`;
	if (set.item) out += ` @ ${set.item}`;
	out += `  \n`;

	if (set.ability) {
		out += `Ability: ${set.ability}  \n`;
	}

	// details
	if (set.level && set.level !== 100) {
		out += `Level: ${set.level}  \n`;
	}
	if (set.shiny) {
		out += `Shiny: Yes  \n`;
	}
	if (typeof set.happiness === 'number' && set.happiness !== 255 && !isNaN(set.happiness)) {
		out += `Happiness: ${set.happiness}  \n`;
	}
	if (set.pokeball) {
		out += `Pokeball: ${set.pokeball}  \n`;
	}
	if (set.hpType) {
		out += `Hidden Power: ${set.hpType}  \n`;
	}
	if (typeof set.dynamaxLevel === 'number' && set.dynamaxLevel !== 10 && !isNaN(set.dynamaxLevel)) {
		out += `Dynamax Level: ${set.dynamaxLevel}  \n`;
	}
	if (set.gigantamax) {
		out += `Gigantamax: Yes  \n`;
	}
	if (set.teraType) {
		out += `Tera Type: ${set.teraType}  \n`;
	}

	// stats
	let first = true;
	if (set.evs) {
		for (const stat of Dex.statNames) {
			if (!set.evs[stat]) continue;
			if (first) {
				out += `EVs: `;
				first = false;
			} else {
				out += ` / `;
			}
			out += `${set.evs[stat]} ${BattleStatNames[stat]}`;
		}
	}
	if (!first) {
		out += `  \n`;
	}
	if (set.nature) {
		out += `${set.nature} Nature  \n`;
	}
	first = true;
	if (set.ivs) {
		for (const stat of Dex.statNames) {
			if (set.ivs[stat] === undefined || isNaN(set.ivs[stat]) || set.ivs[stat] === 31) continue;
			if (first) {
				out += `IVs: `;
				first = false;
			} else {
				out += ` / `;
			}
			out += `${set.ivs[stat]} ${BattleStatNames[stat]}`;
		}
	}
	if (!first) {
		out += `  \n`;
	}

	// moves
	for (let move of set.moves) {
		if (move.startsWith(`Hidden Power `) && move.charAt(13) !== '[') {
			move = `Hidden Power [${move.slice(13)}]`;
		}
		out += `- ${move}  \n`;
	}

	return out;
}

function PokemonSet({ set }: { set: Dex.PokemonSet }) {
	return <div>
		{set.name && set.name !== set.species ? <>{set.name} ({set.species})</> : <>{set.species}</>}
		{set.gender ? <> ({set.gender})</> : <></>}
		{set.item ? <> @ {set.item} </> : <></>}
		<br />
		{set.ability ? <>Ability: {set.ability}<br /></> : <></>}
		{set.level && set.level !== 100 ? <>Level: {set.level}<br /></> : <></>}
		{set.shiny ? <>Shiny: Yes<br /></> : <></>}
		{set.teraType ? <>Tera Type: {set.teraType}<br /></> : <></>}

		{set.evs ? <>{Dex.statNames.filter(stat => set.evs![stat]).map((stat, index, arr) => (
			<>
				{index === 0 ? 'EVs: ' : ''}
				{set.evs![stat]} {BattleStatNames[stat]}
				{index !== (arr.length - 1) ? ' / ' : ''}
			</>
		))}<br /></> : <></>}

		{set.nature ? <>{set.nature} Nature<br /></> : <></>}

		{set.ivs ? <>{Dex.statNames
			.filter(stat => !(set.ivs![stat] === undefined || isNaN(set.ivs![stat]) || set.ivs![stat] === 31))
			.map((stat, index, arr) =>
				<>
					{index === 0 ? 'IVs: ' : ''}
					{set.ivs![stat]} {BattleStatNames[stat]}
					{index !== (arr.length - 1) ? ' / ' : ''}
				</>
			)}<br /></> : <></>}

		{set.moves ? set.moves.map(move => {
			if (move.substr(0, 13) === 'Hidden Power ') {
				const hpType = move.slice(13);
				move = move.slice(0, 13);
				move = `${move}[${hpType}]`;
			}
			// hide the alt so it doesn't interfere w/ copy/pasting
			return <>- {move} <PSIcon type={Dex.moves.get(move).type} hideAlt /><br /></>;
		}) : <></>}

		{typeof set.happiness === 'number' && set.happiness !== 255 && !isNaN(set.happiness) ?
			<>Happiness: {set.happiness}<br /></> :
			<></>}
		{typeof set.dynamaxLevel === 'number' && set.dynamaxLevel !== 10 && !isNaN(set.dynamaxLevel) ?
			<>Dynamax Level: {set.dynamaxLevel}<br /></> :
			<></>}
		{set.gigantamax ? <>Gigantamax: Yes<br /></> : <></>}
	</div>;
}

class SetBlock extends preact.Component<{
	set: Dex.PokemonSet, gen: number, mode?: string | null,
}> {
	render() {
		const set = this.props.set;
		const gen = this.props.gen || (Dex.prefs('noanim') ? 5 : 6);
		const spriteData = Dex.getSpriteData(
			Dex.species.get(set.species),
			true,
			{ gen, shiny: set.shiny, gender: set.gender as 'F' }
		);
		let forceResize = 110;
		if (matchMedia("(max-width: 450px)").matches && this.props.mode === '2col') {
			forceResize = 55;
		}
		if (spriteData.w > forceResize) {
			const w = spriteData.w;
			spriteData.w *= (forceResize / w);
			spriteData.h *= (forceResize / w);
		}
		return <div>
			<div style={{ flex: '0 0 20%', width: 'auto', pad: '3px' }}>
				<img
					src={spriteData.url}
					width={spriteData.w}
					height={spriteData.h}
				/>
				{set.item ? <PSIcon item={set.item} /> : <></>}
			</div>
			<div style={{ flex: "0 0 80%", textAlign: 'left' }}>
				<PokemonSet set={set} />
			</div>
		</div>;
	}
}

export class TeamViewer extends preact.Component<PageProps> {
	id: string;
	pw?: string;
	override state = {
		team: undefined as null | void | Team,
		error: undefined as string | undefined,
		copyButtonMsg: false as boolean,
		displayMode: localStorage.getItem('teamdisplaymode') || null,
		spriteGen: Number(localStorage.getItem('spritegen')) || 6,
		manageOpen: false,
		changesMade: false,
		teamEdits: null as { format?: string, private?: number } | null,
		editError: null as null | string,
	};
	constructor(props: PageProps) {
		super(props);
		this.id = props.args.id;

		this.checkTeamID();
	}
	render() {
		if (this.state.error) {
			return <div class="message-error">{this.state.error}</div>;
		}
		if (!this.state.team) {
			return <div class="section" style={{ textAlign: 'center' }}>{
				typeof this.state.team === 'undefined' ?
					'Loading...' :
					<>
						<h2 class="message-error">Team not found.</h2><br />
						<em>Either it doesn't exist or it's password protected. Check the link?</em>
					</>
			}</div>;
		}
		const { team, title, ownerid, format, views } = this.state.team;
		const teamData = unpackTeam(team);
		const is2Col = this.state.displayMode === '2col';
		const isDark = document.querySelector('html')?.classList[0] === 'dark';
		const link = this.id + (this.state.team.private ? `-${this.state.team.private}` : '');

		return <div class="section" style={{ wordWrap: 'break-word' }}>
			<small><a href={'//' + Config.routes.teams}><i class="fa fa-arrow-left"></i></a></small>
			<h1>{title}</h1>
			Owner: <strong style={{ color: BattleLog.usernameColor(ownerid as any) }}>{ownerid}</strong><br />
			Format: {format}<br />
			Views: {views}<br />
			<label>Shortlink: </label><a href={`https://psim.us/t/${link}`}>https://psim.us/t/{link}</a><br />
			<hr />
			<div name="manage" style={{ display: 'flex', gap: '5px' }}>
				{toID(getShowdownUsername()) === this.state.team.ownerid && <button
					class={this.state.manageOpen ? `button notifying` : `button`}
					onClick={() => this.changeManage()}
				>Manage</button>}
				<button
					class="button"
					disabled={!this.state.team || this.state.copyButtonMsg}
					onClick={() => this.copyTeam()}
				>{this.state.copyButtonMsg ? 'Copied!' : 'Copy team'}</button>
				<button class="button" onClick={() => this.changeDisplayMode()}>Display: {is2Col ? '2-column' : '1-column'}</button>
				<button class="button" onClick={() => this.changeColorMode()}>Use {isDark ? 'light' : 'dark'} mode</button>
				<select
					onChange={ev => this.changeSpriteGen(ev)}
					value={this.state.spriteGen}
					class="button"
				>
					{[1, 2, 3, 4, 5, 6].map(num => <option value={num}>Gen {num} Sprites</option>)}
				</select>
			</div>
			<hr />
			{this.state.editError && <>
				<div class="message-error">{this.state.editError}</div>
				<hr />
			</>}
			{this.state.manageOpen && <>
				<label>Team visibility: </label>
				<select
					class="button"
					value={this.state.teamEdits?.private || this.state.team.private ? 1 : 0}
					onChange={ev => this.editTeamValue('private', ev)}
				>
					{[1, 0].map(n => <option value={n}>{n ? 'private' : 'public'}</option>)}
				</select><br />
				<label>Team format: </label><input onInput={ev => this.editTeamValue('format', ev)} />
				{this.state.changesMade && <>
					<br /><button class="button notifying" onClick={() => this.commitEdit()}>Save changes</button>
				</>}
				<hr />
			</>}
			<div
				name="sets"
				style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', rowGap: '1rem', colGap: is2Col ? '2rem' : '' }}
			>
				{teamData.map(
					set => (
						<div style={{ flex: `0 0 ${is2Col ? 50 : 100}%` }}>
							<span style={{ display: 'flex' }}>
								<SetBlock set={set} gen={this.state.spriteGen} mode={this.state.displayMode} />
							</span>
						</div>
					)
				)}
			</div>
		</div>;
	}
	checkTeamID() {
		if (this.id.includes('-')) {
			[this.id, this.pw] = this.id.split('-');
		}
		if (!/^\d+$/.test(this.id)) {
			this.setState({ error: "Invalid team ID: " + JSON.stringify(this.props.args) });
			return;
		}
		this.loadTeamData();
	}

	changeManage() {
		this.setState({ manageOpen: !this.state.manageOpen });
	}

	changeSpriteGen(event: any) {
		localStorage.setItem('spritegen', `${event.target.value}`);
		this.setState({ spriteGen: event.target.value });
	}

	changeDisplayMode() {
		if (this.state.displayMode === '2col') {
			this.state.displayMode = 'default';
		} else {
			this.state.displayMode = '2col';
		}
		localStorage.setItem('teamdisplaymode', this.state.displayMode);
		this.setState({ displayMode: this.state.displayMode });
	}

	changeColorMode() {
		const classList = document.querySelector('html')?.classList;
		const isDark = classList?.[0] === 'dark';
		if (isDark) {
			classList.remove('dark');
			localStorage.removeItem('darkmode');
		} else {
			classList?.add('dark');
			localStorage.setItem('darkmode', 'true');
		}
		// not something we keep in elem state but... still gotta poke it to update
		this.forceUpdate();
	}

	loadTeamData() {
		void Net('/api/getteam').get({ query: { teamid: this.id, password: this.pw, full: 1 } }).then(resultText => {
			if (resultText.startsWith(']')) resultText = resultText.slice(1);
			let result;
			try {
				result = JSON.parse(resultText);
			} catch {
				result = { actionerror: "Malformed response received. Try again later." };
			}
			if (result.actionerror) {
				this.setState({ error: result.actionerror });
			} else {
				this.setState({ team: result.team === null ? result.team : result });
			}
		}).catch(e => {
			this.setState({ error: `HTTP${e.code}: ${e.message}` });
		});
	}

	copyTeam() {
		if (!this.state.team) return;
		const team = unpackTeam(this.state.team.team);
		navigator.clipboard.writeText(team.map(exportSet).join('\n'));
		this.setState({ copyButtonMsg: true });
		setTimeout(() => {
			this.setState({ copyButtonMsg: false });
		}, 1000);
	}

	editTeamValue(val: 'format' | 'private', { currentTarget }: any) {
		(this.state.teamEdits ||= {})[val] = currentTarget.value;
		let changes;
		if (val === 'format') {
			let format = toID(currentTarget.value);
			format = toID(BattleAliases[format]) || format;
			if (!/^gen\d+/.test(format)) {
				format = `gen9${format}`;
			}
			changes = changes || format !== this.state.team?.format;
		} else if (val === 'private') {
			changes = changes || currentTarget.value !== this.state.team?.private;
		}
		this.setState({
			teamEdits: this.state.teamEdits,
			changesMade: changes,
		});
	}

	commitEdit() {
		if (!this.state.changesMade || !this.state.team) return;
		void Net('/api/editteam').get({
			query: { teamid: this.id, ...this.state.teamEdits },
		}).then(resultText => {
			if (resultText.startsWith(']')) resultText = resultText.slice(1);
			let result;
			try {
				result = JSON.parse(resultText);
			} catch {
				result = { actionerror: "Malformed response received. Try again later." };
			}
			if (result.team.private !== this.state.team?.private) {
				history.pushState({}, '', new URL(
					location.href.split(this.id)[0] + this.id +
					(result.team.private ? `-${result.team.private}` : '')
				));
			}
			if (result.actionerror) {
				this.setState({ editError: result.actionerror, changesMade: false, teamEdits: null });
			} else {
				this.setState({ team: result.team, changesMade: false, teamEdits: null });
			}
		});
	}
}
