<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)

	$intParentCallref = $_POST["cr"];
	if(!_validate_url_param($intParentCallref,"num"))
	{
		echo generateCustomErrorString("-100","An invalid callref was specified. Please contact your Administrator.");
		exit(0);
	}
	$where = " where opencall.callclass='OLA Task' and bpm_parentcallref=".$intParentCallref;

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . " from opencall " . $where . swfc_orderby();


?>