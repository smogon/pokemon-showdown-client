<?php

require __DIR__.'/replay-config.inc.php';

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
			$this->db = new PDO(
				'mysql:dbname='.$this->config['database'].';host='.$this->config['server'].';charset='.$this->config['charset'],
				$this->config['username'],
				$this->config['password']
			);
		} catch (PDOException $e) {
			// this error message contains the database password for some reason :|
			die("Could not connect");
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

		$res = $this->db->prepare("SELECT * FROM ps_replays WHERE id = ? LIMIT 1");
		$res->execute([$id]);
		if (!$res) return [];
		$replay = $res->fetch();
		if (!$replay) return $replay;
		if ($replay['p1'][0] === '!') $replay['p1'] = substr($replay['p1'], 1);
		if ($replay['p2'][0] === '!') $replay['p2'] = substr($replay['p2'], 1);

		// if ($replay['private'] && !($replay['password'] ?? null)) {
		// 	$replay['password'] = $this->genPassword();
		// 	$res = $this->db->prepare("UPDATE ps_replays SET views = views + 1, `password` = ? WHERE id = ? LIMIT 1");
		// 	$res->execute([$replay['password'], $id]);
		// } else {
			$res = $this->db->prepare("UPDATE ps_replays SET views = views + 1 WHERE id = ? LIMIT 1");
			$res->execute([$id]);
		// }

		$replay['log'] = str_replace("\r","",$replay['log']);
		$matchSuccess = preg_match('/\\n\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
		if ($matchSuccess) $replay['format'] = $matches[1];
		return $replay;
	}
	function exists($id, $forcecache = false) {
		if ($forcecache) return null;

		if (!$this->db) {
			$this->init();
		}

		$res = $this->db->prepare("SELECT id, password FROM ps_replays WHERE id = ? LIMIT 1");
		$res->execute([$id]);
		if (!$res) return null;
		$replay = $res->fetch();
		if (!$replay) return null;

		return $replay;
	}
	function edit(&$replay) {
		if ($replay['private'] === 3) {
			$replay['private'] = 3;
			$res = $this->db->prepare("UPDATE ps_replays SET private = 3, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
		} else if ($replay['private'] === 2) {
			$replay['private'] = 1;
			$replay['password'] = NULL;
			$res = $this->db->prepare("UPDATE ps_replays SET private = 1, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
		} else if ($replay['private']) {
			if (!$replay['password']) $replay['password'] = $this->genPassword();
			$res = $this->db->prepare("UPDATE ps_replays SET private = 1, password = ? WHERE id = ? LIMIT 1");
			$res->execute([$replay['password'], $replay['id']]);
		} else {
			$res = $this->db->prepare("UPDATE ps_replays SET private = 0, password = NULL WHERE id = ? LIMIT 1");
			$res->execute([$replay['id']]);
		}
		return;
	}

	function toID($name) {
		if (!$name) $name = '';
		$name = strtr($name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^a-z0-9]+/','',$name);
	}

	function search($args) {
		$page = $args["page"] ?? 0;

		if (!$this->db) return [];
		if ($page > 100) return [];

		$limit1 = intval(50*($page-1));
		if ($limit1 < 0) $limit1 = 0;

		$isPrivate = ($args["isPrivate"] ?? null) ? 1 : 0;
		$byRating = $args["byRating"] ?? null;

		$format = ($args["format"] ?? null) ? $this->toId($args["format"]) : null;

		if ($args["username"] ?? null) {
			$order = $byRating ? "rating" : "uploadtime";
			$userid = $this->toId($args["username"]);
			if ($args["username2"] ?? null) {
				$userid2 = $this->toId($args["username2"]);
				if ($format) {
					$res = $this->db->prepare("(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? AND format = ? ORDER BY $order DESC) UNION (SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? AND format = ? ORDER BY $order DESC) ORDER BY $order DESC LIMIT $limit1, 51;");
					$res->execute([$isPrivate, $userid, $userid2, $format, $isPrivate, $userid2, $userid, $format]);
				} else {
					$res = $this->db->prepare("(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? ORDER BY $order DESC) UNION (SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND p2id = ? ORDER BY $order DESC) ORDER BY $order DESC LIMIT $limit1, 51;");
					$res->execute([$isPrivate, $userid, $userid2, $isPrivate, $userid2, $userid]);
				}
			} else {
				if ($format) {
					$res = $this->db->prepare("(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? AND format = ? ORDER BY $order DESC) UNION (SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2) WHERE private = ? AND p2id = ? AND format = ? ORDER BY uploadtime DESC) ORDER BY $order DESC LIMIT $limit1, 51;");
					$res->execute([$isPrivate, $userid, $format, $isPrivate, $userid, $format]);
				} else {
					$res = $this->db->prepare("(SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? ORDER BY $order DESC) UNION (SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (p2) WHERE private = ? AND p2id = ? ORDER BY uploadtime DESC) ORDER BY $order DESC LIMIT $limit1, 51;");
					$res->execute([$isPrivate, $userid, $isPrivate, $userid]);
				}
			}
			return $res->fetchAll();
		}

		$res = null;
		if ($byRating) {
			$res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2, rating, password FROM ps_replays FORCE INDEX (top) WHERE private = ? AND formatid = ? ORDER BY rating DESC LIMIT $limit1, 51");
		} else {
			$res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (format) WHERE private = ? AND formatid = ? ORDER BY uploadtime DESC LIMIT $limit1, 51");
		}
		$res->execute([$isPrivate, $format]);

		return $res->fetchAll();
	}

	function fullSearch($term, $page = 0) {
		if (!$this->db) return [];
		if ($page > 0) return [];

		$patterns = [];
		foreach (explode(',', $term) as $subterm) {
			$pattern = '%' . str_replace('_', '\\_', str_replace('%', '\\%', $subterm)) . '%';
			$patterns[] = trim($pattern);
		}

		// $pattern = '%' . str_replace('_', '\\_', str_replace('%', '\\%', $term)) . '%';
		// $res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2 FROM ps_replays WHERE private = 0 AND (p1id = ? OR p2id = ?) ORDER BY uploadtime DESC LIMIT ?, 51");
		// $this->db->query("SET SESSION max_execution_time=5000");
		$res = null;
		switch (count($patterns)) {
		case 1:
			$res = $this->db->prepare("SELECT /*+ MAX_EXECUTION_TIME(10000) */ uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (recent) WHERE private = 0 AND log LIKE ? ORDER BY uploadtime DESC LIMIT 10;");
			$res->execute($patterns);
			break;
		case 2:
			$res = $this->db->prepare("SELECT /*+ MAX_EXECUTION_TIME(10000) */ uploadtime, id, format, p1, p2, password FROM ps_replays FORCE INDEX (recent) WHERE private = 0 AND log LIKE ? AND log LIKE ? ORDER BY uploadtime DESC LIMIT 10;");
			$res->execute($patterns);
			break;
		default;
			return [];
		}

		return $res->fetchAll();
	}

	function recent() {
		if (!$this->db) return [];
		$res = $this->db->query("SELECT uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (recent) WHERE private = 0 ORDER BY uploadtime DESC LIMIT 50");

		return $res->fetchAll();
	}

	function prepUpload(&$reqData) {
		if (!$this->db) return false;
		global $users;

		$id = $reqData['id'];
		$private = (@$reqData['hidden'] ? 1 : 0);
		if (($reqData['hidden'] ?? null) === '2') $private = 2;
		$p1 = $users->wordfilter($reqData['p1']);
		$p2 = $users->wordfilter($reqData['p2']);
		$format = $reqData['format'];
		if ($private) {
			$p1 = '!' . $p1;
			$p2 = '!' . $p2;
		}
		$loghash = $reqData['loghash'];
		$rating = intval(@$reqData['rating']);
		if ($reqData['serverid'] !== 'showdown') $rating = 0;
		$inputlog = null;
		if (@$reqData['inputlog']) $inputlog = $reqData['inputlog'];

		$res = $this->db->prepare("REPLACE INTO ps_prepreplays (id,loghash,p1,p2,format,private,uploadtime,rating,inputlog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
		$out = !!$res->execute([$id, $loghash, $p1, $p2, $format, $private, time(), $rating, $inputlog]);

		// $res = $this->db->prepare("REPLACE INTO ps_prepreplays (id,loghash,p1,p2,format,private,uploadtime,rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
		// $out = !!$res->execute([$id, $loghash, $p1, $p2, $format, $private, time(), $rating]);

		// throw new Exception(var_export($res->errorInfo(), true));

		return $out;
	}

	function stripNonAscii($str) { return preg_replace('/[^(\x20-\x7F)]+/','', $str); }

	function upload(&$reqData) {
		if (!$this->db) return $this->offlineReason ? $this->offlineReason : 'replays are down due to technical difficulties, will be back soon';
		global $users;

		$id = @$reqData['id'];

		if (!$id) return 'ID needed';
		$res = $this->db->prepare("SELECT * FROM ps_prepreplays WHERE id = ?");
		if (!$res->execute([$id])) {
			// throw new Exception($this->db->error);
			return 'database error for ' . $id . ': ' . $res->errorInfo();
		}

		$pReplay = $res->fetch();

		$res = $this->db->prepare("SELECT id, `password`, `private` FROM ps_replays WHERE id = ?");
		$res->execute([$id]);
		$replay = $res->fetch();

		if (!$pReplay) {
			if ($replay) {
				// Someone else uploaded a replay while we were trying to upload it
				if ($replay['password']) $id .= '-' . $replay['password'] . 'pw';
				return 'success:' . $id;
			}
			if (!preg_match('/^[a-z0-9]+-[a-z0-9]+-[0-9]+$/', $id)) {
				return 'invalid id';
			}
			return 'not found';
		}

		$password = null;
		if ($pReplay['private'] && $pReplay['private'] !== 2) {
			if ($replay && $replay['password']) {
				$password = $replay['password'];
			} else if (!($replay && $replay['private'])) {
				$password = $this->genPassword();
			}
		}
		if ($reqData['password'] ?? null) $password = $reqData['password'];

		$fullid = $id;
		if ($password) $fullid .= '-' . $password . 'pw';

		if (md5($this->stripNonAscii($reqData['log'])) !== $pReplay['loghash']) {
			$reqData['log'] = str_replace("\r",'', $reqData['log']);
			if (md5($this->stripNonAscii($reqData['log'])) !== $pReplay['loghash']) {
				// Hashes don't match.

				// Someone else tried to upload a replay of the same battle,
				// while we were uploading this
				// ...pretend it was a success
				return 'success:' . $fullid;
			}
		}

		if ($password && strlen($password) > 31) {
			header("HTTP/1.1 403 Forbidden");
			die('password must be 31 or fewer chars long');
		}

		$p1id = $this->toID($pReplay['p1']);
		$p2id = $this->toID($pReplay['p2']);
		$formatid = $this->toID($pReplay['format']);

		$res = $this->db->prepare("INSERT INTO ps_replays (id, p1, p2, format, p1id, p2id, formatid, uploadtime, private, rating, log, inputlog, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE log = ?, inputlog = ?, rating = ?, private = ?, `password` = ?");
		$res->execute([$id, $pReplay['p1'], $pReplay['p2'], $pReplay['format'], $p1id, $p2id, $formatid, $pReplay['uploadtime'], $pReplay['private'] ? 1 : 0, $pReplay['rating'], $reqData['log'], $pReplay['inputlog'], $password, $reqData['log'], $pReplay['inputlog'], $pReplay['rating'], $pReplay['private'] ? 1 : 0, $password]);

		$res = $this->db->prepare("DELETE FROM ps_prepreplays WHERE id = ? AND loghash = ?");
		$res->execute([$id, $pReplay['loghash']]);

		return 'success:' . $fullid;
	}

	function userid($username) {
		if (!$username) $username = '';
		$username = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^A-Za-z0-9]+/','',$username);
	}
}

$GLOBALS['Replays'] = new Replays($config_replay_database);
