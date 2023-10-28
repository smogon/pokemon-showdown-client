/** @jsx preact.h */
import preact from 'preact';
import {Net, PSModel} from './utils';
import {Battle} from '../../../src/battle';
import {BattleSound} from '../../../src/battle-sound';
import $ from 'jquery';
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

interface ReplayResult {
  uploadtime: number;
  id: string;
  format: string;
  p1: string;
  p2: string;
  password?: string;
}

class SearchPanel extends preact.Component {
  results: ReplayResult[] | null = null;
  resultError: string | null = null;
  format = '';
  user = '';
  loggedInUser: string | null = null;
  loggedInUserIsSysop = false;
  sort = 'date';
  override componentDidMount() {
    Net('check-login.php').get().then(result => {
      if (result.charAt(0) !== ']') return;
      const [userid, sysop] = result.slice(1).split(',');
      this.loggedInUser = userid;
      this.loggedInUserIsSysop = !!sysop;
      this.forceUpdate();
    });
    const user = decodeURIComponent(/\buser=([^&]*)/.exec(PSRouter.leftLoc || '')?.[1] || '');
    const format = decodeURIComponent(/\bformat=([^&]*)/.exec(PSRouter.leftLoc || '')?.[1] || '');
    const isPrivate = PSRouter.leftLoc!.includes('private=1');
    this.search(user, format, isPrivate);
  }
  parseResponse(response: string, isPrivate?: boolean) {
    this.results = null;
    this.resultError = null;

    if (isPrivate) {
      if (response.charAt(0) !== ']') {
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
  search(user: string, format: string, isPrivate?: boolean) {
    this.base!.querySelector<HTMLInputElement>('input[name=user]')!.value = user;
    this.base!.querySelector<HTMLInputElement>('input[name=format]')!.value = format;
    this.base!.querySelectorAll<HTMLInputElement>('input[name=private]')[isPrivate ? 1 : 0]!.checked = true;

    if (!format && !user) return this.recent();
    this.user = user;
    this.format = format;
    this.results = null;
    this.resultError = null;

    if (!format && !user) {
      PSRouter.replace('')
    } else {
      PSRouter.replace('?' + Net.encodeQuery({
        user: user || undefined,
        format: format || undefined,
        private: isPrivate ? '1' : undefined,
      }));
    }
    this.forceUpdate();
    Net(`/api/replays/${isPrivate ? 'searchprivate' : 'search'}`).get({
      query: {username: this.user, format: this.format},
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
  recent() {
    this.format = '';
    this.user = '';
    this.results = null;
    this.forceUpdate();
    Net('https://replay.pokemonshowdown.com/search.json').get().then(response => {
      if (this.format !== '' || this.user !== '') return;
      this.parseResponse(response);
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
    (this.base!.querySelector('input[name=user]') as HTMLInputElement).value = this.loggedInUser;
    this.submitForm(e);
  };
  url(replay: ReplayResult) {
    const sidesSwitched = (toID(replay.p2) === toID(this.user));
    return replay.id + (replay.password ? `-${replay.password}pw` : '') + (sidesSwitched ? '?p2' : '');
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
    const searchResults = <ul class="linklist">
      {(this.resultError && <li>
        <strong class="message-error">{this.resultError}</strong>
      </li>) ||
      (!this.results && <li>
        <em>Loading...</em>
      </li>) ||
      (this.results?.map(result => <li>
        <a href={this.url(result)} class="blocklink">
          <small>[{this.formatid(result)}]<br /></small>
          <strong>{result.p1}</strong> vs. <strong>{result.p2}</strong>
        </a>
      </li>))}
    </ul>;
    const activelySearching = !!(this.format || this.user);
    return <div class={PSRouter.showingRight() ? 'sidebar' : ''}><section class="section first-section">
      <h1>Search replays</h1>
      <form onSubmit={this.submitForm}>
        <p>
          <label>Username:<br />
          <input type="search" class="textbox" name="user" placeholder="(blank = any user)" size={25} /> {}
          {this.loggedInUser && <button type="button" class="button" onClick={this.searchLoggedIn}>{this.loggedInUser}'s replays</button>}</label>
        </p>
        <p>
          <label>Format:<br />
          <input type="search" class="textbox" name="format" placeholder="(blank = any format)" size={35} /></label>
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
        {activelySearching && searchResults}
      </form>
    </section>{!activelySearching && <FeaturedReplays />}{!activelySearching && <section class="section">
      <h1>Recent replays</h1>
      <ul class="linklist">
        {searchResults}
      </ul>
    </section>}</div>;
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
        <li><a href="oumonotype-82345404" class="blocklink">
          <small>[gen6-oumonotype]<br /></small>
          <strong>kdarewolf</strong> vs. <strong>Onox</strong>
          <small><br />Protean + prediction</small>
        </a></li>
        <li><a href="anythinggoes-218380995" class="blocklink">
          <small>[gen6-anythinggoes]<br /></small>
          <strong>Anta2</strong> vs. <strong>dscottnew</strong>
          <small><br />Cheek Pouch</small>
        </a></li>
        <li><a href="uberssuspecttest-147833524" class="blocklink">
          <small>[gen6-ubers]<br /></small>
          <strong>Metal Brellow</strong> vs. <strong>zig100</strong>
          <small><br />Topsy-Turvy</small>
        </a></li>
        {!this.moreFun && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showMoreFun}>More <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.moreFun && <li><a href="smogondoubles-75588440?p2" class="blocklink">
          <small>[gen6-smogondoubles]<br /></small>
          <strong>jamace6</strong> vs. <strong>DubsWelder</strong>
          <small><br />Garchomp sweeps 11 pokemon</small>
        </a></li>}
        {this.moreFun && <li><a href="ou-20651579?p2" class="blocklink">
          <small>[gen5-ou]<br /></small>
          <strong>RainSeven07</strong> vs. <strong>my body is regi</strong>
          <small><br />An entire team based on Assist V-create</small>
        </a></li>}
        {this.moreFun && <li><a href="balancedhackmons7322360?p2" class="blocklink">
          <small>[gen5-balancedhackmons]<br /></small>
          <strong>a ver</strong> vs. <strong>Shuckie</strong>
          <small><br />To a ver's frustration, PP stall is viable in Balanced Hackmons</small>
        </a></li>}
        <h2>Competitive</h2>
        <li><a href="doublesou-232753081" class="blocklink">
          <small>[gen6-doublesou]<br /></small>
          <strong>Electrolyte</strong> vs. <strong>finally</strong>
          <small><br />finally steals Electrolyte's spot in the finals of the Doubles Winter Seasonal by outplaying Toxic Aegislash.</small>
        </a></li>
        <li><a href="smogtours-gen5ou-59402" class="blocklink">
          <small>[gen5-ou]<br /></small>
          <strong>Reymedy</strong> vs. <strong>Leftiez</strong>
          <small><br />Reymedy's superior grasp over BW OU lead to his claim of victory over Leftiez in the No Johns Tournament.</small>
        </a></li>
        <li><a href="smogtours-gen3ou-56583" class="blocklink">
          <small>[gen3-ou]<br /></small>
          <strong>pokebasket</strong> vs. <strong>Alf'</strong>
          <small><br />pokebasket proved Blissey isn't really one to take a Focus Punch well in his victory match over Alf' in the Fuck Trappers ADV OU tournament.</small>
        </a></li>
        <li><a href="smogtours-ou-55891" class="blocklink">
          <small>[gen6-ou]<br /></small>
          <strong>Marshall.Law</strong> vs. <strong>Malekith</strong>
          <small><br />In a "match full of reverses", Marshall.Law takes on Malekith in the finals of It's No Use.</small>
        </a></li>
        <li><a href="smogtours-ubers-54583" class="blocklink">
          <small>[gen6-custom]<br /></small>
          <strong>hard</strong> vs. <strong>panamaxis</strong>
          <small><br />Dark horse panamaxis proves his worth as the rightful winner of The Walkthrough Tournament in this exciting final versus hard.</small>
        </a></li>
        {!this.moreCompetitive && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showMoreCompetitive}>More <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.moreCompetitive && <li><a href="smogtours-ubers-34646" class="blocklink">
          <small>[gen6-ubers]<br /></small>
          <strong>steelphoenix</strong> vs. <strong>Jibaku</strong>
          <small><br />In this SPL Week 4 battle, Jibaku's clever plays with Mega Sableye keep the momentum mostly in his favor.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-uu-36860" class="blocklink">
          <small>[gen6-uu]<br /></small>
          <strong>IronBullet93</strong> vs. <strong>Laurel</strong>
          <small><br />Laurel outplays IronBullet's Substitute Tyrantrum with the sly use of a Shuca Berry Cobalion, but luck was inevitably the deciding factor in this SPL Week 6 match.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-gen5ou-36900" class="blocklink">
          <small>[gen5-ou]<br /></small>
          <strong>Lowgock</strong> vs. <strong>Meridian</strong>
          <small><br />This SPL Week 6 match features impressive plays, from Jirachi sacrificing itself to paralysis to avoid a burn to some clever late-game switches.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-gen4ou-36782" class="blocklink">
          <small>[gen4-ou]<br /></small>
          <strong>Heist</strong> vs. <strong>liberty32</strong>
          <small><br />Starting out as an entry hazard-filled stallfest, this close match is eventually decided by liberty32's efficient use of Aerodactyl.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="randombattle-213274483" class="blocklink">
          <small>[gen6-randombattle]<br /></small>
          <strong>The Immortal</strong> vs. <strong>Amphinobite</strong>
          <small><br />Substitute Lugia and Rotom-Fan take advantage of Slowking's utility and large HP stat, respectively, in this high ladder match.</small>
        </a></li>}
      </ul>
    </section>;
  }
}

class BattleDiv extends preact.Component {
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

class BattlePanel extends preact.Component<{id: string}> {
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
  override componentDidMount() {
    this.loadBattle(this.props.id);
    showAd('LeaderboardBTF');
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
      if (id.includes('?p2')) {
        this.battle.switchSides();
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
  }
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
  goToTurn = () => {
		const turn = prompt('Turn?');
		if (!turn?.trim()) return;
		let turnNum = Number(turn);
		if (turn === 'e' || turn === 'end' || turn === 'f' || turn === 'finish') turnNum = Infinity;
		if (isNaN(turnNum) || turnNum < 0) alert("Invalid turn");
		this.battle?.seekTurn(turnNum);
  };
  switchSides = () => {
    this.battle?.switchSides();
    if (this.battle?.sidesSwitched) {
      PSRouter.replace(this.stripQuery(this.props.id) + '?p2');
    } else {
      PSRouter.replace(this.stripQuery(this.props.id));
    }
  };
  changeSpeed = (e: Event) => {
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
  changeSound = (e: Event) => {
    const muted = (e.target as HTMLSelectElement).value;
    this.battle?.setMute(muted === 'off');
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
  override render() {
    const atEnd = this.battle?.atQueueEnd;
    const atStart = !this.battle?.started;
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
      <div style={{paddingTop: 10}}>
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
          <button class="button" onClick={this.goToTurn}>
            <i class="fa fa-repeat"></i> Skip to turn...
          </button>
        </p>
        <p>
          <label class="optgroup">
            Speed<br />
            <select name="speed" class="button" onChange={this.changeSpeed} value={this.speed}>
              <option value="hyperfast">Hyperfast</option>
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
              <option value="reallyslow">Really slow</option>
            </select>
          </label> {}
          <label class="optgroup">
            Sound<br />
            <select name="speed" class="button" onChange={this.changeSound} value={BattleSound.muted ? 'off' : 'on'}>
              <option value="on">On</option>
              <option value="off">Muted</option>
            </select>
          </label> {}
          <label class="optgroup">
            Viewpoint<br />
            <button onClick={this.switchSides} class={this.battle ? 'button' : 'button disabled'}>
              {(this.battle?.sidesSwitched ? this.result?.p2 : this.result?.p1)} <i class="fa fa-random"></i>
            </button>
          </label>
        </p>
        {this.result ? <h1 style={{fontWeight: 'normal', fontSize: '18pt'}}>
          <strong>{this.result.format}</strong>: {this.result.p1} vs. {this.result.p2}
        </h1> : <h1 style={{fontSize: '18pt'}}>
          <em>Loading...</em>
        </h1>}
        {this.result ? <p>
          {this.result.uploadtime ? new Date(this.result.uploadtime * 1000).toDateString() : "Unknown upload date"}
          {this.result.rating ? ` | Rating: ${this.result.rating}` : ''}
        </p> : <p>&nbsp;</p>}
        {!PSRouter.showingLeft() && <p>
          <a href="." class="button"><i class="fa fa-caret-left"></i> More replays</a>
        </p>}
      </div>
      <div id="LeaderboardBTF"></div>
    </div></div>;
  }
}

const PSRouter = new class extends PSModel {
  baseLoc: string;
  leftLoc: string | null = null;
  rightLoc: string | null = null;
  forceSinglePanel = false;
  stickyRight = true;
  constructor() {
    super();
    const baseLocSlashIndex = document.location.href.lastIndexOf('/');
    this.baseLoc = document.location.href.slice(0, baseLocSlashIndex + 1);
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
    if (!href.startsWith(this.baseLoc)) return false;

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

class PSReplays extends preact.Component {
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
  }
  override render() {
    const position = PSRouter.showingLeft() && PSRouter.showingRight() && !PSRouter.stickyRight ?
      {display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'} : {};
    return <div class={'bar-wrapper' + (PSRouter.showingLeft() && PSRouter.showingRight() ? ' has-sidebar' : '')} style={position}>
      {PSRouter.showingLeft() && <SearchPanel />}
      {PSRouter.showingRight() && <BattlePanel id={PSRouter.rightLoc!} />}
      <div style={{clear: 'both'}}></div>
    </div>;
  }
}

preact.render(<PSReplays />, document.getElementById('main')!);

if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
  document.body.className = 'dark';
}
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
  document.body.className = event.matches ? "dark" : "";
});
