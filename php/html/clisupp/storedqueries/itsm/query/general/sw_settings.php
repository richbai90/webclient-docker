<?php

	//-- used in global.js to get all sw settings

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SW_SBS_SETTINGS WHERE APPCODE = '" . $_core['_sessioninfo']->dataset . "'";
?>