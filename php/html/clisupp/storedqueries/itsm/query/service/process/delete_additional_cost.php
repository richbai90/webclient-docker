<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update())	{
		if($service->can_manage_cost_and_subs()) {
		$intPrimaryKey = $_POST['key'];
		
		$strSQL  = "select * from sc_rels where pk_auto_id = " .  $intPrimaryKey;
		$strDB = "swdata";
		$oRS  = get_recordset($strSQL,$strDB);
		if($oRS->Fetch())	{ 
			$strChildKey  = get_field($oRS,"FK_KEY");
			$strService = get_field($oRS,"FK_SERVICE");
			$service->delete_meconfigrelation($strService,$strChildKey);			
			$strTable = "SC_RELS";
			$arc = xmlmc_deleteRecord($strTable,$intPrimaryKey);
			if(1==$arc)
			{
				throwSuccess();
			}
			else
			{
				throwError(100,$arc);
			}
		}
		$service->throwError("The service cost was unable to be deleted. Please contact your Administrator.");
		} else {
			throwProcessErrorWithMsg("You are not authorised to manage costs and subscriptions. Please contact your Administrator.");
			exit(0);
		}
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>