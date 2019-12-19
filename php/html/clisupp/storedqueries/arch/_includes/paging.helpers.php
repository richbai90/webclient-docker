<?php
//-- Used to Build Paging Functions with DB Type Specific Querys

function get_service_requests($ci)
{
	$callids = '';
	$strSQL = "SELECT CALLREF FROM OPENCALL WHERE CALLCLASS = 'Service Request' and ITSM_FK_SERVICE=".$ci."";
	$oRS = get_recordset($strSQL,"swdata");
	while($oRS->Fetch())
	{
		if($callids!="")$callids.=",";
		$callids .= get_field($oRS,"CALLREF");
	}
	return $callids;
}
function get_requests($ci)
{
	$callids = '';
	$strSQL = "SELECT FK_CALLREF FROM CMN_REL_OPENCALL_CI WHERE FK_CI_AUTO_ID =".$ci."";
	$oRS = get_recordset($strSQL,"swdata");
	while($oRS->Fetch())
	{
		if($callids!="")$callids.=",";
		$callids .= get_field($oRS,"FK_CALLREF");
	}
	return $callids;

}
//-- Paging Query
function sql_page($strWhere, $intPage, $strSelect, $strTable, $strOrderBy, $intPageValue = -1)
{
	global $session, $dbs, $_core;

	if ($intPageValue === -1) {
	//Get Paging Number From System Settings
	$strSQL = "select SETTING_VALUE from SW_SBS_SETTINGS where SETTING_NAME = 'SYS.SQL.Paging' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";
	$oRS = get_recordset($strSQL);
	//-- Include App Specific Helpers File
	IncludeApplicationPhpFileOnce("app.helpers.php");
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
		$intPageValue = get_field($oRS,"setting_value");
		if($_POST['webclient']=="True") $intPageValue = 100;
	}
	}

	//-- Oracle Specific
	if($session->oracleInUse)
	{
		if($strWhere)
		{
			$strWhere = " where ".$strWhere;
		}
		// select from ( select a.*, rownum rnum from () a where rownum <= MAX_ROWS) where rnum >= MIN_ROWS);
		$strPagedQuery = $strSelect . $strTable . $strWhere . $strOrderBy . " limit " . $intStart . "," . $intPageValue;
		return $strPagedQuery;
	}
	// MS SQL Specific
	else if($session->msSqlInUse)
	{	
		if ($strWhere){
			$strWhere = " where ".$strWhere;
		}
		//--Query
		if ($intPage == 1){
		    $Start = 1;
			$end = $intPageValue + ($intPage-1);
		}
		else{
		    $Start = (($intPageValue*($intPage-1))+(1));
			$end = ($intPageValue*$intPage);
		}

		if ($session->selfServiceCustomerId!="")
		{
			//-- build query slightly differntly if called from wss.
			//-- You must pass through table parameter when using paging in WSS
			if(!$strOrderBy)
			{
				$pk = dd_primarykey($_POST['table'],"swdata");
				$strOrderBy = "ORDER BY " . $_POST['table'] . "." . $pk;
				
			}
			
			if (!$_POST['PartitionedList'])
			{
				$strPagedQuery = "select * from (" . $strSelect . ", ROW_NUMBER() OVER (" . $strOrderBy . ") as RowNum " . $strTable . $strWhere . ") as atable where atable.RowNum BETWEEN (".$Start.") and (".$end.")";
			}
			else
			{
				//-- If paging a list of services
				$strPagedQuery = "SELECT * FROM (SELECT *, ROW_NUMBER() OVER (" . $strOrderBy . ") AS rowNum FROM " . $strSelect . $strTable . $strWhere . ") AS orderedTbl WHERE orderedTbl.rowNum BETWEEN (".$Start.") AND (".$end.")";
			}
		}
		else{
			$columns = $_POST['columns'];
			//echo $columns;
			if(!$_POST['orderby']){
				$dbs->loadTable($_POST['table'],"swdata");
				$_POST['orderby'] = dd_primarykey($_POST['table'],"swdata");
			}
			
			$pk = dd_primarykey($_POST['table'],"swdata");
			$strPagedQuery = "SELECT ".$columns." FROM ".$_POST['table'].",(select row_number() over (order by ".$_POST['orderby'].") as rownum, ".$pk." as temp".$pk." FROM [".$_POST['table']."] ".$strWhere.") as temp where temp.temp".$pk." = ".$_POST['table'].".".$pk." and temp.rownum BETWEEN (".$Start.") and (".$end.")" . $strOrderBy;
		}
		
	return $strPagedQuery;
	}
	//SW SQL Specific
	else
	{
		//--Caculate Page Values
		if($intPage == 1)
		{
			$intStart = 0;
		}else
		{
			$intStart = ($intPageValue*($intPage-1));
		}
		//--Set Where
		if($strWhere)
		{
			$strWhere = " where ".$strWhere;
		}
		$strPagedQuery = $strSelect . $strTable . $strWhere . $strOrderBy . " limit " . $intStart . "," . $intPageValue;
		return $strPagedQuery;
	}

}
//--Function for Join
function sql_page_join($strWhere, $intPage, $strSelect, $strTable, $strOrderBy, $strJoin)
{
	global $session, $dbs, $_core;
	
	//Get Paging Number From System Settings
	$strSQL = "select SETTING_VALUE from SW_SBS_SETTINGS where SETTING_NAME = 'SYS.SQL.Paging' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";
	$oRS = get_recordset($strSQL);
	//-- Include App Specific Helpers File
	IncludeApplicationPhpFileOnce("app.helpers.php");
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
		$intPageValue = get_field($oRS,"setting_value");
		if($_POST['webclient']=="True") $intPageValue = 100;
	}
		
	//-- Oracle Specific
	if($session->oracleInUse)
	{
		if($strWhere)
		{
			$strWhere = "where ".$strWhere;
		}
		// select from ( select a.*, rownum rnum from () a where rownum <= MAX_ROWS) where rnum >= MIN_ROWS);
		//$strPagedQuery = $strSelect . $strTable . $strWhere . $strOrderBy . " limit " . $intStart . "," . $intPageValue;
		return $strPagedQuery;
	}
	// MS SQL Specific
	elseif($session->msSqlInUse)
	{
		//--Query
		if($intPage == 1)
		{
			$Start = 1;
			$end = $intPageValue + ($intPage-1);
		}else
		{
			$Start = (($intPageValue*($intPage-1))+(1));
			$end = ($intPageValue*$intPage);
		}
		$columns = $_POST['columns'];
		if(!$_POST['orderby'])
		{
			
			$dbs->loadTable($_POST['table'],"swdata");
			$_POST['orderby'] = dd_primarykey($_POST['table'],"swdata");
		}
		$pk = dd_primarykey($_POST['table'],"swdata");
		$strPagedQuery = "SELECT ".$columns." FROM ".$_POST['table'].",(select row_number() over (order by ".$_POST['table'].".".$_POST['orderby'].") as rownum, ".$_POST['table'].".".$pk." as temp".$pk." FROM [".$_POST['table']."] ".$strJoin." ".$strWhere.") as temp where temp.temp".$pk." = ".$_POST['table'].".".$pk." and temp.rownum BETWEEN (".$Start.") and (".$end.")";
		return $strPagedQuery;
	}
	//SW SQL Specific
	else
	{
		//Caculate Page Values
		if($intPage == 1)
		{
			$intStart = 0;
		}else
		{
			$intStart = ($intPageValue*($intPage-1));
		}
		$strPagedQuery = $strSelect . $strTable . $strJoin . $strWhere . $strOrderBy . " limit " . $intStart . "," . $intPageValue;
		return $strPagedQuery;
	}

}
//Select Columns List For Join so must be TableName.ColumnName
function swfc_selectcolumns_join()
{
	global $swfc_picklist;
	$columns = $_POST['columns'];
	$table = $_POST['table'];

	if(_validate_url_param($columns,"sqlselectcolumns"))
	{
		$arrColumns = explode(",", $columns);
		$columns = "";
		for ($i = 0; $i < count($arrColumns); ++$i) {
			if(!$columns) $columns = prepareForSql($table).".".prepareForSql($arrColumns[$i]);
			else
			{
				$columns .= ", ".prepareForSql($table).".".ltrim(prepareForSql($arrColumns[$i]));
			}
		}
	

		if($swfc_picklist==1)
		{
			return "select distinct " . $columns . "";
		}
		else
		{
			return "select " . $columns . "";
		}
	}
	else
	{
		echo generateCustomErrorString("-403","Invalid form control columns specified. Please contact your Administrator.");
		exit(0);
	}
}


?>
