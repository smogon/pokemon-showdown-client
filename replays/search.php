<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

include 'theme/panels.lib.php';

$username = @$_REQUEST['user'];
$format = ($username ? '' : @$_REQUEST['format']);
$contains = (@$_REQUEST['contains']);
$byRating = isset($_REQUEST['rating']);
$isPrivate = isset($_REQUEST['private']);

$noRequest = (!$username && !$format && !$contains);
if (!$noRequest) {
	header('Cache-Control: max-age=0, no-cache, no-store, must-revalidate');
}

if ($username) {
	$panels->setPageTitle($username."'s replays");
} else if ($format) {
	$panels->setPageTitle($username." replays");
} else {
	$panels->setPageTitle("Search replays");
}
$panels->setTab('replay');
$panels->start();

$page = 0;
if (@$_REQUEST['page']) $page = intval($_REQUEST['page']);

if (!$page) {
?>
	<div class="pfx-panel"><div class="pfx-body pfx-body-padded">
<?php
	if (!$contains) {
?>
		<h1>Search replays</h1>
		<form action="/search/" method="get" data-target="replace">
			<p style="text-align:center">
				<label><input type="text" name="user" class="textbox" placeholder="Username" size="24"<?= !$format ? ' autofocus="autofocus"' : '' ?> value="<?php echo htmlspecialchars($username) ?>" /></label>
				<button type="submit"><strong>Search</strong></button>
			</p>
		</form>
		<form action="/search/" method="get" data-target="replace">
			<p style="text-align:center">
				<label><input type="text" name="format" class="textbox" placeholder="Format" size="24"<?= $format ? ' autofocus="autofocus"' : '' ?> value="<?php echo htmlspecialchars($format) ?>" /></label>
				<button type="submit"><strong>Search</strong></button>
			</p>
		</form>
<?php
	}
	if ($noRequest || $contains) {
?>
		<h1>Experimental full-text search</h1>
		<form action="/search/" method="get" data-target="replace">
			<p style="text-align:center">
				<label><input type="text" name="contains" class="textbox" placeholder="EXPERIMENTAL FULL TEXT SEARCH" size="24"<?= $format ? ' autofocus="autofocus"' : '' ?> value="<?php echo htmlspecialchars($contains) ?>" /></label>
				<button type="submit"><strong>Search</strong></button>
			</p>
		</form>
<?php
	}
}

