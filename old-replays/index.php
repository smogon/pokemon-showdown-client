<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

include 'theme/panels.lib.php';
// require_once '../../pokemonshowdown.com/lib/ntbb-database.lib.php';
require_once __DIR__ . '/../config/servers.inc.php';

$panels->setPageTitle('Replays');
$panels->setPageDescription('Watch replays of battles on Pokémon Showdown!');
$panels->setTab('replay');
$panels->start();
?>
	<div class="pfx-panel"><div class="pfx-body pfx-body-padded">
		<h1>Upload replays</h1>
		<p>
			To upload a replay, click "Share" or use the command <code>/savereplay</code> in a Pok&eacute;mon Showdown battle!
		</p>
		<h1>Search replays</h1>
		<!--p>Username search temporarily down, will be back up soon</p-->
		<form action="/search/" method="get" data-target="replace">
			<p style="text-align:center">
				<label><input type="text" name="user" class="textbox" placeholder="Username" size="24" /></label>
				<button type="submit"><strong>Search for user</strong></button>
			</p>
		</form>
		<form action="/search/" method="get" data-target="replace">
			<p style="text-align:center">
				<label><input type="text" name="format" class="textbox" placeholder="Format" size="24" /></label>
				<button type="submit"><strong>Search by format</strong></button>
			</p>
		</form>
		<h1>Featured replays</h1>
		<ul class="linklist" style="max-width:480px;margin:0 auto;text-align:center">
			<h3>Fun</h3>
			<li><a href="/oumonotype-82345404" data-target="push">
				<small>[oumonotype]<br /></small>
				<strong>kdarewolf</strong> vs. <strong>Onox</strong>
				<small><br />Protean + prediction</small>
			</a></li>
			<li><a href="/anythinggoes-218380995" data-target="push">
				<small>[anythinggoes]<br /></small>
				<strong>Anta2</strong> vs. <strong>dscottnew</strong>
				<small><br />Cheek Pouch</small>
			</a></li>
			<li><a href="/uberssuspecttest-147833524" data-target="push">
				<small>[ubers]<br /></small>
				<strong>Metal Brellow</strong> vs. <strong>zig100</strong>
				<small><br />Topsy-Turvy</small>
			</a></li>
			<li><button class="button" onclick="$('.older2').show();$(this).parent().hide()">Older</button></li>
			<li class="older2" style="display:none"><a href="/smogondoubles-75588440" data-target="push">
				<small>[smogondoubles]<br /></small>
				<strong>jamace6</strong> vs. <strong>DubsWelder</strong>
				<small><br />Garchomp sweeps 11 pokemon</small>
			</a></li>
			<li class="older2" style="display:none"><a href="/ou-20651579" data-target="push">
				<small>[ou]<br /></small>
				<strong>RainSeven07</strong> vs. <strong>my body is regi</strong>
				<small><br />An entire team based on Assist V-create</small>
			</a></li>
			<li class="older2" style="display:none"><a href="/balancedhackmons7322360" data-target="push">
				<small>[balancedhackmons]<br /></small>
				<strong>a ver</strong> vs. <strong>Shuckie</strong>
				<small><br />To a ver's frustration, PP stall is viable in Balanced Hackmons</small>
			</a></li>
			<h3>Competitive</h3>
			<li><a href="/doublesou-232753081" data-target="push" style="white-space:normal">
			<small>[doubles ou]<br /></small>
			<strong>Electrolyte</strong> vs. <strong>finally</strong>
			<small><br />finally steals Electrolyte's spot in the finals of the Doubles Winter Seasonal by outplaying Toxic Aegislash.</small>
			</a></li>
			<li><a href="/smogtours-gen5ou-59402" data-target="push" style="white-space:normal">
			<small>[bw ou]<br /></small>
			<strong>Reymedy</strong> vs. <strong>Leftiez</strong>
			<small><br />Reymedy's superior grasp over BW OU lead to his claim of victory over Leftiez in the No Johns Tournament.</small>
			</a></li>
			<li><a href="/smogtours-gen3ou-56583" data-target="push" style="white-space:normal">
			<small>[adv ou]<br /></small>
			<strong>pokebasket</strong> vs. <strong>Alf'</strong>
			<small><br />pokebasket proved Blissey isn't really one to take a Focus Punch well in his victory match over Alf' in the Fuck Trappers ADV OU tournament.</small>
			</a></li>
			<li><a href="/smogtours-ou-55891" data-target="push" style="white-space:normal">
			<small>[oras ou]<br /></small>
			<strong>Marshall.Law</strong> vs. <strong>Malekith</strong>
			<small><br />In a "match full of reverses", Marshall.Law takes on Malekith in the finals of It's No Use.</small>
			</a></li>
			<li><a href="/smogtours-ubers-54583" data-target="push" style="white-space:normal">
				<small>[custom]<br /></small>
				<strong>hard</strong> vs. <strong>panamaxis</strong>
				<small><br />Dark horse panamaxis proves his worth as the rightful winner of The Walkthrough Tournament in this exciting final versus hard.</small>
			</a></li>
			<li><button class="button" onclick="$('.older1').show();$(this).parent().hide()">Older</button></li>
			<li class="older1" style="display:none"><a href="/smogtours-ubers-34646" data-target="push" style="white-space:normal">
				<small>[oras ubers]<br /></small>
				<strong>steelphoenix</strong> vs. <strong>Jibaku</strong>
				<small><br />In this SPL Week 4 battle, Jibaku's clever plays with Mega Sableye keep the momentum mostly in his favor.</small>
			</a></li>
			<li class="older1" style="display:none"><a href="/smogtours-uu-36860" data-target="push" style="white-space:normal">
				<small>[oras uu]<br /></small>
				<strong>IronBullet93</strong> vs. <strong>Laurel</strong>
				<small><br />Laurel outplays IronBullet's Substitute Tyrantrum with the sly use of a Shuca Berry Cobalion, but luck was inevitably the deciding factor in this SPL Week 6 match.</small>
			</a></li>
			<li class="older1" style="display:none"><a href="/smogtours-gen5ou-36900" data-target="push" style="white-space:normal">
				<small>[bw ou]<br /></small>
				<strong>Lowgock</strong> vs. <strong>Meridian</strong>
				<small><br />This SPL Week 6 match features impressive plays, from Jirachi sacrificing itself to paralysis to avoid a burn to some clever late-game switches.</small>
			</a></li>
			<li class="older1" style="display:none"><a href="/smogtours-gen4ou-36782" data-target="push" style="white-space:normal">
				<small>[dpp ou]<br /></small>
				<strong>Heist</strong> vs. <strong>liberty32</strong>
				<small><br />Starting out as an entry hazard-filled stallfest, this close match is eventually decided by liberty32's efficient use of Aerodactyl.</small>
			</a></li>
			<li class="older1" style="display:none"><a href="/randombattle-213274483" data-target="push" style="white-space:normal">
				<small>[randombattle]<br /></small>
				<strong>The Immortal</strong> vs. <strong>Amphinobite</strong>
				<small><br />Substitute Lugia and Rotom-Fan take advantage of Slowking's utility and large HP stat, respectively, in this high ladder match.</small>
			</a></li>
		</ul>
		<h1>Recent replays</h1>
		<ul class="linklist" style="max-width:480px;margin:0 auto;text-align:center">
