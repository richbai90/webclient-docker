<?php

# Pull in required includes, functions & settings
include_once('rpt_incl_config.php');
include_once('swsqlparser.php');
include_once('swnocachepage.php');


# Create session and find out who is running the report.
$session = new swClassActivePageSession(gv('sessid'));

if(!$session->IsValidSession())
{
	print "SessionId specified is not valid.";
	exit;
}

# Check the existence of a report id and extract it from the query string & initialise a few other variables
$reportid = @$_GET['REPORTID'] ? $_GET['REPORTID'] : $_GET['reportid'];
if (!$reportid)
{
	$error = 3;
	include('error.php');
	exit;
}

if(!intval($reportid))
{
	print "ReportId specified is not valid.";
	exit;	
}

$dd = gv('dd');
if($dd=="" || $dd=="ALL")$dd = "Default";

swdti_load($_SESSION['wc_dd']);

if (!$conf_conn = new RptMK2DBConn($conf_db, $conf_user, $conf_pass)) print "Config Connection Failed<br />";

# Retrieve & Parse XML Report Config
// Bug Fix 56393 Data Dictionary shown in Report Config always reads Default. AT
if ($conf_conn->Query("SELECT reportconf, charttop, chartbot, datadic FROM ".$conf_table." WHERE reportid=".$reportid))
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

	$top_config = $conf_conn->row[1];
	$bot_config = $conf_conn->row[2];
	// Bug Fix 56393 Data Dictionary shown in Report Config always reads Default. AT
	$conf_dd    = $conf_conn->row[3];
	$table_to_query = $attribs[$index['QUERY'][0]]['attributes']['NAME'];
	$groupby_column = $attribs[$index['GROUPING'][0]]['attributes']['GROUPBY'];
	if ($groupby_column) $orderby_columns[] = $groupby_column;
	$statby_primary = $attribs[$index['GRAPHING'][0]]['attributes']['PRIMARY'];
	$statby_secondary = $attribs[$index['GRAPHING'][0]]['attributes']['SECONDARY'];
