<?php

$type = $_GET['type'];

$person = $_GET['person'];

$personid = $_GET['personid'];

$room = $_GET['room'];

$notificationData = "{type: '".$type."', person: '".htmlentities($person)."', personid: '".htmlentities($personid)."', room: '".htmlentities($room)."'}";

?>
<!DOCTYPE html>
<html>
<head>
	<title>Notification</title>
	<style>
html { margin: 0; padding: 0; }
body {
	margin: 0;
	padding: 0 8px;
	font-size: 10pt;
	font-family: Verdana, sans-serif;
}
p
{
	margin: 0.5em;
}
	</style>
</head>
<body>
<?php

switch ($type)
{
case 'challenge':
?>
	<p>
		<img src="/favicon-notify.gif" alt="[!]" /> You have been challenged by <?php echo htmlentities($person); ?>.
	</p>
	<p>
		<button>Respond</button>
	</p>
<?php
	break;
case 'yourMove':
?>
	<p>
		<img src="/favicon-notify.gif" alt="[!]" /> It's your move.
	</p>
	<p>
		<button>Make a move</button>
	</p>
<?php
	break;
case 'yourSwitch':
?>
	<p>
		<img src="/favicon-notify.gif" alt="[!]" /> It's your move.
	</p>
	<p>
		<button>Switch your pokemon</button>
	</p>
<?php
	break;
}

?>
</body>
</html>