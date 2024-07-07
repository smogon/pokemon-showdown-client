<?php

include_once 'servers.lib.php';
include '../style/wrapper.inc.php';

$timenow = time();

$page = 'servers';
$pageTitle = "Servers";

$success = false;

// Add server
//=================================================================================

if (@$_POST['act'] === 'addserver') {
	if (!$users->isLeader()) die('access denied');
	if (!$users->csrfCheck()) die('invalid data, please retry');
	$name = trim(@$_POST['name']);
	$owners = explode(',', @$_POST['owner']);
	foreach ($owners as $i=>$owner) $owners[$i] = $users->userid($owner);
	$owner = implode(',',$owners);
	$id = $users->userid(@$_POST['id']);
	$loc = trim(@$_POST['loc']);
	if (!$name || !$id || !$loc) die('missing information');
	if (isset($PokemonServers[$id])) die('server already exists');
	if (substr($loc, 0, 7) === 'http://') $loc = substr($loc, 7);
	if (substr($loc, 0, 8) === 'https://') $loc = substr($loc, 8);
	$slashpos = strpos($loc, '/');
	if ($slashpos !== false) $loc = substr($loc, 0, $slashpos);
	if (substr($loc, -8) === '.psim.us') $loc = substr($loc, 0, -8);
	$parts = explode(':', $loc);
	$server = $loc;
	$port = 8000;
	if (@$parts[1]) {
		$port = intval($parts[1]);
		$server = $parts[0];
	} else {
		$dashpos = strrpos($loc, '-');
		if ($dashpos !== false && ctype_digit(substr($loc, $dashpos+1))) {
			$port = intval(substr($loc, $dashpos+1));
			$server = substr($loc, 0, $dashpos);
		}
	}
	if (strpos($server, '.') === false) {
		die("invalid server location");
	}
	$PokemonServers[$id] = [
		'name' => $name,
		'id' => $id,
		'server' => $server,
		'port' => $port
	];
	if ($owner) $PokemonServers[$id]['owner'] = $owner;
	saveservers();
}

// Server list
//=================================================================================

includeHeader();

if (@$_POST['act'] === 'addserver') {
	echo '<p>Added: <code>'.htmlspecialchars(var_export($PokemonServers[$id],true)).'</code></p>';
}

$activeservers = [];
$inactiveservers = [];

$res = $psdb->query("SELECT `serverid`, `date`, `usercount` FROM `ntbb_userstats`");
while ($row = $psdb->fetch_assoc($res)) {
	$serverid = $row['serverid'];
	if (!isset($PokemonServers[$serverid])) continue;
	if (@$PokemonServers[$serverid]['hidden']) continue;

	if ($timenow - $row['date'] / 1000 > 60 * 30) {
		$inactiveservers[$serverid] = $row;
		$inactiveservers[$serverid]['serverentry'] = $PokemonServers[$serverid];
	} else {
		$activeservers[$serverid] = $row;
		$activeservers[$serverid]['serverentry'] = $PokemonServers[$serverid];
	}
}

function cmpByDate($b, $a) {
	return $a['date'] - $b['date'];
}
function cmpByUsercount($b, $a) {
	return $a['usercount'] - $b['usercount'];
}
$uninitializedservers = array_diff_key($PokemonServers, $activeservers, $inactiveservers);
uasort($activeservers, 'cmpByUsercount');
uasort($inactiveservers, 'cmpByDate');

?>
		<div class="main">
<?php
if ($users->isLeader()) {
?>
			<h1>Add server</h1>
			<p id="addserverbutton">
				<button onclick="document.getElementById('addserver').style.display = 'block';document.getElementById('addserverbutton').style.display = 'none';return false">Add server</button>
			</p>
			<form id="addserver" method="post" style="display:none">
				<?php $users->csrfData(); ?>
				<input type="hidden" name="act" value="addserver" />
				<div class="formrow">
					<label class="label">Name: <input class="textbox" type="text" name="name" /><em>(Should be in title case: words should be lowercase, with first letter capitalized except minor words; contact Zarel for exceptions)</em></label>
				</div>
				<div class="formrow">
					<label class="label">ID: <span class="labelcontents"><input class="textbox" type="text" name="id" />.psim.us</span>
					<em>(Should be identical to name; we'll automatically make it lowercase and remove spaces; contact Zarel for exceptions)</em></label>
				</div>
				<div class="formrow">
					<label class="label">Location: <input class="textbox" type="text" name="loc" /><em>(can be in the form 173.252.196.254-8000.psim.us)</em></label>
				</div>
				<div class="formrow">
					<label class="label">Owner's username: <input class="textbox" type="text" name="owner" placeholder="(Optional)" /><em>(separate multiple owners by commas)</em></label>
				</div>
				<div class="buttonrow">
					<button type="submit"><strong>Add server</strong></button>
				</div>
			</form>
<?php
}
?>
			<p>
				<a href="https://www.smogon.com/forums/server-registration-form/">Server registration form</a>
			</p>
			<h1>Active servers</h1>
			<table class="table">
<?php

foreach ($activeservers as $server) {
	$entry = $server['serverentry'];
?>
				<tr>
					<td>
						<a href="/servers/<?= $entry['id'] ?>"><strong><?= htmlspecialchars($entry['name']) ?></strong> <small>(<?= $server['usercount'] ?>)</small></a>
					</td>
					<td>
<?php if ($entry['id'] === 'showdown') { ?>
						<small><a href="//<?= $psconfig['routes']['client'] ?>" target="_blank"><code><?= $psconfig['routes']['client'] ?></code></a></small>
<?php } else { ?>
						<small><a href="http://<?= $entry['id'] ?>.psim.us" target="_blank"><code><?= $entry['id'] ?>.psim.us</code></a></small>
<?php } ?>
					</td>
					<td>
						<small><?= htmlspecialchars(@$entry['owner']) ?></small>
					</td>
				</tr>
<?php
}

?>
			</table>
			<h1>Inactive servers</h1>
			<table class="table">
<?php

foreach ($inactiveservers as $server) {
	$entry = $server['serverentry'];
?>
				<tr>
					<td>
						<a href="/servers/<?= $entry['id'] ?>"><strong><?= htmlspecialchars($entry['name']) ?></strong> <small>(offline)</small></a>
					</td>
					<td>
						<small><a href="http://<?= $entry['id'] ?>.psim.us" target="_blank"><code><?= $entry['id'] ?>.psim.us</code></a></small>
					</td>
					<td>
						Last online: <?= intval(($timenow - $server['date']/1000)/(60*60*24)); ?> days ago
					</td>
					<td>
						<small><?= htmlspecialchars(@$entry['owner']) ?></small>
					</td>
				</tr>
<?php
}
?>
			</table>
<?php
if ($users->isLeader()) {
?>
			<h1>Untracked servers</h1>
			<p>
				(Registered servers that have never been online ever, or whose online state can't be tracked without a token)
			</p>
			<table class="table">
<?php

	foreach ($uninitializedservers as $server => $entry) {
		if (@$entry['hidden']) continue;
?>
				<tr>
					<td>
						<a href="/servers/<?= $entry['id'] ?>"><strong><?= htmlspecialchars($entry['name']) ?></strong> <small>(untracked)</small></a>
					</td>
					<td>
						<small><a href="http://<?= $entry['id'] ?>.psim.us" target="_blank"><code><?= $entry['id'] ?>.psim.us</code></a></small>
					</td>
					<td>
						<small><?= htmlspecialchars(@$entry['owner']) ?></small>
					</td>
				</tr>
<?php
	}
?>
			</table>
<?php
}
?>
		</div>
<?php

includeFooter();
