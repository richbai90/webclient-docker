<?php

	$sqlDatabase = "swdata";
	$sqlCommand = "select COUNT(*) as CNT from OPENCALL,CMN_REL_OPENCALL_CI where OPENCALL.STATUS<15 and OPENCALL.STATUS!=6 and FK_CALLREF=CALLREF and (CALLCLASS='Problem' or CALLCLASS='Known Error') and FK_CI_AUTO_ID in (![ci_id:array])";

?>