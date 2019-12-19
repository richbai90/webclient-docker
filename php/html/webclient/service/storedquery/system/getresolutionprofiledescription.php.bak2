<?php
	//--
	//-- return call info (used in global.GetResolutionProfileDescription)
	$sqlDatabase = "swdata";
	$sqlCommand  = "select rcdesc.code, rcdesc.info as codedesc, rcinfo.info as codetext from rcdesc,rcinfo where rcdesc.code = '" . PrepareForSql($_POST['code']) . "' and rcdesc.code = rcinfo.code";
?>