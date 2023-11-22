function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Topbar Panel
 *
 * Topbar view - handles the topbar and some generic popups.
 *
 * Also handles global drag-and-drop support.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

window.addEventListener('drop',function(e){
console.log('drop '+e.dataTransfer.dropEffect);
var target=e.target;
if(/^text/.test(target.type)){
PS.dragging=null;
return;
}





e.preventDefault();
PS.dragging=null;
});
window.addEventListener('dragend',function(e){
e.preventDefault();
PS.dragging=null;
});
window.addEventListener('dragover',function(e){

e.preventDefault();
});var

PSHeader=function(_preact$Component){_inheritsLoose(PSHeader,_preact$Component);function PSHeader(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
handleDragEnter=function(e){
console.log('dragenter '+e.dataTransfer.dropEffect);
e.preventDefault();
if(!PS.dragging)return;

var target=e.currentTarget;

var draggingRoom=PS.dragging.roomid;
if(draggingRoom===null)return;

var draggedOverRoom=PS.router.extractRoomID(target.href);
if(draggedOverRoom===null)return;
if(draggingRoom===draggedOverRoom)return;

var leftIndex=PS.leftRoomList.indexOf(draggedOverRoom);
if(leftIndex>=0){
_this.dragOnto(draggingRoom,'leftRoomList',leftIndex);
}else{
var rightIndex=PS.rightRoomList.indexOf(draggedOverRoom);
if(rightIndex>=0){
_this.dragOnto(draggingRoom,'rightRoomList',rightIndex);
}else{
return;
}
}




};_this.
handleDragStart=function(e){
var roomid=PS.router.extractRoomID(e.currentTarget.href);
if(!roomid)return;

PS.dragging={type:'room',roomid:roomid};
};return _this;}var _proto=PSHeader.prototype;_proto.
dragOnto=function dragOnto(fromRoom,toRoomList,toIndex){

if(fromRoom===''||fromRoom==='rooms')return;

if(fromRoom===PS[toRoomList][toIndex])return;
if(fromRoom===''&&toRoomList==='miniRoomList')return;

var roomLists=['leftRoomList','rightRoomList','miniRoomList'];
var fromRoomList;
var fromIndex=-1;for(var _i2=0;_i2<
roomLists.length;_i2++){var roomList=roomLists[_i2];
fromIndex=PS[roomList].indexOf(fromRoom);
if(fromIndex>=0){
fromRoomList=roomList;
break;
}
}
if(!fromRoomList)return;

if(toRoomList==='leftRoomList'&&toIndex===0)toIndex=1;
if(toRoomList==='rightRoomList'&&toIndex===PS.rightRoomList.length-1)toIndex--;

PS[fromRoomList].splice(fromIndex,1);




PS[toRoomList].splice(toIndex,0,fromRoom);

var room=PS.rooms[fromRoom];
switch(toRoomList){
case'leftRoomList':room.location='left';break;
case'rightRoomList':room.location='right';break;
case'miniRoomList':room.location='mini-window';break;
}
if(fromRoomList!==toRoomList){
if(fromRoom===PS.leftRoom.id){
PS.leftRoom=PS.mainmenu;
}else if(PS.rightRoom&&fromRoom===PS.rightRoom.id){
PS.rightRoom=PS.rooms['rooms'];
}
if(toRoomList==='rightRoomList'){
PS.rightRoom=room;
}else if(toRoomList==='leftRoomList'){
PS.leftRoom=room;
}
}
PS.update();
};_proto.
renderRoomTab=function renderRoomTab(id){
var room=PS.rooms[id];
var closable=id===''||id==='rooms'?'':' closable';
var cur=PS.isVisible(room)?' cur':'';
var notifying=room.notifications.length?' notifying':room.isSubtleNotifying?' subtle-notifying':'';
var className="roomtab button"+notifying+closable+cur;
var icon=null;
var title=room.title;
var closeButton=null;
switch(room.type){
case'':
case'mainmenu':
icon=preact.h("i",{"class":"fa fa-home"});
break;
case'teambuilder':
icon=preact.h("i",{"class":"fa fa-pencil-square-o"});
break;
case'ladder':
case'ladderformat':
icon=preact.h("i",{"class":"fa fa-list-ol"});
break;
case'battles':
icon=preact.h("i",{"class":"fa fa-caret-square-o-right"});
break;
case'rooms':
icon=preact.h("i",{"class":"fa fa-plus",style:"margin:7px auto -6px auto"});
title='';
break;
case'battle':
var idChunks=id.substr(7).split('-');
var formatid;

if(idChunks.length<=1){
if(idChunks[0]==='uploadedreplay')formatid='Uploaded Replay';
}else{
formatid=idChunks[0];
}
if(!title){var _battle$p,_battle$p2;
var battle=room.battle;
var p1=(battle==null||(_battle$p=battle.p1)==null?void 0:_battle$p.name)||'';
var p2=(battle==null||(_battle$p2=battle.p2)==null?void 0:_battle$p2.name)||'';
if(p1&&p2){
title=p1+" v. "+p2;
}else if(p1||p2){
title=""+p1+p2;
}else{
title="(empty room)";
}
}
icon=preact.h("i",{"class":"text"},formatid);
break;
case'chat':
icon=preact.h("i",{"class":"fa fa-comment-o"});
break;
case'html':
default:
if(title.charAt(0)==='['){
var closeBracketIndex=title.indexOf(']');
if(closeBracketIndex>0){
icon=preact.h("i",{"class":"text"},title.slice(1,closeBracketIndex));
title=title.slice(closeBracketIndex+1);
break;
}
}
icon=preact.h("i",{"class":"fa fa-file-text-o"});
break;
}
if(closable){
closeButton=preact.h("button",{"class":"closebutton",name:"closeRoom",value:id,"aria-label":"Close"},
preact.h("i",{"class":"fa fa-times-circle"})
);
}
return preact.h("li",null,
preact.h("a",{
"class":className,href:"/"+id,draggable:true,
onDragEnter:this.handleDragEnter,onDragStart:this.handleDragStart},

icon," ",preact.h("span",null,title)
),
closeButton
);
};_proto.
renderUser=function renderUser(){
if(!PS.connected){
return preact.h("button",{"class":"button",disabled:true},preact.h("em",null,"Offline"));
}
if(!PS.user.userid){
return preact.h("button",{"class":"button",disabled:true},preact.h("em",null,"Connecting..."));
}
if(!PS.user.named){
return preact.h("a",{"class":"button",href:"login"},"Choose name");
}
var userColor=window.BattleLog&&{color:BattleLog.usernameColor(PS.user.userid)};
return preact.h("span",{"class":"username","data-name":PS.user.name,style:userColor},
preact.h("i",{"class":"fa fa-user",style:"color:#779EC5"})," ",preact.h("span",{"class":"usernametext"},PS.user.name)
);
};_proto.
render=function render(){var _this2=this;
return preact.h("div",{id:"header","class":"header",style:this.props.style},
preact.h("img",{
"class":"logo",
src:"https://"+Config.routes.client+"/pokemonshowdownbeta.png",
srcset:"https://"+Config.routes.client+"/pokemonshowdownbeta@2x.png 2x",
alt:"Pok\xE9mon Showdown! (beta)",
width:"146",height:"44"}
),
preact.h("div",{"class":"maintabbarbottom"}),
preact.h("div",{"class":"tabbar maintabbar"},preact.h("div",{"class":"inner"},
preact.h("ul",null,
this.renderRoomTab(PS.leftRoomList[0])
),
preact.h("ul",null,
PS.leftRoomList.slice(1).map(function(roomid){return _this2.renderRoomTab(roomid);})
),
preact.h("ul",{"class":"siderooms",style:{"float":'none',marginLeft:PS.leftRoomWidth-144}},
PS.rightRoomList.map(function(roomid){return _this2.renderRoomTab(roomid);})
)
)),
preact.h("div",{"class":"userbar"},
this.renderUser()," ",
preact.h("button",{"class":"icon button",name:"joinRoom",value:"volume",title:"Sound","aria-label":"Sound"},
preact.h("i",{"class":PS.prefs.mute?'fa fa-volume-off':'fa fa-volume-up'})
)," ",
preact.h("button",{"class":"icon button",name:"joinRoom",value:"options",title:"Options","aria-label":"Options"},
preact.h("i",{"class":"fa fa-cog"})
)
)
);
};return PSHeader;}(preact.Component);


