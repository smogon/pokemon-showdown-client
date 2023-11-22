function _inheritsLoose(subClass,superClass){subClass.prototype=Object.create(superClass.prototype);subClass.prototype.constructor=subClass;_setPrototypeOf(subClass,superClass);}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}/**
 * Search Results
 *
 * Code for displaying sesrch results from battle-dex-search.ts
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */var

PSSearchResults=function(_preact$Component){_inheritsLoose(PSSearchResults,_preact$Component);function PSSearchResults(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
URL_ROOT="//"+Config.routes.dex+"/";return _this;}var _proto=PSSearchResults.prototype;_proto.

renderPokemonSortRow=function renderPokemonSortRow(){
var search=this.props.search;
var sortCol=search.sortCol;
return preact.h("li",{"class":"result"},preact.h("div",{"class":"sortrow"},
preact.h("button",{"class":"sortcol numsortcol"+(!sortCol?' cur':'')},!sortCol?'Sort: ':search.firstPokemonColumn),
preact.h("button",{"class":"sortcol pnamesortcol"+(sortCol==='name'?' cur':''),"data-sort":"name"},"Name"),
preact.h("button",{"class":"sortcol typesortcol"+(sortCol==='type'?' cur':''),"data-sort":"type"},"Types"),
preact.h("button",{"class":"sortcol abilitysortcol"+(sortCol==='ability'?' cur':''),"data-sort":"ability"},"Abilities"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='hp'?' cur':''),"data-sort":"hp"},"HP"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='atk'?' cur':''),"data-sort":"atk"},"Atk"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='def'?' cur':''),"data-sort":"def"},"Def"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='spa'?' cur':''),"data-sort":"spa"},"SpA"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='spd'?' cur':''),"data-sort":"spd"},"SpD"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='spe'?' cur':''),"data-sort":"spe"},"Spe"),
preact.h("button",{"class":"sortcol statsortcol"+(sortCol==='bst'?' cur':''),"data-sort":"bst"},"BST")
));
};_proto.

renderMoveSortRow=function renderMoveSortRow(){
var sortCol=this.props.search.sortCol;
return preact.h("li",{"class":"result"},preact.h("div",{"class":"sortrow"},
preact.h("button",{"class":"sortcol movenamesortcol"+(sortCol==='name'?' cur':''),"data-sort":"name"},"Name"),
preact.h("button",{"class":"sortcol movetypesortcol"+(sortCol==='type'?' cur':''),"data-sort":"type"},"Type"),
preact.h("button",{"class":"sortcol movetypesortcol"+(sortCol==='category'?' cur':''),"data-sort":"category"},"Cat"),
preact.h("button",{"class":"sortcol powersortcol"+(sortCol==='power'?' cur':''),"data-sort":"power"},"Pow"),
preact.h("button",{"class":"sortcol accuracysortcol"+(sortCol==='accuracy'?' cur':''),"data-sort":"accuracy"},"Acc"),
preact.h("button",{"class":"sortcol ppsortcol"+(sortCol==='pp'?' cur':''),"data-sort":"pp"},"PP")
));
};_proto.

renderPokemonRow=function renderPokemonRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var pokemon=search.dex.species.get(id);
if(!pokemon)return preact.h("li",{"class":"result"},"Unrecognized pokemon");

var tagStart=pokemon.forme?pokemon.name.length-pokemon.forme.length-1:0;

var stats=pokemon.baseStats;
var bst=0;for(var _i2=0,_Object$values2=
Object.values(stats);_i2<_Object$values2.length;_i2++){var stat=_Object$values2[_i2];bst+=stat;}
if(search.dex.gen<2)bst-=stats['spd'];

if(errorMessage){
return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"pokemon/"+id,"data-target":"push","data-entry":"pokemon|"+pokemon.name},
preact.h("span",{"class":"col numcol"},search.getTier(pokemon)),

preact.h("span",{"class":"col iconcol"},
preact.h("span",{style:Dex.getPokemonIcon(pokemon.id)})
),

preact.h("span",{"class":"col pokemonnamecol"},this.renderName(pokemon.name,matchStart,matchEnd,tagStart)),

