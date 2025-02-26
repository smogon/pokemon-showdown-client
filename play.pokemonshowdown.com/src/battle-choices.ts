/**
 * Battle choices
 *
 * PS will send requests "what do you do this turn?", and you send back
 * choices "I switch Pikachu for Caterpie, and Squirtle uses Water Gun"
 *
 * This file contains classes for handling requests and choices.
 *
 * Dependencies: battle-dex
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

import type { Battle, ServerPokemon } from "./battle";
import { Dex, toID, type ID } from "./battle-dex";

export interface BattleRequestSideInfo {
	name: string;
	id: 'p1' | 'p2' | 'p3' | 'p4';
	pokemon: ServerPokemon[];
}
export interface BattleRequestActivePokemon {
	moves: {
		name: string,
		id: ID,
		pp: number,
		maxpp: number,
		target: Dex.MoveTarget,
		disabled?: boolean,
	}[];
	maxMoves?: {
		name: string,
		id: ID,
		target: Dex.MoveTarget,
		disabled?: boolean,
	}[];
	zMoves?: ({
		name: string,
		id: ID,
		target: Dex.MoveTarget,
	} | null)[];
	/** also true if the pokemon can Gigantamax */
	canDynamax?: boolean;
	canGigantamax?: boolean;
	canMegaEvo?: boolean;
	canMegaEvoX?: boolean;
	canMegaEvoY?: boolean;
	canUltraBurst?: boolean;
	canTerastallize?: boolean;
	trapped?: boolean;
	maybeTrapped?: boolean;
}

export interface BattleMoveRequest {
	requestType: 'move';
	rqid: number;
	side: BattleRequestSideInfo;
	active: (BattleRequestActivePokemon | null)[];
	noCancel?: boolean;
}
export interface BattleSwitchRequest {
	requestType: 'switch';
	rqid: number;
	side: BattleRequestSideInfo;
	forceSwitch: boolean[];
	noCancel?: boolean;
}
export interface BattleTeamRequest {
	requestType: 'team';
	rqid: number;
	side: BattleRequestSideInfo;
	maxTeamSize?: number;
	noCancel?: boolean;
}
export interface BattleWaitRequest {
	requestType: 'wait';
	rqid: number;
	side: undefined;
	noCancel?: boolean;
}
export type BattleRequest = BattleMoveRequest | BattleSwitchRequest | BattleTeamRequest | BattleWaitRequest;

interface BattleMoveChoice {
	choiceType: 'move';
	/** 1-based move */
	move: number;
	targetLoc: number;
	mega: boolean;
	megax: boolean;
	megay: boolean;
	ultra: boolean;
	max: boolean;
	z: boolean;
	tera: boolean;
}
interface BattleShiftChoice {
	choiceType: 'shift';
}
interface BattleSwitchChoice {
	choiceType: 'switch' | 'team';
	/** 1-based pokemon */
	targetPokemon: number;
}
type BattleChoice = BattleMoveChoice | BattleShiftChoice | BattleSwitchChoice;

/**
 * Tracks a partial choice, allowing you to build it up one step at a time,
 * and maybe even construct a UI to build it!
 *
 * Doesn't support going backwards; just use `new BattleChoiceBuilder`.
 */
export class BattleChoiceBuilder {
	request: BattleRequest;
	/** Completed choices in string form */
	choices: string[] = [];
	/** Currently active partial move choice - not used for other choices, which don't have partial states */
	current: BattleMoveChoice = {
		choiceType: 'move',
		/** if nonzero, show target screen; if zero, show move screen */
		move: 0,
		targetLoc: 0, // should always be 0: is not partial if `targetLoc` is known
		mega: false,
		megax: false,
		megay: false,
		ultra: false,
		z: false,
		max: false,
		tera: false,
	};
	alreadySwitchingIn: number[] = [];
	alreadyMega = false;
	alreadyMax = false;
	alreadyZ = false;
	alreadyTera = false;

	constructor(request: BattleRequest) {
		this.request = request;
		this.fillPasses();
	}

	toString() {
		let choices = this.choices;
		if (this.current.move) choices = choices.concat(this.stringChoice(this.current));
		return choices.join(', ').replace(/, team /g, ', ');
	}

