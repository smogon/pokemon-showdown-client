<?php
$config = array();

$host = strtolower(strval(@$_REQUEST['host']));
if (preg_match('/^([a-z0-9-_\.]*?)\.psim\.us$/', $host, $m)) {
	$config['host'] = $m[1];
	if ($config['host'] === 'logs') die; // not authorised
	if ($config['host'] === 'sim') die; // not authorised
} else if ($host === 'play.pokemonshowdown.com') {
	$config['host'] = 'showdown';
} else {
	die; // not authorised
}

include_once '../pokemonshowdown.com/config/servers.inc.php';

$hyphenpos = strrpos($config['host'], '-');
if ($hyphenpos) {
	$postfix = substr($config['host'], $hyphenpos + 1);
	if ($postfix === 'afd') {
		$config['afd'] = true;
		$config['host'] = substr($config['host'], 0, $hyphenpos);
	} else if (ctype_digit($postfix)) {
		$config['port'] = intval(substr($config['host'], $hyphenpos + 1));
		$config['host'] = substr($config['host'], 0, $hyphenpos);
	}
}

$config['id'] = $config['host'];
if (isset($PokemonServers[$config['host']])) {
	$server =& $PokemonServers[$config['host']];
	$config['host'] = $server['server'];
	if (!isset($config['port'])) {
		$config['port'] = $server['port'];
	} else if ($config['port'] !== $server['port']) {
		$config['id'] .= ':' . $config['port'];
	}
	if (isset($server['altport'])) $config['altport'] = $server['altport'];
	$config['registered'] = true;

	// $yourip = $_SERVER['REMOTE_ADDR'];
	$yourip = @$_SERVER['HTTP_X_FORWARDED_FOR'];
	if (substr($config['host'].':', 0, strlen($yourip)+1) === $yourip.':') {
		$config['host'] = 'localhost'.substr($config['host'],strlen($yourip));
	}
} else {
	if (isset($config['port'])) {
		$config['id'] .= ':' . $config['port'];
	} else {
		$config['port'] = 8000; // default port
	}

	// see if this is actually a registered server
	if ($config['host'] !== 'localhost') {
		$ip = gethostbyname($config['host']);
		foreach ($PokemonServers as &$server) {
			if (!isset($server['ipcache'])) {
				$server['ipcache'] = gethostbyname($server['server']);
			}
			if ($ip === $server['ipcache']) {
				if (($config['port'] === $server['port']) ||
						(isset($server['altport']) &&
							$config['port'] === $server['altport'])) {
					$path = isset($_REQUEST['path']) ? $_REQUEST['path'] : '';
					$config['redirect'] = 'http://' . $server['id'] . '.psim.us/' . rawurlencode($path);
					break;
				}
			}
		}
	}
}

// For Internet Explorer.
// See http://www.p3pwriter.com/LRN_111.asp
// See also http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer
//
// The privacy fields specified here should be accurate.
header('P3P: CP="NOI CUR ADM DEV COM NAV STA OUR IND"');
?>
<!DOCTYPE html>
<script src="/js/lib/jquery-2.1.0.min.js"></script>
<script src="/js/lib/jquery-cookie.js"></script>
<script src="/js/lib/jquery.json-2.3.min.js"></script>
<body>
<script>
(function() {
	var config = <?php echo json_encode($config) ?>;
	if (config.redirect) {
		return parent.location.replace(config.redirect);
	}
	var message = {server: config};
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
	if (!message.nothirdparty && (document.location.protocol === 'http:')) {
		var executeRedirect = function() {
			document.location = 'https://' + document.location.hostname +
				document.location.pathname + document.location.search;
			return;
		};
		if (/**(!message.teams && !message.prefs) ||**/ $.cookie('showdown_ssl')) {
			// use the https origin storage
			$.cookie('showdown_ssl', 1, {expires: 365*3});
			return executeRedirect();
		}
		// copy the existing http storage over to the https origin
		/**$(window).on('message', function($e) {
			var e = $e.originalEvent;
			var origin = 'https://play.pokemonshowdown.com';
			if (e.origin !== origin) return;
			if (e.data === 'init') {
				e.source.postMessage($.toJSON(message), origin);
			} else if (e.data === 'done') {
				$.cookie('showdown_ssl', 1, {expires: 365*3});
				localStorage.clear();
				return executeRedirect();
			}
		});
		var $iframe = $('<iframe src="https://play.pokemonshowdown.com/crossprotocol.html" style="display: none;"></iframe>');
		$('body').append($iframe);
		return;**/
	}
	var origin = <?php echo json_encode('http://' . $host) ?>;
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
	postMessage(message);
})();
</script>
