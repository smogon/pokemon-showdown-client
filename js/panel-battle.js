function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Battle panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var










BattlesRoom=function(_PSRoom){_inheritsLoose(BattlesRoom,_PSRoom);




function BattlesRoom(options){var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='battles';_this.format='';_this.battles=null;
_this.refresh();return _this;
}var _proto=BattlesRoom.prototype;_proto.
setFormat=function setFormat(format){
if(format===this.format)return this.refresh();
this.battles=null;
this.format=format;
this.update(null);
this.refresh();
};_proto.
refresh=function refresh(){
PS.send("|/cmd roomlist "+toID(this.format));
};return BattlesRoom;}(PSRoom);var


BattlesPanel=function(_PSRoomPanel){_inheritsLoose(BattlesPanel,_PSRoomPanel);function BattlesPanel(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this2.
refresh=function(){
_this2.props.room.refresh();
};_this2.
changeFormat=function(e){
var value=e.target.value;
_this2.props.room.setFormat(value);
};return _this2;}var _proto2=BattlesPanel.prototype;_proto2.
renderBattleLink=function renderBattleLink(battle){
var format=battle.id.split('-')[1];
var minEloMessage=typeof battle.minElo==='number'?"rated "+battle.minElo:battle.minElo;
return preact.h("div",null,preact.h("a",{href:"/"+battle.id,"class":"blocklink"},
minEloMessage&&preact.h("small",{style:"float:right"},"(",minEloMessage,")"),
preact.h("small",null,"[",format,"]"),preact.h("br",null),
preact.h("em",{"class":"p1"},battle.p1)," ",preact.h("small",{"class":"vs"},"vs.")," ",preact.h("em",{"class":"p2"},battle.p2)
));
};_proto2.
render=function render(){var _this3=this;
var room=this.props.room;
return preact.h(PSPanelWrapper,{room:room,scrollable:true},preact.h("div",{"class":"pad"},
preact.h("button",{"class":"button",style:"float:right;font-size:10pt;margin-top:3px",name:"close"},preact.h("i",{"class":"fa fa-times"})," Close"),
preact.h("div",{"class":"roomlist"},
preact.h("p",null,
preact.h("button",{"class":"button",name:"refresh",onClick:this.refresh},preact.h("i",{"class":"fa fa-refresh"})," Refresh")," ",preact.h("span",{style:Dex.getPokemonIcon('meloetta-pirouette')+';display:inline-block;vertical-align:middle',"class":"picon",title:"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."})
),

preact.h("p",null,
preact.h("label",{"class":"label"},"Format:"),preact.h(FormatDropdown,{onChange:this.changeFormat})
),







preact.h("div",{"class":"list"},!room.battles?
preact.h("p",null,"Loading..."):
!room.battles.length?
preact.h("p",null,"No battles are going on"):

room.battles.map(function(battle){return _this3.renderBattleLink(battle);})
)
)
));
};return BattlesPanel;}(PSRoomPanel);var


