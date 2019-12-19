<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);	
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT distinct opencall.fixcode FROM opencall WHERE callref IN(". $inCallrefs .")";
?>