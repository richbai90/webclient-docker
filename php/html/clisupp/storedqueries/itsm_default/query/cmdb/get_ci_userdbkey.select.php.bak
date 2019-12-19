<?php

	//-- used in global.js cmdb get_ci_mes
	//-- return customer key value for passed in cis - i.e. owners

	checkMandatoryParams("cids"); //-- will exit if mandatory param not found

	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_USERDB from CONFIG_ITEMI where PK_AUTO_ID in (![cids:array]) ";

?>