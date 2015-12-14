(function ($) {

	var BattleRoom = this.BattleRoom = ConsoleRoom.extend({
		type: 'battle',
		title: '',
		minWidth: 955,
		maxWidth: 1180,
		initialize: function (data) {
			this.me = {};

			this.$el.addClass('ps-room-opaque').html('<div class="battle">Battle is here</div><div class="foehint"></div><div class="battle-log"></div><div class="battle-log-add">Connecting...</div><div class="battle-controls"></div><button class="battle-chat-toggle button" name="showChat">Chat</button>');

			this.$battle = this.$el.find('.battle');
			this.$controls = this.$el.find('.battle-controls');
			this.$chatFrame = this.$el.find('.battle-log');
			this.$chatAdd = this.$el.find('.battle-log-add');
			this.$join = null;

			// tooltips
			var buf = '';
			var tooltips = {
				your2: {top: 70, left: 250, width: 80, height: 100},
				your1: {top: 85, left: 320, width: 90, height: 100},
				your0: {top: 90, left: 390, width: 100, height: 100},
				my0: {top: 200, left: 130, width: 120, height: 160},
				my1: {top: 200, left: 250, width: 150, height: 160},
				my2: {top: 200, left: 350, width: 150, height: 160}
			};
			for (var active in tooltips) {
				buf += '<div style="position:absolute;';
				for (var css in tooltips[active]) {
					buf += css + ':' + tooltips[active][css] + 'px;';
				}
				buf += '"' + this.tooltipAttrs(active, 'pokemon', true, true) + '></div>';
			}
			this.$foeHint = this.$el.find('.foehint');
			this.$foeHint.html(buf);

			BattleSound.setMute(Tools.prefs('mute'));
			this.battle = new Battle(this.$battle, this.$chatFrame);
			this.battle.roomid = this.id;
			this.users = {};

			this.$chat = this.$chatFrame.find('.inner');

			this.$options = this.battle.optionsElem.html('<div style="padding-top: 3px; text-align: right"><label style="font-size: 8pt; padding: 3px 5px"><input type="checkbox" name="ignorespects" /> Ignore Spectators</label> <label style="font-size: 8pt; padding: 3px 5px"><input type="checkbox" name="ignoreopp" /> Ignore Opponent</label></div>');

			this.battle.customCallback = _.bind(this.updateControls, this);
			this.battle.endCallback = _.bind(this.updateControls, this);
			this.battle.startCallback = _.bind(this.updateControls, this);
			this.battle.stagnateCallback = _.bind(this.updateControls, this);

			this.battle.play();
		},
		events: {
			'change input[name=ignorespects]': 'toggleIgnoreSpects',
			'change input[name=ignoreopp]': 'toggleIgnoreOpponent',
			'click .replayDownloadButton': 'clickReplayDownloadButton'
		},
		battleEnded: false,
		join: function () {
			app.send('/join ' + this.id);
		},
		showChat: function () {
			this.$('.battle-chat-toggle').attr('name', 'hideChat').text('Battle');
			this.$el.addClass('showing-chat');
		},
		hideChat: function () {
			this.$('.battle-chat-toggle').attr('name', 'showChat').text('Chat');
			this.$el.removeClass('showing-chat');
		},
		leave: function () {
			if (!this.expired) app.send('/leave ' + this.id);
			if (this.battle) this.battle.destroy();
		},
		requestLeave: function (e) {
			if (this.side && this.battle && !this.battleEnded && !this.expired && !this.battle.forfeitPending) {
				app.addPopup(ForfeitPopup, {room: this, sourceEl: e && e.currentTarget});
				return false;
			}
			return true;
		},
		updateLayout: function () {
			var width = $(window).width();
			if (width < 950) {
				this.battle.messageDelay = 800;
			} else {
				this.battle.messageDelay = 8;
			}
			if (width && width < 640) {
				var scale = (width / 640);
				this.$battle.css('transform', 'scale(' + scale + ')');
				this.$foeHint.css('transform', 'scale(' + scale + ')');
				this.$controls.css('top', 360 * scale + 10);
			} else {
				this.$battle.css('transform', 'none');
				this.$foeHint.css('transform', 'none');
				this.$controls.css('top', 370);
			}
			if (this.$chat) this.$chatFrame.scrollTop(this.$chat.height());
		},
		show: function () {
			Room.prototype.show.apply(this, arguments);
			this.updateLayout();
		},
		receive: function (data) {
			this.add(data);
		},
		focus: function () {
			this.hideTooltip();
			if (this.battle.playbackState === 3) this.battle.play();
			ConsoleRoom.prototype.focus.call(this);
		},
		blur: function () {
			this.battle.pause();
		},
		init: function (data) {
			var log = data.split('\n');
			if (data.substr(0, 6) === '|init|') log.shift();
			if (log.length && log[0].substr(0, 7) === '|title|') {
				this.title = log[0].substr(7);
				log.shift();
				app.roomTitleChanged(this);
			}
			if (this.battle.activityQueue.length) return;
			this.battle.activityQueue = log;
			this.battle.fastForwardTo(-1);
			if (this.battle.ended) this.battleEnded = true;
			this.updateLayout();
			this.updateControls();
		},
		add: function (data) {
			if (!data) return;
			if (data.substr(0, 6) === '|init|') {
				return this.init(data);
			}
			if (data.substr(0, 9) === '|request|') {
				return this.receiveRequest($.parseJSON(data.substr(9)));
			}

			var log = data.split('\n');
			for (var i = 0; i < log.length; i++) {
				var logLine = log[i];

				if (logLine === '|') {
					this.callbackWaiting = false;
					this.controlsShown = false;
					this.$controls.html('');
				}

				if (logLine.substr(0, 10) === '|callback|') {
					// TODO: Maybe a more sophisticated UI for this.
					// In singles, this isn't really necessary because some elements of the UI will be
					// immediately disabled. However, in doubles/triples it might not be obvious why
					// the player is being asked to make a new decision without the following messages.
					var args = logLine.substr(10).split('|');
					var pokemon = isNaN(Number(args[1])) ? this.battle.getPokemon(args[1]) : this.battle.mySide.active[args[1]];
					var requestData = this.request.active[pokemon.slot];
					delete this.choice;
					switch (args[0]) {
					case 'trapped':
						requestData.trapped = true;
						this.battle.activityQueue.push('|message|' + pokemon.getName() + ' is trapped and cannot switch!');
						break;
					case 'cant':
						for (var i = 0; i < requestData.moves.length; i++) {
							if (requestData.moves[i].id === args[3]) {
								requestData.moves[i].disabled = true;
							}
						}
						args.splice(1, 1, pokemon.getIdent());
						this.battle.activityQueue.push('|' + args.join('|'));
						break;
					}
				} else if (logLine.substr(0, 7) === '|title|') {
				} else if (logLine.substr(0, 5) === '|win|') {
					this.battleEnded = true;
					this.battle.activityQueue.push(logLine);
				} else if (logLine.substr(0, 6) === '|chat|' || logLine.substr(0, 3) === '|c|' || logLine.substr(0, 9) === '|chatmsg|' || logLine.substr(0, 10) === '|inactive|') {
					this.battle.instantAdd(logLine);
				} else {
					this.battle.activityQueue.push(logLine);
				}
			}
			this.battle.add('', Tools.prefs('noanim'));
			this.updateControls();
		},
		toggleMessages: function (user) {
			var $messages = $('.chatmessage-' + user);
			var $button = $messages.find('button');
			if ($messages.hasClass('revealed')) {
				$messages.removeClass('revealed').hide();
				$button.html('<small>View ' + ($messages.length - 1) + ' hidden message' + ($messages.length > 1 ? 's' : '') + ' (' + user + ')</small>');
				$button.parent().show();
			} else {
				$messages.addClass('revealed');
				$button.html('<small>Hide ' + ($messages.length - 1) + ' revealed message' + ($messages.length > 1 ? 's' : '') + ' (' + user + ')</small>');
				$button.parent().removeClass('revealed');
				$messages.show();
			}
		},

		/*********************************************************
		 * Battle stuff
		 *********************************************************/

		updateControls: function () {
			if (this.$join) {
				this.$join.remove();
				this.$join = null;
			}

			var controlsShown = this.controlsShown;
			this.controlsShown = false;

			if (this.battle.playbackState === 5) {

				// battle is seeking
				this.$controls.html('');
				return;

			} else if (this.battle.playbackState === 2 || this.battle.playbackState === 3) {

				// battle is playing or paused
				if (this.side) {
					// is a player
					this.$controls.html('<p><button name="skipTurn">Skip turn <i class="fa fa-step-forward"></i></button><button name="goToEnd">Go to last turn <i class="fa fa-fast-forward"></i></button></p>');
				} else {
					this.$controls.html('<p><button name="switchSides"><i class="fa fa-random"></i> Switch sides</button> <button name="skipTurn">Skip turn <i class="fa fa-step-forward"></i></button> <button name="goToEnd">Go to last turn <i class="fa fa-fast-forward"></i></button></p>');
				}
				return;

			}

			if (this.battle.ended) {

				var replayDownloadButton = '<span style="float:right;"><a href="//replay.pokemonshowdown.com/" class="button replayDownloadButton" style="padding:2px 6px"><i class="fa fa-download"></i> Download replay</a><br /><br /><button name="saveReplay"><i class="fa fa-upload"></i> Upload and share replay</button></span>';

				// battle has ended
				if (this.side) {
					// was a player
					this.$controls.html('<div class="controls"><p>' + replayDownloadButton + '<em><button name="instantReplay"><i class="fa fa-undo"></i> Instant Replay</button></p><p><button name="closeAndMainMenu"><strong>Main menu</strong><br /><small>(closes this battle)</small></button> <button name="closeAndRematch"><strong>Rematch</strong><br /><small>(closes this battle)</small></button></p></div>');
				} else {
					this.$controls.html('<div class="controls"><p>' + replayDownloadButton + '<em><button name="switchSides"><i class="fa fa-random"></i> Switch sides</button> <button name="instantReplay"><i class="fa fa-undo"></i> Instant Replay</button></p></div>');
				}

			} else if (!this.battle.mySide.initialized || !this.battle.yourSide.initialized) {

				// empty battle

				if (this.side) {
					if (this.battle.kickingInactive) {
						this.$controls.html('<div class="controls"><p><button name="setTimer" value="off"><small>Stop timer</small></button> <small>&larr; Your opponent has disconnected. This will give them more time to reconnect.</small></p></div>');
					} else {
						this.$controls.html('<div class="controls"><p><button name="setTimer" value="on"><small>Claim victory</small></button> <small>&larr; Your opponent has disconnected. Click this if they don\'t reconnect.</small></p></div>');
					}
				} else {
					this.$controls.html('<p><em>Waiting for players...</em></p>');
					this.$join = $('<div class="playbutton"><button name="joinBattle">Join Battle</button></div>');
					this.$battle.append(this.$join);
				}

			} else if (this.side) {

				// player
				if (!this.request) {
					if (this.battle.kickingInactive) {
						this.$controls.html('<div class="controls"><p><button name="setTimer" value="off"><small>Stop timer</small></button> <small>&larr; Your opponent has disconnected. This will give them more time to reconnect.</small></p></div>');
					} else {
						this.$controls.html('<div class="controls"><p><button name="setTimer" value="on"><small>Claim victory</small></button> <small>&larr; Your opponent has disconnected. Click this if they don\'t reconnect.</small></p></div>');
					}
				} else {
					this.controlsShown = true;
					if (!controlsShown || typeof this.choice === 'undefined' || this.choice && this.choice.waiting) {
						// don't update controls (and, therefore, side) if `this.choice === null`: causes damage miscalculations
						this.updateControlsForPlayer();
					}
				}

			} else {

				// full battle
				this.$controls.html('<p><em><button name="switchSides"><i class="fa fa-random"></i> Switch sides</button> Waiting for players...</em></p>');

			}

			// This intentionally doesn't happen if the battle is still playing,
			// since those early-return.
			app.topbar.updateTabbar();
		},
		controlsShown: false,
		updateControlsForPlayer: function () {
			var battle = this.battle;

			this.callbackWaiting = true;
			var active = this.battle.mySide.active[0];
			if (!active) active = {};

			var act = '';
			var switchables = [];
			if (this.request) {
				// TODO: investigate when to do this
				this.updateSide(this.request.side);

				act = this.request.requestType;
				if (this.request.side) {
					switchables = this.myPokemon;
				}
				if (!this.finalDecision) this.finalDecision = !!this.request.noCancel;
			}

			var type = '';
			var moveTarget = '';
			if (this.choice) {
				type = this.choice.type;
				moveTarget = this.choice.moveTarget;
				if (this.choice.waiting) act = '';
			}
			// The choice object:
			// !this.choice = nothing has been chosen
			// this.choice.choices = array of choice strings
			// this.choice.switchFlags = dict of pokemon indexes that have a switch pending

			switch (act) {
			case 'move':
				if (!this.choice) {
					this.choice = {
						choices: [],
						switchFlags: {},
						switchOutFlags: {}
					};
					while (switchables[this.choice.choices.length] && switchables[this.choice.choices.length].fainted && this.choice.choices.length + 1 < this.battle.mySide.active.length) {
						this.choice.choices.push('pass');
					}
				}
				var pos = this.choice.choices.length - (type === 'movetarget' ? 1 : 0);

				// hp bar
				var hpbar = '';
				if (switchables[pos].hp * 5 / switchables[pos].maxhp < 1) {
					hpbar = '<small class="critical">';
				} else if (switchables[pos].hp * 2 / switchables[pos].maxhp < 1) {
					hpbar = '<small class="weak">';
				} else {
					hpbar = '<small class="healthy">';
				}
				hpbar += '' + switchables[pos].hp + '/' + switchables[pos].maxhp + '</small>';

				var active = this.request;
				if (active.active) active = active.active[pos];
				var moves = active.moves;
				var trapped = active.trapped;
				this.finalDecisionMove = active.maybeDisabled || false;
				this.finalDecisionSwitch = active.maybeTrapped || false;
				for (var i = pos + 1; i < this.battle.mySide.active.length; ++i) {
					var p = this.battle.mySide.active[i];
					if (p && !p.fainted) {
						this.finalDecisionMove = this.finalDecisionSwitch = false;
						break;
					}
				}

				var controls = '<div class="controls"><div class="whatdo">';
				if (type === 'move2' || type === 'movetarget') {
					controls += '<button name="clearChoice">Back</button> ';
				}

				// Target selector

				if (type === 'movetarget') {
					controls += 'At who? ' + hpbar + '</div>';
					controls += '<div class="switchmenu" style="display:block">';

					var myActive = this.battle.mySide.active;
					var yourActive = this.battle.yourSide.active;
					var yourSlot = yourActive.length - 1 - pos;
					for (var i = yourActive.length - 1; i >= 0; i--) {
						var pokemon = yourActive[i];

						var disabled = false;
						if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
							disabled = true;
						} else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
							if (Math.abs(yourSlot - i) > 1) disabled = true;
						}

						if (disabled) {
							controls += '<button disabled="disabled" style="visibility:hidden"></button> ';
						} else if (!pokemon || pokemon.zerohp) {
							controls += '<button class="disabled" name="chooseMoveTarget" value="' + (i + 1) + '"><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon('missingno') + '"></span></button> ';
						} else {
							controls += '<button name="chooseMoveTarget" value="' + (i + 1) + '"' + this.tooltipAttrs("your" + i, 'pokemon', true, true) + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') + '</button> ';
						}
					}
					controls += '<div style="clear:both"></div> </div><div class="switchmenu" style="display:block">';
					for (var i = 0; i < myActive.length; i++) {
						var pokemon = myActive[i];

						var disabled = false;
						if (moveTarget === 'adjacentFoe') {
							disabled = true;
						} else if (moveTarget === 'normal' || moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
							if (Math.abs(pos - i) > 1) disabled = true;
						}
						if (moveTarget !== 'adjacentAllyOrSelf' && pos == i) disabled = true;

						if (disabled) {
							controls += '<button disabled="disabled" style="visibility:hidden"></button> ';
						} else if (!pokemon || pokemon.zerohp) {
							controls += '<button class="disabled" name="chooseMoveTarget" value="' + (-(i + 1)) + '"><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon('missingno') + '"></span></button> ';
						} else {
							controls += '<button name="chooseMoveTarget" value="' + (-(i + 1)) + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') + '</button> ';
						}
					}
					controls += '</div>';
					controls += '</div>';
					this.$controls.html(controls);
					break;
				}

				// Move chooser

				controls += 'What will <strong>' + Tools.escapeHTML(switchables[pos].name) + '</strong> do? ' + hpbar + '</div>';
				var hasMoves = false;
				var hasDisabled = false;
				controls += '<div class="movecontrols"><div class="moveselect"><button name="selectMove">Attack</button></div><div class="movemenu">';
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
					var moveType = this.getMoveType(move, this.battle.mySide.active[pos]);
					if (moveData.disabled) {
						movebuttons += '<button disabled="disabled"' + this.tooltipAttrs(moveData.move, 'move') + '>';
						hasDisabled = true;
					} else {
						movebuttons += '<button class="type-' + moveType + '" name="chooseMove" value="' + (i + 1) + '" data-move="' + Tools.escapeHTML(moveData.move) + '" data-target="' + Tools.escapeHTML(moveData.target) + '"' + this.tooltipAttrs(moveData.move, 'move') + '>';
						hasMoves = true;
					}
					movebuttons += name + '<br /><small class="type">' + (moveType || "Unknown") + '</small> <small class="pp">' + pp + '</small>&nbsp;</button> ';
				}
				if (!hasMoves) {
					controls += '<button class="movebutton" name="chooseMove" value="0" data-move="Struggle" data-target="randomNormal">Struggle<br /><small class="type">Normal</small> <small class="pp">&ndash;</small>&nbsp;</button> ';
				} else {
					controls += movebuttons;
				}
				if (switchables[pos].canMegaEvo) {
					controls += '<br /><label class="megaevo"><input type="checkbox" name="megaevo" />&nbsp;Mega&nbsp;Evolution</label>';
				}
				if (this.finalDecisionMove) {
					controls += '<em style="display:block;clear:both">You <strong>might</strong> have some moves disabled, so you won\'t be able to cancel an attack!</em><br/>';
				}
				controls += '<div style="clear:left"></div>';
				controls += '</div></div>';
				if (this.battle.gameType === 'triples' && pos !== 1) {
					controls += '<div class="shiftselect"><button name="chooseShift">Shift</button></div>';
				}
				controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Switch</button></div><div class="switchmenu">';
				if (trapped) {
					controls += '<em>You are trapped and cannot switch!</em>';
				} else {
					controls += '';
					for (var i = 0; i < switchables.length; i++) {
						var pokemon = switchables[i];
						pokemon.name = pokemon.ident.substr(4);
						if (pokemon.zerohp || i < this.battle.mySide.active.length || this.choice.switchFlags[i]) {
							controls += '<button class="disabled" name="chooseDisabled" value="' + pokemon.name + (pokemon.zerohp ? ',fainted' : i < this.battle.mySide.active.length ? ',active' : '') + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp ? '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') : '') + '</button> ';
						} else {
							controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') + '</button> ';
						}
					}
					if (this.finalDecisionSwitch && this.battle.gen > 2) {
						controls += '<em style="display:block;clear:both">You <strong>might</strong> be trapped, so you won\'t be able to cancel a switch!</em><br/>';
					}
				}
				controls += '</div></div></div>';
				this.$controls.html(controls);
				break;

			case 'switch':
				if (!this.choice) {
					this.choice = {
						choices: [],
						switchFlags: {},
						switchOutFlags: {},
						freedomDegrees: 0,
						canSwitch: 0
					};
				}
				if (this.request.forceSwitch !== true) {
					var faintedLength = this.request.forceSwitch.filter(function (fainted) {return fainted;}).length;
					this.choice.freedomDegrees = faintedLength - switchables.slice(this.battle.mySide.active.length).filter(function (mon) {return !mon.zerohp;}).length;
					if (this.choice.freedomDegrees < 0) this.choice.freedomDegrees = 0;
					this.choice.canSwitch = faintedLength - this.choice.freedomDegrees;

					if (!this.choice.freedomDegrees) {
						while (!this.request.forceSwitch[this.choice.choices.length] && this.choice.choices.length < 6) this.choice.choices.push('pass');
					}
				}
				var pos = this.choice.choices.length;
				var controls = '<div class="controls"><div class="whatdo">';
				if (type === 'switch2' || type === 'switchposition') {
					controls += '<button name="clearChoice">Back</button> ';
				}
				// Place selector
				if (type === 'switchposition') {
					var pos = this.choice.choices.length - (type === 'movetarget' ? 1 : 0);

					// TODO? hpbar
					controls += 'Which Pokémon will it switch in for?</div>';
					controls += '<div class="switchmenu" style="display:block">';

					var myActive = this.battle.mySide.active;
					var pokemon;
					for (var i = 0; i < myActive.length; i++) {
						pokemon = this.myPokemon[i];

						if (pokemon && !pokemon.zerohp || this.choice.switchOutFlags[i]) {
							controls += '<button disabled' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp ? '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') : '') + '</button> ';
						} else if (!pokemon) {
							controls += '<button disabled></button> ';
						} else {
							controls += '<button name="chooseSwitchTarget" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') + '</button> ';
						}
					}
					controls += '</div>';
					controls += '</div>';
					this.$controls.html(controls);
					break;
				}
				if (this.choice.freedomDegrees >= 1) {
					controls += 'Choose a Pokémon to send to battle!</div>';
				} else {
					controls += 'Switch <strong>' + Tools.escapeHTML(switchables[pos].name) + '</strong> to:</div>';
				}
				controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Switch</button></div><div class="switchmenu">';
				for (var i = 0; i < switchables.length; i++) {
					var pokemon = switchables[i];
					if (pokemon.zerohp || i < this.battle.mySide.active.length || this.choice.switchFlags[i]) {
						controls += '<button class="disabled" name="chooseDisabled" value="' + pokemon.name + (pokemon.zerohp ? ',fainted' : i < this.battle.mySide.active.length ? ',active' : '') + '"' + this.tooltipAttrs(i, 'sidepokemon') + '>';
					} else {
						controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '>';
					}
					controls += '<span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp ? '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:' + (Math.round(pokemon.hp * 92 / pokemon.maxhp) || 1) + 'px"></span></span>' + (pokemon.status ? '<span class="status ' + pokemon.status + '"></span>' : '') : '') + '</button> ';
				}
				controls += '</div></div></div>';
				this.$controls.html(controls);
				this.selectSwitch();
				break;

			case 'team':
				var controls = '<div class="controls"><div class="whatdo">';
				if (!this.choice || !this.choice.done) {
					this.choice = {
						teamPreview: [1, 2, 3, 4, 5, 6].slice(0, switchables.length),
						done: 0,
						count: 0
					};
					if (this.battle.gameType === 'doubles') {
						this.choice.count = 2;
					}
					if (this.battle.gameType === 'triples' || this.battle.gameType === 'rotation') {
						this.choice.count = 3;
					}
					controls += 'How will you start the battle?</div>';
					controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Choose Lead</button></div><div class="switchmenu">';
					for (var i = 0; i < switchables.length; i++) {
						var pokemon = switchables[i];
						if (i >= 6) {
							break;
						}
						if (toId(pokemon.baseAbility) === 'illusion') {
							this.choice.count = 6;
						}
						controls += '<button name="chooseTeamPreview" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
					}
					if (this.battle.teamPreviewCount) this.choice.count = parseInt(this.battle.teamPreviewCount, 10);
					controls += '</div>';
				} else {
					controls += '<button name="clearChoice">Back</button> What about the rest of your team?</div>';
					controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Choose a Pokémon for slot ' + (this.choice.done + 1) + '</button></div><div class="switchmenu">';
					for (var i = 0; i < switchables.length; i++) {
						var pokemon = switchables[this.choice.teamPreview[i] - 1];
						if (i >= 6) {
							break;
						}
						if (i < this.choice.done) {
							controls += '<button disabled="disabled"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
						} else {
							controls += '<button name="chooseTeamPreview" value="' + i + '"' + this.tooltipAttrs(this.choice.teamPreview[i] - 1, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;' + Tools.getIcon(pokemon) + '"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
						}
					}
					controls += '</div>';
				}
				controls += '</div></div>';
				this.$controls.html(controls);
				this.selectSwitch();
				break;

			default:
				var buf = '<div class="controls"><p><em>Waiting for opponent...</em> ';
				if (this.choice && this.choice.waiting && !this.finalDecision) {
					buf += '<button name="undoChoice">Cancel</button>';
				}
				buf += '</p>';
				if (this.battle.kickingInactive) {
					buf += '<p class="timer"><button name="setTimer" value="off"><small>Stop timer</small></button></p>';
				} else {
					buf += '<p class="timer"><button name="setTimer" value="on"><small>Start timer</small></button></p>';
				}
				buf += '</div>';
				this.$controls.html(buf);
				break;
			}
		},
		// Same as send, but appends the rqid to the message so that the server
		// can verify that the decision is sent in response to the correct request.
		sendDecision: function (message) {
			this.send(message + '|' + this.request.rqid);
		},
		request: null,
		receiveRequest: function (request) {
			if (!request) {
				this.side = '';
				return;
			}
			request.requestType = 'move';
			var notifyObject = null;
			if (request.forceSwitch) {
				request.requestType = 'switch';
			} else if (request.teamPreview) {
				request.requestType = 'team';
			} else if (request.wait) {
				request.requestType = 'wait';
			}

			this.choice = null;
			this.finalDecision = this.finalDecisionMove = this.finalDecisionSwitch = false;
			this.request = request;
			if (request.side) {
				this.updateSideLocation(request.side, true);
			}
			this.notifyRequest();
			this.updateControls();
		},
		notifyRequest: function () {
			var oName = this.battle.yourSide.name;
			if (oName) oName = " against " + oName;
			switch (this.request.requestType) {
			case 'move':
				this.notify("Your move!", "Move in your battle" + oName, 'choice');
				break;
			case 'switch':
				this.notify("Your switch!", "Switch in your battle" + oName, 'choice');
				break;
			case 'team':
				this.notify("Team preview!", "Choose your team order in your battle" + oName, 'choice');
				break;
			}
		},
		updateSideLocation: function (sideData, midBattle) {
			if (!sideData.id) return;
			this.side = sideData.id;
			if (this.battle.sidesSwitched !== !!(this.side === 'p2')) {
				this.battle.switchSides(!midBattle);
				this.$chat = this.$chatFrame.find('.inner');
			}
		},
		updateSide: function (sideData) {
			this.myPokemon = sideData.pokemon;
			for (var i = 0; i < sideData.pokemon.length; i++) {
				var pokemonData = sideData.pokemon[i];
				this.battle.parseDetails(pokemonData.ident.substr(4), pokemonData.ident, pokemonData.details, pokemonData);
				this.battle.parseHealth(pokemonData.condition, pokemonData);
				pokemonData.hpDisplay = Pokemon.prototype.hpDisplay;
				pokemonData.getPixelRange = Pokemon.prototype.getPixelRange;
				pokemonData.getFormattedRange = Pokemon.prototype.getFormattedRange;
				pokemonData.getHPColorClass = Pokemon.prototype.getHPColorClass;
				pokemonData.getHPColor = Pokemon.prototype.getHPColor;
				pokemonData.getFullName = Pokemon.prototype.getFullName;
			}
		},

		// buttons
		joinBattle: function () {
			this.send('/joinbattle');
		},
		setTimer: function (setting) {
			this.send('/timer ' + setting);
		},
		toggleIgnoreSpects: function (e) {
			this.battle.ignoreSpects = !!e.currentTarget.checked;
			this.battle.add('Spectators ' + (this.battle.ignoreSpects ? '' : 'no longer ') + 'ignored.');
		},
		toggleIgnoreOpponent: function (e) {
			this.battle.ignoreOpponent = !!e.currentTarget.checked;
			this.battle.add('Opponent ' + (this.battle.ignoreOpponent ? '' : 'no longer ') + 'ignored.');
		},
		forfeit: function () {
			this.send('/forfeit');
		},
		saveReplay: function () {
			this.send('/savereplay');
		},
		clickReplayDownloadButton: function (e) {
			var filename = (this.battle.tier || 'Battle').replace(/[^A-Za-z0-9]/g, '');

			// ladies and gentlemen, JavaScript dates
			var date = new Date();
			filename += '-' + date.getFullYear();
			filename += (date.getMonth() >= 9 ? '-' : '-0') + (date.getMonth() + 1);
			filename += (date.getDate() >= 10 ? '-' : '-0') + date.getDate();

			filename += '-' + toId(this.battle.p1.name);
			filename += '-' + toId(this.battle.p2.name);

			e.currentTarget.href = Storage.createReplayFileHref(this);
			e.currentTarget.download = filename + '.html';

			e.stopPropagation();
		},
		switchSides: function () {
			this.battle.switchSides();
		},
		instantReplay: function () {
			this.hideTooltip();
			this.request = null;
			this.battle.reset();
			this.battle.play();
		},
		skipTurn: function () {
			this.battle.skipTurn();
		},
		goToEnd: function () {
			this.battle.fastForwardTo(-1);
		},
		register: function (userid) {
			var registered = app.user.get('registered');
			if (registered && registered.userid !== userid) registered = false;
			if (!registered && userid === app.user.get('userid')) {
				app.addPopup(RegisterPopup);
			}
		},
		closeAndMainMenu: function () {
			this.close();
			app.focusRoom('');
		},
		closeAndRematch: function () {
			app.rooms[''].requestNotifications();
			app.rooms[''].challenge(this.battle.yourSide.name, this.battle.tier);
			this.close();
			app.focusRoom('');
		},

		// choice buttons
		chooseMove: function (pos, e) {
			var myActive = this.battle.mySide.active;
			this.hideTooltip();
			var isMega = !!(this.$('input[name=megaevo]')[0] || '').checked;
			if (pos !== undefined) {
				var move = e.getAttribute('data-move');
				var target = e.getAttribute('data-target');
				var choosableTargets = {normal: 1, any: 1, adjacentAlly: 1, adjacentAllyOrSelf: 1, adjacentFoe: 1};
				this.choice.choices.push('move ' + pos + (isMega ? ' mega' : ''));
				if (myActive.length > 1 && target in choosableTargets) {
					this.choice.type = 'movetarget';
					this.choice.moveTarget = target;
					this.updateControlsForPlayer();
					return false;
				}
			}
			while (myActive.length > this.choice.choices.length && !myActive[this.choice.choices.length]) {
				this.choice.choices.push('pass');
			}
			if (myActive.length > this.choice.choices.length) {
				this.choice.type = 'move2';
				this.updateControlsForPlayer();
				return false;
			}

			this.sendDecision('/choose ' + this.choice.choices.join(','));
			this.closeNotification('choice');

			if (!this.finalDecision) this.finalDecision = !!this.finalDecisionMove;
			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseMoveTarget: function (posString) {
			this.choice.choices[this.choice.choices.length - 1] += ' ' + posString;
			this.chooseMove();
		},
		chooseShift: function () {
			var myActive = this.battle.mySide.active;
			this.hideTooltip();
			this.choice.choices.push('shift');

			while (myActive.length > this.choice.choices.length && !myActive[this.choice.choices.length]) {
				this.choice.choices.push('pass');
			}
			if (myActive.length > this.choice.choices.length) {
				this.choice.type = 'move2';
				this.updateControlsForPlayer();
				return false;
			}

			this.sendDecision('/choose ' + this.choice.choices.join(','));
			this.closeNotification('choice');

			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseSwitch: function (pos) {
			this.hideTooltip();
			if (pos !== undefined) {
				this.choice.switchFlags[pos] = true;
				// Just chose the current position of the pokemon that will switch in.
				if (this.choice.freedomDegrees >= 1) {
					this.choice.type = 'switchposition';
					this.updateControlsForPlayer();
					return false;
				}
				// Default: left to right.
				this.choice.switchOutFlags[this.choice.choices.length] = true;
				this.choice.choices.push('switch ' + (parseInt(pos, 10) + 1));
				if (this.request && this.request.requestType === 'move' && this.battle.mySide.active.length > this.choice.choices.length) {
					this.choice.type = 'move2';
					this.updateControlsForPlayer();
					return false;
				}
				if (this.request && this.request.requestType === 'switch') {
					if (this.request.forceSwitch !== true) {
						while (this.battle.mySide.active.length > this.choice.choices.length && !this.request.forceSwitch[this.choice.choices.length]) this.choice.choices.push('pass');
					}
					if (this.battle.mySide.active.length > this.choice.choices.length) {
						this.choice.type = 'switch2';
						this.updateControlsForPlayer();
						return false;
					}
				}
				this.sendDecision('/choose ' + this.choice.choices.join(','));
				this.closeNotification('choice');

				if (!this.finalDecision) this.finalDecision = !!this.finalDecisionSwitch;
				this.choice = {waiting: true};
				this.updateControlsForPlayer();
				return false;
			}
			// After choosing the position to which a pokemon will switch in (Triples).
			if (!this.request || this.request.requestType !== 'switch') return false; //??
			if (this.choice.canSwitch > this.choice.choices.filter(function (choice) {return choice;}).length) {
				// More switches are pending.
				this.choice.type = 'switch2';
				this.updateControlsForPlayer();
				return false;
			}
			for (var i = 0; i < this.battle.mySide.active.length; i++) {
				if (!this.choice.choices[i]) this.choice.choices[i] = 'pass';
			}

			this.sendDecision('/choose ' + this.choice.choices.join(','));
			this.closeNotification('choice');

			if (!this.finalDecision) this.finalDecision = !!this.finalDecisionSwitch;
			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseSwitchTarget: function (posString) {
			var indexSwitchIn = -1;
			for (var i in this.choice.switchFlags) {
				if (this.choice.choices.indexOf('switch ' + (parseInt(i, 10) + 1)) === -1) {
					indexSwitchIn = i;
					break;
				}
			}
			this.choice.choices[posString] = 'switch ' + (parseInt(indexSwitchIn, 10) + 1);
			this.choice.switchOutFlags[posString] = true;
			this.chooseSwitch();
		},
		chooseTeamPreview: function (pos) {
			pos = parseInt(pos, 10);
			this.hideTooltip();
			if (this.choice.count) {
				var temp = this.choice.teamPreview[pos];
				this.choice.teamPreview[pos] = this.choice.teamPreview[this.choice.done];
				this.choice.teamPreview[this.choice.done] = temp;

				this.choice.done++;

				if (this.choice.done < Math.min(this.choice.teamPreview.length, this.choice.count)) {
					this.choice.type = 'team2';
					this.updateControlsForPlayer();
					return false;
				}
				pos = this.choice.teamPreview.join('');
			} else {
				pos = pos + 1;
			}

			this.sendDecision('/team ' + (pos));
			this.closeNotification('choice');

			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseDisabled: function (data) {
			this.hideTooltip();
			data = data.split(',');
			if (data[1] === 'fainted') {
				app.addPopupMessage(data[0] + " has no energy left to battle!");
			} else if (data[1] === 'active') {
				app.addPopupMessage(data[0] + " is already in battle!");
			} else {
				app.addPopupMessage(data[0] + " is already selected!");
			}
		},
		undoChoice: function (pos) {
			this.send('/undo');
			this.notifyRequest();

			this.choice = null;
			this.updateControlsForPlayer();
		},
		clearChoice: function () {
			this.choice = null;
			this.updateControlsForPlayer();
		},
		leaveBattle: function () {
			this.hideTooltip();
			this.send('/leavebattle');
			this.side = '';
			this.closeNotification('choice');
		},
		selectSwitch: function () {
			this.hideTooltip();
			this.$controls.find('.controls').attr('class', 'controls switch-controls');
		},
		selectMove: function () {
			this.hideTooltip();
			this.$controls.find('.controls').attr('class', 'controls move-controls');
		},

		// tooltips
		tooltipAttrs: function (thing, type, ownHeight, isActive) {
			return ' onmouseover="room.showTooltip(\'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ', ' + (isActive ? 'true' : 'false') + ')" ontouchstart="room.showTooltip(\'' + Tools.escapeHTML('' + thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ', ' + (isActive ? 'true' : 'false') + ')" onmouseout="room.hideTooltip()" onmouseup="room.hideTooltip()"';
		},
		showTooltip: function (thing, type, elem, ownHeight, isActive) {
			var offset = {
				left: 150,
				top: 500
			};
			if (elem) offset = $(elem).offset();
			var x = offset.left - 2;
			if (elem) {
				if (ownHeight) offset = $(elem).offset();
				else offset = $(elem).parent().offset();
			}
			var y = offset.top - 5;

			if (x > this.leftWidth + 335) x = this.leftWidth + 335;
			if (y < 140) y = 140;
			if (x > $(window).width() - 303) x = Math.max($(window).width() - 303, 0);
			if (!$('#tooltipwrapper').length) $(document.body).append('<div id="tooltipwrapper" onclick="$(\'#tooltipwrapper\').html(\'\');"></div>');
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
				var basePowerText = '';
				var additionalInfo = '';
				var yourActive = this.battle.yourSide.active;
				var pokemon = this.battle.mySide.active[this.choice.choices.length];

				// Check if there are more than one active Pokémon to check for multiple possible BPs.
				if (yourActive.length > 1) {
					// We check if there is a difference in base powers to note it.
					// Otherwise, it is just shown as in singles.
					// The trick is that we need to calculate it first for each Pokémon to see if it changes.
					var previousBasepower = false;
					var difference = false;
					var basePowers = [];
					for (var i = 0; i < yourActive.length; i++) {
						if (!yourActive[i]) continue;
						basePower = this.getMoveBasePower(move, pokemon, yourActive[i]);
						if (previousBasepower === false) previousBasepower = basePower;
						if (previousBasepower !== basePower) difference = true;
						if (!basePower) basePower = '&mdash;';
						basePowers.push('Base power for ' + yourActive[i].name + ': ' + basePower);
					}
					if (difference) {
						basePowerText = '<p>' + basePowers.join('<br />') + '</p>';
					}
					// Falls through to not to repeat code on showing the base power.
				}
				if (!basePowerText) {
					var activeTarget = yourActive[0] || yourActive[1] || yourActive[2];
					basePower = this.getMoveBasePower(move, pokemon, activeTarget) || basePower;
					if (!basePower) basePower = '&mdash;';
					basePowerText = '<p>Base power: ' + basePower + '</p>';
				}
				var accuracy = move.accuracy;
				if (!accuracy || accuracy === true) accuracy = '&mdash;';
				else accuracy = '' + accuracy + '%';

				// Handle move type for moves that vary their type.
				var moveType = this.getMoveType(move, pokemon);

				// Deal with Nature Power special case, indicating which move it calls.
				if (move.id === 'naturepower') {
					if (this.battle.gen === 6) {
						additionalInfo = 'Calls ';
						if (this.battle.hasPseudoWeather('Electric Terrain')) {
							additionalInfo += Tools.getTypeIcon('Electric') + ' Thunderbolt';
						} else if (this.battle.hasPseudoWeather('Grassy Terrain')) {
							additionalInfo += Tools.getTypeIcon('Grass') + ' Energy Ball';
						} else if (this.battle.hasPseudoWeather('Misty Terrain')) {
							additionalInfo += Tools.getTypeIcon('Fairy') + ' Moonblast';
						} else {
							additionalInfo += Tools.getTypeIcon('Normal') + ' Tri Attack';
						}
					} else if (this.battle.gen > 3) {
						// In gens 4 and 5 it calls Earthquake.
						additionalInfo = 'Calls ' + Tools.getTypeIcon('Ground') + ' Earthquake';
					} else {
						// In gen 3 it calls Swift, so it retains its normal typing.
						additionalInfo = 'Calls ' + Tools.getTypeIcon('Normal') + ' Swift';
					}
				}

				text = '<div class="tooltipinner"><div class="tooltip">';
				text += '<h2>' + move.name + '<br />' + Tools.getTypeIcon(moveType) + ' <img src="' + Tools.resourcePrefix;
				text += 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" /></h2>';
				text += basePowerText;
				text += '<p>' + additionalInfo + '</p>';
				text += '<p>Accuracy: ' + accuracy + '</p>';
				var flags = {
					"authentic": "Ignores a target's substitute.",
					"bite": "Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw.",
					"bullet": "Has no effect on Pokemon with the Ability Bulletproof.",
					"charge": "The user is unable to make a move between turns.",
					"contact": "Makes contact.",
					"defrost": "Thaws the user if executed successfully while the user is frozen.",
					"distance": "Can target a Pokemon positioned anywhere in a Triple Battle.",
					"gravity": "Prevented from being executed or selected during Gravity's effect.",
					"heal": "Prevented from being executed or selected during Heal Block's effect.",
					"mirror": "Can be copied by Mirror Move.",
					"nonsky": "Prevented from being executed or selected in a Sky Battle.",
					"powder": "Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles.",
					"protect": "Blocked by Detect, Protect, ",
					"pulse": "Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher.",
					"punch": "Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist.",
					"recharge": "If this move is successful, the user must recharge on the following turn and cannot make a move.",
					"reflectable": "Bounced back to the original user by Magic Coat or the Ability Magic Bounce.",
					"snatch": "Can be stolen from the original user and instead used by another Pokemon using Snatch.",
					"sound": "Has no effect on Pokemon with the Ability Soundproof."
				};
				if (move.desc) {
					text += '<p class="section">' + move.desc;
					for (var i in move.flags) {
						if (i === 'distance' && move.target !== 'any') continue;
						text += " " + flags[i];
						if (i === 'protect') {
							if (move.category !== 'Status') text += "King's Shield, ";
							text += "and Spiky Shield.";
						}
					}
					var priority = move.priority;
					if (priority) {
						text += " Priority ";
						if (priority > 0) text += " + ";
						text += priority + ".";
					}
					text += '</p>';
				}
				text += '</div></div>';
				break;

			case 'pokemon':
				var side = this.battle[thing.slice(0, -1) + "Side"];
				var pokemon = side.active[thing.slice(-1)];
				if (!pokemon) return;
				/* falls through */
			case 'sidepokemon':
				var battlePokemon;
				var myPokemon;
				if (this.myPokemon) {
					if (!pokemon) {
						pokemon = this.myPokemon[parseInt(thing, 10)];
						battlePokemon = this.battle.getPokemon('other: old: ' + pokemon.ident, pokemon.details);
					} else if (this.controlsShown && pokemon.side === this.battle.mySide) {
						myPokemon = this.myPokemon[pokemon.slot];
					}
				}
				var gender = '';
				if (pokemon.gender === 'F') gender = ' <small style="color:#C57575">&#9792;</small>';
				if (pokemon.gender === 'M') gender = ' <small style="color:#7575C0">&#9794;</small>';
				text = '<div class="tooltipinner"><div class="tooltip">';
				text += '<h2>' + pokemon.getFullName() + gender + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';

				var template = pokemon;
				if (!pokemon.types) template = Tools.getTemplate(pokemon.species);
				if (pokemon.volatiles && pokemon.volatiles.transform && pokemon.volatiles.formechange) {
					template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
					text += '<small>(Transformed into ' + pokemon.volatiles.formechange[2] + ')</small><br />';
				} else if (pokemon.volatiles && pokemon.volatiles.formechange) {
					template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
					text += '<small>(Forme: ' + pokemon.volatiles.formechange[2] + ')</small><br />';
				}
				var types = template.types;
				var isTypeChanged = false;
				if (pokemon.volatiles && pokemon.volatiles.typechange) {
					isTypeChanged = true;
					types = pokemon.volatiles.typechange[2].split('/');
				}
				if (pokemon.volatiles && pokemon.volatiles.typeadd) {
					isTypeChanged = true;
					if (types && types.indexOf(pokemon.volatiles.typeadd[2]) === -1) {
						types = types.concat(pokemon.volatiles.typeadd[2]);
					}
				}
				if (isTypeChanged) text += '<small>(Type changed)</small><br />';
				if (types) {
					text += types.map(Tools.getTypeIcon).join(' ');
				} else {
					text += 'Types unknown';
				}
				text += '</h2>';
				if (pokemon.fainted) {
					text += '<p>HP: (fainted)</p>';
				} else {
					var exacthp = '';
					if (pokemon.maxhp != 100 && pokemon.maxhp != 1000 && pokemon.maxhp != 48) exacthp = ' (' + pokemon.hp + '/' + pokemon.maxhp + ')';
					if (pokemon.maxhp == 48 && isActive) exacthp = ' <small>(' + pokemon.hp + '/' + pokemon.maxhp + ' pixels)</small>';
					text += '<p>HP: ' + pokemon.hpDisplay() + exacthp + (pokemon.status ? ' <span class="status ' + pokemon.status + '">' + pokemon.status.toUpperCase() + '</span>' : '') + '</p>';
				}
				if (myPokemon) {
					if (this.battle.gen > 2) {
						text += '<p>Ability: ' + Tools.getAbility(myPokemon.baseAbility).name;
						if (myPokemon.item) {
							text += ' / Item: ' + Tools.getItem(myPokemon.item).name;
						}
						text += '</p>';
					} else if (myPokemon.item) {
						text += '<p>Item: ' + Tools.getItem(myPokemon.item).name + '</p>';
					}
					text += '<p>' + myPokemon.stats['atk'] + '&nbsp;Atk /&nbsp;' + myPokemon.stats['def'] + '&nbsp;Def /&nbsp;' + myPokemon.stats['spa'];
					if (this.battle.gen === 1) {
						text += '&nbsp;Spc /&nbsp;';
					} else {
						text += '&nbsp;SpA /&nbsp;' + myPokemon.stats['spd'] + '&nbsp;SpD /&nbsp;';
					}
					text += myPokemon.stats['spe'] + '&nbsp;Spe</p>';
					text += '<p class="section">Opponent sees:</p>';
				}
				if (this.battle.gen > 2) {
					if (!pokemon.baseAbility && !pokemon.ability) {
						if (template.abilities) {
							text += '<p>Possible abilities: ' + Tools.getAbility(template.abilities['0']).name;
							if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
							if (this.battle.gen > 4 && template.abilities['H']) text += ', ' + Tools.getAbility(template.abilities['H']).name;
							text += '</p>';
						}
					} else if (pokemon.ability) {
						text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
					} else if (pokemon.baseAbility) {
						text += '<p>Ability: ' + Tools.getAbility(pokemon.baseAbility).name + '</p>';
					}
				}
				var item = '';
				var itemEffect = pokemon.itemEffect || '';
				if (pokemon.prevItem) {
					item = 'None';
					if (itemEffect) itemEffect += '; ';
					var prevItem = Tools.getItem(pokemon.prevItem).name;
					itemEffect += pokemon.prevItemEffect ? prevItem + ' was ' + pokemon.prevItemEffect : 'was ' + prevItem;
				}
				if (pokemon.item) item = Tools.getItem(pokemon.item).name;
				if (itemEffect) itemEffect = ' (' + itemEffect + ')';
				if (item) text += '<p>Item: ' + item + itemEffect + '</p>';
				if (pokemon.stats) {
					text += '<p>' + pokemon.stats['atk'] + '&nbsp;Atk /&nbsp;' + pokemon.stats['def'] + '&nbsp;Def /&nbsp;' + pokemon.stats['spa'];
					if (this.battle.gen === 1) {
						text += '&nbsp;Spc /&nbsp;';
					} else {
						text += '&nbsp;SpA /&nbsp;' + pokemon.stats['spd'] + '&nbsp;SpD /&nbsp;';
					}
					text += pokemon.stats['spe'] + '&nbsp;Spe</p>';
				} else if (template.baseStats) {
					text += '<p>' + this.getTemplateMinSpeed(template, pokemon.level) + ' to ' + this.getTemplateMaxSpeed(template, pokemon.level) + ' Spe (before items/abilities/modifiers)</p>';
				}
				if (pokemon.moves && pokemon.moves.length && (!isActive || isActive === 'foe')) {
					text += '<p class="section">';
					for (var i = 0; i < pokemon.moves.length; i++) {
						var move = Tools.getMove(pokemon.moves[i]);
						var name = move.name;
						var pp = 0, maxpp = 0;
						if (battlePokemon) {
							for (var j = 0; j < battlePokemon.moveTrack.length; j++) {
								if (name === battlePokemon.moveTrack[j][0]) {
									maxpp = Math.floor(move.pp * 8 / 5);
									pp = maxpp - battlePokemon.moveTrack[j][1];
									break;
								}
							}
						}
						text += '&#8901; ' + name + (maxpp ? ' <small>(' + pp + '/' + maxpp + ')</small>' : '') + '<br />';
					}
					text += '</p>';
				} else if (pokemon.moveTrack && pokemon.moveTrack.length) {
					text += '<p class="section">';
					for (var i = 0; i < pokemon.moveTrack.length; i++) {
						var moveName = pokemon.moveTrack[i][0];
						var move, maxpp;
						if (moveName.charAt(0) === '*') {
							moveName = moveName.substr(1);
							move = Tools.getMove(moveName);
							maxpp = 5;
						} else {
							move = Tools.getMove(moveName);
							maxpp = Math.floor(move.pp * 8 / 5);
						}
						var pp = maxpp - pokemon.moveTrack[i][1];
						text += '&#8901; ' + move.name + ' <small>(' + pp + '/' + maxpp + ')</small><br />';
					}
					text += '</p>';
				}
				text += '</div></div>';
				break;
			}
			$('#tooltipwrapper').html(text).appendTo(document.body);
			if (elem) {
				var height = $('#tooltipwrapper .tooltip').height();
				if (height > y) {
					y += height + 10;
					if (ownHeight) y += $(elem).height();
					else y += $(elem).parent().height();
					$('#tooltipwrapper').css('top', y);
				}
			}
		},
		hideTooltip: function () {
			$('#tooltipwrapper').html('');
		},
		// Functions to calculate speed ranges of an opponent.
		getTemplateMinSpeed: function (template, level) {
			var nature = (this.battle.tier === 'Random Battle' || this.battle.gen < 3) ? 1 : 0.9;
			return Math.floor(Math.floor(2 * template.baseStats['spe'] * level / 100 + 5) * nature);
		},
		getTemplateMaxSpeed: function (template, level) {
			var iv = (this.battle.gen < 3) ? 30 : 31;
			var value = iv + (this.battle.tier === 'Random Battle' ? 21 : 63);
			var nature = (this.battle.tier === 'Random Battle' || this.battle.gen < 3) ? 1 : 1.1;
			return Math.floor(Math.floor(Math.floor(2 * template.baseStats['spe'] + value) * level / 100 + 5) * nature);
		},
		// Gets the proper current type for moves with a variable type.
		getMoveType: function (move, pokemon) {
			var myPokemon = this.myPokemon[pokemon.slot];
			var ability = Tools.getAbility(myPokemon.baseAbility).name;
			var moveType = move.type;
			// Normalize is the first move type changing effect.
			if (ability === 'Normalize') {
				moveType = 'Normal';
			}
			// Moves that require an item to change their type.
			if (!this.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
				if (move.id === 'judgment') {
					var item = Tools.getItem(myPokemon.item);
					if (item.onPlate) moveType = item.onPlate;
				}
				if (move.id === 'technoblast') {
					var item = Tools.getItem(myPokemon.item);
					if (item.onDrive) moveType = item.onDrive;
				}
				if (move.id === 'naturalgift') {
					var item = Tools.getItem(myPokemon.item);
					if (item.naturalGift) moveType = item.naturalGift.type;
				}
			}
			// Weather and pseudo-weather type changes.
			if (move.id === 'weatherball' && this.battle.weather) {
				// Check if you have an anti weather ability to skip this.
				var noWeatherAbility = !!(ability in {'Air Lock': 1, 'Cloud Nine': 1});
				// If you don't, check if the opponent has it afterwards.
				if (!noWeatherAbility) {
					for (var i = 0; i < this.battle.yourSide.active.length; i++) {
						if (this.battle.yourSide.active[i] && this.battle.yourSide.active[i].ability in {'Air Lock': 1, 'Cloud Nine': 1}) {
							noWeatherAbility = true;
							break;
						}
					}
				}

				// If the weather is indeed active, check it to see what move type weatherball gets.
				if (!noWeatherAbility) {
					if (this.battle.weather === 'sunnyday' || this.battle.weather === 'desolateland') moveType = 'Fire';
					if (this.battle.weather === 'raindance' || this.battle.weather === 'primordialsea') moveType = 'Water';
					if (this.battle.weather === 'sandstorm') moveType = 'Rock';
					if (this.battle.weather === 'hail') moveType = 'Ice';
				}
			}
			// Other abilities that change the move type.
			if (moveType === 'Normal' && move.category && move.category !== 'Status' && !(move.id in {'naturalgift': 1, 'struggle': 1})) {
				if (ability === 'Aerilate') moveType = 'Flying';
				if (ability === 'Pixilate') moveType = 'Fairy';
				if (ability === 'Refrigerate') moveType = 'Ice';
			}
			return moveType;
		},
		// Gets the proper current base power for moves which have a variable base power.
		// Takes into account the target for some moves.
		// If it is unsure of the actual base power, it gives an estimate.
		getMoveBasePower: function (move, pokemon, target) {
			var myPokemon = this.myPokemon[pokemon.slot];
			var ability = Tools.getAbility(myPokemon.baseAbility).name;
			var basePower = move.basePower;
			var basePowerComment = '';
			var thereIsWeather = (this.battle.weather in {'sunnyday': 1, 'desolateland': 1, 'raindance': 1, 'primordialsea': 1, 'sandstorm': 1, 'hail':1});
			if (move.id === 'acrobatics') {
				if (!myPokemon.item) {
					basePower *= 2;
					basePowerComment = ' (Boosted by lack of item)';
				}
			}
			if (move.id === 'crushgrip' || move.id === 'wringout') {
				basePower = Math.floor(Math.floor((120 * (100 * Math.floor(target.hp * 4096 / target.maxhp)) + 2048 - 1) / 4096) / 100) || 1;
				basePowerComment = ' (Approximation)';
			}
			if (move.id === 'eruption' || move.id === 'waterspout') {
				basePower = Math.floor(150 * pokemon.hp / pokemon.maxhp) || 1;
			}
			if (move.id === 'flail' || move.id === 'reversal') {
				if (this.battle.gen > 4) {
					var multiplier = 48;
					var ratios = [2, 5, 10, 17, 33];
				} else {
					var multiplier = 64;
					var ratios = [2, 6, 13, 22, 43];
				}
				var ratio = pokemon.hp * multiplier / pokemon.maxhp;
				if (ratio < ratios[0]) basePower = 200;
				else if (ratio < ratios[1]) basePower = 150;
				else if (ratio < ratios[2]) basePower = 100;
				else if (ratio < ratios[3]) basePower = 80;
				else if (ratio < ratios[4]) basePower = 40;
				else basePower = 20;
			}
			if (move.id === 'hex' && target.status) {
				basePower *= 2;
				basePowerComment = ' (Boosted by status)';
			}
			if (move.id === 'punishment') {
				var boosts = Object.keys(target.boosts);
				var multiply = 0;
				for (var i = 0; i < boosts.length; i++) {
					if (target.boosts[boosts[i]] > 0) multiply += target.boosts[boosts[i]];
				}
				basePower = 60 + 20 * multiply;
				if (basePower > 200) basePower = 200;
			}
			if (move.id === 'smellingsalts') {
				if (target.status === 'par') {
					basePower *= 2;
					basePowerComment = ' (Boosted by status)';
				}
			}
			if (move.id === 'storedpower') {
				var boosts = Object.keys(pokemon.boosts);
				var multiply = 0;
				for (var i = 0; i < boosts.length; i++) {
					if (pokemon.boosts[boosts[i]] > 0) multiply += pokemon.boosts[boosts[i]];
				}
				basePower = 20 + 20 * multiply;
			}
			if (move.id === 'trumpcard') {
				basePower = 40;
				if (move.pp === 1) basePower = 200;
				else if (move.pp === 2) basePower = 80;
				else if (move.pp === 3) basePower = 60;
				else if (move.pp === 4) basePower = 50;
			}
			if (move.id === 'venoshock') {
				if (target.status === 'psn' || target.status === 'tox') {
					basePower *= 2;
					basePowerComment = ' (Boosted by status)';
				}
			}
			if (move.id === 'wakeupslap') {
				if (target.status === 'slp') {
					basePower *= 2;
					basePowerComment = ' (Boosted by status)';
				}
			}
			if (move.id === 'weatherball' && thereIsWeather) {
				basePower = 100;
			}
			// Moves that check opponent speed.
			if (move.id === 'electroball') {
				var template = target;
				var min = 0;
				var max = 0;
				if (target.volatiles && target.volatiles.formechange) template = Tools.getTemplate(target.volatiles.formechange[2]);
				var minRatio = (myPokemon.stats['spe'] / this.getTemplateMinSpeed(template, target.level));
				var maxRatio = (myPokemon.stats['spe'] / this.getTemplateMaxSpeed(template, target.level));
				if (minRatio >= 4) min = 150;
				else if (minRatio >= 3) min = 120;
				else if (minRatio >= 2) min = 80;
				else if (minRatio >= 1) min = 60;
				else min = 40;
				if (maxRatio >= 4) max = 150;
				else if (maxRatio >= 3) max = 120;
				else if (maxRatio >= 2) max = 80;
				else if (maxRatio >= 1) max = 60;
				else max = 40;
				// Special case due to being a range. Other moves are checked by technician below.
				basePower = 0;
				if (ability === 'Technician') {
					if (min <= 60) min *= 1.5;
					if (max <= 60) max *= 1.5;
					basePowerComment = '' + ((min === max) ? max : min + ' to ' + max) + ' (Technician boosted)';
				} else {
					basePowerComment = (min === max) ? max : min + ' to ' + max;
				}
			}
			if (move.id === 'gyroball') {
				var template = target;
				if (target.volatiles && target.volatiles.formechange) template = Tools.getTemplate(target.volatiles.formechange[2]);
				var min = (Math.floor(25 * this.getTemplateMinSpeed(template, target.level) / myPokemon.stats['spe']) || 1);
				var max = (Math.floor(25 * this.getTemplateMaxSpeed(template, target.level) / myPokemon.stats['spe']) || 1);
				if (min > 150) min = 150;
				if (max > 150) max = 150;
				// Special case due to range as well.
				basePower = 0;
				if (ability === 'Technician') {
					if (min <= 60) min *= 1.5;
					if (max <= 60) max = Math.max(max * 1.5, 90);
					basePowerComment = '' + ((min === max) ? max : min + ' to ' + max) + ' (Technician boosted)';
				} else {
					basePowerComment = (min === max) ? max : min + ' to ' + max;
				}
			}
			// Movements which have base power changed due to items.
			if (myPokemon.item && !this.battle.hasPseudoWeather('Magic Room') && (!pokemon.volatiles || !pokemon.volatiles['embargo'])) {
				if (move.id === 'fling') {
					var item = Tools.getItem(myPokemon.item);
					if (item.fling) basePower = item.fling.basePower;
				}
				if (move.id === 'naturalgift') {
					var item = Tools.getItem(myPokemon.item);
					if (item.naturalGift) basePower = item.naturalGift.basePower;
				}
			}
			// Movements which have base power changed according to weight.
			if (target && target.weightkg) {
				var targetWeight = target.weightkg;
				var pokemonWeight = pokemon.weightkg;
				// Autotomize cannot be really known on client, so we calculate it's one charge.
				if (target.volatiles && target.volatiles.autotomize) targetWeight -= 100;
				if (targetWeight < 0.1) targetWeight = 0.1;
				if (move.id === 'lowkick' || move.id === 'grassknot') {
					basePower = 20;
					if (targetWeight >= 200) basePower = 120;
					else if (targetWeight >= 100) basePower = 100;
					else if (targetWeight >= 50) basePower = 80;
					else if (targetWeight >= 25) basePower = 60;
					else if (targetWeight >= 10) basePower = 40;
					if (target.volatiles && target.volatiles.autotomize) basePowerComment = ' (Approximation)';
				}
				if (move.id === 'heavyslam' || move.id === 'heatcrash') {
					basePower = 40;
					if (pokemonWeight > targetWeight * 5) basePower = 120;
					else if (pokemonWeight > targetWeight * 4) basePower = 100;
					else if (pokemonWeight > targetWeight * 3) basePower = 80;
					else if (pokemonWeight > targetWeight * 2) basePower = 60;
					if (target.volatiles && target.volatiles.autotomize) basePowerComment = ' (Approximation)';
				}
			}
			if (!basePower) return basePowerComment;

			// Other ability boosts.
			if (ability === 'Technician' && basePower <= 60) {
				basePower *= 1.5;
				basePowerComment = ' (Technician boosted)';
			}
			if (move.type === 'Normal' && move.category !== 'Status' && !(move.id in {'naturalgift': 1, 'struggle': 1}) && (!thereIsWeather || thereIsWeather && move.id !== 'weatherball')) {
				if (ability in {'Aerilate': 1, 'Pixilate': 1, 'Refrigerate': 1}) {
					basePower = Math.floor(basePower * 1.3);
					basePowerComment = ' (' + ability + ' boosted)';
				}
			}
			return basePower + basePowerComment;
		}
	});

	var ForfeitPopup = this.ForfeitPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			this.room = data.room;
			var buf = '<form><p>Forfeiting makes you lose the battle. Are you sure?</p><p><label><input type="checkbox" name="closeroom" checked /> Close after forfeiting</label></p>';
			if (this.room.battle && this.room.battle.rated) {
				buf += '<p><button type="submit"><strong>Forfeit</strong></button> <button name="close" class="autofocus">Cancel</button></p></form>';
			} else {
				buf += '<p><button type="submit"><strong>Forfeit</strong></button> <button name="replacePlayer">Replace player</button> <button name="close" class="autofocus">Cancel</button></p></form>';
			}
			this.$el.html(buf);
		},
		replacePlayer: function (data) {
			var room = this.room;
			var self = this;
			app.addPopupPrompt("Replacement player's username", "Replace player", function (target) {
				if (!target) return;
				room.send('/addplayer ' + target);
				room.leaveBattle();
				self.close();
			});
		},
		submit: function (data) {
			this.room.send('/forfeit');
			this.room.battle.forfeitPending = true;
			if (this.$('input[name=closeroom]')[0].checked) {
				app.removeRoom(this.room.id);
			}
			this.close();
		}
	});

}).call(this, jQuery);
