/**
 * Relumi Battle Stats Panel
 *
 * Displays detailed battle statistics, player leaderboards,
 * Pokemon usage, and meta trends. Appears in the right panel.
 *
 * @license MIT
 */

import { PS, PSRoom, type RoomOptions } from "./client-main";
import { PSPanelWrapper, PSRoomPanel, PSIcon } from "./panels";
import preact from "../js/lib/preact";

const API_URL = '/api/battlestats';

/** Formats tracked by the battle stats system. */
const FORMATS = [
	{ id: 'gen8relumisinglesrandom', label: '[Gen 8] Relumi Random Singles' },
	{ id: 'gen8relumidoublesrandom', label: '[Gen 8] Relumi Random Doubles' },
	{ id: 'gen8relumisinglesanythinggoes', label: '[Gen 8] Relumi Singles Anything Goes' },
	{ id: 'gen8relumisinglesubers', label: '[Gen 8] Relumi Singles Ubers' },
	{ id: 'gen8relumisinglesou', label: '[Gen 8] Relumi Singles OU' },
	{ id: 'gen8relumidoublesanythinggoes', label: '[Gen 8] Relumi Doubles Anything Goes' },
	{ id: 'gen8relumidoublesubers', label: '[Gen 8] Relumi Doubles Ubers' },
	{ id: 'gen8relumidoublesou', label: '[Gen 8] Relumi Doubles OU' },
	{ id: 'all', label: 'All Formats' },
];

// ---- Room ----

export class StatsRoom extends PSRoom {
	override readonly classType: string = 'battlestats';
	constructor(options: RoomOptions) {
		super(options);
	}
}

// ---- Types ----

type LeaderboardTab = 'topByBattles' | 'topByWinRate' | 'topByCurrentWinStreak';

interface StatsState {
	format: string;
	range: string;
	loading: boolean;
	error: string | null;
	data: any | null; // BattleStatsApiResponse
	leaderboardTab: LeaderboardTab;
	sortCol: string;
	sortAsc: boolean;
	expandedSpecies: string | null;
	searchQuery: string;
}

// ---- Panel ----

class StatsPanel extends PSRoomPanel<StatsRoom> {
	static readonly id = 'battlestats';
	static readonly routes = ['battlestats'];
	static readonly Model = StatsRoom;
	static readonly location = 'right';
	static readonly title = 'Battle Stats';
	static readonly icon = <i class="fa fa-bar-chart" aria-hidden></i>;

	override state: StatsState = {
		format: FORMATS[0].id,
		range: '7d',
		loading: true,
		error: null,
		data: null,
		leaderboardTab: 'topByBattles',
		sortCol: 'usagePct',
		sortAsc: false,
		expandedSpecies: null,
		searchQuery: '',
	};

	override componentDidMount() {
		super.componentDidMount();
		this.fetchData();
	}

	fetchData = async () => {
		this.setState({ loading: true, error: null, searchQuery: '' });
		try {
			const { format, range } = this.state;
			const url = `${API_URL}?format=${encodeURIComponent(format)}&range=${encodeURIComponent(range)}`;
			const res = await fetch(url);
			if (!res.ok) {
				// Try to parse error body for more detail
				let detail = '';
				try { const errBody = await res.json(); detail = errBody.error || ''; } catch {}
				throw new Error(detail || `Server returned ${res.status}${res.status === 502 ? ' (game server unavailable)' : ''}`);
			}
			// Verify we got JSON before parsing
			const contentType = res.headers.get('content-type') || '';
			if (!contentType.includes('application/json')) {
				throw new Error(
					'Stats API returned non-JSON response. ' +
					'Make sure the game server is running on port 8000.'
				);
			}
			const data = await res.json();
			this.setState({ data, loading: false });
		} catch (err: any) {
			this.setState({ error: err.message || 'Unknown error', loading: false });
		}
	};

	handleChangeFormat = (ev: Event) => {
		this.setState({ format: (ev.currentTarget as HTMLSelectElement).value }, this.fetchData);
	};

	handleChangeRange = (ev: Event) => {
		this.setState({ range: (ev.currentTarget as HTMLSelectElement).value }, this.fetchData);
	};

	setTab = (tab: LeaderboardTab) => this.setState({ leaderboardTab: tab });

	setSort = (col: string) => {
		this.setState((prev: StatsState) => ({
			sortCol: col,
			sortAsc: prev.sortCol === col ? !prev.sortAsc : false,
		}));
	};

	toggleExpand = (species: string) => {
		this.setState((prev: StatsState) => ({
			expandedSpecies: prev.expandedSpecies === species ? null : species,
		}));
	};

	// ---- Render ----