BattleRoom=function(_ChatRoom){_inheritsLoose(BattleRoom,_ChatRoom);function BattleRoom(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_ChatRoom.call.apply(_ChatRoom,[this].concat(args))||this;_this4.
classType='battle';_this4.





battle=null;_this4.

side=null;_this4.
request=null;_this4.
choices=null;return _this4;}var _proto3=BattleRoom.prototype;_proto3.




handleMessage=function handleMessage(line){
if(!line.startsWith('/')||line.startsWith('//'))return false;
var spaceIndex=line.indexOf(' ');
var cmd=spaceIndex>=0?line.slice(1,spaceIndex):line.slice(1);
var target=spaceIndex>=0?line.slice(spaceIndex+1):'';
switch(cmd){
case'play':{
this.battle.play();
this.update(null);
return true;
}case'pause':{
this.battle.pause();
this.update(null);
return true;
}case'ffto':case'fastfowardto':{
var turnNum=Number(target);
if(target.charAt(0)==='+'||turnNum<0){
turnNum+=this.battle.turn;
if(turnNum<0)turnNum=0;
}else if(target==='end'){
turnNum=-1;
}
if(isNaN(turnNum)){
this.receiveLine(["error","/ffto - Invalid turn number: "+target]);
return true;
}
this.battle.seekTurn(turnNum);
this.update(null);
return true;
}case'switchsides':{
this.battle.switchViewpoint();
return true;
}case'cancel':case'undo':{
if(!this.choices||!this.request){
this.receiveLine(["error","/choose - You are not a player in this battle"]);
return true;
}
if(this.choices.isDone()||this.choices.isEmpty()){
this.send('/undo',true);
}
this.choices=new BattleChoiceBuilder(this.request);
this.update(null);
return true;
}case'move':case'switch':case'team':case'pass':case'shift':case'choose':{
if(!this.choices){
this.receiveLine(["error","/choose - You are not a player in this battle"]);
return true;
}
var possibleError=this.choices.addChoice(line.slice(cmd==='choose'?8:1));
if(possibleError){
this.receiveLine(["error",possibleError]);
return true;
}
if(this.choices.isDone())this.send("/choose "+this.choices.toString(),true);
this.update(null);
return true;
}}
return _ChatRoom.prototype.handleMessage.call(this,line);
};return BattleRoom;}(ChatRoom);var


BattleDiv=function(_preact$Component){_inheritsLoose(BattleDiv,_preact$Component);function BattleDiv(){return _preact$Component.apply(this,arguments)||this;}var _proto4=BattleDiv.prototype;_proto4.
shouldComponentUpdate=function shouldComponentUpdate(){
return false;
};_proto4.
render=function render(){
return preact.h("div",{"class":"battle"});
};return BattleDiv;}(preact.Component);


function MoveButton(props)

{
return preact.h("button",{name:"cmd",value:props.cmd,"class":"type-"+props.type+" has-tooltip","data-tooltip":props.tooltip},
props.children,preact.h("br",null),
preact.h("small",{"class":"type"},props.type)," ",preact.h("small",{"class":"pp"},props.moveData.pp,"/",props.moveData.maxpp),"\xA0"
);
}
function PokemonButton(props)

{
var pokemon=props.pokemon;
if(!pokemon){
return preact.h("button",{
name:"cmd",value:props.cmd,"class":(props.disabled?'disabled ':'')+"has-tooltip",
style:{opacity:props.disabled==='fade'?0.5:1},"data-tooltip":props.tooltip},
"(empty slot)"

);
}

var hpColorClass;
switch(BattleScene.getHPColor(pokemon)){
case'y':hpColorClass='hpbar hpbar-yellow';break;
case'r':hpColorClass='hpbar hpbar-red';break;
default:hpColorClass='hpbar';break;
}

return preact.h("button",{
name:"cmd",value:props.cmd,"class":(props.disabled?'disabled ':'')+"has-tooltip",
style:{opacity:props.disabled==='fade'?0.5:1},"data-tooltip":props.tooltip},

preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(pokemon)}),
pokemon.name,

!props.noHPBar&&!pokemon.fainted&&
preact.h("span",{"class":hpColorClass},
preact.h("span",{style:{width:Math.round(pokemon.hp*92/pokemon.maxhp)||1}})
),

!props.noHPBar&&pokemon.status&&preact.h("span",{"class":"status "+pokemon.status})
);
}var

