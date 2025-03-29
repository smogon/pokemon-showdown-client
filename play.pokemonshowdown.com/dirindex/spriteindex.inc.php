<?php
function showSpriteStyle() {
?>
<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width" />
<link rel="stylesheet" href="/dirindex/font-awesome.min.css" />

<style>
	/*********************************************************
	 * Layout
	 *********************************************************/

	html, body {
		margin: 0;
		padding: 0;
		min-height: 100%;
	}

	html {
		color: white;
		font-family: Verdana,Helvetica,sans-serif;
		font-size: 11pt;
		background: #f0f0f0;
		color: #333333;
	}
	body {
		background: linear-gradient(to bottom, rgba(77, 93, 140, 0.6), rgba(77, 93, 140, 0.2) 80px, transparent 160px, transparent);
	}

	header {
		margin: 0;
		padding: 2px;
		/* background: rgba(255, 255, 255, .2);
		border-bottom: 1px solid rgba(255, 255, 255, .6); */
		text-align: center;
		height: 60px;
	}
	.nav-wrapper {
		width: 700px;
		margin: 0 auto;
		position: relative;
	}
	.nav {
		padding: 0;
	}
	.nav-wrapper .nav {
		padding-left: 140px;
		padding-top: 5px;
	}
	.nav li {
		float: left;
		list-style-type: none;
	}
	.nav img {
		position: absolute;
		left: 0;
		top: 0;
	}
	.nav a, .nav a:visited {
		color: white;
		background: #3a4f88;
		background: linear-gradient(to bottom, #4c63a3, #273661);
		box-shadow: 0.5px 1px 2px rgba(255, 255, 255, 0.45), inset 0.5px 1px 1px rgba(255, 255, 255, 0.5);
		border: 1px solid #222c4a;
		text-shadow: black 0px -1px 0;
		padding: 8px 15px;
		font-weight: bold;
		text-decoration: none;
		border-radius: 0;
		margin-left: -1px;
		font-size: 11pt;
	}
	.dark .nav a, .dark .nav a:visited {
		/* make sure other styling doesn't override */
		color: white;
		background: #3a4f88;
		background: linear-gradient(to bottom, #4c63a3, #273661);
		border: 1px solid #222c4a;
		box-shadow: 0.5px 1px 2px rgba(255, 255, 255, 0.45), inset 0.5px 1px 1px rgba(255, 255, 255, 0.5);
	}
	.nav a:hover, .dark .nav a:hover {
		background: linear-gradient(to bottom, #5a77c7, #2f447f);
		border: 1px solid #222c4a;
	}
	.nav a:active, .dark .nav a:active {
		background: linear-gradient(to bottom, #273661, #4c63a3);
		box-shadow: 0.5px 1px 2px rgba(255, 255, 255, 0.45), inset 0.5px 1px -1px rgba(255, 255, 255, 0.5);
	}
	.nav a.cur, .nav a.cur:hover, .nav a.cur:active,
	.dark .nav a.cur, .dark .nav a.cur:hover, .dark .nav a.cur:active {
		color: #CCCCCC;
		background: rgba(79, 109, 148, 0.7);
		box-shadow: 0.5px 1px 2px rgba(255, 255, 255, 0.45);
		border: 1px solid #222c4a;
	}
	.nav a.nav-first {
		margin-left: 10px;
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
	}
	.nav a.nav-last {
		border-top-right-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	.nav a.greenbutton {
		background: linear-gradient(to bottom, #4ca363, #276136);
	}
	.nav a.greenbutton:hover {
		background: linear-gradient(to bottom, #5ac777, #2f7f44);
	}
	.nav a.greenbutton:active {
		background: linear-gradient(to bottom, #276136, #4ca363);
		box-shadow: 0 1px 2px rgba(255, 255, 255, 0.45), inset 0.5px 1px -1px rgba(255, 255, 255, 0.5);
	}

	@media (max-width:700px) {
		.nav-wrapper {
			width: auto;
			display: inline-block;
		}
		.nav-wrapper .nav {
			padding-left: 135px;
		}
		.nav a {
			font-weight: normal;
			padding: 8px 7px;
		}
		.nav img {
			top: 10px;
		}
	}

	@media (max-width:554px) {
		header {
			height: 100px;
		}
		.nav-wrapper .nav {
			padding-left: 0;
			padding-top: 50px;
		}
		.nav img {
			top: 10px;
		}
		.nav a {
			padding: 8px 12px;
		}
		.nav a.nav-first {
			margin-left: 0;
		}
		.nav a.greenbutton {
			position: absolute;
			top: 10px;
			right: 0;
		}
	}
	@media (max-width:419px) {
		.nav a {
			padding: 8px 7px;
		}
	}
	@media (max-width:359px) {
		.nav-wrapper {
			padding-left: 5px;
		}
		.nav a {
			padding: 8px 4px;
		}
	}

	footer {
		clear: both;
		text-align: center;
		color: #888888;
		padding: 10px 0 10px 0;
	}
	footer p {
		margin: 10px 0;
	}
	footer a {
		color: #AAAAAA;
	}
	footer a:hover {
		color: #6688AA;
	}
	footer a.cur, footer a.cur:hover {
		color: #888888;
		font-weight: bold;
		text-decoration: none;
	}

	/*********************************************************
	 * Main
	 *********************************************************/
	.button {
		color: white;
		background: #3a4f88;
		background: linear-gradient(to bottom, #4c63a3, #273661);
		box-shadow: 0.5px 1px 2px rgba(255, 255, 255, 0.45), inset 0.5px 1px 1px rgba(255, 255, 255, 0.5);
		border: 1px solid #222c4a;
		padding: 3px 10px;
		text-shadow: black 0px -1px 0;
		border-radius: 10px;
		text-decoration: none;
		display: inline-block;
		font-family: Verdana,Helvetica,sans-serif;
		font-size: 11pt;
		cursor: pointer;
	}
	.button:hover {
		text-decoration: none;
	}
	main {
		margin: 0 auto;
		padding: 0 15px 15px 15px;
		max-width: 800px;
		overflow-wrap: break-word;
	}
	a {
		color: #0073aa;
	}
	a:visited {
		color: #8000aa;
	}
	h1 {
		font-size: 20px;
		margin-bottom: 20px;
	}
	.parentlink {
		padding: 0 0 12px 0;
	}
	.parentlink a {
		text-decoration: none;
		display: block;
		border: 1px solid transparent;
		padding: 4px 8px 4px 40px;
		border-radius: 4px;
	}
	.parentlink a:hover {
		text-decoration: none;
		background: #e7ebee;
		border-color: #5f8a9e;
	}
	.parentlink i, .parentlink em {
		vertical-align: middle;
	}
	@media (prefers-color-scheme: dark) {
		html {
			background: #000;
			color: #ddd;
		}
		a {
			color: #63aed1;
		}
		a:visited {
			color: #b17bc3;
		}
		.parentlink a:hover {
			background: #181818;
			border-color: #444;
		}
	}

	/*********************************************************
	 * Dirlist
	 *********************************************************/
	h1 a {
		font-weight: normal;
		text-decoration: none;
	}
	h1 a:hover {
		text-decoration: underline;
	}

	.dirlist {
		font-size: 14px;
		list-style-type: none;
		padding: 0;
	}
	.header {
		padding: 0 7px 0 39px;
		border-bottom: 1px solid #888888;
		position: sticky;
		top: 0;
		background: #f0f0f0;
	}
	.parentlink {
		padding: 0 0 12px 0;
	}

	.header a, .header a:visited {
		text-decoration: none;
		padding: 5px 0;
		color: inherit;
	}
	.header a:hover {
		background: #dddddd;
	}
	a.row {
		text-decoration: none;
		display: block;
		border: 1px solid transparent;
		padding: 4px 8px 4px 40px;
		border-radius: 4px;
	}
	a.row:hover {
		background:#e7ebee;
		border-color:#5f8a9e;
	}
	a.row * {
		vertical-align: middle;
	}

	.icon {
		display: inline-block;
		width: 32px;
		margin-left: -32px;
		font-size: 20px;
		text-align: center;
		color: #555;
	}
	.filename {
		display: inline-block;
		width: 50%;
		min-width: 260px;
		font-family: monospace;
	}
	.parentlink .filename {
		font-family: inherit;
		font-style: italic;
	}
	.filesize {
		display: inline-block;
		width: 20%;
		min-width: 80px;
		color: #666666;
	}
	.filemtime {
		display: inline-block;
		color: #666666;
		font-size: 0.9em;
		min-width: 150px;
	}
	.header .icon, .header .filename, .header .filesize, .header .filemtime {
		font-style: normal;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
	}
	@media (prefers-color-scheme: dark) {
		.header {
			background: #000;
		}
		.header a:hover {
			background: #333;
		}
		.icon {
			color: #888;
		}
		a.row:hover {
			background: #181818;
			border-color: #444;
		}
		.filesize, .filemtime {
			color: #888;
		}
	}

	/*********************************************************
	 * Spriteindex
	 *********************************************************/

	figure {
		width: 96px;
		display: inline-block;
		vertical-align: top;
		text-align: center;
		margin: 0.5em 10px;
		overflow-wrap: break-word;
	}
	figure img {
		image-rendering: pixelated;
	}
	figure figcaption {
		font-size: 12px;
		text-align: center;
	}
	a {
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
<script type="text/javascript">
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-26211653-1']);
	_gaq.push(['_setDomainName', 'pokemonshowdown.com']);
	_gaq.push(['_setAllowLinker', true]);
	_gaq.push(['_trackPageview']);

	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
</script>
<?php
}
function showHeader($title) {
?>
<!DOCTYPE html>
<html lang="en">
<title><?= htmlentities($title) ?> - Showdown!</title>
<?php
	showSpriteStyle();
?>
	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first" href="//pokemonshowdown.com/"><img src="/pokemonshowdownbeta.png" srcset="/pokemonshowdownbeta.png 1x, /pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="//pokemonshowdown.com/dex/">Pok&eacute;dex</a></li>
			<li><a class="button" href="//replay.pokemonshowdown.com/">Replays</a></li>
			<li><a class="button" href="//pokemonshowdown.com/ladder/">Ladder</a></li>
			<li><a class="button nav-last" href="//pokemonshowdown.com/forums/">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
		</ul></div>
	</header>

	<main><h1>
		Index of
		<a href="/"><?= htmlentities($_SERVER['SERVER_NAME']) ?></a><?php

$rel_dir = explode('?', $_SERVER['REQUEST_URI'])[0];
$path = '';
$pathparts = array_slice(explode('/', $rel_dir), 1, -1);
$lastpart = array_pop($pathparts);
foreach ($pathparts as $cur_dir) {
	$path .= '/' . $cur_dir;
	echo '<wbr />/';
	echo '<a href="' . htmlentities($path) . '/">' . htmlentities($cur_dir) . '</a>';
}
echo '<wbr />/' . htmlentities($lastpart) . '/';

?>

	</h1>
	<p class="parentlink"><a href="..">
		<i class="icon fa fa-arrow-circle-o-up"></i><em>(Parent directory)</em>
	</a></p>
<?php
}
function showSpriteIndex($path) {
	global $sprite_notes;
	$filter = $_GET['filter'] ?? '';
	if ($filter === 'recent') $filter = 'latest';
?>
	<div>Filter: <ul class="nav" style="display:inline-block;vertical-align:middle;margin:0">
		<li><a class="button nav-first<?= $filter === '' ? ' cur' : '' ?>" href="./">All</a></li>
		<li><a class="button<?= $sprite_notes ? '' : ' nav-last' ?><?= $filter === 'latest' ? ' cur' : '' ?>" href="./?filter=recent">Recent</a></li>
<?php if ($sprite_notes) { ?>
		<li><a class="button nav-last<?= $filter === 'credited' ? ' cur' : '' ?>" href="./?filter=credited">Credited</a></li>
<?php } ?>
	</ul></div>
</main>
<?php
	$files = glob($path);
	if ($filter === 'latest') {
		usort($files, fn($a, $b) => (filemtime($a) <=> filemtime($b)) * -1);
	} else if ($filter === 'credited') {
		usort($files, fn($a, $b) => (($sprite_notes[$a] ?? '') <=> ($sprite_notes[$b] ?? '')));
	}
	$section = null;
	foreach ($files as $file) {
		$credit = ($sprite_notes[$file] ?? null);
		if ($filter === 'credited') {
			if (!$credit) continue;
			if ($credit !== $section) {
				$section = $credit;
				echo '<h3 style="margin:1em;border-bottom:1px solid #999;padding-bottom:2px">By ' . $credit . '</h3>';
			}
		} else if ($filter === 'latest') {
			$year = date('Y-m', filemtime($file));
			if ($year !== $section) {
				if (intval($year) < 2024) break;
				$section = $year;
				echo '<h3 style="margin:1em;border-bottom:1px solid #999;padding-bottom:2px">New in ' . $year . '</h3>';
			}
		}
		$escaped_file = htmlentities($file);
?>
<figure id="<?php echo $escaped_file ?>">
	<img loading="lazy" src="<?php echo $escaped_file ?>" alt="<?php echo $escaped_file ?>" title="<?php echo $escaped_file ?>" />
	<figcaption><a href="<?php echo $escaped_file ?>"><?php echo substr($escaped_file, 0, -4) ?></a><?php if ($credit) echo '<br />by ' . htmlentities($credit) ?></figcaption>
</figure>
<?php
	}
}

if (empty($sprite_notes)) $sprite_notes = null;
