function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Main menu panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var





MainMenuRoom=function(_PSRoom){_inheritsLoose(MainMenuRoom,_PSRoom);function MainMenuRoom(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this.
classType='mainmenu';_this.
userdetailsCache=






{};_this.
roomsCache=




{};return _this;}var _proto=MainMenuRoom.prototype;_proto.
receiveLine=function receiveLine(args){var _this2=this;
var cmd=args[0];
switch(cmd){
case'challstr':{
var challstr=args[1];
PSLoginServer.query({
act:'upkeep',
challstr:challstr
}).then(function(res){
if(!res)return;
if(!res.loggedin)return;
_this2.send("/trn "+res.username+",0,"+res.assertion);
});
return;
}case'updateuser':{
var fullName=args[1],namedCode=args[2],avatar=args[3];
PS.user.setName(fullName,namedCode==='1',avatar);
return;
}case'updatechallenges':{
var challengesBuf=args[1];
this.receiveChallenges(challengesBuf);
return;
}case'queryresponse':{
var queryId=args[1],responseJSON=args[2];
this.handleQueryResponse(queryId,JSON.parse(responseJSON));
return;
}case'pm':{
var user1=args[1],user2=args[2],message=args[3];
this.handlePM(user1,user2,message);
return;
}case'formats':{
this.parseFormats(args);
return;
}case'popup':{
var _message=args[1];
alert(_message.replace(/\|\|/g,'\n'));
return;
}}
var lobby=PS.rooms['lobby'];
if(lobby)lobby.receiveLine(args);
};_proto.
receiveChallenges=function receiveChallenges(dataBuf){
var json;
try{
json=JSON.parse(dataBuf);
}catch(_unused){}
for(var _userid in json.challengesFrom){
PS.getPMRoom(toID(_userid));
}
if(json.challengeTo){
PS.getPMRoom(toID(json.challengeTo.to));
}
for(var _roomid in PS.rooms){var _json$challengeTo,_json$challengeTo2;
var room=PS.rooms[_roomid];
if(!room.pmTarget)continue;
var targetUserid=toID(room.pmTarget);
if(!room.challengedFormat&&!(targetUserid in json.challengesFrom)&&
!room.challengingFormat&&((_json$challengeTo=json.challengeTo)==null?void 0:_json$challengeTo.to)!==targetUserid){
continue;
}
room.challengedFormat=json.challengesFrom[targetUserid]||null;
room.challengingFormat=((_json$challengeTo2=json.challengeTo)==null?void 0:_json$challengeTo2.to)===targetUserid?json.challengeTo.format:null;
room.update(null);
}
};_proto.
parseFormats=function parseFormats(formatsList){
var isSection=false;
var section='';

var column=0;

window.NonBattleGames={rps:'Rock Paper Scissors'};
for(var i=3;i<=9;i=i+2){
window.NonBattleGames['bestof'+i]='Best-of-'+i;
}
window.BattleFormats={};
for(var j=1;j<formatsList.length;j++){
var entry=formatsList[j];
if(isSection){
section=entry;
isSection=false;
}else if(entry===',LL'){
PS.teams.usesLocalLadder=true;
}else if(entry===''||entry.charAt(0)===','&&!isNaN(Number(entry.slice(1)))){
isSection=true;

if(entry){
column=parseInt(entry.slice(1),10)||0;
}
}else{var _BattleFormats$_id;
var name=entry;
var searchShow=true;
var challengeShow=true;
var tournamentShow=true;
var _team=null;
var teambuilderLevel=null;
var lastCommaIndex=name.lastIndexOf(',');
var code=lastCommaIndex>=0?parseInt(name.substr(lastCommaIndex+1),16):NaN;
if(!isNaN(code)){
name=name.substr(0,lastCommaIndex);
if(code&1)_team='preset';
if(!(code&2))searchShow=false;
if(!(code&4))challengeShow=false;
if(!(code&8))tournamentShow=false;
if(code&16)teambuilderLevel=50;
}else{

if(name.substr(name.length-2)===',#'){
_team='preset';
name=name.substr(0,name.length-2);
}
if(name.substr(name.length-2)===',,'){
challengeShow=false;
name=name.substr(0,name.length-2);
}else if(name.substr(name.length-1)===','){
searchShow=false;
name=name.substr(0,name.length-1);
}
}
var _id=toID(name);
var isTeambuilderFormat=!_team&&name.slice(-11)!=='Custom Game';
var teambuilderFormat='';
var teambuilderFormatName='';
if(isTeambuilderFormat){
teambuilderFormatName=name;
if(_id.slice(0,3)!=='gen'){
teambuilderFormatName='[Gen 6] '+name;
}
var parenPos=teambuilderFormatName.indexOf('(');
if(parenPos>0&&name.slice(-1)===')'){

teambuilderFormatName=teambuilderFormatName.slice(0,parenPos).trim();
}
if(teambuilderFormatName!==name){
teambuilderFormat=toID(teambuilderFormatName);
if(BattleFormats[teambuilderFormat]){
BattleFormats[teambuilderFormat].isTeambuilderFormat=true;
}else{
BattleFormats[teambuilderFormat]={
id:teambuilderFormat,
name:teambuilderFormatName,
team:_team,
section:section,
column:column,
rated:false,
isTeambuilderFormat:true,
effectType:'Format'
};
}
isTeambuilderFormat=false;
}
}
if((_BattleFormats$_id=BattleFormats[_id])!=null&&_BattleFormats$_id.isTeambuilderFormat){
isTeambuilderFormat=true;
}

if(BattleFormats[_id])delete BattleFormats[_id];
BattleFormats[_id]={
id:_id,
name:name,
team:_team,
section:section,
column:column,
searchShow:searchShow,
challengeShow:challengeShow,
tournamentShow:tournamentShow,
rated:searchShow&&_id.substr(4,7)!=='unrated',
teambuilderLevel:teambuilderLevel,
teambuilderFormat:teambuilderFormat,
isTeambuilderFormat:isTeambuilderFormat,
effectType:'Format'
};
}
}


var multivariantFormats={};
for(var _id2 in BattleFormats){
var _teambuilderFormat=BattleFormats[BattleFormats[_id2].teambuilderFormat];
if(!_teambuilderFormat||multivariantFormats[_teambuilderFormat.id])continue;
if(!_teambuilderFormat.searchShow&&!_teambuilderFormat.challengeShow&&!_teambuilderFormat.tournamentShow){

if(_teambuilderFormat.battleFormat){
multivariantFormats[_teambuilderFormat.id]=1;
_teambuilderFormat.battleFormat='';
}else{
_teambuilderFormat.battleFormat=_id2;
}
}
}
PS.teams.update('format');
};_proto.
handlePM=function handlePM(user1,user2,message){
var userid1=toID(user1);
var userid2=toID(user2);
var roomid="pm-"+[userid1,userid2].sort().join('-');
var room=PS.rooms[roomid];
if(!room){
var pmTarget=PS.user.userid===userid1?user2:user1;
PS.addRoom({
id:roomid,
pmTarget:pmTarget
},true);
room=PS.rooms[roomid];
}
room.receiveLine(["c",user1,message]);
PS.update();
};_proto.
handleQueryResponse=function handleQueryResponse(id,response){
switch(id){
case'userdetails':
var _userid2=response.userid;
var userdetails=this.userdetailsCache[_userid2];
if(!userdetails){
this.userdetailsCache[_userid2]=response;
}else{
Object.assign(userdetails,response);
}
var userRoom=PS.rooms["user-"+_userid2];
if(userRoom)userRoom.update(null);
break;
case'rooms':
if(response.pspl){for(var _i2=0,_response$pspl2=
response.pspl;_i2<_response$pspl2.length;_i2++){var roomInfo=_response$pspl2[_i2];roomInfo.spotlight="Spotlight";}
response.chat=[].concat(response.pspl,response.chat);
response.pspl=null;
}
if(response.official){for(var _i4=0,_response$official2=
response.official;_i4<_response$official2.length;_i4++){var _roomInfo=_response$official2[_i4];_roomInfo.section="Official";}
response.chat=[].concat(response.official,response.chat);
response.official=null;
}
this.roomsCache=response;
var roomsRoom=PS.rooms["rooms"];
if(roomsRoom)roomsRoom.update(null);
break;
case'roomlist':
var battlesRoom=PS.rooms["battles"];
if(battlesRoom){
var battleTable=response.rooms;
var battles=[];
for(var battleid in battleTable){
battleTable[battleid].id=battleid;
battles.push(battleTable[battleid]);
}
battlesRoom.battles=battles;
battlesRoom.update(null);
}
break;
case'laddertop':
var ladderRoomEntries=Object.entries(PS.rooms).filter(function(entry){return entry[0].startsWith('ladder');});for(var _i6=0;_i6<
ladderRoomEntries.length;_i6++){var _ref=ladderRoomEntries[_i6];var ladderRoom=_ref[1];
ladderRoom.update(response);
}
break;
}
};return MainMenuRoom;}(PSRoom);var


