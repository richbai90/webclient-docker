<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());

	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.SLA-CALL");

	if($strAppcodes!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " appcode in (".$strAppcodes.") and " . $parsedFilter;
		else
			$parsedFilter = " appcode in (".$strAppcodes.") " . $parsedFilter;
	}

	//-- if we have a filter then and the where
	if($parsedFilter!="") 
		$parsedFilter = " where (type <> 'Third Party') and PK_SLAD_ID IN (" . prepareNumericCommaDelimitedValues($_POST['kvs']).") and ".$parsedFilter;
	else
		$parsedFilter = " where (type <> 'Third Party') and PK_SLAD_ID IN (" . prepareNumericCommaDelimitedValues($_POST['kvs']).")";

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from itsmsp_slad ".$parsedFilter. swfc_orderby();
?>