	override render() {
		return <PSPanelWrapper room={this.props.room}>
			<div class="pad">
				{this.renderControls()}
				{this.state.loading && <div class="message message-loading"><p>Loading stats...</p></div>}
				{this.state.error && <div class="message message-error"><p>{this.state.error}</p></div>}
				{!this.state.loading && !this.state.error && this.renderContent()}
			</div>
		</PSPanelWrapper>;
	}

	renderControls() {
		return <div style="margin-bottom: 1em;">
			<select class="button" value={this.state.format} onChange={this.handleChangeFormat} style="min-width: 180px;">
				{FORMATS.map(f => <option value={f.id}>{f.label}</option>)}
			</select>
			{' '}
			<select class="button" value={this.state.range} onChange={this.handleChangeRange}>
				<option value="7d">Last 7 Days</option>
				<option value="30d">Last 30 Days</option>
				<option value="all">All Time</option>
			</select>
			{' '}
			<button class="button" onClick={this.fetchData}>
				<i class="fa fa-refresh"></i> Refresh
			</button>
			{' '}
			<input
				class="textbox stats-search"
				type="text"
				placeholder="Filter pokémon..."
				value={this.state.searchQuery}
				onInput={(ev: Event) => this.setState({ searchQuery: (ev.target as HTMLInputElement).value })}
			/>
		</div>;
	}

	renderContent() {
		const categories = this.state.data?.categories || [];
		if (!categories.length) {
			return <div class="message message-info"><p>No battle data found for this format and range.</p></div>;
		}

		return <div>
			{categories.map((cat: any) => <div class="stats-category" key={cat.id}>
				<h3 class="stats-cat-header">{cat.displayFormat || cat.label}</h3>
				{this.renderOverview(cat.battleStats)}
				{this.renderHighlights(cat.pokemonUsage)}
				{this.renderLeaderboards(cat.userLeaderboard)}
				{this.renderTrends(cat.metaTrends)}
				{this.renderUsage(cat.pokemonUsage)}
			</div>)}
		</div>;
	}

	// ---- Usage Highlights ----

	renderHighlights(usage: any) {
		if (!usage) return null;
		const { highestWinRatePokemon, lowestWinRatePokemon, mostVersatilePokemon, mostDominantPokemon } = usage;

		// Don't render if no highlight data available
		if (!highestWinRatePokemon && !lowestWinRatePokemon && !mostVersatilePokemon && !mostDominantPokemon) {
			return null;
		}

		return <div class="stats-section">
			<h4>Usage Highlights</h4>
			<div class="stats-highlights">
				{highestWinRatePokemon && <div class="stats-highlight-card highlight-good">
					<span class="highlight-label">Highest Win Rate</span>
					<PSIcon pokemon={highestWinRatePokemon.species} />
					<strong class="highlight-mon">{highestWinRatePokemon.species}</strong>
					<em class="highlight-val">{highestWinRatePokemon.winRate.toFixed(1)}%</em>
				</div>}
				{lowestWinRatePokemon && <div class="stats-highlight-card highlight-bad">
					<span class="highlight-label">Lowest Win Rate</span>
					<PSIcon pokemon={lowestWinRatePokemon.species} />
					<strong class="highlight-mon">{lowestWinRatePokemon.species}</strong>
					<em class="highlight-val">{lowestWinRatePokemon.winRate.toFixed(1)}%</em>
				</div>}
				{mostVersatilePokemon && <div class="stats-highlight-card highlight-info">
					<span class="highlight-label">Most Versatile</span>
					<PSIcon pokemon={mostVersatilePokemon.species} />
					<strong class="highlight-mon">{mostVersatilePokemon.species}</strong>
					<em class="highlight-val">{mostVersatilePokemon.combinations} sets</em>
				</div>}
				{mostDominantPokemon && <div class="stats-highlight-card highlight-warn">
					<span class="highlight-label">Most Dominant</span>
					<PSIcon pokemon={mostDominantPokemon.species} />
					<strong class="highlight-mon">{mostDominantPokemon.species}</strong>
					<em class="highlight-val">{(mostDominantPokemon.dominantScore * 100).toFixed(1)}%</em>
				</div>}
			</div>
		</div>;
	}

	// ---- Overview Metrics ----

