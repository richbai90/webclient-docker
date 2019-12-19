<?php

	//-- used to call apps dev scripts in clisupp/storedqueries

	//-- validate webclient client session
	include('../../php/session.php');

	error_reporting(E_ERROR | E_WARNING | E_PARSE);
	
	//-- get sessioninfo2 - only get once and then store in session
	if(!isset($_SESSION["getsessioninfo2"]))
	{
		$xmlmc = new XmlMethodCall();
		if(!$xmlmc->invoke("session","getSessionInfo2"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}
		else
		{
			$_SESSION["getsessioninfo2"] = $xmlmc->xmlresult;
		}
	}

	$_POST["sessioninfo2"] = $_SESSION["getsessioninfo2"];

	//-- now include clisupp/storedqueries/index.php
	$includepath = '../../../clisupp/storedqueries/';
	include('../../../clisupp/storedqueries/index.php');

?>