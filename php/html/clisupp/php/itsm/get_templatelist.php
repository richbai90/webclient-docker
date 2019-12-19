<?php
	//-- F0100866
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php'); //-- php session is started
	include_once('itsm_default/xmlmc/classhelpdeskmail.php');
	include_once('itsm_default/xmlmc/helpers/resultparser.php'); //-- php session is started
	
	$mailboxname = gv('mailboxname');
	$sessid = gv('sessid');
	$strList = "";
	if($sessid!="")
	{
		$hdSession = new classActivePageSession($sessid);		
		$hdMail = new classHelpdeskMail();
		$strList .= $hdMail->getTemplateList($mailboxname, 8192);
	}
	echo $strList;
?>