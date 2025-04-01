<?php

$fa5pro = file_exists(__DIR__ . '/fontawesome5-solid-duotone.min.css');

$sprites_whitelist = [
	'/sprites/afd-back-shiny/' => '*.png',
	'/sprites/afd-shiny/' => '*.png',
	'/sprites/gen1/' => '*.png',
	'/sprites/gen1-back/' => '*.png',
	'/sprites/gen1rb/' => '*.png',
	'/sprites/gen1rg/' => '*.png',
	'/sprites/gen1rgb-back/' => '*.png',
	'/sprites/gen2/' => '*.png',
	'/sprites/gen2-back/' => '*.png',
	// gen 3+? too many sprites, not gonna make that easy on people
	'/sprites/misc/' => '*.png',
	'/sprites/types/' => '*.png',
	'/sprites/digimon/sprites/digimon/' => '*.png',
	'/sprites/digimon/sprites/digimon-back/' => '*.png',
	'/sprites/digimon/sprites/digimonani/' => '*.gif',
	'/sprites/digimon/sprites/digimonani-back/' => '*.gif',
	'/sprites/digimon/sprites/pokemon/' => '*.png',
	'/sprites/digimon/sprites/pokemon-back/' => '*.png',
	'/sprites/digimon/sprites/pokemonani/' => '*.gif',
	'/sprites/digimon/sprites/pokemonani-back/' => '*.gif',
];

$rel_dir = explode('?', $_SERVER['REQUEST_URI'])[0];
$slash_pos = strrpos($rel_dir, '/');
if ($slash_pos !== false) $rel_dir = substr($rel_dir, 0, $slash_pos + 1);

$dir = $_SERVER['DOCUMENT_ROOT'] . $rel_dir;
$dirname = basename($dir);
$files = scandir($dir);
$fileinfo = [];

$at_root = ($rel_dir === '/');
$up = null;

function get_icon(string $file, bool $is_dir) {
	global $fa5pro;
	if ($fa5pro) return get_icon_fa5pro($file, $is_dir);

	if ($is_dir) {
		return 'fa fa-folder-open';
	} else {
		$info = pathinfo($file);
		$ext = strtolower($info['extension'] ?? '.');
		if ($ext === 'jpg' || $ext === 'jpeg' || $ext === 'png' || $ext === 'bmp' || $ext === 'webp' || $ext === 'svg') {
			return 'fa fa-picture-o';
		} else if ($ext === 'gif') {
			return 'fa fa-film';
		} else if ($ext === 'mp4' || $ext === 'webm' || $ext === 'mkv' || $ext === 'avi' || $ext === 'mov') {
			return 'fa fa-video-camera';
		} else if ($ext === 'mp3' || $ext === 'ogg' || $ext === 'wav' || $ext === 'flac' || $ext === 'aac') {
			return 'fa fa-volume-up';
		} else if ($ext === 'zip' || $ext === 'tar' || $ext === 'gz') {
			return 'fa fa-file-archive-o';
		} else if ($ext === 'txt' || $ext === 'md') {
			return 'fa fa-file-text-o icon-' . $ext;
		} else if ($ext === 'html' || $ext === 'php') {
			return 'fa fa-file-code-o icon-' . $ext;
		} else if ($ext === 'js' || $ext === 'ts' || $ext === 'jsx' || $ext === 'tsx' || $ext === 'json') {
			return 'fa fa-code icon-' . substr($ext, 0, 2);
		} else if ($ext === 'mts' || $ext === 'cts' || $ext === 'mjs' || $ext === 'cjs') {
			return 'fa fa-code icon-' . substr($ext, 1, 2);
		} else if ($ext === 'c' || $ext === 'cpp' || $ext === 'h' || $ext === 'hpp' || $ext === 'py' || $ext === 'xml' || $ext === 'java' || $ext === 'rb' || $ext === 'go' || $ext === 'swift' || $ext === 'rs' || $ext === 'map' || $ext === 'csv') {
			return 'fa fa-code';
		} else if ($ext === 'css') {
			return 'fa fa-code icon-' . $ext;
		} else if ($ext === 'woff' || $ext === 'woff2' || $ext === 'ttf' || $ext === 'otf' || $ext === 'eot') {
			return 'fa fa-font';
		} else if ($ext === 'pdf') {
			return 'fa fa-file-pdf-o';
		} else if ($ext === 'doc' || $ext === 'docx' || $ext === 'odt') {
			return 'fa fa-file-word-o';
		} else if ($ext === 'xls' || $ext === 'xlsx' || $ext === 'ods') {
			return 'fa fa-file-excel-o';
		} else if ($ext === 'ppt' || $ext === 'pptx' || $ext === 'odp') {
			return 'fa fa-file-powerpoint-o';
		} else if ($ext === 'epub' || $ext === 'mobi') {
			return 'fa fa-book';
		} else if ($ext === 'exe' || $ext === 'dmg') {
			return 'fa fa-window-maximize';
		}
	}
	return 'fa fa-file-o';
}

