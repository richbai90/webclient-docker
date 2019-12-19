<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeyValue = $_POST['kv'];
	
	
	//-- Find config item PK
	$strItemiSQL = "select pk_auto_id from config_itemi where ck_config_type like 'ME->SLR' and ck_config_item = ".pfs($strKeyValue);
	$aItemiRS = get_recordset($strItemiSQL);
	if ($aItemiRS->Fetch())
	{
		$strItemiKey  = get_field($aItemiRS,"pk_auto_id");
		
		//-- Find config_reli PKs for deletion
		$strReliSQL = "select pk_auto_id from config_reli where fk_child_id = ".$strItemiKey;
		$aReliRS = get_recordset($strReliSQL);
		while ($aReliRS->Fetch())
		{
			$strReliKey  = get_field($aReliRS,"pk_auto_id");
			$arcReli = xmlmc_deleteRecord("config_reli",$strReliKey);
			if (1==$arcReli)
			{
				//-- config_reli entry deleted successfully
			}
			else
			{
				//-- error deleting config_reli entry
				throwError(100,$arcReli);
			}
		}
		$strSQL = "delete from cmn_rel_opencall_ci where fk_ci_auto_id = ".$strItemiKey;
		if(SqlExecute("swdata", $strSQL))
		{
			//-- config_reli entry deleted successfully
		}
		//-- Find uri PKs for deletion
		$strUriSQL = "select pk_caturi_id from itsmsp_uri where fk_slrd = ".$strKeyValue;
		$aUriRS = get_recordset($strUriSQL);
		while ($aUriRS->Fetch())
		{
			$strUriKey  = get_field($aUriRS,"pk_caturi_id");
			$arcUri = xmlmc_deleteRecord("itsmsp_uri",$strUriKey);
			if (1==$arcUri)
			{
				//-- uri entry deleted successfully
			}
			else
			{
				//-- error deleting uri entry
				throwError(100,$arcUri);
			}
		}
		
		//-- Find diary PKs for deletion
		$strDiarySQL = "select pk_id from itsmsp_slrd_diary where fk_slrd_id = ".$strKeyValue;
		$aDiaryRS = get_recordset($strDiarySQL);
		while ($aDiaryRS->Fetch())
		{
			$strDiaryKey  = get_field($aDiaryRS,"pk_id");
			$arcDiary = xmlmc_deleteRecord("itsmsp_slrd_diary",$strDiaryKey);
			if (1==$arcDiary)
			{
				//-- Diary entry deleted successfully
			}
			else
			{
				//-- error deleting diary entry
				throwError(100,$arcDiary);
			}
		}
		
		//-- Find discussion PKs for deletion
		$strDisSQL = "select pk_id from slrd_discussion where fk_slrd_id = ".$strKeyValue;
		$aDisRS = get_recordset($strDisSQL);
		while ($aDisRS->Fetch())
		{
			$strDisKey  = get_field($aDisRS,"pk_id");
			$arcDis = xmlmc_deleteRecord("slrd_discussion",$strDisKey);
			if (1==$arcDis)
			{
				//-- Discussion entry deleted successfully
			}
			else
			{
				//-- error deleting discussion entry
				throwError(100,$arcDis);
			}
		}
		throwSuccess();
	}
?>