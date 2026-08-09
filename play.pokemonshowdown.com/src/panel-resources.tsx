/**
 * A panel displaying lists of commands and some basic informational resources
 * @author mia-pi-git
 */
import { PS } from "./client-main";
import { PSPanelWrapper, PSRoomPanel } from "./panels";
import { PSUtils, toID } from "./battle-dex";
declare const BattleChatCommands: Record<string, string[]>;

class ResourcePanel extends PSRoomPanel {
	static readonly id = 'resources';
	static readonly routes = ['resources'];
	static readonly icon = <i class="fa fa-question-circle" aria-hidden></i>;
	static readonly title = 'Resources';

	override state = { search: '' };
	onChangeSearch = (e: Event) => {
		this.setState({ search: (e.currentTarget as HTMLInputElement).value });
	};

	getDetailsElements() {
		return this.base!.querySelectorAll<HTMLDetailsElement>('details.commandlist');
	}

	onToggleDetails = (e: Event) => {
		let someOpen = false;
		let allOpen = true;
		for (const detail of this.getDetailsElements()) {
			if (detail.open) {
				someOpen = true;
			} else {
				allOpen = false;
			}
		}

		const collapseAll = this.base!.querySelector<HTMLInputElement>('input[name=collapseall]');
		if (!collapseAll) return;
		collapseAll.checked = !allOpen;
		collapseAll.indeterminate = someOpen && !allOpen;
	};

