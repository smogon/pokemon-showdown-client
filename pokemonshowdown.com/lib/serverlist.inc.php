<?php

function servercmp($a, $b) {
	global $usercount;
	if ($a['id'] === 'showdown') return -1;
	if ($b['id'] === 'showdown') return 1;
	if (!empty($usercount[$a['id']])) {
		if (!empty($usercount[$b['id']])) {
			return $usercount[$b['id']] - $usercount[$a['id']];
		}
		return -1;
	} else if (!empty($usercount[$b['id']])) {
		return 1;
	} else if (isset($usercount[$a['id']]) && !isset($usercount[$b['id']])) {
		return -1;
	} else if (isset($usercount[$b['id']]) && !isset($usercount[$a['id']])) {
		return 1;
	}
	return $a['sortorder'] - $b['sortorder'];
}

$serverbits = '';
$serverbitscache = __DIR__ . '/../../config/userbitscache.html';
$lastmodified = @filemtime($serverbitscache);
if ($lastmodified && (time() - $lastmodified < 60 * 10)) {
	$serverbits = file_get_contents($serverbitscache);
} else {
	include_once __DIR__ . '/../../config/servers.inc.php';
	include_once __DIR__ . '/../../lib/ntbb-database.lib.php';
	$query = $psdb->query("SELECT `serverid`, `date`, `usercount` FROM `ntbb_userstats`");
	$usercount = array();
	$timenow = time();
	while ($row = $psdb->fetch_assoc($query)) {
		if (($timenow - $row['date'] / 1000 > 60 * 30) && ($row['serverid'] !== 'showdown')) {
			$usercount[$row['serverid']] = false; // inactive server
		} else {
			$usercount[$row['serverid']] = $row['usercount'];
		}
	}
	$sortorder = 0;
	foreach ($PokemonServers as &$server) {
		$server['sortorder'] = $sortorder++;
		if ($server['id'] === 'showdown') {
			$server['uri'] = '//' . $psconfig['routes']['client'];
		} else {
			$server['uri'] = 'http://' . $server['id'] . '.psim.us';
		}
	}
	uasort($PokemonServers, 'servercmp');
	ob_start();
	$more = false;
	foreach ($PokemonServers as &$server) {
		if (!empty($server['hidden'])) continue;
		if (!isset($usercount[$server['id']])) continue;
		if (($c = $usercount[$server['id']]) === false) continue;
		$usersbit = "<br />$c user" . ((intval($c) !== 1) ? 's' : '') . " online";
		if (!$c && !$more && $server['id'] !== 'showdown') {
			echo '</ul><button class="button" type="button" onclick="document.getElementById(\'moreservers\').style.display=\'block\';this.style.display=\'none\';return false">More</button><ul class="linklist" id="moreservers" style="display:none">';
			$more = true;
		}
?>
		<li><a href="<?php echo $server['uri'] ?>" class="blocklink"><?php if ($server['id'] === 'showdown') echo '<strong>',$server['name'],'<br />(official server)</strong>'; else echo $server['name']; ?><small><?php echo $usersbit; ?></small></a></li>
<?php
	}
	$serverbits = ob_get_clean();
	file_put_contents($serverbitscache, $serverbits, LOCK_EX);
}

echo $serverbits;
