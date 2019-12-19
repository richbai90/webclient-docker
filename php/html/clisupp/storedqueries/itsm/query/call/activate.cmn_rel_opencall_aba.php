<?php

	//-- activate opencall aba by callref and bus area id - used in global.js - add_affected_bus_area_to_call

	$sqlDatabase = "swdata";
	$sqlCommand = "UPDATE CMN_REL_OPENCALL_ABA set STATUS = 'Active' where FK_CALLREF = ![cr:numeric] and FK_BUS_AREA_ID = '![abaid]'";

?>