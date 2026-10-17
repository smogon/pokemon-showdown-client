<?php

/**
 * One-time migration: generates config/news.json and config/servers.json from
 * their .inc.php equivalents.
 *
 * From here on, saveNews() in pokemonshowdown.com/news/manage.php and
 * saveservers() in pokemonshowdown.com/servers/servers.lib.php write both
 * formats, so this only needs to be run once (but it's safe to re-run).
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
