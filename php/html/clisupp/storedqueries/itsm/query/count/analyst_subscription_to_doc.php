<?php

	$sqlDatabase = "swdata";
	$sqlCommand = "Select count(*) as cnt from SWKB_SUBSCRIPTION where SUBSCRIBERID = '". PrepareForSql($session->analyst->AnalystID) ."' AND SUBSCRIBERTYPE = 'ANALYST' AND FK_DOCREF = '![doc]'";
?>