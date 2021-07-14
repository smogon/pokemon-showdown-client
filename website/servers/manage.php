<?php

include_once './servers.lib.php';
// todo open servers list in panel?

if (!$users->isLeader()) {
	die("Access denied.");
}

$page = 'serveradmin';
$pageTitle = "Server Administration";

includeHeader();

?>
	<center><h1>Server Management</h1>
	<div class="ladder pad"><table>
	<tr><th>Search servers</th><th>Search server modlog</th>
	<th>Blacklist users from owning servers</th><th>Ban hosting methods</th>
	<tr><td style="vertical-align: top; max-width: 300px">
	<form action="/servers/manage.php" data-target="push">
		<label for="hostedby">Search by host:</label><br />
		<input type="text" name="hostedby" class="textbox" /><br /><br />
		<label for="ownedby">Search by owner:</label><br />
		<input type="text" name="ownedby" class="textbox" /><br /><br />
		<label for="lastactive">Search by inactivity since a date:</label><br />
		<input type="date" name="lastactive" class="textbox" /><br /><br />
		<button type="submit">Search</button>
	</form>
	</div>
	</td><td style="vertical-align: top; max-width: 300px">
	<form action="/servers/manage.php" data-target="push">
		<label for="serverid"> Search on a server:</label><br />
		<input type="text" name="serverid" class="textbox" /><br /><br />
		<label for="action">Search an action type:</label><br />
		<input type="text" name="action" class="textbox" /><br /><br />
		<label for="userid">Search for actions by a userid:</label><br />
		<input type="text" name="userid" class="textbox" /><br /><br />
		<button type="submit">Search</button>
	</form>
	</div></td><td style="vertical-align: top; max-width: 300px">
	<form action="/servers/manage.php" data-target="push">
		<label>(Separate userids with commas)</label><br />
		<input type="text" name="banowners" class="textbox" /><br /><br />
		<button type="submit">Add users to list</button>
	</form>
<?php

if (isset($_REQUEST['banowners'])) {
	echo('<br />');
	$banned = explode(',', $_REQUEST['banowners']);
	$successes = 0;
	foreach ($banned as $user) {
		$userid = $users->userid($user);
		if (!strlen($userid)) continue;
		if (!isset($serverinfo['blacklist'])) {
			$serverinfo['blacklist'] = [];
		}
		$failures = [];
		if (!in_array($userid, $serverinfo['blacklist'], true)) {
			$serverinfo['blacklist'][] = $userid;
			$successes += 1;
			$psdb->query(
				"INSERT INTO `{$psdb->prefix}usermodlog` (`userid`,`actorid`,`date`,`ip`,`entry`) VALUES (?, ?, ?, ?, ?)",
				[$userid, $curuser['userid'], time(), $users->getIp(), 'banned from owning servers']
			);
			foreach ($PokemonServers as $server) {
				if ($server['owner'] == $userid) {
					unset($PokemonServers[$server['id']]['owner']);
				}
				saveservers();
				$psdb->query(
					"INSERT INTO {$psdb->prefix}servermodlog (`serverid`, `actorid`, `date`, `ip`, `type`, `note`) VALUES (?, ?, ?, ?, ?, ?)",
					[$server['id'], $curuser['id'], time(), $users->getIp(), 'BANOWNER', '']
				);
			}
		} else {
			$failures[] = $userid;
		}
		writeserverinfo();
	}
	echo "<strong>{$successes} user (s) added to blacklist.</strong><br />";
	if (count($failures) > 0) {
		echo "(" . count($failures) . "user (s) could not be added: " . implode(", ", $failures) . ")<br />";
	}
}

echo '<br />';
if (isset($serverinfo['blacklist']) && count($serverinfo['blacklist'])) {
?>
	<hr />
	<form action="/servers/manage.php" data-target="push">
		<label>(Separate userids with commas)</label><br />
		<input type="text" name="unbanowners" class="textbox" /><br /><br />
		<button type="submit">Remove users from list</button>
	</form>
	<?php
}

