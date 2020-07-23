<?php

include 'style/wrapper.inc.php';
include '../play.pokemonshowdown.com/lib/ntbb-session.lib.php';

$page = 'resetpassword';
$pageTitle = "Reset Password";

$token = $_REQUEST['token'];
$user = $users->validatePasswordResetToken($token);
if ($user) {
	$user = $users->getUser($user);
	$pageTitle = "Reset Password for " . htmlspecialchars($user['username']);
}

includeHeader();

?>

<div class="main">

	<h1>Reset Password</h1>

<?php
if (!$user) {
?>
	<p>
		Your password reset link is invalid, probably because it has expired. Ask for a new one.
	</p>
<?php
} else {

	$action = false;
	if (@$_POST['act'] === 'changepass') {
		$action = true;
		if ($user['userid'] !== $_POST['userid']) die("pls no hax0r");
		$newUser = [
			'userid' => $_POST['userid'],
			'password' => $_POST['newpassword'],
		];

		if (strlen($_POST['newpassword']) < 5) {
			$actionerror = 'Your new password must be at least 5 characters long.';
		} else if ($_POST['newpassword'] !== $_POST['cnewpassword']) {
			$actionerror = 'Your new passwords do not match.';
		} else if (!$users->modifyUser($newUser['userid'], $newUser)) {
			$actionerror = 'Error changing password.';
		} else {
			$actionsuccess = true;
		}
	}

	if ($action && !@$actionsuccess) echo '<p class="error"><strong>Error:</strong> '.$actionerror.'</p>';

	if (@$actionsuccess) {
?>
	<p>
		The password for <?php echo htmlspecialchars($user['username']); ?> was <strong>successfully changed</strong>!.
	</p>
	<p class="mainbutton">
		<a class="button greenbutton" href="http://play.pokemonshowdown.com/">Play online</a>
	</p>
<?php
	} else {
?>
	<form action="" method="post" class="form" id="passwordform" data-target="replace">
		<input type="hidden" name="act" value="changepass" />
		<input type="hidden" name="userid" value="<?php echo htmlspecialchars($user['userid']); ?>" />
		<div class="formarea">
			<div class="formrow">
				<em class="label"><label>Username: </label></em>
				<strong><?php echo htmlspecialchars($user['username']); ?></strong>
			</div>
			<div class="formrow">
				<em class="label"><label for="newpassword">New password: </label></em>
				<input id="newpassword" name="newpassword" type="password" size="20" class="textbox" autofocus="autofocus" />
			</div>
			<div class="formrow">
				<em class="label"><label for="cnewpassword">Confirm new password: </label></em>
				<input id="cnewpassword" name="cnewpassword" type="password" size="20" class="textbox" />
			</div>
			<div class="buttonrow">
				<button type="submit"><strong>Change password</strong></button>
			</div>
		</div>
	</form>
<?php
	}
}
?>

</div>

<?php

includeFooter();

?>