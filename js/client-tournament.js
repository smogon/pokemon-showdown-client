(function($) {

	function arrayToPhrase(array, finalSeparator) {
		if (array.length <= 1)
			return array.join();
		finalSeparator = finalSeparator || "and";
		return array.slice(0, -1).join(", ") + " " + finalSeparator + " " + array.slice(-1)[0];
	}

	var TournamentBox = this.TournamentBox = (function () {
		function TournamentBox(room, $wrapper) {
			this.room = room;
			this.$wrapper = $wrapper;

			$wrapper.html(
				'<div class="tournament-title"><span class="tournament-format"></span> <span class="tournament-generator"></span> Tournament</div>' +
				'<div class="tournament-box">' +
					'<div class="tournament-bracket"></div>' +
					'<div class="tournament-tools">' +
						'<button class="button tournament-join">Join</button><button class="button tournament-leave">Leave</button>' +
						'<div class="tournament-nomatches">There are currently no new matches available for you. Please wait for some other battles to end.</div>' +
						'<div class="tournament-challenge">' +
							'<span class="tournament-challenge-user"></span>' +
							'<span class="tournament-challenge-team"></span>' +
							'<button class="button tournament-challenge-challenge">Challenge</button>' +
						'</div>' +
						'<div class="tournament-challengeby"></div>' +
						'<div class="tournament-challenging"></div>' +
						'<div class="tournament-challenged">' +
							'<div class="tournament-challenged-message"></div>' +
							'<span class="tournament-challenge-team"></span>' +
							'<button class="button tournament-challenge-accept">Accept</button>' +
						'</div>' +
					'</div>' +
				'</div>');

			this.$title = $wrapper.find('.tournament-title');
			this.$format = $wrapper.find('.tournament-format');
			this.$generator = $wrapper.find('.tournament-generator');
			this.$box = $wrapper.find('.tournament-box');
			this.$bracket = $wrapper.find('.tournament-bracket');
			this.$tools = $wrapper.find('.tournament-tools');
			this.$join = $wrapper.find('.tournament-join');
			this.$leave = $wrapper.find('.tournament-leave');
			this.$noMatches = $wrapper.find('.tournament-nomatches');
			this.$challenge = $wrapper.find('.tournament-challenge');
			this.$challengeUser = $wrapper.find('.tournament-challenge-user');
			this.$challengeTeam = $wrapper.find('.tournament-challenge-team');
			this.$challengeChallenge = $wrapper.find('.tournament-challenge-challenge');
			this.$challengeBy = $wrapper.find('.tournament-challengeby');
			this.$challenging = $wrapper.find('.tournament-challenging');
			this.$challenged = $wrapper.find('.tournament-challenged');
			this.$challengedMessage = $wrapper.find('.tournament-challenged-message');
			this.$challengeAccept = $wrapper.find('.tournament-challenge-accept');

			this.isActive = false;
			this.info = null;
			this.bracketData = null;
			this.challenges = null;
			this.challengeBys = null;

			var self = this;
			this.$title.on('click', function() {
				self.$box.toggleClass('active');
				self.$box.css('transition', '');
				self.$box.css('max-height', self.$box.hasClass('active') ? self.$box[0].scrollHeight: '');
			});
			this.$box.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
				if (self.$box.hasClass('active'))
					self.$box.css('transition', 'none');
				if (!self.isActive)
					self.$wrapper.removeClass('active');
			});
			this.$join.on('click', function() {
				self.room.send('/tournament join');
			});
			this.$leave.on('click', function() {
				self.room.send('/tournament leave');
			});
			this.$challengeChallenge.on('click', function() {
				var team = app.user.teams[self.$challengeTeam.children().val()];
				self.room.send('/utm ' + JSON.stringify(team ? team.team : null));
				self.room.send('/tournament challenge ' + self.$challengeUser.children().val());
			});
			this.$challengeAccept.on('click', function() {
				var team = app.user.teams[self.$challengeTeam.children().val()];
				self.room.send('/utm ' + JSON.stringify(team ? team.team : null));
				self.room.send('/tournament acceptchallenge');
			});
		}

		TournamentBox.prototype.parseMessage = function (data, isBroadcast) {
			if (isBroadcast) {
				// TODO
				return true;
			} else {
				if (!this.isActive) {
					this.$wrapper.addClass("active");
					this.$box.addClass("active");
					this.isActive = true;
				}

				var cmd = data.shift().toLowerCase();
				switch (cmd) {
					case 'create':
						this.room.$chat.append("<div class=\"tournament-message-create\">A " + BattleFormats[data.shift()].name + " " + data.join('|') + " Tournament has been created.</div>");
						break;

					case 'join':
						this.room.$chat.append("<div class=\"tournament-message-join\">" + Tools.escapeHTML(data[0]) + " has joined the tournament</div>");
						break;

					case 'leave':
						this.room.$chat.append("<div class=\"tournament-message-leave\">" + Tools.escapeHTML(data[0]) + " has left the tournament</div>");
						break;

					case 'start':
						this.room.$chat.append("<div class=\"tournament-message-start\">The tournament has started!</div>");
						break;

					case 'disqualify':
						this.room.$chat.append("<div class=\"tournament-message-disqualify\">" + Tools.escapeHTML(data[0]) + " has been disqualified from the tournament</div>");
						break;

					case 'update':
						this.$tools.find('.active').andSelf().removeClass('active');
						if (this.info && this.info.isStarted)
							this.$noMatches.addClass('active');
						this.challenges = null;
						this.challengeBys = null;
						break;

					case 'info':
						this.info = JSON.parse(data.join('|'));
						this.$format.text(BattleFormats[this.info.format].name);
						this.$generator.text(this.info.generator);
						break;

					case 'bracketdata':
						this.bracketData = JSON.parse(data.join('|'));
						this.showBracket(this.bracketData);
						break;

					case 'challenges':
						this.$noMatches.removeClass('active');
						this.challenges = data[0].split(',');
						this.$challengeUser.html(this.renderChallengeUsers());
						this.$challengeTeam.html(app.rooms[''].renderTeams(this.info.format));
						this.$challengeTeam.children().data('type', 'challengeTeam');
						this.$challengeTeam.children().attr('name', 'tournamentButton');
						this.$challenge.addClass("active");
						break;

					case 'challengebys':
						this.$noMatches.removeClass('active');
						this.challengeBys = data[0].split(',');
						this.$challengeBy.text((this.challenges ? "Or" : "Please") + " wait for " + arrayToPhrase(this.challengeBys, "or") + " to challenge you.");
						this.$challengeBy.addClass("active");
						break;

					case 'challenging':
						this.$noMatches.removeClass('active');
						this.$challenging.text("Challenging " + data[0] + "...").addClass("active");
						break;

					case 'challenged':
						this.$noMatches.removeClass('active');
						this.$challengedMessage.text(data[0] + " has challenged you.");
						this.$challengeTeam.html(app.rooms[''].renderTeams(this.info.format));
						this.$challengeTeam.children().data('type', 'challengeTeam');
						this.$challengeTeam.children().attr('name', 'tournamentButton');
						this.$challenged.addClass("active");
						break;

					case 'battlestart':
						this.room.$chat.append('<div class="tournament-message-battlestart"><a href="' + app.root + toRoomid(data[2]).toLowerCase() + '" class="ilink">' +
							"A tournament battle between " + Tools.escapeHTML(data[0]) + " and " + Tools.escapeHTML(data[1]) + " has started." +
							'</a></div>');
						break;

					case 'battleend':
						var result = "drawn";
						if (data[2] === 'win')
							result = "won";
						else if (data[2] === 'loss')
							result = "lost";
						this.room.$chat.append('<div class="tournament-message-battleend">' +
							Tools.escapeHTML(data[0]) + " has " + result + " the match " + Tools.escapeHTML(data[3].split(',').join(' - ')) + " against " + Tools.escapeHTML(data[1]) +
							'</div>');
						break;

					case 'end':
						this.room.$chat.append("<div class=\"tournament-message-end-winner\">Congratulations to " + Tools.escapeHTML(arrayToPhrase(data[0].split(','))) + " for winning the tournament!</div>");
						if (data[1])
							this.room.$chat.append("<div class=\"tournament-message-end-runnerup\">Runner-up" + (data[1].length > 1 ? "s" : "") +": " + Tools.escapeHTML(arrayToPhrase(data[1].split(','))) + "</div>");
						// Fallthrough

					case 'forceend':
						this.isActive = false;
						this.info = null;
						this.bracketData = null;

						// A quick start and end will not fire the transitionend event, so we delay a bit so the transition happens
						var self = this;
						setTimeout(function () {
							if (self.isActive)
								return;
							self.$box.removeClass("active");
							self.$box.css('max-height', '');
							self.$box.css('transition', '');
						}, 0);

						if (cmd === 'forceend')
							this.room.$chat.append("<div class=\"tournament-message-forceend\">The tournament was forcibly ended.</div>");
						break;

					default:
						return true;
				}

				this.$box.css('max-height', this.$box.hasClass('active') ? this.$box[0].scrollHeight : '');
			}
		};

		TournamentBox.prototype.showBracket = function (data) {
			var isJoined = false;
			if (data.type === 'tree') {
				// TODO
			} else if (data.type === 'table') {
				this.$bracket.empty();
				var $table = $('<table class="tournament-bracket-table"></table>');

				var $colHeaders = $('<tr><td class="empty"></td></tr>');
				$table.append($colHeaders);
				data.tableHeaders.cols.forEach(function (name) {
					$colHeaders.append($('<th></th>').text(name));
					if (app.user.attributes.name === name)
						isJoined = true;
				});

				data.tableHeaders.rows.forEach(function (name, r) {
					var $row = $('<tr></tr>');
					$table.append($row);
					$row.append($('<th></th>').text(name));
					data.tableContents[r].forEach(function (cell) {
						var $cell = $('<td></td>');
						$row.append($cell);
						if (!cell) {
							$cell.addClass('tournament-bracket-table-cell-null');
							return;
						}
						$cell.addClass('tournament-bracket-table-cell-' + cell.state);
						if (cell.state === 'unavailable') {
							$cell.text("Unavailable");
						} else if (cell.state === 'available') {
							$cell.text("Waiting");
						} else if (cell.state === "inprogress") {
							$cell.html('<a href="' + app.root + toRoomid(cell.room).toLowerCase() + '" class="ilink">In-progress</a>');
						} else if (cell.state === 'finished') {
							$cell.addClass('tournament-bracket-table-cell-result-' + cell.result);
							$cell.text(cell.score.join(" - "));
						}
					});
					$row.append($('<th class="tournament-bracket-row-score"></th>').text(data.scores[r]));
				});

				if (data.tableContents.length > 0)
					this.$bracket.append($table);
			}

			if (!this.info.isStarted)
				if (isJoined)
					this.$leave.addClass('active');
				else
					this.$join.addClass('active');
			if (!this.info.isStarted || isJoined)
				this.$tools.addClass('active');
		},

		TournamentBox.prototype.renderChallengeUsers = function () {
			return '<button class="select" value="' + toId(this.challenges[0]) + '" name="tournamentButton" data-type="challengeUser">' + Tools.escapeHTML(this.challenges[0]) + '</button>';
		};
		TournamentBox.prototype.challengeUser = function (user, button) {
			app.addPopup(UserPopup, {user: user, users: this.challenges, sourceEl: button});
		};

		TournamentBox.prototype.challengeTeam = function (team, button) {
			app.addPopup(TeamPopup, {team: team, format: this.info.format, sourceEl: button});
		};

		return TournamentBox;
	})();

	var UserPopup = this.Popup.extend({
		initialize: function (data) {
			this.$el.html('<ul class="popupmenu">' + data.users.map(function (user) {
				return '<li><button name="selectUser" value="' + Tools.escapeQuotes(user) + '"' + (user === data.user ? ' class="sel"' : '') + '>' + Tools.escapeHTML(user) + '</button></li>';
			}).join('') + '</ul>');
		},
		selectUser: function (user) {
			this.sourceEl.val(toId(user)).text(user);
			this.close();
		}
	});

}).call(this, jQuery);
