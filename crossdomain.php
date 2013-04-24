<?php
$config = array();
$config['server'] = strtolower(strval(@$_REQUEST['prefix']));
if (!preg_match('/^[a-z0-9-_\.]*$/', $config['server'])) die;
if ($config['server'] === 'logs') die;
$origin = 'http://' . $config['server'] . '.psim.us';

include_once '../pokemonshowdown.com/config/servers.inc.php';

$hyphenpos = strrpos($config['server'], '-');
if ($hyphenpos) {
	$postfix = substr($config['server'], $hyphenpos + 1);
	if ($postfix === 'afd') {
		$config['afd'] = true;
		$config['server'] = substr($config['server'], 0, $hyphenpos);
	} else if (ctype_digit($postfix)) {
		$config['serverport'] = intval(substr($config['server'], $hyphenpos + 1));
		$config['server'] = substr($config['server'], 0, $hyphenpos);
	}
}

$config['serverid'] = $config['server'];
if (isset($PokemonServers[$config['server']])) {
	$server =& $PokemonServers[$config['server']];
	$config['server'] = $server['server'];
	if (isset($server['protocol'])) $config['serverprotocol'] = $server['protocol'];
	if (!isset($config['serverport'])) {
		$config['serverport'] = $server['port'];
	} else if ($config['serverport'] !== $server['port']) {
		$config['serverid'] .= ':' . $config['serverport'];
	}
	if (isset($server['altport'])) $config['serveraltport'] = $server['altport'];
	if (isset($server['customcss'])) $config['customcss'] = true;
	$config['registeredserver'] = true;
} else {
	if (isset($config['serverport'])) {
		$config['serverid'] .= ':' . $config['serverport'];
	} else {
		$config['serverport'] = 8000; // default port
	}

	// see if this is actually a registered server
	$ip = gethostbyname($config['server']);
	foreach ($PokemonServers as &$server) {
		if (!isset($server['ipcache'])) {
			$server['ipcache'] = gethostbyname($server['server']);
		}
		if ($ip === $server['ipcache']) {
			if (($config['serverport'] === $server['port']) ||
					(isset($server['altport']) &&
						$config['serverport'] === $server['altport'])) {
				$config['redirect'] = 'http://' . $server['id'] . '.psim.us';
				break;
			}
		}
	}
}

if (!in_array(@$config['serverprotocol'], array('io', 'eio'))) {
	$config['serverprotocol'] = 'ws'; // default protocol
}
?>
<!DOCTYPE html>
<script src="/js/jquery-2.0.0.min.js"></script>
<script src="/js/jquery-cookie.js"></script>
<script src="/js/jquery.json-2.3.min.js"></script>
<script>
(function() {
	var config = <?php echo json_encode($config) ?>;
	var origin = <?php echo json_encode($origin) ?>;
	var postMessage = function(message) {
		return window.parent.postMessage($.toJSON(message), origin);
	};
	$(window).on('message', function($e) {
		var e = $e.originalEvent;
		if (e.origin !== origin) return;
		var data = $.parseJSON(e.data);
		if (data.username !== undefined) {
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
	var message = {config: config};
	try {
		if (window.localStorage) {
			message.teams = localStorage.getItem('showdown_teams');
			message.prefs = localStorage.getItem('showdown_prefs');
		}
		$.cookie('testcookie', 1);
		if (!$.cookie('testcookie')) {
			message.nothirdparty = true;
		}
		$.cookie('testcookie', null);
	} catch (e) {
		message.nothirdparty = true;
	}
	postMessage(message);
})();
</script>
