<?php

/*

License: GPLv2 or later
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

error_reporting(E_ALL);

include_once '../pokemonshowdown.com/lib/ntbb-session.lib.php';
//include_once 'lib/ntbb-ladder.lib.php';
include_once '../pokemonshowdown.com/config/servers.inc.php';

function getServerHostName($serverid) {
	global $PokemonServers;
	$server = @$PokemonServers[$serverid];
	return $server ? $server['server'] : $serverid;
}

$reqs = array($_REQUEST);
$multiReqs = false;
if (@$_REQUEST['json']) {
	$reqs = json_decode($_REQUEST['json'], true);
	$multiReqs = true;
}

$outPrefix = ']'; // JSON output should not be valid JavaScript
$outArray = array();

foreach ($reqs as $reqData) {

	$reqData = array_merge($_REQUEST, $reqData);
	if (!ctype_alnum(@$reqData['act'])) die('{"error":"invalid action"}');
	$out = array(
		'action' => @$reqData['act']
	);

	switch (@$reqData['act']) {
	case 'login':
		if (!$_POST) die();
		$users->login($reqData['name'], $reqData['pass']);
		unset($curuser['userdata']);
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = !!$curuser;
		$serverhostname = getServerHostName(@$reqData['serverid']);
		if (!$serverhostname) {
			die('Bogus request.');
		}
		if ($curuser && $serverhostname) {
			$out['sessiontoken'] = $users->getSessionToken($serverhostname) . '::' . $serverhostname;
		}
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		$out['assertion'] = $users->getAssertion($curuser['userid'], $serverhostname, null,
			$challengekeyid, $challenge);
		break;
	case 'register':
		$serverhostname = getServerHostName(@$reqData['serverid']);
		if (!$serverhostname) {
			die('Bogus request.');
		}
		$user = array();
		$user['username'] = @$_POST['username'];
		$userid = $users->userid($user['username']);
		if (strlen($userid) < 1) {
			$out['actionerror'] = 'Your username must contain at least one letter or number.';
		} else if (substr($userid, 0, 5) === 'guest') {
			$out['actionerror'] = 'Your username cannot start with \'guest\'.';
		} else if (strlen($user['username']) > 64) {
			$out['actionerror'] = 'Your username must be less than 64 characters long.';
		} else if (strlen(@$_POST['password']) < 5) {
			$out['actionerror'] = 'Your password must be at least 5 characters long.';
		} else if (@$_POST['password'] !== @$_POST['cpassword']) {
			$out['actionerror'] = 'Your passwords do not match.';
		} else if (trim(strtolower(@$_POST['captcha'])) !== 'pikachu') {
			$out['actionerror'] = 'Please answer the anti-spam question given.';
		} else if (($lastregistration = $users->getLastRegistration()) === false) {
			$out['actionerror'] = 'A database error occurred. Please try again.';
		} else if ($lastregistration && (time() - $lastregistration < 60 * 60 * 24)) {
			$out['actionerror'] = 'You can\'t register more than one username per day. Try again in a day.';
		} else if ($user = $users->addUser($user, $_POST['password'])) {
			$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
			$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
			$out['curuser'] = $user;
			$out['assertion'] = $users->getAssertion($user['userid'],
					$serverhostname, $user, $challengekeyid, $challenge);
			$out['actionsuccess'] = true;
			if ($curuser && $serverhostname) {
				$out['sessiontoken'] = $users->getSessionToken($serverhostname) . '::' . $serverhostname;
			}
		} else {
			$out['actionerror'] = 'Your username is already taken.';
		}
		break;
	case 'logout':
		if (!$_POST) die();
		$users->logout();
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = true;
		break;
	case 'getassertion':
		// direct
		$serverhostname = getServerHostName(@$reqData['serverid']);
		if (!$serverhostname) {
			die('Bogus request.');
		}
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		header('Content-type: text/plain; charset=utf-8');
		if (empty($reqData['userid'])) $userid = $curuser['userid'];
		else $userid = $users->userid($reqData['userid']);
		$serverhostname = htmlspecialchars($serverhostname);	// Protect against theoretical IE6 XSS
		die($users->getAssertion($userid, $serverhostname, null, $challengekeyid, $challenge));
		break;
	case 'ladderupdate':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = @$PokemonServers[@$reqData['serverid']];
		
		if (!$server ||
				($users->getIp() !== gethostbyname($server['server'])) ||
				(!empty($server['token']) && ($server['token'] !== md5($reqData['servertoken'])))) {
			$out = 0;
			break;
		}
		
		$ladder = new NTBBLadder($server['id'], $reqData['format']);
		$p1 = $users->getUserData($reqData['p1']);
		$p2 = $users->getUserData($reqData['p2']);
			
		$ladder->updateRating($p1, $p2, floatval($reqData['score']));
		$out['actionsuccess'] = true;
		$out['p1rating'] = $p1['rating'];
		$out['p2rating'] = $p2['rating'];
		unset($out['p1rating']['rpdata']);
		unset($out['p2rating']['rpdata']);
		$outPrefix = '';	// No need for prefix since only usable by server.
		break;
	case 'prepreplay':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = @$PokemonServers[@$reqData['serverid']];
		
		if (!$server ||
				($users->getIp() !== gethostbyname($server['server'])) ||
				(!empty($server['token']) && ($server['token'] !== md5($reqData['servertoken'])))) {
			$out = 0;
			break;
		}
		
		if (@$reqData['serverid'] !== 'showdown') break; // let's not think about other servers yet
		
		$res = $db->query("SELECT * FROM `ntbb_replays` WHERE `id`='".$db->escape($reqData['id'])."','".$db->escape($reqData['loghash'])."'");
		$replay = $db->fetch_assoc($res);
		
		if ($replay && !$replay['loghash']) {
			$out = !!$db->query("UPDATE `ntbb_replays` SET `loghash` = '".$db->escape($reqData['loghash'])."' WHERE `id`='".$db->escape($reqData['id'])."','".$db->escape($reqData['loghash'])."'");
		} else {
			$out = !!$db->query("INSERT INTO `ntbb_replays` (`id`,`loghash`,`p1`,`p2`,`format`,`date`) VALUES ('".$db->escape($reqData['id'])."','".$db->escape($reqData['loghash'])."','".$db->escape($reqData['p1'])."','".$db->escape($reqData['p2'])."','".$db->escape($reqData['format'])."',".time().")");
		}
		$outPrefix = '';	// No need for prefix since only usable by server.
		break;
	case 'uploadreplay':
		function stripNonAscii($str) { return preg_replace('/[^(\x20-\x7F)]+/','', $str); }
		if (!$_POST['id']) die('ID needed');
		$id = $_POST['id'];

		$res = $db->query("SELECT * FROM `ntbb_replays` WHERE `id` = '".$db->escape($id)."'");
		
		$replay = $db->fetch_assoc($res);
		if (!$replay) die('not found');
		if (md5(stripNonAscii($_POST['log'])) !== $replay['loghash']) {
			$_POST['log'] = str_replace("\r",'', $_POST['log']);
			if (md5(stripNonAscii($_POST['log'])) !== $replay['loghash']) {
				die('hash mismatch');
			}
		}

		$db->query("UPDATE `ntbb_replays` SET `log` = '".$db->escape($_POST['log'])."', `loghash` = '' WHERE `id` = '".$db->escape($id)."'");

		die('success');
		break;
	case 'ladderget':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = $PokemonServers[$reqData['serverid']];
		if (!$server) die('');
		
		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $users->getUserData($reqData['user']);
		$ladder->getAllRatings($user);
		header('Content-type: application/json');
		die($outPrefix . json_encode($user['ratings']));
		break;
	case 'ladderformatgetmmr':
	case 'mmr':
		include_once 'lib/ntbb-ladder.lib.php';

		$server = $PokemonServers[$reqData['serverid']];
		if (!$server) die('');

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $users->getUserData($reqData['user']);
		$ladder->getRating($user);
		if (!@$user['rating']) {
			$out = 1500;
		} else {
			$out = ($user['rating']['r']+$user['rating']['rpr'])/2;
		}
		break;
	case 'logcachedindex':
		$logfile = '../pokemonshowdown.com/config/cachelog';
		$clienttimestamp = @$reqData['clienttimestamp'];
		$servertimestamp = @$reqData['servertimestamp'];
		$servertimestampnow = time();
		if ($servertimestampnow - $servertimestamp <= 50) {
			// The user's clock is just wrong; don't log.
			die('');
		}
		// If we get here, the user's clock may actually still just be wrong,
		// but if so, it's not wrong by very much and there's not really any
		// way we can check for that case.

		// date() throws a warning if a timezone is not explicitly set.
		date_default_timezone_set('America/Edmonton');
		$clienttimestampformatted = date('c', $clienttimestamp);
		$servertimestampformatted = date('c', $servertimestamp);
		$servertimestampnowformatted = date('c', $servertimestampnow);
		$lagtimeformatted = date('i:s', $servertimestampnow - $servertimestamp);
		$useragent = @$_SERVER['HTTP_USER_AGENT'];
		$ip = @$_SERVER['REMOTE_ADDR'];
		$clientip = @$_SERVER['HTTP_X_FORWARDED_FOR'];
		file_put_contents($logfile,
			"[$ip ($clientip); $useragent] " .
			"index.php generated at $servertimestampformatted; " .
			"logcachedindex run at $servertimestampnowformatted (client reported time of $clienttimestampformatted); " .
			"lag time of $lagtimeformatted\n",
			FILE_APPEND | LOCK_EX);
		die('');	// No output.
		break;
	default:
		break;
	}

	if ($multiReqs) $outArray[] = $out;
}

// json output
if ($multiReqs) {
	header('Content-type: application/json');
	die($outPrefix . json_encode($outArray));
} else {
	header('Content-type: application/json');
	die($outPrefix . json_encode($out));
}
