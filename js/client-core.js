function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Client core
 *
 * No dependencies.
 * Does three unrelated things:
 * 1. sets up polyfills where necessary
 * 2. sets up PS's model base classes
 * 3. sets up the model and view for PS's backgrounds
 *
 * The background is mostly here so the new background can be loaded ASAP.
 *
 * @author Guangcong Luo <guancongluo@gmail.com>
 * @license AGPLv3
 */





if(!Array.prototype.indexOf){
Array.prototype.indexOf=function(searchElement,fromIndex){
for(var i=fromIndex||0;i<this.length;i++){
if(this[i]===searchElement)return i;
}
return-1;
};
}
if(!Array.prototype.includes){
Array.prototype.includes=function(thing){
return this.indexOf(thing)!==-1;
};
}
if(!String.prototype.includes){
String.prototype.includes=function(thing){
return this.indexOf(thing)!==-1;
};
}
if(!String.prototype.startsWith){
String.prototype.startsWith=function(thing){
return this.slice(0,thing.length)===thing;
};
}
if(!String.prototype.endsWith){
String.prototype.endsWith=function(thing){
return this.slice(-thing.length)===thing;
};
}
if(!String.prototype.trim){
String.prototype.trim=function(){
return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');
};
}
if(!Object.assign){
Object.assign=function(thing,rest){
for(var i=1;i<arguments.length;i++){
var source=arguments[i];
for(var k in source){
thing[k]=source[k];
}
}
return thing;
};
}
if(!Object.create){
Object.create=function(proto){
function F(){}
F.prototype=proto;
return new F();
};
}
if(!window.console){



window.console={
log:function(){}
};
}






var PSURL=(document.location.protocol!=='http:'?'https:':'')+"//"+Config.routes.client+"/";var

PSSubscription=function(){


function PSSubscription(observable,listener){this.observable=void 0;this.listener=void 0;
this.observable=observable;
this.listener=listener;
}var _proto=PSSubscription.prototype;_proto.
unsubscribe=function unsubscribe(){
var index=this.observable.subscriptions.indexOf(this);
if(index>=0)this.observable.subscriptions.splice(index,1);
};return PSSubscription;}();var







PSModel=function(){function PSModel(){this.
subscriptions=[];}var _proto2=PSModel.prototype;_proto2.
subscribe=function subscribe(listener){
var subscription=new PSSubscription(this,listener);
this.subscriptions.push(subscription);
return subscription;
};_proto2.
subscribeAndRun=function subscribeAndRun(listener){
var subscription=this.subscribe(listener);
subscription.listener();
return subscription;
};_proto2.
update=function update(){for(var _i2=0,_this$subscriptions2=
this.subscriptions;_i2<_this$subscriptions2.length;_i2++){var subscription=_this$subscriptions2[_i2];
subscription.listener();
}
};return PSModel;}();var









PSStreamModel=function(){function PSStreamModel(){this.
subscriptions=[];this.
updates=[];}var _proto3=PSStreamModel.prototype;_proto3.
subscribe=function subscribe(listener){

var subscription=new PSSubscription(this,listener);
this.subscriptions.push(subscription);
if(this.updates.length){for(var _i4=0,_this$updates2=
this.updates;_i4<_this$updates2.length;_i4++){var update=_this$updates2[_i4];
subscription.listener(update);
}
this.updates=[];
}
return subscription;
};_proto3.
subscribeAndRun=function subscribeAndRun(listener){
var subscription=this.subscribe(listener);
subscription.listener(null);
return subscription;
};_proto3.
update=function update(value){
if(!this.subscriptions.length){

this.updates.push(value);
}for(var _i6=0,_this$subscriptions4=
this.subscriptions;_i6<_this$subscriptions4.length;_i6++){var subscription=_this$subscriptions4[_i6];
subscription.listener(value);
}
};return PSStreamModel;}();



















