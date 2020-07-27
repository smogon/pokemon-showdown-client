<?php

/*

License: GPLv2 or later
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

error_reporting(E_ALL);

include_once __DIR__ . '/config/config.inc.php';

if (@$_GET['act'] === 'dlteam') {
	header("Content-Type: text/plain; charset=utf-8");
	if (substr(@$_SERVER['HTTP_REFERER'], 0, 32) !== 'https://' . $psconfig['routes']['client']) {
		// since this is only to support Chrome on HTTPS, we can get away with a very specific referer check
		die("access denied");
	}
	echo base64_decode(@$_GET['team']);
	die();
}

if (preg_match('/^http\\:\\/\\/[a-z0-9]+\\.psim\\.us\\//', $_SERVER['HTTP_REFERER'] ?? '')) {
	header("Access-Control-Allow-Origin: *");
} else if ($_POST['sid'] ?? null) {
	header("Access-Control-Allow-Origin: *");
}
// header("X-Debug: " . @$_SERVER['HTTP_REFERER']);

require_once __DIR__ . '/lib/ntbb-session.lib.php';
include_once __DIR__ . '/config/servers.inc.php';
include_once __DIR__ . '/lib/dispatcher.lib.php';

$dispatcher = new ActionDispatcher(array(
	new DefaultActionHandler(),
	new LadderActionHandler()
));
$dispatcher->executeActions();
