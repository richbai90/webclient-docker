<?php

	//-- 23.10.2009 - disconnect a provided session id (used for managing sessions)
	//-- expects :-
	//--			closesessionid :

	//-- use sw xmlrpc to logout analyst ??

	//-- includes
	include('swphpdll.php');	
	include_once("../../../php/_wcconfig.php");
	include_once("../../../php/swDecoder.php");

	$strSessionID = $_POST['closesessionid'];

	//-- close session
	$echoResult = swhd_closesession("127.0.0.1",  $strSessionID);

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
?>
