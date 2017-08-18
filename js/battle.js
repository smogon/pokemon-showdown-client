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

var BattleSoundLibrary = (function () {
	function BattleSoundLibrary() {
		// effects
		this.effectCache = {};

		// bgm
		this.bgmCache = {};
		this.bgm = null;

		// misc
		this.soundPlaceholder = {
			play: function () { return this; },
			pause: function () { return this; },
			stop: function () { return this; },
			resume: function () { return this; },
			setVolume: function () { return this; },
			onposition: function () { return this; }
		};
	}

	// options
	BattleSoundLibrary.prototype.effectVolume = 50;
	BattleSoundLibrary.prototype.bgmVolume = 50;
	BattleSoundLibrary.prototype.muted = false;

	BattleSoundLibrary.prototype.loadEffect = function (url) {
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
	BattleSoundLibrary.prototype.playEffect = function (url) {
		if (!this.muted) this.loadEffect(url).setVolume(this.effectVolume).play();
	};

	BattleSoundLibrary.prototype.loadBgm = function (url, loopstart, loopend) {
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
			return (this.bgmCache[url] = this.soundPlaceholder);
		}
		this.bgmCache[url].onposition(loopend, function (evP) {
			this.setPosition(this.position - (loopend - loopstart));
		});
		return this.bgmCache[url];
	};
	BattleSoundLibrary.prototype.playBgm = function (url, loopstart, loopstop) {
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
		} catch (e) {}
	};
	BattleSoundLibrary.prototype.pauseBgm = function () {
		if (this.bgm) {
			this.bgm.pause();
		}
	};
	BattleSoundLibrary.prototype.stopBgm = function () {
		if (this.bgm) {
			this.bgm.stop();
			this.bgm = null;
		}
	};

	// setting
	BattleSoundLibrary.prototype.setMute = function (muted) {
		muted = !!muted;
		if (this.muted == muted) return;
		this.muted = muted;
		if (muted) {
			if (this.bgm) this.bgm.pause();
		} else {
			if (this.bgm) this.bgm.play();
		}
	};

	function loudnessPercentToAmplitudePercent(loudnessPercent) {
		// 10 dB is perceived as approximately twice as loud
		var decibels = 10 * Math.log(loudnessPercent / 100) / Math.log(2);
		return Math.pow(10, decibels / 20) * 100;
	}
	BattleSoundLibrary.prototype.setBgmVolume = function (bgmVolume) {
		this.bgmVolume = loudnessPercentToAmplitudePercent(bgmVolume);
		if (this.bgm) {
			try {
				this.bgm.setVolume(this.bgmVolume);
			} catch (e) {}
		}
	};
	BattleSoundLibrary.prototype.setEffectVolume = function (effectVolume) {
		this.effectVolume = loudnessPercentToAmplitudePercent(effectVolume);
	};

	return BattleSoundLibrary;
})();

var BattleSound = new BattleSoundLibrary();

