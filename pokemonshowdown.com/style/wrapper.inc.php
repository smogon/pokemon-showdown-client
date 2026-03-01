<?php

include_once __DIR__ . '/../../config/config.inc.php';

function curPage($thisPage) {
	global $page;
	if ($page === $thisPage) echo ' cur';
}
function classCurPage($thisPage) {
	global $page;
	if ($page === $thisPage) echo ' class="cur"';
}

function includeHeaderTop() {
	global $page, $pageTitle, $headerData;
?>
<!DOCTYPE html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

<title><?= $pageTitle ?> - Pok&eacute;mon Showdown!</title>

<link rel="stylesheet" href="/style/global.css?v16" />

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-26211653-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-26211653-1');
</script>
<!-- End Google Analytics -->
<?php
}

function includeHeaderBottom() {
	global $page, $pageTitle, $headerData, $psconfig;
?>
<div class="body">

	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first" href="/"><img src="/images/pokemonshowdownbeta.png" srcset="/images/pokemonshowdownbeta.png 1x, /images/pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="/dex/">Pok&eacute;dex</a></li>
			<li><a class="button" href="//replay.pokemonshowdown.com/">Replay</a></li>
			<li><a class="button purplebutton" href="//smogon.com/dex/" target="_blank">Strategy</a></li>
			<li><a class="button nav-last purplebutton" href="//smogon.com/forums/" target="_blank">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
		</ul></div>
	</header>

	<div class="main"><section class="section">

<?php
}

function includeHeader() {
	global $page, $pageTitle, $headerData, $psconfig;
	includeHeaderTop();
	includeHeaderBottom();
}

function includeFooter() {
?>

	</section></div>
</div>

<footer>
	<p>
		<small><a href="/rules">Rules</a> | <a href="/privacy">Privacy policy</a> | <a href="/credits"<?php classCurPage('credits') ?>>Credits</a> | <a href="/contact">Contact</a></small>
	</p>
</footer>
<?php
}
