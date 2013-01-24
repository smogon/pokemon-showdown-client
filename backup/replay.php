<?php

if ($_SERVER['HTTP_HOST'] === 'aesoft.org')
{
	if (substr($_SERVER['REQUEST_URI'],0,9)==='/pokemon/')
	{
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: http://pokemon.aesoft.org/'.substr($_SERVER['REQUEST_URI'],9));
		die();
	}
}

include 'replays.inc.php';

$showConvertLinks = (isset($_REQUEST['convert'])?true:false);
$error = '';

function parseName($name)
{
	$monthTable = array('january' => '01', 'february' => '02', 'march' => '03', 'april' => '04', 'may' => '05', 'june' => '06', 'july' => '07', 'august' => '08', 'september' => '09', 'october' => '10', 'november' => '11', 'december' => '12');
	if (substr($name, -5) === '.html') $name = substr($name,0,-5);
	if (substr($name, -4) === '.htm') $name = substr($name,0,-4);
	if (preg_match('/^(.*)\-\-([0-9]+) ([A-Z][a-z]+) ([0-9]+) at ([0-9]+)h([0-9]+)$/', $name, $matches))
	{
		$name = trim($matches[1]).'--'.$matches[4].'-'.$monthTable[strtolower($matches[3])].'-'.$matches[2];
	}
	$name = str_replace(' ','-',$name);
	
	$name = preg_replace('/[^A-Za-z0-9-]+/', '', $name);
	return $name;
}


