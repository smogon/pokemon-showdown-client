function Storage() {}

Storage.initialize = function () {
	if (window.nodewebkit) {
		window.fs = require('fs');

		this.initDirectory();
		this.startLoggingChat = this.nwStartLoggingChat;
		this.stopLoggingChat = this.nwStopLoggingChat;
		this.logChat = this.nwLogChat;
	}
};

/*********************************************************
 * Teams
 *********************************************************/

/**
 * Teams are normally loaded from `localStorage`.
 * If the client isn't running on `play.pokemonshowdown.com`, though,
 * teams are received from `crossdomain.php` instead.
 */

Storage.teams = null;

Storage.loadTeams = function () {
	if (window.nodewebkit) {
		return;
	}
	this.teams = [];
	if (window.localStorage) {
		Storage.loadPackedTeams(localStorage.getItem('showdown_teams'));
		app.trigger('init:loadteams');
	}
};

Storage.loadPackedTeams = function (buffer) {
	try {
		this.teams = Storage.unpackAllTeams(buffer);
	} catch (e) {
		app.addPopup(Popup, {
			type: 'modal',
			htmlMessage: "Your teams are corrupt and could not be loaded. :( We may be able to recover a team from this data:<br /><textarea rows=\"10\" cols=\"60\">" + Tools.escapeHTML(buffer) + "</textarea>"
		});
	}
};

Storage.saveTeams = function () {
	if (window.localStorage) {
		Storage.cantSave = false;
		try {
			localStorage.setItem('showdown_teams', Storage.packAllTeams(this.teams));
		} catch (e) {
			if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
				Storage.cantSave = true;
			} else {
				throw e;
			}
		}
	}
};

Storage.getPackedTeams = function () {
	var packedTeams = '';
	try {
		packedTeams = localStorage.getItem('showdown_teams');
	} catch (e) {}
	if (packedTeams) return packedTeams;
	return Storage.packAllTeams(this.teams);
};

Storage.saveTeam = function () {
	this.saveTeams();
};

Storage.deleteTeam = function () {
	this.saveTeams();
};

Storage.saveAllTeams = function () {
	this.saveTeams();
};

/*********************************************************
 * Team importing and exporting
 *********************************************************/

Storage.unpackAllTeams = function (buffer) {
	if (!buffer) return [];

	if (buffer.charAt(0) === '[' && $.trim(buffer).indexOf('\n') < 0) {
		// old format
		return JSON.parse(buffer).map(function (oldTeam) {
			return {
				name: oldTeam.name || '',
				format: oldTeam.format || '',
				team: Storage.packTeam(oldTeam.team),
				iconCache: ''
			};
		});
		return;
	}

	return buffer.split('\n').map(function (line) {
		var pipeIndex = line.indexOf('|');
		if (pipeIndex < 0) return;
		var bracketIndex = line.indexOf(']');
		if (bracketIndex > pipeIndex) bracketIndex = -1;
		return {
			name: line.slice(bracketIndex + 1, pipeIndex),
			format: bracketIndex > 0 ? line.slice(0, bracketIndex) : '',
			team: line.slice(pipeIndex + 1),
			iconCache: ''
		};
	}).filter(function (v) { return v; });
};

Storage.packAllTeams = function (teams) {
	return teams.map(function (team) {
		return (team.format ? '' + team.format + ']' : '') + team.name + '|' + Storage.getPackedTeam(team);
	}).join('\n');
};

