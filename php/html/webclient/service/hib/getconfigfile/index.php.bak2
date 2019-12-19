<?php

	//-- using _hibconfig url load xml. Check if compressed. If compressed uncompress
	//--
	include("../../../php/session.php");

	$file = $_REQUEST['_hibconfig'];

	//-- ensure path is a url and does not contain any ..
	if(strpos($file,"http")!==0 || strpos($file,"/config.xml")===false || strpos($file,"..")>0)die("<?xml version='1.0' ?><error>Failed to load configuration file. Please contact your Administrator.</error>");

	$filecontents = @file_get_contents($file, "r") or die("<?xml version='1.0' ?><error>Failed to load configuration file. Please contact your Administrator.</error>");;

	$strHeader = substr($filecontents, 0,4);
	if($strHeader=="SWCB")
	{
		//-- compressed - remove full sw header
		$filecontents = substr($filecontents, 8);    
		$filecontents = bzdecompress ($filecontents);
	}

	//-- core product work around - aw config file is not properly formed
	$filecontents = str_replace("&", "&amp;",$filecontents);
	$filecontents = str_replace(' "args=','" args=',$filecontents);


	$filecontents = "<?xml version='1.0' ?>" . rtrim($filecontents);
	echo $filecontents;
	exit;
?>