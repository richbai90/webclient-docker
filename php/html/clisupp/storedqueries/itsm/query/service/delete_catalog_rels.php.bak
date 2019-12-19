<?php

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();


	if($service->can_update())
	{
		$strKey= PrepareForSql($_POST['key']);
		$strService= PrepareForSql($_POST['service']);
		
		if($_POST['bp']==1)
		{
			$strSQL = "select pk_auto_id from config_reli where  fk_child_id=".$strKey." and fk_parent_id=" . $strService ;
		}
		else
		{
			$strSQL = "select pk_auto_id from config_reli where fk_parent_id =".$strKey." and fk_child_id=" . $strService ;
		}
		$aRS = get_recordset($strSQL);
		if ($aRS->Fetch())
		{
			$strKeyValue  = get_field($aRS,"pk_auto_id");
		}
		$strTable = "CONFIG_RELI";
		$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
		if(1==$arc)
		{
			//-- config_reli relationship deleted successfully.
		}
		else
		{
			//-- Failed to delete config_reli relationship.
			throwError(100,$arc);
		}
		
		$strSQL = "select pk_auto_id from sc_rels where fk_key =".$strKey." and fk_service=" . $strService ;
		$aRS = get_recordset($strSQL);
		if ($aRS->Fetch())
		{
			$strKeyValue  = get_field($aRS,"pk_auto_id");
		}
		$strTable = "SC_RELS";
		$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			//-- Failed to delete
			throwError(100,$arc);
		}
	}
?>