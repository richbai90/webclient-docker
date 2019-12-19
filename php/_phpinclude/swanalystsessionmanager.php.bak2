<?php

if (version_compare(PHP_VERSION,'5','>='))
	 require_once('domxml-php4-to-php5.php'); //Load the PHP5 converter

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

define("ANALYST_DEFAULT_FORCEUPDATEWHENACCEPCALL", 0x00000400);

define("ANALYST_RIGHT_A_CANASSIGNCALLS", 0x00000001);
define("ANALYST_RIGHT_A_CANCLOSECALLS",	0x00000002);
define("ANALYST_RIGHT_A_CANLOGCALLS",   0x00000004);
define("ANALYST_RIGHT_A_CANUPDATECALLS", 0x00000008);
define("ANALYST_RIGHT_A_CANMODIFYCALLS", 0x00000010);
define("ANALYST_RIGHT_A_CANCANCELCALLS", 0x00000080);
define("ANALYST_RIGHT_A_CANPLACECALLONHOL", 0x00000200);
define("ANALYST_RIGHT_A_CANTAKECALLOFFHOLD", 0x00000400);
define("ANALYST_RIGHT_A_CANRESOLVECALLS", 0x08000000);

class CSwAnalystSessionManager
{
	// These variables are set up by the constructor of the class
	var $server_name;		// The name of the server that this session connects to
	var $app_name;			// The name of the web application (i.e. web_client)
	var $app_path;			// The root path where the web client php files are
	var $server_port;

	// The variables set up by the return of a succesfull connect or bind
	var $sessionid;			// The session id string returned by the open session
	var $conid;				// The connection id string to index into the swsessions table
	var $logcallforms;		// An array of log call forms

	function GetCookie()
	{
		return $this->sessionid;
	}

	function CSwAnalystSessionManager($app_name, $server_name, $app_path = "")
	{

		$pos = strpos($server_name,":");
		if(is_integer($pos))
		{
			$this->server_name = substr($server_name,0,$pos);
			$this->server_port = substr($server_name,$pos + 1);;
		}
		else
		{
			$this->server_port = 80;
			$this->server_name = $server_name;
		}


		if($app_path == "")
			$app_path = "/" . $app_name . "/";

		$this->sessiontimeout = 15;
		$this->app_path = $app_path;
		$this->app_name = $app_name;
	}

	function CreateAnalystSession($analystid, $password)
	{
		// open a connection to the helpdesk server
		$con = swhd_open($this->server_name,  $analystid,  $password);

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

			// We are done with our connection, close it
			swhd_close($con);

			// We should now load the session configuration out of the swsessions table
			if($this->LoadSessionConfig())
				return ANALYST_LOGIN_OK;

			return LOGIN_FAILED_SERVER_ERROR;
		}
		return LOGIN_FAILED_NO_SERVER;
	}

	function CloseSession($sessionid)
	{
		// If an existing session exists, close it
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

			// We are done with our connection, close it
			swhd_close($con);

			if($this->LoadSessionConfig())
				return SW_SESSION_OK;

			return SW_SESSION_INVALID;
		}
		return SW_SESSION_TIMEOUT;
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

						// Now set our variable with the value from the result set
						$GLOBALS["config_" . $fieldName] = odbc_result($result, $i);
					}
				//DTE:- Moved into the while loop so that that function actually returns false.
				$sessionok = TRUE;
				}

				$GLOBALS["config_analystid"] = strtolower($GLOBALS["config_analystid"]);

				$strSql = "SELECT UserDefaults from swanalysts where analystid='" . $GLOBALS["config_analystid"] . "'";
				$GLOBALS['config_userdefaults'] = 0;
				$result = odbc_exec($con,$strSql);
				if ($result)
				{
					if (odbc_fetch_row($result))
					{
						$GLOBALS['config_userdefaults'] = odbc_result($result,1);
					}
				}

				//	<FN dt=30-June-2006>
				//	load the data dictionary - the format specified in data dictionary for the various kind of fields (including DT formats)
				//	does overwrite the formats specified in [swsessions] table.
				swdti_load($GLOBALS['config_dd']);
				//	</FN>

				
				odbc_free_result($result);
			}

			//////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Log Call Form
			$sql = "SELECT FormName, FormWidth, FormHeight FROM dd_lcf WHERE DdName = '" . $GLOBALS["config_dd"] . "'";
			$result = odbc_exec($con, $sql);
			if($result)
			{
				$x = 0;
				while(odbc_fetch_row($result))
				{
					$this->logcallforms[$x] = odbc_result($result, 1);
					$this->logcallforms_size[odbc_result($result,1)] = odbc_result($result,2) . "," . odbc_result($result,3);
					$x++;
				}
				odbc_free_result($result);
			}

			//////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Details Call Form
			$sql = "SELECT FormName, CallClass, FormWidth, FormHeight FROM dd_cdf WHERE DdName = '" . $GLOBALS["config_dd"] . "'";
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
			$sql = "SELECT FormName, ClassName, FormWidth, FormHeight FROM dd_stdf WHERE DdName = '" . $GLOBALS["config_dd"] . "'";
			$result = odbc_exec($con, $sql);
			if($result)
			{
				$x = 0;
				while(odbc_fetch_row($result))
				{
					$this->standardforms[odbc_result($result, 2)] = odbc_result($result,1);
					$this->standardforms_size[odbc_result($result, 2)] = odbc_result($result,3) . "," . odbc_result($result,4);
				}
				odbc_free_result($result);
			}
			odbc_close($con);
		}
		return $sessionok;
	}

	function GetCallDetailsFormName($callclass)
	{
		$name = $this->calldetailsforms[$callclass];
		if($name == "")
			$name = "Helpdesk Call";
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