/*

License: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>


This license DOES extend to all images in the fx/ folder, with the exception of icicle.png, lightning.png, and bone.png.

icicle.png and lightning.png by Clint Bellanger are triple-licensed GPLv2/GPLv3/CC-BY-SA-3.0.
  <http://opengameart.org/content/icicle-spell>
  <http://opengameart.org/content/lightning-shock-spell>


rocks.png, rock1.png, rock2.png by PO user "Gilad" is licensed GPLv3.


This license DOES NOT extend to any images in the sprites/ folder.


This license DOES NOT extend to any other files of the Pokemon replay viewer.

*/

var BattleEffects = {
	wisp: {
		url: 'wisp.png',
		w: 100, h: 100
	},
	poisonwisp: {
		url: 'poisonwisp.png',
		w: 100, h: 100
	},
	waterwisp: {
		url: 'waterwisp.png',
		w: 100, h: 100
	},
	mudwisp: {
		url: 'mudwisp.png',
		w: 100, h: 100
	},
	fireball: {
		url: 'fireball.png',
		w: 64, h: 64
	},
	bluefireball: {
		url: 'bluefireball.png',
		w: 64, h: 64
	},
	icicle: {
		url: 'icicle.png', // http://opengameart.org/content/icicle-spell
		w: 80, h: 60
	},
	lightning: {
		url: 'lightning.png', // by Pokemon Showdown user SailorCosmos
		w: 41, h: 229
	},
	rocks: {
		url: 'rocks.png', // Pokemon Online - Gilad
		w: 100, h: 100
	},
	rock1: {
		url: 'rock1.png', // Pokemon Online - Gilad
		w: 64, h: 80
	},
	rock2: {
		url: 'rock2.png', // Pokemon Online - Gilad
		w: 66, h: 72
	},
	rock3: {
		url: 'rock3.png', // by Pokemon Showdown user SailorCosmos
		w: 66, h: 72
	},
	leaf1: {
		url: 'leaf1.png',
		w: 32, h: 26
	},
	leaf2: {
		url: 'leaf2.png',
		w: 40, h: 26
	},
	bone: {
		url: 'bone.png',
		w: 29, h: 29
	},
	caltrop: {
		url: 'caltrop.png', // by Pokemon Showdown user SailorCosmos
		w: 80, h: 80
	},
	poisoncaltrop: {
		url: 'poisoncaltrop.png', // by Pokemon Showdown user SailorCosmos
		w: 80, h: 80
	},
	shadowball: {
		url: 'shadowball.png',
		w: 100, h: 100
	},
	energyball: {
		url: 'energyball.png',
		w: 100, h: 100
	},
	electroball: {
		url: 'electroball.png',
		w: 100, h: 100
	},
	mistball: {
		url: 'mistball.png',
		w: 100, h: 100
	},
	iceball: {
		url: 'iceball.png',
		w: 100, h: 100
	},
	flareball: {
		url: 'flareball.png',
		w: 100, h: 100
	},
	pokeball: {
		url: 'pokeball.png',
		w: 24, h: 24
	},
	fist: {
		url: 'fist.png', // by Pokemon Showdown user SailorCosmos
		w: 55, h: 49
	},
	foot: {
		url: 'foot.png', // by Pokemon Showdown user SailorCosmos
		w: 50, h: 75
	},
	topbite: {
		url: 'topbite.png',
		w: 108, h: 64
	},
	bottombite: {
		url: 'bottombite.png',
		w: 108, h: 64
	},
	web: {
		url: 'web.png', // by Pokemon Showdown user SailorCosmos
		w: 120, h: 122
	},
	leftclaw: {
		url: 'leftclaw.png',
		w: 44, h: 60
	},
	rightclaw: {
		url: 'rightclaw.png',
		w: 44, h: 60
	},
	leftslash: {
		url: 'leftslash.png', // by Pokemon Showdown user Modeling Clay
		w: 57, h: 56
	},
	rightslash: {
		url: 'rightslash.png', // by Pokemon Showdown user Modeling Clay
		w: 57, h: 56
	},
	leftchop: {
		url: 'leftchop.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 130
	},
	rightchop: {
		url: 'rightchop.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 130
	},
	angry: {
		url: 'angry.png', // by Pokemon Showdown user SailorCosmos
		w: 30, h: 30
	},
	heart: {
		url: 'heart.png', // by Pokemon Showdown user SailorCosmos
		w: 30, h: 30
	},
	pointer: {
		url: 'pointer.png', // by Pokemon Showdown user SailorCosmos
		w: 100, h: 100
	},
	sword: {
		url: 'sword.png', // by Pokemon Showdown user SailorCosmos
		w: 48, h: 100
	},
	impact: {
		url: 'impact.png', // by Pokemon Showdown user SailorCosmos
		w: 127, h: 119
	},
	stare: {
		url: 'stare.png',
		w: 100, h: 35
	},
	shine: {
		url: 'shine.png', // by Smogon user Jajoken
		w: 127, h: 119
	},
	alpha: {
		url: 'alpha.png', // Ripped from Pokemon Global Link
		w: 80, h: 80
	},
	omega: {
		url: 'omega.png', // Ripped from Pokemon Global Link
		w: 80, h: 80
	},
	rainbow: {
		url: 'rainbow.png',
		w: 128, h: 128
	},
	none: {
		// this is for passing to battle.pos() and battle.posT() for CSS effects
		w: 100, h: 100
	}
};
(function () {
	if (!window.Tools || !Tools.resourcePrefix) return;
	for (var i in BattleEffects) {
		if (!BattleEffects[i].url) continue;
		BattleEffects[i].url = Tools.fxPrefix + BattleEffects[i].url;
	}
})();
var BattleBackdropsThree = [
	'bg-gen3.png',
	'bg-gen3-cave.png',
	'bg-gen3-ocean.png',
	'bg-gen3-sand.png',
	'bg-gen3-forest.png',
	'bg-gen3-arena.png'
];
var BattleBackdropsFour = [
	'bg-gen4.png',
	'bg-gen4-cave.png',
	'bg-gen4-snow.png',
	'bg-gen4-indoors.png',
	'bg-gen4-water.png'
];
var BattleBackdropsFive = [
	'bg-beach.png',
	'bg-beachshore.png',
	'bg-desert.png',
	'bg-meadow.png',
	'bg-thunderplains.png',
	'bg-city.png',
	'bg-earthycave.png',
	'bg-mountain.png',
	'bg-volcanocave.png',
	'bg-dampcave.png',
	'bg-forest.png',
	'bg-river.png',
	'bg-deepsea.png',
	'bg-icecave.png',
	'bg-route.png'
];
var BattleBackdrops = [
	'bg-aquacordetown.jpg',
	'bg-beach.jpg',
	'bg-city.jpg',
	'bg-dampcave.jpg',
	'bg-darkbeach.jpg',
	'bg-darkcity.jpg',
	'bg-darkmeadow.jpg',
	'bg-deepsea.jpg',
	'bg-desert.jpg',
	'bg-earthycave.jpg',
	'bg-elite4drake.jpg',
	'bg-forest.jpg',
	'bg-icecave.jpg',
	'bg-leaderwallace.jpg',
	'bg-library.jpg',
	'bg-meadow.jpg',
	'bg-orasdesert.jpg',
	'bg-orassea.jpg',
	'bg-skypillar.jpg'
];
var BattleStats = {
	atk: 'Attack', def: 'Defense', spa: 'Special Attack', spd: 'Special Defense', spe: 'Speed', accuracy: 'accuracy', evasion: 'evasiveness', spc: 'Special'
};
var BattleItems = {
};
var BattleOtherAnims = {
	attack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.5
			}, 'linear');
		}
	},
	contactattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(500);
		}
	},
	xattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);
		}
	},
	slashattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(500);

			battle.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
		}
	},
	clawattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('leftclaw', {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 370
			}, {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('leftclaw', {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 370
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('rightclaw', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 670
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000
			}, 'linear', 'fade');
			battle.showEffect('rightclaw', {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 670
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000
			}, 'linear', 'fade');
		}
	},
	punchattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	bite: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('topbite', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				scale: .5,
				opacity: 0,
				time: 370
			}, {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('bottombite', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: .5,
				opacity: 0,
				time: 370
			}, {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
		}
	},
	kick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.x,
				y: defender.y - 20,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	fastattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 260
			}, {
				scale: 2,
				opacity: 0,
				time: 560
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 310
			}, {
				scale: 2,
				opacity: 0,
				time: 610
			}, 'linear');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: .5
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500
			}, 'decel');
			defender.delay(260);
			defender.anim({
				z: defender.behind(30),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	sneakattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				opacity: 1,
				time: 250
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'linear');
			defender.delay(330);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(350);
		}
	},
	spinattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic2');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(500);
		}
	},
	selfstatus: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 0,
				opacity: 1,
				time: 300
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200
			}, {
				scale: 0,
				opacity: 1,
				time: 500
			}, 'linear');
		}
	},
	lightstatus: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			}, {
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	chargestatus: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball', {
				x: attacker.x - 60,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 60,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 30,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 70,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 500
			}, 'linear', 'fade');
		}
	},
	heal: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('iceball', {
				x: attacker.x + 30,
				y: attacker.y + 5,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 200
			}, {
				x: attacker.x + 40,
				y: attacker.y + 10,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('iceball', {
				x: attacker.x - 30,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 300
			}, {
				x: attacker.x - 40,
				y: attacker.y - 20,
				opacity: 0,
				time: 700
			}, 'accel');
			battle.showEffect('iceball', {
				x: attacker.x + 15,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 400
			}, {
				x: attacker.x + 25,
				y: attacker.y + 20,
				opacity: 0,
				time: 800
			}, 'accel');
			battle.showEffect('iceball', {
				x: attacker.x - 15,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 500
			}, {
				x: attacker.x - 25,
				y: attacker.y - 40,
				opacity: 0,
				time: 900
			}, 'accel');
		}
	},
	shiny: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.backgroundEffect('#000000', 800, 0.3, 100);
			battle.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.7,
				time: 450
			}, {
				y: attacker.y + 35,
				opacity: 0,
				time: 675
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x + 15,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 475
			}, {
				x: attacker.x + 25,
				y: attacker.y + 30,
				opacity: 0,
				time: 700
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x - 15,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 500
			}, {
				x: attacker.x - 25,
				y: attacker.y + 30,
				opacity: 0,
				time: 725
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 5,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 550
			}, {
				x: attacker.x - 30,
				y: attacker.y - 5,
				opacity: 0,
				time: 775
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x + 15,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 650
			}, {
				x: attacker.x + 35,
				y: attacker.y - 5,
				opacity: 0,
				time: 875
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
				time: 675
			}, {
				y: attacker.y - 20,
				opacity: 0,
				time: 900
			}, 'decel');
		}
	},
	flight: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: attacker.leftof(-200),
				y: attacker.y + 80,
				z: attacker.z,
				opacity: 0,
				time: 350
			}, 'accel');
			attacker.anim({
				x: defender.leftof(-200),
				y: defender.y + 80,
				z: defender.z,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'accel');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700
			}, {
				scale: 2,
				opacity: 0,
				time: 900
			}, 'linear');
			attacker.anim({
				x: defender.leftof(100),
				y: defender.y - 40,
				z: defender.z,
				opacity: 0,
				time: 175
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250
			}, 'decel');
			defender.delay(700);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	shake: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10, time: 200});
			attacker.anim({x: attacker.x + 10, time: 300});
			attacker.anim({x: attacker.x, time: 200});
		}
	},
	dance: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10});
			attacker.anim({x: attacker.x + 10});
			attacker.anim({x: attacker.x});
		}
	},
	leech: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0.1
			}, 'ballistic2', 'fade');
			battle.showEffect('energyball', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 50
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0.1
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: defender.x + 20,
				y: defender.y - 25,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0.1
			}, 'ballistic2Under', 'fade');
		}
	},
	drain: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 50
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0
			}, 'linear');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0
			}, 'ballistic2Under');
		}
	},
	hydroshot: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	sound: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 0
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 150
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 300
			}, {
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	gravity: {
		anim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				y: attacker.y - 20,
				yscale: 0.5,
				time: 300
			}, 'decel');
			attacker.delay(200);
			attacker.anim({
				time: 300
			});
		}
	},
	futuresighthit: {
		anim: function (battle, args) {
			var defender = args[0];
			battle.backgroundEffect('#AA44BB', 250, 0.6);
			battle.backgroundEffect('#AA44FF', 250, 0.6, 400);
			defender.anim({
				scale: 1.2,
				time: 100
			});
			defender.anim({
				scale: 1,
				time: 100
			});
			defender.anim({
				scale: 1.4,
				time: 150
			});
			defender.anim({
				scale: 1,
				time: 150
			});
			battle.activityWait(700);
		}
	},
	doomdesirehit: {
		anim: function (battle, args) {
			var defender = args[0];

			battle.backgroundEffect('#ffffff', 600, 0.6);
			battle.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: .6
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 150
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 300
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');

			defender.delay(100);
			defender.anim({
				x: defender.x - 30,
				time: 75
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	itemoff: {
		anim: function (battle, args) {
			var defender = args[0];

			battle.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1
			}, {
				x: defender.x,
				y: defender.y + 40,
				z: defender.behind(70),
				opacity: 0,
				time: 400
			}, 'ballistic2');
		}
	},
	anger: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('angry', {
				x: attacker.x + 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0
			}, {
				scale: 1,
				opacity: 1,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: attacker.x - 20,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 1,
				opacity: 1,
				time: 500
			}, 'ballistic2Under', 'fade');
		}
	},
	primalalpha: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#0000DD', 500, 0.4);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('alpha', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 2.5,
				opacity: 0,
				time: 600
			}, 'decel');
		}
	},
	primalomega: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#B84038', 500, 0.4);
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('omega', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 2.5,
				opacity: 0,
				time: 600
			}, 'decel');
		}
	},
	megaevo: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#835BA5', 500, 0.6);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 0.5,
				opacity: 1,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300
			}, {
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
		}
	}
};
var BattleStatusAnims = {
	brn: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('fireball', {
				x: attacker.x - 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.3
			}, {
				x: attacker.x + 40,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300
			}, 'swing', 'fade');
		}
	},
	psn: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 100
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y,
				scale: 1,
				opacity: 0.5,
				time: 500
			}, 'decel', 'fade');
		}
	},
	slp: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 600
			}, 'ballistic2Under', 'fade');
		}
	},
	par: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2
			}, {
				scale: 2,
				opacity: .1,
				time: 300
			}, 'linear', 'fade');
		}
	},
	frz: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('icicle', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 0.9,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				scale: 0.9,
				opacity: 0,
				time: 650
			}, 'linear', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 400
			}, {
				scale: 0.9,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
		}
	},
	flinch: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			}, {
				scale: 3,
				opacity: .1,
				time: 300
			}, 'linear', 'fade');
		}
	},
	attracted: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('heart', {
				x: attacker.x + 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0
			}, {
				scale: 1,
				opacity: 1,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('heart', {
				x: attacker.x - 20,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('heart', {
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 1,
				opacity: 1,
				time: 500
			}, 'ballistic2Under', 'fade');
		}
	},
	confused: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: .1,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x - 50,
				scale: .15,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: .1,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x + 50,
				scale: .15,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: .1,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x - 50,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: .15,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x + 50,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
		}
	}
};
BattleStatusAnims['focuspunch'] = {anim:BattleStatusAnims['flinch'].anim};

