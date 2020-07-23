<?php

include __DIR__ . '/../../config/news.inc.php';

function toJSON($topic) {
  return [
    'id' => $topic['topic_id'],
    'title' => $topic['title'],
    'author' => $topic['authorname'],
    'date' => intval($topic['date']),
    'summaryHTML' => $topic['summary_html'],
    'detailsHTML' => $topic['details_html'],
  ];
}

$output = null;
if (!$_GET['id']) {
  $output = [
    toJSON($newsCache[$latestNewsCache[0]]),
    toJSON($newsCache[$latestNewsCache[1]]),
    toJSON($newsCache[$latestNewsCache[2]]),
  ];
} else {
  $topic = $newsCache[$_GET['id']] ?? null;
  if (!$topic) {
    header('HTTP/1.1 404 Not Found');
    die("null");
  }
  $output = toJSON($topic);
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode($output);
