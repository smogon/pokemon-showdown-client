<?php

/**
 * API endpoint to remove a replay from favorites
 *
 * @license AGPLv3
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../../lib/ntbb-session.lib.php';
require_once __DIR__ . '/../../replays.lib.php';

if (!$curuser['loggedin']) {
	echo json_encode(['error' => 'Not logged in']);
	exit;
}

$replayid = $_POST['replayid'] ?? $_GET['replayid'] ?? '';

if (!$replayid) {
	echo json_encode(['error' => 'Missing replayid']);
	exit;
}

// Remove from favorites
$success = $Replays->removeFavorite($curuser['userid'], $replayid);

if ($success) {
	echo json_encode(['success' => true, 'replayid' => $replayid]);
} else {
	echo json_encode(['error' => 'Failed to remove favorite']);
}
