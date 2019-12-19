<?php


	//-- 19.01.2010
	//-- service/swclass/xmlmethodcall

	//-- invoke xmlmc using helpdesk session. This allows us to do simple xml mc without having to worry about transport.
	//-- expects : _xmlmcservice , _xmlmcmethod and _xmlmcparam_<paramname> and _xmlmcdata_<paramname>

	//-- all includes should check this const
	
	//-- check valid session
	include_once("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/swclass/xmlmethodcall/index.php","START","SERVI");
	}

	//-- helpers to do with processing email attachments
	include_once("xmlmc.helpers.php");

	//-- 28.02.2011
	//-- check if we are requesting a webclient custom service (runs off php)
	//-- this is used for things like temp workflow
	if($_POST["_xmlmcservice"]=="webclient")
	{
		include_once("webclient.xmlmcservices.php");
		exit;
	}

	//-- defime xml string to send
	$arrParams = Array();
	$xml  = "<?xml version='1.0' encoding='utf-8'?>";
	$xml .= "<methodCall service='".$_POST["_xmlmcservice"]."' method='".$_POST["_xmlmcmethod"]."'>";
	$boolParams = false;
	$xmlParams = "<params>";
	//-- set each param
	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcparam_")===0)
		{
			$boolParams = true;

			//-- get param name
			$arrParam = explode("_xmlmcparam_",$strParamName,2);
			$strParam = $arrParam[1];

			//-- might be a groupie (we are submitting same param more than once i.e. group of callrefs
			$arrParam = explode("__grpcounter__",$strParam,2);
			$strParam = $arrParam[0];

			if($varValue=="_sw_complextype")
			{
				//-- start of complex
				//echo $strParam;
				$xmlParams .= "<".$strParam.">";
				foreach($_POST as $strComplexParamName => $varComplexValue)
				{
					$arrComplexValue = explode("__swcp__",$varComplexValue,2);
					$strParentTag = $arrComplexValue[0];
					

					if($strParentTag!=$strParam)continue;
					if(strPos($strComplexParamName,"_xmlmccomplexparam_")===0)
					{
						$arrComplexParam = explode("xmlmccomplexparam_",$strComplexParamName,2);
						$strComplexTag = $arrComplexParam[1]; 
						$strComplexValue = $arrComplexValue[1];


						if($strComplexTag=="fileData")
						{
							//-- give it a file name - part documenttype
							$strFileName = $strComplexValue;
							$xmlParams .= "<fileName>".utf8_encode($strFileName)."</fileName>";

							$xmlParams .= "<".$strComplexTag.">";

							$strComplexValue = _get_b64_uploadedfile_data($strFileName);

							$xmlParams .= $strComplexValue;
							$xmlParams .= "</".$strComplexTag.">"; //-- end of param
						}
						else
						{
							$xmlParams .= "<".$strComplexTag.">";
							$xmlParams .= utf8_encode($strComplexValue);
							$xmlParams .= "</".$strComplexTag.">"; //-- end of param
						}
					}
				}
				$xmlParams .= "</".$strParam.">"; //-- end of complex
			}
			else
			{
				//-- get value (use cdata so do not have to escape chars)
				if(strPos($strParam,"_complexstr")!==false)
				{
					$strParam = str_replace("_complexstr","",$strParam);

					if($strParam=="fileAttachment")
					{
						//-- need to create dom from xml string - then 
						//-- 1. get <name> tag 
						//-- 2. get file content using name and uniqueform id
						//-- 3. baseencode data and then create or update fileData tag
						//-- 4. set value to xml string
						$xmlFile = domxml_open_mem("<root>".$varValue."</root>");
						$root = $xmlFile->document_element();
						if($root)
						{
							//-- do we have an alternative file src (webclient extension only)
							$strWctSrcFile = "";
							$arrWcSrcFileName = $root->get_elements_by_tagname("wcFileSrcName");
							if($arrWcSrcFileName[0])$strWcSrcFile = $arrWcSrcFileName[0]->get_content();
							$arrFileName = $root->get_elements_by_tagname("fileName");
							$strFileName = $arrFileName[0]->get_content();
							$strFileData = "";
							if($strFileName!=="")
							{
								$strFileData = _get_b64_uploadedfile_data($strFileName,$strWcSrcFile);
							}

							//-- do we have contentId
							$varContentIDTag = "";
							$arrContentId = $root->get_elements_by_tagname("contentId");
							if($arrContentId[0])
							{
								$strContentId = $arrContentId[0]->get_content();
								if($strContentId!="")
								{
									$varContentIDTag = "<contentId>".$strContentId."</contentId>";
								}
							}

							$varValue = "<fileName>".$strFileName."</fileName><fileData>".$strFileData."</fileData>". $varContentIDTag;
						}
					}
					$xmlParams .= "<".$strParam.">";
					$xmlParams .= utf8_encode($varValue);  //-- is an xml string
					$xmlParams .= "</".$strParam.">";
				}
				else
				{
					$arrParams[$strParam] = $varValue;
					$xmlParams .= "<".$strParam.">";
					$xmlParams .= utf8_encode($varValue); 
					$xmlParams .= "</".$strParam.">";
				}
			}
		}
	}
	$xmlParams .= "</params>";
	if($boolParams) $xml.=$xmlParams;

	//-- set each data
	$bData = false;
	$xmlData = "<data>";
	foreach($_POST as $strParamName => $varValue)
	{
		if(strPos($strParamName,"_xmlmcdata_")===0)
		{
			$bData = true;
			//-- get param name - need to be able to handle param with multiple names ??!!!
			$arrParam = explode("_xmlmcdata_",$strParamName,2);
			$strParam = $arrParam[1];

			if(strPos($strParam,"__grpcounter__")!==false)
			{
				$arrParam = explode("__grpcounter__",$strParam,2);
				$strParam = $arrParam[0];
			}

			//-- get value (use cdata so do not have to escape chars)
			$xmlData  .= "<".$strParam.">";
			$xmlData  .= utf8_encode($varValue);
			$xmlData  .= "</".$strParam.">";
		}
	}
	$xmlData  .= "</data>";

	if(($bData) || ($_POST['_xmlcemptydatatags']==1)) $xml .=$xmlData;
	$xml .= "</methodCall>";

	//echo "ERROR:".$xml;
	//exit;

	//-- default port
	$boolCheckForMimeAttachments = false;
	$port = 5015;
	switch(strToLower($_POST["_xmlmcservice"]))
	{
		case "calendar":
			$port = 5013;
			break;
		case "mail":
			//-- we will want to get any mime attachments and put them on the server so webclient can access them
			$boolCheckForMimeAttachments = true; 
		case "addressbook":
			$port = 5014;
			break;
	}

	error_reporting(E_ERROR);



	//-- call xmlmc and store new esp token
	$oResult = xmlmc($portal->sw_server_ip, $port, $_SESSION['swstate'], $xml,$_POST['asjson']);
	$_SESSION['swstate']=$oResult->token;
	if($oResult->status!=200)
	{
		echo "ERROR:" . $oResult->status;
		//-- log activity
		if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
		{
			_wc_debug($portal->sw_server_ip.":".$port,$oResult->status,"XMLMC","ERROR");
		}
	}
	else
	{
		if($boolCheckForMimeAttachments)
		{
			if(strpos($oResult->content,"mimeAttachment")>1 || strpos($oResult->content,"fileAttachment")>1)
			{
				//-- response has a mimeAttachment - convert to xmldom - and copy attachment to server for passed in formid
				//-- returns new content with fileData tag content set to the server url that attachment was copied to
				$oResult->content = _save_mime_attachments_to_server(domxml_open_mem($oResult->content), $arrParams["mailbox"]);
			}
		}
		else if ($port==5015)
		{
			//-- check if we are trying to get call file attachment if so copy file to server and return modified xml to client so it know where to get it i.e. getCallFileAttachmentList 
			if($_POST["_xmlmcmethod"]=="getCallFileAttachment")
			{
				$oResult->content = _save_call_attachment_to_server(domxml_open_mem($oResult->content));
			}
		}

		//-- log any failures
		$intPos = strpos($oResult->content,'status="fail"');
		if($intPos>1)
		{
			if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
			{
				_wc_debug("Xmlc Errored With : ","\n\n".$oResult->content."\n\n","XMLMC","ERROR");
			}
		}

		//-- do we want to log all responses?
		if(defined("_LOG_WC_XMLMC_RESPONSE") && _LOG_WC_XMLMC_RESPONSE)
		{
			_wc_debug("Xmlc Response : ","\n\n".$oResult->content."\n\n","XMLMC","RESPONSE");
		}
		

		//-- echo back to client
		echo $oResult->content;

	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/swclass/xmlmethodcall/index.php","END","SERVI");
	}

	session_write_close();
?>