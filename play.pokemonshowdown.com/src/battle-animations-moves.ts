/**
 * Pokemon Showdown Move Animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license CC0-1.0
 */

import { type AnimTable, BattleOtherAnims } from './battle-animations';
import { Config } from './client-main';

export const BattleMoveAnims: AnimTable = {
	taunt: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.dance.anim(scene, [attacker, defender]);
			scene.showEffect('pointer', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x + 60,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 900,
			}, 'linear');

			scene.showEffect('angry', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 1,
				opacity: 1,
				time: 600,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 1,
				opacity: 1,
				time: 700,
			}, 'ballistic2Under', 'fade');
		},
	},
	instruct: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.dance.anim(scene, [attacker, defender]);
			scene.showEffect('pointer', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x + 60,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 60,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 1000,
			}, 'ballistic', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x + 60,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.3,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 1000,
			}, 'ballistic', 'explode');
		},
	},
	quash: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 15,
				yscale: 0.5,
				time: 300,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'decel');

			scene.showEffect('rightchop', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.1,
				time: 400,
			}, {
				y: defender.y,
				scale: 0.25,
				opacity: 1,
				time: 700,
			}, 'decel', 'explode');
		},
	},
	swagger: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.shake.anim(scene, [attacker]);

			scene.showEffect('angry', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 1,
				opacity: 1,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('angry', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2Under', 'fade');
		},
	},
	swordsdance: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.shake.anim(scene, [defender]);
			scene.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: 0.4,
				time: 200,
			}, 'ballistic2', 'fade');
			scene.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: 0.4,
				time: 200,
			}, 'ballistic2back', 'fade');
			scene.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: 0.4,
				time: 400,
			}, 'ballistic2', 'fade');
			scene.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: 0.4,
				time: 400,
			}, 'ballistic2back', 'fade');
			scene.showEffect('sword', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 50,
				scale: 1,
				opacity: 0.4,
				time: 600,
			}, 'ballistic2', 'fade');
			scene.showEffect('sword', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				scale: 1,
				opacity: 0.4,
				time: 600,
			}, 'ballistic2Back', 'fade');
		},
	},
	quiverdance: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#987058', 800, 0.3, 400);
			BattleOtherAnims.shake.anim(scene, [attacker]);
			scene.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	victorydance: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#987058', 800, 0.3, 400);
			BattleOtherAnims.shake.anim(scene, [attacker]);
			scene.showEffect('flareball', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('flareball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	dragondance: {
		anim(scene, [attacker]) {
			BattleOtherAnims.shake.anim(scene, [attacker]);
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 50,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 60,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x + 10,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');
		},
	},
	agility: {
		anim(scene, [attacker]) {
			attacker.anim({ x: attacker.x - 10, time: 200 });
			attacker.anim({ x: attacker.x + 10, time: 300 });
			attacker.anim({ x: attacker.x - 20, time: 150 });
			attacker.anim({ x: attacker.x + 20, time: 150 });
			attacker.anim({ x: attacker.x, opacity: 0, time: 1 });
			attacker.delay(550);
			attacker.anim({ x: attacker.x, time: 150 });

			scene.showEffect(attacker.sp, {
				x: attacker.x + 20,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.5,
				time: 800,
			}, {
				x: attacker.x - 30,
				opacity: 0,
				time: 1300,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.5,
				time: 800,
			}, {
				x: attacker.x + 30,
				opacity: 0,
				time: 1200,
			}, 'decel');
		},
	},
	doubleteam: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.shake.anim(scene, [attacker, defender]);
			scene.showEffect(attacker.sp, {
				x: defender.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: defender.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				time: 500,
			}, 'decel');
		},
	},
	metronome: {
		anim(scene, [attacker]) {
			scene.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 200,
			}, 'decel', 'fade');
			scene.showEffect('pointer', {
				x: attacker.x + 40,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 200,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 400,
			}, 'decel');
		},
	},
	teeterdance: {
		anim: BattleOtherAnims.shake.anim,
	},
	splash: {
		anim(scene, [attacker]) {
			scene.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 150,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 60,
				z: attacker.z,
				opacity: 0.3,
			}, 'ballistic', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x - 20,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 300,
			}, {
				x: attacker.x - 40,
				y: attacker.y + 60,
				z: attacker.z,
				opacity: 0.3,
			}, 'ballistic', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 450,
			}, {
				x: attacker.x + 60,
				y: attacker.y + 40,
				z: attacker.z,
				opacity: 0.3,
			}, 'ballistic', 'fade');

			attacker.anim({
				y: attacker.y + 15,
				time: 150,
			}, 'decel');
			attacker.anim({
				time: 150,
			}, 'accel');
			attacker.anim({
				y: attacker.y + 15,
				time: 150,
			}, 'decel');
			attacker.anim({
				time: 150,
			}, 'accel');
			attacker.anim({
				y: attacker.y + 15,
				time: 150,
			}, 'decel');
			attacker.anim({
				time: 150,
			}, 'accel');
		},
	},
	encore: {
		anim(scene, [attacker, defender]) {
			attacker.anim({ x: attacker.x - 10, time: 100 });
			attacker.anim({ x: attacker.x + 10, time: 200 });
			attacker.anim({ x: attacker.x, time: 100 });
		},
	},
	attract: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.shake.anim(scene, [attacker]);
			scene.showEffect('heart', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 1,
				opacity: 1,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('heart', {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 100,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('heart', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2Under', 'fade');
		},
	},
	raindance: {
		anim: BattleOtherAnims.dance.anim,
	},
	sunnyday: {
		anim: BattleOtherAnims.dance.anim,
	},
	hail: {
		anim: BattleOtherAnims.dance.anim,
	},
	snowscape: {
		anim: BattleOtherAnims.dance.anim,
	},
	chillyreception: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 750, 1, 50);
			if (attacker.sp.url) {
				const url = attacker.sp.url;
				const sprite = {
					url: url.replace('-back', ''),
					w: attacker.sp.w,
					h: attacker.sp.h,
				};
				scene.showEffect(sprite, {
					x: scene.battle.mySide.x + 65,
					y: scene.battle.mySide.y + 65,
					z: scene.battle.mySide.z,
					scale: 1.5,
					opacity: 1,
					time: 50,
				}, {
					opacity: 0,
					time: 800,
				}, 'decel');
				sprite.url = url;
				scene.showEffect(sprite, {
					x: scene.battle.mySide.x + 65,
					y: scene.battle.mySide.y + 65,
					z: scene.battle.mySide.z,
					scale: 1.5,
					opacity: 0,
					time: 800,
				}, {
					opacity: 1,
					time: 1550,
				}, 'decel');
			}
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-hail.png')`, 750, 1, 800);
		},
	},
	sandstorm: {
		anim: BattleOtherAnims.dance.anim,
	},
	gravity: {
		anim() {
			// do not give Gravity an animation,
			// it'll conflict with the gravity animation in BattleOtherAnims
			// this one prevents the wisp from showing up
		},
	},
	trickroom: {
		anim: BattleOtherAnims.dance.anim,
	},
	magicroom: {
		anim: BattleOtherAnims.dance.anim,
	},
	wonderroom: {
		anim: BattleOtherAnims.dance.anim,
	},
	afteryou: {
		anim: BattleOtherAnims.dance.anim,
	},
	allyswitch: {
		anim() {
			// do not give Ally Switch an animation,
			// it'll conflict with the animation of the switch itself
		},
	},
	babydolleyes: {
		anim: BattleOtherAnims.dance.anim,
	},
	faketears: {
		anim: BattleOtherAnims.dance.anim,
	},
	tearfullook: {
		anim: BattleOtherAnims.dance.anim,
	},
	featherdance: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.dance.anim(scene, [attacker, defender]);
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 1,
				time: 0,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.4,
				time: 600,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.4,
				time: 700,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.4,
				time: 800,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x - 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.4,
				time: 900,
			}, 'ballistic2Under', 'fade');

			scene.showEffect('feather', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 5,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.4,
				time: 700,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 10,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.4,
				time: 800,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x + 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.4,
				time: 900,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.4,
				time: 1000,
			}, 'ballistic2Under', 'fade');
		},
	},
	followme: {
		anim(scene, [attacker]) {
			BattleOtherAnims.dance.anim(scene, [attacker]);
			scene.showEffect('pointer', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y + 60,
				opacity: 1,
				time: 550,
			}, 'decel', 'fade');
		},
	},
	foresight: {
		anim: BattleOtherAnims.dance.anim,
	},
	mimic: {
		anim(scene, [attacker, defender]) {
			scene.showEffect(defender.sp, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.5,
			}, {
				scale: 0.2,
				opacity: 0,
				time: 300,
			}, 'accel');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 0.5,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
				time: 600,
			}, 'accel', 'fade');
		},
	},
	sketch: {
		anim: BattleOtherAnims.dance.anim,
	},
	doodle: {
		anim: BattleOtherAnims.dance.anim,
	},
	odorsleuth: {
		anim: BattleOtherAnims.dance.anim,
	},
	celebrate: {
		anim: BattleOtherAnims.dance.anim,
	},
	playnice: {
		anim: BattleOtherAnims.dance.anim,
	},
	tailwhip: {
		anim: BattleOtherAnims.dance.anim,
	},
	leer: {
		anim: BattleOtherAnims.dance.anim,
	},
	kinesis: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#AA44BB', 450, 0.6, 450);
			scene.backgroundEffect('#AA44FF', 250, 0.6, 800);
			BattleOtherAnims.dance.anim(scene, [attacker]);
		},
	},
	electricterrain: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#FFFF00', 1000, 0.3);
			BattleOtherAnims.dance.anim(scene, [attacker]);
		},
	},
	grassyterrain: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#9AB440', 1000, 0.3);
			BattleOtherAnims.dance.anim(scene, [attacker]);
		},
	},
	mistyterrain: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#FF99FF', 1000, 0.3);
			BattleOtherAnims.dance.anim(scene, [attacker]);
		},
	},
	lifedew: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.behind(0),
					opacity: 0.6,
					time: 400,
				}, 'decel', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
					time: 100,
				}, {
					x: defender.x + 20,
					y: defender.y - 10,
					z: defender.behind(0),
					opacity: 0.6,
					time: 500,
				}, 'decel', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
					time: 200,
				}, {
					x: defender.x - 20,
					y: defender.y + 10,
					z: defender.behind(0),
					opacity: 0.6,
					time: 600,
				}, 'decel', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y - 5,
					z: defender.behind(0),
					opacity: 0.6,
					time: 700,
				}, 'decel', 'explode');
			}
		},
	},
	junglehealing: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#9AB440', 1000, 0.3);
			for (const defender of defenders) {
				BattleOtherAnims.dance.anim(scene, [defender]);
				scene.showEffect('leaf1', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y - 60,
					scale: 1.5,
					opacity: 0,
					time: 1100,
				}, 'linear', 'fade');
				scene.showEffect('leaf2', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 500,
				}, {
					x: defender.x + 60,
					y: defender.y,
					scale: 1.5,
					opacity: 0,
					time: 1100,
				}, 'linear', 'fade');
				scene.showEffect('leaf2', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y + 60,
					scale: 1.5,
					opacity: 0,
					time: 1100,
				}, 'linear', 'fade');
				scene.showEffect('leaf1', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 500,
				}, {
					x: defender.x - 60,
					y: defender.y,
					scale: 1.5,
					opacity: 0,
					time: 1100,
				}, 'linear', 'fade');
			}
		},
	},
	topsyturvy: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	embargo: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	healblock: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	flash: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#ffffff', 600, 0.6);
			scene.showEffect('wisp', {
				x: attacker.leftof(-10),
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.8,
			}, {
				scale: 15,
				opacity: 0.8,
				time: 500,
			}, 'linear', 'fade');
		},
	},
	tailwind: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1,
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(40),
				scale: 0.3,
				opacity: 1,
				time: 400,
			}, {
				z: attacker.behind(-40),
				scale: 2,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');
		},
	},
	aerialace: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 260,
			}, {
				scale: 2,
				opacity: 0,
				time: 560,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 260,
			}, {
				scale: 2,
				opacity: 0,
				time: 560,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 310,
			}, {
				scale: 2,
				opacity: 0,
				time: 610,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x - 60,
				y: defender.y + 60,
				z: defender.behind(-40),
				time: 250,
			}, 'ballistic', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-40),
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x - 60,
				y: defender.y + 60,
				z: defender.behind(-40),
				opacity: 0.5,
				time: 250,
			}, {
				x: defender.leftof(-5),
				y: defender.y - 5,
				z: defender.behind(20),
				time: 350,
			}, 'ballistic', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-40),
				opacity: 0.5,
				time: 300,
			}, {
				x: defender.leftof(-5),
				y: defender.y - 5,
				z: defender.behind(20),
				time: 400,
			}, 'ballistic2', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-80),
				time: 200,
				opacity: 0.5,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(-5),
				y: defender.y - 5,
				z: defender.behind(20),
				time: 100,
				opacity: 0.5,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(260);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	bravebird: {
		anim: BattleOtherAnims.flight.anim,
	},
	acrobatics: {
		anim: BattleOtherAnims.flight.anim,
	},
	flyingpress: {
		anim: BattleOtherAnims.flight.anim,
	},
	steelwing: {
		anim: BattleOtherAnims.flight.anim,
	},
	wingattack: {
		anim: BattleOtherAnims.flight.anim,
	},
	dualwingbeat: {
		anim: BattleOtherAnims.flight.anim,
	},
	dragonbreath: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.2,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.2,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				scale: 1,
				opacity: 0.2,
			}, 'decel');
		},
	},
	orderup: {
		anim(scene, [attacker, defender]) {
			const tatsugiriSprite = {
				url: `https://${Config.routes.client}/sprites/gen5/tatsugiri${['-droopy', '-stretchy', ''][Math.floor(Math.random() * 3)]}.png`,
				w: 96,
				h: 96,
			};

			scene.showEffect(tatsugiriSprite, {
				x: defender.x,
				y: defender.y + 250,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 0,
			}, {
				y: defender.y,
				scale: 1,
				time: 300,
			}, 'linear');
			scene.showEffect(tatsugiriSprite, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				time: 600,
			}, 'linear');
		},
	},
	dragonpulse: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 5; i++) {
				scene.showEffect('wisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1,
					opacity: 1,
					time: 20 * i,
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
				scene.showEffect('poisonwisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.5,
					opacity: 0.3,
					time: 20 * i,
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-15),
				scale: 0.5,
				opacity: 0.6,
			}, {
				scale: 0.6,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade');

			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.1,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 500,
			}, 'linear', 'explode');
		},
	},
	focusblast: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#B84038', 700, 0.6);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
			}, {
				scale: 0.6,
				opacity: 1,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100,
			}, {
				scale: 0.8,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	aurasphere: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#124763', 700, 0.6);
			scene.backgroundEffect('#FFC001', 300, 0.3, 600);
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.behind(-20),
				scale: 0.5,
				xscale: 3,
				opacity: 0,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.8,
				xscale: 0.8,
				opacity: 0.8,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 60,
				y: attacker.y - 80,
				z: attacker.behind(-20),
				scale: 0.5,
				yscale: 3,
				opacity: 0,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1.5,
				yscale: 1.5,
				opacity: 0.8,
				time: 450,
			}, 'decel', 'fade');

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 0.8,
				opacity: 0.5,
				time: 650,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 1.5,
				opacity: 0.8,
				time: 650,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.8,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 1,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 1,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 825,
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(10),
				time: 175,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	technoblast: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
			}, {
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100,
			}, {
				z: attacker.behind(-30),
				scale: 0.8,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(5),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	painsplit: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 200,
			}, {
				scale: 3,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 200,
			}, {
				scale: 3,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	flail: {
		anim: BattleOtherAnims.xattack.anim,
	},
	uturn: {
		anim: BattleOtherAnims.spinattack.anim,
	},
	flipturn: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			BattleOtherAnims.spinattack.anim(scene, [attacker, defender]);
		},
	},
	rapidspin: {
		anim: BattleOtherAnims.spinattack.anim,
	},
	gyroball: {
		anim: BattleOtherAnims.spinattack.anim,
	},
	mortalspin: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.5,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				opacity: 0.8,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				scale: 2,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				opacity: 1,
				time: 500,
			}, 'decel', 'explode');
			BattleOtherAnims.spinattack.anim(scene, [attacker, defender]);
		},
	},
	icespinner: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.5,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				opacity: 0.8,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y + 60,
				z: defender.behind(-30),
				scale: 2,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				opacity: 1,
				time: 500,
			}, 'decel', 'explode');
			BattleOtherAnims.spinattack.anim(scene, [attacker, defender]);
		},
	},
	voltswitch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-130),
				opacity: 0.8,
				time: 275,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(10),
				opacity: 0.7,
				scale: 0,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 0,
				time: 700,
			}, {
				scale: 4,
				opacity: 0,
				time: 1000,
			}, 'linear');

			attacker.anim({
				z: attacker.behind(15),
				time: 200,
			}, 'decel');
			attacker.anim({
				z: defender.behind(-170),
				time: 100,
			}, 'accel');
			attacker.anim({
				z: attacker.z,
				time: 300,
			}, 'swing');
			defender.delay(500);
			defender.anim({
				x: defender.leftof(5),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	thunderwave: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.2,
				time: 500,
			}, {
				scale: 4,
				opacity: 0.1,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	shockwave: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y - 70,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.6,
				time: 0,
			}, {
				scale: 3,
				xscale: 10,
				opacity: 0.1,
				time: 600,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y - 70,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 3,
				xscale: 10,
				opacity: 0.1,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 250,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	discharge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 150,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 750,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 300,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 900,
			}, 'linear', 'fade');
		},
	},
	bugbuzz: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 0,
			}, {
				scale: 8,
				opacity: 0.07,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 100,
			}, {
				scale: 8,
				opacity: 0.07,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
				time: 200,
			}, {
				scale: 8,
				opacity: 0.07,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500,
			}, {
				scale: 2,
				opacity: 0.1,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	explosion: {
		anim(scene, [attacker]) {
			scene.showEffect('fireball', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: attacker.x + 10,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			attacker.delay(450).anim({
				scale: 4,
				time: 400,
				opacity: 0,
			}, 'linear');
		},
	},
	populationbomb: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('leftslash', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('rightslash', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('leftslash', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
		},
	},
	auroraveil: {
		anim() {},
	},
	reflect: {
		anim() {},
	},
	safeguard: {
		anim() {},
	},
	lightscreen: {
		anim() {},
	},
	mist: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			for (let i = 0; i < 4; i++) {
				scene.showEffect('waterwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('waterwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 0.7,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y,
					z: attacker.z + 97 * yf2[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1,
					opacity: 0.7,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 1.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1,
					opacity: 0.7,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y,
					z: attacker.z + 97 * yf2[i],
					scale: 1.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
			}
		},
	},
	transform: {
		anim() {},
	},
	bellydrum: {
		anim(scene, [attacker]) {
			scene.showEffect('leftchop', {
				x: attacker.x - 20,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 100,
			}, 'linear', 'fade');
			scene.showEffect('rightchop', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 150,
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 250,
			}, 'linear', 'fade');
			scene.showEffect('leftchop', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 350,
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 450,
			}, 'linear', 'fade');
			scene.showEffect('rightchop', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.6,
				opacity: 1,
				time: 500,
			}, {
				z: attacker.behind(5),
				scale: 0.4,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('impact', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 100,
			}, {
				scale: 1,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('impact', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 250,
			}, {
				scale: 1,
				opacity: 0,
				time: 550,
			}, 'linear');
			scene.showEffect('impact', {
				x: attacker.x - 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 400,
			}, {
				scale: 1,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('impact', {
				x: attacker.x + 20,
				y: attacker.y - 10,
				z: attacker.behind(5),
				scale: 0.75,
				opacity: 0.3,
				time: 550,
			}, {
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	aromatherapy: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	healbell: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	magiccoat: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	protect: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	detect: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	kingsshield: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	spikyshield: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	burningbulwark: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #000000)', 600, 0.2);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 0.5,
			}, {
				scale: 2,
				xscale: 3.5,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 15,
				z: attacker.z,
				opacity: 0.5,
				scale: 1.5,
			}, {
				scale: 1.8,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 15,
				z: attacker.z,
				opacity: 1,
				scale: 3,
			}, {
				scale: 1.8,
				opacity: 0.5,
				time: 500,
			}, 'decel', 'fade', { filter: 'hue-rotate(90deg)' });
		},
	},
	banefulbunker: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 600, 0.2);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 0.5,
			}, {
				scale: 2,
				xscale: 3.5,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 15,
				z: attacker.z,
				opacity: 0.5,
				scale: 1.5,
			}, {
				scale: 1.8,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 15,
				z: attacker.z,
				opacity: 1,
				scale: 3,
			}, {
				scale: 1.8,
				opacity: 0.5,
				time: 500,
			}, 'decel', 'fade');
		},
	},

	craftyshield: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	matblock: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	quickguard: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	wideguard: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	endure: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	bide: {
		anim: BattleOtherAnims.bidecharge.anim,
	},
	focusenergy: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	rockpolish: {
		anim(scene, [attacker]) {
			scene.showEffect('leftslash', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
			}, {
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('rightslash', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 100,
			}, {
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('leftslash', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 200,
			}, {
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('rightslash', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.3,
				time: 200,
			}, {
				opacity: 0,
				time: 500,
			}, 'decel');

			scene.showEffect('shine', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
			}, {
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100,
			}, {
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 200,
			}, {
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 300,
			}, {
				opacity: 0,
				time: 600,
			}, 'accel');

			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	harden: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	defensecurl: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	irondefense: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	rest: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1.5,
				opacity: 1,
				time: 600,
			}, 'ballistic2Under', 'fade');
		},
	},
	howl: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	acupressure: {
		anim(scene, [attacker]) {
			scene.showEffect('pointer', {
				x: attacker.x - 5,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
			}, {
				scale: 0.25,
				opacity: 1,
				time: 300,
			}, 'linear', 'explode');

			scene.showEffect('lightning', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 0.8,
				opacity: 0,
				time: 600,
			}, 'linear');
		},
	},
	curse: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	autotomize: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 100,
			}, {
				xscale: 6,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y - 50,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 60,
				opacity: 0,
				time: 500,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: attacker.x + 40,
				y: attacker.y + 60,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800,
			}, 'accel');

			attacker.anim({ x: attacker.x - 5, time: 75 });
			attacker.anim({ x: attacker.x + 5, time: 100 });
			attacker.anim({ x: attacker.x - 10, time: 50 });
			attacker.anim({ x: attacker.x + 10, time: 50 });
			attacker.anim({ x: attacker.x - 10, time: 50 });
			attacker.anim({ x: attacker.x + 10, time: 50 });
			attacker.anim({ x: attacker.x - 10, time: 50 });
			attacker.anim({ x: attacker.x + 10, time: 50 });
			attacker.anim({ x: attacker.x - 10, time: 50 });
			attacker.anim({ x: attacker.x + 10, time: 150 });
			attacker.anim({ x: attacker.x, time: 150 });
		},
	},
	shiftgear: {
		anim(scene, [attacker]) {
			scene.showEffect('gear', {
				x: attacker.x + 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 100,
			}, {
				x: attacker.x + 20,
				opacity: 1,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 100,
			}, {
				x: attacker.x - 20,
				opacity: 1,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: attacker.x + 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 250,
			}, {
				x: attacker.x + 20,
				opacity: 1,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 250,
			}, {
				x: attacker.x - 20,
				opacity: 1,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: attacker.x + 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 400,
			}, {
				x: attacker.x + 20,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
				time: 400,
			}, {
				x: attacker.x - 20,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('shine', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100,
			}, {
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100,
			}, {
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 200,
			}, {
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 300,
			}, {
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 800,
			}, 'accel');

			attacker.delay(100);
			attacker.anim({
				y: attacker.y + 2.5,
				yscale: 1.5,
				time: 100,
			}, 'linear');
			attacker.anim({
				time: 100,
			}, 'linear');
			attacker.anim({
				y: attacker.y + 2.5,
				yscale: 1.5,
				time: 100,
			}, 'linear');
			attacker.anim({
				time: 100,
			}, 'linear');
			attacker.anim({
				y: attacker.y + 2.5,
				yscale: 1.5,
				time: 100,
			}, 'linear');
			attacker.anim({
				time: 100,
			}, 'linear');
		},
	},
	bulkup: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 500,
			}, {
				x: attacker.leftof(-30),
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.3,
				time: 800,
			}, 'ballistic2Under', 'fade');

			attacker.anim({
				y: attacker.y + 4,
				scale: 1.15,
				time: 200,
			}, 'linear');
			attacker.delay(300);
			attacker.anim({
				time: 200,
			}, 'decel');
		},
	},
	shellsmash: {
		anim(scene, [attacker]) {
			scene.showEffect('shell', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 0.8,
				opacity: 0.8,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('impact', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.4,
				time: 400,
			}, {
				scale: 1.2,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('impact', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.4,
				time: 450,
			}, {
				scale: 1.2,
				opacity: 0,
				time: 650,
			}, 'linear');
			scene.showEffect('impact', {
				x: attacker.x + 10,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.4,
				time: 560,
			}, {
				scale: 1.2,
				opacity: 0,
				time: 700,
			}, 'linear');

			attacker.anim({
				scale: 0.4,
				opacity: 0,
				time: 400,
			}, 'linear');
			attacker.delay(75);
			attacker.anim({ x: attacker.x - 20, time: 75 });
			attacker.anim({ x: attacker.x + 20, time: 100 });
			attacker.anim({ x: attacker.x - 20, time: 100 });
			attacker.anim({ x: attacker.x + 20, time: 100 });
			attacker.anim({ x: attacker.x - 20, time: 100 });
			attacker.anim({ x: attacker.x + 20, time: 100 });
			attacker.anim({ x: attacker.x, time: 75 });
		},
	},
	stockpile: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	swallow: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	ingrain: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	aquaring: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 1.5,
				opacity: 0.5,
				time: 400,
			}, 'linear', 'fade');
		},
	},
	coil: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.6,
				time: 0,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.6,
				time: 50,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 550,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.6,
				time: 100,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 600,
			}, 'decel', 'fade');

			attacker.anim({
				y: attacker.y + 5,
				yscale: 1.1,
				time: 300,
			}, 'swing');
			attacker.delay(400);
			attacker.anim({
				time: 300,
			}, 'swing');
		},
	},
	conversion: {
		anim(scene, [attacker]) {
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.3,
			}, {
				scale: 1,
				opacity: 0,
				time: 600,
			}, 'decel');
		},
	},
	powertrick: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	ragepowder: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	refresh: {
		anim(scene, [attacker]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
			}, {
				scale: 1.5,
				opacity: 0,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'linear', 'fade');
		},
	},
	recycle: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	doomdesire: {
		anim(scene) {
			scene.backgroundEffect('#000000', 300, 0.2);
			scene.backgroundEffect('#000000', 300, 0.3, 200);
		},
	},
	teleport: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 1000, 0.3);
			attacker.anim({
				xscale: 0.3,
				time: 200,
			}, 'linear');
			attacker.anim({
				y: attacker.y + 200,
				xscale: 0.1,
				yscale: 2,
				opacity: 0.5,
				time: 300,
			}, 'accel');
			attacker.delay(500);
			attacker.anim({ opacity: 0, time: 0 });
			attacker.anim({ opacity: 1, time: 300 });
		},
	},
	cottonguard: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	defendorder: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	meditate: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	sharpen: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	withdraw: {
		anim(scene, [attacker]) {
			scene.showEffect('shell', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 0.8,
				opacity: 0.8,
				time: 400,
			}, 'linear', 'fade');

			attacker.anim({
				scale: 0.4,
				opacity: 0,
				time: 400,
			}, 'linear');
			attacker.delay(75);
			attacker.anim({ x: attacker.x, time: 75 });
		},
	},
	roost: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('feather', {
				x: defender.x + 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				x: defender.x + 5,
				y: defender.y - 20,
				scale: 0.1,
				opacity: 0.4,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y - 20,
				scale: 0.1,
				opacity: 0.4,
				time: 400,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x + 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				y: defender.y - 20,
				scale: 0.1,
				opacity: 0.4,
				time: 500,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('feather', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				y: defender.y - 20,
				scale: 0.1,
				opacity: 0.4,
				time: 600,
			}, 'ballistic2Under', 'fade');
		},
	},
	softboiled: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.75,
				yscale: 1,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0.5,
				yscale: 0.75,
				opacity: 0.5,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				yscale: 1.5,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0.6,
				yscale: 0.75,
				opacity: 0.8,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	milkdrink: {
		anim: BattleOtherAnims.consume.anim,
	},
	happyhour: {
		anim: BattleOtherAnims.selfstatus.anim,
	},
	snatch: {
		anim: BattleOtherAnims.dance.anim,
	},
	acidarmor: {
		anim(scene, [attacker]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 0,
				opacity: 1,
				time: 300,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 200,
			}, {
				scale: 0,
				opacity: 1,
				time: 500,
			}, 'linear');
		},
	},
	barrier: {
		anim: BattleOtherAnims.lightstatus.anim,
	},
	morningsun: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-sunnyday.jpg')`, 700, 0.5);
			scene.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 200,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600,
			}, 'accel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 300,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 700,
			}, 'accel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 400,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 500,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 900,
			}, 'accel', 'fade');
		},
	},
	moonlight: {
		anim(scene, [attacker]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 800, 0.6);
			scene.showEffect('moon', {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 200,
			}, {
				opacity: 0.8,
				time: 900,
			}, 'accel', 'fade');
			scene.showEffect('shine', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 200,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 300,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 700,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x + 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 400,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800,
			}, 'accel', 'fade');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.8,
				time: 500,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 900,
			}, 'accel', 'fade');

			scene.showEffect('wisp', {
				x: 0,
				y: +175,
				z: +50,
				scale: 1.5,
				opacity: 1,
			}, {
				time: 700,
			}, 'accel', 'fade');
			scene.showEffect('iceball', {
				x: 0,
				y: +175,
				z: +50,
				scale: 0.5,
				opacity: 0.8,
			}, {
				time: 700,
			}, 'accel', 'fade');
		},
	},
	lunarblessing: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 900, 0.6);
				scene.showEffect('moon', {
					x: attacker.x,
					y: attacker.y + 150,
					z: attacker.z,
					scale: 1,
					opacity: 0,
					time: 75,
				}, {
					opacity: 0.8,
					time: 1000,
				}, 'accel', 'fade');

				defender.delay(500);
				BattleOtherAnims.shake.anim(scene, [defender]);

				scene.showEffect('poisonwisp', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 100,
				}, {
					scale: 1.5,
					opacity: 0.3,
					time: 1100,
				}, 'decel', 'fade');

				scene.showEffect('poisonwisp', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0.4,
					opacity: 1,
					time: 100,
				}, {
					scale: 1.3,
					opacity: 0.3,
					time: 1000,
				}, 'decel', 'fade');

				scene.showEffect('iceball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.2,
					time: 0,
				}, {
					scale: 0.7,
					opacity: 0.5,
					time: 350,
				}, 'linear', 'explode');

				scene.showEffect('iceball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0,
					opacity: 0.6,
					time: 0,
				}, {
					scale: 1.1,
					opacity: 0,
					time: 600,
				}, 'decel', 'fade');

				scene.showEffect('mistball', {
					x: defender.x,
					y: defender.y,
					z: defender.z + 1,
					scale: 0,
					opacity: 0.7,
					time: 300,
				}, {
					scale: 1.5,
					opacity: 0,
					time: 1200,
				}, 'decel', 'fade');

				scene.showEffect('shine', {
					x: defender.x + 30,
					y: defender.y - 50,
					z: defender.z + 2,
					scale: 0.3,
					opacity: 0.6,
					time: 400,
				}, {
					y: defender.y + 130,
					opacity: 0,
					time: 1000,
				}, 'accel', 'fade');

				scene.showEffect('shine', {
					x: defender.x - 30,
					y: defender.y - 60,
					z: defender.z + 2,
					scale: 0.25,
					opacity: 0.6,
					time: 600,
				}, {
					y: defender.y + 130,
					opacity: 0,
					time: 1200,
				}, 'accel', 'fade');

				scene.showEffect('shine', {
					x: defender.x,
					y: defender.y - 70,
					z: defender.z + 2,
					scale: 0.2,
					opacity: 0.6,
					time: 800,
				}, {
					y: defender.y + 130,
					opacity: 0,
					time: 1400,
				}, 'accel', 'fade');
			}
		},
	},
	cosmicpower: {
		anim(scene, [attacker]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 600, 0.6);
			scene.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	charge: {
		anim: BattleOtherAnims.lightstatus.anim,
	},
	luckychant: {
		anim: BattleOtherAnims.lightstatus.anim,
	},
	geomancy: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('mistball', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('electroball', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
	},
	magnetrise: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x + 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x - 40,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 130,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	substitute: {
		anim() {},
	},
	batonpass: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				opacity: 0.1,
				time: 200,
			}, 'accel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 200,
			}, {
				scale: 4,
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	calmmind: {
		anim(scene, [attacker]) {
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 200,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, 'linear');
		},
	},
	nastyplot: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 700, 0.3);

			scene.showEffect('wisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 0,
			}, {
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x - 20,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 50,
			}, {
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 100,
			}, {
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.25,
				time: 750,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 70,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y + 80,
				z: attacker.z,
				scale: 0.25,
				time: 750,
			}, 'decel', 'fade');
		},
	},
	minimize: {
		anim(scene, [attacker]) {
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 0,
			}, {
				y: attacker.y - 20,
				scale: 0.75,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 200,
			}, {
				y: attacker.y - 25,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'accel');

			attacker.anim({
				y: attacker.y - 30,
				scale: 0.25,
				time: 600,
			}, 'linear');
			attacker.anim({
				time: 300,
			}, 'accel');
		},
	},
	growth: {
		anim(scene, [attacker]) {
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 0,
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 200,
			}, {
				y: attacker.y + 20,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'accel');

			attacker.anim({
				scale: 1.25,
				time: 600,
			}, 'linear');
			attacker.anim({
				time: 300,
			}, 'accel');
		},
	},
	tailglow: {
		anim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 1,
				opacity: 0.5,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	takeheart: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1,
				time: 0,
			}, {
				scale: 0.5,
				opacity: 0,
				time: 450,
			}, 'decel');

			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 1,
				opacity: 0.5,
				time: 450,
			}, 'linear', 'explode');

			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.8,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 850,
			}, 'decel');
		},
	},
	trick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300,
			}, 'ballistic2', 'fade');
			scene.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('pokeball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300,
			}, {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600,
			}, 'ballistic2', 'fade');
			scene.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('pokeball', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900,
			}, 'ballistic2', 'explode');
			scene.showEffect('pokeball', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
			}, 'ballistic2Under', 'explode');
		},
	},
	switcheroo: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300,
			}, 'ballistic2', 'fade');
			scene.showEffect('pokeball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('pokeball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				time: 300,
			}, {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600,
			}, 'ballistic2', 'fade');
			scene.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				time: 300,
			}, {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('pokeball', {
				x: attacker.x - 50,
				y: attacker.y,
				z: attacker.z,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900,
			}, 'ballistic2', 'explode');
			scene.showEffect('pokeball', {
				x: defender.x - 50,
				y: defender.y,
				z: defender.z,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
			}, 'ballistic2Under', 'explode');
		},
	},
	skillswap: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, 'ballistic2Under');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'ballistic2Under');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'ballistic');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 800,
			}, 'ballistic');
		},
	},
	recover: {
		anim: BattleOtherAnims.chargestatus.anim,
	},
	shadowforce: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1000, 0.3);
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 100,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 60,
				y: defender.y + 80,
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 90,
				y: defender.y - 40,
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 1,
				time: 350,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
		prepareAnim(scene, [attacker]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			scene.wait(200);
		},
	},
	bounce: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350,
			}, {
				scale: 3,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			attacker.anim({
				y: attacker.y + 80,
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300,
			}, 'linear');
		},
	},
	dig: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350,
			}, {
				scale: 3,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.2,
				y: attacker.y - 80,
				time: 300,
			}, 'linear');
		},
	},
	dive: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350,
			}, {
				scale: 3,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'decel');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'decel');
			defender.delay(380);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.2,
				y: attacker.y - 80,
				time: 300,
			}, 'swing');
		},
	},
	fly: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300,
			}, 'linear');
		},
	},
	skydrop: {
		anim: BattleOtherAnims.contactattack.anim,
		prepareAnim(scene, [attacker, defender]) {
			attacker.anim({
				opacity: 0.2,
				y: attacker.y + 80,
				time: 300,
			}, 'linear');
			defender.anim({
				opacity: 0.2,
				y: defender.y + 80,
				time: 300,
			}, 'linear');
		},
	},
	skullbash: {
		anim: BattleOtherAnims.contactattack.anim,
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.8,
				time: 300,
			}, 'linear');
		},
	},
	skyattack: {
		anim: BattleOtherAnims.flight.anim,
		prepareAnim(scene, [attacker]) {
			attacker.anim({
				opacity: 0.8,
				time: 300,
			}, 'linear');
		},
	},
	hiddenpower: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			for (let i = 0; i < 4; i++) {
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800,
				}, 'accel', 'fade');
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800,
				}, 'accel', 'fade');
			}
		},
	},
	storedpower: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			for (let i = 0; i < 4; i++) {
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 1,
					opacity: 0.5,
					time: 800,
				}, 'accel');
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 1,
					opacity: 0.5,
					time: 800,
				}, 'accel');
			}
		},
	},
	haze: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('#000000', 1000, 0.3);
			for (let i = 0; i < 4; i++) {
				scene.showEffect('blackwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('blackwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y,
					z: attacker.z + 97 * yf2[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('blackwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
				scene.showEffect('blackwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.5,
					opacity: 1,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y,
					z: attacker.z + 97 * yf2[i],
					scale: 1,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade');
			}
		},
	},
	seedflare: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 0,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'fade');
			for (let i = 0; i < 4; i++) {
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800,
				}, 'accel');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800,
				}, 'accel');
			}
		},
	},
	powerwhip: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('leaf1', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y - 60,
				scale: 1.5,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x + 60,
				y: defender.y,
				scale: 1.5,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 60,
				scale: 1.5,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('leaf1', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 60,
				y: defender.y,
				scale: 1.5,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	woodhammer: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('leaf1', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	ivycudgel: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('leaf1', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('leaf2', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			defender.delay(420);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 0,
			}, 'swing');
			defender.anim({
				time: 480,
			}, 'swing');
		},
	},
	ivycudgelwater: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			defender.delay(420);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 0,
			}, 'swing');
			defender.anim({
				time: 480,
			}, 'swing');
		},
	},
	ivycudgelfire: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			defender.delay(420);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 0,
			}, 'swing');
			defender.anim({
				time: 480,
			}, 'swing');
		},
	},
	ivycudgelrock: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mudwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('mudwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('rock1', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('rock2', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			defender.delay(420);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 0,
			}, 'swing');
			defender.anim({
				time: 480,
			}, 'swing');
		},
	},
	crushclaw: {
		anim: BattleOtherAnims.clawattack.anim,
	},
	falseswipe: {
		anim: BattleOtherAnims.slashattack.anim,
	},
	direclaw: {
		anim: BattleOtherAnims.clawattack.anim,
	},
	dragonclaw: {
		anim: BattleOtherAnims.clawattack.anim,
	},
	metalclaw: {
		anim: BattleOtherAnims.clawattack.anim,
	},
	furycutter: {
		anim: BattleOtherAnims.slashattack.anim,
	},
	scratch: {
		anim: BattleOtherAnims.slashattack.anim,
	},
	cut: {
		anim: BattleOtherAnims.slashattack.anim,
	},
	slash: {
		anim: BattleOtherAnims.slashattack.anim,
	},
	nightslash: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('rightslash', {
				x: defender.x + 5,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x - 5,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	shadowclaw: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			BattleOtherAnims.clawattack.anim(scene, [attacker, defender]);
		},
	},
	multiattack: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1100, 0.3);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('rightslash', {
				x: defender.x + 5,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x - 5,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			attacker.delay(300);
			defender.delay(300);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	holdback: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	knockdown: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	seismictoss: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 500, 0.6, 300);
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(5),
				time: 50,
			}, 'ballistic2Under');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(380);
			defender.anim({
				y: defender.y + 100,
				z: defender.behind(5),
				opacity: 0.5,
				time: 300,
			}, 'decel');
			defender.anim({
				time: 250,
			}, 'accel');
			defender.anim({
				x: defender.x,
				y: defender.y - 35,
				yscale: 0.25,
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
			scene.wait(1000);
		},
	},
	peck: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	drillpeck: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	irontail: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	bite: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	superfang: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	bugbite: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	crunch: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 800, 0.3);
			scene.showEffect('topbite', {
				x: defender.x,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 370,
			}, {
				y: defender.y + 20,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('bottombite', {
				x: defender.x,
				y: defender.y - 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 370,
			}, {
				y: defender.y - 20,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	pursuit: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(15),
				scale: 0,
				opacity: 0.2,
				time: 600,
			}, {
				scale: 1.5,
				opacity: 0,
				time: 1000,
			}, 'linear');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 300,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.leftof(5),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(15),
				time: 600,
			}, 'accel');
			defender.delay(25);
			defender.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	blazekick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');

			BattleOtherAnims.kick.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	lowkick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 50,
				z: defender.behind(20),
				scale: 1.7,
				opacity: 0,
				time: 650,
			}, 'linear');

			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	stomp: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	thunderouskick: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.kick.anim(scene, [attacker, defender]);
			scene.backgroundEffect('#ffffff', 300, 0.7);
			scene.backgroundEffect('#000000', 1000, 0.7, 100);
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 550,
			}, {
				x: defender.x + 60,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 825,
			}, 'decel', 'explode');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 575,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 850,
			}, 'decel', 'explode');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 875,
			}, 'decel', 'explode');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 625,
			}, {
				x: defender.x + 50,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 900,
			}, 'decel', 'explode');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 650,
			}, {
				x: defender.x - 10,
				y: defender.y + 60,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 925,
			}, 'decel', 'explode');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	tropkick: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.kick.anim(scene, [attacker, defender]);
			scene.backgroundEffect('#9AB440', 300, 0.3, 500);
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 420,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 520,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('petal', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 550,
			}, {
				x: defender.x + 60,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 825,
			}, 'decel', 'explode');
			scene.showEffect('petal', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 575,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 850,
			}, 'decel', 'explode');
			scene.showEffect('petal', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 875,
			}, 'decel', 'explode');
			scene.showEffect('petal', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 625,
			}, {
				x: defender.x + 50,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 900,
			}, 'decel', 'explode');
			scene.showEffect('petal', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 650,
			}, {
				x: defender.x - 10,
				y: defender.y + 60,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 925,
			}, 'decel', 'explode');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	jumpkick: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.kick.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	highjumpkick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 25,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
			}, 'ballistic', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
			}, 'ballistic', 'fade');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 750,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 170,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 200,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(500);
			defender.anim({
				y: defender.y - 5,
				z: defender.behind(40),
				yscale: 0.9,
				time: 300,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	ironhead: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.2,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	heartstamp: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('heart', {
				x: defender.leftof(-20),
				y: defender.y + 15,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	slam: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	dragontail: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	reversal: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	punishment: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	forcepalm: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.6,
				opacity: 0.1,
				time: 350,
			}, {
				x: defender.x + 20,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('rightchop', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 15,
				opacity: 0,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('rightchop', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.z - 10,
				scale: 0.5,
				opacity: 0.3,
				time: 575,
			}, {
				x: defender.x - 15,
				opacity: 0,
				time: 850,
			}, 'decel', 'fade');

			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	circlethrow: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 0.6,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				z: defender.behind(20),
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	knockoff: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	assurance: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	chipaway: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	bodyslam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	bloodmoon: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 100 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect('#000000', 1700, 0.8);

			scene.showEffect('moon', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 1,
				opacity: 0.9,
				time: 0,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.7,
				time: 0,
			}, 'decel', '', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 1300,
			}, 'decel', '', { filter: 'hue-rotate(-45deg)' });
			for (let i = 0; i < 5; i++) {
				scene.showEffect('flareball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 100) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.5,
					opacity: 1,
					time: 40 * i + 700,
				}, {
					scale: 1,
					opacity: 0,
					time: 60 * i + 1500,
				}, 'linear', '', { filter: 'hue-rotate(-45deg)' });
			}
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 800,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1000,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 875,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1075,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 950,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1150,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1025,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1225,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1100,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1300,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1175,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1375,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 1375,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1675,
			}, 'linear', 'explode', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 0,
				opacity: 1,
				time: 1175,
			}, {
				scale: 8,
				opacity: 0,
				time: 1375,
			}, 'linear', '', { filter: 'hue-rotate(-45deg)' });
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(10),
				scale: 0,
				opacity: 1,
				time: 1275,
			}, {
				scale: 8,
				opacity: 0,
				time: 1675,
			}, 'linear', '', { filter: 'hue-rotate(-45deg)' });

			defender.delay(775);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(10),
				time: 300,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	gigatonhammer: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	heavyslam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(20),
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	steamroller: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	pound: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	clamp: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	wakeupslap: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightchop', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.behind(-10),
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				xscale: 0,
				opacity: 0.5,
				time: 512.5,
			}, 'linear', 'fade');
			scene.showEffect('leftchop', {
				x: defender.x,
				y: defender.y - 10,
				z: defender.behind(-10),
				scale: 0.6,
				xscale: 0,
				opacity: 1,
				time: 512.5,
			}, {
				x: defender.x - 30,
				y: defender.y,
				xscale: 0.6,
				opacity: 0,
				time: 625,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	smellingsalts: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('rightchop', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0.9,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	karatechop: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightchop', {
				x: defender.leftof(30),
				y: defender.y + 50,
				z: defender.behind(-10),
				scale: 0.6,
				opacity: 1,
				time: 475,
			}, {
				y: defender.y - 20,
				opacity: 0.5,
				time: 550,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	crosschop: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 425,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 425,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');

			scene.showEffect('leftchop', {
				x: defender.x + 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 60,
				y: defender.y - 70,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('rightchop', {
				x: defender.x - 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 60,
				y: defender.y - 70,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	lick: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	visegrip: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	headbutt: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	block: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, {
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	xscissor: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425,
			}, {
				scale: 2,
				opacity: 0.5,
				time: 725,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
		},
	},
	crosspoison: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425,
			}, {
				scale: 2,
				opacity: 0.5,
				time: 725,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 625,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');

			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 30,
				y: defender.y + 10,
				scale: 1,
				opacity: 0.5,
				time: 750,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x - 30,
				y: defender.y - 40,
				scale: 1,
				opacity: 0.5,
				time: 850,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 650,
			}, {
				x: defender.x - 10,
				y: defender.y + 40,
				scale: 1,
				opacity: 0.5,
				time: 950,
			}, 'decel', 'fade');
		},
	},
	facade: {
		anim: BattleOtherAnims.xattack.anim,
	},
	guillotine: {
		anim: BattleOtherAnims.xattack.anim,
	},
	return: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('heart', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(750);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(15),
				time: 300,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('foot', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 650,
			}, {
				x: defender.x - 15,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 875,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 725,
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 925,
			}, 'linear', 'explode');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 1000,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1300,
			}, 'linear');
		},
	},
	leafblade: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.xattack.anim(scene, [attacker, defender]);
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0.2,
				time: 750,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 750,
			}, {
				scale: 2,
				opacity: 0.2,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('leaf1', {
				x: defender.x - 35,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 450,
			}, {
				scale: 3,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('leaf2', {
				x: defender.x + 35,
				y: defender.y - 15,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 550,
			}, {
				scale: 3.5,
				opacity: 0,
				time: 850,
			}, 'linear');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'accel', 'fade');
			scene.showEffect('leaf1', {
				x: defender.x - 35,
				y: defender.y - 15,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 750,
			}, {
				scale: 3,
				opacity: 0,
				time: 1050,
			}, 'linear');
			scene.showEffect('leaf2', {
				x: defender.x + 35,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 800,
			}, {
				scale: 3.5,
				opacity: 0,
				time: 1190,
			}, 'linear');
			scene.showEffect('rightslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 750,
			}, {
				scale: 2,
				opacity: 0,
				time: 1100,
			}, 'accel', 'fade');
		},
	},
	thrash: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('angry', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 300,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(750);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(15),
				time: 300,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('foot', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 650,
			}, {
				x: defender.x - 15,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 950,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 875,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 725,
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 925,
			}, 'linear', 'explode');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 1000,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1300,
			}, 'linear');
		},
	},
	pluck: {
		anim: BattleOtherAnims.xattack.anim,
	},
	bind: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y + 15,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 500,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 1100,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 550,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 1150,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 600,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 1200,
			}, 'decel', 'fade');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y + 15,
				z: defender.behind(10),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.delay(25);
			defender.anim({
				x: defender.leftof(-10),
				y: defender.y + 15,
				z: defender.behind(5),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	dualchop: {
		anim: BattleOtherAnims.xattack.anim,
	},
	doublehit: {
		anim: BattleOtherAnims.xattack.anim,
	},
	doubleslap: {
		anim: BattleOtherAnims.xattack.anim,
	},
	closecombat: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 350,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 150,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 425,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 525,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 20,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x + 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 475,
			}, {
				x: defender.x + 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 575,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x - 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 775,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.x + 10,
				y: defender.y - 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 650,
			}, {
				x: defender.x - 10,
				y: defender.y + 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, 'linear', 'explode');

			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 525,
			}, {
				scale: 3,
				opacity: 0,
				time: 825,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 750,
			}, {
				scale: 3,
				opacity: 0,
				time: 1050,
			}, 'linear');
		},
	},
	doublekick: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 1050,
			}, 'linear');
			BattleOtherAnims.xattack.anim(scene, [attacker, defender]);
		},
	},
	endeavor: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 450,
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 750,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 750,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 0,
				opacity: 1,
				time: 1050,
			}, 'linear', 'fade');
			BattleOtherAnims.xattack.anim(scene, [attacker, defender]);
		},
	},
	playrough: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fist', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425,
			}, {
				x: defender.x - 15,
				y: defender.y - 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 725,
			}, 'linear');
			scene.showEffect('mudwisp', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 675,
			}, 'linear', 'explode');
			scene.showEffect('mudwisp', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(15),
				scale: 2,
				opacity: 0,
				time: 1100,
			}, 'linear');

			scene.showEffect('heart', {
				x: defender.x - 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 20,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('heart', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 675,
			}, {
				x: defender.x - 35,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 775,
			}, 'linear', 'explode');
			scene.showEffect('heart', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 750,
			}, {
				x: defender.x - 10,
				y: defender.y + 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'linear', 'explode');

			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 750,
			}, 'linear', 'fade');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 750,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 1050,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 350,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 150,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	strength: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	hammerarm: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fist1', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.2,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y - 10,
				z: defender.z,
				scale: 1.6,
				opacity: 1,
				time: 500,
			}, 'accel', 'explode');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(20),
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	icehammer: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FFFFFF', 600, 0.3, 400);
			scene.showEffect('fist1', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.2,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y - 10,
				z: defender.z,
				scale: 1.6,
				opacity: 1,
				time: 500,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 70,
				scale: 0.8,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');

			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				yscale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				yscale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				yscale: 1,
				opacity: 1,
				time: 550,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				yscale: 4,
				opacity: 0,
				time: 850,
			}, 'linear');

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(20),
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	skyuppercut: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('fist1', {
				x: defender.leftof(-20),
				y: defender.y + 10,
				z: defender.behind(20),
				scale: 1.2,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y + 80,
				opacity: 1,
				time: 500,
			}, 'decel', 'explode');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(5),
				time: 300,
			}, 'decel');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 250,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(380);
			defender.anim({
				y: defender.y + 100,
				z: defender.behind(5),
				opacity: 0.5,
				time: 300,
			}, 'decel');
			defender.anim({
				time: 250,
			}, 'accel');
			defender.anim({
				x: defender.x,
				y: defender.y - 30,
				yscale: 0.25,
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	meteormash: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 1000, 0.4);
			scene.showEffect(attacker.sp, {
				x: attacker.leftof(20),
				y: attacker.y,
				z: attacker.behind(-25),
				opacity: 0.3,
				time: 25,
			}, {
				x: defender.x,
				z: defender.behind(-5),
				opacity: 0,
				time: 425,
			}, 'ballistic2Under');
			scene.showEffect(attacker.sp, {
				x: attacker.leftof(20),
				y: attacker.y,
				z: attacker.behind(-25),
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				z: defender.behind(-5),
				opacity: 0,
				time: 450,
			}, 'ballistic2Under');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 450,
			}, {
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500,
			}, {
				y: defender.y + 100,
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.x - 60,
				y: defender.y - 80,
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.x - 90,
				y: defender.y + 40,
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 1,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');
			BattleOtherAnims.punchattack.anim(scene, [attacker, defender]);
		},
	},
	shadowpunch: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');

			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				opacity: 1,
				time: 200,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-25),
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(400);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	focuspunch: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	drainpunch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0,
			}, 'ballistic2Under');
			BattleOtherAnims.punchattack.anim(scene, [attacker, defender]);
		},
	},
	dynamicpunch: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 350,
			}, {
				scale: 7,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 500,
			}, {
				scale: 7,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 650,
			}, {
				scale: 7,
				opacity: 0,
			}, 'decel');
			BattleOtherAnims.punchattack.anim(scene, [attacker, defender]);
		},
	},
	cometpunch: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	megapunch: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	poweruppunch: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	dizzypunch: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	needlearm: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	rocksmash: {
		anim: BattleOtherAnims.punchattack.anim,
	},
	hornleech: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-15),
				y: defender.y,
				z: defender.behind(15),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	absorb: {
		anim: BattleOtherAnims.drain.anim,
	},
	megadrain: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#9AB440', 900, 0.2);
			BattleOtherAnims.drain.anim(scene, [attacker, defender]);
		},
	},
	gigadrain: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#9AB440', 900, 0.5);
			BattleOtherAnims.drain.anim(scene, [attacker, defender]);
		},
	},
	bitterblade: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 800, 0.3, 400);
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 400,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'accel', 'fade');
			scene.showEffect('bluefireball', {
				x: defender.x - 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 60,
				y: defender.y - 70,
				scale: 0.6,
				opacity: 0,
				time: 700,
			}, 'decel');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0,
			}, 'linear');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	leechlife: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#987058', 800, 0.3, 400);
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 600,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 900,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 650,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 950,
				opacity: 0,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 1000,
				opacity: 0,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	extremespeed: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.6,
				time: 600,
			}, {
				x: attacker.x + 20,
				z: attacker.behind(-50),
				scale: 0.8,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.6,
				time: 600,
			}, {
				x: attacker.x - 20,
				z: attacker.behind(-50),
				scale: 0.8,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');

			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.7,
				time: 375,
			}, {
				scale: 1.2,
				opacity: 0,
				time: 650,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 25,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.7,
				time: 500,
			}, {
				scale: 1.2,
				opacity: 0,
				time: 775,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y + 10,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.7,
				time: 600,
			}, {
				scale: 1,
				opacity: 0,
				time: 850,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 2,
				y: defender.y + 5,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.7,
				time: 600,
			}, {
				scale: 1.5,
				opacity: 0,
				time: 975,
			}, 'linear');

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.5,
				time: 0,
			}, {
				opacity: 0,
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.8,
				time: 400,
			}, {
				z: attacker.behind(-100),
				opacity: 0,
				time: 475,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.8,
				time: 450,
			}, {
				z: attacker.behind(-100),
				opacity: 0,
				time: 525,
			}, 'accel');

			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({ opacity: 0, time: 50 }, 'linear');
			attacker.anim({ opacity: 1, time: 50 }, 'linear');
			attacker.anim({
				z: attacker.behind(-100),
				opacity: 0,
				time: 75,
			}, 'accel');
			attacker.anim({
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.delay(600);
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');

			defender.delay(375);
			defender.anim({
				x: defender.leftof(5),
				z: defender.behind(20),
				time: 50,
			});
			defender.anim({
				time: 75,
			});
			defender.anim({
				z: defender.behind(20),
				time: 75,
			});
			defender.anim({
				time: 75,
			});
			defender.anim({
				x: defender.leftof(10),
				z: defender.behind(30),
				time: 250,
			}, 'decel');
			defender.anim({
				time: 350,
			}, 'swing');
		},
	},
	quickattack: {
		anim: BattleOtherAnims.fastattack.anim,
	},
	suckerpunch: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 0,
				opacity: 0.3,
				time: 260,
			}, {
				scale: 1.25,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	astonish: {
		anim: BattleOtherAnims.fastattack.anim,
	},
	rollout: {
		anim: BattleOtherAnims.fastattack.anim,
	},
	accelerock: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect('rock3', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 260,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0,
				time: 500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 260,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0,
				time: 500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 360,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 360,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0,
				time: 600,
			}, 'accel');

			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.3,
				time: 260,
			}, {
				scale: 1.25,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	bulletpunch: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260,
			}, {
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.3,
				time: 260,
			}, {
				scale: 1.25,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	machpunch: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	wickedblow: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 900, 0.3);
			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 260,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	vacuumwave: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200,
			}, 'accel', 'fade');
		},
	},
	jetpunch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200,
			}, 'accel', 'fade');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				time: 200,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				y: defender.y + 50,
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 50,
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 50,
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 25,
				y: defender.y - 50,
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 25,
				y: defender.y - 50,
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
		},
	},
	assist: {
		anim() {},
	},
	mirrormove: {
		anim() {},
	},
	naturepower: {
		anim() {},
	},
	copycat: {
		anim() {},
	},
	sleeptalk: {
		anim() {},
	},
	megahorn: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#987058', 400, 0.3);
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	firepunch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	icepunch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	thunderpunch: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	poisonfang: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');

			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	psychicfangs: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#AA44BB', 450, 0.6, 450);
			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				z: defender.behind(20),
				scale: 1.2,
				time: 100,
			}, 'swing');
			defender.anim({
				scale: 1,
				time: 300,
			});
		},
	},
	icefang: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');

			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	firefang: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');

			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	thunderfang: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');

			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	wildcharge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 750,
			}, 'linear');

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	spark: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	zapcannon: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#2630A9', 700, 0.6);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	armorcannon: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#124763', 700, 0.6);
			scene.backgroundEffect('#FFC001', 300, 0.3, 600);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.behind(-20),
				scale: 0.5,
				xscale: 3,
				opacity: 0,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.8,
				xscale: 0.8,
				opacity: 0.8,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x - 60,
				y: attacker.y - 80,
				z: attacker.behind(-20),
				scale: 0.5,
				yscale: 3,
				opacity: 0,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1.5,
				yscale: 1.5,
				opacity: 0.8,
				time: 450,
			}, 'decel', 'fade');

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 0.8,
				opacity: 0.5,
				time: 650,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 1.5,
				opacity: 0.8,
				time: 650,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.3,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.3,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.3,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 825,
			}, 'accel', 'explode');

			defender.delay(800);
			defender.anim({
				z: defender.behind(10),
				time: 175,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	torchsong: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FFC001', 800, 0.3, 200);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.8,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 200,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.8,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 200,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.8,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 225,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 200,
			}, {
				z: defender.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 350,
			}, {
				z: defender.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				z: defender.behind(-50),
				scale: 7,
				opacity: 0,
				time: 1000,
			}, 'linear');
		},
	},
	chloroblast: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#36E747', 700, 0.2);
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	hyperbeam: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	gigaimpact: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	shelltrap: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(280);
				defender.anim({
					z: defender.behind(20),
					time: 100,
				}, 'swing');
				defender.anim({
					time: 300,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];

			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('#000000', 600, 0.3);

			for (let i = 0; i < 4; i++) {
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.behind(-5),
					scale: 0.5,
					opacity: 1,
				}, {
					x: defender.x + 240 * xf[i],
					y: defender.y,
					z: defender.z + 137 * yf[i],
					opacity: 0,
					time: 600,
				}, 'decel');
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.behind(-5),
					scale: 0.5,
					opacity: 1,
				}, {
					x: defender.x + 339 * xf2[i],
					y: defender.y + 10,
					z: defender.z + 194 * yf2[i],
					scale: 1,
					opacity: 0,
					time: 600,
				}, 'decel');
			}
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
	},
	spinout: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 5; i++) {
				scene.showEffect('gear', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0,
					opacity: 1,
					time: 0,
				}, {
					// Gives a "random" gear break-ish look
					x: attacker.x + (50 / i),
					y: attacker.y + (i * 5),
					scale: 1,
					opacity: 0,
					time: 300,
				}, 'ballistic');
			}

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 25,
				y: attacker.y - 25,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 30,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 250,
			}, {
				x: attacker.x + 5,
				y: attacker.y - 40,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'ballistic');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x - 20,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600,
			}, {
				scale: 5,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				scale: 8,
				opacity: 0,
				time: 1000,
			}, 'linear');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	matchagotcha: {
		anim(scene, [attacker, ...defenders]) {
			for (let i = 0; i < 10; i++) {
				scene.showEffect('energyball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0,
					opacity: 1,
					time: 0,
				}, {
					x: attacker.x + (100 / i),
					y: attacker.y + (i * 10),
					scale: 1,
					opacity: 0,
					time: 300,
				}, 'ballistic');
			}

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 25,
				y: attacker.y - 25,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 30,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 250,
			}, {
				x: attacker.x + 5,
				y: attacker.y - 40,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'ballistic');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x - 20,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			for (const defender of defenders) {
				scene.showEffect('energyball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0,
					opacity: 1,
					time: 600,
				}, {
					scale: 5,
					opacity: 0,
					time: 900,
				}, 'linear');
				scene.showEffect('energyball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0,
					opacity: 1,
					time: 700,
				}, {
					scale: 8,
					opacity: 0,
					time: 1000,
				}, 'linear');
				scene.showEffect('wisp', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 1010,
				}, {
					y: defender.y + 60,
					opacity: 0.2,
					time: 1410,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 1110,
				}, {
					y: defender.y + 60,
					opacity: 0.2,
					time: 1510,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x + 15,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 1210,
				}, {
					y: defender.y + 60,
					opacity: 0.2,
					time: 1610,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 15,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 1,
					time: 1310,
				}, {
					y: defender.y + 60,
					opacity: 0.2,
					time: 1710,
				}, 'linear', 'fade');
			}
		},
	},
	flamecharge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 25,
				y: attacker.y - 25,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 30,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 250,
			}, {
				x: attacker.x + 5,
				y: attacker.y - 40,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x - 20,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600,
			}, {
				scale: 5,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				scale: 8,
				opacity: 0,
				time: 1000,
			}, 'linear');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	flareblitz: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 600, 0.6);
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 8,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				scale: 8,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	burnup: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 800, 0.6);
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 8,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				scale: 8,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				scale: 1.5,
				opacity: 0,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				time: 300,
			}, 'accel', 'explode');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400,
			}, 'accel', 'fade');

			scene.showEffect('wisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 900,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 1300,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 1000,
			}, {
				y: defender.y + 60,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 1100,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 1500,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x - 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 1200,
			}, {
				y: attacker.y + 60,
				opacity: 0,
				time: 1600,
			}, 'linear');

			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(15),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'decel');
		},
	},
	beakblast: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1200, 0.6);
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 25,
				y: attacker.y - 25,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 30,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 250,
			}, {
				x: attacker.x + 5,
				y: attacker.y - 40,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'ballistic');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x - 20,
				y: attacker.y - 20,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600,
			}, {
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 700,
			}, {
				scale: 5,
				opacity: 0,
				time: 1000,
			}, 'linear');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	vcreate: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 350,
			}, {
				scale: 6,
				opacity: 0,
				time: 650,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 350,
			}, {
				scale: 6,
				opacity: 0,
				time: 650,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				scale: 6,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				scale: 6,
				opacity: 0,
				time: 700,
			}, 'linear');

			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				scale: 6,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				scale: 6,
				opacity: 0,
				time: 850,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				scale: 6,
				opacity: 0,
				time: 850,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600,
			}, {
				scale: 6,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 600,
			}, {
				scale: 6,
				opacity: 0,
				time: 900,
			}, 'linear');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				scale: 1.5,
				opacity: 0,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				time: 300,
			}, 'accel', 'explode');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(15),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	outrage: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 600, 0.6, 400);
			scene.showEffect('angry', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 50,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 60,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x + 10,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 800,
			}, {
				scale: 4,
				opacity: 0,
				time: 1100,
			}, 'linear');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	ragingfury: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 600, 0.6, 400);
			scene.showEffect('angry', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 50,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'ballistic');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 60,
				y: attacker.y - 50,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'ballistic');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x + 10,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'ballistic');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 800,
			}, {
				scale: 4,
				opacity: 0,
				time: 1100,
			}, 'linear');

			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(580);
			defender.anim({
				z: defender.behind(20),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	boltstrike: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#00CCCC', 900, 0.3);

			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 300,
			}, 'accel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				opacity: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 300,
			}, 'accel', 'fade');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.7,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	fusionflare: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 0,
			}, {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 2,
				time: 200,
			}, 'accel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				opacity: 0.4,
				scale: 0,
				time: 150,
			}, {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 90,
				z: attacker.z,
				opacity: 0.8,
				scale: 2,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				time: 500,
			}, 'accel', 'fade');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 0,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 1000,
			}, 'linear');

			defender.delay(500);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	fusionbolt: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 3,
				opacity: 1,
				time: 650,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200,
			}, 'accel');
			scene.showEffect('waterwisp', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 1.5,
				opacity: 1,
				time: 650,
			}, 'accel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 0,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 0,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear');

			attacker.anim({
				y: defender.y + 120,
				xscale: 0,
				yscale: 0,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(625);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				xscale: 1,
				yscale: 1,
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(625);
			defender.anim({
				z: defender.behind(20),
				time: 250,
			}, 'decel');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	zenheadbutt: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	fakeout: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightchop', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.behind(-120),
				scale: 0.3,
				opacity: 0.1,
				time: 200,
			}, {
				x: defender.x + 4,
				y: defender.y + 7,
				z: defender.behind(20),
				xscale: 0.15,
				yscale: 0.35,
				opacity: 1,
				time: 400,
			}, 'accel', 'explode');
			scene.showEffect('leftchop', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.behind(-120),
				scale: 0.3,
				opacity: 0.1,
				time: 200,
			}, {
				x: defender.x - 4,
				y: defender.y + 7,
				z: defender.behind(20),
				xscale: 0.15,
				yscale: 0.35,
				opacity: 1,
				time: 400,
			}, 'accel', 'explode');

			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				opacity: 1,
				time: 250,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(370);
			defender.anim({
				z: defender.behind(20),
				yscale: 1.4,
				xscale: 0.7,
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	covet: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('heart', {
				x: attacker.x - 10,
				y: attacker.y + 50,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
				time: 0,
			}, {
				scale: 3,
				opacity: 0,
				time: 300,
			}, 'ballistic2Under', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 650,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(30),
				scale: 1.5,
				opacity: 0,
				time: 850,
			}, 'linear');

			attacker.delay(300);
			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-120),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(40),
				opacity: 1,
				time: 250,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'linear');
			defender.delay(630);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	feint: {
		anim: BattleOtherAnims.sneakattack.anim,
	},
	thief: {
		anim: BattleOtherAnims.sneakattack.anim,
	},
	shadowsneak: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			BattleOtherAnims.sneakattack.anim(scene, [attacker, defender]);
		},
	},
	feintattack: {
		anim: BattleOtherAnims.sneakattack.anim,
	},
	struggle: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	earthquake: {
		anim(scene, [attacker, ...defenders]) {
			scene.$bg.animate({
				top: -90,
				bottom: 0,
			}, 75).animate({
				top: -100,
				bottom: -10,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92,
				bottom: -2,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92,
				bottom: -2,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100);

			attacker.anim({
				y: attacker.y - 10,
				yscale: 1,
				time: 75,
			});
			attacker.anim({
				y: attacker.y + 10,
				yscale: 0.9,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 7,
				yscale: 1,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 7,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 7,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 7,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 7,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 7,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 2,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 2,
				time: 100,
			});
			attacker.anim({
				y: attacker.y,
				time: 100,
			});

			for (const defender of defenders) {
				defender.anim({
					y: defender.y - 10,
					time: 75,
				});
				defender.anim({
					y: defender.y + 10,
					time: 100,
				});
				defender.anim({
					y: defender.y - 7,
					time: 100,
				});
				defender.anim({
					y: defender.y + 7,
					time: 100,
				});
				defender.anim({
					y: defender.y - 7,
					time: 100,
				});
				defender.anim({
					y: defender.y + 7,
					time: 100,
				});
				defender.anim({
					y: defender.y - 7,
					time: 100,
				});
				defender.anim({
					y: defender.y + 7,
					time: 100,
				});
				defender.anim({
					y: defender.y - 2,
					time: 100,
				});
				defender.anim({
					y: defender.y + 2,
					time: 100,
				});
				defender.anim({
					y: defender.y,
					time: 100,
				});

				scene.showEffect('rock3', {
					x: defender.x + 5,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 0,
				}, {
					x: defender.x + 30,
					y: defender.y,
					scale: 0.4,
					opacity: 0,
					time: 350,
				}, 'ballistic');
				scene.showEffect('rock3', {
					x: defender.x - 10,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 250,
				}, {
					x: defender.x - 35,
					y: defender.y,
					scale: 0.3,
					opacity: 0,
					time: 600,
				}, 'ballistic');
				scene.showEffect('rock3', {
					x: defender.x + 40,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 400,
				}, {
					x: defender.x + 65,
					y: defender.y,
					scale: 0.3,
					opacity: 0,
					time: 750,
				}, 'ballistic2');
				scene.showEffect('rock3', {
					x: defender.x,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 500,
				}, {
					x: defender.x + 40,
					y: defender.y,
					scale: 0.4,
					opacity: 0,
					time: 750,
				}, 'ballistic');
			}
		},
	},
	bulldoze: {
		anim(scene, [attacker, ...defenders]) {
			scene.$bg.delay(275);
			scene.$bg.animate({
				top: -90,
				bottom: 0,
			}, 75).animate({
				top: -100,
				bottom: -10,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92.5,
				bottom: -2.5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92.5,
				bottom: -2.5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100);

			attacker.anim({
				y: attacker.y + 20,
				time: 175,
			}, 'swing');
			attacker.anim({
				y: attacker.y,
				time: 125,
			}, 'accel');
			attacker.anim({
				y: attacker.y - 10,
				yscale: 1,
				time: 75,
			});
			attacker.anim({
				y: attacker.y + 10,
				yscale: 0.9,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 5,
				yscale: 1,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 5,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 5,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 5,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 5,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 5,
				time: 100,
			});
			attacker.anim({
				y: attacker.y - 2,
				time: 100,
			});
			attacker.anim({
				y: attacker.y + 2,
				time: 100,
			});
			attacker.anim({
				y: attacker.y,
				time: 100,
			});

			for (const defender of defenders) {
				defender.delay(275);
				defender.anim({
					y: defender.y - 10,
					time: 75,
				});
				defender.anim({
					y: defender.y + 10,
					time: 100,
				});
				defender.anim({
					y: defender.y - 5,
					time: 100,
				});
				defender.anim({
					y: defender.y + 5,
					time: 100,
				});
				defender.anim({
					y: defender.y - 5,
					time: 100,
				});
				defender.anim({
					y: defender.y + 5,
					time: 100,
				});
				defender.anim({
					y: defender.y - 5,
					time: 100,
				});
				defender.anim({
					y: defender.y + 5,
					time: 100,
				});
				defender.anim({
					y: defender.y - 2,
					time: 100,
				});
				defender.anim({
					y: defender.y + 2,
					time: 100,
				});
				defender.anim({
					y: defender.y,
					time: 100,
				});
			}
			scene.wait(325);
		},
	},
	tickle: {
		anim(scene, [attacker, defender]) {
			defender.anim({
				x: defender.x - 10,
				time: 75,
			});
			defender.anim({
				x: defender.x + 10,
				time: 100,
			});
			defender.anim({
				x: defender.x - 10,
				time: 100,
			});
			defender.anim({
				x: defender.x + 10,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
			scene.wait(425);
		},
	},
	earthpower: {
		anim(scene, [attacker, defender]) {
			scene.$bg.animate({
				top: -90,
				bottom: 0,
			}, 75).animate({
				top: -100,
				bottom: -10,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -95,
				bottom: -5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92.5,
				bottom: -2.5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100).animate({
				top: -92.5,
				bottom: -2.5,
			}, 100).animate({
				top: -90,
				bottom: 0,
			}, 100);

			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
			}, {
				scale: 3,
				opacity: 0,
			}, 'linear');
			scene.showEffect('rock3', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0,
			}, {
				x: defender.x + 30,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: defender.x + 35,
				y: defender.y + 50,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, 'linear', 'fade');

			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'linear');
			scene.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 60,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 450,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 250,
			}, {
				x: defender.x - 20,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 550,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 350,
			}, {
				x: defender.x - 35,
				y: defender.y + 45,
				scale: 0.5,
				opacity: 0,
				time: 650,
			}, 'linear', 'fade');

			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
			}, 'linear');
			scene.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 60,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 400,
			}, {
				x: defender.x + 20,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('rock3', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x + 30,
				y: defender.y + 65,
				scale: 0.5,
				opacity: 0,
				time: 800,
			}, 'linear', 'fade');

			defender.delay(50);
			defender.anim({
				y: defender.y - 10,
				time: 75,
			});
			defender.anim({
				y: defender.y + 10,
				time: 100,
			});
			defender.anim({
				y: defender.y - 7,
				time: 100,
			});
			defender.anim({
				y: defender.y + 7,
				time: 100,
			});
			defender.anim({
				y: defender.y - 7,
				time: 100,
			});
			defender.anim({
				y: defender.y + 7,
				time: 100,
			});
			defender.anim({
				y: defender.y - 2,
				time: 100,
			});
			defender.anim({
				y: defender.y + 2,
				time: 100,
			});
			defender.anim({
				y: defender.y,
				time: 100,
			});
		},
	},
	drillrun: { // todo: rip horn sprite and redo animation
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 200,
			});
			defender.anim({
				z: defender.behind(0),
				time: 200,
			});

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 500,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.leftof(10),
				y: defender.y - 10,
				z: defender.behind(-40),
				scale: 0.7,
				yscale: 1,
				opacity: 0.8,
				time: 300,
			}, {
				z: defender.behind(5),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 450,
			}, 'accel');
			scene.showEffect('flareball', {
				x: defender.leftof(10),
				y: defender.y - 10,
				z: defender.behind(-40),
				scale: 0.7,
				yscale: 1,
				opacity: 0.8,
				time: 350,
			}, {
				z: defender.behind(5),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 500,
			}, 'accel');
			scene.showEffect('flareball', {
				x: defender.leftof(10),
				y: defender.y - 10,
				z: defender.behind(-40),
				scale: 0.7,
				yscale: 1,
				opacity: 0.8,
				time: 400,
			}, {
				z: defender.behind(5),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 550,
			}, 'accel');
		},
	},
	poisongas: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 0,
			}, {
				x: defender.x + 10,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 30,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 40,
				y: defender.y + 20,
				scale: 0.7,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	smog: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.6,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 20,
				y: defender.y + 5,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 500,
			}, 'decel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 25,
				y: defender.y,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'explode');

			scene.showEffect('poisonwisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y + 30,
				scale: 1.4,
				opacity: 0.2,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 50,
				y: defender.y + 30,
				scale: 1.4,
				opacity: 0.2,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 25,
				y: defender.y + 20,
				scale: 1.4,
				opacity: 0.2,
				time: 1000,
			}, 'decel', 'fade');
		},
	},
	clearsmog: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.6,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 20,
				y: defender.y + 5,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 500,
			}, 'decel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 25,
				y: defender.y,
				z: defender.behind(10),
				scale: 1,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'explode');

			scene.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 40,
				y: defender.y + 20,
				scale: 1.4,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 40,
				y: defender.y + 20,
				scale: 1.4,
				opacity: 0.2,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				scale: 1.4,
				opacity: 0.2,
				time: 1000,
			}, 'linear', 'fade');
		},
	},
	bonemerang: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('bone', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
			}, {
				z: defender.behind(20),
				opacity: 1,
				time: 300,
			}, 'ballistic2');
			scene.showEffect('bone', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 1,
				time: 300,
			}, {
				z: attacker.z,
				opacity: 0,
				time: 600,
			}, 'ballistic2Under', 'fade');
		},
	},
	boneclub: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('bone', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	shadowbone: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 600, 0.3);
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 450,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('bone', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	whirlwind: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 3; i++) {
				scene.showEffect('wisp', {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y + 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	hurricane: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 900, 0.6);

			for (let i = 0; i < 4; i++) {
				scene.showEffect('wisp', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	springtidestorm: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#FF99FF', 1000, 0.3);

			for (const defender of defenders) {
				for (const effect of ['mistball', 'heart']) {
					for (let i = 0; i < 4; i++) {
						scene.showEffect(effect, {
							x: defender.x + 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x - 50,
							y: defender.y,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x - 50,
							y: defender.y + 35,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x + 50,
							y: defender.y,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x + 50,
							y: defender.y,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x - 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x - 50,
							y: defender.y,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x + 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
					}
				}
			}
		},
	},
	wildboltstorm: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#F6D434', 1000, 0.3);

			for (const defender of defenders) {
				for (const effect of ['blackwisp', 'lightning']) {
					for (let i = 0; i < 4; i++) {
						scene.showEffect(effect, {
							x: defender.x + 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x - 50,
							y: defender.y,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x - 50,
							y: defender.y + 35,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x + 50,
							y: defender.y,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x + 50,
							y: defender.y,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x - 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
						scene.showEffect(effect, {
							x: defender.x - 50,
							y: defender.y,
							z: defender.z,
							scale: 0.2,
							opacity: 1,
							time: 200 * i,
						}, {
							x: defender.x + 50,
							y: defender.y - 35,
							z: defender.z,
							scale: 0.4,
							opacity: 0.4,
							time: 200 * i + 200,
						}, 'linear', 'fade');
					}
				}
			}
		},
	},
	sandsearstorm: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#B47F1F', 1000, 0.3);

			for (const defender of defenders) {
				for (let i = 0; i < 4; i++) {
					scene.showEffect('mudwisp', {
						x: defender.x + 50,
						y: defender.y - 35,
						z: defender.z,
						scale: 0.2,
						opacity: 1,
						time: 200 * i,
					}, {
						x: defender.x - 50,
						y: defender.y,
						z: defender.z,
						scale: 0.4,
						opacity: 0.4,
						time: 200 * i + 200,
					}, 'linear', 'fade');
					scene.showEffect('mudwisp', {
						x: defender.x - 50,
						y: defender.y + 35,
						z: defender.z,
						scale: 0.2,
						opacity: 1,
						time: 200 * i,
					}, {
						x: defender.x + 50,
						y: defender.y,
						z: defender.z,
						scale: 0.4,
						opacity: 0.4,
						time: 200 * i + 200,
					}, 'linear', 'fade');
					scene.showEffect('mudwisp', {
						x: defender.x + 50,
						y: defender.y,
						z: defender.z,
						scale: 0.2,
						opacity: 1,
						time: 200 * i,
					}, {
						x: defender.x - 50,
						y: defender.y - 35,
						z: defender.z,
						scale: 0.4,
						opacity: 0.4,
						time: 200 * i + 200,
					}, 'linear', 'fade');
					scene.showEffect('mudwisp', {
						x: defender.x - 50,
						y: defender.y,
						z: defender.z,
						scale: 0.2,
						opacity: 1,
						time: 200 * i,
					}, {
						x: defender.x + 50,
						y: defender.y - 35,
						z: defender.z,
						scale: 0.4,
						opacity: 0.4,
						time: 200 * i + 200,
					}, 'linear', 'fade');
				}
			}
		},
	},
	ominouswind: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 3; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('poisonwisp', {
					x: defender.x - 30,
					y: defender.y + 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('poisonwisp', {
					x: defender.x + 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('poisonwisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.behind(i * 40 - 60),
					scale: 0.2,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 30,
					y: defender.y - 35,
					z: defender.behind(i * 40 - 60),
					scale: 0.4,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	magmastorm: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#CC3300', 900, 0.3);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
			for (let i = 0; i < 4; i++) {
				scene.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	firespin: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 4; i++) {
				scene.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('fireball', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	leaftornado: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 4; i++) {
				scene.showEffect('leaf1', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('leaf2', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('leaf1', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('leaf2', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	roar: {
		anim: BattleOtherAnims.sound.anim,
	},
	round: {
		anim: BattleOtherAnims.sound.anim,
	},
	yawn: {
		anim: BattleOtherAnims.sound.anim,
	},
	sing: {
		anim: BattleOtherAnims.sound.anim,
	},
	perishsong: {
		anim: BattleOtherAnims.sound.anim,
	},
	partingshot: {
		anim: BattleOtherAnims.sound.anim,
	},
	nobleroar: {
		anim: BattleOtherAnims.sound.anim,
	},
	disarmingvoice: {
		anim: BattleOtherAnims.sound.anim,
	},
	growl: {
		anim: BattleOtherAnims.sound.anim,
	},
	screech: {
		anim: BattleOtherAnims.sound.anim,
	},
	snore: {
		anim: BattleOtherAnims.sound.anim,
	},
	synchronoise: {
		anim: BattleOtherAnims.sound.anim,
	},
	sonicboom: {
		anim: BattleOtherAnims.sound.anim,
	},
	eerieimpulse: {
		anim: BattleOtherAnims.sound.anim,
	},
	metalsound: {
		anim: BattleOtherAnims.sound.anim,
	},
	supersonic: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 200,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 350,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');
		},
	},
	confide: {
		anim: BattleOtherAnims.sound.anim,
	},
	defog: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FFFFFF', 900, 0.5);
			BattleOtherAnims.sound.anim(scene, [attacker, defender]);
		},
	},
	grasswhistle: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#9AB440', 900, 0.3);
			BattleOtherAnims.sound.anim(scene, [attacker, defender]);
		},
	},
	hypervoice: {
		anim(scene, [attacker]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	boomburst: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(125);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 150,
				}, 'swing');
			}

			scene.backgroundEffect('#000000', 900, 0.5);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	heatwave: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(125);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 150,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#CC3300', 900, 0.1);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	snarl: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 0,
			}, {
				scale: 7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 150,
			}, {
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	thunder: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#ffffff', 300, 0.7);
			scene.backgroundEffect('#000000', 1000, 0.7, 100);
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0,
				time: 200,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				yscale: 1,
				xscale: 1.5,
				time: 200,
			}, {
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 50,
				z: defender.z,
				yscale: 1,
				xscale: 1.5,
				time: 600,
			}, {
				opacity: 0,
				time: 1100,
			}, 'linear');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 1.5,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 0.5,
				scale: 1.5,
				time: 200,
			}, {
				scale: 1.8,
				opacity: 0.1,
				time: 900,
			}, 'linear', 'fade');

			defender.delay(200);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'accel');
		},
	},
	thunderbolt: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 600, 0.2);
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0.8,
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect('lightning', {
				x: defender.x - 15,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
				time: 200,
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0.8,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('lightning', {
				x: defender.x + 15,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
				time: 400,
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0.8,
				time: 600,
			}, 'linear', 'fade');
		},
	},
	thundercage: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#ffffff', 300, 0.7);
			scene.backgroundEffect('#000000', 1000, 0.7, 100);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 5,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
			for (let i = 0; i < 4; i++) {
				scene.showEffect('lightning', {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('lightning', {
					x: defender.x - 50,
					y: defender.y + 35,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('lightning', {
					x: defender.x + 50,
					y: defender.y,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x - 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
				scene.showEffect('lightning', {
					x: defender.x - 50,
					y: defender.y,
					z: defender.z,
					scale: 0.3,
					opacity: 1,
					time: 200 * i,
				}, {
					x: defender.x + 50,
					y: defender.y - 35,
					z: defender.z,
					scale: 1,
					opacity: 0.4,
					time: 200 * i + 200,
				}, 'linear', 'fade');
			}
		},
	},
	psychic: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#AA44BB', 250, 0.6);
			scene.backgroundEffect('#AA44FF', 250, 0.6, 400);
			defender.anim({
				scale: 1.2,
				time: 100,
			});
			defender.anim({
				scale: 1,
				time: 100,
			});
			defender.anim({
				scale: 1.4,
				time: 150,
			});
			defender.anim({
				scale: 1,
				time: 150,
			});
			scene.wait(700);
		},
	},
	meanlook: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#AA0000', 250, 0.3);
			scene.backgroundEffect('#000000', 250, 0.2, 400);
			scene.showEffect('stare', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				yscale: 0,
				opacity: 1,
			}, {
				yscale: 1,
				time: 700,
			}, 'decel', 'fade');
		},
	},
	nightshade: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#550000', 250, 0.3);
			scene.backgroundEffect('#000000', 250, 0.2, 400);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 3,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y + 35,
				z: defender.z,
				scale: 3.5,
				opacity: 0.1,
				time: 600,
			}, 'accel', 'fade');
		},
	},
	fairylock: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FF99FF', 250, 0.3);
			scene.backgroundEffect('#AA44BB', 250, 0.2, 400);
			scene.wait(700);
		},
	},
	rockblast: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.4,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	geargrind: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('gear', {
				x: defender.x + 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 450,
			}, {
				x: defender.x + 20,
				y: defender.y,
				opacity: 1,
				time: 565,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: defender.x - 70,
				y: defender.y - 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 450,
			}, {
				x: defender.x - 20,
				y: defender.y,
				opacity: 1,
				time: 565,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('gear', {
				x: defender.x + 70,
				y: defender.y - 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 650,
			}, {
				x: defender.x + 20,
				y: defender.y,
				opacity: 1,
				time: 765,
			}, 'linear', 'explode');
			scene.showEffect('gear', {
				x: defender.x - 70,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.65,
				opacity: 0,
				time: 650,
			}, {
				x: defender.x - 20,
				y: defender.y,
				opacity: 1,
				time: 765,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 750,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');

			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				x: defender.leftof(30),
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 200,
			}, 'ballisticUp');
			attacker.anim({
				x: defender.leftof(-30),
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(450);
			defender.anim({
				y: defender.y + 15,
				z: defender.behind(10),
				yscale: 1.3,
				time: 100,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'swing');
			defender.delay(225);
			defender.anim({
				x: defender.leftof(-10),
				y: defender.y + 15,
				z: defender.behind(5),
				yscale: 1.3,
				time: 100,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'swing');
		},
	},
	iciclespear: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 375,
			}, 'linear', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 450,
			}, 'linear', 'fade');
		},
	},
	tailslap: {
		anim: BattleOtherAnims.contactattack.anim,
	},
	furyswipes: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('leftslash', {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			scene.showEffect('rightslash', {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');
			BattleOtherAnims.xattack.anim(scene, [attacker, defender]);
		},
	},
	furyattack: {
		anim: BattleOtherAnims.xattack.anim,
	},
	bulletseed: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.6,
				time: 30,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 330,
			}, 'linear', 'fade');
		},
	},
	spikecannon: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.6,
				time: 30,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 330,
			}, 'linear', 'fade');
		},
	},
	twineedle: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x - 35,
				y: defender.y + 10,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
		},
	},
	razorshell: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 700,
			}, {
				scale: 2,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 600,
			}, {
				scale: 2,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('shell', {
				x: defender.x - 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 60,
				y: defender.y - 70,
				scale: 0.6,
				opacity: 0,
				time: 700,
			}, 'decel');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	aquastep: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.dance.anim(scene, [attacker, defender]);
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x - 50,
				z: defender.behind(20),
				scale: 1.7,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x - 50,
				z: defender.behind(20),
				scale: 1.7,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	aquacutter: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 700,
			}, {
				scale: 2,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 600,
			}, {
				scale: 2,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x - 60,
				y: defender.y + 70,
				z: defender.z,
				scale: 0.75,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 60,
				y: defender.y - 70,
				scale: 0.6,
				opacity: 0,
				time: 700,
			}, 'decel');
		},
	},
	wavecrash: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#000039 30%, #3848B8)', 600, 0.6);
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 8,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				scale: 8,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	crabhammer: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	aquajet: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
			}, {
				y: attacker.y - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: Math.floor((attacker.x + defender.x) / 2) - 20,
				y: Math.floor((attacker.y + defender.y) / 2) + 30,
				z: Math.floor((attacker.z + defender.z) / 2),
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				y: Math.floor((attacker.y + defender.y) / 2) - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				y: defender.y - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: 0.5,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			defender.delay(260);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	iceshard: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'fade');
		},
	},
	watershuriken: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: attacker.x + 20,
				y: attacker.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
			}, {
				y: attacker.y - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: Math.floor((attacker.x + defender.x) / 2) - 20,
				y: Math.floor((attacker.y + defender.y) / 2) + 30,
				z: Math.floor((attacker.z + defender.z) / 2),
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				y: Math.floor((attacker.y + defender.y) / 2) - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				y: defender.y - 20,
				scale: 4,
				opacity: 0,
			}, 'decel');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
			}, 'accel', 'fade');
		},
	},
	icebeam: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 4; i++) {
				scene.showEffect('icicle', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.5,
					opacity: 0.6,
					time: 40 * i,
				}, {
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');

			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 650,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
		},
	},
	freezingglare: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 4; i++) {
				scene.showEffect('pinkicicle', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.5,
					opacity: 0.6,
					time: 40 * i,
				}, {
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');

			scene.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 4,
				opacity: 0,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 4,
				opacity: 0,
				time: 650,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 4,
				opacity: 0,
				time: 700,
			}, 'linear', 'fade');
		},
	},
	freezedry: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700,
			}, 'linear', 'explode');

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.4,
				opacity: 0.3,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 3,
				opacity: 0.6,
				time: 700,
			}, 'linear', 'explode');
		},
	},
	icywind: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1.7,
					opacity: 0.3,
				}, {
					x: defender.x + 10,
					y: defender.y + 5,
					z: defender.behind(30),
					scale: 2.5,
					opacity: 0.4,
					time: 400,
				}, 'linear', 'explode');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1.7,
					opacity: 0.3,
					time: 100,
				}, {
					x: defender.x - 10,
					y: defender.y - 5,
					z: defender.behind(30),
					scale: 2.5,
					opacity: 0.4,
					time: 500,
				}, 'linear', 'explode');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1.7,
					opacity: 0.3,
					time: 200,
				}, {
					x: defender.x,
					y: defender.y + 5,
					z: defender.behind(30),
					scale: 2.5,
					opacity: 0.4,
					time: 600,
				}, 'linear', 'explode');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 1.7,
					opacity: 0.3,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y + 5,
					z: defender.behind(30),
					scale: 2.5,
					opacity: 0.4,
					time: 700,
				}, 'linear', 'explode');

				scene.showEffect('icicle', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.2,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.behind(20),
					opacity: 0.6,
					time: 400,
				}, 'linear', 'fade');
				scene.showEffect('icicle', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.2,
					time: 200,
				}, {
					x: defender.x - 10,
					y: defender.y + 5,
					z: defender.behind(20),
					opacity: 0.6,
					time: 600,
				}, 'linear', 'fade');
				scene.showEffect('icicle', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.2,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y - 5,
					z: defender.behind(20),
					opacity: 0.6,
					time: 700,
				}, 'linear', 'fade');
			}
		},
	},
	ancientpower: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.2,
			}, {
				x: defender.x + 50,
				y: defender.y + 20,
				z: defender.behind(20),
				opacity: 0.6,
				scale: 0.7,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.2,
			}, {
				x: defender.x + 40,
				y: defender.y - 30,
				z: defender.behind(20),
				opacity: 0.6,
				scale: 0.7,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.2,
				opacity: 0.7,
			}, {
				x: defender.x - 50,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				scale: 0.8,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	powergem: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 45,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x - 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x + 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');

			scene.showEffect('shine', {
				x: attacker.x,
				y: attacker.y + 45,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('shine', {
				x: attacker.x - 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('shine', {
				x: attacker.x + 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');

			scene.showEffect('iceball', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 300,
			}, {
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 400,
			}, {
				scale: 2,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(325);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	chargebeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350,
			}, 'linear', 'explode');
		},
	},
	psybeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350,
			}, 'linear', 'explode');
		},
	},
	twinbeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 450,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 550,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 750,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 800,
			}, 'linear', 'explode');
		},
	},
	flamethrower: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 500,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 600,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.7,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 700,
			}, 'decel', 'explode');
		},
	},
	toxic: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
		},
	},
	spicyextract: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'fade');
		},
	},
	sludge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'fade');
		},
	},
	sludgewave: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(125);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
			}

			const defender = defenders[1] || defenders[0];
			scene.backgroundEffect('#AA00AA', 700, 0.2);
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	smokescreen: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	sludgebomb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	syrupbomb: {
		anim(scene, [attacker, defender]) {
			const imageType = { filter: !attacker.sp.shiny ? 'hue-rotate(-45deg)' : 'hue-rotate(30deg)' };
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode', imageType);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode', imageType);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode', imageType);
		},
	},
	mudbomb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	magnetbomb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	seedbomb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	willowisp: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0,
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 500,
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			scene.showEffect('bluefireball', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.8,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 700,
			}, 'swing', 'fade');
			scene.showEffect('bluefireball', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 700,
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 900,
			}, 'swing', 'explode');
		},
	},
	confuseray: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.15,
				opacity: 0,
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 500,
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.15,
				opacity: 0,
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700,
			}, 'swing', 'fade');
			scene.showEffect('electroball', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 700,
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 900,
			}, 'swing', 'explode');
		},
	},
	lovelykiss: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('heart', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0,
			}, {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.7,
				opacity: 0.7,
				time: 500,
			}, 'decel', 'fade');
			if (defender.isMissedPokemon) return;
			scene.showEffect('heart', {
				x: defender.leftof(40),
				y: defender.y + 15,
				z: defender.z,
				scale: 0.7,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, 'swing', 'fade');
			scene.showEffect('heart', {
				x: defender.leftof(-40),
				y: defender.y,
				z: defender.z,
				scale: 0.7,
				opacity: 0,
				time: 700,
			}, {
				x: defender.leftof(10),
				y: defender.y - 15,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'swing', 'explode');
		},
	},
	rockwrecker: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.7);
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 20,
				opacity: 0,
				time: 350,
			}, 'decel');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 350,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.2,
				opacity: 1,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.2,
				opacity: 0.2,
				time: 600,
			}, 'linear', 'explode');

			defender.delay(600);
			defender.anim({
				z: defender.behind(20),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	stoneedge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rock3', {
				x: defender.x + 15,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 350,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 150,
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 300,
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 650,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 400,
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 750,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 15,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.5,
				time: 500,
			}, {
				y: defender.y + 60,
				yscale: 1,
				opacity: 0,
				time: 850,
			}, 'accel');
		},
	},
	rockslide: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(200);
				defender.anim({
					y: defender.y - 7,
					yscale: 0.9,
					time: 100,
				}, 'decel');
				defender.anim({
					time: 200,
				});
				defender.delay(200);
				defender.anim({
					y: defender.y - 7,
					yscale: 0.9,
					time: 100,
				}, 'decel');
				defender.anim({
					time: 200,
				});

				scene.showEffect('rock1', {
					x: defender.x + 15,
					y: defender.y + 100,
					z: defender.z,
					opacity: 0,
					scale: 0.5,
				}, {
					y: defender.y - 30,
					opacity: 1,
					time: 300,
				}, 'accel', 'explode');
				scene.showEffect('rock2', {
					x: defender.x + 30,
					y: defender.y + 100,
					z: defender.z,
					opacity: 0,
					scale: 0.5,
					time: 100,
				}, {
					y: defender.y - 30,
					opacity: 1,
					time: 400,
				}, 'accel', 'explode');
				scene.showEffect('rock1', {
					x: defender.x - 30,
					y: defender.y + 100,
					z: defender.z,
					opacity: 0,
					scale: 0.5,
					time: 200,
				}, {
					y: defender.y - 30,
					opacity: 1,
					time: 500,
				}, 'accel', 'explode');
				scene.showEffect('rock2', {
					x: defender.x,
					y: defender.y + 100,
					z: defender.z,
					opacity: 0,
					scale: 0.5,
					time: 300,
				}, {
					y: defender.y - 30,
					opacity: 1,
					time: 600,
				}, 'accel', 'explode');
				scene.showEffect('rock1', {
					x: defender.x - 15,
					y: defender.y + 100,
					z: defender.z,
					opacity: 0,
					scale: 0.5,
					time: 400,
				}, {
					y: defender.y - 30,
					opacity: 1,
					time: 700,
				}, 'accel', 'explode');

				scene.showEffect('mudwisp', {
					x: defender.x + 40,
					y: defender.y - 40,
					z: defender.z,
					scale: 0,
					opacity: 0.4,
					time: 300,
				}, {
					scale: 2,
					opacity: 0,
				}, 'decel');
				scene.showEffect('mudwisp', {
					x: defender.x - 40,
					y: defender.y - 40,
					z: defender.z,
					scale: 0,
					opacity: 0.4,
					time: 450,
				}, {
					scale: 2,
					opacity: 0,
				}, 'decel');
				scene.showEffect('mudwisp', {
					x: defender.x + 10,
					y: defender.y - 40,
					z: defender.z,
					scale: 0,
					opacity: 0.4,
					time: 600,
				}, {
					scale: 2,
					opacity: 0,
				}, 'decel');
			}
		},
	},
	avalanche: {
		anim(scene, [attacker, defender]) {
			defender.delay(200);
			defender.anim({
				y: defender.y - 7,
				yscale: 0.9,
				time: 100,
			}, 'decel');
			defender.anim({
				time: 200,
			});
			defender.delay(200);
			defender.anim({
				y: defender.y - 7,
				yscale: 0.9,
				time: 100,
			}, 'decel');
			defender.anim({
				time: 200,
			});

			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 300,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 100,
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 400,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 200,
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 500,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 300,
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 600,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y + 100,
				z: defender.z,
				opacity: 0,
				scale: 0.8,
				time: 400,
			}, {
				y: defender.y - 30,
				opacity: 1,
				time: 700,
			}, 'accel', 'explode');

			scene.showEffect('wisp', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 300,
			}, {
				scale: 2,
				opacity: 0,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 450,
			}, {
				scale: 2,
				opacity: 0,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x + 10,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.4,
				time: 600,
			}, {
				scale: 2,
				opacity: 0,
			}, 'decel');
		},
	},
	triplearrows: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 0,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 50,
			}, {
				x: attacker.x - 30,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 350,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 100,
			}, {
				x: attacker.x - 10,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 150,
			}, {
				x: attacker.x + 10,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 450,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 175,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.behind(-10),
				scale: 0.2,
				opacity: 0,
				time: 550,
			}, 'decel', 'fade');

			scene.showEffect('flareball', {
				x: defender.x - 20,
				y: defender.y + 200,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 375,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 675,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 390,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 675,
			}, 'linear');

			scene.showEffect('flareball', {
				x: defender.x + 40,
				y: defender.y + 200,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 525,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 800,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x + 40,
				y: defender.y - 50,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 540,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('flareball', {
				x: defender.x - 70,
				y: defender.y + 200,
				z: defender.behind(-10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 575,
			}, {
				y: defender.y + 150,
				z: defender.behind(-10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x - 70,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 590,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 825,
			}, 'linear');

			scene.showEffect('flareball', {
				x: defender.x + 70,
				y: defender.y + 200,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 650,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 950,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x + 70,
				y: defender.y - 50,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 665,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 950,
			}, 'linear');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 700,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1000,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 720,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1000,
			}, 'linear');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 725,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1025,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 740,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1025,
			}, 'linear');
		},
	},
	thousandarrows: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(425);
				defender.anim({
					x: defender.x - 5,
					time: 75,
				}, 'swing');
				defender.anim({
					x: defender.x + 5,
					time: 75,
				}, 'swing');
				defender.anim({
					x: defender.x - 5,
					time: 75,
				}, 'swing');
				defender.anim({
					x: defender.x + 5,
					time: 75,
				}, 'swing');
				defender.anim({
					x: defender.x - 5,
					time: 75,
				}, 'swing');
				defender.anim({
					x: defender.x + 5,
					time: 75,
				}, 'swing');
				defender.anim({
					time: 100,
				}, 'accel');
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#000000', 1100, 0.3);
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 0,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 50,
			}, {
				x: attacker.x - 30,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 350,
			}, 'decel');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 100,
			}, {
				x: attacker.x - 10,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 150,
			}, {
				x: attacker.x + 10,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 450,
			}, 'decel');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 175,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.behind(-10),
				scale: 0.2,
				opacity: 0,
				time: 550,
			}, 'decel', 'fade');

			scene.showEffect('energyball', {
				x: defender.x - 20,
				y: defender.y + 200,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 375,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 675,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 390,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 675,
			}, 'linear');

			scene.showEffect('energyball', {
				x: defender.x + 40,
				y: defender.y + 200,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 525,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 800,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x + 40,
				y: defender.y - 50,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 540,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('energyball', {
				x: defender.x - 70,
				y: defender.y + 200,
				z: defender.behind(-10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 575,
			}, {
				y: defender.y + 150,
				z: defender.behind(-10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x - 70,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 590,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 825,
			}, 'linear');

			scene.showEffect('energyball', {
				x: defender.x + 70,
				y: defender.y + 200,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 650,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 950,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x + 70,
				y: defender.y - 50,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 665,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 950,
			}, 'linear');

			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 700,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1000,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 720,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1000,
			}, 'linear');

			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 725,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1025,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 740,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1025,
			}, 'linear');
		},
	},
	thousandwaves: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(825);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#000000', 600, 0.3);
			scene.backgroundEffect('#199C27', 600, 0.5, 500);
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				y: attacker.y - 50,
				scale: 0.1,
				yscale: 0.4,
				opacity: 0.3,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				y: attacker.y + 50,
				scale: 0.1,
				yscale: 0.4,
				opacity: 0.5,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				x: attacker.x - 35,
				y: attacker.y + 30,
				scale: 0.1,
				yscale: 0.4,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 30,
				scale: 0.1,
				yscale: 0.4,
				opacity: 0.4,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				x: attacker.x - 35,
				y: attacker.y - 30,
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0,
				opacity: 0,
			}, {
				x: attacker.x + 35,
				y: attacker.y - 30,
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, 'decel', 'fade');

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.3,
				opacity: 0,
				time: 600,
			}, 'ballistic', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y + 50,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.3,
				opacity: 0,
				time: 620,
			}, 'ballistic', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x - 35,
				y: attacker.y - 10,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.3,
				opacity: 0,
				time: 600,
			}, 'ballistic', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x + 35,
				y: attacker.y - 30,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.3,
				opacity: 0,
				time: 630,
			}, 'ballistic', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x - 35,
				y: attacker.y + 30,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.4,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.3,
				opacity: 0,
				time: 640,
			}, 'ballistic', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x + 35,
				y: attacker.y + 30,
				z: attacker.behind(-30),
				scale: 0.1,
				yscale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.2,
				yscale: 0.4,
				opacity: 0,
				time: 600,
			}, 'ballistic', 'fade');

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.7,
				opacity: 0.3,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y - 10,
				z: defender.behind(30),
				scale: 1.3,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x - 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.7,
				opacity: 0.3,
				time: 600,
			}, {
				x: defender.x - 80,
				y: defender.y - 10,
				z: defender.behind(30),
				scale: 1.3,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x + 5,
				y: attacker.y - 25,
				z: attacker.behind(-70),
				scale: 0.7,
				opacity: 0.3,
				time: 600,
			}, {
				x: defender.x + 55,
				y: defender.y - 10,
				z: defender.behind(30),
				scale: 1.3,
				opacity: 0.6,
			}, 'decel', 'explode');

			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1.5,
				xscale: 6,
				opacity: 0.1,
				time: 900,
			}, {
				scale: 1,
				xscale: 3,
				opacity: 0.6,
				time: 1200,
			}, 'linear', 'fade');

			attacker.anim({
				y: attacker.y - 40,
				scale: 0,
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.delay(900);
			attacker.anim({
				time: 300,
			}, 'linear');
		},
	},
	iciclecrash: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: defender.x + 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: defender.x + 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 100,
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: defender.x - 30,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 200,
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 300,
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('icicle', {
				x: defender.x - 15,
				y: defender.y + 70,
				z: defender.z,
				opacity: 0,
				scale: 1,
				time: 400,
			}, {
				y: defender.y - 20,
				opacity: 1,
				xscale: 2,
				time: 700,
			}, 'linear', 'explode');
		},
	},
	spore: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: 0.4,
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 30,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: 0.4,
				time: 150,
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 650,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x - 30,
				y: defender.y + 90,
				z: defender.z,
				opacity: 0,
				scale: 0.4,
				time: 300,
			}, {
				y: defender.y - 5,
				opacity: 1,
				time: 800,
			}, 'decel', 'fade');
		},
	},
	fireblast: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 500, 0.7);
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 600, 0.4, 500);
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 550,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 100,
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 60,
				y: defender.y - 80,
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 90,
				y: defender.y + 40,
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear', 'fade');

			defender.delay(500);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	judgment: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 950, 0.6);
			scene.showEffect('wisp', {
				x: defender.x - 100,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 250,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 70,
				y: defender.y - 70,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 350,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 450,
			}, 'decel', 'fade');

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');

			defender.delay(450);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	psystrike: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-psychicterrain.png')`, 950, 0.6);
			scene.showEffect('poisonwisp', {
				x: defender.x - 100,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 250,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 70,
				y: defender.y - 70,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 350,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x,
				y: defender.y,
				scale: 1,
				opacity: 1,
				time: 450,
			}, 'decel', 'fade');

			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 950,
			}, 'linear', 'fade');

			defender.delay(450);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	shadowball: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1000, 0.1);
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.behind(-20),
				scale: 0.5,
				opacity: 0,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1,
				opacity: 0.8,
				time: 200,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 60,
				y: attacker.y - 80,
				z: attacker.behind(-20),
				scale: 0.5,
				opacity: 0,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1,
				opacity: 0.8,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 60,
				y: attacker.y - 80,
				z: attacker.behind(-20),
				scale: 0.5,
				opacity: 0,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1,
				opacity: 0.8,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 90,
				y: attacker.y + 40,
				z: attacker.behind(-20),
				scale: 0.5,
				opacity: 0,
				time: 150,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1,
				opacity: 0.8,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 90,
				y: attacker.y + 40,
				z: attacker.behind(-20),
				scale: 0.5,
				opacity: 0,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 1,
				opacity: 0.8,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 0.8,
				opacity: 0.5,
				time: 600,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0,
				time: 0,
			}, {
				scale: 1.5,
				opacity: 0.8,
				time: 600,
			}, 'decel', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.8,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 900,
			}, 'accel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 1.5,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				time: 900,
			}, 'accel', 'explode');

			defender.delay(900);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	hex: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');

			scene.showEffect('bluefireball', {
				x: defender.x + 40,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.8,
				opacity: 0.5,
				time: 0,
			}, {
				y: defender.y + 60,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('bluefireball', {
				x: defender.x - 40,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.8,
				opacity: 0.5,
				time: 200,
			}, {
				y: defender.y + 60,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y + 40,
				z: defender.z,
				scale: 0.8,
				opacity: 0.5,
				time: 400,
			}, {
				y: defender.y + 60,
				opacity: 0,
				time: 800,
			}, 'accel');
		},
	},
	infernalparade: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#BB59FF', 1000, 0.4);

			for (const axis of ['x', 'y', '']) {
				scene.showEffect('shadowball', {
					x: attacker.x + (axis !== 'y' ? 50 : 0),
					y: attacker.y + (axis !== 'x' ? 50 : 0),
					z: attacker.z,
					scale: 0.5,
					opacity: 0.5,
					time: 0,
				}, {
					opacity: 0,
					time: 600,
				}, 'accel');
				scene.showEffect('bluefireball', {
					x: attacker.x + (axis !== 'y' ? 50 : 0),
					y: attacker.y + (axis !== 'x' ? 50 : 0),
					z: attacker.z,
					scale: 0.5,
					opacity: 0.5,
					time: 0,
				}, {
					opacity: 0,
					time: 600,
				}, 'accel');
				scene.showEffect('shadowball', {
					x: attacker.x + (axis !== 'y' ? 50 : 0),
					y: attacker.y + (axis !== 'x' ? 50 : 0),
					z: attacker.z,
					scale: 0.5,
					opacity: 0,
					time: 600,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.5,
					time: 1200,
				}, 'accel');
				scene.showEffect('bluefireball', {
					x: attacker.x + (axis !== 'y' ? 50 : 0),
					y: attacker.y + (axis !== 'x' ? 50 : 0),
					z: attacker.z,
					scale: 0.5,
					opacity: 0,
					time: 600,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.5,
					time: 1200,
				}, 'accel');
			}

			defender.delay(900);
			defender.anim({
				z: defender.behind(10),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	darkpulse: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('#000000', 900, 0.3);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.8,
				time: 0,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			for (let i = 0; i < 4; i++) {
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.4,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.7,
					opacity: 0.4,
					time: 600,
				}, 'accel', 'fade');
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 0.4,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.5,
					opacity: 0.4,
					time: 600,
				}, 'accel', 'fade');
			}
		},
	},
	fierywrath: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				let xf = [1, -1, 1, -1];
				let yf = [1, -1, -1, 1];
				let xf2 = [1, 0, -1, 0];
				let yf2 = [0, 1, 0, -1];

				scene.backgroundEffect('#000000', 900, 0.3);
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y - 50,
					z: attacker.z,
					scale: 1,
					xscale: 5,
					opacity: 0.8,
					time: 0,
				}, {
					scale: 2,
					xscale: 8,
					opacity: 0.1,
					time: 800,
				}, 'linear', 'fade');
				scene.showEffect('flareball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					opacity: 0.3,
					scale: 0,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0,
					time: 600,
				}, 'linear');
				scene.showEffect('shadowball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					opacity: 0.3,
					scale: 0,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0,
					time: 800,
				}, 'linear');
				for (let i = 0; i < 4; i++) {
					scene.showEffect('flareball', {
						x: attacker.x,
						y: attacker.y,
						z: attacker.z,
						scale: 0.3,
						opacity: 0.4,
					}, {
						x: attacker.x + 240 * xf[i],
						y: attacker.y,
						z: attacker.z + 137 * yf[i],
						scale: 0.7,
						opacity: 0.4,
						time: 600,
					}, 'accel', 'fade');
					scene.showEffect('poisonwisp', {
						x: attacker.x,
						y: attacker.y,
						z: attacker.z,
						scale: 0.2,
						opacity: 0.4,
					}, {
						x: attacker.x + 339 * xf2[i],
						y: attacker.y,
						z: attacker.z + 194 * yf2[i],
						scale: 0.5,
						opacity: 0.4,
						time: 600,
					}, 'accel', 'fade');
				}
			}
		},
	},
	terrainpulse: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.8,
				time: 0,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			for (let i = 0; i < 4; i++) {
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.4,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.7,
					opacity: 0.4,
					time: 600,
				}, 'accel', 'fade');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 0.4,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.5,
					opacity: 0.4,
					time: 600,
				}, 'accel', 'fade');
			}
		},
	},
	naturesmadness: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 800, 0.1);
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.6,
				time: 0,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 5,
				opacity: 0,
				time: 200,
			}, {
				scale: 0.5,
				opacity: 0.6,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 5,
				opacity: 0,
				time: 350,
			}, {
				scale: 0.5,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	ruination: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 800, 0.1);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 1,
				xscale: 5,
				opacity: 0.6,
				time: 0,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 5,
				opacity: 0,
				time: 200,
			}, {
				scale: 0.5,
				opacity: 0.6,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 5,
				opacity: 0,
				time: 350,
			}, {
				scale: 0.5,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');
		},
	},
	energyball: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.3,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.3,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 600,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.3,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 600,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.3,
				time: 800,
			}, 'accel', 'explode');

			defender.delay(400);
			defender.anim({
				z: defender.behind(5),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	electroball: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');

			defender.delay(500);
			defender.anim({
				z: defender.behind(5),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	moonblast: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 800, 0.6);
			scene.showEffect('moon', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.9,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 500,
			}, 'linear', 'explode');

			scene.showEffect('wisp', {
				x: 0,
				y: +175,
				z: +50,
				scale: 1.5,
				opacity: 1,
			}, {
				time: 800,
			}, 'accel', 'fade');
			scene.showEffect('iceball', {
				x: 0,
				y: +175,
				z: +50,
				scale: 0.5,
				opacity: 0.8,
			}, {
				time: 800,
			}, 'accel', 'fade');

			defender.delay(500);
			defender.anim({
				z: defender.behind(5),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	mistball: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.8,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				scale: 1,
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x - 60,
				y: defender.y + 80,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x + 60,
				y: defender.y - 80,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x + 90,
				y: defender.y + 40,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x - 90,
				y: defender.y - 40,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y + 100,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y - 100,
				scale: 0.9,
				opacity: 0,
				time: 1050,
			}, 'linear', 'fade');

			defender.delay(500);
			defender.anim({
				z: defender.behind(5),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	present: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
		},
	},
	iceball: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 500,
			}, 'ballistic', 'explode');
		},
	},
	weatherball: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y + 90,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, {
				y: defender.y,
				opacity: 1,
				time: 1000,
			}, 'linear', 'explode');
		},
	},
	flowertrick: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`#000000`, 1000, 0.4);
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
			}, 'linear');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y + 90,
				z: defender.z,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, {
				y: defender.y,
				opacity: 1,
				time: 1000,
			}, 'linear', 'explode');
		},
	},
	wish: {
		anim(scene, [attacker]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 600, 0.4);

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				y: attacker.y + 130,
				opacity: 0,
			}, 'accel');
		},
		residualAnim(scene, [attacker]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 600, 0.4);

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				scale: 1,
				opacity: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
			}, 'decel', 'explode');

			scene.timeOffset += 500;
		},
	},
	healingwish: {
		anim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				opacity: 0,
			}, 'accel');
		},
		residualAnim(scene, [attacker]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 130,
				z: attacker.z,
				scale: 1,
				opacity: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
			}, 'decel', 'explode');
		},
	},
	stealthrock: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: defender.leftof(-40),
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 75,
			}, {
				x: defender.leftof(-20),
				y: defender.y - 40,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 150,
			}, {
				x: defender.leftof(30),
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 225,
			}, {
				x: defender.leftof(10),
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, 'ballistic');
		},
	},
	gmaxsteelsurge: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1200, 0.3);
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear');

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 2,
				opacity: 0.5,
				time: 650,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 500,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 650,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 550,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 700,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 750,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 650,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 800,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 700,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 850,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 750,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 900,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 800,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 950,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 900,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 1050,
			}, 'accel');

			attacker.anim({
				y: defender.y + 120,
				xscale: 0,
				yscale: 0,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(825);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				xscale: 1,
				yscale: 1,
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(625);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(15),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 350,
			}, 'swing');

			scene.showEffect('greenmetal1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: defender.leftof(-30),
				y: defender.y - 20,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('greenmetal2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250,
			}, {
				x: defender.leftof(35),
				y: defender.y - 15,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('greenmetal1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125,
			}, {
				x: defender.leftof(50),
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
		},
	},
	spikes: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: -25,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125,
			}, {
				x: +50,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('caltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250,
			}, {
				x: +30,
				y: defender.y - 45,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
		},
	},
	toxicspikes: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisoncaltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: +5,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
			scene.showEffect('poisoncaltrop', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 200,
			}, {
				x: -15,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.3,
				opacity: 1,
			}, 'ballistic');
		},
	},
	stickyweb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: 0,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
			}, 'ballistic');
		},
	},
	leechseed: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
			}, 'ballistic');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 125,
			}, {
				x: defender.x + 40,
				y: defender.y - 35,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
			}, 'ballistic');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
				time: 250,
			}, {
				x: defender.x + 20,
				y: defender.y - 25,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
			}, 'ballistic');
		},
	},
	mysticalpower: {
		anim(scene, [attacker]) {
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				z: attacker.behind(-50),
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
	},
	psyshock: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
		},
	},
	barbbarrage: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 8; i++) {
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 0,
				}, {
					x: attacker.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: attacker.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: attacker.z,
					opacity: 0,
					time: 500,
				}, 'decel');
				scene.showEffect('poisonwisp', {
					x: defender.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: defender.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: defender.z,
					scale: 0.4,
					opacity: 0.6,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					time: 1000,
				}, 'decel');
			}
		},
	},
	esperwing: {
		anim(scene, [attacker, defender]) {
			for (let i = 0; i < 8; i++) {
				scene.showEffect(i % 2 === 0 ? 'poisonwisp' : 'mistball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 0,
				}, {
					x: attacker.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: attacker.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: attacker.z,
					opacity: 0,
					time: 500,
				}, 'decel');
				scene.showEffect('feather', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 0.6,
					time: 0,
				}, {
					x: attacker.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: attacker.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: attacker.z,
					opacity: 0,
					time: 500,
				}, 'decel');
				scene.showEffect(i % 2 === 0 ? 'poisonwisp' : 'mistball', {
					x: attacker.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: attacker.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					time: 1000,
				}, 'accel', 'explode');
				scene.showEffect('feather', {
					x: attacker.x + (![0, 4].includes(i) ? (50 * (i > 4 ? -1 : 1)) : 0),
					y: attacker.y + (![2, 6].includes(i) ? (50 * (i > 2 && i < 6 ? -1 : 1)) : 0),
					z: attacker.z,
					scale: 0.2,
					opacity: 0.6,
					time: 500,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					time: 1000,
				}, 'accel', 'explode');
			}
		},
	},
	sandtomb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mudwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('mudwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
		},
	},
	saltcure: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
		},
	},
	flashcannon: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 250,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 350,
			}, 'linear', 'explode');
		},
	},
	lusterpurge: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#ffffff', 600, 0.6);
			scene.showEffect('wisp', {
				x: attacker.leftof(-10),
				y: attacker.y + 10,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.5,
			}, {
				scale: 15,
				opacity: 0.8,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 175,
			}, {
				scale: 1,
				opacity: 0,
				time: 375,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 25,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 300,
			}, {
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y + 10,
				z: defender.behind(5),
				scale: 0.7,
				opacity: 0.2,
				time: 400,
			}, {
				scale: 1,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 2,
				y: defender.y + 5,
				z: defender.behind(5),
				scale: 1,
				opacity: 0.2,
				time: 500,
			}, {
				scale: 1.25,
				opacity: 0,
				time: 700,
			}, 'linear');

			attacker.anim({
				opacity: 0,
				time: 75,
			});
			attacker.delay(500);
			attacker.anim({
				opacity: 1,
				time: 100,
			});
			defender.delay(200);
			defender.anim({
				x: defender.x - 30,
				time: 75,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	grassknot: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x + 30,
				y: defender.y - 30,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 50,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 200,
			}, {
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('leaf1', {
				x: defender.x + 30,
				y: defender.y - 30,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 50,
			}, {
				y: defender.y - 40,
				scale: 3,
				opacity: 0,
			}, 'decel');
			scene.showEffect('leaf2', {
				x: defender.x - 30,
				y: defender.y - 40,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 200,
			}, {
				y: defender.y - 50,
				scale: 3,
				opacity: 0,
			}, 'decel');
		},
	},
	aeroblast: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.behind(50) - attacker.z) / 5;

			scene.backgroundEffect('#000000', 700, 0.6);

			for (let i = 0; i < 5; i++) {
				scene.showEffect('wisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1,
					opacity: 1,
					time: 20 * i,
				}, {
					scale: 3,
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	airslash: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 400,
			}, 'linear', 'fade');
		},
	},
	aircutter: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, {
				x: defender.x - 60,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 60,
				y: defender.y + 50,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 60,
				y: defender.y + 50,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 400,
			}, 'linear', 'fade');
		},
	},
	dracometeor: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 1100, 0.8);
			scene.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x + 50,
				y: defender.y,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y + 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y - 5,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 300,
			}, {
				x: defender.x + 30,
				y: defender.y - 10,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x + 30,
				y: defender.y,
				scale: 1.5,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y + 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 150,
			}, {
				x: defender.x - 20,
				y: defender.y - 5,
				scale: 1.5,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 300,
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1.5,
				opacity: 0.4,
			}, 'accel', 'explode');

			scene.showEffect('shadowball', {
				x: defender.x + 30,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 650,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 850,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 650,
			}, {
				scale: 4,
				opacity: 0,
				time: 850,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x + 20,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 700,
			}, {
				scale: 4,
				opacity: 0,
				time: 900,
			}, 'linear');

			scene.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 150,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 50,
			}, {
				x: defender.x - 250,
				y: defender.y - 80,
				z: defender.behind(60),
				scale: 0.8,
				opacity: 0,
			}, 'accel', 'fade');
			scene.showEffect('rock3', {
				x: defender.leftof(-220),
				y: defender.y + 20 + 130,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x + 80,
				y: defender.y - 50,
				z: defender.behind(30),
				scale: 0.8,
				opacity: 0,
			}, 'accel', 'fade');
			scene.showEffect('rock3', {
				x: defender.leftof(-180),
				y: defender.y + 20 + 130,
				z: defender.z,
				scale: 0.1,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x - 200,
				y: defender.y + 20,
				z: defender.behind(30),
				scale: 0.8,
				opacity: 0,
			}, 'accel', 'fade');

			defender.delay(500);
			defender.anim({
				x: defender.x + 30,
				z: defender.behind(10),
				time: 75,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				z: defender.behind(10),
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	makeitrain: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#000000', 1300, 0.2);
			for (const defender of defenders) {
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 2,
					opacity: 0,
				}, {
					scale: 0,
					opacity: 1,
				}, 'accel', 'explode');

				for (let i = 1; i <= 8; i++) {

					const hitPos = (-1) ** i * (32 - i * 8);

					scene.showEffect('electroball', {
						x: attacker.x,
						y: attacker.y,
						z: attacker.z,
						scale: 0.2,
						opacity: 0.7,
						time: 75 * i + 500,
					}, {
						x: defender.x + hitPos,
						y: defender.y - hitPos,
						z: defender.z,
						scale: 0.4,
						opacity: 0.4,
						time: 75 * i + 700,
					}, 'decel', 'explode');

					scene.showEffect('shine', {
						x: defender.x + hitPos,
						y: defender.y - hitPos,
						z: defender.z,
						scale: 0.5,
						opacity: 0.8,
						time: 75*i + 700,
					}, {
						opacity: 0,
						time: 75 * i + 800,
					}, 'accel', 'fade');
				}

				defender.delay(700);

				for (let i = 1; i <= 3; i++) {
					defender.anim({
						z: defender.behind(5),
						time: 75,
					}, 'swing');
					defender.anim({
						time: 75,
					}, 'swing');
				}

				defender.anim({
					z: defender.behind(10),
					time: 100,
				}, 'swing');
				defender.anim({
					time: 150,
				}, 'swing');
			}
		},
	},
	brine: {
		anim: BattleOtherAnims.hydroshot.anim,
	},
	octazooka: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	waterpledge: {
		anim: BattleOtherAnims.hydroshot.anim,
	},
	soak: {
		anim: BattleOtherAnims.hydroshot.anim,
	},
	watersport: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
			}, 'ballistic', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
			}, 'ballistic', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
			}, 'ballistic', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
			}, 'ballistic', 'explode');
		},
	},
	scald: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.hydroshot.anim(scene, [attacker, defender]);
			scene.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 1000,
			}, 'linear', 'fade');
		},
	},
	steameruption: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#0000DD', 700, 0.2);
			BattleOtherAnims.hydroshot.anim(scene, [attacker, defender]);
			defender.delay(200);
			defender.anim({
				z: defender.behind(20),
				time: 400,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y,
				z: defender.behind(10),
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.behind(15),
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.behind(20),
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 1000,
			}, 'linear', 'fade');
		},
	},
	waterpulse: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.8,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.7,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.7,
				time: 400,
			}, 'decel', 'explode');
		},
	},
	bubblebeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
				opacity: 0.6,
				time: 400,
			}, 'decel', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 100,
			}, {
				x: defender.x + 20,
				y: defender.y - 10,
				z: defender.behind(0),
				opacity: 0.6,
				time: 500,
			}, 'decel', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 200,
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.behind(0),
				opacity: 0.6,
				time: 600,
			}, 'decel', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.7,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(0),
				opacity: 0.6,
				time: 700,
			}, 'decel', 'explode');
		},
	},
	surf: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(125);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#0000DD', 700, 0.2);
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	hydropump: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#0000DD', 700, 0.2);
			BattleOtherAnims.hydroshot.anim(scene, [attacker, defender]);
			defender.delay(200);
			defender.anim({
				z: defender.behind(20),
				time: 400,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	muddywater: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(125);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#996600', 700, 0.2);
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 60,
				y: defender.y,
				z: defender.behind(50),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	mudshot: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('mudwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	lavaplume: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				scene.showEffect('fireball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.1,
					opacity: 1,
				}, {
					x: defender.x + 30,
					y: defender.y + 20,
					z: defender.z,
					scale: 1,
					opacity: 0.7,
				}, 'ballistic', 'explode');
				scene.showEffect('fireball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.1,
					opacity: 1,
					time: 75,
				}, {
					x: defender.x + 20,
					y: defender.y - 20,
					z: defender.z,
					scale: 1,
					opacity: 0.7,
				}, 'ballistic', 'explode');
				scene.showEffect('fireball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.1,
					opacity: 1,
					time: 150,
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.z,
					scale: 1,
					opacity: 0.7,
				}, 'ballistic', 'explode');
				scene.showEffect('fireball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.1,
					opacity: 1,
					time: 225,
				}, {
					x: defender.x - 10,
					y: defender.y + 5,
					z: defender.z,
					scale: 1,
					opacity: 0.7,
				}, 'ballistic', 'explode');
			}
		},
	},
	dragonenergy: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(625);
				defender.anim({
					x: defender.x - 30,
					time: 75,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x - 30,
					time: 100,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x,
					time: 100,
				});
				let xstep = (defender.x - attacker.x) / 5;
				let ystep = (defender.y - attacker.y) / 5;
				let zstep = (defender.z - attacker.z) / 5;

				for (let i = 0; i < 5; i++) {
					scene.showEffect('wisp', {
						x: attacker.x + xstep * (i + 1),
						y: attacker.y + ystep * (i + 1),
						z: attacker.z + zstep * (i + 1),
						scale: 1,
						opacity: 1,
						time: 20 * i,
					}, {
						scale: 2,
						opacity: 0,
						time: 40 * i + 600,
					}, 'linear');
					scene.showEffect('poisonwisp', {
						x: attacker.x + xstep * (i + 1),
						y: attacker.y + ystep * (i + 1),
						z: attacker.z + zstep * (i + 1),
						scale: 0.5,
						opacity: 0.3,
						time: 20 * i,
					}, {
						scale: 2,
						opacity: 0,
						time: 40 * i + 600,
					}, 'linear');
				}
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.behind(-15),
					scale: 0.5,
					opacity: 0.6,
				}, {
					scale: 0.6,
					opacity: 0.2,
					time: 400,
				}, 'linear', 'fade');

				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.1,
					time: 0,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					time: 200,
				}, 'linear', 'explode');
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.1,
					time: 100,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					time: 300,
				}, 'linear', 'explode');
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.1,
					time: 200,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					time: 400,
				}, 'linear', 'explode');
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.1,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 1,
					time: 500,
				}, 'linear', 'explode');
			}
		},
	},
	eruption: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(625);
				defender.anim({
					x: defender.x - 30,
					time: 75,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x - 30,
					time: 100,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x,
					time: 100,
				});
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 1100, 0.4);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');

			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 50,
			}, {
				x: attacker.x - 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 350,
			}, 'decel', 'fade');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 150,
			}, {
				x: attacker.x + 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 450,
			}, 'decel', 'fade');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');

			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x + 45,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 600,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675,
			}, 'accel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 750,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525,
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525,
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825,
			}, 'accel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 575,
			}, {
				x: defender.x - 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 875,
			}, 'accel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 650,
			}, {
				x: defender.x + 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 950,
			}, 'accel', 'explode');
		},
	},
	waterspout: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.delay(625);
				defender.anim({
					x: defender.x - 30,
					time: 75,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x - 30,
					time: 100,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x,
					time: 100,
				});
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#0000DD', 1100, 0.2);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0,
			}, 'linear', 'fade');

			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 0,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 50,
			}, {
				x: attacker.x - 30,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 350,
			}, 'decel', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: attacker.x - 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.9,
				opacity: 0.6,
				time: 150,
			}, {
				x: attacker.x + 10,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0,
				time: 450,
			}, 'decel', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: attacker.x + 35,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');

			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x + 45,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 600,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 675,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 750,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525,
			}, {
				x: defender.x - 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 525,
			}, {
				x: defender.x + 40,
				y: defender.y + 5,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 825,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 575,
			}, {
				x: defender.x - 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 875,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 175,
				z: attacker.behind(-90),
				scale: 0.4,
				opacity: 1,
				time: 650,
			}, {
				x: defender.x + 70,
				y: defender.y + 5,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 950,
			}, 'accel', 'explode');
		},
	},
	solarbeam: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-sunnyday.jpg')`, 900, 0.5);

			for (let i = 0; i < 5; i++) {
				scene.showEffect('energyball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.7,
					opacity: 0.6,
					time: 40 * i + 300,
				}, {
					opacity: 0,
					time: 100 * i + 500,
				}, 'linear');
			}

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.75,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.25,
				opacity: 0,
				time: 200,
			}, 'decel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.5,
				opacity: 0,
				time: 200,
			}, 'decel');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 425,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 625,
			}, 'linear', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 650,
			}, 'linear', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 775,
			}, 'linear', 'explode');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
	},
	electroshot: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect('#000000', 900, 0.5);

			for (let i = 0; i < 5; i++) {
				scene.showEffect('electroball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.7,
					opacity: 0.6,
					time: 40 * i + 300,
				}, {
					opacity: 0,
					time: 100 * i + 500,
				}, 'linear', '', { filter: 'hue-rotate(120deg)' });
			}

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.75,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.25,
				opacity: 0,
				time: 200,
			}, 'decel', '', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.5,
				opacity: 0,
				time: 200,
			}, 'decel');

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 425,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 625,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 650,
			}, 'linear', 'explode', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 700,
			}, 'linear', 'explode', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 775,
			}, 'linear', 'explode');
		},
		prepareAnim(scene, [attacker]) {
			scene.showEffect('electroball', {
				x: attacker.x - 60,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x + 60,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 300,
			}, 'linear', 'fade', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x - 30,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 400,
			}, 'linear', 'fade', { filter: 'hue-rotate(120deg)' });
			scene.showEffect('electroball', {
				x: attacker.x - 70,
				y: attacker.y - 50,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.7,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				scale: 0.2,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade', { filter: 'hue-rotate(120deg)' });
		},
	},
	solarblade: {
		anim(scene, [attacker, defender]) {
			let xstep = 0;
			let ystep = 20;
			let zstep = 0;

			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-sunnyday.jpg')`, 900, 0.5);

			scene.showEffect('sword', {
				x: attacker.leftof(10),
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 10,
				scale: 1,
				opacity: 0.4,
				time: 300,
			}, 'decel', 'fade');

			for (let i = 0; i < 5; i++) {
				scene.showEffect('wisp', {
					x: attacker.leftof(10) + xstep * (i + 1),
					y: attacker.y - 20 + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.5,
					opacity: 1,
					time: 40 * i + 0,
				}, {
					opacity: 0,
					time: 45 * i + 500,
				}, 'linear');
			}

			scene.showEffect('flareball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 900,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 900,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 700,
			}, {
				scale: 2,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 3,
				opacity: 0.6,
				time: 600,
			}, {
				scale: 3.5,
				opacity: 0,
				time: 1000,
			}, 'accel', 'fade');

			defender.delay(550);
			defender.anim({
				z: defender.behind(20),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
	},
	lightofruin: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.2);
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 3,
				opacity: 2,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 200,
			}, 'accel');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 275,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 475,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 350,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 425,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 625,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 775,
			}, 'linear', 'explode');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 750,
			}, {
				scale: 4,
				opacity: 0,
				time: 950,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 800,
			}, {
				scale: 4,
				opacity: 0,
				time: 1000,
			}, 'linear');

			defender.delay(325);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	meteorbeam: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-sandstorm.png')`, 900, 0.5);

			for (let i = 0; i < 5; i++) {
				scene.showEffect('mudwisp', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.7,
					opacity: 0.6,
					time: 40 * i + 300,
				}, {
					opacity: 0,
					time: 100 * i + 500,
				}, 'linear');
			}

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.75,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.25,
				opacity: 0,
				time: 200,
			}, 'decel');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.5,
				opacity: 0,
				time: 200,
			}, 'decel');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 425,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 625,
			}, 'linear', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 450,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 650,
			}, 'linear', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 575,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 775,
			}, 'linear', 'explode');
		},
		prepareAnim: BattleOtherAnims.chargestatus.anim,
	},
	blizzard: { // todo: better blizzard anim
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#009AA4', 700, 0.5);
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('icicle', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
		},
	},
	sheercold: { // Reminder: Improve this later
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/sprites/gen6bgs/bg-icecave.jpg')`, 1000, 0.6);
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				xscale: 2,
				yscale: 5,
				opacity: 0.6,
			}, {
				xscale: 2.2,
				yscale: 5.25,
				scale: 0.6,
				time: 800,
			}, 'linear', 'explode');
		},
	},
	glaciallance: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/sprites/gen6bgs/bg-icecave.jpg')`, 1000, 0.6);
			for (const defender of defenders) {
				scene.showEffect('icicle', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					xscale: 2,
					yscale: 5,
					opacity: 0.6,
				}, {
					xscale: 2.2,
					yscale: 5.25,
					scale: 0.6,
					time: 800,
				}, 'linear', 'explode');
				let xstep = (defender.x - attacker.x) / 5;
				let ystep = (defender.y - attacker.y) / 5;
				let zstep = (defender.z - attacker.z) / 5;

				for (let i = 0; i < 4; i++) {
					scene.showEffect('icicle', {
						x: attacker.x + xstep * (i + 1),
						y: attacker.y + ystep * (i + 1),
						z: attacker.z + zstep * (i + 1),
						scale: 1.5,
						opacity: 0.6,
						time: 40 * i,
					}, {
						opacity: 0,
						time: 40 * i + 600,
					}, 'linear');
				}
				scene.showEffect('iceball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0,
					opacity: 1,
					time: 100,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0,
					time: 400,
				}, 'linear');
				scene.showEffect('iceball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0,
					opacity: 1,
					time: 300,
				}, {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0,
					time: 600,
				}, 'linear');

				scene.showEffect('wisp', {
					x: defender.x - 30,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0.5,
					time: 200,
				}, {
					scale: 4,
					opacity: 0,
					time: 600,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x,
					y: defender.y - 30,
					z: defender.z,
					scale: 2,
					opacity: 0.5,
					time: 300,
				}, {
					scale: 4,
					opacity: 0,
					time: 650,
				}, 'linear', 'fade');
				scene.showEffect('wisp', {
					x: defender.x + 15,
					y: defender.y,
					z: defender.z,
					scale: 2,
					opacity: 0.5,
					time: 400,
				}, {
					scale: 4,
					opacity: 0,
					time: 700,
				}, 'linear', 'fade');
			}
		},
	},
	freezeshock: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
		prepareAnim: BattleOtherAnims.selfstatus.anim,
	},
	iceburn: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
		},
		prepareAnim: BattleOtherAnims.selfstatus.anim,
	},
	razorwind: {
		anim: null!,
		prepareAnim: BattleOtherAnims.selfstatus.anim,
	},
	overheat: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 700, 0.4);
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75,
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225,
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 100,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x - 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');

			defender.delay(200);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'accel');
		},
	},
	blastburn: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 700, 0.4);
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75,
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225,
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');

			defender.delay(200);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'accel');
		},
	},
	sacredfire: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#2630A9', 900, 0.6);
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1.5,
				opacity: 1,
				time: 550,
			}, 'linear', 'fade');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				scale: 0,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0.3,
				time: 850,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.8,
				scale: 0,
				time: 650,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 4,
				opacity: 0.3,
				time: 950,
			}, 'linear', 'fade');

			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 550,
			}, {
				x: defender.x + 60,
				y: defender.y - 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 825,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 575,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 850,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 875,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 625,
			}, {
				x: defender.x + 50,
				y: defender.y + 30,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 900,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0.6,
				opacity: 0.8,
				time: 650,
			}, {
				x: defender.x - 10,
				y: defender.y + 60,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 925,
			}, 'decel', 'explode');
		},
	},
	blueflare: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#4499FF', 600, 0.6);
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
			}, {
				x: defender.x + 60,
				y: defender.y + 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 75,
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 150,
			}, {
				x: defender.x - 60,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
			scene.showEffect('bluefireball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.8,
				time: 225,
			}, {
				x: defender.x - 20,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.5,
			}, 'decel', 'explode');
		},
	},
	electroweb: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
			scene.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 100,
			}, {
				x: defender.x + 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'ballistic', 'explode');
			scene.showEffect('web', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
				time: 200,
			}, {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 600,
			}, 'ballistic', 'explode');
		},
	},
	fling: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
		},
	},
	worryseed: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
		},
	},
	rockthrow: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'explode');
		},
	},
	paraboliccharge: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 7,
				opacity: 0,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 7,
				opacity: 0,
				time: 150,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, 'linear', 'fade');
		},
	},
	drainingkiss: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 500,
				opacity: 0,
			}, 'ballistic2');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 50,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 550,
				opacity: 0,
			}, 'linear');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 600,
				opacity: 0,
			}, 'ballistic2Under');
		},
	},
	oblivionwing: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 165 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect('#000000', 900, 0.5);

			for (let i = 0; i < 5; i++) {
				scene.showEffect('flareball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 165) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1,
					opacity: 0.9,
					time: 40 * i + 500,
				}, {
					opacity: 0,
					time: 100 * i + 800,
				}, 'linear');
			}

			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 500,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 575,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 775,
			}, 'linear', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 625,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 825,
			}, 'linear', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 650,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 850,
			}, 'linear', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 700,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 900,
			}, 'linear', 'explode');
			scene.showEffect('blackwisp', {
				x: attacker.x,
				y: attacker.y + 165,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.7,
				time: 775,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1.4,
				opacity: 0.3,
				time: 975,
			}, 'linear', 'explode');

			scene.showEffect('blackwisp', {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
				time: 1000,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0,
				time: 1500,
			}, 'ballistic2');
			scene.showEffect('blackwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				opacity: 0.5,
				time: 1050,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.3,
				opacity: 0,
				time: 1550,
			}, 'linear');
			scene.showEffect('blackwisp', {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.3,
				time: 1100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0,
				time: 1600,
			}, 'ballistic2Under');

			attacker.anim({
				y: defender.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(725);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(600);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'accel');
		},
	},
	signalbeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700,
			}, 'linear', 'explode');
		},
	},
	simplebeam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				opacity: 0.6,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.2,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(20),
				opacity: 0.6,
				time: 700,
			}, 'linear', 'explode');
		},
	},
	triattack: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 45,
				z: attacker.z,
				scale: 0,
				opacity: 0.2,
			}, {
				scale: 0.5,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x - 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.2,
				time: 100,
			}, {
				scale: 0.5,
				opacity: 0.6,
				time: 500,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x + 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.2,
				time: 200,
			}, {
				scale: 0.5,
				opacity: 0.6,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 45,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.6,
				time: 400,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.8,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x - 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.6,
				time: 500,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x + 45,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.x - 10,
				y: defender.y + 5,
				z: defender.behind(5),
				opacity: 0.8,
				time: 900,
			}, 'accel', 'explode');

			scene.showEffect('fireball', {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 600,
			}, {
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x + 15,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 700,
			}, {
				scale: 5,
				opacity: 0,
				time: 1000,
			}, 'linear');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.8,
				time: 800,
			}, {
				scale: 3,
				opacity: 0,
				time: 1100,
			}, 'linear');

			defender.delay(675);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	tripleaxel: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('icicle', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 450,
			}, {
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('foot', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 750,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				scale: 2,
				opacity: 0,
				time: 1050,
			}, 'linear');
			BattleOtherAnims.xattack.anim(scene, [attacker, defender]);
		},
	},
	hypnosis: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 0,
			}, {
				scale: 2,
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 100,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 200,
			}, {
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'decel');
		},
	},
	darkvoid: {
		anim(scene, [attacker, ...defenders]) {
			for (const defender of defenders) {
				defender.anim({
					y: defender.y - 80,
					opacity: 0,
					time: 300,
				}, 'accel');
				defender.anim({
					y: defender.y,
					opacity: 0,
					time: 200,
				});
				defender.delay(200);
				defender.anim({
					y: defender.y,
					opacity: 1,
					time: 200,
				});
			}
			const defender = defenders[1] || defenders[0];

			scene.backgroundEffect('#AA0000', 700, 0.3);
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.8,
				time: 0,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 600,
			}, 'accel', 'fade');
		},
	},
	roaroftime: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1800, 0.5);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				z: attacker.behind(-70),
				scale: 7,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 150,
			}, {
				z: attacker.behind(-70),
				scale: 7,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, {
				z: attacker.behind(-70),
				scale: 7,
				opacity: 0,
				time: 800,
			}, 'linear');

			scene.showEffect('poisonwisp', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 900,
			}, {
				scale: 5,
				opacity: 0,
				time: 1300,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1050,
			}, {
				scale: 5,
				opacity: 0,
				time: 1450,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1200,
			}, {
				scale: 5,
				opacity: 0,
				time: 1600,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1350,
			}, {
				scale: 5,
				opacity: 0,
				time: 1750,
			}, 'decel');

			defender.delay(925);
			defender.anim({
				x: defender.x - 30,
				time: 75,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	spacialrend: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 650, 0.5);
			scene.showEffect('mistball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 300,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 300,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 400,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 400,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.7,
				time: 100,
			}, {
				scale: 2,
				opacity: 0,
				time: 500,
			}, 'decel', 'fade');

			scene.showEffect(defender.sp, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.5,
				time: 125,
			}, {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z - 5,
				time: 425,
			}, 'decel');
			scene.showEffect(defender.sp, {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z - 5,
				opacity: 0.5,
				time: 425,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 625,
			}, 'accel');
			defender.delay(125);
			defender.anim({
				x: defender.x + 5,
				y: defender.y + 5,
				z: defender.z + 5,
				opacity: 0.5,
				time: 300,
			}, 'decel');
			defender.anim({
				x: defender.x,
				opacity: 1,
				time: 199,
			}, 'accel');
		},
	},
	sacredsword: {
		anim(scene, [attacker, defender]) {
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: 0.5,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			defender.delay(600);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('sword', {
				x: attacker.leftof(-10),
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 10,
				scale: 1,
				opacity: 0.4,
				time: 300,
			}, 'decel', 'fade');

			scene.showEffect('iceball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 410,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 710,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 510,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 710,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 610,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 810,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 610,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 910,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 610,
			}, {
				scale: 2,
				opacity: 0,
				time: 910,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 610,
			}, {
				scale: 2,
				opacity: 0,
				time: 910,
			}, 'accel', 'fade');
		},
	},
	secretsword: {
		anim(scene, [attacker, defender]) {
			defender.delay(400);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('sword', {
				x: attacker.leftof(-10),
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 10,
				scale: 1,
				opacity: 0.4,
				time: 300,
			}, 'decel', 'fade');

			scene.showEffect('flareball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 700,
			}, {
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'accel', 'fade');
			scene.showEffect('leftslash', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.6,
				time: 500,
			}, {
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'accel', 'fade');
		},
	},
	psychocut: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 70,
				y: defender.y - 40,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 100,
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('wisp', {
				x: defender.x + 80,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				x: defender.x - 50,
				y: defender.y - 60,
				z: defender.z,
				scale: 0.4,
				opacity: 0.4,
				time: 400,
			}, 'linear', 'fade');
		},
	},
	precipiceblades: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 800, 0.4);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0,
			}, 'linear', 'fade');

			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.behind(-50),
				scale: 0,
				opacity: 0.8,
			}, {
				scale: 3,
				opacity: 0,
				time: 200,
			}, 'linear');
			scene.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.behind(-50),
				scale: 0.5,
				yscale: 1.4,
				opacity: 0.7,
				time: 25,
			}, {
				y: attacker.y,
				yscale: 1.5,
				time: 250,
			}, 'decel', 'fade');

			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.behind(-125),
				scale: 0,
				opacity: 0.8,
				time: 150,
			}, {
				scale: 3,
				opacity: 0,
			}, 'linear');
			scene.showEffect('rock1', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.behind(-125),
				scale: 0.5,
				yscale: 1.5,
				opacity: 0.7,
				time: 175,
			}, {
				y: attacker.y,
				yscale: 1.6,
				time: 400,
			}, 'decel', 'fade');

			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('rock2', {
				x: defender.x - 15,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.6,
				opacity: 0.7,
				time: 350,
			}, {
				y: attacker.y,
				yscale: 1.7,
				time: 550,
			}, 'decel', 'fade');
			scene.showEffect('rock2', {
				x: defender.x + 15,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.6,
				opacity: 0.7,
				time: 375,
			}, {
				y: attacker.y,
				yscale: 1.7,
				time: 575,
			}, 'decel', 'fade');
			scene.showEffect('rock1', {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.5,
				yscale: 1.8,
				opacity: 0.7,
				time: 400,
			}, {
				y: defender.y + 10,
				yscale: 1.9,
				time: 600,
			}, 'accel', 'fade');

			defender.delay(325);
			defender.anim({
				x: defender.x - 30,
				time: 75,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	originpulse: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#00CCCC', 700, 0.5);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 6,
				opacity: 0,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x - 10,
				y: defender.y - 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.3,
				time: 150,
			}, {
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(30),
				scale: 1,
				opacity: 0.6,
			}, 'decel', 'explode');
		},
	},
	dragonascent: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 1000, 0.7);
			scene.showEffect('iceball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 2,
				time: 700,
			}, 'accel', 'explode');
			scene.showEffect('energyball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 2,
				time: 700,
			}, 'accel', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 650,
			}, {
				scale: 4,
				opacity: 0,
				time: 900,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 0.7,
				time: 750,
			}, {
				scale: 4,
				opacity: 0,
				time: 1000,
			}, 'linear', 'fade');

			attacker.anim({
				opacity: 0,
				y: defender.y + 120,
				time: 300,
			}, 'accel');
			attacker.delay(625);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(725);
			defender.anim({
				z: defender.behind(20),
				time: 250,
			}, 'decel');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	diamondstorm: { // todo: new animation involving icicles
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FF99FF', 700, 0.3);
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	dazzlinggleam: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FF99FF', 700, 0.5);
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	mistyexplosion: {
		anim(scene, [attacker]) {
			scene.backgroundEffect('#FF99FF', 700, 0.5);
			scene.showEffect('fireball', {
				x: attacker.x + 40,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: attacker.x - 40,
				y: attacker.y - 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: attacker.x + 10,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0,
				opacity: 0.6,
				time: 300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			attacker.delay(450).anim({
				scale: 4,
				time: 400,
				opacity: 0,
			}, 'linear');
		},
	},
	payday: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.3,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	swift: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	leafstorm: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#9AB440', 700, 0.7);
			scene.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	petaldance: { // Work on this later
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FF99FF', 1400, 0.5);
			attacker.anim({ x: attacker.x - 10, time: 100 });
			attacker.anim({ x: attacker.x + 10, time: 200 });
			attacker.anim({ x: attacker.x, time: 100 });
			attacker.anim({
				x: defender.x,
				y: defender.y + 50,
				z: defender.behind(-150),
				time: 200,
			}, 'ballistic2');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				time: 100,
			}, 'accel');

			attacker.anim({ z: attacker.z, time: 400 }, 'swing');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				x: attacker.x - 45,
				y: attacker.y - 45,
				scale: 2,
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 150,
			}, {
				x: attacker.x + 50,
				y: attacker.y - 30,
				scale: 2,
				opacity: 0,
				time: 450,
			}, 'decel');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 250,
			}, {
				x: attacker.x + 25,
				y: attacker.y - 60,
				scale: 2,
				opacity: 0,
				time: 550,
			}, 'decel');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.x - 40,
				y: attacker.y - 40,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'decel');

			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.8,
				opacity: 0.6,
				time: 900,
			}, 'ballistic', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.7,
				opacity: 1,
				time: 775,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.9,
				opacity: 0.6,
				time: 975,
			}, 'ballistic2Under', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.5,
				opacity: 0.6,
				time: 850,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.8,
				opacity: 0.3,
				time: 1050,
			}, 'ballistic2', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 1,
				time: 925,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.9,
				opacity: 0.6,
				time: 1125,
			}, 'ballistic', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.8,
				opacity: 1,
				time: 1000,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 1200,
			}, 'linear', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: defender.behind(-100),
				scale: 0.8,
				opacity: 0.6,
				time: 1075,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.9,
				opacity: 0.3,
				time: 1175,
			}, 'ballistic2', 'explode');

			defender.delay(825);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	petalblizzard: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#FF99FF', 700, 0.3);

			for (const defender of defenders) {
				defender.delay(350);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 80,
				y: defender.y + 60,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 60,
				y: defender.y - 60,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 80,
				y: defender.y - 20,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 60,
				y: defender.y + 20,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 275,
			}, {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
			scene.showEffect('petal', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x - 60,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
			}, 'accel', 'explode');
		},
	},
	magicalleaf: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('leaf1', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('leaf2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.1,
				opacity: 1,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.6,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	leafage: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.6,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.z,
				opacity: 0.6,
				time: 400,
			}, 'ballistic2', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				opacity: 0.6,
				time: 500,
			}, 'ballistic2Under', 'explode');

			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.2,
				opacity: 0.1,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 100,
			}, {
				x: defender.x + 10,
				y: defender.y + 5,
				z: defender.z,
				scale: 0.2,
				opacity: 0.1,
				time: 400,
			}, 'ballistic2', 'explode');
			scene.showEffect('feather', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 200,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0.1,
				time: 500,
			}, 'ballistic2Under', 'explode');
		},
	},
	gunkshot: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');
		},
	},
	hyperspacehole: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#ffffff', 900, 0.6);

			attacker.anim({
				opacity: 0,
				y: attacker.y - 80,
				time: 300,
			}, 'swing');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'decel');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 550,
			}, {
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 650,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.8,
				time: 750,
			}, {
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y - 80,
				z: defender.z,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.anim({
				y: attacker.y - 80,
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
				opacity: 1,
			}, 'decel');
			defender.delay(500);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	hyperspacefury: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 900, 0.3);
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.8,
				opacity: 0.8,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 1,
				opacity: 1,
			}, 'linear', 'fade');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('fist', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-100),
				scale: 0.6,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 575,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-20),
				opacity: 0,
				time: 200,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 200,
			}, 'linear');
			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	poisonjab: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 3,
				opacity: 0,
				time: 700,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 500,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(50),
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(425);
			defender.anim({
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	psychoboost: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 700, 0.3);
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0.3,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.6,
				time: 100,
			}, {
				scale: 3,
				opacity: 0.5,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1.25,
				time: 600,
			}, 'accel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.6,
				time: 100,
			}, {
				scale: 4,
				opacity: 0.5,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2.5,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1.5,
				opacity: 0.8,
				time: 600,
			}, 'accel', 'explode');

			scene.showEffect('mistball', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.5,
				time: 1000,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 900,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.5,
				time: 1100,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 900,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.5,
				time: 1100,
			}, 'accel', 'explode');
			scene.showEffect('mistball', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.5,
				time: 1000,
			}, 'accel', 'explode');

			attacker.delay(400);
			attacker.anim({
				z: attacker.behind(20),
				time: 300,
			}, 'swing');
			attacker.anim({
				time: 300,
			}, 'swing');
			defender.delay(600);
			defender.anim({
				z: defender.behind(10),
				time: 300,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	bestow: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('pokeball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.1,
				opacity: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, 'ballistic', 'fade');
		},
	},
	finalgambit: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.3,
				time: 500,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 50,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 350,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 100,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 400,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				scale: 5,
				opacity: 0,
				time: 300,
			}, 'linear');
			attacker.anim({
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				time: 300,
			}, 'linear');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	forestscurse: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0,
			}, {
				y: defender.y,
				scale: 3,
				opacity: 0,
			}, 'accel');
		},
	},
	trickortreat: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 0,
			}, {
				y: defender.y,
				scale: 3,
				opacity: 0,
			}, 'accel');
		},
	},
	healpulse: {
		anim(scene, [attacker, defender]) {
			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 0,
			}, {
				scale: 8,
				opacity: 0.1,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 600,
			}, 'linear');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.3,
				scale: 0,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0,
				time: 800,
			}, 'linear');
			for (let i = 0; i < 4; i++) {
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1,
				}, {
					x: attacker.x + 240 * xf[i],
					y: attacker.y,
					z: attacker.z + 137 * yf[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800,
				}, 'accel');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.2,
					opacity: 1,
				}, {
					x: attacker.x + 339 * xf2[i],
					y: attacker.y,
					z: attacker.z + 194 * yf2[i],
					scale: 0.3,
					opacity: 0.5,
					time: 800,
				}, 'accel');
			}
		},
	},
	spite: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1300, 0.3);
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
				scale: 1,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.2,
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect(defender.sp, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				xscale: 1,
				time: 200,
			}, {
				x: defender.x + 7,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				xscale: 1.5,
				time: 800,
			}, 'accel');
			scene.showEffect(defender.sp, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				xscale: 1,
				time: 700,
			}, {
				x: defender.x - 7,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				xscale: 1.5,
				time: 1300,
			}, 'accel');
		},
	},
	lockon: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
			}, {
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
			}, {
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
			}, {
				opacity: 0.5,
				time: 400,
			}, 'linear', 'explode');
		},
	},
	mindreader: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0,
				scale: 2,
			}, {
				opacity: 1,
				scale: 0.5,
			}, 'accel', 'explode');
		},
	},
	memento: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 900, 0.2);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0,
			}, {
				y: attacker.y + 600,
				yscale: 10,
				opacity: 0.3,
				time: 400,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x,
				y: defender.y + 500,
				z: defender.z,
				yscale: 10,
				opacity: 0.3,
				time: 500,
			}, {
				y: defender.y,
				opacity: 0,
				yscale: 1,
				time: 900,
			}, 'decel', 'fade');
		},
	},
	spiritshackle: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 1000, 0.4);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 3,
				opacity: 0,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 35,
				z: attacker.z,
				scale: 0.1,
				opacity: 0.4,
				time: 0,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.2,
				opacity: 0,
				time: 300,
			}, 'decel');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 575,
			}, {
				y: defender.y + 150,
				z: defender.behind(-10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 590,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 825,
			}, 'linear', 'explode');

			defender.delay(825);
			defender.anim({
				z: defender.behind(5),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	brutalswing: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#000000', 1300, 0.3);

			for (const defender of defenders) {
				defender.delay(700);
				defender.anim({
					z: defender.behind(10),
					time: 100,
				}, 'swing');
				defender.anim({
					time: 200,
				}, 'swing');
				defender.anim({
					z: defender.behind(10),
					time: 100,
				}, 'swing');
				defender.anim({
					time: 300,
				}, 'swing');

				scene.showEffect('shadowball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					opacity: 0.3,
					scale: 0,
					time: 700,
				}, {
					scale: 2,
					opacity: 0,
					time: 1000,
				}, 'linear');
				scene.showEffect('shadowball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					opacity: 0.3,
					scale: 0,
					time: 900,
				}, {
					scale: 2,
					opacity: 0,
					time: 1200,
				}, 'linear');
			}
			const defender = defenders[1] || defenders[0];

			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-50),
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');

			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 50,
				z: defender.behind(-50),
				scale: 1,
				xscale: 5,
				opacity: 0.8,
				time: 500,
			}, {
				scale: 2,
				xscale: 8,
				opacity: 0.1,
				time: 700,
			}, 'decel', 'fade');
		},
	},
	revelationdance: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1300, 0.3);
			scene.showEffect('electroball', {
				x: attacker.x + 20,
				y: attacker.y - 60,
				z: attacker.behind(15),
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 150,
			}, {
				scale: 1.5,
				xscale: 4,
				opacity: 0,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x - 20,
				y: attacker.y - 60,
				z: attacker.behind(15),
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 1.5,
				xscale: 4,
				opacity: 0,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y - 60,
				z: attacker.behind(15),
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 650,
			}, {
				scale: 1.5,
				xscale: 4,
				opacity: 0,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-15),
				scale: 0.7,
				xscale: 1,
				opacity: 0.8,
				time: 900,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				time: 1100,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
				time: 1100,
			}, {
				x: defender.x + 50,
				y: defender.y + 10,
				opacity: 0.3,
				time: 1400,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x - 30,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.2,
				opacity: 0.6,
				time: 1200,
			}, {
				x: defender.x - 50,
				y: defender.y - 20,
				opacity: 0.3,
				time: 1400,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 1300,
			}, {
				x: defender.x + 35,
				y: defender.y + 30,
				opacity: 0.3,
				time: 1500,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.2,
				opacity: 0.7,
				time: 1300,
			}, {
				x: defender.x - 35,
				y: defender.y - 40,
				opacity: 0.3,
				time: 1500,
			}, 'accel', 'explode');

			attacker.anim({
				x: attacker.x + 5,
				y: attacker.y + 10,
				time: 100,
			}, 'ballistic');
			attacker.anim({
				x: attacker.x + 10,
				y: attacker.y,
				time: 50,
			});
			attacker.anim({
				x: attacker.x - 5,
				y: attacker.y + 10,
				time: 200,
			}, 'ballistic');
			attacker.anim({
				x: attacker.x - 10,
				y: attacker.y,
				time: 100,
			});
			attacker.anim({
				x: attacker.x - 5,
				y: attacker.y + 10,
				time: 100,
			}, 'ballistic');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				time: 50,
			});
			attacker.anim({
				z: attacker.behind(15),
				time: 200,
			}, 'decel');
			attacker.anim({
				z: attacker.behind(-15),
				time: 100,
			}, 'accel');
			attacker.anim({
				z: attacker.z,
				time: 300,
			}, 'swing');
			defender.delay(1100);
			defender.anim({
				z: defender.behind(15),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	prismaticlaser: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 5; i++) {
				scene.showEffect('wisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1,
					opacity: 1,
					time: 20 * i,
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
				scene.showEffect('poisonwisp', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.5,
					opacity: 0.3,
					time: 20 * i,
				}, {
					scale: 2,
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.backgroundEffect('#000000', 700, 0.6);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.2,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	firstimpression: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#987058', 600, 0.3, 400);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 60,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				scale: 0.25,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 100,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 1,
			}, {
				scale: 0.25,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y + 60,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
			}, {
				scale: 0.25,
				opacity: 0,
				time: 400,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y + 100,
				z: defender.z,
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 1,
			}, {
				scale: 0.25,
				opacity: 0,
				time: 400,
			}, 'linear');

			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear');

			attacker.anim({
				y: attacker.y + 5,
				xscale: 0.9,
				yscale: 1.1,
				time: 100,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'swing');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.anim({
				y: defender.y + 5,
				xscale: 0.9,
				yscale: 1.1,
				time: 100,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'swing');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	shoreup: {
		anim: BattleOtherAnims.lightstatus.anim,
	},
	firelash: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.behind(15),
				scale: 3,
				opacity: 0,
				time: 900,
			}, 'linear');
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	powertrip: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 100,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 200,
			}, {
				y: defender.y + 60,
				opacity: 0.2,
				time: 600,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 300,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 700,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 15,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.4,
				time: 400,
			}, {
				y: attacker.y + 60,
				opacity: 0.2,
				time: 800,
			}, 'linear', 'fade');

			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.1,
				time: 500,
			}, {
				x: attacker.leftof(-30),
				y: attacker.y + 20,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.3,
				time: 800,
			}, 'ballistic2Under', 'fade');

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 1250,
			}, {
				x: defender.leftof(-20),
				y: defender.y,
				z: defender.behind(30),
				scale: 1.5,
				opacity: 0,
				time: 1450,
			}, 'linear');
			attacker.anim({
				y: attacker.y + 5,
				xscale: 0.9,
				yscale: 1.1,
				time: 100,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'swing');
			attacker.anim({
				y: attacker.y + 5,
				xscale: 0.9,
				yscale: 1.1,
				time: 100,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'swing');
			attacker.anim({
				y: attacker.y + 5,
				xscale: 0.9,
				yscale: 1.1,
				time: 100,
			}, 'swing');
			attacker.anim({
				time: 100,
			}, 'swing');
			attacker.delay(200);
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 100,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(1250);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	smartstrike: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
			}, {
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('leftslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 0.5,
			}, {
				opacity: 1,
				time: 400,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
			}, {
				opacity: 0.5,
				time: 400,
			}, 'linear', 'explode');

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 860,
			}, {
				scale: 2,
				opacity: 0,
				time: 1160,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 910,
			}, {
				scale: 2,
				opacity: 0,
				time: 1210,
			}, 'linear');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 850,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 900,
			}, 'accel', 'fade');
			attacker.delay(500);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: 0.5,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			defender.delay(760);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	spotlight: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.dance.anim(scene, [attacker]);
			scene.showEffect('pointer', {
				x: attacker.x + 50,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
			}, {
				x: attacker.x + 30,
				y: attacker.y + 35,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('pointer', {
				x: attacker.x + 30,
				y: attacker.y + 35,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.3,
				yscale: 0.6,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x + 60,
				y: attacker.y + 30,
				scale: 0.4,
				xscale: 0.4,
				yscale: 0.4,
				opacity: 0,
				time: 900,
			}, 'linear');

			defender.delay(400);
			defender.anim({
				y: defender.y + 15,
				time: 150,
			}, 'decel');
			defender.anim({
				time: 150,
			}, 'accel');
			defender.anim({
				y: defender.y + 15,
				time: 150,
			}, 'decel');
			defender.anim({
				time: 150,
			}, 'accel');
		},
	},
	anchorshot: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.y - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 5; i++) {
				scene.showEffect('energyball', {
					x: attacker.x + xstep * (i + 1),
					y: attacker.y + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.5,
					opacity: 1,
					time: 20 * i,
				}, {
					opacity: 0,
					time: 40 * i + 600,
				}, 'linear');
			}
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y + 15,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 300,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 350,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 950,
			}, 'decel', 'fade');
			scene.showEffect('energyball', {
				x: defender.x,
				y: defender.y - 20,
				z: defender.z,
				scale: 0.7,
				xscale: 2,
				opacity: 0.3,
				time: 400,
			}, {
				scale: 0.4,
				xscale: 1,
				opacity: 0.1,
				time: 1000,
			}, 'decel', 'fade');
			defender.delay(300);
			defender.anim({
				y: defender.y + 15,
				z: defender.behind(10),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.delay(25);
			defender.anim({
				x: defender.leftof(-10),
				y: defender.y + 15,
				z: defender.behind(5),
				yscale: 1.3,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	clangingscales: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#440044', 700, 0.2);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				scale: 1,
				opacity: 0.5,
			}, {
				z: attacker.behind(-10),
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 200,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 275,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 350,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 425,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 575,
			}, 'linear', 'explode');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 550,
			}, {
				scale: 4,
				opacity: 0,
				time: 750,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, {
				scale: 4,
				opacity: 0,
				time: 800,
			}, 'linear');

			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	spectralthief: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#000000 30%, #440044', 1700, 0.5);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.5,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5,
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 1,
			}, {
				x: attacker.x + 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.5,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 1,
			}, {
				x: attacker.x - 50,
				scale: 3,
				xscale: 3.5,
				opacity: 0.5,
				time: 500,
			}, 'linear', 'fade');

			scene.showEffect('poisonwisp', {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 2,
				opacity: 0.3,
				time: 300,
			}, {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 50,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 2,
				opacity: 0.3,
				time: 400,
			}, {
				x: defender.x - 50,
				y: defender.y - 40,
				z: defender.z,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 40,
				z: attacker.z,
				scale: 2,
				opacity: 0.3,
				time: 450,
			}, {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				time: 925,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 0,
				xscale: 0.5,
				yscale: 1,
				opacity: 0.5,
				time: 750,
			}, {
				scale: 2,
				xscale: 4,
				opacity: 0.1,
				time: 1200,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 750,
			}, {
				x: defender.x + 75,
				opacity: 1,
				scale: 3,
				time: 1200,
			}, 'linear', 'explode');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 2,
				opacity: 0.3,
				time: 750,
			}, {
				x: defender.x - 75,
				opacity: 1,
				scale: 3,
				time: 1200,
			}, 'linear', 'explode');

			scene.showEffect(attacker.sp, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0.3,
				time: 700,
			}, {
				y: defender.y + 600,
				yscale: 10,
				time: 1200,
			}, 'linear', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x + 30,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0.3,
				time: 800,
			}, {
				y: defender.y + 600,
				yscale: 10,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0.3,
				time: 900,
			}, {
				y: defender.y + 600,
				yscale: 10,
				time: 1400,
			}, 'linear', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0.3,
				time: 1000,
			}, {
				y: defender.y + 600,
				yscale: 10,
				time: 1500,
			}, 'linear', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.x - 15,
				y: defender.y,
				z: defender.z,
				scale: 3,
				opacity: 0.3,
				time: 1100,
			}, {
				y: defender.y + 600,
				yscale: 10,
				time: 1600,
			}, 'linear', 'fade');

			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y,
				z: defender.behind(5),
				scale: 0.6,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 1,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 25,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 0.6,
				opacity: 0.5,
				time: 800,
			}, {
				scale: 1,
				opacity: 0,
				time: 1000,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y + 10,
				z: defender.behind(5),
				scale: 0.6,
				opacity: 0.5,
				time: 900,
			}, {
				scale: 1,
				opacity: 0,
				time: 1100,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 2,
				y: defender.y + 5,
				z: defender.behind(5),
				scale: 0.6,
				opacity: 0.5,
				time: 1000,
			}, {
				scale: 1,
				opacity: 0,
				time: 1200,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 20,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 0.6,
				opacity: 0.2,
				time: 1100,
			}, {
				scale: 1,
				opacity: 0,
				time: 1300,
			}, 'linear');

			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				time: 1700,
			}, {
				x: attacker.x + 70,
				scale: 0.8,
				opacity: 0,
				time: 2200,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 1,
				time: 1700,
			}, {
				x: attacker.x - 70,
				scale: 0.8,
				opacity: 0,
				time: 2200,
			}, 'linear', 'fade');
			attacker.anim({
				opacity: 0,
				y: attacker.y - 40,
				time: 200,
			}, 'swing');
			attacker.delay(1200);
			attacker.anim({
				opacity: 0,
				y: attacker.y + 60,
				time: 1,
			});
			attacker.anim({
				time: 200,
			}, 'swing');
			defender.delay(725);
			defender.anim({
				x: defender.x - 30,
				time: 75,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x - 30,
				time: 100,
			});
			defender.anim({
				x: defender.x + 30,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	plasmafists: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/sprites/gen6bgs/bg-earthycave.jpg')`, 2000, 1);
			scene.backgroundEffect('#000000', 1000, 0.6);
			scene.backgroundEffect('#FFFFFF', 300, 0.6, 1000);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 0,
			}, {
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 100,
			}, {
				scale: 1,
				opacity: 0,
				time: 300,
			}, 'linear');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.1,
				time: 200,
			}, {
				scale: 0.5,
				opacity: 0.5,
				time: 400,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.7,
				time: 300,
			}, {
				scale: 1,
				opacity: 0,
				time: 500,
			}, 'linear');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.behind(-75),
				scale: 0.5,
				xscale: 0.25,
				yscale: 0.75,
				opacity: 0.5,
				time: 900,
			}, {
				scale: 2,
				xscale: 3.5,
				opacity: 0.1,
			}, 'decel', 'fade');
			scene.showEffect('fist1', {
				x: defender.x - 10,
				y: defender.y + 80,
				z: defender.behind(-70),
				scale: 0.8,
				opacity: 0.8,
				time: 800,
			}, {
				y: defender.y - 15,
				z: defender.behind(-65),
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'accel', 'explode');
			scene.showEffect('fist1', {
				x: defender.x + 10,
				y: defender.y + 80,
				z: defender.behind(-70),
				scale: 0.8,
				opacity: 0.8,
				time: 800,
			}, {
				y: defender.y - 15,
				z: defender.behind(-65),
				scale: 1,
				opacity: 1,
				time: 900,
			}, 'accel', 'explode');
			scene.showEffect('lightning', {
				x: defender.x - 20,
				y: defender.y,
				z: defender.behind(-75),
				yscale: 0,
				xscale: 2,
				time: 900,
			}, {
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(30),
				scale: 2,
				yscale: 1,
				xscale: 1.5,
				opacity: 1,
				time: 1200,
			}, 'ballistic2Under', 'explode');
			scene.showEffect('lightning', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.behind(-75),
				yscale: 0,
				xscale: 2,
				time: 1000,
			}, {
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(30),
				scale: 2,
				yscale: 1,
				xscale: 1.5,
				opacity: 1,
				time: 1300,
			}, 'linear', 'explode');
			scene.showEffect('lightning', {
				x: defender.x - 20,
				y: defender.y,
				z: defender.behind(-75),
				yscale: 0,
				xscale: 2,
				time: 1100,
			}, {
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(30),
				scale: 2,
				yscale: 1,
				xscale: 1.5,
				opacity: 1,
				time: 1400,
			}, 'ballistic2Under', 'explode');
			scene.showEffect('lightning', {
				x: defender.x + 20,
				y: defender.y,
				z: defender.behind(-75),
				yscale: 0,
				xscale: 2,
				time: 1200,
			}, {
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(30),
				scale: 2,
				yscale: 1,
				xscale: 1.5,
				opacity: 1,
				time: 1500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.75,
				time: 1050,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.75,
				time: 1250,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 1600,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.75,
				time: 1450,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 1800,
			}, 'linear');
			attacker.delay(400);
			attacker.anim({
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-125),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.behind(-75),
				time: 100,
			});
			attacker.anim({
				time: 600,
			}, 'ballistic2Back');
			defender.delay(1000);
			defender.anim({
				x: defender.x - 12.5,
				time: 75,
			});
			defender.anim({
				x: defender.x + 12.5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 12.5,
				time: 100,
			});
			defender.anim({
				x: defender.x + 12.5,
				time: 100,
			});
			defender.anim({
				x: defender.x - 12.5,
				time: 100,
			});
			defender.anim({
				x: defender.x,
				time: 100,
			});
		},
	},
	collisioncourse: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-sunnyday.jpg')`, 1300, 0.5);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 25,
			}, {
				y: attacker.y + 150,
				opacity: 0,
				time: 325,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.z,
				opacity: 0.3,
				time: 625,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.3,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.5,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.6,
				time: 800,
			}, 'accel', 'explode');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				time: 1500,
			}, 'accel', 'fade');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.z,
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 1,
				time: 200,
			}, 'ballistic2Under');
			attacker.delay(50);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.delay(700);
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			defender.delay(650);
			defender.anim({
				y: defender.y - 10,
				z: defender.behind(5),
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				z: defender.behind(20),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	electrodrift: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-electricterrain.png')`, 1300, 0.5);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 25,
			}, {
				y: attacker.y + 150,
				opacity: 0,
				time: 325,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.z,
				opacity: 0.3,
				time: 625,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.3,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 150,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.5,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.6,
				time: 800,
			}, 'accel', 'explode');

			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				time: 1500,
			}, 'accel', 'fade');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				time: 1500,
			}, 'accel', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.z,
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 1,
				time: 200,
			}, 'ballistic2Under');
			attacker.delay(50);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.delay(700);
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			defender.delay(650);
			defender.anim({
				y: defender.y - 10,
				z: defender.behind(5),
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				z: defender.behind(20),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	sunsteelstrike: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 500, 0.6);
			scene.backgroundEffect('linear-gradient(#FFFFFF 30%, #B84038)', 1200, 0.6, 500);

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 1200,
			}, 'decel');
			for (let i = 0; i < 5; i++) {
				scene.showEffect('flareball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 2,
					opacity: 0.4,
					time: 40 * i + 700,
				}, {
					scale: 1.5,
					opacity: 0,
					time: 60 * i + 1500,
				}, 'linear');
			}
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 1075,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1675,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 0,
				opacity: 1,
				time: 1075,
			}, {
				scale: 8,
				opacity: 0,
				time: 1375,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(10),
				scale: 0,
				opacity: 1,
				time: 1175,
			}, {
				scale: 8,
				opacity: 0,
				time: 1575,
			}, 'linear');

			attacker.anim({
				y: defender.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(425);
			attacker.anim({
				y: defender.y + 200,
				opacity: 1,
				time: 1,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 1,
				time: 350,
			}, 'accel');
			attacker.anim({
				x: defender.leftof(50),
				y: defender.y - 20,
				z: defender.z,
				opacity: 0,
				time: 75,
			});
			attacker.delay(300);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(1075);
			defender.anim({
				z: defender.behind(30),
				time: 400,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	moongeistbeam: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect('#000000', 600, 0.6);
			scene.backgroundEffect('linear-gradient(#000000 10%, #2630A9)', 1100, 0.6, 600);

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 1300,
			}, 'decel');
			for (let i = 0; i < 5; i++) {
				scene.showEffect('wisp', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 2.5,
					opacity: 1,
					time: 40 * i + 700,
				}, {
					scale: 2,
					opacity: 0,
					time: 60 * i + 1500,
				}, 'linear');
			}
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 800,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1000,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 875,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1075,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 950,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1150,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1025,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1225,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1100,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1300,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1175,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				opacity: 0.3,
				time: 1375,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 1375,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1675,
			}, 'linear', 'explode');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 0,
				opacity: 1,
				time: 1175,
			}, {
				scale: 8,
				opacity: 0,
				time: 1375,
			}, 'linear');
			scene.showEffect('bluefireball', {
				x: defender.x,
				y: defender.y,
				z: defender.behind(10),
				scale: 0,
				opacity: 1,
				time: 1275,
			}, {
				scale: 8,
				opacity: 0,
				time: 1675,
			}, 'linear');

			attacker.anim({
				y: defender.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(1150);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(775);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(10),
				time: 300,
			}, 'decel');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	astralbarrage: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#000000', 600, 0.6);
			scene.backgroundEffect('linear-gradient(#000000 10%, #2630A9)', 1100, 0.6, 600);

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 1300,
			}, 'decel');
			const d = defenders[1] || defenders[0];
			attacker.anim({
				y: d.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(1150);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			for (const defender of defenders) {
				let xstep = (defender.x - attacker.x) / 5;
				let ystep = (defender.x - 200 - attacker.x) / 5;
				let zstep = (defender.z - attacker.z) / 5;
				for (let i = 0; i < 5; i++) {
					scene.showEffect('wisp', {
						x: attacker.x + xstep * (i + 1),
						y: (attacker.y + 200) + ystep * (i + 1),
						z: attacker.z + zstep * (i + 1),
						scale: 2.5,
						opacity: 1,
						time: 40 * i + 700,
					}, {
						scale: 2,
						opacity: 0,
						time: 60 * i + 1500,
					}, 'linear');
				}
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 800,
				}, {
					x: defender.x + 30,
					y: defender.y + 30,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1000,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 875,
				}, {
					x: defender.x + 20,
					y: defender.y - 30,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1075,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 950,
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1150,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 1025,
				}, {
					x: defender.x - 10,
					y: defender.y + 10,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1225,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 1100,
				}, {
					x: defender.x + 10,
					y: defender.y - 10,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1300,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 1175,
				}, {
					x: defender.x - 20,
					y: defender.y,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 1375,
				}, 'linear', 'explode');
				scene.showEffect('iceball', {
					x: defender.x,
					y: defender.y - 50,
					z: defender.z,
					scale: 1,
					xscale: 3,
					opacity: 0.5,
					time: 1375,
				}, {
					scale: 3,
					xscale: 8,
					opacity: 0.1,
					time: 1675,
				}, 'linear', 'explode');
				scene.showEffect('bluefireball', {
					x: defender.x,
					y: defender.y,
					z: defender.behind(5),
					scale: 0,
					opacity: 1,
					time: 1175,
				}, {
					scale: 8,
					opacity: 0,
					time: 1375,
				}, 'linear');
				scene.showEffect('bluefireball', {
					x: defender.x,
					y: defender.y,
					z: defender.behind(10),
					scale: 0,
					opacity: 1,
					time: 1275,
				}, {
					scale: 8,
					opacity: 0,
					time: 1675,
				}, 'linear');
				defender.delay(775);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(10),
					time: 300,
				}, 'decel');
				defender.anim({
					time: 300,
				}, 'swing');
			}
		},
	},
	photongeyser: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1000, 0.5);
			scene.backgroundEffect('#FFFFFF', 600, 0.8, 2100);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 1,
				time: 0,
			}, {
				scale: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 1,
				time: 200,
			}, {
				scale: 0.8,
				time: 600,
			}, 'decel', 'fade');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 1,
				time: 400,
			}, {
				scale: 1,
				time: 800,
			}, 'decel', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0,
				opacity: 0.5,
				time: 0,
			}, {
				scale: 0.8,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.3,
				opacity: 1,
				time: 800,
			}, {
				scale: 1.2,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect('energyball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.3,
				opacity: 0.3,
				time: 800,
			}, {
				scale: 1.2,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 1.2,
				opacity: 0.8,
				time: 1300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 1500,
			}, 'linear', 'explode');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 1.2,
				opacity: 0.3,
				time: 1300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 1500,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				scale: 0.5,
				time: 1200,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 2,
				opacity: 1,
				time: 900,
			}, {
				time: 1200,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-20),
				scale: 2,
				opacity: 1,
				time: 1300,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2.5,
				time: 1500,
			}, 'linear', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 0,
				xscale: 0,
				opacity: 0.5,
				time: 1500,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 2500,
			}, 'accel');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 8,
				xscale: 0,
				yscale: 13,
				time: 1500,
			}, {
				xscale: 4,
				time: 2500,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 1,
				scale: 2,
				time: 1500,
			}, {
				scale: 6,
				time: 2500,
			}, 'decel', 'explode');
			defender.delay(1500);
			defender.anim({
				z: defender.behind(10),
				opacity: 0,
				time: 200,
			}, 'swing');
			defender.delay(700);
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	coreenforcer: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#082179', 1600, 0.5, 300);
			scene.backgroundEffect('linear-gradient(#46AF71 20%, #1170F0)', 1600, 0.4, 300);

			for (const defender of defenders) {
				defender.delay(2075);
				defender.anim({
					x: defender.x - 30,
					time: 75,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x - 30,
					time: 100,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x - 30,
					time: 100,
				});
				defender.anim({
					x: defender.x + 30,
					time: 100,
				});
				defender.anim({
					x: defender.x,
					time: 100,
				});
			}
			const defender = defenders[1] || defenders[0];

			attacker.anim({
				y: defender.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(1525);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			attacker.delay(600);

			let xstep = (defender.x - defender.leftof(-25)) / 5;
			let ystep = (defender.y - 225 - attacker.y) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 6; i++) {
				scene.showEffect('wisp', {
					x: attacker.leftof(50) + xstep * (i + 1),
					y: (attacker.y + 300) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.3,
					opacity: 1,
					time: 5 * i + 700,
				}, {
					x: defender.leftof(50) + xstep * (i + 1),
					opacity: 0,
					time: 100 * i + 800,
				}, 'linear');
			}
			xstep = (defender.x - defender.leftof(25)) / 5;
			ystep = (defender.y - 250 - attacker.y) / 5;
			zstep = (defender.behind(-100) - attacker.z) / 5;

			for (let i = 0; i < 6; i++) {
				scene.showEffect('wisp', {
					x: attacker.leftof(-50) + xstep * (i + 1),
					y: (attacker.y + 275) + ystep * (i + 1),
					z: attacker.behind(-150) + zstep * (i + 1),
					scale: 1.3,
					opacity: 1,
					time: 5 * i + 900,
				}, {
					x: defender.leftof(-50) + xstep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					opacity: 0,
					time: 100 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x - defender.leftof(-15)) / 5;
			ystep = (defender.y - 275 - attacker.y - 25) / 5;
			zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 6; i++) {
				scene.showEffect('wisp', {
					x: attacker.leftof(50) + xstep * (i + 1),
					y: (attacker.y + 275) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.3,
					opacity: 1,
					time: 5 * i + 1100,
				}, {
					x: defender.leftof(50) + xstep * (i + 1),
					opacity: 0,
					time: 100 * i + 1200,
				}, 'linear');
			}

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 0.6,
				time: 1100,
			}, {
				x: defender.x + 60,
				y: defender.y + 30,
				z: defender.behind(20),
				scale: 1,
				opacity: 0.6,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1175,
			}, {
				x: defender.x - 10,
				y: defender.y - 30,
				z: defender.behind(20),
				scale: 1,
				opacity: 0.6,
				time: 1375,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1225,
			}, {
				x: defender.x + 20,
				y: defender.y + 10,
				z: defender.behind(10),
				scale: 1,
				opacity: 1,
				time: 1425,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1250,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.behind(-10),
				scale: 1,
				opacity: 0.6,
				time: 1450,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1325,
			}, {
				x: defender.x - 50,
				y: defender.y + 10,
				z: defender.behind(-20),
				scale: 1,
				opacity: 1,
				time: 1525,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1350,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.behind(-25),
				scale: 1,
				opacity: 0.6,
				time: 1550,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1.4,
				time: 1400,
			}, {
				x: defender.x - 60,
				y: defender.y - 10,
				z: defender.behind(-40),
				scale: 1,
				opacity: 1,
				time: 1600,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1.4,
				time: 1475,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.behind(-30),
				scale: 1,
				opacity: 0.6,
				time: 1675,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1525,
			}, {
				x: defender.x + 40,
				y: defender.y + 10,
				z: defender.behind(-40),
				scale: 1,
				opacity: 1,
				time: 1725,
			}, 'linear', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0.4,
				opacity: 1,
				time: 1550,
			}, {
				x: defender.x + 80,
				y: defender.y,
				z: defender.behind(-50),
				scale: 1,
				opacity: 0.6,
				time: 1750,
			}, 'linear', 'fade');

			scene.backgroundEffect('#ffffff', 800, 0.8, 2000);
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2000,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
		},
	},

	// z-move animations
	gigavolthavoc: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 800, 0.7);
			scene.backgroundEffect('#ffffff', 200, 0.7, 700);
			scene.backgroundEffect('#000000', 800, 0.7, 900);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 8,
				opacity: 0,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 8,
				opacity: 0,
				time: 150,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, 'linear', 'fade');
			scene.showEffect('lightning', {
				x: attacker.x - 10,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 200,
			}, {
				scale: 3,
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('lightning', {
				x: attacker.x + 10,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 350,
			}, {
				scale: 3,
				opacity: 0,
				time: 550,
			}, 'decel');

			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.8,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 1.2,
				opacity: 0.8,
				time: 800,
			}, 'linear', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				opacity: 0.5,
				time: 1200,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');

			scene.showEffect('lightning', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 800,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 950,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1100,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			defender.delay(825);
			defender.anim({
				z: defender.behind(20),
				opacity: 0.5,
				time: 400,
			}, 'swing');
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	infernooverdrive: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#421800 40%, #B8652F)', 800, 0.7);
			scene.backgroundEffect('#ffffff', 200, 0.7, 700);
			scene.backgroundEffect('#000000', 800, 0.7, 900);
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y + 20,
				z: attacker.behind(-30),
				scale: 1,
				opacity: 0.3,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 100,
			}, 'accel', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x + 20,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 1,
				opacity: 0.3,
				time: 100,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 200,
			}, 'accel', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x,
				y: attacker.y - 20,
				z: attacker.behind(-30),
				scale: 1,
				opacity: 0.3,
				time: 200,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 300,
			}, 'accel', 'fade');
			scene.showEffect('fireball', {
				x: attacker.x - 20,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 1,
				opacity: 0.3,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 1,
				time: 400,
			}, 'accel', 'fade');

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
			}, {
				scale: 0.6,
				opacity: 1,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 3,
				opacity: 0.3,
				time: 100,
			}, {
				scale: 0.8,
				opacity: 0.6,
				time: 400,
			}, 'decel', 'fade');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-30),
				scale: 0.6,
				opacity: 0.8,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				scale: 5,
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 900,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 1,
				time: 900,
			}, {
				scale: 6,
				opacity: 0,
				time: 1100,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 1,
				time: 1000,
			}, {
				scale: 6,
				opacity: 0,
				time: 1300,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 5,
				time: 800,
			}, {
				scale: 12,
				opacity: 0.5,
				time: 1500,
			}, 'linear', 'fade');

			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 800,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 950,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1100,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			defender.delay(825);
			defender.anim({
				z: defender.behind(20),
				time: 300,
			}, 'swing');
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	alloutpummeling: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 2000, 0.8);
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
			}, {
				x: defender.x + 30,
				y: defender.y + 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 200,
			}, 'ballistic', 'explode');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 75,
			}, {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 275,
			}, 'ballistic2', 'explode');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 150,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 350,
			}, 'ballistic2Under', 'explode');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 225,
			}, {
				x: defender.x - 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 425,
			}, 'ballistic', 'explode');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 300,
			}, {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, 'ballistic2', 'explode');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.6,
				opacity: 0.6,
				time: 375,
			}, {
				x: defender.x - 20,
				y: defender.y,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 575,
			}, 'ballistic2Under', 'explode');
			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-5),
				scale: 1.5,
				opacity: 0,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 1150,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 1100,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 1125,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 1150,
			}, 'accel', 'fade');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.8,
				time: 1150,
			}, {
				scale: 1,
				xscale: 12,
				opacity: 0,
				time: 1450,
			}, 'decel', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 0.7,
				scale: 0.5,
				time: 1150,
			}, {
				scale: 3,
				opacity: 0,
				time: 1650,
			}, 'decel');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 1,
				scale: 0.5,
				time: 1150,
			}, {
				scale: 6,
				opacity: 0,
				time: 1650,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 5,
				yscale: 13,
				time: 1150,
			}, {
				opacity: 0.5,
				xscale: 0,
				time: 2000,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 1,
				scale: 2,
				time: 1150,
			}, {
				opacity: 0.5,
				scale: 6,
				time: 2000,
			}, 'decel', 'explode');

			attacker.delay(600);
			attacker.anim({
				z: attacker.behind(15),
				time: 200,
			}, 'decel');
			attacker.anim({
				z: defender.behind(-170),
				opacity: 0,
				time: 100,
			}, 'accel');
			attacker.delay(1000);
			attacker.anim({
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				z: attacker.z,
				time: 300,
			}, 'swing');
			defender.delay(200);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.delay(300);
			defender.anim({
				z: defender.behind(5),
				opacity: 0,
				time: 75,
			}, 'swing');
			defender.delay(750);
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	supersonicskystrike: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#46BFFF 20%, #241714)', 1300, 0.5);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 25,
			}, {
				y: attacker.y + 250,
				opacity: 0,
				time: 325,
			}, 'decel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.z,
				opacity: 0.3,
				time: 625,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0,
				time: 825,
			}, 'decel');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.3,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.5,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.6,
				time: 800,
			}, 'accel', 'explode');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				time: 1500,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.z,
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 1,
				time: 200,
			}, 'ballistic2Under');
			attacker.delay(50);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.delay(700);
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			defender.delay(650);
			defender.anim({
				y: defender.y - 10,
				z: defender.behind(5),
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				z: defender.behind(20),
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	aciddownpour: {
		anim(scene, [attacker, defender]) {
			defender.delay(125);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.delay(100);
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.delay(75);
			defender.anim({
				y: defender.y - 40,
				opacity: 0,
				time: 200,
			}, 'accel');
			defender.delay(400);
			defender.anim({
				y: defender.y,
				opacity: 0,
				time: 200,
			});
			defender.anim({
				y: defender.y,
				opacity: 1,
				time: 200,
			});
			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 2300, 0.7);
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.5,
			}, {
				scale: 4,
				opacity: 0.3,
				time: 600,
			}, 'decel', 'fade');

			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x,
				z: defender.behind(50),
				scale: 2,
				xscale: 4,
				opacity: 0.6,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x - 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x - 60,
				z: defender.behind(50),
				scale: 2,
				xscale: 4,
				opacity: 0.6,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x + 30,
				y: attacker.y - 25,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.3,
			}, {
				x: defender.x + 60,
				z: defender.behind(50),
				scale: 2,
				xscale: 4,
				opacity: 0.6,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				xscale: 6,
				yscale: 1,
				opacity: 0.5,
				time: 650,
			}, {
				scale: 0,
				xscale: 2,
				yscale: 0.5,
				opacity: 0,
				time: 1600,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				scale: 2,
				xscale: 6,
				yscale: 1,
				opacity: 0.5,
				time: 1450,
			}, {
				scale: 0,
				xscale: 2,
				yscale: 0.5,
				opacity: 0,
				time: 2000,
			}, 'linear', 'fade');

			scene.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y + 200,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 775,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 975,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 790,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 875,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x + 40,
				y: defender.y + 200,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 925,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1100,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x + 40,
				y: defender.y - 50,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 940,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1100,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x - 70,
				y: defender.y + 200,
				z: defender.behind(-10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 975,
			}, {
				y: defender.y + 150,
				z: defender.behind(-10),
				opacity: 0,
				time: 1125,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x - 70,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 990,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1125,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x + 70,
				y: defender.y + 200,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1050,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1250,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x + 70,
				y: defender.y - 50,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1065,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1250,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1100,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1300,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1120,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1300,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1125,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1325,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1140,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1425,
			}, 'linear');

			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 2,
				opacity: 0.8,
				time: 350,
			}, {
				x: defender.x + 75,
				opacity: 0.3,
				scale: 4,
				xscale: 5,
				time: 1800,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 2,
				opacity: 0.8,
				time: 350,
			}, {
				x: defender.x - 75,
				opacity: 0.3,
				scale: 4,
				xscale: 5,
				time: 1800,
			}, 'linear', 'fade');
		},
	},
	blackholeeclipse: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 2500, 0.6);
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.2,
				time: 0,
			}, {
				scale: 2,
				opacity: 0.5,
				time: 600,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 0,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 400,
			}, 'accel');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 200,
			}, {
				scale: 0,
				opacity: 0.5,
				time: 600,
			}, 'accel');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 550,
			}, {
				scale: 0.7,
				opacity: 0.5,
				time: 900,
			}, 'decel', 'fade');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0.1,
				time: 550,
			}, {
				scale: 1.5,
				opacity: 1,
				time: 900,
			}, 'decel', 'fade');

			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.7,
				opacity: 0.5,
				time: 900,
			}, {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				opacity: 0.7,
				scale: 2,
				time: 1500,
			}, 'accel', 'explode');
			scene.showEffect('poisonwisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 1,
				time: 900,
			}, {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 3,
				time: 1500,
			}, 'accel', 'explode');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 1,
				opacity: 0.7,
				time: 1500,
			}, {
				scale: 2,
				time: 2200,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 4,
				opacity: 1,
				time: 1500,
			}, {
				scale: 4.2,
				time: 2200,
			}, 'linear', 'fade');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 1,
				opacity: 0.1,
				time: 1600,
			}, {
				scale: 3,
				opacity: 0,
				time: 1900,
			}, 'linear');
			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 1,
				opacity: 0.1,
				time: 1900,
			}, {
				scale: 3,
				opacity: 0,
				time: 2200,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.z,
				scale: 4.2,
				opacity: 0.5,
				time: 2200,
			}, {
				scale: 0,
				time: 2500,
			}, 'accel');

			defender.delay(1500);
			defender.anim({
				y: defender.y + 50,
				xscale: 0,
				yscale: 0,
				opacity: 0,
				time: 400,
			}, 'accel');
			defender.delay(1500);
			defender.anim({
				y: defender.y,
				opacity: 0,
				time: 1,
			});
			defender.anim({
				time: 400,
			});
		},
	},
	continentalcrush: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#421800 40%, #B8652F)', 2200, 0.6);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 25,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: defender.behind(-50),
				opacity: 0,
				time: 325,
			}, 'accel');
			scene.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-40),
				scale: 0.4,
				opacity: 0,
				time: 225,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: defender.behind(-30),
				opacity: 1,
				time: 525,
			}, 'accel');
			scene.showEffect('rocks', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-70),
				scale: 0.8,
				opacity: 0,
				time: 300,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: defender.behind(-20),
				scale: 0.4,
				opacity: 1,
				time: 650,
			}, 'accel');
			scene.showEffect('rock2', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(-90),
				scale: 0.2,
				opacity: 0,
				time: 325,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: defender.behind(-50),
				opacity: 1,
				time: 675,
			}, 'accel');
			scene.showEffect('rock1', {
				x: defender.x,
				y: defender.y + 175,
				z: defender.z,
				scale: 0.5,
				opacity: 0.5,
				time: 1000,
			}, {
				x: defender.x,
				y: defender.y + 55,
				z: defender.z,
				scale: 5.5,
				opacity: 1,
				time: 1800,
			}, 'decel', 'fade');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 1650,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 2050,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 1650,
			}, {
				scale: 6,
				opacity: 0,
				time: 2200,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 8,
				time: 1650,
			}, {
				xscale: 12,
				opacity: 0.5,
				time: 2000,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 6,
				time: 1650,
			}, {
				scale: 12,
				opacity: 0.7,
				time: 2200,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				time: 300,
			}, 'decel');
			attacker.delay(1700);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			defender.delay(1450);
			defender.anim({
				y: defender.y - 10,
				yscale: 0.4,
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				yscale: 0.3,
				time: 300,
			}, 'swing');
			defender.delay(200);
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	neverendingnightmare: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 1500, 0.6);
			let xstep = (defender.x + 200 - defender.x) / 5;
			let ystep = (defender.x - 200 - defender.x) / 5;
			let zstep = defender.z / 5;

			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x - 200 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 0,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x + 150 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x - 150 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 100,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x + 100 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x - 100 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 1.2,
					opacity: 1,
					time: 40 * i + 200,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x + 50 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x - 50 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 300,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x - 50 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x + 50 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 1.2,
					opacity: 1,
					time: 40 * i + 400,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x - 100 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x + 100 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 500,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x - 150 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x + 150 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 600,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (defender.x - 200 - defender.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x + 200 + xstep * (i + 1),
					y: (defender.y + 200) + ystep * (i + 1),
					z: defender.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 700,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 200,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 1300,
			}, 'linear', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 1,
				scale: 2,
				time: 200,
			}, {
				scale: 2.5,
				opacity: 0,
				time: 1500,
			}, 'linear', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 3,
				time: 200,
			}, {
				scale: 9,
				opacity: 1,
				time: 1500,
			}, 'linear', 'fade');
		},
	},
	corkscrewcrash: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1200, 0.3);
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 500,
			}, {
				scale: 3,
				opacity: 0,
				time: 800,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 700,
			}, {
				scale: 3,
				opacity: 0,
				time: 1000,
			}, 'linear');

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1,
			}, {
				y: attacker.y + 90,
				opacity: 0,
				time: 200,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-165),
				y: defender.y + 170,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 400,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 2,
				opacity: 0.5,
				time: 650,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 500,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 650,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 550,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 700,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 600,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 750,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 650,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 800,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 700,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 850,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 750,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 900,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 800,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 950,
			}, 'accel');
			scene.showEffect('iceball', {
				x: defender.leftof(-65),
				y: defender.y + 90,
				z: defender.z,
				scale: 3,
				yscale: 3.3,
				opacity: 0.8,
				time: 900,
			}, {
				x: defender.leftof(10),
				y: defender.y - 20,
				z: defender.behind(-10),
				scale: 0,
				xscale: 0,
				yscale: 0,
				time: 1050,
			}, 'accel');

			attacker.anim({
				y: defender.y + 120,
				xscale: 0,
				yscale: 0,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(825);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				xscale: 1,
				yscale: 1,
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(625);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(15),
				time: 200,
			}, 'decel');
			defender.anim({
				time: 350,
			}, 'swing');
		},
	},
	twinkletackle: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#FF99FF', 1700, 0.5);
			scene.showEffect('shine', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
			}, {
				opacity: 0,
				time: 200,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 250,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 150,
			}, {
				opacity: 0,
				time: 250,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 175,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 275,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100,
			}, {
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 125,
			}, {
				opacity: 0,
				time: 325,
			}, 'accel');

			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y + 2,
				z: defender.behind(5),
				scale: 0,
				opacity: 0.2,
				time: 600,
			}, {
				scale: 2,
				opacity: 0,
				time: 900,
			}, 'linear');
			scene.showEffect('shine', {
				x: defender.x + 30,
				y: defender.y + 5,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 600,
			}, {
				x: defender.x + 40,
				y: defender.y + 10,
				opacity: 0,
				time: 900,
			}, 'accel');
			scene.showEffect('shine', {
				x: defender.x - 30,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 700,
			}, {
				x: defender.x - 40,
				y: defender.y - 20,
				opacity: 0,
				time: 900,
			}, 'accel');
			scene.showEffect('shine', {
				x: defender.x + 15,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 700,
			}, {
				x: defender.x + 25,
				y: defender.y + 20,
				opacity: 0,
				time: 1000,
			}, 'accel');
			scene.showEffect('shine', {
				x: defender.x - 15,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.3,
				opacity: 0.7,
				time: 800,
			}, {
				x: defender.x - 25,
				y: defender.y - 40,
				opacity: 0,
				time: 1100,
			}, 'accel');
			attacker.delay(200);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				time: 375,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(20),
				time: 250,
			}, 'decel');
			attacker.anim({
				time: 700,
			}, 'ballistic2Back');
			defender.delay(600);
			defender.anim({
				x: defender.leftof(75),
				y: defender.y + 50,
				z: defender.behind(150),
				opacity: 0,
				time: 400,
			}, 'swing');
			defender.delay(500);
			defender.anim({
				opacity: 0,
				time: 1,
			});
			defender.anim({
				time: 400,
			});
		},
	},
	pulverizingpancake: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#421800 40%, #B8652F)', 600, 0.7, 1200);
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 1450,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1850,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 1450,
			}, {
				scale: 6,
				opacity: 0,
				time: 2000,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 1450,
			}, {
				xscale: 0,
				opacity: 0.5,
				time: 1800,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 1450,
			}, {
				scale: 9,
				opacity: 0.7,
				time: 2000,
			}, 'linear', 'explode');

			attacker.anim({
				x: defender.x,
				y: defender.y + 50,
				z: defender.behind(-150),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-125),
				time: 200,
			}, 'ballistic2Back');
			attacker.anim({
				x: defender.x,
				y: defender.y - 7,
				z: defender.behind(-125),
				yscale: 0.7,
				time: 50,
			}, 'ballistic2Back');
			attacker.anim({
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-30),
				time: 600,
			}, 'ballistic');
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				time: 200,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(1450);
			defender.anim({
				y: defender.y - 10,
				z: defender.behind(5),
				yscale: 0.3,
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				z: defender.behind(20),
				yscale: 0.3,
				time: 300,
			}, 'swing');
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	stokedsparksurfer: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#0000DD', 1100, 0.2, 500);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 1,
			}, {
				y: attacker.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			scene.showEffect('electroball', {
				x: defender.leftof(-200),
				y: defender.y + 80,
				z: defender.z,
				scale: 1,
				opacity: 0,
				time: 700,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 1,
				time: 1100,
			}, 'accel', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 1050,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1450,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 1050,
			}, {
				scale: 6,
				opacity: 0,
				time: 1600,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 1050,
			}, {
				xscale: 0,
				opacity: 0.5,
				time: 1600,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 1050,
			}, {
				scale: 9,
				time: 1600,
			}, 'linear', 'explode');

			scene.showEffect('lightning', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1000,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1150,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			attacker.anim({
				y: attacker.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(100);
			attacker.anim({
				x: attacker.leftof(-200),
				y: attacker.y + 80,
				z: attacker.z,
				opacity: 0,
				time: 350,
			}, 'accel');
			attacker.anim({
				x: defender.leftof(-200),
				y: defender.y + 80,
				z: defender.z,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'accel');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 1000,
			}, {
				scale: 2,
				opacity: 0,
				time: 1300,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(100),
				y: defender.y - 40,
				z: defender.z,
				opacity: 0,
				time: 175,
			});
			attacker.delay(700);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(1000);
			defender.anim({
				z: defender.behind(20),
				time: 300,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	catastropika: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#0000DD', 800, 0.2, 500);
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 25,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				opacity: 0,
				time: 325,
			}, 'decel');
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.8,
				time: 800,
			}, 'accel', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				scale: 1,
				opacity: 0.5,
				time: 600,
			}, {
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0.6,
				time: 800,
			}, 'accel', 'explode');

			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1250,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 1400,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 850,
			}, {
				xscale: 0,
				opacity: 0.5,
				time: 1400,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 850,
			}, {
				scale: 9,
				time: 1400,
			}, 'linear', 'explode');

			scene.showEffect('lightning', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 800,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 950,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');
			scene.showEffect('lightning', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 1100,
			}, {
				scale: 6,
				opacity: 0,
			}, 'linear');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y + 5,
				z: defender.behind(10),
				opacity: 0,
				time: 200,
			});
			attacker.delay(50);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.delay(700);
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			defender.delay(850);
			defender.anim({
				y: defender.y - 10,
				z: defender.behind(5),
				yscale: 0.3,
				time: 50,
			}, 'swing');
			defender.anim({
				y: defender.y - 20,
				z: defender.behind(20),
				yscale: 0.3,
				time: 300,
			}, 'swing');
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	sinisterarrowraid: {
		anim(scene, [attacker, defender]) {
			defender.delay(1050);
			defender.anim({
				z: defender.behind(20),
				time: 300,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x - 5,
				time: 75,
			}, 'swing');
			defender.anim({
				x: defender.x + 5,
				time: 75,
			}, 'swing');
			defender.anim({
				time: 100,
			}, 'accel');
			attacker.anim({
				y: attacker.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(100);
			attacker.anim({
				x: attacker.leftof(-200),
				y: attacker.y + 80,
				z: attacker.z,
				opacity: 0,
				time: 350,
			}, 'accel');
			attacker.anim({
				x: defender.leftof(-200),
				y: defender.y + 80,
				z: defender.z,
				time: 1,
			}, 'linear');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				time: 350,
			}, 'accel');

			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.5,
				time: 1000,
			}, {
				scale: 2,
				opacity: 0,
				time: 1300,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(100),
				y: defender.y - 40,
				z: defender.z,
				opacity: 0,
				time: 175,
			});
			attacker.delay(700);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');

			scene.backgroundEffect('linear-gradient(#440044 30%, #000000', 2300, 0.4);
			scene.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y + 200,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1475,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1775,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x - 20,
				y: defender.y - 50,
				z: defender.behind(5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1490,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1775,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x + 40,
				y: defender.y + 200,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1625,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 1900,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x + 40,
				y: defender.y - 50,
				z: defender.behind(-5),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1640,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1900,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x - 70,
				y: defender.y + 200,
				z: defender.behind(-10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1675,
			}, {
				y: defender.y + 150,
				z: defender.behind(-10),
				opacity: 0,
				time: 1925,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x - 70,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1690,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 1925,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x + 70,
				y: defender.y + 200,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1750,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 2050,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x + 70,
				y: defender.y - 50,
				z: defender.behind(10),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1765,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 2050,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1800,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 2100,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1820,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 2100,
			}, 'linear');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y + 200,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.1,
				yscale: 5,
				time: 1825,
			}, {
				y: defender.y + 150,
				opacity: 0,
				time: 2125,
			}, 'decel');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 35,
				z: defender.behind(-20),
				opacity: 0.4,
				xscale: 0.3,
				yscale: 0.1,
				time: 1840,
			}, {
				xscale: 0.6,
				yscale: 0.1,
				opacity: 0,
				time: 2125,
			}, 'linear');
		},
	},
	oceanicoperetta: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#000000 20%, #0000DD)', 2700, 0.4);
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-raindance.jpg')`, 700, 0.2, 2000);
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 120,
				z: attacker.z,
				scale: 2.5,
				opacity: 0,
			}, {
				scale: 3,
				opacity: 1,
				time: 599,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 120,
				z: attacker.z,
				scale: 3,
				opacity: 0,
			}, {
				scale: 3.25,
				opacity: 0.7,
				time: 599,
			}, 'linear', 'fade');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y + 120,
				z: attacker.z,
				scale: 3,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				time: 2000,
			}, 'accel', 'explode');
			scene.showEffect('waterwisp', {
				x: attacker.x,
				y: attacker.y + 120,
				z: attacker.z,
				scale: 3.25,
				opacity: 0.7,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				time: 2000,
			}, 'accel', 'explode');
		},
	},
	extremeevoboost: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1000, 0.3);
			let xstep = (attacker.x + 200 - attacker.x) / 5;
			let ystep = (attacker.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			for (let i = 0; i < 5; i++) {
				scene.showEffect('flareball', {
					x: attacker.x - 200 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 0,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x + 150 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('electroball', {
					x: attacker.x - 150 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 100,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x + 100 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('waterwisp', {
					x: attacker.x - 100 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.2,
					opacity: 1,
					time: 40 * i + 200,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x + 50 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('shadowball', {
					x: attacker.x - 50 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 300,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x - 50 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('poisonwisp', {
					x: attacker.x + 50 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 1.2,
					opacity: 1,
					time: 40 * i + 400,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x - 100 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('iceball', {
					x: attacker.x + 100 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 500,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x - 150 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('energyball', {
					x: attacker.x + 150 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 600,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			xstep = (attacker.x - 200 - attacker.x) / 5;
			for (let i = 0; i < 5; i++) {
				scene.showEffect('mistball', {
					x: attacker.x + 200 + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 0.6,
					opacity: 0.7,
					time: 40 * i + 700,
				}, {
					opacity: 0,
					time: 50 * i + 1000,
				}, 'linear');
			}
			scene.showEffect('rainbow', {
				x: attacker.x,
				y: attacker.y - 5,
				z: attacker.z,
				scale: 0.8,
				opacity: 0,
				time: 0,
			}, {
				scale: 1,
				opacity: 0.6,
				time: 1000,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 2,
				opacity: 0,
			}, {
				scale: 2.5,
				opacity: 0.7,
				time: 1000,
			}, 'linear', 'explode');
		},
	},
	guardianofalola: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#421800 40%, #B8652F)', 1700, 0.6, 300);
			scene.showEffect('fist1', {
				x: attacker.leftof(200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 400,
			}, {
				x: defender.x,
				y: defender.y + 15,
				z: defender.z,
				scale: 5.5,
				opacity: 0.5,
				time: 799,
			}, 'accel', 'fade');
			scene.showEffect('fist1', {
				x: defender.x,
				y: defender.y + 15,
				z: defender.z,
				scale: 5.5,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y - 10,
				z: defender.z,
				xscale: 10,
				opacity: 0,
				time: 1050,
			}, 'linear');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 850,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1200,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 1050,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1500,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 1,
				time: 1250,
			}, {
				scale: 2,
				xscale: 12,
				opacity: 0,
				time: 1800,
			}, 'linear', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 0.7,
				scale: 1,
				time: 850,
			}, {
				scale: 6,
				opacity: 0,
				time: 2000,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 6,
				time: 850,
			}, {
				scale: 12,
				opacity: 0.8,
				time: 2000,
			}, 'linear', 'explode');

			attacker.anim({
				x: attacker.x,
				y: attacker.y + 60,
				z: attacker.behind(40),
				opacity: 0,
				time: 250,
			}, 'accel');
			attacker.delay(1300);
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.delay(750);
			defender.anim({
				y: defender.y - 30,
				z: defender.z,
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.delay(700);
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	splinteredstormshards: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect(`url('https://${Config.routes.client}/sprites/gen6bgs/bg-earthycave.jpg')`, 2700, 0.8, 300);
			scene.backgroundEffect('linear-gradient(#FFC720 15%, #421800)', 2700, 0.7);
			scene.backgroundEffect('#ffffff', 400, 0.6, 2500);
			scene.showEffect('rock3', {
				x: defender.x - 50,
				y: defender.y + 20,
				z: defender.behind(20),
				scale: 0.4,
				opacity: 1,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1000,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 50,
				y: defender.y + 40,
				z: defender.behind(-40),
				scale: 0.2,
				opacity: 1,
				time: 150,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1100,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 70,
				y: defender.y + 45,
				z: defender.behind(10),
				scale: 0.4,
				opacity: 1,
				time: 175,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1175,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 60,
				y: defender.y + 60,
				z: defender.behind(30),
				scale: 0.3,
				opacity: 1,
				time: 200,
			}, {
				y: defender.x + 100,
				opacity: 0,
				time: 1200,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 40,
				y: defender.y + 40,
				z: defender.behind(-30),
				scale: 0.5,
				opacity: 1,
				time: 210,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1300,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 30,
				y: defender.y + 25,
				z: defender.behind(20),
				scale: 0.2,
				opacity: 1,
				time: 220,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1220,
			}, 'accel');

			scene.showEffect('rock3', {
				x: defender.x - 80,
				y: defender.y + 40,
				z: defender.behind(-40),
				scale: 0.2,
				opacity: 1,
				time: 650,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x - 72,
				y: defender.y + 10,
				z: defender.behind(20),
				scale: 0.3,
				opacity: 1,
				time: 750,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 80,
				y: defender.y + 40,
				z: defender.behind(-60),
				scale: 0.4,
				opacity: 1,
				time: 850,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1500,
			}, 'accel');
			scene.showEffect('rock3', {
				x: defender.x + 70,
				y: defender.y + 40,
				z: defender.behind(-60),
				scale: 0.4,
				opacity: 1,
				time: 950,
			}, {
				y: defender.y + 100,
				opacity: 0,
				time: 1500,
			}, 'accel');

			scene.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1600,
			}, {
				x: defender.x + 30,
				y: defender.y,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-200),
				y: defender.y + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1600,
			}, {
				x: defender.x + 30,
				y: defender.y,
				scale: 1,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(-200),
				y: defender.y - 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1750,
			}, {
				x: defender.x + 30,
				y: defender.y - 5,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-150),
				y: defender.y + 20 + 175,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1750,
			}, {
				x: defender.x + 20,
				y: defender.y - 5,
				scale: 1,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(150),
				y: defender.y + 255,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1900,
			}, {
				x: defender.x - 20,
				y: defender.y,
				scale: 1,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(150),
				y: defender.y + 255,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1900,
			}, {
				x: defender.x - 20,
				y: defender.y,
				scale: 1,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(-300),
				y: defender.y - 20 + 150,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1950,
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-300),
				y: defender.y - 20 + 150,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 1950,
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1,
				opacity: 0.4,
			}, 'accel', 'explode');
			scene.showEffect('flareball', {
				x: defender.leftof(-175),
				y: defender.y - 20 + 225,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 2100,
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1.5,
				opacity: 0.8,
			}, 'accel', 'explode');
			scene.showEffect('rock3', {
				x: defender.leftof(-175),
				y: defender.y - 20 + 225,
				z: defender.z,
				scale: 0.1,
				opacity: 0,
				time: 2100,
			}, {
				x: defender.x + 20,
				y: defender.y,
				scale: 1,
				opacity: 0.4,
			}, 'accel', 'explode');

			scene.showEffect('mudwisp', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.8,
				time: 1850,
			}, {
				scale: 1,
				xscale: 9,
				opacity: 0,
				time: 2750,
			}, 'decel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 2,
				time: 1950,
			}, {
				scale: 6,
				time: 2700,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 3,
				yscale: 10,
				time: 1850,
			}, {
				xscale: 0,
				time: 2700,
			}, 'accel', 'fade');
			scene.showEffect('wisp', {
				x: defender.x - 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 2450,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 2,
				opacity: 0.1,
				time: 2750,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 2575,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1.5,
				opacity: 0.1,
				time: 2875,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 0.6,
				opacity: 0.6,
				time: 2600,
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 2,
				opacity: 0.1,
				time: 2900,
			}, 'linear', 'explode');

			defender.delay(1925);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(15),
				time: 75,
				opacity: 0,
			}, 'swing');
			defender.delay(300);
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	letssnuggleforever: {
		anim(scene, [attacker, defender]) {
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(10),
				scale: 4,
				time: 400,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y + 20,
				z: defender.behind(10),
				yscale: 4.2,
				xscale: 4,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(10),
				yscale: 3,
				xscale: 4.2,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y + 20,
				z: defender.behind(10),
				yscale: 4.5,
				xscale: 4,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(10),
				yscale: 3,
				xscale: 4.2,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y + 20,
				z: defender.behind(10),
				yscale: 4.5,
				xscale: 4,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y - 5,
				z: defender.behind(10),
				yscale: 3,
				xscale: 4.2,
				time: 200,
			});
			attacker.anim({
				x: defender.x,
				y: defender.y + 15,
				z: defender.behind(10),
				scale: 4,
				time: 200,
			});
			attacker.delay(300);
			attacker.anim({
				time: 500,
			}, 'ballistic');
			defender.delay(750);
			defender.anim({
				opacity: 0,
				time: 50,
			}, 'swing');
			defender.delay(2100);
			defender.anim({
				y: defender.y + 100,
				z: defender.behind(5),
				opacity: 1,
				time: 300,
			}, 'decel');
			defender.anim({
				time: 250,
			}, 'accel');
			defender.anim({
				x: defender.x,
				y: defender.y - 30,
				yscale: 0.25,
				time: 50,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');

			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y - 10,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 1575,
			}, {
				scale: 2,
				opacity: 0,
				time: 1775,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 25,
				y: defender.y - 25,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 1700,
			}, {
				scale: 2,
				opacity: 0,
				time: 1900,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 25,
				y: defender.y - 10,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 1700,
			}, {
				scale: 2,
				opacity: 0,
				time: 2000,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 2,
				y: defender.y - 5,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 1800,
			}, {
				scale: 2,
				opacity: 0,
				time: 2100,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 35,
				y: defender.y - 20,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 1900,
			}, {
				scale: 2,
				opacity: 0,
				time: 2300,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 5,
				y: defender.y + 20,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 2100,
			}, {
				scale: 2,
				opacity: 0,
				time: 2300,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x - 35,
				y: defender.y - 35,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 2200,
			}, {
				scale: 2,
				opacity: 0,
				time: 2500,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x + 35,
				y: defender.y - 35,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 2300,
			}, {
				scale: 2,
				opacity: 0,
				time: 2600,
			}, 'linear');
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y - 10,
				z: defender.behind(5),
				scale: 1,
				opacity: 1,
				time: 2500,
			}, {
				scale: 3,
				opacity: 0,
				time: 2800,
			}, 'linear');
			scene.showEffect('mudwisp', {
				x: defender.x + 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 1450,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 1750,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 10,
				y: defender.y + 10,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 1575,
			}, {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 1875,
			}, 'linear', 'explode');
			scene.showEffect('mudwisp', {
				x: defender.x + 20,
				y: defender.y - 30,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 1600,
			}, {
				x: defender.x + 30,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				opacity: 0.8,
				time: 2000,
			}, 'linear', 'explode');
			scene.showEffect('wisp', {
				x: defender.x + 5,
				y: defender.y - 5,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 1950,
			}, {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1.5,
				opacity: 0.8,
				time: 2350,
			}, 'linear', 'explode');
			scene.showEffect('mudwisp', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 1,
				opacity: 0.6,
				time: 2175,
			}, {
				x: defender.x + 20,
				y: defender.y - 25,
				scale: 1.5,
				opacity: 0.8,
				time: 2575,
			}, 'linear', 'explode');
		},
	},
	clangoroussoulblaze: {
		anim(scene, [attacker, ...defenders]) {
			attacker.anim({ x: attacker.x - 10, time: 300 });
			attacker.anim({ x: attacker.x + 10, time: 400 });
			attacker.anim({ x: attacker.x, time: 300 });
			attacker.delay(50);
			attacker.anim({
				y: attacker.y - 10,
				yscale: 0.9,
				time: 50,
			});
			attacker.anim({
				y: attacker.y + 250,
				yscale: 1,
				time: 300,
			}, 'decel');
			attacker.delay(1700);
			attacker.anim({
				opacity: 0,
				time: 1,
			});
			attacker.anim({
				opacity: 1,
				time: 200,
			});
			for (const defender of defenders) {
				defender.delay(1825);
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(5),
					time: 75,
				}, 'swing');
				defender.anim({
					time: 75,
				}, 'swing');
				defender.anim({
					z: defender.behind(15),
					time: 75,
					opacity: 0,
				}, 'swing');
				defender.delay(400);
				defender.anim({
					time: 200,
				}, 'swing');
			}
			const defender = defenders[1] || defenders[0];
			scene.backgroundEffect('#000000', 300, 0.9);
			scene.backgroundEffect(`url('https://${Config.routes.client}/sprites/gen6bgs/bg-earthycave.jpg')`, 2000, 0.7, 300);
			scene.backgroundEffect('linear-gradient(#FB5C1E 20%, #3F1D0F', 2000, 0.6, 300);
			scene.backgroundEffect('#FFFFFF', 1000, 0.9, 2200);
			scene.showEffect('shine', {
				x: attacker.x - 10,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
			}, {
				opacity: 0,
				time: 300,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 100,
			}, {
				opacity: 0,
				time: 400,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x - 5,
				y: attacker.y + 15,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 200,
			}, {
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('shine', {
				x: attacker.x + 5,
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.3,
				opacity: 0.6,
				time: 300,
			}, {
				opacity: 0,
				time: 600,
			}, 'accel');

			scene.showEffect('shine', {
				x: attacker.x + 20,
				y: attacker.y - 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 0,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 400,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x - 20,
				y: attacker.y + 40,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 200,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 600,
			}, 'accel');
			scene.showEffect('shine', {
				x: attacker.x,
				y: attacker.y + 30,
				z: attacker.z,
				scale: 0.2,
				opacity: 1,
				time: 400,
			}, {
				y: attacker.y + 40,
				opacity: 0,
				time: 800,
			}, 'accel');

			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 1700,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2100,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 1800,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2200,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 1900,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2300,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2000,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2400,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2100,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2500,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2200,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2600,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2300,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2700,
			}, 'linear');
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2400,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2800,
			}, 'linear');
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 0,
				opacity: 1,
				time: 2500,
			}, {
				y: defender.y - 200,
				z: defender.behind(150),
				scale: 10,
				opacity: 0,
				time: 2900,
			}, 'linear');

			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2300,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2550,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 0.6,
				time: 2700,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
		},
	},
	soulstealing7starstrike: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('linear-gradient(#043B13 55%, #3FBF99', 3600, 0.7);
			scene.backgroundEffect('#ffffff', 700, 0.7, 3300);
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 300,
			}, {
				x: attacker.leftof(-20),
				y: attacker.y,
				z: attacker.behind(-40),
				opacity: 0,
				time: 500,
			}, 'decel');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 350,
			}, {
				x: attacker.leftof(20),
				y: attacker.y - 5,
				z: attacker.behind(-40),
				opacity: 0,
				time: 600,
			}, 'decel');
			scene.showEffect('fist', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 1,
				time: 400,
			}, {
				x: attacker.x,
				y: attacker.y + 5,
				z: attacker.behind(-40),
				opacity: 0,
				time: 700,
			}, 'decel');

			scene.showEffect('iceball', {
				x: defender.x - 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.1,
				opacity: 1,
				time: 250,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 300,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: attacker.x,
				y: defender.y + 30,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 450,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 550,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x + 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 650,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 700,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x - 10,
				y: attacker.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 850,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 900,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x + 10,
				y: attacker.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 1050,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 1100,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 1250,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 1300,
			}, 'linear', 'explode');
			scene.showEffect('iceball', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 1450,
			}, {
				opacity: 0,
				scale: 0.5,
				time: 1500,
			}, 'linear', 'explode');

			scene.showEffect('shine', {
				x: defender.x - 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 300,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x,
				y: defender.y + 30,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 500,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x + 30,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 700,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x - 10,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 900,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x + 10,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 1100,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x - 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 1300,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');
			scene.showEffect('shine', {
				x: defender.x + 10,
				y: defender.y - 10,
				z: defender.z,
				scale: 0.1,
				opacity: 0.7,
				time: 1500,
			}, {
				opacity: 0.9,
				scale: 0.2,
				time: 2500,
			}, 'decel', 'explode');

			scene.showEffect('zsymbol', {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 0.7,
				opacity: 1,
				time: 1600,
			}, {
				scale: 1,
				opacity: 0,
				time: 2600,
			}, 'decel');

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				scale: 1,
				time: 1900,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				opacity: 0,
				time: 2300,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				scale: 1,
				time: 1920,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				opacity: 0,
				time: 2320,
			}, 'accel');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				scale: 1,
				time: 1940,
			}, {
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				opacity: 0,
				time: 2340,
			}, 'accel');

			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 60,
				z: defender.z,
				scale: 1,
				xscale: 2,
				opacity: 0.5,
				time: 3350,
			}, {
				scale: 1,
				xscale: 12,
				opacity: 0,
				time: 3750,
			}, 'decel', 'fade');
			scene.showEffect('shadowball', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 0.4,
				scale: 0.5,
				time: 3350,
			}, {
				scale: 3,
				opacity: 0,
				time: 3900,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y + 350,
				z: defender.z,
				opacity: 1,
				scale: 5,
				yscale: 13,
				time: 3350,
			}, {
				opacity: 0.5,
				xscale: 0,
				time: 4200,
			}, 'accel', 'fade');
			scene.showEffect('poisonwisp', {
				x: defender.x,
				y: defender.y - 30,
				z: defender.z,
				opacity: 1,
				scale: 2,
				time: 3350,
			}, {
				opacity: 0.5,
				scale: 6,
				time: 4200,
			}, 'decel', 'explode');

			attacker.anim({
				z: attacker.behind(15),
				time: 200,
			}, 'decel');
			attacker.anim({
				z: defender.behind(-175),
				time: 300,
			}, 'accel');
			attacker.anim({
				z: attacker.z,
				time: 400,
			}, 'swing');
			attacker.delay(1100);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 250,
				z: attacker.behind(-50),
				time: 300,
			}, 'decel');
			attacker.delay(300);
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y,
				z: defender.behind(-10),
				opacity: 1,
				time: 300,
			}, 'linear');
			attacker.anim({
				x: defender.leftof(-10),
				y: defender.y,
				z: defender.behind(-10),
				opacity: 0,
				time: 0,
			}, 'linear');
			attacker.delay(600);
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.delay(600);
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			defender.delay(400);
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.anim({
				z: defender.behind(5),
				time: 75,
			}, 'swing');
			defender.anim({
				time: 75,
			}, 'swing');
			defender.delay(2275);
			defender.anim({
				z: defender.behind(5),
				opacity: 0,
				time: 75,
			}, 'swing');
			defender.delay(600);
			defender.anim({
				time: 150,
			}, 'swing');
		},
	},
	searingsunrazesmash: {
		anim(scene, [attacker, defender]) {
			let xstep = (defender.x - attacker.x) / 5;
			let ystep = (defender.x - 200 - attacker.x) / 5;
			let zstep = (defender.z - attacker.z) / 5;

			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/weather-trickroom.png')`, 700, 1);
			scene.backgroundEffect(`url('https://${Config.routes.client}/fx/bg-space.jpg')`, 2500, 1, 700);
			scene.backgroundEffect('#FFFFFF', 1500, 1, 2500);

			scene.showEffect('flareball', {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 2.5,
				opacity: 1,
				time: 1700,
			}, {
				scale: 3,
				opacity: 0,
				time: 2400,
			}, 'decel');
			for (let i = 0; i < 5; i++) {
				scene.showEffect('flareball', {
					x: attacker.x + xstep * (i + 1),
					y: (attacker.y + 200) + ystep * (i + 1),
					z: attacker.z + zstep * (i + 1),
					scale: 2,
					opacity: 0.8,
					time: 40 * i + 1900,
				}, {
					opacity: 0,
					time: 60 * i + 2700,
				}, 'linear');
			}
			scene.showEffect('iceball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 1,
				opacity: 0.1,
				time: 2000,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 1.5,
				time: 2400,
			}, 'accel', 'explode');
			scene.showEffect('iceball', {
				x: attacker.leftof(-25),
				y: attacker.y + 250,
				z: attacker.z,
				scale: 1,
				opacity: 0.8,
				time: 2050,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(5),
				scale: 1.5,
				time: 2450,
			}, 'accel', 'explode');

			scene.showEffect('flareball', {
				x: defender.x,
				y: defender.y - 50,
				z: defender.z,
				scale: 1,
				xscale: 3,
				opacity: 0.5,
				time: 2275,
			}, {
				scale: 3,
				xscale: 8,
				opacity: 0.1,
				time: 2875,
			}, 'linear', 'fade');
			scene.showEffect('fireball', {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 2500,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x - 40,
				y: defender.y - 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 2650,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x + 10,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 2800,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 2950,
			}, {
				scale: 6,
				opacity: 0,
			}, 'decel');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				opacity: 1,
				scale: 3,
				time: 2350,
			}, {
				scale: 13,
				time: 3700,
			}, 'linear', 'explode');

			attacker.anim({
				opacity: 0,
				time: 100,
			});
			attacker.delay(500);
			attacker.anim({
				opacity: 1,
				time: 100,
			});
			attacker.delay(500);
			attacker.anim({
				y: defender.y + 120,
				opacity: 0,
				time: 300,
			}, 'accel');
			attacker.delay(2525);
			attacker.anim({
				x: attacker.x,
				y: attacker.y + 40,
				z: attacker.behind(40),
				time: 1,
			});
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				time: 250,
			}, 'decel');
			defender.anim({
				opacity: 0,
				time: 100,
			});
			defender.delay(500);
			defender.anim({
				opacity: 1,
				time: 100,
			});
			defender.delay(1875);
			defender.anim({
				z: defender.behind(30),
				time: 500,
				opacity: 0,
			}, 'decel');
			defender.delay(600);
			defender.anim({
				time: 400,
			}, 'swing');
		},
	},
	supercellslam: {
		anim(scene, [attacker, defender]) {
			scene.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 25,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
			}, 'ballistic', 'fade');
			scene.showEffect(attacker.sp, {
				x: defender.leftof(-10),
				y: attacker.y + 170,
				z: attacker.behind(-35),
				opacity: 0.3,
				time: 75,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(0),
			}, 'ballistic', 'fade');
			scene.showEffect('electroball', {
				x: defender.x,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 500,
			}, {
				x: defender.x,
				y: defender.y + 10,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 700,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: defender.x - 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 600,
			}, {
				x: defender.x - 30,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 800,
			}, 'decel', 'fade');
			scene.showEffect('electroball', {
				x: defender.x + 40,
				y: defender.y - 40,
				z: defender.z,
				scale: 1,
				opacity: 1,
				time: 700,
			}, {
				x: defender.x + 40,
				y: defender.y,
				z: defender.z,
				scale: 1.25,
				opacity: 0.4,
				time: 900,
			}, 'decel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y + 170,
				z: defender.behind(-30),
				time: 400,
			}, 'ballistic');
			attacker.anim({
				x: defender.x,
				y: defender.y + 5,
				z: defender.z,
				time: 200,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(500);
			defender.anim({
				y: defender.y - 30,
				z: defender.behind(20),
				yscale: 0.5,
				time: 200,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	psychicnoise: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0,
				opacity: 0.8,
				time: 0,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 5,
				opacity: 0.1,
				time: 750,
			}, 'linear');
			scene.showEffect('poisonwisp', {
				x: defender.x - 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 900,
			}, {
				scale: 2,
				opacity: 0,
			}, 'decel');
			scene.showEffect('poisonwisp', {
				x: defender.x + 20,
				y: defender.y + 20,
				z: defender.z,
				scale: 0,
				opacity: 1,
				time: 1050,
			}, {
				scale: 2,
				opacity: 0,
			}, 'decel');
		},
	},
	fishiousrend: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y + 80,
				z: defender.behind(-15),
				scale: 1.5,
				opacity: 0.8,
				time: 400,
			}, {
				y: defender.y,
				z: defender.z,
				scale: 0.5,
				opacity: 1,
				time: 500,
			}, 'linear', 'explode');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x + 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			scene.showEffect('waterwisp', {
				x: defender.x,
				y: defender.y - 25,
				z: defender.z,
				scale: 1,
				time: 500,
			}, {
				x: defender.x - 50,
				scale: 0.6,
				opacity: 0.3,
				time: 800,
			}, 'linear', 'fade');
			BattleOtherAnims.bite.anim(scene, [attacker, defender]);
			BattleOtherAnims.contactattack.anim(scene, [attacker, defender]);
		},
	},
	stompingtantrum: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.anger.anim(scene, [attacker, defender]);

			attacker.anim({
				y: attacker.y + 20,
				time: 175,
			}, 'swing');
			attacker.anim({
				y: attacker.y,
				time: 125,
			}, 'accel');
			attacker.anim({
				y: attacker.y + 40,
				time: 175,
			}, 'swing');
			attacker.anim({
				y: attacker.y,
				time: 75,
			}, 'accel');

			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('#000000', 1000, 0.3);
			for (let i = 0; i < 4; i++) {
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.8,
					time: 500,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 0.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade', { filter: 'hue-rotate(-15deg) brightness(0.5) saturate(0.7)' });
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.8,
					time: 500,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y + 5,
					z: attacker.z + 97 * yf2[i],
					scale: 0.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade', { filter: 'hue-rotate(-15deg) brightness(0.5) saturate(0.7)' });
			}

			defender.delay(500);

			scene.showEffect('rock1', {
				x: defender.x,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.4,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');

			scene.showEffect('rock2', {
				x: defender.x + 20,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x + 80,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.4,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');

			scene.showEffect('rock3', {
				x: defender.x - 20,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x - 80,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.4,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');

			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 550,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 850,
			}, 'accel', 'fade');
			scene.showEffect(attacker.sp, {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				opacity: 0.3,
				time: 600,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 900,
			}, 'accel', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	temperflare: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.anger.anim(scene, [attacker, defender]);

			attacker.anim({
				y: attacker.y + 20,
				time: 175,
			}, 'swing');
			attacker.anim({
				y: attacker.y,
				time: 125,
			}, 'accel');
			attacker.anim({
				y: attacker.y + 40,
				time: 175,
			}, 'swing');
			attacker.anim({
				y: attacker.y,
				time: 75,
			}, 'accel');
			defender.delay(500);

			let xf = [1, -1, 1, -1];
			let yf = [1, -1, -1, 1];
			let xf2 = [1, 0, -1, 0];
			let yf2 = [0, 1, 0, -1];

			scene.backgroundEffect('linear-gradient(#390000 30%, #B84038)', 1000, 0.3);
			for (let i = 0; i < 4; i++) {
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.8,
					time: 500,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 0.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade', { filter: 'hue-rotate(-15deg)' });
				scene.showEffect('flareball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0.3,
					opacity: 0.8,
					time: 500,
				}, {
					x: attacker.x + 113 * xf2[i],
					y: attacker.y + 5,
					z: attacker.z + 97 * yf2[i],
					scale: 0.5,
					opacity: 0,
					time: 800,
				}, 'decel', 'fade', { filter: 'hue-rotate(-15deg)' });
				scene.showEffect('blackwisp', {
					x: attacker.x + 120 * xf[i],
					y: attacker.y,
					z: attacker.z + 68 * yf[i],
					scale: 0.5,
					opacity: 0.5,
					time: 650,
				}, {
					x: attacker.x + 120 * xf[i],
					y: attacker.y + 30,
					z: attacker.z + 68 * yf[i],
					scale: 0.5,
					opacity: 0,
					time: 950,
				}, 'decel', 'explode');
			}

			scene.showEffect('fireball', {
				x: defender.x + 20,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x + 80,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.8,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');

			scene.showEffect('fireball', {
				x: defender.x,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.8,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');

			scene.showEffect('fireball', {
				x: defender.x - 20,
				y: defender.y - 5,
				z: defender.z,
				scale: 0.4,
				opacity: 1,
				time: 800,
			}, {
				x: defender.x - 80,
				y: defender.y + 20,
				z: defender.z,
				scale: 0.8,
				opacity: 0,
				time: 1100,
			}, 'ballistic', 'fade');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 300,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');
			defender.delay(280);
			defender.anim({
				z: defender.behind(20),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	terastarstorm: {
		anim(scene, [attacker, ...defenders]) {
			scene.backgroundEffect('#000000', 900, 0.5);

			scene.showEffect('iceball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.75,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.25,
				opacity: 0,
				time: 200,
			}, 'decel', '', { filter: 'hue-rotate(0deg)' });
			scene.showEffect('wisp', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1,
				opacity: 0.6,
			}, {
				x: attacker.x,
				y: attacker.y + 200,
				z: attacker.z,
				scale: 1.5,
				opacity: 0,
				time: 200,
			}, 'decel');

			for (let defender of defenders) {
				let xstep = (defender.x - attacker.x) / 6;
				let ystep = (defender.y - 200 - attacker.y) / 6;
				let zstep = (defender.z - attacker.z) / 6;

				for (let i = 0; i < 6; i++) {
					scene.showEffect('electroball', {
						x: attacker.x + xstep * (i + 1),
						y: (attacker.y + 200) + ystep * (i + 1),
						z: attacker.z + zstep * (i + 1),
						scale: 0.7,
						opacity: 0.6,
						time: 40 * i + 300,
					}, {
						opacity: 0,
						time: 100 * i + 500,
					}, 'linear', '', { filter: `hue-rotate(${60 * i + 30}deg)` });
				}

				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 300,
				}, {
					x: defender.x + 30,
					y: defender.y + 30,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 500,
				}, 'linear', 'explode', { filter: 'hue-rotate(30deg)' });
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 375,
				}, {
					x: defender.x + 20,
					y: defender.y - 30,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 575,
				}, 'linear', 'explode', { filter: 'hue-rotate(90deg)' });
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 425,
				}, {
					x: defender.x - 10,
					y: defender.y + 10,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 625,
				}, 'linear', 'explode', { filter: 'hue-rotate(150deg)' });
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 450,
				}, {
					x: defender.x - 30,
					y: defender.y,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 650,
				}, 'linear', 'explode', { filter: 'hue-rotate(210deg)' });
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 500,
				}, {
					x: defender.x + 10,
					y: defender.y - 10,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 700,
				}, 'linear', 'explode', { filter: 'hue-rotate(270deg)' });
				scene.showEffect('electroball', {
					x: attacker.x,
					y: attacker.y + 200,
					z: attacker.z,
					scale: 0.4,
					opacity: 0.6,
					time: 575,
				}, {
					x: defender.x - 20,
					y: defender.y,
					z: defender.z,
					scale: 0.6,
					opacity: 0.3,
					time: 775,
				}, 'linear', 'explode', { filter: 'hue-rotate(330deg)' });
			}
		},
	},
	thunderclap: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 200, 0.2);
			scene.showEffect('electroball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 1.5,
				opacity: 0.8,
			}, {
				scale: 3,
				opacity: 0.2,
				time: 200,
			}, 'accel', 'fade', { filter: 'hue-rotate(150deg)' });
			scene.showEffect('lightning', {
				x: defender.x,
				y: defender.y + 150,
				z: defender.z,
				yscale: 0,
				xscale: 2,
				time: 200,
			}, {
				y: defender.y + 50,
				yscale: 1,
				xscale: 1.5,
				opacity: 0.8,
				time: 400,
			}, 'linear', 'fade', { filter: 'hue-rotate(180deg)' });
		},
	},
	mightycleave: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('sword', {
				x: attacker.leftof(-10),
				y: attacker.y - 10,
				z: attacker.z,
				scale: 0.5,
				opacity: 1,
			}, {
				y: attacker.y + 10,
				scale: 1,
				opacity: 0.4,
				time: 300,
			}, 'decel', 'fade');
			attacker.delay(300);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(70),
				time: 300,
				opacity: 0.5,
			}, 'accel');
			attacker.anim({
				x: defender.x,
				y: defender.x,
				z: defender.behind(100),
				opacity: 0,
				time: 100,
			}, 'linear');
			attacker.anim({
				x: attacker.x,
				y: attacker.y,
				z: attacker.behind(70),
				opacity: 0,
				time: 1,
			}, 'linear');
			attacker.anim({
				opacity: 1,
				time: 500,
			}, 'decel');
			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 500,
				xscale: 1.2,
				yscale: 0.4,
				opacity: 0.8,
			}, {
				time: 760,
				xscale: 1.4,
				yscale: 0.6,
				opacity: 0.4,
			}, 'accel', 'explode', { filter: 'hue-rotate(180deg)', rotate: '-45deg' });
			scene.showEffect('rightslash', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 1.5,
				time: 500,
			}, {
				scale: 2,
				opacity: 0,
				time: 760,
			}, 'accel', 'fade');
			defender.delay(760);
			defender.anim({
				z: defender.behind(30),
				time: 100,
			}, 'swing');
			defender.anim({
				time: 300,
			}, 'swing');
		},
	},
	spiritbreak: {
		anim(scene, [attacker, defender]) {
			scene.backgroundEffect('#000000', 1000, 0.3);

			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.4,
				time: 425,
				opacity: 0.2,
			}, {
				scale: 0.6,
				time: 750,
				opacity: 1,
			}, 'decel', 'fade');
			scene.showEffect('mistball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 750,
				opacity: 1,
			}, {
				time: 1000,
				scale: 2.5,
				opacity: 0.2,
			}, 'decel', 'explode');

			scene.showEffect('iceball', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				time: 850,
				opacity: 0.4,
			}, {
				time: 1000,
				scale: 3,
				opacity: 0.1,
			}, 'decel', 'explode');

			scene.showEffect('shine', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 750,
				scale: 0.8,
			}, {
				opacity: 0.4,
				time: 800,
			}, 'decel', 'explode', { filter: 'invert(1)' });
			scene.showEffect('impact', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 875,
				scale: 0.8,
			}, {
				opacity: 0.4,
				time: 925,
			}, 'decel', 'explode', { filter: 'brightness(50%)' });

			attacker.anim({
				x: defender.leftof(20),
				y: defender.y,
				z: defender.behind(-20),
				time: 400,
			}, 'ballistic2Under');
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 50,
			});
			attacker.anim({
				time: 500,
			}, 'ballistic2');
			defender.delay(750);
			defender.anim({
				x: defender.leftof(15),
				y: defender.y,
				z: defender.behind(20),
				time: 50,
			}, 'swing');
			defender.anim({
				time: 200,
			}, 'swing');
		},
	},
	stoneaxe: {
		anim(scene, [attacker, defender]) {
			BattleOtherAnims.slashattack.anim(scene, [attacker, defender]);

			scene.showEffect('rock1', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.5,
				time: 500,
			}, {
				x: defender.x - 30,
				y: defender.y + 15,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, 'ballistic', 'fade');
			scene.showEffect('rock3', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.5,
				time: 500,
			}, {
				x: defender.x + 36,
				y: defender.y + 45,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, 'ballistic', 'fade');
			scene.showEffect('rock2', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.5,
				time: 500,
			}, {
				x: defender.x + 40,
				y: defender.y - 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, 'ballistic', 'fade');
			scene.showEffect('rock3', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 0.1,
				opacity: 0.5,
				time: 500,
			}, {
				x: defender.x - 20,
				y: defender.y - 25,
				z: defender.z,
				scale: 0.2,
				opacity: 1,
				time: 800,
			}, 'ballistic', 'fade');
		},
	},
	malignantchain: {
		anim(scene, [attacker, defender]) {
			// Swing backward
			attacker.anim({
				z: attacker.behind(15),
				time: 200,
			}, 'decel');
			attacker.anim({
				z: defender.behind(-170),
				time: 100,
			}, 'accel');
			attacker.anim({
				z: attacker.z,
				time: 300,
			}, 'swing');

			// Launch the chain
			scene.showEffect('shadowball', {
				x: attacker.x,
				y: attacker.y,
				z: attacker.z,
				scale: 0.5,
				opacity: 0.5,
				time: 275,
			}, {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				time: 500,
			}, 'linear', '', { filter: 'hue-rotate(30deg) brightness(1.5)' });

			// Chain expansion
			for (let i = 0; i < 5; i++) {
				scene.showEffect('shadowball', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0.5,
					opacity: 0.5,
					time: 550,
				}, {
					x: defender.x + 30 * (i - 2),
					time: 950,
				}, 'decel', 'fade', { filter: 'hue-rotate(30deg) brightness(1.5)' });
			}

			// Defender gets squeezed
			defender.delay(550);
			defender.anim({
				xscale: 0.6,
				time: 200,
			});
			defender.delay(200);
			defender.anim({
				xscale: 1,
				time: 150,
			});

			// Poison particles fly out
			let x2 = [1, -1, -1, 1];
			let y2 = [1, 1, -1, -1];

			for (let i = 0; i < 4; i++) {
				scene.showEffect('poisonwisp', {
					x: defender.x,
					y: defender.y,
					z: defender.z,
					scale: 0.7,
					time: 950,
				}, {
					x: defender.x + x2[i] * 50,
					y: defender.y + y2[i] * 38,
					time: 1100,
				}, 'ballistic', 'fade', { filter: 'hue-rotate(15deg)' });
			}
		},
	},
	hardpress: {
		anim(scene, [attacker, defender]) {
			scene.showEffect('mistball', {
				x: defender.leftof(-60),
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				time: 0,
			}, {
				y: defender.y,
				time: 200,
			}, 'accel', 'fade', { filter: 'saturate(0)' });
			scene.showEffect('mistball', {
				x: defender.leftof(-60),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 200,
			}, {
				time: 400,
			}, 'accel', 'fade', { filter: 'saturate(0)' });
			scene.showEffect('mistball', {
				x: defender.leftof(60),
				y: defender.y + 20,
				z: defender.z,
				scale: 0.6,
				time: 200,
			}, {
				y: defender.y,
				time: 400,
			}, 'accel', 'fade', { filter: 'saturate(0)' });

			let xPos = [1, 0, -1, 0];
			let zPos = [0, 1, 0, -1];
			for (let i = 0; i < 4; i++) {
				scene.showEffect('mudwisp', {
					x: defender.leftof(-60),
					y: defender.y - 15,
					z: defender.z,
					scale: 0.5,
					opacity: 0.6,
					time: 200,
				}, {
					x: defender.leftof(-60) + 15 * xPos[i],
					z: defender.z + 20 * zPos[i],
					scale: 0.2,
					time: 400,
				}, 'ballistic2Under', 'fade');

				scene.showEffect('mudwisp', {
					x: defender.leftof(60),
					y: defender.y - 15,
					z: defender.z,
					scale: 0.5,
					opacity: 0.6,
					time: 400,
				}, {
					x: defender.leftof(60) + 15 * xPos[i],
					z: defender.z + 20 * zPos[i],
					scale: 0.2,
					time: 600,
				}, 'ballistic2Under', 'fade');
			}

			scene.showEffect('mistball', {
				x: defender.leftof(-60),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 450,
			}, {
				x: defender.leftof(-30),
				time: 650,
			}, 'accel', 'fade', { filter: 'saturate(0)' });
			scene.showEffect('mistball', {
				x: defender.leftof(60),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 450,
			}, {
				x: defender.leftof(30),
				time: 650,
			}, 'accel', 'fade', { filter: 'saturate(0)' });

			scene.showEffect('mistball', {
				x: defender.leftof(-30),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 650,
			}, {
				time: 850,
			}, 'linear', 'fade', { filter: 'saturate(0)' });
			scene.showEffect('mistball', {
				x: defender.leftof(30),
				y: defender.y,
				z: defender.z,
				scale: 0.6,
				time: 650,
			}, {
				time: 850,
			}, 'linear', 'fade', { filter: 'saturate(0)' });

			attacker.delay(450);
			attacker.anim({
				x: defender.x,
				y: defender.y,
				z: defender.behind(-5),
				time: 200,
			}, 'accel');
			attacker.anim({
				time: 500,
			}, 'ballistic2Back');

			defender.delay(450);
			defender.anim({
				xscale: 0.6,
				yscale: 1.3,
				time: 200,
			});
			defender.delay(200);
			defender.anim({
				xscale: 1,
				yscale: 1,
				time: 150,
			});
		},
	},
	dragoncheer: {
		anim(scene, [attacker, defender]) {
			// Attacker cheers
			for (let i = 0; i < 3; i++) {
				scene.showEffect('shadowball', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0,
					opacity: 0.6,
					time: 150 * i,
				}, {
					z: attacker.behind(-50),
					scale: 2,
					opacity: 0,
					time: 400 + 200 * i,
				}, 'linear');
				scene.showEffect('wisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0,
					opacity: 0.7,
					time: 150 * i,
				}, {
					z: attacker.behind(-50),
					scale: 5,
					opacity: 0,
					time: 400 + 200 * i,
				}, 'linear');
				scene.showEffect('poisonwisp', {
					x: attacker.x,
					y: attacker.y,
					z: attacker.z,
					scale: 0,
					opacity: 0.5,
					time: 150 * i,
				}, {
					z: attacker.behind(-50),
					scale: 2,
					opacity: 0,
					time: 400 + 200 * i,
				}, 'linear');
			}

			// Defender focuses
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 800,
			}, {
				scale: 0,
				opacity: 1,
				time: 1100,
			}, 'linear');
			scene.showEffect('wisp', {
				x: defender.x,
				y: defender.y,
				z: defender.z,
				scale: 2,
				opacity: 0.2,
				time: 1000,
			}, {
				scale: 0,
				opacity: 1,
				time: 1300,
			}, 'linear');
		},
	},
	upperhand: {
		anim(scene, [attacker, defender]) {
			let chopDirection = defender.isFrontSprite ? 'leftchop' : 'rightchop';

			BattleOtherAnims.fastattack.anim(scene, [attacker, defender]);
			scene.showEffect(chopDirection, {
				x: defender.leftof(20),
				y: defender.y + 10,
				z: defender.behind(-15),
				scale: 0.5,
				opacity: 0.5,
				time: 0,
			}, {
				time: 200,
			}, 'linear', 'fade');
			scene.showEffect(chopDirection, {
				x: defender.leftof(20),
				y: defender.y + 10,
				z: defender.behind(-15),
				scale: 0.5,
				opacity: 0.5,
				time: 200,
			}, {
				z: defender.behind(10),
				opacity: 0.8,
				time: 300,
			}, 'decel', 'fade');
			scene.showEffect(chopDirection, {
				x: defender.leftof(20),
				y: defender.y + 10,
				z: defender.behind(10),
				scale: 0.5,
				opacity: 0.8,
				time: 300,
			}, {
				opacity: 0.5,
				time: 400,
			}, 'linear', 'fade');
		},
	},
};

