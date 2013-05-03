(function($) {

	var BattleRoom = this.BattleRoom = this.Room.extend({
		minWidth: 955,
		maxWidth: 1180,
		initialize: function(data) {
			this.me = {};

			this.$el.addClass('ps-room-opaque').html('<div class="battle">Battle is here</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">Connecting...</div><div class="battle-controls"></div>');

			this.$battle = this.$el.find('.battle');
			this.$controls = this.$el.find('.battle-controls');
			this.$chatFrame = this.$el.find('.battle-log');
			this.$chatAdd = this.$el.find('.battle-log-add');
			this.$join = null;
			this.$foeHint = this.$el.find('.foehint');

			this.battle = new Battle(this.$battle, this.$chatFrame);

			this.$chat = this.$chatFrame.find('.inner');

			// this.battle.setMute(me.isMuted());
			this.battle.customCallback = _.bind(this.updateControls, this);
			this.battle.endCallback = _.bind(this.updateControls, this);
			this.battle.startCallback = _.bind(this.updateControls, this);
			this.battle.stagnateCallback = _.bind(this.updateControls, this);

			this.battle.play();

			app.user.on('change', this.updateUser, this);
			this.updateUser();
		},
		events: {
			'keydown textarea': 'keyPress',
			'submit form': 'submit',
			'click .username': 'clickUsername'
		},
		battleEnded: false,
		focus: function() {
			if (this.$chatbox) this.$chatbox.focus();
		},
		join: function() {
			app.send('/join '+this.id);
		},
		leave: function() {
			app.send('/leave '+this.id);
			if (this.battle) this.battle.dealloc();
		},
		updateLayout: function() {
			if (this.$el.width() < 950) {
				this.battle.messageDelay = 800;
			} else {
				this.battle.messageDelay = 8;
			}
			if (this.$chat) this.$chatFrame.scrollTop(this.$chat.height());
		},
		show: function() {
			Room.prototype.show.apply(this, arguments);
			this.updateLayout();
		},
		receive: function(data) {
			this.add(data);
		},
		init: function(data) {
			var log = data.split('\n');
			if (data.substr(0,6) === '|init|') log.shift();
			if (this.battle.activityQueue.length) return;
			this.battle.activityQueue = log;
			this.battle.fastForwardTo(-1);
			this.updateLayout();
			this.updateControls();
		},
		add: function(data) {
			if (data.substr(0,6) === '|init|') {
				return this.init(data);
			}

			var log = data.split('\n');
			for (var i = 0; i < log.length; i++) {
				var logLine = log[i];

				if (logLine === '') {
					this.me.callbackWaiting = false;
					this.$controls.html('');
				}

				if (logLine.substr(0, 6) === '|chat|' || logLine.substr(0, 3) === '|c|' || logLine.substr(0, 9) === '|chatmsg|' || logLine.substr(0, 10) === '|inactive|') {
					this.battle.instantAdd(logLine);
				} else {
					this.battle.add(logLine, Tools.prefs('noanim'));
				}
			}
			this.updateControls();
		},
		updateUser: function() {
			var name = app.user.get('name');
			var userid = app.user.get('userid');
			if (!name) {
				this.$chatAdd.html('Connecting...');
				this.$chatbox = null;
			} else if (!app.user.get('named')) {
				this.$chatAdd.html('<form><button>Join chat</button></form>');
				this.$chatbox = null;
			} else {
				this.$chatAdd.html('<form class="chatbox"><label style="' + hashColor(userid) + '">' + Tools.escapeHTML(name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off"></textarea></form>');
				this.$chatbox = this.$chatAdd.find('textarea');
				this.$chatbox.autoResize({
					animate: false,
					extraSpace: 0
				});
				if (this === app.curSideRoom || this === app.curRoom) {
					this.$chatbox.focus();
				}
			}
		},
		submit: function(e) {
			e.preventDefault();
			e.stopPropagation();
			var text;
			if ((text = this.$chatbox.val())) {
				// this.tabComplete.reset();
				// this.chatHistory.push(text);
				// text = this.parseCommand(text);
				if (text) {
					this.send(text);
				}
				this.$chatbox.val('');
			}
		},
		keyPress: function(e) {
			if (e.keyCode === 13 && !e.shiftKey) { // Enter
				this.submit(e);
			} else if (e.keyCode === 9 && !e.shiftKey && !e.ctrlKey) { // Tab
				// if (this.handleTabComplete(this.$chatbox)) {
				// 	e.preventDefault();
				// 	e.stopPropagation();
				// }
			}
		},
		clickUsername: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var name = $(e.currentTarget).data('name');
			app.addPopup('user', UserPopup, {name: name, sourceEl: e.currentTarget});
		},

		/*********************************************************
		 * Battle stuff
		 *********************************************************/

		updateControls: function() {
			if (this.battle.playbackState === 2) {
				this.$controls.html('Playing.');
			} else {
				this.$controls.html('Not playing.');
			}
		},
		updateJoinButton: function() {
			if (this.battle.done) this.battleEnded = true;
			if (selfR.battleEnded) {
				selfR.controlsElem.html('<div class="controls"><em><button onclick="return rooms[\'' + selfR.id + '\'].formRestart()">Instant Replay</button><!--button onclick="return rooms[\'' + selfR.id + '\'].formSaveReplay()">Share replay</button--></em></div>');
				if (selfR.me.side) {
					selfR.controlsElem.html('<div class="controls"><em><button onclick="return rooms[\'' + selfR.id + '\'].formRestart()">Instant Replay</button> <button onclick="return rooms[\'' + selfR.id + '\'].formSaveReplay()">Share replay</button> <button onclick="return rooms[\'' + selfR.id + '\'].formLeaveBattle()">Leave this battle</button></em></div>');
				}
				if (selfR.joinElem) {
					selfR.joinElem.remove();
				}
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
		},
		// Same as send, but appends the rqid to the message so that the server
		// can verify that the decision is sent in response to the correct request.
		sendDecision: function(message) {
			this.send(message + '|' + this.me.request.rqid);
		},
		request: null,
		receiveRequest: function(request) {
			this.request = request; // currently unused
			request.requestType = 'move';
			var notifyObject = null;
			if (request.forceSwitch) {
				request.requestType = 'switch';
				notifyObject = {
					type: 'yourSwitch',
					room: selfR.id
				};
			} else if (request.teamPreview) {
				request.requestType = 'team';
				notifyObject = {
					type: 'yourSwitch',
					room: selfR.id
				};
			} else if (request.wait) {
				request.requestType = 'wait';
			} else {
				notifyObject = {
					type: 'yourMove',
					room: selfR.id
				};
			}
			// if (notifyObject) {
			// 	var doNotify = function() {
			// 		notify(notifyObject);
			// 		selfR.notifying = true;
			// 		updateRoomList();
			// 	};
			// 	if (selfR.battle.yourSide.initialized) {
			// 		// The opponent's name is already known.
			// 		notifyObject.user = selfR.battle.yourSide.name;
			// 		doNotify();
			// 	} else {
			// 		// The opponent's name isn't known yet, so wait until it is
			// 		// known before sending the notification, so that it can include
			// 		// the opponent's name.
			// 		var callback = selfR.battle.stagnateCallback;
			// 		selfR.battle.stagnateCallback = function(battle) {
			// 			notifyObject.user = battle.yourSide.name;
			// 			doNotify();
			// 			battle.stagnateCallback = callback;
			// 			if (callback) callback(battle);
			// 		};
			// 	}
			// }
		},
		updateSide: function(sideData, midBattle) {
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
					if (!pokemon.ability) pokemon.ability = pokemon.baseAbility;
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
		},
		callback: function (battle, type, moveTarget) {
			if (!battle) battle = selfR.battle;
			selfR.notifying = false;
			if (type === 'restart') {
				selfR.me.callbackWaiting = false;
				selfR.battleEnded = true;
				updateRoomList();
				return;
			} else if (type === 'trapped') {
				var idx = parseInt(moveTarget[1], 10); // moveTarget is a poor name now...
				if (selfR.me.request && selfR.me.request.active &&
						selfR.me.request.active[idx]) {
					// This pokemon is now known to be trapped.
					selfR.me.request.active[idx].trapped = true;
					// TODO: Maybe a more sophisticated UI for this.
					// In singles, this isn't really necessary because the switch UI will be
					// immediately disabled. However, in doubles it might not be obvious why
					// the player is being asked to make a new decision without this message.
					selfR.battle.add(selfR.battle.mySide.active[idx].getName() + ' is trapped!');
				}
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
					selfR.me.finalDecision = active.maybeTrapped || false;
					if (selfR.me.finalDecision) {
						for (var i = pos + 1; i < selfR.battle.mySide.active.length; ++i) {
							var p = selfR.battle.mySide.active[i];
							if (p && !p.fainted) {
								selfR.me.finalDecision = false;
							}
						}
					}

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
								controls += '<button disabled="disabled"' + tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
							} else {
								controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSelectTarget(' + i + ', false)"' + tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
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
								controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
							} else {
								controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSelectTarget(' + i + ', true)"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
							}
						}
						controls += '</div>';
						controls += '</div>';
						selfR.controlsElem.html(controls);
						break;
					}

					// Move chooser

					controls += 'What will <strong>' + Tools.escapeHTML(switchables[pos].name) + '</strong> do? '+hpbar+'</div>';
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
						if (selfR.me.finalDecision) {
							controls += '<em>You <strong>might</strong> be trapped, so you won\'t be able to cancel a switch!</em><br/>';
						}
						for (var i = 0; i < switchables.length; i++) {
							var pokemon = switchables[i];
							pokemon.name = pokemon.ident.substr(4);
							if (pokemon.zerohp || i < selfR.battle.mySide.active.length || selfR.choiceSwitchFlags[i]) {
								controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
							} else {
								controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSwitchTo(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
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
				selfR.me.finalDecision = false;
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
				controls += 'Switch <strong>'+Tools.escapeHTML(switchables[pos].name)+'</strong> to:</div>';
				controls += '<div class="switchcontrols"><div class="switchselect"><button onclick="rooms[\'' + selfR.id + '\'].formSelectSwitch()">Switch</button></div><div class="switchmenu">';
				for (var i = 0; i < switchables.length; i++) {
					var pokemon = switchables[i];
					if (i >= 6) {
						//controls += '<small>Pokeball data corrupt. Please copy the text from this button: <button onclick="prompt(\'copy this text\', curRoom.battle.activityQueue.join(\' :: \'));return false">[click here]</button> and tell aesoft.</small>';
						break;
					}
					if (pokemon.zerohp || i < selfR.battle.mySide.active.length || selfR.choiceSwitchFlags[i]) {
						controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
					} else {
						controls += '<button onclick="rooms[\'' + selfR.id + '\'].formSwitchTo(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
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
						controls += '<button onclick="rooms[\'' + selfR.id + '\'].formTeamPreviewSelect(' + i + ')"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
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
							controls += '<button disabled="disabled"' + tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
						} else {
							controls += '<button onclick="rooms[\'' + selfR.id + '\'].formTeamPreviewSelect(' + i + ')"' + tooltipAttrs(selfR.teamPreviewChoice[i]-1, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
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
		},
		formJoinBattle: function () {
			selfR.send('/joinbattle');
			return false;
		},
		formKickInactive: function () {
			selfR.send('/kickinactive');
			return false;
		},
		formStopBattleTimer: function () {
			selfR.send('/timer off');
			return false;
		},
		formForfeit: function () {
			selfR.send('/forfeit');
			return false;
		},
		formSaveReplay: function () {
			selfR.send('/savereplay');
			return false;
		},
		formRestart: function () {
			/* hideTooltip();
			selfR.send('/restart'); */
			selfR.me.request = null;
			selfR.battle.reset();
			selfR.battle.play();
			return false;
		},
		formUseMove: function (move, target) {
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
			selfR.me.finalDecision = false;
			if (selfR.battle.kickingInactive) {
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
			} else {
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
			}
			selfR.sendDecision('/choose '+selfR.choices.join(','));
			selfR.notifying = false;
			updateRoomList();
			return false;
		},
		formSelectTarget: function (pos, isMySide) {
			var posString;
			if (isMySide) {
				posString = ''+(-(pos+1));
			} else {
				posString = ''+(pos+1);
			}
			selfR.choices[selfR.choices.length-1] += ' '+posString;
			selfR.formUseMove();
			return false;
		},
		formSwitchTo: function (pos) {
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
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
			} else {
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
			}
			selfR.sendDecision('/choose '+selfR.choices.join(','));
			selfR.notifying = false;
			updateRoomList();
			return false;
		},
		formTeamPreviewSelect: function (pos) {
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
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formStopBattleTimer();return false"><small>Stop timer</small></button>');
			} else {
				selfR.controlsElem.html('<div class="controls"><em>Waiting for opponent...</em> ' + (selfR.me.finalDecision ? '' : '<button onclick="rooms[\'' + selfR.id + '\'].formUndoDecision(); return false">Cancel</button>') + '</div> <br /><button onclick="rooms[\'' + selfR.id + '\'].formKickInactive();return false"><small>Kick inactive player</small></button>');
			}
			selfR.sendDecision('/team '+(pos));
			selfR.notifying = false;
			updateRoomList();
			return false;
		},
		formUndoDecision: function (pos) {
			selfR.send('/undo');
			selfR.notifying = true;
			selfR.callback(selfR.battle, 'decision');
			return false;
		},
		// Key press in the battle chat textbox.
		formKeyPress: function (e) {
			hideTooltip();
			if (e.keyCode === 13) {
				if (selfR.chatboxElem.val()) {
					var text = selfR.chatboxElem.val();
					rooms.lobby.tabComplete.reset();
					rooms.lobby.chatHistory.push(text);
					text = rooms.lobby.parseCommand(text);
					if (text) {
						selfR.send(text);
					}
					selfR.chatboxElem.val('');
				}
				return false;
			}
			return true;
		},
		formRename: function () {
			overlay('rename');
			return false;
		},
		formLeaveBattle: function () {
			hideTooltip();
			selfR.send('/leavebattle');
			selfR.notifying = false;
			updateRoomList();
			return false;
		},
		formSelectSwitch: function () {
			hideTooltip();
			selfR.controlsElem.find('.controls').attr('class', 'controls switch-controls');
			return false;
		},
		formSelectMove: function () {
			hideTooltip();
			selfR.controlsElem.find('.controls').attr('class', 'controls move-controls');
			return false;
		}
	});

}).call(this, jQuery);
