// some setting-like stuff
Config.server = Config.server || 'sim.smogon.com';
Config.serverport = Config.serverport || 8000;
Config.serverprotocol = Config.serverprotocol || 'ws';

var socket;
var locPrefix = '/';
var servertoken = Config.server;
if (Config.urlPrefix) locPrefix += Config.urlPrefix;
var actionphp = '/~~' + Config.serverid + '/action.php';

// initialize sockets
var socket = null;
var me = {
	name: '',
	named: false,
	registered: false,
	userid: '',
	token: '',
	users: {},
	rooms: {},
	ignore: {},
	mute: $.cookie('showdown_mute'),
	lastChallengeNotification: '',
	pm: {},
	curPopup: '',
	popups: []
};
var rooms = {};
var curRoom = null;
var curTitle = 'Showdown!';
var battles = {};
var formats = [''];
var teams = [];

var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1 && navigator.userAgent.toLowerCase().indexOf("firefox") <= -1;

// 
function selectTab(tab, e) {
	if (e && e.preventDefault) e.preventDefault();
	if (!rooms[tab]) {
		joinTab(tab);
		return false;
	}
	if (curRoom && tab !== curRoom.id && curRoom.battle) {
		curRoom.battle.pause();
	}
	curRoom = rooms[tab];
	$('#main').children().hide();
	$('#leftbar a').removeClass('cur');
	$('#tab-' + tab).show();
	if (!$('#tabtab-' + tab).length) {
		updateRoomList();
	}
	$('#tabtab-' + tab).addClass('cur');
	if (curRoom && curRoom.battle) {
		curRoom.battle.setMute(me.mute);
		curRoom.battle.play();
	}
	curRoom.focus();
	$(window).scrollTop(51);
	if (tab === 'lobby') $('#backbutton').addClass('lobby');
	else $('#backbutton').removeClass('lobby');
	changeState(tab);
	updateLobbyChat(tab);
	return false;
}

function joinTab(tab) {
	if (tab === 'lobby') return;
	if (rooms.lobby) rooms.lobby.send('/join '+tab);
}

function leaveTab(tab, confirm) {
	if (rooms[tab]) {
		if (rooms[tab].me.side && rooms[tab].battle && rooms[tab].battle.rated && !rooms[tab].battleEnded && !confirm) {
			overlay('forfeit', tab);
			return;
		}
		rooms[tab].send('/leave');
		rooms[tab].dealloc();
		delete rooms[tab];
	}
	$('#tab-' + tab).remove();
	if (curRoom.id === tab) {
		curRoom = null;
		selectTab('lobby');
	} else {
		updateRoomList();
	}
}

function addTab(tab, type) {
	if (rooms[tab] && rooms[tab].elem) {
		if (tab !== 'lobby') selectTab(tab);
		return;
	}
	var elem;
	switch (type) {
	case 'lobby':
		$('#main').append('<div id="tab-' + tab + '" class="battle-tab"></div>');
		elem = $('#main').children().last();
		rooms[tab] = new Lobby(tab, elem);
		break;
	case 'teambuilder':
		$('#main').append('<div id="tab-' + tab + '" class="battle-tab"></div>');
		elem = $('#main').children().last();
		rooms[tab] = new Teambuilder(tab, elem);
		break;
	case 'ladder':
		$('#main').append('<div id="tab-' + tab + '" class="battle-tab"></div>');
		elem = $('#main').children().last();
		rooms[tab] = new Ladder(tab, elem);
		break;
	case 'battle':
		$('#main').append('<div id="tab-' + tab + '" class="battle-tab"></div>');
		elem = $('#main').children().last();
		rooms[tab] = new BattleRoom(tab, elem);
		break;
	default:
		$('#main').append('<div id="tab-' + tab + '" class="battle-tab">error</div>');
		var room = {
			id: tab,
			type: 'error'
		};
		room.elem = $('#main').children().last();
		rooms[tab] = room;
		break;
	}
	if (tab === loc || (tab !== 'lobby' && tab !== 'teambuilder' && tab !== 'ladder')) {
		selectTab(tab);
	} else {
		rooms[tab].elem.hide();
	}
}

function emit(socket, type, data) {
	if (Config.serverprotocol === 'io') {
		socket.emit(type, data);
	} else {
		if (typeof data === 'object') data.type = type;
		else data = {type: type, message: data};

		if (data.type === 'chat') {
			// if (window.console && console.log) console.log('>> '+data.room+'|'+data.message);
			socket.send(''+data.room+'|'+data.message);
		} else {
			socket.send($.toJSON(data));
		}
	}
}

