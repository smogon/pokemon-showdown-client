<?php
date_default_timezone_set('America/Los_Angeles');
include __DIR__.'/../pokemonshowdown.com/news/include.php';

echo json_encode([getNewsId(), renderNews()]);
