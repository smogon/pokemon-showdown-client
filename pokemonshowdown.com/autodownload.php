<?php

include 'style/wrapper.inc.php';

$page = 'download';
$pageTitle = "Download";

$loc = '/files/PokemonShowdownSetup.exe';

if ($_GET['os'] === 'mac') $loc = '/files/pokemonshowdown-mac.zip';

includeHeaderTop();
?>
	<meta http-equiv="refresh" content="1; url=<?= $loc ?>">
<?php
includeHeaderBottom();

?>
		<div class="main">

			<p>
				Now downloading a pretty cool pokemon simulator... at least I think it's cool... <small><a href="<?= $loc ?>">(click if you're having trouble)</a></small>

		</div>
<?php

includeFooter();

?>
