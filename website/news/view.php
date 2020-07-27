<?php

include '../config/news.inc.php';

$topic = @$newsCache[$_GET['id']];
if (!$topic) {
	header('HTTP/1.1 404 Not Found');
	die("Invalid newsid");
}

include '../style/wrapper.inc.php';

$page = 'news';
$pageTitle = $topic['title'];

function readableDate($time=0) {
	if (!$time) {
		$time = time();
	}
	return date('M j, Y',$time);
}

includeHeader();

?>
		<div class="main" style="max-width:8in;">

			<p>
				<h1><?php echo htmlspecialchars($topic['title']); ?></h1>
				<?php echo @$topic['summary_html']; echo @$topic['details_html']; ?>
				<p>
					&mdash;<strong><?php echo $topic['authorname']; ?></strong> <small class="date">on <?php echo readableDate($topic['date']); ?></small>
				</p>
			</p>

		</div>
<?php

includeFooter();

?>
