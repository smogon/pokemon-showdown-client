<?php
include_once 'style/wrapper.inc.php';
include_once __DIR__ . '/../lib/ntbb-database.lib.php';

$startDate = 0;
$endDate = time() * 1000;
if (isset($_REQUEST['startDate']) && (int)$_REQUEST['endDate'] < $endDate) {
	$startDate = (int)$_REQUEST['startDate'];
}
if (isset($_REQUEST['endDate']) && (int)$_REQUEST['endDate'] > $startDate) {
	$endDate = (int)$_REQUEST['endDate'];
}

function printResultSet($res) {
	global $psdb;

	echo '[{"label": "Pok&eacute;mon Showdown", "data": [';
	$row = $psdb->fetch_assoc($res);
	$po = false;
	$last = 0;
	while (true) {
		$value = (int)($row['date'] / 1000);
		$delta = $value - $last;
		$last = $value;
		echo '[' . $delta . ',' . $row['usercount'] . ']';
		if ($row = $psdb->fetch_assoc($res)) {
			if (!$po && ($row['programid'] !== 'showdown')) {
				echo ']}, {"label": "Pok&eacute;mon Online (<a target=\"_blank\" href=\"https://gist.github.com/cathyjf/5456648\">src</a>)", "data": [';
				$last = 0;
				$po = true;
			} else {
				echo ',';
			}
		} else {
			break;
		}
	}
	echo ']}]';
}

function printRecentResults() {
	global $psdb;
	$res = $psdb->query(
		"SELECT `date`, `usercount`, `programid` " .
		"FROM `ntbb_userstatshistory` " .
		"WHERE (`date` > (UNIX_TIMESTAMP() - 60*60*24*3) * 1000) " .
		"ORDER BY `programid` ASC, `date` ASC");
	printResultSet($res);
}

function printJsonResults($startDate, $endDate) {
	global $psdb;

	$maxResults = 1000;
	// This should be approximately
	//   ((date of last stat) - (date of first stat)) / $maxResults
	$intervalLimit = 1000 * 60 * 60;
	$interval = (int)(($endDate - $startDate) / $maxResults);
	if ($interval > $intervalLimit) {
		$interval = $intervalLimit;
	}
	$res = $psdb->query(
		"SELECT `date`, `usercount`, `programid` " .
		"FROM `ntbb_userstatshistory` " .
		"WHERE `date` BETWEEN " . (int)$startDate . " AND " . (int)$endDate . " " .
		"GROUP BY FLOOR(`date`/" . $interval . "), `programid` " .
		"ORDER BY `programid` ASC, `date` ASC"
	);
	printResultSet($res);
}

if (isset($_REQUEST['format']) && ($_REQUEST['format'] === 'json')) {
	header('Content-Type: application/json');
	printJsonResults($startDate, $endDate);
	exit();
}

$res = $psdb->query(
	'SELECT `date`, `usercount` ' .
	'FROM `ntbb_userstatshistory` ' .
	'WHERE `programid`=\'showdown\' ' .
	'ORDER BY `usercount` DESC ' .
	'LIMIT 1');

$maxUsers = null;
if ($res) {
	$maxUsers = $psdb->fetch_assoc($res);
}

$page = 'userstats';
$pageTitle = "User stats";

includeHeaderTop();
?>
<meta name="description" content="View user statistics about Pok&eacute;mon Showdown, the most popular Pok&eacute;mon battle simulator!" />
<style>
table, tr, td {
	border: 0;
}
.hidden-content {
	display: none;
}
</style>
<?php
includeHeaderBottom();
?>
		<div class="main">

			<div id="loading">
				Loading... <noscript><p><strong>This requires JavaScript!</strong></p></noscript>
			</div>
			<table style="width: 800px;">
				<tr>
					<td>
						<p class="hidden-content" style="width: 630px;">
							This graph shows the number of users on the official server. By default, the last 3 days are shown.
							The most users ever recorded online at once was <?php echo (int)$maxUsers['usercount'] ?> users on <span id="maxusersdate"></span>.
							Times are displayed as UTC<span id="timezone"></span>, which is probably your local timezone.
						</p>
					</td>
					<td id="legend">
					</td>
				</tr>
			</table>
			<div id="userstats" style="width: 800px; height: 300px;"></div>
			<p class="hidden-content">Click and drag a section of the overview below to view an arbitrary time period:</p>
			<div id="overview" style="width: 800px; height: 100px;"></div>

			<script>
			var Config = {
				stats: <?php printJsonResults($startDate, $endDate) ?>,
				subset: <?php
					if (!isset($_REQUEST['startDate']) && !isset($_REQUEST['endDate'])) {
						printRecentResults();
					} else {
						echo 'null';
					}
				?>,
				maxUsersDate: <?php echo (int)$maxUsers['date'] ?>
			};
			</script>
			<script src="js/jquery-1.9.1.min.js"></script>
			<script src="js/jquery.flot.js"></script>
			<script src="js/jquery.flot.selection.js"></script>
			<script src="js/userstats.js?v8"></script>
		</div>
<?php

includeFooter();

?>
