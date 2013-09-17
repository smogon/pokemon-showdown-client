(function($) {

	function arrayToPhrase(array, finalSeparator) {
		if (array.length <= 1)
			return array.join();
		finalSeparator = finalSeparator || "and";
		return array.slice(0, -1).join(", ") + " " + finalSeparator + " " + array.slice(-1)[0];
	}

	function makeDraggable(element, position) {
		var $element = $(element);
		position = position || {};
		var isMouseDown = false;
		var innerX = 0;
		var innerY = 0;

		$element.css({
			'user-select': 'none',
			cursor: 'default',
			position: 'absolute'
		});

		if (!('left' in position) || position.isDefault) {
			position.left = $element.parent().width() / 2 - $element.width() / 2;
			position.top = 0;
			position.isDefault = true;
		}

		$element.css({
			left: position.left,
			top: position.top
		});

		$element.on('mousedown', function (e) {
			innerX = e.pageX - this.offsetLeft;
			innerY = e.pageY - this.offsetTop;
			isMouseDown = true;
		}).on('mouseup', function () {
			isMouseDown = false;
		});

		$(document).on('mousemove', function (e) {
			if (isMouseDown) {
				position.left = e.pageX - innerX;
				position.top = e.pageY - innerY;
				delete position.isDefault;
				$element.css({
					left: position.left,
					top: position.top
				});
			}
		});
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
			this.savedBracketPosition = {};
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
						this.$bracket.removeClass('tournament-bracket-overflowing');
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
						var $bracket = this.generateBracket(this.bracketData);
						if ($bracket) {
							this.$bracket.append($bracket);
							if (this.$bracket[0].offsetHeight < this.$bracket[0].scrollHeight ||
								this.$bracket[0].offsetWidth < this.$bracket[0].scrollWidth) {
								this.$bracket.addClass('tournament-bracket-overflowing');
								makeDraggable($bracket, this.savedBracketPosition);
							}
						}
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
							(data[4] ? " but the tournament does not support drawing, so it did not count" : "") +
							'</div>');
						break;

					case 'end':
						var endData = JSON.parse(data[0]);

						var $bracket = this.generateBracket(endData.bracketData);
						if ($bracket) {
							var $bracketMessage = $('<div class="notice tournament-message-end-bracket"></div>').append($bracket);
							this.room.$chat.append($bracketMessage);
							if ($bracketMessage[0].offsetHeight < $bracketMessage[0].scrollHeight ||
								$bracketMessage[0].offsetWidth < $bracketMessage[0].scrollWidth) {
								$bracketMessage.addClass('tournament-message-end-bracket-overflowing');
								makeDraggable($bracket);
							}
						}

						this.room.$chat.append("<div class=\"notice tournament-message-end-winner\">Congratulations to " + Tools.escapeHTML(arrayToPhrase(endData.results[0])) + " for winning the tournament!</div>");
						if (endData.results[1])
							this.room.$chat.append("<div class=\"notice tournament-message-end-runnerup\">Runner-up" + (endData.results[1].length > 1 ? "s" : "") +": " + Tools.escapeHTML(arrayToPhrase(endData.results[1])) + "</div>");

						// Fallthrough

					case 'forceend':
						this.isActive = false;
						this.info = null;
						this.bracketData = null;
						this.savedBracketPosition = {};

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

				var nodeSize = {
					width: 150, height: 20,
					radius: 5,
					separationX: 30, separationY: 15
				};

				var $div = $('<div class="tournament-bracket-tree"></div>');

				var nodesByDepth = [];
				var stack = [{node: data.rootNode, depth: 0}];
				while (stack.length > 0) {
					var frame = stack.pop();

					if (!nodesByDepth[frame.depth])
						nodesByDepth.push(0);
					++nodesByDepth[frame.depth];

					frame.node.children.forEach(function (child) {
						stack.push({node: child, depth: frame.depth + 1});
					});
				}
				var maxDepth = nodesByDepth.length;
				var maxWidth = 0;
				nodesByDepth.forEach(function (nodes) {
					if (nodes > maxWidth)
						maxWidth = nodes;
				});

				nodeSize.realWidth = nodeSize.width + nodeSize.radius * 2;
				nodeSize.realHeight = nodeSize.height + nodeSize.radius * 2;
				nodeSize.smallRealHeight = nodeSize.height / 2 + nodeSize.radius * 2;
				var size = {
					width: nodeSize.realWidth * maxDepth + nodeSize.separationX * maxDepth,
					height: nodeSize.realHeight * (maxWidth + 0.5) + nodeSize.separationY * maxWidth
				};

				var tree = d3.layout.tree()
					.size([size.height, size.width - nodeSize.realWidth - nodeSize.separationX])
					.separation(function () { return 1; })
					.children(function (node) {
						return node.children.length === 0 ? null : node.children;
					});
				var nodes = tree.nodes(data.rootNode);
				var links = tree.links(nodes);

				var layoutRoot = d3.select($div[0])
					.append('svg:svg').attr('width', size.width).attr('height', size.height)
					.append('svg:g')
					.attr('transform', 'translate(' + (-(nodeSize.realWidth + nodeSize.separationX) / 2) + ',0)');

				var link = d3.svg.diagonal()
					.source(function (link) {
						return {x: link.source.x, y: link.source.y + nodeSize.realWidth / 2};
					})
					.target(function (link) {
						return {x: link.target.x, y: link.target.y - nodeSize.realWidth / 2};
					})
					.projection(function (link) {
						return [size.width - link.y, link.x];
					});
				layoutRoot.selectAll('path.tournament-bracket-tree-link').data(links).enter()
					.append('svg:path')
					.attr('d', link)
					.classed('tournament-bracket-tree-link', true)
					.classed('tournament-bracket-tree-link-active', function (link) {
						return link.source.team === link.target.team;
					});

				var nodeGroup = layoutRoot.selectAll('g.tournament-bracket-tree-node').data(nodes).enter()
					.append('svg:g').classed('tournament-bracket-tree-node', true).attr('transform', function (node) {
						return 'translate(' + (size.width - node.y) + ',' + node.x + ')';
					});
				nodeGroup.append('svg:rect')
					.attr('rx', nodeSize.radius)
					.attr('x', -nodeSize.realWidth / 2).attr('width', nodeSize.realWidth)
					.each(function (node) {
						var elem = d3.select(this);
						if (node.children.length === 0)
							elem.attr('y', -nodeSize.smallRealHeight / 2).attr('height', nodeSize.smallRealHeight);
						else
							elem.attr('y', -nodeSize.realHeight / 2).attr('height', nodeSize.realHeight);
					});
				nodeGroup.each(function (node) {
					var elem = d3.select(this);
					if (node.children.length === 0) {
						elem.classed('tournament-bracket-tree-node-team', true);
						elem.append('svg:text').text(node.team || "Unavailable");
					} else {
						elem.classed('tournament-bracket-tree-node-match', true);
						elem.classed('tournament-bracket-tree-node-match-' + node.state, true);
						if (node.state === 'unavailable')
							elem.append('svg:text').text("Unavailable");
						else {
							var teams = elem.append('svg:text').attr('y', -nodeSize.realHeight / 5).classed('tournament-bracket-tree-node-match-teams', true);
							var teamA = teams.append('svg:tspan').classed('tournament-bracket-tree-node-match-team', true).text(node.children[0].team);
							teams.append('svg:tspan').text(" vs ");
							var teamB = teams.append('svg:tspan').classed('tournament-bracket-tree-node-match-team', true).text(node.children[1].team);

							var score = elem.append('svg:text').attr('y', nodeSize.realHeight / 5);
							if (node.state === 'available')
								score.text("Waiting");
							else if (node.state === 'inprogress')
								score.append('svg:a').attr('xlink:href', app.root + toRoomid(node.room).toLowerCase()).classed('ilink', true).text("In-progress");
							else if (node.state === 'finished') {
								if (node.result === 'win') {
									teamA.classed('tournament-bracket-tree-node-match-team-win', true);
									teamB.classed('tournament-bracket-tree-node-match-team-loss', true);
								} else if (node.result === 'loss') {
									teamA.classed('tournament-bracket-tree-node-match-team-loss', true);
									teamB.classed('tournament-bracket-tree-node-match-team-win', true);
								} else {
									teamA.classed('tournament-bracket-tree-node-match-team-draw', true);
									teamB.classed('tournament-bracket-tree-node-match-team-draw', true);
								}

								elem.classed('tournament-bracket-tree-node-match-result-' + node.result, true);
								score.text(node.score.join(" - "));
							}
						}
					}

					if (node.parent && node.parent.state === 'finished')
						if (node.parent.result === 'draw')
							elem.classed('tournament-bracket-tree-node-draw', true);
						else if (node.team === node.parent.team)
							elem.classed('tournament-bracket-tree-node-win', true);
						else
							elem.classed('tournament-bracket-tree-node-loss', true);
				});

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
