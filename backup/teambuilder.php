<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<title>Showdown Teambuilder</title>
		<link rel="shortcut icon" href="/favicon.ico" id="dynamic-favicon" />
		<link rel="stylesheet" href="/sim.css" />
		<link rel="stylesheet" href="/sim-types.css" />
		<link rel="stylesheet" href="/battle.css" />
		<link rel="stylesheet" href="/replayer.css" />
		<meta name="viewport" content="width=640"/>
	</head>
	<body>
		<div id="simheader">
			<h1 style="margin-top:2px;margin-right:10em;padding-top:0;"><img src="/pokemonshowdownbeta.png" alt="Pokemon Showdown! (beta)" /></h1>
		</div>
		<div id="leftbarbg"></div>
		<div id="leftbar">
			<div>
				<a id="tabtab-teambuilder" class="cur" href="#" onclick="return false">Teambuilder</a>
			</div>
		</div>
		<div id="main">
			<div id="loading-message" style="padding:20px">Loading...<br />
			<br />
			If this message isn't going away, try refreshing.</div>
		</div>
		<div id="lobbychat" class="lobbychat"></div>
		<div id="userbar">
		</div>
		<div id="backbutton">
			<div><button onclick="return selectTab('lobby');">&laquo; Lobby</button></div>
		</div>
		<div id="tooltipwrapper"><div class="tooltipinner"></div></div>
		<div id="foehint"></div>
		<script src="/js/jquery-1.6.2.min.js"></script>
		<script src="/js/autoresize.jquery.min.js"></script>
		<script src="/js/jquery-cookie.js"></script>
		<script src="/js/jquery.json-2.3.min.js"></script>
		<script src="/js/soundmanager2.js"></script>
		<script src="/js/battledata.js"></script>
		<script src="/data/pokedex-mini.js"></script>

		<script src="/js/newteambuilder.js"></script>
		
		<script src="/data/learnsets.js"></script>
		
		<script src="/data/pokedex.js"></script>
		<script src="/data/movedex.js"></script>
		<script src="/data/items.js"></script>
		<script src="/data/tiers.js"></script>
		<script src="/data/abilities.js"></script>
		<script src="/data/formats.js"></script>
		
		<script src="/js/utilichart.js"></script>
<script>
var teams = [];
var rooms = {};
(function(){
	var savedTeam = $.parseJSON($.cookie('showdown_team1'));
	if (savedTeam)
	{
		teams.push(savedTeam);
	}
	savedTeam = $.parseJSON($.cookie('showdown_team2'));
	if (savedTeam)
	{
		teams.push(savedTeam);
	}
	savedTeam = $.parseJSON($.cookie('showdown_team3'));
	if (savedTeam)
	{
		teams.push(savedTeam);
	}
})();
			$('#main').html('<div id="tab-teambuilder" class="battle-tab"></div>');
			var teambuilderElem = $('#main').children();
			rooms.teambuilder = new Teambuilder('teambuilder', teambuilderElem);
		</script>
	</body>
</html>