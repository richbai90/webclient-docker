<?php

	//-- nwj - 27.11.2012 - searches for simple sql statement in current ddf _includes/simple.sql.php and executes it. 

	//-- include simple sql statements
	IncludeApplicationPhpFile("simple.sql.php");

	//-- include ddf main helper - which should include any other helpers
	IncludeApplicationPhpFile("main.helper.php");

	function getStaticSql($key)
	{	
		global $_SWDATASQL;
		$sql = "";

		//-- can bind filters using , (filter AND anotherFilter)
		$arrFilters = explode(",",$key);
		while (list($pos,$filterKey) = each($arrFilters))
		{
			if(!isset($_SWDATASQL[$filterKey]))
			{
				return getCacheSql($key);
			}
			else
			{
				if($sql!="")$sql .= " AND ";
				$sql .= $_SWDATASQL[$filterKey];
			}
		}

		//-- swap out any [name] with pfs($_POST[name]) and return
		return parseEmbeddedParameters($sql);
	}

	function getCacheSql($key)
	{	
		global $_SYSTEMSQL;
		$sql = "";

		//-- can bind filters using , (filter AND anotherFilter)
		$arrFilters = explode(",",$key);
		while (list($pos,$filterKey) = each($arrFilters))
		{
			if(!isset($_SYSTEMSQL[$filterKey]))
			{
				throwError("-100","Simple Sql not found for (".$filterKey."). Please contact your Administrator.");
			}
			if($sql!="")$sql .= " AND ";
			$sql .= $_SYSTEMSQL[$filterKey];
		}

		//-- swap out any [name] with pfs($_POST[name]) and return
		return parseEmbeddedParameters($sql);
	}

	//--
	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
	$sqlCommand =  getStaticSql($_POST["_sqlkey"]);

?>