<?php

/*

License: CC0 (public domain)
  <http://creativecommons.org/publicdomain/zero/1.0/>

This license DOES NOT extend to any other files of the Pokemon replay viewer.

*/

include_once 'persist.lib.php';
include_once 'replays.inc.php';
include_once 'data/pokedex.inc.php';
include_once 'data/typechart.inc.php';

function parseName($name)
{
	$monthTable = array('january' => '01', 'february' => '02', 'march' => '03', 'april' => '04', 'may' => '05', 'june' => '06', 'july' => '07', 'august' => '08', 'september' => '09', 'october' => '10', 'november' => '11', 'december' => '12');
	if (substr($name, -5) === '.html') $name = substr($name,0,-5);
	if (substr($name, -4) === '.htm') $name = substr($name,0,-4);
	if (preg_match('/^(.*)\-\-([0-9]+) ([A-Z][a-z]+) ([0-9]+) at ([0-9]+)h([0-9]+)$/', $name, $matches))
	{
		$name = trim($matches[1]).'--'.$matches[4].'-'.$monthTable[strtolower($matches[3])].'-'.$matches[2];
	}
	$name = str_replace(' ','-',$name);
	
	$name = preg_replace('/[^A-Za-z0-9-]+/', '', $name);
	return $name;
}

function startsRemove(&$str, $substr)
{
	if (substr($str, 0, strlen($substr)) === $substr)
	{
		$str = substr($str, strlen($substr));
		return true;
	}
	return false;
}
function endsRemove(&$str, $substr)
{
	if (substr($str, -strlen($substr)) === $substr)
	{
		$str = substr($str, 0, -strlen($substr));
		return true;
	}
	return false;
}
function startsWith($str, $substr)
{
	return (substr($str, 0, strlen($substr)) === $substr);
}
function endsWith($str, $substr)
{
	return (substr($str, -strlen($substr)) === $substr);
}
function uppercaseFirstLetter($str)
{
	// I am raging at PO replays for this.
	return strtoupper(substr($str,0,1)).substr($str,1);
}
function lowercaseFirstLetter($str)
{
	// I am raging at PO replays for this.
	return strtolower(substr($str,0,1)).substr($str,1);
}
	$pokemontable = array('Bandier' => 'ally-Bandier(Dodrio)', 'Scarfy' => 'ally-Scarfy(Dodrio)');
