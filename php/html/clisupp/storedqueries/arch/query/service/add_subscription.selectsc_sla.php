<?php

	//-- used in global.js service.add_subscription

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SC_SLA WHERE FK_SERVICE=![fks:numeric] AND FK_SUBSCRIPTION='' AND FK_SLA IN (![fkslas:array])";
?>