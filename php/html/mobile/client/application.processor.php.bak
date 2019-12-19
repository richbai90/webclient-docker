<?php

	//-- load target view and output as needed
	function _swm_parse_string($strParse)
	{
		//-- known system variables
		if(strpos($strParse,"[:_swm_app_path]")!==false)
		{
			$strParse = _get_file_loc($strParse);
		}
		$strParse = str_replace("[:_swm_path]",$_SESSION['smart_path'],$strParse);
		$strParse = str_replace("[:_swm_aid]",$_SESSION['aid'],$strParse);
		$strParse = str_replace("[:_swm_gid]",$_SESSION['gid'],$strParse);
		$strParse = str_replace("[:_swm_sqlprep_aid]",_swm_db_pfs($_SESSION['aid']),$strParse);
		$strParse = str_replace("[:_swm_sqlprep_gid]",_swm_db_pfs($_SESSION['gid']),$strParse);

		//-- now check post vars
		foreach($_POST as $strParam => $varValue)
		{
			if(strpos($strParse,"[:".$strParam."]")!==false)
			{
				$strParse = str_replace("[:".$strParam."]",$varValue,$strParse);
			}
		}
		return $strParse;
	}

	function _html_encode($strParse)
	{
		return htmlentities($strParse,ENT_QUOTES,'UTF-8');
	}

	function _html_decode($strParse)
	{
		return html_entity_decode($strParse);
		return html_entity_decode($strParse,ENT_QUOTES,'UTF-8');
	}

	function _get_file_loc($strParse)
	{
		if(strpos($strParse,"[:_swm_app_path]")!==false)
		{
			$strCustomParse = str_replace("[:_swm_app_path]",	$_SESSION['app_path']."/_custom",$strParse);
			$strCustomParse = _swm_parse_string($strCustomParse);
			if(!file_exists($strCustomParse))
			{
				$strSystemParse = str_replace("[:_swm_app_path]",$_SESSION['app_path']."/_system",$strParse);
				$strParse = _swm_parse_string($strSystemParse);
			}
			else
				$strParse = $strCustomParse;
		}
		elseif(strpos($strParse,"[:_swm_client_path]")!==false)
		{
			$strCustomParse = str_replace("[:_swm_client_path]","[:_swm_path]/client/_custom",$strParse);
			$strCustomParse = _swm_parse_string($strCustomParse);
			if(!file_exists($strCustomParse))
			{
				$strSystemParse = str_replace("[:_swm_client_path]","[:_swm_path]/client/_system",$strParse);
				$strParse = _swm_parse_string($strSystemParse);
			}
			else
				$strParse = $strCustomParse;
		}
		return $strParse;
	}

	//-- will return true or false if analyst has application right
	function haveappright($strGroup,$fRight)
	{
		$fRight--;
		$intRight = pow(2,$fRight);
		return (($intRight & $_SESSION['wc_apprights'][$strGroup])>0);
	}

	//-- will return true or false if analyst has application right
	function haveright($strGroup,$fRight)
	{
		$fRight--;
		$intRight = pow(2,$fRight);
		$_SESSION[$strGroup] = doubleval($_SESSION[$strGroup]);
		return (($intRight & $_SESSION[$strGroup])>0);
	}

	function _swm_db_pfs($strPrepare)
	{
		$strPrepare = str_replace("'","''",$strPrepare);
		return $strPrepare;
	}

	function lang_encode_from_utf($strValue)
	{
		if(function_exists("iconv"))
			return iconv('UTF-8','Windows-1252',$strValue);
		return $strValue;
	}

	//-- F0100087 - generate a random key
	function generate_secure_key($prefix = "", $intKeyLenth = 32) 
	{
		$strLegalCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		$strRandomKey = "";
		for ($i = 1; $i <= $intKeyLenth; $i++) {
			$strRandomKey .= substr($strLegalCharacters, mt_rand(0,(strlen($strLegalCharacters) - 1)), 1);
		}
		return $strRandomKey;
	}

	//-- F0100087 - check request key vs value in session
	function check_secure_key($strKeyIdentifier = "")
	{
		$boolValid = true;
		if($strKeyIdentifier=="")
			return $boolValid;

		$strRequestKey = "";
		$strSessionKey = "";

		//-- do not use gvs
		if(isset($_GET[$strKeyIdentifier])) $strRequestKey =  $_GET[$strKeyIdentifier];
		elseif(isset($_POST[$strKeyIdentifier])) $strRequestKey =  $_POST[$strKeyIdentifier];
		elseif(isset($HTTP_GET_VARS[$strKeyIdentifier])) $strRequestKey =  $HTTP_GET_VARS[$strKeyIdentifier];

		$strSessionKey = $_SESSION[$strKeyIdentifier];

		if($strSessionKey !== $strRequestKey)
			$boolValid = false;
		return $boolValid;
	}

	//-- given appid, target xml or php and action type (list, form) process data and output display according to application smart xml
	@session_start();
	//F94648
	if (!function_exists("session_regenerate_id")) {
		swphp_session_regenerate_id();
	} else {
		session_regenerate_id();
	}
	
	//F100091
	$strAppend = "";
	if($_SERVER["HTTPS"]=="on")
		$strAppend = "; Secure";
	header( "Set-Cookie: PHPSESSID=".session_id()."; HttpOnly; path=/".$strAppend );

	if(strpos(getcwd(),"\client")!==false)chdir("..");
	$_SESSION['smart_path'] = getcwd();

	include(_swm_parse_string("[:_swm_path]/_swmconfig.php"));

	function _wc_debug($p1,$p2,$p3)
	{
	}

	//-- get application .xml file and load into memory
	//-- if we cannot find the xml file then generate critical error (cannot use swsmart)
	class swObject
	{
	}

	//-- include our processors
	include('itsm_default/xmlmc/xmlmc.php');
	include("application.sqlquery.php");
	include(_get_file_loc("[:_swm_client_path]/_helpers/date.functions.php"));

	//-- process init.xml for analysts application - each application must have a init.xml
	function _swm_process_application_init_xml()
	{
		include('application.init.php');
	}

	//-- process smartform xml and output html
	function _swm_process_application_view($strTargetView)
	{
		include('application.smartform.php');
	}

	function _swm_process_client_navigation()
	{
		//-- if we cannot find the xml file then generate critical error (cannot use swsmart)
		$filepath = _swm_parse_string(_get_file_loc($_POST["_definitionfilepath"])); 
		_swm_process_application_view($filepath);
	}

	//-- process analyst login using xmlmc
	function _swm_login()
	{
		session_start();
		$_userid = $_POST["_a"];
		$_password = $_POST["_b"];

		//-- F0100097 - if login key doesnt match generated login key return
		//-- this occurs if you hit the back button after logging out (or possibly during attempted security attack)
		if($_SESSION['loginkey'] != $_POST['_lgnk'])
		{
				return "[0005] Invalid session. Please establish a session first";
		}

		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("userId",$_userid);
		$xmlmc->SetParam("password",base64_encode($_password));
		$xmlmc->Invoke("session","analystLogon");
		$strLastError = $xmlmc->GetLastError();
		if($strLastError=="")
		{
			$_SESSION['sw_sessionid'] = trim($xmlmc->content);
			$_SESSION['sessionid'] = trim($xmlmc->content);
		}

		$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
		$xmlMD = $arrDM[0];
		if($xmlMD)
		{
			$arrD = $xmlMD->get_elements_by_tagname("SessionID");
			$xmlM = $arrD[0];
			$_SESSION['sw_sessionid'] =$xmlM->get_content();
			$_SESSION['sessionid'] = $_SESSION['sw_sessionid'];
		}

		return $strLastError;
	}

	//-- if there is a call action to process
	$_SESSION['callActionErrorMsg'] = "";
	$callActionErrorMsg = "";
	if(isset($_POST["_frmaction"]))
	{
		$boolFailed = false;
		include(_get_file_loc("[:_swm_client_path]/_helpers/hd.actions.php"));
		if($boolFailed)
		{
			$strHolder = $_POST['_originfilepath'];
			$_POST['_originfilepath'] = $_POST['_definitionfilepath'];
			$_POST['_definitionfilepath'] = $strHolder;
		}
	}
	$_SESSION['callActionErrorMsg'] = $callActionErrorMsg.$strMandatory;

	//-- if there is a cmdb action to process
	$_SESSION['cmdbActionErrorMsg'] = "";
	$cmdbActionErrorMsg = "";
	if(isset($_POST["_frmcmdbaction"]))
	{
		$boolFailed = false;
		include(_get_file_loc("[:_swm_client_path]/_helpers/cmdb.actions.php"));
		if($boolFailed)
		{
			$strHolder = $_POST['_originfilepath'];
			$_POST['_originfilepath'] = $_POST['_definitionfilepath'];
			$_POST['_definitionfilepath'] = $strHolder;
		}
	}
	$_SESSION['cmdbActionErrorMsg'] = $cmdbActionErrorMsg;

	//-- get action and handle
	$_action = $_POST["_action"];
	if($_action=="_login")
	{
		$_loginRes = _swm_login();
		if($_loginRes=="")
		{
			//-- store session info
			$_SESSION['aid'] = $_POST["_a"];

			_swm_process_application_init_xml();
			_swm_process_application_view(_get_file_loc("[:_swm_app_path]/views/home.xml"));
			exit;
		}
		else
		{
			//-- login failed so go back to login page and show error
			$_SESSION['_exiterror'] = $_loginRes;
			header( 'Location: index.php' ) ;
			exit;
		}
	}
	else if($_action=="_logout")
	{

	}
	else if($_action=="_navig")
	{
		_swm_process_client_navigation();
		exit;
	}
?>