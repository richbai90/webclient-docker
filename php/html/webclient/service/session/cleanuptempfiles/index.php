<?php

	//-- 22.03.2010 - clean up temp files
	//-- expects :-
	//--			analystid:
	//--			swsessionid :

	//-- use sw xmlrpc to logout analyst ??
	//@session_destroy();

	include_once('php5requirements.php');
	set_time_limit(15);
	
	//-- FUNCTIONS
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
	//-- EOF FUNCTIONS

	chdir("../../../");
	$currPath = getcwd();

	//-- get temp location
	$tempFolderPath = $currPath ."/temporaryfiles/";
	$destination_path =  $tempFolderPath . $_POST["swsessionid"];
	$destination_path = @str_replace("\\","/",$destination_path);

	//-- now check any expired session where folder still exists
	$strSessionFolderList="";
	$destination_path = @str_replace("\\","/",$tempFolderPath);
	if($handle = @opendir($destination_path)) 
	{ 
		$arrFolderSessions = Array();
		while($file = @readdir($handle)) 
		{ 
			$filePath = $destination_path.'/'.$file; 
			if(!is_file($filePath)) 
			{
				if($file!="." && $file!="..")
				{
					//-- is a dir - so will be named after a session - store in var
					if($strSessionFolderList!="")$strSessionFolderList.=",";
					$strSessionFolderList.="'".$file."'";
					$arrFolderSessions[]=$file;
				}
			}
		} 
		closedir($handle); 
	}

	if($strSessionFolderList!="")
	{
		// RF - 2017-11-13 - Create local session for DB query
		$xmlmc = new swphpXmlMethodCall();
		if($xmlmc->Invoke("session","createLocalSession", true))
		{
			$response = json_decode(utf8_encode($xmlmc->xmlresult));
			if($response->{"@status"}==false)
				return false;
			else
			{
				$_SESSION['sessionId'] = $response->params->sessionId;
			}
		}
		else return false;
		
		$strSQL = "select sessionid from swsessions where sessionid in(".$strSessionFolderList.")";
		$result = new swphpDatabaseQuery($strSQL,"sw_systemdb");
		if($result)
		{
			while($rec = $result->fetch())
				$rows[] = $rec->sessionid;
		}

		//-- if count is 0 then remove all items in temp folder 
		if(count($rows)==0)
		{
			for($x=0;$x<count($arrFolderSessions);$x++)
			{
				deletepath($tempFolderPath .$arrFolderSessions[$x]);
			}
		}
		else
		{
			//-- loop thruogh session id's, those that are not in our array should have path deleted
			for($x=0;$x<count($arrFolderSessions);$x++)
			{
				//-- session folder not in session table therefore expired so remove folder
				if(!in_array($arrFolderSessions[$x], $rows))
				{
					deletepath($tempFolderPath . $arrFolderSessions[$x]);
				}
			}
		}
		if($xmlmc->Invoke("session","closeLocalSession", true))
		{
			$response = json_decode(utf8_encode($xmlmc->xmlresult));
			if($response->{"@status"}==false)
				return false;
		}
		else return false;
	}
	
	exit();
?>