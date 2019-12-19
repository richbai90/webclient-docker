<?php

	//-- get cis that we wantt o update from staged records
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(CK_CONFIG_ITEM) AS CNT FROM CONFIG_ITEMI WHERE ISACTIVEBASELINE = 'Yes' and CK_CONFIG_ITEM in (![stageditems:sarray]) and CK_CONFIG_TYPE not like 'ME->%'";
?>