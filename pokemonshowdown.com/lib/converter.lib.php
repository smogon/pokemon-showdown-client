<?php

/*

License: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>

This license DOES NOT extend to any other files of the Pokemon replay viewer.

*/

// include_once 'persist.lib.php';
// include_once 'replays.inc.php';
include_once 'data/pokedex.inc.php';
include_once 'data/typechart.inc.php';

function startsRemove(&$str, $substr) {
	if (substr($str, 0, strlen($substr)) === $substr) {
		$str = substr($str, strlen($substr));
		return true;
	}
	return false;
}
function endsRemove(&$str, $substr) {
	if (substr($str, -strlen($substr)) === $substr) {
		$str = substr($str, 0, -strlen($substr));
		return true;
	}
	return false;
}
function startsWith($str, $substr) {
	return (substr($str, 0, strlen($substr)) === $substr);
}
function endsWith($str, $substr) {
	return (substr($str, -strlen($substr)) === $substr);
}
function uppercaseFirstLetter($str) {
	// I am raging at PO replays for this.
	return strtoupper(substr($str,0,1)).substr($str,1);
}
function lowercaseFirstLetter($str) {
	// I am raging at PO replays for this.
	return strtolower(substr($str,0,1)).substr($str,1);
}
function namePokemon($pokemon) {
	global $pokemontable, $allpokemon, $currentpokemon;
	$pokemonConv = $pokemon;
	$pos = strrpos($pokemon, '(');
	if ($pos) $pokemonConv = substr($pokemon, 0, $pos);
	$pokemonConv = str_replace(' ', '', $pokemonConv);
	$currentpokemon[$pokemonConv] = $pokemon;
}
function matchName($pokemon) {
	global $currentpokemon;
	foreach ($currentpokemon as $mpoke => $cpoke) {
		startsRemove($mpoke,'ally-');
		startsRemove($mpoke,'foe-');
		if ($pokemon === $mpoke) return $mpoke;
		else if ($pokemon === uppercaseFirstLetter($mpoke)) return $mpoke;
	}
	return $pokemon;
}
function resolvePokemon($pokemon) {
	global $convertNotDone, $allpokemon, $allyname, $playernames, $pokemontable, $lastPokemon, $returnNow, $currentpokemon;
	if ($pokemontable[$pokemon]) {
		$currentpokemon[$pokemontable[$pokemon]] = $pokemontable[$pokemon];
		$lastPokemon = $pokemontable[$pokemon];
		return $pokemontable[$pokemon];
	}
	$pokeid = '';
	//	echo '['.$playernames[0].'|'.$pokemon.']';
	if (startsRemove($pokemon, "The foe's ") || startsRemove($pokemon, "the foe's ")) {
		$pokeid = $pokemon;
		$pokemon = 'foe-'.$pokemon;
	} else if (startsRemove($pokemon, $playernames[0]."'s ") || startsRemove($pokemon, uppercaseFirstLetter($playernames[0])."'s ")) {
		$pokeid = $pokemon;
		$pokemon = 'ally-'.$pokemon;
	} else if (startsRemove($pokemon, $playernames[1]."'s ") || startsRemove($pokemon, uppercaseFirstLetter($playernames[1])."'s ")) {
		$pokeid = $pokemon;
		$pokemon = 'foe-'.$pokemon;
	} else {
		$pokeid = $pokemon;
		$pokemon = 'ally-'.matchName($pokemon);
	}
	$pokemon = str_replace(' ', '', $pokemon);
	if ($convertNotDone && $pokeid && $allpokemon[$pokeid]) {
		if (substr($pokemon,0,4) === 'foe-') {
			$allyname = 'foeof-'.$allpokemon[$pokeid];
			$returnNow = true;
			return '';
		}
		$allyname = $allpokemon[$pokeid];
		$returnNow = true;
		return '';
	}
	$lastPokemon = $pokemon;
	
	if ($GLOBALS['BattlePokemon'][getSpecies($pokemon)]['number'] >= 494) {
		$GLOBALS['gen'] = 5;
	}
	if ($GLOBALS['BattlePokemon'][getSpecies($pokemon)]['number'] >= 387 && $GLOBALS['gen'] < 4) {
		$GLOBALS['gen'] = 4;
	}
	if ($GLOBALS['BattlePokemon'][getSpecies($pokemon)]['number'] >= 252 && $GLOBALS['gen'] < 4) {
		$GLOBALS['gen'] = 3;
	}
	if ($GLOBALS['BattlePokemon'][getSpecies($pokemon)]['number'] >= 152 && $GLOBALS['gen'] < 4) {
		$GLOBALS['gen'] = 2;
	}
	
	return $pokemon;
}
function getSpecies($pokemon) {
	global $currentpokemon;
	if ($currentpokemon[$pokemon]) $pokemon = $currentpokemon[$pokemon];
	if (substr($pokemon,0,4) === 'foe-') $pokemon = substr($pokemon,4);
	if (substr($pokemon,0,5) === 'ally-') $pokemon = substr($pokemon,5);
	$pos = strrpos($pokemon, '(');
	if ($pos) $pokemon = substr($pokemon, $pos+1, -1);
	if ($pokemon==='Ho-Oh') $pokemon = "Ho-oh";
	return $pokemon;
}
function resolveMove($move) {
	return str_replace(' ', '', $move);
}
function resolveUsername($move) {
	return str_replace(' ', '', $move);
}
function resolveItem($move) {
	return str_replace(' ', '', $move);
}
function resolveAbility($move) {
	return str_replace(' ', '', $move);
}
function resolveStat($stat) {
	$table = array(
		'attack' => 'atk',
		'defense' => 'def',
		'special attack' => 'spa',
		'special defense' => 'spd',
		'sp. att.' => 'spa',
		'sp. def.' => 'spd',
		'speed' => 'spe',
	);
	$stat = strtolower($stat);
	if ($table[$stat]) return $table[$stat];
	return $stat;
}
function isFoe($name) {
	return resolveUsername($name) !== $GLOBALS['allyname'] && resolveUsername($name) !== uppercaseFirstLetter($GLOBALS['allyname']);
}
function markLastDamage($out) {
	global $lastPokemon, $lastDamage;
	$lastDamage[$lastPokemon] = count($out)-1;
}
function markLastAttack($out) {
	global $lastPokemon, $lastAttack;
	$lastAttack[$lastPokemon] = count($out)-1;
}
function attrLastAttack(&$out, $attr) {
	global $lastPokemon, $lastAttack;
	if ($lastAttack[$lastPokemon]) {
		$out[$lastAttack[$lastPokemon]] .= ' '.$attr;
	}
}
function makeLastLethal(&$out) {
	global $lastPokemon, $lastDamage;
	if ($lastDamage[$lastPokemon] && !endsWith($out[$lastDamage[$lastPokemon]], ' (0.0)') && !endsWith($out[$lastDamage[$lastPokemon]], ' (0)')) {
		$out[$lastDamage[$lastPokemon]] .= ' (lethal)';
	}
}

