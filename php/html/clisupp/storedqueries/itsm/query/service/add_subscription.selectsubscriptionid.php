<?php

	//-- used in global.js service.add_subscription

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT PK_ID AS INTSUBSCRIPTION FROM SC_SUBSCRIPTION WHERE REL_TYPE='SUBSCRIPTION' AND FK_ME_KEY='![fmk]' AND FK_ME_TABLE='![fmt:sqlobjectname]' AND FK_SERVICE = ![fks:numeric]";
?>