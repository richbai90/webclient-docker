<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);	
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "select COUNT(*) as cnt FROM opencall where callclass = 'Release Request' and callref IN(". $inCallrefs .")";
?>