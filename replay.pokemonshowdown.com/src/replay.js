// preserved for replay management

/* function updateProgress(done, a, b)
{
	if (!battle.paused) return;
	//$('#battle').html('<div class="playbutton"><button data-action="start">Play</button>'+(done?'':'<br />Buffering: '+parseInt(100*a/b)+'%')+'</div>');
} */
//setTimeout(function(){updateProgress(true)}, 10000);

// Panels

var Topbar = Panels.Topbar.extend({
	height: 51
});

var ReplaySidebarPanel = Panels.StaticPanel.extend({
	minWidth: 300,
	maxWidth: 600,
	events: {
		'click button[name=moreResults]': 'moreResults'
	},
	moreResults: function(e) {
		var elem = e.currentTarget;
		elem.disabled = true;
		// var offset = elem.value;
		var page = Number(elem.value);
		if (!page) page = 2;
		var user = elem.dataset.user;
		var format = elem.dataset.format;
		var private = !!elem.dataset.private;
		var self = this;
		elem.innerHTML = 'Loading...<br /><i class="fa fa-caret-down"></i>'
		$.get('/search', Object.assign({
			user: user,
			format: format,
			page: page,
			output: 'html'
		}, private ? {private: 1} : {}), function (data) {
			self.$('ul.linklist').append(data);
			// var $nextOffset = self.$('input.offset');
			// var val = $nextOffset.val();
			// $nextOffset.remove();
			var $more = self.$('input.more');
			if (!$more.length) {
				$(elem).remove();
				return;
			} else {
				$more.remove();
			}
			elem.innerHTML = 'More<br /><i class="fa fa-caret-down"></i>'
			elem.disabled = false;
			elem.value = page + 1;
		});
	}
});

