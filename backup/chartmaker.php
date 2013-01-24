<?php

include 'persist.lib.php';

$BattleAliases = array(
	// formes
	"shaymins" => "Shaymin-Sky",
	"rotomh" => "Rotom-Heat",
	"rotomw" => "Rotom-Wash",
	"rotomf" => "Rotom-Frost",
	"rotoms" => "Rotom-Fan",
	"rotomc" => "Rotom-Mow",
	"meloettas" => "Meloetta-Pirouette",
	"meloettap" => "Meloetta-Pirouette",
	"giratinao" => "Giratina-Origin",
	"wormadamg" => "Wormadam-Sandy",
	"wormadams" => "Wormadam-Trash",
	"wormadamground" => "Wormadam-Sandy",
	"wormadamsteel" => "Wormadam-Trash",
	"deoxysa" => "Deoxys-Attack",
	"deoxyss" => "Deoxys-Speed",
	"deoxysd" => "Deoxys-Defense",
	"deoxysdefence" => "Deoxys-Defense",
	"basculinb" => "Basculin-Blue",
	"darmanitanzenmode" => "Darmanitan-Zen",
	"cherrimsunny" => "Cherrim-Sunshine",
	"cherrims" => "Cherrim-Sunshine",
	"castforms" => "Castform-Sunny",
	"castformr" => "Castform-Rainy",
	"castformh" => "Castform-Snowy",
	"castformfire" => "Castform-Sunny",
	"castformwater" => "Castform-Rainy",
	"castformice" => "Castform-Snowy",

	// base formes
	"nidoranfemale" => "Nidoran-F",
	"nidoranmale" => "Nidoran-M",
	"giratinaaltered" => "Giratina",
	"giratinaa" => "Giratina",
	"cherrimovercast" => "Cherrim",
	"cherrimo" => "Cherrim",
	"meloettaaria" => "Meloetta",
	"meloettaa" => "Meloetta",
	"basculinred" => "Basculin",
	"basculinr" => "Basculin",

	// items
	"cb" => "Choice Band",
	"band" => "Choice Band",
	"lefties" => "Leftovers",
	"lo" => "Life Orb",

	// pokemon
	"dnite" => "Dragonite",
	"ttar" => "Tyranitar",
	"rank" => "Reuniclus",
	"ferry" => "Ferrothorn",
	"forry" => "Forretress",
	"luke" =>  "Lucario",
	"poryz" => "Porygon-Z",
	"pz" => "Porygon-Z",
	"pory2" => "Porygon2",
	"p2" => "Porygon2",

	// moves
	"sd" => "Swords Dance",
	"dd" => "Dragon Dance",
	"hjk" => "Hi Jump Kick",
	"cc" => "Close Combat",
	"np" => "Nasty Plot",
	"sr" => "Stealth Rock",
	"tr" => "Trick Room",
	"tbolt" => "Thunderbolt",
	"wow" => "Will-O-Wisp",
	"qd" => "Quiver Dance",
	"tspikes" => "Toxic Spikes",
	"twave" => "Thunder Wave",
	"eq" => "Earthquake",
	"cm" => "Calm Mind",
	"se" => "Stone Edge",

	// Japanese names
	"birijion" => "Virizion",
	"terakion" => "Terrakion",
	"agirudaa" => "Accelgor",
	"randorosu" => "Landorus",
	"urugamosu" => "Volcarona",
	"erufuun" => "Whimsicott",
	"doryuuzu" => "Excadrill",
	"burungeru" => "Jellicent",
	"nattorei" => "Ferrothorn",
	"shandera" => "Chandelure",
	"roobushin" => "Conkeldurr",
	"ononokusu" => "Haxorus",
	"sazandora" => "Hydreigon",
	"chirachiino" => "Cinccino",
	"kyuremu" => "Kyurem",
	"jarooda" => "Serperior",
	"zoroaaku" => "Zoroark",
	"shinboraa" => "Sigilyph",
	"barujiina" => "Mandibuzz",
	"rankurusu" => "Reuniclus",
	"borutorosu" => "Thundurus"
	// there's no need to type out the other Japanese names
	// I'll autogenerate them at some point
);

