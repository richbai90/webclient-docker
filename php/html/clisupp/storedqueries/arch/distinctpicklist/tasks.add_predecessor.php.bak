<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	//-- if we have a filter then and the where
	$parsedFilter = " where fk_callref =".$_POST['cr']." and fk_stage_id=".$_POST['sid'];

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable().$parsedFilter. swfc_orderby();
?>