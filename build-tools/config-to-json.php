<?php

/**
 * Usage: `php build-tools/config-to-json.php`
 *
 * Converts:
 * - config/news.inc.php -> config/news.json
 * - config/servers.inc.php -> config/servers.json
 *
 * Only needs to be run once.
 */

$configdir = __DIR__ . '/../config';
$jsonflags = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;

if (file_exists("$configdir/news.inc.php")) {
	include "$configdir/news.inc.php";
	file_put_contents("$configdir/news.json", json_encode([
		'latest' => array_values($latestNewsCache),
		'news' => (object)$newsCache,
	], $jsonflags));
	echo "wrote config/news.json\n";
} else {
	echo "config/news.inc.php not found, skipping\n";
}

if (file_exists("$configdir/servers.inc.php")) {
	include "$configdir/servers.inc.php";
	file_put_contents("$configdir/servers.json", json_encode((object)$PokemonServers, $jsonflags));
	echo "wrote config/servers.json\n";
} else {
	echo "config/servers.inc.php not found, skipping\n";
}
