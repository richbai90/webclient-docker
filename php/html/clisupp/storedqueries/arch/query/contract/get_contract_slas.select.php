<?php

	//-- global.js get_contract_slas

	$sqlDatabase = "swdata";
	$sqlCommand= "SELECT FK_CHILD_ITEMTEXT FROM CONFIG_RELI WHERE FK_PARENT_ITEMTEXT = '![pit]' AND FK_PARENT_TYPE='ME->CONTRACT' AND FK_CHILD_TYPE = 'ME->SLA'";

?>