<?php


	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT count(*) AS reccount FROM opencall WHERE callref IN (![crfs:array]) AND slaresp = 0";
?>