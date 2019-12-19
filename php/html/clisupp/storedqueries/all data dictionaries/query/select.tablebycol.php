<?php

	//-- select a passed in table using passed in cols as where clause
	//-- this assumes sql api will enforce table select permissions

	//--
	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
	$sqlCommand =  selectTableByCols(swfc_tablename(),$sqlDatabase);

?>