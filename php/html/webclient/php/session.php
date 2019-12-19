<?php

//-- so includes can check they are in context
define("RUNNING_INWC",true);

$_bInvalidWebclientToken = false;
$boolWebclientSessionFileLoaded = true;


include_once('php5requirements.php');


if(function_exists("swdecoderloaded")==false)
{
	session_start(); //--
	session_regenerate_id();
	setcookie(session_name(), session_id(), 0, '/',"; HttpOnly",(@$_SERVER["HTTPS"]=="on"));
}

//-- STRIP SLASHED IS MAGIC QUOTES IS ON
function stripslashes_deep($value) 
{ 
    $value = is_array($value) ? 
    array_map('stripslashes_deep', $value) : 
    stripslashes($value); 

    return $value; 
} 

if(function_exists("get_magic_quotes_gpc") && get_magic_quotes_gpc())
{
    stripslashes_deep($_GET); 
    stripslashes_deep($_POST); 
} 
//-- EOF STRIP SLASHES


$portal = new stdClass();

include_once('_wcconfig.php');
include_once("db.helpers.php");
include_once('swdates.php');
include_once('swdecoder.php');

	
//--
//-- if coming from xmlhttp request
if(isset($_POST["_appid"]))
{
	register_shutdown_function('shutdown');
}

//-- do we have a sessiont to check
if(isset($_SESSION['swsession']))
{
	//-- check session fixation - 88291
	if( ($_SESSION['SERVER_GENERATEDSID']!=true) || ($_SESSION['PREV_USERAGENT'] != @$_SERVER['HTTP_USER_AGENT']) || ($_SESSION['PREV_REMOTEADDR'] != @$_SERVER['REMOTE_ADDR']) )
	{
		//-- detected session fixation attack - clear down session
		
		session_unset();
		//session_destroy();
	}
	else
	{
		$_SESSION['PREV_USERAGENT'] = @$_SERVER['HTTP_USER_AGENT'];
		$_SESSION['PREV_REMOTEADDR'] = @$_SERVER['REMOTE_ADDR'];

		//-- 14.05.2012 - 88292
		//-- check session token that client must submit as part of any request to prevent CSRF
		//-- and check referrer is server url
		$_bInvalidWebclientToken = false;
		if(!isset($excludeTokenCheck))$excludeTokenCheck=false;
		if($excludeTokenCheck || (defined("_SECURITY_CSRF_ON") && _SECURITY_CSRF_ON==false))
		{
			//-- do not perform checks - should only be switched off for testing purposes
		}
		else
		{
			$checktoken = isset($_POST['sessiontoken'])?$_POST['sessiontoken']:"";
			if($checktoken=="")
			{
				$headers = apache_request_headers();
				$checktoken = @$headers['webclient-token'];
				if($checktoken=="")	$checktoken = $headers['Webclient-token']; //-- firefox
				if($checktoken=="")	$checktoken = $headers['Webclient-Token']; //-- safari
			}

			//-- check referrer - if using proxy then test against that
			//!eregi(@$_SERVER["HTTP_HOST"], str_replace("www.", "", strtolower(@$_SERVER["HTTP_REFERER"])))
			$host = @$_SERVER["HTTP_HOST"];
			$testHost = "/$host/i";
			if( !preg_match($testHost,str_replace("www.", "", strtolower(@$_SERVER["HTTP_REFERER"]))) )
			{
				$checkHost = (defined('_PROXYURL'))?_PROXYURL:@$_SERVER["HTTP_HOST"];
				
				//if(!eregi($checkHost, str_replace("www.", "", strtolower(@$_SERVER["HTTP_REFERER"]))))$_bInvalidWebclientToken=true;
				// RF - F0092174 - Escaped the regex special characters from the test string so that the / char in the url is not identified as a command.
				//$testHost = "/$checkHost/i";
				$testHost = "/" . preg_quote($checkHost, '/') . "/i";
				if(!preg_match($testHost,str_replace("www.", "", strtolower(@$_SERVER["HTTP_REFERER"])) ))$_bInvalidWebclientToken=true;			
			}
			if(!$excludeTokenCheck && $_SESSION['clienttoken']!=$checktoken)$_bInvalidWebclientToken=true;
		}
	}
}

global $_PHPTIMER;
//-- get start time
list($usec, $sec) = explode(" ", microtime());
$_PHPTIMER=($usec * 1000);

function shutdown()
{
	global $_PHPTIMER;
	global $oAnalyst;
    // This is our shutdown function, in 
    // here we can do any last operations
    // before the script is complete.
	list($usec, $sec) = explode(" ", microtime());
	$endTime = round(($usec * 1000) - $_PHPTIMER);

    echo '_SWWEBCLIENT_PHPTIMER['.$endTime.".".$oAnalyst->priveligelevel;
}


//--
//-- get passed in sw_sessionid and check that it is valid
global $oAnalyst;
global $session;
global $portal;
global $strStateInfo;
global $timezone;

global $_array_problem_codes;
global $_array_fix_codes;

//-- 30 seconds
set_time_limit(30);



$_bInvalidPrivLevel = false;
$bResult=false;

//-- secure or unsecured http
	$httptype = "http://";
	if(isset($GLOBALS["HTTPS"]) && $GLOBALS["HTTPS"]=="on")
	{
		$httptype = "https://";
	}
	//-- check if they are specify a specif port from the apconfig.php file
	$pos = strpos(_SERVER_NAME,":");
	if(is_integer($pos))
	{
		//-- use port from config file
		$swServerName = substr(_SERVER_NAME,0,$pos);
		$swServerPort = substr(_SERVER_NAME,$pos + 1);
	}
	else
	{
		//-- port not specified (so depending on http or https set default port
		$swServerPort = (isset($GLOBALS["HTTPS"]) && $GLOBALS["HTTPS"]=="on")?443:@$_SERVER['SERVER_PORT'];
		$swServerName = _SERVER_NAME;
	}


	//-- set activecode base - 03.10.2011 - 
	$strSWIP = (strtolower($swServerName)=="localhost" || strtolower($swServerName)=="127.0.0.1")?@$_SERVER['SERVER_ADDR']:$swServerName;
	$portal->sw_server_ip = $strSWIP;

	//-- 1.2.0 -  89837,89839 - store name 
	$strSWNAME = (strtolower($swServerName)=="localhost" || strtolower($swServerName)=="127.0.0.1")?@$_SERVER['SERVER_NAME']:$swServerName;
	$portal->sw_server_name = $strSWNAME;

	$_SESSION["server_name"] = $strSWNAME;


	$portal->sw_server_httpport = $swServerPort;
	$portal->www_port = @$_SERVER['SERVER_PORT'];

if(isset($_SESSION['swsession']))
{
	$bResult = load_analyst_session();
	if(isset($_POST["_appid"]))
	{
		$pr = substr($_POST["r"], -1);
		if($pr!=0 && $pr!=$oAnalyst->priveligelevel)
		{
			//-- user on client has altered priv level
			$_bInvalidPrivLevel = true;
		}
	}
}


//-- bail out
if(!$bResult || $_bInvalidWebclientToken || $_bInvalidWebclientUrlParamsXml || $_bInvalidPrivLevel)
{
	$altMsg= "m3";
	if($_bInvalidWebclientToken)
	{
		$altMsg="m4";
	}
	else if($_bInvalidPrivLevel)
	{
		$altMsg="m5";
	}
	else if($_bInvalidWebclientUrlParamsXml)
	{
		$altMsg="m6";
	}

	//-- coming from xmlhttp so exit and echo out error string
	if(@$_POST["r"]!="")
	{
		echo "SESSIONERROR:" . $altMsg;
	}
	else
	{
		 ?>
			<script>
				var msg = "<?php echo $altMsg;?>";
				try
				{
					var arrServerInfo = document.location.href.split("/webclient");
					if(opener)
					{
						if(opener.app==undefined || opener.app.bWebClient==undefined)
						{
							//-- running page outside of webclient
							var strParams = "sessionerrormsg=" + msg;
							opener.document.location.href = arrServerInfo[0] + "/webclient/?" + strParams;

						}
						else
						{
							opener.logout(msg);
						}
						self.close();
					}
					else
					{
						var app = top.app;
						if(app==undefined || app.bWebClient==undefined)
						{
							//-- running page outside of webclient
							var strParams = "sessionerrormsg=" + msg;
							document.location.href = arrServerInfo[0] + "/webclient/?" + strParams;
						}
						else
						{
							app.logout(msg);
						}
					}
				}
				catch(e)
				{
					//-- should never get here
					document.location.href = arrServerInfo[0] + "/webclient";
				}
			</script>
		 <?php 
	}
 exit;
}

//-- 2 minutes
set_time_limit(120);
//-- init vars
initialise_portal_variables();


//-- load ddf info
if(@$_SESSION["_wc_application_context"]) swdti_load($_SESSION["_wc_application_context"]);


