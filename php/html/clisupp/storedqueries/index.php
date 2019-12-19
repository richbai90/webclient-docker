<?php

	/**
	 * Simple function to replicate PHP 5 behaviour
	 */
	function microtime_float()
	{
	    list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec + (float)$sec);
	}
	//-- sys array for use by internal processor (in case apps dev use same var names)
	$_core = Array();
	$_core['_nexttoken'] = NULL;
	$_core['_sessioninfo'] = NUll;

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
	//-- Include helpers.php
	// -- Function to return a value from a string
	function getTextBetweenTags($string, $tagname) 
	{
		$pattern = "/<$tagname>(.*?)<\/$tagname>/";
		preg_match($pattern, $string, $matches);
		return $matches[1];
	}	
	// -- Get the Data Dictionary name from POST['sessioninfo2'] and set helpers include path
	$strCurrentDataDictionary = getTextBetweenTags($_POST['sessioninfo2'], "currentDataDictionary");
	if($strCurrentDataDictionary!="" && file_exists($includepath.$strCurrentDataDictionary.'/helpers.php'))
	{
		include($includepath.$strCurrentDataDictionary.'/helpers.php');
	}
	else
	{
		include($includepath.'helpers.php');
	}
	
	//--
	//-- bind to session - if we do not have session state
	if(isset($_SESSION['swstate']))
	{
		$_core['_nexttoken'] = $_SESSION['swstate'];
	}
	else if(isset($_COOKIE['ESPSessionState']))
	{
		$_core['_nexttoken'] = $_COOKIE['ESPSessionState'];
	}
	else
	{
		//-- check for EspSessionState cookie (from c++)
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$_POST["sessid"]);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}
	}

	//-- get session info
	global $session;
	$session = loadSessionInfo();

	//-- Check if a WSS Session
	if(isset($session->selfServiceCustomerId))
	{
		if($session->selfServiceCustomerId != '')
		{
			//-- Check Folder Being Called
			$string = strtolower(trim($_POST['espQueryName']));
			
			/* Keep the new SelfService stored queries separate from those of the existing Mobile SelfService
		
			$pos = strpos($string, "query/wssm/");
			if ($pos === false) */
			
			$wssFolder =  strpos($string, "query/wss/");
			$wssMobileFolder = strpos($string, "query/wssm/");
			if ($wssFolder === false && $wssMobileFolder === false) 
			{
				//-- Not looking in query/wssm/
				echo generateCustomErrorString("-303","The specified query script is invalid for your session. Please contact your Administrator.");
				exit(0);
			} 
		}
	}
	
	//-- load default ddf info (for col type checking etc)
	swdti_load("default");
	
	// -- Recreate sqsstore.ser (table file) if it doesn't exist and store full db info for both databases
	$sharedData = @file_get_contents($includepath."sqsstore.ser");
	if($sharedData===false)
	{
		getTablePrimaryKeyName("opencall","swdata");
		getTablePrimaryKeyName("opencall","sw_systemdb");
	}
	// -- Set value for tablekey_sw_systemdb_opencall in sqsstore.ser if it isn't set
	$sharedData = getSharedData();
	if(!isset($sharedData->tablePrimaryKeys['tablekey_sw_systemdb_opencall']))
	{
		getTablePrimaryKeyName("opencall","sw_systemdb");
	}

	//-- check script exists (not fullclient prefixes query record or execute based on sqlclass being used)
	//-- but apps dev best practive is to put all swjs sql into query folder.
	$strScriptName = trim($_POST['espQueryName']); //-- remove any pre/post whitespace
	if(strpos($_POST['espQueryName'],".php")===false)$strScriptName .= ".php";

	//-- check if running for picklist - if so set flag 
	$swfc_picklist=(strpos(strtolower($_POST['espQueryName']),"distinctpicklist/")===false)?0:1;

	$aReplace = array("record/","execute/");
	$alternativeScript = str_replace($aReplace,"query/",strtolower($strScriptName));

	$applicationEspQueryFile = $includepath.$session->currentDataDictionary."/". $strScriptName;
	$altEspQueryFile = $includepath.$session->currentDataDictionary."/". $alternativeScript;
	if(!file_exists($applicationEspQueryFile) && !file_exists($altEspQueryFile))
	{
		//-- check if in all data dictionaries
		$applicationEspQueryFile = $includepath."All Data Dictionaries/". $strScriptName;
		$altEspQueryFile = $includepath."All Data Dictionaries/". $alternativeScript;
		if(!file_exists($applicationEspQueryFile) && !file_exists($altEspQueryFile))
		{
			echo generateCustomErrorString("-302","The specified query script [". $alternativeScript . "] could not be found. Please contact your Administrator");
			exit(0);
		}
		else if(!file_exists($applicationEspQueryFile))
		{
			$applicationEspQueryFile = $altEspQueryFile;
		}
	}	
	else if(!file_exists($applicationEspQueryFile))
	{
		$applicationEspQueryFile = $altEspQueryFile;
	}

	$dbs = new dd();

	//-- include the script which should set a var $sqlCommand and optionally $sqlDatabase
	$sqlDatabase = swfc_source();
	$sqlCommand  = "";


	include($applicationEspQueryFile);

	//-- handle instance we dev has set alt name 
	if($sqlDatabase=="syscache"||$sqlDatabase=="swcache")$sqlDatabase = "sw_systemdb";
	
	//-- nwj - parse out $sqlCommand for any inline params ( optional = :[paramname] mandatory = ![paramname])
	//-- for example "select * from opencall where callref in (![crs:array])
	//-- which means get $_POST['crs'] and split it by , and pfs and inject
	$sqlCommand = parseEmbeddedParameters($sqlCommand);

	//-- check if we want to return meta data
	$bReturnMeta = ($_POST['incmetadata']=="1")?"true":"false";
	$bWebclient = (parseBool($_POST['asjson']))?true:false;
    $bformatValues = ($bWebclient || $_POST["fmtval"]=="1")?"true":"false";

	//--
	//-- running in context of wc form control (like wc sqllist table)
	if(isset($swfc) && $swfc=='1')
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("database",$sqlDatabase);
		$xmlmc->SetParam("query",$sqlCommand);
		$xmlmc->SetParam("formatValues","true");
		$xmlmc->SetParam("returnMeta","false");
		$xmlmc->SetParam("returnRawValues","true");
		$xmlmc->invoke("data","sqlQuery");
	}
	else
	{
		if($bWebclient)
		{
			//-- webclient
			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("database",$sqlDatabase);
			$xmlmc->SetParam("query",$sqlCommand);
			$xmlmc->SetParam("formatValues",$bformatValues);
			$xmlmc->SetParam("returnMeta",$bReturnMeta);
			$xmlmc->SetParam("returnRawValues","true");
			$xmlmc->invoke("data","sqlQuery",$bWebclient);
			echo $xmlmc->xmlresult;
			exit(0);
		}
		else
		{
			//-- just pass back sql statement and optiona as headers and xmlmc will run sqlquery using this info 
			//$time_end = microtime_float();
			//$time = $time_end - $time_start;
			//echo "Php engine tool $time seconds to echo response headers\n";

			header('Content-type: text/sql');
			header('esp-x-database: '.$sqlDatabase);
			header('esp-x-format-values: '. $bformatValues);
			header('esp-x-return-meta-data: '.$bReturnMeta);
			header('esp-x-max-results: 0');
			header('esp-x-return-raw-values: '.$bReturnMeta);
			echo $sqlCommand;
			exit(0);
		}
	}

?>