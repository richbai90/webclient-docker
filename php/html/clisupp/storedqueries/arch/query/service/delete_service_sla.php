<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update())
	{
		$strKey= PrepareForSql($_POST['key']);

		$strTable = "SC_SLA";
		$arc = xmlmc_deleteRecord($strTable,$strKey);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
?>