function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Team Selector Panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

PSTeambuilder=function(){function PSTeambuilder(){}PSTeambuilder.
packTeam=function packTeam(team){
var buf='';
if(!team)return'';for(var _i2=0;_i2<

team.length;_i2++){var set=team[_i2];
var hasHP='';
if(buf)buf+=']';


buf+=set.name||set.species;


var _id=toID(set.species);
buf+='|'+(toID(set.name||set.species)===_id?'':_id);


buf+='|'+toID(set.item);


_id=toID(set.ability);
buf+='|'+(_id||'-');


buf+='|';
if(set.moves){
for(var j=0;j<set.moves.length;j++){
var moveid=toID(set.moves[j]);
if(j&&!moveid)continue;
buf+=(j?',':'')+moveid;
if(moveid.substr(0,11)==='hiddenpower'&&moveid.length>11){
hasHP=moveid.slice(11);
}
}
}


buf+='|'+(set.nature||'');


if(set.evs){
buf+='|'+(set.evs['hp']||'')+','+(
set.evs['atk']||'')+','+(
set.evs['def']||'')+','+(
set.evs['spa']||'')+','+(
set.evs['spd']||'')+','+(
set.evs['spe']||'');
}else{
buf+='|';
}


if(set.gender){
buf+='|'+set.gender;
}else{
buf+='|';
}


if(set.ivs){
buf+='|'+(set.ivs['hp']===31?'':set.ivs['hp'])+','+(
set.ivs['atk']===31?'':set.ivs['atk'])+','+(
set.ivs['def']===31?'':set.ivs['def'])+','+(
set.ivs['spa']===31?'':set.ivs['spa'])+','+(
set.ivs['spd']===31?'':set.ivs['spd'])+','+(
set.ivs['spe']===31?'':set.ivs['spe']);
}else{
buf+='|';
}


if(set.shiny){
buf+='|S';
}else{
buf+='|';
}


if(set.level){
buf+='|'+set.level;
}else{
buf+='|';
}


if(set.happiness!==undefined){
buf+='|'+set.happiness;
}else{
buf+='|';
}

if(
set.pokeball||set.hpType&&toID(set.hpType)!==hasHP||set.gigantamax||
set.dynamaxLevel!==undefined&&set.dynamaxLevel!==10)
{
buf+=','+(set.hpType||'');
buf+=','+toID(set.pokeball);
buf+=','+(set.gigantamax?'G':'');
buf+=','+(set.dynamaxLevel!==undefined&&set.dynamaxLevel!==10?set.dynamaxLevel:'');
}
}

return buf;
};PSTeambuilder.

unpackTeam=function unpackTeam(buf){
if(!buf)return[];

var team=[];for(var _i4=0,_buf$split2=

buf.split("]");_i4<_buf$split2.length;_i4++){var setBuf=_buf$split2[_i4];
var parts=setBuf.split("|");
if(parts.length<11)continue;
var set={species:'',moves:[]};
team.push(set);


set.name=parts[0];


set.species=Dex.species.get(parts[1]).name||set.name;


set.item=Dex.items.get(parts[2]).name;


var species=Dex.species.get(set.species);
set.ability=parts[3]==='-'?
'':
species.baseSpecies==='Zygarde'&&parts[3]==='H'?
'Power Construct':
['','0','1','H','S'].includes(parts[3])?
species.abilities[parts[3]||'0']||(parts[3]===''?'':'!!!ERROR!!!'):
Dex.abilities.get(parts[3]).name;


set.moves=parts[4].split(',').map(function(moveid){return(
Dex.moves.get(moveid).name);}
);


set.nature=parts[5];
if(set.nature==='undefined')set.nature=undefined;


if(parts[6]){
if(parts[6].length>5){
var evs=parts[6].split(',');
set.evs={
hp:Number(evs[0])||0,
atk:Number(evs[1])||0,
def:Number(evs[2])||0,
spa:Number(evs[3])||0,
spd:Number(evs[4])||0,
spe:Number(evs[5])||0
};
}else if(parts[6]==='0'){
set.evs={hp:0,atk:0,def:0,spa:0,spd:0,spe:0};
}
}


if(parts[7])set.gender=parts[7];


if(parts[8]){
var ivs=parts[8].split(',');
set.ivs={
hp:ivs[0]===''?31:Number(ivs[0]),
atk:ivs[1]===''?31:Number(ivs[1]),
def:ivs[2]===''?31:Number(ivs[2]),
spa:ivs[3]===''?31:Number(ivs[3]),
spd:ivs[4]===''?31:Number(ivs[4]),
spe:ivs[5]===''?31:Number(ivs[5])
};
}


if(parts[9])set.shiny=true;


if(parts[10])set.level=parseInt(parts[9],10);


if(parts[11]){
var misc=parts[11].split(',',4);
set.happiness=misc[0]?Number(misc[0]):undefined;
set.hpType=misc[1];
set.pokeball=misc[2];
set.gigantamax=!!misc[3];
set.dynamaxLevel=misc[4]?Number(misc[4]):10;
}
}

return team;
};PSTeambuilder.




exportSet=function exportSet(set){
var text='';


if(set.name&&set.name!==set.species){
text+=set.name+" ("+set.species+")";
}else{
text+=""+set.species;
}
if(set.gender==='M')text+=" (M)";
if(set.gender==='F')text+=" (F)";
if(set.item){
text+=" @ "+set.item;
}
text+="  \n";
if(set.ability){
text+="Ability: "+set.ability+"  \n";
}
if(set.moves){for(var _i6=0,_set$moves2=
set.moves;_i6<_set$moves2.length;_i6++){var move=_set$moves2[_i6];
if(move.substr(0,13)==='Hidden Power '){
var hpType=move.slice(13);
move=move.slice(0,13);
move=move+"["+hpType+"]";
}
if(move){
text+="- "+move+"  \n";
}
}
}


var first=true;
if(set.evs){for(var _i8=0,_Dex$statNames2=
Dex.statNames;_i8<_Dex$statNames2.length;_i8++){var stat=_Dex$statNames2[_i8];
if(!set.evs[stat])continue;
if(first){
text+="EVs: ";
first=false;
}else{
text+=" / ";
}
text+=set.evs[stat]+" "+BattleStatNames[stat];
}
}
if(!first){
text+="  \n";
}
if(set.nature){
text+=set.nature+" Nature  \n";
}
first=true;
if(set.ivs){for(var _i10=0,_Dex$statNames4=
Dex.statNames;_i10<_Dex$statNames4.length;_i10++){var _stat=_Dex$statNames4[_i10];
if(set.ivs[_stat]===undefined||isNaN(set.ivs[_stat])||set.ivs[_stat]===31)continue;
if(first){
text+="IVs: ";
first=false;
}else{
text+=" / ";
}
text+=set.ivs[_stat]+" "+BattleStatNames[_stat];
}
}
if(!first){
text+="  \n";
}


if(set.level&&set.level!==100){
text+="Level: "+set.level+"  \n";
}
if(set.shiny){
text+="Shiny: Yes  \n";
}
if(typeof set.happiness==='number'&&set.happiness!==255&&!isNaN(set.happiness)){
text+="Happiness: "+set.happiness+"  \n";
}
if(typeof set.dynamaxLevel==='number'&&set.dynamaxLevel!==255&&!isNaN(set.dynamaxLevel)){
text+="Dynamax Level: "+set.dynamaxLevel+"  \n";
}
if(set.gigantamax){
text+="Gigantamax: Yes  \n";
}

text+="\n";
return text;
};PSTeambuilder.
exportTeam=function exportTeam(sets){
var text='';for(var _i12=0;_i12<
sets.length;_i12++){var set=sets[_i12];

text+=PSTeambuilder.exportSet(set);
}
return text;
};PSTeambuilder.
splitPrefix=function splitPrefix(buffer,delimiter){var prefixOffset=arguments.length>2&&arguments[2]!==undefined?arguments[2]:0;
var delimIndex=buffer.indexOf(delimiter);
if(delimIndex<0)return['',buffer];
return[buffer.slice(prefixOffset,delimIndex),buffer.slice(delimIndex+delimiter.length)];
};PSTeambuilder.
splitLast=function splitLast(buffer,delimiter){
var delimIndex=buffer.lastIndexOf(delimiter);
if(delimIndex<0)return[buffer,''];
return[buffer.slice(0,delimIndex),buffer.slice(delimIndex+delimiter.length)];
};PSTeambuilder.
parseExportedTeamLine=function parseExportedTeamLine(line,isFirstLine,set){
if(isFirstLine){
var item;var _line$split=
line.split(' @ ');line=_line$split[0];item=_line$split[1];
if(item){
set.item=item;
if(toID(set.item)==='noitem')set.item='';
}
if(line.endsWith(' (M)')){
set.gender='M';
line=line.slice(0,-4);
}
if(line.endsWith(' (F)')){
set.gender='F';
line=line.slice(0,-4);
}
var parenIndex=line.lastIndexOf(' (');
if(line.charAt(line.length-1)===')'&&parenIndex!==-1){
set.species=Dex.species.get(line.slice(parenIndex+2,-1)).name;
set.name=line.slice(0,parenIndex);
}else{
set.species=Dex.species.get(line).name;
set.name='';
}
}else if(line.startsWith('Trait: ')){
line=line.slice(7);
set.ability=line;
}else if(line.startsWith('Ability: ')){
line=line.slice(9);
set.ability=line;
}else if(line==='Shiny: Yes'){
set.shiny=true;
}else if(line.startsWith('Level: ')){
line=line.slice(7);
set.level=+line;
}else if(line.startsWith('Happiness: ')){
line=line.slice(11);
set.happiness=+line;
}else if(line.startsWith('Pokeball: ')){
line=line.slice(10);
set.pokeball=line;
}else if(line.startsWith('Hidden Power: ')){
line=line.slice(14);
set.hpType=line;
}else if(line.startsWith('Dynamax Level: ')){
line=line.substr(15);
set.dynamaxLevel=+line;
}else if(line==='Gigantamax: Yes'){
set.gigantamax=true;
}else if(line.startsWith('EVs: ')){
line=line.slice(5);
var evLines=line.split('/');
set.evs={hp:0,atk:0,def:0,spa:0,spd:0,spe:0};for(var _i14=0;_i14<
evLines.length;_i14++){var evLine=evLines[_i14];
evLine=evLine.trim();
var spaceIndex=evLine.indexOf(' ');
if(spaceIndex===-1)continue;
var statid=BattleStatIDs[evLine.slice(spaceIndex+1)];
if(!statid)continue;
var statval=parseInt(evLine.slice(0,spaceIndex),10);
set.evs[statid]=statval;
}
}else if(line.startsWith('IVs: ')){
line=line.slice(5);
var ivLines=line.split(' / ');
set.ivs={hp:31,atk:31,def:31,spa:31,spd:31,spe:31};for(var _i16=0;_i16<
ivLines.length;_i16++){var ivLine=ivLines[_i16];
ivLine=ivLine.trim();
var _spaceIndex=ivLine.indexOf(' ');
if(_spaceIndex===-1)continue;
var _statid=BattleStatIDs[ivLine.slice(_spaceIndex+1)];
if(!_statid)continue;
var _statval=parseInt(ivLine.slice(0,_spaceIndex),10);
if(isNaN(_statval))_statval=31;
set.ivs[_statid]=_statval;
}
}else if(line.match(/^[A-Za-z]+ (N|n)ature/)){
var natureIndex=line.indexOf(' Nature');
if(natureIndex===-1)natureIndex=line.indexOf(' nature');
if(natureIndex===-1)return;
line=line.substr(0,natureIndex);
if(line!=='undefined')set.nature=line;
}else if(line.charAt(0)==='-'||line.charAt(0)==='~'){
line=line.slice(line.charAt(1)===' '?2:1);
if(line.startsWith('Hidden Power [')){
var hpType=line.slice(14,-1);
line='Hidden Power '+hpType;
if(!set.ivs&&Dex.types.isName(hpType)){
set.ivs={hp:31,atk:31,def:31,spa:31,spd:31,spe:31};
var hpIVs=Dex.types.get(hpType).HPivs||{};
for(var stat in hpIVs){
set.ivs[stat]=hpIVs[stat];
}
}
}
if(line==='Frustration'&&set.happiness===undefined){
set.happiness=0;
}
set.moves.push(line);
}
};PSTeambuilder.
importTeam=function importTeam(buffer){
var lines=buffer.split("\n");

var sets=[];
var curSet=null;

while(lines.length&&!lines[0])lines.shift();
while(lines.length&&!lines[lines.length-1])lines.pop();

if(lines.length===1&&lines[0].includes('|')){
return this.unpackTeam(lines[0]);
}for(var _i18=0;_i18<
lines.length;_i18++){var line=lines[_i18];
line=line.trim();
if(line===''||line==='---'){
curSet=null;
}else if(line.startsWith('===')){

}else if(line.includes('|')){

var team=PS.teams.unpackLine(line);
if(!team)continue;
return this.unpackTeam(team.packedTeam);
}else if(!curSet){
curSet={
name:'',species:'',gender:'',
moves:[]
};
sets.push(curSet);
this.parseExportedTeamLine(line,true,curSet);
}else{
this.parseExportedTeamLine(line,false,curSet);
}
}
return sets;
};PSTeambuilder.
importTeamBackup=function importTeamBackup(buffer){
var teams=[];
var lines=buffer.split("\n");

var curTeam=null;
var sets=null;

var curSet=null;

while(lines.length&&!lines[0])lines.shift();
while(lines.length&&!lines[lines.length-1])lines.pop();for(var _i20=0;_i20<

lines.length;_i20++){var line=lines[_i20];
line=line.trim();
if(line===''||line==='---'){
curSet=null;
}else if(line.startsWith('===')){
if(curTeam){

curTeam.packedTeam=this.packTeam(sets);
teams.push(curTeam);
}

curTeam={
name:'',
format:'',
packedTeam:'',
folder:'',
key:'',
iconCache:''
};
sets=[];

line=line.slice(3,-3).trim();var _ref=
this.splitPrefix(line,']',1);curTeam.format=_ref[0];line=_ref[1];
if(!curTeam.format)curTeam.format='gen8';else
if(!curTeam.format.startsWith('gen'))curTeam.format="gen6"+curTeam.format;var _this$splitPrefix=

this.splitPrefix(line,'/');curTeam.folder=_this$splitPrefix[0];curTeam.name=_this$splitPrefix[1];
}else if(line.includes('|')){
if(curTeam){

curTeam.packedTeam=this.packTeam(sets);
teams.push(curTeam);
}
curTeam=null;
curSet=null;
var team=PS.teams.unpackLine(line);
if(team)teams.push(team);
}else if(!curSet){
if(!sets)continue;
curSet={
name:'',species:'',gender:'',
moves:[]
};
sets.push(curSet);
this.parseExportedTeamLine(line,true,curSet);
}else{
this.parseExportedTeamLine(line,false,curSet);
}
}
if(curTeam){
curTeam.packedTeam=this.packTeam(sets);
teams.push(curTeam);
}
return teams;
};PSTeambuilder.

packedTeamNames=function packedTeamNames(buf){
if(!buf)return[];

var team=[];
var i=0;

while(true){
var name=buf.slice(i,buf.indexOf('|',i));
i=buf.indexOf('|',i)+1;

team.push(buf.slice(i,buf.indexOf('|',i))||name);

for(var k=0;k<9;k++){
i=buf.indexOf('|',i)+1;
}

i=buf.indexOf(']',i)+1;

if(i<1)break;
}

return team;
};return PSTeambuilder;}();


