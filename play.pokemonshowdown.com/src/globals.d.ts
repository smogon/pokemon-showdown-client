/* eslint-disable @typescript-eslint/consistent-type-imports */

// dex data
///////////

type AnyObject = { [k: string]: any };
type BattleTextEntry = { [templateName: string]: string | null | BattleTextEntry };
type BattleTextTable = { [id: string]: BattleTextEntry };
type BattleTextData = {
	Default: BattleTextTable,
	Pokedex: { [id: string]: { name: string, baseSpecies: string, forme?: string, grammar?: string } },
	Moves: BattleTextTable,
	Abilities: BattleTextTable,
	Items: BattleTextTable,
	Tags: { [id: string]: { name?: string, hint?: string, desc?: string } },
	TermNames: { [id: string]: string },
	TypeNames: { [id: string]: string },
	NatureNames: { [id: string]: string },
	GenderNames: { [id: string]: string },
	EggGroupNames: { [id: string]: string },
	ColorNames: { [id: string]: string },
	StatusNames: { [id: string]: string },
	TargetNames: { [id: string]: string },
	StatNames: { [id: string]: string },
	StatMediumNames: { [id: string]: string },
	StatShortNames: { [id: string]: string },
};
declare const BattleText: { [lang: string]: BattleTextData };
type BattleUITextEntry = string | null | { [context: string]: string | null };
declare const BattleUIText: { [lang: string]: { [english: string]: BattleUITextEntry } };
declare const BattleFormats: { [id: string]: import('./panel-teamdropdown').FormatData };
declare const BattlePokedex: { [id: string]: AnyObject };
declare const BattleMovedex: { [id: string]: AnyObject };
declare const BattleAbilities: { [id: string]: AnyObject };
declare const BattleItems: { [id: string]: AnyObject };
declare const BattleAliases: { [id: string]: string };
declare const BattleStatuses: { [id: string]: AnyObject };
declare const BattlePokemonSprites: { [id: string]: AnyObject };
declare const BattlePokemonSpritesBW: { [id: string]: AnyObject };
declare const NonBattleGames: { [id: string]: string };

// Window
/////////

interface Window {
	[k: string]: any;
}
