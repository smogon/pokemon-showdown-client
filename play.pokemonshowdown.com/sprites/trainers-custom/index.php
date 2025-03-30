<?php

function dirindex_title() {
	return "Custom avatars";
}

function dirindex_intro() {
?>
	<p>
		Did you want to see a list of all custom avatars? Sorry, that's private.
	</p>
	<p>
		Your avatar can be changed using the Options menu (it looks like <i class="fa fa-cog"></i>) in the upper right of Pokemon Showdown.
	</p>
</main>
<?php
	die();
}

require_once '../../dirindex/dirindex.php';
