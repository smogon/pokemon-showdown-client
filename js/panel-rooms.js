function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Room-list panel (default right-panel)
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

RoomsRoom=function(_PSRoom){_inheritsLoose(RoomsRoom,_PSRoom);

function RoomsRoom(options){var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='rooms';
PS.send("|/cmd rooms");return _this;
}return RoomsRoom;}(PSRoom);var


RoomsPanel=function(_PSRoomPanel){_inheritsLoose(RoomsPanel,_PSRoomPanel);function RoomsPanel(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this2.
hidden=false;_this2.
search='';_this2.
lastKeyCode=0;_this2.






hide=function(){
_this2.hidden=true;
PS.rightRoom=null;
PS.room=PS.leftRoom;
_this2.forceUpdate();
PS.update();
};_this2.
changeSearch=function(e){
var target=e.currentTarget;
if(target.selectionStart!==target.selectionEnd)return;
_this2.search=target.value;
_this2.forceUpdate();
};_this2.
keyDownSearch=function(e){
_this2.lastKeyCode=e.keyCode;
if(e.keyCode===13){
var target=e.currentTarget;
var value=target.value;
var arrowIndex=value.indexOf(" \u21D2 ");
if(arrowIndex>=0)value=value.slice(arrowIndex+3);
if(!/^[a-z0-9-]$/.test(value))value=toID(value);

e.preventDefault();
e.stopImmediatePropagation();
target.value='';

PS.join(value);
}
};return _this2;}var _proto=RoomsPanel.prototype;_proto.componentDidMount=function componentDidMount(){_PSRoomPanel.prototype.componentDidMount.call(this);this.subscriptions.push(PS.user.subscribe(function(){if(PS.user.named)PS.send("|/cmd rooms");}));};_proto.
runSearch=function runSearch(){
var searchid=toID(this.search);
var exactMatch=false;

var rooms=PS.mainmenu.roomsCache;
var roomList=[].concat(rooms.chat||[]);for(var _i2=0,_roomList2=
roomList;_i2<_roomList2.length;_i2++){var room=_roomList2[_i2];
if(!room.subRooms)continue;for(var _i4=0,_room$subRooms2=
room.subRooms;_i4<_room$subRooms2.length;_i4++){var title=_room$subRooms2[_i4];
roomList.push({
title:title,
desc:"Subroom of "+room.title
});
}
}

var start=roomList.filter(function(room){
var titleid=toID(room.title);
if(titleid===searchid)exactMatch=true;
return titleid.startsWith(searchid)||
toID(room.title.replace(/^The /,'')).startsWith(searchid);
});
roomList=roomList.filter(function(room){return!start.includes(room);});

var abbr=roomList.filter(function(room){return(
toID(room.title.toLowerCase().replace(/\b([a-z0-9])[a-z0-9]*\b/g,'$1')).startsWith(searchid)||
room.title.replace(/[^A-Z0-9]+/g,'').toLowerCase().startsWith(searchid));}
);

var hidden=!exactMatch?[{title:this.search,desc:"(Private room?)"}]:[];

var autoFill=this.lastKeyCode!==127&&this.lastKeyCode>=32;
if(autoFill){
var firstTitle=(start[0]||abbr[0]||hidden[0]).title;
var firstTitleOffset=0;
while(
searchid!==toID(firstTitle.slice(0,firstTitleOffset))&&
firstTitleOffset<firstTitle.length)
{
firstTitleOffset++;
}
var autoFillValue=firstTitle.slice(firstTitleOffset);
if(!autoFillValue&&toID(firstTitle)!==searchid){
autoFillValue=" \u21D2 "+firstTitle;
}
var oldSearch=this.search;
var searchElem=this.base.querySelector('input[type=search]');
searchElem.value=oldSearch+autoFillValue;
searchElem.setSelectionRange(oldSearch.length,oldSearch.length+autoFillValue.length);
}

return{start:start,abbr:abbr,hidden:hidden};
};_proto.
focus=function focus(){
this.base.querySelector('input[type=search]').focus();
};_proto.
render=function render(){
if(this.hidden&&PS.isVisible(this.props.room))this.hidden=false;
if(this.hidden){
return preact.h(PSPanelWrapper,{room:this.props.room,scrollable:true},null);
}
var rooms=PS.mainmenu.roomsCache;

var roomList;
if(this.search){
var search=this.runSearch();
roomList=[
this.renderRoomList("Search results",search.start),
this.renderRoomList("Search results (acronym)",search.abbr),
this.renderRoomList("Possible hidden room",search.hidden)];

}else{
roomList=[
this.renderRoomList("Chat rooms",rooms.chat)];

}

return preact.h(PSPanelWrapper,{room:this.props.room,scrollable:true},preact.h("div",{"class":"pad"},
preact.h("button",{"class":"button",style:"float:right;font-size:10pt;margin-top:3px",onClick:this.hide},
preact.h("i",{"class":"fa fa-caret-right"})," Hide"
),
preact.h("div",{"class":"roomcounters"},
preact.h("button",{"class":"button","data-href":"/users",title:"Find an online user"},
preact.h("span",{
"class":"pixelated usercount",
title:"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms."}
),
preact.h("strong",null,rooms.userCount||'-')," users online"
)," ",
preact.h("button",{"class":"button","data-href":"/battles",title:"Watch an active battle"},
preact.h("span",{
"class":"pixelated battlecount",
title:"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles."}
),
preact.h("strong",null,rooms.battleCount||'-')," active battles"
)
),
preact.h("div",null,
preact.h("input",{
type:"search",name:"roomsearch","class":"textbox",style:"width: 100%; max-width: 480px",
placeholder:"Join or search for rooms",
onInput:this.changeSearch,onKeyDown:this.keyDownSearch}
)
),
PS.isOffline?preact.h("h2",null,"(offline)"):rooms.userCount===undefined&&preact.h("h2",null,"Connecting..."),
roomList
));
};_proto.
renderRoomList=function renderRoomList(title,rooms){
if(!rooms||!rooms.length)return null;

var sortedRooms=rooms.sort(function(a,b){return(b.userCount||0)-(a.userCount||0);});
return preact.h("div",{"class":"roomlist"},
preact.h("h2",null,title),
sortedRooms.map(function(roomInfo){return preact.h("div",null,
preact.h("a",{href:"/"+toID(roomInfo.title),"class":"blocklink"},
roomInfo.userCount!==undefined&&preact.h("small",{style:"float:right"},"(",roomInfo.userCount," users)"),
preact.h("strong",null,preact.h("i",{"class":"fa fa-comment-o"})," ",roomInfo.title,preact.h("br",null)),
preact.h("small",null,roomInfo.desc||''),
roomInfo.subRooms&&preact.h("small",null,preact.h("br",null),
preact.h("i",{"class":"fa fa-level-up fa-rotate-90"})," Subrooms: ",preact.h("strong",null,
roomInfo.subRooms.map(function(roomName,i){return[
preact.h("i",{"class":"fa fa-comment-o"})," "+roomName+(i===roomInfo.subRooms.length-1?"":", ")];}
)
)
)
)
);})
);
};return RoomsPanel;}(PSRoomPanel);


PS.roomTypes['rooms']={
Model:RoomsRoom,
Component:RoomsPanel
};
PS.updateRoomTypes();
//# sourceMappingURL=panel-rooms.js.map