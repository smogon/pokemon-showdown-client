<?php

/**
 * replay.log.php
 *
 * Serves `[replay].log` and `[replay].json` APIs. The latter is used by
 * replay.pokemonshowdown.com and also the sim's built-in replay viewer;
 * the former is purely an external API.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

require_once 'replays.lib.php';

$replay = null;
$id = $_REQUEST['name'] ?? '';
$password = '';

$fullid = $id;
if (substr($id, -2) === 'pw') {
	$dashpos = strrpos($id, '-');
	$password = substr($id, $dashpos + 1, -2);
	$id = substr($id, 0, $dashpos);
	// die($id . ' ' . $password);
}

// $forcecache = isset($_REQUEST['forcecache8723']);
$forcecache = false;
if ($id) {
	if (file_exists('caches/' . $id . '.inc.php')) {
		include 'caches/' . $id . '.inc.php';
		$replay['formatid'] = '';
		$cached = true;
		$replay['log'] = str_replace("\r","",$replay['log']);
		$replay['players'] = [$replay['p1'], $replay['p2']];
		$matchSuccess = preg_match('/\\n\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
		if ($matchSuccess) $replay['format'] = $matches[1];
		if (@$replay['date']) {
			$replay['uploadtime'] = $replay['date'];
			unset($replay['date']);
		}
	} else {
		require_once 'replays.lib.php';
		if (!$Replays->db && !$forcecache) {
			header('HTTP/1.1 503 Service Unavailable');
			die();
		}
		$replay = $Replays->get($id, $forcecache);
	}
}
if (!$replay) {
	header('HTTP/1.1 404 Not Found');
	die();
}
if ($replay['password'] ?? null) {
	if ($password !== $replay['password']) {
		header('HTTP/1.1 404 Not Found');
		die();
	}
}

$manage = false;
if (!empty($replay['inputlog'])) {
	if (isset($_REQUEST['manage'])) {
		require_once '../lib/ntbb-session.lib.php';
		if (!$users->isLeader()) die("[access denied: not logged in as an admin]");
		$manage = true;
	} else if (!$replay['safe_inputlog']) {
		unset($replay['inputlog']);
		if (isset($_REQUEST['inputlog'])) {
			header('Content-Type: text/plain');
			die("[access denied: not a random battle]\n\nIf you are an admin, you can get this using: https://replay.pokemonshowdown.com/$fullid.inputlog?manage");
		}
	}
}
unset($replay['safe_inputlog']);

if (!$manage) {
	header('Access-Control-Allow-Origin: *');
}

if (isset($_REQUEST['json'])) {
	$matchSuccess = preg_match('/\\n\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
	if ($matchSuccess) $replay['format'] = $matches[1];

	header('Content-Type: application/json');
	die(json_encode($replay));
	die();
}

if (isset($_REQUEST['inputlog'])) {
	header('Content-Type: text/plain');
	die($replay['inputlog'] ?? '[inputlog not found]');
}

header('Content-Type: text/plain');
echo $replay['log'];
