<?php

include_once __DIR__ . '/../config/config.inc.php';

class PSDatabase {
	var $db = null;

	var $server = null;
	var $username = null;
	var $password = null;
	var $database = null;
	var $prefix = null;
	var $charset = null;

	function __construct($dbconfig) {
		$this->server = $dbconfig['server'];
		$this->username = $dbconfig['username'];
		$this->password = $dbconfig['password'];
		$this->database = $dbconfig['database'];
		$this->prefix = $dbconfig['prefix'];
		$this->charset = $dbconfig['charset'];
	}

	function connect() {
		if (!$this->db) {
			try {
				$this->db = new PDO(
					"mysql:dbname={$this->database};host={$this->server};charset={$this->charset}",
					$this->username,
					$this->password,
					[PDO::ATTR_PERSISTENT => true]
				);
				$this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
			} catch (PDOException $e) {
				if (strpos($e->getMessage(), '1040') !== false || strpos($e->getMessage(), 'Too many connections') !== false) {
					http_response_code(503);
					header('Content-Type: text/plain');
					die("Database temporarily unavailable due to high load. Please try again in a few minutes.");
				}
				// hide passwords and stuff from stacktrace
				throw new ErrorException($e->getMessage());
			} catch (Exception $e) {
				throw new ErrorException($e->getMessage());
			}
		}
	}
	function query($query, $params=false) {
		$this->connect();
		if ($params) {
			$stmt = $this->db->prepare($query);
			$execution_result = $stmt->execute($params);
			if (!$execution_result) {
				return null;
			}
			return $stmt;
		} else {
			return $this->db->query($query);
		}
	}
	function fetch_assoc($resource) {
		return $resource->fetch(PDO::FETCH_ASSOC);
	}
	function fetch($resource) {
		return $resource->fetch();
	}
	function escape($data) {
		$this->connect();
		$data = $this->db->quote($data);
		return substr($data, 1, -1);
	}
	function error() {
		if ($this->db) {
			return $this->db->errorInfo()[2];
		}
	}
	function insert_id() {
		if ($this->db) {
			return $this->db->lastInsertId();
		}
	}
}

$psdb = new PSDatabase($psconfig);
