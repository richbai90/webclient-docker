<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement

	if(!HaveAppRight("G", 7,  $session->currentDataDictionary)) 
	{
		throwError("You do not have permission to manage Business Processes.");
		exit;
	}

	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.BPM");
	$strAppcodeWhere = "";
	if($strAppcodes!="")
	{
		$strAppcodeWhere = " where appcode in (".$strAppcodes.")";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $strAppcodeWhere .swfc_orderby();
?>