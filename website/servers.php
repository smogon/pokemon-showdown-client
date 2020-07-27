<?php

include_once 'config/servers.inc.php';
include_once '../play.pokemonshowdown.com/lib/ntbb-session.lib.php';
include 'style/wrapper.inc.php';

$id = '';
$entry = null;

if (!empty($_GET['id'])) {
	$id = $users->userid(@$_GET['id']);
	$entry = @$PokemonServers[$id];
	if (!$entry) {
		header('HTTP/1.1 404 Not Found');
		die(isset($_REQUEST['json']) ? 'null' : '404 Not Found');
	}
}

$timenow = time();

$page = 'servers';
$pageTitle = "Servers";

function saveservers() {
	file_put_contents('config/servers.inc.php', '<?php

/* if ((substr($_SERVER[\'REMOTE_ADDR\'],0,11) === \'69.164.163.\') ||
		(@substr($_SERVER[\'HTTP_X_FORWARDED_FOR\'],0,11) === \'69.164.163.\')) {
	file_put_contents(dirname(__FILE__).\'/log\', "blocked: ".var_export($_SERVER, TRUE)."\n\n", FILE_APPEND);
	die(\'website disabled\');
} */

$PokemonServers = '.var_export($GLOBALS['PokemonServers'], true).';
');
}

$success = false;

$is_manager = (@$curuser['group'] == 2 || @$curuser['group'] == 6);

// Single server view
//=================================================================================

if ($entry) {
	if (isset($_REQUEST['json'])) {
		header('Content-type: application/json');
		header('Access-Control-Allow-Origin: *');
		$out = [
			'host' => '',
			'id' => $id,
		];
		if ($entry['banned'] ?? false) {
			$out['banned'] = true;
		} else {
			$out['banned'] = false;
			$out['host'] = $entry['server'];
			$out['port'] = $entry['port'];
			if (isset($entry['altport'])) $out['altport'] = $entry['altport'];
		}
		die(json_encode($out));
	}
	$is_owner = $is_manager;
	if (!@$entry['banned'] && strpos(','.@$entry['owner'].',', ','.$curuser['userid'].',') !== false) $is_owner = true;

	if (@$_POST['act'] === 'editserver') {
		if (!$is_owner) die('access denied');
		if (!$users->csrfCheck()) die('invalid data, please retry');

		$id = $entry['id'];
		$loc = trim(@$_POST['loc']);
		if ($loc) {

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

			$PokemonServers[$id]['server'] = $server;
			$PokemonServers[$id]['port'] = $port;
		}

		$owners = explode(',', $_POST['owner']);
		foreach ($owners as $i=>$owner) $owners[$i] = $users->userid($owner);
		$PokemonServers[$id]['owner'] = implode(',',$owners);

		saveservers();
		$success = 'editserver';
		$entry = $PokemonServers[$id];
	}
	if (@$_POST['act'] === 'deleteserver') {
		if (!$is_owner) die('access denied');
		if (!$users->csrfCheck()) die('invalid data, please retry');
		$id = $entry['id'];

		unset($PokemonServers[$id]);
		saveservers();
		$success = 'deleteserver';
		$entry = false;
	}
	if (@$_POST['act'] === 'banserver') {
		if (!$is_owner) die('access denied');
		if (!$users->csrfCheck()) die('invalid data, please retry');
		$id = $entry['id'];

		$message = @$_POST['message'];
		if (!$message) $message = 'banned';
		$PokemonServers[$id]['banned'] = $_POST['message'];
		saveservers();
		$success = 'banserver';
		$entry = $PokemonServers[$id];
	}
	if (@$_POST['act'] === 'maketoken') {
		if (!$is_owner) die('access denied');
		if (!$users->csrfCheck()) die('invalid data, please retry');
		$id = $entry['id'];

		$token = base64_encode(openssl_random_pseudo_bytes(9));
		$PokemonServers[$id]['token'] = md5($token);
		saveservers();
		$success = 'maketoken';
		$entry = $PokemonServers[$id];
	}
	if (@$_POST['act'] === 'deltoken') {
		if (!$is_owner) die('access denied');
		if (!$users->csrfCheck()) die('invalid data, please retry');
		$id = $entry['id'];

		unset($PokemonServers[$id]['token']);
		saveservers();
		$success = 'deltoken';
		$entry = $PokemonServers[$id];
	}
	includeHeader();
	// if (!$is_owner) {
	// 	die('access denied');
	// }
?>
		<div class="main">
			<p>
				You're logged in as: <?= htmlspecialchars($curuser['username']) ?>
			</p>
			<p>
				<a href="/servers/">Back to server list</a>
			</p>
			<?php if ($success) echo '<p><strong style="color:#119911">Successfully updated.</strong></p>'; if (!$entry) die(); ?>
<?php
if (isset($token)) {
?>
			<p>Add this to your config.js, replacing all other "exports.serverid" and "exports.servertoken" lines if you have them:<br /><textarea readonly rows="2" cols="40" style="border: 2px solid #119911; font-size: 12pt; font-family: monospace">exports.serverid = '<?= $entry['id'] ?>';
exports.servertoken = '<?= $token ?>';</textarea></p>
<?php
}
?>
			<h1><?= htmlspecialchars($entry['name']); ?></h1>
<?php if (@$entry['hidden']) { ?>
			<p>
				[Hidden]
			</p>
<?php } ?>
<?php if (@$entry['banned']) { ?>
			<p style="color:red">
				<strong>Banned</strong><br />Reason: <?= $entry['banned'] ?>
			</p>
<?php } ?>
			<p>
<?php if ($entry['id'] === 'showdown') { ?>
				<small><a href="//play.pokemonshowdown.com" target="_blank"><code>play.pokemonshowdown.com</code></a></small>
<?php } else { ?>
				<small><a href="http://<?= $entry['id'] ?>.psim.us" target="_blank"><code><?= $entry['id'] ?>.psim.us</code></a></small>
<?php } ?>
			</p>
<?php if (@$entry['owner']) { ?><p>Owner: <?= htmlspecialchars($entry['owner']); ?></p><?php } ?>
<?php if ($entry['id'] !== 'showdown' && $is_owner) { ?>
			<p id="editserverbutton">
				<button onclick="document.getElementById('editserver').style.display = 'block';document.getElementById('editserverbutton').style.display = 'none';return false">Edit server</button> <button onclick="document.location.href = ('http://play.pokemonshowdown.com/customcss.php?server=<?= $entry['id'] ?>&amp;invalidate')">Reload custom CSS</button>
			</p>
			<div id="editserver" style="display:none"><form method="post"><?php $users->csrfData(); ?>
				<h1>Edit server</h1>
				<div class="formrow">
					<p><label class="label">Location: <input class="textbox" type="text" name="loc" placeholder="http://<?php echo $entry['server']; if ($entry['port'] != 8000) echo '-',$entry['port']; ?>.psim.us/" size="60" /><em>(you can leave off http:// etc if you want)</em></label></p>
					<p><label class="label">Owner: <input class="textbox" type="text" name="owner" value="<?php echo $entry['owner'] ?? '(none)'; ?>" size="60" /><em>(separate multiple owners by commas)</em></label></p>
					<label class="label">Configuration:</label><?php

if (@$entry['token']) {
	echo '<em>(Token exists)</em> <button type="submit" name="act" value="maketoken">Regenerate token</button> <button type="submit" name="act" value="deltoken">Remove</button>';
} else {
	echo '<p>Your config file should include this, replacing any other serverid or servertoken entry:</p>';
	echo '<textarea readonly rows="2" cols="40" style="font-size: 12pt; font-family: monospace">exports.serverid = \'' . $entry['id'] . '\';</textarea>';
	echo '<p>After that, you should show up on the main list and be able to upload replays. If you still can\'t, you might need to generate a token:</p>';
	echo '<em>(No token)</em> <button type="submit" name="act" value="maketoken">Generate token</button>';
}

?>
				</div>
				<div class="buttonrow">
					<button type="submit" name="act" value="editserver"><strong>Edit server</strong></button>
				</div>
			</form>
			<?php if ($is_manager) { ?><form method="post">
				<input type="hidden" name="act" value="deleteserver" /><?php $users->csrfData(); ?>
				<p>
					<button onclick="document.getElementById('deleteserver').style.display = 'block';return false"><small>Delete server</small></button> <button type="submit" id="deleteserver" style="display:none"><small><strong>I'm sure I want to delete this server</strong></small></button>
				</p>
			</form><form method="post">
				<input type="hidden" name="act" value="banserver" /><?php $users->csrfData(); ?>
				<p>
					<button onclick="document.getElementById('banserver').style.display = 'block';return false"><small>Ban server</small></button> <span id="banserver" style="display:none">Reason: <input type="text" name="message" size="80" /><br /><button type="submit"><small><strong>I'm sure I want to ban this server</strong></small></button></span>
				</p>
			</form><?php } ?></div>
<?php } ?>
		</div>
<?php
	includeFooter();
	die();
}

// Add server
//=================================================================================

if (@$_POST['act'] === 'addserver') {
	if (!$is_manager) die('access denied');
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
if ($is_manager) {
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
						<small><a href="//play.pokemonshowdown.com" target="_blank"><code>play.pokemonshowdown.com</code></a></small>
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
if ($is_manager) {
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
