/** @jsx preact.h */
import preact from 'preact';
import {Net} from './utils';
import {Battle} from '../../../src/battle';
import {BattleSound} from '../../../src/battle-sound';
import $ from 'jquery';

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

class SearchPanel extends preact.Component {
  results: {
    uploadtime: number;
    id: string;
    format: string;
    p1: string;
    p2: string;
  }[] | null = null;
  format = '';
  user = '';
  sort = 'date';
  moreFun = false;
  moreCompetitive = false;
  override componentDidMount() {
    Net('https://replay.pokemonshowdown.com/search.json').get().then(result => {
      this.results = JSON.parse(result);
      this.forceUpdate();
    });
  }
  search(format: string, user: string) {
    this.format = format;
    this.user = user;
    this.results = null;
    this.moreFun = false;
    this.moreCompetitive = false;
    this.forceUpdate();
    Net('https://replay.pokemonshowdown.com/search.json').get({
      query: {user: this.user, format: this.format},
    }).then(result => {
      this.results = JSON.parse(result);
      this.forceUpdate();
    });
  }
  submitForm = (e: Event) => {
    e.preventDefault();
    // @ts-expect-error
    const format = document.getElementsByName('format')[0]?.value || '';
    // @ts-expect-error
    const user = document.getElementsByName('user')[0]?.value || '';
    this.search(format, user);
  };
  cancelForm = (e: Event) => {
    e.preventDefault();
    this.search('', '');
  };
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
    const searchResults = <ul class="linklist">
      {!this.results && <li>
        <em>Loading...</em>
      </li>}
      {this.results?.map(result => <li>
        <a href={result.id} class="blocklink">
          <small>[{result.format}]<br /></small>
          <strong>{result.p1}</strong> vs. <strong>{result.p2}</strong>
        </a>
      </li>)}
    </ul>;
    const activelySearching = !!(this.format || this.user);
    return <div><section class="section">
      <h1>Search replays</h1>
      <form onSubmit={this.submitForm}>
        <p><label>Username:<br /><input type="text" class="textbox" name="user" placeholder="(blank = any user)" size={25} /></label></p>
        <p><label>Format:<br /><input type="text" class="textbox" name="format" placeholder="(blank = any format)" size={35} /></label></p>
        <p><button type="submit" class="button"><i class="fa fa-search" aria-hidden></i> <strong>Search</strong></button> {activelySearching && <button class="button" onClick={this.cancelForm}>Cancel</button>}</p>
        {activelySearching && <h2>Results</h2>}
        {activelySearching && searchResults}
      </form>
    </section>{!activelySearching && <section class="section">
      <h1>Featured replays</h1>
      <ul class="linklist">
        <li><h2>Fun</h2></li>
        <li><a href="oumonotype-82345404" class="blocklink">
          <small>[oumonotype]<br /></small>
          <strong>kdarewolf</strong> vs. <strong>Onox</strong>
          <small><br />Protean + prediction</small>
        </a></li>
        <li><a href="anythinggoes-218380995" class="blocklink">
          <small>[anythinggoes]<br /></small>
          <strong>Anta2</strong> vs. <strong>dscottnew</strong>
          <small><br />Cheek Pouch</small>
        </a></li>
        <li><a href="uberssuspecttest-147833524" class="blocklink">
          <small>[ubers]<br /></small>
          <strong>Metal Brellow</strong> vs. <strong>zig100</strong>
          <small><br />Topsy-Turvy</small>
        </a></li>
        {!this.moreFun && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showMoreFun}>More <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.moreFun && <li><a href="smogondoubles-75588440" class="blocklink">
          <small>[smogondoubles]<br /></small>
          <strong>jamace6</strong> vs. <strong>DubsWelder</strong>
          <small><br />Garchomp sweeps 11 pokemon</small>
        </a></li>}
        {this.moreFun && <li><a href="ou-20651579" class="blocklink">
          <small>[ou]<br /></small>
          <strong>RainSeven07</strong> vs. <strong>my body is regi</strong>
          <small><br />An entire team based on Assist V-create</small>
        </a></li>}
        {this.moreFun && <li><a href="balancedhackmons7322360" class="blocklink">
          <small>[balancedhackmons]<br /></small>
          <strong>a ver</strong> vs. <strong>Shuckie</strong>
          <small><br />To a ver's frustration, PP stall is viable in Balanced Hackmons</small>
        </a></li>}
        <h2>Competitive</h2>
        <li><a href="doublesou-232753081" class="blocklink" style="white-space:normal">
          <small>[doubles ou]<br /></small>
          <strong>Electrolyte</strong> vs. <strong>finally</strong>
          <small><br />finally steals Electrolyte's spot in the finals of the Doubles Winter Seasonal by outplaying Toxic Aegislash.</small>
        </a></li>
        <li><a href="smogtours-gen5ou-59402" class="blocklink" style="white-space:normal">
          <small>[bw ou]<br /></small>
          <strong>Reymedy</strong> vs. <strong>Leftiez</strong>
          <small><br />Reymedy's superior grasp over BW OU lead to his claim of victory over Leftiez in the No Johns Tournament.</small>
        </a></li>
        <li><a href="smogtours-gen3ou-56583" class="blocklink" style="white-space:normal">
          <small>[adv ou]<br /></small>
          <strong>pokebasket</strong> vs. <strong>Alf'</strong>
          <small><br />pokebasket proved Blissey isn't really one to take a Focus Punch well in his victory match over Alf' in the Fuck Trappers ADV OU tournament.</small>
        </a></li>
        <li><a href="smogtours-ou-55891" class="blocklink" style="white-space:normal">
          <small>[oras ou]<br /></small>
          <strong>Marshall.Law</strong> vs. <strong>Malekith</strong>
          <small><br />In a "match full of reverses", Marshall.Law takes on Malekith in the finals of It's No Use.</small>
        </a></li>
        <li><a href="smogtours-ubers-54583" class="blocklink" style="white-space:normal">
          <small>[custom]<br /></small>
          <strong>hard</strong> vs. <strong>panamaxis</strong>
          <small><br />Dark horse panamaxis proves his worth as the rightful winner of The Walkthrough Tournament in this exciting final versus hard.</small>
        </a></li>
        {!this.moreCompetitive && <li style={{paddingLeft: '8px'}}>
          <button class="button" onClick={this.showMoreCompetitive}>More <i class="fa fa-caret-right" aria-hidden></i></button>
        </li>}
        {this.moreCompetitive && <li><a href="smogtours-ubers-34646" class="blocklink" style="white-space:normal">
          <small>[oras ubers]<br /></small>
          <strong>steelphoenix</strong> vs. <strong>Jibaku</strong>
          <small><br />In this SPL Week 4 battle, Jibaku's clever plays with Mega Sableye keep the momentum mostly in his favor.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-uu-36860" class="blocklink" style="white-space:normal">
          <small>[oras uu]<br /></small>
          <strong>IronBullet93</strong> vs. <strong>Laurel</strong>
          <small><br />Laurel outplays IronBullet's Substitute Tyrantrum with the sly use of a Shuca Berry Cobalion, but luck was inevitably the deciding factor in this SPL Week 6 match.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-gen5ou-36900" class="blocklink" style="white-space:normal">
          <small>[bw ou]<br /></small>
          <strong>Lowgock</strong> vs. <strong>Meridian</strong>
          <small><br />This SPL Week 6 match features impressive plays, from Jirachi sacrificing itself to paralysis to avoid a burn to some clever late-game switches.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="smogtours-gen4ou-36782" class="blocklink" style="white-space:normal">
          <small>[dpp ou]<br /></small>
          <strong>Heist</strong> vs. <strong>liberty32</strong>
          <small><br />Starting out as an entry hazard-filled stallfest, this close match is eventually decided by liberty32's efficient use of Aerodactyl.</small>
        </a></li>}
        {this.moreCompetitive && <li><a href="randombattle-213274483" class="blocklink" style="white-space:normal">
          <small>[randombattle]<br /></small>
          <strong>The Immortal</strong> vs. <strong>Amphinobite</strong>
          <small><br />Substitute Lugia and Rotom-Fan take advantage of Slowking's utility and large HP stat, respectively, in this high ladder match.</small>
        </a></li>}
      </ul>
    </section>}{!activelySearching && <section class="section">
      <h1>Recent replays</h1>
      <ul class="linklist">
        {searchResults}
      </ul>
    </section>}</div>;
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
  battle: Battle;
  speed = 'normal';
  override componentDidMount() {
    Net(`https://replay.pokemonshowdown.com/${this.props.id}.json`).get().then(result => {
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
      this.forceUpdate();
    }).catch(_ => {
      this.result = null;
      this.forceUpdate();
    });
    showAd('LeaderboardBTF');
  }
  override componentWillUnmount(): void {
    this.battle.destroy();
    (window as any).battle = null;
  }
  play = () => {
    this.battle.play();
  };
  replay = () => {
    this.battle.reset();
    this.battle.play();
    this.forceUpdate();
  };
  pause = () => {
    this.battle.pause();
  };
  nextTurn = () => {
    this.battle.seekBy(1);
  };
  prevTurn = () => {
    this.battle.seekBy(-1);
  };
  firstTurn = () => {
    this.battle.seekTurn(0);
  };
  lastTurn = () => {
    this.battle.seekTurn(Infinity);
  };
  goToTurn = () => {
		const turn = prompt('Turn?');
		if (!turn?.trim()) return;
		let turnNum = Number(turn);
		if (turn === 'e' || turn === 'end' || turn === 'f' || turn === 'finish') turnNum = Infinity;
		if (isNaN(turnNum) || turnNum < 0) alert("Invalid turn");
		this.battle.seekTurn(turnNum);
  };
  switchSides = () => {
    this.battle.switchSides();
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
    this.battle.messageShownTime = delayTable[this.speed];
    this.battle.messageFadeTime = fadeTable[this.speed];
    this.battle.scene.updateAcceleration();
  };
  changeSound = (e: Event) => {
    const muted = (e.target as HTMLSelectElement).value;
    this.battle.setMute(muted === 'off');
  };
  renderNotFound() {
    return <div><section class="section" style={{maxWidth: '200px'}}>
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
    return <div style={{maxWidth: 1100, position: 'relative', margin: '0 auto'}}><div>
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
          </button>
        </p>
        <p>
          <button class="button" onClick={this.switchSides}>
            <i class="fa fa-random"></i> Switch sides
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
          </label>
        </p>
        <h1 style={{fontWeight: 'normal'}}><strong>{this.result?.format}</strong>: {this.result?.p1} vs. {this.result?.p2}</h1>
        <p>
          Uploaded: {new Date(this.result?.uploadtime! * 1000 || 0).toDateString()}
          {this.result?.rating ? ` | Rating: ${this.result?.rating}` : ''}
        </p>
      </div>
      <div id="LeaderboardBTF"></div>
    </div></div>;
  }
}

class PSReplays extends preact.Component {
  override render() {
    return <div>{
      document.location.pathname === '/replays/' ? 
      <SearchPanel /> : <BattlePanel id={document.location.pathname.slice(9)} />
    }</div>;
  }
}

preact.render(<PSReplays />, document.getElementById('main')!);

if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
  document.body.className = 'dark';
}
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
  document.body.className = event.matches ? "dark" : "";
});
