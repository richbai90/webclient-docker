<?php

	//--
	//-- given formid, and comma set filesrc get email attachments and output to temp files folders for given formid
	//-- this is used for lcf and email forwarding i.e. want to log call with email attachments


include("../../../php/session.php");
error_reporting(E_ERROR);


//-- log activity
if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
{
	_wc_debug("service/email/getemailattachmentsforform/index.php","START","SERVI");
}	

$mailbox = $_POST['_mailbox'];
$arrfileids = explode(",",$_POST['_fileids']);

if(count($arrfileids)>0)
{
	//-- session temp file path
	$destination_path = $portal->fs_root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/" . $_POST["_uniqueformid"];
	$destination_path = str_replace("\\","/",$destination_path);

	//-- make directory path in app root working dir
	RecursiveMkdir($destination_path);

	//-- for each file id
	foreach($arrfileids as $pos =>$fileid)
	{
		//-- call xmlmc and store new esp token
		$strxml = "<?xml version='1.0' encoding='utf-8'?><methodCall service='mail' method='getMailFileAttachment'><params><mailbox>".$mailbox."</mailbox><fileSource>".$fileid."</fileSource></params></methodCall>";
		$oResult = xmlmc($portal->sw_server_ip, 5014, $_SESSION['swstate'], $strxml);
		$SESSION['swstate'] = $oResult->token;
		if($oResult->status!=200)
		{
			echo "Unable to load file attachment. Please contact your administrator.<br><br>" . $oResult->status . $oResult->content;
			exit;
		}
		else
		{
			if (!$dom = domxml_open_mem($oResult->content)) 
			{
			  echo "Unable to parse xmlmc getMailFileAttachment return content. Please Contact your administrator.";
			  exit;
			}

			//-- get data
			$root = $dom->document_element();
			$xData = $root->get_elements_by_tagname("fileData");
			$buff = base64_decode($xData[0]->get_content()); //-- core product issue here - data is compressed
			$xName = $root->get_elements_by_tagname("fileName");
			$filename = $xName[0]->get_content();

			//-- output data to temporary file location for given formid
			$target_path = $destination_path . "/". basename($filename);
			sw_file_put_contents($target_path, $buff);

			//-- log activity
			if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
			{
				_wc_debug($target_path,"copiedfile","SERVI");
			}	
		}
	}
}
echo "ok";

//-- log activity
if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
{
	_wc_debug("service/email/getemailattachmentsforform/index.php","END","SERVI");
}	


exit;
?>