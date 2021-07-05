<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

include_once __DIR__ . '/../config/config.inc.php';
include __DIR__ . '/../lib/ntbb-session.lib.php';
include __DIR__ . '/../lib/ntbb-ladder.lib.php';
include __DIR__ . '/lib/panels.lib.php';

// From https://emailregex.com/
$EMAIL_REGEX = '/(?:[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i';

$lowerstaff = $curuser['group'] == 4 || $curuser['group'] == 5;
$upperstaff = $users->isLeader();

if (!($lowerstaff || $upperstaff)) {
	die("access denied");
}

$userid = false;
$user = false;

if ($_REQUEST['user'] ?? null) {
	$userid = $users->userid($_REQUEST['user']);

	if (!$userid) {
		header('HTTP/1.1 404 Not Found');
		die("Invalid userid");
	}

	$user = $users->getUser($userid);

	if (substr($_SERVER['REQUEST_URI'], 0, 13) === '/users/?user=') {
		// really wish this could be done with mod_rewrite
		header('Location: http://' . $psconfig['routes']['users'] . '/' .$userid);
		die();
	}

	if (!$user || $user['banstate'] == 100) {
		if ($panels->output !== 'html') header('HTTP/1.1 404 Not Found');
	}
}

if (isset($_REQUEST['json'])) {
	header('Content-type: application/json');
	$ratings = [];
	foreach ($user['ratings'] as $rating) {
		$ratings[$rating['formatid']] = [
			'elo' => $rating['acre'],
			'gxe' => $rating['gxe'],
			'rpr' => $rating['rpr'],
			'rprd' => $rating['rprd'],
		];
	}
	echo json_encode([
		'username' => $user['username'],
		'userid' => $user['userid'],
		'registertime' => intval(@$user['registertime']),
		'group' => intval($user['group']),
		'ratings' => $ratings,
	], JSON_FORCE_OBJECT);
	die();
}

if (!$user) {
	$panels->setPageTitle('Usermodlog');
	$panels->setPageDescription('Usermodlog');
} else {
	$panels->setPageTitle(''.$user['username'].' - Usermodlog');
	$panels->setPageDescription(''.$user['username'].'\'s usermodlog');
}
$panels->setTab('ladder');
$panels->start();

if (!$userid) {
?>
	<div class="pfx-panel"><div class="pfx-body ladderlist">
		<h1>
			Find a user
		</h1>
		<form action="/users/" data-target="push">
			<input type="text" name="user" placeholder="Username" autofocus />
			<button type="submit">Go</button>
		</form>
	</div></div>
<?php
} else if (!$user) {
?>
	<div class="pfx-panel"><div class="pfx-body ladder">
		<a href="/users/<?php echo $userid; ?>" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> User</a>
		<h1><?php echo htmlspecialchars($userid); ?></h1>
		<h2>
			Unregistered
		</h2>
		<p>
			This user is unregistered and has no modlog.
		</p>
	</div></div>
<?php
} else {
?>
	<div class="pfx-panel"><div class="pfx-body ladder">
		<a href="/users/<?php echo $userid; ?>" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> User</a>
		<h1><?php echo htmlspecialchars($user['username']); ?></h1>

<?php
if ($upperstaff) {
?>
		<h2>Recent activity</h2>

<?php
	if ($user['logintime'] ?? 0) {
?>
			<p><small>[<?= date("M j, Y, g:ia", $user['logintime']); ?>] [<a href="https://whatismyipaddress.com/ip/<?= $user['loginip'] ?>" target="_blank"><?= $user['loginip'] ?></a>]</small> Last logged in</p>
<?php
	} else if ($user['banstate'] == -10) {
		echo '<p>Autoconfirmed: Has played at least one battle since 2014, so last login is probably sometime in 2014-2015</p>';
	} else if ($user['banstate'] == 0) {
		echo '<p>Not autoconfirmed: Last login was probably sometime in ' . date("Y", $user['registertime']) . '</p>';
	} else {
		echo '<p>Custom standing: An upper staff member has changed this user\'s standing in the past</p>';
	}
?>

		<p>
			<strong>Current login sessions</strong> (logins expire after 2 weeks or when you click "log out", whichever comes first)
		</p>

<?php
	$res = $psdb->query("SELECT `time`,`ip` FROM ntbb_sessions WHERE userid = '".$psdb->escape($user['userid'])."'");
	// $sessions = $psdb->fetch($res);
	if ($user['outdatedpassword']) echo '<p>&#x2713; Abandoned account: Most recent login was before April 2013</p>';
	$atLeastOne = false;
	while ($session = $psdb->fetch_assoc($res)) {
		// var_export($session);
		// echo '<p style="font-size:8pt;margin:4px 0">[' . date("M j, Y", $session['time']) . '] Logged in from ' . $session['ip'] . '</p>';
?>
			<p><small>[<?= date("M j, Y, g:ia", $session['time']); ?>] [<a href="https://whatismyipaddress.com/ip/<?= $session['ip'] ?>" target="_blank"><?= $session['ip'] ?></a>]</small> Currently logged in</p>
<?php
		$atLeastOne = true;
	}
	if (!$atLeastOne && !$user['outdatedpassword']) {
		echo '<p>(None)</p>';
	}
}
?>

		<h2>Modlog</h2>
			<p><small>[<?= date("M j, Y, g:ia", $user['registertime']); ?>] <?php if ($upperstaff) echo '[<a href="https://whatismyipaddress.com/ip/'.$user['ip'].'" target="_blank">'.$user['ip'].'</a>]' ?></small> Account created</p>
<?php

	$usermodlog = $psdb->query("SELECT * FROM `ntbb_usermodlog` WHERE `userid` = '".$psdb->escape($userid)."'");
	while ($row = $psdb->fetch_assoc($usermodlog)) {
		$entry = $row['entry'];
		$fromindex = strpos($entry, " from: ");
		if ($fromindex !== false) $entry = substr($entry, 0, $fromindex);

		if (!$upperstaff) {
			// Hide email addresses from lowerstaff
			$entry = preg_replace($EMAIL_REGEX, "[email address hidden]", $entry);
		}

		if ($row['actorid'] !== $userid) {
			if (!$row['actorid']) {
				$entry .= ' (while logged out)';
			} else {
				$entry .= ' (by ' . $row['actorid'] . ')';
			}
		}
?>
			<p><small>[<?= date("M j, Y, g:ia", $row['date']); ?>] <?php if ($upperstaff) echo '[<a href="https://whatismyipaddress.com/ip/'.$row['ip'].'" target="_blank">'.$row['ip'].'</a>]' ?></small> <?= htmlspecialchars($entry) ?></p>
<?php
	}
?>

	</div></div>
<?php
}
$panels->end();
?>
