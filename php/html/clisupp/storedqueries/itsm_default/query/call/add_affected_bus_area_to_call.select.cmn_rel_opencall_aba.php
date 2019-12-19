<?php
	//-- global.js  - add_affected_bus_area_to_call -get ABAs already associated with the call
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_BUS_AREA_ID, STATUS FROM CMN_REL_OPENCALL_ABA WHERE FK_CALLREF = ![cr:numeric]";

?>