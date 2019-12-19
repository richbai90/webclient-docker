<?php

//-- itsm class and instance - put any custom helper functions for itsm in here
//-- that way will not conflict with php processor functions. Any common functions can define here and at later date can add to php processor

if(!clasS_exists('itsmFunctions'))
{

	@IncludeApplicationPhpFile("service.helpers.php");
	@IncludeApplicationPhpFile("cmdb.helpers.php");

	class itsmFunctions
	{

		function isColNumeric($strTable, $strColumn)
		{
			$intType = swdti_getdatatype($strTable.".".$strColumn);
			$bNumeric = ($intType==8||$intType==-1)?false:true;
			return $bNumeric;
		}
	}

	//-- instance for developers to use in the scripts
	global $itsm;
	$itsm = new itsmFunctions();
}
	//-- Add Data API Calls for add, update, delete so that VPME table events are triggered.
	//--addRecord
	function xmlmc_addRecord($strTable, $arrData)
	{
		$boolSuccess = false;
		$strLastError = "";

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("table",$strTable);

		//--Set Data for each $arrData Key Value must be in here or it will fail
		foreach ($arrData as $key => $value)
		{
			$value = parse_param($value);
			$xmlmc->setData($key, $value);
		}

		//-- Invoke
		if($xmlmc->invoke("data","addRecord"))
		{
			$boolSuccess  = true;
		}else
		{
			$strLastError = $xmlmc->xmlmc->xmlresult;
		}

		if($boolSuccess == true)
		{
			return true;
		}else
		{
			return $strLastError;
		}

	}

	//--updateRecord
	function xmlmc_updateRecord($strTable, $arrData)
	{
		$boolSuccess = false;
		$strLastError = "";

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("table",$strTable);

		//--Set Data for each $arrData Key Value must be in here or it will fail
		foreach ($arrData as $key => $value)
		{
			$value = parse_param($value);
			$xmlmc->setData($key, $value);
		}

		//-- Invoke
		if($xmlmc->invoke("data","updateRecord"))
		{
			$boolSuccess  = true;
		}else
		{
			$strLastError = $this->xmlmc->xmlresult;
		}

		if($boolSuccess == true)
		{
			return true;
		}else
		{
			return $strLastError;
		}
	}

	// -- Get key column value and call deleteRecord
	function xmlmc_deleteRecord_where($strTable,$strWhere,$sqlDatabase="swdata",$skip=false)
	{
		$strTableName = UC($strTable);
		$strTableKey = UC(getTablePrimaryKeyName($strTableName,$sqlDatabase));
		$strSelect = "SELECT ".$strTableKey." FROM ".$strTableName." WHERE ".$strWhere;
		$oRS = get_recordset($strSelect,$sqlDatabase);
		$arrIDs = array();
		while($oRS->Fetch())
		{
			$arrIDs[] = get_field($oRS,$strTableKey);
		}
		if(count($arrIDs)>0)
		{
			foreach($arrIDs as $key)
			{
				$arc = xmlmc_deleteRecord($strTableName,$key);
				if(1==$arc) continue;
				else throwError(100,$arc);
			}

		}
		if(!$skip) throwSuccess();

	}

	//--deleteRecord
	function xmlmc_deleteRecord($strTable, $strKeyValue)
	{
		$boolSuccess = false;
		$strLastError = "";

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("table",$strTable);
		$xmlmc->SetParam("keyValue",$strKeyValue);

		//-- Invoke
		if($xmlmc->invoke("data","deleteRecord"))
		{
			$boolSuccess  = true;
		}else
		{
			$strLastError = $xmlmc->xmlmc->xmlresult;
		}

		if($boolSuccess == true)
		{
			return true;
		}else
		{
			return $strLastError;
		}
	}

	//-- Functions for Parsing
	function parse_param($param)
	{
		//-- parse optional params :paramname:
		if(preg_match_all('/:\[(.*?)\]/',$param,$match))
		{
			//-- have array of matches now replace
			$match = $match[1];
			while (list($pos,$paramName) = each($match))
			{
				//-- replace with post
				$param = str_replace(":[".$paramName."]",validateSqlParam($paramName,true),$param);
			}
		}

		//-- parse mandatory params [paramname]
		if(preg_match_all('/!\[(.*?)\]/',$param,$match))
		{
			//-- have array of matches now replace
			$match = $match[1];
			foreach ($match as $pos => $paramName)
			{
				//-- replace with post
				$param = str_replace("![".$paramName."]",validateSqlParam($paramName,false),$param);

			}
		}

		//Return
		return $param;

	}

	//-- Do table update by calling updateRecord
	function createTableUpdateFromParamsXMLMC($tableName,$keyValue, $db="swdata", $sPrefix = "_swc_")
	{
		$tableName = strToLower($tableName);

		global $dbs;
		$dbs->loadTable($tableName,$db);

		$arrData = array();
		foreach($_POST as $colName => $colValue)
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));

				//-- check if $colName exists in schema
				$ddCol = $dbs->tables[$tableName]->namedcolumns[$colName];
				if($ddCol)
				{
					//-- if oracle use upper setting
					if($session->oracleInUse)$colName = strToUpper($colName);

					$arrData[$colName] = $colValue;
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}

		//-- prepare key
		$keyCol = dd_primarykey($tableName, $db);
		$keyValue = PrepareForSql($keyValue);

		// -- Build the updateRecord statement
		$strTableName = UC($tableName);
		$arrData[$keyCol] = $keyValue;

		// -- Call xmlmc_updateRecord and return the result of the call
		$arc = xmlmc_updateRecord($strTableName,$arrData);
		return $arc;
	}

	// -- Return the updateRecord data (this function is used instead of createTableInsertFromParams in helpers.php)
	function createTableInsertFromParamsXMLMC($tableName, $db = "swdata",$sPrefix = "_swc_")
	{
		$tableName = strToLower($tableName);

		global $dbs;
		$dbs->loadTable($tableName,$db);

		$strCols = array();
		$strValues = array();
		$arrData = array();
		foreach($_POST as $colName => $colValue)
		{
			//-- check for prefix that ids a column
			$pos = strpos($colName, $sPrefix);
			if($pos!==false && $pos===0)
			{
				//-- remove prefix
				$colName = LC(str_replace($sPrefix,"",$colName));

				//-- check if $colName exists in schema
				$ddCol = $dbs->tables[$tableName]->namedcolumns[$colName];
				if($ddCol)
				{
					if ($ddCol->IsNumeric() && 'x' == strtolower(substr($colName,-1)) ){
						$colValue = fix_epoch($colValue);
					}


					//-- if oracle use upper setting
					if($session->oracleInUse)$colName = strToUpper($colName);

					$arrData[UC($colName)] = $colValue;

					//###$strValues[] = $colValue;
					//###$strCols[] = UC($colName);
				}
				else
				{
					//-- exit
					echo generateCustomErrorString("-101","Invalid column name detected [".$colName."]. Please contact your Administrator.");
					exit(0);
				}
			}
		}
		$strTableName = strToUpper($tableName);
		// -- Create mapping of columns with values
		/*###
		if(count($strCols)>0)
		{
			for($i=0;$i<count($strCols);$i++)
			{
				$strColumn = $strCols[$i];
				$strValue = $strValues[$i];
				$arrData[$strColumn] = $strValue;
			}
		}
		*/
		// -- Return result of xmlmc_addRecord
		$arc = xmlmc_addRecord($strTableName,$arrData);
		return $arc;
	}

	// -- function copyrecordXMLMC. This function uses xmlmc_addRecord to do an insert. This function is used instead of copyRecord in helpers.php.
	function copyRecordXMLMC($strTable, $copyFromColumn,$copyFromKeyValue,$copyToKeyValue, $boolReturnFalseOnError = true)
	{
		//-- select record to copy
		$strPrimaryKey = getTablePrimaryKeyName($strTable);
		if($strPrimaryKey=="")
		{
			throwError(-200,"Failed to get primary key column for [".$strTable."]. Please contact your administrator."); //-- fail and exit
		}

		//-- if primary key is same as from from col then we will need to set it
		if($copyFromColumn==$strPrimaryKey)$strPrimaryKey="";

		$strSelect = "select * from " . $strTable . " where " . $copyFromColumn . " = " . encapsulate($strTable,$copyFromColumn,$copyFromKeyValue);
		$oRS = new SqlQuery();
		if(!$oRS->Query($strSelect))
		{
			throwError(-200,"Failed to select record for copy on [".$strTable."]. Please contact your administrator."); //-- fail and exit
		}

		while($oRS->Fetch())
		{
			$strCols = array();
			$strValues = array();
			while (list($colName,$colValue) = each($oRS->row))
			{
				if ($colName != $strPrimaryKey)
				{
					if (strToUpper($colName) == strToUpper($copyFromColumn))$colValue = $copyToKeyValue;

					$strCols[] = strToUpper($colName);
					$strValues[] = $colValue;
				}
			}

			// -- Build data for addRecord
			$strTableName = strToUpper($strTable);
			for($i=0;$i<count($strCols);$i++)
			{
				$strColumn = $strCols[$i];
				$strValue = $strValues[$i];
				$arrData[$strColumn] = $strValue;
			}
			$arcUpdateRec = xmlmc_addRecord($strTableName,$arrData);
			if(1!=$arcUpdateRec)
			{
				if($boolReturnFalseOnError) return false;
			}
		}
		return true;
	}

	function wssGetUserid ($instanceid, $custid) {
		$strSQL = "	SELECT value
								FROM websession_config
								WHERE instanceid = '".PrepareForSQL($instanceid)."'
								AND name ='ac_id'";
		$aRS = get_recordset($strSQL, 'sw_systemdb');
		if ($aRS->Fetch()) {
			$strAuthIDFld = get_field($aRS,"value");
		} else {
			return "";
		}

		//Get Keysearch from Userdb for session customer
		$strSQL = "	SELECT keysearch
								FROM userdb
								WHERE ".$strAuthIDFld." = '".PrepareForSQL($custid)."'";
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
			$strCustId = get_field($aRS,'keysearch');
			return $strCustId;
		} else {
			return "";
		}
	}

	function wssGetManagerid ($custid) {
		//Get manager ID from Userdb for session customer
		$strSQL = "	SELECT fk_manager
								FROM userdb
								WHERE keysearch = '".PrepareForSQL($custid)."'";
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
			$strManagerId = get_field($aRS,'fk_manager');
			return $strManagerId;
		}
		return "";
	}

	function wssRequestAccess ($instanceid, $custid, $wsscustid, $callref, $webflag) {

		if(!_validate_url_param($instanceid,"sqlparamstrict")){
			return "Failed to validate Instance ID. SQL injection detected. Please contact your Administrator.";
		}

		$strAuthIDFld = "keysearch";
		if($custid != $wsscustid) {
			$strSQL = "SELECT value FROM websession_config WHERE instanceid = '".PrepareForSQL($instanceid)."' AND name ='ac_id'";
			$aRS = get_recordset($strSQL, 'sw_systemdb');
			if ($aRS->Fetch()) {
				$strAuthIDFld = get_field($aRS,"value");
			} else {
				return "Failed to retrieve Web Session Configuration. Please contact your Administrator.";
			}
			//If auth field is keysearch, and session cust ID doesn't match passed-through cust ID,
			//Then customer is attempting to view requests that are not their own - end fail.
			if($strAuthIDFld == 'keysearch') {
				return "Requested Customer ID does not match Session Customer ID. Please contact your Administrator.";
			}
		}

		//Get basic call info for webflag processing
		$strSQL = "SELECT cust_id, fk_company_id, site FROM opencall WHERE callref = ".$callref;
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
			$strCallCustId = get_field($aRS,'cust_id');
			$strCallSite = get_field($aRS,'site');
			$strCallOrg = get_field($aRS,'fk_company_id');
		} else {
			return "Failed to retrieve Call Record details. Please contact your Administrator.";
		}

		//Get Keysearch from Userdb for session customer
		$strSQL = "SELECT keysearch, flg_manager, fk_company_id, site FROM userdb WHERE ".$strAuthIDFld." = '".PrepareForSQL($custid)."'";
		$aRS = get_recordset($strSQL, 'swdata');
		if ($aRS->Fetch()) {
			$strCustId = get_field($aRS,'keysearch');
			$strCustSite = get_field($aRS,'site');
			$strCustOrg = get_field($aRS,'fk_company_id');
			$strCustFlgManager = get_field($aRS,'flg_manager');
		} else {
			return "Failed to retrieve Customer Record details. Please contact your Administrator.".$strSQL;
		}

		//Can view calls?
		if((OPTION_CAN_VIEW_CALLS & $webflag)  > 0){
		  //Does cust_id match keysearch?
		  if ($strCustId == $strCallCustId) {
		    return "";
		  }

			//Does the call belong to the customers organisation
			if((OPTION_CAN_VIEW_ORGCALLS & $webflag)  > 0 && $strCustOrg == $strCallOrg) {
				return "";
			}

			//----- Now process the more SQL heavy checks if the call wasn't logged
			//----- against the session customer, or the main organisation

			//Is the Manager of the request customer?
			if($strCustFlgManager > 0) {
				$strSQL = "SELECT fk_manager FROM userdb WHERE keysearch = '".PrepareForSQL($strCallCustId)."'";
				$aRS = get_recordset($strSQL, 'swdata');
				if ($aRS->Fetch()) {
					$strCallManager = get_field($aRS,'fk_manager');
					if(strtolower($strCallManager) == strtolower($strCustId)){
						return "";
					}
				}
			}

		  //Does the call belong to one of the customers sites?
		  if((OPTION_CAN_VIEW_SITECALLS & $webflag) > 0) {
		    $strSQL = "SELECT fk_site_name FROM userdb_site WHERE fk_keysearch = '".PrepareForSQL($strCustId)."' AND fk_site_name = '".PrepareForSQL($strCallSite)."'";
		    $aRS = get_recordset($strSQL, 'swdata');
		    if ($aRS->Fetch()) {
		      $strAssocSite = get_field($aRS,'fk_site_name');
		      if($strAssocSite != ""){
		        return "";
		      }
		    }
		  }

		  //Does the call belong to one of the customers related organisations?
		  if((OPTION_CAN_VIEW_MULTI_ORGCALLS & $webflag) > 0) {
		    $strSQL = "SELECT fk_org_id FROM userdb_company WHERE fk_user_id = '".PrepareForSQL($strCustId)."' AND fk_org_id = '".PrepareForSQL($strCallOrg)."'";
		    $aRS = get_recordset($strSQL, 'swdata');
		    if ($aRS->Fetch()) {
		      $strAssocOrg = get_field($aRS,'fk_org_id');
		      if($strAssocOrg != ""){
		        return "";
		      }
		    }
		  }
		}
		return "You do not have access to the specified request details. Please contact your Administrator.";
	}

	function wssProcessTableJoins ($strTables) {
		$strTableJoins = "";
		if($strTables != ""){
			$arrTables = explode("||", $strTables);
			foreach ($arrTables as $key => $arrTable) {
				$arrJoinDetails = explode("|", $arrTable);
				$strJoinTable = $arrJoinDetails[0];
				$strJoinCol =  $arrJoinDetails[1];
				$strMainTable = $arrJoinDetails[2];
				$strMainCol =  $arrJoinDetails[3];
				$strJoinType =  $arrJoinDetails[4];
				$strTableJoins .= " ".$strJoinType. " JOIN ".$strJoinTable." ON ".$strJoinTable.".".$strJoinCol." = ".$strMainTable.".".$strMainCol." ";
			}
		}
		return $strTableJoins;
	}

	function wssProcessDynamicFilter ($strCols, $strFilter) {
		$strDynamicFilter = "";
		if($strCols != "" && $strFilter != ""){
			$arrCols = explode("|", $strCols);
			foreach ($arrCols as $key => $col) {
				if($strDynamicFilter != "") $strDynamicFilter .= " OR ";
				$strDynamicFilter .= $col. " LIKE '%".PrepareForSql($strFilter)."%' ";
			}
			if($strDynamicFilter != "") $strDynamicFilter = " AND (".$strDynamicFilter.") ";
		}
		return $strDynamicFilter;
	}
?>
