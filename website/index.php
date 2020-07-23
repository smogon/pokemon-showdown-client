<?php

// error_reporting(0);

include 'style/wrapper.inc.php';

function servercmp($a, $b) {
	global $usercount;
	if ($a['id'] === 'showdown') return -1;
	if ($b['id'] === 'showdown') return 1;
	if (!empty($usercount[$a['id']])) {
		if (!empty($usercount[$b['id']])) {
			return $usercount[$b['id']] - $usercount[$a['id']];
		}
		return -1;
	} else if (!empty($usercount[$b['id']])) {
		return 1;
	} else if (isset($usercount[$a['id']]) && !isset($usercount[$b['id']])) {
		return -1;
	} else if (isset($usercount[$b['id']]) && !isset($usercount[$a['id']])) {
		return 1;
	}
	return $a['sortorder'] - $b['sortorder'];
}

$page = 'home';
$pageTitle = "Home";

$externProtocol = 'http:';
if ($_SERVER['REQUEST_URI'] === '/secure') {
	$externProtocol = '';
}

$serverbits = '';
$serverbitscache = 'config/userbitscache.html';
$lastmodified = @filemtime($serverbitscache);
if ($lastmodified && (time() - $lastmodified < 60 * 10)) {
	$serverbits = file_get_contents($serverbitscache);
} else {
	include_once 'config/servers.inc.php';
	include_once 'lib/ntbb-database.lib.php';
	$query = $psdb->query("SELECT `serverid`, `date`, `usercount` FROM `ntbb_userstats`");
	$usercount = array();
	$timenow = time();
	while ($row = $psdb->fetch_assoc($query)) {
		if (($timenow - $row['date'] / 1000 > 60 * 30) && ($row['serverid'] !== 'showdown')) {
			$usercount[$row['serverid']] = false; // inactive server
		} else {
			$usercount[$row['serverid']] = $row['usercount'];
		}
	}
	$sortorder = 0;
	foreach ($PokemonServers as &$server) {
		$server['sortorder'] = $sortorder++;
		if ($server['id'] === 'showdown') {
			$server['uri'] = $externProtocol . '//play.pokemonshowdown.com';
		} else {
			$server['uri'] = 'http://' . $server['id'] . '.psim.us';
		}
	}
	uasort($PokemonServers, 'servercmp');
	ob_start();
	$more = false;
	foreach ($PokemonServers as &$server) {
		if (!empty($server['hidden'])) continue;
		if (!isset($usercount[$server['id']])) continue;
		if (($c = $usercount[$server['id']]) === false) continue;
		$usersbit = "<br />$c user" . ((intval($c) !== 1) ? 's' : '') . " online";
		if (!$c && !$more && $server['id'] !== 'showdown') {
			echo '</ul><button class="button" type="button" onclick="document.getElementById(\'moreservers\').style.display=\'block\';this.style.display=\'none\';return false">More</button><ul class="linklist" id="moreservers" style="display:none">';
			$more = true;
		}
?>
		<li><a href="<?php echo $server['uri'] ?>"><?php if ($server['id'] === 'showdown') echo '<strong>',$server['name'],'<br />(official server)</strong>'; else echo $server['name']; ?><small><?php /**echo $server['server']; if ($server['port'] != 8000) echo ':',$server['port'];**/ echo $usersbit; ?></small></a></li>
<?php
	}
	$serverbits = ob_get_clean();
	file_put_contents($serverbitscache, $serverbits, LOCK_EX);
}