function get_icon_fa5pro(string $file, bool $is_dir) {
	if ($is_dir) {
		return 'fad fa-folder-open';
	} else {
		$info = pathinfo($file);
		$ext = strtolower($info['extension'] ?? '.');
		if ($ext === 'jpg' || $ext === 'jpeg' || $ext === 'png' || $ext === 'bmp' || $ext === 'webp' || $ext === 'svg') {
			return 'fad fa-image';
		} else if ($ext === 'gif') {
			return 'fad fa-film';
		} else if ($ext === 'mp4' || $ext === 'webm' || $ext === 'mkv' || $ext === 'avi' || $ext === 'mov') {
			return 'fas fa-video';
		} else if ($ext === 'mp3' || $ext === 'ogg' || $ext === 'wav' || $ext === 'flac' || $ext === 'aac') {
			return 'fas fa-volume';
		} else if ($ext === 'zip' || $ext === 'tar' || $ext === 'gz') {
			return 'fad fa-file-archive';
		} else if ($ext === 'txt' || $ext === 'md') {
			return 'fad fa-file-alt icon-' . $ext;
		} else if ($ext === 'html' || $ext === 'php') {
			return 'fad fa-file-code icon-' . $ext;
		} else if ($ext === 'js' || $ext === 'ts' || $ext === 'jsx' || $ext === 'tsx' || $ext === 'json') {
			return 'fad fa-code icon-' . substr($ext, 0, 2);
		} else if ($ext === 'mts' || $ext === 'cts' || $ext === 'mjs' || $ext === 'cjs') {
			return 'fad fa-code icon-' . substr($ext, 1, 2);
		} else if ($ext === 'css') {
			return 'fad fa-code icon-' . $ext;
		} else if ($ext === 'c' || $ext === 'cpp' || $ext === 'h' || $ext === 'hpp' || $ext === 'py' || $ext === 'xml' || $ext === 'css' || $ext === 'java' || $ext === 'rb' || $ext === 'go' || $ext === 'swift' || $ext === 'rs' || $ext === 'map') {
			return 'fa fa-code';
		} else if ($ext === 'woff' || $ext === 'woff2' || $ext === 'ttf' || $ext === 'otf' || $ext === 'eot') {
			return 'fad fa-font-case';
		} else if ($ext === 'pdf') {
			return 'fad fa-file-pdf';
		} else if ($ext === 'csv') {
			return 'fad fa-file-csv';
		} else if ($ext === 'doc' || $ext === 'docx' || $ext === 'odt') {
			return 'fad fa-file-word';
		} else if ($ext === 'xls' || $ext === 'xlsx' || $ext === 'ods') {
			return 'fad fa-file-excel';
		} else if ($ext === 'ppt' || $ext === 'pptx' || $ext === 'odp') {
			return 'fad fa-file-powerpoint';
		} else if ($ext === 'epub' || $ext === 'mobi') {
			return 'fad fa-book';
		} else if ($ext === 'exe') {
			return 'fad fa-window-alt';
		} else if ($ext === 'dmg') {
			return 'fad fa-window';
		}
	}
	return 'fad fa-file';
}

