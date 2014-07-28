(function($) {

	var ConsoleRoom = this.ConsoleRoom = Room.extend({
		type: 'chat',
		title: '',
		constructor: function() {
			if (!this.events) this.events = {};
			if (!this.events['click .ilink']) this.events['click .ilink'] = 'clickLink';
			if (!this.events['click .username']) this.events['click .username'] = 'clickUsername';
			if (!this.events['submit form']) this.events['submit form'] = 'submit';
			if (!this.events['keydown textarea']) this.events['keydown textarea'] = 'keyPress';
			if (!this.events['click .message-pm i']) this.events['click .message-pm i'] = 'openPM';

			this.initializeTabComplete();
			this.initializeChatHistory();

			// this MUST set up this.$chatAdd
			Room.apply(this, arguments);

			app.user.on('change', this.updateUser, this);
			this.updateUser();
		},
		updateUser: function() {
			var name = app.user.get('name');
			var userid = app.user.get('userid');
			if (this.expired) {
				this.$chatAdd.html('This room is expired');
				this.$chatbox = null;
			} else if (!name) {
				this.$chatAdd.html('Connecting...');
				this.$chatbox = null;
			} else if (!app.user.get('named')) {
				this.$chatAdd.html('<form><button name="login">Join chat</button></form>');
				this.$chatbox = null;
			} else {
				this.$chatAdd.html('<form class="chatbox"><label style="' + hashColor(userid) + '">' + Tools.escapeHTML(name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off"></textarea></form>');
				this.$chatbox = this.$chatAdd.find('textarea');
				this.$chatbox.autoResize({
					animate: false,
					extraSpace: 0
				});
				if (this === app.curSideRoom || this === app.curRoom) {
					this.$chatbox.focus();
				}
			}
		},

		focus: function() {
			if (this.$chatbox) {
				this.$chatbox.focus();
			} else {
				this.$('button[name=login]').focus();
			}
		},

		login: function() {
			app.addPopup(LoginPopup);
		},
		submit: function(e) {
			e.preventDefault();
			e.stopPropagation();
			var text;
			if ((text = this.$chatbox.val())) {
				if (!$.trim(text)) {
					this.$chatbox.val('');
					return;
				}
				this.tabComplete.reset();
				this.chatHistory.push(text);
				text = this.parseCommand(text);
				if (text) {
					this.send(text);
				}
				this.$chatbox.val('');
			}
		},
		keyPress: function(e) {
			var cmdKey = (((e.cmdKey || e.metaKey)?1:0) + (e.ctrlKey?1:0) + (e.altKey?1:0) === 1);
			var textbox = e.currentTarget;
			if (e.keyCode === 13 && !e.shiftKey) { // Enter key
				this.submit(e);
			} else if (e.keyCode === 73 && cmdKey && !e.shiftKey) { // Ctrl+I key
				if (!textbox.setSelectionRange) return;
				var value = textbox.value;
				var start = textbox.selectionStart;
				var end = textbox.selectionEnd;

				// make sure start and end aren't midway through the syntax
				if (value.charAt(start) === '_' && value.charAt(start-1) === '_' &&
						value.charAt(start-2) !== '_') {
					start++;
				}
				if (value.charAt(end) === '_' && value.charAt(end-1) === '_' &&
						value.charAt(end-2) !== '_') {
					end--;
				}

				// wrap in __
				value = value.substr(0,start)+'__'+value.substr(start,end-start)+'__'+value.substr(end);
				start += 2, end += 2;

				// prevent nesting
				if (value.substr(start-4, 4) === '____') {
					value = value.substr(0, start-4) + value.substr(start);
					start -= 4, end -= 4;
				} else if (start !== end && value.substr(start-2, 4) === '____') {
					value = value.substr(0, start-2) + value.substr(start+2);
					start -= 2, end -= 4;
				}
				if (value.substr(end, 4) === '____') {
					value = value.substr(0, end) + value.substr(end+4);
				} else if (start !== end && value.substr(end-2, 4) === '____') {
					value = value.substr(0, end-2) + value.substr(end+2);
					end -= 2;
				}

				textbox.value = value;
				textbox.setSelectionRange(start, end);
			} else if (e.keyCode === 66 && cmdKey && !e.shiftKey) { // Ctrl+B key
				if (!textbox.setSelectionRange) return;
				var value = textbox.value;
				var start = textbox.selectionStart;
				var end = textbox.selectionEnd;

				// make sure start and end aren't midway through the syntax
				if (value.charAt(start) === '*' && value.charAt(start-1) === '*' &&
						value.charAt(start-2) !== '*') {
					start++;
				}
				if (value.charAt(end) === '*' && value.charAt(end-1) === '*' &&
						value.charAt(end-2) !== '*') {
					end--;
				}

				// wrap in **
				value = value.substr(0,start)+'**'+value.substr(start,end-start)+'**'+value.substr(end);
				start += 2, end += 2;

				// prevent nesting
				if (value.substr(start-4, 4) === '****') {
					value = value.substr(0, start-4) + value.substr(start);
					start -= 4, end -= 4;
				} else if (start !== end && value.substr(start-2, 4) === '****') {
					value = value.substr(0, start-2) + value.substr(start+2);
					start -= 2, end -= 4;
				}
				if (value.substr(end, 4) === '****') {
					value = value.substr(0, end) + value.substr(end+4);
				} else if (start !== end && value.substr(end-2, 4) === '****') {
					value = value.substr(0, end-2) + value.substr(end+2);
					end -= 2;
				}

				textbox.value = value;
				textbox.setSelectionRange(start, end);
			} else if (e.keyCode === 33) { // Pg Up key
				this.$chatFrame.scrollTop(this.$chatFrame.scrollTop() - this.$chatFrame.height() + 60);
			} else if (e.keyCode === 34) { // Pg Dn key
				this.$chatFrame.scrollTop(this.$chatFrame.scrollTop() + this.$chatFrame.height() - 60);
			} else if (e.keyCode === 9 && !e.shiftKey && !e.ctrlKey) { // Tab key
				if (this.handleTabComplete(this.$chatbox)) {
					e.preventDefault();
					e.stopPropagation();
				}
			} else if (e.keyCode === 38 && !e.shiftKey && !e.altKey) { // Up key
				if (this.chatHistoryUp(this.$chatbox, e)) {
					e.preventDefault();
					e.stopPropagation();
				}
			} else if (e.keyCode === 40 && !e.shiftKey && !e.altKey) { // Down key
				if (this.chatHistoryDown(this.$chatbox, e)) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
		},
		clickUsername: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var position;
			if (e.currentTarget.className === 'userbutton username') {
				position = 'right';
			}
			var name = $(e.currentTarget).data('name');
			app.addPopup(UserPopup, {name: name, sourceEl: e.currentTarget, position: position});
		},
		clickLink: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;
			e.preventDefault();
			e.stopPropagation();
			var roomid = $(e.currentTarget).attr('href').substr(app.root.length);
			app.tryJoinRoom(roomid);
		},
		openPM: function(e) {
			e.preventDefault();
			e.stopPropagation();
			app.focusRoom('');
			app.rooms[''].focusPM($(e.currentTarget).data('name'));
		},
		clear: function() {
			if (this.$chat) this.$chat.html('');
		},

		// support for buttons that can be sent by the server:

		joinRoom: function(room) {
			app.joinRoom(room);
		},
		avatars: function() {
			app.addPopup(AvatarsPopup);
		},
		openSounds: function() {
			app.addPopup(SoundsPopup, {type:'semimodal'});
		},
		openOptions: function() {
			app.addPopup(OptionsPopup, {type:'semimodal'});
		},

		// highlight

		getHighlight: function(message) {
			var highlights = Tools.prefs('highlights') || [];
			if (!app.highlightRegExp) {
				try {
					app.highlightRegExp = new RegExp('\\b('+highlights.join('|')+')\\b', 'i');
				} catch (e) {
					// If the expression above is not a regexp, we'll get here.
					// Don't throw an exception because that would prevent the chat
					// message from showing up, or, when the lobby is initialising,
					// it will prevent the initialisation from completing.
					return false;
				}
			}
			if (!Tools.prefs('noselfhighlight') && app.user.nameRegExp) {
				if (app.user.nameRegExp.test(message)) return true;
			}
			return ((highlights.length > 0) && app.highlightRegExp.test(message));
		},

		// chat history

		chatHistory: null,
		initializeChatHistory: function() {
			var chatHistory = {
				lines: [],
				index: 0,
				push: function(line) {
					if (chatHistory.lines.length > 100) {
						chatHistory.lines.splice(0, 20);
					}
					chatHistory.lines.push(line);
					chatHistory.index = chatHistory.lines.length;
				}
			};
			this.chatHistory = chatHistory;
		},
		chatHistoryUp: function($textbox, e) {
			var idx = +$textbox.prop('selectionStart');
			var line = $textbox.val();
			if (e && !e.ctrlKey && idx !== 0 && idx !== line.length) return false;
			if (this.chatHistory.index > 0) {
				if (this.chatHistory.index === this.chatHistory.lines.length) {
					if (line !== '') {
						this.chatHistory.push(line);
						--this.chatHistory.index;
					}
				} else {
					this.chatHistory.lines[this.chatHistory.index] = line;
				}
				$textbox.val(this.chatHistory.lines[--this.chatHistory.index]);
				return true;
			}
			return false;
		},
		chatHistoryDown: function($textbox, e) {
			var idx = +$textbox.prop('selectionStart');
			var line = $textbox.val();
			if (e && !e.ctrlKey && idx !== 0 && idx !== line.length) return false;
			if (this.chatHistory.index === this.chatHistory.lines.length) {
				if (line !== '') {
					this.chatHistory.push(line);
					$textbox.val('');
				}
			} else if (this.chatHistory.index === this.chatHistory.lines.length - 1) {
				this.chatHistory.lines[this.chatHistory.index] = $textbox.val();
				$textbox.val('');
				++this.chatHistory.index;
			} else {
				this.chatHistory.lines[this.chatHistory.index] = $textbox.val();
				line = this.chatHistory.lines[++this.chatHistory.index];
				$textbox.val(line);
			}
			return true;
		},

		// tab completion

		initializeTabComplete: function() {
			this.tabComplete = {
				candidates: null,
				index: 0,
				prefix: null,
				cursor: -1,
				reset: function() {
					this.cursor = -1;
				}
			};
			this.userActivity = [];
		},
		markUserActive: function(userid) {
			var idx = this.userActivity.indexOf(userid);
			if (idx !== -1) {
				this.userActivity.splice(idx, 1);
			}
			this.userActivity.push(userid);
			if (this.userActivity.length > 100) {
				// Prune the list.
				this.userActivity.splice(0, 20);
			}
		},
		tabComplete: null,
		userActivity: null,
		handleTabComplete: function($textbox) {
			// Don't tab complete at the start of the text box.
			var idx = $textbox.prop('selectionStart');
			if (idx === 0) return false;

			var users = this.users || (app.rooms['lobby']?app.rooms['lobby'].users:{});

			var text = $textbox.val();

			if (idx === this.tabComplete.cursor) {
				// The user is cycling through the candidate names.
				if (++this.tabComplete.index >= this.tabComplete.candidates.length) {
					this.tabComplete.index = 0;
				}
			} else {
				// This is a new tab completion.

				// There needs to be non-whitespace to the left of the cursor.
				var m = /^(.*?)([^ ]*)$/.exec(text.substr(0, idx));
				if (!m) return true;

				this.tabComplete.prefix = m[1];
				var idprefix = toId(m[2]);
				var candidates = [];

				for (var i in users) {
					if (i.substr(0, idprefix.length) === idprefix) {
						candidates.push(i);
					}
				}

				// Sort by most recent to speak in the chat, or, in the case of a tie,
				// in alphabetical order.
				var self = this;
				candidates.sort(function(a, b) {
					var aidx = self.userActivity.indexOf(a);
					var bidx = self.userActivity.indexOf(b);
					if (aidx !== -1) {
						if (bidx !== -1) {
							return bidx - aidx;
						}
						return -1; // a comes first
					} else if (bidx != -1) {
						return 1;  // b comes first
					}
					return (a < b) ? -1 : 1;  // alphabetical order
				});
				this.tabComplete.candidates = candidates;
				this.tabComplete.index = 0;
			}

			// Substitute in the tab-completed name.
			var substituteUserId = this.tabComplete.candidates[this.tabComplete.index];
			if (!users[substituteUserId]) return true;
			var name = users[substituteUserId].substr(1);
			$textbox.val(this.tabComplete.prefix + name + text.substr(idx));
			var pos = this.tabComplete.prefix.length + name.length;
			$textbox[0].setSelectionRange(pos, pos);
			this.tabComplete.cursor = pos;
			return true;
		},

		// command parsing

		parseCommand: function(text) {
			var cmd = '';
			var target = '';
			if (text.substr(0,2) !== '//' && text.substr(0,1) === '/') {
				var spaceIndex = text.indexOf(' ');
				if (spaceIndex > 0) {
					cmd = text.substr(1, spaceIndex-1);
					target = text.substr(spaceIndex+1);
				} else {
					cmd = text.substr(1);
					target = '';
				}
			}

			switch (cmd.toLowerCase()) {
			case 'challenge':
				var targets = target.split(',').map($.trim);

				var self = this;
				var challenge = function(targets) {
					target = toId(targets[0]);
					self.challengeData = { userid: target, format: targets[1] || '', team: targets[2] || '' };
					app.on('response:userdetails', self.challengeUserdetails, self);
					app.send('/cmd userdetails '+target);
				};

				if (!targets[0]) {
					app.addPopupPrompt("Who would you like to challenge?", "Challenge user", function(target) {
						if (!target) return;
						challenge([target]);
					});
					return false;
				}
				challenge(targets);
				return false;

			case 'user':
			case 'open':
				var open = function(target) {
					app.addPopup(UserPopup, {name: target});
				};
				if (!target) {
					app.addPopupPrompt("Whose user window would you like to open?", "Open", function(target) {
						if (!target) return;
						open(target);
					});
					return false;
				}
				open(target);
				return false;

			case 'ignore':
				if (app.ignore[toUserid(target)]) {
					this.add('User ' + target + ' is already on your ignore list. (Moderator messages will not be ignored.)');
				} else {
					app.ignore[toUserid(target)] = 1;
					this.add('User ' + target + ' ignored. (Moderator messages will not be ignored.)');
				}
				return false;

			case 'unignore':
				if (!app.ignore[toUserid(target)]) {
					this.add('User ' + target + ' isn\'t on your ignore list.');
				} else {
					delete app.ignore[toUserid(target)];
					this.add('User ' + target + ' no longer ignored.');
				}
				return false;

			case 'clear':
				if (this.clear) {
					this.clear();
				} else {
					this.add('||This room can\'t be cleared');
				}
				return false;

			case 'nick':
				if (target) {
					app.user.rename(target);
				} else {
					app.addPopup(LoginPopup);
				}
				return false;

			case 'showdebug':
				this.add('Debug battle messages: ON');
				Tools.prefs('showdebug', true);
				var debugStyle = $('#debugstyle').get(0);
				var onCSS = '.debug {display: block;}';
				if (!debugStyle) {
					$('head').append('<style id="debugstyle">'+onCSS+'</style>');
				} else {
					debugStyle.innerHTML = onCSS;
				}
				return false;
			case 'hidedebug':
				this.add('Debug battle messages: HIDDEN');
				Tools.prefs('showdebug', false);
				var debugStyle = $('#debugstyle').get(0);
				var offCSS = '.debug {display: none;}';
				if (!debugStyle) {
					$('head').append('<style id="debugstyle">'+offCSS+'</style>');
				} else {
					debugStyle.innerHTML = offCSS;
				}
				return false;

			case 'showjoins':
				this.add('Join/leave messages: ON');
				Tools.prefs('showjoins', true);
				return false;
			case 'hidejoins':
				this.add('Join/leave messages: HIDDEN');
				Tools.prefs('showjoins', false);
				return false;

			case 'showbattles':
				this.add('Battle messages: ON');
				Tools.prefs('showbattles', true);
				return false;
			case 'hidebattles':
				this.add('Battle messages: HIDDEN');
				Tools.prefs('showbattles', false);
				return false;

			case 'timestamps':
				var targets = target.split(',');
				if ((['all', 'lobby', 'pms'].indexOf(targets[0]) === -1)
						|| (targets.length < 2)
						|| (['off', 'minutes', 'seconds'].indexOf(
							targets[1] = targets[1].trim()) === -1)) {
					this.add('Error: Invalid /timestamps command');
					return '/help timestamps';	// show help
				}
				var timestamps = Tools.prefs('timestamps') || {};
				if (typeof timestamps === 'string') {
					// The previous has a timestamps preference from the previous
					// regime. We can't set properties of a string, so set it to
					// an empty object.
					timestamps = {};
				}
				switch (targets[0]) {
				case 'all':
					timestamps.lobby = targets[1];
					timestamps.pms = targets[1];
					break;
				case 'lobby':
					timestamps.lobby = targets[1];
					break;
				case 'pms':
					timestamps.pms = targets[1];
					break;
				}
				this.add('Timestamps preference set to: `' + targets[1] + '` for `' + targets[0] + '`.');
				Tools.prefs('timestamps', timestamps);
				return false;

			case 'highlight':
				var highlights = Tools.prefs('highlights') || [];
				if (target.indexOf(',') > -1) {
					var targets = target.split(',');
					// trim the targets to be safe
					for (var i=0, len=targets.length; i<len; i++) {
						targets[i] = targets[i].trim();
					}
					switch (targets[0]) {
					case 'add':
						for (var i=1, len=targets.length; i<len; i++) {
							highlights.push(targets[i].trim());
						}
						this.add("Now highlighting on: " + highlights.join(', '));
						// We update the regex
						app.highlightRegExp = new RegExp('\\b('+highlights.join('|')+')\\b', 'i');
						break;
					case 'delete':
						var newHls = [];
						for (var i=0, len=highlights.length; i<len; i++) {
							if (targets.indexOf(highlights[i]) === -1) {
								newHls.push(highlights[i]);
							}
						}
						highlights = newHls;
						this.add("Now highlighting on: " + highlights.join(', '));
						// We update the regex
						app.highlightRegExp = new RegExp('\\b('+highlights.join('|')+')\\b', 'i');
						break;
					}
					Tools.prefs('highlights', highlights);
				} else {
					if (target === 'delete') {
						Tools.prefs('highlights', false);
						this.add("All highlights cleared");
					} else if (target === 'show' || target === 'list') {
						// Shows a list of the current highlighting words
						if (highlights.length > 0) {
							var hls = highlights.join(', ');
							this.add('Current highlight list: ' + hls);
						} else {
							this.add('Your highlight list is empty.');
						}
					} else {
						// Wrong command
						this.add('Error: Invalid /highlight command.');
						return '/help highlight';	// show help
					}
				}
				return false;

			case 'rank':
			case 'ranking':
			case 'rating':
			case 'ladder':
				if (!target) target = app.user.get('userid');
				var self = this;
				$.get(app.user.getActionPHP() + '?act=ladderget&user='+encodeURIComponent(target), Tools.safeJSON(function(data) {
					try {
						var buffer = '<div class="ladder"><table>';
						buffer += '<tr><td colspan="8">User: <strong>'+target+'</strong></td></tr>';
						if (!data.length) {
							buffer += '<tr><td colspan="8"><em>This user has not played any ladder games yet.</em></td></tr>';
						} else {
							buffer += '<tr><th>Format</th><th>Elo</th><th>GXE</th><th>Glicko-1</th><th>COIL</th><th>W</th><th>L</th><th>T</th></tr>';
							for (var i=0; i<data.length; i++) {
								var row = data[i];
								buffer += '<tr><td>'+row.formatid+'</td><td><strong>'+Math.round(row.acre)+'</strong></td><td>'+Math.round(row.gxe,1)+'</td><td>';
								if (row.rprd > 100) {
									buffer += '<span><em>'+Math.round(row.rpr)+'<small> &#177; '+Math.round(row.rprd)+'</small></em> <small>(provisional)</small></span>';
								} else {
									buffer += '<em>'+Math.round(row.rpr)+'<small> &#177; '+Math.round(row.rprd)+'</small></em>';
								}
								var N=parseInt(row.w)+parseInt(row.l)+parseInt(row.t);
								if (row.formatid === 'oususpecttest') {
									buffer += '<td>'+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-17.0/N),0)+'</td>';
								} else if (row.formatid === 'uberssuspecttest') {
									buffer += '<td>'+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-29.0/N),0)+'</td>';
								} else if (row.formatid === 'rususpecttest') {
									buffer += '<td>'+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-20.0/N),0)+'</td>';
								} else if (row.formatid === 'lcsuspecttest') {
									buffer += '<td>'+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-43.0/N),0)+'</td>';
								} else if (row.formatid === 'smogondoublescurrent' || row.formatid === 'smogondoublessuspecttest') {
									buffer += '<td>'+Math.round(40.0*parseFloat(row.gxe)*Math.pow(2.0,-15.0/N),0)+'</td>';
								} else {
									buffer += '<td>--</td>';
								}
								buffer += '</td><td>'+row.w+'</td><td>'+row.l+'</td><td>'+row.t+'</td></tr>';
							}
						}
						buffer += '</table></div>';
						self.add('|raw|'+buffer);
					} catch(e) {}
				}), 'text');
				return false;

			case 'buttonban':
				var self = this;
				app.addPopupPrompt("Why do you wish to ban this user?", "Ban user", function(reason) {
					self.send('/ban ' + target + ', ' + (reason || ''));
				});
				return false;

			case 'buttonmute':
				var self = this;
				app.addPopupPrompt("Why do you wish to mute this user?", "Mute user", function(reason) {
					self.send('/mute ' + target + ', ' + (reason || ''));
				});
				return false;

			case 'buttonunmute':
				this.send('/unmute ' + target);
				return false;

			case 'buttonkick':
				var self = this;
				app.addPopupPrompt("Why do you wish to kick this user?", "Kick user", function(reason) {
					self.send('/kick ' + target + ', ' + (reason || ''));
				});
				return false;

			case 'join':
				var room = toId(target);
				if (app.rooms[room]) {
					app.focusRoom(room);
					return false;
				}
				return text; // Send the /join command through to the server.

			case 'avatar':
				var parts = target.split(',');
				var avatar = parseInt(parts[0], 10);
				if (avatar) {
					Tools.prefs('avatar', avatar);
				}
				return text; // Send the /avatar command through to the server.

			}

			return text;
		},

		challengeData: {},
		challengeUserdetails: function (data) {
			app.off('response:userdetails', this.challengeUserdetails);

			if (!data || this.challengeData.userid !== data.userid) return;

			if (data.rooms === false) {
				this.add('This player does not exist or is not online.');
				return;
			}

			app.focusRoom('');
			var name = data.name || this.challengeData.userid;
			if (/^[a-z0-9]/i.test(name)) name = ' ' + name;
			app.rooms[''].challenge(name, this.challengeData.format, this.challengeData.team);
		}
	});

	var ChatRoom = this.ChatRoom = ConsoleRoom.extend({
		minWidth: 320,
		minMainWidth: 580,
		maxWidth: 1024,
		isSideRoom: true,
		initialize: function() {
			var buf = '<ul class="userlist" style="display:none"></ul><div class="tournament-wrapper"></div><div class="chat-log"><div class="inner"></div></div></div><div class="chat-log-add">Connecting...</div>';
			this.$el.addClass('ps-room-light').html(buf);

			this.$chatAdd = this.$('.chat-log-add');
			this.$chatFrame = this.$('.chat-log');
			this.$chat = this.$('.inner');
			this.$chatbox = null;

			this.$tournamentWrapper = this.$('.tournament-wrapper');
			this.tournamentBox = null;

			this.users = {};
			this.userCount = {};

			this.$joinLeave = null;
			this.joinLeave = {
				'join': [],
				'leave': []
			};

			this.$userList = this.$('.userlist');
			this.userList = new UserList({
				el: this.$userList,
				room: this
			});
		},
		updateLayout: function() {
			if (this.$el.width() >= 570) {
				this.$userList.show();
				this.$chatFrame.addClass('hasuserlist');
				this.$chatAdd.addClass('hasuserlist');
				this.$tournamentWrapper.addClass('hasuserlist');
			} else {
				this.$userList.hide();
				this.$chatFrame.removeClass('hasuserlist');
				this.$chatAdd.removeClass('hasuserlist');
				this.$tournamentWrapper.removeClass('hasuserlist');
			}
			this.$chatFrame.scrollTop(this.$chat.height());
			if (this.tournamentBox) this.tournamentBox.updateLayout();
		},
		show: function() {
			Room.prototype.show.apply(this, arguments);
			this.updateLayout();
		},
		join: function() {
			app.send('/join '+this.id);
		},
		leave: function() {
			app.send('/leave '+this.id);
		},
		receive: function(data) {
			this.add(data);
		},
		add: function(log) {
			if (typeof log === 'string') log = log.split('\n');
			var autoscroll = false;
			if (this.$chatFrame.scrollTop() + 60 >= this.$chat.height() - this.$chatFrame.height()) {
				autoscroll = true;
			}
			var userlist = '';
			for (var i = 0; i < log.length; i++) {
				if (log[i].substr(0,7) === '|users|') {
					userlist = log[i];
				} else {
					this.addRow(log[i]);
				}
			}
			if (userlist) this.addRow(userlist);
			if (autoscroll) {
				this.$chatFrame.scrollTop(this.$chat.height());
			}
			var $children = this.$chat.children();
			if ($children.length > 900) {
				$children.slice(0,100).remove();
			}
		},
		addPM: function(user, message, pm) {
			var autoscroll = false;
			if (this.$chatFrame.scrollTop() + 60 >= this.$chat.height() - this.$chatFrame.height()) {
				autoscroll = true;
			}
			this.addChat(user, message, pm);
			if (autoscroll) {
				this.$chatFrame.scrollTop(this.$chat.height());
			}
		},
		addRow: function(line) {
			var name, name2, room, action, silent, oldid;
			if (line && typeof line === 'string') {
				if (line.substr(0,1) !== '|') line = '||'+line;
				var row = line.substr(1).split('|');
				switch (row[0]) {
				case 'init':
					// ignore (handled elsewhere)
					break;

				case 'title':
					this.title = row[1];
					app.topbar.updateTabbar();
					break;

				case 'c':
				case 'chat':
					if (/[a-zA-Z0-9]/.test(row[1].charAt(0))) row[1] = ' '+row[1];
					this.addChat(row[1], row.slice(2).join('|'));
					break;

				case 'tc':
					if (/[a-zA-Z0-9]/.test(row[2].charAt(0))) row[2] = ' '+row[2];
					this.addChat(row[2], row.slice(3).join('|'), false, row[1]);
					break;

				case 'b':
				case 'B':
					var id = row[1];
					name = row[2];
					name2 = row[3];
					silent = (row[0] === 'B');

					var matches = ChatRoom.parseBattleID(id);
					if (!matches) {
						return; // bogus room ID could be used to inject JavaScript
					}
					var format = Tools.escapeFormat(matches ? matches[1] : '');

					if (silent && !Tools.prefs('showbattles')) return;

					this.addJoinLeave();
					var battletype = 'Battle';
					if (format) {
						battletype = format + ' battle';
						if (format === 'Random Battle') battletype = 'Random Battle';
					}
					this.$chat.append('<div class="notice"><a href="' + app.root+id + '" class="ilink">' + battletype + ' started between <strong style="' + hashColor(toUserid(name)) + '">' + Tools.escapeHTML(name) + '</strong> and <strong style="' + hashColor(toUserid(name2)) + '">' + Tools.escapeHTML(name2) + '</strong>.</a></div>');
					break;

				case 'j':
				case 'join':
				case 'J':
					this.addJoinLeave('join', row[1], null, row[0] === 'J');
					break;

				case 'l':
				case 'leave':
				case 'L':
					this.addJoinLeave('leave', row[1], null, row[0] === 'L');
					break;

				case 'n':
				case 'name':
				case 'N':
					this.addJoinLeave('rename', row[1], row[2], true);
					break;

				case 'refresh':
					// refresh the page
					document.location.reload(true);
					break;

				case 'users':
					this.parseUserList(row[1]);
					break;

				case 'usercount':
					if (this.id === 'lobby') {
						this.userCount.globalUsers = parseInt(row[1], 10);
						this.userList.updateUserCount();
					}
					break;

				case 'formats':
					// deprecated; please send formats to the global room
					app.parseFormats(row);
					break;

				case 'raw':
				case 'html':
					this.$chat.append('<div class="notice">' + Tools.sanitizeHTML(row.slice(1).join('|')) + '</div>');
					break;

				case 'unlink':
					// note: this message has global effects, but it's handled here
					// so that it can be included in the scrollback buffer.
					$('.message-link-' + toId(row[1])).each(function() {
						$(this).replaceWith($(this).html());
					});
					break;

				case 'tournament':
				case 'tournaments':
					if (Tools.prefs('notournaments')) break;
					if (!this.tournamentBox) this.tournamentBox = new TournamentBox(this, this.$tournamentWrapper);
					if (!this.tournamentBox.parseMessage(row.slice(1), row[0] === 'tournaments')) break;
					// fallthrough in case of unparsed message

				case '':
					this.$chat.append('<div class="notice">' + Tools.escapeHTML(row.slice(1).join('|')) + '</div>');
					break;

				default:
					this.$chat.append('<div class="notice"><code>|' + Tools.escapeHTML(row.join('|')) + '</code></div>');
					break;
				}
			}
		},
		tournamentButton: function(val, button) {
			if (this.tournamentBox) this.tournamentBox[$(button).data('type')](val, button);
		},
		parseUserList: function(userList) {
			this.userCount = {};
			this.users = {};
			var commaIndex = userList.indexOf(',');
			if (commaIndex >= 0) {
				this.userCount.users = parseInt(userList.substr(0,commaIndex),10);
				var users = userList.substr(commaIndex+1).split(',');
				for (var i=0,len=users.length; i<len; i++) {
					if (users[i]) this.users[toId(users[i])] = users[i];
				}
			} else {
				this.userCount.users = parseInt(userList);
				this.userCount.guests = this.userCount.users;
			}
			this.userList.construct();
		},
		addJoinLeave: function(action, name, oldid, silent) {
			var userid = toUserid(name);
			if (!action) {
				this.$joinLeave = null;
				this.joinLeave = {
					'join': [],
					'leave': []
				};
				return;
			} else if (action === 'join') {
				if (oldid) delete this.users[toUserid(oldid)];
				if (!this.users[userid]) this.userCount.users++;
				this.users[userid] = name;
				this.userList.add(userid);
				this.userList.updateUserCount();
				this.userList.updateNoUsersOnline();
			} else if (action === 'leave') {
				if (this.users[userid]) this.userCount.users--;
				delete this.users[userid];
				this.userList.remove(userid);
				this.userList.updateUserCount();
				this.userList.updateNoUsersOnline();
			} else if (action === 'rename') {
				if (oldid) delete this.users[toUserid(oldid)];
				this.users[userid] = name;
				this.userList.remove(oldid);
				this.userList.add(userid);
				return;
			}
			if (silent && !Tools.prefs('showjoins')) return;
			if (!this.$joinLeave) {
				this.$chat.append('<div class="message"><small>Loading...</small></div>');
				this.$joinLeave = this.$chat.children().last();
			}
			this.joinLeave[action].push(name);
			var message = '';
			if (this.joinLeave['join'].length) {
				var preList = this.joinLeave['join'];
				var list = [];
				var named = {};
				for (var j = 0; j < preList.length; j++) {
					if (!named[preList[j]]) list.push(preList[j]);
					named[preList[j]] = true;
				}
				for (var j = 0; j < list.length; j++) {
					if (j >= 5) {
						message += ', and ' + (list.length - 5) + ' others';
						break;
					}
					if (j > 0) {
						if (j == 1 && list.length == 2) {
							message += ' and ';
						} else if (j == list.length - 1) {
							message += ', and ';
						} else {
							message += ', ';
						}
					}
					message += Tools.escapeHTML(list[j]);
				}
				message += ' joined';
			}
			if (this.joinLeave['leave'].length) {
				if (this.joinLeave['join'].length) {
					message += '; ';
				}
				var preList = this.joinLeave['leave'];
				var list = [];
				var named = {};
				for (var j = 0; j < preList.length; j++) {
					if (!named[preList[j]]) list.push(preList[j]);
					named[preList[j]] = true;
				}
				for (var j = 0; j < list.length; j++) {
					if (j >= 5) {
						message += ', and ' + (list.length - 5) + ' others';
						break;
					}
					if (j > 0) {
						if (j == 1 && list.length == 2) {
							message += ' and ';
						} else if (j == list.length - 1) {
							message += ', and ';
						} else {
							message += ', ';
						}
					}
					message += Tools.escapeHTML(list[j]);
				}
				message += ' left<br />';
			}
			this.$joinLeave.html('<small style="color: #555555">' + message + '</small>');
		},
		addChat: function(name, message, pm, deltatime) {
			var userid = toUserid(name);
			var color = hashColor(userid);

			if (app.ignore[userid] && (name.charAt(0) === ' ' || name.charAt(0) === '+')) return;

			// Add this user to the list of people who have spoken recently.
			this.markUserActive(userid);

			this.$joinLeave = null;
			this.joinLeave = {
				'join': [],
				'leave': []
			};
			var clickableName = '<span class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name.substr(1)) + '</span>';
			var isHighlighted = false;
			if (!pm && userid !== app.user.get('userid')) {
				// PMs already notify in the main menu; no need to make them notify again
				isHighlighted = this.getHighlight(message);
				if (isHighlighted) {
					var notifyTitle = "Mentioned by "+name+(this.id === 'lobby' ? '' : " in "+this.title);
					this.notifyOnce(notifyTitle, "\""+message+"\"", 'highlight');
				}
			}
			var highlight = isHighlighted ? ' highlighted' : '';
			var chatDiv = '<div class="chat' + highlight + '">';
			var timestamp = ChatRoom.getTimestamp('lobby', deltatime);
			if (name.charAt(0) !== ' ') clickableName = '<small>' + Tools.escapeHTML(name.charAt(0)) + '</small>'+clickableName;
			var self = this;
			var outputChat = function() {
				self.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + Tools.parseMessage(message, name) + '</em></div>');
			};
			var showme = !((Tools.prefs('chatformatting') || {}).hideme);
			if (pm) {
				var pmuserid = toUserid(pm);
				var oName = pm;
				if (pmuserid === app.user.get('userid')) oName = name;
				this.$chat.append('<div class="chat">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-pm"><i class="pmnote" data-name="' + Tools.escapeHTML(oName) + '">(Private to ' + Tools.escapeHTML(pm) + ')</i> ' + Tools.parseMessage(message, name) + '</span></div>');
			} else if (message.substr(0,4) === '/me ') {
				message = message.substr(4);
				if (showme) {
					this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">&bull;</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + clickableName + ' <i>' + Tools.parseMessage(message, name) + '</i></em></div>');
				} else {
					outputChat();
				}
				Storage.logChat(this.id, '* '+name+' '+message);
			} else if (message.substr(0,5) === '/mee ') {
				message = message.substr(5);
				if (showme) {
					this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">&bull;</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + clickableName + '<i>' + Tools.parseMessage(message, name) + '</i></em></div>');
				} else {
					outputChat();
				}
				Storage.logChat(this.id, '* '+name+message);
			} else if (message.substr(0,10) === '/announce ') {
				this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + Tools.parseMessage(message.substr(10), name) + '</span></div>');
				Storage.logChat(this.id, ''+name+': /announce '+message);
			} else if (message.substr(0,14) === '/data-pokemon ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.pokemonRow(Tools.getTemplate(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,11) === '/data-item ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.itemRow(Tools.getItem(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,14) === '/data-ability ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.abilityRow(Tools.getAbility(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,11) === '/data-move ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.moveRow(Tools.getMove(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else {
				// Normal chat message.
				if (message.substr(0,2) === '//') message = message.substr(1);
				outputChat();
				Storage.logChat(this.id, ''+name+': '+message);
			}
		}
	}, {
		getTimestamp: function(section, deltatime) {
			var pref = Tools.prefs('timestamps') || {};
			var sectionPref = ((section === 'pms') ? pref.pms : pref.lobby) || 'off';
			if ((sectionPref === 'off') || (sectionPref === undefined)) return '';
			if (!deltatime || isNaN(deltatime)) {
				var date = new Date();
			} else {
				var date = new Date(Date.now() - deltatime * 1000);
			}
			var components = [ date.getHours(), date.getMinutes() ];
			if (sectionPref === 'seconds') {
				components.push(date.getSeconds());
			}
			return '[' + components.map(
					function(x) { return (x < 10) ? '0' + x : x; }
				).join(':') + '] ';
		},
		parseBattleID: function(id) {
			if (id.lastIndexOf('-') > 6) {
				return id.match(/^battle\-([a-z0-9]*)\-?[0-9]*$/);
			}
			return id.match(/^battle\-([a-z0-9]*[a-z])[0-9]*$/);
		}
	});

	// user list

	var UserList = this.UserList = Backbone.View.extend({
		initialize: function(options) {
			this.room = options.room;
		},
		construct: function() {
			var buf = '';
			buf += '<li id="' + this.room.id + '-userlist-users" style="text-align:center;padding:2px 0"><small><span id="' + this.room.id + '-usercount-users">' + (this.room.userCount.users || '0') + '</span> users</small></li>';
			var users = [];
			if (this.room.users) {
				var self = this;
				users = Object.keys(this.room.users).sort(function(a, b) {
					return self.comparator(a, b);
				});
			}
			for (var i=0, len=users.length; i<users.length; i++) {
				var userid = users[i];
				buf += this.constructItem(userid);
			}
			if (!users.length) {
				buf += this.getNoNamedUsersOnline();
			}
			if (this.room.userCount.guests) {
				buf += '<li id="' + this.room.id + '-userlist-guests" style="text-align:center;padding:2px 0"><small>(<span id="' + this.room.id + '-usercount-guests">' + this.room.userCount.guests + '</span> guest' + (this.room.userCount.guests == 1 ? '' : 's') + ')</small></li>';
			}
			this.$el.html(buf);
		},
		ranks: {
			'~': 2,
			'#': 2,
			'&': 2,
			'@': 1,
			'%': 1,
			'\u2605': 1,
			'+': 1,
			' ': 0,
			'!': 0,
			'‽': 0
		},
		rankOrder: {
			'~': 1,
			'#': 2,
			'&': 3,
			'@': 4,
			'%': 5,
			'\u2605': 6,
			'+': 7,
			' ': 8,
			'!': 9,
			'‽': 10
		},
		updateUserCount: function() {
			var users = Math.max(this.room.userCount.users || 0, this.room.userCount.globalUsers || 0);
			$('#' + this.room.id + '-usercount-users').html('' + users);
		},
		updateCurrentUser: function() {
			$('.userlist > .cur').attr('class', ''); // this doesn't need to be namespaced
			$('#' + this.room.id + '-userlist-user-' + me.userForm).attr('class', 'cur');
		},
		add: function(userid) {
			$('#' + this.room.id + '-userlist-user-' + userid).remove();
			var users = this.$el.children();
			// Determine where to insert the user using a binary search.
			var left = 0;
			var right = users.length - 1;
			while (right >= left) {
				var mid = Math.floor((right - left) / 2 + left);
				var cmp = this.elemComparator(users[mid], userid);
				if (cmp < 0) {
					left = mid + 1;
				} else if (cmp > 0) {
					right = mid - 1;
				} else {
					// The user is already in the list.
					return;
				}
			}
			$(this.constructItem(userid)).insertAfter($(users[right]));
		},
		remove: function(userid) {
			$('#' + this.room.id + '-userlist-user-' + userid).remove();
		},
		buttonOnClick: function(userid) {
			if (app.user.get('named')) {
				return selfR.formChallenge(userid);
			}
			return selfR.formRename();
		},
		constructItem: function(userid) {
			var name = this.room.users[userid];
			var text = '';
			// Sanitising the `userid` here is probably unnecessary, because
			// IDs can't contain anything dangerous.
			text += '<li' + (this.room.userForm === userid ? ' class="cur"' : '') + ' id="' + this.room.id +'-userlist-user-' + Tools.escapeHTML(userid) + '">';
			text += '<button class="userbutton username" data-name="' + Tools.escapeHTML(name) + '">';
			var group = name.charAt(0);
			text += '<em class="group' + (this.ranks[group]===2 ? ' staffgroup' : '') + '">' + Tools.escapeHTML(group) + '</em>';
			if (group === '~' || group === '&' || group === '#') {
				text += '<strong><em style="' + hashColor(userid) + '">' + Tools.escapeHTML(name.substr(1)) + '</em></strong>';
			} else if (group === '%' || group === '@') {
				text += '<strong style="' + hashColor(userid) + '">' + Tools.escapeHTML(name.substr(1)) + '</strong>';
			} else {
				text += '<span style="' + hashColor(userid) + '">' + Tools.escapeHTML(name.substr(1)) + '</span>';
			}
			text += '</button>';
			text += '</li>';
			return text;
		},
		elemComparator: function(elem, userid) {
			// look at the part of the `id` after the roomid
			var id = elem.id.substr(this.room.id.length + 1);
			switch (id) {
				case 'userlist-users':
					return -1; // `elem` comes first
				case 'userlist-empty':
				case 'userlist-unregistered':
				case 'userlist-guests':
					return 1; // `userid` comes first
			}
			// extract the portion of the `id` after 'userlist-user-'
			var elemuserid = id.substr(14);
			return this.comparator(elemuserid, userid);
		},
		comparator: function(a, b) {
			if (a === b) return 0;
			var aRank = (this.rankOrder[this.room.users[a] ? this.room.users[a].substr(0, 1) : ' '] || 5);
			var bRank = (this.rankOrder[this.room.users[b] ? this.room.users[b].substr(0, 1) : ' '] || 5);
			if (aRank !== bRank) return aRank - bRank;
			return (a > b ? 1 : -1);
		},
		getNoNamedUsersOnline: function() {
			return '<li id="' + this.room.id + '-userlist-empty">Only guests</li>';
		},
		updateNoUsersOnline: function() {
			var elem = $('#' + this.room.id + '-userlist-empty');
			if ($("[id^=" + this.room.id + "-userlist-user-]").length === 0) {
				if (elem.length === 0) {
					var guests = $('#' + this.room.id + '-userlist-guests');
					if (guests.length === 0) {
						this.$el.append($(this.getNoNamedUsersOnline()));
					} else {
						guests.before($(this.getNoNamedUsersOnline()));
					}
				}
			} else {
				elem.remove();
			}
		}
	});

}).call(this, jQuery);
