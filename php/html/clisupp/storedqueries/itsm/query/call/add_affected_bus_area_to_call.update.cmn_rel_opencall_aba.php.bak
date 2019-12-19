<?php

	//-- global.js  - add_affected_bus_area_to_call -  Set status (optional) and source of the ABA linked to the call
	
	$strStatus = "";
	if($_POST['ss']=='1')$strStatus = "STATUS = 'Active',";

	$strUpdateABASql = "UPDATE CMN_REL_OPENCALL_ABA SET ".$strStatus."source = 'CI'";
	$strUpdateABASql .= " WHERE FK_CALLREF = ![cr:numeric] AND FK_BUS_AREA_ID = '![abaid]'";

	$sqlDatabase = "swdata";
	$sqlCommand = $strUpdateABASql;
?>