//-- load analyst session info and store in oAnalyst;
function load_analyst_session()
{
	global $session;
	global $oAnalyst;

	//-- get session id as created when we logged on
	$strSessionID = $_SESSION['swsession'];
	
	//-- fetch info from session if available - saves time
	//$_SESSION['sessioninfo']= null;
	if(isset($_SESSION['sessioninfo']))
	{
		$session = $_SESSION['sessioninfo']->session;
		$oAnalyst = $_SESSION['sessioninfo']->analyst;
		return true;

		/*
		$con = connectdb("Supportworks Cache", true);
		if($con)
		{
			$result = hsl_odbc_exec($con, "SELECT SessionID FROM swsessions s WHERE s.SessionID = '" . $strSessionID . "'");
			if($result)
			{
				$session = $_SESSION['sessioninfo']->session;
				$oAnalyst = $_SESSION['sessioninfo']->analyst;
				return true;
			}
		}
		return false;
		*/
	}
	else
	{
		//-- get other session information (like group info , user defaults
		$con = connectdb("Supportworks Cache", true);
		if($con)
		{
			$result = hsl_odbc_exec($con, "SELECT * FROM swsessions s, swanalysts a WHERE s.SessionID = '" . $strSessionID . "' AND a.analystid=s.analystid");
			if($result)
			{
				$row = hsl_odbc_fetch_row($result);
				if($row)
				{
					$ColumnCount = hsl_odbc_num_fields($result);
					$i = 0;
					while($i < $ColumnCount)
					{
						$i++;
						$fieldName = strtolower(hsl_odbc_field_name($result, $i));
						if($fieldName=="password") continue; //-- do not store password
						

						//-- Now set our variable with the value from the result set
						$fieldVal = hsl_odbc_result($result, $i);
						if(!isset($fieldVal))$fieldVal="";
						
						@$oAnalyst->$fieldName = $fieldVal;
						@$session->$fieldName = $fieldVal;
						
					}
					
				}
				else
				{
					return false;
				}

				//-- for helpdesk filters
				$session->groupid = $session->contextgroupid;
				$session->analystid = $session->contextanalystid;
				
				//-- get user defaults
				$strSql = "SELECT UserDefaults from swanalysts where analystid='" . db_pfs($oAnalyst->analystid) . "'";
				$oAnalyst->userdefaults = 0;
				$result = hsl_odbc_exec($con,$strSql);
				if ($result)
				{
					if (hsl_odbc_fetch_row($result))
					{
						$oAnalyst->userdefaults = hsl_odbc_result($result,1);
					}
					hsl_odbc_free_result($result);
				}

				//-- load and store analysts support groups for use 
				$oAnalyst->arr_suppgroups = Array();
				$oAnalyst->str_suppgroups = "";
				$oAnalyst->pfsstr_suppgroups = ""; //-- can be used in sql i.e. where suppgroup in($oAnalyst->pfsstr_suppgroups)

				$strSql = "SELECT groupid from swanalysts_groups where analystid='" . db_pfs($oAnalyst->analystid) . "'";
				$result = hsl_odbc_exec($con,$strSql);
				if ($result)
				{
					while (hsl_odbc_fetch_row($result))
					{
							$strGroupID = hsl_odbc_result($result,1);
							$oAnalyst->arr_suppgroups[$strGroupID] = true;

							//-- store comma string
							if($oAnalyst->str_suppgroups!="") $oAnalyst->str_suppgroups .= ",";
							$oAnalyst->str_suppgroups.= $strGroupID;

							//-- store comma pfs string
							if($oAnalyst->pfsstr_suppgroups!="") $oAnalyst->pfsstr_suppgroups .= ",";
							$oAnalyst->pfsstr_suppgroups .= "'" . db_pfs($strGroupID) ."'";
					}
					hsl_odbc_free_result($result);
				}		

				//-- store in session - so saves db access each read
				$_SESSION['sessioninfo'] = new StdClass;
				$_SESSION['sessioninfo']->analyst = $oAnalyst;
				$_SESSION['sessioninfo']->session = $session;
				
				return true;
			}//-- eof fetch session
			else
			{
				return false;
			}
		}
		else
		{
			return false;
		}
	}
}

