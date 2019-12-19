<?php 

	//-- global.js oCMDB.prototype.check_activity_schedule - select callrefs from passed in ci ids

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_CI_AUTO_ID,CALLREF FROM CMN_REL_OPENCALL_CI JOIN OPENCALL ON OPENCALL.CALLREF=CMN_REL_OPENCALL_CI.FK_CALLREF WHERE CALLCLASS = ':[cc]' AND RELCODE=':[rc]' AND STATUS<15 AND STATUS!=6 AND CALLREF!=![cr:numeric] AND FK_CI_AUTO_ID IN (![cids:array])";

?>