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

	// The login server public key (keyid=2)
	'loginserverpublickey' =>

'-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtFldA2rTCsPgqsp1odoH
9vwhf5+QGIlOJO7STyY73W2+io33cV7tReNuzs75YBkZ3pWoDn2be0eb2UqO8dM3
xN419FdHNORQ897K9ogoeSbLNQwyA7XBN/wpAg9NpNu00wce2zi3/+4M/2H+9vlv
2/POOj1epi6cD5hjVnAuKsuoGaDcByg2EOullPh/00TkEkcyYtaBknZpED0lt/4e
kw16mjHKcbo9uFiw+tu5vv7DXOkfciW+9ApyYbNksC/TbDIvJ2RjzR9G33CPE+8J
+XbS7U1jPvdFragCenz+B3AiGcPZwT66dvHAOYRus/w5ELswOVX/HvHUb/GRrh4b
lXWUDn4KpjqtlwqY4H2oa+h9tEENCk8TBWmv3gzGBM5QcehNsyEi9+1RUAmknqJW
0QOC+kifbjbo/qtlzzlSvtbr4MwghCFe1EfezeNAtqwvICznq8ebsGETyPSqI7fS
bpmVULkKbebSDw6kqDnQso3iLjSX9K9C0rwxwalCs/YzgX9Eq4jdx6yAHd7FNGEx
4iu8qM78c7GKCisygZxF8kd0B7V7a5UOwdlWIlTxJ2dfCnnJBFEt/wDsL54q8KmG
bzOTvRq5uz/tMvs6ycgLVgA9r1xmVU+16lMr2wdSzyG7l3X3q1XyQ/CT5IP4unFs
5HKpG31skxlfXv5a7KW5AfsCAwEAAQ==
-----END PUBLIC KEY-----
'

);