var BattleMoveAnims = {
	taunt: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.dance.anim(battle, args);
			battle.showEffect('pointer', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1
			}, {
				x: attacker.x + 30,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x + 60,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 900
			}, 'linear');

			battle.showEffect('angry', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 1,
				opacity: 1,
				time: 500
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				scale: 1,
				opacity: 1,
				time: 600
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 400
			}, {
				scale: 1,
				opacity: 1,
				time: 700
			}, 'ballistic2Under', 'fade');
		}
	},
	quash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 15,
				yscale: 0.5,
				time: 300
			}, 'swing');
			defender.anim({
				time: 300
			}, 'decel');

			battle.showEffect('rightchop', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.1,
				time: 400
			}, {
				y: defender.y,
				scale: 0.25,
				opacity: 1,
				time: 700
			}, 'decel', 'explode');
		}
	},
	swagger: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.shake.anim(battle, args);

			battle.showEffect('angry', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0
			}, {
				scale: 1,
				opacity: 1,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('angry', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 1,
				opacity: 1,
				time: 500
			}, 'ballistic2Under', 'fade');
		}
	},
	swordsdance: {
		anim: function (battle, args) {
			var defender = args[1];

			BattleOtherAnims.shake.anim(battle, args);
			battle.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: 0.4,
				time: 200
			}, 'ballistic2', 'fade');
			battle.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: .4,
				time: 200
			}, 'ballistic2back', 'fade');
			battle.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 200
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: .4,
				time: 400
			}, 'ballistic2', 'fade');
			battle.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 200
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: .4,
				time: 400
			}, 'ballistic2back', 'fade');
			battle.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: .4,
				time: 600
			}, 'ballistic2', 'fade');
			battle.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: .4,
				time: 600
			}, 'ballistic2Back', 'fade');
		}
	},
	quiverdance: {
		anim: function (battle, args) {
			var attacker = args[0];

			BattleOtherAnims.shake.anim(battle, args);
			battle.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x0,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800
			}, 'accel');
		}
	},
	dragondance: {
		anim: function (battle, args) {
			var attacker = args[0];

			BattleOtherAnims.shake.anim(battle, args);
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0
			}, {
				x: attacker.x - 50,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 300
			}, 'ballistic');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150
			}, {
				x: attacker.x + 60,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 450
			}, 'ballistic');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				x: attacker.x + 10,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'ballistic');
		}
	},
	agility: {
		anim: BattleOtherAnims.shake.anim
	},
	doubleteam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.shake.anim(battle, args);
			battle.showEffect(attacker.sp, {
				x: defender.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				time: 500
			}, 'decel');
			battle.showEffect(attacker.sp, {
				x: defender.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				time: 500
			}, 'decel');
		}
	},
	metronome: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1
			}, {
				x: attacker.x + 40,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 200
			}, 'decel', 'fade');
			battle.showEffect('pointer', {
				x: attacker.x + 40,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 200
			}, {
				x: attacker.x + 30,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 400
			}, 'decel');
		}
	},
	teeterdance: {
		anim: BattleOtherAnims.shake.anim
	},
	splash: {
		anim: BattleOtherAnims.shake.anim
	},
	encore: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10, time: 100});
			attacker.anim({x: attacker.x + 10, time: 200});
			attacker.anim({x: attacker.x, time: 100});
		}
	},
	attract: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.shake.anim(battle, args);
			battle.showEffect('heart', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0
			}, {
				scale: 1,
				opacity: 1,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('heart', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('heart', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 1,
				opacity: 1,
				time: 500
			}, 'ballistic2Under', 'fade');
		}
	},
	raindance: {
		anim: BattleOtherAnims.dance.anim
	},
	sunnyday: {
		anim: BattleOtherAnims.dance.anim
	},
	hail: {
		anim: BattleOtherAnims.dance.anim
	},
	sandstorm: {
		anim: BattleOtherAnims.dance.anim
	},
	gravity: {
		anim: function () {
			// do not give Gravity an animation,
			// it'll conflict with the gravity animation in BattleOtherAnims
			// this one prevents the wisp from showing up
		}
	},
	trickroom: {
		anim: BattleOtherAnims.dance.anim
	},
	magicroom: {
		anim: BattleOtherAnims.dance.anim
	},
	wonderroom: {
		anim: BattleOtherAnims.dance.anim
	},
	afteryou: {
		anim: BattleOtherAnims.dance.anim
	},
	allyswitch: {
		anim: function () {
			// do not give Ally Switch an animation,
			// it'll conflict with the animation of the switch itself
		}
	},
	babydolleyes: {
		anim: BattleOtherAnims.dance.anim
	},
	faketears: {
		anim: BattleOtherAnims.dance.anim
	},
	featherdance: {
		anim: BattleOtherAnims.dance.anim
	},
	followme: {
		anim: function (battle, args) {
			var attacker = args[0];

			BattleOtherAnims.dance.anim(battle, args);
			battle.showEffect('pointer', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 100
			}, {
				y: attacker.y + 60,
				opacity: 1,
				time: 550
			}, 'decel', 'fade');
		}
	},
	foresight: {
		anim: BattleOtherAnims.dance.anim
	},
	mimic: {
		anim: BattleOtherAnims.dance.anim
	},
	sketch: {
		anim: BattleOtherAnims.dance.anim
	},
	odorsleuth: {
		anim: BattleOtherAnims.dance.anim
	},
	playnice: {
		anim: BattleOtherAnims.dance.anim
	},
	tailwhip: {
		anim: BattleOtherAnims.dance.anim
	},
	leer: {
		anim: BattleOtherAnims.dance.anim
	},
	haze: {
		anim: function (battle, args) {
			battle.backgroundEffect('#FFFFFF', 1000, 0.3);
			BattleOtherAnims.dance.anim(battle, args);
		}
	},
	electricterrain: {
		anim: function (battle, args) {
			battle.backgroundEffect('#FFFF00', 1000, 0.3);
			BattleOtherAnims.dance.anim(battle, args);
		}
	},
	grassyterrain: {
		anim: function (battle, args) {
			battle.backgroundEffect('#9AB440', 1000, 0.3);
			BattleOtherAnims.dance.anim(battle, args);
		}
	},
	mistyterrain: {
		anim: function (battle, args) {
			battle.backgroundEffect('#FF99FF', 1000, 0.3);
			BattleOtherAnims.dance.anim(battle, args);
		}
	},
	topsyturvy: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
		}
	},
	embargo: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
		}
	},
	healblock: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 400
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 800
			}, 'linear', 'fade');
		}
	},
	flash: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#ffffff', 600, 0.6);
			battle.showEffect('wisp', {
				x: attacker.leftof(-10),
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.8
			}, {
				scale: 15,
				opacity: 0.8,
				time: 500
			}, 'linear', 'fade');
		}
	},
	tailwind: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1,
				time: 200
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1,
				time: 400
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 700
			}, 'linear', 'fade');
		}
	},
	aerialace: {
		anim: BattleOtherAnims.flight.anim
	},
	bravebird: {
		anim: BattleOtherAnims.flight.anim
	},
	acrobatics: {
		anim: BattleOtherAnims.flight.anim
	},
	flyingpress: {
		anim: BattleOtherAnims.flight.anim
	},
	steelwing: {
		anim: BattleOtherAnims.flight.anim
	},
	wingattack: {
		anim: BattleOtherAnims.flight.anim
	},
	dragonbreath: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
		}
	},
	dragonpulse: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xstep = (defender.x - attacker.x) / 5;
			var ystep = (defender.y - attacker.y) / 5;
			var zstep = (defender.z - attacker.z) / 5;

			for (var i = 0; i < 5; i++) {
				battle.showEffect('wisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1,
					opacity: 1,
					time: 20 * i
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600
				}, 'linear');
				battle.showEffect('poisonwisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.5,
					opacity: 0.3,
					time: 20 * i
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600
				}, 'linear');
			}
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-15),
				scale: 0.5,
				opacity: 0.6
			}, {
				scale: 0.6,
				opacity: 0.2,
				time: 400
			}, 'linear', 'fade');

			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 300
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 500
			}, 'linear', 'explode');
		}
	},
	focusblast: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038', 700, .6);
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3
			}, {
				scale: .6,
				opacity: 1,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3,
				time: 100
			}, {
				scale: .8,
				opacity: .6,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: .6,
				opacity: .8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: .8,
				time: 800
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(10),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	aurasphere: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#cc9900', 500, 0.6);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3
			}, {
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100
			}, {
				z: attacker.behind(-30),
				scale: 0.8,
				opacity: 0.6,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				scale: 3,
				opacity: 0.1,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: 0.8,
				time: 800
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(5),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	technoblast: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3
			}, {
				z: attacker.behind(-30),
				scale: .6,
				opacity: 1,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3,
				time: 100
			}, {
				z: attacker.behind(-30),
				scale: .8,
				opacity: .6,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: .6,
				opacity: .8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: .8,
				time: 800
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(5),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	painsplit: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 200
			}, {
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 200
			}, {
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	flail: {
		anim: BattleOtherAnims.xattack.anim
	},
	uturn: {
		anim: BattleOtherAnims.spinattack.anim
	},
	rapidspin: {
		anim: BattleOtherAnims.spinattack.anim
	},
	gyroball: {
		anim: BattleOtherAnims.spinattack.anim
	},
	voltswitch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0
			}, {
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200
			}, {
				scale: 8,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.2,
				time: 500
			}, {
				scale: 4,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
		}
	},
	discharge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0
			}, {
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 150
			}, {
				scale: 8,
				opacity: .1,
				time: 750
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 300
			}, {
				scale: 8,
				opacity: .1,
				time: 900
			}, 'linear', 'fade');
		}
	},
	bugbuzz: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 0
			}, {
				scale: 8,
				opacity: .07,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 100
			}, {
				scale: 8,
				opacity: .07,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 200
			}, {
				scale: 8,
				opacity: .07,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500
			}, {
				scale: 2,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
		}
	},
	explosion: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('fireball', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: .6
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: .6,
				time: 150
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: attacker.x + 10,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0,
				opacity: .6,
				time: 300
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			attacker.delay(450).anim({
				scale: 4,
				time: 400,
				opacity: 0
			}, 'linear');
		}
	},
	reflect: {
		anim: function () {}
	},
	safeguard: {
		anim: function () {}
	},
	lightscreen: {
		anim: function () {}
	},
	mist: {
		anim: function () {}
	},
	transform: {
		anim: function () {}
	},
	bellydrum: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('leftchop', {
				x: attacker.x - 20,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 1
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 100
			}, 'linear', 'fade');
			battle.showEffect('rightchop', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 150
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 250
			}, 'linear', 'fade');
			battle.showEffect('leftchop', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 350
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 450
			}, 'linear', 'fade');
			battle.showEffect('rightchop', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 500
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('impact', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 100
			}, {
				scale: 1,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('impact', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 250
			}, {
				scale: 1,
				opacity: 0,
				time: 550
			}, 'linear');
			battle.showEffect('impact', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 400
			}, {
				scale: 1,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('impact', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 550
			}, {
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	aromatherapy: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	healbell: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	magiccoat: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	protect: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	detect: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	kingsshield: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	spikyshield: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	craftyshield: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	matblock: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	quickguard: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	wideguard: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	endure: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	bide: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	focusenergy: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	rockpolish: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('leftslash', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3
			}, {
				opacity: 0,
				time: 300
			}, 'decel');
			battle.showEffect('rightslash', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 100
			}, {
				opacity: 0,
				time: 400
			}, 'decel');
			battle.showEffect('leftslash', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 200
			}, {
				opacity: 0,
				time: 500
			}, 'decel');
			battle.showEffect('rightslash', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 200
			}, {
				opacity: 0,
				time: 500
			}, 'decel');

			battle.showEffect('shine', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6
			}, {
				opacity: 0,
				time: 300
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100
			}, {
				opacity: 0,
				time: 400
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 200
			}, {
				opacity: 0,
				time: 500
			}, 'decel');
			battle.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 300
			}, {
				opacity: 0,
				time: 600
			}, 'accel');

			battle.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('shine', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 800
			}, 'accel');
		}
	},
	harden: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	defensecurl: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	irondefense: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	rest: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 400
			}, 'ballistic2Under', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 600
			}, 'ballistic2Under', 'fade');
		}
	},
	howl: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	acupressure: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('pointer', {
				x: attacker.x - 5,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1
			}, {
				scale: 0.25,
				opacity: 1,
				time: 300
			}, 'linear', 'explode');

			battle.showEffect('lightning', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				scale: 0.8,
				opacity: 0,
				time: 600
			}, 'linear');
		}
	},
	curse: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	shiftgear: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	bulkup: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 500
			}, {
				x: attacker.leftof(-30),
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.3,
				time: 800
			}, 'ballistic2Under', 'fade');

			attacker.anim({
				scale: 1.25,
				time: 200
			}, 'linear');
			attacker.delay(300);
			attacker.anim({
				time: 200
			}, 'decel');
		}
	},
	workup: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	honeclaws: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	shellsmash: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	stockpile: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	swallow: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	ingrain: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	aquaring: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	coil: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	conversion: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	conversion2: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	powertrick: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	ragepowder: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	refresh: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5
			}, {
				scale: 1.5,
				opacity: 0,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'linear', 'fade');
		}
	},
	recycle: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	doomdesire: {
		anim: function (battle, args) {

			battle.backgroundEffect('#000000', 300, 0.2);
			battle.backgroundEffect('#000000', 300, 0.3, 200);
		}
	},
	teleport: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	cottonguard: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	defendorder: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	meditate: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	sharpen: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	withdraw: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	roost: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	softboiled: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	milkdrink: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	slackoff: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	celebrate: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	happyhour: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	snatch: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	acidarmor: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 0,
				opacity: 1,
				time: 300
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200
			}, {
				scale: 0,
				opacity: 1,
				time: 500
			}, 'linear');
		}
	},
	barrier: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	amnesia: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	morningsun: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect("url('fx/weather-sunnyday.jpg')", 700, 0.5);
			battle.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 200
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600
			}, 'accel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 300
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 700
			}, 'accel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 400
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800
			}, 'accel', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 500
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 900
			}, 'accel', 'fade');
		}
	},
	moonlight: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 200
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600
			}, 'accel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 300
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 700
			}, 'accel', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 400
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800
			}, 'accel', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 500
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 900
			}, 'accel', 'fade');

			battle.showEffect('wisp', {
				x: 0,
				y: +175,
				z: +50,
				scale: 1.5,
				opacity: 1
			}, {
				time: 700
			}, 'accel', 'fade');
			battle.showEffect('iceball', {
				x: 0,
				y: +175,
				z: +50,
				scale: 0.5,
				opacity: 0.8
			}, {
				time: 700
			}, 'accel', 'fade');
		}
	},
	cosmicpower: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.backgroundEffect("url('fx/bg-space.jpg')", 600, 0.6);
			battle.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x0,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800
			}, 'accel');
		}
	},
	charge: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	luckychant: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	geomancy: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('mistball', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('electroball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800
			}, 'accel');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' is absorbing power!';
		}
	},
	magnetrise: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x0,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800
			}, 'accel');
		}
	},
	substitute: {
		anim: function () {}
	},
	batonpass: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				opacity: 0.1,
				time: 200
			}, 'accel');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 200
			}, {
				scale: 4,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
		}
	},
	calmmind: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			}, {
				scale: 0,
				opacity: .5,
				time: 400
			}, 'linear');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 200
			}, {
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	nastyplot: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.backgroundEffect('#000000', 700, 0.3);

			battle.showEffect('wisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 0
			}, {
				scale: 1,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x - 20,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 50
			}, {
				scale: 1,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 100
			}, {
				scale: 1,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('pointer', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 300
			}, {
				y: attacker.y + 60,
				time: 750
			}, 'decel', 'fade');
		}
	},
	minimize: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 0
			}, {
				y: attacker.y - 20,
				scale: 0.75,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 200
			}, {
				y: attacker.y - 25,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'accel');

			attacker.anim({
				y: attacker.y - 30,
				scale: 0.25,
				time: 600
			}, 'linear');
			attacker.anim({
				time: 300
			}, 'accel');
		}
	},
	growth: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 0
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 200
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'accel');

			attacker.anim({
				scale: 1.25,
				time: 600
			}, 'linear');
			attacker.anim({
				time: 300
			}, 'accel');
		}
	},
	tailglow: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			}, {
				scale: 1,
				opacity: .5,
				time: 400
			}, 'linear', 'explode');
		}
	},
	trick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0
			}, {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300
			}, {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900
			}, 'ballistic2', 'explode');
			battle.showEffect('pokeball', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900
			}, 'ballistic2Under', 'explode');
		}
	},
	switcheroo: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0
			}, {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300
			}, {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900
			}, 'ballistic2', 'explode');
			battle.showEffect('pokeball', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900
			}, 'ballistic2Under', 'explode');
		}
	},
	skillswap: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, 'ballistic2Under');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'ballistic2Under');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'ballistic');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 800
			}, 'ballistic');
		}
	},
	recover: {
		anim: BattleOtherAnims.chargestatus.anim
	},
	shadowforce: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 1,
				time: 350
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		},
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' vanished instantly!';
		}
	},
	bounce: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			}, {
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y + 80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		},
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' sprang up!';
		}
	},
	dig: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			}, {
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		},
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y - 80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' burrowed its way under the ground!';
		}
	},
	dive: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			}, {
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'decel');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'accel');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'decel');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		},
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y - 80,
				time: 300
			}, 'swing');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' hid underwater!';
		}
	},
	fly: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' flew up high!';
		}
	},
	skydrop: {
		anim: BattleOtherAnims.contactattack.anim,
		prepareAnim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300
			}, 'linear');
			defender.anim({
				opacity: 0.2,
				y: defender.y + 80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon, pokemon2) {
			return pokemon.getName() + ' took ' + pokemon2.getLowerName() + ' into the sky!';
		}
	},
	skullbash: {
		anim: BattleOtherAnims.contactattack.anim,
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.8,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' tucked in its head!';
		}
	},
	skyattack: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim: function (battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.8,
				time: 300
			}, 'linear');
		},
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' became cloaked in a harsh light!';
		}
	},
	hiddenpower: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			for (var i = 0; i < 4; i++) {
				battle.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel', 'fade');
				battle.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel', 'fade');
			}
		}
	},
	storedpower: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			for (var i = 0; i < 4; i++) {
				battle.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	seedflare: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: .4,
				time: 0
			}, {
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			for (var i = 0; i < 4; i++) {
				battle.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: .2,
					opacity: 1
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: .3,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: .2,
					opacity: 1
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: .3,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	powerwhip: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);

			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('leaf1', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x,
				y: defender.y - 60,
				scale: 1.5,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('leaf2', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x + 60,
				y: defender.y,
				scale: 1.5,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('leaf2', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x,
				y: defender.y + 60,
				scale: 1.5,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('leaf1', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x - 60,
				y: defender.y,
				scale: 1.5,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
		}
	},
	woodhammer: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);

			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('leaf1', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 700
			}, 'decel', 'fade');
			battle.showEffect('leaf2', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 800
			}, 'decel', 'fade');
			battle.showEffect('leaf2', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 900
			}, 'decel', 'fade');
		}
	},
	crushclaw: {
		anim: BattleOtherAnims.clawattack.anim
	},
	falseswipe: {
		anim: BattleOtherAnims.slashattack.anim
	},
	dragonclaw: {
		anim: BattleOtherAnims.clawattack.anim
	},
	metalclaw: {
		anim: BattleOtherAnims.clawattack.anim
	},
	furycutter: {
		anim: BattleOtherAnims.slashattack.anim
	},
	scratch: {
		anim: BattleOtherAnims.slashattack.anim
	},
	cut: {
		anim: BattleOtherAnims.slashattack.anim
	},
	slash: {
		anim: BattleOtherAnims.slashattack.anim
	},
	nightslash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			BattleOtherAnims.contactattack.anim(battle, args);

			battle.showEffect('rightslash', {
				x: defender.x + 5,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('rightslash', {
				x: defender.x - 5,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600
			}, {
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear', 'fade');
		}
	},
	shadowclaw: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			BattleOtherAnims.clawattack.anim(battle, args);
		}
	},
	holdback: {
		anim: BattleOtherAnims.contactattack.anim
	},
	knockdown: {
		anim: BattleOtherAnims.contactattack.anim
	},
	seismictoss: {
		anim: BattleOtherAnims.contactattack.anim
	},
	peck: {
		anim: BattleOtherAnims.contactattack.anim
	},
	drillpeck: {
		anim: BattleOtherAnims.contactattack.anim
	},
	irontail: {
		anim: BattleOtherAnims.contactattack.anim
	},
	bite: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	superfang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	bugbite: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	crunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	pursuit: {
		anim: BattleOtherAnims.contactattack.anim
	},
	blazekick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.kick.anim(battle, args);
		}
	},
	lowkick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 50,
				z: defender.behind(20),
				scale: 1.7,
				opacity: 0,
				time: 650
			}, 'linear');

			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(20),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	jumpkick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.kick.anim(battle, args);
		}
	},
	highjumpkick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 25
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0)
			}, 'ballistic', 'fade');
			battle.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 75
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0)
			}, 'ballistic', 'fade');
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 900
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 750
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 170,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 200
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(500);
			defender.anim({
				y: defender.y - 5,
				z: defender.behind(40),
				yscale: 0.9,
				time: 300
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	ironhead: {
		anim: BattleOtherAnims.contactattack.anim
	},
	slam: {
		anim: BattleOtherAnims.contactattack.anim
	},
	dragontail: {
		anim: BattleOtherAnims.contactattack.anim
	},
	reversal: {
		anim: BattleOtherAnims.contactattack.anim
	},
	punishment: {
		anim: BattleOtherAnims.contactattack.anim
	},
	forcepalm: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.6,
				opacity: 0.1,
				time: 350
			}, {
				x: defender.x + 20,
				scale: 0.5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('rightchop', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.5,
				opacity: 1,
				time: 500
			}, {
				x: defender.x - 15,
				opacity: 0,
				time: 800
			}, 'decel', 'fade');
			battle.showEffect('rightchop', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.5,
				opacity: 0.3,
				time: 575
			}, {
				x: defender.x - 15,
				opacity: 0,
				time: 850
			}, 'decel', 'fade');

			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	circlethrow: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 0.6,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	knockoff: {
		anim: BattleOtherAnims.contactattack.anim
	},
	assurance: {
		anim: BattleOtherAnims.contactattack.anim
	},
	chipaway: {
		anim: BattleOtherAnims.contactattack.anim
	},
	heavyslam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 2,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 600
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	steamroller: {
		anim: BattleOtherAnims.contactattack.anim
	},
	heartstamp: {
		anim: BattleOtherAnims.contactattack.anim
	},
	pound: {
		anim: BattleOtherAnims.contactattack.anim
	},
	clamp: {
		anim: BattleOtherAnims.contactattack.anim
	},
	wakeupslap: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			battle.showEffect('rightchop', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.behind(-10),
				scale: 0.6,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				xscale: 0,
				opacity: 0.5,
				time: 512.5
			}, 'linear', 'fade');
			battle.showEffect('leftchop', {
				x: defender.x,
				y: defender.y - 10,
				z: defender.behind(-10),
				scale: 0.6,
				xscale: 0,
				opacity: 1,
				time: 512.5
			}, {
				x: defender.x - 30,
				y: defender.y,
				xscale: 0.6,
				opacity: 0,
				time: 625
			}, 'linear', 'fade');
		}
	},
	smellingsalts: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0.9,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	karatechop: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			battle.showEffect('rightchop', {
				x: defender.leftof(30),
				y: defender.y + 50,
				z: defender.behind(-10),
				scale: 0.6,
				opacity: 1,
				time: 475
			}, {
				y: defender.y - 20,
				opacity: 0.5,
				time: 550
			}, 'linear', 'fade');
		}
	},
	crosschop: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			battle.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 425
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('leftslash', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 425
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');

			battle.showEffect('leftchop', {
				x: defender.x + 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 60,
				y: defender.y - 70,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('rightchop', {
				x: defender.x - 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400
			}, {
				x: defender.x + 60,
				y: defender.y - 70,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
		}
	},
	lick: {
		anim: BattleOtherAnims.contactattack.anim
	},
	vicegrip: {
		anim: BattleOtherAnims.contactattack.anim
	},
	headbutt: {
		anim: BattleOtherAnims.contactattack.anim
	},
	block: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('leftslash', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, {
				scale: 1,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
		}
	},
	xscissor: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425
			}, {
				scale: 2,
				opacity: 0.5,
				time: 725
			}, 'linear', 'fade');
			battle.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625
			}, {
				scale: 3,
				opacity: 0,
				time: 1000
			}, 'linear', 'fade');
			battle.showEffect('leftslash', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625
			}, {
				scale: 3,
				opacity: 0,
				time: 1000
			}, 'linear', 'fade');
		}
	},
	facade: {
		anim: BattleOtherAnims.xattack.anim
	},
	guillotine: {
		anim: BattleOtherAnims.xattack.anim
	},
	'return': {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('heart', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'ballistic2Under', 'fade');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(750);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 300
			}, 'decel');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('foot', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 650
			}, {
				x: defender.x - 15,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 950
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 875
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 700
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 725
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 925
			}, 'linear', 'explode');
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 1000
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1300
			}, 'linear');
		}
	},
	leafblade: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.xattack.anim(battle, args);
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 450
			}, {
				scale: 2,
				opacity: 0.2,
				time: 750
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 750
			}, {
				scale: 2,
				opacity: 0.2,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('leaf1', {
				x: defender.x - 35,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 450
			}, {
				scale: 3,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('leaf2', {
				x: defender.x + 35,
				y: defender.y - 15,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 550
			}, {
				scale: 3.5,
				opacity: 0,
				time: 850
			}, 'linear');
			battle.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 450
			}, {
				scale: 2,
				opacity: 0,
				time: 800
			}, 'accel', 'fade');
			battle.showEffect('leaf1', {
				x: defender.x - 35,
				y: defender.y - 15,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 750
			}, {
				scale: 3,
				opacity: 0,
				time: 1050
			}, 'linear');
			battle.showEffect('leaf2', {
				x: defender.x + 35,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 800
			}, {
				scale: 3.5,
				opacity: 0,
				time: 1190
			}, 'linear');
			battle.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 750
			}, {
				scale: 2,
				opacity: 0,
				time: 1100
			}, 'accel', 'fade');
		}
	},
	thrash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('angry', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'ballistic2Under', 'fade');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(750);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 300
			}, 'decel');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('foot', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 650
			}, {
				x: defender.x - 15,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 950
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 875
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 700
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 725
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 925
			}, 'linear', 'explode');
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 1000
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1300
			}, 'linear');
		}
	},
	submission: {
		anim: BattleOtherAnims.xattack.anim
	},
	pluck: {
		anim: BattleOtherAnims.xattack.anim
	},
	bind: {
		anim: BattleOtherAnims.xattack.anim
	},
	constrict: {
		anim: BattleOtherAnims.xattack.anim
	},
	wrap: {
		anim: BattleOtherAnims.xattack.anim
	},
	dualchop: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	doublehit: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	doubleslap: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	closecombat: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 350
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 150
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 425
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 525
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450
			}, {
				x: defender.x - 20,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 550
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x + 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 475
			}, {
				x: defender.x + 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 575
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 575
			}, {
				x: defender.x - 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 775
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 600
			}, {
				x: defender.x + 10,
				y: defender.y - 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 650
			}, {
				x: defender.x - 10,
				y: defender.y + 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, 'linear', 'explode');

			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 525
			}, {
				scale: 3,
				opacity: 0,
				time: 825
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 750
			}, {
				scale: 3,
				opacity: 0,
				time: 1050
			}, 'linear');
		}
	},
	doublekick: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.xattack.anim(battle, args);
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 1050
			}, 'linear');
		},
		multihit: true
	},
	endeavor: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.xattack.anim(battle, args);
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 450
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 750
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 750
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 1050
			}, 'linear', 'fade');
		}
	},
	playrough: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 350
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 150
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(800);

			battle.showEffect('fist', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425
			}, {
				x: defender.x - 15,
				y: defender.y - 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 725
			}, 'linear');
			battle.showEffect('mudwisp', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 550
			}, 'linear', 'explode');
			battle.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 575
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 675
			}, 'linear', 'explode');
			battle.showEffect('mudwisp', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 600
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 700
			}, 'linear', 'explode');
			battle.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1100
			}, 'linear');

			battle.showEffect('heart', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450
			}, {
				x: defender.x - 20,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 550
			}, 'linear', 'explode');
			battle.showEffect('heart', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675
			}, {
				x: defender.x - 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 775
			}, 'linear', 'explode');
			battle.showEffect('heart', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 750
			}, {
				x: defender.x - 10,
				y: defender.y + 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900
			}, 'linear', 'explode');

			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 750
			}, 'linear', 'fade');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 750
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 1050
			}, 'linear', 'fade');
		}
	},
	strength: {
		anim: BattleOtherAnims.contactattack.anim
	},
	hammerarm: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400
			}, {
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 2,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 600
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	skyuppercut: {
		anim: BattleOtherAnims.punchattack.anim
	},
	meteormash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect("url('fx/bg-space.jpg')", 1000, 0.4);
			BattleOtherAnims.punchattack.anim(battle, args);

			battle.showEffect(attacker.sp, {
				x: attacker.leftof(20),
				y: attacker.y,
				z: attacker.behind(-25),
				opacity: 0.3,
				time: 25
			}, {
				x: defender.x,
				z: defender.behind(-5),
				time: 425
			}, 'ballistic2Under', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.leftof(20),
				y: attacker.y,
				z: attacker.behind(-25),
				opacity: 0.3,
				time: 50
			}, {
				x: defender.x,
				z: defender.behind(-5),
				time: 450
			}, 'ballistic2Under', 'fade');

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 450
			}, {
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500
			}, {
				y: defender.y + 100,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500
			}, {
				x: defender.x - 60,
				y: defender.y - 80,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500
			}, {
				x: defender.x - 90,
				y: defender.y + 40,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');
		}
	},
	brickbreak: {
		anim: BattleOtherAnims.punchattack.anim
	},
	shadowpunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	focuspunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	drainpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.punchattack.anim(battle, args);
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0
			}, 'linear');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0
			}, 'ballistic2Under');
		}
	},
	dynamicpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			BattleOtherAnims.punchattack.anim(battle, args);
			battle.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 350
			}, {
				scale: 4,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 500
			}, {
				scale: 4,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 650
			}, {
				scale: 4,
				opacity: 0
			}, 'linear');
		}
	},
	cometpunch: {
		anim: BattleOtherAnims.punchattack.anim,
		multihit: true
	},
	megapunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	poweruppunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	dizzypunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	needlearm: {
		anim: BattleOtherAnims.punchattack.anim
	},
	rocksmash: {
		anim: BattleOtherAnims.punchattack.anim
	},
	hornleech: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0
			}, 'linear');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	absorb: {
		anim: BattleOtherAnims.drain.anim
	},
	megadrain: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#9AB440', 900, 0.2);
			BattleOtherAnims.drain.anim(battle, args);
		}
	},
	gigadrain: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#9AB440', 900, 0.5);
			BattleOtherAnims.drain.anim(battle, args);
		}
	},
	extremespeed: {
		anim: BattleOtherAnims.fastattack.anim
	},
	quickattack: {
		anim: BattleOtherAnims.fastattack.anim
	},
	suckerpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.fastattack.anim(battle, args);
			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 0,
				opacity: 0.3,
				time: 260
			}, {
				scale: 1.25,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	astonish: {
		anim: BattleOtherAnims.fastattack.anim
	},
	rollout: {
		anim: BattleOtherAnims.fastattack.anim
	},
	bulletpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.fastattack.anim(battle, args);
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260
			}, {
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.3,
				time: 260
			}, {
				scale: 1.25,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	machpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.fastattack.anim(battle, args);
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	vacuumwave: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200
			}, 'accel', 'fade');
		}
	},
	assist: {
		anim: function () {}
	},
	mirrormove: {
		anim: function () {}
	},
	naturepower: {
		anim: function () {}
	},
	copycat: {
		anim: function () {}
	},
	sleeptalk: {
		anim: function () {}
	},
	megahorn: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#987058', 400, .3);
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	firepunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	icepunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	thunderpunch: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	poisonfang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	icefang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	firefang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	thunderfang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
			BattleOtherAnims.bite.anim(battle, args);
		}
	},
	wildcharge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 750
			}, 'linear');

			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	spark: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle, args);
		}
	},
	zapcannon: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#2630A9', 700, 0.6);
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			}, {
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');

			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			}, {
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	hyperbeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			}, {
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	gigaimpact: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);
			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 500
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	flareblitz: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				scale: 8,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				scale: 8,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	vcreate: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				scale: 6,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 350
			}, {
				scale: 6,
				opacity: 0,
				time: 650
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 350
			}, {
				scale: 6,
				opacity: 0,
				time: 650
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				scale: 6,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				scale: 6,
				opacity: 0,
				time: 700
			}, 'linear');

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				scale: 6,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				scale: 6,
				opacity: 0,
				time: 850
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			}, {
				scale: 6,
				opacity: 0,
				time: 850
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600
			}, {
				scale: 6,
				opacity: 0,
				time: 900
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x + 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600
			}, {
				scale: 6,
				opacity: 0,
				time: 900
			}, 'linear');

			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				scale: 1.5,
				opacity: 0,
				time: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				time: 300
			}, 'accel', 'explode');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(15),
				time: 200
			}, 'decel');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	outrage: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038', 600, 0.3, 400);
			battle.showEffect('angry', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0
			}, {
				x: attacker.x - 50,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 300
			}, 'ballistic');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150
			}, {
				x: attacker.x + 60,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 450
			}, 'ballistic');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				x: attacker.x + 10,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'ballistic');

			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 900
			}, 'linear');
			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 800
			}, {
				scale: 4,
				opacity: 0,
				time: 1100
			}, 'linear');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 200
			}, 'decel');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	boltstrike: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#00CCCC', 900, 0.3);

			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				opacity: 1
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 300
			}, 'accel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				opacity: 1
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 300
			}, 'accel', 'fade');

			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300
			}, 'accel');
			attacker.anim({
				opacity: 1,
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	fusionflare: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 0
			}, {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 2,
				time: 200
			}, 'accel', 'fade');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				opacity: 0.4,
				scale: 0,
				time: 150
			}, {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				opacity: 0.8,
				scale: 2,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				time: 500
			}, 'accel', 'fade');

			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 550
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1000
			}, 'linear', 'fade');
			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 0,
				time: 700
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 1000
			}, 'linear');

			defender.delay(500);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(550);
		}
	},
	fusionbolt: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200
			}, 'accel');
			battle.showEffect('iceball', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 3,
				opacity: 1,
				time: 650
			}, 'accel', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200
			}, 'accel');
			battle.showEffect('waterwisp', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 1.5,
				opacity: 1,
				time: 650
			}, 'accel', 'fade');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 700
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 0,
				time: 700
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 900
			}, 'linear');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 0,
				time: 800
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000
			}, 'linear');

			attacker.anim({
				y: defender.y + 120,
				xscale: 0,
				yscale: 0,
				opacity: 0,
				time: 300
			}, 'accel');
			attacker.delay(625);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				xscale: 1,
				yscale: 1,
				time: 1
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250
			}, 'decel');
			defender.delay(625);
			defender.anim({
				z: defender.behind(20),
				time: 250
			}, 'decel');
			defender.anim({
				time: 200
			}, 'swing');
			battle.activityWait(550);
		}
	},
	zenheadbutt: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			}, {
				scale: 2,
				opacity: 0,
				time: 700
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(500);
		}
	},
	fakeout: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	covet: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.delay(300);
			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				opacity: 1,
				time: 250
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'linear');
			defender.delay(630);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
			battle.activityWait(350);

			battle.showEffect('heart', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0
			}, {
				scale: 3,
				opacity: 0,
				time: 300
			}, 'ballistic2Under', 'fade');
		}
	},
	feint: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	thief: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	shadowsneak: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	feintattack: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	mefirst: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	struggle: {
		anim: BattleOtherAnims.contactattack.anim
	},
	earthquake: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock3', {
				x: defender.x + 30,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 0
			}, {
				x: defender.x + 50,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('rock3', {
				x: defender.x - 50,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 25
			}, {
				x: defender.x + 70,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0,
				time: 325
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x - 20,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 50
			}, {
				x: defender.x - 40,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('rock3', {
				x: defender.x - 70,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 75
			}, {
				x: defender.x - 90,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 375
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x + 20,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x + 20,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 0.5,
				time: 125
			}, {
				x: defender.x + 40,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0,
				time: 425
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 450
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 0.5,
				time: 150
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 450
			}, 'decel', 'fade');
			battle.showEffect('rock3', {
				x: defender.x + 5,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 175
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 475
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x + 70,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				x: defender.x + 90,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('rock1', {
				x: defender.x - 30,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 225
			}, {
				x: defender.x - 55,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0,
				time: 525
			}, 'decel', 'fade');
			battle.showEffect('rock1', {
				x: defender.x + 30,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 250
			}, {
				x: defender.x + 55,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 550
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x - 50,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 275
			}, {
				x: defender.x - 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 475
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x + 50,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x - 70,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 325
			}, {
				x: defender.x - 90,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 525
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 350
			}, {
				x: defender.x + 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0,
				time: 550
			}, 'decel', 'fade');
			battle.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 375
			}, {
				x: defender.x + 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 575
			}, 'decel', 'fade');


			attacker.anim({
				x: attacker.x - 30,
				time: 75
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100
			});
			attacker.anim({
				x: attacker.x - 30,
				time: 100
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100
			});
			attacker.anim({
				x: attacker.x - 30,
				time: 100
			});
			attacker.anim({
				x: attacker.x + 30,
				time: 100
			});
			attacker.anim({
				x: attacker.x,
				time: 100
			});

			defender.anim({
				x: defender.x - 30,
				time: 75
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
			battle.activityWait(325);
		}
	},
	tickle: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			defender.anim({
				x: defender.x - 20,
				time: 75
			});
			defender.anim({
				x: defender.x + 20,
				time: 100
			});
			defender.anim({
				x: defender.x - 20,
				time: 100
			});
			defender.anim({
				x: defender.x + 20,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
			battle.activityWait(425);
		}
	},
	earthpower: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8
			}, {
				scale: 3,
				opacity: 0
			}, 'linear');
			battle.showEffect('rock3', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0
			}, {
				x: defender.x + 30,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200
			}, {
				x: defender.x + 35,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 500
			}, 'linear', 'fade');

			battle.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 150
			}, {
				scale: 3,
				opacity: 0
			}, 'linear');
			battle.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 450
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 250
			}, {
				x: defender.x - 20,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 550
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 350
			}, {
				x: defender.x - 35,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 650
			}, 'linear', 'fade');

			battle.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 300
			}, {
				scale: 3,
				opacity: 0
			}, 'linear');
			battle.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 60,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 400
			}, {
				x: defender.x + 20,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500
			}, {
				x: defender.x + 30,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 800
			}, 'linear', 'fade');

			defender.anim({
				x: defender.x - 30,
				time: 75
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	drillrun: { // todo: rip horn sprite and redo animation
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				time: 500
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 200
			});
			defender.anim({
				z: defender.behind(0),
				time: 200
			});

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('caltrop', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('caltrop', {
				x: defender.x - 30,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 400
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('caltrop', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 500
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	poisongas: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 0
			}, {
				x: defender.x + 10,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y - 35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 30,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 200
			}, {
				x: defender.x + 40,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	smog: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.6,
				time: 0
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 400
			}, 'decel', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 20,
				y: defender.y + 5,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 500
			}, 'decel', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 200
			}, {
				x: defender.x + 25,
				y: defender.y,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 600
			}, 'decel', 'explode');
		}
	},
	bonemerang: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('bone', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0
			}, {
				z: defender.behind(20),
				opacity: 1,
				time: 300
			}, 'ballistic2');
			battle.showEffect('bone', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 1,
				time: 300
			}, {
				z: attacker.z,
				opacity: 0,
				time: 600
			}, 'ballistic2Under', 'fade');
		},
		multihit: true
	},
	boneclub: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('bone', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			BattleOtherAnims.contactattack.anim(battle, args);
		}
	},
	whirlwind: {
		anim: function (battle, args) {
			var defender = args[1];

			for (var i = 0; i < 3; i++) {
				battle.showEffect('wisp', {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y + 35,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	hurricane: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#000000', 900, 0.6);

			for (var i = 0; i < 4; i++) {
				battle.showEffect('wisp', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('wisp', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	ominouswind: {
		anim: function (battle, args) {
			var defender = args[1];
			for (var i = 0; i < 3; i++) {
				battle.showEffect('poisonwisp', {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('poisonwisp', {
					x: defender.x - 30,
					y: defender.y + 35,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('poisonwisp', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('poisonwisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: .2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: .4,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');

			}
		}
	},
	magmastorm: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#CC3300', 900, 0.2);

			for (var i = 0; i < 4; i++) {
				battle.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	firespin: {
		anim: function (battle, args) {
			var defender = args[1];

			for (var i = 0; i < 4; i++) {
				battle.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	leaftornado: {
		anim: function (battle, args) {
			var defender = args[1];

			for (var i = 0; i < 4; i++) {
				battle.showEffect('leaf1', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('leaf2', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('leaf1', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('leaf2', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: .5,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: .4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	roar: {
		anim: BattleOtherAnims.sound.anim
	},
	round: {
		anim: BattleOtherAnims.sound.anim
	},
	yawn: {
		anim: BattleOtherAnims.sound.anim
	},
	sing: {
		anim: BattleOtherAnims.sound.anim
	},
	perishsong: {
		anim: BattleOtherAnims.sound.anim
	},
	partingshot: {
		anim: BattleOtherAnims.sound.anim
	},
	nobleroar: {
		anim: BattleOtherAnims.sound.anim
	},
	disarmingvoice: {
		anim: BattleOtherAnims.sound.anim
	},
	growl: {
		anim: BattleOtherAnims.sound.anim
	},
	screech: {
		anim: BattleOtherAnims.sound.anim
	},
	snore: {
		anim: BattleOtherAnims.sound.anim
	},
	synchronoise: {
		anim: BattleOtherAnims.sound.anim
	},
	sonicboom: {
		anim: BattleOtherAnims.sound.anim
	},
	eerieimpulse: {
		anim: BattleOtherAnims.sound.anim
	},
	metalsound: {
		anim: BattleOtherAnims.sound.anim
	},
	supersonic: {
		anim: BattleOtherAnims.sound.anim
	},
	confide: {
		anim: BattleOtherAnims.sound.anim
	},
	defog: {
		anim: function (battle, args) {
			battle.backgroundEffect('#FFFFFF', 900, 0.5);
			BattleOtherAnims.sound.anim(battle, args);
		}
	},
	grasswhistle: {
		anim: function (battle, args) {
			battle.backgroundEffect('#9AB440', 900, 0.3);
			BattleOtherAnims.sound.anim(battle, args);
		}
	},
	hypervoice: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	boomburst: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.backgroundEffect('#000000', 900, 0.5);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	heatwave: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#CC3300', 900, 0.1);
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	snarl: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 0
			}, {
				scale: 7,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 150
			}, {
				scale: 7,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 300
			}, {
				scale: 7,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	thunder: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#ffffff', 300, 0.7);
			battle.backgroundEffect('#000000', 1000, 0.7, 100);
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0,
				time: 200
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				yscale: 1,
				xscale: 1.5,
				time: 200
			}, {
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				yscale: 1,
				xscale: 1.5,
				time: 600
			}, {
				opacity: 0,
				time: 1100
			}, 'linear');

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 1.5,
				opacity: 0.5,
				time: 200
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 900
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 0.5,
				scale: 1.5,
				time: 200
			}, {
				scale: 1.8,
				opacity: 0.1,
				time: 900
			}, 'linear', 'fade');

			defender.delay(200);
			defender.anim({
				x: defender.x - 5,
				yscale: 0.9,
				time: 75
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				yscale: 0.9,
				time: 75
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				yscale: 0.9,
				time: 75
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				yscale: 0.9,
				time: 75
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				yscale: 0.9,
				time: 75
			}, 'swing');
			defender.anim({
				time: 100
			}, 'accel');
		}
	},
	thunderbolt: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#000000', 600, 0.2);
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: .8,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('lightning', {
				x: defender.x - 15,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
				time: 200
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: .8,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('lightning', {
				x: defender.x + 15,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
				time: 400
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: .8,
				time: 600
			}, 'linear', 'fade');
		}
	},
	psychic: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#AA44BB', 250, 0.6);
			battle.backgroundEffect('#AA44FF', 250, 0.6, 400);
			defender.anim({
				scale: 1.2,
				time: 100
			});
			defender.anim({
				scale: 1,
				time: 100
			});
			defender.anim({
				scale: 1.4,
				time: 150
			});
			defender.anim({
				scale: 1,
				time: 150
			});
			battle.activityWait(700);
		}
	},
	meanlook: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#AA0000', 250, 0.3);
			battle.backgroundEffect('#000000', 250, 0.2, 400);
			battle.showEffect('stare', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				yscale: 0,
				opacity: 1
			}, {
				yscale: 1,
				time: 700
			}, 'decel', 'fade');
		}
	},
	nightshade: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.backgroundEffect('#550000', 250, 0.3);
			battle.backgroundEffect('#000000', 250, 0.2, 400);
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 3,
				opacity: 0.3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y + 35,
				z: defender.z,
				scale: 3.5,
				opacity: 0.1,
				time: 600
			}, 'accel', 'fade');
			battle.activityWait(700);
		}
	},
	fairylock: {
		anim: function (battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#FF99FF', 250, 0.3);
			battle.backgroundEffect('#AA44BB', 250, 0.2, 400);
			battle.activityWait(700);
		}
	},
	rockblast: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .6,
				opacity: 0.4
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
		},
		multihit: true
	},
	geargrind: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	iciclespear: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 375
			}, 'linear', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 450
			}, 'linear', 'fade');
		},
		multihit: true
	},
	tailslap: {
		anim: BattleOtherAnims.contactattack.anim,
		multihit: true
	},
	furyswipes: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	furyattack: {
		anim: BattleOtherAnims.xattack.anim,
		multihit: true
	},
	bulletseed: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.6,
				time: 30
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 330
			}, 'linear', 'fade');
		},
		multihit: true
	},
	spikecannon: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.6,
				time: 30
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 330
			}, 'linear', 'fade');
		},
		multihit: true
	},
	twineedle: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x - 35,
				y: defender.y + 10,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 200
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
		},
		multihit: true
	},
	crabhammer: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle, args);
			battle.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400
			}, {
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x + 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500
			}, {
				x: defender.x - 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800
			}, 'linear', 'fade');
		}
	},
	aquajet: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1
			}, {
				y: attacker.y - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp', {
				x: Math.floor((attacker.x + defender.x) / 2) - 20,
				y: Math.floor((attacker.y + defender.y) / 2) + 30,
				z: Math.floor((attacker.z + defender.z) / 2),
				scale: 0,
				opacity: 1,
				time: 150
			}, {
				y: Math.floor((attacker.y + defender.y) / 2) - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				y: defender.y - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: .5
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500
			}, 'decel');
			defender.delay(260);
			defender.anim({
				z: defender.behind(30),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	iceshard: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 500
			}, 'linear', 'fade');
		}
	},
	watershuriken: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1
			}, {
				y: attacker.y - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp', {
				x: Math.floor((attacker.x + defender.x) / 2) - 20,
				y: Math.floor((attacker.y + defender.y) / 2) + 30,
				z: Math.floor((attacker.z + defender.z) / 2),
				scale: 0,
				opacity: 1,
				time: 150
			}, {
				y: Math.floor((attacker.y + defender.y) / 2) - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				y: defender.y - 20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400
			}, 'accel', 'fade');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: .5
			}, 'accel', 'fade');
		},
		multihit: true
	},
	icebeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xstep = (defender.x - attacker.x) / 5;
			var ystep = (defender.y - attacker.y) / 5;
			var zstep = (defender.z - attacker.z) / 5;

			for (var i = 0; i < 4; i++) {
				battle.showEffect('icicle', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.5,
					opacity: 0.6,
					time: 40 * i
				}, {
					opacity: 0,
					time: 40 * i + 600
				}, 'linear');
			}
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'linear');

			battle.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 200
			}, {
				scale: 4,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 300
			}, {
				scale: 4,
				opacity: 0,
				time: 650
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 400
			}, {
				scale: 4,
				opacity: 0,
				time: 700
			}, 'linear', 'fade');
		}
	},
	freezedry: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 200
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 300
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');
		}
	},
	icywind: {
		anim: function (battle, args) {
			var defender = args[1];
			for (var i = 0; i < 3; i++) {
				battle.showEffect('iceball', {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('iceball', {
					x: defender.x - 30,
					y: defender.y + 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('iceball', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x - 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200
				}, 'linear', 'fade');
				battle.showEffect('iceball', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i
				}, {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200
				}, 'linear', 'fade');
			}
		}
	},
	powergem: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.2
			}, {
				x: defender.x + 50,
				y: defender.y + 20,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .7,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.2
			}, {
				x: defender.x + 40,
				y: defender.y - 30,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .7,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.7
			}, {
				x: defender.x - 50,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .8,
				time: 400
			}, 'linear', 'explode');
		}
	},
	chargebeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 50
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 150
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350
			}, 'linear', 'explode');
		}
	},
	psybeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 50
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 150
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350
			}, 'linear', 'explode');
		}
	},
	flamethrower: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.6,
				time: 400
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 100
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 500
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 200
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 600
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 300
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 700
			}, 'decel', 'explode');
		}
	},
	toxic: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
		}
	},
	sludge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'fade');
		}
	},
	sludgewave: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#AA00AA', 700, 0.2);
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	sludgebomb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	mudbomb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	magnetbomb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	seedbomb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	willowisp: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.8,
				opacity: .7,
				time: 500
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			battle.showEffect('bluefireball', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.8,
				opacity: .7,
				time: 500
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 700
			}, 'swing', 'fade');
			battle.showEffect('bluefireball', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 700
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 900
			}, 'swing', 'explode');
		}
	},
	confuseray: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.15,
				opacity: 0
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: .7,
				time: 500
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.15,
				opacity: 0
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: .7,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('electroball', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: .7,
				time: 500
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700
			}, 'swing', 'fade');
			battle.showEffect('electroball', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 700
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 900
			}, 'swing', 'explode');
		}
	},
	lovelykiss: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('heart', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.35,
				opacity: 0
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.5,
				opacity: .7,
				time: 500
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			battle.showEffect('heart', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.5,
				opacity: .7,
				time: 500
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 700
			}, 'swing', 'fade');
			battle.showEffect('heart', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 700
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900
			}, 'swing', 'explode');
		}
	},
	stoneedge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock3', {
				x: defender.x + 15,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 350
			}, 'accel');
			battle.showEffect('rock3', {
				x: defender.x + 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 150
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 500
			}, 'accel');
			battle.showEffect('rock3', {
				x: defender.x - 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 300
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 650
			}, 'accel');
			battle.showEffect('rock3', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 400
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 750
			}, 'accel');
			battle.showEffect('rock3', {
				x: defender.x - 15,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 500
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 850
			}, 'accel');
		}
	},
	rockslide: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender;

			for (var i = 1; i < args.length; i++) {
				defender = args[i];
				defender.delay(200);
				defender.anim({
					y: defender.y - 10,
					yscale: 0.9,
					time: 100
				}, 'decel');
				defender.anim({
					time: 200
				});
				defender.delay(200);
				defender.anim({
					y: defender.y - 10,
					yscale: 0.9,
					time: 100
				}, 'decel');
				defender.anim({
					time: 200
				});
			}

			battle.showEffect('rock1', {
				x: defender.x + 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: .5
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 300
			}, 'accel', 'explode');
			battle.showEffect('rock2', {
				x: defender.x + 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 100
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 400
			}, 'accel', 'explode');
			battle.showEffect('rock1', {
				x: defender.x - 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 200
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 500
			}, 'accel', 'explode');
			battle.showEffect('rock2', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 300
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 600
			}, 'accel', 'explode');
			battle.showEffect('rock1', {
				x: defender.x - 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 400
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 700
			}, 'accel', 'explode');

			battle.showEffect('mudwisp', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
			battle.showEffect('mudwisp', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 450
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
			battle.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 600
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
		}
	},
	avalanche: {
		anim: function (battle, args) {
			var defender = args[1];

			defender.delay(200);
			defender.anim({
				y: defender.y - 10,
				yscale: 0.9,
				time: 100
			}, 'decel');
			defender.anim({
				time: 200
			});
			defender.delay(200);
			defender.anim({
				y: defender.y - 10,
				yscale: 0.9,
				time: 100
			}, 'decel');
			defender.anim({
				time: 200
			});

			battle.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 300
			}, 'accel', 'explode');
			battle.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 100
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 400
			}, 'accel', 'explode');
			battle.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 200
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 500
			}, 'accel', 'explode');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 300
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 600
			}, 'accel', 'explode');
			battle.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 400
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 700
			}, 'accel', 'explode');

			battle.showEffect('wisp', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
			battle.showEffect('wisp', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 450
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
			battle.showEffect('wisp', {
				x: defender.x + 10,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 600
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
		}
	},
	thousandarrows: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock2', {
				x: defender.x + 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				xscale: 0.2,
				yscale: 0.5
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('rock1', {
				x: defender.x + 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				xscale: 0.2,
				yscale: -0.5,
				time: 100
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock2', {
				x: defender.x - 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				xscale: 0.2,
				yscale: 0.5,
				time: 200
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('rock1', {
				x: defender.x,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				xscale: 0.2,
				yscale: -0.5,
				time: 300
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('rock2', {
				x: defender.x - 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				xscale: 0.2,
				yscale: 0.5,
				time: 400
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 700
			}, 'linear', 'explode');
		}
	},
	iciclecrash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle', {
				x: defender.x + 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: defender.x + 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 100
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: defender.x - 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 200
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: defender.x,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 300
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('icicle', {
				x: defender.x - 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 400
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 700
			}, 'linear', 'explode');
		}
	},
	spore: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: .4
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 30,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: .4,
				time: 150
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 650
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: .4,
				time: 300
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 800
			}, 'decel', 'fade');
		}
	},
	fireblast: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 500, 0.7);
			battle.backgroundEffect('#B84038', 600, 0.4, 500);
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 550
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x,
				y: defender.y + 100,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x - 60,
				y: defender.y - 80,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x - 90,
				y: defender.y + 40,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');

			defender.delay(500);
			defender.anim({
				z: defender.behind(10),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	judgment: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.backgroundEffect('#000000', 950, 0.6);

			battle.showEffect('wisp', {
				x: defender.x - 100,
				y: defender.y,
				z: defender.z,
				scale: .5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 250
			}, 'decel', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 70,
				y: defender.y - 70,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 450
			}, 'decel', 'fade');

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');

			defender.delay(450);
			defender.anim({
				z: defender.behind(10),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	psystrike: { // todo: give psystrike a new background
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.backgroundEffect('#000000', 950, 0.6);

			battle.showEffect('poisonwisp', {
				x: defender.x - 100,
				y: defender.y,
				z: defender.z,
				scale: .5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 250
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 70,
				y: defender.y - 70,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 450
			}, 'decel', 'fade');

			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');

			defender.delay(450);
			defender.anim({
				z: defender.behind(10),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	shadowball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 600, 0.1);
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 600
			}, 'linear', 'fade');
		}
	},
	darkpulse: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			battle.backgroundEffect('#000000', 900, 0.3);
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.8,
				time: 0
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 300
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			for (var i = 0; i < 4; i++) {
				battle.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.4
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.7,
					opacity: 0.4,
					time: 600
				}, 'accel', 'fade');
				battle.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 0.4
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.5,
					opacity: 0.4,
					time: 600
				}, 'accel', 'fade');
			}
		}
	},
	energyball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
		}
	},
	electroball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
		}
	},
	moonblast: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 800, 0.3);
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 500
			}, 'linear', 'explode');

			defender.delay(500);
			defender.anim({
				z: defender.behind(5),
				time: 200
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	mistball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.8,
				opacity: 0.6,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				scale: 1,
				opacity: 0.8,
				time: 800
			}, 'accel', 'explode');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x,
				y: defender.y + 100,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 1050
			}, 'linear', 'fade');
		}
	},
	present: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
		}
	},
	iceball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'ballistic', 'explode');
		}
	},
	weatherball: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1
			}, {
				y: attacker.y + 90,
				opacity: 0
			}, 'linear');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y + 90,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 500
			}, {
				y: defender.y,
				opacity: 1,
				time: 1000
			}, 'linear', 'explode');
		}
	},
	wish: {
		anim: function (battle, args) {
			var attacker = args[0];
			battle.backgroundEffect("url('fx/bg-space.jpg')", 600, 0.4);

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				y: attacker.y + 130,
				opacity: 0
			}, 'accel');
		},
		residualAnim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				scale: 1,
				opacity: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1
			}, 'decel', 'explode');
		}
	},
	healingwish: {
		anim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				opacity: 0
			}, 'accel');
		},
		residualAnim: function (battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				scale: 1,
				opacity: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1
			}, 'decel', 'explode');
		}
	},
	stealthrock: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = battle.sides[args[1].siden];

			battle.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				x: defender.leftof(-40),
				y: defender.y - 10,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 75
			}, {
				x: defender.leftof(-20),
				y: defender.y - 40,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 150
			}, {
				x: defender.leftof(30),
				y: defender.y - 20,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 225
			}, {
				x: defender.leftof(10),
				y: defender.y - 30,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, 'ballistic');
		}
	},
	spikes: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				x: -25,
				y: defender.y - 40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125
			}, {
				x: +50,
				y: defender.y - 40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250
			}, {
				x: +30,
				y: defender.y - 45,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
		}
	},
	toxicspikes: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisoncaltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				x: +5,
				y: defender.y - 40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('poisoncaltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 200
			}, {
				x: -15,
				y: defender.y - 35,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
		}
	},
	stickyweb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				x: 0,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1
			}, 'ballistic');
		}
	},
	leechseed: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125
			}, {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250
			}, {
				x: defender.x + 20,
				y: defender.y - 25,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
		}
	},
	psyshock: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: .6
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('poisonwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 150
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 300
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
		}
	},
	sandtomb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('mudwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: .6
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('mudwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 150
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 300
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
		}
	},
	flashcannon: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 50
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250
			}, 'linear', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.2,
				time: 150
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350
			}, 'linear', 'explode');
		}
	},
	lusterpurge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#ffffff', 600, 0.6);
			battle.showEffect('wisp', {
				x: attacker.leftof(-10),
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			}, {
				scale: 15,
				opacity: 0.8,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 175
			}, {
				scale: 1,
				opacity: 0,
				time: 375
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x + 25,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 300
			}, {
				scale: 1,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y + 10,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 400
			}, {
				scale: 1,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('impact', {
				x: defender.x + 2,
				y: defender.y + 5,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.2,
				time: 500
			}, {
				scale: 1.25,
				opacity: 0,
				time: 700
			}, 'linear');

			attacker.anim({
				opacity: 0,
				time: 75
			});
			attacker.delay(500);
			attacker.anim({
				opacity: 1,
				time: 100
			});
			defender.delay(200);
			defender.anim({
				x: defender.x - 30,
				time: 75
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	grassknot: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: defender.x + 30,
				y: defender.y - 30,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 50
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 200
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('leaf1', {
				x: defender.x + 30,
				y: defender.y - 30,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 50
			}, {
				y: defender.y - 40,
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('leaf2', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 200
			}, {
				y: defender.y - 50,
				scale: 3,
				opacity: 0
			}, 'decel');
		}
	},
	airslash: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 200
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 400
			}, 'linear', 'fade');
		}
	},
	aircutter: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y - 10,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, {
				x: defender.x - 60,
				y: defender.y - 10,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 20,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 50,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 200
			}, {
				x: defender.x - 60,
				y: defender.y + 50,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 400
			}, 'linear', 'fade');
		}
	},
	dracometeor: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect("url('fx/bg-space.jpg')", 1100, 0.8);
			battle.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x + 50,
				y: defender.y,
				scale: 1.5,
				opacity: 0.8
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y + 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y - 5,
				scale: 1.5,
				opacity: 0.8
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 300
			}, {
				x: defender.x + 30,
				y: defender.y - 10,
				scale: 1.5,
				opacity: 0.8
			}, 'accel', 'explode');
			battle.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x + 30,
				y: defender.y,
				scale: 1.5,
				opacity: 0.4
			}, 'accel', 'explode');
			battle.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y + 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 150
			}, {
				x: defender.x - 20,
				y: defender.y - 5,
				scale: 1.5,
				opacity: 0.4
			}, 'accel', 'explode');
			battle.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 300
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1.5,
				opacity: 0.4
			}, 'accel', 'explode');

			battle.showEffect('shadowball', {
				x: defender.x + 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 500
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500
			}, {
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 650
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 850
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 650
			}, {
				scale: 4,
				opacity: 0,
				time: 850
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x + 20,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 700
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 900
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 700
			}, {
				scale: 4,
				opacity: 0,
				time: 900
			}, 'linear');

			battle.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 150,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 50
			}, {
				x: defender.x - 250,
				y: defender.y - 80,
				z: defender.behind(60),
				scale: 0.8,
				opacity: 0
			}, 'accel', 'fade');
			battle.showEffect('rock3', {
				x: defender.leftof(-220),
				y: defender.y + 20 + 130,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x + 80,
				y: defender.y - 50,
				z: defender.behind(30),
				scale: 0.8,
				opacity: 0
			}, 'accel', 'fade');
			battle.showEffect('rock3', {
				x: defender.leftof(-180),
				y: defender.y + 20 + 130,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x - 200,
				y: defender.y + 20,
				z: defender.behind(30),
				scale: 0.8,
				opacity: 0
			}, 'accel', 'fade');

			defender.delay(500);
			defender.anim({
				x: defender.x + 30,
				z: defender.behind(10),
				time: 75
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				z: defender.behind(10),
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	brine: {
		anim: BattleOtherAnims.hydroshot.anim
	},
	octazooka: {
		anim: BattleOtherAnims.hydroshot.anim
	},
	waterpledge: {
		anim: BattleOtherAnims.hydroshot.anim
	},
	soak: {
		anim: BattleOtherAnims.hydroshot.anim
	},
	watersport: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
		}
	},
	scald: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.hydroshot.anim(battle, args);
			battle.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 300
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 900
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 1000
			}, 'linear', 'fade');
		}
	},
	steameruption: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#0000DD', 700, 0.2);
			BattleOtherAnims.hydroshot.anim(battle, args);
			defender.delay(200);
			defender.anim({
				z: defender.behind(20),
				time: 400
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');

			battle.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 300
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.behind(10),
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 500
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 900
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: 1,
				time: 600
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 1000
			}, 'linear', 'fade');
		}
	},
	waterpulse: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.8
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.7,
				time: 400
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.7,
				time: 400
			}, 'decel', 'explode');
		}
	},
	bubblebeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.6,
				time: 400
			}, 'decel', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 100
			}, {
				x: defender.x + 20,
				y: defender.y - 10,
				z: defender.behind(0),
				opacity: 0.6,
				time: 500
			}, 'decel', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 200
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.behind(0),
				opacity: 0.6,
				time: 600
			}, 'decel', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 300
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 700
			}, 'decel', 'explode');
		}
	},
	surf: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#0000DD', 700, 0.2);
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	hydropump: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#0000DD', 700, 0.2);
			BattleOtherAnims.hydroshot.anim(battle, args);
			defender.delay(200);
			defender.anim({
				z: defender.behind(20),
				time: 400
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	muddywater: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#996600', 700, 0.2);
			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	mudshot: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	lavaplume: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1
			}, {
				x: defender.x + 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
		}
	},
	eruption: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender;

			for (var i = 1; i < args.length; i++) {
				defender = args[i];
				defender.delay(625);
				defender.anim({
					x: defender.x - 30,
					time: 75
				});
				defender.anim({
					x: defender.x + 30,
					time: 100
				});
				defender.anim({
					x: defender.x - 30,
					time: 100
				});
				defender.anim({
					x: defender.x + 30,
					time: 100
				});
				defender.anim({
					x: defender.x,
					time: 100
				});
			}

			battle.backgroundEffect('#B84038', 1100, 0.4);
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0
			}, 'linear', 'fade');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');

			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 50
			}, {
				x: attacker.x - 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 150
			}, {
				x: attacker.x + 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 450
			}, 'decel', 'fade');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');

			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 45,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 600
			}, 'accel', 'explode');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675
			}, 'accel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 750
			}, 'accel', 'explode');
			battle.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825
			}, 'accel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 575
			}, {
				x: defender.x - 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 875
			}, 'accel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 650
			}, {
				x: defender.x + 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 950
			}, 'accel', 'explode');
		}
	},
	waterspout: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender;

			for (var i = 1; i < args.length; i++) {
				defender = args[i];
				defender.delay(625);
				defender.anim({
					x: defender.x - 30,
					time: 75
				});
				defender.anim({
					x: defender.x + 30,
					time: 100
				});
				defender.anim({
					x: defender.x - 30,
					time: 100
				});
				defender.anim({
					x: defender.x + 30,
					time: 100
				});
				defender.anim({
					x: defender.x,
					time: 100
				});
			}

			battle.backgroundEffect('#0000DD', 1100, 0.2);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0
			}, 'linear', 'fade');

			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 50
			}, {
				x: attacker.x - 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 150
			}, {
				x: attacker.x + 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 450
			}, 'decel', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500
			}, 'decel', 'fade');

			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 45,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 600
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 450
			}, {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 750
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525
			}, {
				x: defender.x - 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 575
			}, {
				x: defender.x - 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 875
			}, 'accel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 650
			}, {
				x: defender.x + 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 950
			}, 'accel', 'explode');
		}
	},
	solarbeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xstep = (defender.x - attacker.x) / 5;
			var ystep = (defender.y - attacker.y) / 5;
			var zstep = (defender.z - attacker.z) / 5;

			battle.backgroundEffect("url('fx/weather-sunnyday.jpg')", 700, 0.5);

			for (var i = 0; i < 5; i++) {
				battle.showEffect('energyball', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.7,
					opacity: 0.6,
					time: 40 * i
				}, {
					opacity: 0,
					time: 100 * i + 600
				}, 'linear');
			}

			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' absorbed light!';
		}
	},
	lightofruin: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);
			battle.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 2,
				time: 0
			}, {
				scale: 0,
				opacity: 0.5,
				time: 200
			}, 'accel');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 275
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 475
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 350
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 550
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 425
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 625
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 700
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 575
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 775
			}, 'linear', 'explode');

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 750
			}, {
				scale: 4,
				opacity: 0,
				time: 950
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 800
			}, {
				scale: 4,
				opacity: 0,
				time: 1000
			}, 'linear');
		}
	},
	blizzard: { // todo: better blizzard anim
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#009AA4', 700, 0.5);
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
		}
	},
	freezeshock: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			}, {
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
		},
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' became cloaked in a freezing light!';
		}
	},
	iceburn: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');

			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			}, {
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
		},
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' became cloaked in freezing air!';
		}
	},
	razorwind: {
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function (pokemon) {
			return pokemon.getName() + ' whipped up a whirlwind!';
		}
	},
	overheat: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038', 700, 0.4);
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 100
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 700
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 800
			}, 'linear', 'fade');
		}
	},
	blastburn: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038', 700, 0.4);
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
		}
	},
	sacredfire: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#2630A9', 900, 0.6);
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 50
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 550
			}, 'linear', 'fade');

			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				scale: 0,
				time: 550
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0.3,
				time: 850
			}, 'linear', 'fade');
			battle.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				scale: 0,
				time: 650
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0.3,
				time: 950
			}, 'linear', 'fade');

			battle.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 550
			}, {
				x: defender.x + 60,
				y: defender.y - 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 825
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 575
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 850
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 600
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 875
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 625
			}, {
				x: defender.x + 50,
				y: defender.y + 30,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 900
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 650
			}, {
				x: defender.x - 10,
				y: defender.y + 60,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 925
			}, 'decel', 'explode');
		}
	},
	blueflare: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#4499FF', 600, 0.6);
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
		}
	},
	electroweb: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	fling: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
		}
	},
	worryseed: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
		}
	},
	rockthrow: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
		}
	},
	paraboliccharge: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 7,
				opacity: 0,
				time: 0
			}, {
				scale: 0,
				opacity: 0.5,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 7,
				opacity: 0,
				time: 150
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600
			}, 'linear', 'fade');
		}
	},
	drainingkiss: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 50
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0
			}, 'linear');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0
			}, 'ballistic2Under');
		}
	},
	oblivionwing: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 0
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 50
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0
			}, 'linear');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0
			}, 'ballistic2Under');
		}
	},
	signalbeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');
		}
	},
	simplebeam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');
		}
	},
	triattack: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 100
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.8,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');

			battle.showEffect('fireball', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 400
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('icicle', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 500
			}, {
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 600
			}, {
				scale: 2,
				opacity: 0
			}, 'decel');
		}
	},
	hypnosis: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 0
			}, {
				scale: 2,
				opacity: 0,
				time: 400
			}, 'decel');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 100
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'decel');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 200
			}, {
				scale: 2,
				opacity: 0,
				time: 600
			}, 'decel');
		}
	},
	darkvoid: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender;

			for (var i = 1; i < args.length; i++) {
				defender = args[i];
				defender.anim({
					opacity: 0,
					y: defender.y - 60,
					time: 300
				}, 'linear', 'fade');
				defender.anim({
					opacity: 0,
					y: defender.y,
					time: 200
				}, 'linear');
				defender.anim({
					opacity: 1,
					y: defender.y,
					time: 200
				}, 'linear');
			}

			if (args.length > 2) defender = args[2];

			battle.backgroundEffect('#AA0000', 700, 0.3);
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.8,
				time: 0
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 600
			}, 'accel', 'fade');
		}
	},
	roaroftime: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);
			BattleOtherAnims.sound.anim(battle, args);
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 0
			}, {
				scale: 2,
				opacity: 0,
				time: 400
			}, 'decel');
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 100
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'decel');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 200
			}, {
				scale: 2,
				opacity: 0,
				time: 600
			}, 'decel');
		}
	},
	sacredsword: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.spinattack.anim(battle, args);
			battle.showEffect('iceball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 500
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 800
			}, 'accel', 'explode');
			battle.showEffect('iceball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 800
			}, 'accel', 'explode');
			battle.showEffect('iceball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 900
			}, 'accel', 'explode');
			battle.showEffect('iceball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 900
			}, 'accel', 'explode');
			battle.showEffect('iceball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 700
			}, {
				scale: 2,
				opacity: 0,
				time: 1000
			}, 'accel', 'fade');
			battle.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 600
			}, {
				scale: 2,
				opacity: 0,
				time: 1000
			}, 'accel', 'fade');
		}
	},
	secretsword: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			defender.delay(100);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');

			battle.showEffect('flareball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 0
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 300
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 300
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 400
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 400
			}, 'accel', 'explode');
			battle.showEffect('flareball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 300
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'accel', 'fade');
			battle.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 100
			}, {
				scale: 2,
				opacity: 0,
				time: 500
			}, 'accel', 'fade');
		}
	},
	psychocut: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: .2,
				opacity: 1
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 200
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 400
			}, 'linear', 'fade');
		}
	},
	precipiceblades: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038', 800, .4);
			battle.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0
			}, 'linear', 'fade');

			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.behind(-50),
				scale: 0,
				opacity: 0.8
			}, {
				scale: 3,
				opacity: 0,
				time: 200
			}, 'linear');
			battle.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.behind(-50),
				scale: 0.5,
				yscale: 1.4,
				opacity: 0.7,
				time: 25
			}, {
				y: attacker.y,
				yscale: 1.5,
				time: 250
			}, 'decel', 'fade');

			battle.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.behind(-125),
				scale: 0,
				opacity: 0.8,
				time: 150
			}, {
				scale: 3,
				opacity: 0
			}, 'linear');
			battle.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.behind(-125),
				scale: 0.5,
				yscale: 1.5,
				opacity: 0.7,
				time: 175
			}, {
				y: attacker.y,
				yscale: 1.6,
				time: 400
			}, 'decel', 'fade');

			battle.showEffect('fireball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 300
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('rock2', {
				x: defender.x - 15,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.6,
				opacity: 0.7,
				time: 350
			}, {
				y: attacker.y,
				yscale: 1.7,
				time: 550
			}, 'decel', 'fade');
			battle.showEffect('rock2', {
				x: defender.x + 15,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.6,
				opacity: 0.7,
				time: 375
			}, {
				y: attacker.y,
				yscale: 1.7,
				time: 575
			}, 'decel', 'fade');
			battle.showEffect('rock1', {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.8,
				opacity: 0.7,
				time: 400
			}, {
				y: defender.y + 10,
				yscale: 1.9,
				time: 600
			}, 'accel', 'fade');

			defender.delay(325);
			defender.anim({
				x: defender.x - 30,
				time: 75
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x - 30,
				time: 100
			});
			defender.anim({
				x: defender.x + 30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	originpulse: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#00CCCC', 700, 0.5);
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0
			}, 'linear', 'fade');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	dragonascent: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect("url('fx/bg-space.jpg')", 1000, 0.7);
			battle.showEffect('iceball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 2,
				time: 700
			}, 'accel', 'explode');
			battle.showEffect('energyball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 2,
				time: 700
			}, 'accel', 'explode');

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 650
			}, {
				scale: 4,
				opacity: 0,
				time: 900
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 750
			}, {
				scale: 4,
				opacity: 0,
				time: 1000
			}, 'linear', 'fade');

			attacker.anim({
				opacity: 0,
				y: defender.y + 120,
				time: 300
			}, 'accel');
			attacker.delay(625);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250
			}, 'decel');
			defender.delay(725);
			defender.anim({
				z: defender.behind(20),
				time: 250
			}, 'decel');
			defender.anim({
				time: 200
			}, 'swing');
		}
	},
	diamondstorm: { // todo: new animation involving icicles
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#FF99FF', 700, 0.3);
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	dazzlinggleam: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#FF99FF', 700, 0.5);
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	payday: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	swift: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	leafstorm: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#9AB440', 700, 0.7);
			battle.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	magicalleaf: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 575
			}, 'linear', 'explode');
		}
	},
	gunkshot: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		}
	},
	hyperspacehole: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.backgroundEffect('#ffffff', 900, 0.6);

			attacker.anim({
				opacity: 0,
				y: attacker.y - 80,
				time: 300
			}, 'swing');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'decel');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 550
			}, {
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 650
			}, {
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 750
			}, {
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'accel');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1
			}, 'decel');
			defender.delay(500);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	hyperspacefury: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 900, 0.3);
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.8,
				opacity: 0.8
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 1,
				opacity: 1
			}, 'linear', 'fade');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 75
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 150
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 225
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 300
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 375
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 575
			}, 'linear', 'explode');
			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 200
			}, 'linear');
		}
	},
	poisonjab: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50
			});
			attacker.anim({
				time: 500
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	psychoboost: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.3);
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.5
			}, {
				scale: 3,
				opacity: 0.3,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.6,
				time: 100
			}, {
				scale: 3,
				opacity: 0.5,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1.25,
				time: 600
			}, 'accel', 'explode');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.6,
				time: 100
			}, {
				scale: 4,
				opacity: 0.5,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.5,
				opacity: .8,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1.5,
				opacity: .8,
				time: 600
			}, 'accel', 'explode');

			battle.showEffect('mistball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 1000
			}, 'accel', 'explode');
			battle.showEffect('mistball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 900
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 1100
			}, 'accel', 'explode');
			battle.showEffect('mistball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 900
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 1100
			}, 'accel', 'explode');
			battle.showEffect('mistball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 1000
			}, 'accel', 'explode');

			attacker.delay(400);
			attacker.anim({
				z: attacker.behind(20),
				time: 300
			}, 'swing');
			attacker.anim({
				time: 300
			}, 'swing');
			defender.delay(600);
			defender.anim({
				z: defender.behind(10),
				time: 300
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	bestow: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 1,
				time: 400
			}, 'ballistic', 'fade');
		}
	},
	finalgambit: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.3,
				time: 500
			}, {
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				scale: 5,
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				time: 300
			}, 'linear');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	forestscurse: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0
			}, {
				y: defender.y,
				scale: 3,
				opacity: 0
			}, 'accel');
		}
	},
	trickortreat: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0
			}, {
				y: defender.y,
				scale: 3,
				opacity: 0
			}, 'accel');
		}
	},
	healpulse: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			battle.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 0
			}, {
				scale: 8,
				opacity: 0.1,
				time: 600
			}, 'linear', 'fade');
			for (var i = 0; i < 4; i++) {
				battle.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	spite: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5
			}, 'decel', 'explode');
		}
	},
	lockon: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				scale: 2
			}, {
				opacity: 1,
				scale: 0.5
			}, 'accel', 'explode');
		}
	},
	mindreader: {
		anim: function (battle, args) {
			var defender = args[1];

			battle.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				scale: 2
			}, {
				opacity: 1,
				scale: 0.5
			}, 'accel', 'explode');
		}
	},
	memento: {
		anim: function (battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 130,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 800
			}, 'decel', 'explode');
		}
	}
};

