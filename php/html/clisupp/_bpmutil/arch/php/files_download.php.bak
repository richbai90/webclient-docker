<?php
	include_once('helpers/session_check.php');
	$FileName = $_POST['filename'].".xml";
	$FileNameDisplay = substr($FileName,strpos($FileName,'/')+1);
	$strContentType = 'Content-type: application/xml';
	ini_set("zlib.output_compression","Off"); # Disable PHP's output compression
	ob_end_clean(); # We need to clean all possible output data before reading the file

	// Set the correct headers
	header ("200 HTTP/1.0 OK"); # Force the answer to be HTTP/1.0 compatible
	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header($strContentType);
	header('Content-disposition: attachment;filename="'.$FileNameDisplay.'"');
	$path = preg_replace("/&{1}$/","",'../workflows/'.$FileName);
	readfile($path);
	exit(0);
?>