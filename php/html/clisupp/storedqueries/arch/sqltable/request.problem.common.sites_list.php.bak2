<?php

	$parsedFilter = createTableFilterFromParams(swfc_tablename());

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter . swfc_orderby();
?>