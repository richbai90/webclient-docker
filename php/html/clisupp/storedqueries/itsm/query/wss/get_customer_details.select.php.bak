<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strInstanceID = $session->analystId;
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strWssCustId = strtolower(trim(PrepareForSql($_POST['ks'])));

	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
		if($strWssCustId == "") {
			echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
			exit(0);
		}
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT 	keysearch,
													firstname,
													surname,
													fullname,
													email,
													site,
													fk_company_id,
													companyname,
													costcenter,
													fk_dept_code,
													department,
													subdepartment,
													flg_manager,
													fk_manager,
													priority,
													sld,
													sld_name,
													job_title,
													jobrole,
													jobdesc
									FROM 		userdb
									WHERE   keysearch =  '".PrepareForSql($strWssCustId)."'";
