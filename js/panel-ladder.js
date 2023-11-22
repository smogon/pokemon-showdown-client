var _class2;function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Ladder Panel
 *
 * Panel for ladder formats and associated ladder tables.
 *
 * @author Adam Tran <aviettran@gmail.com>
 * @license MIT
 */var

LadderRoom=function(_PSRoom){_inheritsLoose(LadderRoom,_PSRoom);function LadderRoom(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this.
classType='ladder';_this.
format=_this.id.split('-')[1];_this.
notice=void 0;_this.
searchValue='';_this.
lastSearch='';_this.
loading=false;_this.
error=void 0;_this.
ladderData=void 0;_this.

setNotice=function(notice){
_this.notice=notice;
_this.update(null);
};_this.
setSearchValue=function(searchValue){
_this.searchValue=searchValue;
_this.update(null);
};_this.
setLastSearch=function(lastSearch){
_this.lastSearch=lastSearch;
_this.update(null);
};_this.
setLoading=function(loading){
_this.loading=loading;
_this.update(null);
};_this.
setError=function(error){
_this.loading=false;
_this.error=error.message;
_this.update(null);
};_this.
setLadderData=function(ladderData){
_this.loading=false;
_this.ladderData=ladderData;
_this.update(null);
};_this.
requestLadderData=function(searchValue){
var _PS=PS,teams=_PS.teams;
if(teams.usesLocalLadder){
_this.send("/cmd laddertop "+_this.format+" "+toID(_this.searchValue));
}else if(_this.format!==undefined){
Net('/ladder.php').
get({
query:{
format:_this.format,
server:PS.server.id,
output:'html',
prefix:toID(searchValue)
}
}).
then(_this.setLadderData)["catch"](
_this.setError);
}
_this.setLoading(true);
};return _this;}return LadderRoom;}(PSRoom);


function LadderFormat(props){
var room=props.room;
var
format=

room.format,searchValue=room.searchValue,lastSearch=room.lastSearch,loading=room.loading,error=room.error,ladderData=room.ladderData,setSearchValue=room.setSearchValue,setLastSearch=room.setLastSearch,requestLadderData=room.requestLadderData;
if(format===undefined)return null;

var changeSearch=function(e){
setSearchValue(e.currentTarget.value);
};
var submitSearch=function(e){
e.preventDefault();
setLastSearch(room.searchValue);
requestLadderData(room.searchValue);
};
var RenderHeader=function(){
if(!PS.teams.usesLocalLadder){
return preact.h("h3",null,
BattleLog.escapeFormat(format)," Top"," ",
BattleLog.escapeHTML(lastSearch?"- '"+lastSearch+"'":"500")
);
}
return null;
};
var RenderSearch=function(){
if(!PS.teams.usesLocalLadder){
return preact.h("form",{"class":"search",onSubmit:submitSearch},
preact.h("input",{
type:"text",
name:"searchValue",
"class":"textbox searchinput",
value:BattleLog.escapeHTML(searchValue),
placeholder:"username prefix",
onChange:changeSearch}
),
preact.h("button",{type:"submit"}," Search")
);
}
return null;
};
var RenderFormat=function(){
if(loading||!BattleFormats){
return preact.h("p",null,"Loading...");
}else if(error!==undefined){
return preact.h("p",null,"Error: ",error);
}else if(BattleFormats[format]===undefined){
return preact.h("p",null,"Format ",format," not found.");
}else if(ladderData===undefined){
return null;
}
return preact.h(preact.Fragment,null,
preact.h("p",null,
preact.h("button",{"class":"button","data-href":"ladder","data-target":"replace"},
preact.h("i",{"class":"fa fa-refresh"})," Refresh"
),
preact.h(RenderSearch,null)
),
preact.h(RenderHeader,null),
preact.h(SanitizedHTML,null,ladderData)
);
};
return preact.h("div",{"class":"ladder pad"},
preact.h("p",null,
preact.h("button",{"class":"button","data-href":"ladder","data-target":"replace"},
preact.h("i",{"class":"fa fa-chevron-left"})," Format List"
)
),
preact.h(RenderFormat,null)
);
}var

LadderPanel=function(_PSRoomPanel){_inheritsLoose(LadderPanel,_PSRoomPanel);function LadderPanel(){return _PSRoomPanel.apply(this,arguments)||this;}var _proto=LadderPanel.prototype;_proto.
componentDidMount=function componentDidMount(){var _this2=this;
var room=this.props.room;

if(BattleFormats&&room.format!==undefined)room.requestLadderData();
this.subscriptions.push(
room.subscribe(function(response){
if(response){
var format=response[0],ladderData=response[1];
if(room.format===format){
if(!ladderData){
room.setError(new Error('No data returned from server.'));
}else{
room.setLadderData(ladderData);
}
}
}
_this2.forceUpdate();
})
);
this.subscriptions.push(
PS.teams.subscribe(function(){
if(room.format!==undefined)room.requestLadderData();
_this2.forceUpdate();
})
);
};_proto.
































































render=function render(){
var room=this.props.room;
return preact.h(PSPanelWrapper,{room:room,scrollable:true},
preact.h("div",{"class":"ladder pad"},
room.format===undefined&&
preact.h(LadderPanel.ShowFormatList,{room:room}),

room.format!==undefined&&preact.h(LadderFormat,{room:room})
)
);
};return LadderPanel;}(PSRoomPanel);_class2=LadderPanel;LadderPanel.Notice=function(props){var notice=props.notice;if(notice){return preact.h("p",null,preact.h("strong",{style:"color:red"},notice));}return null;};LadderPanel.BattleFormatList=function(){if(!BattleFormats){return preact.h("p",null,"Loading...");}var currentSection="";var sections=[];var formats=[];for(var _i2=0,_Object$entries2=Object.entries(BattleFormats);_i2<_Object$entries2.length;_i2++){var _ref=_Object$entries2[_i2];var key=_ref[0];var format=_ref[1];if(!format.rated||!format.searchShow)continue;if(format.section!==currentSection){if(formats.length>0){sections.push(preact.h(preact.Fragment,{key:currentSection},preact.h("h3",null,currentSection),preact.h("ul",{style:"list-style:none;margin:0;padding:0"},formats)));formats=[];}currentSection=format.section;}formats.push(preact.h("li",{key:key,style:"margin:5px"},preact.h("button",{name:"joinRoom",value:"ladder-"+key,"class":"button",style:"width:320px;height:30px;text-align:left;font:12pt Verdana"},BattleLog.escapeFormat(format.id))));}return preact.h(preact.Fragment,null,sections);};LadderPanel.ShowFormatList=function(props){var room=props.room;return preact.h(preact.Fragment,null,preact.h("p",null,preact.h("a",{"class":"button",href:"/"+Config.routes.users+"/",target:"_blank"},"Look up a specific user's rating")),preact.h(_class2.Notice,{notice:room.notice}),preact.h("p",null,preact.h("button",{name:"joinRoom",value:"view-ladderhelp","class":"button"},preact.h("i",{"class":"fa fa-info-circle"})," How the ladder works")),preact.h(_class2.BattleFormatList,null));};


PS.roomTypes['ladder']={
Model:LadderRoom,
Component:LadderPanel
};
PS.updateRoomTypes();
//# sourceMappingURL=panel-ladder.js.map