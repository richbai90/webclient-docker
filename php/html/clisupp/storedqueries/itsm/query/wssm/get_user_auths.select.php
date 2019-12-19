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
		$sqlCommand = "select h_formattedcallref, callclass,callref, cust_id, cust_name,opencall.status, priority, logdatex, fixbyx, itsm_title, pk_auth_id, bpm_oc_auth.status as auth_status from opencall, bpm_oc_auth where bpm_oc_auth.fk_auth_id='".PrepareForSql($_POST['ks'])."' and bpm_oc_auth.authortype IN ('Customer','Customer''s Manager','Customer Manager') and bpm_oc_auth.fk_callref=opencall.callref and opencall.status < 16";
	}
?>