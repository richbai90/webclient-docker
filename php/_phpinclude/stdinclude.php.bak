<?php

include('php5requirements.php');

/* 
	Created by Hornbill Systems
	
	updates

	code	bug				description
	-----------------------------------------------------------------------------------
	ind01   57338			standardise prepare for SQL to comply with ASCII Standards
	san01	60437 & 60438	New function CheckAnalystRightsA() to check analysts rights 
*/

function prepareHTMLfordisplay($var)
{
 		$var=str_replace("<","&lt;",$var);
		$var=str_replace(">","&gt;",$var);
		$var=nl2br($var);

return $var;
}

function prepareforHTML($var,$sessid)
{
        $var = str_replace("%", "%25",$var);
        $var = str_replace(" ", "%20",$var);
        $var = str_replace("$", "%24",$var);
        $var = str_replace("&", "%26",$var);
        $var = str_replace("+", "%2B",$var);
        $var = str_replace(",", "%2C",$var);
        $var = str_replace("/", "%2F",$var);
        $var = str_replace(":", "%3A",$var);
        $var = str_replace(";", "%3B",$var);
        $var = str_replace("=", "%3D",$var);
        $var = str_replace("?", "%3F",$var);
        $var = str_replace("@", "%40",$var);
        $var .= "&" . "sessid=" . $sessid;
		$var .= "&" . "dd=" . $GLOBALS["dd"];
 return $var;
}

function UnPrepareforHTML($var)
{
        $var = str_replace("%25", "%",$var);
        $var = str_replace("%20", " ",$var);
        $var = str_replace("%24", "$",$var);
        $var = str_replace("%26", "&",$var);
        $var = str_replace("%2B", "+",$var);
        $var = str_replace("%2C", ",",$var);
        $var = str_replace("%2F", "/",$var);
        $var = str_replace("%3A", ":",$var);
        $var = str_replace("%3B", ";",$var);
        $var = str_replace("%3D", "=",$var);
        $var = str_replace("%3F", "?",$var);
        $var = str_replace("%40", "@",$var);
 return $var;
}

function prepareforSQL($var)
{
		//ind01 BUG: 57338 $var = str_replace("'", "\'",$var);
        $var = str_replace("'", "''",$var);
 return $var;
}

//-- NWJ - conv str callref F000 to jsut the callref num
function unpad_callref($strCallref)
{
	$intCallref = substr($strCallref, 1) + 0;
	return $intCallref;
}

//--
//-- get a var value - check post/get and globals
function gv($strVarName)
{
	if(isset($_REQUEST[$strVarName])) return $_REQUEST[$strVarName];
	if(isset($GLOBALS[$strVarName])) return $GLOBALS[$strVarName];
	if(isset($_SESSION[$strVarName])) return $_SESSION[$strVarName];
	return "";
}


//	<FN dt=15-June-2006>

//	Regular expression constants to be used for matching various date/time values
//	matches UK formats: dd/MM/yyyy HH:mm:ss
@define ("SW_REGEXP_UK_DTFMT", "(\d{1,2}\\/\d{1,2}\\/\d{4} \d{1,2}:\d{1,2}:\d{1,2})");

//	matches UK formats printed like: [dd/MM/yyyy HH:mm:ss]-UTC.
@define ("SW_REGEXP_UK_DTFMT_UTC", "(\\[\d{1,2}\\/\d{1,2}\\/\d{4} \d{1,2}:\d{1,2}:\d{1,2}\\]-UTC)");

//	matches the ISO formats like: [yyyy-MM-dd HH:mm:ss]-UTC.
@define ("SW_REGEXP_ISO8601_DTFMT_UTC", "(\\[\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}\\]-UTC)");

//	matches the ISO formats like: yyyy-MM-dd HH:mm:ssZ.
@define ("SW_REGEXP_ISO8601_DTFMT_Z", "(\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}Z)");