function getRealIpAddr()
{
    if (!empty(@$_SERVER['HTTP_CLIENT_IP']))   //check ip from share internet
    {
      $ip=@$_SERVER['HTTP_CLIENT_IP'];
    }
    elseif (!empty(@$_SERVER['HTTP_X_FORWARDED_FOR']))   //to check ip is pass from proxy
    {
      $ip=@$_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    else
    {
      $ip=@$_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

//-- set activex info
function initialise_portal_variables()
{
	GLOBAL $portal;
	GLOBAL $session;
	GLOBAL $oAnalyst;
	global $strStateInfo;

	//-- get root path
	$strPath = docURL();

	$arrInfo = explode(_INSTANCE_NAME,$strPath);
	$portal->root_path = $arrInfo[0] . _INSTANCE_NAME ."/";
	$portal->www_swpath = $arrInfo[0];

	//-- store session vars
	$_SESSION["sw_ap_wwwpath"] = $portal->root_path;
	$_SESSION["sw_wwwpath"] = $portal->www_swpath;
	$_SESSION["sw_sessionid"] = $oAnalyst->sessionid;
	$_SESSION["sw_analystid"] = $oAnalyst->analystid;
	//-- end of session vars

	if(@$_SESSION["_wc_application_context"]=="")
	{
		if(@$_POST["_appid"]!="")
		{
			$_SESSION["_wc_application_context"] = $_POST["_appid"];
		}
		else
		{
			$_SESSION["_wc_application_context"] = $oAnalyst->datadictionary;
		}
	}

	//-- set portal info for use by other php functions
	$portal->system_path = $portal->root_path . "client/forms/_system/";

	//$portal->databasetype = //get_database_type(); //-- from db.helpers
	$portal->application = $_SESSION["_wc_application_context"];


	//-- physical filesystem paths
	$arrInfo = explode(_INSTANCE_NAME,str_replace('\\', '/', __FILE__));
	$portal->fs_sw_path =$arrInfo[0];
	$portal->fs_server_installpath = str_replace("/html","",$arrInfo[0]); //-- c:\progfiles\supprotworks server ...

	$portal->fs_root_path = $arrInfo[0] . _INSTANCE_NAME . "/";
	$portal->fs_application_path = $portal->fs_server_installpath . "/data/_dd_data/exported/". $_SESSION["_wc_application_context"] . "/";
	$portal->application_path = $portal->fs_application_path;	
	
	$portal->fs_systemforms_path = $arrInfo[0] . _INSTANCE_NAME . "/client/forms/";
	$portal->fs_workspace_path = $arrInfo[0] . _INSTANCE_NAME . "/client/workspace/";
	$portal->fs_outlook_path = $arrInfo[0] . _INSTANCE_NAME . "/client/outlook/";

	$_SESSION['fs_root_path'] = $portal->fs_root_path;

	//-- get list of applications
	if(@$_SESSION["_wc_apps"]=="")
	{
		$strApps = "";
		$d = @dir($portal->fs_server_installpath . "/data/_dd_data/exported");
		while (false !== ($entry = $d->read())) 
		{
			if($entry!="." && $entry!=".." && $entry!="_global") //-- 91848 - exclude new _global folder
			{
				if($strApps != "") $strApps .=",";
		   	   $strApps .= $entry;
			}
		}
		$d->close();
		$_SESSION["_wc_apps"]=$strApps;
	}


	//-- set database type - based on ssessions table info
	$portal->databasecaseinsensive = false;
	if($session->oracleinuse==1)
	{
		$portal->databasecaseinsensive = _ORACLE_CASE_INSENSITIVE;
		$portal->databasetype = "tsql";
	}
	else if($session->mssqlinuse==1)
	{
		$portal->databasetype = "mssql";
	}
	else
	{
		$portal->databasetype = "swsql";
	}
	$_SESSION['databasedriver'] = $portal->databasetype;
}


function load_form_config($strFormName,$strType)
{
	global $oAnalyst;
	$con = hsl_odbc_connect("Supportworks Cache", swcuid(), swcpwd());
	if($con)
	{
		//-- get log call forms for analysts ddf
		$sql = "SELECT * FROM dd_".$strType." WHERE formname='".$strFormName."' and ddname = '" . $_SESSION["_wc_application_context"] . "'";
		$result = hsl_odbc_exec($con, $sql);
		if($result)
		{
			return hsl_odbc_fetch_row($result);
		}
	}
	return false;
}

//-- convert string to upper case depending on db case insensitive setting
function db_case($strValue)
{
	if($portal->databasecaseinsensive==true)$strValue = "UPPER(".$strValue.")";
	return $strValue;
}

//-- return current document path http://billy/something.com?hello=hello return htpp://billy/
function docURL()
{
    return dirname(docFullURL())."/";
}

//-- return current document url htpp://billy/something.com?hello=hello
function docFullURL()
{
	return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
	// if(defined("_PROXYURL") && _PROXYURL!="")
	// {
	// 	return _PROXYURL;
	// }
	// else
	// {
	//     $s = empty(@$_SERVER["HTTPS"]) ? ''
	// 	: (@$_SERVER["HTTPS"] == "on") ? "s"
	//     : "";
	// 	$protocol = strleft(strtolower(@$_SERVER["SERVER_PROTOCOL"]), "/").$s;
	//     $port = (@$_SERVER["SERVER_PORT"] == "80") ? ""
	// 	: (":".@$_SERVER["SERVER_PORT"]);
	// 	return $protocol."://".@$_SERVER['SERVER_NAME'].$port.@$_SERVER['REQUEST_URI'];
	// }
}

function strleft($s1, $s2)
{
    return substr($s1, 0, strpos($s1, $s2));
}

function getServerTimeZoneOffset() 
{
     return date("O") / 100 * 60 * 60; // Seconds from GMT
 }
 
//-- common data conversions
function datatable_conversion($varRawValue, $strConversion)
{
	global $oAnalyst; 
	switch($strConversion)
	{
		case "msgdatereceived":
			return date("Y-m-d H:i:s" ,strtotime($varRawValue) - getServerTimeZoneOffset() + $oAnalyst->timezoneoffset);
			break;
		case "attachmenticon":
			$varRawValue++;$varRawValue--;
			return ($varRawValue>0)?"<center><img src='_controls/datatable/tableimages/attachment.png'></center>":"";
			break;
		case "emailstatusicon":
			$varRawValue++;$varRawValue--;
			return conversion_email_status_icon($varRawValue);
			break;
		case "emailpriorityicon":
			$varRawValue++;$varRawValue--;
			return conversion_email_priority_icon($varRawValue);
			break;
		case "bytesize":
			return conversion_bytesize($varRawValue);
			break;
		case "opencall.escalation":
			return conversion_escalation($varRawValue);
			break;
		case "opencall.probcode":
			return conversion_problem_code($varRawValue);
			break;
		case "opencall.fixcode":
			return conversion_fix_code($varRawValue);
			break;
		case "opencall.condition":
		case "opencall.h_condition":	
			return conversion_condition($varRawValue,$strConversion);
			break;
		case "updatedb.udtype":
			return conversion_udtype($varRawValue);
			break;
		case "updatedb.udindex":
			return conversion_udindex($varRawValue);
			break;
		case "updatedb.udsource":
		case "updatedb.udcode":
			return $varRawValue;
			break;
		case "swsessions.connectedsince":
			//-- rfc 86723 - convert yyyyMMddhhmmss into more readable date
			$yyyy = substr($varRawValue,0,4);
			$MM = substr($varRawValue,4,2);
			$dd = substr($varRawValue,6,2);
			$hh = substr($varRawValue,8,2);
			$mm = substr($varRawValue,10,2);
			$ss = substr($varRawValue,12,2);
			return $yyyy."-".$MM."-".$dd." " .$hh.":".$mm.":".$ss;
		default:

			return swdti_formatvalue($strConversion, SwConvertDateTimeInText($varRawValue));
		
			//-- if binding is tied into a date control then format
			$iDateControl = swdti_getfieldtype($strConversion);
			if($iDateControl==SWCD_CONTROL_DATETIMECTRL)
			{
				global $session;
				global $timezone;
				global $datetimefmt;
				global $datefmt;
				global $timefmt;
				$timezone = $session->timezone;
				$datetimefmt = $session->datetimefmt;
				$datefmt = $session->datefmt;
				$timefmt = $session->timefmt;
				return $datetimefmt;
				return SwFormatDateTimeColumn($strConversion,$varRawValue);
			}
			else
			{
				
			}
	}
}

//-- convert seconds to hh:mm
function conversion_sec2hhmm ($sec, $padHours = true) 
{
    $hms = "";
    
    // there are 3600 seconds in an hour, so if we
    // divide total seconds by 3600 and throw away
    // the remainder, we've got the number of hours
    $hours = intval(intval($sec) / 3600); 

    // add to $hms, with a leading 0 if asked for
    $hms .= ($padHours) 
          ? str_pad($hours, 2, "0", STR_PAD_LEFT). ':'
          : $hours. ':';
     
    // dividing the total seconds by 60 will give us
    // the number of minutes, but we're interested in 
    // minutes past the hour: to get that, we need to 
    // divide by 60 again and keep the remainder
    $minutes = intval(($sec / 60) % 60); 

    // then add to $hms (with a leading 0 if needed)
    $hms .= str_pad($minutes, 2, "0", STR_PAD_LEFT);//. ':';

    // seconds are simple - just divide the total
    // seconds by 60 and keep the remainder
    //$seconds = intval($sec % 60); 
	//echo $seconds;
    // add to $hms, again with a leading 0 if needed
    //$hms .= str_pad($seconds, 2, "0", STR_PAD_LEFT);

    return $hms;
}

function conversion_calldiary($strValue,$iLines = 4)
{
	$strRetValue = "";
	$arrLines =  preg_split('/[\r\n]+/', $strValue, -1, PREG_SPLIT_NO_EMPTY);
	$count=0;
	foreach($arrLines as $pos => $strLine)
	{
		$count++;
		$strRetValue .= $strLine ."\r\n";
		if($count==$iLines)break;
	}
	$strRetValue = SwConvertDateTimeInText($strRetValue);
	return $strRetValue;
}

function conversion_udindex($intUdindex)
{
	$intUdindex++;
	if($intUdindex<10)return "00".$intUdindex;
	if($intUdindex<100)return "0".$intUdindex;
	return $intUdindex;

}
function conversion_udtype($intUdType)
{

/*
1    (000000000001) Updated by User
2    (000000000010) Updated by System
3    (000000000011) Updated by User/System - translates to Customer
256  (000100000000) Update has attachments
512  (001000000000) Update is marked as Private
1024 (010000000000) An email was sent
2048 (100000000000) The updated was created from an incoming email.
*/
	$updated_by_user = 1;
	$updated_by_system = 2;
	$updated_by_usersystem = 3;
	$updated_with_attachments = 256;
	$updated_as_private = 512;
	$updated_with_email = 1024;
	$updated_from_email = 2048;
	if($intUdType & $updated_with_attachments)
	{
		return "<img src='../../client/workspace/_controls/datatable/tableimages/attachment.png'>";
	}
	return "";
}

function conversion_condition($intConditionValue,$strBinding)
{
	$strValue = "";
	if($intConditionValue=="None")
	{
		$intConditionValue=1;
		$strValue = "None";
	}
	else 
	{
		$strValue = htmlentities(swdti_formatvalue($strBinding, $intConditionValue));
	}
	$strHTML = "<div class='sw_cc sw_cc".$intConditionValue."'></div><div class='sw_cc_txt'>".$strValue."</div>";
	return $strHTML;
}

function conversion_escalation($intEscalationValue)
{
	$LEVEL1 = 0x00000001;
	$LEVEL2 = 0x00000002;
	$LEVEL3 = 0x00000003;
	$LEVEL4 = 0x00000004;
	$LEVEL5 = 0x00000005;
	$LEVEL6 = 0x00000006;

	$GREY = 0x00010000;
	$GREEN = 0x00020000;
	$AMBER = 0x00030000;
	$BLUE = 0x00040000;
	$MAGENTA = 0x00050000;
	$RED = 0x00060000;

	$high= $intEscalationValue>>16;
	$low = $intEscalationValue & 65535;

	if($low>6)$low=6;
	if($high>6)$high=6;

	$percW = ($low/6) * 100;
	if($intEscalationValue==0)return "";
	$strHTML = "<div class='sw_esc_".$high."' style='border:1px gray solid;font-size:1px;height:11px;width:".$percW."%;'></div>";
	return $strHTML;
}


function conversion_problem_code($strProbCode)
{
	global $_array_problem_codes;
	if($strProbCode=="")return "No Profile Code specified";
	
	if(!isset($_array_problem_codes))
	{
		//-- get profile codes
		$con = hsl_odbc_connect(swdsn(), swuid(), swpwd());
		if($con)
		{
			$strSql = "SELECT info, code from pcdesc";
			$result = hsl_odbc_exec($con,$strSql);
			if ($result)
			{
				while (hsl_odbc_fetch_row($result))
				{
					$_array_problem_codes[hsl_odbc_result($result,2)]=hsl_odbc_result($result,1);
				}
				hsl_odbc_free_result($result);
			}
		}
	}

	$strDesc = $_array_problem_codes[$strProbCode];
	if($strDesc=="") $strDesc = $strProbCode;

	return $strDesc;
}

function conversion_fix_code($strFixCode)
{
	global $_array_fix_codes;

	if($strFixCode=="")return "No Resolution Code specified";

	if(!isset($_array_fix_codes))
	{
		//-- get profile codes
		$con = hsl_odbc_connect(swdsn(), swuid(), swpwd());
		if($con)
		{
			$strSql = "SELECT info,code from rcdesc";
			$result = hsl_odbc_exec($con,$strSql);
			if ($result)
			{
				while (hsl_odbc_fetch_row($result))
				{
					$_array_fix_codes[hsl_odbc_result($result,2)]=hsl_odbc_result($result,1);
				}
				hsl_odbc_free_result($result);
			}
		}		
	}

	$strDesc = $_array_fix_codes[$strFixCode];
	if($strDesc=="") $strDesc = $strFixCode;

	return $strDesc;
}

function conversion_email_priority_icon($intPriority)
{
	$strMessage = "Message sent with ";

	switch($intPriority)
	{
		case 1:
			$strMessage .= "the Highest priority";
			break;
		case 2:
			$strMessage .= "a High priority";
			break;
		case 4:
			$strMessage .= "a Low priority";
			break;
		case 5:
			$strMessage .= "the Lowest priority";
			break;
	}
	if($intPriority==3 || $intPriority==0) return "";
	if($intPriority>3)
	{
		return "<center><img title='".$strMessage."' src='_controls/datatable/tableimages/email-priority-low.png'></center>";
	}
	else
	{
		return "<center><img title='".$strMessage."' src='_controls/datatable/tableimages/email-priority-high.png'></center>";
	}
}
function conversion_email_status_icon($intStatus)
{
	switch($intStatus)
	{
		case 0:
			return "<center><img src='_controls/datatable/tableimages/email-read.png'></center>";
		case 1:
			return "<center><img src='_controls/datatable/tableimages/email-unread.png'></center>";
		case 4096:
			return "<center><img src='_controls/datatable/tableimages/email-flagread.png' ></center>";
		case 4097:
			return "<center><img src='_controls/datatable/tableimages/email-flagunread.png' ></center>";
	}
	return "";
}

function conversion_bytesize($intBytes)
{
	$size = $intBytes / 1024; 
    if($intBytes < 1024) 
    { 
		$size = $intBytes;
		$size .= ' bytes'; 
    }  
    else  
    { 
	    if($size < 1024) 
		{ 
			$size = number_format($size, 2); 
			$size .= ' Kb'; 
		}
		else if($size / 1024 < 1024)  
		{ 
			$size = number_format($size / 1024, 2); 
            $size .= ' Mb'; 
        }  
        else if ($size / 1024 / 1024 < 1024)   
        { 
            $size = number_format($size / 1024 / 1024, 2); 
            $size .= ' Gb'; 
        }  
	} 
    return $size; 
}


//-- get contents of gzip file
function gzfile_get_contents($filename, $use_include_path = 0) 
{ 
	$file = @gzopen($filename, 'rb', $use_include_path); 
	if ($file) { 
		$data = ''; 
		while (!gzeof($file)) { 
			$data .= gzread($file, 1024); 
		} 
		gzclose($file); 
	} 
	return $data; 
} 


//-- enclide in cdata tag
function cddx($strValue)
{
	return "<![CDATA[" . $strValue . "]]>";
}

//-- prepare for xml
function pfx($strValue)
{
    $xmlchars = array("&", "<", ">",'"',"'");
    $escapechars = array("&amp;", "&lt;", "&gt;","&quot;","&apos;");
    return utf8_encode(str_replace($xmlchars, $escapechars, $strValue));
}


//-- check string for variable or function context - return either string or context
function sweval($strToEval)
{
	//-- ![f:get_analyst_qlc]! = call function get_analyst_qlc
	//-- ![v:analystid]! = return variable

	$strParsed = get_contextvars($strToEval,"![","]!");
	if(strPos($strParsed,":")===1)
	{
		//-- a function or variable
		$arrInfo = explode(":",$strParsed);
		if($arrInfo[0]=="f")
		{
			//-- function 
			$strParsed = runUserDefinedFunction($arrInfo[1]);
		}
		else if($arrInfo[0]=="v")
		{
			$strParsed = gvar($arrInfo[1]);
		}
	}
	return $strParsed;
}

//-- check string for variable or function context - return either string or context
function _sw_parse_vars($strToEval,$bPFS = true)
{
	//-- &[get_analyst_qlc] = call function get_analyst_qlc
	$strParsed = get_contextvars($strToEval,"&[","]",true,$bPFS);
	return $strParsed;
}


function get_contextvars($parseString,$strStartChar,$strEndChar,$bEvalPlaceHolder = false,$bPFS = false)
{
    $counter=0;
    while( (strstr($parseString,$strStartChar)) && (strstr($parseString,$strEndChar)) )
    {
        //-- find the first $strStartChar (place holder) and store the string upto that point
        $strBeginning = substr($parseString,0,strpos($parseString,$strStartChar));
        $strPlaceHolder = substr($parseString,strpos($parseString,$strStartChar)+strlen($strStartChar));
        $strPlaceHolder = substr($strPlaceHolder,0,strpos($strPlaceHolder,$strEndChar));

		$strReplaceWith = $strPlaceHolder;
		if($bEvalPlaceHolder)
		{
			$arrInfo = explode(".",$strPlaceHolder);
			if(strToLower($arrInfo[0])=="session")
			{
				global $session;
				$strReplaceWith = $session->$arrInfo[1];
			}
		}
        $parseString = str_replace($strStartChar.$strPlaceHolder.$strEndChar,$strReplaceWith,$parseString);
        $counter++;
        if($counter>50)return $parseString;
    }
    return $parseString;
}

//--
//-- get variable
function gvar($strName)
{
	if(isset($_REQUEST[$strName])) return $_REQUEST[$strName];
	if(isset($GLOBALS[$strName])) return $GLOBALS[$strName];
	if(isset($_SESSION[$strName])) return $_SESSION[$strName];
}

//--
//-- get label for binding
function swlbl($strBinding)
{
	return swdti_getcoldispname($strBinding);
}


//-- function to get list of call log forms
function get_analyst_lcf($strParentItemID,$jsHandle)
{
	return "";
	global $portal;
	load_apforms_config();
	
	$strHTML = "";
	for($x=0; $x<sizeOf($portal->arr_lcf);$x++)
	{
		$position_num = strpos($portal->arr_lcf[$x],",");
		$frmName = substr($portal->arr_lcf[$x],$position_num + 1);
	 
		$strHTML.= "<tr id='lcf--".$frmName."' pid='".$strParentItemID."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(this.id,event);}}'><td><div class='mnu-icon'></div></td><td width='100%'><div class='mnu-text'>".$frmName."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='mnu-nochild'></div></td></tr>";
	}

	return $strHTML;
}

//-- function to get analysts qlog calls
function get_analyst_qlc($strParentItemID,$jsHandle)
{
	return "<tr id='mnu_charlie' pid='".$strParentItemID."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}'><td><div class='mnu-icon'></div></td><td width='100%'><div class='mnu-text'>This is my quicklogcall - create from php function in toolbarcontrol.php</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='mnu-nochild'></div></td></tr>";
}



//--
//-- output a record fieldset
function output_record_data_as_table($arrFieldsToOutput,$intLabelWidth = "",$intTableWidth = "100%")
{
	$strWidth = "";
	if($intLabelWidth!="")
	{
		$strWidth = "width='".$intLabelWidth."px'";
	}

	$strTable="<table border='0' width='".$intTableWidth."' class='fieldset'>";
	foreach($arrFieldsToOutput as $strBinding => $rsValue)
	{
		$strTable.="<tr>";
		$strTable.="<td class='fs-label' align='right' valign='top' ".$strWidth.">".swdti_getcoldispname($strBinding)." :</td>";
		$strTable.="<td class='fs-data'>".swdti_formatvalue($strBinding,$rsValue)."</td>";
		$strTable.="</tr>";
	}
	$strTable.="</table>";
	return $strTable;
}

//--
//-- output a data table for an active page
function output_datatable($arrRowsToOutput,$strTableName,$strPreviewCol = "")
{
	$strHTML = "<table class='datatable' width='100%' cellspacing=0 cellpadding=0>";

	//-- headers
	$boolHeader = false;
	$strHeader ="";
	$strHTML .= "<tr>[header]</tr>";
	
	//-- select active calls for customer
	foreach($arrRowsToOutput as $pos => $aRow)
	{
		$iColCount = 0;
		$strPreview = "";
		$strHTML .= "<tr>";
		//-- draw out each col
		foreach($aRow as $sFieldName => $aFieldValue)
		{
			$outValue = datatable_conversion($aFieldValue,$strTableName.".".$sFieldName);
			if($sFieldName==$strPreviewCol)
			{
				$strPreview = "<tr><td colspan='*' class='dt-prev'>".nl2br(htmlentities($outValue))."<br><br></td></tr>";
				continue;
			}

			if(!$boolHeader)
			{
				$strDisplayName = swdti_getcoldispname($strTableName.".".$sFieldName);
				$strHeader .="<td class='dt-hd'>".$strDisplayName."</td>";
			}

			$iColCount++;

			$outValue = htmlentities($outValue);
			if($outValue=="")$outValue="&nbsp;";
			$strHTML .= "<td valign='top' class='dt-td'>".$outValue."</td>";
		}
		$boolHeader = true;
		$strHTML .= "</tr>";
		$strHTML .=$strPreview;
	}

	//-- replace colspan='*' with actual colspan
	$strHTML = str_replace("[header]",$strHeader,$strHTML);
	$strHTML = str_replace("colspan='*'","colspan='".$iColCount."'",$strHTML);
	$strHTML .= "</table>";
	return $strHTML;
}

//- -return true if binding is a string value
function boolColumnIsString($strBinding)
{
    $intType = swdti_getdatatype($strBinding);
    return ($intType==8||$intType==-1);
}


function itoa( $ii, $radix=10, $stritoa="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabc" ) {
    if ( $radix > strlen( $stritoa ) )    //    does request makes sense?
        return "";    //    think of your own way to handle this case
    $sign = $ii<0 ? "-": "";
    $ii = abs( $ii );
    $rc = "";
    do {
        $rc .= $stritoa[ $ii % $radix ];
        $ii = floor( $ii / $radix );
        } while ( $ii >0 );
    return $sign . strrev( $rc );
    }


// This function creates the specified directory path using mkdir().
function RecursiveMkdir($path)
{
    if (!file_exists($path))
    {
        //-- The directory doesn't exist.  Recurse, passing in the parent directory so that it gets created.
        RecursiveMkdir(dirname($path));
        mkdir($path, 0777);
    }
}


function rmkdir($path, $mode = 0755) 
{
    $path = rtrim(preg_replace(array("/\\\\/", "/\/{2,}/"), "/", $path), "/");
    $e = explode("/", ltrim($path, "/"));
    if(substr($path, 0, 1) == "/") 
	{
        $e[0] = "/".$e[0];
    }
    $c = count($e);
    $cp = $e[0];
    for($i = 1; $i < $c; $i++) 
	{
        if(!is_dir($cp) && !@mkdir($cp, $mode)) 
		{
            return false;
        }
        $cp .= "/".$e[$i];
    }
    return @mkdir($path, $mode);
}


//-- xmlmc api functions
//--
function fwrite_stream($fp, $string)
{
    for($written = 0; $written < strlen($string); $written += $fwrite)
    {
        $fwrite = fwrite($fp, substr($string, $written));
        if(!$fwrite)
        {
            return $fwrite;
        }
    }
    return $written;
}

function xmlmc($host, $port, $espToken, $xmlmc,$boolAsJson=false)
{

	if(strtolower($host)=="localhost")$host="127.0.0.1";

    $errNo  = NULL;
    $errStr = NULL;
    if(($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
    {
		//-- log activity
		if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
		{
			_wc_debug($host.":".$port ."[failed to open socket]",$xmlmc,"XMLMC");
		}

	    $o  = new StdClass();
		$o->token   = $espToken;
		$o->status  = false;
		$o->headers = null;
		$o->content = "";
		$o->asjson = false;
		return $o;
    }    

	$acceptType = ($boolAsJson)?"text/json":"text/xmlmc";
	$request = array(
                'POST /xmlmc HTTP/1.1',
                'Host: '.$host,
                'User-Agent: Hornbill PHP',
                'Connection: close',
                'Cache-Control: no-cache',
                'Accept: ' . $acceptType,
                'Accept-Charset: utf-8',
                'Accept-Language: en-GB',
                'Cookie: ESPSessionState='.$espToken,
                'Content-Type: text/xmlmc; charset=utf-8',
                'Content-Length: '.strlen($xmlmc),
               );

    $request = implode("\r\n", $request)
             . "\r\n\r\n"
             . $xmlmc;

	//-- log activity
	if(defined("_LOG_WC_XMLMC_ACTIVITY") && _LOG_WC_XMLMC_ACTIVITY)
	{
		_wc_debug($host.":".$port,$xmlmc,"XMLMC");
	}

    fwrite_stream($fp, $request);
    $resCode   = NULL;
    $headers   = NULL;
    $content   = NULL;
    $newToken  = $espToken;
    $inContent = FALSE;
	$exitme = false;
    while(!feof($fp) && (!$exitme))
    {
        if($inContent)
        {
            $addcontent= fread($fp, (4096));
			$dupPos = strpos($addcontent,"</methodCallResult>");
			if($dupPos!==false)
			{
				//-- substr addcontent
				$addcontent = substr($addcontent,0,$dupPos) . "</methodCallResult>";
				$exitme=true;
			}
			$content .= $addcontent;
        }
        else
        {
            $headers .= fread($fp, (4096));
            if($resCode === NULL && strlen($headers) >= 13)
            {
                if(!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13)))
                {
                    fclose($fp);
                    // Invalid http response
                    return FALSE;
                }
                $resCode = (integer) substr($headers, 9, 3);
            }
            if(($eoh = strpos($headers, "\r\n\r\n")) !== FALSE)
            {
                $content = (string) substr($headers, $eoh + 4);
                $headers = substr($headers, 0, $eoh);
                if(preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts))
                {
                    $newToken = $parts[1];
                }
                $headers   = explode("\r\n", $headers);
                $inContent = TRUE;
                array_shift($headers);
            }
        }
    }
    fclose($fp);

    $o  = new StdClass();
	$o->token   = $newToken;
    $o->status  = $resCode;
    $o->headers = $headers;
	$o->asjson = $boolAsJson;
    $o->content = trim(utf8_encode($content));
	$o->xmldom = null;
	if(!$boolAsJson)$o->xmldom = domxml_open_mem($o->content);
    return $o;
}  


//-- menu item loaders
function _get_managed_entities($strParentID, $jsHandle)
{
	global $portal;
	global $oAnalyst;

	$arrData = Array();
	$arrData[0] = "";
	$arrData[1] = "";


	//-- open app me xml
	$strFileName =$portal->fs_application_path."xml/managedEntities/Managed Entities.xml";
    $xmlfp = @file_get_contents($strFileName);
	if($xmlfp==false)
	{
		return $arrData;
	}

    $xmlDoc = domxml_open_mem($xmlfp);
    $root = $xmlDoc->document_element();

	$strHTML = "";
	$strImgHTML = "&nbsp;";
	$strChildHTML = "";
	$strItemImgClass="mnu-icon";

	$arrItems = $root->get_elements_by_tagname("managedEntity");
	foreach($arrItems as $anItem)
	{
		$strItemID = swxml_childnode_content($anItem,"name");
		$strText=$strItemID;

		//-- menu item html
		$strChildClass="mnu-child";
		$strHTML .= "<tr id='mnu_".$strItemID."' pid='".$strParentID."' mnutype='menu' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strItemID."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";

		
		//-- sub menu items
		$strChildHTML .= "<div id='mnu_mnu_".$strItemID."' pid='mnu_".$strItemID."' class='menu-holder'><table cellspacing='0' cellpadding='0' border='0'>";

		//-- browse
		$strBrowseText = swxml_childnode_content($anItem,"browseMenuString");
		$strBrowseForm = swxml_childnode_content($anItem,"entityBrowserForm");
		if($strBrowseForm!="")
		{
			$strBrowseAction = "frmbrowse--".$strBrowseForm;
			$strChildHTML .= "<tr id='mnu_".$strItemID."_1' pid='mnu_".$strItemID."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strBrowseAction."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strBrowseText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='mnu-nochild'></div></td></tr>";
		}

		//-- add
		$strAddText = swxml_childnode_content($anItem,"newRecordMenuString");
		$strAddForm = swxml_childnode_content($anItem,"entityNewRecordForm");
		if($strAddForm!="")
		{
			$strAddAction = "frmadd--".$strAddForm;
			$strChildHTML .= "<tr id='mnu_".$strItemID."_2' pid='mnu_".$strItemID."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strAddAction."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strAddText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='mnu-nochild'></div></td></tr>";
		}

		$strChildHTML .= "</table></div>";
	}

	$arrData[0] = $strHTML;
	$arrData[1] = $strChildHTML;
	return $arrData;
}

function _get_help_menu_items($strParentID, $jsHandle)
{
	global $oAnalyst;
	global $portal;

	$strItemImgClass="mnu-icon";
	$strImgHTML = "&nbsp;";

	$strHTML = "";

	//-- document help items as taken from helpmenu xml
	$target_path = $portal->fs_sw_path . "/clisupp/customhelpmenu.xml";
	$strXML = file_get_contents ($target_path);

    $xmlchars = array("&");
    $escapechars = array("&amp;");
    $strXML = str_replace($xmlchars, $escapechars, $strXML);
	$xmlDom = domxml_open_mem($strXML);
	
	$arrItems = $xmlDom->get_elements_by_tagname("item");
	$bSplit = false;
	foreach($arrItems as $pos => $mnuItem)
	{

		$strText = $mnuItem->get_attribute('name');
		if($strText=="")
		{
			if(!$bSplit)$strHTML .= "<tr class='mnu-row-split'><td class='mnu-icon-col' ><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter'></div></td><td></td></tr>";		
			$bSplit = true;
		}
		else
		{
			$intLevel = $mnuItem->get_attribute('privLevel');
			if($oAnalyst->priveligelevel >= $intLevel)
			{
				$bSplit = false;
				$strAction = "hlp--url".$pos;
				$strJsAction = "hlp--url::".$mnuItem->get_attribute('url');
				$strChildClass="mnu-nochild";
				$strHTML .= "<tr id='mnu_".$strAction."' pid='".$strParentID."' onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strJsAction ."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
			}
		}
	}

	if(!$bSplit)$strHTML .= "<tr class='mnu-row-split'><td class='mnu-icon-col' ><div class='mnu-icon'></div></td><td colspan='2' align='middle'><div class='mnu-splitter'></div></td><td></td></tr>";		


	//-- leave feedback
	$strText = "Leave Feedback";
	$strAction = "hlp--feedback";
	$strChildClass="mnu-nochild";
	$strHTML .= "<tr id='mnu_".$strAction."' pid='".$strParentID."'  onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strAction."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";


	//-- about menu item
	$strText = "About";
	$strAction = "hlp--about";
	$strChildClass="mnu-nochild";
	$strHTML .= "<tr id='mnu_".$strAction."' pid='".$strParentID."'  onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strAction."\",event);}}'><td class='mnu-icon-col'><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";

	$arrData = Array();
	$arrData[0] = $strHTML;
	$arrData[1] = "";
	return $arrData;

}

function _get_lcf_menu_items($strParentID, $jsHandle)
{
	//-- get lcf files and check espForm/configuration/settings/options/hideFromMenu
	global $portal;
	global $oAnalyst;

	$arrXmlDoms = Array();
	$strItemImgClass="mnu-icon";
	$count=0;
	$strLFCPath =$portal->fs_application_path . "_xml/prepared/lcf";
	if (file_exists($strLFCPath) && $handle = opendir($strLFCPath)) 
	{
		while (false !== ($file = readdir($handle))) 
		{
			if(strpos($file,".bak")!==false)continue;
			if(strpos($file,".xml")!==false)
			{
				//-- load dom and store in array
				$strXmlPath =$strLFCPath."/".$file;
			    $xmlfp = file_get_contents($strXmlPath);
			    $xmlDoc = @domxml_open_mem($xmlfp);
				if($xmlDoc)
				{
					$arrXmlDoms[$count] = $xmlDoc->document_element();
					$count++;
				}
			}
	    }
	    closedir($handle);
	}

	$strHTML = "";
	$strImgHTML = "&nbsp;";
	$strChildHTML = "";

	//-- var to hold valid form names
	$portal->exclude_logcallforms="";

	foreach($arrXmlDoms as $pos => $lcfDOM)
	{
		$xmlConfig = $lcfDOM->get_elements_by_tagname("configuration");	$xmlConfig=$xmlConfig[0];
		$xmlSetting = $xmlConfig->get_elements_by_tagname("settings");$xmlSetting=$xmlSetting[0];
		$xmlOptions = $xmlSetting->get_elements_by_tagname("options");$xmlOptions=$xmlOptions[0];
		if($xmlOptions)
		{
			$strItemID = swxml_childnode_content($xmlSetting,"name");
			$bHide = swxml_childnode_content($xmlOptions,"hideFromMenu");
			if($bHide!="true")
			{
				$strText=$strItemID;
				$strAction = "lcf--".$strItemID;
				$strChildClass="mnu-nochild";
				$strHTML .= "<tr id='mnu_".$strItemID."' pid='".$strParentID."'  onmouseover='app.menu_item_hover(this,event);' onmouseout='app.menu_item_out(this,event);' onclick='if(app.menu_item_clicked(this,event)){if(".$jsHandle."){".$jsHandle."(\"".$strAction."\",event);}}'><td class='mnu-icon-col' ><div class='".$strItemImgClass."'>".$strImgHTML."</div></td><td width='100%'><div class='mnu-text'>".$strText."</div></td><td valign='middle'><div class='mnu-ctrl'></div></td><td valign='middle'><div class='".$strChildClass."'></div></td></tr>";
			}
			else
			{
				if($portal->exclude_logcallforms!="")$portal->exclude_logcallforms .=",";
				$portal->exclude_logcallforms .= "'" .$strItemID."'";
			}
		}
	}

	$arrData = Array();
	$arrData[0] = $strHTML;
	$arrData[1] = $strChildHTML;
	return $arrData;

}


 function get_file_extension($file_name)
 {
   return strtolower(substr(strrchr($file_name,'.'),1));
 }
 function returnMIMEType($filename)
 {
        preg_match("|\.([a-z0-9]{2,4})$|i", $filename, $fileSuffix);
	    switch(strtolower($fileSuffix[1]))
        {
            case "js" :
                return "application/x-javascript";

            case "json" :
                return "application/json";

            case "jpg" :
            case "jpeg" :
            case "jpe" :
                return "image/jpg";

            case "png" :
            case "gif" :
            case "bmp" :
            case "tiff" :
                return "image/".strtolower($fileSuffix[1]);

            case "css" :
                return "text/css";

            case "xml" :
                return "application/xml";

            case "doc" :
            case "docx" :
                return "application/msword";

            case "xls" :
            case "xlt" :
            case "xlm" :
            case "xld" :
            case "xla" :
            case "xlc" :
            case "xlw" :
            case "xll" :
                return "application/vnd.ms-excel";

            case "ppt" :
            case "pps" :
                return "application/vnd.ms-powerpoint";

            case "rtf" :
                return "application/rtf";

            case "pdf" :
                return "application/pdf";

            case "html" :
            case "htm" :
            case "php" :
                return "text/html";

            case "txt" :
                return "text/plain";

            case "mpeg" :
            case "mpg" :
            case "mpe" :
                return "video/mpeg";

            case "mp3" :
                return "audio/mpeg3";

            case "wav" :
                return "audio/wav";

            case "aiff" :
            case "aif" :
                return "audio/aiff";

            case "avi" :
                return "video/msvideo";

            case "wmv" :
                return "video/x-ms-wmv";

            case "mov" :
                return "video/quicktime";

            case "zip" :
                return "application/zip";

            case "tar" :
                return "application/x-tar";

            case "swf" :
                return "application/x-shockwave-flash";

            default :
            if(function_exists("mime_content_type"))
            {
                $fileSuffix = mime_content_type($filename);
            }

            return "unknown/" . trim($fileSuffix[0], ".");
        }
    }


//--
//-- output information to log file
function _wc_debug($strMethod ,$strMessage,$strClass = "DATAB",$strType = "INFO ")
{
	$strType = "INFO ";

	global $portal;
	global $oAnalyst;

	if(@$_SESSION["swsession"]=="") return;
	if(@$_SESSION["fs_root_path"]=="") return;

	//-- session temp file path
	$destination_path = $_SESSION['fs_root_path'] ."temporaryfiles/" .$_SESSION["swsession"];
	$destination_path = str_replace("\\","/",$destination_path);

	//-- make directory path in app root working dir
	RecursiveMkdir($destination_path);

	//-- output to users temp session path
	$filename = $destination_path ."/webclient.log";
	//echo $filename;

	//2010-05-11 01:44:53 [SYSTM]:[INFO ]:[1512] Running application Instance ID: sw
	$strLine = date("Y-m-d H:i:s") . " [" . $strClass ."]:[" . $strType ."]:[" .@$oAnalyst->sessionid . "] " . $strMethod ." -> ". $strMessage ."\n";
	if (!$handle = @fopen($filename, 'a')) 
	{
		//echo "Cannot open file ($filename)";
		return false;
	}

	// Write $somecontent to our opened file.
	if (fwrite($handle, $strLine) === FALSE) 
	{
		//echo "Cannot write to file ($filename)";
		//exit;
	}
	fclose($handle);
}

function sw_file_put_contents($strFilepath,$strContent)
{
	$fp = fopen($strFilepath, 'w');
	fwrite($fp,$strContent);
	fclose($fp);
}

function xmlreplace_content( &$node, $new_content )
{
    $dom = $node->owner_document();
    $kids = $node->child_nodes();
    foreach ( $kids as $kid )
        if ( $kid->node_type() == XML_TEXT_NODE )
            $node->remove_child ($kid);
    $node->set_content($new_content);
} 

function xmladd_newnode(&$parentNode,$strNodeName,$new_content)
{
    $dom = $parentNode->owner_document();
	$node = $dom->create_element($strNodeName);
	$newnode = $parentNode->append_child($node);
	$newnode->set_content($new_content);
}

function SureRemoveDir($dir, $DeleteMe) {
    if(!$dh = @opendir($dir)) return;
    while (false !== ($obj = readdir($dh))) {
        if($obj=='.' || $obj=='..') continue;
        if (!@unlink($dir.'/'.$obj)) SureRemoveDir($dir.'/'.$obj, true);
    }

    closedir($dh);
    if ($DeleteMe){
        @rmdir($dir);
    }
}


function xml2json($xml)
{
	return __xml2array($xml);
}

//-- Changes XML DOM to JSON
function __xml2array($xml,$boolIsArray=false) 
{	
	$obj = "";
	if ($xml->node_type() == XML_ELEMENT_NODE) 
	{ 
			//-- Create the return object
			if(!$boolIsArray)$obj .= $xml->node_name();
			
			$strAtts = "";
			//-- element
			//-- do attributes
			if ($xml->has_attributes()) 
			{
				$xmlAttributes = $xml->attributes();
				foreach($xmlAttributes as $i)
				{
					if($strAtts!="")$strAtts.=',';
					$strAtts.= '@'.$i->name(). ':"'. $i->value().'"';
				}	
			}

			//-- do children
			$boolArray=false;
			$i=0;
			$strArrayName = "";
			if ($xml->has_child_nodes()) 
			{
				$strChildren = "";
				$xmlChildNodes = $xml->child_nodes();
				$cCount = sizeOf($xmlChildNodes);
				for($x=0;$x<$cCount;$x++)
				{
					$item = $xmlChildNodes[$x];
					if($item->node_name()=="#text")
					{
						$strValue = trim($item->node_value());
						if($strValue!="")	$strChildren .= $strValue;
						continue;
					}
					
					if($item->node_type() == XML_ELEMENT_NODE)
					{
						$nextItem = $item->next_sibling();
						if($nextItem)
						{
							$nextItem =$nextItem->next_sibling();
						}
						if($nextItem)
						{
							if($item->node_name()==$nextItem->node_name())
							{
								$boolArray=true;
								$strArrayName = $item->node_name();
							}
						}
						if($boolArray)
						{
							if($strChildren!="")$strChildren.=",";
							$strChildren .= __xml2array($item,true);
						}
						else
						{
							if($strChildren!="")$strChildren.=",";
							$strChildren .= __xml2array($item);

						}
						$i++;			
					}
					
				}
			}

			if($strAtts!="" || $i>0)
			{
				if($boolArray)
				{
					if($strAtts!="")
					{
						$obj.=":{".$strAtts.",".$strArrayName.":[".$strChildren."]}";
					}
					else
					{
						$obj.=":".$strArrayName."[".$strChildren."]";
					}
				}
				else
				{
					if(!$boolIsArray)$obj.=":";
					$obj.="{".$strChildren."}";
				}
				
			}
			else if($strChildren!="")
			{
				if(!$boolIsArray)$obj.=":";
				$obj.=$strChildren;
			}
			else if($strChildren=="" && $obj!="")
			{
				$obj.=":{}";
			}
	} 
	
	return $obj;
}

//-- xml url param checking
function validate_url_params_againstxml($childnodes,$boolNotUsingSwed=false)
{
	global $arrSwedParams;
	GLOBAL $arrValidated;
	foreach ($childnodes as $childNode)
	{
		$arrValidated[$childNode->tagname] = true;
		if(isset($_REQUEST[$childNode->tagname]) && $_REQUEST[$childNode->tagname]!="")
		{
			//-- there is a matched param definition
			$arrPerformChecks = explode(",",$childNode->get_content());
			foreach ($arrPerformChecks as $strCheckMethod)
			{
				//-- if failed parameter checking abort out
				$checkValue = ($boolNotUsingSwed)?@$_REQUEST[$childNode->tagname]:@$arrSwedParams[$childNode->tagname];

				if(!validate_url_param($checkValue,$strCheckMethod))
				{
					//-- clear down param
					$_REQUEST[$childNode->tagname]="";
					$_POST[$childNode->tagname]="";


					if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
					{
						_wc_debug("Param (".$childNode->tagname.") failed check [".$strCheckMethod."] for value [".$checkValue."]","FAILURE","SECUR");
					}

					//-- xmlhttp request
					if($_REQUEST["r"]!="")
					{
						echo "PARAMERROR:[".$childNode->tagname."] Expected parameter check failed and was removed from request. Please contact your Administrator.";
						exit(0);
					}
					else
					{
					 ?>
						<script>
							alert("[<?php echo $childNode->tagname;?>] Expected parameter check failed and was removed from request. Please contact your Administrator.");
						</script>
						<?php 
					}
					exit(0);
				}//-- if failed param check
			}
		}
	}//-- for each node
}//-- function validate_url_params_againstxml

function validate_url_param($varValue, $validationType)
{
	if(trim($varValue)=="")
	{
		if($validationType=="notnull") return false;
		return true;
	}

	$aValidSpecialChars = array('-', '_','.',' ',','); 
	switch($validationType)
	{
		case "":
			return true;
		case "boolean":
		case "bool":
			return (strtolower($varValue)=="true" || strtolower($varValue)=="false" || $varValue=="0" || $varValue=="1");
		case "numeric":
		case "num":
			return is_numeric($varValue);
		case "alpha":
			return ctype_alpha(str_replace($aValidSpecialChars, '', $varValue));
		case "alphanum":
		case "alphanumeric":
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
		case "nodirtraverse":
			return (strpos($varValue,"..")===false);
		case "sessionanalyst":
			return (strtolower($varValue)==strtolower($_SESSION["sw_analystid"]));
		case "sqlparamstrict": //-- do not allow ; -- # /* or ''
			return (strpos($varValue,"''")===false && strpos($varValue,";")===false && strpos($varValue,"--")===false && strpos($varValue,"/*")===false && strpos($varValue,"#")===false);
		case "sqlobjectname": //-- text num and _ allowed
			$aValidSpecialChars = array('_',':');
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));
		case "sqlselectcolumns": //-- text num and _ ,allowed
			$aValidSpecialChars = array('_',',',' ');
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));

		case "filetypexml": 
			return (get_file_extension($varValue)=="xml");
		case "filetypejson": 
			return (get_file_extension($varValue)=="json");
		case "xmltag": 
			return ctype_alnum(str_replace('_' , '', $varValue));
		case "espqueryname": 
			$aValidSpecialChars = array('-', '_','.',' ','/'); 
			return ctype_alnum(str_replace($aValidSpecialChars , '', $varValue));

	}

	return false;
}


