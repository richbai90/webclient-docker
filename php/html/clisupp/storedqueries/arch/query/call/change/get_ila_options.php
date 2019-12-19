<?php


	$sqlDatabase = "swdata";
	$sqlCommand =  "select fk_ila_option_id from cmn_rel_opencall_ila where fk_callref = ![cr:numeric] and usage_area = 'Change Log Call Form'";
?>