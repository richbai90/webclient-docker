<?php
	$strSelect = "SELECT setting_name, setting_value FROM sw_sbs_settings ";
	$strWhere  = "WHERE setting_name LIKE 'KNOWLEDGE.SELFSERVICE%'";
	$strWhere .= " AND appcode ='".$_core['_sessioninfo']->dataset."'";
	$strOrderBy = "ORDER BY setting_name";
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere.$strOrderBy;
?>