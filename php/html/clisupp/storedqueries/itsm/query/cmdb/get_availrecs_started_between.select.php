<?php

	//-- global.js cmdb - get_availrecs_started_between

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from CI_AVAIL_HIST where FK_CI_ID = ![cid:numeric] and STARTEDONX >= ![d1x:numeric] and STARTEDONX <= ![d2x:numeric] ORDER BY ENDEDONX ASC";

?>