if (isset($_REQUEST['1']))
{

	$file = file('data/pokedex.csv');

	$BattlePokemon = array();
	$BattlePokemonByNumber = array();

	$jp = false;

	$TableMaleOnly = array('32'=> 1,'33'=> 1,'34'=> 1,'106'=> 1,'107'=> 1,'128'=> 1,'236'=> 1,'237'=> 1,'313'=> 1,'381'=> 1,'414'=> 1,'475'=> 1,'538'=> 1,'539'=> 1,'627'=> 1,'628'=> 1,'641'=> 1,'642'=> 1,'645'=> 1,);

	$TableFemaleOnly = array('-2'=> 1,'29'=> 1,'30'=> 1,'31'=> 1,'113'=> 1,'115'=> 1,'124'=> 1,'238'=> 1,'241'=> 1,'242'=> 1,'314'=> 1,'380'=> 1,'413'=> 1,'416'=> 1,'440'=> 1,'478'=> 1,'488'=> 1,'548'=> 1,'549'=> 1,'629'=> 1,'630'=> 1,);

	$TableGenderless = array('-55'=> 1,'81'=> 1,'82'=> 1,'100'=> 1,'101'=> 1,'120'=> 1,'121'=> 1,'132'=> 1,'137'=> 1,'144'=> 1,'145'=> 1,'146'=> 1,'150'=> 1,'150'=> 1,'201'=> 1,'233'=> 1,'243'=> 1,'244'=> 1,'245'=> 1,'249'=> 1,'250'=> 1,'251'=> 1,'292'=> 1,'337'=> 1,'338'=> 1,'343'=> 1,'344'=> 1,'374'=> 1,'375'=> 1,'376'=> 1,'377'=> 1,'378'=> 1,'379'=> 1,'382'=> 1,'383'=> 1,'384'=> 1,'385'=> 1,'386'=> 1,'436'=> 1,'437'=> 1,'462'=> 1,'474'=> 1,'479'=> 1,'480'=> 1,'481'=> 1,'482'=> 1,'483'=> 1,'484'=> 1,'486'=> 1,'487'=> 1,'489'=> 1,'490'=> 1,'491'=> 1,'492'=> 1,'493'=> 1,'494'=> 1,'599'=> 1,'600'=> 1,'601'=> 1,'615'=> 1,'622'=> 1,'638'=> 1,'639'=> 1,'640'=> 1,'643'=> 1,'644'=> 1,'646'=> 1,'647'=> 1,'648'=> 1,'649'=> 1,);

	foreach ($file as $line)
	{
		$args = explode(',',$line);
		
		$negative = false;
		if (substr($args[0],0,1) === '-')
		{
			$args[0] = substr($args[0],1);
			$negative = true;
		}
		
		if (!ctype_digit($args[0])) continue;
		
		while (substr($args[0],0,1)==='0') $args[0] = substr($args[0],1);
		$num = intval($args[0]);
		if ($negative) $num = -$num;
		$species = $args[1];
		$speciesid = preg_replace('/[^a-z0-9]+/', '', strtolower($species));
		if ($BattlePokemon[$species] && $jp) continue;
		$forme = '';
		$formeletter = '';
		$spriteid = $speciesid;
		$basespecies = $species;
		if ($loc = strrpos($species,'-') && $species !== 'Ho-Oh' && $species !== 'Ho-oh' && $species !== 'Porygon-Z')
		{
			$loc = strrpos($species,'-');
			$basespecies = substr($species, 0, $loc);
			$forme = substr($species, $loc+1);
			
			$basespeciesid = preg_replace('/[^a-z0-9]+/', '', strtolower($basespecies));
			$formeid = preg_replace('/[^a-z0-9]+/', '', strtolower($forme));
			$spriteid = $basespeciesid.'-'.$formeid;
			
			$formeletter = substr($forme,0,1);
			if ($speciesid === 'rotommow') $formeletter = 'C';
			if ($speciesid === 'rotomfan') $formeletter = 'S';
			if ($speciesid === 'wormadamsandy') $formeletter = 'G';
			if ($speciesid === 'wormadamtrash') $formeletter = 'S';
			if ($speciesid === 'castformsunny') $formeletter = 'F';
			if ($speciesid === 'castformrainy') $formeletter = 'W';
			if ($speciesid === 'castformsnowy') $formeletter = 'I';
		}
		$types = array($args[2]);
		if ($args[3]) $types[] = $args[3];
		$baseStats = array(
			'hp' => intval($args[4]),
			'atk' => intval($args[5]),
			'def' => intval($args[6]),
			'spa' => intval($args[7]),
			'spd' => intval($args[8]),
			'spe' => intval($args[9]),
		);
		$abilities = array(0 => $args[29],1=>$args[30],'DW'=>$args[31]);
		$BattlePokemon[$speciesid] = array(
			'name' => $species,
			'id' => $speciesid,
			'species' => $species,
			'speciesid' => $speciesid,
			'basespecies' => $basespecies,
			'forme' => $forme,
			'formeletter' => $formeletter,
			'spriteid' => $spriteid,
			'num' => $num,
			'types' => $types,
			'baseStats' => $baseStats,
			'abilities' => $abilities,
			'height' => $args[40+5],
			'heightm' => floatval(substr($args[40+5],0,-2)),
			'weight' => $args[41+5],
			'weightkg' => floatval(substr($args[41+5],0,-3)),
			'nfe' => false,
			'gender' => '',
			'prevo' => '',
			//'jp' => $jp,
		);
		
		if ($TableMaleOnly[''.$num]) $BattlePokemon[$speciesid]['gender'] = 'M';
		if ($TableFemaleOnly[''.$num]) $BattlePokemon[$speciesid]['gender'] = 'F';
		if ($TableGenderless[''.$num]) $BattlePokemon[$speciesid]['gender'] = 'N';
		
		if (!$BattlePokemonByNumber[$num]) $BattlePokemonByNumber[$num] = $speciesid;
		if ($species === 'Genesect')
		{
			$jp = true;
			break;
		}
	}

	persist_save('BattlePokemon', 'data/pokedex.inc.php');
	persist_save('BattlePokemonByNumber', 'data/pokedex_numlookup.inc.php');

	echo '<a href="chartmaker.php?2">next</a><br /><br />';

	var_export($BattlePokemon['necturna']);

}
else if (isset($_REQUEST['2']))
{
	include 'data/pokedex.inc.php';
	include 'data/pokedex_numlookup.inc.php';
	
	// prevos
	$file = file('data/po_evos.txt');
	foreach ($file as $line)
	{
		if (!$line) continue;
		$args = explode(' ', $line);
		
		$poke = $BattlePokemonByNumber[intval($args[0])];
		
		$args = array_splice($args,1);
		
		$BattlePokemon[$poke]['nfe'] = true;
		foreach ($args as $arg)
		{
			$BattlePokemon[$BattlePokemonByNumber[intval($args[0])]]['prevo'] = $poke;
		}
	}
	
	persist_save('BattlePokemon', 'data/pokedex.inc.php');
	//file_put_contents('data/pokedex.js', 'exports.BattlePokedex = '.json_encode($BattlePokemon));

	echo '<a href="chartmaker.php?3">next</a><br /><br />';

	var_export($BattlePokemon['ivysaur']);
}
else if (isset($_REQUEST['3']))
{
	include 'data/pokedex.inc.php';
	include 'data/typechart.inc.php';

	$file = file('data/movesets.csv');

	foreach ($file as $line)
	{
		$args = explode(',',$line);
		if (!ctype_digit($args[3])) continue;
		$species = $args[0];
		$speciesid = preg_replace('/[^a-z0-9]+/', '', strtolower($species));
		if ($BattleAliases[$speciesid])
		{
			//echo $species." to ".$BattleAliases[$speciesid]." | ";
			$species = $BattleAliases[$speciesid];
			$speciesid = preg_replace('/[^a-z0-9]+/', '', strtolower($species));
		}
		if (!$speciesid) continue;

		if (!$BattlePokemon[$speciesid]['viablemoves']) $BattlePokemon[$speciesid]['viablemoves'] = array();
		
		for ($i=10; $i<19; $i++)
		{
			$move = $args[$i];
			$moveid = preg_replace('/[^a-z0-9]+/', '', strtolower($move));
			
			if (substr($moveid, 0, strlen('hiddenpower')) === 'hiddenpower') $moveid = 'hiddenpower';
			if ($moveid === 'none' || !$moveid) continue;
			
			$BattlePokemon[$speciesid]['viablemoves'][$moveid] = $move;
			$BattlePokemon[$speciesid]['viable'] = true;
		}
	}

		file_put_contents('data/pokedex.js', 'exports.BattlePokedex = '.json_encode($BattlePokemon));

	echo '<a href="chartmaker.php?4">next</a><br /><br />';
	var_export($BattlePokemon['weavile']);

}
else if (isset($_REQUEST['4']))
{
	include 'data/pokedex.inc.php';
	
	$fp = fopen('data/pokedex-mini.js','w');
	fwrite($fp, "BattlePokemonSprites = {\n");

/*
$remap = array(
	'wormadam-ground' => 'wormadam-sandy',
	'wormadam-steel' => 'wormadam-trash',
);
foreach ($remap as $from => $to)
{
	rename('sprites/bwani/'.$from.'.gif', 'sprites/bwani/'.$to.'.gif');
	rename('sprites/bwani-shiny/'.$from.'.gif', 'sprites/bwani-shiny/'.$to.'.gif');
	rename('sprites/bwani-back/'.$from.'.gif', 'sprites/bwani-back/'.$to.'.gif');
	rename('sprites/bwani-back-shiny/'.$from.'.gif', 'sprites/bwani-back-shiny/'.$to.'.gif');
	rename('sprites/bwani/'.$from.'-f.gif', 'sprites/bwani/'.$to.'-f.gif');
	rename('sprites/bwani-shiny/'.$from.'-f.gif', 'sprites/bwani-shiny/'.$to.'-f.gif');
	rename('sprites/bwani-back/'.$from.'-f.gif', 'sprites/bwani-back/'.$to.'-f.gif');
	rename('sprites/bwani-back-shiny/'.$from.'-f.gif', 'sprites/bwani-back-shiny/'.$to.'-f.gif');
}
die();
*/

	foreach($BattlePokemon as $poke)
	{
		if ($poke['jp']) break;
		//$filename = str_pad(''.$poke['num'], 3, "0", STR_PAD_LEFT);
		//if (!file_exists('sprites/ani-src/'.$filename.'.gif')) $filename = str_replace('_','-',$filename);
		//if (substr($filename,0,2)==='0-') $filename = '-0'.substr($filename,2);
		//if ($poke['forme']) $filename = $filename.'-'.strtolower($poke['forme']);
				
		$filename = $poke['spriteid'];
		$size = @getimagesize('sprites/bwani/'.$filename.'.gif');
		if ($size)
		{
			if (!$BattlePokemon[$poke['speciesid']]['sprite']) $BattlePokemon[$poke['speciesid']]['sprite'] = array();
			
			$BattlePokemon[$poke['speciesid']]['sprite']['ani'] = array(
				'w' => $size[0],
				'h' => $size[1]
			);
		}

		$size = @getimagesize('sprites/bwani-back/'.$filename.'.gif');
		if ($size)
		{
			$BattlePokemon[$poke['speciesid']]['sprite']['backani'] = array(
				'w' => $size[0],
				'h' => $size[1]
			);
		}
		
		$size = @getimagesize('sprites/bwani/'.$filename.'-f.gif');
		if ($size)
		{
			$BattlePokemon[$poke['speciesid']]['sprite']['anif'] = array(
				'w' => $size[0],
				'h' => $size[1]
			);
		}
		$size = @getimagesize('sprites/bwani-back/'.$filename.'-f.gif');
		if ($size)
		{
			$BattlePokemon[$poke['speciesid']]['sprite']['backanif'] = array(
				'w' => $size[0],
				'h' => $size[1]
			);
		}
	}
	foreach($BattlePokemon as $poke)
	{
		if ($poke['sprite']['ani'])
		{
			fwrite($fp, "	\"{$poke['speciesid']}\": {");
			if ($poke['num'])
			{
				fwrite($fp, "num:{$poke['num']}, ");
			}
			fwrite($fp, "front:{ani:{w: {$poke['sprite']['ani']['w']}, h: {$poke['sprite']['ani']['h']}}");
			if ($poke['sprite']['anif'])
			{
				fwrite($fp, ", anif:{w: {$poke['sprite']['anif']['w']}, h: {$poke['sprite']['anif']['h']}}");
			}
			fwrite($fp, "}");
			if ($poke['sprite']['backani'])
			{
				fwrite($fp, ",back:{ani:{w: {$poke['sprite']['backani']['w']}, h: {$poke['sprite']['backani']['h']}}");
				if ($poke['sprite']['backanif'])
				{
					fwrite($fp, ", anif:{w: {$poke['sprite']['backanif']['w']}, h: {$poke['sprite']['backanif']['h']}}");
				}
				fwrite($fp, "}");
			}
			if ($poke['sprite']['f'])
			{
				fwrite($fp, ",f:1");
			}
			fwrite($fp, "},\n");
		}
		else if ($poke['num'])
		{
			fwrite($fp, "	\"{$poke['speciesid']}\": {");
			fwrite($fp, "num:{$poke['num']}");
			fwrite($fp, "},\n");
		}
	}
	fwrite($fp, "	done:null\n};\n");
	fclose($fp);
    
	var_export($BattlePokemon['bulbasaur']);
}
