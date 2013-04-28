(function($) {

	var ChatRoom = this.ChatRoom = this.Room.extend({
		minWidth: 320,
		maxWidth: 800,
		isSideRoom: true,
		events: {
			'keypress textarea': 'keyPress',
			'submit form': 'submit'
		},
		initialize: function() {
			var buf = '<ul class="userlist" style="display:none"></ul><div class="chat-log"><div class="inner"></div><div class="inner-after"></div></div><div class="chat-log-add">Connecting...</div>';
			this.$el.addClass('ps-room-light').html(buf);

			this.$chatAdd = this.$('.chat-log-add');
			this.$chatFrame = this.$('.chat-log');
			this.$chat = this.$('.inner');
			this.$chatbox = null;

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

			app.user.on('change', this.updateUser, this);
			this.updateUser();

			this.send('/lobbychat on');
		},
		updateLayout: function() {
			if (this.$el.width() >= 610) {
				this.$userList.show();
				this.$chatFrame.addClass('hasuserlist');
				this.$chatAdd.addClass('hasuserlist');
			} else {
				this.$userList.hide();
				this.$chatFrame.removeClass('hasuserlist');
				this.$chatAdd.removeClass('hasuserlist');
			}
		},
		show: function() {
			Room.prototype.show.apply(this, arguments);
			this.updateLayout();
		},
		submit: function(e) {
			e.preventDefault();
			e.stopPropagation();
		},
		keyPress: function(e) {
			if (e.keyCode === 13) { // Enter
				e.preventDefault();
				e.stopPropagation();
				var text;
				if ((text = this.$chatbox.val())) {
					// this.tabComplete.reset();
					// this.chatHistory.push(text);
					// text = this.parseCommand(text);
					if (text) {
						this.send(text);
					}
					this.$chatbox.val('');
				}
			}
		},
		updateUser: function() {
			var name = app.user.get('name');
			var userid = app.user.get('userid');
			if (!name) {
				this.$chatAdd.html('Connecting...');
				this.$chatbox = null;
			} else if (!app.user.get('named')) {
				this.$chatAdd.html('<form><button>Join chat</button></form>');
				this.$chatbox = null;
			} else {
				this.$chatAdd.html('<form class="chatbox"><label style="' + hashColor(userid) + '">' + Tools.escapeHTML(name) + ':</label> <textarea class="textbox" type="text" size="70" autocomplete="off"></textarea></form>');
				this.$chatbox = this.$chatAdd.find('textarea');
				this.$chatbox.autoResize({
					animateDuration: 100,
					extraSpace: 0
				});
				if (this === app.curSideRoom || this === app.curRoom) {
					this.$chatbox.focus();
				}
			}
		},
		focus: function() {
			if (this.$chatbox) this.$chatbox.focus();
		},
		destroy: function() {
			this.send('/lobbychat off');
			Room.prototype.destroy.apply(this, arguments);
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
			for (var i = 0; i < log.length; i++) {
				this.addRow(log[i]);
			}
			if (autoscroll) {
				this.$chatFrame.scrollTop(this.$chat.height());
			}
			var $children = this.$chat.children();
			if ($children.length > 900) {
				$children.slice(0,100).remove();
			}
		},
		addRow: function(line) {
			var name, name2, room, action, silent, oldid;
			if (typeof line === 'string') {
				if (line.substr(0,1) !== '|') line = '||'+line;
				var row = line.substr(1).split('|');
				switch (row[0]) {
				case 'c':
				case 'chat':
					this.addChat(row[1], row.slice(2).join('|'));
					break;

				case 'b':
				case 'B':
					var id = row[1];
					name = row[2];
					name2 = row[3];
					silent = (row[0] === 'B');

					var matches = this.parseBattleID(id);
					if (!matches) {
						return; // bogus room ID could be used to inject JavaScript
					}
					var format = (matches ? matches[1] : '');

					if (silent && !Tools.prefs('showbattles')) return;

					this.addJoinLeave();
					var battletype = 'Battle';
					if (format) {
						battletype = format + ' battle';
						if (format === 'Random Battle') battletype = 'Random Battle';
					}
					this.$chat.append('<div class="message"><a href="' + Config.locprefix+id + '" onclick="selectTab(\'' + id + '\'); return false" class="battle-start">' + battletype + ' started between <strong style="' + hashColor(toUserid(name)) + '">' + Tools.escapeHTML(name) + '</strong> and <strong style="' + hashColor(toUserid(name2)) + '">' + Tools.escapeHTML(name2) + '</strong>.</a></div>');
					break;

				case 'j':
				case 'J':
					this.addJoinLeave('join', row[1], null, row[0] === 'J');
					break;

				case 'l':
				case 'L':
					this.addJoinLeave('leave', row[1], null, row[0] === 'L');
					break;

				case 'n':
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

				case 'formats':
					this.parseFormats(row);
					break;

				case 'raw':
					this.$chat.append('<div class="message">' + Tools.sanitizeHTML(row.slice(1).join('|')) + '</div>');
					break;

				case '':
				default:
					this.$chat.append('<div class="message">' + Tools.escapeHTML(row.slice(1).join('|')) + '</div>');
					break;
				}
			}
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
			app.trigger('init:formats');
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
		addChat: function(name, message) {
			var userid = toUserid(name);
			var color = hashColor(userid);
			var pm = false;

			// if (me.ignore[userid] && name.substr(0, 1) === ' ') continue;

			// Add this user to the list of people who have spoken recently.
			this.markUserActive(userid);

			this.$joinLeave = null;
			this.joinLeave = {
				'join': [],
				'leave': []
			};
			var clickableName = '<span style="cursor:pointer" class="username" data-userid="' + userid + '">' + Tools.escapeHTML(name.substr(1)) + '</span>';
			var isHighlighted = this.getHighlight(message);
			if (isHighlighted) {
				// notify({
				// 	type: 'highlight',
				// 	user: name
				// });
			}
			var highlight = isHighlighted ? ' style="background-color:#FDA;"' : '';
			var chatDiv = '<div class="chat"' + highlight + '>';
			var timestamp = this.getTimestamp('lobby');
			if (name.substr(0, 1) !== ' ') clickableName = '<small>' + Tools.escapeHTML(name.substr(0, 1)) + '</small>'+clickableName;
			if (pm) {
				var pmuserid = (userid === me.userid ? toUserid(pm) : userid);
				if (!me.pm[pmuserid]) me.pm[pmuserid] = '';
				var pmcode = '<div class="chat">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em> ' + messageSanitize(message) + '</em></div>';
				for (var j = 0; j < me.popups.length; j++) {
					if (pmuserid === me.popups[j]) break;
				}
				if (j == me.popups.length) {
					// This is a new PM.
					me.popups.unshift(pmuserid);
					notify({
						type: 'pm',
						user: name
					});
				}
				me.pm[pmuserid] += pmcode;
				if (me.popups.length && me.popups[me.popups.length - 1] === pmuserid) {
					this.updatePopup(pmcode);
				} else {
					this.updatePopup();
				}
				this.$chat.append('<div class="chat">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + pmuserid + '\')">(Private to ' + Tools.escapeHTML(pm) + ')</i> ' + messageSanitize(message) + '</span></div>');
			} else if (message.substr(0,4).toLowerCase() === '/me ') {
				this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">&bull;</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + clickableName + ' <i>' + messageSanitize(message.substr(4)) + '</i></em></div>');
			} else if (message.substr(0,5).toLowerCase() === '/mee ') {
				this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">&bull;</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + clickableName + '<i>' + messageSanitize(message.substr(5)) + '</i></em></div>');
			} else if (message.substr(0,10).toLowerCase() === '/announce ') {
				this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + messageSanitize(message.substr(10)) + '</span></div>');
			} else if (message.substr(0,6).toLowerCase() === '/warn ') {
				overlay('rules', {warning: message.substr(6)});
			} else if (message.substr(0,14).toLowerCase() === '/data-pokemon ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.pokemonRow(Tools.getTemplate(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,11).toLowerCase() === '/data-item ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.itemRow(Tools.getItem(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,14).toLowerCase() === '/data-ability ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.abilityRow(Tools.getAbility(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else if (message.substr(0,11).toLowerCase() === '/data-move ') {
				this.$chat.append('<div class="message"><ul class="utilichart">'+Chart.moveRow(Tools.getMove(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>');
			} else {
				// Normal chat message.
				if (message.substr(0,2) === '//') message = message.substr(1);
				this.$chat.append(chatDiv + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em' + (name.substr(1) === app.user.get('name') ? ' class="mine"' : '') + '>' + messageSanitize(message) + '</em></div>');
			}
		},
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
			return ((highlights.length > 0) && app.highlightRegExp.test(message));
		},
		getTimestamp: function(section) {
			var pref = Tools.prefs('timestamps') || {};
			var sectionPref = ((section === 'pms') ? pref.pms : pref.lobby) || 'off';
			if ((sectionPref === 'off') || (sectionPref === undefined)) return '';
			var date = new Date();
			var components = [ date.getHours(), date.getMinutes() ];
			if (sectionPref === 'seconds') {
				components.push(date.getSeconds());
			}
			return '[' + components.map(
					function(x) { return (x < 10) ? '0' + x : x; }
				).join(':') + '] ';
		},
		markUserActive: function() {}
	});

	// user list

	var UserList = this.UserList = Backbone.View.extend({
		initialize: function(options) {
			this.room = options.room;
		},
		construct: function() {
			var buf = '';
			buf += '<li id="userlist-users" style="text-align:center;padding:2px 0"><small><span id="usercount-users">' + (this.room.userCount.users || '0') + '</span> users online:</small></li>';
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
				buf += this.noNamedUsersOnline;
			}
			if (this.room.userCount.unregistered) {
				buf += '<li id="userlist-unregistered" style="height:auto;padding-top:5px;padding-bottom:5px">';
				buf += '<span style="font-size:10pt;display:block;text-align:center;padding-bottom:5px;font-style:italic">Due to lag, <span id="usercount-unregistered">' + this.room.userCount.unregistered + '</span> unregistered users are hidden.</span>';
				buf += ' <button' + (this.room.challengeTo ? ' disabled="disabled"' : ' onclick="var gname=prompt(\'Challenge who?\');if (gname) rooms[\'' + this.room.id + '\'].formChallenge(gname);return false"') + '>Challenge an unregistered user</button>';
				buf += '<div style="clear:both"></div>';
				buf += '</li>';
			}
			if (this.room.userCount.guests) {
				buf += '<li id="userlist-guests" style="text-align:center;padding:2px 0"><small>(<span id="usercount-guests">' + this.room.userCount.guests + '</span> guest' + (this.room.userCount.guests == 1 ? '' : 's') + ')</small></li>';
			}
			this.$el.html(buf);
		},
		ranks: {
			'~': 2,
			'&': 2,
			'@': 1,
			'%': 1,
			'+': 1,
			' ': 0,
			'!': 0,
			'#': 0
		},
		rankOrder: {
			'~': 1,
			'&': 2,
			'@': 3,
			'%': 4,
			'+': 5,
			' ': 6,
			'!': 7,
			'#': 8
		},
		updateUserCount: function() {
			$('#usercount-users').html(this.room.userCount.users || '0');
		},
		updateCurrentUser: function() {
			$('.userlist > .cur').attr('class', '');
			$('#userlist-user-' + me.userForm).attr('class', 'cur');
		},
		add: function(userid) {
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
			$('#userlist-user-' + userid).remove();
		},
		buttonOnClick: function(userid) {
			if (app.user.get('named')) {
				return selfR.formChallenge(userid);
			}
			return selfR.formRename();
		},
		constructItem: function(userid) {
			var group = this.room.users[userid].substr(0, 1);
			var text = '';
			// Sanitising the `userid` here is probably unnecessary, because
			// IDs can't contain anything dangerous.
			text += '<li' + (this.room.userForm === userid ? ' class="cur"' : '') + ' id="userlist-user-' + Tools.escapeHTML(userid) + '">';
			text += '<button class="userbutton" data-userid="' + Tools.escapeHTML(userid) + '">';
			text += '<em class="group' + (this.ranks[group]===2 ? ' staffgroup' : '') + '">' + Tools.escapeHTML(group) + '</em>';
			if (group === '~' || group === '&') {
				text += '<strong><em style="' + hashColor(userid) + '">' + Tools.escapeHTML(this.room.users[userid].substr(1)) + '</em></strong>';
			} else if (group === '%' || group === '@') {
				text += '<strong style="' + hashColor(userid) + '">' + Tools.escapeHTML(this.room.users[userid].substr(1)) + '</strong>';
			} else {
				text += '<span style="' + hashColor(userid) + '">' + Tools.escapeHTML(this.room.users[userid].substr(1)) + '</span>';
			}
			text += '</button>';
			text += '</li>';
			return text;
		},
		elemComparator: function(elem, userid) {
			var id = elem.id;
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
			var aRank = this.rankOrder[this.room.users[a] ? this.room.users[a].substr(0, 1) : ' '];
			var bRank = this.rankOrder[this.room.users[b] ? this.room.users[b].substr(0, 1) : ' '];
			if (aRank !== bRank) return aRank - bRank;
			return (a > b ? 1 : -1);
		},
		noNamedUsersOnline: '<li id="userlist-empty">No named users online</li>',
		updateNoUsersOnline: function() {
			var elem = $('#userlist-empty');
			if ($("[id^=userlist-user-]").length === 0) {
				if (elem.length === 0) {
					var guests = $('#userlist-guests');
					if (guests.length === 0) {
						this.$el.append($(this.noNamedUsersOnline));
					} else {
						guests.before($(this.noNamedUsersOnline));
					}
				}
			} else {
				elem.remove();
			}
		}
	});

}).call(this, jQuery);
