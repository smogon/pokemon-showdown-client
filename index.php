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

$file = null;
if (isset($_REQUEST['file']) && $month && $roomid) {
	$file = $_REQUEST['file'];
	$logfile = $config['logdirectory'] . '/' . $roomid . '/' . $month . '/' . $file;
	if (!preg_match('/^[0-9]+-[0-9]+-[0-9]+\.txt$/', $file) || !file_exists($logfile)) {
		die('Invalid file specified.');
	}
	// record this log access in the database
	if ($config['db_server']) {
		$db = new mysqli(
			$config['db_server'],
			$config['db_username'],
			$config['db_password'],
			$config['db_database']
		);
		$db->query(
			'INSERT INTO `' .
			$config['db_prefix'] .
			'logviewerlog` (userid, filename) VALUES (\'' .
			$db->real_escape_string($user['userid']) .
			'\', \'' .
			$db->real_escape_string($roomid . '/' . $month . '/' . $file) .
			'\')'
		);
		$db->close();
	}
	// output the log file
	header('Content-Type: text/plain;charset=utf-8');
	if (!isset($_REQUEST['onlychat'])) {
		readfile($logfile);
	} else {
		$lines = file($logfile);
		foreach ($lines as &$i) {
			if (preg_match('/\|(N|J|L|userstats)\|/', $i)) continue;
			echo $i;
		}
	}
	die;
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
