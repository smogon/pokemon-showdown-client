<?php

class ActionDispatcher {
	private $reqs;
	private $multiReqs = false;
	private $reqData;
	private $outPrefix = ']'; // JSON output should not be valid JavaScript
	private $outArray = array();

	public function __construct($handlers) {
		$this->handlers = $handlers;
		$this->reqs = array($_REQUEST);
		if (@$_REQUEST['json']) {
			$this->reqs = json_decode($_REQUEST['json'], true);
			$this->multiReqs = true;
		}
	}

	public function setPrefix($prefix) {
		$this->outPrefix = $prefix;
	}

	public function getServerHostName($serverid) {
		global $PokemonServers;
		$server = @$PokemonServers[$serverid];
		return $server ? $server['server'] : $serverid;
	}

	public function verifyCrossDomainRequest() {
		global $psconfig;
		// No cross-domain multi-requests for security reasons.
		// No need to do anything if this isn't a cross-domain request.
		if ($this->multiReqs || !isset($_SERVER['HTTP_ORIGIN'])) {
			return '';
		}

		$origin = $_SERVER['HTTP_ORIGIN'];
		$prefix = null;
		foreach ($psconfig['cors'] as $i => &$j) {
			if (!preg_match($i, $origin)) continue;
			$prefix = $j;
			break;
		}
		if ($prefix === null) {
			// Bogus request.
			return '';
		}

		// Valid CORS request.
		header('Access-Control-Allow-Origin: ' . $origin);
		header('Access-Control-Allow-Credentials: true');
		return $prefix;
	}

	public function getIp() {
		global $users;
		return $users->getIp();
	}

	public function findServer() {
		global $PokemonServers;

		$serverid = @$this->reqData['serverid'];
		$server = null;
		$ip = $this->getIp();
		if (!isset($PokemonServers[$serverid])) {
			// Try to find the server by source IP, rather than by serverid.
			foreach ($PokemonServers as &$i) {
				if (!isset($i['ipcache'])) {
					$i['ipcache'] = gethostbyname($i['server']);
				}
				if ($i['ipcache'] === $ip) {
					$server =& $i;
					break;
				}
			}
			if (!$server) return null;
		} else {
			$server =& $PokemonServers[$serverid];
			if (empty($server['skipipcheck'])) {
				if (!isset($server['ipcache'])) {
					$server['ipcache'] = gethostbyname($server['server']);
				}
				if ($ip !== $server['ipcache']) return null;
			}
		}
		if (!empty($server['token'])) {
			if ($server['token'] !== md5($this->reqData['servertoken'])) return null;
		}
		return $server;
	}

	public function executeActions() {
		$outArray = null;
		if ($this->multiReqs) $outArray = array();

		foreach ($this->reqs as $this->reqData) {
			$this->reqData = array_merge($_REQUEST, $this->reqData);
			$action = @$this->reqData['act'];
			if (!ctype_alnum($action)) die;
			$out = array();

			foreach ($this->handlers as &$i) {
				if (is_callable(array($i, $action))) {
					$i->$action($this, $this->reqData, $out);
				}
			}

			if ($this->multiReqs) $outArray[] = $out;
		}
		// json output
		if ($this->outPrefix !== '') {
			// Technically this is not JSON because of the initial prefix.
			header('Content-Type: text/plain; charset=utf-8');
		} else {
			header('Content-Type: application/json');
		}
		if ($this->multiReqs) {
			die($this->outPrefix . json_encode($outArray));
		} else {
			die($this->outPrefix . json_encode($out));
		}
	}
}

class DefaultActionHandler {
	public function login($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		if (!$_POST || empty($reqData['name']) || empty($reqData['pass'])) die();
		$users->login($reqData['name'], $reqData['pass']);
		unset($curuser['userdata']);
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = !!$curuser;
		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();
		$out['assertion'] = $users->getAssertion($curuser['userid'], $serverhostname, null,
			$challengekeyid, $challenge, $challengeprefix);
	}

