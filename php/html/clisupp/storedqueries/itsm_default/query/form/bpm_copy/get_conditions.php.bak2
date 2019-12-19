<?php

	$parsedFilter = createPicklistFilterFromParams("bpm_cond");

	//-- if we have a filter then and the where
	if($parsedFilter!="") 
		$parsedFilter = " where " . $parsedFilter;
	else
	{
		throwProcessErrorWithMsg("No parameters specified. Please contact your Administrator.");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from bpm_cond ".$parsedFilter. swfc_orderby();
?>