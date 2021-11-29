/**
 * PS polyfill
 *
 * PS uses its own polyfills optimized for performance rather than
 * standards-compliance (we simply don't use the features these
 * polyfills don't provide).
 *
 * The biggest relevant difference is that we don't use
 * `Object.defineProperty`, so you can't use `for...in` on Arrays,
 * which everyone tells you not to do, anyway - you should be using
 * `for...i` loops (or `for...of` with Babel's `assumeArray` setting).
 *
 * This polyfill is intended to be used in <script nomodule>. All
 * polyfills here already exist in all browsers supporting nomodule.
 *
 * For convenience, I've marked all these with the ES spec they were
 * introduced in (note that ES2015 is ES6 here).
 *
 * @license MIT
 * @author Guangcong Luo <guangcongluo@gmail.com>
 */

// ES5
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function indexOf(searchElement, fromIndex) {
		for (var i = (fromIndex || 0); i < this.length; i++) {
			if (this[i] === searchElement) return i;
		}
		return -1;
	};
}
if (!Array.prototype.map) {
	Array.prototype.map = function map(callback, thisArg) {
		var newArray = [];
		for (var i = 0; i < this.length; i++) {
			newArray.push(callback.call(thisArg, this[i], i, this));
		}
		return newArray;
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function filter(callback, thisArg) {
		var newArray = [];
		for (var i = 0; i < this.length; i++) {
			if (callback.call(thisArg, this[i], i, this)) newArray.push(this[i]);
		}
		return newArray;
	};
}
// ES2016, predates nomodule
if (!Array.prototype.includes) {
	Array.prototype.includes = function includes(thing) {
		return this.indexOf(thing) !== -1;
	};
}
// ES5
if (!Array.isArray) {
	Array.isArray = function isArray(thing) {
		return Object.prototype.toString.call(thing) === '[object Array]';
	};
}
// ES6
if (!String.prototype.includes) {
	String.prototype.includes = function includes(thing) {
		return this.indexOf(thing) !== -1;
	};
}
// ES6
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function startsWith(thing) {
		return this.slice(0, thing.length) === thing;
	};
}
// ES6
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function endsWith(thing) {
		return this.slice(-thing.length) === thing;
	};
}
// ES5
if (!String.prototype.trim) {
	String.prototype.trim = function trim() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}
// ES6
if (!Object.assign) {
	Object.assign = function assign(thing, rest) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var k in source) {
				thing[k] = source[k];
			}
		}
		return thing;
	};
}
// ES2017, predates nomodule
if (!Object.values) {
	Object.values = function values(thing) {
		var out = [];
		for (var k in thing) {
			out.push(thing[k]);
		}
		return out;
	};
}
// ES5
if (!Object.keys) {
	Object.keys = function keys(thing) {
		var out = [];
		for (var k in thing) {
			out.push(k);
		}
		return out;
	};
}
// ES2017, predates nomodule
if (!Object.entries) {
	Object.entries = function entries(thing) {
		var out = [];
		for (var k in thing) {
			out.push([k, thing[k]]);
		}
		return out;
	};
}
// ES5
if (!Object.create) {
	Object.create = function (proto) {
		function F() {}
		F.prototype = proto;
		return new F();
	};
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function forEach(callback, thisArg) {
		for (var i = 0; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	}
}

// Promise polyfill from https://github.com/taylorhakes/promise-polyfill
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t():"function"==typeof define&&define.amd?define(t):t()}(0,function(){"use strict";function e(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})}function t(e){return new this(function(t,n){function o(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var f=n.then;if("function"==typeof f)return void f.call(n,function(t){o(e,t)},function(n){r[e]={status:"rejected",reason:n},0==--i&&t(r)})}r[e]={status:"fulfilled",value:n},0==--i&&t(r)}if(!e||"undefined"==typeof e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);for(var i=r.length,f=0;r.length>f;f++)o(f,r[f])})}function n(e){return!(!e||"undefined"==typeof e.length)}function o(){}function r(e){if(!(this instanceof r))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],l(e,this)}function i(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,r._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var o;try{o=n(e._value)}catch(r){return void u(t.promise,r)}f(t.promise,o)}else(1===e._state?f:u)(t.promise,e._value)})):e._deferreds.push(t)}function f(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof r)return e._state=3,e._value=t,void c(e);if("function"==typeof n)return void l(function(e,t){return function(){e.apply(t,arguments)}}(n,t),e)}e._state=1,e._value=t,c(e)}catch(o){u(e,o)}}function u(e,t){e._state=2,e._value=t,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&r._immediateFn(function(){e._handled||r._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;n>t;t++)i(e,e._deferreds[t]);e._deferreds=null}function l(e,t){var n=!1;try{e(function(e){n||(n=!0,f(t,e))},function(e){n||(n=!0,u(t,e))})}catch(o){if(n)return;n=!0,u(t,o)}}var a=setTimeout;r.prototype["catch"]=function(e){return this.then(null,e)},r.prototype.then=function(e,t){var n=new this.constructor(o);return i(this,new function(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}(e,t,n)),n},r.prototype["finally"]=e,r.all=function(e){return new r(function(t,o){function r(e,n){try{if(n&&("object"==typeof n||"function"==typeof n)){var u=n.then;if("function"==typeof u)return void u.call(n,function(t){r(e,t)},o)}i[e]=n,0==--f&&t(i)}catch(c){o(c)}}if(!n(e))return o(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var f=i.length,u=0;i.length>u;u++)r(u,i[u])})},r.allSettled=t,r.resolve=function(e){return e&&"object"==typeof e&&e.constructor===r?e:new r(function(t){t(e)})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,o){if(!n(e))return o(new TypeError("Promise.race accepts an array"));for(var i=0,f=e.length;f>i;i++)r.resolve(e[i]).then(t,o)})},r._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},r._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var s=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("unable to locate global object")}();"function"!=typeof s.Promise?s.Promise=r:s.Promise.prototype["finally"]?s.Promise.allSettled||(s.Promise.allSettled=t):s.Promise.prototype["finally"]=e});
