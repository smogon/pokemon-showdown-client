
function _Storage() {
	if (window.nodewebkit) {
		window.fs = require('fs');

		this.initDirectory();
		this.startLoggingChat = this.nwStartLoggingChat;
		this.stopLoggingChat = this.nwStopLoggingChat;
		this.logChat = this.nwLogChat;
	}
}

/*********************************************************
 * Teams
 *********************************************************/

/**
 * Teams are normally loaded from `localStorage`.
 * If the client isn't running on `play.pokemonshowdown.com`, though,
 * teams are received from `crossdomain.php` instead.
 */

_Storage.prototype.teams = null;

_Storage.prototype.loadTeams = function() {
	this.teams = [];
	if (window.nodewebkit) {
		return;
	}
	if (window.localStorage) {
		var teamString = localStorage.getItem('showdown_teams');
		if (teamString) this.teams = JSON.parse(teamString);
		app.trigger('init:loadteams');
	}
};

_Storage.prototype.saveTeams = function() {
	if (window.localStorage) {
		Storage.cantSave = false;
		try {
			localStorage.setItem('showdown_teams', JSON.stringify(this.teams));
		} catch (e) {
			if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
				Storage.cantSave = true;
			} else {
				throw e;
			}
		}
	}
};

_Storage.prototype.saveTeam = function() {
	this.saveTeams();
};

_Storage.prototype.deleteTeam = function() {
	this.saveTeams();
};

_Storage.prototype.saveAllTeams = function() {
	this.saveTeams();
};

/*********************************************************
 * Node-webkit
 *********************************************************/

_Storage.prototype.initDirectory = function() {
	var self = this;

	var dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	if (!(dir.charAt(dir.length-1) in {'/':1, '\\':1})) dir += '/';
	fs.stat(dir+'Documents', function(err, stats) {
		if (err || !stats.isDirectory()) {
			fs.stat(dir+'My Documents', function(err, stats) {
				if (err || !stats.isDirectory()) {
					self.documentsDir = dir;
				} else {
					self.documentsDir = dir+'My Documents/';
				}
				self.initDirectory2();
			});
		} else {
			self.documentsDir = dir+'Documents/';
			self.initDirectory2();
		}
	});
};

