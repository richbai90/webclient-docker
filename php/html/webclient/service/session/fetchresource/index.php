<?php

	//-- v1.0.0
	//-- service\session\fetchresource
	//-- given $fetchresourcepath open file and echo out contents

	include("../../../php/session.php");


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/fetchresource/index.php","START","SERVI");
	}



	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug($_POST['pathtype'].$_POST['fetchresourcepath'],"GETFILE","SERVI");
	}

	$strPathType = $_POST['pathtype'];
	if($strPathType=="/clisupp/")$strPathType = "../".$strPathType;

	$strFileName =$portal->fs_root_path.$strPathType.$_POST['fetchresourcepath'];
    $xmlfp = @file_get_contents($strFileName);
	if($xmlfp==false) 
	{
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/session/fetchresource/index.php","ERROR","SERVI");
		}
		exit(0);
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/fetchresource/index.php","END","SERVI");
	}

	echo $xmlfp;
	exit(0);
?>