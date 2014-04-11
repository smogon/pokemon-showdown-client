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
		global $psdb, $users;
		// include_once dirname(__FILE__) . '/ntbb-ladder.lib.php'; // not clear if this is needed

		$server = $dispatcher->findServer();
		if (!$server) {
			$out['errorip'] = $dispatcher->getIp();
			return;
		}
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

		include_once __DIR__.'/../../replay.pokemonshowdown.com/replays.lib.php';
		$out = $GLOBALS['Replays']->prepUpload($reqData);

		$dispatcher->setPrefix(''); // No need for prefix since only usable by server.
	}

	public function uploadreplay($dispatcher, &$reqData, &$out) {
		global $psdb, $users;

		header('Content-Type: text/plain; charset=utf-8');

		include __DIR__.'/../../replay.pokemonshowdown.com/replays.lib.php';
		die($GLOBALS['Replays']->upload($reqData));
	}

	public function invalidatecss($dispatcher, &$reqData, &$out) {
		$server = $dispatcher->findServer();
		if (!$server) {
			$out['errorip'] = $dispatcher->getIp();
			return;
		}
		// No need to sanitise $server['id'] because it should be safe already.
		$cssfile = dirname(__FILE__) . '/../../pokemonshowdown.com/config/customcss/' . $server['id'] . '.css';
		@unlink($cssfile);
	}

	/**
	 * This function returns all friends of $curuser
	 * Formatting:
	 *   [prefix][username]|[prefix][username]|...
	 *     [prefix] is empty if the request has been accepted, a hash (symbol)
	 *       if a request has been sent by the player and is still pending,
	 *       or a comma if it is a received friend request.
	 *     [username] is the username (yes, NAME, not id) of the player.
	 * Example: Zarel|,haunter|#chaos
	 *   Zarel is already on the friend list, a friend request from haunter is
	 *   still waiting for approval, and a friend request has been sent to
	 *   chaos.
	 */
	public function getfriends($dispatcher, &$reqData, &$out) {
		global $psdb, $curuser;

		// A valid curuser array is needed
		if (!@$curuser['loggedin'] || !@$curuser['userid']) {
			die('Not using a valid nick; you should be registered and logged in in order to add friends.');
		}

		$player = $psdb->escape($curuser['userid']);
		$friends = array();
		$friendsQuery = $psdb->query(
			"SELECT `us`.`username`, `fr`.`p1`, `fr`.`accepted` " .
			"FROM `ntbb_friendlist` AS `fr` " .
			"INNER JOIN `ntbb_users` AS `us` ON `us`.`userid` = IF(`fr`.`p1` = '" . $player . "', `fr`.`p2`, `fr`.`p1`) " .
			"WHERE `p1`='" . $player . "' OR `p2`='" . $player . "'"
		);
		while ($friend = $psdb->fetch_assoc($friendsQuery)) {
			$prefix = '';
			if ((int) $friend['accepted'] === 0) {
				if ($friend['p1'] === $curuser['userid']) {
					// Request sent and pending
					$prefix = '#';
				} else {
					// Received friend request
					$prefix = ',';
				}
			}
			$friends[] = $prefix .  $friend['username'];
		}

		// We add ] here so that we can check in the client if it's a valid
		// response that we've received (i.e. check if there are errors or not)
		die(']' . implode('|', $friends));
	}

	/**
	 * This function does two things:
	 * - sends a friend request if the player is not in his/her friend list yet
	 * - accepts a friend request sent by the player given in the query string
	 */
	public function addfriend($dispatcher, &$reqData, &$out) {
		global $psdb, $users, $curuser;

		// A valid curuser array is needed
		if (!@$curuser['loggedin'] || !@$curuser['userid']) {
			die('Not using a valid nick; you should be registered and logged in in order to add friends.');
		}

		// Check if the other player exists
		$id = $users->userid(@$reqData['player']);
		if (!$id) die('Invalid playername given.');
		$player = $users->getUser($id);
		if (!$player) die('The given player does not exist.');

		// Check if there isn't a friendship between those two already
		$p1 = $psdb->escape($curuser['userid']);
		$p2 = $psdb->escape($player['userid']);
		$res = $psdb->query(
			"SELECT p1, accepted " .
			"FROM `ntbb_friendlist` " .
			"WHERE (" .
				"`p1`='" . $p1 . "' AND `p2`='" . $p2 . "'" .
			") OR (" .
				"`p1`='" . $p2 . "' AND `p2`='" . $p1 . "'" .
			")"
		);
		$record = $psdb->fetch_assoc($res);
		if ($record) {
			// A record in the database exists. Now we check if it's accepted
			// or not. If not, we'll accept it, otherwise send an error
			if ($record['p1'] !== $curuser['userid'] && ((int) $record['accepted']) === 0) {
				$psdb->query("UPDATE `ntbb_friendlist` SET `accepted` = '1' WHERE `p1`='" . $p2 . "' AND `p2`='" . $p1 . "'");
				// The ] denotes that it was successful
				die(']The friend request by ' . $player['username'] . ' has been accepted.');
			} else {
				die('This player is already in your friend list or a friend request is still pending.');
			}
		}

		// Everything's okay, so insert it
		$psdb->query("INSERT INTO `ntbb_friendlist` (`p1`, `p2`) VALUES ('" . $p1 . "', '" . $p2 . "')");
		// The ] denotes that it was successful
		die(']A friend request has been sent to ' . $player['username'] . '!');
	}
	
	/**
	 * This function simply removes the friend given in the query string.
	 */
	public function removefriend($dispatcher, &$reqData, &$out) {
		global $psdb, $users, $curuser;

		// A valid curuser array is needed
		if (!@$curuser['loggedin'] || !@$curuser['userid']) {
			die('Not using a valid nick; you should be registered and logged in in order to add friends.');
		}

		$userid = $psdb->escape($curuser['userid']);
		$player = $psdb->escape($reqData['player']);
		$res = $psdb->query(
			"DELETE FROM `ntbb_friendlist` " .
			"WHERE (" .
				"`p1`='" . $userid . "' AND `p2`='" . $player . "'" .
			") OR (" .
				"`p1`='" . $player . "' AND `p2`='" . $userid . "'" .
			") " .
			"LIMIT 1"
		);
		if (mysqli_affected_rows($psdb->db)) die(']' . $reqData['player'] . ' has been removed from your friend list.');
		die('Could not remove ' . $reqData['player'] . ' from your friend list.');
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
			$out['errorip'] = $dispatcher->getIp();
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

		$server = $dispatcher->findServer();
		if (!$server) {
			$out['errorip'] = $dispatcher->getIp();
			return;
		}

		$ladder = new NTBBLadder($server['id'], @$reqData['format']);
		$user = $this->getUserData(@$reqData['user']);
		$out = 1000;
		if ($user) {
			$ladder->getRating($user);
			if (@$user['rating']) {
				$out = intval($user['rating']['acre']);
			}
		}
	}
}
