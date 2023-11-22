function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Panels
 *
 * Main view - sets up the frame, and the generic panels.
 *
 * Also sets up most global event listeners.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

PSRouter=function(){


function PSRouter(){this.roomid='';this.panelState='';
var currentRoomid=location.pathname.slice(1);
if(/^[a-z0-9-]+$/.test(currentRoomid)){
this.subscribeHistory();
}else if(location.pathname.endsWith('.html')){
this.subscribeHash();
}
}var _proto=PSRouter.prototype;_proto.
extractRoomID=function extractRoomID(url){
if(url.startsWith(document.location.origin)){
url=url.slice(document.location.origin.length);
}else{
if(url.startsWith('http://')){
url=url.slice(7);
}else if(url.startsWith('https://')){
url=url.slice(8);
}
if(url.startsWith(document.location.host)){
url=url.slice(document.location.host.length);
}else if(PS.server.id==='showdown'&&url.startsWith('play.pokemonshowdown.com')){
url=url.slice(24);
}else if(PS.server.id==='showdown'&&url.startsWith('psim.us')){
url=url.slice(7);
}else if(url.startsWith('replay.pokemonshowdown.com')){
url=url.slice(26).replace('/','/battle-');
}
}
if(url.startsWith('/'))url=url.slice(1);

if(!/^[a-z0-9-]*$/.test(url))return null;

var redirects=/^(appeals?|rooms?suggestions?|suggestions?|adminrequests?|bugs?|bugreports?|rules?|faq|credits?|privacy|contact|dex|insecure)$/;
if(redirects.test(url))return null;

return url;
};_proto.
subscribeHash=function subscribeHash(){
if(location.hash){
var currentRoomid=location.hash.slice(1);
if(/^[a-z0-9-]+$/.test(currentRoomid)){
PS.join(currentRoomid);
}else{
return;
}
}
PS.subscribeAndRun(function(){
var roomid=PS.room.id;
location.hash=roomid?'#'+roomid:'';
});
window.addEventListener('hashchange',function(e){
var possibleRoomid=location.hash.slice(1);
var currentRoomid=null;
if(/^[a-z0-9-]*$/.test(possibleRoomid)){
currentRoomid=possibleRoomid;
}
if(currentRoomid!==null){
PS.join(currentRoomid);
}
});
};_proto.
subscribeHistory=function subscribeHistory(){var _this=this;
var currentRoomid=location.pathname.slice(1);
if(/^[a-z0-9-]+$/.test(currentRoomid)){
PS.join(currentRoomid);
}else{
return;
}
if(!window.history)return;
PS.subscribeAndRun(function(){
var room=PS.room;
var roomid=room.id;
var panelState=PS.leftRoomWidth?
PS.leftRoom.id+'..'+PS.rightRoom.id:
roomid;
if(roomid===_this.roomid&&panelState===_this.panelState){
return;
}
if(panelState===_this.panelState){
history.pushState(panelState,room.title,'/'+roomid);
}else{
history.replaceState(panelState,room.title,'/'+roomid);
}
_this.roomid=roomid;
_this.panelState=panelState;
});
window.addEventListener('popstate',function(e){
var possibleRoomid=location.pathname.slice(1);
var roomid=null;
if(/^[a-z0-9-]*$/.test(possibleRoomid)){
roomid=possibleRoomid;
}
if(typeof e.state==='string'){
var _ref=e.state.split('..'),leftRoomid=_ref[0],rightRoomid=_ref[1];
PS.join(leftRoomid,'left');
if(rightRoomid){
PS.join(rightRoomid,'right');
}
}
if(roomid!==null){
PS.join(roomid);
}
});
};return PSRouter;}();

PS.router=new PSRouter();var

