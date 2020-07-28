<?php

// in theory this file is no longer used

include_once __DIR__ . '/../../config/config.inc.php';
include __DIR__ . '/../../config/news.inc.php';

function readableDate($time=0) {
	if (!$time) {
		$time = time();
	}
	return date('M j, Y',$time);
}

?>
<!DOCTYPE html>
<html>
	<head>
		<title>News</title>
		<style>
		<!--
			html, body {
				margin: 0;
				padding: 0;
				background: transparent;
				color: black;
				font-size: 9pt;
				font-family: Verdana, sans-serif;
			}
			body {
				padding: 2px 10px;
			}
			h1, p, div.p {
				margin: 8px 0;
				padding: 0;
			}
			h1 {
				font-size: 11pt;
				font-weight: bold;
			}
		-->
		</style>
	</head>
	<body>
<?php
if (false && !isset($_GET['https'])) {
?>
		<div class="p" style="text-align:center">
<script type="text/javascript"><!--
google_ad_client = "ca-pub-6535472412829264";
/* News */
google_ad_slot = "2625071733";
google_ad_width = 234;
google_ad_height = 60;
//-->
</script>
<script type="text/javascript"
src="//pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
		</div>
<?php
}
?>
<?php
	foreach ($latestNewsCache as $topic_id) {
		$topic = $newsCache[$topic_id];
?>
			<h1><?php echo htmlspecialchars($topic['title']); ?></h1>
			<?php echo @$topic['summary_html'] ?>
			<p>
				&mdash;<strong><?php echo $topic['authorname']; ?></strong> <small class="date">on <?php echo readableDate($topic['date']); ?></small> <small><a href="http://<?= $psconfig['routes']['root'] ?>/forums/viewtopic.php?f=3&amp;t=<?= $topic['topic_id'] ?>" target="_blank" onclick="return window.parent.app.clickLink(event)">Read more / comments</a></small>
			</p>
<?php
		break;
	}
?>
	</body>
</html>