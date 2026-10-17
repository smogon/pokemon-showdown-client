<?php

function dirindex_title() {
	return "Custom avatars";
}

function dirindex_intro() {
?>
	<p>
		Did you want to see a list of all custom avatars? Out of respect for users who want to be private, that's not available here. Sorry! Most users do like theirs to be public, though, so you can find details in.
	</p>
	<ul>
		<li><a href="https://www.smogon.com/smeargle/customs/">The custom avatar index</a></li>
		<li><a href="https://www.smogon.com/forums/threads/ps-custom-avatars.3725920/">The custom avatars announcement thread</a></li>
		<li><a href="https://www.smogon.com/forums/threads/all-avatars-on-pok%C3%A9mon-showdown.3535547/page-21">The custom avatars discussion thread</a></li>
	</ul>
	<p>
		Your own avatar can be changed using the Options menu (it looks like <i class="fa fa-cog"></i>) in the upper right of Pokemon Showdown.
	</p>
</main>
<?php
	die();
}

require_once '../../dirindex/dirindex.php';
