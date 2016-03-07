(function ($) {

	var RoomsRoom = this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		isSideRoom: true,
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="closeHide"><i class="fa fa-caret-right"></i> Hide</button><div class="roomlisttop"></div><div class="roomlist"><p><em style="font-size:20pt">Loading...</em></p></div><div class="roomlist"></div><p><button name="joinRoomPopup" class="button">Join other room</button></p></div>';
			this.$el.html(buf);
			app.on('response:rooms', this.update, this);
			app.send('/cmd rooms');
			app.user.on('change:named', this.updateUser, this);
			this.update();
		},
		updateUser: function () {
			this.update();
		},
		focus: function () {
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				app.send('/cmd rooms');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=joinRoomPopup]').focus();
			this.$el.scrollTop(prevPos);
		},
		joinRoomPopup: function () {
			app.addPopupPrompt("Room name:", "Join room", function (room) {
				room = toRoomid(room);
				if (!room) return;
				app.tryJoinRoom(room);
			});
		},
		update: function (rooms) {
			var firstOpen = !app.roomsData;
			if (rooms) {
				this.lastUpdate = new Date().getTime();
				app.roomsData = rooms;
			} else {
				rooms = app.roomsData;
			}
			if (!rooms) return;
			this.updateRoomList();
			if (!app.roomsFirstOpen && window.location.host !== 'demo.psim.us') {
				if (Config.roomsFirstOpenScript) {
					Config.roomsFirstOpenScript();
				}
				app.roomsFirstOpen = 2;
			}
		},
		updateRoomList: function () {
			var rooms = app.roomsData;
			var buf = '';

			if (rooms.userCount) {
				var userCount = Number(rooms.userCount);
				var battleCount = Number(rooms.battleCount);
				buf += '<table class="roomcounters" border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td>';
				buf += '<span style="' + Tools.getPokemonIcon('meloetta', true) + ';display:inline-block;vertical-align:middle;transform:scaleX(-1);webkit-transform:scaleX(-1);" class="picon" title="Meloetta is PS\'s mascot! The Aria forme is about using its voice, and represents our chatrooms."></span> <button class="button" name="finduser" title="Find an online user"><strong>' + userCount + '</strong> ' + (userCount == 1 ? 'user' : 'users') + ' online</button></td><td>';
				buf += '<button class="button" name="roomlist" title="Watch an active battle"><strong>' + battleCount + '</strong> active ' + (battleCount == 1 ? 'battle' : 'battles') + '</button> <span style="' + Tools.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle" class="picon" title="Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles."></span>';
				buf += '</td></tr></table>';
				this.$('.roomlisttop').html(buf);
			}

			buf = '';
			buf += '<h2 class="rooms-officialchatrooms">Official chat rooms</h2>';
			for (var i = 0; i < rooms.official.length; i++) {
				var roomData = rooms.official[i];
				var id = toId(roomData.title);
				buf += '<div><a href="' + app.root + id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="fa fa-comment-o"></i> ' + Tools.escapeHTML(roomData.title) + '<br /></strong><small>' + Tools.escapeHTML(roomData.desc || '') + '</small></a></div>';
			}
			this.$('.roomlist').first().html(buf);

			buf = '';
			buf += '<h2 class="rooms-chatrooms">Chat rooms</h2>';
			rooms.chat.sort(function (a, b) {
				return b.userCount - a.userCount;
			});
			for (var i = 0; i < rooms.chat.length; i++) {
				var roomData = rooms.chat[i];
				var id = toId(roomData.title);
				var escapedDesc = Tools.escapeHTML(roomData.desc || '');
				buf += '<div><a href="' + app.root + id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="fa fa-comment-o"></i> ' + Tools.escapeHTML(roomData.title) + '<br /></strong><small>' + escapedDesc + '</small></a></div>';
			}
			this.$('.roomlist').last().html(buf);
		},
		roomlist: function () {
			app.joinRoom('battles');
		},
		closeHide: function () {
			app.sideRoom = app.curSideRoom = null;
			this.close();
		},
		finduser: function () {
			if (app.isDisconnected) {
				app.addPopupMessage("You are offline.");
				return;
			}
			app.addPopupPrompt("Username", "Open", function (target) {
				if (!target) return;
				if (toId(target) === 'zarel') {
					app.addPopup(Popup, {htmlMessage: "Zarel is very busy; please don't contact him this way. If you're looking for help, try <a href=\"/help\">joining the Help room</a>?"});
					return;
				}
				app.addPopup(UserPopup, {name: target});
			});
		}
	});

	var BattlesRoom = this.BattlesRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'battles',
		title: 'Battles',
		isSideRoom: true,
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><button class="button" name="refresh"><i class="fa fa-refresh"></i> Refresh</button> <span style="' + Tools.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle" class="picon" title="Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles."></span></p>';

			buf += '<p><label class="label">Format:</label><button class="select formatselect" name="selectFormat">(All formats)</button></p>';
			buf += '<div class="list"><p>Loading...</p></div>';
			buf += '</div></div>';

			this.$el.html(buf);
			this.$list = this.$('.list');

			this.format = '';
			app.on('init:formats', this.initialize, this);
			app.on('response:roomlist', this.update, this);
			app.send('/cmd roomlist');
			this.update();
		},
		selectFormat: function (format, button) {
			if (!window.BattleFormats) {
				return;
			}
			var self = this;
			app.addPopup(FormatPopup, {format: format, sourceEl: button, selectType: 'watch', onselect: function (newFormat) {
				self.changeFormat(newFormat);
			}});
		},
		changeFormat: function (format) {
			this.format = format;
			app.send('/cmd roomlist ' + this.format);
			this.update();
		},
		focus: function (e) {
			if (e && $(e.target).closest('select, a').length) return;
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				app.send('/cmd roomlist');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=refresh]').focus();
			this.$el.scrollTop(prevPos);
		},
		rejoin: function () {
			app.send('/cmd roomlist');
			this.lastUpdate = new Date().getTime();
		},
		update: function (data) {
			if (!data && !this.data) {
				if (app.isDisconnected) {
					this.$list.html('<p>You are offline.</p>');
				} else {
					this.$list.html('<p>Loading...</p>');
				}
				return;
			}
			this.$('button[name=refresh]')[0].disabled = false;
			if (!data) {
				data = this.data;
			} else {
				this.data = data;
			}
			var buf = '';

			var i = 0;
			for (var id in data.rooms) {
				var roomData = data.rooms[id];
				var matches = ChatRoom.parseBattleID(id);
				if (!matches) {
					continue; // bogus room ID could be used to inject JavaScript
				}
				var format = (matches[1] || '');
				if (this.format && format !== this.format) continue;
				var formatBuf = '';
				if (roomData.minElo) formatBuf += '<small style="float:right">(' + (typeof roomData.minElo === 'number' ? 'rated: ' : '') + Tools.escapeHTML(roomData.minElo) + ')</small>';
				formatBuf += (format ? '<small>[' + Tools.escapeFormat(format) + ']</small><br />' : '');
				var roomDesc = formatBuf + '<em class="p1">' + Tools.escapeHTML(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + Tools.escapeHTML(roomData.p2) + '</em>';
				if (!roomData.p1) {
					matches = id.match(/[^0-9]([0-9]*)$/);
					roomDesc = formatBuf + 'empty room ' + matches[1];
				} else if (!roomData.p2) {
					roomDesc = formatBuf + '<em class="p1">' + Tools.escapeHTML(roomData.p1) + '</em>';
				}
				buf += '<div><a href="' + app.root + id + '" class="ilink">' + roomDesc + '</a></div>';
				i++;
			}

			if (!i) {
				buf = '<p>No ' + Tools.escapeFormat(this.format) + ' battles are going on right now.</p>';
			} else {
				buf = '<p>' + i + (i === 100 ? '+' : '') + ' ' + Tools.escapeFormat(this.format) + ' ' + (i === 1 ? 'battle' : 'battles') + '</p>' + buf;
			}

			this.$list.html(buf);
		},
		refresh: function (i, button) {
			button.disabled = true;
			app.send('/cmd roomlist ' + this.format);
		}
	});

}).call(this, jQuery);