NewsPanel=function(_PSRoomPanel){_inheritsLoose(NewsPanel,_PSRoomPanel);function NewsPanel(){return _PSRoomPanel.apply(this,arguments)||this;}var _proto2=NewsPanel.prototype;_proto2.
render=function render(){
return preact.h(PSPanelWrapper,{room:this.props.room,scrollable:true},
preact.h("div",{"class":"mini-window-body",dangerouslySetInnerHTML:{__html:PS.newsHTML}})
);
};return NewsPanel;}(PSRoomPanel);var


MainMenuPanel=function(_PSRoomPanel2){_inheritsLoose(MainMenuPanel,_PSRoomPanel2);function MainMenuPanel(){var _this3;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this3=_PSRoomPanel2.call.apply(_PSRoomPanel2,[this].concat(args))||this;_this3.



submit=function(e){
alert('todo: implement');
};_this3.
handleDragStart=function(e){
var roomid=e.currentTarget.getAttribute('data-roomid');
PS.dragging={type:'room',roomid:roomid};
};return _this3;}var _proto3=MainMenuPanel.prototype;_proto3.focus=function focus(){this.base.querySelector('button.big').focus();};_proto3.
renderMiniRoom=function renderMiniRoom(room){
var roomType=PS.roomTypes[room.type];
var Panel=roomType?roomType.Component:PSRoomPanel;
return preact.h(Panel,{key:room.id,room:room});
};_proto3.
renderMiniRooms=function renderMiniRooms(){var _this4=this;
return PS.miniRoomList.map(function(roomid){
var room=PS.rooms[roomid];
return preact.h("div",{"class":"pmbox"},
preact.h("div",{"class":"mini-window"},
preact.h("h3",{draggable:true,onDragStart:_this4.handleDragStart,"data-roomid":roomid},
preact.h("button",{"class":"closebutton",name:"closeRoom",value:roomid,"aria-label":"Close",tabIndex:-1},preact.h("i",{"class":"fa fa-times-circle"})),
preact.h("button",{"class":"minimizebutton",tabIndex:-1},preact.h("i",{"class":"fa fa-minus-circle"})),
room.title
),
_this4.renderMiniRoom(room)
)
);
});
};_proto3.
renderSearchButton=function renderSearchButton(){
if(PS.down){
return preact.h("div",{"class":"menugroup",style:"background: rgba(10,10,10,.6)"},
PS.down==='ddos'?
preact.h("p",{"class":"error"},preact.h("strong",null,"Pok\xE9mon Showdown is offline due to a DDoS attack!")):

preact.h("p",{"class":"error"},preact.h("strong",null,"Pok\xE9mon Showdown is offline due to technical difficulties!")),

preact.h("p",null,
preact.h("div",{style:{textAlign:'center'}},
preact.h("img",{width:"96",height:"96",src:"//"+Config.routes.client+"/sprites/gen5/teddiursa.png",alt:""})
),"Bear with us as we freak out."

),
preact.h("p",null,"(We'll be back up in a few hours.)")
);
}

if(!PS.user.userid||PS.isOffline){
return preact.h(TeamForm,{"class":"menugroup",onSubmit:this.submit},
preact.h("button",{"class":"mainmenu1 big button disabled",name:"search"},
preact.h("em",null,PS.isOffline?"Disconnected":"Connecting...")
)
);
}

return preact.h(TeamForm,{"class":"menugroup",onSubmit:this.submit},
preact.h("button",{"class":"mainmenu1 big button",name:"search"},
preact.h("strong",null,"Battle!"),preact.h("br",null),
preact.h("small",null,"Find a random opponent")
)
);
};_proto3.
render=function render(){
var onlineButton=' button'+(PS.isOffline?' disabled':'');
return preact.h(PSPanelWrapper,{room:this.props.room,scrollable:true},
preact.h("div",{"class":"mainmenuwrapper"},
preact.h("div",{"class":"leftmenu"},
preact.h("div",{"class":"activitymenu"},
this.renderMiniRooms()
),
preact.h("div",{"class":"mainmenu"},
this.renderSearchButton(),

preact.h("div",{"class":"menugroup"},
preact.h("p",null,preact.h("button",{"class":"mainmenu2 button",name:"joinRoom",value:"teambuilder"},"Teambuilder")),
preact.h("p",null,preact.h("button",{"class":"mainmenu3"+onlineButton,name:"joinRoom",value:"ladder"},"Ladder"))
),

preact.h("div",{"class":"menugroup"},
preact.h("p",null,preact.h("button",{"class":"mainmenu4"+onlineButton,name:"joinRoom",value:"battles"},"Watch a battle")),
preact.h("p",null,preact.h("button",{"class":"mainmenu5"+onlineButton,name:"finduser"},"Find a user"))
)
)
),
preact.h("div",{"class":"rightmenu",style:{display:PS.leftRoomWidth?'none':'block'}},
preact.h("div",{"class":"menugroup"},
PS.server.id==='showdown'?
preact.h("p",null,preact.h("button",{"class":"mainmenu1"+onlineButton,name:"joinRoom",value:"rooms"},"Join chat")):

preact.h("p",null,preact.h("button",{"class":"mainmenu1"+onlineButton,name:"joinRoom",value:"lobby"},"Join lobby chat"))

)
),
preact.h("div",{"class":"mainmenufooter"},
preact.h("div",{"class":"bgcredit"}),
preact.h("small",null,
preact.h("a",{href:"//"+Config.routes.dex+"/",target:"_blank"},"Pok\xE9dex")," | ",
preact.h("a",{href:"//"+Config.routes.replays+"/",target:"_blank"},"Replays")," | ",
preact.h("a",{href:"//"+Config.routes.root+"/rules",target:"_blank"},"Rules")," | ",
preact.h("a",{href:"//"+Config.routes.dex+"/credits",target:"_blank"},"Credits")," | ",
preact.h("a",{href:"//smogon.com/forums/",target:"_blank"},"Forum")
)
)
)
);
};return MainMenuPanel;}(PSRoomPanel);var


