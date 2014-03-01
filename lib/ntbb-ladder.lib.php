<?php

error_reporting(E_ALL);

// An implementation of the Glicko2 rating system.

@include_once dirname(__FILE__).'/../../pokemonshowdown.com/lib/ntbb-database.lib.php';

// connect to the ladder database (if we aren't already connected)
if (empty($ladderdb)) {
	global $ladderdb, $psconfig;
	if (empty($psconfig['ladder_server'])) {
		global $psdb;
		$ladderdb = $psdb;
	} else {
		$ladderdb = new NTBBDatabase($psconfig['ladder_server'],
				$psconfig['ladder_username'],
				$psconfig['ladder_password'],
				$psconfig['ladder_database'],
				$psconfig['ladder_prefix'],
				$psconfig['ladder_charset']);
	}
}

class GlickoPlayer {
	public $rating;
	public $rd;

	private $pi2 = 9.8696044;
	private $RDmax = 130.0;
	private $RDmin = 25.0;
	private $c;
	private $q = 0.00575646273 ;

	var $M = array();

	function __construct($rating = 1500, $rd = 130.0) {
		// Step 1
		$this->rating = $rating;
		$this->rd = $rd;
		$this->c = sqrt(($this->RDmax * $this->RDmax - $this->RDmin * $this->RDmin) / 365.0);
	}

	function addWin($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(1);
	}

	function addLoss($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(0);
	}

	function addDraw($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(0.5);
	}

	function update() {
		$results = $this->AddMatches($this->M);
		$this->rating = $results['R'];
		$this->rd = $results['RD'];
		$this->M = array();
	}

	function matchElement($score) {
		return array('R' => $this->rating, 'RD' => $this->rd, 'score' => $score);
	}

	function addMatches($M) {
		// This is where the Glicko rating calculation actually happens

		// Follow along the steps using: http://www.glicko.net/glicko/glicko.pdf

		if (count($M) == 0) {
			$RD = sqrt(($this->rd * $this->rd) + ($this->c * $this->c));
			return array('R' => $this->rating, 'RD' => $RD);
		}

		$A = 0.0;
		$d2 = 0.0;
		for ($j = 0; $j < count($M); $j++) {
			$E = $this->E($this->rating, $M[$j]['R'], $M[$j]['RD']);
			$g = $this->g($M[$j]['RD']);

			$d2 +=  ($g * $g * $E * (1 - $E));

			$A += $g * ($M[$j]['score'] - $E);
		}

		$d2 = 1.0 / $this->q / $this->q / $d2;

		$RD = 1.0 / sqrt(1.0 / ($this->rd * $this->rd) + 1.0 / $d2);
		$R = $this->rating + $this->q * ($RD * $RD) * $A;


		if ($RD > $this->RDmax) {
			$RD = $this->RDmax;
		}

		if ($RD < $this->RDmin) {
			$RD = $this->RDmin;
		}

		return array('R' => $R, 'RD' => $RD);
	}

	function g($RD) {
		return 1.0 / sqrt(1.0 + 3.0 * $this->q * $this->q * $RD * $RD / $this->pi2) ;
	}

	function E($R, $R_j, $RD_j) {
		return 1.0 / (1.0 + pow(10.0, -$this->g($RD_j) * ($R - $R_j) / 400.0));
	}
}

class NTBBLadder {
	var $serverid;
	var $formatid;
	var $rplen;

	function __construct($serverid, $formatid) {
		$this->formatid = preg_replace('/[^a-z0-9]+/', '', strtolower($formatid));
		$this->serverid = preg_replace('/[^a-z0-9]+/', '', strtolower($serverid));
		$this->rplen = 24*60*60;
	}

	function getrp() {
		$rpnum = intval(time() / $this->rplen);
		return $rpnum * $this->rplen;
	}
	function nextrp($rp) {
		$rpnum = intval($rp / $this->rplen);
		return ($rpnum+1) * $this->rplen;
	}

