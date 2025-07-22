"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var








ResourceRoom=function(_PSRoom){



function ResourceRoom(options){var _this;
_this=_PSRoom.call(this,options)||this;_this.classType='resources';_this.canConnect=false;
_this.title='Resources';return _this;
}_inheritsLoose(ResourceRoom,_PSRoom);var _proto=ResourceRoom.prototype;_proto.
connect=function connect(){};return ResourceRoom;}(PSRoom);var


ResourcePanel=function(_PSRoomPanel){function ResourcePanel(){var _this2;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this2=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this2.






state={search:''};return _this2;}_inheritsLoose(ResourcePanel,_PSRoomPanel);var _proto2=ResourcePanel.prototype;_proto2.
receiveLine=function receiveLine(){};_proto2.
render=function render(){var _this3=this;
var room=this.props.room;
return preact.h(PSPanelWrapper,{room:room,scrollable:true},
preact.h("div",{className:"pad"},
preact.h("h2",null,"PS! Informational Resources"),
preact.h("hr",null),
preact.h("p",null,"PS! is a wide and varied site, with more facets than can be covered here easily.",

preact.h("br",null),"While this page chiefly documents the ever-shifting set of commands available to PS! users, here are some useful resources for newcomers:"

),
preact.h("ul",null,
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/forums/threads/3676132/"},"Beginner's Guide to Pok\xE9mon Showdown")
),
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/dp/articles/intro_comp_pokemon"},"An introduction to competitive Pok\xE9mon")
),
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/sm/articles/sm_tiers"},"What do 'OU', 'UU', etc mean?")
),
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/dex/ss/formats/"},"What are the rules for each format?")
),
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/ss/articles/clauses"},"What is 'Sleep Clause' and other clauses?")
),
preact.h("li",null,
preact.h("a",{href:"https://www.smogon.com/articles/getting-started"},"Next Steps for Competitive Battling")
),
preact.h("li",null,
preact.h("button",{className:"button","data-cmd":"/report"},"Report a user")
),
preact.h("li",null,
preact.h("button",{className:"button","data-cmd":"/join help"},"Join the Help room for live help")
)
),
preact.h("hr",null),
preact.h("strong",null,"Commands:"),
preact.h("p",null,"Within any of the chats, and in private messages, it is possible to type in commands (messages beginning with ",
preact.h("code",null,"/"),") to perform a particular action. A great number of these commands exist, with some only available to certain users. For instance, you can broadcast commands to others with the ",preact.h("code",null,"!")," prefix, but only when you're a player in a battle or a Voice (+) user.",
preact.h("br",null),"For more information on ranks, type ",
preact.h("code",null,"/groups")," in any chat. You can also use the \"chat self\" button on your username in the top right if you need a place to send these commands without joining a room."
),

preact.h("details",{className:"readmore"},
preact.h("summary",null,"Here's a list of the most useful commands for the average Pok\xE9mon Showdown experience:"),
preact.h("p",null,"COMMANDS: /report, /msg, /reply, /logout, /challenge, /search, /rating, /whois, /user, /join, /leave, /userauth, /roomauth"),
preact.h("p",null,"BATTLE ROOM COMMANDS: /savereplay, /hideroom, /inviteonly, /invite, /timer, /forfeit"),
preact.h("p",null,"OPTION COMMANDS: /nick, /avatar, /ignore, /status, /away, /busy, /back, /timestamps, /highlight, /showjoins, /hidejoins, /blockchallenges, /blockpms"),
preact.h("p",null,"INFORMATIONAL/RESOURCE COMMANDS: /groups, /faq, /rules, /intro, /formatshelp, /othermetas, /analysis, /punishments, /calc, /git, /cap, /roomhelp, /roomfaq (replace / with ! to broadcast. Broadcasting requires: + % @ # ~)"),
preact.h("p",null,"DATA COMMANDS: /data, /dexsearch, /movesearch, /itemsearch, /learn, /statcalc, /effectiveness, /weakness, /coverage, /randommove, /randompokemon (replace / with ! to broadcast. Broadcasting requires: + % @ # ~)"),
preact.h("p",null,"For an overview of room commands, use ",preact.h("code",null,"/roomhelp")),
preact.h("p",null,"For details of a specific command, you can use ",preact.h("code",null,"/help [command]"),", for example ",preact.h("code",null,"/help data"),".")
),

preact.h("br",null),
preact.h("p",null,"A complete list of commands available to regular users is provided below. Use ",preact.h("code",null,"/help [commandname]")," for more in-depth information on how to use them."),
preact.h("hr",null),
preact.h("label",{"for":"search"},"Search/filter commands:"),' ',
preact.h("input",{
name:"search",
placeholder:"search",
style:{width:'25%'},
value:this.state.search,
onChange:function(e){var _e$target;return _this3.setState({search:toID((_e$target=e.target)==null?void 0:_e$target.value)});}}
),
preact.h("br",null),
preact.h("span",null,this.getCommandList())
)
);
};_proto2.
getCommandList=function getCommandList(){
var buf=[];
var search=this.state.search;
var keys=Object.keys(BattleChatCommands).sort(function(a,b){

if(b.endsWith('info'))return 2;

if(b.includes('chat-commands'))return 1;
var aCount=BattleChatCommands[a].filter(function(x){return toID(x).includes(search);}).length;
var bCount=BattleChatCommands[b].filter(function(x){return toID(x).includes(search);}).length;

return bCount-aCount||a.localeCompare(b);
}).filter(function(plugin){return!plugin.endsWith('admin');});for(var _i2=0;_i2<

keys.length;_i2++){var pluginName=keys[_i2];
var cmdTable=BattleChatCommands[pluginName];
if(!cmdTable.length)continue;
if(pluginName.startsWith('chat-plugins')){
pluginName='Chat plugin: '+pluginName.split('/').slice(1).join('/');
}else if(pluginName.startsWith('chat-commands')){
pluginName='Core commands: '+pluginName.split('/').slice(1).join('/');;
}
var matchedCmds=[];for(var _i4=0;_i4<
cmdTable.length;_i4++){var cmd=cmdTable[_i4];
if(search.length&&!toID(cmd).includes(search)){
continue;
}
matchedCmds.push(preact.h("li",null,cmd));
}

buf.push(
preact.h("details",{"class":"readmore"},
preact.h("summary",null,preact.h("strong",null,pluginName)),
preact.h("ul",null,matchedCmds)
)
);
buf.push(preact.h("br",null));
}
return buf;
};return ResourcePanel;}(PSRoomPanel);ResourcePanel.id='resources';ResourcePanel.routes=['resources'];ResourcePanel.Model=ResourceRoom;ResourcePanel.icon=preact.h("i",{"class":"fa fa-question-circle","aria-hidden":true});ResourcePanel.title='Resources';


PS.addRoomType(ResourcePanel);
//# sourceMappingURL=page-resources.js.map