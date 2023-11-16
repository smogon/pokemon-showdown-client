#!/usr/bin/php
<?php

// This is set to run in cron.

require_once dirname(__FILE__) . '/poregistry.lib.php';
require_once dirname(__FILE__) . '/ntbb-database.lib.php';

PORegistry::updateUserStats();
