function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Teambuilder team panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

TeamRoom=function(_PSRoom){_inheritsLoose(TeamRoom,_PSRoom);function TeamRoom(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this.
team=null;return _this;}return TeamRoom;}(PSRoom);var


TeamTextbox=function(_preact$Component){_inheritsLoose(TeamTextbox,_preact$Component);function TeamTextbox(){var _this2;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this2=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this2.
setInfo=


[];_this2.
sets=[];_this2.
textbox=null;_this2.
heightTester=null;_this2.
activeType='';_this2.
activeOffsetY=-1;_this2.
activeSetIndex=-1;_this2.
search=new DexSearch();_this2.





input=function(){return _this2.update();};_this2.
select=function(){return _this2.update(true);};_this2.
closeMenu=function(){
_this2.activeType='';
_this2.forceUpdate();
_this2.textbox.focus();
};_this2.
update=function(cursorOnly){
var textbox=_this2.textbox;
_this2.heightTester.style.width=textbox.offsetWidth+"px";
var value=textbox.value;

var index=0;
var setIndex=-1;
if(!cursorOnly)_this2.setInfo=[];
_this2.activeOffsetY=-1;
_this2.activeSetIndex=-1;
_this2.activeType='';

var selectionStart=textbox.selectionStart||0;
var selectionEnd=textbox.selectionEnd||0;


var parseState=0;
while(index<value.length){
var nlIndex=value.indexOf('\n',index);
if(nlIndex<0)nlIndex=value.length;
var line=value.slice(index,nlIndex).trim();

if(!line){
parseState=0;
index=nlIndex+1;
continue;
}

if(parseState===0&&index&&!cursorOnly){
_this2.setInfo[_this2.setInfo.length-1].bottomY=_this2.getYAt(index-1,value);
}

if(parseState===0){
if(!cursorOnly){
var atIndex=line.indexOf('@');
var species=atIndex>=0?line.slice(0,atIndex).trim():line;
if(species.endsWith(' (M)')||species.endsWith(' (F)')){
species=species.slice(0,-4);
}
if(species.endsWith(')')){
var parenIndex=species.lastIndexOf(' (');
if(parenIndex>=0){
species=species.slice(parenIndex+2,-1);
}
}
_this2.setInfo.push({
species:species,
bottomY:-1
});
}
parseState=1;
setIndex++;
}

var selectionEndCutoff=selectionStart===selectionEnd?nlIndex:nlIndex+1;
if(index<=selectionStart&&selectionEnd<=selectionEndCutoff){

_this2.activeOffsetY=_this2.getYAt(index-1,value);
_this2.activeSetIndex=setIndex;

var lcLine=line.toLowerCase().trim();
if(lcLine.startsWith('ability:')){
_this2.activeType='ability';
}else if(lcLine.startsWith('-')){
_this2.activeType='move';
}else if(
!lcLine||lcLine.startsWith('ivs:')||lcLine.startsWith('evs:')||
lcLine.startsWith('level:')||lcLine.startsWith('gender:')||
lcLine.endsWith(' nature')||lcLine.startsWith('shiny:'))
{

}else{
_this2.activeType='pokemon';
var _atIndex=line.indexOf('@');
if(_atIndex>=0&&selectionStart>index+_atIndex){
_this2.activeType='item';
}
}
_this2.search.setType(_this2.activeType,'gen8ou',_this2.sets[setIndex]);
_this2.search.find('');
window.search=_this2.search;
}

index=nlIndex+1;
}
if(!cursorOnly){
var bottomY=_this2.getYAt(value.length,value);
if(_this2.setInfo.length){
_this2.setInfo[_this2.setInfo.length-1].bottomY=bottomY;
}

textbox.style.height=bottomY+100+"px";
_this2.save();
}
_this2.forceUpdate();
};return _this2;}var _proto=TeamTextbox.prototype;_proto.getYAt=function getYAt(index,value){if(index<0)return 10;this.heightTester.value=value.slice(0,index);return this.heightTester.scrollHeight;};_proto.
save=function save(){
var sets=PSTeambuilder.importTeam(this.textbox.value);
this.props.team.packedTeam=PSTeambuilder.packTeam(sets);
this.props.team.iconCache=null;
PS.teams.save();
};_proto.
componentDidMount=function componentDidMount(){
this.textbox=this.base.getElementsByClassName('teamtextbox')[0];
this.heightTester=this.base.getElementsByClassName('heighttester')[0];

this.sets=PSTeambuilder.unpackTeam(this.props.team.packedTeam);
var exportedTeam=PSTeambuilder.exportTeam(this.sets);
this.textbox.value=exportedTeam;
this.update();
};_proto.
componentWillUnmount=function componentWillUnmount(){
this.textbox=null;
this.heightTester=null;
};_proto.
render=function render(){var _this3=this;
return preact.h("div",{"class":"teameditor"},
preact.h("textarea",{"class":"textbox teamtextbox",onInput:this.input,onSelect:this.select,onClick:this.select,onKeyUp:this.select}),
preact.h("textarea",{
"class":"textbox teamtextbox heighttester",style:"visibility:hidden",tabIndex:-1,"aria-hidden":true}
),
preact.h("div",{"class":"teamoverlays"},
this.setInfo.slice(0,-1).map(function(info){return(
preact.h("hr",{style:"top:"+(info.bottomY-18)+"px"}));}
),
this.setInfo.map(function(info,i){
if(!info.species)return null;
var prevOffset=i===0?8:_this3.setInfo[i-1].bottomY;
var species=info.species;
var num=Dex.getPokemonIconNum(toID(species));
if(!num)return null;

var top=Math.floor(num/12)*30;
var left=num%12*40;
var iconStyle="background:transparent url("+Dex.resourcePrefix+"sprites/pokemonicons-sheet.png) no-repeat scroll -"+left+"px -"+top+"px";

return preact.h("span",{"class":"picon",style:"top:"+(
prevOffset+1)+"px;left:50px;position:absolute;"+iconStyle}
);
}),
this.activeOffsetY>=0&&
preact.h("div",{"class":"teaminnertextbox",style:{top:this.activeOffsetY-1}})

),
this.activeType&&preact.h("div",{"class":"searchresults",style:{top:this.activeSetIndex>=0?this.setInfo[this.activeSetIndex].bottomY-12:0}},
preact.h("button",{"class":"button closesearch",onClick:this.closeMenu},preact.h("i",{"class":"fa fa-times"})," Close"),
preact.h(PSSearchResults,{search:this.search})
)
);
};return TeamTextbox;}(preact.Component);var


