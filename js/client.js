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

			$(window).on('resize', _.bind(this.updateLayout, this));
		},
		// the currently active room
		curRoom: null,
		curSideRoom: null,
		sideRoom: null,
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

			this.updateSideRoom(id);
			this.updateLayout();
			if (this.curSideRoom !== room) {
				if (this.curRoom) {
					this.curRoom.hide();
					this.curRoom = null;
				}
				this.curRoom = window.room = room;
				this.updateLayout();
				if (this.curRoom.id === id) this.navigate(id);
			}

			return;
		},
		updateLayout: function() {
			if (!this.curRoom) return; // can happen during initialization
			if (!this.sideRoom) {
				this.curRoom.show('full');
				this.topbar.updateTabbar();
				return;
			}
			var leftMin = (this.curRoom.minWidth || this.curRoom.bestWidth);
			var rightMin = (this.sideRoom.minWidth || this.sideRoom.bestWidth);
			var available = $('body').width();
			if (this.curRoom.isSideRoom) {
				// we're trying to focus a side room
				if (available >= this.rooms[''].minWidth + leftMin) {
					// it fits to the right of the main menu, so do that
					this.curSideRoom = this.sideRoom = this.curRoom;
					this.curRoom = this.rooms[''];
					leftMin = (this.curRoom.minWidth || this.curRoom.bestWidth);
					rightMin = (this.sideRoom.minWidth || this.sideRoom.bestWidth);
				} else if (this.sideRoom) {
					// nooo
					if (this.curSideRoom) {
						this.curSideRoom.hide();
						this.curSideRoom = null;
					}
					this.curRoom.show('full');
					this.topbar.updateTabbar();
					return;
				}
			}
			if (available < leftMin + rightMin) {
				if (this.curSideRoom) {
					this.curSideRoom.hide();
					this.curSideRoom = null;
				}
				this.curRoom.show('full');
				this.topbar.updateTabbar();
				return;
			}
			this.curSideRoom = this.sideRoom;
			var leftMax = (this.curRoom.maxWidth || this.curRoom.bestWidth);
			var rightMax = (this.sideRoom.maxWidth || this.sideRoom.bestWidth);
			var rightWidth = rightMin;
			if (leftMax + rightMax <= available) {
				rightWidth = rightMax;
			} else {
				available -= leftMin + rightMin;
				var wanted = leftMax - leftMin + rightMax - rightMin;
				if (wanted) rightWidth = Math.floor(rightMin + (rightMax - rightMin) * available / wanted);
			}
			this.curRoom.show('left', rightWidth);
			this.curSideRoom.show('right', rightWidth);
			this.topbar.updateTabbar();
		},
		updateSideRoom: function(id) {
			if (id && this.rooms[id].isSideRoom) {
				this.sideRoom = this.rooms[id];
				if (this.curSideRoom && this.curSideRoom !== this.sideRoom) {
					this.curSideRoom.hide();
					this.curSideRoom = this.sideRoom;
				}
				// updateLayout will null curSideRoom if there's
				// no room for this room
			}
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
				if (room === this.sideRoom) {
					this.sideRoom = null;
					this.curSideRoom = null;
					this.updateSideRoom();
				}
				this.updateLayout();
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
			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul><li><a class="button'+(curId===''?' cur':'')+'" href="'+app.root+'"><i class="icon-home"></i> Home</a></li>';
			if (app.rooms.teambuilder) buf += '<li><a class="button'+(curId==='teambuilder'?' cur':'')+' closable" href="'+app.root+'teambuilder"><i class="icon-edit"></i> Teambuilder</a><a class="closebutton" href="'+app.root+'teambuilder"><i class="icon-remove-sign"></i></a></li>';
			if (app.rooms.ladder) buf += '<li><a class="button'+(curId==='ladder'?' cur':'')+' closable" href="'+app.root+'ladder"><i class="icon-list-ol"></i> Ladder</a><a class="closebutton" href="'+app.root+'ladder"><i class="icon-remove-sign"></i></a></li>';
			buf += '</ul>';
			var atLeastOne = false;
			var sideBuf = '';
			for (var id in app.rooms) {
				if (!id || id === 'teambuilder' || id === 'ladder') continue;
				var name = id;
				if (id === 'lobby') name = '<i class="icon-comments-alt"></i> Lobby chat';
				if (app.rooms[id].isSideRoom) {
					if (!sideBuf) sideBuf = '<ul>';
					sideBuf += '<li><a class="button'+(curId===id||curSideId===id?' cur':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
					continue;
				}
				if (!atLeastOne) {
					buf += '<ul>';
					atLeastOne = true;
				}
				buf += '<li><a class="button'+(curId===id?' cur':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
			}
			if (atLeastOne) buf += '</ul>';
			if (app.curSideRoom) {
				var sideWidth = app.curSideRoom.width;
				this.$tabbar.css({right:sideWidth}).html(buf);
				this.$sidetabbar.css({left:'auto',width:sideWidth,right:0}).show().html(sideBuf);
			} else {
				buf += sideBuf;
				this.$tabbar.css({right:0}).html(buf);
				this.$sidetabbar.hide();
			}

			if (app.rooms['']) app.rooms[''].updateRightMenu();
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

		bestWidth: 640,
		show: function(position, rightWidth) {
			switch (position) {
			case 'left':
				this.$el.css({left: 0, width: 'auto', right: rightWidth+1});
				break;
			case 'right':
				this.$el.css({left: 'auto', width: rightWidth, right: 0});
				this.width = rightWidth;
				break;
			case 'full':
				this.$el.css({left: 0, width: 'auto', right: 0});
				break;
			}
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
		minWidth: 320,
		isSideRoom: true,
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