Storage.packTeam = function (team) {
	var buf = '';
	if (!team) return '';

	for (var i = 0; i < team.length; i++) {
		var set = team[i];
		if (buf) buf += ']';

		// name
		buf += (set.name || set.species);

		// species
		var id = toId(set.species || set.name);
		buf += '|' + (toId(set.name || set.species) === id ? '' : id);

		// item
		buf += '|' + toId(set.item);

		// ability
		var template = Tools.getTemplate(set.species || set.name);
		var abilities = template.abilities;
		id = toId(set.ability);
		if (abilities) {
			if (id == toId(abilities['0'])) {
				buf += '|';
			} else if (id === toId(abilities['1'])) {
				buf += '|1';
			} else if (id === toId(abilities['H'])) {
				buf += '|H';
			} else {
				buf += '|' + id;
			}
		} else {
			buf += '|' + id;
		}

		// moves
		if (set.moves) {
			buf += '|' + set.moves.map(toId).join(',');
		} else {
			buf += '|';
		}

		// nature
		buf += '|' + (set.nature || '');

		// evs
		var evs = '|';
		if (set.evs) {
			evs = '|' + (set.evs['hp'] || '') + ',' + (set.evs['atk'] || '') + ',' + (set.evs['def'] || '') + ',' + (set.evs['spa'] || '') + ',' + (set.evs['spd'] || '') + ',' + (set.evs['spe'] || '');
		}
		if (evs === '|,,,,,') {
			buf += '|';
		} else {
			buf += evs;
		}

		// gender
		if (set.gender && set.gender !== template.gender) {
			buf += '|' + set.gender;
		} else {
			buf += '|';
		}

		// ivs
		var ivs = '|';
		if (set.ivs) {
			ivs = '|' + (set.ivs['hp'] === 31 || set.ivs['hp'] === undefined ? '' : set.ivs['hp']) + ',' + (set.ivs['atk'] === 31 || set.ivs['atk'] === undefined ? '' : set.ivs['atk']) + ',' + (set.ivs['def'] === 31 || set.ivs['def'] === undefined ? '' : set.ivs['def']) + ',' + (set.ivs['spa'] === 31 || set.ivs['spa'] === undefined ? '' : set.ivs['spa']) + ',' + (set.ivs['spd'] === 31 || set.ivs['spd'] === undefined ? '' : set.ivs['spd']) + ',' + (set.ivs['spe'] === 31 || set.ivs['spe'] === undefined ? '' : set.ivs['spe']);
		}
		if (ivs === '|,,,,,') {
			buf += '|';
		} else {
			buf += ivs;
		}

		// shiny
		if (set.shiny) {
			buf += '|S';
		} else {
			buf += '|';
		}

		// level
		if (set.level && set.level != 100) {
			buf += '|' + set.level;
		} else {
			buf += '|';
		}

		// happiness
		if (set.happiness !== undefined && set.happiness !== 255) {
			buf += '|' + set.happiness;
		} else {
			buf += '|';
		}
	}

	return buf;
};

Storage.fastUnpackTeam = function (buf) {
	if (!buf) return [];

	var team = [];
	var i = 0, j = 0;

	while (true) {
		var set = {};
		team.push(set);

		// name
		j = buf.indexOf('|', i);
		set.name = buf.substring(i, j);
		i = j + 1;

		// species
		j = buf.indexOf('|', i);
		set.species = buf.substring(i, j) || set.name;
		i = j + 1;

		// item
		j = buf.indexOf('|', i);
		set.item = buf.substring(i, j);
		i = j + 1;

		// ability
		j = buf.indexOf('|', i);
		var ability = buf.substring(i, j);
		var template = Tools.getTemplate(set.species);
		set.ability = (template.abilities && ability in {'':1, 0:1, 1:1, H:1} ? template.abilities[ability||'0'] : ability);
		i = j + 1;

		// moves
		j = buf.indexOf('|', i);
		set.moves = buf.substring(i, j).split(',');
		i = j + 1;

		// nature
		j = buf.indexOf('|', i);
		set.nature = buf.substring(i, j);
		if (set.nature === 'undefined') set.nature = undefined;
		i = j + 1;

		// evs
		j = buf.indexOf('|', i);
		if (j !== i) {
			var evs = buf.substring(i, j).split(',');
			set.evs = {
				hp: Number(evs[0]) || 0,
				atk: Number(evs[1]) || 0,
				def: Number(evs[2]) || 0,
				spa: Number(evs[3]) || 0,
				spd: Number(evs[4]) || 0,
				spe: Number(evs[5]) || 0
			};
		}
		i = j + 1;

		// gender
		j = buf.indexOf('|', i);
		if (i !== j) set.gender = buf.substring(i, j);
		i = j + 1;

		// ivs
		j = buf.indexOf('|', i);
		if (j !== i) {
			var ivs = buf.substring(i, j).split(',');
			set.ivs = {
				hp: ivs[0] === '' ? 31 : Number(ivs[0]),
				atk: ivs[1] === '' ? 31 : Number(ivs[1]),
				def: ivs[2] === '' ? 31 : Number(ivs[2]),
				spa: ivs[3] === '' ? 31 : Number(ivs[3]),
				spd: ivs[4] === '' ? 31 : Number(ivs[4]),
				spe: ivs[5] === '' ? 31 : Number(ivs[5])
			};
		}
		i = j + 1;

		// shiny
		j = buf.indexOf('|', i);
		if (i !== j) set.shiny = true;
		i = j + 1;

		// level
		j = buf.indexOf('|', i);
		if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
		i = j + 1;

		// happiness
		j = buf.indexOf(']', i);
		if (j < 0) {
			if (buf.substring(i)) {
				set.happiness = Number(buf.substring(i));
			}
			break;
		}
		if (i !== j) set.happiness = Number(buf.substring(i, j));
		i = j + 1;
	}

	return team;
};

