<?php

include_once __DIR__.'/../config/news.inc.php';

function readableDate($time=0) {
	if (!$time) {
		$time = time();
	}
	return date('M j, Y',$time);
}

function renderNews() {
	global $latestNewsCache, $newsCache;
	$buf = '';
	$count = 0;
	$buf .= '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
	foreach ($latestNewsCache as $topic_id) {
		$topic = $newsCache[$topic_id];
		$buf .= '<div class="newsentry" data-newsid="'.$topic_id.'" data-date="'.$topic['date'].'">';
		$buf .= '<h4>'.$topic['title_html'].'</h4>';
		$buf .= @$topic['summary_html'];
		$buf .= '<p>&mdash;<strong>'.$topic['authorname'].'</strong> <small class="date">on '.readableDate($topic['date']).'</small>'.(isset($topic['details']) ? ' <small><a href="http://pokemonshowdown.com/news/'.$topic['topic_id'].'" target="_blank">Read more</a></small>' : '').'</p>';
		$buf .= '</div>';
		if (++$count >= 2) break;
	}
	return $buf;
}

function getNewsId() {
	global $latestNewsCache, $newsCache;
	foreach ($latestNewsCache as $topic_id) {
		return $topic_id;
	}
}
