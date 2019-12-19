<?php
	session_start();

	$_SESSION['portalmode'] = "FATCLIENT";
	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/helpers/lib_curl.php');

	function database_connect($strDSN, $strUID = "", $strPWD = "")
	{
		//-- create or share a connection
		$dsnName = strtolower($strDSN);
		if(isset($GLOBALS['activepageconnections'][$dsnName]))
		{
			//-- share conn
			$tableODBC = $GLOBALS['activepageconnections'][$dsnName];
		}
		else
		{
			//-- connect
			$tableODBC = new CSwDbConnection;
			if(strToLower($strDSN)=="swdata")
			{
				$strDSN = swdsn();
				$strUID=swuid();
				$strPWD=swpwd();
			}
			else if(strToLower($strDSN)=="syscache")
			{
				$strDSN = "Supportworks Cache";
				$strUID = swcuid();
				$strPWD = swcpwd();
			}

			if($tableODBC->Connect($strDSN,$strUID,$strPWD)==false)
			{
				return false;
			}		

			$GLOBALS['activepageconnections'][$dsnName] = $tableODBC;
		}

		return $tableODBC;
	}

	# Get passed in params (analyst id, support tool name, request reference (encoded for use with webclient which will strip params otherwise)
	$params = base64_decode(gv("encodedparams"));
	$arrParams = explode("%26",$params);
	foreach($arrParams as $param)
	{
		$arrTemp = explode("%3D",$param);
		$arrParam[$arrTemp[0]] = urldecode($arrTemp[1]);
	}
	
	$analyst_sessid = $arrParam["sessid"];
	$request_ref = $arrParam["in_requestref"];
	$analystid = $arrParam["in_analyst"];
	$rstool = $arrParam["in_rstool"];

	//create_session("","",$analyst_sessid);
	$sessid = $_GET['sessid'];

	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);
	//-- Initialise the session
	$session->IsValidSession();

	$swDBConn = database_connect("swdata");

	$url = "";
	$username = "";
	$password = "";
	$type = "";

	$strSQL = "select type, url, api_username, api_password from remote_support where name = '".pfs($rstool)."'";
	$retRS1 = $swDBConn->query($strSQL,true);
	if(!$retRS1->eof)
	{
		$type = $retRS1->f('type');
		$url = $retRS1->f('url');
		$username = $retRS1->f('api_username');
		$password = $retRS1->f('api_password');
	}

	$fullURL = "";
	switch($type)
	{
		case "BOMGAR":
			$fullURL = $url."/api/command.ns?username=".$username."&password=".$password."&action=generate_session_key&type=support&queue_id=general&external_key=".$request_ref."#".$analyst_sessid;
			break;
		default:
			 return "";
	}


	#  access the protected resource
	$ret = api_http_request($fullURL);
	if (!strlen($ret)) echo "Failed to get results from Remote Support API";
	
	# Get User Info from XML
	$arrResults = array();
	$arrResults["type"] = getResultVar('xml',$ret,"type");
	$arrResults["ttl"] = getResultVar('xml',$ret,"ttl");
	$arrResults["expires"] = getResultVar('xml',$ret,"expires");
	$arrResults["queue"] = getResultVar('xml',$ret,"queue");
	$arrResults["queue_id"] = getResultVar('xml',$ret,"queue_id");
	$arrResults["external_key"] = getResultVar('xml',$ret,"external_key");
	$arrResults["short_key"] = getResultVar('xml',$ret,"short_key");
	$arrResults["key_url"] = getResultVar('xml',$ret,"key_url");
	$arrResults["mail_subject"] = getResultVar('xml',$ret,"mail_subject");
	$arrResults["mail_body"] = getResultVar('xml',$ret,"mail_body");

	$strHTML = "<data>";
	foreach($arrResults as $key=>$val)
	{
	$strHTML .= "<".$key.">".$val."</".$key.">";
	}
	$strHTML .= "</data>";
	echo 	$strHTML;
	exit;
?>