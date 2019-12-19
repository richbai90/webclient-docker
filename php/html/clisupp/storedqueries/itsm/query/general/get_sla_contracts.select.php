<?php

	//-- global.js get_sla_contracts

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_PARENT_ITEMTEXT AS FK_CONTRACT_ID FROM CONFIG_RELI WHERE FK_PARENT_TYPE='ME->CONTRACT' AND FK_CHILD_TYPE='ME->SLA' AND FK_CHILD_ITEMTEXT='![slaid]'";

?>