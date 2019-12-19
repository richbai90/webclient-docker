<?php

include('../php/_wcconfig.php');

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
$saveFileAs = "core".$strMinName.$currentCacheVersion.".js";


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


		$arrFiles[] = 'js/'.$strMin.'app.browser.js';
		$arrFiles[] = 'js/'.$strMin.'app.t.js';
		$arrFiles[] = 'js/'.$strMin.'app.popupmenu.js';

		//<!-- system functions - that help mimic full client functions -->
		$arrFiles[] = 'js/system/'.$strMin.'swc.toolbar.js';
		$arrFiles[] = 'js/system/'.$strMin.'swc.windows.js';
		$arrFiles[] = 'js/system/'.$strMin.'hsl.anchors.js';
		$arrFiles[] = 'js/system/'.$strMin.'system.actions.js';
		$arrFiles[] = 'js/system/'.$strMin.'swchd.actions.js';
		$arrFiles[] = 'js/system/'.$strMin.'kbase.actions.js';
		$arrFiles[] = 'js/system/'.$strMin.'swc.constants.js';
		$arrFiles[] = 'js/system/'.$strMin.'session.js';
		$arrFiles[] = 'js/system/'.$strMin.'app.js';
		$arrFiles[] = 'js/system/'.$strMin.'global.js';

		//<!-- client interface functions -->
		$arrFiles[] = 'js/'.$strMin.'app.date.js';
		$arrFiles[] = 'js/'.$strMin.'app.dhtml.js';
		$arrFiles[] = 'js/'.$strMin.'app.xmlhttp.js';
		$arrFiles[] = 'js/'.$strMin.'activepage.functions.js';

		//<!-- controls that can be used all over -->
		$arrFiles[] = 'js/controls/'.$strMin.'control.tabcontrol.js';
		$arrFiles[] = 'js/controls/'.$strMin.'control.datatable.js';
		$arrFiles[] = 'js/controls/'.$strMin.'control.toolbar.js';

		//<!-- workspace system functions -->
		$arrFiles[] = 'workspace/js/'.$strMin.'sys.servicedesk.js';
		$arrFiles[] = 'workspace/js/'.$strMin.'sys.email.js';
		$arrFiles[] = 'workspace/js/'.$strMin.'sys.calendar.js';
		$arrFiles[] = 'workspace/js/'.$strMin.'sys.kbase.js';
		$arrFiles[] = 'workspace/js/'.$strMin.'sys.mylibrary.js';

		//<!-- outlook bar functions -->
		$arrFiles[] = 'outlook/'.$strMin.'outlook.js';

		//<!-- new sw.js file to contain common functions available to all apps -->
		//$arrFiles[] = '../apps/_global/js/sw.js';

		//<!-- controls used by outlook controls only -->
		$arrFiles[] = 'controls/mes/mes.js';
		$arrFiles[] = 'controls/tree/tree.js';

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
