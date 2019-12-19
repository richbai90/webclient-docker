<?php
	//--
	//-- return call info (used in global.GetProblemProfileDescription)
	$sqlDatabase = "swdata";
	$sqlCommand  = "select  pcdesc.info as codedesc, pcinfo.info as codetext from pcdesc,pcinfo where pcdesc.code = '" . PrepareForSql($_POST['code']) . "' and pcdesc.code = pcinfo.code";
?>