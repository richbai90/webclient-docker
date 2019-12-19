<?php
# Pull in required includes
require_once("rpt_incl_config.php");
require_once("SwActivePageSession.php");

//  <AI bugref=75627 dt=20090827 release=7.3.11.RC4>
//  Check to see if any passed-in session ID is valid, if passed in at all. Exit with error if not.
//  Code provided by WB. Peer reviewed by AI.
$session = NULL;
if (isset($_GET['sessid']))
{
	$session = new CSwActivePageSession($_GET['sessid']);
	if(!$session->IsValidSession())
	{
		$session = NULL;
	}
}

if(!$session)
{
	if(!is_scheduled())
	{
		echo"Warning no valid session found and not running in scheduled mode.";
		exit;
	}
	setup_scheduled_reports();
}

# Function to return quick date/time links
function swtimelinks($target, $fmt = "d/m/Y", $which = 'S')
{

	if ($which == 'S')
	{
		$html = '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoftoday"))).'\';">Start of Today</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofweek"))).'\';">Start of this Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastweek"))).'\';">Start of Last Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofmonth"))).'\';">Start of this Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastmonth"))).'\';">Start of Last Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofquarter"))).'\';">Start of this Qtr</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofyear"))).'\';">Start of this Year</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastyear"))).'\';">Start of Last Year</a><br />';
	}
	else
	{
		$html = '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoftoday"))).'\';">End of Today</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofweek"))).'\';">End of this Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastweek"))).'\';">End of Last Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofmonth"))).'\';">End of this Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastmonth"))).'\';">End of Last Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofquarter"))).'\';">End of this Qtr</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofyear"))).'\';">End of this Year</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastyear"))).'\';">End of Last Year</a><br />';
	}
	return $html;
}
# Function to return quick date/time links
function swtimelinksjustdate($target, $fmt = "d/m/Y", $which = 'S')
{
	if ($which == 'S')
	{
		$html = '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoftoday"))).'\';">Today</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofweek"))).'\';">Start of this Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastweek"))).'\';">Start of Last Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofmonth"))).'\';">Start of this Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastmonth"))).'\';">Start of Last Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofquarter"))).'\';">Start of this Qtr</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startofyear"))).'\';">Start of this Year</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("startoflastyear"))).'\';">Start of Last Year</a><br />';
	}
	else
	{
		$html = '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoftoday")+86400)).'\';">Tomorrow</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofweek"))).'\';">End of this Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastweek"))).'\';">End of Last Week</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofmonth"))).'\';">End of this Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastmonth"))).'\';">End of Last Month</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofquarter"))).'\';">End of this Qtr</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endofyear"))).'\';">End of this Year</a><br />';
		$html .= '<a href="#" onclick="javascript:document.args.'.$target.'.value=\''.(gmdate($fmt, swtime("endoflastyear"))).'\';">End of Last Year</a><br />';
	}
	return $html;
}



# Create session and find out who is running the report.
if ($create_session) $session = new CSwActivePageSession($sessid);