PSRoomPanel=function(_preact$Component){_inheritsLoose(PSRoomPanel,_preact$Component);function PSRoomPanel(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this2.
subscriptions=[];return _this2;}var _proto2=PSRoomPanel.prototype;_proto2.
componentDidMount=function componentDidMount(){var _this3=this;
if(PS.room===this.props.room)this.focus();
this.props.room.onParentEvent=function(id,e){
if(id==='focus')_this3.focus();
};
this.subscriptions.push(this.props.room.subscribe(function(args){
if(!args)_this3.forceUpdate();else
_this3.receiveLine(args);
}));
if(this.base){
this.props.room.setDimensions(this.base.offsetWidth,this.base.offsetHeight);
}
};_proto2.
componentDidUpdate=function componentDidUpdate(){
if(this.base&&['popup','semimodal-popup'].includes(this.props.room.location)){
this.props.room.setDimensions(this.base.offsetWidth,this.base.offsetHeight);
}
};_proto2.
componentWillUnmount=function componentWillUnmount(){
this.props.room.onParentEvent=null;for(var _i2=0,_this$subscriptions2=
this.subscriptions;_i2<_this$subscriptions2.length;_i2++){var subscription=_this$subscriptions2[_i2];
subscription.unsubscribe();
}
this.subscriptions=[];
};_proto2.
receiveLine=function receiveLine(args){};_proto2.





chooseParentValue=function chooseParentValue(value){
var dropdownButton=this.props.room.parentElem;
dropdownButton.value=value;
var changeEvent=new Event('change');
dropdownButton.dispatchEvent(changeEvent);
PS.closePopup();
};_proto2.
focus=function focus(){};_proto2.
render=function render(){
return preact.h(PSPanelWrapper,{room:this.props.room},
preact.h("div",{"class":"mainmessage"},preact.h("p",null,"Loading..."))
);
};return PSRoomPanel;}(preact.Component);


function PSPanelWrapper(props)

{
var room=props.room;
if(room.location==='mini-window'){
if(room.id==='news'){
return preact.h("div",null,props.children);
}
return preact.h("div",{id:"room-"+room.id,"class":"mini-window-contents ps-room-light"},props.children);
}
if(room.location!=='left'&&room.location!=='right'){
var _style=PSMain.getPopupStyle(room,props.width);
return preact.h("div",{"class":"ps-popup",id:"room-"+room.id,style:_style},
props.children
);
}
var style=PSMain.posStyle(room);
return preact.h("div",{
"class":'ps-room'+(room.id===''?'':' ps-room-light')+(props.scrollable?' scrollable':''),
id:"room-"+room.id,
style:style},

props.children
);
}var

