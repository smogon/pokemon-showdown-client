<?php

include_once __DIR__ . '/../../lib/servers.lib.php';
include_once '../../lib/ntbb-session.lib.php';

function saveservers() {
	file_put_contents(
		__DIR__ . '/../../config/servers.json',
		json_encode((object)$GLOBALS['PokemonServers'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
	);
}
