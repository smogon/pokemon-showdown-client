<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

include '../play.pokemonshowdown.com/lib/ntbb-session.lib.php';
include '../play.pokemonshowdown.com/lib/ntbb-ladder.lib.php';
include 'lib/panels.lib.php';

$formatid = '';

if (@$_REQUEST['format']) $formatid = $_REQUEST['format'];

if ($formatid && !ctype_alnum($formatid)) {
	die('denied');
}

$formats = array(
	'gen8randombattle' => 'Random Battle',
	'gen8challengecup1v1' => 'Challenge Cup 1v1',
	'gen8hackmonscup' => 'Hackmons Cup',
	'gen8ou' => 'OverUsed',
	'gen8ubers' => 'Ubers',
	'gen8uu' => 'UnderUsed',
	'gen8ru' => 'RarelyUsed',
	'gen8nu' => 'NeverUsed',
	'gen8pu' => 'PU',
	'gen8lc' => 'Little Cup',
	'gen8monotype' => 'Monotype',
	'gen8anythinggoes' => 'Anything Goes',
	'gen8zu' => 'ZU',
	'gen81v1' => '1v1',
	'gen8battlestadiumsingles' => 'Battle Stadium Singles',
	'gen8randomdoublesbattle' => 'Random Doubles Battle',
	'gen8doublesou' => 'Doubles OU',
	'gen8vgc2020' => 'VGC 2020',
	'gen8balancedhackmons' => 'Balanced Hackmons',
	'gen8mixandmega' => 'Mix and Mega',
	'gen8almostanyability' => 'Almost Any Ability',
	'gen8stabmons' => 'STABmons',
	'gen8nfe' => 'NFE',
	'gen8cap' => 'CAP',
);

$format = $formatid;
if (isset($formats[$formatid])) $format = $formats[$formatid];
$ladder = null;

if (isset($_REQUEST['json'])) {
	header('Content-Type: application/json');
	header('Access-Control-Allow-Origin: *');
	if (!$formatid) die('null');
	$ladder = new NTBBLadder($formatid);
	$toplist = $ladder->getTop();
	foreach ($toplist as &$row) {
		unset($row['formatid']);
		unset($row['entryid']);
		unset($row['col1']);
		$row['w'] = floatval($row['w']);
		$row['l'] = floatval($row['l']);
		$row['t'] = floatval($row['t']);
		$row['gxe'] = floatval($row['gxe']);
		$row['r'] = floatval($row['r']);
		$row['rd'] = floatval($row['rd']);
		$row['sigma'] = floatval($row['sigma']);
		$row['rpr'] = floatval($row['rpr']);
		$row['rprd'] = floatval($row['rprd']);
		$row['rpsigma'] = floatval($row['rpsigma']);
		$row['elo'] = floatval($row['elo']);
	}
	echo json_encode([
		'formatid' => $formatid,
		'format' => $format,
		'toplist' => $toplist,
	]);
	die();
}

if (!$formatid) {
	$panels->setPageTitle('Ladder');
	$panels->setPageDescription('Ladder records from Pokémon Showdown!');
} else {
	$panels->setPageTitle($format.' ladder');
	$panels->setPageDescription('Ladder records from the ' . $format . ' format on Pokémon Showdown!');

	$ladder = new NTBBLadder($formatid);
}
$panels->setTab('ladder');
$panels->start();