_Storage.prototype.initDirectory2 = function() {
	var self = this;
	fs.mkdir(self.documentsDir+'My Games', function() {
		fs.mkdir(self.documentsDir+'My Games/Pokemon Showdown', function() {
			fs.stat(self.documentsDir+'My Games/Pokemon Showdown', function(err, stats) {
				if (err) return;
				if (stats.isDirectory()) {
					self.dir = self.documentsDir+'My Games/Pokemon Showdown/';
					fs.mkdir(self.dir+'Logs', function() {});
					fs.mkdir(self.dir+'Teams', function() {});

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

_Storage.prototype.revealFolder = function() {
	gui.Shell.openItem(this.dir);
};

// teams

_Storage.prototype.nwLoadTeams = function() {
	var self = this;
	var localApp = window.app;
	fs.readdir(this.dir+'Teams', function(err, files) {
		if (err) return;
		self.teams = [];
		self.nwTeamsLeft = files.length;
		for (var i=0; i<files.length; i++) {
			self.nwLoadTeamFile(files[i], localApp);
		}
	});
};

_Storage.prototype.nwLoadTeamFile = function(filename, localApp) {
	var self = this;
	var line = filename;
	if (line.substr(line.length-4).toLowerCase() === '.txt') {
		line = line.substr(0, line.length-4);
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
		format = line.substr(1, bracketIndex-1);
		line = $.trim(line.substr(bracketIndex+1));
	}
	fs.readFile(this.dir+'Teams/'+filename, function(err, data) {
		if (!err) {
			self.teams.push({
				filename: filename,
				name: line,
				format: format,
				team: TeambuilderRoom.parseText(''+data)
			});
			self.nwTeamsLeft--;
			if (!self.nwTeamsLeft) {
				self.nwFinishedLoadingTeams(localApp);
			}
		}
	});
};

_Storage.prototype.nwFinishedLoadingTeams = function(app) {
	this.teams.sort(this.teamCompare);
	if (!app) app = window.app;
	if (app) app.trigger('init:loadteams');
};

_Storage.prototype.teamCompare = function(a, b) {
	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
	return 0;
};

_Storage.prototype.nwDeleteAllTeams = function(callback) {
	var self = this;
	fs.readdir(this.dir+'Teams', function(err, files) {
		if (err) return;
		self.nwTeamsLeft = files.length;
		if (!self.nwTeamsLeft) {
			callback();
			return;
		}
		for (var i=0; i<files.length; i++) {
			self.nwDeleteTeamFile(files[i], callback);
		}
	});
};

_Storage.prototype.nwDeleteTeamFile = function(filename, callback) {
	var self = this;
	var line = filename;
	if (line.substr(line.length-4).toLowerCase() === '.txt') {
		line = line.substr(0, line.length-4);
	} else {
		// not a team file
		self.nwTeamsLeft--;
		if (!self.nwTeamsLeft) callback();
		return;
	}
	fs.unlink(this.dir+'Teams/'+filename, function(err) {
		self.nwTeamsLeft--;
		if (!self.nwTeamsLeft) callback();
	});
};

_Storage.prototype.nwSaveTeam = function(team) {
	var filename = team.name+'.txt';
	if (team.format) filename = '['+team.format+'] '+filename;
	filename = $.trim(filename).replace(/[\\\/]+/g, '');

	if (team.filename && filename !== team.filename) {
		fs.unlink(this.dir+'Teams/'+team.filename, function() {});
	}
	team.filename = filename;
	fs.writeFile(this.dir+'Teams/'+filename, TeambuilderRoom.toText(team.team).replace(/\n/g,'\r\n'));
};

_Storage.prototype.nwDeleteTeam = function(team) {
	if (team.filename) {
		fs.unlink(this.dir+'Teams/'+team.filename, function() {});
		delete team.filename;
	}
};

_Storage.prototype.nwSaveAllTeams = function() {
	var self = this;
	this.nwDeleteAllTeams(function() {
		self.nwDoSaveAllTeams();
	});
};

_Storage.prototype.nwDoSaveAllTeams = function() {
	for (var i=0; i<this.teams.length; i++) {
		var team = this.teams[i];
		var filename = team.name+'.txt';
		if (team.format) filename = '['+team.format+'] '+filename;
		filename = $.trim(filename).replace(/[\\\/]+/g, '');

		team.filename = filename;
		fs.writeFile(this.dir+'Teams/'+filename, TeambuilderRoom.toText(team.team).replace(/\n/g,'\r\n'));
	}
};

// logs

_Storage.prototype.getLogMonth = function() {
	var now = new Date();
	var month = ''+now.getMonth();
	if (month.length < 2) month = '0'+month;
	return ''+now.getFullYear()+'-'+month;
};
_Storage.prototype.nwStartLoggingChat = function() {
	var self = this;
	if (!self.documentsDir) return; // too early; initDirectory2 will call us when it's time
	if (self.loggingChat) return;
	// callback hell! ^_^
	fs.mkdir(self.dir+'Logs', function() {
		self.chatLogFdMonth = self.getLogMonth();
		fs.mkdir(self.dir+'Logs/'+self.chatLogFdMonth, function() {
			fs.stat(self.dir+'Logs/'+self.chatLogFdMonth, function(err, stats) {
				if (err) return;
				if (stats.isDirectory()) {
					self.loggingChat = true;
					self.chatLogStreams = {};
				}
			});
		});
	});
};
_Storage.prototype.nwStopLoggingChat = function() {
	if (!this.loggingChat) return;
	this.loggingChat = false;
	var streams = this.chatLogStreams;
	this.chatLogStreams = null;
	for (var i in streams) {
		streams[i].end();
	}
};
_Storage.prototype.nwLogChat = function(roomid, line) {
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
	var hours = ''+now.getHours();
	if (hours.length < 2) hours = '0'+hours;
	var minutes = ''+now.getHours();
	if (minutes.length < 2) minutes = '0'+minutes;
	var timestamp = '['+hours+':'+minutes+'] ';

	if (!this.chatLogStreams[roomid]) {
		this.chatLogStreams[roomid] = fs.createWriteStream(this.dir+'Logs/'+chatLogFdMonth+'/'+roomid+'.txt', {flags:'a'});
		this.chatLogStreams[roomid].write('\n\n\nLog starting '+now+'\n\n');
	}
	this.chatLogStreams[roomid].write(timestamp+line+'\n');
};

// saving

_Storage.prototype.startLoggingChat = function() {};
_Storage.prototype.stopLoggingChat = function() {};
_Storage.prototype.logChat = function() {};

window.Storage = new _Storage();
