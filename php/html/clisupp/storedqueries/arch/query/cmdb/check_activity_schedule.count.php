<?php 

	//-- global.js oCMDB.prototype.check_activity_schedule - select count of existing activities for given day

	$strWhere = "PK_AUTO_ID!=![aaid:numeric] and ((![asdx:numeric]<ENDX and ![asdx:numeric]>STARTX) OR (![aedx:numeric]<ENDX and ![aedx:numeric]>STARTX) OR (![asdx:numeric]<STARTX AND ![aedx:numeric]>ENDX))";
	$strWhere = parseEmbeddedParameters($strWhere);
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(*) AS COUNTER FROM CI_SCHEDULE WHERE " . $strWhere;
?>