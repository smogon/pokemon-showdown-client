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
			this.isJoined = false;
			this.bracketData = null;
			this.challenges = null;
			this.challengeBys = null;

			var self = this;
			this.$title.on('click', function() {
				self.toggleBoxVisibility();
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

		TournamentBox.prototype.updateLayout = function () {
			this.$box.css('max-height', this.$box.hasClass('active') ? this.$box[0].scrollHeight: '');
		};
		TournamentBox.prototype.setBoxVisibility = function (isVisible) {
			if (isVisible) {
				if (this.$box.hasClass('active'))
					return;
				this.$box.addClass('active');
			} else {
				if (!this.$box.hasClass('active'))
					return;
				this.$box.removeClass('active');
			}
			this.$box.css('transition', '');
			this.$box.css('max-height', this.$box.hasClass('active') ? this.$box[0].scrollHeight: '');
		};
		TournamentBox.prototype.toggleBoxVisibility = function () {
			this.setBoxVisibility(!this.$box.hasClass('active'));
		};

		TournamentBox.prototype.parseMessage = function (data, isBroadcast) {
			if (isBroadcast) {
				// TODO
				return true;
			} else {
				var cmd = data.shift().toLowerCase();

				if (!this.isActive && cmd !== 'end') {
					this.$wrapper.addClass("active");
					this.$box.addClass("active");
					this.isActive = true;
				}

				switch (cmd) {
					case 'create':
						var format = BattleFormats[data[0]].name;
						var type = data[1];
						this.room.$chat.append("<div class=\"notice tournament-message-create\">A " + format + " " + Tools.escapeHTML(type) + " Tournament has been created.</div>");
						this.room.notifyOnce("Tournament created", "Room: " + this.room.title + "\nFormat: " + format + "\nType: " + type, 'tournament-create');
						break;

					case 'join':
						this.room.$chat.append("<div class=\"notice tournament-message-join\">" + Tools.escapeHTML(data[0]) + " has joined the tournament</div>");
						break;

					case 'leave':
						this.room.$chat.append("<div class=\"notice tournament-message-leave\">" + Tools.escapeHTML(data[0]) + " has left the tournament</div>");
						break;

					case 'start':
						this.room.$chat.append("<div class=\"notice tournament-message-start\">The tournament has started!</div>");
						break;

					case 'disqualify':
						this.room.$chat.append("<div class=\"notice tournament-message-disqualify\">" + Tools.escapeHTML(data[0]) + " has been disqualified from the tournament</div>");
						break;

					case 'update':
						this.$tools.find('.active').andSelf().removeClass('active');
						if (this.info && this.info.isStarted)
							this.$noMatches.addClass('active');
						this.isJoined = false;
						this.challenges = null;
						this.challengeBys = null;
						break;

					case 'info':
						this.info = JSON.parse(data.join('|'));
						this.$format.text(BattleFormats[this.info.format].name);
						this.$generator.text(this.info.generator);
						break;

					case 'isjoined':
						this.isJoined = true;
						break;

					case 'bracketdata':
						// The 'isjoined' packet isn't a guaranteed packet to all users, so that packet's
						// handling is placed in the immediate next guaranteed packet, here
						if (!this.info.isStarted)
							if (this.isJoined)
								this.$leave.addClass('active');
							else
								this.$join.addClass('active');
						if (!this.info.isStarted || this.isJoined)
							this.$tools.addClass('active');

						this.bracketData = JSON.parse(data.join('|'));
						this.$bracket.empty()
						var bracket = this.generateBracket(this.bracketData);
						if (bracket)
							this.$bracket.append(bracket);
						break;

					case 'challenges':
						this.$noMatches.removeClass('active');
						this.challenges = data[0].split(',');
						this.$challengeUser.html(this.renderChallengeUsers());
						this.$challengeTeam.html(app.rooms[''].renderTeams(this.info.format));
						this.$challengeTeam.children().data('type', 'challengeTeam');
						this.$challengeTeam.children().attr('name', 'tournamentButton');
						this.$challenge.addClass("active");

						this.setBoxVisibility(true);
						this.room.notifyOnce("Tournament challenges available", "Room: " + this.room.title, 'tournament-challenges');
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

						this.setBoxVisibility(true);
						this.room.notifyOnce("Tournament challenge from " + data[0], "Room: " + this.room.title, 'tournament-challenged');
						break;

					case 'battlestart':
						this.room.$chat.append('<div class="notice tournament-message-battlestart"><a href="' + app.root + toRoomid(data[2]).toLowerCase() + '" class="ilink">' +
							"A tournament battle between " + Tools.escapeHTML(data[0]) + " and " + Tools.escapeHTML(data[1]) + " has started." +
							'</a></div>');
						break;

					case 'battleend':
						var result = "drawn";
						if (data[2] === 'win')
							result = "won";
						else if (data[2] === 'loss')
							result = "lost";
						this.room.$chat.append('<div class="notice tournament-message-battleend">' +
							Tools.escapeHTML(data[0]) + " has " + result + " the match " + Tools.escapeHTML(data[3].split(',').join(' - ')) + " against " + Tools.escapeHTML(data[1]) +
							'</div>');
						break;

					case 'end':
						var endData = JSON.parse(data[0]);

						var bracket = this.generateBracket(endData.bracketData);
						if (bracket)
							this.room.$chat.append($('<div class="notice tournament-message-end-bracket"></div>').append(bracket));

						this.room.$chat.append("<div class=\"notice tournament-message-end-winner\">Congratulations to " + Tools.escapeHTML(arrayToPhrase(endData.results[0])) + " for winning the tournament!</div>");
						if (endData.results[1])
							this.room.$chat.append("<div class=\"notice tournament-message-end-runnerup\">Runner-up" + (endData.results[1].length > 1 ? "s" : "") +": " + Tools.escapeHTML(arrayToPhrase(endData.results[1])) + "</div>");

						// Fallthrough

					case 'forceend':
						this.isActive = false;
						this.info = null;
						this.bracketData = null;

						this.$box.removeClass("active");
						this.$box.css('transition', '');

						if (cmd === 'forceend')
							this.room.$chat.append("<div class=\"notice tournament-message-forceend\">The tournament was forcibly ended.</div>");
						break;

					default:
						return true;
				}

				this.$box.css('max-height', this.$box.hasClass('active') ? this.$box[0].scrollHeight : '');
			}
		};

		TournamentBox.prototype.generateBracket = function (data) {
			if (data.type === 'tree') {
				if (!data.rootNode)
					return;

				var id = 'tournament-bracket-tree-' + Math.floor(Math.random() * 0x100000000);

				// Change tree format to infovis-compatible
				var stack = [data.rootNode];
				var n = 0;
				while (stack.length > 0) {
					var node = stack.pop();

					node.data = {};
					for (var key in node)
						if (key !== 'children' && key !== 'data') {
							node.data[key] = node[key];
							delete node[key];
						}
					node.data.children = node.children;

					node.id = id + "-" + n;
					node.name = n;

					node.children.forEach(function (child) {
						stack.push(child);
					});
					++n;
				}

				var $div = $('<div class="tournament-bracket-tree" id="' + id + '"></div>');
				setTimeout(function () {
					$div.parent().css('overflow', 'hidden');
					var st = new $jit.ST({
						injectInto: id,
						constrained: false,
						levelsToShow: 999,
						orientation: 'right',
						duration: 0,
						fps: 60,
						transition: $jit.Trans.linear,
						Navigation: {enable: true, panning: true},

						Node: {height: 30, width: 150, type: 'rectangle', CanvasStyles: {fillStyle: 'rgba(0, 0, 0, 0)'}, overridable: true},
						Edge: {type: "bezier", overridable: true},

						onBeforePlotNode: function (node) {
							if (node.data.children.length === 0)
								node.data.$height = 20;
							else
								delete node.data.$height;
						},

						onBeforePlotLine: function (edge){
							if (edge.nodeTo.data.team && edge.nodeTo.data.team === edge.nodeFrom.data.team) {
								edge.data.$color = '#ee0';
								edge.data.$lineWidth = 3;
							} else {
								delete edge.data.$color;
								delete edge.data.$lineWidth;
							}
						},

						onCreateLabel: function (label, node) {
							var $label = $(label);

							if (node.data.children.length === 0) {
								$label.addClass('tournament-bracket-tree-node-team');
								$label.text(node.data.team || "Unavailable");
							} else {
								$label.addClass('tournament-bracket-tree-node-match');
								$label.addClass('tournament-bracket-tree-node-match-' + node.data.state);
								if (node.data.state === 'unavailable')
									$label.text("Unavailable");
								else {
									var $teams = $('<div></div>');
									$teams.addClass('tournament-bracket-tree-node-match-teams');
									var $teamA = $('<span></span>');
									$teamA.addClass('tournament-bracket-tree-node-match-team');
									var $teamB = $teamA.clone();
									$teamA.text(node.data.children[0].data.team);
									$teamB.text(node.data.children[1].data.team);
									$teams.append($teamA).append(" vs ").append($teamB);

									if (node.data.state === 'available')
										$label.append("Waiting");
									else if (node.data.state === 'inprogress')
										$label.append('<a href="' + app.root + toRoomid(node.data.room).toLowerCase() + '" class="ilink">In-progress</a>');
									else if (node.data.state === 'finished') {
										if (node.data.result === 'win') {
											$teamA.addClass('tournament-bracket-tree-node-match-team-win');
											$teamB.addClass('tournament-bracket-tree-node-match-team-loss');
										} else if (node.data.result === 'loss') {
											$teamA.addClass('tournament-bracket-tree-node-match-team-loss');
											$teamB.addClass('tournament-bracket-tree-node-match-team-win');
										} else {
											$teamA.addClass('tournament-bracket-tree-node-match-team-draw');
											$teamB.addClass('tournament-bracket-tree-node-match-team-draw');
										}

										$label.addClass('tournament-bracket-tree-node-match-result-' + node.data.result);
										$label.append(Tools.escapeHTML(node.data.score.join(" - ")));
									}

									$label.prepend($teams)
								}
							}

							var parentNode = null;
							for (var a in node.adjacencies)
								if (node.adjacencies[a].nodeFrom === node) {
									parentNode = node.adjacencies[a].nodeTo;
									break;
								}

							if (parentNode && parentNode.data.state === 'finished')
								if (parentNode.data.result === 'draw')
									$label.addClass("tournament-bracket-tree-node-draw");
								else if (node.data.team === parentNode.data.team)
									$label.addClass("tournament-bracket-tree-node-win");
								else
									$label.addClass("tournament-bracket-tree-node-loss");
						}
					});
					st.loadJSON(data.rootNode);
					st.compute();
					st.onClick(st.root);
				}, 0);

				return $div;
			} else if (data.type === 'table') {
				if (data.tableContents.length === 0)
					return;

				var $table = $('<table class="tournament-bracket-table"></table>');

				var $colHeaders = $('<tr><td class="empty"></td></tr>');
				$table.append($colHeaders);
				data.tableHeaders.cols.forEach(function (name) {
					$colHeaders.append($('<th></th>').text(name));
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
						if (cell.state === 'unavailable')
							$cell.text("Unavailable");
						else if (cell.state === 'available')
							$cell.text("Waiting");
						else if (cell.state === "inprogress")
							$cell.html('<a href="' + app.root + toRoomid(cell.room).toLowerCase() + '" class="ilink">In-progress</a>');
						else if (cell.state === 'finished') {
							$cell.addClass('tournament-bracket-table-cell-result-' + cell.result);
							$cell.text(cell.score.join(" - "));
						}
					});
					$row.append($('<th class="tournament-bracket-row-score"></th>').text(data.scores[r]));
				});

				return $table;
			}
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