foreach ($files as $file) {
	if ($file === '.') {
		continue;
	}
	$path = $dir . '/' . $file;

	$is_dir = is_dir($path);
	$ext = '';
	$icon = get_icon($file, $is_dir);
	if (!$is_dir) {
		$info = pathinfo($file);
		$ext = strtolower($info['extension'] ?? '.');
	}

	$size = $is_dir ? 0 : filesize($path);
	$size_text = '';
	if ($is_dir) {
		$size_text = '';
	} else if ($size > 1024 * 1024 * 1024) {
		$size_text = round($size / (1024 * 1024 * 1024), 2) . ' GiB';
	} else if ($size > 1024 * 1024) {
		$size_text = round($size / (1024 * 1024), 2) . ' MiB';
	} else if ($size > 1024) {
		$size_text = round($size / 1024, 2) . ' KiB';
	} else {
		$size_text = $size . ' bytes';
	}

	$next = [
		'name' => htmlentities($file),
		'mtime' => date('Y-m-d H:i:s', filemtime($path)),
		'icon' => $icon,
		'size' => $size,
		'ext' => $ext,
		'size_text' => $size_text,
	];
	if ($file === '..') {
		if (!$at_root) $up = $next;
	} else {
		$fileinfo[] = $next;
	}
}

$sort_by = $_GET['sort'] ?? $_GET['C'] ?? 'dir';
$sort_order = $_GET['order'] ?? $_GET['A'] ?? 'asc';
if ($sort_order === 'A') $sort_order = 'asc';
function sort_icon($col) {
	global $sort_by, $sort_order;
	if ($col === $sort_by) {
		return ' <i class="fa fa-caret-square-o-' . ($sort_order === 'asc' ? 'up' : 'down') . '"></i>';
	}
	return '';
}
function sort_link(string $col) {
	global $sort_by, $sort_order, $has_sprites;
	if ($col === $sort_by && $sort_order === 'asc') {
		return './?' . ($has_sprites ? 'view=dir&' : '') . 'sort=' . $col . '&order=desc';
	}
	if ($col === $sort_by && $sort_order === 'desc') {
		return './' . ($has_sprites ? '?view=dir' : '');
	}
	return './?' . ($has_sprites ? 'view=dir&' : '') . 'sort=' . $col;
}

if ($sort_by === 'name' || $sort_by === 'N') {
	usort($fileinfo, fn($a, $b) => strcmp($a['name'], $b['name']) * ($sort_order === 'asc' ? 1 : -1));
} else if ($sort_by === 'size' || $sort_by === 'S') {
	usort($fileinfo, fn($a, $b) => ($a['size'] <=> $b['size']) * ($sort_order === 'asc' ? 1 : -1));
} else if ($sort_by === 'mtime' || $sort_by === 'M') {
	usort($fileinfo, fn($a, $b) => $a['mtime'] <=> $b['mtime']) * ($sort_order === 'asc' ? 1 : -1);
} else if ($sort_by === 'type') {
	usort($fileinfo, fn($a, $b) => $a['ext'] <=> $b['ext']) * ($sort_order === 'asc' ? 1 : -1);
} else { // name, dirs-first
	usort($fileinfo, fn($a, $b) => !!$a['ext'] <=> !!$b['ext']) * ($sort_order === 'asc' ? 1 : -1);
}

?><!DOCTYPE html>
<html lang="en"><head>

	<meta charset="UTF-8" />

	<title><?= htmlentities(function_exists('dirindex_title') ? dirindex_title() : $rel_dir) ?> - Showdown!</title>

	<meta name="viewport" content="width=device-width" />
	<link rel="stylesheet" href="/dirindex/font-awesome.min.css" />
