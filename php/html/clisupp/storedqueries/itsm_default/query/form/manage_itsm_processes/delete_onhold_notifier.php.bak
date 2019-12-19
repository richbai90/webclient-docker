<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeyValue = $_POST['kv'];
	$strWhere = "";
	//-- get the table primary key name and type
	$tableName = "onhold_periods";
	$primaryKeyColumn = getTablePrimaryKeyName($tableName);
	$bNumeric = isColNumeric($tableName,$primaryKeyColumn);
	$strQuote = ($bNumeric)?"":"'";

	//-- nwj :- determine if needs quotes
	if($strKeyValue != "")
	{
		$iInQ = get_rowcount("onhold_oc_notifiers", "email_sent = 0 and onhold_period = " . $strQuote . PrepareForSQL($strKeyValue) . $strQuote);
		if ($iInQ > 0){
			throwProcessErrorWithMsg("There are still active notifications pending within this period. Please await those coming off hold.");
			exit;
		}
		//-- Delete 'on hold period'
		$arc = xmlmc_deleteRecord($tableName,$strKeyValue);
		if(1==$arc)
		{
			//-- Find and delete any associated 'on hold notifiers'
			$strTable = "ONHOLD_NOTIFIERS";
			$strSQL = "SELECT ID FROM ".$strTable." WHERE ONHOLD_PERIOD = '".PrepareForSql($strKeyValue)."'";
			$aRS = get_recordset($strSQL);
			while($aRS->Fetch())
			{
				$strKeyValue1 = get_field($aRS,"ID");
				$arc1 = xmlmc_deleteRecord($strTable,$strKeyValue1);
				if(1==$arc1)
				{
					//-- Deleted successfully
				}
				else
				{
					throwError(100,$arc1);
				}
			}
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwProcessErrorWithMsg("Failed to process deletion of onhold period. Please contact your System Administrator.");
?>