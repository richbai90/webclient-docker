<?php

	$parsedFilter = createPicklistFilterFromParams("bpm_stage");

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from bpm_stage ".$parsedFilter. swfc_orderby();
?>