FormatDropdown=function(_preact$Component){_inheritsLoose(FormatDropdown,_preact$Component);function FormatDropdown(){var _this5;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this5=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this5.

format='[Gen 7] Random Battle';_this5.
change=function(e){
if(!_this5.base)return;
_this5.format=_this5.base.value;
_this5.forceUpdate();
if(_this5.props.onChange)_this5.props.onChange(e);
};return _this5;}var _proto4=FormatDropdown.prototype;_proto4.
render=function render(){
if(this.props.format){
return preact.h("button",{
name:"format",value:this.props.format,"class":"select formatselect preselected",disabled:true},
this.props.format);
}
return preact.h("button",{
name:"format",value:this.format,
"class":"select formatselect","data-href":"/formatdropdown",onChange:this.change},

this.format
);
};return FormatDropdown;}(preact.Component);var


TeamDropdown=function(_preact$Component2){_inheritsLoose(TeamDropdown,_preact$Component2);function TeamDropdown(){var _this6;for(var _len4=arguments.length,args=new Array(_len4),_key4=0;_key4<_len4;_key4++){args[_key4]=arguments[_key4];}_this6=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this6.
teamFormat='';_this6.
teamKey='';_this6.
change=function(){
if(!_this6.base)return;
_this6.teamKey=_this6.base.value;
_this6.forceUpdate();
};return _this6;}var _proto5=TeamDropdown.prototype;_proto5.
getDefaultTeam=function getDefaultTeam(teambuilderFormat){for(var _i8=0,_PS$teams$list2=
PS.teams.list;_i8<_PS$teams$list2.length;_i8++){var _team2=_PS$teams$list2[_i8];
if(_team2.format===teambuilderFormat)return _team2.key;
}
return'';
};_proto5.
render=function render(){var _window$BattleFormats;
var teamFormat=PS.teams.teambuilderFormat(this.props.format);
var formatData=(_window$BattleFormats=window.BattleFormats)==null?void 0:_window$BattleFormats[teamFormat];
if(formatData&&formatData.team){
return preact.h("button",{"class":"select teamselect preselected",name:"team",value:"random",disabled:true},
preact.h("div",{"class":"team"},
preact.h("strong",null,"Random team"),
preact.h("small",null,
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)}),
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)}),
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)}),
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)}),
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)}),
preact.h("span",{"class":"picon",style:Dex.getPokemonIcon(null)})
)
)
);
}
if(teamFormat!==this.teamFormat){
this.teamFormat=teamFormat;
this.teamKey=this.getDefaultTeam(teamFormat);
}
var team=PS.teams.byKey[this.teamKey]||null;
return preact.h("button",{
name:"team",value:this.teamKey,
"class":"select teamselect","data-href":"/teamdropdown","data-format":teamFormat,onChange:this.change},

PS.roomTypes['teamdropdown']&&preact.h(TeamBox,{team:team,noLink:true})
);
};return TeamDropdown;}(preact.Component);var


