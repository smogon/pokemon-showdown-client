<?php

if ($_GET['data']) {
	$datasplit = explode('_',$_GET['data']);
	$step = 1;
	foreach ($datasplit as $data) {
		$st = '';
		if (substr($data,0,4)==='fnt.') {
			$st = 'fnt';
			$data = substr($data,4);
		} else if (substr($data,0,3)==='dr.') {
			$st = 'dr';
			$data = substr($data,3);
		} else if (substr($data,0,3)==='sw.') {
			$st = 'sw';
			$data = substr($data,3);
		}
		$row = explode('.',$data);
		if ($step == 1 && !$st) $step = 2;
		if ($step > 1 && $st) $step = 4;
		switch ($step) {
		case 1:
			$_GET['oa'] = $row[0];
			$_GET['oahp'] = $row[1];
			$_GET['oat'] = $st;
			break;
		case 2:
			$_GET['a'] = $row[0];
			$_GET['ahp'] = $row[1];
			break;
		case 3:
			$_GET['b'] = $row[0];
			$_GET['bhp'] = $row[1];
			break;
		case 4:
			$_GET['ob'] = $row[0];
			$_GET['obhp'] = $row[1];
			$_GET['obt'] = $st;
			break;
		}
		$step++;
	}
}

//die(var_export($_GET));

$A = $_GET['a'];
$B = $_GET['b'];
$A = preg_replace('/[^a-z0-9-]+/','', strtolower($A));
$B = preg_replace('/[^a-z0-9-]+/','', strtolower($B));
$Ahp = intval($_GET['ahp']);
$Bhp = intval($_GET['bhp']);

$oA = $_GET['oa'];
$oB = $_GET['ob'];
$oA = preg_replace('/[^a-z0-9-]+/','', strtolower($oA));
$oB = preg_replace('/[^a-z0-9-]+/','', strtolower($oB));
$oAhp = intval($_GET['oahp']);
$oBhp = intval($_GET['obhp']);

$oAt = $_GET['oat'];
$oBt = $_GET['obt'];

$im = imagecreatetruecolor(500,100);

$transparent = imagecolorallocate($im, 246, 234, 252);
$blue = imagecolorallocate($im, 20, 40, 90);
$white = imagecolorallocate($im, 255, 255, 255);
$hpborder = imagecolorallocate($im, 119, 119, 119);
$hpcolor = imagecolorallocate($im, 10, 170, 102);
$hpshadowcolor = imagecolorallocate($im, 5, 119, 68);

$t_hpborder = imagecolorallocatealpha($im, 119, 119, 119,89);
$t_hpcolor = imagecolorallocatealpha($im, 10, 170, 102,89);
$t_hpshadowcolor = imagecolorallocatealpha($im, 5, 119, 68,89);

imagecolortransparent($im, $transparent);
imagefilledrectangle($im, 0,0, 499, 99, $transparent);

$srcim = imagecreatefrompng('../fx/versus.png');
imagecopymerge($im, $srcim, 250-29, 39, 0,0, 58,23, 100);
imagedestroy($srcim);

// Pokemon A

if ($Ahp)
{
$srcim = @imagecreatefrompng('../sprites/gen5/'.$A.'.png') or $srcim = imagecreatefrompng('../sprites/gen5/0.png');
//imagecopymerge($im, $srcim, 124, 4, 0,0, 96,96, $Ahp?100:30);
imagecopyresampled($im, $srcim, 124,4, 96,0, 96,96, -96,96);
imagedestroy($srcim);
}
else
{
	$srcim = @imagecreatefrompng('../sprites/gen5/'.$A.'.png') or $srcim = imagecreatefrompng('../sprites/gen5/0.png');

	$srcim2 = imagecreatetruecolor(96,96);
	$s2t = imagecolorallocate($srcim2, 246, 234, 252);
    imagealphablending($srcim2, false);
    imagealphablending($srcim, false);
	imagefilledrectangle($srcim2, 0,0, 95, 95, $s2t);
	imagecolortransparent($srcim2, $s2t);
    //imagealphablending($srcim2, true);
    imagealphablending($srcim2, true);
    imagealphablending($srcim, true);
	imagecopyresampled($srcim2, $srcim, 0,0, 96,0, 96,96, -96,96);

	imagecopymerge($im, $srcim2, 124, 4, 0,0, 96,96, 30);
	imagedestroy($srcim);
	imagedestroy($srcim2);
}


$hpwidth = intval((186-114) * $Ahp/100);

