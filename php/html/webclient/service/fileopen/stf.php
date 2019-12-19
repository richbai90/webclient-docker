<?php

	//-- 1.0.0
	//-- service/fileopen/stf.php
	//-- will open a file associated to normal filetable control
	$excludeTokenCheck = true;
	include('../../php/session.php');

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileopen/stf.php","START","SERVI");
	}	


	//-- make sure not trying to traverse directory
	if (strpos($_REQUEST["_filename"],"..")!==false)
	{
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("Invalid filename specified","SECURITY","SERVI");
		}
		echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
		exit(0);
	}


	if($_REQUEST["_uncpath"]=="")
	{
		//-- make sure not trying to traverse director
		if (strpos($_REQUEST["_uniqueformid"],"..")!==false)
		{
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug("Invalid formid specified","SECURITY","SERVI");
			}

			echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
			exit(0);
		}
		$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_REQUEST["_uniqueformid"];
	}
	else
	{
		$destination_path = $_POST["_uncpath"];
	}

	$destination_path = str_replace("\\","/",$destination_path);
	$target_path = $destination_path . "/". trim(basename($_REQUEST["_filename"]));

	$fp = fopen($target_path,"rb");
	if($fp==false)
	{
		echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
		exit(0);
	}
	fclose($fp);


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug($target_path,"openfile","SERVI");
	}	

	if($_REQUEST['_filesaveas'])$_REQUEST['_filename']=$_REQUEST['_filesaveas'];

	
	@ini_set("zlib.output_compression","Off"); # Disable PHP's output compression
	ob_end_clean(); # We need to clean all possible output data before reading the file

	// Set the correct headers
	//header ("200 HTTP/1.0 OK"); # Force the answer to be HTTP/1.0 compatible
	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-type: " . returnMIMEType(trim($_REQUEST['_filename'])));
	header('Content-disposition: attachment;filename="'.$_REQUEST['_filename'].'"');
	$target_path = preg_replace("/&{1}$/","",$target_path);
	readfile($target_path);
	exit(0);
?>