	isDone() {
		return this.choices.length >= this.requestLength();
	}
	isEmpty() {
		for (const choice of this.choices) {
			if (choice !== 'pass') return false;
		}
		if (this.current.move) return false;
		return true;
	}

	/** Index of the current Pokémon to make choices for */
	index() {
		return this.choices.length;
	}
	/** How many choices is the server expecting? */
	requestLength() {
		const request = this.request;
		switch (request.requestType) {
		case 'move':
			return request.active.length;
		case 'switch':
			return request.forceSwitch.length;
		case 'team':
			if (request.maxTeamSize) return request.maxTeamSize;
			return 1;
		case 'wait':
			return 0;
		}
	}
	currentMoveRequest() {
		if (this.request.requestType !== 'move') return null;
		return this.request.active[this.index()];
	}

	addChoice(choiceString: string) {
		let choice: BattleChoice | null;
		try {
			choice = this.parseChoice(choiceString);
		} catch (err) {
			return (err as Error).message;
		}
		if (!choice) {
			return "You do not need to manually choose to pass; the client handles it for you automatically";
		}
		if (choice.choiceType === 'move') {
			if (!choice.targetLoc && this.requestLength() > 1) {
				const choosableTargets = ['normal', 'any', 'adjacentAlly', 'adjacentAllyOrSelf', 'adjacentFoe'];
				if (choosableTargets.includes(this.getChosenMove(choice, this.index()).target)) {
					this.current.move = choice.move;
					this.current.mega = choice.mega;
					this.current.ultra = choice.ultra;
					this.current.z = choice.z;
					this.current.max = choice.max;
					this.current.tera = choice.tera;
					return null;
				}
			}
			if (choice.mega || choice.megax || choice.megay) this.alreadyMega = true;
			if (choice.z) this.alreadyZ = true;
			if (choice.max) this.alreadyMax = true;
			if (choice.tera) this.alreadyTera = true;
			this.current.move = 0;
			this.current.mega = false;
			this.current.ultra = false;
			this.current.z = false;
			this.current.max = false;
			this.current.tera = false;
		} else if (choice.choiceType === 'switch' || choice.choiceType === 'team') {
			if (this.alreadySwitchingIn.includes(choice.targetPokemon)) {
				if (choice.choiceType === 'switch') {
					return "You've already chosen to switch that Pokémon in";
				}
				// remove choice instead
				for (let i = 0; i < this.alreadySwitchingIn.length; i++) {
					if (this.alreadySwitchingIn[i] === choice.targetPokemon) {
						this.alreadySwitchingIn.splice(i, 1);
						this.choices.splice(i, 1);
						return null;
					}
				}
				return "Unexpected bug, please report this";
			}
			this.alreadySwitchingIn.push(choice.targetPokemon);
		} else if (choice.choiceType === 'shift') {
			if (this.index() === 1) {
				return "Only Pokémon not already in the center can shift to the center";
			}
		}
		this.choices.push(this.stringChoice(choice));
		this.fillPasses();
		return null;
	}

	/**
	 * Move and switch requests will often skip over some active Pokémon (mainly
	 * fainted Pokémon). This will fill them in automatically, so we don't need
	 * to ask a user for them.
	 */
	fillPasses() {
		const request = this.request;
		switch (request.requestType) {
		case 'move':
			while (this.choices.length < request.active.length && !request.active[this.choices.length]) {
				this.choices.push('pass');
			}
			break;
		case 'switch':
			while (this.choices.length < request.forceSwitch.length && !request.forceSwitch[this.choices.length]) {
				this.choices.push('pass');
			}
		}
	}

	getChosenMove(choice: BattleMoveChoice, pokemonIndex: number) {
		const request = this.request as BattleMoveRequest;
		const activePokemon = request.active[pokemonIndex]!;
		const moveIndex = choice.move - 1;
		if (choice.z) {
			return activePokemon.zMoves![moveIndex]!;
		}
		if (choice.max || (activePokemon.maxMoves && !activePokemon.canDynamax)) {
			return activePokemon.maxMoves![moveIndex];
		}
		return activePokemon.moves[moveIndex];
	}

