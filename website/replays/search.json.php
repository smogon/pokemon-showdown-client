<?php

$username = @$_REQUEST['user'];
$username2 = @$_REQUEST['user2'];
$format = @$_REQUEST['format'];
$contains = (@$_REQUEST['contains']);
$byRating = isset($_REQUEST['rating']);
$isPrivate = isset($_REQUEST['private']);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../../replays/replays.lib.php';

$username = $Replays->toID($username);
$isPrivateAllowed = false;
if ($isPrivate) {
	header('HTTP/1.1 400 Bad Request');
	die('"ERROR: you cannot access private replays with the public API"');
}

$page = intval($_REQUEST['page'] ?? 0);

$replays = null;
if ($page > 25) {
	die('"ERROR: page limit is 25"');
} else if ($username || $format) {
	$replays = $Replays->search([
		"username" => $username,
		"username2" => $username2,
		"format" => $format,
		"byRating" => $byRating,
		"isPrivate" => $isPrivate,
		"page" => $page
	]);
} else if ($contains) {
	$replays = $Replays->fullSearch($contains, $page);
} else {
	$replays = $Replays->recent();
}

if ($replays) {
	foreach ($replays as &$replay) {
		if ($replay['password'] ?? null) {
			$replay['id'] .= '-' . $replay['password'];
		}
		unset($replay['password']);
	}
}

echo json_encode($replays);
