/** @jsx preact.h */
import preact from 'preact';
import $ from 'jquery';
import {Net} from './utils';
import {PSRouter} from './replays';
import {Battle} from '../../../src/battle';
import {BattleLog} from '../../../src/battle-log';
import {BattleSound} from '../../../src/battle-sound';
declare function toID(input: string): string;

function showAd(id: string) {
  // @ts-expect-error
  window.top.__vm_add = window.top.__vm_add || [];

  //this is a x-browser way to make sure content has loaded.

  (function (success) {
    if (window.document.readyState !== "loading") {
      success();
    } else {
      window.document.addEventListener("DOMContentLoaded", function () {
        success();
      });
    }
  })(function () {
    var placement = document.createElement("div");
    placement.setAttribute("class", "vm-placement");
    if (window.innerWidth > 1000) {
      //load desktop placement
      placement.setAttribute("data-id", "6452680c0b35755a3f09b59b");
    } else {
      //load mobile placement
      placement.setAttribute("data-id", "645268557bc7b571c2f06f62");
    }
    document.querySelector("#" + id)!.appendChild(placement);
    // @ts-expect-error
    window.top.__vm_add.push(placement);
  });
}

export class BattleDiv extends preact.Component {
	override shouldComponentUpdate() {
		return false;
	}
	override render() {
		return <div class="battle" style={{position: 'relative'}}></div>;
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

export class BattlePanel extends preact.Component<{id: string}> {
  result: {
    uploadtime: number;
    id: string;
    format: string;
    p1: string;
    p2: string;
    log: string;
    views: number;
    p1id: string;
    p2id: string;
    rating: number;
    private: number;
    password: string;
  } | null | undefined = undefined;
  battle: Battle | null;
  speed = 'normal';
  /** debug purposes */
  lastUsedKeyCode = '0';
  turnView: boolean | string = false;
  autofocusTurnView: 'select' | 'end' | null = null;
  override componentDidMount() {
    this.loadBattle(this.props.id);
    showAd('LeaderboardBTF');
    window.onkeydown = this.keyPressed;
  }
  override componentWillReceiveProps(nextProps) {
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

    Net(`https://replay.pokemonshowdown.com/${this.stripQuery(id)}.json`).get().then(result => {
      const replay: NonNullable<BattlePanel['result']> = JSON.parse(result);
      this.result = replay;
      const $base = $(this.base!);
      this.battle = new Battle({
        id: replay.id,
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
      this.forceUpdate();
    }).catch(_ => {
      this.result = null;
      this.forceUpdate();
    });
  }
  override componentWillUnmount(): void {
    this.battle?.destroy();
    (window as any).battle = null;
    window.onkeydown = null;
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
  keyPressed = (e: KeyboardEvent) => {
    // @ts-ignore
    this.lastUsedKeyCode = `${e.keyCode}`;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.keyCode === 27 && this.turnView) { // Esc
      this.closeTurn();
      return;
    }
    // @ts-ignore
    if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'SELECT') return;
    switch (e.keyCode) {
    case 75: // k
      if (this.battle?.atQueueEnd) {
        this.replay();
      } else if (this.battle?.paused) {
        this.play();
      } else {
        this.pause();
      }
      break;
    case 74: // j
      if (e.shiftKey) this.firstTurn();
      else this.prevTurn();
      break;
    case 76: // l
      if (e.shiftKey) this.lastTurn();
      else this.nextTurn();
      break;
    case 188: // , (<)
      if (e.shiftKey) this.stepSpeed(-1);
      break;
    case 190: // . (>)
      if (e.shiftKey) this.stepSpeed(1);
      break;
    case 191: // / (?)
      if (e.shiftKey) {
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
    case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 0-9
    case 96: case 97: case 98: case 99: case 100: case 101: case 102: case 103: case 104: case 105: // numpad 0-9
      this.turnView = String.fromCharCode(e.keyCode - (e.keyCode >= 96 ? 48 : 0));
      if (this.turnView === '0') this.turnView = '10';
      this.autofocusTurnView = 'end';
      e.preventDefault();
      this.forceUpdate();
      break;
    case 77: // m
      this.toggleMute();
      break;
    }
    this.forceUpdate();
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
  goToTurn = (e) => {
		const turn = this.base?.querySelector<HTMLInputElement>('input[name=turn]')?.value;
		if (!turn?.trim()) return this.closeTurn(e);
		let turnNum = Number(turn);
		if (turn === 'e' || turn === 'end' || turn === 'f' || turn === 'finish') turnNum = Infinity;
		if (isNaN(turnNum) || turnNum < 0) alert("Invalid turn");
		this.battle?.seekTurn(turnNum);
    this.closeTurn(e);
  };
  switchViewpoint = () => {
    this.battle?.switchViewpoint();
    if (this.battle?.viewpointSwitched) {
      PSRouter.replace(this.stripQuery(this.props.id) + '?p2');
    } else {
      PSRouter.replace(this.stripQuery(this.props.id));
    }
  };
	clickDownload = (e: MouseEvent) => {
    if (!this.battle) {
      // should never happen
      alert("Wait for the battle to finish loading before downloading.");
      return;
    }
		let filename = (this.battle.tier || 'Battle').replace(/[^A-Za-z0-9]/g, '');

		// ladies and gentlemen, JavaScript dates
		const timestamp = (this.result?.uploadtime || 0) * 1000;
		const date = new Date(timestamp);
		filename += '-' + date.getFullYear();
		filename += (date.getMonth() >= 9 ? '-' : '-0') + (date.getMonth() + 1);
		filename += (date.getDate() >= 10 ? '-' : '-0') + date.getDate();

		filename += '-' + toID(this.battle.p1.name);
		filename += '-' + toID(this.battle.p2.name);

    const a = e.currentTarget as HTMLAnchorElement;
		a.href = BattleLog.createReplayFileHref({battle: this.battle});
		a.download = filename + '.html';

		e.stopPropagation();
	};
  changeSpeed = (e: Event | {target: HTMLSelectElement}) => {
    this.speed = (e.target as HTMLSelectElement).value;
    const fadeTable = {
      hyperfast: 40,
      fast: 50,
      normal: 300,
      slow: 500,
      reallyslow: 1000
    };
    const delayTable = {
      hyperfast: 1,
      fast: 1,
      normal: 1,
      slow: 1000,
      reallyslow: 3000
    };
    if (!this.battle) return;
    this.battle.messageShownTime = delayTable[this.speed];
    this.battle.messageFadeTime = fadeTable[this.speed];
    this.battle.scene.updateAcceleration();
  };
  stepSpeed(delta: number) {
    const target = this.base?.querySelector<HTMLSelectElement>('select[name=speed]');
    if (!target) return; // should never happen
    const values = ['reallyslow', 'slow', 'normal', 'fast', 'hyperfast'];
    const newValue = values[values.indexOf(target.value) + delta];
    if (newValue) {
      target.value = newValue;
      this.changeSpeed({target});
    }
  }
  toggleMute() {
    this.battle?.setMute(!BattleSound.muted);
    this.forceUpdate();
  }
  changeSound = (e: Event) => {
    const muted = (e.target as HTMLSelectElement).value;
    this.battle?.setMute(muted === 'off');
  };
  openTurn = (e: Event) => {
    this.turnView = `${this.battle?.turn}` || true;
    this.autofocusTurnView = 'select';
    e.preventDefault();
    this.forceUpdate();
  };
  closeTurn = (e?: Event) => {
    this.turnView = false;
    e?.preventDefault();
    this.forceUpdate();
  };
  renderNotFound() {
    return <div class={PSRouter.showingLeft() ? 'mainbar has-sidebar' : 'mainbar'}><section class="section" style={{maxWidth: '200px'}}>
      {/* <div style={{margin: '0 -20px'}}>
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-n.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-o.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-t.png" alt="" width={120} height={120} />
      </div>
      <div style={{margin: '-40px -20px 0'}}>
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-f.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-o.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-u.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-n.png" alt="" width={120} height={120} style={{marginRight: '-60px'}} />
        <img src="//play.pokemonshowdown.com/sprites/dex/unown-d.png" alt="" width={120} height={120} />
      </div> */}
      <div style={{textAlign: 'center'}}>
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-n.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-o.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-t.gif" alt="" style={{imageRendering: 'pixelated'}} />
      </div>
      <div style={{textAlign: 'center'}}>
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-f.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-o.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-u.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-n.gif" alt="" style={{imageRendering: 'pixelated'}} />
        <img src="//play.pokemonshowdown.com/sprites/gen5ani/unown-d.gif" alt="" style={{imageRendering: 'pixelated'}} />
      </div>
    </section><section class="section">
			<h1>Not Found</h1>
			<p>
				The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.
			</p>
			<p>
				In the future, remember to click <strong>Upload and share replay</strong> to save a replay permanently.
			</p>
    </section></div>;
  }
  renderControls() {
    const atEnd = this.battle?.atQueueEnd;
    const atStart = !this.battle?.started;

    if (this.turnView) {
      const value = this.turnView === true ? undefined : this.turnView;
      this.turnView = true;
      return <div class="replay-controls"><section class="section">
        <form onSubmit={this.goToTurn}>
          Turn? <input name="turn" autofocus value={value} inputMode="numeric" class="textbox" size={5} /> {}
          <button type="submit" class="button"><strong>Go</strong></button> {}
          <button type="button" class="button" onClick={this.closeTurn}>Cancel</button>
        </form>
      </section></div>;
    }

    return <div class="replay-controls">
      <p>
        {atEnd ?
          <button onClick={this.replay} class="button" style={{width: '5em'}}>
            <i class="fa fa-undo"></i><br />Replay
          </button>
        : this.battle?.paused ?
          <button onClick={this.play} class="button" style={{width: '5em'}}>
            <i class="fa fa-play"></i><br />Play
          </button>
        :
          <button onClick={this.pause} class="button" style={{width: '5em'}}>
            <i class="fa fa-pause"></i><br />Pause
          </button>
        } {}
        <button class={"button button-first" + (atStart ? " disabled" : "")} onClick={this.firstTurn}>
          <i class="fa fa-fast-backward"></i><br />First turn
        </button>
        <button class={"button button-middle" + (atStart ? " disabled" : "")} onClick={this.prevTurn}>
          <i class="fa fa-step-backward"></i><br />Prev turn
        </button>
        <button class={"button button-middle" + (atEnd ? " disabled" : "")} onClick={this.nextTurn}>
          <i class="fa fa-step-forward"></i><br />Skip turn
        </button>
        <button class={"button button-last" + (atEnd ? " disabled" : "")} onClick={this.lastTurn}>
          <i class="fa fa-fast-forward"></i><br />Skip to end
        </button> {}
        <button class="button" onClick={this.openTurn}>
          <i class="fa fa-repeat"></i> Skip to turn...
        </button>
      </p>
      <p>
        <label class="optgroup">
          Speed:<br />
          <select name="speed" class="button" onChange={this.changeSpeed} value={this.speed}>
            <option value="hyperfast">Hyperfast</option>
            <option value="fast">Fast</option>
            <option value="normal">Normal</option>
            <option value="slow">Slow</option>
            <option value="reallyslow">Really slow</option>
          </select>
        </label> {}
        <label class="optgroup">
          Sound:<br />
          <select name="speed" class="button" onChange={this.changeSound} value={BattleSound.muted ? 'off' : 'on'}>
            <option value="on">On</option>
            <option value="off">Muted</option>
          </select>
        </label> {}
        <label class="optgroup">
          Viewpoint:<br />
          <button onClick={this.switchViewpoint} class={this.battle ? 'button' : 'button disabled'}>
            {(this.battle?.viewpointSwitched ? this.result?.p2 : this.result?.p1)} {}
            <i class="fa fa-random" aria-label="Switch viewpoint"></i>
          </button>
        </label>
      </p>
      {this.result ? <h1>
        <strong>{this.result.format}</strong>: {this.result.p1} vs. {this.result.p2}
      </h1> : <h1>
        <em>Loading...</em>
      </h1>}
      {this.result ? <p>
        <a class="button" href="#" onClick={this.clickDownload} style={{float: 'right'}}>
          <i class="fa fa-download" aria-hidden></i> Download
        </a>
        {this.result.uploadtime ? new Date(this.result.uploadtime * 1000).toDateString() : "Unknown upload date"}
        {this.result.rating ? [` | `, <em>Rating:</em>, ` ${this.result.rating}`] : ''}
        {/* {} <code>{this.keyCode}</code> */}
      </p> : <p>&nbsp;</p>}
      {!PSRouter.showingLeft() && <p>
        <a href="." class="button"><i class="fa fa-caret-left"></i> More replays</a>
      </p>}
    </div>;
  }
  override render() {
    if (this.result === null) return this.renderNotFound();

    let position: any = {};
    if (PSRouter.showingLeft()) {
      if (PSRouter.stickyRight) {
        position = {position: 'sticky', top: '0'};
      } else {
        position = {position: 'sticky', bottom: '0'};
      }
    }

    return <div class={PSRouter.showingLeft() ? 'mainbar has-sidebar' : 'mainbar'} style={position}><div style={{position: 'relative'}}>
      <BattleDiv />
      <BattleLogDiv />
      {this.renderControls()}
      <div id="LeaderboardBTF"></div>
    </div></div>;
  }
}
