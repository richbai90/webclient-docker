<?php


include_once('stdinclude.php');
// 27Jun2006

// Constants used by the userdb.webflag column
define("OPTION_HAS_WEB_ACCESS",				1);
define("OPTION_CAN_LOG_CALLS",				2);
define("OPTION_CAN_UPDATE_CALLS",			4);
define("OPTION_CAN_VIEW_CALLS",				8);

define("LOGIN_FAILED_NO_SERVER",			1);
define("LOGIN_FAILED_NOT_NOTREGISTERED",	2);
define("LOGIN_FAILED_NO_NOACCESS",			3);
define("LOGIN_FAILED_SERVER_ERROR",			4);
define("LOGIN_FAILED_CHECK_CREDENTIALS",	5);
define("CUSTOMER_LOGIN_OK",					6);

define("WEBSESSION_FLAG_ENABLEKB",			1);
define("WEBSESSION_FLAG_FORCEKBSEARCH",		2);
define("WEBSESSION_FLAG_SHOWISSUES",		4);

class CSwCustomerSessionManager extends CSwCookieSessionManager
{
	var $cust_webflag;
	var $sessiontimeout;
	var $customerid;
	var $password;
	var $cust_firstname;
	var $cust_lastname;
	var $server_name;
	var $connector_instance;
	var $connector_password;
	
	function CSwCustomerSessionManager($instance_name, $server_name, $app_path = "" , $timeout = 15)
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

		// I have added this code and an $app_path variable to support the selfservice module
		// being re-homed to any virtual path. The following code provides backwards compatibility
		// and the $app_path variable has a default value
		if($app_path == "")
			$app_path = "/sw/" . $instance_name . "/";
		
