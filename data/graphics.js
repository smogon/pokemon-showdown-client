/*

License: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>


This license DOES extend to all images in the fx/ folder, with the exception of icicle.png, lightning.png, and rock.png.

rock.png by Moser Juan Jose is licensed CC-BY-3.0.
  <http://opengameart.org/content/rock-low-poly>

icicle.png and lightning.png by Clint Bellanger are triple-licensed GPLv2/GPLv3/CC-BY-SA-3.0.
  <http://opengameart.org/content/icicle-spell>
  <http://opengameart.org/content/lightning-shock-spell>


rocks.png, rock1.png, rock2.png by PO user "Gilad" is licensed GPLv3.


This license DOES NOT extend to any images in the sprites/ folder, which are property of Nintendo Co., Ltd and used under Fair Use.


This license DOES NOT extend to any other files of the Pokemon replay viewer.

*/

var BattleEffects = {
	wisp: {
		url: 'fx/wisp.png',
		w: 100, h: 100
	},
	poisonwisp: {
		url: 'fx/poisonwisp.png',
		w: 100, h: 100
	},
	waterwisp: {
		url: 'fx/waterwisp.png',
		w: 100, h: 100
	},
	fireball: {
		url: 'fx/fireball.png',
		w: 64, h: 64
	},
	icicle: {
		url: 'fx/icicle.png', // http://opengameart.org/content/icicle-spell
		w: 80, h: 60
	},
	lightning: {
		url: 'fx/lightning.png', // http://opengameart.org/content/lightning-shock-spell
		w: 48, h: 229
	},
	rock: {
		url: 'fx/rock.png', // http://opengameart.org/content/rock-low-poly
		w: 80, h: 80
	},
	rocks: {
		url: 'fx/rocks.png', // Pokemon Online - Gilad
		w: 100, h: 100
	},
	rock1: {
		url: 'fx/rock1.png', // Pokemon Online - Gilad
		w: 64, h: 80
	},
	rock2: {
		url: 'fx/rock2.png', // Pokemon Online - Gilad
		w: 66, h: 72
	},
	caltrop: {
		url: 'fx/caltrop.png', // http://en.wikipedia.org/wiki/File:Caltrop.jpg
		w: 80, h: 80
	},
	poisoncaltrop: {
		url: 'fx/poisoncaltrop.png', // http://en.wikipedia.org/wiki/File:Caltrop.jpg
		w: 80, h: 80
	},
	shadowball: {
		url: 'fx/shadowball.png',
		w: 100, h: 100
	},
	energyball: {
		url: 'fx/energyball.png',
		w: 100, h: 100
	},
	electroball: {
		url: 'fx/electroball.png',
		w: 100, h: 100
	},
	pokeball: {
		url: 'fx/pokeball.png',
		w: 24, h: 24
	},
	fist: {
		url: 'fx/fist.png',
		w: 56, h: 44
	},
	foot: {
		url: 'fx/foot.png',
		w: 52, h: 64
	},
	topbite: {
		url: 'fx/topbite.png',
		w: 108, h: 64
	},
	bottombite: {
		url: 'fx/bottombite.png',
		w: 108, h: 64
	},
	none: {
		// this is for passing to battle.pos() and battle.posT() for CSS effects
		w: 100, h: 100
	}
};
(function() {
	if (!window.Tools || !Tools.resourcePrefix) return;
	for (var i in BattleEffects) {
		if (!BattleEffects[i].url) continue;
		BattleEffects[i].url = Tools.resourcePrefix + BattleEffects[i].url;
	}
})();
var BattleBackdrops = [
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
var BattleStats = {
	atk: 'Attack', def: 'Defense', spa: 'Special Attack', spd: 'Special Defense', spe: 'Speed', accuracy: 'accuracy', evasion: 'evasiveness'
};
var BattleItems = {
};
var BattleOtherAnims = {
	attack: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.5
			}, 'linear');
		}
	},
	contactattack: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y+80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y+5,
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y+80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y+5,
				z: defender.z,
				time: 100
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y+80,
				z: defender.behind(-30),
				time: 200
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y+5,
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
	clawattack: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.leftof(30),
				y: defender.y+80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y+5,
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
			battle.activityWait(500);
		}
	},
	punchattack: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('topbite',{
				x: defender.x,
				y: defender.y+50,
				z: defender.z,
				scale: .5,
				opacity: 0,
				time: 370
			},{
				x: defender.x,
				y: defender.y+20,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('bottombite',{
				x: defender.x,
				y: defender.y-50,
				z: defender.z,
				scale: .5,
				opacity: 0,
				time: 370
			},{
				x: defender.x,
				y: defender.y-20,
				z: defender.z,
				scale: .5,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
		}
	},
	kick: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('foot',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	fastattack: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 260
			},{
				scale: 2,
				opacity: 0,
				time: 560
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 310
			},{
				scale: 2,
				opacity: 0,
				time: 610
			}, 'linear');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			},{
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
		anim: function(battle, args) {
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: defender.x,
				y: defender.y+60,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic2');
			attacker.anim({
				x: defender.x,
				y: defender.y+5,
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
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			},{
				scale: 0,
				opacity: 1,
				time: 300
			}, 'linear');
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200
			},{
				scale: 0,
				opacity: 1,
				time: 500
			}, 'linear');
		}
	},
	lightstatus: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			},{
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	flight: {
		anim: function(battle, args) {
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
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10, time: 200});
			attacker.anim({x: attacker.x + 10, time: 300});
			attacker.anim({x: attacker.x, time: 200});
		}
	},
	dance: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10});
			attacker.anim({x: attacker.x + 10});
			attacker.anim({x: attacker.x});
		}
	},
	leech: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: defender.x-30,
				y: defender.y-40,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 0
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0.1
			}, 'ballistic2', 'fade');
			battle.showEffect('energyball',{
				x: defender.x+40,
				y: defender.y-35,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 50
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0.1
			}, 'linear', 'fade');
			battle.showEffect('energyball',{
				x: defender.x+20,
				y: defender.y-25,
				z: defender.z,
				scale: .2,
				opacity: .7,
				time: 100
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0.1
			}, 'ballistic2Under', 'fade');
		}
	},
	fullparalysis: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			},{
				scale: 3,
				opacity: .1,
				time: 300
			}, 'linear', 'fade');
		}
	},
	drain: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 0
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0
			}, 'ballistic2');
			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 50
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0
			}, 'linear');
			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: .6,
				time: 100
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0
			}, 'ballistic2Under');
		}
	}
};
var BattleMoveAnims = {
	taunt: {
		anim: BattleOtherAnims.shake.anim
	},
	swagger: {
		anim: BattleOtherAnims.shake.anim
	},
	swordsdance: {
		anim: BattleOtherAnims.shake.anim
	},
	quiverdance: {
		anim: BattleOtherAnims.shake.anim
	},
	dragondance: {
		anim: BattleOtherAnims.shake.anim
	},
	agility: {
		anim: BattleOtherAnims.shake.anim
	},
	doubleteam: {
		anim: BattleOtherAnims.shake.anim
	},
	metronome: {
		anim: BattleOtherAnims.shake.anim
	},
	teeterdance: {
		anim: BattleOtherAnims.shake.anim
	},
	splash: {
		anim: BattleOtherAnims.shake.anim
	},
	encore: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			attacker.anim({x: attacker.x - 10, time: 100});
			attacker.anim({x: attacker.x + 10, time: 200});
			attacker.anim({x: attacker.x, time: 100});
		}
	},
	attract: {
		anim: BattleOtherAnims.dance.anim
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
		anim: BattleOtherAnims.dance.anim
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
	aerialace: {
		anim: BattleOtherAnims.flight.anim
	},
	bravebird: {
		anim: BattleOtherAnims.flight.anim
	},
	acrobatics: {
		anim: BattleOtherAnims.flight.anim
	},
	dragonpulse: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5,
				time: 50
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: .5,
				time: 100
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .2
			}, 'decel');
		}
	},
	focusblast: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#B84038',700,.6);
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: .6,
				opacity: 1,
				time: 300
			}, 'decel', 'fade');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: .3,
				time: 100
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: .8,
				opacity: .6,
				time: 400
			}, 'decel', 'fade');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: .6,
				opacity: .8,
				time: 400
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: .8,
				time: 800
			}, 'accel', 'explode');
		}
	},
	painsplit: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0
			},{
				scale: 3,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 200
			},{
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 0
			},{
				scale: 3,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 200
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0
			},{
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200
			},{
				scale: 8,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('electroball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.2,
				time: 500
			},{
				scale: 4,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
		}
	},
	thunderwave: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0
			},{
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200
			},{
				scale: 8,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
			battle.showEffect('electroball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.2,
				time: 500
			},{
				scale: 4,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
		}
	},
	bugbuzz: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 0
			},{
				scale: 8,
				opacity: .07,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 100
			},{
				scale: 8,
				opacity: .07,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 200
			},{
				scale: 8,
				opacity: .07,
				time: 600
			}, 'linear', 'fade');
			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500
			},{
				scale: 2,
				opacity: .1,
				time: 800
			}, 'linear', 'fade');
		}
	},
	explosion: {
		anim: function(battle, args) {
			var attacker = args[0];

			battle.showEffect('fireball',{
				x: attacker.x+40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: .6
			},{
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball',{
				x: attacker.x-40,
				y: attacker.y-20,
				z: attacker.z,
				scale: 0,
				opacity: .6,
				time: 150
			},{
				scale: 6,
				opacity: 0
			}, 'linear');
			battle.showEffect('fireball',{
				x: attacker.x+10,
				y: attacker.y+20,
				z: attacker.z,
				scale: 0,
				opacity: .6,
				time: 300
			},{
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
		anim: function(){}
	},
	safeguard: {
		anim: function(){}
	},
	lightscreen: {
		anim: function(){}
	},
	mist: {
		anim: function(){}
	},
	transform: {
		anim: function(){}
	},
	bellydrum: {
		anim: BattleOtherAnims.selfstatus.anim
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
	endure: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	bide: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	rockpolish: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	harden: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	irondefense: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	rest: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	howl: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	acupressure: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	curse: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	shiftgear: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	autotomize: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	bulkup: {
		anim: BattleOtherAnims.selfstatus.anim
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
	ingrain: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	aquaring: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	coil: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	refresh: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	minimize: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	tailwind: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	doomdesire: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	futuresight: {
		anim: BattleOtherAnims.selfstatus.anim
	},
	cottonguard: {
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
	acidarmor: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			},{
				scale: 0,
				opacity: 1,
				time: 300
			}, 'linear');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200
			},{
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
	synthesis: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	moonlight: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	morningsun: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	cosmicpower: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	charge: {
		anim: BattleOtherAnims.lightstatus.anim
	},
	geomancy: {
		prepareAnim: BattleOtherAnims.lightstatus.anim,
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' is absorbing power!';
		}
	},
	substitute: {
		anim: function(){}
	},
	batonpass: {
		anim: function(){}
	},
	calmmind: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			},{
				scale: 0,
				opacity: .5,
				time: 400
			}, 'linear');
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 200
			},{
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	nastyplot: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			},{
				scale: 0,
				opacity: .5,
				time: 400
			}, 'linear');
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 200
			},{
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	growth: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			},{
				scale: 0,
				opacity: .5,
				time: 400
			}, 'linear');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 200
			},{
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	tailglow: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0
			},{
				scale: 1,
				opacity: .5,
				time: 400
			}, 'linear', 'explode');
		}
	},
	trick: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('pokeball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0
			},{
				x: defender.x,
				y: defender.y-30,
				z: defender.z,
				time: 300
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0
			},{
				x: attacker.x,
				y: attacker.y-30,
				z: attacker.z,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball',{
				x: defender.x,
				y: defender.y-30,
				z: defender.z,
				time: 300
			},{
				x: attacker.x-50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball',{
				x: attacker.x,
				y: attacker.y-30,
				z: attacker.z,
				time: 300
			},{
				x: defender.x-50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball',{
				x: attacker.x-50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900
			}, 'ballistic2', 'explode');
			battle.showEffect('pokeball',{
				x: defender.x-50,
				y: defender.y,
				z: defender.z,
				time: 600
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900
			}, 'ballistic2Under', 'explode');
		}
	},
	switcheroo: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];
			battle.showEffect('pokeball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0
			},{
				x: defender.x,
				y: defender.y-30,
				z: defender.z,
				time: 300
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0
			},{
				x: attacker.x,
				y: attacker.y-30,
				z: attacker.z,
				time: 300
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball',{
				x: defender.x,
				y: defender.y-30,
				z: defender.z,
				time: 300
			},{
				x: attacker.x-50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			}, 'ballistic2', 'fade');
			battle.showEffect('pokeball',{
				x: attacker.x,
				y: attacker.y-30,
				z: attacker.z,
				time: 300
			},{
				x: defender.x-50,
				y: defender.y,
				z: defender.z,
				time: 600
			}, 'ballistic2Under', 'fade');
			battle.showEffect('pokeball',{
				x: attacker.x-50,
				y: attacker.y,
				z: attacker.z,
				time: 600
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900
			}, 'ballistic2', 'explode');
			battle.showEffect('pokeball',{
				x: defender.x-50,
				y: defender.y,
				z: defender.z,
				time: 600
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900
			}, 'ballistic2Under', 'explode');
		}
	},
	recover: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0
			},{
				scale: 0,
				opacity: .5,
				time: 600
			}, 'linear');
		}
	},
	shadowforce: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400
			},{
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			},{
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
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' vanished instantly!';
		}
	},
	bounce: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			},{
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			},{
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y+80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y+80,
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
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y+80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' sprang up!';
		}
	},
	dig: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			},{
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			},{
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y-80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y-80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y-80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y-80,
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
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y-80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' burrowed its way under the ground!';
		}
	},
	dive: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350
			},{
				scale: 3,
				opacity: 0,
				time: 500
			}, 'linear');
			battle.showEffect('waterwisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			},{
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			attacker.anim({
				y: attacker.y-80,
				opacity: 0,
				time: 100
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y-80,
				z: defender.z,
				opacity: 0,
				time: 1
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+10,
				z: defender.z,
				opacity: 1,
				time: 350
			}, 'decel');
			attacker.anim({
				x: defender.x,
				y: defender.y-80,
				z: defender.z,
				opacity: 0,
				time: 300
			}, 'accel');
			attacker.anim({
				y: attacker.y-80,
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
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y-80,
				time: 300
			}, 'swing');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' hid underwater!';
		}
	},
	fly: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y+80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' flew up high!';
		}
	},
	skydrop: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				opacity: 0.2,
				y: attacker.y+80,
				time: 300
			}, 'linear');
			defender.anim({
				opacity: 0.2,
				y: defender.y+80,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon, pokemon2) {
			return pokemon.getName()+' took '+pokemon2.getLowerName()+' into the sky!';
		}
	},
	skullbash: {
		anim: BattleOtherAnims.contactattack.anim,
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.8,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' tucked in its head!';
		}
	},
	skyattack: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim: function(battle, args) {
			var attacker = args[0];

			attacker.anim({
				opacity: 0.8,
				time: 300
			}, 'linear');
		},
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' became cloaked in a harsh light!';
		}
	},
	hiddenpower: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf=[1,-1,1,-1];
			var yf=[1,-1,-1,1];
			var xf2=[1,0,-1,0];
			var yf2=[0,1,0,-1];

			for (var i=0; i<4; i++)
			{
				battle.showEffect('electroball',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				},{
					x: attacker.x+240*xf[i],
					y: attacker.y,
					z: attacker.z+137*yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('electroball',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				},{
					x: attacker.x+339*xf2[i],
					y: attacker.y,
					z: attacker.z+194*yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	storedpower: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf=[1,-1,1,-1];
			var yf=[1,-1,-1,1];
			var xf2=[1,0,-1,0];
			var yf2=[0,1,0,-1];

			for (var i=0; i<4; i++)
			{
				battle.showEffect('poisonwisp',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				},{
					x: attacker.x+240*xf[i],
					y: attacker.y,
					z: attacker.z+137*yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('poisonwisp',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1
				},{
					x: attacker.x+339*xf2[i],
					y: attacker.y,
					z: attacker.z+194*yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	seedflare: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			var xf=[1,-1,1,-1];
			var yf=[1,-1,-1,1];
			var xf2=[1,0,-1,0];
			var yf2=[0,1,0,-1];

			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: .4,
				time: 0
			},{
				scale: 8,
				opacity: .1,
				time: 600
			}, 'linear', 'fade');
			for (var i=0; i<4; i++)
			{
				battle.showEffect('wisp',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: .2,
					opacity: 1
				},{
					x: attacker.x+240*xf[i],
					y: attacker.y,
					z: attacker.z+137*yf[i],
					scale: .3,
					opacity: 0.5,
					time: 800
				}, 'accel');
				battle.showEffect('wisp',{
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: .2,
					opacity: 1
				},{
					x: attacker.x+339*xf2[i],
					y: attacker.y,
					z: attacker.z+194*yf2[i],
					scale: .3,
					opacity: 0.5,
					time: 800
				}, 'accel');
			}
		}
	},
	powerwhip: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.clawattack.anim(battle,args);

			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	woodhammer: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.clawattack.anim(battle,args);

			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('energyball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	dragonclaw: {
		anim: BattleOtherAnims.clawattack.anim
	},
	shadowclaw: {
		anim: BattleOtherAnims.clawattack.anim
	},
	nightslash: {
		anim: BattleOtherAnims.clawattack.anim
	},
	sacredsword: {
		anim: BattleOtherAnims.clawattack.anim
	},
	knockdown: {
		anim: BattleOtherAnims.clawattack.anim
	},
	seismictoss: {
		anim: BattleOtherAnims.contactattack.anim
	},
	drillpeck: {
		anim: BattleOtherAnims.contactattack.anim
	},
	bite: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	superfang: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	bugbite: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	crunch: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	pursuit: {
		anim: BattleOtherAnims.contactattack.anim
	},
	highjumpkick: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.kick.anim(battle,args);
		}
	},
	ironhead: {
		anim: BattleOtherAnims.contactattack.anim
	},
	doubleedge: {
		anim: BattleOtherAnims.contactattack.anim
	},
	bodyslam: {
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
	circlethrow: {
		anim: BattleOtherAnims.contactattack.anim
	},
	knockoff: {
		anim: BattleOtherAnims.contactattack.anim
	},
	xscissor: {
		anim: BattleOtherAnims.xattack.anim
	},
	crosschop: {
		anim: BattleOtherAnims.xattack.anim
	},
	facade: {
		anim: BattleOtherAnims.xattack.anim
	},
	guillotine: {
		anim: BattleOtherAnims.xattack.anim
	},
	'return': {
		anim: BattleOtherAnims.xattack.anim
	},
	frustration: {
		anim: BattleOtherAnims.xattack.anim
	},
	closecombat: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.xattack.anim(battle,args);
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 1050
			}, 'linear');
		}
	},
	endeavor: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.xattack.anim(battle,args);
			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 450
			},{
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 750
			}, 'linear', 'fade');
			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 750
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 1050
			}, 'linear', 'fade');
		}
	},
	strength: {
		anim: BattleOtherAnims.contactattack.anim
	},
	hammerarm: {
		anim: BattleOtherAnims.punchattack.anim
	},
	brickbreak: {
		anim: BattleOtherAnims.punchattack.anim
	},
	poisonjab: {
		anim: BattleOtherAnims.punchattack.anim
	},
	shadowpunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	focuspunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	drainpunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	dynamicpunch: {
		name: 'DynamicPunch',
		anim: BattleOtherAnims.punchattack.anim
	},
	cometpunch: {
		anim: BattleOtherAnims.punchattack.anim,
		multihit: true
	},
	megapunch: {
		anim: BattleOtherAnims.punchattack.anim
	},
	hornleech: {
		anim: BattleOtherAnims.drain.anim
	},
	absorb: {
		anim: BattleOtherAnims.drain.anim
	},
	megadrain: {
		anim: BattleOtherAnims.drain.anim
	},
	gigadrain: {
		anim: BattleOtherAnims.drain.anim
	},
	extremespeed: {
		name: 'ExtremeSpeed',
		anim: BattleOtherAnims.fastattack.anim
	},
	quickattack: {
		anim: BattleOtherAnims.fastattack.anim
	},
	suckerpunch: {
		anim: BattleOtherAnims.fastattack.anim
	},
	bulletpunch: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.fastattack.anim(battle, args);
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	machpunch: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			BattleOtherAnims.fastattack.anim(battle, args);
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	assist: {
		anim: function(){}
	},
	naturepower: {
		anim: function(){}
	},
	copycat: {
		anim: function(){}
	},
	sleeptalk: {
		anim: function(){}
	},
	megahorn: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#987058',400,.3);
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			},{
				scale: 3,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('icicle',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			},{
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
		name: 'ThunderPunch',
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('lightning',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			},{
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fist',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400
			},{
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
	icefang: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('icicle',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	firefang: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	thunderfang: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('lightning',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle,args);
			BattleOtherAnims.bite.anim(battle,args);
		}
	},
	wildcharge: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect('lightning',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550
			},{
				x: defender.x,
				y: defender.y-40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900
			}, 'linear');

			BattleOtherAnims.contactattack.anim(battle,args);
		}
	},
	hyperbeam: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			},{
				x: defender.x+30,
				y: defender.y+30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			},{
				x: defender.x+20,
				y: defender.y-30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			},{
				x: defender.x-30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			},{
				x: defender.x-10,
				y: defender.y+10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			},{
				x: defender.x+10,
				y: defender.y-10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			},{
				x: defender.x-20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');

			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550
			},{
				scale: 4,
				opacity: 0,
				time: 750
			}, 'linear');
			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600
			},{
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	gigaimpact: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 700, 0.2);

			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300
			},{
				scale: 4,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500
			},{
				scale: 4,
				opacity: 0,
				time: 800
			}, 'linear');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			},{
				scale: 8,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500
			},{
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
	outrage: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0
			},{
				x: attacker.x-50,
				y: attacker.y-50,
				z: attacker.z,
				scale: 2,
				opacity: 0,
				time: 300
			}, 'ballistic');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150
			},{
				x: attacker.x+60,
				y: attacker.y-50,
				z: attacker.z,
				scale: 2,
				opacity: 0,
				time: 450
			}, 'ballistic');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300
			},{
				x: attacker.x+10,
				y: attacker.y-60,
				z: attacker.z,
				scale: 2,
				opacity: 0,
				time: 600
			}, 'ballistic');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
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
				time: 100
			}, 'swing');
			defender.anim({
				time: 300
			}, 'swing');
		}
	},
	zenheadbutt: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450
			},{
				scale: 2,
				opacity: 0,
				time: 700
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y+80,
				z: defender.behind(-30),
				time: 400
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y+5,
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
	shadowsneak: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	faintattack: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	mefirst: {
		anim: BattleOtherAnims.sneakattack.anim
	},
	struggle: {
		anim: BattleOtherAnims.contactattack.anim
	},
	earthquake: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			attacker.anim({
				x: attacker.x-30,
				time: 75
			});
			attacker.anim({
				x: attacker.x+30,
				time: 100
			});
			attacker.anim({
				x: attacker.x-30,
				time: 100
			});
			attacker.anim({
				x: attacker.x+30,
				time: 100
			});
			attacker.anim({
				x: attacker.x,
				time: 100
			});

			defender.anim({
				x: defender.x-30,
				time: 75
			});
			defender.anim({
				x: defender.x+30,
				time: 100
			});
			defender.anim({
				x: defender.x-30,
				time: 100
			});
			defender.anim({
				x: defender.x+30,
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
		anim: function(battle, args) {
			var defender = args[1];

			defender.anim({
				x: defender.x-30,
				time: 75
			});
			defender.anim({
				x: defender.x+30,
				time: 100
			});
			defender.anim({
				x: defender.x-30,
				time: 100
			});
			defender.anim({
				x: defender.x+30,
				time: 100
			});
			defender.anim({
				x: defender.x,
				time: 100
			});

			battle.showEffect('caltrop',{
				x: defender.x+10,
				y: defender.y-35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 0
			},{
				x: defender.x+10,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 300
			}, 'linear');
			battle.showEffect('caltrop',{
				x: defender.x-30,
				y: defender.y-35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 100
			},{
				x: defender.x-30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('caltrop',{
				x: defender.x+40,
				y: defender.y-35,
				z: defender.z,
				scale: .4,
				opacity: 1,
				time: 200
			},{
				x: defender.x+40,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 500
			}, 'linear');
		}
	},
	whirlwind: {
		anim: function(battle, args) {
			var defender = args[1];

			for (var i=0; i<3; i++) {
				battle.showEffect('wisp',{
					x: defender.x+30,
					y: defender.y-35,
					z: defender.behind(i*40-60),
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x-30,
					y: defender.y,
					z: defender.behind(i*40-60),
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x-30,
					y: defender.y+35,
					z: defender.behind(i*40-60),
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x+30,
					y: defender.y,
					z: defender.behind(i*40-60),
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x+30,
					y: defender.y,
					z: defender.behind(i*40-60),
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x-30,
					y: defender.y-35,
					z: defender.behind(i*40-60),
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x-30,
					y: defender.y,
					z: defender.behind(i*40-60),
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x+30,
					y: defender.y-35,
					z: defender.behind(i*40-60),
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
			}
		}
	},
	hurricane: {
		anim: function(battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#000000', 900, 0.6);

			for (var i=0; i<4; i++) {
				battle.showEffect('wisp',{
					x: defender.x+50,
					y: defender.y-35,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x-50,
					y: defender.y,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x-50,
					y: defender.y+35,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x+50,
					y: defender.y,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x+50,
					y: defender.y,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x-50,
					y: defender.y-35,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
				battle.showEffect('wisp',{
					x: defender.x-50,
					y: defender.y,
					z: defender.z,
					scale: .2,
					opacity: 1,
					time: 200*i
				},{
					x: defender.x+50,
					y: defender.y-35,
					z: defender.z,
					scale: .4,
					opacity: .4,
					time: 200*i+200
				}, 'linear', 'fade');
			}
		}
	},
	roar: {
		anim: function(battle, args) {
			var attacker = args[0];
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 0
			},{
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 400
			}, 'linear');
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 150
			},{
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 600
			}, 'linear');
			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 300
			},{
				z: attacker.behind(-50),
				scale: 5,
				opacity: 0,
				time: 800
			}, 'linear');
		}
	},
	thunder: {
		anim: function(battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#000000', 1100, 0.7);
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				yscale: 0,
				xscale: 1
			},{
				x: defender.x,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				opacity: 0,
				time: 200
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				time: 200
			},{
				opacity: 0,
				time: 700
			}, 'linear');
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				time: 600
			},{
				opacity: 0,
				time: 1100
			}, 'linear');
		}
	},
	thunderbolt: {
		anim: function(battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#000000', 600, 0.2);
			battle.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				yscale: 0,
				xscale: 1
			},{
				x: defender.x,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				opacity: .8,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('lightning', {
				x: defender.x-25,
				y: defender.y + 100,
				z: defender.z,
				yscale: 0,
				xscale: 1,
				time: 200
			},{
				x: defender.x-25,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				opacity: .8,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('lightning', {
				x: defender.x+25,
				y: defender.y + 100,
				z: defender.z,
				yscale: 0,
				xscale: 1,
				time: 400
			},{
				x: defender.x+25,
				y: defender.y + 25,
				z: defender.z,
				yscale: .7,
				xscale: 1,
				opacity: .8,
				time: 600
			}, 'linear', 'fade');
		}
	},
	psychic: {
		anim: function(battle, args) {
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
		anim: function(battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#AA0000', 250, 0.3);
			battle.backgroundEffect('#000000', 250, 0.2, 400);
			battle.activityWait(700);
		}
	},
	nightshade: {
		anim: function(battle, args) {
			var defender = args[1];
			battle.backgroundEffect('#550000', 250, 0.3);
			battle.backgroundEffect('#000000', 250, 0.2, 400);
			battle.activityWait(700);
		}
	},
	rockblast: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock2',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .6,
				opacity: 0.4
			},{
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
		multihit: true
	},
	iciclespear: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.6,
				time: 75
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 375
			}, 'linear', 'fade');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .5,
				opacity: 0.6,
				time: 150
			},{
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
		anim: BattleOtherAnims.clawattack.anim,
		multihit: true
	},
	furyswipes: {
		anim: BattleOtherAnims.clawattack.anim,
		multihit: true
	},
	furyattack: {
		anim: BattleOtherAnims.clawattack.anim,
		multihit: true
	},
	bulletseed: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.6,
				time: 30
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 330
			}, 'linear', 'fade');
		},
		multihit: true
	},
	aquajet: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: attacker.x+20,
				y: attacker.y+30,
				z: defender.z,
				scale: 0,
				opacity: 1
			},{
				y: attacker.y-20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp',{
				x: parseInt((attacker.x+defender.x)/2)-20,
				y: parseInt((attacker.y+defender.y)/2)+30,
				z: parseInt((attacker.z+defender.z)/2),
				scale: 0,
				opacity: 1,
				time: 150
			},{
				y: parseInt((attacker.y+defender.y)/2)-20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp',{
				x: defender.x+10,
				y: defender.y+30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300
			},{
				y: defender.y-20,
				scale: 4,
				opacity: 0
			}, 'decel');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 50
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350
			}, 'accel', 'fade');
			battle.showEffect(attacker.sp,{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: .3,
				time: 100
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 100
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 400
			}, 'linear', 'fade');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 200
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 500
			}, 'linear', 'fade');
		}
	},
	icebeam: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 100
			},{
				x: defender.x+10,
				y: defender.y-5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200
			},{
				x: defender.x-10,
				y: defender.y+5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 300
			},{
				x: defender.x,
				y: defender.y-5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');
		}
	},
	powergem: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock1',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.2
			},{
				x: defender.x+50,
				y: defender.y+20,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .7,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock2',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.2
			},{
				x: defender.x+40,
				y: defender.y-30,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .7,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock1',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .2,
				opacity: 0.7
			},{
				x: defender.x-50,
				y: defender.y+5,
				z: defender.behind(20),
				opacity: 0.6,
				scale: .8,
				time: 400
			}, 'linear', 'explode');
		}
	},
	chargebeam: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .7,
				opacity: 0.2
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .7,
				opacity: 0.2,
				time: 100
			},{
				x: defender.x+10,
				y: defender.y-5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .7,
				opacity: 0.2,
				time: 200
			},{
				x: defender.x-10,
				y: defender.y+5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .7,
				opacity: 0.2,
				time: 300
			},{
				x: defender.x,
				y: defender.y-5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700
			}, 'linear', 'explode');
		}
	},
	flamethrower: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7
			},{
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.6,
				time: 400
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 100
			},{
				x: defender.x+10,
				y: defender.y-5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 500
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 200
			},{
				x: defender.x-10,
				y: defender.y+5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 600
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 300
			},{
				x: defender.x,
				y: defender.y-5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 700
			}, 'decel', 'explode');
		}
	},
	toxic: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
		}
	},
	sludgebomb: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			},{
				x: defender.x+40,
				y: defender.y-20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('poisonwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			},{
				x: defender.x-30,
				y: defender.y-10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	seedbomb: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 400
			}, 'ballistic', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100
			},{
				x: defender.x+40,
				y: defender.y-20,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 500
			}, 'ballistic', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200
			},{
				x: defender.x-30,
				y: defender.y-10,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 600
			}, 'ballistic', 'explode');
		}
	},
	willowisp: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0
			},{
				x: defender.leftof(40),
				y: defender.y+15,
				z: defender.z,
				scale: 0.8,
				opacity: .7,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('fireball',{
				x: defender.leftof(40),
				y: defender.y+15,
				z: defender.z,
				scale: 0.8,
				opacity: .7,
				time: 500
			},{
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 700
			}, 'swing', 'fade');
			battle.showEffect('fireball',{
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 700
			},{
				x: defender.leftof(10),
				y: defender.y-15,
				z: defender.z,
				scale: .7,
				opacity: 1,
				time: 900
			}, 'swing', 'explode');
		}
	},
	stoneedge: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock1',{
				x: defender.x+15,
				y: defender.y-50,
				z: defender.z,
				scale: .5
			},{
				y: defender.y+60,
				opacity: 0,
				time: 350
			}, 'accel');
			battle.showEffect('rock2',{
				x: defender.x+30,
				y: defender.y-50,
				z: defender.z,
				scale: .5,
				time: 150
			},{
				y: defender.y+60,
				opacity: 0,
				time: 500
			}, 'accel');
			battle.showEffect('rock1',{
				x: defender.x-30,
				y: defender.y-50,
				z: defender.z,
				scale: .5,
				time: 300
			},{
				y: defender.y+60,
				opacity: 0,
				time: 650
			}, 'accel');
			battle.showEffect('rock2',{
				x: defender.x,
				y: defender.y-50,
				z: defender.z,
				scale: .5,
				time: 400
			},{
				y: defender.y+60,
				opacity: 0,
				time: 750
			}, 'accel');
			battle.showEffect('rock1',{
				x: defender.x-15,
				y: defender.y-50,
				z: defender.z,
				scale: .5,
				time: 500
			},{
				y: defender.y+60,
				opacity: 0,
				time: 850
			}, 'accel');
		}
	},
	rockslide: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock2',{
				x: defender.x+15,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: .5
			},{
				y: defender.y-20,
				opacity: 1,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('rock1',{
				x: defender.x+30,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 100
			},{
				y: defender.y-20,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('rock2',{
				x: defender.x-30,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 200
			},{
				y: defender.y-20,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('rock1',{
				x: defender.x,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 300
			},{
				y: defender.y-20,
				opacity: 1,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('rock2',{
				x: defender.x-15,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: .5,
				time: 400
			},{
				y: defender.y-20,
				opacity: 1,
				time: 700
			}, 'linear', 'explode');
		}
	},
	avalanche: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('icicle',{
				x: defender.x+15,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: 1
			},{
				y: defender.y-20,
				opacity: 1,
				time: 300
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: defender.x+30,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 100
			},{
				y: defender.y-20,
				opacity: 1,
				time: 400
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: defender.x-30,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 200
			},{
				y: defender.y-20,
				opacity: 1,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: defender.x,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 300
			},{
				y: defender.y-20,
				opacity: 1,
				time: 600
			}, 'linear', 'explode');
			battle.showEffect('icicle',{
				x: defender.x-15,
				y: defender.y+70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 400
			},{
				y: defender.y-20,
				opacity: 1,
				time: 700
			}, 'linear', 'explode');
		}
	},
	spore: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: defender.x+10,
				y: defender.y+90,
				z: defender.z,
				opacity: 0,
				scale: .4
			},{
				y: defender.y-5,
				opacity: 1,
				time: 500
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp',{
				x: defender.x+30,
				y: defender.y+90,
				z: defender.z,
				opacity: 0,
				scale: .4,
				time: 150
			},{
				y: defender.y-5,
				opacity: 1,
				time: 650
			}, 'decel', 'fade');
			battle.showEffect('poisonwisp',{
				x: defender.x-30,
				y: defender.y+90,
				z: defender.z,
				opacity: 0,
				scale: .4,
				time: 300
			},{
				y: defender.y-5,
				opacity: 1,
				time: 800
			}, 'decel', 'fade');
		}
	},
	fireblast: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 50
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 550
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			},{
				x: defender.x,
				y: defender.y-100,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			},{
				x: defender.x-60,
				y: defender.y+80,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			},{
				x: defender.x+60,
				y: defender.y+80,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			},{
				x: defender.x-90,
				y: defender.y-40,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
			battle.showEffect('fireball',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500
			},{
				x: defender.x+90,
				y: defender.y-40,
				scale: 3,
				opacity: 0,
				time: 1100
			}, 'linear', 'fade');
		}
	},
	judgment: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x-100,
				y: defender.y,
				z: defender.z,
				scale: .5,
				opacity: 0.2
			},{
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 250
			}, 'decel', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+70,
				y: defender.y-70,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 100
			},{
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 350
			}, 'decel', 'fade');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y+100,
				z: defender.z,
				scale: .5,
				opacity: 0.2,
				time: 200
			},{
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 450
			}, 'decel', 'fade');

			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.x,
				y: defender.y-100,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.x-60,
				y: defender.y+80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.x+60,
				y: defender.y+80,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.x-90,
				y: defender.y-40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450
			},{
				x: defender.x+90,
				y: defender.y-40,
				scale: 0.9,
				opacity: 0,
				time: 950
			}, 'linear', 'fade');
		}
	},
	shadowball: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#000000', 600, 0.1);
			battle.showEffect('shadowball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 600
			}, 'linear', 'fade');
		}
	},
	energyball: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			},{
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
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('electroball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3
			},{
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500
			}, 'linear', 'explode');
		}
	},
	weatherball: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			},{
				y: attacker.y+90,
				opacity: 0
			}, 'linear');
			battle.showEffect('wisp',{
				x: defender.x,
				y: defender.y+90,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 500
			},{
				y: defender.y,
				opacity: 1,
				time: 1000
			}, 'linear', 'explode');
		}
	},
	wish: {
		anim: function(battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			},{
				y: attacker.y+130,
				opacity: 0
			}, 'accel');
		},
		residualAnim: function(battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y+130,
				z: attacker.z,
				scale: 1,
				opacity: 0
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1
			}, 'decel', 'explode');
		}
	},
	healingwish: {
		anim: function(battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1
			},{
				x: attacker.x,
				y: attacker.y+130,
				z: attacker.z,
				opacity: 0
			}, 'accel');
		},
		residualAnim: function(battle, args) {
			var attacker = args[0];

			battle.showEffect('wisp',{
				x: attacker.x,
				y: attacker.y+130,
				z: attacker.z,
				scale: 1,
				opacity: 0
			},{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1
			}, 'decel', 'explode');
		}
	},
	stealthrock: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('rock1',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			},{
				x: defender.leftof(-40),
				y: defender.y-10,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock2',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 75
			},{
				x: defender.leftof(-20),
				y: defender.y-40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock1',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 150
			},{
				x: defender.leftof(30),
				y: defender.y-20,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('rock2',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 225
			},{
				x: defender.leftof(10),
				y: defender.y-30,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
		}
	},
	spikes: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('caltrop',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			},{
				x: defender.x-25,
				y: defender.y-40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('caltrop',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125
			},{
				x: defender.x+50,
				y: defender.y-40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('caltrop',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250
			},{
				x: defender.x+30,
				y: defender.y-45,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
		}
	},
	toxicspikes: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisoncaltrop',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			},{
				x: defender.x+5,
				y: defender.y-40,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
			battle.showEffect('poisoncaltrop',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 200
			},{
				x: defender.x-15,
				y: defender.y-35,
				z: defender.z,
				scale: .3,
				opacity: 1
			}, 'ballistic');
		}
	},
	leechseed: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5
			},{
				x: defender.x-30,
				y: defender.y-40,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125
			},{
				x: defender.x+40,
				y: defender.y-35,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250
			},{
				x: defender.x+20,
				y: defender.y-25,
				z: defender.z,
				scale: .2,
				opacity: .6
			}, 'ballistic');
		}
	},
	psyshock: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('poisonwisp',{
				x: defender.x+40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: .6
			},{
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('poisonwisp',{
				x: defender.x-40,
				y: defender.y-20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 150
			},{
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('waterwisp',{
				x: defender.x+10,
				y: defender.y+20,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 300
			},{
				scale: 3,
				opacity: 0
			}, 'decel');
		}
	},
	grassknot: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('energyball',{
				x: defender.x+30,
				y: defender.y+10,
				z: defender.z,
				scale: 0,
				opacity: .6
			},{
				scale: 3,
				opacity: 0
			}, 'decel');
			battle.showEffect('energyball',{
				x: defender.x-30,
				y: defender.y-10,
				z: defender.z,
				scale: 0,
				opacity: .6,
				time: 150
			},{
				scale: 3,
				opacity: 0
			}, 'decel');
		}
	},
	airslash: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x+60,
				y: defender.y+30,
				z: defender.z,
				scale: .2,
				opacity: 1
			},{
				x: defender.x-70,
				y: defender.y-40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+60,
				y: defender.y+30,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			},{
				x: defender.x-70,
				y: defender.y-40,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+80,
				y: defender.y+10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			},{
				x: defender.x-50,
				y: defender.y-60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+80,
				y: defender.y+10,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 200
			},{
				x: defender.x-50,
				y: defender.y-60,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 400
			}, 'linear', 'fade');
		}
	},
	aircutter: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('wisp',{
				x: defender.x+60,
				y: defender.y-10,
				z: defender.z,
				scale: .2,
				opacity: 1
			},{
				x: defender.x-60,
				y: defender.y-10,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 200
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+60,
				y: defender.y+20,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 100
			},{
				x: defender.x-60,
				y: defender.y+20,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 300
			}, 'linear', 'fade');
			battle.showEffect('wisp',{
				x: defender.x+60,
				y: defender.y+50,
				z: defender.z,
				scale: .2,
				opacity: 1,
				time: 200
			},{
				x: defender.x-60,
				y: defender.y+50,
				z: defender.z,
				scale: .4,
				opacity: .4,
				time: 400
			}, 'linear', 'fade');
		}
	},
	dracometeor: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('shadowball',{
				x: defender.x+40-40,
				y: defender.y+80,
				z: defender.z,
				scale: 1,
				opacity: 0
			},{
				x: defender.x+40,
				y: defender.y,
				scale: 1,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('shadowball',{
				x: defender.x-40-40,
				y: defender.y+20+80,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 150
			},{
				x: defender.x-40,
				y: defender.y+20,
				scale: 1,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('shadowball',{
				x: defender.x+10-40,
				y: defender.y-20+80,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 300
			},{
				x: defender.x-40,
				y: defender.y+20,
				scale: 1,
				opacity: 0.5
			}, 'decel', 'explode');
		}
	},
	scald: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			},{
				x: defender.x+10,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			},{
				x: defender.x-10,
				y: defender.y-5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			},{
				x: defender.x,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	surf: { // TODO: make this not just a copy of Hydro Pump
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			},{
				x: defender.x+10,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			},{
				x: defender.x-10,
				y: defender.y-5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			},{
				x: defender.x,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	hydropump: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3
			},{
				x: defender.x+10,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75
			},{
				x: defender.x-10,
				y: defender.y-5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150
			},{
				x: defender.x,
				y: defender.y+5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6
			}, 'decel', 'explode');
		}
	},
	waterspout: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6
			},{
				x: defender.x+30,
				y: defender.y+20,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 75
			},{
				x: defender.x+20,
				y: defender.y-20,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150
			},{
				x: defender.x-30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
			battle.showEffect('waterwisp',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 225
			},{
				x: defender.x-10,
				y: defender.y+5,
				z: defender.z,
				scale: 1,
				opacity: 0.3
			}, 'ballistic', 'explode');
		}
	},
	eruption: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1
			},{
				x: defender.x+30,
				y: defender.y+20,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 75
			},{
				x: defender.x+20,
				y: defender.y-20,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 150
			},{
				x: defender.x-30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
				time: 225
			},{
				x: defender.x-10,
				y: defender.y+5,
				z: defender.z,
				scale: 1,
				opacity: 0.7
			}, 'ballistic', 'explode');
		}
	},
	solarbeam: { // todo: better solarbeam anim
		name: 'SolarBeam',
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#9AB440', 700, 0.4);
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6
			},{
				x: defender.x+30,
				y: defender.y+30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 200
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 75
			},{
				x: defender.x+20,
				y: defender.y-30,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 275
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 150
			},{
				x: defender.x-30,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 350
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 225
			},{
				x: defender.x-10,
				y: defender.y+10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 425
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 300
			},{
				x: defender.x+10,
				y: defender.y-10,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 500
			}, 'linear', 'explode');
			battle.showEffect('energyball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: .4,
				opacity: 0.6,
				time: 375
			},{
				x: defender.x-20,
				y: defender.y,
				z: defender.z,
				scale: .6,
				opacity: 0.3,
				time: 575
			}, 'linear', 'explode');
		},
		prepareAnim: BattleOtherAnims.lightstatus.anim,
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' absorbed light!';
		}
	},
	blizzard: { // todo: better blizzard anim
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.backgroundEffect('#009AA4', 700, 0.5);
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6
			},{
				x: defender.x+60,
				y: defender.y+40,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75
			},{
				x: defender.x+40,
				y: defender.y-40,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150
			},{
				x: defender.x-60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
			battle.showEffect('icicle',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225
			},{
				x: defender.x-20,
				y: defender.y+10,
				z: defender.z,
				scale: 2,
				opacity: 0.3
			}, 'accel', 'explode');
		}
	},
	freezeshock: {
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' became cloaked in a freezing light!';
		}
	},
	iceburn: {
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' became cloaked in freezing air!';
		}
	},
	razorwind: {
		prepareAnim: BattleOtherAnims.selfstatus.anim,
		prepareMessage: function(pokemon) {
			return pokemon.getName()+' whipped up a whirlwind!';
		}
	},
	overheat: {
		anim: function(battle, args) {
			var attacker = args[0];
			var defender = args[1];

			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8
			},{
				x: defender.x+60,
				y: defender.y+40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75
			},{
				x: defender.x+40,
				y: defender.y-40,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150
			},{
				x: defender.x-60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
			battle.showEffect('fireball',{
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225
			},{
				x: defender.x-20,
				y: defender.y+10,
				z: defender.z,
				scale: 2,
				opacity: 0.5
			}, 'decel', 'explode');
		}
	}
}