	onToggleCollapseAll = (e: Event) => {
		const checked = (e.currentTarget as HTMLInputElement).checked;
		for (const detail of this.getDetailsElements()) {
			detail.open = !checked;
		}
	};
	override render() {
		const { room } = this.props;

		return <PSPanelWrapper room={room}>
			<div className="pad">
				<h2>PS! Informational Resources</h2>
				<hr />
				<p>
					PS! is a wide and varied site, with more facets than can be covered here easily.
					<br />
					While this page chiefly documents the ever-shifting set of commands available to PS! users, {}
					here are some useful resources for newcomers:
				</p>
				<ul>
					<li>
						<a href="https://www.smogon.com/forums/threads/3676132/">Beginner's Guide to Pokémon Showdown</a>
					</li>
					<li>
						<a href="https://www.smogon.com/dp/articles/intro_comp_pokemon">An introduction to competitive Pokémon</a>
					</li>
					<li>
						<a href="https://www.smogon.com/sm/articles/sm_tiers">What do 'OU', 'UU', etc mean?</a>
					</li>
					<li>
						<a href="https://www.smogon.com/dex/sv/formats/">What are the rules for each format?</a>
					</li>
					<li>
						<a href="https://www.smogon.com/sv/articles/clauses">What is 'Sleep Clause' and other clauses?</a>
					</li>
					<li>
						<a href="https://www.smogon.com/articles/getting-started">Next Steps for Competitive Battling</a>
					</li>
					<li>
						<button className="button" data-cmd="/report">Report a user</button>
					</li>
					<li>
						<button className="button" data-cmd="/join help">Join the Help room for live help</button>
					</li>
				</ul>
				<hr />
				<h3>Commands</h3>
				<p>
					Within any of the chats, and in private messages, {}
					it is possible to type in commands (messages beginning with <code>/</code>) {}
					to perform a particular action. A great number of these commands exist,  {}
					with some only available to certain users. For instance, you can broadcast commands to others with the {}
					<code>!</code> prefix, but only when you're a player in a battle or a Voice (+) user.
					<br />
					For more information on ranks, type <code>/groups</code> in any chat. {}
					You can also use the "chat self" button on your username in the top right  {}
					if you need a place to send these commands without joining a room.
				</p>

				<details class="readmore">
					<summary>Here's a list of the most useful commands for the average Pokémon Showdown experience:</summary>
					<p>
						COMMANDS: /report, /msg, /reply, /logout, {}
						/challenge, /search, /rating, /whois, /user, /join, /leave, /userauth, /roomauth
					</p>
					<p>
						BATTLE ROOM COMMANDS: /savereplay, /hideroom, /inviteonly, /invite, {}
						/timer, /forfeit
					</p>
					<p>
						OPTION COMMANDS: /nick, /avatar, /ignore, /status, /away, /busy, /back, /timestamps, {}
						/highlight, /showjoins, /hidejoins, /blockchallenges, /blockpms
					</p>
					<p>
						INFORMATIONAL/RESOURCE COMMANDS: /groups, /faq, /rules, /intro, /formatshelp, {}
						/othermetas, /analysis, /punishments, /calc, /git, /cap, /roomhelp, /roomfaq {}
						(replace / with ! to broadcast. Broadcasting requires: + % @ # ~)
					</p>
					<p>
						DATA COMMANDS: /data, /dexsearch, /movesearch, /itemsearch, /learn, {}
						/statcalc, /effectiveness, /weakness, /coverage, /randommove, /randompokemon</p>
					<p>For an overview of room commands, use <code>/roomhelp</code></p>
					<p>For details of a specific command, you can use <code>/help [command]</code>, for example <code>/help data</code>.</p>
				</details>

				<br />
				<p>
					A complete list of commands available to regular users is provided below. Use  {}
					<code>/help [commandname]</code> for more in-depth information on how to use them.
				</p>
				<hr />
				<h3>Search</h3>
				<p>
					<label class="checkbox" style={{ float: 'right' }}>
						<input
							type="checkbox" name="collapseall"
							onChange={this.onToggleCollapseAll}
						/> Collapse all
					</label>
					<input
						type="search" name="command-search" class="textbox" style={{ width: "50%" }}
						value={this.state.search} placeholder="Filter by command name"
						onInput={this.onChangeSearch}
					/>
				</p>
				<br />
				{this.getCommandList()}
			</div>
		</PSPanelWrapper>;
	}
	getCommandList() {
		if (typeof BattleChatCommands !== 'object') {
			document.addEventListener('ready', () => this.setState({ commandsLoaded: true }));
			return <>Loading command data, please try again in a few moments...</>;
		}
		const buf = [];
		const search = this.state.search;
		const keys = Object.keys(BattleChatCommands).filter(plugin => !(plugin.endsWith('admin')));
		PSUtils.sortBy(keys, key => [
			key.endsWith('info') ? 0 : // pin info to the top ALWAYS
			key.includes('chat-commands') ? 1 : // prefer default commands near the top too
			2,
			// number of matching commands
			BattleChatCommands[key].filter(x => toID(x).includes(search)).length,
			key,
		]);

		for (let pluginName of keys) {
			const cmdTable = BattleChatCommands[pluginName];
			if (!cmdTable.length) continue;
			let pluginSection = null;
			if (pluginName.startsWith('chat-plugins/')) {
				pluginSection = 'Chat plugin';
				pluginName = pluginName.slice('chat-plugins/'.length);
			} else if (pluginName.startsWith('chat-commands/')) {
				pluginSection = 'Core commands';
				pluginName = pluginName.slice('chat-commands/'.length);
			}
			let matchedCmds = [];
			for (const cmd of cmdTable) {
				if (search.length && !toID(cmd).includes(search)) {
					continue;
				}
				matchedCmds.push(<li>{cmd}</li>);
			}

			if (!matchedCmds.length) {
				buf.push(null);
				buf.push(null);
				continue;
			}
			buf.push(
				<details class="readmore commandlist" open onToggle={this.onToggleDetails}>
					<summary>
						<strong>{pluginName}</strong> {search.length ? <>({matchedCmds.length})</> : ''} {}
						{pluginSection && <small>[{pluginSection}]</small>}
					</summary>
					<ul>{matchedCmds}</ul>
				</details>
			);
			buf.push(<br />);
		}
		return buf;
	}
}

PS.addRoomType(ResourcePanel);