var Pokemon = (function () {
	function Pokemon(species, side) {
		this.side = side;

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
		this.baseAbility = '';
		this.item = '';
		this.itemEffect = '';
		this.prevItem = '';
		this.prevItemEffect = '';
		this.species = species;
		this.fainted = false;
		this.zerohp = false;

		this.status = '';
		this.statusStage = 0;
		this.volatiles = {};
		this.turnstatuses = {};
		this.movestatuses = {};
		this.lastmove = '';

		// [[moveName, ppUsed]]
		this.moveTrack = [];

		this.name = '';
		this.species = '';
		this.id = '';
		this.statbarElem = null;
	}

	Pokemon.prototype.getHPColor = function () {
		if (this.hpcolor) return this.hpcolor;
		var ratio = this.hp / this.maxhp;
		if (ratio > 0.5) return 'g';
		if (ratio > 0.2) return 'y';
		return 'r';
	};
	Pokemon.prototype.getHPColorClass = function () {
		switch (this.getHPColor()) {
		case 'y': return ' hpbar-yellow';
		case 'r': return ' hpbar-red';
		}
		return '';
	};
	Pokemon.prototype.getPixelRange = function (pixels, color) {
		var epsilon = 0.5 / 714;

		if (pixels === 0) return [0, 0];
		if (pixels === 1) return [0 + epsilon, 2 / 48 - epsilon];
		if (pixels === 9) {
			if (color === 'y') { // ratio is > 0.2
				return [0.2 + epsilon, 10 / 48 - epsilon];
			} else { // ratio is <= 0.2
				return [9 / 48, 0.2];
			}
		}
		if (pixels === 24) {
			if (color === 'g') { // ratio is > 0.5
				return [0.5 + epsilon, 25 / 48 - epsilon];
			} else { // ratio is exactly 0.5
				return [0.5, 0.5];
			}
		}
		if (pixels === 48) return [1, 1];

		return [pixels / 48, (pixels + 1) / 48 - epsilon];
	};
	Pokemon.prototype.getFormattedRange = function (range, precision, separator) {
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
	// Returns [min, max] damage dealt as a proportion of total HP from 0 to 1
	Pokemon.prototype.getDamageRange = function (damage) {
		if (damage[1] !== 48) {
			var ratio = damage[0] / damage[1];
			return [ratio, ratio];
		} else if (damage[3] === undefined) {
			// wrong pixel damage.
			// this case exists for backward compatibility only.
			return [damage[2] / 100, damage[2] / 100];
		}
		// pixel damage
		var oldrange = this.getPixelRange(damage[3], damage[4]);
		var newrange = this.getPixelRange(damage[3] + damage[0], this.hpcolor);
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
	Pokemon.prototype.healthParse = function (hpstring, parsedamage, heal) {
		// returns [delta, denominator, percent(, oldnum, oldcolor)] or false
		if (!hpstring || !hpstring.length) return false;
		var parenIndex = hpstring.lastIndexOf('(');
		if (parenIndex >= 0) {
			// old style damage and health reporting
			if (parsedamage) {
				var damage = parseFloat(hpstring);
				// unusual check preseved for backward compatbility
				if (isNaN(damage)) damage = 50;
				if (heal) {
					this.hp += this.maxhp * damage / 100;
					if (this.hp > this.maxhp) this.hp = this.maxhp;
				} else {
					this.hp -= this.maxhp * damage / 100;
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
			if (hpstring.substr(hpstring.length - 1) !== ')') {
				return false;
			}
			hpstring = hpstring.substr(parenIndex + 1, hpstring.length - parenIndex - 2);
		}

		var oldhp = (this.zerohp || this.fainted) ? 0 : (this.hp || 1);
		var oldmaxhp = this.maxhp;
		var oldwidth = this.hpWidth(100);
		var oldcolor = this.hpcolor;

		this.side.battle.parseHealth(hpstring, this);
		if (oldmaxhp === 0) { // max hp not known before parsing this message
			oldmaxhp = oldhp = this.maxhp;
		}

		var oldnum = oldhp ? (Math.floor(oldhp / oldmaxhp * this.maxhp) || 1) : 0;
		var delta = this.hp - oldnum;
		var deltawidth = this.hpWidth(100) - oldwidth;
		return [delta, this.maxhp, deltawidth, oldnum, oldcolor];
	};
	Pokemon.prototype.checkDetails = function (details) {
		if (!details) return false;
		if (details === this.details) return true;
		if (!this.needsReplace) return false;
		// the actual forme was hidden on Team Preview
		details = details.replace(/-[A-Za-z0-9]+(, |$)/, '$1');
		return (details === this.details.replace(/-\*(, |$)/, '$1'));
	};
	Pokemon.prototype.getIdent = function () {
		var slots = ['a', 'b', 'c', 'd', 'e', 'f'];
		return this.ident.substr(0, 2) + slots[this.slot] + this.ident.substr(2);
	};
	Pokemon.prototype.removeVolatile = function (volatile) {
		if (!this.hasVolatile(volatile)) return;
		if (volatile === 'formechange') {
			this.sprite.removeTransform();
		}
		if (this.volatiles[volatile][1]) this.volatiles[volatile][1].remove();
		delete this.volatiles[volatile];
	};
	Pokemon.prototype.addVolatile = function (volatile) {
		var battle = this.side.battle;
		if (this.hasVolatile(volatile)) return;
		this.volatiles[volatile] = [volatile, null];
		if (volatile === 'leechseed') {
			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.fxPrefix + 'energyball.png" style="display:none;position:absolute" />');
			var curelem = this.side.battle.spriteElemsFront[this.side.n].children().last();
			curelem.css(battle.pos({
				display: 'block',
				x: this.sprite.x - 30,
				y: this.sprite.y - 40,
				z: this.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			var elem = curelem;

			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.fxPrefix + 'energyball.png" style="display:none;position:absolute" />');
			curelem = this.side.battle.spriteElemsFront[this.side.n].children().last();
			curelem.css(battle.pos({
				display: 'block',
				x: this.sprite.x + 40,
				y: this.sprite.y - 35,
				z: this.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			elem = elem.add(curelem);

			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.fxPrefix + 'energyball.png" style="display:none;position:absolute" />');
			curelem = this.side.battle.spriteElemsFront[this.side.n].children().last();
			curelem.css(battle.pos({
				display: 'block',
				x: this.sprite.x + 20,
				y: this.sprite.y - 25,
				z: this.sprite.z,
				scale: .2,
				opacity: .6
			}, BattleEffects.energyball));
			elem = elem.add(curelem);
			this.volatiles[volatile][1] = elem;
		}
	};
	Pokemon.prototype.hasVolatile = function (volatile) {
		return !!this.volatiles[volatile];
	};
	Pokemon.prototype.removeTurnstatus = function (volatile) {
		if (!this.hasTurnstatus(volatile)) return;
		if (this.turnstatuses[volatile][1]) this.turnstatuses[volatile][1].remove();
		delete this.turnstatuses[volatile];
	};
	Pokemon.prototype.addTurnstatus = function (volatile) {
		volatile = toId(volatile);
		var battle = this.side.battle;
		if (this.hasTurnstatus(volatile)) {
			if ((volatile === 'protect' || volatile === 'magiccoat') && !battle.fastForward) {
				this.turnstatuses[volatile][1].css(battle.pos({
					x: this.sprite.x,
					y: this.sprite.y,
					z: this.sprite.behind(-15),
					xscale: 1 * 1.2,
					yscale: .7 * 1.2,
					opacity: 1
				}, BattleEffects.none), 300).animate(battle.pos({
					x: this.sprite.x,
					y: this.sprite.y,
					z: this.sprite.behind(-15),
					xscale: 1,
					yscale: .7,
					opacity: .4
				}, BattleEffects.none), 300);
			}
			return;
		}
		this.turnstatuses[volatile] = [volatile, null];
		if (volatile === 'protect' || volatile === 'magiccoat') {
			this.side.battle.spriteElemsFront[this.side.n].append('<div class="turnstatus-protect" style="display:none;position:absolute" />');
			var elem = this.side.battle.spriteElemsFront[this.side.n].children().last();
			if (!battle.fastForward) {
				elem.css(battle.pos({
					display: 'block',
					x: this.sprite.x,
					y: this.sprite.y,
					z: this.sprite.behind(-15),
					xscale: 1,
					yscale: 0,
					opacity: .1
				}, BattleEffects.none)).animate(battle.pos({
					x: this.sprite.x,
					y: this.sprite.y,
					z: this.sprite.behind(-15),
					xscale: 1,
					yscale: .7,
					opacity: .9
				}, BattleEffects.none), 300).animate({
					opacity: .4
				}, 300);
			} else {
				elem.css(battle.pos({
					display: 'block',
					x: this.sprite.x,
					y: this.sprite.y,
					z: this.sprite.behind(-15),
					xscale: 1,
					yscale: .7,
					opacity: .4
				}, BattleEffects.none));
			}
			this.turnstatuses[volatile][1] = elem;
		}
	};
	Pokemon.prototype.hasTurnstatus = function (volatile) {
		return !!this.turnstatuses[volatile];
	};
	Pokemon.prototype.clearTurnstatuses = function () {
		for (var i in this.turnstatuses) {
			this.removeTurnstatus(i);
		}
		this.turnstatuses = {};
	};
	Pokemon.prototype.removeMovestatus = function (volatile) {
		if (!this.hasMovestatus(volatile)) return;
		if (this.movestatuses[volatile][1]) this.movestatuses[volatile][1].remove();
		delete this.movestatuses[volatile];
	};
	Pokemon.prototype.addMovestatus = function (volatile) {
		volatile = toId(volatile);
		if (this.hasMovestatus(volatile)) return;
		this.movestatuses[volatile] = [volatile, null];
	};
	Pokemon.prototype.hasMovestatus = function (volatile) {
		return !!this.movestatuses[volatile];
	};
	Pokemon.prototype.clearMovestatuses = function () {
		for (var i in this.movestatuses) {
			this.removeMovestatus(i);
		}
		this.movestatuses = {};
	};
	Pokemon.prototype.clearVolatiles = function () {
		for (var i in this.volatiles) {
			this.removeVolatile(i);
		}
		this.volatiles = {};
		this.clearTurnstatuses();
		this.clearMovestatuses();
	};
	Pokemon.prototype.markMove = function (moveName, pp, recursionSource) {
		if (recursionSource === this.ident) return;
		if (pp === undefined) pp = 1;
		moveName = Tools.getMove(moveName).name;
		if (moveName === 'Struggle') return;
		if (this.volatiles.transform) {
			// make sure there is no infinite recursion if both Pokemon are transformed into each other
			if (!recursionSource) recursionSource = this.ident;
			this.volatiles.transform[2].markMove(moveName, 0, recursionSource);
			moveName = '*' + moveName;
		}
		for (var i = 0; i < this.moveTrack.length; i++) {
			if (moveName === this.moveTrack[i][0]) {
				this.moveTrack[i][1] += pp;
				return;
			}
		}
		this.moveTrack.push([moveName, pp]);
	};
	Pokemon.prototype.markAbility = function (ability, isNotBase) {
		ability = Tools.getAbility(ability).name;
		this.ability = ability;
		if (!this.baseAbility && !isNotBase) {
			this.baseAbility = ability;
		}
	};
	Pokemon.prototype.htmlName = function () {
		return '<span class="battle-nickname' + (this.side.n === 0 ? '' : '-foe') + '" title="' + this.species + '">' + Tools.escapeHTML(this.name) + '</span>';
	};
	Pokemon.prototype.getName = function (shortName) {
		if (this.side.n === 0) {
			return this.htmlName();
		} else {
			return (shortName ? "Opposing " : "The opposing ") + this.htmlName();
		}
	};
	Pokemon.prototype.getLowerName = function (shortName) {
		if (this.side.n === 0) {
			return this.htmlName();
		} else {
			return (shortName ? "opposing " : "the opposing ") + this.htmlName();
		}
	};
	Pokemon.prototype.getTitle = function () {
		var titlestring = '(' + this.ability + ') ';

		for (var i = 0; i < this.moves.length; i++) {
			if (i != 0) titlestring += ' / ';
			titlestring += Tools.getMove(this.moves[i]).name;
		}
		return titlestring;
	};
	Pokemon.prototype.getFullName = function (plaintext) {
		var name = this.side && this.side.n && (this.side.battle.ignoreOpponent || this.side.battle.ignoreNicks) ? this.species : Tools.escapeHTML(this.name);
		if (name !== this.species) {
			if (plaintext) {
				name += ' (' + this.species + ')';
			} else {
				name = '<span class="battle-nickname' + (this.side && this.side.n === 0 ? '' : '-foe') + '" title="' + this.species + '">' + name + ' <small>(' + this.species + ')</small>' + '</span>';
			}
		}
		if (plaintext) {
			if (this === this.side.active[0]) {
				name += ' (active)';
			} else if (this.fainted) {
				name += ' (fainted)';
			} else {
				var statustext = '';
				if (this.hp !== this.maxhp) {
					statustext += this.hpDisplay();
				}
				if (this.status) {
					if (statustext) statustext += '|';
					statustext += this.status;
				}
				if (statustext) {
					name += ' (' + statustext + ')';
				}
			}
		}
		return name;
	};
	Pokemon.prototype.getBoost = function (boostStat) {
		var boostStatTable = {
			atk: 'Atk',
			def: 'Def',
			spa: 'SpA',
			spd: 'SpD',
			spe: 'Spe',
			accuracy: 'Accuracy',
			evasion: 'Evasion',
			spc: 'Spc'
		};
		if (!this.boosts[boostStat]) {
			return '1&times;&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 6) this.boosts[boostStat] = 6;
		if (this.boosts[boostStat] < -6) this.boosts[boostStat] = -6;
		if (boostStat === 'accuracy' || boostStat === 'evasion') {
			if (this.boosts[boostStat] > 0) {
				var goodBoostTable = ['1&times;', '1.33&times;', '1.67&times;', '2&times;', '2.33&times;', '2.67&times;', '3&times;'];
				//var goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
				return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
			}
			var badBoostTable = ['1&times;', '0.75&times;', '0.6&times;', '0.5&times;', '0.43&times;', '0.38&times;', '0.33&times;'];
			//var badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
			return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		if (this.boosts[boostStat] > 0) {
			var goodBoostTable = ['1&times;', '1.5&times;', '2&times;', '2.5&times;', '3&times;', '3.5&times;', '4&times;'];
			//var goodBoostTable = ['Normal', '+1', '+2', '+3', '+4', '+5', '+6'];
			return '' + goodBoostTable[this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
		}
		var badBoostTable = ['1&times;', '0.67&times;', '0.5&times;', '0.4&times;', '0.33&times;', '0.29&times;', '0.25&times;'];
		//var badBoostTable = ['Normal', '&minus;1', '&minus;2', '&minus;3', '&minus;4', '&minus;5', '&minus;6'];
		return '' + badBoostTable[-this.boosts[boostStat]] + '&nbsp;' + boostStatTable[boostStat];
	};
	Pokemon.prototype.getBoostType = function (boostStat) {
		if (!this.boosts[boostStat]) return 'neutral';
		if (this.boosts[boostStat] > 0) return 'good';
		return 'bad';
	};
	Pokemon.prototype.clearVolatile = function () {
		this.ability = this.baseAbility;
		this.atk = this.atkStat;
		this.def = this.defStat;
		this.spa = this.spaStat;
		this.spd = this.spdStat;
		this.spe = this.speStat;
		this.boosts = {};
		this.clearVolatiles();
		for (var i = 0; i < this.moveTrack.length; i++) {
			if (this.moveTrack[i][0].charAt(0) === '*') {
				this.moveTrack.splice(i, 1);
				i--;
			}
		}
		//this.lastmove = '';
		this.statusStage = 0;
	};
	Pokemon.prototype.copyVolatileFrom = function (pokemon, copyAll) {
		this.boosts = pokemon.boosts;
		this.volatiles = pokemon.volatiles;
		//this.lastmove = pokemon.lastmove; // I think
		if (!copyAll) {
			this.removeVolatile('airballoon');
			this.removeVolatile('attract');
			this.removeVolatile('autotomize');
			this.removeVolatile('disable');
			this.removeVolatile('encore');
			this.removeVolatile('foresight');
			this.removeVolatile('imprison');
			this.removeVolatile('mimic');
			this.removeVolatile('miracleeye');
			this.removeVolatile('nightmare');
			this.removeVolatile('smackdown');
			this.removeVolatile('stockpile1');
			this.removeVolatile('stockpile2');
			this.removeVolatile('stockpile3');
			this.removeVolatile('torment');
			this.removeVolatile('typeadd');
			this.removeVolatile('typechange');
			this.removeVolatile('yawn');
		}
		this.removeVolatile('transform');
		this.removeVolatile('formechange');

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
	Pokemon.prototype.copyTypesFrom = function (pokemon) {
		this.addVolatile('typechange');
		if (pokemon.volatiles.typechange) {
			this.volatiles.typechange[2] = pokemon.volatiles.typechange[2];
		} else if (pokemon.volatiles.formechange) {
			var template = Tools.getTemplate(pokemon.volatiles.formechange[2]);
			this.volatiles.typechange[2] = template.types ? template.types.join('/') : '';
		} else {
			this.volatiles.typechange[2] = (
				window.BattleTeambuilderTable &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen] &&
				window.BattleTeambuilderTable['gen' + this.side.battle.gen].overrideType[toId(pokemon.species)]
			) || (pokemon.types ? pokemon.types.join('/') : '');
		}
		if (pokemon.volatiles.typeadd) {
			this.addVolatile('typeadd');
			this.volatiles.typeadd[2] = pokemon.volatiles.typeadd[2];
		} else {
			this.removeVolatile('typeadd');
		}
	};
	Pokemon.prototype.reset = function () {
		this.clearVolatile();
		this.hp = this.maxhp;
		this.zerohp = false;
		this.fainted = false;
		this.needsReplace = (this.details.indexOf('-*') >= 0);
		this.status = '';
		this.moveTrack = [];
		this.name = this.name || this.species;
	};
	// This function is used for two things:
	//   1) The percentage to display beside the HP bar.
	//   2) The width to draw an HP bar.
	//
	// This function is NOT used in the calculation of any other displayed
	// percentages or ranges, which have their own, more complex, formulae.
	Pokemon.prototype.hpWidth = function (maxWidth) {
		if (this.fainted || this.zerohp) return 0;

		// special case for low health...
		if (this.hp == 1 && this.maxhp > 10) return 1;

		if (this.maxhp === 48) {
			// Draw the health bar to the middle of the range.
			// This affects the width of the visual health bar *only*; it
			// does not affect the ranges displayed in any way.
			var range = this.getPixelRange(this.hp, this.hpcolor);
			var ratio = (range[0] + range[1]) / 2;
			return Math.round(maxWidth * ratio) || 1;
		}
		var percentage = Math.ceil(100 * this.hp / this.maxhp);
		if ((percentage === 100) && (this.hp < this.maxhp)) {
			percentage = 99;
		}
		return percentage * maxWidth / 100;
	};
	Pokemon.prototype.hpDisplay = function (precision) {
		if (precision === undefined) precision = 1;
		if (this.maxhp === 100) return this.hp + '%';
		if (this.maxhp !== 48) return (this.hp / this.maxhp * 100).toFixed(precision) + '%';
		var range = this.getPixelRange(this.hp, this.hpcolor);
		return this.getFormattedRange(range, precision, '–');
	};
	Pokemon.prototype.destroy = function () {
		if (this.sprite) this.sprite.destroy();
		delete this.side;
	};

	return Pokemon;
})();

var Sprite = (function () {
	function Sprite(spriteData, x, y, z, battle, siden) {
		this.battle = battle;
		this.siden = siden;
		this.forme = '';
		this.elem = null;
		this.cryurl = '';
		var sp = null;
		if (spriteData) {
			sp = spriteData;
			battle.spriteElems[siden].append('<img src="' + sp.url + '" style="display:none;position:absolute" />');
			this.elem = battle.spriteElems[siden].children().last();
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
		var pos = battle.pos({
			x: x,
			y: y,
			z: z
		}, {
			w: 0,
			h: 96
		});
		this.top = parseInt(pos.top + 40, 10);
		this.left = parseInt(pos.left, 10);
		this.isBackSprite = !siden;
		this.duringMove = false;
		this.isMissedPokemon = false;

		if (!spriteData) {
			this.delay = function () {};
			this.anim = function () {};
		}
	}

	Sprite.prototype.behindx = function (offset) {
		return this.x + (this.isBackSprite ? -1 : 1) * offset;
	};
	Sprite.prototype.behindy = function (offset) {
		return this.y + (this.isBackSprite ? 1 : -1) * offset;
	};
	Sprite.prototype.leftof = function (offset) {
		return this.x + (this.isBackSprite ? -1 : 1) * offset;
	};
	Sprite.prototype.behind = function (offset) {
		return this.z + (this.isBackSprite ? -1 : 1) * offset;
	};
	Sprite.prototype.animTransform = function (species, isCustomAnim) {
		if (!this.oldsp) this.oldsp = this.sp;
		if (species.volatiles && species.volatiles.formechange) species = species.volatiles.formechange[2];
		var sp = Tools.getSpriteData(species, this.isBackSprite ? 0 : 1, {
			afd: this.battle.tier === "[Seasonal] Fools Festival",
			gen: this.battle.gen
		});
		this.cryurl = sp.cryurl;
		var doCry = false;
		this.sp = sp;
		var self = this;
		var battle = this.battle;
		if (battle.fastForward) {
			this.elem.attr('src', sp.url);
			this.elem.css(battle.pos({
				x: self.x,
				y: self.y,
				z: self.z,
				opacity: 1
			}, sp));
			return;
		}
		if (isCustomAnim) {
			if (species.id === 'kyogreprimal') {
				BattleOtherAnims.primalalpha.anim(battle, [self]);
				doCry = true;
			} else if (species.id === 'groudonprimal') {
				BattleOtherAnims.primalomega.anim(battle, [self]);
				doCry = true;
			} else if (species.id === 'zygardecomplete') {
				BattleOtherAnims.powerconstruct.anim(battle, [self]);
			} else if (species.id === 'wishiwashischool' || species.id === 'greninjaash') {
				BattleOtherAnims.schoolingin.anim(battle, [self]);
			} else if (species.id === 'wishiwashi') {
				BattleOtherAnims.schoolingout.anim(battle, [self]);
			} else if (species.id === 'mimikyubusted') {
				// standard animation
			} else {
				BattleOtherAnims.megaevo.anim(battle, [self]);
				doCry = true;
			}
		}
		this.elem.animate(this.battle.pos({
			x: this.x,
			y: this.y,
			z: this.z,
			yscale: 0,
			xscale: 0,
			opacity: 0.3
		}, this.oldsp), 300, function () {
			if (self.cryurl && doCry) {
				//self.battle.logConsole('cry: ' + self.cryurl);
				BattleSound.playEffect(self.cryurl);
			}
			self.elem.attr('src', sp.url);
			self.elem.animate(battle.pos({
				x: self.x,
				y: self.y,
				z: self.z,
				opacity: 1
			}, sp), 300);
		});
		this.battle.activityWait(500);
	};
	Sprite.prototype.destroy = function () {
		if (this.elem) this.elem.remove();
		if (this.subElem) this.subElem.remove();
		delete this.battle;
	};
	Sprite.prototype.removeTransform = function (species) {
		if (this.oldsp) {
			var sp = this.oldsp;
			this.cryurl = sp.cryurl;
			this.sp = sp;
			this.oldsp = null;
			this.elem.attr('src', sp.url);
			this.elem.css(this.battle.pos({
				x: this.x,
				y: this.y,
				z: (this.subElem ? this.behind(30) : this.z),
				opacity: (this.subElem ? .3 : 1)
			}, sp));
		}
	};
	Sprite.prototype.animSub = function (instant) {
		var subsp = Tools.getSpriteData('substitute', this.siden, {
			afd: this.battle.tier === "[Seasonal] Fools Festival",
			gen: this.battle.gen
		});
		this.subsp = subsp;
		this.iw = subsp.w;
		this.ih = subsp.h;
		this.battle.spriteElemsFront[this.siden].append('<img src="' + subsp.url + '" style="display:none;position:absolute"' + (subsp.pixelated ? ' class="pixelated"' : '') + ' />');
		this.subElem = this.battle.spriteElemsFront[this.siden].children().last();

		//temp//this.subElem.css({position: 'absolute', display: 'block'});
		this.subElem.css({
			position: 'absolute',
			opacity: 0,
			display: 'block'
		});
		if (instant || this.battle.fastForward) {
			this.subElem.css(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.z,
				opacity: 1
			}, subsp));
			this.animReset();
			return;
		}
		this.selfAnim({}, 500);
		this.subElem.css(this.battle.pos({
			x: this.x,
			y: this.y + 50,
			z: this.z,
			opacity: 0
		}, subsp));
		this.subElem.animate(this.battle.pos({
			x: this.x,
			y: this.y,
			z: this.z
		}, subsp), 500);
		this.battle.activityWait(this.subElem);
	};
	Sprite.prototype.animSubFade = function () {
		if (!this.subElem) return;
		if (this.battle.activityDelay) {
			this.elem.delay(this.battle.activityDelay);
			this.subElem.delay(this.battle.activityDelay);
		}
		if (this.battle.fastForward) {
			this.subElem.remove();
		} else {
			this.subElem.animate(this.battle.pos({
				x: this.x,
				y: this.y - 50,
				z: this.z,
				opacity: 0
			}, this.subsp), 500);
		}

		this.subElem = null;
		this.selfAnim({}, 500);
		this.iw = this.sp.w;
		this.ih = this.sp.h;
		if (!this.battle.fastForward) this.battle.activityWait(this.elem);
	};
	Sprite.prototype.beforeMove = function () {
		if (this.subElem && !this.duringMove && !this.battle.fastForward) {
			this.duringMove = true;
			this.selfAnim({}, 300);
			this.subElem.animate(this.battle.pos({
				x: this.leftof(-50),
				y: this.y,
				z: this.z,
				opacity: 0.5
			}, this.subsp), 300);
			if (this.battle.sides[this.isBackSprite ? 1 : 0].active[0]) {
				this.battle.sides[this.isBackSprite ? 1 : 0].active[0].sprite.delay(300);
			}
			this.battle.animationDelay = 500;
			this.battle.activityWait(this.elem);

			return true;
		}
		return false;
	};
	Sprite.prototype.afterMove = function () {
		if (this.subElem && this.duringMove && !this.battle.fastForward) {
			this.subElem.delay(300);
			this.duringMove = false;
			var self = this;
			this.elem.add(this.subElem).promise().done(function () {
				if (!self.subElem || !self.elem) return;
				self.selfAnim({}, 300);
				self.subElem.animate(self.battle.pos({
					x: self.x,
					y: self.y,
					z: self.z,
					opacity: 1
				}, self.subsp), 300);
			});
			return true;
		}
		this.duringMove = false;
		return false;
	};
	Sprite.prototype.removeSub = function () {
		if (this.subElem) {
			if (this.battle.fastForward) {
				this.subElem.remove();
			} else {
				var temp = this.subElem;
				this.subElem.animate({
					opacity: 0
				}, function () {
					temp.remove();
				});
			}
			this.subElem = null;
		}
	};
	Sprite.prototype.animReset = function () {
		if (this.subElem) {
			this.elem.stop(true, false);
			this.subElem.stop(true, false);
			this.elem.css(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(30),
				opacity: .3
			}, this.sp));
			this.subElem.css(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.z
			}, this.subsp));
		} else {
			this.elem.stop(true, false);
			this.elem.css(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.z
			}, this.sp));
		}
	};
	Sprite.prototype.animSummon = function (slot, instant) {
		if (!Tools.prefs('nopastgens') && this.battle.gen <= 4 && this.battle.gameType === 'doubles') {
			this.x = (slot - 0.52) * (this.isBackSprite ? -1 : 1) * -55;
			this.y = (this.isBackSprite ? -1 : 1) + 1;
			this.statbarOffset = 0;
			if (!this.isBackSprite) this.statbarOffset = 30 * slot;
			if (this.isBackSprite) this.statbarOffset = -28 * slot;
		} else {
			this.x = slot * (this.isBackSprite ? -1 : 1) * -50;
			this.y = slot * (this.isBackSprite ? -1 : 1) * 10;
			this.statbarOffset = 0;
			if (!this.isBackSprite) this.statbarOffset = 17 * slot;
			if (this.isBackSprite) this.statbarOffset = -7 * slot;
		}

		// make sure element is in the right z-order
		if (!slot && this.isBackSprite || slot && !this.isBackSprite) {
			this.elem.prependTo(this.elem.parent());
		} else {
			this.elem.appendTo(this.elem.parent());
		}

		var pos = this.battle.pos(this, {
			w: 0,
			h: 96
		});
		this.top = parseInt(pos.top + 40, 10);
		this.left = parseInt(pos.left, 10);

		this.anim();
		this.w = this.sp.w;
		this.h = this.sp.h;
		this.elem.css({
			// 'z-index': (this.isBackSprite ? 1+slot : 4-slot),
			position: 'absolute',
			display: 'block'
		});
		if (this.battle.fastForward || instant) {
			this.elem.css(this.battle.pos({
				opacity: 1,
				x: this.x,
				y: this.y,
				z: this.z
			}, this.sp));
			return;
		}
		if (this.cryurl) {
			//this.battle.logConsole('cry: ' + this.cryurl);
			BattleSound.playEffect(this.cryurl);
		}
		this.elem.css(this.battle.pos({
			x: this.x,
			y: this.y - 10,
			z: this.z,
			scale: 0,
			opacity: 0
		}, this.sp));
		this.battle.showEffect('pokeball', {
			opacity: 0,
			x: this.x,
			y: this.y + 30,
			z: this.behind(50),
			scale: .7
		}, {
			opacity: 1,
			x: this.x,
			y: this.y - 10,
			z: this.z,
			time: 300
		}, 'ballistic2', 'fade');
		this.elem.delay(300).animate(this.battle.pos({
			x: this.x,
			y: this.y + 30,
			z: this.z
		}, this.sp), 400).animate(this.battle.posT({
			x: this.x,
			y: this.y,
			z: this.z
		}, this.sp, 'accel'), 300);
		this.battle.activityWait(this.elem);
		if (!this.battle.fastForward && this.sp.shiny) BattleOtherAnims.shiny.anim(this.battle, [this]);
	};
	Sprite.prototype.animDragIn = function (slot) {
		if (this.battle.fastForward) return this.animSummon(slot, true);

		if (!Tools.prefs('nopastgens') && this.battle.gen <= 4 && this.battle.gameType === 'doubles') {
			this.x = (slot - 0.52) * (this.isBackSprite ? -1 : 1) * -55;
			this.y = (this.isBackSprite ? -1 : 1) + 1;
			this.statbarOffset = 0;
			if (!this.isBackSprite) this.statbarOffset = 30 * slot;
			if (this.isBackSprite) this.statbarOffset = -28 * slot;
		} else {
			this.x = slot * (this.isBackSprite ? -1 : 1) * -50;
			this.y = slot * (this.isBackSprite ? -1 : 1) * 10;
			this.statbarOffset = 0;
			if (!this.isBackSprite) this.statbarOffset = 17 * slot;
			if (this.isBackSprite) this.statbarOffset = -7 * slot;
		}

		// make sure element is in the right z-order
		if (!slot && this.isBackSprite || slot && !this.isBackSprite) {
			this.elem.prependTo(this.elem.parent());
		} else {
			this.elem.appendTo(this.elem.parent());
		}

		var pos = this.battle.pos(this, {
			w: 0,
			h: 96
		});
		this.top = parseInt(pos.top + 40, 10);
		this.left = parseInt(pos.left, 10);

		this.anim();
		this.elem.css({
			// 'z-index': (this.isBackSprite ? 1+slot : 4-slot),
			position: 'absolute',
			opacity: 0,
			display: 'block'
		});
		this.elem.css(this.battle.pos({
			x: this.leftof(-50),
			y: this.y,
			z: this.z,
			opacity: 0
		}, this.sp));
		this.elem.delay(300).animate(this.battle.posT({
			x: this.x,
			y: this.y,
			z: this.z
		}, this.sp, 'decel'), 400);
		if (!this.battle.fastForward && this.sp.shiny) BattleOtherAnims.shiny.anim(this.battle, [this]);
		this.w = this.sp.w;
		this.h = this.sp.h;
		this.battle.activityWait(this.elem);
		this.battle.animationDelay = 700;
	};
	Sprite.prototype.animDragOut = function () {
		this.removeSub();
		if (this.battle.fastForward) return this.animUnsummon(true);
		this.elem.animate(this.battle.posT({
			x: this.leftof(50),
			y: this.y,
			z: this.z,
			opacity: 0
		}, this.sp, 'accel'), 400);
	};
	Sprite.prototype.animUnsummon = function (instant) {
		this.removeSub();
		if (this.battle.fastForward || instant) {
			this.elem.css('display', 'none');
			return;
		}
		this.anim({
			x: this.x,
			y: this.y - 40,
			z: this.z,
			scale: 0,
			opacity: 0,
			time: 400
		});
		this.battle.showEffect('pokeball', {
			opacity: 1,
			x: this.x,
			y: this.y - 40,
			z: this.z,
			scale: .7,
			time: 300
		}, {
			opacity: 0,
			x: this.x,
			y: this.y,
			z: this.behind(50),
			time: 700
		}, 'ballistic2');
		this.battle.activityWait(this.elem);
	};
	Sprite.prototype.animFaint = function () {
		this.removeSub();
		if (this.battle.fastForward) {
			this.elem.remove();
			this.elem = null;
			return;
		}
		if (this.cryurl) {
			//this.battle.logConsole('cry: ' + this.cryurl);
			BattleSound.playEffect(this.cryurl);
		}
		this.anim({
			y: this.y - 80,
			opacity: 0
		}, 'accel');
		this.battle.activityWait(this.elem);
		var self = this;
		this.elem.promise().done(function () {
			self.elem.remove();
			self.elem = null;
		});
	};
	Sprite.prototype.delay = function (time) {
		this.elem.delay(time);
		if (this.subElem) {
			this.subElem.delay(time);
		}
		return this;
	};
	Sprite.prototype.selfAnim = function (end, transition) {
		if (!end) return;
		end = $.extend({
			x: this.x,
			y: this.y,
			z: this.z,
			scale: 1,
			opacity: 1,
			time: 500
		}, end);
		if (this.subElem && !this.duringMove) {
			end.z += (this.isBackSprite ? -1 : 1) * 30;
			end.opacity *= .3;
		}
		if (this.battle.fastForward) {
			this.elem.css(this.battle.pos(end, this.sp));
			return;
		}
		this.elem.animate(this.battle.posT(end, this.sp, transition, this), end.time);
	};
	Sprite.prototype.anim = function (end, transition) {
		if (!end) return;
		end = $.extend({
			x: this.x,
			y: this.y,
			z: this.z,
			scale: 1,
			opacity: 1,
			time: 500
		}, end);
		if (this.subElem && !this.duringMove) {
			this.subElem.animate(this.battle.posT(end, this.subsp, transition, this), end.time);
		} else {
			this.elem.animate(this.battle.posT(end, this.sp, transition, this), end.time);
		}
	};

	return Sprite;
})();

var Side = (function () {
	function Side(battle, n) {
		this.battle = battle;
		this.name = '';
		this.id = '';
		this.initialized = false;
		this.n = n;
		this.foe = null;
		this.spriteid = 262;
		this.totalPokemon = 6;

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
			sprite: new Sprite(null, this.leftof(-100), this.y, this.z, this.battle, this.n)
		};
		this.missedPokemon.sprite.isMissedPokemon = true;

		this.sideConditions = {};
		this.wisher = null;

		this.active = [null];
		this.lastPokemon = null;
		this.pokemon = [];
	}

	Side.prototype.rollSprites = function () {
		var sprites = [1, 2, 101, 102, 169, 170];
		this.spriteid = sprites[Math.floor(Math.random() * sprites.length)];
	};

	Side.prototype.behindx = function (offset) {
		return this.x + (!this.n ? -1 : 1) * offset;
	};
	Side.prototype.behindy = function (offset) {
		return this.y + (!this.n ? 1 : -1) * offset;
	};
	Side.prototype.leftof = function (offset) {
		return (!this.n ? -1 : 1) * offset;
	};
	Side.prototype.behind = function (offset) {
		return this.z + (!this.n ? -1 : 1) * offset;
	};

	Side.prototype.reset = function () {
		this.pokemon = [];
		this.updateSprites();
		this.sideConditions = {};
	};
	Side.prototype.updateSprites = function () {
		this.z = (this.n ? 200 : 0);
		this.missedPokemon.sprite.destroy();
		this.missedPokemon = {
			sprite: new Sprite(null, this.leftof(-100), this.y, this.z, this.battle, this.n)
		};
		this.missedPokemon.sprite.isMissedPokemon = true;
		for (var i = 0; i < this.pokemon.length; i++) {
			var poke = this.pokemon[i];
			poke.sprite.destroy();
			poke.sprite = new Sprite(Tools.getSpriteData(poke, this.n, {
				afd: this.battle.tier === "[Seasonal] Fools Festival",
				gen: this.battle.gen
			}), this.x, this.y, this.z, this.battle, this.n);
		}
	};
	Side.prototype.setSprite = function (spriteid) {
		this.spriteid = spriteid;
		this.updateSidebar();
	};
	Side.prototype.setName = function (name, spriteid) {
		if (name) this.name = (name || '');
		this.id = toId(this.name);
		if (spriteid) {
			this.spriteid = spriteid;
		} else {
			this.rollSprites();
			if (this.foe && this.spriteid === this.foe.spriteid) this.rollSprites();
		}
		this.initialized = true;
		if (!name) {
			this.initialized = false;
		}
		this.updateSidebar();
		if (this.battle.stagnateCallback) this.battle.stagnateCallback(this.battle);
	};
	Side.prototype.getTeamName = function () {
		if (this === this.battle.mySide) return "Your team";
		return "The opposing team";
	};
	Side.prototype.getLowerTeamName = function () {
		if (this === this.battle.mySide) return "your team";
		return "the opposing team";
	};
	Side.prototype.updateSidebar = function () {
		var pokemonhtml = '';
		var noShow = this.battle.hardcoreMode && this.battle.gen < 7;
		for (var i = 0; i < 6; i++) {
			var poke = this.pokemon[i];
			if (i >= this.totalPokemon) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon('pokeball-none') + '"></span>';
			} else if (noShow && poke && poke.fainted) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon('pokeball-fainted') + '" title="Fainted"></span>';
			} else if (noShow && poke && poke.status) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon('pokeball-statused') + '" title="Status"></span>';
			} else if (noShow) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon('pokeball') + '" title="Non-statused"></span>';
			} else if (!poke) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon('pokeball') + '" title="Not revealed"></span>';
			} else if (!poke.ident && this.battle.teamPreviewCount && this.battle.teamPreviewCount < this.pokemon.length) {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon(poke, !this.n) + ';opacity:0.6" title="' + poke.getFullName(true) + '"></span>';
			} else {
				pokemonhtml += '<span class="picon" style="' + Tools.getPokemonIcon(poke, !this.n) + '" title="' + poke.getFullName(true) + '"></span>';
			}
			if (i % 3 === 2) pokemonhtml += '</div><div class="teamicons">';
		}
		pokemonhtml = '<div class="teamicons">' + pokemonhtml + '</div>';
		if (this.n === 1) {
			if (this.initialized) {
				this.battle.rightbarElem.html('<div class="trainer"><strong>' + Tools.escapeHTML(this.name) + '</strong><div class="trainersprite" style="background-image:url(' + Tools.resolveAvatar(this.spriteid) + ')"></div>' + pokemonhtml + '</div>').find('.trainer').css('opacity', 1);
			} else {
				this.battle.rightbarElem.find('.trainer').css('opacity', 0.4);
			}
		} else {
			if (this.initialized) {
				this.battle.leftbarElem.html('<div class="trainer"><strong>' + Tools.escapeHTML(this.name) + '</strong><div class="trainersprite" style="background-image:url(' + Tools.resolveAvatar(this.spriteid) + ')"></div>' + pokemonhtml + '</div>').find('.trainer').css('opacity', 1);
			} else {
				this.battle.leftbarElem.find('.trainer').css('opacity', 0.4);
			}
		}
	};
	Side.prototype.addSideCondition = function (effect) {
		var elem, curelem;
		var condition = effect.id;
		if (this.sideConditions[condition]) {
			if (condition === 'spikes' || condition === 'toxicspikes') {
				this.sideConditions[condition][2]++;
				if (condition === 'spikes' && this.sideConditions[condition][2] == 2) {
					this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
					curelem = this.battle.spriteElemsFront[this.n].children().last();
					curelem.css(this.battle.pos({
						display: 'block',
						x: this.x + 50,
						y: this.y - 40,
						z: this.z,
						scale: .3
					}, BattleEffects.caltrop));
					this.sideConditions['spikes'][1] = this.sideConditions['spikes'][1].add(curelem);
				} else if (condition === 'spikes') {
					this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
					curelem = this.battle.spriteElemsFront[this.n].children().last();
					curelem.css(this.battle.pos({
						display: 'block',
						x: this.x + 30,
						y: this.y - 45,
						z: this.z,
						scale: .3
					}, BattleEffects.caltrop));
					this.sideConditions['spikes'][1] = this.sideConditions['spikes'][1].add(curelem);
				} else if (condition === 'toxicspikes') {
					this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.poisoncaltrop.url + '" style="display:none;position:absolute" />');
					curelem = this.battle.spriteElemsFront[this.n].children().last();
					curelem.css(this.battle.pos({
						display: 'block',
						x: this.x - 15,
						y: this.y - 35,
						z: this.z,
						scale: .3
					}, BattleEffects.poisoncaltrop));
					this.sideConditions['toxicspikes'][1] = this.sideConditions['toxicspikes'][1].add(curelem);
				}
			}
			return;
		}
		// Side conditions work as: [effectName, elem, levels, minDuration, maxDuration]
		switch (condition) {
		case 'auroraveil':
			this.battle.spriteElemsFront[this.n].append('<div class="sidecondition-auroraveil" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-14),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(-14),
				xscale: 1,
				yscale: .5,
				opacity: .7
			}, BattleEffects.none)).animate({
				opacity: .3
			}, 300);
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 5, 8];
			break;
		case 'reflect':
			this.battle.spriteElemsFront[this.n].append('<div class="sidecondition-reflect" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-17),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(-17),
				xscale: 1,
				yscale: .5,
				opacity: .7
			}, BattleEffects.none)).animate({
				opacity: .3
			}, 300);
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 5, this.battle.gen >= 4 ? 8 : 0];
			break;
		case 'safeguard':
			this.battle.spriteElemsFront[this.n].append('<div class="sidecondition-safeguard" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-20),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(-20),
				xscale: 1,
				yscale: .5,
				opacity: .7
			}, BattleEffects.none)).animate({
				opacity: .2
			}, 300);
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 5, 0];
			break;
		case 'lightscreen':
			this.battle.spriteElemsFront[this.n].append('<div class="sidecondition-lightscreen" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-23),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(-23),
				xscale: 1,
				yscale: .5,
				opacity: .7
			}, BattleEffects.none)).animate({
				opacity: .3
			}, 300);
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 5, this.battle.gen >= 4 ? 8 : 0];
			break;
		case 'mist':
			this.battle.spriteElemsFront[this.n].append('<div class="sidecondition-mist" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x,
				y: this.y,
				z: this.behind(-27),
				xscale: 1,
				yscale: 0,
				opacity: .1
			}, BattleEffects.none)).animate(this.battle.pos({
				x: this.x,
				y: this.y,
				z: this.behind(-27),
				xscale: 1,
				yscale: .5,
				opacity: .7
			}, BattleEffects.none)).animate({
				opacity: .2
			}, 300);
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 5, 0];
			break;
		case 'tailwind':
			this.sideConditions[condition] = [effect.name, null, 1, this.battle.gen >= 5 ? 4 : 3, 0];
			break;
		case 'luckychant':
			this.sideConditions[condition] = [effect.name, null, 1, 5, 0];
			break;
		case 'stealthrock':
			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.rock1.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.leftof(-40),
				y: this.y - 10,
				z: this.z,
				opacity: .5,
				scale: .2
			}, BattleEffects.rock1));
			elem = curelem;

			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.rock2.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.leftof(-20),
				y: this.y - 40,
				z: this.z,
				opacity: .5,
				scale: .2
			}, BattleEffects.rock2));
			elem = elem.add(curelem);

			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.rock1.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.leftof(30),
				y: this.y - 20,
				z: this.z,
				opacity: .5,
				scale: .2
			}, BattleEffects.rock1));
			elem = elem.add(curelem);

			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.rock2.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.leftof(10),
				y: this.y - 30,
				z: this.z,
				opacity: .5,
				scale: .2
			}, BattleEffects.rock2));
			elem = elem.add(curelem);
			this.sideConditions[condition] = [effect.name, elem, 1, 0, 0];
			break;
		case 'spikes':
			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.caltrop.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x - 25,
				y: this.y - 40,
				z: this.z,
				scale: .3
			}, BattleEffects.caltrop));
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 0, 0];
			break;
		case 'toxicspikes':
			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.poisoncaltrop.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x + 5,
				y: this.y - 40,
				z: this.z,
				scale: .3
			}, BattleEffects.poisoncaltrop));
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 0, 0];
			break;
		case 'stickyweb':
			this.battle.spriteElemsFront[this.n].append('<img src="' + BattleEffects.web.url + '" style="display:none;position:absolute" />');
			curelem = this.battle.spriteElemsFront[this.n].children().last();
			curelem.css(this.battle.pos({
				display: 'block',
				x: this.x + 15,
				y: this.y - 35,
				z: this.z,
				opacity: 0.4,
				scale: 0.7
			}, BattleEffects.web));
			elem = curelem;
			this.sideConditions[condition] = [effect.name, elem, 1, 0, 0];
			break;
		default:
			this.sideConditions[condition] = [effect.name, null, 1, 0, 0];
		}
	};
	Side.prototype.removeSideCondition = function (condition) {
		condition = toId(condition);
		if (!this.sideConditions[condition]) return;
		if (this.sideConditions[condition][1]) this.sideConditions[condition][1].remove();
		delete this.sideConditions[condition];
	};
	Side.prototype.newPokemon = function (species, replaceSlot) {
		var id;
		var pokeobj;
		if (species.species) {
			pokeobj = species;
			species = pokeobj.species;
			id = pokeobj.id;
		}
		var poke = Tools.getTemplate(species);
		poke = $.extend(new Pokemon(species, this), poke);
		poke.atkStat = 10;
		poke.defStat = 10;
		poke.spaStat = 10;
		poke.spdStat = 10;
		poke.maxhp = 1000;
		if (pokeobj) poke = $.extend(poke, pokeobj);
		if (!poke.ability && poke.baseAbility) poke.ability = poke.baseAbility;
		poke.id = id;
		poke.reset();
		poke.sprite = new Sprite(Tools.getSpriteData(poke, this.n, {
			afd: this.battle.tier === "[Seasonal] Fools Festival",
			gen: this.battle.gen
		}), this.x, this.y, this.z, this.battle, this.n);

		if (typeof replaceSlot !== 'undefined') {
			this.pokemon[replaceSlot] = poke;
		} else {
			this.pokemon.push(poke);
		}
		if (this.pokemon.length == 7 || this.battle.speciesClause) {
			// check for Illusion
			var existingTable = {};
			for (var i = 0; i < this.pokemon.length; i++) {
				var poke1 = this.pokemon[i];
				if (poke1.searchid in existingTable) {
					var j = existingTable[poke1.searchid];
					var poke2 = this.pokemon[j];
					if (this.active.indexOf(poke1) >= 0) {
						this.pokemon.splice(j, 1);
					} else if (this.active.indexOf(poke2) >= 0) {
						this.pokemon.splice(i, 1);
					} else if (poke1.fainted && !poke2.fainted) {
						this.pokemon.splice(j, 1);
					} else {
						this.pokemon.splice(i, 1);
					}
					break;
				}
				existingTable[poke1.searchid] = i;
			}
		}
		this.updateSidebar();

		return poke;
	};

	Side.prototype.getStatbarHTML = function (pokemon, inner) {
		var buf = '';
		if (!inner) buf += '<div class="statbar' + (this.n ? ' lstatbar' : ' rstatbar') + '">';
		buf += '<strong>' + (this.n && (this.battle.ignoreOpponent || this.battle.ignoreNicks) ? pokemon.species : Tools.escapeHTML(pokemon.name));
		var gender = pokemon.gender;
		if (gender) gender = ' <img src="' + Tools.resourcePrefix + 'fx/gender-' + gender.toLowerCase() + '.png" alt="' + gender + '" />';
		buf += gender + (pokemon.level === 100 ? '' : ' <small>L' + pokemon.level + '</small>');

		var symbol = '';
		if (pokemon.species.indexOf('-Mega') >= 0) symbol = 'mega';
		else if (pokemon.species === 'Kyogre-Primal') symbol = 'alpha';
		else if (pokemon.species === 'Groudon-Primal') symbol = 'omega';
		if (symbol) buf += ' <img src="' + Tools.resourcePrefix + 'sprites/misc/' + symbol + '.png" alt="' + symbol + '" style="vertical-align:text-bottom;" />';

		buf += '</strong><div class="hpbar"><div class="hptext"></div><div class="hptextborder"></div><div class="prevhp"><div class="hp"></div></div><div class="status"></div>';
		if (!inner) buf += '</div>';
		return buf;
	};
	Side.prototype.switchIn = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		this.active[slot] = pokemon;
		pokemon.slot = slot;
		pokemon.clearVolatile();
		pokemon.lastmove = '';
		this.battle.lastmove = 'switch-in';
		if (this.lastPokemon && (this.lastPokemon.lastmove === 'batonpass' || this.lastPokemon.lastmove === 'zbatonpass')) {
			pokemon.copyVolatileFrom(this.lastPokemon);
		}

		if (pokemon.side.n === 0) {
			this.battle.message('Go! ' + pokemon.getFullName() + '!');
		} else {
			this.battle.message('' + Tools.escapeHTML(pokemon.side.name) + ' sent out ' + pokemon.getFullName() + '!');
		}

		pokemon.sprite.animSummon(slot);
		if (pokemon.hasVolatile('substitute')) {
			pokemon.sprite.animSub();
		}
		if (pokemon.statbarElem) {
			pokemon.statbarElem.remove();
		}
		this.battle.statElem.append(this.getStatbarHTML(pokemon));
		pokemon.statbarElem = this.battle.statElem.children().last();
		this.updateStatbar(pokemon, true);
		pokemon.side.updateSidebar();
		if (this.battle.fastForward) {
			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			});
			if (this.battle.switchCallback) this.battle.switchCallback(this.battle, this);
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

		this.battle.dogarsCheck(pokemon);

		if (this.battle.switchCallback) this.battle.switchCallback(this.battle, this);
	};
	Side.prototype.dragIn = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		this.battle.message('' + pokemon.getFullName() + ' was dragged out!');
		var oldpokemon = this.active[slot];
		if (oldpokemon === pokemon) return;
		this.lastPokemon = oldpokemon;
		if (oldpokemon) oldpokemon.clearVolatile();
		pokemon.clearVolatile();
		pokemon.lastmove = '';
		this.battle.lastmove = 'switch-in';
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		if (oldpokemon) {
			oldpokemon.sprite.animDragOut();
		}
		pokemon.sprite.animDragIn(slot);
		if (pokemon.statbarElem) {
			pokemon.statbarElem.remove();
		}
		this.battle.statElem.append(this.getStatbarHTML(pokemon));
		pokemon.statbarElem = this.battle.statElem.children().last();
		this.updateStatbar(pokemon, true);
		pokemon.side.updateSidebar();
		if (this.battle.fastForward) {
			if (oldpokemon) {
				oldpokemon.statbarElem.remove();
				oldpokemon.statbarElem = null;
			}
			pokemon.statbarElem.css({
				display: 'block',
				left: pokemon.sprite.left - 80,
				top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
				opacity: 1
			});
			if (this.battle.dragCallback) this.battle.dragCallback(this.battle, this);
			return;
		}
		if (this.n == 0) {
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

		this.battle.dogarsCheck(pokemon);

		if (this.battle.dragCallback) this.battle.dragCallback(this.battle, this);
	};
	Side.prototype.replace = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		var oldpokemon = this.active[slot];
		if (pokemon === oldpokemon) return;
		this.lastPokemon = oldpokemon;
		pokemon.clearVolatile();
		if (oldpokemon) {
			pokemon.lastmove = oldpokemon.lastmove;
			pokemon.hp = oldpokemon.hp;
			pokemon.maxhp = oldpokemon.maxhp;
			pokemon.status = oldpokemon.status;
			pokemon.copyVolatileFrom(oldpokemon, true);
		}
		this.active[slot] = pokemon;
		pokemon.slot = slot;

		if (oldpokemon) {
			oldpokemon.sprite.animUnsummon(true);
		}
		pokemon.sprite.animSummon(slot, true);
		if (pokemon.hasVolatile('substitute')) {
			pokemon.sprite.animSub(true);
		}
		if (oldpokemon) {
			oldpokemon.statbarElem.remove();
			oldpokemon.statbarElem = null;
		}
		if (pokemon.statbarElem) {
			pokemon.statbarElem.remove();
		}
		this.battle.statElem.append(this.getStatbarHTML(pokemon));
		pokemon.statbarElem = this.battle.statElem.children().last();
		this.updateStatbar(pokemon, true);
		pokemon.statbarElem.css({
			display: 'block',
			left: pokemon.sprite.left - 80,
			top: pokemon.sprite.top - 73 - pokemon.sprite.statbarOffset,
			opacity: 1
		});
		// not sure if we want a different callback
		if (this.battle.dragCallback) this.battle.dragCallback(this.battle, this);
	};
	Side.prototype.switchOut = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		if (pokemon.lastmove !== 'batonpass' && pokemon.lastmove !== 'zbatonpass') {
			pokemon.clearVolatile();
		} else {
			pokemon.removeVolatile('transform');
			pokemon.removeVolatile('formechange');
		}
		if (pokemon.lastmove === 'uturn' || pokemon.lastmove === 'voltswitch') {
			this.battle.message('' + pokemon.getName() + ' went back to ' + Tools.escapeHTML(pokemon.side.name) + '!');
		} else if (pokemon.lastmove !== 'batonpass' && pokemon.lastmove !== 'zbatonpass') {
			if (pokemon.side.n === 0) {
				this.battle.message('' + pokemon.getName() + ', come back!');
			} else {
				this.battle.message('' + Tools.escapeHTML(pokemon.side.name) + ' withdrew ' + pokemon.getFullName() + '!');
			}
		}
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		this.updateStatbar(pokemon, true);
		pokemon.sprite.animUnsummon();
		if (this.battle.fastForward) {
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
	Side.prototype.swapTo = function (pokemon, slot, kwargs) {
		slot = Number(slot);
		if (pokemon.slot === slot) return;
		var target = this.active[slot];

		if (!kwargs.silent) {
			var fromeffect = Tools.getEffect(kwargs.from);
			switch (fromeffect.id) {
			case 'allyswitch':
				this.battle.message('<small>' + pokemon.getName() + ' and ' + target.getLowerName() + ' switched places.</small>');
				break;
			default:
				this.battle.message('<small>' + pokemon.getName() + ' moved to the center!</small>');
				break;
			}
		}

		var oslot = pokemon.slot;

		pokemon.slot = slot;
		if (target) target.slot = oslot;

		this.active[slot] = pokemon;
		this.active[oslot] = target;

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

		this.battle.statElem.append(this.getStatbarHTML(pokemon));
		pokemon.statbarElem = this.battle.statElem.children().last();
		if (target) {
			this.battle.statElem.append(this.getStatbarHTML(target));
			target.statbarElem = this.battle.statElem.children().last();
		}

		this.updateStatbar(pokemon, true);
		if (target) this.updateStatbar(target, true);

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
	Side.prototype.swapWith = function (pokemon, target, kwargs) {
		// method provided for backwards compatibility only
		if (pokemon === target) return;

		if (!kwargs.silent) {
			var fromeffect = Tools.getEffect(kwargs.from);
			switch (fromeffect.id) {
			case 'allyswitch':
				this.battle.message('<small>' + pokemon.getName() + ' and ' + target.getLowerName() + ' switched places.</small>');
				break;
			}
		}

		var oslot = pokemon.slot;
		var nslot = target.slot;

		pokemon.slot = nslot;
		target.slot = oslot;
		this.active[nslot] = pokemon;
		this.active[oslot] = target;

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

		this.battle.statElem.append(this.getStatbarHTML(pokemon));
		pokemon.statbarElem = this.battle.statElem.children().last();
		this.battle.statElem.append(this.getStatbarHTML(target));
		target.statbarElem = this.battle.statElem.children().last();

		this.updateStatbar(pokemon, true);
		this.updateStatbar(target, true);

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
	Side.prototype.faint = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		pokemon.clearVolatile();
		this.lastPokemon = pokemon;
		this.active[slot] = null;

		this.battle.message('' + pokemon.getName() + ' fainted!');

		pokemon.fainted = true;
		pokemon.zerohp = true;
		pokemon.hp = 0;
		pokemon.side.updateStatbar(pokemon, false, true);
		pokemon.side.updateSidebar();

		pokemon.sprite.animFaint();
		if (this.battle.fastForward) {
			pokemon.statbarElem.remove();
			pokemon.statbarElem = null;
		} else {
			pokemon.statbarElem.animate({
				opacity: 0
			}, 300, function () {
				pokemon.statbarElem.remove();
				pokemon.statbarElem = null;
			});
		}
		if (this.battle.faintCallback) this.battle.faintCallback(this.battle, this);
	};
	Side.prototype.updateHPText = function (pokemon) {
		var $hptext = pokemon.statbarElem.find('.hptext');
		var $hptextborder = pokemon.statbarElem.find('.hptextborder');
		if (pokemon.maxhp === 48 || this.battle.hardcoreMode && pokemon.maxhp === 100) {
			$hptext.hide();
			$hptextborder.hide();
		} else if (this.battle.hardcoreMode) {
			$hptext.html(pokemon.hp + '/');
			$hptext.show();
			$hptextborder.show();
		} else {
			$hptext.html(pokemon.hpWidth(100) + '%');
			$hptext.show();
			$hptextborder.show();
		}
	};
	Side.prototype.updateStatbar = function (pokemon, updatePrevhp, updateHp) {
		if (this.battle.fastForward) return;
		if (!pokemon) {
			if (this.active[0]) this.updateStatbar(this.active[0], updatePrevhp, updateHp);
			if (this.active[1]) this.updateStatbar(this.active[1], updatePrevhp, updateHp);
			if (this.active[2]) this.updateStatbar(this.active[2], updatePrevhp, updateHp);
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
			else $hp.addClass('hp-yellow hp-red');
			this.updateHPText(pokemon);
		}
		if (updatePrevhp) {
			var $prevhp = pokemon.statbarElem.find('.prevhp');
			$prevhp.css('width', pokemon.hpWidth(150) + 1);
			if (hpcolor === 'g') $prevhp.removeClass('prevhp-yellow prevhp-red');
			else if (hpcolor === 'y') $prevhp.removeClass('prevhp-red').addClass('prevhp-yellow');
			else $prevhp.addClass('prevhp-yellow prevhp-red');
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
		if (pokemon.volatiles.typechange && pokemon.volatiles.typechange[2]) {
			var types = pokemon.volatiles.typechange[2].split('/');
			status += '<img src="' + Tools.resourcePrefix + 'sprites/types/' + encodeURIComponent(types[0]) + '.png" alt="' + types[0] + '" /> ';
			if (types[1]) {
				status += '<img src="' + Tools.resourcePrefix + 'sprites/types/' + encodeURIComponent(types[1]) + '.png" alt="' + types[1] + '" /> ';
			}
		}
		if (pokemon.volatiles.typeadd) {
			var type = pokemon.volatiles.typeadd[2];
			status += '+<img src="' + Tools.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" /> ';
		}
		for (var x in pokemon.boosts) {
			if (pokemon.boosts[x]) {
				status += '<span class="' + pokemon.getBoostType(x) + '">' + pokemon.getBoost(x) + '</span> ';
			}
		}
		var statusTable = {
			throatchop: '<span class="bad">Throat&nbsp;Chop</span> ',
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
			perish0: '<span class="bad">Perish&nbsp;now</span>',
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
			rage: '<span class="neutral">Rage</span>',
			roost: '<span class="neutral">Landed</span>',
			protect: '<span class="good">Protect</span>',
			quickguard: '<span class="good">Quick&nbsp;Guard</span>',
			wideguard: '<span class="good">Wide&nbsp;Guard</span>',
			craftyshield: '<span class="good">Crafty&nbsp;Shield</span>',
			matblock: '<span class="good">Mat&nbsp;Block</span>',
			helpinghand: '<span class="good">Helping&nbsp;Hand</span>',
			magiccoat: '<span class="good">Magic&nbsp;Coat</span>',
			destinybond: '<span class="good">Destiny&nbsp;Bond</span>',
			snatch: '<span class="good">Snatch</span>',
			grudge: '<span class="good">Grudge</span>',
			endure: '<span class="good">Endure</span>',
			focuspunch: '<span class="neutral">Focusing</span>',
			shelltrap: '<span class="neutral">Trap&nbsp;set</span>',
			powder: '<span class="bad">Powder</span>',
			electrify: '<span class="bad">Electrify</span>',
			ragepowder: '<span class="good">Rage&nbsp;Powder</span>',
			followme: '<span class="good">Follow&nbsp;Me</span>',
			instruct: '<span class="neutral">Instruct</span>',
			beakblast: '<span class="neutral">Beak&nbsp;Blast</span>',
			laserfocus: '<span class="good">Laser&nbsp;Focus</span>',
			spotlight: '<span class="neutral">Spotlight</span>',
			itemremoved: '',
			// Gen 1
			lightscreen: '<span class="good">Light&nbsp;Screen</span>',
			reflect: '<span class="good">Reflect</span>'
		};
		for (var i in pokemon.volatiles) {
			if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[[' + i + ']]</span>';
			else status += statusTable[i];
		}
		for (var i in pokemon.turnstatuses) {
			if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[[' + i + ']]</span>';
			else status += statusTable[i];
		}
		for (var i in pokemon.movestatuses) {
			if (typeof statusTable[i] === 'undefined') status += '<span class="neutral">[[' + i + ']]</span>';
			else status += statusTable[i];
		}
		var statusbar = pokemon.statbarElem.find('.status');
		statusbar.html(status);
	};
	Side.prototype.destroy = function () {
		for (var i = 0; i < this.pokemon.length; i++) {
			if (this.pokemon[i]) this.pokemon[i].destroy();
			this.pokemon[i] = null;
		}
		for (var i = 0; i < this.active.length; i++) {
			if (this.active[i]) this.active[i].destroy();
			this.active[i] = null;
		}
		delete this.battle;
		delete this.foe;
	};

	return Side;
})();

var Battle = (function () {
	function Battle(frame, logFrame) {
		frame.addClass('battle');

		// turn number
		this.turn = 0;
		// has playback gotten to the point where a player has won or tied?
		// affects whether BGM is playing
		this.ended = false;
		this.usesUpkeep = false;
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
		this.speciesClause = false;

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
		this.ignoreNicks = Tools.prefs('ignorenicks');

		this.paused = true;
		// 0 = uninitialized
		// 1 = ready
		// 2 = playing
		// 3 = paused
		// 4 = finished
		// 5 = seeking
		this.playbackState = 0;

		this.backdropImage = 'sprites/gen6bgs/' + BattleBackdrops[Math.floor(Math.random() * BattleBackdrops.length)];

		this.bgm = null;
		this.activeQueue = this.queue1;

		this.activityQueue = [];
		this.preemptActivityQueue = [];
		this.activityAnimations = $();
		this.minorQueue = [];

		// external
		this.resumeButton = null;

		this.preloadCache = {};

		this.preloadEffects();
		this.init();
	}

	Battle.prototype.sidesSwitched = false;
	Battle.prototype.messageActive = false;

	// activity queue
	Battle.prototype.animationDelay = 0;
	Battle.prototype.activityStep = 0;
	Battle.prototype.activityDelay = 0;
	Battle.prototype.activityAfter = null;
	Battle.prototype.activityQueueActive = false;
	Battle.prototype.fastForward = false;

	Battle.prototype.resultWaiting = false;
	Battle.prototype.multiHitMove = null;
	Battle.prototype.activeMoveIsSpread = null;

	// callback
	Battle.prototype.faintCallback = null;
	Battle.prototype.switchCallback = null;
	Battle.prototype.dragCallback = null;
	Battle.prototype.turnCallback = null;
	Battle.prototype.startCallback = null;
	Battle.prototype.stagnateCallback = null;
	Battle.prototype.endCallback = null;
	Battle.prototype.customCallback = null;
	Battle.prototype.errorCallback = null;

	Battle.prototype.preloadDone = 0;
	Battle.prototype.preloadNeeded = 0;
	Battle.prototype.bgm = null;

	Battle.prototype.mute = false;
	Battle.prototype.messageDelay = 8;


	Battle.prototype.removePseudoWeather = function (weather) {
		for (var i = 0; i < this.pseudoWeather.length; i++) {
			if (this.pseudoWeather[i][0] === weather) {
				this.pseudoWeather.splice(i, 1);
				this.updateWeather();
				return;
			}
		}
	};
	Battle.prototype.addPseudoWeather = function (weather, minTimeLeft, timeLeft) {
		this.pseudoWeather.push([weather, minTimeLeft, timeLeft]);
		this.updateWeather();
	};
	Battle.prototype.hasPseudoWeather = function (weather) {
		for (var i = 0; i < this.pseudoWeather.length; i++) {
			if (this.pseudoWeather[i][0] === weather) {
				return true;
			}
		}
		return false;
	};
	Battle.prototype.init = function () {
		this.reset();
		this.mySide = new Side(this, 0);
		this.yourSide = new Side(this, 1);
		this.mySide.foe = this.yourSide;
		this.yourSide.foe = this.mySide;
		this.sides = [this.mySide, this.yourSide];
		this.p1 = this.mySide;
		this.p2 = this.yourSide;
		this.gen = 6;
	};
	Battle.prototype.updateGen = function () {
		var gen = this.gen;
		if (Tools.prefs('nopastgens')) gen = 6;
		if (Tools.prefs('bwgfx') && gen > 5) gen = 5;
		if (gen <= 5) {
			if (gen <= 1) this.backdropImage = 'fx/bg-gen1.png';
			else if (gen <= 2) this.backdropImage = 'fx/bg-gen2.png';
			else if (gen <= 3) this.backdropImage = 'fx/' + BattleBackdropsThree[Math.floor(Math.random() * BattleBackdropsThree.length)];
			else if (gen <= 4) this.backdropImage = 'fx/' + BattleBackdropsFour[Math.floor(Math.random() * BattleBackdropsFour.length)];
			else this.backdropImage = 'fx/' + BattleBackdropsFive[Math.floor(Math.random() * BattleBackdropsFive.length)];
		}
		if (this.bgElem) this.bgElem.css('background-image', 'url(' + Tools.resourcePrefix + '' + this.backdropImage + ')');
	};
	Battle.prototype.reset = function (dontResetSound) {
		// battle state
		this.turn = 0;
		this.ended = false;
		this.weather = '';
		this.weatherTimeLeft = 0;
		this.weatherMinTimeLeft = 0;
		this.pseudoWeather = [];
		this.lastMove = '';

		// DOM state
		this.frameElem.empty();
		this.frameElem.html('<div class="innerbattle"></div>');
		this.elem = this.frameElem.children();
		if (this.optionsElem) {
			this.logElem.empty();
			this.logPreemptElem.empty();
		} else {
			this.logFrameElem.html('<div class="battle-options"></div>');
			this.optionsElem = this.logFrameElem.children().last();
			this.logFrameElem.append('<div class="inner" role="log"></div>');
			this.logElem = this.logFrameElem.children().last();
			this.logFrameElem.append('<div class="inner-preempt"></div>');
			this.logPreemptElem = this.logFrameElem.children().last();
			this.logFrameElem.append('<div class="inner-after"></div>');
		}

		this.updateGen();
		this.elem.append('<div class="backdrop" style="background-image:url(' + Tools.resourcePrefix + '' + this.backdropImage + ');display:block;opacity:0"></div>');
		this.bgElem = this.elem.children().last();
		this.bgElem.animate({
			opacity: 0.8
		});

		this.elem.append('<div class="weather"></div>');
		this.weatherElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.bgEffectElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.spriteElem = this.elem.children().last();

		this.spriteElem.append('<div></div>');
		this.spriteElems[1] = this.spriteElem.children().last();
		this.spriteElem.append('<div></div>');
		this.spriteElemsFront[1] = this.spriteElem.children().last();
		this.spriteElem.append('<div></div>');
		this.spriteElemsFront[0] = this.spriteElem.children().last();
		this.spriteElem.append('<div></div>');
		this.spriteElems[0] = this.spriteElem.children().last();

		this.elem.append('<div role="complementary" aria-label="Active Pokemon"></div>');
		this.statElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.fxElem = this.elem.children().last();

		this.elem.append('<div class="leftbar" role="complementary" aria-label="Your Team"></div>');
		this.leftbarElem = this.elem.children().last();

		this.elem.append('<div class="rightbar" role="complementary" aria-label="Opponent\'s Team"></div>');
		this.rightbarElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.turnElem = this.elem.children().last();

		this.elem.append('<div class="messagebar message"></div>');
		this.messagebarElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.delayElem = this.elem.children().last();

		this.elem.append('<div class="message" style="position:absolute;display:block;visibility:hidden"></div>');
		this.hiddenMessageElem = this.elem.children().last();

		if (this.mySide) this.mySide.reset();
		if (this.yourSide) this.yourSide.reset();

		if (this.ignoreNicks) {
			var $log = $('.battle-log .inner');
			if ($log.length) $log.addClass('hidenicks');
		}

		// activity queue state
		this.animationDelay = 0;
		this.multiHitMove = null;
		this.activeMoveIsSpread = null;
		this.activityStep = 0;
		this.activityDelay = 0;
		this.activityAfter = null;
		this.activityAnimations = $();
		this.activityQueueActive = false;
		this.fastForwardOff();
		$.fx.off = false;
		this.minorQueue = [];
		this.resultWaiting = false;
		this.paused = true;
		if (this.playbackState !== 5) {
			this.playbackState = (this.activityQueue.length ? 1 : 0);
			if (!dontResetSound) this.soundStop();
		}
	};
	Battle.prototype.destroy = function () {
		if (this.logFrameElem) this.logFrameElem.remove();

		this.soundStop();
		for (var i = 0; i < this.sides.length; i++) {
			if (this.sides[i]) this.sides[i].destroy();
			this.sides[i] = null;
		}
		delete this.mySide;
		delete this.yourSide;
		delete this.p1;
		delete this.p2;
	};

	Battle.prototype.logConsole = function (text) {
		if (window.console && console.log) console.log(text);
	};
	Battle.prototype.log = function (html, preempt) {
		var willScroll = false;
		if (!this.fastForward) willScroll = (this.logFrameElem.scrollTop() + 60 >= this.logElem.height() + this.logPreemptElem.height() - this.optionsElem.height() - this.logFrameElem.height());
		if (preempt) {
			this.logPreemptElem.append(html);
		} else {
			this.logElem.append(html);
		}
		if (willScroll) {
			this.logFrameElem.scrollTop(this.logElem.height() + this.logPreemptElem.height());
		}
	};
	Battle.prototype.preemptCatchup = function () {
		this.logElem.append(this.logPreemptElem.children().first());
	};

	Battle.prototype.pos = function (loc, obj) {
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
		top -= Math.floor(loc.y * scale /* - loc.x * scale / 4 */);
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
	Battle.prototype.posT = function (loc, obj, transition, oldloc) {
		var pos = this.pos(loc, obj);
		var oldpos = null;
		if (oldloc) oldpos = this.pos(oldloc, obj);
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
	Battle.prototype.backgroundEffect = function (bg, duration, opacity, delay) {
		if (!opacity) {
			opacity = 1;
		}
		if (!delay) delay = 0;
		this.bgEffectElem.append('<div class="background"></div>');
		var elem = this.bgEffectElem.children().last();
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
	};
	Battle.prototype.showEffect = function (img, start, end, transition, after) {
		var effect = img;
		if (img && img.length) effect = BattleEffects[img];
		if (!start.time) start.time = 0;
		if (!end.time) end.time = start.time + 500;
		start.time += this.animationDelay;
		end.time += this.animationDelay;
		if (!end.scale && end.scale !== 0) end.scale = start.scale;
		if (!end.xscale && end.xscale !== 0) end.xscale = start.xscale;
		if (!end.yscale && end.yscale !== 0) end.yscale = start.yscale;
		end = $.extend({}, start, end);

		var startpos = this.pos(start, effect);
		var endpos = this.posT(end, effect, transition, start);

		this.fxElem.append('<img src="' + effect.url + '" style="display:none;position:absolute" />');
		var effectElem = this.fxElem.children().last();
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
			var endendpos = this.pos(end, effect);
			effectElem.animate(endendpos, 200);
		}
		this.activityWait(effectElem);
	};
	Battle.prototype.switchSides = function (replay) {
		if (replay) {
			this.reset(true);
			this.setSidesSwitched(!this.sidesSwitched);
			this.play();
		} else if (this.ended) {
			this.reset(true);
			this.setSidesSwitched(!this.sidesSwitched);
			this.fastForwardTo(-1);
		} else {
			var turn = this.turn;
			var playbackState = this.playbackState;
			this.reset(true);
			this.setSidesSwitched(!this.sidesSwitched);
			if (turn) this.fastForwardTo(turn);
			if (this.playbackState !== 3) {
				this.play();
			} else {
				this.pause();
			}
		}
	};
	Battle.prototype.setSidesSwitched = function (sidesSwitched) {
		this.sidesSwitched = sidesSwitched;
		if (this.sidesSwitched) {
			this.mySide = this.p2;
			this.yourSide = this.p1;
		} else {
			this.mySide = this.p1;
			this.yourSide = this.p2;
		}
		this.mySide.n = 0;
		this.yourSide.n = 1;
		this.sides[0] = this.mySide;
		this.sides[1] = this.yourSide;

		this.mySide.updateSidebar();
		this.mySide.updateSprites();
		this.yourSide.updateSidebar();
		this.yourSide.updateSprites();
		// nothing else should need updating - don't call this function after sending out pokemon
	};
	Battle.prototype.message = function (message, hiddenmessage) {
		if (message && !this.messageActive) {
			this.log('<div class="spacer battle-history"></div>');
		}
		if (message && !this.fastForward) {
			if (!this.messageActive) {
				this.messagebarElem.empty();
				this.messagebarElem.css({
					display: 'block',
					opacity: 0,
					height: 'auto'
				});
				this.messagebarElem.animate({
					opacity: 1
				}, 300);
			}
			this.hiddenMessageElem.append('<p></p>');
			var messageElem = this.hiddenMessageElem.children().last();
			messageElem.html(message);
			messageElem.css({
				display: 'block',
				opacity: 0
			});
			var self = this;
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
			this.activityWait(messageElem);
		}
		this.messageActive = true;
		this.log('<div class="battle-history">' + message + (hiddenmessage ? hiddenmessage : '') + '</div>');
	};
	Battle.prototype.endAction = function () {
		if (this.messageActive) {
			this.messageActive = false;
			if (!this.fastForward) {
				this.messagebarElem.delay(this.messageDelay).animate({
					height: 'toggle',
					opacity: 0
				}, 300);
				this.activityWait(this.messagebarElem);
			}
		}
	};

	//
	// activities
	//
	Battle.prototype.start = function () {
		this.log('<div>Battle between ' + Tools.escapeHTML(this.p1.name) + ' and ' + Tools.escapeHTML(this.p2.name) + ' started!</div>');
		if (this.startCallback) this.startCallback(this);
	};
	Battle.prototype.winner = function (winner) {
		if (winner) this.message('' + Tools.escapeHTML(winner) + ' won the battle!');
		else this.message('Tie between ' + Tools.escapeHTML(this.p1.name) + ' and ' + Tools.escapeHTML(this.p2.name) + '!');
		this.ended = true;
	};
	Battle.prototype.prematureEnd = function () {
		this.message('This replay ends here.');
		this.ended = true;
	};
	Battle.prototype.endLastTurn = function () {
		if (this.endLastTurnPending) {
			this.endLastTurnPending = false;
			this.mySide.updateStatbar(null, true);
			this.yourSide.updateStatbar(null, true);
		}
	};
	Battle.prototype.setHardcoreMode = function (mode) {
		this.hardcoreMode = mode;
		this.mySide.updateSidebar();
		this.yourSide.updateSidebar();
		this.updateWeather(undefined, true);
	};
	Battle.prototype.setTurn = function (turnnum) {
		turnnum = parseInt(turnnum, 10);
		if (turnnum == this.turn + 1) {
			this.endLastTurnPending = true;
		}
		if (this.turn && !this.usesUpkeep) this.updatePseudoWeatherLeft(); // for compatibility with old replays
		this.turn = turnnum;

		if (this.mySide.active[0]) this.mySide.active[0].clearTurnstatuses();
		if (this.mySide.active[1]) this.mySide.active[1].clearTurnstatuses();
		if (this.mySide.active[2]) this.mySide.active[2].clearTurnstatuses();
		if (this.yourSide.active[0]) this.yourSide.active[0].clearTurnstatuses();
		if (this.yourSide.active[1]) this.yourSide.active[1].clearTurnstatuses();
		if (this.yourSide.active[2]) this.yourSide.active[2].clearTurnstatuses();

		this.log('<h2 class="battle-history">Turn ' + turnnum + '</h2>');

		var prevTurnElem = this.turnElem.children();
		if (this.fastForward) {
			if (prevTurnElem.length) prevTurnElem.html('Turn ' + turnnum);
			else this.turnElem.append('<div class="turn" style="display:block;opacity:1;left:110px;">Turn ' + turnnum + '</div>');
			if (this.turnCallback) this.turnCallback(this);
			if (this.fastForward > -1 && turnnum >= this.fastForward) {
				this.fastForwardOff();
				if (this.endCallback) this.endCallback(this);
			}
			return;
		}
		this.turnElem.append('<div class="turn">Turn ' + turnnum + '</div>');
		var newTurnElem = this.turnElem.children().last();
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
		this.activityWait(500);
		if (this.turnCallback) this.turnCallback(this);
	};
	Battle.prototype.changeWeather = function (weather, poke, isUpkeep, ability) {
		weather = toId(weather);
		var weatherTable = {
			sunnyday: {
				name: 'Sun',
				startMessage: 'The sunlight turned harsh!',
				abilityMessage: "'s Drought intensified the sun's rays!",
				//upkeepMessage: 'The sunlight is strong!',
				endMessage: "The sunlight faded."
			},
			desolateland: {
				name: "Intense Sun",
				startMessage: "The sunlight turned extremely harsh!",
				endMessage: "The harsh sunlight faded."
			},
			raindance: {
				name: 'Rain',
				startMessage: 'It started to rain!',
				abilityMessage: "'s Drizzle made it rain!",
				//upkeepMessage: 'Rain continues to fall!',
				endMessage: 'The rain stopped.'
			},
			primordialsea: {
				name: "Heavy Rain",
				startMessage: "A heavy rain began to fall!",
				endMessage: "The heavy rain has lifted!"
			},
			sandstorm: {
				name: 'Sandstorm',
				startMessage: 'A sandstorm kicked up!',
				abilityMessage: "'s Sand Stream whipped up a sandstorm!",
				upkeepMessage: 'The sandstorm is raging.',
				endMessage: 'The sandstorm subsided.'
			},
			hail: {
				name: 'Hail',
				startMessage: 'It started to hail!',
				abilityMessage: "'s Snow Warning whipped up a hailstorm!",
				upkeepMessage: 'The hail is crashing down.',
				endMessage: 'The hail stopped.'
			},
			deltastream: {
				name: 'Strong Winds',
				startMessage: 'Mysterious strong winds are protecting Flying-type Pok&eacute;mon!',
				endMessage: 'The mysterious strong winds have dissipated!'
			}
		};
		if (!weather || weather === 'none') {
			weather = '';
		}
		var newWeather = weatherTable[weather];
		if (isUpkeep) {
			if (this.weather && this.weatherTimeLeft) {
				this.weatherTimeLeft--;
				if (this.weatherMinTimeLeft != 0) this.weatherMinTimeLeft--;
			}
			if (!this.fastForward) {
				this.weatherElem.animate({
					opacity: 1.0
				}, 400).animate({
					opacity: .4
				}, 400);
			}
			if (newWeather && newWeather.upkeepMessage) this.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
			return;
		}
		if (newWeather) {
			var isExtremeWeather = (weather === 'deltastream' || weather === 'desolateland' || weather === 'primordialsea');
			if (poke) {
				if (ability) {
					this.resultAnim(poke, ability.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
					poke.markAbility(ability.name);
					this.message('<small>' + newWeather.startMessage + '</small>');
				} else {
					this.message('<small>' + poke.getName() + newWeather.abilityMessage + '</small>'); // for backwards compatibility
				}
				this.weatherTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 8;
				this.weatherMinTimeLeft = (this.gen <= 5 || isExtremeWeather) ? 0 : 5;
			} else if (isUpkeep) {
				this.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else if (isExtremeWeather) {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = (this.gen <= 3 ? 5 : 8);
				this.weatherMinTimeLeft = (this.gen <= 3 ? 0 : 5);
			}
		}
		if (this.weather && !newWeather) {
			this.message('<small>' + weatherTable[this.weather].endMessage + '</small>');
		}
		this.updateWeather(weather);
	};
	Battle.prototype.updatePseudoWeatherLeft = function () {
		for (var i = 0; i < this.pseudoWeather.length; i++) {
			var pWeather = this.pseudoWeather[i];
			if (pWeather[1]) pWeather[1]--;
			if (pWeather[2]) pWeather[2]--;
		}
		for (var i = 0; i < this.sides.length; i++) {
			for (var id in this.sides[i].sideConditions) {
				var cond = this.sides[i].sideConditions[id];
				if (cond[3]) cond[3]--;
				if (cond[4]) cond[4]--;
			}
		}
		this.updateWeather();
	};
	Battle.prototype.pseudoWeatherLeft = function (pWeather) {
		var buf = '<br />' + Tools.getMove(pWeather[0]).name;
		if (!pWeather[1] && pWeather[2]) {
			pWeather[1] = pWeather[2];
			pWeather[2] = 0;
		}
		if (this.gen < 7 && this.hardcoreMode) return buf;
		if (pWeather[2]) {
			return buf + ' <small>(' + pWeather[1] + ' or ' + pWeather[2] + ' turns)</small>';
		}
		if (pWeather[1]) {
			return buf + ' <small>(' + pWeather[1] + ' turn' + (pWeather[1] == 1 ? '' : 's') + ')</small>';
		}
		return buf; // weather not found
	};
	Battle.prototype.sideConditionLeft = function (cond, siden) {
		if (!cond[3] && !cond[4]) return '';
		var buf = '<br />' + (siden ? "Foe's " : "") + Tools.getMove(cond[0]).name;
		if (!cond[3] && cond[4]) {
			cond[3] = cond[4];
			cond[4] = 0;
		}
		if (this.gen < 7 && this.hardcoreMode) return buf;
		if (!cond[4]) {
			return buf + ' <small>(' + cond[3] + ' turn' + (cond[3] == 1 ? '' : 's') + ')</small>';
		}
		return buf + ' <small>(' + cond[3] + ' or ' + cond[4] + ' turns)</small>';
	};
	Battle.prototype.weatherLeft = function () {
		if (this.gen < 7 && this.hardcoreMode) return '';
		if (this.weatherMinTimeLeft != 0) {
			return ' <small>(' + this.weatherMinTimeLeft + ' or ' + this.weatherTimeLeft + ' turns)</small>';
		}
		if (this.weatherTimeLeft != 0) {
			return ' <small>(' + this.weatherTimeLeft + ' turn' + (this.weatherTimeLeft == 1 ? '' : 's') + ')</small>';
		}
		return '';
	};
	Battle.prototype.updateWeather = function (weather, instant) {
		if (typeof weather === 'undefined') {
			weather = this.weather;
		}
		var isIntense = false;
		var weatherNameTable = {
			sunnyday: 'Sun',
			desolateland: 'Intense Sun',
			raindance: 'Rain',
			primordialsea: 'Heavy Rain',
			sandstorm: 'Sandstorm',
			hail: 'Hail',
			deltastream: 'Strong Winds'
		};
		if (!(weather in weatherNameTable)) {
			weather = (this.pseudoWeather.length ? 'pseudo' : '');
			for (var i = 0; i < this.pseudoWeather.length; i++) {
				var pwid = toId(this.pseudoWeather[i][0]);
				switch (pwid) {
				case 'electricterrain':
				case 'grassyterrain':
				case 'mistyterrain':
				case 'psychicterrain':
					weather = pwid;
					isIntense = true;
					break;
				}
			}
		}
		if (weather === 'desolateland' || weather === 'primordialsea' || weather === 'deltastream') {
			isIntense = true;
		}

		var oldweather = this.weather;
		this.weather = weather;

		if (this.fastForward) return;

		if (instant) oldweather = true;

		var weatherhtml = '';
		if (weather) {
			if (weather in weatherNameTable) {
				weatherhtml += '<br />' + weatherNameTable[weather] + this.weatherLeft();
			}
			for (var i = 0; i < this.pseudoWeather.length; i++) {
				weatherhtml += this.pseudoWeatherLeft(this.pseudoWeather[i]);
			}
		}
		for (var i = 0; i < this.sides.length; i++) {
			for (var id in this.sides[i].sideConditions) {
				weatherhtml += this.sideConditionLeft(this.sides[i].sideConditions[id], i);
			}
		}
		if (instant || weather === oldweather) {
			if (weather) {
				this.weatherElem.attr('class', 'weather ' + weather + 'weather');
			} else {
				this.weatherElem.attr('class', 'weather');
			}
			this.weatherElem.html('<em>' + weatherhtml + '</em>');
			this.weatherElem.css({opacity: isIntense ? 0.9 : .5});
			if (weather && !instant) this.weatherElem.animate({
				opacity: 1.0
			}, 400).animate({
				opacity: isIntense ? 0.9 : .5
			}, 400);
			return;
		}
		if (oldweather) {
			var self = this;
			if (weather) {
				this.weatherElem.animate({
					opacity: 0
				}, 300, function () {
					self.weatherElem.attr('class', 'weather ' + weather + 'weather');
					self.weatherElem.html('<em>' + weatherhtml + '</em>');
					self.weatherElem.css({opacity: isIntense ? 0.9 : 0.5});
				});
			} else {
				this.weatherElem.animate({
					opacity: 0
				}, 500, function () {
					self.weatherElem.attr('class', 'weather');
					self.weatherElem.html('<em>' + weatherhtml + '</em>');
					self.weatherElem.css({opacity: 0.5});
				});
			}
		} else if (weather) {
			this.weatherElem.css({opacity: 0});
			this.weatherElem.attr('class', 'weather ' + weather + 'weather');
			this.weatherElem.html('<em>' + weatherhtml + '</em>');
			this.weatherElem.animate({
				opacity: 1.0
			}, 400).animate({
				opacity: isIntense ? 0.9 : .5
			}, 400);
		}
	};
	Battle.prototype.resultAnim = function (pokemon, result, type) {
		if (this.fastForward) return;
		if (type === 'ability') return this.abilityActivateAnim(pokemon, result);
		this.fxElem.append('<div class="result ' + type + 'result"><strong>' + result + '</strong></div>');
		var effectElem = this.fxElem.children().last();
		effectElem.delay(this.animationDelay).css({
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
		this.animationDelay += 350;
		pokemon.side.updateStatbar(pokemon);
		this.activityWait(effectElem);
	};
	Battle.prototype.abilityActivateAnim = function (pokemon, result) {
		if (this.fastForward) return;
		this.fxElem.append('<div class="result abilityresult"><strong>' + result + '</strong></div>');
		var effectElem = this.fxElem.children().last();
		effectElem.delay(this.animationDelay).css({
			display: 'block',
			opacity: 0,
			top: pokemon.sprite.top + 15,
			left: pokemon.sprite.left - 75
		}).animate({
			opacity: 1
		}, 1);
		effectElem.delay(800).animate({
			opacity: 0
		}, 400, 'swing');
		this.animationDelay += 100;
		pokemon.side.updateStatbar(pokemon);
		this.activityWait(effectElem);
	};
	Battle.prototype.damageAnim = function (pokemon, damage) {
		if (this.fastForward) return;
		if (!pokemon.statbarElem) return;
		pokemon.side.updateHPText(pokemon);

		var $hp = pokemon.statbarElem.find('div.hp');
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'y') callback = function () {
			$hp.addClass('hp-yellow');
		};
		if (hpcolor === 'r') callback = function () {
			$hp.addClass('hp-yellow hp-red');
		};

		this.resultAnim(pokemon, this.hardcoreMode ? 'Damage' : '&minus;' + damage, 'bad');

		$hp.animate({
			width: w,
			'border-right-width': w ? 1 : 0
		}, 350, callback);
	};
	Battle.prototype.healAnim = function (pokemon, damage) {
		if (this.fastForward) return;
		if (!pokemon.statbarElem) return;
		pokemon.side.updateHPText(pokemon);

		var $hp = pokemon.statbarElem.find('div.hp');
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'g') callback = function () {
			$hp.removeClass('hp-yellow hp-red');
		};
		if (hpcolor === 'y') callback = function () {
			$hp.removeClass('hp-red');
		};

		this.resultAnim(pokemon, this.hardcoreMode ? 'Heal' : '+' + damage, 'good');

		$hp.animate({
			width: w,
			'border-right-width': w ? 1 : 0
		}, 350, callback);
	};
	Battle.prototype.useMove = function (pokemon, move, target, kwargs) {
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
			if (kwargs.zeffect) {
				this.message('<small>' + pokemon.getName() + ' unleashes its full-force Z-Move!</small>', '');
			}
			switch (fromeffect.id) {
			case 'snatch':
				break;
			case 'magicbounce':
			case 'magiccoat':
			case 'rebound':
				if (fromeffect.id === 'magiccoat') {
					this.resultAnim(pokemon, "Bounced", 'good');
					pokemon.addTurnstatus('magiccoat');
				} else {
					this.resultAnim(pokemon, fromeffect.name, 'ability');
					this.message('', "<small>[" + pokemon.getName(true) + "'s " + fromeffect.name + "!]</small>");
					pokemon.markAbility(fromeffect.name);
				}
				this.message(pokemon.getName() + " bounced the " + move.name + " back!");
				break;
			case 'metronome':
				this.message('Waggling a finger let it use <strong>' + move.name + '</strong>!');
				break;
			case 'naturepower':
				this.message('Nature Power turned into <strong>' + move.name + '</strong>!');
				break;
			case 'weatherball':
				this.message('Breakneck Blitz turned into <strong>' + move.name + '</strong> due to the weather!');
				break;
			case 'sleeptalk':
				pokemon.markMove(move.name, 0);
				this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				break;
			// Gen 1
			case 'bind':
			case 'clamp':
			case 'firespin':
			case 'wrap':
				this.message(pokemon.getName() + "'s attack continues!");
				break;
			default:
				// April Fool's 2014
				if (window.Config && Config.server && Config.server.afd && move.id === 'earthquake') {
					if (!this.fastForward) {
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
						}, 100, function () {
							$(this).css({
								position: 'static'
							});
						});
					}
					this.message(pokemon.getName() + ' used <strong>Fissure</strong>!');
					this.message('Just kidding! It was <strong>Earthquake</strong>!');
				} else if (window.Config && Config.server && Config.server.afd && move.id === 'stealthrock') {
					var srNames = ['Sneaky Pebbles', 'Sly Rubble', 'Subtle Sediment', 'Buried Bedrock', 'Camouflaged Cinnabar', 'Clandestine Cobblestones', 'Cloaked Clay', 'Concealed Ore', 'Covert Crags', 'Crafty Coal', 'Discreet Bricks', 'Disguised Debris', 'Espionage Pebbles', 'Furtive Fortress', 'Hush-Hush Hardware', 'Incognito Boulders', 'Invisible Quartz', 'Masked Minerals', 'Mischievous Masonry', 'Obscure Ornaments', 'Private Paragon', 'Secret Solitaire', 'Sheltered Sand', 'Surreptitious Sapphire', 'Undercover Ultramarine'];
					this.message(pokemon.getName() + ' used <strong>' + srNames[Math.floor(Math.random() * srNames.length)] + '</strong>!');
				// } else if (window.Config && Config.server && Config.server.afd && (move.id === 'metronome' || move.id === 'sleeptalk' || move.id === 'assist')) {
				// 	this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				// 	var buttons = ["A", "B", "START", "SELECT", "UP", "DOWN", "LEFT", "RIGHT", "DEMOCRACY", "ANARCHY"];
				// 	var people = ["Zarel", "The Immortal", "Diatom", "Nani Man", "shaymin", "apt-get", "sirDonovan", "Arcticblast", "Trickster"];
				// 	var button;
				// 	for (var i = 0; i < 10; i++) {
				// 		var name = people[Math.floor(Math.random() * people.length)];
				// 		if (!button) button = buttons[Math.floor(Math.random() * buttons.length)];
				// 		this.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name) + ':</strong> <em>' + button + '</em></div>');
				// 		button = (name === 'Diatom' ? "thanks diatom" : null);
				// 	}
				} else {
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				}
				if (!fromeffect.id || fromeffect.id === 'pursuit') {
					if (move.isZ) {
						pokemon.item = move.isZ;
						var item = Tools.getItem(move.isZ);
						if (item.zMoveFrom) move = Tools.getMove(move.zMoveFrom);
					} else if (move.name.slice(0, 2) === 'Z-') {
						move = Tools.getMove(move.name.slice(2));
						for (var item in window.BattleItems) {
							if (BattleItems[item].zMoveType === move.type) pokemon.item = item;
						}
					}
					var pp = (target && target.side !== pokemon.side && toId(target.ability) === 'pressure' ? 2 : 1);
					pokemon.markMove(move.name, pp);
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
				var quote = quotes[(this.p1.name.charCodeAt(2) + this.p2.name.charCodeAt(2) + this.turn) % quotes.length];
				this.message(pokemon.getName() + " said, \"" + quote + "\"");
			}
		}
		if (!this.fastForward && !kwargs.still) {
			// skip
			if (kwargs.miss && target.side) {
				target = target.side.missedPokemon;
			}
			if (kwargs.notarget || !target || !target.sprite.elem) {
				target = pokemon.side.foe.missedPokemon;
			}
			if (kwargs.prepare || kwargs.anim === 'prepare') {
				this.prepareMove(pokemon, move, target);
			} else if (!kwargs.notarget) {
				var usedMove = kwargs.anim ? Tools.getMove(kwargs.anim) : move;
				if (kwargs.spread) {
					this.activeMoveIsSpread = kwargs.spread;
					var targets = [pokemon.sprite];
					var hitPokemon = kwargs.spread.split(',');
					if (hitPokemon[0] !== '.') {
						for (var i = hitPokemon.length - 1; i >= 0; i--) {
							targets.push(this.getPokemon(hitPokemon[i] + ': ?').sprite);
						}
					} else {
						// if hitPokemon[0] === '.' then no target was hit by the attack
						targets.push(target.sprite.elem ? target.side.missedPokemon.sprite : target.sprite);
					}

					usedMove.anim(this, targets);
				} else {
					usedMove.anim(this, [pokemon.sprite, target.sprite]);
				}
			}
		}
		pokemon.lastmove = move.id;
		this.lastmove = move.id;
		if (move.id === 'wish' || move.id === 'healingwish') {
			pokemon.side.wisher = pokemon;
		}
	};
	Battle.prototype.cantUseMove = function (pokemon, effect, move, kwargs) {
		pokemon.clearMovestatuses();
		pokemon.side.updateStatbar(pokemon);
		if (window.BattleStatusAnims && effect.id in BattleStatusAnims && !this.fastForward) {
			BattleStatusAnims[effect.id].anim(this, [pokemon.sprite]);
		}
		if (effect.effectType === 'Ability') {
			this.resultAnim(pokemon, effect.name, 'ability');
			this.message('', "<small>[" + pokemon.getName(true) + "'s " + effect.name + "!]</small>");
			pokemon.markAbility(effect.name);
		}
		switch (effect.id) {
		case 'taunt':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' after the taunt!');
			pokemon.markMove(move.name, 0);
			break;
		case 'gravity':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of gravity!');
			pokemon.markMove(move.name, 0);
			break;
		case 'healblock':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of Heal Block!');
			pokemon.markMove(move.name, 0);
			break;
		case 'imprison':
			this.message('' + pokemon.getName() + ' can\'t use its sealed ' + move.name + '!');
			pokemon.markMove(move.name, 0);
			break;
		case 'throatchop':
			this.message('The effects of Throat Chop prevent ' + pokemon.getName() + ' from using certain moves!');
			break;
		case 'par':
			this.resultAnim(pokemon, 'Paralyzed', 'par');
			this.message('' + pokemon.getName() + ' is paralyzed! It can\'t move!');
			break;
		case 'frz':
			this.resultAnim(pokemon, 'Frozen', 'frz');
			this.message('' + pokemon.getName() + ' is frozen solid!');
			break;
		case 'slp':
			this.resultAnim(pokemon, 'Asleep', 'slp');
			this.message('' + pokemon.getName() + ' is fast asleep.');
			break;
		case 'skydrop':
			this.message('Sky Drop won\'t let ' + pokemon.getLowerName() + ' go!');
			break;
		case 'damp':
		case 'dazzling':
		case 'queenlymajesty':
			var ofpoke = this.getPokemon(kwargs.of);
			this.message(ofpoke.getName() + ' cannot use ' + move.name + '!');
			break;
		case 'truant':
			this.resultAnim(pokemon, 'Loafing around', 'neutral');
			this.message('' + pokemon.getName() + ' is loafing around!');
			break;
		case 'recharge':
			if (!this.fastForward) BattleOtherAnims['selfstatus'].anim(this, [pokemon.sprite]);
			this.resultAnim(pokemon, 'Must recharge', 'neutral');
			this.message('<small>' + pokemon.getName() + ' must recharge!</small>');
			break;
		case 'focuspunch':
			this.resultAnim(pokemon, 'Lost focus', 'neutral');
			this.message(pokemon.getName() + ' lost its focus and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch');
			break;
		case 'shelltrap':
			this.resultAnim(pokemon, 'Trap failed', 'neutral');
			this.message(pokemon.getName() + '\'s shell trap didn\'t work!');
			pokemon.removeTurnstatus('shelltrap');
			break;
		case 'flinch':
			this.resultAnim(pokemon, 'Flinched', 'neutral');
			this.message(pokemon.getName() + ' flinched and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch');
			break;
		case 'attract':
			this.resultAnim(pokemon, 'Immobilized', 'neutral');
			this.message(pokemon.getName() + ' is immobilized by love!');
			break;
		case 'nopp':
			this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
			this.message('But there was no PP left for the move!');
			break;
		default:
			this.message('<small>' + pokemon.getName() + (move.name ? ' can\'t use ' + move.name + '' : ' can\'t move') + '!</small>');
			break;
		}
		pokemon.sprite.animReset();
	};
	Battle.prototype.prepareMove = function (pokemon, move, target) {
		if (!move.prepareAnim) return;
		if (!target) {
			target = pokemon.side.foe.active[0];
		}
		if (!target) {
			target = pokemon;
		}
		if (!this.fastForward) move.prepareAnim(this, [pokemon.sprite, target.sprite]);
		this.message('<small>' + move.prepareMessage(pokemon, target) + '</small>');
	};
	Battle.prototype.animMultiHitMove = function () {
		if (this.multiHitMove && !this.fastForward) {
			this.multiHitMove[0].anim(this, [this.multiHitMove[1], this.multiHitMove[2]]);
			this.multiHitMove[3]++;
			this.animationDelay += 500;
		}
	};
	Battle.prototype.runMinor = function (args, kwargs, preempt, nextArgs, nextKwargs) {
		var actions = '';
		var minors = this.minorQueue;
		if (this.multiHitMove && minors.length) {
			var lastMinor = minors[minors.length - 1];
			//if (lastMinor[0][0] === '-damage' || lastMinor[0][1]['subdamage']) this.animMultiHitMove();
		}
		if (args) {
			if (args[2] === 'Sturdy' && args[0] === '-activate') args[2] = 'ability: Sturdy';
			if (args[0] === '-crit' || args[0] === '-supereffective' || args[0] === '-resisted' || args[2] === 'ability: Sturdy') kwargs.then = '.';
			if (args[0] === '-damage' && !kwargs.from && args[1] !== nextArgs[1] && (nextArgs[0] === '-crit' || nextArgs[0] === '-supereffective' || nextArgs[0] === '-resisted' || (nextArgs[0] === '-damage' && !nextKwargs.from))) kwargs.then = '.';
			if (args[0] === '-ability' && (args[2] === 'Intimidate' || args[3] === 'boost')) kwargs.then = '.';
			if (args[0] === '-unboost' && nextArgs[0] === '-unboost') kwargs.then = '.';
			if (args[0] === '-boost' && nextArgs[0] === '-boost') kwargs.then = '.';
			if (args[0] === '-damage' && kwargs.from === 'Leech Seed' && nextArgs[0] === '-heal' && nextKwargs.silent) kwargs.then = '.';
			minors.push([args, kwargs]);
			if (kwargs.simult || kwargs.then) {
				return;
			}
		}
		while (minors.length) {
			var row = minors.shift();
			args = row[0];
			kwargs = row[1];
			if (kwargs.simult) this.animationDelay = 0;

			switch (args[0]) {
			case '-center':
				actions += "Automatic center!";
				break;
			case '-damage':
				var poke = this.getPokemon(args[1]);
				var damage = poke.healthParse(args[2], true);
				if (damage === false) break;
				this.lastDamage = (damage[2] || 1); // not sure if this is used for anything
				var range = poke.getDamageRange(damage);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability' && ofpoke) {
						this.resultAnim(ofpoke, effect.name, 'ability');
						this.message('', "<small>[" + ofpoke.getName(true) + "'s " + effect.name + "!]</small>");
						ofpoke.markAbility(effect.name);
					} else if (effect.effectType === 'Item') {
						(ofpoke || poke).item = effect.name;
					}
					switch (effect.id) {
					case 'stealthrock':
						actions += "Pointed stones dug into " + poke.getLowerName() + "!";
						break;
					case 'spikes':
						actions += "" + poke.getName() + " is hurt by the spikes!";
						break;
					case 'brn':
						if (!this.fastForward) BattleStatusAnims['brn'].anim(this, [poke.sprite]);
						actions += "" + poke.getName() + " was hurt by its burn!";
						break;
					case 'psn':
						if (!this.fastForward) BattleStatusAnims['psn'].anim(this, [poke.sprite]);
						actions += "" + poke.getName() + " was hurt by poison!";
						break;
					case 'lifeorb':
						this.message('', '<small>' + poke.getName() + ' lost some of its HP!</small>');
						break;
					case 'recoil':
						actions += "" + poke.getName() + " is damaged by the recoil!";
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
					case 'curse':
						actions += "" + poke.getName() + " is afflicted by the curse!";
						break;
					case 'nightmare':
						actions += "" + poke.getName() + " is locked in a nightmare!";
						break;
					case 'roughskin':
					case 'ironbarbs':
					case 'spikyshield':
						actions += "" + poke.getName() + " was hurt!";
						break;
					case 'innardsout':
					case 'aftermath':
						actions += "" + poke.getName() + " is hurt!";
						break;
					case 'liquidooze':
						actions += "" + poke.getName() + " sucked up the liquid ooze!";
						break;
					case 'dryskin':
					case 'solarpower':
						break;
					case 'confusion':
						actions += "It hurt itself in its confusion! ";
						poke.sprite.animReset();
						break;
					case 'leechseed':
						if (!this.fastForward) {
							BattleOtherAnims.leech.anim(this, [ofpoke.sprite, poke.sprite]);
							// this.activityWait(500);
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
					case 'bind':
					case 'wrap':
						if (!this.fastForward) BattleOtherAnims.bound.anim(this, [poke.sprite]);
						actions += "" + poke.getName() + ' is hurt by ' + effect.name + '!';
						break;
					default:
						if (ofpoke) {
							actions += "" + poke.getName() + " is hurt by " + ofpoke.getLowerName() + "'s " + effect.name + "!";
						} else if (effect.effectType === 'Item') {
							actions += "" + poke.getName() + " is hurt by its " + effect.name + "!";
						} else if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + " is hurt by its " + effect.name + "!";
						} else if (kwargs.partiallytrapped) {
							actions += "" + poke.getName() + ' is hurt by ' + effect.name + '!';
						} else {
							actions += "" + poke.getName() + " lost some HP because of " + effect.name + "!";
						}
						break;
					}
				} else {
					var damageinfo = '' + poke.getFormattedRange(range, damage[1] === 100 ? 0 : 1, '–');
					if (damage[1] !== 100) {
						var hover = '' + ((damage[0] < 0) ? '&minus;' : '') +
							Math.abs(damage[0]) + '/' + damage[1];
						if (damage[1] === 48) { // this is a hack
							hover += ' pixels';
						}
						damageinfo = '<abbr title="' + hover + '">' + damageinfo + '</abbr>';
					}
					var hiddenactions = '<small>' + poke.getName() + ' lost ' + damageinfo + ' of its health!</small><br />';
					this.message(actions ? '<small>' + actions + '</small>' : '', hiddenactions);
					actions = '';
				}
				this.damageAnim(poke, poke.getFormattedRange(range, 0, ' to '));
				break;
			case '-heal':
				var poke = this.getPokemon(args[1]);
				var damage = poke.healthParse(args[2], true, true);
				if (damage === false) break;
				var range = poke.getDamageRange(damage);

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability') {
						this.resultAnim(poke, effect.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect.name);
					}
					switch (effect.id) {
					case 'memento':
					case 'partingshot':
						actions += "" + poke.getName() + "'s HP was restored by the Z-Power!";
						break;
					case 'ingrain':
						actions += "" + poke.getName() + " absorbed nutrients with its roots!";
						break;
					case 'aquaring':
						actions += "A veil of water restored " + poke.getLowerName() + "'s HP!";
						break;
					case 'healingwish':
						actions += "The healing wish came true for " + poke.getLowerName() + "!";
						this.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(this, [poke.sprite]);
						poke.side.wisher = null;
						break;
					case 'lunardance':
						actions += "" + poke.getName() + " became cloaked in mystical moonlight!";
						this.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(this, [poke.sprite]);
						for (var i = 0; i < poke.moveTrack.length; i++) {
							poke.moveTrack[i][1] = 0;
						}
						poke.side.wisher = null;
						break;
					case 'wish':
						actions += "" + kwargs.wisher + "'s wish came true!";
						if (!this.fastForward) this.backgroundEffect("url('fx/bg-space.jpg')", 600, 0.4);
						Tools.getMove('wish').residualAnim(this, [poke.sprite]);
						this.animationDelay += 500;
						break;
					case 'drain':
						actions += ofpoke.getName() + ' had its energy drained!';
						break;
					case 'leftovers':
					case 'shellbell':
					case 'blacksludge':
						poke.item = effect.name;
						actions += "" + poke.getName() + " restored a little HP using its " + effect.name + "!";
						break;
					default:
						if (kwargs.absorb) {
							actions += "" + poke.getName() + "'s " + effect.name + " absorbs the attack!";
						} else if (effect.id && effect.effectType !== 'Ability') {
							actions += "" + poke.getName() + " restored HP using its " + effect.name + "!";
						} else {
							actions += poke.getName() + ' restored its HP.';
						}
						break;
					}
				} else if (kwargs.zeffect) {
					actions += "" + poke.getName() + " restored its HP using its Z-Power!";
				} else {
					actions += poke.getName() + ' restored its HP.';
				}
				if (!this.fastForward) BattleOtherAnims.heal.anim(this, [poke.sprite]);
				this.healAnim(poke, poke.getFormattedRange(range, 0, ' to '));
				break;
			case '-sethp':
				var effect = Tools.getEffect(kwargs.from);
				var poke, ofpoke;
				for (var k = 0; k < 2; k++) {
					var cpoke = this.getPokemon(args[1 + 2 * k]);
					if (cpoke) {
						var damage = cpoke.healthParse(args[2 + 2 * k]);
						var range = cpoke.getDamageRange(damage);
						var formattedRange = cpoke.getFormattedRange(range, 0, ' to ');
						var diff = damage[0];
						if (diff > 0) {
							this.healAnim(cpoke, formattedRange);
						} else {
							this.damageAnim(cpoke, formattedRange);
						}
					}
					if (k == 0) poke = cpoke;
					if (k == 1) ofpoke = cpoke;
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
				if (this.gen === 1 && stat === 'spd') break;
				if (this.gen === 1 && stat === 'spa') stat = 'spc';
				var amount = parseInt(args[3], 10);
				if (amount === 0) {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " won't go any higher! ";
					this.resultAnim(poke, 'Highest ' + BattleStats[stat], 'good');
					break;
				}
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] += amount;

				var amountString = '';
				if (amount === 2) amountString = ' sharply';
				if (amount >= 3) amountString = ' drastically';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability' && !(effect.id === 'weakarmor' && stat === 'spe')) {
						this.resultAnim(ofpoke || poke, effect.name, 'ability');
						this.message('', "<small>[" + (ofpoke || poke).getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect);
					}
					switch (effect.id) {
					default:
						if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + "'s " + BattleStats[stat] + " rose" + amountString + "! ";
						}
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString + " raised " + poke.getLowerName() + "'s " + BattleStats[stat] + "! ";
						}
						break;
					}
				} else if (kwargs.zeffect) {
					if (minors.length) {
						actions += "" + poke.getName() + " boosted its stats" + amountString + " using its Z-Power! ";
						for (var i = 0; i < minors.length; i++) {
							minors[i][1].silent = '.';
						}
					} else {
						actions += "" + poke.getName() + " boosted its " + BattleStats[stat] + amountString + " using its Z-Power! ";
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " rose" + amountString + "! ";
				}
				this.resultAnim(poke, poke.getBoost(stat), 'good');
				break;
			case '-unboost':
				var poke = this.getPokemon(args[1]);
				var stat = args[2];
				if (this.gen === 1 && stat === 'spd') break;
				if (this.gen === 1 && stat === 'spa') stat = 'spc';
				var amount = parseInt(args[3], 10);
				if (amount === 0) {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " won't go any lower! ";
					this.resultAnim(poke, 'Lowest ' + BattleStats[stat], 'bad');
					break;
				}
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] -= amount;

				var amountString = '';
				if (amount === 2) amountString = ' harshly';
				if (amount >= 3) amountString = ' severely';
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					var effect = Tools.getEffect(kwargs.from);
					var ofpoke = this.getPokemon(kwargs.of);
					if (effect.effectType === 'Ability') {
						this.resultAnim(ofpoke || poke, effect.name, 'ability');
						this.message('', "<small>[" + (ofpoke || poke).getName(true) + "'s " + effect.name + "!]</small>");
						poke.markAbility(effect);
					}
					switch (effect.id) {
					default:
						if (effect.effectType === 'Ability') {
							actions += "" + poke.getName() + "'s " + BattleStats[stat] + " fell" + amountString + "! ";
						}
						if (effect.effectType === 'Item') {
							actions += "The " + effect.name + amountString + " lowered " + poke.getLowerName() + "'s " + BattleStats[stat] + "! ";
						}
						break;
					}
				} else {
					actions += "" + poke.getName() + "'s " + BattleStats[stat] + " fell" + amountString + "! ";
				}
				this.resultAnim(poke, poke.getBoost(stat), 'bad');
				break;
			case '-setboost':
				var poke = this.getPokemon(args[1]);
				var stat = args[2];
				var amount = parseInt(args[3], 10);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.boosts[stat] = amount;
				this.resultAnim(poke, poke.getBoost(stat), (amount > 0 ? 'good' : 'bad'));

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.from) {
					switch (effect.id) {
					case 'bellydrum':
						actions += '' + poke.getName() + ' cut its own HP and maximized its Attack!';
						break;
					case 'angerpoint':
						if (!this.fastForward) BattleOtherAnims.anger.anim(this, [poke.sprite]);
						this.resultAnim(poke, 'Anger Point', 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s Anger Point!]</small>");
						poke.markAbility('Anger Point');
						actions += '' + poke.getName() + ' maxed its Attack!';
						break;
					}
				}
				break;
			case '-swapboost':
				var poke = this.getPokemon(args[1]);
				var poke2 = this.getPokemon(args[2]);
				var stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
				var effect = Tools.getEffect(kwargs.from);
				for (var i = 0; i < stats.length; i++) {
					var tmp = poke.boosts[stats[i]];
					poke.boosts[stats[i]] = poke2.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
					poke2.boosts[stats[i]] = tmp;
					if (!poke2.boosts[stats[i]]) delete poke2.boosts[stats[i]];
				}
				this.resultAnim(poke, 'Stats swapped', 'neutral', true);
				this.resultAnim(poke2, 'Stats swapped', 'neutral');

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'guardswap':
						actions += '' + poke.getName() + ' switched all changes to its Defense and Sp. Def with its target!';
						break;
					case 'heartswap':
						actions += '' + poke.getName() + ' switched stat changes with its target!';
						break;
					case 'powerswap':
						actions += '' + poke.getName() + ' switched all changes to its Attack and Sp. Atk with its target!';
						break;
					}
				}
				break;
			case '-clearpositiveboost':
				var poke = this.getPokemon(args[1]);
				var ofpoke = this.getPokemon(args[2]);
				var effect = Tools.getEffect(args[3]);
				for (i in poke.boosts) {
					if (poke.boosts[i] > 0) delete poke.boosts[i];
				}
				this.resultAnim(poke, 'Boosts lost', 'bad');

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) {
					switch (effect.id) {
					case 'spectralthief':
						// todo: update StealBoosts so it animates 1st on Spectral Thief
						if (!this.fastForward) BattleOtherAnims.spectralthiefboost.anim(this, [ofpoke.sprite, poke.sprite]);
						actions += '' + ofpoke.getName() + ' stole the target\'s boosted stats!';
						break;
					}
				}
				break;
			case '-clearnegativeboost':
				var poke = this.getPokemon(args[1]);
				for (i in poke.boosts) {
					if (poke.boosts[i] < 0) delete poke.boosts[i];
				}
				this.resultAnim(poke, 'Restored', 'good');

				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.zeffect) {
					actions += '' + poke.getName() + ' returned its decreased stats to normal using its Z-Power!';
					break;
				}
				break;
			case '-copyboost':
				var poke = this.getPokemon(args[1]);
				var frompoke = this.getPokemon(args[2]);
				var stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
				var effect = Tools.getEffect(kwargs.from);
				for (var i = 0; i < stats.length; i++) {
					poke.boosts[stats[i]] = frompoke.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
				}
				//poke.boosts = $.extend({}, frompoke.boosts);

				if (kwargs.silent) {
					// do nothing
				} else {
					this.resultAnim(poke, 'Stats copied', 'neutral');
					actions += "" + poke.getName() + " copied " + frompoke.getLowerName() + "'s stat changes!";
				}
				break;
			case '-clearboost':
				var poke = this.getPokemon(args[1]);
				poke.boosts = {};
				this.resultAnim(poke, 'Stats reset', 'neutral');

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
				this.resultAnim(poke, 'Stats inverted', 'neutral');

				if (kwargs.silent) {
					// do nothing
				} else {
					actions += '' + poke.getName() + '\'s stat changes were inverted!';
				}
				break;
			case '-clearallboost':
				for (var slot = 0; slot < this.mySide.active.length; slot++) {
					if (this.mySide.active[slot]) {
						this.mySide.active[slot].boosts = {};
						this.resultAnim(this.mySide.active[slot], 'Stats reset', 'neutral', true);
					}
					if (this.yourSide.active[slot]) {
						this.yourSide.active[slot].boosts = {};
						this.resultAnim(this.yourSide.active[slot], 'Stats reset', 'neutral', true);
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
				for (var j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[i + j][0][1]);
				if (poke) this.resultAnim(poke, 'Critical hit', 'bad');
				actions += "A critical hit" + (this.activeMoveIsSpread ? " on " + poke.getLowerName() : "") + "! ";
				break;

			case '-supereffective':
				var poke = this.getPokemon(args[1]);
				for (var j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[i + j][0][1]);
				if (poke) this.resultAnim(poke, 'Super-effective', 'bad');
				actions += "It's super effective" + (this.activeMoveIsSpread ? " on " + poke.getLowerName() : "") + "! ";
				break;

			case '-resisted':
				var poke = this.getPokemon(args[1]);
				for (var j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[i + j][0][1]);
				if (poke) this.resultAnim(poke, 'Resisted', 'neutral');
				actions += "It's not very effective" + (this.activeMoveIsSpread ? " on " + poke.getLowerName() : "..") + ". ";
				break;

			case '-immune':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				if (fromeffect && fromeffect.effectType === 'Ability') {
					var ofpoke = this.getPokemon(kwargs.of) || poke;
					this.resultAnim(ofpoke, fromeffect.name, 'ability');
					this.message('', "<small>[" + ofpoke.getName(true) + "'s " + fromeffect.name + "!]</small>");
					ofpoke.markAbility(fromeffect.name);
				}
				if (effect.id == 'confusion') {
					actions += "" + poke.getName() + " doesn't become confused! ";
				} else if (kwargs.msg) {
					actions += "It doesn't affect " + poke.getLowerName() + "... ";
				} else if (kwargs.ohko) {
					actions += "" + poke.getName() + " is unaffected! ";
				} else {
					actions += "It had no effect! ";
				}
				this.resultAnim(poke, 'Immune', 'neutral');
				break;

			case '-miss':
				var user = this.getPokemon(args[1]);
				var target = this.getPokemon(args[2]);
				if (target) {
					actions += "" + target.getName() + " avoided the attack!";
					this.resultAnim(target, 'Missed', 'neutral');
				} else {
					actions += "" + user.getName() + "'s attack missed!";
				}
				break;

			case '-fail':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				if (poke) {
					this.resultAnim(poke, 'Failed', 'neutral');
				}
				// Sky Drop blocking moves takes priority over all other moves
				if (fromeffect.id === 'skydrop') {
					actions += "Sky Drop won't let " + poke.getLowerName() + " go!";
					break;
				}
				switch (effect.id) {
				case 'brn':
					this.resultAnim(poke, 'Already burned', 'neutral');
					actions += "" + poke.getName() + " already has a burn.";
					break;
				case 'tox':
				case 'psn':
					this.resultAnim(poke, 'Already poisoned', 'neutral');
					actions += "" + poke.getName() + " is already poisoned.";
					break;
				case 'slp':
					if (fromeffect.id === 'uproar') {
						this.resultAnim(poke, 'Failed', 'neutral');
						if (kwargs.msg) {
							actions += "But " + poke.getLowerName() + " can't sleep in an uproar!";
						} else {
							actions += "But the uproar kept " + poke.getLowerName() + " awake!";
						}
					} else {
						this.resultAnim(poke, 'Already asleep', 'neutral');
						actions += "" + poke.getName() + " is already asleep!";
					}
					break;
				case 'par':
					this.resultAnim(poke, 'Already paralyzed', 'neutral');
					actions += "" + poke.getName() + " is already paralyzed.";
					break;
				case 'frz':
					this.resultAnim(poke, 'Already frozen', 'neutral');
					actions += "" + poke.getName() + " is already frozen solid!";
					break;
				case 'darkvoid':
				case 'hyperspacefury':
					if (kwargs.forme) {
						actions += 'But ' + poke.getLowerName() + ' can\'t use it the way it is now!';
					} else {
						actions += 'But ' + poke.getLowerName() + ' can\'t use the move!';
					}
					break;
				case 'magikarpsrevenge':
					actions += 'But ' + poke.getLowerName() + ' can\'t use the move!';
					break;
				case 'substitute':
					if (kwargs.weak) {
						actions += "But it does not have enough HP left to make a substitute!";
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
				case 'sunnyday':
				case 'raindance':
				case 'sandstorm':
				case 'hail':
					switch (fromeffect.id) {
					case 'desolateland':
						actions += "The extremely harsh sunlight was not lessened at all!";
						break;
					case 'primordialsea':
						actions += "There is no relief from this heavy rain!";
						break;
					case 'deltastream':
						actions += "The mysterious strong winds blow on regardless!";
						break;
					default:
						actions += "But it failed!";
					}
					break;
				case 'unboost':
					if (fromeffect.effectType === 'Ability') {
						this.resultAnim(poke, fromeffect.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						poke.markAbility(fromeffect);
					} else {
						this.resultAnim(poke, 'Stat drop blocked', 'neutral');
					}
					switch (fromeffect.id) {
					case 'flowerveil':
						actions += '' + ofpoke.getName() + ' surrounded itself with a veil of petals!';
						break;
					default:
						var stat = Tools.escapeHTML(args[3]);
						actions += "" + poke.getName() + "'s " + (stat ? stat + " was" : "stats were") + " not lowered!";
					}
					break;
				default:
					switch (fromeffect.id) {
					case 'desolateland':
						actions += "The Water-type attack evaporated in the harsh sunlight!";
						break;
					case 'primordialsea':
						actions += "The Fire-type attack fizzled out in the heavy rain!";
						break;
					default:
						actions += "But it failed!";
					}
					break;
				}
				break;

			case '-notarget':
				if (this.gen >= 5) {
					actions += "But it failed!";
				} else {
					actions += "But there was no target...";
				}
				break;

			case '-ohko':
				actions += "It's a one-hit KO!";
				break;

			case '-hitcount':
				var hits = parseInt(args[2], 10);
				if (this.multiHitMove && this.multiHitMove[3] === 0 && hits > 0) this.animMultiHitMove();
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
				actions += "The two moves have become one! It's a combined move!";
				break;

			case '-zpower':
				var poke = this.getPokemon(args[1]);
				if (!this.fastForward) BattleOtherAnims.zpower.anim(this, [poke.sprite]);
				actions += "" + poke.getName() + " surrounded itself with its Z-Power! ";
				break;

			case '-prepare':
				var poke = this.getPokemon(args[1]);
				var move = Tools.getMove(args[2]);
				var target = this.getPokemon(args[3]);
				this.prepareMove(poke, move, target);
				break;

			case '-mustrecharge':
				var poke = this.getPokemon(args[1]);
				poke.addMovestatus('mustrecharge');
				poke.side.updateStatbar(poke);
				break;

			case '-status':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(kwargs.from);
				poke.status = args[2];
				poke.removeVolatile('yawn');
				var effectMessage = "";
				if (effect.effectType === 'Ability') {
					var ofpoke = this.getPokemon(kwargs.of) || poke;
					this.resultAnim(ofpoke, effect.name, 'ability');
					this.message('', "<small>[" + ofpoke.getName(true) + "'s " + effect.name + "!]</small>");
					ofpoke.markAbility(effect);
				} else if (effect.effectType === 'Item') {
					(ofpoke || poke).item = effect.name;
					effectMessage = " by the " + effect.name;
				}

				switch (args[2]) {
				case 'brn':
					this.resultAnim(poke, 'Burned', 'brn');
					if (!this.fastForward) BattleStatusAnims['brn'].anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " was burned" + effectMessage + "!";
					break;
				case 'tox':
					this.resultAnim(poke, 'Toxic poison', 'psn');
					if (!this.fastForward) BattleStatusAnims['psn'].anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " was badly poisoned" + effectMessage + "!";
					break;
				case 'psn':
					this.resultAnim(poke, 'Poisoned', 'psn');
					if (!this.fastForward) BattleStatusAnims['psn'].anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " was poisoned!";
					break;
				case 'slp':
					this.resultAnim(poke, 'Asleep', 'slp');
					if (effect.id === 'rest') {
						actions += '' + poke.getName() + ' slept and became healthy!';
					} else {
						actions += "" + poke.getName() + " fell asleep!";
					}
					break;
				case 'par':
					this.resultAnim(poke, 'Paralyzed', 'par');
					if (!this.fastForward) BattleStatusAnims['par'].anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " is paralyzed! It may be unable to move!";
					break;
				case 'frz':
					this.resultAnim(poke, 'Frozen', 'frz');
					if (!this.fastForward) BattleStatusAnims['frz'].anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " was frozen solid!";
					break;
				default:
					poke.side.updateStatbar(poke);
					break;
				}
				break;

			case '-curestatus':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.status = '';

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) switch (effect.id) {
				case 'psychoshift':
					actions += '' + poke.getName() + ' moved its status onto ' + ofpoke.getLowerName() + '!';
					this.resultAnim(poke, 'Cured', 'good');
					break;
				case 'flamewheel':
				case 'flareblitz':
				case 'fusionflare':
				case 'sacredfire':
				case 'scald':
				case 'steameruption':
					this.resultAnim(poke, 'Thawed', 'good');
					actions += "" + poke.getName() + "'s " + effect.name + " melted the ice!";
					break;
				case 'naturalcure':
					actions += "(" + poke.getName() + "'s Natural Cure activated!)";
					poke.markAbility('Natural Cure');
					break;
				default:
					this.resultAnim(poke, 'Cured', 'good');
					actions += "" + poke.getName() + "'s " + effect.name + " heals its status!";
					break;
				} else switch (args[2]) {
				case 'brn':
					this.resultAnim(poke, 'Burn cured', 'good');
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " healed its burn!";
						break;
					}
					if (poke.side.n === 0) actions += "" + poke.getName() + "'s burn was healed.";
					else actions += "" + poke.getName() + " healed its burn!";
					break;
				case 'tox':
				case 'psn':
					this.resultAnim(poke, 'Poison cured', 'good');
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its poison!";
						break;
					}
					actions += "" + poke.getName() + " was cured of its poisoning.";
					break;
				case 'slp':
					this.resultAnim(poke, 'Woke up', 'good');
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " woke it up!";
						break;
					}
					actions += "" + poke.getName() + " woke up!";
					break;
				case 'par':
					this.resultAnim(poke, 'Paralysis cured', 'good');
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its paralysis!";
						break;
					}
					actions += "" + poke.getName() + " was cured of paralysis.";
					break;
				case 'frz':
					this.resultAnim(poke, 'Thawed', 'good');
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " defrosted it!";
						break;
					}
					actions += "" + poke.getName() + " thawed out!";
					break;
				default:
					poke.removeVolatile('confusion');
					this.resultAnim(poke, 'Cured', 'good');
					actions += "" + poke.getName() + "'s status cleared!";
				}
				break;

			case '-cureteam': // For old gens when the whole team was always cured
				var poke = this.getPokemon(args[1]);
				for (var k = 0; k < poke.side.pokemon.length; k++) {
					poke.side.pokemon[k].status = '';
					poke.side.updateStatbar(poke.side.pokemon[k]);
				}

				this.resultAnim(poke, 'Team Cured', 'good');
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
				poke.itemEffect = '';
				poke.removeVolatile('airballoon');
				if (item.id === 'airballoon') poke.addVolatile('airballoon');

				if (effect.id) switch (effect.id) {
				case 'pickup':
					this.resultAnim(poke, 'Pickup', 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s Pickup!]</small>");
					poke.markAbility('Pickup');
					// falls through
				case 'recycle':
					poke.itemEffect = 'found';
					actions += '' + poke.getName() + ' found one ' + item.name + '!';
					this.resultAnim(poke, item.name, 'neutral');
					break;
				case 'frisk':
					this.resultAnim(ofpoke, 'Frisk', 'ability');
					this.message('', "<small>[" + ofpoke.getName(true) + "'s Frisk!]</small>");
					ofpoke.markAbility('Frisk');
					if (kwargs.identify) { // used for gen 6
						poke.itemEffect = 'frisked';
						actions += '' + ofpoke.getName() + ' frisked ' + poke.getLowerName() + ' and found its ' + item.name + '!';
						this.resultAnim(poke, item.name, 'neutral');
					} else {
						actions += '' + ofpoke.getName() + ' frisked its target and found one ' + item.name + '!';
					}
					break;
				case 'magician':
				case 'pickpocket':
					this.resultAnim(poke, effect.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
					// falls through
				case 'thief':
				case 'covet':
					// simulate the removal of the item from the ofpoke
					ofpoke.item = '';
					ofpoke.itemEffect = '';
					ofpoke.prevItem = item.name;
					ofpoke.prevItemEffect = 'stolen';
					ofpoke.addVolatile('itemremoved');
					poke.itemEffect = 'stolen';
					actions += '' + poke.getName() + ' stole ' + ofpoke.getLowerName() + "'s " + item.name + "!";
					this.resultAnim(poke, item.name, 'neutral');
					this.resultAnim(ofpoke, 'Item Stolen', 'bad');
					break;
				case 'harvest':
					poke.itemEffect = 'harvested';
					this.resultAnim(poke, 'Harvest', 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s Harvest!]</small>");
					poke.markAbility('Harvest');
					actions += '' + poke.getName() + ' harvested one ' + item.name + '!';
					this.resultAnim(poke, item.name, 'neutral');
					break;
				case 'bestow':
					poke.itemEffect = 'bestowed';
					actions += '' + poke.getName() + ' received ' + item.name + ' from ' + ofpoke.getLowerName() + '!';
					this.resultAnim(poke, item.name, 'neutral');
					break;
				case 'trick':
					poke.itemEffect = 'tricked';
					// falls through
				default:
					actions += '' + poke.getName() + ' obtained one ' + item.name + '.';
					this.resultAnim(poke, item.name, 'neutral');
					break;
				} else switch (item.id) {
				case 'airballoon':
					this.resultAnim(poke, 'Balloon', 'good');
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
				poke.itemEffect = '';
				poke.prevItem = item.name;
				poke.prevItemEffect = '';
				poke.removeVolatile('airballoon');
				poke.addVolatile('itemremoved');
				if (kwargs.silent) {
					// do nothing
				} else if (kwargs.eat) {
					poke.prevItemEffect = 'eaten';
					if (!this.fastForward) BattleOtherAnims.consume.anim(this, [poke.sprite]);
					actions += '' + poke.getName() + ' ate its ' + item.name + '!';
					this.lastmove = item.id;
				} else if (kwargs.weaken) {
					poke.prevItemEffect = 'eaten';
					actions += 'The ' + item.name + ' weakened the damage to ' + poke.getLowerName() + '!';
					this.lastmove = item.id;
				} else if (effect.id) switch (effect.id) {
				case 'fling':
					poke.prevItemEffect = 'flung';
					actions += "" + poke.getName() + ' flung its ' + item.name + '!';
					break;
				case 'knockoff':
					poke.prevItemEffect = 'knocked off';
					actions += '' + ofpoke.getName() + ' knocked off ' + poke.getLowerName() + '\'s ' + item.name + '!';
					if (!this.fastForward) BattleOtherAnims.itemoff.anim(this, [poke.sprite]);
					this.resultAnim(poke, 'Item knocked off', 'neutral');
					break;
				case 'stealeat':
					poke.prevItemEffect = 'stolen';
					actions += '' + ofpoke.getName() + ' stole and ate its target\'s ' + item.name + '!';
					break;
				case 'gem':
					poke.prevItemEffect = 'consumed';
					actions += 'The ' + item.name + ' strengthened ' + Tools.getMove(kwargs.move).name + '\'s power!';
					break;
				case 'incinerate':
					poke.prevItemEffect = 'incinerated';
					actions += "" + poke.getName() + "'s " + item.name + " was burned up!";
					break;
				default:
					actions += "" + poke.getName() + ' lost its ' + item.name + '!';
					break;
				} else switch (item.id) {
				case 'airballoon':
					poke.prevItemEffect = 'popped';
					poke.removeVolatile('airballoon');
					this.resultAnim(poke, 'Balloon popped', 'neutral');
					actions += "" + poke.getName() + "'s Air Balloon popped!";
					break;
				case 'focussash':
					poke.prevItemEffect = 'consumed';
					this.resultAnim(poke, 'Sash', 'neutral');
					actions += "" + poke.getName() + ' hung on using its Focus Sash!';
					break;
				case 'focusband':
					this.resultAnim(poke, 'Focus Band', 'neutral');
					actions += "" + poke.getName() + ' hung on using its Focus Band!';
					break;
				case 'powerherb':
					poke.prevItemEffect = 'consumed';
					actions += "" + poke.getName() + " became fully charged due to its Power Herb!";
					break;
				case 'whiteherb':
					poke.prevItemEffect = 'consumed';
					actions += "" + poke.getName() + " returned its status to normal using its White Herb!";
					break;
				case 'ejectbutton':
					poke.prevItemEffect = 'consumed';
					actions += "" + poke.getName() + " is switched out with the Eject Button!";
					break;
				case 'redcard':
					poke.prevItemEffect = 'held up';
					actions += "" + poke.getName() + " held up its Red Card against " + ofpoke.getLowerName() + "!";
					break;
				default:
					poke.prevItemEffect = 'consumed';
					actions += "" + poke.getName() + "'s " + item.name + " activated!";
					break;
				}
				break;

			case '-ability':
				var poke = this.getPokemon(args[1]);
				var ability = Tools.getAbility(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				var ofpoke = this.getPokemon(kwargs.of);
				poke.markAbility(ability, effect.id && !kwargs.fail);

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) switch (effect.id) {
				case 'trace':
					this.resultAnim(poke, "Trace", 'ability');
					this.animationDelay = 500;
					this.resultAnim(poke, ability.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s Trace!]</small>");
					if (!poke.baseAbility) poke.baseAbility = effect.name;
					ofpoke.markAbility(ability.name);
					actions += '' + poke.getName() + ' traced ' + ofpoke.getLowerName() + '\'s ' + ability.name + '!';
					break;
				case 'powerofalchemy':
				case 'receiver':
					this.resultAnim(poke, effect.name, 'ability');
					this.animationDelay = 500;
					this.resultAnim(poke, ability.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					if (!poke.baseAbility) poke.baseAbility = effect.name;
					actions += '' + ofpoke.getName() + '\'s ' + ability.name + ' was taken over!';
					break;
				case 'roleplay':
					this.resultAnim(poke, ability.name, 'ability');
					actions += '' + poke.getName() + ' copied ' + ofpoke.getLowerName() + '\'s ' + ability.name + ' Ability!';
					ofpoke.markAbility(ability.name);
					break;
				case 'desolateland':
					if (kwargs.fail) {
						this.resultAnim(poke, ability.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
						actions += "The extremely harsh sunlight was not lessened at all!";
					}
					break;
				case 'primordialsea':
					if (kwargs.fail) {
						this.resultAnim(poke, ability.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
						actions += "There's no relief from this heavy rain!";
					}
					break;
				case 'deltastream':
					if (kwargs.fail) {
						this.resultAnim(poke, ability.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
						actions += "The mysterious strong winds blow on regardless!";
					}
					break;
				default:
					this.resultAnim(poke, ability.name, 'ability');
					actions += "" + poke.getName() + " acquired " + ability.name + "!";
					break;
				} else {
					this.resultAnim(poke, ability.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + ability.name + "!]</small>");
					switch (ability.id) {
					case 'airlock':
					case 'cloudnine':
						actions += "The effects of the weather disappeared.";
						break;
					case 'anticipation':
						actions += "" + poke.getName() + " shuddered!";
						break;
					case 'aurabreak':
						actions += "" + poke.getName() + " reversed all other Pokémon's auras!";
						break;
					case 'comatose':
						actions += "" + poke.getName() + " is drowsing!";
						break;
					case 'darkaura':
						actions += "" + poke.getName() + " is radiating a dark aura!";
						break;
					case 'fairyaura':
						actions += "" + poke.getName() + " is radiating a fairy aura!";
						break;
					case 'moldbreaker':
						actions += "" + poke.getName() + " breaks the mold!";
						break;
					case 'pressure':
						actions += "" + poke.getName() + " is exerting its pressure!";
						break;
					case 'sturdy':
						actions += "" + poke.getName() + " endured the hit!";
						break;
					case 'teravolt':
						actions += "" + poke.getName() + " is radiating a bursting aura!";
						break;
					case 'turboblaze':
						actions += "" + poke.getName() + " is radiating a blazing aura!";
						break;
					case 'unnerve':
						actions += "" + this.getSide(args[3]).getTeamName() + " is too nervous to eat Berries!";
						break;
					default:
						// Do nothing
					}
				}
				break;

			case '-endability':
				var poke = this.getPokemon(args[1]);
				var ability = Tools.getAbility(args[2]);
				var effect = Tools.getEffect(kwargs.from);
				poke.ability = '';

				if (kwargs.silent) {
					// do nothing
				} else if (ability.exists) {
					actions += "(" + poke.getName() + "'s " + ability.name + " was removed.)";
					this.resultAnim(poke, ability.name + ' removed', 'bad');
					if (!poke.baseAbility) poke.baseAbility = ability.name;
				} else {
					actions += "" + poke.getName() + "\'s Ability was suppressed!";
				}
				break;

			case '-transform':
				var poke = this.getPokemon(args[1]);
				var tpoke = this.getPokemon(args[2]);
				var effect = Tools.getEffect(kwargs.from);

				if (!kwargs.silent && effect.effectType === 'Ability') {
					this.resultAnim(poke, effect.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}

				actions += '' + poke.getName() + ' transformed into ' + tpoke.species + '!';
				poke.sprite.animTransform(tpoke);
				poke.boosts = $.extend({}, tpoke.boosts);
				poke.addVolatile('transform');
				poke.addVolatile('formechange'); // the formechange volatile reminds us to revert the sprite change on switch-out
				poke.copyTypesFrom(tpoke);
				poke.ability = tpoke.ability;
				poke.volatiles.formechange[2] = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[2] : tpoke.species);
				poke.volatiles.transform[2] = tpoke;
				for (var i = 0; i < tpoke.moveTrack.length; i++) {
					poke.markMove(tpoke.moveTrack[i][0], 0);
				}
				this.resultAnim(poke, 'Transformed', 'good');
				break;
			case '-formechange':
				var poke = this.getPokemon(args[1]);
				var template = Tools.getTemplate(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				var spriteData = {'shiny': poke.sprite.sp.shiny};
				var isCustomAnim = false;
				poke.removeVolatile('typeadd');
				poke.removeVolatile('typechange');

				if (kwargs.silent) {
					// do nothing
				} else {
					if (fromeffect.effectType === 'Ability') {
						this.resultAnim(poke, fromeffect.name, 'ability');
						this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						poke.markAbility(fromeffect.name);
					}
					if (kwargs.msg) {
						actions += "" + poke.getName() + " transformed!";
						if (toId(template.species) === 'shaymin') break;
					} else if (toId(template.species) === 'darmanitanzen') {
						actions += "Zen Mode triggered!";
					} else if (toId(template.species) === 'darmanitan') {
						actions += "Zen Mode ended!";
					} else if (toId(template.species) === 'aegislashblade') {
						actions += "Changed to Blade Forme!";
					} else if (toId(template.species) === 'aegislash') {
						actions += "Changed to Shield Forme!";
					} else if (toId(template.species) === 'wishiwashischool') {
						actions += "" + poke.getName() + " formed a school!";
						isCustomAnim = true;
					} else if (toId(template.species) === 'wishiwashi') {
						actions += "" + poke.getName() + " stopped schooling!";
						isCustomAnim = true;
					} else if (toId(template.species) === 'miniormeteor') {
						actions += "Shields Down deactivated!";
					} else if (toId(template.species) === 'minior') {
						actions += "Shields Down activated!";
					}
				}
				poke.sprite.animTransform($.extend(spriteData, template), isCustomAnim);
				poke.addVolatile('formechange'); // the formechange volatile reminds us to revert the sprite change on switch-out
				poke.volatiles.formechange[2] = template.species;
				poke.side.updateStatbar();
				break;
			case '-mega':
				var poke = this.getPokemon(args[1]);
				var item = Tools.getItem(args[3]);
				if (args[2] === 'Rayquaza') {
					actions += "" + Tools.escapeHTML(poke.side.name) + "'s fervent wish has reached " + poke.getLowerName() + "!";
				} else {
					poke.item = item.name;
					actions += "" + poke.getName() + "'s " + item.name + " is reacting to " + (this.gen >= 7 ? "the Key Stone" : Tools.escapeHTML(poke.side.name) + "'s Mega Bracelet") + "!";
				}
				actions += "<br />" + poke.getName() + " has Mega Evolved into Mega " + args[2] + "!";
				break;
			case '-primal':
				var poke = this.getPokemon(args[1]);
				actions += "" + poke.getName() + "'s Primal Reversion! It reverted to its primal state!";
				break;

			case '-start':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addVolatile(effect.id);

				if (effect.effectType === 'Ability') {
					this.resultAnim(poke, effect.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}
				if (kwargs.silent && effect.id !== 'typechange' && effect.id !== 'typeadd') {
					// do nothing
				} else switch (effect.id) {
				case 'typechange':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typechange[2] = args[3];
					poke.removeVolatile('typeadd');
					if (kwargs.silent) {
						poke.side.updateStatbar(poke);
						break;
					}
					if (fromeffect.id) {
						if (fromeffect.id === 'colorchange' || fromeffect.id === 'protean') {
							this.resultAnim(poke, fromeffect.name, 'ability');
							this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
							poke.markAbility(fromeffect.name);
							actions += "" + poke.getName() + " transformed into the " + args[3] + " type!";
						} else if (fromeffect.id === 'reflecttype') {
							poke.copyTypesFrom(ofpoke);
							if (!kwargs.silent) actions += "" + poke.getName() + "'s type became the same as " + ofpoke.getLowerName() + "'s type!";
						} else if (fromeffect.id === 'burnup') {
							actions += "" + poke.getName() + " burned itself out!";
						} else if (!kwargs.silent) {
							actions += "" + poke.getName() + "'s " + fromeffect.name + " made it the " + args[3] + " type!";
						}
					} else {
						actions += "" + poke.getName() + " transformed into the " + args[3] + " type!";
					}
					this.resultAnim(poke, args[3].split('/').map(function (type) {
						return '<img src="' + Tools.resourcePrefix + 'sprites/types/' + type + '.png" alt="' + type + '" />';
					}).join(' '), 'neutral');
					break;
				case 'typeadd':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typeadd[2] = args[3];
					if (kwargs.silent) break;
					actions += "" + args[3] + " type was added to " + poke.getLowerName() + "!";
					this.resultAnim(poke, '<img src="' + Tools.resourcePrefix + 'sprites/types/' + args[3] + '.png" alt="' + args[3] + '" />', 'neutral');
					break;
				case 'powertrick':
					this.resultAnim(poke, 'Power Trick', 'neutral');
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'foresight':
				case 'miracleeye':
					this.resultAnim(poke, 'Identified', 'bad');
					actions += "" + poke.getName() + " was identified!";
					break;
				case 'telekinesis':
					this.resultAnim(poke, 'Telekinesis', 'neutral');
					actions += "" + poke.getName() + " was hurled into the air!";
					break;
				case 'confusion':
					if (kwargs.already) {
						actions += "" + poke.getName() + " is already confused!";
					} else {
						if (!this.fastForward) BattleStatusAnims['confused'].anim(this, [poke.sprite]);
						this.resultAnim(poke, 'Confused', 'bad');
						if (kwargs.fatigue) {
							actions += "" + poke.getName() + " became confused due to fatigue!";
						} else {
							actions += "" + poke.getName() + " became confused!";
						}
					}
					break;
				case 'leechseed':
					poke.side.updateStatbar(poke);
					actions += '' + poke.getName() + ' was seeded!';
					break;
				case 'healblock':
					this.resultAnim(poke, 'Heal Block', 'bad');
					actions += "" + poke.getName() + " was prevented from healing!";
					break;
				case 'mudsport':
					this.resultAnim(poke, 'Mud Sport', 'neutral');
					actions += "Electricity's power was weakened!";
					break;
				case 'watersport':
					this.resultAnim(poke, 'Water Sport', 'neutral');
					actions += "Fire's power was weakened!";
					break;
				case 'yawn':
					this.resultAnim(poke, 'Drowsy', 'slp');
					actions += "" + poke.getName() + ' grew drowsy!';
					break;
				case 'flashfire':
					actions += 'The power of ' + poke.getLowerName() + '\'s Fire-type moves rose!';
					break;
				case 'taunt':
					this.resultAnim(poke, 'Taunted', 'bad');
					actions += '' + poke.getName() + ' fell for the taunt!';
					break;
				case 'imprison':
					this.resultAnim(poke, 'Imprisoning', 'good');
					actions += "" + poke.getName() + " sealed any moves its target shares with it!";
					break;
				case 'disable':
					if (fromeffect.effectType === 'Ability') {
						this.resultAnim(ofpoke, fromeffect.name, 'ability');
						this.message('', "<small>[" + ofpoke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						ofpoke.markAbility(fromeffect.name);
					}
					this.resultAnim(poke, 'Disabled', 'bad');
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " was disabled!";
					break;
				case 'embargo':
					this.resultAnim(poke, 'Embargo', 'bad');
					actions += "" + poke.getName() + " can't use items anymore!";
					break;
				case 'torment':
					this.resultAnim(poke, 'Tormented', 'bad');
					actions += '' + poke.getName() + ' was subjected to torment!';
					break;
				case 'ingrain':
					this.resultAnim(poke, 'Ingrained', 'good');
					actions += '' + poke.getName() + ' planted its roots!';
					break;
				case 'aquaring':
					this.resultAnim(poke, 'Aqua Ring', 'good');
					actions += '' + poke.getName() + ' surrounded itself with a veil of water!';
					break;
				case 'stockpile1':
					this.resultAnim(poke, 'Stockpile', 'good');
					actions += '' + poke.getName() + ' stockpiled 1!';
					break;
				case 'stockpile2':
					poke.removeVolatile('stockpile1');
					this.resultAnim(poke, 'Stockpile&times;2', 'good');
					actions += '' + poke.getName() + ' stockpiled 2!';
					break;
				case 'stockpile3':
					poke.removeVolatile('stockpile2');
					this.resultAnim(poke, 'Stockpile&times;3', 'good');
					actions += '' + poke.getName() + ' stockpiled 3!';
					break;
				case 'perish0':
					poke.removeVolatile('perish1');
					actions += '' + poke.getName() + "'s perish count fell to 0.";
					break;
				case 'perish1':
					poke.removeVolatile('perish2');
					this.resultAnim(poke, 'Perish next turn', 'bad');
					actions += '' + poke.getName() + "'s perish count fell to 1.";
					break;
				case 'perish2':
					poke.removeVolatile('perish3');
					this.resultAnim(poke, 'Perish in 2', 'bad');
					actions += '' + poke.getName() + "'s perish count fell to 2.";
					break;
				case 'perish3':
					this.resultAnim(poke, 'Perish in 3', 'bad');
					actions += '' + poke.getName() + "'s perish count fell to 3.";
					break;
				case 'encore':
					this.resultAnim(poke, 'Encored', 'bad');
					actions += '' + poke.getName() + ' received an encore!';
					break;
				case 'bide':
					this.resultAnim(poke, 'Bide', 'good');
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'slowstart':
					actions += "" + poke.getName() + " can't get it going!";
					break;
				case 'attract':
					if (fromeffect.effectType === 'Ability') {
						this.resultAnim(ofpoke, fromeffect.name, 'ability');
						this.message('', "<small>[" + ofpoke.getName(true) + "'s " + fromeffect.name + "!]</small>");
						ofpoke.markAbility(fromeffect.name);
					}
					this.resultAnim(poke, 'Attracted', 'bad');
					if (fromeffect.effectType === 'Item') {
						actions += "" + poke.getName() + " fell in love from the " + fromeffect.name + "!";
					} else {
						actions += "" + poke.getName() + " fell in love!";
					}
					break;
				case 'autotomize':
					this.resultAnim(poke, 'Lightened', 'good');
					actions += "" + poke.getName() + " became nimble!";
					break;
				case 'focusenergy':
					this.resultAnim(poke, '+Crit rate', 'good');
					if (fromeffect.effectType === 'Item') {
						actions += "" + poke.getName() + " used the " + fromeffect.name + " to get pumped!";
					} else if (kwargs.zeffect) {
						actions += "" + poke.getName() + " boosted its critical-hit ratio using its Z-Power!";
					} else {
						actions += "" + poke.getName() + " is getting pumped!";
					}
					break;
				case 'curse':
					this.resultAnim(poke, 'Cursed', 'bad');
					actions += "" + ofpoke.getName() + " cut its own HP and put a curse on " + poke.getLowerName() + "!";
					break;
				case 'nightmare':
					this.resultAnim(poke, 'Nightmare', 'bad');
					actions += "" + poke.getName() + " began having a nightmare!";
					break;
				case 'magnetrise':
					this.resultAnim(poke, 'Magnet Rise', 'good');
					actions += "" + poke.getName() + " levitated with electromagnetism!";
					break;
				case 'smackdown':
					this.resultAnim(poke, 'Smacked Down', 'bad');
					actions += "" + poke.getName() + " fell straight down!";
					poke.removeVolatile('magnetrise');
					poke.removeVolatile('telekinesis');
					if (poke.lastmove === 'fly' || poke.lastmove === 'bounce') poke.sprite.animReset();
					break;
				case 'substitute':
					if (kwargs.damage) {
						this.resultAnim(poke, 'Damage', 'bad');
						actions += "The substitute took damage for " + poke.getLowerName() + "!";
					} else if (kwargs.block) {
						this.resultAnim(poke, 'Blocked', 'neutral');
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
				case 'laserfocus':
					actions += '' + poke.getName() + ' concentrated intensely!';
					break;
				case 'followme':
				case 'ragepowder': // Deprecated, now uses -singleturn
					actions += '' + poke.getName() + ' became the center of attention!';
					break;
				case 'powder': // Deprecated, now uses -singleturn
					actions += '' + poke.getName() + ' is covered in powder!';
					break;

				// Gen 1
				case 'lightscreen':
					this.resultAnim(poke, 'Light Screen', 'good');
					actions += '' + poke.getName() + '\'s protected against special attacks!';
					break;
				case 'reflect':
					this.resultAnim(poke, 'Reflect', 'good');
					actions += '' + poke.getName() + ' gained armor!';
					break;

				default:
					actions += "" + poke.getName() + "'s " + effect.name + " started!";
				}
				poke.side.updateStatbar();
				break;
			case '-end':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.removeVolatile(effect.id);

				if (kwargs.silent) {
					// do nothing
				} else switch (effect.id) {
				case 'powertrick':
					this.resultAnim(poke, 'Power Trick', 'neutral');
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'telekinesis':
					this.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral');
					actions += "" + poke.getName() + " was freed from the telekinesis!";
					break;
				case 'skydrop':
					if (kwargs.interrupt) {
						poke.sprite.anim({time: 100});
					}
					actions += "" + poke.getName() + " was freed from the Sky Drop!";
					break;
				case 'confusion':
					this.resultAnim(poke, 'Confusion&nbsp;ended', 'good');
					if (!kwargs.silent) {
						if (fromeffect.effectType === 'Item') {
							actions += "" + poke.getName() + "'s " + fromeffect.name + " snapped it out of its confusion!";
							break;
						}
						if (poke.side.n === 0) actions += "" + poke.getName() + " snapped out of its confusion.";
						else actions += "" + poke.getName() + " snapped out of confusion!";
					}
					break;
				case 'leechseed':
					if (fromeffect.id === 'rapidspin') {
						this.resultAnim(poke, 'De-seeded', 'good');
						actions += "" + poke.getName() + " was freed from Leech Seed!";
					}
					break;
				case 'healblock':
					this.resultAnim(poke, 'Heal Block ended', 'good');
					actions += "" + poke.getName() + "'s Heal Block wore off!";
					break;
				case 'attract':
					this.resultAnim(poke, 'Attract&nbsp;ended', 'good');
					if (fromeffect.id === 'oblivious') {
						actions += '' + poke.getName() + " got over its infatuation.";
					}
					if (fromeffect.id === 'mentalherb') {
						actions += "" + poke.getName() + " cured its infatuation status using its " + fromeffect.name + "!";
					}
					break;
				case 'taunt':
					this.resultAnim(poke, 'Taunt&nbsp;ended', 'good');
					actions += '' + poke.getName() + "'s taunt wore off!";
					break;
				case 'disable':
					this.resultAnim(poke, 'Disable&nbsp;ended', 'good');
					actions += '' + poke.getName() + "'s move is no longer disabled!";
					break;
				case 'embargo':
					this.resultAnim(poke, 'Embargo ended', 'good');
					actions += "" + poke.getName() + " can use items again!";
					break;
				case 'torment':
					this.resultAnim(poke, 'Torment&nbsp;ended', 'good');
					actions += '' + poke.getName() + "'s torment wore off!";
					break;
				case 'encore':
					this.resultAnim(poke, 'Encore&nbsp;ended', 'good');
					actions += '' + poke.getName() + "'s encore ended!";
					break;
				case 'bide':
					if (!this.fastForward) BattleOtherAnims.bideunleash.anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " unleashed its energy!";
					break;
				case 'illusion':
					this.resultAnim(poke, 'Illusion ended', 'bad');
					actions += "" + poke.getName() + "'s illusion wore off!";
					poke.markAbility('Illusion');
					break;
				case 'slowstart':
					this.resultAnim(poke, 'Slow Start ended', 'good');
					actions += "" + poke.getName() + " finally got its act together!";
					break;
				case 'magnetrise':
					if (poke.side.n === 0) actions += "" + poke.getName() + "'s electromagnetism wore off!";
					else actions += "The electromagnetism of " + poke.getLowerName() + " wore off!";
					break;
				case 'perishsong': // for backwards compatibility
					poke.removeVolatile('perish3');
					break;
				case 'substitute':
					poke.sprite.animSubFade();
					this.resultAnim(poke, 'Faded', 'bad');
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
				case 'bind':
				case 'wrap':
				case 'clamp':
				case 'whirlpool':
				case 'firespin':
				case 'magmastorm':
				case 'sandtomb':
				case 'infestation':
					actions += '' + poke.getName() + ' was freed from ' + effect.name + '!';
					break;
				default:
					if (effect.effectType === 'Move') {
						if (effect.name === 'Doom Desire') {
							BattleOtherAnims.doomdesirehit.anim(this, [poke.sprite]);
						}
						if (effect.name === 'Future Sight') {
							BattleOtherAnims.futuresighthit.anim(this, [poke.sprite]);
						}
						actions += '' + poke.getName() + " took the " + effect.name + " attack!";
					} else {
						actions += "" + poke.getName() + "'s " + effect.name + " ended!";
					}
				}
				poke.side.updateStatbar();
				break;
			case '-singleturn':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addTurnstatus(effect.id);

				switch (effect.id) {
				case 'roost':
					this.resultAnim(poke, 'Landed', 'neutral');
					//actions += '' + poke.getName() + ' landed on the ground!';
					break;
				case 'quickguard':
					this.resultAnim(poke, 'Quick Guard', 'good');
					actions += "Quick Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'wideguard':
					this.resultAnim(poke, 'Wide Guard', 'good');
					actions += "Wide Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'craftyshield':
					this.resultAnim(poke, 'Crafty Shield', 'good');
					actions += "Crafty Shield protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'matblock':
					this.resultAnim(poke, 'Mat Block', 'good');
					actions += '' + poke.getName() + ' intends to flip up a mat and block incoming attacks!';
					break;
				case 'protect':
					this.resultAnim(poke, 'Protected', 'good');
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'endure':
					this.resultAnim(poke, 'Enduring', 'good');
					actions += '' + poke.getName() + ' braced itself!';
					break;
				case 'helpinghand':
					this.resultAnim(poke, 'Helping Hand', 'good');
					actions += '' + ofpoke.getName() + " is ready to help " + poke.getLowerName() + "!";
					break;
				case 'focuspunch':
					this.resultAnim(poke, 'Focusing', 'neutral');
					actions += '' + poke.getName() + ' is tightening its focus!';
					poke.markMove(effect.name, 0);
					break;
				case 'shelltrap':
					this.resultAnim(poke, 'Trap set', 'neutral');
					actions += '' + poke.getName() + ' set a shell trap!';
					poke.markMove(effect.name, 0);
					break;
				case 'snatch':
					actions += '' + poke.getName() + ' waits for a target to make a move!';
					break;
				case 'magiccoat':
					actions += '' + poke.getName() + ' shrouded itself with Magic Coat!';
					break;
				case 'electrify':
					actions += '' + poke.getName() + '\'s moves have been electrified!';
					break;
				case 'followme':
				case 'ragepowder':
				case 'spotlight':
					if (kwargs.zeffect) {
						actions += '' + poke.getName() + ' became the center of attention using its Z-Power!';
					} else {
						actions += '' + poke.getName() + ' became the center of attention!';
					}
					break;
				case 'powder':
					actions += '' + poke.getName() + ' is covered in powder!';
					break;
				case 'instruct':
					actions += '' + poke.getName() + ' used the move instructed by ' + ofpoke.getLowerName() + '!';
					break;
				case 'beakblast':
					if (!this.fastForward) BattleOtherAnims.bidecharge.anim(this, [poke.sprite]);
					this.resultAnim(poke, 'Beak Blast', 'neutral');
					actions += '' + poke.getName() + ' started heating up its beak!';
					break;
				}
				poke.side.updateStatbar();
				break;
			case '-singlemove':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addMovestatus(effect.id);

				switch (effect.id) {
				case 'grudge':
					this.resultAnim(poke, 'Grudge', 'neutral');
					actions += '' + poke.getName() + ' wants its target to bear a grudge!';
					break;
				case 'destinybond':
					this.resultAnim(poke, 'Destiny Bond', 'neutral');
					actions += '' + poke.getName() + ' is hoping to take its attacker down with it!';
					break;
				}
				break;

			case '-activate':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				if (effect.effectType === 'Ability') {
					this.resultAnim(poke, effect.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + effect.name + "!]</small>");
					poke.markAbility(effect.name);
				}
				switch (effect.id) {
				case 'healreplacement':
					actions += "" + poke.getName() + " will restore its replacement's HP using its Z-Power!";
					break;
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
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " lost all of its PP due to the grudge!";
					poke.markMove(args[3], Infinity);
					break;
				case 'quickguard':
					poke.addTurnstatus('quickguard');
					this.resultAnim(poke, 'Quick Guard', 'good');
					actions += "Quick Guard protected " + poke.getLowerName() + "!";
					break;
				case 'wideguard':
					poke.addTurnstatus('wideguard');
					this.resultAnim(poke, 'Wide Guard', 'good');
					actions += "Wide Guard protected " + poke.getLowerName() + "!";
					break;
				case 'craftyshield':
					poke.addTurnstatus('craftyshield');
					this.resultAnim(poke, 'Crafty Shield', 'good');
					actions += "Crafty Shield protected " + poke.getLowerName() + "!";
					break;
				case 'protect':
					poke.addTurnstatus('protect');
					this.resultAnim(poke, 'Protected', 'good');
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'substitute':
					if (kwargs.damage) {
						this.resultAnim(poke, 'Damage', 'bad');
						actions += 'The substitute took damage for ' + poke.getLowerName() + '!';
					} else if (kwargs.block) {
						this.resultAnim(poke, 'Blocked', 'neutral');
						actions += '' + poke.getName() + "'s Substitute blocked " + Tools.getMove(kwargs.block || args[3]).name + '!';
					}
					break;
				case 'attract':
					if (!this.fastForward) BattleStatusAnims['attracted'].anim(this, [poke.sprite]);
					actions += '' + poke.getName() + ' is in love with ' + ofpoke.getLowerName() + '!';
					break;
				case 'bide':
					if (!this.fastForward) BattleOtherAnims.bidecharge.anim(this, [poke.sprite]);
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'mist':
					actions += "" + poke.getName() + " is protected by the mist!";
					break;
				case 'safeguard':
					actions += "" + poke.getName() + " is protected by Safeguard!";
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
				case 'aromatherapy':
					this.resultAnim(poke, 'Team Cured', 'good');
					actions += 'A soothing aroma wafted through the area!';
					break;
				case 'healbell':
					this.resultAnim(poke, 'Team Cured', 'good');
					actions += 'A bell chimed!';
					break;
				case 'trick':
				case 'switcheroo':
					actions += '' + poke.getName() + ' switched items with its target!';
					break;
				case 'brickbreak':
					actions += poke.getName() + " shattered " + ofpoke.getTeamName() + " protections!";
					ofpoke.removeSideCondition('Reflect');
					ofpoke.removeSideCondition('LightScreen');
					break;
				case 'beatup':
					actions += "" + Tools.escapeHTML(kwargs.of) + "'s attack!";
					break;
				case 'pursuit':
					actions += "(" + poke.getName() + " is being withdrawn!)";
					break;
				case 'hyperspacefury':
				case 'hyperspacehole':
				case 'phantomforce':
				case 'shadowforce':
				case 'feint':
					this.resultAnim(poke, 'Protection broken', 'bad');
					if (kwargs.broken) {
						actions += "It broke through " + poke.getLowerName() + "'s protection!";
					} else {
						actions += "" + poke.getName() + " fell for the feint!";
					}
					poke.removeTurnstatus('protect');
					for (var k = 0; k < poke.side.pokemon.length; k++) {
						poke.side.pokemon[k].removeTurnstatus('wideguard');
						poke.side.pokemon[k].removeTurnstatus('quickguard');
						poke.side.pokemon[k].removeTurnstatus('craftyshield');
						poke.side.pokemon[k].removeTurnstatus('matblock');
						poke.side.updateStatbar(poke.side.pokemon[k]);
					}
					break;
				case 'spite':
					var move = Tools.getMove(args[3]).name;
					var pp = Tools.escapeHTML(args[4]);
					actions += "It reduced the PP of " + poke.getLowerName() + "'s " + move + " by " + pp + "!";
					poke.markMove(move, Number(pp));
					break;
				case 'gravity':
					actions += "" + poke.getName() + " couldn't stay airborne because of gravity!";
					poke.removeVolatile('magnetrise');
					poke.removeVolatile('telekinesis');
					poke.sprite.anim({time: 100});
					break;
				case 'magnitude':
					actions += "Magnitude " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'sketch':
					actions += "" + poke.getName() + " sketched " + Tools.escapeHTML(args[3]) + "!";
					break;
				case 'skillswap':
					actions += "" + poke.getName() + " swapped Abilities with its target!";
					if (this.gen <= 4) break;
					var pokeability = Tools.escapeHTML(args[3]) || ofpoke.ability;
					var ofpokeability = Tools.escapeHTML(args[4]) || poke.ability;
					if (pokeability) {
						poke.ability = pokeability;
						if (!ofpoke.baseAbility) ofpoke.baseAbility = pokeability;
					}
					if (ofpokeability) {
						ofpoke.ability = ofpokeability;
						if (!poke.baseAbility) poke.baseAbility = ofpokeability;
					}
					if (poke.side !== ofpoke.side) {
						this.resultAnim(poke, pokeability, 'ability');
						this.resultAnim(ofpoke, ofpokeability, 'ability');
						actions += "<br />" + poke.getName() + " acquired " + pokeability + "!";
						actions += "<br />" + ofpoke.getName() + " acquired " + ofpokeability + "!";
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
					actions += '' + ofpoke.getName() + ' clamped down on ' + poke.getLowerName() + '!';
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
					actions += '' + poke.getName() + ' became trapped by the quicksand!';
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
				case 'speedswap':
					actions += '' + poke.getName() + ' switched Speed with its target!';
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
				case 'lockon':
				case 'mindreader':
					actions += '' + poke.getName() + ' took aim at ' + ofpoke.getLowerName() + '!';
					break;
				case 'endure':
					actions += '' + poke.getName() + ' endured the hit!';
					break;
				case 'electricterrain':
					actions += '' + poke.getName() + ' surrounds itself with electrified terrain!';
					break;
				case 'mistyterrain':
					actions += '' + poke.getName() + ' surrounds itself with a protective mist!';
					break;
				case 'psychicterrain':
					actions += '' + poke.getName() + ' surrounds itself with psychic terrain!';
					break;

				// ability activations
				case 'magicbounce':
				case 'magiccoat':
				case 'rebound':
					break;
				case 'wonderguard': // Deprecated, now uses -immune
					this.resultAnim(poke, 'Immune', 'neutral');
					actions += '' + poke.getName() + '\'s Wonder Guard evades the attack!';
					break;
				case 'forewarn':
					if (this.gen >= 5) {
						actions += "It was alerted to " + ofpoke.getLowerName() + "'s " + Tools.escapeHTML(args[3]) + "!";
						ofpoke.markMove(args[3], 0);
					} else {
						actions += "" + poke.getName() + "'s Forewarn alerted it to " + Tools.escapeHTML(args[3]) + "!";
						if (poke.side.foe.active.length === 1) {
							poke.side.foe.active[0].markMove(args[3], 0);
						}
					}
					break;
				case 'mummy':
					var ability = Tools.getAbility(args[3]);
					this.resultAnim(ofpoke, ability.name, 'ability');
					this.animationDelay += 700;
					this.message('', "<small>[" + ofpoke.getName(true) + "'s " + ability.name + "!]</small>");
					ofpoke.markAbility(ability.name);
					this.resultAnim(ofpoke, 'Mummy', 'ability');
					this.message('', "<small>[" + ofpoke.getName(true) + "'s Mummy!]</small>");
					ofpoke.markAbility('Mummy', true);
					actions += "" + ofpoke.getName() + "'s Ability became Mummy!";
					break;
				case 'anticipation': // Deprecated, now uses -ability. This is for replay compatability
					actions += "" + poke.getName() + " shuddered!";
					break;
				case 'lightningrod':
				case 'stormdrain':
					actions += '' + poke.getName() + ' took the attack!';
					break;
				case 'telepathy':
					actions += "" + poke.getName() + " avoids attacks by its ally Pok&#xE9;mon!";
					break;
				case 'stickyhold':
					actions += "" + poke.getName() + "'s item cannot be removed!";
					break;
				case 'suctioncups':
					actions += '' + poke.getName() + ' anchors itself!';
					break;
				case 'symbiosis':
					actions += '' + poke.getName() + ' shared its ' + Tools.getItem(args[3]).name + ' with ' + ofpoke.getLowerName() + '!';
					break;
				case 'aromaveil':
					actions += '' + ofpoke.getName() + ' is protected by an aromatic veil!';
					break;
				case 'flowerveil':
					actions += '' + ofpoke.getName() + ' surrounded itself with a veil of petals!';
					break;
				case 'sweetveil':
					actions += '' + ofpoke.getName() + ' surrounded itself with a veil of sweetness!';
					break;
				case 'battlebond':
					actions += '' + poke.getName() + ' became fully charged due to its bond with its Trainer!';
					break;
				case 'disguise':
					actions += 'Its disguise served it as a decoy!';
					break;
				case 'powerconstruct':
					actions += 'You sense the presence of many!';
					break;

				// weather activations
				case 'deltastream':
					actions += "The mysterious strong winds weakened the attack!";
					break;

				// item activations
				case 'custapberry':
				case 'quickclaw':
					//actions += '' + poke.getName() + ' is already preparing its next move!';
					actions += '' + poke.getName() + '\'s ' + effect.name + ' let it move first!';
					break;
				case 'leppaberry':
					actions += '' + poke.getName() + " restored PP to its " + Tools.escapeHTML(args[3]) + " move using Leppa Berry!";
					break;
				case 'focusband':
					poke.item = 'Focus Band';
					actions += '' + poke.getName() + " hung on using its Focus Band!";
					break;
				case 'safetygoggles':
					poke.item = 'Safety Goggles';
					actions += '' + poke.getName() + " is not affected by " + Tools.escapeHTML(args[3]) + " thanks to its Safety Goggles!";
					break;
				default:
					if (kwargs.broken) { // for custom moves that break protection
						this.resultAnim(poke, 'Protection broken', 'bad');
						actions += "It broke through " + poke.getLowerName() + "'s protection!";
					} else if (effect.effectType !== 'Ability') {
						actions += "" + poke.getName() + "'s " + effect.name + " activated!";
					}
				}
				break;

			case '-sidestart':
				var side = this.getSide(args[1]);
				var effect = Tools.getEffect(args[2]);
				side.addSideCondition(effect);

				switch (effect.id) {
				case 'stealthrock':
					actions += "Pointed stones float in the air around " + side.getLowerTeamName() + "!";
					break;
				case 'spikes':
					actions += "Spikes were scattered on the ground all around " + side.getLowerTeamName() + "!";
					break;
				case 'toxicspikes':
					actions += "Poison spikes were scattered on the ground all around " + side.getLowerTeamName() + "!";
					break;
				case 'stickyweb':
					actions += "A sticky web spreads out on the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'tailwind':
					actions += "The Tailwind blew from behind " + side.getLowerTeamName() + "!";
					this.updateWeather();
					break;
				case 'auroraveil':
					actions += "Aurora Veil made " + side.getLowerTeamName() + " stronger against physical and special moves!";
					this.updateWeather();
					break;
				case 'reflect':
					actions += "Reflect made " + side.getLowerTeamName() + " stronger against physical moves!";
					this.updateWeather();
					break;
				case 'lightscreen':
					actions += "Light Screen made " + side.getLowerTeamName() + " stronger against special moves!";
					this.updateWeather();
					break;
				case 'safeguard':
					actions += "" + side.getTeamName() + " cloaked itself in a mystical veil!";
					this.updateWeather();
					break;
				case 'mist':
					actions += "" + side.getTeamName() + " became shrouded in mist!";
					this.updateWeather();
					break;
				case 'luckychant':
					actions += 'Lucky Chant shielded ' + side.getLowerTeamName() + ' from critical hits!';
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
					actions += "The spikes disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'toxicspikes':
					actions += "The poison spikes disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'stickyweb':
					actions += "The sticky web has disappeared from the ground around " + side.getLowerTeamName() + "!";
					break;
				case 'tailwind':
					actions += "" + side.getTeamName() + "'s Tailwind petered out!";
					break;
				case 'auroraveil':
					actions += "" + side.getTeamName() + "'s Aurora Veil wore off!";
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
				var ability = Tools.getEffect(kwargs.from);
				this.changeWeather(effect.name, poke, kwargs.upkeep, ability);
				break;

			case '-fieldstart':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				if (fromeffect && fromeffect.effectType === 'Ability') {
					this.resultAnim(poke, fromeffect.name, 'ability');
					this.message('', "<small>[" + poke.getName(true) + "'s " + fromeffect.name + "!]</small>");
					poke.markAbility(fromeffect.name);
				}
				var maxTimeLeft = 0;
				if (effect.id in {'electricterrain': 1, 'grassyterrain': 1, 'mistyterrain': 1, 'psychicterrain': 1}) {
					for (var i = this.pseudoWeather.length - 1; i >= 0; i--) {
						var pwName = this.pseudoWeather[i][0];
						if (pwName === 'Electric Terrain' || pwName === 'Grassy Terrain' || pwName === 'Misty Terrain' || pwName === 'Psychic Terrain') {
							this.pseudoWeather.splice(i, 1);
							continue;
						}
					}
					if (this.gen > 6) maxTimeLeft = 8;
				}
				this.addPseudoWeather(effect.name, 5, maxTimeLeft);

				switch (effect.id) {
				case 'trickroom':
					actions += "" + poke.getName() + ' twisted the dimensions!';
					break;
				case 'wonderroom':
					actions += "It created a bizarre area in which Defense and Sp. Def stats are swapped!";
					break;
				case 'magicroom':
					actions += "It created a bizarre area in which Pok&#xE9;mon's held items lose their effects!";
					break;
				case 'gravity':
					if (!this.fastForward) {
						for (var i = 0; i < this.mySide.active.length; i++) {
							if (this.mySide.active[i]) {
								BattleOtherAnims.gravity.anim(this, [this.mySide.active[i].sprite]);
							}
							if (this.yourSide.active[i]) {
								BattleOtherAnims.gravity.anim(this, [this.yourSide.active[i].sprite]);
							}
						}
					}
					actions += "Gravity intensified!";
					break;
				case 'mudsport':
					actions += "Electricity's power was weakened!";
					break;
				case 'watersport':
					actions += "Fire's power was weakened!";
					break;
				case 'grassyterrain':
					actions += "Grass grew to cover the battlefield!";
					break;
				case 'mistyterrain':
					actions += "Mist swirls around the battlefield!";
					break;
				case 'electricterrain':
					actions += "An electric current runs across the battlefield!";
					break;
				case 'psychicterrain':
					actions += "The battlefield got weird!";
					break;
				default:
					actions += effect.name + " started!";
					break;
				}
				break;

			case '-fieldend':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				this.removePseudoWeather(effect.name, poke);

				switch (effect.id) {
				case 'trickroom':
					actions += 'The twisted dimensions returned to normal!';
					break;
				case 'wonderroom':
					actions += 'Wonder Room wore off, and Defense and Sp. Def stats returned to normal!';
					break;
				case 'magicroom':
					actions += "Magic Room wore off, and held items' effects returned to normal!";
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
				case 'grassyterrain':
					actions += "The grass disappeared from the battlefield.";
					break;
				case 'mistyterrain':
					actions += "The mist disappeared from the battlefield.";
					break;
				case 'electricterrain':
					actions += "The electricity disappeared from the battlefield.";
					break;
				case 'psychicterrain':
					actions += "The weirdness disappeared from the battlefield!";
					break;
				default:
					actions += effect.name + " ended!";
					break;
				}
				break;

			case '-fieldactivate':
				var effect = Tools.getEffect(args[1]);
				switch (effect.id) {
				case 'perishsong':
					actions += 'All Pok&#xE9;mon that heard the song will faint in three turns!';
					this.mySide.updateStatbar();
					this.yourSide.updateStatbar();
					break;
				case 'payday':
					actions += 'Coins were scattered everywhere!';
					break;
				case 'iondeluge':
					actions += 'A deluge of ions showers the battlefield!';
					break;
				default:
					actions += '' + effect.name + ' hit!';
					break;
				}
				break;

			case '-message':
				actions += Tools.escapeHTML(args[1]);
				break;

			case '-anim':
				var poke = this.getPokemon(args[1]);
				var move = Tools.getMove(args[2]);
				if (this.checkActive(poke)) return;
				poke2 = this.getPokemon(args[3]);
				poke.sprite.beforeMove();
				kwargs.silent = true;
				this.useMove(poke, move, poke2, kwargs);
				poke.sprite.afterMove();
				break;

			case '-hint':
				this.message('', '<small>(' + Tools.escapeHTML(args[1]) + ')</small>');
				break;

			default:
				this.logConsole('Unknown minor: ' + args[0]);
				if (this.errorCallback) this.errorCallback(this);
				break;
			}
		}
		if (actions) {
			this.message('<small>' + actions + '</small>', '');
		}
	};
	/*
	Battle.prototype.parseSpriteData = function (name) {
		var siden = 0,
			foe = false;
		while (true) {
			if (name.substr(0, 6) === 'foeof-') {
				foe = true;
				name = name.substr(6);
			} else if (name.substr(0, 9) === 'switched-') name = name.substr(9);
			else if (name.substr(0, 9) === 'existing-') name = name.substr(9);
			else if (name.substr(0, 4) === 'foe-') {
				siden = this.p2.n;
				name = name.substr(4);
			} else if (name.substr(0, 5) === 'ally-') {
				siden = this.p1.n;
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
	};
	*/
	Battle.prototype.parseDetails = function (name, pokemonid, details, output) {
		if (!output) output = {};
		if (!details) details = "";
		output.details = details;
		output.name = name;
		output.species = name;
		output.level = 100;
		output.shiny = false;
		output.gender = '';
		output.ident = (name ? pokemonid : '');
		output.searchid = (name ? (pokemonid + '|' + details) : '');
		var splitDetails = details.split(', ');
		if (splitDetails[splitDetails.length - 1] === 'shiny') {
			output.shiny = true;
			splitDetails.pop();
		}
		if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
			output.gender = splitDetails[splitDetails.length - 1];
			splitDetails.pop();
		}
		if (splitDetails[1]) {
			output.level = parseInt(splitDetails[1].substr(1), 10) || 100;
		}
		if (splitDetails[0]) {
			output.species = splitDetails[0];
		}
		return output;
	};
	Battle.prototype.parseHealth = function (hpstring, output) {
		if (!output) output = {};
		var hp = hpstring.split(' ');
		var status = hp[1];
		hp = hp[0];

		// hp parse
		output.hpcolor = '';
		if (hp === '0' || hp === '0.0') {
			output.hp = 0;
			output.zerohp = true;
		} else if (hp.indexOf('/') > 0) {
			var hp = hp.split('/');
			if (isNaN(parseFloat(hp[0])) || isNaN(parseFloat(hp[1]))) {
				return false;
			}
			output.hp = parseFloat(hp[0]);
			output.maxhp = parseFloat(hp[1]);
			if (output.hp > output.maxhp) output.hp = output.maxhp;
			var colorchar = hp[1].substr(hp[1].length - 1);
			if ((colorchar === 'y') || (colorchar === 'g')) {
				output.hpcolor = colorchar;
			}
			if (!output.hp) {
				output.zerohp = true;
			}
		} else if (!isNaN(parseFloat(hp))) {
			output.hp = output.maxhp * parseFloat(hp) / 100;
		}

		// status parse
		if (!status) {
			output.status = '';
		} else if (status === 'par' || status === 'brn' || status === 'slp' || status === 'frz' || status === 'tox') {
			output.status = status;
		} else if (status === 'psn' && output.status !== 'tox') {
			output.status = status;
		} else if (status === 'fnt') {
			output.hp = 0;
			output.zerohp = true;
			output.fainted = true;
		}
		return output;
	};
	Battle.prototype.getPokemon = function (pokemonid, details) {
		var isNew = false; // if true, don't match any pokemon that already exists (for Team Preview)
		var isSwitch = false; // if true, don't match an active, fainted, or immediately-previously switched-out pokemon
		var isInactive = false; // if true, don't match an active pokemon
		var createIfNotFound = false; // if true, create the pokemon if a match wasn't found

		if (pokemonid === undefined || pokemonid === '??') return null;
		if (pokemonid.substr(0, 5) === 'new: ') {
			pokemonid = pokemonid.substr(5);
			isNew = true;
			createIfNotFound = true; // obviously
		}
		if (pokemonid.substr(0, 10) === 'switchin: ') {
			pokemonid = pokemonid.substr(10);
			isSwitch = true;
			createIfNotFound = true;
		}

		var name = pokemonid;

		var siden = -1;
		var slot = -1; // if there is an explicit slot for this pokemon
		var slotChart = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5};
		if (name.substr(0, 4) === 'p2: ' || name === 'p2') {
			siden = this.p2.n;
			name = name.substr(4);
		} else if (name.substr(0, 4) === 'p1: ' || name === 'p1') {
			siden = this.p1.n;
			name = name.substr(4);
		} else if (name.substr(0, 2) === 'p2' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p2.n;
			name = name.substr(5);
			pokemonid = 'p2: ' + name;
		} else if (name.substr(0, 2) === 'p1' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p1.n;
			name = name.substr(5);
			pokemonid = 'p1: ' + name;
		}

		if (!details) {
			if (siden < 0) return null;
			if (this.sides[siden].active[slot]) return this.sides[siden].active[slot];
			if (slot >= 0) isInactive = true;
		}

		var searchid = '';
		if (details) searchid = pokemonid + '|' + details;

		// search p1's pokemon
		if (siden !== this.p2.n && !isNew) {
			if (this.p1.active[slot] && this.p1.active[slot].searchid === searchid && !isSwitch) {
				this.p1.active[slot].slot = slot;
				return this.p1.active[slot];
			}
			for (var i = 0; i < this.p1.pokemon.length; i++) {
				var pokemon = this.p1.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p1.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon == this.p1.lastPokemon && !this.p1.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!pokemon.searchid && pokemon.checkDetails(details)) || // switch-in matches Team Preview entry
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (!pokemon.searchid && createIfNotFound) {
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = this.p1.newPokemon(this.parseDetails(name, pokemonid, details), i);
						}
					}
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		// search p2's pokemon
		if (siden !== this.p1.n && !isNew) {
			if (this.p2.active[slot] && this.p2.active[slot].searchid === searchid && !isSwitch) {
				if (slot >= 0) this.p2.active[slot].slot = slot;
				return this.p2.active[slot];
			}
			for (var i = 0; i < this.p2.pokemon.length; i++) {
				var pokemon = this.p2.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p2.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon == this.p2.lastPokemon && !this.p2.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!pokemon.searchid && pokemon.checkDetails(details)) || // switch-in matches Team Preview entry
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (!pokemon.searchid && createIfNotFound) {
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = this.p2.newPokemon(this.parseDetails(name, pokemonid, details), i);
						}
					}
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		if (!details || !createIfNotFound) return false;

		// pokemon not found, create a new pokemon object for it

		if (siden < 0) throw new Error("Invalid pokemonid passed to getPokemon");

		var species = name;
		var gender = '';
		var level = 100;
		var shiny = false;
		if (details) {
			var splitDetails = details.split(', ');
			if (splitDetails[splitDetails.length - 1] === 'shiny') {
				shiny = true;
				splitDetails.pop();
			}
			if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
				gender = splitDetails[splitDetails.length - 1];
				splitDetails.pop();
			}
			if (splitDetails[1]) {
				level = parseInt(splitDetails[1].substr(1), 10) || 100;
			}
			if (splitDetails[0]) {
				species = splitDetails[0];
			}
		}
		if (slot < 0) slot = 0;
		var pokemon = this.sides[siden].newPokemon({
			species: species,
			details: details,
			name: name,
			ident: (name ? pokemonid : ''),
			searchid: (name ? (pokemonid + '|' + details) : ''),
			level: level,
			gender: gender,
			shiny: shiny,
			slot: slot
		});
		return pokemon;
	};
	Battle.prototype.getSide = function (sidename) {
		if (sidename === 'p1' || sidename.substr(0, 3) === 'p1:') return this.p1;
		if (sidename === 'p2' || sidename.substr(0, 3) === 'p2:') return this.p2;
		if (this.mySide.id == sidename) return this.mySide;
		if (this.yourSide.id == sidename) return this.yourSide;
		if (this.mySide.name == sidename) return this.mySide;
		if (this.yourSide.name == sidename) return this.yourSide;
		return {
			name: sidename,
			id: sidename.replace(/ /g, '')
		};
	};

	Battle.prototype.add = function (command, fastForward) {
		if (this.playbackState === 0) {
			this.playbackState = 1;
			this.activityQueue.push(command);
		} else if (this.playbackState === 4) {
			this.playbackState = 2;
			this.paused = false;
			this.activityQueue.push(command);
			this.activityQueueActive = true;
			this.soundStart();
			if (fastForward) {
				this.fastForwardTo(-1);
			} else {
				this.nextActivity();
			}
		} else {
			this.activityQueue.push(command);
		}
	};
	Battle.prototype.instantAdd = function (command) {
		this.run(command, true);
		this.preemptActivityQueue.push(command);
		this.add(command);
	};
	Battle.prototype.teamPreview = function (start) {
		for (var k = 0; k < 2; k++) {
			var textBuf = '';
			var buf = '';
			var buf2 = '';
			this.spriteElems[k].empty();
			if (!start) {
				this.sides[k].updateSprites();
				continue;
			}
			for (var i = 0; i < this.sides[k].pokemon.length; i++) {
				var pokemon = this.sides[k].pokemon[i];

				var spriteData = Tools.getSpriteData(pokemon, k, {
					afd: this.tier === "[Seasonal] Fools Festival",
					gen: this.gen
				});
				var y = 0;
				var x = 0;
				if (k) {
					y = 48 + 50 + 3 * (i + 6 - this.sides[k].pokemon.length);
					x = 48 + 180 + 50 * (i + 6 - this.sides[k].pokemon.length);
				} else {
					y = 48 + 200 + 3 * i;
					x = 48 + 100 + 50 * i;
				}
				if (textBuf) textBuf += ' / ';
				textBuf += pokemon.species;
				var url = spriteData.url;
				// if (this.paused) url.replace('/xyani', '/xy').replace('.gif', '.png');
				buf += '<img src="' + url + '" width="' + spriteData.w + '" height="' + spriteData.h + '" style="position:absolute;top:' + Math.floor(y - spriteData.h / 2) + 'px;left:' + Math.floor(x - spriteData.w / 2) + 'px" />';
				buf2 += '<div style="position:absolute;top:' + (y + 45) + 'px;left:' + (x - 40) + 'px;width:80px;font-size:10px;text-align:center;color:#FFF;">';
				if (pokemon.gender === 'F') {
					buf2 += '<img src="' + Tools.resourcePrefix + 'fx/gender-f.png" width="7" height="10" alt="F" style="margin-bottom:-1px" /> ';
				} else if (pokemon.gender === 'M') {
					buf2 += '<img src="' + Tools.resourcePrefix + 'fx/gender-m.png" width="7" height="10" alt="M" style="margin-bottom:-1px" /> ';
				}
				if (pokemon.level !== 100) {
					buf2 += '<span style="text-shadow:#000 1px 1px 0,#000 1px -1px 0,#000 -1px 1px 0,#000 -1px -1px 0"><small>L</small>' + pokemon.level + '</span>';
				}
				if (pokemon.item) {
					buf2 += ' <img src="' + Tools.resourcePrefix + 'fx/item.png" width="8" height="10" alt="F" style="margin-bottom:-1px" />';
				}
				buf2 += '</div>';
			}
			this.sides[k].totalPokemon = i;
			this.sides[k].updateSidebar();
			if (textBuf) {
				this.log('<div class="chat"><strong>' + Tools.escapeHTML(this.sides[k].name) + '\'s team:</strong> <em style="color:#445566;display:block;">' + Tools.escapeHTML(textBuf) + '</em></div>');
			}
			this.spriteElems[k].html(buf + buf2);
		}
	};
	Battle.prototype.runMajor = function (args, kwargs, preempt) {
		switch (args[0]) {
		case 'start':
			this.teamPreview(false);
			this.mySide.active[0] = null;
			this.yourSide.active[0] = null;
			if (this.waitForResult()) return;
			this.start();
			break;
		case 'upkeep':
			this.usesUpkeep = true;
			this.updatePseudoWeatherLeft();
			break;
		case 'turn':
			if (this.endPrevAction()) return;
			this.setTurn(args[1]);
			break;
		case 'tier':
			if (!args[1]) args[1] = '';
			for (var i in kwargs) args[1] += '[' + i + '] ' + kwargs[i];
			this.log('<div style="padding:5px 0"><small>Format:</small> <br /><strong>' + Tools.escapeHTML(args[1]) + '</strong></div>');
			this.tier = args[1];
			if (this.tier === 'Random Battle') {
				this.speciesClause = true;
			}
			break;
		case 'gametype':
			this.gameType = args[1];
			switch (args[1]) {
			default:
				this.mySide.active = [null];
				this.yourSide.active = [null];
				break;
			case 'doubles':
				this.mySide.active = [null, null];
				this.yourSide.active = [null, null];
				break;
			case 'triples':
			case 'rotation':
				this.mySide.active = [null, null, null];
				this.yourSide.active = [null, null, null];
				break;
			}
			break;
		case 'variation':
			this.log('<div><small>Variation: <em>' + Tools.escapeHTML(args[1]) + '</em></small></div>');
			break;
		case 'rule':
			var ruleArgs = args[1].split(': ');
			this.log('<div><small><em>' + Tools.escapeHTML(ruleArgs[0]) + (ruleArgs[1] ? ':' : '') + '</em> ' + Tools.escapeHTML(ruleArgs[1] || '') + '</div>');
			break;
		case 'rated':
			this.rated = true;
			this.log('<div class="rated"><strong>Rated battle</strong></div>');
			break;
		case 'chat':
		case 'c':
			var pipeIndex = args[1].indexOf('|');
			var name = args[1].slice(0, pipeIndex);
			var rank = name.charAt(0);
			if (this.ignoreSpects && (rank === ' ' || rank === '+')) break;
			if (this.ignoreOpponent && (rank === '\u2605' || rank === '\u2606') && toUserid(name) !== app.user.get('userid')) break;
			if (window.app && app.ignore && app.ignore[toUserid(name)] && (rank === ' ' || rank === '+' || rank === '\u2605' || rank === '\u2606')) break;
			var message = args[1].slice(pipeIndex + 1);
			var isHighlighted = window.app && app.rooms && app.rooms[this.roomid].getHighlight(message);
			var parsedMessage = Tools.parseChatMessage(message, name, '', isHighlighted);
			if (!$.isArray(parsedMessage)) parsedMessage = [parsedMessage];
			for (var i = 0; i < parsedMessage.length; i++) {
				if (!parsedMessage[i]) continue;
				this.log(parsedMessage[i], preempt);
			}
			if (isHighlighted) {
				var notifyTitle = "Mentioned by " + name + " in " + this.roomid;
				app.rooms[this.roomid].notifyOnce(notifyTitle, "\"" + message + "\"", 'highlight');
			}
			break;
		case 'chatmsg':
			this.log('<div class="chat">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		case 'chatmsg-raw':
		case 'raw':
		case 'html':
			this.log('<div class="chat">' + Tools.sanitizeHTML(args[1]) + '</div>', preempt);
			break;
		case 'error':
			this.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		case 'pm':
			this.log('<div class="chat"><strong>' + Tools.escapeHTML(args[1]) + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + Tools.escapeHTML(args[2], true) + '\')">(Private to ' + Tools.escapeHTML(args[3]) + ')</i> ' + Tools.parseMessage(args[4], args[1]) + '</span>');
			break;
		case 'askreg':
			this.log('<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="' + Tools.escapeHTML(args[1]) + '"><b>Register</b></button></div>');
			break;
		case 'inactive':
			if (!this.kickingInactive) this.kickingInactive = true;
			if (args[1].slice(0, 11) === "Time left: ") {
				this.kickingInactive = parseInt(args[1].slice(11), 10) || true;
				this.totalTimeLeft = parseInt(args[1].split(' | ')[1], 10);
				if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
				return;
			} else if (args[1].slice(0, 9) === "You have ") {
				// this is ugly but parseInt is documented to work this way
				// so I'm going to be lazy and not chop off the rest of the
				// sentence
				this.kickingInactive = parseInt(args[1].slice(9), 10) || true;
				return;
			} else if (args[1].slice(-14) === ' seconds left.') {
				var hasIndex = args[1].indexOf(' has ');
				var userid = (window.app && app.user && app.user.get('userid'));
				if (toId(args[1].slice(0, hasIndex)) === userid) {
					this.kickingInactive = parseInt(args[1].slice(hasIndex + 5), 10) || true;
				}
			}
			this.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		case 'inactiveoff':
			this.kickingInactive = false;
			this.log('<div class="chat message-error">' + Tools.escapeHTML(args[1]) + '</div>', preempt);
			break;
		case 'timer':
			break;
		case 'join':
		case 'j':
			if (this.roomid) app.rooms[this.roomid].users[toUserid(args[1])] = ' ' + args[1];
			if (!this.ignoreSpects) {
				this.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' joined.</small></div>', preempt);
			}
			break;
		case 'leave':
		case 'l':
			if (this.roomid) delete app.rooms[this.roomid].users[toUserid(args[1])];
			if (!this.ignoreSpects) {
				this.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' left.</small></div>', preempt);
			}
			break;
		case 'J':
		case 'L':
		case 'N':
		case 'n':
		case 'spectator':
		case 'spectatorleave':
			break;
		case 'player':
			this.getSide(args[1]).setName(args[2]);
			this.getSide(args[1]).setSprite(args[3]);
			break;
		case 'teamsize':
			this.getSide(args[1]).totalPokemon = parseInt(args[2], 10);
			this.getSide(args[1]).updateSidebar();
			break;
		case 'win':
			this.winner(args[1]);
			break;
		case 'tie':
			this.winner();
			break;
		case 'prematureend':
			this.prematureEnd();
			break;
		case 'clearpoke':
			this.p1.pokemon = [];
			this.p2.pokemon = [];
			for (var i = 0; i < this.p1.active.length; i++) {
				this.p1.active[i] = null;
				this.p2.active[i] = null;
			}
			break;
		case 'poke':
			var pokemon = this.getPokemon('new: ' + args[1], args[2]);
			if (args[3] === 'item') {
				pokemon.item = '(exists)';
			}
			break;
		case 'detailschange':
			if (this.waitForResult()) return;
			var poke = this.getPokemon(args[1]);
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
			poke.sprite.animTransform($.extend(spriteData, template), true);
			poke.sprite.oldsp = null;
			poke.spriteid = template.spriteid;
			poke.side.updateStatbar();

			poke.species = newSpecies;
			poke.ability = poke.baseAbility = (template.abilities ? template.abilities['0'] : '');
			poke.baseStats = template.baseStats;
			poke.weightkg = template.weightkg;
			poke.types = template.types && template.types.slice(0);

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];
			if (poke.statbarElem) {
				poke.statbarElem.html(poke.side.getStatbarHTML(poke, true));
			}
			poke.side.updateStatbar(poke, true);
			poke.side.updateSidebar();
			if (toId(newSpecies) === 'greninjaash') {
				this.message('<small>' + poke.getName() + ' became Ash-Greninja!</small>');
			} else if (toId(newSpecies) === 'mimikyubusted') {
				this.message('<small>' + poke.getName() + "'s disguise was busted!</small>");
			} else if (toId(newSpecies) === 'zygardecomplete') {
				this.message('<small>' + poke.getName() + ' transformed into its Complete Forme!</small>');
			}
			break;
		case 'teampreview':
			this.teamPreview(true);
			this.teamPreviewCount = args[1];
			break;
		case 'switch':
		case 'drag':
		case 'replace':
			this.endLastTurn();
			if (this.waitForResult()) return;
			var poke = this.getPokemon('switchin: ' + args[1], args[2]);
			var slot = poke.slot;
			poke.healthParse(args[3]);
			poke.removeVolatile('itemremoved');
			if (args[0] === 'switch') {
				if (poke.side.active[slot]) {
					poke.side.switchOut(poke.side.active[slot]);
					if (this.waitForResult()) return;
				}
				poke.side.switchIn(poke);
			} else if (args[0] === 'replace') {
				poke.side.replace(poke);
			} else {
				poke.side.dragIn(poke);
			}
			break;
		case 'faint':
			if (this.waitForResult()) return;
			var poke = this.getPokemon(args[1]);
			poke.side.faint(poke);
			break;
		case 'swap':
			if (isNaN(Number(args[2]))) {
				var poke = this.getPokemon(args[1]);
				poke.side.swapWith(poke, this.getPokemon(args[2]), kwargs);
			} else {
				var poke = this.getPokemon(args[1]);
				poke.side.swapTo(poke, args[2], kwargs);
			}
			break;
		case 'move':
			this.endLastTurn();
			if ((!kwargs.from || kwargs.from === 'lockedmove') && this.waitForResult()) return;
			var poke = this.getPokemon(args[1]);
			var move = Tools.getMove(args[2]);
			if (this.checkActive(poke)) return;
			var poke2 = this.getPokemon(args[3]);
			poke.sprite.beforeMove();
			this.useMove(poke, move, poke2, kwargs);
			poke.sprite.afterMove();
			break;
		case 'cant':
			this.endLastTurn();
			if (this.waitForResult()) return;
			var poke = this.getPokemon(args[1]);
			var effect = Tools.getEffect(args[2]);
			var move = Tools.getMove(args[3]);
			this.cantUseMove(poke, effect, move, kwargs);
			break;
		case 'message':
			this.message(Tools.escapeHTML(args[1]));
			break;
		case 'done':
		case '':
			if (this.ended || this.endPrevAction()) return;
			break;
		case 'warning':
			this.message('<strong>Warning:</strong> ' + Tools.escapeHTML(args[1]));
			this.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			this.activityWait(1000);
			break;
		case 'gen':
			this.gen = parseInt(args[1], 10);
			this.updateGen();
			break;
		case 'callback':
			args.shift();
			if (this.customCallback) this.customCallback(this, args[0], args, kwargs);
			break;
		case 'debug':
			args.shift();
			name = args.join(' ');
			this.log('<div class="debug"><div class="chat"><small style="color:#999">[DEBUG] ' + Tools.escapeHTML(name) + '.</small></div></div>', preempt);
			break;
		case 'seed':
		case 'choice':
			break;
		case 'unlink':
			if (Tools.prefs('nounlink')) return;
			var user = toId(args[2]) || toId(args[1]);
			var $messages = $('.chatmessage-' + user);
			if (!$messages.length) break;
			$messages.find('a').contents().unwrap();
			if (window.BattleRoom && args[2]) {
				$messages.hide().addClass('revealed').find('button').parent().remove();
				this.log('<div class="chatmessage-' + user + '"><button name="toggleMessages" value="' + user + '" class="subtle"><small>(' + $messages.length + ' line' + ($messages.length > 1 ? 's' : '') + ' from ' + user + ' hidden)</small></button></div>');
			}
			break;
		default:
			this.logConsole('unknown command: ' + args[0]);
			this.log('<div>Unknown command: ' + Tools.escapeHTML(args[0]) + '</div>');
			if (this.errorCallback) this.errorCallback(this);
			break;
		}
	};
	Battle.prototype.run = function (str, preempt) {
		if (this.preemptActivityQueue.length && str === this.preemptActivityQueue[0]) {
			this.preemptActivityQueue.shift();
			this.preemptCatchup();
			return;
		}
		if (!str) return;
		if (str.charAt(0) !== '|' || str.substr(0, 2) === '||') {
			if (str.charAt(0) === '|') str = str.substr(2);
			this.log('<div class="chat">' + Tools.escapeHTML(str) + '</div>', preempt);
			return;
		}
		var args = ['done'], kwargs = {};
		if (str !== '|') {
			args = str.substr(1).split('|');
		}
		switch (args[0]) {
		case 'c': case 'chat':
		case 'chatmsg': case 'chatmsg-raw': case 'raw': case 'error': case 'html':
		case 'inactive': case 'inactiveoff': case 'warning':
			// chat is preserved untouched
			args = [args[0], str.slice(args[0].length + 2)];
			break;
		default:
			// parse kwargs
			while (args.length) {
				var argstr = args[args.length - 1];
				if (argstr.substr(0, 1) !== '[') break;
				var bracketPos = argstr.indexOf(']');
				if (bracketPos <= 0) break;
				// default to '.' so it evaluates to boolean true
				kwargs[argstr.substr(1, bracketPos - 1)] = ($.trim(argstr.substr(bracketPos + 1)) || '.');
				args.pop();
			}
		}

		// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
		var nextLine = '', nextArgs = [''], nextKwargs = {};
		nextLine = this.activityQueue[this.activityStep + 1] || '';
		if (nextLine && nextLine.substr(0, 2) === '|-') {
			nextLine = $.trim(nextLine.substr(1));
			nextArgs = nextLine.split('|');
			while (nextArgs[nextArgs.length - 1] && nextArgs[nextArgs.length - 1].substr(0, 1) === '[') {
				var bracketPos = nextArgs[nextArgs.length - 1].indexOf(']');
				if (bracketPos <= 0) break;
				var argstr = nextArgs.pop();
				// default to '.' so it evaluates to boolean true
				nextKwargs[argstr.substr(1, bracketPos - 1)] = ($.trim(argstr.substr(bracketPos + 1)) || '.');
			}
		}

		if (this.debug) {
			if (args[0].substr(0, 1) === '-') {
				this.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
			} else {
				this.runMajor(args, kwargs, preempt);
			}
		} else try {
			if (args[0].substr(0, 1) === '-') {
				this.runMinor(args, kwargs, preempt, nextArgs, nextKwargs);
			} else {
				this.runMajor(args, kwargs, preempt);
			}
		} catch (e) {
			this.log('<div class="chat">Error parsing: ' + Tools.escapeHTML(str) + ' (' + Tools.escapeHTML('' + e) + ')</div>', preempt);
			if (e.stack) {
				var stack = Tools.escapeHTML('' + e.stack).split('\n');
				for (var i = 0; i < stack.length; i++) {
					if (/\brun\b/.test(stack[i])) {
						stack.length = i;
						break;
					}
				}
				this.log('<div class="chat">' + stack.join('<br>') + '</div>', preempt);
			}
			if (this.errorCallback) this.errorCallback(this);
		}

		if (this.fastForward > 0 && this.fastForward < 1) {
			if (nextLine.substr(0, 6) === '|start') {
				this.fastForwardOff();
				if (this.endCallback) this.endCallback(this);
			}
		}
	};
	Battle.prototype.endPrevAction = function () {
		if (this.minorQueue.length) {
			this.runMinor();
			this.activityStep--;
			return true;
		}
		if (this.resultWaiting || this.messageActive) {
			this.endAction();
			this.activityStep--;
			this.resultWaiting = false;
			this.multiHitMove = null;
			this.activeMoveIsSpread = null;
			return true;
		}
		return false;
	};
	Battle.prototype.checkActive = function (poke) {
		if (!poke.side.active[poke.slot]) {
			// SOMEONE jumped in in the middle of a replay. <_<
			poke.side.replace(poke);
		}
		return false;
	};
	Battle.prototype.waitForResult = function () {
		if (this.endPrevAction()) return true;
		this.resultWaiting = true;
		return false;
	};
	Battle.prototype.doBeforeThis = function (act) {
		if (act()) {
			this.activityStep--;
			return true;
		}
		return false;
	};
	Battle.prototype.doAfterThis = function (act) {
		this.activityAfter = act;
	};

	Battle.prototype.queue1 = function () {
		if (this.activeQueue === this.queue1) this.nextActivity();
	};
	Battle.prototype.queue2 = function () {
		if (this.activeQueue === this.queue2) this.nextActivity();
	};
	Battle.prototype.swapQueues = function () {
		if (this.activeQueue === this.queue1) this.activeQueue = this.queue2;
		else this.activeQueue = this.queue2;
	};

	Battle.prototype.pause = function () {
		this.elem.find(':animated').finish();
		this.paused = true;
		this.playbackState = 3;
		if (this.resumeButton) {
			this.frameElem.append('<div class="playbutton"><button data-action="resume"><i class="fa fa-play icon-play"></i> Resume</button></div>');
			this.frameElem.find('div.playbutton button').click(this.resumeButton);
		}
		this.soundPause();
	};
	Battle.prototype.play = function (dontResetSound) {
		if (this.fastForward) {
			this.paused = false;
			this.playbackState = 5;
		} else if (this.paused) {
			this.paused = false;
			if (!dontResetSound && this.playbackState === 1) {
				this.soundStop();
			}
			this.playbackState = 2;
			if (!dontResetSound && !this.ended) {
				this.soundStart();
			}
			this.nextActivity();
		}
		this.frameElem.find('div.playbutton').remove();
	};
	Battle.prototype.skipTurn = function () {
		this.fastForwardTo(this.turn + 1);
	};
	Battle.prototype.fastForwardTo = function (time) {
		this.playbackState = 5;
		if (this.fastForward) return;
		if (time === 0 || time === '0') {
			time = 0.5;
		} else {
			time = Math.floor(Number(time));
		}
		if (isNaN(time)) return;
		if (this.activityStep >= this.activityQueue.length - 1 && time >= this.turn + 1 && !this.activityQueueActive) return;
		if (this.ended && time >= this.turn + 1) return;
		this.messagebarElem.empty().css({
			opacity: 0,
			height: 0
		});
		if (time <= this.turn && time !== -1) {
			var paused = this.paused;
			this.reset(true);
			this.activityQueueActive = true;
			if (paused) this.pause();
			else this.paused = false;
			if (time) {
				this.fastForward = time;
				this.fastForwardWillScroll = true;
				this.elem.append('<div class="seeking"><strong>seeking...</strong></div>');
				$.fx.off = true;
			}
			this.elem.find(':animated').finish();
			this.swapQueues();
			this.nextActivity();
			return;
		}
		this.fxElem.empty();
		this.fastForward = time;
		this.fastForwardWillScroll = (this.logFrameElem.scrollTop() + 60 >= this.logElem.height() + this.logPreemptElem.height() - this.optionsElem.height() - this.logFrameElem.height());
		this.elem.append('<div class="seeking"><strong>seeking...</strong></div>');
		$.fx.off = true;
		this.elem.find(':animated').finish();
		if (this.yourSide.active[0] && this.yourSide.active[0].sprite) {
			this.yourSide.active[0].sprite.animReset();
		}
		if (this.mySide.active[0] && this.mySide.active[0].sprite) {
			this.mySide.active[0].sprite.animReset();
		}
		this.swapQueues();
		this.nextActivity();
	};
	Battle.prototype.fastForwardOff = function () {
		this.fastForward = false;
		this.elem.find('.seeking').remove();
		$.fx.off = false;
		if (this.p1) this.p1.updateStatbar(null, true, true);
		if (this.p2) this.p2.updateStatbar(null, true, true);
		this.updateWeather(undefined, true);
		if (this.fastForwardWillScroll) {
			this.logFrameElem.scrollTop(this.logElem.height() + this.logPreemptElem.height());
			this.fastForwardWillScroll = false;
		}
		if (!this.paused) this.soundStart();
		this.playbackState = 2;
	};
	Battle.prototype.nextActivity = function () {
		if (this.paused && !this.fastForward) {
			return;
		}
		this.activityQueueActive = true;
		this.fxElem.empty();
		this.animationDelay = 0;
		while (true) {
			this.activityAnimations = $();
			if (this.activityStep >= this.activityQueue.length) {
				this.activityQueueActive = false;
				this.paused = true;
				this.fastForwardOff();
				if (this.ended) {
					this.soundStop();
				}
				this.playbackState = 4;
				if (this.endCallback) this.endCallback(this);
				return;
			}
			var ret;
			if (this.activityAfter) {
				ret = this.activityAfter();
				this.activityAfter = null;
			}
			if (this.paused && !this.fastForward) return;
			if (!ret) {
				this.run(this.activityQueue[this.activityStep]);
				this.activityStep++;
			}
			if (this.activityDelay) {
				this.delayElem.delay(this.activityDelay);
				this.activityWait(this.delayElem);
				this.activityDelay = 0;
			}
			if (this.activityAnimations.length) break;
		}
		var self = this;
		this.activityAnimations.promise().done(this.activeQueue.bind(this));
	};
	Battle.prototype.activityWait = function (elem) {
		if (typeof elem === 'number' && elem > this.activityDelay) {
			this.activityDelay = elem;
			return;
		}
		this.activityAnimations = this.activityAnimations.add(elem);
	};

	Battle.prototype.newBattle = function () {
		this.reset();
		this.activityQueue = [];
	};
	Battle.prototype.setQueue = function (queue) {
		this.reset();
		this.activityQueue = queue;

		/* for (var i = 0; i < queue.length && i < 20; i++) {
			if (queue[i].substr(0, 8) === 'pokemon ') {
				var sp = this.parseSpriteData(queue[i].substr(8));
				BattleSound.loadEffect(sp.cryurl);
				this.preloadImage(sp.url);
				if (sp.url === '/sprites/bwani/meloetta.gif') {
					this.preloadImage('/sprites/bwani/meloetta-pirouette.gif');
				}
				if (sp.url === '/sprites/bwani-back/meloetta.gif') {
					this.preloadImage('/sprites/bwani-back/meloetta-pirouette.gif');
				}
			}
		} */
		this.playbackState = 1;
	};

	Battle.prototype.preloadImage = function (url) {
		var token = url.replace(/\.(gif|png)$/, '').replace(/\//g, '-');
		if (this.preloadCache[token]) {
			return;
		}
		this.preloadNeeded++;
		this.preloadCache[token] = new Image();
		var self = this;
		this.preloadCache[token].onload = function () {
			self.preloadDone++;
			self.preloadCallback(self.preloadNeeded === self.preloadDone, self.preloadDone, self.preloadNeeded);
		};
		this.preloadCache[token].src = url;
	};
	Battle.prototype.preloadCallback = function () {};
	Battle.prototype.preloadEffects = function () {
		for (var i in BattleEffects) {
			if (i === 'alpha' || i === 'omega') continue;
			if (BattleEffects[i].url) this.preloadImage(BattleEffects[i].url);
		}
		this.preloadImage(Tools.fxPrefix + 'weather-raindance.jpg'); // rain is used often enough to precache
		this.preloadImage(Tools.resourcePrefix + 'sprites/xyani/substitute.gif');
		this.preloadImage(Tools.resourcePrefix + 'sprites/xyani-back/substitute.gif');
		//this.preloadImage(Tools.fxPrefix + 'bg.jpg');
	};
	Battle.prototype.dogarsCheck = function (pokemon) {
		if (pokemon.side.n === 1) return;

		if (pokemon.species === 'Koffing' && pokemon.name.match(/dogars/i)) {
			if (window.forceBgm !== -1) {
				window.originalBgm = window.bgmNum;
				window.forceBgm = -1;
				this.preloadBgm();
				this.soundStart();
			}
		} else if (window.forceBgm === -1) {
			window.forceBgm = null;
			if (window.originalBgm || window.originalBgm === 0) {
				window.forceBgm = window.originalBgm;
			}
			this.preloadBgm();
			this.soundStart();
		}
	};
	Battle.prototype.preloadBgm = function () {
		var bgmNum = Math.floor(Math.random() * 13);

		if (window.forceBgm || window.forceBgm === 0) bgmNum = window.forceBgm;
		window.bgmNum = bgmNum;
		var ext = window.nodewebkit ? '.ogg' : '.mp3';
		switch (bgmNum) {
		case -1:
			BattleSound.loadBgm('audio/bw2-homika-dogars' + ext, 1661, 68131);
			this.bgm = 'audio/bw2-homika-dogars' + ext;
			break;
		case 0:
			BattleSound.loadBgm('audio/hgss-kanto-trainer' + ext, 13003, 94656);
			this.bgm = 'audio/hgss-kanto-trainer' + ext;
			break;
		case 1:
			BattleSound.loadBgm('audio/bw-subway-trainer' + ext, 15503, 110984);
			this.bgm = 'audio/bw-subway-trainer' + ext;
			break;
		case 2:
			BattleSound.loadBgm('audio/bw-trainer' + ext, 14629, 110109);
			this.bgm = 'audio/bw-trainer' + ext;
			break;
		case 3:
			BattleSound.loadBgm('audio/bw-rival' + ext, 19180, 57373);
			this.bgm = 'audio/bw-rival' + ext;
			break;
		case 4:
			BattleSound.loadBgm('audio/dpp-trainer' + ext, 13440, 96959);
			this.bgm = 'audio/dpp-trainer' + ext;
			break;
		case 5:
			BattleSound.loadBgm('audio/hgss-johto-trainer' + ext, 23731, 125086);
			this.bgm = 'audio/hgss-johto-trainer' + ext;
			break;
		case 6:
			BattleSound.loadBgm('audio/dpp-rival' + ext, 13888, 66352);
			this.bgm = 'audio/dpp-rival' + ext;
			break;
		case 7:
			BattleSound.loadBgm('audio/bw2-kanto-gym-leader' + ext, 14626, 58986);
			this.bgm = 'audio/bw2-kanto-gym-leader' + ext;
			break;
		case 8:
			BattleSound.loadBgm('audio/bw2-rival' + ext, 7152, 68708);
			this.bgm = 'audio/bw2-rival' + ext;
			break;
		case 9:
			BattleSound.loadBgm('audio/xy-trainer' + ext, 7802, 82469);
			this.bgm = 'audio/xy-trainer' + ext;
			break;
		case 10:
			BattleSound.loadBgm('audio/xy-rival' + ext, 7802, 58634);
			this.bgm = 'audio/xy-rival' + ext;
			break;
		case 11:
			BattleSound.loadBgm('audio/oras-trainer' + ext, 13579, 91548);
			this.bgm = 'audio/oras-trainer' + ext;
			break;
		case 12:
			BattleSound.loadBgm('audio/sm-trainer' + ext, 8323, 89230);
			this.bgm = 'audio/sm-trainer' + ext;
			break;
		case 13:
			BattleSound.loadBgm('audio/sm-rival' + ext, 11389, 62158);
			this.bgm = 'audio/sm-rival' + ext;
			break;
		default:
			BattleSound.loadBgm('audio/oras-rival' + ext, 14303, 69149);
			this.bgm = 'audio/oras-rival' + ext;
			break;
		}
	};
	Battle.prototype.setMute = function (mute) {
		BattleSound.setMute(mute);
	};
	Battle.prototype.soundStart = function () {
		if (!this.bgm) this.preloadBgm();
		BattleSound.playBgm(this.bgm);
	};
	Battle.prototype.soundStop = function () {
		BattleSound.stopBgm();
	};
	Battle.prototype.soundPause = function () {
		BattleSound.pauseBgm();
	};

	return Battle;
})();
