(function ($) {

	var RoomsRoom = this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		isSideRoom: true,
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button style="float:right" name="close">Close</button><div class="roomlisttop"></div><div class="roomlist" style="max-width:480px"><p><em style="font-size:20pt">Loading...</em></p></div><div class="roomlist" style="max-width:480px"></div><p><button name="joinRoomPopup" class="button">Join other room</button></p></div>';
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
				buf += '<span style="' + Tools.getIcon('meloetta') + ';display:inline-block;vertical-align:middle;transform:scaleX(-1);webkit-transform:scaleX(-1);" class="pokemonicon" title="Meloetta is PS\'s mascot! The Aria forme is about using its voice, and represents our chatrooms."></span> <button class="button" name="finduser"><strong>' + userCount + '</strong> ' + (userCount == 1 ? 'user' : 'users') + ' online</button></td><td>';
				buf += '<button class="button" name="roomlist"><strong>' + battleCount + '</strong> active ' + (battleCount == 1 ? 'battle' : 'battles') + '</button> <span style="' + Tools.getIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle" class="pokemonicon" title="Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles."></span>';
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
			app.addPopup(BattleListPopup);
		},
		finduser: function () {
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

}).call(this, jQuery);
