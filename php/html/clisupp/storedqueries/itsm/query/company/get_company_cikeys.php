<?php

	//--
	$sqlDatabase = "swdata";
	$sqlCommand =  "select FK_CMDB_ID from company where pk_company_id in (![orgs:sarray])";
?>