<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

$manage = false;

// if (@$_REQUEST['name'] === 'smogtours-ou-509') {
// 	header('Content-type: text/plain');
// 	readfile('js/smogtours-ou-509.log');
// 	die();
// }
// if (@$_REQUEST['name'] === 'ou-305002749') {
// 	header('Content-type: text/plain');
// 	readfile('js/ou-305002749.log');
// 	die();
// }

require_once 'replays.lib.php';

$replay = null;
if (@$_REQUEST['name']) {
	$replay = $Replays->get($_REQUEST['name']);
}
if (!$replay) {
	header('HTTP/1.1 404 Not Found');
	die();
}

$replay['log'] = str_replace("\r","",$replay['log']);

if ($replay['inputlog']) {
	if (substr($replay['formatid'], -12) === 'randombattle' || substr($replay['formatid'], -19) === 'randomdoublesbattle' || $replay['formatid'] === 'gen7challengecup' || $replay['formatid'] === 'gen7challengecup1v1' || $replay['formatid'] === 'gen7battlefactory' || $replay['formatid'] === 'gen7bssfactory' || $replay['formatid'] === 'gen7hackmonscup' || $manage) {
		// ok
	} else {
		unset($replay['inputlog']);
	}
}

if (isset($_REQUEST['json'])) {
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	die(json_encode($replay));
	die();
}

header('Content-type: text/plain');
header('Access-Control-Allow-Origin: *');
echo $replay['log'];
