<?php

include '../pokemonshowdown.com/config/servers.inc.php';

$server = @$_REQUEST['server'];
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
$cssfile = '../pokemonshowdown.com/config/customcss/' . $server . '.css';

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
		'If-Modified-Since: ' . gmdate('D, d M Y H:i:s T', $lastmodified)
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
		require '../pokemonshowdown.com/lib/htmlpurifier/HTMLPurifier.auto.php';
		require '../pokemonshowdown.com/lib/csstidy/class.csstidy.php';

		$config = HTMLPurifier_Config::createDefault();

		$config->set('Filter.ExtractStyleBlocks', true);
		$config->set('CSS.Proprietary', true);
		$config->set('CSS.AllowImportant', true);
		$config->set('CSS.AllowTricky', true);
		$level = error_reporting(E_ALL & ~E_STRICT);

		// $purifier = new HTMLPurifier($config);
		// $html = $purifier->purify('<style>' . $curlret . '</style>');
		// error_reporting($level);
		// list($outputcss) = $purifier->context->get('StyleBlocks');

		$context = new HTMLPurifier_Context();
		$filter = new HTMLPurifier_Filter_ExtractStyleBlocks();
		$outputcss = $filter->cleanCSS($curlret, $config, $context);

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
	<a href="http://pokemonshowdown.com/servers/<?= $server ?>">Back to server management</a>
</p>
<?php
}