//	matches ISO formats like yyyy-mm-ddTHH:mi:ssZ where:
//	 	* T can be replaced by space or 
//		* both T and Z could miss or 
//		* any or all of the - and : delimiters could miss
@define ("SW_REGEXP_ISO8601_DTFMT", "(\d{4}-?\d{2}-?\d{2}[T ]?\d{2}:?\d{2}:?\d{2}Z?)");

//	Constants for identifying the control types in data dictionary. The values are from SwCoreLib, file SwColumnDesc.h
//	They are used by the extension DLL, returned by function [swdti_getfieldtype].
//	Example: 
//		swdti_getfieldtype("opencall.logdatex") == SWCD_CONTROL_DATETIMECTRL

@define ("SWCD_CONTROL_EDIT",				0);		// Standard Edit property
@define ("SWCD_CONTROL_COMBO",				1);   	// Standard Combo list
@define ("SWCD_CONTROL_FLAGCOMBO",			2);		// Flags Combo
@define ("SWCD_CONTROL_DISTCOMBO",			3);		// Distinct SQL combo
@define ("SWCD_CONTROL_PASSWORDEDIT",		4);		// Single line password edit field
@define ("SWCD_CONTROL_DATETIMECTRL",		5);   	// Date/Time Picker
@define ("SWCD_CONTROL_YESNO",				6);   	// True/False or Yes/No picker
@define ("SWCD_CONTROL_ICON",				7);   	// Image control for displaying icons
@define ("SWCD_CONTROL_DISTCOMBOWITHICON",	8);		// Distinct SQL combo with Icon image
@define ("SWCD_CONTROL_DISTCOMBODUALVALUE",	9);		// Distinct SQL combo that holds two values per item (e.g. CODE/DESCRIPTION)
@define ("SWCD_CONTROL_FORMFLAGS",			10);	// Same as flags combo but flags are displayed on the form
@define ("SWCD_CONTROL_SWEMAILADDRESS",		11);	// Display/Pick an e-mail address from the GAL
@define ("SWCD_CONTROL_INCLUDEEXCLUDELIST",	12);	// Displays a list of items to include/exclude. result list is stored as a comma separated list
@define ("SWCD_CONTROL_PICKLISTEDITOR",		13);	// Displays an editable list of items/value to display in a pick list combo
@define ("SWCD_CONTROL_FLAGLISTEDITOR",		14);	// Displays an editable list of items/value to display in a flag list combo
@define ("SWCD_CONTROL_SECONDTIMEPERIOD",	15);	// Displays a time period in h:mm:ss
@define ("SWCD_CONTROL_MINUTETIMEPERIOD",	16);	// Displays a time period in h:mm
@define ("SWCD_CONTROL_COMBO2",				17);	// Displays an editable list of text values to display in a pick list combo
@define ("SWCD_CONTROL_LOCDISTCOMBO",		18);	// Distinct pick list for local ODBC databases

//	Constants for identifying the column data types in data dictionary. The values are from SwCoreLib, file SwVariable.h
//	Not all of them are listed here. They are used by the extension DLL, returned by function [swdti_getdatatype].
//	Example: 
//		swdti_getdatatype("opencall.logdatex") == VT_V_DWORD
@define ("VT_V_STRING",     	0x0008);
@define ("VT_V_DWORD",     	0x0012);
@define ("VT_V_DOUBLE",		0x0016);

//	Constants for identifying the time tokens. It is used with [SwFormatDateTimeColumn], please see the comments of this function.
@define ("SW_DTFMT_TOKEN_YEAR",		0x0001);
@define ("SW_DTFMT_TOKEN_MONTH",		0x0002);
@define ("SW_DTFMT_TOKEN_DAY",		0x0004);
@define ("SW_DTFMT_TOKEN_HOURS",		0x0008);
@define ("SW_DTFMT_TOKEN_MINUTES",	0x0010);
@define ("SW_DTFMT_TOKEN_SECONDS",	0x0020);
@define ("SW_DTFMT_TOKEN_AMPM",		0x0040);

