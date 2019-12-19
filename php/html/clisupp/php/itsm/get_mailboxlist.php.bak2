<?php
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php'); //-- php session is started
	include_once('itsm_default/xmlmc/classhelpdeskmail.php');
	include_once('itsm_default/xmlmc/helpers/resultparser.php'); //-- php session is started
	
	$sessid = gv('sessid');
	$hdSession = new classActivePageSession($sessid);

	$hdMail = new classHelpdeskMail();
	$strList .= $hdMail->getMailboxList("", 2, false, "");
	echo $strList;
?>