<?php

	$sqlDatabase = "swdata";

	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.SLA-CALL");
	if($strAppcodes!="")
	{
		$sqlCommand = "select SC_SLA.FK_SLA,SC_SLA.COST,SC_SLA.PRICE FROM SC_SLA JOIN ITSMSP_SLAD ON FK_SLA=PK_SLAD_ID WHERE ITSMSP_SLAD.APPCODE in (".$strAppcodes.") AND FK_SUBSCRIPTION = ![fks:num]";
	}
	else
	{
		$sqlCommand = "select fk_sla,cost,price from sc_sla where fk_subscription = ![fks:num]";
	}

?>