	/**
	 * Parses a choice from string form to BattleChoice form
	 */
	parseChoice(choice: string): BattleChoice | null {
		const request = this.request;
		if (request.requestType === 'wait') throw new Error(`It's not your turn to choose anything`);

		const index = this.choices.length;

		if (choice === 'shift') return { choiceType: 'shift' };

		if (choice.startsWith('move ')) {
			if (request.requestType !== 'move') {
				throw new Error(`You must switch in a Pokémon, not move.`);
			}
			const moveRequest = request.active[index]!;
			choice = choice.slice(5);
			let current: BattleMoveChoice = {
				choiceType: 'move',
				move: 0,
				targetLoc: 0,
				mega: false,
				megax: false,
				megay: false,
				ultra: false,
				z: false,
				max: false,
				tera: false,
			};
			while (true) {
				// If data ends with a number, treat it as a target location.
				// We need to special case 'Conversion 2' so it doesn't get
				// confused with 'Conversion' erroneously sent with the target
				// '2' (since Conversion targets 'self', targetLoc can't be 2).
				if (/\s(?:-|\+)?[1-3]$/.test(choice) && toID(choice) !== 'conversion2') {
					if (current.targetLoc) throw new Error(`Move choice has multiple targets`);
					current.targetLoc = parseInt(choice.slice(-2), 10);
					choice = choice.slice(0, -2).trim();
				} else if (choice.endsWith(' mega')) {
					current.mega = true;
					choice = choice.slice(0, -5);
				} else if (choice.endsWith(' megax')) {
					current.megax = true;
					choice = choice.slice(0, -6);
				} else if (choice.endsWith(' megay')) {
					current.megay = true;
					choice = choice.slice(0, -6);
				} else if (choice.endsWith(' zmove')) {
					current.z = true;
					choice = choice.slice(0, -6);
				} else if (choice.endsWith(' ultra')) {
					current.ultra = true;
					choice = choice.slice(0, -6);
				} else if (choice.endsWith(' dynamax')) {
					current.max = true;
					choice = choice.slice(0, -8);
				} else if (choice.endsWith(' max')) {
					current.max = true;
					choice = choice.slice(0, -4);
				} else if (choice.endsWith(' terastallize')) {
					current.tera = true;
					choice = choice.slice(0, -13);
				} else if (choice.endsWith(' terastal')) {
					current.tera = true;
					choice = choice.slice(0, -9);
				} else {
					break;
				}
			}

			if (/^[0-9]+$/.test(choice)) {
				// Parse a one-based move index.
				current.move = parseInt(choice, 10);
			} else {
				// Parse a move ID.
				// Move names are also allowed, but may cause ambiguity (see client issue #167).
				let moveid = toID(choice);
				if (moveid.startsWith('hiddenpower')) moveid = 'hiddenpower' as ID;

				for (let i = 0; i < moveRequest.moves.length; i++) {
					if (moveid === moveRequest.moves[i].id) {
						current.move = i + 1;
						break;
					}
				}
				if (!current.move && moveRequest.zMoves) {
					for (let i = 0; i < moveRequest.zMoves.length; i++) {
						if (!moveRequest.zMoves[i]) continue;
						if (moveid === moveRequest.zMoves[i]!.id) {
							current.move = i + 1;
							current.z = true;
							break;
						}
					}
				}
				if (!current.move && moveRequest.maxMoves) {
					for (let i = 0; i < moveRequest.maxMoves.length; i++) {
						if (moveid === moveRequest.maxMoves[i].id) {
							current.move = i + 1;
							current.max = true;
							break;
						}
					}
				}
			}
			if (current.max && !moveRequest.canDynamax) current.max = false;
			return current;
		}

		if (choice.startsWith('switch ') || choice.startsWith('team ')) {
			choice = choice.slice(choice.startsWith('team ') ? 5 : 7);
			const isTeamPreview = request.requestType === 'team';
			let current: BattleSwitchChoice = {
				choiceType: isTeamPreview ? 'team' : 'switch',
				targetPokemon: 0,
			};
			if (/^[0-9]+$/.test(choice)) {
				// Parse a one-based move index.
				current.targetPokemon = parseInt(choice, 10);
			} else {
				// Parse a pokemon name
				const lowerChoice = choice.toLowerCase();
				const choiceid = toID(choice);
				let matchLevel = 0;
				let match = 0;
				for (let i = 0; i < request.side.pokemon.length; i++) {
					const serverPokemon = request.side.pokemon[i];
					let curMatchLevel = 0;
					if (choice === serverPokemon.name) {
						curMatchLevel = 10;
					} else if (lowerChoice === serverPokemon.name.toLowerCase()) {
						curMatchLevel = 9;
					} else if (choiceid === toID(serverPokemon.name)) {
						curMatchLevel = 8;
					} else if (choiceid === toID(serverPokemon.speciesForme)) {
						curMatchLevel = 7;
					} else if (choiceid === toID(Dex.species.get(serverPokemon.speciesForme).baseSpecies)) {
						curMatchLevel = 6;
					}
					if (curMatchLevel > matchLevel) {
						match = i + 1;
						matchLevel = curMatchLevel;
					}
				}
				if (!match) {
					throw new Error(`Couldn't find Pokémon "${choice}" to switch to`);
				}
				current.targetPokemon = match;
			}
			if (!isTeamPreview && current.targetPokemon - 1 < this.requestLength()) {
				throw new Error(`That Pokémon is already in battle!`);
			}
			const target = request.side.pokemon[current.targetPokemon - 1];
			if (!target) {
				throw new Error(`Couldn't find Pokémon "${choice}" to switch to!`);
			}
			if (target.fainted) {
				throw new Error(`${target.name} is fainted and cannot battle!`);
			}
			return current;
		}

		if (choice === 'pass') return null;

		throw new Error(`Unrecognized choice "${choice}"`);
	}

