<?php

	//-- global.js popup_configitem

	$sqlDatabase = "swdata";
	$sqlCommand = "select EXTENDED_FORM, PK_CONFIG_TYPE, EXTENDED_TABLE, CK_CONFIG_ITEM, DETAIL_FORM from CONFIG_TYPEI,CONFIG_ITEMI where PK_AUTO_ID = ![cid:numeric] and CK_CONFIG_TYPE = PK_CONFIG_TYPE";

?>