(function($) {

	var BattleRoom = this.BattleRoom = ConsoleRoom.extend({
		type: 'battle',
		title: '',
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

			BattleSound.setMute(Tools.prefs('mute'));
			this.battle = new Battle(this.$battle, this.$chatFrame);

			this.$chat = this.$chatFrame.find('.inner');

			this.battle.customCallback = _.bind(this.updateControls, this);
			this.battle.endCallback = _.bind(this.updateControls, this);
			this.battle.startCallback = _.bind(this.updateControls, this);
			this.battle.stagnateCallback = _.bind(this.updateControls, this);

			this.battle.play();
		},
		battleEnded: false,
		join: function() {
			app.send('/join '+this.id);
		},
		leave: function() {
			app.send('/leave '+this.id);
			if (this.battle) this.battle.dealloc();
		},
		requestLeave: function() {
			if (this.side && this.battle && this.battle.rated && !this.battle.done) {
				app.addPopup(ForfeitPopup, {room: this});
				return false;
			}
			return true;
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
		focus: function() {
			if (this.battle.playbackState === 3) this.battle.play();
			ConsoleRoom.prototype.focus.call(this);
		},
		blur: function() {
			this.battle.pause();
		},
		init: function(data) {
			var log = data.split('\n');
			if (data.substr(0,6) === '|init|') log.shift();
			if (log.length && log[0].substr(0, 7) === '|title|') {
				this.title = log[0].substr(7);
				log.shift();
			}
			if (this.battle.activityQueue.length) return;
			this.battle.activityQueue = log;
			this.battle.fastForwardTo(-1);
			this.updateLayout();
			this.updateControls();
		},
		add: function(data) {
			if (!data) return;
			if (data.substr(0,6) === '|init|') {
				return this.init(data);
			}
			if (data.substr(0,9) === '|request|') {
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

				if (logLine.substr(0, 18) === '|callback|trapped|') {
					var idx = logLine.substr(18);
					this.request.active[idx].trapped = true;
					// TODO: Maybe a more sophisticated UI for this.
					// In singles, this isn't really necessary because the switch UI will be
					// immediately disabled. However, in doubles it might not be obvious why
					// the player is being asked to make a new decision without this message.
					delete this.choice;
					this.battle.activityQueue.push('|message|'+this.battle.mySide.active[idx].getName() + ' is trapped and cannot switch!');
				} else if (logLine.substr(0, 7) === '|title|') {
					this.title = logLine.substr(7);
				} else if (logLine.substr(0, 6) === '|chat|' || logLine.substr(0, 3) === '|c|' || logLine.substr(0, 9) === '|chatmsg|' || logLine.substr(0, 10) === '|inactive|') {
					this.battle.instantAdd(logLine);
				} else {
					this.battle.activityQueue.push(logLine);
				}
			}
			this.battle.add('', Tools.prefs('noanim'));
			this.updateControls();
		},

		/*********************************************************
		 * Battle stuff
		 *********************************************************/

		updateControls: function() {
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
				this.$controls.html('<p><button name="skipTurn">Skip turn <i class="icon-step-forward"></i></button><button name="goToEnd">Go to last turn <i class="icon-fast-forward"></i></button></p>');
				return;

			}

			// tooltips
			var myActive = this.battle.mySide.active;
			var yourActive = this.battle.yourSide.active;
			var buf = '';
			if (yourActive[2]) {
				buf += '<div style="position:absolute;top:70px;left:250px;width:80px;height:100px;"' + this.tooltipAttrs(yourActive[2].getIdent(), 'pokemon', true, 'foe') + '></div>';
			}
			if (yourActive[1]) {
				buf += '<div style="position:absolute;top:85px;left:320px;width:90px;height:100px;"' + this.tooltipAttrs(yourActive[1].getIdent(), 'pokemon', true, 'foe') + '></div>';
			}
			if (yourActive[0]) {
				buf += '<div style="position:absolute;top:90px;left:390px;width:100px;height:100px;"' + this.tooltipAttrs(yourActive[0].getIdent(), 'pokemon', true, 'foe') + '></div>';
			}
			if (myActive[0]) {
				buf += '<div style="position:absolute;top:210px;left:130px;width:180px;height:160px;"' + this.tooltipAttrs(myActive[0].getIdent(), 'pokemon', true, true) + '></div>';
			}
			if (myActive[1]) {
				buf += '<div style="position:absolute;top:210px;left:270px;width:160px;height:160px;"' + this.tooltipAttrs(myActive[1].getIdent(), 'pokemon', true, true) + '></div>';
			}
			if (myActive[2]) {
				buf += '<div style="position:absolute;top:210px;left:410px;width:140px;height:160px;"' + this.tooltipAttrs(myActive[2].getIdent(), 'pokemon', true, true) + '></div>';
			}
			this.$foeHint.html(buf);

			if (this.battle.done) {

				// battle has ended
				this.$controls.html('<div class="controls"><p><em><button name="instantReplay"><i class="icon-undo"></i> Instant Replay</button> <button name="saveReplay"><i class="icon-upload"></i> Share replay</button></p></div>');

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
					if (!controlsShown || (this.choice && this.choice.waiting)) {
						this.updateControlsForPlayer();
					}
				}

			} else {

				// full battle
				this.$controls.html('<p><em>Waiting for players...</em></p>');

			}

			// This intentionally doesn't happen if the battle is still playing,
			// since those early-return.
			app.topbar.updateTabbar();
		},
		controlsShown: false,
		updateControlsForPlayer: function() {
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
					switchables = this.battle.mySide.pokemon;
				}
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
				{
					if (!this.choice) {
						this.choice = {
							choices: [],
							switchFlags: {},
							switchOutFlags: {}
						}
						while (switchables[this.choice.choices.length] && switchables[this.choice.choices.length].fainted && this.choice.choices.length + 1 < this.battle.mySide.active.length) {
							this.choice.choices.push('pass');
						}
					}
					var pos = this.choice.choices.length - (type === 'movetarget'?1:0);

					// hp bar
					var hpbar = '';
					if (switchables[pos].hp * 5 / switchables[pos].maxhp < 1) {
						hpbar = '<small class="critical">';
					} else if (switchables[pos].hp * 2 / switchables[pos].maxhp < 1) {
						hpbar = '<small class="weak">';
					} else {
						hpbar = '<small class="healthy">';
					}
					hpbar += ''+switchables[pos].hp+'/'+switchables[pos].maxhp+'</small>';

					var active = this.request;
					if (active.active) active = active.active[pos];
					var moves = active.moves;
					var trapped = active.trapped;
					this.finalDecision = active.maybeTrapped || false;
					if (this.finalDecision) {
						for (var i = pos + 1; i < this.battle.mySide.active.length; ++i) {
							var p = this.battle.mySide.active[i];
							if (p && !p.fainted) {
								this.finalDecision = false;
							}
						}
					}

					var controls = '<div class="controls"><div class="whatdo">';
					if (type === 'move2' || type === 'movetarget') {
						controls += '<button name="clearChoice">Back</button> ';
					}

					// Target selector

					if (type === 'movetarget') {
						controls += 'At who? '+hpbar+'</div>';
						controls += '<div class="switchmenu" style="display:block">';

						var myActive = this.battle.mySide.active;
						var yourActive = this.battle.yourSide.active;
						var yourSlot = yourActive.length-1-pos;
						for (var i = yourActive.length-1; i >= 0; i--) {
							var pokemon = yourActive[i];

							var disabled = false;
							if (moveTarget === 'adjacentAlly' || moveTarget === 'adjacentAllyOrSelf') {
								disabled = true;
							} else if (moveTarget === 'normal' || moveTarget === 'adjacentFoe') {
								if (Math.abs(yourSlot-i) > 1) disabled = true;
							}

							if (disabled) {
								controls += '<button disabled="disabled" style="visibility:hidden"></button> ';
							} else if (!pokemon || pokemon.zerohp) {
								controls += '<button class="disabled" name="chooseMoveTarget" value="'+(i+1)+'"><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon('missingno')+'"></span></button> ';
							} else {
								controls += '<button name="chooseMoveTarget" value="'+(i+1)+'"' + this.tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
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

							if (disabled) {
								controls += '<button disabled="disabled" style="visibility:hidden"></button> ';
							} else if (!pokemon || pokemon.zerohp) {
								controls += '<button class="disabled" name="chooseMoveTarget" value="' + (-(i+1)) + '"><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon('missingno')+'"></span></button> ';
							} else {
								controls += '<button name="chooseMoveTarget" value="' + (-(i+1)) + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
							}
						}
						controls += '</div>';
						controls += '</div>';
						this.$controls.html(controls);
						break;
					}

					// Move chooser

					controls += 'What will <strong>' + Tools.escapeHTML(switchables[pos].name) + '</strong> do? '+hpbar+'</div>';
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
						if (moveData.disabled) {
							movebuttons += '<button disabled="disabled"' + this.tooltipAttrs(moveData.move, 'move') + '>';
							hasDisabled = true;
						} else {
							movebuttons += '<button class="type-' + move.type + '" name="chooseMove" value="' + Tools.escapeHTML(moveData.move) + '"' + this.tooltipAttrs(moveData.move, 'move') + '>';
							hasMoves = true;
						}
						movebuttons += name + '<br /><small class="type">' + move.type + '</small> <small class="pp">' + pp + '</small>&nbsp;</button> ';
					}
					if (!hasMoves) {
						controls += '<button class="movebutton" name="chooseMove" value="Struggle">Struggle<br /><small class="type">Normal</small> <small class="pp">&ndash;</small>&nbsp;</button> ';
					} else {
						controls += movebuttons;
					}
					if (switchables[pos].canMegaEvo) {
						controls += '<br /><label><input type="checkbox" name="megaevo" />&nbsp;Mega&nbsp;evolution</label>'
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
								controls += '<button disabled' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
							} else {
								controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
							}
						}
						if (this.finalDecision && this.battle.gen > 2) {
							controls += '<em style="display:block;clear:both">You <strong>might</strong> be trapped, so you won\'t be able to cancel a switch!</em><br/>';
						}
					}
					controls += '</div></div></div>';
					this.$controls.html(controls);
				}
				break;

			case 'switch':
				this.finalDecision = false;
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
					var faintedLength = this.request.forceSwitch.filter(function(fainted) {return fainted;}).length;
					this.choice.freedomDegrees = faintedLength - this.battle.mySide.pokemon.slice(this.battle.mySide.active.length).filter(function (mon) {return !mon.zerohp;}).length; 
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
					var pos = this.choice.choices.length - (type === 'movetarget'?1:0);

					// TODO? hpbar
					controls += 'Which Pokémon will it switch in for?</div>';
					controls += '<div class="switchmenu" style="display:block">';

					var myActive = this.battle.mySide.active;
					var pokemon;
					for (var i = 0; i < myActive.length; i++) {
						pokemon = this.battle.mySide.pokemon[i];

						if (pokemon && !pokemon.zerohp || this.choice.switchOutFlags[i]) {
							controls += '<button disabled' + this.tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
						} else if (!pokemon) {
							controls += '<button disabled></button> ';
						} else {
							controls += '<button name="chooseSwitchTarget" value="'+i+'"' + this.tooltipAttrs(pokemon.getIdent(), 'pokemon', true, 'foe') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':'')+'</button> ';
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
					controls += 'Switch <strong>'+Tools.escapeHTML(switchables[pos].name)+'</strong> to:</div>';
				}
				controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Switch</button></div><div class="switchmenu">';
				for (var i = 0; i < switchables.length; i++) {
					var pokemon = switchables[i];
					if (pokemon.zerohp || i < this.battle.mySide.active.length || this.choice.switchFlags[i]) {
						controls += '<button disabled' + this.tooltipAttrs(i, 'sidepokemon') + '>';
					} else {
						controls += '<button name="chooseSwitch" value="' + i + '"' + this.tooltipAttrs(i, 'sidepokemon') + '>';
					}
					controls += '<span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + (!pokemon.zerohp?'<span class="hpbar' + pokemon.getHPColorClass() + '"><span style="width:'+(Math.round(pokemon.hp*92/pokemon.maxhp)||1)+'px"></span></span>'+(pokemon.status?'<span class="status '+pokemon.status+'"></span>':''):'') +'</button> ';
				}
				controls += '</div></div></div>';
				this.$controls.html(controls);
				this.selectSwitch();
				break;

			case 'team':
				var controls = '<div class="controls"><div class="whatdo">';
				if (!this.choice || !this.choice.done) {
					this.choice = {
						teamPreview: [1,2,3,4,5,6].slice(0,switchables.length),
						done: 0,
						count: 0
					}
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
						controls += '<button name="chooseTeamPreview" value="'+i+'"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
					}
					if (this.battle.teamPreviewCount) this.choice.count = parseInt(this.battle.teamPreviewCount,10);
					controls += '</div>';
				} else {
					controls += '<button name="clearChoice">Back</button> What about the rest of your team?</div>';
					controls += '<div class="switchcontrols"><div class="switchselect"><button name="selectSwitch">Choose a Pokémon for slot '+(this.choice.done+1)+'</button></div><div class="switchmenu">';
					for (var i = 0; i < switchables.length; i++) {
						var pokemon = switchables[this.choice.teamPreview[i]-1];
						if (i >= 6) {
							break;
						}
						if (i < this.choice.done) {
							controls += '<button disabled="disabled"' + this.tooltipAttrs(i, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
						} else {
							controls += '<button name="chooseTeamPreview" value="'+i+'"' + this.tooltipAttrs(this.choice.teamPreview[i]-1, 'sidepokemon') + '><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(pokemon)+'"></span>' + Tools.escapeHTML(pokemon.name) + '</button> ';
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
		sendDecision: function(message) {
			this.send(message + '|' + this.request.rqid);
		},
		request: null,
		receiveRequest: function(request) {
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
			this.request = request;
			if (request.side) {
				this.updateSideLocation(request.side, true);
			}
			this.notifyRequest();
			this.updateControls();
		},
		notifyRequest: function() {
			var oName = this.battle.yourSide.name;
			if (oName) oName = " against "+oName;
			switch (this.request.requestType) {
			case 'move':
				this.notify("Your move!", "Move in your battle"+oName, 'choice');
				break;
			case 'switch':
				this.notify("Your switch!", "Switch in your battle"+oName, 'choice');
				break;
			case 'team':
				this.notify("Team preview!", "Choose your team order in your battle"+oName, 'choice');
				break;
			}
		},
		updateSideLocation: function(sideData, midBattle) {
			if (!sideData.id) return;
			this.side = sideData.id;
			if (this.battle.sidesSwitched !== !!(this.side === 'p2')) {
				sidesSwitched = true;
				this.battle.reset(true);
				this.battle.switchSides();
				if (midBattle) {
					this.battle.fastForwardTo(-1);
				} else {
					this.battle.play();
				}
				this.$chat = this.$chatFrame.find('.inner');
			}
		},
		updateSide: function(sideData) {
			for (var i = 0; i < sideData.pokemon.length; i++) {
				var pokemonData = sideData.pokemon[i];
				var pokemon;
				if (i == 0) {
					pokemon = this.battle.getPokemon(''+pokemonData.ident, pokemonData.details);
					pokemon.slot = 0;
					pokemon.side.pokemon = [pokemon];
					// if (pokemon.side.active[0] && pokemon.side.active[0].ident == pokemon.ident) pokemon.side.active[0] = pokemon;
				} else if (i < this.battle.mySide.active.length) {
					pokemon = this.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
					pokemon.slot = i;
					// if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) pokemon.side.active[i] = pokemon;
					if (pokemon.side.active[i] && pokemon.side.active[i].ident == pokemon.ident) {
						pokemon.side.active[i].item = pokemon.item || pokemonData.item;
						pokemon.side.active[i].ability = pokemon.ability || pokemonData.ability;
						pokemon.side.active[i].baseAbility = pokemon.baseAbility || pokemonData.baseAbility;
						pokemon.side.active[i].stats = pokemon.stats || pokemonData.stats;
					}
				} else {
					pokemon = this.battle.getPokemon('new: '+pokemonData.ident, pokemonData.details);
				}
				pokemon.healthParse(pokemonData.condition);
				if (pokemonData.baseAbility) {
					pokemon.baseAbility = pokemonData.baseAbility;
					if (!pokemon.ability) pokemon.ability = pokemon.baseAbility;
				}
				pokemon.item = pokemonData.item;
				pokemon.moves = pokemonData.moves;
				pokemon.canMegaEvo = pokemonData.canMegaEvo;
				pokemon.stats = pokemonData.stats;
			}
			this.battle.mySide.updateSidebar();
		},

		// buttons
		joinBattle: function() {
			this.send('/joinbattle');
		},
		setTimer: function(setting) {
			this.send('/timer '+setting);
		},
		forfeit: function() {
			this.send('/forfeit');
		},
		saveReplay: function() {
			this.send('/savereplay');
		},
		instantReplay: function() {
			this.hideTooltip();
			this.request = null;
			this.battle.reset();
			this.battle.play();
		},
		skipTurn: function() {
			this.battle.skipTurn();
		},
		goToEnd: function() {
			this.battle.fastForwardTo(-1);
		},
		register: function(userid) {
			var registered = app.user.get('registered');
			if (registered && registered.userid !== userid) registered = false;
			if (!registered && userid === app.user.get('userid')) {
				app.addPopup(RegisterPopup);
			}
		},

		// choice buttons
		chooseMove: function(move) {
			var myActive = this.battle.mySide.active;
			var target = Tools.getMove(move).target;
			this.hideTooltip();
			var isMega = !!(this.$('input[name=megaevo]')[0]||'').checked;
			if (move !== undefined) {
				var choosableTargets = {normal:1, any:1, adjacentAlly:1, adjacentAllyOrSelf:1, adjacentFoe:1};
				this.choice.choices.push('move '+move+(isMega?' mega':''));
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

			this.sendDecision('/choose '+this.choice.choices.join(','));
			this.closeNotification('choice');

			this.finalDecision = false;
			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseMoveTarget: function(posString) {
			this.choice.choices[this.choice.choices.length-1] += ' '+posString;
			this.chooseMove();
		},
		chooseShift: function() {
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

			this.sendDecision('/choose '+this.choice.choices.join(','));
			this.closeNotification('choice');

			this.finalDecision = false;
			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseSwitch: function(pos) {
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
				this.choice.choices.push('switch '+(parseInt(pos,10)+1));
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
				this.sendDecision('/choose '+this.choice.choices.join(','));
				this.closeNotification('choice');

				this.choice = {waiting: true};
				this.updateControlsForPlayer();
				return false;
			}
			// After choosing the position to which a pokemon will switch in (Triples).
			if (!this.request || this.request.requestType !== 'switch') return false; //??
			if (this.choice.canSwitch > this.choice.choices.filter(function(choice) {return choice;}).length) {
				// More switches are pending.
				this.choice.type = 'switch2';
				this.updateControlsForPlayer();
				return false;
			}
			for (var i = 0; i < this.battle.mySide.active.length; i++) {
				if (!this.choice.choices[i]) this.choice.choices[i] = 'pass';
			}

			this.sendDecision('/choose '+this.choice.choices.join(','));
			this.closeNotification('choice');

			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		chooseSwitchTarget: function(posString) {
			var indexSwitchIn = -1;
			for (var i in this.choice.switchFlags) {
				if (this.choice.choices.indexOf('switch '+(parseInt(i,10)+1)) === -1) {
					indexSwitchIn = i;
					break;
				}
			}
			this.choice.choices[posString] = 'switch '+(parseInt(indexSwitchIn,10)+1);
			this.choice.switchOutFlags[posString] = true;
			this.chooseSwitch();
		},
		chooseTeamPreview: function(pos) {
			pos = parseInt(pos,10);
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
				pos = pos+1;
			}

			this.sendDecision('/team '+(pos));
			this.closeNotification('choice');

			this.choice = {waiting: true};
			this.updateControlsForPlayer();
		},
		undoChoice: function(pos) {
			this.send('/undo');
			this.notifyRequest();

			this.choice = null;
			this.updateControlsForPlayer();
		},
		clearChoice: function() {
			this.choice = null;
			this.updateControlsForPlayer();
		},
		leaveBattle: function() {
			this.hideTooltip();
			this.send('/leavebattle');
			this.closeNotification('choice');
		},
		selectSwitch: function() {
			this.hideTooltip();
			this.$controls.find('.controls').attr('class', 'controls switch-controls');
		},
		selectMove: function() {
			this.hideTooltip();
			this.$controls.find('.controls').attr('class', 'controls move-controls');
		},

		// tooltips
		tooltipAttrs: function(thing, type, ownHeight, isActive) {
			return ' onmouseover="room.showTooltip(\'' + Tools.escapeHTML(''+thing, true) + '\',\'' + type + '\', this, ' + (ownHeight ? 'true' : 'false') + ', ' + (isActive ? 'true' : 'false') + ')" onmouseout="room.hideTooltip()" onmouseup="room.hideTooltip()"';
		},
		showTooltip: function(thing, type, elem, ownHeight, isActive) {
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

			if (x > 335) x = 335;
			if (y < 140) y = 140;
			if (!$('#tooltipwrapper').length) $(document.body).append('<div id="tooltipwrapper"></div>');
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
				text += '<h2>' + move.name + '<br />'+Tools.getTypeIcon(move.type)+' <img src="' + Tools.resourcePrefix + 'sprites/categories/' + move.category + '.png" alt="' + move.category + '" /></h2>';
				text += '<p>Base power: ' + basePower + '</p>';
				text += '<p>Accuracy: ' + accuracy + '</p>';
				if (move.desc) {
					text += '<p class="section">' + move.desc + '</p>';
				}
				text += '</div></div>';
				break;

			case 'pokemon':
				var pokemon = this.battle.getPokemon(thing);
				if (!pokemon) return;
				//fallthrough
			case 'sidepokemon':
				if (!pokemon) pokemon = this.battle.mySide.pokemon[parseInt(thing)];
				var gender = '';
				if (pokemon.gender === 'F') gender = ' <small style="color:#C57575">&#9792;</small>';
				if (pokemon.gender === 'M') gender = ' <small style="color:#7575C0">&#9794;</small>';
				text = '<div class="tooltipinner"><div class="tooltip">';
				text += '<h2>' + pokemon.getFullName() + gender + (pokemon.level !== 100 ? ' <small>L' + pokemon.level + '</small>' : '') + '<br />';

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
				var isTypeChanged = false;
				if (pokemon.volatiles.typechange) {
					isTypeChanged = true;
					types = pokemon.volatiles.typechange[2].split('/');
				}
				if (pokemon.volatiles.typeadd) {
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
				var exacthp = '';
				if (pokemon.maxhp != 100 && pokemon.maxhp != 1000 && pokemon.maxhp != 48) exacthp = ' ('+pokemon.hp+'/'+pokemon.maxhp+')';
				if (pokemon.maxhp == 48 && isActive) exacthp = ' <small>('+pokemon.hp+'/'+pokemon.maxhp+' pixels)</small>';
				text += '<p>HP: ' + pokemon.hpDisplay() +exacthp+(pokemon.status?' <span class="status '+pokemon.status+'">'+pokemon.status.toUpperCase()+'</span>':'')+'</p>';
				if (this.battle.gen > 2) {
					if (!pokemon.baseAbility && !pokemon.ability) {
						text += '<p>Possible abilities: ' + Tools.getAbility(template.abilities['0']).name;
						if (template.abilities['1']) text += ', ' + Tools.getAbility(template.abilities['1']).name;
						if (template.abilities['H']) text += ', ' + Tools.getAbility(template.abilities['H']).name;
						text += '</p>';
					} else if (pokemon.ability) {
						text += '<p>Ability: ' + Tools.getAbility(pokemon.ability).name + '</p>';
					} else if (pokemon.baseAbility) {
						text += '<p>Ability: ' + Tools.getAbility(pokemon.baseAbility).name + '</p>';
					}
				}
				if (pokemon.item) {
					text += '<p>Item: ' + Tools.getItem(pokemon.item).name + '</p>';
				}
				if (pokemon.stats) {
					text += '<p>' + pokemon.stats['atk'] + ' Atk /&nbsp;' + pokemon.stats['def'] + ' Def /&nbsp;' + pokemon.stats['spa'] + ' SpA /&nbsp;' + pokemon.stats['spd'] + ' SpD /&nbsp;' + pokemon.stats['spe'] + ' Spe</p>';
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
			$('#tooltipwrapper').html(text).appendTo(document.body);
		},
		hideTooltip: function() {
			$('#tooltipwrapper').html('');
		}
	});

	var ForfeitPopup = this.ForfeitPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			this.room = data.room;
			var buf = '<form><p>Are you sure you want to forfeit?</p>';
			buf += '<p><button type="submit"><strong>Forfeit</strong></button> <button name="close" class="autofocus">Cancel</button></p></form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			this.room.send('/forfeit');
			app.removeRoom(this.room.id);
			this.close();
		}
	});

}).call(this, jQuery);