if ($username || $format || $contains) {
	require_once 'replays.lib.php';
	include_once '../lib/ntbb-session.lib.php';

	$username = $users->userid($username);
	$isPrivateAllowed = ($username === $curuser['userid'] || $curuser['userid'] === 'zarel');

	if (!$page) {
?>
		<h1>Search results for "<?php echo htmlspecialchars($username ? $username : ($contains ? $contains : $format)); ?>"</h1>
<?php
		if ($format) {
			$format = $Replays->toID($format);
?>
		<ul class="tabbar centered" style="margin-bottom: 18px"><li><a class="button nav-first<?= $byRating ? '' : ' cur' ?>" href="/search/?format=<?= $format ?>" data-target="replace">Newest</a></li><li><a class="button nav-last<?= $byRating ? ' cur' : '' ?>" href="/search/?format=<?= $format ?>&amp;rating" data-target="replace">Highest rated</a></li></ul>
<?php
		} else if ($isPrivateAllowed) {
?>
		<ul class="tabbar centered" style="margin-bottom: 18px"><li><a class="button nav-first<?= $isPrivate ? '' : ' cur' ?>" href="/search/?user=<?= $username ?>" data-target="replace">Public</a></li><li><a class="button nav-last<?= $isPrivate ? ' cur' : '' ?>" href="/search/?user=<?= $username ?>&amp;private" data-target="replace">Private</a></li></ul>
<?php
		}
?>
		<ul class="linklist" style="max-width:480px;margin:0 auto;text-align:center">
<?php
	}

	$replays = null;
	if ($page > 25) {
		// no
	} else if ($username) {
		if (!$isPrivate || $isPrivateAllowed) {
			$replays = $Replays->search(["username" => $username, "isPrivate" => $isPrivate, "page" => $page]);
		}
	} else if ($contains) {
		$replays = $Replays->fullSearch($contains, $page);
	} else {
		$replays = $Replays->search(["format" => $format, "byRating" => $byRating, "page" => $page]);
	}

	$time = time();
	$timeoffset = 600;
	$count = 0;

	// $newoffset = 0;
	if ($isPrivate && !$isPrivateAllowed) {
?>
		<li>Error: You must be logged into account "<?= htmlspecialchars($username) ?>" to see their private replays (You're currently "<?= $curuser['userid'] ?>").</li>
<?php
	} else if (!$replays || !count($replays)) {
		if ($page > 25) {
?>
		<li>Can't search any further back</li>
<?php
		} else if (!$Replays->db) {
?>
		<li><?= $Replays->offlineReason ?></li>
<?php
		} else {
?>
		<li>No results found</li>
<?php
		}
	} else foreach ($replays as $replay) {
		if ($count == 50) {
			$count++;
			// $newoffset = $replay['num'];
			break;
		}
		$timetext = '';
		if (!$byRating) while ($timeoffset >= 0 && $replay['uploadtime'] < $time - $timeoffset) {
			$prevtimeoffset = $timeoffset;
			switch ($timeoffset) {
			case 600:
				$timetext = '<h3>10 minutes ago</h3>';
				$timeoffset = 1200;
				break;
			case 1200:
				$timetext = '<h3>20 minutes ago</h3>';
				$timeoffset = 1800;
				break;
			case 1800:
				$timetext = '<h3>30 minutes ago</h3>';
				$timeoffset = 3600;
				break;
			case 3600:
				$timetext = '<h3>1-2 hours ago</h3>';
				$timeoffset = 2*3600;
				break;
			case 2*3600:
				$timetext = '<h3>2-3 hours ago</h3>';
				$timeoffset = 3*3600;
				break;
			case 3*3600:
				$timetext = '<h3>3-4 hours ago</h3>';
				$timeoffset = 4*3600;
				break;
			case 4*3600:
				$timetext = '<h3>4-8 hours ago</h3>';
				$timeoffset = 8*3600;
				break;
			case 8*3600:
				$timetext = '<h3>8-12 hours ago</h3>';
				$timeoffset = 12*3600;
				break;
			case 12*3600:
				$timetext = '<h3>12-24 hours ago</h3>';
				$timeoffset = 24*3600;
				break;
			case 24*3600:
				$timetext = '<h3>1-2 days ago</h3>';
				$timeoffset = 2*24*3600;
				break;
			case 2*24*3600:
				$timetext = '<h3>2-3 days ago</h3>';
				$timeoffset = 3*24*3600;
				break;
			case 3*24*3600:
				$timetext = '<h3>3-7 days ago</h3>';
				$timeoffset = 7*24*3600;
				break;
			case 7*24*3600:
				$timetext = '<h3>1 week ago</h3>';
				$timeoffset = 14*24*3600;
				break;
			case 14*24*3600:
				$timetext = '<h3>2 weeks ago</h3>';
				$timeoffset = 21*24*3600;
				break;
			case 21*24*3600:
				$timetext = '<h3>3 weeks ago</h3>';
				$timeoffset = 30*24*3600;
				break;
			case 30*24*3600:
				$timetext = '<h3>1 month ago</h3>';
				$timeoffset = 2*30*24*3600;
				break;
			case 2*30*24*3600:
				$timetext = '<h3>2 months ago</h3>';
				$timeoffset = 3*30*24*3600;
				break;
			case 3*30*24*3600:
				$timetext = '<h3>3-6 months ago</h3>';
				$timeoffset = 183*24*3600;
				break;
			case 183*24*3600:
				$timetext = '<h3>6-9 months ago</h3>';
				$timeoffset = 274*24*3600;
				break;
			case 274*24*3600:
				$timetext = '<h3>9-12 months ago</h3>';
				$timeoffset = 365*24*3600;
				break;
			case 365*24*3600:
				$timetext = '<h3>more than 1 year ago</h3>';
				$timeoffset = 2*365*24*3600;
				break;
			case 2*365*24*3600:
				$timetext = '<h3>more than 2 year ago</h3>';
				$timeoffset = 3*365*24*3600;
				break;
			case 3*365*24*3600:
				$timetext = '<h3>more than 3 years ago</h3>';
				$timeoffset = 4*365*24*3600;
				break;
			case 4*365*24*3600:
				$timetext = '<h3>more than 4 years ago</h3>';
				$timeoffset = 5*365*24*3600;
				break;
			case 5*365*24*3600:
				$timetext = '<h3>more than 5 years ago</h3>';
				$timeoffset = -1;
				break;
			}
			if ($prevtimeoffset === $timeoffset) break;
		}
		echo $timetext;
		$replayid = $replay['id'];
		if ($replay['password'] ?? null) $replayid .= '-' . $replay['password'] . 'pw';
?>
		<li><a href="/<?php echo $replayid; ?>" data-target="push"><small>[<?php echo $replay['format']; ?>]<?php if (@$replay['rating']) echo ' rating: '.$replay['rating']; ?><br /></small> <strong><?php echo htmlspecialchars($replay['p1']); ?></strong> vs. <strong><?php echo htmlspecialchars($replay['p2']); ?></strong></a></li>
<?php
		$count++;
	}

	if (!$page) {
?>
		</ul>
<?php
		if ($count === 51) {
?>
		<p style="text-align: center"><button class="button" name="moreResults" value="<?= /* $newoffset */ '' ?>" data-user="<?= htmlspecialchars($username) ?>" data-format="<?= htmlspecialchars($format) ?>" data-private="<?= $isPrivate ? '1' : '' ?>">More<br /><i class="fa fa-caret-down"></i></button></p>
<?php
		}
	} else {
		// echo '<input type="hidden" name="offset" class="offset" value="' . $newoffset . '" />';
		if ($count === 51) {
			echo '<input type="hidden" name="more" class="more" value="1" />';
		}
	}
}

if (!$page) {
?>
	</div></div>

<?php
}

$panels->end();

?>
