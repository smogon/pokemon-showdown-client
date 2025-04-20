/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import $ from 'jquery';
import { Net } from './utils';
import { PSRouter, PSReplays } from './replays';
import { Battle } from '../../play.pokemonshowdown.com/src/battle';
import { BattleLog } from '../../play.pokemonshowdown.com/src/battle-log';
import { BattleSound } from '../../play.pokemonshowdown.com/src/battle-sound';
import type { ID } from '../../play.pokemonshowdown.com/src/battle-dex';
declare function toID(input: string): string;

function showAd(id: string) {
	// @ts-expect-error no clue how to declare this one
	window.top.__vm_add = window.top.__vm_add || [];

	// this is a x-browser way to make sure content has loaded.

	(success => {
		if (window.document.readyState !== "loading") {
			success();
		} else {
			window.document.addEventListener("DOMContentLoaded", () => {
				success();
			});
		}
	})(() => {
		const placement = document.createElement("div");
		placement.setAttribute("class", "vm-placement");
		if (window.innerWidth > 1000) {
			// load desktop placement
			placement.setAttribute("data-id", "6452680c0b35755a3f09b59b");
		} else {
			// load mobile placement
			placement.setAttribute("data-id", "645268557bc7b571c2f06f62");
		}
		document.querySelector("#" + id)!.appendChild(placement);
		// @ts-expect-error no clue how to declare this one
		window.top.__vm_add.push(placement);
	});
}

export class BattleDiv extends preact.Component {
	override shouldComponentUpdate() {
		return false;
	}
	override render() {
		return <div class="battle" style={{ position: 'relative' }}></div>;
	}
}
class BattleLogDiv extends preact.Component {
	override shouldComponentUpdate() {
		return false;
	}
	override render() {
		return <div class="battle-log"></div>;
	}
}

