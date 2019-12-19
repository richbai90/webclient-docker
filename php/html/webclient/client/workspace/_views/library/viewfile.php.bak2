<?php

include('../../../../php/session.php');

//-- call xmlmc to get file data and output
$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='mylibrary' method='getFile'><params><path>".$_POST["filepath"]."</path></params></methodCall>";
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

	$arrFData = $xmlFile->get_elements_by_tagname('fileData');
	if(!$arrFData[0])
	{
		echo "<script>alert('There was a problem reading the selected file content. Please contact your Administrator');</script>";
		//echo "<textarea>".$oResult->content."</textarea>";
		exit(0);
	}
	
	@ini_set("zlib.output_compression","Off"); # Disable PHP's output compression
	@ini_set('implicit_flush', 1);	
	
	ob_end_clean(); # We need to clean all possible output data before outputing the file

	// Set the correct headers
	//header ("200 HTTP/1.0 OK"); # Force the answer to be HTTP/1.0 compatible
	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-type: " . returnMIMEType(trim($_POST['filename'])));
	header('Content-disposition: attachment;filename="'.$_POST['filename'].'"');
	print(base64_decode($arrFData[0]->get_content()));
	exit(0);
}
else
{
	echo "<script>alert('The xmlmc service call failed to fetch the selected file content. Please contact your Administrator');</script>";
	exit(0);
}
?>