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

	function edit($replay) {
		if ($replay['private'] === 3) {
			$replay['private'] = 3;
			$res = $this->db->prepare("UPDATE replays SET private = 3, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
			$res = $this->db->prepare("UPDATE replayplayers SET private = 3, password = NULL WHERE id = ?");
			$res->execute([$replay['id']]);
		} else if ($replay['private'] === 2) {
			$replay['private'] = 1;
			$replay['password'] = NULL;
			$res = $this->db->prepare("UPDATE replays SET private = 1, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
			$res = $this->db->prepare("UPDATE replayplayers SET private = 1, password = NULL WHERE id = ?");
			$res->execute([$replay['id']]);
		} else if ($replay['private']) {
			if (!$replay['password']) $replay['password'] = $this->genPassword();
			$res = $this->db->prepare("UPDATE replays SET private = 1, password = ? WHERE id = ? LIMIT 1");
			$res->execute([$replay['password'], $replay['id']]);
			$res = $this->db->prepare("UPDATE replayplayers SET private = 1, password = ? WHERE id = ?");
			$res->execute([$replay['password'], $replay['id']]);
		} else {
			$res = $this->db->prepare("UPDATE replays SET private = 0, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
			$res = $this->db->prepare("UPDATE replayplayers SET private = 0, password = NULL WHERE id = ?");
			$res->execute([$replay['id']]);
		}
		return;
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

	// Favorites functionality
	function addFavorite($userid, $replayid) {
		if (!$this->db) {
			$this->init();
		}
		if (!$userid || !$replayid) return false;

		$userid = $this->userid($userid);
		$addtime = time();

		try {
			$res = $this->db->prepare("INSERT INTO ntbb_replay_favorites (userid, replayid, addtime) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE addtime = ?");
			$res->execute([$userid, $replayid, $addtime, $addtime]);
			return true;
		} catch (PDOException $e) {
			return false;
		}
	}

	function removeFavorite($userid, $replayid) {
		if (!$this->db) {
			$this->init();
		}
		if (!$userid || !$replayid) return false;

		$userid = $this->userid($userid);

		try {
			$res = $this->db->prepare("DELETE FROM ntbb_replay_favorites WHERE userid = ? AND replayid = ? LIMIT 1");
			$res->execute([$userid, $replayid]);
			return true;
		} catch (PDOException $e) {
			return false;
		}
	}

	function isFavorited($userid, $replayid) {
		if (!$this->db) {
			$this->init();
		}
		if (!$userid || !$replayid) return false;

		$userid = $this->userid($userid);

		try {
			$res = $this->db->prepare("SELECT 1 FROM ntbb_replay_favorites WHERE userid = ? AND replayid = ? LIMIT 1");
			$res->execute([$userid, $replayid]);
			return (bool)$res->fetch();
		} catch (PDOException $e) {
			return false;
		}
	}

	function getFavorites($userid, $viewerUserid = null, $page = 1) {
		if (!$this->db) {
			$this->init();
		}
		if (!$userid) return [];

		$userid = $this->userid($userid);
		$viewerUserid = $viewerUserid ? $this->userid($viewerUserid) : null;
		$isOwner = ($userid === $viewerUserid);

		try {
			// Get favorites with replay data
			$limit = 51; // One extra to check if there's more
			$offset = ($page - 1) * 50;

			if ($isOwner) {
				// Owner sees all their favorites including private ones
				$res = $this->db->prepare("
					SELECT r.id, r.format, r.players, r.uploadtime, r.rating, r.private, r.password, f.addtime
					FROM ntbb_replay_favorites f
					JOIN replays r ON f.replayid = r.id
					WHERE f.userid = ? AND r.private != 3
					ORDER BY f.addtime DESC
					LIMIT ? OFFSET ?
				");
				$res->execute([$userid, $limit, $offset]);
			} else {
				// Others only see public favorites
				$res = $this->db->prepare("
					SELECT r.id, r.format, r.players, r.uploadtime, r.rating, r.private, r.password, f.addtime
					FROM ntbb_replay_favorites f
					JOIN replays r ON f.replayid = r.id
					WHERE f.userid = ? AND r.private = 0
					ORDER BY f.addtime DESC
					LIMIT ? OFFSET ?
				");
				$res->execute([$userid, $limit, $offset]);
			}

			$favorites = [];
			while ($row = $res->fetch()) {
				$row['players'] = explode(',', $row['players']);
				foreach ($row['players'] as &$player) {
					if ($player[0] === '!') $player = substr($player, 1);
				}
				$favorites[] = $row;
			}

			return $favorites;
		} catch (PDOException $e) {
			return [];
		}
	}

	function getFavoritesCount($userid, $viewerUserid = null) {
		if (!$this->db) {
			$this->init();
		}
		if (!$userid) return 0;

		$userid = $this->userid($userid);
		$viewerUserid = $viewerUserid ? $this->userid($viewerUserid) : null;
		$isOwner = ($userid === $viewerUserid);

		try {
			if ($isOwner) {
				$res = $this->db->prepare("
					SELECT COUNT(*) as count
					FROM ntbb_replay_favorites f
					JOIN replays r ON f.replayid = r.id
					WHERE f.userid = ? AND r.private != 3
				");
				$res->execute([$userid]);
			} else {
				$res = $this->db->prepare("
					SELECT COUNT(*) as count
					FROM ntbb_replay_favorites f
					JOIN replays r ON f.replayid = r.id
					WHERE f.userid = ? AND r.private = 0
				");
				$res->execute([$userid]);
			}

			$result = $res->fetch();
			return $result ? (int)$result['count'] : 0;
		} catch (PDOException $e) {
			return 0;
		}
	}
}

$GLOBALS['Replays'] = new Replays($config_replay_database);
