<?php

$name = $_REQUEST['name'];

if (!$name)
{
?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<?php if (!isset($_REQUEST['dev'])) { ?><meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=IE8" /><?php } ?>
		<title>Warstory maker</title>
		<link rel="stylesheet" href="/style/replayer.css" />
		<script src="/js/jquery-1.9.1.min.js"></script>
	</head>
	<body>
		<div id="battle" class="battle" style="display:none"></div>
		<div id="battle-log" class="battle-log" style="display:none"></div>
	<div class="wrapper">
<noscript>turn on javascript</noscript>
<form id="form" onsubmit="return doSubmit()">
1. if you haven't done so, upload a replay <a href="https://<?= $psconfig['routes']['replays'] ?>/">https://<?= $psconfig['routes']['replays'] ?>/</a>, get its URL, and come back here.
<br />
2. Paste the URL: <input type="text" size="90" id="text" onkeyup="update()" onchange="update()" />
<br />
3. <button type="submit" disabled="disabled" id="button">Convert</button>
</form>
<script>
<!--
function doSubmit()
{
	var val = document.getElementById('text').value;
	var ok = false;
	if (val.substr(0,7) === 'http://') val = val.substr(7);
	if (val.substr(0,8) === 'http://') val = val.substr(8);
	if (val.substr(0,4) === 'www.') val = val.substr(4);
	if (val.substr(0,'<?= $psconfig['routes']['replays'] ?>/'.length) === '<?= $psconfig['routes']['replays'] ?>/')
	{
		val = val.substr('<?= $psconfig['routes']['replays'] ?>/'.length);
		ok = true;
	}

	if (!ok) return false;
	else
	{
		document.location.href = 'http://<?= $psconfig['routes']['replays'] ?>/warstory-'+val;
		return false;
	}
}

function update()
{
	var val = document.getElementById('text').value;
	var ok = false;
	if (val.substr(0,7) === 'http://') val = val.substr(7);
	if (val.substr(0,8) === 'http://') val = val.substr(8);
	if (val.substr(0,4) === 'www.') val = val.substr(4);
	if (val.substr(0,'<?= $psconfig['routes']['replays'] ?>/'.length) === '<?= $psconfig['routes']['replays'] ?>/')
	{
		val = val.substr('<?= $psconfig['routes']['replays'] ?>/'.length);
		ok = true;
	}

	document.getElementById('button').disabled = !ok;
}

setInterval(update, 300);

-->
</script>
<?php
	die();
}
else if ($_REQUEST['name'])// && $REPLAYS[$_REQUEST['name']])
{

	include '../../pokemonshowdown.com/lib/ntbb-database.lib.php';

	$res = $psdb->query("SELECT * FROM `ntbb_replays` WHERE `id` = '".$psdb->escape($_REQUEST['name'])."'");
	$replay = $psdb->fetch_assoc($res);

	if (!$replay) {
		header('HTTP/1.1 404 Not Found');
		echo '<h1>404 Not Found</h1>';
		die();
	}
	$replay['log'] = str_replace("\r","",$replay['log']);

?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<?php if (!isset($_REQUEST['dev'])) { ?><meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=IE8" /><?php } ?>
		<title>Viewing Pokemon replay: <?php echo htmlspecialchars($_REQUEST['name']); ?></title>
		<link rel="shortcut icon" href="http://aesoft.org/favicon.ico" />
		<link rel="stylesheet" href="/style/replayer.css" />
		<script src="/js/jquery-1.9.1.min.js"></script>
		<script src="/js/jquery-cookie.js"></script>
		<script src="/js/battle-sound.js"></script>
		<script src="/js/battledata.js"></script>
		<script src="/data/pokedex-mini.js"></script>
		<script src="/data/graphics.js"></script>
		<script src="/js/battle.js"></script>
		<script>
		<!--
			var newlog = <?php echo json_encode(explode("\n", $replay['log'])); ?>;
		//-->
		</script>
<?php
if (false && !$_REQUEST['manage'])
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
		<div id="battle" class="battle" style="display:none"></div>
		<div id="battle-log" class="battle-log" style="display:none"></div>
	<div class="wrapper">
1. Done
<br />
2. Done
<br />
3. Done
<br />
4. Here's the code. Use it as you wish.
		<div id="warstory"></div>
		<script>
		<!--
var battle;

function start()
{
	$('#battle-log').html('');
	$('#warstory').html('');
	battle.reset();
	battle.fastForwardTo(-2);
}

battle = new Battle($('#battle'), $('#battle-log'));
battle.setQueue(newlog);

var Aswitch = null;
var Bswitch = null;

function turnCallback(battle)
{
	var A = battle.nearSide.activePokemon;
	var B = battle.farSide.activePokemon;
	if (!A)
	{
		A = Aswitch?Aswitch[1]:{};
		Aswitch = null;
	}
	if (!B)
	{
		B = Bswitch?Bswitch[1]:{};
		Bswitch = null;
	}
	// var imagestring = 'a='+A.speciesid+'&ahp='+(100*A.hp/A.maxhp)+'&ast='+A.status+'&b='+B.speciesid+'&bhp='+(100*B.hp/B.maxhp)+'&bst='+B.status;
	// if (Aswitch)
	// {
	// 	var oA = Aswitch[1];
	// 	imagestring += '&oa='+oA.speciesid+'&oahp='+(100*oA.hp/oA.maxhp)+'&oast='+oA.status+'&oat='+Aswitch[0];
	// 	Aswitch = null;
	// }
	// if (Bswitch)
	// {
	// 	var oB = Bswitch[1];
	// 	imagestring += '&ob='+oB.speciesid+'&obhp='+(100*oB.hp/oB.maxhp)+'&obst='+oB.status+'&obt='+Bswitch[0];
	// 	Bswitch = null;
	// }

	var imagestring = '';
	if (Aswitch) {
		var oA = Aswitch[1];
		imagestring += ''+Aswitch[0]+'.'+oA.spriteid+'.'+(100*oA.hp/oA.maxhp)+(oA.status?'.'+oA.status:'')+'_';
		Aswitch = null;
	}
	imagestring += ''+A.spriteid+'.'+(100*A.hp/A.maxhp)+(A.status?'.'+A.status:'')+'_'+B.spriteid+'.'+(100*B.hp/B.maxhp)+(B.status?'.'+B.status:'');
	if (Bswitch) {
		var oB = Bswitch[1];
		imagestring += '_'+Bswitch[0]+'.'+oB.spriteid+'.'+(100*oB.hp/oB.maxhp)+(oB.status?'.'+oB.status:'');
		Bswitch = null;
	}

	imagestring = '<div><img src="http://<?= $psconfig['routes']['client'] ?>/replay/turn_'+imagestring+'.png" /></div>';
	$('#warstory').append($('#battle-log .inner').html());
	$('#battle-log .inner').html('');
	var lastchild = $('#warstory').children().last();
	if (lastchild[0].tagName.toLowerCase() === 'h2')
	{
		lastchild.before(imagestring+'<div><br /></div><div><br /></div>');
	}
	else
	{
		$('#warstory').append(imagestring);
	}
}

function switchCallback(battle, side)
{
	var switched = ['sw', side.lastPokemon];
	if (!side.lastPokemon) return;
	if (!side.isOpp)
	{
		if (Aswitch && Aswitch[0] === 'fnt') return;
		Aswitch = switched;
	}
	else
	{
		if (Bswitch && Bswitch[0] === 'fnt') return;
		Bswitch = switched;
	}
}
function dragCallback(battle, side)
{
	var switched = ['dr', side.lastPokemon];
	if (!side.lastPokemon) return;
	if (!side.isOpp) Aswitch = switched;
	else Bswitch = switched;
}
function faintCallback(battle, side)
{
	var switched = ['fnt', side.lastPokemon];
	if (!side.isOpp) Aswitch = switched;
	else Bswitch = switched;
}
function endCallback(battle)
{
	turnCallback(battle);
	$('#warstory').find('div.chat').remove();
	var bbcode = $('#warstory').html();
	bbcode = bbcode.replace(/<br( )?(\/)?>/g, '');
	bbcode = bbcode.replace(/<div class="spacer">/g, '');
	bbcode = bbcode.replace(/<div>/g, '');
	bbcode = bbcode.replace(/<\/div>/g, "\n");
	bbcode = bbcode.replace(/<h2>/g, '[b][color="#002299"][size="3"]');
	bbcode = bbcode.replace(/<\/h2>/g, "[/size][/color][/b]\n");
	bbcode = bbcode.replace(/<em>/g, '[i]');
	bbcode = bbcode.replace(/<\/em>/g, '[/i]');
	bbcode = bbcode.replace(/<strong>/g, '[b]');
	bbcode = bbcode.replace(/<\/strong>/g, '[/b]');
	bbcode = bbcode.replace(/<small>/g, '[size="1"]');
	bbcode = bbcode.replace(/<\/small>/g, '[/size]');
	bbcode = bbcode.replace(/<img[^>]* src="([^"]*)"[^>]*\/?>/g, "[img]$1[/img]\n");
	bbcode = bbcode.replace(/&amp;/g, '&');

	var teamcode = '[hide="'+battle.mySide.name+'\'s team"]';
	for (var i=0; i<battle.mySide.pokemon.length && i<6; i++)
	{
		teamcode += '[img]http://<?= $psconfig['routes']['client'] ?>/sprites/gen5/'+battle.mySide.pokemon[i].spriteid+'.png[/img]';
	}
	teamcode += '[/hide]'+"\n";
	teamcode += '[hide="'+battle.farSide.name+'\'s team"]';
	for (var i=0; i<battle.farSide.pokemon.length && i<6; i++)
	{
		teamcode += '[img]http://<?= $psconfig['routes']['client'] ?>/sprites/gen5/'+battle.farSide.pokemon[i].spriteid+'.png[/img]';
	}
	teamcode += '[/hide]'+"\n\n";

	bbcode = teamcode + bbcode;

	bbcode = "[indent]>>>[url=\"http://<?= $psconfig['routes']['client'] ?>/replay/battle-<?php echo $name ?>\"][size=\"3\"]Click to [b]watch this replay[/b]![/size][/url]<<<[/indent]\n\n"+bbcode;
	bbcode += "\n\n[indent]>>>[url=\"http://<?= $psconfig['routes']['client'] ?>/replay/battle-<?php echo $name ?>\"][size=\"3\"]Click to [b]watch this replay[/b]![/size][/url]<<<[/indent]";
	$('#warstory').prepend('<textarea rows="20" cols="90"></textarea>');
	$('#warstory textarea').text(bbcode);
}

battle.turnCallback = turnCallback;
battle.endCallback = endCallback;

battle.switchCallback = switchCallback;
battle.dragCallback = dragCallback;
battle.faintCallback = faintCallback;

start();

		-->
		</script>
	</div>
	</body>
</html>
<?php
	die();
}

header('HTTP/1.1 404 Not Found');

?><h1>404 Not Found</h1>
