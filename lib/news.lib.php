<?php

$newsData = json_decode(file_get_contents(__DIR__ . '/../config/news.json'), true);
$latestNewsCache = $newsData['latest'] ?? [];
$newsCache = $newsData['news'] ?? [];
unset($newsData);