// placeholder animations
BattleMoveAnims['torment'] = { anim: BattleMoveAnims['swagger'].anim };

BattleMoveAnims['mefirst'] = { anim: BattleMoveAnims['mimic'].anim };

BattleMoveAnims['conversion2'] = { anim: BattleMoveAnims['conversion'].anim };

BattleMoveAnims['gearup'] = { anim: BattleMoveAnims['shiftgear'].anim };
BattleMoveAnims['honeclaws'] = { anim: BattleMoveAnims['rockpolish'].anim };

BattleMoveAnims['workup'] = { anim: BattleMoveAnims['bulkup'].anim };

BattleMoveAnims['heatcrash'] = { anim: BattleMoveAnims['flareblitz'].anim };
BattleMoveAnims['darkestlariat'] = { anim: BattleMoveAnims['flareblitz'].anim };
BattleMoveAnims['flameburst'] = { anim: BattleMoveAnims['shelltrap'].anim };
BattleMoveAnims['searingshot'] = { anim: BattleMoveAnims['shelltrap'].anim };
BattleMoveAnims['fierydance'] = { anim: BattleMoveAnims['magmastorm'].anim };
BattleMoveAnims['inferno'] = { anim: BattleMoveAnims['magmastorm'].anim };
BattleMoveAnims['mysticalfire'] = { anim: BattleMoveAnims['flamethrower'].anim };
BattleMoveAnims['firepledge'] = { anim: BattleMoveAnims['flamethrower'].anim };
BattleMoveAnims['ember'] = { anim: BattleMoveAnims['flamethrower'].anim };
BattleMoveAnims['incinerate'] = { anim: BattleMoveAnims['flamethrower'].anim };
BattleMoveAnims['flamewheel'] = { anim: BattleMoveAnims['flamecharge'].anim };

