<?php
// needs to be changed to the absolute path of your servers.php file
include_once $argv[1];

$json = json_encode($PokemonServers, JSON_FORCE_OBJECT);
if ($json === false) print("{}");
else print($json);