BattlePanel=function(_PSRoomPanel2){_inheritsLoose(BattlePanel,_PSRoomPanel2);function BattlePanel(){var _this5;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this5=_PSRoomPanel2.call.apply(_PSRoomPanel2,[this].concat(args))||this;_this5.
send=function(text){
_this5.props.room.send(text);
};_this5.



focusIfNoSelection=function(){
var selection=window.getSelection();
if(selection.type==='Range')return;
_this5.focus();
};_this5.
onKey=function(e){
if(e.keyCode===33){
var chatLog=_this5.base.getElementsByClassName('chat-log')[0];
chatLog.scrollTop=chatLog.scrollTop-chatLog.offsetHeight+60;
return true;
}else if(e.keyCode===34){
var _chatLog=_this5.base.getElementsByClassName('chat-log')[0];
_chatLog.scrollTop=_chatLog.scrollTop+_chatLog.offsetHeight-60;
return true;
}
return false;
};_this5.
toggleBoostedMove=function(e){
var checkbox=e.currentTarget;
var choices=_this5.props.room.choices;
if(!choices)return;
switch(checkbox.name){
case'mega':
choices.current.mega=checkbox.checked;
break;
case'ultra':
choices.current.ultra=checkbox.checked;
break;
case'z':
choices.current.z=checkbox.checked;
break;
case'max':
choices.current.max=checkbox.checked;
break;
}
_this5.props.room.update(null);
};return _this5;}var _proto5=BattlePanel.prototype;_proto5.focus=function focus(){this.base.querySelector('textarea').focus();};_proto5.
componentDidMount=function componentDidMount(){var _this6=this;
var $elem=$(this.base);
var battle=new Battle({
$frame:$elem.find('.battle'),
$logFrame:$elem.find('.battle-log')
});
this.props.room.battle=battle;
battle.scene.tooltips.listen($elem.find('.battle-controls'));
_PSRoomPanel2.prototype.componentDidMount.call(this);
battle.subscribe(function(){return _this6.forceUpdate();});
};_proto5.
receiveLine=function receiveLine(args){
var room=this.props.room;
switch(args[0]){
case'initdone':
room.battle.seekTurn(Infinity);
return;
case'request':
this.receiveRequest(args[1]?JSON.parse(args[1]):null);
return;
case'win':case'tie':
this.receiveRequest(null);
break;
case'c':case'c:':case'chat':case'chatmsg':case'inactive':
room.battle.instantAdd('|'+args.join('|'));
return;
case'error':
if(args[1].startsWith('[Invalid choice]')&&room.request){
room.choices=new BattleChoiceBuilder(room.request);
room.update(null);
}
break;
}
room.battle.add('|'+args.join('|'));
};_proto5.
receiveRequest=function receiveRequest(request){
var room=this.props.room;
if(!request){
room.request=null;
room.choices=null;
return;
}

BattleChoiceBuilder.fixRequest(request,room.battle);

if(request.side){
room.battle.myPokemon=request.side.pokemon;
room.battle.setViewpoint(request.side.id);
room.side=request.side;
}

room.request=request;
room.choices=new BattleChoiceBuilder(request);
room.update(null);
};_proto5.
renderControls=function renderControls(){
var room=this.props.room;
if(!room.battle)return null;
if(room.side){
return this.renderPlayerControls();
}
var atEnd=room.battle.atQueueEnd;
return preact.h("div",{"class":"controls"},
preact.h("p",null,
atEnd?
preact.h("button",{"class":"button disabled",name:"cmd",value:"/play"},preact.h("i",{"class":"fa fa-play"}),preact.h("br",null),"Play"):
room.battle.paused?
preact.h("button",{"class":"button",name:"cmd",value:"/play"},preact.h("i",{"class":"fa fa-play"}),preact.h("br",null),"Play"):

preact.h("button",{"class":"button",name:"cmd",value:"/pause"},preact.h("i",{"class":"fa fa-pause"}),preact.h("br",null),"Pause"),
" ",
preact.h("button",{"class":"button",name:"cmd",value:"/ffto -1"},preact.h("i",{"class":"fa fa-step-backward"}),preact.h("br",null),"Last turn"),
preact.h("button",{"class":"button"+(atEnd?" disabled":""),name:"cmd",value:"/ffto +1"},preact.h("i",{"class":"fa fa-step-forward"}),preact.h("br",null),"Skip turn")," ",
preact.h("button",{"class":"button",name:"cmd",value:"/ffto 0"},preact.h("i",{"class":"fa fa-undo"}),preact.h("br",null),"First turn"),
preact.h("button",{"class":"button"+(atEnd?" disabled":""),name:"cmd",value:"/ffto end"},preact.h("i",{"class":"fa fa-fast-forward"}),preact.h("br",null),"Skip to end")
),
preact.h("p",null,
preact.h("button",{"class":"button",name:"cmd",value:"/switchsides"},preact.h("i",{"class":"fa fa-random"})," Switch sides")
)
);
};_proto5.
renderMoveControls=function renderMoveControls(request,choices){
var dex=this.props.room.battle.dex;
var pokemonIndex=choices.index();
var active=choices.currentMoveRequest();
if(!active)return preact.h("div",{"class":"message-error"},"Invalid pokemon");

if(choices.current.max||active.maxMoves&&!active.canDynamax){
if(!active.maxMoves){
return preact.h("div",{"class":"message-error"},"Maxed with no max moves");
}
return active.moves.map(function(moveData,i){
var move=dex.moves.get(moveData.name);
var maxMoveData=active.maxMoves[i];
var gmaxTooltip=maxMoveData.id.startsWith('gmax')?"|"+maxMoveData.id:"";
var tooltip="maxmove|"+moveData.name+"|"+pokemonIndex+gmaxTooltip;
return preact.h(MoveButton,{cmd:"/move "+(i+1)+" max",type:move.type,tooltip:tooltip,moveData:moveData},
maxMoveData.name
);
});
}

if(choices.current.z){
if(!active.zMoves){
return preact.h("div",{"class":"message-error"},"No Z moves");
}
return active.moves.map(function(moveData,i){
var move=dex.moves.get(moveData.name);
var zMoveData=active.zMoves[i];
if(!zMoveData){
return preact.h("button",{disabled:true},"\xA0");
}
var tooltip="zmove|"+moveData.name+"|"+pokemonIndex;
return preact.h(MoveButton,{cmd:"/move "+(i+1)+" zmove",type:move.type,tooltip:tooltip,moveData:{pp:1,maxpp:1}},
zMoveData.name
);
});
}

return active.moves.map(function(moveData,i){
var move=dex.moves.get(moveData.name);
var tooltip="move|"+moveData.name+"|"+pokemonIndex;
return preact.h(MoveButton,{cmd:"/move "+(i+1),type:move.type,tooltip:tooltip,moveData:moveData},
move.name
);
});
};_proto5.
renderMoveTargetControls=function renderMoveTargetControls(request,choices){
var battle=this.props.room.battle;
var moveTarget=choices.getChosenMove(choices.current,choices.index()).target;
var moveChoice=choices.stringChoice(choices.current);

var userSlot=choices.index();
var userSlotCross=battle.farSide.active.length-1-userSlot;

return[
battle.farSide.active.map(function(pokemon,i){var _pokemon;
var disabled=false;
if(moveTarget==='adjacentAlly'||moveTarget==='adjacentAllyOrSelf'){
disabled=true;
}else if(moveTarget==='normal'||moveTarget==='adjacentFoe'){
if(Math.abs(userSlotCross-i)>1)disabled=true;
}

if((_pokemon=pokemon)!=null&&_pokemon.fainted)pokemon=null;
return preact.h(PokemonButton,{
pokemon:pokemon,
cmd:disabled?"":"/"+moveChoice+" +"+(i+1),disabled:disabled&&'fade',tooltip:"activepokemon|1|"+i}
);
}).reverse(),
preact.h("div",{style:"clear: left"}),
battle.nearSide.active.map(function(pokemon,i){var _pokemon2;
var disabled=false;
if(moveTarget==='adjacentFoe'){
disabled=true;
}else if(moveTarget==='normal'||moveTarget==='adjacentAlly'||moveTarget==='adjacentAllyOrSelf'){
if(Math.abs(userSlot-i)>1)disabled=true;
}
if(moveTarget!=='adjacentAllyOrSelf'&&userSlot===i)disabled=true;

if((_pokemon2=pokemon)!=null&&_pokemon2.fainted)pokemon=null;
return preact.h(PokemonButton,{
pokemon:pokemon,
cmd:disabled?"":"/"+moveChoice+" -"+(i+1),disabled:disabled&&'fade',tooltip:"activepokemon|0|"+i}
);
})];

};_proto5.
renderSwitchControls=function renderSwitchControls(request,choices){var _choices$currentMoveR;
var numActive=choices.requestLength();

var trapped=(_choices$currentMoveR=choices.currentMoveRequest())==null?void 0:_choices$currentMoveR.trapped;

return request.side.pokemon.map(function(serverPokemon,i){
var cantSwitch=trapped||i<numActive||choices.alreadySwitchingIn.includes(i+1)||serverPokemon.fainted;
return preact.h(PokemonButton,{
pokemon:serverPokemon,cmd:"/switch "+(i+1),disabled:cantSwitch,tooltip:"switchpokemon|"+i}
);
});
};_proto5.
renderTeamControls=function renderTeamControls(request,choices){
return request.side.pokemon.map(function(serverPokemon,i){
var cantSwitch=choices.alreadySwitchingIn.includes(i+1);
return preact.h(PokemonButton,{
pokemon:serverPokemon,cmd:"/switch "+(i+1),noHPBar:true,disabled:cantSwitch&&'fade',tooltip:"switchpokemon|"+i}
);
});
};_proto5.
renderTeamList=function renderTeamList(){
var team=this.props.room.battle.myPokemon;
if(!team)return;
return preact.h("div",{"class":"switchcontrols"},
preact.h("h3",{"class":"switchselect"},"Team"),
preact.h("div",{"class":"switchmenu"},
team.map(function(serverPokemon,i){
return preact.h(PokemonButton,{
pokemon:serverPokemon,cmd:"",noHPBar:true,disabled:true,tooltip:"switchpokemon|"+i}
);
})
)
);
};_proto5.
renderChosenTeam=function renderChosenTeam(request,choices){
return choices.alreadySwitchingIn.map(function(slot){
var serverPokemon=request.side.pokemon[slot-1];
return preact.h(PokemonButton,{
pokemon:serverPokemon,cmd:"/switch "+slot,disabled:true,tooltip:"switchpokemon|"+(slot-1)}
);
});
};_proto5.
renderOldChoices=function renderOldChoices(request,choices){
if(!choices)return null;
if(request.requestType!=='move'&&request.requestType!=='switch')return;
if(choices.isEmpty())return null;

var buf=[
preact.h("button",{name:"cmd",value:"/cancel","class":"button"},preact.h("i",{"class":"fa fa-chevron-left"})," Back"),' '];

if(choices.isDone()&&request.noCancel){
buf=['Waiting for opponent...'];
}

var battle=this.props.room.battle;
for(var i=0;i<choices.choices.length;i++){
var choiceString=choices.choices[i];
var choice=choices.parseChoice(choiceString);
if(!choice)continue;
var pokemon=request.side.pokemon[i];
var active=request.requestType==='move'?request.active[i]:null;
if(choice.choiceType==='move'){
buf.push(pokemon.name+" will ");
if(choice.mega)buf.push("Mega Evolve and ");
if(choice.ultra)buf.push("Ultra Burst and ");
if(choice.max&&active!=null&&active.canDynamax)buf.push(active!=null&&active.canGigantamax?"Gigantamax and ":"Dynamax and ");
buf.push("use ",preact.h("strong",null,choices.getChosenMove(choice,i).name));
if(choice.targetLoc>0){
var target=battle.farSide.active[choice.targetLoc-1];
if(!target){
buf.push(" at slot "+choice.targetLoc);
}else{
buf.push(" at "+target.name);
}
}else if(choice.targetLoc<0){
var _target=battle.nearSide.active[-choice.targetLoc-1];
if(!_target){
buf.push(" at ally slot "+choice.targetLoc);
}else{
buf.push(" at ally "+_target.name);
}
}
}else if(choice.choiceType==='switch'){
var _target2=request.side.pokemon[choice.targetPokemon-1];
buf.push(pokemon.name+" will switch to ",preact.h("strong",null,_target2.name));
}else if(choice.choiceType==='shift'){
buf.push(pokemon.name+" will ",preact.h("strong",null,"shift")," to the center");
}
buf.push(preact.h("br",null));
}
return buf;
};_proto5.
renderPlayerControls=function renderPlayerControls(){
var room=this.props.room;
var request=room.request;
var choices=room.choices;
if(!request)return'Error: Missing request';
if(!choices)return'Error: Missing BattleChoiceBuilder';
if(choices.request!==request){
choices=new BattleChoiceBuilder(request);
room.choices=choices;
}

if(choices.isDone()){
return preact.h("div",{"class":"controls"},
preact.h("div",{"class":"whatdo"},
preact.h("button",{name:"openTimer","class":"button disabled timerbutton"},preact.h("i",{"class":"fa fa-hourglass-start"})," Timer"),
this.renderOldChoices(request,choices)
),
preact.h("div",{"class":"pad"},
request.noCancel?null:preact.h("button",{name:"cmd",value:"/cancel","class":"button"},"Cancel")
),
this.renderTeamList()
);
}
if(request.side)room.battle.myPokemon=request.side.pokemon;
switch(request.requestType){
case'move':{
var index=choices.index();
var pokemon=request.side.pokemon[index];
var moveRequest=choices.currentMoveRequest();

var canDynamax=moveRequest.canDynamax&&!choices.alreadyMax;
var canMegaEvo=moveRequest.canMegaEvo&&!choices.alreadyMega;
var canZMove=moveRequest.zMoves&&!choices.alreadyZ;

if(choices.current.move){
var moveName=choices.getChosenMove(choices.current,choices.index()).name;
return preact.h("div",{"class":"controls"},
preact.h("div",{"class":"whatdo"},
preact.h("button",{name:"openTimer","class":"button disabled timerbutton"},preact.h("i",{"class":"fa fa-hourglass-start"})," Timer"),
this.renderOldChoices(request,choices),
pokemon.name," should use ",preact.h("strong",null,moveName)," at where? "
),
preact.h("div",{"class":"switchcontrols"},
preact.h("div",{"class":"switchmenu"},
this.renderMoveTargetControls(request,choices)
)
)
);
}

var canShift=room.battle.gameType==='triples'&&index!==1;

return preact.h("div",{"class":"controls"},
preact.h("div",{"class":"whatdo"},
preact.h("button",{name:"openTimer","class":"button disabled timerbutton"},preact.h("i",{"class":"fa fa-hourglass-start"})," Timer"),
this.renderOldChoices(request,choices),"What will ",
preact.h("strong",null,pokemon.name)," do?"
),
preact.h("div",{"class":"movecontrols"},
preact.h("h3",{"class":"moveselect"},"Attack"),
preact.h("div",{"class":"movemenu"},
this.renderMoveControls(request,choices),
preact.h("div",{style:"clear:left"}),
canDynamax&&preact.h("label",{"class":"megaevo"+(choices.current.max?' cur':'')},
preact.h("input",{type:"checkbox",name:"max",checked:choices.current.max,onChange:this.toggleBoostedMove})," ",
moveRequest.canGigantamax?'Gigantamax':'Dynamax'
),
canMegaEvo&&preact.h("label",{"class":"megaevo"+(choices.current.mega?' cur':'')},
preact.h("input",{type:"checkbox",name:"mega",checked:choices.current.mega,onChange:this.toggleBoostedMove})," ","Mega Evolution"

),
moveRequest.canUltraBurst&&preact.h("label",{"class":"megaevo"+(choices.current.ultra?' cur':'')},
preact.h("input",{type:"checkbox",name:"ultra",checked:choices.current.ultra,onChange:this.toggleBoostedMove})," ","Ultra Burst"

),
canZMove&&preact.h("label",{"class":"megaevo"+(choices.current.z?' cur':'')},
preact.h("input",{type:"checkbox",name:"z",checked:choices.current.z,onChange:this.toggleBoostedMove})," ","Z-Power"

)
)
),
preact.h("div",{"class":"switchcontrols"},
canShift&&[
preact.h("h3",{"class":"shiftselect"},"Shift"),
preact.h("button",{name:"cmd",value:"/shift"},"Move to center")],

preact.h("h3",{"class":"switchselect"},"Switch"),
preact.h("div",{"class":"switchmenu"},
this.renderSwitchControls(request,choices)
)
)
);
}case'switch':{
var _pokemon3=request.side.pokemon[choices.index()];
return preact.h("div",{"class":"controls"},
preact.h("div",{"class":"whatdo"},
preact.h("button",{name:"openTimer","class":"button disabled timerbutton"},preact.h("i",{"class":"fa fa-hourglass-start"})," Timer"),
this.renderOldChoices(request,choices),"What will ",
preact.h("strong",null,_pokemon3.name)," do?"
),
preact.h("div",{"class":"switchcontrols"},
preact.h("h3",{"class":"switchselect"},"Switch"),
preact.h("div",{"class":"switchmenu"},
this.renderSwitchControls(request,choices)
)
)
);
}case'team':{
return preact.h("div",{"class":"controls"},
preact.h("div",{"class":"whatdo"},
preact.h("button",{name:"openTimer","class":"button disabled timerbutton"},preact.h("i",{"class":"fa fa-hourglass-start"})," Timer"),
choices.alreadySwitchingIn.length>0?
[preact.h("button",{name:"cmd",value:"/cancel","class":"button"},preact.h("i",{"class":"fa fa-chevron-left"})," Back"),
" What about the rest of your team? "]:

"How will you start the battle? "

),
preact.h("div",{"class":"switchcontrols"},
preact.h("h3",{"class":"switchselect"},"Choose ",choices.alreadySwitchingIn.length<=0?"lead":"slot "+(choices.alreadySwitchingIn.length+1)),
preact.h("div",{"class":"switchmenu"},
this.renderTeamControls(request,choices),
preact.h("div",{style:"clear:left"})
)
),
preact.h("div",{"class":"switchcontrols"},
choices.alreadySwitchingIn.length>0&&preact.h("h3",{"class":"switchselect"},"Team so far"),
preact.h("div",{"class":"switchmenu"},
this.renderChosenTeam(request,choices)
)
)
);
}}
};_proto5.
render=function render(){
var room=this.props.room;

return preact.h(PSPanelWrapper,{room:room},
preact.h(BattleDiv,null),
preact.h(ChatLog,{"class":"battle-log hasuserlist",room:this.props.room,onClick:this.focusIfNoSelection,left:640,noSubscription:true}

),
preact.h(ChatTextEntry,{room:this.props.room,onMessage:this.send,onKey:this.onKey,left:640}),
preact.h(ChatUserList,{room:this.props.room,left:640,minimized:true}),
preact.h("div",{"class":"battle-controls",role:"complementary","aria-label":"Battle Controls",style:"top: 370px;"},
this.renderControls()
)
);
};return BattlePanel;}(PSRoomPanel);


PS.roomTypes['battle']={
Model:BattleRoom,
Component:BattlePanel
};
PS.roomTypes['battles']={
Model:BattlesRoom,
Component:BattlesPanel
};
PS.updateRoomTypes();
//# sourceMappingURL=panel-battle.js.map