function TeamFolder(props){


if(props.cur){
return preact.h("div",{"class":"folder cur"},preact.h("div",{"class":"folderhack3"},
preact.h("div",{"class":"folderhack1"}),preact.h("div",{"class":"folderhack2"}),
preact.h("div",{"class":"selectFolder","data-value":props.value},props.children)
));
}
return preact.h("div",{"class":"folder"},
preact.h("div",{"class":"selectFolder","data-value":props.value},props.children)
);
}

function TeamBox(props){
var team=props.team;
var contents;
if(team){
var icons=team.iconCache;
if(!icons){
if(!team.packedTeam){
icons=preact.h("em",null,"(empty team)");
}else{
icons=PSTeambuilder.packedTeamNames(team.packedTeam).map(function(species){return(
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(species)}));}
);
}
team.iconCache=icons;
}
var format=team.format;
if(format.startsWith('gen8'))format=format.slice(4);
format=(format?"["+format+"] ":"")+(team.folder?team.folder+"/":"");
contents=[
preact.h("strong",null,format&&preact.h("span",null,format),team.name),
preact.h("small",null,icons)];

}else{
contents=[
preact.h("em",null,"Select a team")];

}
if(props.button){
return preact.h("button",{"class":"team",value:team?team.key:''},
contents
);
}
return preact.h("div",{"data-href":props.noLink?'':"/team-"+(team?team.key:''),"class":"team",draggable:true},
contents
);
}var





