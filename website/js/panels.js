 /*
 * Panels 0.1
 */

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5
if (!Function.prototype.bind) {
	var slice = Array.prototype.slice;
	Function.prototype.bind = function bind(that) {
		var target = this;
		if (typeof target != "function") {
			throw new TypeError("Function.prototype.bind called on incompatible " + target);
		}
		var args = slice.call(arguments, 1); // for normal call
		var bound = function () {
			if (this instanceof bound) {
				var F = function(){};
				F.prototype = target.prototype;
				var self = new F;
				var result = target.apply(self, args.concat(slice.call(arguments)));
				if (Object(result) === result) {
					return result;
				}
				return self;
			} else {
				return target.apply(that, args.concat(slice.call(arguments)));
			}
		};
		return bound;
	};
}

(function() {
	'use strict';


	var root = this;
	var Panels = root.Panels = {};

	var $ = root.jQuery || root.Zepto || root.ender;

	// we extend Backbone.history a bit
	Backbone.history.pause = function() {
		if (this.paused || !Backbone.History.started) return false;
		this.paused = true;
		Backbone.History.started = false;
		this.checkUrlBackup = this.checkUrl;
		this.checkUrl = function(){};
		return true;
	};
	Backbone.history.resume = function() {
		if (!this.paused) return false;
		this.checkUrl = this.checkUrlBackup;
		delete this.checkUrlBackup;
		Backbone.History.started = true;
		delete this.paused;
		return true;
	};

	var App = Panels.App = Backbone.Router.extend({
		constructor: function(options) {
			if (!options) options = {};
			if (options.root) this.root = options.root;
			for (var i in this.states) {
				this.routePanel(i, this.states[i]);
			}
			//this.routePanel('*path', 'Panels.StaticPanel');

			var initialize = this.initialize;
			this.initialize = function() {};
			Backbone.Router.prototype.constructor.apply(this, arguments);

			// constructor
			this.panels = [];
			this.popups = [];

			initialize.apply(this, arguments);

			Backbone.history.start({root: this.root, pushState: true, hashChange: false});
			this.fragment = Backbone.history.fragment;
			$(window).resize(function(){
				this.resize();
			}.bind(this));
		},
		root: '/',
		fragment: '',
		states: {},
		panels: null,
		i: 0,
		j: 0,

		topbarView: null,
		topbar: null,
		topbarHeight: 0,

		goLeftWidth: 35,
		goRightWidth: 35,
		goLeftRightDelay: 300,

		goLeftWidthOffset: 0,
		goRightWidthOffset: 0,

		backButtonPrefix: '',

		// routing functions

		go: function(fragment, loc, replace, source, instant) {
			if (fragment && fragment.substr(0,this.root.length) === this.root) {
				fragment = fragment.substr(this.root.length);
			}
			// no matter what, if the panel exists, we're going straight to it
			var i = this.getFragmentIndex(fragment);
			if (i >= 0) {
				if (i >= this.j && i < this.i) {
					this.focusPanel(i, instant); // already in view; focus it
				} else {
					this.scrollIntoView(i, instant);
				}
				this.updateURL();
				return;
			}
			if (typeof loc !== 'number') {
				loc = this.panels.indexOf(loc);
				if (loc < 0) {
					loc = null;
				} else if (!replace) {
					loc++;
				}
			}
			this.goLoc = loc;
			this.goLocReplace = replace;
			this.goLocSource = source;
			this.goInstant = instant;
			//this.navigate(fragment, {trigger: true});

			Backbone.history.loadUrl(fragment);
		},
		getPanelIndex: function(panel) {
			for (var i=this.panels.length-1; i>=0; i--) {
				if (this.panels[i] === panel) {
					return i;
				}
			}
			return -1;
		},
		getFragmentIndex: function(fragment) {
			for (var i=this.panels.length-1; i>=0; i--) {
				if (this.panels[i] && this.panels[i].fragment === fragment) {
					return i;
				}
			}
			return -1;
		},
		navigatePanel: function(name, fragment, args) {
			if (!this.panels.length) {
				this.initializePanels(name, fragment, args);
				return;
			}
			var isInternal = ('goLoc' in this);
			var loc = this.goLoc;
			var instant = this.goInstant;
			delete this.goLoc;
			delete this.goInstant;
			var i = this.getFragmentIndex(fragment);
			if (i >= 0) {
				this.focusPanel(i, instant);
				this.updateURL(!isInternal);
				return;
			}

			if (loc === undefined) loc = this.panels.length-1;

			var left = false;
			if (loc < 0) {
				// insert leftmost
				var $el = $('<div class="pfx-panel"></div>');
				$el.insertBefore(this.panels[0].el);
				this.panels.unshift(null);
				this.i++;
				loc = 0;
			} else {
				// insert at loc
				var $el = $('<div class="pfx-panel"></div>');
				$el.insertAfter(this.lastPanel().el);
				while (this.panels.length > loc) {
					var panel = this.panels.pop();
					left = panel.left;
					panel.remove();
				}
				this.panels.push(null);
			}
			this.renderPanel(loc, name, {
				el: $el[0],
				fragment: fragment,
				args: args,
				source: this.goLocSource,
				sourcePanel: this.panels[loc-1]
			});
			if (!loc) {
				var leftPanel = this.panels[loc];
				var rightPanel = this.panels[loc+1];
				if (rightPanel) leftPanel.whenLoaded(function(){
					var source = leftPanel.$('a[href="'+this.root+rightPanel.fragment+'"]');
					// console.log('sources: a[href="'+this.root+rightPanel.fragment+'"] ('+source.length+')');
					if (!source.length) source = null;
					rightPanel.setSource(source, leftPanel);
				});
			}
			if (left !== false) {
				if (this.i > loc) this.i = loc;
				if (this.i == loc) this.panels[loc].moveTo([left, 'auto', 0], {}, true);
				if (left) this.panels[loc].targetLeft = left;
			}
			this.scrollIntoView(loc, instant);
			this.updateURL(!isInternal);
		},
		updateURL: function(noPush) {
			var fragment = this.panels[this.i].fragment;
			if (fragment === this.fragment) return;
			this.fragment = fragment;
			if (root.ga) {
				ga('send', 'pageview', Backbone.history.root + fragment);
			}
			if (noPush) return;
			// console.log('URL update: '+fragment);
			// loadUrl updates the fragment, which prevents us from doing actual fragment manipulation
			Backbone.history.fragment = '??forceupdate';
			Backbone.history.navigate(fragment);
		},
		slicePanel: function(panel) {
			if (!this.panels.length) {
				this.initializePanels(name, fragment, args);
				return;
			}

			var loc = this.getPanelIndex(panel);
			if (loc < 0) return;

			delete this.goLoc;

			if (this.i>loc) this.i = loc;
			if (this.j>loc) this.j = loc;

			while (this.panels.length > loc+1) {
				var panel = this.panels.pop();
				panel.remove();
			}
			this.scrollIntoView(loc, true);
			this.updateURL();
		},
		setPanelSource: function() {
			var source = leftPanel.$('a[href="'+this.root+rightPanel.fragment+'"]');
			// console.log('sources: a[href="'+this.root+rightPanel.fragment+'"] ('+source.length+')');
			if (!source.length) source = null;
			rightPanel.setSource(source, leftPanel);
		},
		resize: function() {
			this.calculateLayout();
			this.commitLayout(true);
		},
		focusPanel: function(index, instant) {
			// scroll so that panel at index is rightmost
			instant = !this.calculateLayout(index) || instant;
			this.commitLayout(instant);
		},
		scrollIntoView: function(index, instant) {
			// scroll so that panel at index is in view
			if (index >= this.i) {
				this.focusPanel(index, instant);
			} else {
				var i = this.i+1;
				do {
					i--;
					this.calculateLayout(i);
				} while (this.targetJ > index && i>0);
				this.commitLayout(instant);
			}
		},
		routePanel: function(route, name) {
			Backbone.history || (Backbone.history = new Backbone.History);
			if (!_.isRegExp(route)) route = this._routeToRegExp(route);
			Backbone.history.route(route, _.bind(function(fragment) {
				this.midRouting = true;
				var args = this._extractParameters(route, fragment);
				this.navigatePanel.call(this, name, fragment, args);
				this.trigger.apply(this, ['route:' + name].concat(args));
				Backbone.history.trigger('route', this, name, args);
				this.midRouting = false;
			}, this));
			return this;
		},
		lastPanel: function() {
			return this.panels[this.panels.length-1];
		},
		reloadPanels: function() {
			for (var i=0,len=this.panels.length; i<len; i++) {
				this.panels[i].reload();
			}
		},

		// popups

		popups: null,
		addPopup: function(type, options) {
			if (!options) options = {};
			type = this.getPanelType(type);

			var bgElem = $('<div class="pfx-popup-bg"></div>');
			bgElem.insertAfter(this.lastPanel().el);
			options.bgElem = bgElem;
			bgElem.on('click', this.closePopup.bind(this));

			var elem = $('<div class="pfx-popup"></div>');
			elem.insertAfter(bgElem);
			options.el = elem;

			if (options.source) {
				// attach to a specific element
				var style = {position: 'absolute'};

				var source = $(options.source);
				var sourceOffset = source.offset();
				var sourceY1 = sourceOffset.top;
				var sourceY2 = sourceY1 + source.outerHeight();
				var viewportY1 = $(window).scrollTop();
				var viewportY2 = viewportY1 + $(window).height();
				if (sourceY1 - viewportY1 > viewportY2 - sourceY2) {
					// more room on top
					style.bottom = $(document).height() - sourceY1;
				} else {
					style.top = sourceY2;
				}
				var sourceX1 = sourceOffset.left;
				var sourceX2 = sourceX1 + source.outerWidth();
				var viewportX1 = $(window).scrollLeft();
				var viewportX2 = viewportX1 + $(window).width();
				if (sourceX1 - viewportX1 > viewportX2 - sourceX2) {
					// more room to the left
					style.right = $(document).width() - sourceX2;
				} else {
					style.left = sourceX1;
				}

				elem.css(style);
			}

			options.app = this;

			this.popups.push(new type(options));
		},
		closePopup: function() {
			if (!this.popups.length) return;
			var popup = this.popups.pop();
			popup.remove();
		},

		// panel animation

		getPanelType: function(name) {
			if (typeof name === 'string') {
				// var nameSplit = name.split('.');
				// name = window;
				// for (var i=0, len=nameSplit.length; i<len; i++) {
				// 	name = name[nameSplit[i]];
				// }
				return eval(name);
			}
			return name;
		},
		/**
		 * Initialize the entire app: Set up all the views.
		 */
		renderPanel: function(index, panelType, options, first) {
			if (first) {
				$(options.el).css({
					position: 'absolute',
					top: this.topbarHeight,
					left: 0,
					right: 0,
					bottom: 0,
					width: 'auto',
					height: 'auto',
					'-webkit-overflow-scrolling': 'touch',
					'overflow-scrolling': 'touch',
					overflow: 'auto'
				});
			} else {
				$(options.el).css({
					position: 'absolute',
					top: this.topbarHeight,
					left: 0,
					right: 'auto',
					bottom: 0,
					width: 'auto',
					height: 'auto',
					'-webkit-overflow-scrolling': 'touch',
					'overflow-scrolling': 'touch',
					overflow: 'auto'
				});
			}

			panelType = this.getPanelType(panelType);
			options.app = this;
			return this.panels[index] = new panelType(options);
		},
		/**
		 * Initialize the entire app: Set up all the views.
		 */
		initializePanels: function(name, fragment, args) {
			// global
			$('body').css({
				overflow: 'hidden'
			});

			// topbar
			if (!this.topbarView) this.topbarView = Panels.Topbar;
			this.topbarView = this.getPanelType(this.topbarView);
			var topbarElem = $('.pfx-topbar');
			if (topbarElem.length) {
				topbarElem.css({
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0
				});
				this.topbar = new this.topbarView({
					el: topbarElem[0],
					app: this
				});
				this.topbarHeight = this.topbar.height;
			}

			var $panels = $('.pfx-panel');
			this.panels = new Array($panels.length);
			var first = true;
			// iterate right-to-left
			for (var i=$panels.length-1; i>=0; i--) {
				var el = $panels[i];
				var panel = this.renderPanel(i, name, {
					el: el,
					fragment: fragment,
					args: args,
					loaded: true
				}, first);
				if (i) {
					name = panel.parentName;
					fragment = panel.parentFragment;
					args = panel.parentArgs;
				}
				first = false;
			}
			this.i = this.panels.length-1;
			this.calculateLayout(this.i);
			this.commitLayout(true);
		},
		calculateLayout: function(loc) {
			if (loc === undefined) loc = this.i;
			this.targetI = loc;
			var panels = this.panels;
			var maxWidth = $('body').width();
			var curWidth = 0;
			var curBuffer = 0;
			var numPanels = 0;
			var hasSidebar = false;
			var left = 0;
			var layoutChanged = !!(this.i !== loc);

			this.targetWidth = maxWidth;
			var goRightWidth = (this.goRightWidth || 0);
			var goLeftWidth = (this.goLeftWidth || 0);
			if (loc >= this.panels.length-1) goRightWidth = 0;
			maxWidth -= goRightWidth;

			// find out how many panels there are
			do {
				var width = panels[loc].minWidth;
				var buffer = panels[loc].maxWidth - width;
				if (numPanels && curWidth + width > maxWidth - (loc?goLeftWidth:0)) break;

				curWidth += width;
				curBuffer += buffer;
				numPanels++;
				loc--;
			} while (panels[loc]);
			if (numPanels <= 1 && panels[loc] && panels[loc].sidebarWidth) {
				// no room for more than one full panel, but maybe a sidebar will fit
				if (curWidth + panels[loc].sidebarWidth <= maxWidth - (loc?goLeftWidth:0)) {
					var targetWidth = panels[loc].sidebarWidth+curBuffer;
					if (panels[loc].targetWidth !== undefined && panels[loc].targetWidth !== targetWidth) {
						layoutChanged = true;
					}
					panels[loc].targetWidth = targetWidth;
					curWidth += targetWidth;
					curBuffer = 0;
					numPanels++;
					loc--;
					hasSidebar = true;
				}
			}
			this.targetJ = loc+1;

			if (loc+1 <= 0) goLeftWidth = 0;
			if (loc+1 == this.targetI) {
				maxWidth += goRightWidth;
				goRightWidth = 0;
				goLeftWidth = 0;
			}
			maxWidth -= goLeftWidth;

			// calculate our buffer ratio
			var maxBuffer = maxWidth - curWidth;
			if (maxBuffer > curBuffer) {
				left = Math.floor((maxBuffer - curBuffer)/2);
				maxBuffer = curBuffer;
			}
			var bufferRatio = (curBuffer ? maxBuffer/curBuffer : 1);
			maxBuffer = curBuffer;

			// calculate gaps
			this.targetRightGap = goRightWidth?left+goRightWidth:0;
			this.targetLeftGap = goLeftWidth?left+goLeftWidth:0;
			left += goLeftWidth;

			// populate panel layout
			// visible panels
			for (var i=loc+1,max=this.targetI; i<=max; i++) {
				var panel = panels[i];
				if (panel.targetLeft !== undefined && panel.targetLeft !== left) {
					layoutChanged = true;
				}
				panel.targetLeft = left;
				if (hasSidebar && i == loc+1) {
					// targetWidth already set earlier
				} else {
					var targetWidth = Math.floor(panel.minWidth + bufferRatio * (panel.maxWidth - panel.minWidth));
					if (panel.targetWidth !== undefined && panel.targetWidth !== targetWidth) {
						layoutChanged = true;
					}
					panel.targetWidth = targetWidth;
				}
				left += panel.targetWidth;
			}
			return layoutChanged;
		},
		getDestLoc: function(panel, i) {
			if (typeof panel === 'number') {
				i = panel;
				panel = this.panels[i];
			}
			var left = panel.targetLeft;
			var width = panel.targetWidth;
			var right = 'auto';
			if (i == this.targetJ) {
				width += left - this.targetLeftGap;
				left = this.targetLeftGap;
			}
			if (i == this.targetI) {
				right = this.targetRightGap;
				width = 'auto';
			}
			return [left, width, right];
		},
		getPanelWidth: function(panel) {
			if (panel.width === 'auto') return this.targetWidth - panel.left - panel.right;
			return panel.width;
		},
		commitLayout: function(instant) {
			var goingBack = (this.targetI < this.i) || (this.targetI === this.i && this.targetJ < this.j);
			if (goingBack) {
				// <--
				var totalWidth = this.targetWidth-this.targetRightGap;
				for (var i=Math.max(this.j, this.targetI+1), end=this.i; i<=end; i++) {
					//console.log('going right offscreen: '+i);
					this.panels[i].moveTo([totalWidth, this.getPanelWidth(this.panels[i]), 'auto'], {
						hide: true
					}, instant);
					totalWidth += this.getPanelWidth(this.panels[i]);
				}
				for (var i=this.targetI, end=this.j; i>=end; i--) {
					//console.log('moving right: '+i);
					var left = this.panels[i].targetLeft;
					this.panels[i].moveTo(this.getDestLoc(i), {
						leftmost: this.targetJ == i,
						rightmost: this.targetI == i,
						time: this.goLeftRightDelay
					}, instant);
				}
				totalWidth = this.targetLeftGap;
				for (var i=Math.min(this.j-1, this.targetI), end=this.targetJ; i>=end; i--) {
					//console.log('coming from left: '+i);
					totalWidth -= this.panels[i].targetWidth;
					this.panels[i].moveTo(this.getDestLoc(i), {
						leftmost: this.targetJ == i,
						rightmost: this.targetI == i,
						startingOffset: totalWidth - this.panels[i].targetLeft,
						time: this.goLeftRightDelay
					}, instant);
				}
			} else {
				// -->
				var totalWidth = -this.targetLeftGap;
				for (var i=Math.min(this.i, this.targetJ-1), end=this.j; i>=end; i--) {
					//console.log('going left offscreen: '+i);
					totalWidth += this.getPanelWidth(this.panels[i]);
					this.panels[i].moveTo([-totalWidth, this.getPanelWidth(this.panels[i]), 'auto'], {
						hide: true
					}, instant);
				}
				for (var i=this.targetJ, end=this.i; i<=end; i++) {
					//console.log('moving left: '+i);
					var left = this.panels[i].targetLeft;
					this.panels[i].moveTo(this.getDestLoc(i), {
						leftmost: this.targetJ == i,
						rightmost: this.targetI == i,
						time: this.goLeftRightDelay
					}, instant);
				}
				totalWidth = this.targetWidth-this.targetRightGap;
				for (var i=Math.max(this.i+1, this.targetJ), end=this.targetI; i<=end; i++) {
					//console.log('coming from right: '+i);
					this.panels[i].moveTo(this.getDestLoc(i), {
						leftmost: this.targetJ == i,
						rightmost: this.targetI == i,
						startingOffset: totalWidth - this.panels[i].targetLeft,
						time: this.goLeftRightDelay
					}, instant);
					totalWidth += this.panels[i].targetWidth;
				}
			}
			this.i = this.targetI;
			this.j = this.targetJ;

			if (this.goLeftRightElem) {
				this.goLeftRightElem.html('');
			} else {
				this.goLeftRightElem = $('<div></div>');
				this.goLeftRightElem.insertAfter(this.lastPanel().el);
				this.goLeftRightElem.on('click', 'a', function(e){
					e.preventDefault(); e.stopPropagation();
					this.go($(e.currentTarget).attr('href'));
				}.bind(this));
			}
			var buffer = '';
			if (this.targetLeftGap) {
				buffer += '<a class="pfx-go-left" style="width:'+(this.targetLeftGap+this.goLeftWidthOffset)+'px" href="'+this.root+this.panels[this.j-1].fragment+'"></a>';
			}
			if (this.targetRightGap) {
				buffer += '<a class="pfx-go-right" style="width:'+(this.targetRightGap+this.goRightWidthOffset)+'px" href="'+this.root+this.panels[this.i+1].fragment+'"></a>';
			}
			if (buffer) {
				if (instant) {
					this.goLeftRightElem.html(buffer);
					this.goLeftRightElem.show();
				} else {
					this.goLeftRightElem.hide();
					this.goLeftRightElem.html(buffer);
					setTimeout(function(){
						this.goLeftRightElem.show();
					}.bind(this), this.goLeftRightDelay);
				}
			}
		}
		// TODO: all other panel animation
	});

	var View = Panels.View = Backbone.View;

	var Panel = Panels.Panel = View.extend({
		constructor: function(options) {
			if (!options) options = {};
			this.app = options.app;
			if (!this.events) this.events = {};
			if (!this.events['click a, button']) this.events['click a, button'] = 'handleNavigation';
			if (!this.events['submit form']) this.events['submit form'] = 'handleNavigation';
			if (options.source) this.source = $(options.source);
			if (options.sourcePanel) this.sourcePanel = options.sourcePanel;
			if (options.bgElem) this.bgElem = options.bgElem;
			this.loaded = !!options.loaded;
			this.fragment = options.fragment;
			var args = options.args;

			delete options.app;
			delete options.loaded;
			delete options.source;
			delete options.bgElem;
			delete options.fragment;
			delete options.args;

			var initialize = this.initialize;
			this.initialize = function() {};
			View.prototype.constructor.call(this, options);

			// constructor
			if (this.source) {
				this.source.addClass('cur');
				if (this.source[0].tagName.toUpperCase() === 'BUTTON') this.source[0].disabled = true;
			}

			initialize.apply(this, args);

			if (!this.loaded) this.load();
			else this.whenLoadedQueueFlush();
			this.updateBackButton();
			this.updateContent();
		},
		source: null,
		minWidth: 480,
		maxWidth: 720,
		leftOffset: 0,
		widthOffset: 0,
		rightOffset: 0,
		fragment: '',
		hidden: false,
		moveTo: function(loc, flags, instant) {
			var left = loc[0];
			var width = loc[1];
			var right = loc[2];
			if (!flags) flags = {};

			if (flags.leftmost) {
				this.$('.pfx-backbutton').show();
			} else {
				this.$('.pfx-backbutton').hide();
			}

			this.leftmost = flags.leftmost;
			this.rightmost = flags.rightmost;
			this.hidden = !!flags.hide;
			var oldLeft = this.left;
			var oldWidth = this.width;
			var oldRight = this.right;
			this.left = left;
			this.width = width;
			this.right = right;

			if (left !== 'auto') left += this.leftOffset;
			if (width !== 'auto') width += this.widthOffset;
			if (right !== 'auto') right += this.rightOffset;

			if (instant) {
				this.$el.css({
					display: flags.hide?'none':'block',
					left: left,
					width: width,
					right: right
				});
				this.$('.pfx-body').css({
					'margin-left': this.left?0:'auto',
					'margin-right': this.right?0:'auto',
					'max-width': this.maxWidth
				});
			} else {
				this.show();
				if (left === 'auto') this.$el.css('left', 'auto');
				if (width === 'auto') this.$el.css('width', 'auto');
				if (right === 'auto') this.$el.css('right', 'auto');
				if (flags.startingOffset !== undefined) {
					this.$el.css({
						left: (left === 'auto' ? left : left + flags.startingOffset),
						width: width,
						right: (right === 'auto' ? right : right - flags.startingOffset)
					});
				} else if (width !== 'auto' && oldWidth === 'auto') {
					this.$el.css('width', $('body').width()-oldLeft-oldRight+this.widthOffset);
				} else if (right !== 'auto' && oldRight === 'auto') {
					this.$el.css('right', $('body').width()-oldLeft-oldWidth+this.rightOffset);
				}
				this.$el.transition({
					left: left,
					width: width,
					right: right
				}, flags.time||300, function() {
					if (flags.hide) $(this).css('display', 'none');
				});

				// left/right padding
				var elWidth = this.$el.width();
				var marginLeft = elWidth - this.maxWidth;
				if (marginLeft < 0 || (oldLeft && !oldRight)) {
					marginLeft = 0;
				} else if (!(!oldLeft && oldRight)) {
					marginLeft = Math.floor(marginLeft/2);
				}
				var marginRight = elWidth - this.maxWidth;
				if (marginRight < 0 || (!oldLeft && oldRight)) {
					marginRight = 0;
				} else if (!(oldLeft && !oldRight)) {
					marginRight = Math.floor(marginRight/2);
				}
				if (marginLeft && marginRight && this.left && this.right) {
					marginLeft = 0, marginRight = 0;
				}
				var $panelBody = this.$('.pfx-body');
				$panelBody.css({
					'margin-left': this.left?marginLeft:'auto',
					'margin-right': this.right?marginRight:'auto',
					'max-width': this.maxWidth
				});
				if (this.left && marginLeft) {
					$panelBody.transition({
						'margin-left': 0
					}, flags.time||300);
				}
				if (this.right && marginRight) {
					$panelBody.transition({
						'margin-right': 0
					}, flags.time||300);
				}
			}
		},
		html: function(content) {
			var panelIndex = content.indexOf('<div class="pfx-panel">');
			if (panelIndex >= 0) {
				content = content.substr(panelIndex+23);
				content = content.substr(0, content.lastIndexOf('</div>'));
			}

			this.$el.html(content);
			if (this.source && this.isPopup) {
				this.$('.pfx-title').remove();
			} else if (this.leftmost) {
				this.$('.pfx-backbutton').show();
			} else {
				this.$('.pfx-backbutton').hide();
			}
			this.$('.pfx-body').css({
				'margin-left': this.left?0:'auto',
				'margin-right': this.right?0:'auto',
				'max-width': this.maxWidth
			});
			this.updateBackButton();
			this.updateContent();
		},
		updateBackButton: function() {
			if (this.sourcePanel) {
				if (this.sourcePanel.shortTitle) {
					this.$('.pfx-backbutton').html(this.app.backButtonPrefix+this.sourcePanel.shortTitle);
				}
				this.$('.pfx-backbutton').attr('href', this.app.root+this.sourcePanel.fragment);
			}
		},
		updateContent: function() {},
		show: function() {
			this.hidden = false;
			this.load();
			this.$el.css('display', 'block');
		},
		hide: function() {
			this.hidden = true;
			this.$el.css('display', 'none');
		},
		load: function() {
			// placeholder loader: does nothing
			this.loaded = true;
			this.whenLoadedQueueFlush();
		},
		whenLoadedQueue: null,
		whenLoaded: function(callback) {
			if (this.loaded === true) {
				callback.call(this);
			} else {
				if (!this.whenLoadedQueue) this.whenLoadedQueue = [];
				this.whenLoadedQueue.push(callback);
			}
		},
		whenLoadedQueueFlush: function() {
			if (this.loaded !== true || !this.whenLoadedQueue) return;
			for (var i=0; i<this.whenLoadedQueue.length; i++) {
				this.whenLoadedQueue[i].call(this);
			}
			this.whenLoadedQueue = null;
		},
		reload: function() {
			this.loaded = false;
			if (!this.hidden) this.load();
		},
		handleNavigation: function(e) {
			if (e.cmdKey || e.metaKey || e.ctrlKey) return;

			var target = $(e.currentTarget);
			var linkTarget = target.data('target');
			var linkAction = target.data('action');
			var linkHref = target.data('href') || target.attr('href') || target.attr('action');
			var formMethod = '';
			if (target[0].tagName.toUpperCase() === 'FORM') {
				formMethod = 'GET';
				if ((target.attr('method')||'').toUpperCase() === 'POST') formMethod = 'POST';
				target.find('button[type=submit]').attr('disabled', 'disabled').text('Loading...');
			}
			// TODO: finish
			if (linkAction) {
				e.preventDefault();
				e.stopImmediatePropagation();
				this[linkAction].call(this, e);
			} else if (linkTarget === 'replace' && formMethod) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var data = target.serialize();
				this.ajax(linkHref, data, formMethod);
			} else if (linkTarget) {
				e.preventDefault();
				e.stopImmediatePropagation();
				switch (linkTarget) {
				case 'back':
					this.app.go(linkHref, -1);
					break;
				case 'push':
					this.app.go(linkHref, this, false, target);
					break;
				case 'replace':
					this.app.go(linkHref, this, true);
					break;
				}
			}
		},
		post: function(target, data) {
			return this.ajax(target, data, 'POST');
		},
		get: function(target, data) {
			return this.ajax(target, data);
		},
		ajax: function(target, data, method) {
			if (!target) target = this.app.root+this.fragment;
			return $.ajax(target+'?output=html', {
				type: method || GET,
				dataType: 'text',
				data: data
			}).done(function(response){
				this.html(response);
			}.bind(this));
		},
		setSource: function(newSource, newSourcePanel) {
			if (this.source) {
				this.source.removeClass('cur');
				if (this.source[0].tagName.toUpperCase() === 'BUTTON') this.source[0].disabled = false;
			}
			this.source = newSource;
			this.sourcePanel = newSourcePanel;
			if (this.source) {
				this.source.addClass('cur');
				if (this.source[0].tagName.toUpperCase() === 'BUTTON') this.source[0].disabled = true;
			}
		},
		remove: function() {
			Backbone.View.prototype.remove.apply(this, arguments);
			if (this.source) {
				this.source.removeClass('cur');
				if (this.source[0].tagName.toUpperCase() === 'BUTTON') this.source[0].disabled = false;
			}
			delete this.sourcePanel;
			if (this.bgElem) {
				this.bgElem.remove();
			}
			this.app = null; // remove possible circular references for GC
		},
		close: function() {},
		url: ''
	});

	var Popup = Panels.Popup = Panel.extend({
		isPopup: true,
		close: function() {
			this.app.closePopup();
		}
	});

	var Topbar = Panels.Topbar = View.extend({
		constructor: function(options) {
			// init 1

			var initialize = this.initialize;
			this.initialize = function() {};
			View.prototype.constructor.call(this, {el: options.el});
			this.app = options.app;

			// init 2
			if (!this.height) this.height = this.$el.height();

			initialize.apply(this);
		},
		app: null,
		height: 0
	});

	var StaticPanel = Panels.StaticPanel = Panel.extend({
		constructor: function() {
			Panel.prototype.constructor.apply(this, arguments);
		},
		load: function() {
			if (this.loaded) return;
			this.loaded = 'loading';
			this.$el.prepend('<p class="pfx-loading"><em>Loading...</em></p>');
			$.get(this.app.root+this.fragment+(this.fragment.indexOf('?')>=0?'&':'?')+'output=html').done(function(content) {
				this.html(content);
				this.loaded = true;
				this.whenLoadedQueueFlush();
			}.bind(this));
		}
		// TODO
	});

}).call(this);

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})(jQuery);

if (!jQuery.support.transition)
  jQuery.fn.transition = jQuery.fn.animate;
