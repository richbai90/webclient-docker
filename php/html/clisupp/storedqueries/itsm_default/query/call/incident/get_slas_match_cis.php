<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams('itsmsp_slad');

	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.SLA-CALL");

	if($strAppcodes!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " APPCODE in (".$strAppcodes.") and " . $parsedFilter;
		else
			$parsedFilter = " APPCODE in (".$strAppcodes.") " . $parsedFilter;
	}

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where (TYPE <> 'Third Party') and " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select SLAD_ID from ITSMSP_SLAD ".$parsedFilter. swfc_orderby();
?>