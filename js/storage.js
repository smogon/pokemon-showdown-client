
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
		$.cookie('showdown_team1', null);
		$.cookie('showdown_team2', null);
		$.cookie('showdown_team3', null);

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

/*********************************************************
 * Node-webkit
 *********************************************************/

_Storage.prototype.initDirectory = function() {
	var self = this;

	var dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	if (!(dir.charAt(dir.length-1) in {'/':1, '\\':1})) dir += '/';
	fs.stat(dir+'Documents', function(err, stats) {
		if (err) return;
		if (stats.isDirectory()) {
			self.documentsDir = dir+'Documents/';
			self.initDirectory2();
			return;
		}
		fs.stat(dir+'My Documents', function(err, stats) {
			if (err) return;
			if (stats.isDirectory()) {
				self.documentsDir = dir+'My Documents/';
			} else {
				self.documentsDir = dir;
			}
			self.initDirectory2();
		});
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
					// self.nwLoadTeams();
					if (Tools.prefs('logchat')) self.startLoggingChat();
					fs.mkdir(self.dir+'Logs', function() {});
					fs.mkdir(self.dir+'Teams', function() {});
				}
			});
		});
	});
};

// teams

_Storage.prototype.nwLoadTeams = function() {
	var self = this;
	fs.readdir(this.dir+'Teams', function(err, files) {
		if (err) return;
		self.teams = [];
		self.nwTeamsLeft = files.length;
		for (var i=0; i<files.length; i++) {
			self.nwLoadTeamFile(files[i]);
		}
	});
};

_Storage.prototype.nwLoadTeamFile = function(filename) {
	var self = this;
	var line = filename;
	if (line.substr(line.length-4).toLowerCase() === '.txt') {
		line = line.substr(0, line.length-4);
	} else {
		// not a team file
		self.nwTeamsLeft--;
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
				app.trigger('init:loadteams');
			}
		}
	});
}

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
