<?php

include_once __DIR__ . '/../../config/servers.inc.php';

$json = json_encode($PokemonServers, JSON_FORCE_OBJECT);
if ($json === false) print("{}");
else print($json);
