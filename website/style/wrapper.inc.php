<?php

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
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<title><?php if ($pageTitle !== 'Home') echo $pageTitle,' - Pok&eacute;mon Showdown!'; else echo 'Pok&eacute;mon Showdown! battle simulator' ?></title>
		<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
		<link rel="stylesheet" href="/style/main.css?v14" />
<!-- Google Analytics -->
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-26211653-1', 'pokemonshowdown.com', {'allowLinker': true});
ga('require', 'linker');

ga('linker:autoLink', ['pokemonshowdown.com', 'play.pokemonshowdown.com', 'replay.pokemonshowdown.com']);
ga('send', 'pageview');

</script>
<!-- End Google Analytics -->
<?php
}

function includeHeaderBottom() {
	global $page, $pageTitle, $headerData;
?>
	</head>
	<body><div id="wrapper">
		<div class="header"><div class="header-inner">
			<ul class="nav">
				<li><a class="button nav-first<?php curPage('home') ?>" href="/"><img src="/images/pokemonshowdownbeta.png" alt="Pok&eacute;mon Showdown! (beta)" /> Home</a></li>
				<li><a class="button" href="//dex.pokemonshowdown.com/">Pok&eacute;dex</a></li>
				<li><a class="button" href="//replay.pokemonshowdown.com/">Replays</a></li>
				<li><a class="button<?php curPage('ladder') ?>" href="/ladder/">Ladder</a></li>
				<li><a class="button nav-last" href="/forums/">Forum</a></li>
			</ul>
			<ul class="nav nav-play">
				<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
			</ul>
			<div style="clear:both"></div>
		</div></div>
<?php
}

function includeHeader() {
	global $page, $pageTitle, $headerData;
	includeHeaderTop();
	includeHeaderBottom();
}

function includeFooter() {
?>
		<div class="footer">
			<p>
				<small><a href="/rules">Rules</a> | <a href="/privacy">Privacy policy</a> | <a href="/credits"<?php classCurPage('credits') ?>>Credits</a> | <a href="/contact"<?php classCurPage('contact') ?>>Contact</a></small>
			</p>
		</div>
	</div></body>
</html>
<?php
}
