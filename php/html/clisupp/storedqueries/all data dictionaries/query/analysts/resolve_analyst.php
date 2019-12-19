<?php

	//-- global.js - resolve_analyst

	checkMandatoryParams("c","v"); //-- will exit if mandatory param not found

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "select analystid from swanalysts where " . pfs($_POST["c"]) . " like '" . pfs($_POST["v"]) . "%' and class != 0 and class != 2";
?>