(function(exports, $) {

	// this is a useful global
	var teams;

	var TeambuilderRoom = exports.TeambuilderRoom = exports.Room.extend({
		type: 'teambuilder',
		initialize: function() {
			teams = Storage.teams;

			// left menu
			this.$el.addClass('ps-room-light').addClass('scrollable');
			app.on('init:loadteams', this.update, this);
			this.update();
		},
		focus: function() {
			if (!Tools.movelists) {
				this.buildMovelists();
			}
		},
		blur: function() {
			if (this.saveFlag) {
				this.saveFlag = false;
				app.user.trigger('saveteams');
			}
		},
		events: {
			// team changes
			'change input.teamnameedit': 'teamNameChange',
			'change select[name=format]': 'formatChange',
			'change input[name=nickname]': 'nicknameChange',

			// details
			'change .detailsform input': 'detailsChange',

			// stats
			'keyup .statform input.numform': 'statChange',
			'input .statform input[type=number].numform': 'statChange',
			'change select[name=nature]': 'natureChange',

			// teambuilder events
			'click .utilichart a': 'chartClick',
			'keydown .chartinput': 'chartKeydown',
			'keyup .chartinput': 'chartKeyup',
			'focus .chartinput': 'chartFocus',
			'change .chartinput': 'chartChange',

			// clipboard
			'click .teambuilder-clipboard-data .result': 'clipboardResultSelect',
			'click .teambuilder-clipboard-data': 'clipboardExpand',
			'blur .teambuilder-clipboard-data': 'clipboardShrink'
		},
		dispatchClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (this[e.currentTarget.value]) this[e.currentTarget.value].call(this, e);
		},
		saveTeams: function() {
			// save and return
			Storage.saveTeams();
			app.user.trigger('saveteams');
			this.update();
		},
		back: function() {
			if (this.exportMode) {
				this.exportMode = false;
				Storage.saveTeams();
			} else if (this.curSet) {
				app.clearGlobalListeners();
				this.curSet = null;
				Storage.saveTeams();
			} else if (this.curTeam) {
				Storage.saveTeam(this.curTeam);
				this.curTeam = null;
			} else {
				return;
			}
			app.user.trigger('saveteams');
			this.update();
		},

		// the teambuilder has three views:
		// - team list (curTeam falsy)
		// - team view (curTeam exists, curSet falsy)
		// - set view (curTeam exists, curSet exists)

		curTeam: null,
		curTeamLoc: 0,
		curSet: null,
		curSetLoc: 0,
		exportMode: false,
		update: function() {
			teams = Storage.teams;
			if (this.curTeam) {
				if (this.curSet) {
					return this.updateSetView();
				}
				return this.updateTeamView();
			}
			return this.updateTeamList();
		},

		/*********************************************************
		 * Team list view
		 *********************************************************/

		deletedTeam: null,
		deletedTeamLoc: -1,
		updateTeamList: function() {
			var teams = Storage.teams;
			var buf = '';

			this.deletedSet = null;
			this.deletedSetLoc = -1;

			if (this.exportMode) {
				buf = '<div class="pad"><button name="back"><i class="icon-chevron-left"></i> Team List</button> <button name="saveBackup" class="savebutton"><i class="icon-save"></i> Save</button></div>';
				buf += '<textarea class="teamedit textbox" rows="17">'+Tools.escapeHTML(TeambuilderRoom.teamsToText())+'</textarea>';
				this.$el.html(buf);
				return;
			}

			if (!teams) {
				buf = '<div class="pad"><p>lol zarel this is a horrible teambuilder</p>'
				buf += '<p>that\'s because we\'re not done loading it...</p></div>';
				this.$el.html(buf);
				return;
			}
			buf = '<div class="pad"><p>y\'know zarel this is a pretty good teambuilder</p>';
			buf += '<p>aww thanks I\'m glad you like it :)</p>';
			buf += this.clipboardHTML();
			buf += '<ul>';
			if (!window.localStorage && !window.nodewebkit) buf += '<li>== CAN\'T SAVE ==<br /><small>Your browser doesn\'t support <code>localStorage</code> and can\'t save teams! Update to a newer browser.</small></li>';
			if (Storage.cantSave) buf += '<li>== CAN\'T SAVE ==<br /><small>You hit your browser\'s limit for team storage! Please backup them and delete some of them. Your teams won\'t be saved until you\'re under the limit again.</small></li>';
			if (!teams.length) {
				if (this.deletedTeamLoc >= 0) {
					buf += '<li><button name="undoDelete"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				buf += '<li><em>you don\'t have any teams lol</em></li>';
			} else {
				buf += '<li><button name="newTop"><i class="icon-plus-sign"></i> New team</button></li>';
				for (var i=0; i<teams.length+1; i++) {
					if (i === this.deletedTeamLoc) {
						buf += '<li><button name="undoDelete"><i class="icon-undo"></i> Undo Delete</button></li>';
					}
					if (i >= teams.length) break;

					var team = teams[i];

					if (!team) {
						buf += '<li>Error: A corrupted team was dropped</li>';
						teams.splice(i,1);
						i--;
						if (this.deletedTeamLoc && this.deletedTeamLoc > i) this.deletedTeamLoc--;
						continue;
					}

					var formatText = '';
					if (team.format) {
						formatText = '['+team.format+'] ';
					}

					buf += '<li><button name="edit" value="'+i+'" style="width:400px;vertical-align:middle">'+formatText+'<strong>'+Tools.escapeHTML(team.name)+'</strong><br /><small>';
					for (var j=0; j<team.team.length; j++) {
						if (j!=0) buf += ' / ';
						buf += ''+Tools.escapeHTML(team.team[j].name);
					}
					buf += '</small></button> <button name="edit" value="'+i+'"><i class="icon-pencil"></i>Edit</button> <button name="delete" value="'+i+'"><i class="icon-trash"></i>Delete</button></li>';
				}
			}
			buf += '<li><button name="new"><i class="icon-plus-sign"></i> New team</button></li>';
			buf += '</ul>';

			if (window.nodewebkit) {
				buf += '<button name="revealFolder"><i class="icon-folder-open"></i> Reveal teams folder</button> <button name="reloadTeamsFolder"><i class="icon-refresh"></i> Reload teams files</button> <button name="backup"><i class="icon-upload-alt"></i> Backup/Restore all teams</button>';
			} else {
				buf += '<button name="backup"><i class="icon-upload-alt"></i> Backup/Restore all teams</button>';

				buf += '<p><strong>Clearing your cookies (specifically, <code>localStorage</code>) will delete your teams.</strong></p><p>If you want to clear your cookies or <code>localStorage</code>, you can use the Backup/Restore feature to save your teams as text first.</p>';
			}

			buf += '</div>';

			this.$el.html(buf);
		},
		// button actions
		revealFolder: function() {
			Storage.revealFolder();
		},
		reloadTeamsFolder: function() {
			Storage.nwLoadTeams();
		},
		edit: function(i) {
			var i = +i;
			this.curTeam = teams[i];
			this.curTeamIndex = i;
			this.update();
		},
		"delete": function(i) {
			var i = +i;
			this.deletedTeamLoc = i;
			this.deletedTeam = teams.splice(i, 1)[0];
			Storage.deleteTeam(this.deletedTeam);
			this.update();
		},
		undoDelete: function() {
			if (this.deletedTeamLoc >= 0) {
				teams.splice(this.deletedTeamLoc, 0, this.deletedTeam);
				var undeletedTeam = this.deletedTeam;
				this.deletedTeam = null;
				this.deletedTeamLoc = -1;
				Storage.saveTeam(undeletedTeam);
				this.update();
			}
		},
		saveBackup: function() {
			TeambuilderRoom.parseText(this.$('.teamedit').val(), true);
			Storage.saveAllTeams();
			this.back();
		},
		"new": function() {
			var newTeam = {
				name: 'Untitled '+(teams.length+1),
				team: []
			};
			teams.push(newTeam);
			this.curTeam = newTeam;
			this.curTeamLoc = teams.length-1;
			this.update();
		},
		newTop: function() {
			var newTeam = {
				name: 'Untitled '+(teams.length+1),
				team: []
			};
			teams.unshift(newTeam);
			this.curTeam = newTeam;
			this.curTeamLoc = 0;
			this.update();
		},
		"import": function() {
			if (this.exportMode) return this.back();
			if (!this.curTeam) {
				var newTeam = {
					name: 'Untitled '+(teams.length+1),
					team: []
				};
				teams.push(newTeam);
				this.curTeam = newTeam;
				this.curTeamLoc = teams.length-1;
			}
			this.exportMode = true;
			this.update();
		},
		backup: function() {
			this.curTeam = null;
			this.exportMode = true;
			this.update();
		},

		/*********************************************************
		 * Team view
		 *********************************************************/

		updateTeamView: function() {
			this.curChartName = '';
			this.curChartType = '';

			var buf = '';
			if (this.exportMode) {
				buf = '<div class="pad"><button name="back"><i class="icon-chevron-left"></i> Team List</button> <input class="textbox teamnameedit" type="text" class="teamnameedit" size="30" value="'+Tools.escapeHTML(this.curTeam.name)+'" /> <button name="saveImport"><i class="icon-upload-alt"></i> Import/Export</button> <button name="saveImport" class="savebutton"><i class="icon-save"></i> Save</button></div>';
				buf += '<textarea class="teamedit textbox" rows="17">'+Tools.escapeHTML(TeambuilderRoom.toText(this.curTeam.team))+'</textarea>';
			} else {
				buf = '<div class="pad"><button name="back"><i class="icon-chevron-left"></i> Team List</button> <input class="textbox teamnameedit" type="text" class="teamnameedit" size="30" value="'+Tools.escapeHTML(this.curTeam.name)+'" /> <button name="import"><i class="icon-upload-alt"></i> Import/Export</button></div>';
				buf += '<div class="teamchartbox">';
				buf += '<ol class="teamchart">';
				buf += '<li>' + this.clipboardHTML() + '</li>';
				var i=0;
				if (this.curTeam.team.length && !this.curTeam.team[this.curTeam.team.length-1].species) {
					this.curTeam.team.splice(this.curTeam.team.length-1, 1);
				}
				if (exports.BattleFormats) {
					buf += '<li class="format-select"><label>Format:</label><select name="format"><option value="">(None)</option>';
					for (var i in BattleFormats) {
						if (BattleFormats[i].isTeambuilderFormat) {
							var activeFormat = (this.curTeam.format === i?' selected="selected"':'');
							buf += '<option value="'+i+'"'+activeFormat+'>'+BattleFormats[i].name+'</option>';
						}
					}
					buf += '</select></li>';
				}
				if (!this.curTeam.team.length) {
					buf += '<li><em>you have no pokemon lol</em></li>';
				}
				for (i=0; i<this.curTeam.team.length; i++) {
					if (this.curTeam.team.length < 6 && this.deletedSet && i === this.deletedSetLoc) {
						buf += '<li><button name="undeleteSet"><i class="icon-undo"></i> Undo Delete</button></li>';
					}
					buf += this.renderSet(this.curTeam.team[i], i);
				}
				if (this.deletedSet && i === this.deletedSetLoc) {
					buf += '<li><button name="undeleteSet"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				if (i === 0) {
					buf += '<li><button name="import" class="majorbutton"><i class="icon-upload-alt"></i> Import from text</button></li>';
				}
				if (i < 6) {
					buf += '<li><button name="addPokemon" class="majorbutton"><i class="icon-plus"></i> Add Pokemon</button></li>';
				}
				buf += '</ol>';
				buf += '</div>';
			}
			this.$el.html(buf);
		},
		renderSet: function(set, i) {
			var template = Tools.getTemplate(set.species);
			var buf = '<li value="'+i+'">';
			if (!set.species) {
				if (this.deletedSet) {
					buf += '<div class="setmenu setmenu-left"><button name="undeleteSet"><i class="icon-undo"></i> Undo Delete</button></div>';
				}
				buf += '<div class="setchart"><div class="setcol setcol-icon" style="background-image:url(' + Tools.resourcePrefix + 'sprites/bw/0.png);"><span class="itemicon"></span><div class="setcell setcell-pokemon"><label>Pokemon</label><input type="text" name="pokemon" class="chartinput" value="" /></div></div></div>';
				buf += '</li>';
				return buf;
			}
			buf += '<div class="setmenu"><button name="copySet"><i class="icon-copy"></i>Copy</button> <button name="moveSet"><i class="icon-move"></i>Move</button> <button name="deleteSet"><i class="icon-trash"></i>Delete</button></div>';
			buf += '<div class="setchart-nickname">';
			buf += '<label>Nickname</label><input type="text" value="'+Tools.escapeHTML(set.name||set.species)+'" name="nickname" />';
			buf += '</div>';
			buf += '<div class="setchart">';

			// icon
			var itemicon = '<span class="itemicon"></span>';
			if (set.item) {
				var item = Tools.getItem(set.item);
				itemicon = '<span class="itemicon" style="'+Tools.getItemIcon(item)+'"></span>';
			}
			buf += '<div class="setcol setcol-icon" style="'+Tools.getTeambuilderSprite(set)+';">'+itemicon+'<div class="setcell setcell-pokemon"><label>Pokemon</label><input type="text" name="pokemon" class="chartinput" value="'+Tools.escapeHTML(set.species)+'" /></div></div>';

			// details
			buf += '<div class="setcol setcol-details"><div class="setrow">';
			buf += '<div class="setcell setcell-details"><label>Details</label><button class="setdetails" tabindex="-1" name="details">';

			var GenderChart = {
				'M': 'Male',
				'F': 'Female',
				'N': '&mdash;'
			};
			buf += '<span class="detailcell detailcell-first"><label>Level</label>'+(set.level||100)+'</span>';
			buf += '<span class="detailcell"><label>Gender</label>'+GenderChart[template.gender||set.gender||'N']+'</span>';
			buf += '<span class="detailcell"><label>Happiness</label>'+(typeof set.happiness === 'number'?set.happiness:255)+'</span>';
			buf += '<span class="detailcell"><label>Shiny</label>'+(set.shiny?'Yes':'No')+'</span>';

			buf += '</button></div>';
			buf += '</div><div class="setrow">';
			buf += '<div class="setcell setcell-item"><label>Item</label><input type="text" name="item" class="chartinput" value="'+Tools.escapeHTML(set.item)+'" /></div>';
			buf += '<div class="setcell setcell-ability"><label>Ability</label><input type="text" name="ability" class="chartinput" value="'+Tools.escapeHTML(set.ability)+'" /></div>';
			buf += '</div></div>';

			// moves
			if (!set.moves) set.moves = [];
			buf += '<div class="setcol setcol-moves"><div class="setcell"><label>Moves</label>';
			buf += '<input type="text" name="move1" class="chartinput" value="'+Tools.escapeHTML(set.moves[0])+'" /></div>';
			buf += '<div class="setcell"><input type="text" name="move2" class="chartinput" value="'+Tools.escapeHTML(set.moves[1])+'" /></div>';
			buf += '<div class="setcell"><input type="text" name="move3" class="chartinput" value="'+Tools.escapeHTML(set.moves[2])+'" /></div>';
			buf += '<div class="setcell"><input type="text" name="move4" class="chartinput" value="'+Tools.escapeHTML(set.moves[3])+'" /></div>';
			buf += '</div>';

			// stats
			buf += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="setstats" name="stats" class="chartinput">';
			buf += '<span class="statrow statrow-head"><label></label> <span class="statgraph"></span> <em>EV</em></span>';
			var stats = {};
			for (var j in BattleStatNames) {
				stats[j] = this.getStat(j, set);
				var ev = '<em>'+(set.evs[j] || '')+'</em>';
				if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === j) {
					ev += '<small>+</small>';
				} else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === j) {
					ev += '<small>&minus;</small>';
				}
				var width = stats[j]*75/504;
				if (j=='hp') width = stats[j]*75/704;
				if (width>75) width = 75;
				var color = Math.floor(stats[j]*180/714);
				if (color>360) color = 360;
				buf += '<span class="statrow"><label>'+BattleStatNames[j]+'</label> <span class="statgraph"><span style="width:'+width+'px;background:hsl('+color+',40%,75%);"></span></span> '+ev+'</span>';
			}
			buf += '</button></div></div>';

			buf += '</div></li>';
			return buf;
		},

		saveImport: function() {
			this.curTeam.team = TeambuilderRoom.parseText(this.$('.teamedit').val());
			this.back();
		},
		addPokemon: function() {
			if (!this.curTeam) return;
			var team = this.curTeam.team;
			if (!team.length || team[team.length-1].species) {
				var newPokemon = {
					name: '',
					species: '',
					item: '',
					nature: '',
					evs: {},
					ivs: {},
					moves: []
				};
				team.push(newPokemon);
			}
			this.curSet = team[team.length-1];
			this.curSetLoc = team.length-1;
			this.curChartName = '';
			this.update();
			this.$('input[name=pokemon]').select();
		},
		pastePokemon: function(i, btn) {
			if (!this.curTeam) return;
			var team = this.curTeam.team;
			if (team.length >= 6) return;
			if (!this.clipboardCount()) return;

			if (team.push($.extend(true, {}, this.clipboard[0])) >= 6) {
				$(btn).css('display', 'none');
			}
			this.update();
			this.save();
		},
		saveFlag: false,
		save: function() {
			this.saveFlag = true;
			Storage.saveTeams();
		},
		teamNameChange: function(e) {
			this.curTeam.name = ($.trim(e.currentTarget.value) || 'Untitled '+(this.curTeamLoc+1));
			e.currentTarget.value = this.curTeam.name;
			this.save();
		},
		formatChange: function(e) {
			this.curTeam.format = e.currentTarget.value;
			this.save();
		},
		nicknameChange: function(e) {
			var i = +$(e.currentTarget).closest('li').attr('value');
			var team = this.curTeam.team[i];
			var name = $.trim(e.currentTarget.value) || team.species;
			e.currentTarget.value = team.name = name;
			this.save();
		},

		// clipboard
		clipboard: [],
		clipboardCount: function() {
			return this.clipboard.length;
		},
		clipboardVisible: function() {
			return !!this.clipboardCount();
		},
		clipboardHTML: function() {
			var buf = '';
			buf += '<div class="teambuilder-clipboard-container" style="display: ' + (this.clipboardVisible() ? 'block' : 'none') + ';">';
			buf += '<div class="teambuilder-clipboard-title">Clipboard:</div>';
			buf += '<div class="teambuilder-clipboard-data" tabindex="-1">' + this.clipboardInnerHTML() + '</div>';
			buf += '<div class="teambuilder-clipboard-buttons">';
			if (this.curTeam && this.curTeam.team.length < 6) {
				buf += '<button name="pastePokemon" class="teambuilder-clipboard-button-left"><i class="icon-paste"></i> Paste!</button>';
			}
			buf += '<button name="clipboardRemoveAll" class="teambuilder-clipboard-button-right"><i class="icon-trash"></i> Clear clipboard</button>';
			buf += '</div>';
			buf += '</div>';

			return buf;
		},
		clipboardInnerHTMLCache: '',
		clipboardInnerHTML: function() {
			if (this.clipboardInnerHTMLCache) {
				return this.clipboardInnerHTMLCache;
			}

			var buf = '';
			for (var i = 0; i < this.clipboardCount(); i++) {
				var res = this.clipboard[i];
				var pokemon = Tools.getTemplate(res.species);

				buf += '<div class="result" data-id="' + i + '">';
				buf += '<div class="section"><span class="icon" style="' + Tools.getIcon(res.species) + '"></span>';
				buf += '<span class="species">' + (pokemon.species === pokemon.baseSpecies ? pokemon.species : (pokemon.baseSpecies + '-<small>' + pokemon.species.substr(pokemon.baseSpecies.length + 1) + '</small>')) + '</span></div>';
				buf += '<div class="section"><span class="ability-item">' + (res.ability || '<i>No ability</i>') + '<br />' + (res.item || '<i>No item</i>') + '</span></div>';
				buf += '<div class="section no-border">';
				for (var j = 0; j < 4; j++) {
					if (!(j & 1)) {
						buf += '<span class="moves">';
					}
					buf += (res.moves[j] || '<i>No move</i>') + (!(j & 1) ? '<br />' : '');
					if (j & 1) {
						buf += '</span>';
					}
				}
				buf += '</div>';
				buf += '</div>';
			}

			this.clipboardInnerHTMLCache = buf;
			return buf;
		},
		clipboardUpdate: function() {
			this.clipboardInnerHTMLCache = '';
			$('.teambuilder-clipboard-data').html(this.clipboardInnerHTML());
		},
		clipboardExpanded: false,
		clipboardExpand: function() {
			var $clipboard = $('.teambuilder-clipboard-data');
			$clipboard.animate({ height: this.clipboardCount() * 28 }, 500, function() {
				setTimeout(function() { $clipboard.focus(); }, 100);
			});

			setTimeout(function() {
				this.clipboardExpanded = true;
			}.bind(this), 10);
		},
		clipboardShrink: function() {
			var $clipboard = $('.teambuilder-clipboard-data');
			$clipboard.animate({ height: 26 }, 500);

			setTimeout(function() {
				this.clipboardExpanded = false;
			}.bind(this), 10);
		},
		clipboardResultSelect: function(e) {
			if (!this.clipboardExpanded) return;

			e.stopPropagation();
			var target = +($(e.target).closest('.result').data('id'));
			if (target === -1) {
				this.clipboardShrink();
				this.clipboardRemoveAll();
				return;
			}

			this.clipboard.unshift(this.clipboard.splice(target, 1)[0]);
			this.clipboardUpdate();
			this.clipboardShrink();
		},
		clipboardAdd: function(set) {
			if (this.clipboard.unshift(set) > 6) {
				// we don't want the clipboard so big that it lags the teambuilder
				this.clipboard.pop();
			}
			this.clipboardUpdate();

			if (this.clipboardCount() === 1) {
				var $clipboard = $('.teambuilder-clipboard-container').css('opacity', 0);
				$clipboard.slideDown(250, function () {
					$clipboard.animate({ opacity: 1 }, 250);
				});
			}
		},
		clipboardRemoveAll: function() {
			this.clipboard = [];

			var self = this;
			var $clipboard = $('.teambuilder-clipboard-container');
			$clipboard.animate({ opacity: 0 }, 250, function () {
				$clipboard.slideUp(250, function() {
					self.clipboardUpdate();
				});
			});
		},

		// copy/move/delete
		copySet: function(i, button) {
			i = +($(button).closest('li').attr('value'));
			this.clipboardAdd($.extend(true, {}, this.curTeam.team[i]));
			button.blur();
		},
		moveSet: function(i, button) {
			i = +($(button).closest('li').attr('value'));
			app.addPopup(MovePopup, {
				i: i,
				team: this.curTeam.team
			});
		},
		deleteSet: function(i, button) {
			i = +($(button).closest('li').attr('value'));
			this.deletedSetLoc = i;
			this.deletedSet = this.curTeam.team.splice(i, 1)[0];
			if (this.curSet) {
				this.addPokemon();
			} else {
				this.update();
			}
			this.save();
		},
		undeleteSet: function() {
			if (this.deletedSet) {
				var loc = this.deletedSetLoc;
				this.curTeam.team.splice(loc, 0, this.deletedSet);
				this.deletedSet = null;
				this.deletedSetLoc = -1;
				this.save();

				if (this.curSet) {
					this.curSetLoc = loc;
					this.curSet = this.curTeam.team[loc];
					this.curChartName = '';
					this.update();
					this.updateChart();
				} else {
					this.update();
				}
			}
		},

		/*********************************************************
		 * Set view
		 *********************************************************/

		updateSetView: function() {
			// pokemon
			var buf = '<div class="pad">';
			buf += '<button name="back"><i class="icon-chevron-left"></i> Team</button></div>';
			buf += '<div class="teambar">';
			buf += this.renderTeambar();
			buf += '</div>';

			// pokemon
			buf += '<div class="teamchartbox">';
			buf += '<ol class="teamchart">';
			buf += this.renderSet(this.curSet, this.curSetLoc);
			buf += '</ol>';
			buf += '</div>';

			// results
			this.chartPrevSearch = '[init]';
			buf += '<div class="teambuilder-results"></div>';

			this.$el.html(buf);
			this.$chart = this.$('.teambuilder-results');
		},
		updateSetTop: function() {
			this.$('.teambar').html(this.renderTeambar());
			this.$('.teamchart').first().html(this.renderSet(this.curSet, this.curSetLoc));
		},
		renderTeambar: function() {
			var buf = '';
			var isAdd = false;
			if (this.curTeam.team.length && !this.curTeam.team[this.curTeam.team.length-1].name && this.curSetLoc !== this.curTeam.team.length-1) {
				this.curTeam.team.splice(this.curTeam.team.length-1, 1);
			}
			for (var i=0; i<this.curTeam.team.length; i++) {
				var set = this.curTeam.team[i];
				var pokemonicon = '<span class="pokemonicon pokemonicon-'+i+'" style="'+Tools.getIcon(set)+'"></span>';
				if (!set.name) {
					buf += '<button disabled="disabled" class="addpokemon"><i class="icon-plus"></i></button> ';
					isAdd = true;
				} else if (i == this.curSetLoc) {
					buf += '<button disabled="disabled" class="pokemon">'+pokemonicon+Tools.escapeHTML(set.name || '<i class="icon-plus"></i>')+'</button> ';
				} else {
					buf += '<button name="selectPokemon" value="'+i+'" class="pokemon">'+pokemonicon+Tools.escapeHTML(set.name)+'</button> ';
				}
			}
			if (this.curTeam.team.length < 6 && !isAdd) {
				buf += '<button name="addPokemon"><i class="icon-plus"></i></button> ';
			}
			return buf;
		},
		updatePokemonSprite: function() {
			var set = this.curSet;
			if (!set) return;
			var shiny = (set.shiny ? '-shiny' : '');
			var sprite = Tools.getTemplate(set.species).spriteid;
			if (BattlePokemonSprites && BattlePokemonSprites[sprite] && BattlePokemonSprites[sprite].front && BattlePokemonSprites[sprite].front.anif && set.gender === 'F') {
				sprite += '-f';
			}

			this.$('.setcol-icon').css('background-image', Tools.getTeambuilderSprite(set).substr(17));

			this.$('.pokemonicon-'+this.curSetLoc).css('background', Tools.getIcon(set).substr(11));

			var item = Tools.getItem(set.item);
			if (item.id) {
				this.$('.setcol-icon .itemicon').css('background', Tools.getItemIcon(item).substr(11));
			} else {
				this.$('.setcol-icon .itemicon').css('background', 'none');
			}

			this.updateStatGraph();
		},
		updateStatGraph: function() {
			var set = this.curSet;
			if (!set) return;

			var stats = {hp:'',atk:'',def:'',spa:'',spd:'',spe:''};

			// stat cell
			var buf = '<span class="statrow statrow-head"><label></label> <span class="statgraph"></span> <em>EV</em></span>';
			for (var stat in stats) {
				stats[stat] = this.getStat(stat, set);
				var ev = '<em>'+(set.evs[stat] || '')+'</em>';
				if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === stat) {
					ev += '<small>+</small>';
				}
				else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === stat) {
					ev += '<small>&minus;</small>';
				}
				var width = stats[stat]*75/504;
				if (stat == 'hp') width = stats[stat]*75/704;
				if (width > 75) width = 75;
				var color = Math.floor(stats[stat]*180/714);
				if (color > 360) color = 360;
				buf += '<span class="statrow"><label>'+BattleStatNames[stat]+'</label> <span class="statgraph"><span style="width:'+width+'px;background:hsl('+color+',40%,75%);"></span></span> '+ev+'</span>';
			}
			this.$('button[name=stats]').html(buf);

			if (this.curChartType !== 'stats') return;

			buf = '<div></div>';
			for (var stat in stats) {
				buf += '<div><b>'+stats[stat]+'</b></div>';
			}
			this.$chart.find('.statscol').html(buf);

			buf = '<div></div>';
			var totalev = 0;
			for (var stat in stats) {
				var width = stats[stat]*180/504;
				if (stat == 'hp') width = stats[stat]*180/704;
				if (width > 179) width = 179;
				var color = Math.floor(stats[stat]*180/714);
				if (color > 360) color = 360;
				buf += '<div><em><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',85%,35%)"></span></em></div>';
				totalev += (set.evs[stat]||0);
			}
			buf += '<div><em>Remaining:</em></div>';
			this.$chart.find('.graphcol').html(buf);

			if (totalev <= 510) {
				this.$chart.find('.totalev').html('<em>'+(totalev>508?0:508-totalev)+'</em>');
			} else {
				this.$chart.find('.totalev').html('<b>'+(510-totalev)+'</b>');
			}
			this.$chart.find('select[name=nature]').val(set.nature||'Serious');
		},
		curChartType: '',
		curChartName: '',
		updateChart: function() {
			var type = this.curChartType;
			app.clearGlobalListeners();
			if (type === 'stats') {
				this.updateStatForm();
				return;
			}
			if (type === 'details') {
				this.updateDetailsForm();
				return;
			}

			// cache movelist ref
			var speciesid = toId(this.curSet.species);
			var g6 = (this.curTeam.format && this.curTeam.format.substr(0,7) === 'vgc2014');
			this.movelist = (g6 ? Tools.g6movelists[speciesid] : Tools.movelists[speciesid]);

			this.$chart.html('<em>Loading '+this.curChartType+'...</em>');
			var self = this;
			if (this.updateChartTimeout) clearTimeout(this.updateChartTimeout);
			this.updateChartTimeout = setTimeout(function() {
				self.updateChartTimeout = null;
				if (self.curChartType === 'stats' || self.curChartType === 'details') return;
				self.$chart.html(Chart.chart(self.$('input[name='+self.curChartName+']').val(), self.curChartType, true, _.bind(self.arrangeCallback[self.curChartType], self)));
			}, 10);
		},
		updateChartTimeout: null,
		updateChartDelayed: function() {
			// cache movelist ref
			var speciesid = toId(this.curSet.species);
			var g6 = (this.curTeam.format && this.curTeam.format.substr(0,7) === 'vgc2014');
			this.movelist = (g6 ? Tools.g6movelists[speciesid] : Tools.movelists[speciesid]);

			var self = this;
			if (this.updateChartTimeout) clearTimeout(this.updateChartTimeout);
			this.updateChartTimeout = setTimeout(function() {
				self.updateChartTimeout = null;
				if (self.curChartType === 'stats' || self.curChartType === 'details') return;
				self.$chart.html(Chart.chart(self.$('input[name='+self.curChartName+']').val(), self.curChartType, false, _.bind(self.arrangeCallback[self.curChartType], self)));
			}, 200);
		},
		selectPokemon: function(i) {
			i = +i;
			var set = this.curTeam.team[i];
			if (set) {
				this.curSet = set;
				this.curSetLoc = i;
				var name = this.curChartName;
				if (name === 'details' || name === 'stats') {
					this.update();
					this.updateChart();
				} else {
					this.curChartName = '';
					this.update();
					this.$('input[name='+name+']').select();
				}
			}
		},
		stats: function(i, button) {
			if (!this.curSet) this.selectPokemon($(button).closest('li').val());
			this.curChartName = 'stats';
			this.curChartType = 'stats';
			this.updateStatForm();
		},
		details: function(i, button) {
			if (!this.curSet) this.selectPokemon($(button).closest('li').val());
			this.curChartName = 'details';
			this.curChartType = 'details';
			this.updateDetailsForm();
		},

		/*********************************************************
		 * Set stat form
		 *********************************************************/

		plus: '',
		minus: '',
		updateStatForm: function(setGuessed) {
			var buf = '';
			var set = this.curSet;
			var baseStats = Tools.getTemplate(this.curSet.species).baseStats;
			buf += '<h3>EVs</h3>';
			buf += '<div class="statform">';
			var role = this.guessRole();

			var guessedEVs = {};
			var guessedPlus = '';
			var guessedMinus = '';
			buf += '<p class="suggested"><small>Suggested spread:';
			if (role === '?') {
				buf += ' (Please choose 4 moves to get a suggested spread)</small></p>';
			} else {
				guessedEVs = this.guessEVs(role);
				guessedPlus = guessedEVs.plusStat; delete guessedEVs.plusStat;
				guessedMinus = guessedEVs.minusStat; delete guessedEVs.minusStat;
				buf += ' </small><button name="setStatFormGuesses">'+role+': ';
				for (var i in guessedEVs) {
					if (guessedEVs[i]) buf += ''+guessedEVs[i]+' '+BattleStatNames[i]+' / ';
				}
				buf += ' (+'+BattleStatNames[guessedPlus]+', -'+BattleStatNames[guessedMinus]+')</button></p>';
				//buf += ' <small>('+role+' | bulk: phys '+Math.round(this.moveCount.physicalBulk/1000)+' + spec '+Math.round(this.moveCount.specialBulk/1000)+' = '+Math.round(this.moveCount.bulk/1000)+')</small>';
			}

			if (setGuessed) {
				set.evs = guessedEVs;
				this.plus = guessedPlus;
				this.minus = guessedMinus;
				this.updateNature();

				this.save();
				this.updateStatGraph();
				this.natureChange();
				return;
			}

			var stats = {hp:'',atk:'',def:'',spa:'',spd:'',spe:''};
			if (!set) return;
			var nature = BattleNatures[set.nature || 'Serious'];
			if (!nature) nature = {};

			// label column
			buf += '<div class="col labelcol"><div></div>';
			buf += '<div><label>HP</label></div><div><label>Attack</label></div><div><label>Defense</label></div><div><label>Sp. Atk.</label></div><div><label>Sp. Def.</label></div><div><label>Speed</label></div>';
			buf += '</div>';

			buf += '<div class="col basestatscol"><div><em>Base</em></div>';
			for (var i in stats) {
				buf += '<div><b>'+baseStats[i]+'</b></div>';
			}
			buf += '</div>';

			buf += '<div class="col graphcol"><div></div>';
			for (var i in stats) {
				stats[i] = this.getStat(i);
				var width = stats[i]*180/504;
				if (i=='hp') width = Math.floor(stats[i]*180/704);
				if (width > 179) width = 179;
				var color = Math.floor(stats[i]*180/714);
				if (color>360) color = 360;
				buf += '<div><em><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',85%,35%)"></span></em></div>';
			}
			buf += '<div><em>Remaining:</em></div>';
			buf += '</div>';

			buf += '<div class="col evcol"><div><strong>EVs</strong></div>';
			var totalev = 0;
			this.plus = '';
			this.minus = '';
			for (var i in stats) {
				var width = stats[i]*200/504;
				if (i=='hp') width = stats[i]*200/704;
				if (width > 200) width = 200;
				var val = ''+(set.evs[i]||'');
				if (nature.plus === i) {
					val += '+';
					this.plus = i;
				}
				if (nature.minus === i) {
					val += '-';
					this.minus = i;
				}
				buf += '<div><input type="text" name="stat-'+i+'" value="'+val+'" class="inputform numform" /></div>';
				totalev += (set.evs[i]||0);
			}
			if (totalev <= 510) {
				buf += '<div class="totalev"><em>'+(totalev>508?0:508-totalev)+'</em></div>';
			} else {
				buf += '<div class="totalev"><b>'+(510-totalev)+'</b></div>';
			}
			buf += '</div>';

			buf += '<div class="col evslidercol"><div></div>';
			for (var i in stats) {
				buf += '<div><input type="slider" name="evslider-'+i+'" value="'+(set.evs[i]||'0')+'" min="0" max="252" step="4" class="evslider" /></div>';
			}
			buf += '</div>';

			buf += '<div class="col ivcol"><div><strong>IVs</strong></div>';
			var totalev = 0;
			if (!set.ivs) set.ivs = {};
			for (var i in stats) {
				if (typeof set.ivs[i] === 'undefined') set.ivs[i] = 31;
				var val = ''+(set.ivs[i]);
				buf += '<div><input type="number" name="iv-'+i+'" value="'+val+'" class="inputform numform" min="0" max="31" step="1" /></div>';
			}
			buf += '</div>';

			buf += '<div class="col statscol"><div></div>';
			for (var i in stats) {
				buf += '<div><b>'+stats[i]+'</b></div>';
			}
			buf += '</div>';

			buf += '<p style="clear:both">Nature: <select name="nature">';
			for (var i in BattleNatures) {
				var curNature = BattleNatures[i];
				buf += '<option value="'+i+'"'+(curNature===nature?'selected="selected"':'')+'>'+i;
				if (curNature.plus) {
					buf += ' (+'+BattleStatNames[curNature.plus]+', -'+BattleStatNames[curNature.minus]+')';
				}
				buf += '</option>';
			}
			buf += '</select></p>';

			buf += '<p><em>Protip:</em> You can also set natures by typing "+" and "-" next to a stat.</p>';

			buf += '</div>';
			this.$chart.html(buf);
			var self = this;
			this.suppressSliderCallback = true;
			app.clearGlobalListeners();
			this.$chart.find('.evslider').slider({
				from: 0,
				to: 252,
				step: 4,
				skin: 'round_plastic',
				onstatechange: function(val) {
					if (!self.suppressSliderCallback) self.statSlide(val, this);
				},
				callback: function() {
					self.save();
				}
			});
			this.suppressSliderCallback = false;
		},
		setStatFormGuesses: function() {
			this.updateStatForm(true);
		},
		setSlider: function(stat, val) {
			this.suppressSliderCallback = true;
			this.$chart.find('input[name=evslider-'+stat+']').slider('value', val||0);
			this.suppressSliderCallback = false;
		},
		updateNature: function() {
			var set = this.curSet;
			if (!set) return;

			if (this.plus === '' || this.minus === '') {
				set.nature = 'Serious';
			} else {
				for (var i in BattleNatures) {
					if (BattleNatures[i].plus === this.plus && BattleNatures[i].minus === this.minus) {
						set.nature = i;
						break;
					}
				}
			}
		},
		statChange: function(e) {
			var inputName = '';
			inputName = e.currentTarget.name;
			var val = Math.abs(parseInt(e.currentTarget.value, 10));
			var set = this.curSet;
			if (!set) return;

			if (inputName.substr(0,5) === 'stat-') {
				// EV
				// Handle + and -
				var stat = inputName.substr(5);
				if (!set.evs) set.evs = {};

				var lastchar = e.currentTarget.value.charAt(e.target.value.length-1);
				var firstchar = e.currentTarget.value.charAt(0);
				var natureChange = true;
				if ((lastchar === '+' || firstchar === '+') && stat !== 'hp') {
					if (this.plus && this.plus !== stat) this.$chart.find('input[name=stat-'+this.plus+']').val(set.evs[this.plus]||'');
					this.plus = stat;
				} else if ((lastchar === '-' || lastchar === "\u2212" || firstchar === '-' || firstchar === "\u2212") && stat !== 'hp') {
					if (this.minus && this.minus !== stat) this.$chart.find('input[name=stat-'+this.minus+']').val(set.evs[this.minus]||'');
					this.minus = stat;
				} else if (this.plus === stat) {
					this.plus = '';
				} else if (this.minus === stat) {
					this.minus = '';
				} else {
					natureChange = false;
				}
				if (natureChange) {
					this.updateNature();
				}

				// cap
				if (val > 252) val = 252;
				if (val < 0) val = 0;

				if (set.evs[stat] !== val || natureChange) {
					set.evs[stat] = val;
					this.setSlider(stat, val);
					this.updateStatGraph();
				}
			} else {
				// IV
				var stat = inputName.substr(3);

				if (val > 31) val = 31;
				if (val < 0) val = 0;

				if (!set.ivs) set.ivs = {};
				if (set.ivs[stat] !== val) {
					set.ivs[stat] = val;
					this.updateStatGraph();
				}
			}
		},
		statSlide: function(val, slider) {
			var stat = slider.inputNode[0].name.substr(9);
			var set = this.curSet;
			if (!set) return;
			val = +val;

			if (!this.ignoreEVLimits && set.evs) {
				var total = 0;
				for (var i in set.evs) {
					total += (i===stat?val:set.evs[i]);
				}
				if (total > 508 && val - total + 508 >= 0) {
					// don't allow dragging beyond 508 EVs
					val = val - total + 508;

					// Don't try this at home.
					// I am a trained professional.
					slider.o.pointers[0].set(val);
				}
			}

			if (!set.evs) set.evs = {};
			set.evs[stat] = val;

			val = ''+(val||'')+(this.plus===stat?'+':'')+(this.minus===stat?'-':'');
			this.$('input[name=stat-'+stat+']').val(val);

			this.updateStatGraph();
		},
		natureChange: function(e) {
			var set = this.curSet;
			if (!set) return;

			if (e) {
				set.nature = e.currentTarget.value;
			}
			this.plus = '';
			this.minus = '';
			var nature = BattleNatures[set.nature||'Serious'];
			for (var i in BattleStatNames) {
				var val = ''+(set.evs[i]||'');
				if (nature.plus === i) {
					this.plus = i;
					val += '+';
				}
				if (nature.minus === i) {
					this.minus = i;
					val += '-';
				}
				this.$chart.find('input[name=stat-'+i+']').val(val);
				if (!e) this.setSlider(i, set.evs[i]);
			}

			this.save();
			this.updateStatGraph();
		},

		/*********************************************************
		 * Set details form
		 *********************************************************/

		updateDetailsForm: function() {
			var buf = '';
			var set = this.curSet;
			var template = Tools.getTemplate(set.species);
			if (!set) return;
			buf += '<h3>Details</h3>';
			buf += '<form class="detailsform">';

			buf += '<div class="formrow"><label class="formlabel">Level:</label><div><input type="number" min="1" max="100" step="1" name="level" value="'+(set.level||100)+'" class="textbox inputform numform" /></div></div>';

			buf += '<div class="formrow"><label class="formlabel">Gender:</label><div>';
			if (template.gender) {
				var genderTable = {'M': "Male", 'F': "Female", 'N': "Genderless"};
				buf += genderTable[template.gender];
			} else {
				buf += '<label><input type="radio" name="gender" value="M"'+(set.gender==='M'?' checked':'')+' /> Male</label> ';
				buf += '<label><input type="radio" name="gender" value="F"'+(set.gender==='F'?' checked':'')+' /> Female</label> ';
				buf += '<label><input type="radio" name="gender" value="N"'+(!set.gender?' checked':'')+' /> Random</label>';
			}
			buf += '</div></div>';

			buf += '<div class="formrow"><label class="formlabel">Happiness:</label><div><input type="number" min="0" max="255" step="1" name="happiness" value="'+(typeof set.happiness==='number'?set.happiness:255)+'" class="textbox inputform numform" /></div></div>';

			buf += '<div class="formrow"><label class="formlabel">Shiny:</label><div>';
			buf += '<label><input type="radio" name="shiny" value="yes"'+(set.shiny?' checked':'')+' /> Yes</label> ';
			buf += '<label><input type="radio" name="shiny" value="no"'+(!set.shiny?' checked':'')+' /> No</label>';
			buf += '</div></div>';

			buf += '</form>';
			this.$chart.html(buf);
		},
		detailsChange: function() {
			var set = this.curSet;
			if (!set) return;

			// level
			var level = parseInt(this.$chart.find('input[name=level]').val(),10);
			if (!level || level > 100 || level < 1) level = 100;
			if (level !== 100 || set.level) set.level = level;

			// happiness
			var happiness = parseInt(this.$chart.find('input[name=happiness]').val(),10);
			if (happiness > 255) happiness = 255;
			if (happiness < 0) happiness = 255;
			set.happiness = happiness;
			if (set.happiness === 255) delete set.happiness;

			// shiny
			var shiny = (this.$chart.find('input[name=shiny]:checked').val() === 'yes');
			if (shiny) {
				set.shiny = true;
			} else {
				delete set.shiny;
			}

			var gender = this.$chart.find('input[name=gender]:checked').val();
			if (gender === 'M' || gender === 'F') {
				set.gender = gender;
			} else {
				delete set.gender;
			}

			// update details cell
			var buf = '';
			var GenderChart = {
				'M': 'Male',
				'F': 'Female',
				'N': '&mdash;'
			};
			buf += '<span class="detailcell detailcell-first"><label>Level</label>'+(set.level||100)+'</span>';
			buf += '<span class="detailcell"><label>Gender</label>'+GenderChart[set.gender||'N']+'</span>';
			buf += '<span class="detailcell"><label>Happiness</label>'+(typeof set.happiness==='number'?set.happiness:255)+'</span>';
			buf += '<span class="detailcell"><label>Shiny</label>'+(set.shiny?'Yes':'No')+'</span>';
			this.$('button[name=details]').html(buf);

			this.save();
			this.updatePokemonSprite();
		},

		/*********************************************************
		 * Set charts
		 *********************************************************/

		arrangeCallback: {
			pokemon: function(pokemon) {
				if (!pokemon) {
					if (this.curTeam) {
						if (this.curTeam.format === 'ou') return ['OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'cap') return ['CAP','OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'uu') return ['UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'ru') return ['RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'nu') return ['NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'lc') return ['LC'];
					}
					return ['OU','Uber','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC','Unreleased','CAP'];
				}
				var tierData = exports.BattleFormatsData[toId(pokemon.species)];
				if (!tierData) return 'Illegal';
				return tierData.tier;
			},
			item: function(item) {
				if (!item) return ['Items'];
				return 'Items';
			},
			ability: function(ability) {
				if (!this.curSet) return;
				if (!ability) return ['Abilities', 'Hidden Ability'];
				var template = Tools.getTemplate(this.curSet.species);
				if (!template.abilities) return 'Abilities';
				if (ability.name === template.abilities['0']) return 'Abilities';
				if (ability.name === template.abilities['1']) return 'Abilities';
				if (ability.name === template.abilities['H']) return 'Hidden Ability';
				if (!this.curTeam || this.curTeam.format !== 'hackmons') return 'Illegal';
			},
			move: function(move) {
				if (!this.curSet) return;
				if (!move) return ['Usable Moves', 'Moves', 'Usable Sketch Moves', 'Sketch Moves'];
				var movelist = this.movelist;
				if (!movelist) return 'Illegal';
				if (!movelist[move.id]) {
					if (movelist['sketch']) {
						if (move.isViable) return 'Usable Sketch Moves';
						else if (move.id !== 'chatter' && move.id !== 'struggle') return 'Sketch Moves';
					}
					if (!this.curTeam || this.curTeam.format !== 'hackmons') return 'Illegal';
				}
				var speciesid = toId(this.curSet.species);
				if (move.isViable) return 'Usable Moves';
				return 'Moves';
			}
		},

		chartTypes: {
			pokemon: 'pokemon',
			item: 'item',
			ability: 'ability',
			move1: 'move',
			move2: 'move',
			move3: 'move',
			move4: 'move',
			stats: 'stats',
			details: 'details'
		},
		chartClick: function(e) {
			this.chartSet($(e.currentTarget).data('name'), true);
		},
		chartKeydown: function(e) {
			var modifier = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.cmdKey);
			if (e.keyCode === 13 || (e.keyCode === 9 && !modifier)) {
				if (!this.arrangeCallback[this.curChartType]) return;
				e.stopPropagation();
				e.preventDefault();

				var name = e.currentTarget.name;
				this.$chart.html(Chart.chart(e.currentTarget.value, this.curChartType, false, _.bind(this.arrangeCallback[this.curChartType], this)));
				var val = Chart.firstResult;
				this.chartSet(val, true);
				return;
			}
		},
		chartKeyup: function() {
			this.updateChartDelayed();
		},
		chartFocus: function(e) {
			var $target = $(e.currentTarget);
			var name = e.currentTarget.name;
			var type = this.chartTypes[name];
			$target.removeClass('incomplete');

			if (this.curChartName === name) return;

			if (!this.curSet) {
				var i = +$target.closest('li').prop('value');
				this.curSet = this.curTeam.team[i];
				this.curSetLoc = i;
				this.update();
				if (type === 'stats' || type === 'details') {
					this.$('button[name='+name+']').click();
				} else {
					this.$('input[name='+name+']').select();
				}
				return;
			}

			this.curChartName = name;
			this.curChartType = type;
			this.updateChart();
		},
		chartChange: function(e) {
			var name = e.currentTarget.name;
			var type = this.chartTypes[name];
			this.$chart.html(Chart.chart(e.currentTarget.value, type, false, _.bind(this.arrangeCallback[this.curChartType], this)));
			var val = Chart.firstResult;
			var id = toId(e.currentTarget.value);
			if (toId(val) !== id) {
				$(e.currentTarget).addClass('incomplete');
				return;
			}
			this.chartSet(val);
		},
		chartSet: function(val, selectNext) {
			var inputName = this.curChartName;
			var id = toId(val);
			this.$('input[name='+inputName+']').val(val).removeClass('incomplete');
			switch (inputName) {
			case 'pokemon':
				this.setPokemon(val, selectNext);
				break;
			case 'item':
				this.curSet.item = val;
				this.updatePokemonSprite();
				if (selectNext) this.$('input[name=ability]').select();
				break;
			case 'ability':
				this.curSet.ability = val;
				if (selectNext) this.$('input[name=move1]').select();
				break;
			case 'move1':
				this.curSet.moves[0] = val;
				this.chooseMove(val);
				if (selectNext) this.$('input[name=move2]').select();
				break;
			case 'move2':
				if (!this.curSet.moves[0]) this.curSet.moves[0] = '';
				this.curSet.moves[1] = val;
				this.chooseMove(val);
				this.$('input[name=move3]').select();
				break;
			case 'move3':
				if (!this.curSet.moves[0]) this.curSet.moves[0] = '';
				if (!this.curSet.moves[1]) this.curSet.moves[1] = '';
				this.curSet.moves[2] = val;
				this.chooseMove(val);
				if (selectNext) this.$('input[name=move4]').select();
				break;
			case 'move4':
				if (!this.curSet.moves[0]) this.curSet.moves[0] = '';
				if (!this.curSet.moves[1]) this.curSet.moves[1] = '';
				if (!this.curSet.moves[2]) this.curSet.moves[2] = '';
				this.curSet.moves[3] = val;
				this.chooseMove(val);
				if (selectNext) this.stats();
				break;
			}
			this.save();
		},
		chooseMove: function(move) {
			var set = this.curSet;
			if (!set) return;
			if (move.substr(0,13) === 'Hidden Power ') {
				set.ivs = {};
				for (var i in exports.BattleTypeChart[move.substr(13)].HPivs) {
					set.ivs[i] = exports.BattleTypeChart[move.substr(13)].HPivs[i];
				}
				var moves = this.curSet.moves;
				for (var i = 0; i < moves.length; ++i) {
					if (moves[i] === 'Gyro Ball' || moves[i] === 'Trick Room') set.ivs['spe'] = set.ivs['spe'] % 4;
				}
			} else if (move === 'Gyro Ball' || move === 'Trick Room') {
				var hasHiddenPower = false;
				var moves = this.curSet.moves;
				for (var i = 0; i < moves.length; ++i) {
					if (moves[i].substr(0,13) === 'Hidden Power ') hasHiddenPower = true;
				}
				set.ivs['spe'] = hasHiddenPower ? set.ivs['spe'] % 4 : 0;
			} else if (move === 'Return') {
				this.curSet.happiness = 255;
			} else if (move === 'Frustration') {
				this.curSet.happiness = 0;
			}
		},
		setPokemon: function(val, selectNext) {
			var set = this.curSet;
			var template = Tools.getTemplate(val);
			var newPokemon = !set.species;
			if (!template.exists || set.species === template.species) return;

			set.name = template.species;
			set.species = val;
			if (set.level) delete set.level;
			if (this.curTeam && this.curTeam.format === 'lc') set.level = 5;
			if (set.gender) delete set.gender;
			if (template.gender && template.gender !== 'N') set.gender = template.gender;
			if (set.happiness) delete set.happiness;
			if (set.shiny) delete set.shiny;
			set.item = '';
			set.ability = template.abilities['0'];
			set.moves = [];
			set.evs = {};
			set.ivs = {};
			set.nature = '';
			this.updateSetTop();
			if (selectNext) this.$('input[name=item]').select();
		},

		/*********************************************************
		 * Utility functions
		 *********************************************************/

		// EV guesser

		guessRole: function() {
			var set = this.curSet;
			if (!set) return '?';
			if (!set.moves) return '?';

			var moveCount = {
				'Physical': 0,
				'Special': 0,
				'PhysicalOffense': 0,
				'SpecialOffense': 0,
				'PhysicalSetup': 0,
				'SpecialSetup': 0,
				'Support': 0,
				'Setup': 0,
				'Restoration': 0,
				'Offense': 0,
				'Stall': 0,
				'SpecialStall': 0,
				'PhysicalStall': 0,
				'Ultrafast': 0
			};
			var hasMove = {};
			var template = Tools.getTemplate(set.species || set.name);
			var stats = template.baseStats;
			var itemid = toId(set.item);
			var abilityid = toId(set.ability);

			if (set.moves.length < 4 && template.id !== 'unown' && template.id !== 'ditto') return '?';

			for (var i=0,len=set.moves.length; i<len; i++) {
				var move = Tools.getMove(set.moves[i]);
				hasMove[move.id] = 1;
				if (move.category === 'Status') {
					if (move.id === 'batonpass' || move.id === 'healingwish' || move.id === 'lunardance') {
						moveCount['Support']++;
					} else if (move.id === 'naturepower') {
						moveCount['Special']++;
					} else if (move.id === 'protect' || move.id === 'detect' || move.id === 'spikyshield' || move.id === 'kingsshield') {
						moveCount['Stall']++;
					} else if (move.id === 'wish') {
						moveCount['Restoration']++;
						moveCount['Stall']++;
						moveCount['Support']++;
					} else if (move.heal) {
						moveCount['Restoration']++;
						moveCount['Stall']++;
					} else if (move.target === 'self') {
						if (move.id === 'agility' || move.id === 'rockpolish' || move.id === 'shellsmash' || move.id === 'growth' || move.id === 'workup') {
							moveCount['PhysicalSetup']++;
							moveCount['SpecialSetup']++;
						} else if (move.id === 'dragondance' || move.id === 'swordsdance' || move.id === 'coil' || move.id === 'bulkup' || move.id === 'curse' || move.id === 'bellydrum') {
							moveCount['PhysicalSetup']++;
						} else if (move.id === 'nastyplot' || move.id === 'tailglow' || move.id === 'quiverdance' || move.id === 'calmmind' || move.id === 'geomancy') {
							moveCount['SpecialSetup']++;
						}
						if (move.id === 'substitute') moveCount['Stall']++;
						moveCount['Setup']++;
					} else {
						if (move.id === 'toxic' || move.id === 'leechseed' || move.id === 'willowisp') moveCount['Stall']++;
						moveCount['Support']++;
					}
				} else if (move.id === 'rapidspin' || move.id === 'counter' || move.id === 'mirrorcoat' || move.id === 'metalburst') {
					moveCount['Support']++;
				} else if (move.id === 'nightshade' || move.id === 'seismictoss' || move.id === 'foulplay' || move.id === 'finalgambit') {
					moveCount['Offense']++;
				} else if (move.id === 'fellstinger') {
					moveCount['PhysicalSetup']++;
					moveCount['Setup']++;
				} else {
					moveCount[move.category]++;
					moveCount['Offense']++;
					if (move.id === 'knockoff') moveCount['Support']++;
					if (move.id === 'scald' || move.id === 'voltswitch' || move.id === 'uturn') moveCount[move.category] -= 0.2;
				}
			}
			if (hasMove['batonpass']) moveCount['Support'] += moveCount['Setup'];
			moveCount['PhysicalAttack'] = moveCount['Physical'];
			moveCount['Physical'] += moveCount['PhysicalSetup'];
			moveCount['SpecialAttack'] = moveCount['Special'];
			moveCount['Special'] += moveCount['SpecialSetup'];

			if (hasMove['dragondance'] || hasMove['quiverdance']) moveCount['Ultrafast'] = 1;

			var isFast = (stats.spe > 95);
			var physicalBulk = (stats.hp+75)*(stats.def+87);
			var specialBulk = (stats.hp+75)*(stats.spd+87);

			if (hasMove['willowisp'] || hasMove['acidarmor'] || hasMove['irondefense'] || hasMove['cottonguard']) {
				physicalBulk *= 1.6;
				moveCount['PhysicalStall']++;
			}
			else if (hasMove['scald'] || hasMove['bulkup'] || hasMove['coil'] || hasMove['cosmicpower']) {
				physicalBulk *= 1.3;
				if (hasMove['scald']) { // partial stall goes in reverse
					moveCount['SpecialStall']++;
				} else {
					moveCount['PhysicalStall']++;
				}
			}
			if (abilityid === 'flamebody') physicalBulk *= 1.1;

			if (hasMove['calmmind'] || hasMove['quiverdance'] || hasMove['geomancy']) {
				specialBulk *= 1.3;
				moveCount['SpecialStall']++;
			}
			if (template.id === 'tyranitar') specialBulk *= 1.5;

			if (hasMove['bellydrum']) {
				physicalBulk *= 0.6;
				specialBulk *= 0.6;
			}
			if (moveCount['Restoration']) {
				physicalBulk *= 1.5;
				specialBulk *= 1.5;
			} else if (hasMove['painsplit'] && hasMove['substitute']) {
				// SubSplit isn't generally a stall set
				moveCount['Stall']--;
			} else if (hasMove['painsplit'] || hasMove['rest']) {
				physicalBulk *= 1.4;
				specialBulk *= 1.4;
			}
			if ((hasMove['bodyslam'] || hasMove['thunder']) && abilityid === 'serenegrace' || hasMove['thunderwave']) {
				physicalBulk *= 1.1;
				specialBulk *= 1.1;
			}
			if ((hasMove['ironhead'] || hasMove['airslash']) && abilityid === 'serenegrace') {
				physicalBulk *= 1.1;
				specialBulk *= 1.1;
			}
			if (hasMove['gigadrain'] || hasMove['drainpunch'] || hasMove['hornleech']) {
				physicalBulk *= 1.15;
				specialBulk *= 1.15;
			}
			if (itemid === 'leftovers' || itemid === 'blacksludge') {
				physicalBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
				specialBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
			}
			if (hasMove['leechseed']) {
				physicalBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
				specialBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
			}
			if ((itemid === 'flameorb' || itemid === 'toxicorb') && abilityid !== 'magicguard') {
				if (itemid === 'toxicorb' && abilityid === 'poisonheal') {
					physicalBulk *= 1 + 0.1*(2+moveCount['Stall']);
					specialBulk *= 1 + 0.1*(2+moveCount['Stall']);
				} else {
					physicalBulk *= 0.8;
					specialBulk *= 0.8;
				}
			}
			if (itemid === 'lifeorb') {
				physicalBulk *= 0.9;
				specialBulk *= 0.9;
			}
			if (abilityid === 'multiscale' || abilityid === 'magicguard' || abilityid === 'regenerator') {
				physicalBulk *= 1.4;
				specialBulk *= 1.4;
			}
			if (itemid === 'eviolite') {
				physicalBulk *= 1.5;
				specialBulk *= 1.5;
			}
			if (itemid === 'assaultvest') specialBulk *= 1.5;

			var bulk = physicalBulk + specialBulk;
			if (bulk < 46000 && stats.spe >= 70) isFast = true;
			moveCount['bulk'] = bulk;
			moveCount['physicalBulk'] = physicalBulk;
			moveCount['specialBulk'] = specialBulk;

			if (hasMove['agility'] || hasMove['dragondance'] || hasMove['quiverdance'] || hasMove['rockpolish'] || hasMove['shellsmash'] || hasMove['flamecharge']) {
				isFast = true;
			} else if (abilityid === 'unburden' || abilityid === 'speedboost' || abilityid === 'motordrive') {
				isFast = true;
				moveCount['Ultrafast'] = 1;
			} else if (abilityid === 'chlorophyll' || abilityid === 'swiftswim' || abilityid === 'sandrush') {
				isFast = true;
				moveCount['Ultrafast'] = 2;
			}
			if (hasMove['agility'] || hasMove['shellsmash'] || hasMove['autotomize'] || hasMove['shiftgear'] || hasMove['rockpolish']) moveCount['Ultrafast'] = 2;
			moveCount['Fast'] = isFast?1:0;

			this.moveCount = moveCount;
			this.hasMove = hasMove;

			if (template.id === 'ditto') return abilityid==='imposter'?'Physically Defensive':'Fast Bulky Support';
			if (template.id === 'shedinja') return 'Fast Physical Sweeper';

			if (itemid === 'choiceband' && moveCount['PhysicalAttack'] >= 2) {
				if (!isFast) return 'Bulky Band';
				return 'Fast Band';
			} else if (itemid === 'choicespecs' && moveCount['SpecialAttack'] >= 2) {
				if (!isFast) return 'Bulky Specs';
				return 'Fast Specs';
			} else if (itemid === 'choicescarf') {
				if (moveCount['PhysicalAttack'] === 0) return 'Special Scarf';
				if (moveCount['SpecialAttack'] === 0) return 'Physical Scarf';
				if (moveCount['PhysicalAttack'] > moveCount['SpecialAttack']) return 'Physical Biased Mixed Scarf';
				if (moveCount['PhysicalAttack'] < moveCount['SpecialAttack']) return 'Special Biased Mixed Scarf';
				if (stats.atk < stats.spa) return 'Special Biased Mixed Scarf';
				return 'Physical Biased Mixed Scarf';
			}

			if (template.id === 'unown') return 'Fast Special Sweeper';

			if (moveCount['PhysicalStall'] && moveCount['Restoration']) {
				return 'Specially Defensive';
			}
			if (moveCount['SpecialStall'] && moveCount['Restoration']) {
				return 'Physically Defensive';
			}

			var offenseBias = '';
			if (stats.spa > stats.atk && moveCount['Special'] > 1) offenseBias = 'Special';
			else if (stats.spa > stats.atk && moveCount['Special'] > 1) offenseBias = 'Special';
			else if (moveCount['Special'] > moveCount['Physical']) offenseBias = 'Special';
			else offenseBias = 'Physical';
			var offenseStat = stats[offenseBias === 'Special'?'spa':'atk'];

			if (moveCount['Stall'] + moveCount['Support'] <= 2 && bulk < 135000 && moveCount[offenseBias] >= 2) {
				if (isFast) {
					if (bulk > 80000 && !moveCount['Ultrafast']) return 'Bulky '+offenseBias+' Sweeper';
					return 'Fast '+offenseBias+' Sweeper';
				} else {
					if (moveCount[offenseBias] >= 3 || moveCount['Stall'] <= 0) {
						return 'Bulky '+offenseBias+' Sweeper';
					}
				}
			}

			if (isFast) {
				if (stats.spe > 100 || bulk < 55000 || moveCount['Ultrafast']) {
					return 'Fast Bulky Support';
				}
			}
			if (moveCount['SpecialStall']) return 'Physically Defensive';
			if (moveCount['PhysicalStall']) return 'Specially Defensive';
			if (template.id === 'blissey' || template.id === 'chansey') return 'Physically Defensive';
			if (specialBulk >= physicalBulk) return 'Specially Defensive';
			return 'Physically Defensive';
		},
		ensureMinEVs: function(evs, stat, min, evTotal) {
			if (!evs[stat]) evs[stat] = 0;
			var diff = min - evs[stat];
			if (diff <= 0) return evTotal;
			if (evTotal <= 504) {
				var change = Math.min(508 - evTotal, diff);
				evTotal += change;
				evs[stat] += change;
				diff -= change;
			}
			if (diff <= 0) return evTotal;
			var evPriority = {def:1, spd:1, hp:1, atk:1, spa:1, spe:1};
			for (var i in evPriority) {
				if (i === stat) continue;
				if (evs[i] && evs[i] > 128) {
					evs[i] -= diff;
					evs[stat] += diff;
					return evTotal;
				}
			}
			return evTotal; // can't do it :(
		},
		ensureMaxEVs: function(evs, stat, min, evTotal) {
			if (!evs[stat]) evs[stat] = 0;
			var diff = evs[stat] - min;
			if (diff <= 0) return evTotal;
			evs[stat] -= diff;
			evTotal -= diff;
			return evTotal; // can't do it :(
		},
		guessEVs: function(role) {
			var set = this.curSet;
			if (!set) return {};
			var template = Tools.getTemplate(set.species || set.name);
			var stats = template.baseStats;

			var hasMove = this.hasMove;
			var moveCount = this.moveCount;

			var evs = {};
			var plusStat = '';
			var minusStat = '';

			var statChart = {
				'Bulky Band': ['atk', 'hp'],
				'Fast Band': ['spe', 'atk'],
				'Bulky Specs': ['spa', 'hp'],
				'Fast Specs': ['spe', 'spa'],
				'Physical Scarf': ['spe', 'atk'],
				'Special Scarf': ['spe', 'spa'],
				'Physical Biased Mixed Scarf': ['spe', 'atk'],
				'Special Biased Mixed Scarf': ['spe', 'spa'],
				'Fast Physical Sweeper': ['spe', 'atk'],
				'Fast Special Sweeper': ['spe', 'spa'],
				'Bulky Physical Sweeper': ['atk', 'hp'],
				'Bulky Special Sweeper': ['spa', 'hp'],
				'Fast Bulky Support': ['spe', 'hp'],
				'Physically Defensive': ['def', 'hp'],
				'Specially Defensive': ['spd', 'hp']
			};

			plusStat = statChart[role][0];
			if (role === 'Fast Bulky Support') moveCount['Ultrafast'] = 0;
			if (plusStat === 'spe' && (moveCount['Ultrafast'] || evs['spe'] < 252)) {
				if (statChart[role][1] === 'atk' || statChart[role][1] == 'spa') {
					plusStat = statChart[role][1];
				} else if (moveCount['Physical'] >= 3) {
					plusStat = 'atk';
				} else if (stats.spd > stats.def) {
					plusStat = 'spd';
				} else {
					plusStat = 'def';
				}
			}

			this.ignoreEVLimits = (this.curTeam.format === 'hackmons' || this.curTeam.format === 'balancedhackmons');
			if (this.curTeam && this.ignoreEVLimits) {
				evs = {hp:252, atk:252, def:252, spa:252, spd:252, spe:252};
				if (hasMove['gyroball'] || hasMove['trickroom']) delete evs.spe;
			} else {
				if (!statChart[role]) return {};

				var evTotal = 0;

				var i = statChart[role][0];
				var stat = this.getStat(i, null, 252, plusStat===i?1.1:1.0);
				var ev = 252;
				while (stat <= this.getStat(i, null, ev-4, plusStat===i?1.1:1.0)) ev -= 4;
				evs[i] = ev;
				evTotal += ev;

				var i = statChart[role][1];
				if (i === 'hp' && set.level && set.level < 20) i = 'spd';
				var stat = this.getStat(i, null, 252, plusStat===i?1.1:1.0);
				var ev = 252;
				if (i === 'hp' && (hasMove['substitute'] || hasMove['transform']) && stat == Math.floor(stat/4)*4) stat -= 1;
				while (stat <= this.getStat(i, null, ev-4, plusStat===i?1.1:1.0)) ev -= 4;
				evs[i] = ev;
				evTotal += ev;

				if (template.id === 'tentacruel') evTotal = this.ensureMinEVs(evs, 'spe', 16, evTotal);
				if (template.id === 'skarmory') evTotal = this.ensureMinEVs(evs, 'spe', 24, evTotal);
				if (template.id === 'jirachi') evTotal = this.ensureMinEVs(evs, 'spe', 32, evTotal);
				if (template.id === 'celebi') evTotal = this.ensureMinEVs(evs, 'spe', 36, evTotal);
				if (template.id === 'volcarona') evTotal = this.ensureMinEVs(evs, 'spe', 52, evTotal);
				if (template.id === 'gliscor') evTotal = this.ensureMinEVs(evs, 'spe', 72, evTotal);
				if (stats.spe == 97) evTotal = this.ensureMaxEVs(evs, 'spe', 220, evTotal);
				if (template.id === 'dragonite' && evs['hp']) evTotal = this.ensureMaxEVs(evs, 'spe', 220, evTotal);
				if (evTotal < 508) {
					var remaining = 508 - evTotal;
					if (remaining > 252) remaining = 252;
					if (!evs['atk'] && moveCount['PhysicalAttack']) {
						evs['atk'] = remaining;
					} else if (!evs['spa'] && moveCount['SpecialAttack']) {
						evs['spa'] = remaining;
					} else if (stats.hp == 1 && !evs['def']) {
						evs['def'] = remaining;
					} else if (stats.def === stats.spd && !evs['spd']) {
						evs['spd'] = remaining;
					} else if (!evs['hp'] && !(set.level && set.level < 20)) {
						evs['hp'] = remaining;
					} else if (!evs['spd']) {
						evs['spd'] = remaining;
					} else if (!evs['def']) {
						evs['def'] = remaining;
					}
				}

			}

			if (hasMove['gyroball'] || hasMove['trickroom']) {
				minusStat = 'spe';
			} else if (!moveCount['PhysicalAttack']) {
				minusStat = 'atk';
			} else if (!moveCount['SpecialAttack']) {
				minusStat = 'spa';
			} else if (stats.def > stats.spd) {
				minusStat = 'spd';
			} else {
				minusStat = 'def';
			}

			if (plusStat === minusStat) {
				minusStat = (plusStat==='spe' ? 'spd' : 'spe');
			}

			evs.plusStat = plusStat;
			evs.minusStat = minusStat;

			return evs;
		},

		// Stat calculator

		getStat: function(stat, set, evOverride, natureOverride) {
			if (!set) set = this.curSet;
			if (!set) return 0;

			if (!set.ivs) set.ivs = {
				hp: 31,
				atk: 31,
				def: 31,
				spa: 31,
				spd: 31,
				spe: 31
			};
			if (!set.evs) set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};

			// do this after setting set.evs because it's assumed to exist
			// after getStat is run
			var template = Tools.getTemplate(set.species);
			if (!template.exists) return 0;

			if (!set.level) set.level = 100;
			if (typeof set.ivs[stat] === 'undefined') set.ivs[stat] = 31;

			if (stat === 'hp') {
				if (template.baseStats['hp'] === 1) return 1;
				return Math.floor(Math.floor(2*template.baseStats['hp']+(set.ivs['hp']||0)+Math.floor((evOverride||set.evs['hp']||0)/4)+100)*set.level / 100 + 10);
			}
			var val = Math.floor(Math.floor(2*template.baseStats[stat]+(set.ivs[stat]||0)+Math.floor((evOverride||set.evs[stat]||0)/4))*set.level / 100 + 5);
			if (natureOverride) {
				val *= natureOverride;
			} else if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === stat) {
				val *= 1.1;
			} else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === stat) {
				val *= 0.9;
			}
			return Math.floor(val);
		},

		// initialization

		buildMovelists: function() {
			if (!window.BattlePokedex) return;
			Tools.movelists = {};
			Tools.g6movelists = {};
			for (var pokemon in window.BattlePokedex) {
				var template = Tools.getTemplate(pokemon);
				var moves = {};
				var g6moves = {};
				var alreadyChecked = {};
				do {
					alreadyChecked[template.speciesid] = true;
					if (template.learnset) {
						for (var l in template.learnset) {
							moves[l] = true;
							if (template.learnset[l].length) g6moves[l] = true;
						}
					}
					if (template.speciesid === 'shaymin') {
						template = Tools.getTemplate('shayminsky');
					} else if (toId(template.baseSpecies) !== toId(template.species) && toId(template.baseSpecies) !== 'kyurem') {
						template = Tools.getTemplate(template.baseSpecies);
					} else {
						template = Tools.getTemplate(template.prevo);
					}
				} while (template && template.species && !alreadyChecked[template.speciesid]);
				Tools.movelists[pokemon] = moves;
				Tools.g6movelists[pokemon] = g6moves;
			}
		},
		destroy: function() {
			app.clearGlobalListeners();
			Room.prototype.destroy.call(this);
		}
	}, {
		// text import/export

		parseText: function(text, teams) {
			var text = text.split("\n");
			var team = [];
			var curSet = null;
			if (teams === true) {
				Storage.teams = [];
				teams = Storage.teams;
			}
			for (var i=0; i<text.length; i++) {
				var line = $.trim(text[i]);
				if (line === '' || line === '---') {
					curSet = null;
				} else if (line.substr(0, 3) === '===' && teams) {
					team = [];
					line = $.trim(line.substr(3, line.length-6));
					var format = '';
					var bracketIndex = line.indexOf(']');
					if (bracketIndex >= 0) {
						format = line.substr(1, bracketIndex-1);
						line = $.trim(line.substr(bracketIndex+1));
					}
					teams.push({
						name: line,
						format: format,
						team: team
					});
				} else if (!curSet) {
					curSet = {name: '', species: '', gender: ''};
					team.push(curSet);
					var atIndex = line.lastIndexOf(' @ ');
					if (atIndex !== -1) {
						curSet.item = line.substr(atIndex+3);
						line = line.substr(0, atIndex);
					}
					if (line.substr(line.length-4) === ' (M)') {
						curSet.gender = 'M';
						line = line.substr(0, line.length-4);
					}
					if (line.substr(line.length-4) === ' (F)') {
						curSet.gender = 'F';
						line = line.substr(0, line.length-4);
					}
					var parenIndex = line.lastIndexOf(' (');
					if (line.substr(line.length-1) === ')' && parenIndex !== -1) {
						line = line.substr(0, line.length-1);
						curSet.species = Tools.getTemplate(line.substr(parenIndex+2)).name;
						line = line.substr(0, parenIndex);
						curSet.name = line;
					} else {
						curSet.species = Tools.getTemplate(line).name;
						curSet.name = curSet.species;
					}
				} else if (line.substr(0, 7) === 'Trait: ') {
					line = line.substr(7);
					curSet.ability = line;
				} else if (line.substr(0, 9) === 'Ability: ') {
					line = line.substr(9);
					curSet.ability = line;
				} else if (line === 'Shiny: Yes') {
					curSet.shiny = true;
				} else if (line.substr(0, 7) === 'Level: ') {
					line = line.substr(7);
					curSet.level = +line;
				} else if (line.substr(0, 11) === 'Happiness: ') {
					line = line.substr(11);
					curSet.happiness = +line;
				} else if (line.substr(0, 9) === 'Ability: ') {
					line = line.substr(9);
					curSet.ability = line;
				} else if (line.substr(0, 5) === 'EVs: ') {
					line = line.substr(5);
					var evLines = line.split('/');
					curSet.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
					for (var j=0; j<evLines.length; j++) {
						var evLine = $.trim(evLines[j]);
						var spaceIndex = evLine.indexOf(' ');
						if (spaceIndex === -1) continue;
						var statid = BattleStatIDs[evLine.substr(spaceIndex+1)];
						var statval = parseInt(evLine.substr(0, spaceIndex));
						if (!statid) continue;
						curSet.evs[statid] = statval;
					}
				} else if (line.substr(0, 5) === 'IVs: ') {
					line = line.substr(5);
					var ivLines = line.split(' / ');
					curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
					for (var j=0; j<ivLines.length; j++) {
						var ivLine = ivLines[j];
						var spaceIndex = ivLine.indexOf(' ');
						if (spaceIndex === -1) continue;
						var statid = BattleStatIDs[ivLine.substr(spaceIndex+1)];
						var statval = parseInt(ivLine.substr(0, spaceIndex));
						if (!statid) continue;
						curSet.ivs[statid] = statval;
					}
				} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
					var natureIndex = line.indexOf(' Nature');
					if (natureIndex === -1) natureIndex = line.indexOf(' nature');
					if (natureIndex === -1) continue;
					line = line.substr(0, natureIndex);
					curSet.nature = line;
				} else if (line.substr(0,1) === '-' || line.substr(0,1) === '~') {
					line = line.substr(1);
					if (line.substr(0,1) === ' ') line = line.substr(1);
					if (!curSet.moves) curSet.moves = [];
					if (line.substr(0,14) === 'Hidden Power [') {
						var hptype = line.substr(14, line.length-15);
						line = 'Hidden Power ' + hptype;
						if (!curSet.ivs && window.BattleTypeChart) {
							curSet.ivs = {};
							for (var stat in window.BattleTypeChart[hptype].HPivs) {
								curSet.ivs[stat] = window.BattleTypeChart[hptype].HPivs[stat];
							}
						}
					}
					if (line === 'Frustration') {
						curSet.happiness = 0;
					}
					curSet.moves.push(line);
				}
			}
			return team;
		},
		teamsToText: function() {
			var buf = '';
			for (var i=0,len=teams.length; i<len; i++) {
				var team = teams[i];
				buf += '=== '+(team.format?'['+team.format+'] ':'')+team.name+' ===\n\n';
				buf += TeambuilderRoom.toText(team.team);
				buf += '\n';
			}
			return buf;
		},
		toText: function(team) {
			var text = '';
			for (var i=0; i<team.length; i++) {
				var curSet = team[i];
				if (curSet.name !== curSet.species) {
					text += ''+curSet.name+' ('+curSet.species+')';
				} else {
					text += ''+curSet.species;
				}
				if (curSet.gender === 'M') text += ' (M)';
				if (curSet.gender === 'F') text += ' (F)';
				if (curSet.item) {
					text += ' @ '+curSet.item;
				}
				text += "\n";
				if (curSet.ability) {
					text += 'Ability: '+curSet.ability+"\n";
				}
				if (curSet.level && curSet.level != 100) {
					text += 'Level: '+curSet.level+"\n";
				}
				if (curSet.shiny) {
					text += 'Shiny: Yes\n';
				}
				if (typeof curSet.happiness === 'number' && curSet.happiness !== 255) {
					text += 'Happiness: '+curSet.happiness+"\n";
				}
				var first = true;
				if (curSet.evs) {
					for (var j in BattleStatNames) {
						if (!curSet.evs[j]) continue;
						if (first) {
							text += 'EVs: ';
							first = false;
						} else {
							text += ' / ';
						}
						text += ''+curSet.evs[j]+' '+BattleStatNames[j];
					}
				}
				if (!first) {
					text += "\n";
				}
				if (curSet.nature) {
					text += ''+curSet.nature+' Nature'+"\n";
				}
				var first = true;
				if (curSet.ivs) {
					var defaultIvs = true;
					var hpType = false;
					for (var j=0; j<curSet.moves.length; j++) {
						var move = curSet.moves[j];
						if (move.substr(0,13) === 'Hidden Power ' && move.substr(0,14) !== 'Hidden Power [') {
							hpType = move.substr(13);
							if (!exports.BattleTypeChart[hpType].HPivs) {
								alert("That is not a valid Hidden Power type.");
								continue;
							}
							for (var stat in BattleStatNames) {
								if ((curSet.ivs[stat]===undefined?31:curSet.ivs[stat]) !== (exports.BattleTypeChart[hpType].HPivs[stat]||31)) {
									defaultIvs = false;
									break;
								}
							}
						}
					}
					if (defaultIvs && !hpType) {
						for (var stat in BattleStatNames) {
							if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined) {
								defaultIvs = false;
								break;
							}
						}
					}
					if (!defaultIvs) {
						for (var stat in BattleStatNames) {
							if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
							if (first) {
								text += 'IVs: ';
								first = false;
							} else {
								text += ' / ';
							}
							text += ''+curSet.ivs[stat]+' '+BattleStatNames[stat];
						}
					}
				}
				if (!first) {
					text += "\n";
				}
				if (curSet.moves) for (var j=0; j<curSet.moves.length; j++) {
					var move = curSet.moves[j];
					if (move.substr(0,13) === 'Hidden Power ') {
						move = move.substr(0,13) + '[' + move.substr(13) + ']';
					}
					text += '- '+move+"\n";
				}
				text += "\n";
			}
			return text;
		}
	});

	var MovePopup = exports.MovePopup = Popup.extend({
		initialize: function(data) {
			var buf = '<ul class="popupmenu">';
			this.i = data.i;
			this.team = data.team;
			for (var i=0; i<data.team.length; i++) {
				var set = data.team[i];
				if (i !== data.i && i !== data.i+1) {
					buf += '<li><button name="moveHere" value="'+i+'"><i class="icon-arrow-right"></i> Move here</button></li>';
				}
				buf += '<li'+(i===data.i?' style="opacity:.3"':' style="opacity:.6"')+'><span class="pokemonicon" style="display:inline-block;vertical-align:middle;'+Tools.getIcon(set)+'"></span> '+Tools.escapeHTML(set.name)+'</li>';
			}
			if (i !== data.i && i !== data.i+1) {
				buf += '<li><button name="moveHere" value="'+i+'"><i class="icon-arrow-right"></i> Move here</button></li>';
			}
			buf += '</ul>';
			this.$el.html(buf);
		},
		moveHere: function(i) {
			this.close();
			i = +i;

			var movedSet = this.team.splice(this.i, 1)[0];

			if (i > this.i) i--;
			this.team.splice(i, 0, movedSet);

			app.rooms['teambuilder'].save();
			if (app.rooms['teambuilder'].curSet) {
				app.rooms['teambuilder'].curSetLoc = i;
				app.rooms['teambuilder'].update();
				app.rooms['teambuilder'].updateChart();
			} else {
				app.rooms['teambuilder'].update();
			}
		}
	});

})(window, jQuery);