Storage.unpackTeam = function (buf) {
	if (!buf) return [];

	var team = [];
	var i = 0, j = 0;

	while (true) {
		var set = {};
		team.push(set);

		// name
		j = buf.indexOf('|', i);
		set.name = buf.substring(i, j);
		i = j + 1;

		// species
		j = buf.indexOf('|', i);
		set.species = Tools.getTemplate(buf.substring(i, j)).name || set.name;
		i = j + 1;

		// item
		j = buf.indexOf('|', i);
		set.item = Tools.getItem(buf.substring(i, j)).name;
		i = j + 1;

		// ability
		j = buf.indexOf('|', i);
		var ability = Tools.getAbility(buf.substring(i, j)).name;
		var template = Tools.getTemplate(set.species);
		set.ability = (template.abilities && ability in {'':1, 0:1, 1:1, H:1} ? template.abilities[ability||'0'] : ability);
		i = j + 1;

		// moves
		j = buf.indexOf('|', i);
		set.moves = buf.substring(i, j).split(',').map(function (moveid) {
			return Tools.getMove(moveid).name
		});
		i = j + 1;

		// nature
		j = buf.indexOf('|', i);
		set.nature = buf.substring(i, j);
		if (set.nature === 'undefined') set.nature = undefined;
		i = j + 1;

		// evs
		j = buf.indexOf('|', i);
		if (j !== i) {
			var evs = buf.substring(i, j).split(',');
			set.evs = {
				hp: Number(evs[0]) || 0,
				atk: Number(evs[1]) || 0,
				def: Number(evs[2]) || 0,
				spa: Number(evs[3]) || 0,
				spd: Number(evs[4]) || 0,
				spe: Number(evs[5]) || 0
			};
		}
		i = j + 1;

		// gender
		j = buf.indexOf('|', i);
		if (i !== j) set.gender = buf.substring(i, j);
		i = j + 1;

		// ivs
		j = buf.indexOf('|', i);
		if (j !== i) {
			var ivs = buf.substring(i, j).split(',');
			set.ivs = {
				hp: ivs[0] === '' ? 31 : Number(ivs[0]),
				atk: ivs[1] === '' ? 31 : Number(ivs[1]),
				def: ivs[2] === '' ? 31 : Number(ivs[2]),
				spa: ivs[3] === '' ? 31 : Number(ivs[3]),
				spd: ivs[4] === '' ? 31 : Number(ivs[4]),
				spe: ivs[5] === '' ? 31 : Number(ivs[5])
			};
		}
		i = j + 1;

		// shiny
		j = buf.indexOf('|', i);
		if (i !== j) set.shiny = true;
		i = j + 1;

		// level
		j = buf.indexOf('|', i);
		if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
		i = j + 1;

		// happiness
		j = buf.indexOf(']', i);
		if (j < 0) {
			if (buf.substring(i)) {
				set.happiness = Number(buf.substring(i));
			}
			break;
		}
		if (i !== j) set.happiness = Number(buf.substring(i, j));
		i = j + 1;
	}

	return team;
};

Storage.packedTeamNames = function (buf) {
	if (!buf) return '';

	var team = [];
	var i = 0;

	while (true) {
		var name = buf.substring(i, buf.indexOf('|', i));
		i = buf.indexOf('|', i) + 1;

		team.push(buf.substring(i, buf.indexOf('|', i)) || name);

		for (var k = 0; k < 9; k++) {
			i = buf.indexOf('|', i) + 1;
		}

		i = buf.indexOf(']', i) + 1;

		if (i < 1) break;
	}

	return team;
};

