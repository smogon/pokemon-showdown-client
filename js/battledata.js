/*

License: MIT License
  <https://github.com/Zarel/Pokemon-Showdown/blob/master/LICENSE>

*/

if (!window.exports) window.exports = window;

if (window.soundManager) {
	soundManager.setup({url:'https://play.pokemonshowdown.com/swf/'});
	if (window.Replays) soundManager.onready(window.Replays.soundReady);
	soundManager.onready(function () {
		soundManager.createSound({
			id: 'notif',
			url: 'https://play.pokemonshowdown.com/audio/notification.wav'
		});
	});
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
if (!Array.prototype.includes) {
	Array.prototype.includes = function (thing) {
		return this.indexOf(thing) !== -1;
	};
}
if (!String.prototype.includes) {
	String.prototype.includes = function (thing) {
		return this.indexOf(thing) !== -1;
	};
}
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (thing) {
		return this.slice(0, thing.length) === thing;
	};
}
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function (thing) {
		return this.slice(-thing.length) === thing;
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

// text formatter, transpiled from server chat-formatter.js
var formatText = (function(){function g(d,a){a=void 0===a?!1:a;d=(""+d).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");this.f=d=d.replace(h,function(a){if(/^[a-z0-9.]+@/ig.test(a))var c="mailto:"+a;else if(c=a.replace(/^([a-z]*[^a-z:])/g,"http://$1"),"https://docs.google.com/"===a.substr(0,24)||"docs.google.com/"===a.substr(0,16)){"https"===a.slice(0,5)&&(a=a.slice(8));if("?usp=sharing"===a.substr(-12)||"&usp=sharing"===a.substr(-12))a=a.slice(0,-12);
"#gid=0"===a.substr(-6)&&(a=a.slice(0,-6));var b=a.lastIndexOf("/");18<a.length-b&&(b=a.length);22<b-4&&(a=a.slice(0,19)+'<small class="message-overflow">'+a.slice(19,b-4)+"</small>"+a.slice(b-4))}return'<a href="'+c+'" rel="noopener" target="_blank">'+a+"</a>"});this.b=[];this.stack=[];this.isTrusted=a;this.offset=0}var h=/(?:(?:(?:https?:\/\/|\bwww[.])[a-z0-9-]+(?:[.][a-z0-9-]+)*|\b[a-z0-9-]+(?:[.][a-z0-9-]+)*[.](?:com?|org|net|edu|info|us|jp|[a-z]{2,3}(?=[:/])))(?:[:][0-9]+)?\b(?:\/(?:(?:[^\s()&<>]|&amp;|&quot;|[(](?:[^\s()<>&]|&amp;)*[)])*(?:[^\s`()[\]{}'".,!?;:&<>*`^~\\]|[(](?:[^\s()<>&]|&amp;)*[)]))?)?|[a-z0-9.]+\b@[a-z0-9-]+(?:[.][a-z0-9-]+)*[.][a-z]{2,3})(?![^ ]*&gt;)/ig;
g.prototype.slice=function(d,a){return this.f.slice(d,a)};g.prototype.a=function(d){return this.f.charAt(d)};g.prototype.i=function(d,a,b){this.c(a);this.stack.push([d,this.b.length]);this.b.push(this.slice(a,b));this.offset=b};g.prototype.c=function(d){d!==this.offset&&(this.b.push(this.slice(this.offset,d)),this.offset=d)};g.prototype.m=function(d){for(var a=-1,b=this.stack.length-1;0<=b;b--){var c=this.stack[b];if("("===c[0]){a=b;break}if("spoiler"!==c[0])break}if(-1!==a){for(this.c(d);this.stack.length>
a;)this.h(d);this.offset=d}};g.prototype.o=function(d,a,b){for(var c=-1,e=this.stack.length-1;0<=e;e--)if(this.stack[e][0]===d){c=e;break}if(-1===c)return!1;for(this.c(a);this.stack.length>c+1;)this.h(a);a=this.stack.pop()[1];c="";switch(d){case "_":c="i";break;case "*":c="b";break;case "~":c="s";break;case "^":c="sup";break;case "\\":c="sub"}c&&(this.b[a]="<"+c+">",this.b.push("</"+c+">"),this.offset=b);return!0};g.prototype.h=function(d){var a=this.stack.pop();if(a)switch(this.c(d),a[0]){case "spoiler":this.b.push("</span>");
this.b[a[1]]='<span class="spoiler">';break;case ">":this.b.push("</span>"),this.b[a[1]]='<span class="greentext">'}};g.prototype.j=function(d){for(;this.stack.length;)this.h(d);this.c(d)};g.prototype.l=function(d){d=d.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");return encodeURIComponent(d)};g.prototype.g=function(d,a){switch(d){case "`":for(var b=0,c=a;"`"===this.a(c);)b++,c++;for(var e=0;c<this.f.length;){var f=this.a(c);if("\n"===
f)break;if("`"===f)e++;else{if(e===b)break;e=0}c++}if(e!==b)break;this.c(a);this.b.push("<code>");e=a+b;b=c-b;e+1>=b||(" "===this.a(e)&&" "===this.a(b-1)?(e++,b--):" "===this.a(e)&&"`"===this.a(e+1)?e++:" "===this.a(b-1)&&"`"===this.a(b-2)&&b--);this.b.push(this.slice(e,b));this.b.push("</code>");this.offset=c;break;case "[":if("[["!==this.slice(a,a+2))break;c=a+2;for(f=e=-1;c<this.f.length;){b=this.a(c);if("]"===b||"\n"===b)break;":"===b&&0>e&&(e=c);"&"===b&&"&lt;"===this.slice(c,c+4)&&(f=c);c++}if("]]"!==
this.slice(c,c+2))break;var g=c;b="";0<=f&&"&gt;"===this.slice(c-4,c)&&(b=this.slice(f+4,c-4),g=f," "===this.a(g-1)&&g--,b=encodeURI(b.replace(/^([a-z]*[^a-z:])/g,"http://$1")));f=this.slice(a+2,g).replace(/<\/?a(?: [^>]+)?>/g,"");b&&!this.isTrusted&&(g=b.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/$/,""),f+="<small> &lt;"+g+"&gt;</small>",b+='" rel="noopener');if(0<e)switch(e=this.slice(a+2,e).toLowerCase(),e){case "w":case "wiki":f=f.slice(" "===f.charAt(e.length+1)?e.length+2:e.length+
1);b="//en.wikipedia.org/w/index.php?title=Special:Search&search="+this.l(f);f="wiki: "+f;break;case "pokemon":case "item":f=f.slice(" "===f.charAt(e.length+1)?e.length+2:e.length+1),g=this.isTrusted?"<psicon "+e+'="'+f+'"/>':"["+f+"]",b=e,"item"===e&&(b+="s"),b="//dex.pokemonshowdown.com/"+b+"/"+toId(f),f=g}b||(b="//www.google.com/search?ie=UTF-8&btnI&q="+this.l(f));this.c(a);this.b.push('<a href="'+b+'" target="_blank">'+f+"</a>");this.offset=c+2;break;case "<":if("&lt;&lt;"!==this.slice(a,a+8))break;
for(c=a+8;/[a-z0-9-]/.test(this.a(c));)c++;if("&gt;&gt;"!==this.slice(c,c+8))break;this.c(a);b=this.slice(a+8,c);this.b.push('&laquo;<a href="/'+b+'" target="_blank">'+b+"</a>&raquo;");this.offset=c+8;break;case "a":for(c=a+1;"/"!==this.a(c)||"a"!==this.a(c+1)||">"!==this.a(c+2);)c++;this.c(c+3)}};g.prototype.get=function(){for(var d=this.offset,a=d;a<this.f.length;a++){var b=this.a(a);switch(b){case "_":case "*":case "~":case "^":case "\\":if(this.a(a+1)===b&&this.a(a+2)!==b&&(" "!==this.a(a-1)&&
this.o(b,a,a+2)||" "!==this.a(a+2)&&this.i(b,a,a+2),a<this.offset)){a=this.offset-1;break}for(;this.a(a+1)===b;)a++;break;case "(":this.stack.push(["(",-1]);break;case ")":this.m(a);a<this.offset&&(a=this.offset-1);break;case "`":"`"===this.a(a+1)&&this.g("`",a);if(a<this.offset){a=this.offset-1;break}for(;"`"===this.a(a+1);)a++;break;case "[":this.g("[",a);if(a<this.offset){a=this.offset-1;break}for(;"["===this.a(a+1);)a++;break;case ":":if(7>a)break;if("spoiler:"===this.slice(a-7,a+1).toLowerCase()||
"spoilers:"===this.slice(a-8,a+1).toLowerCase())" "===this.a(a+1)&&a++,this.i("spoiler",a+1,a+1);break;case "&":a===d&&"&gt;"===this.slice(a,a+4)?"._/=:;".includes(this.a(a+4))||["w&lt;","w&gt;"].includes(this.slice(a+4,a+9))||this.i(">",a,a):this.g("<",a);if(a<this.offset){a=this.offset-1;break}for(;"lt;&"===this.slice(a+1,a+5);)a+=4;break;case "<":this.g("a",a);a<this.offset&&(a=this.offset-1);break;case "\r":case "\n":this.j(a),d=a+1}}this.j(this.f.length);return this.b.join("")};return function(d,
a){return(new g(d,void 0===a?!1:a)).get()}})();
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
	var R = R1 + m, G = G1 + m, B = B1 + m;
	var lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)

	var HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
	if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
	else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
	else HLmod = 0;
	// var mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
	var Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
	if (Hdist < 15) {
		HLmod += (15 - Hdist) / 3;
	}

	L += HLmod;

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
	spc: 'spa',
	Spc: 'spa',
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

