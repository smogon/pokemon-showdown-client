function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;subClass.__proto__=superClass;}/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

ChatRoom=function(_PSRoom){_inheritsLoose(ChatRoom,_PSRoom);

function ChatRoom(options){var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='chat';
if(!_this.connected&&PS.connected){
PS.send("|/join "+_this.id);
_this.connected=true;
}return _this;
}var _proto=ChatRoom.prototype;_proto.
receive=function receive(line){
this.update(line);
};return ChatRoom;}(PSRoom);var


ChatPanel=function(_preact$Component){_inheritsLoose(ChatPanel,_preact$Component);function ChatPanel(){return _preact$Component.apply(this,arguments)||this;}var _proto2=ChatPanel.prototype;_proto2.
render=function render(){
return preact.h("div",{"class":"ps-room ps-room-light scrollabel",id:"room-"+this.props.room.id,style:this.props.style},
preact.h("div",{"class":"tournament-wrapper hasuserlist"}),
preact.h("div",{"class":"chat-log hasuserlist"},
preact.h(ChatLog,{room:this.props.room})),

preact.h("div",{"class":"chat-log-add hasuserlist"}),
preact.h("ul",{"class":"userlist"}));

};return ChatPanel;}(preact.Component);var


ChatLog=function(_preact$Component2){_inheritsLoose(ChatLog,_preact$Component2);function ChatLog(){return _preact$Component2.apply(this,arguments)||this;}var _proto3=ChatLog.prototype;_proto3.
componentDidMount=function componentDidMount(){var _this2=this;
this.props.room.subscribe(function(msg){
if(!msg)return;
preact.render(preact.h("div",{"class":"chat"},msg),_this2.base);
});
};_proto3.
shouldComponentUpdate=function shouldComponentUpdate(){
return false;
};_proto3.
render=function render(){
return preact.h("div",{"class":"inner",role:"log"});
};return ChatLog;}(preact.Component);


PS.roomTypes['chat']={
Model:ChatRoom,
Component:ChatPanel};

PS.updateRoomTypes();