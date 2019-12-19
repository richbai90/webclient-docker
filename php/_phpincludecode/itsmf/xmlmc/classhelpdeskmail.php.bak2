<?php

//-- check to see if these are set before setting them
@define("CS_HDCON_OK",			33);
@define('_SERVER_NAME', '127.0.0.1');


//-- class to handle emailing
class classHelpdeskMail
{
	var $LastError;
	var $resultitemarray;
	var $attachmentlist;
	var $recipientlist;

	//-- get return value from helpdesk session
	function GetReturnValue($name)
	{
		return $this->resultitemarray[$name];
	}

	//-- add an attachment to array - these are attached during email process
	function AddAttachment($file,$displayname)
	{
		if(strlen($file) == 0 || strlen($displayname) == 0 )
			return;

		$this->attachmentlist[$file] = $displayname;
	}

	//-- class = "to", "from", "cc", "bcc"
	//-- transport = "inet", "local", "exchange", "notes"
	function AddRecipient($name, $address, $class = "to", $transport = "inet")
	{
		$tmp = $class . ":" . $address;
		$tmp2 = $transport . ":" . $name;
		
		$this->recipientlist[$tmp] = $tmp2;
	}

	//-- send an email - must provide a helpdesk mail connect (this is created using classhdsession
	function SendEmail($con, $subject, $body, $mailbox, $boolCloseCon = true)
	{
		if(count($this->recipientlist) == 0)
		{
			$this->LastError = "No recipients have been set for this message.";
			return FALSE;
		}
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam('mailbox',$mailbox);
		//-- Send our recipient data.
		if(count($this->recipientlist))
		{
			reset($this->recipientlist);
			while(list($key, $val) = each($this->recipientlist))
			{
				if(strlen($key))
				{
					$x = strpos($key, ":");

					$class = substr($key, 0, $x);
					$address = substr($key, $x+1);

					$x = strpos($val, ":");

					$transport = substr($val, 0, $x);
					$name = substr($val, $x+1);
					$strRecipient = "<class>".pfx($class)."</class>";
					$strRecipient .= "<address>".pfx($address)."</address>";
					$strRecipient .= "<name>".pfx($name)."</name>";
					$strRecipient .= "<transport>".pfx($transport)."</transport>";
					$xmlmc->SetComplexParam("recipient",$strRecipient);
				}
			}
		}

		$xmlmc->SetParam('subject',$subject);
		$xmlmc->SetParam('priority',3);
		$xmlmc->SetParam('body',$body);

		//-- Send our attachment data.
		if(count($this->attachmentlist))
		{
			reset($this->attachmentlist);
			while(list($key,$val) = each($this->attachmentlist))
			{
				$strFile = file_get_contents($key);
				$strB64File = base64_encode($strFile);
				$strEmbbededFile ="";
				if($file_name!="")
				{
					$strEmbbededFile = "<fileName>".pfx($val)."</fileName><fileData>".$strB64File."</fileData>";
					if($mimeType!="")
						$strEmbbededFile .= "<mimeType>".$mimeType."</mimeType>";
				
				}
			}
		}
		
		if($xmlmc->Invoke("mail","sendMessage"))
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				$children = $xmlMD->child_nodes();
				$dTotal = count($children);
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$this->resultitemarray[$strColName] = $colNode->get_content();
					}
				}
			}
		}
		else
		{
			$this->LastError = $xmlmc->GetLastError();
			return false;
		}
		return true;
	}

}
?>