<?php
include_once('xmlmc.php'); //-- php session is started
include_once('helpers/resultparser.php'); //-- php session is started
include_once('classdatabaseaccess.php'); //-- php session is started

// Constants used by the userdb.webflag column
@define("LOGIN_FAILED_NO_SERVER",			1);
@define("LOGIN_FAILED_NOT_NOTREGISTERED",	2);
@define("LOGIN_FAILED_NO_NOACCESS",			3);
@define("LOGIN_FAILED_SERVER_ERROR",			4);
@define("LOGIN_FAILED_CHECK_CREDENTIALS",	5);
@define("ANALYST_LOGIN_OK",					6);

@define("SW_SESSION_INVALID",				1);
@define("SW_SESSION_TIMEOUT",				2);
@define("SW_SESSION_OK",						3);

class classAnalystSession
{
	// These variables are set up by the constructor of the class
	var $server_name;		// The name of the server that this session connects to
	var $app_name;			// The name of the web application (i.e. web_client)
	var $app_path;			// The root path where the web client php files are
	var $server_port;

	// The variables set up by the return of a succesfull connect or bind
	var $sessionid;			// The session id string returned by the open session
	var $sessionok=false;	// true / false session ok
	var $conid;				// The connection id string to index into the swsessions table
	var $logcallforms;		// An array of log call forms

	function GetSessionID()
	{
		return $this->sessionid;
	}
	function GetCookie()
	{
		return $this->sessionid;
	}

	function classAnalystSession($app_name, $server_name, $app_path = "", $cabVersion = "")
	{
		//-- secure or unsecured http
		$httptype = "http://";
		if($GLOBALS["HTTPS"]=="on")
		{
			$httptype = "https://";
		}

		//-- check if they are specify a specif port from the apconfig.php file
		$pos = strpos($server_name,":");
		if(is_integer($pos))
		{
			//-- use port from config file
			$this->server_name = substr($server_name,0,$pos);
			$this->server_port = substr($server_name,$pos + 1);
		}
		else
		{
			//-- port not specified (so depending on http or https set default port
			$this->server_port = ($GLOBALS["HTTPS"]=="on")?443:80;
			$this->server_name = $server_name;
		}


		if($app_path == "")
			$app_path = "/" . $app_name . "/";

		$this->sessiontimeout = 15;
		$this->app_path = $app_path;
		$this->app_name = $app_name;


		//--
		//-- SET WEBSERVER PATH / AND activexcodebase 
		$_SESSION["www_portalroot"] = $httptype. $this->server_name . ":" . $this->server_port. $app_path;
		$_SESSION['activexcodebase'] = $httptype. $this->server_name . ":" . $this->server_port.  "/sw/clients/swlcfax7.cab#version=" . $cabVersion;
		$_SESSION['server_name'] = $this->server_name;
	}

