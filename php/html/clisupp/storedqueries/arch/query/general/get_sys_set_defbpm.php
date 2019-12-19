<?php

	//-- used in global.js to get sw settings by toplevelcategory like 

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SYS_SETT_DEFBPM WHERE PK_CALLCLASS = '![pk]' and APPCODE in (" . $_core['_sessioninfo']->datasetFilterList . ")";
?>