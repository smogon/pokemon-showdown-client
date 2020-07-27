<?php

error_reporting(0);

include '../style/wrapper.inc.php';

$page = '0.9';
$pageTitle = "Version 0.9";

includeHeader();

?>
		<div class="main" style="max-width:8in;">

			<p>
				Pok&eacute;mon Showdown 0.9 has been released!
			</p>

			<p>
				We have a ton of changes waiting, but here's a few of the more notable ones:
			</p>

			<h1>Completely redesigned main menu</h1>
			<p>
				<img src="/files/0.9screenshots/mainmenu.png" alt="" />
			</p>
			<p>
				The main menu's been redesigned from scratch. Buttons for everything you'd want to do on the left, and a beautiful background by Yilx (you can turn it off in the settings if you really want to, but it's seriously an amazing background).
			</p>

			<h1>Faster</h1>
			<p>
				It's not really something I can screenshot, but the new PS is faster, especially on tablets. Most people who've used it have commented that it's faster, so the speed increase is noticeable.
			</p>
			<p>
				As always, you can close the lobby chat for even more speed.
			</p>

			<h1>New PM and challenge system</h1>
			<p>
				<img src="/files/0.9screenshots/pm.png" alt="" />
			</p>
			<p>
				You can now challenge and PM from the same window! And PMs now show up side-by-side, so you can PM with lots of people at the same time.
			</p>
			<p>
				Switch between PM windows with Tab and Shift+Tab, and close PM windows with Esc.
			</p>

			<h1>Small user menus</h1>
			<p>
				<img src="/files/0.9screenshots/usermenu.png" alt="" />
			</p>
			<p>
				You don't have to be in the lobby to interact with users anymore. You can now click on any username: in the user list, in chat, in battles, in PMs... and it'll pop up this mini-menu.
			</p>

			<h1>Filter "Watch Battles" by format</h1>
			<p>
				<img src="/files/0.9screenshots/watchbattles.png" alt="" />
			</p>

			<h1>Teambuilder EV sliders and base stats</h1>
			<p>
				<img src="/files/0.9screenshots/sliders.png" alt="" />
			</p>
			<p>
				The long-requested sliders for EVs are now finally here.
			</p>
			<p>
				Base stats are now displayed in the teambuilder, too.
			</p>

			<h1>Effect and music volume</h1>
			<p>
				<img src="/files/0.9screenshots/volume.png" alt="" />
			</p>
			<p>
				You can now control volume, and effects and music are controlled separately, so you can turn off music (and listen to your own music) while still hearing cries.
			</p>

			<h1>More room</h1>
			<p>
				<img src="/files/0.9screenshots/multicolumn.png" alt="" />
			</p>
			<p>
				Without the left sidebar, we can fit lobby chat next to battle chat on screens as small as 1280 pixels wide, which includes most laptops that aren't considered netbooks.
			</p>

			<h1>PP in teambuilder and !data</h1>
			<p>
				<img src="/files/0.9screenshots/teambuilder-pp.png" alt="" />
			</p>
			<p>
				I managed to fit PP into the move list and !data.
			</p>

			<h1>Move and delete pokemon in teams</h1>
			<p>
				<img src="/files/0.9screenshots/teambuilder-move.png" alt="" />
			</p>
			<p>
				You can move and delete pokemon in teams in the teambuilder now.
			</p>

			<h1>Much more</h1>
			<p>
				There are a lot of small things that are improved. Feel free to look around.
			</p>

			<h1>Credits</h1>
			<p>
				<img src="/files/0.9screenshots/credits.png" alt="" />
			</p>

			<p class="mainbutton">
				<a class="button greenbutton" href="//play.pokemonshowdown.com/">Play online</a>
			</p>

		</div>
		<script src="/js/jquery-1.9.1.min.js"></script>
		<script src="/js/jquery.browser.min.js"></script>
		<script src="/js/jquery.zoomooz.min.js"></script>
		<script>
		<!--
		var zoomed = false;
		$('.screenshot').css('cursor','pointer').click(function(e){
			if (zoomed) {
				return;
			}
			e.stopPropagation();
			$('#ad-div').hide();
			$('#ad-div2').hide();
			$(this).zoomTo({
				targetsize: 0.95,
				closeclick: true,
				animationendcallback: function() {
					zoomed = true;
					$(document.body).click(function(e){
						e.stopPropagation();
						e.preventDefault();
						$('#ad-div').show();
						$('#ad-div2').show();
						$(document.body).zoomTo();
						zoomed = false;
						$(document.body).off('click');
					});
				}
			});
		});
		-->
		</script>
<?php

includeFooter();

?>
