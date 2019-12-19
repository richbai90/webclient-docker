<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement
	if(!HaveRight(ANALYST_RIGHT_C_GROUP,ANALYST_RIGHT_C_CANMANAGESLAS))
	{
		throwError("You do not have permission to manage SLAs.");
		exit;
	}
	//-- if no value then we are clearing list
	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());
	
	$keyValues = $_POST['ac'];

	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.".$keyValues);
	$strAppcodeWhere = "";
	if($strAppcodes!="")
	{
		$strAppcodeWhere = " where appcode in (".$strAppcodes.")";
	}
	
	if (isset($_POST['af']) && $_POST['af']!="")
	{
		$strArchiveFilter = $_POST['af'];
		if($strAppcodeWhere=="")
		{
			$strFilter = " where (archive = 0 OR archive = " . $strArchiveFilter . " OR archive is null)";
		}
		else
		{
			$strFilter = $strAppcodeWhere . " and (archive = 0 OR archive = " . $strArchiveFilter . " OR archive is null)";
		}
	}else
	{
		if($strAppcodeWhere !="")
		{
			$strFilter = $strAppcodeWhere;
		}
	}
	

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $strFilter . swfc_orderby();
?>