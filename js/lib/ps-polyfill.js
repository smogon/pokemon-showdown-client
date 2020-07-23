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
