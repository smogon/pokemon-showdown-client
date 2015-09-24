/*

License: MIT License
  <https://github.com/Zarel/Pokemon-Showdown/blob/master/LICENSE>

*/

if (!window.exports) window.exports = window;

window.nodewebkit = false;
if (typeof process !== 'undefined' && process.versions && process.versions['node-webkit']) window.nodewebkit = true;

// todo: http://www.youtube.com/watch?v=eEwAPnIev38
// 32.930 - 1:13.032
// 32930 to 73032
// subway
// 1:33.120 - 3:08.614
/*

// PO importer

text = $('textarea')[1].value
text = text.split("\n");

for (var i=0; i<text.length; i++)
{
	var line = text[i].split(' ');
	if (!text[i].length) continue;
	if (!exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')])
	{
		exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')] = {};
	}
	var poke = exports.BattleLearnsets[POPokemon[line[0]].replace(/ /g,'')];
	for (var j=1; j<line.length; j++)
	{
		if (!poke.learnset) poke.learnset = {};
		var move = POMoves[line[j]].replace(/ /g,'');
		poke.learnset[move] = '4M';
	}
}

*/

// ES5 indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
		"use strict";
		if (this == null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n != n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// MD5 minified
window.MD5=function(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c)}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c)}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c)}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
f),h));return i(b<<g|b>>>32-g,c)}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}return c}(f),g=function(b){var c,d=b.length;c=
d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase()};

var colorCache = {};

function hashColor(name) {
	if (colorCache[name]) return colorCache[name];
	var hash;
	if (window.Config && Config.customcolors && Config.customcolors[name]) {
		if (Config.customcolors[name].color) {
			return colorCache[name] = 'color:' + Config.customcolors[name].color + ';';
		}
		hash = MD5(Config.customcolors[name]);
	} else {
		hash = MD5(name);
	}
	var H = parseInt(hash.substr(4, 4), 16) % 360;
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
	var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 / 2 + 30);
	colorCache[name] = "color:hsl(" + H + "," + S + "%," + L + "%);";
	return colorCache[name];
}

