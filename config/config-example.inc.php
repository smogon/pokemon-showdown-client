<?php

$config = array(

	// Location of usergroups.csv
	'usergroups' => '/showdown/config/usergroups.csv',

	// Location of viewable logs
	'logdirectory' => '/showdown/logs/lobby',

	// CORS prefix for login server responses
	'challengeprefix' => 'logs.pokemonshowdown.com_',

	// Database configuration for keeping access logs
        'db_server' => '',
        'db_username' => '',
        'db_password' => '',
        'db_database' => '',
        'db_prefix' => '',

	// The login server public key (keyid=1)
	'loginserverpublickey' =>

'-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2O8mOdl6ELJvx+XufPNk
piAwG6G7dOG61RCly4inBtQ8OgAcotfbq1km1FIZJ4II7IzcmGAwQLoBb9TfpNNi
+rN4shVth15riL4ip6YjKNxH4EFPTgvq5GnPmXdIIDxYnzRd3hIVqsCu6iKNcQm+
e/yyQEd4NRCtNeQEHodkZK/7usZzY9gzePQeS6OclzXaS6G99dNBP3Z6frapEckE
B2TSjcOvFaHWqbMR1Tk+B7ZEFvOXjsjlcL8PByqRErHglIxeujqtjzR46sLq6ofJ
vohoUaig9PjfEfyPgcObzOjUki9QLcRcvqUZGTKmDUTgwjCGY22OlvfYI+qW0hxx
mQIDAQAB
-----END PUBLIC KEY-----
'

);