	function getRating(&$user, $create=false) {
		global $ladderdb;
		if (!@$user['rating']) {
			$res = $ladderdb->query("SELECT * FROM `{$ladderdb->prefix}ladder` WHERE `serverid` = '{$this->serverid}' AND `formatid` = '{$this->formatid}' AND `userid` = '".$ladderdb->escape($user['userid'])."' LIMIT 1");
			if (!$res) {
				return false;
			}
			$data = $ladderdb->fetch_assoc($res);

			if (!$data) {
				if (!$create) {
					return false;
				}
				//echo "INSERT INTO `{$ladderdb->prefix}ladder` (`formatid`,`userid`,`username`) VALUES ('{$this->formatid}','".$ladderdb->escape($user['userid'])."','".$ladderdb->escape($user['username'])."')";
				$rp = $this->getrp();
				$ladderdb->query("INSERT INTO `{$ladderdb->prefix}ladder` (`formatid`,`serverid`,`userid`,`username`,`rptime`) VALUES ('{$this->formatid}','{$this->serverid}','".$ladderdb->escape($user['userid'])."','".$ladderdb->escape($user['username'])."',".$rp.")");
				$user['rating'] = array(
					'entryid' => $ladderdb->insert_id(),
					'formatid' => $this->formatid,
					'userid' => $user['userid'],
					'username' => $user['username'],
					'r' => 1500,
					'rd' => 130,
					'sigma' => 0,
					'rpr' => 1500,
					'rprd' => 130,
					'rpsigma' => 0,
					'rptime' => $rp,
					'rpdata' => '',
					'w' => 0,
					'l' => 0,
					't' => 0,
					'gxe' => 50,
					'acre' => 1000,
					'lacre' => 1000,
				);
				return true;
			}

			$user['rating'] = $data;
		}

		return true;
	}
	function getAllRatings(&$user) {
		global $ladderdb;
		if (!@$user['ratings']) {
			$res = $ladderdb->query("SELECT * FROM `{$ladderdb->prefix}ladder` WHERE `serverid` = '{$this->serverid}' AND `userid` = '".$ladderdb->escape($user['userid'])."'");
			if (!$res) {
				return false;
			}
			$user['ratings'] = array();
			while ($row = $ladderdb->fetch_assoc($res)) {
				unset($row['rpdata']);
				$user['ratings'][] = $row;
			}
		}

		return true;
	}

	function getTop() {
		global $ladderdb;
		$needUpdate = true;
		$top = array();

		$i = 0;
		while ($needUpdate) {
			$i++;
			if ($i > 2) break;

			$needUpdate = false;
			$top = array();

			$limit = 500;
			// if (isset($GLOBALS['curuser']) && $GLOBALS['curuser']['group'] != 0) {
			// 	$limit = 1000;
			// }

			$res = $ladderdb->query("SELECT * FROM `{$ladderdb->prefix}ladder` WHERE `formatid` = '{$this->formatid}' AND `serverid` = '{$this->serverid}' ORDER BY `lacre` DESC LIMIT $limit");

			$j = 0;
			while ($row = $ladderdb->fetch_assoc($res)) {
				$j++;
				// if ($row['lacre'] < 0 && $j > 50) break;
				$user = array(
					'username' => $row['username'],
					'userid' => $row['userid'],
					'rating' => $row
				);

				if ($this->update($user)) {
					$this->saveRating($user);
					$needUpdate = true;
				}

				unset($row['rpdata']);
				$top[] = $row;
			}
		}

		return $top;
	}

	function clearAllRatings() {
		global $ladderdb;
		$res = $ladderdb->query("DELETE FROM `{$ladderdb->prefix}ladder` WHERE `formatid` = '{$this->formatid}' AND `serverid` = '{$this->serverid}'");
	}

	function saveRating($user) {
		global $ladderdb;
		if (!$user['rating']) return false;

		return !!$ladderdb->query("UPDATE `{$ladderdb->prefix}ladder` SET `w`={$user['rating']['w']}, `l`={$user['rating']['l']}, `t`={$user['rating']['t']}, `r`={$user['rating']['r']}, `rd`={$user['rating']['rd']}, `sigma`={$user['rating']['sigma']}, `rptime`={$user['rating']['rptime']}, `rpr`={$user['rating']['rpr']}, `rprd`={$user['rating']['rprd']}, `rpsigma`={$user['rating']['rpsigma']}, `rpdata`='".$ladderdb->escape($user['rating']['rpdata'])."', `gxe`={$user['rating']['gxe']}, `acre`={$user['rating']['acre']}, `lacre`={$user['rating']['lacre']} WHERE `entryid` = {$user['rating']['entryid']} LIMIT 1");
	}

