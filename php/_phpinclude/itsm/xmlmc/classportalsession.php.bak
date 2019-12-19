<?php

if(!defined("SW_SESSION_INVALID")) define("SW_SESSION_INVALID",	1);
if(!defined("SW_SESSION_TIMEOUT")) define("SW_SESSION_TIMEOUT",	2);
if(!defined("SW_SESSION_OK"))      define("SW_SESSION_OK",		3);

//-- always start a session
if (session_status() == PHP_SESSION_NONE)
	session_start();

class classPortalSession
{
	function CreatePortalSession($sessionid, $sessionduration)
	{
		$expiry = (time() + ($sessionduration * 60));
		$sessionkey = sprintf("%d", $expiry);
		$sessionkey .= "-";
		$sessionkey .= $sessionid;

		$_SESSION['sessiontimeout'] = $sessionduration;
		$_SESSION['expiretime'] = $expiry;
		$_SESSION['cookie'] = base64_encode($sessionkey);
		return TRUE;
	}

	function check_session_state()
	{
		//-- TK Check SessionID is Valid
		if(!checkSession($_SESSION['sessionid']))
		{
			session_destroy();
			return SW_SESSION_INVALID;
		}
		
		if (isset($_SESSION['cookie']))
		{
			$expiryTime = $_SESSION['expiretime'] ;
			if($expiryTime == "")
			{
				session_destroy();
				return SW_SESSION_INVALID;
			}
			else
			{
				//-- See if we have expired?
				if(time() > $expiryTime)
				{
					session_destroy();
					return SW_SESSION_TIMEOUT;
				}
			}
		}
		else
		{
			//-- invalid session so stop 
			session_destroy();
			return SW_SESSION_INVALID;
		}

		//-- reset vars just to be sure
		$this->ExtendSessionTime();

		return SW_SESSION_OK;
	}

	//-- extend session time
	function ExtendSessionTime()
	{
		$expiry = (time() + ($_SESSION['sessiontimeout'] * 60));
		$_SESSION['expiretime'] = $expiry;
	}

	function LoadPortalConfig()
	{
		$dbConn = new CSwLocalDbConnection;
		$boolConnected = $dbConn->Connect("syscache");

		$strSQL = "SELECT name,value FROM websession_config WHERE InstanceID = '" . $_SESSION['connector_instance'] . "'";
		$retRS = $dbConn->Query($strSQL,true);
		while(!$retRS->eof)
		{	
			$strName = "config_" .strtolower($retRS->f("name"));
			$strValue = $retRS->f("value");
			$_SESSION[$strName] = $strValue;
			$retRS->movenext();
		}
	}


	function SetAppPath($path)
	{
		if($this->check_session_state()==SW_SESSION_OK)	
		{
			$_SESSION['app_path'] = $path;
		}
	}

	function GetAppPath()
	{
		if($this->check_session_state()==SW_SESSION_OK)
		{
			return $_SESSION['app_path'];
		}
	}

	function get_session_id()
	{
		if($this->check_session_state()==SW_SESSION_OK)
		{
			$_SESSION['sessionid'];
		}
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

	function UrlRedirect($url, $errormsg = "")
	{
		$host = $GLOBALS["SERVER_NAME"];
		if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=="on")
		{
			$str = "https://" . $host . "/". $_SESSION["app_path"] . $url;
		}
		else
		{
			$str = "http://" . $host . "/". $_SESSION["app_path"] . $url;
		}
		if(strlen($errormsg))
			$str .= "?errormsg=" . rawurlencode($errormsg);

		if($this->IsMSIE())
			header("Location: " . $str);
		else
			echo "<html><meta http-equiv=\"refresh\" content=\"0;URL=" . $str . "\"></html>";
	}


}


?>