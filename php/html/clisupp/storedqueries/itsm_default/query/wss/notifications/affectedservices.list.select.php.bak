<?php
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict")  : false);
	$strInstanceID = $_POST['ssid'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strInstanceID,"sqlparamstrict") : false);


	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		IncludeApplicationPhpFile("itsm.helpers.php");
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
		if($strWssCustId == "") {
			echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
			exit(0);
		}
	}

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	
	$strCompanyId = PrepareForSql(strtolower(trim($_POST['fk_company_id'])));
	$strSite = PrepareForSql(strtolower(trim($_POST['site'])));
	$strDept = PrepareForSql(strtolower(trim($_POST['department'])));
	$strSubDept = PrepareForSql(strtolower(trim($_POST['subdepartment'])));

	$strSelect = "SELECT config_itemi.pk_auto_id AS ci_auto_id, cmdb_status, description, fk_status_level, selfserv_titlefail, selfserv_titleimpact ";
	$strSelect .= "FROM config_itemi, config_reli, config_typei ";
	$strWhere = 	"WHERE config_itemi.ck_config_type = config_typei.pk_config_type 
					and (config_typei.flg_canmonitor = 1 OR config_itemi.flg_availmntr = 1) 
					and fk_child_id = config_itemi.pk_auto_id  
					and isactivebaseline='Yes' 
					and ((flg_showonselfserv=1 and (isactive='Yes')) 
					or (flg_showonselfservfail=1 and (isunavailable='Yes')) 
					or (flg_showonselfservimpact=1 and (isimpacted='Yes' OR isfaulty='Yes')))
					and ( 
						(fk_parent_type = 'ME->COMPANY' and fk_parent_itemtext = '".$strCompanyId."')
						OR (fk_parent_type = 'ME->CUSTOMER' and fk_parent_itemtext = '".$strWssCustId."')  
						OR (fk_parent_type = 'ME->SITE' and fk_parent_itemtext = '".$strSite."') 
						OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".$strDept."') 
						OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".$strSubDept."')
					) ";
	$strOrderBy = "ORDER BY cmdb_status desc";

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere.$strOrderBy;
