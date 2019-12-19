<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strContract = $_POST["contract"];
	if(!_validate_url_param($strContract,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}

	$strText = $_POST["txt"];
	if(!_validate_url_param($strText ,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("Invalid text was specified. Please contact your Administrator.");
		exit(0);
	}

	$strCode = "Detail Update";
	if(isset($_POST['code']))
	{
		$strCode = $_POST['code'];
	}

	
	$strTable = "CONTRACT_DIARY";
	$arrData['FK_CONTRACT_ID'] = PrepareForSql($strContract);
	$arrData['UPDATETXT'] = PrepareForSql($strText);
	$arrData['UDCODE'] = PrepareForSql($strCode);
	$arrData['ANALYSTID'] = PrepareForSql($session->analyst->AnalystID);
	$arrData['UPDATEDONX'] = time();
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
	
	
	
	
/*	$strInsert = "insert into contract_diary (fk_contract_id,updatetxt,udcode,analystid,updatedonx) values ('".PrepareForSql($strContract)."','".PrepareForSql($strText)."','".PrepareForSql($strCode)."','".PrepareForSql($session->analyst->AnalystID)."',".time().")";
	$arc = SqlExecute('swdata',$strInsert);
	if(0==$arc)
	{
		throwProcessErrorWithMsg($arc."Failed to add diary entry. Please contact your Administrator.");
		exit(0);
	}*/

	//throwSuccess();
?>