<?php

$host = $_REQUEST['host'] ?? '';
$roomid = $_REQUEST['roomid'] ?? '';

if (!$host) {
	http_response_code(400);
	die('No host specified');
}

$host = preg_replace('/-/', '=', $host);
$host = preg_replace('/\\./', '-', $host);
$host = preg_replace('/:/', '--', $host);
$host = preg_replace('/=/', '---', $host);

header('Location: https://' . $host . '.psim.us/' . $roomid);