	renderOverview(stats: any) {
		if (!stats) return null;

		const metrics = [
			{ label: 'All-Time Battles', value: stats.totalBattlesAllTime.toLocaleString() },
			{ label: 'Last 24h', value: stats.battlesLast24h.toLocaleString() },
			{ label: 'Last 7 Days', value: stats.battlesLast7d.toLocaleString() },
			{ label: 'Last 30 Days', value: stats.battlesLast30d.toLocaleString() },
			{ label: 'Avg Battles/Day (30d)', value: stats.averageBattlesPerDay30d.toFixed(1) },
			{ label: 'Avg Turns/Battle', value: stats.averageBattleDurationTurns ? stats.averageBattleDurationTurns.toFixed(1) : 'N/A' },
			{ label: 'Forfeit/DC Rate', value: (stats.forfeitDisconnectRate * 100).toFixed(1) + '%' },
			{ label: 'Peak Hour (UTC)', value: stats.peakHourOfDay !== null ? stats.peakHourOfDay + ':00' : 'N/A' },
		];

		return <div class="stats-section">
			<h4>Overview</h4>
			<div class="stats-metrics">
				{metrics.map(m => <div class="stats-metric">
					<span>{m.label}</span><strong>{m.value}</strong>
				</div>)}
			</div>
		</div>;
	}

	// ---- Leaderboards ----

	renderLeaderboards(boards: any) {
		if (!boards) return null;

		const { leaderboardTab } = this.state;
		const rows = boards[leaderboardTab] || [];
		const isStreak = leaderboardTab === 'topByCurrentWinStreak';

		return <div class="stats-section">
			<h4>Player Leaderboards</h4>
			<div class="stats-tabs">
				<button
					class={`button stats-tab${leaderboardTab === 'topByBattles' ? ' cur' : ''}`}
					onClick={() => this.setTab('topByBattles')}
				>Most Battles</button>
				<button
					class={`button stats-tab${leaderboardTab === 'topByWinRate' ? ' cur' : ''}`}
					onClick={() => this.setTab('topByWinRate')}
				>Highest Win Rate</button>
				<button
					class={`button stats-tab${leaderboardTab === 'topByCurrentWinStreak' ? ' cur' : ''}`}
					onClick={() => this.setTab('topByCurrentWinStreak')}
				>Win Streaks</button>
			</div>
			<div class="stats-tab-content">
				<table class="stats-table">
					<thead>
						<tr>
							<th>#</th>
							<th>Player</th>
							{isStreak ? <th>Streak</th> : null}
							<th>Battles</th>
							{!isStreak ? <th>Wins</th> : null}
							{!isStreak ? <th>Win Rate</th> : null}
						</tr>
					</thead>
					<tbody>
						{!rows.length ? <tr><td colSpan={isStreak ? 4 : 5} class="stats-empty">No data yet</td></tr> :
							rows.map((r: any, i: number) => <tr key={r.user}>
								<td>{i + 1}</td>
								<td><strong>{r.user}</strong></td>
								{isStreak ? <td><strong>{r.currentWinStreak}</strong></td> : null}
								<td>{r.battles.toLocaleString()}</td>
								{!isStreak ? <td>{r.wins.toLocaleString()}</td> : null}
								{!isStreak ? <td>{r.winRate.toFixed(1)}%</td> : null}
							</tr>)
						}
					</tbody>
				</table>
			</div>
		</div>;
	}

	// ---- Pokemon Usage Table ----