$logversion = '';
function pokeConvert($text) {
	global $convertNotDone, $logversion, $returnNow, $allpokemon, $out, $winner, $allyname, $playernames, $moveuser, $lastmove, $convertloopnum;
	$english = false;
	$GLOBALS['gen'] = 1;
	$switchcounter = 0;
	//echo "<div>started</div>";

	if (strpos($text, '<!DOCTYPE') === false && strpos($text, '<b><span style=\'color:') !== 0 && !startsWith($text, '<!--Log belonging to ')) {
		$convertNotDone = false;
		return array('error Replay file must an original Pokemon Online replay file. Copying and pasting replay text into another file will not work.');
	}

//echo htmlspecialchars(var_export($text,true));

//		if (@$_REQUEST['dev']) echo '1: "'.$text.'"'."\n\n";

	//$text = preg_replace('/\<!DOCTYPE html\>.*\<head\>/s', '<head>', $text);
	{
		$headloc = strpos($text, '<head>');
		if ($headloc) {
			$logversion = substr($text, 0, $headloc);
			if ($versionloc = strpos($logversion, '(version ')) {
				$logversion = substr($logversion, $versionloc+9);
				$logversion = substr($logversion, 0, strpos($logversion, ')'));
				//if (isset($_REQUEST['dev'])) var_dump($logversion);
			}
			$text = substr($text, $headloc);
		}
	}

	$text = preg_replace('/<head\>.*?\<\/head\>/s', '', $text);
	$text = preg_replace('/\<\/?(\!DOCTYPE|html|body|p)[^>]*\>/', '', $text);
	$text = preg_replace('/\<a[^>]*\>\<span[^>]*\>/', '', $text);
	$text = str_replace("</span></a>",'', $text);
	$text = str_replace("\n",'', $text);
	$text = str_replace("\r",'', $text);
	//var_export(htmlspecialchars($text));


	if (strpos($text, '.-->')) {
		$text = str_replace("-->",'<br />-->', $text);
	}

	$text = explode('<br />', $text);

	$allyname = '';

	$convertloopnum = 0;
	do {
		$convertNotDone = false;
		$returnNow = false;
		$out = pokeConvertInner($text);
		$convertloopnum++;
	} while ($convertNotDone && $convertloopnum < 3);

	//echo var_export($allpokemon);
	//echo "<div>$allyname</div>";

	if ($convertNotDone) {
		return array('error This replay could not be processed.');
	}
	return $out;
}

