<?php

	//-- call remote query for sqlquery class
	include('../../php/session.php');
	include('../../php/db.helpers.php');
	

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/remotequery/index.php","START","SERVI");
	}


	//-- sys array for use by internal processor (in case apps dev use same var names)
	$_core = Array();
	$_core['_nexttoken'] = NULL;

	//--
	//-- include helper functions
	include('helpers.php');

	error_reporting(E_ERROR | E_WARNING | E_PARSE);
	
	//-- 
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("WC-RemoteQuery:".$_POST['espQueryName'],"START","SERVI");
	}
	
	//-- ensure script name does not have ".." in it
	if(strpos($_POST['espQueryName'],"..")!==false)
	{
		//-- invalid name (trying to traverse dir)
		echo generateCustomErrorString("-301","The specified query script is invalid. Please contact your Administrator.");
		exit(0);
	}

	//-- ensure have sessionid
	if(!isset($_POST['sessid']))
	{
		echo generateCustomErrorString("-300","A valid session token was not provided. Please contact your Administrator.");
		exit(0);
	}

	//--
	//-- check some of the required params
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("sessionId",$_POST["sessid"]);
	if(!$xmlmc->invoke("session","bindSession"))
	{
		echo $xmlmc->xmlresult;
		exit(0);
	}

	//-- get session info using xmlmc - use existing session id
	$xmlmc = new XmlMethodCall();
	if(!$xmlmc->invoke("session","getSessionInfo2"))
	{
		echo $xmlmc->xmlresult;
		exit(0);
	}

	//-- store session info in a php session object so apps dev have easy access 
	//-- session class provides same info as the swjs class
	$session = generatesessionobject($xmlmc->xmldom);

	//-- check script exists
	$applicationEspQueryFile = $_POST['espQueryName'] .".php";
	if(!file_exists($applicationEspQueryFile))
	{
		echo generateCustomErrorString("-302","The specified query script [". $_POST['espQueryName'] ."] could not be found. Please contact your Administrator");
		exit(0);
	}	

	//-- include the script which should set a var $sqlCommand
	$sqlDatabase = swfc_source();
	$sqlCommand  = "";
	include($applicationEspQueryFile);

	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("database",$sqlDatabase);
	$xmlmc->SetParam("query",$sqlCommand);

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug($sqlDatabase.":".$sqlCommand,"QUERY","SERVI");
	}


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/remotequery/index.php","END","SERVI");
	}

	//--
	//-- running in context of wc form control (like wc sqllist table)
	if(isset($swfc) && $swfc=='1')
	{
		$xmlmc->SetParam("formatValues","true");
		$xmlmc->SetParam("returnMeta","false");
		$xmlmc->SetParam("returnRawValues","true");
		$xmlmc->invoke("data","sqlQuery");
	}
	else
	{
		//-- sqlquery.RemoteQuery or similar so just dump out data
		$xmlmc->SetParam("formatValues","true");
		$xmlmc->SetParam("returnMeta","true");
		$xmlmc->SetParam("returnRawValues","true");
		$xmlmc->invoke("data","sqlQuery",$_POST['asjson']);
		echo $xmlmc->xmlresult;
		exit(0);
	}
?>