<?php

	//-- global.js cmdb check_bl_periodic
	
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT CI_BLACKOUT.DAY_OFFSET,NO_OF_DAYS,TYPE,BLACKOUT_NAME,TM_PERIODS.* FROM CI_BLACKOUT,TM_PERIODS WHERE TYPE = 'Periodical Time' AND TM_PERIODS.PK_AUTO_ID = CI_BLACKOUT.FK_PERIOD AND IS_INACTIVE=0 AND FK_CI_ID = ![cid:numeric]";

?>