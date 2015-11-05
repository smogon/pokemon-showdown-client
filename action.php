<?php

/*

License: GPLv2 or later
  <http://www.gnu.org/licenses/gpl-2.0.html>

*/

error_reporting(E_ALL);

if (@$_GET['act'] === 'dlteam') {
	header("Content-Type: text/plain");
	if (substr(@$_SERVER['HTTP_REFERER'], 0, 32) !== 'https://play.pokemonshowdown.com') {
		// since this is only to support Chrome on HTTPS, we can get away with a very specific referer check
		die("access denied");
	}
	echo base64_decode(@$_GET['team']);
	die();
}

include_once '../pokemonshowdown.com/lib/ntbb-session.lib.php';
include_once '../pokemonshowdown.com/config/servers.inc.php';
include_once 'lib/dispatcher.lib.php';

$dispatcher = new ActionDispatcher(array(
	new DefaultActionHandler(),
	new LadderActionHandler()
));
$dispatcher->executeActions();
