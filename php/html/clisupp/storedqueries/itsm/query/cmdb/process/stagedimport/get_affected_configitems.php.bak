<?php

	//-- get cis that we wantt o update from staged records
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT CK_CONFIG_ITEM,PK_AUTO_ID, CK_CONFIG_TYPE, BASELINEID, FK_SITE, FK_COMPANY_ID, FK_SLD FROM CONFIG_ITEMI WHERE ISACTIVEBASELINE = 'Yes' and CK_CONFIG_ITEM in (![stageditems:sarray]) and CK_CONFIG_TYPE not like 'ME->%'";
?>