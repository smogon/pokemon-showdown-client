/**
 * Chat parser
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Parses formate.
 *
 * @license MIT
 */




















































var linkRegex=/(?:(?:https?:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*|www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:(?:com?|org|net|edu|info|us|jp)\b|[a-z]{2,3}(?=:[0-9]|\/)))(?::[0-9]+)?(?:\/(?:(?:[^\s()&<>]|&amp;|&quot;|\((?:[^\\s()<>&]|&amp;)*\))*(?:[^\s()[\]{}".,!?;:&<>*`^~\\]|\((?:[^\s()<>&]|&amp;)*\)))?)?|[a-z0-9.]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?![^ ]*&gt;)/ig;var





TextFormatter=function(){








function TextFormatter(str){var isTrusted=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var replaceLinebreaks=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;this.str=void 0;this.buffers=void 0;this.stack=void 0;this.isTrusted=void 0;this.replaceLinebreaks=void 0;this.offset=void 0;

str=(""+str).
replace(/&/g,'&amp;').
replace(/</g,'&lt;').
replace(/>/g,'&gt;').
replace(/"/g,'&quot;').
replace(/'/g,'&apos;');


str=str.replace(linkRegex,function(uri){
var fulluri;
if(/^[a-z0-9.]+@/ig.test(uri)){
fulluri='mailto:'+uri;
}else{
fulluri=uri.replace(/^([a-z]*[^a-z:])/g,'http://$1');
if(uri.substr(0,24)==='https://docs.google.com/'||uri.substr(0,16)==='docs.google.com/'){
if(uri.startsWith('https'))uri=uri.slice(8);
if(uri.substr(-12)==='?usp=sharing'||uri.substr(-12)==='&usp=sharing')uri=uri.slice(0,-12);
if(uri.substr(-6)==='#gid=0')uri=uri.slice(0,-6);
var slashIndex=uri.lastIndexOf('/');
if(uri.length-slashIndex>18)slashIndex=uri.length;
if(slashIndex-4>19+3){
uri=uri.slice(0,19)+
'<small class="message-overflow">'+uri.slice(19,slashIndex-4)+'</small>'+uri.slice(slashIndex-4);
}
}
}
return"<a href=\""+fulluri+"\" rel=\"noopener\" target=\"_blank\">"+uri+"</a>";
});


this.str=str;
this.buffers=[];
this.stack=[];
this.isTrusted=isTrusted;
this.replaceLinebreaks=this.isTrusted||replaceLinebreaks;
this.offset=0;
}var _proto=TextFormatter.prototype;_proto.


slice=function slice(start,end){
return this.str.slice(start,end);
};_proto.

at=function at(start){
return this.str.charAt(start);
};_proto.

pushSpan=function pushSpan(spanType,start,end){
this.pushSlice(start);
this.stack.push([spanType,this.buffers.length]);
this.buffers.push(this.slice(start,end));
this.offset=end;
};_proto.

pushSlice=function pushSlice(end){
if(end!==this.offset){
this.buffers.push(this.slice(this.offset,end));
this.offset=end;
}
};_proto.

closeParenSpan=function closeParenSpan(start){
var stackPosition=-1;
for(var i=this.stack.length-1;i>=0;i--){
var span=this.stack[i];
if(span[0]==='('){
stackPosition=i;
break;
}
if(span[0]!=='spoiler')break;
}
if(stackPosition===-1)return false;

this.pushSlice(start);
while(this.stack.length>stackPosition)this.popSpan(start);
this.offset=start;
return true;
};_proto.




closeSpan=function closeSpan(spanType,start,end){

var stackPosition=-1;
for(var i=this.stack.length-1;i>=0;i--){
var _span=this.stack[i];
if(_span[0]===spanType){
stackPosition=i;
break;
}
}
if(stackPosition===-1)return false;

this.pushSlice(start);
while(this.stack.length>stackPosition+1)this.popSpan(start);
var span=this.stack.pop();
var startIndex=span[1];
var tagName='';
var attrs='';
switch(spanType){
case'_':tagName='i';break;
case'*':tagName='b';break;
case'~':tagName='s';break;
case'^':tagName='sup';break;
case'\\':tagName='sub';break;
case'|':tagName='span';attrs=' class="spoiler"';break;
}
if(tagName){
this.buffers[startIndex]="<"+tagName+attrs+">";
this.buffers.push("</"+tagName+">");
this.offset=end;
}
return true;
};_proto.






popSpan=function popSpan(end){
var span=this.stack.pop();
if(!span)return false;
this.pushSlice(end);
switch(span[0]){
case'spoiler':
this.buffers.push("</span>");
this.buffers[span[1]]="<span class=\"spoiler\">";
break;
case'>':
this.buffers.push("</span>");
this.buffers[span[1]]="<span class=\"greentext\">";
break;
default:

break;
}
return true;
};_proto.

popAllSpans=function popAllSpans(end){
while(this.stack.length)this.popSpan(end);
this.pushSlice(end);
};_proto.

toUriComponent=function toUriComponent(html){
var component=html.replace(/&lt;/g,'<').
replace(/&gt;/g,'>').
replace(/&quot;/g,'"').
replace(/&apos;/g,'\'').
replace(/&amp;/g,'&');
return encodeURIComponent(component);
};_proto.

runLookahead=function runLookahead(spanType,start){
switch(spanType){
case'`':
{
var delimLength=0;
var i=start;
while(this.at(i)==='`'){
delimLength++;
i++;
}
var curDelimLength=0;
while(i<this.str.length){
var char=this.at(i);
if(char==='\n')break;
if(char==='`'){
curDelimLength++;
}else{
if(curDelimLength===delimLength)break;
curDelimLength=0;
}
i++;
}
if(curDelimLength!==delimLength)return false;

this.pushSlice(start);
this.buffers.push("<code>");
var innerStart=start+delimLength;
var innerEnd=i-delimLength;
if(innerStart+1>=innerEnd){

}else if(this.at(innerStart)===' '&&this.at(innerEnd-1)===' '){
innerStart++;
innerEnd--;
}else if(this.at(innerStart)===' '&&this.at(innerStart+1)==='`'){
innerStart++;
}else if(this.at(innerEnd-1)===' '&&this.at(innerEnd-2)==='`'){
innerEnd--;
}
this.buffers.push(this.slice(innerStart,innerEnd));
this.buffers.push("</code>");
this.offset=i;
}
return true;
case'[':
{
if(this.slice(start,start+2)!=='[[')return false;
var _i=start+2;
var colonPos=-1;
var anglePos=-1;
while(_i<this.str.length){
var _char=this.at(_i);
if(_char===']'||_char==='\n')break;
if(_char===':'&&colonPos<0)colonPos=_i;
if(_char==='&'&&this.slice(_i,_i+4)==='&lt;')anglePos=_i;
_i++;
}
if(this.slice(_i,_i+2)!==']]')return false;
var termEnd=_i;
var uri='';
if(anglePos>=0&&this.slice(_i-4,_i)==='&gt;'){
uri=this.slice(anglePos+4,_i-4);
termEnd=anglePos;
if(this.at(termEnd-1)===' ')termEnd--;
uri=encodeURI(uri.replace(/^([a-z]*[^a-z:])/g,'http://$1'));
}
var term=this.slice(start+2,termEnd).replace(/<\/?a(?: [^>]+)?>/g,'');
if(uri&&!this.isTrusted){
var shortUri=uri.replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/$/,'');
term+="<small> &lt;"+shortUri+"&gt;</small>";
uri+='" rel="noopener';
}
if(colonPos>0){
var key=this.slice(start+2,colonPos).toLowerCase();
switch(key){
case'w':
case'wiki':
term=term.slice(term.charAt(key.length+1)===' '?key.length+2:key.length+1);
uri="//en.wikipedia.org/w/index.php?title=Special:Search&search="+this.toUriComponent(term);
term="wiki: "+term;
break;
case'pokemon':
case'item':
case'type':
case'category':
term=term.slice(term.charAt(key.length+1)===' '?key.length+2:key.length+1);

var display='';
if(this.isTrusted){
display="<psicon "+key+"=\""+term+"\" />";
}else{
display="["+term+"]";
}

var dir=key;
if(key==='item')dir+='s';
if(key==='category')dir='categories';

uri="//dex.pokemonshowdown.com/"+dir+"/"+toID(term);
term=display;
}
}
if(!uri){
uri="//www.google.com/search?ie=UTF-8&btnI&q="+this.toUriComponent(term);
}
this.pushSlice(start);
this.buffers.push("<a href=\""+uri+"\" target=\"_blank\">"+term+"</a>");
this.offset=_i+2;
}
return true;
case'<':
{
if(this.slice(start,start+8)!=='&lt;&lt;')return false;
var _i2=start+8;
while(/[a-z0-9-]/.test(this.at(_i2)))_i2++;
if(this.slice(_i2,_i2+8)!=='&gt;&gt;')return false;
this.pushSlice(start);
var roomid=this.slice(start+8,_i2);
this.buffers.push("&laquo;<a href=\"/"+roomid+"\" target=\"_blank\">"+roomid+"</a>&raquo;");
this.offset=_i2+8;
}
return true;
case'a':
{
var _i3=start+1;
while(this.at(_i3)!=='/'||this.at(_i3+1)!=='a'||this.at(_i3+2)!=='>')_i3++;
_i3+=3;
this.pushSlice(_i3);
}
return true;
}
return false;
};_proto.

get=function get(){
var beginningOfLine=this.offset;

for(var i=beginningOfLine;i<this.str.length;i++){
var char=this.at(i);
switch(char){
case'_':
case'*':
case'~':
case'^':
case'\\':
case'|':
if(this.at(i+1)===char&&this.at(i+2)!==char){
if(!(this.at(i-1)!==' '&&this.closeSpan(char,i,i+2))){
if(this.at(i+2)!==' ')this.pushSpan(char,i,i+2);
}
if(i<this.offset){
i=this.offset-1;
break;
}
}
while(this.at(i+1)===char)i++;
break;
case'(':
this.stack.push(['(',-1]);
break;
case')':
this.closeParenSpan(i);
if(i<this.offset){
i=this.offset-1;
break;
}
break;
case'`':
if(this.at(i+1)==='`')this.runLookahead('`',i);
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.at(i+1)==='`')i++;
break;
case'[':
this.runLookahead('[',i);
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.at(i+1)==='[')i++;
break;
case':':
if(i<7)break;
if(this.slice(i-7,i+1).toLowerCase()==='spoiler:'||
this.slice(i-8,i+1).toLowerCase()==='spoilers:'){
if(this.at(i+1)===' ')i++;
this.pushSpan('spoiler',i+1,i+1);
}
break;
case'&':
if(i===beginningOfLine&&this.slice(i,i+4)==='&gt;'){
if(!"._/=:;".includes(this.at(i+4))&&!['w&lt;','w&gt;'].includes(this.slice(i+4,i+9))){
this.pushSpan('>',i,i);
}
}else{
this.runLookahead('<',i);
}
if(i<this.offset){
i=this.offset-1;
break;
}
while(this.slice(i+1,i+5)==='lt;&')i+=4;
break;
case'<':
this.runLookahead('a',i);
if(i<this.offset){
i=this.offset-1;
break;
}

break;
case'\r':
case'\n':
this.popAllSpans(i);
if(this.replaceLinebreaks){
this.buffers.push("<br />");
this.offset++;
}
beginningOfLine=i+1;
break;
}
}

this.popAllSpans(this.str.length);
return this.buffers.join('');
};return TextFormatter;}();





function formatText(str){var isTrusted=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var replaceLinebreaks=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;
return new TextFormatter(str,isTrusted,replaceLinebreaks).get();
}




function stripFormatting(str){

str=str.replace(/\*\*([^\s*]+)\*\*|__([^\s_]+)__|~~([^\s~]+)~~|``([^\s`]+)``|\^\^([^\s^]+)\^\^|\\([^\s\\]+)\\/g,
function(match,$1,$2,$3,$4,$5,$6){return $1||$2||$3||$4||$5||$6;});

return str.replace(/\[\[(?:([^<]*)\s*<[^>]+>|([^\]]+))\]\]/g,function(match,$1,$2){return $1||$2||'';});
}
//# sourceMappingURL=chat-formatter.js.map