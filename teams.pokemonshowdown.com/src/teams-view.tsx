/** @jsx preact.h */
/** @jsxFrag preact.Fragment */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, PSIcon, unpackTeam } from './utils';
import { BattleLog } from '../../play.pokemonshowdown.com/src/battle-log';
import type { PageProps } from './teams';
import { Dex } from '../../play.pokemonshowdown.com/src/battle-dex';
import { BattleStatNames } from '../../play.pokemonshowdown.com/src/battle-dex-data';

interface Team {
	team: string;
	title: string;
	views: number;
	ownerid: string;
	format: string;
	teamid: string;
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
		{set.teraType ? <>Tera Type: {set.teraType}</> : <></>}

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

export class TeamViewer extends preact.Component<PageProps> {
	id: string;
	pw?: string;
	override state = {
		team: undefined as null | void | Team, error: undefined as string | undefined,
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
					JSON.stringify(this.state) :
					<>
						<h2 class="message-error">Team not found.</h2><br />
						<em>Either it doesn't exist or it's password protected. Check the link?</em>
					</>
			}</div>;
		}
		const { team, title, ownerid, format, views } = this.state.team;
		const teamData = unpackTeam(team);
		const gen = Number(/\d+/.exec(format)?.[0]) || 6;

		return <div class="section" style={{ wordWrap: 'break-word' }}>
			<h2>{title}</h2>
			Owner: <strong style={{ color: BattleLog.usernameColor(ownerid as any) }}>{ownerid}</strong><br />
			Format: {format}<br />
			Views: {views}<br />
			<label>Shortlink: </label><a href={`https://psim.us/t/${this.id}`}>https://psim.us/t/{this.id}</a><br />
			<hr />
			<div name="sets" style={{ display: 'flex', flexWrap: 'wrap', rowGap: '1rem' }}>
				{teamData.map(
					set => <>
						<div style={{ flex: '0 0 20%' }}>
							<img src={
								Dex.getSpriteData(
									Dex.species.get(set.species),
									true,
									{ gen, shiny: set.shiny, gender: set.gender as 'F' }
								).url
							}
							/>
							{set.item ? <PSIcon item={set.item} /> : <></>}
						</div>
						<div style={{ flex: "0 0 80%", textAlign: 'left' }}>
							<PokemonSet set={set} />
						</div>
					</>
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
}
