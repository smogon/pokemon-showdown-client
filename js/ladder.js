
function Ladder(id, elem)
{
	var selfR = this;
	this.id = id;
	this.elem = elem;
	if (window.me) {
		this.meIdent = {name: me.name, named: 'init'};
		me.rooms[id] = {};
		this.me = me.rooms[id];
	}
	this.activeFormat = false;
	
	elem.html('<div class="mainsection formatlist"></div><div class="mainsection ladder" style="display:none"></div>');

	this.formatListElem = elem.find('.formatlist');
	this.ladderElem = elem.find('.ladder');
	
	this.focus = function() {
		selfR.updateMainElem();
	};
	this.init = function() {
		selfR.update();
		selfR.updateMe();
		selfR.updateMainElem();
	};
	this.message = function(message) {
		rooms.lobby.message(message);
	};
	this.send = function (message) {
		emit(me.socket, 'chat', {room:'',message:message});
	};
	this.update = function(data) {
		if (!data) {
			selfR.updateMainElem();
			return;
		}
		selfR.updateMainElem();
	};
	this.updateMainElem = function() {
		var text = '';
		selfR.ladderElem.show();
		if (!selfR.activeFormat) {
			var ladderButtons = '';
			for (var i in exports.BattleFormats) {
				var format = exports.BattleFormats[i];
				if (!format.searchShow || !format.rated) continue;
				ladderButtons += '<li style="margin:5px"><button onclick="rooms[\''+selfR.id+'\'].formSelectFormat(\''+i+'\')" style="width:400px;height:30px;text-align:left;font:12pt Verdana">'+format.name+'</button></li>';
			}
			selfR.ladderElem.html('<div><p>See a user\'s ranking with <code>/ranking <em>username</em></code></p>' + 
				//'<p><strong style="color:red">I\'m really really sorry, but as a warning: we\'re going to reset the ladder again soon to fix some more ladder bugs.</strong></p>' +
 				'<p>(btw if you couldn\'t tell the ladder screens aren\'t done yet; they\'ll look nicer than this once I\'m done.)</p><ul>' +
				ladderButtons +
				'</ul></div>');
		} else {
			this.ladderElem.html('<p><button onclick="rooms[\''+selfR.id+'\'].formSelectFormat(\'\')"><i class="icon-chevron-left"></i> Format List</button></p><p><em>Loading...</em></p>');
			var format = selfR.activeFormat;
			$.get('/ladder.php?format='+encodeURIComponent(format)+'&server='+encodeURIComponent(Config.server.id.split(':')[0])+'&output=html', function(data){
				if (selfR.activeFormat !== format) return;
				var text = '<p><button onclick="rooms[\''+selfR.id+'\'].formSelectFormat(\'\')"><i class="icon-chevron-left"></i> Format List</button></p>';
				text += '<h3>'+format+' Top 100</h3>';
				text += data;
				selfR.ladderElem.html(text);
			}, 'html');
		}
	};
	
	this.formKeyDown = function(e) {
	};
	this.formKeyUp = function(e) {
	};
	this.formSelectFormat = function(format) {
		selfR.activeFormat = format;
		selfR.updateMainElem();
	};
	this.updateMe = function() {
	};
	selfR.init();
}
