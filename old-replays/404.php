<?php

error_reporting(0);

header('HTTP/1.1 404 Not Found');

include_once 'theme/panels.lib.php';

$page = '404';
$pageTitle = "Replay not found";

$panels->setPageTitle("Replay not found");
$panels->noScripts();
$panels->start();

?>
	<div class="pfx-panel"><div class="pfx-body pfx-body-padded" style="max-width:8in;">
		<div class="main">

			<h1>Not Found</h1>
			<p>
				The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.
			</p>
			<p>
				In the future, remember to click <strong>Upload and share replay</strong> to save a replay permanently.
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