// placeholder animations
BattleMoveAnims['vcreate'] = {anim:BattleMoveAnims['flareblitz'].anim};
BattleMoveAnims['magmastorm'] = {anim:BattleMoveAnims['eruption'].anim};
BattleMoveAnims['inferno'] = {anim:BattleMoveAnims['eruption'].anim};
BattleMoveAnims['heatwave'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['lavaplume'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['searingshot'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['sacredfire'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['fierydance'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['blueflare'] = {anim:BattleMoveAnims['overheat'].anim};
BattleMoveAnims['fusionflare'] = {anim:BattleMoveAnims['overheat'].anim};

BattleMoveAnims['ember'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['incinerate'] = {anim:BattleMoveAnims['flamethrower'].anim};
BattleMoveAnims['flamewheel'] = {anim:BattleMoveAnims['flareblitz'].anim};
BattleMoveAnims['flamecharge'] = {anim:BattleMoveAnims['flareblitz'].anim};

BattleMoveAnims['leafstorm'] = {anim:BattleMoveAnims['solarbeam'].anim};
BattleMoveAnims['petaldance'] = {anim:BattleMoveAnims['solarbeam'].anim};

BattleMoveAnims['magicalleaf'] = {anim:BattleMoveAnims['energyball'].anim};
BattleMoveAnims['sleeppowder'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['poisonpowder'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['stunspore'] = {anim:BattleMoveAnims['spore'].anim};
BattleMoveAnims['powder'] = {anim:BattleMoveAnims['spore'].anim};

BattleMoveAnims['waterpulse'] = {anim:BattleMoveAnims['scald'].anim};
BattleMoveAnims['bubblebeam'] = {anim:BattleMoveAnims['scald'].anim};
BattleMoveAnims['brine'] = {anim:BattleMoveAnims['scald'].anim};

BattleMoveAnims['bubble'] = {anim:BattleMoveAnims['waterspout'].anim};
BattleMoveAnims['watersport'] = {anim:BattleMoveAnims['waterspout'].anim};

BattleMoveAnims['waterfall'] = {anim:BattleMoveAnims['aquajet'].anim};
BattleMoveAnims['aquatail'] = {anim:BattleMoveAnims['aquajet'].anim};
BattleMoveAnims['crabhammer'] = {anim:BattleMoveAnims['aquajet'].anim};
BattleMoveAnims['magikarpsrevenge'] = {anim:BattleMoveAnims['aquajet'].anim};

BattleMoveAnims['shockwave'] = {anim:BattleMoveAnims['voltswitch'].anim};
BattleMoveAnims['discharge'] = {anim:BattleMoveAnims['voltswitch'].anim};
BattleMoveAnims['volttackle'] = {anim:BattleMoveAnims['wildcharge'].anim};
BattleMoveAnims['boltstrike'] = {anim:BattleMoveAnims['wildcharge'].anim};
BattleMoveAnims['fusionbolt'] = {anim:BattleMoveAnims['chargebeam'].anim};
BattleMoveAnims['zapcannon'] = {anim:BattleMoveAnims['chargebeam'].anim};

BattleMoveAnims['icywind'] = {anim:BattleMoveAnims['icebeam'].anim};
BattleMoveAnims['sheercold'] = {anim:BattleMoveAnims['blizzard'].anim};

BattleMoveAnims['pinmissile'] = {anim:BattleMoveAnims['bulletseed'].anim, multihit: true};
BattleMoveAnims['attackorder'] = {anim:BattleMoveAnims['bulletseed'].anim};

BattleMoveAnims['hex'] = {anim:BattleMoveAnims['shadowball'].anim};
BattleMoveAnims['darkpulse'] = {anim:BattleMoveAnims['shadowball'].anim};
BattleMoveAnims['roaroftime'] = {anim:BattleMoveAnims['dracometeor'].anim};
BattleMoveAnims['spacialrend'] = {anim:BattleMoveAnims['dracometeor'].anim};

BattleMoveAnims['jumpkick'] = {anim:BattleMoveAnims['highjumpkick'].anim};
BattleMoveAnims['lowkick'] = {anim:BattleMoveAnims['highjumpkick'].anim};
BattleMoveAnims['megakick'] = {anim:BattleMoveAnims['highjumpkick'].anim};
BattleMoveAnims['blazekick'] = {anim:BattleMoveAnims['highjumpkick'].anim};
BattleMoveAnims['meteormash'] = {anim:BattleMoveAnims['hammerarm'].anim};
BattleMoveAnims['skyuppercut'] = {anim:BattleMoveAnims['hammerarm'].anim};
BattleMoveAnims['headsmash'] = {anim:BattleMoveAnims['gigaimpact'].anim};
BattleMoveAnims['crosspoison'] = {anim:BattleMoveAnims['xscissor'].anim};

BattleMoveAnims['aurasphere'] = {anim:BattleMoveAnims['focusblast'].anim};

BattleMoveAnims['paleowave'] = {anim:BattleMoveAnims['powergem'].anim};
BattleMoveAnims['ancientpower'] = {anim:BattleMoveAnims['powergem'].anim};
BattleMoveAnims['rocktomb'] = {anim:BattleMoveAnims['rockslide'].anim};

BattleMoveAnims['shadowstrike'] = {anim:BattleMoveAnims['shadowclaw'].anim};

BattleMoveAnims['blastburn'] = {anim:BattleMoveAnims['overheat'].anim};
BattleMoveAnims['frenzyplant'] = {anim:BattleMoveAnims['solarbeam'].anim};
BattleMoveAnims['hydrocannon'] = {anim:BattleMoveAnims['hydropump'].anim};

BattleMoveAnims['heartswap'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['lunardance'] = {anim:BattleMoveAnims['healingwish'].anim};

BattleMoveAnims['counter'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['payback'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['revenge'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['rockclimb'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['retaliate'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['superpower'] = {anim:BattleMoveAnims['closecombat'].anim};
BattleMoveAnims['playrough'] = {anim:BattleMoveAnims['closecombat'].anim};
BattleMoveAnims['scratch'] = {anim:BattleMoveAnims['nightslash'].anim};
BattleMoveAnims['slash'] = {anim:BattleMoveAnims['nightslash'].anim};
BattleMoveAnims['boneclub'] = {anim:BattleMoveAnims['nightslash'].anim};
BattleMoveAnims['bonerush'] = {anim:BattleMoveAnims['nightslash'].anim, multihit:true};
BattleMoveAnims['tackle'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['beatup'] = {anim:BattleMoveAnims['bodyslam'].anim};
BattleMoveAnims['dragonbreath'] = {anim:BattleMoveAnims['dragonpulse'].anim};
BattleMoveAnims['acidspray'] = {anim:BattleMoveAnims['dragonpulse'].anim};

BattleMoveAnims['gust'] = {anim:BattleMoveAnims['whirlwind'].anim};
BattleMoveAnims['twister'] = {anim:BattleMoveAnims['whirlwind'].anim};
BattleMoveAnims['psychocut'] = {anim:BattleMoveAnims['airslash'].anim};

BattleMoveAnims['hypervoice'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['chatter'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['round'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['yawn'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['sing'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['perishsong'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['echoedvoice'] = {anim:BattleMoveAnims['roar'].anim};
BattleMoveAnims['relicsong'] = {anim:BattleMoveAnims['roar'].anim};

BattleMoveAnims['destinybond'] = {anim:BattleMoveAnims['painsplit'].anim};
BattleMoveAnims['reflecttype'] = {anim:BattleMoveAnims['painsplit'].anim};

BattleMoveAnims['selfdestruct'] = {anim:BattleMoveAnims['explosion'].anim};

BattleMoveAnims['acid'] = {anim:BattleMoveAnims['sludgebomb'].anim};
BattleMoveAnims['sludgewave'] = {anim:BattleMoveAnims['sludgebomb'].anim};

BattleMoveAnims['magnitude'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['fissure'] = {anim:BattleMoveAnims['earthquake'].anim};
BattleMoveAnims['bulldoze'] = {anim:BattleMoveAnims['earthpower'].anim};
BattleMoveAnims['drillrun'] = {anim:BattleMoveAnims['earthpower'].anim};

BattleMoveAnims['camouflage'] = {anim:BattleMoveAnims['tailglow'].anim};
BattleMoveAnims['foulplay'] = {anim:BattleMoveAnims['psyshock'].anim};
BattleMoveAnims['darkvoid'] = {anim:BattleMoveAnims['psyshock'].anim};

BattleMoveAnims['captivate'] = {anim:BattleMoveAnims['attract'].anim};
BattleMoveAnims['charm'] = {anim:BattleMoveAnims['attract'].anim};

BattleMoveAnims['armthrust'] = {anim:BattleMoveAnims['cometpunch'].anim, multhit:true};

BattleMoveAnims['iciclecrash'] = {anim:BattleMoveAnims['avalanche'].anim};

BattleMoveAnims['phantomforce'] = {anim:BattleMoveAnims['shadowforce'].anim,prepareAnim:BattleMoveAnims['shadowforce'].prepareAnim,prepareMessage:BattleMoveAnims['shadowforce'].prepareMessage};

BattleMoveAnims['smackdown'] = {anim:BattleMoveAnims['rockblast'].anim};
