<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeyValue = $_POST['kv'];

	$strTable = "ITSMSP_SLAD_PRIORITY";
	$strSQL = "SELECT PK FROM ".$strTable." WHERE FLG_SLA=0 AND FK_SLAD = ".pfs($strKeyValue);
	$aRS = get_recordset($strSQL);
	if ($aRS)
	{
		while ($aRS->Fetch())
		{
			$strPriorityPk  = get_field($aRS,"PK");
			$arc = xmlmc_deleteRecord($strTable,$strPriorityPk);
			if(1==$arc)
			{
				//-- relations successfully deleted
			}
			else
			{
				//-- error deleting relation
				throwError(100,$arc);
			}
		}
		throwSuccess();
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load OLA relations. Please contact your Administrator.");
	}
?>