function pokeConvertInner($text) {
	global $convertNotDone, $returnNow, $currentpokemon, $allpokemon, $out, $winner, $allyname, $playernames, $moveuser, $lastmove, $oldlines, $oldlinesoffset, $convertloopnum;
	$allpokemon = array();
	
	$oldlines = array();
	$oldlinesoffset = 0;

	$out = array();
	$winner = false;
	$moveuser = '';
	$lastmove = '';
	$currentpokemon = array();
	
	$firstline = true;
	
	foreach ($text as $i => $line) {
		if ($firstline) {
			$firstline = false;
		}
		$line = str_replace('&', '&amp;', $line);
		
		$line = preg_replace('/\<span class="[^>]*>/', '', $line, 1, $count);
		if ($count) {
			endsRemove($line, '</span>');
		}
		
		$line = str_replace('</span>', '', $line);
		$line = preg_replace('/\<span[^>]*>/', '', $line);
		$line = str_replace('</div>', '', $line);
		$line = preg_replace('/\<div[^>]*>/', '', $line);
		$line = str_replace('</a>', '', $line);
		$line = preg_replace('/\<a[^>]*>/', '', $line);
		$line = str_replace('</b>', '', $line);
		$line = str_replace('<b>', '', $line);
		$line = trim($line);
		startsRemove($line, '-->');
		if (startsRemove($line, '<!--')) $line = '&lt;!&gt;'.$line;
		if (strpos($line, '<') !== false) {
			$convertNotDone = false;
			return array('|error|This does not appear to be a valid Pokemon Online replay (line '.($i+1).': '.($line).').');
		}
		$line = str_replace('&gt;', '>', $line);
		$line = str_replace('&lt;', '<', $line);
		$line = str_replace('&amp;', '&', $line);
		$line = trim($line);
		$newline = $line;
		$oldlines[] = array(count($out), $newline);
		if ($line === '') {
			$out[] = '|';
		} else if (startsRemove($line, '<!>')) {
			$outcount = count($out);
			//$lastline = '';
			if ($outcount > 1) $lastline =& $out[$outcount-1];
			$statuses = array(
				'fine' => 'none',
				'koed' => 'fnt'
			);
			if (startsRemove($line, 'Log belonging to ')) {
				//$allyname = resolveUsername($line);
			} else if (preg_match('/^([^<>]+) sent out ([^<>]+)!( \([^<>]+\))?$/', $line, $matches)) {
				$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2].$matches[3];
				namePokemon($pokemon);
				$pokemon = str_replace(' ','',$pokemon);
				if ($lastmove === 'Roar' || $lastmove === 'Whirlwind' || $lastmove === 'DragonTail' || $lastmove === 'CircleThrow') {
					$out[] = 'drag-out-anim switched-'.$pokemon;
				} else {
					$out[] = 'replace switched-'.$pokemon;
				}
			} else if (preg_match('/^([^<>]+)\'s life: ([0-9]+)%.$/', $line, $matches)) {
				if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace ')) {
					$lastline .= ' ('.$matches[2].')';
				}
			} else if (preg_match('/^([^<>]+)\'s life: ([0-9]+)\/([0-9]+) HP.$/', $line, $matches)) {
				if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace ')) {
					$lastline .= ' ('.number_format(100*intval($matches[2])/intval($matches[3]), 1, '.', '').')';
				}
			} else if (preg_match('/^([^<>]+)\'s status: ([a-z]+).$/', $line, $matches)) {
				$status = $statuses[$matches[2]];
				if ($status) {
					if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace ')) {
						if (endsWith($lastline,')')) {
							$lastline = substr($lastline,0,-1).'|'.$statuses[$matches[2]].')';
						} else {
							$lastline = $lastline.' ('.$statuses[$matches[2]].')';
						}
					}
				}
			} else if (preg_match('/^([^<>]+)\'s new HP is ([0-9]+)\/([0-9]+).$/', $line, $matches) || preg_match('/^([^<>]+)\'s new HP is ([0-9]+)%.$/', $line, $matches))
			{
				if (!$matches[3]) $newhp = $matches[2];
				else $newhp = number_format(100*intval($matches[2])/intval($matches[3]), 1, '.', '');
				if ($GLOBALS['logversion'] !== '2.0' || $matches[3]) {
					if (startsWith($lastline,'|-recoil ') || startsWith($lastline,'|-life-orb-recoil ')) {
						$lastline .= ' ('.$newhp.')';
					} else if (startsWith($lastline,'stealth-rock-damage ')) {
						$lastline .= ' ('.$newhp.')';
					} else if (startsWith($lastline,'|-damage ')) {
						$lastline .= ' ('.$newhp.')';
					} else if (startsWith($lastline,'residual ') && (strpos($lastline, ' leech-seed ') || strpos($lastline, ' item-heal ') || strpos($lastline, ' wish '))) {
						$lastline .= ' ('.$newhp.')';
					}
				}
			}
		} else if (startsRemove($line, 'Tier: ')) {
			$out[] = '|tier|'.$line;
		} else if (startsRemove($line, 'Variation: ')) {
			$out[] = '|variation|'.$line;
		} else if (startsRemove($line, 'Rule: ')) {
			$out[] = '|rule|'.$line;
		} else if (startsRemove($line, 'Start of turn ')) {
			endsRemove($line, '!');
			$out[] = '|turn|'.$line;
			if (substr($line, 0, -1) === '1' && $switchcounter < 100) $switchcounter += 100;
			else if ($switchcounter < 100) $switchcounter += 200;
			// damage doesn't actually happen here, but any undetected messages that do damage...
			markLastDamage($out);
		} else if (endsRemove($line, ' fainted!')) {
			$out[] = '|faint|'.resolvePokemon($line);
			makeLastLethal($out);
		} else if (endsRemove($line, ' is exerting its Pressure!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Pressure';
		} else if (endsRemove($line, ' has Mold Breaker!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Mold Breaker';
		} else if (endsRemove($line, ' is hit with recoil!')) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from]recoil';
			markLastDamage($out);
		} else if ($line === "It's not very effective...") {
			$out[] = '|-resisted|';
		} else if ($line === "But it failed!") {
			$out[] = '|-failed|'.$moveuser;
		} else if ($line === "But there was no target...") {
			$out[] = '|-notarget|'.$moveuser;
			attrLastAttack($out, 'no-target');
		} else if ($line === "It had no effect!") {
			$out[] = '|-immune|'.$movetarget;
		} else if ($line === "But nothing happened!") {
			$out[] = '|-activate|'.$moveuser.'|move: Splash';
		} else if ($line === "It's super effective!") {
			$out[] = '|-supereffective|';
		} else if ($line === "A critical hit!") {
			$out[] = '|-crit|';
		} else if ($line === "It hurt itself in its confusion!") {
			$out[] = '|-damage|'.$moveuser.'|??|from: confusion';
		} else if ($line === "It's a one hit KO!") {
			$out[] = '|-ohko|';
		} else if ($line === "The sunlight is strong!") {
			$out[] = '|-weather|Sunny Day';
		} else if ($line === "Rain continues to fall!") {
			$out[] = '|-weather|Rain Dance';
		} else if ($line === "The sunlight turned harsh!") {
			$out[] = '|-weather|Sunny Day';
		} else if ($line === "It started to rain!") {
			$out[] = '|-weather|Rain Dance';
		} else if ($line === "A hailstorm brewed!") {
			$out[] = '|-weather|Hail';
		} else if ($line === "Hail continues to fall!") {
			$out[] = '|-weather|Hail';
		} else if ($line === "A sandstorm brewed!") {
			$out[] = '|-weather|Sandstorm';
		} else if ($line === "The sandstorm rages!") {
			$out[] = '|-weather|Sandstorm';
		} else if ($line === "The sunlight faded!") {
			$out[] = '|-weather|none';
		} else if ($line === "The rain stopped!") {
			$out[] = '|-weather|none';
		} else if ($line === "The sandstorm subsided!") {
			$out[] = '|-weather|none';
		} else if ($line === "The hail subsided!") {
			$out[] = '|-weather|none';
		} else if ($line === 'All stat changes were eliminated!') {
			$out[] = '|-clearallboost|';
		} else if ($line === 'The battlers shared their pain!') {
			$out[] = '|-sethp|';
		} else if (endsRemove($line, '\'s Wonder Guard evades the attack!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Wonder Guard';
		} else if (endsRemove($line, ' avoided the attack!')) {
			attrLastAttack($out, 'miss');
			$out[] = '|-miss|'.resolvePokemon($line).'|[msg]';
		} else if (endsRemove($line, ' regained health!')) {
			$out[] = '|-heal|'.resolvePokemon($line).'|??';
		} else if (endsRemove($line, ' restored some HP!')) {
			$out[] = '|-heal|'.resolvePokemon($line).'|??';
		} else if (endsRemove($line, ' was poisoned!')) {
			if ($lastmove === 'Toxic') {
				$out[] = '|-status|'.resolvePokemon($line).'|tox';
			} else {
				$out[] = '|-status|'.resolvePokemon($line).'|psn';
			}
		} else if (endsRemove($line, ' was badly poisoned!')) {
			$out[] = '|-status|'.resolvePokemon($line).'|tox';
		} else if (endsRemove($line, ' is already poisoned.')) {
			$out[] = '|-fail|'.resolvePokemon($line).'|psn';
		} else if (endsRemove($line, ' is already burnt.')) {
			$out[] = '|-fail|'.resolvePokemon($line).'|brn';
		} else if (endsRemove($line, ' is already paralyzed.')) {
			$out[] = '|-fail|'.resolvePokemon($line).'|par';
		} else if (endsRemove($line, ' calmed down!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|calm';
		} else if (endsRemove($line, ' is confused!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|confusion';
		} else if (endsRemove($line, ' is fast asleep!')) {
			$out[] = '|cant|'.resolvePokemon($line).'|slp';
		} else if (endsRemove($line, ' is being sent back!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|move: Pursuit';
		} else if (endsRemove($line, ' woke up!')) {
			$out[] = '|-curestatus|'.resolvePokemon($line).'|slp';
		} else if (endsRemove($line, '\'s status cleared!')) {
			$out[] = '|-curestatus|'.resolvePokemon($line);
		} else if (endsRemove($line, '\'s status cleared!')) {
			$out[] = '|-curestatus|'.resolvePokemon($line);
		} else if (endsRemove($line, ' landed on the ground!')) {
			$out[] = '|-singleturn|'.resolvePokemon($line).'|Roost';
		} else if (endsRemove($line, ' protected itself!')) {
			$out[] = '|-singleturn|'.resolvePokemon($line).'|Protect';
		} else if (endsRemove($line, ' shrouded itself with Magic Coat!')) {
			$out[] = '|-singleturn|'.resolvePokemon($line).'|Magic Coat';
		} else if (endsRemove($line, ' braced itself!')) {
			$out[] = '|-singleturn|'.resolvePokemon($line).'|Endure';
		} else if (endsRemove($line, ' is tightening its focus!')) {
			$out[] = '|-singleturn|'.resolvePokemon($line).'|Focus Punch';
		} else if (endsRemove($line, ' is hurt by poison!')) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from]psn';
			markLastDamage($out);
		} else if (endsRemove($line, ' is hurt by its burn!')) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from]psn';
			markLastDamage($out);
		} else if (endsRemove($line, ' was burned!')) {
			$out[] = '|-status|'.resolvePokemon($line).'|brn';
		} else if (endsRemove($line, ' is paralyzed! It may be unable to move!')) {
			$out[] = '|-status|'.resolvePokemon($line).'|par';
		} else if (endsRemove($line, ' is paralyzed! It can\'t move!')) {
			$out[] = '|cant|'.resolvePokemon($line).'|par';
		} else if (endsRemove($line, ' can\'t attack while in the air!')) {
			$out[] = '|cant|'.resolvePokemon($line).'|Sky Drop';
		} else if (endsRemove($line, ' became confused!')) {
			$out[] = '|-start|'.resolvePokemon($line).'|confusion';
		} else if (endsRemove($line, ' snapped out its confusion!')) {
			$out[] = '|-end|'.resolvePokemon($line).'|confusion';
		} else if (endsRemove($line, " was prevented from healing!")) {
			$out[] = '|-start|'.resolvePokemon($line).'|Heal Block';
		} else if (endsRemove($line, " must recharge!")) {
			$out[] = '|cant|'.resolvePokemon($line).'|recharge';
		} else if (endsRemove($line, " vanished instantly!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Shadow Force';
		} else if (endsRemove($line, " sprang up!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Bounce';
		} else if (endsRemove($line, " burrowed its way under the ground!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Dig';
		} else if (endsRemove($line, " hid underwater!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Dive';
		} else if (endsRemove($line, " flew high up!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Fly';
		} else if (endsRemove($line, " absorbed light!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|SolarBeam';
		} else if (endsRemove($line, " became cloaked in a harsh light!")) {
			$out[] = '|-prepare|'.resolvePokemon($line).'|Sky Attack';
		} else if (endsRemove($line, "'s heal block wore off!")) {
			$out[] = '|-end|'.resolvePokemon($line).'|Heal Block';
		} else if (endsRemove($line, ' fell asleep!')) {
			$out[] = '|-status|'.resolvePokemon($line).'|slp';
		} else if (endsRemove($line, ' woke up!')) {
			$out[] = '|-curestatus '.resolvePokemon($line).'|slp';
		} else if (endsRemove($line, ' was frozen solid!')) {
			$out[] = '|-status|'.resolvePokemon($line).'|frz';
		} else if (endsRemove($line, ' thawed out!')) {
			$out[] = '|-curestatus '.resolvePokemon($line).'|frz';
		} else if (endsRemove($line, ' is frozen solid!')) {
			$out[] = '|cant|'.resolvePokemon($line).'|frz';
		} else if (endsRemove($line, ' cut its own HP and maximized its Attack!')) {
			$out[] = '|-belly-drum '.resolvePokemon($line).'';
		} else if (endsRemove($line, ' flinched!')) {
			$out[] = '|cant|'.resolvePokemon($line).'|flinch';
		} else if (endsRemove($line, ' is hurt by its Life Orb!')) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from]item: Life Orb';
			markLastDamage($out);
		} else if (endsRemove($line, ' is floating on a balloon!')) {
			$out[] = '|-start|'.resolvePokemon($line).'|Air Balloon';
		} else if (endsRemove($line, ' is floating on a balloon!')) {
			$out[] = '|-start|'.resolvePokemon($line).'|Air Balloon';
		} else if (endsRemove($line, "'s Air Balloon popped!") || endsRemove($line, "'s Balloon popped!")) {
			$out[] = '|-end|'.resolvePokemon($line).'|Air Balloon';
		} else if (endsRemove($line, "'s Air Balloon popped!") || endsRemove($line, "'s Balloon popped!")) {
			$out[] = '|-end|'.resolvePokemon($line).'|Air Balloon';
		} else if (endsRemove($line, "'s Rain Dish heals it!")) {
			$out[] = '|-heal|'.resolvePokemon($line).'|??|[from]ability: Rain Dish';
		} else if (endsRemove($line, "'s Ice Body heals it!")) {
			$out[] = '|-heal|'.resolvePokemon($line).'|??|[from]ability: Ice Body';
		} else if (endsRemove($line, " was seeded!")) {
			$out[] = '|-start|'.resolvePokemon($line).'|Leech Seed';
		} else if (endsRemove($line, "'s Drought intensified the sun's rays!")) {
			$out[] = '|-weather|Sunny Day|[from]ability: Drought|[of]'.resolvePokemon($line);
		} else if (endsRemove($line, "'s Sand Stream whipped up a sandstorm!")) {
			$out[] = '|-weather|Sandstorm|[from]ability: Sand Stream|[of]'.resolvePokemon($line);
		} else if (endsRemove($line, " is buffeted by the sandstorm!")) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from] Sandstorm';
			markLastDamage($out);
		} else if (endsRemove($line, "'s Snow Warning whipped up a hailstorm!")) {
			$out[] = '|-weather|Hail|[from]ability: Snow Warning|[of]'.resolvePokemon($line);
		} else if (endsRemove($line, " is buffeted by the hail!")) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from] Hail';
			markLastDamage($out);
		} else if (endsRemove($line, "'s Drizzle made it rain!")) {
			$out[] = '|-weather|Rain Dance|[from]ability: Drizzle|[of]'.resolvePokemon($line);
		} else if (endsRemove($line, " twisted the dimensions!")) {
			$out[] = '|-fieldstart|Trick Room|[of]'.resolvePokemon($line);
		} else if ($line === '<The twisted dimensions returned to normal!') {
			$out[] = '|-fieldend|Trick Room';
		} else if (endsRemove($line, " swapped the Sp. Def. and the Defense of all the pokemon!")) {
			$out[] = '|-fieldstart|Wonder Room|[of]'.resolvePokemon($line);
		} else if ($line === '<The Sp. Def and Defense of the pokemon went back to normal!') {
			$out[] = '|-fieldend|Wonder Room';
		} else if (endsRemove($line, " cancelled the items' effects!")) {
			$out[] = '|-fieldstart|Magic Room|[of]'.resolvePokemon($line);
		} else if ($line === '<The items are now working again!') {
			$out[] = '|-fieldend|Magic Room';
		} else if (endsRemove($line, " is already preparing its next move!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|item: Custap Berry';
		} else if (startsRemove($line, "<It doesn't affect ")) {
			$out[] = '|-immune|'.resolvePokemon(substr($line, 0, -4)).'|[msg]';
		} else if (endsRemove($line, "mon hearing the song will faint in three turns!")) {
			$out[] = '|-fieldactivate|move: Perish Song';
		} else if (endsRemove($line, "'s health is sapped by leech seed.")) {
			$out[] = '|-damage|'.resolvePokemon($line).'|??|[from] Leech Seed';
			markLastDamage($out);
		} else if (endsRemove($line, " has Cloud Nine!")) {
			$out[] = '|-ability|'.resolvePokemon($line).'|Cloud Nine';
		} else if (endsRemove($line, " has Air Lock!")) {
			$out[] = '|-ability|'.resolvePokemon($line).'|Air Lock';
		} else if (endsRemove($line, " has Turboblaze!") || endsRemove($line, " has Turbo Blaze!")) {
			$out[] = '|-ability|'.resolvePokemon($line).'|Turboblaze';
		} else if (endsRemove($line, " has Teravolt!") || endsRemove($line, " has TeraVoltage!")) {
			$out[] = '|-ability|'.resolvePokemon($line).'|Teravolt';
		} else if (endsRemove($line, "'s Speed Boost increases its speed!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Speed Boost';
		} else if (endsRemove($line, "'s Poison Point activates!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Poison Point';
		} else if (endsRemove($line, "'s Download activates!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Download';
		} else if (endsRemove($line, "'s Cursed Body activates!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Cursed Body';
		} else if (endsRemove($line, "'s Flame Body activates!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Flame Body';
		} else if (endsRemove($line, "'s stat changes were eliminated!")) {
			$out[] = '|-clearboost|'.resolvePokemon($line);
		} else if (endsRemove($line, "'s Quick Claw activated!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|item: Quick Claw';
			$lastmove = 'Toxic';
		} else if (endsRemove($line, "'s Toxic Orb activated!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|item: Toxic Orb';
			$lastmove = 'Toxic';
		} else if (endsRemove($line, "'s Flame Orb activated!")) {
			$out[] = '|-activate|'.resolvePokemon($line).'|item: Flame Orb';
		} else if (endsRemove($line, ' was dragged out!')) {
			$prevline = count($out)-1;
			if ($out[$prevline] === '|faint|'.resolvePokemon($line)) {
				$out[$prevline] = '|drag|'.resolvePokemon($line);
				$out[] = '|faint|'.resolvePokemon($line);
			} else {
				$out[] = '|drag|'.resolvePokemon($line);
			}
		} else if (endsRemove($line, ' made a substitute!')) {
			$out[] = '|-start|'.resolvePokemon($line).'|Substitute';
		} else if (endsRemove($line, ' already has a substitute.')) {
			$out[] = '|-fail|'.resolvePokemon($line).'|Substitute';
		} else if (endsRemove($line, ' is already confused.')) {
			$out[] = '|-start|'.resolvePokemon($line).'|confusion|[already]';
		} else if (endsRemove($line, ' hung on using its Focus Sash!') || endsRemove($line, ' hung on using its focus sash!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|item: Focus Sash';
		} else if (endsRemove($line, ' held on thanks to Sturdy!')) {
			$out[] = '|-activate|'.resolvePokemon($line).'|ability: Sturdy';
			$GLOBALS['gen'] = 5;
		} else if (endsRemove($line, ' regains health with its Regenerator!') || endsRemove($line, ' regains health with its Regeneration!')) {
			// ignore
		} else if (endsRemove($line, ' is watching the battle.')) {
			$out[] = '|join| '.$line;
		} else if (endsRemove($line, ' stopped watching the battle.')) {
			$out[] = '|leave| '.$line;
		} else if (endsRemove($line, ' had its energy drained!')) {
			$out[] = '|-drain '.resolvePokemon($line).' ?? ??';
		} else if (endsRemove($line, ' went to sleep and became healthy!')) {
			$out[] = '|-rested '.resolvePokemon($line).'';
		} else if (startsRemove($line, '<Pointed stones dug into ')) {
			$pokemon = resolvePokemon(substr($line, 0, -2));
			$damage = 12.5 * getDamageTaken('Rock', $GLOBALS['BattlePokemon'][getSpecies($pokemon)]);
			//echo '['.$pokemon.'|'.getSpecies($pokemon).']';
			$out[] = 'stealth-rock-damage '.$pokemon.' '.$damage;
			markLastDamage($out);
		} else if (endsRemove($line, "'s wish came true!")) {
			$out[] = 'residual ?? wish '.resolveUsername($line).' ??';
		} else if ($line === "<The healing wish came true!") {
			$out[] = 'residual ?? healing-wish ?? ??';
		} else if ($line === "<A soothing aroma wafted through the area!") {
			$out[] = '|-cure-all '.$moveuser.' Aromatherapy';
		} else if ($line === "<A bell chimed!") {
			$out[] = '|-cure-all '.$moveuser.' HealBell';
		} else if (endsRemove($line, " has bad dreams!")) {
			$out[] = 'residual '.resolvePokemon($line).' bad-dreams ??';
			markLastDamage($out);
		} else if (endsRemove($line, " took the Doom Desire attack!")) {
			$out[] = 'residual '.resolvePokemon($line).' move DoomDesire';
		} else if (endsRemove($line, " chose Doom Desire as its destiny!")) {
			$out[] = '|-doom-desire '.resolvePokemon($line);
		} else if (endsRemove($line, ' is hurt by spikes!')) {
			$out[] = 'spikes-damage '.resolvePokemon($line).' ??';
			markLastDamage($out);
		} else if (endsRemove($line, ' blew away Leech Seed!')) {
			$out[] = '|-blow-away '.resolvePokemon($line).' LeechSeed';
		} else if (endsRemove($line, ' blew away Stealth Rock!')) {
			$out[] = '|-blow-away '.resolvePokemon($line).' StealthRock';
		} else if (endsRemove($line, ' blew away Spikes!')) {
			$out[] = '|-blow-away '.resolvePokemon($line).' Spikes';
		} else if (endsRemove($line, ' blew away Toxic Spikes!')) {
			$out[] = '|-blow-away '.resolvePokemon($line).' ToxicSpikes';
		} else if (endsRemove($line, ' fell for the taunt!')) {
			$out[] = '|-start|'.resolvePokemon($line).' taunt';
		} else if (endsRemove($line, '\'s Flash Fire raised the power of its Fire-type moves!')) {
			$out[] = '|-start|'.resolvePokemon($line).' flash-fire';
		} else if (endsRemove($line, ' is now tormented!')) {
			$out[] = '|-start|'.resolvePokemon($line).' torment';
		} else if (endsRemove($line, ' received an encore!')) {
			$out[] = '|-start|'.resolvePokemon($line).' encore';
		} else if (endsRemove($line, "'s taunt ended!")) {
			$out[] = '|-start|'.resolvePokemon($line).' taunt end';
		} else if (endsRemove($line, "'s Encore ended!")) {
			$out[] = '|-start|'.resolvePokemon($line).' encore end';
		} else if (endsRemove($line, "'s substitute faded!")) {
			$out[] = '|-sub-fade '.resolvePokemon($line);
		} else if (endsRemove($line, "'s substitute took the damage!")) {
			$out[] = '|-sub-damage '.resolvePokemon($line);
		} else if (endsRemove($line, " planted its roots!")) {
			$out[] = '|-start|'.resolvePokemon($line).' ingrain';
		} else if (endsRemove($line, " surrounded itself with a veil of water!")) {
			$out[] = '|-start|'.resolvePokemon($line).' aqua-ring';
		} else if (endsRemove($line, " absorbed nutrients with its roots!")) {
			$out[] = 'residual '.resolvePokemon($line).' heal ingrain';
		} else if (startsRemove($line, "<Aquaring restored ")) {
			endsRemove($line, "'s HP.");
			$out[] = 'residual '.resolvePokemon($line).' heal aqua-ring';
		} else if (endsRemove($line, " is trying to take its foe with it!")) {
			$out[] = '|-destiny-bond '.resolvePokemon($line);
		} else if (preg_match('/^\<([^<>]+) can\'t use ([^<>]+) after the taunt!\>$/', $line, $matches)) {
			$out[] = 'cant-move '.resolvePokemon($matches[1]).' taunt '.resolveMove($matches[2]);
		} else if (preg_match('/^([^<>]+) used \<([^<>]+)\>!$/', $line, $matches)) {
			$moveuser = resolvePokemon($matches[1]);
			$movetarget = 'foeof-'.resolvePokemon($matches[1]);
			$lastmove = resolveMove($matches[2]);
			$out[] = 'move '.$moveuser.' '.resolveMove($matches[2]).' ??';
			markLastAttack($out);
			
			if ($matches[2] === 'Explosion' || $matches[2] === 'Selfdestruct' || $matches[2] === 'Lunar Dance' || $matches[2] === 'Healing Wish' || $matches[2] === 'Memento' || $matches[2] === 'Final Gambit') {
				markLastDamage($out);
			}
		} else if (preg_match('/^([^<>]+) sent out ([^<>]+)!( \([^<>]+\))?$/', $line, $matches)) {
			if ($allpokemon[$matches[2]] && $allpokemon[$matches[2]] != resolveUsername($matches[1])) {
				$allpokemon[$matches[2]] = false;
			} else if ($allpokemon[$matches[2]] !== false) {
				$allpokemon[$matches[2]] = resolveUsername($matches[1]);
			}
			$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2].$matches[3];
			namePokemon($pokemon);
			$pokemon = str_replace(' ','',$pokemon);
			$out[] = 'switch-in switched-'.$pokemon;
			$lastmove = 'switch';
			
			if ($switchcounter < 99) $switchcounter++;
		} else if (preg_match('/^\<Pointed stones float in the air around ([^<>]+)\'s team!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' StealthRock';
		} else if (preg_match('/^\<Spikes were scattered all around the feet of ([^<>]+)\'s team!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Spikes';
		} else if (preg_match('/^\<Poison spikes were scattered all around the feet of ([^<>]+)\'s team!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' ToxicSpikes';
		} else if (preg_match('/^\<A tailwind started blowing behind ([^<>]+)\'s team!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Tailwind';
		} else if (preg_match('/^\<([^<>]+)\'s team tailwind petered out!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = 'side-condition '.$side.' Tailwind end';
		} else if (preg_match('/^\<Reflect raised ([^<>]+)\'s team defense!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Reflect';
		} else if (preg_match('/^\<([^<>]+)\'s reflect wore off!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Reflect end';
		} else if (preg_match('/^\<([^<>]+)\'s team became cloaked in a mystical veil!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Safeguard';
		} else if (preg_match('/^\<([^<>]+)\'s team is no longer protected by Safeguard!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' Safeguard end';
		} else if (preg_match('/^\<Light Screen raised ([^<>]+)\'s team special defense!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' LightScreen';
		} else if (preg_match('/^\<([^<>]+)\'s light screen wore off!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '|-side-condition '.$side.' LightScreen end';
		} else if (preg_match('/^\<([^<>]+) shattered ([^<>]+)\'s team protections!\>?$/', $line, $matches)) {
			$side = (isFoe($matches[2])?'foe':'ally');
			$out[] = '|-shatter '.resolvePokemon($matches[1]).' '.$side;
		} else if (preg_match('/^([^<>]+)\'s Synchronize changes the status of ([^<>]+)!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-activate Synchronize '.resolvePokemon($matches[2]).'';
		} else if (preg_match('/^([^<>]+) called ([^<>]+) back!$/', $line, $matches)) {
			$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2];
			$pokemon = str_replace(' ','',$pokemon);
			$out[] = 'switch-out '.$pokemon;
		} else if (preg_match('/^\<?([^<>]+) transformed into ([^<>]+)!\>?$/', $line, $matches)) {
			$out[] = '|-transform '.resolvePokemon($matches[1]).' '.resolveUsername($matches[2]).'';
		} else if (preg_match('/^\<([^<>]+) made ([^<>]+) feel drowsy!\>$/', $line, $matches)) {
			$out[] = '|-start|'.resolvePokemon($matches[2]).' drowsy start '.resolvePokemon($matches[1]).'';
		} else if (preg_match('/^([^<>]+) is hurt by ([^<>]+)\'s ([A-Za-z .\']+)!$/', $line, $matches)) {
			$out[] = '|-foe-item-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveItem($matches[3]).' ??';
			resolvePokemon($matches[1]); // is the one taking the damage
			markLastDamage($out);
		} else if (preg_match('/^\<([^<>]+) was hurt by ([A-Za-z .\']+)!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' move-damage '.resolveItem($matches[2]).' ??';
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+) is hurt by its ([A-Za-z .\']+)!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-damage '.resolveItem($matches[2]).' ??';
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+) was hurt by Black Sludge!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-damage BlackSludge ??';
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+) restored its stats using ([A-Za-z .\']+)!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-restore '.resolveItem($matches[2]);
		} else if (preg_match('/^([^<>]+) restored a little HP using its ([A-Za-z .\']+)!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-heal '.resolveItem($matches[2]);
		} else if (preg_match('/^\<([^<>]+) restored HP using its ([A-Za-z .\']+)!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-heal '.resolveAbility($matches[2]);
		} else if (preg_match('/^([^<>]+) used its Mental Herb to come back to (his|her|its) senses!$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-customcure MentalHerb';
		} else if (preg_match('/^\<([^<>]+)\'s Hydration heals its status!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure Hydration';
		} else if (preg_match('/^\<([^<>]+)\'s Insomnia cures it!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure Insomnia';
		} else if (preg_match('/^\<([^<>]+)\'s Shed Skin heals its status!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure ShedSkin';
		} else if (preg_match('/^The attack of ([^<>]+) missed!$/', $line, $matches)) {
			$out[] = '|-miss '.resolvePokemon($matches[1]);
			attrLastAttack($out, 'miss');
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) drastically fell!$/', $line, $matches)) {
			$out[] = '|-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) sharply fell!$/', $line, $matches)) {
			$out[] = '|-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 2';
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) fell!$/', $line, $matches)) {
			$out[] = '|-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 1';
		} else if (preg_match('/^([^<>]+) lost ([0-9]+)% of its health!$/', $line, $matches)) {
			$out[] = '|-damage '.resolvePokemon($matches[1]).' '.$matches[2];
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+) lost ([0-9]+) HP! \(([0-9]+)% of its health\)$/', $line, $matches)) {
			$out[] = '|-damage '.resolvePokemon($matches[1]).' '.$matches[3];
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+) traced ([^<>]+)\'s ([A-Za-z ]+)!$/', $line, $matches)) {
			$out[] = '|-trace '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveAbility($matches[3]);
		} else if (preg_match('/^\<([^<>]+) knocked off ([^<>]+)\'s ([A-Za-z ]+)!\>$/', $line, $matches)) {
			$out[] = '|-knock-off '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveAbility($matches[3]);
		} else if (preg_match('/^\<([^<>]+) knocked ([^<>]+) on the ground!\>$/', $line, $matches)) {
			$out[] = '|-start|'.resolvePokemon($matches[2]).' grounded start '.resolvePokemon($matches[1]);
		} else if (preg_match('/^\<([^<>]+)\'s substitute blocked ([^<>]+)!\>$/', $line, $matches)) {
			$out[] = '|-sub-block '.resolvePokemon($matches[1]).' '.resolveMove($matches[2]);
		} else if (preg_match('/^\<(.+?): \>([^<>]+)$/', $line, $matches)) {
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		} else if (preg_match('/^\<(.+?): \>\<([^<>]+)\>$/', $line, $matches)) {
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		} else if (preg_match('/^\<(.+?)\>: ([^<>]+)$/', $line, $matches)) {
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		} else if (preg_match('/^\<([^<>]+) flung its ([^<>]+)!\>$/', $line, $matches)) {
			$out[] = '|-fling '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]);
		} else if (preg_match('/^([^<>]+) ate its ([^<>]+)!$/', $line, $matches)) {
			$out[] = '|-eat '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]);
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .\']+) weakened ([^<>]+)\'s power!$/', $line, $matches)) {
			$out[] = '|-weaken '.resolvePokemon($matches[1]).' '.resolveMove($matches[3]).' '.resolveItem($matches[2]);
		} else if (preg_match('/^\<([^<>]+) stole and ate ([^<>]+)\'s ([^<>]+)!\>$/', $line, $matches)) {
			$out[] = '|-steal-eat '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveItem($matches[3]);
		} else if (preg_match('/^\<([^<>]+)\'s Storm Drain raised its special attack!\>$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' spa 1 StormDrain';
		} else if (preg_match('/^\<?([^<>]+)\'s Competitive Spirit sharply raised its Attack!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' atk 2 CompetitiveSpirit';
		} else if (preg_match('/^\<?([^<>]+)\'s Lightningrod raised its (Special Attack|special attack)!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' spa 1 Lightningrod';
		} else if (preg_match('/^\<?([^<>]+)\'s (Justified|Justice Heart) raised its attack!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' atk 1 Justified';
		} else if (preg_match('/^\<?([^<>]+)\'s (Herbivore|Sap Sipper) raised its attack!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' atk 1 SapSipper';
		} else if (preg_match('/^\<?([^<>]+)\'s Motor Drive raise(d|s) its speed!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' spe 1 MotorDrive';
		} else if (preg_match('/^\<?([^<>]+)\'s (Steadfast|SteadFast) increases its speed!\>?$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' spe 1 Steadfast';
		} else if (preg_match('/^([^<>]+)\'s Absorb Bulb raised its Sp. Att.!$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' spa 1 AbsorbBulb';
		} else if (preg_match('/^([^<>]+)\'s (Moody|Inconsistent) sharply raises its ([a-zA-Z .\']+)!$/', $line, $matches)) {
			$out[] = '|-ability-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[3]).' 2 Moody';
		} else if (preg_match('/^([^<>]+)\'s (Moody|Inconsistent) lowers its ([a-zA-Z .\']+)!$/', $line, $matches)) {
			$out[] = '|-ability-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[3]).' 1 Moody';
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .\']+) raised ([^<>]+)\'s power!$/', $line, $matches)) {
			$out[] = '|-gem '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]).' '.resolveMove($matches[3]).'';
		} else if (preg_match('/^The ([a-zA-Z .\']+) raised ([^<>]+)\'s ([a-zA-Z .\']+)!$/', $line, $matches)) {
			$out[] = '|-item-boost '.resolvePokemon($matches[2]).' '.resolveStat($matches[3]).' 1 '.resolveItem($matches[1]).'';
		} else if (preg_match('/^\<([^<>]+) switched items with ([^<>]+)!\>$/', $line, $matches)) {
			$out[] = '|-trick '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		} else if (preg_match('/^<([^<>]+) obtained one ([a-zA-Z .\']+)!>$/', $line, $matches)) {
			$out[] = '|-trick-get '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]).'';
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) drastically rose!$/', $line, $matches)) {
			$out[] = '|-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) sharply rose!$/', $line, $matches)) {
			if ($lastmove === 'TailGlow') {
				$out[] = '|-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
			} else {
				$out[] = '|-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 2';
			}
		} else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) rose!$/', $line, $matches)) {
			$out[] = '|-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 1';
		} else if (preg_match('/^\<([^<>]+) stockpiled ([1-3])!\>$/', $line, $matches)) {
			$out[] = '|-start|'.resolvePokemon($matches[1]).' stockpile'.$matches[2];
		} else if (preg_match('/^\<([^<>]+)\'s perish count fell to ([0-3]).\>$/', $line, $matches)) {
			$out[] = '|-start|'.resolvePokemon($matches[1]).' perish'.$matches[2];
			if ($matches[2] === '0') markLastDamage($out);
		} else if (preg_match('/^([^<>]+) intimidates ([^<>]+)!$/', $line, $matches)) {
			$out[] = '|-intimidate '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		} else if (preg_match('/^\<([^<>]+) moved its status onto ([^<>]+)!\>$/', $line, $matches)) {
			$out[] = '|-psycho-shift '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		} else if (preg_match('/^\<([^<>]+) took ([^<>]+) down with it!\>$/', $line, $matches)) {
			$out[] = '|-also-ko '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
			markLastDamage($out);
		} else if (preg_match('/^\<The poison spikes disappeared around ([^<>]+)\'s feet!\>$/', $line, $matches)) {
			$out[] = '|-absorb-spikes '.resolvePokemon($matches[1]).' ToxicSpikes';
		} else if (preg_match('/^\<([^<>]+) lost some HP because of Solar Power!\>$/', $line, $matches)) {
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-damage SolarPower ??';
			markLastDamage($out);
		} else if (preg_match('/^\<([^<>]+)\'s ([A-Z][a-z]+) Absorb absorbs the attack!\>$/', $line, $matches)) {
			$out[] = '|-ability-heal '.resolvePokemon($matches[1]).' '.$matches[2].'Absorb ??';
		} else if (preg_match('/^\<([^<>]+)\'s ([A-Z][a-z]+) Absorb made the attack useless!\>$/', $line, $matches)) {
			$out[] = '|-ability-heal '.resolvePokemon($matches[1]).' '.$matches[2].'Absorb ??';
		} else if (preg_match('/^([^<>]+)\'s Iron Barbs hurts ([^<>]+)$/', $line, $matches)) {
			$out[] = '|-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' IronBarbs ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+)\'s Rough Skin hurts ([^<>]+)$/', $line, $matches)) {
			$out[] = '|-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' RoughSkin ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		} else if (preg_match('/^([^<>]+)\'s Aftermath damages ([^<>]+)!$/', $line, $matches)) {
			$out[] = '|-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' Aftermath ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		} else if (preg_match('/^\<([^<>]+)\'s ([^<>]+) was bounced back by Magic Mirror!\>$/', $line, $matches)) {
			$out[] = '|-bounce-back '.resolvePokemon($matches[1]).' MagicMirror '.resolveMove($matches[2]);
		} else if (preg_match('/^\<([^<>]+)\'s ([^<>]+) was bounced back by Magic Coat!\>$/', $line, $matches)) {
			$out[] = '|-bounce-back '.resolvePokemon($matches[1]).' MagicCoat '.resolveMove($matches[2]);
		} else if (preg_match('/^\<Battle between ([^<>]+) and ([^<>]+) is underway!\>$/', $line, $matches)) {
			$out[] = 'player '.$matches[1];
			$out[] = 'foe-player '.$matches[2];
			$out[] = 'start';
			$allyname = resolveUsername($matches[1]);
			$playernames = array($matches[1],$matches[2]);
			$english = 'warn';
		} else if (preg_match('/^\<Battle between ([^<>]+) and ([^<>]+) started!\>$/', $line, $matches)) {
			if ($allyname === '' && $convertloopnum === 0) {
				$convertNotDone = true;
			} else if ($allyname === resolveUsername($matches[1]) || (substr($allyname, 0,6) === 'foeof-' && substr($allyname, 6) === resolveUsername($matches[2]))) {
				$out[] = 'player '.$matches[1];
				$out[] = 'foe-player '.$matches[2];
				$out[] = 'start';
				$allyname = resolveUsername($matches[1]);
				$playernames = array($matches[1],$matches[2]);
			} else {
				$out[] = 'player '.$matches[2];
				$out[] = 'foe-player '.$matches[1];
				$out[] = 'start';
				$allyname = resolveUsername($matches[2]);
				$playernames = array($matches[2],$matches[1]);
			}
			$english = true;
		} else if (preg_match('/^\<([^<>]+) won the battle!\>$/', $line, $matches)) {
			$winner = $matches[1];
		} else if (preg_match('/^\<Tie between ([^<>]+) and ([^<>]+)!\>$/', $line, $matches)) {
			$winner = true;
		} else if (preg_match('/^Hit ([0-9]) times!$/', $line, $matches)) {
			$out[] = '|-hit-count '.$movetarget.' '.$matches[1];
		} else {
			$out[] = 'unknown-effect '.$newline;
		}
		if ($returnNow) {
			return false;
		}
	}
	
	if (!$english) {
		$convertNotDone = false;
		if (@$_REQUEST['dev']) echo '"'.implode("\n", $text).'"';
		return array('error Replay file must be an English Pokemon Online replay file.');
	}
	if ($switchcounter === 104) {
		return array('error Double battles are not supported (neither are triples, for that matter).');
	}
	if ($switchcounter === 106) {
		return array('error Triple battles are not supported (neither are doubles, for that matter).');
	}
	
	if ($winner === true) $out[] = 'tie';
	else if ($winner) $out[] = 'win '.$winner;
	else $out[] = 'premature-end';
	
	foreach ($currentpokemon as $poke) {
		$oldlinesoffset++;
		array_unshift($out, 'pokemon '.$poke);
	}
	{
		$oldlinesoffset++;
		array_unshift($out, 'gen '.$GLOBALS['gen']);
	}
	if ($english === 'warn' && $switchcounter !== 102) {
		$oldlinesoffset++;
		array_unshift($out, 'warning This is a spectator replay. Crashes may occur since the game may have been joined midway-through.');
	}
	
	return $out;

}


function convertById($name) {
	global $REPLAYS;
	if (!$REPLAYS[$name]) {
		return;
	}
	$text = file_get_contents("uploads/$name.html");
	
	$out = pokeConvert($text);
	
	if (substr($out[0],0,6) === 'error ') {
		return $out;
	}
	
	$fp = fopen("uploads/$name.js",'w');
	
	fwrite($fp, "var newlog = [\n");
	foreach ($out as $line) {
		fwrite($fp, "'".addcslashes($line,"'\\")."', \n");
	}
	fwrite($fp, "''];");
	fclose($fp);
	
	$fp = fopen("uploads/$name.txt",'w');
	foreach ($out as $line) fwrite($fp, $line."\r\n");
	fclose($fp);
	
	$REPLAYS[$name]['unidentified'] = array();
	$REPLAYS[$name]['tags'] = array();
	$lsreflect = array();
	foreach ($out as $line) {
		if (startsWith($line, '|-bounce-back ') && strpos($line, ' MagicCoat '))
			$REPLAYS[$name]['tags'][] = 'Magic Coat';
		if (startsWith($line, '|-transform '))
			$REPLAYS[$name]['tags'][] = 'Transform';
		if (startsWith($line, 'move ') && strpos($line, ' RelicSong '))
			$REPLAYS[$name]['tags'][] = 'Relic Song';
		if (endsWith($line, ' LightScreen'))
			$lsreflect['ls'] = true;
		if (endsWith($line, ' Reflect'))
			$lsreflect['r'] = true;
		if (endsWith($line, ' LightScreen end'))
			$lsreflect['ls'] = false;
		if (endsWith($line, ' Reflect end'))
			$lsreflect['r'] = false;
		if (startsWith($line, 'unknown-effect '))
			$REPLAYS[$name]['unidentified'][] = $line;
		if (startsRemove($line, 'error '))
			$REPLAYS[$name]['error'] = $line;
		if (startsRemove($line, 'warning '))
			$REPLAYS[$name]['tags'][] = 'Warning: '.$line;
		
		if ($lsreflect['r'] && $lsreflect['ls']) {
			$REPLAYS[$name]['tags'][] = 'Dual Screens';
			$lsreflect = array();
		}
	}
	if (!$REPLAYS[$name]['unidentified']) unset($REPLAYS[$name]['unidentified']);
	persist_save('REPLAYS');
	return $out;
}
