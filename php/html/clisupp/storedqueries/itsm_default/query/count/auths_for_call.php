<?php

	$sqlDatabase = "swdata";
    $sqlCommand =  "select COUNT(*) as cnt from BPM_OC_AUTH where FK_CALLREF = ![cr:num] and FK_STAGE_ID = ![sid:num]";
?>