if (sizeof($_POST))
{
	$querystring = "?webclientreporting=".$_POST['webclientreporting']."&ColourScheme=".$_POST['ColourScheme']."&reportid=".$_POST['reportid']."&sessid=".$_POST['sessid']."&dd=".$_POST['dd']."&tz=".$_POST['tz'];
	$template = $_POST['tmplt'];

	// Split the incoming date/time/datetime lists into BOOLEAN hashes so we know which fields need conversion
	if (sizeof($_POST['dates']))
	{
		$temp = explode(",", $_POST['dates']);
		for ($x = 0 ; $x < sizeof($temp) ; $x++)
		{
			$convert_date[$temp[$x]] = true;
		}
	}
	if (sizeof($_POST['times']))
	{
		$temp = explode(",", $_POST['times']);
		for ($x = 0 ; $x < sizeof($temp) ; $x++)
		{
			$convert_time[$temp[$x]] = true;
		}
	}
	if (sizeof($_POST['datetimes']))
	{
		$temp = explode(",", $_POST['datetimes']);
		for ($x = 0 ; $x < sizeof($temp) ; $x++)
		{
			$convert_datetime[$temp[$x]] = true;
		}
	}

	// Loop through the values, convert them where required
	foreach ($_POST as $key => $val)
	{
		if (strpos(",reportid,sessid,dd,tz,tmplt,dates,times,datetimes,ColourScheme,webclientreporting,", $key)) continue;
		$_POST[$key] = stripslashes($val);

		if ($convert_date[$key])
		{
			// Convert dd/mm/yyyy dates & date ranges to numeric Unix timestamps
			if (strpos($key, "t")) $_POST[$key] = mktime(23, 59, 59, substr($val, 3, 2), substr($val, 0, 2), substr($val, 6, 4));
			else $_POST[$key] = mktime(0, 0, 0, substr($val, 3, 2), substr($val, 0, 2), substr($val, 6, 4));
		}
		else if ($convert_time[$key])
			{
				// Convert hh/mm/ss times & time ranges to numeric time periods in seconds
				$_POST[$key] = (((INT)substr($val, 0, 2) * 3600) + ((INT)substr($val, 3, 2) * 60) + (INT)substr($val, 6, 2));
			}
			else if ($convert_datetime[$key])
				{
					// Convert dd/mm/yyyy hh:mm:ss datetimes & datetime ranges to numeric Unix timestamps
					$_POST[$key] = mktime(substr($val, 11, 2), substr($val, 14, 2), substr($val, 17, 2), substr($val, 3, 2), substr($val, 0, 2), substr($val, 6, 4));
				}
		
//		print $key." = ".$_POST[$key]."<br />";
		// Base64 encode the value and add it to the query string
		$querystring .= "&".$key."=".base64_encode($_POST[$key]);
	}
	//print $template.$querystring."<br />";
	
	header("Location: ".$template.$querystring);
	exit;
}

