<?php

	$call_reference = $_POST['call_reference'];

	$sqlCommand =  "select PK_AUTO_ID, TITLE, ENDX, STARTX from CI_SCHEDULE where FK_CALLREF=".$call_reference;
	$sqlDatabase = "swdata";
?>