PSMain=function(_preact$Component2){_inheritsLoose(PSMain,_preact$Component2);
function PSMain(){var _this4;
_this4=_preact$Component2.call(this)||this;
PS.subscribe(function(){return _this4.forceUpdate();});

window.addEventListener('click',function(e){var _elem;
var elem=e.target;
if(((_elem=elem)==null?void 0:_elem.className)==='ps-overlay'){
PS.closePopup();
e.preventDefault();
e.stopImmediatePropagation();
return;
}
var clickedRoom=null;
while(elem){
if((" "+elem.className+" ").includes(' username ')){
var name=elem.getAttribute('data-name');
var userid=toID(name);
var roomid="user-"+userid;
PS.addRoom({
id:roomid,
parentElem:elem,
parentRoomid:PSMain.containingRoomid(elem),
rightPopup:elem.className==='userbutton username',
username:name
});
PS.update();
e.preventDefault();
e.stopImmediatePropagation();
return;
}
if(elem.tagName==='A'||elem.getAttribute('data-href')){
var href=elem.getAttribute('data-href')||elem.href;
var _roomid=PS.router.extractRoomID(href);

if(_roomid!==null){
if(elem.getAttribute('data-target')==='replace'){
var room=_this4.getRoom(elem);
if(room)PS.leave(room.id);
}
PS.addRoom({
id:_roomid,
parentElem:elem
});
PS.update();
e.preventDefault();
e.stopImmediatePropagation();
}
return;
}
if(elem.tagName==='BUTTON'){
if(_this4.handleButtonClick(elem)){
e.preventDefault();
e.stopImmediatePropagation();
return;
}else if(!elem.getAttribute('type')){






e.preventDefault();
}else{

return;
}
}
if(elem.id.startsWith('room-')){
clickedRoom=PS.rooms[elem.id.slice(5)];
break;
}
elem=elem.parentElement;
}
if(PS.room!==clickedRoom){
if(clickedRoom)PS.room=clickedRoom;
while(PS.popups.length&&(!clickedRoom||clickedRoom.id!==PS.popups[PS.popups.length-1])){
PS.closePopup();
}
PS.update();
}
});

window.addEventListener('keydown',function(e){
var elem=e.target;
if(elem){
var isTextInput=elem.tagName==='INPUT'||elem.tagName==='TEXTAREA';
if(isTextInput&&['button','radio','checkbox','file'].includes(elem.type)){
isTextInput=false;
}
if(isTextInput&&elem.value){
return;
}
}
if(PS.room.onParentEvent){
if(PS.room.onParentEvent('keydown',e)===false){
e.stopImmediatePropagation();
e.preventDefault();
return;
}
}
var modifierKey=e.ctrlKey||e.altKey||e.metaKey||e.shiftKey;
if(modifierKey)return;
if(e.keyCode===37){
PS.arrowKeysUsed=true;
PS.focusLeftRoom();
}else if(e.keyCode===39){
PS.arrowKeysUsed=true;
PS.focusRightRoom();
}
});

var colorSchemeQuery=window.matchMedia==null?void 0:window.matchMedia('(prefers-color-scheme: dark)');
if((colorSchemeQuery==null?void 0:colorSchemeQuery.media)!=='not all'){
colorSchemeQuery.addEventListener('change',function(cs){
if(PS.prefs.theme==='system')document.body.className=cs.matches?'dark':'';
});
}

PS.prefs.subscribeAndRun(function(key){
if(!key||key==='theme'){
var dark=PS.prefs.theme==='dark'||
PS.prefs.theme==='system'&&colorSchemeQuery&&colorSchemeQuery.matches;
document.body.className=dark?'dark':'';
}
});return _this4;
}var _proto3=PSMain.prototype;_proto3.
getRoom=function getRoom(elem){
var curElem=elem;
while(curElem){
if(curElem.id.startsWith('room-')){
return PS.rooms[curElem.id.slice(5)];
}
curElem=curElem.parentElement;
}
};_proto3.
handleButtonClick=function handleButtonClick(elem){
switch(elem.name){
case'closeRoom':
PS.leave(elem.value);
return true;
case'joinRoom':
PS.addRoom({
id:elem.value,
parentElem:elem
});
PS.update();
return true;
case'send':
case'cmd':
var room=this.getRoom(elem)||PS.mainmenu;
room.send(elem.value,elem.name==='send');
return true;
}
return false;
};PSMain.
containingRoomid=function containingRoomid(elem){
var curElem=elem;
while(curElem){
if(curElem.id.startsWith('room-')){
return curElem.id.slice(5);
}
curElem=curElem.parentElement;
}
return null;
};PSMain.
isEmptyClick=function isEmptyClick(e){
try{
var selection=window.getSelection();
if(selection.type==='Range')return false;
}catch(err){}
BattleTooltips.hideTooltip();
};PSMain.
posStyle=function posStyle(room){
var pos=null;
if(PS.leftRoomWidth===0){

if(room===PS.activePanel)pos={top:56};
}else{

if(room===PS.leftRoom)pos={top:56,right:PS.leftRoomWidth};
if(room===PS.rightRoom)pos={top:56,left:PS.leftRoomWidth};
}

if(!pos)return{display:'none'};

var top=pos.top||0;
var height=null;
var bottom=pos.bottom||0;
if(bottom>0||top<0){
height=bottom-top;
if(height<0)throw new RangeError("Invalid pos range");
if(top<0)top=null;else
bottom=null;
}

var left=pos.left||0;
var width=null;
var right=pos.right||0;
if(right>0||left<0){
width=right-left-1;
if(width<0)throw new RangeError("Invalid pos range");
if(left<0)left=null;else
right=null;
}

return{
display:'block',
top:top===null?"auto":top+"px",
height:height===null?"auto":height+"px",
bottom:bottom===null?"auto":-bottom+"px",
left:left===null?"auto":left+"px",
width:width===null?"auto":width+"px",
right:right===null?"auto":-right+"px"
};
};PSMain.
getPopupStyle=function getPopupStyle(room,width){
if(room.location==='modal-popup'||!room.parentElem){
return{width:width||480};
}
if(!room.width||!room.height){
return{
position:'absolute',
visibility:'hidden',
margin:0,
top:0,
left:0
};
}

var style={
position:'absolute',
margin:0
};
var offset=room.parentElem.getBoundingClientRect();
var sourceWidth=offset.width;
var sourceHeight=offset.height;

var availableHeight=document.documentElement.clientHeight;
var height=room.height;
width=width||room.width;

if(room.rightPopup){

if(availableHeight>offset.top+height+5&&(
offset.top<availableHeight*2/3||offset.top+200<availableHeight)){
style.top=offset.top;
}else if(offset.top+sourceHeight>=height){
style.bottom=Math.max(availableHeight-offset.top-sourceHeight,0);
}else{
style.top=Math.max(0,availableHeight-height);
}
var offsetLeft=offset.left+sourceWidth;
if(width!=='auto'&&offsetLeft+width>document.documentElement.clientWidth){
style.right=1;
}else{
style.left=offsetLeft;
}

}else{

if(availableHeight>offset.top+sourceHeight+height+5&&(
offset.top+sourceHeight<availableHeight*2/3||offset.top+sourceHeight+200<availableHeight)){
style.top=offset.top+sourceHeight;
}else if(height+5<=offset.top){
style.bottom=Math.max(availableHeight-offset.top,0);
}else if(height+10<availableHeight){
style.bottom=5;
}else{
style.top=0;
}

var availableWidth=document.documentElement.clientWidth-offset.left;
if(width!=='auto'&&availableWidth<width+10){
style.right=10;
}else{
style.left=offset.left;
}

}

if(width)style.maxWidth=width;

return style;
};_proto3.
renderRoom=function renderRoom(room){
var roomType=PS.roomTypes[room.type];
var Panel=roomType?roomType.Component:PSRoomPanel;
return preact.h(Panel,{key:room.id,room:room});
};_proto3.
renderPopup=function renderPopup(room){
var roomType=PS.roomTypes[room.type];
var Panel=roomType?roomType.Component:PSRoomPanel;
if(room.location==='popup'&&room.parentElem){
return preact.h(Panel,{key:room.id,room:room});
}
return preact.h("div",{key:room.id,"class":"ps-overlay"},
preact.h(Panel,{room:room})
);
};_proto3.
render=function render(){var _this5=this;
var rooms=[];
for(var roomid in PS.rooms){
var room=PS.rooms[roomid];
if(room.location==='left'||room.location==='right'){
rooms.push(this.renderRoom(room));
}
}
return preact.h("div",{"class":"ps-frame"},
preact.h(PSHeader,{style:{top:0,left:0,right:0,height:'50px'}}),
rooms,
PS.popups.map(function(roomid){return _this5.renderPopup(PS.rooms[roomid]);})
);
};return PSMain;}(preact.Component);




function SanitizedHTML(props){
return preact.h("div",{dangerouslySetInnerHTML:{__html:BattleLog.sanitizeHTML(props.children)}});
}
//# sourceMappingURL=panels.js.map