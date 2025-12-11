<?php

/**
 * API endpoint to add a replay to favorites
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

// Validate replayid format
if (!preg_match('/^[a-z0-9]+-[0-9]+$/', $replayid)) {
	echo json_encode(['error' => 'Invalid replayid format']);
	exit;
}

// Check if replay exists
$replay = $Replays->exists($replayid);
if (!$replay) {
	echo json_encode(['error' => 'Replay not found']);
	exit;
}

// Add to favorites
$success = $Replays->addFavorite($curuser['userid'], $replayid);

if ($success) {
	echo json_encode(['success' => true, 'replayid' => $replayid]);
} else {
	echo json_encode(['error' => 'Failed to add favorite']);
}
