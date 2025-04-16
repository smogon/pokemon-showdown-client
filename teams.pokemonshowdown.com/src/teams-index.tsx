/** @jsx preact.h */
/** @jsxFrag preact.Fragment */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import { Net, MiniTeam, type ServerTeam } from './utils';
import type { PageProps } from './teams';

declare const toID: (val: any) => string;

export class TeamIndex extends preact.Component<PageProps> {
	override state = {
		teams: [] as ServerTeam[],
		loggedIn: false as string | false,
		loading: true,
		search: null as string | null,
	};
	constructor(props: PageProps) {
		super(props);
		this.loadTeams();
	}
	loadTeams() {
		void Net('/api/getteams').get({ query: { full: 1 } }).then(resultText => {
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
	// todo: find proper type. preact docs unhelpful.
	onInput({ currentTarget }: any) {
		this.setState({ search: currentTarget.value });
	}
	searchMatch(team: ServerTeam) {
		const s = toID(this.state.search);
		if (!s) return true;
		if (!toID(this.state.search)) return true;
		if (toID(team.name).includes(s)) return true;
		if (toID(team.format).includes(s)) return true;
		if (team.team.split(',').map(toID).some(x => x.includes(s))) return true;
		if (`${team.teamid}`.startsWith(s)) return true;
		return false;
	}
	render() {
		if (this.state.loading) {
			return <div class="section" style={{ wordWrap: 'break-word' }}>Loading...</div>;
		}
		const teamsByFormat: Record<string, ServerTeam[]> = {};
		let i = 0;
		for (const team of this.state.teams) {
			// this way if a category is empty it doesn't just fill space, since it doesn't
			// get added unless it exists
			if (!this.searchMatch(team)) continue;
			if (!teamsByFormat[team.format]) teamsByFormat[team.format] = [];
			teamsByFormat[team.format].push(team);
			i++;
		}
		return <div class="section" style={{ wordWrap: 'break-word' }}>
			<h2>Hi, {this.state.loggedIn || "guest"}!</h2>
			<label>Upload a new team: </label>
			<a class="button" href={`//${Config.routes.client}/view-teams-upload`}>Go</a><br /><br />
			<label>Search all teams:</label> <a class="button" href="/search/">Go</a><br /><br />
			<label>Search your teams ({i}): </label>
			<input value={this.state.search || ""} onInput={e => this.onInput(e)} label="Search teams/formats"></input>
			<hr />
			{!this.state.teams.length ?
				<em>You have no teams lol</em> :
				Object.entries(teamsByFormat).map(([format, teams]) => (
					<><h4>{format}:</h4>
						<ul class="teamlist">{
							teams.map(team => <li><MiniTeam team={team} /></li>)
						}</ul>
						<hr /></>
				))}
		</div>;
	}
}
