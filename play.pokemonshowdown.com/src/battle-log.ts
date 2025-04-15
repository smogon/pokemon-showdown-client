/**
 * Battle log
 *
 * An exercise in minimalism! This is a dependency of the client, which
 * requires IE9+ and uses Preact, and the replay player, which requires
 * IE7+ and uses jQuery. Therefore, this has to be compatible with IE7+
 * and use the DOM directly!
 *
 * Special thanks to PPK for QuirksMode.org, one of the few resources
 * available for how to do web development in these conditions.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

import type { Battle } from './battle';
import type { BattleScene } from './battle-animations';
import { Dex, Teams, toID, toRoomid, toUserid, type ID } from './battle-dex';
import { BattleTextParser, type Args, type KWArgs } from './battle-text-parser';

// Caja
declare const html4: any;
declare const html: any;

// defined in battle-log-misc
declare function MD5(input: string): string;
declare function formatText(input: string, isTrusted?: boolean): string;
export { MD5, formatText };

export class BattleLog {
	elem: HTMLDivElement;
	innerElem: HTMLDivElement;
	scene: BattleScene | null = null;
	preemptElem: HTMLDivElement = null!;
	atBottom = true;
	skippedLines = false;
	className: string;
	battleParser: BattleTextParser | null = null;
	joinLeave: {
		joins: string[],
		leaves: string[],
		element: HTMLDivElement,
	} | null = null;
	lastRename: {
		from: string,
		to: string,
		element: HTMLDivElement,
	} | null = null;
	/**
	 * * -1 = spectator: "Red sent out Pikachu!" "Blue's Eevee used Tackle!"
	 * * 0 = player 1: "Go! Pikachu!" "The opposing Eevee used Tackle!"
	 * * 1 = player 2: "Red sent out Pikachu!" "Eevee used Tackle!"
	 */
	perspective: -1 | 0 | 1 = -1;
	constructor(elem: HTMLDivElement, scene?: BattleScene | null, innerElem?: HTMLDivElement) {
		this.elem = elem;

		if (!innerElem) {
			elem.setAttribute('role', 'log');
			elem.innerHTML = '';
			innerElem = document.createElement('div');
			innerElem.className = 'inner message-log';
			elem.appendChild(innerElem);
		}
		this.innerElem = innerElem;

		if (scene) {
			this.scene = scene;
			const preemptElem = document.createElement('div');
			preemptElem.className = 'inner-preempt message-log';
			elem.appendChild(preemptElem);
			this.preemptElem = preemptElem;
			this.battleParser = new BattleTextParser();
		}

		this.className = elem.className;
		elem.onscroll = this.onScroll;
	}
	onScroll = () => {
		const distanceFromBottom = this.elem.scrollHeight - this.elem.scrollTop - this.elem.clientHeight;
		this.atBottom = (distanceFromBottom < 30);
	};
	reset() {
		this.innerElem.innerHTML = '';
		this.atBottom = true;
		this.skippedLines = false;
	}
	destroy() {
		this.elem.onscroll = null;
		this.elem.innerHTML = '';
	}
	addSeekEarlierButton() {
		if (this.skippedLines) return;
		this.skippedLines = true;
		const el = document.createElement('div');
		el.className = 'chat';
		el.innerHTML = '<button class="button earlier-button"><i class="fa fa-caret-up"></i><br />Earlier messages</button>';
		const button = el.getElementsByTagName('button')[0];
		button?.addEventListener?.('click', e => {
			e.preventDefault();
			this.scene?.battle.seekTurn(this.scene.battle.turn - 100);
		});
		this.addNode(el);
	}
	add(args: Args, kwArgs?: KWArgs, preempt?: boolean, showTimestamps?: 'minutes' | 'seconds') {
		if (kwArgs?.silent) return;
		const battle = this.scene?.battle;
		if (battle?.seeking) {
			if (battle.stepQueue.length > 2000) {
				// adding elements gets slower and slower the more there are
				// (so showing 100 turns takes around 2 seconds, and 1000 turns takes around a minute)
				// capping at 100 turns makes everything _reasonably_ snappy
				if (
					battle.seeking === Infinity ?
						battle.currentStep < battle.stepQueue.length - 2000 :
						battle.turn < battle.seeking - 100
				) {
					this.addSeekEarlierButton();
					return;
				}
			}
		}
		let divClass = 'chat';
		let divHTML = '';
		let noNotify: boolean | undefined;
		if (!['join', 'j', 'leave', 'l'].includes(args[0])) this.joinLeave = null;
		if (!['name', 'n'].includes(args[0])) this.lastRename = null;
		switch (args[0]) {
		case 'chat': case 'c': case 'c:':
			let name;
			let message;
			let timestamp = 0;
			if (args[0] === 'c:') {
				timestamp = parseInt(args[1]);
				name = args[2];
				message = args[3];
			} else {
				name = args[1];
				message = args[2];
			}
			let rank = name.charAt(0);
			if (battle?.ignoreSpects && ' +'.includes(rank)) return;
			if (battle?.ignoreOpponent) {
				if ('\u2605\u2606'.includes(rank) && toUserid(name) !== app.user.get('userid')) return;
			}
			const ignoreList = window.app?.ignore || window.PS?.prefs?.ignore;
			if (ignoreList?.[toUserid(name)] && ' +^\u2605\u2606'.includes(rank)) return;
			let timestampHtml = '';
			if (showTimestamps) {
				const date = timestamp && !isNaN(timestamp) ? new Date(timestamp * 1000) : new Date();
				const components = [date.getHours(), date.getMinutes()];
				if (showTimestamps === 'seconds') {
					components.push(date.getSeconds());
				}
				timestampHtml = `<small class="grey">[${components.map(x => x < 10 ? `0${x}` : x).join(':')}] </small>`;
			}
			let isHighlighted = window.app?.rooms?.[battle!.roomid].getHighlight(message);
			[divClass, divHTML, noNotify] = this.parseChatMessage(message, name, timestampHtml, isHighlighted);
			if (!noNotify && isHighlighted) {
				let notifyTitle = "Mentioned by " + name + " in " + battle!.roomid;
				app.rooms[battle!.roomid].notifyOnce(notifyTitle, "\"" + message + "\"", 'highlight');
			}
			break;

		case 'join': case 'j': case 'leave': case 'l': {
			const user = BattleTextParser.parseNameParts(args[1]);
			if (battle?.ignoreSpects && ' +'.includes(user.group)) return;
			const formattedUser = user.group + user.name;
			const isJoin = (args[0].startsWith('j'));
			if (!this.joinLeave) {
				this.joinLeave = {
					joins: [],
					leaves: [],
					element: document.createElement('div'),
				};
				this.joinLeave.element.className = 'chat';
			}

			if (isJoin && this.joinLeave.leaves.includes(formattedUser)) {
				this.joinLeave.leaves.splice(this.joinLeave.leaves.indexOf(formattedUser), 1);
			} else {
				this.joinLeave[isJoin ? "joins" : "leaves"].push(formattedUser);
			}

			let buf = '';
			if (this.joinLeave.joins.length) {
				buf += `${this.textList(this.joinLeave.joins)} joined`;
			}
			if (this.joinLeave.leaves.length) {
				if (this.joinLeave.joins.length) buf += `; `;
				buf += `${this.textList(this.joinLeave.leaves)} left`;
			}
			this.joinLeave.element.innerHTML = `<small>${BattleLog.escapeHTML(buf)}</small>`;
			(preempt ? this.preemptElem : this.innerElem).appendChild(this.joinLeave.element);
			return;
		}

		case 'name': case 'n': {
			const user = BattleTextParser.parseNameParts(args[1]);
			if (toID(args[2]) === toID(user.name)) return;
			if (!this.lastRename || toID(this.lastRename.to) !== toID(user.name)) {
				this.lastRename = {
					from: args[2],
					to: '',
					element: document.createElement('div'),
				};
				this.lastRename.element.className = 'chat';
			}
			this.lastRename.to = user.group + user.name;
			this.lastRename.element.innerHTML = `<small>${BattleLog.escapeHTML(this.lastRename.to)} renamed from ${BattleLog.escapeHTML(this.lastRename.from)}.</small>`;
			(preempt ? this.preemptElem : this.innerElem).appendChild(this.lastRename.element);
			return;
		}

		case 'chatmsg': case '':
			divHTML = BattleLog.escapeHTML(args[1]);
			break;

		case 'chatmsg-raw': case 'raw': case 'html':
			divHTML = BattleLog.sanitizeHTML(args[1]);
			break;

		case 'uhtml': case 'uhtmlchange':
			this.changeUhtml(args[1], args[2], args[0] === 'uhtml');
			return ['', ''];

		case 'error': case 'inactive': case 'inactiveoff':
			divClass = 'chat message-error';
			divHTML = BattleLog.escapeHTML(args[1]);
			break;

		case 'bigerror':
			this.message('<div class="broadcast-red">' + BattleLog.escapeHTML(args[1]).replace(/\|/g, '<br />') + '</div>');
			return;

		case 'pm':
			divHTML = '<strong>' + BattleLog.escapeHTML(args[1]) + ':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\'' + BattleLog.escapeHTML(args[2], true) + '\')">(Private to ' + BattleLog.escapeHTML(args[3]) + ')</i> ' + BattleLog.parseMessage(args[4]) + '</span>';
			break;

		case 'askreg':
			this.addDiv('chat', '<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="' + BattleLog.escapeHTML(args[1]) + '"><b>Register</b></button></div>');
			return;

		case 'unlink': {
			// |unlink| is deprecated in favor of |hidelines|
			const user = toID(args[2]) || toID(args[1]);
			this.unlinkChatFrom(user);
			if (args[2]) {
				const lineCount = parseInt(args[3], 10);
				this.hideChatFrom(user, true, lineCount);
			}
			return;
		}

		case 'hidelines': {
			const user = toID(args[2]);
			this.unlinkChatFrom(user);
			if (args[1] !== 'unlink') {
				const lineCount = parseInt(args[3], 10);
				this.hideChatFrom(user, args[1] === 'hide', lineCount);
			}
			return;
		}

		case 'debug':
			divClass = 'debug';
			divHTML = '<div class="chat"><small style="color:#999">[DEBUG] ' + BattleLog.escapeHTML(args[1]) + '.</small></div>';
			break;

		case 'notify':
			const title = args[1];
			const body = args[2];
			const roomid = this.scene?.battle.roomid;
			if (!roomid) break;
			app.rooms[roomid].notifyOnce(title, body, 'highlight');
			break;

		case 'showteam': {
			if (!battle) return;
			const team = Teams.unpack(args[2]);
			if (!team.length) return;
			const side = battle.getSide(args[1]);
			const exportedTeam = team.map(set => {
				let buf = Teams.export([set], battle.gen).replace(/\n/g, '<br />');
				if (set.name && set.name !== set.species) {
					buf = buf.replace(set.name, BattleLog.sanitizeHTML(
						`<span class="picon" style="${Dex.getPokemonIcon(set.species)}"></span><br />${set.name}`));
				} else {
					buf = buf.replace(set.species,
						`<span class="picon" style="${Dex.getPokemonIcon(set.species)}"></span><br />${set.species}`);
				}
				if (set.item) {
					buf = buf.replace(set.item, `${set.item} <span class="itemicon" style="${Dex.getItemIcon(set.item)}"></span>`);
				}
				return buf;
			}).join('');
			divHTML = `<div class="infobox"><details><summary>Open Team Sheet for ${side.name}</summary>${exportedTeam}</details></div>`;
			break;
		}

		case 'seed': case 'choice': case ':': case 'timer': case 't:':
		case 'J': case 'L': case 'N': case 'spectator': case 'spectatorleave':
		case 'initdone':
			return;

		default:
			this.addBattleMessage(args, kwArgs);
			return;
		}
		if (divHTML) this.addDiv(divClass, divHTML, preempt);
	}
	addBattleMessage(args: Args, kwArgs?: KWArgs) {
		switch (args[0]) {
		case 'warning':
			this.message('<strong>Warning:</strong> ' + BattleLog.escapeHTML(args[1]));
			this.message(`Bug? Report it to <a href="http://www.smogon.com/forums/showthread.php?t=3453192">the replay viewer's Smogon thread</a>`);
			if (this.scene) this.scene.wait(1000);
			return;

		case 'variation':
			this.addDiv('', '<small>Variation: <em>' + BattleLog.escapeHTML(args[1]) + '</em></small>');
			break;

		case 'rule':
			const ruleArgs = args[1].split(': ');
			this.addDiv('', '<small><em>' + BattleLog.escapeHTML(ruleArgs[0]) + (ruleArgs[1] ? ':' : '') + '</em> ' + BattleLog.escapeHTML(ruleArgs[1] || '') + '</small>');
			break;

		case 'rated':
			this.addDiv('rated', '<strong>' + (BattleLog.escapeHTML(args[1]) || 'Rated battle') + '</strong>');
			break;

		case 'tier':
			this.addDiv('', '<small>Format:</small> <br /><strong>' + BattleLog.escapeHTML(args[1]) + '</strong>');
			break;

		case 'turn':
			const h2elem = document.createElement('h2');
			h2elem.className = 'battle-history';
			let turnMessage;
			if (this.battleParser) {
				turnMessage = this.battleParser.parseArgs(args, {}).trim();
				if (!turnMessage.startsWith('==') || !turnMessage.endsWith('==')) {
					throw new Error("Turn message must be a heading.");
				}
				turnMessage = turnMessage.slice(2, -2).trim();
				this.battleParser.curLineSection = 'break';
			} else {
				turnMessage = `Turn ${args[1]}`;
			}
			h2elem.innerHTML = BattleLog.escapeHTML(turnMessage);
			this.addSpacer();
			this.addNode(h2elem);
			break;

		default:
			if (this.addAFDMessage(args, kwArgs)) return;
			const line = this.battleParser?.parseArgs(args, kwArgs || {}, true) ?? null;
			if (line === null) {
				this.addDiv('chat message-error', 'Unrecognized: |' + BattleLog.escapeHTML(args.join('|')));
				return;
			}
			if (line) this.messageFromLog(line);
			break;
		}
	}
	addAFDMessage(args: Args, kwArgs: KWArgs = {}) {
		if (!Dex.afdMode) return;
		if (!this.battleParser || !this.scene) return;

		// return true to skip the default message
		const messageFromArgs = (args1: Args, kwArgs1: KWArgs = {}) => {
			this.messageFromLog(this.battleParser!.parseArgs(args1, kwArgs1, true));
		};

		// Taunt and Chilly Reception messages (below) will appear in ALL AFD modes.

		if (args[0] === 'move') {
			if (kwArgs.from) return false;

			const moveid = toID(args[2]);
			if (moveid === 'taunt') {
				// April Fool's 2013, expanded in 2025
				messageFromArgs(args, kwArgs);
				const quotes = [
					"Yo mama so fat, she 4x resists Ice- and Fire-type attacks!",
					"Yo mama so ugly, Captivate raises her opponent's Special Attack!",
					"Yo mama so dumb, she lowers her Special Attack when she uses Nasty Plot!",
					"Yo mama so fat, she eats her Aguav Berry at 50% HP!",
					"Yo Mama so stupid, she tried to count clouds one through eight!",
					"Yo Mama so stupid, she thought Sticky Hold meant she needed to grab a stick!",
					"Yo Mama so old, her Paradox forme would be Great Grandma!",
					"Yo Mama so stupid, she can't learn anything from the move tutor!",
					"Yo Mama so rude, she got Kyogre and Groudon to team up against her!",
					"Yo Mama so fat, Focus Blast never misses her!",
					"Yo Mama so fat, the Darkest Day is when she's tanning!",
					"Yo Mama so stinky, her damaging moves have a 10% chance to make the opponent flinch!",
					"Yo Mama so old, she has the NPCs from Legends Arceus in her yearbook!",
					"Yo Mama so stupid, she's still trying to find Rhydon!",
					"Yo Mama so stupid, she asked if the Insect Plate comes with an appetizer!",
					"Yo Mama so bad, she got her Stunfisk paralyzed!",
					"Yo Mama so nasty, Black Sludge heals her 1/16th!",
					"Yo Mama so stupid, she gave her Bisharp Black Sludge!",
					"Yo Mama so stupid, she runs a suboptimal EV spread on her Tera Poison Calm Mind Chimecho, making it faint to a Choice Banded Dragonite Tera Normal Extreme Speed!",
					"Yo Mama so casual, she mains NatDex AG!",
					"Yo Mama so casual, she ladders with Red's team!",
					"Yo Mama so dumb, she scouts teams in Randbats!",
					"Yo Mama so lazy, she loafs around every turn!",
					"Yo Mama so fat, she changes type when holding a Dinner Plate!",
					"Yo Mama so slow, even Trick Room won't let her go first!",
					"Yo Mama so dumb, not even Gummis can raise her IQ!",
					"Show me your moves!",
					"Yo Mama so nasty, thinking about her gives a +2 Special Attack boost!",
					"Yo Mama so broke, her deck has no energy cards so she can save on electricity!",
					"Yo Mama so dumb, she tried using Twitch Plays Pokemon as a walkthrough guide!",
					"Yo Mama so dumb, Slowpoke finishes her sentences!",
					"Yo Mama so old, she babysat AZ!",
					"Yo Mama so stupid, not even Own Tempo could prevent her from being confused!",
					"Yo Mama so ugly, even Brock wanted nothing to do with her!",
					"Yo Mama so stupid, she drank antifreeze to cure her status condition!",
					"Yo Mama so trashy, they named a Wormadam forme after her!",
					"Yo Mama so broke, her Gholdengo is made out of checkers!",
					"Yo Mama so ugly, she killed Mimikyu when it saw her!",
					"Yo Mama so fat, she doesn't need a Wailord to meet the Regis!",
					"Unfortunate doesn't even begin to describe Yo Mama!",
					"Yo Mama so dumb, she brags about using a bot to get her opponent's teams!",
					"Yo Mama so fat, her Wishes cause integer overflows!",
					"Yo Mama so ugly, she makes Attract fail!",
					"Yo Mama so dumb, she makes Dondozo look aware!",
					"Yo Mama so smelly, she KOes Nosepass without making a single move!",
					"Yo mama so fat, she doesn't know what the item Leftovers is!",
					"Yo Mama so ugly, she gets OHKOed by Mirror Shot!",
					"Yo Mama so smelly, her VGC analysis pairs her with Slaking!",
					"Yo Mama so old, she has to be extracted in Cinnabar Lab!",
					"Yo Mama so fat, she sets Gravity on switch-in!",
					"Yo Mama so dumb, she's immune to this move!",
				];
				const battle = this.scene.battle;
				// make sure it's the same joke for both players (and spectators)
				const quote = quotes[(
					(battle.p1.name.charCodeAt(2) || 0) + (battle.p2.name.charCodeAt(2) || 0) * 19 +
					(battle.p1.name.charCodeAt(3) || 0) * 61 + (battle.p2.name.charCodeAt(3) || 0) +
					battle.turn + (args[1].charCodeAt(1) || 0) * 109 + (args[1].charCodeAt(2) || 0) * 113
				) % quotes.length];
				this.messageFromLog(this.battleParser.fixLowercase(`${this.battleParser.pokemon(args[1])} said, "${quote}"`));
				// give time to read
				this.scene.wait(3 * this.scene.battle.messageFadeTime / this.scene.acceleration);
				return true;
			}
		} else if (args[0] === '-prepare') {
			const moveid = toID(args[2]);
			if (moveid === 'chillyreception') {
				// April Fool's 2025
				const dadJokes = [
					"This should be a Fire-type move, because I'm spitting flames.",
					"Why didn't Vigoroth evolve? Because it was Slaking on its training!",
					"I'm going snowwhere fast!",
					"Don't Slack Off if you wanna beat me!",
					"Where do you buy toys for a Ground-type? Land-R-Us!",
					"I've got half a mind to just leave. The other half belongs to my Shellder.",
					"Why did the Slowking cross the road?",
					"What's the best Pokemon to get rid of bugs? Flygone!",
					"What's the best Pokemon to get rid of bugs? Heatmor. What, were you expecting a pun?",
					"I guess you could call Heatmor an Ant-heater.",
					"Why do they call it Enamor-us when you can only have one of them on a team?",
					"Cloyster? I hardly know 'er!",
					"Why do they call Shedinja invincible when I can still see it?",
					"Dondozo? I don't think I can, that seems really cumbersome.",
					"Appletun? No, there's only one of them.",
					"Drilbur? I hardly know 'er!",
					"Iron Crown? I hardly know 'er!",
					"Shellder? I hardly know 'er!",
					"Magnemite? I sure hope it will!",
					"Graveler? I hardly know 'er!",
					"Grimer? I hardly know 'er!",
					"Baxcalibur? I hardly know 'er!",
					"Why do they call it Kyurem when it doesn't heal anybody?",
					"Conkeldurr? I hardly know 'er!",
					"Weavile? No, I don't think we are.",
					"Dragapult? Doesn't seem very efficient, don't they usually have wheels?",
					"Dragonite? Sounds like it'd be hard with all that heavy armor.",
					"How do you play whack-a-mole with a Fighting-type? Hit 'm on top!",
					"I don't know who made Pokemon Go, but I'm trying to figure out how to make them Pokemon Go to the polls!",
					"Gholdengo? Yeah, it should gholden-go somewhere else.",
					"Some folks call me Charming, but I still feel like I take plenty of physical damage. What gives?",
					"I learned this move in South America, they called it a Chile Reception",
					"I had a Canadian Tyrogue. It evolved into a Hitmontreal.",
					"Why do Venusaur's roommates wear earplugs at night? Because Venus-snores!",
					"I bought stock in my Charmander before it evolved. Now I'm a Charmeleonaire!",
					"Charizard? I actually think char is pretty easy!",
					"Why doesn't Squirtle's mom buy it action figures? Because it likes to blast toys!",
					"Why does Caterpie like Margarine so much? Because it's butter-free!",
					"What did the Alolan Raichu say to the surfer? Nothing, it just waved!",
					"Clefable? What's Clef able to do?",
					"Why did the Nidorans start a revolution? Because they didn't Nidoking!",
					"Alolan Ninetales? More like Aurora Nine-veils!",
					"Wigglytuff? Doesn't look that tough to me.",
					"I dug up a weird vegetable yesterday. Well, it wasn't THAT weird, just a little Oddish!",
					"Why was the Vileplume so happy? Because it wasn't Gloom-y anymore!",
					"What do you call three guys named Doug? A Dugtrio!",
					"Why is it called Golduck when it's blue?",
					"What Rock-type is the best at soccer? Goal-em!",
					"Why is Galarian Slowbro so good at art? Because it's Quick on the Draw!",
					"Do you like my jokes? I've got a Magne-ton of them!",
					"Where do three-headed birds go for Carnival? Dodrio de Janeiro!",
					"What would Muk be called if it could rap? Slime Shady!",
					"Kingler? I hardly know 'er!",
					"Exeggutor? I hardly know 'er!",
					"Have you heard that Trainers who use Hypno are hip? No?",
					"What do ghosts build at Christmastime? Gengar-bread houses!",
					"What street does Voltorb live on? Elect Road!",
					"I told a Hitmonlee some of my jokes. He really got a kick out of them!",
					"What's a Hitmonchan's favorite holiday? Boxing Day!",
					"Did you know Galarian Weezing doesn't know how to drive? It always puts the car in Neutral before stepping on the Gas!",
					"How can you tell if a Poison-type has asthma? See if it's Weezing!",
					"What Pokémon loves to find you when you hide? Seaking!",
					"If we Psychic-types made a movie, it would have to Starmie!",
					"Scyther? I hardly know 'er!",
					"Pinsir? I hardly know 'er!",
					"What Pokémon does Aladdin ride? A Magikarpet!",
					"What do you get if you cut a Gyarados in half? Gyara-uno!",
					"What do you call a Lapras carrying a gun? The Glock Ness Monster!",
					"What's a Ditto's favorite food? Impasta!",
					"Flareon? They should turn the flare off!",
					"Where does a 1000-pound Snorlax sleep? Anywhere it wants!",
					"Zapdos? Zap those what?",
					"My Grass-type friend has been losing weight recently. It's nice to see them losing a few pounds, but I hate to see Me-gaining-'em!",
					"What does a Fire-type wear around its neck? A Tie-phlosion!",
					"Why do they call Ledian the Five Star Pokémon? I'd give it two stars at best!",
					"Ariados? That's impressive, most people can't even perform one aria.",
					"Crobat? It doesn't look like a crow at all!",
					"Why do web developers hire Xatu to predict their profits? Because it can see their Future Sites!",
					"What superhero lives under the sea and has Volt Absorb? The Green Lanturn!",
					"Why should you never play cards with the Cottonweed Pokémon? Because it always Jump-bluffs!",
					"What Pokémon comes after Espeon? T-peon!",
					"Why did the Kartana faint to Bullet Punch? Because Scizor beats paper!",
					"Sometimes I put lava in my gas tank. It really makes Magcargo!",
					"I wrote my Ice-type friend a letter. I hope it gets Delibird!",
					"What's a Mantine's favorite type of cheese? Mantaray Jack!",
					"What kind of bird is Skarmory? A Roost-er!",
					"My friend caught a Porygon. I also did, but he got jealous when I told him I caught a Porygon too!",
					"What do you name a Smeargle that can't use Sketch anymore? Drew!",
					"Why couldn't the smart Chansey evolve? Because ignorance is Blissey!",
					"The classic Suicune set has a Water move, Calm Mind, and Sleep Talk. That's only 3 moves, but I'm sure you can figure out the Rest!",
					"I went to one of Lugia's parties once. It was an Aero-blast!",
					"What do pseudo-Legendaries pave their roads with? Tyrani-tar!",
					"What's Ho-Oh's favorite food? Hot wings!",
					"How often does Celebi travel? From time to time!",
					"What's on a Grass-type's bathroom floor? Scep-tiles!",
					"What's Blaziken's favorite food? Fried chicken!",
					"Why doesn't Swampert go outside? Because it can't touch grass!",
					"How do I know my jokes are good? I told them to a Mightyena and it couldn't stop laughing!",
					"What kind of Poké Ball do you catch Dustox in? A mothball!",
					"Who are Shiftry's biggest fans? Its hands!",
					"Why was the evolving Surskit brought before a court? It was Masqu-arraigned!",
					"Gardevoir? What's a voir and why should I guard it?",
					"I moved in with a Breloom, but the apartment didn't have mushroom!",
					"What's a Hariyama's favorite Pokémon games? Ultra SuMo!",
					"I took my Delcatty to the vet because I thought it was going blind, but it had Normal-eyes!",
					"What's Sableye's zodiac sign? Gem-in-eye!",
					"What do you call a Medicham that's lost its pants? Yogi Bare!",
					"Why does Aggron plant trees after a disaster? That's part of its Aggro-culture!",
					"What happened when the Plusle and Minun fell in love? They multiplied!",
					"I once rode on a Wailord's back. It was a whale of a time!",
					"That Anger Point Camerupt sure has a temper. Crit it once and it'll blow its top!",
					"What season does Spoink like the best? Spring!",
					"I'd tell you a joke about Grumpig, but you wouldn't appreciate it. I'd be casting pearls before swine!",
					"It takes a human 5 minutes to walk a block, but for Spinda it takes half an hour. The difference is staggering!",
					"That cloud Pokémon acts innocent, but I know it has an Altaria motive!",
					"Zangoose? It doesn't look like a goose at all!",
					"What are Solrock's favorite music genres? Soul and rock!",
					"They hate on you when you're a Barboach, but everyone wants to be your friend when you pull up Whis-cash!",
					"What does a Lileep get from Dairy Queen? A Cra-Dilly Bar!",
					"I know a way you can see invisible Kecleons, but that's beyond the Scope of this joke!",
					"What does a Tropius wear over its shirt? A Har-vest!",
					"Why is it called Walrein if it's better in snow?",
					"I've always been a fan of ball-shaped Pokémon, but one in particular Sphealed the deal!",
					"I'd make a joke about Luvdisc, but it's already a joke!",
					"Why is the Iron Leg Pokémon always covered in dirt and slime? Because it's Meta-gross!",
					"Why is Regirock called the Rock Peak Pokémon when it's so mid?",
					"Why is Clear Body Regice such a bad liar? Because you can see right through it!",
					"Why was Registeel fired from the convenience store? Because it would always Steel from the Regi-ster!",
					"I'd make a joke about Latias, but that would be just plane silly!",
					"Did you know that Rayquaza has a certain smell that it takes wherever it goes? That's right, it's Draggin' A-scent!",
					"Did you hear about the Deoxys who took a DNA test? It got 100%!",
					"What would the tier leader of OU be called if he was a Jirachi? Flinchinator!",
					"I had a company that sold Infernapes, until I was told to cut out the monkey business!",
					"Kricketunes must be my biggest fans. Every time I tell a joke, they're all I hear!",
					"What kind of Poké Ball is best for Luxray? A Luxuray Ball!",
					"Where does Bastiodon make all its money? Wall Street!",
					"What kind of mystery novels does Wormadam like to read? Cloak and dagger!",
					"Remember when Pachirisu won the World Championships? That was nuts!",
					"Cherrim? I hardly know 'im!",
					"Mothim? I hardly know 'im!",
					"I used to buy Drifblim by the dozen, but we got hit with inflation and the price ballooned!",
					"I took directions from a Mismagius, but now I don't know witch way to go!",
					"Someone asked me if I liked Chingling. I said that I don't know, I've never chingled!",
					"What do you do with a Bronzong you're in love with? Give it a ring!",
					"People say they removed Chatot's sound-recording function because of profanity, but I think that's just mindless Chatter!",
					"I have 108 jokes about Spiritomb, but not a single soul wants to hear them!",
					"My Garchomp friend gained a lot of weight recently. He said it was pretty rough to look at the scales!",
					"Why does Carnivine get Levitate? Because it's a Venus flying trap!",
					"Why did Weavile drive a truck with six wheels? Because it had Triple Axles!",
					"I got yelled at by a Lickilicky once. Talk about a tongue-lashing!",
					"Why do they call Yanmega a dragonfly when it isn't Dragon/Flying?",
					"My local arcade had to kick out this Ground/Flying type. He kept getting the Gligh-score and he was really toxic about it!",
					"Why don't you ever see Mamoswines hiding in trees? Because they're really good at it!",
					"What happens when your Porygon-Z uses Signal Beam? Software bugs!",
					"What do you call a Gallade in a tuxedo? Sharply dressed!",
					"Why do they call Rotom-Heat an oven when you of in the cold food of out hot eat the food?",
					"Why does no one tell Rotom-Wash their secrets? They don't want it to air out their dirty laundry!",
					"I had a joke about Uxie, but I forgot it!",
					"I had a joke about Mesprit, but I don't think you're emotionally ready for it!",
					"I had a joke about Azelf, but I don't have the willpower to tell it!",
					"I had a joke about Dialga and time travel, but you didn't like it!",
					"I had a joke about Palkia, but there's no space for it here!",
					"Why couldn't Arceus go to Planet Fitness? Because it's a Judgment-free zone!",
					"I had a joke about the Azure Flute, but you wouldn't get it!",
					"Why does Victini always win? Beats me!",
					"Some people think Overgrow is viable on Serperior. On the Contrary!",
					"Once Samurott got a regional form, its usage really Spiked!",
					"Did you hear about the Watchog that won a battle? Yeah, me neither!",
					"I could tell a joke about Musharna, but I wouldn't dream of it!",
					"Why does Throh never win? Because it always throws!",
					"Cofagrigus is so cool! Don't you *cough* agree, Gus?",
					"I wouldn't use Zoroark in OU—I have no Illusion that it's any good!",
					"Why is Reuniclus so good at marketing? It knows what cells!",
					"Why didn't the Ducklett evolve? It didn't Swanna!",
					"I fought a Beartic once. It was unbearable!",
					"Did you know it's a crime to make a Braviary sick? It's ill-eagle!",
					"I attract Volcaronas like a moth to a flame!",
					"I'd make a joke about Cobalion, but it's un-Justified!",
					"What did Zekrom do when it was unhappy with its working conditions? It went on Bolt Strike!",
					"Everyone plays Meloetta in exactly the same way. It's always the same old song and dance!",
					"What's a Chesnaught's favorite Nature? Naughty!",
					"Which part of Doublade is most dangerous? Da blade!",
					"I'd say I'm a Pyroar, but I'd be lion!",
					"Why does Talonflame laugh in the face of danger? Because it's a Brave Bird!",
					"I stole a Delphox's wand, but it got me in a stick-y situation!",
					"What are Aegislash's favorite Pokémon games? Sword and Shield!",
					"What do you call it when you do a favor for a Malamar and it wants one in return? Squid pro quo!",
					"I'm making an 8-bit game featuring Sylveon. It looks cute when it's Pixilated!",
					"Why did Tyrantrum get its license taken away? It kept getting in T-wrecks!",
					"Why does Goodra have such good fashion sense? Because it's always got the drip!",
					"What do you get when you cross a Kingambit with a Gourgeist? Supreme Overgourd!",
					"What do you call a dead Klefki? A skeleton key!",
					"I dated a Xerneas once, but we broke up. Now it's my X!",
					"I've never met an Yveltal. I don't know Y!",
					"Why does Zygarde-Complete work so hard? Because it always gives 100%!",
					"Why does Diancie have such good synergy with Ghost-types? Because diamonds are a ghoul's best friend!",
					"What's Hoopa's favorite video game? Portal!",
					"Why did Hoopa-Unbound get put into the Prison Bottle? Because it was armed and dangerous!",
					"What do you call a joke about Volcanion? A wisecrack-a-toa!",
					"Why does no one make friends with Incineroar? It's too Intimidating!",
					"Can a Toucannon win a Double Battle? No, but two can!",
					"What do you call your Lycanroc when it goes missing? A where-wolf!",
					"Why are Wishiwashi so smart? They swim in schools!",
					"What do you call it when Ribombee gets a free turn? A sticky situation!",
					"Why are Mudsdales so strong? They have horsepower!",
					"What's Araquanid's favorite candy? Bubble gum!",
					"I had a Salazzle girlfriend once, but I broke it off because she was too toxic!",
					"Why do they call it Comfey when every time someone sends it out it becomes the most stressful game of my life?",
					"Why did the Golisopod make an emergency exit from the job interview? It made a bad First Impression!",
					"I'm making a first-person shooting game starring Pyukumuku. It's called Duke Pyukem!",
					"Why should you never mimic a Mimikyu? Because you're risking your neck!",
					"Where in Alaska can you find Dhelmise? Anchorage!",
					"Did you know that Kommo-o's scales are falling off all across the globe? It's a problem on a worldwide scale!",
					"A Tapu Lele walks into a bar. The bartender gets nervous because there's no counter!",
					"Did you hear that Tapu Fini's terrain is gone? It'll be mist!",
					"Did you hear Lunala opened up a barber shop? It's called Totally Clips!",
					"If OU doesn't suspect test Solgaleo, I'm going to go on Sunsteel Strike!",
					"I heard they buffed Buzzwole in Pokémon Unite. I don't know why they needed to, it was already buff!",
					"I want to ask Pheromosa out, but it strikes me as unapp-roach-able!",
					"What do you call a Xurkitree that's only 3 feet tall? A short circuit!",
					"What does Celesteela order when it goes to a Chinese restaurant? One-ton soup!",
					"Why should you never invite a Kartana to poker night? Because it always knows when to fold!",
					"Why did the Guzzlord love doing difficult jobs? Because it was a glutton for punishment!",
					"What happened to the Necrozma that robbed a bank? It was in-prismed!",
					"Why does Ultra Necrozma weigh less that Dusk Mane or Dawn Wings form? Because it's more light!",
					"What attack does Stakataka learn at Level 1? Stakatackle!",
					"Why is Blacephalon's head spherical? Because it's clowning a-round!",
					"What is Inteleon's secret agent number? Bubble-O-7!",
					"I'll be here all Corvi-night, folks!",
					"What Bug/Psychic Pokémon can be found deep underground embedded in stone? Ore-beetle!",
					"Why should you never give a Drednaw the Infinity Gauntlet? Because it's a snapping turtle!",
					"A Flapple a day keeps the doctor away, as long as its attacks don't miss!",
					"Why are my jokes so popular on Galar's Route 8? Because Sandaconda don't want none unless you got puns, hun!",
					"My Cramorant was about to win a match, but then it choked!",
					"What's Toxtricity's favorite Tera type? Rock!",
					"Why does Centiskorch hate wearing Heavy-Duty Boots? By the time it's finished putting them all on, the battle's already over!",
					"I've heard a lot of gossip about Polteageist, but I don't want to spill the tea!",
					"Who hosts tea parties in Wonderland and bounces back hazard moves? The Mad Hatterene!",
					"What kind of fur do you get from Grimmsnarl? As fur away as possible!",
					"Of all the crimes Obstagoon's done, which one finally put it behind bars for good? Obstruction of justice!",
					"Where do Cursola keep their gravestones? At the Great Burial Reef!",
					"How does Sirfetch'd pass along all the insider info it knows about new Pokémon games? It leeks it!",
					"What did the Mr. Mime say to the Mr. Rime? Nothing, silly, mimes can't talk!",
					"I'd tell a joke about Runerigus, but the real joke is its evolution method!",
					"Plenty of Pokémon have ridiculous numbers of alternate forms, but Alcremie takes the cake!",
					"Can any Pokémon besides Tapu Lele set Psychic Terrain? Yes Indeedee!",
					"What's a Copperajah's favorite kind of music? Heavy Metal!",
					"Why did Dracovish get evicted from OU? It wouldn't pay the Fishious Rent!",
					"Have you seen Duraludon's Gigantamax form? It really towers over you!",
					"What's Dragapult's favorite game to play at a bar? Dragon Darts!",
					"I'd tell you a joke about Zamazenta, but I'm pressed for time!",
					"Why should you always run Zacian-Crowned? Because it has great STAB!",
					"Originally the Gen 8 designers weren't going to add a generational mechanic, but Eternatus convinced them to make Dynamax canon!",
					"What does Regieleki do to lose weight? Fast!",
					"What do you get when you cross a Regidrago and a Klefki? Lockjaw!",
					"I'd make a joke about Spectrier, but that would be beating a dead horse!",
					"Make sure to never insult Ursaluna—last time I burned it, it swept my whole team!",
					"Don't go near Ursaluna-Bloodmoon—it's a total lunatic!",
					"You'd think Basculegion would be uncomfortable traveling forward in time hundreds of years, but don't worry—it's adaptable!",
					"You have to use Strong Style Barb Barrage 20 times to evolve Hisuian Qwilfish? That seems like Overqwil to me!",
					"Did you know that Meowscarada is really good at baking bread? Apparently it has a special Flour Trick!",
					"I've got a ton of Skeledirge jokes. A skele-ton!",
					"What do you do if you see a Quaquaval getting ready to kick you in the head? Duck!",
					"Lokix? No thanks, I don't like using weight-based moves!",
					"Why did the baker get a Fidough? He kneaded one!",
					"How do you know Dachsbun has a good pedigree? It's pure bread!",
					"Why did the Garganacl ragequit while losing a battle? Because it was salty!",
					"You're telling me Ceruledge has dark purple armor and blue flaming swords for hands? What an edgelord!",
					"You should try using Electromorphosis Bellibolt—its damage output is shocking!",
					"I tried using Klawf on a stall team, but it was Klawful!",
					"Rabsca told me its true body was inside the ball it's holding. I thought that was a load of crap!",
					"My Shellder once spent time with an Espathra. It came back with a new Ability just called Link because Espathra takes no skill!",
					"Why is Corviknight's natural predator so smart? Because she Thinks-a-ton!",
					"I asked a Finizen why it worked as a sidekick for Palafin. The Finizen said it was serving a greater porpoise!",
					"If you run in front of a Revavroom you get tired, but if you run behind it you get exhausted!",
					"Why couldn't the Cyclizar stand up? It was two-tired!",
					"Why does Houndstone press F? To pay its Last Respects!",
					"Those entry hazards are nice, why not put up Glim-more-a' them?",
					"Why did Dondozo get demonetized on YouTube? It wouldn't stop cursing!",
					"Have you heard the joke about Farigiraf's neck? It's a long one!",
					"What do you call a Dudunsparce that gets faster when it's hit with a Dark move? A Rattled-snake!",
					"What do you call a Dunsparce? No, really, I'm curious.",
					"Why do people love Donphan so much? Because it has Great Tusks!",
					"What do you get when you cross Kingambit and Ogerpon? The Supreme Ogrelord!",
					"What did ancient Magneton economists invest in? Sandy Stocks!",
					"I'm starting a band featuring Slither Wing. It's called Smash Moth!",
					"Why does the Paldean alphabet go L, M, N, Flutter Mane, Q, R? Because Flutter Mane is OP!",
					"What did Iron Bundle's mother say when it went out in the cold? Bundle up, and be sure to cover everything!",
					"Iron Hands is a fantastic Pokémon. Let's all give it a great big hand!",
					"What should you do if an Iron Treads uses Autotomize? Tread lightly!",
					"What Paradox Pokémon do you like to run? Personally, I run Thorns!",
					"What kind of computers does Wo-Chien like to use? Tablets!",
					"Man, that Chien-Pao OHKOing me Sword of Ruined my day!",
					"When I saw my special attacks doing 25% less damage than usual, I knew there was some-Ting wrong!",
					"What do you call a really old Salamence telling a really dull story? Boring Moon!",
					"I once visited Chi-Yu's home, but it had no walls!",
					"I don't know what the Iron Valiant set is until I look inside the box, but I can't—it's impossible to check!",
					"Why is Miraidon banned to AG? Because it's from the future, so it's not allowed to be present!",
					"I once met a Koraidon, so I turned around and said that the past is behind me!",
					"What's the opposite of Walking Wake? Sleepwalking!",
					"What does Sinistcha wear on St. Patrick's Day? A green tea-shirt!",
					"Why are the Loyal Three always male? Toxic masculinity!",
					"One of Ogerpon's forms got banned, but it was pretty controversial on the Internet. It started a Hearth-flame war!",
					"You don't like Archaludon? Too bad, build a bridge and get over it!",
					"What move can only be used by a Hydrapple that's been fermented in brine? Pickle Beam!",
					"Why is Raging Bolt so delusional? Because it's got its head in the clouds!",
					"Iron Boulder? Boulders aren't made of iron, silly!",
					"Iron Crown? But my crown isn't wrinkled!",
					"I hear Terapagos got banned from OU in less than a day. It must've had a Stellar performance!",
					"I'd make a joke about Pecharunt's poison, but it's too confusing!",
					"How many Pokémon fans does it take to change a lightbulb? None, they just complain about how much better the last lightbulb was!",
					"That's the last time I try to make a call in winter, I'm getting a Chilly Reception!",
					"Maybe I should tell spicier jokes and go for a Chili Reception instead!",
					"Did you hear the one about the Slowking who switched out?",
					"You've heard of stand-up comedy, but have you heard of switch-out comedy?",
					"You bought those fossils from Clay? Did you buy them on Clay-away?",
					"How do you get a Trainer onto a bus? Poke 'em on!",
					"U-Turn? No, YOU turn, I'm going straight!",
					"Does Gen 1 have a Pokémon missing? No!",
				];
				const battle = this.scene.battle;
				// make sure it's the same joke for both players (and spectators)
				const joke = dadJokes[(
					(battle.p1.name.charCodeAt(2) || 0) + (battle.p2.name.charCodeAt(2) || 0) * 19 +
					(battle.p1.name.charCodeAt(3) || 0) * 61 + (battle.p2.name.charCodeAt(3) || 0) +
					battle.turn + (args[1].charCodeAt(1) || 0) * 109 + (args[1].charCodeAt(2) || 0) * 113
				) % dadJokes.length];
				messageFromArgs(args, kwArgs);
				this.messageFromLog(`"${joke}"`);
				// give time to read
				this.scene.wait(3 * this.scene.battle.messageFadeTime / this.scene.acceleration);
				return true;
			}
		}

		// !!! EVERYTHING BELOW THIS LINE DOESN'T HAPPEN IN `/afd sprites` MODE
		if (Dex.afdMode !== true) return;

		if (args[0] === 'faint') {
			// April Fool's 2018 (DLC)
			if (!(Dex as any).afdFaint) {
				messageFromArgs(args, kwArgs);
				this.message('<div class="broadcast-red" style="font-size:10pt">Needed that one alive? Buy <strong>Max Revive DLC</strong>, yours for only $9.99!<br /> <a href="/trustworthy-dlc-link">CLICK HERE!</a></div>');
				(Dex as any).afdFaint = true;
				return true;
			}
		} else if (args[0] === '-crit') {
			// April Fool's 2018 (DLC)
			if (!(Dex as any).afdCrit) {
				messageFromArgs(args, kwArgs);
				this.message('<div class="broadcast-red" style="font-size:10pt">Crit mattered? Buy <strong>Crit Insurance DLC</strong>, yours for only $4.99!<br /> <a href="/trustworthy-dlc-link">CLICK HERE!</a></div>');
				(Dex as any).afdCrit = true;
				return true;
			}
		} else if (args[0] === 'move') {
			if (kwArgs.from) return false;

			const moveid = toID(args[2]);
			if (moveid === 'earthquake') {
				// April Fool's 2013
				if (this.scene.animating && window.$) {
					$('body').css({
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,
					}).animate({
						left: -30,
						right: 30,
					}, 75).animate({
						left: 30,
						right: -30,
					}, 100).animate({
						left: -30,
						right: 30,
					}, 100).animate({
						left: 30,
						right: -30,
					}, 100).animate({
						left: 0,
						right: 0,
					}, 100, () => {
						$('body').css({
							position: 'static',
						});
					});
				}
				messageFromArgs(['move', args[1], 'Fissure']);
				this.messageFromLog('Just kidding! It was **Earthquake**!');
				return true;
			// } else if (move.id === 'metronome' || move.id === 'sleeptalk' || move.id === 'assist') {
			// 	// April Fool's 2014 - NOT UPDATED TO NEW BATTLE LOG
			// 	this.message(pokemon.getName() + ' used <strong>' + move.name + '</strong>!');
			// 	let buttons = ["A", "B", "START", "SELECT", "UP", "DOWN", "LEFT", "RIGHT", "DEMOCRACY", "ANARCHY"];
			// 	let people = ["Zarel", "The Immortal", "Diatom", "Nani Man", "shaymin", "apt-get", "sirDonovan", "Arcticblast", "Trickster"];
			// 	let button;
			// 	for (let i = 0; i < 10; i++) {
			// 		let name = people[Math.floor(Math.random() * people.length)];
			// 		if (!button) button = buttons[Math.floor(Math.random() * buttons.length)];
			// 		this.scene.log('<div class="chat"><strong style="' + BattleLog.hashColor(toUserid(name)) + '" class="username">' + BattleLog.escapeHTML(name) + ':</strong> <em>' + button + '</em></div>');
			// 		button = (name === 'Diatom' ? "thanks diatom" : null);
			// 	}
			} else if (moveid === 'stealthrock') {
				// April Fool's 2016
				const srNames = [
					'Sneaky Pebbles', 'Sly Rubble', 'Subtle Sediment', 'Buried Bedrock', 'Camouflaged Cinnabar', 'Clandestine Cobblestones', 'Cloaked Clay', 'Concealed Ore', 'Covert Crags', 'Crafty Coal', 'Discreet Bricks', 'Disguised Debris', 'Espionage Pebbles', 'Furtive Fortress', 'Hush-Hush Hardware', 'Incognito Boulders', 'Invisible Quartz', 'Masked Minerals', 'Mischievous Masonry', 'Obscure Ornaments', 'Private Paragon', 'Secret Solitaire', 'Sheltered Sand', 'Surreptitious Sapphire', 'Undercover Ultramarine',
				];
				messageFromArgs(['move', args[1], srNames[Math.floor(Math.random() * srNames.length)]]);
				return true;
			} else if (moveid === 'extremespeed') {
				// April Fool's 2018
				messageFromArgs(args, kwArgs);
				const fastWords = ['H-Hayai', 'Masaka', 'Its fast'];
				this.messageFromLog(`**${fastWords[Math.floor(Math.random() * fastWords.length)]}**`);
				return true;
			} else if (moveid === 'aerialace') {
				// April Fool's 2018
				messageFromArgs(['move', args[1], 'Tsubame Gaeshi']);
				return true;
			}
		}
		return false;
	}
	messageFromLog(line: string) {
		this.message(...this.parseLogMessage(line));
	}
	textList(list: string[]) {
		let message = '';
		const listNoDuplicates: string[] = [];
		for (const user of list) {
			if (!listNoDuplicates.includes(user)) listNoDuplicates.push(user);
		}
		list = listNoDuplicates;

		if (list.length === 1) return list[0];
		if (list.length === 2) return `${list[0]} and ${list[1]}`;
		for (let i = 0; i < list.length - 1; i++) {
			if (i >= 5) {
				return `${message}and ${list.length - 5} others`;
			}
			message += `${list[i]}, `;
		}
		return `${message}and ${list[list.length - 1]}`;
	}
	/**
	 * To avoid trolling with nicknames, we can't just run this through
	 * parseMessage
	 */
	parseLogMessage(message: string): [string, string] {
		const messages = message.split('\n').map(line => {
			line = BattleLog.escapeHTML(line);
			line = line.replace(/\*\*(.*)\*\*/, '<strong>$1</strong>');
			line = line.replace(/\|\|([^|]*)\|\|([^|]*)\|\|/, '<abbr title="$1">$2</abbr>');
			if (line.startsWith('  ')) line = '<small>' + line.trim() + '</small>';
			return line;
		});
		return [
			messages.join('<br />'),
			messages.filter(line => !line.startsWith('<small>[')).join('<br />'),
		];
	}
	message(message: string, sceneMessage = message) {
		this.scene?.message(sceneMessage);
		this.addDiv('battle-history', message);
	}
	addNode(node: HTMLElement, preempt?: boolean) {
		(preempt ? this.preemptElem : this.innerElem).appendChild(node);
		if (this.atBottom) {
			this.elem.scrollTop = this.elem.scrollHeight;
		}
	}
	updateScroll() {
		if (this.atBottom) {
			this.elem.scrollTop = this.elem.scrollHeight;
		}
	}
	addDiv(className: string, innerHTML: string, preempt?: boolean) {
		const el = document.createElement('div');
		el.className = className;
		el.innerHTML = innerHTML;
		this.addNode(el, preempt);
	}
	prependDiv(className: string, innerHTML: string, preempt?: boolean) {
		const el = document.createElement('div');
		el.className = className;
		el.innerHTML = innerHTML;
		if (this.innerElem.childNodes.length) {
			this.innerElem.insertBefore(el, this.innerElem.childNodes[0]);
		} else {
			this.innerElem.appendChild(el);
		}
		this.updateScroll();
	}
	addSpacer() {
		this.addDiv('spacer battle-history', '<br />');
	}
	changeUhtml(id: string, htmlSrc: string, forceAdd?: boolean) {
		id = toID(id);
		const classContains = ' uhtml-' + id + ' ';
		let elements = [] as HTMLDivElement[];
		for (const node of this.innerElem.childNodes as any) {
			if (node.className && (' ' + node.className + ' ').includes(classContains)) {
				elements.push(node);
			}
		}
		if (this.preemptElem) {
			for (const node of this.preemptElem.childNodes as any) {
				if (node.className && (' ' + node.className + ' ').includes(classContains)) {
					elements.push(node);
				}
			}
		}
		if (htmlSrc && elements.length && !forceAdd) {
			for (const element of elements) {
				element.innerHTML = BattleLog.sanitizeHTML(htmlSrc);
			}
			this.updateScroll();
			return;
		}
		for (const element of elements) {
			element.parentElement!.removeChild(element);
		}
		if (!htmlSrc) return;
		if (forceAdd) {
			this.addDiv('notice uhtml-' + id, BattleLog.sanitizeHTML(htmlSrc));
		} else {
			this.prependDiv('notice uhtml-' + id, BattleLog.sanitizeHTML(htmlSrc));
		}
	}
	hideChatFrom(userid: ID, showRevealButton = true, lineCount = 0) {
		const classStart = 'chat chatmessage-' + userid + ' ';
		let nodes: HTMLElement[] = [];
		for (const node of this.innerElem.childNodes as any as HTMLElement[]) {
			if (node.className && (node.className + ' ').startsWith(classStart)) {
				nodes.push(node);
			}
		}
		if (this.preemptElem) {
			for (const node of this.preemptElem.childNodes as any as HTMLElement[]) {
				if (node.className && (node.className + ' ').startsWith(classStart)) {
					nodes.push(node);
				}
			}
		}
		if (lineCount) nodes = nodes.slice(-lineCount);

		for (const node of nodes) {
			node.style.display = 'none';
			node.className = 'revealed ' + node.className;
		}
		if (!nodes.length || !showRevealButton) return;
		const button = document.createElement('button');
		button.name = 'toggleMessages';
		button.value = userid;
		button.className = 'subtle';
		button.innerHTML = `<small>(${nodes.length} line${nodes.length > 1 ? 's' : ''} from ${userid} hidden)</small>`;
		const lastNode = nodes[nodes.length - 1];
		lastNode.appendChild(document.createTextNode(' '));
		lastNode.appendChild(button);
	}

	static unlinkNodeList(nodeList: ArrayLike<HTMLElement>, classStart: string) {
		for (const node of nodeList as HTMLElement[]) {
			if (node.className && (node.className + ' ').startsWith(classStart)) {
				const linkList = node.getElementsByTagName('a');
				// iterate in reverse because linkList will update as links are removed
				for (let i = linkList.length - 1; i >= 0; i--) {
					const linkNode = linkList[i];
					const parent = linkNode.parentElement;
					if (!parent) continue;
					for (const childNode of linkNode.childNodes as any) {
						parent.insertBefore(childNode, linkNode);
					}
					parent.removeChild(linkNode);
				}
			}
		}
	}

	unlinkChatFrom(userid: ID) {
		const classStart = 'chat chatmessage-' + userid + ' ';
		const innerNodeList = this.innerElem.childNodes;
		BattleLog.unlinkNodeList(innerNodeList as NodeListOf<HTMLElement>, classStart);

		if (this.preemptElem) {
			const preemptNodeList = this.preemptElem.childNodes;
			BattleLog.unlinkNodeList(preemptNodeList as NodeListOf<HTMLElement>, classStart);
		}
	}

	preemptCatchup() {
		if (!this.preemptElem.firstChild) return;
		this.innerElem.appendChild(this.preemptElem.firstChild);
	}

	static escapeFormat(formatid = ''): string {
		let atIndex = formatid.indexOf('@@@');
		if (atIndex >= 0) {
			return this.escapeFormat(formatid.slice(0, atIndex)) +
				'<br />Custom rules: ' + this.escapeHTML(formatid.slice(atIndex + 3));
		}
		if (window.BattleFormats && BattleFormats[formatid]) {
			return this.escapeHTML(BattleFormats[formatid].name);
		}
		if (window.NonBattleGames && NonBattleGames[formatid]) {
			return this.escapeHTML(NonBattleGames[formatid]);
		}
		return this.escapeHTML(formatid);
	}
	static formatName(formatid = ''): string {
		let atIndex = formatid.indexOf('@@@');
		if (atIndex >= 0) {
			return this.formatName(formatid.slice(0, atIndex)) +
				' (Custom rules: ' + this.escapeHTML(formatid.slice(atIndex + 3)) + ')';
		}
		if (window.BattleFormats && BattleFormats[formatid]) {
			return BattleFormats[formatid].name;
		}
		if (window.NonBattleGames && NonBattleGames[formatid]) {
			return NonBattleGames[formatid];
		}
		return formatid;
	}

	static escapeHTML(str: string | number, jsEscapeToo?: boolean) {
		if (typeof str === 'number') str = `${str}`;
		if (typeof str !== 'string') return '';
		str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		if (jsEscapeToo) str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
		return str;
	}
	/**
	 * Template string tag function for escaping HTML
	 */
	static html(strings: TemplateStringsArray | string[], ...args: any) {
		let buf = strings[0];
		let i = 0;
		while (i < args.length) {
			buf += this.escapeHTML(args[i]);
			buf += strings[++i];
		}
		return buf;
	}

	static unescapeHTML(str: string) {
		str = (str ? '' + str : '');
		return str.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
	}

	static colorCache: { [userid: string]: string } = {
		hecate: "black; text-shadow: 0 0 6px white",
	};

	/** @deprecated */
	static hashColor(name: ID) {
		return `color:${this.usernameColor(name)};`;
	}

	static usernameColor(name: ID) {
		if (this.colorCache[name]) return this.colorCache[name];
		let hash;
		if (Config.customcolors[name]) {
			hash = MD5(Config.customcolors[name]);
		} else {
			hash = MD5(name);
		}
		let H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
		let S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
		let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49

		let { R, G, B } = this.HSLToRGB(H, S, L);
		let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)

		let HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
		if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
		else if (HLmod < 0) HLmod /= 3;
		else HLmod = 0;
		// let mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
		let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
		if (Hdist < 15) {
			HLmod += (15 - Hdist) / 3;
		}

		L += HLmod;

		let { R: r, G: g, B: b } = this.HSLToRGB(H, S, L);
		const toHex = (x: number) => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		this.colorCache[name] = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
		return this.colorCache[name];
	}

	static HSLToRGB(H: number, S: number, L: number) {
		let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
		let X = C * (1 - Math.abs((H / 60) % 2 - 1));
		let m = L / 100 - C / 2;

		let R1;
		let G1;
		let B1;
		switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
		}
		let R = R1 + m;
		let G = G1 + m;
		let B = B1 + m;
		return { R, G, B };
	}

	static prefs(name: string) {
		// @ts-expect-error optional, for old client
		if (window.Storage?.prefs) return Storage.prefs(name);
		// @ts-expect-error optional, for Preact client
		if (window.PS) return PS.prefs[name];
		// may be neither, for e.g. Replays
		return undefined;
	}

	parseChatMessage(
		message: string, name: string, timestamp: string, isHighlighted?: boolean
	): [string, string, boolean?] {
		let showMe = !BattleLog.prefs('chatformatting')?.hideme;
		let group = ' ';
		if (!/[A-Za-z0-9]/.test(name.charAt(0))) {
			// Backwards compatibility
			group = name.charAt(0);
			name = name.substr(1);
		}
		const colorStyle = ` style="color:${BattleLog.usernameColor(toID(name))}"`;
		const clickableName = `<small class="groupsymbol">${BattleLog.escapeHTML(group)}</small><span class="username">${BattleLog.escapeHTML(name)}</span>`;
		let hlClass = isHighlighted ? ' highlighted' : '';
		let isMine = (window.app?.user?.get('name') === name) || (window.PS?.user.name === name);
		let mineClass = isMine ? ' mine' : '';

		let cmd = '';
		let target = '';
		if (message.startsWith('/')) {
			if (message.charAt(1) === '/') {
				message = message.slice(1);
			} else {
				let spaceIndex = message.indexOf(' ');
				cmd = (spaceIndex >= 0 ? message.slice(1, spaceIndex) : message.slice(1));
				if (spaceIndex >= 0) target = message.slice(spaceIndex + 1);
			}
		}

		switch (cmd) {
		case 'me':
		case 'mee':
			let parsedMessage = BattleLog.parseMessage(' ' + target);
			if (cmd === 'mee') parsedMessage = parsedMessage.slice(1);
			if (!showMe) {
				return [
					'chat chatmessage-' + toID(name) + hlClass + mineClass,
					`${timestamp}<strong${colorStyle}>${clickableName}:</strong> <em>/me${parsedMessage}</em>`,
				];
			}
			return [
				'chat chatmessage-' + toID(name) + hlClass + mineClass,
				`${timestamp}<em><i><strong${colorStyle}>&bull; ${clickableName}</strong>${parsedMessage}</i></em>`,
			];
		case 'invite':
			let roomid = toRoomid(target);
			return [
				'chat',
				`${timestamp}<em>${clickableName} invited you to join the room "${roomid}"</em>` +
				`<div class="notice"><button class="button" name="joinRoom" value="${roomid}">Join ${roomid}</button></div>`,
			];
		case 'announce':
			return [
				'chat chatmessage-' + toID(name) + hlClass + mineClass,
				`${timestamp}<strong${colorStyle}>${clickableName}:</strong> <span class="message-announce">${BattleLog.parseMessage(target)}</span>`,
			];
		case 'log':
			return [
				'chat chatmessage-' + toID(name) + hlClass + mineClass,
				`${timestamp}<span class="message-log">${BattleLog.parseMessage(target)}</span>`,
			];
		case 'data-pokemon':
		case 'data-item':
		case 'data-ability':
		case 'data-move':
			return ['chat message-error', '[outdated code no longer supported]'];
		case 'text':
			return ['chat', BattleLog.parseMessage(target)];
		case 'error':
			return ['chat message-error', formatText(target, true)];
		case 'html':
			if (!name) {
				return [
					'chat' + hlClass,
					`${timestamp}<em>${BattleLog.sanitizeHTML(target)}</em>`,
				];
			}
			return [
				'chat chatmessage-' + toID(name) + hlClass + mineClass,
				`${timestamp}<strong${colorStyle}>${clickableName}:</strong> <em>${BattleLog.sanitizeHTML(target)}</em>`,
			];
		case 'uhtml':
		case 'uhtmlchange':
			let parts = target.split(',');
			let htmlSrc = parts.slice(1).join(',').trim();
			this.changeUhtml(parts[0], htmlSrc, cmd === 'uhtml');
			return ['', ''];
		case 'raw':
			return ['chat', BattleLog.sanitizeHTML(target)];
		case 'nonotify':
			return ['chat', BattleLog.sanitizeHTML(target), true];
		default:
			// Not a command or unsupported. Parsed as a normal chat message.
			if (!name) {
				return [
					'chat' + hlClass,
					`${timestamp}<em>${BattleLog.parseMessage(message)}</em>`,
				];
			}
			return [
				'chat chatmessage-' + toID(name) + hlClass + mineClass,
				`${timestamp}<strong${colorStyle}>${clickableName}:</strong> <em>${BattleLog.parseMessage(message)}</em>`,
			];
		}
	}

	static parseMessage(str: string, isTrusted = false) {
		// Don't format console commands (>>).
		if (str.substr(0, 3) === '>> ' || str.substr(0, 4) === '>>> ') return this.escapeHTML(str);
		// Don't format console results (<<).
		if (str.substr(0, 3) === '<< ') return this.escapeHTML(str);
		str = formatText(str, isTrusted);

		let options = BattleLog.prefs('chatformatting') || {};

		if (options.hidelinks) {
			str = str.replace(/<a[^>]*>/g, '<u>').replace(/<\/a>/g, '</u>');
		}
		if (options.hidespoiler) {
			str = str.replace(/<span class="spoiler">/g, '<span class="spoiler spoiler-shown">');
		}
		if (options.hidegreentext) {
			str = str.replace(/<span class="greentext">/g, '<span>');
		}

		return str;
	}

	static interstice = (() => {
		const whitelist: string[] = Config.whitelist;
		const patterns = whitelist.map(entry => new RegExp(
			`^(https?:)?//([A-Za-z0-9-]*\\.)?${entry.replace(/\./g, '\\.')}(/.*)?`, 'i'
		));
		return {
			isWhitelisted(uri: string) {
				if (uri.startsWith('/') && uri[1] !== '/') {
					// domain-relative URIs are safe
					return true;
				}
				for (const pattern of patterns) {
					if (pattern.test(uri)) return true;
				}
				return false;
			},
			getURI(uri: string) {
				return `http://${Config.routes.root}/interstice?uri=${encodeURIComponent(uri)}`;
			},
		};
	})();

	static players: any[] = [];
	static ytLoading: Promise<void> | null = null;
	static tagPolicy: ((tagName: string, attribs: string[]) => any) | null = null;
	static initSanitizeHTML() {
		if (this.tagPolicy) return;
		if (!('html4' in window)) {
			throw new Error('sanitizeHTML requires caja');
		}

		// By default, Caja will ban any HTML tags it doesn't recognize.
		// Additional HTML tags to allow:
		Object.assign(html4.ELEMENTS, {
			marquee: 0,
			blink: 0,
			psicon: html4.eflags['OPTIONAL_ENDTAG'] | html4.eflags['EMPTY'],
			username: 0,
			spotify: 0,
			youtube: 0,
			formatselect: 0,
			copytext: 0,
			twitch: 0,
		});

		// By default, Caja will ban any attributes it doesn't recognize.
		// Additional attributes to allow:
		Object.assign(html4.ATTRIBS, {
			// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee
			'marquee::behavior': 0,
			'marquee::bgcolor': 0,
			'marquee::direction': 0,
			'marquee::height': 0,
			'marquee::hspace': 0,
			'marquee::loop': 0,
			'marquee::scrollamount': 0,
			'marquee::scrolldelay': 0,
			'marquee::truespeed': 0,
			'marquee::vspace': 0,
			'marquee::width': 0,
			'psicon::pokemon': 0,
			'psicon::item': 0,
			'psicon::type': 0,
			'selectformat::type': 0,
			'psicon::category': 0,
			'username::name': 0,
			'form::data-submitsend': 0,
			'formatselect::format': 0,
			'div::data-server': 0,
			'button::data-send': 0,
			'form::data-delimiter': 0,
			'button::data-delimiter': 0,
			'*::aria-label': 0,
			'*::aria-hidden': 0,
		});

		// Caja unfortunately doesn't document how `tagPolicy` works, so
		// here's how it goes:

		// Every opening tag and attributes is filtered through
		// `tagPolicy`, being replaced by the {tagName, attribs} returned.
		// Returning `undefined` means that the tag will be removed entirely.

		// We run Caja's built-in tag sanitization in the first line of our
		// custom tagPolicy, and its attribs sanitization midway through, with
		// `sanitizeAttribs`.

		// (n.b. tag contents etc can't be modified in this step.)

		/**
		 * @param tagName Lowercase tag name
		 * @param attribs attribs in the form of [key, value, key, value]
		 * @return undefined to remove the tag
		 */
		this.tagPolicy = (tagName: string, attribs: string[]) => {
			if (html4.ELEMENTS[tagName] & html4.eflags['UNSAFE']) {
				return;
			}

			function getAttrib(key: string) {
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === key) {
						return attribs[i + 1];
					}
				}
				return undefined;
			}
			function setAttrib(key: string, value: string) {
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === key) {
						attribs[i + 1] = value;
						return;
					}
				}
				attribs.push(key, value);
			}
			function deleteAttrib(key: string) {
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === key) {
						attribs.splice(i, 2);
						return;
					}
				}
			}

			let dataUri = '';
			let targetReplace = false;
			// if Caja CSS isn't loaded, we still trust <psicon> CSS
			let unsanitizedStyle = '';

			if (tagName === 'a') {
				if (getAttrib('target') === 'replace') {
					targetReplace = true;
				}
			} else if (tagName === 'img') {
				const src = getAttrib('src') || '';
				if (src.startsWith('data:image/')) {
					dataUri = src;
				}
				if (src.startsWith('//')) {
					if (location.protocol !== 'http:' && location.protocol !== 'https:') {
						// in testclient with `file://`, fix src so it still works
						setAttrib('src', 'https:' + src);
					}
				}
			} else if (tagName === 'twitch') {
				// <iframe src="https://player.twitch.tv/?channel=ninja&parent=www.example.com" allowfullscreen="true" height="378" width="620"></iframe>
				const src = getAttrib('src') || "";
				const channelId = /(https?:\/\/)?twitch.tv\/([A-Za-z0-9]+)/i.exec(src)?.[2];
				const height = parseInt(getAttrib('height') || "", 10) || 400;
				const width = parseInt(getAttrib('width') || "", 10) || 340;
				return {
					tagName: 'iframe',
					attribs: [
						'src', `https://player.twitch.tv/?channel=${channelId!}&parent=${location.hostname}&autoplay=false`,
						'allowfullscreen', 'true', 'height', `${height}`, 'width', `${width}`,
					],
				};
			} else if (tagName === 'username') {
				// <username> is a custom element that handles namecolors
				tagName = 'strong';
				const color = this.usernameColor(toID(getAttrib('name')));
				unsanitizedStyle = `color:${color}`;
			} else if (tagName === 'spotify') {
				// <iframe src="https://open.spotify.com/embed/track/6aSYnCIwcLpnDXngGKAEzZ" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
				const src = getAttrib('src') || '';
				const songId = /(?:\?v=|\/track\/)([A-Za-z0-9]+)/.exec(src)?.[1];

				return {
					tagName: 'iframe',
					attribs: ['src', `https://open.spotify.com/embed/track/${songId!}`, 'width', '300', 'height', '380', 'frameborder', '0', 'allowtransparency', 'true', 'allow', 'encrypted-media'],
				};
			} else if (tagName === 'youtube') {
				// <iframe width="320" height="180" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

				const src = getAttrib('src') || '';
				// Google's ToS requires a minimum of 200x200
				let width = getAttrib('width') || '0';
				let height = getAttrib('height') || '0';
				if (Number(width) < 200) {
					width = window.innerWidth >= 400 ? '400' : '320';
				}
				if (Number(height) < 200) {
					height = window.innerWidth >= 400 ? '225' : '200';
				}
				const videoId = /(?:\?v=|\/embed\/)([A-Za-z0-9_-]+)/.exec(src)?.[1];
				if (!videoId) return { tagName: 'img', attribs: ['alt', `invalid src for <youtube>`] };

				const time = /(?:\?|&)(?:t|start)=([0-9]+)/.exec(src)?.[1];
				this.players.push(null);
				const idx = this.players.length;
				this.initYoutubePlayer(idx);
				return {
					tagName: 'iframe',
					attribs: [
						'id', `youtube-iframe-${idx}`,
						'width', width, 'height', height,
						'src', `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1${time ? `&start=${time}` : ''}`,
						'frameborder', '0', 'allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', 'allowfullscreen', 'allowfullscreen',
						'time', `${time || 0}`,
					],
				};
			} else if (tagName === 'formatselect') {
				return {
					tagName: 'button',
					attribs: [
						'type', 'selectformat',
						'class', "select formatselect",
						'value', getAttrib('format') || getAttrib('value') || '',
						'name', getAttrib('name') || '',
					],
				};
			} else if (tagName === 'copytext') {
				return {
					tagName: 'button',
					attribs: [
						'type', getAttrib('type'),
						'class', getAttrib('class') || 'button',
						'value', getAttrib('value'),
						'name', 'copyText',
					],
				};
			} else if (tagName === 'psicon') {
				// <psicon> is a custom element which supports a set of mutually incompatible attributes:
				// <psicon pokemon> and <psicon item>
				let iconType = null;
				let iconValue = null;
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === 'pokemon' || attribs[i] === 'item' || attribs[i] === 'type' || attribs[i] === 'category') {
						[iconType, iconValue] = attribs.slice(i, i + 2);
						break;
					}
				}
				tagName = 'span';

				if (iconType) {
					const className = getAttrib('class');

					if (iconType === 'pokemon') {
						setAttrib('class', 'picon' + (className ? ' ' + className : ''));
						unsanitizedStyle = Dex.getPokemonIcon(iconValue);
					} else if (iconType === 'item') {
						setAttrib('class', 'itemicon' + (className ? ' ' + className : ''));
						unsanitizedStyle = Dex.getItemIcon(iconValue);
					} else if (iconType === 'type') {
						tagName = Dex.getTypeIcon(iconValue).slice(1, -3);
					} else if (iconType === 'category') {
						tagName = Dex.getCategoryIcon(iconValue).slice(1, -3);
					}
				}
			}

			attribs = html.sanitizeAttribs(tagName, attribs, (urlData: any) => {
				if (urlData.scheme_ === 'geo' || urlData.scheme_ === 'sms' || urlData.scheme_ === 'tel') return null;
				return urlData;
			});
			if (unsanitizedStyle) {
				const style = getAttrib('style');
				setAttrib('style', unsanitizedStyle + (style ? '; ' + style : ''));
			}

			if (dataUri && tagName === 'img') {
				setAttrib('src', dataUri);
			}
			if (tagName === 'a' || (tagName === 'form' && !getAttrib('data-submitsend'))) {
				if (targetReplace) {
					setAttrib('data-target', 'replace');
					deleteAttrib('target');
				} else {
					setAttrib('target', '_blank');
				}
				if (tagName === 'a') {
					setAttrib('rel', 'noopener');
				}
			}
			return { tagName, attribs };
		};
	}
	static localizeTime(full: string, date: string, time: string, timezone?: string) {
		let parsedTime = new Date(date + 'T' + time + (timezone || 'Z').toUpperCase());
		// Very old (pre-ES5) web browsers may be incapable of parsing ISO 8601
		// dates. In such a case, gracefully continue without replacing the date
		// format.
		if (!parsedTime.getTime()) return full;

		let formattedTime;
		// Try using Intl API if it exists
		if ((window as any).Intl?.DateTimeFormat) {
			formattedTime = new Intl.DateTimeFormat(undefined, {
				month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric',
			}).format(parsedTime);
		} else {
			// toLocaleString even exists in ECMAScript 1, so no need to check
			// if it exists.
			formattedTime = parsedTime.toLocaleString();
		}
		return '<time>' + BattleLog.escapeHTML(formattedTime) + '</time>';
	}
	static sanitizeHTML(input: string) {
		if (typeof input !== 'string') return '';

		this.initSanitizeHTML();

		input = input.replace(/<username([^>]*)>([^<]*)<\/username>/gi, (match, attrs, username) => {
			if (/\bname\s*=\s*"/.test(attrs)) return match;
			const escapedUsername = username.replace(/"/g, '&quot;').replace(/>/g, '&gt;');
			return `<username${attrs} name="${escapedUsername}">${username}</username>`;
		});

		// Our custom element support happens in `tagPolicy`, which is set
		// up in `initSanitizeHTML` above.
		const sanitized = html.sanitizeWithPolicy(input, this.tagPolicy) as string;

		// <time> parsing requires ISO 8601 time. While more time formats are
		// supported by most JavaScript implementations, it isn't required, and
		// how to exactly enforce ignoring user agent timezone setting is not obvious.
		// As dates come from the server which isn't aware of client timezone, a
		// particular timezone is required.
		//
		// This regular expression is split into three groups.
		//
		// Group 1 - date
		// Group 2 - time (seconds and milliseconds are optional)
		// Group 3 - optional timezone
		//
		// Group 1 and group 2 are split to allow using space as a separator
		// instead of T. Stricly speaking ECMAScript 5 specification only
		// allows T, however it's more practical to also allow spaces.
		return sanitized.replace(
			/<time>\s*([+-]?\d{4,}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)(Z|[+-]\d{2}:\d{2})?\s*<\/time>/ig,
			this.localizeTime
		);
	}

	static initYoutubePlayer(idx: number) {
		const id = `youtube-iframe-${idx}`;
		const loadPlayer = () => {
			const el = $(`#${id}`);
			if (!el.length) return;
			const player = new window.YT.Player(id, {
				events: {
					onStateChange: (event: any) => {
						if (event.data === window.YT.PlayerState.PLAYING) {
							for (const curPlayer of BattleLog.players) {
								if (player === curPlayer) continue;
								curPlayer?.pauseVideo?.();
							}
						}
					},
				},
			});
			const time = Number(el.attr('time'));
			if (time) {
				player.seekTo(time);
			}
			this.players[idx - 1] = player;
		};
		// wait for html element to be in DOM
		this.ensureYoutube().then(() => {
			setTimeout(() => loadPlayer(), 300);
		});
	}

	static ensureYoutube(): Promise<void> {
		if (this.ytLoading) return this.ytLoading;

		this.ytLoading = new Promise(resolve => {
			const el = document.createElement('script');
			el.type = 'text/javascript';
			el.async = true;
			el.src = 'https://youtube.com/iframe_api';
			el.onload = () => {
				// since the src loads more files remotely we'll just wait
				// until the player exists
				const loopCheck = () => {
					if (!window.YT?.Player) {
						setTimeout(() => loopCheck(), 300);
					} else {
						resolve();
					}
				};
				loopCheck();
			};
			document.body.appendChild(el);
		});
		return this.ytLoading;
	}

	/*********************************************************
	 * Replay files
	 *********************************************************/

	// Replay files are .html files that display a replay for a battle.

	// The .html files mainly contain replay log data; the actual replay
	// player is downloaded online. Also included is a textual log and
	// some minimal CSS to make it look pretty, for offline viewing.

	// This strategy helps keep the replay file reasonably small; of
	// the 30 KB or so for a 50-turn battle, around 10 KB is the log
	// data, and around 20 KB is the textual log.

	// The actual replay player is downloaded from replay-embed.js,
	// which handles loading all the necessary resources for turning the log
	// data into a playable replay.

	// Battle log data is stored in and loaded from a
	// <script type="text/plain" class="battle-log-data"> tag.

	// replay-embed.js is loaded through a cache-buster that rotates daily.
	// This allows pretty much anything about the replay viewer to be
	// updated as desired.

	static createReplayFile(room: { battle: Battle, id?: string, fragment?: string }) {
		let battle = room.battle;
		let replayid = room.id;
		if (replayid) {
			// battle room
			replayid = replayid.slice(7);
			if (window.Config?.server.id !== 'showdown') {
				if (!window.Config?.server.registered) {
					replayid = 'unregisteredserver-' + replayid;
				} else {
					replayid = Config.server.id + '-' + replayid;
				}
			}
		} else if (room.fragment) {
			// replay panel
			replayid = room.fragment;
		} else {
			replayid = battle.id;
		}
		// TODO: do this synchronously so large battles aren't cut off
		battle.seekTurn(Infinity);
		if (!battle.atQueueEnd) return null;
		let buf = '<!DOCTYPE html>\n';
		buf += '<meta charset="utf-8" />\n';
		buf += '<!-- version 1 -->\n';
		buf += `<title>${BattleLog.escapeHTML(battle.tier)} replay: ${BattleLog.escapeHTML(battle.p1.name)} vs. ${BattleLog.escapeHTML(battle.p2.name)}</title>\n`;
		// This <style> exists so that replays are readable without an internet connection
		buf += '<style>\n';
		buf += 'html,body {font-family:Verdana, sans-serif;font-size:10pt;margin:0;padding:0;}body{padding:12px 0;} .battle-log {font-family:Verdana, sans-serif;font-size:10pt;} .battle-log-inline {border:1px solid #AAAAAA;background:#EEF2F5;color:black;max-width:640px;margin:0 auto 80px;padding-bottom:5px;} .battle-log .inner {padding:4px 8px 0px 8px;} .battle-log .inner-preempt {padding:0 8px 4px 8px;} .battle-log .inner-after {margin-top:0.5em;} .battle-log h2 {margin:0.5em -8px;padding:4px 8px;border:1px solid #AAAAAA;background:#E0E7EA;border-left:0;border-right:0;font-family:Verdana, sans-serif;font-size:13pt;} .battle-log .chat {vertical-align:middle;padding:3px 0 3px 0;font-size:8pt;} .battle-log .chat strong {color:#40576A;} .battle-log .chat em {padding:1px 4px 1px 3px;color:#000000;font-style:normal;} .chat.mine {background:rgba(0,0,0,0.05);margin-left:-8px;margin-right:-8px;padding-left:8px;padding-right:8px;} .spoiler {color:#BBBBBB;background:#BBBBBB;padding:0px 3px;} .spoiler:hover, .spoiler:active, .spoiler-shown {color:#000000;background:#E2E2E2;padding:0px 3px;} .spoiler a {color:#BBBBBB;} .spoiler:hover a, .spoiler:active a, .spoiler-shown a {color:#2288CC;} .chat code, .chat .spoiler:hover code, .chat .spoiler:active code, .chat .spoiler-shown code {border:1px solid #C0C0C0;background:#EEEEEE;color:black;padding:0 2px;} .chat .spoiler code {border:1px solid #CCCCCC;background:#CCCCCC;color:#CCCCCC;} .battle-log .rated {padding:3px 4px;} .battle-log .rated strong {color:white;background:#89A;padding:1px 4px;border-radius:4px;} .spacer {margin-top:0.5em;} .message-announce {background:#6688AA;color:white;padding:1px 4px 2px;} .message-announce a, .broadcast-green a, .broadcast-blue a, .broadcast-red a {color:#DDEEFF;} .broadcast-green {background-color:#559955;color:white;padding:2px 4px;} .broadcast-blue {background-color:#6688AA;color:white;padding:2px 4px;} .infobox {border:1px solid #6688AA;padding:2px 4px;} .infobox-limited {max-height:200px;overflow:auto;overflow-x:hidden;} .broadcast-red {background-color:#AA5544;color:white;padding:2px 4px;} .message-learn-canlearn {font-weight:bold;color:#228822;text-decoration:underline;} .message-learn-cannotlearn {font-weight:bold;color:#CC2222;text-decoration:underline;} .message-effect-weak {font-weight:bold;color:#CC2222;} .message-effect-resist {font-weight:bold;color:#6688AA;} .message-effect-immune {font-weight:bold;color:#666666;} .message-learn-list {margin-top:0;margin-bottom:0;} .message-throttle-notice, .message-error {color:#992222;} .message-overflow, .chat small.message-overflow {font-size:0pt;} .message-overflow::before {font-size:9pt;content:\'...\';} .subtle {color:#3A4A66;}\n';
		buf += '</style>\n';
		buf += '<div class="wrapper replay-wrapper" style="max-width:1180px;margin:0 auto">\n';
		buf += '<input type="hidden" name="replayid" value="' + replayid + '" />\n';
		buf += '<div class="battle"></div><div class="battle-log"></div><div class="replay-controls"></div><div class="replay-controls-2"></div>\n';
		buf += `<h1 style="font-weight:normal;text-align:center"><strong>${BattleLog.escapeHTML(battle.tier)}</strong><br /><a href="http://${Config.routes.users}/${toID(battle.p1.name)}" class="subtle" target="_blank">${BattleLog.escapeHTML(battle.p1.name)}</a> vs. <a href="http://${Config.routes.users}/${toID(battle.p2.name)}" class="subtle" target="_blank">${BattleLog.escapeHTML(battle.p2.name)}</a></h1>\n`;
		buf += '<script type="text/plain" class="battle-log-data">' + battle.stepQueue.join('\n').replace(/\//g, '\\/') + '</script>\n'; // lgtm [js/incomplete-sanitization]
		buf += '</div>\n';
		buf += '<div class="battle-log battle-log-inline"><div class="inner">' + battle.scene.log.elem.innerHTML + '</div></div>\n';
		buf += '</div>\n';
		buf += '<script>\n';
		buf += `let daily = Math.floor(Date.now()/1000/60/60/24);document.write('<script src="https://${Config.routes.client}/js/replay-embed.js?version'+daily+'"></'+'script>');\n`;
		buf += '</script>\n';
		return buf;
	}

	static createReplayFileHref(room: { battle: Battle, id?: string, fragment?: string }) {
		// unescape(encodeURIComponent()) is necessary because btoa doesn't support Unicode
		const replayFile = BattleLog.createReplayFile(room);
		if (!replayFile) {
			return 'javascript:alert("You will need to click Download again once the replay file is at the end.");void 0';
		}
		return 'data:text/plain;base64,' + encodeURIComponent(btoa(unescape(encodeURIComponent(replayFile))));
	}
}
