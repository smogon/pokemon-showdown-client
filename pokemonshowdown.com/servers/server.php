<?php

include_once 'servers.lib.php';
include '../style/wrapper.inc.php';

$id = '';
$entry = null;

if (!empty($_GET['id'])) {
	$id = $users->userid($_GET['id']);
	$entry = $PokemonServers[$id] ?? null;
	if (!$entry) {
		header('HTTP/1.1 404 Not Found');
		die(isset($_REQUEST['json']) ? 'null' : '404 Not Found');
	}
}

$page = 'servers';
$pageTitle = "Servers";

$success = false;

// Single server view
//=================================================================================

if (isset($_REQUEST['json'])) {
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	if (!$entry) die('null');
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

if (!$entry) {
	die("server not found");
}

$is_owner = $users->isLeader();
if (!@$entry['banned'] && strpos(','.@$entry['owner'].',', ','.$curuser['userid'].',') !== false) {
	$is_owner = true;
}

if (@$_POST['act'] === 'editserver') {
	if (!$is_owner) die('access denied');
	if (!$users->csrfCheck()) die('invalid data, please retry');

	$id = $entry['id'];
	$loc = trim($_POST['loc'] ?? '');
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
				<a href="/servers/">&laquo; Back to server list</a>
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
				<small><a href="//<?= $psconfig['routes']['client'] ?>" target="_blank"><code><?= $psconfig['routes']['client'] ?></code></a></small>
<?php } else { ?>
				<small><a href="http://<?= $entry['id'] ?>.psim.us" target="_blank"><code><?= $entry['id'] ?>.psim.us</code></a></small>
<?php } ?>
			</p>
<?php if (@$entry['owner']) { ?><p>Owner: <?= htmlspecialchars($entry['owner']); ?></p><?php } ?>
<?php if ($entry['id'] !== 'showdown' && $is_owner) { ?>
			<p id="editserverbutton">
				<button onclick="document.getElementById('editserver').style.display = 'block';document.getElementById('editserverbutton').style.display = 'none';return false">Edit server</button> <button onclick="document.location.href = ('http://<?= $psconfig['routes']['client'] ?>/customcss.php?server=<?= $entry['id'] ?>&amp;invalidate')">Reload custom CSS</button>
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
			<?php if ($users->isLeader()) { ?><form method="post">
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
