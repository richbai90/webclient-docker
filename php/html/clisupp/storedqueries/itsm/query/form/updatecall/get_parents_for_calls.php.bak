<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT bpm_parentcallref FROM opencall WHERE callref IN (".$inCallrefs .")";
?>