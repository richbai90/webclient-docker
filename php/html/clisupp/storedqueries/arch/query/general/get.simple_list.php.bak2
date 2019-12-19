<?php

	//-- used to get simple list values
	$list_id = $_POST['id'];
	$where = $_POST['where'];
	if(!isset($_POST['id']))
	{
		//--Exit 
		throwSuccess();
	}
	if(!isset($_POST['where']))
	{
		$where= "LIST_ID = '".pfs($list_id)."'";
	}else
	{
		$where= "LIST_ID = '".pfs($list_id)."' and VALUE like '".pfs($where)."%'";
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SWLISTS WHERE ".$where;
?>