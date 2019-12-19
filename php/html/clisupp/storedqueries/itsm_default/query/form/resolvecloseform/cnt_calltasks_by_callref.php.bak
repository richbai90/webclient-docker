<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);	
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT callref, count(*) as ct FROM calltasks WHERE status <> 16 AND callref IN(". $inCallrefs .") GROUP BY callref HAVING ct > 0";
?>