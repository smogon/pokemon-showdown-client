<?php
function showSpriteIndex(string $path) {
	global $sprite_credits;
	$filter = $_GET['filter'] ?? '';
	if ($filter === 'recent') $filter = 'latest';
?>
	<div>
		View:
		<ul class="nav" style="display:inline-block;vertical-align:middle;margin:0 10px 0 0">
			<li><a class="button nav-first" href="./?view=sprites" aria-current="page">Sprites</a></li>
			<li><a class="button nav-last" href="./?view=dir">Directory</a></li>
		</ul>
		Filter:
		<ul class="nav" style="display:inline-block;vertical-align:middle;margin:0">
			<li><a class="button nav-first" href="./?view=sprites"<?= $filter === '' ? ' aria-current="page"' : '' ?>>All</a></li>
			<li><a class="button<?= $sprite_credits ? '' : ' nav-last' ?>" href="./?view=sprites&filter=recent"<?= $filter === 'latest' ? ' aria-current="page"' : '' ?>>Recent</a></li>
<?php if ($sprite_credits) { ?>
			<li><a class="button nav-last" href="./?view=sprites&filter=credited"<?= $filter === 'credited' ? ' aria-current="page"' : '' ?>>Credited</a></li>
<?php } ?>
		</ul>
	</div>
</main>
<?php
	$files = glob($path);
	if ($filter === 'latest') {
		usort($files, fn($a, $b) => (filemtime($a) <=> filemtime($b)) * -1);
	} else if ($filter === 'credited') {
		usort($files, fn($a, $b) => (($sprite_credits[$a] ?? '') <=> ($sprite_credits[$b] ?? '')));
	}
	$section = null;
	foreach ($files as $file) {
		$credit = ($sprite_credits[$file] ?? null);
		if ($filter === 'credited') {
			if (!$credit) continue;
			if ($credit !== $section) {
				$section = $credit;
				echo '<h3 style="margin:1em;border-bottom:1px solid #999;padding-bottom:2px">By ' . $credit . '</h3>';
			}
		} else if ($filter === 'latest') {
			$year = date('Y-m', filemtime($file));
			if ($year !== $section) {
				if (intval($year) < 2024) break;
				$section = $year;
				echo '<h3 style="margin:1em;border-bottom:1px solid #999;padding-bottom:2px">New in ' . $year . '</h3>';
			}
		}
		$escaped_file = htmlentities($file);
		$file_url = implode('/', array_map('rawurlencode', explode('/', $file)));
?>
<figure id="<?php echo $escaped_file ?>">
	<img loading="lazy" src="<?php echo $file_url ?>" alt="<?php echo $escaped_file ?>" title="<?php echo $escaped_file ?>" />
	<figcaption><a href="<?php echo $file_url ?>"><?php echo substr($escaped_file, 0, -4) ?></a><?php if ($credit) echo '<br />by ' . htmlentities($credit) ?></figcaption>
</figure>
<?php
	}
}

if (empty($sprite_credits)) $sprite_credits = null;
