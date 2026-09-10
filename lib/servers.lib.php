<?php

$PokemonServers = json_decode(file_get_contents(__DIR__ . '/../config/servers.json'), true) ?? [];
