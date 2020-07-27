<?php

$forum_id = 3;

include '../config/news.inc.php';

include '../style/wrapper.inc.php';

$page = 'news';
$pageTitle = "News";

function readableDate($time=0) {
	if (!$time) {
		$time = time();
	}
	return date('M j, Y',$time);
}

includeHeader();

?>
		<div class="main" style="max-width:8in;">

			<div class="ps-ad" style="margin: 0 auto;max-width: 728px;">
<script type="text/javascript"><!--
google_ad_client = "ca-pub-6535472412829264";
/* PS misc */
google_ad_slot = "7460727332";
google_ad_width = 728;
google_ad_height = 90;
//-->
</script>
<script type="text/javascript"
src="https://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
			</div>

<?php
	foreach ($latestNewsCache as $topic_id) {
		$topic = $newsCache[$topic_id];
?>
			<p>
				<h1><?php echo htmlspecialchars($topic['title']); ?></h1>
				<?php echo @$topic['summary_html'] ?>
				<p>
					&mdash;<strong><?php echo $topic['authorname']; ?></strong> <small class="date">on <?php echo readableDate($topic['date']); ?></small> <small><a href="/news/<?= $topic['topic_id'] ?>"><?= isset($topic['details']) ? 'Read more' : 'Permalink' ?></a></small>
				</p>
			</p>
<?php
	}

?>

		</div>
<?php

includeFooter();

?>