# Check the existence of a report id and extract it from the query string & initialise a few other variables
$reportid = $_GET['reportid'];
if (!$reportid)
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	include($theme.'rpt_incl_htmlhead.php');
	$error = 3;
	include('error.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}

$dd = $_GET['dd'] ? $_GET['dd'] : "Default";

if (!$conf_conn = new RptMK2DBConn($conf_db, $conf_user, $conf_pass)) print "Config Connection Failed<br />";
if (!$data_conn = new RptMK2DBConn($data_db, $data_user, $data_pass)) print "Data Connection Failed<br />";

# Retrieve & Parse XML Report Config
if ($conf_conn->Query("SELECT reportconf FROM ".$conf_table." WHERE reportid=".$reportid))
{
	$conf_conn->FetchRow();
	if (!$conf_conn->row[0])
	{
		print "Report config empty";
		exit;
	}

	# Parse XML
	$p = xml_parser_create();
	xml_parse_into_struct($p, $conf_conn->row[0], $attribs, $index);
	xml_parser_free($p);

#print_r($attribs);
#print_r($index);

	$report_title = $attribs[$index['REPORT'][0]]['attributes']['NAME']." (Runtime Arguments)";
	$theme = $_GET['theme'] ? $_GET['theme'] : $attribs[$index['REPORT'][0]]['attributes']['THEME'];
	if ($theme)
	{
		if ((file_exists("themes/".$theme."/rpt_incl_htmlhead.php")) && (file_exists("themes/".$theme."/rpt_incl_htmlhead.php"))) $theme = "themes/".$theme."/";
		else $theme = '';
	}

	if ($index['ARG'])
	{
		include_once('swnocachepage.php');
		include_once($theme.'rpt_incl_htmlhead.php');
		$dates = "";
		$times = "";
		$datetimes = "";
		$validate = "\n<script language=\"JavaScript\">\n<!--\nfunction validate()\n{\nvar strLabel='';\nvar arrLabels=new Array();\nvar arrTypes=new Array();\nvar errors=\"\";\n";
		?>
		<br />
		<table border="0" cellspacing="0" cellpadding="0">
		<form action="" method="post" name="args">
		<?php
		$z = 0;
		foreach ($index['ARG'] as $key)
		{
			if (!$attribs[$key]['attributes']) continue;
			$args[$z]['ID'] = $attribs[$key]['attributes']['ID'];
			$args[$z]['Type'] = $attribs[$key]['attributes']['TYPE'];
			$validate .= "arrTypes[" . $z . "] = '" . $attribs[$key]['attributes']['TYPE'] . "';\n";
			$args[$z]['Label'] = $attribs[$key]['attributes']['LABEL'];
			$validate .= "arrLabels[" . $z . "] = '" . $attribs[$key]['attributes']['LABEL'] . "';\n";
			$args[$z]['Desc'] = $attribs[$key]['attributes']['DESC'];
			$args[$z]['Config'] = $attribs[$key]['attributes']['CONFIG'];
			$args[$z]['Flags'] = $attribs[$key]['attributes']['FLAGS'];
			$args[$z]['OFormat'] = $attribs[$key]['attributes']['OFORMAT'];
			$args[$z]['Table'] = $attribs[$key]['attributes']['TABLE'];
			$args[$z]['Column'] = $attribs[$key]['attributes']['COL'];
			$args[$z]['Filter'] = $attribs[$key]['attributes']['FILTER'];

			?>
			<tr>
				<td><img src="images/blank.gif" width="75" height="1" alt=""></td>
				<td>
			<?php

			switch ($args[$z]['Type'])
			{
			#define ARG_DATERANGE		0
			#define ARG_TIMERANGE		1
			#define ARG_DATETIMERANGE	2
			#define ARG_NUMBERRANGE		3
			#define ARG_DATETIME		4
			#define ARG_DATE			5
			#define ARG_TIME			6
			#define ARG_NUMBER			7
			#define ARG_TEXT			8
			#define ARG_DBPICKLIST		9
			#define ARG_UDPICKLIST		10
				case 0:
					// Enter a date range
					print '<table><tr><td><li>'.$args[$z]['Desc'].' (<i>dd/mm/yyyy</i>)</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].' from:</td><td><input type="text" name="uv_argf'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argf'.$args[$z]['ID'].'\', \'date\', document.args.uv_argf'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td><td>&nbsp;&nbsp;&nbsp;to: </td><td><input type="text" name="uv_argt'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argt'.$args[$z]['ID'].'\', \'date\', document.args.uv_argt'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr>';
					print '<tr><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinksjustdate("uv_argf".$args[$z]['ID'], $fmt = "d/m/Y")).'</td><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinksjustdate("uv_argt".$args[$z]['ID'], "d/m/Y", "E")).'</td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if ((!document.args.uv_argf".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4}$/)) || (!document.args.uv_argt".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4}$/))){errors += \"Error: Required date range field is empty or not in the correct format (dd/mm/yyyy)\\n\";}\n";
					$validate .= "else {\nvar f=document.args.uv_argf".$args[$z]['ID'].".value;\nvar t=document.args.uv_argt".$args[$z]['ID'].".value;";
					$validate .= "\nif (!cmpthree(f.substr(6,4), f.substr(3,2), f.substr(0,2), t.substr(6,4), t.substr(3,2), t.substr(0,2))){ errors += \"Error: FROM value must be smaller than the TO value in a date range\\n\";}\n";
					$validate .= "if ((!isvaliddatetime(f)) || (!isvaliddatetime(t))){ errors += \"Error: A date range value appears to be out of range\\n\";}\n}\n";
					$dates .= ",uv_argf".$args[$z]['ID'].",uv_argt".$args[$z]['ID'];
					break;
				case 1:
					// Enter a time range
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].' from:</td><td><input type="text" name="uv_argf'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argf'.$args[$z]['ID'].'\', \'time\', document.args.uv_argf'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td><td>&nbsp;&nbsp;&nbsp;to: </td><td><input type="text" name="uv_argt'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argt'.$args[$z]['ID'].'\', \'time\', document.args.uv_argt'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if ((!document.args.uv_argf".$args[$z]['ID'].".value.match(/^\d+:\d+:\d+$/)) || (!document.args.uv_argt".$args[$z]['ID'].".value.match(/^\d+:\d+:\d+$/))){errors += \"Error: Required time range field is empty or not in the correct format (hh:mm:ss)\\n\";}\n";
					$validate .= "else {\nvar f=document.args.uv_argf".$args[$z]['ID'].".value.split(\":\");\nvar t=document.args.uv_argt".$args[$z]['ID'].".value.split(\":\");";
					$validate .= "\nif (!cmpthree(f[0], f[1], f[2], t[0], t[1], t[2])){ errors += \"Error: FROM value must be smaller than the TO value in a time range\\n\";}\n}\n";
					$times .= ",uv_argf".$args[$z]['ID'].",uv_argt".$args[$z]['ID'];
					break;
				case 2:
					// Enter a date/time range
					print '<table><tr><td><li>'.$args[$z]['Desc'].' (<i>dd/mm/yyyy hh:mm:ss</i>)</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].' from:</td><td><input type="text" name="uv_argf'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argf'.$args[$z]['ID'].'\', \'datetime\', document.args.uv_argf'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td><td>&nbsp;&nbsp;&nbsp;to: </td><td><input type="text" name="uv_argt'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_argt'.$args[$z]['ID'].'\', \'datetime\', document.args.uv_argt'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr>';
					print '<tr><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinks("uv_argf".$args[$z]['ID'], $fmt = "d/m/Y H:i:s")).'</td><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinks("uv_argt".$args[$z]['ID'], "d/m/Y H:i:s", "E")).'</td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if ((!document.args.uv_argf".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) || (!document.args.uv_argt".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/))){errors += \"Error: Required date & time range field is empty or not in the correct format (dd/mm/yyyy hh:mm:ss)\\n\";}\n";
					$validate .= "else {\nvar f=document.args.uv_argf".$args[$z]['ID'].".value;\nvar t=document.args.uv_argt".$args[$z]['ID'].".value;";
					$validate .= "\nif (!cmpsix(f.substr(6,4), f.substr(3,2), f.substr(0,2), f.substr(11,2), f.substr(14,2), f.substr(17,2), t.substr(6,4), t.substr(3,2), t.substr(0,2), t.substr(11,2), t.substr(14,2), t.substr(17,2))){ errors += \"Error: FROM value must be smaller than the TO value in a datetime range\\n\";}\n";
					$validate .= "if ((!isvaliddatetime(f)) || (!isvaliddatetime(t))){ errors += \"Error: A date time range value appears to be out of range\\n\";}\n}\n";
					$datetimes .= ",uv_argf".$args[$z]['ID'].",uv_argt".$args[$z]['ID'];
					break;
				case 3:
					// Enter a numeric range
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].' from:</td><td><input type="text" name="uv_argf'.$args[$z]['ID'].'"></td><td>&nbsp;&nbsp;&nbsp;to: </td><td><input type="text" name="uv_argt'.$args[$z]['ID'].'"></td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if ((!document.args.uv_argf".$args[$z]['ID'].".value.match(/^\d+(\.\d+)?$/)) || (!document.args.uv_argt".$args[$z]['ID'].".value.match(/^\d+(\.\d+)?$/))){errors += \"Error: Required numeric range field is empty or not numeric\\n\";}\n";
					$validate .= "else {\nif (parseInt(document.args.uv_argf".$args[$z]['ID'].".value) >= parseInt(document.args.uv_argt".$args[$z]['ID'].".value)){ errors += \"Error: FROM value must be smaller than the TO value in a numeric range\\n\";}\n}\n";
					break;
				case 4:
					// Enter a date/time
					print '<table><tr><td><li>'.$args[$z]['Desc'].' (<i>dd/mm/yyyy hh:mm:ss</i>)</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><input type="text" name="uv_arg'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_arg'.$args[$z]['ID'].'\', \'datetime\', document.args.uv_arg'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr>';
					print '<tr><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinks("uv_arg".$args[$z]['ID'], $fmt = "d/m/Y H:i:s")).(swtimelinks("uv_arg".$args[$z]['ID'], $fmt = "d/m/Y H:i:s", 'E')).'</td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)){errors += \"Error: Required date & time field is empty or not in the correct format (dd/mm/yyyy hh:mm:ss)\\n\";}\n";
					$validate .= "else if (!isvaliddatetime(document.args.uv_arg".$args[$z]['ID'].".value)){ errors += \"Error: A date time value appears to be out of range\\n\";}\n";
					$datetimes .= ",uv_arg".$args[$z]['ID'];
					break;
				case 5:
					// Enter a date
					print '<table><tr><td><li>'.$args[$z]['Desc'].' (<i>dd/mm/yyyy</i>)</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><input type="text" name="uv_arg'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_arg'.$args[$z]['ID'].'\', \'date\', document.args.uv_arg'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr>';
					print '<tr><td>&nbsp;</td><td colspan="2" class="data">'.(swtimelinksjustdate("uv_arg".$args[$z]['ID'], $fmt = "d/m/Y")).(swtimelinksjustdate("uv_arg".$args[$z]['ID'], $fmt = "d/m/Y", 'E')).'</td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d{2}\/\d{2}\/\d{4}$/)){errors += \"Error: Required date field is empty or not in the correct format (dd/mm/yyyy)\\n\";}\n";
					$validate .= "else if (!isvaliddatetime(document.args.uv_arg".$args[$z]['ID'].".value)){ errors += \"Error: A date value appears to be out of range\\n\";}\n";
					$dates .= ",uv_arg".$args[$z]['ID'];
					break;
				case 6:
					// Enter a time period
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><input type="text" name="uv_arg'.$args[$z]['ID'].'"></td><td><a href="javascript:getargs(\'uv_arg'.$args[$z]['ID'].'\', \'time\', document.args.uv_arg'.$args[$z]['ID'].'.value)"><b>Picker</b></a></td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d+:\d+:\d+$/)){errors += \"Error: Required time field is empty or not in the correct format (hh:mm:ss)\\n\";}\n";
					$times .= ",uv_arg".$args[$z]['ID'];
					break;
				case 7:
					// Enter a numeric value
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><input type="text" name="uv_arg'.$args[$z]['ID'].'"></td></tr></table>';
					print '</td></tr></table>';
					$validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d+(\.\d+)?$/)){errors += \"Error: Required numeric field is empty or not a number.\\n\";}\n";
					break;
				case 8:
					// Enter a text value
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><input type="text" name="uv_arg'.$args[$z]['ID'].'"></td></tr></table>';
					print '</td></tr></table>';
#					$validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.length){errors += \"Error: Required text field is empty.\\n\";}\n";
					break;
				case 9:
					// Database picklist
					$query = "SELECT DISTINCT ".$args[$z]['Column']." FROM ".$args[$z]['Table'];

					if ($args[$z]['Filter'])
					{
						$query .= " WHERE ".preg_replace("/^[Wh][Hh][Ee][Rr][Ee]\W*/","",sw_formatsql(trim($args[$z]['Filter'])));
						$query .= " AND " . $args[$z]['Column'] . " IS NOT NULL AND " . $args[$z]['Column'] . " <>'' ";
					}

					else 
					$query .= " WHERE ". $args[$z]['Column'] . " IS NOT NULL AND " . $args[$z]['Column'] . " <>'' ";

					$data_conn->Query($query);
					
					print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
					print '<table><tr><td>     '.$args[$z]['Label'].'</td><td><select name="uv_arg'.$args[$z]['ID'].'"><option value="">- Please Select -</option>';
					
					if ($data_conn->NumRows())
					{
						while($data_conn->FetchRow())
						{
							print '<option value="'.$data_conn->row[0].'">'.$data_conn->row[0].'</option>';
						}
						
					}
					else
					{
						$validate .= "errors += 'Error: You do not have any data in the " . $args[$z]['Table'] . "." . $args[$z]['Column'] . " database column\\n';\n";
					}
					print '</select></td></tr></table>';
					print '</td></tr></table>';
					if ($args[$z]['OFormat']==0) $validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d+(\.\d+)?$/)){errors += \"Error: Picklist value not selected or invalid.\\n\";}\n";
					
					break;
				case 10:
					// User defined picklist
					$temp = explode("|", $args[$z]['Config']);
					if (sizeof($temp))
					{
						print '<table><tr><td><li>'.$args[$z]['Desc'].'</li></td></tr><tr><td>';
						print '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$args[$z]['Label'].'</td><td><select name="uv_arg'.$args[$z]['ID'].'"><option="">- Please Select -</option>';
						
						foreach ($temp as $item)
						{
							if (!strlen($item)) continue;
							$temp2 = explode("^", $item);
							print '<option value="'.$temp2[1].'">'.$temp2[0].'</option>';
						}
						print '</select></td></tr></table>';
						print '</td></tr></table>';
						if ($args[$z]['OFormat']==0) $validate .= "if (!document.args.uv_arg".$args[$z]['ID'].".value.match(/^\d+(\.\d+)?$/)){errors += \"Error: Picklist value not selected or invalid.\\n\";}\n";
					}
					break;
			}
			?>
				</td>
			</tr>
			<tr><td colspan="2"><img src="images/blank.gif" width="1" height="5" alt=""></td></tr>
			<tr>
				<td><img src="images/blank.gif" width="1" height="1" alt=""></td>
				<td><hr class="divider"></td>
			</tr>
			<tr><td colspan="2"><img src="images/blank.gif" width="1" height="5" alt=""></td></tr>
			<?php





			$z++;
		}
		$validate .= "var intArguments = " . $z . ";\n";
		?>
		<tr><td colspan="2"><img src="images/blank.gif" width="1" height="5" alt=""></td></tr>
		<tr><td colspan="2" align="right"><input type="button" value="Run Report >>" onClick="javascript:validate();"></td></tr>
		<input type="hidden" name="dates" value="<?php echo (preg_replace("/^,/","",$dates))?>">
		<input type="hidden" name="times" value="<?php echo (preg_replace("/^,/","",$times))?>">
		<input type="hidden" name="datetimes" value="<?php echo (preg_replace("/^,/","",$datetimes))?>">
		<input type="hidden" name="tmplt" value="<?php echo $_GET['tmplt']?>">
		<input type="hidden" name="reportid" value="<?php echo $_GET['reportid']?>">
		<input type="hidden" name="sessid" value="<?php echo $_GET['sessid']?>">
		<input type="hidden" name="dd" value="<?php echo $_GET['dd']?>">
		<input type="hidden" name="tz" value="<?php echo $_GET['tz']?>">
		<input type="hidden" name="ColourScheme" value="<?php echo $_GET['ColourScheme']?>">
		<input type="hidden" name="webclientreporting" value="<?php echo $_GET['webclientreporting']?>">
		</form>
		</table>
		<br />
