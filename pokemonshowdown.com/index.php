<!DOCTYPE html>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

<title>Pok&eacute;mon Showdown! battle simulator</title>

<link rel="stylesheet" href="/style/global.css?v16" />

<?php
include_once __DIR__ . '/../config/config.inc.php';
include_once __DIR__ . '/../config/ads-landing.inc.php';
@insertAtHead();
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
<style>
	.left {
		float: left;
		width: 560px;
	}
	.right {
		margin-left: 590px;
	}
	@media (max-width:880px) {
		.left iframe {
			width: 275px;
			height: 144px;
		}
		.left {
			width: 275px;
		}
		.right {
			margin-left: 290px;
		}
	}
	@media (max-width:600px) {
		.left {
			float: none;
			text-align: center;
			width: auto;
		}
		.right {
			margin-left: 0;
		}
	}
	.mainbutton {
		text-align: center;
	}
	.mainbutton .button {
		background: #3a884f;
		background: linear-gradient(to bottom, #4ca363, #276136);
		font-size: 16pt;
		padding: 12px 20px;
	}
	.mainbutton .button:hover {
		background: linear-gradient(to bottom, #5ac777, #2f7f44);
	}
	.mainbutton .button:active {
		background: linear-gradient(to bottom, #276136, #4ca363);
	}

</style>

<div class="body">

	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first cur" href="/"><img src="/images/pokemonshowdownbeta.png" srcset="/images/pokemonshowdownbeta.png 1x, /images/pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="/dex/">Pok&eacute;dex</a></li>
			<li><a class="button" href="//replay.pokemonshowdown.com/">Replay</a></li>
			<li><a class="button purplebutton" href="//smogon.com/dex/" target="_blank">Strategy</a></li>
			<li><a class="button nav-last purplebutton" href="//smogon.com/forums/" target="_blank">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
		</ul></div>
	</header>

	<div class="main">
		<div class="main-spacer"><?php @insertAboveIntro(); ?></div>

		<section class="section" style="max-width: 850px">
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
					<a class="button greenbutton" href="http://<?= $psconfig['routes']['client'] ?>/?insecure">Play (insecure mode)</a>
<?php } else { ?>
					<a class="button greenbutton" href="//<?= $psconfig['routes']['client'] ?>/">Play online</a>
<?php } ?>
				</p>
				<p class="mainbutton" id="win-install" style="display:none;text-align:center;color:#777;margin:-10px 0 -0px 0">
					or<br /><a href="https://<?= $psconfig['routes']['root'] ?>/autodownload/win">Install <small>(Windows)</small></a>
				</p>
				<p class="mainbutton" id="mac-install" style="display:none;text-align:center;color:#777;margin:-10px 0 -0px 0">
					or<br /><a href="https://<?= $psconfig['routes']['root'] ?>/autodownload/mac">Install <small>(OS X)</small></a>
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
	// document.getElementById('mac-install').style.display = 'block';
	// document.getElementById('install-after').innerHTML = '<p style="text-align:center;color:#777;margin:-10px 0 -0px 0"><small><em>or</em></small></p><p class="subtle" style="text-align:center"><a href="//play.pokemonshowdown.com/" class="button" style="padding:9px 24px"><strong>Play online</strong></a></p>';
} else if (BrowserDetect.OS === 'Windows') {
	// document.getElementById('play-online').style.display = 'none';
	// document.getElementById('win-install').style.display = 'block';
	// document.getElementById('install-after').innerHTML = '<p style="text-align:center;color:#777;margin:-10px 0 -0px 0"><small><em>or</em></small></p><p class="subtle" style="text-align:center"><a href="//play.pokemonshowdown.com/" class="button" style="padding:9px 24px"><strong>Play online</strong></a></p>';
}

				</script>
			</div>

			<div class="under-main" style="clear:both;padding-top:1px">

				<div class="main-spacer"><?php @insertBelowIntro(); ?></div>
				<div style="clear:both;padding-top:1px"></div>
			</div>
		</section>
	</div>
</div>

<section class="section">
	<!--h1>Links</h1-->
	<style>
	.hlinklist {
		list-style: none;
		margin: 1em 0 0 0;
		padding: 0;
		font-size: 18pt;
	}
	.hlinklist li {
		width: 255px;
		float: left;
		margin: 0;
		padding: 0 3px 1em;
	}
	.hlinklist .blocklink {
		padding: 6px 0;
		margin: 0;
		text-align: center;
		font-size: 16pt;
	}
	</style>
	<ul class="hlinklist">
		<li>
			<a class="blocklink" href="/damagecalc/" target="_blank"><i class="fa fa-tachometer"></i> Damage calculator</a>
		</li>
		<li>
			<a class="blocklink" href="http://www.smogon.com/stats/" target="_blank"><i class="fa fa-sort-amount-desc"></i> Usage stats</a>
		</li>
		<li>
			<a class="blocklink" href="https://github.com/smogon/Pokemon-Showdown" target="_blank"><i class="fa fa-github"></i> GitHub repository</a>
		</li>
	</ul>
	<p style="text-align: center; clear: both">
		<a href="https://twitter.com/PokemonShowdown">@PokemonShowdown on Twitter</a>
	</p>

	<div style="clear:both;padding-top:1px"></div>
</section>

<style>
.sections-container {
	max-width: 1000px;
	margin: 0 auto;
}
.section-servers {
	float: left;
	margin: 0;
	width: 200px;
}
.section-news {
	margin-left: 260px;
}
@media (max-width:600px) {
	.section-servers, .section-news {
		float: none;
		width: auto;
		margin: 20px 10px;
	}
}

.linklist {
	list-style: none;
	margin: 0;
	padding: 0;
}
.linklist .blocklink {
	margin: 3px 0;
}

</style>

<div class="sections-container">

	<section class="section section-servers">
		<h1>Servers</h1>
		<ul class="linklist">
			<?php include 'lib/serverlist.inc.php'; ?>
		</ul>
	</section>

<?php
include __DIR__ . '/../config/news.inc.php';
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
	<section class="section section-news">
		<h1><?php echo $topic['title_html']; ?></h1>
		<?php echo @$topic['summary_html'] ?>
		<p>
			&mdash;<strong><?php echo $topic['authorname']; ?></strong> <small class="date">on <?php echo readableDate($topic['date']); ?></small> <small><a href="/news/<?= $topic['topic_id'] ?>"><?= isset($topic['details']) ? 'Read more' : 'Permalink' ?></a></small>
		</p>
	</section>
<?php
	if (++$count >= 2) break;
	if ($count === 1) {
		@insertBetweenNews();
	}
}

?>
	<section class="section section-news">
		<a href="/news/" class="button">Older news &raquo;</a>
	</section>

	<div style="clear:both;"></div>
</div>

<footer>
	<p>
		<small><a href="/rules">Rules</a> | <a href="/privacy">Privacy policy</a> | <a href="/credits">Credits</a> | <a href="/contact">Contact</a></small>
	</p>
</footer>

<?php @insertAtEnd(); ?>
