(function ($) {

	this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		events: {
			'change select[name=sections]': 'refresh'
		},
		isSideRoom: true,
		initialize: function () {
			this.focusedSection = '';

			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:10px" name="closeHide"><i class="fa fa-caret-right"></i> Hide</button>';
			buf += '<div class="roomlisttop"></div>';
			buf += '<div class="roomlist"><p><em style="font-size:20pt">Loading...</em></p></div><div class="roomlist"></div>';
			//buf += '<p><button name="toggleMoreRooms" class="button">Show more rooms</button><p>';
			//buf += '<p><button name="joinRoomPopup" class="button">Join other room</button></p></div>';
			buf += '</div><div class="pad"><h2 class="rooms-officialchatrooms">Plan of Attack!</h2>';
			buf += '<p style="width: 480px;font-size:10pt">Welcome to the Plan of Attack official client! We are small community of Pokemon players who enjoy modded games.</p><p style="width: 480px;font-size:10pt">Our goal for this server is to include as many different fangames as possible, as well as custom concepts created by <strong>you</strong>! Join our discord to submit your own concepts and become a part of our awesome community.</p>';
			buf += '<div class="discordlist"><a href="https://discord.gg/tdZVsWP8T9" target="_blank" rel="noopener" class="ilink"><small style="float:right"></small><strong><i class="fa fa-comment-o"></i> Discord<br></strong><small>Our Discord.</small></a></div>'
			buf += '</div><div class="pad"><h2 class="rooms-officialchatrooms">Rules</h2>';
			buf += '<p style="font-weight:bold;font-size:10pt">1: Play nice</p>';
			buf += '<p style="width: 480px;font-size:10pt">Toxicity/bigotry in any form won\'t be tolerated. We strive for a positive community, you\'re a pokemon fan like everyone around you, try to enjoy the game!</p>';
			buf += '<p style="font-weight:bold;font-size:10pt">2: Keep it PG-13</p>';
			buf += '<p style="width: 480px;font-size:10pt">We are a diverse community, including many people from different backgrounds, mentalities and ages. Likely there will be underage people around, or people that are uncomfortable with NSFW content.</p></div>';

			this.$el.html(buf);
			app.on('response:rooms', this.update, this);
			var settings = Dex.prefs('serversettings');
			if (settings) app.send('/updatesettings ' + JSON.stringify(settings));
			app.send('/cmd rooms');
			app.user.on('change:named', this.updateUser, this);
			this.update();
			this.chatroomInterval = setInterval(function () {
				if (app.curSideRoom && app.curSideRoom.id === 'rooms') {
					app.send('/cmd rooms');
				}
			}, 20 * 1000);
		},
		initSectionSelection: function () {
			var buf = ['<option value="">(All rooms)</option>'];
			var sectionTitles = app.roomsData.sectionTitles;
			if (!sectionTitles) {
				this.$('select[name=sections]').parent().hide();
				return;
			}
			for (var i = 0; i < sectionTitles.length; i++) {
				var sectionName = BattleLog.escapeHTML(sectionTitles[i]);
				buf.push('<option value="' + sectionName + '">' + sectionName + '</option>');
			}
			this.$('select[name=sections]').html(buf.join(''));
		},
		updateUser: function () {
			this.update();
		},
		focus: function () {
			if (new Date().getTime() - this.lastUpdate > 20 * 1000) {
				app.send('/cmd rooms');
				this.lastUpdate = new Date().getTime();
			}
			var prevPos = this.$el.scrollTop();
			if (!this.$('select:focus').length) {
				this.$('button[name=joinRoomPopup]').focus();
			}
			this.$el.scrollTop(prevPos);
		},
		joinRoomPopup: function () {
			app.addPopupPrompt("Room name:", "Join room", function (room) {
				var routeLength = (Config.routes.client + '/').length;
				if (room.substr(0, 7) === 'http://') room = room.slice(7);
				if (room.substr(0, 8) === 'https://') room = room.slice(8);
				if (room.substr(0, routeLength) === Config.routes.client + '/') room = room.slice(routeLength);
				if (room.substr(0, 8) === 'psim.us/') room = room.slice(8);
				if (room.substr(0, document.location.hostname.length + 1) === document.location.hostname + '/') room = room.slice(document.location.hostname.length + 1);
				room = toRoomid(room);
				if (!room) return;
				app.tryJoinRoom(room);
			});
		},
		toggleMoreRooms: function () {
			this.showMoreRooms = !this.showMoreRooms;
			this.updateRoomList();
			this.$el.find('button[name=toggleMoreRooms]').text(
				this.showMoreRooms ? 'Hide more rooms' : 'Show more rooms'
			);
		},
		update: function (rooms) {
			if (rooms) {
				this.lastUpdate = new Date().getTime();
				app.roomsData = rooms;
			}
			if (!app.roomsData) return;
			this.initSectionSelection();
			this.updateRoomList();
			if (!app.roomsFirstOpen && window.location.host !== 'demo.psim.us') {
				if (Config.roomsFirstOpenScript) {
					Config.roomsFirstOpenScript();
				}
				app.roomsFirstOpen = 2;
			}
		},

		renderRoomBtn: function (roomData) {
			var id = toID(roomData.title);
			var buf = '<div><a href="' + app.root + id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="fa fa-comment-o"></i> ' + BattleLog.escapeHTML(roomData.title) + '<br /></strong><small>' + BattleLog.escapeHTML(roomData.desc || '') + '</small></a>';
			if (roomData.subRooms && roomData.subRooms.length) {
				buf += '<div class="subrooms"><i class="fa fa-level-up fa-rotate-90"></i> Subrooms:';
				for (var i = 0; i < roomData.subRooms.length; i++) {
					buf += ' <a class="ilink" href="' + app.root + toID(roomData.subRooms[i]) + '"><i class="fa fa-comment-o"></i> <strong>' + BattleLog.escapeHTML(roomData.subRooms[i]) + '</strong></a>';
				}
				buf += '</div>';
			}
			buf += '</div>';
			return buf;
		},

		compareRooms: function (roomA, roomB) {
			return roomB.userCount - roomA.userCount;
		},
		updateRoomList: function () {
			var rooms = app.roomsData;

			if (rooms.userCount) {
				var userCount = Number(rooms.userCount);
				var battleCount = Number(rooms.battleCount);
				var leftSide = '<button class="button" name="finduser" title="Find an online user"><span class="pixelated usercount" title="Meloetta is PS\'s mascot! The Aria forme is about using its voice, and represents our chatrooms." ></span><strong>' + userCount + '</strong> ' + (userCount == 1 ? 'user' : 'users') + ' online</button> ';
				var rightSide = '<button class="button" name="roomlist" title="Watch an active battle"><span class="pixelated battlecount" title="Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles." ></span><strong>' + battleCount + '</strong> active ' + (battleCount == 1 ? 'battle' : 'battles') + '</button>';
				this.$('.roomlisttop').html('<div class="roomcounters">' + leftSide + '</td><td>' + rightSide + '</div>');
			}

			if (rooms.pspl) {
				for (var i = 0; i < rooms.pspl.length; i++) {
					rooms.pspl[i].spotlight = "Spotlight rooms";
				}
				rooms.chat = rooms.pspl.concat(rooms.chat);
				rooms.pspl = null;
			}
			if (rooms.official) {
				for (var i = 0; i < rooms.official.length; i++) {
					rooms.official[i].section = "Official";
				}
				rooms.chat = rooms.official.concat(rooms.chat);
				rooms.official = null;
			}

			var allRooms = rooms.chat;
			if (this.focusedSection) {
				var sectionFilter = this.focusedSection;
				allRooms = allRooms.filter(function (roomData) {
					return (roomData.section || 'Other') === sectionFilter;
				});
			}

			var spotlightLabel = '';
			var spotlightRooms = [];
			var officialRooms = [];
			var otherRooms = [];
			var hiddenRooms = [];
			for (var i = 0; i < allRooms.length; i++) {
				var roomData = allRooms[i];
				if (roomData.spotlight) {
					spotlightRooms.push(roomData);
					spotlightLabel = roomData.spotlight;
				} else if (roomData.section === 'Official') {
					officialRooms.push(roomData);
				} else if (roomData.privacy === 'hidden') {
					hiddenRooms.push(roomData);
				} else {
					otherRooms.push(roomData);
				}
			}

			this.$('.roomlist').first().html(
				(officialRooms.length ?
					'<h2 class="rooms-officialchatrooms">Chat rooms</h2>' + officialRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				) +
				(spotlightRooms.length ?
					'<h2 class="rooms-psplchatrooms">' + BattleLog.escapeHTML(spotlightLabel) + '</h2>' + spotlightRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : ''
				)
			);
			this.$('.roomlist').last().html(
				(otherRooms.length ?
					'<h2 class="rooms-chatrooms">Chat rooms</h2>' + otherRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : '') +
				(hiddenRooms.length && this.showMoreRooms ?
					'<h2 class="rooms-chatrooms">Hidden rooms</h2>' + hiddenRooms.sort(this.compareRooms).map(this.renderRoomBtn).join("") : '')
			);
		},
		roomlist: function () {
			app.joinRoom('battles');
		},
		closeHide: function () {
			app.sideRoom = app.curSideRoom = null;
			clearInterval(this.chatroomInterval);
			this.chatroomInterval = null;
			this.close();
		},
		finduser: function () {
			if (app.isDisconnected) {
				app.addPopupMessage("You are offline.");
				return;
			}
			app.addPopupPrompt("Username", "Open", function (target) {
				if (!target) return;
				if (toID(target) === 'zarel') {
					app.addPopup(Popup, {htmlMessage: "Zarel is very busy; please don't contact him this way. If you're looking for help, try <a href=\"/help\">joining the Help room</a>?"});
					return;
				}
				app.addPopup(UserPopup, {name: target});
			});
		},
		refresh: function () {
			var section = this.$('select[name=sections]').val();
			this.focusedSection = section;
			this.updateRoomList();
		}
	});

	this.BattlesRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'battles',
		title: 'Battles',
		isSideRoom: true,
		events: {
			'change select[name=elofilter]': 'refresh',
			'submit .search': 'submitSearch'
		},
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			var buf = '<div class="pad"><button class="button" style="float:right;font-size:10pt;margin-top:3px" name="close"><i class="fa fa-times"></i> Close</button><div class="roomlist"><p><button class="button" name="refresh"><i class="fa fa-refresh"></i> Refresh</button> <span style="' + Dex.getPokemonIcon('meloetta-pirouette') + ';display:inline-block;vertical-align:middle" class="picon" title="Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles."></span></p>';

			buf += '<p><label class="label">Format:</label><button class="select formatselect" name="selectFormat">(All formats)</button></p>';
			buf += '<label>Minimum Elo: <select name="elofilter"><option value="none">None</option><option value="1100">1100</option><option value="1300">1300</option><option value="1500">1500</option><option value="1700">1700</option><option value="1900">1900</option></select></label>';
			buf += '<p><form class="search"><input type="text" name="prefixsearch" class="textbox" value="' + BattleLog.escapeHTML(this.usernamePrefix) + '" placeholder="username prefix"/><button type="submit" class="button">Search</button></form></p>';
			buf += '<div class="list"><p>Loading...</p></div>';
			buf += '</div></div>';

			this.$el.html(buf);
			this.$list = this.$('.list');
			this.$refreshButton = this.$('button[name=refresh]');

			this.format = '';
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
			this.data = null;
			this.update();
			this.refresh();
		},
		focus: function (e) {
			if (e && $(e.target).is('input')) return;
			if (e && $(e.target).closest('select, a').length) return;
			if (new Date().getTime() - this.lastUpdate > 60 * 1000) {
				this.refresh();
			}
			var prevPos = this.$el.scrollTop();
			this.$('button[name=refresh]').focus();
			this.$el.scrollTop(prevPos);
		},
		rejoin: function () {
			this.refresh();
		},
		renderRoomBtn: function (id, roomData, matches) {
			var format = (matches[1] || '');
			var formatBuf = '';
			if (roomData.minElo) {
				formatBuf += '<small style="float:right">(' + (typeof roomData.minElo === 'number' ? 'rated: ' : '') + BattleLog.escapeHTML('' + roomData.minElo) + ')</small>';
			}
			formatBuf += (format ? '<small>[' + BattleLog.escapeFormat(format) + ']</small><br />' : '');
			var roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em> <small class="vs">vs.</small> <em class="p2">' + BattleLog.escapeHTML(roomData.p2) + '</em>';
			if (!roomData.p1) {
				matches = id.match(/[^0-9]([0-9]*)$/);
				roomDesc = formatBuf + 'empty room ' + matches[1];
			} else if (!roomData.p2) {
				roomDesc = formatBuf + '<em class="p1">' + BattleLog.escapeHTML(roomData.p1) + '</em>';
			}
			return '<div><a href="' + app.root + id + '" class="ilink">' + roomDesc + '</a></div>';
		},
		submitSearch: function (e) {
			e.preventDefault();
			this.refresh();
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

			// Synchronize stored room data with incoming data
			if (data) this.data = data;
			var rooms = this.data.rooms;

			var buf = [];
			for (var id in rooms) {
				var roomData = rooms[id];
				var matches = ChatRoom.parseBattleID(id);
				// bogus room ID could be used to inject JavaScript
				if (!matches || this.format && matches[1] !== this.format) {
					continue;
				}
				buf.push(this.renderRoomBtn(id, roomData, matches));
			}

			if (!buf.length) return this.$list.html('<p>No ' + BattleLog.escapeFormat(this.format) + ' battles are going on right now.</p>');
			return this.$list.html('<p>' + buf.length + (buf.length === 100 ? '+' : '') + ' ' + BattleLog.escapeFormat(this.format) + ' ' + (buf.length === 1 ? 'battle' : 'battles') + '</p>' + buf.join(""));
		},
		refresh: function () {
			var usernamePrefix = this.$('input[name=prefixsearch]').val();
			var elofilter = this.$('select[name=elofilter]').val();
			var searchParams = [this.format, elofilter, toID(usernamePrefix)];
			app.send('/cmd roomlist ' + searchParams.join(','));

			this.lastUpdate = new Date().getTime();
			// Prevent further refreshes until we get a response.
			this.$refreshButton[0].disabled = true;
		}
	});

}).call(this, jQuery);
