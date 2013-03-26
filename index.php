<?php

require_once 'lib/common.inc.php'; // performs authorisation

$month = null;
if (isset($_REQUEST['month'])) {
	$month = $_REQUEST['month'];
	if (!preg_match('/^[0-9]+-[0-9]+$/', $month) || !file_exists($config['logdirectory'] . '/' . $month)) {
	        die('Invalid month specified.');
	}
}

$file = null;
if (isset($_REQUEST['file']) && $month) {
	$file = $_REQUEST['file'];
	if (!preg_match('/^[0-9]+-[0-9]+-[0-9]+\.txt$/', $file) ||
			!file_exists($logfile = $config['logdirectory'] . '/' . $month . '/' . $file)) {
		die('Invalid file specified.');
	}
	// record this log access in the database
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
		$db->real_escape_string($month . '/' . $file) .
		'\')'
	);
	$db->close();
	// output the log file
	header('Content-Type: text/plain');
	readfile($logfile);
	die;
}

?>
<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Pokemon Showdown Logs</title>
<?php echo getLoginInformation() ?>
<?php if (!$month) { ?>
<?php
$months = glob($config['logdirectory'] . '/*', GLOB_ONLYDIR);
?>
<p>Please choose which month's logs to view:</p>
<ul>
<?php
foreach ($months as &$i) {
	$i = basename($i);
	echo "<li><a href='$i/'>$i</a></li>";
}
?>
</ul>
<?php } else { ?>

<?php
$files = glob($config['logdirectory'] . '/' . $month . '/*');
?>

<p>Choose a log file to view in <?php echo $month ?>.</p>
<p>Note: Log files are large and may make your browser lag while they load.</p>
<div style="margin-bottom: -15px;"><?php echo $month ?>/</div>
<ul>
<li><a href="/">..</a></li>
<?php
foreach ($files as &$i) {
	$i = basename($i);
	$logfile = $config['logdirectory'] . '/' . $month . '/' . $i;
	$size = round(@filesize($logfile) / 1024 / 1024, 1);
	echo "<li><a href='$i'>$i</a> ($size MiB)</li>";
}
?>
</ul>

<p>You can also go back to the <a href="/">list of months</a>.</p>

<?php } ?>
