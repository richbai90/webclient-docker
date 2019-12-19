<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeyValue = $_POST['kv'];

	//-- Find priority relation PK for deletion
	$strPriorityTable = "ITSMSP_SLAD_PRIORITY";
	$strSQL = "SELECT PK FROM ".$strPriorityTable." WHERE FK_SLAD = ".pfs($strKeyValue);
	$aRS = get_recordset($strSQL);
	if ($aRS)
	{
		//-- Delete priority relations
		while ($aRS->Fetch())
		{
			$strPriorityPk  = get_field($aRS,"PK");		
			$arc = xmlmc_deleteRecord($strPriorityTable,$strPriorityPk);
			if (1==$arc)
			{
				//-- Find priority matrix relation PK for deletion
				$strMatrixTable = "ITSMSP_SLAD_MATRIX";
				$strSQL = "SELECT PK_KEY FROM ".$strMatrixTable." WHERE FK_SLAD = ".pfs($strKeyValue);
				$aMatrixRS = get_recordset($strSQL);
				if ($aMatrixRS)
				{
					//-- Delete priority matrix relations
					while ($aMatrixRS->Fetch())
					{
						$strMatrixPk  = get_field($aMatrixRS,"PK_KEY");
						$arc = xmlmc_deleteRecord($strMatrixTable,$strMatrixPk);
						if(1==$arc)
						{
							//-- priority matrix relation successfully deleted
						}
						else
						{
							//-- error deleting priority matrix relation
							throwError(100,$arc);
						}
					}
				}
			}
			else
			{
				//-- error deleting priority relation
				throwError(100,$arc);
			}
		}
		throwSuccess();
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load SLA relations. Please contact your Administrator.");
	}
?>