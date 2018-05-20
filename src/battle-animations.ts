/**
 * Pokemon Showdown Battle Animations
 *
 * There are the specific resource files and scripts for misc animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

/*

Most of this file is: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>

This license DOES extend to all images in the fx/ folder, with the exception of icicle.png, lightning.png, and bone.png.

icicle.png and lightning.png by Clint Bellanger are triple-licensed GPLv2/GPLv3/CC-BY-SA-3.0.
  <http://opengameart.org/content/icicle-spell>
  <http://opengameart.org/content/lightning-shock-spell>

rocks.png, rock1.png, rock2.png by PO user "Gilad" is licensed GPLv3.

This license DOES NOT extend to any images in the sprites/ folder.

This license DOES NOT extend to any other files in this repository.

*/

interface AnimData {
	anim(battle: Battle, args: Sprite[]): void;
	prepareAnim?(battle: Battle, args: Sprite[]): void;
	residualAnim?(battle: Battle, args: Sprite[]): void;
	prepareMessage?(pokemon: Pokemon, target: Pokemon): string;
	multihit?: boolean;
}
type AnimTable = {[k: string]: AnimData};

var BattleEffects: {[k: string]: SpriteData} = {
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
	blackwisp: {
		url: 'blackwisp.png',
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
	fist1: {
		url: 'fist1.png',
		w: 49, h: 55
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
	feather: {
		url: 'feather.png', // Ripped from http://www.clker.com/clipart-black-and-white-feather.html
		w: 100, h: 38
	},
	shell: {
		url: 'shell.png', // by Smogon user Jajoken
		w: 100, h: 91.5
	},
	petal: {
		url: 'petal.png', // by Smogon user Jajoken
		w: 60, h: 60
	},
	gear: {
		url: 'gear.png', // by Smogon user Jajoken
		w: 100, h: 100
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
	zsymbol: {
		url: 'z-symbol.png', // From http://froggybutt.deviantart.com/art/Pokemon-Z-Move-symbol-633125033
		w: 150, h: 100
	},
	ultra: {
		url: 'ultra.png', // by Pokemon Showdown user Modeling Clay
		w: 113, h: 165
	},
	hitmark: {
		url: 'hitmarker.png', // by Pokemon Showdown user Ridaz
		w: 100, h: 100
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

const BattleOtherAnims: AnimTable = {
	attack: {
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
				time: 400
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
				time: 400
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
				time: 700
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
				time: 700
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
			battle.showEffect('topbite', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 370
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('bottombite', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 370
			}, {
				x: defender.x,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
		}
	},
	kick: {
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
				opacity: 0.3,
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
				opacity: 0.3,
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
				opacity: 0.5
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker, defender]) {
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
	bound: {
		anim(battle, [attacker]) {
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 0
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 50
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 550
			}, 'decel', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 100
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 600
			}, 'decel', 'fade');
			attacker.anim({
				y: attacker.y + 15,
				z: attacker.behind(10),
				yscale: 1.3,
				time: 200
			}, 'swing');
			attacker.anim({
				time: 200
			}, 'swing');
			attacker.delay(25);
			attacker.anim({
				x: attacker.leftof(-10),
				y: attacker.y + 15,
				z: attacker.behind(5),
				yscale: 1.3,
				time: 200
			}, 'swing');
			attacker.anim({
				time: 200
			}, 'swing');
		}
	},
	selfstatus: {
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600
			}, 'linear');
		}
	},
	chargestatus: {
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker]) {
			attacker.anim({x: attacker.x - 10, time: 200});
			attacker.anim({x: attacker.x + 10, time: 300});
			attacker.anim({x: attacker.x, time: 200});
		}
	},
	dance: {
		anim(battle, [attacker]) {
			attacker.anim({x: attacker.x - 10});
			attacker.anim({x: attacker.x + 10});
			attacker.anim({x: attacker.x});
		}
	},
	consume: {
		anim(battle, [defender]) {
			battle.showEffect('wisp', {
				x: defender.leftof(-25),
				y: defender.y + 40,
				z: defender.behind(-20),
				scale: 0.5,
				opacity: 1
			}, {
				x: defender.leftof(-15),
				y: defender.y + 35,
				z: defender.z,
				scale: 0,
				opacity: 0.2,
				time: 500
			}, 'swing', 'fade');

			defender.delay(400);
			defender.anim({
				y: defender.y + 5,
				yscale: 1.1,
				time: 200
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
			defender.anim({
				y: defender.y + 5,
				yscale: 1.1,
				time: 200
			}, 'swing');
			defender.anim({
				time: 200
			}, 'swing');
		}
	},
	leech: {
		anim(battle, [attacker, defender]) {
			battle.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
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
				scale: 0.2,
				opacity: 0.7,
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
				scale: 0.2,
				opacity: 0.7,
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
		anim(battle, [attacker, defender]) {
			battle.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
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
				opacity: 0.6,
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
				opacity: 0.6,
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
		anim(battle, [attacker, defender]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [defender]) {
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
		anim(battle, [defender]) {
			battle.backgroundEffect('#ffffff', 600, 0.6);
			battle.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
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
				opacity: 0.6,
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
		anim(battle, [defender]) {
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
		anim(battle, [attacker]) {
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
	bidecharge: {
		anim(battle, [attacker]) {
			battle.showEffect('wisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 0
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 30,
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
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 15,
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

			attacker.anim({
				x: attacker.x - 2.5,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x + 2.5,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x - 2.5,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x + 2.5,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x - 2.5,
				time: 75
			}, 'swing');
			attacker.anim({
				time: 100
			}, 'accel');
		}
	},
	bideunleash: {
		anim(battle, [attacker]) {
			battle.showEffect('fireball', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.6
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
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
				opacity: 0.6,
				time: 300
			}, {
				scale: 6,
				opacity: 0
			}, 'linear');

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
		}
	},
	spectralthiefboost: {
		anim(battle, [attacker, defender]) {
			battle.backgroundEffect('linear-gradient(#000000 30%, #440044', 1400, 0.5);
			battle.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.5,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1
			}, {
				x: defender.x + 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.3,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1
			}, {
				x: defender.x - 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.3,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('shadowball', {
				x: defender.x + 35,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 50
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 300
			}, 'accel');
			battle.showEffect('shadowball', {
				x: defender.x - 35,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 100
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 350
			}, 'accel');
			battle.showEffect('shadowball', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.5,
				time: 150
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 400
			}, 'accel');
			battle.showEffect('shadowball', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				opacity: 0.4,
				scale: 0.25,
				time: 200
			}, {
				y: defender.y - 40,
				opacity: 0,
				time: 450
			}, 'accel');

			battle.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 300
			}, {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				time: 900
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 400
			}, {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				time: 900
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 450
			}, {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				time: 950
			}, 'decel', 'fade');

			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5,
				time: 750
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 1200
			}, 'decel', 'fade');

			battle.showEffect('shadowball', {
				x: attacker.x + 35,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 0.4,
				scale: 0.25,
				time: 750
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1000
			}, 'decel');
			battle.showEffect('shadowball', {
				x: attacker.x - 35,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 800
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1150
			}, 'decel');
			battle.showEffect('shadowball', {
				x: attacker.x + 15,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 950
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1200
			}, 'decel');
			battle.showEffect('shadowball', {
				x: attacker.x + 15,
				y: attacker.y - 40,
				z: attacker.z,
				opacity: 1,
				scale: 0.25,
				time: 1000
			}, {
				y: attacker.y,
				opacity: 0,
				time: 1350
			}, 'decel');

			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 750
			}, {
				x: attacker.x + 75,
				opacity: 0.3,
				time: 1200
			}, 'linear', 'fade');
			battle.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 750
			}, {
				x: attacker.x - 75,
				opacity: 0.3,
				time: 1200
			}, 'linear', 'fade');

			defender.anim({
				x: defender.x - 15,
				time: 75
			});
			defender.anim({
				x: defender.x + 15,
				time: 100
			});
			defender.anim({
				x: defender.x - 15,
				time: 100
			});
			defender.anim({
				x: defender.x + 15,
				time: 100
			});
			defender.anim({
				x: defender.x - 15,
				time: 100
			});
			defender.anim({
				x: defender.x + 15,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});
		}
	},
	schoolingin: {
		anim(battle, [attacker]) {
			battle.backgroundEffect('#0000DD', 600, 0.2);
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.5,
				opacity: 1
			}, {
				scale: 3,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 0.3
			}, {
				scale: 3.25,
				time: 600
			}, 'linear', 'explode');

			battle.showEffect('iceball', {
				x: attacker.leftof(200),
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 200
			}, 'ballistic', 'fade');
			battle.showEffect('iceball', {
				x: attacker.leftof(-140),
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('iceball', {
				x: attacker.leftof(-140),
				y: attacker.y + 50,
				z: attacker.behind(170),
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 400
			}, 'ballistic2', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.behind(-250),
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 500
			}, 'ballistic', 'fade');
			battle.showEffect('iceball', {
				x: attacker.leftof(240),
				y: attacker.y - 80,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
				time: 600
			}, 'ballistic2Under');
		}
	},
	schoolingout: {
		anim(battle, [attacker]) {
			battle.backgroundEffect('#0000DD', 600, 0.2);
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 1
			}, {
				scale: 2,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3.25,
				opacity: 0.3
			}, {
				scale: 2.5,
				time: 600
			}, 'linear', 'explode');

			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0
			}, {
				x: attacker.leftof(200),
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200
			}, 'ballistic', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 100
			}, {
				x: attacker.leftof(-140),
				y: attacker.y - 60,
				z: attacker.z,
				opacity: 0.5,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 200
			}, {
				x: attacker.leftof(-140),
				y: attacker.y + 50,
				z: attacker.behind(170),
				opacity: 0.5,
				time: 400
			}, 'ballistic2', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 200
			}, {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.behind(-250),
				opacity: 0.5,
				time: 500
			}, 'ballistic', 'fade');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300
			}, {
				x: attacker.leftof(240),
				y: attacker.y - 80,
				z: attacker.z,
				opacity: 0.5,
				time: 600
			}, 'ballistic2Under');
		}
	},
	primalalpha: {
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
			battle.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 500, 0.4);
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
		anim(battle, [attacker]) {
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
	},
	zpower: {
		anim(battle, [attacker]) {
			battle.backgroundEffect('linear-gradient(#000000 20%, #0000DD)', 1800, 0.4);
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
			battle.showEffect('zsymbol', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 500
			}, {
				scale: 1,
				opacity: 0.5,
				time: 800
			}, 'decel', 'explode');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 800
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1200
			}, 'accel');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 1000
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1400
			}, 'accel');
			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 1200
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 1600
			}, 'accel');
		}
	},
	powerconstruct: {
		anim(battle, [attacker]) {
			var xf = [1, -1, 1, -1];
			var yf = [1, -1, -1, 1];
			var xf2 = [1, 0, -1, 0];
			var yf2 = [0, 1, 0, -1];

			battle.backgroundEffect('#000000', 1000, 0.7);
			for (var i = 0; i < 4; i++) {
				battle.showEffect('energyball', {
					x: attacker.x + 150 * xf[i],
					y: attacker.y - 50,
					z: attacker.z + 70 * yf[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500
				}, 'decel', 'fade');
				battle.showEffect('energyball', {
					x: attacker.x + 200 * xf2[i],
					y: attacker.y - 50,
					z: attacker.z + 90 * yf2[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500
				}, 'decel', 'fade');

				battle.showEffect('energyball', {
					x: attacker.x + 50 * xf[i],
					y: attacker.y - 50,
					z: attacker.z + 100 * yf[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
					time: 200
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500
				}, 'decel', 'fade');
				battle.showEffect('energyball', {
					x: attacker.x + 100 * xf2[i],
					y: attacker.y - 50,
					z: attacker.z + 90 * yf2[i],
					scale: 0.1,
					xscale: 0.5,
					opacity: 0.4,
					time: 200
				}, {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 0.3,
					xscale: 0.8,
					opacity: 0,
					time: 500
				}, 'decel', 'fade');
			}
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 3,
				opacity: 0,
				time: 50
			}, {
				scale: 1,
				opacity: 0.8,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 3.5,
				opacity: 0,
				time: 150
			}, {
				scale: 1.5,
				opacity: 1,
				time: 350
			}, 'linear', 'fade');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200
			}, {
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 100
			}, {
				scale: 3.5,
				opacity: 0.8,
				time: 500
			}, 'linear', 'explode');
		}
	},
	ultraburst: {
		anim(battle, [attacker]) {
			battle.backgroundEffect('#000000', 600, 0.5);
			battle.backgroundEffect('#ffffff', 500, 1, 550);
			battle.showEffect('wisp', {
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
				time: 150
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
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
				time: 150
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
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
				time: 250
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
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
				time: 250
			}, 'linear', 'fade');
			battle.showEffect('wisp', {
				x: attacker.x - 70,
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
				time: 300
			}, 'linear', 'fade');

			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 1
			}, {
				scale: 4,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0
			}, {
				scale: 2.25,
				opacity: 0.1,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0,
				time: 200
			}, {
				scale: 2.25,
				opacity: 0.1,
				time: 600
			}, 'linear', 'explode');

			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2
			}, {
				scale: 1,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2,
				time: 150
			}, {
				scale: 1,
				opacity: 0,
				time: 450
			}, 'linear');
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0.2,
				time: 300
			}, {
				scale: 1,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('ultra', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 600
			}, {
				scale: 1,
				opacity: 0,
				time: 900
			}, 'decel');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0,
				opacity: 0.5,
				time: 600
			}, {
				scale: 2,
				xscale: 6,
				yscale: 1,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 0.5,
				time: 800
			}, {
				scale: 2,
				xscale: 6,
				opacity: 0.1,
				time: 1000
			}, 'linear');
		}
	}
};
var BattleStatusAnims: AnimTable = {
	hitmark: {
		anim(battle, [attacker]) {
			battle.showEffect('hitmark', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1
			}, {
				opacity: 0.5,
				time: 250
			}, 'linear', 'fade');
		}
	},
	brn: {
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
			battle.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2
			}, {
				scale: 2,
				opacity: 0.1,
				time: 300
			}, 'linear', 'fade');

			attacker.delay(100);
			attacker.anim({
				x: attacker.x - 1,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x + 1,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x - 1,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x + 1,
				time: 75
			}, 'swing');
			attacker.anim({
				x: attacker.x - 1,
				time: 75
			}, 'swing');
			attacker.anim({
				time: 100
			}, 'accel');
		}
	},
	frz: {
		anim(battle, [attacker]) {
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
		anim(battle, [attacker]) {
			battle.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			}, {
				scale: 3,
				opacity: 0.1,
				time: 300
			}, 'linear', 'fade');
		}
	},
	attracted: {
		anim(battle, [attacker]) {
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
	cursed: {
		anim(battle, [attacker]) {
			battle.backgroundEffect('#000000', 700, 0.2);
			attacker.delay(300);
			attacker.anim({x: attacker.x - 5, time: 50});
			attacker.anim({x: attacker.x + 5, time: 50});
			attacker.anim({x: attacker.x - 5, time: 50});
			attacker.anim({x: attacker.x + 5, time: 50});
			attacker.anim({x: attacker.x, time: 50});

			battle.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.5,
				time: 0
			}, {
				z: attacker.behind(20),
				opacity: 0,
				time: 600
			}, 'decel');
		}
	},
	confused: {
		anim(battle, [attacker]) {
			battle.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x - 50,
				scale: 0.15,
				opacity: 0.4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 400
			}, {
				x: attacker.x + 50,
				scale: 0.15,
				opacity: 0.4,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x - 50,
				scale: 0.4,
				opacity: 0.4,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('electroball', {
				x: attacker.x - 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.15,
				opacity: 1,
				time: 600
			}, {
				x: attacker.x + 50,
				scale: 0.4,
				opacity: 0.4,
				time: 800
			}, 'linear', 'fade');
		}
	},
	confusedselfhit: {
		anim(battle, [attacker]) {
			battle.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5
			}, {
				scale: 2,
				opacity: 0,
				time: 200
			}, 'linear');
			attacker.delay(50);
			attacker.anim({
				x: attacker.leftof(2),
				z: attacker.behind(5),
				time: 100
			}, 'swing');
			attacker.anim({
				time: 300
			}, 'swing');
		}
	}
};
BattleStatusAnims['focuspunch'] = {anim: BattleStatusAnims['flinch'].anim};

