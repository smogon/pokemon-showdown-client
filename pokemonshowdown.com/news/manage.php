<?php

error_reporting(E_ALL);

include_once '../../lib/ntbb-session.lib.php';
include_once __DIR__ . '/../../config/news.inc.php';
include_once 'include.php';

if (!$users->isLeader()) die('access denied');

function saveNews() {
	global $newsCache, $latestNewsCache;
	file_put_contents(__DIR__ . '/../../config/news.inc.php', '<?php

$latestNewsCache = '.var_export($GLOBALS['latestNewsCache'], true).';
$newsCache = '.var_export($GLOBALS['newsCache'], true).';
');

	date_default_timezone_set('America/Los_Angeles');
	$indexData = file_get_contents('../../play.pokemonshowdown.com/index.html');
	$indexData = preg_replace('/					<div class="pm-log" style="max-height:none">
						.*?
					<\/div>
/', '					<div class="pm-log" style="max-height:none">
						'.renderNews().'
					</div>
', $indexData, 1);
	$indexData = preg_replace('/ data-newsid="[^"]*">/', ' data-newsid="'.getNewsId().'">', $indexData, 1);
	file_put_contents('../../play.pokemonshowdown.com/index.html', $indexData);
}

include '../style/wrapper.inc.php';

$page = 'news';
$pageTitle = "News";

includeHeader();

?>
		<div class="main" style="max-width:8in;">

		<p>
			<button onclick="$('#newpostform').show(); return false">New news post</button>
		</p>
		<form id="newpostform" style="display:none" method="post">
			<input type="hidden" name="act" value="newentry" /><input type="hidden" name="topic_id" value="<?= @$topic_id ?>" /><?php $users->csrfData(); ?>
			<input type="text" name="title" size="80" placeholder="Title" value="<?= htmlspecialchars(@$topic['title']) ?>" /><br /><br />
			<textarea name="summary" cols="80" rows="10" placeholder="Summary"><?= htmlspecialchars(@$topic['summary']) ?></textarea>
			<br /><button type="submit"><strong>Make New Post</strong></button>
		</form>

<?php

	if (@$_POST['act'] === 'editentry') {
		if (!$users->csrfCheck()) die('csrf error');
		$topic_id = $_POST['topic_id'];
		$title = $_POST['title'];

		// summary parse
		$summary = $_POST['summary'];
		$newsCache[$topic_id]['summary'] = $summary;

		$summary = str_replace("\r", '', $summary);
		$summary = str_replace("\n\n", '</p><p>', $summary);
		$summary = str_replace("\n", '<br />', $summary);
		$summary = str_replace("\n", '<br />', $summary);
		$summary = preg_replace('/\[url="([^\]]+)"\]/', '<a href="$1" target="_blank">', $summary);
		$summary = preg_replace('/\[url=([^\]]+)\]/', '<a href="$1" target="_blank">', $summary);
		$summary = str_replace("[/url]", '</a>', $summary);
		$summary = str_replace("[b]", '<strong>', $summary);
		$summary = str_replace("[/b]", '</strong>', $summary);
		$summary = '<p>'.$summary.'</p>';

		$newsCache[$topic_id]['summary_html'] = $summary;

		// details parse
		if (isset($_POST['details'])) {
			$details = $_POST['details'];

			if ($details) {
				$newsCache[$topic_id]['details'] = $details;
				$details = str_replace("\r", '', $details);
				$details = str_replace("\n\n", '</p><p>', $details);
				$details = str_replace("\n", '<br />', $details);
				$details = str_replace("\n", '<br />', $details);
				$details = preg_replace('/\[url="([^\]]+)"\]/', '<a href="$1" target="_blank">', $details);
				$details = preg_replace('/\[url=([^\]]+)\]/', '<a href="$1" target="_blank">', $details);
				$details = str_replace("[/url]", '</a>', $details);
				$details = str_replace("[b]", '<strong>', $details);
				$details = str_replace("[/b]", '</strong>', $details);
				$details = '<p>'.$details.'</p>';
				$newsCache[$topic_id]['details_html'] = $details;
			} else {
				unset($newsCache[$topic_id]['details']);
				unset($newsCache[$topic_id]['details_html']);
			}
		}

		if ($title) {
			$newsCache[$topic_id]['title'] = $title;
			$newsCache[$topic_id]['title_html'] = htmlspecialchars($title);
		}
		saveNews();
		echo '<p>Edit successful</p>';
	}
	if (@$_POST['act'] === 'newentry') {
		if (!$users->csrfCheck()) die('csrf error');

		$topic_id = intval($latestNewsCache[0]) + 1;

		$title = $_POST['title'];
		$summary = $_POST['summary'];
		$pre_summary = $summary;

		$summary = str_replace("\r", '', $summary);
		$summary = str_replace("\n\n", '</p><p>', $summary);
		$summary = str_replace("\n", '<br />', $summary);
		$summary = str_replace("\n", '<br />', $summary);
		$summary = preg_replace('/\[url=([^\]]+)\]/', '<a href="$1" target="_blank">', $summary);
		$summary = str_replace("[/url]", '</a>', $summary);
		$summary = str_replace("[b]", '<strong>', $summary);
		$summary = str_replace("[/b]", '</strong>', $summary);
		$summary = str_replace("[i]", '<em>', $summary);
		$summary = str_replace("[/i]", '</em>', $summary);
		$summary = '<p>'.$summary.'</p>';

		$time = ''.time();

		$newsCache[$topic_id] = array(
			'topic_id' => ''.$topic_id,
			'title' => $title,
			'authorname' => $curuser['username'],
			'date' => $time,
			'topic_time' => $time,
			'summary' => $pre_summary,
			'summary_html' => $summary,
			'title_html' => htmlspecialchars($title),
		);

		array_unshift($latestNewsCache, ''.$topic_id);

		saveNews();
		echo '<p>New post successful</p>';
	}

	foreach ($latestNewsCache as $i => $topic_id) {
		$topic = $newsCache[$topic_id];
?>
			<p>
				<h1><?php echo $topic['title_html']; ?></h1>
				<p>
					<button onclick="$('#editform-<?= $topic_id ?>').show(); return false">Edit</button>
				</p>
				<form id="editform-<?= $topic_id ?>" style="display:none" method="post">
					<input type="hidden" name="act" value="editentry" /><input type="hidden" name="topic_id" value="<?= $topic_id ?>" /><?php $users->csrfData(); ?>
					<input type="text" name="title" size="80" placeholder="Title" value="<?= htmlspecialchars($topic['title']) ?>" /><br /><br />
					<textarea name="summary" cols="80" rows="10" placeholder="Summary"><?= htmlspecialchars(@$topic['summary']) ?></textarea>
<?php if (isset($topic['details'])) { ?>
					<textarea name="details" cols="80" rows="10" placeholder="Details"><?= htmlspecialchars(@$topic['details']) ?></textarea>
<?php } else { ?>
					<textarea name="details" cols="80" rows="10" placeholder="Details" style="display:none"></textarea><button onclick="$(this).prev().show();$(this).hide();return false">Add "read more" details</button>
<?php } ?>
					<br /><button type="submit"><strong>Make Edit</strong></button>
				</form>
				<?php echo @$topic['summary_html'] ?>
				<p>
					&mdash;<?php echo $topic['authorname']; ?> on <small class="date"><?php echo readableDate($topic['date']); ?></small></small>
				</p>
			</p>
<?php
	}

?>

		</div>
		<script src="/js/jquery-1.9.1.min.js"></script>
<?php

includeFooter();

?>