// Modified for INFO page
$report_title = $attribs[$index['REPORT'][0]]['attributes']['NAME'];
$where_clause = preg_replace("/^[Wh][Hh][Ee][Rr][Ee]\W*/","",trim($attribs[$index['QUERY'][0]]['attributes']['CRITERIA']));
// Bug Fix 56851 Oracle - Standard Wizard Based Reports Fail. AT
if ($mssqlinuse)
{
	$func_name = array('length(', 'LENGTH(');
	$where_clause = str_replace($func_name, " len(", $where_clause);
}
$theme = $attribs[$index['REPORT'][0]]['attributes']['THEME'];
	$template_name = $attribs[$index['TEMPLATE'][0]]['attributes']['NAME'];
	$template_image = $attribs[$index['TEMPLATE'][0]]['attributes']['WIZIMAGE'];

	// Un-documented and unused for now due to incompatibility with MSSql
	$limit_clause = $attribs[$index['QUERY'][0]]['attributes']['LIMIT'];

	$x = 0;
	// <AI bugref=84382 dt=20100526 release=7.4.1.QA1>
	// Check $index['COLUMN'] exists before we try to use it.
	// </AI>
	if(isset($index['COLUMN']))
	{
		foreach ($index['COLUMN'] as $key)
		{
			$cols_to_extract[$x]['Col'] = $attribs[$key]['attributes']['NAME'];
			$cols_to_extract[$x]['DDName'] = swdti_getcoldispname($cols_to_extract[$x]['Col']);
			if (strpos($cols_to_extract[$x]['DDName'],'.')) $cols_to_extract[$x]['DDName'] = substr($cols_to_extract[$x]['DDName'], (strrpos ($cols_to_extract[$x]['DDName'],'.'))+1);
			if ($flags = $attribs[$key]['attributes']['FLAGS'])
			{
				$cols_to_extract[$x]['Sum'] = $flags & 1;
				$cols_to_extract[$x]['Ave'] = $flags & 2;
				$cols_to_extract[$x]['Min'] = $flags & 4;
				$cols_to_extract[$x]['Max'] = $flags & 8;
				$cols_to_extract[$x]['Vis'] = $flags & 16;
				$cols_to_extract[$x]['Raw'] = $flags & 32;
				$cols_to_extract[$x]['WrHD'] = $flags & 64 ? " nowrap" : "";
				$cols_to_extract[$x]['WrDT'] = $flags & 128 ? " nowrap" : "";
				
				# A user could, in theory, set the report to diplay Sum, Ave, Min & Max data without applying the functions to
				# any columns which would create blank aggregate footers. The valid flags are here to avoid the problem as they
				# are set to true when at least one column has that function applied.
				if ($cols_to_extract[$x]['Sum']) $valid_sum = true;
				if ($cols_to_extract[$x]['Ave']) $valid_ave = true;
				if ($cols_to_extract[$x]['Min']) $valid_min = true;
				if ($cols_to_extract[$x]['Max']) $valid_max = true;
			}
			$x++;
		}
	}
	$cols = $x;
	$span = $x;
	for ($y = 0 ; $y < $cols ; $y++) if (!$cols_to_extract[$y]['Vis']) $span--;

	if ($index['JOIN'])
	{
		$y = 0;
		foreach ($index['JOIN'] as $key)
		{
			if (!$attribs[$key]['attributes']) continue;
			$joins[$y]['Table'] = $attribs[$key]['attributes']['TABLE'];
			$joins[$y]['Type'] = $attribs[$key]['attributes']['TYPE'];
			$joins[$y]['Cond'] = $attribs[$key]['attributes']['CONDITION'];
			$y++;
		}
	}

	if ($index['OCOLUMN'])
	{
		foreach ($index['OCOLUMN'] as $key)
		{
			if ($attribs[$key]['attributes']['DESC']) $orderby_columns[] = $attribs[$key]['attributes']['NAME']." DESC";
			else $orderby_columns[] = $attribs[$key]['attributes']['NAME'];
		}
	}

	if ($index['ARG'])
	{
		$z = 0;
		foreach ($index['ARG'] as $key)
		{
			if (!$attribs[$key]['attributes']) continue;
			$args[$z]['ID'] = $attribs[$key]['attributes']['ID'];
			$args[$z]['Type'] = $attribs[$key]['attributes']['TYPE'];
			$args[$z]['Label'] = $attribs[$key]['attributes']['LABEL'];
			$args[$z]['Desc'] = $attribs[$key]['attributes']['DESC'];
			$args[$z]['Config'] = $attribs[$key]['attributes']['CONFIG'];
			$args[$z]['Flags'] = $attribs[$key]['attributes']['FLAGS'];
			$args[$z]['OFormat'] = $attribs[$key]['attributes']['OFORMAT'];
			$args[$z]['Table'] = $attribs[$key]['attributes']['TABLE'];
			$args[$z]['Column'] = $attribs[$key]['attributes']['COL'];
			$args[$z]['Filter'] = $attribs[$key]['attributes']['FILTER'];

			$arg_types[$args[$z]['ID']] = $args[$z]['Type'];
			$z++;
		}
	}

	# Parse the bitflags field to extract the various settings governing how the report should be displayed.
	$report_flags = $attribs[$index['REPORT'][0]]['attributes']['OPTIONS'];
	if ($report_flags)
	{
		$flag_edit = $report_flags & 1;					// Graph is editable
		$flag_heads = $report_flags & 2;				// Show column headings
		$flag_totals = $report_flags & 4;				// Show overall summary
		$flag_sum = $report_flags & 8;					// Show sum within summary
		$flag_ave = $report_flags & 16;					// Show average within summary
		$flag_min = $report_flags & 32;					// Show min value within summary
		$flag_max = $report_flags & 64;					// Show max value within summary
		$flag_count = $report_flags & 128;				// Show record count within summary
		$flag_groupfoot = $report_flags & 256;			// Show the group summary footer
		$flag_groupname = $report_flags & 512;			// Show name of group in the group header
		$flag_counthead = $report_flags & 1024;			// Display record count in the group header
		if ($statby_primary)
		{
			$flag_showhead = true;						// Show the chart header, WAS Bitflag (2048) deprecated
			$flag_multihead = $report_flags & 4096;		// Chart in header is multi-dimensional
		}
		if ($statby_secondary)
		{
			$flag_groupcharts = true;					// Show charts for each group WAS Bitflag (8192) deprecated
		}
		$flag_hiderows = $report_flags & 16384;			// Surpress data row output
		$flag_avecount = $report_flags & 32768;			// Show average record count in overall summary
		$flag_descgroups = $report_flags & 65536;		// Descend Group Orderby
		$flag_filter = $report_flags & 131072;			// Enable on-the-fly data filter
	}

	# Display diagnostics
