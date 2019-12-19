<?php

	//-- unrelate a ci from a call record - global.js cmdb_unrelate_to_call

	$strCode =  pfs($_POST['rc']);

	$sqlDatabase = "swdata";
	$sqlCommand = "DELETE FROM CMN_REL_OPENCALL_CI WHERE FK_CALLREF= ![cr:numeric] AND FK_CI_AUTO_ID = ![cid:numeric]";
	if(isset($_POST['rel']))$sqlCommand .= " AND RELCODE = '" . $strCode . "'";

?>