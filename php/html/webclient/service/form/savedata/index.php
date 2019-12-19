<?php

	//-- includes
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');

	//-- get form xml def 
	if($_POST['submitxml']=="")
	{
		//-- return error message
		exit;
	}
	
	//-- shouldnt take more than 10 seconds to do a save
	set_time_limit (10);

	function create_insert_sql($arrColumns,$strTable)
	{
		$strSQL = "insert into ". $strTable." ";
		$strCols = "";
		$strColValues = "";
		foreach ($arrColumns as $strColName => $colValue)
		{
			if($strCols != "") $strCols .= ",";
			if($strColValues != "") $strColValues .= ",";
			$strCols .= $strColName;
			$strColValues .= $colValue;
		}
		$strSQL .= "(".$strCols . ") values (".$strColValues.")";
		return $strSQL;
	}

	function create_update_sql($arrColumns,$strTable,$strKeyCol, $arrCols)
	{
		//-- handle unique system form (temp call task tables)
		if(strpos($strTable,"_calltasks")!==false)
		{
			//-- split key and vlaue
			$arrKeys = explode(":",$strKeyCol);
			$strWhere= " where taskid = " . $arrCols['taskid'] . " and parentgroup = ".$arrCols['parentgroup'];
		}
		else if($strTable=="calltasks")
		{
			//-- split key and vlaue
			$strWhere= " where taskid = " . $arrCols['taskid'] . " and callref = ".$arrCols['callref'];
		}
		else
		{
			$strWhere= " where ". $strKeyCol." = " . $arrCols[$strKeyCol];
		}

		$strSQL = "update ". $strTable." set ";
		$strCols = "";
		foreach ($arrColumns as $strColName => $colValue)
		{
			if($strCols != "") $strCols .= ",";
			$strCols .= $strColName . "=" . $colValue;
		}
		$strSQL .= $strCols . $strWhere;
		
		return $strSQL;
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/savedata/index.php","START","SERVI");
	}	


	//-- convert xml string to xml
	$xmlDOM = domxml_open_mem($_POST['submitxml']);
	$xmlRoot = $xmlDOM->document_element();
	//$strAction = $_POST['submitaction']; //-- add / edit

	$strTable = $xmlRoot->get_attribute("table");
	$strDSN = $xmlRoot->get_attribute("dsn");
	$strAction = $xmlRoot->get_attribute("action");
	$strKeyCol = $xmlRoot->get_attribute("primarycolumn");
	$bNotSwdata = ($strDSN!="swdata")?true:false;

	//-- get record nodes
	$childnodes = $xmlRoot->child_nodes();
	foreach ($childnodes as $aRecord)
	{
		if($aRecord->tagname=="")continue;

		$arrColumns = Array();

		$recordcolumns = $aRecord->child_nodes();
		foreach ($recordcolumns as $aColumn)
		{
			if($aColumn->tagname=="")continue;

			$strColumnName = $aColumn->tagname;
			$strColumnValue = $aColumn->get_content();

			if($bNotSwdata)
			{
				if($aColumn->get_attribute('pfs')=="1") 
				{
					$strColumnValue = "'" . db_pfs($strColumnValue) . "'";
				}
			}

			$arrColumns[$strColumnName] = $strColumnValue;
		}

		//-- process update or insert
		if($strAction=="edit")
		{
			if(!$bNotSwdata)
			{
				echo _xmlmc_updaterecord($strTable, $arrColumns,$oAnalyst->sessionid);
			}
			else
			{
				//-- do raw sql
				$strSQL = create_update_sql($arrColumns,$strTable,$strKeyCol, $arrColumns);
			}

		}
		else if($strAction=="add")
		{
			if(!$bNotSwdata)
			{
				echo _xmlmc_insertrecord($strTable, $arrColumns,$oAnalyst->sessionid);
			}
			else
			{
				//-- do raw sql
				$strSQL = create_insert_sql($arrColumns,$strTable);
			}
		}
		else
		{
			//-- not supported
		}

		if($bNotSwdata)
		{
			if($strSQL!="")
			{
				$bSystemDB = isSystemDB($strDSN);
				$oConn = connectdb($strDSN,$bSystemDB);
				$result_id =_execute_xmlmc_sqlquery($strSQL,$oConn);
				if(!$result_id)				
				{
					echo "<methodCallResult status='fail'><params><code>-666</code><error>savedata - sql failed. Please contact your Administrator.</error><sql>".pfx($strSQL)."</sql></params></methodCallResult>";
				}
				else
				{
					echo "<methodCallResult status='true'></methodCallResult>";
				}		
				close_dbs();
			}
		}
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/savedata/index.php","END","SERVI");
	}	

?>