	public function register($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$user = array();
		$user['username'] = @$_POST['username'];
		$userid = $users->userid($user['username']);
		if ((mb_strlen($userid) < 1) || ctype_digit($userid)) {
			$out['actionerror'] = 'Your username must contain at least one letter.';
		} else if (substr($userid, 0, 5) === 'guest') {
			$out['actionerror'] = 'Your username cannot start with \'guest\'.';
		} else if (mb_strlen($user['username']) > 18) {
			$out['actionerror'] = 'Your username must be less than 19 characters long.';
		} else if (mb_strlen(@$_POST['password']) < 5) {
			$out['actionerror'] = 'Your password must be at least 5 characters long.';
		} else if (@$_POST['password'] !== @$_POST['cpassword']) {
			$out['actionerror'] = 'Your passwords do not match.';
		} else if (trim(strtolower(@$_POST['captcha'])) !== 'pikachu') {
			$out['actionerror'] = 'Please answer the anti-spam question given.';
		} else if (($registrationcount = $users->getRecentRegistrationCount()) === false) {
			$out['actionerror'] = 'A database error occurred. Please try again.';
		} else if ($registrationcount >= 2) {
			$out['actionerror'] = 'You can\'t register more than two usernames every two hours. Try again later.';
		} else if ($user = $users->addUser($user, $_POST['password'])) {
			$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
			$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
			$challengeprefix = $dispatcher->verifyCrossDomainRequest();
			$out['curuser'] = $user;
			$out['assertion'] = $users->getAssertion($user['userid'],
					$serverhostname, $user, $challengekeyid, $challenge, $challengeprefix);
			$out['actionsuccess'] = true;
		} else {
			$out['actionerror'] = 'Your username is already taken.';
		}
	}

	public function changepassword($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		if (!$_POST ||
				!isset($reqData['oldpassword']) ||
				!isset($reqData['password']) ||
				!isset($reqData['cpassword'])) {
			$out['actionerror'] = 'Invalid request.';
		} else if (!$curuser['loggedin']) {
			$out['actionerror'] = 'Your session has expired. Please log in again.';
		} else if ($reqData['password'] !== $reqData['cpassword']) {
			$out['actionerror'] = 'Your new passwords do not match.';
		} else if (!$users->passwordVerify($curuser['userid'], $reqData['oldpassword'])) {
			$out['actionerror'] = 'Your old password was incorrect.';
		} else if (mb_strlen($reqData['password']) < 5) {
			$out['actionerror'] = 'Your new password must be at least 5 characters long.';
		} else if (!$users->modifyUser($curuser['userid'], array(
				'password' => $reqData['password']))) {
			$out['actionerror'] = 'A database error occurred. Please try again.';
		} else {
			$out['actionsuccess'] = true;
		}
	}

	public function logout($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		if (!$_POST ||
				!isset($reqData['userid']) ||
				// some CSRF protection (client must know current userid)
				($reqData['userid'] !== $curuser['userid'])) {
			die;
		}
		$users->logout(); // this kills the `sid` cookie
		setcookie('showdown_username', '', time()-60*60*24*2, '/', 'play.pokemonshowdown.com');
		$out['actionsuccess'] = true;
	}

	public function getassertion($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();
		header('Content-Type: text/plain; charset=utf-8');
		if (empty($reqData['userid'])) {
			$userid = $curuser['userid'];
			if ($userid === 'guest') {
				// Special error message for this case.
				die(';');
			}
		} else {
			$userid = $users->userid($reqData['userid']);
		}
		$serverhostname = htmlspecialchars($serverhostname); // Protect against theoretical IE6 XSS
		die($users->getAssertion($userid, $serverhostname, null, $challengekeyid, $challenge, $challengeprefix));
	}

