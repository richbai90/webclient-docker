<?php

	//-- Check Rights
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strKS = strtolower(trim(PrepareForSql($_POST['ks'])));
	if($strCustId != $strKS)
	{
		echo generateCustomErrorString("-303","Failed to get customer values. Please contact your Administrator.");
		exit(0);
	}else
	{
		$sqlDatabase = "swdata";
		$sqlCommand = "SELECT firstname,surname,site,fk_company_id,companyname,email,telext FROM userdb WHERE keysearch ='".PrepareForSql($_POST['ks'])."'";
	}
?>