	function update(&$user, $newM = false, $newMelo = 1000, $force = false) {
		$offset = 0;

		$rp = $this->getrp();
		if ($rp <= $user['rating']['rptime'] && !$newM && !$force) {
			return false;
		}

		$elo = $user['rating']['acre'];

		$rating = new GlickoPlayer($user['rating']['r'], $user['rating']['rd']);
		if ($user['rating']['rpdata']) {
			$rpdata = explode('##',$user['rating']['rpdata']);
			if (count($rpdata) > 1) $offset = floatval($rpdata[1]);
			$rating->M = json_decode($rpdata[0], true);
			//var_export($rating->M);
		}

		if ($rp > $user['rating']['rptime']) {
			$i=0;
			while ($rp > $user['rating']['rptime']) {
				$i++;
				if ($i > 1000) break;

				// decay
				if ($elo >= 1400) {
					if (count($rating->M)) {
						// user was active
						$elo -= 0 + intval(($elo-1400)/100);
					} else {
						// user was inactive
						$elo -= 1 + intval(($elo-1400)/50);
					}
				}

				$rating->update();
				if ($offset) {
					$rating->rating += $offset;
					$offset = 0;
				}

				$user['rating']['rptime'] = $this->nextrp($user['rating']['rptime']);
			}
			$user['rating']['r'] = $rating->rating;
			$user['rating']['rd'] = $rating->rd;
			$user['rating']['lacre'] = $user['rating']['acre'] = $elo;
		}

		if ($newM) {
			$rating->M[] = $newM;
			if ($newM['score'] > 0.99) {
				$user['rating']['w']++;
			} else if ($newM['score'] < 0.01) {
				$user['rating']['l']++;
			} else {
				$user['rating']['t']++;
			}
		}

		if (count($rating->M)) {
			$user['rating']['rpdata'] = json_encode($rating->M);
		} else {
			$user['rating']['rpdata'] = '';
		}

		$rating->Update();

		$oldrpr = $user['rating']['rpr'];

		$user['rating']['rpr'] = $rating->rating;
		$user['rating']['rprd'] = $rating->rd;

		// $user['rating']['gxe'] = round(100 / (1 + pow(10,((1500 - $rating->rating) * pi() / sqrt(3 * log(10)*log(10) * $rating->rd*$rating->rd + 2500 * (64 * pi()*pi() + 147 * log(10)*log(10)))))), 1);
		$user['rating']['gxe'] = round(100 / (1 + pow(10,((1500 - $rating->rating) / 400 / sqrt(1 + 0.0000100724 * ($rating->rd*$rating->rd + 130*130))))), 1);

		if ($newM) {
			// compensate for Glicko2 bug: don't lose rating on win, don't gain rating on lose
			// if ($newM['score'] > .9 && $rating->rating < $oldrpr) {
			// 	$delta = $oldrpr - $rating->rating;
			// 	$offset += $delta;
			// 	$user['rating']['rpr'] += $delta;
			// }
			// if ($newM['score'] < .1 && $rating->rating > $oldrpr) {
			// 	$delta = $oldrpr - $rating->rating;
			// 	$offset += $delta;
			// 	$user['rating']['rpr'] += $delta;
			// }
		}
		if ($offset) {
			$user['rating']['rpdata'] .= '##'.$offset;
		}

		if ($newM) {
			$user['rating']['oldacre'] = $elo;

			$K = 50;
			if ($elo < 1100) {
				if ($newM['score'] < 0.5) {
					$K = 20 + ($elo - 1000)*30/100;
				} else if ($newM['score'] > 0.5) {
					$K = 80 - ($elo - 1000)*30/100;
				}
			} else if ($elo > 1300) {
				$K = 40;
			} else if ($elo > 1600) {
				$K = 32;
			}

			$E = 1 / (1 + pow(10, ($newMelo - $elo) / 400));
			$elo += $K * ($newM['score'] - $E);

			if ($elo < 1000) $elo = 1000;

			$user['rating']['lacre'] = $user['rating']['acre'] = $elo;
		}

		return true;
	}
	function updateRating(&$p1, &$p2, $p1score, $p1M=false, $p2M=false) {
		if (!@$p1['rating']) $this->getRating($p1, true);
		if (!@$p2['rating']) $this->getRating($p2, true);

		if (!$p1M) {
			$p2rating = new GlickoPlayer($p2['rating']['r'], $p2['rating']['rd']);
			$p1M = $p2rating->MatchElement($p1score);
		}
		if (!$p2M) {
			$p1rating = new GlickoPlayer($p1['rating']['r'], $p1['rating']['rd']);
			$p2M = $p1rating->MatchElement(1 - $p1score);
		}
		$p1M['score'] = $p1score;
		$p2M['score'] = 1 - $p1score;
		$p1Macre = $p2['rating']['acre'];
		$p2Macre = $p1['rating']['acre'];

		$this->update($p1, $p1M, $p1Macre);
		$this->update($p2, $p2M, $p2Macre);

		$this->saveRating($p1);
		$this->saveRating($p2);
	}
}
