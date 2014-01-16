<?php

include 'lib/ntbb-ladder.lib.php';

$serverid = 'showdown';
$formatid = 'OU';

if (@$_REQUEST['format']) $formatid = $_REQUEST['format'];
if (@$_REQUEST['server']) $serverid = $_REQUEST['server'];

if (!ctype_alnum($formatid)) {
	die('denied');
}

if (isset($_REQUEST['testclient'])) {
	header('Content-Type: text/plain; charset=utf-8');
}

$ladder = new NTBBLadder($serverid, $formatid);
?>
	<table>
		<tr>
			<th></th><th>Name</th><th><abbr title="Elo rating">Elo</abbr></th><th><abbr title="user's percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko-1 rating system: rating&#177;deviation (provisional if deviation>100)">Glicko-1</abbr></th>
		</tr>
<?php

$toplist = $ladder->getTop();

$i=0;

if (!count($toplist))
{
?>
		<tr>
			<td colspan="8"><em>No one has played any ranked games yet.</em></td>
		</tr>
<?php
}
foreach ($toplist as $row)
{
	$i++;
?>
		<tr<?php /* if (floatval($row['rprd']) > 100) echo ' style="color:#999"'; */ ?>>
			<td><?php echo $i; ?></td><td><?php echo htmlspecialchars($row['username']); ?></td><td><strong><?php echo round($row['acre']); ?></strong></td><td><?php echo number_format($row['gxe'],1); ?></td>
			<td><?php echo '<em>'.round($row['rpr']).'<small> &#177; '.round($row['rprd']).'</small></em>'; /* if (floatval($row['rprd']) > 100) echo ' <small>(provisional)</small>'; */ ?></td>
		</tr>
<?php
}
?>
	</table>
