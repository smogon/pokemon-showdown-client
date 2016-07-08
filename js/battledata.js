/*

License: MIT License
  <https://github.com/Zarel/Pokemon-Showdown/blob/master/LICENSE>

*/

if (!window.exports) window.exports = window;

if (window.soundManager) {
	soundManager.setup({url:'https://play.pokemonshowdown.com/swf/'});
	if (window.Replays) soundManager.onready(window.Replays.soundReady);
}

window.nodewebkit = false;
if (typeof process !== 'undefined' && process.versions && process.versions['node-webkit']) window.nodewebkit = true;

/* eslint-disable */
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
/* eslint-enable */

var colorCache = {};

function hashColor(name) {
	if (colorCache[name]) return colorCache[name];
	var hash;
	if (window.Config && Config.customcolors && Config.customcolors[name]) {
		if (Config.customcolors[name].color) {
			return (colorCache[name] = 'color:' + Config.customcolors[name].color + ';');
		}
		hash = MD5(Config.customcolors[name]);
	} else {
		hash = MD5(name);
	}
	var H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
	var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49

	var C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
	var X = C * (1 - Math.abs((H / 60) % 2 - 1));
	var m = L / 100 - C / 2;

	var R1, G1, B1;
	switch (Math.floor(H / 60)) {
	case 1: R1 = X; G1 = C; B1 = 0; break;
	case 2: R1 = 0; G1 = C; B1 = X; break;
	case 3: R1 = 0; G1 = X; B1 = C; break;
	case 4: R1 = X; G1 = 0; B1 = C; break;
	case 5: R1 = C; G1 = 0; B1 = X; break;
	case 0: default: R1 = C; G1 = X; B1 = 0; break;
	}
	var lum = (R1 + m) * 0.2126 + (G1 + m) * 0.7152 + (B1 + m) * 0.0722; // 0.05 (dark blue) to 0.93 (yellow)

	var HLmod = (lum - 0.5) * -100; // -43 (yellow) to 45 (dark blue)
	if (HLmod > 12) HLmod -= 12;
	else if (HLmod < -10) HLmod = (HLmod + 10) * 2 / 3;
	else HLmod = 0;

	L += HLmod;

	var Smod = 10 - Math.abs(50 - L);
	if (HLmod > 15) Smod += (HLmod - 15) / 2;
	S -= Smod;

	colorCache[name] = "color:hsl(" + H + "," + S + "%," + L + "%);";
	return colorCache[name];
}

function getString(str) {
	if (typeof str === 'string' || typeof str === 'number') return '' + str;
	return '';
}

