<?php

include 'lib/ntbb-ladder.lib.php';

$serverid = 'showdown';
$formatid = 'OU';
$output = @$_REQUEST['output'];

if (@$_REQUEST['format']) $formatid = $_REQUEST['format'];
if (@$_REQUEST['server']) $serverid = $_REQUEST['server'];

if (!ctype_alnum($formatid)) {
	die('denied');
}

$ladder = new NTBBLadder($serverid, $formatid);

if (!$output)
{

?><!DOCTYPE html>
<html></head>
	<title>Ladder</title>

	<style>
	<!--
		html
		{
			margin: 0;
			padding: 0;
		}
		body
		{
			margin: 20px;
			padding: 0;
			font-family: Verdana, Helvetica, sans-serif;
			font-size: 11pt;
		}
		h1
		{
			margin: -20px -20px 0 -20px;
			background: #E1E8F2;
			border-bottom: 1px solid #AAA;
			text-align: center;
		}
		table, td, th
		{
			border-collapse: collapse;
			border: 1px solid #BBBBBB;
		}
		td, th
		{
			padding: 3px 5px;
		}
		th
		{
			text-align: left;
			font-size: 9pt;
			background: #EEEEEE;
		}
	-->
	</style>

</head><body>

	<h1><img src="/pokemonshowdownbeta.png" alt="Pokemon Showdown! (beta)" /></h1>
	<h2><?php echo $formatid; ?> ladder</h2>
<?php
}
?>
	<table>
		<tr>
			<th></th><th>Name</th><th><abbr title="Advanced Conservative Rating Estimate =&nbsp;R&nbsp;&minus;&nbsp;RD&times;1.4">ACRE</abbr></th><th><abbr title="user's percentage chance of winning a random battle (aka GLIXARE)">GXE</abbr></th><th><abbr title="Glicko2 rating system: rating&#177;deviation (provisional if deviation>50)">Glicko2</abbr></th>
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
		<tr<?php if (floatval($row['rprd']) > 100) echo ' style="color:#999"';?>>
			<td><?php echo $i; ?></td><td><?php echo $row['username']; ?></td><td><strong><?php echo round($row['acre']); ?></strong></td><td><?php echo number_format($row['gxe'],1); ?></td>
			<td><?php echo '<em>'.round($row['rpr']).'<small> &#177; '.round($row['rprd']).'</small></em>'; if (floatval($row['rprd']) > 100) echo ' <small>(provisional)</small>'; ?></td>
		</tr>
<?php
}
?>
	</table>
<?php
if (!$output)
{
?>
</body></html>
<?php
}
?>