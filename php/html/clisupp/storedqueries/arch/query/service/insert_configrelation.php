<?php

	//-- loop passed in columns for table and create insert statement
	//-- 
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$parentKey= PrepareForSql($_POST['parentKey']);
		$parentType= PrepareForSql($_POST['parentType']);
		$parentText= PrepareForSql($_POST['parentText']);
		$childKey= PrepareForSql($_POST['childKey']);
		$childType= PrepareForSql($_POST['childType']);
		$childText= PrepareForSql($_POST['childText']);
		$strDependancy = PrepareForSql($_POST['strDependancy']);
		$ynOperational= PrepareForSql($_POST['ynOperational']);
		$strParentDesc= PrepareForSql($_POST['strParentDesc']);
		$strChildDesc= PrepareForSql($_POST['strChildDesc']);
		$boolOption= PrepareForSql($_POST['boolOption']);
		
		if(!$service->cmdb_insert_configrelation($parentKey, $parentType, $parentText, $childKey, $childType, $childText, $strDependancy, $ynOperational, $strParentDesc, $strChildDesc, $boolOption))
		{
			//-- throw error
			$service->throwError("Failed to build config_reli relationship. Please contact your Administrator.");
		}
		throwSuccess();
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>