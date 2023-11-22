<?php

die("This is no longer maintained as a way to track versions.");

include 'style/wrapper.inc.php';

$page = 'versions';
$pageTitle = "Versions";

function getVersionedFile($commit, $filename) {
	ob_start();
	passthru("GIT_DIR=config/git/Pokemon-Showdown.git git show ${commit}:$filename 2>/dev/null", $return);
	if ($return) return false;
	return ob_get_clean();
}

function computeServerVersion($commit) {
	$filelist = getVersionedFile($commit, 'filelist.txt');
	if ($filelist === false) return 0;
	$filenames = explode("\n", $filelist);
	$hash = hash_init('md5');
	foreach ($filenames as &$i) {
		if ($i === '') continue;
		$data = getVersionedFile($commit, $i);
		if ($data !== false) {
			hash_update($hash, $data);
		}
	}
	return hash_final($hash);
}

$gitcache = 'config/git/cache';
$file = fopen($gitcache, 'c');
flock($file, LOCK_SH);
$versions = unserialize(file_get_contents($gitcache));
flock($file, LOCK_EX);
$lastmodified = @filemtime($gitcache);
if (!is_array($versions) || !$lastmodified || (time() - $lastmodified > 60*60)) {
	// Need to update the cache.
	$since = null;
	if (!is_array($versions)) {
		$versions = array();
		$since = '507894726c2b5c05d5c80865c6e1f5410816d3aa';
	} else {
		$since = $versions[0]['commit'];
	}
	`GIT_DIR=config/git/Pokemon-Showdown.git git fetch > /dev/null 2>&1`;
	$commits = array_reverse(explode("\n", `GIT_DIR=config/git/Pokemon-Showdown.git git log --format=oneline ${since}..`));
	foreach ($commits as &$i) {
		if ($i === '') continue;
		$parts = explode(' ', $i, 2);
		array_unshift($versions, array(
			'commit' => $parts[0],
			'message' => $parts[1],
			'version' => computeServerVersion($parts[0])
		));
	}
	file_put_contents($gitcache, serialize($versions));
}
flock($file, LOCK_UN);

includeHeaderTop();
?>
<script src="js/jquery-1.9.1.min.js"></script>
<style type="text/css">
table, tr, th, td {
	border: 0;
}
td {
	padding-left: 10px;
	padding-right: 10px;
}
</style>
<script>
$(function() {
	if (!location.hash) return;
	var $e = $('tr' + location.hash);
	var $cc = $('#custom-code');
	if ($e.length === 0) {
		$cc.html('The server you came from is running custom code and is not a standard version.');
		$cc.css('background-color', '#e9eefb');
	} else {
		$cc.html('The version of the server you came from is highlighted below.');
		$e.css('background-color', '#e9eefb');
	}
});
</script>
<?php
includeHeaderBottom();
?>

<div class="main">

<p>This page indexes versions of Pok&eacute;mon Showdown by the output of the <code>/version</code> command.</p>

<p>You can use <code>/version</code> on a server to find out what version it is running.</p>

<p id="custom-code">If the output of <code>/version</code> is not listed here, the server is running custom code.</p>

<div>
<table>
<tr>
	<th>Commit</th>
	<th>Message</th>
	<th>Version</th>
</tr>
<?php foreach ($versions as &$version) { ?>
<tr id="<?php echo htmlspecialchars($version['version']) ?>">
	<td><a href="https://github.com/Zarel/Pokemon-Showdown/commit/<?php echo htmlspecialchars($version['commit']) ?>" target="_blank"><?php echo htmlspecialchars(substr($version['commit'], 0, 10)) ?></a></td>
	<td><?php echo htmlspecialchars($version['message']) ?></td>
	<td><?php echo htmlspecialchars($version['version']) ?></td>
</tr>
<?php } ?>
</table>
</div>

</div>

<?php
includeFooter();
?>