//	Constants for Date/Time modes - returned by PHP extension function [swdti_getdtmode]
@define ("SW_DTMODE_DATETIME", 0);
@define ("SW_DTMODE_DATEONLY", 1);
@define ("SW_DTMODE_TIMEONLY", 2);
@define ("SW_DTMODE_CUSTOM", 3);

//	Constants for various Date/Time formats
@define ("SW_DTFMT_PHP_ISO8601",	"Y-m-d H:i:s");
@define ("SW_DTFMT_COMCTRL32_ISO8601",	"yyyy-MM-dd HH:mm:ss");
@define ("SW_DTFMT_COMCTRL32_ISO8601_DATE",	"yyyy-MM-dd");
@define ("SW_DTFMT_COMCTRL32_ISO8601_TIME",	"HH:mm:ss");
@define ("SW_DTFMT_COMCTRL32_UK", "dd/MM/yyyy HH:mm:ss");

@define ("SW_DEFAULT_DATA_DICTIONARY_NAME", "Default");
@define ("SW_DEFAULT_TIMEZONE_NAME", "GMT Standard Time");
@define ("SW_DEFAULT_TIMEZONE_OFFSET", 0);

//	Error constant returned by [SwGetTimezoneOffset] function
@define ("SW_GET_TZ_OFFSET_ERROR", -999999);

//	Error constant returned by [SwGetCrtTimezoneOffset] function
@define ("SW_ERR_GET_CRT_TIMEZONE_OFFSET", -9999999);

//	Error messages
@define ("SW_FAIL_TO_DEDUCE_TIMEZONE", "<B>Warning:</B> The timezone offset failed to be deduced for time zone [%s]. As a result no time zone offset has been applied and all date/time fields are displayed in UTC.");
@define ("SW_REPORTS_FAIL_TO_DEDUCE_RUNNING_MODE", "<B>Warning:</B> The report is running in neither interactive or scheduled mode. Time zone used = [%s], all date/time fields are displayed using [%s] format and against the [%s] data dictionary.");
@define ("SW_REPORTS_NO_TIMEZONE", "<B>Warning:</B> The report is running in scheduled mode and the timezone parameter has not been passed in URL. The default value [%s] is used in place.");
@define ("SW_REPORTS_NO_DATETIME_FMT", "<B>Warning:</B> The report is running in scheduled mode and the date/time format parameter has not been passed in URL. The default value [%s] is used in place.");
@define ("SW_REPORTS_NO_DATA_DICTIONARY", "<B>Warning:</B> The report is running in scheduled mode and the data dictionary parameter has not been passed in URL. The default value [%s] is used in place.");
@define ("SW_NO_CUSTOM_FORMAT", "[Custom DateTime field must set CustomFormat]");
@define ("SW_ERR_SWDTI_OFFSET_TIME_FAILED", "Offset to timezone failed");
@define ("SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED", "SWDTI_TIMEFROMSTRING_UK failed");
@define ("SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED", "SWDTI_TIMEFROMSTRING_ISO failed");
@define ("SW_ERR_GET_CRT_TIMEZONE_FAILED", "SwGetCrtTimezoneOffset failed");

function remove_phpdtfmt_token($strDateTimePhpFormat, $arTokens, $arSeparators)
{
	foreach ($arTokens as $chToken)
	{
		$nTokenPos = strpos($strDateTimePhpFormat, $chToken);
		if ($nTokenPos === false)
			continue;
		
		// trim separators on left side
		if ($nTokenPos-1 >= 0)
		{
			if (in_array($strDateTimePhpFormat[$nTokenPos-1], $arSeparators)) 
			{
				$strDateTimePhpFormat = substr_replace($strDateTimePhpFormat, "", $nTokenPos-1, strlen($chToken)+1);
				continue;
			}
		}

		// trim separators on right side
		if ($nTokenPos+1 <= strlen($strDateTimePhpFormat))
		{
			if (in_array($strDateTimePhpFormat[$nTokenPos+1], $arSeparators)) 
			{
				$strDateTimePhpFormat = substr_replace($strDateTimePhpFormat, "", $nTokenPos, strlen($chToken)+1);
				continue;
			}
		}
	}
	return $strDateTimePhpFormat;
}

