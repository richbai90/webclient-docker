<?php
set_time_limit(90);

//-- 18.02.2010 - include file that defines what app code to use
require_once("rpt_appcode.php");
require_once("rpt_incl_dbc.php");

//DTE fix for F00044302 and F00044303 - Added the following include
require_once("rpt_incl_columnoverride.php");
include_once ('stdinclude.php');

error_reporting(E_ALL & ~E_NOTICE);

define('_INSTANCE_NAME', 'selfservice');
define('_SERVER_NAME', '127.0.0.1');

$data_type = "odbc";
$data_user = swuid();
$data_pass = swpwd();
$data_srvr = swdsn();
$data_dbselect = "swdata";					// Only for MySQL
$data_db = swdsn();
$data_port = "";							// Only for PostgreSQL
$data_underlying = "";						// Only for ODBC ('mssql' changes how the class finds the last insert ID)

$conf_type = "sw_systemdb";
$conf_db = "Supportworks Cache";
$conf_user = swcuid();
$conf_pass = swcpwd();
$conf_srvr = "localhost:5002";
$conf_dbselect = "sw_systemdb";				// Only for MySQL
$conf_port = "";							// Only for PostgreSQL
$conf_underlying = "";						// Only for ODBC ('mssql' changes how the class finds the last insert ID)

$conf_table = "system_reports_ex";			// Table where report configs will be
$conf_tmpdb = "sw_systemdb";					// Database for temporary args, can be same db (REQUIRED)
$conf_tmptable = "tmp_graph_args";			// Table for temporary args

$hist_table = "system_report_history";		// Table where report run history is kept

$fmt_title_date = "jS F Y";
$fmt_title_datetime = "jS F Y @ H:i:s";

$create_session 		= true;
$swcall_opennewwindow	= false;
$nocachpage 			= false;

//	<FN dt=27-June-2006>

// Given column name and data, return column value
function report_get_column_value($arrColumnDetails,$arrData,$strColumnName)
{
	$idx = 0;
	foreach($arrColumnDetails as $single_column)
	{
		if (strcmp($single_column['Col'],$strColumnName)==0)
		{
			break;
		}
		$idx ++;
	}
	return $arrData[$idx];
}


function apply_default_format_settings()
{
	$GLOBALS['timezone'] = SW_DEFAULT_TIMEZONE_NAME;
	//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
	//$GLOBALS['tz'] = SW_DEFAULT_TIMEZONE_OFFSET;
	//	</FN>
	$GLOBALS['datetimefmt'] = SW_DTFMT_COMCTRL32_ISO8601;
	$GLOBALS['dd'] = SW_DEFAULT_DATA_DICTIONARY_NAME;

  	echo sprintf(SW_REPORTS_FAIL_TO_DEDUCE_RUNNING_MODE, $GLOBALS['timezone'], $GLOBALS['datatimeformat'], gv('dd')).'<br>';
}

function is_scheduled()
{
  	return $_GET['SCHEDULED'] == 'Y';
}

