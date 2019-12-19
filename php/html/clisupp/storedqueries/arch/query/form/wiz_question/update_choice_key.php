<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$intIDs = $_POST['cids'];
	$intFK = $_POST['qid'];
	if(!_validate_url_param($intFK,"num"))
	{
		throwProcessErrorWithMsg("Invalid Question ID supplied. Please contact your Administrator.");
	}

	$strKeys = prepareNumericCommaDelimitedValues($intIDs);
	$arrKeys = explode(',',$strKeys);
	
	foreach ($arrKeys as $key)
	{
		$strTable = "WSSM_WIZ_QC";
		$arrData['PK_QCID'] = $key;
		$arrData['FK_QID'] = $intFK;
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			//-- record updated successfully
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
?>