errorMessage
));
}

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"pokemon/"+id,"data-target":"push","data-entry":"pokemon|"+pokemon.name},
preact.h("span",{"class":"col numcol"},search.getTier(pokemon)),

preact.h("span",{"class":"col iconcol"},
preact.h("span",{style:Dex.getPokemonIcon(pokemon.id)})
),

preact.h("span",{"class":"col pokemonnamecol"},this.renderName(pokemon.name,matchStart,matchEnd,tagStart)),

preact.h("span",{"class":"col typecol"},
pokemon.types.map(function(type){return(
preact.h("img",{src:Dex.resourcePrefix+"sprites/types/"+type+".png",alt:type,height:"14",width:"32","class":"pixelated"}));}
)
),

search.dex.gen>=3&&(pokemon.abilities['1']?
preact.h("span",{"class":"col twoabilitycol"},pokemon.abilities['0'],preact.h("br",null),pokemon.abilities['1']):

preact.h("span",{"class":"col abilitycol"},pokemon.abilities['0'])),

search.dex.gen>=5&&(pokemon.abilities['S']?
preact.h("span",{"class":"col twoabilitycol"+(pokemon.unreleasedHidden?' unreleasedhacol':'')},pokemon.abilities['H']||'',preact.h("br",null),pokemon.abilities['S']):
pokemon.abilities['H']?
preact.h("span",{"class":"col abilitycol"+(pokemon.unreleasedHidden?' unreleasedhacol':'')},pokemon.abilities['H']):

preact.h("span",{"class":"col abilitycol"})),


preact.h("span",{"class":"col statcol"},preact.h("em",null,"HP"),preact.h("br",null),stats.hp),
preact.h("span",{"class":"col statcol"},preact.h("em",null,"Atk"),preact.h("br",null),stats.atk),
preact.h("span",{"class":"col statcol"},preact.h("em",null,"Def"),preact.h("br",null),stats.def),
search.dex.gen>2&&preact.h("span",{"class":"col statcol"},preact.h("em",null,"SpA"),preact.h("br",null),stats.spa),
search.dex.gen>2&&preact.h("span",{"class":"col statcol"},preact.h("em",null,"SpD"),preact.h("br",null),stats.spd),
search.dex.gen<2&&preact.h("span",{"class":"col statcol"},preact.h("em",null,"Spc"),preact.h("br",null),stats.spa),
preact.h("span",{"class":"col statcol"},preact.h("em",null,"Spe"),preact.h("br",null),stats.spe),
preact.h("span",{"class":"col bstcol"},preact.h("em",null,"BST",preact.h("br",null),bst))
));
};_proto.

renderName=function renderName(name,matchStart,matchEnd,tagStart){
if(!matchEnd){
if(!tagStart)return name;
return[
name.slice(0,tagStart),preact.h("small",null,name.slice(tagStart))];

}

var output;
if(tagStart&&matchStart>=tagStart){
output=[name];
}else{
output=[
name.slice(0,matchStart),
preact.h("b",null,name.slice(matchStart,matchEnd)),
name.slice(matchEnd,tagStart||name.length)];

if(!tagStart)return output;
}

if(matchEnd&&matchEnd>tagStart){
if(matchStart<tagStart){
matchStart=tagStart;
}
output.push(
preact.h("small",null,name.slice(tagStart,matchStart),preact.h("b",null,name.slice(matchStart,matchEnd)),name.slice(matchEnd))
);
}else{
output.push(preact.h("small",null,name.slice(tagStart)));
}

return output;
};_proto.

renderItemRow=function renderItemRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var item=search.dex.items.get(id);
if(!item)return preact.h("li",{"class":"result"},"Unrecognized item");

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"items/"+id,"data-target":"push","data-entry":"item|"+item.name},
preact.h("span",{"class":"col itemiconcol"},
preact.h("span",{style:Dex.getItemIcon(item)})
),

preact.h("span",{"class":"col namecol"},this.renderName(item.name,matchStart,matchEnd)),

errorMessage,