function xcopy($src,$dst) 
{ 
	$dir = opendir($src);  
    @mkdir($dst);  
    while(false !== ( $file = readdir($dir)) ) {  
        if (( $file != '.' ) && ( $file != '..' )) {  
            if ( is_dir($src . '/' . $file) ) {  
                xcopy($src . '/' . $file,$dst . '/' . $file);  
            }  
            else {  
                copy($src . '/' . $file,$dst . '/' . $file);  
            }  
        }  
    }  
    closedir($dir);  
}


//--
//-- xmlmc processor - have to use swphp.dll as xmlmc api does not have a method to use existing session
class XmlMethodCall
{
	var $swserver = "";
	var $params = Array();
	var $data = Array();
	var $xmlresult = "";
	var $xmldom = null;
	var $errorMessage = "";

	function XmlMethodCall($server="localhost")
	{	
		if(defined("_SERVER_NAME") && _SERVER_NAME != '' && $server === "localhost") {
			$server = _SERVER_NAME;
		}
		$this->swserver = $server;
	}

	function reset()
	{
		$this->params = Array();
	}

	function SetComplexValue($parentParamName, $paramName,$paramValue)
	{
		if(!isset($this->params[$parentParamName]))$this->params[$parentParamName] = Array();
		$this->params[$parentParamName][$paramName] = $paramValue;
	}
	function SetParam($paramName,$paramValue)
	{
		$this->params[$paramName] = $paramValue;
	}
	function SetDataComplexValue($parentParamName, $paramName,$paramValue)
	{
		if(!isset($this->data[$parentParamName]))$this->data[$parentParamName] = Array();
		$this->data[$parentParamName][$paramName] = $paramValue;
	}
	function SetData($paramName,$paramValue)
	{
		$this->data[$paramName] = $paramValue;
	}

