
function Teambuilder(id, elem)
{
	var selfR = this;
	this.id = id;
	this.elem = elem;
	if (window.me)
	{
		this.meIdent = {name: me.name, named: 'init'};
		me.rooms[id] = {};
		this.me = me.rooms[id];
	}
	this.activeTeam = null;
	this.activeTeamIndex = -1;
	this.activePokemon = null;
	this.activePokemonIndex = -1;
	this.activeChart = null;
	this.exportMode = false;
	this.exportAllMode = false;

	this.movelists = {};
	
	elem.html('<div class="mainsection teamlist"></div><div class="mainsection teambuilder" style="display:none"></div>');

	this.teamListElem = elem.find('.teamlist');
	this.saveButtonElem = elem.find('.savebutton');
	this.teamBuilderElem = elem.find('.teambuilder');

	this.teamEditElem = null;
	this.teamNameEditElem = null;
	
	this.focus = function() {
		if (!selfR.movelists.bulbasaur) selfR.buildMovelists();
		selfR.updateMe();
	};
	this.init = function(data) {
		selfR.update(data);
		selfR.updateMe();
		selfR.updateMainElem();
	};
	this.message = function(message) {
		rooms.lobby.message(message);
	};
	this.send = function (message) {
		emit(socket, 'chat', {room:'',message:message});
	};
	this.update = function(data) {
		if (!data)
		{
			selfR.updateMainElem();
			return;
		}
		if (data.team === 'saved')
		{
			//alert('saved');
		}
		selfR.updateMainElem();
	};
	this.updateMainElem = function() {
		var text = '';
		
		if (selfR.activeTeam)
		{
			if (selfR.activePokemon)
			{
				text = '<button onclick="rooms[\''+selfR.id+'\'].formBack(event); return false"><i class="icon-chevron-left"></i> Entire Team</button> ';
				text += '<div class="teambar">';
				var isAdd = false;
				if (selfR.activeTeam.team.length && !selfR.activeTeam.team[selfR.activeTeam.team.length-1].name && selfR.activePokemonIndex !== selfR.activeTeam.team.length-1)
				{
					selfR.activeTeam.team.splice(selfR.activeTeam.team.length-1, 1);
				}
				for (var i=0; i<selfR.activeTeam.team.length; i++)
				{
					var set = selfR.activeTeam.team[i];
					var pokemonicon = '<span class="pokemonicon" id="pokemonicon-'+i+'" style="'+Tools.getIcon(set)+'"></span>';
					if (!set.name)
					{
						text += '<button disabled="disabled" class="addpokemon"><i class="icon-plus"></i></button> ';
						isAdd = true;
					}
					else if (i == selfR.activePokemonIndex)
					{
						text += '<button disabled="disabled" class="pokemon">'+pokemonicon+sanitize(set.name || '<i class="icon-plus"></i>')+'</button> ';
					}
					else
					{
						text += '<button onclick="rooms[\''+selfR.id+'\'].formSelectPokemon('+i+');return false" class="pokemon">'+pokemonicon+sanitize(set.name)+'</button> ';
					}
				}
				if (selfR.activeTeam.team.length < 6 && !isAdd)
				{
					text += '<button onclick="rooms[\''+selfR.id+'\'].formNewPokemon(event);return false" class="addpokemon"><i class="icon-plus"></i></button> ';
				}
				text += '</div>';
			}
			else
			{
				text = '<button onclick="rooms[\''+selfR.id+'\'].formBack(event); return false"><i class="icon-chevron-left"></i> Team List</button> <input class="textbox teamnameedit" type="text" class="teamnameedit" size="30" value="'+sanitize(selfR.activeTeam.name)+'" /> <button onclick="rooms[\''+selfR.id+'\'].formSave(event); return false" class="savebutton"><i class="icon-save"></i> Save</button> <button onclick="rooms[\''+selfR.id+'\'].formToggleExport(event); return false"><i class="icon-upload-alt"></i> Import/Export</button>';
			}
			
			if (selfR.exportMode)
			{
				text += '<textarea class="teamedit" onkeypress="return rooms[\''+selfR.id+'\'].formKeyPress(event)" rows="17">'+sanitize(selfR.toText(selfR.activeTeam.team))+'</textarea>';
			}
			else
			{
				text += '<div class="teamchartbox">';
				text += '<ol class="teamchart">';
				var i=0;
				if (!selfR.activePokemon && selfR.activeTeam.team.length && !selfR.activeTeam.team[selfR.activeTeam.team.length-1].species)
				{
					selfR.activeTeam.team.splice(selfR.activeTeam.team.length-1, 1);
				}
				if (exports.BattleFormats && !selfR.activePokemon)
				{
					text += '<li class="format-select"><label>Format:</label><select onchange="rooms[\''+selfR.id+'\'].formChangeFormat(this.value)"><option value="">(None)</option>';
					for (var i in exports.BattleFormats)
					{
						if (exports.BattleFormats[i].isTeambuilderFormat)
						{
							var activeFormat = (selfR.activeTeam.format === i?' selected="selected"':'');
							text += '<option value="'+i+'"'+activeFormat+'>'+exports.BattleFormats[i].name+'</option>';
						}
					}
					text += '</select></li>';
				}
				if (!selfR.activeTeam.team.length)
				{
					text += '<li><em>you have no pokemon lol</em></li>';
				}
				for (i=0; i<selfR.activeTeam.team.length; i++)
				{
					if (selfR.activePokemon)
					{
						i = selfR.activePokemonIndex;
					}
					var set = selfR.activeTeam.team[i];
					var template = Tools.getTemplate(set.species);
					text += '<li value="'+i+'">';
					if (!set.species)
					{
						text += '<div class="setchart"><div class="setcol setcol-icon" style="background-image:url(/sprites/bw/0.png);"><span class="itemicon"></span><div class="setcell setcell-pokemon"><label>Pokemon</label><input type="text" name="pokemon" class="chartinput" value="" /></div></div></div>';
						text += '</li>';
						if (selfR.activePokemon)
						{
							break;
						}
						continue;
					}
					text += '<div class="setchart-nickname">';
					text += '<label>Nickname</label><input type="text" value="'+sanitize(set.name||set.species)+'" onchange="rooms[\''+selfR.id+'\'].activeTeam.team['+i+'].name = (this.value||rooms[\''+selfR.id+'\'].activeTeam.team['+i+'].species)" />';
					text += '</div>';
					text += '<div class="setchart">';
					
					// icon
					var itemicon = '<span class="itemicon"'+(selfR.activePokemon?' id="'+selfR.id+'-itemicon"':'')+'></span>';
					if (set.item)
					{
						var item = Tools.getItem(set.item);
						itemicon = '<span class="itemicon"'+(selfR.activePokemon?' id="'+selfR.id+'-itemicon"':'')+' style="'+Tools.getItemIcon(item)+'"></span>';
					}
					text += '<div class="setcol setcol-icon"'+(selfR.activePokemon?' id="'+selfR.id+'-pokemonicon"':'')+' style='+Tools.getTeambuilderSprite(set)+';">'+itemicon+'<div class="setcell setcell-pokemon"><label>Pokemon</label><input type="text" name="pokemon" class="chartinput" value="'+sanitize(set.species)+'" /></div></div>';

					// details
					text += '<div class="setcol setcol-details"><div class="setrow">';
					text += '<div class="setcell setcell-details"><label>Details</label><button class="setdetails" tabindex="-1" id="'+selfR.id+'-setdetails" name="details" onclick="rooms[\''+selfR.id+'\'].formChartClick(event); return false">';

					var GenderChart = {
						'M': 'Male',
						'F': 'Female',
						'N': '&mdash;'
					};
					text += '<span class="detailcell detailcell-first"><label>Level</label>'+(set.level||100)+'</span>';
					text += '<span class="detailcell"><label>Gender</label>'+GenderChart[set.gender||'N']+'</span>';
					text += '<span class="detailcell"><label>Happiness</label>'+(set.happiness||255)+'</span>';
					text += '<span class="detailcell"><label>Shiny</label>'+(set.shiny?'Yes':'No')+'</span>';

					text += '</button></div>';
					text += '</div><div class="setrow">';
					text += '<div class="setcell setcell-item"><label>Item</label><input type="text" name="item" class="chartinput" value="'+sanitize(set.item)+'" /></div>';
					text += '<div class="setcell setcell-ability"><label>Ability</label><input type="text" name="ability" class="chartinput" value="'+sanitize(set.ability)+'" /></div>';
					text += '</div></div>';
					
					// moves
					if (!set.moves) set.moves = [];
					text += '<div class="setcol setcol-moves"><div class="setcell"><label>Moves</label>';
					text += '<input type="text" name="move1" class="chartinput" value="'+sanitize(set.moves[0])+'" /></div>';
					text += '<div class="setcell"><input type="text" name="move2" class="chartinput" value="'+sanitize(set.moves[1])+'" /></div>';
					text += '<div class="setcell"><input type="text" name="move3" class="chartinput" value="'+sanitize(set.moves[2])+'" /></div>';
					text += '<div class="setcell"><input type="text" name="move4" class="chartinput" value="'+sanitize(set.moves[3])+'" /></div>';
					text += '</div>';
					
					// stats
					text += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="setstats" id="'+selfR.id+'-setstats" name="stats" class="chartinput" onclick="rooms[\''+selfR.id+'\'].formChartClick(event); return false">';
					text += '<span class="statrow statrow-head"><label></label> <span class="statgraph"></span> <em>EV</em></span>';
					var stats = {};
					for (var j in StatNames)
					{
						stats[j] = selfR.getStat(j, set);
						var ev = '<em>'+(set.evs[j] || '')+'</em>';
						if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === j)
						{
							ev += '<small>+</small>';
						}
						else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === j)
						{
							ev += '<small>&minus;</small>';
						}
						var width = stats[j]*75/504;
						if (j=='hp') width = stats[j]*75/704;
						if (width>75) width = 75;
						var color = Math.floor(stats[j]*180/714);
						if (color>360) color = 360;
						text += '<span class="statrow"><label>'+StatNames[j]+'</label> <span class="statgraph"><span style="width:'+width+'px;background:hsl('+color+',40%,75%);"></span></span> '+ev+'</span>';
					}
					text += '</button></div></div>';
					
					text += '</div></li>';
					if (selfR.activePokemon)
					{
						break;
					}
				}
				if (!selfR.activePokemon && i < 6)
				{
					text += '<li><button onclick="rooms[\''+selfR.id+'\'].formNewPokemon(event); return false" class="majorbutton"><i class="icon-plus"></i> Add pokemon</button></li>';
				}
				text += '</ol>';
				text += '</div>';
			}
			
			if (selfR.activePokemon)
			{
				text += '<div id="'+selfR.id+'-results" class="teambuilder-results"></div>';
				selfR.chartPrevSearch = '[init]';
			}
			
			selfR.teamBuilderElem.html(text);
			selfR.teamEditElem = elem.find('.teamedit');
			selfR.teamNameEditElem = elem.find('.teamnameedit');
			selfR.chartElem = $('#'+selfR.id+'-results');
			
			var curInput = selfR.teamBuilderElem.find('input.chartinput');
			curInput.focus(selfR.formChartFocus);
			curInput.change(selfR.formChartChange);
			curInput.keyup(selfR.formChartKeyUp);
			curInput.keydown(selfR.formChartKeyDown);
			
			//selfR.teamBuilderElem.html(text);
			selfR.teamListElem.hide();
			selfR.teamBuilderElem.show();
		}
		else if (selfR.exportAllMode)
		{
			text = '<button onclick="rooms[\''+selfR.id+'\'].formBack(event); return false"><i class="icon-chevron-left"></i> Team List</button> <button onclick="rooms[\''+selfR.id+'\'].formSave(event); return false" class="savebutton"><i class="icon-save"></i> Save</button>';
			text += '<textarea class="teamedit" onkeypress="return rooms[\''+selfR.id+'\'].formKeyPress(event)" rows="17">'+sanitize(selfR.teamsToText())+'</textarea>';

			selfR.teamListElem.html(text);
			selfR.teamListElem.show();
			selfR.teamBuilderElem.hide();

			selfR.teamEditElem = elem.find('.teamedit');
		}
		else
		{
			text = '<p>lol zarel this is a horrible teambuilder</p>'
			text += '<p>i know stfu im not done with it</p>'
			text += '<ul>';
			if (!teams.length)
			{
				if (deletedTeamLoc >= 0)
				{
					text += '<li><button onclick="rooms[\''+selfR.id+'\'].formUndoDelete('+deletedTeamLoc+'); return false"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				text += '<li><em>you don\'t have any teams lol</em></li>';
			}
			else for (var i=0; i<teams.length+1; i++)
			{
				if (i === deletedTeamLoc)
				{
					text += '<li><button onclick="rooms[\''+selfR.id+'\'].formUndoDelete('+i+'); return false"><i class="icon-undo"></i> Undo Delete</button></li>';
				}
				if (i >= teams.length) break;
				
				if (i==2 && cookieTeams)
				{
					text += '<li>== UNSAVED TEAM LINE ==<br /><small>All teams below this line will not be saved.</small></li>';
				}
				
				var team = teams[i];
				
				var formatText = '';
				if (team.format)
				{
					formatText = '['+team.format+'] ';
				}

				text += '<li><button onclick="rooms[\''+selfR.id+'\'].formOpen('+i+'); return false" style="width:400px">'+formatText+'<strong>'+sanitize(team.name)+'</strong><br /><small>';
				for (var j=0; j<team.team.length; j++)
				{
					if (j!=0) text += ' / ';
					text += ''+sanitize(team.team[j].name);
				}
				text += '</small></button> <button onclick="rooms[\''+selfR.id+'\'].formOpen('+i+'); return false"><i class="icon-pencil"></i>Edit</button> <button onclick="rooms[\''+selfR.id+'\'].formDelete('+i+'); return false"><i class="icon-trash"></i>Delete</button></li>';
			}
			text += '</ul>';
			
			text += '<button onclick="rooms[\''+selfR.id+'\'].formNew(event); return false"><i class="icon-plus-sign"></i> New team</button>';
			text += ' <button onclick="rooms[\''+selfR.id+'\'].formNew(event, true); return false"><i class="icon-upload-alt"></i> Import from PO</button> <button onclick="rooms[\''+selfR.id+'\'].formToggleBackup(event); return false"><i class="icon-upload-alt"></i> Backup/Restore</button>';

			text += '<p><strong>Clearing your cookies or <code>localStorage</code> will delete your teams.</strong> If you want to clear your cookies or <code>localStorage</code>, you can use the Backup/Restore feature to save your teams as text first.</p>';

			if (teams.length >= 2 && cookieTeams)
			{
				text += ' <strong>WARNING:</strong> Additional teams WILL NOT BE SAVED.';
			}
			
			selfR.teamListElem.html(text);
			selfR.teamListElem.show();
			selfR.teamBuilderElem.hide();
		}
	};
	this.chartTimeout = null;
	this.chartPrevSearch = '[init]';
	this.arrangeCallback = {
		pokemon: function(pokemon) {
			if (!pokemon) {
				if (selfR.activeTeam) {
					if (selfR.activeTeam.format === 'uber') return ['Uber','OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'cap') return ['G5CAP','G4CAP','OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'ou') return ['OU','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'uu') return ['UU','BL2','RU','BL3','NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'ru') return ['RU','BL3','NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'nu') return ['NU','NFE','LC Uber','LC'];
					if (selfR.activeTeam.format === 'lc') return ['LC','NU'];
				}
				return ['OU','Unreleased','Uber','BL','UU','BL2','RU','BL3','NU','NFE','LC Uber','LC','G5CAP','G4CAP'];
			}
			var tierData = exports.BattleFormatsData[toId(pokemon.species)];
			if (!tierData) return 'Limbo';
			return tierData.tier;
		},
		item: function(item) {
			if (!item) return ['Items'];
			return 'Items';
		},
		ability: function(ability) {
			if (!selfR.activePokemon) return;
			var template = Tools.getTemplate(selfR.activePokemon.species);
			if (!ability) return ['Abilities', 'Dream World Ability'];
			if (!template.abilities) return 'Abilities';
			if (ability.name === template.abilities['0']) return 'Abilities';
			if (ability.name === template.abilities['1']) return 'Abilities';
			if (ability.name === template.abilities['DW']) return 'Dream World Ability';
			return 'Illegal';
		},
		move: function(move) {
			if (!selfR.activePokemon) return;
			if (!move) return ['Viable Moves', 'Usable Moves', 'Moves', 'Usable Sketch Moves', 'Sketch Moves'];
			var id = toId(selfR.activePokemon.species);
			var movelist = selfR.movelists[id];
			if (!movelist) return 'Illegal';
			if (!movelist[move.id]) {
				if (movelist['sketch']) {
					if (move.isViable) return 'Usable Sketch Moves';
					return 'Sketch Moves';
				}
				return 'Illegal';
			}
			if (exports.BattleFormatsData && exports.BattleFormatsData[id] && exports.BattleFormatsData[id].viableMoves && exports.BattleFormatsData[id].viableMoves[move.id]) return 'Viable Moves';
			if (move.isViable) return 'Usable Moves';
			return 'Moves';
		}
	};
	this.getStat = function(stat, set, evOverride, natureOverride) {
		if (!set) set = selfR.activePokemon;
		if (!set) return 0;
		var template = Tools.getTemplate(set.species);
		if (!template.exists) return 0;
		
		if (!set.ivs) set.ivs = {
			hp: 31,
			atk: 31,
			def: 31,
			spa: 31,
			spd: 31,
			spe: 31
		};
		if (!set.evs) set.evs = {
			hp: 0,
			atk: 0,
			def: 0,
			spa: 0,
			spd: 0,
			spe: 0
		};
		if (!set.level) set.level = 100;
		if (typeof set.ivs[stat] === 'undefined') set.ivs[stat] = 31;
		
		if (stat === 'hp') {
			if (template.baseStats['hp'] === 1) return 1;
			return Math.floor(Math.floor(2*template.baseStats['hp']+(set.ivs['hp']||0)+Math.floor((evOverride||set.evs['hp']||0)/4)+100)*set.level / 100 + 10);
		}
		var val = Math.floor(Math.floor(2*template.baseStats[stat]+(set.ivs[stat]||0)+Math.floor((evOverride||set.evs[stat]||0)/4))*set.level / 100 + 5);
		if (natureOverride) {
			val *= natureOverride;
		} else if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === stat) {
			val *= 1.1;
		} else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === stat) {
			val *= 0.9;
		}
		return Math.floor(val);
	};
	this.formChangeDetails = function() {
		var set = selfR.activePokemon;
		if (!set) return;
		
		var level = parseInt($('#'+selfR.id+'-level').val(),10);
		if (!level || level > 100 || level < 1) level = 100;
		
		if (level !== 100 || set.level) set.level = level;
		
		var happiness = parseInt($('#'+selfR.id+'-happiness').val(),10);
		if (happiness > 255) happiness = 255;
		if (happiness < 0) happiness = 255;
		
		if (happiness !== 255 || set.happiness || set.happiness === 0) set.happiness = happiness;
		
		var shiny = ($('#'+selfR.id+'-shiny-yes').length && $('#'+selfR.id+'-shiny-yes')[0].checked);
		
		if (shiny) set.shiny = true;
		else delete set.shiny;
		
		if ($('#'+selfR.id+'-gender-m').length && $('#'+selfR.id+'-gender-m')[0].checked)
		{
			set.gender = 'M';
		}
		else if ($('#'+selfR.id+'-gender-f').length && $('#'+selfR.id+'-gender-f')[0].checked)
		{
			set.gender = 'F';
		}
		else if ($('#'+selfR.id+'-gender-n').length && $('#'+selfR.id+'-gender-n')[0].checked)
		{
			//set.gender = 'N';
			delete set.gender;
		}
		
		selfR.updateDetails();
	};
	this.formChangePokemon = function(val) {
		var template = Tools.getTemplate(val);
		var newPokemon = !selfR.activePokemon.species;
		if (template.exists)
		{
			if (!selfR.activePokemon.species || selfR.activePokemon.name === selfR.activePokemon.species)
			{
				selfR.activePokemon.name = '';
			}
			selfR.activePokemon.species = val;
			if (selfR.activeTeam && selfR.activeTeam.format === 'lc' && !selfR.activePokemon.level) selfR.activePokemon.level = 5;
			if (template.id === 'garchomp') {
				selfR.activePokemon.ability = '';
			} else {
				selfR.activePokemon.ability = template.abilities['0'];
			}
			if (template.gender)
			{
				selfR.activePokemon.gender = template.gender;
			}
			else if (selfR.activePokemon.gender === 'N')
			{
				delete selfR.activePokemon.gender;
			}
			if (!selfR.activePokemon.name)
			{
				selfR.activePokemon.name = template.species;
			}
			selfR.updateMainElem();
			selfR.updateDetails();
			$('input[name=ability]').val(selfR.activePokemon.ability);
			selfR.teamBuilderElem.find('input[name=item]').select();
		}
	};
	this.updateDetailsForm = function() {
		var text = '';
		var set = selfR.activePokemon;
		var template = Tools.getTemplate(set.species);
		if (!set) return;
		text += '<h3>Details</h3>';
		text += '<div class="detailsform">';
		
		text += '<div class="formrow"><label class="formlabel">Level:</label><div><input type="number" min="1" max="100" step="1" name="level" value="'+(set.level||100)+'" id="'+selfR.id+'-level" class="inputform numform" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false" /></div></div>';
		
		text += '<div class="formrow"><label class="formlabel">Gender:</label><div>';
		if (template.gender)
		{
			var genderTable = {'M': "Male", 'F': "Female", 'N': "Genderless"};
			text += genderTable[template.gender];
		}
		else
		{
			text += '<input type="radio" name="gender" value="yes" id="'+selfR.id+'-gender-m" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false"'+(set.gender==='M'?' checked="checked"':'')+' /><label for="'+selfR.id+'-gender-m"> Male</label> ';
			text += '<input type="radio" name="gender" value="no" id="'+selfR.id+'-gender-f" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false"'+(set.gender==='F'?' checked="checked"':'')+' /><label for="'+selfR.id+'-gender-f"> Female</label> ';
			text += '<input type="radio" name="gender" value="no" id="'+selfR.id+'-gender-n" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false"'+(!set.gender?' checked="checked"':'')+' /><label for="'+selfR.id+'-gender-n"> Random</label>';
		}
		text += '</div></div>';
		
		text += '<div class="formrow"><label class="formlabel">Happiness:</label><div><input type="number" min="0" max="255" step="1" name="happiness" value="'+(typeof set.happiness==='number'?set.happiness:255)+'" id="'+selfR.id+'-happiness" class="inputform numform" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false" /></div></div>';
		
		text += '<div class="formrow"><label class="formlabel">Shiny:</label><div>';
		text += '<input type="radio" name="shiny" value="yes" id="'+selfR.id+'-shiny-yes" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false"'+(set.shiny?' checked="checked"':'')+' /><label for="'+selfR.id+'-shiny-yes"> Yes</label> ';
		text += '<input type="radio" name="shiny" value="no" id="'+selfR.id+'-shiny-no" onchange="rooms[\''+selfR.id+'\'].formChangeDetails();return false"'+(set.shiny?'':' checked="checked"')+' /><label for="'+selfR.id+'-shiny-no"> No</label>';
		text += '</div></div>';
		
		text += '</div>';
		selfR.chartElem.html(text);
		/* var curInput = selfR.teamBuilderElem.find('input.numform');
		curInput.keyup(selfR.formStatKeyUp);
		curInput.keydown(selfR.formStatKeyDown); */
	};
	this.guessRole = function() {
		var set = selfR.activePokemon;
		if (!set) return '?';
		if (!set.moves) return '?';

		var moveCount = {
			'Physical': 0,
			'Special': 0,
			'PhysicalOffense': 0,
			'SpecialOffense': 0,
			'PhysicalSetup': 0,
			'SpecialSetup': 0,
			'Support': 0,
			'Setup': 0,
			'Restoration': 0,
			'Offense': 0,
			'Stall': 0,
			'SpecialStall': 0,
			'PhysicalStall': 0,
			'Ultrafast': 0
		};
		var hasMove = {};
		var template = Tools.getTemplate(set.species || set.name);
		var stats = template.baseStats;
		var itemid = toId(set.item);
		var abilityid = toId(set.ability);

		if (set.moves.length < 4 && template.id !== 'unown' && template.id !== 'ditto') return '?';

		for (var i=0,len=set.moves.length; i<len; i++) {
			var move = Tools.getMove(set.moves[i]);
			hasMove[move.id] = 1;
			if (move.category === 'Status') {
				if (move.id === 'batonpass' || move.id === 'healingwish' || move.id === 'lunardance') {
					moveCount['Support']++;
				} else if (move.id === 'naturepower') {
					moveCount['Physical']++;
				} else if (move.id === 'protect' || move.id === 'detect') {
					moveCount['Stall']++;
				} else if (move.id === 'wish') {
					moveCount['Restoration']++;
					moveCount['Stall']++;
					moveCount['Support']++;
				} else if (move.heal) {
					moveCount['Restoration']++;
					moveCount['Stall']++;
				} else if (move.target === 'self') {
					if (move.id === 'agility' || move.id === 'rockpolish' || move.id === 'shellsmash' || move.id === 'growth' || move.id === 'workup') {
						moveCount['PhysicalSetup']++;
						moveCount['SpecialSetup']++;
					} else if (move.id === 'dragondance' || move.id === 'swordsdance' || move.id === 'coil' || move.id === 'bulkup' || move.id === 'curse' || move.id === 'bellydrum') {
						moveCount['PhysicalSetup']++;
					} else if (move.id === 'nastyplot' || move.id === 'tailglow' || move.id === 'quiverdance' || move.id === 'calmmind') {
						moveCount['SpecialSetup']++;
					}
					if (move.id === 'substitute') moveCount['Stall']++;
					moveCount['Setup']++;
				} else {
					if (move.id === 'toxic' || move.id === 'leechseed' || move.id === 'willowisp') moveCount['Stall']++;
					moveCount['Support']++;
				}
			} else if (move.id === 'rapidspin' || move.id === 'knockoff' || move.id === 'counter' || move.id === 'mirrorcoat' || move.id === 'metalburst') {
				moveCount['Support']++;
			} else if (move.id === 'nightshade' || move.id === 'seismictoss') {
				moveCount['Offense']++;
			} else {
				moveCount[move.category]++;
				moveCount['Offense']++;
				if (move.id === 'scald' || move.id === 'voltswitch' || move.id === 'uturn') moveCount[move.category] -= 0.2;
			}
		}
		if (hasMove['batonpass']) moveCount['Support'] += moveCount['Setup'];
		moveCount['PhysicalAttack'] = moveCount['Physical'];
		moveCount['Physical'] += moveCount['PhysicalSetup'];
		moveCount['SpecialAttack'] = moveCount['Special'];
		moveCount['Special'] += moveCount['SpecialSetup'];

		if (hasMove['dragondance'] || hasMove['quiverdance']) moveCount['Ultrafast'] = 1;

		var isFast = (stats.spe > 95);
		var physicalBulk = (stats.hp+75)*(stats.def+87);
		var specialBulk = (stats.hp+75)*(stats.spd+87);

		if (hasMove['willowisp'] || hasMove['acidarmor'] || hasMove['irondefense'] || hasMove['cottonguard']) {
			physicalBulk *= 1.6;
			moveCount['PhysicalStall']++;
		}
		else if (hasMove['scald'] || hasMove['bulkup'] || hasMove['coil'] || hasMove['cosmicpower']) {
			physicalBulk *= 1.3;
			if (hasMove['scald']) { // partial stall goes in reverse
				moveCount['SpecialStall']++;
			} else {
				moveCount['PhysicalStall']++;
			}
		}
		if (abilityid === 'flamebody') physicalBulk *= 1.1;

		if (hasMove['calmmind'] || hasMove['quiverdance']) {
			specialBulk *= 1.3;
			moveCount['SpecialStall']++;
		}
		if (template.id === 'tyranitar') specialBulk *= 1.5;

		if (hasMove['bellydrum']) {
			physicalBulk *= 0.6;
			specialBulk *= 0.6;
		}
		if (moveCount['Restoration']) {
			physicalBulk *= 1.5;
			specialBulk *= 1.5;
		} else if (hasMove['painsplit'] && hasMove['substitute']) {
			// SubSplit isn't generally a stall set
			moveCount['Stall']--;
		} else if (hasMove['painsplit'] || hasMove['rest']) {
			physicalBulk *= 1.4;
			specialBulk *= 1.4;
		}
		if ((hasMove['bodyslam'] || hasMove['thunder']) && abilityid === 'serenegrace' || hasMove['thunderwave']) {
			physicalBulk *= 1.1;
			specialBulk *= 1.1;
		}
		if ((hasMove['ironhead'] || hasMove['airslash']) && abilityid === 'serenegrace') {
			physicalBulk *= 1.1;
			specialBulk *= 1.1;
		}
		if (hasMove['gigadrain'] || hasMove['drainpunch'] || hasMove['hornleech']) {
			physicalBulk *= 1.15;
			specialBulk *= 1.15;
		}
		if (itemid === 'leftovers' || itemid === 'blacksludge') {
			physicalBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
			specialBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
		}
		if (hasMove['leechseed']) {
			physicalBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
			specialBulk *= 1 + 0.1*(1+moveCount['Stall']/1.5);
		}
		if ((itemid === 'flameorb' || itemid === 'toxicorb') && abilityid !== 'magicguard') {
			if (itemid === 'toxicorb' && abilityid === 'poisonheal') {
				physicalBulk *= 1 + 0.1*(2+moveCount['Stall']);
				specialBulk *= 1 + 0.1*(2+moveCount['Stall']);
			} else {
				physicalBulk *= 0.8;
				specialBulk *= 0.8;
			}
		}
		if (itemid === 'lifeorb') {
			physicalBulk *= 0.9;
			specialBulk *= 0.9;
		}
		if (abilityid === 'multiscale' || abilityid === 'magicguard' || abilityid === 'regenerator') {
			physicalBulk *= 1.4;
			specialBulk *= 1.4;
		}
		if (itemid === 'eviolite') {
			physicalBulk *= 1.5;
			specialBulk *= 1.5;
		}

		var bulk = physicalBulk + specialBulk;
		if (bulk < 46000 && stats.spe >= 70) isFast = true;
		moveCount['bulk'] = bulk;
		moveCount['physicalBulk'] = physicalBulk;
		moveCount['specialBulk'] = specialBulk;

		if (hasMove['agility'] || hasMove['dragondance'] || hasMove['quiverdance'] || hasMove['rockpolish'] || hasMove['shellsmash'] || hasMove['flamecharge']) {
			isFast = true;
		} else if (abilityid === 'unburden' || abilityid === 'speedboost' || abilityid === 'motordrive') {
			isFast = true;
			moveCount['Ultrafast'] = 1;
		} else if (abilityid === 'chlorophyll' || abilityid === 'swiftswim' || abilityid === 'sandrush') {
			isFast = true;
			moveCount['Ultrafast'] = 2;
		}
		if (hasMove['agility'] || hasMove['shellsmash'] || hasMove['autotomize'] || hasMove['shiftgear'] || hasMove['rockpolish']) moveCount['Ultrafast'] = 2;
		moveCount['Fast'] = isFast?1:0;

		this.moveCount = moveCount;
		this.hasMove = hasMove;

		if (template.id === 'ditto') return abilityid==='imposter'?'Physically Defensive':'Fast Bulky Support';
		if (template.id === 'shedinja') return 'Fast Physical Sweeper';

		if (itemid === 'choiceband' && moveCount['PhysicalAttack'] >= 2) {
			if (!isFast) return 'Bulky Band';
			return 'Fast Band';
		} else if (itemid === 'choicespecs' && moveCount['SpecialAttack'] >= 2) {
			if (!isFast) return 'Bulky Specs';
			return 'Fast Specs';
		} else if (itemid === 'choicescarf') {
			if (moveCount['PhysicalAttack'] === 0) return 'Special Scarf';
			if (moveCount['SpecialAttack'] === 0) return 'Physical Scarf';
			if (moveCount['PhysicalAttack'] > moveCount['SpecialAttack']) return 'Physical Biased Mixed Scarf';
			if (moveCount['PhysicalAttack'] < moveCount['SpecialAttack']) return 'Special Biased Mixed Scarf';
			if (stats.atk < stats.spa) return 'Special Biased Mixed Scarf';
			return 'Physical Biased Mixed Scarf';
		}

		if (template.id === 'unown') return 'Fast Special Sweeper';

		if (moveCount['PhysicalStall'] && moveCount['Restoration']) {
			return 'Specially Defensive';
		}
		if (moveCount['SpecialStall'] && moveCount['Restoration']) {
			return 'Physically Defensive';
		}

		var offenseBias = '';
		if (stats.spa > stats.atk && moveCount['Special'] > 1) offenseBias = 'Special';
		else if (stats.spa > stats.atk && moveCount['Special'] > 1) offenseBias = 'Special';
		else if (moveCount['Special'] > moveCount['Physical']) offenseBias = 'Special';
		else offenseBias = 'Physical';
		var offenseStat = stats[offenseBias === 'Special'?'spa':'atk'];

		if (moveCount['Stall'] + moveCount['Support'] <= 2 && bulk < 135000 && moveCount[offenseBias] >= 2) {
			if (isFast) {
				if (bulk > 80000 && !moveCount['Ultrafast']) return 'Bulky '+offenseBias+' Sweeper';
				return 'Fast '+offenseBias+' Sweeper';
			} else {
				if (moveCount[offenseBias] >= 3 || moveCount['Stall'] <= 0) {
					return 'Bulky '+offenseBias+' Sweeper';
				}
			}
		}

		if (isFast) {
			if (stats.spe > 100 || bulk < 55000 || moveCount['Ultrafast']) {
				return 'Fast Bulky Support';
			}
		}
		if (moveCount['SpecialStall']) return 'Physically Defensive';
		if (moveCount['PhysicalStall']) return 'Specially Defensive';
		if (template.id === 'blissey' || template.id === 'chansey') return 'Physically Defensive';
		if (specialBulk >= physicalBulk) return 'Specially Defensive';
		return 'Physically Defensive';
	};
	this.ensureMinEVs = function(evs, stat, min, evTotal) {
		if (!evs[stat]) evs[stat] = 0;
		var diff = min - evs[stat];
		if (diff <= 0) return evTotal;
		if (evTotal <= 504) {
			var change = Math.min(508 - evTotal, diff);
			evTotal += change;
			evs[stat] += change;
			diff -= change;
		}
		if (diff <= 0) return evTotal;
		var evPriority = {def:1, spd:1, hp:1, atk:1, spa:1, spe:1};
		for (var i in evPriority) {
			if (i === stat) continue;
			if (evs[i] && evs[i] > 128) {
				evs[i] -= diff;
				evs[stat] += diff;
				return evTotal;
			}
		}
		return evTotal; // can't do it :(
	};
	this.ensureMaxEVs = function(evs, stat, min, evTotal) {
		if (!evs[stat]) evs[stat] = 0;
		var diff = evs[stat] - min;
		if (diff <= 0) return evTotal;
		evs[stat] -= diff;
		evTotal -= diff;
		return evTotal; // can't do it :(
	};
	this.guessEVs = function(role) {
		var set = selfR.activePokemon;
		if (!set) return {};
		var template = Tools.getTemplate(set.species || set.name);
		var stats = template.baseStats;

		var hasMove = this.hasMove;
		var moveCount = this.moveCount;

		var evs = {};
		var plusStat = '';
		var minusStat = '';

		var statChart = {
			'Bulky Band': ['atk', 'hp'],
			'Fast Band': ['spe', 'atk'],
			'Bulky Specs': ['spa', 'hp'],
			'Fast Specs': ['spe', 'spa'],
			'Physical Scarf': ['atk', 'spe'],
			'Special Scarf': ['spa', 'spe'],
			'Physical Biased Mixed Scarf': ['atk', 'spe'],
			'Special Biased Mixed Scarf': ['spa', 'spe'],
			'Fast Physical Sweeper': ['spe', 'atk'],
			'Fast Special Sweeper': ['spe', 'spa'],
			'Bulky Physical Sweeper': ['atk', 'hp'],
			'Bulky Special Sweeper': ['spa', 'hp'],
			'Fast Bulky Support': ['spe', 'hp'],
			'Physically Defensive': ['def', 'hp'],
			'Specially Defensive': ['spd', 'hp']
		};

		plusStat = statChart[role][0];
		if (plusStat === 'spe' && (moveCount['Ultrafast'] || evs['spe'] < 252)) {
			if (statChart[role][1] === 'atk' || statChart[role][1] == 'spa') {
				plusStat = statChart[role][1];
			} else if (moveCount['Physical'] >= 3) {
				plusStat = 'atk';
			} else if (stats.spd > stats.def) {
				plusStat = 'spd';
			} else {
				plusStat = 'def';
			}
		}

		if (selfR.activeTeam && (selfR.activeTeam.format === 'hackmons' || selfR.activeTeam.format === 'balancedhackmons')) {
			evs = {hp:252, atk:252, def:252, spa:252, spd:252, spe:252};
			if (hasMove['gyroball'] || hasMove['trickroom']) delete evs.spe;
		} else {
			if (!statChart[role]) return {};

			var evTotal = 0;

			var i = statChart[role][0];
			var stat = this.getStat(i, null, 252, plusStat===i?1.1:1.0);
			var ev = 252;
			while (stat <= this.getStat(i, null, ev-4, plusStat===i?1.1:1.0)) ev -= 4;
			evs[i] = ev;
			evTotal += ev;

			var i = statChart[role][1];
			if (i === 'hp' && set.level && set.level < 20) i = 'spd';
			var stat = this.getStat(i, null, 252, plusStat===i?1.1:1.0);
			var ev = 252;
			if (i === 'hp' && (hasMove['substitute'] || hasMove['transform']) && stat == Math.floor(stat/4)*4) stat -= 1;
			while (stat <= this.getStat(i, null, ev-4, plusStat===i?1.1:1.0)) ev -= 4;
			evs[i] = ev;
			evTotal += ev;

			if (template.id === 'tentacruel') evTotal = this.ensureMinEVs(evs, 'spe', 16, evTotal);
			if (template.id === 'skarmory') evTotal = this.ensureMinEVs(evs, 'spe', 24, evTotal);
			if (template.id === 'jirachi') evTotal = this.ensureMinEVs(evs, 'spe', 32, evTotal);
			if (template.id === 'celebi') evTotal = this.ensureMinEVs(evs, 'spe', 36, evTotal);
			if (template.id === 'volcarona') evTotal = this.ensureMinEVs(evs, 'spe', 52, evTotal);
			if (template.id === 'gliscor') evTotal = this.ensureMinEVs(evs, 'spe', 72, evTotal);
			if (stats.spe == 97) evTotal = this.ensureMaxEVs(evs, 'spe', 220, evTotal);
			if (template.id === 'dragonite' && evs['hp']) evTotal = this.ensureMaxEVs(evs, 'spe', 220, evTotal);
			if (evTotal < 508) {
				var remaining = 508 - evTotal;
				if (!evs['atk'] && moveCount['PhysicalAttack']) {
					evs['atk'] = remaining;
				} else if (!evs['spa'] && moveCount['SpecialAttack']) {
					evs['spa'] = remaining;
				} else if (stats.hp == 1 && !evs['def']) {
					evs['def'] = remaining;
				} else if (stats.def === stats.spd && !evs['spd']) {
					evs['spd'] = remaining;
				} else if (!evs['hp'] && !(set.level && set.level < 20)) {
					evs['hp'] = remaining;
				} else if (!evs['spd']) {
					evs['spd'] = remaining;
				} else if (!evs['def']) {
					evs['def'] = remaining;
				}
			}

		}

		if (hasMove['gyroball'] || hasMove['trickroom']) {
			minusStat = 'spe';
		} else if (!moveCount['PhysicalAttack']) {
			minusStat = 'atk';
		} else if (!moveCount['SpecialAttack']) {
			minusStat = 'spa';
		} else if (stats.def > stats.spd) {
			minusStat = 'spd';
		} else {
			minusStat = 'def';
		}

		evs.plusStat = plusStat;
		evs.minusStat = minusStat;

		return evs;
	};
	this.updateStatForm = function(setGuessed) {
		var text = '';
		var set = selfR.activePokemon;
		text += '<h3>EVs</h3>';
		text += '<div class="statform">';
		var role = selfR.guessRole();

		var guessedEVs = {};
		var guessedPlus = '';
		var guessedMinus = '';
		text += '<p><small>Suggested spread:';
		if (role === '?') {
			text += '<br />(Please choose 4 moves to get a suggested spread)</small></p>';
		} else {
			guessedEVs = selfR.guessEVs(role);
			guessedPlus = guessedEVs.plusStat; delete guessedEVs.plusStat;
			guessedMinus = guessedEVs.minusStat; delete guessedEVs.minusStat;
			text += ' <br /></small><button onclick="rooms[\''+selfR.id+'\'].updateStatForm(true);return false">';
			for (var i in guessedEVs) {
				text += ''+guessedEVs[i]+' '+StatNames[i]+' / ';
			}
			text += ' (+'+StatNames[guessedPlus]+', -'+StatNames[guessedMinus]+')</button>';
			text += ' <small><br />('+role+' | bulk: phys '+Math.round(selfR.moveCount.physicalBulk/1000)+' + spec '+Math.round(selfR.moveCount.specialBulk/1000)+' = '+Math.round(selfR.moveCount.bulk/1000)+')</small></p>';
		}

		if (setGuessed) {
			set.evs = guessedEVs;
			selfR.plus = guessedPlus;
			selfR.minus = guessedMinus;
			selfR.updateNature();
		}

		var stats = {hp:'',atk:'',def:'',spa:'',spd:'',spe:''};
		if (!set) return;
		var nature = BattleNatures[set.nature || 'Serious'];
		if (!nature) nature = {};

		// label column
		text += '<div class="col labelcol"><div></div>';
		text += '<div><label>Hit Points</label></div><div><label>Attack</label></div><div><label>Defense</label></div><div><label>Special Attack</label></div><div><label>Special Defense</label></div><div><label>Speed</label></div>';
		text += '</div>';
		
		text += '<div class="col statscol" id="'+selfR.id+'-statscol"><div></div>';
		for (var i in stats)
		{
			stats[i] = selfR.getStat(i);
			text += '<div><b>'+stats[i]+'</b></div>';
		}
		text += '</div>';
		
		text += '<div class="col graphcol" id="'+selfR.id+'-graphcol"><div></div>';
		for (var i in stats)
		{
			var width = stats[i]*200/504;
			if (i=='hp') width = Math.floor(stats[i]*200/704);
			if (width > 199) width = 199;
			var color = Math.floor(stats[i]*180/714);
			if (color>360) color = 360;
			text += '<div><em><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',85%,35%)"></span></em></div>';
		}
		text += '<div><em>Remaining:</em></div>';
		text += '</div>';
		
		text += '<div class="col evcol"><div><strong>EVs</strong></div>';
		var totalev = 0;
		selfR.plus = '';
		selfR.minus = '';
		for (var i in stats)
		{
			var width = stats[i]*200/504;
			if (i=='hp') width = stats[i]*200/704;
			if (width > 200) width = 200;
			var val = ''+(set.evs[i]||'');
			if (nature.plus === i)
			{
				val += '+';
				selfR.plus = i;
			}
			if (nature.minus === i)
			{
				val += '-';
				selfR.minus = i;
			}
			text += '<div><input type="text" name="stat-'+i+'" value="'+val+'" class="inputform numform" onchange="rooms[\''+selfR.id+'\'].formChangeNature();return false" /></div>';
			totalev += (set.evs[i]||0);
		}
		if (totalev <= 510)
		{
			text += '<div id="'+selfR.id+'-totalev" class="totalev"><em>'+(totalev>508?0:508-totalev)+'</em></div>';
		}
		else
		{
			text += '<div id="'+selfR.id+'-totalev" class="totalev"><b>'+(510-totalev)+'</b></div>';
		}
		text += '</div>';
		
		text += '<div class="col ivcol"><div><strong>IVs</strong></div>';
		var totalev = 0;
		if (!set.ivs) set.ivs = {};
		for (var i in stats)
		{
			if (typeof set.ivs[i] === 'undefined') set.ivs[i] = 31;
			var val = ''+(set.ivs[i]);
			text += '<div><input type="text" name="iv-'+i+'" value="'+val+'" class="inputform numform" /></div>';
		}
		//text += '<div id="'+selfR.id+'-totaliv" class="totaliv"><b>'+''+'</b></div>';
		text += '</div>';
		
		text += '<p style="clear:both">Nature: <select id="'+selfR.id+'-nature" onchange="rooms[\''+selfR.id+'\'].formChangeNature(this.value);return false">';
		for (var i in BattleNatures)
		{
			var curNature = BattleNatures[i];
			text += '<option value="'+i+'"'+(curNature===nature?'selected="selected"':'')+'>'+i;
			if (curNature.plus)
			{
				text += ' (+'+StatNames[curNature.plus]+', -'+StatNames[curNature.minus]+')';
			}
			text += '</option>';
		}
		text += '</select></p>';
		
		text += '<p><em>Protip:</em> You can also set natures by typing "+" and "-" next to a stat.</p>';
		
		text += '</div>';
		selfR.chartElem.html(text);
		var curInput = selfR.teamBuilderElem.find('input.numform');
		curInput.keyup(selfR.formStatKeyUp);
		curInput.keydown(selfR.formStatKeyDown);
	};
	this.formChangeNature = function(nature) {
		var set = selfR.activePokemon;
		if (!set) return;
		
		if (nature)
		{
			set.nature = nature;
			selfR.plus = '';
			selfR.minus = '';
		}
		nature = BattleNatures[set.nature||'Serious'];
		for (var i in StatNames)
		{
			var val = ''+(set.evs[i]||'');
			if (nature.plus === i)
			{
				selfR.plus = i;
			}
			if (selfR.plus === i)
			{
				val += '+';
			}
			if (nature.minus === i)
			{
				selfR.minus = i;
			}
			if (selfR.minus === i)
			{
				val += '-';
			}
			selfR.chartElem.find('input[name=stat-'+i+']').val(val);
		}
		selfR.updateStatGraph();
	};
	this.updatePokemonSprite = function() {
		var set = selfR.activePokemon;
		if (!set) return;
		var shiny = (set.shiny?'-shiny':'');
		var sprite = Tools.getTemplate(set.species).spriteid;
		if (BattlePokemonSprites && BattlePokemonSprites[sprite] && BattlePokemonSprites[sprite].front && BattlePokemonSprites[sprite].front.anif && set.gender === 'F') {
			sprite+='-f';
		}

		$('#'+selfR.id+'-pokemonicon').css('background-image', Tools.getTeambuilderSprite(set).substr(17));

		$('#pokemonicon-'+selfR.activePokemonIndex).css('background', Tools.getIcon(set).substr(11));
		
		var item = Tools.getItem(set.item);
		if (item.id) {
			$('#'+selfR.id+'-itemicon').css('background', Tools.getItemIcon(item).substr(11));
		} else {
			$('#'+selfR.id+'-itemicon').css('background', 'none');
		}
		
		selfR.updateStatGraph();
	};
	this.updateStatGraph = function() {
		var text = '<div></div>';
		var stats = {hp:'',atk:'',def:'',spa:'',spd:'',spe:''};
		var set = selfR.activePokemon;
		if (!set) return;
		for (var i in stats)
		{
			stats[i] = selfR.getStat(i);
			text += '<div><b>'+stats[i]+'</b></div>';
		}
		$('#'+selfR.id+'-statscol').html(text);
		
		text = '<div></div>';
		var totalev = 0;
		for (var i in stats)
		{
			var width = stats[i]*200/504;
			if (i=='hp') width = stats[i]*200/704;
			if (width > 200) width = 200;
			var color = Math.floor(stats[i]*180/714);
			if (color>360) color = 360;
			text += '<div><em><span style="width:'+Math.floor(width)+'px;background:hsl('+color+',85%,45%);border-color:hsl('+color+',85%,35%)"></span></em></div>';
			totalev += (set.evs[i]||0);
		}
		text += '<div><em>Remaining:</em></div>';
		$('#'+selfR.id+'-graphcol').html(text);
		
		if (totalev <= 510)
		{
			$('#'+selfR.id+'-totalev').html('<em>'+(totalev>508?0:508-totalev)+'</em>');
		}
		else
		{
			$('#'+selfR.id+'-totalev').html('<b>'+(510-totalev)+'</b>');
		}
		$('#'+selfR.id+'-nature').val(set.nature||'Serious');
		
		text = '<span class="statrow statrow-head"><label></label> <span class="statgraph"></span> <em>EV</em></span>';
		for (var j in StatNames)
		{
			var ev = '<em>'+(set.evs[j] || '')+'</em>';
			if (BattleNatures[set.nature] && BattleNatures[set.nature].plus === j)
			{
				ev += '<small>+</small>';
			}
			else if (BattleNatures[set.nature] && BattleNatures[set.nature].minus === j)
			{
				ev += '<small>&minus;</small>';
			}
			var width = stats[j]*75/504;
			if (j=='hp') width = stats[j]*75/704;
			if (width>75) width = 75;
			var color = Math.floor(stats[j]*180/714);
			if (color>360) color = 360;
			text += '<span class="statrow"><label>'+StatNames[j]+'</label> <span class="statgraph"><span style="width:'+width+'px;background:hsl('+color+',40%,75%);"></span></span> '+ev+'</span>';
		}
		$('#'+selfR.id+'-setstats').html(text);
	};
	this.updateDetails = function() {
		var set = selfR.activePokemon;
		if (!set) return;
		
		var text = '';
		var GenderChart = {
			'M': 'Male',
			'F': 'Female',
			'N': '&mdash;'
		};
		text += '<span class="detailcell detailcell-first"><label>Level</label>'+(set.level||100)+'</span>';
		text += '<span class="detailcell"><label>Gender</label>'+GenderChart[set.gender||'N']+'</span>';
		text += '<span class="detailcell"><label>Happiness</label>'+(typeof set.happiness==='number'?set.happiness:255)+'</span>';
		text += '<span class="detailcell"><label>Shiny</label>'+(set.shiny?'Yes':'No')+'</span>';
		$('#'+selfR.id+'-setdetails').html(text);
		selfR.updatePokemonSprite();
	};
	this.formStatKeyDown = function(e) {
		var inputName = $(e.target).prop('name'); // like I remember how to do this outside of jQuery
		modifier = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.cmdKey);
		switch (inputName)
		{
		case 'stat-hp':
			if (e.keyCode === 9 && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && !e.cmdKey)
			{
				e.stopPropagation();
				e.preventDefault();
				var moveElem = selfR.teamBuilderElem.find('input[name=move1]');
				if (moveElem.val()) moveElem = selfR.teamBuilderElem.find('input[name=move2]');
				if (moveElem.val()) moveElem = selfR.teamBuilderElem.find('input[name=move3]');
				if (moveElem.val()) moveElem = selfR.teamBuilderElem.find('input[name=move4]');
				moveElem.select();
				return;
			}
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-atk]').select();
				return;
			}
			break;
		case 'stat-atk':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-def]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-hp]').select();
				return;
			}
			break;
		case 'stat-def':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-spa]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-atk]').select();
				return;
			}
			break;
		case 'stat-spa':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-spd]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-def]').select();
				return;
			}
			break;
		case 'stat-spd':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-spe]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-spa]').select();
				return;
			}
			break;
		case 'stat-spe':
			if (e.keyCode === 13)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.formBack();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=stat-spd]').select();
				return;
			}
			break;
		case 'iv-hp':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-atk]').select();
				return;
			}
			break;
		case 'iv-atk':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-def]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-hp]').select();
				return;
			}
			break;
		case 'iv-def':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-spa]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-atk]').select();
				return;
			}
			break;
		case 'iv-spa':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-spd]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-def]').select();
				return;
			}
			break;
		case 'iv-spd':
			if (e.keyCode === 13 || (e.keyCode === 40 && !modifier))
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-spe]').select();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-spa]').select();
				return;
			}
			break;
		case 'iv-spe':
			if (e.keyCode === 13)
			{
				e.stopPropagation();
				e.preventDefault();
				return;
			}
			if (e.keyCode === 38 && !modifier)
			{
				e.stopPropagation();
				e.preventDefault();
				selfR.chartElem.find('input[name=iv-spd]').select();
				return;
			}
			break;
		}
	};
	this.updateNature = function() {
		var set = selfR.activePokemon; if (!set) return;
		if (selfR.plus === '' || selfR.minus === '') set.nature = 'Serious';
		else
		{
			for (var i in BattleNatures)
			{
				if (BattleNatures[i].plus === selfR.plus && BattleNatures[i].minus === selfR.minus)
				{
					set.nature = i;
					break;
				}
			}
		}
	};
	this.formStatKeyUp = function(e) {
		var inputName = '';
		inputName = $(e.target).prop('name'); // like I remember how to do this outside of jQuery
		var val = Math.abs(parseInt(e.target.value, 10));
		var set = selfR.activePokemon;
		var lastchar = e.target.value.substr(e.target.value.length-1);
		var firstchar = e.target.value.substr(0,1);
		var stat = inputName.substr(5);
		var natureChange = true;
		if ((lastchar === '+' || firstchar === '+') && stat !== 'hp')
		{
			selfR.plus = stat;
		}
		else if ((lastchar === '-' || lastchar === "\u2212" || firstchar === '-' || firstchar === "\u2212") && stat !== 'hp')
		{
			selfR.minus = stat;
		}
		else if (selfR.plus === stat)
		{
			selfR.plus = '';
		}
		else if (selfR.minus === stat)
		{
			selfR.minus = '';
		}
		else
		{
			natureChange = false;
		}
		if (natureChange)
		{
			selfR.updateNature();
		}
		if (!set) return;
		if (val > 252) val = 252;
		if (val < 0) val = 0;
		if (inputName.substr(0,3) === 'iv-')
		{
			if (val > 31) val = 31;
		}
		modifier = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.cmdKey);
		switch (inputName)
		{
		case 'stat-hp':
			if (!set.evs) set.evs = {};
			if (set.evs.hp !== val)
			{
				set.evs.hp = val;
				selfR.updateStatGraph();
			}
			break;
		case 'stat-atk':
			if (!set.evs) set.evs = {};
			if (set.evs.atk !== val)
			{
				set.evs.atk = val;
				selfR.updateStatGraph();
			}
			break;
		case 'stat-def':
			if (!set.evs) set.evs = {};
			if (set.evs.def !== val)
			{
				set.evs.def = val;
				selfR.updateStatGraph();
			}
			break;
		case 'stat-spa':
			if (!set.evs) set.evs = {};
			if (set.evs.spa !== val)
			{
				set.evs.spa = val;
				selfR.updateStatGraph();
			}
			break;
		case 'stat-spd':
			if (!set.evs) set.evs = {};
			if (set.evs.spd !== val)
			{
				set.evs.spd = val;
				selfR.updateStatGraph();
			}
			break;
		case 'stat-spe':
			if (!set.evs) set.evs = {};
			if (set.evs.spe !== val)
			{
				set.evs.spe = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-hp':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.hp !== val)
			{
				set.ivs.hp = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-atk':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.atk !== val)
			{
				set.ivs.atk = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-def':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.def !== val)
			{
				set.ivs.def = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-spa':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.spa !== val)
			{
				set.ivs.spa = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-spd':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.spd !== val)
			{
				set.ivs.spd = val;
				selfR.updateStatGraph();
			}
			break;
		case 'iv-spe':
			if (!set.ivs) set.ivs = {};
			if (set.ivs.spe !== val)
			{
				set.ivs.spe = val;
				selfR.updateStatGraph();
			}
			break;
		}
	};
	this.updateChart = function(target, type, init) {
		if (selfR.chartTimeout) clearTimeout(selfR.chartTimeout);
		if (type === 'stats')
		{
			selfR.updateStatForm();
			return;
		}
		if (type === 'details')
		{
			selfR.updateDetailsForm();
			return;
		}
		selfR.chartTimeout = setTimeout(function() {
			if (!target) return;
			var search = target.value;
			if (search === selfR.chartPrevSearch) return;
			selfR.chartPrevSearch = search;
			selfR.chartElem.html(Chart.chart(search, type, init, selfR.arrangeCallback[type]));
			selfR.chartTimeout = null;
		}, init?0:200);
	};
	this.updateMe = function() {
	};
	this.parseText = function(text, teams) {
		var text = text.split("\n");
		var team = [];
		var curSet = null;
		if (teams === true) {
			window.teams = [];
			teams = window.teams;
		}
		for (var i=0; i<text.length; i++) {
			var line = $.trim(text[i]);
			if (line === '' || line === '---') {
				curSet = null;
			} else if (line.substr(0, 3) === '===' && teams) {
				team = [];
				line = $.trim(line.substr(3, line.length-6));
				var format = '';
				var bracketIndex = line.indexOf(']');
				if (bracketIndex >= 0) {
					format = line.substr(1, bracketIndex-1);
					line = $.trim(line.substr(bracketIndex+1));
				}
				teams.push({
					name: line,
					format: format,
					team: team
				});
			} else if (!curSet) {
				curSet = {name: '', species: '', gender: ''};
				team.push(curSet);
				var atIndex = line.lastIndexOf(' @ ');
				if (atIndex !== -1) {
					curSet.item = line.substr(atIndex+3);
					line = line.substr(0, atIndex);
				}
				if (line.substr(line.length-4) === ' (M)') {
					curSet.gender = 'M';
					line = line.substr(0, line.length-4);
				}
				if (line.substr(line.length-4) === ' (F)') {
					curSet.gender = 'F';
					line = line.substr(0, line.length-4);
				}
				var parenIndex = line.lastIndexOf(' (');
				if (line.substr(line.length-1) === ')' && parenIndex !== -1) {
					line = line.substr(0, line.length-1);
					curSet.species = line.substr(parenIndex+2);
					line = line.substr(0, parenIndex);
					curSet.name = line;
				} else {
					curSet.name = line;
					curSet.species = line;
				}
			} else if (line.substr(0, 7) === 'Trait: ') {
				line = line.substr(7);
				curSet.ability = line;
			} else if (line === 'Shiny: Yes') {
				curSet.shiny = true;
			} else if (line.substr(0, 7) === 'Level: ') {
				line = line.substr(7);
				curSet.level = +line;
			} else if (line.substr(0, 11) === 'Happiness: ') {
				line = line.substr(11);
				curSet.happiness = +line;
			} else if (line.substr(0, 9) === 'Ability: ') {
				line = line.substr(9);
				curSet.ability = line;
			} else if (line.substr(0, 5) === 'EVs: ') {
				line = line.substr(5);
				var evLines = line.split('/');
				curSet.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
				for (var j=0; j<evLines.length; j++)
				{
					var evLine = $.trim(evLines[j]);
					var spaceIndex = evLine.indexOf(' ');
					if (spaceIndex === -1) continue;
					var statid = StatIDs[evLine.substr(spaceIndex+1)];
					var statval = parseInt(evLine.substr(0, spaceIndex));
					if (!statid) continue;
					curSet.evs[statid] = statval;
				}
			} else if (line.substr(0, 5) === 'IVs: ') {
				line = line.substr(5);
				var ivLines = line.split(' / ');
				curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
				for (var j=0; j<ivLines.length; j++)
				{
					var ivLine = ivLines[j];
					var spaceIndex = ivLine.indexOf(' ');
					if (spaceIndex === -1) continue;
					var statid = StatIDs[ivLine.substr(spaceIndex+1)];
					var statval = parseInt(ivLine.substr(0, spaceIndex));
					if (!statid) continue;
					curSet.ivs[statid] = statval;
				}
			} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
				var natureIndex = line.indexOf(' Nature');
				if (natureIndex === -1) natureIndex = line.indexOf(' nature');
				if (natureIndex === -1) continue;
				line = line.substr(0, natureIndex);
				curSet.nature = line;
			} else if (line.substr(0,1) === '-' || line.substr(0,1) === '~') {
				line = line.substr(1);
				if (line.substr(0,1) === ' ') line = line.substr(1);
				if (!curSet.moves) curSet.moves = [];
				if (line.substr(0,14) === 'Hidden Power [') {
					var hptype = line.substr(14, line.length-15);
					line = 'Hidden Power ' + hptype;
					if (!curSet.ivs) {
						curSet.ivs = {};
						for (var stat in exports.BattleTypeChart[hptype].HPivs) {
							curSet.ivs[stat] = exports.BattleTypeChart[hptype].HPivs[stat];
						}
					}
				}
				curSet.moves.push(line);
			}
		}
		return team;
	};
	this.teamsToText = function() {
		var text = '';
		for (var i=0,len=teams.length; i<len; i++) {
			var team = teams[i];
			text += '=== '+(team.format?'['+team.format+'] ':'')+team.name+' ===\n\n';
			text += this.toText(team.team);
			text += '\n';
		}
		return text;
	};
	this.toText = function(team) {
		var text = '';
		for (var i=0; i<team.length; i++)
		{
			var curSet = team[i];
			if (curSet.name !== curSet.species)
			{
				text += ''+curSet.name+' ('+curSet.species+')';
			}
			else
			{
				text += ''+curSet.species;
			}
			if (curSet.gender === 'M') text += ' (M)';
			if (curSet.gender === 'F') text += ' (F)';
			if (curSet.item)
			{
				text += ' @ '+curSet.item;
			}
			text += "\n";
			if (curSet.ability)
			{
				text += 'Trait: '+curSet.ability+"\n";
			}
			if (curSet.level && curSet.level != 100)
			{
				text += 'Level: '+curSet.level+"\n";
			}
			if (curSet.shiny)
			{
				text += 'Shiny: Yes\n';
			}
			if (curSet.happiness && curSet.happiness !== 255)
			{
				text += 'Happiness: '+curSet.happiness+"\n";
			}
			var first = true;
			for (var j in curSet.evs)
			{
				if (!curSet.evs[j]) continue;
				if (first)
				{
					text += 'EVs: ';
					first = false;
				}
				else
				{
					text += ' / ';
				}
				text += ''+curSet.evs[j]+' '+POStatNames[j];
			}
			if (!first)
			{
				text += "\n";
			}
			if (curSet.nature)
			{
				text += ''+curSet.nature+' Nature'+"\n";
			}
			var first = true;
			if (curSet.ivs)
			{
				var defaultIvs = true;
				var hpType = false;
				for (var j=0; j<curSet.moves.length; j++)
				{
					var move = curSet.moves[j];
					if (move.substr(0,13) === 'Hidden Power ' && move.substr(0,14) !== 'Hidden Power [')
					{
						hpType = move.substr(13);
						for (var stat in StatNames)
						{
							if (curSet.ivs[stat] !== exports.BattleTypeChart[hpType].HPivs[stat])
							{
								if (!(typeof curSet.ivs[stat] === 'undefined' && exports.BattleTypeChart[hpType].HPivs[stat] == 31) &&
									!(curSet.ivs[stat] == 31 && typeof exports.BattleTypeChart[hpType].HPivs[stat] === 'undefined'))
								{
									defaultIvs = false;
									break;
								}
							}
						}
					}
				}
				if (defaultIvs && !hpType)
				{
					for (var stat in StatNames)
					{
						if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined)
						{
							defaultIvs = false;
							break;
						}
					}
				}
				if (!defaultIvs)
				{
					for (var stat in curSet.ivs)
					{
						if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
						if (first)
						{
							text += 'IVs: ';
							first = false;
						}
						else
						{
							text += ' / ';
						}
						text += ''+curSet.ivs[stat]+' '+POStatNames[stat];
					}					
				}
			}
			if (!first)
			{
				text += "\n";
			}
			if (curSet.moves) for (var j=0; j<curSet.moves.length; j++)
			{
				var move = curSet.moves[j];
				if (move.substr(0,13) === 'Hidden Power ')
				{
					move = move.substr(0,13) + '[' + move.substr(13) + ']';
				}
				text += '- '+move+"\n";
			}
			text += "\n";
		}
		return text;
	};
	this.formToggleExport = function() {
		selfR.exportMode = !selfR.exportMode;
		selfR.updateMainElem();
	};
	this.formToggleBackup = function() {
		selfR.exportAllMode = true;
		selfR.updateMainElem();
	};
	this.chartTypes = {
		pokemon: 'pokemon',
		item: 'item',
		ability: 'ability',
		move1: 'move',
		move2: 'move',
		move3: 'move',
		move4: 'move',
		stats: 'stats'
	};
	this.formChartClick = function(e) {
		var inputName = $(e.target).closest('button').prop('name'); // like I remember how to do this outside of jQuery
		var type = inputName;
		selfR.activeChart = {
			type: type,
			inputName: inputName
		};
		if (!selfR.activePokemon)
		{
			var i = parseInt($(e.target).closest('li').prop('value'));
			selfR.activePokemon = selfR.activeTeam.team[i];
			selfR.activePokemonIndex = i;
			selfR.updateMainElem();
			selfR.teamBuilderElem.find('button[name='+inputName+']').click();
			return;
		}
		selfR.updateChart(e.target, type, true);
		selfR.teamBuilderElem.find('input[name=stat-hp]').select();
	};
	this.formSelectPokemon = function(i) {
		if (i === selfR.activePokemonIndex) return;
		selfR.activePokemon = selfR.activeTeam.team[i];
		selfR.activePokemonIndex = i;
		selfR.updateMainElem();
		selfR.teamBuilderElem.find('input[name=pokemon]').select();
		return;
	};
	this.formChartFocus = function(e) {
		var inputName = $(e.target).prop('name'); // like I remember how to do this outside of jQuery
		$(e.target).removeClass('incomplete');
		if (!inputName) inputName = $(e.target).closest('button').prop('name');
		var type = selfR.chartTypes[inputName];
		if (!selfR.activePokemon)
		{
			var i = parseInt($(e.target).closest('li').prop('value'));
			selfR.activePokemon = selfR.activeTeam.team[i];
			selfR.activePokemonIndex = i;
			selfR.updateMainElem();
			if (type === 'stats')
			{
				selfR.teamBuilderElem.find('button[name='+inputName+']').click();
			}
			else
			{
				selfR.teamBuilderElem.find('input[name='+inputName+']').select();
			}
			return;
		}
		if (selfR.activeChart && selfR.activeChart.inputName !== inputName)
		{
			selfR.chartPrevSearch = '[init]';
		}
		selfR.activeChart = {
			type: type,
			inputName: inputName
		};
		Chart.selectCallback = selfR.formSelect;
		Chart.firstResult = e.target.value;
		selfR.updateChart(e.target, type, true);
	};
	this.formChartChange = function(e) {
		var inputName = $(e.target).prop('name'); // like I remember how to do this outside of jQuery
		var type = selfR.chartTypes[inputName];
		var val = Chart.firstResult;
		if (toId(val) !== toId(e.target.value)) {
			$(e.target).addClass('incomplete');
			return;
		}
		switch (selfR.activeChart.inputName)
		{
		case 'pokemon':
			selfR.formChangePokemon(val);
			e.target.value = selfR.activePokemon.species;
			break;
		case 'item':
			if (val || e.target.value === '')
			{
				selfR.activePokemon.item = val;
				selfR.updatePokemonSprite();
			}
			e.target.value = selfR.activePokemon.item;
			break;
		case 'ability':
			if (val)
			{
				selfR.activePokemon.ability = val;
			}
			e.target.value = selfR.activePokemon.ability;
			break;
		case 'move1':
			if (val || e.target.value === '')
			{
				selfR.activePokemon.moves[0] = val;
				selfR.formChooseMove(val);
			}
			e.target.value = selfR.activePokemon.moves[0];
			break;
		case 'move2':
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (val || e.target.value === '')
			{
				selfR.activePokemon.moves[1] = val;
				selfR.formChooseMove(val);
			}
			e.target.value = selfR.activePokemon.moves[1];
			break;
		case 'move3':
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (!selfR.activePokemon.moves[1]) selfR.activePokemon.moves[1] = '';
			if (val || e.target.value === '')
			{
				selfR.activePokemon.moves[2] = val;
				selfR.formChooseMove(val);
			}
			e.target.value = selfR.activePokemon.moves[2];
			break;
		case 'move4':
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (!selfR.activePokemon.moves[1]) selfR.activePokemon.moves[1] = '';
			if (!selfR.activePokemon.moves[2]) selfR.activePokemon.moves[2] = '';
			if (val || e.target.value === '')
			{
				selfR.activePokemon.moves[3] = val;
				selfR.formChooseMove(val);
			}
			e.target.value = selfR.activePokemon.moves[3];
			break;
		}
	};
	this.formChartKeyDown = function(e) {
		modifier = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.cmdKey);
		if (e.keyCode === 13 || (e.keyCode === 9 && !modifier))
		{
			e.stopPropagation();
			e.preventDefault();
			selfR.formSelect(Chart.firstResult);
			return;
		}
	};
	this.formChartKeyUp = function(e) {
		var inputName = $(e.target).prop('name'); // like I remember how to do this outside of jQuery
		var type = selfR.chartTypes[inputName];
		selfR.updateChart(e.target, type);
	};
	this.formChooseMove = function(move) {
		var set = selfR.activePokemon;
		if (!set) return;
		if (move.substr(0,13) === 'Hidden Power ')
		{
			set.ivs = {};
			for (var i in exports.BattleTypeChart[move.substr(13)].HPivs)
			{
				set.ivs[i] = exports.BattleTypeChart[move.substr(13)].HPivs[i];
			}
		}
		else if (move === 'Gyro Ball' || move === 'Trick Room')
		{
			set.ivs = {spe:0};
		}
	};
	this.formSelect = function(val) {
		if (!selfR.activeChart || !selfR.activePokemon) return;
		switch (selfR.activeChart.inputName)
		{
		case 'pokemon':
			if (!val) return;
			selfR.formChangePokemon(val);
			break;
		case 'item':
			//if (!val) return;
			val = val || '';
			if (selfR.activePokemon.item !== val)
			{
				selfR.activePokemon.item = val;
				selfR.updateMainElem();
			}
			selfR.teamBuilderElem.find('input[name=ability]').select();
			break;
		case 'ability':
			if (!val) return;
			if (selfR.activePokemon.ability !== val)
			{
				selfR.activePokemon.ability = val;
				selfR.updateMainElem();
			}
			selfR.teamBuilderElem.find('input[name=move1]').select();
			break;
		case 'move1':
			val = val || '';
			if (selfR.activePokemon.moves[0] !== val)
			{
				selfR.activePokemon.moves[0] = val;
				selfR.formChooseMove(val);
				selfR.updateMainElem();
			}
			if (!val)
			{
				selfR.teamBuilderElem.find('button[name=stats]').click();
				return;
			}
			selfR.teamBuilderElem.find('input[name=move2]').select();
			break;
		case 'move2':
			val = val || '';
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (selfR.activePokemon.moves[1] !== val)
			{
				selfR.activePokemon.moves[1] = val;
				selfR.formChooseMove(val);
				selfR.updateMainElem();
			}
			if (!val)
			{
				selfR.teamBuilderElem.find('button[name=stats]').click();
				return;
			}
			selfR.teamBuilderElem.find('input[name=move3]').select();
			break;
		case 'move3':
			val = val || '';
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (!selfR.activePokemon.moves[1]) selfR.activePokemon.moves[1] = '';
			if (selfR.activePokemon.moves[2] !== val)
			{
				selfR.activePokemon.moves[2] = val;
				selfR.formChooseMove(val);
				selfR.updateMainElem();
			}
			if (!val)
			{
				selfR.teamBuilderElem.find('button[name=stats]').click();
				return;
			}
			selfR.teamBuilderElem.find('input[name=move4]').select();
			break;
		case 'move4':
			val = val || '';
			if (!selfR.activePokemon.moves[0]) selfR.activePokemon.moves[0] = '';
			if (!selfR.activePokemon.moves[1]) selfR.activePokemon.moves[1] = '';
			if (!selfR.activePokemon.moves[2]) selfR.activePokemon.moves[2] = '';
			if (selfR.activePokemon.moves[3] !== val)
			{
				selfR.activePokemon.moves[3] = val;
				selfR.formChooseMove(val);
				selfR.updateMainElem();
			}
			selfR.teamBuilderElem.find('button[name=stats]').click();
			//selfR.formBack();
			break;
		}
	};
	this.formChangeFormat = function(format) {
		if (selfR.activeTeam)
		{
			if (!format)
			{
				delete selfR.activeTeam.format;
			}
			else
			{
				selfR.activeTeam.format = format;
			}
		}
	};
	this.formSave = function() {
		if (selfR.activeTeam)
		{
			selfR.activeTeam.name = selfR.teamNameEditElem.val();
			if (selfR.exportMode)
			{
				selfR.activeTeam.team = selfR.parseText(selfR.teamEditElem.val());
			}
		}
		if (selfR.exportAllMode)
		{
			selfR.parseText(selfR.teamEditElem.val(), true);
		}

		if (window.localStorage)
		{
			$.cookie('showdown_team1', null);
			$.cookie('showdown_team2', null);
			$.cookie('showdown_team3', null);
			
			localStorage.setItem('showdown_teams', JSON.stringify(teams));
		}
		else
		{
			if (teams[0])
			{
				$.cookie('showdown_team1', null);
				$.cookie('showdown_team1', $.toJSON(teams[0]),{expires:60,domain:'pokemonshowdown.com'});
			}
			else
			{
				$.cookie('showdown_team1', null);
				$.cookie('showdown_team1', null, {domain:'pokemonshowdown.com'});
			}
			if (teams[1])
			{
				$.cookie('showdown_team2', null);
				$.cookie('showdown_team2', $.toJSON(teams[1]),{expires:60,domain:'pokemonshowdown.com'});
			}
			else
			{
				$.cookie('showdown_team2', null);
				$.cookie('showdown_team2', null, {domain:'pokemonshowdown.com'});
			}
			$.cookie('showdown_team3', null);
		}
		
		selectedTeam = -2;
		
		selfR.formBack();
	};
	this.formBack = function() {
		if (selfR.exportMode || selfR.exportAllMode)
		{
			selfR.exportMode = false;
			selfR.exportAllMode = false;
			selfR.updateMainElem();
			return;
		}
		if (selfR.activePokemon)
		{
			selfR.activePokemon = null;
			selfR.activePokemonIndex = -1;
			selfR.updateMainElem();
			return;
		}
		selfR.activeTeam = null;
		selfR.activeTeamIndex = -1;
		selfR.update();
	};
	this.formNew = function(e, importMode) {
		var newTeam = {
			name: 'Untitled '+(teams.length+1),
			team: []
		};
		teams.push(newTeam);
		selfR.activeTeam = newTeam;
		selfR.activeTeamIndex = teams.length-1;
		if (importMode)
		{
			selfR.exportMode = true;
		}
		selfR.update();
		//selfR.teamNameEditElem.val(selfR.activeTeam.name);
		//selfR.formReset();
	};
	this.formNewPokemon = function() {
		if (!selfR.activeTeam) return;
		var newPokemon = {
			name: '',
			species: '',
			item: '',
			nature: '',
			evs: {},
			ivs: {},
			moves: []
		};
		selfR.activeTeam.team.push(newPokemon);
		selfR.activePokemon = newPokemon;
		selfR.activePokemonIndex = selfR.activeTeam.team.length-1;
		selfR.updateMainElem();
		selfR.teamBuilderElem.find('.setcell-pokemon input').select();
	};
	this.formOpen = function(i) {
		selfR.activeTeam = teams[i];
		selfR.activeTeamIndex = i;
		selfR.update();
		//selfR.teamNameEditElem.val(selfR.activeTeam.name);
		//selfR.teamEditElem.val(selfR.toText(selfR.activeTeam.team));
	};
	this.formDelete = function(i) {
		deletedTeamLoc = i;
		deletedTeam = teams.splice(i,1)[0];
		selfR.formSave();
	};
	this.formUndoDelete = function() {
		if (deletedTeamLoc >= 0)
		{
			teams.splice(deletedTeamLoc,0,deletedTeam);
			deletedTeam = null;
			deletedTeamLoc = -1;
			selfR.formSave();
		}
	};
	this.formKeyPress = function() {
		//selfR.saveButtonElem[0].disabled = false;
		//selfR.saveButtonElem.html('Save');
	};
	this.formReset = function() {
		selfR.teamEditElem.val('Donphan (M) @ Custap Berry :: Trait: Sturdy :: EVs: 252 HP / 252 Atk / 4 Spd :: Adamant Nature (+Atk, -SAtk) :: - Earthquake :: - Ice Shard :: - Rapid Spin :: - Stealth Rock ::  :: Venusaur (M) @ Life Orb :: Trait: Chlorophyll :: EVs: 44 HP / 4 Def / 252 SAtk / 208 Spd :: Modest Nature (+SAtk, -Atk) :: - Energy Ball :: - Hidden Power [Fire] :: - Sludge Bomb :: - Growth ::  :: Sawsbuck (M) @ Life Orb :: Trait: Chlorophyll :: EVs: 72 HP / 252 Atk / 4 SDef / 180 Spd :: Adamant Nature (+Atk, -SAtk) :: - Horn Leech :: - Return :: - Nature Power :: - Swords Dance ::  :: Ninetales (M) @ Air Balloon :: Trait: Drought :: EVs: 240 HP / 24 SAtk / 244 SDef :: Calm Nature (+SDef, -Atk) :: - Overheat :: - Will-O-Wisp :: - Sunny Day :: - Substitute ::  :: Kingdra (M) @ Choice Specs :: Trait: Swift Swim :: EVs: 4 HP / 252 SAtk / 252 Spd :: Modest Nature (+SAtk, -Atk) :: - Draco Meteor :: - Hydro Pump :: - Hidden Power [Fighting] :: - Sleep Talk ::  :: Darmanitan (M) @ Choice Scarf :: Trait: Sheer Force :: EVs: 4 HP / 252 Atk / 252 Spd :: Adamant Nature (+Atk, -SAtk) :: - Flare Blitz :: - Rock Slide :: - Superpower :: - U-turn'.replace(/ :: /g, "\n"));
	};

	this.buildMovelists = function() {
		for (var pokemon in window.BattlePokedex) {
			var template = Tools.getTemplate(pokemon);
			var moves = {};
			var alreadyChecked = {};
			do {
				alreadyChecked[template.speciesid] = true;
				if (template.learnset) {
					for (var l in template.learnset) {
						moves[l] = true;
					}
				}
				if (template.speciesid === 'shaymin') {
					template = Tools.getTemplate('shayminsky');
				} else if (toId(template.basespecies) !== toId(template.species) && toId(template.basespecies) !== 'kyurem') {
					template = Tools.getTemplate(template.basespecies);
				} else {
					template = Tools.getTemplate(template.prevo);
				}
			} while (template && template.species && !alreadyChecked[template.speciesid]);
			selfR.movelists[pokemon] = moves;
		}
	};

	selfR.init();
}

var deletedTeam = null;
var deletedTeamLoc = -1;
var selectedTeam = -1;
function selectTeam(i)
{
	if (typeof i === 'undefined') i = -1;
	i = parseInt(i);
	//if (i === selectedTeam) return;

	if (i < 0) {
		rooms.lobby.send('/utm null');
	} else {
		rooms.lobby.send('/utm '+$.toJSON(teams[i].team));
	}

	// if (i < 0) {
	// 	emit(socket, 'saveTeam', {team: null});
	// } else {
	// 	emit(socket, 'saveTeam', {team: teams[i].team});
	// }
	selectedTeam = i;
}
