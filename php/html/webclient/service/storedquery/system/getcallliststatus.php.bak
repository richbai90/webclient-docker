<?php
	//--
	//-- return list of call status's used by app.js _resolveclosecallform function
	$sqlDatabase = swfc_source();
	$sqlCommand  = "select status from opencall where callref in (" . prepareForSql($_POST['callrefs']) . ")";
?>