<?php

	//-- used in global.js update_service_costs
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$strItemiSQL = "SELECT USERS_PROJECTED FROM SC_FOLIO WHERE FK_CMDB_ID = ![fcid:numeric]";
		$aItemiRS = get_recordset($strItemiSQL);
		if ($aItemiRS->Fetch())
		{
			$intUsersProjected  = get_field($aReliRS,"USERS_PROJECTED");
		}
		
		
		$strTable = "SC_FOLIO";
		$arrData['USERS_DIFFERENCE'] = $intUsersProjected - "![numberOfUsers:numeric]";
		$arrData['TOTAL_SUBSCRIPTION_REVENUE'] = ':[strNewRev]';
		$arrData['USERS_ACTUAL'] = ':[numberOfUsers]';
		$arrData['FK_CMDB_ID'] = '![fcid:numeric]';

		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}else
		{
			throwError(100,$arc);
		}
	
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}

?>