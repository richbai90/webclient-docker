<?php


	$sqlDatabase = "swdata";
	$sqlCommand = "select COUNT(*) as PRBCOUNT from ITSM_OPENCALL_PROBLEM,OPENCALL where ITSM_OPENCALL_PROBLEM.CALLREF = OPENCALL.CALLREF and (CALLCLASS = 'Problem' or CALLCLASS='Known Error') and STATUS < 16 and INC_PROFILECODE = '![probcode:sqlparamstrict]'";
?>