if ($_REQUEST['name'])
{
	$replay =& $REPLAYS[$_REQUEST['name']];
	if (!$replay)
	{
		$replay['id'] = $_REQUEST['name'];
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<!--

Hi! I notice you're viewing the source of my replay viewer! ^^

That's cool. I'll give you an overview of the relevant files. :)

battle.js - rendering engine
battle.css - layout file
   These are licensed CC-BY-NC-3.0 and are the only non-open source files in the bunch. :(
   Sorry. I'll try to open-source them sometime in the future, but no guarantees. :(
     <http://pokemon.aesoft.org/js/battle.js>
     <http://pokemon.aesoft.org/battle.css>

battledata.js - move animations and resource file data
   This file also contains detailed information on licensing for the relevant resource files.
   It's licensed CC-0 (public domain).
     <http://pokemon.aesoft.org/js/battledata.js>

converter.lib.php - converter from PO replay to format the rendering engine understands
   It's kinda spaghetti-code. :( Don't trust the variable names.
   It's licensed CC-0 (public domain).
     <http://pokemon.aesoft.org/converter.src.php>

-->

		<?php if (!isset($_REQUEST['dev'])) { ?><meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=IE8" /><?php } ?>
		<title>Viewing Pokemon replay: <?php echo htmlentities($_REQUEST['name']); ?></title>
		<link rel="shortcut icon" href="http://aesoft.org/favicon.ico" />
		<link rel="stylesheet" href="battle.css" />
		<link rel="stylesheet" href="replayer.css" />
		<script src="js/jquery-1.6.2.min.js"></script>
		<script src="js/jquery-cookie.js"></script>
		<script src="js/soundmanager2.js"></script>
		<script src="js/battledata.js"></script>
		<script src="data/pokedex-mini.js"></script>
		<script src="js/battle.js"></script>
		<script src="js/getreplayjs.php?name=<?php echo $_REQUEST['name']; ?>"></script>
<?php
if (!$_REQUEST['manage'])
{
?>
<script type="text/javascript">
<!--
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-25200696-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
-->
</script>
<?php
}
?>
	</head>
	<body>
		<div id="battle" class="battle"><div class="playbutton"><button onclick="start()">Play</button></div></div>
		<div id="battle-log" class="battle-log"></div>
		<div class="replay-controls">
			<div id="buttons">
				<button onclick="start()">Start</button>
			</div>
		</div>
		<div class="replay-controls-2">
			<div id="speedchooser" class="chooser leftchooser">
				<em>Speed:</em>
				<div><button id="speed-fast" onclick="setspeed('fast')">Fast</button><button id="speed-normal" class="sel" onclick="setspeed('normal')">Normal</button><button id="speed-slow" onclick="setspeed('slow')">Slow</button></div>
			</div>
			<div id="colorchooser" class="chooser">
				<em>Color&nbsp;scheme:</em>
				<div><button id="color-light" class="sel" onclick="setcolorscheme('light')">Light</button><button id="color-dark" onclick="setcolorscheme('dark')">Dark</button></div>
			</div>
			<div id="soundchooser" class="chooser">
				<em>Music:</em>
				<div id="sm2-container"><span class="inner"><button id="sound-on" onclick="setsound('on')">On</button><button id="sound-off" class="sel" onclick="setsound('off')">Off</button></span></div>
			</div>
		</div>
		<div class="wrapper replay-wrapper">
			<!--[if lte IE 8]>
				<div class="error"><p>&#3232;_&#3232; <strong>You're using an old version of Internet Explorer.</strong></p>
				<p>We use some transparent backgrounds, rounded corners, and other effects that your old version of IE doesn't support.</p>
				<p>Please install <em>one</em> of these: <a href="http://www.google.com/chrome">Chrome</a> | <a href="http://www.mozilla.org/en-US/firefox/">Firefox</a> | <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home">Internet Explorer 9</a></p></div>
			<![endif]-->

			<?php if ($replay['private']) echo '<strong>THIS REPLAY IS PRIVATE</strong> - make sure you have the owner\'s permission to share<br />'; ?>
			
			<pre class="urlbox"><?php echo htmlentities('http://pokemon.aesoft.org/replay-'.$_REQUEST['name']); ?></pre>
			
			[<a href="uploads/<?php echo htmlentities($_REQUEST['name']); ?>.html">Original replay</a> | <a href="convert-<?php echo htmlentities($_REQUEST['name']); ?>">Convert again</a>] [<a href="./">Upload your own replay</a>] [<a href="http://www.smogon.com/forums/showthread.php?t=3453192">Report bugs to the Smogon thread</a>]
			<div id="loopcount"></div>
<?php
if ($_REQUEST['manage'] === '59230meloetta')
{
	if ($_POST['change'])
	{
		include_once 'persist.lib.php';
		echo '<div class="error">changed</div>';
		if ($_POST['highlight']) $replay['highlight'] = true;
		else unset($replay['highlight']);
		if ($_POST['notes']) $replay['notes'] = $_POST['notes'];
		else unset($replay['notes']);
		if ($_POST['link']) $replay['link'] = $_POST['link'];
		else unset($replay['link']);
		persist_save('REPLAYS');
	}
?>
			<form method="post" style="margin-top:1em">
				<input type="checkbox" name="highlight"<?php if ($replay['highlight']) echo 'checked="checked"'; ?> id="highlight" /><label for="highlight"> highlight</label><br />
				notes <input type="text" name="notes" id="notes" value="<?php echo htmlentities($replay['notes']); ?>" size="90" /><br />
				link <input type="text" name="link" id="link" value="<?php echo htmlentities($replay['link']); ?>" size="90" /><br />
				<button type="submit" name="change" value="change">Change</button>
			</form>
<?php
}
?>
		</div>
		<script>
		<!--
var battle;

function setcolorscheme(color)
{
	$('#color-light').removeClass('sel');
	$('#color-dark').removeClass('sel');
	$('#color-'+color).addClass('sel');
	if (color === 'dark')
	{
		$(document.body).addClass('dark');
	}
	else
	{
		$(document.body).removeClass('dark');
	}
}
function setsound(sound, init)
{
	$('#sound-on').removeClass('sel');
	$('#sound-off').removeClass('sel');
	$('#sound-'+sound).addClass('sel');
	var muteTable = {
		on: false, // this is kind of backwards: sound[on] === muted[false]
		off: true
	};
	battle.setMute(muteTable[sound]);
	if (!init && $('#altsound').length)
	{
		$('#battle').html('<div class="playbutton"><button onclick="start()">Play</button></div>');
	}
}
function setspeed(speed)
{
	$('#speed-fast').removeClass('sel');
	$('#speed-normal').removeClass('sel');
	$('#speed-slow').removeClass('sel');
	$('#speed-'+speed).addClass('sel');
	var speedTable = {
		fast: 100,
		normal: 1,
		slow: 0.3
	};
	battle.messageSpeed = speedTable[speed];
}
function pause()
{
	$('#buttons').html('<button onclick="play()">Play</button><button onclick="reset()">Reset</button> <button onclick="ff()">Skip to next turn</button> <button onclick="ffto()">Go to turn...</button>');
	battle.pause();
}
function play()
{
	$('#battle .playbutton').remove();
	$('#buttons').html('<button onclick="pause()">Pause</button><button onclick="reset()">Reset</button> <button onclick="ff()">Skip to next turn</button> <button onclick="ffto()">Go to turn...</button>');
	battle.play();
}
function reset()
{
	battle.pause();
	$('#battle').html('<div class="playbutton"><button onclick="start()">Play</button></div>');
	$('#battle-log').html('');
	$('#buttons').html('<button onclick="start()">Play</button><button onclick="reset()" disabled="disabled">Reset</button>');
}
function ff()
{
	battle.skipTurn();
}
function ffto()
{
	battle.fastForwardTo(prompt('Turn?'));
}

function start()
{
	battle.reset();
	battle.play();
	$('#buttons').html('<button onclick="pause()">Pause</button><button onclick="reset()">Reset</button> <button onclick="ff()">Skip to next turn</button> <button onclick="ffto()">Go to turn...</button>');
}
function updateProgress(done, a, b)
{
	if (!battle.paused) return;
	//$('#battle').html('<div class="playbutton"><button onclick="start()">Play</button>'+(done?'':'<br />Buffering: '+parseInt(100*a/b)+'%')+'</div>');
}
setTimeout(function(){updateProgress(true)}, 10000);

	battle = new Battle($('#battle'), $('#battle-log'));
	battle.preloadCallback = updateProgress;
	battle.resumeButton = play;
	battle.setQueue(newlog);

	$('#battle').html('<div class="playbutton"><button onclick="start()">Play</button></div>');

soundManager.onready(function(){
	if (!battle.paused) return;
	$('#battle').html('<div class="playbutton"><button onclick="start()">Play</button><br /><br /><button onclick="setsound(\'on\');start()" id="altsound">Play (music on)</button></div>');
});

		-->
		</script>
	</body>
</html>
<?php
	die();
}

header('HTTP/1.1 404 Not Found');

?><h1>404 Not Found</h1>