<?php

	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_PRIORITY,FK_DEFAULT_SLA,REQUEST_PRICE,SUBSCRIPTION_PRICE from SC_SUBSCRIPTION where PK_ID= ![fks:num]";
?>