//	The function returns a string from which the tokens specified in [$nTokensToBeExcluded] were removed.
//	[nTokensToBeExcluded] is a mask made of a "bitwise or" combination of any of the above DTFMT_TOKEN_ constants
//	[$strDateTimePhpFormat] must be a string in PHP format style used by time formatting functions, like "Y-m-d H:i:s"
//	These characters are considered to be separators of the tokens: "-/\\:_.,%*|"
//	Example: to get the DT format without the year and seconds tokens, use: 
//		ExcludeDateTimeTokens("Y-m-d H:i:s", SW_DTFMT_TOKEN_YEAR | SW_DTFMT_TOKEN_SEC) == "m-d H:i"

//	When [$nTokensToBeExcluded] contains valid DT tokens to be excluded, then [$strDateTimePhpFormat] should contain only date/time tokens.
//	No other padding text should be included. E.g. passing a string like [$strDateTimePhpFormat] = "This is day d of month m" would not return the expected results :(

function ExcludePhpDateTimeFormatTokens($strDateTimePhpFormat, $nTokensToBeExcluded)
{
	if ($nTokensToBeExcluded == 0x0000) // no token specified
		return $strDateTimePhpFormat;

	//$arPhpDateTimeFormatTokens = array("Y", "y", "F", "M", "m", "n", "l", "D", "d", "j", "H", "G", "h", "g", "i", "s", "A", "a");
	$arDtFmtSeparators = array("-", "/", "\\", ":", "_", ".", ",", "%", "*", "|");

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_YEAR) // remove the year token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("Y", "y"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_MONTH) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("F", "M", "m", "n"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_DAY) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("l", "D", "d", "j"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_HOURS) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("H", "G", "h", "g"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_MINUTES) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("i"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_SECONDS) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("s"), $arDtFmtSeparators);

	if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_AMPM) // remove the month token
		$strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("A", "a"), $arDtFmtSeparators);

	return $strDateTimePhpFormat;
}

/*	[$strComCtrl32Format] is the format in ComCtrl32 style:
Year tokens
	yyyy : Year with century, as decimal number
	yy : Year without century, as decimal number (00 - 99)

Month tokens
	MMMM : Full month name
	MMM : Abbreviated month name
	MM : Month as decimal number (01 - 12)
	M : Month as decimal number, with the leading zero removed

Day tokens
	dddd : Full weekday name
	ddd : Abbreviated weekday name
	dd : Day of month as decimal number (01 - 31)
	d : Day of month as decimal number, with the leading zero removed

Hour tokens
	HH : Hour in 24-hour format (00 - 23)
	H : Hour in 24-hour format, with the leading zero removed
	hh : Hour in 12-hour format (01 - 12)
	h : Hour in 12-hour format, with the leading zero removed

Minutes tokens
	mm : Minute as decimal number (00 - 59)
	m : Minute as decimal number, with the leading zero removed

Seconds tokens
	ss : Second as decimal number (00 - 59)
	s : Second as decimal number, with the leading zero removed

AM-PM token
	tt : Current locale's A.M./P.M. indicator for 12-hour clock

The function returns the format converted in Php style. Example: ComCtrl32Format_To_PhpFormat("yyyy-MM-dd HH:mm:ss") == "Y-m-d H:i:s"
*/