//	include_once('rpt_incl_diags.php');

	# Empty Arrays
	$attribs = array();
	$index = array();

	# Time to extract & process any user defined arguments, the values for which should have arrived in the query string.
	include_once('rpt_incl_argparse.php');
}
else
{
	print "Report config not found";
	exit;
}

//-- will set a var $cssFile - that controls the header background styles
include('_css_switcher.php');

?>
<!doctype html public "-//w3c//dtd html 4.0 transitional//en">
<html>
	<head>
		<title>Report Details - <?php echo $sla_name; ?></title>
		<LINK REL=StyleSheet HREF="styles/mainstyles.php" RTYPE="text/css">
		<meta name="author" content="Hornbill Technologies Limited">
		<meta name="description" content="Display information about a report configuration">
		<style type="text/css">
		<!--

		*{
			font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
			font-size:12px;
		}

		body {
			overflow:auto;
			margin:0px;
			}

		<?php

		if(isset($_GET["webclientreporting"]))
		{
		?>
			.reportheader
			{
			}

			.title 
			{
				font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;

				border-width:0px 0px 1px 0px;
				border-style:solid solid solid solid;
				border-color:#D5D4DF #D5D4DF #D5D4DF #D5D4DF;

				padding:3px;
				font-size:12px;
				width:100%;
				color:#696969;

				filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFFFFF', endColorstr='#E1E1E1'); 
				background: -webkit-gradient(linear, left top, left bottom, from(#FFFFFF), to(#E1E1E1)); 
				background: -moz-linear-gradient(top,  #FFFFFF,  #E1E1E1);
			}


		<?php
		}
		else
		{
		?>
			.reportheader
			{
				width:100%;
				height:25px;
				display:block;
				background-color:#B2B7C2;
			}

			.title 
			{
				font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;
				font-size : 11px;

				padding:2px 2px 2px 4px;
				width:100%;
				color : #3C3C3C;

				filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#F1F1F1', endColorstr='#D8D8D8');
				background: -webkit-gradient(linear, left top, left bottom, from(#B8BAC2), to(#7B8395)); 
				background: -moz-linear-gradient(top,  #B8BAC2,  #7B8395); 

				border-top:1px solid #ffffff;
				border-bottom:1px solid #B2B7C2;

				display:block;
			}

		<?php
		}
		?>

		.surveyname 
		{
			font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;
			font-size : 8px; 
		}

		.infoHeader
		{
			font-weight: bold;
			font-size : 12px;
		}
		.divider 
		{
			background-color:#D0D3D7; color:#D0D3D7; border:0; height:1;
		}
		.colhead 
		{
			
			font-weight:bold;
			font-size : 10;
		}
		.data 
		{
			
			font-size : 9;
		}
		.datasum 
		{
			
			font-size : 9;
		}
		.footer 
		{
			color : #808080;
			font-size : 10;
		}

		a {color : #404060;}
		a:hover {color : #A0A0C0;}
		td { color: #B4B4B4; font-size: 12px;}

		.data
		{
			color: #B4B4B4; font-size: 12px;
		}

		//-->
		</style>

		<LINK REL=StyleSheet HREF="styles/<?php echo $cssFile;?>" RTYPE="text/css">

	</head>
<body>

<div class="reportheader"></div>
<div class="title"><?php echo $report_title.' ['.$reportid.']';?></div>

<br /><br />
<div style='padding:10px;'>
		<table border="0" cellspacing="0" cellpadding="2" >
		<tr>
			<td colspan="2" rowspan="100" align="left" class="data" valign='top'><img src="<?php echo $template_image?>" style='margin-right:8px;'></td>
		</tr>
		<tr>
			<td class="infoHeader"  width="180">&nbsp;&nbsp;Report&nbsp;Configuration<br /></td>
			<td class="infoHeader" ><img src="images/space.gif" width="1" height="20" alt="" border="0"></td>
		</tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Name:</b></td>
			<td bgcolor="#ffffff"><?php echo $report_title?>&nbsp;&nbsp;</td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
<?php if (strlen($theme)) { ?>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Theme:</b></td>
			<td bgcolor="#ffffff"><?php echo $theme?>&nbsp;&nbsp;</td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
<?php } ?>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Data Dictionary:</b></td>
			<td bgcolor="#ffffff"><?php echo $conf_dd?></td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Main table:</b></td>
			<td bgcolor="#ffffff"><?php echo $table_to_query?></td>
		</tr>
<?php if (sizeof($orderby_columns)) { ?>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Order By:</b></td>
			<td bgcolor="#ffffff"><?php foreach ($orderby_columns as $order) print $order."<br />"; ?></td>
		</tr>
<?php } ?>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Group By:</b></td>
			<td bgcolor="#ffffff"><?php echo $groupby_column?></td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Primary Graphing:</b></td>
			<td bgcolor="#ffffff"><?php echo $statby_primary?></td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Secondary Graphing:</b></td>
			<td bgcolor="#ffffff"><?php echo $statby_secondary?></td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Criteria:</b></td>
			<td bgcolor="#ffffff"><?php echo $where_clause?></td>
		</tr>
		<tr><td colspan="2"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#D8D8D8"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr>
		<tr>
			<td valign="top">&nbsp;&nbsp;<b>Template:</b></td>
			<td bgcolor="#ffffff"><?php echo $template_name?></td>
		</tr>
		</table>

		<br /><br />
		<table border="0" cellspacing="0" cellpadding="1" >
		<tr>
			<td class="infoHeader" height='25' colspan='3'>&nbsp;&nbsp;Report Run History</td>
		</tr>
<?php
$query = 'SELECT wen,who,how FROM '.$hist_table.' WHERE reportid='.$reportid.' ORDER BY wen DESC';
$conf_conn->Query($query);

print '<tr><td class="data">&nbsp;&nbsp;&nbsp;<b>Last Run</b></td><td class="data">&nbsp;&nbsp;&nbsp;<b>Run By</b></td><td class="data">&nbsp;&nbsp;&nbsp;<b>Time Taken</b></td></tr>';
while($conf_conn->FetchRow())
{
	if ($conf_conn->row[2])
	{
		if ($conf_conn->row[2] == 1) 
			$took = $conf_conn->row[2].' second';
		else 
			$took = $conf_conn->row[2].' seconds';
	}
	else
		$took = '< 1 second';

	print '<tr><td align="left" class="data">&nbsp;&nbsp;&nbsp;'.
		//	<FN dt=16-Oct-2006> $GLOBALS['tz'] is completely irrelevant when displaying timestamps from the past!
		//SwFormatDateTimeValue(SW_DTMODE_DATETIME, $conf_conn->row[0], $GLOBALS['tz']).
		SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $conf_conn->row[0]).
		//	</FN>
		'</td><td align="left" class="data">&nbsp;&nbsp;&nbsp;'.$conf_conn->row[1].'</td><td align="left" class="data">&nbsp;&nbsp;&nbsp;'.$took.'</td></tr>';
	}
print '</table>';

$conf_conn->Close();
?>
</div>
</body>
</html>
