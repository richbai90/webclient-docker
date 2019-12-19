<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "USERDB";
	$arrData['KEYSEARCH'] = '![cust:sqlparamstrict]';
	$arrData['DEPARTMENT'] = '';
	$arc = xmlmc_updateRecord($strTable,$arrData);
	
	if(1==$arc)throwSuccess();
	else throwProcessErrorWithMsg("Failed to clear department value. Please contact your Administrator.");

?>