	public function upkeep($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		$out['loggedin'] = $curuser['loggedin'];
		$userid = '';
		if ($curuser['loggedin']) {
			$out['username'] = $curuser['username'];
			$userid = $curuser['userid'];
		} else if (isset($_COOKIE['showdown_username'])) {
			$out['username'] = $_COOKIE['showdown_username'];
			$userid = $users->userid($out['username']);
		}
		if ($userid !== '') {
			$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
			$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
			$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
			$challengeprefix = $dispatcher->verifyCrossDomainRequest();
			$out['assertion'] = $users->getAssertion($userid, $serverhostname, null, $challengekeyid, $challenge, $challengeprefix);
		}
	}

	public function updateuserstats($dispatcher, &$reqData, &$out) {
		global $psdb;

		$server = $dispatcher->findServer();
		if (!$server) {
			$out = 0;
			return;
		}

		$date = @$reqData['date'];
		$usercount = @$reqData['users'];
		if (!is_numeric($date) || !is_numeric($usercount)) {
			$out = 0;
			return;
		}

		$out = !!$psdb->query(
			"INSERT INTO `ntbb_userstats` (`serverid`, `date`, `usercount`) " .
				"VALUES ('" . $psdb->escape($server['id']) . "', '" . $psdb->escape($date) . "', '" . $psdb->escape($usercount) . "') " .
				"ON DUPLICATE KEY UPDATE `date`='" . $psdb->escape($date) . "', `usercount`='" . $psdb->escape($usercount) . "'");

		if ($server['id'] === 'showdown') {
			$psdb->query(
				"INSERT INTO `ntbb_userstatshistory` (`date`, `usercount`) " .
				"VALUES ('" . $psdb->escape($date) . "', '" . $psdb->escape($usercount) . "')");
		}
		$dispatcher->setPrefix(''); // No need for prefix since only usable by server.
	}

	public function prepreplay($dispatcher, &$reqData, &$out) {
		global $psdb;
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php'; // not clear if this is needed

		$server = $dispatcher->findServer();
		if (
				// the server must be registered
				!$server ||
				// the server must send all the required values
				!isset($reqData['id']) ||
				!isset($reqData['format']) ||
				!isset($reqData['loghash']) ||
				!isset($reqData['p1']) ||
				!isset($reqData['p2']) ||
				// player usernames cannot be longer than 18 characters
				(mb_strlen($reqData['p1']) > 18) ||
				(mb_strlen($reqData['p2']) > 18) ||
				// the battle ID must be valid
				!preg_match('/^([a-z0-9]+)-[0-9]+$/', $reqData['id'], $m1) ||
				// the format ID must be valid
				!preg_match('/^([a-z0-9]+)$/', $reqData['format'], $m2) ||
				// the format from the battle ID must match the format ID
				($m1[1] !== $m2[1])) {
			$out = 0;
			return;
		}

		if ($server['id'] !== 'showdown') {
			$reqData['id'] = $server['id'].'-'.$reqData['id'];
		}

		$res = $psdb->query("SELECT * FROM `ntbb_replays` WHERE `id`='".$psdb->escape($reqData['id'])."'");
		$replay = $psdb->fetch_assoc($res);

		if ($replay) {
			// A replay with this ID already exists
			if (time() > $replay['date']+5) {
				// Allow it to be overwritten if it's been 5 seconds already
				$out = !!$psdb->query("UPDATE `ntbb_replays` SET `loghash` = '".$psdb->escape($reqData['loghash'])."' WHERE `id`='".$psdb->escape($reqData['id'])."'");
			}
		} else {
			$out = !!$psdb->query("INSERT INTO `ntbb_replays` (`id`,`loghash`,`p1`,`p2`,`format`,`date`) VALUES ('".$psdb->escape($reqData['id'])."','".$psdb->escape($reqData['loghash'])."','".$psdb->escape($reqData['p1'])."','".$psdb->escape($reqData['p2'])."','".$psdb->escape($reqData['format'])."',".time().")");
		}
		$dispatcher->setPrefix(''); // No need for prefix since only usable by server.
	}

