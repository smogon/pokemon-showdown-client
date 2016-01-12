(function ($) {

	Config.version = '0.10.2';

	Config.sockjsprefix = '/showdown';
	Config.root = '/';

	if (window.nodewebkit) {
		window.gui = require('nw.gui');
		window.nwWindow = gui.Window.get();
	}
	if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
		// Android mobile-web-app-capable doesn't support it very well, but iOS
		// does it fine, so we're only going to show this to iOS for now
		$('head').append('<meta name="apple-mobile-web-app-capable" content="yes" />');
	}

	$(document).on('keydown', function (e) {
		if (e.keyCode == 27) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			app.closePopup();
		}
	});
	$(window).on('dragover', function (e) {
		if (/^text/.test(e.target.type)) return; // Ignore text fields

		e.preventDefault();
	});
	$(document).on('dragenter', function (e) {
		if (/^text/.test(e.target.type)) return; // Ignore text fields

		e.preventDefault();

		if (!app.dragging && app.curRoom.id === 'teambuilder') {
			if (e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files[0]) {
				var file = e.originalEvent.dataTransfer.files[0];
				if (file.name.slice(-4) === '.txt') {
					// Someone dragged in a .txt file, hand it to the teambuilder
					app.curRoom.defaultDragEnterTeam(e);
				}
			} else {
				// security doesn't let us read the filename :(
				// we'll just have to assume it's a team
				app.curRoom.defaultDragEnterTeam(e);
			}
		}

		// dropEffect !== 'none' prevents buggy bounce-back animation in
		// Chrome/Safari/Opera
		e.originalEvent.dataTransfer.dropEffect = 'move';
	});
	$(window).on('drop', function (e) {
		if (/^text/.test(e.target.type)) return; // Ignore text fields

		// The default team drop action for Firefox is to open the team as a
		// URL, which needs to be prevented.
		// The default file drop action for most browsers is to open the file
		// in the tab, which is generally undesirable anyway.
		e.preventDefault();
		if (app.dragging) {
			app.rooms[app.draggingRoom].defaultDropTeam(e);
		} else if (e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files[0]) {
			var file = e.originalEvent.dataTransfer.files[0];
			if (file.name.slice(-4) === '.txt' && app.curRoom.id === 'teambuilder') {
				// Someone dragged in a .txt file, hand it to the teambuilder
				app.curRoom.defaultDragEnterTeam(e);
				app.curRoom.defaultDropTeam(e);
			} else if (file.type && file.type.substr(0, 6) === 'image/') {
				// It's an image file, try to set it as a background
				CustomBackgroundPopup.readFile(file);
			}
		}
	});
	if (window.nodewebkit) {
		$(document).on("contextmenu", function (e) {
			e.preventDefault();
			var target = e.target;
			var isEditable = (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');
			var menu = new gui.Menu();

			if (isEditable) menu.append(new gui.MenuItem({
				label: "Cut",
				click: function () {
					document.execCommand("cut");
				}
			}));
			var link = $(target).closest('a')[0];
			if (link) menu.append(new gui.MenuItem({
				label: "Copy Link URL",
				click: function () {
					gui.Clipboard.get().set(link.href);
				}
			}));
			if (target.tagName === 'IMG') menu.append(new gui.MenuItem({
				label: "Copy Image URL",
				click: function () {
					gui.Clipboard.get().set(target.src);
				}
			}));
			menu.append(new gui.MenuItem({
				label: "Copy",
				click: function () {
					document.execCommand("copy");
				}
			}));
			if (isEditable) menu.append(new gui.MenuItem({
				label: "Paste",
				enabled: !!gui.Clipboard.get().get(),
				click: function () {
					document.execCommand("paste");
				}
			}));

			menu.popup(e.originalEvent.x, e.originalEvent.y);
		});
	}

	// sanitize a room ID
	// shouldn't actually do anything except against a malicious server
	var toRoomid = this.toRoomid = function (roomid) {
		return roomid.replace(/[^a-zA-Z0-9-]+/g, '').toLowerCase();
	};

	// support Safari 6 notifications
	if (!window.Notification && window.webkitNotification) {
		window.Notification = window.webkitNotification;
	}

	// this is called being lazy
	window.selectTab = function (tab) {
		app.tryJoinRoom(tab);
		return false;
	};

	// placeholder until the real chart loads
	window.Chart = {
		pokemonRow: function () {},
		itemRow: function () {},
		abilityRow: function () {},
		moveRow: function () {}
	};

	var User = this.User = Backbone.Model.extend({
		defaults: {
			name: '',
			userid: '',
			registered: false,
			named: false,
			avatar: 0
		},
		initialize: function () {
			app.clearGlobalListeners();
			app.on('response:userdetails', function (data) {
				if (data.userid === this.get('userid')) {
					this.set('avatar', data.avatar);
				}
			}, this);
			var self = this;
			this.on('change:name', function () {
				if (!self.get('named')) {
					self.nameRegExp = null;
				} else {
					var escaped = self.get('name').replace(/[^A-Za-z0-9]+$/, '');
					// we'll use `,` as a sentinel character to mean "any non-alphanumeric char"
					// unicode characters can be replaced with any non-alphanumeric char
					for (var i = escaped.length - 1; i > 0; i--) {
						if (/[^\ -\~]/.test(escaped[i])) {
							escaped = escaped.slice(0, i) + ',' + escaped.slice(i + 1);
						}
					}
					escaped = escaped.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
					escaped = escaped.replace(/,/g, "[^A-Za-z0-9]?");
					self.nameRegExp = new RegExp('(?:\\b|(?!\\w))' + escaped + '(?:\\b|\\B(?!\\w))', 'i');
				}
			});

			var replaceList = {'A': 'ＡⱯȺ', 'B': 'ＢƂƁɃ', 'C': 'ＣꜾȻ', 'D': 'ＤĐƋƊƉꝹ', 'E': 'ＥƐƎ', 'F': 'ＦƑꝻ', 'G': 'ＧꞠꝽꝾ', 'H': 'ＨĦⱧⱵꞍ', 'I': 'ＩƗ', 'J': 'ＪɈ', 'K': 'ＫꞢ', 'L': 'ＬꝆꞀ', 'M': 'ＭⱮƜ', 'N': 'ＮȠƝꞐꞤ', 'O': 'ＯǪǬØǾƆƟꝊꝌ', 'P': 'ＰƤⱣꝐꝒꝔ', 'Q': 'ＱꝖꝘɊ', 'R': 'ＲɌⱤꝚꞦꞂ', 'S': 'ＳẞꞨꞄ', 'T': 'ＴŦƬƮȾꞆ', 'U': 'ＵɄ', 'V': 'ＶƲꝞɅ', 'W': 'ＷⱲ', 'X': 'Ｘ', 'Y': 'ＹɎỾ', 'Z': 'ＺƵȤⱿⱫꝢ', 'a': 'ａąⱥɐ', 'b': 'ｂƀƃɓ', 'c': 'ｃȼꜿↄ', 'd': 'ｄđƌɖɗꝺ', 'e': 'ｅɇɛǝ', 'f': 'ｆḟƒꝼ', 'g': 'ｇɠꞡᵹꝿ', 'h': 'ｈħⱨⱶɥ', 'i': 'ｉɨı', 'j': 'ｊɉ', 'k': 'ｋƙⱪꝁꝃꝅꞣ', 'l': 'ｌſłƚɫⱡꝉꞁꝇ', 'm': 'ｍɱɯ', 'n': 'ｎƞɲŉꞑꞥ', 'o': 'ｏǫǭøǿɔꝋꝍɵ', 'p': 'ｐƥᵽꝑꝓꝕ', 'q': 'ｑɋꝗꝙ', 'r': 'ｒɍɽꝛꞧꞃ', 's': 'ｓꞩꞅẛ', 't': 'ｔŧƭʈⱦꞇ', 'u': 'ｕưừứữửựųṷṵʉ', 'v': 'ｖʋꝟʌ', 'w': 'ｗⱳ', 'x': 'ｘ', 'y': 'ｙɏỿ', 'z': 'ｚƶȥɀⱬꝣ', 'AA': 'Ꜳ', 'AE': 'ÆǼǢ', 'AO': 'Ꜵ', 'AU': 'Ꜷ', 'AV': 'ꜸꜺ', 'AY': 'Ꜽ', 'DZ': 'ǱǄ', 'Dz': 'ǲǅ', 'LJ': 'Ǉ', 'Lj': 'ǈ', 'NJ': 'Ǌ', 'Nj': 'ǋ', 'OI': 'Ƣ', 'OO': 'Ꝏ', 'OU': 'Ȣ', 'TZ': 'Ꜩ', 'VY': 'Ꝡ', 'aa': 'ꜳ', 'ae': 'æǽǣ', 'ao': 'ꜵ', 'au': 'ꜷ', 'av': 'ꜹꜻ', 'ay': 'ꜽ', 'dz': 'ǳǆ', 'hv': 'ƕ', 'lj': 'ǉ', 'nj': 'ǌ', 'oi': 'ƣ', 'ou': 'ȣ', 'oo': 'ꝏ', 'ss': 'ß', 'tz': 'ꜩ', 'vy': 'ꝡ'};
			var normalizeList = {'A': 'ÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄ', 'B': 'ḂḄḆ', 'C': 'ĆĈĊČÇḈƇ', 'D': 'ḊĎḌḐḒḎ', 'E': 'ÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚ', 'F': 'Ḟ', 'G': 'ǴĜḠĞĠǦĢǤƓ', 'H': 'ĤḢḦȞḤḨḪ', 'I': 'ÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬ', 'J': 'Ĵ', 'K': 'ḰǨḲĶḴƘⱩꝀꝂꝄ', 'L': 'ĿĹĽḶḸĻḼḺŁȽⱢⱠꝈ', 'M': 'ḾṀṂ', 'N': 'ǸŃÑṄŇṆŅṊṈ', 'O': 'ÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘ', 'P': 'ṔṖ', 'Q': '', 'R': 'ŔṘŘȐȒṚṜŖṞ', 'S': 'ŚṤŜṠŠṦṢṨȘŞⱾ', 'T': 'ṪŤṬȚŢṰṮ', 'U': 'ÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴ', 'V': 'ṼṾ', 'W': 'ẀẂŴẆẄẈ', 'X': 'ẊẌ', 'Y': 'ỲÝŶỸȲẎŸỶỴƳ', 'Z': 'ŹẐŻŽẒẔ', 'a': 'ẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁ', 'b': 'ḃḅḇ', 'c': 'ćĉċčçḉƈ', 'd': 'ḋďḍḑḓḏ', 'e': 'èéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛ', 'f': '', 'g': 'ǵĝḡğġǧģǥ', 'h': 'ĥḣḧȟḥḩḫẖ', 'i': 'ìíîĩīĭïḯỉǐȉȋịįḭ', 'j': 'ĵǰ', 'k': 'ḱǩḳķḵ', 'l': 'ŀĺľḷḹļḽḻ', 'm': 'ḿṁṃ', 'n': 'ǹńñṅňṇņṋṉ', 'o': 'òóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộ', 'p': 'ṕṗ', 'q': '', 'r': 'ŕṙřȑȓṛṝŗṟ', 's': 'śṥŝṡšṧṣṩșşȿ', 't': 'ṫẗťṭțţṱṯ', 'u': 'ùúûũṹūṻŭüǜǘǖǚủůűǔȕȗụṳ', 'v': 'ṽṿ', 'w': 'ẁẃŵẇẅẘẉ', 'x': 'ẋẍ', 'y': 'ỳýŷỹȳẏÿỷẙỵƴ', 'z': 'źẑżžẓẕ'};
			for (var i in replaceList) {
				replaceList[i] = new RegExp('[' + replaceList[i] + ']', 'g');
			}
			for (var i in normalizeList) {
				normalizeList[i] = new RegExp('[' + normalizeList[i] + ']', 'g');
			}
			this.replaceList = replaceList;
			this.normalizeList = normalizeList;
		},
		/**
		 * Return the path to the login server `action.php` file. AJAX requests
		 * to this file will always be made on the `play.pokemonshowdown.com`
		 * domain in order to have access to the correct cookies.
		 */
		getActionPHP: function () {
			var ret = '/~~' + Config.server.id + '/action.php';
			if (Config.testclient) {
				ret = 'https://' + Config.origindomain + ret;
			}
			return (this.getActionPHP = function () {
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
		finishRename: function (name, assertion) {
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
		rename: function (name) {
			// | , ; are not valid characters in names
			name = name.replace(/[\|,;]+/g, '');
			for (var i in this.replaceList) {
				name = name.replace(this.replaceList[i], i);
			}
			for (var i in this.normalizeList) {
				name = name.replace(this.normalizeList[i], i);
			}
			var userid = toUserid(name);
			if (!userid) {
				app.addPopupMessage("Usernames must contain at least one letter or number.");
				return;
			}

			if (this.get('userid') !== userid) {
				var self = this;
				$.get(this.getActionPHP(), {
					act: 'getassertion',
					userid: userid,
					challstr: this.challstr
				}, function (data) {
					self.finishRename(name, data);
				});
			} else {
				app.send('/trn ' + name);
			}
		},
		passwordRename: function (name, password) {
			var self = this;
			$.post(this.getActionPHP(), {
				act: 'login',
				name: name,
				pass: password,
				challstr: this.challstr
			}, Tools.safeJSON(function (data) {
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
		challstr: '',
		receiveChallstr: function (challstr) {
			if (challstr) {
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
				this.challstr = challstr;
				var self = this;
				$.get(this.getActionPHP(), {
					act: 'upkeep',
					challstr: this.challstr
				}, Tools.safeJSON(function (data) {
					self.loaded = true;
					if (!data.username) {
						app.topbar.updateUserbar();
						return;
					}

					// | , ; are not valid characters in names
					data.username = data.username.replace(/[\|,;]+/g, '');

					if (data.loggedin) {
						self.set('registered', {
							username: data.username,
							userid: toUserid(data.username)
						});
					}
					self.finishRename(data.username, data.assertion);
				}), 'text');
			}
		},
		/**
		 * Log out from the server (but remain connected as a guest).
		 */
		logout: function () {
			$.post(this.getActionPHP(), {
				act: 'logout',
				userid: this.get('userid')
			});
			app.send('/logout');
			app.trigger('init:socketclosed', "You have been logged out and disconnected.<br /><br />If you wanted to change your name while staying connected, use the 'Change Name' button or the '/nick' command.", false);
			app.socket.close();
		},
		setPersistentName: function (name) {
			if (location.host !== 'play.pokemonshowdown.com') return;
			$.cookie('showdown_username', (name !== undefined) ? name : this.get('name'), {
				expires: 14
			});
		}
	});

	var App = this.App = Backbone.Router.extend({
		root: '/',
		routes: {
			'*path': 'dispatchFragment'
		},
		focused: true,
		initialize: function () {
			window.app = this;
			this.initializeRooms();
			this.initializePopups();

			this.user = new User();
			this.ignore = {};
			this.supports = {};

			// down
			// if (document.location.hostname === 'play.pokemonshowdown.com') this.down = 'dos';

			this.addRoom('');
			this.topbar = new Topbar({el: $('#header')});
			if (this.down) {
				this.isDisconnected = true;
			} else if ($(window).width() >= 916) {
				if (document.location.hostname === 'play.pokemonshowdown.com' || Config.testclient) {
					this.addRoom('rooms', null, true);
					Storage.whenPrefsLoaded(function () {
						var autojoin = (Tools.prefs('autojoin') || '');
						var autojoinIds = [];
						if (autojoin) {
							var autojoins = autojoin.split(',');
							var roomid;
							for (var i = 0; i < autojoins.length; i++) {
								roomid = toRoomid(autojoins[i]);
								app.addRoom(roomid, null, true, autojoins[i]);
								if (roomid !== 'staff' && roomid !== 'upperstaff') autojoinIds.push(roomid);
							}
						}
						app.send('/autojoin ' + autojoinIds.join(','));
					});
				} else {
					this.addRoom('lobby', null, true);
					this.send('/autojoin');
				}
			}

			var self = this;

			Storage.whenPrefsLoaded(function () {
				Storage.prefs('bg', null);

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
						$('head').append('<style id="debugstyle">' + onCSS + '</style>');
					} else {
						debugStyle.innerHTML = onCSS;
					}
				}

				if (Tools.prefs('bwgfx') || Tools.prefs('noanim')) {
					// since xy data is loaded by default, only call
					// loadSpriteData if we want bw sprites or if we need bw
					// sprite data (if animations are disabled)
					Tools.loadSpriteData('bw');
				}
			});

			this.on('init:unsupported', function () {
				self.addPopupMessage('Your browser is unsupported.');
			});

			this.on('init:nothirdparty', function () {
				self.addPopupMessage('You have third-party cookies disabled in your browser, which is likely to cause problems. You should enable them and then refresh this page.');
			});

			this.on('init:socketclosed', function (message, showNotification) {
				// Display a desktop notification if the user won't immediately see the popup.
				if (self.isDisconnected) return;
				self.isDisconnected = true;
				if (showNotification !== false && (self.popups.length || !self.focused) && window.Notification) {
					self.rooms[''].requestNotifications();
					var disconnect = new Notification("Disconnected!", {lang: 'en', body: "You have been disconnected from Pokémon Showdown."});
					disconnect.onclick = function (e) {
						window.focus();
					};
				}
				self.rooms[''].updateFormats();
				$('.pm-log-add form').html('<small>You are disconnected and cannot chat.</small>');
				$('.chat-log-add').html('<small>You are disconnected and cannot chat.</small>');
				self.reconnectPending = (message || true);
				if (!self.popups.length) self.addPopup(ReconnectPopup, {message: message});
			});

			this.on('init:connectionerror', function () {
				self.isDisconnected = true;
				self.rooms[''].updateFormats();
				self.addPopup(ReconnectPopup, {cantconnect: true});
			});

			this.user.on('login:invalidname', function (name, reason) {
				self.addPopup(LoginPopup, {name: name, reason: reason});
			});

			this.user.on('login:authrequired', function (name) {
				self.addPopup(LoginPasswordPopup, {username: name});
			});

			this.on('response:savereplay', this.uploadReplay, this);

			this.on('response:rooms', this.roomsResponse, this);

			if (window.nodewebkit) {
				nwWindow.on('focus', function () {
					if (!self.focused) {
						self.focused = true;
						if (self.curRoom) self.curRoom.dismissNotification();
						if (self.curSideRoom) self.curSideRoom.dismissNotification();
					}
				});
				nwWindow.on('blur', function () {
					self.focused = false;
				});
			} else {
				$(window).on('focus click', function () {
					if (!self.focused) {
						self.focused = true;
						if (self.curRoom) self.curRoom.dismissNotification();
						if (self.curSideRoom) self.curSideRoom.dismissNotification();
					}
				});
				$(window).on('blur', function () {
					self.focused = false;
				});
			}

			$(window).on('beforeunload', function (e) {
				if (Config.server && Config.server.host === 'localhost') return;
				if (app.isDisconnected) return;
				for (var id in self.rooms) {
					var room = self.rooms[id];
					if (room && room.requestLeave && !room.requestLeave()) return "You have active battles.";
				}
			});

			$(window).on('keydown', function (e) {
				var el = e.target;
				var tagName = el.tagName.toUpperCase();

				// keypress happened in an empty textarea or a button
				var safeLocation = ((tagName === 'TEXTAREA' && !el.value.length) || tagName === 'BUTTON');

				if (app.curSideRoom && $(e.target).closest(app.curSideRoom.$el).length) {
					// keypress happened in sideroom
					if (e.shiftKey && e.keyCode === 37 && safeLocation) {
						// Shift+Left on desktop client
						if (app.moveRoomBy(app.curSideRoom, -1)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					} else if (e.shiftKey && e.keyCode === 39 && safeLocation) {
						// Shift+Right on desktop client
						if (app.moveRoomBy(app.curSideRoom, 1)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					} else if (e.keyCode === 37 && safeLocation || window.nodewebkit && e.ctrlKey && e.shiftKey && e.keyCode === 9) {
						// Left or Ctrl+Shift+Tab on desktop client
						if (app.focusRoomBy(app.curSideRoom, -1)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					} else if (e.keyCode === 39 && safeLocation || window.nodewebkit && e.ctrlKey && e.keyCode === 9) {
						// Right or Ctrl+Tab on desktop client
						if (app.focusRoomBy(app.curSideRoom, 1)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					}
					return;
				}
				// keypress happened outside of sideroom
				if (e.shiftKey && e.keyCode === 37 && safeLocation) {
					// Shift+Left on desktop client
					if (app.moveRoomBy(app.curRoom, -1)) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				} else if (e.shiftKey && e.keyCode === 39 && safeLocation) {
					// Shift+Right on desktop client
					if (app.moveRoomBy(app.curRoom, 1)) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				} else if (e.keyCode === 37 && safeLocation || window.nodewebkit && e.ctrlKey && e.shiftKey && e.keyCode === 9) {
					// Left or Ctrl+Shift+Tab on desktop client
					if (app.focusRoomBy(app.curRoom, -1)) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				} else if (e.keyCode === 39 && safeLocation || window.nodewebkit && e.ctrlKey && e.keyCode === 9) {
					// Right or Ctrl+Tab on desktop client
					if (app.focusRoomBy(app.curRoom, 1)) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				}
			});

			Storage.whenAppLoaded.load(this);

			this.initializeConnection();

			// HTML5 history throws exceptions when running on file://
			Backbone.history.start({pushState: !Config.testclient});
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
		initializeConnection: function () {
			Storage.whenPrefsLoaded(function () {
				// Config.server.afd = true;
				app.connect();
			});
		},
		/**
		 * This function establishes the actual connection to the sim server.
		 * This is intended to be called only by `initializeConnection` above.
		 * Don't call this function directly.
		 */
		connect: function () {
			if (this.down) return;

			var bannedHosts = ['cool.jit.su'];
			if (Config.server.banned || bannedHosts.indexOf(Config.server.host) >= 0) {
				this.addPopupMessage("This server has been deleted for breaking US laws or impersonating PS global staff.");
				return;
			}

			var self = this;
			var constructSocket = function () {
				var protocol = (Config.server.port === 443) ? 'https' : 'http';
				Config.server.host = $.trim(Config.server.host);
				return new SockJS(protocol + '://' + Config.server.host + ':' +
					Config.server.port + Config.sockjsprefix);
			};
			this.socket = constructSocket();
			setInterval(function () {
				if (Config.server.host !== $.trim(Config.server.host)) {
					app.socket.close();
				}
			}, 500);

			var socketopened = false;
			var altport = (Config.server.port === Config.server.altport);
			var altprefix = false;

			this.socket.onopen = function () {
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
					for (var i = 0; i < queue.length; i++) {
						self.send(queue[i], true);
					}
				}
			};
			this.socket.onmessage = function (msg) {
				if (window.console && console.log) {
					console.log('<< ' + msg.data);
				}
				if (msg.data.charAt(0) !== '{') {
					self.receive(msg.data);
					return;
				}
				alert("This server is using an outdated version of Pokémon Showdown and needs to be updated.");
			};
			var reconstructSocket = function (socket) {
				var s = constructSocket();
				s.onopen = socket.onopen;
				s.onmessage = socket.onmessage;
				s.onclose = socket.onclose;
				return s;
			};
			this.socket.onclose = function () {
				if (!socketopened) {
					if (Config.server.altport && !altport) {
						if (document.location.protocol === 'https:') {
							if (confirm("Could not connect with HTTPS. Try HTTP?")) {
								return document.location.replace('http://' +
									document.location.host + document.location.pathname);
							}
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
		dispatchFragment: function (fragment) {
			if (location.search && window.history) {
				history.replaceState(null, null, '/');
			}
			this.fragment = fragment = toRoomid(fragment || '');
			if (this.initialFragment === undefined) this.initialFragment = fragment;
			this.tryJoinRoom(fragment);
			this.updateTitle(this.rooms[fragment]);
		},
		/**
		 * Send to sim server
		 */
		send: function (data, room) {
			if (room && room !== 'lobby' && room !== true) {
				data = room + '|' + data;
			} else if (room !== true) {
				data = '|' + data;
			}
			if (!this.socket || (this.socket.readyState !== SockJS.OPEN)) {
				if (!this.sendQueue) this.sendQueue = [];
				this.sendQueue.push(data);
				return;
			}
			if (window.console && console.log) {
				console.log('>> ' + data);
			}
			this.socket.send(data);
		},
		/**
		 * Send team to sim server
		 */
		sendTeam: function (team) {
			this.send('/utm ' + Storage.getPackedTeam(team));
		},
		/**
		 * Receive from sim server
		 */
		receive: function (data) {
			var roomid = '';
			var autojoined = false;
			if (data.substr(0, 1) === '>') {
				var nlIndex = data.indexOf('\n');
				if (nlIndex < 0) return;
				roomid = toRoomid(data.substr(1, nlIndex - 1));
				data = data.substr(nlIndex + 1);
			}
			if (data.substr(0, 6) === '|init|') {
				if (!roomid) roomid = 'lobby';
				var roomType = data.substr(6);
				var roomTypeLFIndex = roomType.indexOf('\n');
				if (roomTypeLFIndex >= 0) roomType = roomType.substr(0, roomTypeLFIndex);
				roomType = toId(roomType);
				if (this.rooms[roomid] || roomid === 'staff' || roomid === 'upperstaff') {
					// autojoin rooms are joined in background
					this.addRoom(roomid, roomType, true);
				} else {
					this.joinRoom(roomid, roomType, true);
				}
				if (roomType === 'chat') autojoined = true;
			} else if ((data + '|').substr(0, 8) === '|expire|') {
				var room = this.rooms[roomid];
				if (room) {
					room.expired = (data.substr(8) || true);
					if (room.updateUser) room.updateUser();
				}
				return;
			} else if ((data + '|').substr(0, 8) === '|deinit|' || (data + '|').substr(0, 8) === '|noinit|') {
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
					errormessage = data.substr(pipeIndex + 1);
					data = data.substr(0, pipeIndex);
				}
				// handle error codes here
				// data is the error code
				if (data === 'namerequired') {
					var self = this;
					this.once('init:choosename', function () {
						self.send('/join ' + roomid);
					});
				} else if (data !== 'namepending') {
					if (isdeinit) { // deinit
						if (this.rooms[roomid] && this.rooms[roomid].type === 'chat') {
							this.removeRoom(roomid, true);
							this.updateAutojoin();
						} else {
							this.removeRoom(roomid, true);
						}
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
				if (autojoined) this.updateAutojoin();
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
			case 'challstr':
				if (parts[2]) {
					this.user.receiveChallstr(parts[1] + '|' + parts[2]);
				} else {
					this.user.receiveChallstr(parts[1]);
				}
				break;

			case 'formats':
				this.parseFormats(parts);
				break;

			case 'updateuser':
				var nlIndex = data.indexOf('\n');
				if (nlIndex > 0) {
					this.receive(data.substr(nlIndex + 1));
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
				app.addPopup(LoginPopup, {name: parts[1] || '', error: parts[2] || ''});
				break;

			case 'queryresponse':
				var responseData = JSON.parse(data.substr(16 + parts[1].length));
				app.trigger('response:' + parts[1], responseData);
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
				var maxWidth = undefined;
				var type = 'semimodal';
				data = data.substr(7);
				if (data.substr(0, 6) === '|wide|') {
					data = data.substr(6);
					maxWidth = 960;
				}
				if (data.substr(0, 7) === '|modal|') {
					data = data.substr(7);
					type = 'modal';
				}
				if (data.substr(0, 6) === '|html|') {
					data = data.substr(6);
					app.addPopup(Popup, {
						type: type,
						maxWidth: maxWidth,
						htmlMessage: Tools.sanitizeHTML(data)
					});
				} else {
					app.addPopup(Popup, {
						type: type,
						maxWidth: maxWidth,
						message: data.replace(/\|\|/g, '\n')
					});
				}
				if (this.rooms['']) this.rooms[''].resetPending();
				break;

			case 'disconnect':
				app.trigger('init:socketclosed', Tools.sanitizeHTML(data.substr(12)));
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

			case 'refresh':
				// refresh the page
				document.location.reload(true);
				break;

			case 'c':
			case 'chat':
				if (parts[1] === '~') {
					if (parts[2].substr(0, 6) === '/warn ') {
						app.addPopup(RulesPopup, {warning: parts[2].substr(6)});
						break;
					}
				}

			/* fall through */
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
		parseFormats: function (formatsList) {
			var isSection = false;
			var section = '';

			var column = 0;
			var columnChanged = false;

			window.BattleFormats = {};
			for (var j = 1; j < formatsList.length; j++) {
				if (isSection) {
					section = formatsList[j];
					isSection = false;
				} else if (formatsList[j] === ',LL') {
					app.localLadder = true;
				} else if (formatsList[j] === '' || (formatsList[j].charAt(0) === ',' && !isNaN(formatsList[j].substr(1)))) {
					isSection = true;

					if (formatsList[j]) {
						var newColumn = parseInt(formatsList[j].substr(1), 10) || 0;
						if (column !== newColumn) {
							column = newColumn;
							columnChanged = true;
						}
					}
				} else {
					var name = formatsList[j];
					var searchShow = true;
					var challengeShow = true;
					var tournamentShow = true;
					var team = null;
					var lastCommaIndex = name.lastIndexOf(',');
					var code = lastCommaIndex >= 0 ? parseInt(name.substr(lastCommaIndex + 1), 16) : NaN;
					if (!isNaN(code)) {
						name = name.substr(0, lastCommaIndex);
						if (code & 1) team = 'preset';
						if (!(code & 2)) searchShow = false;
						if (!(code & 4)) challengeShow = false;
						if (!(code & 8)) tournamentShow = false;
					} else {
						// Backwards compatibility: late 0.9.0 -> 0.10.0
						if (name.substr(name.length - 2) === ',#') { // preset teams
							team = 'preset';
							name = name.substr(0, name.length - 2);
						}
						if (name.substr(name.length - 2) === ',,') { // search-only
							challengeShow = false;
							name = name.substr(0, name.length - 2);
						} else if (name.substr(name.length - 1) === ',') { // challenge-only
							searchShow = false;
							name = name.substr(0, name.length - 1);
						}
					}
					var id = toId(name);
					var isTeambuilderFormat = !team && name.slice(-11) !== 'Custom Game';
					var teambuilderFormat = '';
					if (isTeambuilderFormat) {
						var parenPos = name.indexOf('(');
						if (parenPos > 0 && name.charAt(name.length - 1) === ')') {
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
						tournamentShow: tournamentShow,
						rated: searchShow && id.substr(0, 7) !== 'unrated',
						teambuilderFormat: teambuilderFormat,
						isTeambuilderFormat: isTeambuilderFormat,
						effectType: 'Format'
					};
				}
			}

			// Match base formats to their variants, if they are unavailable in the server.
			var multivariantFormats = {};
			for (var id in BattleFormats) {
				var teambuilderFormat = BattleFormats[BattleFormats[id].teambuilderFormat];
				if (!teambuilderFormat || multivariantFormats[teambuilderFormat.id]) continue;
				if (!teambuilderFormat.searchShow && !teambuilderFormat.challengeShow && !teambuilderFormat.tournamentShow) {
					// The base format is not available.
					if (teambuilderFormat.battleFormat) {
						multivariantFormats[teambuilderFormat.id] = 1;
						teambuilderFormat.hasBattleFormat = false;
						teambuilderFormat.battleFormat = '';
					} else {
						teambuilderFormat.hasBattleFormat = true;
						teambuilderFormat.battleFormat = id;
					}
				}
			}
			if (columnChanged) app.supports['formatColumns'] = true;
			this.trigger('init:formats');
		},
		uploadReplay: function (data) {
			var id = data.id;
			var serverid = Config.server.id && toId(Config.server.id.split(':')[0]);
			if (serverid && serverid !== 'showdown') id = serverid + '-' + id;
			$.post(app.user.getActionPHP() + '?act=uploadreplay', {
				log: data.log,
				id: id
			}, function (data) {
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
					app.addPopupMessage("Error while uploading replay: " + data);
				}
			});
		},
		roomsResponse: function (data) {
			if (data) {
				this.roomsData = data;
			}
			app.topbar.updateTabbar();
		},
		clearGlobalListeners: function () {
			// jslider doesn't clear these when it should,
			// so we have to do it for them :/
			$(document).off('click touchstart mousedown touchmove mousemove touchend mouseup');
			$(document).on('click', 'a', function (e) {
				if (this.className === 'closebutton') return; // handled elsewhere
				if (this.className.indexOf('minilogo') >= 0) return; // handled elsewhere
				if (!this.href) return; // should never happen
				if (this.host === 'play.pokemonshowdown.com' || this.host === 'psim.us' || this.host === location.host) {
					if (!e.cmdKey && !e.metaKey && !e.ctrlKey) {
						var target = this.pathname.substr(1);
						var shortLinks = /^(appeals?|rooms?suggestions?|suggestions?|adminrequests?|bugs?|bugreports?|rules?)$/;
						if (target.indexOf('/') < 0 && target.indexOf('.') < 0 && !shortLinks.test(target)) {
							window.app.tryJoinRoom(target);
							e.preventDefault();
							e.stopPropagation();
							e.stopImmediatePropagation();
							return;
						}
					}
				}
				if (window.nodewebkit && this.target === '_blank') {
					gui.Shell.openExternal(this.href);
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
				}
			});
		},

		/*********************************************************
		 * Rooms
		 *********************************************************/

		initializeRooms: function () {
			this.rooms = Object.create(null); // {}
			this.roomList = [];
			this.sideRoomList = [];

			$(window).on('resize', _.bind(this.resize, this));
		},
		fixedWidth: true,
		resize: function () {
			if (window.screen && screen.width && screen.width >= 320) {
				if (this.fixedWidth) {
					document.getElementById('viewport').setAttribute('content', 'width=device-width');
					this.fixedWidth = false;
				}
			} else {
				if (!this.fixedWidth) {
					document.getElementById('viewport').setAttribute('content', 'width=320');
					this.fixedWidth = true;
				}
			}
			if (!app.roomsFirstOpen && !this.down && $(window).width() >= 916 && document.location.hostname === 'play.pokemonshowdown.com') {
				this.addRoom('rooms');
			}
			this.updateLayout();
		},
		// the currently active room
		curRoom: null,
		curSideRoom: null,
		sideRoom: null,
		joinRoom: function (id, type, nojoin) {
			if (this.rooms[id]) {
				this.focusRoom(id);
				return this.rooms[id];
			}
			if (id.substr(0, 11) === 'battle-gen5' && !Tools.loadedSpriteData['bw']) Tools.loadSpriteData('bw');

			var room = this._addRoom(id, type, nojoin);
			this.focusRoom(id);
			return room;
		},
		/**
		 * We tried to join a room but it didn't exist
		 */
		unjoinRoom: function (id) {
			if (Config.server.id && this.rooms[id] && this.rooms[id].type === 'battle') {
				if (id === this.initialFragment) {
					// you were direct-linked to this nonexistent room
					var replayid = id.substr(7);
					if (Config.server.id !== 'showdown') replayid = Config.server.id + '-' + replayid;
					// document.location.replace('http://replay.pokemonshowdown.com/' + replayid);
					var replayLink = 'http://replay.pokemonshowdown.com/' + replayid;
					app.addPopupMessage('This room does not exist. You might want to try the replay: <a href="' + replayLink + '">' + replayLink + '</a>');
					return;
				}
			}
			this.removeRoom(id, true);
			if (this.curRoom) this.navigate(this.curRoom.id, {replace: true});
		},
		tryJoinRoom: function (id) {
			this.joinRoom(id);
		},
		addRoom: function (id, type, nojoin, title) {
			this._addRoom(id, type, nojoin, title);
			this.updateSideRoom();
			this.updateLayout();
		},
		_addRoom: function (id, type, nojoin, title) {
			var oldRoom;
			if (this.rooms[id]) {
				if (type && this.rooms[id].type !== type) {
					// this room changed type
					// (or the type we guessed it would be was wrong)
					var oldRoom = this.rooms[id];
					var index = this.roomList.indexOf(oldRoom);
					if (index >= 0) this.roomList.splice(index, 1);
					index = this.sideRoomList.indexOf(oldRoom);
					if (index >= 0) this.sideRoomList.splice(index, 1);
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
				'constructor': ChatRoom
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
				if (id.substr(0, 7) === 'battle-') {
					type = BattleRoom;
				} else {
					type = ChatRoom;
				}
			}

			var room = this.rooms[id] = new type({
				id: id,
				el: el,
				nojoin: nojoin,
				title: title
			});
			if (oldRoom) {
				if (this.curRoom === oldRoom) this.curRoom = room;
				if (this.curSideRoom === oldRoom) this.curSideRoom = room;
				if (this.sideRoom === oldRoom) this.sideRoom = room;
			}
			if (type === BattleRoom) this.roomList.push(room);
			if (type === ChatRoom) this.sideRoomList.push(room);
			return room;
		},
		focusRoom: function (id) {
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
				} else if (this.rooms['']) {
					this.rooms[''].hide();
				}
				this.curRoom = window.room = room;
				this.updateLayout();
				if (this.curRoom.id === id) {
					this.fragment = id;
					this.navigate(id);
					this.updateTitle(this.curRoom);
				}
			}

			room.focus();
			return;
		},
		focusRoomLeft: function (id) {
			var room = this.rooms[id];
			if (!room) return false;
			if (this.curRoom === room) {
				room.focus();
				return true;
			}

			if (this.curSideRoom === room) {
				this.sideRoom = this.curSideRoom = this.sideRoomList[0] || null;
			}

			room.isSideRoom = false;
			if (this.curRoom) {
				this.curRoom.hide();
				this.curRoom = null;
			} else if (this.rooms['']) {
				this.rooms[''].hide();
			}
			this.curRoom = room;
			this.updateLayout();
			if (this.curRoom.id === id) this.navigate(id);

			room.focus();
			return;
		},
		focusRoomRight: function (id) {
			var room = this.rooms[id];
			if (!room) return false;
			if (this.curSideRoom === room) {
				room.focus();
				return true;
			}

			if (this.curRoom === room) {
				this.curRoom = this.roomList[this.roomList.length - 1] || this.rooms[''];
			}

			room.isSideRoom = true;
			if (this.curSideRoom) {
				this.curSideRoom.hide();
				this.curSideRoom = null;
			}
			this.curSideRoom = this.sideRoom = room;
			this.updateLayout();
			// if (this.curRoom.id === id) this.navigate(id);

			room.focus();
			return;
		},
		updateLayout: function () {
			if (!this.curRoom) return; // can happen during initialization
			if (!this.sideRoom) {
				this.curRoom.show('full');
				if (this.curRoom.id === '') {
					if ($(window).width() < this.curRoom.bestWidth) {
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
				if ($(window).width() < this.curRoom.bestWidth) {
					this.curRoom.$el.addClass('tiny-layout');
				} else {
					this.curRoom.$el.removeClass('tiny-layout');
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
		updateSideRoom: function (id) {
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
		leaveRoom: function (id, e) {
			var room = this.rooms[id];
			if (!room) return false;
			if (room.requestLeave && !room.requestLeave(e)) return false;
			return this.removeRoom(id);
		},
		removeRoom: function (id, alreadyLeft) {
			var room = this.rooms[id];
			if (room) {
				if (room === this.curRoom) this.focusRoom('');
				delete this.rooms[id];
				var index = this.roomList.indexOf(room);
				if (index >= 0) this.roomList.splice(index, 1);
				index = this.sideRoomList.indexOf(room);
				if (index >= 0) this.sideRoomList.splice(index, 1);
				room.destroy(alreadyLeft);
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
		moveRoomBy: function (room, amount) {
			var index = this.roomList.indexOf(room);
			if (index >= 0) {
				var newIndex = index + amount;
				if (newIndex < 0) return false;
				if (newIndex >= this.roomList.length) {
					this.roomList.splice(index, 1);
					this.sideRoomList.unshift(room);
					this.focusRoomRight(room.id);
				} else {
					this.roomList.splice(index, 1);
					this.roomList.splice(newIndex, 0, room);
					this.topbar.updateTabbar();
				}
				room.focusText();
				if (room.type === 'chat') this.updateAutojoin();
				return true;
			}
			index = this.sideRoomList.indexOf(room);
			if (index >= 0) {
				var newIndex = index + amount;
				if (newIndex >= this.sideRoomList.length) return false;
				if (newIndex < 0) {
					this.sideRoomList.splice(index, 1);
					this.roomList.push(room);
					this.focusRoomLeft(room.id);
				} else {
					this.sideRoomList.splice(index, 1);
					this.sideRoomList.splice(newIndex, 0, room);
					this.topbar.updateTabbar();
				}
				room.focusText();
				if (room.type === 'chat') this.updateAutojoin();
				return true;
			}
			return false;
		},
		focusRoomBy: function (room, amount) {
			this.arrowKeysUsed = true;
			var rooms = this.roomList.concat(this.sideRoomList);
			if (room && room.id === 'rooms') {
				if (!rooms.length) return false;
				this.focusRoom(rooms[amount < 0 ? rooms.length - 1 : 0].id);
				return true;
			}
			var index = rooms.indexOf(room);
			if (index >= 0) {
				var newIndex = index + amount;
				if (!rooms[newIndex]) {
					this.joinRoom('rooms');
					return true;
				}
				this.focusRoom(rooms[newIndex].id);
				return true;
			}
			return false;
		},
		openInNewWindow: function (url) {
			if (window.nodewebkit) {
				gui.Shell.openExternal(url);
			} else {
				window.open(url, '_blank');
			}
		},
		clickLink: function (e) {
			if (window.nodewebkit) {
				gui.Shell.openExternal(e.target.href);
				return false;
			}
		},
		roomTitleChanged: function (room) {
			if (room.id === this.fragment) this.updateTitle(room);
		},
		updateTitle: function (room) {
			document.title = room.title ? room.title + " - Showdown!" : "Showdown!";
		},
		updateAutojoin: function () {
			if (Config.server.id !== 'showdown') return;
			var autojoins = [];
			var autojoinCount = 0;
			var rooms = this.roomList.concat(this.sideRoomList);
			for (var i = 0; i < rooms.length; i++) {
				var room = rooms[i];
				if (room.type !== 'chat') continue;
				autojoins.push(room.id.indexOf('-') >= 0 ? room.id : (room.title || room.id));
				if (room.id === 'staff' || room.id === 'upperstaff') continue;
				autojoinCount++;
				if (autojoinCount >= 10) break;
			}
			Tools.prefs('autojoin', autojoins.join(','));
		},

		/*********************************************************
		 * Popups
		 *********************************************************/

		popups: null,
		initializePopups: function () {
			this.popups = [];
		},

		addPopup: function (type, data) {
			if (!data) data = {};

			if (data.sourceEl === undefined && app.dispatchingButton) {
				data.sourceEl = app.dispatchingButton;
			}
			if (data.sourcePopup === undefined && app.dispatchingPopup) {
				data.sourcePopup = app.dispatchingPopup;
			}
			if (this.dismissingSource && $(data.sourceEl)[0] === this.dismissingSource) return;
			while (this.popups.length) {
				var prevPopup = this.popups[this.popups.length - 1];
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
				$overlay = $('<div class="ps-overlay"></div>').appendTo('body').append(popup.el);
				if (popup.type === 'semimodal') {
					$overlay.on('click', function (e) {
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
		addPopupMessage: function (message) {
			// shorthand for adding a popup message
			// this is the equivalent of alert(message)
			app.addPopup(Popup, {message: message});
		},
		addPopupPrompt: function (message, buttonOrCallback, callback) {
			var button = (callback ? buttonOrCallback : 'OK');
			callback = (!callback ? buttonOrCallback : callback);
			app.addPopup(PromptPopup, {message: message, button: button, callback: callback});
		},
		closePopup: function (id) {
			if (this.popups.length) {
				var popup = this.popups.pop();
				popup.remove();
				if (this.reconnectPending) this.addPopup(ReconnectPopup, {message: this.reconnectPending});
				return true;
			}
			return false;
		},
		dismissPopups: function () {
			var source = false;
			while (this.popups.length) {
				var popup = this.popups[this.popups.length - 1];
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
		initialize: function () {
			this.$el.html('<img class="logo" src="' + Tools.resourcePrefix + 'pokemonshowdownbeta.png" alt="Pok&eacute;mon Showdown! (beta)" /><div class="maintabbarbottom"></div><div class="tabbar maintabbar"><div class="inner"></div></div><div class="userbar"></div>');
			this.$tabbar = this.$('.maintabbar .inner');
			// this.$sidetabbar = this.$('.sidetabbar');
			this.$userbar = this.$('.userbar');
			this.updateTabbar();

			app.user.on('change', this.updateUserbar, this);
			this.updateUserbar();
		},

		// userbar
		updateUserbar: function () {
			var buf = '';
			var name = ' ' + app.user.get('name');
			var color = hashColor(app.user.get('userid'));
			if (!app.user.loaded) {
				buf = '<button disabled>Loading...</button> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			} else if (app.user.get('named')) {
				buf = '<span class="username" data-name="' + Tools.escapeHTML(name) + '" style="' + color + '"><i class="fa fa-user" style="color:#779EC5"></i> ' + Tools.escapeHTML(name) + '</span> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			} else {
				buf = '<button name="login">Choose name</button> <button class="icon" name="openSounds"><i class="' + (Tools.prefs('mute') ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i></button> <button class="icon" name="openOptions"><i class="fa fa-cog"></i></button>';
			}
			this.$userbar.html(buf);
		},
		login: function () {
			app.addPopup(LoginPopup);
		},
		openSounds: function () {
			app.addPopup(SoundsPopup);
		},
		openOptions: function () {
			app.addPopup(OptionsPopup);
		},
		clickUsername: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var name = $(e.currentTarget).data('name');
			app.addPopup(UserPopup, {name: name, sourceEl: e.currentTarget});
		},

		// tabbar
		renderRoomTab: function (room) {
			if (!room) return '';
			var id = room.id;
			var buf = '<li><a class="button' + (app.curRoom === room || app.curSideRoom === room ? ' cur' : '') + (room.notificationClass || '') + (id === '' || id === 'rooms' ? '' : ' closable') + '" href="' + app.root + id + '">';
			switch (id) {
			case '':
				return buf + '<i class="fa fa-home"></i> <span>Home</span></a></li>';
			case 'teambuilder':
				return buf + '<i class="fa fa-pencil-square-o"></i> <span>Teambuilder</span></a><a class="closebutton" href="' + app.root + 'teambuilder"><i class="fa fa-times-circle"></i></a></li>';
			case 'ladder':
				return buf + '<i class="fa fa-list-ol"></i> <span>Ladder</span></a><a class="closebutton" href="' + app.root + 'ladder"><i class="fa fa-times-circle"></i></a></li>';
			case 'rooms':
				return buf + '<i class="fa fa-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
			default:
				if (id.substr(0, 7) === 'battle-') {
					var name = Tools.escapeHTML(room.title);
					var formatid = id.substr(7).split('-')[0];
					if (!name) {
						var p1 = (room.battle && room.battle.p1 && room.battle.p1.name) || '';
						var p2 = (room.battle && room.battle.p2 && room.battle.p2.name) || '';
						if (p1 && p2) {
							name = '' + Tools.escapeHTML(p1) + ' v. ' + Tools.escapeHTML(p2);
						} else if (p1 || p2) {
							name = '' + Tools.escapeHTML(p1) + Tools.escapeHTML(p2);
						} else {
							name = '(empty room)';
						}
					}
					return buf + '<i class="text">' + Tools.escapeFormat(formatid) + '</i><span>' + name + '</span></a><a class="closebutton" href="' + app.root + id + '"><i class="fa fa-times-circle"></i></a></li>';
				} else {
					return buf + '<i class="fa fa-comment-o"></i> <span>' + (Tools.escapeHTML(room.title) || (id === 'lobby' ? 'Lobby' : id)) + '</span></a><a class="closebutton" href="' + app.root + id + '"><i class="fa fa-times-circle"></i></a></li>';
				}
			}
		},
		updateTabbar: function () {
			if ($(window).width() < 420) return this.updateTabbarMini();
			this.$('.logo').show();
			this.$('.maintabbar').removeClass('minitabbar');

			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul>' + this.renderRoomTab(app.rooms['']) + this.renderRoomTab(app.rooms['teambuilder']) + this.renderRoomTab(app.rooms['ladder']) + '</ul>';
			var sideBuf = '';

			var notificationCount = app.rooms[''].notifications ? 1 : 0;
			if (app.roomList.length) buf += '<ul>';
			for (var i = 0; i < app.roomList.length; i++) {
				var room = app.roomList[i];
				if (room.notifications) notificationCount++;
				buf += this.renderRoomTab(room);
			}
			if (app.roomList.length) buf += '</ul>';

			for (var i = 0; i < app.sideRoomList.length; i++) {
				var room = app.sideRoomList[i];
				if (room.notifications) notificationCount++;
				sideBuf += this.renderRoomTab(room);
			}
			if (window.nodewebkit) {
				if (nwWindow.setBadgeLabel) nwWindow.setBadgeLabel(notificationCount || '');
			}
			sideBuf += '<li><a class="button' + (curId === 'rooms' || curSideId === 'rooms' ? ' cur' : '') + '" href="' + app.root + 'rooms"><i class="fa fa-plus" style="margin:7px auto -6px auto"></i> <span>&nbsp;</span></a></li>';
			var margin = 0;
			if (sideBuf) {
				if (app.curSideRoom) {
					margin = app.curSideRoom.leftWidth - 144;
					buf += '<ul class="siderooms" style="float:none;margin-left:' + margin + 'px">' + sideBuf + '</ul>';
				} else {
					buf += '<ul>' + sideBuf + '</ul>';
				}
			}
			this.$tabbar.html(buf);
			var $lastUl = this.$tabbar.children().last();
			var $lastLi = $lastUl.children().last();
			var offset = $lastLi.offset();
			var width = $lastLi.outerWidth();
			// 166 here is the difference between the .maintabbar's right margin and the a.button's right margin.
			var overflow = offset.left + width + 166 - $(window).width();
			if (app.curSideRoom && overflow > 0) {
				margin -= overflow;
				$lastUl.css('margin-left', margin + 'px');
				offset = $lastLi.offset();
				overflow = offset.left + width + 166 - $(window).width();
			}
			if (offset.top >= 37 || overflow > 0) {
				this.$tabbar.append('<div class="overflow"><button name="tablist" class="button"><i class="fa fa-caret-down"></i></button></div>');
			}

			if (app.rooms['']) app.rooms[''].updateRightMenu();
		},
		updateTabbarMini: function () {
			this.$('.logo').hide();
			this.$('.maintabbar').addClass('minitabbar');
			var notificationClass = '';
			for (var i in app.rooms) {
				if (app.rooms[i] !== app.curRoom && app.rooms[i].notificationClass === ' notifying') notificationClass = ' notifying';
			}
			var buf = '<ul><li><a class="button minilogo' + notificationClass + '" href="' + app.root + '"><img src="' + Tools.resourcePrefix + 'favicon-128.png" width="32" height="32" alt="PS!" /><i class="fa fa-caret-down" style="display:inline-block"></i></a></li></ul>';

			buf += '<ul>' + this.renderRoomTab(app.curRoom) + '</ul>';

			this.$tabbar.html(buf);

			if (app.rooms['']) app.rooms[''].updateRightMenu();
		},
		dispatchClickButton: function (e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dismissingSource = app.dismissPopups();
				app.dispatchingButton = target;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name](target.value, target);
				delete app.dismissingSource;
				delete app.dispatchingButton;
			}
		},
		click: function (e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			var $target = $(e.currentTarget);
			if ($target.hasClass('minilogo')) {
				app.addPopup(TabListPopup, {sourceEl: e.currentTarget});
				return;
			}
			var id = $target.attr('href');
			if (id.substr(0, app.root.length) === app.root) {
				id = id.substr(app.root.length);
			}
			if ($target.hasClass('closebutton')) {
				app.leaveRoom(id, e);
			} else {
				app.joinRoom(id);
			}
		},
		tablist: function () {
			app.addPopup(TabListPopup);
		}
	});

	var Room = this.Room = Backbone.View.extend({
		className: 'ps-room',
		constructor: function (options) {
			if (!this.events) this.events = {};
			if (!this.events['click button']) this.events['click button'] = 'dispatchClickButton';
			if (!this.events['click']) this.events['click'] = 'dispatchClickBackground';

			Backbone.View.apply(this, arguments);

			if (!(options && options.nojoin)) this.join();
			if (options && options.title) this.title = options.title;
		},
		dispatchClickButton: function (e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dismissingSource = app.dismissPopups();
				app.dispatchingButton = target;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name](target.value, target);
				delete app.dismissingSource;
				delete app.dispatchingButton;
			}
		},
		dispatchClickBackground: function (e) {
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
		send: function (data) {
			app.send(data, this.id);
		},
		/**
		 * Receive from sim server
		 */
		receive: function (data) {
			//
		},

		// layout

		bestWidth: 659,
		show: function (position, leftWidth) {
			this.leftWidth = 0;
			switch (position) {
			case 'left':
				this.$el.css({left: 0, width: leftWidth, right: 'auto'});
				break;
			case 'right':
				this.$el.css({left: leftWidth + 1, width: 'auto', right: 0});
				this.leftWidth = leftWidth;
				break;
			case 'full':
				this.$el.css({left: 0, width: 'auto', right: 0});
				break;
			}
			this.$el.show();
			this.dismissAllNotifications(true);
		},
		hide: function () {
			this.blur();
			this.$el.hide();
		},
		focus: function () {},
		blur: function () {},
		join: function () {},
		leave: function () {},

		// notifications

		requestNotifications: function () {
			try {
				if (window.webkitNotifications && webkitNotifications.requestPermission) {
					// Notification.requestPermission crashes Chrome 23:
					//   https://code.google.com/p/chromium/issues/detail?id=139594
					// In lieu of a way to detect Chrome 23, we'll just use the old
					// requestPermission API, which works to request permissions for
					// the new Notification spec anyway.
					webkitNotifications.requestPermission();
				} else if (window.Notification && Notification.requestPermission) {
					Notification.requestPermission(function (permission) {});
				}
			} catch (e) {}
		},
		notificationClass: '',
		notifications: null,
		subtleNotification: false,
		notify: function (title, body, tag, once) {
			if (once && app.focused && (this === app.curRoom || this == app.curSideRoom)) return;
			if (!tag) tag = 'message';
			var needsTabbarUpdate = false;
			if (!this.notifications) {
				this.notifications = {};
				needsTabbarUpdate = true;
			}
			if (app.focused && (this === app.curRoom || this == app.curSideRoom)) {
				this.notifications[tag] = {};
			} else if (window.nodewebkit && !nwWindow.setBadgeLabel) {
				// old desktop client
				// note: window.Notification exists but does nothing
				nwWindow.requestAttention(true);
			} else if (window.Notification) {
				// old one doesn't need to be closed; sending the tag should
				// automatically replace the old notification
				var notification = this.notifications[tag] = new Notification(title, {
					lang: 'en',
					body: body,
					tag: this.id + ':' + tag
				});
				var self = this;
				notification.onclose = function () {
					self.dismissNotification(tag);
				};
				notification.onclick = function () {
					window.focus();
					self.clickNotification(tag);
				};
				if (Tools.prefs('temporarynotifications')) {
					if (notification.cancel) {
						setTimeout(function () {notification.cancel();}, 5000);
					} else if (notification.close) {
						setTimeout(function () {notification.close();}, 5000);
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
			if (needsTabbarUpdate) {
				this.notificationClass = ' notifying';
				app.topbar.updateTabbar();
			}
		},
		subtleNotifyOnce: function () {
			if (app.focused && (this === app.curRoom || this == app.curSideRoom)) return;
			if (this.notifications || this.subtleNotification) return;
			this.subtleNotification = true;
			this.notificationClass = ' subtle-notifying';
			app.topbar.updateTabbar();
		},
		notifyOnce: function (title, body, tag) {
			return this.notify(title, body, tag, true);
		},
		closeNotification: function (tag, alreadyClosed) {
			if (!tag) return this.closeAllNotifications();
			if (window.nodewebkit) nwWindow.requestAttention(false);
			if (!this.notifications || !this.notifications[tag]) return;
			if (!alreadyClosed && this.notifications[tag].close) this.notifications[tag].close();
			delete this.notifications[tag];
			if (_.isEmpty(this.notifications)) {
				this.notifications = null;
				this.notificationClass = (this.subtleNotification ? ' subtle-notifying' : '');
				app.topbar.updateTabbar();
			}
		},
		closeAllNotifications: function (skipUpdate) {
			if (!this.notifications && !this.subtleNotification) {
				return;
			}
			if (window.nodewebkit) nwWindow.requestAttention(false);
			this.subtleNotification = false;
			if (this.notifications) {
				for (var tag in this.notifications) {
					if (this.notifications[tag].close) this.notifications[tag].close();
				}
				this.notifications = null;
			}
			this.notificationClass = '';
			if (skipUpdate) return;
			app.topbar.updateTabbar();
		},
		dismissNotification: function (tag) {
			if (!tag) return this.dismissAllNotifications();
			if (window.nodewebkit) nwWindow.requestAttention(false);
			if (!this.notifications || !this.notifications[tag]) return;
			if (this.notifications[tag].close) this.notifications[tag].close();
			if (!this.notifications || this.notifications[tag]) return; // avoid infinite recursion
			if (this.notifications[tag].psAutoclose) {
				delete this.notifications[tag];
				if (!this.notifications || _.isEmpty(this.notifications)) {
					this.notifications = null;
					this.notificationClass = (this.subtleNotification ? ' subtle-notifying' : '');
					app.topbar.updateTabbar();
				}
			} else {
				this.notifications[tag] = {};
			}

			if (this.lastMessageDate) {
				// Mark chat messages as read to avoid double-notifying on reload
				var lastMessageDates = Tools.prefs('logtimes') || (Tools.prefs('logtimes', {}), Tools.prefs('logtimes'));
				if (!lastMessageDates[Config.server.id]) lastMessageDates[Config.server.id] = {};
				lastMessageDates[Config.server.id][this.id] = this.lastMessageDate;
				Storage.prefs.save();
			}
		},
		dismissAllNotifications: function (skipUpdate) {
			if (!this.notifications && !this.subtleNotification) {
				return;
			}
			if (window.nodewebkit) nwWindow.requestAttention(false);
			this.subtleNotification = false;
			if (this.notifications) {
				for (var tag in this.notifications) {
					if (!this.notifications[tag].psAutoclose) continue;
					if (this.notifications[tag].close) this.notifications[tag].close();
					delete this.notifications[tag];
				}
				if (!this.notifications || _.isEmpty(this.notifications)) {
					this.notifications = null;
				}
			}
			if (!this.notifications) {
				this.notificationClass = '';
				if (skipUpdate) return;
				app.topbar.updateTabbar();
			}

			if (this.lastMessageDate) {
				// Mark chat messages as read to avoid double-notifying on reload
				var lastMessageDates = Tools.prefs('logtimes') || (Tools.prefs('logtimes', {}), Tools.prefs('logtimes'));
				if (!lastMessageDates[Config.server.id]) lastMessageDates[Config.server.id] = {};
				lastMessageDates[Config.server.id][this.id] = this.lastMessageDate;
				Storage.prefs.save();
			}
		},
		clickNotification: function (tag) {
			this.dismissNotification(tag);
			app.focusRoom(this.id);
		},
		close: function () {
			app.leaveRoom(this.id);
		},

		// allocation

		destroy: function (alreadyLeft) {
			this.closeAllNotifications(true);
			if (!alreadyLeft) this.leave();
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
		constructor: function (data) {
			if (!this.events) this.events = {};
			if (!this.events['click button']) this.events['click button'] = 'dispatchClickButton';
			if (!this.events['submit form']) this.events['submit form'] = 'dispatchSubmit';
			if (data && data.sourceEl) {
				this.sourceEl = data.sourceEl = $(data.sourceEl);
			}
			if (data.type) this.type = data.type;
			if (data.position) this.position = data.position;
			if (data.buttons) this.buttons = data.buttons;
			if (data.submit) this.submit = data.submit;

			Backbone.View.apply(this, arguments);

			// if we have no source, we can't attach to anything
			if (this.type === 'normal' && !this.sourceEl) this.type = 'semimodal';

			if ((this.type === 'normal' || this.type === 'semimodal') && this.sourceEl) {
				// nonmodal popup: should be positioned near source element
				var $el = this.$el;
				var $measurer = $('<div style="position:relative;height:0;overflow:hidden"></div>').appendTo('body').append($el);
				$el.css('position', 'absolute');
				$el.css('margin', '0');
				$el.css('width', this.width - 22);

				var offset = this.sourceEl.offset();

				var room = $(window).height();
				var height = $el.outerHeight();
				var width = $el.outerWidth();
				var sourceHeight = this.sourceEl.outerHeight();

				if (this.position === 'right') {

					if (room > offset.top + height + 5 &&
						(offset.top < room * 2 / 3 || offset.top + 200 < room)) {
						$el.css('top', offset.top);
					} else {
						$el.css('bottom', Math.max(room - offset.top - sourceHeight, 0));
					}
					var offsetLeft = offset.left + this.sourceEl.outerWidth();
					if (offsetLeft + width > $(window).width()) {
						$el.css('right', 1);
					} else {
						$el.css('left', offsetLeft);
					}

				} else {

					if (room > offset.top + sourceHeight + height + 5 &&
						(offset.top + sourceHeight < room * 2 / 3 || offset.top + sourceHeight + 200 < room)) {
						$el.css('top', offset.top + sourceHeight);
					} else if (height + 5 <= offset.top) {
						$el.css('bottom', Math.max(room - offset.top, 0));
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
		initialize: function (data) {
			if (!this.type) this.type = 'semimodal';
			this.$el.html('<form><p style="white-space:pre-wrap;word-wrap:break-word">' + (data.htmlMessage || Tools.parseMessage(data.message)) + '</p><p class="buttonbar">' + (data.buttons || '<button name="close" class="autofocus"><strong>OK</strong></button>') + '</p></form>').css('max-width', data.maxWidth || 480);
		},

		dispatchClickButton: function (e) {
			var target = e.currentTarget;
			if (target.name) {
				app.dispatchingButton = target;
				app.dispatchingPopup = this;
				e.preventDefault();
				e.stopImmediatePropagation();
				this[target.name](target.value, target);
				delete app.dispatchingButton;
				delete app.dispatchingPopup;
			}
		},
		dispatchSubmit: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var dataArray = $(e.currentTarget).serializeArray();
			var data = {};
			for (var i = 0, len = dataArray.length; i < len; i++) {
				var name = dataArray[i].name, value = dataArray[i].value;
				if (data[name]) {
					if (!data[name].push) data[name] = [data[name]];
					data[name].push(value || '');
				} else {
					data[name] = (value || '');
				}
			}
			this.submit(data);
		},
		send: function (data) {
			app.send(data);
		},

		remove: function () {
			var $parent = this.$el.parent();
			Backbone.View.prototype.remove.apply(this, arguments);
			if ($parent.hasClass('ps-overlay')) $parent.remove();
		},

		close: function () {
			app.closePopup();
		}
	});

	var PromptPopup = this.PromptPopup = Popup.extend({
		initialize: function (data) {
			if (!data || !data.message || typeof data.callback !== "function") return;
			this.callback = data.callback;

			var buf = '<form>';
			buf += '<p><label class="label">' + data.message;
			buf += '<input class="textbox autofocus" type="text" name="data" value="' + Tools.escapeHTML(data.value || '') + '" /></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>' + data.button + '</strong></button> <button name="close">Cancel</button></p>';
			buf += '</form>';

			this.$el.html(buf);
		},
		submit: function (data) {
			this.close();
			this.callback(data.data);
		}
	});

	var UserPopup = this.UserPopup = Popup.extend({
		initialize: function (data) {
			data.userid = toId(data.name);
			var name = data.name;
			if (/[a-zA-Z0-9]/.test(name.charAt(0))) name = ' ' + name;
			this.data = data = _.extend(data, UserPopup.dataCache[data.userid]);
			data.name = name;
			app.on('response:userdetails', this.update, this);
			app.send('/cmd userdetails ' + data.userid);
			this.update();
		},
		events: {
			'click .ilink': 'clickLink',
			'click .trainersprite.yours': 'avatars'
		},
		update: function (data) {
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
			var ownUserid = app.user.get('userid');

			var buf = '<div class="userdetails">';
			if (avatar) buf += '<img class="trainersprite' + (userid === ownUserid ? ' yours' : '') + '" src="' + Tools.resolveAvatar(avatar) + '" />';
			buf += '<a class="name" href="//pokemonshowdown.com/users/' + userid + '" target="_blank">' + Tools.escapeHTML(name) + '</a><br />';
			buf += '<small>' + (group || '&nbsp;') + '</small>';
			if (data.rooms) {
				var battlebuf = '';
				var chatbuf = '';
				for (var i in data.rooms) {
					if (i === 'global') continue;
					var roomid = toRoomid(i);
					if (roomid.substr(0, 7) === 'battle-') {
						var p1 = data.rooms[i].p1.substr(1);
						var p2 = data.rooms[i].p2.substr(1);
						if (!battlebuf) battlebuf = '<br /><em>Battles:</em> ';
						else battlebuf += ', ';
						var ownBattle = (ownUserid === toUserid(p1) || ownUserid === toUserid(p2));
						battlebuf += '<span title="' + (Tools.escapeHTML(p1) || '?') + ' v. ' + (Tools.escapeHTML(p2) || '?') + '"><a href="' + app.root + roomid + '" class="ilink' + ((ownBattle || app.rooms[i]) ? ' yours' : '') + '">' + roomid.substr(7) + '</a></span>';
					} else {
						if (!chatbuf) chatbuf = '<br /><em>Chatrooms:</em> ';
						else chatbuf += ', ';
						chatbuf += '<a href="' + app.root + roomid + '" class="ilink' + (app.rooms[i] ? ' yours' : '') + '">' + roomid + '</a>';
					}
				}
				buf += '<small class="rooms">' + battlebuf + chatbuf + '</small>';
			} else if (data.rooms === false) {
				buf += '<strong class="offline">OFFLINE</strong>';
			}
			buf += '</div>';

			buf += '<p class="buttonbar">';
			if (userid === app.user.get('userid') || !app.user.get('named')) {
				buf += '<button disabled>Challenge</button> <button disabled>Chat</button>';
				if (userid === app.user.get('userid')) {
					buf += '</p><hr /><p class="buttonbar" style="text-align: right">';
					buf += '<button name="login"><i class="fa fa-pencil"></i> Change name</button> <button name="logout"><i class="fa fa-power-off"></i> Log out</button>';
				}
			} else {
				buf += '<button name="challenge">Challenge</button> <button name="pm">Chat</button> <button name="userOptions">\u2026</button>';
			}
			buf += '</p>';

			this.$el.html(buf);
		},
		clickLink: function (e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			e.stopPropagation();
			this.close();
			var roomid = $(e.currentTarget).attr('href').substr(app.root.length);
			app.tryJoinRoom(roomid);
		},
		avatars: function () {
			app.addPopup(AvatarsPopup);
		},
		challenge: function () {
			app.rooms[''].requestNotifications();
			this.close();
			app.focusRoom('');
			app.rooms[''].challenge(this.data.name);
		},
		pm: function () {
			app.rooms[''].requestNotifications();
			this.close();
			app.focusRoom('');
			app.rooms[''].focusPM(this.data.name);
		},
		login: function () {
			app.addPopup(LoginPopup);
		},
		logout: function () {
			app.user.logout();
			this.close();
		},
		userOptions: function () {
			app.addPopup(UserOptionsPopup, {name: this.data.name, userid: this.data.userid});
		}
	}, {
		dataCache: {}
	});

	var UserOptionsPopup = this.UserOptions = Popup.extend({
		initialize: function (data) {
			this.name = data.name.substr(1);
			this.userid = data.userid;
			this.update();
		},
		update: function () {
			this.$el.html('<p><button name="toggleIgnoreUser">' + (app.ignore[this.userid] ? 'Unignore' : 'Ignore') + '</button></p>');
		},
		toggleIgnoreUser: function () {
			var buf = "User '" + this.name + "'";
			if (app.ignore[this.userid]) {
				delete app.ignore[this.userid];
				buf += " no longer ignored.";
			} else {
				app.ignore[this.userid] = 1;
				buf += " ignored. (Moderator messages will not be ignored.)";
			}
			var $pm = $('.pm-window-' + this.userid);
			if ($pm.length && $pm.css('display') !== 'none') {
				$pm.find('.inner').append('<div class="chat">' + Tools.escapeHTML(buf) + '</div>');
			} else {
				var room = (app.curRoom && app.curRoom.add ? app.curRoom : app.curSideRoom);
				if (!room || !room.add) {
					app.addPopupMessage(buf);
					return this.update();
				}
				room.add(buf);
			}
			app.dismissPopups();
		}
	});

	var ReconnectPopup = this.ReconnectPopup = Popup.extend({
		type: 'modal',
		initialize: function (data) {
			app.reconnectPending = false;
			var buf = '<form>';

			if (data.cantconnect) {
				buf += '<p class="error">Couldn\'t connect to server!</p>';
				buf += '<p class="buttonbar"><button type="submit">Retry</button> <button name="close">Work offline</button></p>';
			} else if (data.message && data.message !== true) {
				buf += '<p>' + data.message + '</p>';
				buf += '<p class="buttonbar"><button type="submit" class="autofocus"><strong>Reconnect</strong></button> <button name="close">Work offline</button></p>';
			} else {
				buf += '<p>You have been disconnected &ndash; possibly because the server was restarted.</p>';
				buf += '<p class="buttonbar"><button type="submit" class="autofocus"><strong>Reconnect</strong></button> <button name="close">Work offline</button></p>';
			}

			buf += '</form>';
			this.$el.html(buf);
		},
		submit: function (data) {
			document.location.reload();
		}
	});

	var LoginPopup = this.LoginPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
			var buf = '<form>';

			if (data.error) {
				buf += '<p class="error">' + Tools.escapeHTML(data.error) + '</p>';
				if (data.error.indexOf('inappropriate') >= 0) {
					buf += '<p>Keep in mind these rules:</p>';
					buf += '<ol>';
					buf += '<li>Usernames may not impersonate a recognized user (a user with %, @, &, or ~ next to their name).</li>';
					buf += '<li>Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).</li>';
					buf += '<li>Usernames may not directly reference sexual activity, or be excessively disgusting.</li>';
					buf += '</ol>';
				}
			} else if (data.reason) {
				buf += '<p>' + Tools.parseMessage(data.reason) + '</p>';
			}

			var name = (data.name || '');
			if (!name && app.user.get('named')) name = app.user.get('name');
			buf += '<p><label class="label">Username: <small class="preview" style="' + hashColor(toUserid(name)) + '">(color)</small><input class="textbox autofocus" type="text" name="username" value="' + Tools.escapeHTML(name) + '"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Choose name</strong></button> <button name="close">Cancel</button></p>';

			buf += '</form>';
			this.$el.html(buf);
		},
		events: {
			'input .textbox': 'updateColor'
		},
		updateColor: function (e) {
			var name = e.currentTarget.value;
			var preview = this.$('.preview');
			var css = hashColor(toUserid(name)).slice(6, -1);
			preview.css('color', css);
		},
		submit: function (data) {
			this.close();
			if (!$.trim(data.username)) return;
			app.user.rename(data.username);
		}
	});

	var ChangePasswordPopup = this.ChangePasswordPopup = Popup.extend({
		type: 'semimodal',
		initialize: function (data) {
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
		submit: function (data) {
			$.post(app.user.getActionPHP(), {
				act: 'changepassword',
				oldpassword: data.oldpassword,
				password: data.password,
				cpassword: data.cpassword
			}, Tools.safeJSON(function (data) {
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
		initialize: function (data) {
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
		submit: function (data) {
			var name = data.name;
			var captcha = data.captcha;
			$.post(app.user.getActionPHP(), {
				act: 'register',
				username: name,
				password: data.password,
				cpassword: data.cpassword,
				captcha: captcha,
				challstr: app.user.challstr
			}, Tools.safeJSON(function (data) {
				if (!data) data = {};
				var token = data.assertion;
				if (data.curuser && data.curuser.loggedin) {
					app.user.set('registered', data.curuser);
					var name = data.curuser.username;
					app.send('/trn ' + name + ',1,' + token);
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
		initialize: function (data) {
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
			buf += '<p><label class="label">Username: <strong>' + Tools.escapeHTML(data.username) + '<input type="hidden" name="username" value="' + Tools.escapeHTML(data.username) + '" /></strong></label></p>';
			buf += '<p><label class="label">Password: <input class="textbox autofocus" type="password" name="password"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Log in</strong></button> <button name="close">Cancel</button></p>';

			buf += '<p class="or">or</p>';
			buf += '<p class="buttonbar"><button name="login">Choose another name</button></p>';

			buf += '</form>';
			this.$el.html(buf);
		},
		login: function () {
			this.close();
			app.addPopup(LoginPopup);
		},
		submit: function (data) {
			this.close();
			app.user.passwordRename(data.username, data.password);
		}
	});

	var ProxyPopup = this.ProxyPopup = Popup.extend({
		type: 'modal',
		initialize: function (data) {
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
		submit: function (data) {
			this.close();
			this.callback(data.result);
		}
	});

	var SoundsPopup = this.SoundsPopup = Popup.extend({
		initialize: function (data) {
			var buf = '';
			var muted = !!Tools.prefs('mute');
			buf += '<p class="effect-volume"><label class="optlabel">Effect volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="slider" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />') + '</p>';
			buf += '<p class="music-volume"><label class="optlabel">Music volume:</label>' + (muted ? '<em>(muted)</em>' : '<input type="slider" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />') + '</p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="muted"' + (muted ? ' checked' : '') + ' /> Mute sounds</label></p>';
			this.$el.html(buf).css('min-width', 160);
		},
		events: {
			'change input[name=muted]': 'setMute'
		},
		domInitialize: function () {
			var self = this;
			this.$('.effect-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function (val) {
					self.setEffectVolume(val);
				}
			});
			this.$('.music-volume input').slider({
				from: 0,
				to: 100,
				step: 1,
				dimension: '%',
				skin: 'round_plastic',
				onstatechange: function (val) {
					self.setMusicVolume(val);
				}
			});
		},
		setMute: function (e) {
			var muted = !!e.currentTarget.checked;
			Tools.prefs('mute', muted);
			BattleSound.setMute(muted);

			if (!muted) {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><input type="slider" name="effectvolume" value="' + (Tools.prefs('effectvolume') || 50) + '" />');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><input type="slider" name="musicvolume" value="' + (Tools.prefs('musicvolume') || 50) + '" />');
				this.domInitialize();
			} else {
				this.$('.effect-volume').html('<label class="optlabel">Effect volume:</label><em>(muted)</em>');
				this.$('.music-volume').html('<label class="optlabel">Music volume:</label><em>(muted)</em>');
			}

			app.topbar.$('button[name=openSounds]').html('<i class="' + (muted ? 'fa fa-volume-off' : 'fa fa-volume-up') + '"></i>');
		},
		setEffectVolume: function (volume) {
			BattleSound.setEffectVolume(volume);
			Tools.prefs('effectvolume', volume);
		},
		setMusicVolume: function (volume) {
			BattleSound.setBgmVolume(volume);
			Tools.prefs('musicvolume', volume);
		}
	});

	var OptionsPopup = this.OptionsPopup = Popup.extend({
		initialize: function (data) {
			app.user.on('change', this.update, this);
			app.send('/cmd userdetails ' + app.user.get('userid'));
			this.update();
		},
		events: {
			'change input[name=noanim]': 'setNoanim',
			'change input[name=bwgfx]': 'setBwgfx',
			'change input[name=nopastgens]': 'setNopastgens',
			'change input[name=notournaments]': 'setNotournaments',
			'change input[name=inchatpm]': 'setInchatpm',
			'change input[name=temporarynotifications]': 'setTemporaryNotifications',
			'change select[name=bg]': 'setBg',
			'change select[name=timestamps-lobby]': 'setTimestampsLobby',
			'change select[name=timestamps-pms]': 'setTimestampsPMs',
			'change input[name=logchat]': 'setLogChat',
			'change input[name=selfhighlight]': 'setSelfHighlight',
			'click img': 'avatars'
		},
		update: function () {
			var name = app.user.get('name');
			var avatar = app.user.get('avatar');

			var buf = '';
			buf += '<p>' + (avatar ? '<img class="trainersprite" src="' + Tools.resolveAvatar(avatar) + '" width="40" height="40" style="vertical-align:middle;cursor:pointer" />' : '') + '<strong>' + Tools.escapeHTML(name) + '</strong></p>';
			buf += '<p><button name="avatars">Change avatar</button></p>';
			if (app.user.get('named')) {
				var registered = app.user.get('registered');
				if (registered && (registered.userid === app.user.get('userid'))) {
					buf += '<p><button name="changepassword">Password change</button></p>';
				} else {
					buf += '<p><button name="register">Register</button></p>';
				}
			}

			buf += '<hr />';
			buf += '<p><strong>Graphics</strong></p>';
			buf += '<p><label class="optlabel">Background: <button name="background">Change background</button></label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="noanim"' + (Tools.prefs('noanim') ? ' checked' : '') + ' /> Disable animations</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="bwgfx"' + (Tools.prefs('bwgfx') ? ' checked' : '') + ' /> Use BW sprites instead of XY models</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="nopastgens"' + (Tools.prefs('nopastgens') ? ' checked' : '') + ' /> Use modern sprites for past generations</label></p>';

			buf += '<hr />';
			buf += '<p><strong>Chat</strong></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="notournaments"' + (Tools.prefs('notournaments') ? ' checked' : '') + ' /> Ignore tournaments</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="inchatpm"' + (Tools.prefs('inchatpm') ? ' checked' : '') + ' /> Show PMs in chat rooms</label></p>';
			buf += '<p><label class="optlabel"><input type="checkbox" name="selfhighlight"' + (!Tools.prefs('noselfhighlight') ? ' checked' : '') + '> Highlight when your name is said in chat</label></p>';

			if (window.Notification) {
				buf += '<p><label class="optlabel"><input type="checkbox" name="temporarynotifications"' + (Tools.prefs('temporarynotifications') ? ' checked' : '') + ' /> Notifications disappear automatically</label></p>';
			}

			var timestamps = this.timestamps = (Tools.prefs('timestamps') || {});
			buf += '<p><label class="optlabel">Timestamps in chat rooms: <select name="timestamps-lobby"><option value="off">Off</option><option value="minutes"' + (timestamps.lobby === 'minutes' ? ' selected="selected"' : '') + '>[HH:MM]</option><option value="seconds"' + (timestamps.lobby === 'seconds' ? ' selected="selected"' : '') + '>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Timestamps in PMs: <select name="timestamps-pms"><option value="off">Off</option><option value="minutes"' + (timestamps.pms === 'minutes' ? ' selected="selected"' : '') + '>[HH:MM]</option><option value="seconds"' + (timestamps.pms === 'seconds' ? ' selected="selected"' : '') + '>[HH:MM:SS]</option></select></label></p>';
			buf += '<p><label class="optlabel">Chat preferences: <button name="formatting">Edit formatting</button></label></p>';

			if (window.nodewebkit) {
				buf += '<hr />';
				buf += '<p><strong>Desktop app</strong></p>';
				buf += '<p><label class="optlabel"><input type="checkbox" name="logchat"' + (Tools.prefs('logchat') ? ' checked' : '') + '> Log chat</label></p>';
				buf += '<p id="openLogFolderButton"' + (Storage.dir ? '' : ' style="display:none"') + '><button name="openLogFolder">Open log folder</button></p>';
			}

			buf += '<hr />';
			if (app.user.get('named')) {
				buf += '<p class="buttonbar" style="text-align:right"><button name="login"><i class="fa fa-pencil"></i> Change name</button> <button name="logout"><i class="fa fa-power-off"></i> Log out</button></p>';
			} else {
				buf += '<p class="buttonbar" style="text-align:right"><button name="login">Choose name</button></p>';
			}
			this.$el.html(buf).css('min-width', 160);
		},
		openLogFolder: function () {
			Storage.revealFolder();
		},
		setLogChat: function (e) {
			var logchat = !!e.currentTarget.checked;
			if (logchat) {
				Storage.startLoggingChat();
				$('#openLogFolderButton').show();
			} else {
				Storage.stopLoggingChat();
			}
			Tools.prefs('logchat', logchat);
		},
		setNoanim: function (e) {
			var noanim = !!e.currentTarget.checked;
			Tools.prefs('noanim', noanim);
			Tools.loadSpriteData(noanim || Tools.prefs('bwgfx') ? 'bw' : 'xy');
		},
		setBwgfx: function (e) {
			var bwgfx = !!e.currentTarget.checked;
			Tools.prefs('bwgfx', bwgfx);
			Tools.loadSpriteData(bwgfx || Tools.prefs('noanim') ? 'bw' : 'xy');
		},
		setNopastgens: function (e) {
			var nopastgens = !!e.currentTarget.checked;
			Tools.prefs('nopastgens', nopastgens);
		},
		setNotournaments: function (e) {
			var notournaments = !!e.currentTarget.checked;
			Tools.prefs('notournaments', notournaments);
		},
		setSelfHighlight: function (e) {
			var noselfhighlight = !e.currentTarget.checked;
			Tools.prefs('noselfhighlight', noselfhighlight);
		},
		setInchatpm: function (e) {
			var inchatpm = !!e.currentTarget.checked;
			Tools.prefs('inchatpm', inchatpm);
		},
		setTemporaryNotifications: function (e) {
			var temporarynotifications = !!e.currentTarget.checked;
			Tools.prefs('temporarynotifications', temporarynotifications);
		},
		background: function (e) {
			app.addPopup(CustomBackgroundPopup);
		},
		setTimestampsLobby: function (e) {
			this.timestamps.lobby = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		setTimestampsPMs: function (e) {
			this.timestamps.pms = e.currentTarget.value;
			Tools.prefs('timestamps', this.timestamps);
		},
		avatars: function () {
			app.addPopup(AvatarsPopup);
		},
		formatting: function () {
			app.addPopup(FormattingPopup);
		},
		login: function () {
			app.addPopup(LoginPopup);
		},
		register: function () {
			app.addPopup(RegisterPopup);
		},
		changepassword: function () {
			app.addPopup(ChangePasswordPopup);
		},
		logout: function () {
			app.user.logout();
			this.close();
		}
	});

	var FormattingPopup = this.FormattingPopup = Popup.extend({
		events: {
			'change input': 'setOption'
		},
		initialize: function () {
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
		setOption: function (e) {
			var name = $(e.currentTarget).prop('name');
			this.chatformatting['hide' + name] = !!e.currentTarget.checked;
			Tools.prefs('chatformatting', this.chatformatting);
		}
	});

	var AvatarsPopup = this.AvatarsPopup = Popup.extend({
		type: 'semimodal',
		initialize: function () {
			var cur = +app.user.get('avatar');
			var buf = '';
			buf += '<p>Choose an avatar or <button name="close">Cancel</button></p>';

			buf += '<div class="avatarlist">';
			for (var i = 1; i <= 293; i++) {
				var offset = '-' + (((i - 1) % 16) * 80) + 'px -' + (Math.floor((i - 1) / 16) * 80) + 'px';
				buf += '<button name="setAvatar" value="' + i + '" style="background-position:' + offset + '"' + (i === cur ? ' class="cur"' : '') + '></button>';
			}
			buf += '</div><div style="clear:left"></div>';

			buf += '<p><button name="close">Cancel</button></p>';
			this.$el.html(buf).css('max-width', 780);
		},
		setAvatar: function (i) {
			app.send('/avatar ' + i);
			app.send('/cmd userdetails ' + app.user.get('userid'));
			Tools.prefs('avatar', i);
			this.close();
		}
	});

	var ReplayUploadedPopup = this.ReplayUploadedPopup = Popup.extend({
		type: 'semimodal',
		events: {
			'click a': 'clickClose'
		},
		initialize: function (data) {
			var buf = '';
			buf = '<p>Your replay has been uploaded! It\'s available at:</p>';
			buf += '<p><a href="http://replay.pokemonshowdown.com/' + data.id + '" target="_blank">http://replay.pokemonshowdown.com/' + data.id + '</a></p>';
			buf += '<p><button type="submit" class="autofocus"><strong>Open</strong></button> <button name="close">Cancel</button></p>';
			this.$el.html(buf).css('max-width', 620);
		},
		clickClose: function () {
			this.close();
		},
		submit: function (i) {
			app.openInNewWindow('http://replay.pokemonshowdown.com/' + this.id);
			this.close();
		}
	});

	var RulesPopup = this.RulesPopup = Popup.extend({
		type: 'modal',
		initialize: function (data) {
			var warning = ('warning' in data);
			var buf = '';
			if (warning) {
				buf += '<p><strong style="color:red">' + (Tools.escapeHTML(data.warning) || 'You have been warned for breaking the rules.') + '</strong></p>';
			}
			buf += '<h2>Pok&eacute;mon Showdown Rules</h2>';
			buf += '<b>Global</b><br /><br /><b>1.</b> Be nice to people. Respect people. Don\'t be rude to people.<br /><br /><b>2.</b> PS is based in the US. Follow US laws. Don\'t distribute pirated material, and don\'t slander others. PS is available to users younger than 18, so porn is strictly forbidden.<br /><br /><b>3.</b>&nbsp;No cheating. Don\'t exploit bugs to gain an unfair advantage. Don\'t game the system (by intentionally losing against yourself or a friend in a ladder match, by timerstalling, etc).<br /><b></b><br /><b>4.</b>&nbsp;English only.<br /><br /><b>5.</b> The First Amendment does not apply to PS, since PS is not a government organization.<br /><br /><b>6.</b> Moderators have discretion to punish any behaviour they deem inappropriate, whether or not it\'s on this list. If you disagree with a moderator ruling, appeal to a leader (a user with &amp; next to their name) or Discipline Appeals.<br /><br />';
			buf += '<b>Chat</b><br /><br /><b>1.</b> Do not spam, flame, or troll. This includes advertising, asking questions with one-word answers in the lobby, and flooding the chat such as by copy/pasting lots of text in the lobby.<br /><br /><b>2.</b> Don\'t call unnecessary attention to yourself. Don\'t be obnoxious. ALL CAPS, <i><b>formatting</b></i>, and -&gt; ASCII art &lt;- are acceptable to emphasize things, but should be used sparingly, not all the time.<br /><br /><b>3.</b> No minimodding: don\'t mod if it\'s not your job. Don\'t tell people they\'ll be muted, don\'t ask for people to be muted, and don\'t talk about whether or not people should be muted ("inb4 mute", etc). This applies to bans and other punishments, too.<br /><br /><b>4.</b> We reserve the right to tell you to stop discussing moderator decisions if you become unreasonable or belligerent.<br /><br />(Note: Chat rules don\'t apply to battle rooms, but only if both players in the battle are okay with it.)<br /><br />';
			if (!warning) {
				buf += '<b>Usernames</b><br /><br />Your username can be chosen and changed at any time. Keep in mind:<br /><br /><b>1.</b> Usernames may not impersonate a recognized user (a user with %, @, &amp;, or ~ next to their name).<br /><br /><b>2.</b> Usernames may not be derogatory or insulting in nature, to an individual or group (insulting yourself is okay as long as it\'s not too serious).<br /><br /><b>3.</b> Usernames may not directly reference sexual activity, or be excessively disgusting.<br /><br />This policy is less restrictive than that of many places, so you might see some "borderline" nicknames that might not be accepted elsewhere. You might consider it unfair that they are allowed to keep their nickname. The fact remains that their nickname follows the above rules, and if you were asked to choose a new name, yours does not.';
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
		rulesTimeout: function () {
			this.$('button')[0].disabled = false;
			this.$('.overlay-warn').remove();
		}
	});

	var TabListPopup = this.TabListPopup = Popup.extend({
		type: 'semimodal',
		renderRooms: function (rooms) {
			var buf = '';
			for (var i = 0; i < rooms.length; i++) buf += app.topbar.renderRoomTab(rooms[i]);
			return buf;
		},
		initialize: function () {
			var curId = (app.curRoom ? app.curRoom.id : '');
			var curSideId = (app.curSideRoom ? app.curSideRoom.id : '');

			var buf = '<ul>' + this.renderRooms([app.rooms[''], app.rooms['teambuilder'], app.rooms['ladder']]) + '</ul>';
			if (app.roomList.length) buf += this.renderRooms(app.roomList);
			var sideBuf = this.renderRooms(app.sideRoomList);
			sideBuf += '<li><a class="button' + (curId === 'rooms' || curSideId === 'rooms' ? ' cur' : '') + '" href="' + app.root + 'rooms"><i class="fa fa-plus"></i> <span>&nbsp;</span></a></li>';
			if (sideBuf) {
				buf += '<ul>' + sideBuf + '</ul>';
			}
			this.$el.addClass('tablist').html(buf);
		},
		events: {
			'click a': 'click'
		},
		click: function (e) {
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

	var CustomBackgroundPopup = this.CustomBackgroundPopup = Popup.extend({
		events: {
			'change input[name=bgfile]': 'setBgFile'
		},
		initialize: function () {
			var buf = '';
			var cur = Storage.bg.id;
			buf += '<p><strong>Default</strong></p>';
			buf += '<div class="bglist">';

			buf += '<button name="setBg" value=""' + (!cur ? ' class="cur"' : '') + '><strong style="background:#888888;color:white;padding:16px 18px;display:block;font-size:12pt">' + (location.host === 'play.pokemonshowdown.com' ? 'Random' : 'Default') + '</strong></button>';

			buf += '</div><div style="clear:left"></div>';
			buf += '<p><strong>Official</strong></p>';
			buf += '<div class="bglist">';
			var bgs = ['charizards', 'horizon', 'waterfall', 'ocean', 'shaymin'];

			buf += '<button name="setBg" value="charizards"' + (cur === 'charizards' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 0) + 'px"></span>Charizards</button>';
			buf += '<button name="setBg" value="horizon"' + (cur === 'horizon' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 1) + 'px"></span>Horizon</button>';
			buf += '<button name="setBg" value="waterfall"' + (cur === 'waterfall' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 2) + 'px"></span>Waterfall</button>';
			buf += '<button name="setBg" value="ocean"' + (cur === 'ocean' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 3) + 'px"></span>Ocean</button>';
			buf += '<button name="setBg" value="shaymin"' + (cur === 'shaymin' ? ' class="cur"' : '') + '><span class="bg" style="background-position:0 -' + (90 * 4) + 'px"></span>Shaymin</button>';
			buf += '<button name="setBg" value="solidblue"' + (cur === 'solidblue' ? ' class="cur"' : '') + '><span class="bg" style="background: #344b6c"></span>Solid blue</button>';

			buf += '</div><div style="clear:left"></div>';
			buf += '<p><strong>Custom</strong></p>';
			buf += '<p>Drag and drop an image to PS (the background settings don\'t need to be open), or upload:</p>';
			buf += '<p><input type="file" accept="image/*" name="bgfile"></p>';
			buf += '<p class="bgstatus"></p>';

			buf += '<p><button name="close"><strong>Done</strong></button></p>';
			this.$el.css('max-width', 448).html(buf);
			this.$el.html(buf);
		},
		setBg: function (bgid) {
			var bgUrl = (bgid === 'solidblue' ? '#344b6c' : Tools.resourcePrefix + 'fx/client-bg-' + bgid + '.jpg');
			Storage.bg.set(bgUrl, bgid);
			this.$('.cur').removeClass('cur');
			this.$('button[value="' + bgid + '"]').addClass('cur');
		},
		setBgFile: function (e) {
			$('.bgstatus').text('Changing background image...');
			var file = e.currentTarget.files[0];
			CustomBackgroundPopup.readFile(file, this);
		}
	});
	CustomBackgroundPopup.readFile = function (file, popup) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var noSave = false;
			if (String(e.target.result).length > 4200000) {
				if (popup) {
					$('.bgstatus').html('<strong style="background:red;color:white;padding:1px 4px;border-radius:4px;display:block">Image is too large and can\'t be saved. It should be under 3.5MB or so.</strong>');
				} else {
					app.addPopupMessage("Image is too large and can't be saved. It should be under 3.5MB or so.");
				}
				noSave = true;
			} else if (popup) {
				$('.bgstatus').html('Saved');
				popup.$('.cur').removeClass('cur');
			}
			Storage.bg.set(e.target.result, 'custom', noSave);
		};
		reader.readAsDataURL(file);
	};

}).call(this, jQuery);
