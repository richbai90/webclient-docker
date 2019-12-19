<?php

	//-- delete sc_rel record - used in global.js remove_component_custom

	/*$sqlDatabase = "swdata";
	$sqlCommand = "DELETE FROM SC_RELS WHERE PK_AUTO_ID in (![_kvs:array])";*/
	
	
	$strTable = "SC_RELS";
	$strKey = '![_kvs:array]';
	$arc = xmlmc_deleteRecord($strTable,$strKey);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}


?>