<?php
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$intPK= PrepareForSql($_POST['sid']);
		$strSLA= PrepareForSql($_POST['sla']);

		$strSQL  = "select PK_AUTO_ID from SC_SLA where fk_subscription=" .$intPK." and fk_sla='" .$strSLA ."'";
		$aSLAKeys = $service->create_key_array($strSQL,"PK_AUTO_ID");
		$arc = $service->xmlmc_deleteRecords($aSLAKeys ,"SC_SLA");	
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to delete catalog rights. Please contact your Administrator.");
			exit(0);
		}
		throwSuccess();
	}
?>