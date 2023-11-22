function _assertThisInitialized(self){if(self===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Client main
 *
 * Dependencies: client-core
 *
 * Sets up the main client models: Prefs, Teams, User, and PS.
 *
 * @author Guangcong Luo <guancongluo@gmail.com>
 * @license AGPLv3
 */










var PSPrefsDefaults={};var








PSPrefs=function(_PSStreamModel){_inheritsLoose(PSPrefs,_PSStreamModel);
































function PSPrefs(){var _this;
_this=_PSStreamModel.call(this)||this;_this.theme='light';_this.nogif=null;_this.showjoins=null;_this.onepanel=false;_this.mute=false;_this.effectvolume=50;_this.musicvolume=50;_this.notifvolume=50;_this.storageEngine='';_this.storage={};_this.origin="https://"+Config.routes.client;

for(var _key in _assertThisInitialized(_this)){
var value=_assertThisInitialized(_this)[_key];
if(['storage','subscriptions','origin','storageEngine'].includes(_key))continue;
if(typeof value==='function')continue;
PSPrefsDefaults[_key]=value;
}


try{
if(window.localStorage){
_this.storageEngine='localStorage';
_this.load(JSON.parse(localStorage.getItem('showdown_prefs'))||{},true);
}
}catch(_unused){}return _this;
}var _proto=PSPrefs.prototype;_proto.



set=function set(key,value){
if(value===null){
delete this.storage[key];
this[key]=PSPrefsDefaults[key];
}else{
this.storage[key]=value;
this[key]=value;
}
this.update(key);
this.save();
};_proto.
load=function load(newPrefs,noSave){
this.fixPrefs(newPrefs);
Object.assign(this,PSPrefsDefaults);
this.storage=newPrefs;
this.update(null);
if(!noSave)this.save();
};_proto.
save=function save(){
switch(this.storageEngine){
case'localStorage':
localStorage.setItem('showdown_prefs',JSON.stringify(this.storage));
}
};_proto.
fixPrefs=function fixPrefs(newPrefs){
var oldShowjoins=newPrefs['showjoins'];
if(oldShowjoins!==undefined&&typeof oldShowjoins!=='object'){
var showjoins={};
var serverShowjoins={global:oldShowjoins?1:0};
var showroomjoins=newPrefs['showroomjoins'];
for(var _roomid in showroomjoins){
serverShowjoins[_roomid]=showroomjoins[_roomid]?1:0;
}
delete newPrefs['showroomjoins'];
showjoins[Config.server.id]=serverShowjoins;
newPrefs['showjoins']=showjoins;
}

var isChrome64=navigator.userAgent.includes(' Chrome/64.');
if(newPrefs['nogif']!==undefined){
if(!isChrome64){
delete newPrefs['nogif'];
}
}else if(isChrome64){
newPrefs['nogif']=true;
alert('Your version of Chrome has a bug that makes animated GIFs freeze games sometimes, so certain animations have been disabled. Only some people have the problem, so you can experiment and enable them in the Options menu setting "Disable GIFs for Chrome 64 bug".');
}

var colorSchemeQuerySupported=(window.matchMedia==null?void 0:window.matchMedia('(prefers-color-scheme: dark)').media)!=='not all';
if(newPrefs['theme']==='system'&&!colorSchemeQuerySupported){
newPrefs['theme']='light';
}
if(newPrefs['dark']!==undefined){
if(newPrefs['dark']){
newPrefs['theme']='dark';
}
delete newPrefs['dark'];
}
};return PSPrefs;}(PSStreamModel);















if(!window.BattleFormats)window.BattleFormats={};var




PSTeams=function(_PSStreamModel2){_inheritsLoose(PSTeams,_PSStreamModel2);





function PSTeams(){var _this2;
_this2=_PSStreamModel2.call(this)||this;_this2.usesLocalLadder=false;_this2.list=[];_this2.byKey={};_this2.deletedTeams=[];
try{
_this2.unpackAll(localStorage.getItem('showdown_teams'));
}catch(_unused2){}return _this2;
}var _proto2=PSTeams.prototype;_proto2.
teambuilderFormat=function teambuilderFormat(format){
var ruleSepIndex=format.indexOf('@@@');
if(ruleSepIndex>=0)format=format.slice(0,ruleSepIndex);
var formatid=toID(format);
if(!window.BattleFormats)return formatid;
var formatEntry=BattleFormats[formatid];
return(formatEntry==null?void 0:formatEntry.teambuilderFormat)||formatid;
};_proto2.
getKey=function getKey(name){
var baseKey=toID(name)||'0';
var key=baseKey;
var i=1;
while(key in this.byKey){
i++;
key=baseKey+"-"+i;
}
return key;
};_proto2.
unpackAll=function unpackAll(buffer){
if(!buffer){
this.list=[];
return;
}

if(buffer.charAt(0)==='['&&!buffer.trim().includes('\n')){
this.unpackOldBuffer(buffer);
return;
}

this.list=[];for(var _i2=0,_buffer$split2=
buffer.split('\n');_i2<_buffer$split2.length;_i2++){var line=_buffer$split2[_i2];
var team=this.unpackLine(line);
if(team)this.push(team);
}
this.update('team');
};_proto2.
push=function push(team){
team.key=this.getKey(team.name);
this.list.push(team);
this.byKey[team.key]=team;
};_proto2.
unshift=function unshift(team){
team.key=this.getKey(team.name);
this.list.unshift(team);
this.byKey[team.key]=team;
};_proto2["delete"]=
function _delete(team){
var teamIndex=this.list.indexOf(team);
if(teamIndex<0)return false;
this.deletedTeams.push([team,teamIndex]);
this.list.splice(teamIndex,1);
delete this.byKey[team.key];
};_proto2.
undelete=function undelete(){
if(!this.deletedTeams.length)return;
var _ref=this.deletedTeams.pop(),team=_ref[0],teamIndex=_ref[1];
this.list.splice(teamIndex,0,team);
if(this.byKey[team.key])team.key=this.getKey(team.name);
this.byKey[team.key]=team;
};_proto2.
unpackOldBuffer=function unpackOldBuffer(buffer){
alert("Your team storage format is too old for PS. You'll need to upgrade it at https://"+Config.routes.client+"/recoverteams.html");
this.list=[];
return;
};_proto2.
packAll=function packAll(teams){
return teams.map(function(team){return(
(team.format?team.format+"]":"")+(team.folder?team.folder+"/":"")+team.name+"|"+team.packedTeam);}
).join('\n');
};_proto2.
save=function save(){
try{
localStorage.setItem('showdown_teams',this.packAll(this.list));
}catch(_unused3){}
this.update('team');
};_proto2.
unpackLine=function unpackLine(line){
var pipeIndex=line.indexOf('|');
if(pipeIndex<0)return null;
var bracketIndex=line.indexOf(']');
if(bracketIndex>pipeIndex)bracketIndex=-1;
var slashIndex=line.lastIndexOf('/',pipeIndex);
if(slashIndex<0)slashIndex=bracketIndex;
var format=bracketIndex>0?line.slice(0,bracketIndex):'gen7';
if(format.slice(0,3)!=='gen')format='gen6'+format;
var name=line.slice(slashIndex+1,pipeIndex);
return{
name:name,
format:format,
folder:line.slice(bracketIndex+1,slashIndex>0?slashIndex:bracketIndex+1),
packedTeam:line.slice(pipeIndex+1),
iconCache:null,
key:''
};
};return PSTeams;}(PSStreamModel);var






PSUser=function(_PSModel){_inheritsLoose(PSUser,_PSModel);function PSUser(){var _this3;for(var _len=arguments.length,args=new Array(_len),_key2=0;_key2<_len;_key2++){args[_key2]=arguments[_key2];}_this3=_PSModel.call.apply(_PSModel,[this].concat(args))||this;_this3.
name="";_this3.
group='';_this3.
userid="";_this3.
named=false;_this3.
registered=false;_this3.
avatar="1";return _this3;}var _proto3=PSUser.prototype;_proto3.
setName=function setName(fullName,named,avatar){
var loggingIn=!this.named&&named;
var _BattleTextParser$par=BattleTextParser.parseNameParts(fullName),name=_BattleTextParser$par.name,group=_BattleTextParser$par.group;
this.name=name;
this.group=group;
this.userid=toID(name);
this.named=named;
this.avatar=avatar;
this.update();
if(loggingIn){
for(var _roomid2 in PS.rooms){
var room=PS.rooms[_roomid2];
if(room.connectWhenLoggedIn)room.connect();
}
}
};_proto3.
logOut=function logOut(){var _PS$connection;
PSLoginServer.query({
act:'logout',
userid:this.userid
});
PS.send('|/logout');
(_PS$connection=PS.connection)==null||_PS$connection.disconnect();

alert("You have been logged out and disconnected.\n\nIf you wanted to change your name while staying connected, use the 'Change Name' button or the '/nick' command.");
this.name="";
this.group='';
this.userid="";
this.named=false;
this.registered=false;
this.update();
};return PSUser;}(PSModel);var












PSServer=function(){function PSServer(){this.
id=Config.defaultserver.id;this.
host=Config.defaultserver.host;this.
port=Config.defaultserver.port;this.
altport=Config.defaultserver.altport;this.
registered=Config.defaultserver.registered;this.
prefix='/showdown';this.
protocol=Config.defaultserver.httpport?'https':'http';this.
groups={
'~':{
name:"Administrator (~)",
type:'leadership',
order:101
},
'#':{
name:"Room Owner (#)",
type:'leadership',
order:102
},
'&':{
name:"Administrator (&)",
type:'leadership',
order:103
},
"\u2605":{
name:"Host (\u2605)",
type:'staff',
order:104
},
'@':{
name:"Moderator (@)",
type:'staff',
order:105
},
'%':{
name:"Driver (%)",
type:'staff',
order:106
},
"\xA7":{
name:"Section Leader (\xA7)",
type:'staff',
order:107
},

'*':{
name:"Bot (*)",
order:109
},
"\u2606":{
name:"Player (\u2606)",
order:110
},
'+':{
name:"Voice (+)",
order:200
},
' ':{
order:201
},
'!':{
name:"Muted (!)",
type:'punishment',
order:301
},
'✖':{
name:"Namelocked (\u2716)",
type:'punishment',
order:302
},
"\u203D":{
name:"Locked (\u203D)",
type:'punishment',
order:303
}
};this.
defaultGroup={
order:108
};}var _proto4=PSServer.prototype;_proto4.
getGroup=function getGroup(symbol){
return this.groups[(symbol||' ').charAt(0)]||this.defaultGroup;
};return PSServer;}();var



































PSRoom=function(_PSStreamModel3){_inheritsLoose(PSRoom,_PSStreamModel3);


































function PSRoom(options){var _this4;
_this4=_PSStreamModel3.call(this)||this;_this4.id=void 0;_this4.title="";_this4.type='';_this4.classType='';_this4.location='left';_this4.closable=true;_this4.connected=false;_this4.canConnect=false;_this4.connectWhenLoggedIn=false;_this4.onParentEvent=null;_this4.width=0;_this4.height=0;_this4.parentElem=null;_this4.rightPopup=false;_this4.notifications=[];_this4.isSubtleNotifying=false;
_this4.id=options.id;
if(options.title)_this4.title=options.title;
if(!_this4.title)_this4.title=_this4.id;
if(options.type)_this4.type=options.type;
if(options.location)_this4.location=options.location;
if(options.parentElem)_this4.parentElem=options.parentElem;
if(_this4.location!=='popup'&&_this4.location!=='semimodal-popup')_this4.parentElem=null;
if(options.rightPopup)_this4.rightPopup=true;
if(options.connected)_this4.connected=true;return _this4;
}var _proto5=PSRoom.prototype;_proto5.
notify=function notify(options){
if(options.noAutoDismiss&&!options.id){
throw new Error("Must specify id for manual dismissing");
}
this.notifications.push({
title:options.title,
body:options.body,
id:options.id||'',
noAutoDismiss:options.noAutoDismiss||false
});
PS.update();
};_proto5.
dismissNotification=function dismissNotification(id){
this.notifications=this.notifications.filter(function(notification){return notification.id!==id;});
PS.update();
};_proto5.
autoDismissNotifications=function autoDismissNotifications(){
this.notifications=this.notifications.filter(function(notification){return notification.noAutoDismiss;});
this.isSubtleNotifying=false;
};_proto5.
setDimensions=function setDimensions(width,height){
if(this.width===width&&this.height===height)return;
this.width=width;
this.height=height;
this.update(null);
};_proto5.
connect=function connect(){
throw new Error("This room is not designed to connect to a server room");
};_proto5.
receiveLine=function receiveLine(args){
switch(args[0]){
case'title':{
this.title=args[1];
PS.update();
break;
}case'tempnotify':{
var id=args[1],title=args[2],body=args[3],toHighlight=args[4];
this.notify({title:title,body:body,id:id});
break;
}case'tempnotifyoff':{
var _id=args[1];
this.dismissNotification(_id);
break;
}default:{
if(this.canConnect){
this.update(args);
}else{
throw new Error("This room is not designed to receive messages");
}
}}
};_proto5.
handleMessage=function handleMessage(line){
if(!line.startsWith('/')||line.startsWith('//'))return false;
var spaceIndex=line.indexOf(' ');
var cmd=spaceIndex>=0?line.slice(1,spaceIndex):line.slice(1);

switch(cmd){
case'logout':{
PS.user.logOut();
return true;
}}
return false;
};_proto5.
send=function send(msg,direct){
if(!direct&&!msg)return;
if(!direct&&this.handleMessage(msg))return;

PS.send(this.id+'|'+msg);
};_proto5.
destroy=function destroy(){
if(this.connected){
this.send('/noreply /leave',true);
this.connected=false;
}
};return PSRoom;}(PSStreamModel);var


PlaceholderRoom=function(_PSRoom){_inheritsLoose(PlaceholderRoom,_PSRoom);function PlaceholderRoom(){var _this5;for(var _len2=arguments.length,args=new Array(_len2),_key3=0;_key3<_len2;_key3++){args[_key3]=arguments[_key3];}_this5=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this5.
queue=[];_this5.
classType='placeholder';return _this5;}var _proto6=PlaceholderRoom.prototype;_proto6.
receiveLine=function receiveLine(args){
this.queue.push(args);
};return PlaceholderRoom;}(PSRoom);














var PS=new(function(_PSModel2){_inheritsLoose(_class8,_PSModel2);










































































































function _class8(){var _document$querySelect;var _this6;
_this6=_PSModel2.call(this)||this;_this6.down=false;_this6.prefs=new PSPrefs();_this6.teams=new PSTeams();_this6.user=new PSUser();_this6.server=new PSServer();_this6.connection=null;_this6.connected=false;_this6.isOffline=false;_this6.router=null;_this6.rooms={};_this6.roomTypes={};_this6.leftRoomList=[];_this6.rightRoomList=[];_this6.miniRoomList=[];_this6.popups=[];_this6.leftRoom=null;_this6.rightRoom=null;_this6.room=null;_this6.activePanel=null;_this6.onePanelMode=false;_this6.leftRoomWidth=0;_this6.mainmenu=null;_this6.dragging=null;_this6.arrowKeysUsed=false;_this6.newsHTML=((_document$querySelect=document.querySelector('.news-embed .pm-log'))==null?void 0:_document$querySelect.innerHTML)||'';

_this6.addRoom({
id:'',
title:"Home"
});

_this6.addRoom({
id:'rooms',
title:"Rooms"
});

if(_this6.newsHTML){
_this6.addRoom({
id:'news',
title:"News"
});
}

_this6.updateLayout();
window.addEventListener('resize',function(){return _this6.updateLayout();});return _this6;
}var _proto7=_class8.prototype;_proto7.



















getWidthFor=function getWidthFor(room){
switch(room.type){
case'mainmenu':
return{
minWidth:340,
width:628,
maxWidth:628,
isMainMenu:true
};
case'chat':
case'rooms':
case'battles':
return{
minWidth:320,
width:570,
maxWidth:640
};
case'battle':
return{
minWidth:320,
width:956,
maxWidth:1180
};
}
return{
minWidth:640,
width:640,
maxWidth:640
};
};_proto7.
updateLayout=function updateLayout(alreadyUpdating){
var leftRoomWidth=this.calculateLeftRoomWidth();
var roomHeight=document.body.offsetHeight-56;
var totalWidth=document.body.offsetWidth;
if(leftRoomWidth){
this.leftRoom.width=leftRoomWidth;
this.leftRoom.height=roomHeight;
this.rightRoom.width=totalWidth+1-leftRoomWidth;
this.rightRoom.height=roomHeight;
}else{
this.activePanel.width=totalWidth;
this.activePanel.height=roomHeight;
}

if(this.leftRoomWidth!==leftRoomWidth){
this.leftRoomWidth=leftRoomWidth;
if(!alreadyUpdating)this.update(true);
}
};_proto7.
update=function update(layoutAlreadyUpdated){
if(!layoutAlreadyUpdated)this.updateLayout(true);
_PSModel2.prototype.update.call(this);
};_proto7.
receive=function receive(msg){
msg=msg.endsWith('\n')?msg.slice(0,-1):msg;
var roomid='';
if(msg.startsWith('>')){
var nlIndex=msg.indexOf('\n');
roomid=msg.slice(1,nlIndex);
msg=msg.slice(nlIndex+1);
}
var roomid2=roomid||'lobby';
var room=PS.rooms[roomid];
console.log("\u2705 "+(roomid?'['+roomid+'] ':'')+'%c'+msg,"color: #007700");
var isInit=false;for(var _i4=0,_msg$split2=
msg.split('\n');_i4<_msg$split2.length;_i4++){var line=_msg$split2[_i4];
var args=BattleTextParser.parseLine(line);
switch(args[0]){
case'init':{
isInit=true;
room=PS.rooms[roomid2];
var _type=args[1];
if(!room){
this.addRoom({
id:roomid2,
type:_type,
connected:true
},roomid==='staff'||roomid==='upperstaff');
room=PS.rooms[roomid2];
}else{
room.type=_type;
room.connected=true;
this.updateRoomTypes();
}
this.update();
continue;
}case'deinit':{
room=PS.rooms[roomid2];
if(room){
room.connected=false;
this.removeRoom(room);
}
this.update();
continue;
}case'noinit':{
room=PS.rooms[roomid2];
if(room){
room.connected=false;
if(args[1]==='namerequired'){
room.connectWhenLoggedIn=true;
}
}
this.update();
continue;
}}
if(room)room.receiveLine(args);
}
if(room)room.update(isInit?["initdone"]:null);
};_proto7.
send=function send(fullMsg){
var pipeIndex=fullMsg.indexOf('|');
var roomid=fullMsg.slice(0,pipeIndex);
var msg=fullMsg.slice(pipeIndex+1);
console.log("\u25B6\uFE0F "+(roomid?'['+roomid+'] ':'')+'%c'+msg,"color: #776677");
if(!this.connection){
alert("You are not connected and cannot send "+msg+".");
return;
}
this.connection.send(fullMsg);
};_proto7.
isVisible=function isVisible(room){
if(this.leftRoomWidth===0){

return room===this.room;
}else{

return room===this.rightRoom||room===this.leftRoom;
}
};_proto7.
calculateLeftRoomWidth=function calculateLeftRoomWidth(){


if(!this.leftRoom||!this.rightRoom||this.onePanelMode){
return 0;
}




var left=this.getWidthFor(this.leftRoom);
var right=this.getWidthFor(this.rightRoom);
var available=document.body.offsetWidth;

var excess=available-(left.width+right.width);
if(excess>=0){

var leftStretch=left.maxWidth-left.width;
if(!leftStretch)return left.width;
var rightStretch=right.maxWidth-right.width;
if(leftStretch+rightStretch>=excess)return left.maxWidth;

return left.width+Math.floor(excess*leftStretch/(leftStretch+rightStretch));
}

if(left.isMainMenu){
if(available>=left.minWidth+right.width){
return left.minWidth;
}
return 0;
}

if(available>=left.width+right.minWidth){
return left.width;
}
return 0;
};_proto7.
createRoom=function createRoom(options){

if(!options.type){
var hyphenIndex=options.id.indexOf('-');
switch(hyphenIndex<0?options.id:options.id.slice(0,hyphenIndex+1)){
case'teambuilder':case'ladder':case'battles':case'rooms':
case'options':case'volume':case'teamdropdown':case'formatdropdown':
case'news':
options.type=options.id;
break;
case'battle-':case'user-':case'team-':case'ladder-':
options.type=options.id.slice(0,hyphenIndex);
break;
case'view-':
options.type='html';
break;
case'':
options.type='mainmenu';
break;
default:
options.type='chat';
break;
}
}

if(!options.location){
switch(options.type){
case'rooms':
case'chat':
options.location='right';
break;
case'options':
case'volume':
case'user':
options.location='popup';
break;
case'teamdropdown':
case'formatdropdown':
options.location='semimodal-popup';
break;
case'news':
options.location='mini-window';
break;
}
if(options.id.startsWith('pm-'))options.location='mini-window';
}

var roomType=this.roomTypes[options.type];
if(roomType!=null&&roomType.title)options.title=roomType.title;
var Model=roomType?roomType.Model||PSRoom:PlaceholderRoom;
return new Model(options);
};_proto7.
updateRoomTypes=function updateRoomTypes(){
var updated=false;
for(var _roomid3 in this.rooms){
var room=this.rooms[_roomid3];
if(room.type===room.classType)continue;
var roomType=this.roomTypes[room.type];
if(!roomType)continue;

var options=room;
if(roomType.title)options.title=roomType.title;
var Model=roomType.Model||PSRoom;
var newRoom=new Model(options);
this.rooms[_roomid3]=newRoom;
if(this.leftRoom===room)this.leftRoom=newRoom;
if(this.rightRoom===room)this.rightRoom=newRoom;
if(this.activePanel===room)this.activePanel=newRoom;
if(this.room===room)this.room=newRoom;
if(_roomid3==='')this.mainmenu=newRoom;

if(options.queue){for(var _i6=0,_options$queue2=
options.queue;_i6<_options$queue2.length;_i6++){var args=_options$queue2[_i6];
room.receiveLine(args);
}
}
updated=true;
}
if(updated)this.update();
};_proto7.
focusRoom=function focusRoom(roomid){
if(this.room.id===roomid)return;
if(this.leftRoomList.includes(roomid)){
this.leftRoom=this.rooms[roomid];
this.activePanel=this.leftRoom;
while(this.popups.length)this.leave(this.popups.pop());
this.room=this.leftRoom;
}else if(this.rightRoomList.includes(roomid)){
this.rightRoom=this.rooms[roomid];
this.activePanel=this.rightRoom;
while(this.popups.length)this.leave(this.popups.pop());
this.room=this.rightRoom;
}else if(this.rooms[roomid]){
this.room=this.rooms[roomid];
}else{
return false;
}
this.room.autoDismissNotifications();
this.update();
if(this.room.onParentEvent)this.room.onParentEvent('focus',undefined);
return true;
};_proto7.
focusLeftRoom=function focusLeftRoom(){
var allRooms=this.leftRoomList.concat(this.rightRoomList);
var roomIndex=allRooms.indexOf(this.room.id);
if(roomIndex===-1){

return this.focusRoom('');
}
if(roomIndex===0){
return this.focusRoom(allRooms[allRooms.length-1]);
}
return this.focusRoom(allRooms[roomIndex-1]);
};_proto7.
focusRightRoom=function focusRightRoom(){
var allRooms=this.leftRoomList.concat(this.rightRoomList);
var roomIndex=allRooms.indexOf(this.room.id);
if(roomIndex===-1){

return this.focusRoom('');
}
if(roomIndex===allRooms.length-1){
return this.focusRoom(allRooms[0]);
}
return this.focusRoom(allRooms[roomIndex+1]);
};_proto7.
focusPreview=function focusPreview(room){
if(room!==this.room)return'';
var allRooms=this.leftRoomList.concat(this.rightRoomList);
var roomIndex=allRooms.indexOf(this.room.id);
if(roomIndex===-1){

return'';
}
var buf='  ';
if(roomIndex>1){
var leftRoom=this.rooms[allRooms[roomIndex-1]];
buf+="\u2190 "+leftRoom.title;
}
buf+=this.arrowKeysUsed?" | ":" (use arrow keys) ";
if(roomIndex<allRooms.length-1){
var rightRoom=this.rooms[allRooms[roomIndex+1]];
buf+=rightRoom.title+" \u2192";
}
return buf;
};_proto7.
getPMRoom=function getPMRoom(userid){
var myUserid=PS.user.userid;
var roomid="pm-"+[userid,myUserid].sort().join('-');
if(this.rooms[roomid])return this.rooms[roomid];
this.join(roomid);
return this.rooms[roomid];
};_proto7.
addRoom=function addRoom(options,noFocus){

if(options.id.startsWith('challenge-')){
options.id="pm-"+options.id.slice(10);
options.challengeMenuOpen=true;
}
if(options.id.startsWith('pm-')&&options.id.indexOf('-',3)<0){
var userid1=PS.user.userid;
var userid2=options.id.slice(3);
options.id="pm-"+[userid1,userid2].sort().join('-');
}

if(this.rooms[options.id]){
for(var i=0;i<this.popups.length;i++){
var popup=this.rooms[this.popups[i]];
if(popup.parentElem===options.parentElem){
while(this.popups.length>i){
var popupid=this.popups.pop();
this.leave(popupid);
}
return;
}
}
if(!noFocus){
if(options.challengeMenuOpen){
this.rooms[options.id].openChallenge();
}
this.focusRoom(options.id);
}
return;
}
if(!noFocus){
while(this.popups.length&&this.popups[this.popups.length-1]!==options.parentRoomid){
var _popupid=this.popups.pop();
this.leave(_popupid);
}
}
var room=this.createRoom(options);
this.rooms[room.id]=room;
switch(room.location){
case'left':
this.leftRoomList.push(room.id);
if(!noFocus)this.leftRoom=room;
break;
case'right':
this.rightRoomList.push(room.id);
if(this.rightRoomList[this.rightRoomList.length-2]==='rooms'){
this.rightRoomList.splice(-2,1);
this.rightRoomList.push('rooms');
}
if(!noFocus||!this.rightRoom)this.rightRoom=room;
break;
case'mini-window':
this.miniRoomList.push(room.id);
break;
case'popup':
case'semimodal-popup':
case'modal-popup':
this.popups.push(room.id);
break;
}
if(!noFocus){
if(!this.popups.length)this.activePanel=room;
this.room=room;
}
if(options.queue){for(var _i8=0,_options$queue4=
options.queue;_i8<_options$queue4.length;_i8++){var args=_options$queue4[_i8];
room.receiveLine(args);
}
}
return room;
};_proto7.
removeRoom=function removeRoom(room){
room.destroy();
delete PS.rooms[room.id];

var leftRoomIndex=PS.leftRoomList.indexOf(room.id);
if(leftRoomIndex>=0){
PS.leftRoomList.splice(leftRoomIndex,1);
}
if(PS.leftRoom===room){
PS.leftRoom=this.mainmenu;
if(PS.activePanel===room)PS.activePanel=this.mainmenu;
if(PS.room===room)PS.room=this.mainmenu;
}

var rightRoomIndex=PS.rightRoomList.indexOf(room.id);
if(rightRoomIndex>=0){
PS.rightRoomList.splice(rightRoomIndex,1);
}
if(PS.rightRoom===room){
var newRightRoomid=PS.rightRoomList[rightRoomIndex]||PS.rightRoomList[rightRoomIndex-1];
PS.rightRoom=newRightRoomid?PS.rooms[newRightRoomid]:null;
if(PS.activePanel===room)PS.activePanel=PS.rightRoom||PS.leftRoom;
if(PS.room===room)PS.room=PS.activePanel;
}

if(room.location==='mini-window'){
var miniRoomIndex=PS.miniRoomList.indexOf(room.id);
if(miniRoomIndex>=0){
PS.miniRoomList.splice(miniRoomIndex,1);
}
}

if(this.popups.length&&room.id===this.popups[this.popups.length-1]){
this.popups.pop();
PS.room=this.popups.length?PS.rooms[this.popups[this.popups.length-1]]:PS.activePanel;
}

this.update();
};_proto7.
closePopup=function closePopup(skipUpdate){
if(!this.popups.length)return;
this.leave(this.popups[this.popups.length-1]);
if(!skipUpdate)this.update();
};_proto7.
join=function join(roomid,side,noFocus){
if(this.room.id===roomid)return;
this.addRoom({id:roomid,side:side},noFocus);
this.update();
};_proto7.
leave=function leave(roomid){
var room=PS.rooms[roomid];
if(room)this.removeRoom(room);
};return _class8;}(PSModel))(
);
//# sourceMappingURL=client-main.js.map