includeHeaderTop();
?>
<style>
@font-face {
  font-family: 'FontAwesome';
  src: url('/theme/fonts/fontawesome-webfont.eot?v=4.0.3');
  src: url('/theme/fonts/fontawesome-webfont.eot?#iefix&v=4.0.3') format('embedded-opentype'), url('/theme/fonts/fontawesome-webfont.woff?v=4.0.3') format('woff'), url('/theme/fonts/fontawesome-webfont.ttf?v=4.0.3') format('truetype'), url('/theme/fonts/fontawesome-webfont.svg?v=4.0.3#fontawesomeregular') format('svg');
  font-weight: normal;
  font-style: normal;
}
.fa {
  display: inline-block;
  font-family: FontAwesome;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.fa-tachometer:before {content: "\f0e4";}
.fa-sort-amount-desc:before {content: "\f161";}
.fa-github:before {content: "\f09b";}
</style>
<?php
includeHeaderBottom();

?>
		<div class="main">

			<div class="main-spacer"><div id="ad-div">
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- PS home 1 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6535472412829264"
     data-ad-slot="6218061333"
     data-ad-format="auto"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
			</div></div>

			<div class="left">
				<!--div class="screenshot"><img src="/images/screenshot-desktop.png" alt="" width="549" height="288" style="border:1px solid #AAAAAA;box-shadow: 3px 3px 3px rgba(0,0,0,.2);image-rendering: -moz-auto;" /></div-->
				<iframe width="560" height="315" src="https://www.youtube.com/embed/daw9GoZWWSI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
			</div>
			<div class="right">
				<p>
					Pok&eacute;mon Showdown is a Pok&eacute;mon battle simulator. Play Pok&eacute;mon battles online! Play with randomly generated teams, or build your own! Fully animated!
				</p>
				<p class="mainbutton" id="play-online">
<?php if (isset($_REQUEST['insecure'])) { ?>
					<a class="button greenbutton" href="http://play.pokemonshowdown.com/?insecure">Play (insecure mode)</a>
<?php } else { ?>
					<a class="button greenbutton" href="<?= $externProtocol ?>//play.pokemonshowdown.com/">Play online</a>
<?php } ?>
				</p>
				<p class="mainbutton" id="win-install" style="display:none;text-align:center;color:#777;margin:-10px 0 -0px 0">
					or<br /><a href="https://pokemonshowdown.com/autodownload/win">Install <small>(Windows)</small></a>
				</p>
				<p class="mainbutton" id="mac-install" style="display:none;text-align:center;color:#777;margin:-10px 0 -0px 0">
					or<br /><a href="https://pokemonshowdown.com/autodownload/mac">Install <small>(OS X)</small></a>
				</p>
				<!--p class="mainbutton" id="chrome-install" style="display:none">
					<a class="button greenbutton" href="http://play.pokemonshowdown.com/showdown.crx">Install Chrome app</a>
				</p>
				<p class="mainbutton" id="firefox-install" style="display:none">
					<button class="button greenbutton" onclick="navigator.mozApps.install('http://play.pokemonshowdown.com/showdown.webapp');return false">Install Firefox app</button>
				</p-->
				<div id="install-after"></div>
				<!--div class="error">
					<p>Pok&eacute;mon Showdown is offline due to a DDoS attack!</p>
					<p><span class="pokemonicon" style="display:block;height:24px;width:32px;background:transparent url(//play.pokemonshowdown.com/sprites/bwicons-sheet.png?v0.8.5) no-repeat scroll -288px -424px"></span> Bear with us as we freak out.</p>
					<p>(We'll be back up in a few hours.)</p>
				</div-->
				<script>
				<!--
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{
			string: navigator.userAgent,
			subString: "Chromium",
			identity: "Chromium"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();
				if (BrowserDetect.browser === 'Chrome' || BrowserDetect.browser === 'Chromium') {
					//document.getElementById('chrome-install').style.display = 'block';
				}
				if (navigator && navigator.mozApps && navigator.mozApps.install) {
					// document.getElementById('firefox-install').style.display = 'block';
				}
				if (BrowserDetect.OS === 'Mac') {
					// document.getElementById('play-online').style.display = 'none';
					document.getElementById('mac-install').style.display = 'block';
					// document.getElementById('install-after').innerHTML = '<p style="text-align:center;color:#777;margin:-10px 0 -0px 0"><small><em>or</em></small></p><p class="subtle" style="text-align:center"><a href="//play.pokemonshowdown.com/" class="button" style="padding:9px 24px"><strong>Play online</strong></a></p>';
				} else if (BrowserDetect.OS === 'Windows') {
					// document.getElementById('play-online').style.display = 'none';
					document.getElementById('win-install').style.display = 'block';
					// document.getElementById('install-after').innerHTML = '<p style="text-align:center;color:#777;margin:-10px 0 -0px 0"><small><em>or</em></small></p><p class="subtle" style="text-align:center"><a href="//play.pokemonshowdown.com/" class="button" style="padding:9px 24px"><strong>Play online</strong></a></p>';
				}

				-->
				</script>
			</div>

			<div class="under-main" style="clear:both;padding-top:1px">

				<div class="main-spacer"><div id="ad-div2">
<?php /*
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- PS home 2 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6535472412829264"
     data-ad-slot="7694794531"
     data-ad-format="auto"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
*/ ?>
				</div></div>
				<div style="clear:both;padding-top:1px"></div>

				<h1>Links</h1>
				<style>
				.hlinklist {
					font-size: 18pt;
				}
				.hlinklist li {
					width: 278px;
					float: left;
					margin-right:8px;
				}
				.hlinklist li a {
					padding: 6px 0;
					text-align: center;
				}
				</style>
				<ul class="linklist hlinklist">
					<li>
						<a href="/damagecalc/" target="_blank"><i class="fa fa-tachometer"></i> Damage calculator</a>
					</li>
					<li>
						<a href="http://www.smogon.com/stats/" target="_blank"><i class="fa fa-sort-amount-desc"></i> Usage stats</a>
					</li>
					<li>
						<a href="https://github.com/Zarel/Pokemon-Showdown" target="_blank"><i class="fa fa-github"></i> GitHub repository</a>
					</li>
				</ul>
				<p style="text-align: center; clear: both">
					<a href="https://twitter.com/PokemonShowdown">@PokemonShowdown on Twitter</a>
				</p>

				<div style="clear:both;padding-top:1px"></div>

				<div class="section-servers">

					<h1>Servers</h1>
					<ul class="linklist">
						<?php echo $serverbits ?>
					</ul>

				</div><div class="section-news">

					<!--h1>Features</h1>
					<h2>Spam protection</h2>
					<p>
						Pok&eacute;mon Showdown comes with built-in spam protection. A spammer named Mushroomist gives this testimonial:
					</p>
					<blockquote><p>
						&#8220;This is a simple little script I had made [to spam], sadly, PS was such a terrible program that it decided to not do the whole thing as planned.&#8221;
					</p></blockquote>
					<h2>Open-source</h2>
					<p>
						Pok&eacute;mon Showdown is actively developed in the <a href="https://github.com/Zarel/Pokemon-Showdown">Pok&eacute;mon Showdown GitHub repository</a>. Come lend a hand!
					</p-->

<?php
include 'config/news.inc.php';
function readableDate($time=0) {
	if (!$time) {
		$time = time();
	}
	return date('M j, Y',$time);
}

$count = 0;
foreach ($latestNewsCache as $topic_id) {
	$topic = $newsCache[$topic_id];
?>
					<h1><?php echo $topic['title_html']; ?></h1>
					<?php echo @$topic['summary_html'] ?>
					<p>
						&mdash;<strong><?php echo $topic['authorname']; ?></strong> <small class="date">on <?php echo readableDate($topic['date']); ?></small> <small><a href="/news/<?= $topic['topic_id'] ?>"><?= isset($topic['details']) ? 'Read more' : 'Permalink' ?></a></small>
					</p>
<?php
	if (++$count >= 2) break;
	if ($count === 1) {
?>
					<div style="height:280px;margin:10px 0 -10px"><div style="text-align:center" id="ad-div3">
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- PS Home 3 LR -->
<ins class="adsbygoogle"
     style="display:inline-block;width:336px;height:280px"
     data-ad-client="ca-pub-6535472412829264"
     data-ad-slot="9252930937"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
					</div></div>
<?php
		}
}

?>
					<p>
						<a href="/news/" class="button" style="padding: 2px 6px">Older news &raquo;</a>
					</p>

				</div>
			</div>

		</div>
<?php

includeFooter();

?>
