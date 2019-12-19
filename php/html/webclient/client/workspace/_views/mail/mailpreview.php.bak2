<!-- preview form for email - should just be php and html - no js or css definitions in form file -->
<?php
		//-- if no values we are not loading anything so exit
	if(@$_REQUEST["emailid"]=="" && @$_REQUEST["mailbox"]=="") exit;
	
	error_reporting(E_ERROR);
	include('../../../../php/session.php');

	$strEmailBody = "";
	$msgfrom = "";
	$msgsubject = "";

	//-- get email message info - note any att will have already been created by client event of clicking on a row.
	$xml="<?xml version='1.0' encoding='utf-8'?><methodCall service='mail' method='getMessage'><params><mailbox>".$_REQUEST["mailbox"]."</mailbox><messageId>".$_REQUEST["emailid"]."</messageId></params></methodCall>";
	$oResult = xmlmc($portal->sw_server_ip, "5014", $_SESSION['swstate'], $xml);

	if($oResult->status==200)
	{
		//-- create xmldom so we can get info
		$xmlMessage = domxml_open_mem($oResult->content);

		//-- get email body
		$arrHTMLBody = $xmlMessage->get_elements_by_tagname('htmlBody');
		if($arrHTMLBody[0])
		{
			$strEmailBody = $arrHTMLBody[0]->get_content();
			//-- remove any items defined by customers
			if (defined('_EMAIL_PURIFY_TAGS'))
			{
				$arrItems = explode(",",_EMAIL_PURIFY_TAGS);
				$count = count($arrItems);
		        for($i=0;$i<$count;$i++)
				{
					if(trim($arrItems[$i])=="") continue;
					$strEmailBody =  preg_replace('/<'.trim($arrItems[$i]).'\b[^>]*>(.*?)<\/'.trim($arrItems[$i]).'>/is', "", $strEmailBody); 
				}
			}

			//-- replace <script> and <iframe> and other common html tags
			$strEmailBody =  preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $strEmailBody); 
			$strEmailBody =  preg_replace('/<iframe\b[^>]*>(.*?)<\/iframe>/is', "", $strEmailBody); 
			$strEmailBody =  preg_replace('/<input\b[^>]*>(.*?)<\/input>/is', "", $strEmailBody); 
			$strEmailBody =  preg_replace('/<button\b[^>]*>(.*?)<\/button>/is', "", $strEmailBody); 
			$strEmailBody =  preg_replace('/<object\b[^>]*>(.*?)<\/object>/is', "", $strEmailBody); 

		}

		if($strEmailBody=="")
		{
			$arrHTMLBody = $xmlMessage->get_elements_by_tagname('body');
			if($arrHTMLBody[0])
			{
				//-- so looks like client - and remove any injection
				$strEmailBody = str_replace("\n","<br/><br/>",htmlentities($arrHTMLBody[0]->get_content()));		
			}
		}
		//-- end of get body


		//-- web path for files that are inline
		if(defined("_PROXYPASSNAME"))
		{
			//-- using a proxy server use its address
			$weburl =  "../../../../temporaryfiles/" . $_SESSION['swsession'] . "/email";
		}
		else
		{
			$weburl =  $portal->root_path ."temporaryfiles/" . $_SESSION['swsession'] . "/email";
		}

		$weburl = str_replace("\\","/",$weburl);



		//-- get attachments links - inline content has already been done
		$strAttachmentLinks = "";
		$arrFileAtts = $xmlMessage->get_elements_by_tagname('fileAttachment');
		foreach($arrFileAtts as $iPos => $xmlFileAtt)
		{
			//-- get file name and get data (b64 unencode it)
			$arrFN = $xmlFileAtt->get_elements_by_tagname('fileName');
			$fileName = $arrFN[0]->get_content();
			$arrFD = $xmlFileAtt->get_elements_by_tagname('fileSource');
			$fileSourceID = $arrFD[0]->get_content();
			$arrCID= $xmlFileAtt->get_elements_by_tagname('contentId');
			$strCID = $arrCID[0]->get_content();
			
			//-- if an attachment and not a inline content
			if($strCID=="")
			{
				$strAttachmentLinks .= "<a href='#' style='font-size:10px;padding-right:4px;float:left;' onClick='top._email_open_attachment(this);' fileid='".$fileSourceID."' filename='".$fileName."'>".$fileName."</a>";
			}
			else
			{
				//-- inline content - find content id in msgbody and replace
				$fileName = "mime.".$iPos.".".$fileName; 
				$fileUrl = $weburl ."/".rawurlencode(trim($fileName));
				$strEmailBody = str_replace("cid:" . $strCID,$fileUrl,$strEmailBody);		
			}
		}
		//-- eof att links

		//-- from and subject
		$arrFrom = $xmlMessage->get_elements_by_tagname('senderName');
		if($arrFrom[0])
		{
			$msgfrom = $arrFrom[0]->get_content();
		}

		$arrSub = $xmlMessage->get_elements_by_tagname('subject');
		if($arrSub[0])
		{
			$msgsubject = $arrSub[0]->get_content();
		}
	}