!errorMessage&&preact.h("span",{"class":"col itemdesccol"},item.shortDesc)
));
};_proto.

renderAbilityRow=function renderAbilityRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var ability=search.dex.abilities.get(id);
if(!ability)return preact.h("li",{"class":"result"},"Unrecognized ability");

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"abilitys/"+id,"data-target":"push","data-entry":"ability|"+ability.name},
preact.h("span",{"class":"col namecol"},this.renderName(ability.name,matchStart,matchEnd)),

errorMessage,

!errorMessage&&preact.h("span",{"class":"col abilitydesccol"},ability.shortDesc)
));
};_proto.

renderMoveRow=function renderMoveRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var move=search.dex.moves.get(id);
if(!move)return preact.h("li",{"class":"result"},"Unrecognized move");

var tagStart=move.name.startsWith('Hidden Power')?12:0;

if(errorMessage){
return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"move/"+id,"data-target":"push","data-entry":"move|"+move.name},
preact.h("span",{"class":"col movenamecol"},this.renderName(move.name,matchStart,matchEnd,tagStart)),

errorMessage
));
}

var pp=move.pp===1||move.noPPBoosts?move.pp:move.pp*8/5;
if(search.dex.gen<3)pp=Math.min(61,pp);
return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"move/"+id,"data-target":"push","data-entry":"move|"+move.name},
preact.h("span",{"class":"col movenamecol"},this.renderName(move.name,matchStart,matchEnd,tagStart)),

preact.h("span",{"class":"col typecol"},
preact.h("img",{src:Dex.resourcePrefix+"sprites/types/"+move.type+".png",alt:move.type,height:"14",width:"32","class":"pixelated"}),
preact.h("img",{src:Dex.resourcePrefix+"sprites/categories/"+move.category+".png",alt:move.category,height:"14",width:"32","class":"pixelated"})
),

preact.h("span",{"class":"col labelcol"},
move.category!=='Status'?[preact.h("em",null,"Power"),preact.h("br",null),""+move.basePower||"\u2014"]:''
),
preact.h("span",{"class":"col widelabelcol"},
preact.h("em",null,"Accuracy"),preact.h("br",null),move.accuracy&&move.accuracy!==true?move.accuracy+"%":"\u2014"
),
preact.h("span",{"class":"col pplabelcol"},
preact.h("em",null,"PP"),preact.h("br",null),pp
),

preact.h("span",{"class":"col movedesccol"},move.shortDesc)

));
};_proto.

renderTypeRow=function renderTypeRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var name=id.charAt(0).toUpperCase()+id.slice(1);

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"types/"+id,"data-target":"push","data-entry":"type|"+name},
preact.h("span",{"class":"col namecol"},this.renderName(name,matchStart,matchEnd)),

preact.h("span",{"class":"col typecol"},
preact.h("img",{src:Dex.resourcePrefix+"sprites/types/"+name+".png",alt:name,height:"14",width:"32","class":"pixelated"})
),

errorMessage
));
};_proto.

renderCategoryRow=function renderCategoryRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var name=id.charAt(0).toUpperCase()+id.slice(1);

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"categories/"+id,"data-target":"push","data-entry":"category|"+name},
preact.h("span",{"class":"col namecol"},this.renderName(name,matchStart,matchEnd)),

preact.h("span",{"class":"col typecol"},
preact.h("img",{src:Dex.resourcePrefix+"sprites/categories/"+name+".png",alt:name,height:"14",width:"32","class":"pixelated"})
),

errorMessage
));
};_proto.

renderArticleRow=function renderArticleRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;
var isSearchType=id==='pokemon'||id==='moves';
var name=window.BattleArticleTitles&&window.BattleArticleTitles[id]||
id.charAt(0).toUpperCase()+id.substr(1);

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"articles/"+id,"data-target":"push","data-entry":"article|"+name},
preact.h("span",{"class":"col namecol"},this.renderName(name,matchStart,matchEnd)),

preact.h("span",{"class":"col movedesccol"},isSearchType?"(search type)":"(article)"),

errorMessage
));
};_proto.

renderEggGroupRow=function renderEggGroupRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;