	function CreateAnalystSession($analystid, $password)
	{
		$_SESSION['cust_webflag'] = 0;

		$host = $_SESSION['server_name'];
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("userId",$analystid);
		$xmlmc->SetParam("password",base64_encode($password));
		$xmlmc->Invoke("session","analystLogon",$host);
		$strLastError = $xmlmc->GetLastError();
		if($strLastError=="")
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				$this->sessionid  =_getxml_childnode_content($xmlMD,"SessionID");
				$this->conid = _getxml_childnode_content($xmlMD,"conid");

				$_SESSION['sessionid'] = $this->sessionid;
				if($this->LoadSessionConfig())
					return ANALYST_LOGIN_OK;

				return LOGIN_FAILED_SERVER_ERROR;
			}
		}
		return LOGIN_FAILED_NO_SERVER;
	}

	function CloseSession($sessionid ="")
	{

		// If an existing session exists, close it
		if($sessionid=="")$sessionid = $this->sessionid;
		return true;
	}

	function OpenSession($sessionid)
	{
		//replace with bind session - if 
		$host = $_SESSION['server_name'];
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",PrepareForSql($sessionid));
		if($xmlmc->Invoke("session","bindSession",$host))
		{
			$strRes = $xmlmc->xmlDom->get_attribute("status");

			//xmlmc call worked, but has returned that session is false;
			if(strToLower($strRes)!="ok")
				return SW_SESSION_INVALID;
		}
		else
		{
			return SW_SESSION_INVALID;
		}

		$_SESSION['cust_webflag'] = 0;

		$xmlmc = new XmlMethodCall();
		if($sessionid!="")
			$xmlmc->SetParam("sessionId",$sessionid);
		$xmlmc->Invoke("session","getSessionInfo2",$host);
		$strLastError = $xmlmc->GetLastError();
		if($strLastError=="")
		{
			$arrDM = $xmlmc->xmlDom->get_elements_by_tagname("params");
			$xmlMD = $arrDM[0];
			if($xmlMD)
			{
				$this->sessionid  =_getxml_childnode_content($xmlMD,"sessionId");
				$this->conid = _getxml_childnode_content($xmlMD,"conid");

				$_SESSION['sessionid'] = $this->sessionid;
				if($this->LoadSessionConfig())
					return SW_SESSION_OK;

				return SW_SESSION_INVALID;
			}
		}
		return SW_SESSION_TIMEOUT;
		// code below used to perform the same functionality as createanalystsession
	}

	//-- read off database and make sure session is valid
	function IsValidSession($sessionid)
	{
		if($sessionid=="")$sessionid = $this->sessionid;
		
		$this->sessionok=false;
		$host = $_SESSION['server_name'];
		$xmlmc = new XmlMethodCall();
		if($sessionid!="")
			$xmlmc->SetParam('sessionId',$sessionid);
		if($xmlmc->Invoke("session","isSessionValid",$host))
		{
			$strRes = $xmlmc->xmlDom->get_attribute("status");

			//xmlmc call worked, and has returned that session is valid
			if(strToLower($strRes)=="ok")
				$this->sessionok=true;
		}
		return 	$this->sessionok==true;
	}

	function LoadSessionConfig()
	{
		$host = $_SESSION['server_name'];
		$xmlmc = new XmlMethodCall();
		$xmlmc->Invoke("session","getSessionInfo2",$host);
		$strLastError = $xmlmc->GetLastError();
		$appRights = Array();
		if($strLastError=="")
		{
			$sessionok = true;

			$arrRows = $xmlmc->xmlDom->get_elements_by_tagname("params");
			foreach($arrRows as $cats)
			{
				$children = $cats->child_nodes();
				$dTotal = count($children);
				$catItem = array();
				for ($i=0;$i<$dTotal;$i++)
				{
					$colNode = $children[$i];
					if($colNode->node_name()!="#text" && $colNode->node_name()!="#comment")
					{
						$strColName = $colNode->tagname();
						$strColName = strtolower($strColName);
						if($strColName=='currentdatadictionary')
							$strColName = 'dd';

						if($strColName=="analystInfo"){
							$_SESSION['wc_userdefaults'] =  _getxml_childnode_content($colNode,"UserDefaults");
							continue;
						}

						if($strColName=="appright")
						{
							$appDD = _getxml_childnode_content($colNode,"appName");
							$appRights[$appDD] = Array(); 
							$appRights[$appDD]["A"] = _getxml_childnode_content($colNode,"rightA");
							$appRights[$appDD]["B"] = _getxml_childnode_content($colNode,"rightB");
							$appRights[$appDD]["C"] = _getxml_childnode_content($colNode,"rightC");
							$appRights[$appDD]["D"] = _getxml_childnode_content($colNode,"rightD");
							$appRights[$appDD]["E"] = _getxml_childnode_content($colNode,"rightE");
							$appRights[$appDD]["F"] = _getxml_childnode_content($colNode,"rightF");
							$appRights[$appDD]["G"] = _getxml_childnode_content($colNode,"rightG");
							$appRights[$appDD]["H"] = _getxml_childnode_content($colNode,"rightH");
							continue;
						}
						$_SESSION["wc_" . $strColName] = $colNode->get_content();
						$GLOBALS["config_" . $strColName] = $colNode->get_content();
						$_SESSION[$strColName] = $colNode->get_content();
					}
				}
			}

			if(!isSet($_SESSION['wc_apprights']))
			{
				$_SESSION['wc_apprights'] = $appRights[$_SESSION['dd']];
			}
		}
		$_SESSION["wc_analystid"] = strtolower($_SESSION["wc_analystid"]);

		$dbConn = new CSwDbConnection;
		$boolConnected = $dbConn->SwCacheConnect();

		//-- nwj 23.10.2008 - load and store analysts supprot groups
		$_SESSION['wc_arr_analystgroups'] = Array();
		$_SESSION['wc_str_analystgroups'] = "";
		$_SESSION['wc_str_pfsanalystgroups'] = "";
		$strSql = "SELECT groupid from swanalysts_groups where analystid='" . PrepareForSql($_SESSION["wc_analystid"]) . "'";
		$retRS = $dbConn->Query($strSql,true);
		$x = 0;
		while(!$retRS->eof)
		{	
			$strGroupID = $retRS->f("groupid");
			$_SESSION['wc_arr_analystgroups'][$strGroupID] = true;
			//-- store comma string
			if($_SESSION['wc_str_analystgroups']!="") $_SESSION['wc_str_analystgroups'] .= ",";
			$_SESSION['wc_str_analystgroups'] .= $strGroupID;
			//-- store comma pfs string
			if($_SESSION['wc_str_pfsanalystgroups']!="") $_SESSION['wc_str_pfsanalystgroups'] .= ",";
			$_SESSION['wc_str_pfsanalystgroups'] .= "'" . $strGroupID ."'";
			$x++;
			$retRS->movenext();
		}

		swdti_load($_SESSION['wc_dd']);
		$sessionok = true;

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Log Call Form
		$dbConn = new CSwDbConnection;
		$boolConnected = $dbConn->SwCacheConnect();

		$strSQL = "SELECT FormName, FormWidth, FormHeight,CallClass FROM dd_lcf WHERE DdName = '" . PrepareForSql($_SESSION["wc_dd"]) . "'";
		$retRS = $dbConn->Query($strSQL,true);
		$x = 0;
		while(!$retRS->eof)
		{	
			$this->logcallforms[$x] = $retRS->f("callclass") . "," . $retRS->f("formname");
			$this->logcallforms_size[$retRS->f("formname")] = $retRS->f("formwidth") . "," . $retRS->f("formheight");
			$x++;
			$retRS->movenext();
		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Details Call Form
		$strSQL = "SELECT FormName,CallClass, FormWidth, FormHeight FROM dd_cdf WHERE DdName = '" . PrepareForSql($_SESSION["wc_dd"]) . "'";
		$retRS = $dbConn->Query($strSQL,true);
		$x = 0;
		while(!$retRS->eof)
		{	
			$this->calldetailsforms[$retRS->f("callclass")] = $retRS->f("formname");
			$this->calldetailsforms_size[$retRS->f("callclass")] = $retRS->f("formwidth") . "," . $retRS->f("formheight");
			$x++;
			$retRS->movenext();
		}


		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Standard Form
		$strSQL = "SELECT FormName, ClassName, FormWidth, FormHeight FROM dd_stdf WHERE DdName = '" . PrepareForSql($_SESSION["wc_dd"]) . "' order by formname";
		$retRS = $dbConn->Query($strSQL,true);
		while(!$retRS->eof)
		{	
			$strName = $retRS->f("formname");
			$strClass = $retRS->f("classname");
			$arrKey = ($strClass=="")?$strName:$strClass;

			$this->standardforms[$arrKey] = $retRS->f("formname");
			$this->standardforms_size[$arrKey] = $retRS->f("formwidth") . "," . $retRS->f("formheight");
			$retRS->movenext();
		}

		return $sessionok;
	}


	//-- nwj - 04.01.2008 - change : if there is no form defined then 
	//-- return false. We can then use this in the portal to alert user
	function GetCallDetailsFormName($callclass)
	{
		$name = $this->calldetailsforms[$callclass];
		if($name == "") return false;
		return $name;
	}

	function GetCallDetailsFormSize($callclass)
	{
		$fnSize = $this->calldetailsforms_size[$callclass];
		if(strlen($fnSize) == 0)
			$fnSize = "500,400";
		return $fnSize;
	}

	function GetStandardFormName($callclass)
	{
		$name = $this->standardforms[$callclass];
		if(strlen($name) == 0)
		{
			// dont know what to do apart of return an error...
		}
		return $name;
	}

	function GetStandardFormSize($callclass)
	{
		$fnSize = $this->standardforms_size[$callclass];
		if(strlen($fnSize) == 0)
			$fnSize = "500,400"; // default size
		return $fnSize;
	}

	function GetLogCallFormNames()
	{
		return $this->logcallforms;
	}

	function GetLogCallFormSize($formname)
	{
		$fnSize = $this->logcallforms_size[$formname];
		if(strlen($fnSize) == 0)
			$fnSize = "500,400";
		return $fnSize;
	}

	function BuildCallListSql(&$filter, &$sql)
	{
		$sql = "SELECT opencall.callref, opencall.status, opencall.callclass, opencall.logdatex, ";
		$sql .= "opencall.owner, updatedb.updatetxt AS updatetxt FROM opencall, updatedb ";
		if ($filter == 'unassigned')
		{
			$sql .= "where owner = '' and ";
			$sql .= "suppgroup = '";
			$sql .= $GLOBALS["config_groupid"];
			$sql .= "' and ";

		}
		else
		{
			$sql .= "where owner = '";
			$sql .= $GLOBALS["config_analystid"];
			$sql .= "' and ";

		}
		if($filter == 'pending')
			$sql .= "opencall.status = 1";
		else
		if($filter == 'resolved')
			$sql .= "opencall.status = 6";
		else
		if($filter == 'onhold')
			$sql .= "opencall.status = 4";
		else
		if($filter == 'unassigned')
			$sql .= "opencall.status = 2";
		else
		if($filter == 'unaccepted')
			$sql .= "opencall.status = 3";
		else
			$sql .= "opencall.status < 16 AND opencall.status <> 6";
		$sql .= " and updatedb.callref = opencall.callref and updatedb.udindex = 0 GROUP BY callref";
	}

	function IsMSIE()
	{
		if(preg_match("/MSIE/i", $GLOBALS["HTTP_USER_AGENT"]))
			return TRUE;
		return FALSE;
	}

	function IsNetscape()
	{
		if(preg_match("/Mozilla\/4.7/i", $GLOBALS["HTTP_USER_AGENT"]) || preg_match("/Netscape/i", $GLOBALS["HTTP_USER_AGENT"]))
			return TRUE;
		return FALSE;
	}

	function IsNetscape4()
	{
		if(preg_match("/Mozilla\/4.7/i", $GLOBALS["HTTP_USER_AGENT"]))
			return TRUE;
		return FALSE;
	}

	function IsNetscape6()
	{
		if(preg_match("/Mozilla\/6/i", $GLOBALS["HTTP_USER_AGENT"]))
			return TRUE;
		return FALSE;
	}

	// Glen: Changed input variable from $usr to $str and commented out 2 lines to fix a bug in the analyst portal
	// whereby it would only work on port 80. This will fix the bug elsewhere also.
	function UrlRedirect($str, $errormsg = "")
	{
//		$host = $GLOBALS["SERVER_NAME"];
//		$str = "http://" . $host . $this->app_path . $url;
		if(strlen($errormsg))
			$str .= "?errormsg=" . rawurlencode($errormsg);
		if($this->IsMSIE())
		{
			header("Location: " . $str);
			header("Window-target: _top");
		}
		else
		{
			echo "<html><meta http-equiv=\"refresh\" content=\"0;URL=" . $str . "\"></html>";
			echo "<html><meta http-equiv=\"Window-target\" content=\"_top\"></html>";
		}
	}
}

?>