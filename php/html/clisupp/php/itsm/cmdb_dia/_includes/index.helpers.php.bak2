<?php
	/**
	 * Simple function to replicate PHP 5 behaviour
	 */
	if($strVerbose)log_action("Loaded: index.helpers.php");	
	function microtime_float()
	{
	    list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec + (float)$sec);
	}

	//-- sys array for use by internal processor (in case apps dev use same var names)
	$_core = Array();
	$_core['_nexttoken'] = NULL;
	$_core['_sessioninfo'] = NUll;
	//-- load default ddf info (for col type checking etc)
	swdti_load("Default");

	$aReplace = array("record/","execute/");
	$dbs = new dd();

	//-- include the script which should set a var $sqlCommand and optionally $sqlDatabase
	$sqlDatabase = swfc_source();
	$sqlCommand  = "";

	//-- handle instance we dev has set alt name 
	if($sqlDatabase=="syscache"||$sqlDatabase=="swcache")$sqlDatabase = "sw_systemdb";	

?>