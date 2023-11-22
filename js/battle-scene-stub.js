var



BattleSceneStub=function(){function BattleSceneStub(){this.
animating=false;this.
acceleration=NaN;this.
gen=NaN;this.
activeCount=NaN;this.
numericId=NaN;this.
timeOffset=NaN;this.
interruptionCount=NaN;this.
messagebarOpen=false;this.
log={add:function(args,kwargs){}};this.
$frame=void 0;}var _proto=BattleSceneStub.prototype;_proto.

abilityActivateAnim=function abilityActivateAnim(pokemon,result){};_proto.
addPokemonSprite=function addPokemonSprite(pokemon){return null;};_proto.
addSideCondition=function addSideCondition(siden,id,instant){};_proto.
animationOff=function animationOff(){};_proto.
animationOn=function animationOn(){};_proto.
maybeCloseMessagebar=function maybeCloseMessagebar(args,kwArgs){return false;};_proto.
closeMessagebar=function closeMessagebar(){return false;};_proto.
damageAnim=function damageAnim(pokemon,damage){};_proto.
destroy=function destroy(){};_proto.
finishAnimations=function finishAnimations(){return void 0;};_proto.
healAnim=function healAnim(pokemon,damage){};_proto.
hideJoinButtons=function hideJoinButtons(){};_proto.
incrementTurn=function incrementTurn(){};_proto.
updateAcceleration=function updateAcceleration(){};_proto.
message=function message(_message,hiddenMessage){};_proto.
pause=function pause(){};_proto.
setMute=function setMute(muted){};_proto.
preemptCatchup=function preemptCatchup(){};_proto.
removeSideCondition=function removeSideCondition(siden,id){};_proto.
reset=function reset(){};_proto.
resetBgm=function resetBgm(){};_proto.
updateBgm=function updateBgm(){};_proto.
resultAnim=function resultAnim(
pokemon,result,type)
{};_proto.
typeAnim=function typeAnim(pokemon,types){};_proto.
resume=function resume(){};_proto.
runMoveAnim=function runMoveAnim(moveid,participants){};_proto.
runOtherAnim=function runOtherAnim(moveid,participants){};_proto.
runPrepareAnim=function runPrepareAnim(moveid,attacker,defender){};_proto.
runResidualAnim=function runResidualAnim(moveid,pokemon){};_proto.
runStatusAnim=function runStatusAnim(moveid,participants){};_proto.
startAnimations=function startAnimations(){};_proto.
teamPreview=function teamPreview(){};_proto.
resetSides=function resetSides(){};_proto.
updateGen=function updateGen(){};_proto.
updateSidebar=function updateSidebar(side){};_proto.
updateSidebars=function updateSidebars(){};_proto.
updateStatbars=function updateStatbars(){};_proto.
updateWeather=function updateWeather(instant){};_proto.
upkeepClimateWeather=function upkeepClimateWeather(){};_proto.
upkeepIrritantWeather=function upkeepIrritantWeather(){};_proto.
upkeepEnergyWeather=function upkeepEnergyWeather(){};_proto.
upkeepClearingWeather=function upkeepClearingWeather(){};_proto.
wait=function wait(time){};_proto.
setFrameHTML=function setFrameHTML(html){};_proto.
setControlsHTML=function setControlsHTML(html){};_proto.
removeEffect=function removeEffect(pokemon,id,instant){};_proto.
addEffect=function addEffect(pokemon,id,instant){};_proto.
animSummon=function animSummon(pokemon,slot,instant){};_proto.
animUnsummon=function animUnsummon(pokemon,instant){};_proto.
animDragIn=function animDragIn(pokemon,slot){};_proto.
animDragOut=function animDragOut(pokemon){};_proto.
resetStatbar=function resetStatbar(pokemon,startHidden){};_proto.
updateStatbar=function updateStatbar(pokemon,updatePrevhp,updateHp){};_proto.
updateStatbarIfExists=function updateStatbarIfExists(pokemon,updatePrevhp,updateHp){};_proto.
animTransform=function animTransform(pokemon,isCustomAnim,isPermanent){};_proto.
clearEffects=function clearEffects(pokemon){};_proto.
removeTransform=function removeTransform(pokemon){};_proto.
animFaint=function animFaint(pokemon){};_proto.
animReset=function animReset(pokemon){};_proto.
anim=function anim(pokemon,end,transition){};_proto.
beforeMove=function beforeMove(pokemon){};_proto.
afterMove=function afterMove(pokemon){};return BattleSceneStub;}();


if(typeof require==='function'){

global.BattleSceneStub=BattleSceneStub;
}
//# sourceMappingURL=battle-scene-stub.js.map