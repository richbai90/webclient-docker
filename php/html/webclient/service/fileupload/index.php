<?php

	//-- 1.0.0
	//-- service/fileupload/index.php
	$excludeTokenCheck = true;
	include('../../php/session.php');
	set_time_limit(360); //-- 5 minutes

	if (empty($_FILES) && empty($_POST) && isset($_SERVER['REQUEST_METHOD']) && strtolower($_SERVER['REQUEST_METHOD']) == 'post') 
	{   
		$result = "The file is greater than the php POST_MAX_SIZE setting. Please contact your Administrator for assistance.";
		$strHTML  =	"<script language='javascript' type='text/javascript'>";   
		$strHTML .= "top.fileuploadcomplete('".$result."','','','','','','');";
		$strHTML .= "</script>";
		echo $strHTML;
		exit(0);
	} 

	//--
	//-- get the fileupload type
	$ult = $_POST["_uploadtype"];
	switch($ult)
	{
		case "cdf":
		case "lcf":
			$ult = "Call";
			break;
		case "kbase":
			$ult = "KnowledgeBase";
			break;
		case "cid":
		case "mail":
			$ult = "Messaging";
			break;
		case "fs":
			$ult = "FileService";
			break;
		default:
			$ult = "Global";
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/index.php","START","SERVI");
	}	

	if(@$_POST['swuploadfile_copytopath']!="")
	{
		$destination_path = str_replace("\\","/",$_POST['swuploadfile_copytopath']);
	}
	else
	{
		//-- session temp file path
		$webRootPath = "temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
		$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
		$destination_path = str_replace("\\","/",$destination_path);

		//-- make directory path in app root working dir
		chdir("../../");
		@mkdir("temporaryfiles");
		@chmod("temporaryfiles", 0777);
		chdir("temporaryfiles");
		@mkdir($_SESSION['swsession']);
		@chmod($_SESSION['swsession'], 0777);
		chdir($_SESSION['swsession']);
		@mkdir($_POST["_uniqueformid"]);
		@chmod($_POST["_uniqueformid"], 0777);
	}

	$result = 0;   
	$strfilename="";
	$strfilesize="";
	$strfiledate="";
	$strOrigFileName = "";

	foreach($_FILES as $strFieldName => $aFile)
	{ 
		if($aFile['error']>0)
		{
			$result = "File upload failed - ". $aFile['error'];
			switch ($aFile['error'])
			{  
				case 1:
					$result ='The file is bigger than the php installation allows';
					break;
				 case 2:
					$result ='The file is bigger than the form allows';
					break;
				 case 3:
					$result ='Only part of the file was uploaded';
					break;
				 case 4:
					$result ='No file was uploaded';
					break;
			}
		}
		else
		{	
			$strfilename = $aFile["name"];

			//-- 2013-09-09
			if(!checkUploadedFileTypeAllowed($strfilename,$ult))
			{
				$result = -1;  
				break;
			}

			$strOrigFileName = $strfilename;
			$strfilename = $_POST["_prefixfilename"] . $strfilename;
			$target_path = $destination_path . "/". basename($strfilename);
			if(@move_uploaded_file(realpath($aFile["tmp_name"]), $target_path)) 
			{
				sleep(1);
				$result = 1;   
				$strfilesize=conversion_bytesize(filesize($target_path));
				$strfiledate= date ("Y/m/d H:i", filemtime($target_path)) ;

				//-- log activity
				if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
				{
					_wc_debug($target_path,"uploaded","SERVI");
				}	
			}
		}
	}

	//-- call js to handle completion of upload request - 88636 - prepare file names with ' in them
	$p =  @$_POST['_uploadtype'];
	$strHTML  =	"<script language='javascript' type='text/javascript'>";   
	$strHTML .= "top.fileuploadcomplete('".$result."','".str_replace("'","\'",$strfilename)."','".$strfilesize."','".$strfiledate."','".$_POST['swfileuploadcallbackfunctionid']."','".$webRootPath."','".str_replace("'","\'",$strOrigFileName)."');";
	$strHTML .= "</script>";


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/index.php","END","SERVI");
	}	


	echo $strHTML;
?>