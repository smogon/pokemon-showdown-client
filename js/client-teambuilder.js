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
			'click button': 'dispatchClick'
		},
		dispatchClick: function(e) {
			if (this[e.currentTarget.value]) this[e.currentTarget.value].call(this, e);
		},
		saveTeams: function() {
			TeambuilderRoom.writeTeams(teams);
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
		update: function() {
			if (this.curTeam) {
				if (this.curSet) {
					return this.updateSetView();
				}
				return this.updateTeamView();
			}
			return this.updateTeamList();
		},

		// team list view

		deletedTeam: null,
		deletedTeamLoc: -1,
		updateTeamList: function() {
			var teams = app.user.teams;
			var buf = '<div class="pad"><p>lol zarel this is a horrible teambuilder</p>'
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
			}
			else for (var i=0; i<teams.length+1; i++) {
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
			//
		},
		backup: function() {
			//
		},

		// team edit view

		updateTeamView: function() {
			var buf = '<div class="pad"><p>Editing a team</p></div>';
			this.$el.html(buf);
		},
		updateSetView: function() {
			var buf = '<div class="pad"><p>Editing a set</p></div>';
			this.$el.html(buf);
		},

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
			var text = '';
			for (var i=0,len=teams.length; i<len; i++) {
				var team = teams[i];
				text += '=== '+(team.format?'['+team.format+'] ':'')+team.name+' ===\n\n';
				text += this.toText(team.team);
				text += '\n';
			}
			return text;
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
		writeTeams: function(teams) {
			// TODO: Write `teams` into localStorage or cookies here.
		}
	});

}).call(this, jQuery);
