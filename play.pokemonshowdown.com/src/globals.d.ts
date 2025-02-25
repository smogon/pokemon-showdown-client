/* eslint-disable @typescript-eslint/consistent-type-imports */

// dex data
///////////

declare const BattleText: { [id: string]: { [templateName: string]: string } };
declare const BattleFormats: { [id: string]: import('./panel-teamdropdown').FormatData };
declare const BattlePokedex: any;
declare const BattleMovedex: any;
declare const BattleAbilities: any;
declare const BattleItems: any;
declare const BattleAliases: any;
declare const BattleStatuses: any;
declare const BattlePokemonSprites: any;
declare const BattlePokemonSpritesBW: any;
declare const NonBattleGames: { [id: string]: string };

// PS globals
/////////////

declare const Config: any;
declare const Replays: any;
declare const exports: any;
type AnyObject = { [k: string]: any };
declare const app: { user: AnyObject, rooms: AnyObject, ignore?: AnyObject };

interface Window {
	[k: string]: any;
}

// Temporary globals (exported from modules, used by non-module files)

// When creating new module files, these should all be commented out
// to make sure they're not being used globally in modules.

// declare var Battle: typeof import('./battle').Battle;
// type Battle = import('./battle').Battle;
// declare var BattleScene: typeof import('./battle-animations').BattleScene;
// type BattleScene = import('./battle-animations').BattleScene;
// declare var Pokemon: typeof import('./battle').Pokemon;
// type Pokemon = import('./battle').Pokemon;
// type ServerPokemon = import('./battle').ServerPokemon;
// declare var BattleLog: typeof import('./battle-log').BattleLog;
// type BattleLog = import('./battle-log').BattleLog;
