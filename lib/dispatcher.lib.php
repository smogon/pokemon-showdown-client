<?php

class ActionDispatcher {
	private $reqs;
	private $multiReqs = false;
	private $reqData;
	/**
	 * API request output should not be valid JavaScript.
	 *
	 * This is to protect against a CSRF-like attack. Imagine you have an API:
	 *
	 *     https://example.com/getmysecrets.json
	 *
	 * Which returns:
	 *
	 *     {"yoursecrets": [1, 2, 3]}
	 *
	 * An attacker could trick a user into visiting a site overriding the
	 * Array or Object constructor, and then containing:
	 *
	 *     <script src="https://example.com/getmysecrets.json"></script>
	 *
	 * This could let them steal the secrets. In modern times, browsers
	 * are protected against this kind of attack, but our `]` adds some
	 * safety for older browsers.
	 *
	 * Adding `]` to the beginning makes sure that the output is a syntax
	 * error in JS, so treating it as a JS file will simply crash and fail.
	 */
	private $outPrefix = ']';
	private $outArray = array();

	public function __construct($handlers) {
		$this->handlers = $handlers;
		if (empty($_REQUEST)) {
			$this->reqs = null;
			if (substr($_SERVER["CONTENT_TYPE"] ?? '', 0, 16) === 'application/json') {
				// screw you too Axios
				// also come on PHP, you could just support JSON natively instead of putting me through this
				$input = trim(file_get_contents('php://input'));
				if ($input[0] === '[') {
					$this->reqs = json_decode($input, true);
				} else if ($input[0] === '{') {
					$this->reqs = [json_decode($input, true)];
				}
			}

			if (empty($this->reqs)) die("no request data found - you need to send some sort of data");
			$_POST['is_post_request'] = true;
		} else {
			$this->reqs = [$_REQUEST];
		}
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
			if ($serverid === 'testtimeout') {
				foreach ($PokemonServers as &$i) {
					gethostbyname($i['server']);
				}
			}
			return null;
		} else {
			$server = & $PokemonServers[$serverid];
			if (empty($server['skipipcheck']) && empty($server['token']) && $serverid !== 'showdown') {
				if (!isset($server['ipcache'])) {
					$server['ipcache'] = gethostbyname($server['server']);
				}
				if ($ip !== $server['ipcache']) return null;
			}
		}
		if (!empty($server['token'])) {
			if ($server['token'] !== md5($this->reqData['servertoken'] ?? '')) return null;
		}
		return $server;
	}

	public function executeActions() {
		$outArray = null;
		if ($this->multiReqs) $outArray = array();

		foreach ($this->reqs as $this->reqData) {
			$this->reqData = array_merge($_REQUEST, $this->reqData);
			if (!isset($this->reqData['act'])) die("action not found - make sure your request data includes act=something");
			$action = $this->reqData['act'];
			if (!ctype_alnum($action)) die("invalid action: " . var_export($action, true));
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
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();

		if (!$_POST) die('for security reasons, logins must happen with POST data');
		if (empty($reqData['name']) || empty($reqData['pass'])) die('incorrect login data, you need "name" and "pass" fields');
		try {
			$users->login($reqData['name'], $reqData['pass']);
		} catch (Exception $e) {
			$out['error'] = $e->getMessage() . "\n" . $e->getFile() . '(' . $e->getLine() . ')' . "\n" . $e->getTraceAsString();
		}
		unset($curuser['userdata']);
		$out['curuser'] = $curuser;
		$out['actionsuccess'] = ($curuser ? $curuser['loggedin'] : false);
		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		if (!$challenge) {
			$challenge = !isset($reqData['challstr']) ? '' : $reqData['challstr'];
		}
		$out['assertion'] = $users->getAssertion($curuser['userid'], $serverhostname, null,
			$challengekeyid, $challenge, $challengeprefix);
	}

	public function register($dispatcher, &$reqData, &$out) {
		global $users, $curuser;
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();

		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$user = [
			'username' => @$_POST['username'],
		];
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
			if (!$challenge) {
				$challenge = !isset($reqData['challstr']) ? '' : $reqData['challstr'];
			}
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

	public function changeusername($dispatcher, &$reqData, &$out) {
		global $users, $curuser;

		if (!$_POST ||
				!isset($reqData['username'])) {
			$out['actionerror'] = 'Invalid request.';
		} else if (!$curuser['loggedin']) {
			$out['actionerror'] = 'Your session has expired. Please log in again.';
		} else if (!$users->modifyUser($curuser['userid'], array(
				'username' => $reqData['username']))) {
			$out['actionerror'] = 'A database error occurred. Please try again.';
		} else {
			$out['actionsuccess'] = true;
		}
	}

	public function logout($dispatcher, &$reqData, &$out) {
		global $users, $curuser, $psconfig;

		if (!$_POST ||
				!isset($reqData['userid']) ||
				// some CSRF protection (client must know current userid)
				($reqData['userid'] !== $curuser['userid'])) {
			die;
		}
		$users->logout(); // this kills the `sid` cookie
		setcookie('showdown_username', '', time()-60*60*24*2, '/', $psconfig['routes']['client']);
		$out['actionsuccess'] = true;
	}

	public function getassertion($dispatcher, &$reqData, &$out) {
		global $users, $curuser;
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();

		$serverhostname = '' . $dispatcher->getServerHostName(@$reqData['serverid']);
		$challengekeyid = !isset($reqData['challengekeyid']) ? -1 : intval($reqData['challengekeyid']);
		$challenge = !isset($reqData['challenge']) ? '' : $reqData['challenge'];
		if (!$challenge) {
			$challenge = !isset($reqData['challstr']) ? '' : $reqData['challstr'];
		}
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
		$challengeprefix = $dispatcher->verifyCrossDomainRequest();

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
			if (!$challenge) {
				$challenge = !isset($reqData['challstr']) ? '' : $reqData['challstr'];
			}
			$out['assertion'] = $users->getAssertion($userid, $serverhostname, null, $challengekeyid, $challenge, $challengeprefix);
		}
	}

	public function loginsearch($dispatcher, &$reqData, &$out) {
		global $psdb;
		$server = $dispatcher->findServer();
		if (!$server || $server['id'] !== 'showdown') {
			$out['actionerror'] = 'access denied';
		} else if (!isset($_REQUEST['search'])) {
			$out['actionerror'] = 'Specify a valid search.';
		} else {
			$search = $psdb->escape($_REQUEST['search']);
			$result = $psdb->query(
				"SELECT `userid`, `ip` FROM `ntbb_users` WHERE `ip` LIKE '" . $search . "%' " .
				"OR `userid` LIKE '%" . $search . "%';"
			);
			$out['result'] = $result->fetchAll();
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

	public function updatenamecolor($dispatcher, &$reqData, &$out) {
		global $psdb, $psconfig, $users;
		$server = $dispatcher->findServer();
		if (!isset($psconfig['mainserver']) || !$server || $server['id'] !== $psconfig['mainserver']) {
			$out['actionerror'] = 'Access denied';
			return;
		}
		if (!isset($reqData['userid']) || !mb_strlen($users->userid($reqData['userid']))) {
			$out['actionerror'] = 'No userid was specified.';
			return;
		}
		$userid = $users->userid($reqData['userid']);
		if (!isset($reqData['source'])) {
			$out['actionerror'] = 'No color adjustment was specified.';
			return;
		}
		if (strlen($userid) > 18) {
			$out['actionerror'] = 'Usernames can only be 18 characters long';
			return;
		}
		if (!isset($reqData['by']) || !mb_strlen($users->userid($reqData['by']))) {
			$out['actionerror'] = 'Specify the action\'s actor.';
			return;
		}
		$colors = array();
		$path = realpath(__DIR__ . '/../config/colors.json');
		try {
			$data = file_get_contents($path, true);
			$colors = json_decode($data, true);
		} catch (Exception $e) {}
		$modlog_entry = '';
		if (!$reqData['source']) {
			if (!isset($colors[$userid])) {
				$out['actionerror'] = (
					'That user does not have a custom color set by the loginserver. ' . 
					'Ask an admin to remove it manually if they have one.'
				);
				return;
			} else {
				unset($colors[$userid]);
				$modlog_entry = 'Username color was removed';
			}
		} else {
			$colors[$userid] = $reqData['source'];
			$modlog_entry = "Username color was set to \"{$reqData['source']}\"";
		}
		file_put_contents($path, json_encode($colors));
		
		$psdb->query(
			"INSERT INTO `{$psdb->prefix}usermodlog`". 
			"(`userid`, `actorid`, `date`, `ip`, `entry`) " .
			"VALUES(?, ?, ?, ?, ?)", 
			[$userid, $users->userid($reqData['by']), time(), $dispatcher->getIp(), $modlog_entry]
		);
		
		$out['success'] = true;
		return $out;
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
		$reqData['serverid'] = $server['id'];

		include_once __DIR__.'/../replays/replays.lib.php';
		$out = $GLOBALS['Replays']->prepUpload($reqData);

		$dispatcher->setPrefix(''); // No need for prefix since only usable by server.
	}

	public function uploadreplay($dispatcher, &$reqData, &$out) {
		global $psdb, $users;

		header('Content-Type: text/plain; charset=utf-8');

		include __DIR__.'/../replays/replays.lib.php';
		die($GLOBALS['Replays']->upload($reqData));
	}

	public function invalidatecss($dispatcher, &$reqData, &$out) {
		$server = $dispatcher->findServer();
		if (!$server) {
			$out['errorip'] = $dispatcher->getIp();
			return;
		}
		// No need to sanitise $server['id'] because it should be safe already.
		$cssfile = __DIR__ . '/../config/customcss/' . $server['id'] . '.css';
		@unlink($cssfile);
	}
}

// This class should not depend on ntbb-session.lib.php.
class LadderActionHandler {
	// There's no need to make a database query for this.
	private function getUserData($username) {
		if (!$username) $username = '';
		$userid = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		$userid = preg_replace('/[^A-Za-z0-9]+/', '', $userid);
		if (mb_strlen($userid) > 18) return false;
		return array('userid' => $userid, 'username' => $username);
	}

	public function ladderupdate($dispatcher, &$reqData, &$out) {
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php';

		$server = $dispatcher->findServer();
		if (!$server || $server['id'] !== 'showdown') {
			$out['errorip'] = "Your version of PS is too old for this ladder system. Please update.";
			return;
		}

		$ladder = new NTBBLadder(@$reqData['format']);
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
		if (!$server || $server['id'] !== 'showdown') {
			die;
		}

		$ladder = new NTBBLadder(@$reqData['format']);
		$user = $this->getUserData(@$reqData['user']);
		if (!$user) die;
		$ladder->getAllRatings($user);
		$out = $user['ratings'];
	}

	public function mmr($dispatcher, &$reqData, &$out) {
		global $PokemonServers;
		include_once dirname(__FILE__) . '/ntbb-ladder.lib.php';

		$server = $dispatcher->findServer();
		if (!$server || $server['id'] !== 'showdown') {
			$out['errorip'] = "Your version of PS is too old for this ladder system. Please update.";
			return;
		}

		$ladder = new NTBBLadder(@$reqData['format']);
		$user = $this->getUserData(@$reqData['user']);
		$out = 1000;
		if ($user) {
			$ladder->getRating($user);
			if (@$user['rating']) {
				$out = intval($user['rating']['elo']);
			}
		}
	}
}
