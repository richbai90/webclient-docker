<?php

	//-- global.js filter_company_contracts

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT PK_CONTRACT_ID,TITLE FROM CONTRACT WHERE FK_COMPANY_ID = '![fcid]'";
	if($_POST['pcid']!="")
	{
		$sqlCommand .= " and PK_CONTRACT_ID IN (![pcid:sarray])";
	}

?>