	//-- return xml string
	function generatexmlcall($service,$method)
	{
		$xml = '<?xml version="1.0" encoding="UTF-8"?>';
		$xml .= "<methodCall service='".$service."' method='".$method."'>";
		//-- params
		$bParams = false;
		foreach ($this->params as $paramName => $paramValue)
		{
			if($bParams==false)
			{
				$xml .= "<params>";
				$bParams=true;
			}
			$xml .= "<".$paramName.">".pfx(utf8_encode($paramValue))."</".$paramName.">";
		}
		if($bParams)$xml .= "</params>";

		$bData = false;
		foreach ($this->data as $paramName => $paramValue)
		{
			if($bData==false)
			{
				$xml .= "<data>";
				$bData=true;
			}
			$xml .= "<".$paramName.">".prepareForXml(utf8_encode($paramValue))."</".$paramName.">";
		}
		if($bData)$xml .= "</data>";

		$xml .= "</methodCall>";
		return $xml;
	}

	function invoke($service,$method,$bAsJson=false)
	{
		$this->errorMessage = "";
		$port=5015;
		if($service=="mail"||$service=="addressbook")$port=5014;
		else if($service=="calendar")$port=5013;
		$result   = xmlmc($this->swserver,$port,$_SESSION['swstate'],$this->generatexmlcall($service,$method),$bAsJson);
		$_SESSION['swstate']=$result->token;
		return $this->_processresultstring($result);
	}

