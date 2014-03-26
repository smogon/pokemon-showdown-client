<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<title>Showdown!</title>
		<link rel="shortcut icon" href="/favicon.ico" id="dynamic-favicon" />
		<link rel="stylesheet" href="/style/utilichart.css" />
		<link rel="stylesheet" href="/style/sim-types.css" />
		<link rel="stylesheet" href="/style/battle.css" />
		<link rel="stylesheet" href="/style/replay.css" />
		<script src="/js/lib/jquery-2.1.0.min.js"></script>
		<script src="/js/lib/autoresize.jquery.min.js"></script>
		<script src="/js/lib/jquery-cookie.js"></script>
		<script src="/js/lib/jquery.json-2.3.min.js"></script>
		<script src="/data/pokedex-mini.js"></script>

		<script>var exports=this</script>

		<script src="/data/pokedex.js"></script>
		<script src="/data/moves.js"></script>
		<script src="/data/items.js"></script>
		<script src="/data/abilities.js"></script>
		<script src="/data/formats.js"></script>

		<script src="/js/battledata.js"></script>
		<script src="/js/utilichart.js"></script>

		<style>
		body { text-align: left; }
		</style>
	</head>
	<body>
		<div style="padding:20px"><input id="searchTerm" type="text" onkeyup="update()" size="50" autofocus /></div>

		<div id="results">
		</div>

		<script>
var timeout = null;
var prevSearch = 'init';
function update()
{
	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(function() {
		var search = $('#searchTerm').val();
		if (search === prevSearch) return;
		prevSearch = search;
		$('#results').html(Chart.chart(search, 'pokemon'));
		timeout = null;
	}, 200);
}
update();
		</script>
	</body>
</html>