<?php

// $replays = [];
// echo "<p>";
// echo "Recent replays are currently unavailable due to database load. They'll be back very soon!";
// echo "</p>";

require_once 'replays.lib.php';

if (!$Replays->db) {
	echo "<p>";
	echo @$Replays->offlineReason ? $Replays->offlineReason : "Replays are currently offline due to technical difficulties. We'll be back up soon!";
	echo "</p>";
} else {

	$replays = $Replays->recent();

	$time = time();
	$timeoffset = 60;

	foreach ($replays as $replay) {
		$timetext = '';
		while ($timeoffset >= 0 && $replay['uploadtime'] < $time - $timeoffset) {
			switch ($timeoffset) {
			case 60:
				$timetext = '<h3>1 minute ago</h3>';
				$timeoffset = 120;
				break;
			case 120:
				$timetext = '<h3>2 minutes ago</h3>';
				$timeoffset = 180;
				break;
			case 180:
				$timetext = '<h3>3 minutes ago</h3>';
				$timeoffset = 240;
				break;
			case 240:
				$timetext = '<h3>4 minutes ago</h3>';
				$timeoffset = 300;
				break;
			case 300:
				$timetext = '<h3>5 minutes ago</h3>';
				$timeoffset = 600;
				break;
			case 600:
				$timetext = '<h3>10 minutes ago</h3>';
				$timeoffset = 1200;
				break;
			case 1200:
				$timetext = '<h3>20 minutes ago</h3>';
				$timeoffset = 1800;
				break;
			case 1800:
				$timetext = '<h3>30 minutes ago</h3>';
				$timeoffset = 3600;
				break;
			case 3600:
				$timetext = '<h3>1-2 hours ago</h3>';
				$timeoffset = 2*3600;
				break;
			case 2*3600:
				$timetext = '<h3>2-3 hours ago</h3>';
				$timeoffset = 3*3600;
				break;
			case 3*3600:
				$timetext = '<h3>3-4 hours ago</h3>';
				$timeoffset = 4*3600;
				break;
			case 4*3600:
				$timetext = '<h3>4-8 hours ago</h3>';
				$timeoffset = 8*3600;
				break;
			case 8*3600:
				$timetext = '<h3>8-12 hours ago</h3>';
				$timeoffset = 12*3600;
				break;
			case 12*3600:
				$timetext = '<h3>12-24 hours ago</h3>';
				$timeoffset = 24*3600;
				break;
			case 24*3600:
				$timetext = '<h3>1-2 days ago</h3>';
				$timeoffset = 2*24*3600;
				break;
			case 2*24*3600:
				$timetext = '<h3>2-3 days ago</h3>';
				$timeoffset = 3*24*3600;
				break;
			case 3*24*3600:
				$timetext = '<h3>3 days ago</h3>';
				$timeoffset = 5*24*3600;
				break;
			default:
				$timeoffset = -1;
				break;
			}
		}
		echo $timetext;
		$server = '';
		if (preg_match('/^([a-z0-9]+)-[a-z0-9]+-[0-9]+$/', $replay['id'], $matches)) {
			$serverid = $matches[1];
			if (!isset($PokemonServers[$serverid])) {
				// This should be impossible.
				$server = 'unknown server';
			} else {
				$server = strtolower($PokemonServers[$serverid]['name']);
			}
		}
?>
		<li><a href="/<?php echo htmlspecialchars($replay['id']); ?>" data-target="push"><small>[<?php echo htmlspecialchars($replay['format']); ?><?php if ($server) echo ' - ' . htmlspecialchars($server) ?>]<br /></small> <strong><?php echo htmlspecialchars($replay['p1']); ?></strong> vs. <strong><?php echo htmlspecialchars($replay['p2']); ?></strong></a></li>
<?php
	}
}

?>
		</ul>
	</div></div>

<?php

$panels->end();

?>
