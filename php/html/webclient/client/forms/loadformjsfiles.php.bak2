<?php

include('../../php/_wcconfig.php');

function sw_file_put_contents($strFilepath,$strContent)
{
	$fp = fopen($strFilepath, 'w');
	fwrite($fp,$strContent);
	fclose($fp);
}


//-- do we want to  load uncompressed files
$strMin = (defined("_QAMODE") && _QAMODE==true)?"":"min/";
$strMinName = (defined("_QAMODE") && _QAMODE==true)?"_":"_minified_";
$currentCacheVersion = _CACHEFILEVERSION;
$saveFileAs = "formscripts".$strMinName.$currentCacheVersion.".js";


//--
//-- check if cached
$headers = apache_request_headers();
$timestamp = time();
$tsstring = gmdate('D, d M Y H:i:s ', $timestamp) . 'GMT';
$etag = md5(_CACHEFILEVERSION . $strMinName);
header("Last-Modified: $tsstring");
header("ETag: {$etag}");
if(defined("_DEVMODE"))
{
	header('Expires: Thu, 01-Jan-00 00:00:01 GMT');
}
else
{
	header('Expires: Thu, 01-Jan-70 00:00:01 GMT');
}
header('Content-Type: application/javascript');

if(!defined("_DEVMODE") && isset($headers['If-None-Match']) && $etag == $headers['If-None-Match'] && file_exists($saveFileAs)) 
{
	header('HTTP/1.1 304 Not Modified');
	exit();
}
else
{
	$arrFiles = Array();
	if(!defined("_DEVMODE") && file_exists($saveFileAs))
	{
		echo file_get_contents($saveFileAs);
	}
	else
	{
		//-- delete any .js files in dir
		array_map('unlink', glob("*.js"));


		//-- FOR FORM JS
		//-- create swform.scripts.js for use in forms
		$arrFiles[] = 'js/'.$strMin.'swjs.classes.js';		
		$arrFiles[] = 'js/'.$strMin.'swform.helpers.js';
		$arrFiles[] = 'js/'.$strMin.'swform.document.js';
		$arrFiles[] = 'js/'.$strMin.'swform.form.js';
		$arrFiles[] = 'js/'.$strMin.'swform.data.js';		
		$arrFiles[] = 'js/'.$strMin.'swform.controls.js';		
			

		//--
		//-- create bulk script to return to client
		$strCoreJavascript = "";
		for($x=0;$x<count($arrFiles);$x++)
		{
			$strCoreJavascript .= ";;;;". utf8_encode(@file_get_contents($arrFiles[$x]));
		}

		//-- create corejsfile
		sw_file_put_contents($saveFileAs,$strCoreJavascript);
	}

	echo $strCoreJavascript;
	exit();
}
?>
