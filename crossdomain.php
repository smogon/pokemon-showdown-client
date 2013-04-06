<?php
// This file allows psim.us to use the cookies and localStorage
// from play.pokemonshowdown.com.

// Never cache.
header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.

require '../pokemonshowdown.com/lib/ntbb-session.lib.php';

$server = strval(@$_REQUEST['server']);
$challengeresponse = intval(@$_REQUEST['challengeresponse']);

// Checking the form of $server is probably not necessary, but we do it
// for greater certainity.
if (!preg_match('/^[a-zA-Z0-9-_\.]*$/', $server)) {
	die();
}
$upkeep = $users->getUpkeep($server, $challengeresponse);

$prefix = strval(@$_REQUEST['prefix']);
// Need to check the form of $prefix to avoid some vulnerabilities.
// This check should be robust enough for now.
if (!preg_match('/^[a-zA-Z0-9-_\.]*$/', $prefix)) {
	die();
}
$origin = 'http://' . $prefix . '.psim.us';
$username = isset($_COOKIE['showdown_username']) ? $_COOKIE['showdown_username'] : '';
$sid = isset($_COOKIE['sid']) ? $_COOKIE['sid'] : '';
?>
<!DOCTYPE html>
<script src="/js/jquery-1.9.0.min.js"></script>
<script src="/js/jquery-cookie.js"></script>
<script src="/js/jquery.json-2.3.min.js"></script>
<script>
(function() {
	var origin = <?php echo json_encode($origin) ?>;
	var postMessage = function(message) {
		return window.parent.postMessage($.toJSON(message), origin);
	};
	$(window).on('message', function($e) {
		var e = $e.originalEvent;
		if (e.origin !== origin) return;
		var data = $.parseJSON(e.data);
		if (data.username) {
			$.cookie('showdown_username', data.username, {expires: 14});
		}
		if (data.get) {
			$.get(data.get[0], function(ajaxdata) {
				postMessage({ajax: [data.get[1], ajaxdata]});
			}, data.get[2]);
		}
		if (data.post) {
			$.post(data.post[0], data.post[1], function(ajaxdata) {
				postMessage({ajax: [data.post[2], ajaxdata]});
			}, data.post[3]);
		}
		if (data.teams) {
			localStorage.setItem('showdown_teams', data.teams);
		}
		if (data.prefs) {
			localStorage.setItem('showdown_prefs', data.prefs);
		}
	});
	var message = {
		upkeep: <?php echo json_encode($upkeep) ?>,
		username: <?php echo json_encode($username) ?>,
		sid: <?php echo json_encode($sid) ?>
	};
	if (window.localStorage) {
		message.teams = localStorage.getItem('showdown_teams');
		message.prefs = localStorage.getItem('showdown_prefs');
	}
	postMessage(message);
})();
</script>
