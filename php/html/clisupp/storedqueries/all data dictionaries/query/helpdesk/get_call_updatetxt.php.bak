<?php

	//-- global.js get call updatetxt

	if($_POST['cr']=="" || $_POST['uid']=="")
	{
		throwError(-100,"Missing expected parameter.");
		exit;
	}


	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";

	$sqlCommand = "select UPDATETXT from UPDATEDB where CALLREF = " . $_POST['cr'].  " and UDINDEX = " . $_POST['uid'];

?>