<?php

if (version_compare(PHP_VERSION,'5','>='))
	 require_once('domxml-php4-to-php5.php'); //Load the PHP5 converter

define("SW_SESSION_INVALID",	1);
define("SW_SESSION_TIMEOUT",	2);
define("SW_SESSION_OK",			3);

class CSwCookieSessionManager
{
	var $cookie;
	var $tExpires;
	var $SessionID;
	var $key;
	var $app_path;

	function CSwCookieSessionManager()
	{
		$this->cookie = "";
		$this->state = "";
		$this->tExpires = 0;
		$this->SessionID = "";
		$this->app_path = "/";
	}

	function SetAppPath($path)
	{
		$this->app_path = $path;
	}

	function SetSessionString($sessionstr)
	{
		$this->key = base64_decode($sessionstr);

		// See if our cookie makes sense?
		if(sscanf($this->key, "%d-%s", $this->tExpires, $this->SessionID) != 2)
			return SW_SESSION_INVALID;

		$this->tExpires = substr($this->key,0,strpos($this->key,"-"));
		$this->SessionID = substr($this->key, strpos($this->key,"-")+1);
    
		if(strlen($this->SessionID) > 1 && $this->tExpires == "")
		{
			return SW_SESSION_INVALID;
		}

		// See if we have expired?
		if(time() > $this->tExpires)
			return SW_SESSION_TIMEOUT;

		return SW_SESSION_OK;
	}

	function GetSessionID()
	{
		return $this->SessionID;
	}

	function GetCookie()
	{
		return $this->cookie;
	}

	function CreateSession($sessionid, $sessionduration)
	{
		$this->SessionID = $sessionid;
		$this->tExpire = (time() + ($sessionduration * 60));
		$this->key = sprintf("%d", $this->tExpire);
		$this->key .= "-";
		$this->key .= $this->SessionID;
		$this->cookie = base64_encode($this->key);
		return TRUE;
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
		if($GLOBALS["HTTPS"]=="on")
		{
			$str = "https://" . $host . $this->app_path . $url;
		}
		else
		{
			$str = "http://" . $host . $this->app_path . $url;
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