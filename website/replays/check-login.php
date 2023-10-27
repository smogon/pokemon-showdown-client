<?php

require '../../lib/ntbb-session.lib.php';

echo ']' . ($curuser['loggedin'] ? $curuser['userid'] : '') . ',';

echo $users->isSysop() ? '1' : '';