BattleMoveAnims['razorleaf'] = { anim: BattleMoveAnims['magicalleaf'].anim };
BattleMoveAnims['grasspledge'] = { anim: BattleMoveAnims['magicalleaf'].anim };
BattleMoveAnims['sleeppowder'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['poisonpowder'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['stunspore'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['powder'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['cottonspore'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['vinewhip'] = { anim: BattleMoveAnims['powerwhip'].anim };

BattleMoveAnims['bubble'] = { anim: BattleMoveAnims['bubblebeam'].anim };
BattleMoveAnims['sparklingaria'] = { anim: BattleMoveAnims['bubblebeam'].anim };

BattleMoveAnims['watergun'] = { anim: BattleMoveAnims['watersport'].anim };
BattleMoveAnims['whirlpool'] = { anim: BattleMoveAnims['watersport'].anim };

BattleMoveAnims['waterfall'] = { anim: BattleMoveAnims['aquajet'].anim };
BattleMoveAnims['aquatail'] = { anim: BattleMoveAnims['crabhammer'].anim };
BattleMoveAnims['liquidation'] = { anim: BattleMoveAnims['crabhammer'].anim };

BattleMoveAnims['magikarpsrevenge'] = { anim: BattleMoveAnims['outrage'].anim };

BattleMoveAnims['electrify'] = { anim: BattleMoveAnims['thunderwave'].anim };
BattleMoveAnims['volttackle'] = { anim: BattleMoveAnims['wildcharge'].anim };
BattleMoveAnims['zingzap'] = { anim: BattleMoveAnims['wildcharge'].anim };
BattleMoveAnims['nuzzle'] = { anim: BattleMoveAnims['spark'].anim };
BattleMoveAnims['thundershock'] = { anim: BattleMoveAnims['electroball'].anim };

BattleMoveAnims['glaciate'] = { anim: BattleMoveAnims['freezedry'].anim };
BattleMoveAnims['frostbreath'] = { anim: BattleMoveAnims['freezedry'].anim };
BattleMoveAnims['aurorabeam'] = { anim: BattleMoveAnims['icebeam'].anim };
BattleMoveAnims['powdersnow'] = { anim: BattleMoveAnims['icywind'].anim };

BattleMoveAnims['pinmissile'] = { anim: BattleMoveAnims['bulletseed'].anim };
BattleMoveAnims['attackorder'] = { anim: BattleMoveAnims['bulletseed'].anim };
BattleMoveAnims['fellstinger'] = { anim: BattleMoveAnims['bulletseed'].anim };
BattleMoveAnims['strugglebug'] = { anim: BattleMoveAnims['bulletseed'].anim };
BattleMoveAnims['infestation'] = { anim: BattleMoveAnims['bulletseed'].anim };

BattleMoveAnims['nightdaze'] = { anim: BattleMoveAnims['darkpulse'].anim };

BattleMoveAnims['strengthsap'] = { anim: BattleMoveAnims['leechlife'].anim };
BattleMoveAnims['hornattack'] = { anim: BattleMoveAnims['megahorn'].anim };
BattleMoveAnims['lunge'] = { anim: BattleMoveAnims['megahorn'].anim };

BattleMoveAnims['constrict'] = { anim: BattleMoveAnims['bind'].anim };
BattleMoveAnims['wrap'] = { anim: BattleMoveAnims['bind'].anim };

BattleMoveAnims['lowsweep'] = { anim: BattleMoveAnims['lowkick'].anim };
BattleMoveAnims['megakick'] = { anim: BattleMoveAnims['jumpkick'].anim };
BattleMoveAnims['frustration'] = { anim: BattleMoveAnims['thrash'].anim };
BattleMoveAnims['rage'] = { anim: BattleMoveAnims['thrash'].anim };
BattleMoveAnims['headsmash'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['headcharge'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['takedown'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['dragonrush'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['lastresort'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['horndrill'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['trumpcard'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['doubleedge'] = { anim: BattleMoveAnims['gigaimpact'].anim };

BattleMoveAnims['paleowave'] = { anim: BattleMoveAnims['muddywater'].anim };
BattleMoveAnims['rocktomb'] = { anim: BattleMoveAnims['rockslide'].anim };

BattleMoveAnims['frenzyplant'] = { anim: BattleMoveAnims['leafstorm'].anim };
BattleMoveAnims['hydrocannon'] = { anim: BattleMoveAnims['hydropump'].anim };

BattleMoveAnims['guardsplit'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['powersplit'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['guardswap'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['heartswap'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['powerswap'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['speedswap'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['psychoshift'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['helpinghand'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['entrainment'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['roleplay'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['psychup'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['holdhands'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['lunardance'] = { anim: BattleMoveAnims['moonlight'].anim };

BattleMoveAnims['brickbreak'] = { anim: BattleMoveAnims['karatechop'].anim };
BattleMoveAnims['throatchop'] = { anim: BattleMoveAnims['karatechop'].anim };
BattleMoveAnims['wringout'] = { anim: BattleMoveAnims['forcepalm'].anim };
BattleMoveAnims['stormthrow'] = { anim: BattleMoveAnims['circlethrow'].anim };
BattleMoveAnims['vitalthrow'] = { anim: BattleMoveAnims['circlethrow'].anim };
BattleMoveAnims['doubleslap'] = { anim: BattleMoveAnims['wakeupslap'].anim };
BattleMoveAnims['crushgrip'] = { anim: BattleMoveAnims['quash'].anim };

BattleMoveAnims['beatup'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['counter'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['payback'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['revenge'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['rockclimb'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['tackle'] = { anim: BattleMoveAnims['slam'].anim };
BattleMoveAnims['dragonhammer'] = { anim: BattleMoveAnims['heavyslam'].anim };

BattleMoveAnims['highhorsepower'] = { anim: BattleMoveAnims['stomp'].anim };

BattleMoveAnims['retaliate'] = { anim: BattleMoveAnims['closecombat'].anim };
BattleMoveAnims['superpower'] = { anim: BattleMoveAnims['closecombat'].anim };
BattleMoveAnims['submission'] = { anim: BattleMoveAnims['closecombat'].anim };
BattleMoveAnims['bonerush'] = { anim: BattleMoveAnims['boneclub'].anim };

BattleMoveAnims['dragonrage'] = { anim: BattleMoveAnims['dragonbreath'].anim };

BattleMoveAnims['silverwind'] = { anim: BattleMoveAnims['whirlwind'].anim };
BattleMoveAnims['gust'] = { anim: BattleMoveAnims['whirlwind'].anim };
BattleMoveAnims['twister'] = { anim: BattleMoveAnims['whirlwind'].anim };
BattleMoveAnims['razorwind'].anim = BattleMoveAnims['airslash'].anim;

BattleMoveAnims['chatter'] = { anim: BattleMoveAnims['hypervoice'].anim };
BattleMoveAnims['echoedvoice'] = { anim: BattleMoveAnims['hypervoice'].anim };
BattleMoveAnims['relicsong'] = { anim: BattleMoveAnims['hypervoice'].anim };
BattleMoveAnims['uproar'] = { anim: BattleMoveAnims['hypervoice'].anim };

BattleMoveAnims['destinybond'] = { anim: BattleMoveAnims['painsplit'].anim };
BattleMoveAnims['reflecttype'] = { anim: BattleMoveAnims['painsplit'].anim };

BattleMoveAnims['selfdestruct'] = { anim: BattleMoveAnims['explosion'].anim };

BattleMoveAnims['acid'] = { anim: BattleMoveAnims['sludge'].anim };
BattleMoveAnims['acidspray'] = { anim: BattleMoveAnims['sludge'].anim };
BattleMoveAnims['belch'] = { anim: BattleMoveAnims['gunkshot'].anim };
BattleMoveAnims['venoshock'] = { anim: BattleMoveAnims['sludgebomb'].anim };
BattleMoveAnims['venomdrench'] = { anim: BattleMoveAnims['sludge'].anim };
BattleMoveAnims['poisonsting'] = { anim: BattleMoveAnims['poisonjab'].anim };
BattleMoveAnims['poisontail'] = { anim: BattleMoveAnims['poisonjab'].anim };
BattleMoveAnims['gastroacid'] = { anim: BattleMoveAnims['toxic'].anim };

BattleMoveAnims['magnitude'] = { anim: BattleMoveAnims['earthquake'].anim };
BattleMoveAnims['fissure'] = { anim: BattleMoveAnims['earthquake'].anim };
BattleMoveAnims['landswrath'] = { anim: BattleMoveAnims['earthquake'].anim };

BattleMoveAnims['mindblown'] = { anim: BattleMoveAnims['iceball'].anim };

BattleMoveAnims['camouflage'] = { anim: BattleMoveAnims['tailglow'].anim };
BattleMoveAnims['telekinesis'] = { anim: BattleMoveAnims['kinesis'].anim };
BattleMoveAnims['foulplay'] = { anim: BattleMoveAnims['psyshock'].anim };
BattleMoveAnims['psywave'] = { anim: BattleMoveAnims['psybeam'].anim };
BattleMoveAnims['extrasensory'] = { anim: BattleMoveAnims['psychic'].anim };
BattleMoveAnims['confusion'] = { anim: BattleMoveAnims['psychic'].anim };
BattleMoveAnims['miracleeye'] = { anim: BattleMoveAnims['mindreader'].anim };
BattleMoveAnims['futuresight'] = { anim: BattleMoveAnims['doomdesire'].anim };

BattleMoveAnims['glare'] = { anim: BattleMoveAnims['meanlook'].anim };
BattleMoveAnims['grudge'] = { anim: BattleMoveAnims['meanlook'].anim };
BattleMoveAnims['scaryface'] = { anim: BattleMoveAnims['meanlook'].anim };
BattleMoveAnims['disable'] = { anim: BattleMoveAnims['meanlook'].anim };
BattleMoveAnims['laserfocus'] = { anim: BattleMoveAnims['meanlook'].anim };
BattleMoveAnims['nightmare'] = { anim: BattleMoveAnims['nightshade'].anim };

BattleMoveAnims['captivate'] = { anim: BattleMoveAnims['attract'].anim };
BattleMoveAnims['charm'] = { anim: BattleMoveAnims['attract'].anim };
BattleMoveAnims['flatter'] = { anim: BattleMoveAnims['attract'].anim };

BattleMoveAnims['armthrust'] = { anim: BattleMoveAnims['smellingsalts'].anim };

BattleMoveAnims['phantomforce'] = {
	anim: BattleMoveAnims['shadowforce'].anim,
	prepareAnim: BattleMoveAnims['shadowforce'].prepareAnim,
};
BattleMoveAnims['shadowstrike'] = { anim: BattleMoveAnims['shadowforce'].anim };

BattleMoveAnims['smackdown'] = { anim: BattleMoveAnims['rockblast'].anim };

BattleMoveAnims['fairywind'] = { anim: BattleMoveAnims['dazzlinggleam'].anim };
BattleMoveAnims['dreameater'] = { anim: BattleMoveAnims['drainingkiss'].anim };
BattleMoveAnims['sweetkiss'] = { anim: BattleMoveAnims['lovelykiss'].anim };

BattleMoveAnims['mirrorshot'] = { anim: BattleMoveAnims['flashcannon'].anim };
BattleMoveAnims['mirrorcoat'] = { anim: BattleMoveAnims['flashcannon'].anim };
BattleMoveAnims['metalburst'] = { anim: BattleMoveAnims['flashcannon'].anim };

BattleMoveAnims['mudslap'] = { anim: BattleMoveAnims['mudshot'].anim };
BattleMoveAnims['sandattack'] = { anim: BattleMoveAnims['mudshot'].anim };
BattleMoveAnims['mudsport'] = { anim: BattleMoveAnims['mudbomb'].anim };

BattleMoveAnims['spiderweb'] = { anim: BattleMoveAnims['electroweb'].anim };
BattleMoveAnims['stringshot'] = { anim: BattleMoveAnims['electroweb'].anim };
BattleMoveAnims['toxicthread'] = { anim: BattleMoveAnims['electroweb'].anim };

BattleMoveAnims['hyperfang'] = { anim: BattleMoveAnims['superfang'].anim };

BattleMoveAnims['barrage'] = { anim: BattleMoveAnims['magnetbomb'].anim };
BattleMoveAnims['eggbomb'] = { anim: BattleMoveAnims['magnetbomb'].anim };
BattleMoveAnims['spitup'] = { anim: BattleMoveAnims['magnetbomb'].anim };

BattleMoveAnims['rollingkick'] = { anim: BattleMoveAnims['doublekick'].anim };
BattleMoveAnims['triplekick'] = { anim: BattleMoveAnims['doublekick'].anim };

BattleMoveAnims['aromaticmist'] = { anim: BattleMoveAnims['mistyterrain'].anim };
BattleMoveAnims['sweetscent'] = { anim: BattleMoveAnims['mistyterrain'].anim };
BattleMoveAnims['psychicterrain'] = { anim: BattleMoveAnims['mistyterrain'].anim };
BattleMoveAnims['iondeluge'] = { anim: BattleMoveAnims['electricterrain'].anim };
BattleMoveAnims['magneticflux'] = { anim: BattleMoveAnims['electricterrain'].anim };
BattleMoveAnims['rototiller'] = { anim: BattleMoveAnims['electricterrain'].anim };
BattleMoveAnims['flowershield'] = { anim: BattleMoveAnims['grassyterrain'].anim };

BattleMoveAnims['imprison'] = { anim: BattleMoveAnims['embargo'].anim };

BattleMoveAnims['healorder'] = { anim: BattleMoveAnims['recover'].anim };
BattleMoveAnims['synthesis'] = { anim: BattleMoveAnims['recover'].anim };

BattleMoveAnims['floralhealing'] = { anim: BattleMoveAnims['healpulse'].anim };
BattleMoveAnims['purify'] = { anim: BattleMoveAnims['weatherball'].anim };

BattleMoveAnims['pollenpuff'] = { anim: BattleMoveAnims['revelationdance'].anim };

BattleMoveAnims['amnesia'] = { anim: BattleMoveAnims['rest'].anim };
BattleMoveAnims['slackoff'] = { anim: BattleMoveAnims['rest'].anim };

BattleMoveAnims['secretpower'] = { anim: BattleMoveAnims['technoblast'].anim };
BattleMoveAnims['naturalgift'] = { anim: BattleMoveAnims['technoblast'].anim };

BattleMoveAnims['firelash'] = { anim: BattleMoveAnims['multiattack'].anim };

BattleMoveAnims['fleurcannon'] = { anim: BattleMoveAnims['diamondstorm'].anim };

BattleMoveAnims['bloomdoom'] = { anim: BattleMoveAnims['petaldance'].anim };
BattleMoveAnims['hydrovortex'] = { anim: BattleMoveAnims['originpulse'].anim };
BattleMoveAnims['breakneckblitz'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['savagespinout'] = { anim: BattleMoveAnims['electroweb'].anim };
BattleMoveAnims['maliciousmoonsault'] = { anim: BattleMoveAnims['pulverizingpancake'].anim };
BattleMoveAnims['devastatingdrake'] = { anim: BattleMoveAnims['dragonpulse'].anim };
BattleMoveAnims['tectonicrage'] = { anim: BattleMoveAnims['precipiceblades'].anim };
BattleMoveAnims['subzeroslammer'] = { anim: BattleMoveAnims['sheercold'].anim };
BattleMoveAnims['shatteredpsyche'] = { anim: BattleMoveAnims['psychic'].anim };
BattleMoveAnims['maximumpsybreaker'] = { anim: BattleMoveAnims['psychic'].anim };
BattleMoveAnims['genesissupernova'] = { anim: BattleMoveAnims['psychoboost'].anim };
BattleMoveAnims['10000000voltthunderbolt'] = { anim: BattleMoveAnims['triattack'].anim };
BattleMoveAnims['menacingmoonrazemaelstrom'] = { anim: BattleMoveAnims['moongeistbeam'].anim };
BattleMoveAnims['lightthatburnsthesky'] = { anim: BattleMoveAnims['fusionflare'].anim };

BattleMoveAnims['maxflutterby'] = BattleMoveAnims['savagespinout'];
BattleMoveAnims['gmaxbefuddle'] = BattleMoveAnims['savagespinout'];
BattleMoveAnims['maxdarkness'] = BattleMoveAnims['maliciousmoonsault'];
BattleMoveAnims['gmaxsnooze'] = BattleMoveAnims['maliciousmoonsault'];
BattleMoveAnims['maxwyrmwind'] = BattleMoveAnims['devastatingdrake'];
BattleMoveAnims['gmaxdepletion'] = BattleMoveAnims['devastatingdrake'];
BattleMoveAnims['maxlightning'] = BattleMoveAnims['gigavolthavoc'];
BattleMoveAnims['maxstarfall'] = BattleMoveAnims['twinkletackle'];
BattleMoveAnims['gmaxfinale'] = BattleMoveAnims['twinkletackle'];
BattleMoveAnims['gmaxsmite'] = BattleMoveAnims['twinkletackle'];
BattleMoveAnims['maxknuckle'] = BattleMoveAnims['alloutpummeling'];
BattleMoveAnims['gmaxoneblow'] = BattleMoveAnims['alloutpummeling'];
BattleMoveAnims['gmaxrapidflow'] = BattleMoveAnims['alloutpummeling'];
BattleMoveAnims['maxflare'] = BattleMoveAnims['infernooverdrive'];
BattleMoveAnims['gmaxcentiferno'] = BattleMoveAnims['infernooverdrive'];
BattleMoveAnims['gmaxfireball'] = BattleMoveAnims['infernooverdrive'];
BattleMoveAnims['maxairstream'] = BattleMoveAnims['supersonicskystrike'];
BattleMoveAnims['maxphantasm'] = BattleMoveAnims['neverendingnightmare'];
BattleMoveAnims['maxovergrowth'] = BattleMoveAnims['bloomdoom'];
BattleMoveAnims['gmaxvinelash'] = BattleMoveAnims['bloomdoom'];
BattleMoveAnims['gmaxdrumsolo'] = BattleMoveAnims['bloomdoom'];
BattleMoveAnims['maxquake'] = BattleMoveAnims['tectonicrage'];
BattleMoveAnims['gmaxsandblast'] = BattleMoveAnims['tectonicrage'];
BattleMoveAnims['maxhailstorm'] = BattleMoveAnims['subzeroslammer'];
BattleMoveAnims['gmaxresonance'] = BattleMoveAnims['subzeroslammer'];
BattleMoveAnims['maxstrike'] = BattleMoveAnims['breakneckblitz'];
BattleMoveAnims['gmaxcuddle'] = BattleMoveAnims['breakneckblitz'];
BattleMoveAnims['gmaxreplenish'] = BattleMoveAnims['breakneckblitz'];
BattleMoveAnims['maxooze'] = BattleMoveAnims['aciddownpour'];
BattleMoveAnims['gmaxmalodor'] = BattleMoveAnims['aciddownpour'];
BattleMoveAnims['maxmindstorm'] = BattleMoveAnims['shatteredpsyche'];
BattleMoveAnims['gmaxgravitas'] = BattleMoveAnims['shatteredpsyche'];
BattleMoveAnims['maxrockfall'] = BattleMoveAnims['continentalcrush'];
BattleMoveAnims['maxsteelspike'] = BattleMoveAnims['corkscrewcrash'];
BattleMoveAnims['maxgeyser'] = BattleMoveAnims['hydrovortex'];
BattleMoveAnims['gmaxcannonade'] = BattleMoveAnims['hydrovortex'];
BattleMoveAnims['gmaxhydrosnipe'] = BattleMoveAnims['hydrovortex'];

BattleMoveAnims['dynamaxcannon'] = { anim: BattleMoveAnims['dragonpulse'].anim };
BattleMoveAnims['snipeshot'] = { anim: BattleMoveAnims['waterpulse'].anim };
BattleMoveAnims['jawlock'] = { anim: BattleMoveAnims['crunch'].anim };
BattleMoveAnims['stuffcheeks'] = { anim: BattleMoveAnims['stockpile'].anim };
BattleMoveAnims['noretreat'] = { anim: BattleMoveAnims['stockpile'].anim };
BattleMoveAnims['tarshot'] = { anim: BattleMoveAnims['mudbomb'].anim };
BattleMoveAnims['magicpowder'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['dragondarts'] = { anim: BattleMoveAnims['dragonbreath'].anim };
BattleMoveAnims['teatime'] = { anim: BattleMoveAnims['healbell'].anim };
BattleMoveAnims['octolock'] = { anim: BattleMoveAnims['bind'].anim };
BattleMoveAnims['boltbeak'] = { anim: BattleMoveAnims['spark'].anim };
BattleMoveAnims['courtchange'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['clangoroussoul'] = { anim: BattleMoveAnims['extremeevoboost'].anim };
BattleMoveAnims['bodypress'] = { anim: BattleMoveAnims['heavyslam'].anim };
BattleMoveAnims['decorate'] = { anim: BattleMoveAnims['spore'].anim };
BattleMoveAnims['drumbeating'] = { anim: BattleMoveAnims['magicalleaf'].anim };
BattleMoveAnims['snaptrap'] = { anim: BattleMoveAnims['magicalleaf'].anim };
BattleMoveAnims['pyroball'] = { anim: BattleMoveAnims['flameburst'].anim };
BattleMoveAnims['behemothblade'] = { anim: BattleMoveAnims['smartstrike'].anim };
BattleMoveAnims['behemothbash'] = { anim: BattleMoveAnims['smartstrike'].anim };
BattleMoveAnims['aurawheel'] = { anim: BattleMoveAnims['discharge'].anim };
BattleMoveAnims['breakingswipe'] = { anim: BattleMoveAnims['dragonclaw'].anim };
BattleMoveAnims['branchpoke'] = { anim: BattleMoveAnims['vinewhip'].anim };
BattleMoveAnims['overdrive'] = { anim: BattleMoveAnims['discharge'].anim };
BattleMoveAnims['appleacid'] = { anim: BattleMoveAnims['energyball'].anim };
BattleMoveAnims['gravapple'] = { anim: BattleMoveAnims['energyball'].anim };
BattleMoveAnims['obstruct'] = { anim: BattleMoveAnims['kingsshield'].anim };
BattleMoveAnims['maxguard'] = { anim: BattleMoveAnims['banefulbunker'].anim };
BattleMoveAnims['falsesurrender'] = { anim: BattleMoveAnims['feintattack'].anim };
BattleMoveAnims['meteorassault'] = { anim: BattleMoveAnims['aurasphere'].anim };
BattleMoveAnims['eternabeam'] = { anim: BattleMoveAnims['roaroftime'].anim };
BattleMoveAnims['steelbeam'] = { anim: BattleMoveAnims['magnetbomb'].anim };
BattleMoveAnims['strangesteam'] = { anim: BattleMoveAnims['dazzlinggleam'].anim };
BattleMoveAnims['burningjealousy'] = { anim: BattleMoveAnims['heatwave'].anim };
BattleMoveAnims['grassyglide'] = { anim: BattleMoveAnims['powerwhip'].anim };
BattleMoveAnims['risingvoltage'] = { anim: BattleMoveAnims['discharge'].anim };
BattleMoveAnims['coaching'] = { anim: BattleMoveAnims['bulkup'].anim };
BattleMoveAnims['corrosivegas'] = { anim: BattleMoveAnims['poisongas'].anim };
BattleMoveAnims['scorchingsands'] = { anim: BattleMoveAnims['earthpower'].anim };
BattleMoveAnims['expandingforce'] = { anim: BattleMoveAnims['psybeam'].anim };
BattleMoveAnims['skittersmack'] = { anim: BattleMoveAnims['megahorn'].anim };
BattleMoveAnims['poltergeist'] = { anim: BattleMoveAnims['neverendingnightmare'].anim };
BattleMoveAnims['scaleshot'] = { anim: BattleMoveAnims['clangingscales'].anim };
BattleMoveAnims['lashout'] = { anim: BattleMoveAnims['nightslash'].anim };
BattleMoveAnims['steelroller'] = { anim: BattleMoveAnims['steamroller'].anim };
BattleMoveAnims['shellsidearmphysical'] = { anim: BattleMoveAnims['poisonjab'].anim };
BattleMoveAnims['shellsidearmspecial'] = { anim: BattleMoveAnims['sludgebomb'].anim };
BattleMoveAnims['surgingstrikes'] = { anim: BattleMoveAnims['aquajet'].anim };
BattleMoveAnims['eeriespell'] = { anim: BattleMoveAnims['psyshock'].anim };

BattleMoveAnims['axekick'] = { anim: BattleMoveAnims['highjumpkick'].anim };
BattleMoveAnims['bittermalice'] = { anim: BattleMoveAnims['spectralthief'].anim };
BattleMoveAnims['bleakwindstorm'] = { anim: BattleMoveAnims['hurricane'].anim };
BattleMoveAnims['ceaselessedge'] = { anim: BattleMoveAnims['nightslash'].anim };
BattleMoveAnims['chillingwater'] = { anim: BattleMoveAnims['waterpulse'].anim };
BattleMoveAnims['comeuppance'] = { anim: BattleMoveAnims['darkpulse'].anim };
BattleMoveAnims['doubleshock'] = { anim: BattleMoveAnims['wildcharge'].anim };
BattleMoveAnims['filletaway'] = { anim: BattleMoveAnims['bulkup'].anim };
BattleMoveAnims['glaiverush'] = { anim: BattleMoveAnims['outrage'].anim };
BattleMoveAnims['headlongrush'] = {
	anim(scene, [attacker, defender]) {
		BattleMoveAnims['closecombat'].anim(scene, [attacker, defender]);
		BattleMoveAnims['earthpower'].anim(scene, [attacker, defender]);
	},
};
BattleMoveAnims['hyperdrill'] = { anim: BattleMoveAnims['drillrun'].anim };
BattleMoveAnims['kowtowcleave'] = { anim: BattleMoveAnims['nightslash'].anim };
BattleMoveAnims['lastrespects'] = { anim: BattleMoveAnims['memento'].anim };
BattleMoveAnims['luminacrash'] = { anim: BattleMoveAnims['esperwing'].anim };
BattleMoveAnims['mountaingale'] = { anim: BattleMoveAnims['powergem'].anim };
BattleMoveAnims['pounce'] = { anim: BattleMoveAnims['bodyslam'].anim };
BattleMoveAnims['powershift'] = { anim: BattleMoveAnims['skillswap'].anim };
BattleMoveAnims['ragefist'] = { anim: BattleMoveAnims['shadowpunch'].anim };
BattleMoveAnims['ragingbull'] = { anim: BattleMoveAnims['gigaimpact'].anim };
BattleMoveAnims['shedtail'] = { anim: BattleMoveAnims['substitute'].anim };
BattleMoveAnims['shelter'] = { anim: BattleMoveAnims['withdraw'].anim };
BattleMoveAnims['terablast'] = { anim: BattleMoveAnims['scald'].anim };
BattleMoveAnims['terablastbug'] = { anim: BattleMoveAnims['bugbuzz'].anim };
BattleMoveAnims['terablastdark'] = { anim: BattleMoveAnims['darkpulse'].anim };
BattleMoveAnims['terablastdragon'] = { anim: BattleMoveAnims['dragonpulse'].anim };
BattleMoveAnims['terablastelectric'] = { anim: BattleMoveAnims['thunderbolt'].anim };
BattleMoveAnims['terablastfairy'] = { anim: BattleMoveAnims['moonblast'].anim };
BattleMoveAnims['terablastfighting'] = { anim: BattleMoveAnims['focusblast'].anim };
BattleMoveAnims['terablastfire'] = { anim: BattleMoveAnims['flamethrower'].anim };
BattleMoveAnims['terablastflying'] = { anim: BattleMoveAnims['aeroblast'].anim };
BattleMoveAnims['terablastghost'] = { anim: BattleMoveAnims['infernalparade'].anim };
BattleMoveAnims['terablastgrass'] = { anim: BattleMoveAnims['seedflare'].anim };
BattleMoveAnims['terablastground'] = { anim: BattleMoveAnims['earthpower'].anim };
BattleMoveAnims['terablastice'] = { anim: BattleMoveAnims['icebeam'].anim };
BattleMoveAnims['terablastnormal'] = { anim: BattleMoveAnims['technoblast'].anim };
BattleMoveAnims['terablastpoison'] = { anim: BattleMoveAnims['sludgebomb'].anim };
BattleMoveAnims['terablastpsychic'] = { anim: BattleMoveAnims['psychic'].anim };
BattleMoveAnims['terablastrock'] = { anim: BattleMoveAnims['powergem'].anim };
BattleMoveAnims['terablaststeel'] = { anim: BattleMoveAnims['flashcannon'].anim };
BattleMoveAnims['terablastwater'] = { anim: BattleMoveAnims['hydropump'].anim };
BattleMoveAnims['terablaststellar'] = { anim: BattleMoveAnims['dracometeor'].anim };
BattleMoveAnims['tidyup'] = { anim: BattleMoveAnims['bulkup'].anim };
BattleMoveAnims['trailblaze'] = { anim: BattleMoveAnims['powerwhip'].anim };
BattleMoveAnims['tripledive'] = { anim: BattleMoveAnims['dive'].anim };
BattleMoveAnims['hydrosteam'] = { anim: BattleMoveAnims['steameruption'].anim };
BattleMoveAnims['psyblade'] = { anim: BattleMoveAnims['psychocut'].anim };