function toId(text) {
	if (text && text.id) {
		text = text.id;
	} else if (text && text.userid) {
		text = text.userid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toUserid(text) {
	return toId(text);
}

function toName(name) {
	if (typeof name !== 'string' && typeof name !== 'number') return '';
	name = ('' + name).replace(/[\|\s\[\]\,\u202e]+/g, ' ').trim();
	if (name.length > 18) name = name.substr(0, 18).trim();

	// remove zalgo
	name = name.replace(/[\u0300-\u036f\u0483-\u0489\u0610-\u0615\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06ED\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]{3,}/g, '');
	name = name.replace(/[\u239b-\u23b9]/g, '');

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
	'pikachu': 1,
	'pichu': 1,
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
	'shaymin': 1,
	'arceus': 1,
	'basculin': 1,
	'darmanitan': 1,
	'deerling': 1,
	'sawsbuck': 1,
	'tornadus': 1,
	'thundurus': 1,
	'landorus': 1,
	'kyurem': 1,
	'keldeo': 1,
	'meloetta': 1,
	'genesect': 1,
	'vivillon': 1,
	'flabebe': 1,
	'floette': 1,
	'florges': 1,
	'furfrou': 1,
	'aegislash': 1,
	'pumpkaboo': 1,
	'gourgeist': 1,
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
		if (document.location.protocol === 'file:') prefix = 'https:';
		return prefix + '//play.pokemonshowdown.com/';
	})(),

	fxPrefix: (function () {
		if (document.location.protocol === 'file:') {
			if (window.Replays) return 'https://play.pokemonshowdown.com/fx/';
			return 'fx/';
		}
		return '//play.pokemonshowdown.com/fx/';
	})(),

	/*
	 * Load trackers are loosely based on Promises, but very simplified.
	 * Trackers are made with: var tracker = Tools.makeLoadTracker();
	 * Pass callbacks like so: tracker(callback)
	 * When tracker.load() is called, all callbacks are run.
	 * If tracker.load() has already been called, tracker(callback) will
	 * call the callback instantly.
	 */
	makeLoadTracker: function () {
		var tracker = function (callback, context) {
			if (tracker.isLoaded) {
				callback.call(context, tracker.value);
			} else {
				tracker.callbacks.push([callback, context]);
			}
			return tracker;
		};
		tracker.callbacks = [];
		tracker.value = undefined;
		tracker.isLoaded = false;
		tracker.load = function (value) {
			if (tracker.isLoaded) return;
			tracker.isLoaded = true;
			tracker.value = value;
			for (var i = 0; i < tracker.callbacks.length; i++) {
				tracker.callbacks[i][0].call(tracker.callbacks[i][1], value);
			}
		};
		tracker.unload = function () {
			if (!tracker.isLoaded) return;
			tracker.isLoaded = false;
		};
		return tracker;
	},

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
				'/avatars/' + _.map(avatar.split('?', 2), encodeURIComponent).join('?');
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
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(' ' + target).slice(1) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + ' <i>' + Tools.parseMessage(' ' + target).slice(1) + '</i></em></div>';
		case 'mee':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(' ' + target).slice(1) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + Tools.parseMessage(' ' + target).slice(1) + '</i></em></div>';
		case 'invite':
			var roomid = toRoomid(target);
			return [
				'<div class="chat">' + timestamp + '<em>' + clickableName + ' invited you to join the room "' + roomid + '"</em></div>',
				'<div class="notice"><button name="joinRoom" value="' + roomid + '">Join ' + roomid + '</button></div>'
			];
		case 'announce':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + Tools.parseMessage(target) + '</span></div>';
		case 'data-pokemon':
			var buf = '<li class="result">';
			var template = Tools.getTemplate(target);
			if (!template.abilities || !template.baseStats) return '[not supported in replays]';
			buf += '<span class="col numcol">' + (template.tier || Tools.getTemplate(template.baseSpecies).tier) + '</span> ';
			buf += '<span class="col iconcol"><span style="' + Tools.getPokemonIcon(template) + '"></span></span> ';
			buf += '<span class="col pokemonnamecol" style="white-space:nowrap"><a href="https://pokemonshowdown.com/dex/pokemon/' + template.id + '" target="_blank">' + template.species + '</a></span> ';
			buf += '<span class="col typecol">';
			if (template.types) for (var i = 0; i < template.types.length; i++) {
				buf += Tools.getTypeIcon(template.types[i]);
			}
			buf += '</span> ';
			buf += '<span style="float:left;min-height:26px">';
			if (template.abilities['1']) {
				buf += '<span class="col twoabilitycol">';
			} else {
				buf += '<span class="col abilitycol">';
			}
			for (var i in template.abilities) {
				var ability = template.abilities[i];
				if (!ability) continue;

				if (i === '1') buf += '<br />';
				if (i == 'H') {
					ability = '</span><span class="col abilitycol"><em>' + (template.unreleasedHidden ? '<s>' + ability + '</s>' : ability) + '</em>';
				}
				buf += ability;
			}
			if (!template.abilities['H']) buf += '</span><span class="col abilitycol">';
			buf += '</span>';
			buf += '</span>';
			buf += '<span style="float:left;min-height:26px">';
			buf += '<span class="col statcol"><em>HP</em><br />' + template.baseStats.hp + '</span> ';
			buf += '<span class="col statcol"><em>Atk</em><br />' + template.baseStats.atk + '</span> ';
			buf += '<span class="col statcol"><em>Def</em><br />' + template.baseStats.def + '</span> ';
			buf += '<span class="col statcol"><em>SpA</em><br />' + template.baseStats.spa + '</span> ';
			buf += '<span class="col statcol"><em>SpD</em><br />' + template.baseStats.spd + '</span> ';
			buf += '<span class="col statcol"><em>Spe</em><br />' + template.baseStats.spe + '</span> ';
			var bst = 0;
			for (i in template.baseStats) bst += template.baseStats[i];
			buf += '<span class="col bstcol"><em>BST<br />' + bst + '</em></span> ';
			buf += '</span>';
			buf += '</li>';
			return '<div class="message"><ul class="utilichart">' + buf + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-item':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderItemRow(Tools.getItem(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-ability':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderAbilityRow(Tools.getAbility(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-move':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderMoveRow(Tools.getMove(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'text':
			return '<div class="chat">' + Tools.escapeHTML(target) + '</div>';
		case 'error':
			return '<div class="chat message-error">' + Tools.escapeHTML(target) + '</div>';
		case 'html':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + Tools.sanitizeHTML(target) + '</em></div>';
		case 'raw':
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
		if (str.substr(0, 9) === '&gt;&gt; ' || str.substr(0, 13) === '&gt;&gt;&gt; ') return str;
		// Don't format console results (<<).
		if (str.substr(0, 9) === '&lt;&lt; ') return str;

		var options = Tools.prefs('chatformatting') || {};

		// ``code``
		str = str.replace(/\`\`([^< ](?:[^<`]*?[^< ])??)\`\`/g,
			options.hidemonospace ? '$1' : '<code>$1</code>');
		// ~~strikethrough~~
		str = str.replace(/\~\~([^< ](?:[^<]*?[^< ])??)\~\~/g,
			options.hidestrikethrough ? '$1' : '<s>$1</s>');
		// __italics__
		str = str.replace(/\_\_([^< ](?:[^<]*?[^< ])??)\_\_/g,
			options.hideitalics ? '$1' : '<i>$1</i>');
		// **bold**
		str = str.replace(/\*\*([^< ](?:[^<]*?[^< ])??)\*\*/g,
			options.hidebold ? '$1' : '<b>$1</b>');
		// ^^superscript^^
		str = str.replace(/\^\^([^< ](?:[^<]*?[^< ])??)\^\^/g,
			options.hidesuperscript ? '$1' : '<sup>$1</sup>');
		// <<roomid>>
		str = str.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g,
			options.hidelinks ? '&laquo;$1&raquo;' : '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;');
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
					if (Tools.interstice.isWhitelisted(fulluri) || options.hideinterstice) {
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
					'" target="_blank" onclick="' + onclick + '" rel="noopener">' + uri + '</a>';
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
			str = str.replace(/\[\[([^< ](?:[^<`]*?[^< ])??)\]\]/g, function (p0, p1) {
				var q = Tools.escapeHTML(encodeURIComponent(Tools.unescapeHTML(p1)));
				return '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=' + q +
					'" target="_blank">' + p1 + '</a>';
			});
		}

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

		if (!options.hidegreentext && str.slice(0, 4) === '&gt;') {
			// greentext aka meme arrows
			if (str.charAt(4) !== '.' && str.charAt(4) !== '_' && str.charAt(4) !== '/' && str.charAt(4) !== '=' && str.charAt(4) !== ':' && str.charAt(4) !== ';' && str.substr(4, 5) !== 'w&lt;' && str.substr(4, 5) !== 'w&gt;') {
				str = '<span class="greentext">' + str + '</span>';
			}
		}

		return str;
	},

	escapeHTML: function (str, jsEscapeToo) {
		str = getString(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		if (jsEscapeToo) str = str.replace(/'/g, '\\\'');
		return str;
	},

	unescapeHTML: function (str) {
		str = (str ? '' + str : '');
		return str.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
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
			var targetIdx, srcIdx;
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
					}
				}
			}
			var dataUri = '';
			if (tagName === 'img') {
				for (var i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === 'src' && attribs[i + 1].substr(0, 11) === 'data:image/') {
						srcIdx = i;
						dataUri = attribs[i + 1];
					}
					if (attribs[i] === 'src' && attribs[i + 1].substr(0, 2) === '//') {
						if (location.protocol !== 'http:' && location.protocol !== 'https:') {
							attribs[i + 1] = 'http:' + attribs[i + 1];
						}
					}
				}
			}
			attribs = html.sanitizeAttribs(tagName, attribs, uriRewriter);
			if (dataUri && tagName === 'img') {
				attribs[srcIdx + 1] = dataUri;
			}
			if (tagName === 'a' || tagName === 'form') {
				if (targetIdx !== undefined) {
					attribs[targetIdx] = '_blank';
				} else {
					attribs.push('target');
					attribs.push('_blank');
				}
			}
			return {attribs: attribs};
		};
		return function (input) {
			return html.sanitizeWithPolicy(getString(input), tagPolicy);
		};
	})(),

	interstice: (function () {
		var patterns = (function (whitelist) {
			var patterns = [];
			for (var i = 0; i < whitelist.length; ++i) {
				patterns.push(new RegExp('^(https?:)?//([A-Za-z0-9-]*\\.)?' +
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

	prefs: function (prop, value, save) {
		if (window.Storage && Storage.prefs) return Storage.prefs(prop, value, save);
		return undefined;
	},

	getShortName: function (name) {
		var shortName = name.replace(/[^A-Za-z0-9]+$/, '');
		if (shortName.indexOf('(') >= 0) {
			shortName += name.slice(shortName.length).replace(/[^\(\)]+/g, '').replace(/\(\)/g, '');
		}
		return shortName;
	},

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
			if (!move.exists && id.substr(0, 6) === 'return' && id.length > 6) {
				move = (window.BattleMovedex && window.BattleMovedex['return']) || {};
				move = $.extend({}, move);
				move.basePower = id.slice(6);
			}
			if (!move.exists && id.substr(0, 11) === 'frustration' && id.length > 11) {
				move = (window.BattleMovedex && window.BattleMovedex['frustration']) || {};
				move = $.extend({}, move);
				move.basePower = id.slice(11);
			}

			if (!move.id) move.id = id;
			if (!move.name) move.name = Tools.escapeHTML(name);

			if (!move.critRatio) move.critRatio = 1;
			if (!move.baseType) move.baseType = move.type;
			if (!move.effectType) move.effectType = 'Move';
			if (!move.secondaries && move.secondary) move.secondaries = [move.secondary];
			if (!move.flags) move.flags = {};
			if (!move.gen) {
				if (move.num >= 560) {
					move.gen = 6;
				} else if (move.num >= 468) {
					move.gen = 5;
				} else if (move.num >= 355) {
					move.gen = 4;
				} else if (move.num >= 252) {
					move.gen = 3;
				} else if (move.num >= 166) {
					move.gen = 2;
				} else if (move.num >= 1) {
					move.gen = 1;
				} else {
					move.gen = 0;
				}
			}

			if (window.BattleMoveAnims) {
				if (!move.anim) move.anim = BattleOtherAnims.attack.anim;
				$.extend(move, BattleMoveAnims[move.id]);
			}
		}
		return move;
	},

	getCategory: function (move, gen, type) {
		if (gen <= 3 && move.category !== 'Status') {
			return ((type || move.type) in {Fire:1, Water:1, Grass:1, Electric:1, Ice:1, Psychic:1, Dark:1, Dragon:1} ? 'Special' : 'Physical');
		}
		return move.category;
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
			if (!item.gen) {
				if (item.num >= 577) {
					item.gen = 6;
				} else if (item.num >= 537) {
					item.gen = 5;
				} else if (item.num >= 377) {
					item.gen = 4;
				} else {
					item.gen = 3;
				}
			}
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
			if (!ability.gen) {
				if (ability.num >= 165) {
					ability.gen = 6;
				} else if (ability.num >= 124) {
					ability.gen = 5;
				} else if (ability.num >= 77) {
					ability.gen = 4;
				} else if (ability.num >= 1) {
					ability.gen = 3;
				} else {
					ability.gen = 0;
				}
			}
		}
		return ability;
	},

	getTemplate: function (template) {
		if (!template || typeof template === 'string') {
			var name = template;
			var id = toId(name);
			var speciesid = id;
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
			if (!template.gen) {
				if (template.forme && template.forme in {'Mega':1, 'Mega-X':1, 'Mega-Y':1}) {
					template.gen = 6;
					template.isMega = true;
					template.battleOnly = true;
				} else if (template.forme === 'Primal') {
					template.gen = 6;
					template.isPrimal = true;
					template.battleOnly = true;
				} else if (template.num >= 650) {
					template.gen = 6;
				} else if (template.num >= 494) {
					template.gen = 5;
				} else if (template.num >= 387) {
					template.gen = 4;
				} else if (template.num >= 252) {
					template.gen = 3;
				} else if (template.num >= 152) {
					template.gen = 2;
				} else if (template.num >= 1) {
					template.gen = 1;
				} else {
					template.gen = 0;
				}
			}
			if (template.otherForms && template.otherForms.indexOf(speciesid) >= 0) {
				if (!window.BattlePokedexAltForms) window.BattlePokedexAltForms = {};
				if (!window.BattlePokedexAltForms[speciesid]) {
					template = window.BattlePokedexAltForms[speciesid] = $.extend({}, template);
					var form = speciesid.slice(template.baseSpecies.length);
					var formid = '-' + form;
					form = form[0].toUpperCase() + form.slice(1);
					template.form = form;
					template.species = template.baseSpecies + (form ? '-' + form : '');
					template.speciesid = toId(template.species);
					template.spriteid = toId(template.baseSpecies) + formid;
				}
				template = window.BattlePokedexAltForms[speciesid];
			}
		}
		return template;
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
		var gen = {1:'rby', 2:'gsc', 3:'rse', 4:'dpp', 5:'bw', 6:'xy'}[Math.max(options.gen, pokemon.gen)];
		if (Tools.prefs('nopastgens')) gen = 'xy';
		if (Tools.prefs('bwgfx') && gen === 'xy') gen = 'bw';

		var gen6animationData = null;
		if (window.BattlePokemonSprites) {
			gen6animationData = BattlePokemonSprites[pokemon.speciesid];
		}
		var animationData = gen6animationData;
		if (gen === 'bw' && window.BattlePokemonSpritesBW) {
			animationData = BattlePokemonSpritesBW[pokemon.speciesid];
		}
		if (!gen6animationData) gen6animationData = {};
		if (!animationData) animationData = {};

		if (typeof animationData.num !== 'undefined') {
			var num = '' + animationData.num;
			if (num.length < 3) num = '0' + num;
			if (num.length < 3) num = '0' + num;
			spriteData.cryurl = 'audio/cries/' + num;
			if (pokemon.isMega || pokemon.forme && (pokemon.forme === 'Sky' || pokemon.forme === 'Therian' || pokemon.forme === 'Black' || pokemon.forme === 'White' || pokemon.forme === 'Super')) {
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

		if (animationData[facing]) {
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
		} else if (gen6animationData[facing] && gen6animationData[facing]['anif'] && pokemon.gender === 'F') {
			name += '-f';
			spriteType += 'f';
		}

		// There is no entry or enough data in pokedex-mini.js
		// Handle these in case-by-case basis; either using BW sprites or matching the played gen.
		if (pokemon.speciesid !== 'substitute') {
			if (pokemon.tier === 'CAP') gen = 'bw';
			if (gen === 'xy') gen = 'bw';
		}
		dir = gen + dir;

		spriteData.url += dir + '/' + name + '.png';

		return spriteData;
	},

	getPokemonIcon: function (pokemon, facingLeft) {
		return this.getIcon(pokemon, true, facingLeft);
	},
	getIcon: function (pokemon, newSize, facingLeft) {
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
			"deerlingautumn": 793,
			"deerlingsummer": 795,
			"deerlingwinter": 796,
			"sawsbuckautumn": 797,
			"sawsbucksummer": 799,
			"sawsbuckwinter": 800,
			"burmysandy": 768,
			"burmytrash": 769,
			"wormadamsandy": 771,
			"wormadamtrash": 772,
			"cherrimsunshine": 774,
			"shelloseast": 775,
			"gastrodoneast": 777,
			"castformrainy": 760,
			"castformsnowy": 761,
			"castformsunny": 762,
			"meloettapirouette": 804,
			"meowsticf": 809,
			"floetteeternal": 810,
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
			"naviathan": 832 + 19,
			"crucibelle": 832 + 20,
			"crucibellemega": 832 + 21
		};

		if (altNums[id]) {
			num = altNums[id];
		}
		var newAltNums = {
			pikachubelle: 732 + 2,
			pikachulibre: 732 + 3,
			pikachuphd: 732 + 4,
			pikachupopstar: 732 + 5,
			pikachurockstar: 732 + 6,
			pikachucosplay: 732 + 7,
			castformrainy: 732 + 35,
			castformsnowy: 732 + 36,
			castformsunny: 732 + 37,
			deoxysattack: 732 + 38,
			deoxysdefense: 732 + 39,
			deoxysspeed: 732 + 40,
			burmysandy: 732 + 41,
			burmytrash: 732 + 42,
			wormadamsandy: 732 + 43,
			wormadamtrash: 732 + 44,
			cherrimsunshine: 732 + 45,
			shelloseast: 732 + 46,
			gastrodoneast: 732 + 47,
			rotomfan: 732 + 48,
			rotomfrost: 732 + 49,
			rotomheat: 732 + 50,
			rotommow: 732 + 51,
			rotomwash: 732 + 52,
			giratinaorigin: 732 + 53,
			shayminsky: 732 + 54,
			unfezantf: 732 + 55,
			basculinbluestriped: 732 + 56,
			darmanitanzen: 732 + 57,
			deerlingautumn: 732 + 58,
			deerlingsummer: 732 + 59,
			deerlingwinter: 732 + 60,
			sawsbuckautumn: 732 + 61,
			sawsbucksummer: 732 + 62,
			sawsbuckwinter: 732 + 63,
			frillishf: 732 + 64,
			jellicentf: 732 + 65,
			tornadustherian: 732 + 66,
			thundurustherian: 732 + 67,
			landorustherian: 732 + 68,
			kyuremblack: 732 + 69,
			kyuremwhite: 732 + 70,
			keldeoresolute: 732 + 71,
			meloettapirouette: 732 + 72,
			vivillonarchipelago: 732 + 73,
			vivilloncontinental: 732 + 74,
			vivillonelegant: 732 + 75,
			vivillonfancy: 732 + 76,
			vivillongarden: 732 + 77,
			vivillonhighplains: 732 + 78,
			vivillonicysnow: 732 + 79,
			vivillonjungle: 732 + 80,
			vivillonmarine: 732 + 81,
			vivillonmodern: 732 + 82,
			vivillonmonsoon: 732 + 83,
			vivillonocean: 732 + 84,
			vivillonpokeball: 732 + 85,
			vivillonpolar: 732 + 86,
			vivillonriver: 732 + 87,
			vivillonsandstorm: 732 + 88,
			vivillonsavanna: 732 + 89,
			vivillonsun: 732 + 90,
			vivillontundra: 732 + 91,
			pyroarf: 732 + 92,
			flabebeblue: 732 + 93,
			flabebeorange: 732 + 94,
			flabebewhite: 732 + 95,
			flabebeyellow: 732 + 96,
			floetteblue: 732 + 97,
			floetteeternal: 732 + 98,
			floetteorange: 732 + 99,
			floettewhite: 732 + 100,
			floetteyellow: 732 + 101,
			florgesblue: 732 + 102,
			florgesorange: 732 + 103,
			florgeswhite: 732 + 104,
			florgesyellow: 732 + 105,
			meowsticf: 732 + 115,
			aegislashblade: 732 + 116,
			hoopaunbound: 732 + 118,

			venusaurmega: 852 + 0,
			charizardmegax: 852 + 1,
			charizardmegay: 852 + 2,
			blastoisemega: 852 + 3,
			beedrillmega: 852 + 4,
			pidgeotmega: 852 + 5,
			alakazammega: 852 + 6,
			slowbromega: 852 + 7,
			gengarmega: 852 + 8,
			kangaskhanmega: 852 + 9,
			pinsirmega: 852 + 10,
			gyaradosmega: 852 + 11,
			aerodactylmega: 852 + 12,
			mewtwomegax: 852 + 13,
			mewtwomegay: 852 + 14,
			ampharosmega: 852 + 15,
			steelixmega: 852 + 16,
			scizormega: 852 + 17,
			heracrossmega: 852 + 18,
			houndoommega: 852 + 19,
			tyranitarmega: 852 + 20,
			sceptilemega: 852 + 21,
			blazikenmega: 852 + 22,
			swampertmega: 852 + 23,
			gardevoirmega: 852 + 24,
			sableyemega: 852 + 25,
			mawilemega: 852 + 26,
			aggronmega: 852 + 27,
			medichammega: 852 + 28,
			manectricmega: 852 + 29,
			sharpedomega: 852 + 30,
			cameruptmega: 852 + 31,
			altariamega: 852 + 32,
			banettemega: 852 + 33,
			absolmega: 852 + 34,
			glaliemega: 852 + 35,
			salamencemega: 852 + 36,
			metagrossmega: 852 + 37,
			latiasmega: 852 + 38,
			latiosmega: 852 + 39,
			kyogreprimal: 852 + 40,
			groudonprimal: 852 + 41,
			rayquazamega: 852 + 42,
			lopunnymega: 852 + 43,
			garchompmega: 852 + 44,
			lucariomega: 852 + 45,
			abomasnowmega: 852 + 46,
			gallademega: 852 + 47,
			audinomega: 852 + 48,
			dianciemega: 852 + 49
		};
		if (newSize) {
			if (newAltNums[id]) num = newAltNums[id];
			else if (num >= 832 && num < 864) num = num - 832 + 996; // CAP
		}

		if (pokemon && pokemon.gender === 'F') {
			if (newSize) {
				if (id === 'unfezant' || id === 'frillish' || id === 'jellicent' || id === 'meowstic' || id === 'pyroar') {
					num = newAltNums[id + 'f'];
				}
			} else {
				if (id === 'unfezant') num = 788;
				else if (id === 'frillish') num = 801;
				else if (id === 'jellicent') num = 802;
				else if (id === 'meowstic') num = 809;
			}
		}

		if (facingLeft) {
			newAltNums = {
				pikachubelle: 912 + 0,
				pikachupopstar: 912 + 1,
				clefairy: 912 + 2,
				clefable: 912 + 3,
				jigglypuff: 912 + 4,
				wigglytuff: 912 + 5,
				poliwhirl: 912 + 6,
				poliwrath: 912 + 7,
				kingler: 912 + 8,
				croconaw: 912 + 9,
				cleffa: 912 + 10,
				igglybuff: 912 + 11,
				politoed: 912 + 12,
				// unown gap
				sneasel: 912 + 33,
				teddiursa: 912 + 34,
				roserade: 912 + 35,
				zangoose: 912 + 36,
				seviper: 912 + 37,
				castformrainy: 912 + 38,
				absolmega: 912 + 39,
				absol: 912 + 40,
				regirock: 912 + 41,
				torterra: 912 + 42,
				budew: 912 + 43,
				roselia: 912 + 44,
				magmortar: 912 + 45,
				togekiss: 912 + 46,
				rotomwash: 912 + 47,
				shayminsky: 912 + 48,
				emboar: 912 + 49,
				pansear: 912 + 50,
				simisear: 912 + 51,
				drilbur: 912 + 52,
				excadrill: 912 + 53,
				sawk: 912 + 54,
				lilligant: 912 + 55,
				garbodor: 912 + 56,
				solosis: 912 + 57,
				vanilluxe: 912 + 58,
				amoonguss: 912 + 59,
				klink: 912 + 60,
				klang: 912 + 61,
				klinklang: 912 + 62,
				litwick: 912 + 63,
				golett: 912 + 64,
				golurk: 912 + 65,
				kyuremblack: 912 + 66,
				kyuremwhite: 912 + 67,
				kyurem: 912 + 68,
				keldeoresolute: 912 + 69,
				meloetta: 912 + 70,
				greninja: 912 + 71,
				// furfroudebutante: 912 + 72,
				barbaracle: 912 + 73,
				clauncher: 912 + 74,
				clawitzer: 912 + 75,
				sylveon: 912 + 76,
				klefki: 912 + 77,
				zygarde: 912 + 78
			};
			if (newAltNums[id]) {
				num = newAltNums[id];
			}
		}

		var top;
		var left;
		if (newSize) {
			 top = Math.floor(num / 12) * 30;
			 left = (num % 12) * 40;
		} else {
			 top = 8 + Math.floor(num / 16) * 32;
			 left = (num % 16) * 32;
		}
		var fainted = (pokemon && pokemon.fainted ? ';opacity:.4' : '');
		return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/' + (newSize ? 'xyicons-sheet.png?a1' : 'bwicons-sheet.png?g6') + ') no-repeat scroll -' + left + 'px -' + top + 'px' + fainted;
	},

	getTeambuilderSprite: function (pokemon, gen) {
		if (!pokemon) return '';
		var id = toId(pokemon.species);
		var spriteid = pokemon.spriteid;
		var template = Tools.getTemplate(pokemon.species);
		if (pokemon.species && !spriteid) {
			if (template.spriteid) {
				spriteid = template.spriteid;
			} else {
				spriteid = toId(pokemon.species);
			}
		}
		if (Tools.getTemplate(pokemon.species).exists === false) {
			return 'background-image:url(' + Tools.resourcePrefix + 'sprites/bw/0.png);background-position:10px 5px;background-repeat:no-repeat';
		}
		var shiny = (pokemon.shiny ? '-shiny' : '');
		// var sdata;
		// if (BattlePokemonSprites[id] && BattlePokemonSprites[id].front && !Tools.prefs('bwgfx')) {
		// 	if (BattlePokemonSprites[id].front.anif && pokemon.gender === 'F') {
		// 		spriteid += '-f';
		// 		sdata = BattlePokemonSprites[id].front.anif;
		// 	} else {
		// 		sdata = BattlePokemonSprites[id].front.ani;
		// 	}
		// } else {
		// 	return 'background-image:url(' + Tools.resourcePrefix + 'sprites/bw' + shiny + '/' + spriteid + '.png);background-position:10px 5px;background-repeat:no-repeat';
		// }
		if (Tools.prefs('nopastgens')) gen = 6;
		if ((!gen || gen === 6) && !template.isNonstandard && !Tools.prefs('bwgfx')) {
			var offset = '-2px -3px';
			if (id.substr(0, 6) === 'arceus') offset = '-2px 7px';
			if (id === 'garchomp') offset = '-2px 2px';
			if (id === 'garchompmega') offset = '-2px 0px';
			return 'background-image:url(' + Tools.resourcePrefix + 'sprites/xydex' + shiny + '/' + spriteid + '.png);background-position:' + offset + ';background-repeat:no-repeat';
		}
		var spriteDir = Tools.resourcePrefix + 'sprites/bw';
		if (gen <= 1 && template.gen <= 1) spriteDir = Tools.resourcePrefix + 'sprites/rby';
		else if (gen <= 2 && template.gen <= 2) spriteDir = Tools.resourcePrefix + 'sprites/gsc';
		else if (gen <= 3 && template.gen <= 3) spriteDir = Tools.resourcePrefix + 'sprites/rse';
		else if (gen <= 4 && template.gen <= 4) spriteDir = Tools.resourcePrefix + 'sprites/dpp';
		return 'background-image:url(' + spriteDir + shiny + '/' + spriteid + '.png);background-position:10px 5px;background-repeat:no-repeat';
		// var w = Math.round(57 - sdata.w / 2), h = Math.round(57 - sdata.h / 2);
		// if (id === 'altariamega' || id === 'dianciemega' || id === 'charizardmegay') h += 15;
		// if (id === 'gliscor' || id === 'gardevoirmega' || id === 'garchomp' || id === 'garchompmega' || id === 'lugia' || id === 'golurk') h += 8;
		// if (id === 'manectricmega') h -= 8;
		// if (id === 'giratinaorigin' || id === 'steelixmega') h -= 15;
		// if (id === 'lugia' || id === 'latiosmega' || id === 'latias' || id === 'garchompmega' || id === 'kyuremwhite') w += 8;
		// if (id === 'rayquazamega' || id === 'giratinaorigin' || id === 'wailord' || id === 'latiasmega') w += 15;
		// return 'background-image:url(' + Tools.resourcePrefix + 'sprites/xy' + shiny + '/' + spriteid + '.png);background-position:' + w + 'px ' + h + 'px;background-repeat:no-repeat';
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
	},

	/*********************************************************
	 * Replay files
	 *********************************************************/

	// Replay files are .html files that display a replay for a battle.

	// The .html files mainly contain replay log data; the actual replay
	// player is downloaded online. Also included is a textual log and
	// some minimal CSS to make it look pretty, for offline viewing.

	// This strategy helps keep the replay file reasonably small; of
	// the 30 KB or so for a 50-turn battle, around 10 KB is the log
	// data, and around 20 KB is the textual log.

	// The actual replay player is downloaded from replay-embed.js,
	// which handles loading all the necessary resources for turning the log
	// data into a playable replay.

	// Battle log data is stored in and loaded from a
	// <script type="text/plain" class="battle-log-data"> tag.

	// replay-embed.js is loaded through a cache-buster that rotates daily.
	// This allows pretty much anything about the replay viewer to be
	// updated as desired.

	createReplayFile: function (room) {
		var battle = room.battle;
		var replayid = room.id;
		if (replayid) {
			// battle room
			replayid = replayid.slice(7);
			if (Config.server.id !== 'showdown') {
				if (!Config.server.registered) {
					replayid = 'unregisteredserver-' + replayid;
				} else {
					replayid = Config.server.id + '-' + replayid;
				}
			}
		} else {
			// replay panel
			replayid = room.fragment;
		}
		battle.fastForwardTo(-1);
		var buf = '<!DOCTYPE html>\n';
		buf += '<meta charset="utf-8" />\n';
		buf += '<!-- version 1 -->\n';
		buf += '<title>' + Tools.escapeHTML(battle.tier) + ' replay: ' + Tools.escapeHTML(battle.p1.name) + ' vs. ' + Tools.escapeHTML(battle.p2.name) + '</title>\n';
		buf += '<style>\n';
		buf += 'html,body {font-family:Verdana, sans-serif;font-size:10pt;margin:0;padding:0;}body{padding:12px 0;} .battle-log {font-family:Verdana, sans-serif;font-size:10pt;} .battle-log-inline {border:1px solid #AAAAAA;background:#EEF2F5;color:black;max-width:640px;margin:0 auto 80px;padding-bottom:5px;} .battle-log .inner {padding:4px 8px 0px 8px;} .battle-log .inner-preempt {padding:0 8px 4px 8px;} .battle-log .inner-after {margin-top:0.5em;} .battle-log h2 {margin:0.5em -8px;padding:4px 8px;border:1px solid #AAAAAA;background:#E0E7EA;border-left:0;border-right:0;font-family:Verdana, sans-serif;font-size:13pt;} .battle-log .chat {vertical-align:middle;padding:3px 0 3px 0;font-size:8pt;} .battle-log .chat strong {color:#40576A;} .battle-log .chat em {padding:1px 4px 1px 3px;color:#000000;font-style:normal;} .chat.mine {background:rgba(0,0,0,0.05);margin-left:-8px;margin-right:-8px;padding-left:8px;padding-right:8px;} .spoiler {color:#BBBBBB;background:#BBBBBB;padding:0px 3px;} .spoiler:hover, .spoiler:active, .spoiler-shown {color:#000000;background:#E2E2E2;padding:0px 3px;} .spoiler a {color:#BBBBBB;} .spoiler:hover a, .spoiler:active a, .spoiler-shown a {color:#2288CC;} .chat code, .chat .spoiler:hover code, .chat .spoiler:active code, .chat .spoiler-shown code {border:1px solid #C0C0C0;background:#EEEEEE;color:black;padding:0 2px;} .chat .spoiler code {border:1px solid #CCCCCC;background:#CCCCCC;color:#CCCCCC;} .battle-log .rated {padding:3px 4px;} .battle-log .rated strong {color:white;background:#89A;padding:1px 4px;border-radius:4px;} .spacer {margin-top:0.5em;} .message-announce {background:#6688AA;color:white;padding:1px 4px 2px;} .message-announce a, .broadcast-green a, .broadcast-blue a, .broadcast-red a {color:#DDEEFF;} .broadcast-green {background-color:#559955;color:white;padding:2px 4px;} .broadcast-blue {background-color:#6688AA;color:white;padding:2px 4px;} .infobox {border:1px solid #6688AA;padding:2px 4px;} .infobox-limited {max-height:200px;overflow:auto;overflow-x:hidden;} .broadcast-red {background-color:#AA5544;color:white;padding:2px 4px;} .message-learn-canlearn {font-weight:bold;color:#228822;text-decoration:underline;} .message-learn-cannotlearn {font-weight:bold;color:#CC2222;text-decoration:underline;} .message-effect-weak {font-weight:bold;color:#CC2222;} .message-effect-resist {font-weight:bold;color:#6688AA;} .message-effect-immune {font-weight:bold;color:#666666;} .message-learn-list {margin-top:0;margin-bottom:0;} .message-throttle-notice, .message-error {color:#992222;} .message-overflow, .chat small.message-overflow {font-size:0pt;} .message-overflow::before {font-size:9pt;content:\'...\';} .subtle {color:#3A4A66;}\n';
		buf += '</style>\n';
		buf += '<div class="wrapper replay-wrapper" style="max-width:1180px;margin:0 auto">\n';
		buf += '<input type="hidden" name="replayid" value="' + replayid + '" />\n';
		buf += '<div class="battle"></div><div class="battle-log"></div><div class="replay-controls"></div><div class="replay-controls-2"></div>\n';
		buf += '<h1 style="font-weight:normal;text-align:center"><strong>' + Tools.escapeHTML(battle.tier) + '</strong><br /><a href="http://pokemonshowdown.com/users/' + toId(battle.p1.name) + '" class="subtle" target="_blank">' + Tools.escapeHTML(battle.p1.name) + '</a> vs. <a href="http://pokemonshowdown.com/users/' + toId(battle.p2.name) + '" class="subtle" target="_blank">' + Tools.escapeHTML(battle.p2.name) + '</a></h1>\n';
		buf += '<script type="text/plain" class="battle-log-data">' + battle.activityQueue.join('\n').replace(/\//g, '\\/') + '</script>\n';
		buf += '</div>\n';
		buf += '<div class="battle-log battle-log-inline"><div class="inner">' + battle.logElem.html() + '</div></div>\n';
		buf += '</div>\n';
		buf += '<script>\n';
		buf += 'var daily = Math.floor(Date.now()/1000/60/60/24);document.write(\'<script src="https://play.pokemonshowdown.com/js/replay-embed.js?version\'+daily+\'"></\'+\'script>\');\n';
		buf += '</script>\n';
		return buf;
	},

	createReplayFileHref: function (room) {
		return 'data:text/plain;base64,' + encodeURIComponent(window.btoa(unescape(encodeURIComponent(Tools.createReplayFile(room)))));
	}
};
