<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());

	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.BPM");

	if($strAppcodes!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " appcode in (".$strAppcodes.") and " . $parsedFilter;
		else
			$parsedFilter = " appcode in (".$strAppcodes.") " . $parsedFilter;
	}

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from bpm_workflow ".$parsedFilter. swfc_orderby();
?>