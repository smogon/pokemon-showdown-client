<?php

/* if ((substr($_SERVER['REMOTE_ADDR'],0,11) === '69.164.163.') ||
		(@substr($_SERVER['HTTP_X_FORWARDED_FOR'],0,11) === '69.164.163.')) {
	file_put_contents(dirname(__FILE__).'/log', "blocked: ".var_export($_SERVER, TRUE)."\n\n", FILE_APPEND);
	die('website disabled');
} */

$PokemonServers = array (
  'showdown' => 
  array (
    'name' => 'Smogon University',
    'id' => 'showdown',
    'server' => 'sim.psim.us',
    'port' => 8000,
    'owner' => 'mia',
  ),
);
