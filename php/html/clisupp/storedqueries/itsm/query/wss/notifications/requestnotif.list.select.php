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
	
	// First get the list of call references related to Problems & Known Errors. This is used later.
	$strPrbKeCallrefList = "0";

	//-- get call where impacted cis are used by the customer
	$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
	$strSelect .= " where cmn_rel_opencall_ci.relcode ='PROBLEM-AFFECT' ";
	$strSelect .= " and opencall.status < 15 ";
	$strSelect .= " and opencall.callclass in('Problem','Known Error') ";
	$strSelect .= " and config_reli.fk_parent_type = 'ME->CUSTOMER' ";
	$strSelect .= " and config_reli.fk_parent_itemtext = '".$strWssCustId."' ";
	$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
	$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
	
	$oRS = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRS->Fetch())
	{
		if ($strPrbKeCallrefList!="")$strPrbKeCallrefList .=",";
		$strPrbKeCallrefList .= PrepareForSql(get_field($oRS,"callref"));
	}
	
	//-- 90069 add owned problems/known errors
	//-- get calls that are owned by customer
	$strSelect = "select callref from opencall";
	$strSelect .= " where opencall.status < 15 ";
	$strSelect .= " and opencall.callclass in('Problem','Known Error','Change Request') ";
	$strSelect .= " and opencall.cust_id = '".$strWssCustId."' ";
			
	$oRS2 = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRS2->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS2->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRS2->Fetch())
	{
		if ($strPrbKeCallrefList!="")$strPrbKeCallrefList .=",";
		$strPrbKeCallrefList .= PrepareForSql(get_field($oRS2,"callref"));
	}
		
	//-- get incident calls linked to problems and that are owned by customer
	$strSelect = "select distinct(fk_callref_m) as cref_m from opencall, cmn_rel_opencall_oc ";
	$strSelect .= " where cmn_rel_opencall_oc.relcode ='PROBLEM-INCIDENT' ";
	$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
	$strSelect .= " and opencall.cust_id = '".$strWssCustId."' ";

	$oRS3 = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRS3->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS3->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRS3->Fetch())
	{
		if ($strPrbKeCallrefList!="")$strPrbKeCallrefList .=",";
		$strPrbKeCallrefList .= PrepareForSql(get_field($oRS3,"cref_m"));
	}

	$strRfcRelCallrefList = $strPrbKeCallrefList;
	
	//-- get problem calls linked to problems and that are owned by customer
	$strSelect = "select distinct(fk_callref_m) as cref_m from cmn_rel_opencall_oc ";
	$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-ERROR' OR cmn_rel_opencall_oc.relcode ='RELEASE-ERROR') ";
	$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s in(".$strPrbKeCallrefList.") ";
	
	$oRSRfcRel2 = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRSRfcRel2->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRSRfcRel2->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRSRfcRel2->Fetch())
	{
		if ($strRfcRelCallrefList!="")$strRfcRelCallrefList .=",";
		$strRfcRelCallrefList .= PrepareForSql(get_field($oRSRfcRel2,"cref_m"));
	}	

	// Get the call refs linked to Changes and Releases
	//-- get call where impacted cis are used by the customer
	$strSelect = "select callref from opencall, config_reli, cmn_rel_opencall_ci ";
	$strSelect .= " where (cmn_rel_opencall_ci.relcode ='RFC-AFFECT' OR cmn_rel_opencall_ci.relcode ='RELEASE-AFFECT')";
	$strSelect .= " and opencall.status < 15 ";
	$strSelect .= " and opencall.callclass in('Change Request','Release Request') ";
	$strSelect .= " and config_reli.fk_parent_type = 'ME->CUSTOMER' ";
	$strSelect .= " and config_reli.fk_parent_itemtext = '".$strWssCustId."' ";
	$strSelect .= "	and cmn_rel_opencall_ci.fk_callref = opencall.callref ";
	$strSelect .= " and cmn_rel_opencall_ci.fk_ci_auto_id = config_reli.fk_child_id ";
	
	$oRSRfcRel1 = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRSRfcRel1->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRSRfcRel1->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRSRfcRel1->Fetch())
	{
		if ($strRfcRelCallrefList!="")$strRfcRelCallrefList .=",";
		$strRfcRelCallrefList .= PrepareForSql(get_field($oRSRfcRel1,"callref"));
	}	
	
	//-- get incident calls linked to rfc and that are owned by customer
	$strSelect = "select distinct(fk_callref_m) as cref_m from opencall, cmn_rel_opencall_oc ";
	$strSelect .= " where (cmn_rel_opencall_oc.relcode ='RFC-INCIDENT' OR cmn_rel_opencall_oc.relcode ='RELEASE-INCIDENT') ";
	$strSelect .= "	and cmn_rel_opencall_oc.fk_callref_s = opencall.callref ";
	$strSelect .= " and opencall.cust_id = '".$strWssCustId."' ";
	
	$oRSRfcRel3 = get_recordset($strSelect,"swdata");
	//-- Check for XMLMC Error
	if($oRSRfcRel3->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRSRfcRel3->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRSRfcRel3->Fetch())
	{
		if ($strRfcRelCallrefList!="")$strRfcRelCallrefList .=",";
		$strRfcRelCallrefList .= PrepareForSql(get_field($oRSRfcRel3,"cref_m"));
	}	
	
	$strSelect = "SELECT opencall.h_formattedcallref, opencall.status, opencall.callclass, opencall.logdatex, prb_title, itsm_title FROM opencall";
	$strSelect .= " LEFT JOIN itsm_opencall_problem on itsm_opencall_problem.callref = opencall.callref";
	$strWhere = " WHERE opencall.itsm_selfservice_on = 1";
	$strWhere .= " AND opencall.callref IN (".$strRfcRelCallrefList.")";
	$strOrderBy = " ORDER BY opencall.logdatex DESC";
	
	$strSQL = $strSelect.$strWhere.$strOrderBy;

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = $strSQL;
