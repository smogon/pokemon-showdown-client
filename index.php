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
<style>
html, body {
	font: 10pt Verdana, sans-serif;
}
.roomloglist .autohide {
	font-size: 10pt;
	display: none;
}
.roomloglist li:hover .autohide {
	display: inline;
}
.roomloglist li {
	font-size: 12pt;
	padding-top: 2px;
	padding-bottom: 2px;
}
</style>
<?php echo getLoginInformation() ?>
<?php if (!$roomid) { ?>
<?php
$roomids = glob($config['logdirectory'] . '/*', GLOB_ONLYDIR);
?>
<p>Please choose which room's logs to view:</p>
<?php

$buf_o = '';
$buf_n = '';
$buf_g = '';

$nowurl = (new DateTime())->format('Y-m-d');

foreach ($roomids as &$i) {
	$i = htmlentities(basename($i));
	if ($i === 'upperstaff' || $i === 'adminlog' || $i === 'modpolicy') continue;
	if (substr($i, 0, 10) === 'groupchat-') {
		$buf_g .= "<li><a href='$i/'>$i</a><small class='autohide'> - <a href='$i/$nowurl.html#end'>(today)</a></small></li>";
	} else if ($i === 'lobby' || $i === 'tournaments' || $i === 'development' || $i === 'staff' || $i === 'help') {
		$buf_o .= "<li><a href='$i/'>$i</a><small class='autohide'> - <a href='$i/$nowurl.html#end'>(today)</a></small></li>";
	} else {
		$buf_n .= "<li><a href='$i/'>$i</a><small class='autohide'> - <a href='$i/$nowurl.html#end'>(today)</a></small></li>";
	}
}
?>
Official
<ul class="roomloglist">
	<?php echo $buf_o; ?>
</ul>
Other
<ul class="roomloglist">
	<?php echo $buf_n; ?>
</ul>
Group chats
<div id="list_groupchat" style="display: none"><ul class="roomloglist">
	<?php echo $buf_g; ?>
</ul></div>
<script>
function show_groupchat(e) {
	document.getElementById('button_groupchat').style.display = 'none';
	document.getElementById('list_groupchat').style.display = 'block';
	return false;
}
</script>
<div id="button_groupchat"><ul>
	<li><button onclick="return show_groupchat(event)">Show group chats</button></li>
</ul></div>
<?php } else if ($roomid && !$month) {
	if (($roomid === 'upperstaff' || $roomid === 'adminlog' || $roomid === 'modpolicy') && !in_array($user['group'], ['&','~'])) {
		die('WOW RUDE get out of here');
	}
	$months = glob($config['logdirectory'] . '/' . $roomid . '/*', GLOB_ONLYDIR);
?>
<a href="/">&laquo; All Logs</a> / <strong><?php echo $roomid ?></strong> /
<p>
Quick jump:
</p>
<ul class="roomloglist"><li>
<?php
$nowurl = (new DateTime())->format('Y-m-d');
echo "<a href='$nowurl.html#end'>(today)</a>";
?>
</li></ul>
<p>Please choose which month's logs to view for the <code><?php echo $roomid ?></code> room:</p>
<ul class="roomloglist">
<?php
foreach ($months as &$i) {
	$i = htmlentities(basename($i));
	echo "<li><a href='$i/'>$i</a></li>";
}
?>
</ul>

<p>You can also go back to the <a href="../">list of rooms</a>.</p>

<?php
} else {
	if (($roomid === 'upperstaff' || $roomid === 'adminlog' || $roomid === 'modpolicy') && !in_array($user['group'], ['&','~'])) {
		die('WOW RUDE get out of here');
	}
	$files = glob($config['logdirectory'] . '/' . $roomid . '/' . $month . '/*');
?>
<a href="/">&laquo; All Logs</a> / <a href="<?php echo '/', $roomid, '/'; ?>"><?php echo $roomid ?></a> / <strong><?php echo $month; ?></strong> /

<p>Choose a log file to view in <?php echo $month ?> for the <code><?php echo $roomid ?></code> room.</p>
<p>Note: Log files are large and may make your browser lag while they load.</p>
<div style="margin-bottom: -15px;"><?php echo $month ?>/</div>
<ul class="roomloglist">
<li><a href="../">..</a></li>
<?php
foreach ($files as &$i) {
	$i = htmlentities(substr(basename($i), 0, -4));
	$logfile = $config['logdirectory'] . '/' . $roomid . '/' . $month . '/' . $i . '.txt';
	$size = round(@filesize($logfile) / 1024 / 1024, 1);
	echo "<li><a href='../$i.html'>$i.html</a> ($size MiB) or view <a href='$i.txt'>txt</a> <a href='$i.txt?onlychat'>txt-onlychat</a></li>";
}
?>
</ul>

<p>You can also go back to the <a href="../">list of months</a>.</p>

<?php
} ?>
<p style="font-size: 11px;">The current time on the server is <?php echo str_replace("\n", '', htmlentities(`date`)) ?>.</p>
