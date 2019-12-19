<?php

	if(!defined("RUNNING_INWC"))
	{
		echo "ERROR:File called out of context.";
		exit(0);
	}


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

	//-- save a call attachment to server
	function _save_call_attachment_to_server($xmlResponseNode)
	{
		global $port;
		global $portal;

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

		//-- get file name and get data (b64 unencode it)

		$arrRetParams = $xmlResponseNode->get_elements_by_tagname("params");
		$arrFN = $arrRetParams[0]->get_elements_by_tagname('fileName');
		$fileName = $arrFN[0]->get_content();
		$arrFD = $arrRetParams[0]->get_elements_by_tagname('fileContent');
		$fileData = base64_decode($arrFD[0]->get_content());

		//-- check if we what to save call file for email attachment (I.E. mail merge after call update)
		if($_POST["_savecallfilesforemailattachment"]=="1")
		{
			//-- 
			$attID = time();
			$fileName = "att.".$attID.".".$fileName;

			//-- store new file name in xml
			$node = $xmlResponseNode->create_element("attachmentFileName");
			$newnode = $arrRetParams[0]->append_child($node);
			$newnode->set_content($fileName);
			//-- and att value
			$node = $xmlResponseNode->create_element("attachmentFileValue");
			$newnode = $arrRetParams[0]->append_child($node);
			$newnode->set_content($attID);
		}

		//-- write out file
		$filePath = $destination_path.'/'.$fileName; 
		$fileUrl = $weburl ."/".$fileName;

		if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
		{
			_wc_debug($portal->sw_server_ip.":".$port, "file saved to : ". $filePath,"XMLMC","INFO ");
		}

		$handle = fopen($filePath, "w");
		fwrite($handle, $fileData);
		fclose($handle);

		//-- replace fileContent data with file url so client knows where to get file
		xmlreplace_content($arrFD[0],$fileUrl);

		return $xmlResponseNode->dump_mem(true);
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

		//-- copy any mime atts to sever
		$x=0;
		$arrMimeAtts = $xmlResponseNode->get_elements_by_tagname('mimeAttachment');
		foreach($arrMimeAtts as $iPos => $xmlMimeAtt)
		{
			//-- get file name and get data (b64 unencode it)
			$arrFN = $xmlMimeAtt->get_elements_by_tagname('fileName');
			$fileName = $arrFN[0]->get_content();
			$arrFD = $xmlMimeAtt->get_elements_by_tagname('fileData');
			$arrCI = $xmlMimeAtt->get_elements_by_tagname('contentId');
			$contentID = $arrCI[0]->get_content();

			//-- set filename to be unique and indicate that is mime
			if($contentID!="")
			{
				//-- write out file
				$fileName = "mime.".$x.".".$fileName; 
			}
			else
			{
				$fileName = "att.".$x.".".$fileName; 
			}
			//-- write out file
			$filePath = $destination_path.'/'.$fileName; 
			$fileUrl = $weburl ."/".$fileName;


			if($_POST['_excludeMimeAttachments']!="1")
			{
					
				$fileData = base64_decode($arrFD[0]->get_content());
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
			if($contentID!="")$arrContentIDToReplace[$contentID] = $fileUrl;
			$x++;
		}

		//-- copy any files atts to sever
		$arrFileAtts = $xmlResponseNode->get_elements_by_tagname('fileAttachment');
		foreach($arrFileAtts as $iPos => $xmlFileAtt)
		{
			//-- get file name and get data (b64 unencode it)
			$fileSourceID = "";
			$boolSWFileSource = true; //-- fileSource is MFA:##
			$arrFN = $xmlFileAtt->get_elements_by_tagname('fileName');
			$fileName = $arrFN[0]->get_content();
			$arrFD = $xmlFileAtt->get_elements_by_tagname('fileSource');
			if($arrFD[0])
			{
				$fileSourceID = $arrFD[0]->get_content();
			}
			else
			{
				$boolSWFileSource = false;
				$arrFD = $xmlFileAtt->get_elements_by_tagname('fileData');
				$fileData = base64_decode($arrFD[0]->get_content());
			}

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

			//-- call xmlmc method to get the file attachment

			if($fileSourceID!="" && $boolSWFileSource && !$bExcludeFileAtt)
			{
				$fileData = _get_email_attachment_data_by_source($fileSourceID, $strUseMailbox);
			}

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


	function _get_b64_uploadedfile_data($strFileName, $wcFileSource = "")
	{
		global $portal;

		if($wcFileSource!="")$strFileName = $wcFileSource;

		//-- get file off server for this session and form unique id
		//-- read contents and base64 them - fileData should therefore contain the file name to load.
		$strB64Data = "";
		if($_POST['_uniqueformid']!="")
		{
		
			//-- get temp location
			$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
			$destination_path = str_replace("\\","/",$destination_path);
		
			if($handle = @opendir($destination_path)) 
			{ 
				$filePath = $destination_path.'/'.$strFileName; 
		
				if(is_file($filePath)) 
				{
					//-- open file
					$strB64Data = base64_encode(file_get_contents($filePath));
					
				}
				closedir($handle); 
			}
		}

		return $strB64Data;
	}


?>