	/**
	 * Converts a choice from `BattleChoice` into string form
	 */
	stringChoice(choice: BattleChoice | null) {
		if (!choice) return `pass`;
		switch (choice.choiceType) {
		case 'move':
			const target = choice.targetLoc ? ` ${choice.targetLoc > 0 ? '+' : ''}${choice.targetLoc}` : ``;
			const boost = `${choice.max ? ' max' : ''}${choice.mega ? ' mega' : ''}${choice.z ? ' zmove' : ''}${choice.tera ? ' terastallize' : ''}`;
			return `move ${choice.move}${boost}${target}`;
		case 'switch':
		case 'team':
			return `${choice.choiceType} ${choice.targetPokemon}`;
		case 'shift':
			return `shift`;
		}
	}

	/**
	 * The request sent from the server is actually really gross, but we'll have
	 * to wait until we transition to the new client before fixing it in the
	 * protocol, in the interests of not needing to fix it twice (or needing to
	 * fix it without TypeScript).
	 *
	 * In the meantime, this function converts a request from a shitty request
	 * to a request that makes sense.
	 *
	 * I'm sorry for literally all of this.
	 */
	static fixRequest(request: any, battle: Battle) {
		if (!request.requestType) {
			request.requestType = 'move';
			if (request.forceSwitch) {
				request.requestType = 'switch';
			} else if (request.teamPreview) {
				request.requestType = 'team';
			} else if (request.wait) {
				request.requestType = 'wait';
			}
		}

		if (request.requestType === 'wait') request.noCancel = true;
		if (request.side) {
			for (const serverPokemon of request.side.pokemon) {
				battle.parseDetails(serverPokemon.ident.substr(4), serverPokemon.ident, serverPokemon.details, serverPokemon);
				battle.parseHealth(serverPokemon.condition, serverPokemon);
			}
		}

		if (request.active) {
			request.active = request.active.map(
				(active: any, i: number) => request.side.pokemon[i].fainted ? null : active
			);
			for (const active of request.active) {
				if (!active) continue;
				for (const move of active.moves) {
					if (move.move) move.name = move.move;
					move.id = toID(move.name);
				}
				if (active.maxMoves) {
					if (active.maxMoves.maxMoves) {
						active.canGigantamax = active.maxMoves.gigantamax;
						active.maxMoves = active.maxMoves.maxMoves;
					}
					for (const move of active.maxMoves) {
						if (move.move) move.name = Dex.moves.get(move.move).name;
						move.id = toID(move.name);
					}
				}
				if (active.canZMove) {
					active.zMoves = active.canZMove;
					for (const move of active.zMoves) {
						if (!move) continue;
						if (move.move) move.name = move.move;
						move.id = toID(move.name);
					}
				}
			}
		}
	}
}