preact.render(preact.h(PSMain,null),document.body,document.getElementById('ps-frame'));var





UserRoom=function(_PSRoom){_inheritsLoose(UserRoom,_PSRoom);




function UserRoom(options){var _this3;
_this3=_PSRoom.call(this,options)||this;_this3.classType='user';_this3.userid=void 0;_this3.name=void 0;_this3.isSelf=void 0;
_this3.userid=_this3.id.slice(5);
_this3.isSelf=_this3.userid===PS.user.userid;
_this3.name=options.username||_this3.userid;
if(/[a-zA-Z0-9]/.test(_this3.name.charAt(0)))_this3.name=' '+_this3.name;
PS.send("|/cmd userdetails "+_this3.userid);return _this3;
}return UserRoom;}(PSRoom);var


UserPanel=function(_PSRoomPanel){_inheritsLoose(UserPanel,_PSRoomPanel);function UserPanel(){return _PSRoomPanel.apply(this,arguments)||this;}var _proto2=UserPanel.prototype;_proto2.
render=function render(){
var room=this.props.room;
var user=PS.mainmenu.userdetailsCache[room.userid]||{userid:room.userid,avatar:'[loading]'};
var name=room.name.slice(1);

var group=PS.server.getGroup(room.name);
var groupName=group.name||null;
if(group.type==='punishment'){
groupName=preact.h("span",{style:"color:#777777"},groupName);
}

var globalGroup=PS.server.getGroup(user.group);
var globalGroupName=globalGroup.name&&"Global "+globalGroup.name||null;
if(globalGroup.type==='punishment'){
globalGroupName=preact.h("span",{style:"color:#777777"},globalGroupName);
}
if(globalGroup.name===group.name)groupName=null;

var roomsList=null;
if(user.rooms){
var battlebuf=[];
var chatbuf=[];
var privatebuf=[];
for(var roomid in user.rooms){
if(roomid==='global')continue;
var curRoom=user.rooms[roomid];
var roomrank=null;
if(!/[A-Za-z0-9]/.test(roomid.charAt(0))){
roomrank=preact.h("small",{style:"color: #888; font-size: 100%"},roomid.charAt(0));
}
roomid=toRoomid(roomid);

if(roomid.substr(0,7)==='battle-'){
var p1=curRoom.p1.substr(1);
var p2=curRoom.p2.substr(1);
var ownBattle=PS.user.userid===toUserid(p1)||PS.user.userid===toUserid(p2);
var roomLink=preact.h("a",{href:"/"+roomid,"class":'ilink'+(ownBattle||roomid in PS.rooms?' yours':''),
title:(p1||'?')+" v. "+(p2||'?')},
roomrank,roomid.substr(7));
if(curRoom.isPrivate){
if(privatebuf.length)privatebuf.push(', ');
privatebuf.push(roomLink);
}else{
if(battlebuf.length)battlebuf.push(', ');
battlebuf.push(roomLink);
}
}else{
var _roomLink=preact.h("a",{href:"/"+roomid,"class":'ilink'+(roomid in PS.rooms?' yours':'')},
roomrank,roomid
);
if(curRoom.isPrivate){
if(privatebuf.length)privatebuf.push(", ");
privatebuf.push(_roomLink);
}else{
if(chatbuf.length)chatbuf.push(', ');
chatbuf.push(_roomLink);
}
}
}
if(battlebuf.length)battlebuf.unshift(preact.h("br",null),preact.h("em",null,"Battles:")," ");
if(chatbuf.length)chatbuf.unshift(preact.h("br",null),preact.h("em",null,"Chatrooms:")," ");
if(privatebuf.length)privatebuf.unshift(preact.h("br",null),preact.h("em",null,"Private rooms:")," ");
if(battlebuf.length||chatbuf.length||privatebuf.length){
roomsList=preact.h("small",{"class":"rooms"},battlebuf,chatbuf,privatebuf);
}
}else if(user.rooms===false){
roomsList=preact.h("strong",{"class":"offline"},"OFFLINE");
}

var isSelf=user.userid===PS.user.userid;
var away=false;
var status=null;
if(user.status){
away=user.status.startsWith('!');
status=away?user.status.slice(1):user.status;
}

return preact.h(PSPanelWrapper,{room:room},
preact.h("div",{"class":"userdetails"},
user.avatar!=='[loading]'&&
preact.h("img",{
"class":'trainersprite'+(room.isSelf?' yours':''),
src:Dex.resolveAvatar(''+(user.avatar||'unknown'))}
),

preact.h("strong",null,preact.h("a",{href:"//"+Config.routes.users+"/"+user.userid,target:"_blank",style:away?{color:'#888888'}:null},name)),preact.h("br",null),
status&&preact.h("div",{"class":"userstatus"},status),
groupName&&preact.h("div",{"class":"usergroup roomgroup"},groupName),
globalGroupName&&preact.h("div",{"class":"usergroup globalgroup"},globalGroupName),
user.customgroup&&preact.h("div",{"class":"usergroup globalgroup"},user.customgroup),
roomsList
),
isSelf||!PS.user.named?
preact.h("p",{"class":"buttonbar"},
preact.h("button",{"class":"button",disabled:true},"Challenge")," ",
preact.h("button",{"class":"button",disabled:true},"Chat")
):

preact.h("p",{"class":"buttonbar"},
preact.h("button",{"class":"button","data-href":"/challenge-"+user.userid},"Challenge")," ",
preact.h("button",{"class":"button","data-href":"/pm-"+user.userid},"Chat")," ",
preact.h("button",{"class":"button disabled",name:"userOptions"},"\u2026")
),

isSelf&&preact.h("hr",null),
isSelf&&preact.h("p",{"class":"buttonbar",style:"text-align: right"},
preact.h("button",{"class":"button disabled",name:"login"},preact.h("i",{"class":"fa fa-pencil"})," Change name")," ",
preact.h("button",{"class":"button",name:"cmd",value:"/logout"},preact.h("i",{"class":"fa fa-power-off"})," Log out")
)
);
};return UserPanel;}(PSRoomPanel);


