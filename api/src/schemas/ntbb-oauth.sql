CREATE TABLE `ntbb_oauth_clients` (
	owner varchar(18) NOT NULL,
	client_title varchar(40) NOT NULL,
	origin_url varchar(100) NOT NULL,
	id varchar(32) NOT NULL PRIMARY KEY
);

CREATE TABLE `ntbb_oauth_tokens` (
	owner varchar(18) NOT NULL,
	client varchar(32) NOT NULL,
	id varchar(32) NOT NULL PRIMARY KEY,
	time BIGINT(20) NOT NULL
);
