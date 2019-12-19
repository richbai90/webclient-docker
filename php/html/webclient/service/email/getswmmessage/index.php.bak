<?php

	//-- load swm file content from cdf 

	//-- will open a file associated to lcf atachment list
	include('../../../php/session.php');


	//-- 1.0.0
	//-- service/fileopen/lcf.php
	if($_POST["_callref"]=="")exit(0);


	function _get_email_attachment_data_by_source($attachmentSourceID , $strUseMailbox)
	{
		global $portal;

		$xml = "<methodCall service='mail' method='getMailFileAttachment'><params><mailbox>".$strUseMailbox."</mailbox><fileSource>".$attachmentSourceID."</fileSource></params></methodCall>";
		$oResult = xmlmc($portal->sw_server_ip, "5014", $_SESSION['swstate'], $xml);
		$_SESSION['swstate']=$oResult->token;
		
		if($oResult->status==200)
		{
			$fileAttNode = domxml_open_mem(utf8_encode($oResult->content));
			if($fileAttNode)
			{
				$arrFD = $fileAttNode->get_elements_by_tagname('fileAttachment');
				if($arrFD[0])
				{
					$arrFD= $arrFD[0]->get_elements_by_tagname('fileData');
					return base64_decode($arrFD[0]->get_content());
				}
			}
		}
		return "";
	}


	//-- save email attachments to server
	function _save_mime_attachments_to_server($xmlResponseNode, $strUseMailbox)
	{
		global $port;
		global $portal;

		//-- which temp folder to store files in
		if($_POST["_uniqueformid"]=="")
		{
			$_POST["_uniqueformid"]="email";
		}
		//-- maybe we want to dump file in an alternative folder
		if($_POST["_altuniqueformid"]!="")
		{
			$_POST["_uniqueformid"]=$_POST["_altuniqueformid"];
		}


		//-- set destination path
		$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
		$destination_path = str_replace("\\","/",$destination_path);

		$weburl =  $portal->root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
		$weburl = str_replace("\\","/",$weburl);

		//-- make directory path in app root working dir
		chdir("../../../");
		@mkdir("temporaryfiles");
		@chmod("temporaryfiles", 0777);
		chdir("temporaryfiles");
		@mkdir($_SESSION['swsession']);
		@chmod($_SESSION['swsession'], 0777);
		chdir($_SESSION['swsession']);
		@mkdir($_POST["_uniqueformid"]);
		@chmod($_POST["_uniqueformid"], 0777);

		//-- kill all existing files in dir - so keep email preview files relatively tidy
		SureRemoveDir($destination_path,false);

		$arrContentIDToReplace = array();

		//-- get html body array so we can swa[ out content id with saved urls
		$arrHTMLBody = $xmlResponseNode->get_elements_by_tagname('htmlbody');
		if(!$arrHTMLBody[0])
		{
			$arrHTMLBody = $xmlResponseNode->get_elements_by_tagname('htmlBody');
		}

		//-- copy any files atts to sever
		$x=0;
		$arrFileAtts = $xmlResponseNode->get_elements_by_tagname('fileAttachment');
		foreach($arrFileAtts as $iPos => $xmlFileAtt)
		{
			//-- get file name and get data (b64 unencode it)
			$fileSourceID = "";
			$boolSWFileSource = false; //-- fileSource is not MFA:##
			$arrFN = $xmlFileAtt->get_elements_by_tagname('fileName');
			$fileName = $arrFN[0]->get_content();
			$arrFD = $xmlFileAtt->get_elements_by_tagname('fileSource');
			$fileData = base64_decode($arrFD[0]->get_content());
			
			$arrCI = $xmlFileAtt->get_elements_by_tagname('contentId');
			$contentID = $arrCI[0]->get_content();

			//-- set paths depending if inline mime or att
			//-- set filename to be unique and indicate that is mime
			$bExcludeMime = false;
			$bExcludeFileAtt = ($_POST['_excludeFileAttachments']=="1")?true:false;
			if($contentID!="")
			{
				//-- not a file att
				$bExcludeFileAtt = false;
				if($_POST['_excludeMimeAttachments']=="1")$bExcludeMime =true;
				//-- write out file
				$fileName = "mime.".$x.".".$fileName; 

			}
			else
			{
				$fileName = "att.".$x.".".$fileName; 
			}
			//-- write out file
			$filePath = $destination_path.'/'.$fileName; 
			$fileUrl = pfx($weburl ."/".$fileName);

			//-- write out file
			if($bExcludeFileAtt)
			{
				//-- not writing out file
				if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
				{
					_wc_debug($portal->sw_server_ip.":".$port, "file skipped as exclude attachments option is on : ". $filePath,"XMLMC","INFO");
				}
			}
			else
			{
				$handle = fopen($filePath, "w");
				fwrite($handle, $fileData);
				fclose($handle);
			
				if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
				{
					_wc_debug($portal->sw_server_ip.":".$port, "file saved to : ". $filePath,"XMLMC","INFO");
				}
			}

			//-- replace data with file url
			xmlreplace_content($arrFD[0],$fileUrl);

			//-- move fileid to new tag so webclient can use if need be
			if($fileSourceID!="")
			{
				 xmladd_newnode($arrFD[0]->parent_node(),"swFileId",$fileSourceID);
			}

			//-- replace cid with url in all body tags
			if($contentID!="")$arrContentIDToReplace[$contentID] = $fileUrl;

			$x++;
		}

		//-- replace all instances of htmlbody in response xml (merge templates will have more)
		foreach($arrHTMLBody as $xPos => $xmlBody)
		{
			$boolChanged = false;
			$strHTMLBody = $xmlBody->get_content();

			//-- replace each contentid
			foreach($arrContentIDToReplace as $contentID => $fileUrl)
			{
				$boolChanged = true;
				$strHTMLBody = str_replace("cid:" . $contentID, $fileUrl,$strHTMLBody);		
			}

			if($boolChanged)xmlreplace_content($xmlBody,pfx($strHTMLBody));
		}


		return $xmlResponseNode->dump_mem(true);
	}




		//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/email/getswmmessage/index.php [".$_POST["_callref"]."-".$_POST["_dataid"]."]","START","SERVI");
	}	

	//-- get call file attach info 
	$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='helpdesk' method='getCallFileAttachment'><params><callRef>".$_POST["_callref"]."</callRef><fileId>".$_POST["_dataid"]."</fileId></params></methodCall>";
	$oResult = xmlmc($portal->sw_server_ip, "5015", $_SESSION['swstate'], $xml);
	$_SESSION['swstate']=$oResult->token;

	if($oResult->status==200)
	{
		//-- create xmldom so we can get info
		$xmlFile = @domxml_open_mem($oResult->content);
		if($xmlFile==false)
		{
			echo "<script>alert('There was a problem opening the swm selected file. Please contact your Administrator');</script>";
			exit(0);
		}

		$arrFData = $xmlFile->get_elements_by_tagname('fileContent');
		if(!$arrFData[0])
		{
			$error = $xmlFile->get_elements_by_tagname('error');
			echo "<script>alert('There was a problem reading the selected swm file content [".$_POST["_callref"]."-".$_POST["_dataid"]."]. Please contact your Administrator');</script>";
			exit(0);
		}

		//-- get xmlmc structure of message
		$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='mail' method='readSwmMessage'><params><fileContent>".$arrFData[0]->get_content()."</fileContent></params></methodCall>";
		$oResult = xmlmc($portal->sw_server_ip, "5014", $_SESSION['swstate'], $xml);
		$_SESSION['swstate']=$oResult->token;

		if($oResult->status==200)
		{
			//-- create xmldom so we can get info
			
			echo _save_mime_attachments_to_server(domxml_open_mem($oResult->content),"_helpdesk");
			exit(0);	
		}
		else
		{
			echo "<script>alert('There was a problem getting the selected swm file xml structure. Please contact your Administrator');</script>";
			//-- log activity
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug("service/email/getswmmessage/index.php mail:readSwmMessage","ERROR","SERVI");
			}	
			exit(0);
		}

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/email/getswmmessage/index.php","END","SERVI");
		}	


		exit(0);
	}
	echo "<script>alert('There was a problem opening the selected swm file. Please contact your Administrator');</script>";

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/email/getswmmessage/index.php","ERROR","SERVI");
	}	
	exit(0);
	
?>