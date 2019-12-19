<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['cis']))$_POST['cis'] = "-1";

	$sqlDatabase = "swdata";
	$sqlCommand =  "select FK_CHILD_ID from CONFIG_RELI where (FK_CHILD_TYPE not like 'ME->%' OR FK_CHILD_TYPE like 'ME->SERVICE') and FK_PARENT_ID in (![cis:array])";
?>