var PSBackground=new(function(_PSStreamModel){_inheritsLoose(_class5,_PSStreamModel);






function _class5(){var _this;
_this=_PSStreamModel.call(this)||this;_this.id='';_this.curId='';_this.attrib=null;_this.changeCount=0;_this.menuColors=null;
try{
var bg=localStorage.getItem('showdown_bg').split('\n');
if(bg.length===1){
_this.set('',bg[0]);
}else if(bg.length===2){
_this.set(bg[0],bg[1]);
}else if(bg.length>=7){
_this.set(bg[0],bg[1],bg.slice(2));
}
}catch(_unused){}return _this;
}var _proto4=_class5.prototype;_proto4.
save=function save(bgUrl){
if(this.id!=='custom'){
localStorage.setItem('showdown_bg',this.id);
}else if(this.menuColors){
localStorage.setItem('showdown_bg',bgUrl+'\n'+this.id+'\n'+this.menuColors.join('\n'));
}
};_proto4.

set=function set(bgUrl,bgid){var menuColors=arguments.length>2&&arguments[2]!==undefined?arguments[2]:null;

this.id=bgid;


if(!bgid){
if(location.host==='smogtours.psim.us'){
bgid='shaymin';
}else if(location.host===Config.routes.client){
var bgs=['horizon','ocean','waterfall','shaymin','charizards'];
bgid=bgs[Math.floor(Math.random()*5)];
if(bgid===this.curId)bgid=bgs[Math.floor(Math.random()*5)];
}
}
this.curId=bgid;

if(!bgUrl){
bgUrl=bgid==='solidblue'?'#344b6c':PSURL+'fx/client-bg-'+bgid+'.jpg';
}





this.changeCount++;


var attrib=null;
switch(bgid){
case'horizon':
menuColors=[
"318.87640449438203,35.177865612648226%",
"216,46.2962962962963%",
"221.25,32.25806451612904%",
"197.8021978021978,52.60115606936417%",
"232.00000000000003,19.480519480519483%",
"228.38709677419354,60.7843137254902%"];

attrib={
url:'https://vtas.deviantart.com/art/Pokemon-Horizon-312267168',
title:'Horizon',
artist:'Vivian Zou'
};
break;
case'ocean':
menuColors=[
"82.8169014084507,34.63414634146342%",
"216.16438356164383,29.55465587044534%",
"212.92682926829266,59.42028985507245%",
"209.18918918918916,57.51295336787566%",
"199.2857142857143,48.275862068965495%",
"213.11999999999998,55.06607929515419%"];

attrib={
url:'https://quanyails.deviantart.com/art/Sunrise-Ocean-402667154',
title:'Sunrise Ocean',
artist:'Quanyails'
};
break;
case'waterfall':
menuColors=[
"119.31034482758622,37.66233766233767%",
"184.36363636363635,23.012552301255226%",
"108.92307692307692,37.14285714285714%",
"70.34482758620689,20.567375886524818%",
"98.39999999999998,36.76470588235296%",
"140,38.18181818181818%"];

attrib={
url:'https://yilx.deviantart.com/art/Irie-372292729',
title:'Irie',
artist:'Samuel Teo'
};
break;
case'shaymin':
menuColors=[
"39.000000000000064,21.7391304347826%",
"170.00000000000003,2.380952380952378%",
"157.5,11.88118811881188%",
"174.78260869565216,12.041884816753928%",
"185.00000000000003,12.76595744680851%",
"20,5.660377358490567%"];

attrib={
url:'http://cargocollective.com/bluep',
title:'Shaymin',
artist:'Daniel Kong'
};
break;
case'charizards':
menuColors=[
"37.159090909090914,74.57627118644066%",
"10.874999999999998,70.79646017699115%",
"179.51612903225808,52.10084033613446%",
"20.833333333333336,36.73469387755102%",
"192.3076923076923,80.41237113402063%",
"210,29.629629629629633%"];

attrib={
url:'https://seiryuuden.deviantart.com/art/The-Ultimate-Mega-Showdown-Charizards-414587079',
title:'Charizards',
artist:'Jessica Valencia'
};
break;
case'digimon':
menuColors=[
"170.45454545454544,27.500000000000004%",
"84.70588235294119,13.821138211382115%",
"112.50000000000001,7.8431372549019605%",
"217.82608695652175,54.761904761904766%",
"0,1.6949152542372816%",
""];

}
if(!menuColors&&bgUrl.charAt(0)==='#'){
var r=parseInt(bgUrl.slice(1,3),16)/255;
var g=parseInt(bgUrl.slice(3,5),16)/255;
var b=parseInt(bgUrl.slice(5,7),16)/255;
var hs=this.getHueSat(r,g,b);
menuColors=[hs,hs,hs,hs,hs,hs];
}
this.attrib=attrib;
this.menuColors=menuColors;
if(!menuColors){
this.extractMenuColors(bgUrl);
}else{
this.save(bgUrl);
}
};_proto4.
extractMenuColors=function extractMenuColors(bgUrl){var _this2=this;
var changeCount=this.changeCount;

var img=new Image();
img.onload=function(){
if(changeCount===PSBackground.changeCount)return;


try{
var colorThief=new ColorThief();
var colors=colorThief.getPalette(img,5);

var menuColors=[];
if(!colors){
menuColors=['0, 0%','0, 0%','0, 0%','0, 0%','0, 0%'];
}else{
for(var i=0;i<5;i++){
var color=colors[i];
var hs=PSBackground.getHueSat(color[0]/255,color[1]/255,color[2]/255);
menuColors.unshift(hs);
}
}
_this2.menuColors=menuColors;
PSBackground.save(bgUrl);
}catch(_unused2){}
};
img.src=bgUrl;
};_proto4.
getHueSat=function getHueSat(r,g,b){
var max=Math.max(r,g,b);
var min=Math.min(r,g,b);
if(max===min){
return"0,0%";
}
var l=(max+min)/2;
var d=max-min;
var s=l>0.5?d/(2-max-min):d/(max+min);
var h=0;
switch(max){
case r:h=(g-b)/d+(g<b?6:0);break;
case g:h=(b-r)/d+2;break;
case b:h=(r-g)/d+4;break;
}
h/=6;
return h*360+","+s*100+"%";
};return _class5;}(PSStreamModel))(
);