	public function uploadreplay($dispatcher, &$reqData, &$out) {
		global $psdb;

		function stripNonAscii($str) { return preg_replace('/[^(\x20-\x7F)]+/','', $str); }
		header('Content-Type: text/plain; charset=utf-8');
		if (!isset($_POST['id'])) die('ID needed');
		$id = $_POST['id'];

		$res = $psdb->query("SELECT * FROM `ntbb_replays` WHERE `id` = '".$psdb->escape($id)."'");

		$replay = $psdb->fetch_assoc($res);
		if (!$replay) {
			if (!preg_match('/^[a-z0-9]+-[a-z0-9]+-[0-9]+$/', $reqData['id'])) {
				die('invalid id');
			}
			die('not found');
		}
		if (md5(stripNonAscii($_POST['log'])) !== $replay['loghash']) {
			$_POST['log'] = str_replace("\r",'', $_POST['log']);
			if (md5(stripNonAscii($_POST['log'])) !== $replay['loghash']) {
				// Hashes don't match.

				// Someone else tried to upload a replay of the same battle,
				// while we were uploading this
				if ($replay['log']) {
					// A log already exists; good enough
					die('success');
				}
				die('hash mismatch');
			}
		}

		$psdb->query("UPDATE `ntbb_replays` SET `log` = '".$psdb->escape($_POST['log'])."', `loghash` = '' WHERE `id` = '".$psdb->escape($id)."'");

		die('success');
	}

	public function invalidatecss($dispatcher, &$reqData, &$out) {
		$server = $dispatcher->findServer();
		if (!$server) {
			$out = 0;
			return;
		}
		// No need to sanitise $server['id'] because it should be safe already.
		$cssfile = dirname(__FILE__) . '/../../pokemonshowdown.com/config/customcss/' . $server['id'] . '.css';
		@unlink($cssfile);
	}
}

// This class should not depend on ntbb-session.lib.php.
class LadderActionHandler {
	// There's no need to make a database query for this.
	private function getUserData($username) {
		if (!$username) $username = '';
		if (mb_strlen($username) > 18) return false;
		$userid = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		$userid = preg_replace('/[^A-Za-z0-9]+/', '', $userid);
		return array('userid' => $userid, 'username' => $username);
	}

	public function ladderupdate($dispatcher, &$reqData, &$out) {
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php';

		$server = $dispatcher->findServer();
		if (!$server) {
			$out = 0;
			return;
		}

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$p1 = $this->getUserData(@$reqData['p1']);
		$p2 = $this->getUserData(@$reqData['p2']);
		if (!$p1 || !$p2) {
			// The server should not send usernames > 18 characters long.
			$out = 0;
			return;
		}

		$ladder->updateRating($p1, $p2, floatval($reqData['score']));
		$out['actionsuccess'] = true;
		$out['p1rating'] = $p1['rating'];
		$out['p2rating'] = $p2['rating'];
		unset($out['p1rating']['rpdata']);
		unset($out['p2rating']['rpdata']);
		$dispatcher->setPrefix('');	// No need for prefix since only usable by server.
	}

	public function ladderget($dispatcher, &$reqData, &$out) {
		global $PokemonServers;
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php';

		$server = @$PokemonServers[@$reqData['serverid']];
		if (!$server) die;

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $this->getUserData(@$reqData['user']);
		if (!$user) die;
		$ladder->getAllRatings($user);
		$out = $user['ratings'];
	}

	public function mmr($dispatcher, &$reqData, &$out) {
		global $PokemonServers;
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php';

		$server = @$PokemonServers[@$reqData['serverid']];
		if (!$server) die('');

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $this->getUserData(@$reqData['user']);
		$out = 1500;
		if ($user) {
			$ladder->getRating($user);
			if (@$user['rating']) {
				$out = ($user['rating']['r']+$user['rating']['rpr'])/2;
			}
		}
	}
}
