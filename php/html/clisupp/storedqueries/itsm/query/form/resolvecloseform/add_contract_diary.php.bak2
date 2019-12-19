<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strAnalystID = $session->analyst->AnalystID;
	$strUpdatedOn = time();

	$strUDCode = $_POST['udcode'];
	$strContractID = $_POST['contract'];
	$strUpdateTxt = $_POST['updatetxt'];
	$strCallref = $_POST['callref'];

	$strUnitsRemain = $_POST['urem'];
	$strUnitsUsed = $_POST['uuse'];
	$strRelID = $_POST['rel'];

	if(!_validate_url_param($strUDCode,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($strContractID,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($strCallref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	
	if($strUDCode=="Unit Usage")
	{
		$strCols = "";
		$strVals = "";
		if(!_validate_url_param($strUnitsUsed,"num"))
		{
			throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
			exit(0);
		}
		if(!_validate_url_param($strRelID,"sqlparamstrict"))
		{
			throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
			exit(0);
		}


		if(isset($strUnitsRemain))
		{
			if(!_validate_url_param($strUnitsRemain,"num"))
			{
				throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
				exit(0);
			}
			$strCols = "udcode, fk_contract_id, analystid, updatetxt, updatedonx, callref, units_remain, units_used, fk_rel_id";
			$strVals = "Unit Usage, ".PrepareForSql($strContractID).", ".PrepareForSql($strAnalystID).", Units reduced by ticket resolution/closure., ".$strUpdatedOn.", ".$strCallref.",".$strUnitsRemain.",".$strUnitsUsed.",".PrepareForSql($strRelID);
		}
		else
		{
			$strCols = "udcode, fk_contract_id, analystid, updatetxt, updatedonx, callref, units_used, fk_rel_id";
			$strVals = "Unit Usage, ".PrepareForSql($strContractID).", ".PrepareForSql($strAnalystID).", Available units set to Unlimited - units not reduced by ticket resolution/closure., ".$strUpdatedOn.", ".$strCallref.",".$strUnitsUsed.",".PrepareForSql($strRelID);
		}
	}
	elseif($strUDCode=="Threshold Breach Alert Sent")
	{
		if(!_validate_url_param($strUpdateTxt,"sqlparamstrict"))
		{
			throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
			exit(0);
		}
		$strCols = "udcode, fk_contract_id, analystid, updatetxt, updatedonx, callref";
		$strVals = "Threshold Breach Alert Sent, ".PrepareForSql($strContractID).", ".PrepareForSql($strAnalystID)."', Threshold Breached! Rule: ".PrepareForSql($strUpdateTxt)."; Available units reduced to below a set threshold by ticket resolution/closure., ".$strUpdatedOn.", ".PrepareForSql($strCallref);
	}
	else
	{
		throwProcessErrorWithMsg("Invalid contract diary type supplied. Please contact your Administrator.");
	}

	$arrCols = explode(",",$strCols);
	$arrVals = explode(",",$strVals);

	for ($i = 0; $i < count($arrCols); $i++) {
		$arrData[trim($arrCols[$i])] = trim($arrVals[$i]);
	}
	$strTable = "CONTRACT_DIARY";
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
?>