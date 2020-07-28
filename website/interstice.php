<?php

include_once __DIR__ . '/../config/config.inc.php';

header('X-Robots-Tag: noindex');

if (!isset($_REQUEST['uri'])) {
	header('HTTP/1.1 303 See Other');
	header('Location: /');
	die();
}

$uri = htmlspecialchars($_REQUEST['uri']);

if (substr($uri, 0, 4) !== 'http') $uri = 'http://' . $uri;

include 'style/wrapper.inc.php';

$page = 'interstice';
$pageTitle = "External link";

includeHeaderTop();
?>
		<meta name="robots" content="noindex" />
<?php
includeHeaderBottom();

?>
		<div class="main">

			<div class="ps-ad" style="margin: 0 auto;max-width: 728px;">
<!-- BEGIN JS TAG - [728x90] < - DO NOT MODIFY -->
<script type="text/javascript">
document.write('<SCR'+'IPT SRC="http://ads.sonobi.com/ttj?id=1871931&referrer=<?= $psconfig['routes']['root'] ?>&cb='+(parseInt(Math.random()*100000))+'" TYPE="text/javascript"></SCR'+'IPT>');
</script>
<!-- END TAG -->
			</div>

			<p>
				You clicked on a link to:
			</p>
			<blockquote><p>
				<code><?php echo $uri ?></code>
			</p></blockquote>
			<div style="clear:both"></div>

			<ul>
				<li>This site is not related to us. We cannot guarantee its quality.</li>
				<li>Unknown sites may contain offensive or shocking content or may harm your computer.</li>
			</ul>

			<p>If you trust the source of this link:</p>

			<blockquote><ul class="nav">
				<li><a rel="nofollow" class="button nav-first nav-last" href="<?php echo $uri ?>" title="<?php echo $uri ?>">Visit external site</a></li>
			</ul></blockquote>

		</div>
<?php

includeFooter();

?>