// placeholder animations
BattleMoveAnims['torment'] = {anim:BattleMoveAnims['swagger'].anim};

BattleMoveAnims['autotomize'] = {anim:BattleMoveAnims['rockpolish'].anim};

BattleMoveAnims['heatcrash'] = {anim:BattleMoveAnims['flareblitz'].anim};
BattleMoveAnims['searingshot'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['fierydance'] = {anim:BattleMoveAnims['magmastorm'].anim};
BattleMoveAnims['inferno'] = {anim:BattleMoveAnims['magmastorm'].anim};
BattleMoveAnims['mysticalfire'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['firepledge'] = {anim:BattleMoveAnims['flamethrower'].anim};

BattleMoveAnims['ember'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['incinerate'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['flameburst'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['flamewheel'] = {anim:BattleMoveAnims['flareblitz'].anim};
BattleMoveAnims['flamecharge'] = {anim:BattleMoveAnims['flareblitz'].anim};

BattleMoveAnims['petaldance'] = {anim:BattleMoveAnims['leafstorm'].anim};
BattleMoveAnims['petalblizzard'] = {anim:BattleMoveAnims['leafstorm'].anim};

BattleMoveAnims['razorleaf'] = {anim:BattleMoveAnims['magicalleaf'].anim};
BattleMoveAnims['grasspledge'] = {anim:BattleMoveAnims['magicalleaf'].anim};
BattleMoveAnims['sleeppowder'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['poisonpowder'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['stunspore'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['powder'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['cottonspore'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['vinewhip'] = {anim:BattleMoveAnims['powerwhip'].anim};

BattleMoveAnims['bubble'] = {anim:BattleMoveAnims['bubblebeam'].anim};

BattleMoveAnims['watergun'] = {anim:BattleMoveAnims['watersport'].anim};
BattleMoveAnims['whirlpool'] = {anim:BattleMoveAnims['watersport'].anim};

BattleMoveAnims['waterfall'] = {anim:BattleMoveAnims['aquajet'].anim};
BattleMoveAnims['razorshell'] = {anim:BattleMoveAnims['crabhammer'].anim};
BattleMoveAnims['aquatail'] = {anim:BattleMoveAnims['crabhammer'].anim};

BattleMoveAnims['magikarpsrevenge'] = {anim:BattleMoveAnims['outrage'].anim};

BattleMoveAnims['shockwave'] = {anim:BattleMoveAnims['voltswitch'].anim};
BattleMoveAnims['thunderwave'] = {anim:BattleMoveAnims['voltswitch'].anim};
BattleMoveAnims['electrify'] = {anim:BattleMoveAnims['voltswitch'].anim};
BattleMoveAnims['volttackle'] = {anim:BattleMoveAnims['wildcharge'].anim};
BattleMoveAnims['nuzzle'] = {anim:BattleMoveAnims['spark'].anim};
BattleMoveAnims['thundershock'] = {anim:BattleMoveAnims['electroball'].anim};

BattleMoveAnims['glaciate'] = {anim:BattleMoveAnims['freezedry'].anim};
BattleMoveAnims['frostbreath'] = {anim:BattleMoveAnims['freezedry'].anim};
BattleMoveAnims['aurorabeam'] = {anim:BattleMoveAnims['icebeam'].anim};
BattleMoveAnims['powdersnow'] = {anim:BattleMoveAnims['icywind'].anim};
BattleMoveAnims['sheercold'] = {anim:BattleMoveAnims['blizzard'].anim};

BattleMoveAnims['pinmissile'] = {anim:BattleMoveAnims['bulletseed'].anim, multihit: true};
BattleMoveAnims['attackorder'] = {anim:BattleMoveAnims['bulletseed'].anim};
BattleMoveAnims['fellstinger'] = {anim:BattleMoveAnims['bulletseed'].anim};
BattleMoveAnims['strugglebug'] = {anim:BattleMoveAnims['bulletseed'].anim};
BattleMoveAnims['infestation'] = {anim:BattleMoveAnims['bulletseed'].anim};
BattleMoveAnims['leechlife'] = {anim:BattleMoveAnims['bulletseed'].anim};

BattleMoveAnims['hex'] = {anim:BattleMoveAnims['shadowball'].anim};
BattleMoveAnims['nightdaze'] = {anim:BattleMoveAnims['darkpulse'].anim};
BattleMoveAnims['spacialrend'] = {anim:BattleMoveAnims['roaroftime'].anim};

BattleMoveAnims['hornattack'] = {anim:BattleMoveAnims['megahorn'].anim};

BattleMoveAnims['lowsweep'] = {anim:BattleMoveAnims['lowkick'].anim};
BattleMoveAnims['megakick'] = {anim:BattleMoveAnims['jumpkick'].anim};
BattleMoveAnims['stomp'] = {anim:BattleMoveAnims['jumpkick'].anim};
BattleMoveAnims['frustration'] = {anim:BattleMoveAnims['thrash'].anim};
BattleMoveAnims['rage'] = {anim:BattleMoveAnims['thrash'].anim};
BattleMoveAnims['headsmash'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['headcharge'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['takedown'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['dragonrush'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['lastresort'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['horndrill'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['trumpcard'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['doubleedge'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['crosspoison'] = {anim:BattleMoveAnims['xscissor'].anim};

BattleMoveAnims['paleowave'] = {anim:BattleMoveAnims['powergem'].anim};
BattleMoveAnims['ancientpower'] = {anim:BattleMoveAnims['powergem'].anim};
BattleMoveAnims['rockwrecker'] = {anim:BattleMoveAnims['powergem'].anim};
BattleMoveAnims['rocktomb'] = {anim:BattleMoveAnims['rockslide'].anim};

BattleMoveAnims['shadowstrike'] = {anim:BattleMoveAnims['shadowclaw'].anim};

BattleMoveAnims['frenzyplant'] = {anim:BattleMoveAnims['leafstorm'].anim};
BattleMoveAnims['hydrocannon'] = {anim:BattleMoveAnims['hydropump'].anim};

BattleMoveAnims['guardsplit'] = {anim:BattleMoveAnims['skillswap'].anim};
BattleMoveAnims['powersplit'] = {anim:BattleMoveAnims['skillswap'].anim};
BattleMoveAnims['guardswap'] = {anim:BattleMoveAnims['skillswap'].anim};
BattleMoveAnims['heartswap'] = {anim:BattleMoveAnims['skillswap'].anim};
BattleMoveAnims['powerswap'] = {anim:BattleMoveAnims['skillswap'].anim};
BattleMoveAnims['psychoshift'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['helpinghand'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['entrainment'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['roleplay'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['psychup'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['holdhands'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['lunardance'] = {anim:BattleMoveAnims['wish'].anim};

BattleMoveAnims['brickbreak'] = {anim:BattleMoveAnims['karatechop'].anim};
BattleMoveAnims['wringout'] = {anim:BattleMoveAnims['forcepalm'].anim};
BattleMoveAnims['stormthrow'] = {anim:BattleMoveAnims['circlethrow'].anim};
BattleMoveAnims['vitalthrow'] = {anim:BattleMoveAnims['circlethrow'].anim};
BattleMoveAnims['doubleslap'] = {anim:BattleMoveAnims['wakeupslap'].anim};
BattleMoveAnims['crushgrip'] = {anim:BattleMoveAnims['quash'].anim};

BattleMoveAnims['counter'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['payback'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['revenge'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['rockclimb'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['retaliate'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['superpower'] = {anim:BattleMoveAnims['closecombat'].anim};
BattleMoveAnims['bonerush'] = {anim:BattleMoveAnims['boneclub'].anim, multihit:true};
BattleMoveAnims['tackle'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['beatup'] = {anim:BattleMoveAnims['slam'].anim};
BattleMoveAnims['bodyslam'] = {anim:BattleMoveAnims['heavyslam'].anim};
BattleMoveAnims['dragonrage'] = {anim:BattleMoveAnims['dragonbreath'].anim};

BattleMoveAnims['silverwind'] = {anim:BattleMoveAnims['whirlwind'].anim};
BattleMoveAnims['gust'] = {anim:BattleMoveAnims['whirlwind'].anim};
BattleMoveAnims['twister'] = {anim:BattleMoveAnims['whirlwind'].anim};
BattleMoveAnims['aeroblast'] = {anim:BattleMoveAnims['hurricane'].anim};
BattleMoveAnims['razorwind'].anim = BattleMoveAnims['airslash'].anim;

BattleMoveAnims['chatter'] = {anim:BattleMoveAnims['hypervoice'].anim};
BattleMoveAnims['echoedvoice'] = {anim:BattleMoveAnims['hypervoice'].anim};
BattleMoveAnims['relicsong'] = {anim:BattleMoveAnims['hypervoice'].anim};
BattleMoveAnims['uproar'] = {anim:BattleMoveAnims['hypervoice'].anim};

BattleMoveAnims['destinybond'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['reflecttype'] = {anim:BattleMoveAnims['painsplit'].anim};

BattleMoveAnims['selfdestruct'] = {anim:BattleMoveAnims['explosion'].anim};

BattleMoveAnims['acid'] = {anim:BattleMoveAnims['sludge'].anim};
BattleMoveAnims['acidspray'] = {anim:BattleMoveAnims['sludge'].anim};
BattleMoveAnims['belch'] = {anim:BattleMoveAnims['gunkshot'].anim};
BattleMoveAnims['venoshock'] = {anim:BattleMoveAnims['sludgebomb'].anim};
BattleMoveAnims['venomdrench'] = {anim:BattleMoveAnims['sludge'].anim};
BattleMoveAnims['poisonsting'] = {anim:BattleMoveAnims['poisonjab'].anim};
BattleMoveAnims['poisontail'] = {anim:BattleMoveAnims['poisonjab'].anim};
BattleMoveAnims['gastroacid'] = {anim:BattleMoveAnims['toxic'].anim};

BattleMoveAnims['magnitude'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['fissure'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['bulldoze'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['thousandwaves'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['landswrath'] = {anim:BattleMoveAnims['earthquake'].anim};

BattleMoveAnims['camouflage'] = {anim:BattleMoveAnims['tailglow'].anim};
BattleMoveAnims['foulplay'] = {anim:BattleMoveAnims['psyshock'].anim};
BattleMoveAnims['psywave'] = {anim:BattleMoveAnims['psyshock'].anim};
BattleMoveAnims['extrasensory'] = {anim:BattleMoveAnims['psychic'].anim};
BattleMoveAnims['confusion'] = {anim:BattleMoveAnims['psychic'].anim};
BattleMoveAnims['miracleeye'] = {anim:BattleMoveAnims['mindreader'].anim};
BattleMoveAnims['futuresight'] = {anim:BattleMoveAnims['doomdesire'].anim};

BattleMoveAnims['glare'] = {anim:BattleMoveAnims['meanlook'].anim};
BattleMoveAnims['grudge'] = {anim:BattleMoveAnims['meanlook'].anim};
BattleMoveAnims['scaryface'] = {anim:BattleMoveAnims['meanlook'].anim};
BattleMoveAnims['disable'] = {anim:BattleMoveAnims['meanlook'].anim};
BattleMoveAnims['nightmare'] = {anim:BattleMoveAnims['nightshade'].anim};

BattleMoveAnims['captivate'] = {anim:BattleMoveAnims['attract'].anim};
BattleMoveAnims['charm'] = {anim:BattleMoveAnims['attract'].anim};
BattleMoveAnims['flatter'] = {anim:BattleMoveAnims['attract'].anim};

BattleMoveAnims['armthrust'] = {anim:BattleMoveAnims['smellingsalts'].anim, multhit:true};

BattleMoveAnims['phantomforce'] = {anim:BattleMoveAnims['shadowforce'].anim, prepareAnim:BattleMoveAnims['shadowforce'].prepareAnim, prepareMessage:BattleMoveAnims['shadowforce'].prepareMessage};

BattleMoveAnims['smackdown'] = {anim:BattleMoveAnims['rockblast'].anim};

BattleMoveAnims['fairywind'] = {anim:BattleMoveAnims['dazzlinggleam'].anim};
BattleMoveAnims['dreameater'] = {anim:BattleMoveAnims['drainingkiss'].anim};
BattleMoveAnims['sweetkiss'] = {anim:BattleMoveAnims['lovelykiss'].anim};

BattleMoveAnims['mirrorshot'] = {anim:BattleMoveAnims['flashcannon'].anim};
BattleMoveAnims['mirrorcoat'] = {anim:BattleMoveAnims['flashcannon'].anim};
BattleMoveAnims['metalburst'] = {anim:BattleMoveAnims['flashcannon'].anim};

BattleMoveAnims['mudslap'] = {anim:BattleMoveAnims['mudshot'].anim};
BattleMoveAnims['sandattack'] = {anim:BattleMoveAnims['mudshot'].anim};
BattleMoveAnims['mudsport'] = {anim:BattleMoveAnims['mudbomb'].anim};

BattleMoveAnims['spiderweb'] = {anim:BattleMoveAnims['electroweb'].anim};
BattleMoveAnims['stringshot'] = {anim:BattleMoveAnims['electroweb'].anim};

BattleMoveAnims['hyperfang'] = {anim:BattleMoveAnims['superfang'].anim};

BattleMoveAnims['barrage'] = {anim:BattleMoveAnims['magnetbomb'].anim, multihit:true};
BattleMoveAnims['clearsmog'] = {anim:BattleMoveAnims['magnetbomb'].anim};
BattleMoveAnims['eggbomb'] = {anim:BattleMoveAnims['magnetbomb'].anim};
BattleMoveAnims['smokescreen'] = {anim:BattleMoveAnims['magnetbomb'].anim};
BattleMoveAnims['spitup'] = {anim:BattleMoveAnims['magnetbomb'].anim};

BattleMoveAnims['rollingkick'] = {anim:BattleMoveAnims['doublekick'].anim};
BattleMoveAnims['triplekick'] = {anim:BattleMoveAnims['doublekick'].anim};

BattleMoveAnims['aromaticmist'] = {anim:BattleMoveAnims['mistyterrain'].anim};
BattleMoveAnims['sweetscent'] = {anim:BattleMoveAnims['mistyterrain'].anim};
BattleMoveAnims['iondeluge'] = {anim:BattleMoveAnims['electricterrain'].anim};
BattleMoveAnims['magneticflux'] = {anim:BattleMoveAnims['electricterrain'].anim};
BattleMoveAnims['rototiller'] = {anim:BattleMoveAnims['electricterrain'].anim};
BattleMoveAnims['flowershield'] = {anim:BattleMoveAnims['grassyterrain'].anim};

BattleMoveAnims['imprison'] = {anim:BattleMoveAnims['embargo'].anim};

BattleMoveAnims['healorder'] = {anim:BattleMoveAnims['recover'].anim};
BattleMoveAnims['synthesis'] = {anim:BattleMoveAnims['recover'].anim};

BattleMoveAnims['secretpower'] = {anim:BattleMoveAnims['technoblast'].anim};
BattleMoveAnims['naturalgift'] = {anim:BattleMoveAnims['technoblast'].anim};
