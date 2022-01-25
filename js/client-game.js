/**
 * Handles game-room plugin communication.
 * @author mia-pi-git
 */

(function ($) {
	this.BattleGame = Backbone.View.extend({
		initialize: function (room) {
			this.room = room;
			this.$el = room.$el;
			// battle window
			this.$window = this.$el.find('div.battle').first();
			this.listen();
		},
		listen: function () {
			app.on('response:youtube', this.handleYouTube, this);
		},
		handleYouTube: function (data) {
			if (data.room !== this.room.id) return;
			if (!this.player) { // should usually exist, but just in case
				var self = this;
				// load API then
				if (!window.YT) {
					return this.loadYouTubeAPI(function () {
						setTimeout(function () { // fsr Player isn't there immediately
							self.handleYouTube(data);
						}, 100);
					});
				}
				this.player = new YT.Player(this.$window.find('iframe').first()[0], {
					events: {
						onReady: function () {
							self.handleYouTube(data);
						},
					},
				});
				return;
			}
			switch (data.type) {
			case 'play':
				this.player.playVideo();
				break;
			case 'pause':
				this.player.pauseVideo();
				break;
			case 'at':
				if (!this.player.getCurrentTime) {
					// weird thing that happens when the video ends
					// it's possibly intentional (?), so we can just ignore it
					return;
				}
				if (this.player.getPlayerState() !== YT.PlayerState.PLAYING) {
					this.player.playVideo();
				}
				var time = this.player.getCurrentTime();
				// time is kept in ms on server (Date.now() - startTime)
				var sentTime = data.time / 1000;
				if (Math.abs(time - sentTime) >= 2) {
					this.player.seekTo(sentTime);
				}
				break;
			}
		},
		loadYouTubeAPI: function (callback) {
			if (window.YT) return callback();
			if (window.ytLoading) { // already loading
				window.ytLoading.push(callback);
				return;
			}
			window.ytLoading = [];
			window.ytLoading.push(callback);
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			tag.onload = function () {
				for (let i = 0; i < window.ytLoading.length; i++) {
					window.ytLoading[i]();
				}
				delete window.ytLoading;
			}
			document.body.appendChild(tag);
		},
	});
}).call(this, jQuery);