function ComCtrl32Format_To_PhpFormat($strComCtrl32Format)
{
	$arComCtrl32Formats = array(
		"yyyy", "yy",			
		"MMMM", "MMM", "MM", "M",
		"dddd", "ddd", "dd", "d",
		"HH", "H", "hh", "h", 
		"mm", "m",
		"ss", "s",
		"tt", "t"
		);
	$arPhpFormats = array(
		"Y", "y", 
		"F", "M", "@111@", "n",	
		"l", "D", "@222@", "j",
		"@333@", "G", "h", "g", 
		"i", "i",
		"s", "s",
		"A", "a"
		);

	$res = str_replace($arComCtrl32Formats, $arPhpFormats, $strComCtrl32Format);

	// Replace the temporary strings ...
	$arComCtrl32Formats = array("@111@", "@222@", "@333@");
	$arPhpFormats = array("m", "d", "H");

	return str_replace($arComCtrl32Formats, $arPhpFormats, $res);
}
/*
<FN> 
	Old implementation : the function didtn't support all format tokens (more exactly those commented) 
</FN>
function ComCtrl32Format_To_PhpFormat($strComCtrl32Format)
{
	$arComCtrl32Formats = array(
		"yyyy", "yy",			
		"MMMM", "MMM", "MM", "M",
		"dddd", "ddd", "dd", //"d",
		"HH", "hh", "h", //"H"
		"mm", //"m",
		"ss", "s",
		"tt", "t"
		);
	$arPhpFormats = array(
		"Y", "y", 
		"F", "M", "m", "n",	
		"l", "D", "d", //"j",
		"H", "h", "g", //"G"
		"i", //"i",
		"s", "s",
		"A", "a"
		);

	return str_replace($arComCtrl32Formats, $arPhpFormats, $strComCtrl32Format);
}
*/

//	--------------------------------------------------------------------------------------
//	SwFormatDateTimeColumn
//	--------------------------------------------------------------------------------------
//	[$column]: must be passed in as "table_name.column_name"
//		Current data dictionary is the one loaded using [swdti_load]. It must be loaded before calling this function.

//	[$vDateTimeValue]:	variant (integer or string). If data type of the column in data dictionary is:
//		- VT_V_DWORD then [$vDateTimeValue] must hold a valid UTC Unix unsigned integer date/time (time_t style).
//		- VT_V_STRING then [$vDateTimeValue] must hold a valid formatted date/time string which meets the next conditions:
//			* is always in UK format, e.g 14/07/2006 11:12:41
//			* is always in UTC (created by Helpdesk server, using CSwTime::FormatGmt function)

//	[nTokensToBeExcluded] is a mask made of a "bitwise or" combination of any of the above DTFMT_TOKEN_ constants
//		For example to exclude the years and seconds use it like:
//			SwFormatDateTimeColumn("opencall.logdatex", $logdatex, SW_DTFMT_TOKEN_YEAR|SW_DTFMT_TOKEN_SECONDS);
//		Please take into account that the next characters are all considered separators of the tokens: "-/\\:_.,%*|".

//	Examples:
//		In both analyst portal and helpdesk client (active pages) call it like: 
//		 	$sFormattedDateTime = SwFormatDateTimeColumn("opencall.logdatex", $logdatex);	// time_t style version 
//		 	$sFormattedDateTime = SwFormatDateTimeColumn("opencall.logdate", "14/07/2006 11:12:41");	// UTC formatted string version

//	Observations:
//	1. Reason for not having YET a PHP extension function to format a date/time column, like: swdti_formatdatetime_column($column, $value, $format, $tzoffset);
//	To update the extension DLL we need to stop the HTTP server and in case of mistakes or other specific customizations 
//	required by web pages I wanted to allow easy modifications of PHP files without stoping the HTTP server!
//	Such, I've broken down in pieces the information that I needed from helpdesk server and I implemented the formatting function in plain PHP.
//	In case we won't need any more specific customization in web applications then the extension function should implement 
//	same behavior as the PHP one. The extension function will also be much faster!

//	TO DO: clarify the bahavior for [selfservice] web pages - for moment the associated data dictionary is unclear!
//	Probably no DD will be used and then [SwFormatDateTimeValue] should be used.

//	16-Oct-2006: The column [sw_sessions.TimeZoneOffset] is NOT USED ANYMORE!
//	So, $GLOBALS['tz'] and $GLOBALS['config_tz'] are obsolete from now on!