PS.roomTypes['user']={
Model:UserRoom,
Component:UserPanel
};var

VolumePanel=function(_PSRoomPanel2){_inheritsLoose(VolumePanel,_PSRoomPanel2);function VolumePanel(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_PSRoomPanel2.call.apply(_PSRoomPanel2,[this].concat(args))||this;_this4.
setVolume=function(e){
var slider=e.currentTarget;
PS.prefs.set(slider.name,Number(slider.value));
_this4.forceUpdate();
};_this4.
setMute=function(e){
var checkbox=e.currentTarget;
PS.prefs.set('mute',!!checkbox.checked);
PS.update();
};return _this4;}var _proto3=VolumePanel.prototype;_proto3.
componentDidMount=function componentDidMount(){var _this5=this;
_PSRoomPanel2.prototype.componentDidMount.call(this);
this.subscriptions.push(PS.prefs.subscribe(function(){
_this5.forceUpdate();
}));
};_proto3.
render=function render(){
var room=this.props.room;
return preact.h(PSPanelWrapper,{room:room},
preact.h("h3",null,"Volume"),
preact.h("p",{"class":"volume"},
preact.h("label",{"class":"optlabel"},"Effects: ",preact.h("span",{"class":"value"},!PS.prefs.mute&&PS.prefs.effectvolume?PS.prefs.effectvolume+"%":"muted")),
PS.prefs.mute?
preact.h("em",null,"(muted)"):
preact.h("input",{
type:"range",min:"0",max:"100",step:"1",name:"effectvolume",value:PS.prefs.effectvolume,
onChange:this.setVolume,onInput:this.setVolume,onKeyUp:this.setVolume}
)
),
preact.h("p",{"class":"volume"},
preact.h("label",{"class":"optlabel"},"Music: ",preact.h("span",{"class":"value"},!PS.prefs.mute&&PS.prefs.musicvolume?PS.prefs.musicvolume+"%":"muted")),
PS.prefs.mute?
preact.h("em",null,"(muted)"):
preact.h("input",{
type:"range",min:"0",max:"100",step:"1",name:"musicvolume",value:PS.prefs.musicvolume,
onChange:this.setVolume,onInput:this.setVolume,onKeyUp:this.setVolume}
)
),
preact.h("p",{"class":"volume"},
preact.h("label",{"class":"optlabel"},"Notifications: ",preact.h("span",{"class":"value"},!PS.prefs.mute&&PS.prefs.notifvolume?PS.prefs.notifvolume+"%":"muted")),
PS.prefs.mute?
preact.h("em",null,"(muted)"):
preact.h("input",{
type:"range",min:"0",max:"100",step:"1",name:"notifvolume",value:PS.prefs.notifvolume,
onChange:this.setVolume,onInput:this.setVolume,onKeyUp:this.setVolume}
)
),
preact.h("p",null,
preact.h("label",{"class":"checkbox"},preact.h("input",{type:"checkbox",name:"mute",checked:PS.prefs.mute,onChange:this.setMute})," Mute all")
)
);
};return VolumePanel;}(PSRoomPanel);


