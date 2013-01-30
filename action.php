<?php

/*

License: GPLv2 or later
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

error_reporting(E_ALL);

include_once '../pokemonshowdown.com/lib/ntbb-session.lib.php';
//include_once 'lib/ntbb-ladder.lib.php';
include_once '../pokemonshowdown.com/config/servers.inc.php';

$reqs = array($_REQUEST);
$multiReqs = false;
if (@$_REQUEST['json']) {
	$reqs = json_decode($_REQUEST['json'], true);
	$multiReqs = true;
}

$outArray = array();

foreach ($reqs as $reqData) {

	$reqData = array_merge($_REQUEST, $reqData);
	if (!ctype_alnum(@$reqData['act'])) die('{"error":"invalid action"}');
	$out = array(
		'action' => @$reqData['act']
	);

	// if ($_REQUEST['debug']) {
	// 	var_export($reqData);
	// }

	switch (@$reqData['act'])
	{
	case 'login':
		if (!$_POST) die();
		$users->login($reqData['name'], $reqData['pass']);
		unset($curuser['userdata']);
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = !!$curuser;
		if ($curuser && $reqData['servertoken'])
		{
			$out['sessiontoken'] = $users->getSessionToken($reqData['servertoken']) . '::' . $reqData['servertoken'];
		}
		$out['assertion'] = $users->getAssertion($curuser['userid']);
		break;
	case 'register':
		$user = array();
		$user['username'] = @$_POST['username'];
		if (strlen($users->userid($user['username'])) < 1)
		{
			$out['actionerror'] = 'Your username must contain at least one letter or number.';
		}
		else if (strlen($user['username']) > 64)
		{
			$out['actionerror'] = 'Your username must be less than 64 characters long.';
		}
		else if (strlen(@$_POST['password']) < 5)
		{
			$out['actionerror'] = 'Your password must be at least 5 characters long.';
		}
		else if (@$_POST['password'] !== @$_POST['cpassword'])
		{
			$out['actionerror'] = 'Your passwords do not match.';
		}
		else if (trim(strtolower(@$_POST['captcha'])) !== 'pikachu')
		{
			$out['actionerror'] = 'Please answer the anti-spam question given.';
		}
		else if ($user = $users->addUser($user, $_POST['password']))
		{
			$out['curuser'] = $user;
			$out['assertion'] = $users->getAssertion($user['userid'], $user);
			$out['actionsuccess'] = true;
			if ($curuser && @$reqData['servertoken'])
			{
				$out['sessiontoken'] = $users->getSessionToken($reqData['servertoken']) . '::' . $reqData['servertoken'];
			}
		}
		else
		{
			$out['actionerror'] = 'Your username is already taken.';
		}
		break;
	case 'upkeep':
		unset($curuser['userdata']);
		$out['curuser'] = $curuser;
		if (empty($reqData['name'])) $userid = $curuser['userid'];
		else $userid = $users->userid($reqData['name']);
		$out['assertion'] = $users->getAssertion($userid);
		break;
	case 'checklogin':
		// direct
		die(!!$users->getUser($reqData['userid']));
		break;
	case 'logout':
		if (!$_POST) die();
		$users->logout();
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = true;
		break;
	case 'savedata':
		if (!$_POST) die();
		$userdata = $curuser['userdata'];
		$userdata['psclient'] = $reqData['userdata'];
		$out['actionsuccess'] = $users->modifyUser($curuser, array(
			'userdata' => $userdata
		));
		break;
	case 'getsessiontoken':
		// direct
		die($users->getSessionToken($reqData['servertoken']));
		break;
	case 'getassertion':
		// direct
		die($users->getAssertion(@$reqData['userid']));
		break;
	case 'verifysessiontoken':
		// direct
		if (!$users->getUser(@$reqData['userid']))
		{
			// ok
			die('1');
		}
		$user = $users->verifySessionToken(@$reqData['token'], @$reqData['servertoken']);
		if (!$user) die('');
		if ($reqData['userid'] !== $user['userid']) die('');
		$serveruserdata = array(
			'userid' => $user['userid'],
			'username' => $user['username'],
			'group' => $user['group']
	//		'userserverdata' => @$user['userdata']['psserver'][@$reqData['servertoken']]
		);
		header('Content-type: application/json');
		die(json_encode($serveruserdata));
		break;
	case 'ladderupdate':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = @$PokemonServers[@$reqData['serverid']];
		
		//var_export($users->getUserData($reqData['p1']));
		if (!$server || $server['token'] !== md5($reqData['servertoken']))
		{
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
		break;
	case 'prepreplay':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = @$PokemonServers[@$reqData['serverid']];
		
		//var_export($users->getUserData($reqData['p1']));
		if (!$server || $server['token'] !== md5($reqData['servertoken']))
		{
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
	case 'laddertest':
		include_once 'lib/ntbb-ladder.lib.php';
		$ladder = new NTBBLadder('showdown', 'ou');
		
		$p1 = array(
			'rating' => array(
				'r' => 1421.3542787803,
				'rd' => 201.04843020314,
				'sigma' => 0.059994925075002,
				'rptime' => 1341446400,
				'rpdata' => '[{"mu":0.63234332925469,"phi":0.27239037325046,"score":1},{"mu":1.7281504029414,"phi":0.43211783817514,"score":1},{"mu":0.93276078544053,"phi":0.99306537054533,"score":0},{"mu":-0.94051313144882,"phi":1.0099475282243,"score":1},{"mu":0.49643942459207,"phi":0.63523017522292,"score":1},{"mu":-1.0049237021831,"phi":0.3282791830483,"score":1},{"mu":1.5254097274879,"phi":0.87857256772749,"score":1},{"mu":0.66129185860516,"phi":0.8640590602575,"score":1},{"mu":-1.2436148187181,"phi":0.92373199886293,"score":1},{"mu":-0.64874832664816,"phi":0.55764845310102,"score":1},{"mu":-0.63452166982773,"phi":0.34511572273028,"score":1},{"mu":0.1021296183828,"phi":0.36117999082004,"score":1},{"mu":0.67700291340553,"phi":0.5099378019722,"score":1},{"mu":1.4314249415034,"phi":1.1022726006074,"score":1},{"mu":-0.6913699870422,"phi":1.4906684040673,"score":1},{"mu":-2.4139491282718,"phi":1.2766563943912,"score":1},{"mu":-0.54755058352569,"phi":0.19712357739302,"score":1},{"mu":1.6279574026323,"phi":0.20308162425787,"score":1},{"mu":1.6104933690428,"phi":0.20213766903132,"score":0},{"mu":0.81260576720117,"phi":0.14882872092356,"score":1},{"mu":-1.4771949264554,"phi":0.2576259670436,"score":1}]',
			),
		);

		$ladder->update($p1, false, true);

		var_export($p1);
		
		die();

		break;
	case 'ladderget':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = $PokemonServers[$reqData['serverid']];
		if (!$server) die('');
		
		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $users->getUserData($reqData['user']);
		$ladder->getAllRatings($user);
		header('Content-type: application/json');
		die(json_encode($user['ratings']));
		break;
	case 'ladderformatget':
		include_once 'lib/ntbb-ladder.lib.php';

		$server = $PokemonServers[$reqData['serverid']];
		if (!$server) die('');

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $users->getUserData($reqData['user']);
		$ladder->getRating($user);
		if (!@$user['rating']) die();
		unset($user['rating']['serverid']);
		unset($user['rating']['formatid']);
		unset($user['rating']['rpdata']);
		header('Content-type: application/json');
		die(json_encode($user['rating']));
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
	case 'laddertop':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$server = $PokemonServers[$reqData['serverid']];
		
		if (!$server)
		{
			die('');
		}
		
		$ladder = new NTBBLadder($server['id'], $reqData['format']);
		$out = $ladder->getTop();
		break;
	case 'glickotest':
		include_once 'lib/ntbb-ladder.lib.php';
		
		$ladder = new NTBBLadder('test', 'OU');
		
		$p1 = $users->getUser('aeo1');
		$p2 = $users->getUser('aeo2');
		
		$ladder->updateRating($p1, $p2, 1);
		
		var_export($p1);
		die();
		break;
	default:
		break;
	}

	if ($multiReqs) $outArray[] = $out;
}

// json output
if ($multiReqs) {
	header('Content-type: application/json');
	die(json_encode($outArray));
} else {
	header('Content-type: application/json');
	die(json_encode($out));
}
