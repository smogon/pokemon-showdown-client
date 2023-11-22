function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Teambuilder panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

TeambuilderRoom=function(_PSRoom){_inheritsLoose(TeambuilderRoom,_PSRoom);function TeambuilderRoom(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_PSRoom.call.apply(_PSRoom,[this].concat(args))||this;_this.
DEFAULT_FORMAT='gen8';_this.








curFolder='';_this.
curFolderKeep='';return _this;}var _proto=TeambuilderRoom.prototype;_proto.




handleMessage=function handleMessage(line){
if(!line.startsWith('/')||line.startsWith('//'))return false;
var spaceIndex=line.indexOf(' ');
var cmd=spaceIndex>=0?line.slice(1,spaceIndex):line.slice(1);
var target=spaceIndex>=0?line.slice(spaceIndex+1):'';
switch(cmd){
case'newteam':{
if(target==='bottom'){
PS.teams.push(this.createTeam());
}else{
PS.teams.unshift(this.createTeam());
}
this.update(null);
return true;
}case'deleteteam':{
var team=PS.teams.byKey[target];
if(team)PS.teams["delete"](team);
this.update(null);
return true;
}case'undeleteteam':{
PS.teams.undelete();
this.update(null);
return true;
}}


alert("Unrecognized command: "+line);
return true;
};_proto.

createTeam=function createTeam(copyFrom){
if(copyFrom){
return{
name:"Copy of "+copyFrom.name,
format:copyFrom.format,
folder:copyFrom.folder,
packedTeam:copyFrom.packedTeam,
iconCache:null,
key:''
};
}else{
var format=this.curFolder&&!this.curFolder.endsWith('/')?this.curFolder:this.DEFAULT_FORMAT;
var _folder=this.curFolder.endsWith('/')?this.curFolder.slice(0,-1):'';
return{
name:"Untitled "+(PS.teams.list.length+1),
format:format,
folder:_folder,
packedTeam:'',
iconCache:null,
key:''
};
}
};return TeambuilderRoom;}(PSRoom);var