//	If SCHEDULED is passed in the command line with a value of 'Y' then the report is run in scheduled mode!!!!
//	The function initializes $GLOBALS['datetimefmt'], $GLOBALS['timezone'] and gv('dd') from the GET paramaters passed in commnad line, as
//	[swsessions] table doesn't contain specific session for running the scheduled reports (in case of scheduled reports $sessid parameter is not passed in the command line).
//	Example of command line which runs a report in scheduled mode: 
//		http://localhost/sw/reports/rpt_tmplt_grplst.php?REPORTID=297&SCHEDULED=Y&DD=custom_dd&TIMEZONE=E.%20Europe%20Standard%20Time&DATETIMEFMT=dd.MM.yyyy%20HH:mm:ss
function setup_scheduled_reports()
{
  	// just an extra-check ... does the report run in scheduled mode? If not, then there is nothing to do for us ...
	if (!is_scheduled())
		return false;

	//	set the time zone offset
	if ($_GET['TIMEZONE'] == "")
	{
		echo sprintf(SW_REPORTS_NO_TIMEZONE, SW_DEFAULT_TIMEZONE_NAME);
		$_GET['TIMEZONE'] = SW_DEFAULT_TIMEZONE_NAME;
	}

	$GLOBALS['timezone'] = $_GET['TIMEZONE'];

	//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
	/*
	$tzOffset = SwGetTimezoneOffset(_SERVER_NAME, $_GET['TIMEZONE']);
	if ($tzOffset == SW_GET_TZ_OFFSET_ERROR)
	{
	  	$GLOBALS['tz'] = SW_DEFAULT_TIMEZONE_OFFSET;
		echo sprintf(SW_FAIL_TO_DEDUCE_TIMEZONE, $_GET['TIMEZONE']).'<br>';
	}
	else
		$GLOBALS['tz'] = $tzOffset;
	*/
	//	</FN>
	
	//	set the date/time format to be used for formatting Date/Time fields.
	$GLOBALS['datetimefmt'] = $_GET['DATETIMEFMT'];
	if ($GLOBALS['datetimefmt'] == "")
	{
	  	echo sprintf(SW_REPORTS_NO_DATETIME_FMT, SW_DTFMT_COMCTRL32_ISO8601);
		$GLOBALS['datetimefmt'] = SW_DTFMT_COMCTRL32_ISO8601;
	}

	//	set the data dictionary to be used for formatting (it applies to all kinds of fields)
	if (gv('dd') == "")
	{
	  	echo sprintf(SW_REPORTS_NO_DATA_DICTIONARY, SW_DEFAULT_DATA_DICTIONARY_NAME);
		$GLOBALS['DD'] = SW_DEFAULT_DATA_DICTIONARY_NAME;
	}

	return true;
}
//	</FN>

// All pass by reference to improve performance none of the values are modified
function FormatValue(&$column, &$value)
{
	
	return swdti_formatvalue($column, $value);


	/*
	//DTE fix for F00044302 and F00044303 - Added the following line and first IF statement
	$myval = ColumnFormatOverride($column,$value);
	if (!is_null($myval))
		return $myval;
	else
		//-- nwj 2015-04-08  -- we now use xmlmc to do queries which returns to use formatted values.	
		return $value;
	*/	

	//	<FN> For formatting date/time fields we have to use a specific mechanism as we need some more parameters, like time zone or analyst DT format.
	//	Previous implementation used [swdti_formatvalue] but this function used only DT formats from data dictionary!!!
	//	</FN>
	/*
	 if (swdti_getfieldtype($column) == SWCD_CONTROL_DATETIMECTRL)
	{
		return SwFormatDateTimeColumn($column, $value);
	}
	else if (strpos(",opencall.probcode", $column))
	{
		// Probcode: could write probcode lookup here
		return $value;
	}
	else if (strpos(",opencall.callref", $column))
	{
		return swcallref_str($value);
	}
	else // Everything else
	{
		echo 
		return swdti_formatvalue($column, $value);
	}
	*/
}

//-- nwj - 2015-04-08 - currently report xml conf can have element with two atts called charttop which is invalid xml
function str_replace_nth($search, $replace, $subject, $nth)
{
    $found = preg_match_all('/'.preg_quote($search).'/', $subject, $matches, PREG_OFFSET_CAPTURE);
    if (false !== $found && $found > $nth) {
        return substr_replace($subject, $replace, $matches[0][$nth][1], strlen($search));
    }
    return $subject;
}

function parse_config_xml($strConfigXml,&$attribs, &$index)
{
	$strConfigXml = str_replace_nth("charttop=", "chartalt=", $strConfigXml, 1); //-- replace 2nd occurrence

	$p = xml_parser_create();
	xml_parse_into_struct($p, $strConfigXml, $attribs, $index);
	xml_parser_free($p);
}

function throw_reporterror($inError)
{
	include($theme.'rpt_incl_htmlhead.php');
	$error = $inError;
	include('error.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}

?>
