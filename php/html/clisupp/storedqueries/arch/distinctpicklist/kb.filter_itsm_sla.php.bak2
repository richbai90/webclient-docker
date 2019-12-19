<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());

	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.SLA-KB");

	if(isset($_POST['used']) && $_POST['used']!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " pk_slad_id not in (".$_POST['used'].") and " . $parsedFilter;
		else
			$parsedFilter = " pk_slad_id not in (".$_POST['used'].") " . $parsedFilter;
	}

	if($strAppcodes!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " appcode in (".$strAppcodes.") and " . $parsedFilter;
		else
			$parsedFilter = " appcode in (".$strAppcodes.") " . $parsedFilter;
	}

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where (type <> 'Third Party') and " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from itsmsp_slad ".$parsedFilter. swfc_orderby();
	
?>