<?php

require_once 'lib/common.inc.php'; // performs authorisation

$roomid = null;
if (isset($_REQUEST['roomid'])) {
	$roomid = $_REQUEST['roomid'];
	if (!preg_match('/^[a-zA-Z0-9-]+$/', $roomid) || !file_exists($config['logdirectory'] . '/' . $roomid)) {
		die('Invalid roomid specified.');
	}
}

$month = null;
if (isset($_REQUEST['month']) && $roomid) {
	$month = $_REQUEST['month'];
	if (!preg_match('/^[0-9]+-[0-9]+$/', $month) || !file_exists($config['logdirectory'] . '/' . $roomid . '/' . $month)) {
	        die('Invalid month specified.');
	}
}

?>
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Pokemon Showdown Logs</title>
<link rel="shortcut icon" href="//play.pokemonshowdown.com/favicon.ico" />
<?php echo getLoginInformation() ?>
<?php if (!$roomid) { ?>
<?php
$roomids = glob($config['logdirectory'] . '/*', GLOB_ONLYDIR);
?>
<p>Please choose which room's logs to view:</p>
<ul>
<?php
foreach ($roomids as &$i) {
	$i = htmlentities(basename($i));
	echo "<li><a href='$i/'>$i</a></li>";
}
?>
</ul>
<?php } else if ($roomid && !$month) { ?>
<?php
$months = glob($config['logdirectory'] . '/' . $roomid . '/*', GLOB_ONLYDIR);
?>
<p>Please choose which month's logs to view for the <code><?php echo $roomid ?></code> room:</p>
<ul>
<?php
foreach ($months as &$i) {
	$i = htmlentities(basename($i));
	echo "<li><a href='$i/'>$i</a></li>";
}
?>
</ul>

<p>You can also go back to the <a href="../">list of rooms</a>.</p>

<?php } else { ?>

<?php
$files = glob($config['logdirectory'] . '/' . $roomid . '/' . $month . '/*');
?>

<p>Choose a log file to view in <?php echo $month ?> for the <code><?php echo $roomid ?></code> room.</p>
<p>Note: Log files are large and may make your browser lag while they load.</p>
<div style="margin-bottom: -15px;"><?php echo $month ?>/</div>
<ul>
<li><a href="/">..</a></li>
<?php
foreach ($files as &$i) {
	$i = htmlentities(basename($i));
	$logfile = $config['logdirectory'] . '/' . $roomid . '/' . $month . '/' . $i;
	$size = round(@filesize($logfile) / 1024 / 1024, 1);
	echo "<li><a href='$i'>$i</a> ($size MiB) or view <a href='$i?onlychat'>only chat</a></li>";
}
?>
</ul>

<p>You can also go back to the <a href="../">list of months</a>.</p>

<?php } ?>
<p style="font-size: 11px;">The current time on the server is <?php echo str_replace("\n", '', htmlentities(`date`)) ?>.</p>