?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<style>

		body
		{
			padding:0px;
			margin:0px;
			background-color:#efefef;
			overflow:hidden;
		}

		#email_holder
		{
			background-color:#ffffff;
			border:0px solid #000000;
			padding:5px 5px 5px;
			height:100%;
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
			font-size:10px;
		}
		#email_subject
		{
			padding:5px 5px 5px 5px;
			font-weight:bold;
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
			font-size:10px;
		}
		#email_from
		{
			padding:5px 5px 5px 5px;
			font-weight:bold;
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
			font-size:10px;
		}
		

		#email_attach
		{
			padding:5px 5px 5px 5px;
			font-weight:bold;
			border-bottom:1px solid #000000;
			font-family:Verdana,sans-serif;letter-spacing:.03em;
			font-size:10px;
			height:35px;
			overflow:auto;

		}

		#email_body
		{
			overflow:auto;
			margin-top:5px;
			padding:5px 5px 5px 5px;
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
		}

		a
		{
			font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
			font-size:12px;
		}
	</style>

	<script>

		function getPageSize(boolWithScroll)
		{     
			var intWidth = 0;
			var intHeight = 0;

			if(boolWithScroll==undefined)boolWithScroll=false;
			if (window.innerHeight && window.scrollMaxY) 
			{
				//-- Firefox         
				var intScrollY = (boolWithScroll)?window.scrollMaxY:0;
				var intScrollX = (boolWithScroll)?window.scrollMaxX:0;
				intHeight = window.innerHeight + intScrollY;
				intWidth = window.innerWidth + intScrollX;     
			} 
			if (document.body.scrollHeight > document.body.offsetHeight)
			{ 
				//-- all but Explorer Mac         
				if(boolWithScroll)
				{
					intHeight = document.body.scrollHeight;         
					intWidth = document.body.scrollWidth;     
				}
				else
				{
					intHeight = document.body.offsetHeight;         
					intWidth = document.body.offsetWidth;       
				}
			} 
			else 
			{ 
				//-- works in Explorer 6 Strict, Mozilla (not FF) and Safari         
				intHeight = document.body.offsetHeight;         
				intWidth = document.body.offsetWidth;       
			}     
			
			var info = new Object();
			info.width = intWidth;
			info.height = intHeight;
			return info;
		} 

		function resize_me()
		{
			var pageI = getPageSize(false)
			var bodyHeight = pageI.height;
			var bodyWidth = pageI.width;
			var subjectHeight = document.getElementById("email_subject").offsetHeight;
			var fromHeight = document.getElementById("email_from").offsetHeight;
			var eleMsg = document.getElementById("email_body");

			var iAttHeight = 0;
			var attDiv = document.getElementById("email_attach");
			if(attDiv)iAttHeight=attDiv.offsetHeight;

			try
			{
				var iha = 40; //(top.isIE)?40:49;
				eleMsg.style.height = bodyHeight - subjectHeight - fromHeight - iha - iAttHeight;
				eleMsg.style.width =  bodyWidth - 20;//document.getElementById("email_holder").offsetWidth-20;
				document.getElementById("email_from").style.width =  bodyWidth - 20;//document.getElementById("email_holder").offsetWidth-15;
			}
			catch(e){}

		}
	</script>
</head>
<body onload="resize_me();" onresize="resize_me();">
<div id='email_holder'>
	<div id='email_subject'><?php echo htmlentities($msgsubject);?></div>
	<?php	if(@$strAttachmentLinks!="")
		{
	?>
		<div id='email_from'>From : <?php echo htmlentities($msgfrom);?></div>
		<div id='email_attach'><span style='float:left;'>Attachments :&nbsp;</span><?php echo $strAttachmentLinks;?></div>
	<?php
		}
		else
		{
	?>
			<div id='email_from' style='border-bottom:1px solid #000000;'>From : <?php echo htmlentities($msgfrom);?></div>
	<?php
		}
	?>
	<div id='email_body'><?php echo $strEmailBody;?></div>
</div>
</body>
</html>