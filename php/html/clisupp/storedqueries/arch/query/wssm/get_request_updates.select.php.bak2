<?php
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT updatetime,updatetxt FROM updatedb, opencall WHERE opencall.callref = updatedb.callref and updatedb.callref ='".PrepareForSql($_POST['cr'])."' and  opencall.cust_id = '".$session->selfServiceCustomerId."'";
?>