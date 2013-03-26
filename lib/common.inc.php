<?php

error_reporting(E_ALL);

require_once dirname(__FILE__) . '/../config/config.inc.php';

if (!function_exists('hex2bin')) {
	// hex2bin is >= PHP 5.5.0 but we always need it
	// this version only supports lowercase hex characters
	function hex2bin($hex) {
		$hextable = '0123456789abcdef';
		$len = strlen($hex);
		if (($len % 2) !== 0) return '';
		$bin = '';
		for ($i = 0; $i < $len; $i += 2) {
			$high = strpos($hextable, $hex{$i});
			$low = strpos($hextable, $hex{$i + 1});
			if (($high === false) || ($low === false)) {
				return '';
			}
			$bin .= chr((($high << 4) & 0xf0) | ($low & 0x0f));
		}
		return $bin;
	}
}

function getUserid($username) {
	$username = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
	return preg_replace('/[^A-Za-z0-9]+/', '', $username);
}

function getGroup($username) {
	global $config;

	$userid = getUserid($username);
	$usergroups = file_get_contents($config['usergroups']);
	$lines = explode("\n", $usergroups);
	foreach ($lines as &$i) {
		$parts = explode(',', $i);
		$id = getUserid($parts[0]);
		if ($id !== $userid) continue;
		return trim($parts[1]);
	}
	return ' ';
}

function getLoginInformation() {
	global $user;
	return '<p>You are logged in as ' . htmlentities($user['group'] . $user['userid']) . '.</p>';
}

define('AUTH_NOASSERTION', 0);
define('AUTH_NOSESSION', 1);
define('AUTH_INVALID', 2);
define('AUTH_EXPIRED', 3);
define('AUTH_NOPERMISSION', 4);
define('AUTH_VALID', 5);

function getAuthorization(&$userid, &$authenticated, &$group) {
	global $config;

	if (!isset($_COOKIE['assertion'])) return AUTH_NOASSERTION;
	$signedassertion = $_COOKIE['assertion'];
	if ($signedassertion === ';') return AUTH_NOSESSION;
	$parts = explode(';', $signedassertion);
	if (count($parts) !== 2) return AUTH_INVALID;
	$assertion = $parts[0];
	$hexsignature = $parts[1];
	$publickey = openssl_pkey_get_public($config['loginserverpublickey']);
	if ($publickey === false) {
		echo 'ERROR: Invalid public key.\n';
		die();
	}
	$res = openssl_verify($assertion, hex2bin($hexsignature), $publickey);
	if ($res !== 1) return AUTH_INVALID;
	$token = explode(',', $assertion);
	if ($token[0] !== $config['challengeprefix']) return AUTH_INVALID;
	// Sessions last 15 minutes.
	if ((time() - intval($token[3])) > 15*60) return AUTH_EXPIRED;
	$userid = $token[1];
	$authenticated = ($token[2] !== '1');
	$group = ' ';
	// Unregistered users are not authorised.
	if (!$authenticated) return AUTH_NOPERMISSION;
	$group = getGroup($userid);
	if (!in_array($group, array('@', '&', '~'))) return AUTH_NOPERMISSION;
	return AUTH_VALID;
}

$user = array();
$user['auth'] = getAuthorization(
	$user['userid'],
	$user['authenticated'],
	$user['group']);

if (in_array($user['auth'], array(AUTH_NOASSERTION, AUTH_EXPIRED, AUTH_INVALID))) {
	header('Location: /getassertion.html?' . urlencode($_SERVER['REQUEST_URI']));
	die;
} else if (in_array($user['auth'], array(AUTH_NOSESSION, AUTH_NOPERMISSION))) {
	// expire assertion cookie
	setcookie('assertion', '', time() - 3600, '/');
	die('You don\'t have permission to view this page. Log into Pokemon Showdown with an account of group @, &, or ~, and then come back to this page.');
} else if ($user['auth'] !== AUTH_VALID) {
	die('This should be impossible.');
}
