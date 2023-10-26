<?php

$username = @$_REQUEST['user'];
$username2 = @$_REQUEST['user2'];
$format = @$_REQUEST['format'];
$contains = (@$_REQUEST['contains']);
$byRating = isset($_REQUEST['rating']);
$isPrivate = isset($_REQUEST['private']);

header('Content-Type: application/json');

require_once '../../replays/replays.lib.php';
include_once '../../lib/ntbb-session.lib.php';

$username = $users->userid($username);
$isPrivateAllowed = ($username === $curuser['userid'] || $users->isSysop());
if ($isPrivate && !$isPrivateAllowed) {
	header('HTTP/1.1 403 Forbidden');
	die('"ERROR: access denied"');
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

echo ']' . json_encode($replays);
