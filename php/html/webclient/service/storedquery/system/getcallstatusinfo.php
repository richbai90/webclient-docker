<?php
	//--
	//-- return call info (used in global.GetCallStatusInfo)
	$sqlDatabase = swfc_source();
	$sqlCommand  = "select callref, status, callclass, priority from opencall where callref = " . prepareForSql($_POST['callref']);
?>