	function _processresultstring($xmlmcResult)
	{
		if($xmlmcResult==false)
		{
			$this->xmlresult=generateCustomErrorString("-300","Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.");
			$this->errorMessage = "Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.";
			return false;
		}

		if($xmlmcResult->status!=200)
		{
			//-- some http error has occured
			$this->xmlresult=generateCustomErrorString($xmlmcResult->status,"An http error has occurred. Please contact your Administrator.");
			$this->errorMessage = "An http error has occurred.";
			return false;
		}
		else
		{
			//-- get result - convert string to xmldom
			$this->xmlresult = $xmlmcResult->content;
			if($xmlmcResult->xmldom!=null)
			{
				$this->xmldom = $xmlmcResult->xmldom->document_element();
				$status = $this->xmldom->get_attribute('status'); 
				if($status=="fail")
				{
					$e = $this->xmldom->get_elements_by_tagname("error");
					if($e[0])
					{
						$this->errorMessage = $e[0]->get_content();
					}
					return false;
				}
				else return true;
				
			}
			return true;
		}
	}
}

function generateCustomErrorString($code,$msg)
{
	$msg = $_POST['espQueryName'] . " : " . $msg;
	if($_POST['asjson'])
	{
		$xmls = '{"@status":"fail","state":{"code":"'.$code.'","error":"'.$msg.'"}}';
	}
	else
	{
		$xmls = "<?xml version='1.0' encoding='utf-8'?>";
		$xmls .= '<methodCallResult status="fail">';
		$xmls .= '<state>';
		$xmls .= '<code>'.$code .'</code>';
		$xmls .= '<error>'.pfx($msg).'</error>';
		$xmls .= '</state>';
		$xmls .= '</methodCallResult>';
	}
	return $xmls;
}

