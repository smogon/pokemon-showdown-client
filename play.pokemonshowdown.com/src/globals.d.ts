/* eslint-disable @typescript-eslint/consistent-type-imports */

// dex data
///////////

type AnyObject = { [k: string]: any };
declare const BattleText: { [id: string]: { [templateName: string]: string } };
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
