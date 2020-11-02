

// dependencies
///////////////

// Caja
declare var html4: any;
declare var html: any;

// data
///////

declare var BattlePokedex: any;
declare var BattleMovedex: any;
declare var BattleAbilities: any;
declare var BattleItems: any;
declare var BattleAliases: any;
declare var BattleStatuses: any;
// declare var BattleMoveAnims: any;
// declare var BattleStatusAnims: any;
// declare var BattleOtherAnims: any;
// declare var BattleBackdrops: any;
// declare var BattleBackdropsThree: any;
// declare var BattleBackdropsFour: any;
// declare var BattleBackdropsFive: any;
// declare var BattleEffects: any;
declare var BattlePokemonSprites: any;
declare var BattlePokemonSpritesBW: any;

// defined in battle-log-misc
declare function MD5(input: string): string;
declare function formatText(input: string, isTrusted?: boolean): string;

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
