(function($) {

	Config.defaultserver = {
		server: 'sim.smogon.com',
		serverid: 'dev',
		serverport: 8001,
		serverprotocol: 'ws',
		registered: true
	};
	Config.sockjsprefix = '/showdown';
	Config.root = '/';

	var User = this.User = Backbone.Model.extend({
		defaults: {
			name: "Guest",
			registered: false,
			named: false,
			avatar: 0
		}
	});

	var App = this.App = Backbone.Router.extend({
		root: '/',
		routes: {
			'*path': 'dispatchFragment'
		},
		initialize: function() {
			window.app = this;
			$('#main').html('');
			this.initializeRooms();
			this.user = new User();
			this.topbar = new Topbar({el: $('#header')});
			Backbone.history.start({pushState: true});
			this.addRoom('');
		},
		dispatchFragment: function(fragment) {
			this.joinRoom(fragment||'');
		},
		/**
		 * Send to sim server
		 */
		send: function(data, type) {
			if (!this.socket) return;
			if (typeof data === 'object') {
				if (type) data.type = type;
				this.socket.send($.toJSON(data));
			} else {
				this.socket.send('|'+data);
			}
		},
		/**
		 * Receive from sim server
		 */
		receive: function() {
			//
		},

		// Room management

		initializeRooms: function() {
			this.rooms = {};
		},
		curRoom: null,
		curSideRoom: null,
		joinRoom: function(id, type) {
			if (this.rooms[id]) {
				this.focusRoom(id);
				return this.rooms[id];
			}

			var room = this.addRoom(id, type);
			this.focusRoom(id);
			return room;
		},
		addRoom: function(id, type) {
			if (this.rooms[id]) return this.rooms[id];

			var el = $('<div class="ps-room" style="display:none"></div>').appendTo('body');
			type = type || {
				'': MainMenuRoom,
				'teambuilder': TeambuilderRoom,
				'ladder': LadderRoom
			}[id];
			if (!type) type = ChatRoom;
			var room = this.rooms[id] = new type({
				id: id,
				el: el
			});
			return room;
		},
		focusRoom: function(id) {
			var room = this.rooms[id];
			if (!room) return false;
			if (this.curRoom === room || this.curSideRoom === room) return true;

			if (this.curRoom) {
				this.curRoom.hide();
				this.curRoom = null;
			}
			this.curRoom = room;
			this.curRoom.show();

			app.navigate(id);
			this.topbar.updateTabbar();
			return;
		},
		leaveRoom: function(id) {
			var room = this.rooms[id];
			if (!room) return false;
			if (room.requestLeave && !room.requestLeave()) return false;
			return this.removeRoom(id);
		},
		removeRoom: function(id) {
			var room = this.rooms[id];
			if (room) {
				if (room === this.curRoom) this.focusRoom('');
				delete this.rooms[id];
				room.destroy();
				this.topbar.updateTabbar();
				return true;
			}
			return false;
		}
	});

	var Topbar = this.Topbar = Backbone.View.extend({
		events: {
			'click a': 'click'
		},
		initialize: function() {
			this.$el.html('<img class="logo" src="//play.pokemonshowdown.com/pokemonshowdownbeta.png" alt="Pokemon Showdown! (beta)" /><div class="tabbar maintabbar"></div><div class="tabbar sidetabbar" style="display:none"></div>');
			this.$tabbar = this.$('.maintabbar');
			this.$sidetabbar = this.$('.sidetabbar');
			this.updateTabbar();
		},
		'$tabbar': null,
		updateTabbar: function() {
			var curId = '';
			if (app.curRoom) curId = app.curRoom.id;
			var buf = '<ul><li><a class="button'+(curId===''?' cur':'')+'" href="'+app.root+'"><i class="icon-home"></i> Home</a></li></ul>';
			var atLeastOne = false;
			for (var id in app.rooms) {
				if (!id) continue;
				var name = id;
				if (id === 'lobby') name = '<i class="icon-comments-alt"></i> Lobby chat';
				else if (id === 'teambuilder') name = '<i class="icon-edit"></i> Teambuilder';
				else if (id === 'ladder') name = '<i class="icon-list-ol"></i> Ladder';
				if (!atLeastOne) {
					buf += ' <ul>';
					atLeastOne = true;
				}
				buf += '<li><a class="button'+(curId===id?' cur':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
			}
			if (atLeastOne) buf += '</ul>';
			this.$tabbar.html(buf);
		},
		click: function(e) {
			e.preventDefault();
			var $target = $(e.currentTarget);
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id);
			} else {
				app.focusRoom(id);
			}
		}
	});

	var Room = this.Room = Backbone.View.extend({

		// communication

		/**
		 * Send to sim server
		 */
		send: function(data, type) {
			if (!app.socket) return;
			if (typeof data === 'object') {
				if (type) data.type = type;
				data.room = this.id;
				app.socket.send($.toJSON(data));
			} else {
				app.socket.send(''+this.id+'|'+data);
			}
		},
		/**
		 * Receive from sim server
		 */
		receive: function(data) {
			//
		},

		// graphical

		show: function() {
			this.$el.show();
			this.focus();
		},
		hide: function() {
			this.blur();
			this.$el.hide();
		},
		focus: function() {},
		blur: function() {},

		// allocation

		destroy: function() {
			this.remove();
			delete this.app;
		}
	});

	var ChatRoom = this.ChatRoom = Room.extend({
		initialize: function() {
			var buf = '<div class="chat-log"><div class="inner"></div><div class="inner-after"></div></div><div class="chat-log-add">Connecting...</div>';
			this.$el.addClass('ps-room-light').html(buf);
			app.user.on('change', this.updateUser, this);
		},
		updateUser: function() {
			//
		}
	});

}).call(this, jQuery);
