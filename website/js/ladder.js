var Topbar = Panels.Topbar.extend({
	height: 51
});

var LadderSidebarPanel = Panels.StaticPanel.extend({
	minWidth: 240,
	maxWidth: 240,
	events: {
		'submit form': 'handleSubmit'
	},
	handleSubmit: function(e) {
		var target = $(e.currentTarget);
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
		var userid = this.$('input[name=user]').select().val().replace(/[^a-zA-Z0-9]*/g,'');
		if (!userid) return;
		var linkHref = '/users/'+userid;
		this.app.go(linkHref, this, false, target);
	}
});

var LadderPanel = Panels.StaticPanel.extend({
	minWidth: 495,
	maxWidth: 530,
	events: {
		'change select[name=standing]': 'changeStanding',
		'click button[name=openReset]': 'openReset',
		'click button[name=cancelReset]': 'cancelReset',
		'click button[name=copyUrl]': 'copyUrl'
	},
	copyUrl: function (e) {
		var button = e.currentTarget;
		var textbox = button.parentElement.querySelector('textarea');
		textbox.select();
		document.execCommand("copy");
		button.textContent = 'Copied!';
		e.preventDefault();
		e.stopImmediatePropagation();
	},
	openReset: function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var formatid = e.currentTarget.value;
		var $form = this.$('.ladderresetform');
		var $resetVal = $form.find('input[name=resetLadder]');
		if ($resetVal.val() === formatid) {
			return this.cancelReset(e);
		}
		$form.find('.message').text("Reset W/L for " + formatid + " (Elo/GXE will not be reset)");
		$resetVal.val(formatid);
		$(e.currentTarget).closest('tr').after($form);
		$form.show();
	},
	cancelReset: function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		this.$('.ladderresetform').find('input[name=resetLadder]').val('');
		var $form = this.$('.ladderresetform');
		$form.hide();
	},
	changeStanding: function (e) {
		var $standing = $(e.currentTarget);
		this.$('input[name=reason]').toggle(!this.$('select[name=standing] :selected[selected]').length);
	}
});

var App = Panels.App.extend({
	topbarView: Topbar,
	states: {
		'ladder': LadderSidebarPanel,
		'ladder/': LadderSidebarPanel,
		'ladder/:ladder': LadderPanel,
		'users': LadderSidebarPanel,
		'users/': LadderSidebarPanel,
		'users/:user': LadderPanel,
		'usersearch/': LadderPanel,
		'usersearch/:q': LadderPanel,
		'users/:user/modlog': LadderPanel
	}
});

var app = new App();