<?php if ($fa5pro) { ?>
	<link rel="stylesheet" href="/dirindex/fontawesome5-solid-duotone.min.css?" />
<?php } ?>

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
		.nav a.purplebutton {
			background: linear-gradient(to bottom,hsl(267, 36.40%, 46.90%),hsl(267, 42.60%, 26.70%));
		}
		.nav a.purplebutton:hover {
			background: linear-gradient(to bottom,hsl(267, 49.30%, 56.70%),hsl(267, 46.00%, 34.10%));
		}
		.nav a.purplebutton:active {
			background: linear-gradient(to bottom,hsl(267, 42.60%, 26.70%),hsl(267, 36.40%, 46.90%));
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
				color-scheme: dark;
			}
			a {
				color:rgb(99, 174, 209);
			}
			a:visited {
				color:rgb(177, 123, 195);
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
			text-decoration: none;
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
			color: #777;
		}
		.icon.fa-arrow-circle-o-up, .icon.fa-folder-open {
			color: #3798c5;
			--fa-secondary-opacity: 0.55;
		}
		.icon.fa-image, .icon.fa-picture-o, .icon.fa-film, .icon.fa-video, .icon.fa-video-camera, .icon.fa-volume, .icon.fa-volume-up {
			color: rgb(139, 115, 82);
			--fa-secondary-opacity: 0.4;
		}
		.icon.icon-js {
			color: rgb(160, 153, 89);
		}
		.icon.icon-ts, .icon.icon-md {
			color: rgb(83, 112, 149);
		}
		.icon.icon-html {
			color: rgb(166, 125, 67);
		}
		.icon.icon-php, .icon.icon-css {
			color: rgb(125, 83, 149);
		}
		.icon.fa-file-pdf, .icon.fa-file-pdf-o, .icon.fa-font-case {
			color: rgb(149, 83, 83);
		}
		.icon.fa-file-archive, .icon.fa-file-archive-o {
			color:rgb(116, 149, 163);
		}
		.filename {
			display: inline-block;
			width: 50%;
			min-width: 260px;
			font-family: monospace;
			font-size: 10pt;
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
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-26211653-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-26211653-1');
	</script>
	<!-- End Google Analytics -->
</head><body>

	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first" href="//pokemonshowdown.com/"><img src="//play.pokemonshowdown.com/pokemonshowdownbeta.png" srcset="//play.pokemonshowdown.com/pokemonshowdownbeta.png 1x, //play.pokemonshowdown.com/pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="//pokemonshowdown.com/dex/">Pok&eacute;dex</a></li>
			<li><a class="button" href="//replay.pokemonshowdown.com/">Replay</a></li>
			<li><a class="button purplebutton" href="//smogon.com/dex/" target="_blank">Strategy</a></li>
			<li><a class="button nav-last purplebutton" href="//smogon.com/forums/" target="_blank">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
		</ul></div>
	</header>

	<main>
		<h1>
			Index of
			<a href="/"><?= htmlentities($_SERVER['SERVER_NAME']) ?></a><?php

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

<?php if ($up) { ?>
		<p class="parentlink">
			<a class="row" href="../">
				<i class="icon fa fa-arrow-circle-o-up">
				</i><em>(Parent directory)
				</em>
			</a>
		</p>
<?php } ?>
<?php
if (function_exists('dirindex_intro')) {
	dirindex_intro();
}
$has_sprites = false;
$special_sprites = function_exists('dirindex_sprites');
if ($special_sprites || array_key_exists($rel_dir, $sprites_whitelist)) {
	$has_sprites = true;
	$view = $_GET['view'] ?? ($special_sprites ? 'sprites' : 'dir');
	if ($view !== 'dir') {
		require_once __DIR__ . '/spriteindex.inc.php';
		if ($special_sprites) {
			$sprites = dirindex_sprites();
		} else {
			chdir($dir);
			$sprites = $sprites_whitelist[$rel_dir];
		}
		showSpriteIndex($sprites, $dir);
		echo "</html>\n";
		die();
	}
?>
	<div>
		View:
		<ul class="nav" style="display:inline-block;vertical-align:middle;margin:0 10px 0 0">
			<li><a class="button nav-first" href="./?view=sprites">Sprites</a></li>
			<li><a class="button nav-last cur" href="./?view=dir">Directory</a></li>
		</ul>
	</div>
<?php
}
?>

		<ul class="dirlist">
			<li class="header">
				<a class="icon" href="<?= sort_link('type') ?>">&nbsp;<?= sort_icon('type') ?>

				</a><a class="filename" href="<?= sort_link('name') ?>">Name<?= sort_icon('name') ?>

				</a><a class="filesize" href="<?= sort_link('size') ?>">Size<?= sort_icon('size') ?>

				</a><a class="filemtime" href="<?= sort_link('mtime') ?>">Last Modified<?= sort_icon('mtime') ?></a>
			</li>
<?php foreach ($fileinfo as $file) : ?>
			<li>
				<a class="row" href="./<?= urlencode($file['name']) ?>">
					<i class="icon <?= $file['icon'] ?>">
					</i><code class="filename"><?= $file['name'] === '..' ? '(Parent directory)' : htmlentities($file['name']) ?>

					</code><em class="filesize"><?= $file['size_text'] ?>

					</em><small class="filemtime"><?= $file['mtime'] ?></small>
				</a>
			</li>
<?php endforeach; ?>
		</ul>

	</main>

</body>