function SwFormatDateTimeColumn($column, $vDateTimeValue, $nTokensToBeExcluded=0x0000)
{
	if (is_null($vDateTimeValue) || $vDateTimeValue == 0 || $vDateTimeValue == "")
		return "";

	$nUtcUnixDate = -1;
	switch (swdti_getdatatype($column)) // [is_integer] available in PHP is just beyond the purpose of this function!
	{
	case VT_V_STRING:
		//	[swdti_timefromstring_uk] converts a Date/Time string represented in UK format to the Unix number.
		//	the last parameter (boolean) specifies whether the string is in UTC (pass value 1) or in local time (pass value 0)
		$nUtcUnixDate = swdti_timefromstring_uk($vDateTimeValue, 1); // use the UTC version as the string values are inserted in DB in UTC!
		if ($nUtcUnixDate == -1)
			return "<Conversion of Obsolete Date/Time String Failed>";
		break;
	case VT_V_DWORD: //nothing else to do - this is what I expect!
		$nUtcUnixDate = intval($vDateTimeValue);
		break;
	default:
		return "<Invalid Data Type>";
	}

	//	set the global variable names used to retrieve the analyst's format
  	//	for a reason?, SwAnalystSessionManager inserts them prefixed by [config_] :(
  	$prefix = "";
	$useVariableArray = &$GLOBALS;
	if (array_key_exists('config_datetimefmt', $GLOBALS))$prefix = 'config_';
	if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION))
	{
		$useVariableArray = &$_SESSION;
		$prefix = 'wc_';
	}
	
	//	[$strComCtrl32Format] is the format in ComCtrl32 style, like yyyy-MM-dd HH:mm:ss
  	$strComCtrl32Format = "";	//SW_DTFMT_COMCTRL32_ISO8601;
	switch (swdti_getdtmode($column))
  	{
	case SW_DTMODE_DATETIME: 	//DateTime
		$strComCtrl32Format = $useVariableArray[$prefix.'datetimefmt'];
		break;
	case SW_DTMODE_DATEONLY:	// Date
		$strComCtrl32Format = $useVariableArray[$prefix.'datefmt'];
		break;
	case SW_DTMODE_TIMEONLY:	// Time
		$strComCtrl32Format = $useVariableArray[$prefix.'timefmt'];
		break;
	case SW_DTMODE_CUSTOM:	// Custom Format in DD takes precedence over the session parameters;
		// in this case if in DD [Custom Format] is left blank, then the field will be displayed blank!
		$strComCtrl32Format = swdti_getdtformat($column);
		if ($strComCtrl32Format == "")
			return SW_NO_CUSTOM_FORMAT;
		else
			break;
	}

	$strPhpFormat = ComCtrl32Format_To_PhpFormat($strComCtrl32Format);
	if ($nTokensToBeExcluded != 0x0000)
		$strPhpFormat = ExcludePhpDateTimeFormatTokens($strPhpFormat, $nTokensToBeExcluded);

	//	[$nTimezone]:		INTEGER - a valid timezone offset in seconds.
	//		Must be a positive value (+) for Eastern time zones (GMT + x) and negative value (-) for Western time zones (GMT - x)
	//		For example, if the desired timezone is GMT+02:00, then
	//		[$nTimezone] == 10800 seconds (3 hours) if [$nUtcUnixDate] is IN Daylight Saving Time, OR
	//					 == 7200 seconds (2 hours) if [$nUtcUnixDate] is NOT IN Daylight Saving Time.

	//NEW - using the time zone name!
	$nTime = swdti_offset_time($useVariableArray[$prefix.'timezone'], $nUtcUnixDate);
	if ($nTime < 0)
		return SW_ERR_SWDTI_OFFSET_TIME_FAILED;
	return gmdate($strPhpFormat, $nTime);

	//OLD:
	//$nTimezone = $GLOBALS[$prefix.'tz'];
	//return gmdate($strPhpFormat, $nUtcUnixDate + $nTimezone);
}