function generateProcessSuccessString($code="1",$msg ="",$response ="")
{
	if($_POST['asjson'])
	{
		$xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"metaData":{"code":{"dataType":"integer","tableName":"opencall","columnName":"code","dataSize":"12","displayName":"code"},"message":{"dataType":"varchar","tableName":"opencall","columnName":"message","dataSize":"1024","displayName":"message"},"response":{"dataType":"varchar","tableName":"opencall","columnName":"response","dataSize":"1000000","displayName":"response"}},"rowData":{"row":{"code":"'.$code.'","message":"'.$msg.'","response":"'.$response.'"}}}}';
	}
	else
	{
		$xmls = "<?xml version='1.0' encoding='utf-8'?>";
		$xmls .= '<methodCallResult status="ok">';
		$xmls .= '<params>';
		$xmls .= '<rowsEffected>1</rowsEffected>';
		$xmls .= '</params>';
		$xmls .= '<data>';
		$xmls .= '<metaData>';
		$xmls .= '<code>';
		$xmls .= '<dataType>varchar</dataType>';
		$xmls .= '<tableName>opencall</tableName>';
		$xmls .= '<columnName>code</columnName>';
		$xmls .= '<dataSize>12</dataSize>';
		$xmls .= '<displayName>code</displayName>';
		$xmls .= '</code>';
		$xmls .= '<message>';
		$xmls .= '<dataType>varchar</dataType>';
		$xmls .= '<tableName>opencall</tableName>';
		$xmls .= '<columnName>message</columnName>';
		$xmls .= '<dataSize>1024</dataSize>';
		$xmls .= '<displayName>message</displayName>';
		$xmls .= '</message>';
		$xmls .= '<response>';
		$xmls .= '<dataType>varchar</dataType>';
		$xmls .= '<tableName>opencall</tableName>';
		$xmls .= '<columnName>response</columnName>';
		$xmls .= '<dataSize>1000000</dataSize>';
		$xmls .= '<displayName>Message</displayName>';
		$xmls .= '</response>';
		$xmls .= '</metaData>';
		$xmls .= '<rowData>';
		$xmls .= '<row>';
		$xmls .= '<code>'.$code.'</code>';
		$xmls .= '<message>'.$msg.'</message>';
		$xmls .= '<response>'.$response.'</response>';
		$xmls .= '</row>';
		$xmls .= '</rowData>';
		$xmls .= '</data>';
		$xmls .= '</methodCallResult>';
	}
	return $xmls;
}

