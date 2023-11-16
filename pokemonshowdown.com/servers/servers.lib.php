<?php

include_once __DIR__ . '/../../config/servers.inc.php';
include_once '../../lib/ntbb-session.lib.php';

function saveservers() {
	file_put_contents(__DIR__ . '/../../config/servers.inc.php', '<?php

/* if ((substr($_SERVER[\'REMOTE_ADDR\'],0,11) === \'69.164.163.\') ||
		(@substr($_SERVER[\'HTTP_X_FORWARDED_FOR\'],0,11) === \'69.164.163.\')) {
	file_put_contents(dirname(__FILE__).\'/log\', "blocked: ".var_export($_SERVER, TRUE)."\n\n", FILE_APPEND);
	die(\'website disabled\');
} */

$PokemonServers = '.var_export($GLOBALS['PokemonServers'], true).';
');
}
