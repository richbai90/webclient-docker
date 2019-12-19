<?php

	//-- 23.10.2009 - disconnect analyst session
	//-- expects :-
	//--			swsessionid :

	//-- use sw xmlrpc to logout analyst ??

	//-- includes
	include('swphpdll.php');
	include_once("../../../php/_wcconfig.php");
	include_once("../../../php/swDecoder.php");

	$strSessionID = $_POST['swsessionid'];

	//-- close session
	$echoResult = swhd_closesession("127.0.0.1");
	//echo $echoResult ." ".$strSessionID;

	chdir("../../../");
	$currPath = getcwd();

	//-- get temp location
	$destination_path = $currPath ."/temporaryfiles/" . $strSessionID;
	$destination_path = str_replace("\\","/",$destination_path);

	function deletepath($strPath)
	{
		if($handle = @opendir($strPath)) 
		{ 
			while($file = @readdir($handle)) 
			{ 
				$filePath =$strPath.'/'.$file; 
				if(is_file($filePath)) 
				{
					@unlink($filePath);
				}
				else 
				{
					if($file!="." && $file!="..")
					{
						if(@opendir($filePath))deletepath($filePath);
					}
				}
				clearstatcache(); 
			} 
			closedir($handle); 
		}
		@rmdir($strPath);
	}

	deletepath($destination_path);

	//-- kill any session data
	session_destroy();
?>
