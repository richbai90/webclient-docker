<?php

	//-- expects posted var "callrefs" as comma seperated number
	//-- delete locks directly from database

	$sqlDatabase = "sw_systemdb";
	$sqlCommand  = "delete * from opencall_locks where callref in ".prepareForSql($_POST['callrefs']) .")";

	//-- we want to delete only those locked by session analyst id
	if($_POST['byaid']=="1")
	{
		$sqlCommand  .= " and analystid = '".prepareForSql($session->analystId) ."'";
	}

?>