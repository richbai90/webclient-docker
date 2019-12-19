<?php
	//-- use override

	//--
	$sqlDatabase = "swdata";
	$sqlCommand =  "select FK_CMDB_ID from SITE where SITE_NAME in (![sites:sarray])";
?>