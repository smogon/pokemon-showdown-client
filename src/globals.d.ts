// dex data
///////////

declare var BattlePokedex: any;
declare var BattleMovedex: any;
declare var BattleAbilities: any;
declare var BattleItems: any;
declare var BattleAliases: any;
declare var BattleStatuses: any;
declare var BattlePokemonSprites: any;
declare var BattlePokemonSpritesBW: any;

// PS globals
/////////////

declare var Config: any;
declare var Replays: any;
declare var exports: any;
type AnyObject = {[k: string]: any};
declare var app: {user: AnyObject, rooms: AnyObject, ignore?: AnyObject};

interface Window {
	[k: string]: any;
}

// Temporary globals (exported from modules, used by non-module files)

// When creating now module files, these should all be commented out
// to make sure they're not being used globally in modules.

declare var Battle: typeof import('./battle').Battle;
type Battle = import('./battle').Battle;
declare var BattleScene: typeof import('./battle-animations').BattleScene;
type BattleScene = import('./battle-animations').BattleScene;
declare var Pokemon: typeof import('./battle').Pokemon;
type Pokemon = import('./battle').Pokemon;
type ServerPokemon = import('./battle').ServerPokemon;
declare var BattleLog: typeof import('./battle-log').BattleLog;
type BattleLog = import('./battle-log').BattleLog;
