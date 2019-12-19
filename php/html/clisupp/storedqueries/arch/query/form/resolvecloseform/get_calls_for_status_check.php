<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT callref, status, callclass, fixcode, flg_firsttimefix FROM opencall WHERE callref IN(". $inCallrefs .")";
?>