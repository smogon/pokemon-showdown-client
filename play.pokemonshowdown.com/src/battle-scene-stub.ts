import type {Pokemon, Side} from './battle';
import type {ScenePos, PokemonSprite} from './battle-animations';
import type {BattleLog} from './battle-log';

export class BattleSceneStub {
	animating: boolean = false;
	acceleration: number = NaN;
	gen: number = NaN;
	activeCount: number = NaN;
	numericId: number = NaN;
	timeOffset: number = NaN;
	interruptionCount: number = NaN;
	messagebarOpen: boolean = false;
	log: BattleLog = {add: (args: Args, kwargs?: KWArgs) => {}} as any;
	$frame?: JQuery;

	abilityActivateAnim(pokemon: Pokemon, result: string): void { }
	addPokemonSprite(pokemon: Pokemon): PokemonSprite { return null!; }
	addSideCondition(siden: number, id: ID, instant?: boolean | undefined): void { }
	animationOff(): void { }
	animationOn(): void { }
	maybeCloseMessagebar(args: Args, kwArgs: KWArgs): boolean { return false; }
	closeMessagebar(): boolean { return false; }
	damageAnim(pokemon: Pokemon, damage: string | number): void { }
	destroy(): void { }
	finishAnimations(): JQuery.Promise<JQuery<HTMLElement>, any, any> | undefined { return void(0); }
	healAnim(pokemon: Pokemon, damage: string | number): void { }
	hideJoinButtons(): void { }
	incrementTurn(): void { }
	updateAcceleration(): void { }
	message(message: string, hiddenMessage?: string | undefined): void { }
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
	updateWeather(instant?: boolean | undefined): void { }
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

if (typeof require === 'function') {
	// in Node
	(global as any).BattleSceneStub = BattleSceneStub;
}