	renderUsage(usage: any) {
		if (!usage || !usage.pokemon?.length) {
			return <div class="stats-section">
				<h4>Pok&eacute;mon Usage</h4>
				<p class="stats-empty">No pok&eacute;mon data yet.</p>
			</div>;
		}

		const { sortCol, sortAsc, searchQuery } = this.state;

		// Filter by search query (case-insensitive match against species name)
		const filteredPokemon = searchQuery
			? usage.pokemon.filter((p: any) =>
				p.species.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: usage.pokemon;

		// Show a "no results" message if filter matches nothing
		if (searchQuery && !filteredPokemon.length) {
			return <div class="stats-section">
				<h4>Pok&eacute;mon Usage <small>({usage.totalTeamSlots.toLocaleString()} team slots)</small></h4>
				<p class="stats-empty">No pok&eacute;mon match "{searchQuery}".</p>
			</div>;
		}

		// Sort pokemon by the selected column
		const sortedPokemon = [...filteredPokemon].sort((a: any, b: any) => {
			const diff = (a[sortCol] || 0) - (b[sortCol] || 0);
			return sortAsc ? diff : -diff;
		});

		const unfilteredCount = usage.pokemon.length;
		const filteredCount = filteredPokemon.length;

		const SortHeader = ({ col, label }: { col: string; label: string }) => (
			<th onClick={() => this.setSort(col)} class="sortable-header">
				{label} {sortCol === col ? <span class="sort-arrow">{sortAsc ? '\u25B2' : '\u25BC'}</span> : null}
			</th>
		);

		return <div class="stats-section">
			<h4>Pok&eacute;mon Usage <small>({usage.totalTeamSlots.toLocaleString()} team slots{searchQuery ? `, showing ${filteredCount} of ${unfilteredCount}` : ''})</small></h4>
			<div class="stats-tab-content">
				<table class="stats-table stats-usage-table">
					<thead>
						<tr>
							<th>#</th>
							<th>Pok&eacute;mon</th>
							<SortHeader col="usagePct" label="Usage %" />
							<SortHeader col="winRate" label="Win Rate" />
							<SortHeader col="dominantScore" label="Dominance" />
							<th>Top Ability</th>
							<th>Top Item</th>
							<th class="stats-moves-header">Top Moves</th>
							<SortHeader col="versatilityCount" label="Sets" />
						</tr>
					</thead>
					<tbody>
						{							sortedPokemon.map((p: any, i: number) => {
							const topAbility = p.abilities?.[0]
								? `${p.abilities[0].name} (${p.abilities[0].pct.toFixed(0)}%)` : '\u2014';
							const topMoves = p.moves?.length
								? p.moves.slice(0, 3).map((m: any) => `${m.name} (${m.pct.toFixed(0)}%)`).join(', ')
								: '\u2014';
							const isExpanded = this.state.expandedSpecies === p.species;

						return <preact.Fragment key={p.species}>
						<tr class={`stats-usage-row${isExpanded ? ' expanded' : ''}`} onClick={() => this.toggleExpand(p.species)}>
								<td>{i + 1}</td>
							<td class="stats-moncell">
								<span class="stats-expand-arrow">{isExpanded ? '▼' : '▶'}</span>
								<PSIcon pokemon={p.species} />{' '}
								<strong>{p.species}</strong>
							</td>
								<td>{p.usagePct ? p.usagePct.toFixed(2) + '%' : '\u2014'}</td>
								<td>{p.winRate ? p.winRate.toFixed(1) + '%' : '\u2014'}</td>
								<td>{p.dominantScore != null ? (p.dominantScore * 100).toFixed(1) + '%' : '\u2014'}</td>
								<td>{topAbility}</td>
								<td class="stats-itemcell">
									{p.items?.[0] ? <><PSIcon item={p.items[0].name} /> {p.items[0].name} ({p.items[0].pct.toFixed(0)}%)</> : '\u2014'}
								</td>
								<td class="stats-moves-cell">{topMoves}</td>
								<td>{p.versatilityCount}</td>
							</tr>
							{isExpanded && this.renderExpandedDetail(p)}
						</preact.Fragment>;
						})}
					</tbody>
				</table>
			</div>
		</div>;
	}

	// ---- Expanded Detail Row ----

	renderExpandedDetail(p: any) {
		// Helper: render a simple list of {name, pct} entries
		const renderSimpleList = (items: any[], showIcon: boolean) => {
			if (!items || !items.length) return <p class="stats-empty">No data</p>;
			return <ul class="stats-detail-list">
				{items.map((entry: any) => (
					<li class="stats-detail-item" key={entry.name}>
						<span class="stats-detail-label">
							{showIcon && <PSIcon item={entry.name} />}
							{entry.name}
						</span>
						<span class="stats-detail-pct">{entry.pct.toFixed(1)}%</span>
					</li>
				))}
			</ul>;
		};

		return <tr class="stats-expanded-row" key={`${p.species}-detail`}>
			<td colSpan={9} class="stats-expanded-cell">
				<div class="stats-detail-grid">
					<div class="stats-detail-col">
						<h5>Abilities</h5>
						{renderSimpleList(p.abilities, false)}
					</div>
					<div class="stats-detail-col">
						<h5>Items</h5>
						{renderSimpleList(p.items, true)}
					</div>
					<div class="stats-detail-col">
						<h5>Moves</h5>
						{renderSimpleList(p.moves, false)}
					</div>
				</div>
			</td>
		</tr>;
	}

	// ---- Meta Trends ----

	renderTrends(trends: any) {
		if (!trends) return null;

		return <div class="stats-section">
			<h4>Meta Trends</h4>
			{trends.mostCommonCore && <div class="stats-meta-item">
				<strong>Most Common Core:</strong> {trends.mostCommonCore.pokemonA} + {trends.mostCommonCore.pokemonB}{' '}
				<small>({trends.mostCommonCore.count} teams)</small>
			</div>}
			{trends.topCommonCores?.length > 1 && <ul class="stats-core-list">
				{trends.topCommonCores.slice(1, 6).map((core: any) =>
					<li key={core.pokemonA + core.pokemonB}>
						{core.pokemonA} + {core.pokemonB} ({core.count} teams)
					</li>
				)}
			</ul>}
			{trends.formatHealthIndicator !== undefined && <div class="stats-meta-item">
				<strong>Format Health:</strong> {(trends.formatHealthIndicator * 100).toFixed(1)}% unique player ratio
			</div>}
		</div>;
	}
}

PS.addRoomType(StatsPanel);
