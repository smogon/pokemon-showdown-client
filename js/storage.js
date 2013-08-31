
function _Storage() {
	if (window.nodewebkit) {
		window.fs = require('fs');

		this.initDirectory();
		this.startLoggingChat = this.nwStartLoggingChat;
		this.stopLoggingChat = this.nwStopLoggingChat;
		this.logChat = this.nwLogChat;
	}
}

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
	//
};

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
	fs.mkdir(self.documentsDir+'My Games', function() {
		fs.mkdir(self.documentsDir+'My Games/Pokemon Showdown', function() {
			fs.mkdir(self.documentsDir+'My Games/Pokemon Showdown/Logs', function() {
				self.chatLogFdMonth = self.getLogMonth();
				fs.mkdir(self.documentsDir+'My Games/Pokemon Showdown/Logs/'+self.chatLogFdMonth, function() {
					fs.stat(self.documentsDir+'My Games/Pokemon Showdown/Logs/'+self.chatLogFdMonth, function(err, stats) {
						if (err) return;
						if (stats.isDirectory()) {
							self.dir = self.documentsDir+'My Games/Pokemon Showdown/';
							self.loggingChat = true;
							self.chatLogStreams = {};
						}
					});
				});
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
	if (!this.chatLogStreams[roomid]) {
		this.chatLogStreams[roomid] = fs.createWriteStream(this.dir+'Logs/'+chatLogFdMonth+'/'+roomid+'.txt', {flags:'a'});
	}
	this.chatLogStreams[roomid].write(line+'\n');
};

// saving

_Storage.prototype.startLoggingChat = function() {};
_Storage.prototype.stopLoggingChat = function() {};
_Storage.prototype.logChat = function() {};

window.Storage = new _Storage();
