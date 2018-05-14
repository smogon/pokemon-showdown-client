/**
 * Pokemon Showdown Dex Data
 *
 * A collection of data and definitions for src/battle-dex.ts.
 *
 * Larger data has their own files in data/, so this is just for small
 * miscellaneous data that doesn't need its own file.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

const BattleNatures = {
	Adamant: {
		plus: 'atk',
		minus: 'spa'
	},
	Bashful: {},
	Bold: {
		plus: 'def',
		minus: 'atk'
	},
	Brave: {
		plus: 'atk',
		minus: 'spe'
	},
	Calm: {
		plus: 'spd',
		minus: 'atk'
	},
	Careful: {
		plus: 'spd',
		minus: 'spa'
	},
	Docile: {},
	Gentle: {
		plus: 'spd',
		minus: 'def'
	},
	Hardy: {},
	Hasty: {
		plus: 'spe',
		minus: 'def'
	},
	Impish: {
		plus: 'def',
		minus: 'spa'
	},
	Jolly: {
		plus: 'spe',
		minus: 'spa'
	},
	Lax: {
		plus: 'def',
		minus: 'spd'
	},
	Lonely: {
		plus: 'atk',
		minus: 'def'
	},
	Mild: {
		plus: 'spa',
		minus: 'def'
	},
	Modest: {
		plus: 'spa',
		minus: 'atk'
	},
	Naive: {
		plus: 'spe',
		minus: 'spd'
	},
	Naughty: {
		plus: 'atk',
		minus: 'spd'
	},
	Quiet: {
		plus: 'spa',
		minus: 'spe'
	},
	Quirky: {},
	Rash: {
		plus: 'spa',
		minus: 'spd'
	},
	Relaxed: {
		plus: 'def',
		minus: 'spe'
	},
	Sassy: {
		plus: 'spd',
		minus: 'spe'
	},
	Serious: {},
	Timid: {
		plus: 'spe',
		minus: 'atk'
	}
};
const BattleStatIDs = {
	HP: 'hp',
	hp: 'hp',
	Atk: 'atk',
	atk: 'atk',
	Def: 'def',
	def: 'def',
	SpA: 'spa',
	SAtk: 'spa',
	SpAtk: 'spa',
	spa: 'spa',
	spc: 'spa',
	Spc: 'spa',
	SpD: 'spd',
	SDef: 'spd',
	SpDef: 'spd',
	spd: 'spd',
	Spe: 'spe',
	Spd: 'spe',
	spe: 'spe'
};
const BattlePOStatNames = { // only used for interacting with PO
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SAtk',
	spd: 'SDef',
	spe: 'Spd'
};
const BattleStatNames = { // proper style
	hp: 'HP',
	atk: 'Atk',
	def: 'Def',
	spa: 'SpA',
	spd: 'SpD',
	spe: 'Spe'
};

const baseSpeciesChart = [
	'pikachu',
	'pichu',
	'unown',
	'castform',
	'deoxys',
	'burmy',
	'wormadam',
	'cherrim',
	'shellos',
	'gastrodon',
	'rotom',
	'giratina',
	'shaymin',
	'arceus',
	'basculin',
	'darmanitan',
	'deerling',
	'sawsbuck',
	'tornadus',
	'thundurus',
	'landorus',
	'kyurem',
	'keldeo',
	'meloetta',
	'genesect',
	'vivillon',
	'flabebe',
	'floette',
	'florges',
	'furfrou',
	'aegislash',
	'pumpkaboo',
	'gourgeist',
	'meowstic',
	'hoopa',
	'zygarde',
	'lycanroc',
	'wishiwashi',
	'minior',
	'mimikyu',
	'greninja',
	'oricorio',
	'silvally',
	'necrozma',

	// alola totems
	'raticate',
	'marowak',
	'kommoo',

	// mega evolutions
	'charizard',
	'mewtwo'
	// others are hardcoded by ending with 'mega'
];

type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
interface Effect {
	readonly id: string;
	readonly name: string;
	readonly gen: number;
	readonly effectType: 'Item' | 'Move' | 'Ability' | 'Template';
	readonly exists: boolean;
}
interface Item extends Effect {
	readonly effectType: 'Item';
}
interface Move extends Effect {
	readonly effectType: 'Move';
	readonly type: string;
	readonly category: string;
}
interface Ability extends Effect {
	readonly effectType: 'Ability';
}
interface Template extends Effect {
	readonly effectType: 'Template';
	readonly species: string;
	readonly baseSpecies: string;
	readonly spriteid: string;
	readonly types: string[];
	readonly abilities: {0: string, 1?: string, H?: string, S?: string};
	readonly baseStats: {hp: number, atk: number, def: number, spa: number, spd: number, spe: number}
	readonly unreleasedHidden: boolean;
	readonly tier: string;
	readonly isNonstandard: boolean;
}