export class BattlePanel extends preact.Component<{ id: string }> {
	result: {
		uploadtime: number,
		id: string,
		format: string,
		players: string[],
		log: string,
		views: number,
		rating: number,
		private: number,
		password: string,
	} | null | undefined = undefined;
	resultError = '';
	battle!: Battle | null;
	/** debug purposes */
	lastUsedKeyCode = '0';
	turnView: boolean | string = false;
	autofocusTurnView: 'select' | 'end' | null = null;
	override componentDidMount() {
		this.loadBattle(this.props.id);
		showAd('LeaderboardBTF');
		window.addEventListener('keydown', this.keyPressed);
	}
	override componentWillReceiveProps(nextProps: this['props']) {
		if (this.stripQuery(this.props.id) !== this.stripQuery(nextProps.id)) {
			this.loadBattle(nextProps.id);
		}
	}
	stripQuery(id: string) {
		return id.includes('?') ? id.slice(0, id.indexOf('?')) : id;
	}
	loadBattle(id: string) {
		if (this.battle) this.battle.destroy();
		this.battle = null;
		this.result = undefined;
		this.resultError = '';
		this.forceUpdate();

		const elem = document.getElementById(`replaydata-${id}`);
		const logElem = document.getElementById(`replaylog-${id}`);
		if (elem) {
			// we actually do need to wait for that update to finish so
			// loadResult definitely has access to $frame and $logFrame
			setTimeout(() => this.loadResult(elem.innerText, id, logElem?.innerText.replace(/<\\\//g, '</')), 1);
			return;
		}

		Net(`/${this.stripQuery(id)}.json`).get().then(result => {
			this.loadResult(result, id);
		}).catch(err => {
			this.loadResult(err.statusCode === 404 ? '' : String(err?.body || ''), id);
		});
	}
	loadResult(result: string, id: string, log = '') {
		try {
			const replay: NonNullable<BattlePanel['result']> = JSON.parse(result);
			replay.log ||= log;
			this.result = replay;
			const $base = $(this.base!);
			this.battle = new Battle({
				id: replay.id as ID,
				$frame: $base.find('.battle'),
				$logFrame: $base.find('.battle-log'),
				log: replay.log.split('\n'),
				isReplay: true,
				paused: true,
				autoresize: true,
			});
			// for ease of debugging
			(window as any).battle = this.battle;
			this.battle.subscribe(_ => {
				this.forceUpdate();
			});
			const query = Net.decodeQuery(id);
			if ('p2' in query) {
				this.battle.switchViewpoint();
			}
			if (query.turn || query.t) {
				this.battle.seekTurn(parseInt(query.turn || query.t, 10));
			}
		} catch (err: any) {
			this.result = null;
			this.resultError = result.startsWith('{') ? err.toString() : result;
		}
		this.forceUpdate();
	}
	override componentWillUnmount(): void {
		this.battle?.destroy();
		(window as any).battle = null;
		window.removeEventListener('keydown', this.keyPressed);
	}
	override componentDidUpdate(): void {
		if (this.autofocusTurnView === 'select') {
			this.base?.querySelector<HTMLInputElement>('input[name=turn]')?.select();
			this.autofocusTurnView = null;
		}
		if (this.autofocusTurnView === 'end') {
			const turnbox = this.base?.querySelector<HTMLInputElement>('input[name=turn]');
			turnbox?.setSelectionRange(2, 2);
			turnbox?.focus();
			this.autofocusTurnView = null;
		}
	}
	// @ts-expect-error really wish they let me assert that the target is an HTMLElement
	keyPressed = (e: KeyboardEvent) => {
		this.lastUsedKeyCode = `${e.code}`;
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

		if (e.key === 'Escape' && this.turnView) {
			this.closeTurn();
			return;
		}

		switch (e.key) {
		case 'k':
		case 'K':
			if (this.battle?.atQueueEnd) {
				this.replay();
			} else if (this.battle?.paused) {
				this.play();
			} else {
				this.pause();
			}
			break;
		case 'j':
			this.prevTurn();
			break;
		case 'J':
			this.firstTurn();
			break;
		case 'l':
			this.nextTurn();
			break;
		case 'L':
			this.lastTurn();
			break;
		case ',':
			if (e.shiftKey) this.stepSpeed(-1);
			break;
		case '.':
			if (e.shiftKey) this.stepSpeed(1);
			break;
		case '/':
		case '?':
			if (e.shiftKey) {
				console.log(
					'Keyboard Shortcuts:\n' +
					'k = play/pause\n' +
					'j = previous turn\n' +
					'l = next turn\n' +
					'Shift + j = first turn\n' +
					'Shift + l = last turn\n' +
					'm = mute/unmute\n' +
					'Shift + , (<) = slower\n' +
					'Shift + . (>) = faster\n' +
					'0-9 = skip to turn (start typing)\n' +
					'Shift + / (?) = Show this help'
				);
				alert(
					'k = play/pause\n' +
					'j = previous turn\n' +
					'l = next turn\n' +
					'J = first turn\n' +
					'L = last turn\n' +
					'm = mute\n' +
					'< = slower\n' +
					'> = faster\n' +
					'1-9 = skip to turn\n' +
					'? = keyboard shortcuts (this)\n'
				);
			}
			break;
		case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
			this.turnView = (e.key === '0' && this.turnView === true) ? '10' : e.key;
			this.autofocusTurnView = 'end';
			e.preventDefault();
			this.forceUpdate();
			break;
		case 'm':
		case 'M':
			this.toggleMute();
			break;
		}
	};
	play = () => {
		this.battle?.play();
	};
	replay = () => {
		this.battle?.reset();
		this.battle?.play();
		this.forceUpdate();
	};
	pause = () => {
		this.battle?.pause();
	};
	nextTurn = () => {
		this.battle?.seekBy(1);
	};
	prevTurn = () => {
		this.battle?.seekBy(-1);
	};
	firstTurn = () => {
		this.battle?.seekTurn(0);
	};
	lastTurn = () => {
		this.battle?.seekTurn(Infinity);
	};
	goToTurn = (e: Event) => {
		e.preventDefault();
		const turnInput = this.base?.querySelector<HTMLInputElement>('input[name=turn]');
		const turn = turnInput?.value;
		if (!turn?.trim()) return this.closeTurn();
		let turnNum = Number(turn);
		if (turn === 'e' || turn === 'end' || turn === 'f' || turn === 'finish') turnNum = Infinity;
		if (isNaN(turnNum) || turnNum < 0) {
			alert("Invalid turn number.");
			if (turnInput) turnInput.value = `${this.battle?.turn || 0}`;
			return;
		};
		this.battle?.seekTurn(turnNum);
		this.closeTurn();
	};
	switchViewpoint = () => {
		this.battle?.switchViewpoint();
		if (this.battle?.viewpointSwitched) {
			PSRouter.replace(this.stripQuery(this.props.id) + '?p2');
		} else {
			PSRouter.replace(this.stripQuery(this.props.id));
		}
		this.forceUpdate();
	};
	clickDownload = (e: MouseEvent) => {
		if (!this.battle) {
			// should never happen
			alert("Wait for the battle to finish loading before downloading.");
			e.preventDefault();
			return;
		}
		let filename = (this.battle.tier || 'Battle').replace(/[^A-Za-z0-9]/g, '');

		// ladies and gentlemen, JavaScript dates
		const timestamp = (this.result?.uploadtime || 0) * 1000;
		const date = timestamp ? new Date(timestamp) : new Date();
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		filename += `-${year}-${month}-${day}`;

		filename += '-' + toID(this.battle.p1.name || 'player1');
		filename += '-' + toID(this.battle.p2.name || 'player2');

		const a = e.currentTarget as HTMLAnchorElement;
		a.href = BattleLog.createReplayFileHref({ battle: this.battle });
		a.download = filename + '.html';
	};
	getSpeed() {
		if (!this.battle) return 'normal';
		if (this.battle.messageFadeTime <= 40) {
			return 'hyperfast';
		} else if (this.battle.messageFadeTime <= 100) {
			return 'fast';
		} else if (this.battle.messageFadeTime >= 1000) {
			return 'reallyslow';
		} else if (this.battle.messageFadeTime >= 500) {
			return 'slow';
		}
		return 'normal';
	}
	changeSpeed = (e: Event) => {
		const speed = (e.target as HTMLSelectElement).value;
		const fadeTable: { [key: string]: number } = {
			hyperfast: 40,
			fast: 50,
			normal: 300,
			slow: 500,
			reallyslow: 1000,
		};
		const delayTable: { [key: string]: number } = {
			hyperfast: 1,
			fast: 1,
			normal: 1,
			slow: 1000,
			reallyslow: 3000,
		};
		if (!this.battle) return;
		const speedKey = speed as keyof typeof fadeTable;
		if (fadeTable[speedKey] !== undefined) {
			this.battle.messageShownTime = delayTable[speedKey];
			this.battle.messageFadeTime = fadeTable[speedKey];
			this.battle.scene.updateAcceleration();
		}
		this.forceUpdate();
	};
	stepSpeed(delta: number) {
		const target = this.base?.querySelector<HTMLSelectElement>('select[name=speed]');
		if (!target) return;
		const values = ['reallyslow', 'slow', 'normal', 'fast', 'hyperfast'];
		const currentIndex = values.indexOf(target.value);
		const newIndex = currentIndex + delta;
		if (newIndex >= 0 && newIndex < values.length) {
			const newValue = values[newIndex];
			target.value = newValue;
			this.changeSpeed({ target } as unknown as Event);
		}
	}
	toggleMute() {
		const currentMute = BattleSound.muted;
		this.battle?.setMute(!currentMute);
		this.forceUpdate();
	}
	changeSound = (e: Event) => {
		const value = (e.target as HTMLSelectElement).value;
		const muted = (value === 'off');
		const musicOff = (value === 'musicoff');

		this.battle?.setMute(muted);

		// Wolfram Alpha says that default volume is 100 e^(-(2 log^2(2))/log(10)) which is around 65.881
		const DEFAULT_BGM_VOLUME = 65.88125800126558;
		BattleSound.setBgmVolume((musicOff || muted) ? 0 : DEFAULT_BGM_VOLUME);

		this.forceUpdate();
	};

	changeVolume = (e: Event) => {
		const volume = Number((e.target as HTMLInputElement).value);
		BattleSound.setBgmVolume(volume);
		BattleSound.setEffectVolume(volume);

		this.battle?.setMute(true);
		this.battle?.setMute(false);

		this.forceUpdate();
	};

	changeDarkMode = (e: Event) => {
		const darkmode = (e.target as HTMLSelectElement).value as ('auto' | 'dark' | 'light');
		PSReplays.darkMode = darkmode;
		PSReplays.updateDarkMode();
		this.forceUpdate();
	};
	openTurn = (e: Event) => {
		this.turnView = `${this.battle?.turn || '0'}`;
		this.autofocusTurnView = 'select';
		e.preventDefault();
		this.forceUpdate();
	};
	closeTurn = (e?: Event) => {
		this.turnView = false;
		e?.preventDefault();
		this.forceUpdate();
	};
	renderError(position: any) {
		if (this.resultError) {
			return <div class={PSRouter.showingLeft() ? 'mainbar has-sidebar' : 'mainbar'} style={position}>
				<section class="section">
					<h1>Error</h1>
					<p>
						{this.resultError}
					</p>
				</section>
			</div>;
		}

		// In theory, this should almost never happen, because Replays will
		// never link to a nonexistent replay, but this might happen if e.g.
		// a replay gets deleted or made private after you searched for it
		// but before you clicked it.
		return <div class={PSRouter.showingLeft() ? 'mainbar has-sidebar' : 'mainbar'} style={position}>
			<section class="section section-notfound">
				<div class="notfound-images">
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-n.gif" alt="Unown N" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-o.gif" alt="Unown O" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-t.gif" alt="Unown T" />
				</div>
				<div class="notfound-images">
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-f.gif" alt="Unown F" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-o.gif" alt="Unown O" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-u.gif" alt="Unown U" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-n.gif" alt="Unown N" />
					<img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-d.gif" alt="Unown D" />
				</div>
			</section><section class="section">
				<h1>Not Found</h1>
				<p>
					The battle you're looking for has expired or could not be found. Battles expire after 15 minutes of inactivity unless they're saved.
				</p>
				<p>
					In the future, remember to click <strong>Upload and share replay</strong> to save a replay permanently.
				</p>
			</section>
		</div>;
	}
	renderControls() {
		const atEnd = !this.battle || this.battle.atQueueEnd;
		const atStart = !this.battle?.started;

		if (this.turnView) {
			const value = typeof this.turnView === 'string' ? this.turnView : (this.battle?.turn || 0).toString();
			return <div class="replay-controls controls-turnview"><section class="section">
				<form onSubmit={this.goToTurn}>
					<label htmlFor="turnInput">Turn:</label> {}
					<input
						id="turnInput"
						name="turn"
						value={value}
						onInput={(e) => { this.turnView = (e.target as HTMLInputElement).value; this.forceUpdate(); }}
						inputMode="numeric"
						pattern="[0-9]*"
						class="textbox"
						size={5} /> {}
					<button type="submit" class="button"><strong>Go</strong></button> {}
					<button type="button" class="button" onClick={this.closeTurn}>Cancel</button>
				</form>
				<p>
					<em>Pro tip:</em> You don't need to click the button if you have a keyboard. Just start typing
					the turn number (or 'end') and press <kbd>Enter</kbd>. For more shortcuts, press <kbd>Shift</kbd>+<kbd>?</kbd> {}
					when not focused on an input field.
				</p>
			</section></div>;
		}

		let soundValue = 'on';
		if (BattleSound.muted) {
			soundValue = 'off';
		} else if (!BattleSound.bgmVolume) {
			soundValue = 'musicoff';
		}

		return <div class="replay-controls">
			<div class="controls-row">
				{atEnd && this.battle ? (
					<button onClick={this.replay} class="button" title="Replay (k)">
						<i class="fa fa-undo"></i><span class="label">Replay</span>
					</button>
				) : !this.battle || this.battle.paused ? (
					<button onClick={this.play} class="button" disabled={!this.battle} title="Play (k)">
						<i class="fa fa-play"></i><span class="label"><strong>Play</strong></span>
					</button>
				) : (
					<button onClick={this.pause} class="button" title="Pause (k)">
						<i class="fa fa-pause"></i><span class="label"><strong>Pause</strong></span>
					</button>
				)} {}
				<button class="button button-turnnav" disabled={atStart} onClick={this.firstTurn} title="First turn (Shift+J)">
					<i class="fa fa-fast-backward"></i><span class="label">First</span>
				</button>
				<button class="button button-turnnav" disabled={atStart} onClick={this.prevTurn} title="Previous turn (j)">
					<i class="fa fa-step-backward"></i><span class="label">Prev</span>
				</button>
				<button class="button button-turnnav" disabled={atEnd} onClick={this.nextTurn} title="Next turn (l)">
					<i class="fa fa-step-forward"></i><span class="label">Next</span>
				</button>
				<button class="button button-turnnav" disabled={atEnd} onClick={this.lastTurn} title="Last turn (Shift+L)">
					<i class="fa fa-fast-forward"></i><span class="label">Last</span>
				</button> {}
				<button class="button" onClick={this.openTurn} title="Go to specific turn (0-9)">
					<i class="fa fa-repeat"></i><span class="label">Go to turn...</span>
				</button>
			</div>

			<div class="controls-row">
				<label class="optgroup">
					Speed <span class="shortcut-hint">(Shift+&lt;/&gt;)</span>:<br />
					<select name="speed" class="button" onChange={this.changeSpeed} value={this.getSpeed()}>
						<option value="hyperfast">Hyperfast</option>
						<option value="fast">Fast</option>
						<option value="normal">Normal</option>
						<option value="slow">Slow</option>
						<option value="reallyslow">Really slow</option>
					</select>
				</label> {}
				<label class="optgroup">
					Sound <span class="shortcut-hint">(m)</span>:<br />
					<select
						name="sound" class="button" onChange={this.changeSound}
						value={soundValue}
					>
						<option value="on">On</option>
						<option value="musicoff">Music Off</option>
						<option value="off">Muted</option>
					</select>
				</label> {}
				<label class="optgroup">
					Dark mode:<br />
					<select name="darkmode" class="button" onChange={this.changeDarkMode} value={PSReplays.darkMode || 'auto'}>
						<option value="auto">Automatic</option>
						<option value="dark">Dark</option>
						<option value="light">Light</option>
					</select>
				</label> {}
				<label class="optgroup">
					Viewpoint:<br />
					<button onClick={this.switchViewpoint} name="viewpoint" class={this.battle ? 'button' : 'button disabled'} disabled={!this.battle}>
						{(this.battle?.viewpointSwitched ? this.result?.players[1] : this.result?.players[0]) || (this.battle?.viewpointSwitched ? 'Player 2' : 'Player 1')} {}
						<i class="fa fa-random" aria-label="Switch viewpoint"></i>
					</button>
				</label> {}
				<label class="optgroup optgroup-volume">
					Volume:<br />
					<input
						type="range"
						min="0"
						max="100"
						step="1"
						value={BattleSound.getEffectVolume?.() ?? 50}
						onInput={this.changeVolume}
						aria-label="Volume Control"
						disabled={soundValue === 'off'}
					/>
				</label>
			</div>

			<div class="controls-info">
				{this.result ? <h1>
					<strong>{this.result.format}</strong>: {this.result.players.join(' vs. ')}
				</h1> : <h1>
					<em>Loading...</em>
				</h1>}
				{this.result ? <div class="battle-details">
					<span class="upload-time">
						{this.result.uploadtime ? new Date(this.result.uploadtime * 1000).toLocaleDateString() : "Unknown upload date"}
					</span>
					{this.result.rating ? <span class="rating"> | Rating: {this.result.rating}</span> : ''}
					{/* {} <code>{this.keyCode}</code> */}
					<a class="button download-button" href="/download" onClick={this.clickDownload} title="Download replay HTML file">
						<i class="fa fa-download" aria-hidden="true"></i> Download
					</a>
				</div> : <div class="battle-details">&nbsp;</div>}
			</div>

			{!PSRouter.showingLeft() && <div class="controls-sidebar-toggle">
				<a href={PSRouter.href(PSRouter.leftLoc)} class="button"><i class="fa fa-caret-left"></i> More replays</a>
			</div>}
		</div>;
	}
	override render() {
		let position: preact.JSX.CSSProperties = {};
		if (PSRouter.showingLeft()) {
			position = { position: 'sticky', top: '0' };
		}

		if (this.result === null || this.resultError) return this.renderError(position);

		return <div class={PSRouter.showingLeft() ? 'mainbar mainbar-hassidebar' : 'mainbar'} style={position}>
			<div class="battle-wrapper" style={{ position: 'relative' }}>
				<BattleDi
