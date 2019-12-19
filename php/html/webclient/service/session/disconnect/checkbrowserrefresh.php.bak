<?php

	//-- includes
	include('swphpdll.php');
	include_once("../../../php/_wcconfig.php");
	//include_once("../../../php/swDecoder.php");

	$strSessionID = $_POST["swsessionid"];

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

	// This function creates the specified directory path using mkdir().
	function RecursiveMkdir($path)
	{
		if (!file_exists($path))
		{
			//-- The directory doesn't exist.  Recurse, passing in the parent directory so that it gets created.
			RecursiveMkdir(dirname($path));
			mkdir($path, 0777);
		}
	}

	function logout($sessionId)
	{
		// F0092285 - Session logout every time the Web Client is refreshed
		//			- bind to the analyst session required as the PHP session variable has been lost
		$xmlmc = new swphpXmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionId);
		if($xmlmc->Invoke("session","bindSession", true))
		{
			$response = json_decode(utf8_encode($xmlmc->xmlresult));
		}
					
		$xmlmc->invoke("session","analystLogoff",true);
		
	}
	//-- create temporary session file
	chdir("../../../");
	$currPath = getcwd();

	//-- get temp location
	$destination_path = $currPath ."/temporaryfiles";
	$destination_path = str_replace("\\","/",$destination_path);
	RecursiveMkdir($destination_path);


	//-- dump file based on session id - this will be deleted by session.php  if doing a refresh
	$filePath = $destination_path ."/".$strSessionID.".txt";
	$fp = fopen($filePath, 'w');
	fwrite($fp, $strSessionID);
	fclose($fp);

	//-- wait for 5 seconds - if file is still here then delete it and log out as means uer has closed window or left webclient
	sleep(5);
	if(is_file($filePath)) 
	{
		@unlink($filePath);
	
		//-- get temp location
		$destination_path = $currPath ."/temporaryfiles/". $strSessionID;
		$destination_path = str_replace("\\","/",$destination_path);
		deletepath($destination_path);

		// F0092285 - Session logout every time the Web Client is refreshed
		logout($strSessionID);
		//-- kill any session data
		@session_destroy();
	}
?>