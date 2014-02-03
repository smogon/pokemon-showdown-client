(function(exports, $) {

	var friends = null;
	var friendreqsrecv = null;
	var friendreqssent = null;
	var friendsonline = [];
	var loadingFriends = false;

	var Friendlist = exports.Friendlist = {
		disabled: true,
		keepDisabled: false,
		initialize: function() {
			// Keep listening in case of namechange to alt
			app.on('init:choosename', this.loadFriends, this);
			//app.on('init:onlinestatuschange', this.onlineStatusChange, this);
		},
		enable: function() {
			if (this.keepDisabled) return;
			this.disabled = false;
			$('button[name="joinRoom"][value="friendlist"]').removeClass('disabled').prop('disabled', false);
		},
		friends: function() {
			return friends;
		},
		addToFriends: function(friend, init) {
			if (!init) this.removeFromFriendlist(friend);

			var prefix = friend.charAt(0);
			if (prefix === ',') {
				friend = friend.substr(1);
				return friendreqsrecv[toId(friend)] = friend;
			} else if (prefix === '#') {
				friend = friend.substr(1);
				return friendreqssent[toId(friend)] = friend;
			}
			friends[toId(friend)] = friend;
		},
		removeFromFriendlist: function(friend) {
			var friendid = toId(friend);
			delete friends[friendid];
			delete friendreqsrecv[friendid];
			delete friendreqssent[friendid];
		},
		loadFriends: function() {
			if (this.disabled) return;

			if (!app.user.get('named') || !app.user.get('registered')) {
				friends = {};
				friendreqsrecv = {};
				friendreqssent = {};
				app.trigger('friendlist:load');
				app.send('/setfriends');
				return;
			}

			if (friends === null || friends === undefined) {
				if (loadingFriends) return;
				loadingFriends = true;

				var self = this;
				$.get(app.user.getActionPHP() + '?act=getfriends', function(res) {
					loadingFriends = false;
					//res = ']Zarel|V4|bmelts|,haunter|#The Immortal|,treecko|Hugendugen|Detective Dell|#biggie|#imanalt|,aldaron|Goddess Briyella|Orphic|,Snowflakes|#Jac|Quinella|ibedabawz';
					if (!res || res === '][]') {
						app.addPopup(Popup, { message: 'The client is acting strange; it should have returned something but it didn\'t. Perhaps it\'s a bug?' });
						return;
					}
					if (res.charAt(0) === ']') {
						friends = {};
						friendreqsrecv = {};
						friendreqssent = {};
						var fr = res.substr(1).split('|').filter(function (n) { return n; });
						for (var i = 0, l = fr.length; i < l; i++) {
							self.addToFriends(fr[i], true);
						}
						app.trigger('friendlist:load');
						app.send('/setfriends ' + res.substr(1));
						return;
					}
					app.addPopup(Popup, { message: res });
				});
			}
		},
		hasFriend: function(friend, all) {
			if (!friends) return false;

			var fr = $.extend({}, friends);
			if (all) fr = $.extend(fr, $.extend($.extend({}, friendreqsrecv), friendreqssent));

			return !!fr[toId(friend)];
		},
		isOnline: function(friend) {
			if (!friends) return false;

			var index = friendsonline.indexOf(toId(friend));
			return (index > -1);
		},
		onlineStateChange: function(friend, type, init) {
			var friendid = toId(friend);
			var index = friendsonline.indexOf(friendid);
			if (!type || type === 'offline') {
				if (index > -1) {
					friendsonline.splice(index, 1);
				}
			} else {
				if (index === -1 || index === undefined) {
					friendsonline.push(friendid);
					if (!init) {
						app.trigger('friendlist:online', friend);
					}
				}
			}

			if (!init) {
				app.trigger('friendlist:load');
			}
		},
		friendAction: function(name, btn) {
			if (this.disabled) return false;
			var nameid = toId(name);
			if (nameid === app.user.get('userid')) return false;
			if (this.hasFriend(nameid)) {
				// they're friends
				if (!btn) return '<i class="icon-remove"></i> Remove friend';
				this.removeFriend(name);
				return;
			}
			var index = !!friendreqssent[nameid];
			if (index) {
				// a friend request has been sent
				if (!btn) return '<i class="icon-remove"></i> Withdraw friend request';
				this.removeFriend(name);
				return;
			}
			index = !!friendreqsrecv[nameid];
			if (index) {
				// a friend request has been received
				if (!btn) {
					var buf = '<i class="icon-heart"></i> Accept friend request</button>';
					buf += '<button name="friendAction"><i class="icon-remove"></i> Decline friend request';
					return buf;
				}
				var accept = btn.innerHTML.indexOf('Accept');
				if (accept > -1) this.addFriend(name);
				else this.removeFriend(name);
				return;
			}

			// they aren't friends
			if (!btn) return '<i class="icon-plus-sign"></i> Send friend request';
			this.addFriend(name);
		},
		addFriend: function(friend) {
			friend = this.trimName(friend);
			var self = this;
			$.get(app.user.getActionPHP() + '?act=addfriend&player=' + toId(friend), function(res) {
				if (res.charAt(0) === ']') {
					res = res.substr(1);
					if (res.indexOf('sent') > -1) {
						friend = res.slice(res.indexOf('to') + 3, -1);
						friend = '#' + friend;
					}
					app.send('/addfriend ' + friend);
				}
				app.addPopup(Popup, { message: res });
			});
		},
		addedFriend: function(friend) {
			if (!friend) return;
			this.addToFriends(friend);
			app.trigger('friendlist:load');
		},
		sentFriendRequest: function(friend) {
			if (!friend) return;
			this.addedFriend('#' + friend);
		},
		receiveFriendRequest: function(friend) {
			if (!friend) return;
			this.addedFriend(',' + friend);
			app.trigger('friendlist:request', friend);
		},
		removeFriend: function(friend) {
			friend = this.trimName(friend);
			var self = this;
			$.get(app.user.getActionPHP() + '?act=removefriend&player=' + toId(friend), function(res) {
				if (res.charAt(0) === ']') {
					res = res.substr(1);
					app.send('/removefriend ' + friend);

					self.removeFromFriendlist(friend);
					app.trigger('friendlist:load');
				}
				app.addPopup(Popup, { message: res });
			});
		},
		removedFriend: function(friend) {
			if (!friend) return;
			this.removeFromFriendlist(friend);
			app.trigger('friendlist:load');
		},
		trimName: function(name) {
			name = $.trim(name);
			var index = ['#', '~', '&', '\u2605', '@', '%', '+'].indexOf(name.charAt(0));
			if (index > -1) name = name.substr(1);

			return name;
		},
		parseMessage: function(parts) {
			var cmd = parts.shift();
			switch (cmd) {
				case 'status':
					var init = false;
					if (parts[0] === '#init') {
						init = true;
						parts.shift();
					}

					for (var i = 0, len = parts.length; i < len; i += 2) {
						this.onlineStateChange(parts[i], parts[i + 1] === '1', init);
						/*
						var name = parts[i];
						var status = parseInt(parts[i + 1], 10);
						if (!(friendsonline.indexOf(name) > -1)) {
							friendsonline.push(name);

							if (!init) {
								app.trigger('friendlist:online', name);
							}
						}
						*/
					}

					app.trigger('friendlist:load');
					break;
				case 'requestsent':
					friendreqssent[toId(parts[0])] = parts[0];
					app.trigger('friendlist:load');
					break;
				case 'requestreceived':
					friendreqsrecv[toId(parts[0])] = parts[0];
					app.trigger('friendlist:load');
					app.trigger('friendlist:request', parts[0]);
					break;
				case 'added':
					this.addToFriends(parts[0]);
					app.trigger('friendlist:load');
					break;
				case 'removed':
					this.removeFromFriendlist(parts[0]);
					app.trigger('friendlist:load');
					break;
			}
		}
	};

	var FriendlistRoom = exports.FriendlistRoom = exports.Room.extend({
		type: 'friendlist',
		bestWidth: 380,
		initialize: function() {
			this.requestNotifications();
			app.on('friendlist:load', this.update, this);
			app.on('friendlist:request', this.friendRequest, this);
			app.on('friendlist:online', this.friendOnline, this);
			// left menu
			this.$el.addClass('ps-room-light').addClass('scrollable');
			this.update();
		},
		events: {
			'keyup input.friendnamesearch': 'friendSearch',
			'click li.result a': 'friendClick'
		},
		dispatchClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (this[e.currentTarget.value]) this[e.currentTarget.value].call(this, e);
		},
		update: function() {
			return this.updateFriendlist();
		},
		search: '',
		updateFriendlist: function() {
			var buf = '';

			if (Friendlist.disabled) {
				buf += '<div class="pad"><p>Friend list has been disabled.</p></div>';
				this.$el.html(buf);
				return;
			}

			if (!app.user.get('named') || !app.user.get('registered')) {
				buf += '<div class="pad"><p>You should be logged in and registered in order to use the friend list.</p></div>';
				this.$el.html(buf);
				return;
			}

			if (!friends) {
				buf += '<div class="pad"><p>Busy loading your friend list.</p>';
				buf += '<p>You must have a lot of friends... Or Showdown is just terribly slow. :(</p></div>';
				this.$el.html(buf);
				return;
			}

			// header with search and add friend
			buf = '<div class="pad friendheader"><input class="textbox friendnamesearch autofocus" type="text" size="30" value="' + this.search + '" placeholder="Search list" /> <button name="addFriend" style="float: right;"><i class="icon-plus-sign"></i> Add friend</button></div>';

			// the friend list itself
			buf += '<div class="friendlistbox">';
			buf += this.renderFriends();
			buf += '</div>';

			this.$el.html(buf);
		},
		renderFriends: function() {
			var sortAlpha = function(a, b) {
				for (var i = 0, len = Math.min(a.length, b.length); i <= len; i++) {
					var achar = (a.charAt(i) || '').toLowerCase();
					if (!achar) return -1;
					var bchar = (b.charAt(i) || '').toLowerCase();
					if (!bchar) return 1;
					if (achar > bchar) return 1;
					if (achar < bchar) return -1;
				}
				return 0;
			};
			var sortFriends = function(a, b) {
				// sort by online state
				if (a[1] && !b[1]) return -1;
				if (!a[1] && b[1]) return 1;

				// sort by name
				return sortAlpha(a[0].origName || a[0].name, b[0].origName || b[0].name);
			};
			var buf = '';

			buf += '<ul class="utilichart">';
			var matches = [];
			var friendsHeaderText = 'Friends';
			if (this.search) {
				var search = toId(this.search);
				if (search) {
					buf += '<li><h3>Matches</h3></li>';
					var textsearch = '';
					for (var i = 0, len = search.length; i < len; i++) {
						textsearch += search.charAt(i) + (i < len - 1 ? '[^a-z0-9]*' : '');
					}
					var regex = new RegExp(search, 'gi');
					var textregex = new RegExp(textsearch, 'gi');
					var friendSBuf = [];
					for (var i in friends) {
						var friendId = toId(friends[i]);
						var match = friendId.match(regex);
						if (friendId.match(regex) || friends[i].match(regex)) {
							var name = friends[i].replace(textregex, function(m) {
								return '<b>' + m + '</b>';
							});
							var foIndex = friendsonline.indexOf(friendId);
							friendSBuf.push([
								{
									origName: friends[i],
									name: name,
									cssClass: (!matches.length ? 'firstresult ' : '') + 'friend'
								},
								app.user.get('name') === friends[i] || foIndex > -1
							]);
							matches.push(friends[i]);
						}
					}
					friendSBuf.sort(sortFriends);
					for (var i = 0, len = friendSBuf.length; i < len; i++) {
						var f = friendSBuf[i][0];
						buf += this.renderResult(f.origName, f.name, friendSBuf[i][1], f.cssClass);
					}
					if (!matches.length) {
						buf += '<li><em>No matches</em></li>';
					}
					friendsHeaderText = 'Other friends';
				}
			}
			buf += '<li><h3>' + friendsHeaderText + '</h3></li>';
			var remaining = {};
			for (var i in friends) {
				var index = matches.indexOf(friends[i]);
				if (index === -1 || index === undefined) remaining[i] = friends[i];
			}
			var friendBuf = [];
			for (var i in remaining) {
				var foIndex = friendsonline.indexOf(toId(remaining[i]));
				friendBuf.push([
					{
						origName: remaining[i],
						name: remaining[i],
						cssClass: 'friend'
					},
					app.user.get('name') === friends[i] || foIndex > -1
				]);
			}
			friendBuf.sort(sortFriends);
			for (var i = 0, len = friendBuf.length; i < len; i++) {
				var f = friendBuf[i][0];
				buf += this.renderResult(f.origName, f.name, friendBuf[i][1], f.cssClass);
			}
			var friendKeys = Object.keys(friends);
			if (!friendKeys.length && !matches.length && (!remaining.length || remaining.length !== friendKeys.length)) {
				buf += '<li><em>You don\'t have any friends (on Showdown)... :(</em></li>';
			}
			if (!$.isEmptyObject(friendreqsrecv)) {
				buf += '<li><h3>Friend requests awaiting your approval</h3></li>';
				var frr = [];
				for (var i in friendreqsrecv) frr.push(friendreqsrecv[i]);
				frr.sort(sortAlpha);
				for (var i = 0, l = frr.length; i < l; i++) {
					buf += this.renderResult(frr[i]);
				}
			}
			if (!$.isEmptyObject(friendreqssent)) {
				buf += '<li><h3>Friend requests sent</h3></li>';
				var frs = [];
				for (var i in friendreqssent) frs.push(friendreqssent[i]);
				frs.sort(sortAlpha);
				for (var i = 0, l = frs.length; i < l; i++) {
					buf += this.renderResult(frs[i]);
				}
			}
			buf += '</ul>';

			return buf;
		},
		renderResult: function (origName, result, online, cssClass) {
			if (origName && !result) result = origName;
			var oo = (online ? 'online' : 'offline');
			var oot = (online ? 'Online' : 'Offline');

			var buf = '';
			buf += '<li class="result' + (cssClass ? ' ' + cssClass : '') + '"><a data-name="' + origName.replace(/"/g, '') + '">';
			buf += result;
			if (online !== undefined) buf += '<div class="' + oo + 'box">' + oot + '</div>';
			buf += '</a></li>';

			return buf;
		},
		friendSearch: function(e) {
			this.search = e.target.value;
			$('.friendlistbox').html(this.renderFriends());
		},
		friendClick: function(e) {
			e.stopPropagation();

			var target = null;
			if (e.target) {
				target = $(e.target);
			} else {
				target = $(e.currentTarget).find('a');
			}
			if (!target || !target.length) return;

			var name = target.data('name');
			app.addPopup(UserPopup, { name: name, sourceEl: e.currentTarget, position: 'right' });
		},
		addFriend: function() {
			app.addPopup(addFriendPopup);
		},
		friendRequest: function(friend) {
			if (Tools.prefs('nofriendlistnotifications')) return;
			this.notifyOnce('New friend request', friend + ' sent you a friend request!', 'friendrequest:' + friend);
		},
		friendOnline: function(friend) {
			if (Tools.prefs('nofriendlistnotifications')) return;
			this.notify(friend + ' is now online', friend + ' logged in, you can now battle and chat with this friend.', 'friendonline:' + friend);
		}
	});

	var addFriendPopup = Popup.extend({
		type: 'semimodal',
		initialize: function() {
			var buf = '<form>';
			buf += '<p>Add a friend to your friend list.</p>';
			buf += '<p><label class="label">Friend\'s name: <input class="textbox autofocus" type="text" name="friendname"></label></p>';
			buf += '<p class="buttonbar"><button type="submit"><strong>Add friend!</strong></button></p>';
			buf += '</form>';
			this.$el.html(buf);
		},
		submit: function(data) {
			this.close();
			if (!Friendlist) return;
			Friendlist.addFriend(data.friendname);
		}
	});

})(window, jQuery);