Storage.packedTeamIcons = function (buf) {
	if (!buf) return '<em>(empty team)</em>';

	return this.packedTeamNames(buf).map(function (species) {
		return '<span class="pokemonicon" style="' + Tools.getIcon(species) + ';float:left;overflow:visible"><span style="font-size:0px">' + toId(species) + '</span></span>';
	}).join('');
};

Storage.getTeamIcons = function (team) {
	if (team.iconCache === '!') {
		// an icon cache of '!' means that not only are the icons not cached,
		// but the packed team isn't guaranteed to be updated to the latest
		// changes from the teambuilder, either.

		// we use Storage.activeSetList instead of reading from
		// app.rooms.teambuilder.curSetList because the teambuilder
		// room may have been closed by the time we need to get
		// a packed team.
		team.team = Storage.packTeam(Storage.activeSetList);
		if ('teambuilder' in app.rooms) {
			return Storage.packedTeamIcons(team.team);
		}
		Storage.activeSetList = null;
		team.iconCache = Storage.packedTeamIcons(team.team);
	} else if (!team.iconCache) {
		team.iconCache = Storage.packedTeamIcons(team.team);
	}
	return team.iconCache;
};

Storage.getPackedTeam = function (team) {
	if (!team) return null;
	if (team.iconCache === '!') {
		// see the same case in Storage.getTeamIcons
		team.team = Storage.packTeam(Storage.activeSetList);
		if (!('teambuilder' in app.rooms)) {
			Storage.activeSetList = null;
			team.iconCache = '';
		}
	}
	if (typeof team.team !== 'string') {
		// should never happen
		team.team = Storage.packTeam(team.team);
	}
	return team.team;
};