function toId(text) {
	text = text || '';
	if (typeof text === 'number') text = '' + text;
	if (typeof text !== 'string') return toId(text && text.id);
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toUserid(text) {
	text = text || '';
	if (typeof text === 'number') text = '' + text;
	if (typeof text !== 'string') return ''; //???
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toName(name) {
	if (typeof name === 'number') return '' + name;
	if (typeof name !== 'string') return '';
	name = name.replace(/[\|\s\[\]\,]+/g, ' ').trim();
	if (name.length > 18) name = name.substr(0, 18).trim();
	return name;
}

// miscellaneous things too minor to deserve their own resource file
var BattleNatures = {
	Adamant: {
		plus: 'atk',
		minus: 'spa'
	},
	Bashful: {},
	Bold: {
		plus: 'def',
		minus: 'atk'
	},
	Brave: {
		plus: 'atk',
		minus: 'spe'
	},
	Calm: {
		plus: 'spd',
		minus: 'atk'
	},
	Careful: {
		plus: 'spd',
		minus: 'spa'
	},
	Docile: {},
	Gentle: {
		plus: 'spd',
		minus: 'def'
	},
	Hardy: {},
	Hasty: {
		plus: 'spe',
		minus: 'def'
	},
	Impish: {
		plus: 'def',
		minus: 'spa'
	},
	Jolly: {
		plus: 'spe',
		minus: 'spa'
	},
	Lax: {
		plus: 'def',
		minus: 'spd'
	},
	Lonely: {
		plus: 'atk',
		minus: 'def'
	},
	Mild: {
		plus: 'spa',
		minus: 'def'
	},
	Modest: {
		plus: 'spa',
		minus: 'atk'
	},
	Naive: {
		plus: 'spe',
		minus: 'spd'
	},
	Naughty: {
		plus: 'atk',
		minus: 'spd'
	},
	Quiet: {
		plus: 'spa',
		minus: 'spe'
	},
	Quirky: {},
	Rash: {
		plus: 'spa',
		minus: 'spd'
	},
	Relaxed: {
		plus: 'def',
		minus: 'spe'
	},
	Sassy: {
		plus: 'spd',
		minus: 'spe'
	},
	Serious: {},
	Timid: {
		plus: 'spe',
		minus: 'atk'
	}
};
var BattleStatIDs = {
	HP: 'hp',
	hp: 'hp',
	Atk: 'atk',
	atk: 'atk',
	Def: 'def',
	def: 'def',
	SpA: 'spa',
	SAtk: 'spa',
	SpAtk: 'spa',
	spa: 'spa',
	SpD: 'spd',
	SDef: 'spd',
	SpDef: 'spd',
	spd: 'spd',
	Spe: 'spe',
	Spd: 'spe',
	spe: 'spe'
};
var BattlePOStatNames = { // PO style
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SAtk',
	spd: 'SDef',
	spe: 'Spd'
};
var BattleStatNames = { // proper style
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SpA',
	spd: 'SpD',
	spe: 'Spe'
};

var baseSpeciesChart = {
	'unown': 1,
	'castform': 1,
	'deoxys': 1,
	'burmy': 1,
	'wormadam': 1,
	'cherrim': 1,
	'shellos': 1,
	'gastrodon': 1,
	'rotom': 1,
	'giratina': 1,
	'arceus': 1,
	'shaymin': 1,
	'basculin': 1,
	'darmanitan': 1,
	'deerling': 1,
	'sawsbuck': 1,
	'meloetta': 1,
	'genesect': 1,
	'tornadus': 1,
	'thundurus': 1,
	'landorus': 1,
	'kyurem': 1,
	'keldeo': 1,
	'aegislash': 1,
	'gourgeist': 1,
	'pumpkaboo': 1,
	'meowstic': 1,
	'hoopa': 1,

	// mega evolutions
	'charizard': 1,
	'mewtwo': 1
	// others are hardcoded by ending with 'mega'
};

// Precompile often used regular expression for links.
var domainRegex = '[a-z0-9\\-]+(?:[.][a-z0-9\\-]+)*';
var parenthesisRegex = '[(](?:[^\\s()<>&]|&amp;)*[)]';
var linkRegex = new RegExp(
	'\\b' +
	'(?:' +
		'(?:' +
			// When using www. or http://, allow any-length TLD (like .museum)
			'(?:https?://|www[.])' + domainRegex +
			'|' + domainRegex + '[.]' +
				// Allow a common TLD, or any 2-3 letter TLD followed by : or /
				'(?:com?|org|net|edu|info|us|jp|[a-z]{2,3}(?=[:/]))' +
		')' +
		'(?:[:][0-9]+)?' +
		'\\b' +
		'(?:' +
			'/' +
			'(?:' +
				'(?:' +
					'[^\\s()&]|&amp;|&quot;' +
					'|' + parenthesisRegex +
				')*' +
				// URLs usually don't end with punctuation, so don't allow
				// punctuation symbols that probably aren't related to URL.
				'(?:' +
					'[^\\s`()\\[\\]{}\'".,!?;:&]' +
					'|' + parenthesisRegex +
				')' +
			')?' +
		')?' +
		'|[a-z0-9.]+\\b@' + domainRegex + '[.][a-z]{2,3}' +
	')',
	'ig'
);

var Tools = {

	resourcePrefix: (function () {
		var prefix = '';
		if (document.location.protocol === 'file:') prefix = 'http:';
		return prefix + '//play.pokemonshowdown.com/';
	})(),

	resolveAvatar: function (avatar) {
		var avatarnum = Number(avatar);
		if (!isNaN(avatarnum)) {
			// default avatars
			return Tools.resourcePrefix + 'sprites/trainers/' + avatarnum + '.png';
		}
		if (avatar.charAt(0) === '#') {
			return Tools.resourcePrefix + 'sprites/trainers/' + toId(avatar.substr(1)) + '.png';
		}
		if (window.Config && Config.server && Config.server.registered) {
			// custom avatar served by the server
			var protocol = (Config.server.port === 443) ? 'https' : 'http';
			return protocol + '://' + Config.server.host + ':' + Config.server.port +
				'/avatars/' + encodeURIComponent(avatar);
		}
		// just pick a random avatar
		var sprites = [1, 2, 101, 102, 169, 170];
		return Tools.resolveAvatar(sprites[Math.floor(Math.random() * sprites.length)]);
	},

	escapeFormat: function (formatid) {
		if (window.BattleFormats && BattleFormats[formatid]) {
			return Tools.escapeHTML(BattleFormats[formatid].name);
		}
		return Tools.escapeHTML(formatid);
	},
	parseChatMessage: function (message, name, timestamp, isHighlighted) {
		var showMe = !((Tools.prefs('chatformatting') || {}).hideme);
		var group = ' ';
		if (!/[A-Za-z0-9]/.test(name.charAt(0))) {
			// Backwards compatibility
			group = name.charAt(0);
			name = name.substr(1);
		}
		var color = hashColor(toId(name));
		var clickableName = '<small>' + Tools.escapeHTML(group) + '</small><span class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name) + '</span>';
		var hlClass = isHighlighted ? ' highlighted' : '';
		var mineClass = (window.app && app.user && app.user.get('name') === name ? ' mine' : '');

		var cmd = '';
		var target = '';
		if (message.charAt(0) === '/') {
			if (message.charAt(1) === '/') {
				message = message.slice(1);
			} else {
				var spaceIndex = message.indexOf(' ');
				cmd = (spaceIndex >= 0 ? message.slice(1, spaceIndex) : message.slice(1));
				if (spaceIndex >= 0) target = message.slice(spaceIndex + 1);
			}
		}

		switch (cmd) {
		case 'me':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(target) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + ' <i>' + Tools.parseMessage(target) + '</i></em></div>';
		case 'mee':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(target) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + Tools.parseMessage(target) + '</i></em></div>';
		case 'invite':
			var roomid = toRoomid(target);
			return [
				'<div class="chat">' + timestamp + '<em>' + clickableName + ' invited you to join the room "' + roomid + '"</em></div>',
				'<div class="notice"><button name="joinRoom" value="' + roomid + '">Join ' + roomid + '</button></div>'
			];
		case 'announce':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + Tools.parseMessage(target) + '</span></div>';
		case 'data-pokemon':
			if (!window.Chart) return '';
			return '<div class="message"><ul class="utilichart">' + Chart.pokemonRow(Tools.getTemplate(target), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-item':
			if (!window.Chart) return '';
			return '<div class="message"><ul class="utilichart">' + Chart.itemRow(Tools.getItem(target), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-ability':
			if (!window.Chart) return '';
			return '<div class="message"><ul class="utilichart">' + Chart.abilityRow(Tools.getAbility(target), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-move':
			if (!window.Chart) return '';
			return '<div class="message"><ul class="utilichart">' + Chart.moveRow(Tools.getMove(target), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>';
		case 'text':
			return '<div class="chat">' + Tools.escapeHTML(target) + '</div>';
		case 'error':
			return '<div class="chat message-error">' + Tools.escapeHTML(target) + '</div>';
		case 'html':
			return '<div class="chat">' + Tools.sanitizeHTML(target) + '</div>';
		default:
			// Not a command or unsupported. Parsed as a normal chat message.
			if (!name) {
				return '<div class="chat' + hlClass + '">' + timestamp + '<em>' + Tools.parseMessage(message) + '</em></div>';
			}
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(message) + '</em></div>';
		}
	},

	parseMessage: function (str) {
		str = Tools.escapeHTML(str);
		// Don't format console commands (>>).
		if (str.substr(0, 8) === '&gt;&gt;') return str;
		// Don't format console results (<<).
		if (str.substr(0, 9) === '&lt;&lt; ') return str;

		var options = Tools.prefs('chatformatting') || {};

		// ``code``
		str = str.replace(/\`\`([^< ](?:[^<`]*?[^< ])??)\`\`/g,
			options.hidemonospace ? '$1' : '<code>$1</code>');
		// ~~strikethrough~~
		str = str.replace(/\~\~([^< ](?:[^<]*?[^< ])??)\~\~/g,
			options.hidestrikethrough ? '$1' : '<s>$1</s>');
		// <<roomid>>
		str = str.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g,
			options.hidelinks ? '&laquo;$1&raquo;' : '&laquo;<a href="/$1">$1</a>&raquo;');
		// linking of URIs
		if (!options.hidelinks) {
			str = str.replace(linkRegex, function (uri) {
				if (/^[a-z0-9.]+\@/ig.test(uri)) {
					return '<a href="mailto:' + uri + '" target="_blank">' + uri + '</a>';
				}
				// Insert http:// before URIs without a URI scheme specified.
				var fulluri = uri.replace(/^([a-z]*[^a-z:])/g, 'http://$1');
				var onclick;
				var r = new RegExp('^https?://' +
					document.location.hostname.replace(/\./g, '\\.') +
					'/([a-zA-Z0-9-]+)$');
				var m = r.exec(fulluri);
				if (m) {
					onclick = "return selectTab('" + m[1] + "');";
				} else {
					var event;
					if (Tools.interstice.isWhitelisted(fulluri)) {
						event = 'External link';
					} else {
						event = 'Interstice link';
						fulluri = Tools.escapeHTML(Tools.interstice.getURI(
							Tools.unescapeHTML(fulluri)
						));
					}
					onclick = 'if (window.ga) ga(\'send\', \'event\', \'' +
						event + '\', \'' + Tools.escapeQuotes(fulluri) + '\');';
				}
				if (uri.substr(0, 24) === 'https://docs.google.com/' || uri.substr(0, 16) === 'docs.google.com/') {
					if (uri.slice(0, 5) === 'https') uri = uri.slice(8);
					if (uri.substr(-12) === '?usp=sharing' || uri.substr(-12) === '&usp=sharing') uri = uri.slice(0, -12);
					if (uri.substr(-6) === '#gid=0') uri = uri.slice(0, -6);
					var slashIndex = uri.lastIndexOf('/');
					if (uri.length - slashIndex > 18) slashIndex = uri.length;
					if (slashIndex - 4 > 19 + 3) uri = uri.slice(0, 19) + '<small class="message-overflow">' + uri.slice(19, slashIndex - 4) + '</small>' + uri.slice(slashIndex - 4);
				}
				return '<a href="' + fulluri +
					'" target="_blank" onclick="' + onclick + '">' + uri + '</a>';
			});
			// google [blah]
			//   Google search for 'blah'
			str = str.replace(/\bgoogle ?\[([^\]<]+)\]/ig, function (p0, p1) {
				p1 = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="http://www.google.com/search?ie=UTF-8&q=' + p1 +
					'" target="_blank">' + p0 + '</a>';
			});
			// wiki [blah]
			//   Search Wikipedia for 'blah' (and visit the article for 'blah' if it exists)
			str = str.replace(/\bwiki ?\[([^\]<]+)\]/ig, function (p0, p1) {
				p1 = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="http://en.wikipedia.org/w/index.php?title=Special:Search&search=' +
					p1 + '" target="_blank">' + p0 + '</a>';
			});
			// server issue #pullreq
			//   Links to github Pokemon Showdown server pullreq number
			str = str.replace(/\bserver issue ?#(\d+)/ig, function (p0, p1) {
				p1 = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="https://github.com/Zarel/Pokemon-Showdown/pull/' +
					p1 + '" target="_blank">' + p0 + '</a>';
			});
			// client issue #pullreq
			//   Links to github Pokemon Showdown client pullreq number
			str = str.replace(/\bclient issue ?#(\d+)/ig, function (p0, p1) {
				p1 = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="https://github.com/Zarel/Pokemon-Showdown-Client/pull/' +
					p1 + '" target="_blank">' + p0 + '</a>';
			});
			// [[blah]]
			//   Short form of gl[blah]
			str = str.replace(/\[\[([^< ](?:[^<`]*?[^< ])??)\]\]/ig, function (p0, p1) {
				var q = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=' + q +
					'" target="_blank">' + p1 + '</a>';
			});
		}
		// __italics__
		str = str.replace(/\_\_([^< ](?:[^<]*?[^< ])??)\_\_(?![^<]*?<\/a)/g,
			options.hideitalics ? '$1' : '<i>$1</i>');
		// **bold**
		str = str.replace(/\*\*([^< ](?:[^<]*?[^< ])??)\*\*/g,
			options.hidebold ? '$1' : '<b>$1</b>');

		if (!options.hidespoiler) {
			var untilIndex = 0;
			while (untilIndex < str.length) {
				var spoilerIndex = str.toLowerCase().indexOf('spoiler:', untilIndex);
				if (spoilerIndex < 0) spoilerIndex = str.toLowerCase().indexOf('spoilers:', untilIndex);
				if (spoilerIndex >= 0) {
					untilIndex = str.indexOf("\n", spoilerIndex);
					if (untilIndex < 0) untilIndex = str.length;

					if (str.charAt(spoilerIndex - 1) === '(') {
						var nextLParenIndex = str.indexOf('(', spoilerIndex);
						var nextRParenIndex = str.indexOf(')', spoilerIndex);
						if (nextRParenIndex < 0 || nextRParenIndex >= untilIndex) {
							// no `)`, keep spoilering until next newline
						} else if (nextLParenIndex < 0 || nextLParenIndex > nextRParenIndex) {
							// no `(` before next `)` - spoiler until next `)`
							untilIndex = nextRParenIndex;
						} else {
							// `(` before next `)` - just spoiler until the last `)`
							untilIndex = str.lastIndexOf(')', untilIndex);
							if (untilIndex < 0) untilIndex = str.length; // should never happen
						}
					}

					var offset = spoilerIndex + 8;
					if (str.charAt(offset) === ':') offset++;
					if (str.charAt(offset) === ' ') offset++;
					str = str.slice(0, offset) + '<span class="spoiler">' + str.slice(offset, untilIndex) + '</span>' + str.slice(untilIndex);
					untilIndex += 29;
				} else {
					break;
				}
			}
		}

		return str;
	},

	escapeHTML: function (str, jsEscapeToo) {
		str = (str ? '' + str : '');
		str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		if (jsEscapeToo) str = str.replace(/'/g, '\\\'');
		return str;
	},

	unescapeHTML: function (str) {
		str = (str ? '' + str : '');
		return str.replace(/&quot;/g, '"').replace(/&gt;/g, '>').
			replace(/&lt;/g, '<').replace(/&amp;/g, '&');
	},

	escapeRegExp: function (str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	},

	escapeQuotes: function (str) {
		str = (str ? '' + str : '');
		str = str.replace(/'/g, '\\\'');
		return str;
	},

	sanitizeHTML: (function () {
		if (!('html4' in window)) {
			return function () {
				throw new Error('sanitizeHTML requires caja');
			};
		}
		// Add <marquee> and <blink> to the whitelist.
		// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee
		// for the list of attributes.
		$.extend(html4.ELEMENTS, {
			'marquee': 0,
			'blink': 0
		});
		$.extend(html4.ATTRIBS, {
			'marquee::behavior': 0,
			'marquee::bgcolor': 0,
			'marquee::direction': 0,
			'marquee::height': 0,
			'marquee::hspace': 0,
			'marquee::loop': 0,
			'marquee::scrollamount': 0,
			'marquee::scrolldelay': 0,
			'marquee::truespeed': 0,
			'marquee::vspace': 0,
			'marquee::width': 0
		});

		var uriRewriter = function (uri) {
			return uri;
		};
		var tagPolicy = function (tagName, attribs) {
			if (html4.ELEMENTS[tagName] & html4.eflags['UNSAFE']) {
				return;
			}
			var targetIdx;
			var extra = {};
			if (tagName === 'a') {
				// Special handling of <a> tags.

				for (var i = 0; i < attribs.length - 1; i += 2) {
					switch (attribs[i]) {
					case 'href':
						if (!Tools.interstice.isWhitelisted(attribs[i + 1])) {
							attribs[i + 1] = Tools.interstice.getURI(attribs[i + 1]);
						}
						break;
					case 'target':
						targetIdx = i + 1;
						break;
					case 'room':
						// Special custom attribute for linking to a room.
						// This attribute will be stripped by `sanitizeAttribs`
						// below, and is only used to signal to add an `onclick`
						// handler here.
						if (!(/^[a-z0-9\-]*$/.test(attribs[i + 1]))) {
							// Bogus roomid - could be used to inject JavaScript.
							break;
						}
						extra['onclick'] = 'return selectTab(\'' + attribs[i + 1] + '\');';
						break;
					}
				}
			}
			attribs = html.sanitizeAttribs(tagName, attribs, uriRewriter);
			if (targetIdx !== undefined) {
				attribs[targetIdx] = '_blank';
			} else {
				extra['target'] = '_blank';
			}
			for (var i in extra) {
				attribs.push(i);
				attribs.push(extra[i]);
			}
			return {attribs: attribs};
		};
		return function (input) {
			return html.sanitizeWithPolicy(input, tagPolicy);
		};
	})(),

	toggleFormatChar: function (textbox, formatChar) {
		if (!textbox.setSelectionRange) return false;

		var value = textbox.value;
		var start = textbox.selectionStart;
		var end = textbox.selectionEnd;

		// make sure start and end aren't midway through the syntax
		if (value.charAt(start) === formatChar && value.charAt(start - 1) === formatChar &&
			value.charAt(start - 2) !== formatChar) {
			start++;
		}
		if (value.charAt(end) === formatChar && value.charAt(end - 1) === formatChar &&
			value.charAt(end - 2) !== formatChar) {
			end--;
		}

		// wrap in doubled format char
		var wrap = formatChar + formatChar;
		value = value.substr(0, start) + wrap + value.substr(start, end - start) + wrap + value.substr(end);
		start += 2, end += 2;

		// prevent nesting
		var nesting = wrap + wrap;
		if (value.substr(start - 4, 4) === nesting) {
			value = value.substr(0, start - 4) + value.substr(start);
			start -= 4, end -= 4;
		} else if (start !== end && value.substr(start - 2, 4) === nesting) {
			value = value.substr(0, start - 2) + value.substr(start + 2);
			start -= 2, end -= 4;
		}
		if (value.substr(end, 4) === nesting) {
			value = value.substr(0, end) + value.substr(end + 4);
		} else if (start !== end && value.substr(end - 2, 4) === nesting) {
			value = value.substr(0, end - 2) + value.substr(end + 2);
			end -= 2;
		}

		textbox.value = value;
		textbox.setSelectionRange(start, end);
		return true;
	},

	interstice: (function () {
		var patterns = (function (whitelist) {
			var patterns = [];
			for (var i = 0; i < whitelist.length; ++i) {
				patterns.push(new RegExp('https?://([A-Za-z0-9-]*\\.)?' +
					whitelist[i] +
					'(/.*)?', 'i'));
			}
			return patterns;
		})((window.Config && Config.whitelist) ? Config.whitelist : []);
		return {
			isWhitelisted: function (uri) {
				if ((uri[0] === '/') && (uri[1] !== '/')) {
					// domain-relative URIs are safe
					return true;
				}
				for (var i = 0; i < patterns.length; ++i) {
					if (patterns[i].test(uri)) {
						return true;
					}
				}
				return false;
			},
			getURI: function (uri) {
				return 'http://pokemonshowdown.com/interstice?uri=' + encodeURIComponent(uri);
			}
		};
	})(),

	safeJSON: function (f) {
		return function (data) {
			if (data.length < 1) return;
			if (data[0] == ']') data = data.substr(1);
			return f.call(this, $.parseJSON(data));
		};
	},

	prefs: (function () {
		var localStorageEntry = 'showdown_prefs';
		var prefs = function (prop, value, save) {
			if (value === undefined) {
				// get preference
				return prefs.data[prop];
			}
			// set preference
			if (value === null) {
				delete prefs.data[prop];
			} else {
				prefs.data[prop] = value;
			}
			if (save !== false) prefs.save();
		};
		prefs.data = {};
		try {
			prefs.data = (window.localStorage &&
				$.parseJSON(localStorage.getItem(localStorageEntry))) || {};
			// outdated prefs
			delete prefs.data.nolobbypm;
		} catch (e) {}
		prefs.save = function () {
			if (!window.localStorage) return;
			try {
				localStorage.setItem(localStorageEntry, $.toJSON(this.data));
			} catch (e) {}
		};
		return prefs;
	})(),

	getEffect: function (effect) {
		if (!effect || typeof effect === 'string') {
			var name = $.trim(effect || '');
			if (name.substr(0, 5) === 'item:') {
				return Tools.getItem(name.substr(5));
			} else if (name.substr(0, 8) === 'ability:') {
				return Tools.getAbility(name.substr(8));
			} else if (name.substr(0, 5) === 'move:') {
				return Tools.getMove(name.substr(5));
			}
			var id = toId(name);
			effect = {};
			if (id && window.BattleStatuses && BattleStatuses[id]) {
				effect = BattleStatuses[id];
				effect.exists = true;
			} else if (id && window.BattleMovedex && BattleMovedex[id] && BattleMovedex[id].effect) {
				effect = BattleMovedex[id].effect;
				effect.exists = true;
			} else if (id && window.BattleAbilities && BattleAbilities[id] && BattleAbilities[id].effect) {
				effect = BattleAbilities[id].effect;
				effect.exists = true;
			} else if (id && window.BattleItems && BattleItems[id] && BattleItems[id].effect) {
				effect = BattleItems[id].effect;
				effect.exists = true;
			} else if (id && window.BattleFormats && BattleFormats[id]) {
				effect = BattleFormats[id];
				effect.exists = true;
				if (!effect.effectType) effect.effectType = 'Format';
			} else if (id === 'recoil') {
				effect = {
					effectType: 'Recoil'
				};
				effect.exists = true;
			} else if (id === 'drain') {
				effect = {
					effectType: 'Drain'
				};
				effect.exists = true;
			}
			if (!effect.id) effect.id = id;
			if (!effect.name) effect.name = Tools.escapeHTML(name);
			if (!effect.category) effect.category = 'Effect';
			if (!effect.effectType) effect.effectType = 'Effect';
		}
		return effect;
	},

	getMove: function (move) {
		if (!move || typeof move === 'string') {
			var name = $.trim(move || '');
			var id = toId(name);
			move = (window.BattleMovedex && window.BattleMovedex[id]) || {};
			if (move.name) move.exists = true;

			if (!move.exists && id.substr(0, 11) === 'hiddenpower' && id.length > 11) {
				var matches = /([a-z]*)([0-9]*)/.exec(id);
				move = (window.BattleMovedex && window.BattleMovedex[matches[1]]) || {};
				move = $.extend({}, move);
				move.basePower = matches[2];
			}

			if (!move.id) move.id = id;
			if (!move.name) move.name = Tools.escapeHTML(name);

			if (!move.critRatio) move.critRatio = 1;
			if (!move.baseType) move.baseType = move.type;
			if (!move.effectType) move.effectType = 'Move';
			if (!move.secondaries && move.secondary) move.secondaries = [move.secondary];
			if (!move.flags) move.flags = {};

			if (window.BattleMoveAnims) {
				if (!move.anim) move.anim = BattleOtherAnims.attack.anim;
				$.extend(move, BattleMoveAnims[move.id]);
			}
		}
		return move;
	},

	getItem: function (item) {
		if (!item || typeof item === 'string') {
			var name = $.trim(item || '');
			var id = toId(name);
			item = (window.BattleItems && window.BattleItems[id]) || {};
			if (item.name) item.exists = true;
			if (!item.id) item.id = id;
			if (!item.name) item.name = Tools.escapeHTML(name);
			if (!item.category) item.category = 'Effect';
			if (!item.effectType) item.effectType = 'Item';
		}
		return item;
	},

	getAbility: function (ability) {
		if (!ability || typeof ability === 'string') {
			var name = $.trim(ability || '');
			var id = toId(name);
			ability = (window.BattleAbilities && window.BattleAbilities[id]) || {};
			if (ability.name) ability.exists = true;
			if (!ability.id) ability.id = id;
			if (!ability.name) ability.name = Tools.escapeHTML(name);
			if (!ability.category) ability.category = 'Effect';
			if (!ability.effectType) ability.effectType = 'Ability';
		}
		return ability;
	},

	getTemplate: function (template) {
		if (!template || typeof template === 'string') {
			var name = template;
			var id = toId(name);
			if (window.BattleAliases && BattleAliases[id]) {
				name = BattleAliases[id];
				id = toId(name);
			}
			if (!id) name = '';
			if (!window.BattlePokedex) window.BattlePokedex = {};
			if (!window.BattlePokedex[id]) {
				template = window.BattlePokedex[id] = {};
				for (var k in baseSpeciesChart) {
					if (id.length > k.length && id.substr(0, k.length) === k) {
						template.baseSpecies = k;
						template.forme = id.substr(k.length);
					}
				}
				if (id !== 'yanmega' && id.substr(id.length - 4) === 'mega') {
					template.baseSpecies = id.substr(0, id.length - 4);
					template.forme = id.substr(id.length - 4);
				} else if (id.substr(id.length - 6) === 'primal') {
					template.baseSpecies = id.substr(0, id.length - 6);
					template.forme = id.substr(id.length - 6);
				}
				template.exists = false;
			}
			template = window.BattlePokedex[id];
			if (template.species) name = template.species;
			if (template.exists === undefined) template.exists = true;
			if (window.BattleFormatsData && window.BattleFormatsData[id]) {
				template.tier = window.BattleFormatsData[id].tier;
				template.isNonstandard = window.BattleFormatsData[id].isNonstandard;
				template.unreleasedHidden = window.BattleFormatsData[id].unreleasedHidden;
			}
			if (window.BattleLearnsets && window.BattleLearnsets[id]) {
				template.learnset = window.BattleLearnsets[id].learnset;
			}
			if (!template.id) template.id = id;
			if (!template.name) template.name = name = Tools.escapeHTML(name);
			if (!template.speciesid) template.speciesid = id;
			if (!template.species) template.species = name;
			if (!template.baseSpecies) template.baseSpecies = name;
			if (!template.forme) template.forme = '';
			if (!template.formeLetter) template.formeLetter = '';
			if (!template.formeid) {
				var formeid = '';
				if (template.baseSpecies !== name) {
					formeid = '-' + toId(template.forme);
					if (formeid === '-megax') formeid = '-mega-x';
					if (formeid === '-megay') formeid = '-mega-y';
				}
				template.formeid = formeid;
			}
			if (!template.spriteid) template.spriteid = toId(template.baseSpecies) + template.formeid;
			if (!template.effectType) template.effectType = 'Template';
		}
		return template;
	},

	getLearnset: function (template) {
		template = Tools.getTemplate(template);
		var alreadyChecked = {};
		var learnset = {};
		do {
			alreadyChecked[template.speciesid] = true;
			if (template.learnset) {
				for (var l in template.learnset) {
					learnset[l] = template.learnset[l];
				}
			}
			if (template.speciesid === 'shaymin') {
				template = Tools.getTemplate('shayminsky');
			} else if (template.baseSpecies !== template.species) {
				template = Tools.getTemplate(template.baseSpecies);
			} else {
				template = Tools.getTemplate(template.prevo);
			}
		} while (template && template.species && !alreadyChecked[template.speciesid]);
		return learnset;
	},

	getType: function (type) {
		if (!type || typeof type === 'string') {
			var id = toId(type);
			id = id.substr(0, 1).toUpperCase() + id.substr(1);
			type = (window.BattleTypeChart && window.BattleTypeChart[id]) || {};
			if (type.damageTaken) type.exists = true;
			if (!type.id) type.id = id;
			if (!type.name) type.name = id;
			if (!type.effectType) {
				type.effectType = 'Type';
			}
		}
		return type;
	},

	loadedSpriteData: {'xy':1, 'bw':0},
	loadSpriteData: function (gen) {
		if (this.loadedSpriteData[gen]) return;
		this.loadedSpriteData[gen] = 1;

		var path = $('script[src*="pokedex-mini.js"]').attr('src');
		var qs = '?' + (path.split('?')[1] || '');
		path = (path.match(/.+?(?=data\/pokedex-mini\.js)/) || [])[0] || '';

		var el = document.createElement('script');
		el.src = path + 'data/pokedex-mini-bw.js' + qs;
		document.getElementsByTagName('body')[0].appendChild(el);
	},
	getSpriteData: function (pokemon, siden, options) {
		if (!options) options = {gen: 6};
		if (!options.gen) options.gen = 6;
		pokemon = Tools.getTemplate(pokemon);
		var spriteData = {
			w: 96,
			h: 96,
			url: Tools.resourcePrefix + 'sprites/',
			isBackSprite: false,
			cryurl: '',
			shiny: pokemon.shiny
		};
		var name = pokemon.spriteid;
		var dir, isBack, facing;
		if (siden) {
			dir = '';
			facing = 'front';
		} else {
			spriteData.isBackSprite = true;
			dir = '-back';
			facing = 'back';
		}

		// Decide what gen sprites to use.
		var gen = {1:'rby', 2:'gsc', 3:'rse', 4:'dpp', 5:'bw', 6:'xy'}[options.gen];
		var genback = gen
		var genaltsprites = Tools.prefs('altsprites')
		if (Tools.prefs('nopastgens')) gen = 'xy';
		if (Tools.prefs('bwgfx') && gen === 'xy') gen = 'bw';
		if (genaltsprites.one === 'redblue' && gen === 'rby') gen = 'rby-orig';
		else if (genaltsprites.one === 'green' && gen === 'rby') gen = 'rby-gr';
		else if (genaltsprites.two === 'gold' && gen === 'gsc') {
			gen = 'gsc-g'
			genback ='gsc-g';
			} else if (genaltsprites.two === 'silver' && gen === 'gsc') {
			gen = 'gsc-s'
			genback = 'gsc-g';
			} else if (genaltsprites.three === 'frlg' && gen === 'rse') {
			gen = 'rse-frlg'
			genback = gen;
			} else if (genaltsprites.four === 'plat' && gen === 'dpp') {
			gen = 'dpp-plat'
			genback = gen;
			} else if (genaltsprites.four === 'dp' && gen === 'dpp') {
			gen = 'dpp-orig'
			genback = gen
			}

		var animationData = {};
		if (gen === 'bw' && window.BattlePokemonSpritesBW) {
			animationData = BattlePokemonSpritesBW && window.BattlePokemonSpritesBW[pokemon.speciesid];
		} else {
			animationData = BattlePokemonSprites && window.BattlePokemonSprites[pokemon.speciesid];
		}
		if (animationData) {
			var num = '' + animationData.num;
			if (num.length < 3) num = '0' + num;
			if (num.length < 3) num = '0' + num;
			spriteData.cryurl = 'audio/cries/' + num;
			if (pokemon.forme && (pokemon.forme.substr(0, 4) === 'Mega' || pokemon.forme === 'Sky' || pokemon.forme === 'Therian' || pokemon.forme === 'Black' || pokemon.forme === 'White' || pokemon.forme === 'Super')) {
				spriteData.cryurl += pokemon.formeid;
			}
			spriteData.cryurl += '.wav';
		}

		if (pokemon.shiny && options.gen > 1) dir += '-shiny';

		// April Fool's 2014
		if (window.Config && Config.server && Config.server.afd || options.afd) {
			dir = 'afd' + dir;
			spriteData.url += dir + '/' + name + '.png';
			return spriteData;
		}

		if (animationData && animationData[facing]) {
			var spriteType = '';
			if (animationData[facing]['anif'] && pokemon.gender === 'F') {
				name += '-f';
				spriteType += 'f';
			}
			if (!Tools.prefs('noanim') && gen in {'bw': 1, 'xy': 1}) {
				spriteType = 'ani' + spriteType;
				dir = gen + 'ani' + dir;

				spriteData.w = animationData[facing][spriteType].w;
				spriteData.h = animationData[facing][spriteType].h;
				spriteData.url += dir + '/' + name + '.gif';
				return spriteData;
			}
		}
		// if there is no entry or enough data in pokedex-mini.js or the animations are disabled or past gen, use the proper sprites
		gen = (gen === 'xy') ? 'bw' : gen;
		if (facing === 'back') dir = genback + dir;
		else dir = gen + dir;

		spriteData.url += dir + '/' + name + '.png';

		return spriteData;
	},

	getIcon: function (pokemon) {
		var num = 0;
		if (pokemon === 'pokeball') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/bwicons-pokeball-sheet.png) no-repeat scroll -0px -8px';
		} else if (pokemon === 'pokeball-statused') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/bwicons-pokeball-sheet.png) no-repeat scroll -32px -8px';
		} else if (pokemon === 'pokeball-none') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/bwicons-pokeball-sheet.png) no-repeat scroll -64px -8px';
		}
		var id = toId(pokemon);
		if (pokemon && pokemon.species) id = toId(pokemon.species);
		if (pokemon && pokemon.volatiles && pokemon.volatiles.formechange && !pokemon.volatiles.transform) id = toId(pokemon.volatiles.formechange[2]);
		if (pokemon && pokemon.num !== undefined) num = pokemon.num;
		else if (window.BattlePokemonSprites && BattlePokemonSprites[id] && BattlePokemonSprites[id].num) num = BattlePokemonSprites[id].num;
		else if (window.BattlePokedex && window.BattlePokedex[id] && BattlePokedex[id].num) num = BattlePokedex[id].num;
		if (num < 0) num = 0;
		if (num > 721) num = 0;
		var altNums = {
			"egg": 731,
			"rotomfan": 779,
			"rotomfrost": 780,
			"rotomheat": 781,
			"rotommow": 782,
			"rotomwash": 783,
			"giratinaorigin": 785,
			"shayminsky": 787,
			"basculinbluestriped": 789,
			"darmanitanzen": 792,
			"deoxysattack": 763,
			"deoxysdefense": 764,
			"deoxysspeed": 766,
			"wormadamsandy": 771,
			"wormadamtrash": 772,
			"cherrimsunshine": 774,
			"castformrainy": 760,
			"castformsnowy": 761,
			"castformsunny": 762,
			"meloettapirouette": 804,
			"meowsticf": 809,
			"floetteeternalflower": 810,
			"tornadustherian": 816,
			"thundurustherian": 817,
			"landorustherian": 818,
			"kyuremblack": 819,
			"kyuremwhite": 820,
			"keldeoresolute": 821,
			"venusaurmega": 864,
			"charizardmegax": 865,
			"charizardmegay": 866,
			"blastoisemega": 867,
			"alakazammega": 868,
			"gengarmega": 869,
			"kangaskhanmega": 870,
			"pinsirmega": 871,
			"gyaradosmega": 872,
			"aerodactylmega": 873,
			"mewtwomegax": 874,
			"mewtwomegay": 875,
			"ampharosmega": 876,
			"scizormega": 877,
			"heracrossmega": 878,
			"houndoommega": 879,
			"tyranitarmega": 880,
			"blazikenmega": 881,
			"gardevoirmega": 882,
			"mawilemega": 883,
			"aggronmega": 884,
			"medichammega": 885,
			"manectricmega": 886,
			"banettemega": 887,
			"absolmega": 888,
			"garchompmega": 889,
			"lucariomega": 890,
			"abomasnowmega": 891,
			"latiasmega": 892,
			"latiosmega": 893,
			"beedrillmega": 896,
			"pidgeotmega": 897,
			"slowbromega": 898,
			"steelixmega": 899,
			"sceptilemega": 900,
			"swampertmega": 901,
			"sableyemega": 902,
			"sharpedomega": 903,
			"cameruptmega": 904,
			"altariamega": 905,
			"glaliemega": 906,
			"salamencemega": 907,
			"metagrossmega": 908,
			"kyogreprimal": 909,
			"groudonprimal": 910,
			"rayquazamega": 911,
			"lopunnymega": 912,
			"gallademega": 913,
			"audinomega": 914,
			"dianciemega": 915,
			"hoopaunbound": 916,
			"syclant": 832 + 0,
			"revenankh": 832 + 1,
			"pyroak": 832 + 2,
			"fidgit": 832 + 3,
			"stratagem": 832 + 4,
			"arghonaut": 832 + 5,
			"kitsunoh": 832 + 6,
			"cyclohm": 832 + 7,
			"colossoil": 832 + 8,
			"krilowatt": 832 + 9,
			"voodoom": 832 + 10,
			"tomohawk": 832 + 11,
			"necturna": 832 + 12,
			"mollux": 832 + 13,
			"aurumoth": 832 + 14,
			"malaconda": 832 + 15,
			"cawmodore": 832 + 16,
			"volkraken": 832 + 17,
			"plasmanta": 832 + 18,
			"naviathan": 832 + 19
		};
		if (altNums[id]) {
			num = altNums[id];
		}
		if (pokemon && pokemon.gender === 'F') {
			if (id === 'unfezant') num = 788;
			else if (id === 'frillish') num = 801;
			else if (id === 'jellicent') num = 802;
			else if (id === 'meowstic') num = 809;
		}

		var top = 8 + Math.floor(num / 16) * 32;
		var left = (num % 16) * 32;
		var fainted = (pokemon && pokemon.fainted ? ';opacity:.4' : '');
		return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/bwicons-sheet.png?g6) no-repeat scroll -' + left + 'px -' + top + 'px' + fainted;
	},

	getTeambuilderSprite: function (pokemon) {
		if (!pokemon) return '';
		var id = toId(pokemon);
		if (pokemon.spriteid) id = pokemon.spriteid;
		if (pokemon.species && !id) {
			var template = Tools.getTemplate(pokemon.species);
			if (template.spriteid) {
				id = template.spriteid;
			} else {
				id = toId(pokemon.species);
			}
		}
		if (Tools.getTemplate(pokemon.species).exists === false) {
			return 'background-image:url(' + Tools.resourcePrefix + 'sprites/bw/0.png)';
		}
		var shiny = (pokemon.shiny ? '-shiny' : '');
		if (BattlePokemonSprites && BattlePokemonSprites[id] && BattlePokemonSprites[id].front && BattlePokemonSprites[id].front.anif && pokemon.gender === 'F') {
			id += '-f';
		}
		return 'background-image:url(' + Tools.resourcePrefix + 'sprites/bw' + shiny + '/' + id + '.png)';
	},

	getItemIcon: function (item) {
		var num = 0;
		if (typeof item === 'string' && exports.BattleItems) item = exports.BattleItems[toId(item)];
		if (item && item.spritenum) num = item.spritenum;

		var top = Math.floor(num / 16) * 24;
		var left = (num % 16) * 24;
		return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/itemicons-sheet.png) no-repeat scroll -' + left + 'px -' + top + 'px';
	},

	getTypeIcon: function (type, b) { // b is just for utilichart.js
		if (!type) return '';
		var sanitizedType = type.replace(/\?/g, '%3f');
		return '<img src="' + Tools.resourcePrefix + 'sprites/types/' + sanitizedType + '.png" alt="' + type + '" height="14" width="32"' + (b ? ' class="b"' : '') + ' />';
	}
};