PSBackground.subscribe(function(bgUrl){
if(!PSBackground.curId){
document.body.style.background='';
document.body.style.backgroundSize='';
var _buttonStyleElem=document.getElementById('mainmenubuttoncolors');
if(_buttonStyleElem)_buttonStyleElem.textContent="";
return;
}

if(bgUrl!==null){
var background;
if(bgUrl.charAt(0)==='#'){
background=bgUrl;
}else if(PSBackground.curId!=='custom'){
background="#546bac url("+bgUrl+") no-repeat left center fixed";
}else{
background="#546bac url("+bgUrl+") no-repeat center center fixed";
}
document.body.style.background=background;
document.body.style.backgroundSize='cover';
}


var cssBuf="";
var n=0;
if(PSBackground.menuColors){for(var _i8=0,_PSBackground$menuCol2=
PSBackground.menuColors;_i8<_PSBackground$menuCol2.length;_i8++){var hs=_PSBackground$menuCol2[_i8];
n++;
cssBuf+="body .button.mainmenu"+n+" { background: linear-gradient(to bottom,  hsl("+hs+",72%),  hsl("+hs+",52%)); border-color: hsl("+hs+",40%); }\n";
cssBuf+="body .button.mainmenu"+n+":hover { background: linear-gradient(to bottom,  hsl("+hs+",62%),  hsl("+hs+",42%)); border-color: hsl("+hs+",21%); }\n";
cssBuf+="body .button.mainmenu"+n+":active { background: linear-gradient(to bottom,  hsl("+hs+",42%),  hsl("+hs+",58%)); border-color: hsl("+hs+",21%); }\n";
}
}
var buttonStyleElem=document.getElementById('mainmenubuttoncolors');
if(!buttonStyleElem){
if(cssBuf){
buttonStyleElem=new HTMLStyleElement();
buttonStyleElem.id='mainmenubuttoncolors';
buttonStyleElem.textContent=cssBuf;
document.head.appendChild(buttonStyleElem);
}
}else{
buttonStyleElem.textContent=cssBuf;
}
});
//# sourceMappingURL=client-core.js.map