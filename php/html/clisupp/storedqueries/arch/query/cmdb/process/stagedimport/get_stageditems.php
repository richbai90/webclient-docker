<?php

	//-- get staged items

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from CMDB_STAGE where CK_CONFIG_ITEM in (![stageditems:sarray])";

?>