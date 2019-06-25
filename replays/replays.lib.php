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

		$res = $this->db->prepare("UPDATE ps_replays SET views = views + 1 WHERE id = ? LIMIT 1");
		$res->execute([$id]);

		return $replay;
	}
	function edit($replay) {
		$res = $this->db->prepare("UPDATE ps_replays SET private = ? WHERE id = ? LIMIT 1");
		$res->execute([$replay['private'], $replay['id']]);
		return;
	}

	function toID($name) {
		if (!$name) $name = '';
		$name = strtr($name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^a-z0-9]+/','',$name);
	}

	function search($term, $page = 0, $isPrivate) {
		if (!$this->db) return [];
		if ($page > 100) return [];

		$limit1 = intval(50*($page-1));
		if ($limit1 < 0) $limit1 = 0;
		$term = $this->toID($term);
		$isPrivate = $isPrivate ? 1 : 0;
		// $res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2 FROM ps_replays WHERE private = 0 AND (p1id = ? OR p2id = ?) ORDER BY uploadtime DESC LIMIT ?, 51");
		$res = $this->db->prepare("(SELECT uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (p1) WHERE private = ? AND p1id = ? ORDER BY uploadtime DESC) UNION (SELECT uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (p2) WHERE private = ? AND p2id = ? ORDER BY uploadtime DESC) ORDER BY uploadtime DESC LIMIT ?, 51;");
		$res->execute([$isPrivate, $term, $isPrivate, $term, $limit1]);

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
			$res = $this->db->prepare("SELECT /*+ MAX_EXECUTION_TIME(10000) */ uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (recent) WHERE private = 0 AND log LIKE ? ORDER BY uploadtime DESC LIMIT 10;");
			$res->execute($patterns);
			break;
		case 2:
			$res = $this->db->prepare("SELECT /*+ MAX_EXECUTION_TIME(10000) */ uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (recent) WHERE private = 0 AND log LIKE ? AND log LIKE ? ORDER BY uploadtime DESC LIMIT 10;");
			$res->execute($patterns);
			break;
		default;
			return [];
		}

		return $res->fetchAll();
	}

	function searchFormat($term, $page = 0, $byRating = false) {
		if (!$this->db) return [];
		if ($page > 100) return [];

		$limit1 = intval(50*($page-1));
		if ($limit1 < 0) $limit1 = 0;
		$term = $this->toID($term);
		$res = null;
		if ($byRating) {
			$res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2, rating FROM ps_replays FORCE INDEX (top) WHERE private = 0 AND formatid = ? ORDER BY rating DESC LIMIT ?, 51");
		} else {
			$res = $this->db->prepare("SELECT uploadtime, id, format, p1, p2 FROM ps_replays FORCE INDEX (format) WHERE private = 0 AND formatid = ? ORDER BY uploadtime DESC LIMIT ?, 51");
		}
		$res->execute([$term, $limit1]);

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

		$replay = $res->fetch();
		if (!$replay) {
			$res = $this->db->prepare("SELECT id FROM ps_replays WHERE id = ?");
			$res->execute([$id]);
			if ($res->fetch()) {
				// Someone else uploaded a replay while we were trying to upload it
				return 'success';
			}
			if (!preg_match('/^[a-z0-9]+-[a-z0-9]+-[0-9]+$/', $id)) {
				return 'invalid id';
			}
			return 'not found';
		}
		if (md5($this->stripNonAscii($reqData['log'])) !== $replay['loghash']) {
			$reqData['log'] = str_replace("\r",'', $reqData['log']);
			if (md5($this->stripNonAscii($reqData['log'])) !== $replay['loghash']) {
				// Hashes don't match.

				// Someone else tried to upload a replay of the same battle,
				// while we were uploading this
				// ...pretend it was a success
				return 'success';
			}
		}

		$p1id = $this->toID($replay['p1']);
		$p2id = $this->toID($replay['p2']);
		$formatid = $this->toID($replay['format']);

		$res = $this->db->prepare("INSERT INTO ps_replays (id, p1, p2, format, p1id, p2id, formatid, uploadtime, private, rating, log, inputlog) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE log = ?, inputlog = ?, rating = ?");
		$res->execute([$id, $replay['p1'], $replay['p2'], $replay['format'], $p1id, $p2id, $formatid, $replay['uploadtime'], $replay['private'], $replay['rating'], $reqData['log'], $replay['inputlog'], $reqData['log'], $replay['inputlog'], $replay['rating']]);

		$res = $this->db->prepare("DELETE FROM ps_prepreplays WHERE id = ? AND loghash = ?");
		$res->execute([$id, $replay['loghash']]);

		return 'success';
	}

	function userid($username) {
		if (!$username) $username = '';
		$username = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
		return preg_replace('/[^A-Za-z0-9]+/','',$username);
	}
}

$GLOBALS['Replays'] = new Replays($config_replay_database);
