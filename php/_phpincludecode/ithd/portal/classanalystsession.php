<?php
// Constants used by the userdb.webflag column
define("LOGIN_FAILED_NO_SERVER",			1);
define("LOGIN_FAILED_NOT_NOTREGISTERED",	2);
define("LOGIN_FAILED_NO_NOACCESS",			3);
define("LOGIN_FAILED_SERVER_ERROR",			4);
define("LOGIN_FAILED_CHECK_CREDENTIALS",	5);
define("ANALYST_LOGIN_OK",					6);
define("SW_SESSION_INVALID",				1);
define("SW_SESSION_TIMEOUT",				2);
define("SW_SESSION_OK",						3);
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
		$_SESSION["www_portalroot"] = $httptype. $_SERVER['SERVER_ADDR'] . ":" . $this->server_port. $app_path; //-- always webserver
		$_SESSION['server_name'] = $this->server_name;
		//-- nwj 20.03.2009 - ensure we use sw server path if server is set to localhost as could be on a remote server
		$strSWIP = (strtolower(_SERVER_NAME)=="localhost" || strtolower(_SERVER_NAME)=="127.0.0.1")?$_SERVER['SERVER_ADDR']:$this->server_name;
		$_SESSION['activexcodebase'] = $httptype. $strSWIP . ":" . $this->server_port.  "/sw/clients/swlcfax7.cab#version=" . $cabVersion;
		$_SESSION['swserver_ip'] = $strSWIP;
		//-- nwj 20.03.2009
	}
	function CreateAnalystSession($analystid, $password)
	{
		//-- open a connection to the helpdesk server
		$con = swhd_open($this->server_name,  $analystid,  $password);
		if($con && $con < 33)
		{
			//-- We now read our session information from the server
			$ret = swhd_getlastresponse($con);	// Get the response
			//-- Strip off the "+OK ";
			$ret = substr($ret, 4);
			//-- Make an array of item=value strings
			$values = explode(";", $ret);
			for($x = 0; $x < sizeof($values); $x++)
			{
				$item = $values[$x];
				$pair = explode("=", trim($item));
				if($pair[0] == "id")
					$this->sessionid = trim(strtr($pair[1], "\"", " "));
				else
				if($pair[0] == "conid")
					$this->conid = trim(strtr($pair[1], "\"", " "));
			}
			//-- We are done with our connection, close it
			swhd_close($con);
			$_SESSION['sessionid'] = $this->sessionid;
			//-- We should now load the session configuration out of the swsessions table
			if($this->LoadSessionConfig())
				return ANALYST_LOGIN_OK;
			return LOGIN_FAILED_SERVER_ERROR;
		}
		return LOGIN_FAILED_NO_SERVER;
	}
	function CloseSession($sessionid ="")
	{
		// If an existing session exists, close it
		if($sessionid=="")$sessionid = $this->sessionid;
		swhd_closesession($this->server_name,  $sessionid);
	}
	function OpenSession($sessionid)
	{
		// open a connection to the helpdesk server
		$con = swhd_opensession($this->server_name,  $sessionid);
		if($con && $con < 33)
		{
			// We now read our seesion information from the server
			$ret = swhd_getlastresponse($con);	// Get the response
			// Strip off the "+OK ";
			$ret = substr($ret, 4);
			// Make an array of item=value strings
			$values = explode(";", $ret);
			for($x = 0; $x < sizeof($values); $x++)
			{
				$item = $values[$x];
				$pair = explode("=", trim($item));
				if($pair[0] == "id")
					$this->sessionid = trim(strtr($pair[1], "\"", " "));
				else
				if($pair[0] == "conid")
					$this->conid = trim(strtr($pair[1], "\"", " "));
			}
			//-- We are done with our connection, close it
			swhd_close($con);
			//-- load session variables
			if($this->LoadSessionConfig())
			{
				$this->sessionok=true;
				return SW_SESSION_OK;
			}
			return SW_SESSION_INVALID;
		}
		return SW_SESSION_TIMEOUT;
	}
	//-- read off database and make sure session is valid
	function IsValidSession($sessionid)
	{
		if($sessionid=="")$sessionid = $this->sessionid;
		
		$this->sessionok=false;
		//-- connect and load session data
		$con = odbc_connect("Supportworks Cache", swcuid(), swcpwd());
		$sessionok = FALSE;
		if($con)
		{
			//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
		  	//	To avoid its misuse, the column [timezoneoffset] was purposely commented in the SQL statement!!!!
			$result = odbc_exec($con, "SELECT a.maxbackdateperiod,s.analystname, s.analystid, s.groupid, s.contextanalystid, s.contextgroupid, " .
								      "s.currentdatadictionary as dd, s.datetimefmt, s.datefmt, s.timefmt, s.currencysymbol, s.timezone, " .
									  "/*s.timezoneoffset as tz, */s.privlevel, s.sla, s.slb, s.slc, s.sld, s.sle, s.slf, s.slg, s.slh, AES_DECRYPT(s.Authorisation, '980jiunds87snlkjYWNPHSW') as password, sessionid, s.OracleInUse, s.MsSqlInUse " .
									  "FROM swsessions s, swanalysts a WHERE s.SessionID = '" . $sessionid . "'" . " AND a.analystid=s.analystid");
			if($result)
			{
				if(odbc_fetch_row($result))
				{
					$this->sessionok=true;
					odbc_free_result($result);
				}
			}
		}
		unset($con);
		return 	$this->sessionok=true;
	}
	function LoadSessionConfig()
	{
		// Get our session information
		$con = odbc_connect("Supportworks Cache", swcuid(), swcpwd());
		$sessionok = FALSE;
		if($con)
		{
			//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
		  	//	To avoid its misuse, the column [timezoneoffset] was purposely commented in the SQL statement!!!!
			$result = odbc_exec($con, "SELECT a.maxbackdateperiod,s.analystname, s.analystid, s.groupid, s.contextanalystid, s.contextgroupid, " .
								      "s.currentdatadictionary as dd, s.datetimefmt, s.datefmt, s.timefmt, s.currencysymbol, s.timezone, " .
									  "/*s.timezoneoffset as tz, */s.privlevel, s.sla, s.slb, s.slc, s.sld, s.sle, s.slf, s.slg, s.slh, AES_DECRYPT(s.Authorisation, '980jiunds87snlkjYWNPHSW') as password, sessionid, s.OracleInUse, s.MsSqlInUse " .
									  "FROM swsessions s, swanalysts a WHERE s.SessionID = '" . $this->sessionid . "'" . " AND a.analystid=s.analystid");
			if($result)
			{
				while(odbc_fetch_row($result))
				{
					// Get the number of columns in our result set
					$ColumnCount = odbc_num_fields($result);
					// Iterate the columns and create the PHP variables with the name <tablename>_<column name>
					// There is one cavet here. This function is operating in local scope and the $$ technique
					// used before does not work for a class. Instead, what we do is use the $GLOBALS[] array
					// to set up our results. This is then made available to all areas of the PHP page as the
					// previous version did but, we are still encapsulated in the class. This keeps things
					// nice and tidy
					$i = 0;
					while($i < $ColumnCount)
					{
					    $i++;
						$fieldName = strtolower(odbc_field_name($result, $i));
						//-- Now set our variable with the value from the result set
						$_SESSION["wc_" . $fieldName] = odbc_result($result, $i);
						$_SESSION[$fieldName] = odbc_result($result, $i);
						//echo $fieldName. " : " . $_SESSION["wc_" . $fieldName] .  " :: ";
					}
				//DTE:- Moved into the while loop so that that function actually returns false.
				$sessionok = TRUE;
				}
				$_SESSION["wc_analystid"] = strtolower($_SESSION["wc_analystid"]);
				$strSql = "SELECT UserDefaults from swanalysts where analystid='" . PrepareForSql($_SESSION["wc_analystid"]) . "'";
				$_SESSION['wc_userdefaults'] = 0;
				$result = odbc_exec($con,$strSql);
				if ($result)
				{
					if (odbc_fetch_row($result))
					{
						$_SESSION['wc_userdefaults'] = odbc_result($result,1);
					}
				}
				//-- nwj 23.10.2008 - load and store analysts supprot groups
				$_SESSION['wc_arr_analystgroups'] = Array();
				$_SESSION['wc_str_analystgroups'] = "";
				$_SESSION['wc_str_pfsanalystgroups'] = "";
				$strSql = "SELECT groupid from swanalysts_groups where analystid='" . PrepareForSql($_SESSION["wc_analystid"]) . "'";
				$result = odbc_exec($con,$strSql);
				if ($result)
				{
					while (odbc_fetch_row($result))
					{
						$strGroupID = odbc_result($result,1);
	 				    $_SESSION['wc_arr_analystgroups'][$strGroupID] = true;
						//-- store comma string
						if($_SESSION['wc_str_analystgroups']!="") $_SESSION['wc_str_analystgroups'] .= ",";
						$_SESSION['wc_str_analystgroups'] .= $strGroupID;
						//-- store comma pfs string
						if($_SESSION['wc_str_pfsanalystgroups']!="") $_SESSION['wc_str_pfsanalystgroups'] .= ",";
						$_SESSION['wc_str_pfsanalystgroups'] .= "'" . $strGroupID ."'";
					}
				}
				//	<FN dt=30-June-2006>
				//	load the data dictionary - the format specified in data dictionary for the various kind of fields (including DT formats)
				//	does overwrite the formats specified in [swsessions] table.
				swdti_load($_SESSION['wc_dd']);
				//	</FN>
				
				odbc_free_result($result);
			}
			//////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Log Call Form
			$sql = "SELECT FormName, FormWidth, FormHeight,CallClass FROM dd_lcf WHERE DdName = '" . $_SESSION["wc_dd"] . "'";
			$result = odbc_exec($con, $sql);
			if($result)
			{
				$x = 0;
				while(odbc_fetch_row($result))
				{
					$this->logcallforms[$x] = odbc_result($result, 4) . "," . odbc_result($result,1);
					$this->logcallforms_size[odbc_result($result,1)] = odbc_result($result,2) . "," . odbc_result($result,3);
					$x++;
				}
				odbc_free_result($result);
			}
			//////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Details Call Form
			$sql = "SELECT FormName, CallClass, FormWidth, FormHeight FROM dd_cdf WHERE DdName = '" . $_SESSION["wc_dd"] . "'";
			$result = odbc_exec($con, $sql);
			if($result)
			{
				while(odbc_fetch_row($result))
				{
					$this->calldetailsforms[odbc_result($result, 2)] = odbc_result($result, 1);
					$this->calldetailsforms_size[odbc_result($result, 2)] = odbc_result($result,3) . "," . odbc_result($result,4);
				}
				odbc_free_result($result);
			}
			//////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Standard Form
			$sql = "SELECT FormName, ClassName, FormWidth, FormHeight FROM dd_stdf WHERE DdName = '" . $_SESSION["wc_dd"] . "' order by formname";
			$result = odbc_exec($con, $sql);
			if($result)
			{
				$x = 0;
				while(odbc_fetch_row($result))
				{
					//-- use form name or class
					$strName = odbc_result($result, 1);
					$strClass = odbc_result($result, 2);
					$arrKey = ($strClass=="")?$strName:$strClass;
					$this->standardforms[$arrKey] = $strName;
					$this->standardforms_size[$arrKey] = odbc_result($result,3) . "," . odbc_result($result,4);
				}
				odbc_free_result($result);
			}
			odbc_close($con);
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
}
?>