Storage.importTeam = function (text, teams) {
	var text = text.split("\n");
	var team = [];
	var curSet = null;
	if (teams === true) {
		Storage.teams = [];
		teams = Storage.teams;
	} else if (text.length === 1 || (text.length === 2 && !text[1])) {
		return Storage.unpackTeam(text[0]);
	}
	for (var i = 0; i < text.length; i++) {
		var line = $.trim(text[i]);
		if (line === '' || line === '---') {
			curSet = null;
		} else if (line.substr(0, 3) === '===' && teams) {
			team = [];
			line = $.trim(line.substr(3, line.length - 6));
			var format = '';
			var bracketIndex = line.indexOf(']');
			if (bracketIndex >= 0) {
				format = line.substr(1, bracketIndex - 1);
				line = $.trim(line.substr(bracketIndex + 1));
			}
			if (teams.length) {
				teams[teams.length - 1].team = Storage.packTeam(teams[teams.length - 1].team);
			}
			teams.push({
				name: line,
				format: format,
				team: team,
				iconCache: ''
			});
		} else if (!curSet) {
			curSet = {name: '', species: '', gender: ''};
			team.push(curSet);
			var atIndex = line.lastIndexOf(' @ ');
			if (atIndex !== -1) {
				curSet.item = line.substr(atIndex + 3);
				if (toId(curSet.item) === 'noitem') curSet.item = '';
				line = line.substr(0, atIndex);
			}
			if (line.substr(line.length - 4) === ' (M)') {
				curSet.gender = 'M';
				line = line.substr(0, line.length - 4);
			}
			if (line.substr(line.length - 4) === ' (F)') {
				curSet.gender = 'F';
				line = line.substr(0, line.length - 4);
			}
			var parenIndex = line.lastIndexOf(' (');
			if (line.substr(line.length - 1) === ')' && parenIndex !== -1) {
				line = line.substr(0, line.length - 1);
				curSet.species = Tools.getTemplate(line.substr(parenIndex + 2)).name;
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
			for (var j = 0; j < evLines.length; j++) {
				var evLine = $.trim(evLines[j]);
				var spaceIndex = evLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[evLine.substr(spaceIndex + 1)];
				var statval = parseInt(evLine.substr(0, spaceIndex));
				if (!statid) continue;
				curSet.evs[statid] = statval;
			}
		} else if (line.substr(0, 5) === 'IVs: ') {
			line = line.substr(5);
			var ivLines = line.split(' / ');
			curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
			for (var j = 0; j < ivLines.length; j++) {
				var ivLine = ivLines[j];
				var spaceIndex = ivLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[ivLine.substr(spaceIndex + 1)];
				var statval = parseInt(ivLine.substr(0, spaceIndex));
				if (!statid) continue;
				if (isNaN(statval)) statval = 31;
				curSet.ivs[statid] = statval;
			}
		} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
			var natureIndex = line.indexOf(' Nature');
			if (natureIndex === -1) natureIndex = line.indexOf(' nature');
			if (natureIndex === -1) continue;
			line = line.substr(0, natureIndex);
			if (line !== 'undefined') curSet.nature = line;
		} else if (line.substr(0, 1) === '-' || line.substr(0, 1) === '~') {
			line = line.substr(1);
			if (line.substr(0, 1) === ' ') line = line.substr(1);
			if (!curSet.moves) curSet.moves = [];
			if (line.substr(0, 14) === 'Hidden Power [') {
				var hptype = line.substr(14, line.length - 15);
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
	if (teams && teams.length) {
		teams[teams.length - 1].team = Storage.packTeam(teams[teams.length - 1].team);
	}
	return team;
};
Storage.exportAllTeams = function () {
	var buf = '';
	for (var i = 0, len = Storage.teams.length; i < len; i++) {
		var team = Storage.teams[i];
		buf += '=== ' + (team.format ? '[' + team.format + '] ' : '') + team.name + ' ===\n\n';
		buf += Storage.exportTeam(team.team);
		buf += '\n';
	}
	return buf;
};
Storage.exportTeam = function (team) {
	if (!team) return "";
	if (typeof team === 'string') {
		if (team.indexOf('\n') >= 0) return team;
		team = Storage.unpackTeam(team);
	}
	var text = '';
	for (var i = 0; i < team.length; i++) {
		var curSet = team[i];
		if (curSet.name !== curSet.species) {
			text += '' + curSet.name + ' (' + curSet.species + ')';
		} else {
			text += '' + curSet.species;
		}
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item) {
			text += ' @ ' + curSet.item;
		}
		text += "  \n";
		if (curSet.ability) {
			text += 'Ability: ' + curSet.ability + "  \n";
		}
		if (curSet.level && curSet.level != 100) {
			text += 'Level: ' + curSet.level + "  \n";
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes  \n';
		}
		if (typeof curSet.happiness === 'number' && curSet.happiness !== 255 && !isNaN(curSet.happiness)) {
			text += 'Happiness: ' + curSet.happiness + "  \n";
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
				text += '' + curSet.evs[j] + ' ' + BattleStatNames[j];
			}
		}
		if (!first) {
			text += "  \n";
		}
		if (curSet.nature) {
			text += '' + curSet.nature + ' Nature' + "  \n";
		}
		var first = true;
		if (curSet.ivs) {
			var defaultIvs = true;
			var hpType = false;
			for (var j = 0; j < curSet.moves.length; j++) {
				var move = curSet.moves[j];
				if (move.substr(0, 13) === 'Hidden Power ' && move.substr(0, 14) !== 'Hidden Power [') {
					hpType = move.substr(13);
					if (!exports.BattleTypeChart[hpType].HPivs) {
						alert("That is not a valid Hidden Power type.");
						continue;
					}
					for (var stat in BattleStatNames) {
						if ((curSet.ivs[stat] === undefined ? 31 : curSet.ivs[stat]) !== (exports.BattleTypeChart[hpType].HPivs[stat] || 31)) {
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
					if (typeof curSet.ivs[stat] === 'undefined' || isNaN(curSet.ivs[stat]) || curSet.ivs[stat] == 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += '' + curSet.ivs[stat] + ' ' + BattleStatNames[stat];
				}
			}
		}
		if (!first) {
			text += "  \n";
		}
		if (curSet.moves && curSet.moves) for (var j = 0; j < curSet.moves.length; j++) {
			var move = curSet.moves[j];
			if (move.substr(0, 13) === 'Hidden Power ') {
				move = move.substr(0, 13) + '[' + move.substr(13) + ']';
			}
			text += '- ' + move + "  \n";
		}
		text += "\n";
	}
	return text;
};

/*********************************************************
 * Node-webkit
 *********************************************************/

Storage.initDirectory = function () {
	var self = this;

	var dir = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
	if (!(dir.charAt(dir.length - 1) in {'/': 1, '\\': 1})) dir += '/';
	fs.stat(dir + 'Documents', function (err, stats) {
		if (err || !stats.isDirectory()) {
			fs.stat(dir + 'My Documents', function (err, stats) {
				if (err || !stats.isDirectory()) {
					self.documentsDir = dir;
				} else {
					self.documentsDir = dir + 'My Documents/';
				}
				self.initDirectory2();
			});
		} else {
			self.documentsDir = dir + 'Documents/';
			self.initDirectory2();
		}
	});
};

Storage.initDirectory2 = function () {
	var self = this;
	fs.mkdir(self.documentsDir + 'My Games', function () {
		fs.mkdir(self.documentsDir + 'My Games/Pokemon Showdown', function () {
			fs.stat(self.documentsDir + 'My Games/Pokemon Showdown', function (err, stats) {
				if (err) return;
				if (stats.isDirectory()) {
					self.dir = self.documentsDir + 'My Games/Pokemon Showdown/';
					fs.mkdir(self.dir + 'Logs', function () {});
					fs.mkdir(self.dir + 'Teams', function () {});

					// load teams
					self.nwLoadTeams();
					self.saveAllTeams = self.nwSaveAllTeams;
					self.saveTeam = self.nwSaveTeam;
					self.deleteTeam = self.nwDeleteTeam;

					// logging
					if (Tools.prefs('logchat')) self.startLoggingChat();
				}
			});
		});
	});
};

Storage.revealFolder = function () {
	gui.Shell.openItem(this.dir);
};

// teams

Storage.nwLoadTeams = function () {
	var self = this;
	var localApp = window.app;
	fs.readdir(this.dir + 'Teams', function (err, files) {
		if (err) return;
		self.teams = [];
		self.nwTeamsLeft = files.length;
		for (var i = 0; i < files.length; i++) {
			self.nwLoadTeamFile(files[i], localApp);
		}
	});
};

Storage.nwLoadTeamFile = function (filename, localApp) {
	var self = this;
	var line = filename;
	if (line.substr(line.length - 4).toLowerCase() === '.txt') {
		line = line.substr(0, line.length - 4);
	} else {
		// not a team file
		self.nwTeamsLeft--;
		if (!self.nwTeamsLeft) {
			self.nwFinishedLoadingTeams(localApp);
		}
		return;
	}
	var format = '';
	var bracketIndex = line.indexOf(']');
	if (bracketIndex >= 0) {
		format = line.substr(1, bracketIndex - 1);
		line = $.trim(line.substr(bracketIndex + 1));
	}
	fs.readFile(this.dir + 'Teams/' + filename, function (err, data) {
		if (!err) {
			self.teams.push({
				name: line,
				format: format,
				team: Storage.packTeam(Storage.importTeam('' + data)),
				iconCache: '',
				filename: filename
			});
			self.nwTeamsLeft--;
			if (!self.nwTeamsLeft) {
				self.nwFinishedLoadingTeams(localApp);
			}
		}
	});
};

Storage.nwFinishedLoadingTeams = function (app) {
	this.teams.sort(this.teamCompare);
	if (!app) app = window.app;
	if (app) app.trigger('init:loadteams');
};

Storage.teamCompare = function (a, b) {
	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
	return 0;
};

Storage.nwDeleteAllTeams = function (callback) {
	var self = this;
	fs.readdir(this.dir + 'Teams', function (err, files) {
		if (err) return;
		self.nwTeamsLeft = files.length;
		if (!self.nwTeamsLeft) {
			callback();
			return;
		}
		for (var i = 0; i < files.length; i++) {
			self.nwDeleteTeamFile(files[i], callback);
		}
	});
};

Storage.nwDeleteTeamFile = function (filename, callback) {
	var self = this;
	var line = filename;
	if (line.substr(line.length - 4).toLowerCase() === '.txt') {
		line = line.substr(0, line.length - 4);
	} else {
		// not a team file
		self.nwTeamsLeft--;
		if (!self.nwTeamsLeft) callback();
		return;
	}
	fs.unlink(this.dir + 'Teams/' + filename, function (err) {
		self.nwTeamsLeft--;
		if (!self.nwTeamsLeft) callback();
	});
};

Storage.nwSaveTeam = function (team) {
	if (!team) return;
	var filename = team.name + '.txt';
	if (team.format) filename = '[' + team.format + '] ' + filename;
	filename = $.trim(filename).replace(/[\\\/]+/g, '');

	if (team.filename && filename !== team.filename) {
		fs.unlink(this.dir + 'Teams/' + team.filename, function () {});
	}
	team.filename = filename;
	fs.writeFile(this.dir + 'Teams/' + filename, Storage.exportTeam(team.team).replace(/\n/g, '\r\n'));
};

Storage.nwDeleteTeam = function (team) {
	if (team.filename) {
		fs.unlink(this.dir + 'Teams/' + team.filename, function () {});
		delete team.filename;
	}
};

Storage.nwSaveAllTeams = function () {
	var self = this;
	this.nwDeleteAllTeams(function () {
		self.nwDoSaveAllTeams();
	});
};

Storage.nwDoSaveAllTeams = function () {
	for (var i = 0; i < this.teams.length; i++) {
		var team = this.teams[i];
		var filename = team.name + '.txt';
		if (team.format) filename = '[' + team.format + '] ' + filename;
		filename = $.trim(filename).replace(/[\\\/]+/g, '');

		team.filename = filename;
		fs.writeFile(this.dir + 'Teams/' + filename, Storage.exportTeam(team.team).replace(/\n/g, '\r\n'));
	}
};

// logs

Storage.getLogMonth = function () {
	var now = new Date();
	var month = '' + (now.getMonth() + 1);
	if (month.length < 2) month = '0' + month;
	return '' + now.getFullYear() + '-' + month;
};
Storage.nwStartLoggingChat = function () {
	var self = this;
	if (!self.documentsDir) return; // too early; initDirectory2 will call us when it's time
	if (self.loggingChat) return;
	// callback hell! ^_^
	fs.mkdir(self.dir + 'Logs', function () {
		self.chatLogFdMonth = self.getLogMonth();
		fs.mkdir(self.dir + 'Logs/' + self.chatLogFdMonth, function () {
			fs.stat(self.dir + 'Logs/' + self.chatLogFdMonth, function (err, stats) {
				if (err) return;
				if (stats.isDirectory()) {
					self.loggingChat = true;
					self.chatLogStreams = {};
				}
			});
		});
	});
};
Storage.nwStopLoggingChat = function () {
	if (!this.loggingChat) return;
	this.loggingChat = false;
	var streams = this.chatLogStreams;
	this.chatLogStreams = null;
	for (var i in streams) {
		streams[i].end();
	}
};
Storage.nwLogChat = function (roomid, line) {
	roomid = toRoomid(roomid);
	var self = this;
	if (!this.loggingChat) return;
	var chatLogFdMonth = this.getLogMonth();
	if (chatLogFdMonth !== this.chatLogFdMonth) {
		this.chatLogFdMonth = chatLogFdMonth;
		var streams = this.chatLogStreams;
		this.chatLogStreams = {};
		for (var i in streams) {
			streams[i].end();
		}
	}

	var now = new Date();
	var hours = '' + now.getHours();
	if (hours.length < 2) hours = '0' + hours;
	var minutes = '' + now.getMinutes();
	if (minutes.length < 2) minutes = '0' + minutes;
	var timestamp = '[' + hours + ':' + minutes + '] ';

	if (!this.chatLogStreams[roomid]) {
		this.chatLogStreams[roomid] = fs.createWriteStream(this.dir + 'Logs/' + chatLogFdMonth + '/' + roomid + '.txt', {flags: 'a'});
		this.chatLogStreams[roomid].write('\n\n\nLog starting ' + now + '\n\n');
	}
	this.chatLogStreams[roomid].write(timestamp + line + '\n');
};

// saving

Storage.startLoggingChat = function () {};
Storage.stopLoggingChat = function () {};
Storage.logChat = function () {};

Storage.initialize();
