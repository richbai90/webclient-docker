<?php
	//-- delete child me ci to parent ci i.e. sites at company - - used in global.js cmdb.delete_child_meconfigrelation function
	$strTable = "CONFIG_RELI";
	$strWhere = "FK_CHILD_ID IN (![childkeys:array]) AND FK_PARENT_TYPE = '![parenttype]'";

	// -- Build an array of columns to set for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$arc = xmlmc_deleteRecord_where($strTable,$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);

?>