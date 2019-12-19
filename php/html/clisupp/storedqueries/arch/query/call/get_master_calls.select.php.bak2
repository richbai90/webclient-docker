<?php

	//-- global.js fglobal.prototype.get_master_calls

	$boolActive = parseBool($_POST['ba']);
	$strCode = pfs($_POST['rc']);
	$strCallrefs = pfs($_POST['crs']) ;

	if($strCode=="" || $strCallrefs =="")
	{
		throwError(-100,"Missing expected parameter.");
		exit;
	}

	$strTable = ($boolActive)?"CMN_REL_OPENCALL_OC, OPENCALL":"CMN_REL_OPENCALL_OC";
	$strSQL = "select FK_CALLREF_M from " . $strTable . " where FK_CALLREF_S in (" . pfs($_POST['crs']) . ") ";
	if($strCode != "") $strSQL = $strSQL . " and RELCODE = '" .$strCode . "'";
	if($boolActive)	$strSQL = $strSQL . " and FK_CALLREF_M = OPENCALL.CALLREF and OPENCALL.STATUS < 15";

	$sqlDatabase = "swdata";
	$sqlCommand = $strSQL;


?>