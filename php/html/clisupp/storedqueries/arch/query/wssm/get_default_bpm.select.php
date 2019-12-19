<?php
	loadSessionInfo();
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from sys_sett_defbpm where pk_callclass ='".PrepareForSql($_POST['cc'])."' and appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
?>