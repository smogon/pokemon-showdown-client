<?php

error_reporting(0);

header('HTTP/1.1 503 Service Unavailable');

include_once 'theme/panels.lib.php';

$page = '503';
$pageTitle = "Service Unavailable";

$panels->setPageTitle("Replay not found");
$panels->noScripts();
$panels->start();

?>
	<div class="pfx-panel"><div class="pfx-body pfx-body-padded" style="max-width:8in;">
		<div class="main">

			<h1>Technical difficulties</h1>
			<p>
				<?= @$Replays->offlineReason ? $Replays->offlineReason : "We're currently experiencing some technical difficulties. Please try again later. Sorry." ?>
			</p>

<script type="text/javascript"><!--
google_ad_client = "ca-pub-6535472412829264";
/* PS replay */
google_ad_slot = "8206205605";
google_ad_width = 728;
google_ad_height = 90;
//-->
</script>
<script type="text/javascript"
src="//pagead2.googlesyndication.com/pagead/show_ads.js">
</script>

		</div>
	</div></div>
<?php

$panels->end();

?>
