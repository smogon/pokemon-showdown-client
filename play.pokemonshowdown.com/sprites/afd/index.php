<?php

function dirindex_title() {
	return "April Fool's front sprites";
}

function dirindex_intro() {
?>
	<h1 style="font-size: 12pt;">April Fool's front sprites</h1>
	<p>These are the front sprites. You can also <a href="../afd-back/">view the back sprites</a>.</p>
	<p>&raquo; <a href="//www.pokemonshowdown.com/files/pokemon-showdown-afd-2020.zip"><strong><i class="fa fa-file-archive-o"></i> pokemon-showdown-afd-2020.zip</strong></a></p>
<?php
}

function dirindex_sprites() {
	return '*.png';
}

require_once '../../dirindex/dirindex.php';