TeambuilderPanel=function(_PSRoomPanel){_inheritsLoose(TeambuilderPanel,_PSRoomPanel);function TeambuilderPanel(){var _this2;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this2=_PSRoomPanel.call.apply(_PSRoomPanel,[this].concat(args))||this;_this2.
selectFolder=function(e){
var room=_this2.props.room;
var elem=e.target;
var folder=null;
while(elem){
if(elem.className==='selectFolder'){
folder=elem.getAttribute('data-value')||'';
break;
}else if(elem.className==='folderlist'){
return;
}
elem=elem.parentElement;
}
if(folder===null)return;
room.curFolderKeep=folder;
room.curFolder=folder;
e.preventDefault();
e.stopImmediatePropagation();
_this2.forceUpdate();
};return _this2;}var _proto2=TeambuilderPanel.prototype;_proto2.
renderFolderList=function renderFolderList(){
var room=this.props.room;






var folderTable={'':1};
var folders=[];for(var _i2=0,_PS$teams$list2=
PS.teams.list;_i2<_PS$teams$list2.length;_i2++){var team=_PS$teams$list2[_i2];
var _folder2=team.folder;
if(_folder2&&!(_folder2+"/"in folderTable)){
folders.push(_folder2+"/");
folderTable[_folder2+"/"]=1;
if(!('/'in folderTable)){
folders.push('/');
folderTable['/']=1;
}
}

var format=team.format||room.DEFAULT_FORMAT;
if(!(format in folderTable)){
folders.push(format);
folderTable[format]=1;
}
}
if(!(room.curFolderKeep in folderTable)){
folderTable[room.curFolderKeep]=1;
folders.push(room.curFolderKeep);
}
if(!(room.curFolder in folderTable)){
folderTable[room.curFolder]=1;
folders.push(room.curFolder);
}

PSUtils.sortBy(folders,function(folder){return[
folder.endsWith('/')?10:-parseInt(folder.charAt(3),10),
folder];}
);

var renderedFormatFolders=[
preact.h("div",{"class":"foldersep"}),
preact.h(TeamFolder,{cur:false,value:"+"},
preact.h("i",{"class":"fa fa-plus"}),preact.h("em",null,"(add format folder)")
)];


var renderedFolders=[];

var gen=-1;for(var _i4=0;_i4<
folders.length;_i4++){var _format=folders[_i4];
var newGen=_format.endsWith('/')?0:parseInt(_format.charAt(3),10);
if(gen!==newGen){
gen=newGen;
if(gen===0){
renderedFolders.push.apply(renderedFolders,renderedFormatFolders);
renderedFormatFolders=[];
renderedFolders.push(preact.h("div",{"class":"foldersep"}));
renderedFolders.push(preact.h("div",{"class":"folder"},preact.h("h3",null,"Folders")));
}else{
renderedFolders.push(preact.h("div",{"class":"folder"},preact.h("h3",null,"Gen ",gen)));
}
}
var folderOpenIcon=room.curFolder===_format?'fa-folder-open':'fa-folder';
if(gen===0){
renderedFolders.push(preact.h(TeamFolder,{cur:room.curFolder===_format,value:_format},
preact.h("i",{"class":"fa "+
folderOpenIcon+(_format==='/'?'-o':'')}
),
_format.slice(0,-1)||'(uncategorized)'
));
continue;
}

renderedFolders.push(preact.h(TeamFolder,{cur:room.curFolder===_format,value:_format},
preact.h("i",{"class":"fa "+folderOpenIcon+"-o"}),
_format.slice(4)||'(uncategorized)'
));
}
renderedFolders.push.apply(renderedFolders,renderedFormatFolders);

return preact.h("div",{"class":"folderlist",onClick:this.selectFolder},
preact.h("div",{"class":"folderlistbefore"}),

preact.h(TeamFolder,{cur:!room.curFolder,value:""},
preact.h("em",null,"(all)")
),
renderedFolders,
preact.h("div",{"class":"foldersep"}),
preact.h(TeamFolder,{cur:false,value:"++"},
preact.h("i",{"class":"fa fa-plus"}),preact.h("em",null,"(add folder)")
),

preact.h("div",{"class":"folderlistafter"})
);
};_proto2.

render=function render(){
var room=this.props.room;
var teams=PS.teams.list.slice();

if(PS.teams.deletedTeams.length){
var undeleteIndex=PS.teams.deletedTeams[PS.teams.deletedTeams.length-1][1];
teams.splice(undeleteIndex,0,null);
}

var filterFolder=null;
var filterFormat=null;
if(room.curFolder){
if(room.curFolder.slice(-1)==='/'){
filterFolder=room.curFolder.slice(0,-1);
teams=teams.filter(function(team){return!team||team.folder===filterFolder;});
}else{
filterFormat=room.curFolder;
teams=teams.filter(function(team){return!team||team.format===filterFormat;});
}
}

return preact.h(PSPanelWrapper,{room:room},
preact.h("div",{"class":"folderpane"},
this.renderFolderList()
),
preact.h("div",{"class":"teampane"},
filterFolder?
preact.h("h2",null,
preact.h("i",{"class":"fa fa-folder-open"})," ",filterFolder," ",
preact.h("button",{"class":"button small",style:"margin-left:5px",name:"renameFolder"},
preact.h("i",{"class":"fa fa-pencil"})," Rename"
)," ",
preact.h("button",{"class":"button small",style:"margin-left:5px",name:"promptDeleteFolder"},
preact.h("i",{"class":"fa fa-times"})," Remove"
)
):
filterFolder===''?
preact.h("h2",null,preact.h("i",{"class":"fa fa-folder-open-o"})," Teams not in any folders"):
filterFormat?
preact.h("h2",null,preact.h("i",{"class":"fa fa-folder-open-o"})," ",filterFormat," ",preact.h("small",null,"(",teams.length,")")):

preact.h("h2",null,"All Teams ",preact.h("small",null,"(",teams.length,")")),

preact.h("p",null,
preact.h("button",{name:"cmd",value:"/newteam","class":"button big"},preact.h("i",{"class":"fa fa-plus-circle"})," New Team")
),
preact.h("ul",{"class":"teamlist"},
teams.map(function(team){return team?
preact.h("li",{key:team.key},
preact.h(TeamBox,{team:team})," ",
preact.h("button",{name:"cmd",value:"/deleteteam "+team.key},preact.h("i",{"class":"fa fa-trash"})," Delete")
):

preact.h("li",{key:"undelete"},
preact.h("button",{name:"cmd",value:"/undeleteteam"},preact.h("i",{"class":"fa fa-undo"})," Undo delete")
);}
)
),
preact.h("p",null,
preact.h("button",{name:"cmd",value:"/newteam bottom","class":"button"},preact.h("i",{"class":"fa fa-plus-circle"})," New Team")
)
)
);
};return TeambuilderPanel;}(PSRoomPanel);


PS.roomTypes['teambuilder']={
Model:TeambuilderRoom,
Component:TeambuilderPanel,
title:"Teambuilder"
};
//# sourceMappingURL=panel-teambuilder.js.map