if (!$formatid) {
?>
	<div class="pfx-panel"><div class="pfx-body ladderlist">
		<h1>
			Ladders
		</h1>
		<ul class="laddernav">
			<li><a data-target="push" class="button nav-first" href="/ladder/gen8randombattle">Random Battle</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8challengecup1v1">Challenge Cup 1v1</a></li>
			<li><a data-target="push" class="button nav-last" href="/ladder/gen8hackmonscup">Hackmons Cup</a></li>
		</ul>
		<ul class="laddernav">
			<li><a data-target="push" class="button nav-first" href="/ladder/gen8ou">OverUsed</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8ubers">Ubers</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8uu">UnderUsed</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8ru">RarelyUsed</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8nu">NeverUsed</a></li>
			<li><a data-target="push" class="button nav-last" href="/ladder/gen8pu">PU</a></li>
		</ul>
		<ul class="laddernav">
			<li><a data-target="push" class="button nav-first" href="/ladder/gen8lc">Little Cup</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8monotype">Monotype</a></li>
			<!--li><a data-target="push" class="button" href="/ladder/gen8anythinggoes">Anything Goes</a></li-->
			<!--li><a data-target="push" class="button" href="/ladder/gen8zu">ZU</a></li-->
			<li><a data-target="push" class="button" href="/ladder/gen81v1">1v1</a></li>
			<li><a data-target="push" class="button nav-last" href="/ladder/gen8battlestadiumsingles">Battle Stadium Singles</a></li>
		</ul>
		<ul class="laddernav">
			<li><a data-target="push" class="button nav-first" href="/ladder/gen8randomdoublesbattle">Random Doubles Battle</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8doublesou">Doubles OU</a></li>
			<li><a data-target="push" class="button nav-last" href="/ladder/gen8vgc2020">VGC 2020</a></li>
		</ul>
		<ul class="laddernav">
			<li><a data-target="push" class="button nav-first" href="/ladder/gen8balancedhackmons">Balanced Hackmons</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8mixandmega">Mix and Mega</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8almostanyability">Almost Any Ability</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8stabmons">STABmons</a></li>
			<li><a data-target="push" class="button" href="/ladder/gen8nfe">NFE</a></li>
			<li><a data-target="push" class="button nav-last" href="/ladder/gen8cap">CAP</a></li>
		</ul>
		<h1>
			Find user
		</h1>
		<form action="/users/" data-target="push" style="text-align:center">
			<input type="text" name="user" class="textbox" placeholder="Username" /><br />
			<button type="submit">Go</button>
		</form>
	</div></div>
<?php
} else {
?>
	<div class="pfx-panel"><div class="pfx-body ladder">
		<a href="/ladder/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Ladders</a>
		<h1><?php echo $format; ?> top 500</h1>
<?php
	if ($curuser['userid'] === 'zarel' || $curuser['userid'] === 'theimmortal' || substr($formatid, -11) === 'suspecttest' || substr($formatid, -7) === 'current') {
		$success = false;
		if ($curuser['userid'] === 'zarel' || $curuser['userid'] === 'chaos' || $curuser['userid'] === 'theimmortal' || $curuser['userid'] === 'marty') {
			if (@$_POST['act'] === 'resetladder' && $users->csrfCheck()) {
				if ($_POST['confirm'] === "Permanently reset this ladder.") {
					$ladder->clearAllRatings();
					$success = true;
					echo '<p>Ladder reset.</p>';
				} else {
					echo '<p>Your confirmation was not spelled/punctuated/capitalized correctly.</p>';
				}
			}
			if (!$success) {
?>
		<form method="post">
			<input type="hidden" name="act" value="resetladder"> <?php $users->csrfData() ?>
			<p>
				<button onclick="$('#innerform').show(); return false">Reset ladder</button>
			</p>
			<div id="innerform" style="display:none">
				<p>
					To confirm, type what's inside the quotation marks: "Permanently reset this ladder."<br />
					(Spelling, capitalization, and punctuation count)<br />
					<input type="text" name="confirm" value="" size="60" />
				</p>
				<p>
					<button type="submit"><strong>Reset</strong></button>
				</p>
			</div>
		</form>
<?php
			}
		}
	}
?>
		<div><table>
			<tr>
				<th width="35"></th>
				<th width="200">Name</th>
				<th width="60" style="text-align:center"><abbr title="Elo rating">Elo</abbr></th>
				<th width="50" style="text-align:center"><abbr title="user's percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th>
				<!--th width="50" style="text-align:center"><abbr title="Win Chance vs Average Opponent">WCAO</abbr></th-->
				<th width="80" style="text-align:center"><abbr title="Glicko-1 rating: rating&#177;deviation">Glicko-1</abbr></th>
			</tr>
<?php
	$toplist = $ladder->getTop();

	$i=0;

	if (!count($toplist)) {
?>
			<tr>
				<td colspan="8"><em>No one has played any ranked games yet.</em></td>
			</tr>
<?php
	}
	foreach ($toplist as $row) {
		$i++;
?>
			<tr<?php /* if (intval($row['rprd']) > 100) echo ' style="color:#999"'; */ if ($row['userid'] === $curuser['userid']) echo ' class="you"'; ?>>
				<td align="right"><?php echo $i; ?></td><td><a data-target="push" class="subtle" href="/users/<?php echo $row['userid']; ?>"><?php echo htmlspecialchars($row['username']); ?></a></td><td style="text-align:center"><strong><?php echo round($row['elo']); ?></strong></td>
<?php
			if (intval($row['rprd']) < 100) {
?>
				<td style="text-align:center"><?php echo number_format($row['gxe'],1); ?><small>%</small></td>
				<!--td style="text-align:center"><?php echo number_format(round(100 / (1 + pow(10,((1500 - $row['rpr']) / 400 / sqrt(1 + 0.0000100724 * ($row['rprd']*$row['rprd']))))), 1),1); ?><small>%</small></td-->
				<td style="text-align:center"><?php echo '<em>'.round($row['rpr']).'<small> &#177; '.round($row['rprd']).'</small></em>'; ?></td>
<?php
			} else {
?>
				<td style="text-align:center" colspan="3"><small style="color:#777">(more games needed)</small>
<?php
			}
?>
				<!--td><?php echo $row['w']; ?></td><td><?php echo $row['l']; ?></td><td><?php echo $row['t']; ?></td-->
			</tr>
<?php
	}
?>
		</table></div>
	</div></div>
<?php
}
$panels->end();
?>