var baseSpeciesChart = [
	'pikachu',
	'pichu',
	'unown',
	'castform',
	'deoxys',
	'burmy',
	'wormadam',
	'cherrim',
	'shellos',
	'gastrodon',
	'rotom',
	'giratina',
	'shaymin',
	'arceus',
	'basculin',
	'darmanitan',
	'deerling',
	'sawsbuck',
	'tornadus',
	'thundurus',
	'landorus',
	'kyurem',
	'keldeo',
	'meloetta',
	'genesect',
	'vivillon',
	'flabebe',
	'floette',
	'florges',
	'furfrou',
	'aegislash',
	'pumpkaboo',
	'gourgeist',
	'meowstic',
	'hoopa',
	'zygarde',
	'lycanroc',
	'wishiwashi',
	'minior',
	'mimikyu',
	'greninja',
	'oricorio',
	'silvally',
	'necrozma',

	// alola totems
	'raticate',
	'marowak',
	'kommoo',

	// mega evolutions
	'charizard',
	'mewtwo'
	// others are hardcoded by ending with 'mega'
];

// Precompile often used regular expression for links.
var domainRegex = '[a-z0-9\\-]+(?:[.][a-z0-9\\-]+)*';
var parenthesisRegex = '[(](?:[^\\s()<>&]|&amp;)*[)]';
var linkRegex = new RegExp(
	'(?:' +
		'(?:' +
			// When using www. or http://, allow any-length TLD (like .museum)
			'(?:https?://|\\bwww[.])' + domainRegex +
			'|\\b' + domainRegex + '[.]' +
				// Allow a common TLD, or any 2-3 letter TLD followed by : or /
				'(?:com?|org|net|edu|info|us|jp|[a-z]{2,3}(?=[:/]))' +
		')' +
		'(?:[:][0-9]+)?' +
		'\\b' +
		'(?:' +
			'/' +
			'(?:' +
				'(?:' +
					'[^\\s()&<>]|&amp;|&quot;' +
					'|' + parenthesisRegex +
				')*' +
				// URLs usually don't end with punctuation, so don't allow
				// punctuation symbols that probably aren't related to URL.
				'(?:' +
					'[^\\s`()\\[\\]{}\'".,!?;:&<>]' +
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
		var atIndex = formatid.indexOf('@@@');
		if (atIndex >= 0) {
			return Tools.escapeFormat(formatid.slice(0, atIndex)) + '<br />Custom rules: ' + Tools.escapeHTML(formatid.slice(atIndex + 3));
		}
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
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>/me' + Tools.parseMessage(' ' + target) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + Tools.parseMessage(' ' + target) + '</i></em></div>';
		case 'mee':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>/me' + Tools.parseMessage(' ' + target).slice(1) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + Tools.parseMessage(' ' + target).slice(1) + '</i></em></div>';
		case 'invite':
			var roomid = toRoomid(target);
			return [
				'<div class="chat">' + timestamp + '<em>' + clickableName + ' invited you to join the room "' + roomid + '"</em></div>',
				'<div class="notice"><button name="joinRoom" value="' + roomid + '">Join ' + roomid + '</button></div>'
			];
		case 'announce':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + Tools.parseMessage(target) + '</span></div>';
		case 'log':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<span class="message-log">' + Tools.parseMessage(target) + '</span></div>';
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
				buf += '<span class="col twoabilitycol">' + template.abilities['0'] + '<br />' + template.abilities['1'] + '</span>';
			} else {
				buf += '<span class="col abilitycol">' + template.abilities['0'] + '</span>';
			}
			if (template.abilities['S']) {
				buf += '<span class="col twoabilitycol' + (template.unreleasedHidden ? ' unreleasedhacol' : '') + '"><em>' + template.abilities['H'] + '<br />' + template.abilities['S'] + '</em></span>';
			} else if (template.abilities['H']) {
				buf += '<span class="col abilitycol' + (template.unreleasedHidden ? ' unreleasedhacol' : '') + '"><em>' + template.abilities['H'] + '</em></span>';
			} else {
				buf += '<span class="col abilitycol"></span>';
			}
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
			return '<div class="chat">' + Tools.parseMessage(target) + '</div>';
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
		// Don't format console commands (>>).
		if (str.substr(0, 3) === '>> ' || str.substr(0, 4) === '>>> ') return Tools.escapeHTML(str);
		// Don't format console results (<<).
		if (str.substr(0, 3) === '<< ') return Tools.escapeHTML(str);
		str = formatText(str);

		var options = Tools.prefs('chatformatting') || {};

		if (options.hidelinks) {
			str = str.replace(/<a[^>]*>/g, '<u>').replace(/<\/a>/g, '</u>');
		}
		if (options.hidespoiler) {
			str = str.replace(/<span class="spoiler">/g, '<span class="spoiler spoiler-shown">');
		}
		if (options.hidegreentext) {
			str = str.replace(/<span class="greentext">/g, '<span>');
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
		// Add <marquee> <blink> <psicon> to the whitelist.
		$.extend(html4.ELEMENTS, {
			'marquee': 0,
			'blink': 0,
			'psicon': html4.eflags['OPTIONAL_ENDTAG'] | html4.eflags['EMPTY']
		});
		$.extend(html4.ATTRIBS, {
			// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee
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
			'marquee::width': 0,
			'psicon::pokemon': 0,
			'psicon::item': 0
		});

		var uriRewriter = function (urlData) {
			if (urlData.scheme_ === 'geo' || urlData.scheme_ === 'sms' || urlData.scheme_ === 'tel') return null;
			return urlData;
		};
		var tagPolicy = function (tagName, attribs) {
			if (html4.ELEMENTS[tagName] & html4.eflags['UNSAFE']) {
				return;
			}
			var targetIdx = 0, srcIdx;
			if (tagName === 'a') {
				// Special handling of <a> tags.

				for (var i = 0; i < attribs.length - 1; i += 2) {
					switch (attribs[i]) {
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
			} else if (tagName === 'psicon') {
				// <psicon> is a custom element which supports a set of mutually incompatible attributes:
				// <psicon pokemon> and <psicon item>
				var classValueIndex = -1;
				var styleValueIndex = -1;
				var iconAttrib = null;
				for (var i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === 'pokemon' || attribs[i] === 'item') {
						// If declared more than once, use the later.
						iconAttrib = attribs.slice(i, i + 2);
					} else if (attribs[i] === 'class') {
						classValueIndex = i + 1;
					} else if (attribs[i] === 'style') {
						styleValueIndex = i + 1;
					}
				}
				tagName = 'span';

				if (iconAttrib) {
					if (classValueIndex < 0) {
						attribs.push('class', '');
						classValueIndex = attribs.length - 1;
					}
					if (styleValueIndex < 0) {
						attribs.push('style', '');
						styleValueIndex = attribs.length - 1;
					}

					// Prepend all the classes and styles associated to the custom element.
					if (iconAttrib[0] === 'pokemon') {
						attribs[classValueIndex] = attribs[classValueIndex] ? 'picon ' + attribs[classValueIndex] : 'picon';
						attribs[styleValueIndex] = attribs[styleValueIndex] ? Tools.getPokemonIcon(iconAttrib[1]) + '; ' + attribs[styleValueIndex] : Tools.getPokemonIcon(iconAttrib[1]);
					} else if (iconAttrib[0] === 'item') {
						attribs[classValueIndex] = attribs[classValueIndex] ? 'itemicon ' + attribs[classValueIndex] : 'itemicon';
						attribs[styleValueIndex] = attribs[styleValueIndex] ? Tools.getItemIcon(iconAttrib[1]) + '; ' + attribs[styleValueIndex] : Tools.getItemIcon(iconAttrib[1]);
					}
				}
			}

			if (attribs[targetIdx] === 'replace') {
				targetIdx = -targetIdx;
			}
			attribs = html.sanitizeAttribs(tagName, attribs, uriRewriter);
			if (targetIdx < 0) {
				targetIdx = -targetIdx;
				attribs[targetIdx - 1] = 'data-target';
				attribs[targetIdx] = 'replace';
				targetIdx = 0;
			}

			if (dataUri && tagName === 'img') {
				attribs[srcIdx + 1] = dataUri;
			}
			if (tagName === 'a' || tagName === 'form') {
				if (targetIdx) {
					attribs[targetIdx] = '_blank';
				} else {
					attribs.push('target');
					attribs.push('_blank');
				}
				if (tagName === 'a') {
					attribs.push('rel');
					attribs.push('noopener');
				}
			}
			return {tagName: tagName, attribs: attribs};
		};
		var localizeTime = function (full, date, time, timezone) {
			var parsedTime = new Date(date + 'T' + time + (timezone || 'Z').toUpperCase());
			// Very old (pre-ES5) web browsers may be incapable of parsing ISO 8601
			// dates. In such a case, gracefully continue without replacing the date
			// format.
			if (!parsedTime.getTime()) return full;

			var formattedTime;
			// Try using Intl API if it exists
			if (window.Intl && window.Intl.DateTimeFormat) {
				formattedTime = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(parsedTime);
			} else {
				// toLocaleString even exists in ECMAScript 1, so no need to check
				// if it exists.
				formattedTime = parsedTime.toLocaleString();
			}
			return '<time>' + Tools.escapeHTML(formattedTime) + '</time>';
		};
		return function (input) {
			// <time> parsing requires ISO 8601 time. While more time formats are
			// supported by most JavaScript implementations, it isn't required, and
			// how to exactly enforce ignoring user agent timezone setting is not obvious.
			// As dates come from the server which isn't aware of client timezone, a
			// particular timezone is required.
			//
			// This regular expression is split into three groups.
			//
			// Group 1 - date
			// Group 2 - time (seconds and milliseconds are optional)
			// Group 3 - optional timezone
			//
			// Group 1 and group 2 are split to allow using space as a separator
			// instead of T. Stricly speaking ECMAScript 5 specification only
			// allows T, however it's more practical to also allow spaces.
			return html.sanitizeWithPolicy(getString(input), tagPolicy)
				.replace(/<time>\s*([+-]?\d{4,}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)(Z|[+-]\d{2}:\d{2})?\s*<\/time>/ig, localizeTime);
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
				for (var i = 0; i < baseSpeciesChart.length; i++) {
					var baseid = baseSpeciesChart[i];
					if (id.length > baseid.length && id.substr(0, baseid.length) === baseid) {
						template.baseSpecies = baseid;
						template.forme = id.substr(baseid.length);
					}
				}
				if (id !== 'yanmega' && id.slice(-4) === 'mega') {
					template.baseSpecies = id.slice(0, -4);
					template.forme = id.slice(-4);
				} else if (id.slice(-6) === 'primal') {
					template.baseSpecies = id.slice(0, -6);
					template.forme = id.slice(-6);
				} else if (id.slice(-5) === 'alola') {
					template.baseSpecies = id.slice(0, -5);
					template.forme = id.slice(-5);
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
				}
				template.formeid = formeid;
			}
			if (!template.spriteid) template.spriteid = toId(template.baseSpecies) + template.formeid;
			if (!template.effectType) template.effectType = 'Template';
			if (!template.gen) {
				if (template.forme && template.formeid in {'-mega':1, '-megax':1, '-megay':1}) {
					template.gen = 6;
					template.isMega = true;
					template.battleOnly = true;
				} else if (template.formeid === '-primal') {
					template.gen = 6;
					template.isPrimal = true;
					template.battleOnly = true;
				} else if (template.formeid.slice(-5) === 'totem') {
					template.gen = 7;
					template.isTotem = true;
				} else if (template.formeid === '-alola') {
					template.gen = 7;
				} else if (template.num >= 722) {
					template.gen = 7;
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
			if (template.spriteid.slice(-5) === 'totem') template.spriteid = template.spriteid.slice(0, -5);
			if (template.spriteid.slice(-1) === '-') template.spriteid = template.spriteid.slice(0, -1);
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
			y: 0,
			url: Tools.resourcePrefix + 'sprites/',
			pixelated: true,
			isBackSprite: false,
			cryurl: '',
			shiny: pokemon.shiny
		};
		var name = pokemon.spriteid;
		var dir, facing;
		if (siden) {
			dir = '';
			facing = 'front';
		} else {
			spriteData.isBackSprite = true;
			dir = '-back';
			facing = 'back';
		}

		// Decide what gen sprites to use.
		var fieldGenNum = options.gen;
		if (Tools.prefs('nopastgens')) fieldGenNum = 6;
		if (Tools.prefs('bwgfx') && fieldGenNum >= 6) fieldGenNum = 5;
		var genNum = Math.max(fieldGenNum, Math.min(pokemon.gen, 5));
		var gen = {1:'rby', 2:'gsc', 3:'rse', 4:'dpp', 5:'bw', 6:'xy', 7:'xy'}[genNum];

		var animationData = null;
		var miscData = null;
		var speciesid = pokemon.speciesid;
		if (pokemon.isTotem) speciesid = toId(name);
		if (gen === 'xy' && window.BattlePokemonSprites) {
			animationData = BattlePokemonSprites[speciesid];
		}
		if (gen === 'bw' && window.BattlePokemonSpritesBW) {
			animationData = BattlePokemonSpritesBW[speciesid];
		}
		if (window.BattlePokemonSprites) miscData = BattlePokemonSprites[speciesid];
		if (!miscData && window.BattlePokemonSpritesBW) miscData = BattlePokemonSpritesBW[speciesid];
		if (!animationData) animationData = {};
		if (!miscData) miscData = {};

		if (miscData.num > 0) {
			spriteData.cryurl = 'audio/cries/' + toId(pokemon.baseSpecies);
			var formeid = pokemon.formeid;
			if (pokemon.isMega || formeid && (formeid === '-sky' || formeid === '-therian' || formeid === '-primal' || formeid === '-eternal' || pokemon.baseSpecies === 'Kyurem' || formeid === '-super' || formeid === '-unbound' || formeid === '-midnight' || formeid === '-school' || pokemon.baseSpecies === 'Oricorio' || pokemon.baseSpecies === 'Zygarde')) {
				spriteData.cryurl += formeid;
			}
			spriteData.cryurl += (window.nodewebkit ? '.ogg' : '.mp3');
		}

		if (pokemon.shiny && options.gen > 1) dir += '-shiny';

		// April Fool's 2014
		if (window.Config && Config.server && Config.server.afd || options.afd) {
			dir = 'afd' + dir;
			spriteData.url += dir + '/' + name + '.png';
			return spriteData;
		}

		if (animationData[facing + 'f'] && pokemon.gender === 'F') facing += 'f';
		var allowAnim = !Tools.prefs('noanim') && !Tools.prefs('nogif');
		if (allowAnim && genNum >= 6) spriteData.pixelated = false;
		if (allowAnim && animationData[facing] && genNum >= 5) {
			if (facing.slice(-1) === 'f') name += '-f';
			dir = gen + 'ani' + dir;

			spriteData.w = animationData[facing].w;
			spriteData.h = animationData[facing].h;
			spriteData.url += dir + '/' + name + '.gif';
		} else {
			// There is no entry or enough data in pokedex-mini.js
			// Handle these in case-by-case basis; either using BW sprites or matching the played gen.
			if (gen === 'xy') gen = 'bw';
			dir = gen + dir;

			// Gender differences don't exist prior to Gen 4,
			// so there are no sprites for it
			if (genNum >= 4 && miscData['frontf'] && pokemon.gender === 'F') {
				name += '-f';
			}

			spriteData.url += dir + '/' + name + '.png';
		}

		if (!options.noScale) {
			if (fieldGenNum > 5) {
				// no scaling
			} else if (!spriteData.isBackSprite || fieldGenNum === 5) {
				spriteData.w *= 2;
				spriteData.h *= 2;
				spriteData.y += -16;
			} else {
				// backsprites are multiplied 1.5x by the 3D engine
				spriteData.w *= 2 / 1.5;
				spriteData.h *= 2 / 1.5;
				spriteData.y += -11;
			}
			if (fieldGenNum === 5) spriteData.y = -35;
			if (fieldGenNum === 5 && spriteData.isBackSprite) spriteData.y += 40;
			if (genNum <= 2) spriteData.y += 2;
		}
		if (pokemon.isTotem && !options.noScale) {
			spriteData.w *= 1.5;
			spriteData.h *= 1.5;
			spriteData.y += -11;
		}

		return spriteData;
	},

	getPokemonIcon: function (pokemon, facingLeft) {
		var num = 0;
		if (pokemon === 'pokeball') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -0px 4px';
		} else if (pokemon === 'pokeball-statused') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -40px 4px';
		} else if (pokemon === 'pokeball-fainted') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -80px 4px;opacity:.4;filter:contrast(0)';
		} else if (pokemon === 'pokeball-none') {
			return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -80px 4px';
		}
		var id = toId(pokemon);
		if (pokemon && pokemon.species) id = toId(pokemon.species);
		if (pokemon && pokemon.volatiles && pokemon.volatiles.formechange && !pokemon.volatiles.transform) id = toId(pokemon.volatiles.formechange[2]);
		if (pokemon && pokemon.num !== undefined) num = pokemon.num;
		else if (window.BattlePokemonSprites && BattlePokemonSprites[id] && BattlePokemonSprites[id].num) num = BattlePokemonSprites[id].num;
		else if (window.BattlePokedex && window.BattlePokedex[id] && BattlePokedex[id].num) num = BattlePokedex[id].num;
		if (num < 0) num = 0;
		if (num > 807) num = 0;
		var altNums = {
			egg: 816 + 1,
			pikachubelle: 816 + 2,
			pikachulibre: 816 + 3,
			pikachuphd: 816 + 4,
			pikachupopstar: 816 + 5,
			pikachurockstar: 816 + 6,
			pikachucosplay: 816 + 7,
			// unown gap
			castformrainy: 816 + 35,
			castformsnowy: 816 + 36,
			castformsunny: 816 + 37,
			deoxysattack: 816 + 38,
			deoxysdefense: 816 + 39,
			deoxysspeed: 816 + 40,
			burmysandy: 816 + 41,
			burmytrash: 816 + 42,
			wormadamsandy: 816 + 43,
			wormadamtrash: 816 + 44,
			cherrimsunshine: 816 + 45,
			shelloseast: 816 + 46,
			gastrodoneast: 816 + 47,
			rotomfan: 816 + 48,
			rotomfrost: 816 + 49,
			rotomheat: 816 + 50,
			rotommow: 816 + 51,
			rotomwash: 816 + 52,
			giratinaorigin: 816 + 53,
			shayminsky: 816 + 54,
			unfezantf: 816 + 55,
			basculinbluestriped: 816 + 56,
			darmanitanzen: 816 + 57,
			deerlingautumn: 816 + 58,
			deerlingsummer: 816 + 59,
			deerlingwinter: 816 + 60,
			sawsbuckautumn: 816 + 61,
			sawsbucksummer: 816 + 62,
			sawsbuckwinter: 816 + 63,
			frillishf: 816 + 64,
			jellicentf: 816 + 65,
			tornadustherian: 816 + 66,
			thundurustherian: 816 + 67,
			landorustherian: 816 + 68,
			kyuremblack: 816 + 69,
			kyuremwhite: 816 + 70,
			keldeoresolute: 816 + 71,
			meloettapirouette: 816 + 72,
			vivillonarchipelago: 816 + 73,
			vivilloncontinental: 816 + 74,
			vivillonelegant: 816 + 75,
			vivillonfancy: 816 + 76,
			vivillongarden: 816 + 77,
			vivillonhighplains: 816 + 78,
			vivillonicysnow: 816 + 79,
			vivillonjungle: 816 + 80,
			vivillonmarine: 816 + 81,
			vivillonmodern: 816 + 82,
			vivillonmonsoon: 816 + 83,
			vivillonocean: 816 + 84,
			vivillonpokeball: 816 + 85,
			vivillonpolar: 816 + 86,
			vivillonriver: 816 + 87,
			vivillonsandstorm: 816 + 88,
			vivillonsavanna: 816 + 89,
			vivillonsun: 816 + 90,
			vivillontundra: 816 + 91,
			pyroarf: 816 + 92,
			flabebeblue: 816 + 93,
			flabebeorange: 816 + 94,
			flabebewhite: 816 + 95,
			flabebeyellow: 816 + 96,
			floetteblue: 816 + 97,
			floetteeternal: 816 + 98,
			floetteorange: 816 + 99,
			floettewhite: 816 + 100,
			floetteyellow: 816 + 101,
			florgesblue: 816 + 102,
			florgesorange: 816 + 103,
			florgeswhite: 816 + 104,
			florgesyellow: 816 + 105,
			furfroudandy: 816 + 106,
			furfroudebutante: 816 + 107,
			furfroudiamond: 816 + 108,
			furfrouheart: 816 + 109,
			furfroukabuki: 816 + 110,
			furfroulareine: 816 + 111,
			furfroumatron: 816 + 112,
			furfroupharaoh: 816 + 113,
			furfroustar: 816 + 114,
			meowsticf: 816 + 115,
			aegislashblade: 816 + 116,
			hoopaunbound: 816 + 118,
			rattataalola: 816 + 119,
			raticatealola: 816 + 120,
			raichualola: 816 + 121,
			sandshrewalola: 816 + 122,
			sandslashalola: 816 + 123,
			vulpixalola: 816 + 124,
			ninetalesalola: 816 + 125,
			diglettalola: 816 + 126,
			dugtrioalola: 816 + 127,
			meowthalola: 816 + 128,
			persianalola: 816 + 129,
			geodudealola: 816 + 130,
			graveleralola: 816 + 131,
			golemalola: 816 + 132,
			grimeralola: 816 + 133,
			mukalola: 816 + 134,
			exeggutoralola: 816 + 135,
			marowakalola: 816 + 136,
			greninjaash: 816 + 137,
			zygarde10: 816 + 138,
			zygardecomplete: 816 + 139,
			oricoriopompom: 816 + 140,
			oricoriopau: 816 + 141,
			oricoriosensu: 816 + 142,
			lycanrocmidnight: 816 + 143,
			wishiwashischool: 816 + 144,
			miniormeteor: 816 + 145,
			miniororange: 816 + 146,
			minioryellow: 816 + 147,
			miniorgreen: 816 + 148,
			miniorblue: 816 + 149,
			miniorviolet: 816 + 150,
			miniorindigo: 816 + 151,
			magearnaoriginal: 816 + 152,
			pikachuoriginal: 816 + 153,
			pikachuhoenn: 816 + 154,
			pikachusinnoh: 816 + 155,
			pikachuunova: 816 + 156,
			pikachukalos: 816 + 157,
			pikachualola: 816 + 158,
			pikachupartner: 816 + 159,
			lycanrocdusk: 816 + 160,
			necrozmaduskmane: 816 + 161,
			necrozmadawnwings: 816 + 162,
			necrozmaultra: 816 + 163,

			gumshoostotem: 735,
			raticatealolatotem: 816 + 120,
			marowakalolatotem: 816 + 136,
			araquanidtotem: 752,
			lurantistotem: 754,
			salazzletotem: 758,
			vikavolttotem: 738,
			togedemarutotem: 777,
			mimikyutotem: 778,
			mimikyubustedtotem: 778,
			ribombeetotem: 743,
			kommoototem: 784,

			venusaurmega: 984 + 0,
			charizardmegax: 984 + 1,
			charizardmegay: 984 + 2,
			blastoisemega: 984 + 3,
			beedrillmega: 984 + 4,
			pidgeotmega: 984 + 5,
			alakazammega: 984 + 6,
			slowbromega: 984 + 7,
			gengarmega: 984 + 8,
			kangaskhanmega: 984 + 9,
			pinsirmega: 984 + 10,
			gyaradosmega: 984 + 11,
			aerodactylmega: 984 + 12,
			mewtwomegax: 984 + 13,
			mewtwomegay: 984 + 14,
			ampharosmega: 984 + 15,
			steelixmega: 984 + 16,
			scizormega: 984 + 17,
			heracrossmega: 984 + 18,
			houndoommega: 984 + 19,
			tyranitarmega: 984 + 20,
			sceptilemega: 984 + 21,
			blazikenmega: 984 + 22,
			swampertmega: 984 + 23,
			gardevoirmega: 984 + 24,
			sableyemega: 984 + 25,
			mawilemega: 984 + 26,
			aggronmega: 984 + 27,
			medichammega: 984 + 28,
			manectricmega: 984 + 29,
			sharpedomega: 984 + 30,
			cameruptmega: 984 + 31,
			altariamega: 984 + 32,
			banettemega: 984 + 33,
			absolmega: 984 + 34,
			glaliemega: 984 + 35,
			salamencemega: 984 + 36,
			metagrossmega: 984 + 37,
			latiasmega: 984 + 38,
			latiosmega: 984 + 39,
			kyogreprimal: 984 + 40,
			groudonprimal: 984 + 41,
			rayquazamega: 984 + 42,
			lopunnymega: 984 + 43,
			garchompmega: 984 + 44,
			lucariomega: 984 + 45,
			abomasnowmega: 984 + 46,
			gallademega: 984 + 47,
			audinomega: 984 + 48,
			dianciemega: 984 + 49,

			syclant: 1152 + 0,
			revenankh: 1152 + 1,
			pyroak: 1152 + 2,
			fidgit: 1152 + 3,
			stratagem: 1152 + 4,
			arghonaut: 1152 + 5,
			kitsunoh: 1152 + 6,
			cyclohm: 1152 + 7,
			colossoil: 1152 + 8,
			krilowatt: 1152 + 9,
			voodoom: 1152 + 10,
			tomohawk: 1152 + 11,
			necturna: 1152 + 12,
			mollux: 1152 + 13,
			aurumoth: 1152 + 14,
			malaconda: 1152 + 15,
			cawmodore: 1152 + 16,
			volkraken: 1152 + 17,
			plasmanta: 1152 + 18,
			naviathan: 1152 + 19,
			crucibelle: 1152 + 20,
			crucibellemega: 1152 + 21,
			kerfluffle: 1152 + 22,
			pajantom: 1152 + 23,

			syclar: 1176 + 0,
			embirch: 1176 + 1,
			flarelm: 1176 + 2,
			breezi: 1176 + 3,
			scratchet: 1176 + 4,
			necturine: 1176 + 5,
			cupra: 1176 + 6,
			argalis: 1176 + 7,
			brattler: 1176 + 8,
			cawdet: 1176 + 9,
			volkritter: 1176 + 10,
			snugglow: 1176 + 11,
			floatoy: 1176 + 12,
			caimanoe: 1176 + 13,
			pluffle: 1176 + 14,
			rebble: 1176 + 15,
			tactite: 1176 + 16,
			privatyke: 1176 + 17,
			nohface: 1176 + 18,
			monohm: 1176 + 19,
			duohm: 1176 + 20,
			// protowatt: 1176 + 21,
			voodoll: 1176 + 22
		};

		if (altNums[id]) {
			num = altNums[id];
		}

		if (pokemon && pokemon.gender === 'F') {
			if (id === 'unfezant' || id === 'frillish' || id === 'jellicent' || id === 'meowstic' || id === 'pyroar') {
				num = altNums[id + 'f'];
			}
		}

		if (facingLeft) {
			altNums = {
				pikachubelle: 1044 + 0,
				pikachupopstar: 1044 + 1,
				clefairy: 1044 + 2,
				clefable: 1044 + 3,
				jigglypuff: 1044 + 4,
				wigglytuff: 1044 + 5,
				dugtrioalola: 1044 + 6,
				poliwhirl: 1044 + 7,
				poliwrath: 1044 + 8,
				mukalola: 1044 + 9,
				kingler: 1044 + 10,
				croconaw: 1044 + 11,
				cleffa: 1044 + 12,
				igglybuff: 1044 + 13,
				politoed: 1044 + 14,
				// unown gap
				sneasel: 1044 + 35,
				teddiursa: 1044 + 36,
				roselia: 1044 + 37,
				zangoose: 1044 + 38,
				seviper: 1044 + 39,
				castformrainy: 1044 + 40,
				absolmega: 1044 + 41,
				absol: 1044 + 42,
				regirock: 1044 + 43,
				torterra: 1044 + 44,
				budew: 1044 + 45,
				roserade: 1044 + 46,
				magmortar: 1044 + 47,
				togekiss: 1044 + 48,
				rotomwash: 1044 + 49,
				shayminsky: 1044 + 50,
				emboar: 1044 + 51,
				pansear: 1044 + 52,
				simisear: 1044 + 53,
				drilbur: 1044 + 54,
				excadrill: 1044 + 55,
				sawk: 1044 + 56,
				lilligant: 1044 + 57,
				garbodor: 1044 + 58,
				solosis: 1044 + 59,
				vanilluxe: 1044 + 60,
				amoonguss: 1044 + 61,
				klink: 1044 + 62,
				klang: 1044 + 63,
				klinklang: 1044 + 64,
				litwick: 1044 + 65,
				golett: 1044 + 66,
				golurk: 1044 + 67,
				kyuremblack: 1044 + 68,
				kyuremwhite: 1044 + 69,
				kyurem: 1044 + 70,
				keldeoresolute: 1044 + 71,
				meloetta: 1044 + 72,
				greninja: 1044 + 73,
				greninjaash: 1044 + 74,
				furfroudebutante: 1044 + 75,
				barbaracle: 1044 + 76,
				clauncher: 1044 + 77,
				clawitzer: 1044 + 78,
				sylveon: 1044 + 79,
				klefki: 1044 + 80,
				zygarde: 1044 + 81,
				zygarde10: 1044 + 82,
				zygardecomplete: 1044 + 83,
				dartrix: 1044 + 84,
				steenee: 1044 + 85,
				tsareena: 1044 + 86,
				comfey: 1044 + 87,
				miniormeteor: 1044 + 88,
				minior: 1044 + 89,
				miniororange: 1044 + 90,
				minioryellow: 1044 + 91,
				miniorgreen: 1044 + 92,
				miniorblue: 1044 + 93,
				miniorviolet: 1044 + 94,
				miniorindigo: 1044 + 95,
				dhelmise: 1044 + 96,
				necrozma: 1044 + 97,
				marshadow: 1044 + 98,
				pikachuoriginal: 1044 + 99,
				pikachupartner: 1044 + 100,
				necrozmaduskmane: 1044 + 101,
				necrozmadawnwings: 1044 + 102,
				necrozmaultra: 1044 + 103,
				stakataka: 1044 + 104,
				blacephalon: 1044 + 105
			};
			if (altNums[id]) {
				num = altNums[id];
			}
		}

		var top = Math.floor(num / 12) * 30;
		var left = (num % 12) * 40;
		var fainted = (pokemon && pokemon.fainted ? ';opacity:.7;filter:contrast(0)' : '');
		return 'background:transparent url(' + Tools.resourcePrefix + 'sprites/smicons-sheet.png) no-repeat scroll -' + left + 'px -' + top + 'px' + fainted;
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
		var spriteDir = Tools.resourcePrefix + 'sprites/xydex';
		if ((!gen || gen >= 6) && !template.isNonstandard && !Tools.prefs('bwgfx')) {
			var offset = '-2px -3px';
			if (template.gen >= 7) offset = '-6px -7px';
			if (id.substr(0, 6) === 'arceus') offset = '-2px 7px';
			if (id === 'garchomp') offset = '-2px 2px';
			if (id === 'garchompmega') offset = '-2px 0px';
			return 'background-image:url(' + spriteDir + shiny + '/' + spriteid + '.png);background-position:' + offset + ';background-repeat:no-repeat';
		}
		spriteDir = Tools.resourcePrefix + 'sprites/bw';
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
