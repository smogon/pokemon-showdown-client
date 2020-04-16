<?php

$username = @$_REQUEST['user'];
$format = ($username ? '' : @$_REQUEST['format']);
$contains = (@$_REQUEST['contains']);
$byRating = isset($_REQUEST['rating']);
$isPrivate = isset($_REQUEST['private']);

header('Content-type: application/json');
if (!$isPrivate) header('Access-Control-Allow-Origin: *');

require_once 'replays.lib.php';
include_once '../lib/ntbb-session.lib.php';

$username = $users->userid($username);
$isPrivateAllowed = ($username === $curuser['userid'] || $curuser['userid'] === 'zarel');

$page = intval($_REQUEST['page'] ?? 0);

$replays = null;
if ($page > 25) {
	// no
} else if ($username) {
	if (!$isPrivate || $isPrivateAllowed) {
		$replays = $Replays->search(["username" => $username, "isPrivate" => $isPrivate, "page" => $page]);
	}
} else if ($contains) {
	$replays = $Replays->fullSearch($contains, $page);
} else if ($format) {
	$replays = $Replays->search(["format" => $format, "byRating" => $byRating, "page" => $page]);
} else {
	$replays = $Replays->recent();
}

if ($replays) {
	foreach ($replays as &$replay) {
		if ($replay['password']) {
			$replay['id'] .= '-' . $replay['password'];
		}
		unset($replay['password']);
	}
}

echo json_encode($replays);
