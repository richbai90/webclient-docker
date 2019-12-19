<?php

	//-- 0.0.1 - copy attachments from one uniqueformid to another - given list of filenames

	include("../../../php/session.php");
	error_reporting(E_ERROR);


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/copyattachments/index.php","START","SERVI");
	}	

	//echo $_POST['_filenames'] . "][";
	//echo $_POST['_saveasfilenames'];
	$arrfilenames = explode(",",$_POST['_filenames']);
	$arrsaveasfilenames = explode(",",$_POST['_saveasfilenames']);
	$bCopyAs = (count($arrsaveasfilenames)>0)?true:false;
	$res = "";
	if(count($arrfilenames)>0)
	{
		$source_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniquefromformid"];
		$source_path = str_replace("\\","/",$source_path);

		//-- session temp file path
		$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniquetoformid"];
		$destination_path = str_replace("\\","/",$destination_path);

		//-- make directory path in app root working dir
		RecursiveMkdir($destination_path);

		//-- for each file id
		foreach($arrfilenames as $pos => $filename)
		{
			//-- copy from to
			$saveAsfilename=($bCopyAs)?$arrsaveasfilenames[$pos]:$filename;
			copy($source_path . '/' . $filename,$destination_path . '/' . $saveAsfilename);  

			//-- log activity
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug('copy : '.$source_path . '/' . $filename .' >> '.$destination_path . '/' . $saveAsfilename,"END","SERVI");
			}	

			if($res!="")$res.="||";
			$res .= $filename."|".$saveAsfilename;
		}
		echo $res;
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/copyattachments/index.php","END","SERVI");
	}	
?>