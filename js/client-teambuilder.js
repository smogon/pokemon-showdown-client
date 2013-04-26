(function($) {

	var TeambuilderRoom = this.TeambuilderRoom = this.Room.extend({
		initialize: function() {
			// left menu
			var buf = '<div class="mainmessage"><p>Insert teambuilder here</p>';
			this.$el.addClass('ps-room-light').html(buf);
		}
	});

}).call(this, jQuery);