PS.roomTypes['volume']={
Component:VolumePanel
};var

OptionsPanel=function(_PSRoomPanel3){_inheritsLoose(OptionsPanel,_PSRoomPanel3);function OptionsPanel(){var _this6;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this6=_PSRoomPanel3.call.apply(_PSRoomPanel3,[this].concat(args))||this;_this6.
setTheme=function(e){
var theme=e.currentTarget.value;
PS.prefs.set('theme',theme);
_this6.forceUpdate();
};return _this6;}var _proto4=OptionsPanel.prototype;_proto4.
render=function render(){
var room=this.props.room;
return preact.h(PSPanelWrapper,{room:room},
preact.h("h3",null,"Graphics"),
preact.h("p",null,
preact.h("label",{"class":"optlabel"},"Theme: ",preact.h("select",{onChange:this.setTheme},
preact.h("option",{value:"light",selected:PS.prefs.theme==='light'},"Light"),
preact.h("option",{value:"dark",selected:PS.prefs.theme==='dark'},"Dark"),
preact.h("option",{value:"system",selected:PS.prefs.theme==='system'},"Match system theme")
))
)
);
};return OptionsPanel;}(PSRoomPanel);


PS.roomTypes['options']={
Component:OptionsPanel
};
//# sourceMappingURL=panel-topbar.js.map