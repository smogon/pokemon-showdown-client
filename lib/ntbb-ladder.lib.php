<?php

error_reporting(E_ALL);

// An implementation of the Glicko2 rating system.

@include_once dirname(__FILE__).'/../../pokemonshowdown.com/lib/ntbb-database.lib.php';

// connect to the ladder database (if we aren't already connected)
if (empty($ladderdb)) {
	global $ladderdb, $config;
	$ladderdb = new NTBBDatabase($config['ladder_server'],
			$config['ladder_username'],
			$config['ladder_password'],
			$config['ladder_database'],
			$config['ladder_prefix'],
			$config['ladder_charset']);
}

class Glicko2Player {
	public $rating;
	public $rd;
	public $sigma;

	public $mu;
	public $phi;
	public $tau;

	private $pi2 = 9.8696044;

	var $M = array();

	function __construct($rating = 1500, $rd = 350, $volatility = 0.06, $mu = null, $phi = null, $sigma = null, $systemconstant = 0.75) {
		// Step 1
		$this->rating = $rating;
		$this->rd = $rd;
		// volatility
		if (is_null($sigma)) {
			$this->sigma = $volatility;
		} else {
			$this->sigma = $sigma;
		}
		// System Constant
		$this->tau = $systemconstant;

		// Step 2
		// Rating
		if (is_null($mu)) {
			$this->mu = ( $this->rating - 1500 ) / 173.7178;
		} else {
			$this->mu = $mu;
		}
		// Rating Deviation
		if (is_null($phi)) {
			$this->phi = $this->rd / 173.7178;
		} else {
			$this->phi = $phi;
		}
	}

	function AddWin($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(1);
	}

	function AddLoss($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(0);
	}

	function AddDraw($OtherPlayer) {
		$this->M[] = $OtherPlayer->MatchElement(0.5);
	}

	function Update() {
		$Results = $this->AddMatches($this->M);
		$this->rating = $Results['r'];
		$this->rd = $Results['RD'];
		$this->mu = $Results['mu'];
		$this->phi = $Results['phi'];
		$this->sigma = $Results['sigma'];
		$this->M = array();
	}

	function MatchElement($score) {
		return array( 'mu' => $this->mu, 'phi' => $this->phi, 'score' => $score );
	}

	function AddMatches($M) {
		// This is where the Glicko2 rating calculation actually happens

		// Follow along the steps using: http://www.glicko.net/glicko/glicko2.pdf

		if (count($M) == 0) {
			$phi_p = sqrt( ( $this->phi * $this->phi ) + ( $this->sigma * $this->sigma ) );
			return array( 'r' => $this->rating, 'RD' => 173.7178 * $phi_p, 'mu' => $this->mu, 'phi' => $phi_p, 'sigma' => $this->sigma ) ;
		}

		// summation parts of Step 3 & 4 & 7
		$v_sum = 0;
		$delta_sum = 0;
		$mu_p_sum = 0;
		for ($j = 0; $j < count($M); $j++) {
			$E = $this->E( $this->mu, $M[$j]['mu'], $M[$j]['phi'] );
			$g = $this->g( $M[$j]['phi'] );
			$v_sum +=  ( $g * $g * $E * ( 1 - $E ) );

			$delta_sum += $g * ( $M[$j]['score'] - $E );

			$mu_p_sum += $g * ( $M[$j]['score'] - $E );
		}

		// Step 3
		// Estimated variance
		$v = 1.0 / $v_sum;

		// Step 4
		// Estimated improvment in rating
		$delta = $v * $delta_sum;

		// Step 5
		$a = log( $this->sigma * $this->sigma );
		$x_prev = $a;
		$x = $x_prev;
		$tausq = $this->tau * $this->tau;
		$phisq = $this->phi * $this->phi;
		$deltasq = $delta * $delta;
		do {
			$exp_xp = exp( $x_prev );
			$d = $this->phi * $this->phi + $v + $exp_xp;
			$deltadsq = $deltasq / ($d * $d);
			$h1 = -( $x_prev - $a ) / ( $tausq ) - ( 0.5 * $exp_xp / $d ) + ( 0.5 * $exp_xp * $deltadsq );
			$h2 = ( -1.0 / $tausq ) - ( ( 0.5 * $exp_xp ) * ( $phisq + $v ) / ( $d * $d ) ) + ( 0.5 * $deltasq * $exp_xp * ( $phisq + $v - $exp_xp ) / ( $d * $d * $d ) );
			$tmp_x = $x;
			$x = $x_prev - ( $h1 / $h2 );
			$x_prev = $tmp_x;
		} while (abs($x - $x_prev) > 0.1);

		$sigma_p = exp( $x / 2 );

		// Step 6
		$phi_star = sqrt( $phisq + ( $sigma_p * $sigma_p ) );

		// Step 7
		$phi_p = 1.0 / ( sqrt( ( 1.0 / ( $phi_star * $phi_star ) ) + ( 1.0 / $v ) ) );
		// New mu
		$mu_p = $this->mu + $phi_p * $phi_p * $mu_p_sum;

		return array( 'r' => ( 173.7178 * $mu_p ) + 1500, 'RD' => 173.7178 * $phi_p, 'mu' => $mu_p, 'phi' => $phi_p, 'sigma' => $sigma_p );
	}

