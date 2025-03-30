<?php

function dirindex_title() {
	return "April Fool's back sprites";
}

function dirindex_intro() {
?>
	<h1 style="font-size: 12pt;">April Fool's back sprites</h1>
	<p>These are the back sprites. You can also <a href="../afd/">view the front sprites</a>.</p>
<?php
}

function dirindex_sprites() {
	return '*.png';
}

require_once '../../dirindex/dirindex.php';