if (isset($_REQUEST['unbanowners']) && isset($serverinfo['blacklist'])) {
	$unbans = explode(',', $_REQUEST['unbanowners']);
	if (count($unbans)) {
		$successes = [];
		$failures = [];
		foreach ($unbans as $userid) {
			$userid = $users->userid($userid);
			$idx = array_search($userid, $serverinfo['blacklist']);
			if ($idx) {
				$successes[] = $userid;
				array_splice($serverinfo['blacklist'], $idx);
			} else {
				$failures[] = $userid;
			}
		}
	}
	if (count($successes)) {
		echo(
			"<strong>" . count($successes) .
			" user (s) were removed from the blacklist.</strong>" .
			"<label>(" . implode(", ", $successes) . ")</label><br />"
		);
	}
	if (count($failures)) {
		echo(
			"<strong style=\"color:red\">" . count($failures) .
			"user (s) were not on the blacklist. </strong>" .
			" <label>(" . implode(', ', $failures) . ")</label><br />"
		);
	}
}
?>
	</div>
	</td> <td style="vertical-align: top; max-width: 300px">
	<form action="/servers/manage.php" data-target="push">
		<label>(Separate hosts with commas)</label><br />
		<input type="text" name="banhosts" class="textbox" /><br /><br />
		<button type="submit">Add hosts to list</button>
	</form>
	</div>
<?php

if (isset($_REQUEST['unbanhosts']) && strlen($_REQUEST['unbanhosts'])) {
	$hosts = explode(',', $_REQUEST['unbanhosts']);
	$successes = [];
	$failures = [];
	foreach ($hosts as $i=>$host) {
		$host = trim($host);
		if (!strlen($host)) continue;
		if (!isset($serverinfo['bannedhosts'])) {
			$serverinfo['bannedhosts'] = [];
		}
		if (!in_array($host, $serverinfo['bannedhosts'])) {
			$failures[] = $host;
		} else {
			$successes[] = $host;
			array_splice($serverinfo['bannedhosts'], $i);
		}
	}
	writeserverinfo();
	$scount = count($successes);
	$fcount = count($failures);
	echo 'Removed ' . $scount . ' host(s) from the blacklist. (' . implode(', ', $successes) . ')<br />';
	if ($fcount > 0) {
		echo 'Failed to remove ' . $fcount . ' host(s) from the blacklist. (' . implode(', ', $failures) . ')<br />';
	}
	echo '</div>';
}

?>
	<br /><hr />
	<form action="/servers/manage.php" data-target="push">
		<label>(Separate hosts with commas)</label><br />
		<input type="text" name="unbanhosts" class="textbox" /><br /><br />
		<button type="submit">Remove hosts from list</button>
	</form>
</td></tr>
</table></div></div>
<center>
<?php

if (isset($_REQUEST['ownedby']) || isset($_REQUEST['hostedby']) || isset($_REQUEST['lastactive'])) {
	$owner = isset($_REQUEST['ownedby']) && strlen($_REQUEST['ownedby']) ? $users->userid($_REQUEST['ownedby']) : NULL;
	$host = isset($_REQUEST['hostedby']) && strlen($_REQUEST['hostedby']) ? $_REQUEST['hostedby'] : NULL;
	$lastactive = isset($_REQUEST['lastactive']) && strlen($_REQUEST['lastactive']) ? strtotime($_REQUEST['lastactive']) : NULL;
	$results = [];
	echo("<br /><div class=\"infobox\" style=\"width:300px\">");
	if ($lastactive === false) {
		echo("<strong style=\"color:red\">Invalid time string.</strong><br />");
	}

	$searchMessage = $host ? " the host '" . $host . "'" : "";
	$searchMessage .= $owner ? ' and ' : '';
	$searchMessage .= $owner ? " the owner '" . $owner . "'" : "";
	$searchMessage .= strlen($searchMessage) ? " and" : "";
	$searchMessage .= $lastactive ? " inactivity since before " . date("Y-m-d", $lastactive) : "";

	echo("<details><summary>Servers with " . $searchMessage . ": </summary>");
	foreach ($PokemonServers as $server) {
		if ($host && strpos($server['server'], $host)) {
			$results[] = $server;
		}
		if ($owner &&
			(strpos($server['owner'], ',') ? strpos($server['owner'], $owner) : $users->userid($server['owner']) === $owner)
		) {
			$results[] = $server;
		}
		if ($lastactive && (!isset($server['date']) || $lastactive > $server['date'])) {
			$results[] = $server;
		}
	 }

	if (!count($results)) {
		echo("No matching servers found.");
	} else {
		foreach ($results as $server) {
			echo('- ' . $server['name']);
			if ($server['owner']) {
				echo(" (owned by: " . $server['owner'] . ")");
			}
			echo("[" . $server['server'] . "]<br />");
		}
	}
	echo('</details></div>');
}