TeamForm=function(_preact$Component3){_inheritsLoose(TeamForm,_preact$Component3);function TeamForm(){var _this7;for(var _len5=arguments.length,args=new Array(_len5),_key5=0;_key5<_len5;_key5++){args[_key5]=arguments[_key5];}_this7=_preact$Component3.call.apply(_preact$Component3,[this].concat(args))||this;_this7.



state={format:'[Gen 7] Random Battle'};_this7.
changeFormat=function(e){
_this7.setState({format:e.target.value});
};_this7.
submit=function(e){
e.preventDefault();
var format=_this7.base.querySelector('button[name=format]').value;
var teamKey=_this7.base.querySelector('button[name=team]').value;
var team=teamKey?PS.teams.byKey[teamKey]:undefined;
if(_this7.props.onSubmit)_this7.props.onSubmit(e,format,team);
};return _this7;}var _proto6=TeamForm.prototype;_proto6.
render=function render(){
return preact.h("form",{"class":this.props["class"],onSubmit:this.submit},
preact.h("p",null,
preact.h("label",{"class":"label"},"Format:",
preact.h("br",null),
preact.h(FormatDropdown,{onChange:this.changeFormat,format:this.props.format})
)
),
preact.h("p",null,
preact.h("label",{"class":"label"},"Team:",
preact.h("br",null),
preact.h(TeamDropdown,{format:this.state.format})
)
),
preact.h("p",null,this.props.children)
);
};return TeamForm;}(preact.Component);


PS.roomTypes['news']={
Component:NewsPanel
};

PS.roomTypes['mainmenu']={
Model:MainMenuRoom,
Component:MainMenuPanel
};
//# sourceMappingURL=panel-mainmenu.js.map