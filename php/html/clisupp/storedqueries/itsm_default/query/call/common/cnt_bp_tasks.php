<?php

	$sqlDatabase = "swdata";
    $sqlCommand =  "select COUNT(*) as cnt from OPENCALL where BPM_PARENTCALLREF = ![cr:numeric] and bpm_stage_id = ![sid:numeric] and callclass='B.P Task'";
?>