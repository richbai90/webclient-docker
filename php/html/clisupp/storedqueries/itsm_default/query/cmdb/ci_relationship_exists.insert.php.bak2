<?php
	//-- insert a new ci type relationship type - used in global.js cmdb.ci_relationship_exists function
	
	// -- Build insert query for addRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$arrTable = "CONFIG_RELTYPE";
	$arrData['PK_RELTYPE'] = '![rel]';
	$arrData['LINE_STYLE'] = 2;
	$arrData['LINE_COLOUR'] = '#000000';
	
	$arc = xmlmc_addRecord($arrTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);

?>