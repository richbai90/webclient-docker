<?php
	include('../../../php/swDecoder.php');

	//-- set a cookie for given analyst, settingid 
	$cookieid = $_POST['analystid'] . ":" . $_POST['settingid'];
	setcookie($cookieid,$_POST['cookievalue'],time() + 315569260,"/sw/webclient","",($_SERVER["HTTPS"]=="on")); //-- store until 01/01/2050
	echo "OK";
	exit;
?>