function BattleRoom(id, elem) {
	var selfR = this;
	this.id = id;
	this.elem = elem;
	this.meIdent = {
		name: me.name,
		named: 'init'
	};
	this.notifying = false;
	me.rooms[id] = {};
	selfR.me = me.rooms[id];

	elem.html('<div class="battlewrapper"><div class="battle">Battle is here</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">Connecting...</div><div class="replay-controls"></div></div>');

	this.battleElem = elem.find('.battle');
	this.controlsElem = elem.find('.replay-controls');
	this.chatFrameElem = elem.find('.battle-log');
	this.chatElem = null;
	this.chatAddElem = elem.find('.battle-log-add');
	this.chatboxElem = null;
	this.joinElem = null;
	this.foeHintElem = elem.find('.foehint');

	this.battleEnded = false;

	this.dealloc = function () {
		if (selfR.battle) selfR.battle.dealloc();
	};
	this.focus = function () {
		selfR.updateMe();
		if (selfR.chatElem) selfR.chatFrameElem.scrollTop(selfR.chatElem.height());
		if (selfR.chatboxElem) selfR.chatboxElem.focus();
	};
	this.updateJoinButton = function () {
		if (selfR.battle.done) selfR.battleEnded = true;
		if (selfR.battleEnded) {
			selfR.controlsElem.html('<div class="controls"><em><button onclick="return rooms[\'' + selfR.id + '\'].formRestart()">Instant Replay</button><!--button onclick="return rooms[\'' + selfR.id + '\'].formSaveReplay()">Share replay</button--></em></div>');
			if (selfR.me.side) {
				selfR.controlsElem.html('<div class="controls"><em><button onclick="return rooms[\'' + selfR.id + '\'].formRestart()">Instant Replay</button> <button onclick="return rooms[\'' + selfR.id + '\'].formSaveReplay()">Share replay</button> <button onclick="return rooms[\'' + selfR.id + '\'].formLeaveBattle()">Leave this battle</button></em></div>');
			}
			if (selfR.joinElem) {
				selfR.joinElem.remove();
			}
			//selfR.battleElem.append('<div class="playbutton"><button onclick="return rooms[\'' + selfR.id + '\'].formRestart()">Start new game<small style="font-size:12pt"><br />(Unranked)</small></button></div>');
			//selfR.joinElem = selfR.battleElem.children().last();
		} else if (selfR.battle.mySide.initialized && selfR.battle.yourSide.initialized) {
			if (selfR.joinElem) {
				selfR.joinElem.remove();
			}
			selfR.joinElem = null;
		} else if (selfR.me.side) {
			if (selfR.joinElem) {
				selfR.joinElem.remove();
			}
			selfR.joinElem = null;
			if (selfR.battle.kickingInactive) {
				selfR.controlsElem.html('<div class="controls"><button onclick="return rooms[\'' + selfR.id + '\'].formLeaveBattle()">Leave this battle</button> <p><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button> <small>&larr; Your opponent has disconnected. Click this to delay your victory.</small></p></div>');
			} else {
				selfR.controlsElem.html('<div class="controls"><button onclick="return rooms[\'' + selfR.id + '\'].formLeaveBattle()">Leave this battle</button> <p><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Claim victory</small></button> <small>&larr; Your opponent has disconnected. Click this if they don\'t reconnect.</small></p></div>');
			}
		} else {
			if (selfR.joinElem) {
				selfR.joinElem.remove();
			}
			selfR.battleElem.append('<div class="playbutton"><button onclick="return rooms[\'' + selfR.id + '\'].formJoinBattle()">Join Battle</button></div>');
			selfR.joinElem = selfR.battleElem.children().last();
		}
	};
	this.init = function (data) {
		this.version = (data.version !== undefined) ? data.version : 0;
		if (selfR.battle.activityQueue) {
			// re-initialize
			selfR.battleEnded = false;
			selfR.battle = new Battle(selfR.battleElem, selfR.chatFrameElem);

			if (widthClass !== 'tiny-layout') {
				selfR.battle.messageSpeed = 80;
			}

			selfR.battle.setMute(me.mute);
			selfR.battle.customCallback = selfR.callback;
			selfR.battle.startCallback = selfR.updateJoinButton;
			selfR.battle.stagnateCallback = selfR.updateJoinButton;
			selfR.battle.endCallback = selfR.updateJoinButton;
			selfR.chatFrameElem.find('.inner').html('');
			selfR.controlsElem.html('');
		}
		selfR.battle.play();
		if (data.battlelog) {
			for (var i = 0; i < data.battlelog.length; i++) {
				selfR.battle.add(data.battlelog[i]);
			}
			selfR.battle.fastForwardTo(-1);
		}
		selfR.updateMe();
		if (selfR.chatElem) {
			selfR.chatFrameElem.scrollTop(selfR.chatElem.height());
		}
	};
	this.rawMessage = function(message) {
		this.message({rawMessage: message});
	};
	this.message = function (message, andLobby) {
		if (message.pm) {
			var pmuserid = (toUserid(message.name) === me.userid ? toUserid(message.pm) : toUserid(message.name))
			if (me.ignore[toUserid(message.name)] && message.name.substr(0, 1) === ' ') return;
			selfR.add('|chatmsg-raw|' + '<div class="chat"><strong>' + sanitize(message.name.substr(1)) + ':</strong> <em style="color:#007100"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + pmuserid + '\')">(Private to ' + sanitize(message.pm) + ')</i> ' + messageSanitize(message.message) + '</em>');
		} else if (message.rawMessage) {
			selfR.add('|chatmsg-raw|' + message.rawMessage);
		} else if (message.evalRawMessage) {
			selfR.add('|chatmsg-raw|' + eval(message.evalRawMessage));
		} else if (message.name) {
			selfR.add('|chat|' + message.name.substr(1) + '|' + message.message);
		} else if (message.message) {
			selfR.add('|chatmsg|' + message.message);
		} else {
			selfR.add('|chatmsg|' + message);
		}

		if (andLobby && rooms.lobby) {
			rooms.lobby.message(message);
		}
	};
	this.send = function (message) {
		emit(socket, 'chat', {room:this.id,message:message});
	};
	// Same as send, but appends the rqid to the message so that the server
	// can verify that the decision is sent in response to the correct request.
	this.sendDecision = function (message) {
		this.send(message + '|' + this.me.request.rqid);
	};
	this.add = function (log) {
		if (typeof log === 'string') log = log.split('\n');
		selfR.update({updates:log});
	};
	this.update = function (update) {
		if (update.updates) {
			var updated = false;
			for (var i = 0; i < update.updates.length; i++) {
				if (!updated && (update.updates[i] === '')) {
					selfR.me.callbackWaiting = false;
					updated = true;
					selfR.controlsElem.html('');
				}
				if (update.updates[i] === 'RESET') {
					selfR.foeHintElem.html('');
					var blog = selfR.chatFrameElem.find('.inner').html();
					delete selfR.me.side;
					selfR.battleEnded = false;
					selfR.battle = new Battle(selfR.battleElem, selfR.chatFrameElem);

					if (widthClass !== 'tiny-layout') {
						selfR.battle.messageSpeed = 80;
					}

					selfR.battle.setMute(me.mute);
					selfR.battle.customCallback = selfR.callback;
					selfR.battle.startCallback = selfR.updateJoinButton;
					selfR.battle.stagnateCallback = selfR.updateJoinButton;
					selfR.battle.endCallback = selfR.updateJoinButton;
					selfR.chatFrameElem.find('.inner').html(blog + '<h2>NEW GAME</h2>');
					selfR.chatFrameElem.scrollTop(selfR.chatFrameElem.find('.inner').height());
					selfR.controlsElem.html('');
					selfR.battle.play();
					selfR.updateJoinButton();
					break;
				}
				if (update.updates[i].substr(0, 6) === '|chat|' || update.updates[i].substr(0, 9) === '|chatmsg|' || update.updates[i].substr(0, 10) === '|inactive|') {
					selfR.battle.instantAdd(update.updates[i]);
				} else {
					if (update.updates[i].substr(0,10) === '|callback|') selfR.controlsElem.html('');
					if (update.updates[i].substr(0,12) === '| callback | ') selfR.controlsElem.html('');
					selfR.battle.add(update.updates[i]);
				}
			}
		}
		if (update.request) {
			selfR.me.request = update.request;
			if (selfR.version === 1) {
				// We maintain this for now, in case a server updated during
				// the brief period where this was the design. However, this
				// can probably be removed in a few weeks, if desired.
				selfR.send('/ackrequest ' + selfR.me.request.rqid);
			}
			selfR.me.request.requestType = 'move';
			if (selfR.me.request.forceSwitch) {
				selfR.me.request.requestType = 'switch';
				notify({
					type: 'yourSwitch',
					room: selfR.id,
					user: selfR.battle.yourSide.name
				});
				selfR.notifying = true;
				updateRoomList();
			} else if (selfR.me.request.teamPreview) {
				selfR.me.request.requestType = 'team';
				notify({
					type: 'yourSwitch',
					room: selfR.id,
					user: selfR.battle.yourSide.name
				});
				selfR.notifying = true;
				updateRoomList();
			} else if (selfR.me.request.wait) {
				selfR.me.request.requestType = 'wait';
			} else {
				notify({
					type: 'yourMove',
					room: selfR.id,
					user: selfR.battle.yourSide.name
				});
				selfR.notifying = true;
				updateRoomList();
			}
			//if (selfR.me.callbackWaiting) selfR.callback();
		}
		if (typeof update.active !== 'undefined') {
			if (!update.active && selfR.me.side) {
				selfR.controlsElem.html('<div class="controls"><button onclick="return rooms[\'' + selfR.id + '\'].formLeaveBattle()">Leave this battle</button></div>');
			}
		}
		if (update.side) {
			if (update.side === 'none') {
				$('#controls').html('');
				delete selfR.me.side;
			} else {
				selfR.me.side = update.side;
			}
		}
		if (update.sideData) {
			selfR.updateSide(update.sideData, update.midBattle);
		}
		selfR.updateMe();
	};
	this.updateSide = function(sideData, midBattle) {
		var sidesSwitched = false;
		selfR.me.sideData = sideData; // just for easy debugging
		if (selfR.battle.sidesSwitched !== !!(selfR.me.side === 'p2')) {
			sidesSwitched = true;
			selfR.battle.reset();
			selfR.battle.switchSides();
		}
		for (var i = 0; i < sideData.pokemon.length; i++) {
			var pokemonData = sideData.pokemon[i];
			var pokemon;
			if (i == 0) {
				pokemon = selfR.battle.getPokemon(''+pokemonData.ident, pokemonData.details);
				pokemon.slot = 0;
				pokemon.side.pokemon = [pokemon];
				// if (pokemon.side.active[0] && pokemon.side.active[0].ident == pokemon.ident) pokemon.side.active[0] = pokemon;
			} else if (i < selfR.battle.mySide.active.length) {
				pokemon = selfR.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
				pokemon.slot = i;
				// if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) pokemon.side.active[i] = pokemon;
				if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) {
					pokemon.side.active[i].item = pokemon.item;
					pokemon.side.active[i].ability = pokemon.ability;
					pokemon.side.active[i].baseAbility = pokemon.baseAbility;
				}
			} else {
				pokemon = selfR.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
			}
			pokemon.healthParse(pokemonData.condition);
			if (pokemonData.baseAbility) {
				pokemon.baseAbility = pokemonData.baseAbility;
				if (!pokemon.ability || pokemon.ability.substr(0,2) === '??') pokemon.ability = pokemon.baseAbility;
			}
			pokemon.item = pokemonData.item;
			pokemon.moves = pokemonData.moves;
		}
		selfR.battle.mySide.updateSidebar();
		if (sidesSwitched) {
			if (midBattle) {
				selfR.battle.fastForwardTo(-1);
			} else {
				selfR.battle.play();
			}
		}
	};
	this.updateMe = function () {
		if (selfR.meIdent.name !== me.name || selfR.meIdent.named !== me.named) {
			if (me.named) {
				selfR.chatAddElem.html('<form onsubmit="return false" class="chatbox"><label style="' + hashColor(me.userid) + '">' + sanitize(me.name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off" onkeypress="return rooms[\'' + selfR.id + '\'].formKeyPress(event)"></textarea></form>');
				selfR.chatboxElem = selfR.chatAddElem.find('textarea');
				// The keypress event does not capture tab, so use keydown.
				selfR.chatboxElem.keydown(rooms['lobby'].formKeyDown);
				selfR.chatboxElem.autoResize({
					animateDuration: 100,
					extraSpace: 0
				});
				selfR.chatboxElem.focus();
			} else {
				selfR.chatAddElem.html('<form><button onclick="return rooms[\'' + selfR.id + '\'].formRename()">Join chat</button></form>');
			}

			selfR.meIdent.name = me.name;
			selfR.meIdent.named = me.named;
		}
		var inner = selfR.chatFrameElem.find('.inner');
		if (inner.length) selfR.chatElem = inner;
		else selfR.chatElem = null;
		selfR.updateJoinButton();
	};
	this.callback = function (battle, type, moveTarget) {
		if (!battle) battle = selfR.battle;
		selfR.notifying = false;
		if (type === 'restart') {
			selfR.me.callbackWaiting = false;
			selfR.battleEnded = true;
			updateRoomList();
			return;
		}

		var myActive = selfR.battle.mySide.active;
		var yourActive = selfR.battle.yourSide.active;
		var text = '';
		if (yourActive[1]) {
			text += '<div style="position:absolute;top:85px;left:320px;width:90px;height:100px;"' + tooltipAttrs(yourActive[1].getIdent(), 'pokemon', true, 'foe') + '></div>';
		}
		if (yourActive[0]) {
			text += '<div style="position:absolute;top:90px;left:390px;width:100px;height:100px;"' + tooltipAttrs(yourActive[0].getIdent(), 'pokemon', true, 'foe') + '></div>';
		}
		if (myActive[0]) {
			text += '<div style="position:absolute;top:210px;left:130px;width:180px;height:160px;"' + tooltipAttrs(myActive[0].getIdent(), 'pokemon', true, true) + '></div>';
		}
		if (myActive[1]) {
			text += '<div style="position:absolute;top:210px;left:270px;width:160px;height:160px;"' + tooltipAttrs(myActive[1].getIdent(), 'pokemon', true, true) + '></div>';
		}
		selfR.foeHintElem.html(text);
		
		if (!selfR.me.request) {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for players...</em></div>');
			selfR.updateJoinButton();
			updateRoomList();
			return;
		}
		if (selfR.me.request.side) {
			selfR.updateSide(selfR.me.request.side, true);
		}
		selfR.me.callbackWaiting = true;
		var active = selfR.battle.mySide.active[0];
		if (!active) active = {};
		if (selfR.battle.kickingInactive) {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em></div> <button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
		} else {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em></div> <button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
		}
		var act = '';
		var switchables = [];

		if (selfR.me.request) {
			act = selfR.me.request.requestType;
			if (selfR.me.request.side) {
				switchables = selfR.battle.mySide.pokemon;
			}
		}
		switch (act) {
		case 'move':
			{
				if (type !== 'move2' && type !== 'movetarget') {
					selfR.choices = [];
					selfR.choiceSwitchFlags = {};
					while (switchables[selfR.choices.length] && switchables[selfR.choices.length].fainted) selfR.choices.push('pass');
				}
				var pos = selfR.choices.length - (type === 'movetarget'?1:0);
				var hpbar = '';
				{
					if (switchables[pos].hp * 5 / switchables[pos].maxhp < 1) {
						hpbar = '<small class="critical">';
					} else if (switchables[pos].hp * 2 / switchables[pos].maxhp < 1) {
						hpbar = '<small class="weak">';
					} else {
						hpbar = '<small class="healthy">';
					}
					hpbar += ''+switchables[pos].hp+'/'+switchables[pos].maxhp+'</small>';
				}
				var active = selfR.me.request;
				if (active.active) active = active.active[pos];
				var moves = active.moves;
				var trapped = active.trapped;

				var controls = '<div class="controls"><div class="whatdo">';
				if (type === 'move2' || type === 'movetarget') {
					controls += '<button onclick="rooms[\'' + selfR.id + '\'].callback(null,\'move\')">Back</button> ';
				}

				// Target selector

				if (type === 'movetarget') {
					controls += 'At who? '+hpbar+'</div>';
					controls += '<div class="switchmenu" style="display:block">';

					var myActive = selfR.battle.mySide.active;
					var yourActive = selfR.battle.yourSide.active;
					var yourSlot = yourActive.length-1-pos;
					for (var i = yourActive.length-1; i >= 0; i--) {
						var pokemon = yourActive[i];

						var disabled = false;
						if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
							disabled = true;
						} else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
							if (Math.abs(yourSlot-i) > 1) disabled = true;
						}

						if (!pokemon) {
							controls += '<button disabled="disabled"></button> ';
						} else if (disabled || pokemon.zerohp) {
							controls += '<button disabled="disabled"' + tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
						} else {
							controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSelectTarget(' + i + ', false)"' + tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
						}
					}
					controls += '<div style="clear:both"></div> </div><div class="switchmenu" style="display:block">';
					for (var i = 0; i < myActive.length; i++) {
						var pokemon = myActive[i];

						var disabled = false;
						if (moveTarget === 'adjacentFoe') {
							disabled = true;
						} else if (moveTarget === 'normal' || moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
							if (Math.abs(pos-i) > 1) disabled = true;
						}
						if (moveTarget !== 'adjacentAllyOrSelf' && pos == i) disabled = true;

						if (!pokemon) {
							controls += '<button disabled="disabled"></button> ';
						} else if (disabled || pokemon.zerohp) {
							controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
						} else {
							controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSelectTarget(' + i + ', true)"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
						}
					}
					controls += '</div>';
					controls += '</div>';
					selfR.controlsElem.html(controls);
					break;
				}

				// Move chooser

				controls += 'What will <strong>' + sanitize(switchables[pos].name) + '</strong> do? '+hpbar+'</div>';
				var hasMoves = false;
				var hasDisabled = false;
				controls += '<div class="movecontrols"><div class="moveselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectMove()">Attack</button></div><div class="movemenu">';
				var movebuttons = '';
				for (var i = 0; i < moves.length; i++) {
					var moveData = moves[i];
					var move = Tools.getMove(moves[i].move);
					if (!move) {
						move = {
							name: moves[i].move,
							id: moves[i].move,
							type: ''
						};
					}
					var name = move.name;
					var pp = moveData.pp + '/' + moveData.maxpp;
					if (!moveData.maxpp) pp = '&ndash;';
					if (move.id === 'Struggle' || move.id === 'Recharge') pp = '&ndash;';
					if (move.id === 'Recharge') move.type = '&ndash;';
					if (name.substr(0, 12) === 'Hidden Power') name = 'Hidden Power';
					if (moveData.disabled) {
						movebuttons += '<button disabled="disabled"' + tooltipAttrs(moveData.move, 'move') + '>';
						hasDisabled = true;
					} else {
						movebuttons += '<button class="type-' + move.type + '" onclick="rooms[\'' + selfR.id + '\'].formUseMove(\'' + moveData.move.replace(/'/g, '\\\'') + '\', \''+moveData.target+'\')"' + tooltipAttrs(moveData.move, 'move') + '>';
						hasMoves = true;
					}
					movebuttons += name + '<br /><small class="type">' + move.type + '</small> <small class="pp">' + pp + '</small>&nbsp;</button> ';
				}
				if (!hasMoves) {
					controls += '<button class="movebutton" onclick="rooms[\'' + selfR.id + '\'].formUseMove(\'Struggle\')">Struggle<br /><small class="type">Normal</small> <small class="pp">&ndash;</small>&nbsp;</button> ';
				} else {
					controls += movebuttons;
				}
				controls += '<div style="clear:left"></div>';
				if (hasDisabled) {
					// controls += '<small>(grayed out moves have been disabled by Disable, Encore, or something like that)</small>';
				}
				controls += '</div></div><div class="switchcontrols"><div class="switchselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectSwitch()">Switch</button></div><div class="switchmenu">';
				if (trapped) {
					controls += '<em>You are trapped and cannot switch!</em>';
				} else {
					controls += '';
					for (var i = 0; i < switchables.length; i++) {
						var pokemon = switchables[i];
						pokemon.name = pokemon.ident.substr(4);
						if (pokemon.zerohp || i < selfR.battle.mySide.active.length || selfR.choiceSwitchFlags[i]) {
							controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
						} else {
							controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSwitchTo(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
						}
					}
					if (selfR.battle.mySide.pokemon.length > 6) {
						//controls += '<small>Pokeball data corrupt. Please copy the text from this button: <button onclick="prompt(\'copy this text\', curRoom.battle.activityQueue.join(\' :: \'));return false">[click here]</button> and tell aesoft.</small>';
					}
				}
				controls += '</div></div></div>';
				selfR.controlsElem.html(controls);
			}
			selfR.notifying = true;
			break;
		case 'switch':
			if (type !== 'switch2') {
				selfR.choices = [];
				selfR.choiceSwitchFlags = {};
				if (selfR.me.request.forceSwitch !== true) {
					while (!selfR.me.request.forceSwitch[selfR.choices.length] && selfR.choices.length < 6) selfR.choices.push('pass');
				}
			}
			var pos = selfR.choices.length;
			var controls = '<div class="controls"><div class="whatdo">';
			if (type === 'switch2') {
				controls += '<button onclick="rooms[\'' + selfR.id + '\'].callback(null,\'switch\')">Back</button> ';
			}
			controls += 'Switch <strong>'+sanitize(switchables[pos].name)+'</strong> to:</div>';
			controls += '<div class="switchcontrols"><div class="switchselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectSwitch()">Switch</button></div><div class="switchmenu">';
			for (var i = 0; i < switchables.length; i++) {
				var pokemon = switchables[i];
				if (i >= 6) {
					//controls += '<small>Pokeball data corrupt. Please copy the text from this button: <button onclick="prompt(\'copy this text\', curRoom.battle.activityQueue.join(\' :: \'));return false">[click here]</button> and tell aesoft.</small>';
					break;
				}
				if (pokemon.zerohp || i < selfR.battle.mySide.active.length || selfR.choiceSwitchFlags[i]) {
					controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
				} else {
					controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSwitchTo(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '<span class="hpbar"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
				}
			}
			controls += '</div></div></div>';
			selfR.controlsElem.html(controls);
			selfR.formSelectSwitch();
			selfR.notifying = true;
			break;
		case 'team':
			var controls = '<div class="controls"><div class="whatdo">';
			if (type !== 'team2') {
				selfR.teamPreviewChoice = [1,2,3,4,5,6].slice(0,switchables.length);
				selfR.teamPreviewDone = 0;
				selfR.teamPreviewCount = 0;
				if (selfR.battle.gameType === 'doubles') {
					selfR.teamPreviewCount = 2;
				}
				controls += 'How will you start the battle?</div>';
				controls += '<div class="switchcontrols"><div class="switchselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectSwitch()">Choose Lead</button></div><div class="switchmenu">';
				for (var i = 0; i < switchables.length; i++) {
					var pokemon = switchables[i];
					if (i >= 6) {
						break;
					}
					if (toId(pokemon.baseAbility) === 'illusion') {
						selfR.teamPreviewCount = 6;
					}
					controls += '<button onclick="rooms[\'' + selfR.id + '\'].formTeamPreviewSelect(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '</button> ';
				}
				if (selfR.battle.teamPreviewCount) selfR.teamPreviewCount = parseInt(selfR.battle.teamPreviewCount,10);
				controls += '</div>';
			} else {
				controls += '<button onclick="rooms[\'' + selfR.id + '\'].callback(null,\'team\')">Back</button> What about the rest of your team?</div>';
				controls += '<div class="switchcontrols"><div class="switchselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectSwitch()">Choose a pokemon for slot '+(selfR.teamPreviewDone+1)+'</button></div><div class="switchmenu">';
				for (var i = 0; i < switchables.length; i++) {
					var pokemon = switchables[selfR.teamPreviewChoice[i]-1];
					if (i >= 6) {
						break;
					}
					if (i < selfR.teamPreviewDone) {
						controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '</button> ';
					} else {
						controls += '<button onclick="rooms[\'' + selfR.id + '\'].formTeamPreviewSelect(' + i + ')"' + tooltipAttrs(selfR.teamPreviewChoice[i]-1, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + sanitize(pokemon.name) + '</button> ';
					}
				}
				controls += '</div>';
			}
			controls += '</div></div>';
			selfR.controlsElem.html(controls);
			selfR.formSelectSwitch();
			selfR.notifying = true;
			break;
		}
		updateRoomList();
	};
	this.formJoinBattle = function () {
		selfR.send('/joinbattle');
		return false;
	};
	this.formKickInactive = function () {
		selfR.send('/kickinactive');
		return false;
	};
	this.formStopBattleTimer = function () {
		selfR.send('/timer off');
		return false;
	};
	this.formForfeit = function () {
		selfR.send('/forfeit');
		return false;
	};
	this.formSaveReplay = function () {
		selfR.send('/savereplay');
		return false;
	};
	this.formRestart = function () {
		/* hideTooltip();
		selfR.send('/restart'); */
		selfR.me.request = null;
		selfR.battle.reset();
		selfR.battle.play();
		return false;
	};
	this.formUseMove = function (move, target) {
		var myActive = selfR.battle.mySide.active;
		hideTooltip();
		if (move !== undefined) {
			var choosableTargets = {normal:1, any:1, adjacentAlly:1, adjacentAllyOrSelf:1, adjacentFoe:1};
			selfR.choices.push('move '+move);
			if (myActive.length > 1 && target in choosableTargets) {
				selfR.callback(selfR.battle, 'movetarget', target);
				return false;
			}
		}
		while (myActive.length > selfR.choices.length && !myActive[selfR.choices.length]) {
			selfR.choices.push('pass');
		}
		if (myActive.length > selfR.choices.length) {
			selfR.callback(selfR.battle, 'move2');
			return false;
		}
		if (selfR.battle.kickingInactive) {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
		} else {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
		}
		selfR.sendDecision('/choose '+selfR.choices.join(','));
		selfR.notifying = false;
		updateRoomList();
		return false;
	};
	this.formSelectTarget = function (pos, isMySide) {
		var posString;
		if (isMySide) {
			posString = ''+(-(pos+1));
		} else {
			posString = ''+(pos+1);
		}
		selfR.choices[selfR.choices.length-1] += ' '+posString;
		selfR.formUseMove();
		return false;
	};
	this.formSwitchTo = function (pos) {
		hideTooltip();
		selfR.choices.push('switch '+(parseInt(pos,10)+1));
		selfR.choiceSwitchFlags[pos] = true;
		if (selfR.me.request && selfR.me.request.requestType === 'move' && selfR.battle.mySide.active.length > selfR.choices.length) {
			selfR.callback(selfR.battle, 'move2');
			return false;
		}
		if (selfR.me.request && selfR.me.request.requestType === 'switch') {
			if (selfR.me.request.forceSwitch !== true) {
				while (selfR.battle.mySide.active.length > selfR.choices.length && !selfR.me.request.forceSwitch[selfR.choices.length]) selfR.choices.push('pass');
			}
			if (selfR.battle.mySide.active.length > selfR.choices.length) {
				selfR.callback(selfR.battle, 'switch2');
				return false;
			}
		}
		if (selfR.battle.kickingInactive) {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
		} else {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
		}
		selfR.sendDecision('/choose '+selfR.choices.join(','));
		selfR.notifying = false;
		updateRoomList();
		return false;
	};
	this.formTeamPreviewSelect = function (pos) {
		pos = parseInt(pos,10);
		hideTooltip();
		if (selfR.teamPreviewCount) {
			var temp = selfR.teamPreviewChoice[pos];
			selfR.teamPreviewChoice[pos] = selfR.teamPreviewChoice[selfR.teamPreviewDone];
			selfR.teamPreviewChoice[selfR.teamPreviewDone] = temp;

			selfR.teamPreviewDone++;

			if (selfR.teamPreviewDone < Math.min(selfR.teamPreviewChoice.length, selfR.teamPreviewCount)) {
				selfR.callback(selfR.battle, 'team2');
				return false;
			}
			pos = selfR.teamPreviewChoice.join('');
		} else {
			pos = pos+1;
		}
		if (selfR.battle.kickingInactive) {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
		} else {
			selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> <button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button></div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
		}
		selfR.sendDecision('/team '+(pos));
		selfR.notifying = false;
		updateRoomList();
		return false;
	};
	this.formUndoDecision = function (pos) {
		selfR.send('/undo');
		selfR.notifying = true;
		selfR.callback(selfR.battle, 'decision');
		return false;
	};
	// Key press in the battle chat textbox.
	this.formKeyPress = function (e) {
		hideTooltip();
		if (e.keyCode === 13) {
			if (selfR.chatboxElem.val()) {
				var text = selfR.chatboxElem.val();
				text = rooms.lobby.parseCommand(text);
				if (text) {
					selfR.send(text);
				}
				selfR.chatboxElem.val('');
			}
			return false;
		}
		return true;
	};
	this.formRename = function () {
		overlay('rename');
		return false;
	};
	this.formLeaveBattle = function () {
		hideTooltip();
		selfR.send('/leavebattle');
		selfR.notifying = false;
		updateRoomList();
		return false;
	};
	this.formSelectSwitch = function () {
		hideTooltip();
		selfR.controlsElem.find('.controls').attr('class', 'controls switch-controls');
		return false;
	};
	this.formSelectMove = function () {
		hideTooltip();
		selfR.controlsElem.find('.controls').attr('class', 'controls move-controls');
		return false;
	};

	this.battle = new Battle(this.battleElem, this.chatFrameElem);

	if (widthClass !== 'tiny-layout') {
		this.battle.messageSpeed = 80;
	}

	this.battle.setMute(me.mute);
	this.battle.customCallback = this.callback;
	this.battle.endCallback = this.endCallback;
	this.battle.startCallback = this.updateMe;
	this.battle.stagnateCallback = this.updateMe;
}
var lobbyChatElem = null;

function updateLobbyChat(tab) {
	if (!tab && curRoom) tab = curRoom.id;
	if (tab === 'lobby') {
		$('#lobbychat').prop('class', 'lobbychat mainlobbychat');
		$('#lobbychat').show();
		if (rooms.lobby && rooms.lobby.chatElem) rooms.lobby.chatFrameElem.scrollTop(rooms.lobby.chatElem.height());
		if (rooms.lobby && rooms.lobby.chatboxElem) rooms.lobby.chatboxElem.focus();
	} else if (tab === 'teambuilder' || tab === 'ladder') {
		$('#lobbychat').prop('class', 'lobbychat sidelobbychat');
		$('#lobbychat').show();
		if (rooms.lobby && rooms.lobby.chatElem) rooms.lobby.chatFrameElem.scrollTop(rooms.lobby.chatElem.height());
		if (rooms.lobby && rooms.lobby.chatboxElem) rooms.lobby.chatboxElem.focus();
	} else if (widthClass === 'huge-layout') {
		$('#lobbychat').prop('class', 'lobbychat secondarylobbychat');
		$('#lobbychat').show();
	} else $('#lobbychat').hide();
}

function Lobby(id, elem) {
	var selfR = this;
	this.id = id;
	this.elem = elem;
	this.meIdent = {
		name: me.name,
		named: 'init'
	};
	me.rooms[id] = {};
	this.me = me.rooms[id];
	this.joinLeave = {
		'join': [],
		'leave': []
	};
	this.joinLeaveElem = null;
	this.userCount = {};
	this.userList = {};
	this.userActivity = [];
	this.tabComplete = {
		candidates: null,
		index: 0,
		prefix: null,
		cursor: -1
	};
	this.searcher = null;
	this.selectedTeam = 0;
	this.selectedFormat = '';

	elem.html('<div class="mainsection"><div class="maintop"></div><div class="mainbottom"></div><div class="mainpopup" style="display:none"></div></div><div id="inline-nav"></div>');
	$('#lobbychat').html('<div class="battle-log"><div class="inner"></div><div class="inner-after"></div></div><div class="battle-log-add">Connecting...</div>');

	this.mainElem = elem.find('.mainsection');
	this.mainTopElem = elem.find('.maintop');
	this.mainBottomElem = elem.find('.mainbottom');
	this.popupElem = elem.find('.mainpopup');
	this.chatFrameElem = $('#lobbychat').find('.battle-log');
	this.chatElem = $('#lobbychat').find('.battle-log .inner');
	this.chatAddElem = $('#lobbychat').find('.battle-log-add');
	this.chatboxElem = null;

	this.dealloc = function () {};
	this.focus = function () {
		selfR.updateMe();
		selfR.updateMainElem(true);
		selfR.chatFrameElem.scrollTop(selfR.chatElem.height());
		if (selfR.chatboxElem) selfR.chatboxElem.focus();
	};
	this.rawMessage = function(message) {
		this.message({rawMessage: message});
	};
	this.message = function (message) {
		if (typeof message !== 'string') {
			selfR.add([message]);
		} else {
			selfR.add([{
				message: message
			}]);
		}
	};
	this.send = function (message) {
		emit(socket, 'chat', {room:'',message:message});
	};
	this.clear = function () {
		selfR.chatElem.html('');
	};
	this.popupClose = function (i) {
		if (!me.popups.length) return;
		if (typeof i === 'undefined') i = me.popups.length - 1;
		me.popups.splice(i, 1);
		selfR.updatePopup();
		selfR.popupChatboxElem.val('');
		if (selfR.chatboxElem) {
			selfR.chatboxElem.focus();
		}
	};
	this.popupKeyUp = function (e) {
		if (e.keyCode === 27) {
			selfR.popupClose();
			return false;
		}
	};
	this.popupKeyPress = function (e) {
		hideTooltip();
		if (e.keyCode === 13) {
			var text;
			if ((text = selfR.popupChatboxElem.val())) {
				text = selfR.parseCommand(text);
				if (text) {
					var splitText = text.split('\n');
					for (var i=0, len=splitText.length; i<len; i++) if (splitText[i]) splitText[i] = '/msg ' + me.curPopup + ', ' + splitText[i];
					selfR.send(splitText.join('\n'));
				}
				selfR.popupChatboxElem.val('');
			}
			return false;
		}
		return true;
	};
	this.parseCommand = function(text) {
		var cmd = '';
		var target = '';
		if (text.substr(0,2) !== '//' && text.substr(0,1) === '/') {
			var spaceIndex = text.indexOf(' ');
			if (spaceIndex > 0) {
				cmd = text.substr(1, spaceIndex-1);
				target = text.substr(spaceIndex+1);
			} else {
				cmd = text.substr(1);
				target = '';
			}
		}

		switch (cmd.toLowerCase()) {
		case 'challenge':
		case 'user':
		case 'open':
			if (!target) target = prompt('Who?');
			if (target) rooms.lobby.formChallenge(target);
			return false;

		case 'ignore':
			if (me.ignore[toUserid(target)]) {
				this.message('User ' + target + ' is already on your ignore list. (Moderator messages will not be ignored.)');
			} else {
				me.ignore[toUserid(target)] = 1;
				this.message('User ' + target + ' ignored. (Moderator messages will not be ignored.)');
			}
			return false;

		case 'unignore':
			if (!me.ignore[toUserid(target)]) {
				this.message('User ' + target + ' isn\'t on your ignore list.');
			} else {
				delete me.ignore[toUserid(target)];
				this.message('User ' + target + ' no longer ignored.');
			}
			return false;

		case 'clear':
			if (this.clear) this.clear();
			return false;

		case 'nick':
			if (target) {
				renameMe(target);
			} else {
				rooms.lobby.formRename();
			}
			return false;

		case 'showjoins':
			rooms.lobby.add('Join/leave messages: ON');
			Tools.prefs.set('showjoins', true, true);
			return false;
		case 'hidejoins':
			rooms.lobby.add('Join/leave messages: HIDDEN');
			Tools.prefs.set('showjoins', false, true);
			return false;

		case 'showbattles':
			rooms.lobby.add('Battle messages: ON');
			Tools.prefs.set('showbattles', true, true);
			return false;
		case 'hidebattles':
			rooms.lobby.add('Battle messages: HIDDEN');
			Tools.prefs.set('showbattles', false, true);
			return false;

		case 'timestamps':
			// This interface is arguably inconsistent with showbattles/hidebattles,
			// but it makes more sense here because there are three possible values.
			if (['off', 'minutes', 'seconds'].indexOf(target) === -1) {
				rooms.lobby.add("Error: Valid options are /timestamps off, /timestamps minutes, and /timestamps seconds");
			} else {
				Tools.prefs.set('timestamps', target, true);
			}
			return false;
			
		case 'highlight':
			var highlights = Tools.prefs.get('highlights') || [];
			if (target.indexOf(',') > -1) {
				var targets = target.split(',');
				// trim the targets to be safe
				for (var i=0, len=targets.length; i<len; i++) {
					targets[i] = targets[i].trim();
				}
				switch (targets[0]) {
				case 'add':
					for (var i=1, len=targets.length; i<len; i++) {
						highlights.push(targets[i].trim());
					}
					rooms.lobby.add("Now highlighting words: " + highlights.join(', '));
					// We update the regex
					this.regex = new RegExp('\\b('+highlights.join('|')+')\\b', 'gi');
					break;
				case 'delete':
					var newHls = [];
					for (var i=0, len=highlights.length; i<len; i++) {
						if (targets.indexOf(highlights[i]) === -1) {
							newHls.push(highlights[i]);
						}
					}
					highlights = newHls;
					rooms.lobby.add("Now highlighting words: " + highlights.join(', '));
					// We update the regex
					this.regex = new RegExp('\\b('+highlights.join('|')+')\\b', 'gi');
					break;
				}
				Tools.prefs.set('highlights', highlights, true);
			} else {
				if (target === 'delete') {
					Tools.prefs.set('highlights', false, true);
					rooms.lobby.add("All highlights cleared");
				} else if (target === 'show' || target === 'list') {
					// Shows a list of the current highlighting words
					if (highlights.length > 0) {
						var hls = highlights.join(', ');
					} else {
						var hls = 'Currently none.';
					}
					rooms.lobby.add("Current highlighting words: " + hls);
				} else {
					// Wrong command
					rooms.lobby.add("Error: Valid options are /highlight add, [word]; /highlight delete, [word]; (remove word for highlight cleaning), and /highlight show.");
				}
			}
			return false;

		case 'rank':
		case 'ranking':
		case 'rating':
		case 'ladder':
			if (!target) target = me.userid;
			var self = this;
			$.get(actionphp + '?act=ladderget&serverid='+Config.serverid+'&user='+target, function(data) {
				try {
					var buffer = '<div class="ladder"><table>';
					buffer += '<tr><td colspan="7">User: <strong>'+target+'</strong></td></tr>';
					if (!data.length) {
						buffer += '<tr><td colspan="7"><em>This user has not played any ladder games yet.</em></td></tr>';
					} else {
						buffer += '<tr><th>Format</th><th>ACRE</th><th>GXE</th><th>Glicko2</th><th>W</th><th>L</th><th>T</th></tr>';
						for (var i=0; i<data.length; i++) {
							var row = data[i];
							buffer += '<tr><td>'+row.formatid+'</td><td><strong>'+Math.round(row.acre)+'</strong></td><td>'+Math.round(row.gxe,1)+'</td><td>';
							if (row.rprd > 50) {
								buffer += '<span style="color:gray"><em>'+Math.round(row.rpr)+'<small> &#177; '+Math.round(row.rprd)+'</small></em> <small>(provisional)</small></span>';
							} else {
								buffer += '<em>'+Math.round(row.rpr)+'<small> &#177; '+Math.round(row.rprd)+'</small></em>';
							}
							buffer += '</td><td>'+row.w+'</td><td>'+row.l+'</td><td>'+row.t+'</td></tr>';
						}
					}
					buffer += '</table></div>';
					self.rawMessage(buffer);
				} catch(e) {
				}
			}, 'json');
			return false;
			
		case 'buttonban':
			var reason = prompt('Why do you wish to ban this user?');
			if (reason === null) return false;
			if (reason === false) reason = '';
			rooms.lobby.send('/ban ' + target + ', ' + reason);
			return false;
		
		case 'buttonmute':
			var reason = prompt('Why do you wish to mute this user?');
			if (reason === null) return false;
			if (reason === false) reason = '';
			rooms.lobby.send('/mute ' + target + ', ' + reason);
			return false;
			
		case 'buttonunmute':
			rooms.lobby.send('/unmute ' + target);
			return false;
		
		case 'buttonkick':
			var reason = prompt('Why do you wish to kick this user?');
			if (reason === null) return false;
			if (reason === false) reason = '';
			rooms.lobby.send('/kick ' + target + ', ' + reason);
			return false;
		}
		return text;
	};
	this.popupOpen = function (userid) {
		userid = toUserid(userid);
		for (var i = 0; i < me.popups.length; i++) {
			if (me.popups[i] === userid) return selfR.popupFocus(i);
		}
		me.popups.push(userid);
		selfR.updatePopup();
		selfR.popupChatboxElem.focus();
	};
	this.popupFocus = function (i) {
		if (!me.popups.length) return;
		if (i == me.popups.length - 1) return;
		me.popups = me.popups.concat(me.popups.splice(i, 1));
		selfR.updatePopup();
		selfR.popupChatboxElem.focus();
	};
	this.updatePopup = function (data) {
		if (selfR.popupState && !me.popups.length) {
			selfR.popupElem.html('');
			selfR.popupElem.hide();
			selfR.popupState = '';
		} else if (selfR.popupState !== 'pm-' + me.popups.join(',')) {
			var code = '<div id="' + selfR.id + '-pmlog-list">';
			var popupListCode = '';
			var name;
			for (var i = 0; i < me.popups.length - 1; i++) {
				name = sanitize(me.users[me.popups[i]] || me.popups[i]);
				popupListCode += '<h3><button class="closebutton" onclick="rooms[\'' + selfR.id + '\'].popupClose(' + i + ');return false;"><i class="icon-remove-sign"></i></button><a onclick="rooms[\'' + selfR.id + '\'].popupFocus(' + i + ');return false;">' + name + '</a></h3>';
			}
			if (me.curPopup === me.popups[i]) {
				$('#' + selfR.id + '-pmlog-list').html(popupListCode);
			}
			me.curPopup = me.popups[i];
			code += popupListCode;
			code += '</div>';
			var clickableName = '<a onclick="return rooms.lobby.formChallenge(\'' + me.curPopup + '\');">' + sanitize(me.users[me.curPopup] || me.curPopup) + '</a>';
			code += '<h3><button class="closebutton" onclick="rooms[\'' + selfR.id + '\'].popupClose(' + i + ');return false"><i class="icon-remove-sign"></i></button>' + clickableName + '</h3>';
			code += '<div id="' + selfR.id + '-pmlog-frame" class="battle-log" onclick="rooms[\'' + selfR.id + '\'].popupChatboxElem.focus()"><div id="' + selfR.id + '-pmlog" class="inner">' + (me.pm[me.curPopup] || '') + '</div><div class="inner-after"></div></div>';
			if (!selfR.popupElem.children('.battle-log-add').length) {
				code += '<div class="battle-log-add"><form onsubmit="return false" class="chatbox"><textarea class="textbox" type="text" size="70" autocomplete="off" onkeypress="return rooms[\'' + selfR.id + '\'].popupKeyPress(event)" onkeyup="return rooms[\'' + selfR.id + '\'].popupKeyUp(event)"></textarea></form></div>';
				selfR.popupElem.html(code);
			} else {
				selfR.popupElem.contents().not('.battle-log-add').remove();
				selfR.popupElem.prepend(code);
			}
			selfR.popupChatboxElem = selfR.popupElem.find('textarea').last();
			selfR.popupChatboxElem.keydown(rooms['lobby'].formKeyDown);
			selfR.popupElem.show();
			$('#' + selfR.id + '-pmlog-frame').scrollTop($('#' + selfR.id + '-pmlog').height());
			selfR.popupChatboxElem.autoResize({
				animateDuration: 100,
				extraSpace: 0
			});
			selfR.popupState = 'pm-' + me.popups.join(',');
		} else if (me.popups.length) {
			if ($('#' + selfR.id + '-pmlog-frame').scrollTop() + 60 >= $('#' + selfR.id + '-pmlog').height() - $('#' + selfR.id + '-pmlog-frame').height()) {
				autoscroll = true;
			}
			$('#' + selfR.id + '-pmlog').append(data);
			if (autoscroll) {
				$('#' + selfR.id + '-pmlog-frame').scrollTop($('#' + selfR.id + '-pmlog').height());
			}
		}
	};
	// Mark a user as active for the purpose of tab complete.
	this.markUserActive = function (userid) {
		var idx = selfR.userActivity.indexOf(userid);
		if (idx !== -1) {
			selfR.userActivity.splice(idx, 1);
		}
		selfR.userActivity.push(userid);
		if (selfR.userActivity.length > 100) {
			// Prune the list.
			selfR.userActivity.splice(0, 20);
		}
	};
	this.getTimestamp = function () {
		var pref = Tools.prefs.get('timestamps');
		if ((pref === 'off') || (pref === undefined)) return '';
		var date = new Date();
		var components = [ date.getHours(), date.getMinutes() ];
		if (pref === 'seconds') {
			components.push(date.getSeconds());
		}
		return '[' + components.map(
				function(x) { return (x < 10) ? '0' + x : x; }
			).join(':') + '] ';
	};
	this.getHighlight = function (message) {
		var highlights = Tools.prefs.get('highlights') || [];
		if (!this.regex) {
			try {
				this.regex = new RegExp('\\b('+highlights.join('|')+')\\b', 'gi');
			} catch (e) {
				// If the expression above is not a regexp, we'll get here.
				// Don't throw an exception because that would prevent the chat
				// message from showing up, or, when the lobby is initialising,
				// it will prevent the initialisation from completing.
				return false;
			}
		}
		return ((highlights.length > 0) && this.regex.test(message));
	};
	this.add = function (log) {
		if (typeof log === 'string') log = log.split('\n');
		var autoscroll = false;
		if (selfR.chatFrameElem.scrollTop() + 60 >= selfR.chatElem.height() - selfR.chatFrameElem.height()) {
			autoscroll = true;
		}
		selfR.lastUpdate = log;
		for (var i = 0; i < log.length; i++) {
			if (typeof log[i] === 'string') {
				if (log[i].substr(0,1) !== '|') log[i] = '||'+log[i];
				var row = log[i].substr(1).split('|');
				switch (row[0]) {
				case 'c':
				case 'chat':
					log[i] = {
						name: row[1],
						message: row.slice(2).join('|')
					};
					break;
				case 'b':
				case 'B':
					log[i] = {
						action: 'battle',
						room: row[1],
						name: row[2],
						name2: row[3],
						silent: (row[0] === 'B')
					};
					break;
				case 'j':
				case 'J':
					log[i] = {
						action: 'join',
						name: row[1],
						silent: (row[0] === 'J')
					};
					updateMe();
					break;
				case 'l':
				case 'L':
					log[i] = {
						action: 'leave',
						name: row[1],
						silent: (row[0] === 'L')
					};
					updateMe();
					break;
				case 'n':
				case 'N':
					log[i] = {
						action: 'rename',
						name: row[1],
						oldid: row[2],
						silent: true
					};
					updateMe();
					break;
				case 'raw':
					log[i] = {
						rawMessage: row.slice(1).join('|')
					};
					break;
				case 'formats':
					var isSection = false;
					var section = '';
					BattleFormats = {};
					for (var j=1; j<row.length; j++) {
						if (isSection) {
							section = row[j];
							isSection = false;
						} else if (row[j] === '') {
							isSection = true;
						} else {
							var searchShow = true;
							var challengeShow = true;
							var team = null;
							var name = row[j];
							if (name.substr(name.length-2) === ',#') { // preset teams
								team = 'preset';
								name = name.substr(0,name.length-2);
							}
							if (name.substr(name.length-2) === ',,') { // search-only
								challengeShow = false;
								name = name.substr(0,name.length-2);
							} else if (name.substr(name.length-1) === ',') { // challenge-only
								searchShow = false;
								name = name.substr(0,name.length-1);
							}
							BattleFormats[toId(name)] = {
								id: toId(name),
								name: name,
								team: team,
								section: section,
								searchShow: searchShow,
								challengeShow: challengeShow,
								rated: challengeShow && searchShow,
								isTeambuilderFormat: challengeShow && searchShow && !team,
								effectType: 'Format'
							};
						}
					}
					selfR.updateMainTop(true);
					break;
				case '':
				default:
					log[i] = {
						message: row.slice(1).join('|')
					};
					break;
				}
			}
			if (log[i].name && log[i].message) {
				var userid = toUserid(log[i].name);
				var color = hashColor(userid);

				if (me.ignore[userid] && log[i].name.substr(0, 1) === ' ') continue;

				// Add this user to the list of people who have spoken recently.
				selfR.markUserActive(userid);

				selfR.joinLeaveElem = null;
				selfR.joinLeave = {
					'join': [],
					'leave': []
				};
				var clickableName = '<span style="cursor:pointer" onclick="return rooms.lobby.formChallenge(\'' + userid + '\');">' + sanitize(log[i].name.substr(1)) + '</span>';
				var message = log[i].message;
				var isHighlighted = selfR.getHighlight(message);
				if (isHighlighted) {
					notify({
						type: 'highlight',
						user: log[i].name
					});
				}
				var highlight = isHighlighted ? ' style="background-color:#FDA;"' : '';
				var chatDiv = '<div class="chat"' + highlight + '>';
				if (log[i].name.substr(0, 1) !== ' ') clickableName = '<small>' + sanitize(log[i].name.substr(0, 1)) + '</small>'+clickableName;
				if (log[i].pm) {
					var pmuserid = (userid === me.userid ? toUserid(log[i].pm) : userid);
					if (!me.pm[pmuserid]) me.pm[pmuserid] = '';
					var pmcode = '<div class="chat">' + selfR.getTimestamp() + '<strong style="' + color + '">' + clickableName + ':</strong> <em> ' + messageSanitize(message) + '</em></div>';
					for (var j = 0; j < me.popups.length; j++) {
						if (pmuserid === me.popups[j]) break;
					}
					if (j == me.popups.length) me.popups.unshift(pmuserid);
					me.pm[pmuserid] += pmcode;
					if (me.popups.length && me.popups[me.popups.length - 1] === pmuserid) {
						selfR.updatePopup(pmcode);
					} else {
						selfR.updatePopup();
					}
					selfR.chatElem.append('<div class="chat">' + selfR.getTimestamp() + '<strong style="' + color + '">' + clickableName + ':</strong> <em style="color:#007100"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + pmuserid + '\')">(Private to ' + sanitize(log[i].pm) + ')</i> ' + messageSanitize(message) + '</em></div>');
				//} else if (log[i].act) {
				//	selfR.chatElem.append('<div class="chat"><strong style="' + color + '">&bull;</strong> <em' + (log[i].name.substr(1) === me.name ? ' class="mine"' : '') + '>' + clickableName + ' <i>' + message + '</i></em></div>');
				} else if (message.substr(0,2) === '//') {
					selfR.chatElem.append(chatDiv + selfR.getTimestamp() + '<strong style="' + color + '">' + clickableName + ':</strong> <em' + (log[i].name.substr(1) === me.name ? ' class="mine"' : '') + '>' + messageSanitize(message.substr(1)) + '</em></div>');
				} else if (message.substr(0,4).toLowerCase() === '/me ') {
					selfR.chatElem.append(chatDiv + selfR.getTimestamp() + '<strong style="' + color + '">&bull;</strong> <em' + (log[i].name.substr(1) === me.name ? ' class="mine"' : '') + '>' + clickableName + ' <i>' + messageSanitize(message.substr(4)) + '</i></em></div>');
				} else if (message.substr(0,5).toLowerCase() === '/mee ') {
					selfR.chatElem.append(chatDiv + selfR.getTimestamp() + '<strong style="' + color + '">&bull;</strong> <em' + (log[i].name.substr(1) === me.name ? ' class="mine"' : '') + '>' + clickableName + '<i>' + messageSanitize(message.substr(5)) + '</i></em></div>');
				} else if (message.substr(0,10).toLowerCase() === '/announce ') {
					selfR.chatElem.append(chatDiv + selfR.getTimestamp() + '<strong style="' + color + '">' + clickableName + ':</strong> <em style="padding:1px 4px 2px;color:white;background:#6688AA">' + messageSanitize(message.substr(10)) + '</em></div>');
				} else if (message.substr(0,14).toLowerCase() === '/data-pokemon ') {
					selfR.chatElem.append('<div class="message"><ul class=\"utilichart\">'+Chart.pokemonRow(Tools.getTemplate(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
				} else if (message.substr(0,11).toLowerCase() === '/data-item ') {
					selfR.chatElem.append('<div class="message"><ul class=\"utilichart\">'+Chart.itemRow(Tools.getItem(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
				} else if (message.substr(0,14).toLowerCase() === '/data-ability ') {
					selfR.chatElem.append('<div class="message"><ul class=\"utilichart\">'+Chart.abilityRow(Tools.getAbility(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
				} else if (message.substr(0,11).toLowerCase() === '/data-move ') {
					selfR.chatElem.append('<div class="message"><ul class=\"utilichart\">'+Chart.moveRow(Tools.getMove(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
				} else {
					// Normal chat message.
					selfR.chatElem.append(chatDiv + selfR.getTimestamp() + '<strong style="' + color + '">' + clickableName + ':</strong> <em' + (log[i].name.substr(1) === me.name ? ' class="mine"' : '') + '>' + messageSanitize(message) + '</em></div>');
				}
			} else if (log[i].name && log[i].action === 'battle') {
				var id = log[i].room;
				var matches = id.match(/^battle\-([a-z0-9]*[a-z])[0-9]*$/);
				var format = (matches ? matches[1] : '');
				selfR.rooms.push({
					id: id,
					format: format,
					p1: log[i].name,
					p2: log[i].name2
				});
				if (selfR.rooms.length > 8) selfR.rooms.shift();

				if (log[i].silent && !Tools.prefs.get('showbattles')) continue;

				selfR.joinLeaveElem = null;
				selfR.joinLeave = {
					'join': [],
					'leave': []
				};
				var id = log[i].room;
				var battletype = 'Battle';
				if (log[i].format) {
					battletype = log[i].format + ' battle';
					if (log[i].format === 'Random Battle') battletype = 'Random Battle';
				}
				selfR.chatElem.append('<div class="message"><a href="' + locPrefix+id + '" onclick="selectTab(\'' + id + '\'); return false" class="battle-start">' + battletype + ' started between <strong style="' + hashColor(toUserid(log[i].name)) + '">' + sanitize(log[i].name) + '</strong> and <strong style="' + hashColor(toUserid(log[i].name2)) + '">' + sanitize(log[i].name2) + '</strong>.</a></div>');
			} else if (log[i].message) {
				selfR.chatElem.append('<div class="message">' + sanitize(log[i].message) + '</div>');
			} else if (log[i].rawMessage) {
				selfR.chatElem.append('<div class="message">' + log[i].rawMessage + '</div>');
			} else if (log[i].evalRawMessage) {
				selfR.chatElem.append('<div class="message">' + eval(log[i].evalRawMessage) + '</div>');
			} else if (log[i].name && (log[i].action === 'join' || log[i].action === 'leave' || log[i].action === 'rename')) {
				var userid = toUserid(log[i].name);
				if (log[i].action === 'join') {
					if (log[i].oldid) delete me.users[toUserid(log[i].oldid)];
					if (!me.users[userid]) selfR.userCount.users++;
					me.users[userid] = log[i].name;
				} else if (log[i].action === 'leave') {
					if (me.users[userid]) selfR.userCount.users--;
					delete me.users[userid];
				} else if (log[i].action === 'rename') {
					if (log[i].oldid) delete me.users[toUserid(log[i].oldid)];
					me.users[toUserid(log[i].name)] = log[i].name;
					continue;
				}
				if (log[i].silent && !Tools.prefs.get('showjoins')) continue;
				if (!selfR.joinLeaveElem) {
					selfR.chatElem.append('<div class="message"><small>Loading...</small></div>');
					selfR.joinLeaveElem = selfR.chatElem.children().last();
				}
				selfR.joinLeave[log[i].action].push(log[i].name);
				var message = '';
				if (selfR.joinLeave['join'].length) {
					var preList = selfR.joinLeave['join'];
					var list = [];
					var named = {};
					for (var j = 0; j < preList.length; j++) {
						if (!named[preList[j]]) list.push(preList[j]);
						named[preList[j]] = true;
					}
					for (var j = 0; j < list.length; j++) {
						if (j >= 5) {
							message += ', and ' + (list.length - 5) + ' others';
							break;
						}
						if (j > 0) {
							if (j == 1 && list.length == 2) {
								message += ' and ';
							} else if (j == list.length - 1) {
								message += ', and ';
							} else {
								message += ', ';
							}
						}
						message += sanitize(list[j]);
					}
					message += ' joined';
				}
				if (selfR.joinLeave['leave'].length) {
					if (selfR.joinLeave['join'].length) {
						message += '; ';
					}
					var preList = selfR.joinLeave['leave'];
					var list = [];
					var named = {};
					for (var j = 0; j < preList.length; j++) {
						if (!named[preList[j]]) list.push(preList[j]);
						named[preList[j]] = true;
					}
					for (var j = 0; j < list.length; j++) {
						if (j >= 5) {
							message += ', and ' + (list.length - 5) + ' others';
							break;
						}
						if (j > 0) {
							if (j == 1 && list.length == 2) {
								message += ' and ';
							} else if (j == list.length - 1) {
								message += ', and ';
							} else {
								message += ', ';
							}
						}
						message += sanitize(list[j]);
					}
					message += ' left<br />';
				}
				selfR.joinLeaveElem.html('<small style="color: #555555">' + message + '</small>');
			}
		}
		if (autoscroll) {
			selfR.chatFrameElem.scrollTop(selfR.chatElem.height());
		}
		var $children = selfR.chatElem.children();
		if ($children.length > 900) {
			$children.slice(0,100).remove();
		}
	};
	this.init = function (data) {
		if (data.log) {
			selfR.chatElem.html('');
			if (!me.registered || me.registered.group !== '2') {
				if (data.log.length > 100) {
					data.log = data.log.splice(data.log.length - 100);
				}
			}
			// Disable timestamps for the past log because the server doesn't
			// tell us what time the messages were sent at.
			var timestamps = Tools.prefs.get('timestamps');
			Tools.prefs.set('timestamps', 'off');
			selfR.add(data.log);	// Add past log.
			Tools.prefs.set('timestamps', timestamps);
		}
		selfR.update(data);
		selfR.chatFrameElem.scrollTop(selfR.chatElem.height());
		selfR.updateMe();
	};
	this.update = function (data) {
		if (data.logUpdate) {
			selfR.add(data.logUpdate);
		}
		if (typeof data.searching !== 'undefined') {
			selfR.me.searching = data.searching;
			selfR.updateMainTop();
		}
		if (typeof data.searcher !== 'undefined') {
			selfR.searcher = data.searcher;
		}
		if (typeof data.users !== 'undefined') {
			selfR.userList = data.users;
			selfR.userCount.users = 'who knows';
			me.users = data.users.list;
		}
		if (typeof data.u !== 'undefined') {
			selfR.userCount = {};
			selfR.userList = {};
			var commaIndex = data.u.indexOf(',');
			if (commaIndex >= 0) {
				selfR.userCount.users = parseInt(data.u.substr(0,commaIndex),10);
				var users = data.u.substr(commaIndex+1).split(',');
				for (var i=0,len=users.length; i<len; i++) {
					if (users[i]) selfR.userList[toId(users[i])] = users[i];
				}
			} else {
				selfR.userCount.users = parseInt(data.u);
				selfR.userCount.guests = selfR.userCount.users;
			}
			me.users = selfR.userList;
		}
		if (data.rooms) {
			selfR.rooms = [];
			for (var id in data.rooms) {
				var room = data.rooms[id];
				var matches = id.match(/^battle\-([a-z0-9]*[a-z])[0-9]*$/);
				room.format = (matches ? matches[1] : '');
				room.id = id;
				selfR.rooms.unshift(room);
			}
		}
		//selfR.updateMainElem();
		selfR.updateMe();
	};
	this.mainTopState = '';
	this.command = function (data) {
		if (data.command === 'userdetails') {
			var userid = data.userid;
			if (!$('#' + selfR.id + '-userdetails-' + userid).length) return;

			var roomListCode = '';
			for (var id in data.rooms) {
				var roomData = data.rooms[id];
				var matches = id.match(/^battle\-([a-z0-9]*[a-z])[0-9]*$/);
				var format = (matches ? '<small>[' + matches[1] + ']</small><br />' : '');
				var roomDesc = format + '<em class="p1">' + sanitize(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + sanitize(roomData.p2) + '</em>';
				if (!roomData.p1) {
					matches = id.match(/[^0-9]([0-9]*)$/);
					roomDesc = format + 'empty room ' + matches[1];
				} else if (!roomData.p2) {
					roomDesc = format + '<em class="p1">' + sanitize(roomData.p1) + '</em>';
				}
				roomListCode += '<div><a href="' + locPrefix + '' + id + '" onclick="selectTab(\'' + id + '\');return false">' + roomDesc + '</a></div>';
			}

			var code = '<img src="/sprites/trainers/' + data.avatar + '.png" />';
			if (roomListCode) {
				roomListCode = '<div class="action-form">In rooms:<br /><div class="roomlist">' + roomListCode + '</div></div>';
			}
			if (data.ip) {
				// Mute and Ban buttons for auths
				var banMuteBuffer = '';
				// var isAuth = me.users[me.userid].substr(0,1) in {'%':1, '@':1, '&':1, '~':1};
				if (me.users[userid].substr(0,1) === '!') {
					banMuteBuffer += '<br /><button onclick="rooms[\'' + selfR.id + '\'].parseCommand(\'/buttonunmute ' + userid + '\');">Unmute</button>';
				} else {
					banMuteBuffer += '<br /><button onclick="rooms[\'' + selfR.id + '\'].parseCommand(\'/buttonmute ' + userid + '\');">Mute</button>';
				}
				banMuteBuffer += ' <button onclick="rooms[\'' + selfR.id + '\'].parseCommand(\'/buttonban ' + userid + '\');">Ban</button>';
				banMuteBuffer += ' <button onclick="rooms[\'' + selfR.id + '\'].parseCommand(\'/buttonkick ' + userid + '\');">Kick</button>';
				roomListCode = '<div class="action-form"><small>IP: <a href="http://www.geoiptool.com/en/?IP=' + data.ip + '" target="iplookup">' + data.ip + '</a></small>'+banMuteBuffer+'</div>' + roomListCode;
			}
			$('#' + selfR.id + '-userrooms-' + userid).html(roomListCode);
			$('#' + selfR.id + '-userdetails-' + userid).html(code);
		} else if (data.command === 'roomlist') {
			if (!$('#' + selfR.id + '-roomlist').length) return;
			var roomListCode = '';
			var i = 0;
			for (var id in data.rooms) {
				var roomData = data.rooms[id];
				var matches = id.match(/^battle\-([a-z0-9]*[a-z])[0-9]*$/);
				var format = (matches ? '<small>[' + matches[1] + ']</small><br />' : '');
				var roomDesc = format + '<em class="p1">' + sanitize(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + sanitize(roomData.p2) + '</em>';
				if (!roomData.p1) {
					matches = id.match(/[^0-9]([0-9]*)$/);
					roomDesc = format + 'empty room ' + matches[1];
				} else if (!roomData.p2) {
					roomDesc = format + '<em class="p1">' + sanitize(roomData.p1) + '</em>';
				}
				roomListCode += '<div><a href="' + locPrefix+id + '" onclick="selectTab(\'' + id + '\');return false">' + roomDesc + '</a></div>';
				i++;
			}

			if (!roomListCode) {
				roomListCode = 'No battles are going on right now.';
			}
			$('#' + selfR.id + '-roomlist').html('<div class="roomlist"><div><small>(' + i + ' battle' + (i == 1 ? '' : 's') + ')</small></div>' + roomListCode + '</div>');
		} else if (data.command === 'savereplay') {
			var id = data.id;
			$.post(actionphp + '?act=uploadreplay', {
				log: data.log,
				id: data.id
			}, function(data) {
				if (data === 'success') {
					overlay('replayuploaded', id);
				} else {
					overlay('message', "Error while uploading replay: "+data);
				}
			});
		}
	};
	this.rooms = [];
	this.updateMainTop = function (force) {
		var text = '';
		var challenge = null;
		if (me.challengesFrom) {
			for (var i in me.challengesFrom) {
				challenge = me.challengesFrom[i];
				break;
			}
		}
		if (force) selfR.mainTopState = '';
		selfR.notifying = !! challenge;
		updateRoomList();
		if (challenge) {
			if (selfR.mainTopState === 'challenge-' + challenge.from) return;
			selfR.mainTopState = 'challenge-' + challenge.from;

			if (me.lastChallengeNotification !== challenge.from) {
				notify({
					type: 'challenge',
					room: selfR.id,
					user: (me.users[challenge.from] || challenge.from),
					userid: challenge.from
				});
				me.lastChallengeNotification = challenge.from;
			}
			selfR.selectedFormat = toId(challenge.format);
			text = '<div class="action-notify"><button class="closebutton" style="float:right;margin:-6px -10px 0 0" onclick="return rooms[\'' + selfR.id + '\'].formRejectChallenge(\'' + sanitize(challenge.from) + '\')"><i class="icon-remove-sign"></i></button>';
			text += 'Challenge from: ' + (me.users[challenge.from] || challenge.from) + '<br /><label class="label">Format:</label> ' + sanitize(challenge.format) + '</br >';
			text += '' + selfR.getTeamSelect(challenge.format) + '<br />';
			text += '<button onclick="return rooms[\'' + selfR.id + '\'].formAcceptChallenge(\'' + sanitize(challenge.from) + '\')" id="' + selfR.id + '-gobutton"' + (selfR.goDisabled ? ' disabled="disabled"' : '') + '>Accept</button> <button onclick="return rooms[\'' + selfR.id + '\'].formRejectChallenge(\'' + sanitize(challenge.from) + '\')"><small>Reject</small></button></div>';
		} else if (me.userForm) {
			var userid = toUserid(me.userForm);
			var name = (me.users[userid] || me.userForm);
			var groupDetails = {
				'~': "Administrator (~)",
				'&': "Leader (&amp;)",
				'@': "Moderator (@)",
				'%': "Driver (%)",
				'+': "Voiced (+)",
				'!': "<span style='color:#777777'>Muted (!)</span>"
			};
			var group = groupDetails[name.substr(0, 1)];
			if (group) name = name.substr(1);
			if (selfR.mainTopState === 'userform-' + userid) return;
			selfR.mainTopState = 'userform-' + userid;

			if (me.userForm === '#lobby-rooms') {
				text = '<div><button onclick="rooms[\'' + selfR.id + '\'].formCloseUserForm();return false"><i class="icon-chevron-left"></i> Back to lobby</button> <button onclick="rooms[\'' + selfR.id + '\'].send(\'/cmd roomlist\');return false"><i class="icon-refresh"></i> Refresh</button></div><div id="' + selfR.id + '-roomlist"><em>Loading...</em></div>';
				selfR.send('/cmd roomlist');
			} else {
				text = '<div class="action-form"><button style="float:right;margin:-6px -10px 0 0" class="closebutton" onclick="return rooms[\'' + selfR.id + '\'].formCloseUserForm()"><i class="icon-remove-sign"></i></button>';
				text += '<strong>' + sanitize(name) + '</strong><br />';
				text += '<small>' + (group || '') + '</small><br />';
				text += '<div id="' + selfR.id + '-userdetails-' + userid + '" style="height:85px"></div>';
				if (userid === me.userid) {
					text += '<button onclick="return rooms[\'' + selfR.id + '\'].formCloseUserForm()">Close</button></div>';
				} else {
					text += '<button onclick="$(\'#' + selfR.id + '-challengeform\').toggle();return false"><strong>Challenge</strong></button> <button onclick="rooms[\'' + selfR.id + '\'].popupOpen(\'' + userid + '\');rooms[\'' + selfR.id + '\'].formCloseUserForm();return false"><strong>PM</strong></button> <button onclick="return rooms[\'' + selfR.id + '\'].formCloseUserForm()">Close</button>';
					text += '</div><div class="action-form" style="display:none" id="' + selfR.id + '-challengeform">';
					text += selfR.getFormatSelect('challenge') + '<br />';
					text += '' + selfR.getTeamSelect(selfR.selectedFormat) + '<br />';
					text += '<button onclick="return rooms[\'' + selfR.id + '\'].formMakeChallenge(\'' + sanitize(userid) + '\')" id="' + selfR.id + '-gobutton"' + (selfR.goDisabled ? ' disabled="disabled"' : '') + '><strong>Make challenge</strong></button> <button onclick="$(\'#' + selfR.id + '-challengeform\').hide();return false">Cancel</button></div>';
				}
				text += '<div id="' + selfR.id + '-userrooms-' + userid + '"></div>';
				selfR.send('/cmd userdetails '+userid);
			}
		} else if (me.challengeTo) {
			if (selfR.mainTopState === 'challenging') return;
			selfR.mainTopState = 'challengeto';

			var teamname = 'Random team';
			if (selectedTeam >= 0) teamname = teams[selectedTeam].name;
			text = '<div class="action-waiting">Challenging: ' + (me.users[me.challengeTo.to] || me.challengeTo.to) + '<br />Format: ' + me.challengeTo.format + '<br />Team: ' + teamname + '<br /><button onclick="return rooms[\'' + selfR.id + '\'].formCloseUserForm(\'' + sanitize(me.challengeTo.to) + '\')"><small>Cancel</small></button></div>';
		} else if (selfR.me.searching) {
			if (selfR.mainTopState === 'searching') return;
			selfR.mainTopState = 'searching';

			text = '<div class="action-waiting">Format: ' + selfR.me.searching.format + '<br />Searching...<br /><button onclick="return rooms[\'' + selfR.id + '\'].formSearchBattle(false)"><small>Cancel</small></button></div>';
		} else {
			var roomListCode = '';
			for (var i=selfR.rooms.length-1; i>=0; i--) {
				var roomData = selfR.rooms[i];
				if (!roomListCode) roomListCode += '<h3>Watch battles</h3>';
				var roomDesc = '<small>[' + Tools.getEffect(roomData.format).name + ']</small><br /><em class="p1">' + sanitize(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + sanitize(roomData.p2) + '</em>';
				roomListCode += '<div><a href="' + locPrefix + '' + roomData.id + '" onclick="selectTab(\'' + roomData.id + '\');return false">' + roomDesc + '</a></div>';
			}
			if (roomListCode) roomListCode += '<button onclick="rooms[\'' + selfR.id + '\'].formChallenge(\'#lobby-rooms\');return false">All battles &rarr;</button>';

			var searcherText = '';
			if (selfR.searcher) {
				searcherText = '<small>There ' + (selfR.searcher === 1 ? 'is' : 'are') + ' ' + selfR.searcher + ' other ' + (selfR.searcher === 1 ? 'person' : 'people') + ' searching.</small>';
			}
			if (selfR.mainTopState === 'search-'+selfR.selectedFormat+(!selfR.goDisabled?'-nogo':'')) {
				$('#' + selfR.id + '-searcher').html(searcherText);
				$('#' + selfR.id + '-roomlist').html(roomListCode);
				return;
			}
			selfR.mainTopState = 'search-'+selfR.selectedFormat+(!selfR.goDisabled?'-nogo':'');

			text = '<div class="action-default">';
			text += '' + selfR.getFormatSelect('search') + '<br />';
			text += '' + selfR.getTeamSelect(selfR.selectedFormat) + '<br />';
			if (selfR.goDisabled)
			{
				text += '</select><br /><button class="mainbutton disabled" onclick="overlay(\'message\',\'You need to make a team in the teambuilder.\');return false" id="'+selfR.id+'-gobutton"><strong><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon('Meloetta-Pirouette')+'"></span>Look for a battle</strong></button></div>';
			}
			else
			{
				text += '</select><br /><button class="mainbutton" onclick="return rooms[\''+selfR.id+'\'].formSearchBattle(true)" id="'+selfR.id+'-gobutton"><strong><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon('Meloetta-Pirouette')+'"></span>Look for a battle</strong></button></div>';
			}
			text += '<span id="' + selfR.id + '-searcher">' + searcherText + '</span><br />';

			text += '<div id="' + selfR.id + '-roomlist" class="roomlist">' + roomListCode + '</div>';
		}
		selfR.mainTopElem.html(text);

		if (!challenge) {
			me.lastChallengeNotification = '';
		}
	};
	this.debounceUpdateTimeout = null;
	this.debounceUpdateQueued = false;
	this.debounceUpdate = function() {
		if (!selfR.debounceUpdateTimeout) {
			selfR.updateMainElem();
			selfR.debounceUpdateQueued = false;
			selfR.debounceUpdateTimeout = setTimeout(selfR.debounceUpdateEnd, 600);
		} else {
			selfR.debounceUpdateQueued = true;
		}
	};
	this.debounceUpdateEnd = function() {
		if (selfR.debounceUpdateQueued) {
			selfR.updateMainElem();
		}
		selfR.debounceUpdateTimeout = null;
	};
	this.updateMainElem = function (force) {
		selfR.updateMainTop(force);

		var text = '';
		text += '<ul class="userlist">';
		text += '<li style="text-align:center;padding:2px 0"><small>' + (selfR.userCount.users || '0') + ' users online:</small></li>';
		var Ranks = {
			'~': 2,
			'&': 2,
			'@': 1,
			'%': 1,
			'+': 1,
			' ': 0,
			'!': 0,
			'#': 0
		};
		var RankOrder = {
			'~': 1,
			'&': 2,
			'@': 3,
			'%': 4,
			'+': 5,
			' ': 6,
			'!': 7,
			'#': 8
		};
		var users = [];
		if (selfR.userList) users = Object.keys(selfR.userList).sort(function(a,b){
			var aRank = RankOrder[selfR.userList[a].substr(0,1)];
			var bRank = RankOrder[selfR.userList[b].substr(0,1)];
			if (aRank != bRank) return aRank - bRank;
			return (a>b?1:-1);
		});
		for (var i=0, len=users.length; i<users.length; i++) {
			var userid = users[i];
			var group = selfR.userList[userid].substr(0, 1);
			text += '<li' + (me.userForm === userid ? ' class="cur"' : '') + '>';
			if (me.named) {
				text += '<button class="userbutton" onclick="return rooms[\'' + selfR.id + '\'].formChallenge(\'' + sanitize(userid) + '\')">';
			} else {
				text += '<button class="userbutton" onclick="return rooms[\'' + selfR.id + '\'].formRename()">';
			}
			text += '<em class="group' + (Ranks[group]===2 ? ' staffgroup' : '') + '">' + sanitize(group) + '</em>';
			if (group === '~' || group === '&') {
				text += '<strong><em style="' + hashColor(userid) + '">' + sanitize(selfR.userList[userid].substr(1)) + '</em></strong>';
			} else if (group === '%' || group === '@') {
				text += '<strong style="' + hashColor(userid) + '">' + sanitize(selfR.userList[userid].substr(1)) + '</strong>';
			} else {
				text += '<span style="' + hashColor(userid) + '">' + sanitize(selfR.userList[userid].substr(1)) + '</span>';
			}
			text += '</button>';
			text += '</li>';
		}
		if (!users.length) {
			text += '<li>No named users online</li>';
		}
		if (selfR.userCount.unregistered) {
			text += '<li style="height:auto;padding-top:5px;padding-bottom:5px">';
			text += '<span style="font-size:10pt;display:block;text-align:center;padding-bottom:5px;font-style:italic">Due to lag, ' + selfR.userCount.unregistered + ' unregistered users are hidden.</span>';
			text += ' <button' + (me.challengeTo ? ' disabled="disabled"' : ' onclick="var gname=prompt(\'Challenge who?\');if (gname) rooms[\'' + selfR.id + '\'].formChallenge(gname);return false"') + '>Challenge an unregistered user</button>';
			text += '<div style="clear:both"></div>';
			text += '</li>';
		}
		if (selfR.userCount.guests) {
			text += '<li style="text-align:center;padding:2px 0"><small>(' + selfR.userCount.guests + ' guest' + (selfR.userCount.guests == 1 ? '' : 's') + ')</small></li>';
		}
		text += '</ul>';
		selfR.mainBottomElem.html(text);
	};
	this.updateMe = function () {
		if (selfR.meIdent.name !== me.name || selfR.meIdent.named !== me.named) {
			if (me.named) {
				selfR.chatAddElem.html('<form onsubmit="return false" class="chatbox"><label style="' + hashColor(me.userid) + '">' + sanitize(me.name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off" onkeypress="return rooms[\'' + selfR.id + '\'].formKeyPress(event)"></textarea></form>');
				selfR.chatboxElem = selfR.chatAddElem.find('textarea');
				// The keypress event does not capture tab, so use keydown.
				selfR.chatboxElem.keydown(this.formKeyDown);
				selfR.chatboxElem.autoResize({
					animateDuration: 100,
					extraSpace: 0
				});
				selfR.chatboxElem.focus();
			} else {
				selfR.chatAddElem.html('<form><button onclick="return rooms[\'' + selfR.id + '\'].formRename()">Join chat</button></form>');
			}

			selfR.meIdent.name = me.name;
			selfR.meIdent.named = me.named;
		}
	};
	// Key press in the chat textbox.
	this.formKeyPress = function (e) {
		hideTooltip();
		if (e.keyCode === 13) {			// Enter
			var text;
			if ((text = selfR.chatboxElem.val())) {
				text = selfR.parseCommand(text);
				if (text) {
					selfR.send(text);
				}
				selfR.chatboxElem.val('');
			}
			return false;
		}
		return true;
	};
	this.formKeyDown = function (e) {
		hideTooltip();
		// We only handle the tab key.
		// If shift is held down, then don't tab complete, and instead navigate
		// away from the chatbox.
		if ((e.keyCode !== 9) || e.shiftKey) return true;

		// We don't want to tab away from this box.
		e.preventDefault();

		// Don't tab complete at the start of the text box.
		var chatbox = $(e.delegateTarget);
		var idx = chatbox.prop('selectionStart');
		if (idx === 0) return true;

		var text = chatbox.val();

		if (idx === selfR.tabComplete.cursor) {
			// The user is cycling through the candidate names.
			if (++selfR.tabComplete.index >= selfR.tabComplete.candidates.length) {
				selfR.tabComplete.index = 0;
			}
		} else {
			// This is a new tab completion.

			// There needs to be non-whitespace to the left of the cursor.
			var m = /^(.*?)([^ ]*)$/.exec(text.substr(0, idx));
			if (!m) return true;

			selfR.tabComplete.prefix = m[1];
			var idprefix = toId(m[2]);
			var candidates = [];

			for (var i in selfR.userList) {
				if (!selfR.userList.hasOwnProperty(i)) continue;
				if (!(typeof i === 'string')) continue;
				if (i.substr(0, idprefix.length) !== idprefix) continue;
				candidates.push(i);
			}

			// Sort by most recent to speak in the chat, or, in the case of a tie,
			// in alphabetical order.
			candidates.sort(function(a, b) {
				var aidx = selfR.userActivity.indexOf(a);
				var bidx = selfR.userActivity.indexOf(b);
				if (aidx !== -1) {
					if (bidx !== -1) {
						return bidx - aidx;
					}
					return -1; // a comes first
				} else if (bidx != -1) {
					return 1;  // b comes first
				}
				return a < b;  // alphabetical order
			});
			selfR.tabComplete.candidates = candidates;
			selfR.tabComplete.index = 0;
		}

		// Substitute in the tab-completed name.
		var substituteUserId = selfR.tabComplete.candidates[selfR.tabComplete.index];
		var name = selfR.userList[substituteUserId].substr(1);
		chatbox.val(selfR.tabComplete.prefix + name + text.substr(idx));
		var pos = selfR.tabComplete.prefix.length + name.length;
		chatbox[0].setSelectionRange(pos, pos);
		selfR.tabComplete.cursor = pos;
	};
	this.formRename = function () {
		overlay('rename');
		return false;
	};
	this.formSearchBattle = function (search, name) {

		requestNotify();
		if (!search) {
			selfR.send('/search');
		} else {
			if (!me.named) {
				overlay('rename');
				return false;
			}
			var format = $('#' + selfR.id + '-format').val();
			selectTeam($('#' + selfR.id + '-team').val());
			selfR.send('/search '+toId(format));
		}
		return false;
	};
	this.formChallenge = function (user) {
		me.userForm = user;
		selfR.updateMainElem();
		$(window).scrollTop(51);
		return false;
	};
	this.getFormatSelect = function (selectType) {
		var text = '';
		text += '<label class="label">Format:</label> <select id="' + selfR.id + '-format" onchange="return rooms[\'' + selfR.id + '\'].formSelectFormat()">';
		var curSection = '';
		for (var i in exports.BattleFormats) {
			var format = exports.BattleFormats[i];
			var selected = false;
			if (format.effectType !== 'Format') continue;
			if (selectType && !format[selectType + 'Show']) continue;

			if (!selfR.selectedFormat) {
				if (selectType) selected = format[selectType + 'Default'];
				if (selected && !format.team && !teams.length) selected = false;
				if (selected) {
					selfR.selectedFormat = i;
				}
			} else {
				selected = (selfR.selectedFormat === i);
			}
			var details = '';
			if (format.rated && selectType === 'search') {
				//details = ' (rated)';
			}
			if (format.section && format.section !== curSection) {
				if (curSection) text += '</optgroup>';
				text += '<optgroup label="'+sanitize(format.section)+'">';
				curSection = format.section;
			}
			if (!format.section && curSection) text += '</optgroup>';
			text += '<option value="' + sanitize(i) + '"' + (selected ? ' selected="selected"' : '') + '>' + sanitize(format.name) + details + '</option>';
		}
		if (curSection) text += '</optgroup>';
		text += '</select>';
		return text;
	};
	this.getTeamSelect = function (format) {
		if (!format) format = selfR.selectedFormat;
		var formatid = '';
		if (!format.name) {
			formatid = format;
			format = exports.BattleFormats[toId(format)];
			if (!format) format = {id:formatid, name:formatid};
		}

		selfR.goDisabled = false;
		if (format.team) {
			var gobutton = $('#' + selfR.id + '-gobutton');
			if (gobutton.length) gobutton[0].disabled = false;
			return '<span id="' + selfR.id + '-teamselect"><label class="label">Team:</label> Random Team</span>';
		} else {
			var text = '<span id="' + selfR.id + '-teamselect"><label class="label">Team:</label> <select id="' + selfR.id + '-team" onchange="return rooms[\'' + selfR.id + '\'].formSelectTeam()">';
			if (!teams.length) {
				text += '<option value="0">You have no teams</option>';
				selfR.goDisabled = true;
			} else {
				var teamFormat = (format.teambuilderFormat || (format.isTeambuilderFormat ? formatid : false));
				for (var i = 0; i < teams.length; i++) {
					var selected = (i === selfR.selectedTeam);
					if ((!teams[i].format && !teamFormat) || teams[i].format === teamFormat) {
						text += '<option value="' + i + '"' + (selected ? ' selected="selected"' : '') + '>' + sanitize(teams[i].name) + '</option>';
					}
				}
				text += '<optgroup label="Other teams">';
				for (var i = 0; i < teams.length; i++) {
					if ((!teams[i].format && !teamFormat) || teams[i].format === teamFormat) continue;
					text += '<option value="' + i + '">' + sanitize(teams[i].name) + '</option>';
				}
				text += '</optgroup>';
			}
			if (format.canUseRandomTeam) {
				text += '<option value="-1">Random Team</option>';
			}
			text += '</select></span>';
			var gobutton = $('#' + selfR.id + '-gobutton');
			if (gobutton.length) gobutton[0].disabled = selfR.goDisabled;
			return text;
		}
	};
	this.formSelectTeam = function () {
		var i = parseInt($('#' + selfR.id + '-team').val());
		if (i === 0 && !teams.length) selfR.goDisabled = true;
		else selfR.goDisabled = false;

		selfR.selectedTeam = i;

		selfR.updateMainTop();
	};
	this.formSelectFormat = function (format) {
		selfR.selectedFormat = $('#' + selfR.id + '-format').val();
		$('#' + selfR.id + '-teamselect').replaceWith(selfR.getTeamSelect());
		
		selfR.updateMainTop();
	};
	this.formMakeChallenge = function (userid) {
		requestNotify();
		var format = $('#' + selfR.id + '-format').val();
		me.userForm = '';
		selectTeam($('#' + selfR.id + '-team').val());
		selfR.send('/challenge '+userid+', '+format);
		return false;
	};
	this.formCloseUserForm = function (userid) {
		if (me.userForm) {
			me.userForm = '';
			selfR.updateMainElem();
			return false;
		}
		selfR.updateMainElem();
		selfR.send('/cancelchallenge '+userid);
		return false;
	};
	this.formAcceptChallenge = function (userid) {
		requestNotify();
		selectTeam($('#' + selfR.id + '-team').val());
		selfR.send('/accept '+userid);
		return false;
	};
	this.formRejectChallenge = function (userid) {
		selfR.send('/reject '+userid);
		return false;
	};
}

function updateMe() {
	var notifybutton = '';
	/* if (needEnableNotify())
	{
		notifybutton = '<button onclick="return requestNotify()"><strong style="color:red">ENABLE NOTIFICATIONS</strong></button> ';
	} */

	//var mutebutton = ' <button onclick="return formMute()" style="height:20px;vertical-align:middle;">' + (me.mute ? '<img src="/fx/mute.png" width="18" height="18" alt="Unmute" />' : '<img src="/fx/sound.png" width="18" height="18" alt="Mute" />') + '</button>';
	var mutebutton = ' <button onclick="return formMute()" style="width:30px;font-size:9pt">' + (me.mute ? '<i class="icon-volume-off" title="Unmute"></i>' : '<i class="icon-volume-up" title="Mute"></i>') + '</button>';
	if (me.named) {
		$('#userbar').html(notifybutton + '<i class="icon-user" style="color:#779EC5"></i> ' + sanitize(me.name) + mutebutton + ' <button onclick="return rooms[\'lobby\'].formRename()" style="font-size:9pt">Change name</button>');
		$.cookie('showdown_username', me.name, {
			expires: 14
		});
	} else {
		$('#userbar').html(notifybutton + '<i class="icon-user" style="color:#999"></i> ' + sanitize(me.name) + mutebutton + ' <button onclick="return rooms[\'lobby\'].formRename()" style="font-size:9pt">Choose name</button>');
	}
	$('#userbar').prepend('<small>[<a href="http://pokemonshowdown.com/rules" target="_blank">Rules</a>] [<a href="http://www.smogon.com/forums/showthread.php?t=3469932" target="_blank">Report bug</a>]</small> ');
	if (rooms.lobby) {
		rooms.lobby.updateMe();
		rooms.lobby.debounceUpdate();
	}
}

function formMute() {
	me.mute = !me.mute;
	$.cookie('showdown_mute', me.mute ? '1' : '');
	if (curRoom.battle) {
		curRoom.battle.setMute(me.mute);
	}
	updateMe();
}

function updateRoomList() {
	var code = '';
	if (!curRoom) curRoom = rooms.lobby;
	code += '<div><a id="tabtab-lobby" class="tab' + (curRoom.id === 'lobby' ? ' cur' : '') + (rooms.lobby && rooms.lobby.notifying ? ' notifying' : '') + '" href="' + locPrefix + 'lobby" onclick="selectTab(\'lobby\'); return false"><i class="icon-comments-alt"></i> Lobby</a>';
	code += '<a id="tabtab-teambuilder"' + (curRoom.id === 'teambuilder' ? ' class="cur"' : '') + ' href="' + locPrefix + 'teambuilder" onclick="selectTab(\'teambuilder\', event);return false"><i class="icon-edit"></i> Teambuilder</a>';
	code += '<a id="tabtab-ladder"' + (curRoom.id === 'ladder' ? ' class="cur"' : '') + ' href="' + locPrefix + 'ladder" onclick="selectTab(\'ladder\');return false"><i class="icon-list-ol"></i> Ladder</a></div>';

	var shownRooms = {
		lobby: true,
		teambuilder: true,
		ladder: true
	};
	var yourRooms = false;
	for (var id in rooms) {
		if (shownRooms[id]) continue;
		shownRooms[id] = true;
		if (!yourRooms) code += '<div><small>Your rooms</small></div>';
		yourRooms = true;
		var roomDesc = id;
		var roomName = (id.substr(0, 7) === 'battle-' ? id.substr(7) : id);
		closesize = 'close2';
		if (roomName) {
			roomDesc = '' + roomName + '<small>(inactive)</small>';
			closesize = 'close0';
		}
		if (rooms[id].battle) {
			var p1 = '';
			var p2 = '';
			if (rooms[id].battle.p1 && rooms[id].battle.p1.initialized) p1 = rooms[id].battle.p1.name;
			if (rooms[id].battle.p2 && rooms[id].battle.p2.initialized) p2 = rooms[id].battle.p2.name;
			if (p1 && p2) {
				roomDesc = '<em class="p1">' + sanitize(p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + sanitize(p2) + '</em>';
				closesize = 'close3';
			} else if (p1) {
				roomDesc = '<em class="p1">' + sanitize(p1) + '</em> <small>(inactive)</small>';
				rooms[id].notifying = false;
				closesize = 'close0';
			} else if (p2) {
				roomDesc = '<em class="p1">' + sanitize(p2) + '</em> <small>(inactive)</small>';
				rooms[id].notifying = false;
				closesize = 'close0';
			} else {
				roomDesc = '' + roomName + '<small>(empty)</small>';
				rooms[id].notifying = false;
				closesize = 'close0';
			}
		}
		code += '<div><a id="tabtab-' + id + '" class="tab battletab' + (curRoom.id === id ? ' cur' : '') + (rooms[id] && rooms[id].notifying ? ' notifying' : '') + '" href="' + locPrefix + '' + id + '" onclick="selectTab(\'' + id + '\');return false">' + roomDesc + '</a><span onclick="leaveTab(\'' + id + '\')" class="close ' + closesize + '"></span></div>';
	}
	$('#leftbar').html(code);
	$('#inline-nav').html('<h3>Your tabs</h3>' + code.replace(/ id="[^"]*"/g, ''));
}
var widthClass = 'normal-layout';
var heightClass = 'normal-height';
var fixedWidth = true;

function updateResize() {
	if (window.screen && screen.width && screen.width >= 640) {
		if (fixedWidth) {
			document.getElementById('viewport').setAttribute('content','width=device-width');
			fixedWidth = false;
		}
	} else {
		if (!fixedWidth) {
			document.getElementById('viewport').setAttribute('content','width=640');
			fixedWidth = true;
		}
	}
	
	if ($(window).width() < 740) {
		$('body').prop('class', 'tiny-layout');
		widthClass = 'tiny-layout';
	} else if ($(window).width() < 870) {
		$('body').prop('class', 'small-layout');
		widthClass = 'small-layout';
	} else if ($(window).width() < 1420) {
		$('body').prop('class', 'normal-layout');
		widthClass = 'normal-layout';
	} else {
		$('body').prop('class', 'huge-layout');
		widthClass = 'huge-layout';
	}

	if ($(window).height() < 575) {
		$('body').addClass('tiny-height');
		heightClass = 'tiny-height';
	} else {
		$('body').addClass('normal-height');
		heightClass = 'normal-height';
	}
	updateLobbyChat();
}

function tooltipAttrs(thing, type, ownHeight, isActive) {
	return ' onmouseover="return showTooltip(\'' + sanitize(''+thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ', ' + (isActive ? 'true' : 'false') + ')" onmouseout="return hideTooltip()" onmouseup="hideTooltip()"';
}

function showTooltip(thing, type, elem, ownHeight, isActive) {
	var offset = {
		left: 150,
		top: 500
	};
	if (elem) offset = $(elem).offset();
	var x = offset.left - 25;
	if (elem) {
		if (ownHeight) offset = $(elem).offset();
		else offset = $(elem).parent().offset();
	}
	var y = offset.top - 15;

	if (widthClass === 'tiny-layout') {
		if (x > 360) x = 360;
	}
	if (y < 140) y = 140;
	$('#tooltipwrapper').css({
		left: x,
		top: y
	});

	var text = '';
	switch (type) {
	case 'move':
		var move = Tools.getMove(thing);
		if (!move) return;
		var basePower = move.basePower;
		if (!basePower) basePower = '&mdash;';
		var accuracy = move.accuracy;
		if (!accuracy || accuracy === true) accuracy = '&mdash;';
		else accuracy = '' + accuracy + '%';
		text = '<div class="tooltipinner"><div class="tooltip">';
		text += '<h2>' + move.name + '<br />'+Tools.getTypeIcon(move.type)+' <img src="/sprites/categories/' + move.category + '.png" alt="' + move.category + '" /></h2>';
		text += '<p>Base power: ' + basePower + '</p>';
		text += '<p>Accuracy: ' + accuracy + '</p>';
		if (move.desc) {
			text += '<p class="section">' + move.desc + '</p>';
		}
		text += '</div></div>';
		break;
	case 'pokemon':
		var pokemon = curRoom.battle.getPokemon(thing);
		if (!pokemon) return;
		//fallthrough
	case 'sidepokemon':
		if (!pokemon) pokemon = curRoom.battle.mySide.pokemon[parseInt(thing)];
		text = '<div class="tooltipinner"><div class="tooltip">';
		text += '<h2>' + pokemon.getFullName() + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';
		
		var types = pokemon.types;
		var template = pokemon;
		if (pokemon.volatiles.transform && pokemon.volatiles.formechange) {
			template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
			types = template.types;
			text += '<small>(Transformed into '+pokemon.volatiles.formechange[2]+')</small><br />';
		} else if (pokemon.volatiles.formechange) {
			template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
			types = template.types;
			text += '<small>(Forme: '+pokemon.volatiles.formechange[2]+')</small><br />';
		}
		if (pokemon.volatiles.typechange) {
			text += '<small>(Type changed)</small><br />';
			types = [pokemon.volatiles.typechange[2]];
		}
		text += Tools.getTypeIcon(types[0]);
		if (types[1]) {
			text += ' '+Tools.getTypeIcon(types[1]);
		}
		text += '</h2>';
		if (!isActive) {
			text += '<p>HP: ' + Math.round(100 * pokemon.hp / pokemon.maxhp) + '% ('+pokemon.hp+'/'+pokemon.maxhp+')'+(pokemon.status?' <span class="status '+pokemon.status+'">'+pokemon.status.toUpperCase()+'</span>':'')+'</p>';
		}
		if (!pokemon.baseAbility && (!pokemon.ability || pokemon.ability.substr(0, 2) === '??')) {
			text += '<p>Possible abilities: ' + Tools.getAbility(template.abilities['0']).name;
			if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
			if (template.abilities['DW']) text += ', ' + Tools.getAbility(template.abilities['DW']).name;
			text += '</p>';
		} else if (pokemon.ability) {
			text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
		} else if (pokemon.baseAbility) {
			text += '<p>Ability: ' + Tools.getAbility(pokemon.baseAbility).name + '</p>';
		}
		if (pokemon.item) {
			text += '<p>Item: ' + Tools.getItem(pokemon.item).name + '</p>';
		}
		if (pokemon.moves && pokemon.moves.length && (!isActive || isActive === 'foe')) {
			text += '<p class="section">';
			for (var i = 0; i < pokemon.moves.length; i++) {
				var name = Tools.getMove(pokemon.moves[i]).name;
				text += '&#8901; ' + name + '<br />';
			}
			text += '</p>';
		}
		text += '</div></div>';
		break;
	}
	$('#tooltipwrapper').html(text);
	return true;
}

function hideTooltip() {
	$('#tooltipwrapper').html('');
	return true;
}

var initialized = false;

var socketInit = null;

$(window).resize(updateResize);

var changeState = function () {};

var loc = 'lobby';
if (document.location.pathname.substr(0, locPrefix.length) === locPrefix) {
	loc = document.location.pathname.substr(locPrefix.length);
	if (loc === 'test.html' || loc === 'temp.html' || loc.substr(loc.length-15) === 'testclient.html') loc = 'lobby';
}

if (window.history && history.pushState) {
	// HTML5 history
	changeState = function (newLoc) {
		if (!initialized) return;
		if (document.location.pathname !== locPrefix + newLoc) {
			history.pushState(null, null, locPrefix + newLoc);
		}
		loc = newLoc;
	};
	window.onpopstate = function (e) {
		if (document.location.pathname.substr(0, locPrefix.length) === locPrefix) {
			loc = document.location.pathname.substr(locPrefix.length);
			if (loc === 'test.html' || loc === 'temp.html' || loc.substr(loc.length-15) === 'testclient.html') loc = 'lobby';
			if (!socket) {
				return; // haven't even initted yet
			}
			selectTab(loc);
		}
	};
}

var notify = function () {};
var requestNotify = function () {};
var dismissNotify = function () {};
var needEnableNotify = function () {
		return false;
	};
var activeNotification = null;
var activeNotificationData = null;

window.focused = true;
$(window).focus(function () {
	window.focused = true;
	dismissNotify();
});
$(window).click(function () {
	window.focused = true;
	dismissNotify();
});
$(window).blur(function () {
	window.focused = false;
});

var favicon = {

	// -- "PUBLIC" ----------------------------------------------------------------
	defaultPause: 500,

	change: function (iconURL, optionalDocTitle) {
		clearTimeout(this.loopTimer);
		if (optionalDocTitle) {
			document.title = optionalDocTitle;
		}
		this.addLink(iconURL, true);
	},

	animate: function (iconSequence, optionalDelay) {
		this.preloadIcons(iconSequence);
		this.iconSequence = iconSequence;
		this.sequencePause = (optionalDelay) ? optionalDelay : this.defaultPause;
		favicon.index = 0;
		favicon.change(iconSequence[0]);
		this.loopTimer = setInterval(function () {
			favicon.index = (favicon.index + 1) % favicon.iconSequence.length;
			favicon.addLink(favicon.iconSequence[favicon.index], false);
		}, favicon.sequencePause);
	},

	// -- "PRIVATE" ---------------------------------------------------------------
	loopTimer: null,

	preloadIcons: function (iconSequence) {
		var dummyImageForPreloading = document.createElement("img");
		for (var i = 0; i < iconSequence.length; i++) {
			dummyImageForPreloading.src = iconSequence[i];
		}
	},

	addLink: function (iconURL) {
		var link = document.createElement("link");
		link.type = "image/x-icon";
		link.rel = "shortcut icon";
		link.href = iconURL;
		this.removeLinkIfExists();
		this.docHead.appendChild(link);
	},

	removeLinkIfExists: function () {
		var links = this.docHead.getElementsByTagName("link");
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.type == "image/x-icon" && link.rel == "shortcut icon") {
				this.docHead.removeChild(link);
				return; // Assuming only one match at most.
			}
		}
	},

	docHead: document.getElementsByTagName("head")[0]
}

{
	// HTML5 notifications
	if (window.Notification) {
		needEnableNotify = function () {
			if (Notification.permissionLevel) return (Notification.permissionLevel() !== 'granted');
			if (window.webkitNotifications) return (window.webkitNotifications.checkPermission() != 0);
			return false;
		};
		requestNotify = function () {
			/* if (Notification.permissionLevel && Notification.requestPermission) {
				if (Notification.permissionLevel() !== 'granted') {
					try {
						Notification.requestPermission();
					} catch (e) {};
				}
				return false;
			} */
			/* if (window.webkitNotifications && window.webkitNotifications.requestPermission && window.webkitNotifications.checkPermission() != 0) {
				webkitNotifications.requestPermission();
			} */
			return false;
		};
		dismissNotify = function () {
			favicon.change('/favicon.ico');
			if (activeNotification) {
				activeNotification.cancel();
				activeNotification = null;
				activeNotificationData = null;
			}
		};
		notify = function (data) {
			if (window.focused) return;
			favicon.animate(['/favicon-notify.ico', '/favicon-notify2.ico']);
			if (needEnableNotify()) {
				requestNotify();
			} else {
				var message = 'Something has happened!';
				switch (data.type) {
				case 'challenge':
					message = ""+data.user+" has challenged you to a battle!";
					break;
				case 'highlight':
					message = 'You have been highlighted by ' + data.user + '!';
					break;
				case 'yourMove':
				case 'yourSwitch':
					message = "It's your move in your battle against "+data.user+".";
					break;
				}
				//var notification = window.webkitNotifications.createHTMLNotification('http://play.pokemonshowdown.com/notification.php?type=' + data.type + '&person=' + encodeURIComponent(data.user) + '&personid=' + data.userid + '&room=' + data.room)
				var notification = new Notification("Pokemon Showdown", {
					iconUrl: "/favicon-notify.gif",
					body: message,
					tag: data.type+'-'+data.room+'-'+data.user,
					onclose: function (event) {
						window.focus();
					}
				});
				notification.show();
				dismissNotify();
				activeNotification = notification;
				activeNotificationData = data;
			}
		};
	} else if (window.macgap) {
		// MacGap notifications! :o
		notify = function (data) {
			var message = '';
			switch (data.type) {
			case 'challenge':
				macgap.growl.notify({
					title: "Challenged!",
					content: ""+data.user+" has challenged you to a battle!"
				});
				break;
			case 'highlight':
				macgap.growl.notify({
					title: 'Highlighted!',
					content: 'You have been highlighted by ' + data.user + '!'
				});
				break;
			case 'yourMove':
			case 'yourSwitch':
				macgap.growl.notify({
					title: "Your move!",
					content: "It's your move in your battle against "+data.user+"."
				});
				break;
			default:
				macgap.growl.notify({
					title: "Pokemon Showdown",
					content: "Something has happened!"
				});
				break;
			}
			macgap.dock.badge = "1";
		}
		dismissNotify = function () {
			macgap.dock.badge = "";
		}
	} else {
		var activeNotificationData = null;
		notify = function (data) {
			favicon.animate(['/favicon-notify.ico', '/favicon-notify2.ico']);
			activeNotificationData = data;
			activeNotification = setInterval(updateNotifyTitle, 500);
		};
		dismissNotify = function () {
			favicon.change('/favicon.ico');
			if (activeNotification) {
				clearTimeout(activeNotification);
				document.title = curTitle;
				activeNotification = null;
				activeNotificationData = null;
			}
		};
		updateNotifyTitle = function () {
			if (!activeNotification) return false;
			if (!activeNotificationData) return false;
			window.notifying = !window.notifying;
			if (window.notifying) {
				switch (activeNotificationData.type) {
				case 'challenge':
					document.title = 'CHALLENGED';
					break;
				case 'highlight':
					document.title = 'HIGHLIGHTED';
					break;
				case 'yourMove':
				case 'yourSwitch':
					document.title = 'YOUR MOVE';
					break;
				default:
					document.title = 'ACTIVITY';
					break;
				}
			} else {
				document.title = curTitle;
			}
		};
	}
}

function notificationClick(button, data) {
	switch (button) {
	case 'accept':
		rooms[data.room].formAcceptChallenge(data.userid);
		break;
	case 'reject':
		rooms[data.room].formRejectChallenge(data.userid);
		break;
	}
};

// overlay
function overlay(overlayType, data) {
	var contents = '';
	var focusElem = '';
	var selectElem = '';
	switch (overlayType) {
	case 'message':
		contents = '<p>' + data + '</p>';
		contents += '<p><button onclick="overlayClose();return false" id="overlay_ok">OK</button></p>';
		focusElem = '#overlay_ok';
		break;
	case 'replayuploaded':
		contents = '<p>Your replay has been uploaded! It\'s available at:</p>';
		contents += '<p><a href="http://pokemonshowdown.com/replay/'+data+'" target="_blank" onclick="overlayClose()">http://pokemonshowdown.com/replay/'+data+'</a></p>';
		contents += '<p><button onclick="window.open(\'/replay/battle-'+data+'\',\'_blank\');overlayClose();return false" id="overlay_ok"><strong>Open</strong></button> <button onclick="overlayClose();return false" id="overlay_cancel">Cancel</button></p>';
		focusElem = '#overlay_ok';
		break;
	case 'init':
		if (data) return;
		contents = '<p><strong>Pokemon Showdown is BETA</strong> and unfinished. If you are looking for something that isn\'t frequently down for maintenance and bug fixes, please check back in several weeks.</p>';
		contents += '<p>There is a link to report bugs in the top right. If you find a bug, please report it.</p>';
		contents += '<p><button onclick="overlayClose();return false" id="overlay_ok"><strong>I understand</strong></button> <button onclick="document.location.href = \'http://www.zombo.com/\';return false">I don\'t understand</button></p>';
		focusElem = '#overlay_ok';
		break;
	case 'register':
		if (!data) data = {};
		if (me.registered && me.registered.userid === me.userid) return;
		if (data.ifuserid !== me.userid) return;
		if (data.error) {
			contents += '<p class="error">' + data.error + '</p>';
		} else if (data.reason) {
			contents += '<p>' + data.reason + '</p>';
		} else {
			contents += '<p>Register an account:</p>';
		}
		contents += '<p><label class="label">Username:</label> ' + (data.name || me.name) + '<input type="hidden" id="overlay_username" value="' + sanitize(data.name || me.name) + '" /></p>';
		contents += '<p><label class="label">Password:</label> <input class="textbox" type="password" id="overlay_password" /></p>';
		contents += '<p><label class="label">Password (confirm):</label> <input class="textbox" type="password" id="overlay_cpassword" /></p>';
		contents += '<p><img src="/sprites/bwani/pikachu.gif" /></p>';
		contents += '<p><label class="label">What is this pokemon?</label> <input class="textbox" type="text" id="overlay_captcha" value="' + sanitize(data.captcha) + '" /></p>';
		contents += '<p><button type="submit"><strong>Register</strong></button> <button onclick="overlayClose();return false">Cancel</button></p>';
		selectElem = '#overlay_password';
		break;
	case 'login':
		if (!data) data = {};
		if (data.error) {
			contents += '<p class="error">' + data.error + '</p>';
		} else if (data.reason) {
			contents += '<p>' + data.reason + '</p>';
		} else {
			contents += '<p>The name you chose is registered.</p>';
		}
		contents += '<p><label class="label">Username:</label> ' + data.name + '<input type="hidden" id="overlay_username" value="' + sanitize(data.name) + '" /></p>';
		contents += '<p><label class="label">Password:</label> <input class="textbox" type="password" id="overlay_password" /></p>';
		contents += '<p><button type="submit"><strong>Log in</strong></button> <button onclick="overlayClose();return false">Cancel</button></p>';
		selectElem = '#overlay_password';
		break;
	case 'betalogin':
		if (!data) data = {};
		contents += '<p><strong>Pokemon Showdown is in private beta testing.</strong></p>';
		contents += '<p><a href="http://www.smogon.com/forums/showthread.php?p=3948327#post3948327">Request a beta account</a></p>';
		if (data.error) {
			contents += '<p class="error">' + data.error + '</p>';
		} else if (data.reason) {
			contents += '<p>' + data.reason + '</p>';
		} else {}
		contents += '<p><label class="label">Username:</label> <input class="textbox" type="text" id="overlay_username" value="' + sanitize(data.name || '') + '" /></p>';
		contents += '<p><label class="label">Password:</label> <input class="textbox" type="password" id="overlay_password" /></p>';
		contents += '<p><button type="submit"><strong>Log in</strong></button> <button onclick="overlayClose();return false">Cancel</button></p>';
		selectElem = '#overlay_username';
		break;
	case 'down':
		contents += '<p style="font-size:14pt"><strong>Pokemon Showdown is under heavy load.<br />:(</strong></p>';
		contents += '<p>Bear with us as we freak out.</p>';
		// contents += '<p><a href="http://www.smogon.com/forums/showthread.php?p=4319109#post4319109">We\'re currently on a backup server, and it\'s full.</a></p>';
		contents += '<p>(Alternatively, reload this page in an hour or two; it should be back up by then.)</p>';
		// contents += '<p><strong>We WILL fix these performance issues ASAP.</strong></p>';
		// contents += '<p>Please try back in an hour or so; the server will open and close intermittently until we sort out the remaining performance issues.</p>';
		// contents += '<p style="font-size:14pt"><strong>Pokemon Showdown is confirmed to be under a DDoS attack. :(</strong></p>';
		// contents += '<p>Bear with us as we freak out.</p>';
		// contents += '<p><a href="http://www.smogon.com/forums/showthread.php?t=3469851">There\'s slightly more information in this Smogon thread.</a></p>';
		// contents += '<p>Please try back later today.</p>';
		break;
	case 'unsupported':
		contents += '<p><strong>You have an old version of your browser.</strong></p>';
		contents += '<p>Please upgrade to one of:</p>';
		contents += '<p>Internet Explorer 9+, Firefox 4+, Chrome 11+, Safari 4+</p>';
		break;
	case 'rename':
		if (!data) data = {};
		if (data.error) {
			contents += '<p class="error">' + data.error + '</p>';
			if (data.error.indexOf(' forced you to change ') >= 0) {
				contents += '<p>Keep in mind these rules:</p>';
				contents += '<ol>';
				contents += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
				contents += '<li>Usernames may not reference sexual activity, directly or indirectly.</li>';
				contents += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
				contents += '</ol>';
			}
		}
		contents += '<p><label class="label">Username:</label> <input class="textbox" type="text" id="overlay_name" value="' + (me.named ? sanitize(me.name) : '') + '" /></p>';
		contents += '<p><button type="submit"><strong>Choose name</strong></button> <button onclick="overlayClose();return false">Cancel</button></p>';
		selectElem = '#overlay_name';
		break;
	case 'forfeit':
		contents += '<p>Are you sure you want to forfeit? <input type="hidden" id="overlay_room" value="' + data + '" /></p>';
		contents += '<p><button type="submit"><strong>Forfeit</strong></button> <button onclick="overlayClose();return false" id="overlay_cancel">Cancel</button></p>';
		selectElem = '#overlay_cancel';
		break;
	case 'disconnect':
		if (rooms.teambuilder && rooms.teambuilder.formSave) {
			rooms.teambuilder.formSave();
		}
		contents += '<p>You have been disconnected - possibly because the server was restarted.</p>'
		contents += '<p><button onclick="document.location.reload();return false" id="overlay_refresh"><strong>Reconnect</strong></button> <button onclick="overlayClose();return false">Cancel</button></p>';
		focusElem = '#overlay_refresh';
	}
	$('#overlay').html('<form id="messagebox" onsubmit="overlaySubmit(event, \'' + overlayType + '\'); return false">' + contents + '</form>');
	$('#overlay').show();
	if (selectElem) $(selectElem).select();
	else if (focusElem) $(focusElem).focus();
};

function overlayClose() {
	$('#overlay').html('');
	$('#overlay').hide();
};

function renameMe(name) {
	if (me.userid !== toId(name)) {
		$.get(actionphp + '?act=getassertion&userid=' + toId(name), function(data){
			if (data === ';') {
				overlay('login', {name: name});
			} else if (data.indexOf('\n') >= 0) {
				alert("The login server is overloaded. Please try again later.");
			} else {
				rooms.lobby.send('/trn '+name+',0,'+data);
			}
		});
	} else {
		rooms.lobby.send('/trn '+name);
	}
}
function overlaySubmit(e, overlayType) {
	switch (overlayType) {
	case 'rename':
		var name = $('#overlay_name').val();
		renameMe(name);
		overlayClose();
		break;
	case 'login':
	case 'betalogin':
		var name = $('#overlay_username').val();
		$.post(actionphp, {
			act: 'login',
			name: name,
			pass: $('#overlay_password').val()
		}, function (data) {
			if (!data) data = {};
			var token = data.assertion;
			if (data.curuser && data.curuser.loggedin) {
				me.registered = data.curuser;
				name = data.curuser.username;
				if (!socket) {
					document.location.reload();
					return;
				}
				rooms.lobby.send('/trn '+name+',0,'+token);
				/* emit(socket, 'rename', {
					name: name,
					token: token
				}); */
				//overlay('message', "Logged in successfully.");
			} else {
				overlay(overlayType, {
					name: name,
					error: 'Wrong password.'
				});
			}
		}, 'json');
		overlayClose();
		break;
	case 'register':
		var name = $('#overlay_username').val();
		var captcha = $('#overlay_captcha').val();
		$.post(actionphp, {
			act: 'register',
			username: name,
			password: $('#overlay_password').val(),
			cpassword: $('#overlay_cpassword').val(),
			captcha: captcha
		}, function (data) {
			if (!data) data = {};
			var token = data.assertion;
			if (data.curuser && data.curuser.loggedin) {
				me.registered = data.curuser;
				name = data.curuser.username;
				if (!socket) {
					document.location.reload();
					return;
				}
				rooms.lobby.send('/trn '+name+',1,'+token);
				overlay('message', "You have been successfully registered.");
			} else {
				overlay('register', {
					ifuserid: me.userid,
					name: name,
					captcha: captcha,
					error: data.actionerror
				});
			}
		}, 'json').error(function (e) {
			alert('error: ' + e);
		});
		overlayClose();
		break;
	case 'forfeit':
		var room = rooms[$('#overlay_room').val()];
		if (room) {
			room.formForfeit();
			leaveTab(room.id, true);
		}
		overlayClose();
		break;
	}
}

function init() {
	addTab('teambuilder', 'teambuilder');
	addTab('ladder', 'ladder');

	if (socketInit) socketInit();

	initialized = true;
}

var cookieTeams = true;
(function () {
	var savedTeam = $.parseJSON($.cookie('showdown_team1'));
	if (savedTeam) {
		teams.push(savedTeam);
	}
	savedTeam = $.parseJSON($.cookie('showdown_team2'));
	if (savedTeam) {
		teams.push(savedTeam);
	}
	savedTeam = $.parseJSON($.cookie('showdown_team3'));
	if (savedTeam) {
		teams.push(savedTeam);
	}
	if (window.localStorage) {
		cookieTeams = false;
		var teamString = localStorage.getItem('showdown_teams');
		if (teamString) teams = JSON.parse(teamString);
	}
})();

var name = ($.cookie('showdown_username') || '');

// time to connect
if (!Config.down) {
	function onConnect(data) {
		if (!data) data = {};
		var token = data.assertion || '';

		if (data.curuser && data.curuser.loggedin) {
			me.registered = data.curuser;
			name = data.curuser.username;
		} else if (Config.oldie) {
			overlay('unsupported');
			return;
		} else if (Config.requirelogin) {
			document.getElementById('loading-message').innerHTML = '';
			overlay('betalogin');
			return;
		}

		// lib isn't served by servers anymore - security issue, also scalability

		// var lib = (Config.serverprotocol === 'io' ? window.io : (Config.serverprotocol === 'eio' ? window.eio : window.SockJS));
		// if (!lib) {
		// 	overlay('message', "<p>Could not connect to Showdown server at <code>" + Config.server + ':' + Config.serverport + "</code>.</p><p>You may have mistyped the address, or the server may be down for maintenance. We apologize for the inconvenience.</p>");
		// 	return;
		// }

		// temporarily relocated connection code
		/* else if (isAndroid) {
			alert('Showdown doesn\'t work with the built-in Android browser - please use Firefox for Android instead.');
			//socket = io.connect('http://'+Config.server+':'+Config.serverport, {transports:['jsonp-polling']});
			if (Config.serverprotocol === 'io') socket = io.connect('http://' + Config.server + ':' + Config.serverport);
			else socket = new SockJS('http://' + Config.server + ':' + Config.serverport);
		} */

		{
			if (Config.serverprotocol === 'io') socket = io.connect('http://' + Config.server + ':' + Config.serverport);
			else if (Config.serverprotocol === 'eio') socket = new eio.Socket({ host: Config.server, port: Config.serverport });
			else socket = new SockJS('http://' + Config.server + ':' + Config.serverport);
		}

		var events = {
			init: function (data) {
				if (data.name) {
					me.name = data.name;
					me.named = data.named;
					me.userid = data.userid;
					me.renamePending = !! data.renamePending;
					if (data.token) me.token = data.token;
				}
				if (data.notFound) {
					selectTab('lobby');
					return;
				}
				var tempInitialize = function () {
						addTab(data.room, data.roomType);
						var room = rooms[data.room];
						room.init(data);
						updateMe(data);
						$('#loading-message').remove();
						//if (!initialized) // (!initialized && rooms[loc])
						{
							if (loc && loc !== 'lobby') {
								selectTab(loc);
							}
						}
					};
				if (!initialized) {
					socketInit = tempInitialize;
				} else {
					tempInitialize();
				}
			},
			update: function (data) {
				if (typeof data.name !== 'undefined') {
					me.name = data.name;
					me.named = data.named;
					me.userid = data.userid;
					me.renamePending = !! data.renamePending;
					if (data.token) me.token = data.token;
				}
				if (typeof data.challengesFrom !== 'undefined') {
					me.challengesFrom = data.challengesFrom;
					rooms.lobby.notifying = false;
					for (var i in me.challengesFrom) {
						rooms.lobby.notifying = true;
						break;
					}
					updateRoomList();
					rooms.lobby.updateMainTop();
				}
				if (typeof data.challengeTo !== 'undefined') {
					me.challengeTo = data.challengeTo;
					rooms.lobby.updateMainTop();
				}
				updateMe(data);
				if (data.room && rooms[data.room]) {
					rooms[data.room].update(data);
				} else if (curRoom) {
					//curRoom.update(data);
				}
			},
			disconnect: function () {
				$('#userbar').prepend('<strong style="color:#BB0000;border:1px solid #BB0000;padding:0px 2px;font-size:10pt;">disconnect detected</strong> ');
				overlay('disconnect');
			},
			nameTaken: function (data) {
				if (data && data.permanent) {
					overlay('message', data.reason);
				} else if (data && data.name) {
					overlay('login', data);
				} else if (data) {
					overlay('rename', {
						error: data.reason
					});
				} else {
					alert('nameTaken signal');
					$('#userbar').prepend('<strong style="color:#BB0000;border:1px solid #BB0000;padding:0px 2px;font-size:10pt;">nameTaken signal</strong> ');
				}
			},
			message: function (message) {
				if (message.html) {
					overlay('message', message.html);
					return;
				}
				if (message.message) message = message.message;
				overlay('message', '<div style="white-space:pre-wrap">' + message + '</div>');
			},
			command: function (message) {
				if (message.room && rooms[message.room]) {
					rooms[message.room].command(message);
				}
			},
			console: function (message) {
				var room = null;
				if (message.room && rooms[message.room]) {
					room = rooms[message.room];
					if (room) room.add(message);
					//if (room.id === 'lobby' && message.silent) room.updateMainElem();
				} else {
					if (curRoom) curRoom.message(message, true);
				}
			}
		};

		if (Config.serverprotocol === 'io') {
			for (var e in events) {
				socket.on(e, (function(type) {
					return function(data) {
						events[type](data);
					};
				})(e));
			}
			socket.on('data', function(text) {
				var roomid = 'lobby';
				if (text.substr(0,1) === '>') {
					var nlIndex = text.indexOf('\n');
					if (nlIndex < 0) return;
					roomid = text.substr(1,nlIndex-1);
					text = text.substr(nlIndex+1);
				}
				rooms[roomid].add(text);
				return;
			});
			if (!name) token = '';
			document.getElementById('loading-message').innerHTML += ' DONE<br />Connecting to Showdown server...';
			emit(socket, 'join', {
				name: name,
				room: 'lobby',
				token: token
			});
		} else {
			document.getElementById('loading-message').innerHTML += ' DONE<br />Connecting to Showdown server...';
			socket.onopen = function() {
				if (!name) token = '';
				document.getElementById('loading-message').innerHTML += ' DONE<br />Joining Showdown server...';
				emit(socket, 'join', {
					name: name,
					room: 'lobby',
					token: token
				});
			};
			socket.onmessage = function(msg) {
				if (msg.data.substr(0,1) !== '{') {
					var text = msg.data;
					var roomid = 'lobby';
					if (text.substr(0,1) === '>') {
						var nlIndex = text.indexOf('\n');
						if (nlIndex < 0) return;
						roomid = text.substr(1,nlIndex-1);
						text = text.substr(nlIndex+1);
					}
					// if (window.console && console.log) console.log('<< '+text);
					rooms[roomid].add(text);
					return;
				}
				var data = $.parseJSON(msg.data);
				if (!data) return;
				if (events[data.type]) events[data.type](data);
			};
			socket.onclose = function () {
				$('#userbar').prepend('<strong style="color:#BB0000;border:1px solid #BB0000;padding:0px 2px;font-size:10pt;">disconnect detected</strong> ');
				overlay('disconnect');
			};
		}
	}
	if (Config.testclient) {
		onConnect(Config);
	} else {
		$.post(actionphp, {
			act: 'upkeep',
			name: name
		}, onConnect, 'json');
	}
}
