<?php
	//-- used in global.js cmdb get_me_cis
	//-- return related ci key values for passed in customers
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_CI_ID FROM CONFIG_RELME WHERE FK_ME_KEY IN (![mids:sarray])";
	
?>