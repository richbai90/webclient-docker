<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	//-- Check Rights
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strKS = strtolower(trim(PrepareForSql($_POST['aby'])));
	if($strCustId != $strKS)
	{
		echo generateCustomErrorString("-303","Failed to Authorise Request. Please contact your Administrator.");
		exit(0);
	}else
	{
		$strDecisionText = "";
		if($_POST['sts']=="1")
		{
			$strDecisionText = "Authorised";
		}
		elseif($_POST['sts']=="2")
		{
			$strDecisionText = "Rejected";
		}
		else
		{
			throwProcessErrorWithMsg("Invalid Status Provided. Please contact your Administrator.");
			exit(0);
		}
		
		// -- Build updateRecord
		$strTable = "BPM_OC_AUTH";
		$arrData['PK_AUTH_ID'] = '![id:sqlparamstrict]';
		$arrData['COMMENTS'] = '![cmt:sqlparamstrict]';
		$arrData['FLG_STATUS'] = $_POST['sts'];
		$arrData['ACTIONBY'] = '![aby:sqlparamstrict]';
		$arrData['ACTIONBYNAME'] = '![aby:sqlparamstrict]';
		$arrData['STATUS'] = $strDecisionText;
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to set customer values. Please contact your Administrator.");
			exit(0);
		}
		throwRowCountResponse($arc);
	}
?>