TeamDropdownPanel=function(_PSRoomPanel){_inheritsLoose(TeamDropdownPanel,_PSRoomPanel);function TeamDropdownPanel(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this.
gen='';_this.
format=null;_this.








setFormat=function(e){
var target=e.currentTarget;
_this.format=target.name==='format'&&target.value||'';
_this.gen=target.name==='gen'&&target.value||'';
_this.forceUpdate();
};_this.
click=function(e){
var curTarget=e.target;
var target;
while(curTarget&&curTarget!==e.currentTarget){
if(curTarget.tagName==='BUTTON'){
target=curTarget;
}
curTarget=curTarget.parentElement;
}
if(!target)return;

_this.chooseParentValue(target.value);
};return _this;}var _proto=TeamDropdownPanel.prototype;_proto.getTeams=function getTeams(){var _this2=this;if(!this.format&&!this.gen)return PS.teams.list;return PS.teams.list.filter(function(team){if(_this2.gen&&!team.format.startsWith(_this2.gen))return false;if(_this2.format&&team.format!==_this2.format)return false;return true;});};_proto.
render=function render(){var _this3=this;
var room=this.props.room;
if(!room.parentElem){
return preact.h(PSPanelWrapper,{room:room},
preact.h("p",null,"Error: You tried to open a team selector, but you have nothing to select a team for.")
);
}
var baseFormat=room.parentElem.getAttribute('data-format')||Dex.modid;
var isFirstLoad=this.format===null;
if(isFirstLoad){
this.format=baseFormat;
}
var teams=this.getTeams();
if(!teams.length&&this.format&&isFirstLoad){
this.gen=this.format.slice(0,4);
this.format='';
teams=this.getTeams();
}
if(!teams.length&&this.gen&&isFirstLoad){
this.gen='';
teams=this.getTeams();
}

var availableWidth=document.body.offsetWidth;
var width=307;
if(availableWidth>636)width=613;
if(availableWidth>945)width=919;

var teamBuckets={};for(var _i22=0,_teams2=
teams;_i22<_teams2.length;_i22++){var team=_teams2[_i22];
var list=teamBuckets[team.folder]||(teamBuckets[team.folder]=[]);
list.push(team);
}

var teamList=[];

var baseGen=baseFormat.slice(0,4);
var genList=[];for(var _i24=0,_PS$teams$list2=
PS.teams.list;_i24<_PS$teams$list2.length;_i24++){var _team=_PS$teams$list2[_i24];
var gen=_team.format.slice(0,4);
if(gen&&!genList.includes(gen))genList.push(gen);
}
var hasOtherGens=genList.length>1||genList[0]!==baseGen;

teamList.push(preact.h("p",null,
baseFormat.length>4&&preact.h("button",{"class":'button'+(baseFormat===this.format?' disabled':''),onClick:this.setFormat,name:"format",value:baseFormat},
preact.h("i",{"class":"fa fa-folder-o"})," [",baseFormat.slice(0,4),"] ",baseFormat.slice(4)
)," ",preact.h("button",{"class":'button'+(baseGen===this.format?' disabled':''),onClick:this.setFormat,name:"format",value:baseGen},
preact.h("i",{"class":"fa fa-folder-o"})," [",baseGen,"] ",preact.h("em",null,"(uncategorized)")
)," ",preact.h("button",{"class":'button'+(baseGen===this.gen?' disabled':''),onClick:this.setFormat,name:"gen",value:baseGen},
preact.h("i",{"class":"fa fa-folder-o"})," [",baseGen,"] ",preact.h("em",null,"(all)")
)," ",hasOtherGens&&!this.gen&&preact.h("button",{"class":"button",onClick:this.setFormat,name:"gen",value:baseGen},"Other gens")
));

if(hasOtherGens&&this.gen){
teamList.push(preact.h("h2",null,"Other gens"));
teamList.push(preact.h("p",null,genList.sort().map(function(gen){return[
preact.h("button",{"class":'button'+(gen===_this3.gen?' disabled':''),onClick:_this3.setFormat,name:"gen",value:gen},
preact.h("i",{"class":"fa fa-folder-o"})," [",gen,"] ",preact.h("em",null,"(all)")
),
" "];}
)));
}

var isEmpty=true;
for(var _folder in teamBuckets){
if(_folder&&(this.gen||this.format)){
teamList.push(preact.h("h2",null,
preact.h("i",{"class":"fa fa-folder-open"})," ",_folder," + ",
preact.h("i",{"class":"fa fa-folder-open-o"})," ",this.format||this.gen
));
}else if(_folder){
teamList.push(preact.h("h2",null,
preact.h("i",{"class":"fa fa-folder-open"})," ",_folder
));
}else if(this.gen||this.format){
teamList.push(preact.h("h2",null,
preact.h("i",{"class":"fa fa-folder-open-o"})," ",this.format||this.gen
));
}else{
teamList.push(preact.h("h2",null,
preact.h("i",{"class":"fa fa-folder-open-o"})," Teams not in any folders"
));
}
teamList.push(preact.h("ul",{"class":"teamdropdown",onClick:this.click},
teamBuckets[_folder].map(function(team){return preact.h("li",{key:team.key,style:"display:inline-block"},
preact.h(TeamBox,{team:team,button:true})
);})
));
isEmpty=false;
}

return preact.h(PSPanelWrapper,{room:room,width:width},
teamList,
isEmpty&&preact.h("p",null,preact.h("em",null,"No teams found"))
);
};return TeamDropdownPanel;}(PSRoomPanel);var























