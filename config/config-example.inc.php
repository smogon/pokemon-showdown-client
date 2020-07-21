<?php

mb_internal_encoding('UTF-8');

$routes = json_decode(file_get_contents(__DIR__ . '/routes.json'), true);

$psconfig = [

	'sysops' => ['zarel'],
	'autolock_ip' => [],

// password and SID hashing settings

	'password_cost' => 12,
	'sid_length' => 15,
	'sid_cost' => 4,

// database

	'server' => 'localhost',
	'username' => '',
	'password' => '',
	'database' => '',
	'prefix' => 'ps_',
	'charset' => 'utf8',

// routes
	'routes' => $routes,

// CORS requests

	'cors' => [
		'/^http:\/\/smogon\.com$/' => 'smogon.com_',
		'/^http:\/\/www\.smogon\.com$/' => 'www.smogon.com_',
		'/^http:\/\/logs\.psim\.us$/' => 'logs.psim.us_',
		'/^http:\/\/logs\.psim\.us:8080$/' => 'logs.psim.us_',
		'/^http:\/\/[a-z0-9]+\.psim\.us$/' => '',
		'/^http:\/\/play\.pokemonshowdown\.com$/' => '',
	],

// key signing for SSO

	'privatekeys' => [

1 => '-----BEGIN PRIVATE KEY-----
[insert RSA private key]
-----END PRIVATE KEY-----
',

	]

];
