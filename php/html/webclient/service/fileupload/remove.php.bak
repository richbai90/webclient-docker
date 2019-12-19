<?php

	
	//-- 13.01.2009
	//-- 1.0.0
	//-- service/call/fileattach/ca/remove.php
	
	//-- given unique call action form id and a filename, remove the file from temp file store so it will not be included in call update action
	$excludeTokenCheck = true;
	include('../../php/session.php');

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/remove.php","START","SERVI");
	}	

	//-- session temp file path
	$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
	$destination_path = str_replace("\\","/",$destination_path);

	$destination_path .= "/" .  $_POST["_filename"];



	chdir("../../");
	chdir("temporaryfiles");
	chdir($_SESSION['swsession']);
	chdir($_POST["_uniqueformid"]);


	if(is_file($destination_path)) 
	{
		unlink($destination_path);

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug($destination_path,"unlink","SERVI");
		}	

		echo "1";
	}
	else
	{
		echo "0";
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/remove.php","END","SERVI");
	}	
?>