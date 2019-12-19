<?php
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeys = '![users:sarray]';
	$arrSelectedKeys = explode(",",$strKeys);
	
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "USERDB";
		$arrData['KEYSEARCH'] = $key;
		$arrData['DEPARTMENT'] = '![dept:sqlparamstrict]';
		$arc = xmlmc_updateRecord($arrTable,$arrData);
		if(1==$arc) continue;
		else throwProcessErrorWithMsg("Failed to set department value. Please contact your Administrator.");
	}
	throwSuccess();
?>