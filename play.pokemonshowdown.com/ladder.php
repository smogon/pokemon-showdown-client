<?php

include '../lib/ntbb-ladder.lib.php';

$formatid = 'OU';
$prefix = null;

if ($_REQUEST['format'] ?? null) $formatid = $_REQUEST['format'];
if ($_REQUEST['prefix'] ?? null) $prefix = $_REQUEST['prefix'];

if (!ctype_alnum($formatid)) {
	die('denied');
}

if (isset($_REQUEST['testclient'])) {
	header('Content-Type: text/plain; charset=utf-8');
}

$ladder = new NTBBLadder($formatid);
?>
	<table>
		<tr>
			<th></th><th>Name</th><th><abbr title="Elo rating">Elo</abbr></th><th><abbr title="user's percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko-1 rating system: rating&#177;deviation (provisional if deviation>100)">Glicko-1</abbr></th>
			<th>COIL</th>
		</tr>
<?php

$toplist = $ladder->getTop($prefix);

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
	$N=$row['w']+$row['l']+$row['t'];
?>
		<tr<?php /* if (floatval($row['rprd']) > 100) echo ' style="color:#999"'; */ ?>>
			<td><?php echo $i; ?></td><td><?php echo htmlspecialchars($row['username']); ?></td><td><strong><?php echo round($row['elo']); ?></strong></td><td><?php echo ($row['rprd'] < 100 ? number_format($row['gxe'],1) . '<small>%</small>' : '&ndash;'); ?></td>
			<td><?php echo '<em>'.round($row['rpr']).'<small> &#177; '.round($row['rprd']).'</small></em>'; /* if (floatval($row['rprd']) > 100) echo ' <small>(provisional)</small>'; */ ?></td>
			<td>
			<?php if ($row['formatid'] == 'gen7oususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-17.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7uususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-20.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7rususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-9.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7nususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-9.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7pususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-9.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7lcsuspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-13.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7monotypesuspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-9.0/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7doublesoususpecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-14.5/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7balancedhackmonssuspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-11/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen71v1suspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-20/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7mixandmegasuspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-10.5/$N) : 0,1,'.','');
			elseif ($row['formatid'] == 'gen7almostanyabilitysuspecttest') echo number_format($N ? 40*$row['gxe']*pow(2.0,-6.0/$N) : 0,1,'.','');
			else echo '--';	?></td>
		</tr>
<?php
}
?>
	</table>
