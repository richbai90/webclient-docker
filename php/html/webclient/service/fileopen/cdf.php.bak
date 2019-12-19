<?php

	//-- 1.0.0
	//-- service/fileopen/lcf.php

	if($_REQUEST["_callref"]=="")exit(0);

	//-- will open a file associated to lcf atachment list
	$excludeTokenCheck = true;
	include('../../php/session.php');

		//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileopen/cdf.php [".$_REQUEST["_callref"]."-".$_REQUEST["_rowid"]."]","START","SERVI");
	}	


	//-- get call file attach info 
	$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='helpdesk' method='getCallFileAttachment'><params><callRef>".$_REQUEST["_callref"]."</callRef><fileId>".$_REQUEST["_rowid"]."</fileId></params></methodCall>";
	$oResult = xmlmc($portal->sw_server_ip, "5015", $_SESSION['swstate'], $xml);
	$_SESSION['swstate']=$oResult->token;

	if($oResult->status==200)
	{
		//-- create xmldom so we can get info
		$xmlFile = @domxml_open_mem($oResult->content);
		if($xmlFile==false)
		{
			echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";
			exit(0);
		}

		$arrFData = $xmlFile->get_elements_by_tagname('fileContent');
		if(!$arrFData[0])
		{
			$error = $xmlFile->get_elements_by_tagname('error');
			echo "<script>alert('There was a problem reading the selected file content [".$_REQUEST["_callref"]."-".$_REQUEST["_rowid"]."]. Please contact your Administrator');</script>";
			exit(0);
		}


		@ini_set("zlib.output_compression","Off"); # Disable PHP's output compression
		ob_end_clean(); # We need to clean all possible output data before reading the file

		// Set the correct headers
		//header ("200 HTTP/1.0 OK"); # Force the answer to be HTTP/1.0 compatible
		header("Pragma: public");
		header("Expires: 0");
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-type: " . returnMIMEType(trim($_REQUEST['_filename'])));
		header('Content-disposition: attachment;filename="'.$_REQUEST['_filename'].'"');
		echo base64_decode($arrFData[0]->get_content());

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/fileopen/cdf.php","END","SERVI");
		}	


		exit(0);
	}
	echo "<script>alert('There was a problem opening the selected file. Please contact your Administrator');</script>";

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileopen/cdf.php","ERROR","SERVI");
	}	
	exit(0);
?>