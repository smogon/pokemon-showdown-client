/*

License: GPLv2
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

// par: -webkit-filter:  sepia(100%) hue-rotate(373deg) saturate(592%);
//      -webkit-filter:  sepia(100%) hue-rotate(22deg) saturate(820%) brightness(29%);
// psn: -webkit-filter:  sepia(100%) hue-rotate(618deg) saturate(285%);
// brn: -webkit-filter:  sepia(100%) hue-rotate(311deg) saturate(469%);
// slp: -webkit-filter:  grayscale(100%);
// frz: -webkit-filter:  sepia(100%) hue-rotate(154deg) saturate(759%) brightness(23%);

$.extend($.easing, {
	ballisticUp: function (x, t, b, c, d) {
		return -3 * x * x + 4 * x;
	},
	ballisticDown: function (x, t, b, c, d) {
		x = 1 - x;
		return 1 - (-3 * x * x + 4 * x);
	},
	quadUp: function (x, t, b, c, d) {
		x = 1 - x;
		return 1 - (x * x);
	},
	quadDown: function (x, t, b, c, d) {
		return x * x;
	}
});

function BattleSoundLibrary() {
	// options
	this.effectVolume = 50;
	this.bgmVolume = 50;
	this.muted = false;

	// effects
	this.effectCache = {};
	this.loadEffect = function(url) {
		if (this.effectCache[url] && this.effectCache[url] !== this.soundPlaceholder) {
			return this.effectCache[url];
		}
		try {
			this.effectCache[url] = soundManager.createSound({
				id: url,
				url: Tools.resourcePrefix + url,
				volume: this.effectVolume
			});
		} catch (e) {}
		if (!this.effectCache[url]) {
			this.effectCache[url] = this.soundPlaceholder;
		}
		return this.effectCache[url];
	};
	this.playEffect = function(url) {
		if (!this.muted) this.loadEffect(url).setVolume(this.effectVolume).play();
	};

	// bgm
	this.bgmCache = {};
	this.bgm = null;
	this.loadBgm = function(url, loopstart, loopend) {
		if (this.bgmCache[url]) {
			if (this.bgmCache[url] !== this.soundPlaceholder || loopstart === undefined) {
				return this.bgmCache[url];
			}
		}
		try {
			this.bgmCache[url] = soundManager.createSound({
				id: url,
				url: Tools.resourcePrefix + url,
				volume: this.bgmVolume
			});
		} catch (e) {}
		if (!this.bgmCache[url]) {
			// couldn't load
			// suppress crash
			return this.bgmCache[url] = this.soundPlaceholder;
		}
		this.bgmCache[url].onposition(loopend, function() {
			this.setPosition(loopstart);
		});
		return this.bgmCache[url];
	};
	this.playBgm = function(url, loopstart, loopstop) {
		if (this.bgm === this.loadBgm(url, loopstart, loopstop)) {
			if (!this.bgm.paused && this.bgm.playState) {
				return;
			}
		} else {
			this.stopBgm();
		}
		try {
			this.bgm = this.loadBgm(url, loopstart, loopstop).setVolume(this.bgmVolume);
			if (!this.muted) {
				if (this.bgm.paused) {
					this.bgm.resume();
				} else {
					this.bgm.play();
				}
			}
		} catch(e) {}
	};
	this.pauseBgm = function() {
		if (this.bgm) {
			this.bgm.pause();
		}
	};
	this.stopBgm = function() {
		if (this.bgm) {
			this.bgm.stop();
			this.bgm = null;
		}
	};

	// setting
	this.setMute = function(muted) {
		muted = !!muted;
		if (this.muted == muted) return;
		this.muted = muted;
		if (muted) {
			if (this.bgm) this.bgm.pause();
		} else {
			if (this.bgm) this.bgm.play();
		}
	};
	this.setBgmVolume = function(bgmVolume) {
		this.bgmVolume = bgmVolume;
		if (this.bgm) {
			try {
				this.bgm.setVolume(bgmVolume);
			} catch (e) {}
		}
	};
	this.setEffectVolume = function(effectVolume) {
		this.effectVolume = effectVolume;
	};

	// misc
	this.soundPlaceholder = {
		play: function(){ return this; },
		pause: function(){ return this; },
		stop: function(){ return this; },
		resume: function(){ return this; },
		setVolume: function(){ return this; }
	};
}
var BattleSound = new BattleSoundLibrary();

function Pokemon(species) {
	var selfP = this;

	this.atk = 0;
	this.def = 0;
	this.spa = 0;
	this.spd = 0;
	this.spe = 0;

	this.atkStat = 0;
	this.defStat = 0;
	this.spaStat = 0;
	this.spdStat = 0;
	this.speStat = 0;

	this.boosts = {};

	this.hp = 0;
	this.maxhp = 0;
	this.hpcolor = '';
	this.moves = [];
	this.ability = '';
	this.item = '';
	this.species = species;
	this.side = null;
	this.fainted = false;
	this.zerohp = false;

	this.status = '';
	this.statusStage = 0;
	this.volatiles = {};
	this.turnstatuses = {};
	this.movestatuses = {};
	this.lastmove = '';

	this.name = '';
	this.species = '';
	this.id = '';
	this.statbarElem = null;

	this.getHPColor = function () {
		if (selfP.hpcolor) return selfP.hpcolor;
		var ratio = selfP.hp / selfP.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	};
	this.getHPColorClass = function () {
		switch (selfP.getHPColor()) {
			case 'y': return ' hpbar-yellow';
			case 'r': return ' hpbar-red';
		}
		return '';
	};
	var epsilon = 0.5/714;
	this.getPixelRange = function (pixels, color) {
		if (pixels === 0) {
			return [0, 0];
		} else if (pixels === 1) {
			return [0 + epsilon, 2/48 - epsilon];
		} else if (pixels === 9) {
			if (color === 'y') { // ratio is > 0.2
				return [0.2 + epsilon, 10/48 - epsilon];
			} else { // ratio is <= 0.2
				return [9/48, 0.2];
			}
		} else if (pixels === 24) {
			if (color === 'g') { // ratio is > 0.5
				return [0.5 + epsilon, 25/48 - epsilon];
			} else { // ratio is exactly 0.5
				return [0.5, 0.5];
			}
		} else if (pixels === 48) {
			return [1, 1];
		} else {
			return [pixels/48, (pixels + 1)/48 - epsilon];
		}
	};
	this.getFormattedRange = function (range, precision, separator) {
		if (range[0] === range[1]) {
			var percentage = Math.abs(range[0] * 100);
			if (Math.floor(percentage) === percentage) {
				return percentage + '%';
			}
			return percentage.toFixed(precision) + '%';
		}
		var lower, upper;
		if (precision === 0) {
			lower = Math.floor(range[0] * 100);
			upper = Math.ceil(range[1] * 100);
		} else {
			lower = (range[0] * 100).toFixed(precision);
			upper = (range[1] * 100).toFixed(precision);
		}
		return lower + separator + upper + '%';
	};
	this.getDamageRange = function (damage) {
		if (damage[1] !== 48) {
			var ratio = damage[0] / damage[1];
			return [ratio, ratio];
		} else if (damage[3] === undefined) {
			// wrong pixel damage.
			// this case exists for backward compatibility only.
			return [damage[2] / 100, damage[2] / 100];
		}
		// pixel damage
		var oldrange = selfP.getPixelRange(damage[3], damage[4]);
		var newrange = selfP.getPixelRange(damage[3] + damage[0], selfP.hpcolor);
		if (damage[0] === 0) {
			// no change in displayed pixel width
			return [0, newrange[1] - newrange[0]];
		}
		if (oldrange[0] < newrange[0]) { // swap order
			var r = oldrange;
			oldrange = newrange;
			newrange = r;
		}
		return [oldrange[0] - newrange[1], oldrange[1] - newrange[0]];
	};
	// returns [delta, denominator, percent(, oldnum, oldcolor)] or false
	this.healthParse = function (hpstring, parsedamage, heal) {
		if (!hpstring || !hpstring.length) return false;
		var parenIndex = hpstring.lastIndexOf('(');
		if (parenIndex >= 0) {
			// old style damage and health reporting
			if (parsedamage) {
				var damage = parseFloat(hpstring);
				// unusual check preseved for backward compatbility
				if (isNaN(damage)) damage = 50;
				if (heal) {
					selfP.hp += selfP.maxhp * damage / 100;
					if (selfP.hp > selfP.maxhp) selfP.hp = selfP.maxhp;
				} else {
					selfP.hp -= selfP.maxhp * damage / 100;
				}
				// parse the absolute health information
				var ret = this.healthParse(hpstring);
				if (ret && (ret[1] === 100)) {
					// support for old replays with nearest-100th damage and health
					return [damage, 100, damage];
				}
				// complicated expressions preserved for backward compatibility
				var percent = Math.round(Math.ceil(damage * 48 / 100) / 48 * 100);
				var pixels = Math.ceil(damage * 48 / 100);
				return [pixels, 48, percent];
			}
			if (hpstring.substr(hpstring.length-1) !== ')') {
				return false;
			}
			hpstring = hpstring.substr(parenIndex+1, hpstring.length-parenIndex-2);
		}

		var hp = hpstring.split(' ');
		var status = hp[1];
		hp = hp[0];
		var oldhp = (selfP.zerohp || selfP.fainted) ? 0 : (selfP.hp || 1);
		var oldmaxhp = selfP.maxhp;
		var oldwidth = selfP.hpWidth(100);
		var oldcolor = selfP.hpcolor;

		// hp parse
		selfP.hpcolor = '';
		if (hp === '0' || hp === '0.0') {
			selfP.hp = 0;
			selfP.zerohp = true;
		} else if (hp.indexOf('/') > 0) {
			var hp = hp.split('/');
			if (isNaN(parseFloat(hp[0])) || isNaN(parseFloat(hp[1]))) {
				return false;
			}
			selfP.hp = parseFloat(hp[0]);
			selfP.maxhp = parseFloat(hp[1]);
			if (oldmaxhp === 0) { // max hp not known before parsing this message
				oldmaxhp = oldhp = selfP.maxhp;
			}
			if (selfP.hp > selfP.maxhp) selfP.hp = selfP.maxhp;
			var colorchar = hp[1].substr(hp[1].length - 1);
			if ((colorchar === 'y') || (colorchar === 'g')) {
				selfP.hpcolor = colorchar;
			}
			if (!selfP.hp) {
				selfP.zerohp = true;
			}
		} else if (!isNaN(parseFloat(hp))) {
			selfP.hp = selfP.maxhp * parseFloat(hp) / 100;
		}

		// status parse
		if (!status) {
			selfP.status = '';
		} else if (status === 'par' || status === 'brn' || status === 'slp' || status === 'frz' || status === 'tox') {
			selfP.status = status;
		} else if (status === 'psn' && selfP.status !== 'tox') {
			selfP.status = status;
		} else if (status === 'fnt') {
			selfP.hp = 0;
			selfP.zerohp = true;
			selfP.fainted = true;
		}

		var oldnum = oldhp ? (Math.floor(oldhp / oldmaxhp * selfP.maxhp) || 1) : 0;
		var delta = selfP.hp - oldnum;
		var deltawidth = selfP.hpWidth(100) - oldwidth;
		return [delta, selfP.maxhp, deltawidth, oldnum, oldcolor];
	};
	this.checkDetails = function(details, ident) {
		if (details === selfP.details) return true;
		if (selfP.details.indexOf('-*') >= 0) {
			selfP.needsReplace = true;
			details = details.replace(/-[A-Za-z0-9]+(, |$)/, '$1');
			return (details === selfP.details.replace(/-[A-Za-z0-9*]+(, |$)/, '$1'));
		}
		return false;
	};
	this.getIdent = function() {
		if (selfP.side.active.length === 1) return selfP.ident;
		var slots = ['a','b','c','d','e','f'];
		return selfP.ident.substr(0,2) + slots[selfP.slot] + selfP.ident.substr(2);
	};
	this.removeVolatile = function (volatile) {
		if (!selfP.hasVolatile(volatile)) return;
		if (volatile === 'formechange') {
			selfP.sprite.removeTransform();
		}
		if (selfP.volatiles[volatile][1]) selfP.volatiles[volatile][1].remove();
		delete selfP.volatiles[volatile];
	};
	this.addVolatile = function (volatile) {
		var self = selfP.side.battle;
		if (selfP.hasVolatile(volatile)) return;
		selfP.volatiles[volatile] = [volatile, null];
		if (volatile === 'leechseed') {
			selfP.side.battle.spriteElemsFront[selfP.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
			var curelem = selfP.side.battle.spriteElemsFront[selfP.side.n].children().last();
			curelem.css(self.pos({
				display: 'block',
				x: selfP.sprite.x - 30,
				y: selfP.sprite.y - 40,
				z: selfP.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			var elem = curelem;

			selfP.side.battle.spriteElemsFront[selfP.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
			curelem = selfP.side.battle.spriteElemsFront[selfP.side.n].children().last();
			curelem.css(self.pos({
				display: 'block',
				x: selfP.sprite.x + 40,
				y: selfP.sprite.y - 35,
				z: selfP.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			elem = elem.add(curelem);

			selfP.side.battle.spriteElemsFront[selfP.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
			curelem = selfP.side.battle.spriteElemsFront[selfP.side.n].children().last();
			curelem.css(self.pos({
				display: 'block',
				x: selfP.sprite.x + 20,
				y: selfP.sprite.y - 25,
				z: selfP.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			elem = elem.add(curelem);
			selfP.volatiles[volatile][1] = elem;
		}
	};
	this.hasVolatile = function (volatile) {
		return !!selfP.volatiles[volatile];
	};
	this.removeTurnstatus = function (volatile) {
		if (!selfP.hasTurnstatus(volatile)) return;
		if (selfP.turnstatuses[volatile][1]) selfP.turnstatuses[volatile][1].remove();
		delete selfP.turnstatuses[volatile];
	};
	this.addTurnstatus = function (volatile) {
		volatile = toId(volatile);
		var self = selfP.side.battle;
		if (selfP.hasTurnstatus(volatile)) {
			if (volatile === 'protect' || volatile === 'magiccoat') {
				selfP.turnstatuses[volatile][1].css(self.pos({
					x: selfP.sprite.x,
					y: selfP.sprite.y,
					z: selfP.sprite.behind(-15),
					xscale: 1 * 1.2,
					yscale: .7 * 1.2,
					opacity: 1
				}, BattleEffects.none), 300).animate(self.pos({
					x: selfP.sprite.x,
					y: selfP.sprite.y,
					z: selfP.sprite.behind(-15),
					xscale: 1,
					yscale: .7,
					opacity: .4
				}, BattleEffects.none), 300);
			}
			return;
		}
		selfP.turnstatuses[volatile] = [volatile, null];
		if (volatile === 'protect' || volatile === 'magiccoat') {
			selfP.side.battle.spriteElemsFront[selfP.side.n].append('<div class="turnstatus-protect" style="display:none;position:absolute" />');
			var elem = selfP.side.battle.spriteElemsFront[selfP.side.n].children().last();
			elem.css(self.pos({
				display: 'block',
				x: selfP.sprite.x,
				y: selfP.sprite.y,
				z: selfP.sprite.behind(-15),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(self.pos({
				x: selfP.sprite.x,
				y: selfP.sprite.y,
				z: selfP.sprite.behind(-15),
				xscale: 1,
				yscale: .7,
				opacity: .9
			}, BattleEffects.none), 300).animate({
				opacity: .4
			}, 300);
			selfP.turnstatuses[volatile][1] = elem;
		}
	};
	this.hasTurnstatus = function (volatile) {
		return !!selfP.turnstatuses[volatile];
	};
	this.clearTurnstatuses = function () {
		for (i in selfP.turnstatuses) {
			selfP.removeTurnstatus(i);
		}
		selfP.turnstatuses = {};
	};
	this.removeMovestatus = function (volatile) {
		if (!selfP.hasMovestatus(volatile)) return;
		if (selfP.movestatuses[volatile][1]) selfP.movestatuses[volatile][1].remove();
		delete selfP.movestatuses[volatile];
	};
	this.addMovestatus = function (volatile) {
		volatile = toId(volatile);
		var self = selfP.side.battle;
		if (selfP.hasMovestatus(volatile)) {
			return;
		}
		selfP.movestatuses[volatile] = [volatile, null];
	};
	this.hasMovestatus = function (volatile) {
		return !!selfP.movestatuses[volatile];
	};
	this.clearMovestatuses = function () {
		for (i in selfP.movestatuses) {
			selfP.removeMovestatus(i);
		}
		selfP.movestatuses = {};
	};
	this.clearVolatiles = function () {
		for (i in selfP.volatiles) {
			selfP.removeVolatile(i);
		}
		selfP.volatiles = {};
		selfP.clearTurnstatuses();
		selfP.clearMovestatuses();
	};
	this.getName = function () {
		if (selfP.side.n === 0) {
			return Tools.escapeHTML(selfP.name);
		} else {
			return "The opposing " + Tools.escapeHTML(selfP.name);
		}
	};
	this.getLowerName = function () {
		if (selfP.side.n === 0) {
			return Tools.escapeHTML(selfP.name);
		} else {
			return "the opposing " + Tools.escapeHTML(selfP.name);
		}
	};
	this.getTitle = function () {
		titlestring = '(' + selfP.ability + ') ';

		for (var i = 0; i < selfP.moves.length; i++) {
			if (i != 0) titlestring += ' / ';
			titlestring += Tools.getMove(selfP.moves[i]).name;
		}
		return titlestring;
	};
	this.getFullName = function (plaintext) {
		var name = Tools.escapeHTML(selfP.name);
		if (selfP.name !== selfP.species) {
			if (plaintext) {
				name += ' (' + selfP.species + ')';
			} else name += ' <small>(' + selfP.species + ')</small>';
		}
		if (plaintext) {
			if (selfP === selfP.side.active[0]) {
				name += ' (active)';
			} else if (selfP.fainted) {
				name += ' (fainted)';
			} else {
				var statustext = '';
				if (selfP.hp !== selfP.maxhp) {
					statustext += selfP.hpDisplay();
				}
				if (selfP.status) {
					if (statustext) statustext += '|';
					statustext += selfP.status;
				}
				if (statustext) {
					name += ' (' + statustext + ')';
				}
			}
		}
		return name;
	}
	this.getBoost = function (boostStat) {
		var boostStatTable = {
			atk: 'Atk',
			def: 'Def',
			spa: 'SpA',
			spd: 'SpD',
			spe: 'Spe',
			accuracy: 'Accuracy',
			evasion: 'Evasion'
		};
		if (!selfP.boosts[boostStat]) {
			return '1&times;&nbsp;' + boostStatTable[boostStat];
		}
		if (selfP.boosts[boostStat] > 6) selfP.boosts[boostStat] = 6;
		if (selfP.boosts[boostStat] < -6) selfP.boosts[boostStat] = -6;
		if (boostStat === 'accuracy' || boostStat === 'evasion') {
			if (selfP.boosts[boostStat] > 0) {
				var goodBoostTable = ['1&times;', '1.33&times;', '1.67&times;', '2&times;', '2.33&times;', '2.67&times;', '3&times;'];
				//var goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
				return '' + goodBoostTable[selfP.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
			}
			var badBoostTable = ['1&times;', '0.75&times;', '0.6&times;', '0.5&times;', '0.43&times;', '0.38&times;', '0.33&times;'];
			//var badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
			return '' + badBoostTable[-selfP.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		if (selfP.boosts[boostStat] > 0) {
			var goodBoostTable = ['1&times;', '1.5&times;', '2&times;', '2.5&times;', '3&times;', '3.5&times;', '4&times;'];
			//var goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
			return '' + goodBoostTable[selfP.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		var badBoostTable = ['1&times;', '0.67&times;', '0.5&times;', '0.4&times;', '0.33&times;', '0.29&times;', '0.25&times;'];
		//var badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
		return '' + badBoostTable[-selfP.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
	}
	this.getBoostType = function (boostStat) {
		if (!selfP.boosts[boostStat]) {
			return 'neutral';
		} else if (selfP.boosts[boostStat] > 0) {
			return 'good';
		}
		return 'bad';
	}

	this.clearVolatile = function () {
		selfP.atk = selfP.atkStat;
		selfP.def = selfP.defStat;
		selfP.spa = selfP.spaStat;
		selfP.spd = selfP.spdStat;
		selfP.spe = selfP.speStat;
		selfP.boosts = {};
		selfP.clearVolatiles();
		//selfP.lastmove = '';
		selfP.statusStage = 0;
	};
	this.copyVolatileFrom = function (pokemon, copyAll) {
		selfP.boosts = pokemon.boosts;
		selfP.volatiles = pokemon.volatiles;
		//selfP.lastmove = pokemon.lastmove; // I think
		if (!copyAll) {
			selfP.removeVolatile('yawn');
			selfP.removeVolatile('airballoon');
			selfP.removeVolatile('typeadd');
			selfP.removeVolatile('typechange');
		}
		selfP.removeVolatile('transform');
		selfP.removeVolatile('formechange');

		pokemon.atk = pokemon.atkStat;
		pokemon.def = pokemon.defStat;
		pokemon.spa = pokemon.spaStat;
		pokemon.spd = pokemon.spdStat;
		pokemon.spe = pokemon.speStat;
		pokemon.boosts = {};
		pokemon.volatiles = {};
		pokemon.sprite.removeTransform();
		pokemon.statusStage = 0;
	};
	this.reset = function () {
		selfP.clearVolatile();
		selfP.hp = selfP.maxhp;
		selfP.zerohp = false;
		selfP.fainted = false;
		selfP.status = '';
		if (!selfP.name) {
			selfP.name = selfP.species;
		}
	};
	// This function is used for two things:
	//   1) The percentage to display beside the HP bar.
	//   2) The width to draw an HP bar.
	//
	// This function is NOT used in the calculation of any other displayed
	// percentages or ranges, which have their own, more complex, formulae.
	this.hpWidth = function (maxWidth) {
		if (selfP.fainted || selfP.zerohp) {
			return 0;
		}
		// special case for low health...
		if (selfP.hp == 1 && selfP.maxhp > 10) return 1;
		if (selfP.maxhp === 48) {
			// Draw the health bar to the middle of the range.
			// This affects the width of the visual health bar *only*; it
			// does not affect the ranges displayed in any way.
			var range = selfP.getPixelRange(selfP.hp, selfP.hpcolor);
			var ratio = (range[0] + range[1]) / 2;
			return Math.round(maxWidth * ratio) || 1;
		}
		var percentage = Math.ceil(selfP.hp / selfP.maxhp * 100);
		if ((percentage === 100) && (selfP.hp < selfP.maxhp)) {
			percentage = 99;
		}
		return percentage * maxWidth / 100;
	};
	this.hpDisplay = function (precision) {
		if (precision === undefined) precision = 1;
		if (selfP.maxhp === 100) {
			return selfP.hp + '%';
		} else if (selfP.maxhp !== 48) {
			return (selfP.hp / selfP.maxhp * 100).toFixed(precision) + '%';
		}
		var range = selfP.getPixelRange(selfP.hp, selfP.hpcolor);
		return selfP.getFormattedRange(range, precision, '–');
	};
};

function Battle(frame, logFrame, noPreload) {
	var self = this;

	frame.addClass('battle');

	this.turn = 0;
	this.done = 0;
	this.weather = '';
	this.pseudoWeather = [];
	this.weatherTimeLeft = 0;
	this.weatherMinTimeLeft = 0;
	this.mySide = null;
	this.yourSide = null;
	this.p1 = null;
	this.p2 = null;
	this.sides = [];
	this.lastMove = '';
	this.gen = 6;

	this.frameElem = frame;
	this.logFrameElem = logFrame;
	this.logElem = null;
	this.weatherElem = null;
	this.bgEffectElem = null;
	this.bgElem = null;
	this.spriteElem = null;
	this.spriteElems = [null, null];
	this.spriteElemsFront = [null, null];
	this.statElem = null;
	this.fxElem = null;
	this.leftbarElem = null;
	this.rightbarElem = null;
	this.turnElem = null;
	this.messagebarElem = null;
	this.delayElem = null;
	this.hiddenMessageElem = null;

	this.paused = true;
	this.playbackState = 0;

	self.backdropImage = BattleBackdrops[0];

	self.backdropImage = BattleBackdrops[Math.floor(Math.random() * BattleBackdrops.length)];

	// 0 = uninitialized
	// 1 = ready
	// 2 = playing
	// 3 = paused
	// 4 = finished
	// 5 = seeking
	this.removePseudoWeather = function (weather) {
		for (var i = 0; i < self.pseudoWeather.length; i++) {
			if (self.pseudoWeather[i][0] === weather) {
				self.pseudoWeather.splice(i, 1);
				self.updateWeather();
				return;
			}
		}
	};
	this.addPseudoWeather = function (weather, poke) {
		self.pseudoWeather.push([weather, 5]);
		self.updateWeather();
	};
	this.hasPseudoWeather = function (weather) {
		for (var i = 0; i < self.pseudoWeather.length; i++) {
			if (self.pseudoWeather[i][0] === weather) {
				return true;
			}
		}
		return false;
	};
	this.init = function () {
		self.reset();
		self.mySide = new self.Side(0);
		self.yourSide = new self.Side(1);
		self.mySide.foe = self.yourSide;
		self.yourSide.foe = self.mySide;
		self.sides = [self.mySide, self.yourSide];
		self.p1 = self.mySide;
		self.p2 = self.yourSide;
		self.gen = 6;
	};
	this.updateGen = function () {
		if (this.gen < 4) self.backdropImage = '';
		else if (this.gen < 6) self.backdropImage = 'bg.jpg';
		if (self.bgElem) self.bgElem.css('background-image','url(' + Tools.resourcePrefix + 'fx/' + self.backdropImage + ')');
	};
	this.reset = function (dontResetSound) {
		// battle state
		self.turn = 0;
		self.done = 0;
		self.weather = '';
		self.weatherTimeLeft = 0;
		self.weatherMinTimeLeft = 0;
		self.pseudoWeather = [];
		self.lastMove = '';

		// DOM state
		self.frameElem.empty();
		self.frameElem.html('<div class="innerbattle"></div>');
		self.elem = self.frameElem.children();
		logFrame.html('<div class="inner"></div>');
		self.logElem = logFrame.children();
		logFrame.append('<div class="inner-preempt"></div>');
		self.logPreemptElem = logFrame.children().last();
		logFrame.append('<div class="inner-after"></div>');

		this.updateGen();
		self.elem.append('<div class="backdrop" style="background-image:url(' + Tools.resourcePrefix + 'fx/' + self.backdropImage + ');display:block;opacity:0"></div>');
		self.bgElem = self.elem.children().last();
		self.bgElem.animate({
			opacity: 0.6
		});

		self.elem.append('<div class="weather"></div>');
		self.weatherElem = self.elem.children().last();

		self.elem.append('<div></div>');
		self.bgEffectElem = self.elem.children().last();

		self.elem.append('<div></div>');
		self.spriteElem = self.elem.children().last();

		self.spriteElem.append('<div></div>');
		self.spriteElems[1] = self.spriteElem.children().last();
		self.spriteElem.append('<div></div>');
		self.spriteElemsFront[1] = self.spriteElem.children().last();
		self.spriteElem.append('<div></div>');
		self.spriteElemsFront[0] = self.spriteElem.children().last();
		self.spriteElem.append('<div></div>');
		self.spriteElems[0] = self.spriteElem.children().last();

		self.elem.append('<div></div>');
		self.statElem = self.elem.children().last();

		self.elem.append('<div></div>');
		self.fxElem = self.elem.children().last();

		self.elem.append('<div class="leftbar"></div>');
		self.leftbarElem = self.elem.children().last();

		self.elem.append('<div class="rightbar"></div>');
		self.rightbarElem = self.elem.children().last();

		self.elem.append('<div></div>');
		self.turnElem = self.elem.children().last();

		self.elem.append('<div class="messagebar message"></div>');
		self.messagebarElem = self.elem.children().last();

		self.elem.append('<div></div>');
		self.delayElem = self.elem.children().last();

		self.elem.append('<div class="message" style="position:absolute;display:block;visibility:hidden"></div>');
		self.hiddenMessageElem = self.elem.children().last();

		if (self.mySide) self.mySide.reset();
		if (self.yourSide) self.yourSide.reset();

		// activity queue state
		self.animationDelay = 0;
		self.multiHitMove = null;
		self.activityStep = 0;
		self.activityDelay = 0;
		self.activityAfter = null;
		self.activityAnimations = $();
		self.activityQueueActive = false;
		self.fastForwardOff();
		$.fx.off = false;
		self.minorQueue = [];
		self.resultWaiting = false;
		self.paused = true;
		if (self.playbackState !== 5) {
			self.playbackState = (self.activityQueue.length ? 1 : 0);
			if (!dontResetSound) self.soundStop();
		}
	};
	this.dealloc = function () {
		self.soundStop();
	};

	this.logConsole = function (text) {
		if (window.console && console.log) console.log(text);
	};
	this.log = function (html, preempt) {
		var willScroll = (self.logFrameElem.scrollTop() + 60 >= self.logElem.height() + self.logPreemptElem.height() - self.logFrameElem.height());
		if (preempt) {
			self.logPreemptElem.append(html);
		} else {
			self.logElem.append(html);
		}
		if (willScroll) {
			self.logFrameElem.scrollTop(self.logElem.height() + self.logPreemptElem.height());
		}
	};
	this.preemptCatchup = function () {
		self.logElem.append(self.logPreemptElem.children().first());
	};

	this.pos = function (loc, obj) {
		var left, top, scale, width, height;

		if (!loc.scale && loc.scale !== 0) loc.scale = 1;
		if (!loc.xscale && loc.xscale !== 0) loc.xscale = loc.scale;
		if (!loc.yscale && loc.yscale !== 0) loc.yscale = loc.scale;
		if (!loc.opacity && loc.opacity !== 0) loc.opacity = 1;
		if (!loc.z) loc.z = 0;
		if (!loc.x) loc.x = 0;
		if (!loc.y) loc.y = 0;

		left = 210;
		top = 245;
		scale = 1;
		scale = 1.5 - 0.5 * (loc.z / 200);
		if (scale < .1) scale = .1;

		left += (410 - 190) * (loc.z / 200);
		top += (135 - 245) * (loc.z / 200);
		left += Math.floor(loc.x * scale);
		top -= Math.floor(loc.y * scale /* - loc.x * scale / 4 */ );
		width = Math.floor(obj.w * scale * loc.xscale);
		height = Math.floor(obj.h * scale * loc.yscale);
		left -= Math.floor(width / 2);
		top -= Math.floor(height / 2);

		var pos = {
			left: left,
			top: top,
			width: width,
			height: height,
			opacity: loc.opacity
		};
		if (loc.display) pos.display = loc.display;
		return pos;
	};
	this.posT = function (loc, obj, transition, oldloc) {
		var pos = self.pos(loc, obj);
		var oldpos = null;
		if (oldloc) oldpos = self.pos(oldloc, obj);
		var transitionMap = {
			left: 'linear',
			top: 'linear',
			width: 'linear',
			height: 'linear',
			opacity: 'linear'
		};
		if (transition === 'ballistic') {
			transitionMap.top = (pos.top < oldpos.top ? 'ballisticUp' : 'ballisticDown');
		}
		if (transition === 'ballisticUnder') {
			transitionMap.top = (pos.top < oldpos.top ? 'ballisticDown' : 'ballisticUp');
		}
		if (transition === 'ballistic2') {
			transitionMap.top = (pos.top < oldpos.top ? 'quadUp' : 'quadDown');
		}
		if (transition === 'ballistic2Under') {
			transitionMap.top = (pos.top < oldpos.top ? 'quadDown' : 'quadUp');
		}
		if (transition === 'swing') {
			transitionMap.left = 'swing';
			transitionMap.top = 'swing';
			transitionMap.width = 'swing';
			transitionMap.height = 'swing';
		}
		if (transition === 'accel') {
			transitionMap.left = 'quadDown';
			transitionMap.top = 'quadDown';
			transitionMap.width = 'quadDown';
			transitionMap.height = 'quadDown';
		}
		if (transition === 'decel') {
			transitionMap.left = 'quadUp';
			transitionMap.top = 'quadUp';
			transitionMap.width = 'quadUp';
			transitionMap.height = 'quadUp';
		}
		return {
			left: [pos.left, transitionMap.left],
			top: [pos.top, transitionMap.top],
			width: [pos.width, transitionMap.width],
			height: [pos.height, transitionMap.height],
			opacity: [pos.opacity, transitionMap.opacity]
		};
	};
	this.Sprite = function (spriteData, x, y, z, siden) {
		var selfS = this;
		var sp = null;
		var subsp = null;
		this.forme = '';
		this.elem = null;
		this.cryurl = '';
		if (spriteData) {
			sp = spriteData;
			self.spriteElems[siden].append('<img src="' + sp.url + '" style="display:none;position:absolute" />');
			this.elem = self.spriteElems[siden].children().last();
			this.cryurl = spriteData.cryurl;
		} else {
			sp = {
				w: 0,
				h: 0,
				url: ''
			};
		}
		this.sp = sp;
		this.subsp = null;
		this.oldsp = null;
		this.subElem = null;
		this.iw = sp.w;
		this.ih = sp.h;
		this.w = 0;
		this.h = 0;
		this.x = x;
		this.y = y;
		this.z = z;
		this.statbarOffset = 0;
		var pos = self.pos({
			x: x,
			y: y,
			z: z
		}, {
			w: 0,
			h: 96
		});
		this.top = parseInt(pos.top + 40);
		this.left = parseInt(pos.left);
		this.isBackSprite = !siden;
		this.duringMove = false;
		this.behindx = function (offset) {
			return selfS.x + (selfS.isBackSprite ? -1 : 1) * offset;
		}
		this.behindy = function (offset) {
			return selfS.y + (selfS.isBackSprite ? 1 : -1) * offset;
		}
		this.leftof = function (offset) {
			return (selfS.isBackSprite ? -1 : 1) * offset;
		};
		this.behind = function (offset) {
			return selfS.z + (selfS.isBackSprite ? -1 : 1) * offset;
		};
		this.animTransform = function (species) {
			if (!selfS.oldsp) selfS.oldsp = selfS.sp;
			if (species.volatiles && species.volatiles.formechange) species = species.volatiles.formechange[2];
			sp = Tools.getSpriteData(species, selfS.isBackSprite ? 0 : 1, {afd: self.tier === "[Seasonal] Fools Festival"});
			selfS.sp = sp;
			selfS.elem.animate(self.pos({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z,
				yscale: 0,
				xcale: 1,
				opacity: .3
			}, selfS.oldsp), 300, function () {
				selfS.elem.attr('src', sp.url);
				selfS.elem.animate(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.z,
					opacity: 1
				}, sp), 300);
			});
			self.activityWait(500);
		};
		this.destroy = function () {
			if (selfS.elem) selfS.elem.remove();
			if (selfS.subElem) selfS.subElem.remove();
		};
		this.removeTransform = function (species) {
			if (selfS.oldsp) {
				sp = selfS.oldsp;
				selfS.sp = sp;
				selfS.oldsp = null;
				selfS.elem.attr('src', sp.url);
				selfS.elem.css(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: (selfS.subElem ? selfS.behind(30) : selfS.z),
					opacity: (selfS.subElem ? .3 : 1)
				}, sp));
			}
		};
		this.animSub = function () {
			subsp = Tools.getSpriteData('substitute', siden, {afd: self.tier === "[Seasonal] Fools Festival"});
			selfS.subsp = subsp;
			selfS.iw = subsp.w;
			selfS.ih = subsp.h;
			self.spriteElemsFront[siden].append('<img src="' + subsp.url + '" style="display:none;position:absolute" />');
			selfS.subElem = self.spriteElemsFront[siden].children().last();

			//temp//selfS.subElem.css({position: 'absolute', display: 'block'});
			selfS.selfAnim({}, 500);
			selfS.subElem.css({
				position: 'absolute',
				opacity: 0,
				display: 'block'
			});
			selfS.subElem.css(self.pos({
				x: selfS.x,
				y: selfS.y + 50,
				z: selfS.z,
				opacity: 0
			}, subsp));
			selfS.subElem.animate(self.pos({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z
			}, subsp), 500);
			self.activityWait(selfS.subElem);
		};
		this.animSubFade = function () {
			if (!selfS.subElem) return;
			if (self.activityDelay) {
				selfS.elem.delay(self.activityDelay);
				selfS.subElem.delay(self.activityDelay);
			}
			selfS.subElem.animate(self.pos({
				x: selfS.x,
				y: selfS.y - 50,
				z: selfS.z,
				opacity: 0
			}, selfS.subsp), 500);

			selfS.subElem = null;
			selfS.selfAnim({}, 500);
			selfS.iw = selfS.sp.w;
			selfS.ih = selfS.sp.h;
			self.activityWait(selfS.elem);
		};
		this.beforeMove = function () {
			if (selfS.subElem && !selfS.duringMove) {
				selfS.duringMove = true;
				selfS.selfAnim({}, 300);
				selfS.subElem.animate(self.pos({
					x: selfS.leftof(-50),
					y: selfS.y,
					z: selfS.z,
					opacity: 0.5
				}, selfS.subsp), 300);
				if (self.sides[selfS.isBackSprite ? 1 : 0].active[0]) {
					self.sides[selfS.isBackSprite ? 1 : 0].active[0].sprite.delay(300);
				}
				self.animationDelay = 300;
				self.activityWait(selfS.elem);

				return true;
			}
			return false;
		};
		this.afterMove = function () {
			if (selfS.subElem && selfS.duringMove) {
				selfS.subElem.delay(300);
				selfS.duringMove = false;
				selfS.elem.add(selfS.subElem).promise().done(function () {
					if (!selfS.subElem || !selfS.elem) return;
					selfS.selfAnim({}, 300);
					selfS.subElem.animate(self.pos({
						x: selfS.x,
						y: selfS.y,
						z: selfS.z,
						opacity: 1
					}, selfS.subsp), 300);
				});
				return true;
			}
			selfS.duringMove = false;
			return false;
		};
		this.removeSub = function () {
			if (selfS.subElem) {
				var temp = selfS.subElem;
				selfS.subElem.animate({
					opacity: 0
				}, function () {
					temp.remove();
				});
				selfS.subElem = null;
			}
		};
		this.animReset = function () {
			if (selfS.subElem) {
				selfS.elem.stop(true, false);
				selfS.subElem.stop(true, false);
				selfS.elem.css(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(30),
					opacity: .3
				}, selfS.sp));
				selfS.subElem.css(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.z
				}, selfS.subsp));
			} else {
				selfS.elem.stop(true, false);
				selfS.elem.css(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.z
				}, selfS.sp));
			}
		};
		this.animSummon = function (slot, instant) {
			selfS.x = slot * (selfS.isBackSprite ? -1 : 1) * -50;
			selfS.y = slot * (selfS.isBackSprite ? -1 : 1) * 10;
			selfS.statbarOffset = 0;
			if (!selfS.isBackSprite) selfS.statbarOffset = 17 * slot;
			if (selfS.isBackSprite) selfS.statbarOffset = -7 * slot;

			// make sure element is in the right z-order
			if (!slot && selfS.isBackSprite || slot && !selfS.isBackSprite) {
				selfS.elem.prependTo(selfS.elem.parent());
			} else {
				selfS.elem.appendTo(selfS.elem.parent());
			}

			var pos = self.pos(selfS, {
				w: 0,
				h: 96
			});
			selfS.top = parseInt(pos.top + 40);
			selfS.left = parseInt(pos.left);

			selfS.anim();
			selfS.w = sp.w;
			selfS.h = sp.h;
			selfS.elem.css({
				// 'z-index': (selfS.isBackSprite ? 1+slot : 4-slot),
				position: 'absolute',
				display: 'block'
			});
			if (self.fastForward || instant) {
				selfS.elem.css(self.pos({
					opacity: 1,
					x: selfS.x,
					y: selfS.y,
					z: selfS.z
				}, selfS.sp));
				return;
			}
			if (selfS.cryurl) {
				//self.logConsole('cry: '+selfS.cryurl);
				BattleSound.playEffect(selfS.cryurl);
			}
			selfS.elem.css(self.pos({
				x: selfS.x,
				y: selfS.y - 10,
				z: selfS.z,
				scale: 0,
				opacity: 0
			}, selfS.sp));
			self.showEffect('pokeball', {
				opacity: 0,
				x: selfS.x,
				y: selfS.y + 30,
				z: selfS.behind(50),
				scale: .7
			}, {
				opacity: 1,
				x: selfS.x,
				y: selfS.y - 10,
				z: selfS.z,
				time: 300
			}, 'ballistic2', 'fade');
			selfS.elem.delay(300).animate(self.pos({
				x: selfS.x,
				y: selfS.y + 30,
				z: selfS.z
			}, selfS.sp), 400).animate(self.posT({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z
			}, selfS.sp, 'accel'), 300);
			self.activityWait(selfS.elem);
		};
		this.animDragIn = function (slot) {
			if (self.fastForward) return selfS.animSummon(slot, true);

			selfS.x = slot * (selfS.isBackSprite ? -1 : 1) * -50;
			selfS.y = slot * (selfS.isBackSprite ? -1 : 1) * 10;
			selfS.statbarOffset = 0;
			if (!selfS.isBackSprite) selfS.statbarOffset = 17 * slot;
			if (selfS.isBackSprite) selfS.statbarOffset = -7 * slot;

			// make sure element is in the right z-order
			if (!slot && selfS.isBackSprite || slot && !selfS.isBackSprite) {
				selfS.elem.prependTo(selfS.elem.parent());
			} else {
				selfS.elem.appendTo(selfS.elem.parent());
			}

			var pos = self.pos(selfS, {
				w: 0,
				h: 96
			});
			selfS.top = parseInt(pos.top + 40);
			selfS.left = parseInt(pos.left);

			selfS.anim();
			selfS.elem.css({
				// 'z-index': (selfS.isBackSprite ? 1+slot : 4-slot),
				position: 'absolute',
				opacity: 0,
				display: 'block'
			});
			selfS.elem.css(self.pos({
				x: selfS.leftof(-50),
				y: selfS.y,
				z: selfS.z,
				opacity: 0
			}, selfS.sp));
			selfS.elem.delay(300).animate(self.posT({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z
			}, selfS.sp, 'decel'), 400);
			selfS.w = sp.w;
			selfS.h = sp.h;
			self.activityWait(selfS.elem);
			self.animationDelay = 700;
		};
		this.animDragOut = function () {
			selfS.removeSub();
			if (self.fastForward) return selfS.animUnsummon(true);
			selfS.elem.animate(self.posT({
				x: selfS.leftof(50),
				y: selfS.y,
				z: selfS.z,
				opacity: 0
			}, selfS.sp, 'accel'), 400);
		};
		this.animUnsummon = function (instant) {
			selfS.removeSub();
			if (self.fastForward || instant) {
				selfS.elem.css('display', 'none');
				return;
			}
			selfS.anim({
				x: selfS.x,
				y: selfS.y - 40,
				z: selfS.z,
				scale: 0,
				opacity: 0,
				time: 400
			});
			self.showEffect('pokeball', {
				opacity: 1,
				x: selfS.x,
				y: selfS.y - 40,
				z: selfS.z,
				scale: .7,
				time: 300
			}, {
				opacity: 0,
				x: selfS.x,
				y: selfS.y,
				z: selfS.behind(50),
				time: 700
			}, 'ballistic2');
			self.activityWait(selfS.elem);
		};
		this.animFaint = function () {
			selfS.removeSub();
			if (self.fastForward) {
				selfS.elem.remove();
				selfS.elem = null;
				return;
			}
			selfS.anim({
				y: selfS.y - 80,
				opacity: 0
			}, 'accel');
			self.activityWait(selfS.elem);
		};
		this.delay = function (time) {
			selfS.elem.delay(time);
			if (selfS.subElem) {
				selfS.subElem.delay(time);
			};
			return selfS;
		};
		this.selfAnim = function (end, transition) {
			if (!end) return;
			end = $.extend({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, end);
			if (selfS.subElem && !selfS.duringMove) {
				end.z += (selfS.isBackSprite ? -1 : 1) * 30;
				end.opacity *= .3;
			}
			selfS.elem.animate(self.posT(end, selfS.sp, transition, selfS), end.time);
		};
		this.anim = function (end, transition) {
			if (!end) return;
			end = $.extend({
				x: selfS.x,
				y: selfS.y,
				z: selfS.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, end);
			if (selfS.subElem && !selfS.duringMove) {
				selfS.subElem.animate(self.posT(end, selfS.subsp, transition, selfS), end.time);
			} else {
				selfS.elem.animate(self.posT(end, selfS.sp, transition, selfS), end.time);
			}
		};
		if (!spriteData) {
			this.delay = function () {};
			this.anim = function () {};
		}
	};
	this.backgroundEffect = function (bg, duration, opacity, delay) {
		if (!opacity) {
			opacity = 1;
		}
		if (!delay) delay = 0;
		self.bgEffectElem.append('<div class="background"></div>');
		var elem = self.bgEffectElem.children().last();
		elem.css({
			background: bg,
			display: 'block',
			opacity: 0
		});
		elem.delay(delay).animate({
			opacity: opacity
		}, 250).delay(duration - 250);
		elem.animate({
			opacity: 0
		}, 250);
	}
	this.showEffect = function (img, start, end, transition, after) {
		var effect = img;
		if (img && img.length) effect = BattleEffects[img];
		if (!start.time) start.time = 0;
		if (!end.time) end.time = start.time + 500;
		start.time += self.animationDelay;
		end.time += self.animationDelay;
		if (!end.scale && end.scale !== 0) end.scale = start.scale;
		if (!end.xscale && end.xscale !== 0) end.xscale = start.xscale;
		if (!end.yscale && end.yscale !== 0) end.yscale = start.yscale;
		end = $.extend({}, start, end);

		var startpos = self.pos(start, effect);
		var endpos = self.posT(end, effect, transition, start);

		self.fxElem.append('<img src="' + effect.url + '" style="display:none;position:absolute" />');
		var effectElem = self.fxElem.children().last();
		effectElem.css({
			display: 'block',
			opacity: 0
		});
		effectElem.css(startpos);
		effectElem.css({
			opacity: 0
		});

		if (start.time) {
			effectElem.delay(start.time).animate({
				opacity: startpos.opacity
			}, 1);
		} else {
			effectElem.css('opacity', startpos.opacity);
		}
		effectElem.animate(endpos, end.time - start.time);
		if (after === 'fade') {
			effectElem.animate({
				opacity: 0
			}, 100);
		}
		if (after === 'explode') {
			if (end.scale) end.scale *= 3;
			if (end.xscale) end.xscale *= 3;
			if (end.yscale) end.yscale *= 3;
			end.opacity = 0;
			var endendpos = self.pos(end, effect);
			effectElem.animate(endendpos, 200);
		}
		self.activityWait(effectElem);
	};

	this.Side = function (n) {
		var selfS = this;
		this.battle = self;

		this.name = '';
		this.id = '';
		this.initialized = false;
		this.n = n;
		this.foe = null;
		this.spriteid = 262;
		this.totalPokemon = 6;
		this.rollSprites = function () {
			var sprites = [1, 2, 101, 102, 169, 170];
			selfS.spriteid = sprites[parseInt(Math.random() * sprites.length)];
		};

		this.behindx = function (offset) {
			return selfS.x + (!selfS.n ? -1 : 1) * offset;
		}
		this.behindy = function (offset) {
			return selfS.y + (!selfS.n ? 1 : -1) * offset;
		}
		this.leftof = function (offset) {
			return (!selfS.n ? -1 : 1) * offset;
		};
		this.behind = function (offset) {
			return selfS.z + (!selfS.n ? -1 : 1) * offset;
		};
		if (n == 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			this.x = 0;
			this.y = 0;
			this.z = 200;
		}
		this.missedPokemon = {
			sprite: new self.Sprite(null, selfS.leftof(-100), selfS.y, selfS.z, selfS.n)
		};

		this.sideConditions = {};
		this.wisher = null;

		this.active = [null];
		this.lastPokemon = null;
		this.pokemon = [];

		this.reset = function () {
			selfS.updateSprites();
			selfS.sideConditions = {};
			for (var i = 0; i < selfS.pokemon.length; i++) {
				selfS.pokemon[i].reset();
			}
		};
		this.updateSprites = function () {
			selfS.z = (selfS.n ? 200 : 0);
			selfS.missedPokemon.sprite.destroy();
			selfS.missedPokemon = {
				sprite: new self.Sprite(null, selfS.leftof(-100), selfS.y, selfS.z, selfS.n)
			};
			for (var i = 0; i < selfS.pokemon.length; i++) {
				poke = selfS.pokemon[i];
				poke.sprite.destroy();
				poke.sprite = new self.Sprite(Tools.getSpriteData(poke, selfS.n, {afd: self.tier === "[Seasonal] Fools Festival"}), selfS.x, selfS.y, selfS.z, selfS.n);
			}
		};
		this.setSprite = function (spriteid) {
			selfS.spriteid = spriteid;
			selfS.updateSidebar();
		};
		this.setName = function (name, spriteid) {
			selfS.name = (name||'');
			selfS.id = toId(selfS.name);
			if (spriteid) selfS.spriteid = spriteid;
			else if (selfS.id === "Serei") selfS.spriteid = 172;
			else if (selfS.id === "Hob'sGoblin") selfS.spriteid = 52;
			else if (selfS.id === "EtherealSol") selfS.spriteid = 1001;
			else if (selfS.id === "Morty(GymLeader)") selfS.spriteid = 144;
			else if (selfS.id === "aeo") selfS.spriteid = 167;
			else if (selfS.id === "aeo1") selfS.spriteid = 167;
			else if (selfS.id === "aeo2") selfS.spriteid = 166;
			else if (selfS.id === "sharktamer") selfS.spriteid = 7;
			else if (selfS.id === "bmelts") selfS.spriteid = 226;
			else {
				selfS.rollSprites();
				if (selfS.foe && selfS.spriteid === selfS.foe.spriteid) selfS.rollSprites();
			}
			selfS.initialized = true;
			if (!name) {
				selfS.initialized = false;
			}
			selfS.updateSidebar();
			if (self.stagnateCallback) self.stagnateCallback(self);
		};
		this.getTeamName = function () {
			if (selfS === self.mySide) return "Your team";
			return "The opposing team";
		};
		this.getLowerTeamName = function () {
			if (selfS === self.mySide) return "your team";
			return "the opposing team";
		};
		this.updateSidebar = function () {
			var pokemonhtml = '';
			for (var i = 0; i < 6; i++) {
				poke = selfS.pokemon[i];
				if (i >= selfS.totalPokemon) {
					pokemonhtml += '<span class="pokemonicon" style="'+Tools.getIcon('pokeball-none')+'"></span>';
				} else if (!poke) {
					//pokemonhtml += '<img src="/fx/pokeball.png" title="Not revealed" />';
					pokemonhtml += '<span class="pokemonicon" style="'+Tools.getIcon('pokeball')+'" title="Not revealed"></span>';
				//} else if (poke.fainted) {
					//pokemonhtml += '<img src="/fx/pokeball.png" style="opacity:0.3;filter:alpha(opacity=30)" title="' + poke.getFullName(true) + '" />';
				} else {
					//pokemonhtml += '<img src="/fx/pokeball.png" title="' + poke.getFullName(true) + '" />';
					pokemonhtml += '<span class="pokemonicon" style="'+Tools.getIcon(poke)+'" title="' + poke.getFullName(true) + '"></span>';
				}
				if (i % 3 === 2) pokemonhtml += '</div><div class="teamicons">';
			}
			pokemonhtml = '<div class="teamicons">' + pokemonhtml + '</div>';
			if (selfS.n === 1) {
				if (selfS.initialized) self.rightbarElem.html('<div class="trainer"><strong>' + Tools.escapeHTML(selfS.name) + '</strong><div class="trainersprite" style="background-image:url(' + Tools.resolveAvatar(selfS.spriteid) + ')"></div>' + pokemonhtml + '</div>').find('.trainer').css('opacity',1);
				else self.rightbarElem.find('.trainer').css('opacity',0.4);
			} else {
				if (selfS.initialized) self.leftbarElem.html('<div class="trainer"><strong>' + Tools.escapeHTML(selfS.name) + '</strong><div class="trainersprite" style="background-image:url(' + Tools.resolveAvatar(selfS.spriteid) + ')"></div>' + pokemonhtml + '</div>').find('.trainer').css('opacity',1);
				else self.leftbarElem.find('.trainer').css('opacity',0.4);
			}
		};
		this.addSideCondition = function (condition) {
			condition = toId(condition);
			if (selfS.sideConditions[condition]) {
				if (condition === 'spikes' || condition === 'toxicspikes') {
					selfS.sideConditions[condition][2]++;
					if (condition === 'spikes' && selfS.sideConditions[condition][2] == 2) {
						self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
						curelem = self.spriteElemsFront[selfS.n].children().last();
						curelem.css(self.pos({
							display: 'block',
							x: selfS.x + 50,
							y: selfS.y - 40,
							z: selfS.z,
							scale: .3
						}, BattleEffects.caltrop));
						selfS.sideConditions['spikes'][1] = selfS.sideConditions['spikes'][1].add(curelem);
					} else if (condition === 'spikes') {
						self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
						curelem = self.spriteElemsFront[selfS.n].children().last();
						curelem.css(self.pos({
							display: 'block',
							x: selfS.x + 30,
							y: selfS.y - 45,
							z: selfS.z,
							scale: .3
						}, BattleEffects.caltrop));
						selfS.sideConditions['spikes'][1] = selfS.sideConditions['spikes'][1].add(curelem);
					} else if (condition === 'toxicspikes') {
						self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.poisoncaltrop.url + '" style="display:none;position:absolute" />');
						curelem = self.spriteElemsFront[selfS.n].children().last();
						curelem.css(self.pos({
							display: 'block',
							x: selfS.x - 15,
							y: selfS.y - 35,
							z: selfS.z,
							scale: .3
						}, BattleEffects.poisoncaltrop));
						selfS.sideConditions['toxicspikes'][1] = selfS.sideConditions['toxicspikes'][1].add(curelem);
					}
				}
				return;
			}
			var elem, curelem;
			switch (condition) {
			case 'reflect':
				self.spriteElemsFront[selfS.n].append('<div class="sidecondition-reflect" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-17),
					xscale: 1,
					yscale: 0,
					opacity: .1
				}, BattleEffects.none)).animate(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-17),
					xscale: 1,
					yscale: .5,
					opacity: .7
				}, BattleEffects.none)).animate({
					opacity: .3
				}, 300);
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 5];
				break;
			case 'safeguard':
				self.spriteElemsFront[selfS.n].append('<div class="sidecondition-safeguard" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-20),
					xscale: 1,
					yscale: 0,
					opacity: .1
				}, BattleEffects.none)).animate(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-20),
					xscale: 1,
					yscale: .5,
					opacity: .7
				}, BattleEffects.none)).animate({
					opacity: .2
				}, 300);
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 5];
				break;
			case 'lightscreen':
				self.spriteElemsFront[selfS.n].append('<div class="sidecondition-lightscreen" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-23),
					xscale: 1,
					yscale: 0,
					opacity: .1
				}, BattleEffects.none)).animate(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-23),
					xscale: 1,
					yscale: .5,
					opacity: .7
				}, BattleEffects.none)).animate({
					opacity: .3
				}, 300);
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 5];
				break;
			case 'mist':
				self.spriteElemsFront[selfS.n].append('<div class="sidecondition-mist" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-27),
					xscale: 1,
					yscale: 0,
					opacity: .1
				}, BattleEffects.none)).animate(self.pos({
					x: selfS.x,
					y: selfS.y,
					z: selfS.behind(-27),
					xscale: 1,
					yscale: .5,
					opacity: .7
				}, BattleEffects.none)).animate({
					opacity: .2
				}, 300);
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 5];
				break;
			case 'tailwind':
				selfS.sideConditions[condition] = [condition, null, 5];
				break;
			case 'stealthrock':
				self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.rock1.url + '" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.leftof(-40),
					y: selfS.y - 10,
					z: selfS.z,
					opacity: .5,
					scale: .3
				}, BattleEffects.rock1));
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 1];
				break;
			case 'spikes':
				self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x - 25,
					y: selfS.y - 40,
					z: selfS.z,
					scale: .3
				}, BattleEffects.caltrop));
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 1];
				break;
			case 'toxicspikes':
				self.spriteElemsFront[selfS.n].append('<img src="' + BattleEffects.poisoncaltrop.url + '" style="display:none;position:absolute" />');
				curelem = self.spriteElemsFront[selfS.n].children().last();
				curelem.css(self.pos({
					display: 'block',
					x: selfS.x + 5,
					y: selfS.y - 40,
					z: selfS.z,
					scale: .3
				}, BattleEffects.poisoncaltrop));
				elem = curelem;
				selfS.sideConditions[condition] = [condition, elem, 1];
				break;
			default:
				selfS.sideConditions[condition] = [condition, null, 1];
			}
		};
		this.removeSideCondition = function (condition) {
			condition = toId(condition);
			if (!selfS.sideConditions[condition]) return;
			if (selfS.sideConditions[condition][1]) selfS.sideConditions[condition][1].remove();
			delete selfS.sideConditions[condition];
		};
		this.newPokemon = function (species, replaceSlot) {
			var id;
			var pokeobj;
			if (species.species) {
				pokeobj = species;
				species = pokeobj.species;
				id = pokeobj.id;
			}
			var poke = Tools.getTemplate(species);
			poke = $.extend(new Pokemon(species), poke);
			poke.side = selfS;
			poke.atkStat = 10;
			poke.defStat = 10;
			poke.spaStat = 10;
			poke.spdStat = 10;
			poke.maxhp = 1000;
			if (pokeobj) poke = $.extend(poke, pokeobj);
			if (!poke.ability && poke.baseAbility) poke.ability = poke.baseAbility;
			poke.id = id;
			poke.reset();
			poke.sprite = new self.Sprite(Tools.getSpriteData(poke, selfS.n, {afd: self.tier === "[Seasonal] Fools Festival"}), selfS.x, selfS.y, selfS.z, selfS.n);

			if (typeof replaceSlot !== 'undefined') {
				selfS.pokemon[replaceSlot] = poke;
			} else {
				selfS.pokemon.push(poke);
			}
			if (selfS.pokemon.length == 7) {
				// something's wrong
				self.logConsole('corruption');

				// the other possibility is Illusion, which we'll assume
				var existingTable = {};
				for (var i=0; i<6; i++) {
					var poke1 = selfS.pokemon[i];
					if (existingTable[poke1.searchid]) {
						var j = existingTable[poke1.searchid];
						var poke2 = selfS.pokemon[j];
						if (selfS.active.indexOf(poke1) >= 0) {
							selfS.pokemon.splice(j,1);
						} else if (selfS.active.indexOf(poke2) >= 0) {
							selfS.pokemon.splice(i,1);
						} else if (poke1.fainted && !poke2.fainted) {
							selfS.pokemon.splice(j,1);
						} else {
							selfS.pokemon.splice(i,1);
						}
						break;
					}
					existingTable[poke1.searchid] = i;
				}
			}
			selfS.updateSidebar();

			return poke;
		};

		this.getStatbarHTML = function (pokemon) {
			var gender = '';
			if (pokemon.gender === 'F') gender = ' <small style="color:#C57575">&#9792;</small>';
			if (pokemon.gender === 'M') gender = ' <small style="color:#7575C0">&#9794;</small>';
			return '<div class="statbar' + (selfS.n ? ' lstatbar' : ' rstatbar') + '"><strong>' + Tools.escapeHTML(pokemon.name) + gender + (pokemon.level === 100 ? '' : ' <small>L' + pokemon.level + '</small>') + '</strong><div class="hpbar"><div class="hptext"></div><div class="hptextborder"></div><div class="prevhp"><div class="hp"></div></div><div class="status"></div></div>';
		};
		this.switchIn = function (pokemon, slot) {
			if (slot === undefined) slot = pokemon.slot;
			selfS.active[slot] = pokemon;
			pokemon.slot = slot;
			pokemon.clearVolatile();
			pokemon.lastmove = '';
			self.lastmove = 'switch-in';
			if (selfS.lastPokemon && selfS.lastPokemon.lastmove === 'batonpass') {
				pokemon.copyVolatileFrom(selfS.lastPokemon);
			}

			if (pokemon.side.n === 0) {
				self.message('Go! ' + pokemon.getFullName() + '!');
			} else {
				self.message('' + Tools.escapeHTML(pokemon.side.name) + ' sent out ' + pokemon.getFullName() + '!');
			}

			pokemon.sprite.animSummon(slot);
			if (pokemon.hasVolatile('substitute')) {
				pokemon.sprite.animSub();
			}
			if (pokemon.statbarElem) {
				pokemon.statbarElem.remove();
			}
			self.statElem.append(selfS.getStatbarHTML(pokemon));
			pokemon.statbarElem = self.statElem.children().last();
			selfS.updateStatbar(pokemon, true);
			pokemon.side.updateSidebar();
			if (self.fastForward) {
				pokemon.statbarElem.css({
					display: 'block',
					left: pokemon.sprite.left - 80,
					top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
					opacity: 1
				});
				if (self.switchCallback) self.switchCallback(self, selfS);
				return;
			}
			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 53 - pokemon.sprite.statbarOffset,
				opacity: 0
			});
			pokemon.statbarElem.delay(300).animate({
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			}, 400);

			self.dogarsCheck(pokemon);

			if (self.switchCallback) self.switchCallback(self, selfS);
		};
		this.dragIn = function (pokemon, slot) {
			if (slot === undefined) slot = pokemon.slot;
			self.message('' + pokemon.getFullName() + ' was dragged out!');
			if (pokemon === selfS.active[slot]) return;
			var oldpokemon = selfS.active[slot];
			selfS.lastPokemon = oldpokemon;
			if (oldpokemon) oldpokemon.clearVolatile();
			pokemon.clearVolatile();
			pokemon.lastmove = '';
			self.lastmove = 'switch-in';
			selfS.active[slot] = pokemon;

			if (oldpokemon === pokemon) return;

			if (oldpokemon) {
				oldpokemon.sprite.animDragOut();
			}
			pokemon.sprite.animDragIn(slot);
			if (pokemon.statbarElem) {
				pokemon.statbarElem.remove();
			}
			self.statElem.append(selfS.getStatbarHTML(pokemon));
			pokemon.statbarElem = self.statElem.children().last();
			selfS.updateStatbar(pokemon, true);
			if (self.fastForward) {
				if (oldpokemon) {
					oldpokemon.statbarElem.remove();
					oldpokemon.statbarElem = null;
				}
				pokemon.statbarElem.css({
					display: 'block',
					left: (selfS.n == 0 ? 100 : 340),
					top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
					opacity: 1
				});
				if (self.dragCallback) self.dragCallback(self, selfS);
				return;
			}
			if (selfS.n == 0) {
				if (oldpokemon) {
					oldpokemon.statbarElem.animate({
						left: pokemon.sprite.left - 130,
						opacity: 0
					}, 400, function () {
						oldpokemon.statbarElem.remove();
						oldpokemon.statbarElem = null;
					});
				}
				pokemon.statbarElem.css({
					display: 'block',
					left: pokemon.sprite.left - 30,
					top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
					opacity: 0
				});
				pokemon.statbarElem.delay(300).animate({
					left: pokemon.sprite.left - 80,
					opacity: 1
				}, 400);
			} else {
				if (oldpokemon) {
					oldpokemon.statbarElem.animate({
						left: pokemon.sprite.left - 30,
						opacity: 0
					}, 400, function () {
						oldpokemon.statbarElem.remove();
						oldpokemon.statbarElem = null;
					});
				}
				pokemon.statbarElem.css({
					display: 'block',
					left: pokemon.sprite.left - 130,
					top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
					opacity: 0
				});
				pokemon.statbarElem.delay(300).animate({
					left: pokemon.sprite.left - 80,
					opacity: 1
				}, 400);
			}

			self.dogarsCheck(pokemon);

			if (self.dragCallback) self.dragCallback(self, selfS);
		};
		this.replace = function (pokemon, slot) {
			if (slot === undefined) slot = pokemon.slot;
			var oldpokemon = selfS.active[slot];
			if (pokemon === oldpokemon) return;
			selfS.lastPokemon = oldpokemon;
			pokemon.clearVolatile();
			if (oldpokemon) {
				pokemon.lastmove = oldpokemon.lastmove;
				pokemon.hp = oldpokemon.hp;
				pokemon.maxhp = oldpokemon.maxhp;
				pokemon.status = oldpokemon.status;
				pokemon.copyVolatileFrom(oldpokemon, true);
			}
			selfS.active[slot] = pokemon;

			if (oldpokemon) {
				oldpokemon.sprite.animUnsummon(true);
			}
			pokemon.sprite.animSummon(slot, true);
			if (oldpokemon) {
				oldpokemon.statbarElem.remove();
				oldpokemon.statbarElem = null;
			}
			if (pokemon.statbarElem) {
				pokemon.statbarElem.remove();
			}
			self.statElem.append(selfS.getStatbarHTML(pokemon));
			pokemon.statbarElem = self.statElem.children().last();
			selfS.updateStatbar(pokemon, true);
			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			});
			// not sure if we want a different callback
			if (self.dragCallback) self.dragCallback(self, selfS);
		};
		this.switchOut = function (pokemon, slot) {
			if (slot === undefined) slot = pokemon.slot;
			if (pokemon.lastmove !== 'batonpass') {
				pokemon.clearVolatile();
			} else {
				pokemon.removeVolatile('transform');
				pokemon.removeVolatile('formechange');
			}
			if (pokemon.lastmove === 'uturn' || pokemon.lastmove === 'voltswitch') {
				self.message('' + pokemon.getName() + ' went back to ' + Tools.escapeHTML(pokemon.side.name) + '!');
			} else if (pokemon.lastmove !== 'batonpass') {
				if (pokemon.side.n === 0) {
					self.message('' + pokemon.getName() + ', come back!');
				} else {
					self.message('' + Tools.escapeHTML(pokemon.side.name) + ' withdrew ' + pokemon.getFullName() + '!');
				}
			}
			selfS.lastPokemon = pokemon;
			selfS.active[slot] = null;

			selfS.updateStatbar(pokemon, true);
			pokemon.sprite.animUnsummon();
			if (self.fastForward) {
				pokemon.statbarElem.remove();
				pokemon.statbarElem = null;
				return;
			}
			pokemon.statbarElem.animate({
				top: pokemon.sprite.top - 43 - pokemon.sprite.statbarOffset,
				opacity: 0
			}, 300, function () {
				pokemon.statbarElem.remove();
				pokemon.statbarElem = null;
			});
			//pokemon.statbarElem.done(pokemon.statbarElem.remove());
		};
		this.swapTo = function (pokemon, slot, kwargs) {
			if (pokemon.slot === slot) return;
			var target = selfS.active[slot];

			if (!kwargs.silent) {
				var fromeffect = Tools.getEffect(kwargs.from);
				switch (fromeffect.id) {
					case 'allyswitch':		
						self.message('<small>' + pokemon.getName() + ' and ' + target.getLowerName() + ' switched places.</small>');
						break;
					default:
						self.message('<small>' + pokemon.getName() + ' moved to the center!</small>');
						break;
				}
			}

			var oslot = pokemon.slot;

			if (target) target.slot = pokemon.slot;
			pokemon.slot = slot;
			selfS.active[slot] = pokemon;
			selfS.active[oslot] = target;

			if (pokemon.hasVolatile('substitute')) pokemon.sprite.animSubFade();
			if (target && target.hasVolatile('substitute')) target.sprite.animSubFade();

			pokemon.sprite.animUnsummon(true);
			if (target) target.sprite.animUnsummon(true);

			pokemon.sprite.animSummon(slot, true);
			if (target) target.sprite.animSummon(oslot, true);

			if (pokemon.hasVolatile('substitute')) pokemon.sprite.animSub();
			if (target && target.hasVolatile('substitute')) target.sprite.animSub();

			if (pokemon.statbarElem) {
				pokemon.statbarElem.remove();
			}
			if (target && target.statbarElem) {
				target.statbarElem.remove();
			}

			self.statElem.append(selfS.getStatbarHTML(pokemon));
			pokemon.statbarElem = self.statElem.children().last();
			if (target) {
				self.statElem.append(selfS.getStatbarHTML(target));
				target.statbarElem = self.statElem.children().last();
			}

			selfS.updateStatbar(pokemon, true);
			if (target) selfS.updateStatbar(target, true);

			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			});
			if (target) target.statbarElem.css({
				display: 'block',
				left: target.sprite.left - 80,
				top: target.sprite.top - 73 - target.sprite.statbarOffset,
				opacity: 1
			});
		};
		this.swapWith = function (pokemon, target, kwargs) {
			if (pokemon === target) return;

			if (!kwargs.silent) {
				var fromeffect = Tools.getEffect(kwargs.from);
				switch (fromeffect.id) {
					case 'allyswitch':
						self.message('<small>' + pokemon.getName() + ' and ' + target.getLowerName() + ' switched places.</small>');
						break;
				}
			}

			var oslot = pokemon.slot;
			var nslot = target.slot;

			pokemon.slot = nslot;
			target.slot = oslot;
			selfS.active[nslot] = pokemon;
			selfS.active[oslot] = target;

			pokemon.sprite.animUnsummon(true);
			target.sprite.animUnsummon(true);

			pokemon.sprite.animSummon(nslot, true);
			target.sprite.animSummon(oslot, true);

			if (pokemon.statbarElem) {
				pokemon.statbarElem.remove();
			}
			if (target.statbarElem) {
				target.statbarElem.remove();
			}

			self.statElem.append(selfS.getStatbarHTML(pokemon));
			pokemon.statbarElem = self.statElem.children().last();
			self.statElem.append(selfS.getStatbarHTML(target));
			target.statbarElem = self.statElem.children().last();

			selfS.updateStatbar(pokemon, true);
			selfS.updateStatbar(target, true);

			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			});
			target.statbarElem.css({
				display: 'block',
				left: target.sprite.left - 80,
				top: target.sprite.top - 73 - target.sprite.statbarOffset,
				opacity: 1
			});
		};
		this.faint = function (pokemon, slot) {
			if (slot === undefined) slot = pokemon.slot;
			pokemon.clearVolatile();
			selfS.lastPokemon = pokemon;
			selfS.active[slot] = null;

			self.message('' + pokemon.getName() + ' fainted!');

			pokemon.fainted = true;
			pokemon.zerohp = true;
			pokemon.hp = 0;
			pokemon.side.updateStatbar(pokemon, false, true);
			pokemon.side.updateSidebar();

			pokemon.sprite.animFaint();
			pokemon.statbarElem.animate({
				opacity: 0
			}, 300, function () {
				pokemon.statbarElem.remove();
				pokemon.statbarElem = null;
			});
			if (self.faintCallback) self.faintCallback(self, selfS);
		};
		this.updateHPText = function (pokemon) {
			var $hptext = pokemon.statbarElem.find('.hptext');
			var $hptextborder = pokemon.statbarElem.find('.hptextborder');
			if (pokemon.maxhp === 48) {
				$hptext.hide();
				$hptextborder.hide();
			} else {
				$hptext.html(pokemon.hpWidth(100) + '%');
				$hptext.show();
				$hptextborder.show();
			}
		};
		this.updateStatbar = function (pokemon, updatePrevhp, updateHp) {
			if (!pokemon) {
				if (selfS.active[0]) selfS.updateStatbar(selfS.active[0], updatePrevhp, updateHp);
				if (selfS.active[1]) selfS.updateStatbar(selfS.active[1], updatePrevhp, updateHp);
				if (selfS.active[2]) selfS.updateStatbar(selfS.active[2], updatePrevhp, updateHp);
				return;
			}
			if (!pokemon || !pokemon.statbarElem) {
				return;
			}
			var hpcolor;
			if (updatePrevhp || updateHp) {
				hpcolor = pokemon.getHPColor();
				var w = pokemon.hpWidth(150);
				var $hp = pokemon.statbarElem.find('.hp');
				$hp.css({
					width: w,
					'border-right-width': (w ? 1 : 0)
				});
				if (hpcolor === 'g') $hp.removeClass('hp-yellow hp-red');
				else if (hpcolor === 'y') $hp.removeClass('hp-red').addClass('hp-yellow');
				else $hp.addClass('hp-red');
				selfS.updateHPText(pokemon);
			}
			if (updatePrevhp) {
				var $prevhp = pokemon.statbarElem.find('.prevhp');
				$prevhp.css('width', pokemon.hpWidth(150) + 1);
				if (hpcolor === 'g') $prevhp.removeClass('prevhp-yellow prevhp-red');
				else if (hpcolor ==='y' ) $prevhp.removeClass('prevhp-red').addClass('prevhp-yellow');
				else $prevhp.addClass('prevhp-red');
			}
			var status = '';
			if (pokemon.status === 'brn') {
				status += '<span class="brn">BRN</span> ';
			} else if (pokemon.status === 'psn') {
				status += '<span class="psn">PSN</span> ';
			} else if (pokemon.status === 'tox') {
				status += '<span class="psn">TOX</span> ';
			} else if (pokemon.status === 'slp') {
				status += '<span class="slp">SLP</span> ';
			} else if (pokemon.status === 'par') {
				status += '<span class="par">PAR</span> ';
			} else if (pokemon.status === 'frz') {
				status += '<span class="frz">FRZ</span> ';
			}
			for (x in pokemon.boosts) {
				if (pokemon.boosts[x]) {
					status += '<span class="' + pokemon.getBoostType(x) + '">' + pokemon.getBoost(x) + '</span> ';
				}
			}
			var statusTable = {
				confusion: '<span class="bad">Confused</span> ',
				healblock: '<span class="bad">Heal&nbsp;Block</span> ',
				yawn: '<span class="bad">Drowsy</span> ',
				flashfire: '<span class="good">Flash&nbsp;Fire</span> ',
				imprison: '<span class="good">Imprisoning&nbsp;foe</span> ',
				formechange: '',
				typechange: '',
				typeadd: '',
				autotomize: '<span class="neutral">Lightened</span> ',
				miracleeye: '<span class="bad">Miracle&nbsp;Eye</span> ',
				foresight: '<span class="bad">Foresight</span> ',
				telekinesis: '<span class="neutral">Telekinesis</span> ',
				transform: '<span class="neutral">Transformed</span> ',
				powertrick: '<span class="neutral">Power&nbsp;Trick</span> ',
				curse: '<span class="bad">Curse</span> ',
				nightmare: '<span class="bad">Nightmare</span> ',
				attract: '<span class="bad">Attract</span> ',
				torment: '<span class="bad">Torment</span> ',
				taunt: '<span class="bad">Taunt</span> ',
				disable: '<span class="bad">Disable</span> ',
				embargo: '<span class="bad">Embargo</span> ',
				ingrain: '<span class="good">Ingrain</span> ',
				aquaring: '<span class="good">Aqua&nbsp;Ring</span> ',
				stockpile1: '<span class="good">Stockpile</span> ',
				stockpile2: '<span class="good">Stockpile&times;2</span> ',
				stockpile3: '<span class="good">Stockpile&times;3</span> ',
				perish1: '<span class="bad">Perish&nbsp;next&nbsp;turn</span> ',
				perish2: '<span class="bad">Perish&nbsp;in&nbsp;2</span> ',
				perish3: '<span class="bad">Perish&nbsp;in&nbsp;3</span> ',
				airballoon: '<span class="good">Balloon</span> ',
				leechseed: '<span class="bad">Leech&nbsp;Seed</span> ',
				encore: '<span class="bad">Encore</span> ',
				mustrecharge: '<span class="bad">Must&nbsp;recharge</span> ',
				bide: '<span class="good">Bide</span> ',
				magnetrise: '<span class="good">Magnet&nbsp;Rise</span> ',
				smackdown: '<span class="bad">Smack&nbsp;Down</span> ',
				focusenergy: '<span class="good">Focus&nbsp;Energy</span> ',
				slowstart: '<span class="bad">Slow&nbsp;Start</span> ',
				doomdesire: '',
				futuresight: '',
				mimic: '<span class="good">Mimic</span> ',
				watersport: '<span class="good">Water&nbsp;Sport</span> ',
				mudsport: '<span class="good">Mud&nbsp;Sport</span> ',
				substitute: '',
				// sub graphics are handled elsewhere, see Battle.Sprite.animSub()
				uproar: '<span class="neutral">Uproar</span>',
				roost: '<span class="neutral">Landed</span>',
				protect: '<span class="good">Protect</span>',
				quickguard: '<span class="good">Quick&nbsp;Guard</span>',
				wideguard: '<span class="good">Wide&nbsp;Guard</span>',
				helpinghand: '<span class="good">Helping&nbsp;Hand</span>',
				magiccoat: '<span class="good">Magic&nbsp;Coat</span>',
				destinybond: '<span class="good">Destiny&nbsp;Bond</span>',
				snatch: '<span class="good">Snatch</span>',
				grudge: '<span class="good">Grudge</span>',
				endure: '<span class="good">Endure</span>',
				focuspunch: '<span class="neutral">Focusing</span>',
				powder: '<span class="bad">Powder</span>',
				ragepowder: '<span class="good">Rage Powder</span>',
				followme: '<span class="good">Follow Me</span>'
			};
			for (i in pokemon.volatiles) {
				if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[['+i+']]</span>';
				else status += statusTable[i];
			}
			for (i in pokemon.turnstatuses) {
				if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[['+i+']]</span>';
				else status += statusTable[i];
			}
			for (i in pokemon.movestatuses) {
				if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[['+i+']]</span>';
				else status += statusTable[i];
			}
			var statusbar = pokemon.statbarElem.find('.status');
			statusbar.html(status);
		}
	};
	this.sidesSwitched = false;
	this.switchSides = function () {
		self.sidesSwitched = !self.sidesSwitched;
		if (self.sidesSwitched) {
			self.mySide = self.p2;
			self.yourSide = self.p1;
		} else {
			self.mySide = self.p1;
			self.yourSide = self.p2;
		}
		self.mySide.n = 0;
		self.yourSide.n = 1;
		self.sides[0] = self.mySide;
		self.sides[1] = self.yourSide;

		self.mySide.updateSidebar();
		self.mySide.updateSprites();
		self.yourSide.updateSidebar();
		self.yourSide.updateSprites();
		// nothing else should need updating - don't call this function after sending out pokemon
	}

	this.messageActive = false;
	this.message = function (message, hiddenmessage) {
		if (message && !self.messageActive) {
			self.log('<div class="spacer"></div>');
		}
		if (message && !self.fastForward) {
			if (!self.messageActive) {
				self.messagebarElem.empty();
				self.messagebarElem.css({
					display: 'block',
					opacity: 0,
					height: 'auto'
				});
				self.messagebarElem.animate({
					opacity: 1
				}, 300);
			}
			self.hiddenMessageElem.append('<p></p>');
			var messageElem = self.hiddenMessageElem.children().last();
			messageElem.html(message);
			messageElem.css({
				display: 'block',
				opacity: 0
			});
			messageElem.animate({
				height: 'hide'
			}, 1, function () {
				messageElem.appendTo(self.messagebarElem);
				messageElem.animate({
					height: 'show',
					'padding-bottom': 4,
					opacity: 1
				}, 300);
			});
			self.activityWait(messageElem);
		}
		self.messageActive = true;
		self.log('<div>' + message + (hiddenmessage ? hiddenmessage : '') + '</div>');
	}
	this.endAction = function () {
		if (self.messageActive) {
			self.messageActive = false;
			if (!self.fastForward) {
				self.messagebarElem.delay(self.messageDelay).animate({
					height: 'toggle',
					opacity: 0
				}, 300);
				self.activityWait(self.messagebarElem);
			}
		}
	}

	//
	// activities
	//
	this.start = function () {
		self.log('<div>Battle between ' + Tools.escapeHTML(self.p1.name) + ' and ' + Tools.escapeHTML(self.p2.name) + ' started!</div>');
		if (self.startCallback) self.startCallback(self);
	}
	this.winner = function (winner) {
		if (winner) self.message('' + Tools.escapeHTML(winner) + ' won the battle!');
		else self.message('Tie between ' + Tools.escapeHTML(self.p1.name) + ' and ' + Tools.escapeHTML(self.p2.name) + '!');
		self.done = 1;
	}
	this.prematureEnd = function () {
		self.message('This replay ends here.');
		self.done = 1;
	}
	this.endLastTurn = function() {
		if (self.endLastTurnPending) {
			self.endLastTurnPending = false;
			self.mySide.updateStatbar(null, true);
			self.yourSide.updateStatbar(null, true);
		}
	}
	this.setTurn = function (turnnum) {
		turnnum = parseInt(turnnum);
		if (turnnum == self.turn+1) {
			self.endLastTurnPending = true;
		}
		self.turn = turnnum;
		self.updateWeatherLeft();

		if (self.mySide.active[0]) self.mySide.active[0].clearTurnstatuses();
		if (self.mySide.active[1]) self.mySide.active[1].clearTurnstatuses();
		if (self.mySide.active[2]) self.mySide.active[2].clearTurnstatuses();
		if (self.yourSide.active[0]) self.yourSide.active[0].clearTurnstatuses();
		if (self.yourSide.active[1]) self.yourSide.active[1].clearTurnstatuses();
		if (self.yourSide.active[2]) self.yourSide.active[2].clearTurnstatuses();

		self.log('<h2>Turn ' + turnnum + '</h2>');

		var prevTurnElem = self.turnElem.children();
		if (self.fastForward) {
			if (prevTurnElem.length) prevTurnElem.html('Turn ' + turnnum);
			else self.turnElem.append('<div class="turn" style="display:block;opacity:1;left:110px;">Turn ' + turnnum + '</div>');
			if (self.turnCallback) self.turnCallback(self);
			if (self.fastForward > -1 && turnnum >= self.fastForward) {
				self.fastForwardOff();
			}
			return;
		}
		self.turnElem.append('<div class="turn">Turn ' + turnnum + '</div>');
		var newTurnElem = self.turnElem.children().last();
		newTurnElem.css({
			display: 'block',
			opacity: 0,
			left: 160
		});
		newTurnElem.animate({
			opacity: 1,
			left: 110
		}, 500).animate({
			opacity: .4
		}, 1500);
		prevTurnElem.animate({
			opacity: 0,
			left: 60
		}, 500, function () {
			prevTurnElem.remove();
		});
		self.activityWait(500);
		if (self.turnCallback) self.turnCallback(self);
	}
	this.changeWeather = function (weather, poke, isUpkeep) {
		weather = toId(weather);
		var weatherTable = {
			sunnyday: {
				name: 'Sun',
				startMessage: 'The sunlight turned harsh!',
				abilityMessage: "'s Drought intensified the sun's rays!",
				//upkeepMessage: 'The sunlight is strong!',
				endMessage: "The sunlight faded."
			},
			raindance: {
				name: 'Rain',
				startMessage: 'It started to rain!',
				abilityMessage: "'s Drizzle made it rain!",
				//upkeepMessage: 'Rain continues to fall!',
				endMessage: 'The rain stopped.'
			},
			sandstorm: {
				name: 'Sandstorm',
				startMessage: 'A sandstorm kicked up!',
				abilityMessage: "'s Sand Stream whipped up a sandstorm!",
				upkeepMessage: 'The sandstorm rages.',
				endMessage: 'The sandstorm subsided.'
			},
			hail: {
				name: 'Hail',
				startMessage: 'It started to hail!',
				abilityMessage: "'s Snow Warning whipped up a hailstorm!",
				upkeepMessage: 'The hail crashes down.',
				endMessage: 'The hail stopped.'
			}
		};
		if (!weather || weather === 'none') {
			weather = '';
		}
		var newWeather = weatherTable[weather];
		if (isUpkeep) {
			if (!self.fastForward) {
				self.weatherElem.animate({
					opacity: 1.0
				}, 400).animate({
					opacity: .4
				}, 400);
			}
			if (newWeather && newWeather.upkeepMessage) self.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
			return;
		}
		if (newWeather) {
			if (poke) {
				self.message('<small>' + poke.getName() + newWeather.abilityMessage + '</small>');
				self.weatherTimeLeft = 0;
				self.weatherMinTimeLeft = 0;
			} else if (isUpkeep) {
				self.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
				self.weatherTimeLeft = 0;
				self.weatherMinTimeLeft = 0;
			} else {
				self.message('<small>' + newWeather.startMessage + '</small>');
				self.weatherTimeLeft = 8;
				self.weatherMinTimeLeft = 5;
			}
		}
		if (self.weather && !newWeather) {
			self.message(weatherTable[self.weather].endMessage);
		}
		self.updateWeather(weather);
	}
	this.updateWeatherLeft = function () {
		for (var i = 0; i < self.pseudoWeather.length; i++) {
			if (self.pseudoWeather[i][1] > 0) self.pseudoWeather[i][1]--;
		}
		if (self.weather && self.weatherTimeLeft) {
			self.weatherTimeLeft--;
			if (self.weatherMinTimeLeft != 0) self.weatherMinTimeLeft--;
		}
		self.updateWeather();
	};
	this.weatherLeft = function (weather) {
		if (weather) {
			for (var i = 0; i < self.pseudoWeather.length; i++) {
				if (self.pseudoWeather[i][0] === weather) {
					if (self.pseudoWeather[i][1]) {
						return ' <small>(' + self.pseudoWeather[i][1] + ' turn' + (self.pseudoWeather[i][1] == 1 ? '' : 's') + ' left)</small>';
					}
					return '';
				}
			}
			return ''; // weather doesn't exist
		}
		if (self.weatherMinTimeLeft != 0) {
			return ' <small>(' + self.weatherMinTimeLeft + ' to ' + self.weatherTimeLeft + ' turns left)</small>';
		}
		if (self.weatherTimeLeft != 0) {
			return ' <small>(' + self.weatherTimeLeft + ' turn' + (self.weatherTimeLeft == 1 ? '' : 's') + ' left)</small>';
		}
		return '';
	}
	this.updateWeather = function (weather) {
		var weatherNameTable = {
			sunnyday: 'Sun',
			raindance: 'Rain',
			sandstorm: 'Sandstorm',
			hail: 'Hail'
		};

		if (typeof weather === 'undefined') {
			weather = self.weather;
		}
		if (weather === '' || weather === 'none' || weather === 'pseudo') {
			weather = (self.pseudoWeather.length ? 'pseudo' : '');
		}

		var oldweather = self.weather;
		self.weather = weather;

		var weatherhtml = '';
		if (weather) {
			if (weather !== 'pseudo') {
				weatherhtml += weatherNameTable[weather] + self.weatherLeft();
			}
			for (var i = 0; i < self.pseudoWeather.length; i++) {
				weatherhtml += '<br />' + Tools.getMove(self.pseudoWeather[i][0]).name + self.weatherLeft(self.pseudoWeather[i][0]);
			}
		}
		if (weather === oldweather) {
			if (weather) self.weatherElem.html('<em>' + weatherhtml + '</em>');
			return;
		}
		if (oldweather) {
			if (weather) {
				self.weatherElem.animate({
					opacity: 0
				}, 300, function () {
					self.weatherElem.css({
						display: 'block'
					});
					self.weatherElem.attr('class', 'weather ' + weather + 'weather');
					self.weatherElem.html('<em>' + weatherhtml + '</em>');
				});
			} else {
				self.weatherElem.animate({
					opacity: 0
				}, 500);
			}
		} else if (weather) {
			self.weatherElem.css({
				display: 'block',
				opacity: 0
			});
			self.weatherElem.attr('class', 'weather ' + weather + 'weather');
			self.weatherElem.html('<em>' + weatherhtml + '</em>');
		}
		if (weather) {
			if (self.fastForward) {
				self.weatherElem.css({opacity:.4});
				return;
			}
			self.weatherElem.animate({
				opacity: 1.0
			}, 400).animate({
				opacity: .4
			}, 400);
		}
	}
	this.resultAnim = function (pokemon, result, type, i) {
		if (self.fastForward) {
			pokemon.side.updateStatbar(pokemon, false, true);
			return;
		}
		if (!i) {
			i = 0;
		}
		self.fxElem.append('<div class="result ' + type + 'result"><strong>' + result + '</strong></div>');
		effectElem = self.fxElem.children().last();
		effectElem.delay(i * 350 + self.animationDelay).css({
			display: 'block',
			opacity: 0,
			top: pokemon.sprite.top - 5,
			left: pokemon.sprite.left - 75
		}).animate({
			opacity: 1
		}, 1);
		effectElem.animate({
			opacity: 0,
			top: pokemon.sprite.top - 65
		}, 1000, 'swing');
		pokemon.side.updateStatbar(pokemon);
		self.activityWait(effectElem);
	}
	this.damageAnim = function (pokemon, damage, i) {
		if (!pokemon.statbarElem) return;
		if (!i) i = 0;
		pokemon.side.updateHPText(pokemon);

		self.resultAnim(pokemon, '&minus;' + damage, 'bad', i);

		var $hp = pokemon.statbarElem.find('div.hp').delay(self.animationDelay);
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'y') callback = function() {
			$hp.addClass('hp-yellow');
		};
		if (hpcolor === 'r') callback = function() {
			$hp.addClass('hp-yellow');
			$hp.addClass('hp-red');
		};

		if (self.fastForward) {
			$hp.css({
				width: w,
				'border-right-width': w ? 1 : 0
			});
			if (callback) callback();
		} else {
			$hp.animate({
				width: w,
				'border-right-width': w ? 1 : 0
			}, 350, callback);
		}
	};
	this.healAnim = function (pokemon, damage, i) {
		if (!pokemon.statbarElem) return;
		if (!i) i = 0;
		pokemon.side.updateHPText(pokemon);

		self.resultAnim(pokemon, '+' + damage, 'good', i);

		var $hp = pokemon.statbarElem.find('div.hp').delay(self.animationDelay);
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'g') callback = function() {
			$hp.removeClass('hp-yellow');
			$hp.removeClass('hp-red');
		};
		if (hpcolor === 'y') callback = function() {
			$hp.removeClass('hp-red');
		};

		if (self.fastForward) {
			$hp.css({
				width: w,
				'border-right-width': w ? 1 : 0
			});
			if (callback) callback();
		} else {
			$hp.animate({
				width: w,
				'border-right-width': w ? 1 : 0
			}, 350, callback);
		}
	};
	this.useMove = function (pokemon, move, target, kwargs) {
		var fromeffect = Tools.getEffect(kwargs.from);
		pokemon.clearMovestatuses();
		if (move.id === 'focuspunch') {
			pokemon.removeTurnstatus('focuspunch');
		}
		pokemon.side.updateStatbar(pokemon);
		if (!target) {
			target = pokemon.side.foe.active[0];
		}
		if (!target) {
			target = pokemon.side.foe.missedPokemon;
		}
		if (!kwargs.silent) {
			switch (fromeffect.id) {
			case 'snatch':
				break;
			case 'magicbounce':
			case 'magiccoat':
			case 'rebound':
				self.resultAnim(pokemon, "Bounced", 'good');
				if (fromeffect.id === 'magiccoat') {
					pokemon.addTurnstatus('magiccoat');
				}
				self.message(target.getName() + "'s " + move.name + " was bounced back by " +  fromeffect.name + "!");
				break;
			case 'metronome':
				self.message('Waggling a finger let it use <strong>' + move.name + '</strong>!');
				break;
			case 'naturepower':
				self.message('Nature Power turned into <strong>' + move.name + '</strong>!');
				break;
			case 'sleeptalk':
			default:
				// April Fool's 2014
				if (window.Config && Config.server && Config.server.afd && move.id === 'earthquake') {
					if (!self.fastForward) {
						$('body').css({
							position: 'absolute',
							left: 0,
							right: 0,
							top: 0,
							bottom: 0
						}).animate({
							left: -30,
							right: 30
						}, 75).animate({
							left: 30,
							right: -30
						}, 100).animate({
							left: -30,
							right: 30
						}, 100).animate({
							left: 30,
							right: -30
						}, 100).animate({
							left: 0,
							right: 0
						}, 100, function() {
							$(this).css({
								position: 'static'
							});
						});
					}
					self.message(pokemon.getName() + ' used <strong>Fissure</strong>!');
					self.message('Just kidding! It was <strong>Earthquake</strong>!');
				} else if (window.Config && Config.server && Config.server.afd && (move.id === 'metronome' || move.id === 'sleeptalk' || move.id === 'assist')) {
					self.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
					var buttons = ["A", "B", "START", "SELECT", "UP", "DOWN", "LEFT", "RIGHT", "DEMOCRACY", "ANARCHY"];
					var people = ["Zarel", "The Immortal", "Diatom", "Nani Man", "shaymin", "apt-get", "sirDonovan", "Arcticblast", "Goddess Briyella"];
					var button;
					for (var i=0; i<10; i++) {
						var name = people[Math.floor(Math.random()*people.length)];
						if (!button) button = buttons[Math.floor(Math.random()*buttons.length)];
						self.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="'+Tools.escapeHTML(name)+'">' + Tools.escapeHTML(name) + ':</strong> <em>' + button + '</em></div>');
						button = (name === 'Diatom' ? "thanks diatom" : null);
					}
				} else if (window.Config && Config.server && Config.server.afd && (move.id === 'taunt')) {
					self.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				} else {
					self.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				}
				break;
			}
			if (window.Config && Config.server && Config.server.afd && move.id === 'taunt') {
				var quotes = [
					"Yo mama so fat, she 4x resists Ice- and Fire-type attacks!",
					"Yo mama so ugly, Captivate raises her opponent's Special Attack!",
					"Yo mama so dumb, she lowers her Special Attack when she uses Nasty Plot!",
					"Yo mama so dumb, she thought Sylveon would be Light Type!"
				];
				var quote = quotes[(self.p1.name.charCodeAt(2) + self.p2.name.charCodeAt(2) + self.turn) % quotes.length];
				self.message(pokemon.getName() + " said, \"" + quote + "\"");
			}
		}
		if (!self.fastForward && !kwargs.still) {
			// skip
			if (kwargs.miss && target.side) {
				target = target.side.missedPokemon;
			}
			if (kwargs.notarget) {
				target = pokemon.side.foe.missedPokemon;
			}
			if (kwargs.prepare || kwargs.anim === 'prepare') {
				self.prepareMove(pokemon, move, target);
			} else if (!kwargs.notarget) {
				move.anim(self, [pokemon.sprite, target.sprite]);
			}
		}
		pokemon.lastmove = move.id;
		self.lastmove = move.id;
		if (move.id === 'wish' || move.id === 'healingwish') {
			pokemon.side.wisher = pokemon;
		}
		if (move.id === 'hyperbeam' || move.id === 'gigaimpact' || move.id === 'rockwrecker' || move.id === 'roaroftime' || move.id === 'blastburn' || move.id === 'frenzyplant' || move.id === 'hydrocannon') {
			if (!kwargs.miss && !kwargs.notarget) {
				pokemon.addMovestatus('mustrecharge');
				pokemon.side.updateStatbar();
				self.animationDelay += 500;
			}
		}
	};
	this.cantUseMove = function (pokemon, effect, move, kwargs) {
		pokemon.clearMovestatuses();
		pokemon.side.updateStatbar(pokemon);
		switch (effect.id) {
		case 'taunt':
			self.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' after the taunt!');
			break;
		case 'gravity':
			self.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of gravity!');
			break;
		case 'healblock':
			self.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of Heal Block!');
			break;
		case 'imprison':
			self.message('' + pokemon.getName() + ' can\'t use the sealed ' + move.name + '!');
			break;
		case 'par':
			self.resultAnim(pokemon, 'Paralyzed', 'par');
			BattleOtherAnims['fullparalysis'].anim(self, [pokemon.sprite]);
			self.message('' + pokemon.getName() + ' is paralyzed! It can\'t move!');
			break;
		case 'frz':
			self.resultAnim(pokemon, 'Frozen', 'frz');
			self.message('' + pokemon.getName() + ' is frozen solid!');
			break;
		case 'slp':
			self.resultAnim(pokemon, 'Asleep', 'slp');
			self.message('' + pokemon.getName() + ' is fast asleep.');
			break;
		case 'skydrop':
			self.message('Sky Drop won\'t let ' + pokemon.getLowerName() + ' go!');
			break;
		case 'truant':
			self.resultAnim(pokemon, 'Truant', 'neutral');
			self.message('' + pokemon.getName() + ' is loafing around!');
			break;
		case 'recharge':
			BattleOtherAnims['selfstatus'].anim(self, [pokemon.sprite]);
			self.resultAnim(pokemon, 'Must recharge', 'neutral');
			self.message('<small>' + pokemon.getName() + ' must recharge!</small>');
			break;
		case 'focuspunch':
			self.resultAnim(pokemon, 'Lost focus', 'neutral');
			self.message(pokemon.getName() + ' lost its focus and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch');
			break;
		case 'flinch':
			self.resultAnim(pokemon, 'Flinched', 'neutral');
			self.message(pokemon.getName() + ' flinched and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch');
			break;
		case 'attract':
			self.resultAnim(pokemon, 'Immobilized', 'neutral');
			self.message(pokemon.getName() + ' is immobilized by love!');
			break;
		case 'nopp':
			self.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
			self.message('But there was no PP left for the move!');
			break;
		default:
			self.message('<small>' + pokemon.getName() + (move.name ? ' can\'t use ' + move.name + '' : ' can\'t move') + '!</small>');
			break;
		}
		pokemon.sprite.anim({time:1});
	};
	this.prepareMove = function (pokemon, move, target) {
		if (!move.prepareAnim) return;
		if (!target) {
			target = pokemon.side.foe.active[0];
		}
		if (!target) {
			target = pokemon;
		}
		if (!self.fastForward) move.prepareAnim(self, [pokemon.sprite, target.sprite]);
		self.message('<small>'+move.prepareMessage(pokemon, target)+'</small>');
	};
	this.animMultiHitMove = function () {
		if (self.multiHitMove && !self.fastForward) {
			self.multiHitMove[0].anim(self, [self.multiHitMove[1], self.multiHitMove[2]]);
			self.multiHitMove[3]++;
			self.animationDelay += 500;
		}
	};
	this.runMinor = function (args, kwargs, preempt, nextArgs, nextKwargs) {
		var actions = '';
		var hiddenactions = '';
		var minors = self.minorQueue;
		if (self.multiHitMove && minors.length) {
			var lastMinor = minors[minors.length - 1];
			//if (lastMinor[0][0] === '-damage' || lastMinor[0][1]['subdamage']) self.animMultiHitMove();
		}
		if (args) {
			if (args[0] === '-crit' || args[0] === '-supereffective' || args[0] === '-resisted') args.then = '.';
			if (args[0] === '-damage' && kwargs.from === 'Leech Seed' && nextArgs[0] === '-heal' && nextKwargs.silent) args.then = '.';
			minors.push([args, kwargs]);
			if (args.simult || args.then) {
				return;
			}
		}
		var animDelay = 0;
		var nextAnimDelay = 0;
		while (minors.length) {
			var row = minors.shift();
			args = row[0];
			kwargs = row[1];
			animDelay = nextAnimDelay;
			if (!kwargs.simult) nextAnimDelay++;

			switch (args[0]) {
			case '-damage':
				var poke = this.getPokemon(args[1]);
				var damage = poke.healthParse(args[2], true);
				if (damage === false) break;
				self.lastDamage = (damage[2] || 1); // not sure if this is used for anything
				var range = poke.getDamageRange(damage);
				self.damageAnim(poke, poke.getFormattedRange(range, 0, ' to '), animDelay);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					switch (effect.id) {
					case 'stealthrock':
						actions += "Pointed stones dug into " + poke.getLowerName() + "!";
						break;
					case 'spikes':
						actions += "" + poke.getName() + " is hurt by the spikes!";
						break;
					case 'brn':
						actions += "" + poke.getName() + " was hurt by its burn!";
						break;
					case 'psn':
						actions += "" + poke.getName() + " was hurt by poison!";
						break;
					case 'lifeorb':
						hiddenactions += "" + poke.getName() + " lost some of its HP!";
						break;
					case 'recoil':
						actions += "" + poke.getName() + " is damaged by recoil!";
						break;
					case 'sandstorm':
						actions += "" + poke.getName() + " is buffeted by the sandstorm!";
						break;
					case 'hail':
						actions += "" + poke.getName() + " is buffeted by the hail!";
						break;
					case 'baddreams':
						actions += "" + poke.getName() + " is tormented!";
						break;
					case 'nightmare':
						actions += "" + poke.getName() + " is locked in a nightmare!";
						break;
					case 'confusion':
						actions += "It hurt itself in its confusion! ";
						break;
					case 'leechseed':
						if (!self.fastForward) {
							BattleOtherAnims.leech.anim(self, [ofpoke.sprite, poke.sprite]);
							self.activityWait(500);
						}
						actions += "" + poke.getName() + "'s health is sapped by Leech Seed!";
						break;
					case 'flameburst':
						actions += "The bursting flame hit " + poke.getLowerName() + "!";
						break;
					case 'firepledge':
						actions += "" + poke.getName() + " is hurt by the sea of fire!";
						break;
					case 'jumpkick':
					case 'highjumpkick':
						actions += "" + poke.getName() + " kept going and crashed!";
						break;
					default:
						if (ofpoke) {
							actions += "" + poke.getName() + " is hurt by " + ofpoke.getLowerName() + "'s " + effect.name + "!";
						} else if (effect.effectType === 'Item' || effect.effectType === 'Ability') {
							actions += "" + poke.getName() + " is hurt by its " + effect.name + "!";
						} else if (kwargs.partiallytrapped) {
							actions += "" + poke.getName() + ' is hurt by ' + effect.name + '!';
						} else {
							actions += "" + poke.getName() + " lost some HP because of " + effect.name + "!";
						}
						break;
					}
				} else {
					var damageinfo = '' + poke.getFormattedRange(range, 1, '–');
					if (damage[1] !== 100) {
						var hover = '' + ((damage[0] < 0) ? '&minus;' : '') +
							Math.abs(damage[0]) + '/' + damage[1];
						if (damage[1] === 48) { // this is a hack
							hover += ' pixels';
						}
						damageinfo = '<abbr title="' + hover + '">' + damageinfo + '</abbr>';
					}
					hiddenactions += "" + poke.getName() + " lost " + damageinfo + " of its health!";
				}
				break;
			case '-heal':
				var poke = this.getPokemon(args[1]);
				var damage = poke.healthParse(args[2], true, true);
				if (damage === false) break;
				var range = poke.getDamageRange(damage);
				self.healAnim(poke, poke.getFormattedRange(range, 0, ' to '), animDelay);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					switch (effect.id) {
					case 'ingrain':
						actions += "" + poke.getName() + " absorbed nutrients with its roots!";
						break;
					case 'aquaring':
						actions += "Aqua Ring restored " + poke.getLowerName() + "'s HP!";
						break;
					case 'raindish': case 'dryskin': case 'icebody':
						actions += "" + poke.getName() + "'s " + effect.name + " heals it!";
						break;
					case 'healingwish':
						actions += "The healing wish came true for "+poke.getLowerName()+"!";
						self.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(self, [poke.sprite]);
						poke.side.wisher = null;
						break;
					case 'lunardance':
						actions += ""+poke.getName()+" became cloaked in mystical moonlight!";
						self.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(self, [poke.sprite]);
						poke.side.wisher = null;
						break;
					case 'wish':
						actions += "" + kwargs.wisher + "'s wish came true!";
						Tools.getMove('wish').residualAnim(self, [poke.sprite]);
						self.animationDelay += 500;
						break;
					case 'drain':
						actions += ofpoke.getName() + ' had its energy drained!';
						break;
					case 'leftovers':
					case 'shedbell':
						actions += "" + poke.getName() + " restored a little HP using its " + effect.name + "!";
						break;
					default:
						if (kwargs.absorb) {
							actions += "" + poke.getName() + "'s " + effect.name + " absorbs the attack!";
						} else if (effect.id) {
							actions += "" + poke.getName() + " restored HP using its " + effect.name + "!";
						} else {
							actions += poke.getName() + ' regained health!';
						}
						break;
					}
				} else {
					actions += poke.getName() + ' regained health!';
				}
				break;
			case '-sethp':
				var effect = Tools.getEffect(kwargs.from);
				var poke, ofpoke;
				for (var k=0; k<2; k++)
				{
					var cpoke = self.getPokemon(args[1+2*k]);
					if (cpoke) {
						var oldhp = cpoke.hp;
						cpoke.healthParse(args[2+2*k]);
						var diff = parseFloat(args[2+2*k]);
						if (isNaN(diff)) {
							diff = cpoke.hp - oldhp;
						}
						if (diff > 0) {
							self.healAnim(cpoke, diff, animDelay);
						} else {
							self.damageAnim(cpoke, -diff, animDelay);
						}
					}
					if (k==0) poke = cpoke;
					if (k==1) ofpoke = cpoke;
				}
				switch (effect.id) {
				case 'painsplit':
					actions += 'The battlers shared their pain!';
					break;
				}

				break;

			case '-boost':
				var poke = this.getPokemon(args[1]);
				var stat = args[2];
				var amount = parseInt(args[3]);
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] += amount;
				self.resultAnim(poke, poke.getBoost(stat), 'good', animDelay);

				var amountString = '';
				if (amount === 2) amountString = ' sharply';
				if (amount >= 3) amountString = ' drastically';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					switch (effect.id) {
					default:
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString+" raised " + poke.getLowerName() + "'s " + BattleStats[stat] + "!";
						} else {
							actions += "" + poke.getName() + "'s " + effect.name +amountString+" raised its " + BattleStats[stat] + "!";
						}
						break;
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + amountString + " rose" + "!";
				}
				break;
			case '-unboost':
				var poke = this.getPokemon(args[1]);
				var stat = args[2];
				var amount = parseInt(args[3]);
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] -= amount;
				self.resultAnim(poke, poke.getBoost(stat), 'bad', animDelay);

				var amountString = '';
				if (amount === 2) amountString = ' harshly';
				if (amount >= 3) amountString = ' severely';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					switch (effect.id) {
					default:
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString+" lowered " + poke.getLowerName() + "'s " + BattleStats[stat] + "!";
						} else {
							actions += "" + poke.getName() + "'s " + effect.name +amountString+" lowered its " + BattleStats[stat] + "!";
						}
						break;
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + amountString + " fell!";
				}
				break;
			case '-setboost':
				var poke = this.getPokemon(args[1]);
				var stat = args[2];
				var amount = parseInt(args[3]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.boosts[stat] = amount;
				self.resultAnim(poke, poke.getBoost(stat), (amount>0?'good':'bad'), animDelay);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					switch (effect.id) {
					case 'bellydrum':
						actions += '' + poke.getName() + ' cut its own HP and maximized its Attack!';
						break;
					case 'angerpoint':
						actions += '' + poke.getName() + ' maxed its Attack!';
						break;
					}
				}
				break;
			case '-swapboost':
				var poke = this.getPokemon(args[1]);
				var poke2 = this.getPokemon(args[2]);
				var stats = args[3]?args[3].split(', '):['atk','def','spa','spd','spe','accuracy','evasion'];
				var effect = Tools.getEffect(kwargs.from);
				for (var i=0; i<stats.length; i++)
				{
					var tmp = poke.boosts[stats[i]];
					poke.boosts[stats[i]] = poke2.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
					poke2.boosts[stats[i]] = tmp;
					if (!poke2.boosts[stats[i]]) delete poke2.boosts[stats[i]];
				}
				self.resultAnim(poke, 'Stats swapped', 'neutral', animDelay);
				self.resultAnim(poke2, 'Stats swapped', 'neutral', animDelay);

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'guardswap':
						actions += '' + poke.getName() + ' switched all changes to its Defense and Sp. Def with the target!';
						break;
					case 'heartswap':
						actions += '' + poke.getName() + ' switched stat changes with the target!';
						break;
					case 'powerswap':
						actions += '' + poke.getName() + ' switched all changes to its Attack and Sp. Atk with the target!';
						break;
					}
				}
				break;
			case '-restoreboost':
				var poke = this.getPokemon(args[1]);
				for (i in poke.boosts) {
					if (poke.boosts[i] < 0) delete poke.boosts[i];
				}
				self.resultAnim(poke, 'Restored', 'good', animDelay);

				if (kwargs.silent) {
					// do nothing
				}
				break;
			case '-copyboost':
				var poke = this.getPokemon(args[1]);
				var frompoke = this.getPokemon(args[2]);
				var stats = args[3]?args[3].split(', '):['atk','def','spa','spd','spe','accuracy','evasion'];
				var effect = Tools.getEffect(kwargs.from);
				for (var i=0; i<stats.length; i++)
				{
					poke.boosts[stats[i]] = frompoke.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
				}
				//poke.boosts = $.extend({}, frompoke.boosts);

				if (kwargs.silent) {
					// do nothing
				} else {
					self.resultAnim(poke, 'Stats copied', 'neutral', animDelay);
					actions += "" + poke.getName() + " copied " + frompoke.getLowerName() + "'s stat changes!";
				}
				break;
			case '-clearboost':
				var poke = this.getPokemon(args[1]);
				poke.boosts = {};
				self.resultAnim(poke, 'Stats reset', 'neutral', animDelay);

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += '' + poke.getName() + '\'s stat changes were removed!';
				}
				break;
			case '-invertboost':
				var poke = this.getPokemon(args[1]);
				for (i in poke.boosts) {
					poke.boosts[i] = -poke.boosts[i];
				}
				self.resultAnim(poke, 'Stats inverted', 'neutral', animDelay);

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += '' + poke.getName() + '\'s stat changes were inverted!';
				}
				break;
			case '-clearallboost':
				for (var slot=0; slot<self.mySide.active.length; slot++) {
					if (self.mySide.active[slot]) {
						self.mySide.active[slot].boosts = {};
						self.resultAnim(self.mySide.active[slot], 'Stats reset', 'neutral', animDelay);
					}
					if (self.yourSide.active[slot]) {
						self.yourSide.active[slot].boosts = {};
						self.resultAnim(self.yourSide.active[slot], 'Stats reset', 'neutral', animDelay);
					}
				}

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += 'All stat changes were eliminated!';
				}
				break;

			case '-crit':
				var poke = this.getPokemon(args[1]);
				for (var j=1; !poke && j<10; j++) poke = this.getPokemon(minors[i+j][0][1]);
				if (poke) self.resultAnim(poke, 'Critical hit', 'bad', animDelay);
				actions += "A critical hit! ";
				break;

			case '-supereffective':
				var poke = this.getPokemon(args[1]);
				for (var j=1; !poke && j<10; j++) poke = this.getPokemon(minors[i+j][0][1]);
				if (poke) self.resultAnim(poke, 'Super-effective', 'bad', animDelay);
				actions += "It's super effective! ";
				break;

			case '-resisted':
				var poke = this.getPokemon(args[1]);
				for (var j=1; !poke && j<10; j++) poke = this.getPokemon(minors[i+j][0][1]);
				if (poke) self.resultAnim(poke, 'Resisted', 'neutral', animDelay);
				actions += "It's not very effective... ";
				break;

			case '-immune':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				self.resultAnim(poke, 'Immune', 'neutral', animDelay);
				switch (effect.id) {
				case 'confusion':
					actions += "" + poke.getName() + " doesn't become confused! ";
					break;
				default:
					if (kwargs.msg) {
						actions += "It doesn't affect " + poke.getLowerName() + "... ";
					} else {
						actions += "It had no effect! ";
					}
					break;
				}
				break;

			case '-miss':
				var user = this.getPokemon(args[1]);
				var target = this.getPokemon(args[2]);
				if (target) {
					actions += "" + target.getName() + " avoided the attack!";
				} else {
					actions += "" + user.getName() + "'s attack missed!";
				}
				break;

			case '-fail':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				if (poke) {
					self.resultAnim(poke, 'Failed', 'neutral', animDelay);
				}
				switch (effect.id) {
				case 'brn':
					self.resultAnim(poke, 'Already burned', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already burned.";
					break;
				case 'tox':
				case 'psn':
					self.resultAnim(poke, 'Already poisoned', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already poisoned.";
					break;
				case 'slp':
					if (fromeffect.id === 'uproar') {
						self.resultAnim(poke, 'Failed', 'neutral', animDelay);
						if (kwargs.msg) {
							actions += "But " + poke.getLowerName() + " can't sleep in an uproar!";
						} else {
							actions += "But the uproar kept " + poke.getLowerName() + " awake!";
						}
					} else {
						self.resultAnim(poke, 'Already asleep', 'neutral', animDelay);
						actions += "" + poke.getName() + " is already asleep.";
					}
					break;
				case 'par':
					self.resultAnim(poke, 'Already paralyzed', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already paralyzed.";
					break;
				case 'frz':
					self.resultAnim(poke, 'Already frozen', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already frozen.";
					break;
				case 'substitute':
					if (kwargs.weak) {
						actions += "It was too weak to make a substitute!";
					} else {
						actions += '' + poke.getName() + ' already has a substitute!';
					}
					break;
				case 'skydrop':
					if (kwargs.heavy) {
						actions += '' + poke.getName() + ' is too heavy to be lifted!';
					} else {
						actions += "But it failed!";
					}
					break;
				case 'unboost':
					self.resultAnim(poke, 'Stat drop blocked', 'neutral', animDelay);
					actions += "" + poke.getName() + "'s " + (args[3] ? args[3] + " was" : "stats were") + " not lowered!";
					break;
				case '':
				default:
					actions += "But it failed!";
					break;
				}
				break;

			case '-notarget':
				actions += "But there was no target...";
				break;

			case '-ohko':
				actions += "It's a one-hit KO!";
				break;

			case '-hitcount':
				var hits = parseInt(args[2]);
				if (self.multiHitMove && self.multiHitMove[3] === 0 && hits > 0) self.animMultiHitMove();
				actions += 'Hit ' + hits + (hits > 1 ? ' times!' : ' time!');
				break;

			case '-nothing':
				actions += "But nothing happened! ";
				break;

			case '-waiting':
				var poke = this.getPokemon(args[1]);
				var ofpoke = this.getPokemon(args[2]);
				actions += "" + poke.getName() + " is waiting for " + ofpoke.getLowerName() + "'s move...";
				break;

			case '-combine':
				actions += "The two moves are joined! It's a combined move!";
				break;

			case '-prepare':
				var poke = this.getPokemon(args[1]);
				var move = Tools.getMove(args[2]);
				var target = this.getPokemon(args[3]);
				self.prepareMove(poke, move, target);
				break;

			case '-status':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(kwargs.from);
				poke.status = args[2];
				poke.removeVolatile('yawn');

				switch (args[2]) {
				case 'brn':
					self.resultAnim(poke, 'Burned', 'brn', animDelay);
					actions += "" + poke.getName() + " was burned" + (effect.exists ? " by the " + effect.name : "") + "!";
					break;
				case 'tox':
					self.resultAnim(poke, 'Toxic poison', 'psn', animDelay);
					actions += "" + poke.getName() + " was badly poisoned" + (effect.exists ? " by the " + effect.name : "") + "!";
					break;
				case 'psn':
					self.resultAnim(poke, 'Poisoned', 'psn', animDelay);
					actions += "" + poke.getName() + " was poisoned!";
					break;
				case 'slp':
					if (effect.id === 'rest') {
						self.resultAnim(poke, 'Asleep', 'slp', animDelay);
						actions += '' + poke.getName() + ' slept and became healthy!';
					} else {
						self.resultAnim(poke, 'Asleep', 'slp', animDelay);
						actions += "" + poke.getName() + " fell asleep!";
					}
					break;
				case 'par':
					self.resultAnim(poke, 'Paralyzed', 'par', animDelay);
					actions += "" + poke.getName() + " is paralyzed! It may be unable to move!";
					break;
				case 'frz':
					self.resultAnim(poke, 'Frozen', 'frz', animDelay);
					actions += "" + poke.getName() + " was frozen solid!";
					break;
				}
				break;

			case '-curestatus':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.status = '';

				if (effect.id) switch (effect.id) {
				case 'psychoshift':
					actions += '' + poke.getName() + ' moved its status onto ' + ofpoke.getLowerName() + '!';
					self.resultAnim(poke, 'Cured', 'good', animDelay);
					break;
				default:
					self.resultAnim(poke, 'Cured', 'good', animDelay);
					actions += "" + poke.getName() + "'s "+effect.name+" heals its status!";
					break;
				} else switch (args[2]) {
				case 'brn':
					self.resultAnim(poke, 'Burn cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " healed its burn!";
						break;
					}
					if (poke.side.n === 0) actions += "" + poke.getName() + "'s burn was healed.";
					else actions += "" + poke.getName() + " healed its burn!";
					break;
				case 'tox':
				case 'psn':
					self.resultAnim(poke, 'Poison cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its poison!";
						break;
					}
					var n = poke.side.n; // hack for eliminating "the opposing"
					poke.side.n = 0;
					actions += "" + poke.getName() + " was cured of its poisoning.";
					poke.side.n = n;
					break;
				case 'slp':
					self.resultAnim(poke, 'Woke up', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " woke it up!";
						break;
					}
					actions += "" + poke.getName() + " woke up!";
					break;
				case 'par':
					self.resultAnim(poke, 'Paralysis cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its paralysis!";
						break;
					}
					actions += "" + poke.getName() + " was cured of paralysis.";
					break;
				case 'frz':
					self.resultAnim(poke, 'Thawed', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " defrosted it!";
						break;
					}
					actions += "" + poke.getName() + " thawed out!";
					break;
				default:
					poke.removeVolatile('confusion');
					self.resultAnim(poke, 'Cured', 'good', animDelay);
					actions += "" + poke.getName() + "'s status cleared!";
				}
				break;

			case '-cureteam':
				var poke = this.getPokemon(args[1]);
				for (var k = 0; k < poke.side.pokemon.length; k++) {
					poke.side.pokemon[k].status = '';
					poke.side.updateStatbar(poke.side.pokemon[k]);
				}

				self.resultAnim(poke, 'Team Cured', 'good', animDelay);
				var effect = Tools.getEffect(kwargs.from);
				switch (effect.id) {
				case 'aromatherapy':
					actions += 'A soothing aroma wafted through the area!';
					break;
				case 'healbell':
					actions += 'A bell chimed!';
					break;
				default:
					actions += "" + poke.getName() + "'s team was cured!";
					break;
				}
				break;

			case '-item':
				var poke = this.getPokemon(args[1]);
				var item = Tools.getItem(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.item = item.name;
				poke.removeVolatile('airballoon');
				if (item.id === 'airballoon') poke.addVolatile('airballoon');

				if (effect.id) switch (effect.id) {
				case 'recycle':
				case 'pickup':
					actions += '' + poke.getName() + ' found one ' + item.name + '!';
					self.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				case 'frisk':
					if (kwargs.identify) { // used for gen 6
						actions += '' + ofpoke.getName() + ' frisked ' + poke.getLowerName() + ' and found its ' + item.name + '!';
						self.resultAnim(poke, item.name, 'neutral', animDelay);
					} else {
						actions += '' + ofpoke.getName() + ' frisked its target and found one ' + item.name + '!';
					}
					break;
				case 'thief':
				case 'covet':
					actions += '' + poke.getName() + ' stole ' + ofpoke.getLowerName() + "'s " + item.name + "!";
					self.resultAnim(poke, item.name, 'neutral', animDelay);
					self.resultAnim(ofpoke, 'Item Stolen', 'bad', animDelay);
					break;
				case 'harvest':
					actions += '' + poke.getName() + ' harvested one ' + item.name + '!';
					self.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				case 'bestow':
					actions += '' + poke.getName() + ' received ' + item.name + ' from ' + ofpoke.getLowerName() + '!';
					self.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				default:
					actions += '' + poke.getName() + ' obtained one ' + item.name + '.';
					self.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				} else switch (item.id) {
				case 'airballoon':
					self.resultAnim(poke, 'Balloon', 'good', animDelay);
					actions += "" + poke.getName() + " floats in the air with its Air Balloon!";
					break;
				default:
					actions += "" + poke.getName() + " has " + item.name + "!";
					break;
				}
				break;

			case '-enditem':
				var poke = this.getPokemon(args[1]);
				var item = Tools.getItem(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.item = '';
				poke.removeVolatile('airballoon');

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.eat) {
					actions += '' + poke.getName() + ' ate its ' + item.name + '!';
					self.lastmove = item.id;
				} else if (kwargs.weaken) {
					actions += 'The ' + item.name + ' weakened the damage to '+poke.getLowerName();
					self.lastmove = item.id;
				} else if (effect.id) switch (effect.id) {
				case 'fling':
					actions += "" + poke.getName() + ' flung its ' + item.name + '!';
					break;
				case 'knockoff':
					actions += '' + ofpoke.getName() + ' knocked off ' + poke.getLowerName() + '\'s ' + item.name + '!';
					self.resultAnim(poke, 'Item knocked off', 'neutral', animDelay);
					break;
				case 'stealeat':
					actions += '' + ofpoke.getName() + ' stole and ate its target\'s ' + item.name + '!';
					break;
				case 'gem':
					actions += 'The ' + item.name + ' strengthened ' + Tools.getMove(kwargs.move).name + '\'s power!';
					break;
				case 'incinerate':
					actions += "" + poke.getName() + "'s " + item.name + " was burnt up!";
					break;
				default:
					actions += "" + poke.getName() + ' lost its ' + item.name + '!';
					break;
				} else switch (item.id) {
				case 'airballoon':
					poke.removeVolatile('airballoon');
					self.resultAnim(poke, 'Balloon popped', 'neutral', animDelay);
					actions += "" + poke.getName() + "'s Air Balloon popped!";
					break;
				case 'focussash':
					self.resultAnim(poke, 'Sash', 'neutral', animDelay);
					actions += "" + poke.getName() + ' hung on using its Focus Sash!';
					break;
				case 'focusband':
					self.resultAnim(poke, 'Focus Band', 'neutral', animDelay);
					actions += "" + poke.getName() + ' hung on using its Focus Band!';
					break;
				case 'mentalherb':
					poke.removeVolatile('taunt');
					poke.removeVolatile('encore');
					poke.removeVolatile('torment');
					self.resultAnim(poke, 'Cured', 'good', animDelay);
					actions += "" + poke.getName() + " used its " + item.name + " to come back to its senses!";
					break;
				case 'whiteherb':
					actions += "" + poke.getName() + " restored its status using its White Herb!";
					break;
				case 'ejectbutton':
					actions += "" + poke.getName() + " is switched out with the Eject Button!";
					break;
				case 'redcard':
					actions += "" + poke.getName() + " held up its Red Card against " + ofpoke.getLowerName() + "!";
					break;
				default:
					actions += "" + poke.getName() + "'s " + item.name + " activated!";
					break;
				}
				break;

			case '-ability':
				var poke = this.getPokemon(args[1]);
				var ability = Tools.getAbility(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.ability = ability.name;

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) switch (effect.id) {
				case 'trace':
					actions += '' + poke.getName() + ' traced ' + ofpoke.getLowerName() + '\'s ' + ability.name + '!';
					break;
				case 'roleplay':
					actions += '' + poke.getName() + ' copied ' + ofpoke.getLowerName() + '\'s ' + ability.name + '!';
					break;
				case 'mummy':
					actions += "" + poke.getName() + "'s Ability became Mummy!";
					break;
				default:
					actions += "" + poke.getName() + " acquired " + ability.name + "!";
					break;
				} else switch (ability.id) {
				case 'pressure':
					actions += "" + poke.getName() + " is exerting its pressure!";
					break;
				case 'moldbreaker':
					actions += "" + poke.getName() + " breaks the mold!";
					break;
				case 'turboblaze':
					actions += "" + poke.getName() + " is radiating a blazing aura!";
					break;
				case 'teravolt':
					actions += "" + poke.getName() + " is radiating a bursting aura!";
					break;
				case 'intimidate':
					actions += '' + poke.getName() + ' intimidates ' + ofpoke.getLowerName() + '!';
					break;
				case 'unnerve':
					actions += "" + poke.getName() + "'s Unnerve makes " + this.getSide(args[3]).getLowerTeamName() + " too nervous to eat Berries!";
					break;
				case 'aurabreak':
					actions += "" + poke.getName() + " reversed all other Pokémon's auras!";
					break;
				case 'fairyaura':
					actions += "" + poke.getName() + " is radiating a fairy aura!";
					break;
				case 'darkaura':
					actions += "" + poke.getName() + " is radiating a dark aura!";
					break;
				default:
					actions += "" + poke.getName() + " has " + ability.name + "!";
					break;
				}
				break;

			case '-endability':
				var poke = this.getPokemon(args[1]);
				var ability = Tools.getAbility(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				poke.ability = '';

				if (kwargs.silent) {
					// do nothing
				} else switch (effect.id) {
				case 'mummy':
					actions += "" + poke.getName() + "\'s Ability " + ability.name + " was suppressed!";
					break;
				default:
					actions += "" + poke.getName() + "\'s Ability was suppressed!";
					break;
				}
				break;

			case '-transform':
				var poke = this.getPokemon(args[1]);
				var tpoke = this.getPokemon(args[2]);
				actions += '' + poke.getName() + ' transformed into ' + tpoke.species + '!';
				poke.sprite.animTransform(tpoke);
				poke.boosts = $.extend({}, tpoke.boosts);
				poke.addVolatile('transform');
				poke.addVolatile('formechange'); // the formechange volatile reminds us to revert the sprite change on switch-out
				//poke.removeVolatile('typechange'); // does this happen??
				poke.ability = tpoke.ability;
				poke.volatiles.formechange[2] = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[2] : tpoke.species);
				self.resultAnim(poke, 'Transformed', 'good', animDelay);
				break;
			case '-formechange':
				var poke = this.getPokemon(args[1]);
				var template = Tools.getTemplate(args[2]);
				var spriteData = {'shiny': poke.sprite.sp.shiny};
				poke.sprite.animTransform($.extend(spriteData, template));
				poke.addVolatile('formechange'); // the formechange volatile reminds us to revert the sprite change on switch-out
				poke.volatiles.formechange[2] = template.species;
				poke.side.updateStatbar();
				break;

			case '-start':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addVolatile(effect.id);

				switch (effect.id) {
				case 'typechange':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typechange[2] = args[3];
					poke.removeVolatile('typeadd');
					if (fromeffect.id) {
						if (fromeffect.id === 'reflecttype') {
							actions += "" + poke.getName() + "'s type changed to match " + ofpoke.getLowerName() + "'s!";
						} else {
							actions += "" + poke.getName() + "'s " + fromeffect.name + " made it the " + args[3] + " type!";
						}
					} else {
						actions += "" + poke.getName() + " transformed into the " + args[3] + " type!";
					}
					break;
				case 'typeadd':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typeadd[2] = args[3];
					actions += "" + args[3] + " type was added to " + poke.getLowerName() + "!";
					break;
				case 'powertrick':
					self.resultAnim(poke, 'Power Trick', 'neutral', animDelay);
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'foresight':
				case 'miracleeye':
					self.resultAnim(poke, 'Identified', 'bad', animDelay);
					actions += "" + poke.getName() + " was identified!";
					break;
				case 'telekinesis':
					self.resultAnim(poke, 'Telekinesis', 'neutral', animDelay);
					actions += "" + poke.getName() + " was hurled into the air!";
					break;
				case 'confusion':
					if (kwargs.already) {
						actions += "" + poke.getName() + " is already confused!";
					} else {
						self.resultAnim(poke, 'Confused', 'bad', animDelay);
						actions += "" + poke.getName() + " became confused!";
					}
					break;
				case 'leechseed':
					poke.side.updateStatbar(poke);
					actions += '' + poke.getName() + ' was seeded!';
					break;
				case 'healblock':
					self.resultAnim(poke, 'Heal Block', 'bad', animDelay);
					actions += "" + poke.getName() + " was prevented from healing!";
					break;
				case 'mudsport':
					self.resultAnim(poke, 'Mud Sport', 'neutral', animDelay);
					actions += "Electricity's power was weakened!";
					break;
				case 'watersport':
					self.resultAnim(poke, 'Water Sport', 'neutral', animDelay);
					actions += "Fire's power was weakened!";
					break;
				case 'yawn':
					self.resultAnim(poke, 'Drowsy', 'slp', animDelay);
					actions += "" + poke.getName() + ' grew drowsy!';
					break;
				case 'flashfire':
					self.resultAnim(poke, 'Flash Fire', 'good', animDelay);
					actions += 'The power of ' + poke.getLowerName() + '\'s Fire-type moves rose!';
					break;
				case 'taunt':
					self.resultAnim(poke, 'Taunted', 'bad', animDelay);
					actions += '' + poke.getName() + ' fell for the taunt!';
					break;
				case 'imprison':
					self.resultAnim(poke, 'Imprisoning', 'good', animDelay);
					actions += "" + poke.getName() + " sealed the opponent's move(s)!";
					break;
				case 'disable':
					self.resultAnim(poke, 'Disabled', 'bad', animDelay);
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " was disabled!";
					break;
				case 'embargo':
					self.resultAnim(poke, 'Embargo', 'bad', animDelay);
					actions += "" + poke.getName() + " can't use items anymore!";
					break;
				case 'torment':
					self.resultAnim(poke, 'Tormented', 'bad', animDelay);
					actions += '' + poke.getName() + ' was subjected to torment!';
					break;
				case 'ingrain':
					self.resultAnim(poke, 'Ingrained', 'good', animDelay);
					actions += '' + poke.getName() + ' planted its roots!';
					break;
				case 'aquaring':
					self.resultAnim(poke, 'Aqua Ring', 'good', animDelay);
					actions += '' + poke.getName() + ' surrounded itself with a veil of water!';
					break;
				case 'stockpile1':
					self.resultAnim(poke, 'Stockpile', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 1!';
					break;
				case 'stockpile2':
					poke.removeVolatile('stockpile1');
					self.resultAnim(poke, 'Stockpile&times;2', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 2!';
					break;
				case 'stockpile3':
					poke.removeVolatile('stockpile2');
					self.resultAnim(poke, 'Stockpile&times;3', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 3!';
					break;
				case 'perish0':
					poke.removeVolatile('perish1');
					actions += '' + poke.getName() + "'s perish count fell to 0.";
					break;
				case 'perish1':
					poke.removeVolatile('perish2');
					self.resultAnim(poke, 'Perish next turn', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 1.";
					break;
				case 'perish2':
					poke.removeVolatile('perish3');
					self.resultAnim(poke, 'Perish in 2', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 2.";
					break;
				case 'perish3':
					self.resultAnim(poke, 'Perish in 3', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 3.";
					break;
				case 'encore':
					self.resultAnim(poke, 'Encored', 'bad', animDelay);
					actions += '' + poke.getName() + ' received an encore!';
					break;
				case 'bide':
					self.resultAnim(poke, 'Bide', 'good', animDelay);
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'slowstart':
					self.resultAnim(poke, 'Slow Start', 'bad', animDelay);
					actions += "" + poke.getName() + " can't get it going because of its Slow Start!";
					break;
				case 'attract':
					self.resultAnim(poke, 'Attracted', 'bad', animDelay);
					if (fromeffect.id) {
						actions += "" + poke.getName() + " fell in love from the " + fromeffect.name + "!";
					} else {
						actions += "" + poke.getName() + " fell in love!";
					}
					break;
				case 'autotomize':
					self.resultAnim(poke, 'Lightened', 'good', animDelay);
					actions += "" + poke.getName() + " became nimble!";
					break;
				case 'focusenergy':
					self.resultAnim(poke, '+Crit rate', 'good', animDelay);
					actions += "" + poke.getName() + " is getting pumped!";
					break;
				case 'curse':
					self.resultAnim(poke, 'Cursed', 'bad', animDelay);
					actions += "" + ofpoke.getName() + " cut its own HP and laid a curse on " + poke.getLowerName() + "!";
					break;
				case 'nightmare':
					self.resultAnim(poke, 'Nightmare', 'bad', animDelay);
					actions += "" + poke.getName() + " began having a nightmare!";
					break;
				case 'magnetrise':
					self.resultAnim(poke, 'Magnet Rise', 'good', animDelay);
					actions += "" + poke.getName() + " levitated with electromagnetism!";
					break;
				case 'smackdown':
					self.resultAnim(poke, 'Smacked Down', 'bad', animDelay);
					actions += "" + poke.getName() + " fell straight down!";
					poke.removeVolatile('magnetrise');
					poke.removeVolatile('telekinesis');
					break;
				case 'substitute':
					if (kwargs.damage) {
						self.resultAnim(poke, 'Damage', 'bad', animDelay);
						actions += "The substitute took damage for "+poke.getLowerName()+"!";
					} else if (kwargs.block) {
						self.resultAnim(poke, 'Blocked', 'neutral', animDelay);
						actions += 'But it failed!';
					} else if (kwargs.already) {
						actions += '' + poke.getName() + ' already has a substitute!';
					} else {
						poke.sprite.animSub();
						actions += '' + poke.getName() + ' put in a substitute!';
					}
					break;
				case 'uproar':
					if (kwargs.upkeep) {
						actions += "" + poke.getName() + " is making an uproar!";
					} else {
						actions += "" + poke.getName() + " caused an uproar!";
					}
					break;
				case 'doomdesire':
					actions += '' + poke.getName() + ' chose Doom Desire as its destiny!';
					break;
				case 'futuresight':
					actions += '' + poke.getName() + ' foresaw an attack!';
					break;
				case 'mimic':
					actions += '' + poke.getName() + ' learned ' + Tools.escapeHTML(args[3]) + '!';
					break;
				case 'followme':
				case 'ragepowder':
					actions += '' + poke.getName() + ' became the center of attention!';
					break;
				case 'powder':
					actions += '' + poke.getName() + ' is covered in powder!';
					break;
				default:
					actions += "" + poke.getName() + "'s " + effect.name + " started!";
				}
				break;
			case '-end':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.removeVolatile(effect.id);
				switch (effect.id) {
				case 'powertrick':
					self.resultAnim(poke, 'Power Trick', 'neutral', animDelay);
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'telekinesis':
					self.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral', animDelay);
					actions += "" + poke.getName() + " was freed from the telekinesis!";
					break;
				case 'confusion':
					self.resultAnim(poke, 'Confusion&nbsp;ended', 'good', animDelay);
					if (!kwargs.silent) {
						if (fromeffect.effectType === 'Item') {
							actions += "" + poke.getName() + "'s " + fromeffect.name + " snapped out of its confusion!";
							break;
						}
						if (poke.side.n === 0) actions += "" + poke.getName() + " snapped out of its confusion.";
						else actions += "" + poke.getName() + " snapped out of confusion!";
					}
					break;
				case 'leechseed':
					if (fromeffect.id === 'rapidspin') {
						self.resultAnim(poke, 'De-seeded', 'good', animDelay);
						actions += "" + poke.getName() + " was freed from Leech Seed!";
					}
					break;
				case 'healblock':
					self.resultAnim(poke, 'Heal Block ended', 'good', animDelay);
					actions += "" + poke.getName() + "'s Heal Block wore off!";
					break;
				case 'taunt':
					self.resultAnim(poke, 'Taunt&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s taunt wore off!";
					break;
				case 'disable':
					self.resultAnim(poke, 'Disable&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + " is no longer disabled!";
					break;
				case 'embargo':
					self.resultAnim(poke, 'Embargo ended', 'good', animDelay);
					actions += "" + poke.getName() + " can use items again!";
					break;
				case 'torment':
					self.resultAnim(poke, 'Torment&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s torment wore off!";
					break;
				case 'encore':
					self.resultAnim(poke, 'Encore&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s encore ended!";
					break;
				case 'bide':
					actions += "" + poke.getName() + " unleashed energy!";
					break;
				case 'magnetrise':
					if (poke.side.n === 0) actions += "" + poke.getName() + "'s electromagnetism wore off!";
					else actions += "The electromagnetism of "+poke.getLowerName()+" wore off!";
					break;
				case 'perishsong':
					poke.removeVolatile('perish3');
					break;
				case 'substitute':
					poke.sprite.animSubFade();
					self.resultAnim(poke, 'Faded', 'bad', animDelay);
					actions += '' + poke.getName() + "'s substitute faded!";
					break;
				case 'uproar':
					actions += "" + poke.getName() + " calmed down.";
					break;
				case 'stockpile':
					poke.removeVolatile('stockpile1');
					poke.removeVolatile('stockpile2');
					poke.removeVolatile('stockpile3');
					actions += "" + poke.getName() + "'s stockpiled effect wore off!";
					break;
				case 'infestation':
					actions += '' + poke.getName() + ' was freed from Infestation!';
					break;
				default:
					if (effect.effectType === 'Move') {
						actions += '' + poke.getName() + " took the " + effect.name + " attack!";
					} else {
						actions += "" + poke.getName() + "'s " + effect.name + " ended!";
					}
				}
				break;
			case '-singleturn':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addTurnstatus(effect.id);

				switch (effect.id) {
				case 'roost':
					self.resultAnim(poke, 'Landed', 'neutral', animDelay);
					//actions += '' + poke.getName() + ' landed on the ground!';
					break;
				case 'quickguard':
					self.resultAnim(poke, 'Quick Guard', 'good', animDelay);
					actions += "Quick Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'wideguard':
					self.resultAnim(poke, 'Wide Guard', 'good', animDelay);
					actions += "Wide Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'protect':
					self.resultAnim(poke, 'Protected', 'good', animDelay);
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'endure':
					self.resultAnim(poke, 'Enduring', 'good', animDelay);
					actions += '' + poke.getName() + ' braced itself!';
					break;
				case 'helpinghand':
					self.resultAnim(poke, 'Helping Hand', 'good', animDelay);
					actions += '' + ofpoke.getName() + " is ready to help " + poke.getLowerName() + "!";
					break;
				case 'focuspunch':
					self.resultAnim(poke, 'Focusing', 'neutral', animDelay);
					actions += '' + poke.getName() + ' is tightening its focus!';
					break;
				case 'snatch':
					actions += '' + poke.getName() + ' waits for a target to make a move!';
					break;
				case 'magiccoat':
					actions += '' + poke.getName() + ' shrouded itself with Magic Coat!';
					break;
				case 'matblock':
					actions += '' + poke.getName() + ' intends to flip up a mat and block incoming attacks!';
					break;
				case 'electrify':
					actions += '' + poke.getName() + '\'s moves have been electrified!';
					break;
				}
				break;
			case '-singlemove':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addMovestatus(effect.id);

				switch (effect.id) {
				case 'grudge':
					actions += '' + poke.getName() + ' wants its target to bear a grudge!';
					break;
				case 'destinybond':
					actions += '' + poke.getName() + ' is trying to take its foe down with it!';
					break;
				}
				break;

			case '-activate':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				switch (effect.id) {
				case 'confusion':
					actions += "" + poke.getName() + " is confused!";
					break;
				case 'destinybond':
					actions += '' + poke.getName() + ' took its attacker down with it!';
					break;
				case 'snatch':
					actions += "" + poke.getName() + " snatched " + ofpoke.getLowerName() + "'s move!";
					break;
				case 'grudge':
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " lost all its PP due to the grudge!";
					break;
				case 'quickguard':
					poke.addTurnstatus('quickguard');
					self.resultAnim(poke, 'Quick Guard', 'good', animDelay);
					actions += "Quick Guard protected " + poke.getLowerName() + "!";
					break;
				case 'wideguard':
					poke.addTurnstatus('wideguard');
					self.resultAnim(poke, 'Wide Guard', 'good', animDelay);
					actions += "Wide Guard protected " + poke.getLowerName() + "!";
					break;
				case 'protect':
					poke.addTurnstatus('protect');
					self.resultAnim(poke, 'Protected', 'good', animDelay);
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'substitute':
					if (kwargs.damage) {
						self.resultAnim(poke, 'Damage', 'bad', animDelay);
						actions += 'The substitute took damage for ' + poke.getLowerName() + '!';
					} else if (kwargs.block) {
						self.resultAnim(poke, 'Blocked', 'neutral', animDelay);
						actions += '' + poke.getName() + "'s Substitute blocked " + Tools.getMove(kwargs.block || args[3]).name + '!';
					}
					break;
				case 'attract':
					actions += '' + poke.getName() + ' is in love with ' + ofpoke.getLowerName() + '!';
					break;
				case 'bide':
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'mist':
					actions += "" + poke.getName() + " is protected by the mist!";
					break;
				case 'trapped':
					actions += "" + poke.getName() + " can no longer escape!";
					break;
				case 'stickyweb':
					actions += '' + poke.getName() + ' was caught in a sticky web!';
					break;
				case 'happyhour':
					actions += 'Everyone is caught up in the happy atmosphere!';
					break;
				case 'celebrate':
					actions += 'Congratulations, ' + Tools.escapeHTML(poke.side.name) + '!';
					break;

				// move activations
				case 'trick':
				case 'switcheroo':
					actions += '' + poke.getName() + ' switched items with its target!';
					break;
				case 'brickbreak':
					actions += poke.getName() + " shattered " + ofpoke.getTeamName() + " protections!";
					ofpoke.removeSideCondition('Reflect');
					ofpoke.removeSideCondition('LightScreen');
					break;
				case 'pursuit':
					actions += "" + poke.getName() + " is being sent back!";
					break;
				case 'feint':
					actions += "" + poke.getName() + " fell for the feint!";
					break;
				case 'spite':
					actions += "It reduced the PP of " + poke.getLowerName() + "'s " + Tools.getMove(args[3]).name + " by " + Tools.escapeHTML(args[4]) + "!";
					break;
				case 'gravity':
					actions += "" + poke.getName() + " couldn't stay airborne because of gravity!";
					poke.removeVolatile('magnetrise');
					poke.removeVolatile('telekinesis');
					poke.sprite.anim({time:100});
					break;
				case 'magnitude':
					actions += "Magnitude " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'sketch':
					actions += "" + poke.getName() + " sketched " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'skillswap':
					actions += "" + poke.getName() + " swapped Abilities with its target!";
					if (ofpoke && poke.side !== ofpoke.side) {
						self.resultAnim(poke, Tools.escapeHTML(args[3]), 'neutral', 1);
						self.resultAnim(ofpoke, Tools.escapeHTML(args[4]), 'neutral', 4);
						actions += "<br />" + poke.getName() + " acquired " + Tools.escapeHTML(args[3]) + "!";
						actions += "<br />" + ofpoke.getName() + " acquired " + Tools.escapeHTML(args[4]) + "!";
					}
					break;
				case 'charge':
					actions += "" + poke.getName() + " began charging power!";
					break;
				case 'struggle':
					actions += "" + poke.getName() + " has no moves left!";
					break;
				case 'bind':
					actions += '' + poke.getName() + ' was squeezed by ' + ofpoke.getLowerName() + '!';
					break;
				case 'wrap':
					actions += '' + poke.getName() + ' was wrapped by ' + ofpoke.getLowerName() + '!';
					break;
				case 'clamp':
					actions += '' + ofpoke.getName() + ' clamped ' + poke.getLowerName() + '!';
					break;
				case 'whirlpool':
					actions += '' + poke.getName() + ' became trapped in the vortex!';
					break;
				case 'firespin':
					actions += '' + poke.getName() + ' became trapped in the fiery vortex!';
					break;
				case 'magmastorm':
					actions += '' + poke.getName() + ' became trapped by swirling magma!';
					break;
				case 'sandtomb':
					actions += '' + poke.getName() + ' became trapped by Sand Tomb!';
					break;
				case 'infestation':
					actions += '' + poke.getName() + ' has been afflicted with an infestation by ' + ofpoke.getLowerName() + '!';
					break;
				case 'afteryou':
					actions += '' + poke.getName() + ' took the kind offer!';
					break;
				case 'quash':
					actions += "" + poke.getName() + "'s move was postponed!";
					break;
				case 'powersplit':
					actions += '' + poke.getName() + ' shared its power with the target!';
					break;
				case 'guardsplit':
					actions += '' + poke.getName() + ' shared its guard with the target!';
					break;
				case 'ingrain':
					actions += '' + poke.getName() + ' anchored itself with its roots!';
					break;
				case 'matblock':
					actions += '' + Tools.escapeHTML(args[3]) + ' was blocked by the kicked-up mat!';
					break;
				case 'powder':
					actions += 'When the flame touched the powder on the Pokémon, it exploded!';
					break;
				case 'fairylock':
					actions += 'No one will be able to run away during the next turn!';
					break;

				// ability activations
				case 'sturdy':
					actions += '' + poke.getName() + ' held on thanks to Sturdy!';
					break;
				case 'magicbounce':
				case 'magiccoat':
				case 'rebound':
					break;
				case 'wonderguard':
					self.resultAnim(poke, 'Immune', 'neutral', animDelay);
					actions += '' + poke.getName() + '\'s Wonder Guard evades the attack!';
					break;
				case 'speedboost':
					actions += "" + poke.getName() + "'s' Speed Boost increases its speed!";
					break;
				case 'forewarn':
					actions += "" + poke.getName() + "'s Forewarn alerted it to " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'anticipation':
					actions += "" + poke.getName() + " shuddered!";
					break;
				case 'telepathy':
					actions += "" + poke.getName() + " avoids attacks by its ally Pok&#xE9;mon!";
					break;
				case 'suctioncups':
					actions += '' + poke.getName() + ' anchors itself!';
					break;
				case 'symbiosis':
					actions += '' + ofpoke.getName() + ' shared its ' + Tools.getItem(args[3]).name + ' with ' + poke.getLowerName();
					break;

				// item activations
				case 'custapberry':
				case 'quickclaw':
					//actions += ''+poke.getName()+' is already preparing its next move!';
					actions += '' + poke.getName() + '\'s ' + effect.name + ' let it move first!';
					break;
				case 'leppaberry':
					actions += '' + poke.getName() + " restored " + Tools.escapeHTML(args[3]) + "'s PP using its Leppa Berry!";
					break;
				default:
					actions += "" + poke.getName() + "'s " + effect.name + " activated!";
				}
				break;

			case '-sidestart':
				var side = this.getSide(args[1]);
				var effect = Tools.getEffect(args[2]);
				side.addSideCondition(effect.name);

				switch (effect.id) {
				case 'stealthrock':
					actions += "Pointed stones float in the air around " + side.getLowerTeamName() + "!";
					break;
				case 'spikes':
					actions += "Spikes were scattered all around the feet of " + side.getLowerTeamName() + "!";
					break;
				case 'toxicspikes':
					actions += "Poison spikes were scattered all around the feet of " + side.getLowerTeamName() + "!";
					break;
				case 'stickyweb':
					actions += "A sticky web spreads out beneath " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'tailwind':
					actions += "The tailwind blew from behind " + side.getLowerTeamName() + "!";
					break;
				case 'reflect':
					actions += "Reflect raised " + side.getLowerTeamName() + "'s Defense!";
					break;
				case 'lightscreen':
					actions += "Light Screen raised " + side.getLowerTeamName() + "'s Special Defense!";
					break;
				case 'safeguard':
					actions += "" + side.getTeamName() + " became cloaked in a mystical veil!";
					break;
				case 'mist':
					actions += "" + side.getTeamName() + " became shrouded in mist!";
					break;
				case 'luckychant':
					actions += 'The Lucky Chant shielded ' + side.getLowerTeamName() + ' from critical hits!';
					break;
				case 'firepledge':
					actions += "A sea of fire enveloped " + side.getLowerTeamName() + "!";
					break;
				case 'waterpledge':
					actions += "A rainbow appeared in the sky on " + side.getLowerTeamName() + "'s side!";
					break;
				case 'grasspledge':
					actions += "A swamp enveloped " + side.getLowerTeamName() + "!";
					break;
				default:
					actions += "" + effect.name + " started!";
					break;
				}
				break;
			case '-sideend':
				var side = this.getSide(args[1]);
				var effect = Tools.getEffect(args[2]);
				var from = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				side.removeSideCondition(effect.name);

				switch (effect.id) {
				case 'stealthrock':
					actions += "The pointed stones disappeared from around " + side.getLowerTeamName() + "!";
					break;
				case 'spikes':
					actions += "The spikes disappeared from around " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'toxicspikes':
					actions += "The poison spikes disappeared from around " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'stickyweb':
					actions += "The sticky web has disappeared from beneath " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'tailwind':
					actions += "" + side.getTeamName() + "'s tailwind petered out!";
					break;
				case 'reflect':
					actions += "" + side.getTeamName() + "'s Reflect wore off!";
					break;
				case 'lightscreen':
					actions += "" + side.getTeamName() + "'s Light Screen wore off!";
					break;
				case 'safeguard':
					actions += "" + side.getTeamName() + " is no longer protected by Safeguard!";
					break;
				case 'mist':
					actions += "" + side.getTeamName() + " is no longer protected by mist!";
					break;
				case 'luckychant':
					actions += "" + side.getTeamName() + "'s Lucky Chant wore off!";
					break;
				case 'firepledge':
					actions += "The sea of fire around " + side.getLowerTeamName() + " disappeared!";
					break;
				case 'waterpledge':
					actions += "The rainbow on " + side.getLowerTeamName() + "'s side disappeared!";
					break;
				case 'grasspledge':
					actions += "The swamp around " + side.getLowerTeamName() + " disappeared!";
					break;
				default:
					actions += "" + effect.name + " ended!";
					break;
				}
				break;

			case '-weather':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				self.changeWeather(effect.name, poke, kwargs.upkeep);
				break;

			case '-fieldstart':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				self.addPseudoWeather(effect.name, poke);

				switch (effect.id) {
				case 'trickroom':
					actions += "" + poke.getName() + ' twisted the dimensions!';
					break;
				case 'wonderroom':
					actions += "It created a bizarre area in which the Defense and Sp. Def stats are swapped!";
					break;
				case 'magicroom':
					actions += "It created a bizarre area in which Pok&#xE9;mon's held items lose their effects!";
					break;
				case 'gravity':
					actions += "Gravity intensified!";
					break;
				case 'mudsport':
					actions += "Electric's power was weakened!";
					break;
				case 'watersport':
					actions += "Fire's power was weakened!";
					break;
				default:
					actions += effect.name+" started!";
					break;
				}
				break;

			case '-fieldend':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				self.removePseudoWeather(effect.name, poke);

				switch (effect.id) {
				case 'trickroom':
					actions += 'The twisted dimensions returned to normal!';
					break;
				case 'wonderroom':
					actions += 'Wonder Room wore off, and the Defense and Sp. Def stats returned to normal!';
					break;
				case 'magicroom':
					actions += "Magic Room wore off, and the held items' effects returned to normal!";
					break;
				case 'gravity':
					actions += 'Gravity returned to normal!';
					break;
				case 'mudsport':
					actions += 'The effects of Mud Sport have faded.';
					break;
				case 'watersport':
					actions += 'The effects of Water Sport have faded.';
					break;
				default:
					actions += effect.name+" ended!";
					break;
				}
				break;

			case '-fieldactivate':
				var effect = Tools.getEffect(args[1]);
				switch (effect.id) {
				case 'perishsong':
					actions += 'All Pok&#xE9;mon hearing the song will faint in three turns!';
					if (self.mySide.active[0] && !self.mySide.active[0].volatiles['perish0']
					&& !self.mySide.active[0].volatiles['perish1'] && !self.mySide.active[0].volatiles['perish2']) {
						self.mySide.active[0].addVolatile('perish3');
					}
					if (self.yourSide.active[0] && !self.yourSide.active[0].volatiles['perish0']
					 && !self.yourSide.active[0].volatiles['perish1'] && !self.yourSide.active[0].volatiles['perish2']) {
						self.yourSide.active[0].addVolatile('perish3');
					}
					self.mySide.updateStatbar();
					self.yourSide.updateStatbar();
					break;
				case 'payday':
					actions += 'Coins were scattered everywhere!';
					break;
				case 'iondeluge':
					actions += 'A deluge of ions showers the battlefield!';
					break;
				default:
					actions += ''+effect.name+' hit!';
					break;
				}
				break;

			case '-message':
				actions += Tools.escapeHTML(args[1]);
				break;

			case '-anim':
				var poke = self.getPokemon(args[1]);
				var move = Tools.getMove(args[2]);
				if (self.checkActive(poke)) return;
				poke2 = self.getPokemon(args[3]);
				poke.sprite.beforeMove();
				kwargs.silent = true;
				self.useMove(poke, move, poke2, kwargs);
				poke.sprite.afterMove();
				break;

			case '-hint':
				hiddenactions += '('+Tools.escapeHTML(args[1])+')';
				break;

			default:
				self.logConsole('Unknown minor: ' + args[0]);
				if (self.errorCallback) self.errorCallback(self);
				break;
			}
		}
		if (actions) {
			self.message('<small>' + actions + '</small>', hiddenactions ? '<small>' + hiddenactions + '</small>' : '');
		} else if (hiddenactions) {
			self.message('', '<small>' + hiddenactions + '</small>');
		}
	}

	/* this.parseSpriteData = function (name) {
		var siden = 0,
			foe = false;
		while (true) {
			if (name.substr(0, 6) === 'foeof-') {
				foe = true;
				name = name.substr(6);
			} else if (name.substr(0, 9) === 'switched-') name = name.substr(9);
			else if (name.substr(0, 9) === 'existing-') name = name.substr(9);
			else if (name.substr(0, 4) === 'foe-') {
				siden = self.p2.n;
				name = name.substr(4);
			} else if (name.substr(0, 5) === 'ally-') {
				siden = self.p1.n;
				name = name.substr(5);
			} else break;
		}
		if (name.substr(name.length - 1) === ')') {
			var parenIndex = name.lastIndexOf('(');
			if (parenIndex > 0) {
				var species = name.substr(parenIndex + 1);
				name = species.substr(0, species.length - 1);
			}
		}
		if (foe) siden = (siden ? 0 : 1);

		var data = Tools.getTemplate(name);
		return data.spriteData[siden];
	} */
	this.parseDetails = function (name, pokemonid, details, output) {
		if (!output) output = {};
		if (!details) details = "";
		output.details = details;
		output.name = name;
		output.species = name;
		output.level = 100;
		output.shiny = false;
		output.gender = '';
		output.ident = (name?pokemonid:'');
		output.searchid = (name?(pokemonid + '|' + details):'');
		var splitDetails = details.split(', ');
		if (splitDetails[splitDetails.length-1] === 'shiny')
		{
			output.shiny = true;
			splitDetails.pop();
		}
		if (splitDetails[splitDetails.length-1] === 'M' || splitDetails[splitDetails.length-1] === 'F')
		{
			output.gender = splitDetails[splitDetails.length-1];
			splitDetails.pop();
		}
		if (splitDetails[1])
		{
			output.level = parseInt(splitDetails[1].substr(1)) || 100;
		}
		if (splitDetails[0])
		{
			output.species = splitDetails[0];
		}
		return output;
	};
	this.getPokemon = function (pokemonid, details) {
		var siden = -1;
		var name = pokemonid;
		var isNew = false; // if yes, don't match any pokemon that already exists (for Team Preview)
		var isOld = false; // if yes, match only pokemon that have been revealed, and can match fainted pokemon (now default)
		var isOther = false; // if yes, don't match an active pokemon (for switching)
		//var position = 0; // todo: use for position in doubles/triples
		var getfoe = false;
		var slot; // if there is an explicit slot for this pokemon
		var slotChart = {a:0,b:1,c:2,d:3,e:4,f:5};
		if (typeof pokemonid === 'undefined' || name === '??') return null;
		if (name.substr(0, 5) === 'foe: ') {
			name = name.substr(5);
			pokemonid = name;
			getfoe = true;
		}
		if (name.substr(0, 5) === 'new: ') {
			name = name.substr(5);
			pokemonid = name;
			isNew = true;
			isOther = true;
		}
		if (name.substr(0, 7) === 'other: ') {
			name = name.substr(7);
			pokemonid = name;
			isOther = true;
		}
		if (name.substr(0, 5) === 'old: ') {
			name = name.substr(5);
			pokemonid = name;
			isOld = true;
		}
		if (name.substr(0, 4) === 'p2: ' || name === 'p2') {
			siden = self.p2.n;
			name = name.substr(4);
			species = name;
		} else if (name.substr(0, 4) === 'p1: ' || name === 'p1') {
			siden = self.p1.n;
			name = name.substr(4);
			species = name;
		} else if (name.substr(0, 2) === 'p2' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2,1)];
			siden = self.p2.n;
			name = name.substr(5);
			pokemonid = 'p2: '+name;
			species = name;
		} else if (name.substr(0, 2) === 'p1' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2,1)];
			siden = self.p1.n;
			name = name.substr(5);
			pokemonid = 'p1: '+name;
			species = name;
		}

		if (!slot) slot = 0;

		if (!details) {
			if (siden < 0) return null;
			if (self.sides[siden].active[slot]) return self.sides[siden].active[slot];
		}

		var species = name;
		var gender = '';
		var level = 100;
		var shiny = false;
		var searchid = '';
		if (details) searchid = pokemonid+'|'+details;

		var bestMatchName = null;
		if (siden !== self.p2.n && !isNew) {
			if (self.p1.active[slot] && self.p1.active[slot].searchid === searchid && !isOther) {
				self.p1.active[slot].slot = slot;
				return self.p1.active[slot];
			}
			for (var i = 0; i < self.p1.pokemon.length; i++) {
				var pokemon = self.p1.pokemon[i];
				if (pokemon.fainted && (isNew || isOther)) continue;
				if (isOther) {
					if (self.p1.active.indexOf(pokemon) >= 0) continue;
					if (pokemon == self.p1.lastPokemon && !self.p1.active[slot]) continue;
				}
				if (pokemon.searchid === searchid || (!pokemon.searchid && pokemon.checkDetails(details)) || (!searchid && pokemon.ident === pokemonid)) {
					if (!pokemon.searchid)
					{
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = self.p1.newPokemon(self.parseDetails(name, pokemonid, details), i);
						}
					}
					pokemon.slot = slot;
					return pokemon;
				}
			}
		}
		if (siden !== self.p1.n && !isNew) {
			if (self.p2.active[slot] && self.p2.active[slot].searchid === searchid && !isOther) {
				self.p2.active[slot].slot = slot;
				return self.p2.active[slot];
			}
			for (var i = 0; i < self.p2.pokemon.length; i++) {
				var pokemon = self.p2.pokemon[i];
				if (pokemon.fainted && (isNew || isOther)) continue;
				if (isOther) {
					if (self.p2.active.indexOf(pokemon) >= 0) continue;
					if (pokemon == self.p2.lastPokemon && !self.p2.active[slot]) continue;
				}
				if (pokemon.searchid === searchid || (!pokemon.searchid && pokemon.checkDetails(details)) || (!searchid && pokemon.ident === pokemonid)) {
					if (!pokemon.searchid)
					{
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = self.p2.newPokemon(self.parseDetails(name, pokemonid, details), i);
						}
					}
					pokemon.slot = slot;
					return pokemon;
				}
			}
		}
		if (!isNew && !isOther && !details) {
			return false;
		}
		if (siden < 0) siden = self.p1.n;
		if (details) {
			var splitDetails = details.split(', ');
			if (splitDetails[splitDetails.length-1] === 'shiny') {
				shiny = true;
				splitDetails.pop();
			}
			if (splitDetails[splitDetails.length-1] === 'M' || splitDetails[splitDetails.length-1] === 'F') {
				gender = splitDetails[splitDetails.length-1];
				splitDetails.pop();
			}
			if (splitDetails[1]) {
				level = parseInt(splitDetails[1].substr(1)) || 100;
			}
			if (splitDetails[0]) {
				species = splitDetails[0];
			}
		}
		var pokemon = self.sides[siden].newPokemon({
			species: species,
			details: details,
			name: name,
			ident: (name?pokemonid:''),
			searchid: (name?(pokemonid + '|' + details):''),
			level: level,
			gender: gender,
			shiny: shiny,
			slot: slot
		});
		return pokemon;
	}
	this.getSide = function (sidename) {
		if (sidename === 'p1' || sidename.substr(0,3)==='p1:') return self.p1;
		if (sidename === 'p2' || sidename.substr(0,3)==='p2:') return self.p2;
		if (self.mySide.id == sidename) return self.mySide;
		if (self.yourSide.id == sidename) return self.yourSide;
		if (self.mySide.name == sidename) return self.mySide;
		if (self.yourSide.name == sidename) return self.yourSide;
		return {
			name: sidename,
			id: sidename.replace(/ /g, '')
		};
	}

	this.add = function (command, fastForward) {
		if (self.playbackState === 0) {
			self.playbackState = 1;
			self.activityQueue.push(command);
		} else if (self.playbackState === 4) {
			self.playbackState = 2;
			self.paused = false;
			self.activityQueue.push(command);
			self.activityQueueActive = true;
			self.soundStart();
			if (fastForward) {
				self.fastForwardTo(-1);
			} else {
				self.nextActivity();
			}
		} else {
			self.activityQueue.push(command);
		}
	}
	this.instantAdd = function (command) {
		self.run(command, true);
		self.preemptActivityQueue.push(command);
		self.add(command);
	}
	this.teamPreview = function (start) {
		for (var k = 0; k < 2; k++) {
			var teamText = '';
			var text = '';
			self.spriteElems[k].empty();
			if (!start) {
				self.sides[k].updateSprites();
				continue;
			}
			for (var i = 0; i < self.sides[k].pokemon.length; i++) {
				var pokemon = self.sides[k].pokemon[i];

				var spriteData = Tools.getSpriteData(pokemon, k, {afd: self.tier === "[Seasonal] Fools Festival"});
				var y = 0;
				var x = 0;
				if (k) {
					y = Math.floor(96-spriteData.h)/2 + 50 + 3 * (i + 6 - self.sides[k].pokemon.length);
					x = Math.floor(96-spriteData.w)/2 + 180 + 50 * (i + 6 - self.sides[k].pokemon.length);
				} else {
					y = Math.floor(96-spriteData.h)/2 + 200 + 3 * i;
					x = Math.floor(96-spriteData.w)/2 + 100 + 50 * i;
				}
				if (teamText) teamText += ' / ';
				teamText += pokemon.species;
				text += '<img src="' + spriteData.url + '" width="'+spriteData.w+'" height="'+spriteData.h+'" style="position:absolute;top:' + y + 'px;left:' + x + 'px" />';
			}
			self.sides[k].totalPokemon = i;
			self.sides[k].updateSidebar();
			if (teamText) {
				self.log('<div class="chat"><strong>' + Tools.escapeHTML(self.sides[k].name) + '\'s team:</strong> <em style="color:#445566;display:block;">' + Tools.escapeHTML(teamText) + '</em></div>');
			}
			self.spriteElems[k].html(text);
		}
	};
	this.runMajor = function(args, kwargs, preempt) {
		switch (args[0]) {
		case 'start':
			self.teamPreview(false);
			self.mySide.active[0] = null;
			self.yourSide.active[0] = null;
			if (self.waitForResult()) return;
			self.start();
			break;
		case 'turn':
			if (self.endPrevAction()) return;
			self.setTurn(args[1]);
			break;
		case 'tier':
			if (!args[1]) args[1] = '';
			for (var i in kwargs) args[1] += '['+i+'] '+kwargs[i];
			self.log('<div style="padding:5px 0"><small>Format:</small> <br /><strong>' + Tools.escapeHTML(args[1]) + '</strong></div>');
			self.tier = args[1];
			break;
		case 'gametype':
			self.gameType = args[1];
			if (args[1] === 'doubles') {
				if (self.mySide.active.length < 2) self.mySide.active.push(null);
				if (self.yourSide.active.length < 2) self.yourSide.active.push(null);
			}
			if (args[1] === 'triples' || args[1] === 'rotation') {
				if (self.mySide.active.length < 3) self.mySide.active.push(null);
				if (self.yourSide.active.length < 3) self.yourSide.active.push(null);
			}
			break;
		case 'variation':
			self.log('<div><small>Variation: <em>' + Tools.escapeHTML(args[1]) + '</em></small></div>');
			break;
		case 'rule':
			var ruleArgs = args[1].split(': ');
			self.log('<div><small><em>' + Tools.escapeHTML(ruleArgs[0]) + (ruleArgs[1]?':':'') + '</em> ' + Tools.escapeHTML(ruleArgs[1]||'') + '</div>');
			break;
		case 'rated':
			self.rated = true;
			self.log('<div class="rated"><strong>Rated battle</strong></div>');
			break;
		case 'chat':
		case 'c':
			name = args[1];
			if (self.ignoreSpects && !self.getSide(name).battle) break;
			if (window.app && app.ignore && app.ignore[toUserid(name)]) break;
			args.shift();
			args.shift();
			var message = args.join('|');
			if (message.substr(0,2) === '//') {
				self.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '">' + Tools.escapeHTML(name) + ':</strong> <em>' + Tools.parseMessage(message.substr(1), name) + '</em></div>', preempt);
			} else if (message.substr(0,4).toLowerCase() === '/me ') {
				self.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '">&bull;</strong> <em>' + Tools.escapeHTML(name) + ' <i>' + Tools.parseMessage(message.substr(4), name) + '</i></em></div>', preempt);
			} else if (message.substr(0,14).toLowerCase() === '/data-pokemon ') {
				if (window.Chart) self.log('<div class="chat"><ul class=\"utilichart\">'+Chart.pokemonRow(Tools.getTemplate(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0,11).toLowerCase() === '/data-item ') {
				if (window.Chart) self.log('<div class="chat"><ul class=\"utilichart\">'+Chart.itemRow(Tools.getItem(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0,14).toLowerCase() === '/data-ability ') {
				if (window.Chart) self.log('<div class="chat"><ul class=\"utilichart\">'+Chart.abilityRow(Tools.getAbility(message.substr(14)),'',{})+'<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0,11).toLowerCase() === '/data-move ') {
				if (window.Chart) self.log('<div class="chat"><ul class=\"utilichart\">'+Chart.moveRow(Tools.getMove(message.substr(11)),'',{})+'<li style=\"clear:both\"></li></ul></div>', preempt);
			} else {
				self.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="'+Tools.escapeHTML(name)+'">' + Tools.escapeHTML(name) + ':</strong> <em>' + Tools.parseMessage(message, name) + '</em></div>', preempt);
			}
			break;
		case 'chatmsg':
			args.shift();
			list = args.join('|');
			self.log('<div class="chat">' + Tools.escapeHTML(list) + '</div>', preempt);
			break;
		case 'chatmsg-raw':
		case 'raw':
		case 'html':
			args.shift();
			list = args.join('|');
			self.log('<div class="chat">' + Tools.sanitizeHTML(list) + '</div>', preempt);
			break;
		case 'pm':
			self.log('<div class="chat"><strong>' + Tools.escapeHTML(args[1]) + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + Tools.escapeHTML(args[2], true) + '\')">(Private to ' + Tools.escapeHTML(args[3]) + ')</i> ' + Tools.parseMessage(args[4], args[1]) + '</span>');
			break;
		case 'askreg':
			self.log('<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="'+Tools.escapeHTML(args[1])+'"><b>Register</b></button></div>');
			break;
		case 'inactive':
			self.kickingInactive = true;
			args.shift();
			list = args.join('|');
			self.log('<div class="chat timer">' + Tools.escapeHTML(list) + '</div>', preempt);
			break;
		case 'inactiveoff':
			self.kickingInactive = false;
			args.shift();
			list = args.join('|');
			self.log('<div class="chat timer">' + Tools.escapeHTML(list) + '</div>', preempt);
			break;
		case 'join':
		case 'j':
		case 'J':
			self.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' joined.</small></div>', preempt);
			break;
		case 'leave':
		case 'l':
		case 'L':
			self.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' left.</small></div>', preempt);
			break;
		case 'spectator':
		case 'spectatorleave':
			break;
		case 'player':
			self.getSide(args[1]).setName(args[2]);
			self.getSide(args[1]).setSprite(args[3]);
			break;
		case 'win':
			self.winner(args[1]);
			break;
		case 'tie':
			self.winner();
			break;
		case 'prematureend':
			self.prematureEnd();
			break;
		case 'clearpoke':
			self.p1.pokemon = [];
			self.p2.pokemon = [];
			for (var i=0; i<self.p1.active.length; i++) {
				self.p1.active[i] = null;
				self.p2.active[i] = null;
			}
			break;
		case 'poke':
			self.getPokemon('new: '+args[1], args[2]);
			break;
		case 'detailschange':
			if (self.waitForResult()) return;
			var poke = self.getPokemon(args[1]);
			poke.removeVolatile('formechange');
			poke.removeVolatile('typeadd');
			poke.removeVolatile('typechange');

			var newSpecies;
			var commaIndex = args[2].indexOf(',');
			if (commaIndex === -1) {
				newSpecies = args[2];
			} else {
				newSpecies = args[2].substr(0, commaIndex);
			}
			var template = Tools.getTemplate(newSpecies);
			var spriteData = {'shiny': poke.sprite.sp.shiny};
			poke.sprite.animTransform($.extend(spriteData, template));
			poke.sprite.oldsp = null;
			poke.spriteid = template.spriteid;
			poke.side.updateStatbar();

			poke.species = newSpecies;
			poke.ability = poke.baseAbility = (template.abilities ? template.abilities['0'] : '');
			poke.types = template.types && template.types.slice(0);

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];
			poke.side.updateSidebar();
			break;
		case 'teampreview':
			self.teamPreview(true);
			self.teamPreviewCount = args[1];
			break;
		case 'switch':
		case 'drag':
		case 'replace':
			self.endLastTurn();
			if (self.waitForResult()) return;
			var poke = self.getPokemon('other: '+args[1], args[2]);
			var slot = poke.slot;
			poke.healthParse(args[3]);
			if (args[0] === 'switch') {
				if (poke.side.active[slot])
				{
					poke.side.switchOut(poke.side.active[slot]);
					if (self.waitForResult()) return;
				}
				poke.side.switchIn(poke);
			} else if (args[0] === 'replace') {
				poke.side.replace(poke);
			} else {
				poke.side.dragIn(poke);
			}
			break;
		case 'faint':
			if (self.waitForResult()) return;
			var poke = self.getPokemon(args[1]);
			poke.side.faint(poke);
			break;
		case 'swap':
			if (isNaN(Number(args[2]))) {
				var poke = self.getPokemon('other: ' + args[1]);
				poke.side.swapWith(poke, self.getPokemon('other: ' + args[2]), kwargs);
			} else {
				var poke = self.getPokemon(args[1]);
				poke.side.swapTo(poke, args[2], kwargs);
			}
			break;
		case 'move':
			self.endLastTurn();
			if (!kwargs.from && self.waitForResult()) return;
			var poke = self.getPokemon(args[1]);
			var move = Tools.getMove(args[2]);
			if (self.checkActive(poke)) return;
			poke2 = self.getPokemon(args[3]);
			poke.sprite.beforeMove();
			self.useMove(poke, move, poke2, kwargs);
			poke.sprite.afterMove();
			break;
		case 'cant':
			self.endLastTurn();
			if (self.waitForResult()) return;
			var poke = self.getPokemon(args[1]);
			var effect = Tools.getEffect(args[2]);
			var move = Tools.getMove(args[3]);
			self.cantUseMove(poke, effect, move, kwargs);
			break;
		case 'message':
			self.message(Tools.escapeHTML(args[1]));
			break;
		case 'done':
		case '':
			if (self.done || self.endPrevAction()) return;
			break;
		case 'error':
			args.shift();
			self.message('<strong>Error:</strong> ' + Tools.escapeHTML(args.join('|')));
			self.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			break;
		case 'warning':
			args.shift();
			self.message('<strong>Warning:</strong> ' + Tools.escapeHTML(args.join('|')));
			self.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			self.activityWait(1000);
			break;
		case 'gen':
			self.gen = parseInt(args[1]);
			self.updateGen();
			break;
		case 'callback':
			args.shift();
			if (self.customCallback) self.customCallback(self, args[0], args, kwargs);
			break;
		case 'debug':
			args.shift();
			name = args.join(' ');
			self.log('<div class="debug"><div class="chat"><small style="color:#999">[DEBUG] ' + Tools.escapeHTML(name) + '.</small></div></div>', preempt);
			break;
		case 'unlink':
			break;
		default:
			self.logConsole('unknown command: ' + args[0]);
			self.log('<div>Unknown command: ' + Tools.escapeHTML(args[0]) + '</div>');
			if (self.errorCallback) self.errorCallback(self);
			break;
		}
	};
	this.run = function (str, preempt) {
		if (self.preemptActivityQueue.length && str === self.preemptActivityQueue[0]) {
			self.preemptActivityQueue.shift();
			self.preemptCatchup();
			return;
		}
		str = $.trim(str);
		if (!str) return;
		if (str.charAt(0) !== '|' || str.substr(0,2) === '||') {
			if (str.charAt(0) === '|') str = str.substr(2);
			self.log('<div class="chat">' + Tools.escapeHTML(str) + '</div>', preempt);
		} else {
			var args = ['done'], kwargs = {};
			str = $.trim(str.substr(1));
			if (str !== '') {
				args = str.split('|');
				for (var i=0,len=args.length; i<len; i++) args[i] = $.trim(args[i]);
			}
			while (args[args.length-1] && args[args.length-1].substr(0,1) === '[') {
				var bracketPos = args[args.length-1].indexOf(']');
				if (bracketPos <= 0) break;
				var argstr = args.pop();
				// default to '.' so it evaluates to boolean true
				kwargs[argstr.substr(1,bracketPos-1)] = ($.trim(argstr.substr(bracketPos+1)) || '.');
			}

			// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
			var nextLine = '', nextArgs = [''], nextKwargs = {};
			nextLine = self.activityQueue[self.activityStep+1];
			if (nextLine && nextLine.substr(0,2) === '|-') {
				nextLine = $.trim(nextLine.substr(1));
				nextArgs = nextLine.split('|');
				while (nextArgs[nextArgs.length-1] && nextArgs[nextArgs.length-1].substr(0,1) === '[') {
					var bracketPos = nextArgs[nextArgs.length-1].indexOf(']');
					if (bracketPos <= 0) break;
					var argstr = nextArgs.pop();
					// default to '.' so it evaluates to boolean true
					nextKwargs[argstr.substr(1,bracketPos-1)] = ($.trim(argstr.substr(bracketPos+1)) || '.');
				}
			}

			if (self.debug) {
				if (args[0].substr(0,1) === '-') {
					self.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
				} else {
					self.runMajor(args, kwargs, preempt);
				}
			} else try {
				if (args[0].substr(0,1) === '-') {
					self.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
				} else {
					self.runMajor(args, kwargs, preempt);
				}
			} catch (e) {
				self.log('<div class="chat">Error parsing: ' + Tools.escapeHTML(str) + '</div>', preempt);
				if (e.stack) {
					var stack = ''+e.stack;
					stack = stack.split("\n").slice(0,2).join("\n");
					self.log('<div class="chat" style="white-space:pre-wrap">' + Tools.escapeHTML(stack) + '</div>', preempt);
				} else {
					self.log('<div class="chat">Error: ' + Tools.escapeHTML(''+e) + '</div>', preempt);
				}
				if (self.errorCallback) self.errorCallback(self);
			}
		}
	}
	this.endPrevAction = function () {
		if (self.minorQueue.length) {
			self.runMinor();
			self.activityStep--;
			return true;
		}
		if (self.resultWaiting || self.messageActive) {
			self.endAction();
			self.activityStep--;
			self.resultWaiting = false;
			self.multiHitMove = null;
			return true;
		}
		return false;
	}
	this.checkActive = function (poke) {
		if (!poke.side.active[poke.slot]) {
			// SOMEONE jumped in in the middle of a replay. <_<
			poke.side.replace(poke);
		}
		return false;
	}
	this.waitForResult = function () {
		if (self.endPrevAction()) return true;
		self.resultWaiting = true;
		return false;
	}
	this.doBeforeThis = function (act) {
		if (act()) {
			self.activityStep--;
			return true;
		}
		return false;
	}
	this.doAfterThis = function (act) {
		this.activityAfter = act;
	}

	// activity queue
	this.animationDelay = 0;
	this.activityStep = 0;
	this.activityDelay = 0;
	this.activityQueue = [];
	this.preemptActivityQueue = [];
	this.activityAfter = null;
	this.activityAnimations = $();
	this.activityQueueActive = false;
	this.fastForward = false;
	this.minorQueue = [];
	this.resultWaiting = false;
	this.multiHitMove = null;

	this.queue1 = function () {
		if (self.activeQueue === self.queue1) self.nextActivity();
	};
	this.queue2 = function () {
		if (self.activeQueue === self.queue2) self.nextActivity();
	};
	this.swapQueues = function () {
		if (self.activeQueue === self.queue1) self.activeQueue = self.queue2;
		else self.activeQueue = self.queue2;
	};
	this.activeQueue = this.queue1;

	this.pause = function () {
		self.paused = true;
		self.playbackState = 3;
		if (self.resumeButton) {
			self.frameElem.append('<div class="playbutton"><button data-action="resume"><i class="icon-play"></i> Resume</button></div>');
			self.frameElem.find('div.playbutton button').click(self.resumeButton);
		}
		self.soundPause();
	}
	this.play = function () {
		if (self.fastForward) {
			self.paused = false;
			self.playbackState = 5;
		} else if (self.paused) {
			self.paused = false;
			if (self.playbackState === 1) {
				self.soundStop();
			}
			self.playbackState = 2;
			if (!self.done) {
				self.soundStart();
			}
			self.nextActivity();
		}
		self.frameElem.find('div.playbutton').remove();
	}
	this.skipTurn = function () {
		self.fastForwardTo(self.turn + 1);
	};
	this.fastForwardTo = function (time) {
		self.playbackState = 5;
		if (self.fastForward) return;
		time = parseInt(time);
		if (isNaN(time)) return;
		if (self.activityStep >= self.activityQueue.length - 1 && time >= self.turn + 1 && !self.activityQueueActive) return;
		if (self.done && time >= self.turn + 1) return;
		self.messagebarElem.empty().css({
			opacity: 0,
			height: 0
		});
		if (time <= self.turn && time !== -1) {
			var paused = self.paused;
			self.reset();
			self.activityQueueActive = true;
			if (paused) self.pause();
			else self.paused = false;
			self.fastForward = time;
			self.elem.append('<div class="seeking"><strong>seeking...</strong></div>');
			$.fx.off = true;
			self.swapQueues();
			self.nextActivity();
			return;
		}
		self.fxElem.empty();
		self.fastForward = time;
		self.elem.append('<div class="seeking"><strong>seeking...</strong></div>');
		$.fx.off = true;
		if (self.yourSide.active[0] && self.yourSide.active[0].sprite) {
			self.yourSide.active[0].sprite.animReset();
		}
		if (self.mySide.active[0] && self.mySide.active[0].sprite) {
			self.mySide.active[0].sprite.animReset();
		}
		self.swapQueues();
		self.nextActivity();
	};
	this.fastForwardOff = function () {
		self.fastForward = false;
		self.elem.find('.seeking').remove();
		$.fx.off = false;
		self.playbackState = 2;
	};
	this.nextActivity = function () {
		if (self.paused && !self.fastForward) {
			return;
		}
		self.activityQueueActive = true;
		self.fxElem.empty();
		self.animationDelay = 0;
		while (true) {
			self.activityAnimations = $();
			if (self.activityStep >= self.activityQueue.length) {
				self.activityQueueActive = false;
				self.paused = true;
				self.fastForwardOff();
				if (self.done) {
					self.soundStop();
				}
				self.playbackState = 4;
				if (self.endCallback) self.endCallback(self);
				return;
			}
			var ret;
			if (self.activityAfter) {
				ret = self.activityAfter();
				self.activityAfter = null;
			}
			if (self.paused && !self.fastForward) return;
			if (!ret) {
				self.run(self.activityQueue[self.activityStep]);
				self.activityStep++;
			}
			if (self.activityDelay) {
				self.delayElem.delay(self.activityDelay);
				self.activityWait(self.delayElem);
				self.activityDelay = 0;
			}
			if (self.activityAnimations.length) break;
		}
		self.activityAnimations.promise().done(self.activeQueue);
	}
	this.activityWait = function (elem) {
		if (typeof elem === 'number' && elem > self.activityDelay) {
			self.activityDelay = elem;
			return;
		}
		self.activityAnimations = self.activityAnimations.add(elem);
	}

	this.newBattle = function () {
		self.reset();
		self.activityQueue = [];
	}
	this.setQueue = function (queue) {
		self.reset();
		self.activityQueue = queue;

		/* for (var i = 0; i < queue.length && i < 20; i++) {
			if (queue[i].substr(0, 8) === 'pokemon ') {
				var sp = self.parseSpriteData(queue[i].substr(8));
				BattleSound.loadEffect(sp.cryurl);
				self.preloadImage(sp.url);
				if (sp.url === '/sprites/bwani/meloetta.gif') {
					self.preloadImage('/sprites/bwani/meloetta-pirouette.gif');
				}
				if (sp.url === '/sprites/bwani-back/meloetta.gif') {
					self.preloadImage('/sprites/bwani-back/meloetta-pirouette.gif');
				}
			}
		} */
		self.playbackState = 1;
	}

	// callback
	this.faintCallback = null;
	this.switchCallback = null;
	this.dragCallback = null;
	this.turnCallback = null;
	this.startCallback = null;
	this.stagnateCallback = null;
	this.endCallback = null;
	this.customCallback = null;
	this.errorCallback = null;

	// external
	this.resumeButton = this.play;

	this.preloadCache = {};
	this.preloadDone = 0;
	this.preloadNeeded = 0;
	this.bgm = null;

	this.mute = false;

	this.preloadImage = function (url) {
		if (noPreload) return;
		var token = url.replace(/\.(gif|png)$/, '').replace(/\//g, '-');
		if (self.preloadCache[token]) {
			return;
		}
		self.preloadNeeded++;
		self.preloadCache[token] = new Image();
		self.preloadCache[token].onload = function () {
			self.preloadDone++;
			self.preloadCallback(self.preloadNeeded === self.preloadDone, self.preloadDone, self.preloadNeeded);
		};
		self.preloadCache[token].src = url;
	};
	this.preloadCallback = function () {};
	this.preloadEffects = function () {
		if (noPreload) return;
		for (i in BattleEffects) {
			if (BattleEffects[i].url) self.preloadImage(BattleEffects[i].url);
		}
		self.preloadImage(Tools.resourcePrefix + 'fx/weather-raindance.jpg'); // rain is used often enough to precache
		self.preloadImage(Tools.resourcePrefix + 'sprites/bw/substitute.png');
		self.preloadImage(Tools.resourcePrefix + 'sprites/bw-back/substitute.png');
		//self.preloadImage(Tools.resourcePrefix + 'fx/bg.jpg');
	};
	self.bgm = null;
	this.dogarsCheck = function(pokemon) {
		if (pokemon.side.n === 1) return;

		if (pokemon.species === 'Koffing' && pokemon.name.match(/dogars/i)) {
			if (window.forceBgm !== -1) {
				window.originalBgm = window.bgmNum;
				window.forceBgm = -1;
				self.preloadBgm();
				self.soundStart();
			}
		} else if (window.forceBgm === -1) {
			window.forceBgm = null;
			if (window.originalBgm || window.originalBgm === 0) {
				window.forceBgm = window.originalBgm;
			}
			self.preloadBgm();
			self.soundStart();
		}
	};
	this.preloadBgm = function() {
		var bgmNum = Math.floor(Math.random() * 11);

		if (window.forceBgm || window.forceBgm === 0) bgmNum = window.forceBgm;
		window.bgmNum = bgmNum;
		switch (bgmNum) {
		case -1:
			BattleSound.loadBgm('audio/bw2-homika-dogars.mp3', 1661, 68131);
			self.bgm = 'audio/bw2-homika-dogars.mp3';
			break;
		case 0:
			BattleSound.loadBgm('audio/hgss-kanto-trainer.mp3', 13003, 94656);
			self.bgm = 'audio/hgss-kanto-trainer.mp3';
			break;
		case 1:
			BattleSound.loadBgm('audio/bw-subway-trainer.mp3', 15503, 110984);
			self.bgm = 'audio/bw-subway-trainer.mp3';
			break;
		case 2:
			BattleSound.loadBgm('audio/bw-trainer.mp3', 14629, 110109);
			self.bgm = 'audio/bw-trainer.mp3';
			break;
		case 3:
			BattleSound.loadBgm('audio/bw-rival.mp3', 19180, 57373);
			self.bgm = 'audio/bw-rival.mp3';
			break;
		case 4:
			BattleSound.loadBgm('audio/dpp-trainer.mp3', 13440, 96959);
			self.bgm = 'audio/dpp-trainer.mp3';
			break;
		case 5:
			BattleSound.loadBgm('audio/hgss-johto-trainer.mp3', 23731, 125086);
			self.bgm = 'audio/hgss-johto-trainer.mp3';
			break;
		case 6:
			BattleSound.loadBgm('audio/dpp-rival.mp3', 13888, 66352);
			self.bgm = 'audio/dpp-rival.mp3';
			break;
		case 7:
			BattleSound.loadBgm('audio/bw2-kanto-gym-leader.mp3', 14626, 58986);
			self.bgm = 'audio/bw2-kanto-gym-leader.mp3';
			break;
		case 8:
			BattleSound.loadBgm('audio/bw2-rival.mp3', 7152, 68708);
			self.bgm = 'audio/bw2-rival.mp3';
			break;
		case 9:
			BattleSound.loadBgm('audio/xy-trainer.mp3', 7802, 82469);
			self.bgm = 'audio/xy-trainer.mp3';
			break;
		case 10:
		default:
			BattleSound.loadBgm('audio/xy-rival.mp3', 7802, 58634);
			self.bgm = 'audio/xy-rival.mp3';
			break;
		}
	};
	this.setMute = function (mute) {
		BattleSound.setMute(mute);
	};
	this.soundStart = function () {
		if (!this.bgm) this.preloadBgm();
		BattleSound.playBgm(this.bgm);
	};
	this.soundStop = function () {
		BattleSound.stopBgm();
	};
	this.soundPause = function () {
		BattleSound.pauseBgm();
	};

	this.messageDelay = 8;

	this.preloadEffects();

	self.init();
}

/*

			self.lastmove = 'healing-wish';
				Tools.getMove('HealingWish').residualAnim(self, [pokemon.sprite]);
				pokemon.side.wisher = null;

*/
