<?php 
	
	$strMailBox = pfs($_POST['mailbox']);
	$strDataset = pfs($_POST['dataset']);
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT setting_value FROM sw_sbs_settings WHERE setting_name='" . $strMailBox . "' AND appcode='" . $strDataset . "'";
?>