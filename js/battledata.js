/**
 * Pokemon Showdown Dex
 *
 * Roughly equivalent to sim/dex.js in a Pokemon Showdown server, but
 * designed for use in browsers rather than in Node.
 *
 * This is a generic utility library for Pokemon Showdown code: any
 * code shared between the replay viewer and the client usually ends up
 * here.
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * Compiled into battledata.js which includes all dependencies
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */




if(typeof window==='undefined'){

global.window=global;
}else{

window.exports=window;
}


window.nodewebkit=!!(typeof process!=='undefined'&&process.versions&&process.versions['node-webkit']);

function toID(text){var _text,_text2;
if((_text=text)!=null&&_text.id){
text=text.id;
}else if((_text2=text)!=null&&_text2.userid){
text=text.userid;
}
if(typeof text!=='string'&&typeof text!=='number')return'';
return(''+text).toLowerCase().replace(/[^a-z0-9]+/g,'');
}

function toUserid(text){
return toID(text);
}


var PSUtils=new(function(){function _class(){}var _proto=_class.prototype;_proto.










splitFirst=function splitFirst(str,delimiter){var limit=arguments.length>2&&arguments[2]!==undefined?arguments[2]:1;
var splitStr=[];
while(splitStr.length<limit){
var delimiterIndex=str.indexOf(delimiter);
if(delimiterIndex>=0){
splitStr.push(str.slice(0,delimiterIndex));
str=str.slice(delimiterIndex+delimiter.length);
}else{
splitStr.push(str);
str='';
}
}
splitStr.push(str);
return splitStr;
};_proto.












compare=function compare(a,b){
if(typeof a==='number'){
return a-b;
}
if(typeof a==='string'){
return a.localeCompare(b);
}
if(typeof a==='boolean'){
return(a?1:2)-(b?1:2);
}
if(Array.isArray(a)){
for(var i=0;i<a.length;i++){
var comparison=PSUtils.compare(a[i],b[i]);
if(comparison)return comparison;
}
return 0;
}
if(a.reverse){
return PSUtils.compare(b.reverse,a.reverse);
}
throw new Error("Passed value "+a+" is not comparable");
};_proto.












sortBy=function sortBy(array,callback){
if(!callback)return array.sort(PSUtils.compare);
return array.sort(function(a,b){return PSUtils.compare(callback(a),callback(b));});
};return _class;}())(
);





function toRoomid(roomid){
return roomid.replace(/[^a-zA-Z0-9-]+/g,'').toLowerCase();
}

function toName(name){
if(typeof name!=='string'&&typeof name!=='number')return'';
name=(''+name).replace(/[\|\s\[\]\,\u202e]+/g,' ').trim();
if(name.length>18)name=name.substr(0,18).trim();


name=name.replace(
/[\u0300-\u036f\u0483-\u0489\u0610-\u0615\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06ED\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]{3,}/g,
''
);
name=name.replace(/[\u239b-\u23b9]/g,'');

return name;
}






















var Dex=new(function(){function _class3(){var _this=this;this.
gen=9;this.
modid='gen9';this.
cache=null;this.

statNames=['hp','atk','def','spa','spd','spe'];this.
statNamesExceptHP=['atk','def','spa','spd','spe'];this.

pokeballs=null;this.







resourcePrefix=function(){
return"https://raw.githubusercontent.com/ry42/pokemon-showdown-client/master/";
}();this.

fxPrefix=function(_window$document){
var protocol=((_window$document=window.document)==null||(_window$document=_window$document.location)==null?void 0:_window$document.protocol)!=='http:'?'https:':'';
return protocol+"//"+(window.Config?Config.routes.client:'play.pokemonshowdown.com')+"/fx/";
}();this.

loadedSpriteData={xy:1,bw:0};this.
moddedDexes={};this.











































































moves={
get:function(nameOrMove){
if(nameOrMove&&typeof nameOrMove!=='string'){

return nameOrMove;
}
var name=nameOrMove||'';
var id=toID(nameOrMove);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(!window.BattleMovedex)window.BattleMovedex={};
var data=window.BattleMovedex[id];
if(data&&typeof data.exists==='boolean')return data;

if(!data&&id.substr(0,11)==='hiddenpower'&&id.length>11){
var _ref=/([a-z]*)([0-9]*)/.exec(id),hpWithType=_ref[1],hpPower=_ref[2];
data=Object.assign({},
window.BattleMovedex[hpWithType]||{},{
basePower:Number(hpPower)||60});

}
if(!data&&id.substr(0,6)==='return'&&id.length>6){
data=Object.assign({},
window.BattleMovedex['return']||{},{
basePower:Number(id.slice(6))});

}
if(!data&&id.substr(0,11)==='frustration'&&id.length>11){
data=Object.assign({},
window.BattleMovedex['frustration']||{},{
basePower:Number(id.slice(11))});

}

if(!data)data={exists:false};
var move=new Move(id,name,data);
window.BattleMovedex[id]=move;
return move;
}
};this.







items={
get:function(nameOrItem){
if(nameOrItem&&typeof nameOrItem!=='string'){

return nameOrItem;
}
var name=nameOrItem||'';
var id=toID(nameOrItem);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(!window.BattleItems)window.BattleItems={};
var data=window.BattleItems[id];
if(data&&typeof data.exists==='boolean')return data;
if(!data)data={exists:false};
var item=new Item(id,name,data);
window.BattleItems[id]=item;
return item;
}
};this.

abilities={
get:function(nameOrAbility){
if(nameOrAbility&&typeof nameOrAbility!=='string'){

return nameOrAbility;
}
var name=nameOrAbility||'';
var id=toID(nameOrAbility);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(!window.BattleAbilities)window.BattleAbilities={};
var data=window.BattleAbilities[id];
if(data&&typeof data.exists==='boolean')return data;
if(!data)data={exists:false};
var ability=new Ability(id,name,data);
window.BattleAbilities[id]=ability;
return ability;
}
};this.

species={
get:function(nameOrSpecies){
if(nameOrSpecies&&typeof nameOrSpecies!=='string'){

return nameOrSpecies;
}
var name=nameOrSpecies||'';
var id=toID(nameOrSpecies);
var formid=id;
if(!window.BattlePokedexAltForms)window.BattlePokedexAltForms={};
if(formid in window.BattlePokedexAltForms)return window.BattlePokedexAltForms[formid];
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}else if(window.BattlePokedex&&!(id in BattlePokedex)&&window.BattleBaseSpeciesChart){for(var _i2=0,_BattleBaseSpeciesCha2=
BattleBaseSpeciesChart;_i2<_BattleBaseSpeciesCha2.length;_i2++){var baseSpeciesId=_BattleBaseSpeciesCha2[_i2];
if(formid.startsWith(baseSpeciesId)){
id=baseSpeciesId;
break;
}
}
}
if(!window.BattlePokedex)window.BattlePokedex={};
var data=window.BattlePokedex[id];

var species;
if(data&&typeof data.exists==='boolean'){
species=data;
}else{
if(!data)data={exists:false};
if(!data.tier&&id.slice(-5)==='totem'){
data.tier=_this.species.get(id.slice(0,-5)).tier;
}
if(!data.tier&&data.baseSpecies&&toID(data.baseSpecies)!==id){
data.tier=_this.species.get(data.baseSpecies).tier;
}
species=new Species(id,name,data);
window.BattlePokedex[id]=species;
}

if(species.cosmeticFormes){for(var _i4=0,_species$cosmeticForm2=
species.cosmeticFormes;_i4<_species$cosmeticForm2.length;_i4++){var forme=_species$cosmeticForm2[_i4];
if(toID(forme)===formid){
species=new Species(formid,name,Object.assign({},
species,{
name:forme,
forme:forme.slice(species.name.length+1),
baseForme:"",
baseSpecies:species.name,
otherFormes:null})
);
window.BattlePokedexAltForms[formid]=species;
break;
}
}
}

return species;
}
};this.

types={
allCache:null,
get:function(type){
if(!type||typeof type==='string'){
var id=toID(type);
var name=id.substr(0,1).toUpperCase()+id.substr(1);
type=window.BattleTypeChart&&window.BattleTypeChart[id]||{};
if(type.damageTaken)type.exists=true;
if(!type.id)type.id=id;
if(!type.name)type.name=name;
if(!type.effectType){
type.effectType='Type';
}
}
return type;
},
all:function(){
if(_this.types.allCache)return _this.types.allCache;
var types=[];
for(var id in window.BattleTypeChart||{}){
types.push(Dex.types.get(id));
}
if(types.length)_this.types.allCache=types;
return types;
},
isName:function(name){
var id=toID(name);
if(name!==id.substr(0,1).toUpperCase()+id.substr(1))return false;
return(window.BattleTypeChart||{}).hasOwnProperty(id);
}
};}var _proto2=_class3.prototype;_proto2.mod=function mod(modid){if(modid==='gen9')return this;if(!window.BattleTeambuilderTable)return this;if(modid in this.moddedDexes){return this.moddedDexes[modid];}this.moddedDexes[modid]=new ModdedDex(modid);return this.moddedDexes[modid];};_proto2.forGen=function forGen(gen){if(!gen)return this;return this.mod("gen"+gen);};_proto2.resolveAvatar=function resolveAvatar(avatar){var _window$Config;if(window.BattleAvatarNumbers&&avatar in BattleAvatarNumbers){avatar=BattleAvatarNumbers[avatar];}if(avatar.charAt(0)==='#'){return Dex.resourcePrefix+'sprites/trainers-custom/'+toID(avatar.substr(1))+'.png';}if(avatar.includes('.')&&(_window$Config=window.Config)!=null&&(_window$Config=_window$Config.server)!=null&&_window$Config.registered){var protocol=Config.server.port===443?'https':'http';return protocol+'://'+Config.server.host+':'+Config.server.port+'/avatars/'+encodeURIComponent(avatar).replace(/\%3F/g,'?');}return Dex.resourcePrefix+'sprites/trainers/'+Dex.sanitizeName(avatar||'unknown')+'.png';};_proto2.sanitizeName=function sanitizeName(name){if(!name)return'';return(''+name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').slice(0,50);};_proto2.prefs=function prefs(prop){var _window$Storage;return(_window$Storage=window.Storage)==null||_window$Storage.prefs==null?void 0:_window$Storage.prefs(prop);};_proto2.getShortName=function getShortName(name){var shortName=name.replace(/[^A-Za-z0-9]+$/,'');if(shortName.indexOf('(')>=0){shortName+=name.slice(shortName.length).replace(/[^\(\)]+/g,'').replace(/\(\)/g,'');}return shortName;};_proto2.getEffect=function getEffect(name){name=(name||'').trim();if(name.substr(0,5)==='item:'){return Dex.items.get(name.substr(5).trim());}else if(name.substr(0,8)==='ability:'){return Dex.abilities.get(name.substr(8).trim());}else if(name.substr(0,5)==='move:'){return Dex.moves.get(name.substr(5).trim());}var id=toID(name);return new PureEffect(id,name);};_proto2.getGen3Category=function getGen3Category(type){return['Fire','Water','Grass','Electric','Ice','Psychic','Dark','Dragon'].includes(type)?'Special':'Physical';};_proto2.

hasAbility=function hasAbility(species,ability){
for(var i in species.abilities){

if(ability===species.abilities[i])return true;
}
return false;
};_proto2.

loadSpriteData=function loadSpriteData(gen){
if(this.loadedSpriteData[gen])return;
this.loadedSpriteData[gen]=1;

var path=$('script[src*="pokedex-mini.js"]').attr('src')||'';
var qs='?'+(path.split('?')[1]||'');
path=(path.match(/.+?(?=data\/pokedex-mini\.js)/)||[])[0]||'';

var el=document.createElement('script');
el.src=path+'data/pokedex-mini-bw.js'+qs;
document.getElementsByTagName('body')[0].appendChild(el);
};_proto2.
getSpriteData=function getSpriteData(pokemon,isFront)







{var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{gen:6};
var mechanicsGen=options.gen||6;
var isDynamax=!!options.dynamax;
if(pokemon instanceof Pokemon){
if(pokemon.volatiles.transform){
options.shiny=pokemon.volatiles.transform[2];
options.gender=pokemon.volatiles.transform[3];
}else{
options.shiny=pokemon.shiny;
options.gender=pokemon.gender;
}
var isGigantamax=false;
if(pokemon.volatiles.dynamax){
if(pokemon.volatiles.dynamax[1]){
isGigantamax=true;
}else if(options.dynamax!==false){
isDynamax=true;
}
}
pokemon=pokemon.getSpeciesForme()+(isGigantamax?'-Gmax':'');
}
var species=Dex.species.get(pokemon);

if(species.name.endsWith('-Gmax'))isDynamax=false;
var spriteData={
gen:mechanicsGen,
w:96,
h:96,
y:0,
url:Dex.resourcePrefix+'sprites/',
pixelated:true,
isFrontSprite:false,
cryurl:'',
shiny:options.shiny
};
var name=species.spriteid;
var dir;
var facing;
if(isFront){
spriteData.isFrontSprite=true;
dir='';
facing='front';
}else{
dir='-back';
facing='back';
}












var graphicsGen=mechanicsGen;
if(Dex.prefs('nopastgens'))graphicsGen=6;
if(Dex.prefs('bwgfx')&&graphicsGen>=6)graphicsGen=5;
spriteData.gen=Math.max(graphicsGen,Math.min(species.gen,5));
var baseDir=['','gen1','gen2','gen3','gen4','gen5','','','',''][spriteData.gen];

var animationData=null;
var miscData=null;
var speciesid=species.id;
if(species.isTotem)speciesid=toID(name);
if(baseDir===''&&window.BattlePokemonSprites){
animationData=BattlePokemonSprites[speciesid];
}
if(baseDir==='gen5'&&window.BattlePokemonSpritesBW){
animationData=BattlePokemonSpritesBW[speciesid];
}
if(window.BattlePokemonSprites)miscData=BattlePokemonSprites[speciesid];
if(!miscData&&window.BattlePokemonSpritesBW)miscData=BattlePokemonSpritesBW[speciesid];
if(!animationData)animationData={};
if(!miscData)miscData={};

if(miscData.num!==0&&miscData.num>-5000){
var baseSpeciesid=toID(species.baseSpecies);
spriteData.cryurl='audio/cries/'+baseSpeciesid;
var formeid=species.formeid;
if(species.isMega||formeid&&(
formeid==='-crowned'||
formeid==='-eternal'||
formeid==='-eternamax'||
formeid==='-four'||
formeid==='-hangry'||
formeid==='-hero'||
formeid==='-lowkey'||
formeid==='-noice'||
formeid==='-primal'||
formeid==='-rapidstrike'||
formeid==='-roaming'||
formeid==='-school'||
formeid==='-sky'||
formeid==='-starter'||
formeid==='-super'||
formeid==='-therian'||
formeid==='-unbound'||
baseSpeciesid==='calyrex'||
baseSpeciesid==='kyurem'||
baseSpeciesid==='cramorant'||
baseSpeciesid==='indeedee'||
baseSpeciesid==='lycanroc'||
baseSpeciesid==='necrozma'||
baseSpeciesid==='oinkologne'||
baseSpeciesid==='oricorio'||
baseSpeciesid==='slowpoke'||
baseSpeciesid==='tatsugiri'||
baseSpeciesid==='zygarde'))
{
spriteData.cryurl+=formeid;
}
spriteData.cryurl+='.mp3';
}

if(options.shiny&&mechanicsGen>1)dir+='-shiny';


if(window.Config&&Config.server&&Config.server.afd||options.afd){
dir='afd'+dir;
spriteData.url+=dir+'/'+name+'.png';


if(isDynamax&&!options.noScale){
spriteData.w*=0.25;
spriteData.h*=0.25;
spriteData.y+=-22;
}else if(species.isTotem&&!options.noScale){
spriteData.w*=0.5;
spriteData.h*=0.5;
spriteData.y+=-11;
}
return spriteData;
}


if(options.mod){
spriteData.cryurl="sprites/"+options.mod+"/audio/"+toID(species.baseSpecies);
spriteData.cryurl+='.mp3';
}

if(animationData[facing+'f']&&options.gender==='F')facing+='f';
var allowAnim=!Dex.prefs('noanim')&&!Dex.prefs('nogif');
if(allowAnim&&spriteData.gen>=6)spriteData.pixelated=false;
if(allowAnim&&animationData[facing]&&spriteData.gen>=5){
if(facing.slice(-1)==='f')name+='-f';
dir=baseDir+'ani'+dir;

spriteData.w=animationData[facing].w;
spriteData.h=animationData[facing].h;
spriteData.url+=dir+'/'+name+'.gif';
}else{


dir=(baseDir||'gen5')+dir;



if(spriteData.gen>=4&&miscData['frontf']&&options.gender==='F'){
name+='-f';
}

spriteData.url+=dir+'/'+name+'.png';
}

if(!options.noScale){
if(graphicsGen>4){

}else if(spriteData.isFrontSprite){
spriteData.w*=2;
spriteData.h*=2;
spriteData.y+=-16;
}else{

spriteData.w*=2/1.5;
spriteData.h*=2/1.5;
spriteData.y+=-11;
}
if(spriteData.gen<=2)spriteData.y+=2;
}
if(isDynamax&&!options.noScale){
spriteData.w*=2;
spriteData.h*=2;
spriteData.y+=-22;
}else if(species.isTotem&&!options.noScale){
spriteData.w*=1.5;
spriteData.h*=1.5;
spriteData.y+=-11;
}

return spriteData;
};_proto2.

getPokemonIconNum=function getPokemonIconNum(id,isFemale,facingLeft){var _window$BattlePokemon,_window$BattlePokedex,_window$BattlePokemon2;
var num=0;
if((_window$BattlePokemon=window.BattlePokemonSprites)!=null&&(_window$BattlePokemon=_window$BattlePokemon[id])!=null&&_window$BattlePokemon.num){
num=BattlePokemonSprites[id].num;
}else if((_window$BattlePokedex=window.BattlePokedex)!=null&&(_window$BattlePokedex=_window$BattlePokedex[id])!=null&&_window$BattlePokedex.num){
num=BattlePokedex[id].num;
}
if(num<0)num=0;
if(num>1017)num=0;

if((_window$BattlePokemon2=window.BattlePokemonIconIndexes)!=null&&_window$BattlePokemon2[id]){
num=BattlePokemonIconIndexes[id];
}

if(isFemale){
if(['unfezant','frillish','jellicent','meowstic','pyroar','catteraxe','skinka'].includes(id)){
num=BattlePokemonIconIndexes[id+'f'];
}
}
if(facingLeft){
if(BattlePokemonIconIndexesLeft[id]){
num=BattlePokemonIconIndexesLeft[id];
}
}
return num;
};_proto2.

getPokemonIcon=function getPokemonIcon(pokemon,facingLeft){var _pokemon,_pokemon2,_pokemon3,_pokemon4,_pokemon5;
if(pokemon==='pokeball'){
return"background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-pokeball-sheet.png) no-repeat scroll -0px 4px";
}else if(pokemon==='pokeball-statused'){
return"background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-pokeball-sheet.png) no-repeat scroll -40px 4px";
}else if(pokemon==='pokeball-fainted'){
return"background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-pokeball-sheet.png) no-repeat scroll -80px 4px;opacity:.4;filter:contrast(0)";
}else if(pokemon==='pokeball-none'){
return"background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-pokeball-sheet.png) no-repeat scroll -80px 4px";
}

var id=toID(pokemon);
if(!pokemon||typeof pokemon==='string')pokemon=null;

if((_pokemon=pokemon)!=null&&_pokemon.speciesForme)id=toID(pokemon.speciesForme);

if((_pokemon2=pokemon)!=null&&_pokemon2.species)id=toID(pokemon.species);

if((_pokemon3=pokemon)!=null&&(_pokemon3=_pokemon3.volatiles)!=null&&_pokemon3.formechange&&!pokemon.volatiles.transform){

id=toID(pokemon.volatiles.formechange[1]);
}
var num=this.getPokemonIconNum(id,((_pokemon4=pokemon)==null?void 0:_pokemon4.gender)==='F',facingLeft);

var top=Math.floor(num/12)*30;
var left=num%12*40;
var fainted=(_pokemon5=pokemon)!=null&&_pokemon5.fainted?";opacity:.3;filter:grayscale(100%) brightness(.5)":"";
return"background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-sheet.png?v14) no-repeat scroll -"+left+"px -"+top+"px"+fainted;
};_proto2.

getTeambuilderSpriteData=function getTeambuilderSpriteData(pokemon){var gen=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;
var id=toID(pokemon.species);
var spriteid=pokemon.spriteid;
var species=Dex.species.get(pokemon.species);
if(pokemon.species&&!spriteid){
spriteid=species.spriteid||toID(pokemon.species);
}
if(species.exists===false)return{spriteDir:'sprites/gen5',spriteid:'0',x:10,y:5};
var spriteData={
spriteid:spriteid,
spriteDir:'sprites/dex',
x:-2,
y:-3
};
if(pokemon.shiny)spriteData.shiny=true;
if(Dex.prefs('nopastgens'))gen=6;
if(Dex.prefs('bwgfx')&&gen>5)gen=5;
var xydexExists=!species.isNonstandard||species.isNonstandard==='Past'||species.isNonstandard==='CAP'||[
"pikachustarter","eeveestarter","meltan","melmetal","pokestarufo","pokestarufo2","pokestarbrycenman","pokestarmt","pokestarmt2","pokestargiant","pokestarhumanoid","pokestarmonster","pokestarf00","pokestarf002","pokestarspirit"].
includes(species.id);
if(species.gen===8&&species.isNonstandard!=='CAP')xydexExists=false;
if((!gen||gen>=6)&&xydexExists){
if(species.gen>=7){
spriteData.x=-6;
spriteData.y=-7;
}else if(id.substr(0,6)==='arceus'){
spriteData.x=-2;
spriteData.y=7;
}else if(id==='garchomp'){
spriteData.x=-2;
spriteData.y=2;
}else if(id==='garchompmega'){
spriteData.x=-2;
spriteData.y=0;
}
return spriteData;
}
spriteData.spriteDir='sprites/gen5';
if(gen<=1&&species.gen<=1)spriteData.spriteDir='sprites/gen1';else
if(gen<=2&&species.gen<=2)spriteData.spriteDir='sprites/gen2';else
if(gen<=3&&species.gen<=3)spriteData.spriteDir='sprites/gen3';else
if(gen<=4&&species.gen<=4)spriteData.spriteDir='sprites/gen4';
spriteData.x=10;
spriteData.y=5;
return spriteData;
};_proto2.

getTeambuilderSprite=function getTeambuilderSprite(pokemon){var gen=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;
if(!pokemon)return'';
var data=this.getTeambuilderSpriteData(pokemon,gen);
var shiny=data.shiny?'-shiny':'';
return'background-image:url('+Dex.resourcePrefix+data.spriteDir+shiny+'/'+data.spriteid+'.png);background-position:'+data.x+'px '+data.y+'px;background-repeat:no-repeat';
};_proto2.

getItemIcon=function getItemIcon(item){var _item;
var num=0;
if(typeof item==='string'&&exports.BattleItems)item=exports.BattleItems[toID(item)];
if((_item=item)!=null&&_item.spritenum)num=item.spritenum;

var top=Math.floor(num/16)*24;
var left=num%16*24;
return'background:transparent url('+Dex.resourcePrefix+'sprites/itemicons-sheet.png?v1) no-repeat scroll -'+left+'px -'+top+'px';
};_proto2.

getTypeIcon=function getTypeIcon(type,b){
type=this.types.get(type).name;
if(!type)type='???';
var sanitizedType=type.replace(/\?/g,'%3f');
return"<img src=\""+Dex.resourcePrefix+"sprites/types/"+sanitizedType+".png\" alt=\""+type+"\" height=\"14\" width=\"32\" class=\"pixelated"+(b?' b':'')+"\" />";
};_proto2.

getCategoryIcon=function getCategoryIcon(category){
var categoryID=toID(category);
var sanitizedCategory='';
switch(categoryID){
case'physical':
case'special':
case'status':
sanitizedCategory=categoryID.charAt(0).toUpperCase()+categoryID.slice(1);
break;
default:
sanitizedCategory='undefined';
break;
}
return"<img src=\""+Dex.resourcePrefix+"sprites/categories/"+sanitizedCategory+".png\" alt=\""+sanitizedCategory+"\" height=\"14\" width=\"32\" class=\"pixelated\" />";
};_proto2.

getPokeballs=function getPokeballs(){
if(this.pokeballs)return this.pokeballs;
this.pokeballs=[];
if(!window.BattleItems)window.BattleItems={};for(var _i6=0,_ref3=
Object.values(window.BattleItems);_i6<_ref3.length;_i6++){var data=_ref3[_i6];
if(!data.isPokeball)continue;
this.pokeballs.push(data.name);
}
return this.pokeballs;
};return _class3;}())(
);var

ModdedDex=function(){










function ModdedDex(modid){var _this2=this;this.gen=void 0;this.modid=void 0;this.cache={Moves:{},Items:{},Abilities:{},Species:{},Types:{}};this.pokeballs=null;this.





moves={
get:function(name){
var id=toID(name);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(_this2.cache.Moves.hasOwnProperty(id))return _this2.cache.Moves[id];

var data=Object.assign({},Dex.moves.get(name));

for(var i=Dex.gen-1;i>=_this2.gen;i--){
var table=window.BattleTeambuilderTable["gen"+i];
if(id in table.overrideMoveData){
Object.assign(data,table.overrideMoveData[id]);
}
}
if(_this2.modid!=="gen"+_this2.gen){
var _table=window.BattleTeambuilderTable[_this2.modid];
if(id in _table.overrideMoveData){
Object.assign(data,_table.overrideMoveData[id]);
}
}
if(_this2.gen<=3&&data.category!=='Status'){
data.category=Dex.getGen3Category(data.type);
}

var move=new Move(id,name,data);
_this2.cache.Moves[id]=move;
return move;
}
};this.

items={
get:function(name){
var id=toID(name);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(_this2.cache.Items.hasOwnProperty(id))return _this2.cache.Items[id];

var data=Object.assign({},Dex.items.get(name));

for(var i=_this2.gen;i<9;i++){
var table=window.BattleTeambuilderTable['gen'+i];
if(id in table.overrideItemDesc){
data.shortDesc=table.overrideItemDesc[id];
break;
}
}

var item=new Item(id,name,data);
_this2.cache.Items[id]=item;
return item;
}
};this.

abilities={
get:function(name){
var id=toID(name);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(_this2.cache.Abilities.hasOwnProperty(id))return _this2.cache.Abilities[id];

var data=Object.assign({},Dex.abilities.get(name));

for(var i=Dex.gen-1;i>=_this2.gen;i--){
var table=window.BattleTeambuilderTable["gen"+i];
if(id in table.overrideAbilityData){
Object.assign(data,table.overrideAbilityData[id]);
}
}
if(_this2.modid!=="gen"+_this2.gen){
var _table2=window.BattleTeambuilderTable[_this2.modid];
if(id in _table2.overrideAbilityData){
Object.assign(data,_table2.overrideAbilityData[id]);
}
}

var ability=new Ability(id,name,data);
_this2.cache.Abilities[id]=ability;
return ability;
}
};this.

species={
get:function(name){
var id=toID(name);
if(window.BattleAliases&&id in BattleAliases){
name=BattleAliases[id];
id=toID(name);
}
if(_this2.cache.Species.hasOwnProperty(id))return _this2.cache.Species[id];

var data=Object.assign({},Dex.species.get(name));

for(var i=Dex.gen-1;i>=_this2.gen;i--){
var _table3=window.BattleTeambuilderTable["gen"+i];
if(id in _table3.overrideSpeciesData){
Object.assign(data,_table3.overrideSpeciesData[id]);
}
}
if(_this2.modid!=="gen"+_this2.gen){
var _table4=window.BattleTeambuilderTable[_this2.modid];
if(id in _table4.overrideSpeciesData){
Object.assign(data,_table4.overrideSpeciesData[id]);
}
}
if(_this2.gen<3||_this2.modid==='gen7letsgo'){
data.abilities={0:"No Ability"};
}

var table=window.BattleTeambuilderTable[_this2.modid];
if(id in table.overrideTier)data.tier=table.overrideTier[id];
if(!data.tier&&id.slice(-5)==='totem'){
data.tier=_this2.species.get(id.slice(0,-5)).tier;
}
if(!data.tier&&data.baseSpecies&&toID(data.baseSpecies)!==id){
data.tier=_this2.species.get(data.baseSpecies).tier;
}
if(data.gen>_this2.gen)data.tier='Illegal';

var species=new Species(id,name,data);
_this2.cache.Species[id]=species;
return species;
}
};this.

types={
get:function(name){
var id=toID(name);
name=id.substr(0,1).toUpperCase()+id.substr(1);

if(_this2.cache.Types.hasOwnProperty(id))return _this2.cache.Types[id];

var data=Object.assign({},Dex.types.get(name));

for(var i=7;i>=_this2.gen;i--){
var table=window.BattleTeambuilderTable['gen'+i];
if(id in table.removeType){
data.exists=false;

break;
}
if(id in table.overrideTypeChart){
data=Object.assign({},data,table.overrideTypeChart[id]);
}
}

_this2.cache.Types[id]=data;
return data;
}
};this.modid=modid;var gen=parseInt(modid.substr(3,1),10);if(!modid.startsWith('gen')||!gen)throw new Error("Unsupported modid");this.gen=gen;}var _proto3=ModdedDex.prototype;_proto3.

getPokeballs=function getPokeballs(){
if(this.pokeballs)return this.pokeballs;
this.pokeballs=[];
if(!window.BattleItems)window.BattleItems={};for(var _i8=0,_ref5=
Object.values(window.BattleItems);_i8<_ref5.length;_i8++){var data=_ref5[_i8];
if(data.gen&&data.gen>this.gen)continue;
if(!data.isPokeball)continue;
this.pokeballs.push(data.name);
}
return this.pokeballs;
};return ModdedDex;}();


var Teams=new(function(){function _class5(){}var _proto4=_class5.prototype;_proto4.
unpack=function unpack(buf){
if(!buf)return[];

var team=[];
var i=0;
var j=0;

while(true){
var set={};
team.push(set);


j=buf.indexOf('|',i);
set.name=buf.substring(i,j);
i=j+1;


j=buf.indexOf('|',i);
set.species=Dex.species.get(buf.substring(i,j)).name||set.name;
i=j+1;


j=buf.indexOf('|',i);
set.item=Dex.items.get(buf.substring(i,j)).name;
i=j+1;


j=buf.indexOf('|',i);
var ability=Dex.abilities.get(buf.substring(i,j)).name;
var species=Dex.species.get(set.species);
set.ability=species.abilities&&
['','0','1','H','S'].includes(ability)?species.abilities[ability||'0']:ability;
i=j+1;


j=buf.indexOf('|',i);
set.moves=buf.substring(i,j).split(',').map(function(moveid){
return Dex.moves.get(moveid).name;
});
i=j+1;


j=buf.indexOf('|',i);
set.nature=buf.substring(i,j);
if(set.nature==='undefined')delete set.nature;
i=j+1;


j=buf.indexOf('|',i);
if(j!==i){
var evstring=buf.substring(i,j);
if(evstring.length>5){
var evs=evstring.split(',');
set.evs={
hp:Number(evs[0])||0,
atk:Number(evs[1])||0,
def:Number(evs[2])||0,
spa:Number(evs[3])||0,
spd:Number(evs[4])||0,
spe:Number(evs[5])||0
};
}else if(evstring==='0'){
set.evs={hp:0,atk:0,def:0,spa:0,spd:0,spe:0};
}
}
i=j+1;


j=buf.indexOf('|',i);
if(i!==j)set.gender=buf.substring(i,j);
i=j+1;


j=buf.indexOf('|',i);
if(j!==i){
var ivs=buf.substring(i,j).split(',');
set.ivs={
hp:ivs[0]===''?31:Number(ivs[0]),
atk:ivs[1]===''?31:Number(ivs[1]),
def:ivs[2]===''?31:Number(ivs[2]),
spa:ivs[3]===''?31:Number(ivs[3]),
spd:ivs[4]===''?31:Number(ivs[4]),
spe:ivs[5]===''?31:Number(ivs[5])
};
}
i=j+1;


j=buf.indexOf('|',i);
if(i!==j)set.shiny=true;
i=j+1;


j=buf.indexOf('|',i);
if(i!==j)set.level=parseInt(buf.substring(i,j),10);
i=j+1;


j=buf.indexOf(']',i);
var misc=void 0;
if(j<0){
if(i<buf.length)misc=buf.substring(i).split(',',6);
}else{
if(i!==j)misc=buf.substring(i,j).split(',',6);
}
if(misc){
set.happiness=misc[0]?Number(misc[0]):255;
set.hpType=misc[1];
set.pokeball=misc[2];
set.gigantamax=!!misc[3];
set.dynamaxLevel=misc[4]?Number(misc[4]):10;
set.teraType=misc[5];
}
if(j<0)break;
i=j+1;
}

return team;
};_proto4["export"]=
function _export(team,gen){var hidestats=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;
if(!team)return'';
if(typeof team==='string'){
if(team.indexOf('\n')>=0)return team;
team=this.unpack(team);
}
var text='';for(var _i10=0,_team2=
team;_i10<_team2.length;_i10++){var curSet=_team2[_i10];
if(curSet.name&&curSet.name!==curSet.species){
text+=''+curSet.name+' ('+curSet.species+')';
}else{
text+=''+curSet.species;
}
if(curSet.gender==='M')text+=' (M)';
if(curSet.gender==='F')text+=' (F)';
if(curSet.item){
text+=' @ '+curSet.item;
}
text+="  \n";
if(curSet.ability){
text+='Ability: '+curSet.ability+"  \n";
}
if(curSet.level&&curSet.level!==100){
text+='Level: '+curSet.level+"  \n";
}
if(curSet.shiny){
text+='Shiny: Yes  \n';
}
if(typeof curSet.happiness==='number'&&curSet.happiness!==255&&!isNaN(curSet.happiness)){
text+='Happiness: '+curSet.happiness+"  \n";
}
if(curSet.pokeball){
text+='Pokeball: '+curSet.pokeball+"  \n";
}
if(curSet.hpType){
text+='Hidden Power: '+curSet.hpType+"  \n";
}
if(typeof curSet.dynamaxLevel==='number'&&curSet.dynamaxLevel!==10&&!isNaN(curSet.dynamaxLevel)){
text+='Dynamax Level: '+curSet.dynamaxLevel+"  \n";
}
if(curSet.gigantamax){
text+='Gigantamax: Yes  \n';
}
if(gen===9){
var species=Dex.species.get(curSet.species);
text+='Tera Type: '+(species.forceTeraType||curSet.teraType||species.types[0])+"  \n";
}
if(!hidestats){
var first=true;
if(curSet.evs){
var j=void 0;
for(j in BattleStatNames){
if(!curSet.evs[j])continue;
if(first){
text+='EVs: ';
first=false;
}else{
text+=' / ';
}
text+=''+curSet.evs[j]+' '+BattleStatNames[j];
}
}
if(!first){
text+="  \n";
}
if(curSet.nature){
text+=''+curSet.nature+' Nature'+"  \n";
}
first=true;
if(curSet.ivs){
var defaultIvs=true;
var hpType='';for(var _i12=0,_curSet$moves2=
curSet.moves;_i12<_curSet$moves2.length;_i12++){var move=_curSet$moves2[_i12];
if(move.substr(0,13)==='Hidden Power '&&move.substr(0,14)!=='Hidden Power ['){
hpType=move.substr(13);
if(!Dex.types.isName(hpType)){
alert(move+" is not a valid Hidden Power type.");
continue;
}
var stat=void 0;
for(stat in BattleStatNames){var _Dex$types$get$HPivs;
if((curSet.ivs[stat]===undefined?31:curSet.ivs[stat])!==(((_Dex$types$get$HPivs=Dex.types.get(hpType).HPivs)==null?void 0:_Dex$types$get$HPivs[stat])||31)){
defaultIvs=false;
break;
}
}
}
}
if(defaultIvs&&!hpType){
var _stat=void 0;
for(_stat in BattleStatNames){
if(curSet.ivs[_stat]!==31&&curSet.ivs[_stat]!==undefined){
defaultIvs=false;
break;
}
}
}
if(!defaultIvs){
var _stat2=void 0;
for(_stat2 in BattleStatNames){
if(typeof curSet.ivs[_stat2]==='undefined'||isNaN(curSet.ivs[_stat2])||curSet.ivs[_stat2]===31)continue;
if(first){
text+='IVs: ';
first=false;
}else{
text+=' / ';
}
text+=''+curSet.ivs[_stat2]+' '+BattleStatNames[_stat2];
}
}
}
if(!first){
text+="  \n";
}
}
if(curSet.moves){for(var _i14=0,_curSet$moves4=
curSet.moves;_i14<_curSet$moves4.length;_i14++){var _move=_curSet$moves4[_i14];
if(_move.substr(0,13)==='Hidden Power '){
_move=_move.substr(0,13)+'['+_move.substr(13)+']';
}
if(_move){
text+='- '+_move+"  \n";
}
}
}
text+="\n";
}
return text;
};return _class5;}())(
);

if(typeof require==='function'){

global.Dex=Dex;
global.toID=toID;
}
/**
 * Pokemon Showdown Dex Data
 *
 * A collection of data and definitions for src/battle-dex.ts.
 *
 * Larger data has their own files in data/, so this is just for small
 * miscellaneous data that doesn't need its own file.
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */






var BattleNatures={
Adamant:{
plus:'atk',
minus:'spa'
},
Bashful:{},
Bold:{
plus:'def',
minus:'atk'
},
Brave:{
plus:'atk',
minus:'spe'
},
Calm:{
plus:'spd',
minus:'atk'
},
Careful:{
plus:'spd',
minus:'spa'
},
Docile:{},
Gentle:{
plus:'spd',
minus:'def'
},
Hardy:{},
Hasty:{
plus:'spe',
minus:'def'
},
Impish:{
plus:'def',
minus:'spa'
},
Jolly:{
plus:'spe',
minus:'spa'
},
Lax:{
plus:'def',
minus:'spd'
},
Lonely:{
plus:'atk',
minus:'def'
},
Mild:{
plus:'spa',
minus:'def'
},
Modest:{
plus:'spa',
minus:'atk'
},
Naive:{
plus:'spe',
minus:'spd'
},
Naughty:{
plus:'atk',
minus:'spd'
},
Quiet:{
plus:'spa',
minus:'spe'
},
Quirky:{},
Rash:{
plus:'spa',
minus:'spd'
},
Relaxed:{
plus:'def',
minus:'spe'
},
Sassy:{
plus:'spd',
minus:'spe'
},
Serious:{},
Timid:{
plus:'spe',
minus:'atk'
}
};
var BattleStatIDs={
HP:'hp',
hp:'hp',
Atk:'atk',
atk:'atk',
Def:'def',
def:'def',
SpA:'spa',
SAtk:'spa',
SpAtk:'spa',
spa:'spa',
spc:'spa',
Spc:'spa',
SpD:'spd',
SDef:'spd',
SpDef:'spd',
spd:'spd',
Spe:'spe',
Spd:'spe',
spe:'spe'
};

var BattleStatNames={
hp:'HP',
atk:'Atk',
def:'Def',
spa:'SpA',
spd:'SpD',
spe:'Spe'
};

var BattleBaseSpeciesChart=[
"unown","burmy","shellos","gastrodon","deerling","sawsbuck","vivillon","flabebe","floette","florges","furfrou","minior","alcremie","tatsugiri","pokestarufo","pokestarbrycenman","pokestarmt","pokestarmt2","pokestartransport","pokestargiant","pokestarhumanoid","pokestarmonster","pokestarf00","pokestarf002","pokestarspirit","pokestarblackdoor","pokestarwhitedoor","pokestarblackbelt"];


var BattlePokemonIconIndexes={

egg:1020+1,
pikachubelle:1020+2,
pikachulibre:1020+3,
pikachuphd:1020+4,
pikachupopstar:1020+5,
pikachurockstar:1020+6,
pikachucosplay:1020+7,
unownexclamation:1020+8,
unownquestion:1020+9,
unownb:1020+10,
unownc:1020+11,
unownd:1020+12,
unowne:1020+13,
unownf:1020+14,
unowng:1020+15,
unownh:1020+16,
unowni:1020+17,
unownj:1020+18,
unownk:1020+19,
unownl:1020+20,
unownm:1020+21,
unownn:1020+22,
unowno:1020+23,
unownp:1020+24,
unownq:1020+25,
unownr:1020+26,
unowns:1020+27,
unownt:1020+28,
unownu:1020+29,
unownv:1020+30,
unownw:1020+31,
unownx:1020+32,
unowny:1020+33,
unownz:1020+34,
castformrainy:1020+35,
castformsnowy:1020+36,
castformsunny:1020+37,
deoxysattack:1020+38,
deoxysdefense:1020+39,
deoxysspeed:1020+40,
burmysandy:1020+41,
burmytrash:1020+42,
wormadamsandy:1020+43,
wormadamtrash:1020+44,
cherrimsunshine:1020+45,
shelloseast:1020+46,
gastrodoneast:1020+47,
rotomfan:1020+48,
rotomfrost:1020+49,
rotomheat:1020+50,
rotommow:1020+51,
rotomwash:1020+52,
giratinaorigin:1020+53,
shayminsky:1020+54,
unfezantf:1020+55,
basculinbluestriped:1020+56,
darmanitanzen:1020+57,
deerlingautumn:1020+58,
deerlingsummer:1020+59,
deerlingwinter:1020+60,
sawsbuckautumn:1020+61,
sawsbucksummer:1020+62,
sawsbuckwinter:1020+63,
frillishf:1020+64,
jellicentf:1020+65,
tornadustherian:1020+66,
thundurustherian:1020+67,
landorustherian:1020+68,
kyuremblack:1020+69,
kyuremwhite:1020+70,
keldeoresolute:1020+71,
meloettapirouette:1020+72,
vivillonarchipelago:1020+73,
vivilloncontinental:1020+74,
vivillonelegant:1020+75,
vivillonfancy:1020+76,
vivillongarden:1020+77,
vivillonhighplains:1020+78,
vivillonicysnow:1020+79,
vivillonjungle:1020+80,
vivillonmarine:1020+81,
vivillonmodern:1020+82,
vivillonmonsoon:1020+83,
vivillonocean:1020+84,
vivillonpokeball:1020+85,
vivillonpolar:1020+86,
vivillonriver:1020+87,
vivillonsandstorm:1020+88,
vivillonsavanna:1020+89,
vivillonsun:1020+90,
vivillontundra:1020+91,
pyroarf:1020+92,
flabebeblue:1020+93,
flabebeorange:1020+94,
flabebewhite:1020+95,
flabebeyellow:1020+96,
floetteblue:1020+97,
floetteeternal:1020+98,
floetteorange:1020+99,
floettewhite:1020+100,
floetteyellow:1020+101,
florgesblue:1020+102,
florgesorange:1020+103,
florgeswhite:1020+104,
florgesyellow:1020+105,
furfroudandy:1020+106,
furfroudebutante:1020+107,
furfroudiamond:1020+108,
furfrouheart:1020+109,
furfroukabuki:1020+110,
furfroulareine:1020+111,
furfroumatron:1020+112,
furfroupharaoh:1020+113,
furfroustar:1020+114,
meowsticf:1020+115,
aegislashblade:1020+116,
xerneasneutral:1020+117,
hoopaunbound:1020+118,
rattataalola:1020+119,
raticatealola:1020+120,
raichualola:1020+121,
sandshrewalola:1020+122,
sandslashalola:1020+123,
vulpixalola:1020+124,
ninetalesalola:1020+125,
diglettalola:1020+126,
dugtrioalola:1020+127,
meowthalola:1020+128,
persianalola:1020+129,
geodudealola:1020+130,
graveleralola:1020+131,
golemalola:1020+132,
grimeralola:1020+133,
mukalola:1020+134,
exeggutoralola:1020+135,
marowakalola:1020+136,
greninjaash:1020+137,
zygarde10:1020+138,
zygardecomplete:1020+139,
oricoriopompom:1020+140,
oricoriopau:1020+141,
oricoriosensu:1020+142,
lycanrocmidnight:1020+143,
wishiwashischool:1020+144,
miniormeteor:1020+145,
miniororange:1020+146,
minioryellow:1020+147,
miniorgreen:1020+148,
miniorblue:1020+149,
miniorindigo:1020+150,
miniorviolet:1020+151,
magearnaoriginal:1020+152,
pikachuoriginal:1020+153,
pikachuhoenn:1020+154,
pikachusinnoh:1020+155,
pikachuunova:1020+156,
pikachukalos:1020+157,
pikachualola:1020+158,
pikachupartner:1020+159,
lycanrocdusk:1020+160,
necrozmaduskmane:1020+161,
necrozmadawnwings:1020+162,
necrozmaultra:1020+163,
pikachustarter:1020+164,
eeveestarter:1020+165,
meowthgalar:1020+166,
ponytagalar:1020+167,
rapidashgalar:1020+168,
farfetchdgalar:1020+169,
weezinggalar:1020+170,
mrmimegalar:1020+171,
corsolagalar:1020+172,
zigzagoongalar:1020+173,
linoonegalar:1020+174,
darumakagalar:1020+175,
darmanitangalar:1020+176,
darmanitangalarzen:1020+177,
yamaskgalar:1020+178,
stunfiskgalar:1020+179,
cramorantgulping:1020+180,
cramorantgorging:1020+181,
toxtricitylowkey:1020+182,
alcremierubycream:1020+183,
alcremiematchacream:1020+184,
alcremiemintcream:1020+185,
alcremielemoncream:1020+186,
alcremiesaltedcream:1020+187,
alcremierubyswirl:1020+188,
alcremiecaramelswirl:1020+189,
alcremierainbowswirl:1020+190,
eiscuenoice:1020+191,
indeedeef:1020+192,
morpekohangry:1020+193,
zaciancrowned:1020+194,
zamazentacrowned:1020+195,
slowpokegalar:1020+196,
slowbrogalar:1020+197,
zarudedada:1020+198,
pikachuworld:1020+199,
articunogalar:1020+200,
zapdosgalar:1020+201,
moltresgalar:1020+202,
slowkinggalar:1020+203,
calyrexice:1020+204,
calyrexshadow:1020+205,
growlithehisui:1020+206,
arcaninehisui:1020+207,
voltorbhisui:1020+208,
electrodehisui:1020+209,
typhlosionhisui:1020+210,
qwilfishhisui:1020+211,
sneaselhisui:1020+212,
samurotthisui:1020+213,
lilliganthisui:1020+214,
zoruahisui:1020+215,
zoroarkhisui:1020+216,
braviaryhisui:1020+217,
sliggoohisui:1020+218,
goodrahisui:1020+219,
avalugghisui:1020+220,
decidueyehisui:1020+221,
basculegionf:1020+222,
enamorustherian:1020+223,
taurospaldea:1020+224,
taurospaldeafire:1020+225,
taurospaldeawater:1020+226,
taurospaldeacombat:1020+224,
taurospaldeablaze:1020+225,
taurospaldeaaqua:1020+226,
wooperpaldea:1020+227,
oinkolognef:1020+228,
palafinhero:1020+229,
mausholdfour:1020+230,
tatsugiridroopy:1020+231,
tatsugiristretchy:1020+232,
squawkabillyblue:1020+233,
squawkabillyyellow:1020+234,
squawkabillywhite:1020+235,
gimmighoulroaming:1020+236,
dialgaorigin:1020+237,
palkiaorigin:1020+238,
basculinwhitestriped:1020+239,
ursalunabloodmoon:1020+240,
ogerponwellspring:1020+241,
ogerponhearthflame:1020+242,
ogerponcornerstone:1020+243,


greninjabond:658,
gumshoostotem:735,
raticatealolatotem:1020+120,
marowakalolatotem:1020+136,
araquanidtotem:752,
lurantistotem:754,
salazzletotem:758,
vikavolttotem:738,
togedemarutotem:777,
mimikyutotem:778,
mimikyubustedtotem:778,
ribombeetotem:743,
kommoototem:784,
sinisteaantique:854,
polteageistantique:855,
poltchageistartisan:1012,
sinistchamasterpiece:1013,
ogerpontealtera:1017,
ogerponwellspringtera:1020+241,
ogerponhearthflametera:1020+242,
ogerponcornerstonetera:1020+243,


venusaurmega:1272+0,
charizardmegax:1272+1,
charizardmegay:1272+2,
blastoisemega:1272+3,
beedrillmega:1272+4,
pidgeotmega:1272+5,
alakazammega:1272+6,
slowbromega:1272+7,
gengarmega:1272+8,
kangaskhanmega:1272+9,
pinsirmega:1272+10,
gyaradosmega:1272+11,
aerodactylmega:1272+12,
mewtwomegax:1272+13,
mewtwomegay:1272+14,
ampharosmega:1272+15,
steelixmega:1272+16,
scizormega:1272+17,
heracrossmega:1272+18,
houndoommega:1272+19,
tyranitarmega:1272+20,
sceptilemega:1272+21,
blazikenmega:1272+22,
swampertmega:1272+23,
gardevoirmega:1272+24,
sableyemega:1272+25,
mawilemega:1272+26,
aggronmega:1272+27,
medichammega:1272+28,
manectricmega:1272+29,
sharpedomega:1272+30,
cameruptmega:1272+31,
altariamega:1272+32,
banettemega:1272+33,
absolmega:1272+34,
glaliemega:1272+35,
salamencemega:1272+36,
metagrossmega:1272+37,
latiasmega:1272+38,
latiosmega:1272+39,
kyogreprimal:1272+40,
groudonprimal:1272+41,
rayquazamega:1272+42,
lopunnymega:1272+43,
garchompmega:1272+44,
lucariomega:1272+45,
abomasnowmega:1272+46,
gallademega:1272+47,
audinomega:1272+48,
dianciemega:1272+49,
charizardgmax:1272+50,
butterfreegmax:1272+51,
pikachugmax:1272+52,
meowthgmax:1272+53,
machampgmax:1272+54,
gengargmax:1272+55,
kinglergmax:1272+56,
laprasgmax:1272+57,
eeveegmax:1272+58,
snorlaxgmax:1272+59,
garbodorgmax:1272+60,
melmetalgmax:1272+61,
corviknightgmax:1272+62,
orbeetlegmax:1272+63,
drednawgmax:1272+64,
coalossalgmax:1272+65,
flapplegmax:1272+66,
appletungmax:1272+67,
sandacondagmax:1272+68,
toxtricitygmax:1272+69,
toxtricitylowkeygmax:1272+69,
centiskorchgmax:1272+70,
hatterenegmax:1272+71,
grimmsnarlgmax:1272+72,
alcremiegmax:1272+73,
copperajahgmax:1272+74,
duraludongmax:1272+75,
eternatuseternamax:1272+76,
venusaurgmax:1272+77,
blastoisegmax:1272+78,
rillaboomgmax:1272+79,
cinderacegmax:1272+80,
inteleongmax:1272+81,
urshifugmax:1272+82,
urshifurapidstrikegmax:1272+83,


syclant:1464+0,
revenankh:1464+1,
pyroak:1464+2,
fidgit:1464+3,
stratagem:1464+4,
arghonaut:1464+5,
kitsunoh:1464+6,
cyclohm:1464+7,
colossoil:1464+8,
krilowatt:1464+9,
voodoom:1464+10,
tomohawk:1464+11,
necturna:1464+12,
mollux:1464+13,
aurumoth:1464+14,
malaconda:1464+15,
cawmodore:1464+16,
volkraken:1464+17,
plasmanta:1464+18,
naviathan:1464+19,
crucibelle:1464+20,
crucibellemega:1464+21,
kerfluffle:1464+22,
pajantom:1464+23,
jumbao:1464+24,
caribolt:1464+25,
smokomodo:1464+26,
snaelstrom:1464+27,
equilibra:1464+28,
astrolotl:1464+29,
miasmaw:1464+30,
chromera:1464+31,
venomicon:1464+32,
venomiconepilogue:1464+33,
saharaja:1464+34,
hemogoblin:1464+35,


syclar:1500+0,
embirch:1500+1,
flarelm:1500+2,
breezi:1500+3,
scratchet:1500+4,
necturine:1500+5,
cupra:1500+6,
argalis:1500+7,
brattler:1500+8,
cawdet:1500+9,
volkritter:1500+10,
snugglow:1500+11,
floatoy:1500+12,
caimanoe:1500+13,
pluffle:1500+14,
rebble:1500+15,
tactite:1500+16,
privatyke:1500+17,
nohface:1500+18,
monohm:1500+19,
duohm:1500+20,
protowatt:1500+21,
voodoll:1500+22,
mumbao:1500+23,
fawnifer:1500+24,
electrelk:1500+25,
smogecko:1500+26,
smoguana:1500+27,
swirlpool:1500+28,
coribalis:1500+29,
justyke:1500+30,
solotl:1500+31,
miasmite:1500+32,
dorsoil:1500+33,
saharascal:1500+34,
ababo:1500+35,
scattervein:1500+36,



llampas:1548+0,
danfluff:1548+1,
alfalphalops:1548+2,
therpal:1548+3,
aspfault:1548+4,
tarmendoa:1548+5,
burbwhirl:1548+6,
spoutlaw:1548+7,
vaquamael:1548+8,
chewmunk:1548+9,
cheekat:1548+10,
specoey:1548+11,
opakespiel:1548+12,
kwaile:1548+13,
quailert:1548+14,
quailstion:1548+15,
sighlo:1548+16,
cooreds:1548+17,
probaska:1548+18,
histameanie:1548+19,
apheed:1548+20,
musleafo:1548+21,
eecroach:1548+22,
stackem:1548+23,
clamtrip:1548+24,
rowviar:1548+25,
sanook:1548+26,
cereboral:1548+27,
bagoul:1548+28,
tofrug:1548+29,
kaskazog:1548+30,
ananot:1548+31,
ananoop:1548+32,
mosster:1548+33,
mosskrat:1548+34,
catteraxe:1548+35,
catatomb:1548+36,
skinka:1548+37,
dredgen:1548+38,
stalagen:1548+39,
chromagen:1548+40,
aerogen:1548+41,
caragen:1548+42,
bludgen:1548+43,
pathagen:1548+44,
ectogen:1548+45,
legen:1548+46,
depuray:1548+47,
desoray:1548+48,
dirrun:1548+49,
blurrun:1548+50,
pudet:1548+51,
woond:1548+52,
pramblo:1548+53,
glashulimp:1548+54,
drout:1548+55,
guruchi:1548+56,
estoe:1548+57,
perpetua:1548+58,
tooburm:1548+59,
detrarc:1548+60,
qayagus:1548+61,
auditar:1548+62,
oxillery:1548+63,
gneckle:1548+64,
rabyoose:1548+65,
someone:1548+66,
someone2:1548+67,
tamroast:1548+68,
someone3:1548+69,
vitisquash:1548+70,
dionysseur:1548+71,
umbralu:1548+72,
nomobjeka:1548+73,
kleptarak:1548+74,
kituff:1548+75,
beadamup:1548+76,
rascoom:1548+77,
faebril:1548+78,
someone4:1548+79,
someone5:1548+80,
aeradio:1548+81,
someone6:1548+82,
vendrom:1548+83,
jemineye:1548+84,
oracub:1548+85,
bearvoyance:1548+86,
folleming:1548+87,
bloomage:1548+88,
obsidious:1548+89,
prospectre:1548+90,
skideer:1548+91,
yuleigh:1548+92,
feafurr:1548+93,
vaicear:1548+94,
phisnooz:1548+95,
telemac:1548+96,
macedontus:1548+97,
crynorawst:1548+98,
mercryni:1548+99,
meraculisk:1548+100,
enigmeon:1548+101,
drosabell:1548+102,
yanmage:1548+103,
mienflux:1548+104,
golgre:1548+105,
rotomb:1548+106,
probat:1548+107,
porygonw:1548+108,
botnyak:1548+109,
buwuve:1548+110,
wasgrowl:1548+111,
worcane:1548+112,
tamunk:1548+113,
temunk:1548+114,
manadza:1548+115,
artikull:1548+116,
wicoot:1548+117,
orogon:1548+118,
orbtholod:1548+119,
pestalation:1548+120,
revylon:1548+121,
leoseace:1548+122,
lamentu:1548+123,
endramodai:1548+124,


raticatekaskade:1682+0,
bellsproutkaskade:1682+1,
gastlykaskade:1682+2,
haunterkaskade:1682+3,
gengarkaskade:1682+4,
jynxkaskade:1682+5,
lapraskaskade:1682+6,
marillkaskade:1682+7,
azumarillkaskade:1682+8,
sudowoodoamazeall:1682+9,
yanmakaskade:1682+10,
exploudkaskade:1682+11,
castformshady:1682+12,
castformsandy:1682+13,
castformdusty:1682+14,
castformallergy:1682+15,
castformswarmy:1682+16,
castformsmoggy:1682+17,
castformlovely:1682+18,
castformgutsy:1682+19,
castformspooky:1682+20,
castformzenny:1682+21,
castformsorcery:1682+22,
castformzappy:1682+23,
castformwindy:1682+24,
castformwhirly:1682+25,
bidoofkaskade:1682+26,
bibarelkaskade:1682+27,
shinxkaskade:1682+28,
luxiokaskade:1682+29,
luxraykaskade:1682+30,
ambipomkaskade:1682+31,
drifblimamazeall:1682+32,
skuntankkaskade:1682+33,
snoverlowland:1682+34,
abomasnowlowland:1682+35,
tropiuskaskade:1682+36,
rotomsol:1682+37,
rotomsway:1682+38,
rotombrawl:1682+39,
rotomweb:1682+40,
rotomjunk:1682+41,
excadrillkaskade:1682+42,
gurdurrkaskade:1682+43,
conkeldurrkaskade:1682+44,
solosiskaskade:1682+45,
duosionkaskade:1682+46,
reunicluskaskade:1682+47,
golettkaskade:1682+48,
bunnelbykaskade:1682+49,
diggersbykaskade:1682+50,
phantumpkaskade:1682+51,
trevenantkaskade:1682+52,
dianciekaskade:1682+53,
crabominablekaskade:1682+54,
pallossandkaskade:1682+55,
bruxishkaskade:1682+56,
dubwoolkaskade:1682+57,


eecroachswarm:1742+0,
stackemrockless:1742+1,
mosskrattidebloom:1742+2,
catteraxef:1742+3,
skinkaf:1742+4,
blurruncharged:1742+5,
droutdry:1742+6,
tamroastf:1742+7,
bearvoyancewhite:1742+8
};

var BattlePokemonIconIndexesLeft={
pikachubelle:1356+0,
pikachupopstar:1356+1,
clefairy:1356+2,
clefable:1356+3,
jigglypuff:1356+4,
wigglytuff:1356+5,
dugtrioalola:1356+6,
poliwhirl:1356+7,
poliwrath:1356+8,
mukalola:1356+9,
kingler:1356+10,
croconaw:1356+11,
cleffa:1356+12,
igglybuff:1356+13,
politoed:1356+14,
unownb:1356+15,
unownc:1356+16,
unownd:1356+17,
unowne:1356+18,
unownf:1356+19,
unowng:1356+20,
unownh:1356+21,
unownj:1356+22,
unownk:1356+23,
unownl:1356+24,
unownm:1356+25,
unownn:1356+26,
unownp:1356+27,
unownq:1356+28,
unownquestion:1356+29,
unownr:1356+30,
unowns:1356+31,
unownt:1356+32,
unownv:1356+33,
unownz:1356+34,
sneasel:1356+35,
teddiursa:1356+36,
roselia:1356+37,
zangoose:1356+38,
seviper:1356+39,
castformsnowy:1356+40,
absolmega:1356+41,
absol:1356+42,
regirock:1356+43,
torterra:1356+44,
budew:1356+45,
roserade:1356+46,
magmortar:1356+47,
togekiss:1356+48,
rotomwash:1356+49,
shayminsky:1356+50,
emboar:1356+51,
pansear:1356+52,
simisear:1356+53,
drilbur:1356+54,
excadrill:1356+55,
sawk:1356+56,
lilligant:1356+57,
garbodor:1356+58,
solosis:1356+59,
vanilluxe:1356+60,
amoonguss:1356+61,
klink:1356+62,
klang:1356+63,
klinklang:1356+64,
litwick:1356+65,
golett:1356+66,
golurk:1356+67,
kyuremblack:1356+68,
kyuremwhite:1356+69,
kyurem:1356+70,
keldeoresolute:1356+71,
meloetta:1356+72,
greninja:1356+73,
greninjabond:1356+73,
greninjaash:1356+74,
furfroudebutante:1356+75,
barbaracle:1356+76,
clauncher:1356+77,
clawitzer:1356+78,
sylveon:1356+79,
klefki:1356+80,
zygarde:1356+81,
zygarde10:1356+82,
zygardecomplete:1356+83,
dartrix:1356+84,
steenee:1356+85,
tsareena:1356+86,
comfey:1356+87,
miniormeteor:1356+88,
minior:1356+89,
miniororange:1356+90,
minioryellow:1356+91,
miniorgreen:1356+92,
miniorblue:1356+93,
miniorviolet:1356+94,
miniorindigo:1356+95,
dhelmise:1356+96,
necrozma:1356+97,
marshadow:1356+98,
pikachuoriginal:1356+99,
pikachupartner:1356+100,
necrozmaduskmane:1356+101,
necrozmadawnwings:1356+102,
necrozmaultra:1356+103,
stakataka:1356+104,
blacephalon:1356+105
};

var BattleAvatarNumbers={
1:'lucas',
2:'dawn',
3:'youngster-gen4dp',
4:'lass-gen4dp',
5:'camper',
6:'picnicker',
7:'bugcatcher-gen4dp',
8:'aromalady',
9:'twins-gen4dp',
10:'hiker-gen4',
11:'battlegirl-gen4',
12:'fisherman-gen4',
13:'cyclist-gen4',
14:'cyclistf-gen4',
15:'blackbelt-gen4dp',
16:'artist-gen4',
17:'pokemonbreeder-gen4',
18:'pokemonbreederf-gen4',
19:'cowgirl',
20:'jogger',
21:'pokefan-gen4',
22:'pokefanf-gen4',
23:'pokekid',
24:'youngcouple-gen4dp',
25:'acetrainer-gen4dp',
26:'acetrainerf-gen4dp',
27:'waitress-gen4',
28:'veteran-gen4',
29:'ninjaboy',
30:'dragontamer',
31:'birdkeeper-gen4dp',
32:'doubleteam',
33:'richboy-gen4',
34:'lady-gen4',
35:'gentleman-gen4dp',
36:'madame-gen4dp',
37:'beauty-gen4dp',
38:'collector',
39:'policeman-gen4',
40:'pokemonranger-gen4',
41:'pokemonrangerf-gen4',
42:'scientist-gen4dp',
43:'swimmer-gen4dp',
44:'swimmerf-gen4dp',
45:'tuber',
46:'tuberf',
47:'sailor',
48:'sisandbro',
49:'ruinmaniac',
50:'psychic-gen4',
51:'psychicf-gen4',
52:'gambler',
53:'guitarist-gen4',
54:'acetrainersnow',
55:'acetrainersnowf',
56:'skier',
57:'skierf-gen4dp',
58:'roughneck-gen4',
59:'clown',
60:'worker-gen4',
61:'schoolkid-gen4dp',
62:'schoolkidf-gen4',
63:'roark',
64:'barry',
65:'byron',
66:'aaron',
67:'bertha',
68:'flint',
69:'lucian',
70:'cynthia-gen4',
71:'bellepa',
72:'rancher',
73:'mars',
74:'galacticgrunt',
75:'gardenia',
76:'crasherwake',
77:'maylene',
78:'fantina',
79:'candice',
80:'volkner',
81:'parasollady-gen4',
82:'waiter-gen4dp',
83:'interviewers',
84:'cameraman',
85:'reporter',
86:'idol',
87:'cyrus',
88:'jupiter',
89:'saturn',
90:'galacticgruntf',
91:'argenta',
92:'palmer',
93:'thorton',
94:'buck',
95:'darach-caitlin',
96:'marley',
97:'mira',
98:'cheryl',
99:'riley',
100:'dahlia',
101:'ethan',
102:'lyra',
103:'twins-gen4',
104:'lass-gen4',
105:'acetrainer-gen4',
106:'acetrainerf-gen4',
107:'juggler',
108:'sage',
109:'li',
110:'gentleman-gen4',
111:'teacher',
112:'beauty',
113:'birdkeeper',
114:'swimmer-gen4',
115:'swimmerf-gen4',
116:'kimonogirl',
117:'scientist-gen4',
118:'acetrainercouple',
119:'youngcouple',
120:'supernerd',
121:'medium',
122:'schoolkid-gen4',
123:'blackbelt-gen4',
124:'pokemaniac',
125:'firebreather',
126:'burglar',
127:'biker-gen4',
128:'skierf',
129:'boarder',
130:'rocketgrunt',
131:'rocketgruntf',
132:'archer',
133:'ariana',
134:'proton',
135:'petrel',
136:'eusine',
137:'lucas-gen4pt',
138:'dawn-gen4pt',
139:'madame-gen4',
140:'waiter-gen4',
141:'falkner',
142:'bugsy',
143:'whitney',
144:'morty',
145:'chuck',
146:'jasmine',
147:'pryce',
148:'clair',
149:'will',
150:'koga',
151:'bruno',
152:'karen',
153:'lance',
154:'brock',
155:'misty',
156:'ltsurge',
157:'erika',
158:'janine',
159:'sabrina',
160:'blaine',
161:'blue',
162:'red',
163:'red',
164:'silver',
165:'giovanni',
166:'unknownf',
167:'unknown',
168:'unknown',
169:'hilbert',
170:'hilda',
171:'youngster',
172:'lass',
173:'schoolkid',
174:'schoolkidf',
175:'smasher',
176:'linebacker',
177:'waiter',
178:'waitress',
179:'chili',
180:'cilan',
181:'cress',
182:'nurseryaide',
183:'preschoolerf',
184:'preschooler',
185:'twins',
186:'pokemonbreeder',
187:'pokemonbreederf',
188:'lenora',
189:'burgh',
190:'elesa',
191:'clay',
192:'skyla',
193:'pokemonranger',
194:'pokemonrangerf',
195:'worker',
196:'backpacker',
197:'backpackerf',
198:'fisherman',
199:'musician',
200:'dancer',
201:'harlequin',
202:'artist',
203:'baker',
204:'psychic',
205:'psychicf',
206:'cheren',
207:'bianca',
208:'plasmagrunt-gen5bw',
209:'n',
210:'richboy',
211:'lady',
212:'pilot',
213:'workerice',
214:'hoopster',
215:'scientistf',
216:'clerkf',
217:'acetrainerf',
218:'acetrainer',
219:'blackbelt',
220:'scientist',
221:'striker',
222:'brycen',
223:'iris',
224:'drayden',
225:'roughneck',
226:'janitor',
227:'pokefan',
228:'pokefanf',
229:'doctor',
230:'nurse',
231:'hooligans',
232:'battlegirl',
233:'parasollady',
234:'clerk',
235:'clerk-boss',
236:'backers',
237:'backersf',
238:'veteran',
239:'veteranf',
240:'biker',
241:'infielder',
242:'hiker',
243:'madame',
244:'gentleman',
245:'plasmagruntf-gen5bw',
246:'shauntal',
247:'marshal',
248:'grimsley',
249:'caitlin',
250:'ghetsis-gen5bw',
251:'depotagent',
252:'swimmer',
253:'swimmerf',
254:'policeman',
255:'maid',
256:'ingo',
257:'alder',
258:'cyclist',
259:'cyclistf',
260:'cynthia',
261:'emmet',
262:'hilbert-wonderlauncher',
263:'hilda-wonderlauncher',
264:'hugh',
265:'rosa',
266:'nate',
267:'colress',
268:'beauty-gen5bw2',
269:'ghetsis',
270:'plasmagrunt',
271:'plasmagruntf',
272:'iris-gen5bw2',
273:'brycenman',
274:'shadowtriad',
275:'rood',
276:'zinzolin',
277:'cheren-gen5bw2',
278:'marlon',
279:'roxie',
280:'roxanne',
281:'brawly',
282:'wattson',
283:'flannery',
284:'norman',
285:'winona',
286:'tate',
287:'liza',
288:'juan',
289:'guitarist',
290:'steven',
291:'wallace',
292:'bellelba',
293:'benga',
294:'ash',
'#bw2elesa':'elesa-gen5bw2',
'#teamrocket':'teamrocket',
'#yellow':'yellow',
'#zinnia':'zinnia',
'#clemont':'clemont',
'#wally':'wally',
breeder:'pokemonbreeder',
breederf:'pokemonbreederf',
'hilbert-dueldisk':'hilbert-wonderlauncher',
'hilda-dueldisk':'hilda-wonderlauncher',
'nate-dueldisk':'nate-wonderlauncher',
'rosa-dueldisk':'rosa-wonderlauncher',

1001:'#1001',
1002:'#1002',
1003:'#1003',
1005:'#1005',
1010:'#1010'
};var
























PureEffect=





function PureEffect(id,name){this.effectType='PureEffect';this.id=void 0;this.name=void 0;this.gen=void 0;this.exists=void 0;
this.id=id;
this.name=name;
this.gen=0;
this.exists=false;
};var


Item=


























function Item(id,name,data){this.effectType='Item';this.id=void 0;this.name=void 0;this.gen=void 0;this.exists=void 0;this.num=void 0;this.spritenum=void 0;this.desc=void 0;this.shortDesc=void 0;this.megaStone=void 0;this.megaEvolves=void 0;this.zMove=void 0;this.zMoveType=void 0;this.zMoveFrom=void 0;this.zMoveUser=void 0;this.onPlate=void 0;this.onMemory=void 0;this.onDrive=void 0;this.fling=void 0;this.naturalGift=void 0;this.isPokeball=void 0;this.itemUser=void 0;
if(!data||typeof data!=='object')data={};
if(data.name)name=data.name;
this.name=Dex.sanitizeName(name);
this.id=id;
this.gen=data.gen||0;
this.exists='exists'in data?!!data.exists:true;

this.num=data.num||0;
this.spritenum=data.spritenum||0;
this.desc=data.desc||data.shortDesc||'';
this.shortDesc=data.shortDesc||this.desc;

this.megaStone=data.megaStone||'';
this.megaEvolves=data.megaEvolves||'';
this.zMove=data.zMove||null;
this.zMoveType=data.zMoveType||'';
this.zMoveFrom=data.zMoveFrom||'';
this.zMoveUser=data.zMoveUser||null;
this.onPlate=data.onPlate||'';
this.onMemory=data.onMemory||'';
this.onDrive=data.onDrive||'';
this.fling=data.fling||null;
this.naturalGift=data.naturalGift||null;
this.isPokeball=!!data.isPokeball;
this.itemUser=data.itemUser;

if(!this.gen){
if(this.num>=577){
this.gen=6;
}else if(this.num>=537){
this.gen=5;
}else if(this.num>=377){
this.gen=4;
}else{
this.gen=3;
}
}
};var
























































Move=







































function Move(id,name,data){var _this$maxMove;this.effectType='Move';this.id=void 0;this.name=void 0;this.gen=void 0;this.exists=void 0;this.basePower=void 0;this.accuracy=void 0;this.pp=void 0;this.type=void 0;this.category=void 0;this.priority=void 0;this.target=void 0;this.pressureTarget=void 0;this.flags=void 0;this.critRatio=void 0;this.desc=void 0;this.shortDesc=void 0;this.isNonstandard=void 0;this.isZ=void 0;this.zMove=void 0;this.isMax=void 0;this.maxMove=void 0;this.ohko=void 0;this.recoil=void 0;this.heal=void 0;this.multihit=void 0;this.hasCrashDamage=void 0;this.noPPBoosts=void 0;this.secondaries=void 0;this.noSketch=void 0;this.num=void 0;
if(!data||typeof data!=='object')data={};
if(data.name)name=data.name;
this.name=Dex.sanitizeName(name);
this.id=id;
this.gen=data.gen||0;
this.exists='exists'in data?!!data.exists:true;

this.basePower=data.basePower||0;
this.accuracy=data.accuracy||0;
this.pp=data.pp||1;
this.type=data.type||'???';
this.category=data.category||'Physical';
this.priority=data.priority||0;
this.target=data.target||'normal';
this.pressureTarget=data.pressureTarget||this.target;
this.flags=data.flags||{};
this.critRatio=data.critRatio===0?0:data.critRatio||1;


this.desc=data.desc;
this.shortDesc=data.shortDesc;
this.isNonstandard=data.isNonstandard||null;
this.isZ=data.isZ||'';
this.zMove=data.zMove||{};
this.ohko=data.ohko||null;
this.recoil=data.recoil||null;
this.heal=data.heal||null;
this.multihit=data.multihit||null;
this.hasCrashDamage=data.hasCrashDamage||false;
this.noPPBoosts=data.noPPBoosts||false;
this.secondaries=data.secondaries||(data.secondary?[data.secondary]:null);
this.noSketch=!!data.noSketch;

this.isMax=data.isMax||false;
this.maxMove=data.maxMove||{basePower:0};
if(this.category!=='Status'&&!((_this$maxMove=this.maxMove)!=null&&_this$maxMove.basePower)){
if(this.isZ||this.isMax){
this.maxMove={basePower:1};
}else if(!this.basePower){
this.maxMove={basePower:100};
}else if(['Fighting','Poison'].includes(this.type)){
if(this.basePower>=150){
this.maxMove={basePower:100};
}else if(this.basePower>=110){
this.maxMove={basePower:95};
}else if(this.basePower>=75){
this.maxMove={basePower:90};
}else if(this.basePower>=65){
this.maxMove={basePower:85};
}else if(this.basePower>=55){
this.maxMove={basePower:80};
}else if(this.basePower>=45){
this.maxMove={basePower:75};
}else{
this.maxMove={basePower:70};
}
}else{
if(this.basePower>=150){
this.maxMove={basePower:150};
}else if(this.basePower>=110){
this.maxMove={basePower:140};
}else if(this.basePower>=75){
this.maxMove={basePower:130};
}else if(this.basePower>=65){
this.maxMove={basePower:120};
}else if(this.basePower>=55){
this.maxMove={basePower:110};
}else if(this.basePower>=45){
this.maxMove={basePower:100};
}else{
this.maxMove={basePower:90};
}
}
}

if(this.category!=='Status'&&!this.isZ&&!this.isMax){
var basePower=this.basePower;
this.zMove={};
if(Array.isArray(this.multihit))basePower*=3;
if(!basePower){
this.zMove.basePower=100;
}else if(basePower>=140){
this.zMove.basePower=200;
}else if(basePower>=130){
this.zMove.basePower=195;
}else if(basePower>=120){
this.zMove.basePower=190;
}else if(basePower>=110){
this.zMove.basePower=185;
}else if(basePower>=100){
this.zMove.basePower=180;
}else if(basePower>=90){
this.zMove.basePower=175;
}else if(basePower>=80){
this.zMove.basePower=160;
}else if(basePower>=70){
this.zMove.basePower=140;
}else if(basePower>=60){
this.zMove.basePower=120;
}else{
this.zMove.basePower=100;
}
if(data.zMove)this.zMove.basePower=data.zMove.basePower;
}

this.num=data.num||0;
if(!this.gen){
if(this.num>=743){
this.gen=8;
}else if(this.num>=622){
this.gen=7;
}else if(this.num>=560){
this.gen=6;
}else if(this.num>=468){
this.gen=5;
}else if(this.num>=355){
this.gen=4;
}else if(this.num>=252){
this.gen=3;
}else if(this.num>=166){
this.gen=2;
}else if(this.num>=1){
this.gen=1;
}
}
};var


Ability=















function Ability(id,name,data){this.effectType='Ability';this.id=void 0;this.name=void 0;this.gen=void 0;this.exists=void 0;this.num=void 0;this.shortDesc=void 0;this.desc=void 0;this.rating=void 0;this.isPermanent=void 0;this.isNonstandard=void 0;
if(!data||typeof data!=='object')data={};
if(data.name)name=data.name;
this.name=Dex.sanitizeName(name);
this.id=id;
this.gen=data.gen||0;
this.exists='exists'in data?!!data.exists:true;
this.num=data.num||0;
this.shortDesc=data.shortDesc||data.desc||'';
this.desc=data.desc||data.shortDesc||'';
this.rating=data.rating||1;
this.isPermanent=!!data.isPermanent;
this.isNonstandard=!!data.isNonstandard;
if(!this.gen){
if(this.num>=234){
this.gen=8;
}else if(this.num>=192){
this.gen=7;
}else if(this.num>=165){
this.gen=6;
}else if(this.num>=124){
this.gen=5;
}else if(this.num>=77){
this.gen=4;
}else if(this.num>=1){
this.gen=3;
}
}
};var


Species=

























































function Species(id,name,data){this.effectType='Species';this.id=void 0;this.name=void 0;this.gen=void 0;this.exists=void 0;this.baseSpecies=void 0;this.forme=void 0;this.formeid=void 0;this.spriteid=void 0;this.baseForme=void 0;this.num=void 0;this.types=void 0;this.abilities=void 0;this.baseStats=void 0;this.bst=void 0;this.weightkg=void 0;this.heightm=void 0;this.gender=void 0;this.color=void 0;this.genderRatio=void 0;this.eggGroups=void 0;this.tags=void 0;this.otherFormes=void 0;this.cosmeticFormes=void 0;this.evos=void 0;this.prevo=void 0;this.evoType=void 0;this.evoLevel=void 0;this.evoMove=void 0;this.evoItem=void 0;this.evoCondition=void 0;this.requiredItems=void 0;this.tier=void 0;this.isTotem=void 0;this.isMega=void 0;this.isPrimal=void 0;this.canGigantamax=void 0;this.cannotDynamax=void 0;this.forceTeraType=void 0;this.battleOnly=void 0;this.isNonstandard=void 0;this.unreleasedHidden=void 0;this.changesFrom=void 0;
if(!data||typeof data!=='object')data={};
if(data.name)name=data.name;
this.name=Dex.sanitizeName(name);
this.id=id;
this.gen=data.gen||0;
this.exists='exists'in data?!!data.exists:true;
this.baseSpecies=data.baseSpecies||name;
this.forme=data.forme||'';
var baseId=toID(this.baseSpecies);
this.formeid=baseId===this.id?'':'-'+toID(this.forme);
this.spriteid=baseId+this.formeid;
if(this.spriteid.slice(-5)==='totem')this.spriteid=this.spriteid.slice(0,-5);
if(this.spriteid==='greninja-bond')this.spriteid='greninja';
if(this.spriteid.slice(-1)==='-')this.spriteid=this.spriteid.slice(0,-1);
this.baseForme=data.baseForme||'';

this.num=data.num||0;
this.types=data.types||['???'];
this.abilities=data.abilities||{0:"No Ability"};
this.baseStats=data.baseStats||{hp:0,atk:0,def:0,spa:0,spd:0,spe:0};
this.bst=this.baseStats.hp+this.baseStats.atk+this.baseStats.def+
this.baseStats.spa+this.baseStats.spd+this.baseStats.spe;
this.weightkg=data.weightkg||0;

this.heightm=data.heightm||0;
this.gender=data.gender||'';
this.color=data.color||'';
this.genderRatio=data.genderRatio||null;
this.eggGroups=data.eggGroups||[];
this.tags=data.tags||[];

this.otherFormes=data.otherFormes||null;
this.cosmeticFormes=data.cosmeticFormes||null;
this.evos=data.evos||null;
this.prevo=data.prevo||'';
this.evoType=data.evoType||'';
this.evoLevel=data.evoLevel||0;
this.evoMove=data.evoMove||'';
this.evoItem=data.evoItem||'';
this.evoCondition=data.evoCondition||'';
this.requiredItems=data.requiredItems||(data.requiredItem?[data.requiredItem]:[]);
this.tier=data.tier||'';

this.isTotem=false;
this.isMega=!!(this.forme&&['-mega','-megax','-megay'].includes(this.formeid));
this.isPrimal=!!(this.forme&&this.formeid==='-primal');
this.canGigantamax=!!data.canGigantamax;
this.cannotDynamax=!!data.cannotDynamax;
this.forceTeraType=data.forceTeraType||'';
this.battleOnly=data.battleOnly||undefined;
this.isNonstandard=data.isNonstandard||null;
this.unreleasedHidden=data.unreleasedHidden||false;
this.changesFrom=data.changesFrom||undefined;
if(!this.gen){
if(this.num>=906||this.formeid.startsWith('-paldea')){
this.gen=9;
}else if(this.num>=810||this.formeid.startsWith('-galar')||this.formeid.startsWith('-hisui')){
this.gen=8;
}else if(this.num>=722||this.formeid==='-alola'||this.formeid==='-starter'){
this.gen=7;
}else if(this.isMega||this.isPrimal){
this.gen=6;
this.battleOnly=this.baseSpecies;
}else if(this.formeid==='-totem'||this.formeid==='-alolatotem'){
this.gen=7;
this.isTotem=true;
}else if(this.num>=650){
this.gen=6;
}else if(this.num>=494){
this.gen=5;
}else if(this.num>=387){
this.gen=4;
}else if(this.num>=252){
this.gen=3;
}else if(this.num>=152){
this.gen=2;
}else if(this.num>=1){
this.gen=1;
}
}
};








if(typeof require==='function'){

global.BattleBaseSpeciesChart=BattleBaseSpeciesChart;
global.BattleNatures=BattleNatures;
global.PureEffect=PureEffect;
global.Species=Species;
global.Ability=Ability;
global.Item=Item;
global.Move=Move;
}
/**
 * Battle log
 *
 * An exercise in minimalism! This is a dependency of the client, which
 * requires IE9+ and uses Preact, and the replay player, which requires
 * IE7+ and uses jQuery. Therefore, this has to be compatible with IE7+
 * and use the DOM directly!
 *
 * Special thanks to PPK for QuirksMode.org, one of the few resources
 * available for how to do web development in these conditions.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var











BattleLog=function(){
























function BattleLog(elem,scene,innerElem){var _this=this;this.elem=void 0;this.innerElem=void 0;this.scene=null;this.preemptElem=null;this.atBottom=true;this.skippedLines=false;this.className=void 0;this.battleParser=null;this.joinLeave=null;this.lastRename=null;this.perspective=-1;this.























onScroll=function(){
var distanceFromBottom=_this.elem.scrollHeight-_this.elem.scrollTop-_this.elem.clientHeight;
_this.atBottom=distanceFromBottom<30;
};this.elem=elem;if(!innerElem){elem.setAttribute('role','log');elem.innerHTML='';innerElem=document.createElement('div');innerElem.className='inner message-log';elem.appendChild(innerElem);}this.innerElem=innerElem;if(scene){this.scene=scene;var preemptElem=document.createElement('div');preemptElem.className='inner-preempt message-log';elem.appendChild(preemptElem);this.preemptElem=preemptElem;this.battleParser=new BattleTextParser();}this.className=elem.className;elem.onscroll=this.onScroll;}var _proto=BattleLog.prototype;_proto.
reset=function reset(){
this.innerElem.innerHTML='';
this.atBottom=true;
this.skippedLines=false;
};_proto.
destroy=function destroy(){
this.elem.onscroll=null;
this.elem.innerHTML='';
};_proto.
addSeekEarlierButton=function addSeekEarlierButton(){var _this2=this;
if(this.skippedLines)return;
this.skippedLines=true;
var el=document.createElement('div');
el.className='chat';
el.innerHTML='<button class="button earlier-button"><i class="fa fa-caret-up"></i><br />Earlier messages</button>';
var button=el.getElementsByTagName('button')[0];
button==null||button.addEventListener==null||button.addEventListener('click',function(e){var _this2$scene;
e.preventDefault();
(_this2$scene=_this2.scene)==null||_this2$scene.battle.seekTurn(_this2.scene.battle.turn-100);
});
this.addNode(el);
};_proto.
add=function add(args,kwArgs,preempt){var _this$scene,_window$app,_window$app2,_this$scene2;
if(kwArgs!=null&&kwArgs.silent)return;
var battle=(_this$scene=this.scene)==null?void 0:_this$scene.battle;
if(battle!=null&&battle.seeking){
if(battle.stepQueue.length>2000){



if(
battle.seeking===Infinity?
battle.currentStep<battle.stepQueue.length-2000:
battle.turn<battle.seeking-100)
{
this.addSeekEarlierButton();
return;
}
}
}
var divClass='chat';
var divHTML='';
var noNotify;
if(!['join','j','leave','l'].includes(args[0]))this.joinLeave=null;
if(!['name','n'].includes(args[0]))this.lastRename=null;
switch(args[0]){
case'chat':case'c':case'c:':
var name;
var message;
if(args[0]==='c:'){
name=args[2];
message=args[3];
}else{
name=args[1];
message=args[2];
}
var rank=name.charAt(0);
if(battle!=null&&battle.ignoreSpects&&' +'.includes(rank))return;
if(battle!=null&&battle.ignoreOpponent){
if("\u2605\u2606".includes(rank)&&toUserid(name)!==app.user.get('userid'))return;
}
if((_window$app=window.app)!=null&&(_window$app=_window$app.ignore)!=null&&_window$app[toUserid(name)]&&" +\u2605\u2606".includes(rank))return;
var isHighlighted=(_window$app2=window.app)==null||(_window$app2=_window$app2.rooms)==null?void 0:_window$app2[battle.roomid].getHighlight(message);var _this$parseChatMessag=
this.parseChatMessage(message,name,'',isHighlighted);divClass=_this$parseChatMessag[0];divHTML=_this$parseChatMessag[1];noNotify=_this$parseChatMessag[2];
if(!noNotify&&isHighlighted){
var notifyTitle="Mentioned by "+name+" in "+battle.roomid;
app.rooms[battle.roomid].notifyOnce(notifyTitle,"\""+message+"\"",'highlight');
}
break;

case'join':case'j':case'leave':case'l':{
var user=BattleTextParser.parseNameParts(args[1]);
if(battle!=null&&battle.ignoreSpects&&' +'.includes(user.group))return;
var formattedUser=user.group+user.name;
var isJoin=args[0].charAt(0)==='j';
if(!this.joinLeave){
this.joinLeave={
joins:[],
leaves:[],
element:document.createElement('div')
};
this.joinLeave.element.className='chat';
}

if(isJoin&&this.joinLeave.leaves.includes(formattedUser)){
this.joinLeave.leaves.splice(this.joinLeave.leaves.indexOf(formattedUser),1);
}else{
this.joinLeave[isJoin?"joins":"leaves"].push(formattedUser);
}

var buf='';
if(this.joinLeave.joins.length){
buf+=this.textList(this.joinLeave.joins)+" joined";
}
if(this.joinLeave.leaves.length){
if(this.joinLeave.joins.length)buf+="; ";
buf+=this.textList(this.joinLeave.leaves)+" left";
}
this.joinLeave.element.innerHTML="<small>"+BattleLog.escapeHTML(buf)+"</small>";
(preempt?this.preemptElem:this.innerElem).appendChild(this.joinLeave.element);
return;
}

case'name':case'n':{
var _user=BattleTextParser.parseNameParts(args[1]);
if(toID(args[2])===toID(_user.name))return;
if(!this.lastRename||toID(this.lastRename.to)!==toID(_user.name)){
this.lastRename={
from:args[2],
to:'',
element:document.createElement('div')
};
this.lastRename.element.className='chat';
}
this.lastRename.to=_user.group+_user.name;
this.lastRename.element.innerHTML="<small>"+BattleLog.escapeHTML(this.lastRename.to)+" renamed from "+BattleLog.escapeHTML(this.lastRename.from)+".</small>";
(preempt?this.preemptElem:this.innerElem).appendChild(this.lastRename.element);
return;
}

case'chatmsg':case'':
divHTML=BattleLog.escapeHTML(args[1]);
break;

case'chatmsg-raw':case'raw':case'html':
divHTML=BattleLog.sanitizeHTML(args[1]);
break;

case'uhtml':case'uhtmlchange':
this.changeUhtml(args[1],args[2],args[0]==='uhtml');
return['',''];

case'error':case'inactive':case'inactiveoff':
divClass='chat message-error';
divHTML=BattleLog.escapeHTML(args[1]);
break;

case'bigerror':
this.message('<div class="broadcast-red">'+BattleLog.escapeHTML(args[1]).replace(/\|/g,'<br />')+'</div>');
return;

case'pm':
divHTML='<strong>'+BattleLog.escapeHTML(args[1])+':</strong> <span class="message-pm"><i style="cursor:pointer" onclick="selectTab(\'lobby\');rooms.lobby.popupOpen(\''+BattleLog.escapeHTML(args[2],true)+'\')">(Private to '+BattleLog.escapeHTML(args[3])+')</i> '+BattleLog.parseMessage(args[4])+'</span>';
break;

case'askreg':
this.addDiv('chat','<div class="broadcast-blue"><b>Register an account to protect your ladder rating!</b><br /><button name="register" value="'+BattleLog.escapeHTML(args[1])+'"><b>Register</b></button></div>');
return;

case'unlink':{

var _user2=toID(args[2])||toID(args[1]);
this.unlinkChatFrom(_user2);
if(args[2]){
var lineCount=parseInt(args[3],10);
this.hideChatFrom(_user2,true,lineCount);
}
return;
}

case'hidelines':{
var _user3=toID(args[2]);
this.unlinkChatFrom(_user3);
if(args[1]!=='unlink'){
var _lineCount=parseInt(args[3],10);
this.hideChatFrom(_user3,args[1]==='hide',_lineCount);
}
return;
}

case'debug':
divClass='debug';
divHTML='<div class="chat"><small style="color:#999">[DEBUG] '+BattleLog.escapeHTML(args[1])+'.</small></div>';
break;

case'notify':
var title=args[1];
var body=args[2];
var roomid=(_this$scene2=this.scene)==null?void 0:_this$scene2.battle.roomid;
if(!roomid)break;
app.rooms[roomid].notifyOnce(title,body,'highlight');
break;

case'showteam':{
if(!battle)return;
var team=Teams.unpack(args[2]);
if(!team.length)return;
var side=battle.getSide(args[1]);
var exportedTeam=team.map(function(set){
var buf=Teams["export"]([set],battle.gen).replace(/\n/g,'<br />');
if(set.name&&set.name!==set.species){
buf=buf.replace(set.name,BattleLog.sanitizeHTML("<span class=\"picon\" style=\""+Dex.getPokemonIcon(set.species)+"\"></span><br />"+set.name));
}else{
buf=buf.replace(set.species,"<span class=\"picon\" style=\""+Dex.getPokemonIcon(set.species)+"\"></span><br />"+set.species);
}
if(set.item){
buf=buf.replace(set.item,set.item+" <span class=\"itemicon\" style=\""+Dex.getItemIcon(set.item)+"\"></span>");
}
return buf;
}).join('');
divHTML="<div class=\"infobox\"><details><summary>Open Team Sheet for "+side.name+"</summary>"+exportedTeam+"</details></div>";
break;
}

case'seed':case'choice':case':':case'timer':case't:':
case'J':case'L':case'N':case'spectator':case'spectatorleave':
case'initdone':
return;

default:
this.addBattleMessage(args,kwArgs);
return;
}
if(divHTML)this.addDiv(divClass,divHTML,preempt);
};_proto.
addBattleMessage=function addBattleMessage(args,kwArgs){
switch(args[0]){
case'warning':
this.message('<strong>Warning:</strong> '+BattleLog.escapeHTML(args[1]));
this.message("Bug? Report it to <a href=\"http://www.smogon.com/forums/showthread.php?t=3453192\">the replay viewer's Smogon thread</a>");
if(this.scene)this.scene.wait(1000);
return;

case'variation':
this.addDiv('','<small>Variation: <em>'+BattleLog.escapeHTML(args[1])+'</em></small>');
break;

case'rule':
var ruleArgs=args[1].split(': ');
this.addDiv('','<small><em>'+BattleLog.escapeHTML(ruleArgs[0])+(ruleArgs[1]?':':'')+'</em> '+BattleLog.escapeHTML(ruleArgs[1]||'')+'</small>');
break;

case'rated':
this.addDiv('rated','<strong>'+(BattleLog.escapeHTML(args[1])||'Rated battle')+'</strong>');
break;

case'tier':
this.addDiv('','<small>Format:</small> <br /><strong>'+BattleLog.escapeHTML(args[1])+'</strong>');
break;

case'turn':
var h2elem=document.createElement('h2');
h2elem.className='battle-history';
var turnMessage;
if(this.battleParser){
turnMessage=this.battleParser.parseArgs(args,{}).trim();
if(!turnMessage.startsWith('==')||!turnMessage.endsWith('==')){
throw new Error("Turn message must be a heading.");
}
turnMessage=turnMessage.slice(2,-2).trim();
this.battleParser.curLineSection='break';
}else{
turnMessage="Turn "+args[1];
}
h2elem.innerHTML=BattleLog.escapeHTML(turnMessage);
this.addSpacer();
this.addNode(h2elem);
break;

default:
var line=null;
if(this.battleParser){
line=this.battleParser.parseArgs(args,kwArgs||{},true);
}
if(line===null){
this.addDiv('chat message-error','Unrecognized: |'+BattleLog.escapeHTML(args.join('|')));
return;
}
if(!line)return;
this.message.apply(this,this.parseLogMessage(line));
break;
}
};_proto.
textList=function textList(list){
var message='';
var listNoDuplicates=[];for(var _i2=0,_list2=
list;_i2<_list2.length;_i2++){var user=_list2[_i2];
if(!listNoDuplicates.includes(user))listNoDuplicates.push(user);
}
list=listNoDuplicates;

if(list.length===1)return list[0];
if(list.length===2)return list[0]+" and "+list[1];
for(var i=0;i<list.length-1;i++){
if(i>=5){
return message+"and "+(list.length-5)+" others";
}
message+=list[i]+", ";
}
return message+"and "+list[list.length-1];
return message;
};_proto.




parseLogMessage=function parseLogMessage(message){
var messages=message.split('\n').map(function(line){
line=BattleLog.escapeHTML(line);
line=line.replace(/\*\*(.*)\*\*/,'<strong>$1</strong>');
line=line.replace(/\|\|([^\|]*)\|\|([^\|]*)\|\|/,'<abbr title="$1">$2</abbr>');
if(line.startsWith('  '))line='<small>'+line.trim()+'</small>';
return line;
});
return[
messages.join('<br />'),
messages.filter(function(line){return!line.startsWith('<small>[');}).join('<br />')];

};_proto.
message=function message(_message){var sceneMessage=arguments.length>1&&arguments[1]!==undefined?arguments[1]:_message;
if(this.scene)this.scene.message(sceneMessage);
this.addDiv('battle-history',_message);
};_proto.
addNode=function addNode(node,preempt){
(preempt?this.preemptElem:this.innerElem).appendChild(node);
if(this.atBottom){
this.elem.scrollTop=this.elem.scrollHeight;
}
};_proto.
updateScroll=function updateScroll(){
if(this.atBottom){
this.elem.scrollTop=this.elem.scrollHeight;
}
};_proto.
addDiv=function addDiv(className,innerHTML,preempt){
var el=document.createElement('div');
el.className=className;
el.innerHTML=innerHTML;
this.addNode(el,preempt);
};_proto.
prependDiv=function prependDiv(className,innerHTML,preempt){
var el=document.createElement('div');
el.className=className;
el.innerHTML=innerHTML;
if(this.innerElem.childNodes.length){
this.innerElem.insertBefore(el,this.innerElem.childNodes[0]);
}else{
this.innerElem.appendChild(el);
}
this.updateScroll();
};_proto.
addSpacer=function addSpacer(){
this.addDiv('spacer battle-history','<br />');
};_proto.
changeUhtml=function changeUhtml(id,htmlSrc,forceAdd){
id=toID(id);
var classContains=' uhtml-'+id+' ';
var elements=[];for(var _i4=0,_ref2=
this.innerElem.childNodes;_i4<_ref2.length;_i4++){var node=_ref2[_i4];
if(node.className&&(' '+node.className+' ').includes(classContains)){
elements.push(node);
}
}
if(this.preemptElem){for(var _i6=0,_ref4=
this.preemptElem.childNodes;_i6<_ref4.length;_i6++){var _node=_ref4[_i6];
if(_node.className&&(' '+_node.className+' ').includes(classContains)){
elements.push(_node);
}
}
}
if(htmlSrc&&elements.length&&!forceAdd){for(var _i8=0;_i8<
elements.length;_i8++){var element=elements[_i8];
element.innerHTML=BattleLog.sanitizeHTML(htmlSrc);
}
this.updateScroll();
return;
}for(var _i10=0;_i10<
elements.length;_i10++){var _element=elements[_i10];
_element.parentElement.removeChild(_element);
}
if(!htmlSrc)return;
if(forceAdd){
this.addDiv('notice uhtml-'+id,BattleLog.sanitizeHTML(htmlSrc));
}else{
this.prependDiv('notice uhtml-'+id,BattleLog.sanitizeHTML(htmlSrc));
}
};_proto.
hideChatFrom=function hideChatFrom(userid){var showRevealButton=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;var lineCount=arguments.length>2&&arguments[2]!==undefined?arguments[2]:0;
var classStart='chat chatmessage-'+userid+' ';
var nodes=[];for(var _i12=0,_ref6=
this.innerElem.childNodes;_i12<_ref6.length;_i12++){var node=_ref6[_i12];
if(node.className&&(node.className+' ').startsWith(classStart)){
nodes.push(node);
}
}
if(this.preemptElem){for(var _i14=0,_ref8=
this.preemptElem.childNodes;_i14<_ref8.length;_i14++){var _node2=_ref8[_i14];
if(_node2.className&&(_node2.className+' ').startsWith(classStart)){
nodes.push(_node2);
}
}
}
if(lineCount)nodes=nodes.slice(-lineCount);for(var _i16=0,_nodes2=

nodes;_i16<_nodes2.length;_i16++){var _node3=_nodes2[_i16];
_node3.style.display='none';
_node3.className='revealed '+_node3.className;
}
if(!nodes.length||!showRevealButton)return;
var button=document.createElement('button');
button.name='toggleMessages';
button.value=userid;
button.className='subtle';
button.innerHTML="<small>("+nodes.length+" line"+(nodes.length>1?'s':'')+" from "+userid+" hidden)</small>";
var lastNode=nodes[nodes.length-1];
lastNode.appendChild(document.createTextNode(' '));
lastNode.appendChild(button);
};BattleLog.

unlinkNodeList=function unlinkNodeList(nodeList,classStart){for(var _i18=0,_ref10=
nodeList;_i18<_ref10.length;_i18++){var node=_ref10[_i18];
if(node.className&&(node.className+' ').startsWith(classStart)){
var linkList=node.getElementsByTagName('a');

for(var i=linkList.length-1;i>=0;i--){
var linkNode=linkList[i];
var parent=linkNode.parentElement;
if(!parent)continue;for(var _i20=0,_ref12=
linkNode.childNodes;_i20<_ref12.length;_i20++){var childNode=_ref12[_i20];
parent.insertBefore(childNode,linkNode);
}
parent.removeChild(linkNode);
}
}
}
};_proto.

unlinkChatFrom=function unlinkChatFrom(userid){
var classStart='chat chatmessage-'+userid+' ';
var innerNodeList=this.innerElem.childNodes;
BattleLog.unlinkNodeList(innerNodeList,classStart);

if(this.preemptElem){
var preemptNodeList=this.preemptElem.childNodes;
BattleLog.unlinkNodeList(preemptNodeList,classStart);
}
};_proto.

preemptCatchup=function preemptCatchup(){
if(!this.preemptElem.firstChild)return;
this.innerElem.appendChild(this.preemptElem.firstChild);
};BattleLog.

escapeFormat=function escapeFormat(formatid){
var atIndex=formatid.indexOf('@@@');
if(atIndex>=0){
return this.escapeFormat(formatid.slice(0,atIndex))+
'<br />Custom rules: '+this.escapeHTML(formatid.slice(atIndex+3));
}
if(window.BattleFormats&&BattleFormats[formatid]){
return this.escapeHTML(BattleFormats[formatid].name);
}
if(window.NonBattleGames&&NonBattleGames[formatid]){
return this.escapeHTML(NonBattleGames[formatid]);
}
return this.escapeHTML(formatid);
};BattleLog.

escapeHTML=function escapeHTML(str,jsEscapeToo){
if(typeof str!=='string')return'';
str=str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
if(jsEscapeToo)str=str.replace(/\\/g,'\\\\').replace(/'/g,'\\\'');
return str;
};BattleLog.

unescapeHTML=function unescapeHTML(str){
str=str?''+str:'';
return str.replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
};BattleLog.




hashColor=function hashColor(name){
return"color:"+this.usernameColor(name)+";";
};BattleLog.

usernameColor=function usernameColor(name){
if(this.colorCache[name])return this.colorCache[name];
var hash;
if(Config.customcolors[name]){
hash=MD5(Config.customcolors[name]);
}else{
hash=MD5(name);
}
var H=parseInt(hash.substr(4,4),16)%360;
var S=parseInt(hash.substr(0,4),16)%50+40;
var L=Math.floor(parseInt(hash.substr(8,4),16)%20+30);

var _this$HSLToRGB=this.HSLToRGB(H,S,L),R=_this$HSLToRGB.R,G=_this$HSLToRGB.G,B=_this$HSLToRGB.B;
var lum=R*R*R*0.2126+G*G*G*0.7152+B*B*B*0.0722;

var HLmod=(lum-0.2)*-150;
if(HLmod>18)HLmod=(HLmod-18)*2.5;else
if(HLmod<0)HLmod=(HLmod-0)/3;else
HLmod=0;

var Hdist=Math.min(Math.abs(180-H),Math.abs(240-H));
if(Hdist<15){
HLmod+=(15-Hdist)/3;
}

L+=HLmod;

var _this$HSLToRGB2=this.HSLToRGB(H,S,L),r=_this$HSLToRGB2.R,g=_this$HSLToRGB2.G,b=_this$HSLToRGB2.B;
var toHex=function(x){
var hex=Math.round(x*255).toString(16);
return hex.length===1?'0'+hex:hex;
};
this.colorCache[name]="#"+toHex(r)+toHex(g)+toHex(b);
return this.colorCache[name];
};BattleLog.

HSLToRGB=function HSLToRGB(H,S,L){
var C=(100-Math.abs(2*L-100))*S/100/100;
var X=C*(1-Math.abs(H/60%2-1));
var m=L/100-C/2;

var R1;
var G1;
var B1;
switch(Math.floor(H/60)){
case 1:R1=X;G1=C;B1=0;break;
case 2:R1=0;G1=C;B1=X;break;
case 3:R1=0;G1=X;B1=C;break;
case 4:R1=X;G1=0;B1=C;break;
case 5:R1=C;G1=0;B1=X;break;
case 0:default:R1=C;G1=X;B1=0;break;
}
var R=R1+m;
var G=G1+m;
var B=B1+m;
return{R:R,G:G,B:B};
};BattleLog.

prefs=function prefs(name){var _window$Storage;

if((_window$Storage=window.Storage)!=null&&_window$Storage.prefs)return Storage.prefs(name);

if(window.PS)return PS.prefs[name];
return undefined;
};_proto.

parseChatMessage=function parseChatMessage(
message,name,timestamp,isHighlighted)
{var _BattleLog$prefs,_window$app3,_window$PS;
var showMe=!((_BattleLog$prefs=BattleLog.prefs('chatformatting'))!=null&&_BattleLog$prefs.hideme);
var group=' ';
if(!/[A-Za-z0-9]/.test(name.charAt(0))){

group=name.charAt(0);
name=name.substr(1);
}
var colorStyle=" style=\"color:"+BattleLog.usernameColor(toID(name))+"\"";
var clickableName="<small>"+BattleLog.escapeHTML(group)+"</small><span class=\"username\" data-name=\""+BattleLog.escapeHTML(name)+"\">"+BattleLog.escapeHTML(name)+"</span>";
var hlClass=isHighlighted?' highlighted':'';
var isMine=((_window$app3=window.app)==null||(_window$app3=_window$app3.user)==null?void 0:_window$app3.get('name'))===name||((_window$PS=window.PS)==null?void 0:_window$PS.user.name)===name;
var mineClass=isMine?' mine':'';

var cmd='';
var target='';
if(message.charAt(0)==='/'){
if(message.charAt(1)==='/'){
message=message.slice(1);
}else{
var spaceIndex=message.indexOf(' ');
cmd=spaceIndex>=0?message.slice(1,spaceIndex):message.slice(1);
if(spaceIndex>=0)target=message.slice(spaceIndex+1);
}
}

switch(cmd){
case'me':
case'mee':
var parsedMessage=BattleLog.parseMessage(' '+target);
if(cmd==='mee')parsedMessage=parsedMessage.slice(1);
if(!showMe){
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<strong"+colorStyle+">"+clickableName+":</strong> <em>/me"+parsedMessage+"</em>"];

}
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<em><i><strong"+colorStyle+">&bull; "+clickableName+"</strong>"+parsedMessage+"</i></em>"];

case'invite':
var roomid=toRoomid(target);
return[
'chat',
timestamp+"<em>"+clickableName+" invited you to join the room \""+roomid+"\"</em>' +\n\t\t\t\t'<div class=\"notice\"><button name=\"joinRoom\" value=\""+
roomid+"\">Join "+roomid+"</button></div>"];

case'announce':
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<strong"+colorStyle+">"+clickableName+":</strong> <span class=\"message-announce\">"+BattleLog.parseMessage(target)+"</span>"];

case'log':
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<span class=\"message-log\">"+BattleLog.parseMessage(target)+"</span>"];

case'data-pokemon':
case'data-item':
case'data-ability':
case'data-move':
return['chat message-error','[outdated code no longer supported]'];
case'text':
return['chat',BattleLog.parseMessage(target)];
case'error':
return['chat message-error',formatText(target,true)];
case'html':
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<strong"+colorStyle+">"+clickableName+":</strong> <em>"+BattleLog.sanitizeHTML(target)+"</em>"];

case'uhtml':
case'uhtmlchange':
var parts=target.split(',');
var htmlSrc=parts.slice(1).join(',').trim();
this.changeUhtml(parts[0],htmlSrc,cmd==='uhtml');
return['',''];
case'raw':
return['chat',BattleLog.sanitizeHTML(target)];
case'nonotify':
return['chat',BattleLog.sanitizeHTML(target),true];
default:

if(!name){
return[
'chat'+hlClass,
timestamp+"<em>"+BattleLog.parseMessage(message)+"</em>"];

}
return[
'chat chatmessage-'+toID(name)+hlClass+mineClass,
timestamp+"<strong"+colorStyle+">"+clickableName+":</strong> <em>"+BattleLog.parseMessage(message)+"</em>"];

}
};BattleLog.

parseMessage=function parseMessage(str){var isTrusted=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;

if(str.substr(0,3)==='>> '||str.substr(0,4)==='>>> ')return this.escapeHTML(str);

if(str.substr(0,3)==='<< ')return this.escapeHTML(str);
str=formatText(str,isTrusted);

var options=BattleLog.prefs('chatformatting')||{};

if(options.hidelinks){
str=str.replace(/<a[^>]*>/g,'<u>').replace(/<\/a>/g,'</u>');
}
if(options.hidespoiler){
str=str.replace(/<span class="spoiler">/g,'<span class="spoiler spoiler-shown">');
}
if(options.hidegreentext){
str=str.replace(/<span class="greentext">/g,'<span>');
}

return str;
};BattleLog.


























initSanitizeHTML=function initSanitizeHTML(){var _this3=this;
if(this.tagPolicy)return;
if(!('html4'in window)){
throw new Error('sanitizeHTML requires caja');
}



Object.assign(html4.ELEMENTS,{
marquee:0,
blink:0,
psicon:html4.eflags['OPTIONAL_ENDTAG']|html4.eflags['EMPTY'],
username:0,
spotify:0,
youtube:0,
formatselect:0,
copytext:0,
twitch:0
});



Object.assign(html4.ATTRIBS,{

'marquee::behavior':0,
'marquee::bgcolor':0,
'marquee::direction':0,
'marquee::height':0,
'marquee::hspace':0,
'marquee::loop':0,
'marquee::scrollamount':0,
'marquee::scrolldelay':0,
'marquee::truespeed':0,
'marquee::vspace':0,
'marquee::width':0,
'psicon::pokemon':0,
'psicon::item':0,
'psicon::type':0,
'selectformat::type':0,
'psicon::category':0,
'username::name':0,
'form::data-submitsend':0,
'formatselect::format':0,
'div::data-server':0,
'button::data-send':0,
'form::data-delimiter':0,
'button::data-delimiter':0,
'*::aria-label':0,
'*::aria-hidden':0
});



















this.tagPolicy=function(tagName,attribs){
if(html4.ELEMENTS[tagName]&html4.eflags['UNSAFE']){
return;
}

function getAttrib(key){
for(var i=0;i<attribs.length-1;i+=2){
if(attribs[i]===key){
return attribs[i+1];
}
}
return undefined;
}
function setAttrib(key,value){
for(var i=0;i<attribs.length-1;i+=2){
if(attribs[i]===key){
attribs[i+1]=value;
return;
}
}
attribs.push(key,value);
}
function deleteAttrib(key){
for(var i=0;i<attribs.length-1;i+=2){
if(attribs[i]===key){
attribs.splice(i,2);
return;
}
}
}

var dataUri='';
var targetReplace=false;

if(tagName==='a'){
if(getAttrib('target')==='replace'){
targetReplace=true;
}
}else if(tagName==='img'){
var src=getAttrib('src')||'';
if(src.startsWith('data:image/')){
dataUri=src;
}
if(src.startsWith('//')){
if(location.protocol!=='http:'&&location.protocol!=='https:'){

setAttrib('src','https:'+src);
}
}
}else if(tagName==='twitch'){var _exec;

var _src=getAttrib('src')||"";
var channelId=(_exec=/(https?:\/\/)?twitch.tv\/([A-Za-z0-9]+)/i.exec(_src))==null?void 0:_exec[2];
var height=parseInt(getAttrib('height')||"",10)||400;
var width=parseInt(getAttrib('width')||"",10)||340;
return{
tagName:'iframe',
attribs:[
'src',"https://player.twitch.tv/?channel="+channelId+"&parent="+location.hostname+"&autoplay=false",
'allowfullscreen','true','height',""+height,'width',""+width]

};
}else if(tagName==='username'){

tagName='strong';
var color=_this3.usernameColor(toID(getAttrib('name')));
var style=getAttrib('style');
setAttrib('style',style+";color:"+color);
}else if(tagName==='spotify'){var _exec2;

var _src2=getAttrib('src')||'';
var songId=(_exec2=/(?:\?v=|\/track\/)([A-Za-z0-9]+)/.exec(_src2))==null?void 0:_exec2[1];

return{
tagName:'iframe',
attribs:['src',"https://open.spotify.com/embed/track/"+songId,'width','300','height','380','frameborder','0','allowtransparency','true','allow','encrypted-media']
};
}else if(tagName==='youtube'){var _exec3,_exec4;


var _src3=getAttrib('src')||'';

var _width='320';
var _height='200';
if(window.innerWidth>=400){
_width='400';
_height='225';
}
var videoId=(_exec3=/(?:\?v=|\/embed\/)([A-Za-z0-9_\-]+)/.exec(_src3))==null?void 0:_exec3[1];
if(!videoId)return{tagName:'img',attribs:['alt',"invalid src for <youtube>"]};

var time=(_exec4=/(?:\?|&)(?:t|start)=([0-9]+)/.exec(_src3))==null?void 0:_exec4[1];
_this3.players.push(null);
var idx=_this3.players.length;
_this3.initYoutubePlayer(idx);
return{
tagName:'iframe',
attribs:[
'id',"youtube-iframe-"+idx,
'width',_width,'height',_height,
'src',"https://www.youtube.com/embed/"+videoId+"?enablejsapi=1&playsinline=1"+(time?"&start="+time:''),
'frameborder','0','allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture','allowfullscreen','allowfullscreen']

};
}else if(tagName==='formatselect'){
return{
tagName:'button',
attribs:[
'type','selectformat',
'class',"select formatselect",
'value',getAttrib('format')||getAttrib('value')||'',
'name',getAttrib('name')||'']

};
}else if(tagName==='copytext'){
return{
tagName:'button',
attribs:[
'type',getAttrib('type'),
'class',getAttrib('class')||'button',
'value',getAttrib('value'),
'name','copyText']

};
}else if(tagName==='psicon'){


var iconType=null;
var iconValue=null;
for(var i=0;i<attribs.length-1;i+=2){
if(attribs[i]==='pokemon'||attribs[i]==='item'||attribs[i]==='type'||attribs[i]==='category'){var _attribs$slice=
attribs.slice(i,i+2);iconType=_attribs$slice[0];iconValue=_attribs$slice[1];
break;
}
}
tagName='span';

if(iconType){
var className=getAttrib('class');
var _style=getAttrib('style');

if(iconType==='pokemon'){
setAttrib('class','picon'+(className?' '+className:''));
setAttrib('style',Dex.getPokemonIcon(iconValue)+(_style?'; '+_style:''));
}else if(iconType==='item'){
setAttrib('class','itemicon'+(className?' '+className:''));
setAttrib('style',Dex.getItemIcon(iconValue)+(_style?'; '+_style:''));
}else if(iconType==='type'){
tagName=Dex.getTypeIcon(iconValue).slice(1,-3);
}else if(iconType==='category'){
tagName=Dex.getCategoryIcon(iconValue).slice(1,-3);
}
}
}

attribs=html.sanitizeAttribs(tagName,attribs,function(urlData){
if(urlData.scheme_==='geo'||urlData.scheme_==='sms'||urlData.scheme_==='tel')return null;
return urlData;
});

if(dataUri&&tagName==='img'){
setAttrib('src',dataUri);
}
if(tagName==='a'||tagName==='form'&&!getAttrib('data-submitsend')){
if(targetReplace){
setAttrib('data-target','replace');
deleteAttrib('target');
}else{
setAttrib('target','_blank');
}
if(tagName==='a'){
setAttrib('rel','noopener');
}
}
return{tagName:tagName,attribs:attribs};
};
};BattleLog.
localizeTime=function localizeTime(full,date,time,timezone){var _Intl;
var parsedTime=new Date(date+'T'+time+(timezone||'Z').toUpperCase());



if(!parsedTime.getTime())return full;

var formattedTime;

if((_Intl=window.Intl)!=null&&_Intl.DateTimeFormat){
formattedTime=new Intl.DateTimeFormat(undefined,{
month:'long',day:'numeric',hour:'numeric',minute:'numeric'
}).format(parsedTime);
}else{


formattedTime=parsedTime.toLocaleString();
}
return'<time>'+BattleLog.escapeHTML(formattedTime)+'</time>';
};BattleLog.
sanitizeHTML=function sanitizeHTML(input){
if(typeof input!=='string')return'';

this.initSanitizeHTML();

input=input.replace(/<username([^>]*)>([^<]*)<\/username>/gi,function(match,attrs,username){
if(/\bname\s*=\s*"/.test(attrs))return match;
var escapedUsername=username.replace(/"/g,'&quot;').replace(/>/g,'&gt;');
return"<username"+attrs+" name=\""+escapedUsername+"\">"+username+"</username>";
});



var sanitized=html.sanitizeWithPolicy(input,this.tagPolicy);
















return sanitized.replace(
/<time>\s*([+-]?\d{4,}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)(Z|[+-]\d{2}:\d{2})?\s*<\/time>/ig,
this.localizeTime);
};BattleLog.

initYoutubePlayer=function initYoutubePlayer(idx){var _this4=this;
var id="youtube-iframe-"+idx;
var loadPlayer=function(){
if(!$("#"+id).length)return;
var player=new window.YT.Player(id,{
events:{
onStateChange:function(event){
if(event.data===window.YT.PlayerState.PLAYING){for(var _i22=0,_BattleLog$players2=
BattleLog.players;_i22<_BattleLog$players2.length;_i22++){var curPlayer=_BattleLog$players2[_i22];
if(player===curPlayer)continue;
curPlayer==null||curPlayer.pauseVideo==null||curPlayer.pauseVideo();
}
}
}
}
});
_this4.players[idx-1]=player;
};

this.ensureYoutube().then(function(){
setTimeout(function(){return loadPlayer();},300);
});
};BattleLog.

ensureYoutube=function ensureYoutube(){
if(this.ytLoading)return this.ytLoading;

this.ytLoading=new Promise(function(resolve){
var el=document.createElement('script');
el.type='text/javascript';
el.async=true;
el.src='https://youtube.com/iframe_api';
el.onload=function(){


var loopCheck=function(){var _window$YT;
if(!((_window$YT=window.YT)!=null&&_window$YT.Player)){
setTimeout(function(){return loopCheck();},300);
}else{
resolve();
}
};
loopCheck();
};
document.body.appendChild(el);
});
return this.ytLoading;
};BattleLog.


























createReplayFile=function createReplayFile(room){
var battle=room.battle;
var replayid=room.id;
if(replayid){var _window$Config;

replayid=replayid.slice(7);
if(((_window$Config=window.Config)==null?void 0:_window$Config.server.id)!=='showdown'){var _window$Config2;
if(!((_window$Config2=window.Config)!=null&&_window$Config2.server.registered)){
replayid='unregisteredserver-'+replayid;
}else{
replayid=Config.server.id+'-'+replayid;
}
}
}else if(room.fragment){

replayid=room.fragment;
}else{
replayid=battle.id;
}

battle.seekTurn(Infinity);
var buf='<!DOCTYPE html>\n';
buf+='<meta charset="utf-8" />\n';
buf+='<!-- version 1 -->\n';
buf+="<title>"+BattleLog.escapeHTML(battle.tier)+" replay: "+BattleLog.escapeHTML(battle.p1.name)+" vs. "+BattleLog.escapeHTML(battle.p2.name)+"</title>\n";

buf+='<style>\n';
buf+='html,body {font-family:Verdana, sans-serif;font-size:10pt;margin:0;padding:0;}body{padding:12px 0;} .battle-log {font-family:Verdana, sans-serif;font-size:10pt;} .battle-log-inline {border:1px solid #AAAAAA;background:#EEF2F5;color:black;max-width:640px;margin:0 auto 80px;padding-bottom:5px;} .battle-log .inner {padding:4px 8px 0px 8px;} .battle-log .inner-preempt {padding:0 8px 4px 8px;} .battle-log .inner-after {margin-top:0.5em;} .battle-log h2 {margin:0.5em -8px;padding:4px 8px;border:1px solid #AAAAAA;background:#E0E7EA;border-left:0;border-right:0;font-family:Verdana, sans-serif;font-size:13pt;} .battle-log .chat {vertical-align:middle;padding:3px 0 3px 0;font-size:8pt;} .battle-log .chat strong {color:#40576A;} .battle-log .chat em {padding:1px 4px 1px 3px;color:#000000;font-style:normal;} .chat.mine {background:rgba(0,0,0,0.05);margin-left:-8px;margin-right:-8px;padding-left:8px;padding-right:8px;} .spoiler {color:#BBBBBB;background:#BBBBBB;padding:0px 3px;} .spoiler:hover, .spoiler:active, .spoiler-shown {color:#000000;background:#E2E2E2;padding:0px 3px;} .spoiler a {color:#BBBBBB;} .spoiler:hover a, .spoiler:active a, .spoiler-shown a {color:#2288CC;} .chat code, .chat .spoiler:hover code, .chat .spoiler:active code, .chat .spoiler-shown code {border:1px solid #C0C0C0;background:#EEEEEE;color:black;padding:0 2px;} .chat .spoiler code {border:1px solid #CCCCCC;background:#CCCCCC;color:#CCCCCC;} .battle-log .rated {padding:3px 4px;} .battle-log .rated strong {color:white;background:#89A;padding:1px 4px;border-radius:4px;} .spacer {margin-top:0.5em;} .message-announce {background:#6688AA;color:white;padding:1px 4px 2px;} .message-announce a, .broadcast-green a, .broadcast-blue a, .broadcast-red a {color:#DDEEFF;} .broadcast-green {background-color:#559955;color:white;padding:2px 4px;} .broadcast-blue {background-color:#6688AA;color:white;padding:2px 4px;} .infobox {border:1px solid #6688AA;padding:2px 4px;} .infobox-limited {max-height:200px;overflow:auto;overflow-x:hidden;} .broadcast-red {background-color:#AA5544;color:white;padding:2px 4px;} .message-learn-canlearn {font-weight:bold;color:#228822;text-decoration:underline;} .message-learn-cannotlearn {font-weight:bold;color:#CC2222;text-decoration:underline;} .message-effect-weak {font-weight:bold;color:#CC2222;} .message-effect-resist {font-weight:bold;color:#6688AA;} .message-effect-immune {font-weight:bold;color:#666666;} .message-learn-list {margin-top:0;margin-bottom:0;} .message-throttle-notice, .message-error {color:#992222;} .message-overflow, .chat small.message-overflow {font-size:0pt;} .message-overflow::before {font-size:9pt;content:\'...\';} .subtle {color:#3A4A66;}\n';
buf+='</style>\n';
buf+='<div class="wrapper replay-wrapper" style="max-width:1180px;margin:0 auto">\n';
buf+='<input type="hidden" name="replayid" value="'+replayid+'" />\n';
buf+='<div class="battle"></div><div class="battle-log"></div><div class="replay-controls"></div><div class="replay-controls-2"></div>\n';
buf+="<h1 style=\"font-weight:normal;text-align:center\"><strong>"+BattleLog.escapeHTML(battle.tier)+"</strong><br /><a href=\"http://"+Config.routes.users+"/"+toID(battle.p1.name)+"\" class=\"subtle\" target=\"_blank\">"+BattleLog.escapeHTML(battle.p1.name)+"</a> vs. <a href=\"http://"+Config.routes.users+"/"+toID(battle.p2.name)+"\" class=\"subtle\" target=\"_blank\">"+BattleLog.escapeHTML(battle.p2.name)+"</a></h1>\n";
buf+='<script type="text/plain" class="battle-log-data">'+battle.stepQueue.join('\n').replace(/\//g,'\\/')+'</script>\n';
buf+='</div>\n';
buf+='<div class="battle-log battle-log-inline"><div class="inner">'+battle.scene.log.elem.innerHTML+'</div></div>\n';
buf+='</div>\n';
buf+='<script>\n';
buf+="let daily = Math.floor(Date.now()/1000/60/60/24);document.write('<script src=\"https://"+Config.routes.client+"/js/replay-embed.js?version'+daily+'\"></'+'script>');\n";
buf+='</script>\n';
return buf;
};BattleLog.

createReplayFileHref=function createReplayFileHref(room){


return'data:text/plain;base64,'+encodeURIComponent(btoa(unescape(encodeURIComponent(BattleLog.createReplayFile(room)))));
};return BattleLog;}();BattleLog.colorCache={};BattleLog.interstice=function(){var whitelist=Config.whitelist;var patterns=whitelist.map(function(entry){return new RegExp("^(https?:)?//([A-Za-z0-9-]*\\.)?"+entry.replace(/\./g,'\\.')+"(/.*)?",'i');});return{isWhitelisted:function(uri){if(uri[0]==='/'&&uri[1]!=='/'){return true;}for(var _i24=0;_i24<patterns.length;_i24++){var pattern=patterns[_i24];if(pattern.test(uri))return true;}return false;},getURI:function(uri){return"http://"+Config.routes.root+"/interstice?uri="+encodeURIComponent(uri);}};}();BattleLog.players=[];BattleLog.ytLoading=null;BattleLog.tagPolicy=null;
/**
 * Pokemon Showdown Log Misc
 *
 * Some miscellaneous helper functions for battle-log.ts, namely:
 *
 * - an MD5 hasher
 *
 * - a parseText function (for converting chat text to HTML),
 *   cross-compiled from the server
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */




function MD5(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g;}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c);}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c);}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c);}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
f),h));return i(b<<g|b>>>32-g,c);}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c;}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128));}return c;}(f),g=function(b){var c,d=b.length;c=
d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f;}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase();};
/**
 * Chat parser
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Parses formate.
 *
 * @license MIT
 */




















































var linkRegex=/(?:(?:https?:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*|www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:(?:com?|org|net|edu|info|us|jp)\b|[a-z]{2,3}(?=:[0-9]|\/)))(?::[0-9]+)?(?:\/(?:(?:[^\s()&<>]|&amp;|&quot;|\((?:[^\\s()<>&]|&amp;)*\))*(?:[^\s()[\]{}".,!?;:&<>*`^~\\]|\((?:[^\s()<>&]|&amp;)*\)))?)?|[a-z0-9.]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?![^ ]*&gt;)/ig;var





TextFormatter=function(){








function TextFormatter(str){var isTrusted=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var replaceLinebreaks=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;this.str=void 0;this.buffers=void 0;this.stack=void 0;this.isTrusted=void 0;this.replaceLinebreaks=void 0;this.offset=void 0;

str=(""+str).
replace(/&/g,'&amp;').
replace(/</g,'&lt;').
replace(/>/g,'&gt;').
replace(/"/g,'&quot;').
replace(/'/g,'&apos;');


str=str.replace(linkRegex,function(uri){
var fulluri;
if(/^[a-z0-9.]+@/ig.test(uri)){
fulluri='mailto:'+uri;
}else{
fulluri=uri.replace(/^([a-z]*[^a-z:])/g,'http://$1');
if(uri.substr(0,24)==='https://docs.google.com/'||uri.substr(0,16)==='docs.google.com/'){
if(uri.startsWith('https'))uri=uri.slice(8);
if(uri.substr(-12)==='?usp=sharing'||uri.substr(-12)==='&usp=sharing')uri=uri.slice(0,-12);
if(uri.substr(-6)==='#gid=0')uri=uri.slice(0,-6);
var slashIndex=uri.lastIndexOf('/');
if(uri.length-slashIndex>18)slashIndex=uri.length;
if(slashIndex-4>19+3){
uri=uri.slice(0,19)+
'<small class="message-overflow">'+uri.slice(19,slashIndex-4)+'</small>'+uri.slice(slashIndex-4);
}
}
}
return"<a href=\""+fulluri+"\" rel=\"noopener\" target=\"_blank\">"+uri+"</a>";
});


this.str=str;
this.buffers=[];
this.stack=[];
this.isTrusted=isTrusted;
this.replaceLinebreaks=this.isTrusted||replaceLinebreaks;
this.offset=0;
}var _proto=TextFormatter.prototype;_proto.


slice=function slice(start,end){
return this.str.slice(start,end);
};_proto.

at=function at(start){
return this.str.charAt(start);
};_proto.

pushSpan=function pushSpan(spanType,start,end){
this.pushSlice(start);
this.stack.push([spanType,this.buffers.length]);
this.buffers.push(this.slice(start,end));
this.offset=end;
};_proto.

pushSlice=function pushSlice(end){
if(end!==this.offset){
this.buffers.push(this.slice(this.offset,end));
this.offset=end;
}
};_proto.

closeParenSpan=function closeParenSpan(start){
var stackPosition=-1;
for(var i=this.stack.length-1;i>=0;i--){
var span=this.stack[i];
if(span[0]==='('){
stackPosition=i;
break;
}
if(span[0]!=='spoiler')break;
}
if(stackPosition===-1)return false;

this.pushSlice(start);
while(this.stack.length>stackPosition)this.popSpan(start);
this.offset=start;
return true;
};_proto.




closeSpan=function closeSpan(spanType,start,end){

var stackPosition=-1;
for(var i=this.stack.length-1;i>=0;i--){
var _span=this.stack[i];
if(_span[0]===spanType){
stackPosition=i;
break;
}
}
if(stackPosition===-1)return false;

this.pushSlice(start);
while(this.stack.length>stackPosition+1)this.popSpan(start);
var span=this.stack.pop();
var startIndex=span[1];
var tagName='';
var attrs='';
switch(spanType){
case'_':tagName='i';break;
case'*':tagName='b';break;
case'~':tagName='s';break;
case'^':tagName='sup';break;
case'\\':tagName='sub';break;
case'|':tagName='span';attrs=' class="spoiler"';break;
}
if(tagName){
this.buffers[startIndex]="<"+tagName+attrs+">";
this.buffers.push("</"+tagName+">");
this.offset=end;
}
return true;
};_proto.






popSpan=function popSpan(end){
var span=this.stack.pop();
if(!span)return false;
this.pushSlice(end);
switch(span[0]){
case'spoiler':
this.buffers.push("</span>");
this.buffers[span[1]]="<span class=\"spoiler\">";
break;
case'>':
this.buffers.push("</span>");
this.buffers[span[1]]="<span class=\"greentext\">";
break;
default:

break;
}
return true;
};_proto.

popAllSpans=function popAllSpans(end){
while(this.stack.length)this.popSpan(end);
this.pushSlice(end);
};_proto.

toUriComponent=function toUriComponent(html){
var component=html.replace(/&lt;/g,'<').
replace(/&gt;/g,'>').
replace(/&quot;/g,'"').
replace(/&apos;/g,'\'').
replace(/&amp;/g,'&');
return encodeURIComponent(component);
};_proto.

runLookahead=function runLookahead(spanType,start){
switch(spanType){
case'`':
{
var delimLength=0;
var i=start;
while(this.at(i)==='`'){
delimLength++;
i++;
}
var curDelimLength=0;
while(i<this.str.length){
var char=this.at(i);
if(char==='\n')break;
if(char==='`'){
curDelimLength++;
}else{
if(curDelimLength===delimLength)break;
curDelimLength=0;
}
i++;
}
if(curDelimLength!==delimLength)return false;

this.pushSlice(start);
this.buffers.push("<code>");
var innerStart=start+delimLength;
var innerEnd=i-delimLength;
if(innerStart+1>=innerEnd){

}else if(this.at(innerStart)===' '&&this.at(innerEnd-1)===' '){
innerStart++;
innerEnd--;
}else if(this.at(innerStart)===' '&&this.at(innerStart+1)==='`'){
innerStart++;
}else if(this.at(innerEnd-1)===' '&&this.at(innerEnd-2)==='`'){
innerEnd--;
}
this.buffers.push(this.slice(innerStart,innerEnd));
this.buffers.push("</code>");
this.offset=i;
}
return true;
case'[':
{
if(this.slice(start,start+2)!=='[[')return false;
var _i=start+2;
var colonPos=-1;
var anglePos=-1;
while(_i<this.str.length){
var _char=this.at(_i);
if(_char===']'||_char==='\n')break;
if(_char===':'&&colonPos<0)colonPos=_i;
if(_char==='&'&&this.slice(_i,_i+4)==='&lt;')anglePos=_i;
_i++;
}
if(this.slice(_i,_i+2)!==']]')return false;
var termEnd=_i;
var uri='';
if(anglePos>=0&&this.slice(_i-4,_i)==='&gt;'){
uri=this.slice(anglePos+4,_i-4);
termEnd=anglePos;
if(this.at(termEnd-1)===' ')termEnd--;
uri=encodeURI(uri.replace(/^([a-z]*[^a-z:])/g,'http://$1'));
}
var term=this.slice(start+2,termEnd).replace(/<\/?a(?: [^>]+)?>/g,'');
if(uri&&!this.isTrusted){
var shortUri=uri.replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/$/,'');
term+="<small> &lt;"+shortUri+"&gt;</small>";
uri+='" rel="noopener';
}
if(colonPos>0){
var key=this.slice(start+2,colonPos).toLowerCase();
switch(key){
case'w':
case'wiki':
term=term.slice(term.charAt(key.length+1)===' '?key.length+2:key.length+1);
uri="//en.wikipedia.org/w/index.php?title=Special:Search&search="+this.toUriComponent(term);
term="wiki: "+term;
break;
case'pokemon':
case'item':
case'type':
case'category':
term=term.slice(term.charAt(key.length+1)===' '?key.length+2:key.length+1);

var display='';
if(this.isTrusted){
display="<psicon "+key+"=\""+term+"\" />";
}else{
display="["+term+"]";
}

var dir=key;
if(key==='item')dir+='s';
if(key==='category')dir='categories';

uri="//dex.pokemonshowdown.com/"+dir+"/"+toID(term);
term=display;
}
}
if(!uri){
uri="//www.google.com/search?ie=UTF-8&btnI&q="+this.toUriComponent(term);
}
this.pushSlice(start);
this.buffers.push("<a href=\""+uri+"\" target=\"_blank\">"+term+"</a>");
this.offset=_i+2;
}
return true;
case'<':
{
if(this.slice(start,start+8)!=='&lt;&lt;')return false;
var _i2=start+8;
while(/[a-z0-9-]/.test(this.at(_i2)))_i2++;
if(this.slice(_i2,_i2+8)!=='&gt;&gt;')return false;
this.pushSlice(start);
var roomid=this.slice(start+8,_i2);
this.buffers.push("&laquo;<a href=\"/"+roomid+"\" target=\"_blank\">"+roomid+"</a>&raquo;");
this.offset=_i2+8;
}
return true;
case'a':
{
var _i3=start+1;
while(this.at(_i3)!=='/'||this.at(_i3+1)!=='a'||this.at(_i3+2)!=='>')_i3++;
_i3+=3;
this.pushSlice(_i3);
}
return true;
}
return false;
};_proto.

get=function get(){
var beginningOfLine=this.offset;

for(var i=beginningOfLine;i<this.str.length;i++){
var char=this.at(i);
switch(char){
case'_':
case'*':
case'~':
case'^':
case'\\':
case'|':
if(this.at(i+1)===char&&this.at(i+2)!==char){
if(!(this.at(i-1)!==' '&&this.closeSpan(char,i,i+2))){
if(this.at(i+2)!==' ')this.pushSpan(char,i,i+2);
}
if(i<this.offset){
i=this.offset-1;
break;
}
}
while(this.at(i+1)===char)i++;
break;
case'(':
this.stack.push(['(',-1]);
break;
case')':
this.closeParenSpan(i);
if(i<this.offset){
i=this.offset-1;
break;
}
break;
case'`':
if(this.at(i+1)==='`')this.runLookahead('`',i);
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.at(i+1)==='`')i++;
break;
case'[':
this.runLookahead('[',i);
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.at(i+1)==='[')i++;
break;
case':':
if(i<7)break;
if(this.slice(i-7,i+1).toLowerCase()==='spoiler:'||
this.slice(i-8,i+1).toLowerCase()==='spoilers:'){
if(this.at(i+1)===' ')i++;
this.pushSpan('spoiler',i+1,i+1);
}
break;
case'&':
if(i===beginningOfLine&&this.slice(i,i+4)==='&gt;'){
if(!"._/=:;".includes(this.at(i+4))&&!['w&lt;','w&gt;'].includes(this.slice(i+4,i+9))){
this.pushSpan('>',i,i);
}
}else{
this.runLookahead('<',i);
}
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.slice(i+1,i+5)==='lt;&')i+=4;
break;
case'<':
this.runLookahead('a',i);
if(i<this.offset){
i=this.offset-1;
break;
}

break;
case'\r':
case'\n':
this.popAllSpans(i);
if(this.replaceLinebreaks){
this.buffers.push("<br />");
this.offset++;
}
beginningOfLine=i+1;
break;
}
}

this.popAllSpans(this.str.length);
return this.buffers.join('');
};return TextFormatter;}();





function formatText(str){var isTrusted=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var replaceLinebreaks=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;
return new TextFormatter(str,isTrusted,replaceLinebreaks).get();
}




function stripFormatting(str){

str=str.replace(/\*\*([^\s*]+)\*\*|__([^\s_]+)__|~~([^\s~]+)~~|``([^\s`]+)``|\^\^([^\s^]+)\^\^|\\([^\s\\]+)\\/g,
function(match,$1,$2,$3,$4,$5,$6){return $1||$2||$3||$4||$5||$6;});

return str.replace(/\[\[(?:([^<]*)\s*<[^>]+>|([^\]]+))\]\]/g,function(match,$1,$2){return $1||$2||'';});
}
exports.BattleText={"default":{startBattle:"Battle started between [TRAINER] and [TRAINER]!",winBattle:"**[TRAINER]** won the battle!",tieBattle:"Tie between [TRAINER] and [TRAINER]!",pokemon:"[NICKNAME]",opposingPokemon:"the opposing [NICKNAME]",team:"your team",opposingTeam:"the opposing team",party:"your ally Pokémon",opposingParty:"the opposing Pokémon",turn:"== Turn [NUMBER] ==",switchIn:"[TRAINER] sent out [FULLNAME]!",switchInOwn:"Go! [FULLNAME]!",switchOut:"[TRAINER] withdrew [NICKNAME]!",switchOutOwn:"[NICKNAME], come back!",drag:"[FULLNAME] was dragged out!",faint:"[POKEMON] fainted!",swap:"[POKEMON] and [TARGET] switched places!",swapCenter:"[POKEMON] moved to the center!",canDynamax:"  [TRAINER] can dynamax now!",canDynamaxOwn:"  Dynamax Energy gathered around [TRAINER]!",zEffect:"  [POKEMON] unleashes its full-force Z-Move!",move:"[POKEMON] used **[MOVE]**!",abilityActivation:"[[POKEMON]'s [ABILITY]]",mega:"  [POKEMON]'s [ITEM] is reacting to the Key Stone!",megaNoItem:"  [POKEMON] is reacting to [TRAINER]'s Key Stone!",megaGen6:"  [POKEMON]'s [ITEM] is reacting to [TRAINER]'s Mega Bracelet!",transformMega:"[POKEMON] has Mega Evolved into Mega [SPECIES]!",primal:"[POKEMON]'s Primal Reversion! It reverted to its primal state!",zPower:"  [POKEMON] surrounded itself with its Z-Power!",zBroken:"  [POKEMON] couldn't fully protect itself and got hurt!",terastallize:"  [POKEMON] has Terastallized into the [TYPE]-type!",cant:"[POKEMON] can't use [MOVE]!",cantNoMove:"[POKEMON] can't move!",fail:"  But it failed!",transform:"[POKEMON] transformed!",typeChange:"  [POKEMON]'s type changed to [TYPE]!",typeChangeFromEffect:"  [POKEMON]'s [EFFECT] made it the [TYPE] type!",typeAdd:"  [TYPE] type was added to [POKEMON]!",start:"  ([EFFECT] started on [POKEMON]!)",end:"  [POKEMON] was freed from [EFFECT]!",activate:"  ([EFFECT] activated!)",startTeamEffect:"  ([EFFECT] started on [TEAM]!)",endTeamEffect:"  ([EFFECT] ended on [TEAM]!)",startFieldEffect:"  ([EFFECT] started!)",endFieldEffect:"  ([EFFECT] ended!)",changeAbility:"  [POKEMON] acquired [ABILITY]!",addItem:"  [POKEMON] obtained one [ITEM].",takeItem:"  [POKEMON] stole [SOURCE]'s [ITEM]!",eatItem:"  ([POKEMON] ate its [ITEM]!)",useGem:"  The [ITEM] strengthened [POKEMON]'s power!",eatItemWeaken:"  The [ITEM] weakened damage to [POKEMON]!",removeItem:"  [POKEMON] lost its [ITEM]!",activateItem:"  ([POKEMON] used its [ITEM]!)",activateWeaken:"  The [ITEM] weakened the damage to [POKEMON]!",drinkItem:"  ([POKEMON] drank its [ITEM]!)",damage:"  ([POKEMON] was hurt!)",damagePercentage:"  ([POKEMON] lost [PERCENTAGE] of its health!)",damageFromPokemon:"  [POKEMON] was hurt by [SOURCE]'s [ITEM]!",damageFromItem:"  [POKEMON] was hurt by its [ITEM]!",damageFromPartialTrapping:"  [POKEMON] is hurt by [MOVE]!",heal:"  [POKEMON] had its HP restored.",healFromZEffect:"  [POKEMON] restored its HP using its Z-Power!",healFromEffect:"  [POKEMON] restored HP using its [EFFECT]!",boost:"  [POKEMON]'s [STAT] rose!",boost2:"  [POKEMON]'s [STAT] rose sharply!",boost3:"  [POKEMON]'s [STAT] rose drastically!",boost0:"  [POKEMON]'s [STAT] won't go any higher!",boostFromItem:"  The [ITEM] raised [POKEMON]'s [STAT]!",boost2FromItem:"  The [ITEM] sharply raised [POKEMON]'s [STAT]!",boost3FromItem:"  The [ITEM] drastically raised [POKEMON]'s [STAT]!",boostFromZEffect:"  [POKEMON] boosted its [STAT] using its Z-Power!",boost2FromZEffect:"  [POKEMON] boosted its [STAT] sharply using its Z-Power!",boost3FromZEffect:"  [POKEMON] boosted its [STAT] drastically using its Z-Power!",boostMultipleFromZEffect:"  [POKEMON] boosted its stats using its Z-Power!",unboost:"  [POKEMON]'s [STAT] fell!",unboost2:"  [POKEMON]'s [STAT] fell harshly!",unboost3:"  [POKEMON]'s [STAT] fell severely!",unboost0:"  [POKEMON]'s [STAT] won't go any lower!",unboostFromItem:"  The [ITEM] lowered [POKEMON]'s [STAT]!",unboost2FromItem:"  The [ITEM] harshly lowered [POKEMON]'s [STAT]!",unboost3FromItem:"  The [ITEM] drastically lowered [POKEMON]'s [STAT]!",swapBoost:"  [POKEMON] switched stat changes with its target!",swapOffensiveBoost:"  [POKEMON] switched all changes to its Attack and Sp. Atk with its target!",swapDefensiveBoost:"  [POKEMON] switched all changes to its Defense and Sp. Def with its target!",copyBoost:"  [POKEMON] copied [TARGET]'s stat changes!",clearBoost:"  [POKEMON]'s stat changes were removed!",clearBoostFromZEffect:"  [POKEMON] returned its decreased stats to normal using its Z-Power!",invertBoost:"  [POKEMON]'s stat changes were inverted!",clearAllBoost:"  All stat changes were eliminated!",superEffective:"  It's super effective!",superEffectiveSpread:"  It's super effective on [POKEMON]!",resisted:"  It's not very effective...",resistedSpread:"  It's not very effective on [POKEMON].",crit:"  A critical hit!",critSpread:"  A critical hit on [POKEMON]!",immune:"  It doesn't affect [POKEMON]...",immuneNoPokemon:"  It had no effect!",immuneOHKO:"  [POKEMON] is unaffected!",miss:"  [POKEMON] avoided the attack!",missNoPokemon:"  [SOURCE]'s attack missed!",center:"  Automatic center!",noTarget:"  But there was no target...",ohko:"  It's a one-hit KO!",combine:"  The two moves have become one! It's a combined move!",hitCount:"  The Pokémon was hit [NUMBER] times!",hitCountSingular:"  The Pokémon was hit 1 time!"},hp:{statName:"HP",statShortName:"HP"},atk:{statName:"Attack",statShortName:"Atk"},def:{statName:"Defense",statShortName:"Def"},spa:{statName:"Sp. Atk",statShortName:"SpA"},spd:{statName:"Sp. Def",statShortName:"SpD"},spe:{statName:"Speed",statShortName:"Spe"},accuracy:{statName:"accuracy"},evasion:{statName:"evasiveness"},spc:{statName:"Special",statShortName:"Spc"},stats:{statName:"stats"},brn:{start:"  [POKEMON] was burned!",startFromItem:"  [POKEMON] was burned by the [ITEM]!",alreadyStarted:"  [POKEMON] is already burned!",end:"  [POKEMON]'s burn was healed!",endFromItem:"  [POKEMON]'s [ITEM] healed its burn!",damage:"  [POKEMON] was hurt by its burn!"},frz:{start:"  [POKEMON] was frozen solid!",alreadyStarted:"  [POKEMON] is already frozen solid!",end:"  [POKEMON] thawed out!",endFromItem:"  [POKEMON]'s [ITEM] defrosted it!",endFromMove:"  [POKEMON]'s [MOVE] melted the ice!",cant:"[POKEMON] is frozen solid!"},par:{start:"  [POKEMON] is paralyzed! It may be unable to move!",alreadyStarted:"  [POKEMON] is already paralyzed!",end:"  [POKEMON] was cured of paralysis!",endFromItem:"  [POKEMON]'s [ITEM] cured its paralysis!",cant:"[POKEMON] is paralyzed! It can't move!"},psn:{start:"  [POKEMON] was poisoned!",startFromWeather:"  [POKEMON] was infected by the poisonous air!",alreadyStarted:"  [POKEMON] is already poisoned!",end:"  [POKEMON] was cured of its poisoning!",endFromItem:"  [POKEMON]'s [ITEM] cured its poison!",damage:"  [POKEMON] was hurt by poison!"},tox:{start:"  [POKEMON] was badly poisoned!",startFromItem:"  [POKEMON] was badly poisoned by the [ITEM]!",end:"#psn",endFromItem:"#psn",alreadyStarted:"#psn",damage:"#psn"},slp:{start:"  [POKEMON] fell asleep!",startFromRest:"  [POKEMON] slept and became healthy!",alreadyStarted:"  [POKEMON] is already asleep!",end:"  [POKEMON] woke up!",endFromItem:"  [POKEMON]'s [ITEM] woke it up!",cant:"[POKEMON] is fast asleep."},frb:{start:"  [POKEMON] got frostbite!",startFromItem:"  [POKEMON] got frostbite from the [ITEM]!",alreadyStarted:"  [POKEMON] is already frostbitten!",end:"  [POKEMON]'s frostbite was healed!",endFromItem:"  [POKEMON]'s [ITEM] healed its frostbite!",damage:"  [POKEMON] was hurt by its frostbite!"},confusion:{start:"  [POKEMON] became confused!",startFromWeather:"  [POKEMON] was confused by the infested air!",startFromFatigue:"  [POKEMON] became confused due to fatigue!",end:"  [POKEMON] snapped out of its confusion!",endFromItem:"  [POKEMON]'s [ITEM] snapped it out of its confusion!",alreadyStarted:"  [POKEMON] is already confused!",activate:"  [POKEMON] is confused!",damage:"It hurt itself in its confusion!"},drain:{heal:"  [SOURCE] had its energy drained!"},flinch:{cant:"[POKEMON] flinched and couldn't move!"},heal:{fail:"  [POKEMON]'s HP is full!"},healreplacement:{activate:"  [POKEMON] will restore its replacement's HP using its Z-Power!"},nopp:{cant:"[POKEMON] used [MOVE]!\n  But there was no PP left for the move!"},recharge:{cant:"[POKEMON] must recharge!"},recoil:{damage:"  [POKEMON] was damaged by the recoil!"},unboost:{fail:"  [POKEMON]'s stats were not lowered!",failSingular:"  [POKEMON]'s [STAT] was not lowered!"},struggle:{activate:"  [POKEMON] has no moves left!",descGen6:"Deals typeless damage to a random adjacent opposing Pokemon. If this move was successful, the user loses 1/4 of its maximum HP, rounded half up, and the Rock Head Ability does not prevent this. This move is automatically used if none of the user's known moves can be selected.",descGen4:"Deals typeless damage to a random opposing Pokemon. If this move was successful, the user loses 1/4 of its maximum HP, rounded down, and the Rock Head Ability does not prevent this. This move is automatically used if none of the user's known moves can be selected.",descGen3:"Deals typeless damage to a random opposing Pokemon. If this move was successful, the user takes damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP, and the Rock Head Ability does not prevent this. This move is automatically used if none of the user's known moves can be selected.",shortDescGen3:"User loses 1/4 the HP lost by the target.",descGen2:"Deals typeless damage. If this move was successful, the user takes damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. This move is automatically used if none of the user's known moves can be selected.",descGen1:"Deals Normal-type damage. If this move was successful, the user takes damage equal to 1/2 the HP lost by the target, rounded down, but not less than 1 HP. This move is automatically used if none of the user's known moves can be selected.",shortDescGen1:"User loses 1/2 the HP lost by the target."},trapped:{start:"  [POKEMON] can no longer escape!"},dynamax:{start:"  ([POKEMON]'s Dynamax!)",end:"  ([POKEMON] returned to normal!)",block:"  The move was blocked by the power of Dynamax!",fail:"  [POKEMON] shook its head. It seems like it can't use this move..."},sunnyday:{weatherName:"Sun",start:"  The sunlight turned harsh!",end:"  The harsh sunlight faded.",upkeep:"  (The sunlight is strong.)",descGen3:"For 5 turns, the weather becomes Sun. The damage of Fire-type attacks is multiplied by 1.5 and the damage of Water-type attacks is multiplied by 0.5 during the effect. Fails if the current weather is Sun.",descGen2:"For 5 turns, the weather becomes Sun, even if the current weather is Sun. The damage of Fire-type attacks is multiplied by 1.5 and the damage of Water-type attacks is multiplied by 0.5 during the effect."},raindance:{weatherName:"Rain",start:"  It started to rain!",end:"  The rain stopped.",upkeep:"  (Rain continues to fall.)",descGen3:"For 5 turns, the weather becomes Rain. The damage of Water-type attacks is multiplied by 1.5 and the damage of Fire-type attacks is multiplied by 0.5 during the effect. Fails if the current weather is Rain.",descGen2:"For 5 turns, the weather becomes Rain, even if the current weather is Rain. The damage of Water-type attacks is multiplied by 1.5 and the damage of Fire-type attacks is multiplied by 0.5 during the effect."},hail:{weatherName:"Hail",start:"  It started to hail!",end:"  The hail stopped.",upkeep:"  (The hail is crashing down.)",damage:"  [POKEMON] is buffeted by the hail!",descGen4:"For 5 turns, the weather becomes Hail. At the end of each turn except the last, all active Pokemon lose 1/16 of their maximum HP, rounded down, unless they are an Ice type or have the Ice Body, Magic Guard, or Snow Cloak Abilities. Lasts for 8 turns if the user is holding Icy Rock. Fails if the current weather is Hail.",descGen3:"For 5 turns, the weather becomes Hail. At the end of each turn except the last, all active Pokemon lose 1/16 of their maximum HP, rounded down, unless they are an Ice type. Fails if the current weather is Hail."},snow:{weatherName:"Snow",start:"  It started to snow!",end:"  The snow stopped.",upkeep:"  (The snow is falling down.)"},bloodmoon:{weatherName:"Blood Moon",start:"  A blood moon rises!",end:"  The blood moon passed.",upkeep:"  (It's the hour of the blood moon.)"},foghorn:{weatherName:"Fog",start:"  Fog settled on the battlefield!",end:"  The fog disappeared.",upkeep:"  (The fog is deep...)"},sandstorm:{weatherName:"Sandstorm",start:"  A sandstorm kicked up!",end:"  The sandstorm subsided.",upkeep:"  (The sandstorm is raging.)",damage:"  [POKEMON] is buffeted by the sandstorm!",descGen4:"For 5 turns, the weather becomes Sandstorm. At the end of each turn except the last, all active Pokemon lose 1/16 of their maximum HP, rounded down, unless they are a Ground, Rock, or Steel type, or have the Magic Guard or Sand Veil Abilities. During the effect, the Special Defense of Rock-type Pokemon is multiplied by 1.5 when taking damage from a special attack. Lasts for 8 turns if the user is holding Smooth Rock. Fails if the current weather is Sandstorm.",descGen3:"For 5 turns, the weather becomes Sandstorm. At the end of each turn except the last, all active Pokemon lose 1/16 of their maximum HP, rounded down, unless they are a Ground, Rock, or Steel type, or have the Sand Veil Ability. Fails if the current weather is Sandstorm.",shortDescGen3:"For 5 turns, a sandstorm rages.",descGen2:"For 5 turns, the weather becomes Sandstorm. At the end of each turn except the last, all active Pokemon lose 1/8 of their maximum HP, rounded down, unless they are a Ground, Rock, or Steel type. Fails if the current weather is Sandstorm."},duststorm:{weatherName:"Dust Storm",start:"  A dust devil formed!",end:"  The dust settled.",upkeep:"  (The dust is billowing.)"},pollinate:{weatherName:"Pollen Storm",start:"  Pollen enveloped the air!",end:"  The pollen dissipated.",upkeep:"  (The pollen is circulating.)"},swarmsignal:{weatherName:"Pheromones",start:"  Pheromones infested the air!",end:"  The pheromones faded.",upkeep:"  (The pheromones are spreading.)"},smogspread:{weatherName:"Smog",start:"  Poison contaminated the air!",end:"  The poison abated.",upkeep:"  (The poison persists.)"},sprinkle:{weatherName:"Fairy Dust",start:"  Fairy dust aromatized the battlefield!",end:"  The fairy dust dispelled.",upkeep:"  (The fairy dust is diffusing.)",heal:"  [POKEMON]'s HP was restored."},auraprojection:{weatherName:"Battle Aura",start:"  The battlefield was filled with fighting spirit!",end:"  The aura's pressure was lifted.",upkeep:"  (The combat pressure is overwhelming.)"},haunt:{weatherName:"Cursed Winds",start:"  A ghastly chill went up your spine...",end:"  The ominous presence left.",upkeep:"  (Spirits are haunting the air.)",damage:"  [POKEMON] was cursed by the wandering spirits!"},cosmicrays:{weatherName:"Psychic Field",start:"  A psychic field materialized!",end:"  The psychic energy faded.",upkeep:"  (The psychic energy is pulsing.)"},dragonforce:{weatherName:"Dragon Force",start:"  Arcane energy burst forth!",end:"  The arcane forces calmed down.",upkeep:"  (Arcane energy surrounds us.)"},supercell:{weatherName:"Thunderstorm",start:"  A thunderstorm formed!",end:"  The thunder ceased.",upkeep:"  (The thunder is roaring.)",damage:"  [POKEMON] was struck by lightning!"},magnetize:{weatherName:"Magnetosphere",start:"  The battlefield's magnetic flux intensified!",end:"  The magnetic field disappeared.",upkeep:"  (The magnetic poles are being pulled.)"},strongwinds:{weatherName:"Strong Winds",start:"  A strong gale cleared the battlefield!",end:"  The winds died down.",upkeep:"  (The winds blow strong.)"},desolateland:{weatherName:"Intense Sun",start:"  The sunlight turned extremely harsh!",end:"  The extremely harsh sunlight faded.",block:"  The extremely harsh sunlight was not lessened at all!",blockMove:"  The Water-type attack evaporated in the harsh sunlight!"},primordialsea:{weatherName:"Heavy Rain",start:"  A heavy rain began to fall!",end:"  The heavy rain has lifted!",block:"  There is no relief from this heavy rain!",blockMove:"  The Fire-type attack fizzled out in the heavy rain!"},deltastream:{weatherName:"Strong Winds",start:"  Mysterious strong winds are protecting Flying-type Pokémon!",end:"  The mysterious strong winds have dissipated!",activate:"  The mysterious strong winds weakened the attack!",block:"  The mysterious strong winds blow on regardless!"},electricterrain:{start:"  An electric current ran across the battlefield!",end:"  The electricity disappeared from the battlefield.",block:"  [POKEMON] is protected by the Electric Terrain!",descGen7:"For 5 turns, the terrain becomes Electric Terrain. During the effect, the power of Electric-type attacks made by grounded Pokemon is multiplied by 1.5 and grounded Pokemon cannot fall asleep; Pokemon already asleep do not wake up. Grounded Pokemon cannot become affected by Yawn or fall asleep from its effect. Camouflage transforms the user into an Electric type, Nature Power becomes Thunderbolt, and Secret Power has a 30% chance to cause paralysis. Fails if the current terrain is Electric Terrain."},grassyterrain:{start:"  Grass grew to cover the battlefield!",end:"  The grass disappeared from the battlefield.",heal:"  [POKEMON]'s HP was restored.",descGen7:"For 5 turns, the terrain becomes Grassy Terrain. During the effect, the power of Grass-type attacks used by grounded Pokemon is multiplied by 1.5, the power of Bulldoze, Earthquake, and Magnitude used against grounded Pokemon is multiplied by 0.5, and grounded Pokemon have 1/16 of their maximum HP, rounded down, restored at the end of each turn, including the last turn. Camouflage transforms the user into a Grass type, Nature Power becomes Energy Ball, and Secret Power has a 30% chance to cause sleep. Fails if the current terrain is Grassy Terrain."},mistyterrain:{start:"  Mist swirled around the battlefield!",end:"  The mist disappeared from the battlefield.",block:"  [POKEMON] surrounds itself with a protective mist!",descGen6:"For 5 turns, the terrain becomes Misty Terrain. During the effect, the power of Dragon-type attacks used against grounded Pokemon is multiplied by 0.5 and grounded Pokemon cannot be inflicted with a non-volatile status condition. Grounded Pokemon can become affected by Yawn but cannot fall asleep from its effect. Camouflage transforms the user into a Fairy type, Nature Power becomes Moonblast, and Secret Power has a 30% chance to lower Special Attack by 1 stage. Fails if the current terrain is Misty Terrain."},psychicterrain:{start:"  The battlefield got weird!",end:"  The weirdness disappeared from the battlefield!",block:"  [POKEMON] is protected by the Psychic Terrain!",descGen7:"For 5 turns, the terrain becomes Psychic Terrain. During the effect, the power of Psychic-type attacks made by grounded Pokemon is multiplied by 1.5 and grounded Pokemon cannot be hit by moves with priority greater than 0, unless the target is an ally. Camouflage transforms the user into a Psychic type, Nature Power becomes Psychic, and Secret Power has a 30% chance to lower the target's Speed by 1 stage. Fails if the current terrain is Psychic Terrain."},gravity:{start:"  Gravity intensified!",end:"  Gravity returned to normal!",cant:"[POKEMON] can't use [MOVE] because of gravity!",activate:"[POKEMON] fell from the sky due to the gravity!",descGen7:"For 5 turns, the evasiveness of all active Pokemon is multiplied by 0.6. At the time of use, Bounce, Fly, Magnet Rise, Sky Drop, and Telekinesis end immediately for all active Pokemon. During the effect, Bounce, Fly, Flying Press, High Jump Kick, Jump Kick, Magnet Rise, Sky Drop, Splash, and Telekinesis are prevented from being used by all active Pokemon. Ground-type attacks, Spikes, Toxic Spikes, Sticky Web, and the Arena Trap Ability can affect Flying types or Pokemon with the Levitate Ability. Fails if this move is already in effect. Relevant Z-Powered moves can still be selected, but will be prevented at execution during this effect.",descGen6:"For 5 turns, the evasiveness of all active Pokemon is multiplied by 0.6. At the time of use, Bounce, Fly, Magnet Rise, Sky Drop, and Telekinesis end immediately for all active Pokemon. During the effect, Bounce, Fly, Flying Press, High Jump Kick, Jump Kick, Magnet Rise, Sky Drop, Splash, and Telekinesis are prevented from being used by all active Pokemon. Ground-type attacks, Spikes, Toxic Spikes, Sticky Web, and the Arena Trap Ability can affect Flying types or Pokemon with the Levitate Ability. Fails if this move is already in effect.",descGen5:"For 5 turns, the evasiveness of all active Pokemon is multiplied by 0.6. At the time of use, Bounce, Fly, Magnet Rise, Sky Drop, and Telekinesis end immediately for all active Pokemon. During the effect, Bounce, Fly, High Jump Kick, Jump Kick, Magnet Rise, Sky Drop, Splash, and Telekinesis are prevented from being used by all active Pokemon. Ground-type attacks, Spikes, Toxic Spikes, and the Arena Trap Ability can affect Flying types or Pokemon with the Levitate Ability. Fails if this move is already in effect.",descGen4:"For 5 turns, the evasiveness of all active Pokemon is multiplied by 0.6. At the time of use, Bounce, Fly, and Magnet Rise end immediately for all active Pokemon. During the effect, Bounce, Fly, High Jump Kick, Jump Kick, Magnet Rise, and Splash are prevented from being used by all active Pokemon. Ground-type attacks, Spikes, Toxic Spikes, and the Arena Trap Ability can affect Flying types or Pokemon with the Levitate Ability. Fails if this move is already in effect."},magicroom:{start:"  It created a bizarre area in which Pokémon's held items lose their effects!",end:"  Magic Room wore off, and held items' effects returned to normal!"},mudsport:{start:"  Electricity's power was weakened!",end:"  The effects of Mud Sport have faded.",descGen5:"While the user is active, all Electric-type attacks used by any active Pokemon have their power multiplied by 0.33. Fails if this effect is already active for any Pokemon.",shortDescGen5:"Weakens Electric-type attacks to 1/3 their power.",descGen4:"While the user is active, all Electric-type attacks used by any active Pokemon have their power halved. Fails if this effect is already active for the user. Baton Pass can be used to transfer this effect to an ally.",shortDescGen4:"Weakens Electric-type attacks to 1/2 their power."},trickroom:{start:"  [POKEMON] twisted the dimensions!",end:"  The twisted dimensions returned to normal!",descGen4:"For 5 turns, all active Pokemon with lower Speed will move before those with higher Speed, within their priority brackets. If this move is used during the effect, the effect ends."},watersport:{start:"  Fire's power was weakened!",end:"  The effects of Water Sport have faded.",descGen5:"While the user is active, all Fire-type attacks used by any active Pokemon have their power multiplied by 0.33. Fails if this effect is already active for any Pokemon.",shortDescGen5:"Weakens Fire-type attacks to 1/3 their power.",descGen4:"While the user is active, all Fire-type attacks used by any active Pokemon have their power halved. Fails if this effect is already active for the user. Baton Pass can be used to transfer this effect to an ally.",shortDescGen4:"Weakens Fire-type attacks to 1/2 their power."},wonderroom:{start:"  It created a bizarre area in which Defense and Sp. Def stats are swapped!",end:"  Wonder Room wore off, and Defense and Sp. Def stats returned to normal!"},crash:{damage:"  [POKEMON] kept going and crashed!"},absorb:{descGen4:"The user recovers 1/2 the HP lost by the target, rounded down. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down.",descGen3:"The user recovers 1/2 the HP lost by the target, rounded down.",descGen2:"The user recovers 1/2 the HP lost by the target, rounded down. If the target has a substitute, this move misses.",descGen1:"The user recovers 1/2 the HP lost by the target, rounded down. If this move breaks the target's substitute, the user does not recover any HP."},acid:{descGen3:"Has a 10% chance to lower the target's Defense by 1 stage.",shortDescGen3:"10% chance to lower the foe(s) Defense by 1.",descGen1:"Has a 33% chance to lower the target's Defense by 1 stage.",shortDescGen1:"33% chance to lower the target's Defense by 1.",shortDescGen2:"10% chance to lower the target's Defense by 1."},acupressure:{descGen4:"Raises a random stat by 2 stages as long as the stat is not already at stage 6. The user can choose to use this move on itself or an ally. Fails if no stat stage can be raised or if the user or ally has a substitute."},afteryou:{activate:"  [TARGET] took the kind offer!"},allyswitch:{descGen8:"The user swaps positions with its ally. Fails if the user is the only Pokemon on its side.",shortDescGen8:"The user swaps positions with its ally.",descGen6:"The user swaps positions with its ally on the opposite side of the field. Fails if there is no Pokemon at that position, if the user is the only Pokemon on its side, or if the user is in the middle.",shortDescGen6:"Switches position with the ally on the far side."},amnesia:{descGen1:"Raises the user's Special by 2 stages.",shortDescGen1:"Raises the user's Special by 2."},anchorshot:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field."},aquaring:{start:"  [POKEMON] surrounded itself with a veil of water!",heal:"  A veil of water restored [POKEMON]'s HP!"},armthrust:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits."},aromatherapy:{descGen5:"Every Pokemon in the user's party is cured of its non-volatile status condition.",activate:"  A soothing aroma wafted through the area!"},assist:{descGen8:"A random move among those known by the user's party members is selected for use. Does not select Assist, Baneful Bunker, Beak Blast, Belch, Bestow, Bounce, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dig, Dive, Dragon Tail, Endure, Feint, Fly, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Phantom Force, Protect, Rage Powder, Roar, Shadow Force, Shell Trap, Sketch, Sky Drop, Sleep Talk, Snatch, Spiky Shield, Spotlight, Struggle, Switcheroo, Thief, Transform, Trick, or Whirlwind.",descGen7:"A random move among those known by the user's party members is selected for use. Does not select Assist, Baneful Bunker, Beak Blast, Belch, Bestow, Bounce, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dig, Dive, Dragon Tail, Endure, Feint, Fly, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Phantom Force, Protect, Rage Powder, Roar, Shadow Force, Shell Trap, Sketch, Sky Drop, Sleep Talk, Snatch, Spiky Shield, Spotlight, Struggle, Switcheroo, Thief, Transform, Trick, Whirlwind, or any Z-Move.",descGen6:"A random move among those known by the user's party members is selected for use. Does not select Assist, Belch, Bestow, Bounce, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dig, Dive, Dragon Tail, Endure, Feint, Fly, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Phantom Force, Protect, Rage Powder, Roar, Shadow Force, Sketch, Sky Drop, Sleep Talk, Snatch, Spiky Shield, Struggle, Switcheroo, Thief, Transform, Trick, or Whirlwind.",descGen5:"A random move among those known by the user's party members is selected for use. Does not select Assist, Bestow, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dragon Tail, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Rage Powder, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief, Transform, or Trick.",descGen4:"A random move among those known by the user's party members is selected for use. Does not select Assist, Chatter, Copycat, Counter, Covet, Destiny Bond, Detect, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Protect, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief, or Trick.",descGen3:"A random move among those known by the user's party members is selected for use. Does not select Assist, Counter, Covet, Destiny Bond, Detect, Endure, Focus Punch, Follow Me, Helping Hand, Metronome, Mimic, Mirror Coat, Mirror Move, Protect, Sketch, Sleep Talk, Snatch, Struggle, Thief, or Trick."},assurance:{descGen4:"Power doubles if the target has already taken damage this turn."},astonish:{descGen3:"Has a 30% chance to make the target flinch. Damage doubles if the target has used Minimize while active."},attract:{descGen5:"Causes the target to become infatuated, making it unable to attack 50% of the time. Fails if both the user and the target are the same gender, if either is genderless, or if the target is already infatuated. The effect ends when either the user or the target is no longer active. Pokemon with the Oblivious Ability are immune.",descGen2:"Causes the target to become infatuated, making it unable to attack 50% of the time. Fails if both the user and the target are the same gender, if either is genderless, or if the target is already infatuated. The effect ends when either the user or the target is no longer active.",start:"  [POKEMON] fell in love!",startFromItem:"  [POKEMON] fell in love because of the [ITEM]!",end:"  [POKEMON] got over its infatuation!",endFromItem:"  [POKEMON] cured its infatuation using its [ITEM]!",activate:"  [POKEMON] is in love with [TARGET]!",cant:"[POKEMON] is immobilized by love!"},aurorabeam:{descGen1:"Has a 33% chance to lower the target's Attack by 1 stage.",shortDescGen1:"33% chance to lower the target's Attack by 1."},auroraveil:{descGen8:"For 5 turns, the user and its party members take 0.5x damage from physical and special attacks, or 0.66x damage if in a Double Battle; does not reduce damage further with Reflect or Light Screen. Critical hits ignore this protection. It is removed from the user's side if the user or an ally is successfully hit by Brick Break, Psychic Fangs, or Defog. Brick Break and Psychic Fangs remove the effect before damage is calculated. Lasts for 8 turns if the user is holding Light Clay. Fails unless the weather is Hail.",shortDescGen8:"For 5 turns, damage to allies is halved. Hail only.",start:"  Aurora Veil made [TEAM] stronger against physical and special moves!",end:"  [TEAM]'s Aurora Veil wore off!"},autotomize:{start:"  [POKEMON] became nimble!"},avalanche:{descGen4:"Power doubles if the user was hit by a Pokemon in the target's position this turn."},axekick:{damage:"#crash"},banefulbunker:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon making contact with the user become poisoned. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon making contact with the user become poisoned. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn."},barrage:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},beakblast:{start:"  [POKEMON] started heating up its beak!"},beatup:{descGen4:"Deals typeless damage. Hits one time for the user and one time for each unfainted Pokemon without a non-volatile status condition in the user's party. For each hit, the damage formula uses the participating Pokemon's base Attack as the Attack stat, the target's base Defense as the Defense stat, and ignores stat stages and other effects that modify Attack or Defense; each hit is considered to come from the user.",descGen3:"Deals typeless damage. Hits one time for each unfainted Pokemon without a non-volatile status condition in the user's party, or fails if no Pokemon meet the criteria. For each hit, the damage formula uses the participating Pokemon's base Attack as the Attack stat, the target's base Defense as the Defense stat, and ignores stat stages and other effects that modify Attack or Defense; each hit is considered to come from the user.",descGen2:"Deals typeless damage. Hits one time for each unfainted Pokemon without a non-volatile status condition in the user's party. For each hit, the damage formula uses the participating Pokemon's level, its base Attack as the Attack stat, the target's base Defense as the Defense stat, and ignores stat stages and other effects that modify Attack or Defense. Fails if no party members can participate.",activate:"  [NAME]'s attack!"},behemothbash:{shortDescGen8:"Damage doubles if the target is Dynamaxed."},behemothblade:{shortDescGen8:"Damage doubles if the target is Dynamaxed."},bellydrum:{boost:"  [POKEMON] cut its own HP and maximized its Attack!"},bestow:{descGen6:"The target receives the user's held item. Fails if the user has no item or is holding a Mail, if the target is already holding an item, if the user is a Kyogre holding a Blue Orb, a Groudon holding a Red Orb, a Giratina holding a Griseous Orb, an Arceus holding a Plate, a Genesect holding a Drive, a Pokemon that can Mega Evolve holding the Mega Stone for its species, or if the target is one of those Pokemon and the user is holding the respective item.",descGen5:"The target receives the user's held item. Fails if the user has no item or is holding a Mail, if the target is already holding an item, if the user is a Giratina holding a Griseous Orb, an Arceus holding a Plate, a Genesect holding a Drive, or if the target is one of those Pokemon and the user is holding the respective item.",takeItem:"  [SOURCE] gave [POKEMON] its [ITEM]!"},bide:{descGen4:"The user spends two turns locked into this move and then, on the second turn after using this move, the user attacks the last Pokemon that hit it, inflicting double the damage in HP it lost to attacks during the two turns. If the last Pokemon that hit it is no longer active, the user attacks a random opposing Pokemon instead. If the user is prevented from moving during this move's use, the effect ends. This move does not check accuracy and ignores type immunity.",descGen3:"The user spends two turns locked into this move and then, on the second turn after using this move, the user attacks the last Pokemon that hit it, inflicting double the damage in HP it lost during the two turns. If the last Pokemon that hit it is no longer active, the user attacks a random opposing Pokemon instead. If the user is prevented from moving during this move's use, the effect ends. This move does not ignore type immunity.",descGen2:"The user spends two or three turns locked into this move and then, on the second or third turn after using this move, the user attacks the opponent, inflicting double the damage in HP it lost during those turns. If the user is prevented from moving during this move's use, the effect ends. This move does not ignore type immunity.",shortDescGen2:"Waits 2-3 turns; deals double the damage taken.",descGen1:"The user spends two or three turns locked into this move and then, on the second or third turn after using this move, the user attacks the opponent, inflicting double the damage in HP it lost during those turns. This move ignores type immunity and cannot be avoided even if the target is using Dig or Fly. The user can choose to switch out during the effect. If the user switches out or is prevented from moving during this move's use, the effect ends. During the effect, if the opposing Pokemon switches out or uses Confuse Ray, Conversion, Focus Energy, Glare, Haze, Leech Seed, Light Screen, Mimic, Mist, Poison Gas, Poison Powder, Recover, Reflect, Rest, Soft-Boiled, Splash, Stun Spore, Substitute, Supersonic, Teleport, Thunder Wave, Toxic, or Transform, the previous damage dealt to the user will be added to the total.",start:"  [POKEMON] is storing energy!",end:"  [POKEMON] unleashed its energy!",activate:"  [POKEMON] is storing energy!"},bind:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen1:"The user spends two to five turns using this move. Has a 3/8 chance to last two or three turns, and a 1/8 chance to last four or five turns. The damage calculated for the first turn is used for every other turn. The user cannot select a move and the target cannot execute a move during the effect, but both may switch out. If the user switches out, the target remains unable to execute a move during that turn. If the target switches out, the user uses this move again automatically, and if it had 0 PP at the time, it becomes 63. If the user or the target switch out, or the user is prevented from moving, the effect ends. This move can prevent the target from moving even if it has type immunity, but will not deal damage.",shortDescGen1:"Prevents the target from moving for 2-5 turns.",start:"  [POKEMON] was squeezed by [SOURCE]!",move:"#wrap"},bite:{descGen1:"Has a 10% chance to make the target flinch.",shortDescGen1:"10% chance to make the target flinch."},blizzard:{descGen8:"Has a 10% chance to freeze the target. If the weather is Hail, this move does not check accuracy.",shortDescGen8:"10% chance to freeze foe(s). Can't miss in Hail.",descGen3:"Has a 10% chance to freeze the target.",shortDescGen3:"10% chance to freeze foe(s).",shortDescGen2:"10% chance to freeze the target."},block:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen5:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen4:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped.",descGen3:"Prevents the target from switching out. The target can still switch out if it uses Baton Pass. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped."},bodyslam:{descGen5:"Has a 30% chance to paralyze the target."},bonemerang:{descGen4:"Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit.",descGen1:"Hits twice. If the first hit breaks the target's substitute, the move ends."},bonerush:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits."},bounce:{descGen5:"Has a 30% chance to paralyze the target. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Hurricane, Sky Uppercut, Smack Down, Thunder, and Twister, and Gust and Twister have doubled power when used against it. If the user is holding a Power Herb, the move completes in one turn.",descGen4:"Has a 30% chance to paralyze the target. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Sky Uppercut, Thunder, and Twister, and Gust and Twister have doubled power when used against it. If the user is holding a Power Herb, the move completes in one turn.",descGen3:"Has a 30% chance to paralyze the target. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Sky Uppercut, Thunder, and Twister, and Gust and Twister have doubled power when used against it.",prepare:"[POKEMON] sprang up!"},bravebird:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen4:"Has 1/3 recoil."},brickbreak:{descGen6:"If this attack does not miss, the effects of Reflect and Light Screen end for the target's side of the field before damage is calculated.",descGen4:"If this attack does not miss and whether or not the target is immune, the effects of Reflect and Light Screen end for the target's side of the field before damage is calculated.",shortDescGen4:"Destroys screens, even if the target is immune.",descGen3:"If this attack does not miss and whether or not the target is immune, the effects of Reflect and Light Screen end for the opponent's side of the field before damage is calculated.",activate:"  [POKEMON] shattered [TEAM]'s protections!"},bubble:{descGen1:"Has a 33% chance to lower the target's Speed by 1 stage.",shortDescGen1:"33% chance to lower the target's Speed by 1.",shortDescGen2:"10% chance to lower the target's Speed by 1."},bubblebeam:{descGen1:"Has a 33% chance to lower the target's Speed by 1 stage.",shortDescGen1:"33% chance to lower the target's Speed by 1."},bugbite:{descGen4:"The user steals the target's held Berry if it is holding one and eats it immediately, gaining its effects unless the user's item is being ignored. Items lost to this move can be regained with Recycle.",removeItem:"  [SOURCE] stole and ate its target's [ITEM]!"},bulletseed:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits."},burnup:{descGen8:"Fails unless the user is a Fire type. If this move is successful, the user's Fire type becomes typeless as long as it remains active.",typeChange:"  [POKEMON] burned itself out!"},camouflage:{descGen6:"The user's type changes based on the battle terrain. Normal type on the regular Wi-Fi terrain, Electric type during Electric Terrain, Fairy type during Misty Terrain, and Grass type during Grassy Terrain. Fails if the user's type cannot be changed or if the user is already purely that type.",descGen5:"The user's type changes based on the battle terrain. Ground type on the regular Wi-Fi terrain. Fails if the user's type cannot be changed or if the user is already purely that type.",shortDescGen5:"Changes user's type based on terrain. (Ground)",descGen4:"The user's type changes based on the battle terrain. Normal type on the regular Wi-Fi terrain. Fails if the user has the Multitype Ability or if the type is one of the user's current types.",shortDescGen4:"Changes user's type based on terrain. (Normal)",descGen3:"The user's type changes based on the battle terrain. Normal type on the regular Wi-Fi terrain. Fails if the type is one of the user's current types."},celebrate:{activate:"  Congratulations, [TRAINER]!"},charge:{descGen8:"Raises the user's Special Defense by 1 stage. If the user uses an Electric-type attack on the next turn, its power will be doubled.",shortDescGen8:"+1 SpD, user's Electric move next turn 2x power.",descGen3:"If the user uses an Electric-type attack on the next turn, its power will be doubled.",shortDescGen3:"The user's Electric attack next turn has 2x power.",start:"  [POKEMON] began charging power!"},chatter:{descGen5:"Has an X% chance to confuse the target, where X is 0 unless the user is a Chatot that hasn't Transformed. If the user is a Chatot, X is 0 or 10 depending on the volume of Chatot's recorded cry, if any; 0 for a low volume or no recording, 10 for a medium to high volume recording.",shortDescGen5:"For Chatot, 10% chance to confuse the target.",descGen4:"Has an X% chance to confuse the target, where X is 0 unless the user is a Chatot that hasn't Transformed. If the user is a Chatot, X is 1, 11, or 31 depending on the volume of Chatot's recorded cry, if any; 1 for no recording or low volume, 11 for medium volume, and 31 for high volume.",shortDescGen4:"For Chatot, 31% chance to confuse the target."},chillyreception:{activate:"  [POKEMON] is preparing to tell a chillingly bad joke!"},clamp:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen1:"The user spends two to five turns using this move. Has a 3/8 chance to last two or three turns, and a 1/8 chance to last four or five turns. The damage calculated for the first turn is used for every other turn. The user cannot select a move and the target cannot execute a move during the effect, but both may switch out. If the user switches out, the target remains unable to execute a move during that turn. If the target switches out, the user uses this move again automatically, and if it had 0 PP at the time, it becomes 63. If the user or the target switch out, or the user is prevented from moving, the effect ends. This move can prevent the target from moving even if it has type immunity, but will not deal damage.",shortDescGen1:"Prevents the target from moving for 2-5 turns.",start:"  [SOURCE] clamped down on [POKEMON]!",move:"#wrap"},cometpunch:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},constrict:{descGen1:"Has a 33% chance to lower the target's Speed by 1 stage.",shortDescGen1:"33% chance to lower the target's Speed by 1."},conversion:{descGen5:"The user's type changes to match the original type of one of its known moves besides this move, at random, but not either of its current types. Fails if the user cannot change its type, or if this move would only be able to select one of the user's current types.",shortDescGen5:"Changes user's type to match a known move.",descGen4:"The user's type changes to match the original type of one of its known moves besides this move and Curse, at random, but not either of its current types. Fails if the user cannot change its type, or if this move would only be able to select one of the user's current types.",descGen3:"The user's type changes to match the original type of one of its known moves besides Curse, at random, but not either of its current types. Fails if the user cannot change its type, or if this move would only be able to select one of the user's current types.",descGen1:"Causes the user's types to become the same as the current types of the target.",shortDescGen1:"User becomes the same type as the target.",typeChange:"  Converted type to [SOURCE]'s!"},conversion2:{descGen4:"The user's type changes to match a type that resists or is immune to the type of the last move used against the user, if it was successful against the user, but not either of its current types. The determined type of the move is used rather than the original type. Fails if the last move used against the user was not successful, if the user has the Multitype Ability, or if this move would only be able to select one of the user's current types.",shortDescGen4:"User's type changes to resist last move against it.",descGen3:"The user's type changes to match a type that resists or is immune to the type of the last move used against the user, if it was successful against the user, but not either of its current types. The determined type of the move is used rather than the original type, but considers Struggle as Normal. Fails if the last move used against the user was not successful, or if this move would only be able to select one of the user's current types.",descGen2:"The user's type changes to match a type that resists or is immune to the type of the last move used by the opposing Pokemon, even if it is one of the user's current types. The original type of the move is used rather than the determined type. Fails if the opposing Pokemon has not used a move.",shortDescGen2:"Changes user's type to resist the foe's last move."},copycat:{descGen8:"The user uses the last move used by any Pokemon, including itself. The base move of Max and G-Max Moves is considered for this purpose. Fails if no move has been used, or if the last move used was Assist, Baneful Bunker, Beak Blast, Behemoth Bash, Behemoth Blade, Belch, Bestow, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dragon Tail, Dynamax Cannon, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Rage Powder, Roar, Shell Trap, Sketch, Sleep Talk, Snatch, Spiky Shield, Spotlight, Struggle, Switcheroo, Thief, Transform, Trick, or Whirlwind.",descGen7:"The user uses the last move used by any Pokemon, including itself. Fails if no move has been used, or if the last move used was Assist, Baneful Bunker, Beak Blast, Belch, Bestow, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dragon Tail, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Rage Powder, Roar, Shell Trap, Sketch, Sleep Talk, Snatch, Spiky Shield, Spotlight, Struggle, Switcheroo, Thief, Transform, Trick, Whirlwind, or any Z-Move.",descGen6:"The user uses the last move used by any Pokemon, including itself. Fails if no move has been used, or if the last move used was Assist, Belch, Bestow, Celebrate, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dragon Tail, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Hold Hands, King's Shield, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Rage Powder, Roar, Sketch, Sleep Talk, Snatch, Spiky Shield, Struggle, Switcheroo, Thief, Transform, Trick, or Whirlwind.",descGen5:"The user uses the last move used by any Pokemon, including itself. Fails if no move has been used, or if the last move used was Assist, Bestow, Chatter, Circle Throw, Copycat, Counter, Covet, Destiny Bond, Detect, Dragon Tail, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Rage Powder, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief, Transform, or Trick.",descGen4:"The user uses the last move used by any Pokemon, including itself. Fails if no move has been used, or if the last move used was Assist, Chatter, Copycat, Counter, Covet, Destiny Bond, Detect, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Protect, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief, or Trick."},coreenforcer:{descGen8:"If the user moves after the target, the target's Ability is rendered ineffective as long as it remains active. If the target uses Baton Pass, the replacement will remain under this effect. If the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode, this effect does not happen, and receiving the effect through Baton Pass ends the effect immediately.",descGen7:"If the user moves after the target, the target's Ability is rendered ineffective as long as it remains active. If the target uses Baton Pass, the replacement will remain under this effect. If the target's Ability is Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode, this effect does not happen, and receiving the effect through Baton Pass ends the effect immediately."},corrosivegas:{fail:"#healblock",removeItem:"  [SOURCE] corroded [POKEMON]'s [ITEM]!"},counter:{descGen6:"Deals damage to the last opposing Pokemon to hit the user with a physical attack this turn equal to twice the HP lost by the user from that attack. If the user did not lose HP from the attack, this move deals damage with a power of 1 instead. If that opposing Pokemon's position is no longer in use, the damage is done to a random opposing Pokemon in range. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's physical attack this turn.",descGen4:"Deals damage to the last opposing Pokemon to hit the user with a physical attack this turn equal to twice the HP lost by the user from that attack. If that opposing Pokemon's position is no longer in use and there is another opposing Pokemon on the field, the damage is done to it instead. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's physical attack this turn, or if the user did not lose HP from the attack.",descGen3:"Deals damage to the last opposing Pokemon to hit the user with a physical attack this turn equal to twice the HP lost by the user from that attack. If that opposing Pokemon's position is no longer in use and there is another opposing Pokemon on the field, the damage is done to it instead. This move considers Hidden Power as Normal type, and only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's physical attack this turn, or if the user did not lose HP from the attack.",descGen2:"Deals damage to the opposing Pokemon equal to twice the HP lost by the user from a physical attack this turn. This move considers Hidden Power as Normal type, and only the last hit of a multi-hit attack is counted. Fails if the user moves first, if the user was not hit by a physical attack this turn, or if the user did not lose HP from the attack. If the opposing Pokemon used Fissure or Horn Drill and missed, this move deals 65535 damage.",descGen1:"Deals damage to the opposing Pokemon equal to twice the damage dealt by the last move used in the battle. This move ignores type immunity. Fails if the user moves first, or if the opposing side's last move was Counter, had 0 power, or was not Normal or Fighting type. Fails if the last move used by either side did 0 damage and was not Confuse Ray, Conversion, Focus Energy, Glare, Haze, Leech Seed, Light Screen, Mimic, Mist, Poison Gas, Poison Powder, Recover, Reflect, Rest, Soft-Boiled, Splash, Stun Spore, Substitute, Supersonic, Teleport, Thunder Wave, Toxic, or Transform.",shortDescGen1:"If hit by Normal/Fighting move, deals 2x damage."},courtchange:{activate:"  [POKEMON] swapped the battle effects affecting each side of the field!"},covet:{descGen6:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail, or if the target is a Kyogre holding a Blue Orb, a Groudon holding a Red Orb, a Giratina holding a Griseous Orb, an Arceus holding a Plate, a Genesect holding a Drive, or a Pokemon that can Mega Evolve holding the Mega Stone for its species. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen5:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail, or if the target is a Giratina holding a Griseous Orb, an Arceus holding a Plate, or a Genesect holding a Drive. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen4:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail or Griseous Orb, or if the target has the Multitype Ability. Items lost to this move cannot be regained with Recycle.",descGen3:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail or Enigma Berry. Items lost to this move cannot be regained with Recycle."},craftyshield:{start:"  Crafty Shield protected [TEAM]!",block:"  Crafty Shield protected [POKEMON]!"},crunch:{descGen3:"Has a 20% chance to lower the target's Special Defense by 1 stage.",shortDescGen3:"20% chance to lower the target's Sp. Def by 1."},crushgrip:{descGen4:"Power is equal to 120 * (target's current HP / target's maximum HP) + 1, rounded down."},curse:{descGen4:"If the user is not a Ghost type, lowers the user's Speed by 1 stage and raises the user's Attack and Defense by 1 stage. If the user is a Ghost type, the user loses 1/2 of its maximum HP, rounded down and even if it would cause fainting, in exchange for the target losing 1/4 of its maximum HP, rounded down, at the end of each turn while it is active. If the target uses Baton Pass, the replacement will continue to be affected. Fails if there is no target or if the target is already affected or has a substitute.",descGen2:"If the user is not a Ghost type, lowers the user's Speed by 1 stage and raises the user's Attack and Defense by 1 stage, unless the user's Attack and Defense stats are both at stage 6. If the user is a Ghost type, the user loses 1/2 of its maximum HP, rounded down and even if it would cause fainting, in exchange for the target losing 1/4 of its maximum HP, rounded down, at the end of each turn while it is active. If the target uses Baton Pass, the replacement will continue to be affected. Fails if the target is already affected or has a substitute.",start:"  [SOURCE] cut its own HP and put a curse on [POKEMON]!",damage:"  [POKEMON] is afflicted by the curse!"},darkvoid:{descGen6:"Causes the target to fall asleep.",shortDescGen6:"Causes the foe(s) to fall asleep.",fail:"But [POKEMON] can't use the move!",failWrongForme:"But [POKEMON] can't use it the way it is now!"},defensecurl:{descGen2:"Raises the user's Defense by 1 stage. While the user remains active, the power of the user's Rollout will be doubled (this effect is not stackable). Baton Pass can be used to transfer this effect to an ally.",descGen1:"Raises the user's Defense by 1 stage."},defog:{descGen7:"Lowers the target's evasiveness by 1 stage. If this move is successful and whether or not the target's evasiveness was affected, the effects of Reflect, Light Screen, Aurora Veil, Safeguard, Mist, Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the target's side, and the effects of Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the user's side. Ignores a target's substitute, although a substitute will still block the lowering of evasiveness.",shortDescGen7:"-1 evasion; clears user and target side's hazards.",descGen6:"Lowers the target's evasiveness by 1 stage. If this move is successful and whether or not the target's evasiveness was affected, the effects of Reflect, Light Screen, Safeguard, Mist, Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the target's side, and the effects of Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the user's side. Ignores a target's substitute, although a substitute will still block the lowering of evasiveness.",descGen5:"Lowers the target's evasiveness by 1 stage. If this move is successful and whether or not the target's evasiveness was affected, the effects of Reflect, Light Screen, Safeguard, Mist, Spikes, Toxic Spikes, and Stealth Rock end for the target's side. Ignores a target's substitute, although a substitute will still block the lowering of evasiveness.",shortDescGen5:"-1 evasion; clears target side's hazards/screens."},destinybond:{descGen6:"Until the user's next turn, if an opposing Pokemon's attack knocks the user out, that Pokemon faints as well, unless the attack was Doom Desire or Future Sight.",descGen2:"Until the user's next turn, if an opposing Pokemon's attack knocks the user out, that Pokemon faints as well.",start:"  [POKEMON] is hoping to take its attacker down with it!",activate:"[POKEMON] took its attacker down with it!"},detect:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen6:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen5:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, Protect, Quick Guard, or Wide Guard. Fails if the user moves last this turn.",descGen4:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used, up to a maximum of 8. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen3:"The user is protected from most attacks made by other Pokemon during this turn. This move has an X/65536 chance of being successful, where X starts at 65535 and halves, rounded down, each time this move is successfully used. After the fourth successful use in a row, X drops to 118 and continues with seemingly random values from 0-65535 on subsequent successful uses. X resets to 65535 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen2:"The user is protected from attacks made by the opponent during this turn. This move has an X/255 chance of being successful, where X starts at 255 and halves, rounded down, each time this move is successfully used. X resets to 255 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user has a substitute or moves last this turn."},diamondstorm:{descGen6:"Has a 50% chance to raise the user's Defense by 1 stage for each hit.",shortDescGen6:"50% chance to raise user's Def by 1 for each hit."},dig:{descGen4:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Earthquake and Magnitude, which have doubled power when used against it, and is also unaffected by weather. If the user is holding a Power Herb, the move completes in one turn.",descGen3:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Earthquake and Magnitude, which have doubled power when used against it, and is also unaffected by weather.",descGen2:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Earthquake, Fissure, and Magnitude, the user is unaffected by weather, and Earthquake and Magnitude have doubled power when used against the user.",descGen1:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Bide, Swift, and Transform. If the user is fully paralyzed on the second turn, it continues avoiding attacks until it switches out or successfully executes the second turn of this move or Fly.",prepare:"[POKEMON] burrowed its way under the ground!"},disable:{descGen7:"For 4 turns, the target's last move used becomes disabled. Fails if one of the target's moves is already disabled, if the target has not made a move, if the target no longer knows the move, or if the move was a Z-Move. Z-Powered moves can still be selected and executed during this effect.",descGen6:"For 4 turns, the target's last move used becomes disabled. Fails if one of the target's moves is already disabled, if the target has not made a move, or if the target no longer knows the move.",descGen4:"For 4 to 7 turns, the target's last move used becomes disabled. Fails if one of the target's moves is already disabled, if the target has not made a move, if the target no longer knows the move, or if the move has 0 PP.",shortDescGen4:"For 4-7 turns, disables the target's last move.",descGen3:"For 2 to 5 turns, the target's last move used becomes disabled. Fails if one of the target's moves is already disabled, if the target has not made a move, if the target no longer knows the move, or if the move has 0 PP.",shortDescGen3:"For 2-5 turns, disables the target's last move.",descGen2:"For 1 to 7 turns, the target's last move used becomes disabled. Fails if one of the target's moves is already disabled, if the target has not made a move, if the target no longer knows the move, or if the move has 0 PP.",shortDescGen2:"For 1-7 turns, disables the target's last move.",descGen1:"For 0 to 7 turns, one of the target's known moves that has at least 1 PP remaining becomes disabled, at random. Fails if one of the target's moves is already disabled, or if none of the target's moves have PP remaining. If any Pokemon uses Haze, this effect ends. Whether or not this move was successful, it counts as a hit for the purposes of the opponent's use of Rage.",shortDescGen1:"For 0-7 turns, disables one of the target's moves.",start:"  [POKEMON]'s [MOVE] was disabled!",end:"  [POKEMON]'s move is no longer disabled!",cant:"[POKEMON]'s [MOVE] is disabled!"},dive:{descGen4:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Surf and Whirlpool, which have doubled power when used against it, and is also unaffected by weather. If the user is holding a Power Herb, the move completes in one turn.",descGen3:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Surf and Whirlpool, which have doubled power when used against it, and is also unaffected by weather.",prepare:"[POKEMON] hid underwater!"},dizzypunch:{descGen1:"No additional effect.",shortDescGen1:"No additional effect."},doomdesire:{descGen4:"Deals typeless damage that cannot be a critical hit two turns after this move is used. Damage is calculated against the target on use, and at the end of the final turn that damage is dealt to the Pokemon at the position the original target had at the time. Fails if this move or Future Sight is already in effect for the target's position.",start:"  [POKEMON] chose Doom Desire as its destiny!",activate:"  [TARGET] took the Doom Desire attack!"},doubleedge:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen4:"Has 1/3 recoil.",descGen2:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. If this move hits a substitute, the recoil damage is always 1 HP.",shortDescGen2:"Has 1/4 recoil.",descGen1:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not take any recoil damage."},doublehit:{descGen4:"Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits."},doublekick:{descGen4:"Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit.",descGen1:"Hits twice. Damage is calculated once for the first hit and used for both hits. If the first hit breaks the target's substitute, the move ends."},doubleshock:{typeChange:"  [POKEMON] used up all of its electricity!"},doubleslap:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},dragonascent:{megaNoItem:"  [TRAINER]'s fervent wish has reached [POKEMON]!"},dragonrush:{descGen5:"Has a 20% chance to make the target flinch."},drainpunch:{descGen4:"The user recovers 1/2 the HP lost by the target, rounded down. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down."},dreameater:{descGen4:"The target is unaffected by this move unless it is asleep and does not have a substitute. The user recovers 1/2 the HP lost by the target, rounded down, but not less than 1 HP. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down.",descGen3:"The target is unaffected by this move unless it is asleep and does not have a substitute. The user recovers 1/2 the HP lost by the target, rounded down, but not less than 1 HP.",descGen1:"The target is unaffected by this move unless it is asleep. The user recovers 1/2 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not recover any HP."},dynamaxcannon:{shortDescGen8:"Damage doubles if the target is Dynamaxed."},earthquake:{descGen4:"Power doubles if the target is using Dig.",shortDescGen4:"Hits adjacent Pokemon. Power doubles on Dig.",descGen1:"No additional effect.",shortDescGen1:"No additional effect.",shortDescGen2:"Power doubles on Dig."},eeriespell:{activate:"#spite"},electrify:{start:"  [POKEMON]'s moves have been electrified!"},electroball:{descGen5:"The power of this move depends on (user's current Speed / target's current Speed), rounded down. Power is equal to 150 if the result is 4 or more, 120 if 3, 80 if 2, 60 if 1, 40 if less than 1. If the target's current Speed is 0, it is treated as 1 instead."},embargo:{start:"  [POKEMON] can't use items anymore!",end:"  [POKEMON] can use items again!"},encore:{descGen8:"For its next 3 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, if the target is Dynamaxed, or if the move is Assist, Copycat, Dynamax Cannon, Encore, Me First, Metronome, Mimic, Mirror Move, Nature Power, Sketch, Sleep Talk, Struggle, or Transform.",descGen7:"For its next 3 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, or if the move is Assist, Copycat, Encore, Me First, Metronome, Mimic, Mirror Move, Nature Power, Sketch, Sleep Talk, Struggle, Transform, or any Z-Move. Z-Powered moves can still be selected and executed during this effect.",descGen6:"For 3 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, or if the move is Encore, Mimic, Mirror Move, Sketch, Struggle, or Transform.",descGen4:"For 4 to 8 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, or if the move is Encore, Mimic, Mirror Move, Sketch, Struggle, or Transform.",shortDescGen4:"The target repeats its last move for 4-8 turns.",descGen3:"For 3 to 6 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, or if the move is Encore, Mimic, Mirror Move, Sketch, Struggle, or Transform.",shortDescGen3:"The target repeats its last move for 3-6 turns.",descGen2:"For 3 to 6 turns, the target is forced to repeat its last move used. If the affected move runs out of PP, the effect ends. Fails if the target is already under this effect, if it has not made a move, if the move has 0 PP, or if the move is Encore, Metronome, Mimic, Mirror Move, Sketch, Sleep Talk, Struggle, or Transform.",start:"  [POKEMON] must do an encore!",end:"  [POKEMON]'s encore ended!"},endure:{descGen8:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen6:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen5:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, Protect, Quick Guard, or Wide Guard. Fails if the user moves last this turn.",descGen4:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used, up to a maximum of 8. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen3:"The user will survive attacks made by other Pokemon during this turn with at least 1 HP. This move has an X/65536 chance of being successful, where X starts at 65535 and halves, rounded down, each time this move is successfully used. After the fourth successful use in a row, X drops to 118 and continues with seemingly random values from 0-65535 on subsequent successful uses. X resets to 65535 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen2:"The user will survive attacks made by the opponent during this turn with at least 1 HP. This move has an X/255 chance of being successful, where X starts at 255 and halves, rounded down, each time this move is successfully used. X resets to 255 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user has a substitute or moves last this turn.",start:"  [POKEMON] braced itself!",activate:"  [POKEMON] endured the hit!"},entrainment:{descGen8:"Causes the target's Ability to become the same as the user's. Fails if the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Truant, Zen Mode, or the same Ability as the user, or if the user's Ability is As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, or Zen Mode.",descGen7:"Causes the target's Ability to become the same as the user's. Fails if the target's Ability is Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Truant, Zen Mode, or the same Ability as the user, or if the user's Ability is Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, or Zen Mode.",descGen6:"Causes the target's Ability to become the same as the user's. Fails if the target's Ability is Multitype, Stance Change, Truant, or the same Ability as the user, or if the user's Ability is Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, or Zen Mode.",descGen5:"Causes the target's Ability to become the same as the user's. Fails if the target's Ability is Multitype, Truant, or the same Ability as the user, or if the user's Ability is Flower Gift, Forecast, Illusion, Imposter, Multitype, Trace, or Zen Mode."},explosion:{descGen4:"The user faints after using this move, unless this move has no target. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",shortDescGen4:"Target's Def halved during damage. User faints.",descGen3:"The user faints after using this move. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",descGen2:"The user faints after using this move. The target's Defense is halved during damage calculation.",descGen1:"The user faints after using this move, unless this move broke the target's substitute. The target's Defense is halved during damage calculation."},extrasensory:{descGen3:"Has a 10% chance to make the target flinch. Damage doubles if the target has used Minimize while active."},extremespeed:{shortDescGen4:"Usually goes first."},facade:{descGen5:"Power doubles if the user is burned, paralyzed, or poisoned."},fairylock:{descGen7:"Prevents all active Pokemon from switching next turn. A Pokemon can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. Fails if the effect is already active.",activate:"  No one will be able to run away during the next turn!"},feint:{descGen6:"If this move is successful, it breaks through the target's Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally.",descGen5:"If this move is successful, it breaks through the target's Detect or Protect for this turn, allowing other Pokemon to attack the target normally. If the target is an opponent and its side is protected by Quick Guard or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the opponent's side normally.",descGen4:"Fails unless the target is using Detect or Protect. If this move is successful, it breaks through the target's Detect or Protect for this turn, allowing other Pokemon to attack the target normally.",shortDescGen4:"Breaks protection. Fails if target is not protecting.",activate:"  [TARGET] fell for the feint!"},fellstinger:{descGen6:"Raises the user's Attack by 2 stages if this move knocks out the target.",shortDescGen6:"Raises user's Attack by 2 if this KOes the target."},fireblast:{descGen1:"Has a 30% chance to burn the target.",shortDescGen1:"30% chance to burn the target."},firefang:{descGen4:"Has a 10% chance to burn the target and a 10% chance to make it flinch. This move can hit Pokemon with the Wonder Guard Ability regardless of their typing."},firepledge:{activate:"#waterpledge",start:"  A sea of fire enveloped [TEAM]!",end:"  The sea of fire around [TEAM] disappeared!",damage:"  [POKEMON] was hurt by the sea of fire!"},firespin:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen1:"The user spends two to five turns using this move. Has a 3/8 chance to last two or three turns, and a 1/8 chance to last four or five turns. The damage calculated for the first turn is used for every other turn. The user cannot select a move and the target cannot execute a move during the effect, but both may switch out. If the user switches out, the target remains unable to execute a move during that turn. If the target switches out, the user uses this move again automatically, and if it had 0 PP at the time, it becomes 63. If the user or the target switch out, or the user is prevented from moving, the effect ends. This move can prevent the target from moving even if it has type immunity, but will not deal damage.",shortDescGen1:"Prevents the target from moving for 2-5 turns.",start:"  [POKEMON] became trapped in the fiery vortex!",move:"#wrap"},fissure:{descGen2:"Deals 65535 damage to the target. This attack's accuracy out of 256 is equal to the lesser of (2 * (user's level - target's level) + 76) and 255, before applying accuracy and evasiveness modifiers. Fails if the target is at a higher level. Can hit a target using Dig.",descGen1:"Deals 65535 damage to the target. Fails if the target's Speed is greater than the user's.",shortDescGen1:"Deals 65535 damage. Fails if target is faster."},flail:{descGen4:"The power of this move is 20 if X is 43 to 48, 40 if X is 22 to 42, 80 if X is 13 to 21, 100 if X is 6 to 12, 150 if X is 2 to 5, and 200 if X is 0 or 1, where X is equal to (user's current HP * 64 / user's maximum HP), rounded down.",descGen3:"The power of this move is 20 if X is 33 to 48, 40 if X is 17 to 32, 80 if X is 10 to 16, 100 if X is 5 to 9, 150 if X is 2 to 4, and 200 if X is 0 or 1, where X is equal to (user's current HP * 48 / user's maximum HP), rounded down.",descGen2:"The power of this move is 20 if X is 33 to 48, 40 if X is 17 to 32, 80 if X is 10 to 16, 100 if X is 5 to 9, 150 if X is 2 to 4, and 200 if X is 0 or 1, where X is equal to (user's current HP * 48 / user's maximum HP), rounded down. This move does not apply damage variance and cannot be a critical hit."},flameburst:{descGen6:"If this move is successful, each ally adjacent to the target loses 1/16 of its maximum HP, rounded down, unless it has the Magic Guard Ability.",damage:"  The bursting flame hit [POKEMON]!"},flareblitz:{descGen4:"Has a 10% chance to burn the target. If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen4:"Has 1/3 recoil. 10% chance to burn. Thaws user."},fling:{descGen4:"The power of this move is based on the user's held item. The held item is lost and it activates for the target if applicable. If the target avoids this move by protecting itself, the user's held item is still lost. The user can regain a thrown item with Recycle. Fails if the user has no held item, if the held item cannot be thrown, or if the user is under the effect of Embargo.",removeItem:"  [POKEMON] flung its [ITEM]!"},flipturn:{switchOut:"#uturn"},fly:{descGen5:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Hurricane, Sky Uppercut, Smack Down, Thunder, and Twister, and Gust and Twister have doubled power when used against it. If the user is holding a Power Herb, the move completes in one turn.",descGen4:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Sky Uppercut, Thunder, and Twister, and Gust and Twister have doubled power when used against it. If the user is holding a Power Herb, the move completes in one turn.",descGen3:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Sky Uppercut, Thunder, and Twister, and Gust and Twister have doubled power when used against it.",descGen2:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Gust, Thunder, Twister, and Whirlwind, and Gust and Twister have doubled power when used against it.",descGen1:"This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks other than Bide, Swift, and Transform. If the user is fully paralyzed on the second turn, it continues avoiding attacks until it switches out or successfully executes the second turn of this move or Dig.",prepare:"[POKEMON] flew up high!"},focusenergy:{descGen2:"Raises the user's chance for a critical hit by 1 stage. Fails if the user already has the effect. Baton Pass can be used to transfer this effect to an ally.",shortDescGen2:"Raises the user's critical hit ratio by 1.",descGen1:"While the user remains active, its chance for a critical hit is quartered. Fails if the user already has the effect. If any Pokemon uses Haze, this effect ends.",shortDescGen1:"Quarters the user's chance for a critical hit.",start:"  [POKEMON] is getting pumped!",startFromItem:"  [POKEMON] used the [ITEM] to get pumped!",startFromZEffect:"  [POKEMON] boosted its critical-hit ratio using its Z-Power!"},focuspunch:{descGen4:"The user loses its focus and does nothing if it is hit by a damaging attack this turn before it can execute the move, but it still loses PP.",start:"  [POKEMON] is tightening its focus!",cant:"[POKEMON] lost its focus and couldn't move!"},followme:{descGen6:"Until the end of the turn, all single-target attacks from the opposing side are redirected to the user if they are in range. Such attacks are redirected to the user before they can be reflected by Magic Coat or the Magic Bounce Ability, or drawn in by the Lightning Rod or Storm Drain Abilities. Fails if it is not a Double or Triple Battle. This effect is ignored while the user is under the effect of Sky Drop.",descGen4:"Until the end of the turn, all single-target attacks from the opposing side are redirected to the user. Such attacks are redirected to the user before they can be reflected by Magic Coat, or drawn in by the Lightning Rod or Storm Drain Abilities. This effect remains active even if the user leaves the field. Fails if it is not a Double Battle.",descGen3:"Until the end of the turn, all single-target attacks from the opposing side are redirected to the user. Such attacks are redirected to the user before they can be reflected by Magic Coat, or drawn in by the Lightning Rod Ability. This effect remains active even if the user leaves the field. Fails if it is not a Double Battle.",start:"  [POKEMON] became the center of attention!",startFromZEffect:"  [POKEMON] became the center of attention!"},foresight:{descGen4:"As long as the target remains active, its evasiveness stat stage is ignored during accuracy checks against it if it is greater than 0, and Normal- and Fighting-type attacks can hit the target if it is a Ghost type.",descGen3:"As long as the target remains active, its evasiveness stat stage is ignored during accuracy checks against it, and Normal- and Fighting-type attacks can hit the target if it is a Ghost type.",descGen2:"As long as the target remains active, if its evasiveness stat stage is greater than the attacker's accuracy stat stage, both are ignored during accuracy checks, and Normal- and Fighting-type attacks can hit the target if it is a Ghost type. If the target leaves the field using Baton Pass, the replacement will remain under this effect. Fails if the target is already affected.",start:"  [POKEMON] was identified!"},freezeshock:{prepare:"  [POKEMON] became cloaked in a freezing light!"},furyattack:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},furyswipes:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},futuresight:{descGen4:"Deals typeless damage that cannot be a critical hit two turns after this move is used. Damage is calculated against the target on use, and at the end of the final turn that damage is dealt to the Pokemon at the position the original target had at the time. Fails if this move or Doom Desire is already in effect for the target's position.",descGen2:"Deals typeless damage that cannot be a critical hit two turns after this move is used. Damage is calculated against the target on use, and at the end of the final turn that damage is dealt to the Pokemon at the position the original target had at the time. Fails if this move is already in effect for the target's position.",start:"  [POKEMON] foresaw an attack!",activate:"  [TARGET] took the Future Sight attack!"},gastroacid:{descGen8:"Causes the target's Ability to be rendered ineffective as long as it remains active. If the target uses Baton Pass, the replacement will remain under this effect. If the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode, this move fails, and receiving the effect through Baton Pass ends the effect immediately.",descGen7:"Causes the target's Ability to be rendered ineffective as long as it remains active. If the target uses Baton Pass, the replacement will remain under this effect. If the target's Ability is Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode, this move fails, and receiving the effect through Baton Pass ends the effect immediately.",descGen6:"Causes the target's Ability to be rendered ineffective as long as it remains active. If the target uses Baton Pass, the replacement will remain under this effect. If the target's Ability is Multitype or Stance Change, this move fails, and receiving the effect through Baton Pass ends the effect immediately.",start:"  [POKEMON]'s Ability was suppressed!"},geomancy:{prepare:"[POKEMON] is absorbing power!"},gigadrain:{descGen4:"The user recovers 1/2 the HP lost by the target, rounded down. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down.",descGen3:"The user recovers 1/2 the HP lost by the target, rounded down."},glare:{descGen3:"Paralyzes the target. This move does not ignore type immunity.",descGen1:"Paralyzes the target."},gmaxcannonade:{start:"  [PARTY] got caught in the vortex of water!",damage:"  [POKEMON] is hurt by G-Max Cannonade’s vortex!"},gmaxchistrike:{start:"#focusenergy"},gmaxdepletion:{activate:"  [TARGET]'s PP was reduced!"},gmaxsteelsurge:{start:"  Sharp-pointed pieces of steel started floating around [PARTY]!",end:"  The pieces of steel surrounding [PARTY] disappeared!",damage:"  The sharp steel bit into [POKEMON]!"},gmaxvinelash:{start:"  [PARTY] got trapped with vines!",damage:"  [POKEMON] is hurt by G-Max Vine Lash’s ferocious beating!"},gmaxvolcalith:{start:"  [PARTY] became surrounded by rocks!",damage:"  [POKEMON] is hurt by the rocks thrown out by G-Max Volcalith!"},gmaxwildfire:{start:"  [PARTY] were surrounded by fire!",damage:"  [POKEMON] is burning up within G-Max Wildfire’s flames!"},grasspledge:{activate:"#waterpledge",start:"  A swamp enveloped [TEAM]!",end:"  The swamp around [TEAM] disappeared!"},growl:{shortDescGen2:"Lowers the target's Attack by 1."},growth:{descGen7:"Raises the user's Attack and Special Attack by 1 stage. If the weather is Sun or Desolate Land, this move raises the user's Attack and Special Attack by 2 stages.",descGen5:"Raises the user's Attack and Special Attack by 1 stage. If the weather is Sun, this move raises the user's Attack and Special Attack by 2 stages.",descGen4:"Raises the user's Special Attack by 1 stage.",shortDescGen4:"Raises the user's Sp. Atk by 1.",descGen1:"Raises the user's Special by 1 stage.",shortDescGen1:"Raises the user's Special by 1."},grudge:{activate:"  [POKEMON]'s [MOVE] lost all of its PP due to the grudge!",start:"[POKEMON] wants its target to bear a grudge!"},guardsplit:{activate:"  [POKEMON] shared its guard with the target!"},guillotine:{descGen2:"Deals 65535 damage to the target. This attack's accuracy out of 256 is equal to the lesser of (2 * (user's level - target's level) + 76) and 255, before applying accuracy and evasiveness modifiers. Fails if the target is at a higher level.",descGen1:"Deals 65535 damage to the target. Fails if the target's Speed is greater than the user's.",shortDescGen1:"Deals 65535 damage. Fails if target is faster."},gust:{descGen4:"Power doubles if the target is using Bounce or Fly.",shortDescGen4:"Power doubles during Bounce and Fly.",descGen2:"Power doubles if the target is using Fly.",shortDescGen2:"Power doubles during Fly.",descGen1:"No additional effect.",shortDescGen1:"No additional effect."},gyroball:{descGen5:"Power is equal to (25 * target's current Speed / user's current Speed) + 1, rounded down, but not more than 150. If the user's current Speed is 0, it is treated as 1 instead."},happyhour:{activate:"  Everyone is caught up in the happy atmosphere!"},haze:{descGen1:"Resets the stat stages of both Pokemon to 0 and removes stat reductions due to burn and paralysis. Resets Toxic counters to 0 and removes the effect of confusion, Disable, Focus Energy, Leech Seed, Light Screen, Mist, and Reflect from both Pokemon. Removes the opponent's non-volatile status condition.",shortDescGen1:"Resets all stat changes. Removes foe's status.",activate:"  All STATUS changes are eliminated!"},headsmash:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/2 the HP lost by the target, rounded down, but not less than 1 HP."},healbell:{descGen7:"Every Pokemon in the user's party is cured of its non-volatile status condition. Active Pokemon with the Soundproof Ability are not cured.",descGen5:"Every Pokemon in the user's party is cured of its non-volatile status condition. Active Pokemon with the Soundproof Ability are also cured.",descGen4:"Every Pokemon in the user's party is cured of its non-volatile status condition. Pokemon with the Soundproof Ability are not cured.",descGen2:"Every Pokemon in the user's party is cured of its non-volatile status condition.",activate:"  A bell chimed!"},healblock:{descGen7:"For 5 turns, the target is prevented from restoring any HP as long as it remains active. During the effect, healing and draining moves are unusable, and Abilities and items that grant healing will not heal the user. If an affected Pokemon uses Baton Pass, the replacement will remain unable to restore its HP. Pain Split and the Regenerator Ability are unaffected. Relevant Z-Powered moves can still be selected and executed during this effect.",descGen6:"For 5 turns, the target is prevented from restoring any HP as long as it remains active. During the effect, healing and draining moves are unusable, and Abilities and items that grant healing will not heal the user. If an affected Pokemon uses Baton Pass, the replacement will remain unable to restore its HP. Pain Split and the Regenerator Ability are unaffected.",descGen4:"For 5 turns, the target is prevented from restoring any HP as long as it remains active. During the effect, healing moves are unusable, move effects that grant healing will not heal, but Abilities and items will continue to heal the user. If an affected Pokemon uses Baton Pass, the replacement will remain under the effect. Pain Split is unaffected.",start:"  [POKEMON] was prevented from healing!",end:"  [POKEMON]'s Heal Block wore off!",cant:"[POKEMON] can't use [MOVE] because of Heal Block!",fail:"  But it failed to affect [POKEMON]!"},healingwish:{descGen7:"The user faints and the Pokemon brought out to replace it has its HP fully restored along with having any non-volatile status condition cured. The new Pokemon is sent out at the end of the turn, and the healing happens before hazards take effect. Fails if the user is the last unfainted Pokemon in its party.",shortDescGen7:"User faints. Replacement is fully healed.",descGen4:"The user faints and the Pokemon brought out to replace it has its HP fully restored along with having any non-volatile status condition cured. The new Pokemon is sent out immediately and the healing happens after hazards take effect. Fails if the user is the last unfainted Pokemon in its party.",heal:"  The healing wish came true for [POKEMON]!"},healorder:{descGen4:"The user restores 1/2 of its maximum HP, rounded down."},healpulse:{descGen5:"The target restores 1/2 of its maximum HP, rounded half up."},heatcrash:{descGen5:"The power of this move depends on (user's weight / target's weight), rounded down. Power is equal to 120 if the result is 5 or more, 100 if 4, 80 if 3, 60 if 2, and 40 if 1 or less."},heavyslam:{descGen6:"The power of this move depends on (user's weight / target's weight), rounded down. Power is equal to 120 if the result is 5 or more, 100 if 4, 80 if 3, 60 if 2, and 40 if 1 or less."},helpinghand:{start:"  [SOURCE] is ready to help [POKEMON]!"},hiddenpower:{descGen5:"This move's type and power depend on the user's individual values (IVs). Power varies between 30 and 70, and type can be any but Normal.",shortDescGen5:"Varies in power and type based on the user's IVs."},highjumpkick:{descGen4:"If this attack is not successful, the user loses HP equal to half the target's maximum HP if the target was immune, rounded down, otherwise half of the damage the target would have taken, rounded down, but no less than 1 HP and no more than half of the target's maximum HP, as crash damage. Pokemon with the Magic Guard Ability are unaffected by crash damage.",shortDescGen4:"If miss, user takes 1/2 damage it would've dealt.",descGen3:"If this attack is not successful and the target was not immune, the user loses HP equal to half of the damage the target would have taken, rounded down, but no less than 1 HP and no more than half of the target's maximum HP, as crash damage.",shortDescGen3:"If miss, user takes 1/2 damage it would've dealt.",descGen2:"If this attack is not successful and the target was not immune, the user loses HP equal to 1/8 the damage the target would have taken, rounded down, but not less than 1 HP, as crash damage.",shortDescGen2:"If miss, user takes 1/8 damage it would've dealt.",descGen1:"If this attack misses the target, the user takes 1 HP of crash damage. If the user has a substitute, the crash damage is dealt to the target's substitute if it has one, otherwise no crash damage is dealt.",shortDescGen1:"User takes 1 HP of damage if it misses.",damage:"#crash"},horndrill:{descGen2:"Deals 65535 damage to the target. This attack's accuracy out of 256 is equal to the lesser of (2 * (user's level - target's level) + 76) and 255, before applying accuracy and evasiveness modifiers. Fails if the target is at a higher level.",descGen1:"Deals 65535 damage to the target. Fails if the target's Speed is greater than the user's.",shortDescGen1:"Deals 65535 damage. Fails if target is faster."},howl:{descGen7:"Raises the user's Attack by 1 stage.",shortDescGen7:"Raises the user's Attack by 1."},hurricane:{descGen7:"Has a 30% chance to confuse the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Primordial Sea or Rain, this move does not check accuracy. If the weather is Desolate Land or Sun, this move's accuracy is 50%.",descGen5:"Has a 30% chance to confuse the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Rain, this move does not check accuracy. If the weather is Sun, this move's accuracy is 50%."},hyperbeam:{descGen1:"If this move is successful, the user must recharge on the following turn and cannot select a move, unless the target or its substitute was knocked out by this move.",shortDescGen1:"Can't move next turn if target or sub is not KOed."},hyperspacefury:{descGen6:"Lowers the user's Defense by 1 stage. This move cannot be used successfully unless the user's current form, while considering Transform, is Hoopa Unbound. If this move is successful, it breaks through the target's Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally.",activate:"#shadowforce",fail:"#darkvoid"},hyperspacehole:{descGen6:"If this move is successful, it breaks through the target's Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally.",activate:"#shadowforce"},iceball:{descGen7:"If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn. If this move hits an active Disguise during the effect, the power multiplier is paused but the turn counter is not, potentially allowing the multiplier to be used on the user's next move after this effect ends.",descGen6:"If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn."},iceburn:{prepare:"  [POKEMON] became cloaked in freezing air!"},iciclespear:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits."},icywind:{shortDescGen2:"100% chance to lower the target's Speed by 1."},imprison:{descGen7:"The user prevents all opposing Pokemon from using any moves that the user also knows as long as the user remains active. Z-Powered moves can still be selected and executed during this effect.",descGen6:"The user prevents all opposing Pokemon from using any moves that the user also knows as long as the user remains active.",descGen4:"The user prevents all opposing Pokemon from using any moves that the user also knows as long as the user remains active. Fails if no opposing Pokemon know any of the user's moves.",start:"  [POKEMON] sealed any moves its target shares with it!",cant:"[POKEMON] can't use its sealed [MOVE]!"},incinerate:{descGen5:"The target loses its held item if it is a Berry. This move cannot cause Pokemon with the Sticky Hold Ability to lose their held item. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",shortDescGen5:"Destroys the foe(s) Berry.",removeItem:"  [POKEMON]'s [ITEM] was burned up!"},infestation:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",start:"  [POKEMON] has been afflicted with an infestation by [SOURCE]!"},ingrain:{descGen7:"The user has 1/16 of its maximum HP restored at the end of each turn, but it is prevented from switching out and other Pokemon cannot force the user to switch out. The user can still switch out if it uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the user leaves the field using Baton Pass, the replacement will remain trapped and still receive the healing effect. During the effect, the user can be hit normally by Ground-type attacks and be affected by Spikes, Toxic Spikes, and Sticky Web, even if the user is a Flying type or has the Levitate Ability.",descGen5:"The user has 1/16 of its maximum HP restored at the end of each turn, but it is prevented from switching out and other Pokemon cannot force the user to switch out. The user can still switch out if it uses Baton Pass, U-turn, or Volt Switch. If the user leaves the field using Baton Pass, the replacement will remain trapped and still receive the healing effect. During the effect, the user can be hit normally by Ground-type attacks and be affected by Spikes and Toxic Spikes, even if the user is a Flying type or has the Levitate Ability.",descGen4:"The user has 1/16 of its maximum HP restored at the end of each turn, but it is prevented from switching out and other Pokemon cannot force the user to switch out. The user can still switch out if it uses Baton Pass or U-turn. If the user leaves the field using Baton Pass, the replacement will remain trapped and still receive the healing effect. During the effect, the user can be hit normally by Ground-type attacks and be affected by Spikes and Toxic Spikes, even if the user is a Flying type or has the Levitate Ability.",descGen3:"The user has 1/16 of its maximum HP restored at the end of each turn, but it is prevented from switching out and other Pokemon cannot force the user to switch out. The user can still switch out if it uses Baton Pass, and the replacement will remain trapped and still receive the healing effect.",shortDescGen3:"User recovers 1/16 max HP per turn. Traps user.",start:"  [POKEMON] planted its roots!",block:"  [POKEMON] is anchored in place with its roots!",heal:"  [POKEMON] absorbed nutrients with its roots!"},instruct:{descGen8:"The target immediately uses its last used move. Fails if the target has not made a move, if the move has 0 PP, if the target is Dynamaxed, if the target is preparing to use Beak Blast, Focus Punch, or Shell Trap, or if the move is Assist, Beak Blast, Belch, Bide, Celebrate, Chatter, Copycat, Dynamax Cannon, Focus Punch, Hold Hands, Ice Ball, Instruct, King's Shield, Me First, Metronome, Mimic, Mirror Move, Nature Power, Obstruct, Outrage, Petal Dance, Rollout, Shell Trap, Sketch, Sleep Talk, Struggle, Thrash, Transform, Uproar, any two-turn move, any recharge move, or any Max or G-Max Move.",descGen7:"The target immediately uses its last used move. Fails if the target has not made a move, if the move has 0 PP, if the target is preparing to use Beak Blast, Focus Punch, or Shell Trap, or if the move is Assist, Beak Blast, Belch, Bide, Celebrate, Chatter, Copycat, Focus Punch, Hold Hands, Ice Ball, Instruct, King's Shield, Me First, Metronome, Mimic, Mirror Move, Nature Power, Outrage, Petal Dance, Rollout, Shell Trap, Sketch, Sleep Talk, Struggle, Thrash, Transform, Uproar, any two-turn move, any recharge move, or any Z-Move.",activate:"  [TARGET] followed [POKEMON]'s instructions!"},iondeluge:{activate:"  A deluge of ions showers the battlefield!"},jumpkick:{descGen4:"If this attack is not successful, the user loses HP equal to half the target's maximum HP if the target was immune, rounded down, otherwise half of the damage the target would have taken, rounded down, but no less than 1 HP and no more than half of the target's maximum HP, as crash damage. Pokemon with the Magic Guard Ability are unaffected by crash damage.",shortDescGen4:"If miss, user takes 1/2 damage it would've dealt.",descGen3:"If this attack is not successful and the target was not immune, the user loses HP equal to half of the damage the target would have taken, rounded down, but no less than 1 HP and no more than half of the target's maximum HP, as crash damage.",shortDescGen3:"If miss, user takes 1/2 damage it would've dealt.",descGen2:"If this attack is not successful and the target was not immune, the user loses HP equal to 1/8 the damage the target would have taken, rounded down, but not less than 1 HP, as crash damage.",shortDescGen2:"If miss, user takes 1/8 damage it would've dealt.",descGen1:"If this attack misses the target, the user takes 1 HP of crash damage. If the user has a substitute, the crash damage is dealt to the target's substitute if it has one, otherwise no crash damage is dealt.",shortDescGen1:"User takes 1 HP of damage if it misses.",damage:"#crash"},kingsshield:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon trying to make contact with the user have their Attack lowered by 1 stage. Non-damaging moves go through this protection. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon trying to make contact with the user have their Attack lowered by 2 stages. Non-damaging moves go through this protection. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",shortDescGen7:"Protects from damaging attacks. Contact: -2 Atk.",descGen6:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon trying to make contact with the user have their Attack lowered by 2 stages. Non-damaging moves go through this protection. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn."},knockoff:{descGen7:"If the target is holding an item that can be removed from it, ignoring the Sticky Hold Ability, this move's power is multiplied by 1.5. If the user has not fainted, the target loses its held item. This move cannot remove Z-Crystals, cause Pokemon with the Sticky Hold Ability to lose their held item, cause Pokemon that can Mega Evolve to lose the Mega Stone for their species, or cause a Kyogre, a Groudon, a Giratina, an Arceus, a Genesect, or a Silvally to lose their Blue Orb, Red Orb, Griseous Orb, Plate, Drive, or Memory respectively. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen6:"If the target is holding an item that can be removed from it, ignoring the Sticky Hold Ability, this move's power is multiplied by 1.5. If the user has not fainted, the target loses its held item. This move cannot cause Pokemon with the Sticky Hold Ability to lose their held item, cause Pokemon that can Mega Evolve to lose the Mega Stone for their species, or cause a Kyogre, a Groudon, a Giratina, an Arceus, or a Genesect to lose their Blue Orb, Red Orb, Griseous Orb, Plate, or Drive, respectively. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen5:"If the user has not fainted, the target loses its held item. This move cannot cause Pokemon with the Sticky Hold Ability to lose their held item, or force a Giratina, an Arceus, or a Genesect to lose their Griseous Orb, Plate, or Drive, respectively. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",shortDescGen5:"Removes the target's held item.",descGen4:"The target's held item is lost for the rest of the battle, unless the item is a Griseous Orb or the target has the Multitype or Sticky Hold Abilities. During the effect, the target cannot obtain a new item by any means.",shortDescGen4:"Target's item is lost and it cannot obtain another.",descGen3:"The target's held item is lost for the rest of the battle, unless it has the Sticky Hold Ability. During the effect, the target cannot gain a new item by any means.",removeItem:"  [SOURCE] knocked off [POKEMON]'s [ITEM]!"},laserfocus:{start:"  [POKEMON] concentrated intensely!"},leechlife:{descGen4:"The user recovers 1/2 the HP lost by the target, rounded down. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down.",descGen3:"The user recovers 1/2 the HP lost by the target, rounded down."},leechseed:{descGen8:"The Pokemon at the user's position steals 1/8 of the target's maximum HP, rounded down, at the end of each turn. If Big Root is held by the recipient, the HP recovered is 1.3x normal, rounded half down. If the target uses Baton Pass, the replacement will continue being leeched. If the target switches out or uses Rapid Spin successfully, the effect ends. Grass-type Pokemon are immune to this move on use, but not its effect.",descGen3:"The Pokemon at the user's position steals 1/8 of the target's maximum HP, rounded down, at the end of each turn. If the target uses Baton Pass, the replacement will continue being leeched. If the target switches out or uses Rapid Spin, the effect ends. Grass-type Pokemon are immune to this move on use, but not its effect.",descGen1:"At the end of each of the target's turns, The Pokemon at the user's position steals 1/16 of the target's maximum HP, rounded down and multiplied by the target's current Toxic counter if it has one, even if the target currently has less than that amount of HP remaining. If the target switches out or any Pokemon uses Haze, this effect ends. Grass-type Pokemon are immune to this move.",start:"  [POKEMON] was seeded!",end:"  [POKEMON] was freed from Leech Seed!",damage:"  [POKEMON]'s health is sapped by Leech Seed!"},leer:{shortDescGen2:"Lowers the target's Defense by 1."},lightscreen:{descGen6:"For 5 turns, the user and its party members take 0.5x damage from special attacks, or 0.66x damage if in a Double or Triple Battle. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break or Defog. Lasts for 8 turns if the user is holding Light Clay. Fails if the effect is already active on the user's side.",descGen4:"For 5 turns, the user and its party members take 1/2 damage from special attacks, or 2/3 damage if there are multiple active Pokemon on the user's side. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break or Defog. Lasts for 8 turns if the user is holding Light Clay. Fails if the effect is already active on the user's side.",descGen3:"For 5 turns, the user and its party members take 1/2 damage from special attacks, or 2/3 damage if there are multiple active Pokemon on the user's side. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break. Fails if the effect is already active on the user's side.",descGen2:"For 5 turns, the user and its party members have their Special Defense doubled. Critical hits ignore this effect. Fails if the effect is already active on the user's side.",shortDescGen2:"For 5 turns, the user's party has doubled Sp. Def.",descGen1:"While the user remains active, its Special is doubled when taking damage. Critical hits ignore this effect. If any Pokemon uses Haze, this effect ends.",shortDescGen1:"While active, user's Special is 2x when damaged.",startGen1:"  [POKEMON]'s protected against special attacks!",start:"  Light Screen made [TEAM] stronger against special moves!",end:"  [TEAM]'s Light Screen wore off!"},lockon:{descGen4:"Until the end of the next turn, the target cannot avoid the user's moves, even if the target is in the middle of a two-turn move. When this effect is started against the target, this and Mind Reader's effects end for every other Pokemon against that target. If the target leaves the field using Baton Pass, the replacement remains under this effect. If the user leaves the field using Baton Pass, this effect is restarted against the same target for the replacement. The effect ends if either the user or the target leaves the field.",descGen2:"The next accuracy check against the target succeeds. The target will still avoid Earthquake, Fissure, and Magnitude if it is using Fly. If the target leaves the field using Baton Pass, the replacement remains under this effect. This effect ends when the target leaves the field or an accuracy check is done against it.",shortDescGen2:"The next move will not miss the target.",start:"  [SOURCE] took aim at [POKEMON]!"},lowkick:{descGen2:"Has a 30% chance to make the target flinch.",shortDescGen2:"30% chance to make the target flinch."},luckychant:{start:"  Lucky Chant shielded [TEAM] from critical hits!",end:"  [TEAM]'s Lucky Chant wore off!"},lunardance:{descGen7:"The user faints and the Pokemon brought out to replace it has its HP and PP fully restored along with having any non-volatile status condition cured. The new Pokemon is sent out at the end of the turn, and the healing happens before hazards take effect. Fails if the user is the last unfainted Pokemon in its party.",shortDescGen7:"User faints. Replacement is fully healed, with PP.",descGen4:"The user faints and the Pokemon brought out to replace it has its HP and PP fully restored along with having any non-volatile status condition cured. The new Pokemon is sent out immediately and the healing happens after hazards take effect. Fails if the user is the last unfainted Pokemon in its party.",heal:"  [POKEMON] became cloaked in mystical moonlight!"},magiccoat:{descGen5:"Until the end of the turn, the user is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. Moves reflected in this way are unable to be reflected again by this or the Magic Bounce Ability's effect. Spikes, Stealth Rock, and Toxic Spikes can only be reflected once per side, by the leftmost Pokemon under this or the Magic Bounce Ability's effect. The Lightning Rod and Storm Drain Abilities redirect their respective moves before this move takes effect.",descGen4:"The user is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. If the move targets both opposing Pokemon, the Pokemon under this effect will reflect the move only targeting the original user. The effect ends once a move is reflected or at the end of the turn. The Lightning Rod and Storm Drain Abilities redirect their respective moves before this move takes effect.",descGen3:"The user is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. If the move targets both opposing Pokemon and the Pokemon under this effect is on the left side, it will reflect the move targeting both opposing Pokemon and its ally will not be affected by the original move; otherwise, if the Pokemon under this effect is on the right side, its ally will be affected by the original move and this Pokemon will reflect the move only targeting the original user. The effect ends once a move is reflected or at the end of the turn. Moves reflected in this way can be reflected again by another Pokemon under this effect. If the user has the Soundproof Ability, it nullifies sound-based moves before this effect happens. The Lightning Rod Ability redirects Electric moves before this move takes effect.",start:"  [POKEMON] shrouded itself with Magic Coat!",move:"[POKEMON] bounced the [MOVE] back!"},magicpowder:{descGen8:"Causes the target to become a Psychic type. Fails if the target is an Arceus or a Silvally, or if the target is already purely Psychic type."},magmastorm:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns; seven turns if the user is holding Grip Claw. Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin. This effect is not stackable or reset by using this or another partial-trapping move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",start:"  [POKEMON] became trapped by swirling magma!"},magnetrise:{descGen5:"For 5 turns, the user is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability as long as it remains active. If the user uses Baton Pass, the replacement will gain the effect. Ingrain, Smack Down, and Iron Ball override this move if the user is under any of their effects. Fails if the user is already under this effect or the effects of Ingrain or Smack Down.",descGen4:"For 5 turns, the user is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability as long as it remains active. If the user uses Baton Pass, the replacement will gain the effect. Ingrain and Iron Ball override this move if the user is under any of their effects. Fails if the user is already under this effect or the effect of Ingrain.",start:"  [POKEMON] levitated with electromagnetism!",end:"  [POKEMON]'s electromagnetism wore off!"},magnitude:{descGen4:"The power of this move varies. 5% chances for 10 and 150 power, 10% chances for 30 and 110 power, 20% chances for 50 and 90 power, and 30% chance for 70 power. Power doubles if the target is using Dig.",activate:"  Magnitude [NUMBER]!"},makeitrain:{activate:"#payday"},matblock:{start:"  [POKEMON] intends to flip up a mat and block incoming attacks!",block:"  [MOVE] was blocked by the kicked-up mat!"},maxguard:{activate:"  [POKEMON] protected itself!"},meanlook:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen5:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen4:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped.",descGen3:"Prevents the target from switching out. The target can still switch out if it uses Baton Pass. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped."},mefirst:{descGen8:"The user uses the move the target chose for use this turn against it, if possible, with its power multiplied by 1.5. The move must be a damaging move other than Beak Blast, Belch, Chatter, Counter, Covet, Focus Punch, Me First, Metal Burst, Mirror Coat, Shell Trap, Struggle, or Thief. Fails if the target moves before the user. Ignores the target's substitute for the purpose of copying the move.",descGen7:"The user uses the move the target chose for use this turn against it, if possible, with its power multiplied by 1.5. The move must be a damaging move other than Beak Blast, Belch, Chatter, Counter, Covet, Focus Punch, Me First, Metal Burst, Mirror Coat, Shell Trap, Struggle, Thief, or any Z-Move. Fails if the target moves before the user. Ignores the target's substitute for the purpose of copying the move.",descGen6:"The user uses the move the target chose for use this turn against it, if possible, with its power multiplied by 1.5. The move must be a damaging move other than Belch, Chatter, Counter, Covet, Focus Punch, Me First, Metal Burst, Mirror Coat, Struggle, or Thief. Fails if the target moves before the user. Ignores the target's substitute for the purpose of copying the move.",descGen5:"The user uses the move the target chose for use this turn against it, if possible, with its power multiplied by 1.5. The move must be a damaging move other than Chatter, Counter, Covet, Focus Punch, Me First, Metal Burst, Mirror Coat, Struggle, or Thief. Fails if the target moves before the user. Ignores the target's substitute for the purpose of copying the move.",descGen4:"The user uses the move the target chose for use this turn against it, if possible, with its power multiplied by 1.5. The move must be a damaging move other than Chatter, Counter, Covet, Focus Punch, Me First, Mirror Coat, Struggle, or Thief. Fails if the target moves before the user. Ignores the target's substitute for the purpose of copying the move."},megadrain:{descGen4:"The user recovers 1/2 the HP lost by the target, rounded down. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded down.",descGen3:"The user recovers 1/2 the HP lost by the target, rounded down."},memento:{descGen4:"Lowers the target's Attack and Special Attack by 2 stages. The user faints, even if this move misses. This move can hit targets in the middle of a two-turn move. Fails entirely if there is no target, but does not fail if the target's stats cannot be changed.",descGen3:"Lowers the target's Attack and Special Attack by 2 stages. The user faints. This move does not check accuracy, and can hit targets in the middle of a two-turn move. Fails entirely if the target's Attack and Special Attack stat stages are both -6.",heal:"  [POKEMON]'s HP was restored by the Z-Power!"},metalburst:{descGen6:"Deals damage to the last opposing Pokemon to hit the user with a physical or special attack this turn equal to 1.5 times the HP lost by the user from that attack, rounded down. If the user did not lose HP from that attack, this move deals damage with a power of 1 instead. If that opposing Pokemon's position is no longer in use, the damage is done to a random opposing Pokemon in range. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's physical or special attack this turn.",descGen4:"Deals damage to the last opposing Pokemon to hit the user with a physical or special attack this turn equal to 1.5 times the HP lost by the user from that attack, rounded down. If that opposing Pokemon's position is no longer in use and there is another opposing Pokemon on the field, the damage is done to it instead. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's physical or special attack this turn, or if the user did not lose HP from the attack."},meteorbeam:{prepare:"[POKEMON] is overflowing with space power!"},metronome:{descGen8:"A random move is selected for use, other than After You, Apple Acid, Assist, Astral Barrage, Aura Wheel, Baneful Bunker, Beak Blast, Behemoth Bash, Behemoth Blade, Belch, Bestow, Body Press, Branch Poke, Breaking Swipe, Celebrate, Chatter, Clangorous Soul, Copycat, Counter, Covet, Crafty Shield, Decorate, Destiny Bond, Detect, Diamond Storm, Double Iron Bash, Dragon Ascent, Dragon Energy, Dragon Hammer, Drum Beating, Dynamax Cannon, Endure, Eternabeam, False Surrender, Feint, Fiery Wrath, Fleur Cannon, Focus Punch, Follow Me, Freeze Shock, Freezing Glare, Glacial Lance, Grav Apple, Helping Hand, Hold Hands, Hyperspace Fury, Hyperspace Hole, Ice Burn, Instruct, Jungle Healing, King's Shield, Life Dew, Light of Ruin, Mat Block, Me First, Meteor Assault, Metronome, Mimic, Mind Blown, Mirror Coat, Mirror Move, Moongeist Beam, Nature Power, Nature's Madness, Obstruct, Origin Pulse, Overdrive, Photon Geyser, Plasma Fists, Precipice Blades, Protect, Pyro Ball, Quash, Quick Guard, Rage Powder, Relic Song, Secret Sword, Shell Trap, Sketch, Sleep Talk, Snap Trap, Snarl, Snatch, Snore, Spectral Thief, Spiky Shield, Spirit Break, Spotlight, Steam Eruption, Steel Beam, Strange Steam, Struggle, Sunsteel Strike, Surging Strikes, Switcheroo, Techno Blast, Thief, Thousand Arrows, Thousand Waves, Thunder Cage, Thunderous Kick, Transform, Trick, V-create, Wicked Blow, or Wide Guard.",descGen7:"A random move is selected for use, other than After You, Assist, Baneful Bunker, Beak Blast, Belch, Bestow, Celebrate, Chatter, Copycat, Counter, Covet, Crafty Shield, Destiny Bond, Detect, Diamond Storm, Dragon Ascent, Endure, Feint, Fleur Cannon, Focus Punch, Follow Me, Freeze Shock, Helping Hand, Hold Hands, Hyperspace Fury, Hyperspace Hole, Ice Burn, Instruct, King's Shield, Light of Ruin, Mat Block, Me First, Metronome, Mimic, Mind Blown, Mirror Coat, Mirror Move, Nature Power, Origin Pulse, Photon Geyser, Plasma Fists, Precipice Blades, Protect, Quash, Quick Guard, Rage Powder, Relic Song, Secret Sword, Shell Trap, Sketch, Sleep Talk, Snarl, Snatch, Snore, Spectral Thief, Spiky Shield, Spotlight, Steam Eruption, Struggle, Switcheroo, Techno Blast, Thief, Thousand Arrows, Thousand Waves, Transform, Trick, V-create, or Wide Guard.",descGen6:"A random move is selected for use, other than After You, Assist, Belch, Bestow, Celebrate, Chatter, Copycat, Counter, Covet, Crafty Shield, Destiny Bond, Detect, Diamond Storm, Dragon Ascent, Endure, Feint, Focus Punch, Follow Me, Freeze Shock, Helping Hand, Hold Hands, Hyperspace Fury, Hyperspace Hole, Ice Burn, King's Shield, Light of Ruin, Mat Block, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Origin Pulse, Precipice Blades, Protect, Quash, Quick Guard, Rage Powder, Relic Song, Secret Sword, Sketch, Sleep Talk, Snarl, Snatch, Snore, Spiky Shield, Steam Eruption, Struggle, Switcheroo, Techno Blast, Thief, Thousand Arrows, Thousand Waves, Transform, Trick, V-create, or Wide Guard.",descGen5:"A random move is selected for use, other than After You, Assist, Bestow, Chatter, Copycat, Counter, Covet, Destiny Bond, Detect, Endure, Feint, Focus Punch, Follow Me, Freeze Shock, Helping Hand, Ice Burn, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Nature Power, Protect, Quash, Quick Guard, Rage Powder, Relic Song, Secret Sword, Sketch, Sleep Talk, Snarl, Snatch, Snore, Struggle, Switcheroo, Techno Blast, Thief, Transform, Trick, V-create, or Wide Guard.",descGen4:"Damage of moves used on consecutive turns is increased. Max 2x after 10 turns.",descGen3:"A random move is selected for use, other than Counter, Covet, Destiny Bond, Detect, Endure, Focus Punch, Follow Me, Helping Hand, Metronome, Mimic, Mirror Coat, Protect, Sketch, Sleep Talk, Snatch, Struggle, Thief, or Trick.",descGen2:"A random move is selected for use, other than Counter, Destiny Bond, Detect, Endure, Metronome, Mimic, Mirror Coat, Protect, Sketch, Sleep Talk, Struggle, Thief, or any move the user already knows.",descGen1:"A random move is selected for use, other than Metronome or Struggle.",move:"Waggling a finger let it use [MOVE]!"},milkdrink:{descGen4:"The user restores 1/2 of its maximum HP, rounded down."},mimic:{descGen8:"While the user remains active, this move is replaced by the last move used by the target. The copied move has the maximum PP for that move. Fails if the target has not made a move, if the user has Transformed, if the user already knows the move, or if the move is Behemoth Bash, Behemoth Blade, Chatter, Dynamax Cannon, Mimic, Sketch, Struggle, Transform, or any Max or G-Max Move.",descGen7:"While the user remains active, this move is replaced by the last move used by the target. The copied move has the maximum PP for that move. Fails if the target has not made a move, if the user has Transformed, if the user already knows the move, or if the move is Chatter, Mimic, Sketch, Struggle, Transform, or any Z-Move.",descGen6:"While the user remains active, this move is replaced by the last move used by the target. The copied move has the maximum PP for that move. Fails if the target has not made a move, if the user has Transformed, if the user already knows the move, or if the move is Chatter, Mimic, Sketch, Struggle, or Transform.",descGen4:"While the user remains active, this move is replaced by the last move used by the target. The copied move has 5 PP. Fails if the target has not made a move, if the user has Transformed, if the user already knows the move, or if the move is Chatter, Metronome, Mimic, Sketch, or Struggle.",descGen3:"While the user remains active, this move is replaced by the last move used by the target. The copied move has 5 PP. Fails if the target has not made a move, if the user has Transformed, if the user already knows the move, or if the move is Metronome, Mimic, Sketch, or Struggle.",descGen2:"While the user remains active, this move is replaced by the last move used by the target. The copied move has 5 PP. Fails if the target has not made a move, if the user already knows the move, or if the move is Struggle.",descGen1:"While the user remains active, this move is replaced by a random move known by the target, even if the user already knows that move. The copied move keeps the remaining PP for this move, regardless of the copied move's maximum PP. Whenever one PP is used for a copied move, one PP is used for this move.",shortDescGen1:"Random move known by the target replaces this.",start:"  [POKEMON] learned [MOVE]!"},mindblown:{damage:"  ([POKEMON] cut its own HP to power up its move!)"},mindreader:{descGen4:"Until the end of the next turn, the target cannot avoid the user's moves, even if the target is in the middle of a two-turn move. When this effect is started against the target, this and Lock-On's effects end for every other Pokemon against that target. If the target leaves the field using Baton Pass, the replacement remains under this effect. If the user leaves the field using Baton Pass, this effect is restarted against the same target for the replacement. The effect ends if either the user or the target leaves the field.",descGen2:"The next accuracy check against the target succeeds. The target will still avoid Earthquake, Fissure, and Magnitude if it is using Fly. If the target leaves the field using Baton Pass, the replacement remains under this effect. This effect ends when the target leaves the field or an accuracy check is done against it.",shortDescGen2:"The next move will not miss the target.",start:"#lockon"},minimize:{descGen6:"Raises the user's evasiveness by 2 stages. Whether or not the user's evasiveness was changed, Body Slam, Dragon Rush, Flying Press, Heat Crash, Phantom Force, Shadow Force, Steamroller, and Stomp will not check accuracy and have their damage doubled if used against the user while it is active.",descGen5:"Raises the user's evasiveness by 2 stages. Whether or not the user's evasiveness was changed, Stomp and Steamroller will have their damage doubled if used against the user while it is active.",descGen4:"Raises the user's evasiveness by 1 stage. Whether or not the user's evasiveness was changed, Stomp will have its power doubled if used against the user while it is active.",shortDescGen4:"Raises the user's evasiveness by 1.",descGen3:"Raises the user's evasiveness by 1 stage. Whether or not the user's evasiveness was changed, Astonish, Extrasensory, Needle Arm, and Stomp will have their damage doubled if used against the user while it is active.",descGen2:"Raises the user's evasiveness by 1 stage. Whether or not the user's evasiveness was changed, Stomp will have its power doubled if used against the user while it is active. Baton Pass can be used to transfer this effect to an ally.",descGen1:"Raises the user's evasiveness by 1 stage."},miracleeye:{descGen4:"As long as the target remains active, its evasiveness stat stage is ignored during accuracy checks against it if it is greater than 0, and Psychic-type attacks can hit the target if it is a Dark type.",start:"#foresight"},mirrorcoat:{descGen6:"Deals damage to the last opposing Pokemon to hit the user with a special attack this turn equal to twice the HP lost by the user from that attack. If the user did not lose HP from the attack, this move deals damage with a power of 1 instead. If that opposing Pokemon's position is no longer in use, the damage is done to a random opposing Pokemon in range. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's special attack this turn.",descGen4:"Deals damage to the last opposing Pokemon to hit the user with a special attack this turn equal to twice the HP lost by the user from that attack. If that opposing Pokemon's position is no longer in use and there is another opposing Pokemon on the field, the damage is done to it instead. Only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's special attack this turn, or if the user did not lose HP from the attack.",descGen3:"Deals damage to the last opposing Pokemon to hit the user with a special attack this turn equal to twice the HP lost by the user from that attack. If that opposing Pokemon's position is no longer in use and there is another opposing Pokemon on the field, the damage is done to it instead. This move considers Hidden Power as Normal type, and only the last hit of a multi-hit attack is counted. Fails if the user was not hit by an opposing Pokemon's special attack this turn, or if the user did not lose HP from the attack.",descGen2:"Deals damage to the opposing Pokemon equal to twice the HP lost by the user from a special attack this turn. This move considers Hidden Power as Normal type, and only the last hit of a multi-hit attack is counted. Fails if the user moves first, if the user was not hit by a special attack this turn, or if the user did not lose HP from the attack."},mirrormove:{descGen4:"The user uses the last move that successfully targeted the user. The copied move is used with no specific target. Fails if no move has targeted the user, if the move was called by another move, if the move is Encore, or if the move cannot be copied by this move.",descGen3:"The user uses the last move that successfully targeted the user. The copied move is used with no specific target. Fails if no move has targeted the user, if the move missed, failed, or had no effect on the user, or if the move cannot be copied by this move.",descGen2:"The user uses the last move used by the target. Fails if the target has not made a move since the user switched in, or if the last move used was Metronome, Mimic, Mirror Move, Sketch, Sleep Talk, Transform, or any move the user knows.",descGen1:"The user uses the last move used by the target. Fails if the target has not made a move since the user switched in, or if the last move used was Mirror Move."},mist:{descGen2:"While the user remains active, it is protected from having its stat stages lowered by other Pokemon. Fails if the user already has the effect. Baton Pass can be used to transfer this effect to an ally.",shortDescGen2:"While active, user is protected from stat drops.",startGen2:"  [POKEMON]'s shrouded in MIST!",blockGen2:"  [POKEMON]'s protected by MIST.",descGen1:"While the user remains active, it is protected from having its stat stages lowered by other Pokemon, unless caused by the secondary effect of a move. Fails if the user already has the effect. If any Pokemon uses Haze, this effect ends.",startGen1:"  [POKEMON]'s shrouded in mist!",blockGen1:"  But, it failed!",start:"  [TEAM] became shrouded in mist!",end:"  [TEAM] is no longer protected by mist!",block:"  [POKEMON] is protected by the mist!"},moonlight:{descGen8:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect or if the user is holding Utility Umbrella, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen7:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen5:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded half down.",descGen4:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded down.",descGen2:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, all of its HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Rain or Sandstorm, all rounded down."},morningsun:{descGen8:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect or if the user is holding Utility Umbrella, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen7:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen5:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded half down.",descGen4:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded down.",descGen2:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, all of its HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Rain or Sandstorm, all rounded down."},naturalgift:{descGen4:"The type and power of this move depend on the user's held Berry, and the Berry is lost. Fails if the user is not holding a Berry, if the user has the Klutz Ability, or if Embargo is in effect for the user."},naturepower:{descGen6:"This move calls another move for use based on the battle terrain. Tri Attack on the regular Wi-Fi terrain, Thunderbolt during Electric Terrain, Moonblast during Misty Terrain, and Energy Ball during Grassy Terrain.",descGen5:"This move calls another move for use based on the battle terrain. Earthquake on the regular Wi-Fi terrain.",shortDescGen5:"Attack changes based on terrain. (Earthquake)",descGen4:"This move calls another move for use based on the battle terrain. Tri Attack in Wi-Fi battles.",shortDescGen4:"Attack changes based on terrain. (Tri Attack)",descGen3:"This move calls another move for use depending on the battle terrain. Swift in Wi-Fi battles.",shortDescGen3:"Attack changes based on terrain. (Swift)",move:"Nature Power turned into [MOVE]!"},needlearm:{descGen3:"Has a 30% chance to make the target flinch. Damage doubles if the target has used Minimize while active."},nightmare:{start:"  [POKEMON] began having a nightmare!",damage:"  [POKEMON] is locked in a nightmare!"},nightshade:{descGen1:"Deals damage to the target equal to the user's level. This move ignores type immunity.",shortDescGen1:"Damage = user's level. Can hit Normal types."},noretreat:{start:"  [POKEMON] can no longer escape because it used No Retreat!"},obstruct:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon trying to make contact with the user have their Defense lowered by 2 stages. Non-damaging moves go through this protection. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn."},octolock:{start:"  [POKEMON] can no longer escape because of Octolock!"},odorsleuth:{descGen4:"As long as the target remains active, its evasiveness stat stage is ignored during accuracy checks against it if it is greater than 0, and Normal- and Fighting-type attacks can hit the target if it is a Ghost type.",descGen3:"As long as the target remains active, its evasiveness stat stage is ignored during accuracy checks against it, and Normal- and Fighting-type attacks can hit the target if it is a Ghost type."},outrage:{descGen6:"The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an adjacent opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen4:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen3:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, falls asleep, becomes frozen, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen2:"Whether or not this move is successful, the user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect, even if it is already confused. If the user is prevented from moving, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user."},painsplit:{activate:"  The battlers shared their pain!"},partingshot:{descGen6:"Lowers the target's Attack and Special Attack by 1 stage. If this move is successful, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members.",heal:"#memento",switchOut:"#uturn"},payback:{descGen6:"Power doubles if the user moves after the target this turn. Switching in does not count as an action.",descGen4:"Power doubles if the user moves after the target this turn. Switching in counts as an action."},payday:{activate:"  Coins were scattered everywhere!"},perishsong:{start:"  All Pokémon that heard the song will faint in three turns!",activate:"  [POKEMON]'s perish count fell to [NUMBER]."},petaldance:{descGen6:"The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an adjacent opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen4:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen3:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, falls asleep, becomes frozen, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen2:"Whether or not this move is successful, the user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect, even if it is already confused. If the user is prevented from moving, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen1:"Whether or not this move is successful, the user spends three or four turns locked into this move and becomes confused immediately after its move on the last turn of the effect, even if it is already confused. If the user is prevented from moving, the effect ends without causing confusion. During the effect, this move's accuracy is overwritten every turn with the current calculated accuracy including stat stage changes, but not to less than 1/256 or more than 255/256.",shortDescGen1:"Lasts 3-4 turns. Confuses the user afterwards."},phantomforce:{descGen6:"If this move is successful, it breaks through the target's Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks. If the user is holding a Power Herb, the move completes in one turn. Damage doubles and no accuracy check is done if the target has used Minimize while active.",prepare:"#shadowforce",activate:"#shadowforce"},pinmissile:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},pluck:{descGen4:"The user steals the target's held Berry if it is holding one and eats it immediately, gaining its effects unless the user's item is being ignored. Items lost to this move can be regained with Recycle.",removeItem:"#bugbite"},poisonfang:{descGen5:"Has a 30% chance to badly poison the target.",shortDescGen5:"30% chance to badly poison the target."},poisongas:{shortDescGen2:"Poisons the target."},poisonsting:{descGen1:"Has a 20% chance to poison the target.",shortDescGen1:"20% chance to poison the target."},poltergeist:{activate:"  [POKEMON] is about to be attacked by its [ITEM]!"},powder:{descGen6:"If the target uses a Fire-type move this turn, it is prevented from executing and the target loses 1/4 of its maximum HP, rounded half up. This effect happens before the Fire-type move would be prevented by Primordial Sea.",start:"  [POKEMON] is covered in powder!",activate:"  When the flame touched the powder on the Pokémon, it exploded!"},powdersnow:{shortDescGen2:"10% chance to freeze the target."},powersplit:{activate:"  [POKEMON] shared its power with the target!"},powershift:{start:"  [POKEMON] swapped its offensive stats with its defensive stats!",end:"#.start"},powertrick:{start:"  [POKEMON] switched its Attack and Defense!",end:"#.start"},present:{descGen2:"If this move is successful, it deals damage or heals the target. 102/256 chance for 40 power, 76/256 chance for 80 power, 26/256 chance for 120 power, or 52/256 chance to heal the target by 1/4 of its maximum HP, rounded down. If this move deals damage, it uses an abnormal version of the damage formula by substituting certain values. The user's Attack stat is replaced with 10 times the effectiveness of this move against the target, the target's Defense stat is replaced with the index number of the user's secondary type, and the user's level is replaced with the index number of the target's secondary type. If a Pokemon does not have a secondary type, its primary type is used. The index numbers for each type are Normal: 0, Fighting: 1, Flying: 2, Poison: 3, Ground: 4, Rock: 5, Bug: 7, Ghost: 8, Steel: 9, Fire: 20, Water: 21, Grass: 22, Electric: 23, Psychic: 24, Ice: 25, Dragon: 26, Dark: 27. If at any point a division by 0 would happen in the damage formula, it divides by 1 instead."},protect:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen6:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen5:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, Protect, Quick Guard, or Wide Guard. Fails if the user moves last this turn.",descGen4:"The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used, up to a maximum of 8. X resets to 1 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen3:"The user is protected from most attacks made by other Pokemon during this turn. This move has an X/65536 chance of being successful, where X starts at 65535 and halves, rounded down, each time this move is successfully used. After the fourth successful use in a row, X drops to 118 and continues with seemingly random values from 0-65535 on subsequent successful uses. X resets to 65535 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user moves last this turn.",descGen2:"The user is protected from attacks made by the opponent during this turn. This move has an X/255 chance of being successful, where X starts at 255 and halves, rounded down, each time this move is successfully used. X resets to 255 if this move fails or if the user's last move used is not Detect, Endure, or Protect. Fails if the user has a substitute or moves last this turn.",start:"  [POKEMON] protected itself!",block:"  [POKEMON] protected itself!"},psychup:{descGen2:"The user copies all of the target's current stat stage changes. Fails if the target's stat stages are 0."},psychic:{descGen1:"Has a 33% chance to lower the target's Special by 1 stage.",shortDescGen1:"33% chance to lower the target's Special by 1."},psywave:{descGen4:"Deals damage to the target equal to (user's level) * (X * 10 + 50) / 100, where X is a random number from 0 to 10, rounded down, but not less than 1 HP.",descGen2:"Deals damage to the target equal to a random number from 1 to (user's level * 1.5 - 1), rounded down, but not less than 1 HP.",shortDescGen2:"Random damage from 1 to (user's level*1.5 - 1)."},pursuit:{descGen7:"If an adjacent opposing Pokemon switches out this turn, this move hits that Pokemon before it leaves the field, even if it was not the original target. If the user moves after an opponent using Parting Shot, U-turn, or Volt Switch, but not Baton Pass, it will hit that opponent before it leaves the field. Power doubles and no accuracy check is done if the user hits an opponent switching out, and the user's turn is over; if an opponent faints from this, the replacement Pokemon does not become active until the end of the turn.",descGen5:"If an adjacent opposing Pokemon switches out this turn, this move hits that Pokemon before it leaves the field, even if it was not the original target. If the user moves after an opponent using U-turn or Volt Switch, but not Baton Pass, it will hit that opponent before it leaves the field. Power doubles and no accuracy check is done if the user hits an opponent switching out, and the user's turn is over; if an opponent faints from this, the replacement Pokemon does not become active until the end of the turn.",descGen4:"If an opposing Pokemon switches out this turn, this move hits that Pokemon before it leaves the field, even if it was not the original target. If the user moves after an opponent using U-turn, but not Baton Pass, it will hit that opponent before it leaves the field. Power doubles and no accuracy check is done if the user hits an opponent switching out, and the user's turn is over; if an opponent faints from this, the replacement Pokemon becomes active immediately.",descGen3:"If the target is an opposing Pokemon and it switches out this turn, this move hits that Pokemon before it leaves the field. Power doubles and no accuracy check is done if the user hits an opponent switching out, and the user's turn is over; if an opponent faints from this, the replacement Pokemon becomes active immediately.",shortDescGen3:"Power doubles if the targeted foe is switching out.",descGen2:"If the target switches out this turn, this move hits it before it leaves the field with doubled power and the user's turn is over.",shortDescGen2:"Power doubles if the foe is switching out.",activate:"  ([TARGET] is being withdrawn...)"},quash:{activate:"  [TARGET]'s move was postponed!"},quickguard:{descGen8:"The user and its party members are protected from attacks with original or altered priority greater than 0 made by other Pokemon, including allies, during this turn. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",descGen7:"The user and its party members are protected from attacks with original or altered priority greater than 0 made by other Pokemon, including allies, during this turn. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",descGen6:"The user and its party members are protected from attacks with original or altered priority greater than 0 made by other Pokemon, including allies, during this turn. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",descGen5:"The user and its party members are protected from attacks with original priority greater than 0 made by other Pokemon, including allies, during this turn. This attack has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used. X resets to 1 if this attack fails or if the user's last used move is not Detect, Endure, Protect, Quick Guard, or Wide Guard. If X is 256 or more, this move has a 1/(2^32) chance of being successful. Fails if the user moves last this turn or if this move is already in effect for the user's side.",start:"  Quick Guard protected [TEAM]!",block:"  Quick Guard protected [POKEMON]!"},rage:{descGen3:"Once this move is used and unless the target protected itself, the user's Attack is raised by 1 stage every time it is hit by another Pokemon's attack as long as this move is chosen for use.",descGen2:"Once this move is successfully used, X starts at 1. This move's damage is multiplied by X, and whenever the user is hit by the opposing Pokemon, X increases by 1, with a maximum of 255. X resets to 1 when the user is no longer active or did not choose this move for use.",shortDescGen2:"Next Rage increases in damage if hit during use.",descGen1:"Once this move is successfully used, the user automatically uses this move every turn and can no longer switch out. During the effect, the user's Attack is raised by 1 stage every time it is hit by the opposing Pokemon, and this move's accuracy is overwritten every turn with the current calculated accuracy including stat stage changes, but not to less than 1/256 or more than 255/256.",shortDescGen1:"Lasts forever. Raises user's Attack by 1 when hit."},ragepowder:{descGen6:"Until the end of the turn, all single-target attacks from the opposing side are redirected to the user if they are in range. Such attacks are redirected to the user before they can be reflected by Magic Coat or the Magic Bounce Ability, or drawn in by the Lightning Rod or Storm Drain Abilities. Fails if it is not a Double or Triple Battle. This effect is ignored while the user is under the effect of Sky Drop.",start:"#followme",startFromZEffect:"#followme"},ragingbull:{activate:"  [POKEMON] shattered [TEAM]'s protections!"},rapidspin:{descGen7:"If this move is successful and the user has not fainted, the effects of Leech Seed and binding moves end for the user, and all hazards are removed from the user's side of the field.",shortDescGen7:"Frees user from hazards, binding, Leech Seed.",descGen4:"If this move is successful, the effects of Leech Seed and binding moves end against the user, and all hazards are removed from the user's side of the field.",descGen3:"If this move is successful, the effects of Leech Seed and binding moves end for the user, and Spikes are removed from the user's side of the field."},razorleaf:{shortDescGen2:"High critical hit ratio."},razorwind:{descGen4:"Has a higher chance for a critical hit. This attack charges on the first turn and executes on the second.",descGen3:"This attack charges on the first turn and executes on the second.",shortDescGen3:"Charges, then hits foe(s) turn 2.",descGen2:"Has a higher chance for a critical hit. This attack charges on the first turn and executes on the second.",shortDescGen2:"Charges, then hits target turn 2. High crit ratio.",descGen1:"This attack charges on the first turn and executes on the second.",shortDescGen1:"Charges turn 1. Hits turn 2.",prepare:"  [POKEMON] whipped up a whirlwind!"},recover:{descGen4:"The user restores 1/2 of its maximum HP, rounded down.",descGen1:"The user restores 1/2 of its maximum HP, rounded down. Fails if (user's maximum HP - user's current HP + 1) is divisible by 256."},recycle:{descGen7:"The user regains the item it last used. Fails if the user is holding an item, if the user has not held an item, if the item was a popped Air Balloon, if the item was picked up by a Pokemon with the Pickup Ability, or if the item was lost to Bug Bite, Covet, Incinerate, Knock Off, Pluck, or Thief. Items thrown with Fling can be regained.",descGen4:"The user regains the item last used by a Pokemon in its current position on the field, even if that Pokemon was not the user. Fails if the user is holding an item, if no items have been used at the user's position, or if the item was lost to Covet, Knock Off, or Thief. Items thrown with Fling can be regained.",addItem:"  [POKEMON] found one [ITEM]!"},reflect:{descGen6:"For 5 turns, the user and its party members take 0.5x damage from physical attacks, or 0.66x damage if in a Double or Triple Battle. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break or Defog. Lasts for 8 turns if the user is holding Light Clay. Fails if the effect is already active on the user's side.",descGen4:"For 5 turns, the user and its party members take 1/2 damage from physical attacks, or 2/3 damage if there are multiple active Pokemon on the user's side. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break or Defog. Lasts for 8 turns if the user is holding Light Clay. Fails if the effect is already active on the user's side.",descGen3:"For 5 turns, the user and its party members take 1/2 damage from physical attacks, or 2/3 damage if there are multiple active Pokemon on the user's side. Critical hits ignore this effect. It is removed from the user's side if the user or an ally is successfully hit by Brick Break. Fails if the effect is already active on the user's side.",descGen2:"For 5 turns, the user and its party members have their Defense doubled. Critical hits ignore this effect. Fails if the effect is already active on the user's side.",shortDescGen2:"For 5 turns, the user's party has doubled Def.",descGen1:"While the user remains active, its Defense is doubled when taking damage. Critical hits ignore this protection. This effect can be removed by Haze.",shortDescGen1:"While active, the user's Defense is doubled.",startGen1:"  [POKEMON] gained armor!",start:"  Reflect made [TEAM] stronger against physical moves!",end:"  [TEAM]'s Reflect wore off!"},reflecttype:{descGen8:"Causes the user's types to become the same as the current types of the target. If the target's current types include typeless and a non-added type, typeless is ignored. If the target's current types include typeless and an added type from Forest's Curse or Trick-or-Treat, typeless is copied as the Normal type instead. Fails if the user is an Arceus or a Silvally, or if the target's current type is typeless alone.",descGen6:"Causes the user's types to become the same as the current types of the target. Fails if the user is an Arceus.",typeChange:"  [POKEMON]'s type became the same as [SOURCE]'s type!"},rest:{descGen2:"The user falls asleep for the next two turns and restores all of its HP, curing itself of any non-volatile status condition in the process, even if it was already asleep. Fails if the user has full HP.",descGen1:"The user falls asleep for the next two turns and restores all of its HP, curing itself of any non-volatile status condition in the process. This does not remove the user's stat penalty for burn or paralysis. Fails if the user has full HP."},revenge:{descGen4:"Power doubles if the user was hit by a Pokemon in the target's current position this turn.",descGen3:"Damage doubles if the user was hit by a Pokemon in the target's current position this turn, and that Pokemon was the last to hit the user.",shortDescGen3:"Damage doubles if user is hit by the target."},reversal:{descGen4:"The power of this move is 20 if X is 43 to 48, 40 if X is 22 to 42, 80 if X is 13 to 21, 100 if X is 6 to 12, 150 if X is 2 to 5, and 200 if X is 0 or 1, where X is equal to (user's current HP * 64 / user's maximum HP), rounded down.",descGen3:"The power of this move is 20 if X is 33 to 48, 40 if X is 17 to 32, 80 if X is 10 to 16, 100 if X is 5 to 9, 150 if X is 2 to 4, and 200 if X is 0 or 1, where X is equal to (user's current HP * 48 / user's maximum HP), rounded down.",descGen2:"The power of this move is 20 if X is 33 to 48, 40 if X is 17 to 32, 80 if X is 10 to 16, 100 if X is 5 to 9, 150 if X is 2 to 4, and 200 if X is 0 or 1, where X is equal to (user's current HP * 48 / user's maximum HP), rounded down. This move does not apply damage variance and cannot be a critical hit."},revivalblessing:{heal:"  [POKEMON] was revived and is ready to fight again!"},roar:{descGen4:"The target is forced to switch out and be replaced with a random unfainted ally. Fails if the target is the last unfainted Pokemon in its party, if the target used Ingrain previously or has the Suction Cups Ability, or if the user's level is lower than the target's and X * (user's level + target's level) / 256 + 1 is less than or equal to (target's level / 4), rounded down, where X is a random number from 0 to 255.",descGen2:"The target is forced to switch out and be replaced with a random unfainted ally. Fails if the target is the last unfainted Pokemon in its party, or if the user moves before the target.",descGen1:"No competitive use.",shortDescGen1:"No competitive use."},rockblast:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits."},rockslide:{descGen1:"No additional effect.",shortDescGen1:"No additional effect.",shortDescGen2:"30% chance to make the target flinch."},roleplay:{descGen8:"The user's Ability changes to match the target's Ability. Fails if the user's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Zen Mode, or already matches the target, or if the target's Ability is As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, or Zen Mode.",descGen7:"The user's Ability changes to match the target's Ability. Fails if the user's Ability is Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Zen Mode, or already matches the target, or if the target's Ability is Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, or Zen Mode.",descGen6:"The user's Ability changes to match the target's Ability. Fails if the user's Ability is Multitype, Stance Change, or already matches the target, or if the target's Ability is Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, Wonder Guard, or Zen Mode.",descGen5:"The user's Ability changes to match the target's Ability. Fails if the user's Ability is Multitype or already matches the target, or if the target's Ability is Flower Gift, Forecast, Illusion, Imposter, Multitype, Trace, Wonder Guard, or Zen Mode.",descGen4:"The user's Ability changes to match the target's Ability. Fails if the user's Ability is Multitype or already matches the target, if the target's Ability is Multitype or Wonder Guard, or if the user is holding a Griseous Orb.",descGen3:"The user's Ability changes to match the target's Ability. Fails if the target's Ability is Wonder Guard.",changeAbility:"  [POKEMON] copied [SOURCE]'s [ABILITY] Ability!"},rollout:{descGen7:"If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn. If this move hits an active Disguise during the effect, the power multiplier is paused but the turn counter is not, potentially allowing the multiplier to be used on the user's next move after this effect ends.",descGen6:"If this move is successful, the user is locked into this move and cannot make another move until it misses, 5 turns have passed, or the attack cannot be used. Power doubles with each successful hit of this move and doubles again if Defense Curl was used previously by the user. If this move is called by Sleep Talk, the move is used for one turn."},roost:{descGen8:"The user restores 1/2 of its maximum HP, rounded half up. Until the end of the turn, Flying-type users lose their Flying type and pure Flying-type users become Normal type. Does nothing if the user's HP is full.",descGen4:"The user restores 1/2 of its maximum HP, rounded down. Until the end of the turn, Flying-type users lose their Flying type and pure Flying-type users become typeless. Does nothing if the user's HP is full.",start:"  ([POKEMON] loses Flying type this turn.)"},safeguard:{descGen3:"For 5 turns, the user and its party members cannot have non-volatile status conditions or confusion inflicted on them by other Pokemon. Pokemon on the user's side cannot become affected by Yawn but can fall asleep from its effect. Fails if the effect is already active on the user's side.",descGen2:"For 5 turns, the user and its party members cannot have non-volatile status conditions or confusion inflicted on them by other Pokemon. During the effect, Outrage, Thrash, and Petal Dance do not confuse the user. Fails if the effect is already active on the user's side.",start:"  [TEAM] cloaked itself in a mystical veil!",end:"  [TEAM] is no longer protected by Safeguard!",block:"  [POKEMON] is protected by Safeguard!"},saltcure:{start:"  [POKEMON] is being salt cured!",damage:"  [POKEMON] is hurt by Salt Cure!"},sandtomb:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns; seven turns if the user is holding Grip Claw. Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin. This effect is not stackable or reset by using this or another partial-trapping move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",start:"  [POKEMON] became trapped by the quicksand!"},scald:{descGen5:"Has a 30% chance to burn the target.",shortDescGen5:"30% chance to burn the target."},secretpower:{descGen6:"Has a 30% chance to cause a secondary effect on the target based on the battle terrain. Causes paralysis on the regular Wi-Fi terrain, causes paralysis during Electric Terrain, lowers Special Attack by 1 stage during Misty Terrain, and causes sleep during Grassy Terrain.",descGen5:"Has a 30% chance to cause a secondary effect on the target based on the battle terrain. Lowers accuracy by 1 stage on the regular Wi-Fi terrain. The secondary effect chance is not affected by the Serene Grace Ability.",shortDescGen5:"Effect varies with terrain. (30% chance acc -1)",descGen4:"Has a 30% chance to cause a secondary effect on the target based on the battle terrain. Causes paralysis on the regular Wi-Fi terrain.",shortDescGen4:"Effect varies with terrain. (30% paralysis chance)"},seismictoss:{descGen1:"Deals damage to the target equal to the user's level. This move ignores type immunity.",shortDescGen1:"Damage = user's level. Can hit Ghost types."},selfdestruct:{descGen4:"The user faints after using this move, unless this move has no target. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",shortDescGen4:"Target's Def halved during damage. User faints.",descGen3:"The user faints after using this move. The target's Defense is halved during damage calculation. This move is prevented from executing if any active Pokemon has the Damp Ability.",descGen2:"The user faints after using this move. The target's Defense is halved during damage calculation.",descGen1:"The user faints after using this move, unless the target's substitute was broken by the damage. The target's Defense is halved during damage calculation."},shadowforce:{descGen6:"If this move is successful, it breaks through the target's Detect, King's Shield, Protect, or Spiky Shield for this turn, allowing other Pokemon to attack the target normally. If the target's side is protected by Crafty Shield, Mat Block, Quick Guard, or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the target's side normally. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks. If the user is holding a Power Herb, the move completes in one turn. Damage doubles and no accuracy check is done if the target has used Minimize while active.",descGen5:"If this move is successful, it breaks through the target's Detect or Protect for this turn, allowing other Pokemon to attack the target normally. If the target is an opponent and its side is protected by Quick Guard or Wide Guard, that protection is also broken for this turn and other Pokemon may attack the opponent's side normally. This attack charges on the first turn and executes on the second. On the first turn, the user avoids all attacks. If the user is holding a Power Herb, the move completes in one turn.",activate:"  It broke through [TARGET]'s protection!",prepare:"[POKEMON] vanished instantly!"},shedtail:{start:"  [POKEMON] shed its tail to create a decoy!",alreadyStarted:"#substitute",fail:"#substitute"},sheercold:{descGen6:"Deals damage to the target equal to the target's maximum HP. Ignores accuracy and evasiveness modifiers. This attack's accuracy is equal to (user's level - target's level + 30)%, and fails if the target is at a higher level. Pokemon with the Sturdy Ability are immune.",shortDescGen6:"OHKOs the target. Fails if user is a lower level."},shelltrap:{start:"  [POKEMON] set a shell trap!",prepare:"  [POKEMON] set a shell trap!",cant:"[POKEMON]'s shell trap didn't work!"},simplebeam:{descGen8:"Causes the target's Ability to become Simple. Fails if the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Power Construct, RKS System, Schooling, Shields Down, Simple, Stance Change, Truant, or Zen Mode.",descGen7:"Causes the target's Ability to become Simple. Fails if the target's Ability is Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, Simple, Stance Change, Truant, or Zen Mode.",descGen6:"Causes the target's Ability to become Simple. Fails if the target's Ability is Multitype, Simple, Stance Change, or Truant.",descGen5:"Causes the target's Ability to become Simple. Fails if the target's Ability is Multitype, Simple, or Truant."},sketch:{descGen3:"This move is permanently replaced by the last move used by the target. The copied move has the maximum PP for that move. Fails if the target has not made a move, if the user has Transformed, or if the move is Sketch, Struggle, or any move the user knows.",descGen2:"Fails when used in Link Battles.",shortDescGen2:"Fails when used in Link Battles.",activate:"  [POKEMON] sketched [MOVE]!"},skillswap:{descGen8:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Hunger Switch, Ice Face, Illusion, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Wonder Guard, or Zen Mode.",descGen7:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is Battle Bond, Comatose, Disguise, Illusion, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Wonder Guard, or Zen Mode.",descGen6:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is Illusion, Multitype, Stance Change, or Wonder Guard.",descGen5:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is Illusion, Multitype, or Wonder Guard, or if both have the same Ability.",descGen4:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is Multitype or Wonder Guard, if both have the same Ability, or if either is holding a Griseous Orb.",descGen3:"The user swaps its Ability with the target's Ability. Fails if either the user or the target's Ability is Wonder Guard.",activate:"  [POKEMON] swapped Abilities with its target!"},skullbash:{descGen3:"This attack charges on the first turn and executes on the second. Raises the user's Defense by 1 stage on the first turn.",descGen1:"This attack charges on the first turn and executes on the second.",shortDescGen1:"Charges turn 1. Hits turn 2.",prepare:"[POKEMON] tucked in its head!"},skyattack:{descGen3:"Has a 30% chance to make the target flinch and a higher chance for a critical hit. This attack charges on the first turn and executes on the second.",descGen2:"This attack charges on the first turn and executes on the second.",shortDescGen2:"Charges turn 1. Hits turn 2.",prepare:"[POKEMON] became cloaked in a harsh light!"},skydrop:{descGen5:"This attack takes the target into the air with the user on the first turn and executes on the second. On the first turn, the user and the target avoid all attacks other than Gust, Hurricane, Sky Uppercut, Smack Down, Thunder, and Twister. The user and the target cannot make a move between turns, but the target can select a move to use. This move cannot damage Flying-type Pokemon. Fails on the first turn if the target is an ally, if the target has a substitute, or if the target is using Bounce, Dig, Dive, Fly, Shadow Force, or Sky Drop. If the effect of Gravity ends this effect before the second turn, both the user and the target return to the ground, but the target will otherwise remain under this effect until the user leaves the field or successfully executes the second turn of any two-turn move.",prepare:"[POKEMON] took [TARGET] into the sky!",end:"  [POKEMON] was freed from the Sky Drop!",failSelect:"Sky Drop won't let [POKEMON] go!",failTooHeavy:"  [POKEMON] is too heavy to be lifted!"},skyuppercut:{descGen4:"This move can hit a target using Bounce or Fly.",shortDescGen4:"Can hit Pokemon using Bounce or Fly."},slackoff:{descGen4:"The user restores 1/2 of its maximum HP, rounded down."},sleeptalk:{descGen8:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Assist, Beak Blast, Belch, Bide, Celebrate, Chatter, Copycat, Dynamax Cannon, Focus Punch, Hold Hands, Me First, Metronome, Mimic, Mirror Move, Nature Power, Shell Trap, Sketch, Sleep Talk, Struggle, Uproar, any two-turn move, or any Max Move.",descGen7:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Assist, Beak Blast, Belch, Bide, Celebrate, Chatter, Copycat, Focus Punch, Hold Hands, Me First, Metronome, Mimic, Mirror Move, Nature Power, Shell Trap, Sketch, Sleep Talk, Struggle, Uproar, any two-turn move, or any Z-Move.",descGen6:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Assist, Belch, Bide, Celebrate, Chatter, Copycat, Focus Punch, Hold Hands, Me First, Metronome, Mimic, Mirror Move, Nature Power, Sketch, Sleep Talk, Struggle, Uproar, or any two-turn move.",descGen5:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Assist, Bide, Chatter, Copycat, Focus Punch, Me First, Metronome, Mimic, Mirror Move, Nature Power, Sketch, Sleep Talk, Struggle, Uproar, or any two-turn move.",descGen4:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Assist, Bide, Chatter, Copycat, Focus Punch, Me First, Metronome, Mirror Move, Sleep Talk, Uproar, or any two-turn move.",descGen3:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, but if it currently has 0 PP it will fail to be used. This move cannot select Assist, Bide, Focus Punch, Metronome, Mirror Move, Sleep Talk, Uproar, or any two-turn move.",descGen2:"One of the user's known moves, besides this move, is selected for use at random. Fails if the user is not asleep. The selected move does not have PP deducted from it, and can currently have 0 PP. This move cannot select Bide, Sleep Talk, or any two-turn move."},sludge:{descGen1:"Has a 40% chance to poison the target.",shortDescGen1:"40% chance to poison the target."},smackdown:{start:"  [POKEMON] fell straight down!"},smellingsalts:{descGen4:"Power doubles if the target is paralyzed. If this move is successful, the target is cured of paralysis.",descGen3:"Damage doubles if the target is paralyzed. If this move is successful, the target is cured of paralysis.",shortDescGen3:"Damage doubles if target is paralyzed; cures it."},snaptrap:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",start:"  [POKEMON] got trapped by a snap trap!"},snatch:{descGen4:"If another Pokemon uses certain non-damaging moves this turn, the user steals that move to use itself. If multiple Pokemon use this move this turn, the applicable moves are stolen by each of those Pokemon in turn order, and only the last user in turn order will gain the effects.",start:"  [POKEMON] is waiting for a target to make a move!",activate:"  [POKEMON] snatched [TARGET]'s move!"},soak:{descGen8:"Causes the target to become a Water type. Fails if the target is an Arceus or a Silvally, or if the target is already purely Water type.",descGen6:"Causes the target to become a Water type. Fails if the target is an Arceus, or if the target is already purely Water type.",descGen5:"Causes the target to become a Water type. Fails if the target is an Arceus."},softboiled:{descGen4:"The user restores 1/2 of its maximum HP, rounded down.",descGen1:"The user restores 1/2 of its maximum HP, rounded down. Fails if (user's maximum HP - user's current HP + 1) is divisible by 256."},solarbeam:{descGen8:"This attack charges on the first turn and executes on the second. Power is halved if the weather is Hail, Primordial Sea, Rain, or Sandstorm and the user is not holding Utility Umbrella. If the user is holding a Power Herb or the weather is Desolate Land or Sun, the move completes in one turn. If the user is holding Utility Umbrella and the weather is Desolate Land or Sun, the move still requires a turn to charge.",descGen7:"This attack charges on the first turn and executes on the second. Power is halved if the weather is Hail, Primordial Sea, Rain, or Sandstorm. If the user is holding a Power Herb or the weather is Desolate Land or Sun, the move completes in one turn.",descGen5:"This attack charges on the first turn and executes on the second. Power is halved if the weather is Hail, Rain, or Sandstorm. If the user is holding a Power Herb or the weather is Sun, the move completes in one turn.",descGen4:"This attack charges on the first turn and executes on the second. Damage is halved if the weather is Hail, Rain, or Sandstorm. If the user is holding a Power Herb or the weather is Sun, the move completes in one turn.",descGen3:"This attack charges on the first turn and executes on the second. Damage is halved if the weather is Hail, Rain, or Sandstorm. If the weather is Sun, the move completes in one turn.",descGen2:"This attack charges on the first turn and executes on the second. Damage is halved if the weather is Rain. If the weather is Sun, the move completes in one turn.",descGen1:"This attack charges on the first turn and executes on the second.",shortDescGen1:"Charges turn 1. Hits turn 2.",prepare:"  [POKEMON] absorbed light!"},solarblade:{descGen8:"This attack charges on the first turn and executes on the second. Power is halved if the weather is Primordial Sea, Rain, Sandstorm, or Snow and the user is not holding Utility Umbrella. If the user is holding a Power Herb or the weather is Desolate Land or Sun, the move completes in one turn. If the user is holding Utility Umbrella and the weather is Desolate Land or Sun, the move still requires a turn to charge.",descGen7:"This attack charges on the first turn and executes on the second. Power is halved if the weather is Hail, Primordial Sea, Rain, or Sandstorm. If the user is holding a Power Herb or the weather is Desolate Land or Sun, the move completes in one turn.",prepare:"#solarbeam"},sonicboom:{descGen1:"Deals 20 HP of damage to the target. This move ignores type immunity."},spectralthief:{clearBoost:"  [SOURCE] stole the target's boosted stats!"},speedswap:{activate:"  [POKEMON] switched Speed with its target!"},spiderweb:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen5:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field.",descGen4:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped.",descGen3:"Prevents the target from switching out. The target can still switch out if it uses Baton Pass. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field, unless it uses Baton Pass, in which case the target will remain trapped."},spikecannon:{descGen4:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen1:"Hits two to five times. Has a 3/8 chance to hit two or three times, and a 1/8 chance to hit four or five times. Damage is calculated once for the first hit and used for every hit. If one of the hits breaks the target's substitute, the move ends."},spikes:{descGen8:"Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to three times before failing. Opponents lose 1/8 of their maximum HP with one layer, 1/6 of their maximum HP with two layers, and 1/4 of their maximum HP with three layers, all rounded down. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, or is hit by Defog.",descGen5:"Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to three times before failing. Opponents lose 1/8 of their maximum HP with one layer, 1/6 of their maximum HP with two layers, and 1/4 of their maximum HP with three layers, all rounded down. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully, or is hit by Defog.",descGen3:"Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to three times before failing. Opponents lose 1/8 of their maximum HP with one layer, 1/6 of their maximum HP with two layers, and 1/4 of their maximum HP with three layers, all rounded down. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully.",descGen2:"Sets up a hazard on the opposing side of the field, causing each opposing Pokemon that switches in to lose 1/8 of their maximum HP, rounded down, unless it is a Flying-type Pokemon. Fails if the effect is already active on the opposing side. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully.",shortDescGen2:"Hurts grounded foes on switch-in. Max 1 layer.",start:"  Spikes were scattered on the ground all around [TEAM]!",end:"  The spikes disappeared from the ground around [TEAM]!",damage:"  [POKEMON] was hurt by the spikes!"},spikyshield:{descGen8:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon making contact with the user lose 1/8 of their maximum HP, rounded down. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen7:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon making contact with the user lose 1/8 of their maximum HP, rounded down. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",descGen6:"The user is protected from most attacks made by other Pokemon during this turn, and Pokemon making contact with the user lose 1/8 of their maximum HP, rounded down. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",damage:"#roughskin"},spiritshackle:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field."},spitup:{descGen4:"Power is equal to 100 times the user's Stockpile count. This move does not apply damage variance. Fails if the user's Stockpile count is 0. Unless there is no target, whether or not this move is successful the user's Defense and Special Defense decrease by as many stages as Stockpile had increased them, and the user's Stockpile count resets to 0.",descGen3:"Damage is multiplied by the user's Stockpile count. This move does not apply damage variance and cannot be a critical hit. Fails if the user's Stockpile count is 0. Unless this move misses, the user's Stockpile count resets to 0."},spite:{descGen3:"Causes the target's last move used to lose 2 to 5 PP, at random. Fails if the target has not made a move, if the move has 0 or 1 PP, or if it no longer knows the move.",shortDescGen3:"Lowers the PP of the target's last move by 2-5.",descGen2:"Causes the target's last move used to lose 2 to 5 PP, at random. Fails if the target has not made a move, or if the move has 0 PP.",activate:"  It reduced the PP of [TARGET]'s [MOVE] by [NUMBER]!"},splash:{activate:"  But nothing happened!"},spotlight:{start:"#followme",startFromZEffect:"#followme"},stealthrock:{descGen8:"Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in. Fails if the effect is already active on the opposing side. Foes lose 1/32, 1/16, 1/8, 1/4, or 1/2 of their maximum HP, rounded down, based on their weakness to the Rock type; 0.25x, 0.5x, neutral, 2x, or 4x, respectively. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, or is hit by Defog.",descGen5:"Sets up a hazard on the opposing side of the field, damaging each opposing Pokemon that switches in. Fails if the effect is already active on the opposing side. Foes lose 1/32, 1/16, 1/8, 1/4, or 1/2 of their maximum HP, rounded down, based on their weakness to the Rock type; 0.25x, 0.5x, neutral, 2x, or 4x, respectively. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully, or is hit by Defog.",start:"  Pointed stones float in the air around [TEAM]!",end:"  The pointed stones disappeared from around [TEAM]!",damage:"  Pointed stones dug into [POKEMON]!"},steamroller:{descGen5:"Has a 30% chance to make the target flinch. Damage doubles if the target has used Minimize while active."},steelbeam:{damage:"#mindblown"},stickyweb:{descGen8:"Sets up a hazard on the opposing side of the field, lowering the Speed by 1 stage of each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Fails if the effect is already active on the opposing side. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, or is hit by Defog.",start:"  A sticky web has been laid out on the ground around [TEAM]!",end:"  The sticky web has disappeared from the ground around [TEAM]!",activate:"  [POKEMON] was caught in a sticky web!"},stockpile:{descGen3:"The user's Stockpile count increases by 1. Fails if the user's Stockpile count is 3. The user's Stockpile count is reset to 0 when it is no longer active.",shortDescGen3:"Raises user's Stockpile count by 1. Max 3 uses.",start:"  [POKEMON] stockpiled [NUMBER]!",end:"  [POKEMON]'s stockpiled effect wore off!"},stomp:{descGen5:"Has a 30% chance to make the target flinch. Damage doubles if the target has used Minimize while active.",descGen4:"Has a 30% chance to make the target flinch. Power doubles if the target has used Minimize while active.",descGen3:"Has a 30% chance to make the target flinch. Damage doubles if the target has used Minimize while active.",descGen2:"Has a 30% chance to make the target flinch. Power doubles if the target is under the effect of Minimize.",descGen1:"Has a 30% chance to make the target flinch."},stringshot:{descGen5:"Lowers the target's Speed by 1 stage.",shortDescGen5:"Lowers the foe(s) Speed by 1.",shortDescGen2:"Lowers the target's Speed by 1."},stunspore:{descGen3:"Paralyzes the target. This move does not ignore type immunity.",descGen1:"Paralyzes the target."},submission:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP.",descGen2:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded half up, but not less than 1 HP. If this move hits a substitute, the recoil damage is always 1 HP.",descGen1:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not take any recoil damage."},substitute:{descGen5:"The user takes 1/4 of its maximum HP, rounded down, and puts it into a substitute to take its place in battle. The substitute is removed once enough damage is inflicted on it, or if the user switches out or faints. Baton Pass can be used to transfer the substitute to an ally, and the substitute will keep its remaining HP. Until the substitute is broken, it receives damage from all attacks made by other Pokemon and shields the user from status effects and stat stage changes caused by other Pokemon. The user still takes normal damage from weather and status effects while behind its substitute. If the substitute breaks during a multi-hit attack, the user will take damage from any remaining hits. If a substitute is created while the user is trapped by a binding move, the binding effect ends immediately. Fails if the user does not have enough HP remaining to create a substitute without fainting, or if it already has a substitute.",descGen1:"The user takes 1/4 of its maximum HP, rounded down, and puts it into a substitute to take its place in battle. The substitute has 1 HP plus the HP used to create it, and is removed once enough damage is inflicted on it or 255 damage is inflicted at once, or if the user switches out or faints. Until the substitute is broken, it receives damage from all attacks made by the opposing Pokemon and shields the user from status effects and stat stage changes caused by the opponent, unless the effect is Disable, Leech Seed, sleep, primary paralysis, or secondary confusion and the user's substitute did not break. The user still takes normal damage from status effects while behind its substitute, unless the effect is confusion damage, which is applied to the opposing Pokemon's substitute instead. If the substitute breaks during a multi-hit attack, the attack ends. Fails if the user does not have enough HP remaining to create a substitute, or if it already has a substitute. The user will create a substitute and then faint if its current HP is exactly 1/4 of its maximum HP.",shortDescGen1:"User takes 1/4 its max HP to put in a Substitute.",start:"  [POKEMON] put in a substitute!",alreadyStarted:"  [POKEMON] already has a substitute!",end:"  [POKEMON]'s substitute faded!",fail:"  But it does not have enough HP left to make a substitute!",activate:"  The substitute took damage for [POKEMON]!"},suckerpunch:{descGen4:"Fails if the target did not select a physical or special attack for use this turn, or if the target moves before the user."},superfang:{descGen1:"Deals damage to the target equal to half of its current HP, rounded down, but not less than 1 HP. This move ignores type immunity.",shortDescGen1:"Damage = 1/2 target's current HP. Hits Ghosts."},surf:{descGen4:"Power doubles if the target is using Dive.",shortDescGen4:"Hits adjacent Pokemon. Power doubles on Dive.",descGen2:"No additional effect.",shortDescGen2:"No additional effect.",shortDescGen3:"Hits foes. Power doubles against Dive."},swagger:{descGen2:"Raises the target's Attack by 2 stages and confuses it. This move will miss if the target's Attack cannot be raised."},swallow:{descGen4:"The user restores its HP based on its Stockpile count. Restores 1/4 of its maximum HP if it's 1, 1/2 of its maximum HP if it's 2, both rounded down, and all of its HP if it's 3. Fails if the user's Stockpile count is 0. The user's Defense and Special Defense decrease by as many stages as Stockpile had increased them, and the user's Stockpile count resets to 0.",descGen3:"The user restores its HP based on its Stockpile count. Restores 1/4 of its maximum HP if it's 1, 1/2 of its maximum HP if it's 2, both rounded half down, and all of its HP if it's 3. Fails if the user's Stockpile count is 0. The user's Stockpile count resets to 0."},sweetscent:{descGen5:"Lowers the target's evasiveness by 1 stage.",shortDescGen5:"Lowers the foe(s) evasiveness by 1.",shortDescGen2:"Lowers the target's evasiveness by 1."},swift:{descGen1:"This move does not check accuracy and hits even if the target is using Dig or Fly.",shortDescGen1:"Never misses, even against Dig and Fly.",shortDescGen2:"This move does not check accuracy."},switcheroo:{descGen6:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail, if neither is holding an item, if the user is trying to give or take a Mega Stone to or from the species that can Mega Evolve with it, or if the user is trying to give or take a Blue Orb, a Red Orb, a Griseous Orb, a Plate, or a Drive to or from a Kyogre, a Groudon, a Giratina, an Arceus, or a Genesect, respectively. The target is immune to this move if it has the Sticky Hold Ability.",descGen5:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail, if neither is holding an item, or if the user is trying to give or take a Griseous Orb, a Plate, or a Drive to or from a Giratina, an Arceus, or a Genesect, respectively. The target is immune to this move if it has the Sticky Hold Ability.",descGen4:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail or Griseous Orb, if neither is holding an item, if either has the Multitype Ability, if either is under the effect of Knock Off, or if the target has the Sticky Hold Ability.",activate:"#trick"},synthesis:{descGen8:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect or if the user is holding Utility Umbrella, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen7:"The user restores 1/2 of its maximum HP if Delta Stream or no weather conditions are in effect, 2/3 of its maximum HP if the weather is Desolate Land or Sun, and 1/4 of its maximum HP if the weather is Hail, Primordial Sea, Rain, or Sandstorm, all rounded half down.",descGen5:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded half down.",descGen4:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, 2/3 of its maximum HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Hail, Rain, or Sandstorm, all rounded down.",descGen2:"The user restores 1/2 of its maximum HP if no weather conditions are in effect, all of its HP if the weather is Sun, and 1/4 of its maximum HP if the weather is Rain or Sandstorm, all rounded down."},syrupbomb:{start:"  [POKEMON] got covered in sticky candy syrup!"},tailglow:{descGen4:"Raises the user's Special Attack by 2 stages.",shortDescGen4:"Raises the user's Sp. Atk by 2."},tailwhip:{shortDescGen2:"Lowers the target's Defense by 1."},tailwind:{descGen4:"For 3 turns, the user and its party members have their Speed doubled. Fails if this move is already in effect for the user's side.",shortDescGen4:"For 3 turns, allies' Speed is doubled.",start:"  The Tailwind blew from behind [TEAM]!",end:"  [TEAM]'s Tailwind petered out!"},takedown:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP.",descGen2:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded half up, but not less than 1 HP. If this move hits a substitute, the recoil damage is always 1 HP.",descGen1:"If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded down, but not less than 1 HP. If this move breaks the target's substitute, the user does not take any recoil damage."},tarshot:{start:"  [POKEMON] became weaker to fire!"},taunt:{descGen7:"Prevents the target from using non-damaging moves for its next three turns. Pokemon with the Oblivious Ability or protected by the Aroma Veil Ability are immune. Z-Powered moves can still be selected and executed during this effect.",descGen6:"Prevents the target from using non-damaging moves for its next three turns. Pokemon with the Oblivious Ability or protected by the Aroma Veil Ability are immune.",descGen5:"Prevents the target from using non-damaging moves for its next three turns.",descGen4:"For 3 to 5 turns, prevents the target from using non-damaging moves.",shortDescGen4:"For 3-5 turns, the target can't use status moves.",descGen3:"For 2 turns, prevents the target from using non-damaging moves.",shortDescGen3:"For 2 turns, the target can't use status moves.",start:"  [POKEMON] fell for the taunt!",end:"  [POKEMON] shook off the taunt!",cant:"[POKEMON] can't use [MOVE] after the taunt!"},teatime:{activate:"  It's teatime! Everyone dug in to their Berries!",fail:"  But nothing happened!"},telekinesis:{descGen6:"For 3 turns, the target cannot avoid any attacks made against it, other than OHKO moves, as long as it remains active. During the effect, the target is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, Sticky Web, and the Arena Trap Ability as long as it remains active. If the target uses Baton Pass, the replacement will gain the effect. Ingrain, Smack Down, Thousand Arrows, and Iron Ball override this move if the target is under any of their effects. Fails if the target is already under this effect or the effects of Ingrain, Smack Down, or Thousand Arrows. The target is immune to this move on use if its species is Diglett, Dugtrio, or Gengar while Mega-Evolved. Mega Gengar cannot be under this effect by any means.",descGen5:"For 3 turns, the target cannot avoid any attacks made against it, other than OHKO moves, as long as it remains active. During the effect, the target is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability as long as it remains active. If the target uses Baton Pass, the replacement will gain the effect. Ingrain, Smack Down, and Iron Ball override this move if the target is under any of their effects. Fails if the target is already under this effect or the effects of Ingrain or Smack Down. The target is immune to this move on use if its species is Diglett or Dugtrio.",start:"  [POKEMON] was hurled into the air!",end:"  [POKEMON] was freed from the telekinesis!"},teleport:{descGen7:"Fails when used.",shortDescGen7:"Fails when used."},thief:{descGen6:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail, or if the target is a Kyogre holding a Blue Orb, a Groudon holding a Red Orb, a Giratina holding a Griseous Orb, an Arceus holding a Plate, a Genesect holding a Drive, or a Pokemon that can Mega Evolve holding the Mega Stone for its species. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen5:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail, or if the target is a Giratina holding a Griseous Orb, an Arceus holding a Plate, or a Genesect holding a Drive. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",descGen4:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail or Griseous Orb, or if the target has the Multitype Ability. Items lost to this move cannot be regained with Recycle.",descGen3:"If this attack was successful and the user has not fainted, it steals the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail or Enigma Berry. Items lost to this move cannot be regained with Recycle.",descGen2:"Has a 100% chance to steal the target's held item if the user is not holding one. The target's item is not stolen if it is a Mail."},thousandwaves:{descGen7:"Prevents the target from switching out. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. If the target leaves the field using Baton Pass, the replacement will remain trapped. The effect ends if the user leaves the field."},thrash:{descGen6:"The user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect if it is not already. This move targets an adjacent opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target on the first turn of the effect or the second turn of a three-turn effect, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen4:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, is asleep at the beginning of a turn, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen3:"The user spends two or three turns locked into this move and becomes confused at the end of the last turn of the effect if it is not already. This move targets an opposing Pokemon at random on each turn. If the user is prevented from moving, falls asleep, becomes frozen, or the attack is not successful against the target, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen2:"Whether or not this move is successful, the user spends two or three turns locked into this move and becomes confused immediately after its move on the last turn of the effect, even if it is already confused. If the user is prevented from moving, the effect ends without causing confusion. If this move is called by Sleep Talk, the move is used for one turn and does not confuse the user.",descGen1:"Whether or not this move is successful, the user spends three or four turns locked into this move and becomes confused immediately after its move on the last turn of the effect, even if it is already confused. If the user is prevented from moving, the effect ends without causing confusion. During the effect, this move's accuracy is overwritten every turn with the current calculated accuracy including stat stage changes, but not to less than 1/256 or more than 255/256.",shortDescGen1:"Lasts 3-4 turns. Confuses the user afterwards."},throatchop:{descGen7:"For 2 turns, the target cannot use sound-based moves. Z-Powered sound moves can still be selected and executed during this effect.",cant:"The effects of Throat Chop prevent [POKEMON] from using certain moves!"},thunder:{descGen7:"Has a 30% chance to paralyze the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Primordial Sea or Rain, this move does not check accuracy. If the weather is Desolate Land or Sun, this move's accuracy is 50%.",descGen5:"Has a 30% chance to paralyze the target. This move can hit a target using Bounce, Fly, or Sky Drop, or is under the effect of Sky Drop. If the weather is Rain, this move does not check accuracy. If the weather is Sun, this move's accuracy is 50%.",descGen4:"Has a 30% chance to paralyze the target. This move can hit a target using Bounce or Fly. If the weather is Rain, this move does not check accuracy. If the weather is Sun, this move's accuracy is 50%.",descGen2:"Has a 30% chance to paralyze the target. This move can hit a target using Fly. If the weather is Rain, this move does not check accuracy. If the weather is Sun, this move's accuracy is 50%.",descGen1:"Has a 10% chance to paralyze the target.",shortDescGen1:"10% chance to paralyze the target."},thundercage:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",start:"  [SOURCE] trapped [POKEMON]!"},tidyup:{activate:"  Tidying up complete!"},torment:{start:"  [POKEMON] was subjected to torment!",end:"  [POKEMON] is no longer tormented!"},toxic:{descGen5:"Badly poisons the target.",shortDescGen5:"Badly poisons the target."},toxicspikes:{descGen8:"Sets up a hazard on the opposing side of the field, poisoning each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to two times before failing. Opposing Pokemon become poisoned with one layer and badly poisoned with two layers. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, is hit by Defog, or a grounded Poison-type Pokemon switches in. Safeguard prevents the opposing party from being poisoned on switch-in, but a substitute does not.",descGen5:"Sets up a hazard on the opposing side of the field, poisoning each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to two times before failing. Opposing Pokemon become poisoned with one layer and badly poisoned with two layers. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully, is hit by Defog, or a grounded Poison-type Pokemon switches in. Safeguard prevents the opposing party from being poisoned on switch-in, but a substitute does not.",descGen4:"Sets up a hazard on the opposing side of the field, poisoning each opposing Pokemon that switches in, unless it is a Flying-type Pokemon or has the Levitate Ability. Can be used up to two times before failing. Opposing Pokemon become poisoned with one layer and badly poisoned with two layers. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin successfully, is hit by Defog, or a grounded Poison-type Pokemon switches in. Safeguard prevents the opposing party from being poisoned on switch-in, as well as switching in with a substitute.",start:"  Poison spikes were scattered on the ground all around [TEAM]!",end:"  The poison spikes disappeared from the ground around [TEAM]!"},transform:{descGen4:"The user transforms into the target. The target's current stats, stat stages, types, moves, Ability, weight, IVs, species, and sprite are copied. The user's level and HP remain the same and each copied move receives only 5 PP. This move fails if the target has transformed.",descGen2:"The user transforms into the target. The target's current stats, stat stages, types, moves, DVs, species, and sprite are copied. The user's level and HP remain the same and each copied move receives only 5 PP. This move fails if the target has transformed.",shortDescGen2:"Copies target's stats, moves, types, and species.",descGen1:"The user transforms into the target. The target's current stats, stat stages, types, moves, DVs, species, and sprite are copied. The user's level and HP remain the same and each copied move receives only 5 PP. This move can hit a target using Dig or Fly.",transform:"[POKEMON] transformed into [SPECIES]!"},triattack:{descGen2:"This move selects burn, freeze, or paralysis at random, and has a 20% chance to inflict the target with that status. If the target is frozen and burn was selected, it thaws out.",descGen1:"No additional effect.",shortDescGen1:"No additional effect."},trick:{descGen6:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail, if neither is holding an item, if the user is trying to give or take a Mega Stone to or from the species that can Mega Evolve with it, or if the user is trying to give or take a Blue Orb, a Red Orb, a Griseous Orb, a Plate, or a Drive to or from a Kyogre, a Groudon, a Giratina, an Arceus, or a Genesect, respectively. The target is immune to this move if it has the Sticky Hold Ability.",descGen5:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail, if neither is holding an item, or if the user is trying to give or take a Griseous Orb, a Plate, or a Drive to or from a Giratina, an Arceus, or a Genesect, respectively. The target is immune to this move if it has the Sticky Hold Ability.",descGen4:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail or Griseous Orb, if neither is holding an item, if either has the Multitype Ability, if either is under the effect of Knock Off, or if the target has the Sticky Hold Ability.",descGen3:"The user swaps its held item with the target's held item. Fails if either the user or the target is holding a Mail, if neither is holding an item, if either is under the effect of Knock Off, or if the target has the Sticky Hold Ability.",activate:"  [POKEMON] switched items with its target!"},triplekick:{descGen4:"Hits three times. Power increases to 20 for the second hit and 30 for the third. This move checks accuracy for each hit, and the attack ends if the target avoids a hit. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits three times. Power increases to 20 for the second hit and 30 for the third. This move checks accuracy for each hit, and the attack ends if the target avoids a hit. If one of the hits breaks the target's substitute, it will take damage for the remaining hits.",descGen2:"Hits one to three times, at random. Power increases to 20 for the second hit and 30 for the third.",shortDescGen2:"Hits 1-3 times. Power rises with each hit."},twineedle:{descGen4:"Hits twice, with each hit having a 20% chance to poison the target. If the first hit breaks the target's substitute, it will take damage for the second hit. If the target has a Focus Sash and had full HP when this move started, it will not be knocked out regardless of the number of hits.",descGen3:"Hits twice, with each hit having a 20% chance to poison the target. If the first hit breaks the target's substitute, it will take damage for the second hit.",descGen2:"Hits twice, with the second hit having a 20% chance to poison the target. If the first hit breaks the target's substitute, it will take damage for the second hit but the target cannot be poisoned by it.",shortDescGen2:"Hits 2 times. Last hit has 20% chance to poison.",descGen1:"Hits twice, with the second hit having a 20% chance to poison the target. If the first hit breaks the target's substitute, the move ends."},twister:{descGen4:"Has a 20% chance to make the target flinch. Power doubles if the target is using Bounce or Fly.",descGen2:"Has a 20% chance to make the target flinch. Power doubles if the target is using Fly.",shortDescGen2:"20% chance to make the target flinch."},uturn:{descGen6:"If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members, or if the target switched out using an Eject Button.",descGen4:"If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members.",switchOut:"[POKEMON] went back to [TRAINER]!"},uproar:{descGen6:"The user spends three turns locked into this move. This move targets an adjacent opponent at random on each turn. On the first of the three turns, all sleeping active Pokemon wake up. During the three turns, no active Pokemon can fall asleep by any means, and Pokemon switched in during the effect do not wake up. If the user is prevented from moving or the attack is not successful against the target during one of the turns, the effect ends.",descGen4:"The user spends three to six turns locked into this move. This move targets an opponent at random on each turn. During effect, no active Pokemon can fall asleep by any means, and Pokemon that are already asleep wake up as their turn starts or at the end of each turn, including the last one. If the user is prevented from moving or the attack is not successful against the target during one of the turns, the effect ends.",shortDescGen4:"Lasts 3-6 turns. Active Pokemon cannot sleep.",descGen3:"The user spends two to five turns locked into this move. This move targets an opposing Pokemon at random on each turn. During effect, no active Pokemon can fall asleep by any means, and Pokemon that are already asleep wake up as their turn starts or at the end of each turn, including the last one. If the user is prevented from moving or the attack is not successful against the target during one of the turns, the effect ends.",shortDescGen3:"Lasts 2-5 turns. Active Pokemon cannot sleep.",start:"  [POKEMON] caused an uproar!",end:"  [POKEMON] calmed down.",upkeep:"  [POKEMON] is making an uproar!",block:"  But the uproar kept [POKEMON] awake!",blockSelf:"  [POKEMON] can't sleep in an uproar!"},voltswitch:{descGen6:"If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members, or if the target switched out using an Eject Button.",switchOut:"#uturn"},volttackle:{descGen4:"Has a 10% chance to paralyze the target. If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen4:"Has 1/3 recoil. 10% chance to paralyze target.",descGen3:"If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen3:"Has 1/3 recoil."},wakeupslap:{descGen4:"Power doubles if the target is asleep. If this move is successful, the target wakes up."},waterfall:{descGen3:"No additional effect.",shortDescGen3:"No additional effect."},waterpledge:{activate:"  [POKEMON] is waiting for [TARGET]'s move...",start:"  A rainbow appeared in the sky on [TEAM]'s side!",end:"  The rainbow on [TEAM]'s side disappeared!"},watershuriken:{descGen6:"Hits two to five times. Has a 35% chance to hit two or three times and a 15% chance to hit four or five times. If one of the hits breaks the target's substitute, it will take damage for the remaining hits. If the user has the Skill Link Ability, this move will always hit five times."},weatherball:{descGen8:"Power doubles if a weather condition other than Delta Stream is active, and this move's type changes to match. Ice type during Hail, Water type during Primordial Sea or Rain, Rock type during Sandstorm, and Fire type during Desolate Land or Sun. If the user is holding Utility Umbrella and uses Weather Ball during Primordial Sea, Rain, Desolate Land, or Sun, this move remains Normal type and does not double in power.",descGen5:"Power doubles if a weather condition is active, and this move's type changes to match. Ice type during Hail, Water type during Rain, Rock type during Sandstorm, and Fire type during Sun.",descGen3:"Damage doubles if a weather condition is active, and this move's type changes to match. Ice type during Hail, Water type during Rain, Rock type during Sandstorm, and Fire type during Sun.",shortDescGen3:"Damage doubles and type varies during weather.",move:"Breakneck Blitz turned into [MOVE] due to the weather!"},whirlpool:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",start:"  [POKEMON] became trapped in the vortex!"},whirlwind:{descGen4:"The target is forced to switch out and be replaced with a random unfainted ally. Fails if the target is the last unfainted Pokemon in its party, if the target used Ingrain previously or has the Suction Cups Ability, or if the user's level is lower than the target's and X * (user's level + target's level) / 256 + 1 is less than or equal to (target's level / 4), rounded down, where X is a random number from 0 to 255.",descGen2:"The target is forced to switch out and be replaced with a random unfainted ally. Fails if the target is the last unfainted Pokemon in its party, or if the user moves before the target.",descGen1:"No competitive use.",shortDescGen1:"No competitive use."},wideguard:{descGen8:"The user and its party members are protected from moves made by other Pokemon, including allies, during this turn that target all adjacent foes or all adjacent Pokemon. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",descGen7:"The user and its party members are protected from moves made by other Pokemon, including allies, during this turn that target all adjacent foes or all adjacent Pokemon. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",descGen6:"The user and its party members are protected from damaging attacks made by other Pokemon, including allies, during this turn that target all adjacent foes or all adjacent Pokemon. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",shortDescGen6:"Protects allies from multi-target damage this turn.",descGen5:"The user and its party members are protected from damaging attacks made by other Pokemon, including allies, during this turn that target all adjacent foes or all adjacent Pokemon. This attack has a 1/X chance of being successful, where X starts at 1 and doubles each time this move is successfully used. X resets to 1 if this attack fails or if the user's last used move is not Detect, Endure, Protect, Quick Guard, or Wide Guard. If X is 256 or more, this move has a 1/(2^32) chance of being successful. Fails if the user moves last this turn or if this move is already in effect for the user's side.",start:"  Wide Guard protected [TEAM]!",block:"  Wide Guard protected [POKEMON]!"},wish:{descGen4:"At the end of the next turn, the Pokemon at the user's position has 1/2 of its maximum HP restored to it, rounded down. Fails if this move is already in effect for the user's position.",shortDescGen4:"Next turn, heals 50% of the recipient's max HP.",heal:"  [NICKNAME]'s wish came true!"},woodhammer:{descGen4:"If the target lost HP, the user takes recoil damage equal to 1/3 the HP lost by the target, rounded down, but not less than 1 HP.",shortDescGen4:"Has 1/3 recoil."},worryseed:{descGen8:"Causes the target's Ability to become Insomnia. Fails if the target's Ability is As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Insomnia, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Truant, or Zen Mode.",descGen7:"Causes the target's Ability to become Insomnia. Fails if the target's Ability is Battle Bond, Comatose, Disguise, Insomnia, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Truant, or Zen Mode.",descGen6:"Causes the target's Ability to become Insomnia. Fails if the target's Ability is Insomnia, Multitype, Stance Change, or Truant.",descGen5:"Causes the target's Ability to become Insomnia. Fails if the target's Ability is Insomnia, Multitype, or Truant.",descGen4:"Causes the target's Ability to become Insomnia. Fails if the target's Ability is Multitype or Truant, or if the target is holding a Griseous Orb."},wrap:{descGen8:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Flip Turn, Parting Shot, Teleport, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen7:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/8 of its maximum HP (1/6 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, Parting Shot, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen5:"Prevents the target from switching for four or five turns (seven turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the user is holding Binding Band), rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass, U-turn, or Volt Switch. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen4:"Prevents the target from switching for two to five turns (always five turns if the user is holding Grip Claw). Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it is holding Shed Shell or uses Baton Pass or U-turn. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",shortDescGen4:"Traps and damages the target for 2-5 turns.",descGen3:"Prevents the target from switching for two to five turns. Causes damage to the target equal to 1/16 of its maximum HP, rounded down, at the end of each turn during effect. The target can still switch out if it uses Baton Pass. The effect ends if either the user or the target leaves the field, or if the target uses Rapid Spin or Substitute successfully. This effect is not stackable or reset by using this or another binding move.",descGen1:"The user spends two to five turns using this move. Has a 3/8 chance to last two or three turns, and a 1/8 chance to last four or five turns. The damage calculated for the first turn is used for every other turn. The user cannot select a move and the target cannot execute a move during the effect, but both may switch out. If the user switches out, the target remains unable to execute a move during that turn. If the target switches out, the user uses this move again automatically, and if it had 0 PP at the time, it becomes 63. If the user or the target switch out, or the user is prevented from moving, the effect ends. This move can prevent the target from moving even if it has type immunity, but will not deal damage.",shortDescGen1:"Prevents the target from moving for 2-5 turns.",start:"  [POKEMON] was wrapped by [SOURCE]!",move:"[POKEMON]'s attack continues!"},wringout:{descGen4:"Power is equal to 120 * (target's current HP / target's maximum HP) + 1, rounded down."},yawn:{start:"  [POKEMON] grew drowsy!"},zippyzap:{descGen7:"Will always result in a critical hit.",shortDescGen7:"Nearly always goes first. Always crits."},aerilate:{descGen6:"This Pokemon's Normal-type moves become Flying-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",shortDescGen6:"This Pokemon's Normal-type moves become Flying type and have 1.3x power."},aftermath:{damage:"  [POKEMON] was hurt!"},airlock:{start:"  The effects of the weather disappeared."},angerpoint:{descGen4:"If this Pokemon, or its substitute, is struck by a critical hit, its Attack is raised by 12 stages.",shortDescGen4:"If this Pokemon or its substitute takes a critical hit, its Attack is raised 12 stages.",boost:"  [POKEMON] maxed its Attack!"},anticipation:{descGen6:"On switch-in, this Pokemon is alerted if any opposing Pokemon has an attack that is super effective against this Pokemon, or an OHKO move. This effect considers any move that deals direct damage as an attacking move of its respective type, Hidden Power counts as its determined type, and Judgment, Natural Gift, Techno Blast, and Weather Ball are considered Normal-type moves.",descGen5:"On switch-in, this Pokemon is alerted if any opposing Pokemon has an attack that is super effective against this Pokemon, or an OHKO move. This effect considers any move that deals direct damage as an attacking move of its respective type, and Hidden Power, Judgment, Natural Gift, Techno Blast, and Weather Ball are considered Normal-type moves.",descGen4:"On switch-in, this Pokemon is alerted if any opposing Pokemon has an attack that is super effective against this Pokemon, or an OHKO move that this Pokemon is not immune to and if its level is less than or equal to the opposing Pokemon's level. This effect does not consider Counter, Dragon Rage, Metal Burst, Mirror Coat, Night Shade, Psywave, or Seismic Toss as attacking moves, and Hidden Power, Judgment, Natural Gift, and Weather Ball are considered Normal-type moves. This effect considers any changes to the effectiveness of attacks against this Pokemon due to the effects of Gravity or the Normalize or Scrappy Abilities.",activate:"  [POKEMON] shuddered!"},arenatrap:{descGen6:"Prevents adjacent opposing Pokemon from choosing to switch out unless they are airborne, are holding a Shed Shell, or are a Ghost type.",descGen5:"Prevents adjacent opposing Pokemon from choosing to switch out unless they are airborne or holding a Shed Shell.",descGen4:"Prevents opposing Pokemon from choosing to switch out unless they are airborne or holding a Shed Shell.",descGen3:"Prevents opposing Pokemon from choosing to switch out unless they are airborne."},armortail:{block:"#damp"},aromaveil:{block:"  [POKEMON] is protected by an aromatic veil!"},asone:{start:"  [POKEMON] has two Abilities!"},aurabreak:{start:"  [POKEMON] reversed all other Pokémon's auras!"},baddreams:{descGen6:"Causes adjacent opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.",shortDescGen6:"Causes sleeping adjacent foes to lose 1/8 of their max HP at the end of each turn.",descGen4:"Causes opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.",shortDescGen4:"Causes sleeping foes to lose 1/8 of their max HP at the end of each turn.",damage:"  [POKEMON] is tormented!"},battlebond:{descGen8:"If this Pokemon is a Greninja, it transforms into Ash-Greninja if it attacks and knocks out another Pokemon. If this Pokemon is an Ash-Greninja, its Water Shuriken has 20 power and always hits three times.",shortDescGen8:"After KOing a Pokemon: becomes Ash-Greninja, Water Shuriken: 20 power, hits 3x.",activate:"  [POKEMON] became fully charged due to its bond with its Trainer!",transform:"[POKEMON] became Ash-Greninja!"},beadsofruin:{start:"  [POKEMON]'s Beads of Ruin weakened the Sp. Def of all surrounding Pokémon!"},blaze:{descGen4:"When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Fire-type attacks have their power multiplied by 1.5.",shortDescGen4:"At 1/3 or less of its max HP, this Pokemon's Fire-type attacks have 1.5x power."},cheekpouch:{descGen7:"If this Pokemon eats a held Berry, it restores 1/3 of its maximum HP, rounded down, in addition to the Berry's effect. This effect can also activate after the effects of Bug Bite, Fling, and Pluck if the eaten Berry has an effect on this Pokemon."},chlorophyll:{descGen7:"If Sun is active, this Pokemon's Speed is doubled."},cloudnine:{start:"#airlock"},colorchange:{descGen4:"This Pokemon's type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after each hit from a multi-hit move. This effect does not happen if this Pokemon did not lose HP from the attack."},comatose:{start:"  [POKEMON] is drowsing!"},commander:{activate:"  [POKEMON] was swallowed by [TARGET] and became [TARGET]'s commander!"},contrary:{descGen7:"If this Pokemon has a stat stage raised it is lowered instead, and vice versa. This Ability does not affect stat stage increases received from Z-Power effects that happen before a Z-Move is used.",descGen6:"If this Pokemon has a stat stage raised it is lowered instead, and vice versa."},cutecharm:{descGen4:"There is a 30% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"There is a 1/3 chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"1/3 chance of infatuating Pokemon of the opposite gender if they make contact."},damp:{descGen7:"While this Pokemon is active, Explosion, Mind Blown, Self-Destruct, and the Aftermath Ability are prevented from having an effect.",shortDescGen7:"Prevents Explosion/Mind Blown/Self-Destruct/Aftermath while this Pokemon is active.",descGen6:"While this Pokemon is active, Explosion, Self-Destruct, and the Aftermath Ability are prevented from having an effect.",shortDescGen6:"Prevents Explosion/Self-Destruct/Aftermath while this Pokemon is active.",descGen3:"While this Pokemon is active, Explosion and Self-Destruct are prevented from having an effect.",shortDescGen3:"Prevents Explosion and Self-Destruct while this Pokemon is active.",block:"  [SOURCE] cannot use [MOVE]!"},darkaura:{start:"  [POKEMON] is radiating a dark aura!"},dauntlessshield:{shortDescGen8:"On switch-in, this Pokemon's Defense is raised by 1 stage."},dazzling:{block:"#damp"},disguise:{descGen7:"If this Pokemon is a Mimikyu, the first hit it takes in battle deals 0 neutral damage. Its disguise is then broken and it changes to Busted Form. Confusion damage also breaks the disguise.",shortDescGen7:"(Mimikyu only) First hit deals 0 damage, breaks disguise.",block:"  Its disguise served it as a decoy!",transform:"[POKEMON]'s disguise was busted!"},dryskin:{descGen7:"This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move. The power of Fire-type moves is multiplied by 1.25 when used on this Pokemon. At the end of each turn, this Pokemon restores 1/8 of its maximum HP, rounded down, if the weather is Rain, and loses 1/8 of its maximum HP, rounded down, if the weather is Sun.",damage:"  ([POKEMON] was hurt by its Dry Skin.)"},effectspore:{descGen4:"30% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"10% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"10% chance of poison/paralysis/sleep on others making contact with this Pokemon."},electromorphosis:{start:"  Being hit by [MOVE] charged [POKEMON] with power!"},embodyaspectcornerstone:{boost:"  The Cornerstone Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Defense rose!"},embodyaspecthearthflame:{boost:"  The Hearthflame Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Attack rose!"},embodyaspectteal:{boost:"  The Teal Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Speed rose!"},embodyaspectwellspring:{boost:"  The Wellspring Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Sp. Def rose!"},fairyaura:{start:"  [POKEMON] is radiating a fairy aura!"},flamebody:{descGen4:"30% chance a Pokemon making contact with this Pokemon will be burned. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"1/3 chance a Pokemon making contact with this Pokemon will be burned. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"1/3 chance a Pokemon making contact with this Pokemon will be burned."},flashfire:{descGen4:"This Pokemon is immune to Fire-type moves, as long as it is not frozen. The first time it is hit by a Fire-type move, damage from its Fire-type attacks will be multiplied by 1.5 as long as it remains active and has this Ability.",descGen3:"This Pokemon is immune to Fire-type moves, as long as it is not frozen. The first time it is hit by a Fire-type move, damage from its Fire-type attacks will be multiplied by 1.5 as long as it remains active and has this Ability. If this Pokemon has a non-volatile status condition, is a Fire type, or has a substitute, Will-O-Wisp will not activate this Ability.",start:"  The power of [POKEMON]'s Fire-type moves rose!"},flowergift:{descGen7:"If this Pokemon is a Cherrim and Sun is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5.",descGen4:"If Sun is active, the Attack and Special Defense of this Pokemon and its allies are multiplied by 1.5.",shortDescGen4:"If Sun is active, Attack and Sp. Def of this Pokemon and its allies are 1.5x."},flowerveil:{block:"  [POKEMON] surrounded itself with a veil of petals!"},forecast:{descGen7:"If this Pokemon is a Castform, its type changes to the current weather condition's type, except Sandstorm."},forewarn:{descGen4:"On switch-in, this Pokemon is alerted to the move with the highest power, at random, known by an opposing Pokemon. This effect considers OHKO moves to have 150 power, Counter, Mirror Coat, and Metal Burst to have 120 power, and every other attacking move with an unspecified power to have 80 power.",activate:"  [TARGET]'s [MOVE] was revealed!",activateNoTarget:"  [POKEMON]'s Forewarn alerted it to [MOVE]!"},frisk:{shortDescGen5:"On switch-in, this Pokemon identifies the held item of a random opposing Pokemon.",activate:"  [POKEMON] frisked [TARGET] and found its [ITEM]!",activateNoTarget:"  [POKEMON] frisked its target and found one [ITEM]!"},galewings:{shortDescGen6:"This Pokemon's Flying-type moves have their priority increased by 1."},hadronengine:{start:"  [POKEMON] turned the ground into Electric Terrain, energizing its futuristic engine!",activate:"  [POKEMON] used the Electric Terrain to energize its futuristic engine!"},harvest:{addItem:"  [POKEMON] harvested one [ITEM]!"},healer:{descGen6:"30% chance each of this Pokemon's adjacent allies has its non-volatile status condition cured at the end of each turn.",shortDescGen6:"30% chance each adjacent ally has its status cured at the end of each turn."},heatproof:{descGen8:"The power of Fire-type attacks against this Pokemon is halved. This Pokemon takes half of the usual burn damage, rounded down.",shortDescGen8:"The power of Fire-type attacks against this Pokemon is halved; burn damage halved."},hospitality:{heal:"  [POKEMON] drank down all the matcha that [SOURCE] made!"},hydration:{descGen7:"This Pokemon has its non-volatile status condition cured at the end of each turn if Rain is active."},icebody:{descGen8:"If Hail is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from Hail.",shortDescGen8:"If Hail is active, this Pokemon heals 1/16 of its max HP each turn; immunity to Hail."},iceface:{descGen8:"If this Pokemon is an Eiscue, the first physical hit it takes in battle deals 0 neutral damage. Its ice face is then broken and it changes forme to Noice Face. Eiscue regains its Ice Face forme when Hail begins or when Eiscue switches in while Hail is active. Confusion damage also breaks the ice face.",shortDescGen8:"If Eiscue, the first physical hit it takes deals 0 damage. This effect is restored in Hail."},illuminate:{shortDescGen8:"No competitive use."},illusion:{end:"  [POKEMON]'s illusion wore off!"},infiltrator:{descGen6:"This Pokemon's moves ignore substitutes and the opposing side's Reflect, Light Screen, Safeguard, and Mist.",shortDescGen6:"Moves ignore substitutes and the foe's Reflect, Light Screen, Safeguard, and Mist.",descGen5:"This Pokemon's moves ignore the opposing side's Reflect, Light Screen, Safeguard, and Mist.",shortDescGen5:"This Pokemon's moves ignore the foe's Reflect, Light Screen, Safeguard, and Mist."},innardsout:{damage:"#aftermath"},innerfocus:{descGen7:"This Pokemon cannot be made to flinch.",shortDescGen7:"This Pokemon cannot be made to flinch."},intimidate:{descGen7:"On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.",descGen6:"On switch-in, this Pokemon lowers the Attack of adjacent opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.",shortDescGen6:"On switch-in, this Pokemon lowers the Attack of adjacent opponents by 1 stage.",descGen4:"On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune. If U-turn breaks an opposing substitute and this Pokemon switches in as the replacement, the Pokemon that had the substitute is still immune to this Ability.",shortDescGen4:"On switch-in, this Pokemon lowers the Attack of opponents by 1 stage.",descGen3:"On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune."},intrepidsword:{shortDescGen8:"On switch-in, this Pokemon's Attack is raised by 1 stage."},ironbarbs:{damage:"#roughskin"},keeneye:{descGen5:"Prevents other Pokemon from lowering this Pokemon's accuracy stat stage.",shortDescGen5:"Prevents other Pokemon from lowering this Pokemon's accuracy stat stage."},leafguard:{descGen7:"If Sun is active, this Pokemon cannot become affected by a non-volatile status condition or Yawn, and Rest will fail for it.",descGen4:"If Sun is active, this Pokemon cannot become affected by a non-volatile status condition or Yawn, but can use Rest normally.",shortDescGen4:"If Sun is active, this Pokemon cannot be statused, but Rest works normally."},levitate:{descGen5:"This Pokemon is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability. The effects of Gravity, Ingrain, Smack Down, and Iron Ball nullify the immunity.",descGen4:"This Pokemon is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability. The effects of Gravity, Ingrain, and Iron Ball nullify the immunity.",shortDescGen4:"This Pokemon is immune to Ground; Gravity/Ingrain/Iron Ball nullify it.",descGen3:"This Pokemon is immune to Ground-type attacks and the effects of Spikes and the Arena Trap Ability.",shortDescGen3:"This Pokemon is immune to Ground."},libero:{descGen8:"This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type.",shortDescGen8:"This Pokemon's type changes to match the type of the move it is about to use."},lightningrod:{descGen4:"If this Pokemon is not the target of a single-target Electric-type move used by another Pokemon, this Pokemon redirects that move to itself.",shortDescGen4:"This Pokemon draws single-target Electric moves to itself.",descGen3:"If this Pokemon is not the target of a single-target Electric-type move used by an opposing Pokemon, this Pokemon redirects that move to itself. This effect considers Hidden Power a Normal-type move.",shortDescGen3:"This Pokemon draws single-target Electric moves used by opponents to itself.",activate:"  [POKEMON] took the attack!"},lingeringaroma:{changeAbility:"  A lingering aroma clings to [TARGET]!"},liquidooze:{descGen4:"This Pokemon damages those draining HP from it for as much as they would heal. This effect does not consider Dream Eater.",damage:"  [POKEMON] sucked up the liquid ooze!"},magicbounce:{descGen5:"This Pokemon is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. Moves reflected in this way are unable to be reflected again by this or Magic Coat's effect. Spikes, Stealth Rock, and Toxic Spikes can only be reflected once per side, by the leftmost Pokemon under this or Magic Coat's effect. The Lightning Rod and Storm Drain Abilities redirect their respective moves before this Ability takes effect.",move:"#magiccoat"},magicguard:{descGen4:"This Pokemon can only be damaged by direct attacks. Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage are considered direct damage. This Pokemon cannot be prevented from moving because of paralysis, and is unaffected by Toxic Spikes on switch-in.",shortDescGen4:"This Pokemon can only be damaged by direct attacks, and can't be fully paralyzed."},magnetpull:{descGen6:"Prevents adjacent opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell or are a Ghost type.",shortDescGen6:"Prevents adjacent opposing Steel-type Pokemon from choosing to switch out.",descGen5:"Prevents adjacent opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell.",shortDescGen5:"Prevents adjacent opposing Steel-type Pokemon from choosing to switch out.",descGen4:"Prevents opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell.",shortDescGen4:"Prevents opposing Steel-type Pokemon from choosing to switch out.",descGen3:"Prevents Steel-type Pokemon from choosing to switch out, other than this Pokemon.",shortDescGen3:"Prevents Steel-type Pokemon from choosing to switch out, other than this Pokemon."},mimicry:{activate:"  [POKEMON] returned to its original type!"},minus:{descGen4:"If an active ally has the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5.",shortDescGen4:"If an active ally has the Plus Ability, this Pokemon's Sp. Atk is 1.5x.",descGen3:"If an active Pokemon has the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5.",shortDescGen3:"If an active Pokemon has the Plus Ability, this Pokemon's Sp. Atk is 1.5x."},moldbreaker:{descGen7:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen6:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen5:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen4:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Clear Body, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Heatproof, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Lightning Rod, Limber, Magma Armor, Marvel Scale, Motor Drive, Oblivious, Own Tempo, Sand Veil, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, and Wonder Guard. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move. The Attack modifier from an ally's Flower Gift Ability is not negated.",start:"  [POKEMON] breaks the mold!"},moody:{descGen7:"This Pokemon has a random stat raised by 2 stages and another stat lowered by 1 stage at the end of each turn.",shortDescGen7:"Raises a random stat by 2 and lowers another stat by 1 at the end of each turn."},multitype:{shortDescGen7:"If this Pokemon is an Arceus, its type changes to match its held Plate or Z-Crystal.",shortDescGen6:"If this Pokemon is an Arceus, its type changes to match its held Plate.",shortDescGen4:"If this Pokemon is an Arceus, its type changes to match its held Plate. This Pokemon cannot lose its held item due to another Pokemon's attack."},mummy:{descGen8:"Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",descGen7:"Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Battle Bond, Comatose, Disguise, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",descGen6:"Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Multitype, Mummy, or Stance Change Abilities.",descGen5:"Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Multitype or Mummy Abilities.",changeAbility:"  [TARGET]'s Ability became Mummy!"},naturalcure:{activate:"  ([POKEMON] is cured by its Natural Cure!)"},neutralizinggas:{start:"  Neutralizing gas filled the area!",end:"  The effects of the neutralizing gas wore off!"},normalize:{descGen6:"This Pokemon's moves are changed to be Normal type. This effect comes before other effects that change a move's type.",shortDescGen6:"This Pokemon's moves are changed to be Normal type.",descGen4:"This Pokemon's moves are changed to be Normal type. This effect comes after other effects that change a move's type, except Struggle."},oblivious:{descGen7:"This Pokemon cannot be infatuated or taunted. Gaining this Ability while infatuated or taunted cures it.",shortDescGen7:"This Pokemon cannot be infatuated or taunted.",descGen5:"This Pokemon cannot be infatuated. Gaining this Ability while infatuated cures it.",shortDescGen5:"This Pokemon cannot be infatuated. Gaining this Ability while infatuated cures it."},orichalcumpulse:{start:"  [POKEMON] turned the sunlight harsh, sending its ancient pulse into a frenzy!",activate:"  [POKEMON] basked in the sunlight, sending its ancient pulse into a frenzy!"},overcoat:{descGen8:"This Pokemon is immune to powder moves, damage from Sandstorm or Hail, and the effects of Rage Powder and the Effect Spore Ability.",shortDescGen8:"This Pokemon is immune to powder moves, Sandstorm or Hail damage, Effect Spore.",descGen5:"This Pokemon is immune to damage from Sandstorm or Hail.",shortDescGen5:"This Pokemon is immune to damage from Sandstorm or Hail."},overgrow:{descGen4:"When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Grass-type attacks have their power multiplied by 1.5.",shortDescGen4:"At 1/3 or less of its max HP, this Pokemon's Grass-type attacks have 1.5x power."},owntempo:{descGen7:"This Pokemon cannot be confused. Gaining this Ability while confused cures it.",shortDescGen7:"This Pokemon cannot be confused."},parentalbond:{descGen8:"This Pokemon's damaging moves become multi-hit moves that hit twice. The second hit has its damage quartered. Does not affect Doom Desire, Dragon Darts, Dynamax Cannon, Endeavor, Explosion, Final Gambit, Fling, Future Sight, Ice Ball, Rollout, Self-Destruct, any multi-hit move, any move that has multiple targets, any two-turn move, or any Max Move.",descGen7:"This Pokemon's damaging moves become multi-hit moves that hit twice. The second hit has its damage quartered. Does not affect Doom Desire, Endeavor, Explosion, Final Gambit, Fling, Future Sight, Ice Ball, Rollout, Self-Destruct, any multi-hit move, any move that has multiple targets, any two-turn move, or any Z-Move.",descGen6:"This Pokemon's damaging moves become multi-hit moves that hit twice. The second hit has its damage halved. Does not affect Doom Desire, Endeavor, Explosion, Final Gambit, Fling, Future Sight, Ice Ball, Rollout, Self-Destruct, any multi-hit move, any move that has multiple targets, or any two-turn move.",shortDescGen6:"This Pokemon's damaging moves hit twice. The second hit has its damage halved."},perishbody:{start:"  Both Pokémon will faint in three turns!"},pickup:{descGen4:"No competitive use.",shortDescGen4:"No competitive use.",addItem:"#recycle"},pixilate:{descGen6:"This Pokemon's Normal-type moves become Fairy-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",shortDescGen6:"This Pokemon's Normal-type moves become Fairy type and have 1.3x power."},plus:{descGen4:"If an active ally has the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5.",shortDescGen4:"If an active ally has the Minus Ability, this Pokemon's Sp. Atk is 1.5x.",descGen3:"If an active Pokemon has the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5.",shortDescGen3:"If an active Pokemon has the Minus Ability, this Pokemon's Sp. Atk is 1.5x."},poisonpoint:{descGen4:"30% chance a Pokemon making contact with this Pokemon will be poisoned. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"1/3 chance a Pokemon making contact with this Pokemon will be poisoned. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"1/3 chance a Pokemon making contact with this Pokemon will be poisoned."},powerconstruct:{activate:"  You sense the presence of many!",transform:"[POKEMON] transformed into its Complete Forme!"},powerofalchemy:{descGen8:"This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",descGen7:"This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",changeAbility:"#receiver"},prankster:{descGen6:"This Pokemon's non-damaging moves have their priority increased by 1.",shortDescGen6:"This Pokemon's non-damaging moves have their priority increased by 1."},pressure:{descGen8:"If this Pokemon is the target of an opposing Pokemon's move, that move loses one additional PP. Imprison and Snatch also lose one additional PP when used by an opposing Pokemon, but Sticky Web does not.",descGen5:"If this Pokemon is the target of an opposing Pokemon's move, that move loses one additional PP. Imprison and Snatch also lose one additional PP when used by an opposing Pokemon.",descGen4:"If this Pokemon is the target of another Pokemon's move, that move loses one additional PP.",shortDescGen4:"If this Pokemon is the target of a move, that move loses one additional PP.",start:"  [POKEMON] is exerting its pressure!"},protean:{descGen8:"This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type.",shortDescGen8:"This Pokemon's type changes to match the type of the move it is about to use."},protosynthesis:{activate:"  The harsh sunlight activated [POKEMON]'s Protosynthesis!",activateFromItem:"  [POKEMON] used its Booster Energy to activate Protosynthesis!",start:"  [POKEMON]'s [STAT] was heightened!",end:"  The effects of [POKEMON]'s Protosynthesis wore off!"},quarkdrive:{activate:"  The Electric Terrain activated [POKEMON]'s Quark Drive!",activateFromItem:"  [POKEMON] used its Booster Energy to activate its Quark Drive!",start:"  [POKEMON]'s [STAT] was heightened!",end:"  The effects of [POKEMON]'s Quark Drive wore off!"},queenlymajesty:{block:"#damp"},quickdraw:{activate:"  Quick Draw made [POKEMON] move faster!"},quickfeet:{descGen6:"If this Pokemon has a non-volatile status condition, its Speed is multiplied by 1.5. This Pokemon ignores the paralysis effect of quartering Speed."},raindish:{descGen7:"If Rain is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn."},rattled:{descGen7:"This Pokemon's Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.",shortDescGen7:"This Pokemon's Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack."},receiver:{descGen8:"This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",descGen7:"This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",changeAbility:"  [SOURCE]'s [ABILITY] was taken over!"},refrigerate:{descGen6:"This Pokemon's Normal-type moves become Ice-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",shortDescGen6:"This Pokemon's Normal-type moves become Ice type and have 1.3x power."},rockhead:{descGen3:"This Pokemon does not take recoil damage, except Struggle. Does not affect crash damage.",shortDescGen3:"This Pokemon does not take recoil damage besides Struggle and crash damage."},roughskin:{descGen4:"Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"Pokemon making contact with this Pokemon lose 1/16 of their maximum HP, rounded down. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"Pokemon making contact with this Pokemon lose 1/16 of their max HP.",damage:"  [POKEMON] was hurt!"},sandspit:{descGen8:"When this Pokemon is hit by an attack, the effect of Sandstorm begins. This effect comes after the effects of Max and G-Max Moves."},schooling:{transform:"[POKEMON] formed a school!",transformEnd:"[POKEMON] stopped schooling!"},scrappy:{descGen7:"This Pokemon can hit Ghost types with Normal- and Fighting-type moves.",shortDescGen7:"This Pokemon can hit Ghost types with Normal- and Fighting-type moves."},serenegrace:{descGen4:"This Pokemon's moves have their secondary effect chance doubled."},shadowtag:{descGen6:"Prevents adjacent opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability.",shortDescGen6:"Prevents adjacent foes from choosing to switch unless they also have this Ability.",descGen5:"Prevents adjacent opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell or also have this Ability.",descGen4:"Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell or also have this Ability.",shortDescGen4:"Prevents foes from choosing to switch unless they also have this Ability.",descGen3:"Prevents opposing Pokemon from choosing to switch out.",shortDescGen3:"Prevents opposing Pokemon from choosing to switch out."},sheerforce:{descGen8:"This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",descGen6:"This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Color Change, Pickpocket, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",descGen5:"This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Color Change, Pickpocket, Red Card, and Eject Button from activating."},shieldsdown:{transform:"Shields Down deactivated!\n([POKEMON] shielded itself.)",transformEnd:"Shields Down activated!\n([POKEMON] stopped shielding itself.)"},simple:{descGen7:"When one of this Pokemon's stat stages is raised or lowered, the amount is doubled. This Ability does not affect stat stage increases received from Z-Power effects that happen before a Status Z-Move is used.",descGen6:"When one of this Pokemon's stat stages is raised or lowered, the amount is doubled.",descGen4:"This Pokemon's stat stages are considered doubled during stat calculations. A stat stage cannot be considered more than 6 or less than -6.",shortDescGen4:"This Pokemon's stat stages are considered doubled during stat calculations."},skilllink:{descGen7:"This Pokemon's multi-hit attacks always hit the maximum number of times. Triple Kick does not check accuracy for the second and third hits.",descGen4:"This Pokemon's multi-hit attacks always hit the maximum number of times. Does not affect Triple Kick."},slowstart:{descGen7:"On switch-in, this Pokemon's Attack and Speed are halved for 5 turns. During the effect, if this Pokemon uses a generic Z-Move based on a special move, its Special Attack is halved during damage calculation.",descGen6:"On switch-in, this Pokemon's Attack and Speed are halved for 5 turns.",start:"  [POKEMON] can't get it going!",end:"  [POKEMON] finally got its act together!"},slushrush:{shortDescGen8:"If Hail is active, this Pokemon's Speed is doubled."},snowcloak:{descGen8:"If Hail is active, the accuracy of moves used against this Pokemon is multiplied by 0.8. This Pokemon takes no damage from Hail.",shortDescGen8:"If Hail is active, this Pokemon's evasiveness is 1.25x; immunity to Hail."},snowwarning:{shortDescGen8:"On switch-in, this Pokemon summons Hail."},solarpower:{descGen7:"If Sun is active, this Pokemon's Special Attack is multiplied by 1.5 and it loses 1/8 of its maximum HP, rounded down, at the end of each turn."},soundproof:{shortDescGen7:"This Pokemon is immune to sound-based moves, including Heal Bell.",shortDescGen5:"This Pokemon is immune to sound-based moves, except Heal Bell.",shortDescGen4:"This Pokemon is immune to sound-based moves, including Heal Bell."},stancechange:{descGen6:"If this Pokemon is an Aegislash, it changes to Blade Forme before attempting to use an attacking move, and changes to Shield Forme before attempting to use King's Shield.",transform:"Changed to Blade Forme!",transformEnd:"Changed to Shield Forme!"},"static":{descGen4:"30% chance a Pokemon making contact with this Pokemon will be paralyzed. This effect does not happen if this Pokemon did not lose HP from the attack.",descGen3:"1/3 chance a Pokemon making contact with this Pokemon will be paralyzed. This effect does not happen if this Pokemon did not lose HP from the attack.",shortDescGen3:"1/3 chance a Pokemon making contact with this Pokemon will be paralyzed."},stench:{descGen4:"No competitive use.",shortDescGen4:"No competitive use."},stickyhold:{descGen4:"This Pokemon cannot lose its held item due to another Pokemon's attack, even if the attack knocks out this Pokemon. A Sticky Barb will be transferred to other Pokemon regardless of this Ability.",block:"  [POKEMON]'s item cannot be removed!"},stormdrain:{descGen4:"If this Pokemon is not the target of a single-target Water-type move used by another Pokemon, this Pokemon redirects that move to itself.",shortDescGen4:"This Pokemon draws single-target Water moves to itself.",activate:"#lightningrod"},sturdy:{descGen4:"OHKO moves fail when used against this Pokemon.",shortDescGen4:"OHKO moves fail when used against this Pokemon.",activate:"  [POKEMON] endured the hit!"},suctioncups:{block:"  [POKEMON] is anchored in place with its suction cups!"},supersweetsyrup:{start:"  A supersweet aroma is wafting from the syrup covering [POKEMON]!"},supremeoverlord:{activate:"  [POKEMON] gained strength from the fallen!"},swarm:{descGen4:"When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Bug-type attacks have their power multiplied by 1.5.",shortDescGen4:"At 1/3 or less of its max HP, this Pokemon's Bug-type attacks have 1.5x power."},sweetveil:{block:"  [POKEMON] can't fall asleep due to a veil of sweetness!"},swiftswim:{descGen7:"If Rain is active, this Pokemon's Speed is doubled."},swordofruin:{start:"  [POKEMON]'s Sword of Ruin weakened the Defense of all surrounding Pokémon!"},symbiosis:{descGen7:"If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off, or if the ally used an Eject Button.",descGen6:"If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off.",activate:"  [POKEMON] shared its [ITEM] with [TARGET]!"},synchronize:{descGen4:"If another Pokemon burns, paralyzes, or poisons this Pokemon, that Pokemon receives the same non-volatile status condition. If another Pokemon badly poisons this Pokemon, that Pokemon becomes poisoned."},tabletsofruin:{start:"  [POKEMON]'s Tablets of Ruin weakened the Attack of all surrounding Pokémon!"},technician:{descGen4:"This Pokemon's moves of 60 power or less have their power multiplied by 1.5, except Struggle. This effect comes after a move's effect changes its own power, as well as the effects of Charge and Helping Hand.",shortDescGen4:"This Pokemon's moves of 60 power or less have 1.5x power, except Struggle."},telepathy:{block:"  [POKEMON] can't be hit by attacks from its ally Pokémon!"},teravolt:{descGen7:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen6:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen5:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",start:"  [POKEMON] is radiating a bursting aura!"},thickfat:{descGen4:"The power of Fire- and Ice-type attacks against this Pokemon is halved.",shortDescGen4:"The power of Fire- and Ice-type attacks against this Pokemon is halved.",descGen3:"If a Pokemon uses a Fire- or Ice-type attack against this Pokemon, that Pokemon's Special Attack is halved when calculating the damage to this Pokemon.",shortDescGen3:"Fire-/Ice-type moves against this Pokemon deal damage with a halved Sp. Atk stat."},torrent:{descGen4:"When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Water-type attacks have their power multiplied by 1.5.",shortDescGen4:"At 1/3 or less of its max HP, this Pokemon's Water-type attacks have 1.5x power."},trace:{descGen8:"On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",descGen7:"On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",descGen6:"On switch-in, this Pokemon copies a random adjacent opposing Pokemon's Ability. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",descGen5:"On switch-in, this Pokemon copies a random adjacent opposing Pokemon's Ability. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",descGen4:"On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are Forecast, Multitype, and Trace. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",descGen3:"On switch-in, this Pokemon copies a random opposing Pokemon's Ability.",changeAbility:"  [POKEMON] traced [SOURCE]'s [ABILITY]!"},transistor:{shortDescGen8:"This Pokemon's offensive stat is multiplied by 1.5 while using an Electric-type attack."},truant:{descGen3:"This Pokemon skips every other turn instead of using a move. If this Pokemon replaces a Pokemon that fainted during end-of-turn effects, its first turn will be skipped.",cant:"[POKEMON] is loafing around!"},turboblaze:{descGen7:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen6:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",descGen5:"This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",start:"  [POKEMON] is radiating a blazing aura!"},unnerve:{start:"  [TEAM] is too nervous to eat Berries!"},vesselofruin:{start:"  [POKEMON]'s Vessel of Ruin weakened the Sp. Atk of all surrounding Pokémon!"},voltabsorb:{descGen3:"This Pokemon is immune to damaging Electric-type moves and restores 1/4 of its maximum HP, rounded down, when hit by one.",shortDescGen3:"This Pokemon heals 1/4 its max HP when hit by a damaging Electric move; immunity."},wanderingspirit:{descGen8:"Pokemon making contact with this Pokemon have their Ability swapped with this one. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Hunger Switch, Ice Face, Illusion, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Wonder Guard, or Zen Mode Abilities.",activate:"#skillswap"},weakarmor:{descGen6:"If a physical attack hits this Pokemon, its Defense is lowered by 1 stage and its Speed is raised by 1 stage.",shortDescGen6:"If a physical attack hits this Pokemon, Defense is lowered by 1, Speed is raised by 1."},windpower:{start:"#electromorphosis"},wonderguard:{shortDescGen4:"This Pokemon is only damaged by Fire Fang, supereffective moves, indirect damage.",shortDescGen3:"This Pokemon is only damaged by supereffective moves and indirect damage."},zenmode:{descGen7:"If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan's HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode.",descGen6:"If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan's HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode. If Darmanitan loses this Ability while in Zen Mode, it reverts to Standard Mode immediately.",transform:"Zen Mode triggered!",transformEnd:"Zen Mode ended!"},zerotohero:{activate:"  [POKEMON] underwent a heroic transformation!"},rebound:{move:"#magiccoat"},persistent:{activate:"  [POKEMON] extends [MOVE] by 2 turns!"},druidry:{activate:"  [POKEMON] transfigured the battlefield!"},evergreen:{transform:"[POKEMON] adapted to the climate!"},nottobe:{start:"  [TARGET] will faint next turn!",activate:"[TARGET] will faint next turn!"},nullify:{start:"  The effects of the Weathergy disappeared."},rockybody:{block:"  Its rocks were knocked over!",transform:"[POKEMON]'s rocks were knocked!"},swarming:{transform:"[POKEMON] formed a swarm!",transformEnd:"[POKEMON]'s swarm dissipated!"},tobe:{activate:"  [POKEMON] decided to live!"},abilityshield:{block:"  [POKEMON]'s Ability is protected by the effects of its Ability Shield!"},aguavberry:{descGen7:"Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.",descGen6:"Restores 1/8 max HP at 1/2 max HP or less; confuses if -SpD Nature. Single use."},airballoon:{start:"  [POKEMON] floats in the air with its Air Balloon!",end:"  [POKEMON]'s Air Balloon popped!"},bigroot:{descGen6:"Holder gains 1.3x HP from draining moves, Aqua Ring, Ingrain, and Leech Seed."},blackbelt:{descGen3:"Holder's Fighting-type attacks have 1.1x power."},blacksludge:{heal:"  [POKEMON] restored a little HP using its Black Sludge!"},blackglasses:{descGen3:"Holder's Dark-type attacks have 1.1x power."},brightpowder:{descGen2:"An attack against the holder has its accuracy out of 255 lowered by 20."},buggem:{descGen5:"Holder's first successful Bug-type attack will have 1.5x power. Single use."},charcoal:{descGen3:"Holder's Fire-type attacks have 1.1x power."},clearamulet:{block:"  The effects of [POKEMON]'s Clear Amulet prevent its stats from being lowered!"},custapberry:{activate:"  [POKEMON] can act faster than normal, thanks to its Custap Berry!"},darkgem:{descGen5:"Holder's first successful Dark-type attack will have 1.5x power. Single use."},dragonfang:{descGen3:"Holder's Dragon-type attacks have 1.1x power.",descGen2:"No competitive use."},dragongem:{descGen5:"Holder's first successful Dragon-type attack will have 1.5x power. Single use."},dragonscale:{descGen2:"Holder's Dragon-type attacks have 1.1x power. Evolves Seadra (trade)."},dreamball:{descGen7:"A special Poke Ball that appears out of nowhere in a bag at the Entree Forest."},ejectbutton:{end:"  [POKEMON] is switched out with the Eject Button!"},ejectpack:{end:"  [POKEMON] is switched out by the Eject Pack!"},electricgem:{descGen5:"Holder's first successful Electric-type attack will have 1.5x power. Single use."},enigmaberry:{descGen3:"No competitive use."},fightinggem:{descGen5:"Holder's first successful Fighting-type attack will have 1.5x power. Single use."},figyberry:{descGen7:"Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.",descGen6:"Restores 1/8 max HP at 1/2 max HP or less; confuses if -Atk Nature. Single use."},firegem:{descGen5:"Holder's first successful Fire-type attack will have 1.5x power. Single use."},flyinggem:{descGen5:"Holder's first successful Flying-type attack will have 1.5x power. Single use."},focusband:{descGen2:"Holder has a ~11.7% chance to survive an attack that would KO it with 1 HP.",activate:"  [POKEMON] hung on using its Focus Band!"},focussash:{descGen4:"If holder's HP is full, survives all hits of one attack with at least 1 HP. Single use.",end:"  [POKEMON] hung on using its Focus Sash!"},ghostgem:{descGen5:"Holder's first successful Ghost-type attack will have 1.5x power. Single use."},grassgem:{descGen5:"Holder's first successful Grass-type attack will have 1.5x power. Single use."},griseousorb:{descGen4:"Can only be held by Giratina. Its Ghost- & Dragon-type attacks have 1.2x power."},groundgem:{descGen5:"Holder's first successful Ground-type attack will have 1.5x power. Single use."},hardstone:{descGen3:"Holder's Rock-type attacks have 1.1x power."},iapapaberry:{descGen7:"Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.",descGen6:"Restores 1/8 max HP at 1/2 max HP or less; confuses if -Def Nature. Single use."},icegem:{descGen5:"Holder's first successful Ice-type attack will have 1.5x power. Single use."},icestone:{descGen7:"Evolves Alolan Sandshrew into Alolan Sandslash and Alolan Vulpix into Alolan Ninetales when used."},ironball:{descGen4:"Holder's Speed is halved and it becomes grounded."},laxincense:{descGen3:"The accuracy of attacks against the holder is 0.95x."},leafstone:{descGen7:"Evolves Gloom into Vileplume, Weepinbell into Victreebel, Exeggcute into Exeggutor or Alolan Exeggutor, Nuzleaf into Shiftry, and Pansage into Simisage when used."},leftovers:{heal:"  [POKEMON] restored a little HP using its Leftovers!"},leppaberry:{activate:"  [POKEMON] restored PP to its move [MOVE] using its Leppa Berry!"},lifeorb:{damage:"  [POKEMON] lost some of its HP!"},lightball:{descGen4:"If held by a Pikachu, its attacks have their power doubled.",descGen3:"If held by a Pikachu, its Special Attack is doubled."},lightclay:{descGen6:"Holder's use of Light Screen or Reflect lasts 8 turns instead of 5."},luckypunch:{descGen2:"If held by a Chansey, its critical hit ratio is always at stage 2. (25% crit rate)"},magnet:{descGen3:"Holder's Electric-type attacks have 1.1x power."},magoberry:{descGen7:"Restores 1/2 max HP at 1/4 max HP or less; confuses if -Spe Nature. Single use.",descGen6:"Restores 1/8 max HP at 1/2 max HP or less; confuses if -Spe Nature. Single use."},mentalherb:{descGen4:"Holder is cured if it is infatuated. Single use."},metalcoat:{descGen3:"Holder's Steel-type attacks have 1.1x power. Evolves Onix into Steelix and Scyther into Scizor when traded.",shortDescGen3:"Holder's Steel-type attacks have 1.1x power."},metalpowder:{descGen2:"If held by a Ditto, its Defense and Sp. Def are 1.5x, even while Transformed."},miracleseed:{descGen3:"Holder's Grass-type attacks have 1.1x power."},mirrorherb:{activate:"  [POKEMON] used its Mirror Herb to mirror its opponent's stat changes!"},mysticwater:{descGen3:"Holder's Water-type attacks have 1.1x power."},nevermeltice:{descGen3:"Holder's Ice-type attacks have 1.1x power."},normalgem:{descGen5:"Holder's first successful Normal-type attack will have 1.5x power. Single use."},poisonbarb:{descGen3:"Holder's Poison-type attacks have 1.1x power."},poisongem:{descGen5:"Holder's first successful Poison-type attack will have 1.5x power. Single use."},powerherb:{end:"  [POKEMON] became fully charged due to its Power Herb!"},protectivepads:{block:"  [POKEMON] protected itself with its Protective Pads!"},psychicgem:{descGen5:"Holder's first successful Psychic-type attack will have 1.5x power. Single use."},quickclaw:{descGen2:"Each turn, holder has a ~23.4% chance to move first in its priority bracket.",activate:"  [POKEMON] can act faster than normal, thanks to its Quick Claw!"},redcard:{end:"  [POKEMON] held up its Red Card against [TARGET]!"},rockgem:{descGen5:"Holder's first successful Rock-type attack will have 1.5x power. Single use."},rockyhelmet:{damage:"  [POKEMON] was hurt by the Rocky Helmet!"},safetygoggles:{block:"  [POKEMON] is not affected by [MOVE] thanks to its Safety Goggles!"},seaincense:{descGen3:"Holder's Water-type attacks have 1.05x power."},sharpbeak:{descGen3:"Holder's Flying-type attacks have 1.1x power."},shellbell:{heal:"  [POKEMON] restored a little HP using its Shell Bell!"},silkscarf:{descGen3:"Holder's Normal-type attacks have 1.1x power."},silverpowder:{descGen3:"Holder's Bug-type attacks have 1.1x power."},sitrusberry:{descGen3:"Restores 30 HP when at 1/2 max HP or less. Single use."},softsand:{descGen3:"Holder's Ground-type attacks have 1.1x power."},souldew:{descGen6:"If held by a Latias or a Latios, its Sp. Atk and Sp. Def are 1.5x."},spelltag:{descGen3:"Holder's Ghost-type attacks have 1.1x power."},steelgem:{descGen5:"Holder's first successful Steel-type attack will have 1.5x power. Single use."},stick:{descGen2:"If held by a Farfetch’d, its critical hit ratio is always at stage 2. (25% crit rate)"},thunderstone:{descGen7:"Evolves Pikachu into Raichu or Alolan Raichu, Eevee into Jolteon, and Eelektrik into Eelektross when used."},twistedspoon:{descGen3:"Holder's Psychic-type attacks have 1.1x power."},ultranecroziumz:{transform:"  Bright light is about to burst out of [POKEMON]!",activate:"[POKEMON] regained its true power through Ultra Burst!"},watergem:{descGen5:"Holder's first successful Water-type attack will have 1.5x power. Single use."},whiteherb:{end:"  [POKEMON] returned its stats to normal using its White Herb!"},wikiberry:{descGen7:"Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.",descGen6:"Restores 1/8 max HP at 1/2 max HP or less; confuses if -SpA Nature. Single use."},mysteryberry:{activate:"  [POKEMON] restored PP to its [MOVE] move using Mystery Berry!"},coffeegeistcappuccino:{end:"  [POKEMON] drank its Coffeegeist Cappuccino!"},flatunovan:{end:"  [POKEMON] drank its Flat Unovan!"},mystictamroastdoppio:{end:"  [POKEMON] drank its Mystic Tamroast Doppio!"},pikaspresso:{end:"  [POKEMON] drank its Pikaspresso!"},sandygastmocha:{end:"  [POKEMON] drank its Sandygast Mocha!"},worcanecoldbrew:{end:"  [POKEMON] drank its Worcane Cold Brew!"}};
/**
 * Text parser
 *
 * No dependencies
 * Optional dependency: BattleText
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var







BattleTextParser=function(){










function BattleTextParser(){var perspective=arguments.length>0&&arguments[0]!==undefined?arguments[0]:'p1';this.p1="Player 1";this.p2="Player 2";this.p3="Player 3";this.p4="Player 4";this.perspective=void 0;this.gen=9;this.turn=0;this.curLineSection='break';this.lowercaseRegExp=undefined;this.


























































































































































































































pokemonName=function(pokemon){
if(!pokemon)return'';
if(!pokemon.startsWith('p'))return"???pokemon:"+pokemon+"???";
if(pokemon.charAt(3)===':')return pokemon.slice(4).trim();else
if(pokemon.charAt(2)===':')return pokemon.slice(3).trim();
return"???pokemon:"+pokemon+"???";
};this.perspective=perspective;}BattleTextParser.parseLine=function parseLine(line,noDefault){if(!line.startsWith('|')){return['',line];}if(line==='|'){return['done'];}var index=line.indexOf('|',1);var cmd=line.slice(1,index);switch(cmd){case'chatmsg':case'chatmsg-raw':case'raw':case'error':case'html':case'inactive':case'inactiveoff':case'warning':case'fieldhtml':case'controlshtml':case'bigerror':case'debug':case'tier':case'challstr':case'popup':case'':return[cmd,line.slice(index+1)];case'c':case'chat':case'uhtml':case'uhtmlchange':case'queryresponse':case'showteam':var index2a=line.indexOf('|',index+1);return[cmd,line.slice(index+1,index2a),line.slice(index2a+1)];case'c:':case'pm':var index2b=line.indexOf('|',index+1);var index3b=line.indexOf('|',index2b+1);return[cmd,line.slice(index+1,index2b),line.slice(index2b+1,index3b),line.slice(index3b+1)];}if(noDefault)return null;return line.slice(1).split('|');};BattleTextParser.parseBattleLine=function parseBattleLine(line){var args=this.parseLine(line,true);if(args)return{args:args,kwArgs:{}};args=line.slice(1).split('|');var kwArgs={};while(args.length>1){var lastArg=args[args.length-1];if(lastArg.charAt(0)!=='[')break;var bracketPos=lastArg.indexOf(']');if(bracketPos<=0)break;kwArgs[lastArg.slice(1,bracketPos)]=lastArg.slice(bracketPos+1).trim()||'.';args.pop();}return BattleTextParser.upgradeArgs({args:args,kwArgs:kwArgs});};BattleTextParser.parseNameParts=function parseNameParts(text){var group='';if(!/[A-Za-z0-9]/.test(text.charAt(0))){group=text.charAt(0);text=text.slice(1);}var name=text;var atIndex=text.indexOf('@');var status='';var away=false;if(atIndex>0){name=text.slice(0,atIndex);status=text.slice(atIndex+1);if(status.startsWith('!')){away=true;status=status.slice(1);}}return{group:group,name:name,away:away,status:status};};BattleTextParser.upgradeArgs=function upgradeArgs(_ref){var args=_ref.args,kwArgs=_ref.kwArgs;switch(args[0]){case'-activate':{if(kwArgs.item||kwArgs.move||kwArgs.number||kwArgs.ability)return{args:args,kwArgs:kwArgs};var _args=args,pokemon=_args[1],effect=_args[2],arg3=_args[3],arg4=_args[4];var target=kwArgs.of;var _id=BattleTextParser.effectId(effect);if(kwArgs.block)return{args:['-fail',pokemon],kwArgs:kwArgs};if(_id==='wonderguard')return{args:['-immune',pokemon],kwArgs:{from:'ability:Wonder Guard'}};if(_id==='beatup'&&kwArgs.of)return{args:args,kwArgs:{name:kwArgs.of}};if(['ingrain','quickguard','wideguard','craftyshield','matblock','protect','mist','safeguard','electricterrain','mistyterrain','psychicterrain','telepathy','stickyhold','suctioncups','aromaveil','flowerveil','sweetveil','disguise','safetygoggles','protectivepads'].includes(_id)){if(target){kwArgs.of=pokemon;return{args:['-block',target,effect,arg3],kwArgs:kwArgs};}return{args:['-block',pokemon,effect,arg3],kwArgs:kwArgs};}if(_id==='charge'){return{args:['-singlemove',pokemon,effect],kwArgs:{of:target}};}if(['bind','wrap','clamp','whirlpool','firespin','magmastorm','sandtomb','infestation','snaptrap','thundercage','trapped'].includes(_id)){return{args:['-start',pokemon,effect],kwArgs:{of:target}};}if(_id==='fairylock'){return{args:['-fieldactivate',effect],kwArgs:{}};}if(_id==='symbiosis'||_id==='poltergeist'){kwArgs.item=arg3;}else if(_id==='magnitude'){kwArgs.number=arg3;}else if(_id==='skillswap'||_id==='mummy'||_id==='lingeringaroma'||_id==='wanderingspirit'){kwArgs.ability=arg3;kwArgs.ability2=arg4;}else if(['eeriespell','gmaxdepletion','spite','grudge','forewarn','sketch','leppaberry','mysteryberry'].includes(_id)){kwArgs.move=arg3;kwArgs.number=arg4;}args=['-activate',pokemon,effect,target||''];break;}case'-fail':{if(kwArgs.from==='ability: Flower Veil'){return{args:['-block',kwArgs.of,'ability: Flower Veil'],kwArgs:{of:args[1]}};}break;}case'-start':{if(kwArgs.from==='Protean'||kwArgs.from==='Color Change')kwArgs.from='ability:'+kwArgs.from;break;}case'move':{if(kwArgs.from==='Magic Bounce')kwArgs.from='ability:Magic Bounce';break;}case'cant':{var _args2=args,_pokemon2=_args2[1],_effect2=_args2[2],move=_args2[3];if(['ability: Damp','ability: Dazzling','ability: Queenly Majesty','ability: Armor Tail'].includes(_effect2)){args[0]='-block';return{args:['-block',_pokemon2,_effect2,move,kwArgs.of],kwArgs:{}};}break;}case'-heal':{var _id2=BattleTextParser.effectId(kwArgs.from);if(['dryskin','eartheater','voltabsorb','waterabsorb'].includes(_id2))kwArgs.of='';break;}case'-restoreboost':{args[0]='-clearnegativeboost';break;}case'-nothing':return{args:['-activate','','move:Splash'],kwArgs:kwArgs};}return{args:args,kwArgs:kwArgs};};var _proto=BattleTextParser.prototype;_proto.extractMessage=function extractMessage(buf){var out='';for(var _i2=0,_buf$split2=buf.split('\n');_i2<_buf$split2.length;_i2++){var _line=_buf$split2[_i2];var _BattleTextParser$par=BattleTextParser.parseBattleLine(_line),args=_BattleTextParser$par.args,kwArgs=_BattleTextParser$par.kwArgs;out+=this.parseArgs(args,kwArgs)||'';}return out;};_proto.fixLowercase=function fixLowercase(input){if(this.lowercaseRegExp===undefined){var prefixes=['pokemon','opposingPokemon','team','opposingTeam','party','opposingParty'].map(function(templateId){var template=BattleText["default"][templateId];if(template.charAt(0)===template.charAt(0).toUpperCase())return'';var bracketIndex=template.indexOf('[');if(bracketIndex>=0)return template.slice(0,bracketIndex);return template;}).filter(function(prefix){return prefix;});if(prefixes.length){var buf="((?:^|\n)(?:  |  \\(|\\[)?)("+prefixes.map(BattleTextParser.escapeRegExp).join('|')+")";this.lowercaseRegExp=new RegExp(buf,'g');}else{this.lowercaseRegExp=null;}}if(!this.lowercaseRegExp)return input;return input.replace(this.lowercaseRegExp,function(match,p1,p2){return p1+p2.charAt(0).toUpperCase()+p2.slice(1);});};BattleTextParser.escapeRegExp=function escapeRegExp(input){return input.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&');};_proto.

pokemon=function pokemon(_pokemon){
if(!_pokemon)return'';
var side=_pokemon.slice(0,2);
if(!['p1','p2','p3','p4'].includes(side))return"???pokemon:"+_pokemon+"???";
var name=this.pokemonName(_pokemon);
var isNear=side===this.perspective||side===BattleTextParser.allyID(side);
var template=BattleText["default"][isNear?'pokemon':'opposingPokemon'];
return template.replace('[NICKNAME]',name);
};_proto.

pokemonFull=function pokemonFull(pokemon,details){
var nickname=this.pokemonName(pokemon);

var species=details.split(',')[0];
if(nickname===species)return[pokemon.slice(0,2),"**"+species+"**"];
return[pokemon.slice(0,2),nickname+" (**"+species+"**)"];
};_proto.

trainer=function trainer(side){
side=side.slice(0,2);
if(side==='p1')return this.p1;
if(side==='p2')return this.p2;
if(side==='p3')return this.p3;
if(side==='p4')return this.p4;
return"???side:"+side+"???";
};BattleTextParser.

allyID=function allyID(sideid){
if(sideid==='p1')return'p3';
if(sideid==='p2')return'p4';
if(sideid==='p3')return'p1';
if(sideid==='p4')return'p2';
return'';
};_proto.

team=function team(side){var isFar=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
side=side.slice(0,2);
if(side===this.perspective||side===BattleTextParser.allyID(side)){
return!isFar?BattleText["default"].team:BattleText["default"].opposingTeam;
}
return isFar?BattleText["default"].team:BattleText["default"].opposingTeam;
};_proto.

own=function own(side){
side=side.slice(0,2);
if(side===this.perspective){
return'OWN';
}
return'';
};_proto.

party=function party(side){
side=side.slice(0,2);
if(side===this.perspective||side===BattleTextParser.allyID(side)){
return BattleText["default"].party;
}
return BattleText["default"].opposingParty;
};BattleTextParser.

effectId=function effectId(effect){
if(!effect)return'';
if(effect.startsWith('item:')||effect.startsWith('move:')){
effect=effect.slice(5);
}else if(effect.startsWith('ability:')){
effect=effect.slice(8);
}
return toID(effect);
};_proto.

effect=function effect(_effect){
if(!_effect)return'';
if(_effect.startsWith('item:')||_effect.startsWith('move:')){
_effect=_effect.slice(5);
}else if(_effect.startsWith('ability:')){
_effect=_effect.slice(8);
}
return _effect.trim();
};_proto.

template=function template(type){for(var _len=arguments.length,namespaces=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){namespaces[_key-1]=arguments[_key];}for(var _i4=0;_i4<
namespaces.length;_i4++){var namespace=namespaces[_i4];
if(!namespace)continue;
if(namespace==='OWN'){
return BattleText["default"][type+'Own']+'\n';
}
if(namespace==='NODEFAULT'){
return'';
}
var _id3=BattleTextParser.effectId(namespace);
if(BattleText[_id3]&&type in BattleText[_id3]){
if(BattleText[_id3][type].charAt(1)==='.')type=BattleText[_id3][type].slice(2);
if(BattleText[_id3][type].charAt(0)==='#')_id3=BattleText[_id3][type].slice(1);
if(!BattleText[_id3][type])return'';
return BattleText[_id3][type]+'\n';
}
}
if(!BattleText["default"][type])return'';
return BattleText["default"][type]+'\n';
};_proto.

maybeAbility=function maybeAbility(effect,holder){
if(!effect)return'';
if(!effect.startsWith('ability:'))return'';
return this.ability(effect.slice(8).trim(),holder);
};_proto.

ability=function ability(name,holder){
if(!name)return'';
return BattleText["default"].abilityActivation.replace('[POKEMON]',this.pokemon(holder)).replace('[ABILITY]',this.effect(name))+'\n';
};BattleTextParser.

stat=function stat(_stat){
var entry=BattleText[_stat||"stats"];
if(!entry||!entry.statName)return"???stat:"+_stat+"???";
return entry.statName;
};_proto.

lineSection=function lineSection(args,kwArgs){
var cmd=args[0];
switch(cmd){
case'done':case'turn':
return'break';
case'move':case'cant':case'switch':case'drag':case'upkeep':case'start':
case'-mega':case'-candynamax':case'-terastallize':
return'major';
case'switchout':case'faint':
return'preMajor';
case'-zpower':
return'postMajor';
case'-damage':{
var _id4=BattleTextParser.effectId(kwArgs.from);
if(_id4==='confusion')return'major';
return'postMajor';
}
case'-curestatus':{
var _id5=BattleTextParser.effectId(kwArgs.from);
if(_id5==='naturalcure')return'preMajor';
return'postMajor';
}
case'-start':{
var _id6=BattleTextParser.effectId(kwArgs.from);
if(_id6==='protean')return'preMajor';
return'postMajor';
}
case'-activate':{
var _id7=BattleTextParser.effectId(args[2]);
if(_id7==='confusion'||_id7==='attract')return'preMajor';
return'postMajor';
}
}
return cmd.charAt(0)==='-'?'postMajor':'';
};_proto.

sectionBreak=function sectionBreak(args,kwArgs){
var prevSection=this.curLineSection;
var curSection=this.lineSection(args,kwArgs);
if(!curSection)return false;
this.curLineSection=curSection;
switch(curSection){
case'break':
if(prevSection!=='break')return true;
return false;
case'preMajor':
case'major':
if(prevSection==='postMajor'||prevSection==='major')return true;
return false;
case'postMajor':
return false;
}
};_proto.

parseArgs=function parseArgs(args,kwArgs,noSectionBreak){
var buf=!noSectionBreak&&this.sectionBreak(args,kwArgs)?'\n':'';
return buf+this.fixLowercase(this.parseArgsInner(args,kwArgs)||'');
};_proto.

parseArgsInner=function parseArgsInner(args,kwArgs){
var cmd=args[0];
switch(cmd){
case'player':{
var side=args[1],name=args[2];
if(side==='p1'&&name){
this.p1=name;
}else if(side==='p2'&&name){
this.p2=name;
}else if(side==='p3'&&name){
this.p3=name;
}else if(side==='p4'&&name){
this.p4=name;
}
return'';
}

case'gen':{
var num=args[1];
this.gen=parseInt(num,10);
return'';
}

case'turn':{
var _num=args[1];
this.turn=Number.parseInt(_num,10);
return this.template('turn').replace('[NUMBER]',_num)+'\n';
}

case'start':{
return this.template('startBattle').replace('[TRAINER]',this.p1).replace('[TRAINER]',this.p2);
}

case'win':case'tie':{
var _name=args[1];
if(cmd==='tie'||!_name){
return this.template('tieBattle').replace('[TRAINER]',this.p1).replace('[TRAINER]',this.p2);
}
return this.template('winBattle').replace('[TRAINER]',_name);
}

case'switch':{
var pokemon=args[1],details=args[2];
var _this$pokemonFull=this.pokemonFull(pokemon,details),_side=_this$pokemonFull[0],fullname=_this$pokemonFull[1];
var template=this.template('switchIn',this.own(_side));
return template.replace('[TRAINER]',this.trainer(_side)).replace('[FULLNAME]',fullname);
}

case'drag':{
var _pokemon3=args[1],_details=args[2];
var _this$pokemonFull2=this.pokemonFull(_pokemon3,_details),_side2=_this$pokemonFull2[0],_fullname=_this$pokemonFull2[1];
var _template=this.template('drag');
return _template.replace('[TRAINER]',this.trainer(_side2)).replace('[FULLNAME]',_fullname);
}

case'detailschange':case'-transform':case'-formechange':{
var _pokemon4=args[1],arg2=args[2],arg3=args[3];
var newSpecies='';
switch(cmd){
case'detailschange':newSpecies=arg2.split(',')[0].trim();break;
case'-transform':newSpecies=arg3;break;
case'-formechange':newSpecies=arg2;break;
}
var newSpeciesId=toID(newSpecies);
var _id8='';
var _templateName='transform';
if(cmd!=='-transform'){
switch(newSpeciesId){
case'greninjaash':_id8='battlebond';break;
case'mimikyubusted':_id8='disguise';break;
case'stackemrockless':_id8='rockybody';break;
case'zygardecomplete':_id8='powerconstruct';break;
case'necrozmaultra':_id8='ultranecroziumz';break;
case'darmanitanzen':_id8='zenmode';break;
case'darmanitan':_id8='zenmode';_templateName='transformEnd';break;
case'darmanitangalarzen':_id8='zenmode';break;
case'darmanitangalar':_id8='zenmode';_templateName='transformEnd';break;
case'aegislashblade':_id8='stancechange';break;
case'aegislash':_id8='stancechange';_templateName='transformEnd';break;
case'wishiwashischool':_id8='schooling';break;
case'wishiwashi':_id8='schooling';_templateName='transformEnd';break;


case'miniormeteor':_id8='shieldsdown';break;
case'minior':_id8='shieldsdown';_templateName='transformEnd';break;
case'eiscuenoice':_id8='iceface';break;
case'eiscue':_id8='iceface';_templateName='transformEnd';break;
}
}else if(newSpecies){
_id8='transform';
}
var _template2=this.template(_templateName,_id8,kwArgs.msg?'':'NODEFAULT');
var line1=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon4);
return line1+_template2.replace('[POKEMON]',this.pokemon(_pokemon4)).replace('[SPECIES]',newSpecies);
}

case'switchout':{
var _pokemon5=args[1];
var _side3=_pokemon5.slice(0,2);
var _template3=this.template('switchOut',kwArgs.from,this.own(_side3));
return _template3.replace('[TRAINER]',this.trainer(_side3)).replace('[NICKNAME]',this.pokemonName(_pokemon5)).replace('[POKEMON]',this.pokemon(_pokemon5));
}

case'faint':{
var _pokemon6=args[1];
var _template4=this.template('faint');
return _template4.replace('[POKEMON]',this.pokemon(_pokemon6));
}

case'swap':{
var _pokemon7=args[1],target=args[2];
if(!target||!isNaN(Number(target))){
var _template5=this.template('swapCenter');
return _template5.replace('[POKEMON]',this.pokemon(_pokemon7));
}
var _template6=this.template('swap');
return _template6.replace('[POKEMON]',this.pokemon(_pokemon7)).replace('[TARGET]',this.pokemon(target));
}

case'move':{
var _pokemon8=args[1],move=args[2];
var _line2=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon8);
if(kwArgs.zeffect){
_line2=this.template('zEffect').replace('[POKEMON]',this.pokemon(_pokemon8));
}
var _template7=this.template('move',kwArgs.from);
return _line2+_template7.replace('[POKEMON]',this.pokemon(_pokemon8)).replace('[MOVE]',move);
}

case'cant':{
var _pokemon9=args[1],effect=args[2],_move=args[3];
var _template8=this.template('cant',effect,'NODEFAULT')||
this.template(_move?'cant':'cantNoMove');
var _line3=this.maybeAbility(effect,kwArgs.of||_pokemon9);
return _line3+_template8.replace('[POKEMON]',this.pokemon(_pokemon9)).replace('[MOVE]',_move);
}

case'-candynamax':{
var _side4=args[1];
var own=this.own(_side4);
var _template9='';
if(this.turn===1){
if(own)_template9=this.template('canDynamax',own);
}else{
_template9=this.template('canDynamax',own);
}
return _template9.replace('[TRAINER]',this.trainer(_side4));
}

case'message':{
var message=args[1];
return''+message+'\n';
}

case'-start':{var _kwArgs$from;
var _pokemon10=args[1],_effect3=args[2],_arg=args[3];
var _line4=this.maybeAbility(_effect3,_pokemon10)||this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon10);
var _id9=BattleTextParser.effectId(_effect3);
if(_id9==='typechange'){
var _template10=this.template('typeChange',kwArgs.from);
return _line4+_template10.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[TYPE]',_arg).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(_id9==='typeadd'){
var _template11=this.template('typeAdd',kwArgs.from);
return _line4+_template11.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[TYPE]',_arg);
}
if(_id9.startsWith('stockpile')){
var _num2=_id9.slice(9);
var _template12=this.template('start','stockpile');
return _line4+_template12.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[NUMBER]',_num2);
}
if(_id9.startsWith('perish')){
var _num3=_id9.slice(6);
var _template13=this.template('activate','perishsong');
return _line4+_template13.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[NUMBER]',_num3);
}
if(_id9.startsWith('protosynthesis')||_id9.startsWith('quarkdrive')){
var stat=_id9.slice(-3);
var _template14=this.template('start',_id9.slice(0,_id9.length-3));
return _line4+_template14.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[STAT]',BattleTextParser.stat(stat));
}
var templateId='start';
if(kwArgs.already)templateId='alreadyStarted';
if(kwArgs.fatigue)templateId='startFromFatigue';
if(kwArgs.zeffect)templateId='startFromZEffect';
if(kwArgs.damage)templateId='activate';
if(kwArgs.block)templateId='block';
if(kwArgs.upkeep)templateId='upkeep';
if(_id9==='mist'&&this.gen<=2)templateId='startGen'+this.gen;
if(_id9==='reflect'||_id9==='lightscreen')templateId='startGen1';
if(templateId==='start'&&(_kwArgs$from=kwArgs.from)!=null&&_kwArgs$from.startsWith('item:')){
templateId+='FromItem';
}
var _template15=this.template(templateId,kwArgs.from,_effect3);
return _line4+_template15.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[EFFECT]',this.effect(_effect3)).replace('[MOVE]',_arg).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(kwArgs.from));
}

case'-end':{var _kwArgs$from2;
var _pokemon11=args[1],_effect4=args[2];
var _line5=this.maybeAbility(_effect4,_pokemon11)||this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon11);
var _id10=BattleTextParser.effectId(_effect4);
if(_id10==='doomdesire'||_id10==='futuresight'){
var _template16=this.template('activate',_effect4);
return _line5+_template16.replace('[TARGET]',this.pokemon(_pokemon11));
}
var _templateId='end';
var _template17='';
if((_kwArgs$from2=kwArgs.from)!=null&&_kwArgs$from2.startsWith('item:')){
_template17=this.template('endFromItem',_effect4);
}
if(!_template17)_template17=this.template(_templateId,_effect4);
return _line5+_template17.replace('[POKEMON]',this.pokemon(_pokemon11)).replace('[EFFECT]',this.effect(_effect4)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(kwArgs.from));
}

case'-ability':{
var _pokemon12=args[1],ability=args[2],oldAbility=args[3],arg4=args[4];
var _line6='';
if(oldAbility&&(oldAbility.startsWith('p1')||oldAbility.startsWith('p2')||oldAbility==='boost')){
arg4=oldAbility;
oldAbility='';
}
if(oldAbility)_line6+=this.ability(oldAbility,_pokemon12);
_line6+=this.ability(ability,_pokemon12);
if(kwArgs.fail){
var _template18=this.template('block',kwArgs.from);
return _line6+_template18;
}
if(kwArgs.from){
_line6=this.maybeAbility(kwArgs.from,_pokemon12)+_line6;
var _template19=this.template('changeAbility',kwArgs.from);
return _line6+_template19.replace('[POKEMON]',this.pokemon(_pokemon12)).replace('[ABILITY]',this.effect(ability)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
var _id11=BattleTextParser.effectId(ability);
if(_id11==='unnerve'){
var _template20=this.template('start',ability);
return _line6+_template20.replace('[TEAM]',this.team(_pokemon12.slice(0,2),true));
}
var _templateId2='start';
if(_id11==='anticipation'||_id11==='sturdy')_templateId2='activate';
var _template21=this.template(_templateId2,ability,'NODEFAULT');
return _line6+_template21.replace('[POKEMON]',this.pokemon(_pokemon12));
}

case'-endability':{
var _pokemon13=args[1],_ability=args[2];
if(_ability)return this.ability(_ability,_pokemon13);
var _line7=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon13);
var _template22=this.template('start','Gastro Acid');
return _line7+_template22.replace('[POKEMON]',this.pokemon(_pokemon13));
}

case'-item':{
var _pokemon14=args[1],item=args[2];
var _id12=BattleTextParser.effectId(kwArgs.from);
var _target='';
if(['magician','pickpocket'].includes(_id12)){var _ref2=
[kwArgs.of,''];_target=_ref2[0];kwArgs.of=_ref2[1];
}
var _line8=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon14);
if(['thief','covet','bestow','magician','pickpocket'].includes(_id12)){
var _template23=this.template('takeItem',kwArgs.from);
return _line8+_template23.replace('[POKEMON]',this.pokemon(_pokemon14)).replace('[ITEM]',this.effect(item)).replace('[SOURCE]',this.pokemon(_target||kwArgs.of));
}
if(_id12==='frisk'){
var hasTarget=kwArgs.of&&_pokemon14&&kwArgs.of!==_pokemon14;
var _template24=this.template(hasTarget?'activate':'activateNoTarget',"Frisk");
return _line8+_template24.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(item)).replace('[TARGET]',this.pokemon(_pokemon14));
}
if(kwArgs.from){
var _template25=this.template('addItem',kwArgs.from);
return _line8+_template25.replace('[POKEMON]',this.pokemon(_pokemon14)).replace('[ITEM]',this.effect(item));
}
var _template26=this.template('start',item,'NODEFAULT');
return _line8+_template26.replace('[POKEMON]',this.pokemon(_pokemon14));
}

case'-enditem':{
var _pokemon15=args[1],_item=args[2];
var _line9=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon15);
if(kwArgs.eat){
var _template27=this.template('eatItem',kwArgs.from);
return _line9+_template27.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[ITEM]',this.effect(_item));
}
var _id13=BattleTextParser.effectId(kwArgs.from);
if(_id13==='gem'){
var _template28=this.template('useGem',_item);
return _line9+_template28.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[ITEM]',this.effect(_item)).replace('[MOVE]',kwArgs.move);
}
if(_id13==='stealeat'){
var _template29=this.template('removeItem',"Bug Bite");
return _line9+_template29.replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(_item));
}
if(kwArgs.from){
var _template30=this.template('removeItem',kwArgs.from);
return _line9+_template30.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[ITEM]',this.effect(_item)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(kwArgs.weaken){
var _template31=this.template('activateWeaken');
return _line9+_template31.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[ITEM]',this.effect(_item));
}
var _template32=this.template('end',_item,'NODEFAULT');
if(!_template32)_template32=this.template('activateItem').replace('[ITEM]',this.effect(_item));
return _line9+_template32.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[TARGET]',this.pokemon(kwArgs.of));
}

case'-status':{
var _pokemon16=args[1],status=args[2];
var _line10=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon16);
if(BattleTextParser.effectId(kwArgs.from)==='rest'){
var _template33=this.template('startFromRest',status);
return _line10+_template33.replace('[POKEMON]',this.pokemon(_pokemon16));
}
var _template34=this.template('start',status);
return _line10+_template34.replace('[POKEMON]',this.pokemon(_pokemon16));
}

case'-curestatus':{var _kwArgs$from3;
var _pokemon17=args[1],_status=args[2];
if(BattleTextParser.effectId(kwArgs.from)==='naturalcure'){
var _template35=this.template('activate',kwArgs.from);
return _template35.replace('[POKEMON]',this.pokemon(_pokemon17));
}
var _line11=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon17);
if((_kwArgs$from3=kwArgs.from)!=null&&_kwArgs$from3.startsWith('item:')){
var _template36=this.template('endFromItem',_status);
return _line11+_template36.replace('[POKEMON]',this.pokemon(_pokemon17)).replace('[ITEM]',this.effect(kwArgs.from));
}
if(kwArgs.thaw){
var _template37=this.template('endFromMove',_status);
return _line11+_template37.replace('[POKEMON]',this.pokemon(_pokemon17)).replace('[MOVE]',this.effect(kwArgs.from));
}
var _template38=this.template('end',_status,'NODEFAULT');
if(!_template38)_template38=this.template('end').replace('[EFFECT]',_status);
return _line11+_template38.replace('[POKEMON]',this.pokemon(_pokemon17));
}

case'-cureteam':{
return this.template('activate',kwArgs.from);
}

case'-singleturn':case'-singlemove':{
var _pokemon18=args[1],_effect5=args[2];
var _line12=this.maybeAbility(_effect5,kwArgs.of||_pokemon18)||
this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon18);
var _id14=BattleTextParser.effectId(_effect5);
if(_id14==='instruct'){
var _template39=this.template('activate',_effect5);
return _line12+_template39.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[TARGET]',this.pokemon(_pokemon18));
}
var _template40=this.template('start',_effect5,'NODEFAULT');
if(!_template40)_template40=this.template('start').replace('[EFFECT]',this.effect(_effect5));
return _line12+_template40.replace('[POKEMON]',this.pokemon(_pokemon18)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[TEAM]',this.team(_pokemon18.slice(0,2)));
}

case'-sidestart':{
var _side5=args[1],_effect6=args[2];
var _template41=this.template('start',_effect6,'NODEFAULT');
if(!_template41)_template41=this.template('startTeamEffect').replace('[EFFECT]',this.effect(_effect6));
return _template41.replace('[TEAM]',this.team(_side5)).replace('[PARTY]',this.party(_side5));
}

case'-sideend':{
var _side6=args[1],_effect7=args[2];
var _template42=this.template('end',_effect7,'NODEFAULT');
if(!_template42)_template42=this.template('endTeamEffect').replace('[EFFECT]',this.effect(_effect7));
return _template42.replace('[TEAM]',this.team(_side6)).replace('[PARTY]',this.party(_side6));
}

case'-climateWeather':{
var climateWeather=args[1];
if(!climateWeather||climateWeather==='none'){
var _template43=this.template('end',kwArgs.from,'NODEFAULT');
if(!_template43)return this.template('endFieldEffect').replace('[EFFECT]',this.effect(climateWeather));
return _template43;
}
if(kwArgs.upkeep){
return this.template('upkeep',climateWeather,'NODEFAULT');
}
var _line13=this.maybeAbility(kwArgs.from,kwArgs.of);
var _template44=this.template('start',climateWeather,'NODEFAULT');
if(!_template44)_template44=this.template('startFieldEffect').replace('[EFFECT]',this.effect(climateWeather));
return _line13+_template44;
}

case'-irritantWeather':{
var irritantWeather=args[1];
if(!irritantWeather||irritantWeather==='none'){
var _template45=this.template('end',kwArgs.from,'NODEFAULT');
if(!_template45)return this.template('endFieldEffect').replace('[EFFECT]',this.effect(irritantWeather));
return _template45;
}
if(kwArgs.upkeep){
return this.template('upkeep',irritantWeather,'NODEFAULT');
}
var _line14=this.maybeAbility(kwArgs.from,kwArgs.of);
var _template46=this.template('start',irritantWeather,'NODEFAULT');
if(!_template46)_template46=this.template('startFieldEffect').replace('[EFFECT]',this.effect(irritantWeather));
return _line14+_template46;
}

case'-energyWeather':{
var energyWeather=args[1];
if(!energyWeather||energyWeather==='none'){
var _template47=this.template('end',kwArgs.from,'NODEFAULT');
if(!_template47)return this.template('endFieldEffect').replace('[EFFECT]',this.effect(energyWeather));
return _template47;
}
if(kwArgs.upkeep){
return this.template('upkeep',energyWeather,'NODEFAULT');
}
var _line15=this.maybeAbility(kwArgs.from,kwArgs.of);
var _template48=this.template('start',energyWeather,'NODEFAULT');
if(!_template48)_template48=this.template('startFieldEffect').replace('[EFFECT]',this.effect(energyWeather));
return _line15+_template48;
}

case'-clearingWeather':{
var clearingWeather=args[1];
if(!clearingWeather||clearingWeather==='none'){
var _template49=this.template('end',kwArgs.from,'NODEFAULT');
if(!_template49)return this.template('endFieldEffect').replace('[EFFECT]',this.effect(clearingWeather));
return _template49;
}
if(kwArgs.upkeep){
return this.template('upkeep',clearingWeather,'NODEFAULT');
}
var _line16=this.maybeAbility(kwArgs.from,kwArgs.of);
var _template50=this.template('start',clearingWeather,'NODEFAULT');
if(!_template50)_template50=this.template('startFieldEffect').replace('[EFFECT]',this.effect(clearingWeather));
return _line16+_template50;
}

case'-fieldstart':case'-fieldactivate':{
var _effect8=args[1];
var _line17=this.maybeAbility(kwArgs.from,kwArgs.of);
if(BattleTextParser.effectId(kwArgs.from)==='hadronengine'){
return _line17+this.template('start','hadronengine').replace('[POKEMON]',this.pokemon(kwArgs.of));
}
var _templateId3=cmd.slice(6);
if(BattleTextParser.effectId(_effect8)==='perishsong')_templateId3='start';
var _template51=this.template(_templateId3,_effect8,'NODEFAULT');
if(!_template51)_template51=this.template('startFieldEffect').replace('[EFFECT]',this.effect(_effect8));
return _line17+_template51.replace('[POKEMON]',this.pokemon(kwArgs.of));
}

case'-fieldend':{
var _effect9=args[1];
var _template52=this.template('end',_effect9,'NODEFAULT');
if(!_template52)_template52=this.template('endFieldEffect').replace('[EFFECT]',this.effect(_effect9));
return _template52;
}

case'-sethp':{
var _effect10=kwArgs.from;
return this.template('activate',_effect10);
}

case'-message':{
var _message=args[1];
return'  '+_message+'\n';
}

case'-hint':{
var _message2=args[1];
return'  ('+_message2+')\n';
}

case'-activate':{
var _pokemon19=args[1],_effect11=args[2],_target2=args[3];
var _id15=BattleTextParser.effectId(_effect11);
if(_id15==='celebrate'){
return this.template('activate','celebrate').replace('[TRAINER]',this.trainer(_pokemon19.slice(0,2)));
}
if(!_target2&&
['hyperdrill','hyperspacefury','hyperspacehole','phantomforce','shadowforce','feint'].includes(_id15)){var _ref3=
[kwArgs.of,_pokemon19];_pokemon19=_ref3[0];_target2=_ref3[1];
if(!_pokemon19)_pokemon19=_target2;
}
if(!_target2)_target2=kwArgs.of||_pokemon19;

var _line18=this.maybeAbility(_effect11,_pokemon19);

if(_id15==='lockon'||_id15==='mindreader'){
var _template53=this.template('start',_effect11);
return _line18+_template53.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[SOURCE]',this.pokemon(_pokemon19));
}

if((_id15==='mummy'||_id15==='lingeringaroma')&&kwArgs.ability){
_line18+=this.ability(kwArgs.ability,_target2);
_line18+=this.ability(_id15==='mummy'?'Mummy':'Lingering Aroma',_target2);
var _template54=this.template('changeAbility',_id15);
return _line18+_template54.replace('[TARGET]',this.pokemon(_target2));
}

if(_id15==='commander'){


if(_target2===_pokemon19)return _line18;
var _template55=this.template('activate',_id15);
return _line18+_template55.replace('[POKEMON]',this.pokemon(_pokemon19)).replace(/\[TARGET\]/g,this.pokemon(_target2));
}

var _templateId4='activate';
if(_id15==='forewarn'&&_pokemon19===_target2){
_templateId4='activateNoTarget';
}
if((_id15==='protosynthesis'||_id15==='quarkdrive')&&kwArgs.fromitem){
_templateId4='activateFromItem';
}
if(_id15==='orichalcumpulse'&&kwArgs.source){
_templateId4='start';
}
var _template56=this.template(_templateId4,_effect11,'NODEFAULT');
if(!_template56){
if(_line18)return _line18;
_template56=this.template('activate');
return _line18+_template56.replace('[EFFECT]',this.effect(_effect11));
}

if(_id15==='brickbreak'){
_template56=_template56.replace('[TEAM]',this.team(_target2.slice(0,2)));
}
if(kwArgs.ability){
_line18+=this.ability(kwArgs.ability,_pokemon19);
}
if(kwArgs.ability2){
_line18+=this.ability(kwArgs.ability2,_target2);
}
if(kwArgs.move||kwArgs.number||kwArgs.item||kwArgs.name){
_template56=_template56.replace('[MOVE]',kwArgs.move).replace('[NUMBER]',kwArgs.number).replace('[ITEM]',kwArgs.item).replace('[NAME]',kwArgs.name);
}
return _line18+_template56.replace('[POKEMON]',this.pokemon(_pokemon19)).replace('[TARGET]',this.pokemon(_target2)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}

case'-prepare':{
var _pokemon20=args[1],_effect12=args[2],_target3=args[3];
var _template57=this.template('prepare',_effect12);
return _template57.replace('[POKEMON]',this.pokemon(_pokemon20)).replace('[TARGET]',this.pokemon(_target3));
}

case'-damage':{
var _pokemon21=args[1],percentage=args[3];
var _template58=this.template('damage',kwArgs.from,'NODEFAULT');
var _line19=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon21);
var _id16=BattleTextParser.effectId(kwArgs.from);
if(_template58){
return _line19+_template58.replace('[POKEMON]',this.pokemon(_pokemon21));
}

if(!kwArgs.from){
_template58=this.template(percentage?'damagePercentage':'damage');
return _line19+_template58.replace('[POKEMON]',this.pokemon(_pokemon21)).replace('[PERCENTAGE]',percentage);
}
if(kwArgs.from.startsWith('item:')){
_template58=this.template(kwArgs.of?'damageFromPokemon':'damageFromItem');
return _line19+_template58.replace('[POKEMON]',this.pokemon(_pokemon21)).replace('[ITEM]',this.effect(kwArgs.from)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(kwArgs.partiallytrapped||_id16==='bind'||_id16==='wrap'){
_template58=this.template('damageFromPartialTrapping');
return _line19+_template58.replace('[POKEMON]',this.pokemon(_pokemon21)).replace('[MOVE]',this.effect(kwArgs.from));
}

_template58=this.template('damage');
return _line19+_template58.replace('[POKEMON]',this.pokemon(_pokemon21));
}

case'-heal':{
var _pokemon22=args[1];
var _template59=this.template('heal',kwArgs.from,'NODEFAULT');
var _line20=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon22);
if(_template59){
return _line20+_template59.replace('[POKEMON]',this.pokemon(_pokemon22)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[NICKNAME]',kwArgs.wisher);
}

if(kwArgs.from&&!kwArgs.from.startsWith('ability:')){
_template59=this.template('healFromEffect');
return _line20+_template59.replace('[POKEMON]',this.pokemon(_pokemon22)).replace('[EFFECT]',this.effect(kwArgs.from));
}

_template59=this.template('heal');
return _line20+_template59.replace('[POKEMON]',this.pokemon(_pokemon22));
}

case'-boost':case'-unboost':{var _kwArgs$from4;
var _pokemon23=args[1],_stat2=args[2],_num4=args[3];
if(_stat2==='spa'&&this.gen===1)_stat2='spc';
var amount=parseInt(_num4,10);
var _line21=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon23);
var _templateId5=cmd.slice(1);
if(amount>=3)_templateId5+='3';else
if(amount>=2)_templateId5+='2';else
if(amount===0)_templateId5+='0';
if(amount&&kwArgs.zeffect){
_templateId5+=kwArgs.multiple?'MultipleFromZEffect':'FromZEffect';
}else if(amount&&(_kwArgs$from4=kwArgs.from)!=null&&_kwArgs$from4.startsWith('item:')){
var _template60=this.template(_templateId5+'FromItem',kwArgs.from);
return _line21+_template60.replace('[POKEMON]',this.pokemon(_pokemon23)).replace('[STAT]',BattleTextParser.stat(_stat2)).replace('[ITEM]',this.effect(kwArgs.from));
}
var _template61=this.template(_templateId5,kwArgs.from);
return _line21+_template61.replace(/\[POKEMON\]/g,this.pokemon(_pokemon23)).replace('[STAT]',BattleTextParser.stat(_stat2));
}

case'-setboost':{
var _pokemon24=args[1];
var _effect13=kwArgs.from;
var _line22=this.maybeAbility(_effect13,kwArgs.of||_pokemon24);
var _template62=this.template('boost',_effect13);
return _line22+_template62.replace('[POKEMON]',this.pokemon(_pokemon24));
}

case'-swapboost':{
var _pokemon25=args[1],_target4=args[2];
var _line23=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon25);
var _id17=BattleTextParser.effectId(kwArgs.from);
var _templateId6='swapBoost';
if(_id17==='guardswap')_templateId6='swapDefensiveBoost';
if(_id17==='powerswap')_templateId6='swapOffensiveBoost';
var _template63=this.template(_templateId6,kwArgs.from);
return _line23+_template63.replace('[POKEMON]',this.pokemon(_pokemon25)).replace('[TARGET]',this.pokemon(_target4));
}

case'-copyboost':{
var _pokemon26=args[1],_target5=args[2];
var _line24=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon26);
var _template64=this.template('copyBoost',kwArgs.from);
return _line24+_template64.replace('[POKEMON]',this.pokemon(_pokemon26)).replace('[TARGET]',this.pokemon(_target5));
}

case'-clearboost':case'-clearpositiveboost':case'-clearnegativeboost':{
var _pokemon27=args[1],source=args[2];
var _line25=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon27);
var _templateId7='clearBoost';
if(kwArgs.zeffect)_templateId7='clearBoostFromZEffect';
var _template65=this.template(_templateId7,kwArgs.from);
return _line25+_template65.replace('[POKEMON]',this.pokemon(_pokemon27)).replace('[SOURCE]',this.pokemon(source));
}

case'-invertboost':{
var _pokemon28=args[1];
var _line26=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon28);
var _template66=this.template('invertBoost',kwArgs.from);
return _line26+_template66.replace('[POKEMON]',this.pokemon(_pokemon28));
}

case'-clearallboost':{
return this.template('clearAllBoost',kwArgs.from);
}

case'-crit':case'-supereffective':case'-resisted':{
var _pokemon29=args[1];
var _templateId8=cmd.slice(1);
if(_templateId8==='supereffective')_templateId8='superEffective';
if(kwArgs.spread)_templateId8+='Spread';
var _template67=this.template(_templateId8);
return _template67.replace('[POKEMON]',this.pokemon(_pokemon29));
}

case'-block':{
var _pokemon30=args[1],_effect14=args[2],_move2=args[3],attacker=args[4];
var _line27=this.maybeAbility(_effect14,kwArgs.of||_pokemon30);
var _id18=BattleTextParser.effectId(_effect14);
var _templateId9='block';
if(_id18==='mist'&&this.gen<=2)_templateId9='blockGen'+this.gen;
var _template68=this.template(_templateId9,_effect14);
return _line27+_template68.replace('[POKEMON]',this.pokemon(_pokemon30)).replace('[SOURCE]',this.pokemon(attacker||kwArgs.of)).replace('[MOVE]',_move2);
}

case'-fail':{
var _pokemon31=args[1],_effect15=args[2],_stat3=args[3];
var _id19=BattleTextParser.effectId(_effect15);
var blocker=BattleTextParser.effectId(kwArgs.from);
var _line28=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon31);
var _templateId10='block';
if(['desolateland','primordialsea'].includes(blocker)&&
!['sunnyday','raindance','hail','snowscape','chillyreception',
'bloodmoon','foghorn'].includes(_id19)){
_templateId10='blockMove';
}else if(blocker==='uproar'&&kwArgs.msg){
_templateId10='blockSelf';
}
var _template69=this.template(_templateId10,kwArgs.from);
if(_template69){
return _line28+_template69.replace('[POKEMON]',this.pokemon(_pokemon31));
}

if(_id19==='unboost'){
_template69=this.template(_stat3?'failSingular':'fail','unboost');
return _line28+_template69.replace('[POKEMON]',this.pokemon(_pokemon31)).replace('[STAT]',_stat3);
}

_templateId10='fail';
if(['brn','frz','par','psn','slp','frb','substitute','shedtail'].includes(_id19)){
_templateId10='alreadyStarted';
}
if(kwArgs.heavy)_templateId10='failTooHeavy';
if(kwArgs.weak)_templateId10='fail';
if(kwArgs.forme)_templateId10='failWrongForme';
_template69=this.template(_templateId10,_id19);
return _line28+_template69.replace('[POKEMON]',this.pokemon(_pokemon31));
}

case'-immune':{
var _pokemon32=args[1];
var _line29=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon32);
var _template70=this.template('block',kwArgs.from);
if(!_template70){
var _templateId11=kwArgs.ohko?'immuneOHKO':'immune';
_template70=this.template(_pokemon32?_templateId11:'immuneNoPokemon',kwArgs.from);
}
return _line29+_template70.replace('[POKEMON]',this.pokemon(_pokemon32));
}

case'-miss':{
var _source=args[1],_pokemon33=args[2];
var _line30=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon33);
if(!_pokemon33){
var _template71=this.template('missNoPokemon');
return _line30+_template71.replace('[SOURCE]',this.pokemon(_source));
}
var _template72=this.template('miss');
return _line30+_template72.replace('[POKEMON]',this.pokemon(_pokemon33));
}

case'-center':case'-ohko':case'-combine':{
return this.template(cmd.slice(1));
}

case'-notarget':{
return this.template('noTarget');
}

case'-mega':case'-primal':{
var _pokemon34=args[1],species=args[2],_item2=args[3];
var _id20='';
var _templateId12=cmd.slice(1);
if(species==='Rayquaza'){
_id20='dragonascent';
_templateId12='megaNoItem';
}
if(!_id20&&cmd==='-mega'&&this.gen<7)_templateId12='megaGen6';
if(!_item2&&cmd==='-mega')_templateId12='megaNoItem';
var _template73=this.template(_templateId12,_id20);
var _side7=_pokemon34.slice(0,2);
var pokemonName=this.pokemon(_pokemon34);
if(cmd==='-mega'){
var template2=this.template('transformMega');
_template73+=template2.replace('[POKEMON]',pokemonName).replace('[SPECIES]',species);
}
return _template73.replace('[POKEMON]',pokemonName).replace('[ITEM]',_item2).replace('[TRAINER]',this.trainer(_side7));
}

case'-terastallize':{
var _pokemon35=args[1],type=args[2];
var _id21='';
var _templateId13=cmd.slice(1);
var _template74=this.template(_templateId13,_id21);
var _pokemonName=this.pokemon(_pokemon35);
return _template74.replace('[POKEMON]',_pokemonName).replace('[TYPE]',type);
}

case'-zpower':{
var _pokemon36=args[1];
var _template75=this.template('zPower');
return _template75.replace('[POKEMON]',this.pokemon(_pokemon36));
}

case'-burst':{
var _pokemon37=args[1];
var _template76=this.template('activate',"Ultranecrozium Z");
return _template76.replace('[POKEMON]',this.pokemon(_pokemon37));
}

case'-zbroken':{
var _pokemon38=args[1];
var _template77=this.template('zBroken');
return _template77.replace('[POKEMON]',this.pokemon(_pokemon38));
}

case'-hitcount':{
var _num5=args[2];
if(_num5==='1'){
return this.template('hitCountSingular');
}
return this.template('hitCount').replace('[NUMBER]',_num5);
}

case'-waiting':{
var _pokemon39=args[1],_target6=args[2];
var _template78=this.template('activate',"Water Pledge");
return _template78.replace('[POKEMON]',this.pokemon(_pokemon39)).replace('[TARGET]',this.pokemon(_target6));
}

case'-anim':{
return'';
}

default:{
return null;
}
}
};return BattleTextParser;}();


if(typeof require==='function'){

global.BattleTextParser=BattleTextParser;
}

//# sourceMappingURL=battledata.js.map