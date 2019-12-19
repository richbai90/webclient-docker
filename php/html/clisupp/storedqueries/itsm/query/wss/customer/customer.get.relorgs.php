<?php

	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//SQL Injection checks
	//--Required Columns
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));

	//Get custid column ID for Userdb for session customer if passed through custid doesn't match session ID
	$strAuthIDFld = 'keysearch';
	if($strCustId != $strWssCustId) {
		IncludeApplicationPhpFile("itsm.helpers.php");
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
	}

	//Get all orgs associated with Customer
	$strSQL  = "SELECT userdb_company.fk_org_id AS keycol, company.companyname AS discol
              FROM userdb_company, company
              WHERE userdb_company.fk_org_id = company.pk_company_id
              AND fk_user_id = '".PrepareForSql($strWssCustId)."'
							ORDER BY companyname ASC";
	$sqlDatabase = "swdata";
	$sqlCommand = $strSQL;
