<?php

//debug_print_backtrace();
//die();

include_once dirname(__FILE__).'/../config/config.inc.php';

class NTBBDatabase {
	var $db = null;
	
	var $server = null;
	var $username = null;
	var $password = null;
	var $database = null;
	var $prefix = null;
	var $charset = null;
	//var $queries = array();
	
	function NTBBDatabase($server, $username, $password, $database, $prefix, $charset) {
		$this->server = $server;
		$this->username = $username;
		$this->password = $password;
		$this->database = $database;
		$this->prefix = $prefix;
		$this->charset = $charset;
	}
	
	function connect() {
		if (!$this->db) {
			$this->db = mysqli_connect($this->server, $this->username, $this->password, $this->database);
			if ($this->charset) {
				mysqli_set_charset($this->db, $this->charset);
			}
		}
	}
	function query($query) {
		$this->connect();
		//$this->queries[] = $query;
		return mysqli_query($this->db, $query);
	}
	function fetch_assoc($resource) {
		return mysqli_fetch_assoc($resource);
	}
	function fetch($resource) {
		return mysqli_fetch_assoc($resource);
	}
	function escape($data) {
		$this->connect();
		return mysqli_real_escape_string($this->db, $data);
	}
	function error() {
		if ($this->db) {
			return mysqli_error($this->db);
		}
	}
	function insert_id() {
		if ($this->db) {
			return mysqli_insert_id($this->db);
		}
	}
}

$psdb = new NTBBDatabase($psconfig['server'],
		$psconfig['username'],
		$psconfig['password'],
		$psconfig['database'],
		$psconfig['prefix'],
		$psconfig['charset']);
