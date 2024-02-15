<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

require_once __DIR__ . '/../config/config.inc.php';
require_once __DIR__ . '/theme/panels.lib.php';

$id = $_REQUEST['name'] ?? '';
$password = '';

if (!$id) {
	include '404.php';
	die();
}
$manage = false;
$csrfOk = false;

// this no longer needs to be in an if block, since the only reason to access
// this at /manage is for managing. just assume they're always doing that
require_once '../lib/ntbb-session.lib.php';
if (!$users->isLeader()) die("access denied");
$csrfOk = !!$users->csrfCheck();
$manage = true;
header('Cache-Control: max-age=0, no-cache, no-store, must-revalidate');

if (preg_match('/[^A-Za-z0-9-]/', $id)) die("access denied");

$fullid = $id;
if (substr($id, -2) === 'pw') {
	$dashpos = strrpos($id, '-');
	$password = substr($id, $dashpos + 1, -2);
	$id = substr($id, 0, $dashpos);
	// die($id . ' ' . $password);
}

$replay = null;
$cached = false;

// $forcecache = isset($_REQUEST['forcecache8723']);
$forcecache = false;

if (file_exists('caches/' . $id . '.inc.php')) {
	include 'caches/' . $id . '.inc.php';
	$replay['formatid'] = '';
	$cached = true;
} else {
	require_once 'replays.lib.php';
	if (!$Replays->db && !$forcecache) {
		include '503.php';
		die();
	}
	$replay = $Replays->get($id, $forcecache);
}
if (!$replay || (@$replay['private'] === 3 && !$manage)) {
	include '404.php';
	die();
}
$fullid = $id . (@$replay['password'] ? '-' . $replay['password'] . 'pw' : '');

if (@$replay['private']) {
	header('X-Robots-Tag: noindex');
}
if (@$replay['password']) {
	if (!$password && !$manage) {
		header('Cache-Control: max-age=0, no-cache, no-store, must-revalidate');
		require_once '../lib/ntbb-session.lib.php';
		if ($curuser['userid'] !== $p1id && $curuser['userid'] !== $p2id) {
			die("Access denied (you must be logged into " . $p1id . " or " . $p2id . ")");
		}
		$url = '/' . $id . '-' . $replay['password'] . 'pw';
		echo '<p>This private replay now has a new harder-to-guess URL:</p>';
		echo '<p><a href="' . $url . '" data-target="replace">https://' . $psconfig['routes']['replays'] . $url . '</a></p>';
		die();
	}
	if ($password !== $replay['password'] && !$manage) {
		die("Access denied (please ask " . $p1id . " or " . $p2id . " for the password)");
	}
}

if ($forcecache) {
	file_put_contents('caches/' . $id . '.inc.php', '<?php $replay = ' . var_export($replay, true) . ';');
}

