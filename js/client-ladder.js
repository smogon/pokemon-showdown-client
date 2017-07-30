(function ($) {

	var LadderRoom = this.LadderRoom = this.Room.extend({
		type: 'ladder',
		title: 'Ladder',
		initialize: function () {
			this.$el.addClass('ps-room-light').addClass('scrollable');
			app.on('init:formats', this.update, this);
			this.update();
			app.on('response:laddertop', function (data) {
				var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i> Format List</button></p>';
				if (!data) {
					this.$el.html(buf + '<p>error</p></div>');
					return;
				}
				if (this.curFormat !== data[0]) return;
				buf += Tools.sanitizeHTML(data[1]) + '</div>';
				this.$el.html(buf);
			}, this);
		},
		curFormat: '',
		update: function () {
			if (!this.curFormat) {
				var buf = '<div class="ladder pad"><p>See a user\'s ranking with <code>/ranking <em>username</em></code></p>' +
					//'<p><strong style="color:red">I\'m really really sorry, but as a warning: we\'re going to reset the ladder again soon to fix some more ladder bugs.</strong></p>' +
					'<p>(btw if you couldn\'t tell the ladder screens aren\'t done yet; they\'ll look nicer than this once I\'m done.)</p>' +
					'<p><button name="selectFormat" value="help" class="button"><i class="fa fa-info-circle"></i> How the ladder works</button></p><ul>';
				if (!window.BattleFormats) {
					this.$el.html('<div class="pad"><em>Loading...</em></div>');
					return;
				}
				var curSection = '';
				for (var i in BattleFormats) {
					var format = BattleFormats[i];
					if (format.section && format.section !== curSection) {
						curSection = format.section;
						buf += '</ul><h3>' + Tools.escapeHTML(curSection) + '</h3><ul style="list-style:none;margin:0;padding:0">';
					}
					if (!format.searchShow || !format.rated) continue;
					buf += '<li style="margin:5px"><button name="selectFormat" value="' + i + '" class="button" style="width:320px;height:30px;text-align:left;font:12pt Verdana">' + Tools.escapeFormat(format.id) + '</button></li>';
				}
				buf += '</ul></div>';
				this.$el.html(buf);
			} else if (this.curFormat === 'help') {
				this.showHelp();
			} else {
				var format = this.curFormat;
				var self = this;
				this.$el.html('<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i> Format List</button></p><p><em>Loading...</em></p></div>');
				if (app.localLadder) {
					app.send('/cmd laddertop ' + format);
				} else {
					$.get('/ladder.php', {
						format: format,
						server: Config.server.id.split(':')[0],
						output: 'html'
					}, function (data) {
						if (self.curFormat !== format) return;
						var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i> Format List</button></p><p><button class="button" name="refresh"><i class="fa fa-refresh"></i> Refresh</button></p>';
						buf += '<h3>' + Tools.escapeFormat(format) + ' Top 500</h3>';
						buf += data + '</div>';
						self.$el.html(buf);
					}, 'html');
				}
			}
		},
		showHelp: function () {
			var buf = '<div class="ladder pad"><p><button name="selectFormat"><i class="fa fa-chevron-left"></i> Format List</button></p>';
			buf += '<h3>How the ladder works</h3>';
			buf += '<p>Our ladder displays four ratings: Elo, GXE, Glicko-1, and COIL.</p>';
			buf += '<p><strong>Elo</strong> is the main ladder rating. It\'s a pretty normal ladder rating: goes up when you win and down when you lose.</p>';
			buf += '<p><strong>GXE</strong> (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.</p>';
			buf += '<p><strong>Glicko-1</strong> is a different rating system. It has rating and deviation values.</p>';
			buf += '<p><strong>COIL</strong> (Converging Order Invariant Ladder) is mainly used for suspect tests. It goes up as you play games, but not too many games.</p>';
			buf += '<p>Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.</p>';
			buf += '</div>';
			this.$el.html(buf);
		},
		selectFormat: function (format) {
			this.curFormat = format;
			this.update();
		},
		refresh: function () {
			this.$('button[name=refresh]').addClass('disabled').prop('disabled', true);
			this.update();
		}
	}, {
		COIL_B: {
			'gen7oususpecttest': 17,
			'gen7uususpecttest': 20,
			'gen7rususpecttest': 9,
			'gen7nususpecttest': 9,
			'gen7lcsuspecttest': 13,
			'gen7doublesoususpecttest': 14.5,
			'gen7balancedhackmonssuspecttest': 11,
			'gen71v1suspecttest': 20,
			'gen7monotypesuspecttest': 10,
			'gen7mixandmegasuspecttest': 10.5,
			'gen7almostanyabilitysuspecttest': 6,
			'gen7sketchmonssuspecttest': 6
		}
	});

}).call(this, jQuery);