//	this function is internal to this file
function pvGetSessionDateTimeFormat($dtMode)
{
  	//	for a reason?, SwAnalystSessionManager inserts them prefixed by [config_] :(
  	$prefix = "";
	$useVariableArray = &$GLOBALS;
	if (array_key_exists('config_datetimefmt', $GLOBALS))$prefix = 'config_';
	if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION))
	{
		$useVariableArray = &$_SESSION;
		$prefix = 'wc_';
	}

  	$strComCtrl32Format = "";	//SW_DTFMT_COMCTRL32_ISO8601;
	switch ($dtMode)
  	{
	case SW_DTMODE_DATETIME: 	//DateTime
		if(!$useVariableArray[$prefix.'datetimefmt'])
			$strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601;
		else
			$strComCtrl32Format = $useVariableArray[$prefix.'datetimefmt'];
		break;
	case SW_DTMODE_DATEONLY:	// Date
		if(!$useVariableArray[$prefix.'datefmt'])
			$strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601_DATE;
		else
			$strComCtrl32Format = $useVariableArray[$prefix.'datefmt'];
		break;
	case SW_DTMODE_TIMEONLY:	// Time
		if(!$useVariableArray[$prefix.'timefmt'])
			$strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601_TIME;
		else
			$strComCtrl32Format = $useVariableArray[$prefix.'timefmt'];
		break;
	default:					//	no support for any other formats!!!
		return "Unsupported [dtMode]";
	}

	$strPhpFormat = ComCtrl32Format_To_PhpFormat($strComCtrl32Format);
	return $strPhpFormat;
}

//	It formats only simple UTC Unix time_t values using a custom time zone and the analyst's DT formats. 
//	Data Dictionary is not considered. Such function is needed by SLA Diagnostic page (sladiag.php).
//	Parameters:
//		[$dtMode]: 			One of SW_DTMODE_ constants, but SW_DTMODE_CUSTOM is not supported, as it is beyond the purpose of this function!!!
//		[$nUtcUnixDate]:	UNSIGNED INTEGER - a valid UTC Unix date/time (time_t).
//		[$sTimezoneName]:	STRING - a valid timezone name from column [system_timezones.name]
//							If it is not provided (null or empty string), [nUtcUnixDate] value will be formatted as is - i.e. no time zone offset is applied.
function SwFormatTimestampValue($dtMode, $nUtcUnixDate, $sTimezoneName="")
{
	if (is_null($nUtcUnixDate) || $nUtcUnixDate == 0 || $nUtcUnixDate == "")
		return "";
		
	if (is_null($sTimezoneName) || $sTimezoneName == "")
	{
	  	$nTime = $nUtcUnixDate;
	}
	else
	{
		$nTime = swdti_offset_time($sTimezoneName, $nUtcUnixDate);
		if ($nTime < 0)
			return SW_ERR_SWDTI_OFFSET_TIME_FAILED;
	}

	$strPhpFormat = pvGetSessionDateTimeFormat($dtMode);
	return gmdate($strPhpFormat, $nTime);
}

// Format an UTC Unix time_t according to the currently logged in analyst settings in swsessions: date/time format + timezone name
//		[$dtMode]: 			One of SW_DTMODE_ constants, but SW_DTMODE_CUSTOM is not supported, as it is beyond the purpose of this function!!!
//		[$nUtcUnixDate]:	UNSIGNED INTEGER - a valid UTC Unix date/time (time_t).
function SwFormatAnalystTimestampValue($dtMode, $nUtcUnixDate)
{
  	//	for a reason?, SwAnalystSessionManager prefixes the global variables by [config_] :(
 	$prefix = "";
	$useVariableArray = &$GLOBALS;
	if (array_key_exists('config_datetimefmt', $GLOBALS))$prefix = 'config_';
	if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION))
	{
		$useVariableArray = &$_SESSION;
		$prefix = 'wc_';
	}

	return SwFormatTimestampValue($dtMode, $nUtcUnixDate, $useVariableArray[$prefix.'timezone']);
}

