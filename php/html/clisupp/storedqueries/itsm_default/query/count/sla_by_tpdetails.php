<?php

	//-- will load picklist control control using pk_auto_id in () and supprots optional passed in filter

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "select count(*) as cnt from SYSTEM_SLA where TPCOMPANY = '![supplier:sqlparamstrict]' and NAME = '![suppliername:sqlparamstrict]'";
	$sqlCommand .= swfc_orderby();
?>