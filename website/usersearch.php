<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

include_once __DIR__ . '/../config/config.inc.php';
include '../lib/ntbb-session.lib.php';
include '../lib/ntbb-ladder.lib.php';
include 'lib/panels.lib.php';

$userid = false;
$user = false;

$ip = @$_REQUEST['ip'];
$entry = @$_REQUEST['entry'];
$userlist = null;

if (!$users->isLeader()) {
	die("access denied");
}

$panels->setPageTitle('User search');
$panels->setPageDescription('User search');
$panels->setTab('ladder');
$panels->start();

$STANDINGS = $psconfig['standings'];

if (!$ip && !$entry) {
?>
	<div class="pfx-panel"><div class="pfx-body ladderlist">
		<h1>
			Find users by IP
		</h1>
		<form action="/usersearch/" data-target="push">
			<input type="text" name="ip" placeholder="IP address" autofocus />
			<button type="submit">Go</button>
		</form>
		<h2>
			Find users by entry
		</h2>
		<form action="/usersearch/" data-target="push">
			<input type="text" name="entry" placeholder="Modlog entry note" />
			<button type="submit">Go</button>
		</form>
	</div></div>
<?php
} else if ($ip) {
?>
	<div class="pfx-panel"><div class="pfx-body ladder">
		<a href="/ladder/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Ladder</a>
		<h1><?php echo htmlspecialchars($ip); ?></h1>

<?php

	$csrfOk = false;
	if ($users->csrfCheck()) {
		$csrfOk = true;
	}
	if (substr($ip, -1) === "*") { // ip range
		$ip = substr($ip, 0, -1) . '%';
		$userlist = $psdb->query("SELECT `username`, `userid`, `banstate` FROM `ntbb_users` WHERE `ip` LIKE ?", [$ip]);
	} else {
		$userlist = $psdb->query("SELECT `username`, `userid`, `banstate` FROM `ntbb_users` WHERE `ip` = ?", [$ip]);
	}
	if ($csrfOk && isset($_POST['standing'])) {
		$newStanding = intval($_POST['standing']);
		$psdb->query("UPDATE ntbb_users SET banstate = ? WHERE ip = ? AND banstate != 100", [$newStanding, $ip]);

		foreach ($userlist as $row) {
			$modlogentry = "Standing changed to $newStanding ({$STANDINGS[$newStanding]}): {$_POST['allreason']}";
			$psdb->query(
				"INSERT INTO `{$psdb->prefix}usermodlog` (`userid`,`actorid`,`date`,`ip`,`entry`) VALUES (?, ?, ?, ?, ?)",
				[$row['userid'], $curuser['userid'], time(), $users->getIp(), $modlogentry]
			);
		}

?>
		<div style="border: 1px solid #DDAA88; padding: 0 1em; margin-bottom: 1em">
			<p>Standing updated</p>
		</div>
<?php
	}
?>
		<form action="" method="post" data-target="replace"><p>
			<?php $users->csrfData(); ?>
			<input type="hidden" name="ip" value="<?= htmlspecialchars($ip) ?>" />
			<strong class="label"><label>Change all standings (except disabled) to: </label></strong><br />
<select name="standing" class="textbox"><?php
	$userstanding = 20;
	// standings:
	$userstandingshown = false;
	foreach ($STANDINGS as $standing => $name) {
		if (!$userstandingshown && (!$name || $userstanding < $standing)) {
			echo '<option value="',$userstanding,'" selected>',$userstanding,'</option>';
			$userstandingshown = true;
		}
		if ($name) {
			echo '<option value="',$standing,'"',($userstanding==$standing?' selected':''),'>',$standing,' = ',$name,'</option>';
			if ($userstanding == $standing) $userstandingshown = true;
		}

	}
?></select> <input name="allreason" type="text" class="textbox" size="46" placeholder="Reason" /> <button type="submit"><strong>Change All</strong></button>
		</p></form>
		<div class="ladder"><table>
<?php
	foreach ($userlist as $row) {
?>
			<tr>
				<td><a data-target="push" href="/users/<?= $row['userid'] ?>"><?= htmlspecialchars($row['username']) ?></a></td>
				<td><small><?= htmlspecialchars($row['banstate'].' = '.$STANDINGS[$row['banstate']]) ?></small></td>
			</tr>
<?php
	}
?>
		</table></div>
		<p>Login IP Matches</p>
		<div class="ladder"><table>
<?php
	$loginlist = $psdb->query("SELECT `username`, `userid`, `ip`, `banstate` FROM `ntbb_users` WHERE `loginip` = ?", [$ip]);
	foreach ($loginlist as $row) {
		if ($row['ip'] != $ip) {
?>
			<tr>
				<td><a data-target="push" href="/users/<?= $row['userid'] ?>"><?= htmlspecialchars($row['username']) ?></a></td>
				<td><small><?= htmlspecialchars($row['banstate'].' = '.$STANDINGS[$row['banstate']]) ?></small></td>
				<td><a href="https://whatismyipaddress.com/ip/<?php echo $row['ip'] ?>" target="_blank"><?php echo $row['ip'] ?></a> (<a href="/usersearch/?ip=<?php echo $row['ip'] ?>" data-target="push">Alts</a>)</td>
			</tr>
<?php
		}
	}
?>
		</table></div>
		<p>Usermodlog entries</p>
		<div class="ladder"><table>
<?php
	$usermodlog = $psdb->query("SELECT * FROM `ntbb_usermodlog` WHERE `ip` = '".$psdb->escape($ip)."'");
	while ($row = $psdb->fetch_assoc($usermodlog)) {
		$entry = $row['entry'];
		$fromindex = strpos($entry, " from: ");
		if ($fromindex !== false) $entry = substr($entry, 0, $fromindex);
		if ($row['actorid'] !== $row['userid']) {
			if (!$row['actorid']) {
				$entry .= ' (while logged out)';
			} else {
				$entry .= ' (by ' . $row['actorid'] . ')';
			}
		}
?>
			<tr>
				<td><a data-target="push" href="/users/<?= $row['userid'] ?>"><?= htmlspecialchars($row['userid']) ?></a></td>
				<td><small>[<?= date("M j, Y, g:ia", $row['date']); ?>] [<a href="https://whatismyipaddress.com/ip/<?= $row['ip'] ?>" target="_blank"><?= $row['ip'] ?></a>]<br /><?= htmlspecialchars($entry) ?></small></td>
			</tr>
<?php
	}
?>
		</table></div>

	</div></div>
<?php
} else {
?>
	<div class="pfx-panel"><div class="pfx-body ladder">
		<a href="/ladder/" class="pfx-backbutton" data-target="back"><i class="fa fa-chevron-left"></i> Ladder</a>
		<h1><?php echo htmlspecialchars($ip); ?></h1>

<?php
	$csrfOk = false;
	if ($users->csrfCheck()) {
		$csrfOk = true;
	}

	$entry = '%' . str_replace('_', '\\_', str_replace('%', '\\%', $entry)) . '%';
	$userlist = $psdb->query("SELECT `ntbb_users`.`username`, `ntbb_users`.`userid`, `ntbb_users`.`banstate` FROM `ntbb_users` INNER JOIN `ntbb_usermodlog` ON `ntbb_users`.`userid` = `ntbb_usermodlog`.`userid` WHERE `entry` LIKE ?", [$entry]);
	if ($csrfOk && isset($_POST['standing'])) {
		$newStanding = intval($_POST['standing']);

		$psdb->query(
			"UPDATE {$psdb->prefix}users, {$psdb->prefix}usermodlog " +
			"INNER JOIN {$psdb->prefix}usermodlog ON {$psdb->prefix}usermodlog.userid = {$psdb->prefix}users.userid " +
			"SET {$psdb->prefix}users.banstate = ? WHERE {$psdb->prefix}usermodlog.entry LIKE ? AND banstate != 100",
			[$newStanding, $entry]
		);

		foreach ($userlist as $row) {
			$modlogentry = "Standing changed to $newStanding ({$STANDINGS[$newStanding]}): {$_POST['allreason']}";
			$psdb->query(
				"INSERT INTO `{$psdb->prefix}usermodlog` (`userid`,`actorid`,`date`,`ip`,`entry`) VALUES (?, ?, ?, ?, ?)",
				[$row['userid'], $curuser['userid'], time(), $users->getIp(), $modlogentry]
			);
		}

?>
		<div style="border: 1px solid #DDAA88; padding: 0 1em; margin-bottom: 1em">
			<p>Standing updated</p>
		</div>
<?php
	}
?>
		<form action="" method="post" data-target="replace"><p>
			<?php $users->csrfData(); ?>
			<input type="hidden" name="entry" value="<?= htmlspecialchars(@$_REQUEST['entry']) ?>" />
			<strong class="label"><label>Change all standings (except disabled) to: </label></strong><br />
<select name="standing" class="textbox"><?php
	$userstanding = 20;
	// standings:
	$userstandingshown = false;
	foreach ($STANDINGS as $standing => $name) {
		if (!$userstandingshown && (!$name || $userstanding < $standing)) {
			echo '<option value="',$userstanding,'" selected>',$userstanding,'</option>';
			$userstandingshown = true;
		}
		if ($name) {
			echo '<option value="',$standing,'"',($userstanding==$standing?' selected':''),'>',$standing,' = ',$name,'</option>';
			if ($userstanding == $standing) $userstandingshown = true;
		}

	}
?></select> <input name="allreason" type="text" class="textbox" size="46" placeholder="Reason" /> <button type="submit"><strong>Change All</strong></button>
		</p></form>
		<div class="ladder"><table>
<?php
	foreach ($userlist as $row) {
?>
			<tr>
				<td><a data-target="push" href="/users/<?= $row['userid'] ?>"><?= htmlspecialchars($row['username']) ?></a></td>
				<td><small><?= htmlspecialchars($row['banstate'].' = '.$STANDINGS[$row['banstate']]) ?></small></td>
			</tr>
<?php
	}
?>
		</table></div>
<?php
}
$panels->end();
?>