<script language="javascript">
<!--
function cmpthree(f1, f2, f3, t1, t2, t3)
{
	if (f1 <= t1)
	{
		if (f1 < t1) return true;
		if (f2 <= t2)
		{
			if (f2 < t2) return true;
			if (f3 < t3) return true;
			else return false;
		}
		else return false;
	}
	else return false;
}
function cmpsix(f1, f2, f3, f4, f5, f6, t1, t2, t3, t4, t5, t6)
{
	if (cmpthree(f1, f2, f3, t1, t2, t3)) return true;
	return cmpthree(f4, f5, f6, t4, t5, t6);
}
function getargs(element, type, selval)
{
	window.open('rpt_popup_getargs.php?element='+element+'&type='+type+'&selval='+selval,'','width=550,height=350,scrollbars=yes,resizable=yes,status=0');
}

// These functions, of which only isvaliddatetime() should be called directly, determine if the date, time or date/time value
// passed in is valid in the sense that it is within range. 29/02/2005 would fail as 2005 is not a leap year. 40/09/1995 would
// also fail as it is clearly out of the range of acceptable dates.
function isvaliddate(strdate)
{
	var days = new Array(31,29,31,30,31,30,31,31,30,31,30,31);
	var dd = strdate.substring(0, 2);
	var mm = strdate.substring(3, 5);
	var yyyy = strdate.substring(6, 10);
	if (yyyy % 4) days[1]--;

	if (mm < 1 || mm > 12) return false;
	if (dd < 1 || dd > days[mm-1]) return false;
	if (yyyy < 1970 || yyyy > 2069) return false;
	return true;
}
function isvalidtime(strtime)
{
	var hh = strtime.substring(0, 2);
	var mm = strtime.substring(3, 5);
	var ss = strtime.substring(6, 8);

	if (hh < 0 || hh > 23) return false;
	if (mm < 0 || mm > 59) return false;
	if (ss < 0 || ss > 59) return false;
	return true;
}
function isvaliddatetime(strdatetime)
{
	if (strdatetime.match(/^\d{2}\/\d{2}\/\d{4}$/))
	{
		return isvaliddate(strdatetime)
	}
	else if (strdatetime.match(/^\d{2}:\d{2}:\d{2}$/))
	{
		return isvalidtime(strdatetime)
	}
	else if (strdatetime.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/))
	{
		if ((isvaliddate(strdatetime.substring(0, 10))) && (isvalidtime(strdatetime.substring(11, 19)))) return true;
		else return false;
	}
	return false;
}
//-->
</script>
		<?php
	//-- Finishing off the js validate function that has been written throughout this script. Recommend debugging this js by running report in a browser with developer tools.
	$validate .=	"if (errors.length)\n{\nalert(errors);\n}\n" . 
					"else\n{\nvar boolBlank = false;\nfor (i = 1; i <= intArguments; i++)\n{\nif(arrTypes[i-1] < 4)\n{\n}\nelse\n{\n" .
					"if(document.args['uv_arg'+i].value=='')\n{\n" .
					"boolBlank=true;\nstrLabel += arrLabels[i-1] + '\\n';\n}\n}\n}\nif (boolBlank)\n{\nalert('Please select a value for: \\n' + strLabel);\n}\n" . 
					"else\n{\ndocument.args.submit();\n}\n}\n}\n//-->\n</script>\n";
	print $validate;
	}
