<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	//-- Check Rights
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strKS = strtolower(trim(PrepareForSql($_POST['ks'])));
	if($strCustId != $strKS)
	{
		echo generateCustomErrorString("-303","Failed to set customer values. Please contact your Administrator.");
		exit(0);
	}else
	{
		$strTable = "USERDB";
		$arrData['KEYSEARCH'] = '![ks:sqlparamstrict]';
		$arrData['FIRSTNAME'] = '![fname:sqlparamstrict]';
		$arrData['SURNAME'] = '![sname:sqlparamstrict]';
		$arrData['SITE'] = '![site:sqlparamstrict]';
		$arrData['TELEXT'] = '![tel:sqlparamstrict]';
		$arrData['EMAIL'] = '![em:sqlparamstrict]';
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to set customer values. Please contact your Administrator.");
			exit(0);
		}
		throwRowCountResponse($arc);
	}
?>