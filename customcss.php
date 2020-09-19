<?php

ini_set('max_execution_time', 60); // 1 minute

require_once __DIR__ . '/config/config.inc.php';
require_once __DIR__ . '/config/servers.inc.php';

spl_autoload_register(function ($class) {
	require_once('lib/css-sanitizer/'.str_replace('\\', DIRECTORY_SEPARATOR, $class).'.php');
});

use Wikimedia\CSS\Parser\Parser;

use Wikimedia\CSS\Sanitizer\StylesheetSanitizer;

$server = @$_REQUEST['server'];
if ($server === 'showdown' || $server === 'smogtours') die();
if (empty($PokemonServers[$server])) {
	header('Content-Type: text/plain; charset=utf-8');
	die('server not found');
}

$invalidate = isset($_REQUEST['invalidate']);

if (!$invalidate) header('Content-Type: text/css'); // the CSS file should specify a charset

$serverdata =& $PokemonServers[$server];
$customcssuri = @$serverdata['customcss'];
if (empty($customcssuri)) {
	$protocol = ($serverdata['port'] === 443) ? 'https' : 'http';
	$customcssuri = $protocol . '://'.$serverdata['server'].':'.$serverdata['port'].'/custom.css';
}

// No need to sanitise $server because it should be safe already.
$cssfile = __DIR__ . '/config/customcss/' . $server . '.css';

$lastmodified = @filemtime($cssfile);
$timenow = time();
$expiration = ($lastmodified ? $lastmodified : $timenow) + 3600;
header('Expires: ' . gmdate('D, d M Y H:i:s T', $expiration));

// echo '/* ', $customcssuri, ' */';

if (!$invalidate && $lastmodified && (($timenow - $lastmodified) < 3600)) {
	// Don't check for modifications more than once an hour.
	readfile($cssfile);
	die();
}

$curl = curl_init($customcssuri);
if ($lastmodified && !$invalidate) {
	curl_setopt($curl, CURLOPT_HTTPHEADER, array(
		'If-Modified-Since: ' . gmdate('D, d M Y H:i:s T', $lastmodified),
		'User-Agent: PSCustomCSS/0.1 (server=' . $server . ($invalidate ? '; invalidate=1' : '') . ')',
		// 'X-Forwarded-For: ' . @$_SERVER['HTTP_X_FORWARDED_FOR'],
	));
} else {
	curl_setopt($curl, CURLOPT_HTTPHEADER, array(
		'User-Agent: PSCustomCSS/0.1 (server=' . $server . ($invalidate ? '; invalidate=1' : '') . ')',
		// 'X-Forwarded-For: ' . @$_SERVER['HTTP_X_FORWARDED_FOR'],
	));
}
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($curl, CURLOPT_MAXREDIRS, 5);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$curlret = curl_exec($curl);
if ($curlret) {
	$code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	if ($code === 200) {
		// Sanitise the CSS.
		// Parse a stylesheet from a string
		$parser = Parser::newFromString($curlret);
		$stylesheet = $parser->parseStylesheet();

		// Apply sanitization to the stylehseet
		$sanitizer = StylesheetSanitizer::newDefault();
		$newStylesheet = $sanitizer->sanitize( $stylesheet );

		// Convert the sanitized stylesheet back to text
		$outputcss = Wikimedia\CSS\Util::stringify( $newStylesheet, [ 'minify' => true ] );

		file_put_contents($cssfile, $outputcss);
		if (!$invalidate) echo $outputcss;
	} else {
		// Either no modifications (status: 304) or an error condition.
		if ($invalidate) die('Error: custom CSS file not found');
		if ($lastmodified) readfile($cssfile);
	}
	touch($cssfile, $timenow);	// Don't check again for an hour.
} else if (file_exists($cssfile)) {
	if ($invalidate) die('Error: custom CSS file not found');
	readfile($cssfile);
}
curl_close($curl);

if ($invalidate) {
?>
<p>
	Done: <?= htmlspecialchars($customcssuri) ?> was reloaded.
</p>
<p>
	<a href="http://<?= $psconfig['routes']['root'] ?>/servers/<?= $server ?>">Back to server management</a>
</p>
<?php
}
