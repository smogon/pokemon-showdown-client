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

	// sanitize a room ID
	// shouldn't actually do anything except against a malicious server
	var toRoomid = this.toRoomid = function(roomid) {
		return roomid.replace(/[^a-zA-Z0-9-]+/g, '');
	}

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
			this.initializePopups();

			this.user = new User();

			this.topbar = new Topbar({el: $('#header')});
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
			Backbone.history.start({pushState: true});
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
						TeambuilderRoom.saveTeams = function() {
							postCrossDomainMessage({teams: $.toJSON(app.user.teams)});
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
					if (data.room) {
						self.joinRoom(data.room, data.roomType);
						if (data.log) {
							self.rooms[data.room].add(data.log.join('\n'));
						} else if (data.battlelog) {
							self.rooms[data.room].add(data.battlelog.join('\n'));
						}
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
				 * These are all deprecated. Stop using them. :|
				 */
				message: function (message) {},
				console: function (message) {
					if (message.pm) {
						// the only case we're going to handle
						self.rooms[''].addPM(message.name, message.message, message.pm);
						if (self.rooms['lobby']) {
							self.rooms['lobby'].addPM(message.name, message.message, message.pm);
						}
					} else if (message.rawMessage) {
						self.receive('|raw|'+message.rawMessage);
					} else {
						self.receive(message.message);
					}
				},
				disconnect: function () {},
				nameTaken: function (data) {},
				command: function (message) {
					self.trigger('response:'+message.command, message);
				}
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
				if (self.sendQueue) {
					var queue = self.sendQueue;
					delete self.sendQueue;
					for (var i=0; i<queue.length; i++) {
						self.send(queue[i]);
					}
				}
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
			if (!this.socket) {
				if (typeof data === 'string') {
					if (!this.sendQueue) this.sendQueue = [];
					this.sendQueue.push(data);
				}
				return;
			}
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
				if (data.substr(0,6) === '|init|') {
					var roomType = data.substr(6);
					var roomTypeLFIndex = roomType.indexOf('\n');
					if (roomTypeLFIndex >= 0) roomType = roomType.substr(0, roomTypeLFIndex);
					roomType = toId(roomType);
					this.joinRoom(roomid, roomType);
				}
				if (this.rooms[roomid]) {
					this.rooms[roomid].receive(data);
				}
				return;
			}

			var parts;
			if (data.charAt(0) === '|') {
				parts = data.substr(1).split('|');
			} else {
				parts = [];
			}

			switch (parts[0]) {
			case 'challenge-string':
			case 'challstr':
				this.user.receiveChallenge({
					challengekeyid: parseInt(parts[1], 10),
					challenge: parts[2]
				});
				break;

			case 'formats':
				this.parseFormats(parts);
				break;

			default:
				if (data.substr(0,6) === '|init|') {
					this.joinRoom('lobby');
				}
				if (this.rooms['lobby']) {
					this.rooms['lobby'].receive(data);
				}
				break;
			}
		},
		parseFormats: function(formatsList) {
			var isSection = false;
			var section = '';
			BattleFormats = {};
			for (var j=1; j<formatsList.length; j++) {
				if (isSection) {
					section = formatsList[j];
					isSection = false;
				} else if (formatsList[j] === '') {
					isSection = true;
				} else {
					var searchShow = true;
					var challengeShow = true;
					var team = null;
					var name = formatsList[j];
					if (name.substr(name.length-2) === ',#') { // preset teams
						team = 'preset';
						name = name.substr(0,name.length-2);
					}
					if (name.substr(name.length-2) === ',,') { // search-only
						challengeShow = false;
						name = name.substr(0,name.length-2);
					} else if (name.substr(name.length-1) === ',') { // challenge-only
						searchShow = false;
						name = name.substr(0,name.length-1);
					}
					BattleFormats[toId(name)] = {
						id: toId(name),
						name: name,
						team: team,
						section: section,
						searchShow: searchShow,
						challengeShow: challengeShow,
						rated: challengeShow && searchShow,
						isTeambuilderFormat: challengeShow && searchShow && !team,
						effectType: 'Format'
					};
				}
			}
			this.trigger('init:formats');
		},

		/*********************************************************
		 * Rooms
		 *********************************************************/

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
			var typeName = '';
			if (typeof type === 'string') {
				typeName = type;
				type = null;
			}
			var roomTable = {
				'': MainMenuRoom,
				'teambuilder': TeambuilderRoom,
				'ladder': LadderRoom,
				'lobby': ChatRoom,
			};
			var typeTable = {
				'battle': ChatRoom,
				'chat': ChatRoom
			};
			if (roomTable[id]) type = roomTable[id];
			if (!type) type = typeTable[typeName];
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
			this.dismissPopups();
			if (!this.sideRoom) {
				this.curRoom.show('full');
				if (this.curRoom.id === '') {
					if ($('body').width() < this.curRoom.bestWidth) {
						this.curRoom.$el.addClass('tiny-layout');
					} else {
						this.curRoom.$el.removeClass('tiny-layout');
					}
				}
				this.topbar.updateTabbar();
				return;
			}
			var leftMin = (this.curRoom.minWidth || this.curRoom.bestWidth);
			var rightMin = (this.sideRoom.minWidth || this.sideRoom.bestWidth);
			var available = $('body').width();
			if (this.curRoom.isSideRoom) {
				// we're trying to focus a side room
				if (available >= this.rooms[''].tinyWidth + leftMin) {
					// it fits to the right of the main menu, so do that
					this.curSideRoom = this.sideRoom = this.curRoom;
					this.curRoom = this.rooms[''];
					leftMin = this.curRoom.tinyWidth;
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
			} else if (this.curRoom.id === '') {
				leftMin = this.curRoom.tinyWidth;
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

			if (leftMin === this.curRoom.tinyWidth) {
				if (available < this.curRoom.bestWidth + 570) {
					// there's only room for the tiny layout :(
					rightWidth = available - leftMin;
					this.curRoom.show('left', rightWidth);
					this.curRoom.$el.addClass('tiny-layout');
					this.curSideRoom.show('right', rightWidth);
					this.topbar.updateTabbar();
					return;
				}
				leftMin = (this.curRoom.minWidth || this.curRoom.bestWidth);
				this.curRoom.$el.removeClass('tiny-layout');
			}

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
		},

		/*********************************************************
		 * Popups
		 *********************************************************/

		popups: null,
		initializePopups: function() {
			this.popups = [];
		},

		addPopup: function(id, type, data) {
			if (!data) data = {};

			while (this.popups.length) {
				var prevPopup = this.popups[this.popups.length-1];
				if (prevPopup.id === id) {
					var sourceEl = prevPopup.sourceEl[0];
					this.popups.pop().remove();
					if ($(data.sourceEl)[0] === sourceEl) return;
				} else if (prevPopup.id !== id.substr(0,prevPopup.id.length)) {
					this.popups.pop().remove();
				} else {
					break;
				}
			}

			data.id = id;
			data.el = $('<div class="ps-popup"></div>').appendTo('body');
			if (!type) type = Popup;
			var popup = new type(data);
			this.popups.push(popup);
			return popup;
		},
		closePopup: function(id) {
			if (this.popups.length) {
				var popup = this.popups.pop();
				popup.remove();
				return true;
			}
			return false;
		},
		dismissPopups: function() {
			var success = false;
			while (this.popups.length) {
				var popup = this.popups[this.popups.length-1];
				if (popup.type !== 'normal') return success;
				this.popups.pop().remove();
				success = true;
			}
			return success;
		}

	});

	var Topbar = this.Topbar = Backbone.View.extend({
		events: {
			'click a': 'click',
			'click username': 'clickUsername'
		},
		initialize: function() {
			this.$el.html('<img class="logo" src="/pokemonshowdownbeta.png" alt="Pokemon Showdown! (beta)" /><div class="tabbar maintabbar"></div><div class="tabbar sidetabbar" style="display:none"></div><div class="userbar"></div>');
			this.$tabbar = this.$('.maintabbar');
			this.$sidetabbar = this.$('.sidetabbar');
			this.$userbar = this.$('.userbar');
			this.updateTabbar();

			app.user.on('change', this.updateUserbar, this);
			this.updateUserbar();
		},
		'$tabbar': null,
		updateUserbar: function() {
			var buf = '';
			if (app.user.get('named')) {
				buf = '<i class="icon-user" style="color:#779EC5"></i> <span class="username">'+Tools.escapeHTML(app.user.get('name'))+'</span>';
			} else {
				buf = '<i class="icon-user" style="color:#999"></i> <span class="username">'+Tools.escapeHTML(app.user.get('name'))+'</span>';
			}
			this.$userbar.html(buf);
		},
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
				var name = '<i></i>'+id;
				if (id === 'lobby') name = '<i class="icon-comments-alt"></i> Lobby';
				if (id.substr(0,7) === 'battle-') {
					var parts = id.substr(7).split('-');
					name = '<i class="text">'+parts[0]+'</i>'+parts[1];
				}
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
		clickUsername: function(e) {
			e.stopPropagation();
			var name = $(e.currentTarget).data('name');
			app.addPopup('user', UserPopup, {name: name, sourceEl: e.currentTarget});
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
		constructor: function() {
			Backbone.View.apply(this, arguments);
			this.join();
		},

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

		bestWidth: 659,
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
		join: function() {},
		leave: function() {},

		// allocation

		destroy: function() {
			this.leave();
			this.remove();
			delete this.app;
		}
	});

	var Popup = this.Popup = Backbone.View.extend({

		// If type is 'modal', background will turn gray and popup won't be
		// dismissible except by interacting with it.
		// If type is 'semimodal', background will turn gray, but clicking
		// the background will dismiss it.
		// Otherwise, background won't change, and interacting with anything
		// other than the popup will still be possible (and will dismiss
		// the popup).
		type: 'normal',
		width: 300,

		constructor: function(data) {
			if (data && data.sourceEl) {
				this.sourceEl = data.sourceEl = $(data.sourceEl);
				var offset = this.sourceEl.offset();
				var $el = $(data.el || data.$el);

				var room = $(window).height();
				if (offset.top <= room*3/4) {
					$el.css('top', offset.top + this.sourceEl.outerHeight());
				} else {
					$el.css('bottom', room - offset.top);
				}

				$el.css('width', this.width - 22);
				room = $(window).width() - offset.left;
				if (room < this.width + 10) {
					$el.css('right', 10);
				} else {
					$el.css('left', offset.left);
				}
			}
			Backbone.View.apply(this, arguments);
		},

		close: function() {
			app.closePopup();
		}
	});
	var UserPopup = this.UserPopup = Popup.extend({
		initialize: function(data) {
			data.userid = toId(data.name);
			this.data = data = _.extend(data, UserPopup.dataCache[data.userid]);
			app.on('response:userdetails', this.update, this);
			app.send('/cmd userdetails '+data.userid);
			this.update();
		},
		events: {
			'click button': 'dispatchClick',
			'click .ilink': 'clickLink'
		},
		update: function(data) {
			if (data && data.userid === this.data.userid) {
				data = _.extend(this.data, data);
				UserPopup.dataCache[data.userid] = data;
			} else {
				data = this.data;
			}
			var userid = data.userid;
			var name = data.name;
			var avatar = data.avatar || '';
			var groupDetails = {
				'~': "Administrator (~)",
				'&': "Leader (&amp;)",
				'@': "Moderator (@)",
				'%': "Driver (%)",
				'+': "Voiced (+)",
				'!': "<span style='color:#777777'>Muted (!)</span>"
			};
			var group = (groupDetails[name.substr(0, 1)] || '');
			if (group || name.charAt(0) === ' ') name = name.substr(1);

			var buf = '<div class="userdetails">';
			if (avatar) buf += '<img class="trainersprite" src="'+Tools.resolveAvatar(avatar)+'" />';
			buf += '<strong>' + Tools.escapeHTML(name) + '</strong><br />';
			buf += '<small>' + (group || '&nbsp;') + '</small>';
			if (data.rooms) {
				var battlebuf = '';
				var chatbuf = '';
				for (var i in data.rooms) {
					if (i === 'global') continue;
					var roomid = toRoomid(i);
					if (roomid.substr(0,7) === 'battle-') {
						if (!battlebuf) battlebuf = '<br /><em>Battles:</em> ';
						else battlebuf += ', ';
						battlebuf += '<a href="'+app.root+roomid+'" class="ilink">'+roomid.substr(7)+'</a>';
					} else {
						if (!chatbuf) chatbuf = '<br /><em>Chatrooms:</em> ';
						else chatbuf += ', ';
						chatbuf += '<a href="'+app.root+roomid+'" class="ilink">'+roomid+'</a>';
					}
				}
				buf += '<small class="rooms">'+battlebuf+chatbuf+'</small>';
			} else if (data.rooms === false) {
				buf += '<strong class="offline">OFFLINE</strong>';
			}
			buf += '</div>';

			buf += '<div class="buttonbar"><button value="challenge" disabled>Challenge</button> <button value="pm">PM</button> <button value="close">Close</close></div>';

			this.$el.html(buf);
		},
		clickLink: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.close();
			var roomid = $(e.currentTarget).attr('href').substr(app.root.length);
			app.joinRoom(roomid);
		},
		dispatchClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			switch (e.currentTarget.value) {
			case 'challenge':
				break;
			case 'pm':
				this.close();
				app.focusRoom('');
				app.rooms[''].focusPM(this.data.name);
				break;
			case 'close':
				this.close();
				break;
			}
		}
	},{
		dataCache: {}
	});

}).call(this, jQuery);
