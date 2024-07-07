<?php
$config = array();

require_once __DIR__ . '/../config/config.inc.php';

$host = strtolower(strval(@$_REQUEST['host']));
if (preg_match('/^([a-z0-9-_\.]*?)\.psim\.us$/', $host, $m)) {
	$config['host'] = $m[1];
	if ($config['host'] === 'logs') die; // not authorised
	if ($config['host'] === 'sim') die; // not authorised
} else if ($host === $psconfig['routes']['client']) {
	$config['host'] = 'showdown';
} else {
	die; // not authorised
}

$protocol = @$_REQUEST['protocol'] ?? 'http:';
$portType = ($protocol === 'http:' ? 'port' : 'httpsport');
if ($protocol === 'https:') $config['https'] = true;

if ($config['host'] !== 'showdown') {
	include_once __DIR__ . '/../config/servers.inc.php';

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
		if (@$server['banned']) {
			$config['banned'] = true;
		} else {
			$config['host'] = $server['server'];
			if (!isset($config['port'])) {
				$config['port'] = $server[$portType] ?? 443;
			} else if ($config['port'] !== ($server[$portType] ?? 443)) {
				$config['id'] .= ':' . $config['port'];
			}
			if (isset($server['altport'])) $config['altport'] = $server['altport'];
			$config['registered'] = true;

			// $yourip = $_SERVER['REMOTE_ADDR'];
			$yourip = @$_SERVER['HTTP_X_FORWARDED_FOR'];
			if (substr($config['host'].':', 0, strlen($yourip)+1) === $yourip.':') {
				$config['host'] = 'localhost'.substr($config['host'],strlen($yourip));
			}
		}
	} else {
		if (isset($config['port'])) {
			$config['id'] .= ':' . $config['port'];
		} else {
			$config['port'] = ($protocol === 'http:' ? 8000 : 443); // default port
		}

		// see if this is actually a registered server
		if ($config['host'] !== 'localhost') {
			foreach ($PokemonServers as &$server) {
				if ($config['host'] === $server['server'] && (
						$config['port'] === $server['port'] ||
						(isset($server['altport']) && $config['port'] === $server['altport'])
					)) {
					$path = isset($_REQUEST['path']) ? $_REQUEST['path'] : '';
					$config['redirect'] = $protocol . '//' . $server['id'] . '.psim.us/' . rawurlencode($path);
					break;
				}
			}
		}
	}
}

if (@$config['redirect']) {
?>
<!DOCTYPE html>
<meta charset="utf-8" />
<script>
parent.location.replace(<?= json_encode($config['redirect']) ?>);
</script>
<?php
	die();
}

// For Internet Explorer.
// See http://www.p3pwriter.com/LRN_111.asp
// See also http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer
//
// The privacy fields specified here should be accurate.
header('P3P: CP="NOI CUR ADM DEV COM NAV STA OUR IND"');
?>
<!DOCTYPE html>
<meta charset="utf-8" />
<script src="/js/lib/jquery-2.2.4.min.js"></script>
<body>
<script>

var configHost = <?php echo json_encode($config['host']) ?>;
var config = <?php echo json_encode(json_encode($config)) ?>;
var yourOrigin = <?php echo json_encode($protocol . '//' . $host) ?>;
var myOrigin = 'https://<?php echo $psconfig['routes']['client'] ?>';

function postReply (message) {
	if (window.parent.postMessage === postReply) return;
	return window.parent.postMessage(message, yourOrigin);
}
function messageHandler(e) {
	if (e.origin !== yourOrigin) return;
	var data = e.data;

	// data's first char:
	// T: store teams
	// P: store prefs
	// R: GET request
	// S: POST request

	switch (data.charAt(0)) {
	case 'T':
		try {
			localStorage.setItem('showdown_teams', data.substr(1));
		} catch (e) {}
		break;
	case 'P':
		try {
			localStorage.setItem('showdown_prefs', data.substr(1));
		} catch (e) {}
		break;
	case 'R':
	case 'S':
		var rq = JSON.parse(data.substr(1));
		$.ajax({
			type: (data.charAt(0) === 'R' ? 'GET' : 'POST'),
			url: rq[0],
			data: rq[1],
			success: function(ajaxdata) {
				postReply('r' + JSON.stringify([rq[2], ajaxdata]));
			},
			dataType: rq[3]
		});
		break;
	}
}

window.addEventListener('message', messageHandler);
if (configHost !== 'showdown') postReply('c' + config);
var storageAvailable = false;
try {
	var testVal = '' + Date.now();
	localStorage.setItem('showdown_allow3p', testVal);
	if (localStorage.getItem('showdown_allow3p') === testVal) {
		postReply('a1');
		postReply('p' + localStorage.getItem('showdown_prefs'));
		postReply('t' + localStorage.getItem('showdown_teams'));
		storageAvailable = true;
	}
} catch (err) {}

if (!storageAvailable) {
	postReply('a0');
}

if (location.protocol + '//' + location.hostname !== myOrigin) {
	// This happens sometimes, but we'll pretend it doesn't
}

</script>
