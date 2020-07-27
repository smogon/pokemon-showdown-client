<?php

header('Content-Type: text/plain');

echo @$_SERVER['HTTP_X_FORWARDED_FOR'];

if (isset($_REQUEST['more'])) {
	echo "\n\nREMOTE_ADDR: ".@$_SERVER['REMOTE_ADDR'];
}
