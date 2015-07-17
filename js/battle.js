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
			setVolume: function () { return this; }
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
			return this.bgmCache[url] = this.soundPlaceholder;
		}
		this.bgmCache[url].onposition(loopend, function () {
			this.setPosition(loopstart);
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
	BattleSoundLibrary.prototype.setBgmVolume = function (bgmVolume) {
		this.bgmVolume = bgmVolume;
		if (this.bgm) {
			try {
				this.bgm.setVolume(bgmVolume);
			} catch (e) {}
		}
	};
	BattleSoundLibrary.prototype.setEffectVolume = function (effectVolume) {
		this.effectVolume = effectVolume;
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
		this.species = species;
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

		var hp = hpstring.split(' ');
		var status = hp[1];
		hp = hp[0];
		var oldhp = (this.zerohp || this.fainted) ? 0 : (this.hp || 1);
		var oldmaxhp = this.maxhp;
		var oldwidth = this.hpWidth(100);
		var oldcolor = this.hpcolor;

		// hp parse
		this.hpcolor = '';
		if (hp === '0' || hp === '0.0') {
			this.hp = 0;
			this.zerohp = true;
		} else if (hp.indexOf('/') > 0) {
			var hp = hp.split('/');
			if (isNaN(parseFloat(hp[0])) || isNaN(parseFloat(hp[1]))) {
				return false;
			}
			this.hp = parseFloat(hp[0]);
			this.maxhp = parseFloat(hp[1]);
			if (oldmaxhp === 0) { // max hp not known before parsing this message
				oldmaxhp = oldhp = this.maxhp;
			}
			if (this.hp > this.maxhp) this.hp = this.maxhp;
			var colorchar = hp[1].substr(hp[1].length - 1);
			if ((colorchar === 'y') || (colorchar === 'g')) {
				this.hpcolor = colorchar;
			}
			if (!this.hp) {
				this.zerohp = true;
			}
		} else if (!isNaN(parseFloat(hp))) {
			this.hp = this.maxhp * parseFloat(hp) / 100;
		}

		// status parse
		if (!status) {
			this.status = '';
		} else if (status === 'par' || status === 'brn' || status === 'slp' || status === 'frz' || status === 'tox') {
			this.status = status;
		} else if (status === 'psn' && this.status !== 'tox') {
			this.status = status;
		} else if (status === 'fnt') {
			this.hp = 0;
			this.zerohp = true;
			this.fainted = true;
		}

		var oldnum = oldhp ? (Math.floor(oldhp / oldmaxhp * this.maxhp) || 1) : 0;
		var delta = this.hp - oldnum;
		var deltawidth = this.hpWidth(100) - oldwidth;
		return [delta, this.maxhp, deltawidth, oldnum, oldcolor];
	};
	Pokemon.prototype.checkDetails = function (details, ident) {
		if (details === this.details) return true;
		if (this.details.indexOf('-*') < 0) return false;
		// the actual forme was hidden on Team Preview
		this.needsReplace = true;
		details = details.replace(/-[A-Za-z0-9]+(, |$)/, '$1');
		return (details === this.details.replace(/-[A-Za-z0-9*]+(, |$)/, '$1'));
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
			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
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

			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
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

			this.side.battle.spriteElemsFront[this.side.n].append('<img src="' + Tools.resourcePrefix + 'fx/energyball.png" style="display:none;position:absolute" />');
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
			if (volatile === 'protect' || volatile === 'magiccoat') {
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
	Pokemon.prototype.getName = function () {
		if (this.side.n === 0) {
			return Tools.escapeHTML(this.name);
		} else {
			return "The opposing " + (this.side.battle.ignoreOpponent ? this.species : Tools.escapeHTML(this.name));
		}
	};
	Pokemon.prototype.getLowerName = function () {
		if (this.side.n === 0) {
			return Tools.escapeHTML(this.name);
		} else {
			return "the opposing " + (this.side.battle.ignoreOpponent ? this.species : Tools.escapeHTML(this.name));
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
		var name = this.side.n && this.side.battle.ignoreOpponent ? this.species : Tools.escapeHTML(this.name);
		if (name !== this.species) {
			if (plaintext) {
				name += ' (' + this.species + ')';
			} else {
				name += ' <small>(' + this.species + ')</small>';
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
		//this.lastmove = '';
		this.statusStage = 0;
	};
	Pokemon.prototype.copyVolatileFrom = function (pokemon, copyAll) {
		this.boosts = pokemon.boosts;
		this.volatiles = pokemon.volatiles;
		//this.lastmove = pokemon.lastmove; // I think
		if (!copyAll) {
			this.removeVolatile('yawn');
			this.removeVolatile('airballoon');
			this.removeVolatile('typeadd');
			this.removeVolatile('typechange');
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
			this.volatiles.typechange[2] = pokemon.types ? pokemon.types.join('/') : '';
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
		this.status = '';
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
		var percentage = Math.ceil(this.hp / this.maxhp * 100);
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
		this.top = parseInt(pos.top + 40);
		this.left = parseInt(pos.left);
		this.isBackSprite = !siden;
		this.duringMove = false;

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
		return (this.isBackSprite ? -1 : 1) * offset;
	};
	Sprite.prototype.behind = function (offset) {
		return this.z + (this.isBackSprite ? -1 : 1) * offset;
	};
	Sprite.prototype.animTransform = function (species) {
		if (!this.oldsp) this.oldsp = this.sp;
		if (species.volatiles && species.volatiles.formechange) species = species.volatiles.formechange[2];
		sp = Tools.getSpriteData(species, this.isBackSprite ? 0 : 1, {
			afd: this.battle.tier === "[Seasonal] Fools Festival",
			gen: this.battle.gen
		});
		this.sp = sp;
		var self = this;
		var battle = this.battle;
		this.elem.animate(this.battle.pos({
			x: this.x,
			y: this.y,
			z: this.z,
			yscale: 0,
			xcale: 1,
			opacity: .3
		}, this.oldsp), 300, function () {
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
			sp = this.oldsp;
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
	Sprite.prototype.animSub = function () {
		var subsp = Tools.getSpriteData('substitute', this.siden, {afd: this.battle.tier === "[Seasonal] Fools Festival"});
		this.subsp = subsp;
		this.iw = subsp.w;
		this.ih = subsp.h;
		this.battle.spriteElemsFront[this.siden].append('<img src="' + subsp.url + '" style="display:none;position:absolute" />');
		this.subElem = this.battle.spriteElemsFront[this.siden].children().last();

		//temp//this.subElem.css({position: 'absolute', display: 'block'});
		this.selfAnim({}, 500);
		this.subElem.css({
			position: 'absolute',
			opacity: 0,
			display: 'block'
		});
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
		this.subElem.animate(this.battle.pos({
			x: this.x,
			y: this.y - 50,
			z: this.z,
			opacity: 0
		}, this.subsp), 500);

		this.subElem = null;
		this.selfAnim({}, 500);
		this.iw = this.sp.w;
		this.ih = this.sp.h;
		this.battle.activityWait(this.elem);
	};
	Sprite.prototype.beforeMove = function () {
		if (this.subElem && !this.duringMove) {
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
			this.battle.animationDelay = 300;
			this.battle.activityWait(this.elem);

			return true;
		}
		return false;
	};
	Sprite.prototype.afterMove = function () {
		if (this.subElem && this.duringMove) {
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
			var temp = this.subElem;
			this.subElem.animate({
				opacity: 0
			}, function () {
				temp.remove();
			});
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
		this.x = slot * (this.isBackSprite ? -1 : 1) * -50;
		this.y = slot * (this.isBackSprite ? -1 : 1) * 10;
		this.statbarOffset = 0;
		if (!this.isBackSprite) this.statbarOffset = 17 * slot;
		if (this.isBackSprite) this.statbarOffset = -7 * slot;

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
		this.top = parseInt(pos.top + 40);
		this.left = parseInt(pos.left);

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
	};
	Sprite.prototype.animDragIn = function (slot) {
		if (this.battle.fastForward) return this.animSummon(slot, true);

		this.x = slot * (this.isBackSprite ? -1 : 1) * -50;
		this.y = slot * (this.isBackSprite ? -1 : 1) * 10;
		this.statbarOffset = 0;
		if (!this.isBackSprite) this.statbarOffset = 17 * slot;
		if (this.isBackSprite) this.statbarOffset = -7 * slot;

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
		this.top = parseInt(pos.top + 40);
		this.left = parseInt(pos.left);

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
		this.anim({
			y: this.y - 80,
			opacity: 0
		}, 'accel');
		this.battle.activityWait(this.elem);
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

		this.sideConditions = {};
		this.wisher = null;

		this.active = [null];
		this.lastPokemon = null;
		this.pokemon = [];
	}

	Side.prototype.rollSprites = function () {
		var sprites = [1, 2, 101, 102, 169, 170];
		this.spriteid = sprites[parseInt(Math.random() * sprites.length)];
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
		this.updateSprites();
		this.sideConditions = {};
		for (var i = 0; i < this.pokemon.length; i++) {
			this.pokemon[i].reset();
		}
	};
	Side.prototype.updateSprites = function () {
		this.z = (this.n ? 200 : 0);
		this.missedPokemon.sprite.destroy();
		this.missedPokemon = {
			sprite: new Sprite(null, this.leftof(-100), this.y, this.z, this.battle, this.n)
		};
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
		for (var i = 0; i < 6; i++) {
			var poke = this.pokemon[i];
			if (i >= this.totalPokemon) {
				pokemonhtml += '<span class="pokemonicon" style="' + Tools.getIcon('pokeball-none') + '"></span>';
			} else if (!poke) {
				//pokemonhtml += '<img src="/fx/pokeball.png" title="Not revealed" />';
				pokemonhtml += '<span class="pokemonicon" style="' + Tools.getIcon('pokeball') + '" title="Not revealed"></span>';
			//} else if (poke.fainted) {
				//pokemonhtml += '<img src="/fx/pokeball.png" style="opacity:0.3;filter:alpha(opacity=30)" title="' + poke.getFullName(true) + '" />';
			} else {
				//pokemonhtml += '<img src="/fx/pokeball.png" title="' + poke.getFullName(true) + '" />';
				pokemonhtml += '<span class="pokemonicon" style="' + Tools.getIcon(poke) + '" title="' + poke.getFullName(true) + '"></span>';
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
	Side.prototype.addSideCondition = function (condition) {
		var elem, curelem;
		condition = toId(condition);
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
		switch (condition) {
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
			this.sideConditions[condition] = [condition, elem, 5];
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
			this.sideConditions[condition] = [condition, elem, 5];
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
			this.sideConditions[condition] = [condition, elem, 5];
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
			this.sideConditions[condition] = [condition, elem, 5];
			break;
		case 'tailwind':
			this.sideConditions[condition] = [condition, null, 5];
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
				scale: .3
			}, BattleEffects.rock1));
			elem = curelem;
			this.sideConditions[condition] = [condition, elem, 1];
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
			this.sideConditions[condition] = [condition, elem, 1];
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
			this.sideConditions[condition] = [condition, elem, 1];
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
			this.sideConditions[condition] = [condition, elem, 1];
			break;
		default:
			this.sideConditions[condition] = [condition, null, 1];
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
		if (this.pokemon.length == 7) {
			// something's wrong
			this.battle.logConsole('corruption');

			// the other possibility is Illusion, which we'll assume
			var existingTable = {};
			for (var i = 0; i < 6; i++) {
				var poke1 = this.pokemon[i];
				if (existingTable[poke1.searchid]) {
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

	Side.prototype.getStatbarHTML = function (pokemon) {
		var gender = '';
		if (pokemon.gender === 'F') gender = ' <small style="color:#C57575">&#9792;</small>';
		if (pokemon.gender === 'M') gender = ' <small style="color:#7575C0">&#9794;</small>';
		return '<div class="statbar' + (this.n ? ' lstatbar' : ' rstatbar') + '"><strong>' + (this.n && this.battle.ignoreOpponent ? pokemon.species : Tools.escapeHTML(pokemon.name)) + gender + (pokemon.level === 100 ? '' : ' <small>L' + pokemon.level + '</small>') + '</strong><div class="hpbar"><div class="hptext"></div><div class="hptextborder"></div><div class="prevhp"><div class="hp"></div></div><div class="status"></div></div>';
	};
	Side.prototype.switchIn = function (pokemon, slot) {
		if (slot === undefined) slot = pokemon.slot;
		this.active[slot] = pokemon;
		pokemon.slot = slot;
		pokemon.clearVolatile();
		pokemon.lastmove = '';
		this.battle.lastmove = 'switch-in';
		if (this.lastPokemon && this.lastPokemon.lastmove === 'batonpass') {
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
		if (pokemon === this.active[slot]) return;
		var oldpokemon = this.active[slot];
		this.lastPokemon = oldpokemon;
		if (oldpokemon) oldpokemon.clearVolatile();
		pokemon.clearVolatile();
		pokemon.lastmove = '';
		this.battle.lastmove = 'switch-in';
		this.active[slot] = pokemon;

		if (oldpokemon === pokemon) return;

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
				left: (this.n == 0 ? 100 : 340),
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
		if (pokemon.lastmove !== 'batonpass') {
			pokemon.clearVolatile();
		} else {
			pokemon.removeVolatile('transform');
			pokemon.removeVolatile('formechange');
		}
		if (pokemon.lastmove === 'uturn' || pokemon.lastmove === 'voltswitch') {
			this.battle.message('' + pokemon.getName() + ' went back to ' + Tools.escapeHTML(pokemon.side.name) + '!');
		} else if (pokemon.lastmove !== 'batonpass') {
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

		if (target) target.slot = pokemon.slot;
		pokemon.slot = slot;
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
		pokemon.statbarElem.animate({
			opacity: 0
		}, 300, function () {
			pokemon.statbarElem.remove();
			pokemon.statbarElem = null;
		});
		if (this.battle.faintCallback) this.battle.faintCallback(this.battle, this);
	};
	Side.prototype.updateHPText = function (pokemon) {
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
	Side.prototype.updateStatbar = function (pokemon, updatePrevhp, updateHp) {
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
			else $hp.addClass('hp-red');
			this.updateHPText(pokemon);
		}
		if (updatePrevhp) {
			var $prevhp = pokemon.statbarElem.find('.prevhp');
			$prevhp.css('width', pokemon.hpWidth(150) + 1);
			if (hpcolor === 'g') $prevhp.removeClass('prevhp-yellow prevhp-red');
			else if (hpcolor === 'y') $prevhp.removeClass('prevhp-red').addClass('prevhp-yellow');
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
		for (var x in pokemon.boosts) {
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
			rage: '<span class="neutral">Rage</span>',
			roost: '<span class="neutral">Landed</span>',
			protect: '<span class="good">Protect</span>',
			quickguard: '<span class="good">Quick&nbsp;Guard</span>',
			wideguard: '<span class="good">Wide&nbsp;Guard</span>',
			craftyshield: '<span class="good">Crafty&nbsp;Shield</span>',
			helpinghand: '<span class="good">Helping&nbsp;Hand</span>',
			magiccoat: '<span class="good">Magic&nbsp;Coat</span>',
			destinybond: '<span class="good">Destiny&nbsp;Bond</span>',
			snatch: '<span class="good">Snatch</span>',
			grudge: '<span class="good">Grudge</span>',
			endure: '<span class="good">Endure</span>',
			focuspunch: '<span class="neutral">Focusing</span>',
			powder: '<span class="bad">Powder</span>',
			ragepowder: '<span class="good">Rage&nbsp;Powder</span>',
			followme: '<span class="good">Follow&nbsp;Me</span>',
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
	function Battle(frame, logFrame, noPreload) {
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
		this.noPreload = !!noPreload;
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
		// 0 = uninitialized
		// 1 = ready
		// 2 = playing
		// 3 = paused
		// 4 = finished
		// 5 = seeking
		this.playbackState = 0;

		this.backdropImage = BattleBackdrops[Math.floor(Math.random() * BattleBackdrops.length)];

		this.bgm = null;
		this.activeQueue = this.queue1;

		this.activityQueue = [];
		this.preemptActivityQueue = [];
		this.activityAnimations = $();
		this.minorQueue = [];

		// external
		this.resumeButton = this.play;

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
	Battle.prototype.addPseudoWeather = function (weather, poke) {
		this.pseudoWeather.push([weather, 5]);
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
		if (this.gen < 3) this.backdropImage = 'bg-gen1.png';
		else if (this.gen < 6) this.backdropImage = 'bg.jpg';
		if (this.bgElem) this.bgElem.css('background-image', 'url(' + Tools.resourcePrefix + 'fx/' + this.backdropImage + ')');
	};
	Battle.prototype.reset = function (dontResetSound) {
		// battle state
		this.turn = 0;
		this.done = 0;
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
			this.logFrameElem.append('<div class="inner"></div>');
			this.logElem = this.logFrameElem.children().last();
			this.logFrameElem.append('<div class="inner-preempt"></div>');
			this.logPreemptElem = this.logFrameElem.children().last();
			this.logFrameElem.append('<div class="inner-after"></div>');
		}

		this.updateGen();
		this.elem.append('<div class="backdrop" style="background-image:url(' + Tools.resourcePrefix + 'fx/' + this.backdropImage + ');display:block;opacity:0"></div>');
		this.bgElem = this.elem.children().last();
		this.bgElem.animate({
			opacity: 0.6
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

		this.elem.append('<div></div>');
		this.statElem = this.elem.children().last();

		this.elem.append('<div></div>');
		this.fxElem = this.elem.children().last();

		this.elem.append('<div class="leftbar"></div>');
		this.leftbarElem = this.elem.children().last();

		this.elem.append('<div class="rightbar"></div>');
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

		// activity queue state
		this.animationDelay = 0;
		this.multiHitMove = null;
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
		var willScroll = (this.logFrameElem.scrollTop() + 60 >= this.logElem.height() + this.logPreemptElem.height() - this.optionsElem.height() - this.logFrameElem.height());
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
	Battle.prototype.switchSides = function () {
		this.sidesSwitched = !this.sidesSwitched;
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
			this.log('<div class="spacer"></div>');
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
		this.log('<div>' + message + (hiddenmessage ? hiddenmessage : '') + '</div>');
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
		this.done = 1;
	};
	Battle.prototype.prematureEnd = function () {
		this.message('This replay ends here.');
		this.done = 1;
	};
	Battle.prototype.endLastTurn = function () {
		if (this.endLastTurnPending) {
			this.endLastTurnPending = false;
			this.mySide.updateStatbar(null, true);
			this.yourSide.updateStatbar(null, true);
		}
	};
	Battle.prototype.setTurn = function (turnnum) {
		turnnum = parseInt(turnnum);
		if (turnnum == this.turn + 1) {
			this.endLastTurnPending = true;
		}
		this.turn = turnnum;
		this.updatePseudoWeatherLeft();

		if (this.mySide.active[0]) this.mySide.active[0].clearTurnstatuses();
		if (this.mySide.active[1]) this.mySide.active[1].clearTurnstatuses();
		if (this.mySide.active[2]) this.mySide.active[2].clearTurnstatuses();
		if (this.yourSide.active[0]) this.yourSide.active[0].clearTurnstatuses();
		if (this.yourSide.active[1]) this.yourSide.active[1].clearTurnstatuses();
		if (this.yourSide.active[2]) this.yourSide.active[2].clearTurnstatuses();

		this.log('<h2>Turn ' + turnnum + '</h2>');

		var prevTurnElem = this.turnElem.children();
		if (this.fastForward) {
			if (prevTurnElem.length) prevTurnElem.html('Turn ' + turnnum);
			else this.turnElem.append('<div class="turn" style="display:block;opacity:1;left:110px;">Turn ' + turnnum + '</div>');
			if (this.turnCallback) this.turnCallback(this);
			if (this.fastForward > -1 && turnnum >= this.fastForward) {
				this.fastForwardOff();
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
	Battle.prototype.changeWeather = function (weather, poke, isUpkeep) {
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
				startMessage: 'A mysterious air current is protecting Flying-type Pokemon!',
				endMessage: 'The mysterious air current has dissipated!'
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
			if (poke) {
				this.message('<small>' + poke.getName() + newWeather.abilityMessage + '</small>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else if (isUpkeep) {
				this.log('<div><small>' + newWeather.upkeepMessage + '</small></div>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else if (weather === 'deltastream' || weather === 'desolateland' || weather === 'primordialsea') {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = 0;
				this.weatherMinTimeLeft = 0;
			} else {
				this.message('<small>' + newWeather.startMessage + '</small>');
				this.weatherTimeLeft = 8;
				this.weatherMinTimeLeft = 5;
			}
		}
		if (this.weather && !newWeather) {
			this.message(weatherTable[this.weather].endMessage);
		}
		this.updateWeather(weather);
	};
	Battle.prototype.updatePseudoWeatherLeft = function () {
		for (var i = 0; i < this.pseudoWeather.length; i++) {
			if (this.pseudoWeather[i][1] > 0) this.pseudoWeather[i][1]--;
		}
		this.updateWeather();
	};
	Battle.prototype.weatherLeft = function (weather) {
		if (weather) {
			for (var i = 0; i < this.pseudoWeather.length; i++) {
				if (this.pseudoWeather[i][0] === weather) {
					if (this.pseudoWeather[i][1]) {
						return ' <small>(' + this.pseudoWeather[i][1] + ' turn' + (this.pseudoWeather[i][1] == 1 ? '' : 's') + ' left)</small>';
					}
					return '';
				}
			}
			return ''; // weather doesn't exist
		}
		if (this.weatherMinTimeLeft != 0) {
			return ' <small>(' + this.weatherMinTimeLeft + ' or ' + this.weatherTimeLeft + ' turns left)</small>';
		}
		if (this.weatherTimeLeft != 0) {
			return ' <small>(' + this.weatherTimeLeft + ' turn' + (this.weatherTimeLeft == 1 ? '' : 's') + ' left)</small>';
		}
		return '';
	};
	Battle.prototype.updateWeather = function (weather) {
		var weatherNameTable = {
			sunnyday: 'Sun',
			desolateland: 'Intense Sun',
			raindance: 'Rain',
			primordialsea: 'Heavy Rain',
			sandstorm: 'Sandstorm',
			hail: 'Hail',
			deltastream: 'Strong Winds'
		};

		if (typeof weather === 'undefined') {
			weather = this.weather;
		}
		if (weather === '' || weather === 'none' || weather === 'pseudo') {
			weather = (this.pseudoWeather.length ? 'pseudo' : '');
		}

		var oldweather = this.weather;
		this.weather = weather;

		var weatherhtml = '';
		if (weather) {
			if (weather !== 'pseudo') {
				weatherhtml += weatherNameTable[weather] + this.weatherLeft();
			}
			for (var i = 0; i < this.pseudoWeather.length; i++) {
				weatherhtml += '<br />' + Tools.getMove(this.pseudoWeather[i][0]).name + this.weatherLeft(this.pseudoWeather[i][0]);
			}
		}
		if (weather === oldweather) {
			if (weather) this.weatherElem.html('<em>' + weatherhtml + '</em>');
			return;
		}
		if (oldweather) {
			if (weather) {
				var self = this;
				this.weatherElem.animate({
					opacity: 0
				}, 300, function () {
					self.weatherElem.css({
						display: 'block'
					});
					self.weatherElem.attr('class', 'weather ' + weather + 'weather');
					self.weatherElem.html('<em>' + weatherhtml + '</em>');
				});
			} else {
				this.weatherElem.animate({
					opacity: 0
				}, 500);
			}
		} else if (weather) {
			this.weatherElem.css({
				display: 'block',
				opacity: 0
			});
			this.weatherElem.attr('class', 'weather ' + weather + 'weather');
			this.weatherElem.html('<em>' + weatherhtml + '</em>');
		}
		if (weather) {
			if (this.fastForward) {
				this.weatherElem.css({opacity: .4});
				return;
			}
			this.weatherElem.animate({
				opacity: 1.0
			}, 400).animate({
				opacity: .4
			}, 400);
		}
	};
	Battle.prototype.resultAnim = function (pokemon, result, type, i) {
		if (this.fastForward) {
			pokemon.side.updateStatbar(pokemon, false, true);
			return;
		}
		if (!i) {
			i = 0;
		}
		this.fxElem.append('<div class="result ' + type + 'result"><strong>' + result + '</strong></div>');
		var effectElem = this.fxElem.children().last();
		effectElem.delay(i * 350 + this.animationDelay).css({
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
		this.activityWait(effectElem);
	};
	Battle.prototype.damageAnim = function (pokemon, damage, i) {
		if (!pokemon.statbarElem) return;
		if (!i) i = 0;
		pokemon.side.updateHPText(pokemon);

		this.resultAnim(pokemon, '&minus;' + damage, 'bad', i);

		var $hp = pokemon.statbarElem.find('div.hp').delay(this.animationDelay);
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'y') callback = function () {
			$hp.addClass('hp-yellow');
		};
		if (hpcolor === 'r') callback = function () {
			$hp.addClass('hp-yellow');
			$hp.addClass('hp-red');
		};

		if (this.fastForward) {
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
	Battle.prototype.healAnim = function (pokemon, damage, i) {
		if (!pokemon.statbarElem) return;
		if (!i) i = 0;
		pokemon.side.updateHPText(pokemon);

		this.resultAnim(pokemon, '+' + damage, 'good', i);

		var $hp = pokemon.statbarElem.find('div.hp').delay(this.animationDelay);
		var w = pokemon.hpWidth(150);
		var hpcolor = pokemon.getHPColor();
		var callback;
		if (hpcolor === 'g') callback = function () {
			$hp.removeClass('hp-yellow');
			$hp.removeClass('hp-red');
		};
		if (hpcolor === 'y') callback = function () {
			$hp.removeClass('hp-red');
		};

		if (this.fastForward) {
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
			switch (fromeffect.id) {
			case 'snatch':
				break;
			case 'magicbounce':
			case 'magiccoat':
			case 'rebound':
				this.resultAnim(pokemon, "Bounced", 'good');
				if (fromeffect.id === 'magiccoat') {
					pokemon.addTurnstatus('magiccoat');
				}
				this.message(target.getName() + "'s " + move.name + " was bounced back by " + fromeffect.name + "!");
				break;
			case 'metronome':
				this.message('Waggling a finger let it use <strong>' + move.name + '</strong>!');
				break;
			case 'naturepower':
				this.message('Nature Power turned into <strong>' + move.name + '</strong>!');
				break;
			case 'sleeptalk':
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
				} else if (window.Config && Config.server && Config.server.afd && (move.id === 'metronome' || move.id === 'sleeptalk' || move.id === 'assist')) {
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
					var buttons = ["A", "B", "START", "SELECT", "UP", "DOWN", "LEFT", "RIGHT", "DEMOCRACY", "ANARCHY"];
					var people = ["Zarel", "The Immortal", "Diatom", "Nani Man", "shaymin", "apt-get", "sirDonovan", "Arcticblast", "Goddess Briyella"];
					var button;
					for (var i = 0; i < 10; i++) {
						var name = people[Math.floor(Math.random() * people.length)];
						if (!button) button = buttons[Math.floor(Math.random() * buttons.length)];
						this.log('<div class="chat"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="' + Tools.escapeHTML(name) + '">' + Tools.escapeHTML(name) + ':</strong> <em>' + button + '</em></div>');
						button = (name === 'Diatom' ? "thanks diatom" : null);
					}
				} else if (window.Config && Config.server && Config.server.afd && (move.id === 'taunt')) {
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
				} else {
					this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
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
			if (kwargs.notarget) {
				target = pokemon.side.foe.missedPokemon;
			}
			if (kwargs.prepare || kwargs.anim === 'prepare') {
				this.prepareMove(pokemon, move, target);
			} else if (!kwargs.notarget) {
				(kwargs.anim ? Tools.getMove(kwargs.anim) : move).anim(this, [pokemon.sprite, target.sprite]);
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
		switch (effect.id) {
		case 'taunt':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' after the taunt!');
			break;
		case 'gravity':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of gravity!');
			break;
		case 'healblock':
			this.message('' + pokemon.getName() + ' can\'t use ' + move.name + ' because of Heal Block!');
			break;
		case 'imprison':
			this.message('' + pokemon.getName() + ' can\'t use its sealed ' + move.name + '!');
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
		case 'truant':
			this.resultAnim(pokemon, 'Truant', 'neutral');
			this.message('' + pokemon.getName() + ' is loafing around!');
			break;
		case 'recharge':
			BattleOtherAnims['selfstatus'].anim(this, [pokemon.sprite]);
			this.resultAnim(pokemon, 'Must recharge', 'neutral');
			this.message('<small>' + pokemon.getName() + ' must recharge!</small>');
			break;
		case 'focuspunch':
			this.resultAnim(pokemon, 'Lost focus', 'neutral');
			this.message(pokemon.getName() + ' lost its focus and couldn\'t move!');
			pokemon.removeTurnstatus('focuspunch');
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
		pokemon.sprite.anim({time: 1});
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
		var hiddenactions = '';
		var minors = this.minorQueue;
		if (this.multiHitMove && minors.length) {
			var lastMinor = minors[minors.length - 1];
			//if (lastMinor[0][0] === '-damage' || lastMinor[0][1]['subdamage']) this.animMultiHitMove();
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
			case '-center':
				actions += "Automatic center!";
				break;
			case '-damage':
				var poke = this.getPokemon(args[1]);
				var damage = poke.healthParse(args[2], true);
				if (damage === false) break;
				this.lastDamage = (damage[2] || 1); // not sure if this is used for anything
				var range = poke.getDamageRange(damage);
				this.damageAnim(poke, poke.getFormattedRange(range, 0, ' to '), animDelay);

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
						BattleStatusAnims['brn'].anim(this, [poke.sprite]);
						actions += "" + poke.getName() + " was hurt by its burn!";
						break;
					case 'psn':
						BattleStatusAnims['psn'].anim(this, [poke.sprite]);
						actions += "" + poke.getName() + " was hurt by poison!";
						break;
					case 'lifeorb':
						hiddenactions += "" + poke.getName() + " lost some of its HP!";
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
					case 'nightmare':
						actions += "" + poke.getName() + " is locked in a nightmare!";
						break;
					case 'confusion':
						actions += "It hurt itself in its confusion! ";
						break;
					case 'leechseed':
						if (!this.fastForward) {
							BattleOtherAnims.leech.anim(this, [ofpoke.sprite, poke.sprite]);
							this.activityWait(500);
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
				this.healAnim(poke, poke.getFormattedRange(range, 0, ' to '), animDelay);

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
						actions += "The healing wish came true for " + poke.getLowerName() + "!";
						this.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(this, [poke.sprite]);
						poke.side.wisher = null;
						break;
					case 'lunardance':
						actions += "" + poke.getName() + " became cloaked in mystical moonlight!";
						this.lastmove = 'healing-wish';
						Tools.getMove('healingwish').residualAnim(this, [poke.sprite]);
						poke.side.wisher = null;
						break;
					case 'wish':
						actions += "" + kwargs.wisher + "'s wish came true!";
						Tools.getMove('wish').residualAnim(this, [poke.sprite]);
						this.animationDelay += 500;
						break;
					case 'drain':
						actions += ofpoke.getName() + ' had its energy drained!';
						break;
					case 'leftovers':
					case 'shellbell':
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
				for (var k = 0; k < 2; k++) {
					var cpoke = this.getPokemon(args[1 + 2 * k]);
					if (cpoke) {
						var oldhp = cpoke.hp;
						cpoke.healthParse(args[2 + 2 * k]);
						var diff = parseFloat(args[2 + 2 * k]);
						if (isNaN(diff)) {
							diff = cpoke.hp - oldhp;
						}
						if (diff > 0) {
							this.healAnim(cpoke, diff, animDelay);
						} else {
							this.damageAnim(cpoke, -diff, animDelay);
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
				var amount = parseInt(args[3]);
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] += amount;
				this.resultAnim(poke, poke.getBoost(stat), 'good', animDelay);

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
							actions += "The " + effect.name + amountString + " raised " + poke.getLowerName() + "'s " + BattleStats[stat] + "!";
						} else {
							actions += "" + poke.getName() + "'s " + effect.name + amountString + " raised its " + BattleStats[stat] + "!";
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
				if (this.gen === 1 && stat === 'spd') break;
				if (this.gen === 1 && stat === 'spa') stat = 'spc';
				var amount = parseInt(args[3]);
				if (!poke.boosts[stat]) {
					poke.boosts[stat] = 0;
				}
				poke.boosts[stat] -= amount;
				this.resultAnim(poke, poke.getBoost(stat), 'bad', animDelay);

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
							actions += "The " + effect.name + amountString + " lowered " + poke.getLowerName() + "'s " + BattleStats[stat] + "!";
						} else {
							actions += "" + poke.getName() + "'s " + effect.name + amountString + " lowered its " + BattleStats[stat] + "!";
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
				this.resultAnim(poke, poke.getBoost(stat), (amount > 0 ? 'good' : 'bad'), animDelay);

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
				var stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
				var effect = Tools.getEffect(kwargs.from);
				for (var i = 0; i < stats.length; i++) {
					var tmp = poke.boosts[stats[i]];
					poke.boosts[stats[i]] = poke2.boosts[stats[i]];
					if (!poke.boosts[stats[i]]) delete poke.boosts[stats[i]];
					poke2.boosts[stats[i]] = tmp;
					if (!poke2.boosts[stats[i]]) delete poke2.boosts[stats[i]];
				}
				this.resultAnim(poke, 'Stats swapped', 'neutral', animDelay);
				this.resultAnim(poke2, 'Stats swapped', 'neutral', animDelay);

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
			case '-restoreboost':
				var poke = this.getPokemon(args[1]);
				for (i in poke.boosts) {
					if (poke.boosts[i] < 0) delete poke.boosts[i];
				}
				this.resultAnim(poke, 'Restored', 'good', animDelay);

				if (kwargs.silent) {
					// do nothing
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
					this.resultAnim(poke, 'Stats copied', 'neutral', animDelay);
					actions += "" + poke.getName() + " copied " + frompoke.getLowerName() + "'s stat changes!";
				}
				break;
			case '-clearboost':
				var poke = this.getPokemon(args[1]);
				poke.boosts = {};
				this.resultAnim(poke, 'Stats reset', 'neutral', animDelay);

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
				this.resultAnim(poke, 'Stats inverted', 'neutral', animDelay);

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
						this.resultAnim(this.mySide.active[slot], 'Stats reset', 'neutral', animDelay);
					}
					if (this.yourSide.active[slot]) {
						this.yourSide.active[slot].boosts = {};
						this.resultAnim(this.yourSide.active[slot], 'Stats reset', 'neutral', animDelay);
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
				if (poke) this.resultAnim(poke, 'Critical hit', 'bad', animDelay);
				actions += "A critical hit! ";
				break;

			case '-supereffective':
				var poke = this.getPokemon(args[1]);
				for (var j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[i + j][0][1]);
				if (poke) this.resultAnim(poke, 'Super-effective', 'bad', animDelay);
				actions += "It's super effective! ";
				break;

			case '-resisted':
				var poke = this.getPokemon(args[1]);
				for (var j = 1; !poke && j < 10; j++) poke = this.getPokemon(minors[i + j][0][1]);
				if (poke) this.resultAnim(poke, 'Resisted', 'neutral', animDelay);
				actions += "It's not very effective... ";
				break;

			case '-immune':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				this.resultAnim(poke, 'Immune', 'neutral', animDelay);
				switch (effect.id) {
				case 'confusion':
					actions += "" + poke.getName() + " doesn't become confused! ";
					break;
				default:
					if (kwargs.msg) {
						actions += "It doesn't affect " + poke.getLowerName() + "... ";
					} else if (kwargs.ohko) {
						actions += "" + poke.getName() + " is unaffected! ";
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
					this.resultAnim(target, 'Missed', 'neutral', animDelay);
				} else {
					actions += "" + user.getName() + "'s attack missed!";
				}
				break;

			case '-fail':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var fromeffect = Tools.getEffect(kwargs.from);
				if (poke) {
					this.resultAnim(poke, 'Failed', 'neutral', animDelay);
				}
				// Sky Drop blocking moves takes priority over all other moves
				if (fromeffect.id === 'skydrop') {
					actions += "Sky Drop won't let " + poke.getLowerName() + " go!";
					break;
				}
				switch (effect.id) {
				case 'brn':
					this.resultAnim(poke, 'Already burned', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already burned.";
					break;
				case 'tox':
				case 'psn':
					this.resultAnim(poke, 'Already poisoned', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already poisoned.";
					break;
				case 'slp':
					if (fromeffect.id === 'uproar') {
						this.resultAnim(poke, 'Failed', 'neutral', animDelay);
						if (kwargs.msg) {
							actions += "But " + poke.getLowerName() + " can't sleep in an uproar!";
						} else {
							actions += "But the uproar kept " + poke.getLowerName() + " awake!";
						}
					} else {
						this.resultAnim(poke, 'Already asleep', 'neutral', animDelay);
						actions += "" + poke.getName() + " is already asleep.";
					}
					break;
				case 'par':
					this.resultAnim(poke, 'Already paralyzed', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already paralyzed.";
					break;
				case 'frz':
					this.resultAnim(poke, 'Already frozen', 'neutral', animDelay);
					actions += "" + poke.getName() + " is already frozen.";
					break;
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
						actions += "There's no relief from this heavy rain!";
						break;
					case 'deltastream':
						actions += "The mysterious air current blows on regardless!";
						break;
					default:
						actions += "But it failed!";
					}
					break;
				case 'unboost':
					this.resultAnim(poke, 'Stat drop blocked', 'neutral', animDelay);
					actions += "" + poke.getName() + "'s " + (args[3] ? args[3] + " was" : "stats were") + " not lowered!";
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
				actions += "But there was no target...";
				break;

			case '-ohko':
				actions += "It's a one-hit KO!";
				break;

			case '-hitcount':
				var hits = parseInt(args[2]);
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

				switch (args[2]) {
				case 'brn':
					this.resultAnim(poke, 'Burned', 'brn', animDelay);
					actions += "" + poke.getName() + " was burned" + (effect.exists ? " by the " + effect.name : "") + "!";
					break;
				case 'tox':
					this.resultAnim(poke, 'Toxic poison', 'psn', animDelay);
					actions += "" + poke.getName() + " was badly poisoned" + (effect.exists ? " by the " + effect.name : "") + "!";
					break;
				case 'psn':
					this.resultAnim(poke, 'Poisoned', 'psn', animDelay);
					actions += "" + poke.getName() + " was poisoned!";
					break;
				case 'slp':
					if (effect.id === 'rest') {
						this.resultAnim(poke, 'Asleep', 'slp', animDelay);
						actions += '' + poke.getName() + ' slept and became healthy!';
					} else {
						this.resultAnim(poke, 'Asleep', 'slp', animDelay);
						actions += "" + poke.getName() + " fell asleep!";
					}
					break;
				case 'par':
					this.resultAnim(poke, 'Paralyzed', 'par', animDelay);
					actions += "" + poke.getName() + " is paralyzed! It may be unable to move!";
					break;
				case 'frz':
					this.resultAnim(poke, 'Frozen', 'frz', animDelay);
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

				if (effect.id) switch (effect.id) {
				case 'psychoshift':
					actions += '' + poke.getName() + ' moved its status onto ' + ofpoke.getLowerName() + '!';
					this.resultAnim(poke, 'Cured', 'good', animDelay);
					break;
				case 'flamewheel':
				case 'flareblitz':
				case 'fusionflare':
				case 'sacredfire':
				case 'scald':
				case 'steameruption':
					this.resultAnim(poke, 'Thawed', 'good', animDelay);
					actions += "" + poke.getName() + "'s " + effect.name + " melted the ice!";
					break;
				default:
					this.resultAnim(poke, 'Cured', 'good', animDelay);
					actions += "" + poke.getName() + "'s " + effect.name + " heals its status!";
					break;
				} else switch (args[2]) {
				case 'brn':
					this.resultAnim(poke, 'Burn cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " healed its burn!";
						break;
					}
					if (poke.side.n === 0) actions += "" + poke.getName() + "'s burn was healed.";
					else actions += "" + poke.getName() + " healed its burn!";
					break;
				case 'tox':
				case 'psn':
					this.resultAnim(poke, 'Poison cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its poison!";
						break;
					}
					actions += "" + poke.getName() + " was cured of its poisoning.";
					break;
				case 'slp':
					this.resultAnim(poke, 'Woke up', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " woke it up!";
						break;
					}
					actions += "" + poke.getName() + " woke up!";
					break;
				case 'par':
					this.resultAnim(poke, 'Paralysis cured', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " cured its paralysis!";
						break;
					}
					actions += "" + poke.getName() + " was cured of paralysis.";
					break;
				case 'frz':
					this.resultAnim(poke, 'Thawed', 'good', animDelay);
					if (effect.effectType === 'Item') {
						actions += "" + poke.getName() + "'s " + effect.name + " defrosted it!";
						break;
					}
					actions += "" + poke.getName() + " thawed out!";
					break;
				default:
					poke.removeVolatile('confusion');
					this.resultAnim(poke, 'Cured', 'good', animDelay);
					actions += "" + poke.getName() + "'s status cleared!";
				}
				break;

			case '-cureteam':
				var poke = this.getPokemon(args[1]);
				for (var k = 0; k < poke.side.pokemon.length; k++) {
					poke.side.pokemon[k].status = '';
					poke.side.updateStatbar(poke.side.pokemon[k]);
				}

				this.resultAnim(poke, 'Team Cured', 'good', animDelay);
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
					this.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				case 'frisk':
					if (kwargs.identify) { // used for gen 6
						actions += '' + ofpoke.getName() + ' frisked ' + poke.getLowerName() + ' and found its ' + item.name + '!';
						this.resultAnim(poke, item.name, 'neutral', animDelay);
					} else {
						actions += '' + ofpoke.getName() + ' frisked its target and found one ' + item.name + '!';
					}
					break;
				case 'thief':
				case 'covet':
				case 'pickpocket':
					actions += '' + poke.getName() + ' stole ' + ofpoke.getLowerName() + "'s " + item.name + "!";
					this.resultAnim(poke, item.name, 'neutral', animDelay);
					this.resultAnim(ofpoke, 'Item Stolen', 'bad', animDelay);
					break;
				case 'harvest':
					actions += '' + poke.getName() + ' harvested one ' + item.name + '!';
					this.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				case 'bestow':
					actions += '' + poke.getName() + ' received ' + item.name + ' from ' + ofpoke.getLowerName() + '!';
					this.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				default:
					actions += '' + poke.getName() + ' obtained one ' + item.name + '.';
					this.resultAnim(poke, item.name, 'neutral', animDelay);
					break;
				} else switch (item.id) {
				case 'airballoon':
					this.resultAnim(poke, 'Balloon', 'good', animDelay);
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
					this.lastmove = item.id;
				} else if (kwargs.weaken) {
					actions += 'The ' + item.name + ' weakened the damage to ' + poke.getLowerName();
					this.lastmove = item.id;
				} else if (effect.id) switch (effect.id) {
				case 'fling':
					actions += "" + poke.getName() + ' flung its ' + item.name + '!';
					break;
				case 'knockoff':
					actions += '' + ofpoke.getName() + ' knocked off ' + poke.getLowerName() + '\'s ' + item.name + '!';
					this.resultAnim(poke, 'Item knocked off', 'neutral', animDelay);
					break;
				case 'stealeat':
					actions += '' + ofpoke.getName() + ' stole and ate its target\'s ' + item.name + '!';
					break;
				case 'gem':
					actions += 'The ' + item.name + ' strengthened ' + Tools.getMove(kwargs.move).name + '\'s power!';
					break;
				case 'incinerate':
					actions += "" + poke.getName() + "'s " + item.name + " was burned up!";
					break;
				default:
					actions += "" + poke.getName() + ' lost its ' + item.name + '!';
					break;
				} else switch (item.id) {
				case 'airballoon':
					poke.removeVolatile('airballoon');
					this.resultAnim(poke, 'Balloon popped', 'neutral', animDelay);
					actions += "" + poke.getName() + "'s Air Balloon popped!";
					break;
				case 'focussash':
					this.resultAnim(poke, 'Sash', 'neutral', animDelay);
					actions += "" + poke.getName() + ' hung on using its Focus Sash!';
					break;
				case 'focusband':
					this.resultAnim(poke, 'Focus Band', 'neutral', animDelay);
					actions += "" + poke.getName() + ' hung on using its Focus Band!';
					break;
				case 'whiteherb':
					actions += "" + poke.getName() + " returned its status to normal using its White Herb!";
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
				if (!effect.id || kwargs.fail) {
					if (!poke.baseAbility) poke.baseAbility = ability.name;
				}

				if (kwargs.silent) {
					// do nothing
				} else if (effect.id) switch (effect.id) {
				case 'trace':
					this.resultAnim(poke, "Traced " + ability.name, 'good', animDelay);
					actions += "[" + poke.getName() + "'s Trace!]<br />";
					actions += '' + poke.getName() + ' traced ' + ofpoke.getLowerName() + '\'s ' + ability.name + '!';
					break;
				case 'roleplay':
					this.resultAnim(poke, "Copied " + ability.name, 'good', animDelay);
					actions += '' + poke.getName() + ' copied ' + ofpoke.getLowerName() + '\'s ' + ability.name + ' Ability!';
					break;
				case 'mummy':
					this.resultAnim(poke, "Acquired Mummy", 'neutral', animDelay);
					actions += "" + poke.getName() + "'s Ability became Mummy!";
					break;
				case 'desolateland':
					if (kwargs.fail) {
						actions += "[" + poke.getName() + "'s " + ability.name + "] The extremely harsh sunlight was not lessened at all!";
					}
					break;
				case 'primordialsea':
					if (kwargs.fail) {
						actions += "[" + poke.getName() + "'s " + ability.name + "] There's no relief from this heavy rain!";
					}
					break;
				case 'deltastream':
					if (kwargs.fail) {
						actions += "[" + poke.getName() + "'s " + ability.name + "] The mysterious air current blows on regardless!";
					}
					break;
				default:
					this.resultAnim(poke, "Acquired " + ability.name, 'ability', animDelay);
					actions += "" + poke.getName() + " acquired " + ability.name + "!";
					break;
				} else {
					actions += "[" + poke.getName() + "'s " + ability.name + "!]";
					this.resultAnim(poke, ability.name, 'ability', animDelay);
					switch (ability.id) {
					case 'pressure':
						actions += "<br />" + poke.getName() + " is exerting its pressure!";
						break;
					case 'moldbreaker':
						actions += "<br />" + poke.getName() + " breaks the mold!";
						break;
					case 'turboblaze':
						actions += "<br />" + poke.getName() + " is radiating a blazing aura!";
						break;
					case 'teravolt':
						actions += "<br />" + poke.getName() + " is radiating a bursting aura!";
						break;
					case 'intimidate':
						actions += '<br />' + poke.getName() + ' intimidates ' + ofpoke.getLowerName() + '!';
						break;
					case 'unnerve':
						actions += "<br />" + poke.getName() + "'s Unnerve makes " + this.getSide(args[3]).getLowerTeamName() + " too nervous to eat Berries!";
						break;
					case 'aurabreak':
						actions += "<br />" + poke.getName() + " reversed all other Pokémon's auras!";
						break;
					case 'fairyaura':
						actions += "<br />" + poke.getName() + " is radiating a fairy aura!";
						break;
					case 'darkaura':
						actions += "<br />" + poke.getName() + " is radiating a dark aura!";
						break;
					case 'airlock':
					case 'cloudnine':
						actions += "<br />The effects of the weather disappeared.";
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
					this.resultAnim(poke, ability.name + ' removed', 'bad', animDelay);
					if (!poke.baseAbility) poke.baseAbility = ability.name;
				} else {
					actions += "" + poke.getName() + "\'s Ability was suppressed!";
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
				poke.copyTypesFrom(tpoke);
				poke.ability = tpoke.ability;
				poke.volatiles.formechange[2] = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[2] : tpoke.species);
				this.resultAnim(poke, 'Transformed', 'good', animDelay);
				break;
			case '-formechange':
				var poke = this.getPokemon(args[1]);
				var template = Tools.getTemplate(args[2]);
				var spriteData = {'shiny': poke.sprite.sp.shiny};
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
				}
				poke.sprite.animTransform($.extend(spriteData, template));
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
					actions += "" + poke.getName() + "'s " + item.name + " is reacting to " + Tools.escapeHTML(poke.side.name) + "'s Mega Bracelet!";
				}
				actions += "<br />" + poke.getName() + " has Mega Evolved into Mega " + args[2] + "!";
				break;

			case '-start':
				var poke = this.getPokemon(args[1]);
				var effect = Tools.getEffect(args[2]);
				var ofpoke = this.getPokemon(kwargs.of);
				var fromeffect = Tools.getEffect(kwargs.from);
				poke.addVolatile(effect.id);

				if (kwargs.silent && effect.id !== 'typechange' && effect.id !== 'typeadd') {
					// do nothing
				} else switch (effect.id) {
				case 'typechange':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typechange[2] = args[3];
					poke.removeVolatile('typeadd');
					if (fromeffect.id) {
						if (fromeffect.id === 'reflecttype') {
							poke.copyTypesFrom(ofpoke);
							if (!kwargs.silent) actions += "" + poke.getName() + "'s type became the same as " + ofpoke.getLowerName() + "'s type!";
						} else if (!kwargs.silent) {
							actions += "" + poke.getName() + "'s " + fromeffect.name + " made it the " + args[3] + " type!";
						}
					} else if (!kwargs.silent) {
						actions += "" + poke.getName() + " transformed into the " + args[3] + " type!";
					}
					break;
				case 'typeadd':
					args[3] = Tools.escapeHTML(args[3]);
					poke.volatiles.typeadd[2] = args[3];
					if (kwargs.silent) break;
					actions += "" + args[3] + " type was added to " + poke.getLowerName() + "!";
					break;
				case 'powertrick':
					this.resultAnim(poke, 'Power Trick', 'neutral', animDelay);
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'foresight':
				case 'miracleeye':
					this.resultAnim(poke, 'Identified', 'bad', animDelay);
					actions += "" + poke.getName() + " was identified!";
					break;
				case 'telekinesis':
					this.resultAnim(poke, 'Telekinesis', 'neutral', animDelay);
					actions += "" + poke.getName() + " was hurled into the air!";
					break;
				case 'confusion':
					if (kwargs.already) {
						actions += "" + poke.getName() + " is already confused!";
					} else {
						this.resultAnim(poke, 'Confused', 'bad', animDelay);
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
					this.resultAnim(poke, 'Heal Block', 'bad', animDelay);
					actions += "" + poke.getName() + " was prevented from healing!";
					break;
				case 'mudsport':
					this.resultAnim(poke, 'Mud Sport', 'neutral', animDelay);
					actions += "Electricity's power was weakened!";
					break;
				case 'watersport':
					this.resultAnim(poke, 'Water Sport', 'neutral', animDelay);
					actions += "Fire's power was weakened!";
					break;
				case 'yawn':
					this.resultAnim(poke, 'Drowsy', 'slp', animDelay);
					actions += "" + poke.getName() + ' grew drowsy!';
					break;
				case 'flashfire':
					this.resultAnim(poke, 'Flash Fire', 'good', animDelay);
					actions += 'The power of ' + poke.getLowerName() + '\'s Fire-type moves rose!';
					break;
				case 'taunt':
					this.resultAnim(poke, 'Taunted', 'bad', animDelay);
					actions += '' + poke.getName() + ' fell for the taunt!';
					break;
				case 'imprison':
					this.resultAnim(poke, 'Imprisoning', 'good', animDelay);
					actions += "" + poke.getName() + " sealed any moves its target shares with it!";
					break;
				case 'disable':
					this.resultAnim(poke, 'Disabled', 'bad', animDelay);
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " was disabled!";
					break;
				case 'embargo':
					this.resultAnim(poke, 'Embargo', 'bad', animDelay);
					actions += "" + poke.getName() + " can't use items anymore!";
					break;
				case 'torment':
					this.resultAnim(poke, 'Tormented', 'bad', animDelay);
					actions += '' + poke.getName() + ' was subjected to torment!';
					break;
				case 'ingrain':
					this.resultAnim(poke, 'Ingrained', 'good', animDelay);
					actions += '' + poke.getName() + ' planted its roots!';
					break;
				case 'aquaring':
					this.resultAnim(poke, 'Aqua Ring', 'good', animDelay);
					actions += '' + poke.getName() + ' surrounded itself with a veil of water!';
					break;
				case 'stockpile1':
					this.resultAnim(poke, 'Stockpile', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 1!';
					break;
				case 'stockpile2':
					poke.removeVolatile('stockpile1');
					this.resultAnim(poke, 'Stockpile&times;2', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 2!';
					break;
				case 'stockpile3':
					poke.removeVolatile('stockpile2');
					this.resultAnim(poke, 'Stockpile&times;3', 'good', animDelay);
					actions += '' + poke.getName() + ' stockpiled 3!';
					break;
				case 'perish0':
					poke.removeVolatile('perish1');
					actions += '' + poke.getName() + "'s perish count fell to 0.";
					break;
				case 'perish1':
					poke.removeVolatile('perish2');
					this.resultAnim(poke, 'Perish next turn', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 1.";
					break;
				case 'perish2':
					poke.removeVolatile('perish3');
					this.resultAnim(poke, 'Perish in 2', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 2.";
					break;
				case 'perish3':
					this.resultAnim(poke, 'Perish in 3', 'bad', animDelay);
					actions += '' + poke.getName() + "'s perish count fell to 3.";
					break;
				case 'encore':
					this.resultAnim(poke, 'Encored', 'bad', animDelay);
					actions += '' + poke.getName() + ' received an encore!';
					break;
				case 'bide':
					this.resultAnim(poke, 'Bide', 'good', animDelay);
					actions += "" + poke.getName() + " is storing energy!";
					break;
				case 'slowstart':
					this.resultAnim(poke, 'Slow Start', 'bad', animDelay);
					actions += "" + poke.getName() + " can't get it going!";
					break;
				case 'attract':
					this.resultAnim(poke, 'Attracted', 'bad', animDelay);
					if (fromeffect.id) {
						actions += "" + poke.getName() + " fell in love from the " + fromeffect.name + "!";
					} else {
						actions += "" + poke.getName() + " fell in love!";
					}
					break;
				case 'autotomize':
					this.resultAnim(poke, 'Lightened', 'good', animDelay);
					actions += "" + poke.getName() + " became nimble!";
					break;
				case 'focusenergy':
					this.resultAnim(poke, '+Crit rate', 'good', animDelay);
					actions += "" + poke.getName() + " is getting pumped!";
					break;
				case 'curse':
					this.resultAnim(poke, 'Cursed', 'bad', animDelay);
					actions += "" + ofpoke.getName() + " cut its own HP and put a curse on " + poke.getLowerName() + "!";
					break;
				case 'nightmare':
					this.resultAnim(poke, 'Nightmare', 'bad', animDelay);
					actions += "" + poke.getName() + " began having a nightmare!";
					break;
				case 'magnetrise':
					this.resultAnim(poke, 'Magnet Rise', 'good', animDelay);
					actions += "" + poke.getName() + " levitated with electromagnetism!";
					break;
				case 'smackdown':
					this.resultAnim(poke, 'Smacked Down', 'bad', animDelay);
					actions += "" + poke.getName() + " fell straight down!";
					poke.removeVolatile('magnetrise');
					poke.removeVolatile('telekinesis');
					break;
				case 'substitute':
					if (kwargs.damage) {
						this.resultAnim(poke, 'Damage', 'bad', animDelay);
						actions += "The substitute took damage for " + poke.getLowerName() + "!";
					} else if (kwargs.block) {
						this.resultAnim(poke, 'Blocked', 'neutral', animDelay);
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

				// Gen 1
				case 'lightscreen':
					this.resultAnim(poke, 'Light Screen', 'good', animDelay);
					actions += '' + poke.getName() + '\'s protected against special attacks!';
					break;
				case 'reflect':
					this.resultAnim(poke, 'Reflect', 'good', animDelay);
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
					this.resultAnim(poke, 'Power Trick', 'neutral', animDelay);
					actions += "" + poke.getName() + " switched its Attack and Defense!";
					break;
				case 'telekinesis':
					this.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral', animDelay);
					actions += "" + poke.getName() + " was freed from the telekinesis!";
					break;
				case 'skydrop':
					if (kwargs.interrupt) {
						poke.sprite.anim({time: 100});
					}
					actions += "" + poke.getName() + " was freed from the Sky Drop!";
					break;
				case 'confusion':
					this.resultAnim(poke, 'Confusion&nbsp;ended', 'good', animDelay);
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
						this.resultAnim(poke, 'De-seeded', 'good', animDelay);
						actions += "" + poke.getName() + " was freed from Leech Seed!";
					}
					break;
				case 'healblock':
					this.resultAnim(poke, 'Heal Block ended', 'good', animDelay);
					actions += "" + poke.getName() + "'s Heal Block wore off!";
					break;
				case 'attract':
					this.resultAnim(poke, 'Attract&nbsp;ended', 'good', animDelay);
					if (fromeffect.id === 'oblivious') {
						actions += '' + poke.getName() + " got over its infatuation.";
					}
					if (fromeffect.id === 'mentalherb') {
						actions += "" + poke.getName() + " cured its infatuation status using its " + fromeffect.name + "!";
					}
					break;
				case 'taunt':
					this.resultAnim(poke, 'Taunt&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s taunt wore off!";
					break;
				case 'disable':
					this.resultAnim(poke, 'Disable&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s move is no longer disabled!";
					break;
				case 'embargo':
					this.resultAnim(poke, 'Embargo ended', 'good', animDelay);
					actions += "" + poke.getName() + " can use items again!";
					break;
				case 'torment':
					this.resultAnim(poke, 'Torment&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s torment wore off!";
					break;
				case 'encore':
					this.resultAnim(poke, 'Encore&nbsp;ended', 'good', animDelay);
					actions += '' + poke.getName() + "'s encore ended!";
					break;
				case 'bide':
					actions += "" + poke.getName() + " unleashed its energy!";
					break;
				case 'slowstart':
					this.resultAnim(poke, 'Slow Start ended', 'good', animDelay);
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
					this.resultAnim(poke, 'Faded', 'bad', animDelay);
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
					this.resultAnim(poke, 'Landed', 'neutral', animDelay);
					//actions += '' + poke.getName() + ' landed on the ground!';
					break;
				case 'quickguard':
					this.resultAnim(poke, 'Quick Guard', 'good', animDelay);
					actions += "Quick Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'wideguard':
					this.resultAnim(poke, 'Wide Guard', 'good', animDelay);
					actions += "Wide Guard protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'craftyshield':
					this.resultAnim(poke, 'Crafty Shield', 'good', animDelay);
					actions += "Crafty Shield protected " + poke.side.getLowerTeamName() + "!";
					break;
				case 'protect':
					this.resultAnim(poke, 'Protected', 'good', animDelay);
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'endure':
					this.resultAnim(poke, 'Enduring', 'good', animDelay);
					actions += '' + poke.getName() + ' braced itself!';
					break;
				case 'helpinghand':
					this.resultAnim(poke, 'Helping Hand', 'good', animDelay);
					actions += '' + ofpoke.getName() + " is ready to help " + poke.getLowerName() + "!";
					break;
				case 'focuspunch':
					this.resultAnim(poke, 'Focusing', 'neutral', animDelay);
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
					actions += '' + poke.getName() + ' is hoping to take its attacker down with it!';
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
					actions += "" + poke.getName() + "'s " + Tools.escapeHTML(args[3]) + " lost all of its PP due to the grudge!";
					break;
				case 'quickguard':
					poke.addTurnstatus('quickguard');
					this.resultAnim(poke, 'Quick Guard', 'good', animDelay);
					actions += "Quick Guard protected " + poke.getLowerName() + "!";
					break;
				case 'wideguard':
					poke.addTurnstatus('wideguard');
					this.resultAnim(poke, 'Wide Guard', 'good', animDelay);
					actions += "Wide Guard protected " + poke.getLowerName() + "!";
					break;
				case 'craftyshield':
					poke.addTurnstatus('craftyshield');
					this.resultAnim(poke, 'Crafty Shield', 'good', animDelay);
					actions += "Crafty Shield protected " + poke.getLowerName() + "!";
					break;
				case 'protect':
					poke.addTurnstatus('protect');
					this.resultAnim(poke, 'Protected', 'good', animDelay);
					actions += '' + poke.getName() + ' protected itself!';
					break;
				case 'substitute':
					if (kwargs.damage) {
						this.resultAnim(poke, 'Damage', 'bad', animDelay);
						actions += 'The substitute took damage for ' + poke.getLowerName() + '!';
					} else if (kwargs.block) {
						this.resultAnim(poke, 'Blocked', 'neutral', animDelay);
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
				case 'beatup':
					actions += "" + Tools.escapeHTML(kwargs.of) + "'s attack!";
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
						this.resultAnim(poke, pokeability, 'neutral', 1);
						this.resultAnim(ofpoke, ofpokeability, 'neutral', 4);
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
				case 'lockon':
				case 'mindreader':
					actions += '' + poke.getName() + ' took aim at ' + ofpoke.getLowerName() + '!';
					break;

				// ability activations
				case 'sturdy':
				case 'endure':
					actions += '' + poke.getName() + ' endured the hit!';
					break;
				case 'magicbounce':
				case 'magiccoat':
				case 'rebound':
					break;
				case 'wonderguard':
					this.resultAnim(poke, 'Immune', 'neutral', animDelay);
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
				case 'stickyhold':
					actions += "" + poke.getName() + "'s item cannot be stolen!";
					break;
				case 'suctioncups':
					actions += '' + poke.getName() + ' anchors itself!';
					break;
				case 'symbiosis':
					actions += '' + ofpoke.getName() + ' shared its ' + Tools.getItem(args[3]).name + ' with ' + poke.getLowerName();
					break;

				case 'deltastream':
					actions += "The mysterious air current weakened the attack!";
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
					actions += '' + poke.getName() + " hung on using its Focus Band!";
					break;
				case 'safetygoggles':
					actions += '' + poke.getName() + " is not affected by " + Tools.escapeHTML(args[3]) + " thanks to its Safety Goggles!";
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
					actions += "The Tailwind blew from behind " + side.getLowerTeamName() + "!";
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
					actions += "The spikes disappeared from around " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'toxicspikes':
					actions += "The poison spikes disappeared from around " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'stickyweb':
					actions += "The sticky web has disappeared from beneath " + side.getLowerTeamName() + "'s feet!";
					break;
				case 'tailwind':
					actions += "" + side.getTeamName() + "'s Tailwind petered out!";
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
				this.changeWeather(effect.name, poke, kwargs.upkeep);
				break;

			case '-fieldstart':
				var effect = Tools.getEffect(args[1]);
				var poke = this.getPokemon(kwargs.of);
				this.addPseudoWeather(effect.name, poke);

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
					actions += "Gravity intensified!";
					break;
				case 'mudsport':
					actions += "Electric's power was weakened!";
					break;
				case 'watersport':
					actions += "Fire's power was weakened!";
					break;
				case 'grassyterrain':
					actions += "Grass grew to cover the battlefield!";
					break;
				case 'mistyterrain':
					actions += "Mist swirled about the battlefield!";
					break;
				case 'electricterrain':
					actions += "An electric current runs across the battlefield!";
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
				default:
					actions += effect.name + " ended!";
					break;
				}
				break;

			case '-fieldactivate':
				var effect = Tools.getEffect(args[1]);
				switch (effect.id) {
				case 'perishsong':
					actions += 'All Pok&#xE9;mon that hear the song will faint in three turns!';
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
				hiddenactions += '(' + Tools.escapeHTML(args[1]) + ')';
				break;

			default:
				this.logConsole('Unknown minor: ' + args[0]);
				if (this.errorCallback) this.errorCallback(this);
				break;
			}
		}
		if (actions) {
			this.message('<small>' + actions + '</small>', hiddenactions ? '<small>' + hiddenactions + '</small>' : '');
		} else if (hiddenactions) {
			this.message('', '<small>' + hiddenactions + '</small>');
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
			output.level = parseInt(splitDetails[1].substr(1)) || 100;
		}
		if (splitDetails[0]) {
			output.species = splitDetails[0];
		}
		return output;
	};
	Battle.prototype.getPokemon = function (pokemonid, details) {
		var siden = -1;
		var name = pokemonid;
		var isNew = false; // if yes, don't match any pokemon that already exists (for Team Preview)
		var isOld = false; // if yes, match only pokemon that have been revealed, and can match fainted pokemon (now default)
		var isOther = false; // if yes, don't match an active pokemon (for switching)
		//var position = 0; // todo: use for position in doubles/triples
		var getfoe = false;
		var slot; // if there is an explicit slot for this pokemon
		var slotChart = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5};
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

		if (!slot) slot = 0;

		if (!details) {
			if (siden < 0) return null;
			if (this.sides[siden].active[slot]) return this.sides[siden].active[slot];
		}

		var species = name;
		var gender = '';
		var level = 100;
		var shiny = false;
		var searchid = '';
		if (details) searchid = pokemonid + '|' + details;

		var bestMatchName = null;
		if (siden !== this.p2.n && !isNew) {
			if (this.p1.active[slot] && this.p1.active[slot].searchid === searchid && !isOther) {
				this.p1.active[slot].slot = slot;
				return this.p1.active[slot];
			}
			for (var i = 0; i < this.p1.pokemon.length; i++) {
				var pokemon = this.p1.pokemon[i];
				if (pokemon.fainted && (isNew || isOther)) continue;
				if (isOther) {
					if (this.p1.active.indexOf(pokemon) >= 0) continue;
					if (pokemon == this.p1.lastPokemon && !this.p1.active[slot]) continue;
				}
				if (pokemon.searchid === searchid || (!pokemon.searchid && pokemon.checkDetails(details)) || (!searchid && pokemon.ident === pokemonid)) {
					if (!pokemon.searchid) {
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = this.p1.newPokemon(this.parseDetails(name, pokemonid, details), i);
						}
					}
					pokemon.slot = slot;
					return pokemon;
				}
			}
		}
		if (siden !== this.p1.n && !isNew) {
			if (this.p2.active[slot] && this.p2.active[slot].searchid === searchid && !isOther) {
				this.p2.active[slot].slot = slot;
				return this.p2.active[slot];
			}
			for (var i = 0; i < this.p2.pokemon.length; i++) {
				var pokemon = this.p2.pokemon[i];
				if (pokemon.fainted && (isNew || isOther)) continue;
				if (isOther) {
					if (this.p2.active.indexOf(pokemon) >= 0) continue;
					if (pokemon == this.p2.lastPokemon && !this.p2.active[slot]) continue;
				}
				if (pokemon.searchid === searchid || (!pokemon.searchid && pokemon.checkDetails(details)) || (!searchid && pokemon.ident === pokemonid)) {
					if (!pokemon.searchid) {
						pokemon.name = name;
						pokemon.searchid = searchid;
						pokemon.ident = pokemonid;
						if (pokemon.needsReplace) {
							pokemon = this.p2.newPokemon(this.parseDetails(name, pokemonid, details), i);
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
		if (siden < 0) siden = this.p1.n;
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
				level = parseInt(splitDetails[1].substr(1)) || 100;
			}
			if (splitDetails[0]) {
				species = splitDetails[0];
			}
		}
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
			var teamText = '';
			var text = '';
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
					y = Math.floor(96 - spriteData.h) / 2 + 50 + 3 * (i + 6 - this.sides[k].pokemon.length);
					x = Math.floor(96 - spriteData.w) / 2 + 180 + 50 * (i + 6 - this.sides[k].pokemon.length);
				} else {
					y = Math.floor(96 - spriteData.h) / 2 + 200 + 3 * i;
					x = Math.floor(96 - spriteData.w) / 2 + 100 + 50 * i;
				}
				if (teamText) teamText += ' / ';
				teamText += pokemon.species;
				text += '<img src="' + spriteData.url + '" width="' + spriteData.w + '" height="' + spriteData.h + '" style="position:absolute;top:' + y + 'px;left:' + x + 'px" />';
			}
			this.sides[k].totalPokemon = i;
			this.sides[k].updateSidebar();
			if (teamText) {
				this.log('<div class="chat"><strong>' + Tools.escapeHTML(this.sides[k].name) + '\'s team:</strong> <em style="color:#445566;display:block;">' + Tools.escapeHTML(teamText) + '</em></div>');
			}
			this.spriteElems[k].html(text);
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
		case 'turn':
			if (this.endPrevAction()) return;
			this.setTurn(args[1]);
			break;
		case 'tier':
			if (!args[1]) args[1] = '';
			for (var i in kwargs) args[1] += '[' + i + '] ' + kwargs[i];
			this.log('<div style="padding:5px 0"><small>Format:</small> <br /><strong>' + Tools.escapeHTML(args[1]) + '</strong></div>');
			this.tier = args[1];
			break;
		case 'gametype':
			this.gameType = args[1];
			if (args[1] === 'doubles') {
				if (this.mySide.active.length < 2) this.mySide.active.push(null);
				if (this.yourSide.active.length < 2) this.yourSide.active.push(null);
			}
			if (args[1] === 'triples' || args[1] === 'rotation') {
				if (this.mySide.active.length < 3) this.mySide.active.push(null);
				if (this.yourSide.active.length < 3) this.yourSide.active.push(null);
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
			name = args[1];
			if (this.ignoreSpects && (name.charAt(0) === ' ' || name.charAt(0) === '+')) break;
			if (this.ignoreOpponent && name.charAt(0) === '\u2605' && toUserid(name) !== app.user.get('userid')) break;
			if (window.app && app.ignore && app.ignore[toUserid(name)]) break;
			args.shift();
			args.shift();
			var clickableName;
			if (!/[A-Za-z0-9 ]/.test(name.charAt(0))) {
				clickableName = '<small>' + Tools.escapeHTML(name.charAt(0)) + '</small>' + Tools.escapeHTML(name.substr(1));
			} else {
				clickableName = Tools.escapeHTML(name);
			}
			var message = args.join('|');
			var mine = (toUserid(name) === (app && app.user && app.user.get('userid')) ? ' mine' : '');
			if (message.substr(0, 2) === '//') {
				this.log('<div class="chat chatmessage-' + toId(name) + mine + '"><strong style="' + hashColor(toUserid(name)) + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(message.substr(1)) + '</em></div>', preempt);
			} else if (message.substr(0, 4).toLowerCase() === '/me ') {
				this.log('<div class="chat chatmessage-' + toId(name) + mine + '"><strong style="' + hashColor(toUserid(name)) + '">&bull;</strong> <em>' + clickableName + ' <i>' + Tools.parseMessage(message.substr(4)) + '</i></em></div>', preempt);
			} else if (message.substr(0, 14).toLowerCase() === '/data-pokemon ') {
				if (window.Chart) this.log('<div class="chat"><ul class=\"utilichart\">' + Chart.pokemonRow(Tools.getTemplate(message.substr(14)), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0, 11).toLowerCase() === '/data-item ') {
				if (window.Chart) this.log('<div class="chat"><ul class=\"utilichart\">' + Chart.itemRow(Tools.getItem(message.substr(11)), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0, 14).toLowerCase() === '/data-ability ') {
				if (window.Chart) this.log('<div class="chat"><ul class=\"utilichart\">' + Chart.abilityRow(Tools.getAbility(message.substr(14)), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>', preempt);
			} else if (message.substr(0, 11).toLowerCase() === '/data-move ') {
				if (window.Chart) this.log('<div class="chat"><ul class=\"utilichart\">' + Chart.moveRow(Tools.getMove(message.substr(11)), '', {}, false, true) + '<li style=\"clear:both\"></li></ul></div>', preempt);
			} else {
				this.log('<div class="chat chatmessage-' + toId(name) + mine + '"><strong style="' + hashColor(toUserid(name)) + '" class="username" data-name="' + Tools.escapeHTML(name) + '">' + clickableName + ':</strong> <em>' + Tools.parseMessage(message) + '</em></div>', preempt);
			}
			break;
		case 'chatmsg':
			args.shift();
			this.log('<div class="chat">' + Tools.escapeHTML(args.join('|')) + '</div>', preempt);
			break;
		case 'chatmsg-raw':
		case 'raw':
		case 'html':
			args.shift();
			this.log('<div class="chat">' + Tools.sanitizeHTML(args.join('|')) + '</div>', preempt);
			break;
		case 'pm':
			this.log('<div class="chat"><strong>' + Tools.escapeHTML(args[1]) + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + Tools.escapeHTML(args[2], true) + '\')">(Private to ' + Tools.escapeHTML(args[3]) + ')</i> ' + Tools.parseMessage(args[4], args[1]) + '</span>');
			break;
		case 'askreg':
			this.log('<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="' + Tools.escapeHTML(args[1]) + '"><b>Register</b></button></div>');
			break;
		case 'inactive':
			this.kickingInactive = true;
			args.shift();
			this.log('<div class="chat message-error">' + Tools.escapeHTML(args.join('|')) + '</div>', preempt);
			break;
		case 'inactiveoff':
			this.kickingInactive = false;
			args.shift();
			this.log('<div class="chat message-error">' + Tools.escapeHTML(args.join('|')) + '</div>', preempt);
			break;
		case 'join':
		case 'j':
			if (!this.ignoreSpects) {
				this.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' joined.</small></div>', preempt);
			}
			break;
		case 'leave':
		case 'l':
			if (!this.ignoreSpects) {
				this.log('<div class="chat"><small>' + Tools.escapeHTML(args[1]) + ' left.</small></div>', preempt);
			}
			break;
		case 'J':
		case 'L':
		case 'spectator':
		case 'spectatorleave':
			break;
		case 'player':
			this.getSide(args[1]).setName(args[2]);
			this.getSide(args[1]).setSprite(args[3]);
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
			poke.sprite.animTransform($.extend(spriteData, template));
			poke.sprite.oldsp = null;
			poke.spriteid = template.spriteid;
			poke.side.updateStatbar();

			poke.species = newSpecies;
			poke.ability = poke.baseAbility = (template.abilities ? template.abilities['0'] : '');
			poke.baseStats = template.baseStats;
			poke.types = template.types && template.types.slice(0);

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];
			poke.side.updateSidebar();
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
			var poke = this.getPokemon('other: ' + args[1], args[2]);
			var slot = poke.slot;
			poke.healthParse(args[3]);
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
				var poke = this.getPokemon('other: ' + args[1]);
				poke.side.swapWith(poke, this.getPokemon('other: ' + args[2]), kwargs);
			} else {
				var poke = this.getPokemon(args[1]);
				poke.side.swapTo(poke, args[2], kwargs);
			}
			break;
		case 'move':
			this.endLastTurn();
			if (!kwargs.from && this.waitForResult()) return;
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
			if (this.done || this.endPrevAction()) return;
			break;
		case 'error':
			args.shift();
			this.message('<strong>Error:</strong> ' + Tools.escapeHTML(args.join('|')));
			this.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			break;
		case 'warning':
			args.shift();
			this.message('<strong>Warning:</strong> ' + Tools.escapeHTML(args.join('|')));
			this.message('Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer\'s Smogon thread</a>');
			this.activityWait(1000);
			break;
		case 'gen':
			this.gen = parseInt(args[1]);
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
		case 'choice':
			break;
		case 'unlink':
			if (Tools.prefs('nounlink')) return;
			var user = toId(args[2]) || toId(args[1]);
			var $messages = $('.chatmessage-' + user);
			if (!$messages.length) break;
			$messages.find('a').contents().unwrap();
			if (window.BattleRoom && args[2]) {
				$messages.hide();
				this.log('<div class="chatmessage-' + user + '"><button name="revealMessages" value="' + user + '"><small>View ' + $messages.length + ' hidden message' + ($messages.length > 1 ? 's' : '') + '</small></button></div>');
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
		} else {
			var args = ['done'], kwargs = {};
			if (str !== '|') {
				args = str.substr(1).split('|');
			}
			while (args[args.length - 1] && args[args.length - 1].substr(0, 1) === '[') {
				var bracketPos = args[args.length - 1].indexOf(']');
				if (bracketPos <= 0) break;
				var argstr = args.pop();
				// default to '.' so it evaluates to boolean true
				kwargs[argstr.substr(1, bracketPos - 1)] = ($.trim(argstr.substr(bracketPos + 1)) || '.');
			}

			// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
			var nextLine = '', nextArgs = [''], nextKwargs = {};
			nextLine = this.activityQueue[this.activityStep + 1];
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
				this.log('<div class="chat">Error parsing: ' + Tools.escapeHTML(str) + '</div>', preempt);
				if (e.stack) {
					var stack = '' + e.stack;
					stack = stack.split("\n").slice(0, 2).join("\n");
					this.log('<div class="chat" style="white-space:pre-wrap">' + Tools.escapeHTML(stack) + '</div>', preempt);
				} else {
					this.log('<div class="chat">Error: ' + Tools.escapeHTML('' + e) + '</div>', preempt);
				}
				if (this.errorCallback) this.errorCallback(this);
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
		this.paused = true;
		this.playbackState = 3;
		if (this.resumeButton) {
			this.frameElem.append('<div class="playbutton"><button data-action="resume"><i class="icon-play"></i> Resume</button></div>');
			this.frameElem.find('div.playbutton button').click(this.resumeButton);
		}
		this.soundPause();
	};
	Battle.prototype.play = function () {
		if (this.fastForward) {
			this.paused = false;
			this.playbackState = 5;
		} else if (this.paused) {
			this.paused = false;
			if (this.playbackState === 1) {
				this.soundStop();
			}
			this.playbackState = 2;
			if (!this.done) {
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
		time = parseInt(time);
		if (isNaN(time)) return;
		if (this.activityStep >= this.activityQueue.length - 1 && time >= this.turn + 1 && !this.activityQueueActive) return;
		if (this.done && time >= this.turn + 1) return;
		this.messagebarElem.empty().css({
			opacity: 0,
			height: 0
		});
		if (time <= this.turn && time !== -1) {
			var paused = this.paused;
			this.reset();
			this.activityQueueActive = true;
			if (paused) this.pause();
			else this.paused = false;
			this.fastForward = time;
			this.elem.append('<div class="seeking"><strong>seeking...</strong></div>');
			$.fx.off = true;
			this.elem.find(':animated').finish();
			this.swapQueues();
			this.nextActivity();
			return;
		}
		this.fxElem.empty();
		this.fastForward = time;
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
				if (this.done) {
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
		if (this.noPreload) return;
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
		if (this.noPreload) return;
		for (var i in BattleEffects) {
			if (BattleEffects[i].url) this.preloadImage(BattleEffects[i].url);
		}
		this.preloadImage(Tools.resourcePrefix + 'fx/weather-raindance.jpg'); // rain is used often enough to precache
		this.preloadImage(Tools.resourcePrefix + 'sprites/bw/substitute.png');
		this.preloadImage(Tools.resourcePrefix + 'sprites/bw-back/substitute.png');
		//this.preloadImage(Tools.resourcePrefix + 'fx/bg.jpg');
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
		switch (bgmNum) {
		case -1:
			BattleSound.loadBgm('audio/bw2-homika-dogars.mp3', 1661, 68131);
			this.bgm = 'audio/bw2-homika-dogars.mp3';
			break;
		case 0:
			BattleSound.loadBgm('audio/hgss-kanto-trainer.mp3', 13003, 94656);
			this.bgm = 'audio/hgss-kanto-trainer.mp3';
			break;
		case 1:
			BattleSound.loadBgm('audio/bw-subway-trainer.mp3', 15503, 110984);
			this.bgm = 'audio/bw-subway-trainer.mp3';
			break;
		case 2:
			BattleSound.loadBgm('audio/bw-trainer.mp3', 14629, 110109);
			this.bgm = 'audio/bw-trainer.mp3';
			break;
		case 3:
			BattleSound.loadBgm('audio/bw-rival.mp3', 19180, 57373);
			this.bgm = 'audio/bw-rival.mp3';
			break;
		case 4:
			BattleSound.loadBgm('audio/dpp-trainer.mp3', 13440, 96959);
			this.bgm = 'audio/dpp-trainer.mp3';
			break;
		case 5:
			BattleSound.loadBgm('audio/hgss-johto-trainer.mp3', 23731, 125086);
			this.bgm = 'audio/hgss-johto-trainer.mp3';
			break;
		case 6:
			BattleSound.loadBgm('audio/dpp-rival.mp3', 13888, 66352);
			this.bgm = 'audio/dpp-rival.mp3';
			break;
		case 7:
			BattleSound.loadBgm('audio/bw2-kanto-gym-leader.mp3', 14626, 58986);
			this.bgm = 'audio/bw2-kanto-gym-leader.mp3';
			break;
		case 8:
			BattleSound.loadBgm('audio/bw2-rival.mp3', 7152, 68708);
			this.bgm = 'audio/bw2-rival.mp3';
			break;
		case 9:
			BattleSound.loadBgm('audio/xy-trainer.mp3', 7802, 82469);
			this.bgm = 'audio/xy-trainer.mp3';
			break;
		case 10:
			BattleSound.loadBgm('audio/xy-rival.mp3', 7802, 58634);
			this.bgm = 'audio/xy-rival.mp3';
			break;
		case 11:
			BattleSound.loadBgm('audio/oras-trainer.mp3', 13579, 91548);
			this.bgm = 'audio/oras-trainer.mp3';
			break;
		default:
			BattleSound.loadBgm('audio/oras-rival.mp3', 14303, 69149);
			this.bgm = 'audio/oras-rival.mp3';
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
