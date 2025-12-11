<?php

/**
 * API endpoint to check if a replay is favorited
 *
 * @license AGPLv3
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../../lib/ntbb-session.lib.php';
require_once __DIR__ . '/../../replays.lib.php';

if (!$curuser['loggedin']) {
	echo json_encode(['favorited' => false]);
	exit;
}

$replayid = $_GET['replayid'] ?? '';

if (!$replayid) {
	echo json_encode(['error' => 'Missing replayid']);
	exit;
}

$isFavorited = $Replays->isFavorited($curuser['userid'], $replayid);

echo json_encode(['favorited' => $isFavorited, 'replayid' => $replayid]);
