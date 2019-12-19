<?php

	//-- global.js get_customers_on_calls

	$sqlDatabase = "swdata";
	$sqlCommand = "select CUST_ID from OPENCALL where CALLREF in (![crs:array])";

?>