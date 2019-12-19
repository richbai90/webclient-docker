<?php
	//-- Check Rights
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strKS = strtolower(trim(PrepareForSql($_POST['ks'])));
	if($strCustId != $strKS)
	{
		echo generateCustomErrorString("-303","Failed to Process Query. Please contact your Administrator.");
		exit(0);
	}else
	{
		$sqlDatabase = "swdata";
		$sqlCommand = "select h_formattedcallref, callref, itsm_title, closedate from opencall where cust_id =  '".PrepareForSql($_POST['ks'])."' AND status < 16";
	}
?>