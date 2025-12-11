<?php

/**
 * API endpoint to list a user's favorite replays
 *
 * @license AGPLv3
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../../lib/ntbb-session.lib.php';
require_once __DIR__ . '/../../replays.lib.php';

$userid = $_GET['userid'] ?? '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

if (!$userid) {
	echo json_encode(['error' => 'Missing userid']);
	exit;
}

$viewerUserid = $curuser['loggedin'] ? $curuser['userid'] : null;

// Get favorites
$favorites = $Replays->getFavorites($userid, $viewerUserid, $page);

// Format the response
$result = [];
foreach ($favorites as $favorite) {
	$result[] = [
		'id' => $favorite['id'],
		'format' => $favorite['format'],
		'players' => $favorite['players'],
		'uploadtime' => (int)$favorite['uploadtime'],
		'rating' => isset($favorite['rating']) ? (int)$favorite['rating'] : null,
		'private' => (int)$favorite['private'],
		'password' => $favorite['password'] ?? null,
	];
}

echo ']' . json_encode($result);
