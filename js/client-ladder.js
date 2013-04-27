(function($) {

	var LadderRoom = this.LadderRoom = this.Room.extend({
		initialize: function() {
			this.$el.addClass('ps-room-light');
			this.update();
		},
		events: {
			'click button': 'selectFormat'
		},
		curFormat: '',
		update: function() {
			if (!this.curFormat) {
				var ladderButtons = '';
				if (!window.BattleFormats) {
					this.$el.html('Loading...');
					return;
				}
				for (var i in BattleFormats) {
					var format = BattleFormats[i];
					if (!format.searchShow || !format.rated) continue;
					ladderButtons += '<li style="margin:5px"><button value="select" data-format="'+i+'" style="width:400px;height:30px;text-align:left;font:12pt Verdana">'+format.name+'</button></li>';
				}
				this.$el.html('<div><p>See a user\'s ranking with <code>/ranking <em>username</em></code></p>' + 
					//'<p><strong style="color:red">I\'m really really sorry, but as a warning: we\'re going to reset the ladder again soon to fix some more ladder bugs.</strong></p>' +
	 				'<p>(btw if you couldn\'t tell the ladder screens aren\'t done yet; they\'ll look nicer than this once I\'m done.)</p><ul>' +
					ladderButtons +
					'</ul></div>');
			} else {
				var format = this.curFormat;
				this.$el.html('<div><p><button value="select"><i class="icon-chevron-left"></i> Format List</button></p><p><em>Loading...</em></p></div>');
				$.get('/ladder.php?format='+encodeURIComponent(format)+'&server='+encodeURIComponent(Config.server.id.split(':')[0])+'&output=html', _.bind(function(data){
					if (this.curFormat !== format) return;
					var buf = '<p><button value="select"><i class="icon-chevron-left"></i> Format List</button></p>';
					buf += '<h3>'+format+' Top 100</h3>';
					buf += data;
					this.$el.html(buf);
				}, this), 'html');
			}
		},
		selectFormat: function(e) {
			e.preventDefault();
			this.curFormat = $(e.currentTarget).data('format');
			this.update();
		}
	});

}).call(this, jQuery);
