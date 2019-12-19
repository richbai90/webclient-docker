<?php


	$sqlDatabase = "swdata";
	$sqlCommand = "update PCINFO set INCIDENT_COUNT = ![cnt:num] where CODE = ':[pc:sqlparamstrict]'";

?>