(function($) {

	if (window.nodewebkit) {
		window.gui = require('nw.gui');
		$('body').on('click', 'a', function(e) {
			if (this.target === '_blank') {
				gui.Shell.openExternal(this.href);
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		});
		window.nwWindow = gui.Window.get();
	}

	Config.version = '0.9.2';
	Config.origindomain = 'play.pokemonshowdown.com';

	// `defaultserver` specifies the server to use when the domain name in the
	// address bar is `Config.origindomain`.
	Config.defaultserver = {
		id: 'showdown',
		host: 'sim.smogon.com',
		port: 443,
		httpport: 8000,
		altport: 80,
		registered: true
	};
	Config.sockjsprefix = '/showdown';
	Config.root = '/';

	// sanitize a room ID
	// shouldn't actually do anything except against a malicious server
	var toRoomid = this.toRoomid = function(roomid) {
		return roomid.replace(/[^a-zA-Z0-9-]+/g, '');
	};

	// support Safari 6 notifications
	if (!window.Notification && window.webkitNotification) {
		window.Notification = window.webkitNotification;
	}

	// this is called being lazy
	window.selectTab = function(tab) {
		app.tryJoinRoom(tab);
		return false;
	};

	// placeholder until the real chart loads
	window.Chart = {
		pokemonRow: function() {},
		itemRow: function() {},
		abilityRow: function() {},
		moveRow: function() {}
	};

	var User = this.User = Backbone.Model.extend({
		defaults: {
			name: '',
			userid: '',
			registered: false,
			named: false,
			avatar: 0
		},
		initialize: function() {
			app.on('response:userdetails', function(data) {
				if (data.userid === this.get('userid')) {
					this.set('avatar', data.avatar);
				}
			}, this);
			var self = this;
			this.on('change:name', function() {
				if (!self.get('named')) {
					self.nameRegExp = null;
				} else {
					self.nameRegExp = new RegExp('\\b'+Tools.escapeRegExp(self.get('name'))+'\\b', 'i');
				}
			});
		},
		/**
		 * Return the path to the login server `action.php` file. AJAX requests
		 * to this file will always be made on the `play.pokemonshowdown.com`
		 * domain in order to have access to the correct cookies.
		 */
		getActionPHP: function() {
			var ret = '/~~' + Config.server.id + '/action.php';
			if (Config.testclient) {
				ret = 'http://' + Config.origindomain + ret;
			}
			return (this.getActionPHP = function() {
				return ret;
			})();
		},
		/**
		 * Process a signed assertion returned from the login server.
		 * Emits the following events (arguments in brackets):
		 *
		 *   `login:authrequired` (name)
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
				this.trigger('login:authrequired', name);
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
			if (this.get('userid') !== toUserid(name)) {
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
		passwordRename: function(name, password) {
			var self = this;
			$.post(this.getActionPHP(), {
				act: 'login',
				name: name,
				pass: password,
				challengekeyid: this.challengekeyid,
				challenge: this.challenge
			}, Tools.safeJSON(function(data) {
				if (data && data.curuser && data.curuser.loggedin) {
					// success!
					self.set('registered', data.curuser);
					self.finishRename(name, data.assertion);
				} else {
					// wrong password
					app.addPopup(LoginPasswordPopup, {
						username: name,
						error: 'Wrong password.'
					});
				}
			}), 'text');
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
				userid: this.get('userid')
			});
			app.send('/logout');
		},
		setPersistentName: function(name) {
			$.cookie('showdown_username', (name !== undefined) ? name : this.get('name'), {
				expires: 14
			});
		},
	});

	var App = this.App = Backbone.Router.extend({
		root: '/',
		routes: {
			'*path': 'dispatchFragment'
		},
		focused: true,
		initialize: function() {
			window.app = this;
			this.initializeRooms();
			this.initializePopups();

			this.user = new User();
			this.ignore = {};

			// down
			// if (document.location.hostname === 'play.pokemonshowdown.com') this.down = 'dos';
			if (document.location.hostname === 'play.pokemonshowdown.com') {
				app.supportsRooms = true;
			}

			this.topbar = new Topbar({el: $('#header')});
			this.addRoom('');
			if (!this.down && $(window).width() >= 916) {
				if (document.location.hostname === 'play.pokemonshowdown.com') {
					this.addRoom('rooms');
				} else {
					this.addRoom('lobby');
				}
			}

			var self = this;

			this.prefsLoaded = false;
			this.on('init:loadprefs', function() {
				self.prefsLoaded = true;
				var bg = Tools.prefs('bg');
				if (bg) {
					$(document.body).css({
						background: bg,
						'background-size': 'cover'
					});
				} else if (Config.server.id === 'smogtours') {
					$(document.body).css({
						background: '#546bac url(//play.pokemonshowdown.com/fx/client-bg-shaymin.jpg) no-repeat left center fixed',
						'background-size': 'cover'
					});
				}

				var muted = Tools.prefs('mute');
				BattleSound.setMute(muted);

				var effectVolume = Tools.prefs('effectvolume');
				if (effectVolume !== undefined) BattleSound.setEffectVolume(effectVolume);

				var musicVolume = Tools.prefs('musicvolume');
				if (musicVolume !== undefined) BattleSound.setBgmVolume(musicVolume);

				if (Tools.prefs('logchat')) Storage.startLoggingChat();
				if (Tools.prefs('showdebug')) {
					var debugStyle = $('#debugstyle').get(0);
					var onCSS = '.debug {display: block;}';
					if (!debugStyle) {
						$('head').append('<style id="debugstyle">'+onCSS+'</style>');
					} else {
						debugStyle.innerHTML = onCSS;
					}
				}

				if (Tools.prefs('bwgfx')) {
					// since xy data is loaded by default, only call
					// loadSpriteData if we want bw sprites
					Tools.loadSpriteData('bw');
				}
			});

			this.on('init:unsupported', function() {
				self.addPopupMessage('Your browser is unsupported.');
			});

			this.on('init:nothirdparty', function() {
				self.addPopupMessage('You have third-party cookies disabled in your browser, which is likely to cause problems. You should enable them and then refresh this page.');
			});

			this.on('init:socketclosed', function() {
				self.reconnectPending = true;
				if (!self.popups.length) self.addPopup(ReconnectPopup);
			});

			this.on('init:connectionerror', function() {
				self.addPopup(ReconnectPopup, {cantconnect: true});
			});

			this.user.on('login:invalidname', function(name, reason) {
				self.addPopup(LoginPopup, {name: name, reason: reason});
			});

			this.user.on('login:authrequired', function(name) {
				self.addPopup(LoginPasswordPopup, {username: name});
			});

			this.on('response:savereplay', this.uploadReplay, this);

			this.on('response:rooms', this.roomsResponse, this);

			if (window.nodewebkit) {
				nwWindow.on('focus', function() {
					if (!self.focused) {
						self.focused = true;
						if (self.curRoom) self.curRoom.dismissNotification();
						if (self.curSideRoom) self.curSideRoom.dismissNotification();
					}
				});
				nwWindow.on('blur', function() {
					self.focused = false;
				});
			} else {
				$(window).on('focus click', function() {
					if (!self.focused) {
						self.focused = true;
						if (self.curRoom) self.curRoom.dismissNotification();
						if (self.curSideRoom) self.curSideRoom.dismissNotification();
					}
				});
				$(window).on('blur', function() {
					self.focused = false;
				});
			}

			$(window).on('keydown', function(e) {
				var el = e.target;
				var tagName = el.tagName.toUpperCase();

				// keypress happened in an empty textarea or a button
				var safeLocation = ((tagName === 'TEXTAREA' && !el.value.length) || tagName === 'BUTTON');

				if (app.curSideRoom && $(e.target).closest(app.curSideRoom.$el).length) {
					// keypress happened in sideroom
					if (e.keyCode === 37 && safeLocation || window.nodewebkit && e.ctrlKey && e.shiftKey && e.keyCode === 9) {
						// Left or Ctrl+Shift+Tab on desktop client
						if (app.topbar.curSideRoomLeft) {
							e.preventDefault();
							e.stopImmediatePropagation();
							app.focusRoom(app.topbar.curSideRoomLeft);
						}
					} else if (e.keyCode === 39 && safeLocation || window.nodewebkit && e.ctrlKey && e.keyCode === 9) {
						// Right or Ctrl+Tab on desktop client
						if (app.topbar.curSideRoomRight) {
							e.preventDefault();
							e.stopImmediatePropagation();
							app.focusRoom(app.topbar.curSideRoomRight);
						}
					}
					return;
				}
				// keypress happened outside of sideroom
				if (e.keyCode === 37 && safeLocation || window.nodewebkit && e.ctrlKey && e.shiftKey && e.keyCode === 9) {
					// Left or Ctrl+Shift+Tab on desktop client
					if (app.topbar.curRoomLeft) {
						e.preventDefault();
						e.stopImmediatePropagation();
						app.focusRoom(app.topbar.curRoomLeft);
					}
				} else if (e.keyCode === 39 && safeLocation || window.nodewebkit && e.ctrlKey && e.keyCode === 9) {
					// Right or Ctrl+Tab on desktop client
					if (app.topbar.curRoomRight) {
						e.preventDefault();
						e.stopImmediatePropagation();
						app.focusRoom(app.topbar.curRoomRight);
					}
				}
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
		 *   `init:loadprefs`
		 *     triggered when preferences/teams are finished loading and are
		 *     safe to read
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
		 */
		initializeConnection: function() {
			if ((document.location.hostname !== Config.origindomain) && !Config.testclient) {
				// Handle *.psim.us.
				return this.initializeCrossDomainConnection();
			} else if (Config.testclient) {
				this.initializeTestClient();
			} else if (document.location.protocol === 'https:') {
				if (!$.cookie('showdown_ssl')) {
					// Never used HTTPS before, so we have to copy over the
					// HTTP origin localStorage. We have to redirect to the
					// HTTP site in order to do this. We set a cookie
					// indicating that we redirected for the purpose of copying
					// over the localStorage.
					$.cookie('showdown_ssl_convert', 1);
					return document.location.replace('http://' + document.location.hostname +
						document.location.pathname);
				}
				// Renew the `showdown_ssl` cookie.
				$.cookie('showdown_ssl', 1, {expires: 365*3});
			} else if (!$.cookie('showdown_ssl')) {
				// localStorage is currently located on the HTTP origin.

				if (!$.cookie('showdown_ssl_convert') || !('postMessage' in window)) {
					// This user is not using HTTPS now and has never used
					// HTTPS before, so her localStorage is still under the
					// HTTP origin domain: connect on port 8000, not 443.
					Config.defaultserver.port = Config.defaultserver.httpport;
				} else {
					// First time using HTTPS: copy the existing HTTP storage
					// over to the HTTPS origin.
					$(window).on('message', function($e) {
						var e = $e.originalEvent;
						var origin = 'https://' + Config.origindomain;
						if (e.origin !== origin) return;
						if (e.data === 'init') {
							Storage.loadTeams();
							e.source.postMessage($.toJSON({
								teams: $.toJSON(Storage.teams),
								prefs: $.toJSON(Tools.prefs.data)
							}), origin);
						} else if (e.data === 'done') {
							// Set a cookie to indicate that localStorage is now under
							// the HTTPS origin.
							$.cookie('showdown_ssl', 1, {expires: 365*3});
							localStorage.clear();
							return document.location.replace('https://' + document.location.hostname +
								document.location.pathname);
						}
					});
					var $iframe = $('<iframe src="https://play.pokemonshowdown.com/crossprotocol.html" style="display: none;"></iframe>');
					$('body').append($iframe);
					return;
				}
			} else {
				// The user is using HTTP right now, but has used HTTPS in the
				// past, so her localStorage is located on the HTTPS origin:
				// hence we need to use the cross-domain code to load the
				// localStorage because the HTTPS origin is considered a
				// different domain for the purpose of localStorage.
				return this.initializeCrossDomainConnection();
			}

			// Simple connection: no cross-domain logic needed.
			Config.server = Config.server || Config.defaultserver;
			// Config.server.afd = true;
			Storage.loadTeams();
			this.trigger('init:loadprefs');
			return this.connect();
		},
		/**
		 * Initialise the client when running on the file:// filesystem.
		 */
		initializeTestClient: function() {
			var self = this;
			var showUnsupported = function() {
				self.addPopupMessage('The requested action is not supported by testclient.html. Please complete this action in the official client instead.');
			};
			$.get = function(uri, callback, type) {
				if (type === 'html') {
					uri += '&testclient';
				}
				if (uri[0] === '/') { // relative URI
					uri = Tools.resourcePrefix + uri.substr(1);
				}
				self.addPopup(ProxyPopup, {uri: uri, callback: callback});
			};
			$.post = function(/*uri, data, callback, type*/) {
				showUnsupported();
			};
		},
		/**
		 * Handle a cross-domain connection: that is, a connection where the
		 * client is loaded from a different domain from the one where the
		 * user's localStorage is located.
		 */
		initializeCrossDomainConnection: function() {
			if (!('postMessage' in window)) {
				// browser does not support cross-document messaging
				return this.trigger('init:unsupported');
			}
			// If the URI in the address bar is not `play.pokemonshowdown.com`,
			// we receive teams, prefs, and server connection information from
			// crossdomain.php on play.pokemonshowdown.com.
			var self = this;
			$(window).on('message', (function() {
				var origin;
				var callbacks = {};
				var callbackIdx = 0;
				return function($e) {
					var e = $e.originalEvent;
					if ((e.origin === 'http://' + Config.origindomain) ||
							(e.origin === 'https://' + Config.origindomain)) {
						origin = e.origin;
					} else {
						return; // unauthorised source origin
					}
					var data = $.parseJSON(e.data);
					if (data.server) {
						var postCrossDomainMessage = function(data) {
							return e.source.postMessage($.toJSON(data), origin);
						};
						// server config information
						Config.server = data.server;
						// Config.server.afd = true;
						if (Config.server.registered) {
							var $link = $('<link rel="stylesheet" ' +
								'href="//play.pokemonshowdown.com/customcss.php?server=' +
								encodeURIComponent(Config.server.id) + '" />');
							$('head').append($link);
						}
						// persistent username
						self.user.setPersistentName = function(name) {
							postCrossDomainMessage({
								username: ((name !== undefined) ? name : this.get('name'))
							});
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
							Storage.teams = $.parseJSON(data.teams) || [];
						} else {
							Storage.teams = [];
						}
						self.trigger('init:loadteams');
						Storage.saveTeams = function() {
							postCrossDomainMessage({teams: $.toJSON(Storage.teams)});
						};
						// prefs
						if (data.prefs) {
							Tools.prefs.data = $.parseJSON(data.prefs);
						}
						self.trigger('init:loadprefs');
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
			if (this.down) return;

			var self = this;
			var constructSocket = function() {
				var protocol = (Config.server.port === 443) ? 'https' : 'http';
				return new SockJS(protocol + '://' + Config.server.host + ':' +
					Config.server.port + Config.sockjsprefix);
			};
			this.socket = constructSocket();

			var socketopened = false;
			var altport = (Config.server.port === Config.server.altport);
			var altprefix = false;

			this.socket.onopen = function() {
				socketopened = true;
				if (altport && window.ga) {
					ga('send', 'event', 'Alt port connection', Config.server.id);
				}
				self.trigger('init:socketopened');

				var avatar = Tools.prefs('avatar');
				if (avatar) {
					// This will be compatible even with servers that don't support
					// the second argument for /avatar yet.
					self.send('/avatar ' + avatar + ',1');
				}

				if (self.sendQueue) {
					var queue = self.sendQueue;
					delete self.sendQueue;
					for (var i=0; i<queue.length; i++) {
						self.send(queue[i], true);
					}
				}
			};
			this.socket.onmessage = function(msg) {
				if (window.console && console.log && (Config.server.id !== 'showdown' || msg.data.charAt(0) !== '|')) {
					console.log('received: '+msg.data);
				}
				if (msg.data.charAt(0) !== '{') {
					self.receive(msg.data);
					return;
				}
				alert("This server is using an outdated version of Pokémon Showdown and needs to be updated.");
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
						if (document.location.protocol === 'https:') {
							return document.location.replace('http://' +
								document.location.host + document.location.pathname);
						}
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
			if (Config.testclient) {
				// Fragment dispatching doesn't work in testclient.html.
				// Just open the main menu.
				fragment = '';
			}
			fragment = toRoomid(fragment || '');
			if (this.initialFragment === undefined) this.initialFragment = fragment;
			this.tryJoinRoom(fragment);
		},
		/**
		 * Send to sim server
		 */
		send: function(data, room) {
			if (room && room !== 'lobby' && room !== true) {
				data = room+'|'+data;
			} else if (room !== true) {
				data = '|'+data;
			}
			if (!this.socket || (this.socket.readyState !== SockJS.OPEN)) {
				if (!this.sendQueue) this.sendQueue = [];
				this.sendQueue.push(data);
				return;
			}
			this.socket.send(data);
		},
		/**
		 * Send team to sim server
		 */
		sendTeam: function(team) {
			this.send('/utm '+Storage.packTeam(team));
		},
		/**
		 * Receive from sim server
		 */
		receive: function(data) {
			var roomid = '';
			if (data.substr(0,1) === '>') {
				var nlIndex = data.indexOf('\n');
				if (nlIndex < 0) return;
				roomid = toRoomid(data.substr(1,nlIndex-1));
				data = data.substr(nlIndex+1);
			}
			if (data.substr(0,6) === '|init|') {
				if (!roomid) roomid = 'lobby';
				var roomType = data.substr(6);
				var roomTypeLFIndex = roomType.indexOf('\n');
				if (roomTypeLFIndex >= 0) roomType = roomType.substr(0, roomTypeLFIndex);
				roomType = toId(roomType);
				if (this.rooms[roomid] || roomid === 'staff') {
					// staff is always joined in background
					this.addRoom(roomid, roomType, true);
				} else {
					this.joinRoom(roomid, roomType, true);
				}
			} else if ((data+'|').substr(0,8) === '|expire|') {
				var room = this.rooms[roomid];
				if (room) {
					room.expired = true;
					if (room.updateUser) room.updateUser();
				}
				return;
			} else if ((data+'|').substr(0,8) === '|deinit|' || (data+'|').substr(0,8) === '|noinit|') {
				if (!roomid) roomid = 'lobby';

				if (this.rooms[roomid] && this.rooms[roomid].expired) {
					// expired rooms aren't closed when left
					return;
				}

				var isdeinit = (data.charAt(1) === 'd');
				data = data.substr(8);
				var pipeIndex = data.indexOf('|');
				var errormessage;
				if (pipeIndex >= 0) {
					errormessage = data.substr(pipeIndex+1);
					data = data.substr(0, pipeIndex);
				}
				// handle error codes here
				// data is the error code
				if (data === 'namerequired') {
					this.removeRoom(roomid);
					var self = this;
					this.once('init:choosename', function() {
						self.joinRoom(roomid);
					});
				} else {
					if (isdeinit) { // deinit
						this.removeRoom(roomid);
					} else { // noinit
						this.unjoinRoom(roomid);
						if (roomid === 'lobby') this.joinRoom('rooms');
					}
					if (errormessage) {
						this.addPopupMessage(errormessage);
					}
				}
				return;
			}
			if (roomid) {
				if (this.rooms[roomid]) {
					this.rooms[roomid].receive(data);
				}
				return;
			}

			// Since roomid is blank, it could be either a global message or
			// a lobby message. (For bandwidth reasons, lobby messages can
			// have blank roomids.)

			// If it starts with a messagetype in the global messagetype
			// list, we'll assume global; otherwise, we'll assume lobby.

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

			case 'updateuser':
				var nlIndex = data.indexOf('\n');
				if (nlIndex > 0) {
					this.receive(data.substr(nlIndex+1));
					nlIndex = parts[3].indexOf('\n');
					parts[3] = parts[3].substr(0, nlIndex);
				}
				var name = parts[1];
				var named = !!+parts[2];
				this.user.set({
					name: name,
					userid: toUserid(name),
					named: named,
					avatar: parts[3]
				});
				this.user.setPersistentName(named ? name : null);
				if (named) {
					this.trigger('init:choosename');
				}
				break;

			case 'nametaken':
				app.addPopup(LoginPopup, {name: parts[1] || '', reason: parts[2] || ''});
				break;

			case 'queryresponse':
				var responseData = JSON.parse(data.substr(16+parts[1].length));
				app.trigger('response:'+parts[1], responseData);
				break;

			case 'updatechallenges':
				if (this.rooms['']) {
					this.rooms[''].updateChallenges($.parseJSON(data.substr(18)));
				}
				break;

			case 'updatesearch':
				if (this.rooms['']) {
					this.rooms[''].updateSearch($.parseJSON(data.substr(14)));
				}
				break;

			case 'popup':
				this.addPopupMessage(data.substr(7).replace(/\|\|/g, '\n'));
				if (this.rooms['']) this.rooms[''].resetPending();
				break;

			case 'pm':
				var message = parts.slice(3).join('|');

				this.rooms[''].addPM(parts[1], message, parts[2]);
				break;

			case 'roomerror':
				// deprecated; use |deinit| or |noinit|
				this.unjoinRoom(parts[1]);
				this.addPopupMessage(parts.slice(2).join('|'));
				break;

			case 'c':
			case 'chat':
				if (parts[1] === '~') {
					if (parts[2].substr(0, 6) === '/warn ') {
						app.addPopup(RulesPopup, {warning: parts[2].substr(6)});
						break;
					}
				}
				/* falls through */

			default:
				// the messagetype wasn't in our list of recognized global
				// messagetypes; so the message is presumed to be for the
				// lobby.
				if (this.rooms['lobby']) {
					this.rooms['lobby'].receive(data);
				}
				break;
			}
		},
		parseFormats: function(formatsList) {
			var isSection = false;
			var section = '';

			var column = 0;
			var columnChanged = false;

			BattleFormats = {};
			for (var j=1; j<formatsList.length; j++) {
				if (isSection) {
					section = formatsList[j];
					isSection = false;
				} else if (formatsList[j] === '' || (formatsList[j].substr(0, 1) === ',' && !isNaN(formatsList[j].substr(1)))) {
					isSection = true;

					if (formatsList[j]) {
						var newColumn = parseInt(formatsList[j].substr(1)) || 0;
						if (column !== newColumn) {
							column = newColumn;
							columnChanged = true;
						}
					}
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
					var id = toId(name);
					var isTeambuilderFormat = searchShow && !team;
					var teambuilderFormat = undefined;
					if (isTeambuilderFormat) {
						var parenPos = name.indexOf('(');
						if (parenPos > 0 && name.charAt(name.length-1) === ')') {
							// variation of existing tier
							teambuilderFormat = toId(name.substr(0, parenPos));
							if (BattleFormats[teambuilderFormat]) {
								BattleFormats[teambuilderFormat].isTeambuilderFormat = true;
							} else {
								BattleFormats[teambuilderFormat] = {
									id: teambuilderFormat,
									name: $.trim(name.substr(0, parenPos)),
									team: team,
									section: section,
									column: column,
									rated: false,
									isTeambuilderFormat: true,
									effectType: 'Format'
								};
							}
							isTeambuilderFormat = false;
						}
					}
					if (BattleFormats[id] && BattleFormats[id].isTeambuilderFormat) {
						isTeambuilderFormat = true;
					}
					BattleFormats[id] = {
						id: id,
						name: name,
						team: team,
						section: section,
						column: column,
						searchShow: searchShow,
						challengeShow: challengeShow,
						rated: searchShow && id.substr(0,7) !== 'unrated',
						teambuilderFormat: teambuilderFormat,
						isTeambuilderFormat: isTeambuilderFormat,
						effectType: 'Format'
					};
				}
			}
			BattleFormats._supportsColumns = columnChanged;
			this.trigger('init:formats');
		},
		uploadReplay: function(data) {
			var id = data.id;
			var serverid = Config.server.id && toId(Config.server.id.split(':')[0]);
			if (serverid && serverid !== 'showdown') id = serverid+'-'+id;
			$.post(app.user.getActionPHP() + '?act=uploadreplay', {
				log: data.log,
				id: id
			}, function(data) {
				if ((serverid === 'showdown') && (data === 'invalid id')) {
					data = 'not found';
				}
				if (data === 'success') {
					app.addPopup(ReplayUploadedPopup, {id: id});
				} else if (data === 'hash mismatch') {
					app.addPopupMessage("Someone else is already uploading a replay of this battle. Try again in five seconds.");
				} else if (data === 'not found') {
					app.addPopupMessage("This server isn't registered, and doesn't support uploading replays.");
				} else if (data === 'invalid id') {
					app.addPopupMessage("This server is using invalid battle IDs, so this replay can't be uploaded.");
				} else {
					app.addPopupMessage("Error while uploading replay: "+data);
				}
			});
		},
		roomsResponse: function(data) {
			this.supportsRooms = true;
			if (data) {
				this.roomsData = data;
			}
		},
		clearGlobalListeners: function() {
			// jslider doesn't clear these when it should,
			// so we have to do it for them :/
			$(document).off('click touchstart mousedown touchmove mousemove touchend mouseup');
		},

		/*********************************************************
		 * Rooms
		 *********************************************************/

		initializeRooms: function() {
			this.rooms = Object.create(null); // {}

			$(window).on('resize', _.bind(this.resize, this));
		},
		fixedWidth: true,
		resize: function() {
			if (window.screen && screen.width && screen.width >= 640) {
				if (this.fixedWidth) {
					document.getElementById('viewport').setAttribute('content','width=device-width');
					this.fixedWidth = false;
				}
			} else {
				if (!this.fixedWidth) {
					document.getElementById('viewport').setAttribute('content','width=640');
					this.fixedWidth = true;
				}
			}
			this.updateLayout();
		},
		// the currently active room
		curRoom: null,
		curSideRoom: null,
		sideRoom: null,
		joinRoom: function(id, type, nojoin) {
			if (this.rooms[id]) {
				this.focusRoom(id);
				return this.rooms[id];
			}

			var room = this._addRoom(id, type, nojoin);
			this.focusRoom(id);
			return room;
		},
		/**
		 * We tried to join a room but it didn't exist
		 */
		unjoinRoom: function(id, noinit) {
			if (Config.server.id && this.rooms[id] && this.rooms[id].type === 'battle') {
				if (id === this.initialFragment) {
					// you were direct-linked to this nonexistent room
					var replayid = id.substr(7);
					if (Config.server.id !== 'showdown') replayid = Config.server.id+'-'+replayid;
					document.location.replace('http://pokemonshowdown.com/replay/'+replayid);
					return;
				}
			}
			this.removeRoom(id);
			if (this.curRoom) this.navigate(this.curRoom.id, {replace: true});
		},
		tryJoinRoom: function(id) {
			this.joinRoom(id);
		},
		addRoom: function(id, type, nojoin) {
			this._addRoom(id, type, nojoin);
			this.updateSideRoom();
			this.updateLayout();
		},
		_addRoom: function(id, type, nojoin) {
			var oldRoom;
			if (this.rooms[id]) {
				if (type && this.rooms[id].type !== type) {
					// this room changed type
					// (or the type we guessed it would be was wrong)
					var oldRoom = this.rooms[id];
					oldRoom.destroy();
					delete this.rooms[id];
				} else {
					return this.rooms[id];
				}
			}

			var el;
			if (!id) {
				el = $('#mainmenu');
			} else {
				el = $('<div class="ps-room" style="display:none"></div>').appendTo('body');
			}
			var typeName = '';
			if (typeof type === 'string') {
				typeName = type;
				type = null;
			}
			var roomTable = {
				'': MainMenuRoom,
				'teambuilder': TeambuilderRoom,
				'rooms': RoomsRoom,
				'ladder': LadderRoom,
				'lobby': ChatRoom,
				'staff': ChatRoom,
			};
			var typeTable = {
				'battle': BattleRoom,
				'chat': ChatRoom
			};

			// the passed type overrides everything else
			if (typeName) type = typeTable[typeName];

			// otherwise, the room table has precedence
			if (!type) type = roomTable[id];

			// otherwise, infer the room type
			if (!type) {
				if (id.substr(0,7) === 'battle-') {
					type = BattleRoom;
				} else {
					type = ChatRoom;
				}
			}

			var room = this.rooms[id] = new type({
				id: id,
				el: el,
				nojoin: nojoin
			});
			if (oldRoom) {
				if (this.curRoom === oldRoom) this.curRoom = room;
				if (this.curSideRoom === oldRoom) this.curSideRoom = room;
				if (this.sideRoom === oldRoom) this.sideRoom = room;
			}
			return room;
		},
		focusRoom: function(id) {
			var room = this.rooms[id];
			if (!room) return false;
			if (this.curRoom === room || this.curSideRoom === room) {
				room.focus();
				return true;
			}

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

			room.focus();
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
			var leftMinMain = (this.curRoom.minMainWidth || leftMin);
			var rightMin = (this.sideRoom.minWidth || this.sideRoom.bestWidth);
			var available = $(window).width();
			if (this.curRoom.isSideRoom) {
				// we're trying to focus a side room
				if (available >= this.rooms[''].tinyWidth + leftMinMain) {
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
					this.curRoom.show('left', leftMin);
					this.curRoom.$el.addClass('tiny-layout');
					this.curSideRoom.show('right', leftMin);
					this.topbar.updateTabbar();
					return;
				}
				leftMin = (this.curRoom.minWidth || this.curRoom.bestWidth);
				this.curRoom.$el.removeClass('tiny-layout');
			}

			var leftMax = (this.curRoom.maxWidth || this.curRoom.bestWidth);
			var rightMax = (this.sideRoom.maxWidth || this.sideRoom.bestWidth);
			var leftWidth = leftMin;
			if (leftMax + rightMax <= available) {
				leftWidth = leftMax;
			} else {
				var bufAvailable = available - leftMin - rightMin;
				var wanted = leftMax - leftMin + rightMax - rightMin;
				if (wanted) leftWidth = Math.floor(leftMin + (leftMax - leftMin) * bufAvailable / wanted);
			}
			this.curRoom.show('left', leftWidth);
			this.curSideRoom.show('right', leftWidth);
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
			} else if (!this.sideRoom) {
				for (var i in this.rooms) {
					if (this.rooms[i].isSideRoom) {
						this.sideRoom = this.rooms[i];
					}
				}
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
		openInNewWindow: function(url) {
			if (window.nodewebkit) {
				gui.Shell.openExternal(url);
			} else {
				window.open(url, '_blank');
			}
		},
		clickLink: function(e) {
			if (window.nodewebkit) {
				gui.Shell.openExternal(e.target.href);
				return false;
			}
		},

		/*********************************************************
		 * Popups
		 *********************************************************/

		popups: null,
		initializePopups: function() {
			this.popups = [];
		},

		addPopup: function(type, data) {
			if (!data) data = {};

			if (data.sourceEl === undefined && app.dispatchingButton) {
				data.sourceEl = app.dispatchingButton;
			}
			if (data.sourcePopup === undefined && app.dispatchingPopup) {
				data.sourcePopup = app.dispatchingPopup;
			}
			if (this.dismissingSource && $(data.sourceEl)[0] === this.dismissingSource) return;
			while (this.popups.length) {
				var prevPopup = this.popups[this.popups.length-1];
				if (data.sourcePopup === prevPopup) {
					break;
				}
				var sourceEl = prevPopup.sourceEl ? prevPopup.sourceEl[0] : null;
				this.popups.pop().remove();
				if ($(data.sourceEl)[0] === sourceEl) return;
			}

			if (!type) type = Popup;

			var popup = new type(data);

			var $overlay;
			if (popup.type === 'normal') {
				$('body').append(popup.el);
			} else {
				$overlay = $('<div class="ps-overlay"></div>').appendTo('body').append(popup.el)
				if (popup.type === 'semimodal') {
					$overlay.on('click', function(e) {
						if (e.currentTarget === e.target) {
							popup.close();
						}
					});
				}
			}

			if (popup.domInitialize) popup.domInitialize(data);
			popup.$('.autofocus').select().focus();
			if ($overlay) $overlay.scrollTop(0);
			this.popups.push(popup);
			return popup;
		},
		addPopupMessage: function(message) {
			// shorthand for adding a popup message
			// this is the equivalent of alert(message)
			app.addPopup(Popup, {message: message});
		},
		addPopupPrompt: function(message, buttonOrCallback, callback) {
			var button = (callback ? buttonOrCallback : 'OK');
			callback = (!callback ? buttonOrCallback : callback);
			app.addPopup(PromptPopup, { message: message, button: button, callback: callback });
		},
		closePopup: function(id) {
			if (this.popups.length) {
				var popup = this.popups.pop();
				popup.remove();
				if (this.reconnectPending) this.addPopup(ReconnectPopup);
				return true;
			}
			return false;
		},
		dismissPopups: function() {
			var source = false;
			while (this.popups.length) {
				var popup = this.popups[this.popups.length-1];
				if (popup.type !== 'normal') return source;
				if (popup.sourceEl) source = popup.sourceEl[0];
				if (!source) source = true;
				this.popups.pop().remove();
			}
			return source;
		}

	});

	var Topbar = this.Topbar = Backbone.View.extend({
		events: {
			'click a': 'click',
			'click .username': 'clickUsername',
			'click button': 'dispatchClickButton'
		},
		initialize: function() {
			this.$el.html('<img class="logo" src="' + Tools.resourcePrefix + 'pokemonshowdownbeta.png" alt="Pok&eacute;mon Showdown! (beta)" /><div class="maintabbarbottom"></div><div class="tabbar maintabbar"><div class="inner"></div></div><div class="userbar"></div>');
			this.$tabbar = this.$('.maintabbar .inner');
			// this.$sidetabbar = this.$('.sidetabbar');
			this.$userbar = this.$('.userbar');
			this.updateTabbar();

			app.user.on('change', this.updateUserbar, this);
			this.updateUserbar();
		},

		// userbar
		updateUserbar: function() {
			var buf = '';
			var name = ' '+app.user.get('name');
			var color = hashColor(app.user.get('userid'));
			if (app.user.get('named')) {
				buf = '<span class="username" data-name="'+Tools.escapeHTML(name)+'" style="'+color+'"><i class="icon-user" style="color:#779EC5"></i> '+Tools.escapeHTML(name)+'</span> <button class="icon" name="openSounds"><i class="'+(Tools.prefs('mute')?'icon-volume-off':'icon-volume-up')+'"></i></button> <button class="icon" name="openOptions"><i class="icon-cog"></i></button>';
			} else {
				buf = '<button name="login">Choose name</button> <button class="icon" name="openSounds"><i class="'+(Tools.prefs('mute')?'icon-volume-off':'icon-volume-up')+'"></i></button> <button class="icon" name="openOptions"><i class="icon-cog"></i></button>';
			}
			this.$userbar.html(buf);
		},
		login: function() {
			app.addPopup(LoginPopup);
		},
		openSounds: function() {
			app.addPopup(SoundsPopup);
		},
		openOptions: function() {
			app.addPopup(OptionsPopup);
		},
		clickUsername: function(e) {
			e.stopPropagation();
			var name = $(e.currentTarget).data('name');
			app.addPopup(UserPopup, {name: name, sourceEl: e.currentTarget});
		},

		// tabbar
		updateTabbar: function() {
			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul><li><a class="button'+(curId===''?' cur':'')+(app.rooms['']&&app.rooms[''].notifications?' notifying':'')+'" href="'+app.root+'"><i class="icon-home"></i> <span>Home</span></a></li>';
			if (app.rooms['teambuilder']) buf += '<li><a class="button'+(curId==='teambuilder'?' cur':'')+' closable" href="'+app.root+'teambuilder"><i class="icon-edit"></i> <span>Teambuilder</span></a><a class="closebutton" href="'+app.root+'teambuilder"><i class="icon-remove-sign"></i></a></li>';
			if (app.rooms['ladder']) buf += '<li><a class="button'+(curId==='ladder'?' cur':'')+' closable" href="'+app.root+'ladder"><i class="icon-list-ol"></i> <span>Ladder</span></a><a class="closebutton" href="'+app.root+'ladder"><i class="icon-remove-sign"></i></a></li>';
			buf += '</ul>';
			var atLeastOne = false;
			var sideBuf = '';

			this.curRoomLeft = '';
			this.curRoomRight = '';
			this.curSideRoomLeft = '';
			this.curSideRoomRight = '';
			var passedCurRoom = false;
			var passedCurSideRoom = false;

			for (var id in app.rooms) {
				if (!id || id === 'teambuilder' || id === 'ladder') continue;
				var room = app.rooms[id];
				var name = '<i class="icon-comment-alt"></i> <span>'+(Tools.escapeHTML(room.title)||(id==='lobby'?'Lobby':id))+'</span>';
				if (id.substr(0,7) === 'battle-') {
					name = Tools.escapeHTML(room.title);
					var formatid = id.substr(7).split('-')[0];
					if (!name) {
						var p1 = (room && room.battle && room.battle.p1 && room.battle.p1.name) || '';
						var p2 = (room && room.battle && room.battle.p2 && room.battle.p2.name) || '';
						if (p1 && p2) {
							name = ''+Tools.escapeHTML(p1)+' v. '+Tools.escapeHTML(p2);
						} else if (p1 || p2) {
							name = ''+Tools.escapeHTML(p1)+Tools.escapeHTML(p2);
						} else {
							name = '(empty room)';
						}
					}
					name = '<i class="text">'+formatid+'</i><span>'+name+'</span>';
				}
				if (room.isSideRoom) {
					if (id !== 'rooms') {
						sideBuf += '<li><a class="button'+(curId===id||curSideId===id?' cur':'')+(room.notifications?' notifying':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
						if (curSideId) {
							// get left/right for side rooms
							if (curSideId === id) {
								passedCurSideRoom = true;
							} else if (!passedCurSideRoom) {
								this.curSideRoomLeft = id;
							} else if (!this.curSideRoomRight) {
								this.curSideRoomRight = id;
							}
						} else {
							// get left/right
							if (curId === id) {
								passedCurRoom = true;
							} else if (!passedCurRoom) {
								this.curRoomLeft = id;
							} else if (!this.curRoomRight) {
								this.curRoomRight = id;
							}
						}
					}
					continue;
				}
				if (!atLeastOne) {
					buf += '<ul>';
					atLeastOne = true;
				}
				buf += '<li><a class="button'+(curId===id?' cur':'')+(room.notifications?' notifying':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
				// get left/right
				if (curId === id) {
					passedCurRoom = true;
				} else if (!passedCurRoom) {
					this.curRoomLeft = id;
				} else if (!this.curRoomRight) {
					this.curRoomRight = id;
				}
				if (curSideId && $('body').width() < room.minWidth + app.curSideRoom.minWidth) {
					this.curSideRoomLeft = id;
				}
			}
			if (app.supportsRooms) {
				sideBuf += '<li><a class="button'+(curId==='rooms'||curSideId==='rooms'?' cur':'')+'" href="'+app.root+'rooms"><i class="icon-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
			}
			if (atLeastOne) buf += '</ul>';
			if (sideBuf) {
				if (app.curSideRoom) {
					buf += '<ul class="siderooms" style="float:none;margin-left:'+(app.curSideRoom.leftWidth-144)+'px">'+sideBuf+'</ul>';
				} else {
					buf += '<ul>'+sideBuf+'</ul>';
				}
			}
			this.$tabbar.html(buf);
			var $lastLi = this.$tabbar.children().last().children().last();
			var offset = $lastLi.offset();
			var width = $lastLi.outerWidth();
			if (offset.top >= 37 || offset.left + width > $(window).width() - 165) {
				this.$tabbar.append('<div class="overflow"><button name="tablist"><i class="icon-caret-down"></i></button></div>');
			}

			if (app.rooms['']) app.rooms[''].updateRightMenu();
		},
		dispatchClickButton: function(e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dismissingSource = app.dismissPopups();
				app.dispatchingButton = target;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name].call(this, target.value, target);
				delete app.dismissingSource;
				delete app.dispatchingButton;
			}
		},
		click: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			var $target = $(e.currentTarget);
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id);
			} else {
				app.joinRoom(id);
			}
		},
		tablist: function() {
			app.addPopup(TabListPopup);
		}
	});

	var Room = this.Room = Backbone.View.extend({
		className: 'ps-room',
		constructor: function(options) {
			if (!this.events) this.events = {};
			if (!this.events['click button']) this.events['click button'] = 'dispatchClickButton';
			if (!this.events['click']) this.events['click'] = 'dispatchClickBackground';

			Backbone.View.apply(this, arguments);

			if (!(options && options.nojoin)) this.join();
		},
		dispatchClickButton: function(e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dismissingSource = app.dismissPopups();
				app.dispatchingButton = target;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name].call(this, target.value, target);
				delete app.dismissingSource;
				delete app.dispatchingButton;
			}
		},
		dispatchClickBackground: function(e) {
			app.dismissPopups();
			if (e.shiftKey || (window.getSelection && !window.getSelection().isCollapsed)) {
				return;
			}
			this.focus();
		},

		// communication

		/**
		 * Send to sim server
		 */
		send: function(data) {
			app.send(data, this.id);
		},
		/**
		 * Receive from sim server
		 */
		receive: function(data) {
			//
		},

		// layout

		bestWidth: 659,
		show: function(position, leftWidth) {
			switch (position) {
			case 'left':
				this.$el.css({left: 0, width: leftWidth, right: 'auto'});
				break;
			case 'right':
				this.$el.css({left: leftWidth+1, width: 'auto', right: 0});
				this.leftWidth = leftWidth;
				break;
			case 'full':
				this.$el.css({left: 0, width: 'auto', right: 0});
				break;
			}
			this.$el.show();
			this.dismissNotification();
		},
		hide: function() {
			this.blur();
			this.$el.hide();
		},
		focus: function() {},
		blur: function() {},
		join: function() {},
		leave: function() {},

		// notifications

		requestNotifications: function() {
			try {
				if (window.webkitNotifications && webkitNotifications.requestPermission) {
					// Notification.requestPermission crashes Chrome 23:
					//   https://code.google.com/p/chromium/issues/detail?id=139594
					// In lieu of a way to detect Chrome 23, we'll just use the old
					// requestPermission API, which works to request permissions for
					// the new Notification spec anyway.
					webkitNotifications.requestPermission();
				} else if (window.Notification && Notification.requestPermission) {
					Notification.requestPermission(function(permission) {});
				}
			} catch (e) {}
		},
		notifications: null,
		notify: function(title, body, tag, once) {
			if (once && app.focused && (this === app.curRoom || this == app.curSideRoom)) return;
			if (!tag) tag = 'message';
			if (!this.notifications) this.notifications = {};
			if (app.focused && (this === app.curRoom || this == app.curSideRoom)) {
				this.notifications[tag] = {};
			} else if (window.nodewebkit) {
				nwWindow.requestAttention(true);
			} else if (window.Notification) {
				// old one doesn't need to be closed; sending the tag should
				// automatically replace the old notification
				var notification = this.notifications[tag] = new Notification(title, {
					lang: 'en',
					body: body,
					tag: this.id+':'+tag,
				});
				var self = this;
				notification.onclose = function() {
					self.dismissNotification(tag);
				};
				notification.onclick = function() {
					self.clickNotification(tag);
				};
				if (Tools.prefs('temporarynotifications')) {
					if (notification.cancel) {
						setTimeout(function() {notification.cancel();}, 5000);
					} else if (notification.close) {
						setTimeout(function() {notification.close();}, 5000);
					}
				}
				if (once) notification.psAutoclose = true;
			} else if (window.macgap) {
				macgap.growl.notify({
					title: title,
					content: body
				});
				var notification = {};
				this.notifications[tag] = notification;
				if (once) notification.psAutoclose = true;
			} else {
				var notification = {};
				this.notifications[tag] = notification;
				if (once) notification.psAutoclose = true;
			}
			app.topbar.updateTabbar();
		},
		notifyOnce: function(title, body, tag) {
			return this.notify(title, body, tag, true);
		},
		closeNotification: function(tag, alreadyClosed) {
			if (window.nodewebkit) nwWindow.requestAttention(false);
			if (!this.notifications) return;
			if (!tag) {
				for (tag in this.notifications) {
					if (this.notifications[tag].close) this.notifications[tag].close();
				}
				this.notifications = null;
				app.topbar.updateTabbar();
				return;
			}
			if (!this.notifications[tag]) return;
			if (!alreadyClosed && this.notifications[tag].close) this.notifications[tag].close();
			delete this.notifications[tag];
			if (_.isEmpty(this.notifications)) {
				this.notifications = null;
				app.topbar.updateTabbar();
			}
		},
		dismissNotification: function(tag) {
			if (window.nodewebkit) nwWindow.requestAttention(false);
			if (!this.notifications) return;
			if (!tag) {
				for (tag in this.notifications) {
					if (!this.notifications[tag].psAutoclose) continue;
					if (this.notifications[tag].close) this.notifications[tag].close();
					delete this.notifications[tag];
				}
				if (_.isEmpty(this.notifications)) {
					this.notifications = null;
					app.topbar.updateTabbar();
				}
				return;
			}
			if (!this.notifications[tag]) return;
			if (this.notifications[tag].close) this.notifications[tag].close();
			if (this.notifications[tag].psAutoclose) {
				delete this.notifications[tag];
				if (_.isEmpty(this.notifications)) {
					this.notifications = null;
					app.topbar.updateTabbar();
				}
			} else {
				this.notifications[tag] = {};
			}
		},
		clickNotification: function(tag) {
			this.dismissNotification(tag);
			app.focusRoom(this.id);
		},
		close: function() {
			app.leaveRoom(this.id);
		},

		// allocation

		destroy: function() {
			this.closeNotification();
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

		className: 'ps-popup',
		constructor: function(data) {
			if (!this.events) this.events = {};
			if (!this.events['click button']) this.events['click button'] = 'dispatchClickButton';
			if (!this.events['submit form']) this.events['submit form'] = 'dispatchSubmit';
			if (data && data.sourceEl) {
				this.sourceEl = data.sourceEl = $(data.sourceEl);
			}
			if (data.type) this.type = data.type;
			if (data.position) this.position = data.position;

			Backbone.View.apply(this, arguments);

			// if we have no source, we can't attach to anything
			if (this.type === 'normal' && !this.sourceEl) this.type = 'semimodal';

			if (this.type === 'normal') {
				// nonmodal popup: should be positioned near source element
				var $el = this.$el;
				var $measurer = $('<div style="position:relative;height:0;overflow:hidden"></div>').appendTo('body').append($el);
				$el.css('width', this.width - 22);

				var offset = this.sourceEl.offset();

				var room = $(window).height();
				var height = $el.outerHeight();
				var width = $el.outerWidth();
				var sourceHeight = this.sourceEl.outerHeight();

				if (this.position === 'right') {

					if (room > offset.top + height + 5 &&
						(offset.top < room * 2/3 || offset.top + 200 < room)) {
						$el.css('top', offset.top);
					} else {
						$el.css('bottom', Math.max(room - offset.top - sourceHeight, 0));
					}
					$el.css('left', offset.left + this.sourceEl.outerWidth());

				} else {

					if (room > offset.top + sourceHeight + height + 5 &&
						(offset.top + sourceHeight < room * 2/3 || offset.top + sourceHeight + 200 < room)) {
						$el.css('top', offset.top + sourceHeight);
					} else if (height + 5 <= offset.top) {
						$el.css('bottom', room - offset.top);
					} else if (height + 10 < room) {
						$el.css('bottom', 5);
					} else {
						$el.css('top', 0);
					}

					room = $(window).width() - offset.left;
					if (room < width + 10) {
						$el.css('right', 10);
					} else {
						$el.css('left', offset.left);
					}

				}

				$el.detach();
				$measurer.remove();
			}
		},
		initialize: function(data) {
			this.type = 'semimodal';
			this.$el.html('<p style="white-space:pre-wrap">'+Tools.parseMessage(data.message)+'</p><p class="buttonbar"><button name="close" class="autofocus"><strong>OK</strong></button></p>').css('max-width', 480);
		},

		dispatchClickButton: function(e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dispatchingButton = target;
				app.dispatchingPopup = this;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name].call(this, target.value, target);
				delete app.dispatchingButton;
				delete app.dispatchingPopup;
			}
		},
		dispatchSubmit: function(e) {
			e.preventDefault();
			e.stopPropagation();
			var dataArray = $(e.currentTarget).serializeArray();
			var data = {};
			for (var i=0, len=dataArray.length; i<len; i++) {
				var name = dataArray[i].name, value = dataArray[i].value;
				if (data[name]) {
					if (!data[name].push) data[name] = [data[name]];
					data[name].push(value||'');
				} else {
					data[name] = (value||'');
				}
			}
			this.submit(data);
		},

		remove: function() {
			var $parent = this.$el.parent();
			Backbone.View.prototype.remove.apply(this, arguments);
			if ($parent.hasClass('ps-overlay')) $parent.remove();
		},

		close: function() {
			app.closePopup();
		}
	});

	var PromptPopup = this.PromptPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			if (!data || !data.message || typeof data.callback !== "function") return;
			this.callback = data.callback;

			var buf = '<form>';
			buf += '<p><label class="label">' + data.message;
			buf += '<input class="textbox autofocus" type="text" name="data" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>' + data.button + '</strong></button> <button name="close">Cancel</button></p>';
			buf += '</form>';

			this.$el.html(buf);
		},
		submit: function(data) {
			this.close();
			this.callback(data.data);
		}
	});

	var UserPopup = this.UserPopup = Popup.extend({
		initialize: function(data) {
			data.userid = toId(data.name);
			var name = data.name;
			if (/[a-zA-Z0-9]/.test(name.charAt(0))) name = ' '+name;
			this.data = data = _.extend(data, UserPopup.dataCache[data.userid]);
			data.name = name;
			app.on('response:userdetails', this.update, this);
			app.send('/cmd userdetails '+data.userid);
			this.update();
		},
		events: {
			'click .ilink': 'clickLink',
			'click .yours': 'avatars'
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
				'#': "Room Owner (#)",
				'~': "Administrator (~)",
				'&': "Leader (&amp;)",
				'@': "Moderator (@)",
				'%': "Driver (%)",
				'\u2605': "Player (\u2605)",
				'+': "Voiced (+)",
				'‽': "<span style='color:#777777'>Locked (‽)</span>",
				'!': "<span style='color:#777777'>Muted (!)</span>"
			};
			var group = (groupDetails[name.substr(0, 1)] || '');
			if (group || name.charAt(0) === ' ') name = name.substr(1);

			var buf = '<div class="userdetails">';
			if (avatar) buf += '<img class="trainersprite'+(userid===app.user.get('userid')?' yours':'')+'" src="'+Tools.resolveAvatar(avatar)+'" />';
			buf += '<strong><a href="//pokemonshowdown.com/users/'+userid+'" target="_blank">' + Tools.escapeHTML(name) + '</a></strong><br />';
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

			if (userid === app.user.get('userid') || !app.user.get('named')) {
				buf += '<p class="buttonbar"><button disabled>Challenge</button> <button disabled>Chat</button></p>';
			} else {
				buf += '<p class="buttonbar"><button name="challenge">Challenge</button> <button name="pm">Chat</button></p>';
			}

			this.$el.html(buf);
		},
		clickLink: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			e.stopPropagation();
			this.close();
			var roomid = $(e.currentTarget).attr('href').substr(app.root.length);
			app.tryJoinRoom(roomid);
		},
		avatars: function() {
			app.addPopup(AvatarsPopup);
		},
		challenge: function() {
			app.rooms[''].requestNotifications();
			this.close();
			app.focusRoom('');
			app.rooms[''].challenge(this.data.name);
		},
		pm: function() {
			app.rooms[''].requestNotifications();
			this.close();
			app.focusRoom('');
			app.rooms[''].focusPM(this.data.name);
		}
	},{
		dataCache: {}
	});

	var ReconnectPopup = this.ReconnectPopup = Popup.extend({
		type: 'modal',
		initialize: function(data) {
			app.reconnectPending = false;
			var buf = '<form>';

			if (data.cantconnect) {
				buf += '<p class="error">Couldn\'t connect to server!</p>';
				buf += '<p class="buttonbar"><button type="submit">Retry</button> <button name="close">Close</button></p>';
			} else {
				buf += '<p>You have been disconnected &ndash; possibly because the server was restarted.</p>'
				buf += '<p class="buttonbar"><button type="submit" class="autofocus"><strong>Reconnect</strong></button> <button name="close">Close</button></p>';
			}

			buf += '</form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			document.location.reload();
		}
	});

	var LoginPopup = this.LoginPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			var buf = '<form>';

			if (data.error) {
				buf += '<p class="error">' + Tools.escapeHTML(data.error) + '</p>';
				if (data.error.indexOf(' forced you to change ') >= 0) {
					buf += '<p>Keep in mind these rules:</p>';
					buf += '<ol>';
					buf += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
					buf += '<li>Usernames may not directly reference sexual activity.</li>';
					buf += '<li>Usernames may not be excessively disgusting.</li>';
					buf += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
					buf += '</ol>';
				}
			} else if (data.reason) {
				buf += '<p>' + Tools.parseMessage(data.reason) + '</p>';
			}

			var name = (data.name || '');
			if (!name && app.user.get('named')) name = app.user.get('name');
			buf += '<p><label class="label">Username: <input class="textbox autofocus" type="text" name="username" value="'+Tools.escapeHTML(name)+'"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Choose name</strong></button> <button name="close">Cancel</button></p>';

			buf += '</form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			this.close();
			app.user.rename(data.username);
		}
	});

	var ChangePasswordPopup = this.ChangePasswordPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			var buf = '<form>';
			if (data.error) {
				buf += '<p class="error">' + data.error + '</p>';
			} else {
				buf += '<p>Change your password:</p>';
			}
			buf += '<p><label class="label">Username: <strong>' + app.user.get('name') + '</strong></label></p>';
			buf += '<p><label class="label">Old password: <input class="textbox autofocus" type="password" name="oldpassword" /></label></p>';
			buf += '<p><label class="label">New password: <input class="textbox" type="password" name="password" /></label></p>';
			buf += '<p><label class="label">New password (confirm): <input class="textbox" type="password" name="cpassword" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Change password</strong></button> <button name="close">Cancel</button></p></form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			$.post(app.user.getActionPHP(), {
				act: 'changepassword',
				oldpassword: data.oldpassword,
				password: data.password,
				cpassword: data.cpassword
			}, Tools.safeJSON(function(data) {
				if (!data) data = {};
				if (data.actionsuccess) {
					app.addPopupMessage("Your password was successfully changed.");
				} else {
					app.addPopup(ChangePasswordPopup, {
						error: data.actionerror
					});
				}
			}), 'text');
		}
	});

	var RegisterPopup = this.RegisterPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			var buf = '<form>';
			if (data.error) {
				buf += '<p class="error">' + data.error + '</p>';
			} else if (data.reason) {
				buf += '<p>' + data.reason + '</p>';
			} else {
				buf += '<p>Register your account:</p>';
			}
			buf += '<p><label class="label">Username: <strong>' + Tools.escapeHTML(data.name || app.user.get('name')) + '</strong><input type="hidden" name="name" value="' + Tools.escapeHTML(data.name || app.user.get('name')) + '" /></label></p>';
			buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password" /></label></p>';
			buf += '<p><label class="label">Password (confirm): <input class="textbox" type="password" name="cpassword" /></label></p>';
			buf += '<p><label class="label"><img src="' + Tools.resourcePrefix + 'sprites/bwani/pikachu.gif" /></label></p>';
			buf += '<p><label class="label">What is this pokemon? <input class="textbox" type="text" name="captcha" value="' + Tools.escapeHTML(data.captcha) + '" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Register</strong></button> <button name="close">Cancel</button></p></form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			var name = data.name;
			var captcha = data.captcha;
			$.post(app.user.getActionPHP(), {
				act: 'register',
				username: name,
				password: data.password,
				cpassword: data.cpassword,
				captcha: captcha,
				challengekeyid: app.user.challengekeyid,
				challenge: app.user.challenge
			}, Tools.safeJSON(function (data) {
				if (!data) data = {};
				var token = data.assertion;
				if (data.curuser && data.curuser.loggedin) {
					app.user.set('registered', data.curuser);
					var name = data.curuser.username;
					app.send('/trn '+name+',1,'+token);
					app.addPopupMessage("You have been successfully registered.");
				} else {
					app.addPopup(RegisterPopup, {
						name: name,
						captcha: captcha,
						error: data.actionerror
					});
				}
			}), 'text');
		}
	});

	var LoginPasswordPopup = this.LoginPasswordPopup = Popup.extend({
		type: 'semimodal',
		initialize: function(data) {
			var buf = '<form>';

			if (data.error) {
				buf += '<p class="error">' + Tools.escapeHTML(data.error) + '</p>';
				if (data.error.indexOf(' forced you to change ') >= 0) {
					buf += '<p>Keep in mind these rules:</p>';
					buf += '<ol>';
					buf += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
					buf += '<li>Usernames may not reference sexual activity, directly or indirectly.</li>';
					buf += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
					buf += '</ol>';
				}
			} else if (data.reason) {
				buf += '<p>' + Tools.escapeHTML(data.reason) + '</p>';
			} else {
				buf += '<p class="error">The name you chose is registered.</p>';
			}

			buf += '<p>Log in:</p>';
			buf += '<p><label class="label">Username: <strong>'+Tools.escapeHTML(data.username)+'<input type="hidden" name="username" value="'+Tools.escapeHTML(data.username)+'" /></strong></label></p>';
			buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Log in</strong></button> <button name="close">Cancel</button></p>';

			buf += '<p class="or">or</p>';
			buf += '<p class="buttonbar"><button name="login">Choose another name</button></p>';

			buf += '</form>';
			this.$el.html(buf);
		},
		login: function() {
			this.close();
			app.addPopup(LoginPopup);
		},
		submit: function(data) {
			this.close();
			app.user.passwordRename(data.username, data.password);
		}
	});

	var ProxyPopup = this.ProxyPopup = Popup.extend({
		type: 'modal',
		initialize: function(data) {
			this.callback = data.callback;

			var buf = '<form>';
			buf += '<p>Because of the <a href="https://en.wikipedia.org/wiki/Same-origin_policy" target="_blank">same-origin policy</a>, some manual work is required to complete the requested action when using <code>testclient.html</code>.</p>';
			buf += '<iframe id="overlay_iframe" src="' + data.uri + '" style="width: 100%; height: 50px;" class="textbox"></iframe>';
			buf += '<p>Please copy <strong>all the text</strong> from the box above and paste it in the box below.</p>';
			buf += '<p><label class="label" style="float: left;">Data from the box above:</label> <input style="width: 100%;" class="textbox autofocus" type="text" name="result" /></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Submit</strong></button> <button name="close">Cancel</button></p>';
			buf += '</form>';
			this.$el.html(buf).css('min-width', 500);
		},
		submit: function(data) {
			this.close();
			this.callback(data.result);
		}
	});

	var SoundsPopup = this.SoundsPopup = Popup.extend({
		initialize: function(data) {
			var buf = '';
			var muted = !!Tools.prefs('mute');
			buf += '<p class="effect-volume"><label class="optlabel">Effect volume:</label>'+(muted?'<em>(muted)</em>':'<input type="slider" name="effectvolume" value="'+(Tools.prefs('effectvolume')||50)+'" />')+'</p>';
			buf += '<p class="music-volume"><label class="optlabel">Music volume:</label>'+(muted?'<em>(muted)</em>':'<input type="slider" name="musicvolume" value="'+(Tools.prefs('musicvolume')||50)+'" />')+'</p>'
			buf += '<p><label class="optlabel"><input type="checkbox" name="muted"'+(muted?' checked':'')+' /> Mute sounds</label></p>';
			this.$el.html(buf).css('min-width', 160);
		},
		events: {
			'change input[name=muted]': 'setMute'
		},
		domInitialize: function() {
			var self = this;
			this.$('.effect-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function(val) {
					self.setEffectVolume(val);
				}
			});
			this.$('.music-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function(val) {
					self.setMusicVolume(val);
				}
			});
		},
		setMute: function(e) {
			var muted = !!e.currentTarget.checked;
			Tools.prefs('mute', muted);
			BattleSound.setMute(muted);

			if (!muted) {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><input type="slider" name="effectvolume" value="'+(Tools.prefs('effectvolume')||50)+'" />');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><input type="slider" name="musicvolume" value="'+(Tools.prefs('musicvolume')||50)+'" />');
				this.domInitialize();
			} else {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><em>(muted)</em>');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><em>(muted)</em>');
			}

			app.topbar.$('button[name=openSounds]').html('<i class="'+(muted?'icon-volume-off':'icon-volume-up')+'"></i>');
		},
		setEffectVolume: function(volume) {
			BattleSound.setEffectVolume(volume);
			Tools.prefs('effectvolume', volume);
		},
		setMusicVolume: function(volume) {
			BattleSound.setBgmVolume(volume);
			Tools.prefs('musicvolume', volume);
		}
	});

	var OptionsPopup = this.OptionsPopup = Popup.extend({
		initialize: function(data) {
			app.user.on('change', this.update, this);
			app.send('/cmd userdetails '+app.user.get('userid'));
			this.update();
		},
		events: {
			'change input[name=noanim]': 'setNoanim',
			'change input[name=bwgfx]': 'setBwgfx',
			'change input[name=notournaments]': 'setNotournaments',
			'change input[name=nolobbypm]': 'setNolobbypm',
			'change input[name=temporarynotifications]': 'setTemporaryNotifications',
			'change input[name=ignorespects]': 'setIgnoreSpects',
			'change select[name=bg]': 'setBg',
			'change select[name=timestamps-lobby]': 'setTimestampsLobby',
			'change select[name=timestamps-pms]': 'setTimestampsPMs',
			'change input[name=logchat]': 'setLogChat',
			'change input[name=selfhighlight]': 'setSelfHighlight',
			'click img': 'avatars'
		},
		update: function() {
			var name = app.user.get('name');
			var avatar = app.user.get('avatar');

			var buf = '';
			buf += '<p>'+(avatar?'<img class="trainersprite" src="'+Tools.resolveAvatar(avatar)+'" width="40" height="40" style="vertical-align:middle" />':'')+'<strong>'+Tools.escapeHTML(name)+'</strong></p>';
			buf += '<p><button name="avatars">Change avatar</button></p>';

			buf += '<hr />';
			buf += '<p><label class="optlabel">Background: <select name="bg"><option value="">Charizards</option><option value="#344b6c url(/fx/client-bg-horizon.jpg) no-repeat left center fixed">Horizon</option><option value="#546bac url(/fx/client-bg-3.jpg) no-repeat left center fixed">Waterfall</option><option value="#546bac url(/fx/client-bg-ocean.jpg) no-repeat left center fixed">Ocean</option><option value="#344b6c">Solid blue</option>'+(Tools.prefs('bg')?'<option value="" selected></option>':'')+'</select></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="noanim"'+(Tools.prefs('noanim')?' checked':'')+' /> Disable animations</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="bwgfx"'+(Tools.prefs('bwgfx')?' checked':'')+' /> Enable BW sprites</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="notournaments"'+(Tools.prefs('notournaments')?' checked':'')+' /> Ignore tournaments</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="nolobbypm"'+(Tools.prefs('nolobbypm')?' checked':'')+' /> Don\'t show PMs in lobby chat</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="selfhighlight"'+(!Tools.prefs('noselfhighlight')?' checked':'')+'> Highlight when your name is said in chat</label></p>';

			if (window.Notification) {
				buf += '<p><label class="optlabel"><input type="checkbox" name="temporarynotifications"'+(Tools.prefs('temporarynotifications')?' checked':'')+' /> Temporary notifications</label></p>';
			}

			var timestamps = this.timestamps = (Tools.prefs('timestamps') || {});
			buf += '<p><label class="optlabel">Timestamps in lobby chat: <select name="timestamps-lobby"><option value="off">Off</option><option value="minutes"'+(timestamps.lobby==='minutes'?' selected="selected"':'')+'>[HH:MM]</option><option value="seconds"'+(timestamps.lobby==='seconds'?' selected="selected"':'')+'>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Timestamps in PMs: <select name="timestamps-pms"><option value="off">Off</option><option value="minutes"'+(timestamps.pms==='minutes'?' selected="selected"':'')+'>[HH:MM]</option><option value="seconds"'+(timestamps.pms==='seconds'?' selected="selected"':'')+'>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Chat preferences: <button name="formatting">Edit formatting</button></label></p>';

			if (app.curRoom.battle) {
				buf += '<hr />';
				buf += '<h3>Current room</h3>';
				buf += '<p><label class="optlabel"><input type="checkbox" name="ignorespects"'+(app.curRoom.battle.ignoreSpects?' checked':'')+'> Ignore spectators</label></p>';
			}

			if (window.nodewebkit) {
				buf += '<hr />';
				buf += '<h3>Desktop app</h3>';
				buf += '<p><label class="optlabel"><input type="checkbox" name="logchat"'+(Tools.prefs('logchat')?' checked':'')+'> Log chat</label></p>';
				buf += '<p id="openLogFolderButton"'+(Storage.dir?'':' style="display:none"')+'><button name="openLogFolder">Open log folder</button></p>';
			}

			buf += '<hr />';
			if (app.user.get('named')) {
				buf += '<p class="buttonbar" style="text-align:right">';
				var registered = app.user.get('registered');
				if (registered && (registered.userid === app.user.get('userid'))) {
					buf += '<button name="changepassword">Change password</button> ';
				} else {
					buf += '<button name="register">Register</button> ';
				}
				buf += '<button name="logout"><strong>Log out</strong></button>';
				buf += '</p>';
			} else {
				buf += '<p class="buttonbar" style="text-align:right"><button name="login">Choose name</button></p>';
			}
			this.$el.html(buf).css('min-width', 160);
		},
		openLogFolder: function() {
			Storage.revealFolder();
		},
		setLogChat: function(e) {
			var logchat = !!e.currentTarget.checked;
			if (logchat) {
				Storage.startLoggingChat();
				$('#openLogFolderButton').show();
			} else {
				Storage.stopLoggingChat();
			}
			Tools.prefs('logchat', logchat);
		},
		setNoanim: function(e) {
			var noanim = !!e.currentTarget.checked;
			Tools.prefs('noanim', noanim);
		},
		setBwgfx: function(e) {
			var bwgfx = !!e.currentTarget.checked;
			Tools.prefs('bwgfx', bwgfx);
			Tools.loadSpriteData(bwgfx ? 'bw' : 'xy');
		},
		setNotournaments: function(e) {
			var notournaments = !!e.currentTarget.checked;
			Tools.prefs('notournaments', notournaments);
		},
		setSelfHighlight: function(e) {
			var noselfhighlight = !e.currentTarget.checked;
			Tools.prefs('noselfhighlight', noselfhighlight);
		},
		setNolobbypm: function(e) {
			var nolobbypm = !!e.currentTarget.checked;
			Tools.prefs('nolobbypm', nolobbypm);
		},
		setTemporaryNotifications: function (e) {
			var temporarynotifications = !!e.currentTarget.checked;
			Tools.prefs('temporarynotifications', temporarynotifications);
		},
		setIgnoreSpects: function(e) {
			if (app.curRoom.battle) {
				app.curRoom.battle.ignoreSpects = !!e.currentTarget.checked;
			}
		},
		setBg: function(e) {
			var bg = e.currentTarget.value;
			Tools.prefs('bg', bg);
			if (!bg) bg = '#344b6c url(/fx/client-bg-charizards.jpg) no-repeat left center fixed';
			$(document.body).css({
				background: bg,
				'background-size': 'cover'
			});
		},
		setTimestampsLobby: function(e) {
			this.timestamps.lobby = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		setTimestampsPMs: function(e) {
			this.timestamps.pms = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		avatars: function() {
			app.addPopup(AvatarsPopup);
		},
		formatting: function() {
			app.addPopup(FormattingPopup);
		},
		login: function() {
			app.addPopup(LoginPopup);
		},
		register: function() {
			app.addPopup(RegisterPopup);
		},
		changepassword: function() {
			app.addPopup(ChangePasswordPopup);
		},
		logout: function() {
			app.user.logout();
			this.close();
		}
	});

	var FormattingPopup = this.FormattingPopup = Popup.extend({
		events: {
			'change input': 'setOption'
		},
		initialize: function() {
			var cur = this.chatformatting = Tools.prefs('chatformatting') || {};
			var buf = '<p class="optlabel">You can choose to display formatted text as normal text.</p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="bold" ' + (cur.hidebold ? 'checked' : '') + ' /> Suppress **<strong>bold</strong>**</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="italics" ' + (cur.hideitalics ? 'checked' : '') + ' /> Suppress __<em>italics</em>__</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="monospace" ' + (cur.hidemonospace ? 'checked' : '') + ' /> Suppress ``<code>monospace</code>``</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="strikethrough" ' + (cur.hidestrikethrough ? 'checked' : '') + ' /> Suppress ~~<s>strikethrough</s>~~</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="me" ' + (cur.hideme ? 'checked' : '') + ' /> Suppress <code>/me</code> <em>action formatting</em></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="spoiler" ' + (cur.hidespoiler ? 'checked' : '') + ' /> Suppress spoiler hiding</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="links" ' + (cur.hidelinks ? 'checked' : '') + ' /> Suppress clickable links</label></p>';
			buf += '<p><button name="close">Close</button></p>';
			this.$el.html(buf);
		},
		setOption: function(e) {
			var name = $(e.currentTarget).prop('name');
			this.chatformatting['hide' + name] = !!e.currentTarget.checked;
			Tools.prefs('chatformatting', this.chatformatting);
		}
	});

	var AvatarsPopup = this.AvatarsPopup = Popup.extend({
		type: 'semimodal',
		initialize: function() {
			var cur = +app.user.get('avatar');
			var buf = '';
			buf += '<p>Choose an avatar or <button name="close">Cancel</button></p>';

			buf += '<div class="avatarlist">';
			for (var i=1; i<=293; i++) {
				var offset = '-'+(((i-1)%16)*80)+'px -'+(Math.floor((i-1)/16)*80)+'px'
				buf += '<button name="setAvatar" value="'+i+'" style="background-position:'+offset+'"'+(i===cur?' class="cur"':'')+'></button>';
			}
			buf += '</div><div style="clear:left"></div>';

			buf += '<p><button name="close">Cancel</button></p>';
			this.$el.html(buf).css('max-width', 780);
		},
		setAvatar: function(i) {
			app.send('/avatar '+i);
			app.send('/cmd userdetails '+app.user.get('userid'));
			Tools.prefs('avatar', i);
			this.close();
		}
	});

	var ReplayUploadedPopup = this.ReplayUploadedPopup = Popup.extend({
		type: 'semimodal',
		events: {
			'click a': 'clickClose'
		},
		initialize: function(data) {
			var buf = '';
			buf = '<p>Your replay has been uploaded! It\'s available at:</p>';
			buf += '<p><a href="http://replay.pokemonshowdown.com/'+data.id+'" target="_blank">http://replay.pokemonshowdown.com/'+data.id+'</a></p>';
			buf += '<p><button type="submit" class="autofocus"><strong>Open</strong></button> <button name="close">Cancel</button></p>';
			this.$el.html(buf).css('max-width', 620);
		},
		clickClose: function() {
			this.close();
		},
		submit: function(i) {
			app.openInNewWindow('http://pokemonshowdown.com/replay/battle-'+this.id);
			this.close();
		}
	});

	var RulesPopup = this.RulesPopup = Popup.extend({
		type: 'modal',
		initialize: function(data) {
			var warning = ('warning' in data);
			var buf = '';
			if (warning) {
				buf += '<p><strong style="color:red">'+(Tools.escapeHTML(data.warning)||'You have been warned for breaking the rules.')+'</strong></p>';
			}
			buf += '<h2>Pok&eacute;mon Showdown Rules</h2>';
			buf += '<b>Global</b><br /><br /><b>1.</b> Be nice to people. Respect people. Don\'t be rude to people.<br /><br /><b>2.</b> PS is based in the US. Follow US laws. Don\'t distribute pirated material, and don\'t slander others. PS is available to users younger than 18, so porn is strictly forbidden.<br /><br /><b>3.</b>&nbsp;No cheating. Don\'t exploit bugs to gain an unfair advantage. Don\'t game the system (by intentionally losing against yourself or a friend in a ladder match, by timerstalling, etc).<br /><b></b><br /><b>4.</b>&nbsp;English only.<br /><br /><b>5.</b> The First Amendment does not apply to PS, since PS is not a government organization.<br /><br /><b>6.</b> Moderators have discretion to punish any behaviour they deem inappropriate, whether or not it\'s on this list. If you disagree with a moderator ruling, appeal to a leader (a user with &amp; next to their name) or Discipline Appeals.<br /><br />';
			buf += '<b>Chat</b><br /><br /><b>1.</b> Do not spam, flame, or troll. This includes advertising, asking questions with one-word answers in the lobby, and flooding the chat such as by copy/pasting lots of text in the lobby.<br /><br /><b>2.</b> Don\'t call unnecessary attention to yourself. Don\'t be obnoxious. ALL CAPS, <i><b>formatting</b></i>, and -&gt; ASCII art &lt;- are acceptable to emphasize things, but should be used sparingly, not all the time.<br /><br /><b>3.</b> No minimodding: don\'t mod if it\'s not your job. Don\'t tell people they\'ll be muted, don\'t ask for people to be muted, and don\'t talk about whether or not people should be muted ("inb4 mute", etc). This applies to bans and other punishments, too.<br /><br /><b>4.</b> We reserve the right to tell you to stop discussing moderator decisions if you become unreasonable or belligerent.<br /><br />(Note: Chat rules don\'t apply to battle rooms, but only if both players in the battle are okay with it.)<br /><br />';
			if (!warning) {
				buf += '<b>Usernames</b><br /><br />Your username can be chosen and changed at any time. Keep in mind:<br /><br /><b>1.</b> Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).<br /><br /><b>2.</b> Usernames may not directly reference sexual activity.<br /><br /><b>3.</b> Usernames may not be excessively disgusting.<br /><br /><b>4.</b> Usernames may not impersonate a recognized user (a user with %, @, &amp;, or ~ next to their name).<br /><br />This policy is less restrictive than that of many places, so you might see some "borderline" nicknames that might not be accepted elsewhere. You might consider it unfair that they are allowed to keep their nickname. The fact remains that their nickname follows the above rules, and if you were asked to choose a new name, yours does not.';
			}
			if (warning) {
				buf += '<p class="buttonbar"><button name="close" disabled>Close</button><small class="overlay-warn"> You will be able to close this in 5 seconds</small></p>';
				setTimeout(_.bind(this.rulesTimeout, this), 5000);
			} else {
				this.type = 'semimodal';
				buf += '<p class="buttonbar"><button name="close" class="autofocus">Close</button></p>';
			}
			this.$el.css('max-width', 760).html(buf);
		},
		rulesTimeout: function() {
			this.$('button')[0].disabled = false;
			this.$('.overlay-warn').remove();
		}
	});

	var TabListPopup = this.TabListPopup = Popup.extend({
		type: 'semimodal',
		initialize: function() {
			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul><li><a class="button'+(curId===''?' cur':'')+(app.rooms['']&&app.rooms[''].notifications?' notifying':'')+'" href="'+app.root+'"><i class="icon-home"></i> <span>Home</span></a></li>';
			if (app.rooms['teambuilder']) buf += '<li><a class="button'+(curId==='teambuilder'?' cur':'')+' closable" href="'+app.root+'teambuilder"><i class="icon-edit"></i> <span>Teambuilder</span></a><a class="closebutton" href="'+app.root+'teambuilder"><i class="icon-remove-sign"></i></a></li>';
			if (app.rooms['ladder']) buf += '<li><a class="button'+(curId==='ladder'?' cur':'')+' closable" href="'+app.root+'ladder"><i class="icon-list-ol"></i> <span>Ladder</span></a><a class="closebutton" href="'+app.root+'ladder"><i class="icon-remove-sign"></i></a></li>';
			buf += '</ul>';
			var atLeastOne = false;
			var sideBuf = '';
			for (var id in app.rooms) {
				if (!id || id === 'teambuilder' || id === 'ladder') continue;
				var room = app.rooms[id];
				var name = '<i class="icon-comment-alt"></i> <span>'+id+'</span>';
				if (id === 'lobby') name = '<i class="icon-comments-alt"></i> <span>Lobby</span>';
				if (id.substr(0,7) === 'battle-') {
					var parts = id.substr(7).split('-');
					var p1 = (room && room.battle && room.battle.p1 && room.battle.p1.name) || '';
					var p2 = (room && room.battle && room.battle.p2 && room.battle.p2.name) || '';
					if (p1 && p2) {
						name = ''+Tools.escapeHTML(p1)+' v. '+Tools.escapeHTML(p2);
					} else if (p1 || p2) {
						name = ''+Tools.escapeHTML(p1)+Tools.escapeHTML(p2);
					} else {
						name = '(empty room)';
					}
					name = '<i class="text">'+parts[0]+'</i><span>'+name+'</span>';
				}
				if (room.isSideRoom) {
					if (room.id !== 'rooms') sideBuf += '<li><a class="button'+(curId===id||curSideId===id?' cur':'')+(room.notifications?' notifying':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
					continue;
				}
				if (!atLeastOne) {
					buf += '<ul>';
					atLeastOne = true;
				}
				buf += '<li><a class="button'+(curId===id?' cur':'')+(room.notifications?' notifying':'')+' closable" href="'+app.root+id+'">'+name+'</a><a class="closebutton" href="'+app.root+id+'"><i class="icon-remove-sign"></i></a></li>';
			}
			if (app.supportsRooms) {
				sideBuf += '<li><a class="button'+(curId==='rooms'||curSideId==='rooms'?' cur':'')+'" href="'+app.root+'rooms"><i class="icon-plus"></i> <span>&nbsp;</span></a></li>';
			}
			if (atLeastOne) buf += '</ul>';
			if (sideBuf) {
				buf += '<ul>'+sideBuf+'</ul>';
			}
			this.$el.addClass('tablist').html(buf);
		},
		events: {
			'click a': 'click'
		},
		click: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			var $target = $(e.currentTarget);
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id);
				this.initialize();
			} else {
				this.close();
				app.focusRoom(id);
			}
		}
	});

}).call(this, jQuery);