if ($Ahp)
{
	imagefilledrectangle($im, 132,90, 208, 98, $hpborder);
	imagefilledrectangle($im, 133,91, 207, 97, $white);
	imagefilledrectangle($im, 134,92, 134+$hpwidth, 96, $hpcolor);
	imagefilledrectangle($im, 134,95, 134+$hpwidth, 96, $hpshadowcolor);
}
else
{
	//imagefilledrectangle($im, 132,90, 208, 98, $t_hpborder);
	//imagefilledrectangle($im, 133,91, 207, 97, $white);
}

// Pokemon A switched

if ($oA)
{
	$srcim = @imagecreatefrompng('../sprites/gen5/'.$oA.'.png') or $srcim = imagecreatefrompng('../sprites/gen5/0.png');

	$srcim2 = imagecreatetruecolor(96,96);
	$s2t = imagecolorallocate($srcim2, 246, 234, 252);
    imagealphablending($srcim2, false);
    imagealphablending($srcim, false);
	imagefilledrectangle($srcim2, 0,0, 95, 95, $s2t);
	imagecolortransparent($srcim2, $s2t);
    //imagealphablending($srcim2, true);
    imagealphablending($srcim2, true);
    imagealphablending($srcim, true);
	imagecopyresampled($srcim2, $srcim, 0,0, 96,0, 96,96, -96,96);

	imagecopymerge($im, $srcim2, 24, 4, 0,0, 96,96, 30);
	imagedestroy($srcim);
	imagedestroy($srcim2);

	$hpwidth = intval((186-114) * $oAhp/100);

	if ($oAhp)
	{
	imagefilledrectangle($im, 32,90, 108, 98, $t_hpborder);
	imagefilledrectangle($im, 33,91, 107, 97, $white);
		imagefilledrectangle($im, 34,92, 34+$hpwidth, 96, $t_hpcolor);
		imagefilledrectangle($im, 34,95, 34+$hpwidth, 96, $t_hpshadowcolor);
	}

	if ($oAt === 'fnt' || $oAt === 'faint')
	{
		$srcim = imagecreatefrompng('../fx/faintright.png');
	}
	else
	{
		$srcim = imagecreatefrompng('../fx/switchright.png');
	}
	imagecopymerge($im, $srcim, 120-29-10, 39, 0,0, 58,23, 100);
	imagedestroy($srcim);
}

// Pokemon B

$srcim = @imagecreatefrompng('../sprites/gen5/'.$B.'.png') or $srcim = imagecreatefrompng('../sprites/gen5/0.png');
imagecopymerge($im, $srcim, 284, 4, 0,0, 96,96, $Bhp?100:30);
imagedestroy($srcim);

$hpwidth = intval((186-114) * $Bhp/100);

if ($Bhp)
{
	imagefilledrectangle($im, 292,90, 368, 98, $hpborder);
	imagefilledrectangle($im, 293,91, 367, 97, $white);
	imagefilledrectangle($im, 294,92, 294+$hpwidth, 96, $hpcolor);
	imagefilledrectangle($im, 294,95, 294+$hpwidth, 96, $hpshadowcolor);
}
else
{
	//imagefilledrectangle($im, 292,90, 368, 98, $t_hpborder);
	//imagefilledrectangle($im, 293,91, 367, 97, $white);
}

// Pokemon B switched

if ($oB)
{
	$srcim = @imagecreatefrompng('../sprites/gen5/'.$oB.'.png') or $srcim = imagecreatefrompng('../sprites/gen5/0.png');
	imagecopymerge($im, $srcim, 384, 4, 0,0, 96,96, 30);
	imagedestroy($srcim);

	$hpwidth = intval((186-114) * $oBhp/100);

	if ($oBhp)
	{
	imagefilledrectangle($im, 392,90, 468, 98, $t_hpborder);
	imagefilledrectangle($im, 393,91, 467, 97, $white);
		imagefilledrectangle($im, 394,92, 394+$hpwidth, 96, $t_hpcolor);
		imagefilledrectangle($im, 394,95, 394+$hpwidth, 96, $t_hpshadowcolor);
	}

	if ($oBt === 'fnt' || $oBt === 'faint')
	{
		$srcim = imagecreatefrompng('../fx/faintleft.png');
	}
	else
	{
		$srcim = imagecreatefrompng('../fx/switchleft.png');
	}
	imagecopymerge($im, $srcim, 380-29+10, 39, 0,0, 58,23, 100);
	imagedestroy($srcim);
}

// k

header('Content-Type: image/png');
imagepng($im);
imagedestroy($im);
