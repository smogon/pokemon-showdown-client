/** @jsx preact.h */
import preact from 'preact';
import {Net, PSModel} from './utils';
import {BattlePanel} from './replays-battle';
declare function toID(input: string): string;

interface ReplayResult {
  uploadtime: number;
  id: string;
  format: string;
  p1: string;
  p2: string;
  password?: string;
  rating?: number;
}

class SearchPanel extends preact.Component<{id: string}> {
  results: ReplayResult[] | null = null;
  resultError: string | null = null;
  format = '';
  user = '';
  isPrivate = false;
  byRating = false;
  page = 1;
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
    this.updateSearch(Net.decodeQuery(this.props.id));
  }
  override componentDidUpdate(previousProps: this['props']) {
    if (this.props.id === previousProps.id) return;
    const query = Net.decodeQuery(this.props.id);
    const page = parseInt(query.page || '1');
    const byRating = (query.sort === 'rating');
    if (page !== this.page || byRating !== this.byRating) this.updateSearch(query);
  }
  updateSearch(query: {[k: string]: string}) {
    const user = query.user || '';
    const format = query.format || '';
    const page = parseInt(query.page || '1');
    const isPrivate = !!query.private;
    this.byRating = (query.sort === 'rating');
    this.search(user, format, isPrivate, page);
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
  search(user: string, format: string, isPrivate?: boolean, page = 1) {
    this.base!.querySelector<HTMLInputElement>('input[name=user]')!.value = user;
    this.base!.querySelector<HTMLInputElement>('input[name=format]')!.value = format;
    this.base!.querySelectorAll<HTMLInputElement>('input[name=private]')[isPrivate ? 1 : 0]!.checked = true;

    if (!format && !user) return this.recent();
    this.user = user;
    this.format = format;
    this.isPrivate = !!isPrivate;
    this.page = page;
    this.results = null;
    this.resultError = null;
    if (user || !format) this.byRating = false;

    if (!format && !user) {
      PSRouter.replace('')
    } else {
      PSRouter.replace('?' + Net.encodeQuery({
        user: user || undefined,
        format: format || undefined,
        private: isPrivate ? '1' : undefined,
        page: page === 1 ? undefined : page,
        sort: this.byRating ? 'rating' : undefined,
      }));
    }
    this.forceUpdate();
    Net(`/api/replays/${isPrivate ? 'searchprivate' : 'search'}`).get({
      query: {
        username: this.user,
        format: this.format,
        page,
        sort: this.byRating ? 'rating' : undefined,
      },
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
  modLink(overrides: {page?: number, sort?: string}) {
    const newPage = (overrides.page !== undefined ? this.page + overrides.page : 1);
    return './?' + Net.encodeQuery({
      user: this.user || undefined,
      format: this.format || undefined,
      private: this.isPrivate ? '1' : undefined,
      page: newPage === 1 ? undefined : newPage,
      sort: (overrides.sort ? overrides.sort === 'rating' : this.byRating) ? 'rating' : undefined,
    });
  }
  recent() {
    this.format = '';
    this.user = '';
    this.results = null;
    this.forceUpdate();
    Net('/api/replays/recent').get().then(response => {
      if (this.format !== '' || this.user !== '') return;
      this.parseResponse(response, true);
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
    const viewpointSwitched = (toID(replay.p2) === toID(this.user));
    return replay.id + (replay.password ? `-${replay.password}pw` : '') + (viewpointSwitched ? '?p2' : '');
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
    const activelySearching = !!(this.format || this.user);
    const hasNextPageLink = (this.results?.length || 0) > 50;
    const results = hasNextPageLink ? this.results!.slice(0, 50) : this.results;
    const searchResults = <ul class="linklist">
      {(this.resultError && <li>
        <strong class="message-error">{this.resultError}</strong>
      </li>) ||
      (!results && <li>
        <em>Loading...</em>
      </li>) ||
      (results?.map(result => <li>
        <a href={this.url(result)} class="blocklink">
          <small>[{this.formatid(result)}]{result.rating ? ` Rating: ${result.rating}` : ''}<br /></small>
          <strong>{result.p1}</strong> vs. <strong>{result.p2}</strong>
        </a>
      </li>))}
    </ul>;
    return <div class={PSRouter.showingRight() ? 'sidebar' : ''}>
      <section class="section first-section">
        <h1>Search replays</h1>
        <form onSubmit={this.submitForm}>
          <p>
            <label>
              Username:<br />
              <input type="search" class="textbox" name="user" placeholder="(blank = any user)" size={20} /> {}
              {this.loggedInUser && <button type="button" class="button" onClick={this.searchLoggedIn}>{this.loggedInUser}'s replays</button>}
            </label>
          </p>
          <p>
            <label>Format:<br />
            <input type="search" class="textbox" name="format" placeholder="(blank = any format)" size={30} /></label>
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
          {activelySearching && this.format && !this.user && <p>
            Sort by: {}
            <a href={this.modLink({sort: 'date'})} class={`button button-first${this.byRating ? '' : ' disabled'}`}>
              Date
            </a>
            <a href={this.modLink({sort: 'rating'})} class={`button button-last${this.byRating ? ' disabled' : ''}`}>
              Rating
            </a>
          </p>}
          {activelySearching && this.page > 1 && <p class="pagelink">
            <a href={this.modLink({page: -1})} class="button"><i class="fa fa-caret-up"></i><br />Page {this.page - 1}</a>
          </p>}
          {activelySearching && searchResults}
          {activelySearching && (this.results?.length || 0) > 50 && <p class="pagelink">
            <a href={this.modLink({page: 1})} class="button">Page {this.page + 1}<br /><i class="fa fa-caret-down"></i></a>
          </p>}
        </form>
      </section>
      {!activelySearching && <FeaturedReplays />}
      {!activelySearching && <section class="section">
        <h1>Recent replays</h1>
        <ul class="linklist">
          {searchResults}
        </ul>
      </section>}
    </div>;
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

export const PSRouter = new class extends PSModel {
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
      {PSRouter.showingLeft() && <SearchPanel id={PSRouter.leftLoc!} />}
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