FormatDropdownPanel=function(_PSRoomPanel2){_inheritsLoose(FormatDropdownPanel,_PSRoomPanel2);function FormatDropdownPanel(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_PSRoomPanel2.call.apply(_PSRoomPanel2,[this].concat(args))||this;_this4.
gen='';_this4.
format=null;_this4.
click=function(e){
var curTarget=e.target;
var target;
while(curTarget&&curTarget!==e.currentTarget){
if(curTarget.tagName==='BUTTON'){
target=curTarget;
}
curTarget=curTarget.parentElement;
}
if(!target)return;

_this4.chooseParentValue(target.value);
};return _this4;}var _proto2=FormatDropdownPanel.prototype;_proto2.
render=function render(){var _this5=this;
var room=this.props.room;
if(!room.parentElem){
return preact.h(PSPanelWrapper,{room:room},
preact.h("p",null,"Error: You tried to open a format selector, but you have nothing to select a format for.")
);
}

var formatsLoaded=!!window.BattleFormats;
if(formatsLoaded){
formatsLoaded=false;
for(var i in window.BattleFormats){
formatsLoaded=true;
break;
}
}
if(!formatsLoaded){
return preact.h(PSPanelWrapper,{room:room},
preact.h("p",null,"Loading...")
);
}






var selectType=
room.parentElem.getAttribute('data-selecttype')||'challenge';


var formats=Object.values(BattleFormats).filter(function(format){
if(selectType==='challenge'&&format.challengeShow===false)return false;
if(selectType==='search'&&format.searchShow===false)return false;
return true;
});

var curSection='';
var curColumnNum=0;
var curColumn=[];
var columns=[curColumn];for(var _i26=0;_i26<
formats.length;_i26++){var format=formats[_i26];
if(format.column!==curColumnNum){
if(curColumn.length){
curColumn=[];
columns.push(curColumn);
}
curColumnNum=format.column;
}
if(format.section!==curSection){
curSection=format.section;
if(curSection){
curColumn.push({id:null,section:curSection});
}
}
curColumn.push(format);
}

var width=columns.length*225+10;

return preact.h(PSPanelWrapper,{room:room,width:width},
columns.map(function(column){return preact.h("ul",{"class":"options",onClick:_this5.click},
column.map(function(format){return format.id?
preact.h("li",null,preact.h("button",{value:format.name,"class":"option"},
format.name.replace('[Gen 8 ','[').replace('[Gen 9] ','').replace('[Gen 7 ','[')
)):

preact.h("li",null,preact.h("h3",null,
format.section
));}
)
);}),
preact.h("div",{style:"float: left"})
);
};return FormatDropdownPanel;}(PSRoomPanel);


PS.roomTypes['teamdropdown']={
Component:TeamDropdownPanel
};

PS.roomTypes['formatdropdown']={
Component:FormatDropdownPanel
};
//# sourceMappingURL=panel-teamdropdown.js.map