var name;
if(id==='humanlike')name='Human-Like';else
if(id==='water1')name='Water 1';else
if(id==='water2')name='Water 2';else
if(id==='water3')name='Water 3';
if(name){
if(matchEnd>5)matchEnd++;
}else{
name=id.charAt(0).toUpperCase()+id.slice(1);
}

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"egggroups/"+id,"data-target":"push","data-entry":"egggroup|"+name},
preact.h("span",{"class":"col namecol"},this.renderName(name,matchStart,matchEnd)),

preact.h("span",{"class":"col movedesccol"},"(egg group)"),

errorMessage
));
};_proto.

renderTierRow=function renderTierRow(id,matchStart,matchEnd,errorMessage){
var search=this.props.search;

var tierTable={
uber:"Uber",
caplc:"CAP LC",
capnfe:"CAP NFE"
};
var name=tierTable[id]||id.toUpperCase();

return preact.h("li",{"class":"result"},preact.h("a",{href:this.URL_ROOT+"tiers/"+id,"data-target":"push","data-entry":"tier|"+name},
preact.h("span",{"class":"col namecol"},this.renderName(name,matchStart,matchEnd)),

preact.h("span",{"class":"col movedesccol"},"(tier)"),

errorMessage
));
};_proto.

renderRow=function renderRow(row){
var search=this.props.search;
var type=row[0],id=row[1];
var matchStart=0;
var matchEnd=0;
if(row.length>3){
matchStart=row[2];
matchEnd=row[3];
}

var errorMessage=null;
var label;
if(label=search.filterLabel(type)){
errorMessage=preact.h("span",{"class":"col filtercol"},preact.h("em",null,label));
}else if(label=search.illegalLabel(id)){
errorMessage=preact.h("span",{"class":"col illegalcol"},preact.h("em",null,label));
}

switch(type){
case'html':
var sanitizedHTML=id.replace(/</g,'&lt;').
replace(/&lt;em>/g,'<em>').replace(/&lt;\/em>/g,'</em>').
replace(/&lt;strong>/g,'<strong>').replace(/&lt;\/strong>/g,'</strong>');
return preact.h("li",{"class":"result"},
preact.h("p",{dangerouslySetInnerHTML:{__html:sanitizedHTML}})
);
case'header':
return preact.h("li",{"class":"result"},preact.h("h3",null,id));
case'sortpokemon':
return this.renderPokemonSortRow();
case'sortmove':
return this.renderMoveSortRow();
case'pokemon':
return this.renderPokemonRow(id,matchStart,matchEnd,errorMessage);
case'move':
return this.renderMoveRow(id,matchStart,matchEnd,errorMessage);
case'item':
return this.renderItemRow(id,matchStart,matchEnd,errorMessage);
case'ability':
return this.renderAbilityRow(id,matchStart,matchEnd,errorMessage);
case'type':
return this.renderTypeRow(id,matchStart,matchEnd,errorMessage);
case'egggroup':
return this.renderEggGroupRow(id,matchStart,matchEnd,errorMessage);
case'tier':
return this.renderTierRow(id,matchStart,matchEnd,errorMessage);
case'category':
return this.renderCategoryRow(id,matchStart,matchEnd,errorMessage);
case'article':
return this.renderArticleRow(id,matchStart,matchEnd,errorMessage);
}
return preact.h("li",null,"Error: not found");
};_proto.

render=function render(){var _this2=this;
var search=this.props.search;
return preact.h("ul",{"class":"dexlist"},
search.filters&&preact.h("p",null,"Filters: ",

search.filters.map(function(_ref){var type=_ref[0],name=_ref[1];return(
preact.h("button",{"class":"filter",value:type+":"+name},"$",
name," ",preact.h("i",{"class":"fa fa-times-circle"})
));}
),
!search.query&&preact.h("small",{style:"color: #888"},"(backspace = delete filter)")
),
search.results&&


search.results.slice(0,20).map(function(result){return(
_this2.renderRow(result));}
)
);
};return PSSearchResults;}(preact.Component);
//# sourceMappingURL=battle-searchresults.js.map