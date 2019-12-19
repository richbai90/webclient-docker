<?php

	//-- used in global.js to get sw settings by toplevelcategory like 

	$toplevelcategory = $_POST['tlc'];
	$primaryKey = $_POST['ps'];
	if($toplevelcategory!="")
	{
		$where = "";
		$arrKeys = explode(",",$toplevelcategory);
		while (list($pos,$keyValue) = each($arrKeys))
		{
			if($where!="") $where.=" OR ";
			$where.= "TOPLEVELCATEGORY LIKE '".pfs($keyValue)."%'";
		}
	}
	else if($primaryKey !="")
	{
		$where = "";
		$arrKeys = explode(",",$primaryKey);
		while (list($pos,$keyValue) = each($arrKeys))
		{
			if($where!="") $where.=" OR ";
			$where.= "SETTING_NAME LIKE '".pfs($keyValue)."%'";
		}
	}
	
	// -- Filter setting by appcode
	$where.= " AND APPCODE = '".$_core['_sessioninfo']->dataset."'";

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM SW_SBS_SETTINGS WHERE ".$where;
?>