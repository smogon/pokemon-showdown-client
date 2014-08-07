(function($) {

	var RoomsRoom = this.RoomsRoom = Room.extend({
		minWidth: 320,
		maxWidth: 1024,
		type: 'rooms',
		title: 'Rooms',
		isSideRoom: true,
		events: {
			'click .ilink': 'clickLink'
		},
		initialize: function() {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			app.on('response:rooms', this.update, this);
			app.send('/cmd rooms');
			app.user.on('change:named', this.updateUser, this);
			this.update();
		},
		clickLink: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			e.stopPropagation();
			var roomid = $(e.currentTarget).attr('href').substr(app.root.length);
			app.tryJoinRoom(roomid);
		},
		updateUser: function() {
			this.update();
		},
		focus: function() {
			if (new Date().getTime() - this.lastUpdate > 60*1000) {
				app.send('/cmd rooms');
				this.lastUpdate = new Date().getTime();
			}
			// this.$('button[name=joinRoomPopup]').focus();
		},
		joinRoomPopup: function() {
			app.addPopupPrompt("Room name:", "Join room", function(room) {
				room = toId(room);
				if (!room) return;
				app.tryJoinRoom(room);
			});
		},
		update: function(rooms) {
			if (rooms) {
				this.lastUpdate = new Date().getTime();
				app.roomsData = rooms;
			} else {
				rooms = app.roomsData;
			}
			var buf = '<div class="pad"><button style="float:right" name="close">Close</button>';
			if (!rooms) {
				buf += '<p>Loading...</p></div>';
				this.$el.html(buf);
				return;
			}
			buf += '<div class="roomlist" style="max-width:480px">';

			if (rooms.userCount) {
				var userCount = Number(rooms.userCount);
				var battleCount = Number(rooms.battleCount);
				buf += '<p style="height:60px">';
				buf += '<span style="float:left;width:200px;height:50px;padding:3px 8px;text-align:center"><strong style="display:block;font-size:18pt;font-weight:normal">'+userCount+'</strong> '+(userCount==1?'user':'users')+' online</span> ';
				buf += '<span style="float:left;width:200px;height:50px;padding:3px 8px;text-align:center"><strong style="display:block;font-size:18pt;font-weight:normal">'+battleCount+'</strong> active '+(battleCount==1?'battle':'battles')+'</span>';
				buf += '</p>';
			}

			buf += '<h2 style="clear:left">Official chat rooms</h2>';
			for (var i=0; i<rooms.official.length; i++) {
				var roomData = rooms.official[i];
				var id = toId(roomData.title);
				buf += '<div><a href="' + app.root+id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="icon-comment-alt"></i> ' + Tools.escapeHTML(roomData.title) + '<br /></strong><small>' + Tools.escapeHTML(roomData.desc||'')+ '</small></a></div>';
			}

			buf += '<h2>Chat rooms</h2>';
			rooms.chat.sort(function(a, b) {
				return b.userCount - a.userCount;
			});
			for (var i=0; i<rooms.chat.length; i++) {
				var roomData = rooms.chat[i];
				var id = toId(roomData.title);
				var escapedDesc = Tools.escapeHTML(roomData.desc||'');
				buf += '<div><a href="' + app.root+id + '" class="ilink"><small style="float:right">(' + Number(roomData.userCount) + ' users)</small><strong><i class="icon-comment-alt"></i> ' + Tools.escapeHTML(roomData.title) + '<br /></strong><small>' + escapedDesc + '</small></a></div>';
			}

			buf += '<p><button name="joinRoomPopup">Join other room</button></p>'

			buf += '</div></div>';
			this.$el.html(buf);
		}
	});

}).call(this, jQuery);
