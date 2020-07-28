<?php
date_default_timezone_set('America/Los_Angeles');
include __DIR__.'/../website/news/include.php';

echo json_encode(array(getNewsId(), renderNews()));
