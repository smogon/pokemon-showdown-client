(function($) {

	// `defaultserver` specifies the server to use when the domain name in the
	// address bar is `play.pokemonshowdown.com`. If the domain name in the
	// address bar is something else (including `dev.pokemonshowdown.com`), the
	// server to use will be determined by `crossdomain.php`, not this object.
	Config.defaultserver = {
		id: 'showdown',
		host: 'sim.smogon.com',
		port: 8000,
		altport: 80,
		registered: true
	};
	Config.sockjsprefix = '/showdown';
	Config.root = '/';

	var User = this.User = Backbone.Model.extend({
		defaults: {
			name: '',
			userid: '',
			registered: false,
			named: false,
			avatar: 0
		},
		/**
		 * Return the path to the login server `action.php` file. AJAX requests
		 * to this file will always be made on the `play.pokemonshowdown.com`
		 * domain in order to have access to the correct cookies.
		 */
		getActionPHP: function() {
			var ret = '/~~' + Config.server.id + '/action.php';
			if (Config.testclient) {
				ret = 'http://play.pokemonshowdown.com' + ret;
			}
			return (this.getActionPHP = function() {
				return ret;
			})();
		},
		/**
		 * Process a signed assertion returned from the login server.
		 * Emits the following events (arguments in brackets):
		 *
		 *   `login:authrequried` (name)
		 *     triggered if the user needs to authenticate with this name
		 *
		 *   `login:invalidname` (name, error)
		 *     triggered if the user's name is invalid
		 *
		 *   `login:noresponse`
		 *     triggered if the login server did not return a response
		 */
		finishRename: function(name, assertion) {
			if (assertion === ';') {
				this.trigger('login:authrequried', name);
			} else if (assertion.substr(0, 2) === ';;') {
				this.trigger('login:invalidname', name, assertion.substr(2));
			} else if (assertion.indexOf('\n') >= 0) {
				this.trigger('login:noresponse');
			} else {
				app.send('/trn ' + name + ',0,' + assertion);
			}
		},
		/**
		 * Rename this user to an arbitrary username. If the username is
		 * registered and the user does not currently have a session
		 * associated with that userid, then the user will be required to
		 * authenticate.
		 *
		 * See `finishRename` above for a list of events this can emit.
		 */
		rename: function(name) {
			if (this.userid !== toUserid(name)) {
				var query = this.getActionPHP() + '?act=getassertion&userid=' +
						encodeURIComponent(toUserid(name)) +
						'&challengekeyid=' + encodeURIComponent(this.challengekeyid) +
						'&challenge=' + encodeURIComponent(this.challenge);
				var self = this;
				$.get(query, function(data) {
					self.finishRename(name, data);
				});
			} else {
				app.send('/trn ' + name);
			}
		},
		challengekeyid: -1,
		challenge: '',
		receiveChallenge: function(attrs) {
			if (attrs.challenge) {
				/**
				 * Rename the user based on the `sid` and `showdown_username` cookies.
				 * Specifically, if the user has a valid session, the user will be
				 * renamed to the username associated with that session. If the user
				 * does not have a valid session but does have a persistent username
				 * (i.e. a `showdown_username` cookie), the user will be renamed to
				 * that name; if that name is registered, the user will be required
				 * to authenticate.
				 *
				 * See `finishRename` above for a list of events this can emit.
				 */
				var query = this.getActionPHP() + '?act=upkeep' +
						'&challengekeyid=' + encodeURIComponent(attrs.challengekeyid) +
						'&challenge=' + encodeURIComponent(attrs.challenge);
				var self = this;
				$.get(query, Tools.safeJSON(function(data) {
					if (!data.username) return;
					if (data.loggedin) {
						self.set('registered', {
							username: data.username,
							userid: toUserid(data.username)
						});
					}
					self.finishRename(data.username, data.assertion);
				}), 'text');
			}
			this.challengekeyid = attrs.challengekeyid;
			this.challenge = attrs.challenge;
		},
		/**
		 * Log out from the server (but remain connected as a guest).
		 */
		logout: function() {
			$.post(this.getActionPHP(), {
				act: 'logout',
				userid: this.userid
			});
			app.send('/logout');
		},
		setPersistentName: function(name) {
			$.cookie('showdown_username', (name !== undefined) ? name : this.get('name'), {
				expires: 14
			});
		},
		/**
		 * This function loads teams from `localStorage` or cookies. This function
		 * is only used if the client is running on `play.pokemonshowdown.com`. If the
		 * client is running on another domain (including `dev.pokemonshowdown.com`),
		 * then teams are received from `crossdomain.php` instead.
		 */
		teams: null,
		loadTeams: function() {
			this.teams = [];
			if (window.localStorage) {
				var teamString = localStorage.getItem('showdown_teams');
				if (teamString) this.teams = JSON.parse(teamString);
			} else {
				this.cookieTeams = true;
				var savedTeam = $.parseJSON($.cookie('showdown_team1'));
				if (savedTeam) {
					this.teams.push(savedTeam);
				}
				savedTeam = $.parseJSON($.cookie('showdown_team2'));
				if (savedTeam) {
					this.teams.push(savedTeam);
				}
				savedTeam = $.parseJSON($.cookie('showdown_team3'));
				if (savedTeam) {
					this.teams.push(savedTeam);
				}
			}
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

			this.on('init:unsupported', function() {
				alert('Your browser is unsupported.');
			});

			this.on('init:nothirdparty', function() {
				alert('You have third-party cookies disabled in your browser, which is likely to cause problems. You should enable them and then refresh this page.');
			});

			this.user.on('login:authrequried', function(name) {
				alert('The name ' + name + ' is registered, but you aren\'t logged in :(');
			});

			this.initializeConnection();
		},
		/**
		 * Start up the client, including loading teams and preferences,
		 * determining which server to connect to, and actually establishing
		 * a connection to that server.
		 *
		 * Triggers the following events (arguments in brackets):
		 *   `init:unsupported`
		 * 	   triggered if the user's browser is unsupported
		 *
		 *   `init:loadteams` (teams)
		 *     triggered when loads are finished loading
		 *
		 *   `init:nothirdparty`
		 *     triggered if the user has third-party cookies disabled and
		 *     third-party cookies/storage are necessary for full functioning
		 *     (i.e. stuff will probably be broken for the user, so show an
		 *     error message)
		 *
		 *   `init:socketopened`
		 *     triggered once a socket has been opened to the sim server; this
		 *     does NOT mean that the user has signed in yet, merely that the
		 *     SockJS connection has been established.
		 *
		 *   `init:connectionerror`
		 *     triggered if a connection to the sim server could not be
		 *     established
		 *
		 *   `init:socketclosed`
		 *     triggered if the SockJS socket closes
		 *
		 *   `init:identify`
 		 *     triggered once the user has successfully identified (i.e. logged
		 *     in) with the server
		 */
		initializeConnection: function() {
			var origindomain = 'play.pokemonshowdown.com';
			if (document.location.hostname === origindomain) {
				this.user.loadTeams();
				this.trigger('init:loadteams');
				Config.server = Config.defaultserver;
				return this.connect();
			} else if (!window.postMessage) {
				// browser does not support cross-document messaging
				return this.trigger('init:unsupported');
			}
			// If the URI in the address bar is not `play.pokemonshowdown.com`,
			// we receive teams, prefs, and server connection information from
			// crossdomain.php on play.pokemonshowdown.com.
			var self = this;
			$(window).on('message', (function() {
				var origin = document.location.protocol + '//' + origindomain;
				var callbacks = {};
				var callbackIdx = 0;
				return function($e) {
					var e = $e.originalEvent;
					if (e.origin !== origin) return;
					var data = $.parseJSON(e.data);
					if (data.server) {
						var postCrossDomainMessage = function(data) {
							return e.source.postMessage($.toJSON(data), origin);
						};
						// server config information
						Config.server = data.server;
						if (Config.server.registered) {
							var $link = $('<link rel="stylesheet" ' +
								'href="//play.pokemonshowdown.com/customcss.php?server=' +
								encodeURIComponent(Config.server.id) + '" />');
							$('head').append($link);
						}
						// persistent username
						self.user.setPersistentName = function() {
							postCrossDomainMessage({username: this.get('name')});
						};
						// ajax requests
						$.get = function(uri, callback, type) {
							var idx = callbackIdx++;
							callbacks[idx] = callback;
							postCrossDomainMessage({get: [uri, idx, type]});
						};
						$.post = function(uri, data, callback, type) {
							var idx = callbackIdx++;
							callbacks[idx] = callback;
							postCrossDomainMessage({post: [uri, data, idx, type]});
						};
						// teams
						if (data.teams) {
							self.user.cookieTeams = false;
							self.user.teams = $.parseJSON(data.teams);
						} else {
							self.user.teams = [];
						}
						TeambuilderRoom.writeTeams = function(teams) {
							postCrossDomainMessage({teams: $.toJSON(teams)});
						};
						self.trigger('init:loadteams');
						// prefs
						if (data.prefs) {
							Tools.prefs.data = $.parseJSON(data.prefs);
						}
						Tools.prefs.save = function() {
							postCrossDomainMessage({prefs: $.toJSON(this.data)});
						};
						// check for third-party cookies being disabled
						if (data.nothirdparty) {
							self.trigger('init:nothirdparty');
						}
						// connect
						self.connect();
					} else if (data.ajax) {
						var idx = data.ajax[0];
						if (callbacks[idx]) {
							callbacks[idx](data.ajax[1]);
							delete callbacks[idx];
						}
					}
				};
			})());
			// Note that the URI here is intentionally `play.pokemonshowdown.com`,
			// and not `dev.pokemonshowdown.com`, in order to make teams, prefs,
			// and other things work properly.
			var $iframe = $(
				'<iframe src="//play.pokemonshowdown.com/crossdomain.php?host=' +
				encodeURIComponent(document.location.hostname) +
				'&path=' + encodeURIComponent(document.location.pathname.substr(1)) +
				'" style="display: none;"></iframe>'
			);
			$('body').append($iframe);
		},
		/**
		 * This function establishes the actual connection to the sim server.
		 * This is intended to be called only by `initializeConnection` above.
		 * Don't call this function directly.
		 */
		connect: function() {
			var self = this;
			var constructSocket = function() {
				return new SockJS('http://' + Config.server.host + ':' +
					Config.server.port + Config.sockjsprefix);
			};
			this.socket = constructSocket();

			/**
			 * This object defines event handles for JSON-style messages.
			 */
			var events = {
				init: function (data) {
					if (data.name !== undefined) {
						self.user.set({
							name: data.name,
							userid: toUserid(data.name),
							named: data.named
						});
					}
					// TODO: All other handling of `init` messages.
				},
				update: function (data) {
					if (data.name !== undefined) {
						self.user.set({
							name: data.name,
							userid: toUserid(data.name),
							named: data.named
						});
						if (!data.named) {
							self.user.setPersistentName(null); // kill `showdown_username` cookie
						}
					}
					// TODO: All other handling of `update` messages.
				},
				/**
				 * TODO: Handle all other JSON-style messages.
				 */
				disconnect: function () {},
				nameTaken: function (data) {},
				message: function (message) {},
				command: function (message) {},
				console: function (message) {}
			};

			var socketopened = false;
			var altport = (Config.server.port === Config.server.altport);
			var altprefix = false;

			this.socket.onopen = function() {
				socketopened = true;
				if (altport && window._gaq) {
					_gaq.push(['_trackEvent', 'Alt port connection', Config.server.id]);
				}
				self.trigger('init:socketopened');
				// Join the lobby. This is necessary for now.
				// TODO: Revise this later if desired.
				self.send({room: 'lobby'}, 'join');
			};
			this.socket.onmessage = function(msg) {
				if (msg.data.substr(0,1) !== '{') {
					self.receive(msg.data);
					return;
				}
				var data = $.parseJSON(msg.data);
				if (!data) return;
				// Handle JSON messages.
				if (events[data.type]) events[data.type](data);
			};
			var reconstructSocket = function(socket) {
				var s = constructSocket();
				s.onopen = socket.onopen;
				s.onmessage = socket.onmessage;
				s.onclose = socket.onclose;
				return s;
			};
			this.socket.onclose = function() {
				if (!socketopened) {
					if (Config.server.altport && !altport) {
						altport = true;
						Config.server.port = Config.server.altport;
						self.socket = reconstructSocket(self.socket);
						return;
					}
					if (!altprefix) {
						altprefix = true;
						Config.sockjsprefix = '';
						self.socket = reconstructSocket(self.socket);
						return;
					}
					return self.trigger('init:connectionerror');
				}
				self.trigger('init:socketclosed');
			};
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
		receive: function(data) {
			console.log('received: '+data);
			var roomid = '';
			if (data.substr(0,1) === '>') {
				var nlIndex = data.indexOf('\n');
				if (nlIndex < 0) return;
				roomid = data.substr(1,nlIndex-1);
				data = data.substr(nlIndex+1);
			}
			if (roomid) {
				if (this.rooms[roomid]) {
					this.rooms[roomid].receive(data);
				}
				return;
			}

			var parts = data.split('|');
			if (parts.length < 2) return false;

			switch (parts[1]) {
			case 'challenge-string':
			case 'challstr':
				this.user.receiveChallenge({
					challengekeyid: parseInt(parts[2], 10),
					challenge: parts[3]
				});
				break;
			default:
				this.joinRoom('lobby');
				this.rooms['lobby'].receive(data);
				break;
			}
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
			this.$el.html('<img class="logo" src="/pokemonshowdownbeta.png" alt="Pokemon Showdown! (beta)" /><div class="tabbar maintabbar"></div><div class="tabbar sidetabbar" style="display:none"></div>');
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

}).call(this, jQuery);