	function g($phi) {
		return 1.0 / ( sqrt( 1.0 + ( 3.0 * $phi * $phi) / ( $this->pi2 ) ) );
	}

	function E($mu, $mu_j, $phi_j) {
		return 1.0 / ( 1.0 + exp( -$this->g($phi_j) * ( $mu - $mu_j ) ) );
	}
}

class NTBBLadder {
	var $serverid;
	var $formatid;
	var $rplen;

	function __construct($serverid, $formatid) {
		$this->formatid = preg_replace('/[^a-z0-9]+/', '', strtolower($formatid));
		$this->serverid = $serverid;
		$this->rplen = 3*24*60*60;
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
					'rd' => 350,
					'sigma' => 0.06,
					'rpr' => 1500,
					'rprd' => 350,
					'rpsigma' => 0.06,
					'gxe' => 0,
					'rptime' => $rp,
					'rpdata' => '',
					'w' => 0,
					'l' => 0,
					't' => 0,
					'gxe' => 50,
					'acre' => 1000,
					'lacre' => -4000,
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

			$res = $ladderdb->query("SELECT * FROM `{$ladderdb->prefix}ladder` WHERE `formatid` = '{$this->formatid}' AND `serverid` = '{$this->serverid}' ORDER BY `lacre` DESC LIMIT 100");

			while ($row = $ladderdb->fetch_assoc($res)) {
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

	function saveRating($user) {
		global $ladderdb;
		if (!$user['rating']) return false;

		return !!$ladderdb->query("UPDATE `{$ladderdb->prefix}ladder` SET `w`={$user['rating']['w']}, `l`={$user['rating']['l']}, `t`={$user['rating']['t']}, `r`={$user['rating']['r']}, `rd`={$user['rating']['rd']}, `sigma`={$user['rating']['sigma']}, `rptime`={$user['rating']['rptime']}, `rpr`={$user['rating']['rpr']}, `rprd`={$user['rating']['rprd']}, `rpsigma`={$user['rating']['rpsigma']}, `rpdata`='".$ladderdb->escape($user['rating']['rpdata'])."', `gxe`={$user['rating']['gxe']}, `acre`={$user['rating']['acre']}, `lacre`={$user['rating']['lacre']} WHERE `entryid` = {$user['rating']['entryid']} LIMIT 1");
	}

	function getAcre($rating) {
		return $rating->rating - $rating->rd*500/355.13567109546;
	}

	function update(&$user, $newM = false, $force = false) {
		$offset = 0;

		$rp = $this->getrp();
		if ($rp <= $user['rating']['rptime'] && !$newM && !$force) {
			return false;
		}

		$rating = new Glicko2Player($user['rating']['r'], $user['rating']['rd'], $user['rating']['sigma']);
		if ($user['rating']['rpdata']) {
			$rpdata = explode('##',$user['rating']['rpdata']);
			if (count($rpdata) > 1) $offset = floatval($rpdata[1]);
			$rating->M = json_decode($rpdata[0], true);
			//var_export($rating->M);
		}

		if ($rp > $user['rating']['rptime'] || count($rating->M) >= 14) {
			$i=0;
			while ($rp > $user['rating']['rptime'] || count($rating->M) >= 14) {
				$i++;
				if ($i > 1000) break;

				$rating->Update();
				if ($offset) {
					$rating->r += $offset;
					$rating->mu += $offset/173.7178;
					$offset = 0;
				}
				$user['rating']['rptime'] = $this->nextrp($user['rating']['rptime']);
			}
			$user['rating']['r'] = $rating->rating;
			$user['rating']['rd'] = $rating->rd;
			$user['rating']['sigma'] = $rating->sigma;
			$user['rating']['gxe'] = 0;
			if ($user['rating']['rd'] < 100) {
				$user['rating']['gxe'] = 1; //round(100 / (1 + pow(10,((1500 - $user['rating']['r']) * pi() / sqrt(3 * log(10)*log(10) * $user['rating']['rd']*$user['rating']['rd'] + 2500 * (64 * pi()*pi() + 147 * log(10)*log(10)))))));
			}
		}

		if ($newM) {
			// grab oldacre
			{
				$oldM = $rating->M;
				$oldR = $rating->rating;
				$oldRd = $rating->rd;
				$oldSigma = $rating->sigma;
				$rating->Update();

				$user['rating']['oldacre'] = $this->getAcre($rating) + $offset;
				$newOldRd = $rating->rd;

				$rating = new Glicko2Player($oldR, $oldRd, $oldSigma);
				$rating->M = $oldM;
			}

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

		// grab oldrdacre
		if ($newM) {
			$newRd = $rating->rd;
			$rating->rd = $newOldRd;
			$user['rating']['oldrdacre'] = $this->getAcre($rating) + $offset;
			$rating->rd = $newRd;
		}

		$oldrpr = $user['rating']['rpr'];

		$user['rating']['rpr'] = $rating->rating;
		$user['rating']['rprd'] = $rating->rd;
		$user['rating']['rpsigma'] = $rating->sigma;

		$user['rating']['gxe'] = round(100 / (1 + pow(10,((1500 - $rating->rating) * pi() / sqrt(3 * log(10)*log(10) * $rating->rd*$rating->rd + 2500 * (64 * pi()*pi() + 147 * log(10)*log(10)))))), 1);
		$user['rating']['acre'] = $this->getAcre($rating) + $offset;

		if ($newM) {
			// compensate for Glicko2 bug: don't lose rating on win, don't gain rating on lose
			if ($newM['score'] > .9 && $rating->rating < $oldrpr) {
				$delta = $oldrpr - $rating->rating;
				$offset += $delta;
				$user['rating']['acre'] += $delta;
				$user['rating']['rpr'] += $delta;
			}
			if ($newM['score'] < .1 && $rating->rating > $oldrpr) {
				$delta = $oldrpr - $rating->rating;
				$offset += $delta;
				$user['rating']['acre'] += $delta;
				$user['rating']['rpr'] += $delta;
			}

			// minimum +1 ACRE on win, minimum -1 ACRE on loss
			if ($newM['score'] > .9 && $user['rating']['acre'] < $user['rating']['oldacre'] + 1) {
				$user['rating']['acre'] = $user['rating']['oldacre'] + 1;
			}
			if ($newM['score'] < .1 && $user['rating']['acre'] > $user['rating']['oldacre'] - 1) {
				$user['rating']['acre'] = $user['rating']['oldacre'] - 1;
			}
		}
		if ($offset) {
			$user['rating']['rpdata'] .= '##'.$offset;
		}

		$user['rating']['lacre'] = $user['rating']['acre'];
		if ($user['rating']['rprd'] > 100) $user['rating']['lacre'] -= 5000;

		return true;
	}
	function updateRating(&$p1, &$p2, $p1score, $p1M=false, $p2M=false) {
		if (!@$p1['rating']) $this->getRating($p1, true);
		if (!@$p2['rating']) $this->getRating($p2, true);

		if (!$p1M) {
			$p2rating = new Glicko2Player($p2['rating']['rpr'], $p2['rating']['rprd'], $p2['rating']['rpsigma']);
			$p1M = $p2rating->MatchElement($p1score);
		}
		if (!$p2M) {
			$p1rating = new Glicko2Player($p1['rating']['rpr'], $p1['rating']['rprd'], $p1['rating']['rpsigma']);
			$p2M = $p1rating->MatchElement(1 - $p1score);
		}
		$p1M['score'] = $p1score;
		$p2M['score'] = 1 - $p1score;

		$this->update($p1, $p1M);
		$this->update($p2, $p2M);

		$this->saveRating($p1);
		$this->saveRating($p2);
	}
}