function namePokemon($pokemon)
{
	global $pokemontable, $allpokemon, $currentpokemon;
	$pokemonConv = $pokemon;
	$pos = strrpos($pokemon, '(');
	if ($pos) $pokemonConv = substr($pokemon, 0, $pos);
	$pokemonConv = str_replace(' ', '', $pokemonConv);
	$currentpokemon[$pokemonConv] = $pokemon;
}
function matchName($pokemon)
{
	global $currentpokemon;
	foreach ($currentpokemon as $mpoke => $cpoke)
	{
		startsRemove($mpoke,'ally-');
		startsRemove($mpoke,'foe-');
		if ($pokemon === $mpoke) return $mpoke;
		else if ($pokemon === uppercaseFirstLetter($mpoke)) return $mpoke;
	}
	return $pokemon;
}
function resolvePokemon($pokemon)
{
	global $convertNotDone, $allpokemon, $allyname, $playernames, $pokemontable, $lastPokemon, $returnNow, $currentpokemon;
	if ($pokemontable[$pokemon])
	{
		$currentpokemon[$pokemontable[$pokemon]] = $pokemontable[$pokemon];
		$lastPokemon = $pokemontable[$pokemon];
		return $pokemontable[$pokemon];
	}
	$pokeid = '';
	//	echo '['.$playernames[0].'|'.$pokemon.']';
	if (startsRemove($pokemon, "The foe's ") || startsRemove($pokemon, "the foe's "))
	{
		$pokeid = $pokemon;
		$pokemon = 'foe-'.$pokemon;
	}
	else if (startsRemove($pokemon, $playernames[0]."'s ") || startsRemove($pokemon, uppercaseFirstLetter($playernames[0])."'s "))
	{
		$pokeid = $pokemon;
		$pokemon = 'ally-'.$pokemon;
	}
	else if (startsRemove($pokemon, $playernames[1]."'s ") || startsRemove($pokemon, uppercaseFirstLetter($playernames[1])."'s "))
	{
		$pokeid = $pokemon;
		$pokemon = 'foe-'.$pokemon;
	}
	else
	{
		$pokeid = $pokemon;
		$pokemon = 'ally-'.matchName($pokemon);
	}
	$pokemon = str_replace(' ', '', $pokemon);
	if ($convertNotDone && $pokeid && $allpokemon[$pokeid])
	{
		if (substr($pokemon,0,4) === 'foe-')
		{
			$allyname = 'foeof-'.$allpokemon[$pokeid];
			$returnNow = true;
			return '';
		}
		$allyname = $allpokemon[$pokeid];
		$returnNow = true;
		return '';
	}
	$lastPokemon = $pokemon;
	
	if ($GLOBALS['BattlePokemon'][getSpeciesForme($pokemon)]['number'] >= 494)
	{
		$GLOBALS['gen'] = 5;
	}
	if ($GLOBALS['BattlePokemon'][getSpeciesForme($pokemon)]['number'] >= 387 && $GLOBALS['gen'] < 4)
	{
		$GLOBALS['gen'] = 4;
	}
	if ($GLOBALS['BattlePokemon'][getSpeciesForme($pokemon)]['number'] >= 252 && $GLOBALS['gen'] < 4)
	{
		$GLOBALS['gen'] = 3;
	}
	if ($GLOBALS['BattlePokemon'][getSpeciesForme($pokemon)]['number'] >= 152 && $GLOBALS['gen'] < 4)
	{
		$GLOBALS['gen'] = 2;
	}
	
	return $pokemon;
}
function getSpeciesForme($pokemon)
{
	global $currentpokemon;
	if ($currentpokemon[$pokemon]) $pokemon = $currentpokemon[$pokemon];
	if (substr($pokemon,0,4) === 'foe-') $pokemon = substr($pokemon,4);
	if (substr($pokemon,0,5) === 'ally-') $pokemon = substr($pokemon,5);
	$pos = strrpos($pokemon, '(');
	if ($pos) $pokemon = substr($pokemon, $pos+1, -1);
	if ($pokemon==='Ho-Oh') $pokemon = "Ho-oh";
	return $pokemon;
}
function resolveMove($move)
{
	return str_replace(' ', '', $move);
}
function resolveUsername($move)
{
	return str_replace(' ', '', $move);
}
function resolveItem($move)
{
	return str_replace(' ', '', $move);
}
function resolveAbility($move)
{
	return str_replace(' ', '', $move);
}
function resolveStat($stat)
{
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
function isFoe($name)
{
	return resolveUsername($name) !== $GLOBALS['allyname'] && resolveUsername($name) !== uppercaseFirstLetter($GLOBALS['allyname']);
}
function markLastDamage($out)
{
	global $lastPokemon, $lastDamage;
	$lastDamage[$lastPokemon] = count($out)-1;
}
function markLastAttack($out)
{
	global $lastPokemon, $lastAttack;
	$lastAttack[$lastPokemon] = count($out)-1;
}
function attrLastAttack(&$out, $attr)
{
	global $lastPokemon, $lastAttack;
	if ($lastAttack[$lastPokemon])
	{
		$out[$lastAttack[$lastPokemon]] .= ' '.$attr;
	}
}
function makeLastLethal(&$out)
{
	global $lastPokemon, $lastDamage;
	if ($lastDamage[$lastPokemon] && !endsWith($out[$lastDamage[$lastPokemon]], ' (0.0)') && !endsWith($out[$lastDamage[$lastPokemon]], ' (0)'))
	{
		$out[$lastDamage[$lastPokemon]] .= ' (lethal)';
	}
}

$logversion = '';
function pokeConvert($text)
{
	global $convertNotDone, $logversion, $returnNow, $allpokemon, $out, $winner, $allyname, $playernames, $moveuser, $lastmove, $convertloopnum;
	$english = false;
	$GLOBALS['gen'] = 1;
	$switchcounter = 0;
	//echo "<div>started</div>";

	if (strpos($text, '<!DOCTYPE') === false && strpos($text, '<b><span style=\'color:') !== 0 && !startsWith($text, '<!--Log belonging to '))
	{
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


if (strpos($text, '.-->'))
{
	$text = str_replace("-->",'<br />-->', $text);
}

$text = explode('<br />', $text);

	$allyname = '';

	$convertloopnum = 0;
	do
	{
		$convertNotDone = false;
		$returnNow = false;
		$out = pokeConvertInner($text);
		$convertloopnum++;
	} while ($convertNotDone && $convertloopnum < 3);

	//echo var_export($allpokemon);
	//echo "<div>$allyname</div>";

	if ($convertNotDone)
	{
		return array('error This replay could not be processed.');
	}
	return $out;
}

function pokeConvertInner($text)
{
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
	
	foreach ($text as $i => $line)
	{
		if ($firstline)
		{
			$firstline = false;
		}
		$line = str_replace('&', '&amp;', $line);
		
		$line = preg_replace('/\<span class="[^>]*>/', '', $line, 1, $count);
		if ($count)
		{
			endsRemove($line, '</span>');
		}
		
		$line = str_replace('</span>', '&gt;', $line);
		$line = preg_replace('/\<span[^>]*>/', '&lt;', $line);
		$line = str_replace('</div>', '', $line);
		$line = preg_replace('/\<div[^>]*>/', '', $line);
		$line = str_replace('</a>', '', $line);
		$line = preg_replace('/\<a[^>]*>/', '', $line);
		$line = str_replace('</b>', '&gt;', $line);
		$line = str_replace('<b>', '&lt;', $line);
		$line = trim($line);
		startsRemove($line, '-->');
		if (startsRemove($line, '<!--')) $line = '&lt;!&gt;'.$line;
		if (strpos($line, '<') !== false)
		{
			$convertNotDone = false;
			return array('error This does not appear to be a valid Pokemon Online replay (line '.($i+1).': '.($line).').');
		}
		$line = str_replace('&gt;', '>', $line);
		$line = str_replace('&lt;', '<', $line);
		$line = str_replace('>>', '>', $line);
		$line = str_replace('<<', '<', $line);
		$line = str_replace('&amp;', '&', $line);
		$line = trim($line);
		$newline = $line;
		$oldlines[] = array(count($out), $newline);
		if ($line === '')
		{
			$out[] = '';
		}
		else if (startsRemove($line, '<!>'))
		{
			$outcount = count($out);
			//$lastline = '';
			if ($outcount > 1) $lastline =& $out[$outcount-1];
			$statuses = array(
				'fine' => 'none',
				'koed' => 'fnt'
			);
			if (startsRemove($line, 'Log belonging to '))
			{
				//$allyname = resolveUsername($line);
			}
			else if (preg_match('/^([^<>]+) sent out ([^<>]+)!( \([^<>]+\))?$/', $line, $matches))
			{
				$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2].$matches[3];
				namePokemon($pokemon);
				$pokemon = str_replace(' ','',$pokemon);
				if ($lastmove === 'Roar' || $lastmove === 'Whirlwind' || $lastmove === 'DragonTail' || $lastmove === 'CircleThrow')
				{
					$out[] = 'drag-out-anim switched-'.$pokemon;
				}
				else
				{
					$out[] = 'replace switched-'.$pokemon;
				}
			}
			else if (preg_match('/^([^<>]+)\'s life: ([0-9]+)%.$/', $line, $matches))
			{
				if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace '))
				{
					$lastline .= ' ('.$matches[2].')';
				}
			}
			else if (preg_match('/^([^<>]+)\'s life: ([0-9]+)\/([0-9]+) HP.$/', $line, $matches))
			{
				if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace '))
				{
					$lastline .= ' ('.number_format(100*intval($matches[2])/intval($matches[3]), 1, '.', '').')';
				}
			}
			else if (preg_match('/^([^<>]+)\'s status: ([a-z]+).$/', $line, $matches))
			{
				$status = $statuses[$matches[2]];
				if ($status)
				{
					if (startsWith($lastline, 'switch-in ') || startsWith($lastline, 'replace '))
					{
						if (endsWith($lastline,')'))
						{
							$lastline = substr($lastline,0,-1).'|'.$statuses[$matches[2]].')';
						}
						else $lastline = $lastline.' ('.$statuses[$matches[2]].')';
					}
				}
			}
			else if (preg_match('/^([^<>]+)\'s new HP is ([0-9]+)\/([0-9]+).$/', $line, $matches) ||
			         preg_match('/^([^<>]+)\'s new HP is ([0-9]+)%.$/', $line, $matches))
			{
				if (!$matches[3]) $newhp = $matches[2];
				else $newhp = number_format(100*intval($matches[2])/intval($matches[3]), 1, '.', '');
				if ($GLOBALS['logversion'] !== '2.0' || $matches[3])
				{
					if (startsWith($lastline,'  r-recoil ') || startsWith($lastline,'  r-life-orb-recoil '))
					{
						$lastline .= ' ('.$newhp.')';
					}
					else if (startsWith($lastline,'stealth-rock-damage '))
					{
						$lastline .= ' ('.$newhp.')';
					}
					else if (startsWith($lastline,'  r-damage '))
					{
						$lastline .= ' ('.$newhp.')';
					}
					else if (startsWith($lastline,'residual ') && (strpos($lastline, ' leech-seed ') || strpos($lastline, ' item-heal ') || strpos($lastline, ' wish ')))
					{
						$lastline .= ' ('.$newhp.')';
					}
				}
			}
		}
		else if (startsRemove($line, '<Tier: >'))
		{
			$out[] = 'tier '.$line;
		}
		else if (startsRemove($line, '<Variation: >'))
		{
			$out[] = 'variation '.$line;
		}
		else if (startsRemove($line, '<Rule: >'))
		{
			$out[] = 'rule '.$line;
		}
		else if (startsRemove($line, '<Start of turn '))
		{
			endsRemove($line, '>');
			endsRemove($line, '!');
			$out[] = 'turn '.$line;
			if (substr($line, 0, -1) === '1' && $switchcounter < 100) $switchcounter += 100;
			else if ($switchcounter < 100) $switchcounter += 200;
			// damage doesn't actually happen here, but any undetected messages that do damage...
			markLastDamage($out);
		}
		else if (endsRemove($line, ' fainted!>'))
		{
			$out[] = 'faint '.resolvePokemon(substr($line, 1));
			makeLastLethal($out);
		}
		else if (endsRemove($line, ' is exerting its Pressure!'))
		{
			$out[] = '  r-pressure '.resolvePokemon($line);
		}
		else if (endsRemove($line, ' has Mold Breaker!'))
		{
			$out[] = '  r-mold-breaker '.resolvePokemon($line);
		}
		else if (endsRemove($line, ' is hit with recoil!'))
		{
			$out[] = '  r-recoil '.resolvePokemon($line).' ??';
			markLastDamage($out);
		}
		else if ($line === "<It's not very effective...>")
		{
			$out[] = '  r-resisted';
		}
		else if ($line === "But it failed!")
		{
			$out[] = '  r-failed '.$moveuser;
		}
		else if ($line === "But there was no target...")
		{
			$out[] = '  r-no-target '.$moveuser;
			attrLastAttack($out, 'no-target');
		}
		else if ($line === "It had no effect!")
		{
			$out[] = '  r-immune '.$movetarget;
		}
		else if ($line === "<But nothing happened!>")
		{
			$out[] = '  r-nothing-happened';
		}
		else if ($line === "<It's super effective!>")
		{
			$out[] = '  r-super-effective';
		}
		else if ($line === "<A critical hit!>")
		{
			$out[] = '  r-crit';
		}
		else if ($line === "<It hurt itself in its confusion!>")
		{
			$out[] = '  r-hurt-confusion';
		}
		else if ($line === "<It's a one hit KO!>")
		{
			$out[] = '  r-ohko';
		}
		else if ($line === "<The sunlight is strong!>")
		{
			$out[] = 'weather-upkeep sun';
		}
		else if ($line === "<Rain continues to fall!>")
		{
			$out[] = 'weather-upkeep rain';
		}
		else if ($line === "<The sunlight turned harsh!>")
		{
			$out[] = 'weather sun';
		}
		else if ($line === "<It started to rain!>")
		{
			$out[] = 'weather rain';
		}
		else if ($line === "<A hailstorm brewed!>")
		{
			$out[] = 'weather hail';
		}
		else if ($line === "<Hail continues to fall!>")
		{
			$out[] = 'weather hail';
		}
		else if ($line === "<A sandstorm brewed!>")
		{
			$out[] = 'weather sandstorm';
		}
		else if ($line === "<The sandstorm rages!>")
		{
			$out[] = 'weather-upkeep sandstorm';
		}
		else if ($line === "<The sunlight faded!>")
		{
			$out[] = 'weather none';
		}
		else if ($line === "<The rain stopped!>")
		{
			$out[] = 'weather none';
		}
		else if ($line === "<The sandstorm subsided!>")
		{
			$out[] = 'weather none';
		}
		else if ($line === "<The hail subsided!>")
		{
			$out[] = 'weather none';
		}
		else if ($line === '<All stat changes were eliminated!>')
		{
			$out[] = '  r-haze';
		}
		else if ($line === '<The battlers shared their pain!>')
		{
			$out[] = '  r-pain-split';
		}
		else if (endsRemove($line, '\'s Wonder Guard evades the attack!'))
		{
			$out[] = '  r-ability-evade '.resolvePokemon($line).' WonderGuard';
		}
		else if (endsRemove($line, ' avoided the attack!'))
		{
			attrLastAttack($out, 'miss');
			$out[] = '  r-avoid '.resolvePokemon($line).'';
		}
		else if (endsRemove($line, ' regained health!>'))
		{
			$out[] = '  r-heal '.resolvePokemon(substr($line, 1)).' ??';
		}
		else if (endsRemove($line, ' restored some HP!'))
		{
			$out[] = '  r-heal '.resolvePokemon($line).' ??';
		}
		else if (endsRemove($line, ' was poisoned!>'))
		{
			if ($lastmove === 'Toxic')
			{
				$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' toxic';
			}
			else
			{
				$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' psn';
			}
		}
		else if (endsRemove($line, ' was badly poisoned!>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' toxic';
		}
		else if (endsRemove($line, ' is already poisoned.>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' psn already';
		}
		else if (endsRemove($line, ' is already burnt.>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' brn already';
		}
		else if (endsRemove($line, ' is already paralyzed.>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' par already';
		}
		else if (endsRemove($line, ' calmed down!>'))
		{
			$out[] = '  r-calm '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, ' is confused!>'))
		{
			$out[] = 'pre-move '.resolvePokemon(substr($line, 1)).' confused';
		}
		else if (endsRemove($line, ' is fast asleep!>'))
		{
			$out[] = 'pre-move '.resolvePokemon(substr($line, 1)).' slp';
		}
		else if (endsRemove($line, ' is being sent back!>'))
		{
			$out[] = 'pre-move '.resolvePokemon(substr($line, 1)).' switch-out';
		}
		else if (endsRemove($line, ' woke up!>'))
		{
			$out[] = '  r-cure-status '.resolvePokemon(substr($line, 1)).' slp';
		}
		else if (endsRemove($line, '\'s status cleared!'))
		{
			$out[] = '  r-cure '.resolvePokemon($line);
		}
		else if (endsRemove($line, '\'s status cleared!>'))
		{
			$out[] = '  r-cure '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, ' landed on the ground!>'))
		{
			$out[] = '  r-turnstatus '.resolvePokemon(substr($line, 1)).' landed';
		}
		else if (endsRemove($line, ' protected itself!>'))
		{
			$out[] = '  r-turnstatus '.resolvePokemon(substr($line, 1)).' protect';
		}
		else if (endsRemove($line, ' shrouded itself with Magic Coat!>'))
		{
			$out[] = '  r-turnstatus '.resolvePokemon(substr($line, 1)).' magic-coat';
		}
		else if (endsRemove($line, ' braced itself!>'))
		{
			$out[] = '  r-turnstatus '.resolvePokemon(substr($line, 1)).' endure';
		}
		else if (endsRemove($line, ' is tightening its focus!>'))
		{
			$out[] = '  r-turnstatus '.resolvePokemon(substr($line, 1)).' focusing';
		}
		else if (endsRemove($line, ' is hurt by poison!>'))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' poison ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, ' is hurt by its burn!>'))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' burn ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, ' was burned!>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' brn';
		}
		else if (endsRemove($line, ' is paralyzed! It may be unable to move!>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' par';
		}
		else if (endsRemove($line, ' is paralyzed! It can\'t move!>'))
		{
			$out[] = 'cant-move '.resolvePokemon(substr($line, 1)).' fully-paralyzed';
		}
		else if (endsRemove($line, ' can\'t attack while in the air!>'))
		{
			$out[] = 'cant-move '.resolvePokemon(substr($line, 1)).' in-air';
		}
		else if (endsRemove($line, ' became confused!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' confused';
		}
		else if (endsRemove($line, ' snapped out its confusion!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' confused end';
		}
		else if (endsRemove($line, " was prevented from healing!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' healblock';
		}
		else if (endsRemove($line, " must recharge!>"))
		{
			$out[] = 'cant-move '.resolvePokemon(substr($line, 1)).' must-recharge';
		}
		else if (endsRemove($line, " vanished instantly!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' ShadowForce';
		}
		else if (endsRemove($line, " sprang up!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' Bounce';
		}
		else if (endsRemove($line, " burrowed its way under the ground!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' Dig';
		}
		else if (endsRemove($line, " hid underwater!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' Dive';
		}
		else if (endsRemove($line, " flew high up!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' Fly';
		}
		else if (endsRemove($line, " absorbed light!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' SolarBeam';
		}
		else if (endsRemove($line, " became cloaked in a harsh light!>"))
		{
			$out[] = 'prepare-move '.resolvePokemon(substr($line, 1)).' SkyAttack';
		}
		else if (endsRemove($line, "'s heal block wore off!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' healblock end';
		}
		else if (endsRemove($line, ' fell asleep!>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' slp';
		}
		else if (endsRemove($line, ' woke up!'))
		{
			$out[] = '  r-cure-status '.resolvePokemon($line).' slp';
		}
		else if (endsRemove($line, ' was frozen solid!>'))
		{
			$out[] = '  r-status '.resolvePokemon(substr($line, 1)).' frz';
		}
		else if (endsRemove($line, ' thawed out!>'))
		{
			$out[] = '  r-cure-status '.resolvePokemon(substr($line, 1)).' frz';
		}
		else if (endsRemove($line, ' is frozen solid!>'))
		{
			$out[] = 'cant-move '.resolvePokemon(substr($line, 1)).' frozen';
		}
		else if (endsRemove($line, ' cut its own HP and maximized its Attack!>'))
		{
			$out[] = '  r-belly-drum '.resolvePokemon(substr($line, 1)).'';
		}
		else if (endsRemove($line, ' flinched!'))
		{
			$out[] = 'flinch '.resolvePokemon($line);
		}
		else if (endsRemove($line, ' is hurt by its Life Orb!'))
		{
			$out[] = '  r-life-orb-recoil '.resolvePokemon($line).' ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, ' is floating on a balloon!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' balloon';
		}
		else if (endsRemove($line, ' is floating on a balloon!'))
		{
			$out[] = '  r-volatile '.resolvePokemon($line).' balloon';
		}
		else if (endsRemove($line, "'s Air Balloon popped!>") || endsRemove($line, "'s Balloon popped!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' balloon end';
		}
		else if (endsRemove($line, "'s Air Balloon popped!") || endsRemove($line, "'s Balloon popped!"))
		{
			$out[] = '  r-volatile '.resolvePokemon($line).' balloon end';
		}
		else if (endsRemove($line, "'s Rain Dish heals it!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' ability-heal RainDish';
		}
		else if (endsRemove($line, "'s Ice Body heals it!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' ability-heal IceBody';
		}
		else if (endsRemove($line, " was seeded!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' seed';
		}
		else if (endsRemove($line, "'s Drought intensified the sun's rays!>"))
		{
			$out[] = '  r-weather '.resolvePokemon(substr($line, 1)).' sun';
		}
		else if (endsRemove($line, "'s Sand Stream whipped up a sandstorm!>"))
		{
			$out[] = '  r-weather '.resolvePokemon(substr($line, 1)).' sandstorm';
		}
		else if (endsRemove($line, " is buffeted by the sandstorm!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' sandstorm ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, "'s Snow Warning whipped up a hailstorm!>"))
		{
			$out[] = '  r-weather '.resolvePokemon(substr($line, 1)).' hail';
		}
		else if (endsRemove($line, " is buffeted by the hail!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' hail ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, "'s Drizzle made it rain!>"))
		{
			$out[] = '  r-weather '.resolvePokemon(substr($line, 1)).' rain';
		}
		else if (endsRemove($line, " twisted the dimensions!>"))
		{
			$out[] = '  r-pseudo-weather '.resolvePokemon(substr($line, 1)).' TrickRoom';
		}
		else if ($line === '<The twisted dimensions returned to normal!>')
		{
			$out[] = 'pseudo-weather-end TrickRoom';
		}
		else if (endsRemove($line, " swapped the Sp. Def. and the Defense of all the pokemon!>"))
		{
			$out[] = '  r-pseudo-weather '.resolvePokemon(substr($line, 1)).' WonderRoom';
		}
		else if ($line === '<The Sp. Def and Defense of the pokemon went back to normal!>')
		{
			$out[] = 'pseudo-weather-end WonderRoom';
		}
		else if (endsRemove($line, " cancelled the items' effects!>"))
		{
			$out[] = '  r-pseudo-weather '.resolvePokemon(substr($line, 1)).' MagicRoom';
		}
		else if ($line === '<The items are now working again!>')
		{
			$out[] = 'pseudo-weather-end MagicRoom';
		}
		else if (endsRemove($line, " is already preparing its next move!"))
		{
			$out[] = '  r-custap '.resolvePokemon($line);
		}
		else if (startsRemove($line, "<It doesn't affect "))
		{
			$out[] = '  r-doesnt-affect '.resolvePokemon(substr($line, 0, -4));
		}
		else if (endsRemove($line, "mon hearing the song will faint in three turns!>"))
		{
			$out[] = '  r-perish-song '.$moveuser;
		}
		else if (endsRemove($line, "'s health is sapped by leech seed.>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' leech-seed ?? ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, " has Teravolt!"))
		{
			$out[] = '  r-ability-notify '.resolvePokemon($line).' Teravolt';
		}
		else if (endsRemove($line, " has Cloud Nine!"))
		{
			$out[] = '  r-ability-notify '.resolvePokemon($line).' CloudNine';
		}
		else if (endsRemove($line, " has Air Lock!"))
		{
			$out[] = '  r-ability-notify '.resolvePokemon($line).' AirLock';
		}
		else if (endsRemove($line, " has Turboblaze!") || endsRemove($line, " has Turbo Blaze!"))
		{
			$out[] = '  r-ability-notify '.resolvePokemon($line).' Turboblaze';
		}
		else if (endsRemove($line, " has Turboblaze!") || endsRemove($line, " has TeraVoltage!"))
		{
			$out[] = '  r-ability-notify '.resolvePokemon($line).' Teravolt';
		}
		else if (endsRemove($line, "'s Speed Boost increases its speed!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' ability-activate SpeedBoost';
		}
		else if (endsRemove($line, "'s Poison Point activates!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line,1)).' ability-activate PoisonPoint';
		}
		else if (endsRemove($line, "'s Download activates!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' ability-activate Download';
		}
		else if (endsRemove($line, "'s Cursed Body activates!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' ability-activate CursedBody';
		}
		else if (endsRemove($line, "'s Flame Body activates!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line,1)).' ability-activate FlameBody';
		}
		else if (endsRemove($line, "'s stat changes were eliminated!>"))
		{
			$out[] = '  r-poke-haze '.resolvePokemon(substr($line,1)).'';
		}
		else if (endsRemove($line, "'s Quick Claw activated!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' item-activate QuickClaw';
			$lastmove = 'Toxic';
		}
		else if (endsRemove($line, "'s Toxic Orb activated!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' item-activate ToxicOrb';
			$lastmove = 'Toxic';
		}
		else if (endsRemove($line, "'s Flame Orb activated!"))
		{
			$out[] = 'residual '.resolvePokemon($line).' item-activate FlameOrb';
		}
		else if (endsRemove($line, ' was dragged out!>'))
		{
			$prevline = count($out)-1;
			if ($out[$prevline] === 'faint '.resolvePokemon(substr($line, 1)))
			{
				$out[$prevline] = 'drag-out '.resolvePokemon(substr($line, 1));
				$out[] = 'faint '.resolvePokemon(substr($line, 1));
			}
			else
			{
				$out[] = 'drag-out '.resolvePokemon(substr($line, 1));
			}
		}
		else if (endsRemove($line, ' made a substitute!>'))
		{
			$out[] = '  r-sub '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, ' already has a substitute.>'))
		{
			$out[] = '  r-sub '.resolvePokemon(substr($line, 1)).' already';
		}
		else if (endsRemove($line, ' is already confused.>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' confused already';
		}
		else if (endsRemove($line, ' hung on using its Focus Sash!') || endsRemove($line, ' hung on using its focus sash!'))
		{
			$out[] = '  r-sash '.resolvePokemon($line);
		}
		else if (endsRemove($line, ' held on thanks to Sturdy!'))
		{
			$out[] = '  r-sturdy '.resolvePokemon($line);
			$GLOBALS['gen'] = 5;
		}
		else if (endsRemove($line, ' regains health with its Regenerator!') || endsRemove($line, ' regains health with its Regeneration!'))
		{
			// ignore
		}
		else if (endsRemove($line, ' is watching the battle.>'))
		{
			$out[] = 'spectator '.substr($line, 1);
		}
		else if (endsRemove($line, ' stopped watching the battle.>'))
		{
			$out[] = 'spectator-end '.substr($line, 1);
		}
		else if (endsRemove($line, ' had its energy drained!'))
		{
			$out[] = '  r-drain '.resolvePokemon($line).' ?? ??';
		}
		else if (endsRemove($line, ' went to sleep and became healthy!>'))
		{
			$out[] = '  r-rested '.resolvePokemon(substr($line,1)).'';
		}
		else if (startsRemove($line, '<Pointed stones dug into '))
		{
			$pokemon = resolvePokemon(substr($line, 0, -2));
			$damage = 12.5 * getDamageTaken('Rock', $GLOBALS['BattlePokemon'][getSpecies($pokemon)]);
			//echo '['.$pokemon.'|'.getSpecies($pokemon).']';
			$out[] = 'stealth-rock-damage '.$pokemon.' '.$damage;
			markLastDamage($out);
		}
		else if (endsRemove($line, "'s wish came true!>"))
		{
			$out[] = 'residual ?? wish '.resolveUsername(substr($line, 1)).' ??';
		}
		else if ($line === "<The healing wish came true!>")
		{
			$out[] = 'residual ?? healing-wish ?? ??';
		}
		else if ($line === "<A soothing aroma wafted through the area!>")
		{
			$out[] = '  r-cure-all '.$moveuser.' Aromatherapy';
		}
		else if ($line === "<A bell chimed!>")
		{
			$out[] = '  r-cure-all '.$moveuser.' HealBell';
		}
		else if (endsRemove($line, " has bad dreams!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' bad-dreams ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, " took the Doom Desire attack!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' move DoomDesire';
		}
		else if (endsRemove($line, " chose Doom Desire as its destiny!>"))
		{
			$out[] = '  r-doom-desire '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, ' is hurt by spikes!>'))
		{
			$out[] = 'spikes-damage '.resolvePokemon(substr($line, 1)).' ??';
			markLastDamage($out);
		}
		else if (endsRemove($line, ' blew away Leech Seed!>'))
		{
			$out[] = '  r-blow-away '.resolvePokemon(substr($line, 1)).' LeechSeed';
		}
		else if (endsRemove($line, ' blew away Stealth Rock!>'))
		{
			$out[] = '  r-blow-away '.resolvePokemon(substr($line, 1)).' StealthRock';
		}
		else if (endsRemove($line, ' blew away Spikes!>'))
		{
			$out[] = '  r-blow-away '.resolvePokemon(substr($line, 1)).' Spikes';
		}
		else if (endsRemove($line, ' blew away Toxic Spikes!>'))
		{
			$out[] = '  r-blow-away '.resolvePokemon(substr($line, 1)).' ToxicSpikes';
		}
		else if (endsRemove($line, ' fell for the taunt!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' taunt';
		}
		else if (endsRemove($line, '\'s Flash Fire raised the power of its Fire-type moves!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' flash-fire';
		}
		else if (endsRemove($line, ' is now tormented!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' torment';
		}
		else if (endsRemove($line, ' received an encore!>'))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' encore';
		}
		else if (endsRemove($line, "'s taunt ended!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' taunt end';
		}
		else if (endsRemove($line, "'s Encore ended!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' encore end';
		}
		else if (endsRemove($line, "'s substitute faded!>"))
		{
			$out[] = '  r-sub-fade '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, "'s substitute took the damage!>"))
		{
			$out[] = '  r-sub-damage '.resolvePokemon(substr($line, 1));
		}
		else if (endsRemove($line, " planted its roots!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' ingrain';
		}
		else if (endsRemove($line, " surrounded itself with a veil of water!>"))
		{
			$out[] = '  r-volatile '.resolvePokemon(substr($line, 1)).' aqua-ring';
		}
		else if (endsRemove($line, " absorbed nutrients with its roots!>"))
		{
			$out[] = 'residual '.resolvePokemon(substr($line, 1)).' heal ingrain';
		}
		else if (startsRemove($line, "<Aquaring restored "))
		{
			endsRemove($line, "'s HP.>");
			$out[] = 'residual '.resolvePokemon($line).' heal aqua-ring';
		}
		else if (endsRemove($line, " is trying to take its foe with it!>"))
		{
			$out[] = '  r-destiny-bond '.resolvePokemon(substr($line, 1));
		}
		else if (preg_match('/^\<([^<>]+) can\'t use ([^<>]+) after the taunt!\>$/', $line, $matches))
		{
			$out[] = 'cant-move '.resolvePokemon($matches[1]).' taunt '.resolveMove($matches[2]);
		}
		else if (preg_match('/^([^<>]+) used \<([^<>]+)\>!$/', $line, $matches))
		{
			$moveuser = resolvePokemon($matches[1]);
			$movetarget = 'foeof-'.resolvePokemon($matches[1]);
			$lastmove = resolveMove($matches[2]);
			$out[] = 'move '.$moveuser.' '.resolveMove($matches[2]).' ??';
			markLastAttack($out);
			
			if ($matches[2] === 'Explosion' || $matches[2] === 'Selfdestruct' || $matches[2] === 'Lunar Dance' || $matches[2] === 'Healing Wish' || $matches[2] === 'Memento' || $matches[2] === 'Final Gambit')
			{
				markLastDamage($out);
			}
		}
		else if (preg_match('/^([^<>]+) sent out ([^<>]+)!( \([^<>]+\))?$/', $line, $matches))
		{
			if ($allpokemon[$matches[2]] && $allpokemon[$matches[2]] != resolveUsername($matches[1]))
			{
				$allpokemon[$matches[2]] = false;
			}
			else if ($allpokemon[$matches[2]] !== false)
			{
				$allpokemon[$matches[2]] = resolveUsername($matches[1]);
			}
			$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2].$matches[3];
			namePokemon($pokemon);
			$pokemon = str_replace(' ','',$pokemon);
			$out[] = 'switch-in switched-'.$pokemon;
			$lastmove = 'switch';
			
			if ($switchcounter < 99) $switchcounter++;
		}
		else if (preg_match('/^\<Pointed stones float in the air around ([^<>]+)\'s team!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' StealthRock';
		}
		else if (preg_match('/^\<Spikes were scattered all around the feet of ([^<>]+)\'s team!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Spikes';
		}
		else if (preg_match('/^\<Poison spikes were scattered all around the feet of ([^<>]+)\'s team!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' ToxicSpikes';
		}
		else if (preg_match('/^\<A tailwind started blowing behind ([^<>]+)\'s team!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Tailwind';
		}
		else if (preg_match('/^\<([^<>]+)\'s team tailwind petered out!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = 'side-condition '.$side.' Tailwind end';
		}
		else if (preg_match('/^\<Reflect raised ([^<>]+)\'s team defense!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Reflect';
		}
		else if (preg_match('/^\<([^<>]+)\'s reflect wore off!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Reflect end';
		}
		else if (preg_match('/^\<([^<>]+)\'s team became cloaked in a mystical veil!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Safeguard';
		}
		else if (preg_match('/^\<([^<>]+)\'s team is no longer protected by Safeguard!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' Safeguard end';
		}
		else if (preg_match('/^\<Light Screen raised ([^<>]+)\'s team special defense!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' LightScreen';
		}
		else if (preg_match('/^\<([^<>]+)\'s light screen wore off!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[1])?'foe':'ally');
			$out[] = '  r-side-condition '.$side.' LightScreen end';
		}
		else if (preg_match('/^\<([^<>]+) shattered ([^<>]+)\'s team protections!\>?$/', $line, $matches))
		{
			$side = (isFoe($matches[2])?'foe':'ally');
			$out[] = '  r-shatter '.resolvePokemon($matches[1]).' '.$side;
		}
		else if (preg_match('/^([^<>]+)\'s Synchronize changes the status of ([^<>]+)!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-activate Synchronize '.resolvePokemon($matches[2]).'';
		}
		else if (preg_match('/^([^<>]+) called ([^<>]+) back!$/', $line, $matches))
		{
			$pokemon = (isFoe($matches[1])?'foe-':'ally-').$matches[2];
			$pokemon = str_replace(' ','',$pokemon);
			$out[] = 'switch-out '.$pokemon;
		}
		else if (preg_match('/^\<?([^<>]+) transformed into ([^<>]+)!\>?$/', $line, $matches))
		{
			$out[] = '  r-transform '.resolvePokemon($matches[1]).' '.resolveUsername($matches[2]).'';
		}
		else if (preg_match('/^\<([^<>]+) made ([^<>]+) feel drowsy!\>$/', $line, $matches))
		{
			$out[] = '  r-volatile '.resolvePokemon($matches[2]).' drowsy start '.resolvePokemon($matches[1]).'';
		}
		else if (preg_match('/^([^<>]+) is hurt by ([^<>]+)\'s ([A-Za-z .\']+)!$/', $line, $matches))
		{
			$out[] = '  r-foe-item-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveItem($matches[3]).' ??';
			resolvePokemon($matches[1]); // is the one taking the damage
			markLastDamage($out);
		}
		else if (preg_match('/^\<([^<>]+) was hurt by ([A-Za-z .\']+)!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' move-damage '.resolveItem($matches[2]).' ??';
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) is hurt by its ([A-Za-z .\']+)!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-damage '.resolveItem($matches[2]).' ??';
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) was hurt by Black Sludge!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-damage BlackSludge ??';
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) restored its stats using ([A-Za-z .\']+)!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-restore '.resolveItem($matches[2]);
		}
		else if (preg_match('/^([^<>]+) restored a little HP using its ([A-Za-z .\']+)!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-heal '.resolveItem($matches[2]);
		}
		else if (preg_match('/^\<([^<>]+) restored HP using its ([A-Za-z .\']+)!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-heal '.resolveAbility($matches[2]);
		}
		else if (preg_match('/^([^<>]+) used its Mental Herb to come back to (his|her|its) senses!$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' item-customcure MentalHerb';
		}
		else if (preg_match('/^\<([^<>]+)\'s Hydration heals its status!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure Hydration';
		}
		else if (preg_match('/^\<([^<>]+)\'s Insomnia cures it!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure Insomnia';
		}
		else if (preg_match('/^\<([^<>]+)\'s Shed Skin heals its status!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-cure ShedSkin';
		}
		else if (preg_match('/^The attack of ([^<>]+) missed!$/', $line, $matches))
		{
			$out[] = '  r-miss '.resolvePokemon($matches[1]);
			attrLastAttack($out, 'miss');
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) drastically fell!$/', $line, $matches))
		{
			$out[] = '  r-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) sharply fell!$/', $line, $matches))
		{
			$out[] = '  r-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 2';
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) fell!$/', $line, $matches))
		{
			$out[] = '  r-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 1';
		}
		else if (preg_match('/^([^<>]+) lost ([0-9]+)% of its health!$/', $line, $matches))
		{
			$out[] = '  r-damage '.resolvePokemon($matches[1]).' '.$matches[2];
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) lost ([0-9]+) HP! \(([0-9]+)% of its health\)$/', $line, $matches))
		{
			$out[] = '  r-damage '.resolvePokemon($matches[1]).' '.$matches[3];
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) traced ([^<>]+)\'s ([A-Za-z ]+)!$/', $line, $matches))
		{
			$out[] = '  r-trace '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveAbility($matches[3]);
		}
		else if (preg_match('/^\<([^<>]+) knocked off ([^<>]+)\'s ([A-Za-z ]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-knock-off '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveAbility($matches[3]);
		}
		else if (preg_match('/^\<([^<>]+) knocked ([^<>]+) on the ground!\>$/', $line, $matches))
		{
			$out[] = '  r-volatile '.resolvePokemon($matches[2]).' grounded start '.resolvePokemon($matches[1]);
		}
		else if (preg_match('/^\<([^<>]+)\'s substitute blocked ([^<>]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-sub-block '.resolvePokemon($matches[1]).' '.resolveMove($matches[2]);
		}
		else if (preg_match('/^\<(.+?): \>([^<>]+)$/', $line, $matches))
		{
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		}
		else if (preg_match('/^\<(.+?): \>\<([^<>]+)\>$/', $line, $matches))
		{
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		}
		else if (preg_match('/^\<(.+?)\>: ([^<>]+)$/', $line, $matches))
		{
			$out[] = 'chat '.resolveUsername($matches[1]).' '.$matches[2];
		}
		else if (preg_match('/^\<([^<>]+) flung its ([^<>]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-fling '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]);
		}
		else if (preg_match('/^([^<>]+) ate its ([^<>]+)!$/', $line, $matches))
		{
			$out[] = '  r-eat '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]);
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .\']+) weakened ([^<>]+)\'s power!$/', $line, $matches))
		{
			$out[] = '  r-weaken '.resolvePokemon($matches[1]).' '.resolveMove($matches[3]).' '.resolveItem($matches[2]);
		}
		else if (preg_match('/^\<([^<>]+) stole and ate ([^<>]+)\'s ([^<>]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-steal-eat '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' '.resolveItem($matches[3]);
		}
		else if (preg_match('/^\<([^<>]+)\'s Storm Drain raised its special attack!\>$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' spa 1 StormDrain';
		}
		else if (preg_match('/^\<?([^<>]+)\'s Competitive Spirit sharply raised its Attack!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' atk 2 CompetitiveSpirit';
		}
		else if (preg_match('/^\<?([^<>]+)\'s Lightningrod raised its (Special Attack|special attack)!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' spa 1 Lightningrod';
		}
		else if (preg_match('/^\<?([^<>]+)\'s (Justified|Justice Heart) raised its attack!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' atk 1 Justified';
		}
		else if (preg_match('/^\<?([^<>]+)\'s (Herbivore|Sap Sipper) raised its attack!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' atk 1 SapSipper';
		}
		else if (preg_match('/^\<?([^<>]+)\'s Motor Drive raise(d|s) its speed!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' spe 1 MotorDrive';
		}
		else if (preg_match('/^\<?([^<>]+)\'s (Steadfast|SteadFast) increases its speed!\>?$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' spe 1 Steadfast';
		}
		else if (preg_match('/^([^<>]+)\'s Absorb Bulb raised its Sp. Att.!$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' spa 1 AbsorbBulb';
		}
		else if (preg_match('/^([^<>]+)\'s (Moody|Inconsistent) sharply raises its ([a-zA-Z .\']+)!$/', $line, $matches))
		{
			$out[] = '  r-ability-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[3]).' 2 Moody';
		}
		else if (preg_match('/^([^<>]+)\'s (Moody|Inconsistent) lowers its ([a-zA-Z .\']+)!$/', $line, $matches))
		{
			$out[] = '  r-ability-unboost '.resolvePokemon($matches[1]).' '.resolveStat($matches[3]).' 1 Moody';
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .\']+) raised ([^<>]+)\'s power!$/', $line, $matches))
		{
			$out[] = '  r-gem '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]).' '.resolveMove($matches[3]).'';
		}
		else if (preg_match('/^The ([a-zA-Z .\']+) raised ([^<>]+)\'s ([a-zA-Z .\']+)!$/', $line, $matches))
		{
			$out[] = '  r-item-boost '.resolvePokemon($matches[2]).' '.resolveStat($matches[3]).' 1 '.resolveItem($matches[1]).'';
		}
		else if (preg_match('/^\<([^<>]+) switched items with ([^<>]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-trick '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		}
		else if (preg_match('/^<([^<>]+) obtained one ([a-zA-Z .\']+)!>$/', $line, $matches))
		{
			$out[] = '  r-trick-get '.resolvePokemon($matches[1]).' '.resolveItem($matches[2]).'';
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) drastically rose!$/', $line, $matches))
		{
			$out[] = '  r-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) sharply rose!$/', $line, $matches))
		{
			if ($lastmove === 'TailGlow')
			{
				$out[] = '  r-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 3';
			}
			else
			{
				$out[] = '  r-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 2';
			}
		}
		else if (preg_match('/^([^<>]+)\'s ([a-zA-Z .]+) rose!$/', $line, $matches))
		{
			$out[] = '  r-boost '.resolvePokemon($matches[1]).' '.resolveStat($matches[2]).' 1';
		}
		else if (preg_match('/^\<([^<>]+) stockpiled ([1-3])!\>$/', $line, $matches))
		{
			$out[] = '  r-volatile '.resolvePokemon($matches[1]).' stockpile'.$matches[2];
		}
		else if (preg_match('/^\<([^<>]+)\'s perish count fell to ([0-3]).\>$/', $line, $matches))
		{
			$out[] = '  r-volatile '.resolvePokemon($matches[1]).' perish'.$matches[2];
			if ($matches[2] === '0') markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+) intimidates ([^<>]+)!$/', $line, $matches))
		{
			$out[] = '  r-intimidate '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		}
		else if (preg_match('/^\<([^<>]+) moved its status onto ([^<>]+)!\>$/', $line, $matches))
		{
			$out[] = '  r-psycho-shift '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
		}
		else if (preg_match('/^\<([^<>]+) took ([^<>]+) down with it!\>$/', $line, $matches))
		{
			$out[] = '  r-also-ko '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]);
			markLastDamage($out);
		}
		else if (preg_match('/^\<The poison spikes disappeared around ([^<>]+)\'s feet!\>$/', $line, $matches))
		{
			$out[] = '  r-absorb-spikes '.resolvePokemon($matches[1]).' ToxicSpikes';
		}
		else if (preg_match('/^\<([^<>]+) lost some HP because of Solar Power!\>$/', $line, $matches))
		{
			$out[] = 'residual '.resolvePokemon($matches[1]).' ability-damage SolarPower ??';
			markLastDamage($out);
		}
		else if (preg_match('/^\<([^<>]+)\'s ([A-Z][a-z]+) Absorb absorbs the attack!\>$/', $line, $matches))
		{
			$out[] = '  r-ability-heal '.resolvePokemon($matches[1]).' '.$matches[2].'Absorb ??';
		}
		else if (preg_match('/^\<([^<>]+)\'s ([A-Z][a-z]+) Absorb made the attack useless!\>$/', $line, $matches))
		{
			$out[] = '  r-ability-heal '.resolvePokemon($matches[1]).' '.$matches[2].'Absorb ??';
		}
		else if (preg_match('/^([^<>]+)\'s Iron Barbs hurts ([^<>]+)$/', $line, $matches))
		{
			$out[] = '  r-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' IronBarbs ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+)\'s Rough Skin hurts ([^<>]+)$/', $line, $matches))
		{
			$out[] = '  r-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' RoughSkin ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		}
		else if (preg_match('/^([^<>]+)\'s Aftermath damages ([^<>]+)!$/', $line, $matches))
		{
			$out[] = '  r-ability-damage '.resolvePokemon($matches[1]).' '.resolvePokemon($matches[2]).' Aftermath ??';
			resolvePokemon($matches[2]);
			markLastDamage($out);
		}
		else if (preg_match('/^\<([^<>]+)\'s ([^<>]+) was bounced back by Magic Mirror!\>$/', $line, $matches))
		{
			$out[] = '  r-bounce-back '.resolvePokemon($matches[1]).' MagicMirror '.resolveMove($matches[2]);
		}
		else if (preg_match('/^\<([^<>]+)\'s ([^<>]+) was bounced back by Magic Coat!\>$/', $line, $matches))
		{
			$out[] = '  r-bounce-back '.resolvePokemon($matches[1]).' MagicCoat '.resolveMove($matches[2]);
		}
		else if (preg_match('/^\<Battle between ([^<>]+) and ([^<>]+) is underway!\>$/', $line, $matches))
		{
			$out[] = 'player '.$matches[1];
			$out[] = 'foe-player '.$matches[2];
			$out[] = 'start';
			$allyname = resolveUsername($matches[1]);
			$playernames = array($matches[1],$matches[2]);
			$english = 'warn';
		}
		else if (preg_match('/^\<Battle between ([^<>]+) and ([^<>]+) started!\>$/', $line, $matches))
		{
			if ($allyname === '' && $convertloopnum === 0)
			{
				$convertNotDone = true;
			}
			else if ($allyname === resolveUsername($matches[1]) || (substr($allyname, 0,6) === 'foeof-' && substr($allyname, 6) === resolveUsername($matches[2])))
			{
				$out[] = 'player '.$matches[1];
				$out[] = 'foe-player '.$matches[2];
				$out[] = 'start';
				$allyname = resolveUsername($matches[1]);
				$playernames = array($matches[1],$matches[2]);
			}
			else
			{
				$out[] = 'player '.$matches[2];
				$out[] = 'foe-player '.$matches[1];
				$out[] = 'start';
				$allyname = resolveUsername($matches[2]);
				$playernames = array($matches[2],$matches[1]);
			}
			$english = true;
		}
		else if (preg_match('/^\<([^<>]+) won the battle!\>$/', $line, $matches))
		{
			$winner = $matches[1];
		}
		else if (preg_match('/^\<Tie between ([^<>]+) and ([^<>]+)!\>$/', $line, $matches))
		{
			$winner = true;
		}
		else if (preg_match('/^Hit ([0-9]) times!$/', $line, $matches))
		{
			$out[] = '  r-hit-count '.$movetarget.' '.$matches[1];
		}
		else
		{
			$out[] = 'unknown-effect '.$newline;
		}
		if ($returnNow)
		{
			return false;
		}
	}
	
	if (!$english)
	{
		$convertNotDone = false;
		if (@$_REQUEST['dev']) echo '"'.implode("\n", $text).'"';
		return array('error Replay file must be an English Pokemon Online replay file.');
	}
	if ($switchcounter === 104)
	{
		return array('error Double battles are not supported (neither are triples, for that matter).');
	}
	if ($switchcounter === 106)
	{
		return array('error Triple battles are not supported (neither are doubles, for that matter).');
	}
	
	if ($winner === true) $out[] = 'tie';
	else if ($winner) $out[] = 'win '.$winner;
	else $out[] = 'premature-end';
	
	foreach ($currentpokemon as $poke)
	{
		$oldlinesoffset++;
		array_unshift($out, 'pokemon '.$poke);
	}
	{
		$oldlinesoffset++;
		array_unshift($out, 'gen '.$GLOBALS['gen']);
	}
	if ($english === 'warn' && $switchcounter !== 102)
	{
		$oldlinesoffset++;
		array_unshift($out, 'warning This is a spectator replay. Crashes may occur since the game may have been joined midway-through.');
	}
	
	return $out;

}


function convertById($name)
{
	global $REPLAYS;
	if (!$REPLAYS[$name])
	{
		return;
	}
	$text = file_get_contents("uploads/$name.html");
	
	$out = pokeConvert($text);
	
	if (substr($out[0],0,6) === 'error ')
	{
		return $out;
	}
	
	$fp = fopen("uploads/$name.js",'w');
	
	fwrite($fp, "var newlog = [\n");
	foreach ($out as $line)
	{
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
	foreach ($out as $line)
	{
		if (startsWith($line, '  r-bounce-back ') && strpos($line, ' MagicCoat '))
			$REPLAYS[$name]['tags'][] = 'Magic Coat';
		if (startsWith($line, '  r-transform '))
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
		
		if ($lsreflect['r'] && $lsreflect['ls'])
		{
			$REPLAYS[$name]['tags'][] = 'Dual Screens';
			$lsreflect = array();
		}
	}
	if (!$REPLAYS[$name]['unidentified']) unset($REPLAYS[$name]['unidentified']);
	persist_save('REPLAYS');
	return $out;
}