var ReplayPanel = Panels.StaticPanel.extend({
	minWidth: 960,
	maxWidth: 1180,
	moveTo: function() {
		Panels.Panel.prototype.moveTo.apply(this, arguments);
		this.$el.css('top', $(window).height() > 495 ? '51px' : '0');
	},
	events: {
		'click .chooser button': 'clickChangeSetting',
		'click .replayDownloadButton': 'clickReplayDownloadButton'
	},
	clickChangeSetting: function(e) {
		e.preventDefault();
		var $chooser = $(e.currentTarget).closest('.chooser');
		var value = e.currentTarget.value;
		this.changeSetting($chooser, value, $(e.currentTarget));
	},
	changeSetting: function(type, value, valueElem) {
		var $chooser;
		if (typeof type === 'string') {
			$chooser = this.$('.'+type+'chooser');
		} else {
			$chooser = type;
			type = '';
			if ($chooser.hasClass('colorchooser')) {
				type = 'color';
			} else if ($chooser.hasClass('soundchooser')) {
				type = 'sound';
			} else if ($chooser.hasClass('speedchooser')) {
				type = 'speed';
			}
		}
		if (!valueElem) valueElem = $chooser.find('button[value='+value+']');

		$chooser.find('button').removeClass('sel');
		valueElem.addClass('sel');

		switch (type) {
		case 'color':
			if (value === 'dark') {
				$(document.body).addClass('dark');
			} else {
				$(document.body).removeClass('dark');
			}
			break;

		case 'sound':
			// remember this is reversed: sound[off] === muted[true]
			this.muted = (value === 'off');
			this.battle.setMute(this.muted);
			this.$('.startsoundchooser').remove();
			break;

		case 'speed':
			var fadeTable = {
				hyperfast: 40,
				fast: 50,
				normal: 300,
				slow: 500,
				reallyslow: 1000
			};
			var delayTable = {
				hyperfast: 1,
				fast: 1,
				normal: 1,
				slow: 1000,
				reallyslow: 3000
			};
			this.battle.messageShownTime = delayTable[value];
			this.battle.messageFadeTime = fadeTable[value];
			this.battle.scene.updateAcceleration();
			break;
		}
	},
	battle: null,
	muted: null,
	updateContent: function() {
		this.$el.css('overflow-x', 'hidden');
		var $battle = this.$('.battle');
		if (!$battle.length) return;

		var replayid = this.$('input[name=replayid]').val() || '';
		var log = (this.$('script.log').text() || '').replace(/\\\//g,'/');

		var self = this;
		this.battle = new Battle({
			id: replayid,
			$frame: $battle,
			$logFrame: this.$('.battle-log'),
			log: log.split('\n'),
			isReplay: true,
			paused: true
		})

		this.$('.urlbox').css('margin-right', 120).before('<a class="button replayDownloadButton" style="float:right;margin-top:7px;margin-right:7px" href="#"><i class="fa fa-download"></i> Download</a>');

		// this works around a WebKit/Blink bug relating to float layout
		var rc2 = this.$('.replay-controls-2')[0];
		if (rc2) rc2.innerHTML = rc2.innerHTML;

		if (window.HTMLAudioElement) this.$('.soundchooser, .startsoundchooser').show();

		this.battle.subscribe(function (state) { self.update(state); });
		this.update();
	},
	update: function (state) {
		if (state === 'error') {
			var m = /^([a-z0-9]+)-[a-z0-9]+-[0-9]+$/.exec(this.battle.id);
			if (m) {
				this.battle.log('<hr /><div class="chat">This replay was uploaded from a third-party server (<code>' + BattleLog.escapeHTML(m[1]) + '</code>). It contains errors.</div><div class="chat">Replays uploaded from third-party servers can contain errors if the server is running custom code, or the server operator has otherwise incorrectly configured their server.</div>', true);
			}
			return;
		}

		if (BattleSound.muted && !this.muted) this.changeSetting('sound', 'off');

		if (this.battle.paused) {
			var resetDisabled = !this.battle.started ? ' disabled' : '';
			this.$('.replay-controls').html('<button data-action="play"><i class="fa fa-play"></i> Play</button><button data-action="reset"' + resetDisabled + '><i class="fa fa-undo"></i> Reset</button> <button data-action="rewind"><i class="fa fa-step-backward"></i> Last turn</button><button data-action="ff"><i class="fa fa-step-forward"></i> Next turn</button> <button data-action="ffto"><i class="fa fa-fast-forward"></i> Go to turn...</button> <button data-action="switchViewpoint"><i class="fa fa-random"></i> Switch sides</button>');
		} else {
			this.$('.replay-controls').html('<button data-action="pause"><i class="fa fa-pause"></i> Pause</button><button data-action="reset"><i class="fa fa-undo"></i> Reset</button> <button data-action="rewind"><i class="fa fa-step-backward"></i> Last turn</button><button data-action="ff"><i class="fa fa-step-forward"></i> Next turn</button> <button data-action="ffto"><i class="fa fa-fast-forward"></i> Go to turn...</button> <button data-action="switchViewpoint"><i class="fa fa-random"></i> Switch sides</button>');
		}
	},
	clickReplayDownloadButton: function (e) {
		var filename = (this.battle.tier || 'Battle').replace(/[^A-Za-z0-9]/g, '');

		// ladies and gentlemen, JavaScript dates
		var timestamp = parseInt(this.$('.uploaddate').data('timestamp'), 10) * 1000;
		var date = new Date(timestamp);
		filename += '-' + date.getFullYear();
		filename += (date.getMonth() >= 9 ? '-' : '-0') + (date.getMonth() + 1);
		filename += (date.getDate() >= 10 ? '-' : '-0') + date.getDate();

		filename += '-' + toID(this.battle.p1.name);
		filename += '-' + toID(this.battle.p2.name);

		e.currentTarget.href = BattleLog.createReplayFileHref(this);
		e.currentTarget.download = filename + '.html';

		e.stopPropagation();
	},
	pause: function() {
		this.battle.pause();
	},
	play: function() {
		this.battle.play();
	},
	reset: function() {
		this.battle.reset();
	},
	ff: function() {
		this.battle.skipTurn();
	},
	rewind: function() {
		this.battle.seekTurn(this.battle.turn - 1);
	},
	ffto: function() {
		var turn = prompt('Turn?');
		if (!turn.trim()) return;
		if (turn === 'e' || turn === 'end' || turn === 'f' || turn === 'finish') turn = Infinity;
		turn = Number(turn);
		if (isNaN(turn) || turn < 0) alert("Invalid turn");
		this.battle.seekTurn(turn);
	},
	switchViewpoint: function() {
		this.battle.switchViewpoint();
	},
	remove: function() {
		this.battle.destroy();
		Panels.StaticPanel.prototype.remove.call(this);
	},
});

var App = Panels.App.extend({
	topbarView: Topbar,
	states: {
		'*path': ReplaySidebarPanel, // catch-all default

		':replay': ReplayPanel,
		':replay/manage': ReplayPanel,
		'search': ReplaySidebarPanel,
		'search/': ReplaySidebarPanel,
		'search:query': ReplaySidebarPanel,
		'search/:query': ReplaySidebarPanel
	},
});
var app = new App();