		$this->sessiontimeout = $timeout;
		$this->app_path = $app_path;
		$this->connector_instance = $instance_name;
		$this->connector_password = base64_encode($this->connector_instance);
	}

	function CreateCustomerSession($sessionid, $sessionduration)
	{
		$this->CreateSession($sessionid, $sessionduration);
		$karray = explode(":", $this->SessionID);
		$this->cust_webflag = $karray[0];
		$this->customerid = $karray[1];
		$this->cust_firstname = $karray[2];
		$this->cust_lastname = $karray[3];
		$this->password = $karray[4];
		$this->callclass = $karray[5];
		$this->assigngroup = $karray[6];
		$this->assignanalyst = $karray[7];
		$this->dd = $karray[8];

		$this->LoadSessionConfig();
	}

	function GetSiteName()
	{
		// Open a selfservice session
		$con = swhd_wcopen($this->server_name, $this->connector_instance);

		if($con && $con < 33)
		{
			// Query the server and obtain the selfservice instance site name
			if(swhd_sendcommand($con, "LOOKUP WEB SERVICE SITE NAME " . $this->connector_instance))
			{
				// Get our response
				$ret = swhd_getlastresponse($con);	// Get the response

				// Strip off the "+OK ";
				$ret = substr($ret, 4);

				// Make an array of item=value strings
				$values = explode(";", $ret);

				// Get our first item (sitename)
				$item = $values[0];

				// Get our name/value pair
				$pair = explode("=", trim($item));

				// If it is what we want, use the value
				if($pair[0] == "sitename")
				{
					swhd_close($con);
					return $pair[1];
				}
			}
			swhd_close($con);
		}
		return "";
	}


	function ValidateCustomerLogin($customerid, $password)
	{
		// New style customer web login validation. We use the helpdesk API to do the login validation

		// No access to start with
		$this->cust_webflag = 0;

		// open a connection to the helpdesk server
		$con = swhd_wcopen($this->server_name, $this->connector_instance);

		if($con && $con < 33)
		{
			// We encode the customer id and password in base64 to ensure any spaces do not effect the command parser
			if(swhd_sendcommand($con, "VALIDATE CUSTOMER WEB LOGIN " . base64_encode($customerid . ":" . $password)))
			{
				$ret = swhd_getlastresponse($con);	// Get the response

				// Strip off the "+OK ";
				$ret = substr($ret, 4);

				// Make an arrat of item=value strings
				$values = explode(";", $ret);

				// Loop through our item=value strings and split them into a named array (map)
				for($x = 0; $x < sizeof($values); $x++)
				{
					$item = $values[$x];

					$pair = explode("=", trim($item));

					if($pair[0] == "cust_webflag")
						$this->cust_webflag = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "cust_firstname")
						$this->cust_firstname = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "cust_lastname")
						$this->cust_lastname = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "callclass")
						$this->callclass = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "assigngroup")
						$this->assigngroup = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "assignanalyst")
						$this->assignanalyst = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "dd")
						$this->dd = trim(strtr($pair[1], "\"", " "));
					else
					if($pair[0] == "sessiontimeout")
						$this->sessiontimeout = trim(strtr($pair[1], "\"", " "));
				}
				settype($this->cust_webflag, "integer");
				settype($this->sessiontimeout, "integer");

				if($this->cust_webflag & OPTION_HAS_WEB_ACCESS)
				{
					// OK, we have valid customer credentials, now we need to build our session 	ID string
					$this->CreateCustomerSession($this->cust_webflag . ":" . $customerid . ":" . $this->cust_firstname . ":" . $this->cust_lastname . ":" . $password . ":" . $this->callclass . ":" . $this->assigngroup . ":" . $this->assignanalyst . ":" . $this->dd,		$this->sessiontimeout);

					// We are all done here
					return CUSTOMER_LOGIN_OK;
				}
				return LOGIN_FAILED_CHECK_CREDENTIALS;
			}
			else
			{
				$ret = swhd_getlastresponsecode($con);		// Get the last error
				swhd_close($con);
				if($ret == 107)
					return LOGIN_FAILED_NOT_NOTREGISTERED;
				else
					return LOGIN_FAILED_CHECK_CREDENTIALS;
			}
		}
		return LOGIN_FAILED_SERVER_ERROR;
	}

	function RestartSessionTimeout()
	{
		return $this->CreateCustomerSession($this->SessionID, $this->sessiontimeout);	// Recreate the session ID with a new time
	}

	function IsOption($option)
	{
		return ($option & $this->cust_webflag);
	}

	function LoadSessionConfig()
	{
		$con = odbc_connect("Supportworks Cache", $this->connector_instance, $this->connector_password);
		if($con)
		{
			$result = odbc_exec($con, "SELECT name, value FROM websession_config WHERE InstanceID = '" . $this->connector_instance . "'");
			if($result)
			{
				while(odbc_fetch_row($result))
				{
					$name = strtolower("config_" . odbc_result($result, "name"));
					$val = odbc_result($result, "value");
					$GLOBALS[$name] = $val;
  					//	<FN dt=16-Oct-2006> $GLOBALS['config_tz'] is completely irrelevant when displaying timestamps from the past!
					/*
					if ($name == "config_timezone")
					{
						$tzOffset = SwGetTimezoneOffset($this->server_name, $val);
						if ($tzOffset == SW_GET_TZ_OFFSET_ERROR)
						{
						  	$GLOBALS['config_tz'] = 0;
							echo sprintf(SW_FAIL_TO_DEDUCE_TIMEZONE, $val).'<br>';
						}
						else
							$GLOBALS['config_tz'] = $tzOffset;
					}
					*/
					//	</FN>
				}
				odbc_free_result($result);
			}
			odbc_close($con);
		}

		//-- 10.07.2007 - NWJ - load customer table record so it is available to developers when configuring. They dont have to 
		//-- worry about doing db select or changing select statement.
		//-- they can access these as $GLOBALS["cust_<dbfield>"] i.e. $GLOBALS["cust_company_name"]
		$con = odbc_connect(swdsn(), swuid(), swpwd());
		if($con)
		{
			$result = odbc_exec($con, "SELECT * FROM ".$GLOBALS['config_ac_table']." WHERE ".$GLOBALS['config_ac_id']."= '" .  prepareforSQL($this->customerid) . "'");
			if($result)
			{
				//-- Get the number of columns in our result set
				$ColumnCount = odbc_num_fields($result); 

				//-- should only ever return 1 row
				if(odbc_fetch_row($result))
				{
					$i = 0;
					while($i < $ColumnCount) 
					{ 
						$i++; 
						//-- get field name and make a cust_
						$colname = odbc_field_name($result, $i);
						$fieldName = "cust_" . $colname;
						$fieldName = strtolower($fieldName);

						//-- Now set our variable in globals
						$GLOBALS[$fieldName] = odbc_result($result, $i); 
					}
				} //-- eof if(odbc_fetch_row($result))
			} //-- $result
		} //-- $con
	}
}

?>