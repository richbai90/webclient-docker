<?php


	//-- global.js service - get_service_costing
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SC_RELS WHERE FK_SERVICE IN (![sid:array]) and APPLY_TYPE='![at]' and FLG_INCLUDE=1 and (FLG_ISOPTIONAL=1 OR FLG_ISOPTIONAL IS NULL  or FLG_ISOPTIONAL='')";
?>