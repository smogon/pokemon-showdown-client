import type { Pokemon, Side } from './battle';
import type { ScenePos, PokemonSprite } from './battle-animations';
import type { BattleLog } from './battle-log';
import type { ID } from './battle-dex';
import type { Args, KWArgs } from './battle-text-parser';

export class BattleSceneStub {
	animating = false;
	acceleration = NaN;
	gen = NaN;
	activeCount = NaN;
	numericId = NaN;
	timeOffset = NaN;
	interruptionCount = NaN;
	messagebarOpen = false;
	log: BattleLog = { add: (args: Args, kwargs?: KWArgs) => {} } as any;
	$frame?: JQuery;

	abilityActivateAnim(pokemon: Pokemon, result: string): void { }
	addPokemonSprite(pokemon: Pokemon): PokemonSprite { return null!; }
	addSideCondition(siden: number, id: ID, instant?: boolean): void { }
	animationOff(): void { }
	animationOn(): void { }
	maybeCloseMessagebar(args: Args, kwArgs: KWArgs): boolean { return false; }
	closeMessagebar(): boolean { return false; }
	damageAnim(pokemon: Pokemon, damage: string | number): void { }
	destroy(): void { }
	finishAnimations(): JQuery.Promise<JQuery> | undefined { return undefined; }
	healAnim(pokemon: Pokemon, damage: string | number): void { }
	hideJoinButtons(): void { }
	incrementTurn(): void { }
	updateAcceleration(): void { }
	message(message: string, hiddenMessage?: string): void { }
	pause(): void { }
	setMute(muted: boolean): void { }
	preemptCatchup(): void { }
	removeSideCondition(siden: number, id: ID): void { }
	reset(): void { }
	resetBgm(): void { }
	updateBgm(): void { }
	resultAnim(
		pokemon: Pokemon, result: string, type: "bad" | "good" | "neutral" | "par" | "psn" | "frz" | "slp" | "brn"
	): void { }
	typeAnim(pokemon: Pokemon, types: string): void { }
	resume(): void { }
	runMoveAnim(moveid: ID, participants: Pokemon[]): void { }
	runOtherAnim(moveid: ID, participants: Pokemon[]): void { }
	runPrepareAnim(moveid: ID, attacker: Pokemon, defender: Pokemon): void { }
	runResidualAnim(moveid: ID, pokemon: Pokemon): void { }
	runStatusAnim(moveid: ID, participants: Pokemon[]): void { }
	startAnimations(): void { }
	teamPreview(): void { }
	resetSides(): void { }
	updateGen(): void { }
	updateSidebar(side: Side): void { }
	updateSidebars(): void { }
	updateStatbars(): void { }
	updateWeather(instant?: boolean): void { }
	upkeepWeather(): void { }
	wait(time: number): void { }
	setFrameHTML(html: any): void { }
	setControlsHTML(html: any): void { }
	removeEffect(pokemon: Pokemon, id: ID, instant?: boolean) { }
	addEffect(pokemon: Pokemon, id: ID, instant?: boolean) { }
	animSummon(pokemon: Pokemon, slot: number, instant?: boolean) { }
	animUnsummon(pokemon: Pokemon, instant?: boolean) { }
	animDragIn(pokemon: Pokemon, slot: number) { }
	animDragOut(pokemon: Pokemon) { }
	resetStatbar(pokemon: Pokemon, startHidden?: boolean) { }
	updateStatbar(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) { }
	updateStatbarIfExists(pokemon: Pokemon, updatePrevhp?: boolean, updateHp?: boolean) { }
	animTransform(pokemon: Pokemon, useSpeciesAnim?: boolean, isPermanent?: boolean) { }
	clearEffects(pokemon: Pokemon) { }
	removeTransform(pokemon: Pokemon) { }
	animFaint(pokemon: Pokemon) { }
	animReset(pokemon: Pokemon) { }
	anim(pokemon: Pokemon, end: ScenePos, transition?: string) { }
	beforeMove(pokemon: Pokemon) { }
	afterMove(pokemon: Pokemon) { }
}

declare const require: any;
declare const global: any;
if (typeof require === 'function') {
	// in Node
	global.BattleSceneStub = BattleSceneStub;
}