function userid($username) {
	if (!$username) $username = '';
	$username = strtr($username, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz");
	return preg_replace('/[^A-Za-z0-9]+/','',$username);
}

$replay['log'] = str_replace("\r","",$replay['log']);

// $matchSuccess = preg_match('/\\|player\\|p1\\|([^|]*)(\\|[^|]*)?\\n\\|player\\|p2\\|([^|]+)(\\|[^|]*)?\\n(\\|gametype\\|[^|]*\\n)?\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
$matchSuccess = preg_match('/\\n\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
$format = $replay['format'];
if ($matchSuccess) $format = $matches[1];
$p1 = $replay['players'][0];
$p2 = $replay['players'][1];
$p1id = $users->userid($p1);
$p2id = $users->userid($p2);

$panels->setPageTitle($format.' replay: '.$p1.' vs. '.$p2);
$panels->setPageDescription('Watch a replay of a Pokémon battle between ' . $p1 . ' and ' . $p2 . ' (' . $format . ')');
$panels->setTab('replay');
$panels->start();

?>
	<div class="pfx-panel"><div class="pfx-body" style="max-width:1180px">
		<div class="wrapper replay-wrapper">

			<div class="battle"><div class="playbutton"><button disabled>Loading...</button></div></div>
			<div class="battle-log"></div>
			<div class="replay-controls">
				<button data-action="start"><i class="fa fa-play"></i> Play</button>
			</div>
			<div class="replay-controls-2">
				<div class="chooser leftchooser speedchooser">
					<em>Speed:</em>
					<div><button value="hyperfast">Hyperfast</button><button value="fast">Fast</button><button value="normal" class="sel">Normal</button><button value="slow">Slow</button><button value="reallyslow">Really Slow</button></div>
				</div>
				<div class="chooser colorchooser">
					<em>Color&nbsp;scheme:</em>
					<div><button class="sel" value="light">Light</button><button value="dark">Dark</button></div>
				</div>
				<div class="chooser soundchooser" style="display:none">
					<em>Music:</em>
					<div><button class="sel" value="on">On</button><button value="off">Off</button></div>
				</div>
			</div>
			<!--[if lte IE 8]>
				<div class="error"><p>&#3232;_&#3232; <strong>You're using an old version of Internet Explorer.</strong></p>
				<p>We use some transparent backgrounds, rounded corners, and other effects that your old version of IE doesn't support.</p>
				<p>Please install <em>one</em> of these: <a href="http://www.google.com/chrome">Chrome</a> | <a href="http://www.mozilla.org/en-US/firefox/">Firefox</a> | <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home">Internet Explorer 9</a></p></div>
			<![endif]-->

			<?php if (@$replay['private']) echo '<strong>THIS REPLAY IS PRIVATE</strong> - make sure you have the owner\'s permission to share<br />'; ?>

			<pre class="urlbox" style="word-wrap: break-word;"><?php echo htmlspecialchars('https://'.$psconfig['routes']['replays'].'/'.$fullid); ?></pre>

			<h1 style="font-weight:normal;text-align:left"><strong><?= htmlspecialchars($format) ?></strong>: <a href="//<?= $psconfig['routes']['users'] ?>/<?= userid($p1) ?>" class="subtle"><?= htmlspecialchars($p1) ?></a> vs. <a href="//<?= $psconfig['routes']['users'] ?>/<?= userid($p2) ?>" class="subtle"><?= htmlspecialchars($p2) ?></a></h1>
			<p style="padding:0 1em;margin-top:0">
				<small class="uploaddate" data-timestamp="<?= @$replay['uploadtime'] ?? @$replay['date'] ?>"><em>Uploaded:</em> <?php echo date("M j, Y", @$replay['uploadtime'] ?? @$replay['date']); ?><?= @$replay['rating'] ? ' | <em>Rating:</em> ' . $replay['rating'] : '' ?></small>
			</p>

			<div id="loopcount"></div>
<?php
if ($manage) {
	if ($csrfOk && isset($_POST['private'])) {
		$replay['private'] = intval($_POST['private']);
		$Replays->edit($replay);
		echo '<p>Edited.</p>';
	} else {
		echo '<p>Editing privacy to '.$_POST['private']. 'failed. ';
	}
?>
			Change privacy: <form action="/<?= $replay['id'] ?>/manage" method="post" style="display: inline" data-target="replace">
				<?php $users->csrfData(); ?>
				<input type="hidden" name="private" value="3" />
				<button type="submit" name="private" value="3"<?= @$replay['private'] === 3 ? ' disabled' : '' ?>>Deleted</button>
			</form>
			<form action="/<?= $replay['id'] ?>/manage" method="post" style="display: inline" data-target="replace">
				<?php $users->csrfData(); ?>
				<input type="hidden" name="private" value="1" />
				<button type="submit" name="private" value="1"<?= @$replay['private'] === 1 && $replay['password'] ? ' disabled' : '' ?>>Private</button>
			</form>
			<form action="/<?= $replay['id'] ?>/manage" method="post" style="display: inline" data-target="replace">
				<?php $users->csrfData(); ?>
				<input type="hidden" name="private" value="2" />
				<button type="submit" name="private" value="2"<?= @$replay['private'] === 1 && !$replay['password'] ? ' disabled' : '' ?>>Private (no password)</button>
			</form>
			<form action="/<?= $replay['id'] ?>/manage" method="post" style="display: inline" data-target="replace">
				<?php $users->csrfData(); ?>
				<input type="hidden" name="private" value="0" />
				<button type="submit" name="private" value="0"<?= !@$replay['private'] ? ' disabled' : '' ?>>Public</button>
			</form>
<?php
}
?>
		</div>

		<input type="hidden" name="replayid" value="<?php echo htmlspecialchars($replay['id']); ?>" />
		<!--

You can get this log directly at https://<?php echo $psconfig['routes']['replays']; ?>/<?php echo $replay['id']; ?>.log

Or with metadata at https://<?php echo $psconfig['routes']['replays']; ?>/<?php echo $replay['id']; ?>.json

Most PS pages you'd want to scrape will have a .json version!

		-->
		<script type="text/plain" class="log"><?php if ($replay['id'] === 'smogtours-ou-509') readfile('js/smogtours-ou-509.log'); else if ($replay['id'] === 'ou-305002749') readfile('js/ou-305002749.log'); else echo str_replace('/','\\/',$replay['log']); ?></script>
<?php
if (substr($replay['formatid'], -12) === 'randombattle' || substr($replay['formatid'], -19) === 'randomdoublesbattle' || $replay['formatid'] === 'gen7challengecup' || $replay['formatid'] === 'gen7challengecup1v1' || $replay['formatid'] === 'gen7battlefactory' || $replay['formatid'] === 'gen7bssfactory' || $replay['formatid'] === 'gen7hackmonscup' || $manage) {
?>

		<script type="text/plain" class="inputlog"><?php echo str_replace('</','<\\/',$replay['inputlog']); ?></script>
<?php
}
?>

<?php
if ($panels->output === 'normal') {
?>
<div><script>
google_ad_client = "ca-pub-6535472412829264";
/* PS replay */
google_ad_slot = "6865298132";
google_ad_width = 728;
google_ad_height = 90;
</script>
<script src="//pagead2.googlesyndication.com/pagead/show_ads.js"></script>
</div>
<?php
}
?>

		<a href="/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> <?= $cached ? 'Other' : 'More' ?> replays</a>

	</div></div>
<?php

$panels->end();

?>