TeamPanel=function(_PSRoomPanel){_inheritsLoose(TeamPanel,_PSRoomPanel);function TeamPanel(){var _this4;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this4=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this4.
rename=function(e){
var textbox=e.currentTarget;
var room=_this4.props.room;

room.team.name=textbox.value.trim();
PS.teams.save();
};return _this4;}var _proto2=TeamPanel.prototype;_proto2.
render=function render(){
var room=this.props.room;
var team=PS.teams.byKey[room.id.slice(5)];
if(!team){
return preact.h(PSPanelWrapper,{room:room},
preact.h("button",{"class":"button","data-href":"teambuilder","data-target":"replace"},
preact.h("i",{"class":"fa fa-chevron-left"})," List"
),
preact.h("p",{"class":"error"},"Team doesn't exist"

)
);
}

if(!room.team)room.team=team;
return preact.h(PSPanelWrapper,{room:room,scrollable:true},
preact.h("div",{"class":"pad"},
preact.h("button",{"class":"button","data-href":"teambuilder","data-target":"replace"},
preact.h("i",{"class":"fa fa-chevron-left"})," List"
),
preact.h("label",{"class":"label teamname"},"Team name:",

preact.h("input",{"class":"textbox",type:"text",value:team.name,onInput:this.rename,onChange:this.rename,onKeyUp:this.rename})
),
preact.h(TeamTextbox,{team:team})
)
);
};return TeamPanel;}(PSRoomPanel);


PS.roomTypes['team']={
Model:TeamRoom,
Component:TeamPanel,
title:"Team"
};
PS.updateRoomTypes();
//# sourceMappingURL=panel-teambuilder-team.js.map