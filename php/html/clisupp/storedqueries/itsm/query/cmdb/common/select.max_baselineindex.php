<?php

	//--
	//-- get max baseline index for a given baselineid
	$sqlDatabase = "swdata";
	$sqlCommand =  "select max(CK_BASELINEINDEX) from CONFIG_ITEMI where BASELINEID = ![intBLNid:numeric]";
?>