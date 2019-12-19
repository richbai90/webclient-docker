<?php
	$strCallrefs = $_POST['crfs'];
	$inCallrefs = prepareNumericCommaDelimitedValues($strCallrefs);
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "Select fk_contract_id, support_unit_cost, fk_company_id from opencall where callref IN (". $inCallrefs .")";
?>