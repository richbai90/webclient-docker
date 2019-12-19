<?php

	//-- used in global.js update_service_costs

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$strTable = "SC_FOLIO";
		$arrData['FK_CMDB_ID'] = '![fcid:numeric]';
		$arrData['COST_MAINTENANCE'] = ':[cm]';
		$arrData['COST_SUBSCRIPTION'] = ':[cs]';
		$arrData['COST_REQUEST'] = ':[cr]';

		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
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