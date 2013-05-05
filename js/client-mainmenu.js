(function($) {

	var MainMenuRoom = this.MainMenuRoom = this.Room.extend({
		tinyWidth: 340,
		bestWidth: 628,
		events: {
			'keydown textarea': 'keyPress',
			'click .username': 'clickUsername',
			'click .closebutton': 'closePM',
			'click .pm-window': 'clickPMBackground',
			'focus textarea': 'onFocusPM',
			'blur textarea': 'onBlurPM',
			'click button.formatselect': 'selectFormat',
			'click button.teamselect': 'selectTeam'
		},
		initialize: function() {

			var buf = '<div class="mainmenuwrapper">';

			// left menu 2 (high-res: right, low-res: top)
			buf += '<div class="leftmenu"><div class="activitymenu"><div class="pmbox"></div></div>';

			// left menu 1 (high-res: left, low-res: bottom)
			buf += '<div class="mainmenu"><div class="menugroup"><form class="battleform" data-search="1">';
			buf += '<p><label class="label">Format:</label>'+this.renderFormats()+'</p>';
			buf += '<p><label class="label">Team:</label>'+this.renderTeams()+'</p>';
			buf += '<p><button class="button big" name="search"><strong>Look for a battle</strong></button></p></form></div>';
			buf += '<div class="menugroup"><p><button class="button" name="joinRoom" value="teambuilder">Teambuilder</button></p><p><button class="button" name="joinRoom" value="ladder">Ladder</button></p></div></div></div>';

			// right menu
			buf += '<div class="rightmenu"><div class="menugroup"><p><button class="button" name="joinRoom" value="lobby">Join lobby chat</button></p></div></div>';

			// footer
			buf += '<div class="mainmenufooter"><small><a href="//pokemonshowdown.com/" target="_blank">Website</a> | <a href="//pokemonshowdown.com/replay/" target="_blank">Replays</a> | <a href="//pokemonshowdown.com/rules" target="_blank">Rules</a></small></div>';

			buf += '</div>';
			this.$el.html(buf);

			this.$activityMenu = this.$('.activitymenu');
			this.$pmBox = this.$activityMenu.find('.pmbox');

			app.on('init:formats', this.updateFormats, this);
			this.updateFormats();

			app.user.on('saveteams', this.updateTeams, this);
		},

		/*********************************************************
		 * PMs
		 *********************************************************/

		addPM: function(name, message, target) {
			var oName = name;
			if (toId(name) === app.user.get('userid')) {
				oName = target;
			}

			var $pmWindow = this.openPM(oName, true);

			var $chatFrame = $pmWindow.find('.pm-log');
			var $chat = $pmWindow.find('.inner');
			if ($chatFrame.scrollTop() + 60 >= $chat.height() - $chatFrame.height()) {
				autoscroll = true;
			}

			var timestamp = ChatRoom.getTimestamp('pms');
			var color = hashColor(toId(name));
			var clickableName = '<span class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name.substr(1)) + '</span>';
			if (name.substr(0, 1) !== ' ') clickableName = '<small>' + Tools.escapeHTML(name.substr(0, 1)) + '</small>'+clickableName;
			$chat.append('<div class="chat">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em' + (target === oName ? ' class="mine"' : '') + '>' + messageSanitize(message) + '</em></div>');

			if (autoscroll) {
				$chatFrame.scrollTop($chat.height());
			}
		},
		openPM: function(name, dontFocus) {
			var userid = toId(name);
			var $pmWindow = this.$pmBox.find('.pm-window-'+userid);
			if (!$pmWindow.length) {
				group = name.charAt(0);
				if (group === ' ') {
					group = '';
				} else {
					group = '<small>'+Tools.escapeHTML(group)+'</small>';
				}
				var buf = '<div class="pm-window pm-window-'+userid+'" data-userid="'+userid+'" data-name="'+name+'"><h3><button class="closebutton" href="'+app.root+'teambuilder" tabindex="-1"><i class="icon-remove-sign"></i></button>'+group+Tools.escapeHTML(name.substr(1))+'</h3><div class="pm-log"><div class="inner"></div></div>';
				buf += '<div class="pm-log-add"><form class="chatbox nolabel"><textarea class="textbox" type="text" size="70" autocomplete="off" name="message"></textarea></form></div></div>';
				$pmWindow = $(buf).prependTo(this.$pmBox);
				$pmWindow.find('textarea').autoResize({
					animate: false,
					extraSpace: 0
				});
			} else {
				$pmWindow.show();
				if (!dontFocus) {
					var $chatFrame = $pmWindow.find('.pm-log');
					var $chat = $pmWindow.find('.inner');
					$chatFrame.scrollTop($chat.height());
				}
			}
			if (!dontFocus) this.$el.scrollTop(0);
			return $pmWindow;
		},
		closePM: function(e) {
			var userid;
			if (e.currentTarget) {
				e.preventDefault();
				e.stopPropagation();
				userid = $(e.currentTarget).closest('.pm-window').data('userid');
			} else {
				userid = toId(e);
			}
			$pmWindow = this.$pmBox.find('.pm-window-'+userid)
			$pmWindow.hide();

			var $rejectButton = $pmWindow.find('button[name=rejectChallenge]');
			if ($rejectButton.length) {
				this.rejectChallenge(userid, $rejectButton);
			}
			$rejectButton = $pmWindow.find('button[name=cancelChallenge]');
			if ($rejectButton.length) {
				this.cancelChallenge(userid, $rejectButton);
			}

			var $next = $pmWindow.next();
			while ($next.length && $next.css('display') === 'none') {
				$next = $next.next();
			}
			if ($next.length) {
				$next.find('textarea[name=message]').focus();
				return;
			}

			$next = $pmWindow.prev();
			while ($next.length && $next.css('display') === 'none') {
				$next = $next.prev();
			}
			if ($next.length) {
				$next.find('textarea[name=message]').focus();
				return;
			}

			if (app.curSideRoom) app.curSideRoom.focus();
		},
		focusPM: function(name) {
			this.openPM(name).prependTo(this.$pmBox).find('textarea[name=message]').focus();
		},
		onFocusPM: function(e) {
			$(e.currentTarget).closest('.pm-window').addClass('focused');
		},
		onBlurPM: function(e) {
			$(e.currentTarget).closest('.pm-window').removeClass('focused');
		},
		keyPress: function(e) {
			if (e.keyCode === 13 && !e.shiftKey) { // Enter
				var $target = $(e.currentTarget);
				e.preventDefault();
				e.stopPropagation();
				var text;
				if ((text = $target.val())) {
					// this.tabComplete.reset();
					// this.chatHistory.push(text);
					var userid = $target.closest('.pm-window').data('userid');
					text = ('\n'+text).replace(/\n/g, '\n/pm '+userid+', ').substr(1);
					this.send(text);
					$(e.currentTarget).val('');
				}
			} else if (e.keyCode === 27) { // Esc
				this.closePM(e);
			}
		},
		clickUsername: function(e) {
			e.stopPropagation();
			var name = $(e.currentTarget).data('name');
			app.addPopup('user', UserPopup, {name: name, sourceEl: e.currentTarget});
		},
		clickPMBackground: function(e) {
			if (!e.shiftKey && !e.cmdKey && !e.ctrlKey) {
				if (window.getSelection && !window.getSelection().isCollapsed) {
					return;
				}
				app.dismissPopups();
				$(e.currentTarget).find('textarea[name=message]').focus();
				e.stopPropagation();
			}
		},
		challengesFrom: null,
		challengeTo: null,
		resetPending: function() {
			this.updateSearch();
			var self = this;
			this.$('form.pending').closest('.pm-window').each(function(i, el) {
				self.challenge($(el).data('userid'));
			});
		},
		searching: false,
		updateSearch: function(data) {
			if (data) this.searching = data.searching;
			var $searchForm = $('.mainmenu button.big').closest('form');
			var $formatButton = $searchForm.find('button[name=format]');
			var $teamButton = $searchForm.find('button[name=team]');
			if (this.searching) {
				$formatButton.addClass('preselected')[0].disabled = true;
				$teamButton.addClass('preselected')[0].disabled = true;
				$searchForm.find('button.big').html('<strong><i class="icon-refresh icon-spin"></i> Searching...</strong>').addClass('disabled');
			} else {
				var format = $formatButton.val();
				var teamIndex = $teamButton.val();
				$formatButton.replaceWith(this.renderFormats(format));
				$teamButton.replaceWith(this.renderTeams(format, teamIndex));

				$searchForm.find('button.big').html('<strong>Look for a battle</strong>').removeClass('disabled');
				$searchForm.find('button.cancelSearch').html('<strong>Look for a battle</strong>').removeClass('disabled');
				$searchForm.find('p.cancel').remove();
			}
		},
		updateChallenges: function(data) {
			this.challengesFrom = data.challengesFrom;
			this.challengeTo = data.challengeTo;
			for (var i in data.challengesFrom) {
				this.openPM(' '+i, true);
			}
			var self = this;
			this.$('.pm-window').each(function(i, el) {
				var $pmWindow = $(el);
				var userid = $pmWindow.data('userid');
				var name = $pmWindow.data('name');
				if (data.challengesFrom[userid]) {
					var challenge = data.challengesFrom[userid];
					var $challenge = self.openChallenge(name, $pmWindow);
					var buf = '<form class="battleform"><p>'+Tools.escapeHTML(name)+' wants to battle!</p>';
					buf += '<p><label class="label">Format:</label>'+self.renderFormats(challenge.format, true)+'</p>';
					buf += '<p><label class="label">Team:</label>'+self.renderTeams(challenge.format)+'</p>';
					buf += '<p class="buttonbar"><button name="acceptChallenge"><strong>Accept</strong></button> <button name="rejectChallenge">Reject</button></p></form>';
					$challenge.html(buf);
				} else {
					var $challenge = $pmWindow.find('.challenge');
					if ($challenge.length) {
						if ($challenge.find('button[name=acceptChallenge]').length) {
							// Someone was challenging you, but cancelled their challenge
							$challenge.html('<form class="battleform"><p>The challenge was cancelled.</p><p class="buttonbar"><button name="dismissChallenge">OK</button></p></form>');
						} else if ($challenge.find('button[name=cancelChallenge]').length) {
							// You were challenging someone else, and they either accepted
							// or rejected it
							$challenge.remove();
						}
					}
				}
			});

			if (data.challengeTo) {
				var challenge = data.challengeTo;
				var name = challenge.to;
				var userid = toId(name);
				var $challenge = this.openChallenge(name);

				var buf = '<form class="battleform"><p>Waiting for '+Tools.escapeHTML(name)+'...</p>';
				buf += '<p><label class="label">Format:</label>'+this.renderFormats(challenge.format, true)+'</p>';
				buf += '<p class="buttonbar"><button name="cancelChallenge">Cancel</button></p></form>';

				$challenge.html(buf);
			}
		},
		openChallenge: function(name, $pmWindow) {
			var userid = toId(name);
			if (!$pmWindow) $pmWindow = this.openPM(name, true);
			var $challenge = $pmWindow.find('.challenge');
			if (!$challenge.length) {
				$challenge = $('<div class="challenge"></div>').insertAfter($pmWindow.find('h3'));
			}
			return $challenge;
		},
		updateFormats: function() {
			if (!window.BattleFormats) {
				this.$('.mainmenu button.big').html('<em>Connecting...</em>').addClass('disabled');
				return;
			}

			if (!this.searching) this.$('.mainmenu button.big').html('<strong>Look for a battle</strong>').removeClass('disabled');
			var self = this;
			this.$('button[name=format]').each(function(i, el) {
				var val = el.value;
				var $teamButton = $(el).closest('form').find('button[name=team]');
				$(el).replaceWith(self.renderFormats(val));
				$teamButton.replaceWith(self.renderTeams(val));
			});
		},
		updateTeams: function() {
			if (!window.BattleFormats) return;
			var teams = app.user.teams;
			var self = this;

			this.$('button[name=team]').each(function(i, el) {
				var val = el.value;
				if (val === 'random') return;
				var format = $(el).closest('form').find('button[name=format]').val();
				$(el).replaceWith(self.renderTeams(format, val));
			});
		},
		updateRightMenu: function() {
			if (app.sideRoom) {
				this.$('.rightmenu').hide();
			} else {
				this.$('.rightmenu').show();
			}
		},

		// challenge buttons
		challenge: function(name) {
			var userid = toId(name);
			var $challenge = this.$('.pm-window-'+userid+' .challenge');
			if ($challenge.length && !$challenge.find('button[name=dismissChallenge]').length) {
				return;
			}
			$challenge = this.openChallenge(name);
			var buf = '<form class="battleform"><p>Challenge '+Tools.escapeHTML(name)+'?</p>';
			buf += '<p><label class="label">Format:</label>'+this.renderFormats()+'</p>';
			buf += '<p><label class="label">Team:</label>'+this.renderTeams()+'</p>';
			buf += '<p class="buttonbar"><button name="makeChallenge"><strong>Challenge</strong></button> <button name="dismissChallenge">Cancel</button></p></form>';
			$challenge.html(buf);
		},
		acceptChallenge: function(i, target) {
			var $pmWindow = $(target).closest('.pm-window');
			var userid = $pmWindow.data('userid');

			var teamIndex = $pmWindow.find('button[name=team]').val();
			var team = null;
			if (app.user.teams[teamIndex]) team = app.user.teams[teamIndex].team;

			$(target).closest('.challenge').remove();
			app.send('/utm '+(team?$.toJSON(team):''));
			app.send('/accept '+userid);
		},
		rejectChallenge: function(i, target) {
			var userid = $(target).closest('.pm-window').data('userid');
			$(target).closest('.challenge').remove();
			app.send('/reject '+userid);
		},
		makeChallenge: function(i, target) {
			var $pmWindow = $(target).closest('.pm-window');
			var userid = $pmWindow.data('userid');
			var name = $pmWindow.data('name');
			var format = $pmWindow.find('button[name=format]').val();

			var teamIndex = $pmWindow.find('button[name=team]').val();
			var team = null;
			if (app.user.teams[teamIndex]) team = app.user.teams[teamIndex].team;

			var buf = '<form class="battleform pending"><p>Challenging '+Tools.escapeHTML(name)+'...</p>';
			buf += '<p><label class="label">Format:</label>'+this.renderFormats(format, true)+'</p>';
			buf += '<p class="buttonbar"><button name="cancelChallenge">Cancel</button></p></form>';

			$(target).closest('.challenge').html(buf);
			app.send('/utm '+(team?$.toJSON(team):''));
			app.send('/challenge '+userid+', '+format);
		},
		cancelChallenge: function(i, target) {
			var userid = $(target).closest('.pm-window').data('userid');
			$(target).closest('.challenge').remove();
			app.send('/cancelchallenge '+userid);
		},
		dismissChallenge: function(i, target) {
			$(target).closest('.challenge').remove();
		},
		format: function(format, button) {
			app.addPopup('format', FormatPopup, {format: format, sourceEl: button});
		},
		team: function(team, button) {
			var format = $(button).closest('form').find('button[name=format]').val();
			app.addPopup('team', TeamPopup, {team: team, format: format, sourceEl: button});
		},

		// format/team selection

		curFormat: '',
		renderFormats: function(formatid, noChoice) {
			if (!window.BattleFormats) {
				return '<button class="select formatselect" name="format" disabled value="'+Tools.escapeHTML(formatid)+'"><em>Loading...</em></button>';
			}
			if (_.isEmpty(BattleFormats)) {
				return '<button class="select formatselect" name="format" disabled><em>No formats available</em></button>'
			}
			if (!noChoice) {
				this.curFormat = formatid;
				if (!this.curFormat) {
					if (BattleFormats['randombattle']) {
						this.curFormat = 'randombattle';
					} else for (var i in BattleFormats) {
						this.curFormat = i;
						break;
					}
				}
				formatid = this.curFormat;
			}
			return '<button class="select formatselect'+(noChoice?' preselected':'')+'" name="format" value="'+formatid+'"'+(noChoice?' disabled':'')+'>'+Tools.escapeFormat(formatid)+'</button>';
		},
		curTeamFormat: '',
		curTeamIndex: -1,
		renderTeams: function(formatid, teamIndex) {
			if (!app.user.teams || !window.BattleFormats) {
				return '<button class="select teamselect" name="team" disabled><em>Loading...</em></button>';
			}
			if (!formatid) formatid = this.curFormat;
			if (!window.BattleFormats[formatid]) {
				return '<button class="select teamselect" name="team" disabled></button>';
			}
			if (window.BattleFormats[formatid].team) {
				return '<button class="select teamselect preselected" name="team" value="random" disabled>'+TeamPopup.renderTeam('random')+'</button>';
			}
			var teams = app.user.teams;
			if (!teams.length) {
				return '<button class="select teamselect" name="team" disabled>You have no teams</button>'
			}
			if (teamIndex === undefined) {
				teamIndex = 0;
				if (this.curTeamIndex >= 0) {
					teamIndex = this.curTeamIndex;
				}
				if (this.curTeamFormat !== formatid) {
					for (var i=0; i<teams.length; i++) {
						if (teams[i].format === formatid) {
							teamIndex = i;
							break;
						}
					}
				}
			} else {
				teamIndex = +teamIndex;
			}
			return '<button class="select teamselect" name="team" value="'+teamIndex+'">'+TeamPopup.renderTeam(teamIndex)+'</button>';
		},

		// buttons
		search: function(i, button) {
			var $searchForm = $(button).closest('form');
			if ($searchForm.find('.cancel').length) {
				return;
			}
			var $formatButton = $searchForm.find('button[name=format]');
			var $teamButton = $searchForm.find('button[name=team]');

			var format = $formatButton.val();
			var teamIndex = $teamButton.val();
			var team = null;
			if (app.user.teams[teamIndex]) team = app.user.teams[teamIndex].team;

			$formatButton.addClass('preselected')[0].disabled = true;
			$teamButton.addClass('preselected')[0].disabled = true;
			$searchForm.find('button.big').html('<strong><i class="icon-refresh icon-spin"></i> Connecting...</strong>').addClass('disabled');
			$searchForm.append('<p class="cancel buttonbar"><button name="cancelSearch">Cancel</button></p>');

			app.send('/utm '+(team?$.toJSON(team):''));
			app.send('/search '+format);
		},
		cancelSearch: function() {
			app.send('/cancelsearch');
			this.searching = false;
			this.updateSearch();
		},
		joinRoom: function(room) {
			app.joinRoom(room);
		}
	});

	var FormatPopup = this.FormatPopup = this.Popup.extend({
		initialize: function(data) {
			var curFormat = data.format;
			var selectType = (this.sourceEl.closest('form').data('search') ? 'search' : 'challenge');
			var bufs = ['',''];
			var curBuf = 0;
			var curSection = '';
			for (var i in BattleFormats) {
				var format = BattleFormats[i];
				var selected = false;
				if (format.effectType !== 'Format') continue;
				if (selectType && !format[selectType + 'Show']) continue;

				if (format.section && format.section !== curSection) {
					curSection = format.section;
					curBuf = (curSection === 'Doubles' || curSection === 'Past Generations') ? 1 : 0;
					bufs[curBuf] += '<li><h3>'+Tools.escapeHTML(curSection)+'</li>';
				}
				bufs[curBuf] += '<li><button name="selectFormat" value="' + i + '"' + (curFormat === i ? ' class="sel"' : '') + '>' + Tools.escapeHTML(format.name) + '</button></li>';
			}

			if (bufs[1]) {
				this.$el.html('<ul class="popupmenu" style="float:left">'+bufs[0]+'</ul><ul class="popupmenu" style="float:left;padding-left:5px">'+bufs[1]+'</ul><div style="clear:left"></div>');
			} else {
				this.$el.html('<ul class="popupmenu">'+bufs[0]+'</ul>');
			}
		},
		selectFormat: function(format) {
			var $teamButton = this.sourceEl.closest('form').find('button[name=team]');
			this.sourceEl.val(format).html(Tools.escapeFormat(format));
			$teamButton.replaceWith(app.rooms[''].renderTeams(format));
			app.rooms[''].curFormat = format;
			this.close();
		}
	});

	var TeamPopup = this.TeamPopup = this.Popup.extend({
		initialize: function(data) {
			var bufs = ['','','','',''];
			var curBuf = 0;
			var teams = app.user.teams;

			var bufBoundary = 128;
			if (teams.length > 128 && $(window).width() > 1080) {
				bufBoundary = Math.ceil(teams.length/5);
			} else if (teams.length > 81) {
				bufBoundary = Math.ceil(teams.length/4);
			} else if (teams.length > 54) {
				bufBoundary = Math.ceil(teams.length/3);
			} else if (teams.length > 27) {
				bufBoundary = Math.ceil(teams.length/2);
			}

			if (!teams.length) {
				bufs[curBuf] = '<li><em>You have no teams</em></li>';
			} else {
				var format = BattleFormats[data.format];
				var curTeam = +data.team;
				var teamFormat = (format.teambuilderFormat || (format.isTeambuilderFormat ? data.format : false));
				if (teamFormat) {
					bufs[curBuf] = '<li><h3>'+Tools.escapeFormat(teamFormat)+' teams</h3></li>';
					var count = 0;
					for (var i = 0; i < teams.length; i++) {
						if ((!teams[i].format && !teamFormat) || teams[i].format === teamFormat) {
							var selected = (i === curTeam);
							bufs[curBuf] += '<li><button name="selectTeam" value="'+i+'"'+(selected?' class="sel"':'')+'>'+Tools.escapeHTML(teams[i].name)+'</button></li>';
							count++;
							if (count % bufBoundary == 0 && curBuf < 4) curBuf++;
						}
					}
					if (!count) bufs[curBuf] += '<li><em>You have no '+Tools.escapeFormat(teamFormat)+' teams</em></li>';
					bufs[curBuf] += '<li><h3>Other teams</h3></li>';
				} else {
					bufs[curBuf] = '<li><h3>All teams</h3></li>';
				}
				for (var i = 0; i < teams.length; i++) {
					if (teamFormat && teams[i].format === teamFormat) continue;
					var selected = (i === curTeam);
					bufs[curBuf] += '<li><button name="selectTeam" value="'+i+'"'+(selected?' class="sel"':'')+'>'+Tools.escapeHTML(teams[i].name)+'</button></li>';
					count++;
					if (count % bufBoundary == 0 && curBuf < 4) curBuf++;
				}
			}
			if (format.canUseRandomTeam) {
				bufs[curBuf] += '<li><button value="-1">Random Team</button></li>';
			}

			if (bufs[1]) {
				while (!bufs[bufs.length-1]) bufs.pop();
				this.$el.html('<ul class="popupmenu" style="float:left">'+bufs.join('</ul><ul class="popupmenu" style="float:left;padding-left:5px">')+'</ul><div style="clear:left"></div>');
			} else {
				this.$el.html('<ul class="popupmenu">'+bufs[0]+'</ul>');
			}
		},
		selectTeam: function(i) {
			var formatid = this.sourceEl.closest('form').find('button[name=format]').val();
			i = +i;
			this.sourceEl.val(i).html(TeamPopup.renderTeam(i));
			app.rooms[''].curTeamIndex = i;
			app.rooms[''].curTeamFormat = formatid;
			this.close();
		}
	}, {
		renderTeam: function(i) {
			if (i === 'random') {
				var buf = 'Random team<br />';
				for (var i=0; i<6; i++) {
					buf += '<span class="pokemonicon" style="float:left;'+Tools.getIcon()+'"></span>';
				}
				return buf;
			}
			var team = app.user.teams[i];
			var buf = ''+Tools.escapeHTML(team.name)+'<br />';
			for (var i=0; i<team.team.length; i++) {
				buf += '<span class="pokemonicon" style="float:left;'+Tools.getIcon(team.team[i])+'"></span>';
			}
			return buf;
		}
	});

}).call(this, jQuery);
