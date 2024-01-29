/**
 * Pokemon Showdown Tooltips
 *
 * A file for generating tooltips for battles. This should be IE7+ and
 * use the DOM directly.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var

ModifiableValue=function(){













function ModifiableValue(battle,pokemon,serverPokemon){this.value=0;this.maxValue=0;this.comment=void 0;this.battle=void 0;this.pokemon=void 0;this.serverPokemon=void 0;this.itemName=void 0;this.abilityName=void 0;this.climateWeatherName=void 0;this.irritantWeatherName=void 0;this.energyWeatherName=void 0;this.clearingWeatherName=void 0;this.isAccuracy=false;
this.comment=[];
this.battle=battle;
this.pokemon=pokemon;
this.serverPokemon=serverPokemon;

this.itemName=Dex.items.get(serverPokemon.item).name;
var ability=serverPokemon.ability||(pokemon==null?void 0:pokemon.ability)||serverPokemon.baseAbility;
this.abilityName=Dex.abilities.get(ability).name;
this.climateWeatherName=battle.climateWeather==='snow'?'Snow':Dex.moves.get(battle.climateWeather).exists?
Dex.moves.get(battle.climateWeather).name:Dex.abilities.get(battle.climateWeather).name;
this.irritantWeatherName=Dex.moves.get(battle.irritantWeather).exists?
Dex.moves.get(battle.irritantWeather).name:Dex.abilities.get(battle.irritantWeather).name;
this.energyWeatherName=Dex.moves.get(battle.energyWeather).exists?
Dex.moves.get(battle.energyWeather).name:Dex.abilities.get(battle.energyWeather).name;
this.clearingWeatherName=Dex.moves.get(battle.clearingWeather).exists?
Dex.moves.get(battle.clearingWeather).name:Dex.abilities.get(battle.clearingWeather).name;
}var _proto=ModifiableValue.prototype;_proto.
reset=function reset(){var value=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;var isAccuracy=arguments.length>1?arguments[1]:undefined;
this.value=value;
this.maxValue=0;
this.isAccuracy=!!isAccuracy;
this.comment=[];
};_proto.
tryItem=function tryItem(itemName){var _this$pokemon;
if(itemName!==this.itemName)return false;
if(this.battle.hasPseudoWeather('Magic Room')){
this.comment.push(" ("+itemName+" suppressed by Magic Room)");
return false;
}
if((_this$pokemon=this.pokemon)!=null&&_this$pokemon.volatiles['embargo']){
this.comment.push(" ("+itemName+" suppressed by Embargo)");
return false;
}
var ignoreKlutz=[
"Macho Brace","Power Anklet","Power Band","Power Belt","Power Bracer","Power Lens","Power Weight"];

if(this.tryAbility('Klutz')&&!ignoreKlutz.includes(itemName)){
this.comment.push(" ("+itemName+" suppressed by Klutz)");
return false;
}
return true;
};_proto.
tryAbility=function tryAbility(abilityName){var _this$pokemon2,_this$pokemon3;
if(abilityName!==this.abilityName)return false;
if((_this$pokemon2=this.pokemon)!=null&&_this$pokemon2.volatiles['gastroacid']){
this.comment.push(" ("+abilityName+" suppressed by Gastro Acid)");
return false;
}

if(!((_this$pokemon3=this.pokemon)!=null&&_this$pokemon3.effectiveAbility(this.serverPokemon)))return false;
return true;
};_proto.
tryClimateWeather=function tryClimateWeather(weatherName){
if(!this.climateWeatherName)return false;
if(!weatherName)weatherName=this.climateWeatherName;else
if(weatherName!==this.climateWeatherName)return false;for(var _i2=0,_this$battle$sides2=
this.battle.sides;_i2<_this$battle$sides2.length;_i2++){var side=_this$battle$sides2[_i2];for(var _i4=0,_side$active2=
side.active;_i4<_side$active2.length;_i4++){var active=_side$active2[_i4];
if(active&&['Air Lock','Cloud Nine','Nullify'].includes(active.ability)){
this.comment.push(" ("+weatherName+" suppressed by "+active.ability+")");
return false;
}
}
}
return true;
};_proto.
tryIrritantWeather=function tryIrritantWeather(weatherName){
if(!this.irritantWeatherName)return false;
if(!weatherName)weatherName=this.irritantWeatherName;else
if(weatherName!==this.irritantWeatherName)return false;for(var _i6=0,_this$battle$sides4=
this.battle.sides;_i6<_this$battle$sides4.length;_i6++){var side=_this$battle$sides4[_i6];for(var _i8=0,_side$active4=
side.active;_i8<_side$active4.length;_i8++){var active=_side$active4[_i8];
if(active&&['Nullify'].includes(active.ability)){
this.comment.push(" ("+weatherName+" suppressed by "+active.ability+")");
return false;
}
}
}
return true;
};_proto.
tryEnergyWeather=function tryEnergyWeather(weatherName){
if(!this.energyWeatherName)return false;
if(!weatherName)weatherName=this.energyWeatherName;else
if(weatherName!==this.energyWeatherName)return false;for(var _i10=0,_this$battle$sides6=
this.battle.sides;_i10<_this$battle$sides6.length;_i10++){var side=_this$battle$sides6[_i10];for(var _i12=0,_side$active6=
side.active;_i12<_side$active6.length;_i12++){var active=_side$active6[_i12];
if(active&&['Nullify'].includes(active.ability)){
this.comment.push(" ("+weatherName+" suppressed by "+active.ability+")");
return false;
}
}
}
return true;
};_proto.
tryClearingWeather=function tryClearingWeather(weatherName){
if(!this.clearingWeatherName)return false;
if(!weatherName)weatherName=this.clearingWeatherName;else
if(weatherName!==this.clearingWeatherName)return false;for(var _i14=0,_this$battle$sides8=
this.battle.sides;_i14<_this$battle$sides8.length;_i14++){var side=_this$battle$sides8[_i14];for(var _i16=0,_side$active8=
side.active;_i16<_side$active8.length;_i16++){var active=_side$active8[_i16];
if(active&&['Nullify'].includes(active.ability)){
this.comment.push(" ("+weatherName+" suppressed by "+active.ability+")");
return false;
}
}
}
return true;
};_proto.
itemModify=function itemModify(factor,itemName){
if(!itemName)itemName=this.itemName;
if(!itemName)return false;
if(!this.tryItem(itemName))return false;
return this.modify(factor,itemName);
};_proto.
abilityModify=function abilityModify(factor,abilityName){
if(!this.tryAbility(abilityName))return false;
return this.modify(factor,abilityName);
};_proto.
climateWeatherModify=function climateWeatherModify(factor,weatherName,name){
if(!weatherName)weatherName=this.climateWeatherName;
if(!weatherName)return false;
if(!this.tryClimateWeather(weatherName))return false;
return this.modify(factor,name||weatherName);
};_proto.
irritantWeatherModify=function irritantWeatherModify(factor,weatherName,name){
if(!weatherName)weatherName=this.irritantWeatherName;
if(!weatherName)return false;
if(!this.tryIrritantWeather(weatherName))return false;
return this.modify(factor,name||weatherName);
};_proto.
energyWeatherModify=function energyWeatherModify(factor,weatherName,name){
if(!weatherName)weatherName=this.energyWeatherName;
if(!weatherName)return false;
if(!this.tryEnergyWeather(weatherName))return false;
return this.modify(factor,name||weatherName);
};_proto.
clearingWeatherModify=function clearingWeatherModify(factor,weatherName,name){
if(!weatherName)weatherName=this.clearingWeatherName;
if(!weatherName)return false;
if(!this.tryClearingWeather(weatherName))return false;
return this.modify(factor,name||weatherName);
};_proto.
modify=function modify(factor,name){
if(factor===0){
if(name)this.comment.push(" ("+name+")");
this.value=0;
this.maxValue=0;
return true;
}
if(name)this.comment.push(" ("+this.round(factor)+"&times; from "+name+")");
this.value*=factor;
if(!(name==='Technician'&&this.maxValue>60))this.maxValue*=factor;
return true;
};_proto.
set=function set(value,reason){
if(reason)this.comment.push(" ("+reason+")");
this.value=value;
this.maxValue=0;
return true;
};_proto.
setRange=function setRange(value,maxValue,reason){
if(reason)this.comment.push(" ("+reason+")");
this.value=value;
this.maxValue=maxValue;
return true;
};_proto.
round=function round(value){
return value?Number(value.toFixed(2)):0;
};_proto.
toString=function toString(){
var valueString;
if(this.isAccuracy){
valueString=this.value?this.round(this.value)+"%":"can't miss";
}else{
valueString=this.value?""+this.round(this.value):"";
}
if(this.maxValue){
valueString+=" to "+this.round(this.maxValue)+(this.isAccuracy?'%':'');
}
return valueString+this.comment.join('');
};return ModifiableValue;}();var


BattleTooltips=function(){


function BattleTooltips(battle){var _this=this;this.battle=void 0;this.














































































clickTooltipEvent=function(e){
if(BattleTooltips.isLocked){
e.preventDefault();
e.stopImmediatePropagation();
}
};this.





holdLockTooltipEvent=function(e){
if(BattleTooltips.isLocked)BattleTooltips.hideTooltip();
var target=e.currentTarget;
_this.showTooltip(target);
var factor=e.type==='mousedown'&&target.tagName==='BUTTON'?2:1;

BattleTooltips.longTapTimeout=setTimeout(function(){
BattleTooltips.longTapTimeout=0;
_this.lockTooltip();
},BattleTooltips.LONG_TAP_DELAY*factor);
};this.

showTooltipEvent=function(e){
if(BattleTooltips.isLocked)return;
_this.showTooltip(e.currentTarget);
};this.battle=battle;}BattleTooltips.hideTooltip=function hideTooltip(){if(!BattleTooltips.elem)return;BattleTooltips.cancelLongTap();BattleTooltips.elem.parentNode.removeChild(BattleTooltips.elem);BattleTooltips.elem=null;BattleTooltips.parentElem=null;BattleTooltips.isLocked=false;$('#tooltipwrapper').removeClass('tooltip-locked');};BattleTooltips.cancelLongTap=function cancelLongTap(){if(BattleTooltips.longTapTimeout){clearTimeout(BattleTooltips.longTapTimeout);BattleTooltips.longTapTimeout=0;}};var _proto2=BattleTooltips.prototype;_proto2.lockTooltip=function lockTooltip(){if(BattleTooltips.elem&&!BattleTooltips.isLocked){BattleTooltips.isLocked=true;if(BattleTooltips.isPressed){$(BattleTooltips.parentElem).removeClass('pressed');BattleTooltips.isPressed=false;}$('#tooltipwrapper').addClass('tooltip-locked');}};_proto2.handleTouchEnd=function handleTouchEnd(e){BattleTooltips.cancelLongTap();if(!BattleTooltips.isLocked)BattleTooltips.hideTooltip();};_proto2.listen=function listen(elem){var _this2=this;var $elem=$(elem);$elem.on('mouseover','.has-tooltip',this.showTooltipEvent);$elem.on('click','.has-tooltip',this.clickTooltipEvent);$elem.on('focus','.has-tooltip',this.showTooltipEvent);$elem.on('mouseout','.has-tooltip',BattleTooltips.unshowTooltip);$elem.on('mousedown','.has-tooltip',this.holdLockTooltipEvent);$elem.on('blur','.has-tooltip',BattleTooltips.unshowTooltip);$elem.on('mouseup','.has-tooltip',BattleTooltips.unshowTooltip);$elem.on('touchstart','.has-tooltip',function(e){e.preventDefault();_this2.holdLockTooltipEvent(e);if(!BattleTooltips.parentElem){BattleTooltips.parentElem=e.currentTarget;}$(BattleTooltips.parentElem).addClass('pressed');BattleTooltips.isPressed=true;});$elem.on('touchend','.has-tooltip',function(e){e.preventDefault();if(e.currentTarget===BattleTooltips.parentElem&&BattleTooltips.isPressed){BattleTooltips.parentElem.click();}BattleTooltips.unshowTooltip();});$elem.on('touchleave','.has-tooltip',BattleTooltips.unshowTooltip);$elem.on('touchcancel','.has-tooltip',BattleTooltips.unshowTooltip);};BattleTooltips.




unshowTooltip=function unshowTooltip(){
if(BattleTooltips.isLocked)return;
if(BattleTooltips.isPressed){
$(BattleTooltips.parentElem).removeClass('pressed');
BattleTooltips.isPressed=false;
}
BattleTooltips.hideTooltip();
};_proto2.

showTooltip=function showTooltip(elem){
var args=(elem.dataset.tooltip||'').split('|');
var type=args[0];





var ownHeight=!!elem.dataset.ownheight;

var buf;
switch(type){
case'move':
case'zmove':
case'maxmove':{
var move=this.battle.dex.moves.get(args[1]);
var teamIndex=parseInt(args[2],10);
var pokemon=this.battle.nearSide.active[
teamIndex+this.battle.pokemonControlled*Math.floor(this.battle.mySide.n/2)];

var gmaxMove=args[3]?this.battle.dex.moves.get(args[3]):undefined;
if(!pokemon)return false;
var serverPokemon=this.battle.myPokemon[teamIndex];
buf=this.showMoveTooltip(move,type,pokemon,serverPokemon,gmaxMove);
break;
}

case'pokemon':{


var sideIndex=parseInt(args[1],10);
var side=this.battle.sides[sideIndex];
var _pokemon=side.pokemon[parseInt(args[2],10)];
if(args[3]==='illusion'){
buf='';
var species=_pokemon.getBaseSpecies().baseSpecies;
var index=1;for(var _i18=0,_side$pokemon2=
side.pokemon;_i18<_side$pokemon2.length;_i18++){var otherPokemon=_side$pokemon2[_i18];
if(otherPokemon.getBaseSpecies().baseSpecies===species){
buf+=this.showPokemonTooltip(otherPokemon,null,false,index);
index++;
}
}
}else{
buf=this.showPokemonTooltip(_pokemon);
}
break;
}
case'activepokemon':{


var _sideIndex=parseInt(args[1],10);
var _side=this.battle.sides[+this.battle.viewpointSwitched^_sideIndex];
var activeIndex=parseInt(args[2],10);
var pokemonIndex=activeIndex;
if(activeIndex>=1&&this.battle.sides.length>2){
pokemonIndex-=1;
_side=this.battle.sides[_side.n+2];
}
var _pokemon2=_side.active[activeIndex];
var _serverPokemon=null;
if(_side===this.battle.mySide&&this.battle.myPokemon){
_serverPokemon=this.battle.myPokemon[pokemonIndex];
}
if(_side===this.battle.mySide.ally&&this.battle.myAllyPokemon){
_serverPokemon=this.battle.myAllyPokemon[pokemonIndex];
}
if(!_pokemon2)return false;
buf=this.showPokemonTooltip(_pokemon2,_serverPokemon,true);
break;
}
case'switchpokemon':{



var _activeIndex=parseInt(args[1],10);
var _pokemon3=null;




var _serverPokemon2=this.battle.myPokemon[_activeIndex];
buf=this.showPokemonTooltip(_pokemon3,_serverPokemon2);
break;
}
case'allypokemon':{



var _activeIndex2=parseInt(args[1],10);
var _pokemon4=null;



var _serverPokemon3=this.battle.myAllyPokemon?this.battle.myAllyPokemon[_activeIndex2]:null;
buf=this.showPokemonTooltip(_pokemon4,_serverPokemon3);
break;
}
case'field':{
buf=this.showFieldTooltip();
break;
}
default:

Promise.resolve(new Error("unrecognized type"));
buf="<p class=\"message-error\" style=\"white-space: pre-wrap\">"+new Error("unrecognized type").stack+"</p>";
}

this.placeTooltip(buf,elem,ownHeight,type);
return true;
};_proto2.

placeTooltip=function placeTooltip(innerHTML,hoveredElem,notRelativeToParent,type){
var $elem;
if(hoveredElem){
$elem=$(hoveredElem);
}else{
$elem=this.battle.scene.$turn;
notRelativeToParent=true;
}

var hoveredX1=$elem.offset().left;

if(!notRelativeToParent){
$elem=$elem.parent();
}

var hoveredY1=$elem.offset().top;
var hoveredY2=hoveredY1+$elem.outerHeight();




var x=Math.max(hoveredX1-2,0);
var y=Math.max(hoveredY1-5,0);

var $wrapper=$('#tooltipwrapper');
if(!$wrapper.length){
$wrapper=$("<div id=\"tooltipwrapper\" role=\"tooltip\"></div>");
$(document.body).append($wrapper);
$wrapper.on('click',function(e){
try{
var selection=window.getSelection();
if(selection.type==='Range')return;
}catch(err){}
BattleTooltips.hideTooltip();
});
}else{
$wrapper.removeClass('tooltip-locked');
}
$wrapper.css({
left:x,
top:y
});
innerHTML="<div class=\"tooltipinner\"><div class=\"tooltip tooltip-"+type+"\">"+innerHTML+"</div></div>";
$wrapper.html(innerHTML).appendTo(document.body);
BattleTooltips.elem=$wrapper.find('.tooltip')[0];
BattleTooltips.isLocked=false;

var height=$(BattleTooltips.elem).outerHeight();
if(y-height<1){


y=hoveredY2+height+5;
if(y>document.documentElement.clientHeight){


y=height+1;
}
$wrapper.css('top',y);
}else if(y<75){

y=hoveredY2+height+5;
if(y<document.documentElement.clientHeight){

$wrapper.css('top',y);
}
}

var width=$(BattleTooltips.elem).outerWidth();
if(x>document.documentElement.clientWidth-width-2){
x=document.documentElement.clientWidth-width-2;
$wrapper.css('left',x);
}

BattleTooltips.parentElem=hoveredElem||null;
return true;
};_proto2.

hideTooltip=function hideTooltip(){
BattleTooltips.hideTooltip();
};_proto2.










getStatusZMoveEffect=function getStatusZMoveEffect(move){
if(move.zMove.effect in BattleTooltips.zMoveEffects){
return BattleTooltips.zMoveEffects[move.zMove.effect];
}
var boostText='';
if(move.zMove.boost){
var boosts=Object.keys(move.zMove.boost);
boostText=boosts.map(function(stat){return(
BattleTextParser.stat(stat)+' +'+move.zMove.boost[stat]);}
).join(', ');
}
return boostText;
};_proto2.













































getMaxMoveFromType=function getMaxMoveFromType(type,gmaxMove){
if(gmaxMove){
gmaxMove=Dex.moves.get(gmaxMove);
if(type===gmaxMove.type)return gmaxMove;
}
return Dex.moves.get(BattleTooltips.maxMoveTable[type]);
};_proto2.

showMoveTooltip=function showMoveTooltip(move,isZOrMax,pokemon,serverPokemon,gmaxMove){
var text='';

var zEffect='';
var foeActive=pokemon.side.foe.active;
if(this.battle.gameType==='freeforall'){
foeActive=[].concat(foeActive,pokemon.side.active).filter(function(active){return active!==pokemon;});
}

if(pokemon.ability==='(suppressed)')serverPokemon.ability='(suppressed)';
var ability=toID(serverPokemon.ability||pokemon.ability||serverPokemon.baseAbility);
var item=this.battle.dex.items.get(serverPokemon.item);

var value=new ModifiableValue(this.battle,pokemon,serverPokemon);
var _this$getMoveType=this.getMoveType(move,value,gmaxMove||isZOrMax==='maxmove'),moveType=_this$getMoveType[0],category=_this$getMoveType[1];
var categoryDiff=move.category!==category;

if(isZOrMax==='zmove'){
if(item.zMoveFrom===move.name){
move=this.battle.dex.moves.get(item.zMove);
}else if(move.category==='Status'){
move=new Move(move.id,"",Object.assign({},
move,{
name:'Z-'+move.name})
);
zEffect=this.getStatusZMoveEffect(move);
}else{
var moveName=BattleTooltips.zMoveTable[item.zMoveType];
var zMove=this.battle.dex.moves.get(moveName);
var movePower=move.zMove.basePower;

if(!movePower&&move.id.startsWith('hiddenpower')){
movePower=this.battle.dex.moves.get('hiddenpower').zMove.basePower;
}
if(move.id==='weatherball'){
switch(this.battle.climateWeather){
case'sunnyday':
case'desolateland':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Fire']);
break;
case'raindance':
case'primordialsea':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Water']);
break;
case'hail':
case'snow':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Ice']);
break;
case'bloodmoon':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Dark']);
break;
case'foghorn':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Normal']);
break;
}
switch(this.battle.irritantWeather){
case'sandstorm':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Rock']);
break;
case'duststorm':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Ground']);
break;
case'pollinate':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Grass']);
break;
case'swarmsignal':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Bug']);
break;
case'smogspread':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Poison']);
break;
case'sprinkle':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Fairy']);
break;
}
switch(this.battle.energyWeather){
case'auraprojection':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Fighting']);
break;
case'haunt':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Ghost']);
break;
case'daydream':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Psychic']);
break;
case'dragonforce':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Dragon']);
break;
case'supercell':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Electric']);
break;
case'magnetize':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Steel']);
break;
}
switch(this.battle.clearingWeather){
case'strongwinds':
zMove=this.battle.dex.moves.get(BattleTooltips.zMoveTable['Flying']);
break;
}
}
move=new Move(zMove.id,zMove.name,Object.assign({},
zMove,{
category:move.category,
basePower:movePower})
);
categoryDiff=false;
}
}else if(isZOrMax==='maxmove'){
if(move.category==='Status'){
move=this.battle.dex.moves.get('Max Guard');
}else{
var maxMove=this.getMaxMoveFromType(moveType,gmaxMove);
var basePower=['gmaxdrumsolo','gmaxfireball','gmaxhydrosnipe'].includes(maxMove.id)?
maxMove.basePower:move.maxMove.basePower;
move=new Move(maxMove.id,maxMove.name,Object.assign({},
maxMove,{
category:move.category,
basePower:basePower})
);
categoryDiff=false;
}
}

if(categoryDiff){
move=new Move(move.id,move.name,Object.assign({},
move,{
category:category})
);
}

text+='<h2>'+move.name+'<br />';

text+=Dex.getTypeIcon(moveType);
text+=" "+Dex.getCategoryIcon(category)+"</h2>";


var showingMultipleBasePowers=false;
if(category!=='Status'&&foeActive.length>1){



var prevBasePower=null;
var _basePower='';
var difference=false;
var basePowers=[];for(var _i20=0,_foeActive2=
foeActive;_i20<_foeActive2.length;_i20++){var active=_foeActive2[_i20];
if(!active)continue;
value=this.getMoveBasePower(move,moveType,value,active);
_basePower=''+value;
if(prevBasePower===null)prevBasePower=_basePower;
if(prevBasePower!==_basePower)difference=true;
basePowers.push('Base power vs '+active.name+': '+_basePower);
}
if(difference){
text+='<p>'+basePowers.join('<br />')+'</p>';
showingMultipleBasePowers=true;
}

}
if(!showingMultipleBasePowers&&category!=='Status'){
var activeTarget=foeActive[0]||foeActive[1]||foeActive[2];
value=this.getMoveBasePower(move,moveType,value,activeTarget);
text+='<p>Base power: '+value+'</p>';
}

var accuracy=this.getMoveAccuracy(move,value);


if(move.id==='naturepower'){
var calls;
if(this.battle.gen>5){
if(this.battle.hasPseudoWeather('Electric Terrain')){
calls='Thunderbolt';
}else if(this.battle.hasPseudoWeather('Grassy Terrain')){
calls='Energy Ball';
}else if(this.battle.hasPseudoWeather('Misty Terrain')){
calls='Moonblast';
}else if(this.battle.hasPseudoWeather('Psychic Terrain')){
calls='Psychic';
}else{
calls='Tri Attack';
}
}else if(this.battle.gen>3){

calls='Earthquake';
}else{

calls='Swift';
}
var calledMove=this.battle.dex.moves.get(calls);
text+='Calls '+Dex.getTypeIcon(this.getMoveType(calledMove,value)[0])+' '+calledMove.name;
}

text+='<p>Accuracy: '+accuracy+'</p>';
if(zEffect)text+='<p>Z-Effect: '+zEffect+'</p>';

if(this.battle.hardcoreMode){
text+='<p class="tooltip-section">'+move.shortDesc+'</p>';
}else{
text+='<p class="tooltip-section">';
if(move.priority>1){
text+='Nearly always moves first <em>(priority +'+move.priority+')</em>.</p><p>';
}else if(move.priority<=-1){
text+='Nearly always moves last <em>(priority &minus;'+-move.priority+')</em>.</p><p>';
}else if(move.priority===1){
text+='Usually moves first <em>(priority +'+move.priority+')</em>.</p><p>';
}else{
if(move.id==='grassyglide'&&this.battle.hasPseudoWeather('Grassy Terrain')){
text+='Usually moves first <em>(priority +1)</em>.</p><p>';
}
}

text+=''+(move.desc||move.shortDesc||'')+'</p>';

if(this.battle.gameType==='doubles'||this.battle.gameType==='multi'){
if(move.target==='allAdjacent'){
text+='<p>&#x25ce; Hits both foes and ally.</p>';
}else if(move.target==='allAdjacentFoes'){
text+='<p>&#x25ce; Hits both foes.</p>';
}
}else if(this.battle.gameType==='triples'){
if(move.target==='allAdjacent'){
text+='<p>&#x25ce; Hits adjacent foes and allies.</p>';
}else if(move.target==='allAdjacentFoes'){
text+='<p>&#x25ce; Hits adjacent foes.</p>';
}else if(move.target==='any'){
text+='<p>&#x25ce; Can target distant Pok&eacute;mon in Triples.</p>';
}
}else if(this.battle.gameType==='freeforall'){
if(move.target==='allAdjacent'||move.target==='allAdjacentFoes'){
text+='<p>&#x25ce; Hits all foes.</p>';
}else if(move.target==='adjacentAlly'){
text+='<p>&#x25ce; Can target any foe in Free-For-All.</p>';
}
}

if(move.flags.defrost){
text+="<p class=\"movetag\">The user thaws out if it is frozen.</p>";
}
if(!move.flags.protect&&!['self','allySide'].includes(move.target)){
text+="<p class=\"movetag\">Not blocked by Protect <small>(and Detect, King's Shield, Spiky Shield)</small></p>";
}
if(move.flags.bypasssub){
text+="<p class=\"movetag\">Bypasses Substitute <small>(but does not break it)</small></p>";
}
if(!move.flags.reflectable&&!['self','allySide'].includes(move.target)&&move.category==='Status'){
text+="<p class=\"movetag\">&#x2713; Not bounceable <small>(can't be bounced by Magic Coat/Bounce)</small></p>";
}

if(move.flags.contact){
text+="<p class=\"movetag\">&#x2713; Contact <small>(triggers Iron Barbs, Spiky Shield, etc)</small></p>";
}
if(move.flags.sound){
text+="<p class=\"movetag\">&#x2713; Sound <small>(doesn't affect Soundproof pokemon)</small></p>";
}
if(move.flags.powder&&this.battle.gen>5){
text+="<p class=\"movetag\">&#x2713; Powder <small>(doesn't affect Grass, Overcoat, Safety Goggles)</small></p>";
}
if(move.flags.punch&&ability==='ironfist'){
text+="<p class=\"movetag\">&#x2713; Fist <small>(boosted by Iron Fist)</small></p>";
}
if(move.flags.pulse&&ability==='megalauncher'){
text+="<p class=\"movetag\">&#x2713; Pulse <small>(boosted by Mega Launcher)</small></p>";
}
if(move.flags.bite&&ability==='strongjaw'){
text+="<p class=\"movetag\">&#x2713; Bite <small>(boosted by Strong Jaw)</small></p>";
}
if((move.recoil||move.hasCrashDamage)&&ability==='reckless'){
text+="<p class=\"movetag\">&#x2713; Recoil <small>(boosted by Reckless)</small></p>";
}
if(move.flags.bullet){
text+="<p class=\"movetag\">&#x2713; Bullet-like <small>(doesn't affect Bulletproof pokemon)</small></p>";
}
if(move.flags.slicing){
text+="<p class=\"movetag\">&#x2713; Slicing <small>(boosted by Sharpness)</small></p>";
}
if(move.flags.wind){
text+="<p class=\"movetag\">&#x2713; Wind <small>(activates Wind Power and Wind Rider)</small></p>";
}
}
return text;
};_proto2.















showPokemonTooltip=function showPokemonTooltip(
clientPokemon,serverPokemon,isActive,illusionIndex)
{var _this3=this;
var pokemon=clientPokemon||serverPokemon;
var text='';
var genderBuf='';
var gender=pokemon.gender;
if(gender==='M'||gender==='F'){
genderBuf=" <img src=\""+Dex.fxPrefix+"gender-"+gender.toLowerCase()+".png\" alt=\""+gender+"\" width=\"7\" height=\"10\" class=\"pixelated\" /> ";
}

var name=BattleLog.escapeHTML(pokemon.name);
if(pokemon.speciesForme!==pokemon.name){
name+=' <small>('+BattleLog.escapeHTML(pokemon.speciesForme)+')</small>';
}

var levelBuf=pokemon.level!==100?" <small>L"+pokemon.level+"</small>":"";
if(!illusionIndex||illusionIndex===1){
text+="<h2>"+name+genderBuf+(illusionIndex?'':levelBuf)+"<br />";

if(clientPokemon!=null&&clientPokemon.volatiles.formechange){
if(clientPokemon.volatiles.transform){
text+="<small>(Transformed into "+clientPokemon.volatiles.formechange[1]+")</small><br />";
}else{
text+="<small>(Changed forme: "+clientPokemon.volatiles.formechange[1]+")</small><br />";
}
}

var types=serverPokemon!=null&&serverPokemon.terastallized?[serverPokemon.teraType]:this.getPokemonTypes(pokemon);
var knownPokemon=serverPokemon||clientPokemon;

if(pokemon.terastallized){
text+="<small>(Terastallized)</small><br />";
}else if(clientPokemon!=null&&clientPokemon.volatiles.typechange||clientPokemon!=null&&clientPokemon.volatiles.typeadd){
text+="<small>(Type changed)</small><br />";
}
text+="<span class=\"textaligned-typeicons\">"+types.map(function(type){return Dex.getTypeIcon(type);}).join(' ')+"</span>";
if(pokemon.terastallized){
text+="&nbsp; &nbsp; <small>(base: <span class=\"textaligned-typeicons\">"+this.getPokemonTypes(pokemon,true).map(function(type){return Dex.getTypeIcon(type);}).join(' ')+"</span>)</small>";
}else if(knownPokemon.teraType&&!this.battle.rules['Terastal Clause']){
text+="&nbsp; &nbsp; <small>(Tera Type: <span class=\"textaligned-typeicons\">"+Dex.getTypeIcon(knownPokemon.teraType)+"</span>)</small>";
}
text+="</h2>";
}

if(illusionIndex){
text+="<p class=\"tooltip-section\"><strong>Possible Illusion #"+illusionIndex+"</strong>"+levelBuf+"</p>";
}

if(pokemon.fainted){
text+='<p><small>HP:</small> (fainted)</p>';
}else if(this.battle.hardcoreMode){
if(serverPokemon){
text+='<p><small>HP:</small> '+serverPokemon.hp+'/'+serverPokemon.maxhp+(pokemon.status?' <span class="status '+pokemon.status+'">'+pokemon.status.toUpperCase()+'</span>':'')+'</p>';
}
}else{
var exacthp='';
if(serverPokemon){
exacthp=' ('+serverPokemon.hp+'/'+serverPokemon.maxhp+')';
}else if(pokemon.maxhp===48){
exacthp=' <small>('+pokemon.hp+'/'+pokemon.maxhp+' pixels)</small>';
}
text+='<p><small>HP:</small> '+Pokemon.getHPText(pokemon)+exacthp+(pokemon.status?' <span class="status '+pokemon.status+'">'+pokemon.status.toUpperCase()+'</span>':'');
if(clientPokemon){
if(pokemon.status==='tox'){
if(pokemon.ability==='Poison Heal'||pokemon.ability==='Magic Guard'){
text+=' <small>Would take if ability removed: '+Math.floor(100/16*Math.min(clientPokemon.statusData.toxicTurns+1,15))+'%</small>';
}else{
text+=' Next damage: '+Math.floor(100/(clientPokemon.volatiles['dynamax']?32:16)*Math.min(clientPokemon.statusData.toxicTurns+1,15))+'%';
}
}else if(pokemon.status==='slp'){
text+=' Turns asleep: '+clientPokemon.statusData.sleepTurns;
}
}
text+='</p>';
}

var supportsAbilities=this.battle.gen>2&&!this.battle.tier.includes("Let's Go");

var abilityText='';
if(supportsAbilities){
abilityText=this.getPokemonAbilityText(
clientPokemon,serverPokemon,isActive,!!illusionIndex&&illusionIndex>1
);
}

var itemText='';
if(serverPokemon){
var item='';
var itemEffect='';
if(clientPokemon!=null&&clientPokemon.prevItem){
item='None';
var prevItem=Dex.items.get(clientPokemon.prevItem).name;
itemEffect+=clientPokemon.prevItemEffect?prevItem+' was '+clientPokemon.prevItemEffect:'was '+prevItem;
}
if(serverPokemon.item)item=Dex.items.get(serverPokemon.item).name;
if(itemEffect)itemEffect=' ('+itemEffect+')';
if(item)itemText='<small>Item:</small> '+item+itemEffect;
}else if(clientPokemon){
var _item='';
var _itemEffect=clientPokemon.itemEffect||'';
if(clientPokemon.prevItem){
_item='None';
if(_itemEffect)_itemEffect+='; ';
var _prevItem=Dex.items.get(clientPokemon.prevItem).name;
_itemEffect+=clientPokemon.prevItemEffect?_prevItem+' was '+clientPokemon.prevItemEffect:'was '+_prevItem;
}
if(pokemon.item)_item=Dex.items.get(pokemon.item).name;
if(_itemEffect)_itemEffect=' ('+_itemEffect+')';
if(_item)itemText='<small>Item:</small> '+_item+_itemEffect;
}

if(abilityText||itemText){
text+='<p>';
text+=abilityText;
if(abilityText&&itemText){

text+=!isActive&&serverPokemon?' / ':'</p><p>';
}
text+=itemText;
text+='</p>';
}

text+=this.renderStats(clientPokemon,serverPokemon,!isActive);

if(serverPokemon&&!isActive){

text+="<p class=\"tooltip-section\">";
var battlePokemon=clientPokemon||this.battle.findCorrespondingPokemon(pokemon);for(var _i22=0,_serverPokemon$moves2=
serverPokemon.moves;_i22<_serverPokemon$moves2.length;_i22++){var _moveid=_serverPokemon$moves2[_i22];
var move=Dex.moves.get(_moveid);
var moveName="&#8226; "+move.name;
if(battlePokemon!=null&&battlePokemon.moveTrack){for(var _i24=0,_battlePokemon$moveTr2=
battlePokemon.moveTrack;_i24<_battlePokemon$moveTr2.length;_i24++){var row=_battlePokemon$moveTr2[_i24];
if(moveName===row[0]){
moveName=this.getPPUseText(row,true);
break;
}
}
}
text+=moveName+"<br />";
}
text+='</p>';
}else if(!this.battle.hardcoreMode&&clientPokemon!=null&&clientPokemon.moveTrack.length){

text+="<p class=\"tooltip-section\">";for(var _i26=0,_clientPokemon$moveTr2=
clientPokemon.moveTrack;_i26<_clientPokemon$moveTr2.length;_i26++){var _row=_clientPokemon$moveTr2[_i26];
text+=this.getPPUseText(_row)+"<br />";
}
if(clientPokemon.moveTrack.filter(function(_ref){var moveName=_ref[0];
if(moveName.charAt(0)==='*')return false;
var move=_this3.battle.dex.moves.get(moveName);
return!move.isZ&&!move.isMax&&move.name!=='Mimic';
}).length>4){
text+="(More than 4 moves is usually a sign of Illusion Zoroark/Zorua.) ";
}
if(this.battle.gen===3){
text+="(Pressure is not visible in Gen 3, so in certain situations, more PP may have been lost than shown here.) ";
}
if(this.pokemonHasClones(clientPokemon)){
text+="(Your opponent has two indistinguishable Pok\xE9mon, making it impossible for you to tell which one has which moves/ability/item.) ";
}
text+="</p>";
}
return text;
};_proto2.

showFieldTooltip=function showFieldTooltip(){
var scene=this.battle.scene;
var buf="<table style=\"border: 0; border-collapse: collapse; vertical-align: top; padding: 0; width: 100%\"><tr>";

var atLeastOne=false;for(var _i28=0,_this$battle$sides10=
this.battle.sides;_i28<_this$battle$sides10.length;_i28++){var side=_this$battle$sides10[_i28];
var sideConditions=scene.sideConditionsLeft(side,true);
if(sideConditions)atLeastOne=true;
buf+="<td><p class=\"tooltip-section\"><strong>"+BattleLog.escapeHTML(side.name)+"</strong>"+(sideConditions||"<br />(no conditions)")+"</p></td>";
}
buf+="</tr><table>";
if(!atLeastOne)buf="";

var climateweatherbuf=scene.climateWeatherLeft()||"(No active Climate Weathergy)";
var irritantweatherbuf=scene.irritantWeatherLeft()||"(No active Irritant Weathergy)";
var energyweatherbuf=scene.energyWeatherLeft()||"(No active Energy Weathergy)";
var clearingweatherbuf=scene.clearingWeatherLeft()||"(No active Clearing Weathergy)";
while(climateweatherbuf.startsWith('<br />')){
climateweatherbuf=climateweatherbuf.slice(6);
}
while(irritantweatherbuf.startsWith('<br />')){
irritantweatherbuf=irritantweatherbuf.slice(6);
}
while(energyweatherbuf.startsWith('<br />')){
energyweatherbuf=energyweatherbuf.slice(6);
}
while(clearingweatherbuf.startsWith('<br />')){
clearingweatherbuf=clearingweatherbuf.slice(6);
}
buf="<p>"+climateweatherbuf+"</p>"+("<p>"+irritantweatherbuf+"</p>")+("<p>"+energyweatherbuf+"</p>")+("<p>"+clearingweatherbuf+"</p>")+buf;
return"<p>"+buf+"</p>";
};_proto2.






pokemonHasClones=function pokemonHasClones(pokemon){
var side=pokemon.side;
if(side.battle.speciesClause)return false;for(var _i30=0,_side$pokemon4=
side.pokemon;_i30<_side$pokemon4.length;_i30++){var ally=_side$pokemon4[_i30];
if(pokemon!==ally&&pokemon.searchid===ally.searchid){
return true;
}
}
return false;
};_proto2.

calculateModifiedStats=function calculateModifiedStats(clientPokemon,serverPokemon,statStagesOnly){var _clientPokemon$effect,_clientPokemon$volati,_this$battle$dex$spec,_this4=this;
var stats=Object.assign({},serverPokemon.stats);
var pokemon=clientPokemon||serverPokemon;
var isPowerTrick=clientPokemon==null?void 0:clientPokemon.volatiles['powertrick'];for(var _i32=0,_Dex$statNamesExceptH2=
Dex.statNamesExceptHP;_i32<_Dex$statNamesExceptH2.length;_i32++){var statName=_Dex$statNamesExceptH2[_i32];
var sourceStatName=statName;
if(isPowerTrick){
if(statName==='atk')sourceStatName='def';
if(statName==='def')sourceStatName='atk';
}
stats[statName]=serverPokemon.stats[sourceStatName];
if(!clientPokemon)continue;

var clientStatName=clientPokemon.boosts.spc&&(statName==='spa'||statName==='spd')?'spc':statName;
var boostLevel=clientPokemon.boosts[clientStatName];
if(boostLevel){
var boostTable=[1,1.5,2,2.5,3,3.5,4];
if(boostLevel>0){
stats[statName]*=boostTable[boostLevel];
}else{
if(this.battle.gen<=2)boostTable=[1,100/66,2,2.5,100/33,100/28,4];
stats[statName]/=boostTable[-boostLevel];
}
stats[statName]=Math.floor(stats[statName]);
}
}
if(statStagesOnly)return stats;

var ability=toID((_clientPokemon$effect=
clientPokemon==null?void 0:clientPokemon.effectiveAbility(serverPokemon))!=null?_clientPokemon$effect:serverPokemon.ability||serverPokemon.baseAbility
);


if(pokemon.status){
if(this.battle.gen>2&&ability==='guts'){
stats.atk=Math.floor(stats.atk*1.5);
}else if(this.battle.gen<2&&pokemon.status==='brn'){
stats.atk=Math.floor(stats.atk*0.5);
}

if(pokemon.status==='frb'){
stats.spa=Math.floor(stats.spa*0.5);
}

if(this.battle.gen>2&&ability==='quickfeet'){
stats.spe=Math.floor(stats.spe*1.5);
}
}


if(this.battle.gen<=1){for(var _i34=0,_Dex$statNamesExceptH4=
Dex.statNamesExceptHP;_i34<_Dex$statNamesExceptH4.length;_i34++){var _statName=_Dex$statNamesExceptH4[_i34];
if(stats[_statName]>999)stats[_statName]=999;
}
return stats;
}

var item=toID(serverPokemon.item);
var speedHalvingEVItems=['machobrace','poweranklet','powerband','powerbelt','powerbracer','powerlens','powerweight'];
if(
ability==='klutz'&&!speedHalvingEVItems.includes(item)||
this.battle.hasPseudoWeather('Magic Room')||
clientPokemon!=null&&clientPokemon.volatiles['embargo'])
{
item='';
}

var species=Dex.species.get(serverPokemon.speciesForme).baseSpecies;
var isTransform=clientPokemon==null?void 0:clientPokemon.volatiles.transform;
var speciesName=isTransform&&clientPokemon!=null&&(_clientPokemon$volati=clientPokemon.volatiles.formechange)!=null&&_clientPokemon$volati[1]&&this.battle.gen<=4?
this.battle.dex.species.get(clientPokemon.volatiles.formechange[1]).baseSpecies:species;

var speedModifiers=[];



if(item==='lightball'){
if(this.battle.gen!==4&&(speciesName==='Pikachu'||speciesName==='Pichu')){
if(this.battle.gen>4)stats.atk*=2;
stats.spa*=2;
}
if(speciesName==='Raichu'||speciesName==='Emolga'||speciesName==='Guruchi'){
stats.atk*=1.5;
stats.spa*=1.5;
}
}

if(item==='thickclub'){
if(speciesName==='Marowak'||speciesName==='Cubone'){
stats.atk*=2;
}
if(speciesName==='Bearvoyance'||speciesName==='Oracub'){
stats.spa*=1.5;
}
}

if(speciesName==='Ditto'&&!(clientPokemon&&'transform'in clientPokemon.volatiles)){
if(item==='quickpowder'){
speedModifiers.push(2);
}
if(item==='metalpowder'){
if(this.battle.gen===2){
stats.def=Math.floor(stats.def*1.5);
stats.spd=Math.floor(stats.spd*1.5);
}else{
stats.def*=2;
}
}
}



if(this.battle.gen<=2){
return stats;
}

var climateWeather=this.battle.climateWeather;
var irritantWeather=this.battle.irritantWeather;
var energyWeather=this.battle.energyWeather;
var clearingWeather=this.battle.clearingWeather;
if(this.battle.abilityActive(['Air Lock','Cloud Nine'])){
climateWeather='';
}

if(item==='choiceband'&&!(clientPokemon!=null&&clientPokemon.volatiles['dynamax'])){
stats.atk=Math.floor(stats.atk*1.5);
}
if(ability==='purepower'||ability==='hugepower'){
stats.atk*=2;
}
if(ability==='hustle'||ability==='gorillatactics'&&!(clientPokemon!=null&&clientPokemon.volatiles['dynamax'])){
stats.atk=Math.floor(stats.atk*1.5);
}
if(climateWeather){
if(item!=='utilityumbrella'){
if(climateWeather==='sunnyday'||climateWeather==='desolateland'){
if(this.pokemonHasType(pokemon,'Grass')){
stats.spd=Math.floor(stats.spd*1.25);
}
if(ability==='chlorophyll'){
speedModifiers.push(2);
}
if(ability==='solarpower'&&serverPokemon.stats.spa>=serverPokemon.stats.atk){
stats.spa=Math.floor(stats.spa*1.5);
}
if(ability==='solarpower'&&serverPokemon.stats.atk>serverPokemon.stats.spa){
stats.atk=Math.floor(stats.atk*1.5);
}
if(ability==='orichalcumpulse'){
stats.atk=Math.floor(stats.atk*1.3);
}
var allyActive=clientPokemon==null?void 0:clientPokemon.side.active;
if(allyActive){for(var _i36=0;_i36<
allyActive.length;_i36++){var ally=allyActive[_i36];
if(!ally||ally.fainted)continue;
var allyAbility=this.getAllyAbility(ally);
if(allyAbility==='Flower Gift'&&(ally.getSpecies().baseSpecies==='Cherrim'||this.battle.gen<=4)){
stats.atk=Math.floor(stats.atk*1.5);
stats.spd=Math.floor(stats.spd*1.5);
}
}
}
}
if(climateWeather==='raindance'||climateWeather==='primordialsea'){
if(this.pokemonHasType(pokemon,'Grass')){
stats.def=Math.floor(stats.def*1.25);
}
if(ability==='swiftswim'){
speedModifiers.push(2);
}
}
if(climateWeather==='hail'){
if(this.pokemonHasType(pokemon,'Ice')){
stats.def=Math.floor(stats.def*1.25);
stats.spd=Math.floor(stats.spd*1.25);
}
}
if(climateWeather==='snow'){
if(this.pokemonHasType(pokemon,'Ice')){
stats.def=Math.floor(stats.def*1.5);
}
}
if(climateWeather==='hail'||climateWeather==='snow'){
if(ability==='slushrush'){
speedModifiers.push(2);
}
if(ability==='glacialarmor'){
stats.def=Math.floor(stats.def*1.4);
stats.spd=Math.floor(stats.spd*1.4);
}
}
if(climateWeather==='bloodmoon'){
if(ability==='shadowstep'){
speedModifiers.push(2);
}
if(ability==='malice'&&serverPokemon.stats.spa>=serverPokemon.stats.atk){
stats.spa=Math.floor(stats.spa*1.5);
}
if(ability==='malice'&&serverPokemon.stats.atk>serverPokemon.stats.spa){
stats.atk=Math.floor(stats.atk*1.5);
}
}
if(climateWeather==='foghorn'){
if(ability==='warpmist'&&serverPokemon.stats.spa>=serverPokemon.stats.atk){
stats.spa=Math.floor(stats.spa*1.2);
}
if(ability==='warpmist'&&serverPokemon.stats.atk>serverPokemon.stats.spa){
stats.atk=Math.floor(stats.atk*1.2);
}
}
}
}
if(irritantWeather){
if(item!=='safetygoggles'){
if(irritantWeather==='sandstorm'){
if(this.battle.gen>=4&&this.pokemonHasType(pokemon,'Rock')){
stats.spd=Math.floor(stats.spd*1.5);
}
}
if(irritantWeather==='duststorm'){
if(this.pokemonHasType(pokemon,'Ground')){
stats.spe=Math.floor(stats.spe*1.5);
}
}
if(irritantWeather==='sandstorm'||irritantWeather==='duststorm'){
if(ability==='sandrush'){
speedModifiers.push(2);
}
}
if(irritantWeather==='pollinate'){
if(!(this.pokemonHasType(pokemon,'Grass')||this.pokemonHasType(pokemon,'Bug'))){
if(ability!=='bubblehelm'){
stats.atk=Math.floor(stats.atk*0.75);
stats.spa=Math.floor(stats.spa*0.75);
}
}
}
if(irritantWeather==='swarmsignal'){
if(this.pokemonHasType(pokemon,'Bug')||this.pokemonHasType(pokemon,'Poison')){
stats.spe=Math.floor(stats.spe*1.5);
}
}
if(irritantWeather==='sprinkle'){
if(this.pokemonHasType(pokemon,'Fairy')){
stats.spd=Math.floor(stats.spd*1.25);
}
}
}
}
if(energyWeather){
if(item!=='energynullifier'){
if(energyWeather==='haunt'){
if(ability==='shadowstep'){
speedModifiers.push(2);
}
}


if(energyWeather==='supercell'){
if(this.pokemonHasType(pokemon,'Electric')){
stats.spe=Math.floor(stats.spe*1.25);
}
if(ability==='energizer'){
speedModifiers.push(2);
}
}
if(energyWeather==='magnetize'){
if(this.pokemonHasType(pokemon,'Steel')){
stats.spd=Math.floor(stats.spd*1.25);
}
if(ability==='magnapult'){
speedModifiers.push(2);
}
}
}
}
if(clearingWeather){
if(clearingWeather==='strongwinds'){
if(this.pokemonHasType(pokemon,'Flying')){
stats.spe=Math.floor(stats.spe*1.25);
}
}
}
if(ability==='defeatist'&&serverPokemon.hp<=serverPokemon.maxhp/2){
stats.atk=Math.floor(stats.atk*0.5);
stats.spa=Math.floor(stats.spa*0.5);
}
if(clientPokemon){
if(clientPokemon.volatiles['slowstart']){
stats.atk=Math.floor(stats.atk*0.5);
speedModifiers.push(0.5);
}
if(ability==='unburden'&&clientPokemon.volatiles['itemremoved']&&!item){
speedModifiers.push(2);
}for(var _i38=0,_Dex$statNamesExceptH6=
Dex.statNamesExceptHP;_i38<_Dex$statNamesExceptH6.length;_i38++){var _statName2=_Dex$statNamesExceptH6[_i38];
if(clientPokemon.volatiles['protosynthesis'+_statName2]||clientPokemon.volatiles['quarkdrive'+_statName2]){
if(_statName2==='spe'){
speedModifiers.push(1.5);
}else{
stats[_statName2]=Math.floor(stats[_statName2]*1.3);
}
}
}
}
if(ability==='marvelscale'&&pokemon.status){
stats.def=Math.floor(stats.def*1.5);
}
var isNFE=(_this$battle$dex$spec=this.battle.dex.species.get(serverPokemon.speciesForme).evos)==null?void 0:_this$battle$dex$spec.some(function(evo){var _this4$battle$dex$spe;
var evoSpecies=_this4.battle.dex.species.get(evo);
return!evoSpecies.isNonstandard||
evoSpecies.isNonstandard===((_this4$battle$dex$spe=_this4.battle.dex.species.get(serverPokemon.speciesForme))==null?void 0:_this4$battle$dex$spe.isNonstandard)||

evoSpecies.isNonstandard==="Unobtainable";
});
if(item==='eviolite'&&(isNFE||this.battle.dex.species.get(serverPokemon.speciesForme).id==='dipplin')){
stats.def=Math.floor(stats.def*1.5);
stats.spd=Math.floor(stats.spd*1.5);
}
if(ability==='grasspelt'){
if(this.battle.hasPseudoWeather('Grassy Terrain')||
serverPokemon.item!=='safetygoggles'&&this.battle.irritantWeather.includes('Pollen Storm')){
stats.def=Math.floor(stats.def*1.5);
}
}
if(this.battle.hasPseudoWeather('Electric Terrain')){
if(ability==='surgesurfer'){
speedModifiers.push(2);
}
if(ability==='hadronengine'){
stats.spa=Math.floor(stats.spa*1.3);
}
}
if(item==='choicespecs'&&!(clientPokemon!=null&&clientPokemon.volatiles['dynamax'])){
stats.spa=Math.floor(stats.spa*1.5);
}
if(item==='deepseatooth'&&species==='Clamperl'){
stats.spa*=2;
}
if(item==='souldew'&&this.battle.gen<=6&&(species==='Latios'||species==='Latias')){
stats.spa=Math.floor(stats.spa*1.5);
stats.spd=Math.floor(stats.spd*1.5);
}
if(clientPokemon&&(ability==='plus'||ability==='minus')){
var _allyActive=clientPokemon.side.active;
if(_allyActive.length>1){
var abilityName=ability==='plus'?'Plus':'Minus';for(var _i40=0;_i40<
_allyActive.length;_i40++){var _ally=_allyActive[_i40];
if(!_ally||_ally===clientPokemon||_ally.fainted)continue;
var _allyAbility=this.getAllyAbility(_ally);
if(_allyAbility!=='Plus'&&_allyAbility!=='Minus')continue;
if(this.battle.gen<=4&&_allyAbility===abilityName)continue;
stats.spa=Math.floor(stats.spa*1.5);
break;
}
}
}
if(item==='assaultvest'){
stats.spd=Math.floor(stats.spd*1.5);
}
if(item==='deepseascale'&&species==='Clamperl'){
stats.spd*=2;
}
if(item==='choicescarf'&&!(clientPokemon!=null&&clientPokemon.volatiles['dynamax'])){
speedModifiers.push(1.5);
}
if(item==='ironball'||speedHalvingEVItems.includes(item)){
speedModifiers.push(0.5);
}
if(ability==='furcoat'){
stats.def*=2;
}
if(this.battle.abilityActive('Vessel of Ruin')){
if(ability!=='vesselofruin'){
stats.spa=Math.floor(stats.spa*0.75);
}
}
if(this.battle.abilityActive('Sword of Ruin')){
if(ability!=='swordofruin'){
stats.def=Math.floor(stats.def*0.75);
}
}
if(this.battle.abilityActive('Tablets of Ruin')){
if(ability!=='tabletsofruin'){
stats.atk=Math.floor(stats.atk*0.75);
}
}
if(this.battle.abilityActive('Beads of Ruin')){
if(ability!=='beadsofruin'){
stats.spd=Math.floor(stats.spd*0.75);
}
}
var sideConditions=this.battle.mySide.sideConditions;
if(sideConditions['tailwind']){
speedModifiers.push(2);
}
if(sideConditions['grasspledge']){
speedModifiers.push(0.25);
}

var chainedSpeedModifier=1;for(var _i42=0;_i42<
speedModifiers.length;_i42++){var modifier=speedModifiers[_i42];
chainedSpeedModifier*=modifier;
}

stats.spe=stats.spe*chainedSpeedModifier;
stats.spe=stats.spe%1>0.5?Math.ceil(stats.spe):Math.floor(stats.spe);

if(pokemon.status==='par'&&ability!=='quickfeet'){
if(this.battle.gen>6){
stats.spe=Math.floor(stats.spe*0.5);
}else{
stats.spe=Math.floor(stats.spe*0.25);
}
}

return stats;
};_proto2.

renderStats=function renderStats(clientPokemon,serverPokemon,short){
var isTransformed=clientPokemon==null?void 0:clientPokemon.volatiles.transform;
if(!serverPokemon||isTransformed){
if(!clientPokemon)throw new Error('Must pass either clientPokemon or serverPokemon');
var _this$getSpeedRange=this.getSpeedRange(clientPokemon),min=_this$getSpeedRange[0],max=_this$getSpeedRange[1];
return'<p><small>Spe</small> '+min+' to '+max+' <small>(before items/abilities/modifiers)</small></p>';
}
var stats=serverPokemon.stats;
var modifiedStats=this.calculateModifiedStats(clientPokemon,serverPokemon);

var buf='<p>';

if(!short){
var hasModifiedStat=false;for(var _i44=0,_Dex$statNamesExceptH8=
Dex.statNamesExceptHP;_i44<_Dex$statNamesExceptH8.length;_i44++){var statName=_Dex$statNamesExceptH8[_i44];
if(this.battle.gen===1&&statName==='spd')continue;
var statLabel=this.battle.gen===1&&statName==='spa'?'spc':statName;
buf+=statName==='atk'?'<small>':'<small> / ';
buf+=''+BattleText[statLabel].statShortName+'&nbsp;</small>';
buf+=''+stats[statName];
if(modifiedStats[statName]!==stats[statName])hasModifiedStat=true;
}
buf+='</p>';

if(!hasModifiedStat)return buf;

buf+='<p><small>(After stat modifiers:)</small></p>';
buf+='<p>';
}for(var _i46=0,_Dex$statNamesExceptH10=

Dex.statNamesExceptHP;_i46<_Dex$statNamesExceptH10.length;_i46++){var _statName3=_Dex$statNamesExceptH10[_i46];
if(this.battle.gen===1&&_statName3==='spd')continue;
var _statLabel=this.battle.gen===1&&_statName3==='spa'?'spc':_statName3;
buf+=_statName3==='atk'?'<small>':'<small> / ';
buf+=''+BattleText[_statLabel].statShortName+'&nbsp;</small>';
if(modifiedStats[_statName3]===stats[_statName3]){
buf+=''+modifiedStats[_statName3];
}else if(modifiedStats[_statName3]<stats[_statName3]){
buf+='<strong class="stat-lowered">'+modifiedStats[_statName3]+'</strong>';
}else{
buf+='<strong class="stat-boosted">'+modifiedStats[_statName3]+'</strong>';
}
}
buf+='</p>';
return buf;
};_proto2.

getPPUseText=function getPPUseText(moveTrackRow,showKnown){
var moveName=moveTrackRow[0],ppUsed=moveTrackRow[1];
var move;
var maxpp;
if(moveName.charAt(0)==='*'){

move=this.battle.dex.moves.get(moveName.substr(1));
maxpp=5;
}else{
move=this.battle.dex.moves.get(moveName);
maxpp=move.pp===1||move.noPPBoosts?move.pp:move.pp*8/5;
if(this.battle.gen<3)maxpp=Math.min(61,maxpp);
}
var bullet=moveName.charAt(0)==='*'||move.isZ?'<span style="color:#888">&#8226;</span>':'&#8226;';
if(ppUsed===Infinity){
return bullet+" "+move.name+" <small>(0/"+maxpp+")</small>";
}
if(ppUsed||moveName.charAt(0)==='*'){
return bullet+" "+move.name+" <small>("+(maxpp-ppUsed)+"/"+maxpp+")</small>";
}
return bullet+" "+move.name+" "+(showKnown?' <small>(revealed)</small>':'');
};_proto2.

ppUsed=function ppUsed(move,pokemon){for(var _i48=0,_pokemon$moveTrack2=
pokemon.moveTrack;_i48<_pokemon$moveTrack2.length;_i48++){var _ref2=_pokemon$moveTrack2[_i48];var moveName=_ref2[0];var ppUsed=_ref2[1];
if(moveName.charAt(0)==='*')moveName=moveName.substr(1);
if(move.name===moveName)return ppUsed;
}
return 0;
};_proto2.




getSpeedRange=function getSpeedRange(pokemon){var _pokemon$volatiles$tr;
var tr=Math.trunc||Math.floor;
var species=pokemon.getSpecies();
var baseSpe=species.baseStats.spe;
if(this.battle.rules['Scalemons Mod']){
var bstWithoutHp=species.bst-species.baseStats.hp;
var scale=600-species.baseStats.hp;
baseSpe=tr(baseSpe*scale/bstWithoutHp);
if(baseSpe<1)baseSpe=1;
if(baseSpe>255)baseSpe=255;
}
var level=((_pokemon$volatiles$tr=pokemon.volatiles.transform)==null?void 0:_pokemon$volatiles$tr[4])||pokemon.level;
var tier=this.battle.tier;
var gen=this.battle.gen;
var isCGT=tier.includes('Computer-Generated Teams');
var isRandomBattle=tier.includes('Random Battle')||
tier.includes('Random')&&tier.includes('Battle')&&gen>=6||isCGT;

var minNature=isRandomBattle||gen<3?1:0.9;
var maxNature=isRandomBattle||gen<3?1:1.1;
var maxIv=gen<3?30:31;

var min;
var max;
if(tier.includes("Let's Go")){
min=tr(tr(tr(2*baseSpe*level/100+5)*minNature)*tr((70/255/10+1)*100)/100);
max=tr(tr(tr((2*baseSpe+maxIv)*level/100+5)*maxNature)*tr((70/255/10+1)*100)/100);
if(tier.includes('No Restrictions'))max+=200;else
if(tier.includes('Random'))max+=20;
}else{
var maxIvEvOffset=maxIv+(isRandomBattle&&gen>=3?21:63);
max=tr(tr((2*baseSpe+maxIvEvOffset)*level/100+5)*maxNature);
min=isCGT?max:tr(tr(2*baseSpe*level/100+5)*minNature);
}
return[min,max];
};_proto2.




getMoveType=function getMoveType(move,value,forMaxMove){
var pokemon=value.pokemon;
var serverPokemon=value.serverPokemon;

var moveType=move.type;
var category=move.category;
if(category==='Status'&&forMaxMove)return['Normal','Status'];

if(!pokemon)return[moveType,category];

var pokemonTypes=pokemon.getTypeList(serverPokemon);
value.reset();
if(move.id==='revelationdance'){
moveType=pokemonTypes[0];
}

var item=Dex.items.get(value.itemName);
if(move.id==='multiattack'&&item.onMemory){
if(value.itemModify(0))moveType=item.onMemory;
}
if(move.id==='judgment'&&item.onPlate&&!item.zMoveType){
if(value.itemModify(0))moveType=item.onPlate;
}
if(move.id==='technoblast'&&item.onDrive){
if(value.itemModify(0))moveType=item.onDrive;
}
if(move.id==='naturalgift'&&item.naturalGift){
if(value.itemModify(0))moveType=item.naturalGift.type;
}

if(move.id==='weatherball'&&value.climateWeatherModify(0)){
switch(this.battle.getRecentWeather(item.id)){
case'sunnyday':
case'desolateland':
moveType='Fire';
break;
case'raindance':
case'primordialsea':
moveType='Water';
break;
case'hail':
case'snow':
moveType='Ice';
break;
case'bloodmoon':
moveType='Dark';
break;
case'foghorn':
moveType='Normal';
break;
}
}
if(move.id==='weatherball'&&value.irritantWeatherModify(0)){
switch(this.battle.getRecentWeather(item.id)){
case'sandstorm':
moveType='Rock';
break;
case'duststorm':
moveType='Ground';
break;
case'pollinate':
moveType='Grass';
break;
case'swarmsignal':
moveType='Bug';
break;
case'smogspread':
moveType='Poison';
break;
case'sprinkle':
moveType='Fairy';
break;
}
}
if(move.id==='weatherball'&&value.energyWeatherModify(0)){
switch(this.battle.getRecentWeather(item.id)){
case'auraprojection':
moveType='Fighting';
break;
case'haunt':
moveType='Ghost';
break;
case'daydream':
moveType='Psychic';
break;
case'dragonforce':
moveType='Dragon';
break;
case'supercell':
moveType='Electric';
break;
case'magnetize':
moveType='Steel';
break;
}
}
if(move.id==='weatherball'&&value.clearingWeatherModify(0)){
switch(this.battle.getRecentWeather(item.id)){
case'strongwinds':
moveType='Flying';
break;
}
}
if(move.id==='terrainpulse'&&pokemon.isGrounded(serverPokemon)){
if(this.battle.hasPseudoWeather('Electric Terrain')){
moveType='Electric';
}else if(this.battle.hasPseudoWeather('Grassy Terrain')){
moveType='Grass';
}else if(this.battle.hasPseudoWeather('Misty Terrain')){
moveType='Fairy';
}else if(this.battle.hasPseudoWeather('Psychic Terrain')){
moveType='Psychic';
}
}
if(move.id==='terablast'&&pokemon.terastallized){
moveType=pokemon.terastallized;
}


if(move.id==='aurawheel'&&pokemon.getSpeciesForme()==='Morpeko-Hangry'){
moveType='Dark';
}

if(move.id==='ragingbull'){
switch(pokemon.getSpeciesForme()){
case'Tauros-Paldea-Combat':
moveType='Fighting';
break;
case'Tauros-Paldea-Blaze':
moveType='Fire';
break;
case'Tauros-Paldea-Aqua':
moveType='Water';
break;
}
}

if(move.id==='ivycudgel'){
switch(pokemon.getSpeciesForme()){
case'Ogerpon-Wellspring':case'Ogerpon-Wellspring-Tera':
moveType='Water';
break;
case'Ogerpon-Hearthflame':case'Ogerpon-Hearthflame-Tera':
moveType='Fire';
break;
case'Ogerpon-Cornerstone':case'Ogerpon-Cornerstone-Tera':
moveType='Rock';
break;
}
}


var noTypeOverride=[
'judgment','multiattack','naturalgift','revelationdance','struggle','technoblast','terrainpulse','weatherball'];

var allowTypeOverride=!noTypeOverride.includes(move.id)&&(move.id!=='terablast'||!pokemon.terastallized);
if(allowTypeOverride){
if(this.battle.rules['Revelationmons Mod']){
var _pokemon$getTypes=pokemon.getTypes(serverPokemon),types=_pokemon$getTypes[0];
for(var i=0;i<types.length;i++){
if(serverPokemon.moves[i]&&move.id===toID(serverPokemon.moves[i])){
moveType=types[i];
}
}
}

if(category!=='Status'&&!move.isZ&&!move.id.startsWith('hiddenpower')){
if(moveType==='Normal'){
if(value.abilityModify(0,'Aerilate'))moveType='Flying';
if(value.abilityModify(0,'Galvanize'))moveType='Electric';
if(value.abilityModify(0,'Pixilate'))moveType='Fairy';
if(value.abilityModify(0,'Refrigerate'))moveType='Ice';
if(value.abilityModify(0,'Vegetate'))moveType='Grass';
}
if(value.abilityModify(0,'Normalize'))moveType='Normal';
if(move.flags['sound']){
if(value.abilityModify(0,'Trumpet Weevil'))moveType='Bug';
}
}


var isSound=!!(
forMaxMove?
this.getMaxMoveFromType(moveType,forMaxMove!==true&&forMaxMove||undefined):move).
flags['sound'];
if(isSound&&value.abilityModify(0,'Liquid Voice')){
moveType='Water';
}
}

if(move.id==='photongeyser'||move.id==='lightthatburnsthesky'||
move.id==='terablast'&&pokemon.terastallized){
var stats=this.calculateModifiedStats(pokemon,serverPokemon,true);
if(stats.atk>stats.spa)category='Physical';
}
return[moveType,category];
};_proto2.


getMoveAccuracy=function getMoveAccuracy(move,value,target){
value.reset(move.accuracy===true?0:move.accuracy,true);

var pokemon=value.pokemon;

if(move.id==='toxic'&&this.battle.gen>=6&&this.pokemonHasType(pokemon,'Poison')){
value.set(0,"Poison type");
return value;
}
if(move.id==='blizzard'&&this.battle.gen>=4){
value.climateWeatherModify(0,'Hail');
value.climateWeatherModify(0,'Snow');
}
if(['hurricane','thunder','bleakwindstorm','wildboltstorm','sandsearstorm'].includes(move.id)){
value.climateWeatherModify(0,'Rain Dance');
value.climateWeatherModify(0,'Primordial Sea');
}
if(move.type==='Steel'){
value.energyWeatherModify(0,'Magnetize');
}
if(move.flags['wind']){
value.clearingWeatherModify(0,'Strong Winds');
}
value.abilityModify(0,'No Guard');
if(!value.value)return value;


if(move.ohko){
if(this.battle.gen===1){
value.set(value.value,"fails if target's Speed is higher");
return value;
}
if(move.id==='sheercold'&&this.battle.gen>=7&&!this.pokemonHasType(pokemon,'Ice')){
value.set(20,'not Ice-type');
}
if(target){
if(pokemon.level<target.level){
value.reset(0);
value.set(0,"FAILS: target's level is higher");
}else if(pokemon.level>target.level){
value.set(value.value+pokemon.level-target.level,"+1% per level above target");
}
}else{
if(pokemon.level<100)value.set(value.value,"fails if target's level is higher");
if(pokemon.level>1)value.set(value.value,"+1% per level above target");
}
return value;
}



var accuracyModifiers=[];
if(move.type!=='Normal'||!value.tryAbility('Droughtproof')){
if(value.tryClimateWeather('Foghorn'))value.modify(9/10,'Fog');
}
if((this.pokemonHasType(pokemon,'Bug')||this.pokemonHasType(pokemon,'Bug'))&&!value.tryItem('Safety Goggles')){
if(value.tryIrritantWeather('Swarm Signal'))value.modify(4/3,'Pheromones');
}
if(value.tryAbility('Master Instinct')){
if(value.tryEnergyWeather('Aura Projection'))value.modify(1.2,'Battle Aura');
}

if(this.battle.hasPseudoWeather('Gravity')){
accuracyModifiers.push(6840);
value.modify(5/3,"Gravity");
}
if(this.battle.hasPseudoWeather('Pearl Drop')){
accuracyModifiers.push(3686);
value.modify(9/10,"Pearl Drop");
}for(var _i50=0,_pokemon$side$active2=

pokemon.side.active;_i50<_pokemon$side$active2.length;_i50++){var active=_pokemon$side$active2[_i50];
if(!active||active.fainted)continue;
var ability=this.getAllyAbility(active);
if(ability==='Victory Star'){
accuracyModifiers.push(4506);
value.modify(1.1,"Victory Star");
}
}

if(value.tryAbility('Hustle')&&move.category==='Physical'){
accuracyModifiers.push(3277);
value.abilityModify(0.8,"Hustle");
}else if(value.tryAbility('Compound Eyes')){
accuracyModifiers.push(5325);
value.abilityModify(1.3,"Compound Eyes");
}
if(value.tryItem('Wide Lens')){
accuracyModifiers.push(4505);
value.itemModify(1.1,"Wide Lens");
}


var chain=4096;for(var _i52=0;_i52<
accuracyModifiers.length;_i52++){var mod=accuracyModifiers[_i52];
if(mod!==4096){
chain=chain*mod+2048>>12;
}
}


value.set(move.accuracy);

if(move.id==='hurricane'||move.id==='thunder'){
if(value.tryClimateWeather('Sunny Day'))value.set(50,'Sunny Day');
if(value.tryClimateWeather('Desolate Land'))value.set(50,'Desolate Land');
}


var accuracyAfterChain=value.value*chain/4096;
accuracyAfterChain=accuracyAfterChain%1>0.5?Math.ceil(accuracyAfterChain):Math.floor(accuracyAfterChain);
value.set(accuracyAfterChain);


if(pokemon!=null&&pokemon.boosts.accuracy){
if(pokemon.boosts.accuracy>0){
value.set(Math.floor(value.value*(pokemon.boosts.accuracy+3)/3));
}else{
value.set(Math.floor(value.value*3/(3-pokemon.boosts.accuracy)));
}
}


if(this.battle.gen===1&&!toID(this.battle.tier).includes('stadium')){
value.set(Math.floor(value.value*255/100)/256*100);
}
return value;
};_proto2.




getMoveBasePower=function getMoveBasePower(move,moveType,value){var target=arguments.length>3&&arguments[3]!==undefined?arguments[3]:null;
var pokemon=value.pokemon;
var serverPokemon=value.serverPokemon;


var modifiedStats=this.calculateModifiedStats(pokemon,serverPokemon);

value.reset(move.basePower);

if(move.id==='acrobatics'){
if(!serverPokemon.item){
value.modify(2,"Acrobatics + no item");
}
}
if(['crushgrip','wringout'].includes(move.id)&&target){
value.set(
Math.floor(Math.floor((120*(100*Math.floor(target.hp*4096/target.maxhp))+2048-1)/4096)/100)||1,
'approximate'
);
}
if(move.id==='brine'&&target&&target.hp*2<=target.maxhp){
value.modify(2,'Brine + target below half HP');
}
if(move.id==='eruption'||move.id==='waterspout'||move.id==='dragonenergy'){
value.set(Math.floor(150*pokemon.hp/pokemon.maxhp)||1);
}
if(move.id==='facade'&&!['','slp','frz'].includes(pokemon.status)){
value.modify(2,'Facade + status');
}
if(move.id==='flail'||move.id==='reversal'){
var multiplier;
var ratios;
if(this.battle.gen>4){
multiplier=48;
ratios=[2,5,10,17,33];
}else{
multiplier=64;
ratios=[2,6,13,22,43];
}
var ratio=pokemon.hp*multiplier/pokemon.maxhp;
var basePower;
if(ratio<ratios[0])basePower=200;else
if(ratio<ratios[1])basePower=150;else
if(ratio<ratios[2])basePower=100;else
if(ratio<ratios[3])basePower=80;else
if(ratio<ratios[4])basePower=40;else
basePower=20;
value.set(basePower);
}
if(['hex','infernalparade'].includes(move.id)&&target!=null&&target.status){
value.modify(2,move.name+' + status');
}
if(move.id==='lastrespects'){
value.set(Math.min(50+50*pokemon.side.faintCounter));
}
if(move.id==='punishment'&&target){
var boostCount=0;for(var _i54=0,_Object$values2=
Object.values(target.boosts);_i54<_Object$values2.length;_i54++){var boost=_Object$values2[_i54];
if(boost>0)boostCount+=boost;
}
value.set(Math.min(60+20*boostCount,200));
}
if(move.id==='smellingsalts'&&target){
if(target.status==='par'){
value.modify(2,'Smelling Salts + Paralysis');
}
}
if(['storedpower','powertrip'].includes(move.id)&&target){
var _boostCount=0;for(var _i56=0,_Object$values4=
Object.values(pokemon.boosts);_i56<_Object$values4.length;_i56++){var _boost=_Object$values4[_i56];
if(_boost>0)_boostCount+=_boost;
}
value.set(20+20*_boostCount);
}
if(move.id==='trumpcard'){
var ppLeft=5-this.ppUsed(move,pokemon);
var _basePower2=40;
if(ppLeft===1)_basePower2=200;else
if(ppLeft===2)_basePower2=80;else
if(ppLeft===3)_basePower2=60;else
if(ppLeft===4)_basePower2=50;
value.set(_basePower2);
}
if(move.id==='magnitude'){
value.setRange(10,150);
}
if(['venoshock','barbbarrage'].includes(move.id)&&target){
if(['psn','tox'].includes(target.status)){
value.modify(2,move.name+' + Poison');
}
}
if(move.id==='wakeupslap'&&target){
if(target.status==='slp'){
value.modify(2,'Wake-Up Slap + Sleep');
}
}
if(move.id==='weatherball'){
switch(this.battle.getRecentWeather()){
case this.battle.climateWeather:
value.climateWeatherModify(2);
break;
case this.battle.irritantWeather:
value.irritantWeatherModify(2);
break;
case this.battle.energyWeather:
value.energyWeatherModify(2);
break;
case this.battle.clearingWeather:
value.clearingWeatherModify(2);
break;
}
}
if(move.id==='hydrosteam'){
value.climateWeatherModify(1.5,'Sunny Day');
}
if(move.id==='psyblade'&&this.battle.hasPseudoWeather('Electric Terrain')){
value.modify(1.5,'Electric Terrain');
}
if(move.id==='terrainpulse'&&pokemon.isGrounded(serverPokemon)){
if(
this.battle.hasPseudoWeather('Electric Terrain')||
this.battle.hasPseudoWeather('Grassy Terrain')||
this.battle.hasPseudoWeather('Misty Terrain')||
this.battle.hasPseudoWeather('Psychic Terrain'))
{
value.modify(2,'Terrain Pulse boost');
}
}
if(
move.id==='watershuriken'&&pokemon.getSpeciesForme()==='Greninja-Ash'&&pokemon.ability==='Battle Bond')
{
value.set(20,'Battle Bond');
}

if(move.id==='electroball'&&target){
var _this$getSpeedRange2=this.getSpeedRange(target),minSpe=_this$getSpeedRange2[0],maxSpe=_this$getSpeedRange2[1];
var minRatio=modifiedStats.spe/maxSpe;
var maxRatio=modifiedStats.spe/minSpe;
var min;
var max;

if(minRatio>=4)min=150;else
if(minRatio>=3)min=120;else
if(minRatio>=2)min=80;else
if(minRatio>=1)min=60;else
min=40;

if(maxRatio>=4)max=150;else
if(maxRatio>=3)max=120;else
if(maxRatio>=2)max=80;else
if(maxRatio>=1)max=60;else
max=40;

value.setRange(min,max);
}
if(move.id==='gyroball'&&target){
var _this$getSpeedRange3=this.getSpeedRange(target),_minSpe=_this$getSpeedRange3[0],_maxSpe=_this$getSpeedRange3[1];
var _min=Math.floor(25*_minSpe/modifiedStats.spe)||1;
if(_min>150)_min=150;
var _max=Math.floor(25*_maxSpe/modifiedStats.spe)||1;
if(_max>150)_max=150;
value.setRange(_min,_max);
}

if(serverPokemon.item){
var item=Dex.items.get(serverPokemon.item);
if(move.id==='fling'&&item.fling){
value.itemModify(item.fling.basePower);
}
if(move.id==='naturalgift'){
value.itemModify(item.naturalGift.basePower);
}
}

if(['lowkick','grassknot','heavyslam','heatcrash'].includes(move.id)){
var isGKLK=['lowkick','grassknot'].includes(move.id);
if(target){
var targetWeight=target.getWeightKg();
var pokemonWeight=pokemon.getWeightKg(serverPokemon);
var _basePower3;
if(isGKLK){
_basePower3=20;
if(targetWeight>=200)_basePower3=120;else
if(targetWeight>=100)_basePower3=100;else
if(targetWeight>=50)_basePower3=80;else
if(targetWeight>=25)_basePower3=60;else
if(targetWeight>=10)_basePower3=40;
}else{
_basePower3=40;
if(pokemonWeight>=targetWeight*5)_basePower3=120;else
if(pokemonWeight>=targetWeight*4)_basePower3=100;else
if(pokemonWeight>=targetWeight*3)_basePower3=80;else
if(pokemonWeight>=targetWeight*2)_basePower3=60;
}
if(target.volatiles['dynamax']){
value.set(0,'blocked by target\'s Dynamax');
}else{
value.set(_basePower3);
}
}else{
value.setRange(isGKLK?20:40,120);
}
}

if(move.id==='ragefist'){
value.set(Math.min(350,50+50*pokemon.timesAttacked),
pokemon.timesAttacked>0?"Hit "+
pokemon.timesAttacked+" time"+(pokemon.timesAttacked>1?'s':''):
undefined);
}
if(!value.value)return value;


if(pokemon.status==='brn'&&move.category==='Special'){
value.abilityModify(1.5,"Flare Boost");
}
if(move.flags['punch']){
value.abilityModify(1.5,'Iron Fist');
}
if(move.flags['pulse']){
value.abilityModify(1.5,"Mega Launcher");
}
if(move.flags['bite']){
value.abilityModify(1.5,"Strong Jaw");
}
if(value.value<=60){
value.abilityModify(1.5,"Technician");
}
if(['psn','tox'].includes(pokemon.status)&&move.category==='Physical'){
value.abilityModify(1.5,"Toxic Boost");
}
if(this.battle.gen>2&&serverPokemon.status==='brn'&&move.id!=='facade'&&move.category==='Physical'){
if(!value.tryAbility("Guts"))value.modify(0.5,'Burn');
}
if(serverPokemon.status==='frb'&&move.category==='Special'){
value.modify(0.5,'Frostbite');
}
if(move.secondaries){
value.abilityModify(1.3,"Sheer Force");
}
if(move.flags['contact']){
value.abilityModify(1.3,"Tough Claws");
}
if(move.flags['sound']){
value.abilityModify(1.3,"Punk Rock");
}
if(move.flags['slicing']){
value.abilityModify(1.5,"Sharpness");
}
for(var i=1;i<=5&&i<=pokemon.side.faintCounter;i++){
if(pokemon.volatiles["fallen"+i]){
value.abilityModify(1+0.1*i,"Supreme Overlord");
}
}
if(target){
if(["MF","FM"].includes(pokemon.gender+target.gender)){
value.abilityModify(0.75,"Rivalry");
}else if(["MM","FF"].includes(pokemon.gender+target.gender)){
value.abilityModify(1.25,"Rivalry");
}
}
if(moveType==='Fairy'){
value.abilityModify(1.3,"Chakra");
}
if(serverPokemon.item!=='utilityumbrella'){
if('Ice'.includes(moveType)&&this.battle.climateWeather==='hail'){
if(value.tryAbility("Absolute Zero"))value.climateWeatherModify(1.3,"Hail","Absolute Zero");
}
if('Ice'.includes(moveType)&&this.battle.climateWeather==='snow'){
if(value.tryAbility("Absolute Zero"))value.climateWeatherModify(1.3,"Snow","Absolute Zero");
}
}
if(serverPokemon.item!=='safetygoggles'){
if(['Rock','Ground','Steel'].includes(moveType)&&this.battle.irritantWeather==='sandstorm'){
if(value.tryAbility("Earth Force"))value.irritantWeatherModify(1.3,"Sandstorm","Earth Force");
}
if(['Rock','Ground','Steel'].includes(moveType)&&this.battle.irritantWeather==='duststorm'){
if(value.tryAbility("Earth Force"))value.irritantWeatherModify(1.3,"Dust Storm","Earth Force");
}
if(['Fairy','Grass','Fire','Water'].includes(moveType)&&this.battle.irritantWeather==='sprinkle'){
if(value.tryAbility("Power Above"))value.irritantWeatherModify(1.3,"Fairy Dust","Power Above");
}
}
if(serverPokemon.item!=='energynullifier'){
if(move.category==='Special'&&this.battle.energyWeather==='daydream'){
if(value.tryAbility("Smoke and Mirrors"))value.energyWeatherModify(1.2,"Dreamscape","Smoke and Mirrors");
}
if(['Dragon','Fire','Electric','Ice'].includes(moveType)&&this.battle.energyWeather==='dragonforce'){
if(value.tryAbility("Power Within"))value.energyWeatherModify(1.3,"Dragon Force","Power Within");
}
}
var noTypeOverride=[
'judgment','multiattack','naturalgift','revelationdance','struggle','technoblast','terrainpulse','weatherball'];

var allowTypeOverride=!noTypeOverride.includes(move.id)&&(move.id!=='terablast'||!pokemon.terastallized);
if(
move.category!=='Status'&&allowTypeOverride&&!move.isZ&&!move.isMax&&
!move.id.startsWith('hiddenpower'))
{
if(move.type==='Normal'){
value.abilityModify(this.battle.gen>6?1.2:1.3,"Aerilate");
value.abilityModify(this.battle.gen>6?1.2:1.3,"Galvanize");
value.abilityModify(this.battle.gen>6?1.2:1.3,"Pixilate");
value.abilityModify(this.battle.gen>6?1.2:1.3,"Refrigerate");
value.abilityModify(1.2,"Vegetate");
}
if(this.battle.gen>6){
value.abilityModify(1.2,"Normalize");
}
if(move.flags['sound']){
value.abilityModify(1.5,"Trumpet Weevil");
}
}
if(move.recoil||move.hasCrashDamage){
value.abilityModify(1.2,'Reckless');
}

if(move.category!=='Status'){
var auraBoosted='';
var auraBroken=false;for(var _i58=0,_pokemon$side$active4=
pokemon.side.active;_i58<_pokemon$side$active4.length;_i58++){var ally=_pokemon$side$active4[_i58];
if(!ally||ally.fainted)continue;
var allyAbility=this.getAllyAbility(ally);
if(moveType==='Fairy'&&allyAbility==='Fairy Aura'){
auraBoosted='Fairy Aura';
}else if(moveType==='Dark'&&allyAbility==='Dark Aura'){
auraBoosted='Dark Aura';
}else if(allyAbility==='Aura Break'){
auraBroken=true;
}else if(allyAbility==='Battery'&&ally!==pokemon&&move.category==='Special'){
value.modify(1.3,'Battery');
}else if(allyAbility==='Power Spot'&&ally!==pokemon){
value.modify(1.3,'Power Spot');
}else if(allyAbility==='Steely Spirit'&&moveType==='Steel'){
value.modify(1.5,'Steely Spirit');
}
}for(var _i60=0,_pokemon$side$foe$act2=
pokemon.side.foe.active;_i60<_pokemon$side$foe$act2.length;_i60++){var foe=_pokemon$side$foe$act2[_i60];
if(!foe||foe.fainted)continue;
if(foe.ability==='Fairy Aura'&&moveType==='Fairy'){
auraBoosted='Fairy Aura';
}else if(foe.ability==='Dark Aura'&&moveType==='Dark'){
auraBoosted='Dark Aura';
}else if(foe.ability==='Aura Break'){
auraBroken=true;
}
}
if(auraBoosted){
if(auraBroken){
value.modify(0.75,auraBoosted+' + Aura Break');
}else{
value.modify(1.33,auraBoosted);
}
}
}


if(this.battle.hasPseudoWeather('Electric Terrain')&&moveType==='Electric'||
this.battle.hasPseudoWeather('Grassy Terrain')&&moveType==='Grass'||
this.battle.hasPseudoWeather('Psychic Terrain')&&moveType==='Psychic'){
if(pokemon.isGrounded(serverPokemon)){
value.modify(this.battle.gen>7?1.3:1.5,'Terrain boost');
}
}else if(this.battle.hasPseudoWeather('Misty Terrain')&&moveType==='Dragon'){
if(target?target.isGrounded():true){
value.modify(0.5,'Misty Terrain + grounded target');
}
}else if(
this.battle.hasPseudoWeather('Grassy Terrain')&&['earthquake','bulldoze','magnitude'].includes(move.id))
{
if(target?target.isGrounded():true){
value.modify(0.5,'Grassy Terrain + grounded target');
}
}
if(
move.id==='expandingforce'&&
this.battle.hasPseudoWeather('Psychic Terrain')&&
pokemon.isGrounded(serverPokemon))
{
value.modify(1.5,'Expanding Force + Psychic Terrain boost');
}
if(move.id==='mistyexplosion'&&this.battle.hasPseudoWeather('Misty Terrain')){
value.modify(1.5,'Misty Explosion + Misty Terrain boost');
}
if(move.id==='risingvoltage'&&this.battle.hasPseudoWeather('Electric Terrain')&&target!=null&&target.isGrounded()){
value.modify(2,'Rising Voltage + Electric Terrain boost');
}
if(
move.id==='steelroller'&&
!this.battle.hasPseudoWeather('Electric Terrain')&&
!this.battle.hasPseudoWeather('Grassy Terrain')&&
!this.battle.hasPseudoWeather('Misty Terrain')&&
!this.battle.hasPseudoWeather('Psychic Terrain'))
{
value.set(0,'no Terrain');
}


value=this.getItemBoost(move,value,moveType);

return value;
};_proto2.





















































getItemBoost=function getItemBoost(move,value,moveType){var _value$pokemon$volati,_BattleTooltips$orbUs,_BattleTooltips$orbTy;
var item=this.battle.dex.items.get(value.serverPokemon.item);
var itemName=item.name;
var moveName=move.name;
var species=this.battle.dex.species.get(value.serverPokemon.speciesForme);
var isTransform=value.pokemon.volatiles.transform;
var speciesName=isTransform&&(_value$pokemon$volati=value.pokemon.volatiles.formechange)!=null&&_value$pokemon$volati[1]&&this.battle.gen<=4?
this.battle.dex.species.get(value.pokemon.volatiles.formechange[1]).baseSpecies:species.baseSpecies;


if(item.onPlate===moveType&&!item.zMove){
value.itemModify(1.3);
return value;
}


if(BattleTooltips.incenseTypes[item.name]===moveType){
value.itemModify(1.2);
return value;
}


if(BattleTooltips.itemTypes[item.name]===moveType){
value.itemModify(this.battle.gen<4?1.1:1.2);
return value;
}


if(item.name==='Light Ball'&&this.battle.gen===4&&speciesName==='Pikachu'){
value.itemModify(2);
return value;
}


if(item.name==='Soul Dew'&&this.battle.gen<7)return value;
if((_BattleTooltips$orbUs=BattleTooltips.orbUsers[speciesName])!=null&&_BattleTooltips$orbUs.includes(item.name)&&(_BattleTooltips$orbTy=
BattleTooltips.orbTypes[item.name])!=null&&_BattleTooltips$orbTy.includes(moveType)){
value.itemModify(1.2);
return value;
}
if(speciesName.startsWith('Ogerpon-Wellspring')&&itemName==='Wellspring Mask'||
speciesName.startsWith('Ogerpon-Hearthflame')&&itemName==='Hearthflame Mask'||
speciesName.startsWith('Ogerpon-Cornerstone')&&itemName==='Cornerstone Mask'){
value.itemModify(1.2);
return value;
}


if(BattleTooltips.noGemMoves.includes(moveName))return value;
if(itemName===moveType+' Gem'){
value.itemModify(this.battle.gen<6?1.5:1.3);
return value;
}

if(itemName==='Muscle Band'&&move.category==='Physical'||
itemName==='Wise Glasses'&&move.category==='Special'||
itemName==='Punching Glove'&&move.flags['punch']){
value.itemModify(1.1);
}

return value;
};_proto2.
getPokemonTypes=function getPokemonTypes(pokemon){var preterastallized=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
if(!pokemon.getTypes){
return this.battle.dex.species.get(pokemon.speciesForme).types;
}

return pokemon.getTypeList(undefined,preterastallized);
};_proto2.
pokemonHasType=function pokemonHasType(pokemon,type,types){
if(!types)types=this.getPokemonTypes(pokemon);for(var _i62=0,_types2=
types;_i62<_types2.length;_i62++){var curType=_types2[_i62];
if(curType===type)return true;
}
return false;
};_proto2.
getAllyAbility=function getAllyAbility(ally){

var allyAbility=Dex.abilities.get(ally.ability).name;

if(!allyAbility){
if(this.battle.myAllyPokemon){
allyAbility=Dex.abilities.get(this.battle.myAllyPokemon[ally.slot].ability).name;
}else if(this.battle.myPokemon){
allyAbility=Dex.abilities.get(this.battle.myPokemon[ally.slot].ability).name;
}
}
return allyAbility;
};_proto2.
getPokemonAbilityData=function getPokemonAbilityData(clientPokemon,serverPokemon){
var abilityData={
ability:'',baseAbility:'',possibilities:[]
};
if(clientPokemon){
if(clientPokemon.ability){
abilityData.ability=clientPokemon.ability||clientPokemon.baseAbility;
if(clientPokemon.baseAbility){
abilityData.baseAbility=clientPokemon.baseAbility;
}
}else{
var _speciesForme=clientPokemon.getSpeciesForme()||(serverPokemon==null?void 0:serverPokemon.speciesForme)||'';
var species=this.battle.dex.species.get(_speciesForme);
if(species.exists&&species.abilities){
abilityData.possibilities=[species.abilities['0']];
if(species.abilities['1'])abilityData.possibilities.push(species.abilities['1']);
if(species.abilities['H'])abilityData.possibilities.push(species.abilities['H']);
if(species.abilities['S'])abilityData.possibilities.push(species.abilities['S']);
}
}
}
if(serverPokemon){
if(!abilityData.ability)abilityData.ability=serverPokemon.ability||serverPokemon.baseAbility;
if(!abilityData.baseAbility&&serverPokemon.baseAbility){
abilityData.baseAbility=serverPokemon.baseAbility;
}
}
return abilityData;
};_proto2.
getPokemonAbilityText=function getPokemonAbilityText(
clientPokemon,
serverPokemon,
isActive,
hidePossible)
{
var text='';
var abilityData=this.getPokemonAbilityData(clientPokemon,serverPokemon);
if(!isActive){

var ability=abilityData.baseAbility||abilityData.ability;
if(ability)text='<small>Ability:</small> '+Dex.abilities.get(ability).name;
}else{
if(abilityData.ability){
var abilityName=Dex.abilities.get(abilityData.ability).name;
text='<small>Ability:</small> '+abilityName;
var baseAbilityName=Dex.abilities.get(abilityData.baseAbility).name;
if(baseAbilityName&&baseAbilityName!==abilityName)text+=' (base: '+baseAbilityName+')';
}
}
if(!text&&abilityData.possibilities.length&&!hidePossible){
text='<small>Possible abilities:</small> '+abilityData.possibilities.join(', ');
}
return text;
};return BattleTooltips;}();BattleTooltips.LONG_TAP_DELAY=350;BattleTooltips.longTapTimeout=0;BattleTooltips.elem=null;BattleTooltips.parentElem=null;BattleTooltips.isLocked=false;BattleTooltips.isPressed=false;BattleTooltips.zMoveEffects={'clearnegativeboost':"Restores negative stat stages to 0",'crit2':"Crit ratio +2",'heal':"Restores HP 100%",'curse':"Restores HP 100% if user is Ghost type, otherwise Attack +1",'redirect':"Redirects opposing attacks to user",'healreplacement':"Restores replacement's HP 100%"};BattleTooltips.zMoveTable={Poison:"Acid Downpour",Fighting:"All-Out Pummeling",Dark:"Black Hole Eclipse",Grass:"Bloom Doom",Normal:"Breakneck Blitz",Rock:"Continental Crush",Steel:"Corkscrew Crash",Dragon:"Devastating Drake",Electric:"Gigavolt Havoc",Water:"Hydro Vortex",Fire:"Inferno Overdrive",Ghost:"Never-Ending Nightmare",Bug:"Savage Spin-Out",Psychic:"Shattered Psyche",Ice:"Subzero Slammer",Flying:"Supersonic Skystrike",Ground:"Tectonic Rage",Fairy:"Twinkle Tackle","???":""};BattleTooltips.maxMoveTable={Poison:"Max Ooze",Fighting:"Max Knuckle",Dark:"Max Darkness",Grass:"Max Overgrowth",Normal:"Max Strike",Rock:"Max Rockfall",Steel:"Max Steelspike",Dragon:"Max Wyrmwind",Electric:"Max Lightning",Water:"Max Geyser",Fire:"Max Flare",Ghost:"Max Phantasm",Bug:"Max Flutterby",Psychic:"Max Mindstorm",Ice:"Max Hailstorm",Flying:"Max Airstream",Ground:"Max Quake",Fairy:"Max Starfall","???":""};BattleTooltips.incenseTypes={'Odd Incense':'Psychic','Rock Incense':'Rock','Rose Incense':'Grass','Sea Incense':'Water','Wave Incense':'Water'};BattleTooltips.itemTypes={'Black Belt':'Fighting','Black Glasses':'Dark','Charcoal':'Fire','Charming Talisman':'Fairy','Dragon Fang':'Dragon','Hard Stone':'Rock','Magnet':'Electric','Metal Coat':'Steel','Miracle Seed':'Grass','Mystic Water':'Water','Never-Melt Ice':'Ice','Poison Barb':'Poison','Sharp Beak':'Flying','Silk Scarf':'Normal','Silver Powder':'Bug','Soft Sand':'Ground','Spell Tag':'Ghost','Twisted Spoon':'Psychic'};BattleTooltips.orbUsers={'Latias':['Soul Dew'],'Latios':['Soul Dew'],'Dialga':['Adamant Crystal','Adamant Orb'],'Palkia':['Lustrous Globe','Lustrous Orb'],'Giratina':['Griseous Core','Griseous Orb'],'Venomicon':['Vile Vial']};BattleTooltips.orbTypes={'Soul Dew':['Psychic','Dragon'],'Adamant Crystal':['Steel','Dragon'],'Adamant Orb':['Steel','Dragon'],'Lustrous Globe':['Water','Dragon'],'Lustrous Orb':['Water','Dragon'],'Griseous Core':['Ghost','Dragon'],'Griseous Orb':['Ghost','Dragon'],'Vile Vial':['Poison','Flying']};BattleTooltips.noGemMoves=['Fire Pledge','Fling','Grass Pledge','Struggle','Water Pledge'];var












































BattleStatGuesser=function(){









function BattleStatGuesser(formatid){this.formatid=void 0;this.dex=void 0;this.moveCount=null;this.hasMove=null;this.ignoreEVLimits=void 0;this.supportsEVs=void 0;this.supportsAVs=void 0;
this.formatid=formatid;
this.dex=formatid?Dex.mod(formatid.slice(0,4)):Dex;
this.ignoreEVLimits=
this.dex.gen<3||
(this.formatid.endsWith('hackmons')||this.formatid.endsWith('bh'))&&this.dex.gen!==6||
this.formatid.includes('metronomebattle')||
this.formatid.endsWith('norestrictions');

this.supportsEVs=!this.formatid.includes('letsgo');
this.supportsAVs=!this.supportsEVs&&this.formatid.endsWith('norestrictions');
}var _proto3=BattleStatGuesser.prototype;_proto3.
guess=function guess(set){
var role=this.guessRole(set);
var comboEVs=this.guessEVs(set,role);
var evs={hp:0,atk:0,def:0,spa:0,spd:0,spe:0};
for(var stat in evs){
evs[stat]=comboEVs[stat]||0;
}
var plusStat=comboEVs.plusStat||'';
var minusStat=comboEVs.minusStat||'';
return{role:role,evs:evs,plusStat:plusStat,minusStat:minusStat,moveCount:this.moveCount,hasMove:this.hasMove};
};_proto3.
guessRole=function guessRole(set){
if(!set)return'?';
if(!set.moves)return'?';

var moveCount={
'Physical':0,
'Special':0,
'PhysicalAttack':0,
'SpecialAttack':0,
'PhysicalSetup':0,
'SpecialSetup':0,
'Support':0,
'Setup':0,
'Restoration':0,
'Offense':0,
'Stall':0,
'SpecialStall':0,
'PhysicalStall':0,
'Fast':0,
'Ultrafast':0,
'bulk':0,
'specialBulk':0,
'physicalBulk':0
};
var hasMove={};
var itemid=toID(set.item);
var item=this.dex.items.get(itemid);
var abilityid=toID(set.ability);

var species=this.dex.species.get(set.species||set.name);
if(item.megaEvolves===species.name)species=this.dex.species.get(item.megaStone);
if(!species.exists)return'?';
var stats=species.baseStats;

if(set.moves.length<1)return'?';
var needsFourMoves=!['unown','ditto'].includes(species.id);
var moveids=set.moves.map(toID);
if(moveids.includes('lastresort'))needsFourMoves=false;
if(set.moves.length<4&&needsFourMoves&&!this.formatid.includes('metronomebattle')){
return'?';
}

for(var i=0,len=set.moves.length;i<len;i++){
var move=this.dex.moves.get(set.moves[i]);
hasMove[move.id]=1;
if(move.category==='Status'){
if(['batonpass','healingwish','lunardance'].includes(move.id)){
moveCount['Support']++;
}else if(['metronome','assist','copycat','mefirst','photongeyser','shellsidearm'].includes(move.id)){
moveCount['Physical']+=0.5;
moveCount['Special']+=0.5;
}else if(move.id==='naturepower'){
moveCount['Special']++;
}else if(['protect','detect','spikyshield','kingsshield'].includes(move.id)){
moveCount['Stall']++;
}else if(move.id==='wish'){
moveCount['Restoration']++;
moveCount['Stall']++;
moveCount['Support']++;
}else if(move.heal){
moveCount['Restoration']++;
moveCount['Stall']++;
}else if(move.target==='self'){
if(['agility','rockpolish','shellsmash','growth','workup'].includes(move.id)){
moveCount['PhysicalSetup']++;
moveCount['SpecialSetup']++;
}else if(['dragondance','swordsdance','coil','bulkup','curse','bellydrum'].includes(move.id)){
moveCount['PhysicalSetup']++;
}else if(['nastyplot','tailglow','quiverdance','calmmind','geomancy'].includes(move.id)){
moveCount['SpecialSetup']++;
}
if(move.id==='substitute')moveCount['Stall']++;
moveCount['Setup']++;
}else{
if(['toxic','leechseed','willowisp'].includes(move.id)){
moveCount['Stall']++;
}
moveCount['Support']++;
}
}else if(['counter','endeavor','metalburst','mirrorcoat','rapidspin'].includes(move.id)){
moveCount['Support']++;
}else if([
'nightshade','seismictoss','psywave','superfang','naturesmadness','foulplay','endeavor','finalgambit','bodypress'].
includes(move.id)){
moveCount['Offense']++;
}else if(move.id==='fellstinger'){
moveCount['PhysicalSetup']++;
moveCount['Setup']++;
}else{
moveCount[move.category]++;
moveCount['Offense']++;
if(move.id==='knockoff'){
moveCount['Support']++;
}
if(['scald','voltswitch','uturn','flipturn'].includes(move.id)){
moveCount[move.category]-=0.2;
}
}
}
if(hasMove['batonpass'])moveCount['Support']+=moveCount['Setup'];
moveCount['PhysicalAttack']=moveCount['Physical'];
moveCount['Physical']+=moveCount['PhysicalSetup'];
moveCount['SpecialAttack']=moveCount['Special'];
moveCount['Special']+=moveCount['SpecialSetup'];

if(hasMove['dragondance']||hasMove['quiverdance'])moveCount['Ultrafast']=1;

var isFast=stats.spe>=80;
var physicalBulk=(stats.hp+75)*(stats.def+87);
var specialBulk=(stats.hp+75)*(stats.spd+87);

if(hasMove['willowisp']||hasMove['acidarmor']||hasMove['irondefense']||hasMove['cottonguard']){
physicalBulk*=1.6;
moveCount['PhysicalStall']++;
}else if(hasMove['scald']||hasMove['bulkup']||hasMove['coil']||hasMove['cosmicpower']){
physicalBulk*=1.3;
if(hasMove['scald']){
moveCount['SpecialStall']++;
}else{
moveCount['PhysicalStall']++;
}
}
if(abilityid==='flamebody')physicalBulk*=1.1;

if(hasMove['calmmind']||hasMove['quiverdance']||hasMove['geomancy']){
specialBulk*=1.3;
moveCount['SpecialStall']++;
}
if(abilityid==='sandstream'&&species.types.includes('Rock')){
specialBulk*=1.5;
}

if(hasMove['bellydrum']){
physicalBulk*=0.6;
specialBulk*=0.6;
}
if(moveCount['Restoration']){
physicalBulk*=1.5;
specialBulk*=1.5;
}else if(hasMove['painsplit']&&hasMove['substitute']){

moveCount['Stall']--;
}else if(hasMove['painsplit']||hasMove['rest']){
physicalBulk*=1.4;
specialBulk*=1.4;
}
if((hasMove['bodyslam']||hasMove['thunder'])&&abilityid==='serenegrace'||hasMove['thunderwave']){
physicalBulk*=1.1;
specialBulk*=1.1;
}
if((hasMove['ironhead']||hasMove['airslash'])&&abilityid==='serenegrace'){
physicalBulk*=1.1;
specialBulk*=1.1;
}
if(hasMove['gigadrain']||hasMove['drainpunch']||hasMove['hornleech']){
physicalBulk*=1.15;
specialBulk*=1.15;
}
if(itemid==='leftovers'||itemid==='blacksludge'){
physicalBulk*=1+0.1*(1+moveCount['Stall']/1.5);
specialBulk*=1+0.1*(1+moveCount['Stall']/1.5);
}
if(hasMove['leechseed']){
physicalBulk*=1+0.1*(1+moveCount['Stall']/1.5);
specialBulk*=1+0.1*(1+moveCount['Stall']/1.5);
}
if((itemid==='flameorb'||itemid==='toxicorb')&&abilityid!=='magicguard'){
if(itemid==='toxicorb'&&abilityid==='poisonheal'){
physicalBulk*=1+0.1*(2+moveCount['Stall']);
specialBulk*=1+0.1*(2+moveCount['Stall']);
}else{
physicalBulk*=0.8;
specialBulk*=0.8;
}
}
if(itemid==='lifeorb'){
physicalBulk*=0.7;
specialBulk*=0.7;
}
if(abilityid==='multiscale'||abilityid==='magicguard'||abilityid==='regenerator'){
physicalBulk*=1.4;
specialBulk*=1.4;
}
if(itemid==='eviolite'){
physicalBulk*=1.5;
specialBulk*=1.5;
}
if(itemid==='assaultvest'){
specialBulk*=1.5;
}

var bulk=physicalBulk+specialBulk;
if(bulk<46000&&stats.spe>=70)isFast=true;
if(hasMove['trickroom'])isFast=false;
moveCount['bulk']=bulk;
moveCount['physicalBulk']=physicalBulk;
moveCount['specialBulk']=specialBulk;

if(
hasMove['agility']||hasMove['dragondance']||hasMove['quiverdance']||
hasMove['rockpolish']||hasMove['shellsmash']||hasMove['flamecharge'])
{
isFast=true;
}else if(abilityid==='unburden'||abilityid==='speedboost'||abilityid==='motordrive'){
isFast=true;
moveCount['Ultrafast']=1;
}else if(abilityid==='chlorophyll'||abilityid==='swiftswim'||abilityid==='sandrush'){
isFast=true;
moveCount['Ultrafast']=2;
}else if(itemid==='salacberry'){
isFast=true;
}
var ultrafast=hasMove['agility']||hasMove['shellsmash']||
hasMove['autotomize']||hasMove['shiftgear']||hasMove['rockpolish'];
if(ultrafast){
moveCount['Ultrafast']=2;
}
moveCount['Fast']=isFast?1:0;

this.moveCount=moveCount;
this.hasMove=hasMove;

if(species.id==='ditto')return abilityid==='imposter'?'Physically Defensive':'Fast Bulky Support';
if(species.id==='shedinja')return'Fast Physical Sweeper';

if(itemid==='choiceband'&&moveCount['PhysicalAttack']>=2){
if(!isFast)return'Bulky Band';
return'Fast Band';
}else if(itemid==='choicespecs'&&moveCount['SpecialAttack']>=2){
if(!isFast)return'Bulky Specs';
return'Fast Specs';
}else if(itemid==='choicescarf'){
if(moveCount['PhysicalAttack']===0)return'Special Scarf';
if(moveCount['SpecialAttack']===0)return'Physical Scarf';
if(moveCount['PhysicalAttack']>moveCount['SpecialAttack'])return'Physical Biased Mixed Scarf';
if(moveCount['PhysicalAttack']<moveCount['SpecialAttack'])return'Special Biased Mixed Scarf';
if(stats.atk<stats.spa)return'Special Biased Mixed Scarf';
return'Physical Biased Mixed Scarf';
}

if(species.id==='unown')return'Fast Special Sweeper';

if(moveCount['PhysicalStall']&&moveCount['Restoration']){
if(stats.spe>110&&abilityid!=='prankster')return'Fast Bulky Support';
return'Specially Defensive';
}
if(moveCount['SpecialStall']&&moveCount['Restoration']&&itemid!=='lifeorb'){
if(stats.spe>110&&abilityid!=='prankster')return'Fast Bulky Support';
return'Physically Defensive';
}

var offenseBias='Physical';
if(stats.spa>stats.atk&&moveCount['Special']>1)offenseBias='Special';else
if(stats.atk>stats.spa&&moveCount['Physical']>1)offenseBias='Physical';else
if(moveCount['Special']>moveCount['Physical'])offenseBias='Special';

if(moveCount['Stall']+moveCount['Support']/2<=2&&bulk<135000&&moveCount[offenseBias]>=1.5){
if(isFast){
if(bulk>80000&&!moveCount['Ultrafast'])return'Bulky '+offenseBias+' Sweeper';
return'Fast '+offenseBias+' Sweeper';
}else{
if(moveCount[offenseBias]>=3||moveCount['Stall']<=0){
return'Bulky '+offenseBias+' Sweeper';
}
}
}

if(isFast&&abilityid!=='prankster'){
if(stats.spe>100||bulk<55000||moveCount['Ultrafast']){
return'Fast Bulky Support';
}
}
if(moveCount['SpecialStall'])return'Physically Defensive';
if(moveCount['PhysicalStall'])return'Specially Defensive';
if(species.id==='blissey'||species.id==='chansey')return'Physically Defensive';
if(specialBulk>=physicalBulk)return'Specially Defensive';
return'Physically Defensive';
};_proto3.
ensureMinEVs=function ensureMinEVs(evs,stat,min,evTotal){
if(!evs[stat])evs[stat]=0;
var diff=min-evs[stat];
if(diff<=0)return evTotal;
if(evTotal<=504){
var change=Math.min(508-evTotal,diff);
evTotal+=change;
evs[stat]+=change;
diff-=change;
}
if(diff<=0)return evTotal;
var evPriority={def:1,spd:1,hp:1,atk:1,spa:1,spe:1};
var prioStat;
for(prioStat in evPriority){
if(prioStat===stat)continue;
if(evs[prioStat]&&evs[prioStat]>128){
evs[prioStat]-=diff;
evs[stat]+=diff;
return evTotal;
}
}
return evTotal;
};_proto3.
ensureMaxEVs=function ensureMaxEVs(evs,stat,min,evTotal){
if(!evs[stat])evs[stat]=0;
var diff=evs[stat]-min;
if(diff<=0)return evTotal;
evs[stat]-=diff;
evTotal-=diff;
return evTotal;
};_proto3.
guessEVs=function guessEVs(set,role){
if(!set)return{};
if(role==='?')return{};
var species=this.dex.species.get(set.species||set.name);
var stats=species.baseStats;

var hasMove=this.hasMove;
var moveCount=this.moveCount;

var evs={
hp:0,atk:0,def:0,spa:0,spd:0,spe:0
};
var plusStat='';
var minusStat='';

var statChart={
'Bulky Band':['atk','hp'],
'Fast Band':['spe','atk'],
'Bulky Specs':['spa','hp'],
'Fast Specs':['spe','spa'],
'Physical Scarf':['spe','atk'],
'Special Scarf':['spe','spa'],
'Physical Biased Mixed Scarf':['spe','atk'],
'Special Biased Mixed Scarf':['spe','spa'],
'Fast Physical Sweeper':['spe','atk'],
'Fast Special Sweeper':['spe','spa'],
'Bulky Physical Sweeper':['atk','hp'],
'Bulky Special Sweeper':['spa','hp'],
'Fast Bulky Support':['spe','hp'],
'Physically Defensive':['def','hp'],
'Specially Defensive':['spd','hp']
};

plusStat=statChart[role][0];
if(role==='Fast Bulky Support')moveCount['Ultrafast']=0;
if(plusStat==='spe'&&moveCount['Ultrafast']){
if(statChart[role][1]==='atk'||statChart[role][1]==='spa'){
plusStat=statChart[role][1];
}else if(moveCount['Physical']>=3){
plusStat='atk';
}else if(stats.spd>stats.def){
plusStat='spd';
}else{
plusStat='def';
}
}

if(this.supportsAVs){

evs={hp:200,atk:200,def:200,spa:200,spd:200,spe:200};
if(!moveCount['PhysicalAttack'])evs.atk=0;
if(!moveCount['SpecialAttack'])evs.spa=0;
if(hasMove['gyroball']||hasMove['trickroom'])evs.spe=0;
}else if(!this.supportsEVs){


}else if(this.ignoreEVLimits){

evs={hp:252,atk:252,def:252,spa:252,spd:252,spe:252};
if(!moveCount['PhysicalAttack'])evs.atk=0;
if(!moveCount['SpecialAttack']&&this.dex.gen>1)evs.spa=0;
if(hasMove['gyroball']||hasMove['trickroom'])evs.spe=0;
if(this.dex.gen===1)evs.spd=0;
if(this.dex.gen<3)return evs;
}else{

if(!statChart[role])return{};

var evTotal=0;

var primaryStat=statChart[role][0];
var stat=this.getStat(primaryStat,set,252,plusStat===primaryStat?1.1:1.0);
var ev=252;
while(ev>0&&stat<=this.getStat(primaryStat,set,ev-4,plusStat===primaryStat?1.1:1.0))ev-=4;
evs[primaryStat]=ev;
evTotal+=ev;

var secondaryStat=statChart[role][1];
if(secondaryStat==='hp'&&set.level&&set.level<20)secondaryStat='spd';
stat=this.getStat(secondaryStat,set,252,plusStat===secondaryStat?1.1:1.0);
ev=252;
while(ev>0&&stat<=this.getStat(secondaryStat,set,ev-4,plusStat===secondaryStat?1.1:1.0))ev-=4;
evs[secondaryStat]=ev;
evTotal+=ev;

var SRweaknesses=['Fire','Flying','Bug','Ice'];
var SRresistances=['Ground','Steel','Fighting'];
var SRweak=0;
if(set.ability!=='Magic Guard'&&set.ability!=='Mountaineer'){
if(SRweaknesses.indexOf(species.types[0])>=0){
SRweak++;
}else if(SRresistances.indexOf(species.types[0])>=0){
SRweak--;
}
if(SRweaknesses.indexOf(species.types[1])>=0){
SRweak++;
}else if(SRresistances.indexOf(species.types[1])>=0){
SRweak--;
}
}
var hpDivisibility=0;
var hpShouldBeDivisible=false;
var hp=evs['hp']||0;
stat=this.getStat('hp',set,hp,1);
if((set.item==='Leftovers'||set.item==='Black Sludge')&&hasMove['substitute']&&stat!==404){
hpDivisibility=4;
}else if(set.item==='Leftovers'||set.item==='Black Sludge'){
hpDivisibility=0;
}else if(hasMove['bellydrum']&&(set.item||'').slice(-5)==='Berry'){
hpDivisibility=2;
hpShouldBeDivisible=true;
}else if(hasMove['substitute']&&(set.item||'').slice(-5)==='Berry'){
hpDivisibility=4;
hpShouldBeDivisible=true;
}else if(SRweak>=2||hasMove['bellydrum']){
hpDivisibility=2;
}else if(SRweak>=1||hasMove['substitute']||hasMove['transform']){
hpDivisibility=4;
}else if(set.ability!=='Magic Guard'){
hpDivisibility=8;
}

if(hpDivisibility){
while(hp<252&&evTotal<508&&!(stat%hpDivisibility)!==hpShouldBeDivisible){
hp+=4;
stat=this.getStat('hp',set,hp,1);
evTotal+=4;
}
while(hp>0&&!(stat%hpDivisibility)!==hpShouldBeDivisible){
hp-=4;
stat=this.getStat('hp',set,hp,1);
evTotal-=4;
}
while(hp>0&&stat===this.getStat('hp',set,hp-4,1)){
hp-=4;
evTotal-=4;
}
if(hp||evs['hp'])evs['hp']=hp;
}

if(species.id==='tentacruel'){
evTotal=this.ensureMinEVs(evs,'spe',16,evTotal);
}else if(species.id==='skarmory'){
evTotal=this.ensureMinEVs(evs,'spe',24,evTotal);
}else if(species.id==='jirachi'){
evTotal=this.ensureMinEVs(evs,'spe',32,evTotal);
}else if(species.id==='celebi'){
evTotal=this.ensureMinEVs(evs,'spe',36,evTotal);
}else if(species.id==='volcarona'){
evTotal=this.ensureMinEVs(evs,'spe',52,evTotal);
}else if(species.id==='gliscor'){
evTotal=this.ensureMinEVs(evs,'spe',72,evTotal);
}else if(species.id==='dragonite'&&evs['hp']){
evTotal=this.ensureMaxEVs(evs,'spe',220,evTotal);
}

if(evTotal<508){
var remaining=508-evTotal;
if(remaining>252)remaining=252;
secondaryStat=null;
if(!evs['atk']&&moveCount['PhysicalAttack']>=1){
secondaryStat='atk';
}else if(!evs['spa']&&moveCount['SpecialAttack']>=1){
secondaryStat='spa';
}else if(stats.hp===1&&!evs['def']){
secondaryStat='def';
}else if(stats.def===stats.spd&&!evs['spd']){
secondaryStat='spd';
}else if(!evs['spd']){
secondaryStat='spd';
}else if(!evs['def']){
secondaryStat='def';
}
if(secondaryStat){
ev=remaining;
stat=this.getStat(secondaryStat,set,ev);
while(ev>0&&stat===this.getStat(secondaryStat,set,ev-4))ev-=4;
if(ev)evs[secondaryStat]=ev;
remaining-=ev;
}
if(remaining&&!evs['spe']){
ev=remaining;
stat=this.getStat('spe',set,ev);
while(ev>0&&stat===this.getStat('spe',set,ev-4))ev-=4;
if(ev)evs['spe']=ev;
}
}

}

if(hasMove['gyroball']||hasMove['trickroom']){
minusStat='spe';
}else if(!moveCount['PhysicalAttack']){
minusStat='atk';
}else if(moveCount['SpecialAttack']<1&&!evs['spa']){
if(moveCount['SpecialAttack']<moveCount['PhysicalAttack']){
minusStat='spa';
}else if(!evs['atk']){
minusStat='atk';
}
}else if(moveCount['PhysicalAttack']<1&&!evs['atk']){
minusStat='atk';
}else if(stats.def>stats.spe&&stats.spd>stats.spe&&!evs['spe']){
minusStat='spe';
}else if(stats.def>stats.spd){
minusStat='spd';
}else{
minusStat='def';
}

if(plusStat===minusStat){
minusStat=plusStat==='spe'?'spd':'spe';
}

evs.plusStat=plusStat;
evs.minusStat=minusStat;

return evs;
};_proto3.

getStat=function getStat(stat,set,evOverride,natureOverride){var _BattleNatures,_BattleNatures2;
var species=this.dex.species.get(set.species);
if(!species.exists)return 0;

var level=set.level||100;

var baseStat=species.baseStats[stat];

var iv=set.ivs&&set.ivs[stat];
if(typeof iv!=='number')iv=31;
if(this.dex.gen<=2)iv&=30;

var ev=set.evs&&set.evs[stat];
if(typeof ev!=='number')ev=this.dex.gen>2?0:252;
if(evOverride!==undefined)ev=evOverride;

if(stat==='hp'){
if(baseStat===1)return 1;
if(!this.supportsEVs)return~~(~~(2*baseStat+iv+100)*level/100+10)+(this.supportsAVs?ev:0);
return~~(~~(2*baseStat+iv+~~(ev/4)+100)*level/100+10);
}
var val=~~(~~(2*baseStat+iv+~~(ev/4))*level/100+5);
if(!this.supportsEVs){
val=~~(~~(2*baseStat+iv)*level/100+5);
}
if(natureOverride){
val*=natureOverride;
}else if(((_BattleNatures=BattleNatures[set.nature])==null?void 0:_BattleNatures.plus)===stat){
val*=1.1;
}else if(((_BattleNatures2=BattleNatures[set.nature])==null?void 0:_BattleNatures2.minus)===stat){
val*=0.9;
}
if(!this.supportsEVs){
var friendshipValue=~~((70/255/10+1)*100);
val=~~val*friendshipValue/100+(this.supportsAVs?ev:0);
}
return~~val;
};return BattleStatGuesser;}();


if(typeof require==='function'){

global.BattleStatGuesser=BattleStatGuesser;
}
//# sourceMappingURL=battle-tooltips.js.map