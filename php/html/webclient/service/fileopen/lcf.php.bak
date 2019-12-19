<?php

	//-- 1.0.0
	//-- service/fileopen/lcf.php

	//-- will open a file associated to lcf atachment list
	$excludeTokenCheck = true;
	include('../../php/session.php');

		//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileopen/lfc.php","START","SERVI");
	}	

	//-- make sure not trying to traverse directory
	if ( (strpos($_REQUEST["_uniqueformid"],"..")!==false) || (strpos($_REQUEST["_filename"],"..")!==false) )
	{
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("Invalid formid or filename specified","SECURITY","SERVI");
		}

		echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
		exit(0);
	}

	

	//-- session temp file path
	$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_REQUEST["_uniqueformid"];
	$destination_path = str_replace("\\","/",$destination_path);

	$target_path = $destination_path . "/". basename($_REQUEST["_filename"]);

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug($target_path,"openfile","SERVI");
	}	
		

	$fp = fopen($target_path,"rb") ;
	if($fp==false)
	{
		echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
		exit(0);
	}
	fclose($fp);

	
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