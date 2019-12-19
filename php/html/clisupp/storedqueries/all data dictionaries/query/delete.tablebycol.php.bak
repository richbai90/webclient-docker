<?php
	//-- delete table row by a col value
	$colValue = encapsulate($_POST['table'],$_POST['fc'],$_POST['fkv']);
	$tableName = UC(swfc_tablename());
	$selectCol = UC(pfs($_POST['fc']));
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strWhere = $selectCol . " = " . $colValue;
	$arc = xmlmc_deleteRecord_where($tableName,$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);

?>