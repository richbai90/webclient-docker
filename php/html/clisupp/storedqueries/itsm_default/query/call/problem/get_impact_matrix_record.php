<?php



	$sqlDatabase = "swdata";
	$sqlCommand =  "select * from ITSM_IMPACT_MATRIX where ![users:num] >= INTLOWERLIMIT and INTUPPERLIMIT>![users:num]";
?>