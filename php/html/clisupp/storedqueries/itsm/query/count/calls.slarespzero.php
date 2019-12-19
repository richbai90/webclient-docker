<?php

	//-- used in global.js check_sla_response_flag - get count of calls where the sla resp has not been set yet


	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT COUNT(*) AS RECCOUNT FROM OPENCALL WHERE CALLREF IN (![crs:array]) AND SLARESP = 0";

?>