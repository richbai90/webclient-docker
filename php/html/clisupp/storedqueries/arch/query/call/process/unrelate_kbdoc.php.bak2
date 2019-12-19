<?php

	//-- global.js unrelate_kbdoc

	$strCode = pfs($_POST['rc']);

	$sqlDatabase = "swdata";
	$sqlCommand = "DELETE FROM CMN_REL_OPENCALL_KB where FK_CALLREF in(![fc:array]) and FK_KBDOC = ![fkbd:num]";
	if($strCode!= "") 	$sqlCommand .= " and RELCODE = '" . $strCode . "'";

?>