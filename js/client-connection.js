function _assertThisInitialized(self){if(self===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _wrapNativeSuper(Class){var _cache=typeof Map==="function"?new Map():undefined;_wrapNativeSuper=function _wrapNativeSuper(Class){if(Class===null||!_isNativeFunction(Class))return Class;if(typeof Class!=="function"){throw new TypeError("Super expression must either be null or a function");}if(typeof _cache!=="undefined"){if(_cache.has(Class))return _cache.get(Class);_cache.set(Class,Wrapper);}function Wrapper(){return _construct(Class,arguments,_getPrototypeOf(this).constructor);}Wrapper.prototype=Object.create(Class.prototype,{constructor:{value:Wrapper,enumerable:false,writable:true,configurable:true}});return _setPrototypeOf(Wrapper,Class);};return _wrapNativeSuper(Class);}function _construct(Parent,args,Class){if(_isNativeReflectConstruct()){_construct=Reflect.construct.bind();}else{_construct=function _construct(Parent,args,Class){var a=[null];a.push.apply(a,args);var Constructor=Function.bind.apply(Parent,a);var instance=new Constructor();if(Class)_setPrototypeOf(instance,Class.prototype);return instance;};}return _construct.apply(null,arguments);}function _isNativeReflectConstruct(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true;}catch(e){return false;}}function _isNativeFunction(fn){return Function.toString.call(fn).indexOf("[native code]")!==-1;}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}function _getPrototypeOf(o){_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function _getPrototypeOf(o){return o.__proto__||Object.getPrototypeOf(o);};return _getPrototypeOf(o);}/**
 * Connection library
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var



PSConnection=function(){



function PSConnection(){this.socket=null;this.connected=false;this.queue=[];
this.connect();
}var _proto=PSConnection.prototype;_proto.
connect=function connect(){var _this=this;
var server=PS.server;
var port=server.protocol==='https'?'':':'+server.port;
var url=server.protocol+'://'+server.host+port+server.prefix;
var socket=this.socket=new SockJS(url,[],{timeout:5*60*1000});
socket.onopen=function(){
console.log("\u2705 (CONNECTED)");
_this.connected=true;
PS.connected=true;for(var _i2=0,_this$queue2=
_this.queue;_i2<_this$queue2.length;_i2++){var msg=_this$queue2[_i2];socket.send(msg);}
_this.queue=[];
PS.update();
};
socket.onmessage=function(e){
PS.receive(''+e.data);
};
socket.onclose=function(){
console.log("\u2705 (DISCONNECTED)");
_this.connected=false;
PS.connected=false;
PS.isOffline=true;
for(var roomid in PS.rooms){
PS.rooms[roomid].connected=false;
}
_this.socket=null;
PS.update();
};
};_proto.
disconnect=function disconnect(){
this.socket.close();
PS.connection=null;
};_proto.
send=function send(msg){
if(!this.connected){
this.queue.push(msg);
return;
}
this.socket.send(msg);
};return PSConnection;}();


PS.connection=new PSConnection();

var PSLoginServer=new(function(){function _class2(){}var _proto2=_class2.prototype;_proto2.
query=function query(data){
var url='/~~'+PS.server.id+'/action.php';
if(location.pathname.endsWith('.html')){
url='https://'+Config.routes.client+url;

if(typeof POKEMON_SHOWDOWN_TESTCLIENT_KEY==='string'){

data.sid=POKEMON_SHOWDOWN_TESTCLIENT_KEY.replace(/\%2C/g,',');
}
}
return Net(url).get({method:data?'POST':'GET',body:data}).then(
function(res){return res?JSON.parse(res.slice(1)):null;}
)["catch"](
function(){return null;}
);
};return _class2;}())(
);var









HttpError=function(_Error){_inheritsLoose(HttpError,_Error);


function HttpError(message,statusCode,body){var _this2;
_this2=_Error.call(this,message)||this;_this2.statusCode=void 0;_this2.body=void 0;
_this2.name='HttpError';
_this2.statusCode=statusCode;
_this2.body=body;
try{
Error.captureStackTrace(_assertThisInitialized(_this2),HttpError);
}catch(err){}return _this2;
}return HttpError;}(_wrapNativeSuper(Error));var

NetRequest=function(){

function NetRequest(uri){this.uri=void 0;
this.uri=uri;
}var _proto3=NetRequest.prototype;_proto3.









get=function get(){var _this3=this;var opts=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};
return new Promise(function(resolve,reject){
var xhr=new XMLHttpRequest();
var uri=_this3.uri;
if(opts.query){
uri+=(uri.includes('?')?'&':'?')+Net.encodeQuery(opts.query);
}
xhr.open(opts.method||'GET',uri);
xhr.onreadystatechange=function(){
var DONE=4;
if(xhr.readyState===DONE){
if(xhr.status===200){
resolve(xhr.responseText||'');
return;
}
var err=new HttpError(xhr.statusText||"Connection error",xhr.status,xhr.responseText);
reject(err);
}
};
if(opts.body){
xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
xhr.send(Net.encodeQuery(opts.body));
}else{
xhr.send();
}
});
};_proto3.












post=function post(){var opts=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var body=arguments.length>1?arguments[1]:undefined;
if(!body)body=opts.body;
return this.get(Object.assign({},
opts,{
method:'POST',
body:body})
);
};return NetRequest;}();


function Net(uri){
return new NetRequest(uri);
}

Net.encodeQuery=function(data){
if(typeof data==='string')return data;
var urlencodedData='';
for(var _key in data){
if(urlencodedData)urlencodedData+='&';
urlencodedData+=encodeURIComponent(_key)+'='+encodeURIComponent(data[_key]);
}
return urlencodedData;
};
//# sourceMappingURL=client-connection.js.map