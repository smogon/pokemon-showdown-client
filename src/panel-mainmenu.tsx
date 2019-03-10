/**
 * Main menu panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class MainMenuRoom extends PSRoom {
	readonly classType: string = 'mainmenu';
	userdetailsCache: {[userid: string]: {
		userid: ID,
		avatar?: string | number,
		group?: string,
		rooms?: {[roomid: string]: {isPrivate?: true, p1?: string, p2?: string}},
	}} = {};
	receive(line: string) {
		const tokens = PS.lineParse(line);
		switch (tokens[0]) {
		case 'challstr':
			PSLoginServer.query({
				act: 'upkeep',
				challstr: tokens[1],
			}, res => {
				if (!res) return;
				if (!res.loggedin) return;
				this.send(`/trn ${res.username},0,${res.assertion}`);
			});
			return;
		case 'updateuser':
			PS.user.setName(tokens[1], tokens[2] === '1', tokens[3]);
			return;
		case 'queryresponse':
			this.handleQueryResponse(tokens[1] as ID, JSON.parse(tokens[2]));
			return;
		}
		const lobby = PS.rooms['lobby'];
		if (lobby) lobby.receive(line);
	}
	handleQueryResponse(id: ID, response: any) {
		switch (id) {
		case 'userdetails':
			let userid = response.userid;
			let userdetails = this.userdetailsCache[userid];
			if (!userdetails) {
				this.userdetailsCache[userid] = response;
			} else {
				Object.assign(userdetails, response);
			}
			const room = PS.rooms[`user-${userid}`] as UserRoom;
			if (room) room.update('');
			break;
		}
	}
}

class MainMenuPanel extends PSRoomPanel {
	focus() {
		(this.base!.querySelector('button.big') as HTMLButtonElement).focus();
	}
	render() {
		const searchButton = (PS.down ? <div class="menugroup" style="background: rgba(10,10,10,.6)">
			{PS.down === 'ddos' ?
				<p class="error"><strong>Pok&eacute;mon Showdown is offline due to a DDoS attack!</strong></p> :
				<p class="error"><strong>Pok&eacute;mon Showdown is offline due to technical difficulties!</strong></p>}
			<p>
				<div style={{textAlign: 'center'}}><img width="96" height="96" src="//play.pokemonshowdown.com/sprites/bw/teddiursa.png" alt="" /></div>
				Bear with us as we freak out.
			</p>
			<p>(We'll be back up in a few hours.)</p>
		</div> : <div class="menugroup">
			<p><button class="button mainmenu1 big" name="search"><strong>Battle!</strong><br /><small>Find a random opponent</small></button></p>
		</div>);
		const onlineButton = ' button' + (PS.connected ? '' : ' disabled');
		return <PSPanelWrapper room={this.props.room}>
			<div class="mainmenuwrapper">
				<div class="leftmenu">
					<div class="activitymenu">
						<div class="pmbox">
							<div class="pm-window news-embed" data-newsid="<!-- newsid -->">
								<h3><button class="closebutton" tabIndex={-1}><i class="fa fa-times-circle"></i></button><button class="minimizebutton" tabIndex={-1}><i class="fa fa-minus-circle"></i></button>News</h3>
								<div class="pm-log" style="max-height:none">
									<div class="newsentry"><h4>Test client</h4><p>Welcome to the test client! You can test client changes here!</p><p>&mdash;<strong>Zarel</strong> <small class="date">on Sep 25, 2015</small></p></div>
								</div>
							</div>
						</div>
					</div>
					<div class="mainmenu">
						{searchButton}

						<div class="menugroup">
							<p><button class="mainmenu2 button" name="joinRoom" value="teambuilder">Teambuilder</button></p>
							<p><button class="mainmenu3 button" name="joinRoom" value="ladder">Ladder</button></p>
						</div>

						<div class="menugroup">
							<p><button class={"mainmenu4" + onlineButton} name="joinRoom" value="battles">Watch a battle</button></p>
							<p><button class={"mainmenu5" + onlineButton} name="finduser">Find a user</button></p>
						</div>
					</div>
				</div>
				<div class="rightmenu" style={{display: PS.leftRoomWidth ? 'none' : 'block'}}>
					{PS.server.id === 'showdown' ?
					<div class="menugroup"><p><button class={"mainmenu1" + onlineButton} name="joinRoom" value="rooms">Join chat</button></p></div> :
					<div class="menugroup"><p><button class={"mainmenu1" + onlineButton} name="joinRoom" value="lobby">Join lobby chat</button></p></div>}
				</div>
				<div class="mainmenufooter">
					<div class="bgcredit"></div>
					<small><a href="//dex.pokemonshowdown.com/" target="_blank">Pok&eacute;dex</a> | <a href="//replay.pokemonshowdown.com/" target="_blank">Replays</a> | <a href="//pokemonshowdown.com/rules" target="_blank">Rules</a> | <a href="//pokemonshowdown.com/credits" target="_blank">Credits</a> | <a href="http://smogon.com/forums/" target="_blank">Forum</a></small>
				</div>
			</div>
		</PSPanelWrapper>;
	}
}

PS.roomTypes['mainmenu'] = {
	Model: MainMenuRoom,
	Component: MainMenuPanel,
};