/*
	if ($z)
	{
		print "<br /><br /><br /><u>".$z." Args Found</u>:-<br />";
		print '<table border="1" cellspacing="0" cellpadding="0">';
		print '<tr><td>&nbsp;&nbsp;&nbsp;</td><td><b>ID&nbsp;</b></td><td><b>Type&nbsp;</b></td><td><b>Label&nbsp;</b></td><td><b>Desc&nbsp;</b></td><td><b>Config&nbsp;</b></td><td><b>Flags&nbsp;</b></td><td><b>OFormat&nbsp;</b></td><td><b>Table&nbsp;</b></td><td><b>Column&nbsp;</b></td></tr>';
		foreach ($args as $arg)
		{
			print '<tr>';
			print '<td>&nbsp;</td><td nowrap>'.$arg['ID'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Type'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Label'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Desc'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Config'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Flags'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['OFormat'].'&nbsp;&nbsp;</td><td nowrap>'.$arg['Table'].'&nbsp;&nbsp;</td>';
			print '<td nowrap>'.$arg['Column'].'&nbsp;&nbsp;</td>';
			print '<tr>';
		}
		print '</table>';
	}
	else print "NO ARGS FOUND<br />";
*/
}
include_once($theme.'rpt_incl_htmlfoot.php');
?>