//	[$sTimezoneName] => The time zone name from DB column system_timezones.name
//	Retrieves the time-zone offset between [sTimezoneName] and UTC (GMT Standard, without the extra hour of DST)
//	It retrieves it in seconds, positive value (+) for Eastern time zones and negative value (-) for Western time zones.
//	If the time held is in Daylight Savings, the appropriate shift is applied.
function SwGetCrtTimezoneOffset($sTimezoneName)
{
  	$ret = swdti_get_crt_timezone_offset($sTimezoneName);
	if ($ret == SW_ERR_GET_CRT_TIMEZONE_OFFSET)
		return SW_ERR_GET_CRT_TIMEZONE_FAILED;
	else
		return $ret;
}

//	-------------------------------------------------------------------------------------------------------
//									18-Oct-2006 : OBSOLETE!!!!
//	-------------------------------------------------------------------------------------------------------

//	18-Oct-2006 : OBSOLETE!!!! This function must not be used as the timezone offset is irrelevant when displaying dates from past!
//	Instead, use one of SwFormatTimestampValue or SwFormatAnalystTimestampValue
function SwFormatDateTimeValue($dtMode, $nUnixDate, $nTimezone)
{
	if (is_null($nUnixDate) || $nUnixDate == 0 || $nUnixDate == "")
		return "";
	$strPhpFormat = pvGetSessionDateTimeFormat($dtMode);
	return gmdate($strPhpFormat, $nUnixDate + $nTimezone);
}

//	18-Oct-2006 : OBSOLETE!!!!
//	[$srvName] => The helpdesk server machine (host name or IP). Generally the constant [_SERVER_NAME] is passed.
//	[$strTimeZone] => The time zone name from DB column system_timezones.name

// 	The function opens an anonymous connection to helpdesk server (it doesn't need a session context) 
//	and sends [GET TIMEZONE OFFSET] command.
//	Full request format: GET TIMEZONE OFFSET timezone=value
//	where [value] must match one of the values in table [system_timezones], column [name].
//	Response format: +OK value, where [value] is a decimal value, representing the time zone offset.

//	In case of any error the function returns SW_GET_TZ_OFFSET_ERROR, 
//	otherwise it returns the decimal timezone offset in seconds from UTC. (the value is retrieved using the C++ method CSwTzTime::GetTimeZoneOffset)
/*
function SwGetTimezoneOffset($srvName, $strTimeZone)
{
	$con = swhd_open($srvName, "", "");
	if($con > 32) // error
		return SW_GET_TZ_OFFSET_ERROR;
	if (swhd_sendcommand($con, "GET TIMEZONE OFFSET timezone=".$strTimeZone))
	{
		$ret = swhd_getlastresponse($con);	// Get the response
		swhd_close($con);
		// Strip off the "+OK " then trim and that's the expected timezone offset
		$ret = substr($ret, 4);
		return trim($ret, "\r\n");
	}
	else
	{
		swhd_close($con);
		return SW_GET_TZ_OFFSET_ERROR;
	}
}
*/
//	</FN>



/**
* int/float $config_sla  The number to which to perform a bitwise AND
* int/float $analyst_rights  The number with which to perform a bitwise AND
* return bool 
*/
function CheckAnalystRightsA($config_sla,$analyst_rights)
{
	if( $config_sla< 2147483647 )
	{
		return (($config_sla& $analyst_rights)==$analyst_rights);   
	}
	else
	{
		$binNumber = strrev(base_convert($config_sla,10,2));
		$binComparison = strrev(base_convert($analyst_rights,10,2));
		for( $i=0; $i<strlen($binComparison); $i++ )
		{
			if( strlen($binNumber)<$i || ($binComparison{$i}==="1" && $binNumber{$i}==="0") )
			{
				return 0;   
			} 
		}
		return 1;
	}
}


?>