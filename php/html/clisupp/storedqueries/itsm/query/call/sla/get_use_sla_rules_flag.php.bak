<?php

	$strCallClass = PrepareForSql($_POST['cc']);

	$strMatrixSQL = "SELECT flg_use_sla_rules FROM itsm_sla_default";
	$strMatrixSQL .= " WHERE callclass = '".$strCallClass."'";
	$strMatrixSQL .= " AND appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$sqlDatabase = "swdata";
	$sqlCommand = $strMatrixSQL;
?>