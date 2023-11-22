function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Page Panel
 *
 * Panel for static content and server-rendered HTML.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */var

PageRoom=function(_PSRoom){_inheritsLoose(PageRoom,_PSRoom);













function PageRoom(options){var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='html';_this.page=_this.id.split("-")[1];_this.canConnect=true;_this.loading=true;_this.htmlData=void 0;_this.setHTMLData=function(htmlData){_this.loading=false;_this.htmlData=htmlData;_this.update(null);};
_this.connect();return _this;
}var _proto=PageRoom.prototype;_proto.
connect=function connect(){
if(!this.connected){
PS.send("|/join "+this.id);
this.connected=true;
this.connectWhenLoggedIn=false;
}
};return PageRoom;}(PSRoom);


function PageLadderHelp(props){
var room=props.room;
return preact.h("div",{"class":"ladder pad"},
preact.h("p",null,
preact.h("button",{name:"selectFormat","data-href":"ladder","data-target":"replace"},
preact.h("i",{"class":"fa fa-chevron-left"})," Format List"
)
),
preact.h("h3",null,"How the ladder works"),
preact.h("p",null,"Our ladder displays three ratings: Elo, GXE, and Glicko-1."

),
preact.h("p",null,
preact.h("strong",null,"Elo")," is the main ladder rating. It's a pretty normal ladder rating: goes up when you win and down when you lose."


),
preact.h("p",null,
preact.h("strong",null,"GXE")," (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player."

),
preact.h("p",null,
preact.h("strong",null,"Glicko-1")," is a different rating system. It has rating and deviation values."

),
preact.h("p",null,"Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill."




)
);
}var

PagePanel=function(_PSRoomPanel){_inheritsLoose(PagePanel,_PSRoomPanel);function PagePanel(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this2.
clientRooms={'ladderhelp':preact.h(PageLadderHelp,{room:_this2.props.room})};return _this2;}var _proto2=PagePanel.prototype;_proto2.




receiveLine=function receiveLine(args){
var room=this.props.room;
switch(args[0]){
case'title':
room.title=args[1];
PS.update();
return true;
case'tempnotify':{
var id=args[1],title=args[2],body=args[3];
room.notify({title:title,body:body,id:id});
return true;
}
case'tempnotifyoff':{
var _id=args[1];
room.dismissNotification(_id);
return true;
}
case'selectorhtml':
var pageHTMLContainer=this.base.querySelector('.page-html-container');
var selectedElement=pageHTMLContainer==null?void 0:pageHTMLContainer.querySelector(args[1]);
if(!selectedElement)return;
selectedElement.innerHTML=BattleLog.sanitizeHTML(args.slice(2).join('|'));
room.isSubtleNotifying=true;
return true;
case'noinit':
if(args[1]==='namerequired'){
room.setHTMLData(args[2]);
}
return true;
case'pagehtml':
room.setHTMLData(args[1]);
return true;
}
};_proto2.
render=function render(){
var room=this.props.room;
var renderPage;
if(room.page!==undefined&&this.clientRooms[room.page]){
renderPage=this.clientRooms[room.page];
}else{
if(room.loading){
renderPage=preact.h("p",null,"Loading...");
}else{
renderPage=preact.h("div",{"class":"page-html-container"},
preact.h(SanitizedHTML,null,room.htmlData||'')
);
}
}
return preact.h(PSPanelWrapper,{room:room,scrollable:true},
renderPage
);
};return PagePanel;}(PSRoomPanel);


PS.roomTypes['html']={
Model:PageRoom,
Component:PagePanel
};
PS.updateRoomTypes();
//# sourceMappingURL=panel-page.js.map