function generateRowCountString($intCount = 0)
{
	if($_POST['asjson'])
	{
		$xmls = '{"@status":true,"params":{"rowsEffected":"1"},"data":{"rowData":{"row":{"count":"'.$intCount.'"}}}}';
	}
	else
	{

		$xmls = "<?xml version='1.0' encoding='utf-8'?>";
		$xmls .= '<methodCallResult status="ok">';
		$xmls .= '<params>';
		$xmls .= '<rowsEffected>1</rowsEffected>';
		$xmls .= '</params>';
		$xmls .= '<data>';
		$xmls .= '<rowData>';
		$xmls .= '<row>';
		$xmls .= '<count>'.$intCount.'</count>';
		$xmls .= '</row>';
		$xmls .= '</rowData>';
		$xmls .= '</data>';
		$xmls .= '</methodCallResult>';
	}
	return $xmls;
}



function generateSuccessString($rowsAffected=0)
{
	if($_POST['asjson'])
	{
		$xmls = '{"@status":"true","params":{"rowsEffected":"'.$rowsAffected.'"},"data":{}}';
	}
	else
	{
		$xmls = "<?xml version='1.0' encoding='utf-8'?>";
		$xmls .= '<methodCallResult status="ok">';
		$xmls .= '<params>';
		$xmls .= '<rowsEffected>'.$rowsAffected.'</rowsEffected>';
		$xmls .= '</params>';
		$xmls .= '<data>';
		$xmls .= '<rowData>';
		$xmls .= '</rowData>';
		$xmls .= '</data>';
		$xmls .= '</methodCallResult>';
	}
	return $xmls;
}



//-- 12.12.12 - 90128 - nwj - parse $strSQL for currentdd,analystId, groupId, startofday etc
function days_in_month($month, $year) 
{ 
	// calculate number of days in a month 
	return $month == 2 ? ($year % 4 ? 28 : ($year % 100 ? 29 : ($year % 400 ? 28 : 29))) : (($month - 1) % 7 % 2 ? 30 : 31);
} 

function parseStandardDatabaseSearchFilters($strSQL)
{
	global $session;
	global $oAnalyst;
	$arrFind = Array("&[analystid]","&[groupid]","&[session.analystid]","&[session.groupid]","&[session.currentdd]","&[contacta]","&[contactb]","&[contactc]","&[contactd]","&[contacte]","&[contactf]","&[contactg]","&[contacth]");
	$arrReplace = Array($session->analystid,$session->groupid,$session->contextanalystid,$session->contextgroupid,$session->currentdatadictionary,$oAnalyst->contacta,$oAnalyst->contactb,$oAnalyst->contactc,$oAnalyst->contactd,$oAnalyst->contacte,$oAnalyst->contactf,$oAnalyst->contactg,$oAnalyst->contacth);
	$strSQL = str_replace($arrFind ,$arrReplace,$strSQL);

	//-- now swap out date place holders

	//-- YYYY-MM-DD hh:mm:ss
	$today = date("Y-m-d H:i:s"); 
	$currMonth = date("m");
	$currYear = date("Y");
	$noOfDaysInCurrMonth = date("t");

	$startoftoday	= mktime(0,0,0);
	$endoftoday		= strtotime('+1 days', $startoftoday)-1;
	$startofweek	= strtotime("last Sunday");		//-- startofweek 00:00:00 hours on the last Sunday before today. 
	$endofweek		= strtotime("this Sunday")-1;		//-- endofweek 23:59:59 hours on the first Saturday after today. 
	
	$startofmonth	= mktime(0,0,0,$currMonth,1);		//-- startofmonth 00:00:00 hours on the first day of the current month. 
	$endofmonth		=  mktime(23,59,59,$currMonth,$noOfDaysInCurrMonth);	//-- endofmonth 23:59:59 hours on the last day of the current month. 

	$startOfLastQuarterMonth = 10;
	$endOfLastQuarterMonth = 1;
	$startOfQuarterMonth = 1;
	$endOfQuarterMonth = 3;
	switch($currMonth)
	{
		case 4:
		case 5:
		case 6:
			$startOfQuarterMonth = 4;
			$endOfQuarterMonth = 7;
			break;
		case 7:
		case 8:
		case 9:
			$startOfQuarterMonth = 7;
			$endOfQuarterMonth = 10;
			$startOfLastQuarterMonth = 4;
			$endOfLastQuarterMonth = 7;
			break;
		case 10:
		case 12:
		case 12:
			$startOfQuarterMonth = 10;
			$endOfQuarterMonth = 1;
			$startOfLastQuarterMonth = 7;
			$endOfLastQuarterMonth = 10;
			break;
	}

	$startofquarter = mktime(0,0,0,$startOfQuarterMonth,1,$currYear);	//-- 00:00:00 hours on the first day of the current quarter. A quarter can start in January, April, July or October. 
	$endofquarter = mktime(0,0,0,$endOfQuarterMonth,1,$currYear)-1;	//-- 23:59:59 hours on the last day of the current quarter. A quarter can end in March, June, September or December. 
	$startofyear = mktime(0,0,0,1,1,$currYear); //-- startofyear 00:00:00 hours on the first day of the current year. 
	$endofyear = mktime(23,59,59,12,days_in_month(12,$currYear),$currYear); //-- endofyear 23:59:59 hours on the last day of the current year.  
	
	$lastYear = $currYear;
	$lastMonth = $currMonth-1;
	if($lastMonth==0)
	{
		$lastYear = $lastYear-1;
		$lastMonth=12;
	}
	
	$startofyesterday = $startoftoday - 86400;
	$endoftoyesterday = $endoftoday - 86400;
	$startoflastweek = $startofweek - (86400*7);
	$endoflastweek = $endofweek - (86400*7);
	$startoflastmonth = mktime(0,0,0,$lastMonth,1,$lastYear);
	$endoflastmonth = mktime(23,59,59,$lastMonth,days_in_month($lastMonth,$lastYear));
	$startoflastquarter = mktime(0,0,0,$startOfLastQuarterMonth,1,$currYear);	
	$endoflastquarter = mktime(0,0,0,$endOfLastQuarterMonth,1,$currYear)-1;	
	$startoflastyear = mktime(0,0,0,1,1,$currYear-1); 
	$endoflastyear = mktime(23,59,59,12,days_in_month(12,$currYear-1),$currYear-1);


	$arrFind = Array(	"&[startoftoday]","&[endoftoday]","&[startofweek]","&[endofweek]","&[startofmonth]","&[endofmonth]","&[startofquarter]","&[endofquarter]",
						"&[startofyear]","&[endofyear]","&[startofyesterday]","&[endoftoyesterday]",
						"&[startoflastweek]","&[endoflastweek]","&[startoflastmonth]","&[endoflastmonth]",
						"&[startoflastquarter]","&[endoflastquarter]","&[startoflastyear]","&[endoflastyear]");
	$arrReplace = Array($startoftoday,$endoftoday,$startofweek,$endofweek,$startofmonth,$endofmonth,$startofquarter,$endofquarter,
						$startofyear,$endofyear,$startofyesterday,$endoftoyesterday,
						$startoflastweek,$endoflastweek,$startoflastmonth,$endoflastmonth,
						$startoflastquarter,$endoflastquarter,$startoflastyear,$endoflastyear);

	$strSQL = str_replace($arrFind ,$arrReplace,$strSQL);

	return $strSQL;
}


//-- given a file type and uplaod type will return true or false if file is allowed
function checkUploadedFileTypeAllowed($strFileName, $strUploadType = "Global")
{
	global $portal;

	$strFileType = pathinfo($strFileName, PATHINFO_EXTENSION);
	
	//-- get xml config file
	$strFile =  $portal->fs_server_installpath ."/conf/swserverservice.xml";
    $xmlfp = file_get_contents($strFile);
	$xmlDoc = domxml_open_mem(utf8_encode($xmlfp));
	if($xmlDoc)
	{
		$root = $xmlDoc->document_element();

		//-- check restrictions
		$arrFUR = $root->get_elements_by_tagname("FileUploadRestrictions");
		if($arrFUR[0])
		{
			//-- check based on type
			$arrFUR = $arrFUR[0]->get_elements_by_tagname($strUploadType);
			if($arrFUR[0])
			{
				$xmlBlacklist = $arrFUR[0]->get_elements_by_tagname("Blacklist");
				$cCount = sizeOf($xmlBlacklist);
				for($x=0;$x<$cCount;$x++)
				{
					$item = $xmlBlacklist[$x];
					$strRestrictType = strToLower(trim($item->get_content()));
					if($strRestrictType==$strFileType)return false;
				}
			}
		
			if($strUploadType!="Global")
			{
				//-- check global
				$arrFUR = $root->get_elements_by_tagname("FileUploadRestrictions");
				$arrFUR = $arrFUR[0]->get_elements_by_tagname("Global");
				if($arrFUR[0])
				{
					$xmlBlacklist = $arrFUR[0]->get_elements_by_tagname("Blacklist");
					$cCount = sizeOf($xmlBlacklist);
					for($x=0;$x<$cCount;$x++)
					{
						$item = $xmlBlacklist[$x];
						$strRestrictType = strToLower(trim($item->get_content()));
						if($strRestrictType==$strFileType)return false;
					}
				}
			}

			return true;
		}
		else
		{
			return true; //-- no restrictions defined
		}
	}
	return false;
}

function runUserDefinedFunction($function_name = "")
{
	if($function_name!="")
	{
		$func = get_defined_functions();
		$user_func = array_flip($func['user']);
		unset($func);
		
		if(isset($user_func[strToLower($function_name)]) )
		{
			return $function_name();
		}		
	}
}

RedefineForDocker::standardizeXmlmc();