if (
	isset($_REQUEST['serverid']) || isset($_REQUEST['action']) ||
	isset($_REQUEST['userid'])
) {
	echo '<br /><details><summary>';
	echo 'Modlog search results:</summary>';
	$queryString = "SELECT * FROM {$psdb->prefix}servermodlog ";
	$hasWhere = false;
	$params = [];
	if (isset($_REQUEST['serverid'])) {
		$serverid = $users->userid($_REQUEST['serverid']);
		if (strlen($serverid)) {
			$queryString .= " WHERE serverid = ? ";
			$hasWhere = true;
			$params[] = $serverid;
		}
	}

	if (isset($_REQUEST['action'])) {
		$action = strtoupper($users->userid($_REQUEST['action']));
		if (strlen($action)) {
			if (!$hasWhere) {
				$queryString .= " WHERE ";
				$hasWhere = true;
			} else {
				$queryString .= " AND ";
			}
			$queryString .= "type = ? ";
			$params[] = $action;
		}
	}

	if (isset($_REQUEST['userid'])) {
		$userid = $users->userid($_REQUEST['userid']);
		if (strlen($userid)) {
			if (!$hasWhere) {
				$queryString .= " WHERE ";
				$hasWhere = true;
			} else {
				$queryString .= " AND ";
			}
			$queryString .= " actorid = ? ";
			$params[] = $userid;
		}
	}

	$res = $psdb->query($queryString, $params);
	if ($res === false) {
		die('Error in DB search query, try again later. (' . $psdb->error() . ')');
	} else {
		$rows = $res->fetchAll();
	}
	if (count($rows) < 1) {
		echo('No results found.');
	} else {
		foreach ($rows as $row) {
			echo(
				"<div>[" . date('F j Y, g:i a', $row['date']) .
				"] " . strtoupper($row['type']) . ": " . $row['note'] .
				" (by " . $row['actorid'] . ")</div>"
			);
		}
	}
	echo '</div>';
}

if (isset($serverinfo['blacklist']) && count($serverinfo['blacklist']) > 0) {
	echo('<details><summary><strong>Users blacklisted from owning servers</strong></summary>');
	foreach ($serverinfo['blacklist'] as $userid) {
		$owned = [];
		foreach ($PokemonServers as $server) {
			if (!isset($server['owner'])) {
				continue;
			}
			$owners = explode(',', $server['owner']);
			foreach ($owners as $ownerName) {
				if ($userid === $users->userid($ownerName)) {
					$owned[] = $server['name'];
					break;
				}
			}
		}
		$ownedMessage = count($owned) ?
			"<small>(owner in " . count($owned) . " servers: " . implode(", ", $owned) . ")</small>" :
			"";

		echo($userid . " " . $ownedMessage);
	}

	echo('</details></div><br />');
}

if (isset($serverinfo['bannedhosts']) && count($serverinfo['bannedhosts']) > 0) {
	?>
		<details><summary><strong>Banned server hosting methods:</strong></summary>
	<?php
	foreach ($serverinfo['bannedhosts'] as $host) {
		?>- <?=htmlspecialchars($host)?><?php
		$using = [];
		foreach ($PokemonServers as $server) {
			if (strpos($server['server'], $host) > -1) {
				$using[] = $server['name'];
			}
		}
		$totalCount = count($using);
		if ($totalCount > 0) {
			echo("<label> (" . $totalCount . " server(s) using this host: " . implode(', ', $using) . ")</label>");
		}
		echo('<br />');
	}
	echo('</details>');
}
echo '</center>';

includeFooter();
?>
