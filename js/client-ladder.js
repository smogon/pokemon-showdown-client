(function($) {

	var LadderRoom = this.LadderRoom = this.Room.extend({
		initialize: function() {
			// left menu
			var buf = '<div class="mainmessage"><p>Insert ladder here</p>';
			this.$el.addClass('ps-room-light').html(buf);
		}
	});

}).call(this, jQuery);
