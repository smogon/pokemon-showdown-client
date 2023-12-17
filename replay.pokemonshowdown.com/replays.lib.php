<?php

require __DIR__.'/../config/replay-config.inc.php';

class Replays {
	var $db;
	var $offlineReason;
	var $config;

	function __construct($config_replay_database) {
		$this->config = $config_replay_database;
		// $this->offlineReason = "Sorry, we're experiencing technical difficulties! Check back later!";
		$this->init();
	}

	function init() {
		if ($this->offlineReason) return;
		if ($this->db) return;
		try {
			if (@$this->config['connection_string']) {
				$this->db = new PDO($this->config['connection_string']);
			} else {
				$this->db = new PDO(
					''.($this->config['driver'] ?? 'mysql').':dbname='.$this->config['database'].
					';host='.$this->config['server'].
					(@$this->config['port'] ? (';port='.$this->config['port']) : '').
					(@$this->config['sslmode'] ? (';sslmode='.$this->config['sslmode']) : '').
					(@$this->config['charset'] ? (';charset='.$this->config['charset']) : ''),
					$this->config['username'],
					$this->config['password']
				);
			}
		} catch (PDOException $e) {
			// this error message contains the database password for some reason :|
			header('HTTP/1.1 503 Service Unavailable');
			// die($e);
			die("Database overloaded, please try again later");
		}
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
		$this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
	}

	function genPassword() {
		$alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
		$password = '';
		for ($i = 0; $i < 31; $i++) {
			$password .= $alphabet[mt_rand(0, 35)];
		}
		return $password;
	}

	function get($id, $force = false) {
		if (!$this->db) {
			// if (!$force) return false;
			$this->init();
		}

		$res = $this->db->prepare("SELECT * FROM replays WHERE id = ? LIMIT 1");
		$res->execute([$id]);
		if (!$res) return [];
		$replay = $res->fetch();
		if (!$replay) return $replay;
		$replay['players'] = explode(',', $replay['players']);
		foreach ($replay['players'] as &$player) {
			if ($player[0] === '!') $player = substr($player, 1);
		}

		$res = $this->db->prepare("UPDATE replays SET views = views + 1 WHERE id = ? LIMIT 1");
		$res->execute([$id]);

		$replay['safe_inputlog'] = (
			str_ends_with($replay['formatid'], 'randombattle') ||
			str_ends_with($replay['formatid'], 'randomdoublesbattle') ||
			str_ends_with($replay['formatid'], 'challengecup') ||
			str_ends_with($replay['formatid'], 'challengecup1v1') ||
			str_ends_with($replay['formatid'], 'battlefactory') ||
			str_ends_with($replay['formatid'], 'bssfactory') ||
			str_ends_with($replay['formatid'], 'hackmonscup')
		);

		return $replay;
	}
	function exists($id, $forcecache = false) {
		if ($forcecache) return null;

		if (!$this->db) {
			$this->init();
		}

		$res = $this->db->prepare("SELECT id, password FROM replays WHERE id = ? LIMIT 1");
		$res->execute([$id]);
		if (!$res) return null;
		$replay = $res->fetch();
		if (!$replay) return null;

		return $replay;
	}

	function toID($name) {
		if (!$name) $name = '';
		$name = strtr($name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^a-z0-9]+/','',$name);
	}

	function stripNonAscii($str) { return preg_replace('/[^(\x20-\x7F)]+/','', $str); }

	function userid($username) {
		if (!$username) $username = '';
		$username = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^A-Za-z0-9]+/','',$username);
	}
}

$GLOBALS['Replays'] = new Replays($config_replay_database);
