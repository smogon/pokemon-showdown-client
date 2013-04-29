(function($) {

	// this is a useful global
	var teams;

	var TeambuilderRoom = this.TeambuilderRoom = this.Room.extend({
		initialize: function() {
			teams = app.user.teams;

			// left menu
			this.$el.addClass('ps-room-light');
			app.on('init:loadteams', this.update, this);
			this.update();
		},
		focus: function() {
			if (!Tools.movelists) {
				this.buildMovelists();
			}
		},
		events: {
			'click button': 'dispatchClick',

			// teambuilder events
			'keydown .chartinput': 'chartKeydown'
		},
		dispatchClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (this[e.currentTarget.value]) this[e.currentTarget.value].call(this, e);
		},
		saveTeams: function() {
			TeambuilderRoom.saveTeams();
			this.update();
		},
		back: function() {
			if (this.exportMode) {
				this.exportMode = false;
			} else if (this.curSet) {
				this.curSet = null;
			} else if (this.curTeam) {
				this.curTeam = null;
			} else {
				return;
			}
			this.saveTeams();
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
			teams = app.user.teams;
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
			var teams = app.user.teams;
			var buf = '';

			if (this.exportMode) {
				buf = '<div class="pad"><button value="back"><i class="icon-chevron-left"></i> Team List</button> <button value="saveBackup" class="savebutton"><i class="icon-save"></i> Save</button></div>';
				buf += '<textarea class="teamedit textbox" rows="17">'+Tools.escapeHTML(this.teamsToText())+'</textarea>';
				this.$el.html(buf);
				return;
			}

			buf = '<div class="pad"><p>lol zarel this is a horrible teambuilder</p>'
			if (!teams) {
				buf += '<p>that\'s because we\'re not done loading it...</p></div>';
				this.$el.html(buf);
				return;
			}
			buf += '<p>i know stfu im not done with it</p>'
			buf += '<ul>';
			if (!teams.length) {
				if (this.deletedTeamLoc >= 0) {
					buf += '<li><button value="undoDelete"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				buf += '<li><em>you don\'t have any teams lol</em></li>';
			} else for (var i=0; i<teams.length+1; i++) {
				if (i === this.deletedTeamLoc) {
					buf += '<li><button value="undoDelete"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				if (i >= teams.length) break;

				if (i==2 && app.user.cookieTeams) {
					buf += '<li>== UNSAVED TEAM LINE ==<br /><small>All teams below this line will not be saved.</small></li>';
				}

				var team = teams[i];

				var formatText = '';
				if (team.format) {
					formatText = '['+team.format+'] ';
				}

				buf += '<li><button value="edit" data-i="'+i+'" style="width:400px">'+formatText+'<strong>'+Tools.escapeHTML(team.name)+'</strong><br /><small>';
				for (var j=0; j<team.team.length; j++) {
					if (j!=0) buf += ' / ';
					buf += ''+Tools.escapeHTML(team.team[j].name);
				}
				buf += '</small></button> <button value="edit" data-i="'+i+'"><i class="icon-pencil"></i>Edit</button> <button value="delete" data-i="'+i+'"><i class="icon-trash"></i>Delete</button></li>';
			}
			buf += '</ul>';

			buf += '<button value="new"><i class="icon-plus-sign"></i> New team</button>';
			buf += ' <button value="import"><i class="icon-upload-alt"></i> Import from PO</button> <button value="backup"><i class="icon-upload-alt"></i> Backup/Restore</button>';

			buf += '<p><strong>Clearing your cookies or <code>localStorage</code> will delete your teams.</strong></p><p>If you want to clear your cookies or <code>localStorage</code>, you can use the Backup/Restore feature to save your teams as text first.</p>';

			if (teams.length >= 2 && app.user.cookieTeams) {
				buf += ' <strong>WARNING:</strong> Additional teams WILL NOT BE SAVED.';
			}
			buf += '</div>';

			this.$el.html(buf);
		},
		// button actions
		edit: function(e) {
			var i = +$(e.currentTarget).data('i');
			this.curTeam = teams[i];
			this.curTeamIndex = i;
			this.update();
		},
		delete: function(e) {
			var i = +$(e.currentTarget).data('i');
			this.deletedTeamLoc = i;
			this.deletedTeam = teams.splice(i, 1)[0];
			this.saveTeams();
		},
		undoDelete: function() {
			if (this.deletedTeamLoc >= 0) {
				teams.splice(this.deletedTeamLoc, 0, this.deletedTeam);
				this.deletedTeam = null;
				this.deletedTeamLoc = -1;
				this.saveTeams();
			}
		},
		saveBackup: function() {
			this.parseText(this.$('.teamedit').val(), true);
			this.back();
		},
		new: function() {
			var newTeam = {
				name: 'Untitled '+(teams.length+1),
				team: []
			};
			teams.push(newTeam);
			this.curTeam = newTeam;
			this.curTeamLoc = teams.length-1;
			this.update();
		},
		import: function() {
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
			var buf = '';
			if (this.exportMode) {
				buf = '<div class="pad"><button value="back"><i class="icon-chevron-left"></i> Team List</button> <input class="textbox teamnameedit" type="text" class="teamnameedit" size="30" value="'+Tools.escapeHTML(this.curTeam.name)+'" /> <button value="saveImport" class="savebutton"><i class="icon-save"></i> Save</button> <button value="saveImport"><i class="icon-upload-alt"></i> Import/Export</button></div>';
				buf += '<textarea class="teamedit textbox" rows="17">'+Tools.escapeHTML(this.toText(this.curTeam.team))+'</textarea>';
			} else {
				buf = '<div class="pad"><button value="back"><i class="icon-chevron-left"></i> Team List</button> <input class="textbox teamnameedit" type="text" class="teamnameedit" size="30" value="'+Tools.escapeHTML(this.curTeam.name)+'" /> <button value="back" class="savebutton"><i class="icon-save"></i> Save</button> <button value="import"><i class="icon-upload-alt"></i> Import/Export</button></div>';
				buf += '<div class="teamchartbox">';
				buf += '<ol class="teamchart">';
				var i=0;
				if (this.curTeam.team.length && !this.curTeam.team[this.curTeam.team.length-1].species) {
					this.curTeam.team.splice(this.curTeam.team.length-1, 1);
				}
				if (BattleFormats) {
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
					buf += this.renderSet(this.curTeam.team[i], i);
				}
				if (i < 6) {
					buf += '<li><button value="addPokemon" class="majorbutton"><i class="icon-plus"></i> Add pokemon</button></li>';
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
				buf += '<div class="setchart"><div class="setcol setcol-icon" style="background-image:url(' + Tools.resourcePrefix + 'sprites/bw/0.png);"><span class="itemicon"></span><div class="setcell setcell-pokemon"><label>Pokemon</label><input type="text" name="pokemon" class="chartinput" value="" /></div></div></div>';
				buf += '</li>';
				return buf;
			}
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
			buf += '<div class="setcell setcell-details"><label>Details</label><button class="setdetails" tabindex="-1" name="details" value="chartOpenDetails">';

			var GenderChart = {
				'M': 'Male',
				'F': 'Female',
				'N': '&mdash;'
			};
			buf += '<span class="detailcell detailcell-first"><label>Level</label>'+(set.level||100)+'</span>';
			buf += '<span class="detailcell"><label>Gender</label>'+GenderChart[set.gender||'N']+'</span>';
			buf += '<span class="detailcell"><label>Happiness</label>'+(set.happiness||255)+'</span>';
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
			buf += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="setstats" name="stats" class="chartinput" value="chartOpenStats">';
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
			this.curTeam.team = this.parseText(this.$('.teamedit').val());
			this.back();
		},
		addPokemon: function() {
			if (!this.curTeam) return;
			var newPokemon = {
				name: '',
				species: '',
				item: '',
				nature: '',
				evs: {},
				ivs: {},
				moves: []
			};
			this.curTeam.team.push(newPokemon);
			this.curSet = newPokemon;
			this.curSetLoc = this.curTeam.team.length-1;
			this.update();
			// selfR.teamBuilderElem.find('.setcell-pokemon input').select();
		},

		/*********************************************************
		 * Set view
		 *********************************************************/

		updateSetView: function() {
			// pokemon
			var buf = '<div class="pad">';
			buf += '<button value="back"><i class="icon-chevron-left"></i> Entire Team</button></div>';
			buf += '<div class="teambar">';
			var isAdd = false;
			if (this.curTeam.team.length && !this.curTeam.team[this.curTeam.team.length-1].name && this.curSetLoc !== this.curTeam.team.length-1) {
				this.curTeam.team.splice(this.curTeam.team.length-1, 1);
			}
			for (var i=0; i<this.curTeam.team.length; i++) {
				var set = this.curTeam.team[i];
				var pokemonicon = '<span class="pokemonicon" id="pokemonicon-'+i+'" style="'+Tools.getIcon(set)+'"></span>';
				if (!set.name) {
					buf += '<button disabled="disabled" class="addpokemon"><i class="icon-plus"></i></button> ';
					isAdd = true;
				} else if (i == this.curSetLoc) {
					buf += '<button disabled="disabled" class="pokemon">'+pokemonicon+Tools.escapeHTML(set.name || '<i class="icon-plus"></i>')+'</button> ';
				} else {
					buf += '<button value="selectPokemon" data-i="'+i+'" class="pokemon">'+pokemonicon+Tools.escapeHTML(set.name)+'</button> ';
				}
			}
			if (this.curTeam.team.length < 6 && !isAdd) {
				buf += '<button value="addPokemon"><i class="icon-plus"></i></button> ';
			}
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
		},

		arrangeCallback: {
			pokemon: function(pokemon) {
				if (!pokemon) {
					if (this.curTeam) {
						if (this.curTeam.format === 'uber') return ['Uber','OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'cap') return ['G5CAP','G4CAP','OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'ou') return ['OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'uu') return ['UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'ru') return ['RU','BL3','NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'nu') return ['NU','NFE','LC Uber','LC'];
						if (this.curTeam.format === 'lc') return ['LC','NU'];
					}
					return ['OU','Unreleased','Uber','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC','G5CAP','G4CAP'];
				}
				var tierData = exports.BattleFormatsData[toId(pokemon.species)];
				if (!tierData) return 'Limbo';
				return tierData.tier;
			},
			item: function(item) {
				if (!item) return ['Items'];
				return 'Items';
			},
			ability: function(ability) {
				if (!this.curSet) return;
				if (!ability) return ['Abilities', 'Dream World Ability'];
				var template = Tools.getTemplate(this.curSet.species);
				if (!template.abilities) return 'Abilities';
				if (ability.name === template.abilities['0']) return 'Abilities';
				if (ability.name === template.abilities['1']) return 'Abilities';
				if (ability.name === template.abilities['DW']) return 'Dream World Ability';
				return 'Illegal';
			},
			move: function(move) {
				if (!this.curSet) return;
				if (!move) return ['Viable Moves', 'Usable Moves', 'Moves', 'Usable Sketch Moves', 'Sketch Moves'];
				var id = toId(this.curSet.species);
				var movelist = selfR.movelists[id];
				if (!movelist) return 'Illegal';
				if (!movelist[move.id]) {
					if (movelist['sketch']) {
						if (move.isViable) return 'Usable Sketch Moves';
						else if (move.id !== 'chatter' && move.id !== 'struggle') return 'Sketch Moves';
					}
					return 'Illegal';
				}
				if (BattleFormatsData && BattleFormatsData[id] && BattleFormatsData[id].viableMoves && BattleFormatsData[id].viableMoves[move.id]) return 'Viable Moves';
				if (move.isViable) return 'Usable Moves';
				return 'Moves';
			}
		},

		selectPokemon: function(i) {
			if (i && i.currentTarget) i = $(i.currentTarget).data('i');
			i = +i;
			var set = this.curTeam.team[i];
			if (set) {
				this.curSet = set;
				this.curSetLoc = i;
				this.update();
			}
		},
		chartOpenStats: function(e) {
			this.selectPokemon($(e.currentTarget).closest('li').val());
		},
		chartOpenDetails: function(e) {
			this.selectPokemon($(e.currentTarget).closest('li').val());
		},
		chartKeydown: function() {
			//
		},

		/*********************************************************
		 * Utility functions
		 *********************************************************/

		// text import/export

		parseText: function(text, teams) {
			var text = text.split("\n");
			var team = [];
			var curSet = null;
			if (teams === true) {
				app.user.teams = [];
				teams = app.user.teams;
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
						curSet.species = line.substr(parenIndex+2);
						line = line.substr(0, parenIndex);
						curSet.name = line;
					} else {
						curSet.name = line;
						curSet.species = line;
					}
				} else if (line.substr(0, 7) === 'Trait: ') {
					line = line.substr(7);
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
						if (!curSet.ivs) {
							curSet.ivs = {};
							for (var stat in exports.BattleTypeChart[hptype].HPivs) {
								curSet.ivs[stat] = exports.BattleTypeChart[hptype].HPivs[stat];
							}
						}
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
				buf += this.toText(team.team);
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
					text += 'Trait: '+curSet.ability+"\n";
				}
				if (curSet.level && curSet.level != 100) {
					text += 'Level: '+curSet.level+"\n";
				}
				if (curSet.shiny) {
					text += 'Shiny: Yes\n';
				}
				if (curSet.happiness && curSet.happiness !== 255) {
					text += 'Happiness: '+curSet.happiness+"\n";
				}
				var first = true;
				for (var j in curSet.evs) {
					if (!curSet.evs[j]) continue;
					if (first) {
						text += 'EVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += ''+curSet.evs[j]+' '+BattlePOStatNames[j];
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
							for (var stat in BattleStatNames) {
								if (curSet.ivs[stat] !== exports.BattleTypeChart[hpType].HPivs[stat]) {
									if (!(typeof curSet.ivs[stat] === 'undefined' && exports.BattleTypeChart[hpType].HPivs[stat] == 31) &&
										!(curSet.ivs[stat] == 31 && typeof exports.BattleTypeChart[hpType].HPivs[stat] === 'undefined')) {
										defaultIvs = false;
										break;
									}
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
						for (var stat in curSet.ivs) {
							if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
							if (first) {
								text += 'IVs: ';
								first = false;
							} else {
								text += ' / ';
							}
							text += ''+curSet.ivs[stat]+' '+BattlePOStatNames[stat];
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
		},

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
						moveCount['Physical']++;
					} else if (move.id === 'protect' || move.id === 'detect') {
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
						} else if (move.id === 'nastyplot' || move.id === 'tailglow' || move.id === 'quiverdance' || move.id === 'calmmind') {
							moveCount['SpecialSetup']++;
						}
						if (move.id === 'substitute') moveCount['Stall']++;
						moveCount['Setup']++;
					} else {
						if (move.id === 'toxic' || move.id === 'leechseed' || move.id === 'willowisp') moveCount['Stall']++;
						moveCount['Support']++;
					}
				} else if (move.id === 'rapidspin' || move.id === 'knockoff' || move.id === 'counter' || move.id === 'mirrorcoat' || move.id === 'metalburst') {
					moveCount['Support']++;
				} else if (move.id === 'nightshade' || move.id === 'seismictoss') {
					moveCount['Offense']++;
				} else {
					moveCount[move.category]++;
					moveCount['Offense']++;
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

			if (hasMove['calmmind'] || hasMove['quiverdance']) {
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
				'Physical Scarf': ['atk', 'spe'],
				'Special Scarf': ['spa', 'spe'],
				'Physical Biased Mixed Scarf': ['atk', 'spe'],
				'Special Biased Mixed Scarf': ['spa', 'spe'],
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

			if (this.curTeam && (this.curTeam.format === 'hackmons' || this.curTeam.format === 'balancedhackmons')) {
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

			evs.plusStat = plusStat;
			evs.minusStat = minusStat;

			return evs;
		},

		// Stat calculator

		getStat: function(stat, set, evOverride, natureOverride) {
			if (!set) set = this.curSet;
			if (!set) return 0;
			var template = Tools.getTemplate(set.species);
			if (!template.exists) return 0;
			
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
			Tools.movelists = {};
			for (var pokemon in window.BattlePokedex) {
				var template = Tools.getTemplate(pokemon);
				var moves = {};
				var alreadyChecked = {};
				do {
					alreadyChecked[template.speciesid] = true;
					if (template.learnset) {
						for (var l in template.learnset) {
							moves[l] = true;
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
			}
		}
	}, {
		// static
		saveTeams: function() {
			if (window.localStorage) {
				$.cookie('showdown_team1', null);
				$.cookie('showdown_team2', null);
				$.cookie('showdown_team3', null);

				localStorage.setItem('showdown_teams', JSON.stringify(teams));
			} else {
				if (teams[0]) {
					$.cookie('showdown_team1', null);
					$.cookie('showdown_team1', $.toJSON(teams[0]),{expires:60,domain:'pokemonshowdown.com'});
				} else {
					$.cookie('showdown_team1', null);
					$.cookie('showdown_team1', null, {domain:'pokemonshowdown.com'});
				}
				if (teams[1]) {
					$.cookie('showdown_team2', null);
					$.cookie('showdown_team2', $.toJSON(teams[1]),{expires:60,domain:'pokemonshowdown.com'});
				} else {
					$.cookie('showdown_team2', null);
					$.cookie('showdown_team2', null, {domain:'pokemonshowdown.com'});
				}
				$.cookie('showdown_team3', null);
			}
		}
	});

}).call(this, jQuery);
