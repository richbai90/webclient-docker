<?php

	//-- used in app.js get basic call info - returns 
	//-- callref,callclass,suppgroup,owner,status

	checkMandatoryParams("crs"); //-- will exit if mandatory param not found

	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";

	$sqlCommand ="SELECT CALLREF,CALLCLASS,SUPPGROUP,OWNER,STATUS FROM OPENCALL WHERE CALLREF IN (" . pfs($_POST['crs']) . ")";

?>