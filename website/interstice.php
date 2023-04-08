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

		<blockquote>
			<a rel="nofollow" class="button bigbutton" href="<?php echo $uri ?>" title="<?php echo $uri ?>"><strong>Visit external site</strong></a>
		</blockquote>
<?php

includeFooter();

?>
