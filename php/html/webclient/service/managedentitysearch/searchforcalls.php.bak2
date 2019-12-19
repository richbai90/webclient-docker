<?php


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/managedentitysearch/searchforcalls.php","START","SERVI");
	}	

	//-- check for custom view
	$strFileName = $portal->fs_application_path . "_customisation/xml/globalparams/Global Parameters.xml";
	if(!file_exists($strFileName))
	{
		//-- get contents and generate workspace view
		$strFileName = $portal->fs_application_path . "xml/globalparams/Global Parameters.xml";
	}

	$xmlfp = file_get_contents($strFileName);
	if(!$xmlfp)
	{
		echo "Error : Could not load call search datatable xml from global parameters. Please contact your administrator."; 
		exit;
	}

	$xmlDoc = domxml_open_mem($xmlfp);	
	if($xmlDoc)
	{
		$xmlSFC = swxml_view($xmlDoc,$_POST['mesid']);
		$xmlTable = swxml_sfc_table($xmlSFC,$_POST['mesid']);

		//-- dsn, table and cols
		$strDSN="swdata";
		$strTable = "opencall";	
		$strSearchColumns = swxml_gparams_value($xmlSFC,"SearchColumns");
		$strSelectColumns = swxml_gparams_value($xmlSFC,"ResultColumns");

		//-- get keycolumn
		$strKeyCol = "callref";

		//-- get fixed filter
		$strFixedFilter = swxml_gparams_value($xmlSFC,"filter");
		//-- 12.12.12 - nwj - 90128 - parse $strSQL for currentdd,analystId, groupId, startofday etc
		$strFixedFilter = parseStandardDatabaseSearchFilters($strFixedFilter); //-- session.php function


		//-- construct base sql
		$strSQL = "SELECT !!mssqltop!! ".$strKeyCol." as tpk, ". $strSelectColumns ." FROM " . $strTable . " ";
		if($strFixedFilter!="") $strSQL .= " WHERE " . $strFixedFilter;

		//-- check for passed in search parameters
		$sqlANDORoperator = $_POST['sqloperator'];
		if($sqlANDORoperator=="")$sqlANDORoperator = "OR";
		

		//--
		//-- get customisable search param values
		$strParamFilter = "";
		$arrSearchCols = explode(",",$strSearchColumns);
		foreach ($arrSearchCols as $strCol)
		{
			$strBinding = trim($strTable).".".trim($strCol);
			$varType = trim($strTable).".".trim($strCol);

			$strOp= @$_POST["_op_".$varType];
			$varValue = @$_POST[$strBinding];
			if($varValue!="")
			{	
				//-- prepare value?
				if($strOp!="in")
				{
					//-- strings
					$strBinding = db_case($strBinding);
					$varValue = db_case("'" . db_pfs($varValue . "%",$portal->databasetype) . "'");
					$strOperand = " LIKE ";
				}
				else
				{
					//-- used for things like call status
					$strOperand = " in ";
					$varValue = "(".$varValue.")";
				}

				if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
				$strParamFilter .= $strBinding . $strOperand . $varValue;
			}
		}


		if($_POST["_callrefonly"]=="-1")
		{
			$xmlSQLParams = $xmlTable->get_elements_by_tagname("sqlparams");
			$xmlSQLParams = $xmlSQLParams[0]->child_nodes();
			foreach ($xmlSQLParams as $aParam)
			{
				if($aParam->tagname=="")continue;
				if(!method_exists ($aParam,"get_attribute"))continue;

				//-- check if a daterange
				$intDateRange = $aParam->get_attribute('daterange');
				if($intDateRange=="1")
				{
					$varFirstValue = @$_POST[$strTable.".".$aParam->tagname."___1"];
					$varSecondValue = @$_POST[$strTable.".".$aParam->tagname."___2"];

					//-- just do greater than 
					if($varFirstValue!="" && $varSecondValue=="")
					{
						if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
						$strParamFilter .= $aParam->tagname . ">=" . $varFirstValue;
					}
					else if($varSecondValue!=""  && $varFirstValue=="")
					{
						if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
						$strParamFilter .= $aParam->tagname . "<=" . $varSecondValue;
					}
					else if($varSecondValue!=""  && $varFirstValue!="")
					{
						//--do in between
						if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
						$strParamFilter .= "(" . $aParam->tagname . ">=" . $varFirstValue ." and " . $aParam->tagname . "<=" . $varSecondValue .")";
					}
				}
				else
				{
					//-- get parameter value - if blank ignore
					$varValue = @$_POST[$strTable.".".$aParam->tagname];
					if($varValue!="")
					{	
						$strParamCol = $aParam->tagname;

						//-- prepare value?
						$strPFS = $aParam->get_attribute('pfs');
						if($strPFS=="1")
						{
							//--strings
							$strParamCol = db_case($strParamCol);
							$varValue = db_case("'" . db_pfs($varValue . "%",$portal->databasetype) . "'");
							$strOperand = " LIKE ";
						}
						else
						{
							//-- used for things like call status
							$strIN = $aParam->get_attribute('in');
							if($strIN=="1")
							{
								$strOperand = " in ";
								$varValue = "(".$varValue.")";
							}
							else
							{
								$strOperand = " = ";
							}
						}
						if($strParamFilter!="")$strParamFilter.= " ". $sqlANDORoperator ." ";
						$strParamFilter .=  $strParamCol . $strOperand . $varValue;
					}
				}
			}//foreach ($xmlSQLParams as $aParam)
		}//	if($_POST["_callrefonly"]=="-1")

		//-- add param filter to sql
		if($strParamFilter!="")
		{
			$strAND = ($strFixedFilter!="")?" AND ":" WHERE ";
			$strSQL .= $strAND. " (".$strParamFilter.")";
		}
		$strSQL .= " !!orarownum!! ";

		//-- data ordering info
		$strOrderBy = $_POST["orderby"];
		$strOrderDir = $_POST["orderdir"];
		$strApplyOrder = "";
		if($strOrderBy!="" && $strOrderBy!="null")
		{
			if($strOrderDir == "") $strOrderDir="DESC";
			$strSQL .= " order by " . $strOrderBy . " " .$strOrderDir;
		}

		//-- check for rowlimit
		$intRowLimit = $_POST['sqlrowlimit'];
		if($intRowLimit=="")$intRowLimit=100;
		$strSQL = add_db_rowlimit_to_sql($strSQL,$intRowLimit,$portal->databasetype);

		//-- run sql to get data
		$strDataOut = "";
		$result = new swphpDatabaseQuery($strSQL,$strDSN);

		if($result)
		{
			//-- execute and output table html - this is faster than sending xml to client and then processing xml into table.
			while ($row = $result->fetch()) 
			{ 
				$strDataRow = "";
				foreach($row as $fieldName => $fieldValue)
				{
					if(strToLower($fieldName)=="tpk")continue;
					if(strpos($fieldName,"@")===0)continue;

					$formattedValue = $fieldValue; //datatable_conversion($fieldValue, $strTable.".".$fieldNamen);
					$strDataRow .= "<td noWrap><div>" . $formattedValue . "</div></td>";
				}
				//-- row seperator / new line
				$strDataOut .= "<tr keytable='".$strTable."' keycolumn='".$strKeyCol."' keyvalue='".base64_encode($row->tpk)."' onclick='app.mes_datarow_selected(this);' ondblclick='app.mes_datarow_dblclick(this);'>" . $strDataRow . "</tr>";
			}
			echo $strDataOut;

			close_dbs();
		}
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/managedentitysearch/searchforcalls.php","END","SERVI");
	}	

?>