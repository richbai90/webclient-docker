<?php
	//-- Check Rights
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strKS = strtolower(trim(PrepareForSql($_POST['aid'])));
	if($strCustId != $strKS)
	{
		echo generateCustomErrorString("-303","Failed to Get Authorisation Details. Please contact your Administrator.");
		exit(0);
	}else
	{
		$sqlDatabase = "swdata";
		$sqlCommand = "SELECT callref, cust_name, logdate, itsm_title, prob_text, bpm_oc_auth.status as auth_status, bpm_oc_auth.pk_auth_id, bpm_oc_auth.comments FROM opencall, bpm_oc_auth where bpm_oc_auth.pk_auth_id='".PrepareForSql($_POST['id'])."'  and bpm_oc_auth.fk_callref=opencall.callref and bpm_oc_auth.fk_auth_id='".PrepareForSql($_POST['aid'])."' and opencall.status < 16";
	}
?>