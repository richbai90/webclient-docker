<?php
/* 
	Created By Hornbill Systems

	Updates
	
	code	date		author					description
	----------------------------------------------------------------------------------------------------
	ind01	09/05/07	Ivan Nicholas Dorosh	If a field is x.y it would just display y.  The reason for this was that 
												it was expected that the fields would come back as <table>.<field> I believe.
												AndreiT and I do not understand any other reason for this to be in place.  It has
												therefore been commented out below.
	RJC		17.01.08	Ryan Cheriton			Bug 60394 Added str to lower because oracle stores db names in upper case

	NWJ		18.02.10	NeilWJ					Modified callref hyperlink to use _APPCODE in the href. This means reports will point to call detail php based on the installed application.

*/

# Set start time, used to calculate the time taken to run the report.
$start_time = time();

?>

<script type='text/javascript' src='../clisupp/jquery/jquery-1.7.1.min.js'></script>
<script type='text/javascript' src='../clisupp/jquery/jquery-ui-1.8.17.custom.min.js'></script>

<?php

# Pull in required includes, functions & settings
require_once("rpt_incl_config.php");

//	<FN dt=30-June-2006>
swphpGlobaliseRequestVars();

if ($sessid) //	If the report runs in interactive mode (from helpdesk client), then ['sessid'] parameter must be passed in URL
	$session = new swClassActivePageSession($sessid);
else if (is_scheduled()) // if the report runs in scheduled mode
{
	setup_scheduled_reports();
	// 	MM - Removing the sorting as if it is scheduled reports, the local file attempts to retrieve localhost by default.
	$nolinks = true;
}
else //	this should never happen!!! but if it does, let's warn the user and apply default values for formatting variables!
{
echo"Warning no valid session found and not running in scheduled mode.";
exit;
}
//	load the data dictionary
//	In case the report is run by the helpdesk client, data dictionary comes from [swsessions] table - loaded by [CSwActivePageSession] ctor
//	In case the report is run in scheduled mode, data dictionary comes from the GET parameters passed in the URL by the scheduler.

swdti_load($_SESSION['wc_dd']);
//	</FN>

# Check the existence of a report id and extract it from the query string & initialise a few other variables
$reportid = $_GET['REPORTID'] ? $_GET['REPORTID'] : $_GET['reportid'];
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

$lid = "";					// Store the ID of a chart in the temporary table
$data = "";					// For the chart data string
$labels = "";				// For the chart labels string
$options = "";				// For the chart options string (Multi-Dimensional only)
$this_template = preg_replace("/\/*\w*\/+/","",$_SERVER['PHP_SELF']);	// The name of the template file itself, for passing on to the chart editor

# Remove user specified sort parameters from the query string and store what remains in $old_query
$_SERVER["QUERY_STRING"] = preg_replace("/&SORTBY=[\D\d]*[DESC|ASCC]/",'',$_SERVER["QUERY_STRING"]);
$old_query = $_SERVER["QUERY_STRING"];

//if (!$conf_conn = new RptMK2DBConn($conf_dbselect)) print "Config Connection Failed<br />";
//if (!$data_conn = new RptMK2DBConn($data_dbselect)) print "Data Connection Failed<br />";


if (!$conf_conn = new RptMK2DBConn($conf_db, $conf_user, $conf_pass)) print "Config Connection Failed<br />";
if (!$data_conn = new RptMK2DBConn($data_db, $data_user, $data_pass)) print "Data Connection Failed<br />";


# If $type is true, then config data from the chartbuilder has been passed back to the template. This means the first
# thing we need to do is run a query to add this config to the correct record so that it is taken into account when this
# page is generated as normal. This is also how the config is saved permanently in XML format.
if ($_POST['type'])
{
	include_once('rpt_incl_xmlwrite.php');
}

# Retrieve & Parse XML Report Config
if ($conf_conn->Query("SELECT reportconf, charttop, chartbot FROM ".$conf_table." WHERE reportid=".$reportid))
{
	$conf_conn->FetchRow();
	if (!$conf_conn->row[0])
	{
		print "Report config empty";
		exit;
	}

	# Parse XML
	parse_config_xml($conf_conn->row[0],$attribs, $index);

	$top_config = $conf_conn->row[1];
	$bot_config = $conf_conn->row[2];
	$table_to_query = $attribs[$index['QUERY'][0]]['attributes']['NAME'];
	$groupby_column = $attribs[$index['GROUPING'][0]]['attributes']['GROUPBY'];
	if ($groupby_column) $orderby_columns[] = $groupby_column;
	$statby_primary = $attribs[$index['GRAPHING'][0]]['attributes']['PRIMARY'];
	$statby_secondary = $attribs[$index['GRAPHING'][0]]['attributes']['SECONDARY'];
	$report_title = $attribs[$index['REPORT'][0]]['attributes']['TITLE'] ? $attribs[$index['REPORT'][0]]['attributes']['TITLE'] : $attribs[$index['REPORT'][0]]['attributes']['NAME'];
	$where_clause = preg_replace("/^[Wh][Hh][Ee][Rr][Ee]\W*/","",sw_formatsql(trim($attribs[$index['QUERY'][0]]['attributes']['CRITERIA'])));
	// Bug Fix 56851 Oracle - Standard Wizard Based Reports Fail. AT
	if ($mssqlinuse)
	{
		$func_name = array('length(', 'LENGTH(');
		$where_clause = str_replace($func_name, " len(", $where_clause);
	}
	$theme = $_GET['theme'] ? $_GET['theme'] : $attribs[$index['REPORT'][0]]['attributes']['THEME'];
	if ($theme)
	{
		if ((file_exists("themes/".$theme."/rpt_incl_htmlhead.php")) && (file_exists("themes/".$theme."/rpt_incl_htmlhead.php"))) $theme = "themes/".$theme."/";
		else $theme = '';
	}

	//	<FN dt=30-June-2006>
	//	Data dictionary specified in [$conf_table] MUST not be used for formatting the fields. 
	//	Its purpose is to filter the reports to be displayed in helpdesk client and such it's in no relation with PHP!
	
	//	$dd = $_GET['dd'] ? $_GET['dd'] : $attribs[$index['REPORT'][0]]['attributes']['DD'];
	//	if ((!$dd) || ($dd=="All")) $dd = "Default";
	//	swdti_load($dd);
	//	</FN>

	// Un-documented and unused for now due to incompatibility with MSSql
	$limit_clause = $attribs[$index['QUERY'][0]]['attributes']['LIMIT'];

	$x = 0;
	$have_opencall_callref = false;
	$have_opencall_h_formattedcallref = false;
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Check $index['COLUMN'] exists before we try to use it.
	// </AI>
	if(isset($index['COLUMN']))
	{
		foreach ($index['COLUMN'] as $key)
		{
			$cols_to_extract[$x]['Col'] = $attribs[$key]['attributes']['NAME'];
			
			if ($cols_to_extract[$x]['Col'] == "opencall.callref")
			{
				$have_opencall_callref = true;
			}
			if ($cols_to_extract[$x]['Col'] == "opencall.h_formattedcallref")
			{
				$have_opencall_h_formattedcallref = true;
			}
	
			$cols_to_extract[$x]['DDName'] = swdti_getcoldispname($cols_to_extract[$x]['Col']);
			//ind01 if (strpos($cols_to_extract[$x]['DDName'],'.')) $cols_to_extract[$x]['DDName'] = substr($cols_to_extract[$x]['DDName'], (strrpos ($cols_to_extract[$x]['DDName'],'.'))+1);
			if ($flags = $attribs[$key]['attributes']['FLAGS'])
			{
				$cols_to_extract[$x]['Sum'] = $flags & 1;
				$cols_to_extract[$x]['Ave'] = $flags & 2;
				$cols_to_extract[$x]['Min'] = $flags & 4;
				$cols_to_extract[$x]['Max'] = $flags & 8;
				$cols_to_extract[$x]['Vis'] = $flags & 16;
				$cols_to_extract[$x]['Raw'] = $flags & 32;
				$cols_to_extract[$x]['WrHD'] = $flags & 64 ? " nowrap" : "";
				$cols_to_extract[$x]['WrDT'] = $cols_to_extract[$x]['WrHD'];
	###### HACKS ######
	$cols_to_extract[$x]['WrHD'] = " nowrap";
	###### HACKS ######
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
		//It is not necessary to modify the query in case the system reports has callref and h_formatted or none of them
		if ((!$have_opencall_callref and !$have_opencall_h_formattedcallref) || ($have_opencall_callref and $have_opencall_h_formattedcallref))
		{
			
		}
		//But we need to include callref or h_formattedcallref in case there is one of them in the system reports
		else
		{
			if ($have_opencall_callref){
				$aux['Col']  = "opencall.h_formattedcallref";
				$aux['DDName'] = "Call Reference";
			}
			
			if ($have_opencall_h_formattedcallref){
				$aux['Col']  = "opencall.callref";
				$aux['DDName'] = "Reference";
			}

			$flags= "0";

			$aux['Sum'] = $flags & 1;
			$aux['Ave'] = $flags & 2;
			$aux['Min'] = $flags & 4;
			$aux['Max'] = $flags & 8;
			$aux['Vis'] = $flags & 16;
			$aux['Raw'] = $flags & 32;
			$aux['WrHD'] = $flags & 64 ? " nowrap" : "";
			$aux['WrDT'] = "";

			if ($aux['Sum']) $valid_sum = true;
			if ($aux['Ave']) $valid_ave = true;
			if ($aux['Min']) $valid_min = true;
			if ($aux['Max']) $valid_max = true;

			array_push($cols_to_extract, $aux);
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
			if ((!strlen($_GET['uv_argf'.$args[$z]['ID']])) && (!strlen($_GET['uv_arg'.$args[$z]['ID']])))
			{
				// An argument is required that has not been supplied, call the argument
				//header("Location: rpt_page_getargs.php?tmplt=".$this_template."&reportid=".$reportid."&sessid=".$_GET['sessid']."&dd=".$_GET['dd']."&tz=".$_GET['tz']);
				//-- 15.03.2013 - include colour scheme
				header("Location: rpt_page_getargs.php?webclientreporting=".$_GET["webclientreporting"]."&ColourScheme=".$_GET["ColourScheme"]."&tmplt=".$this_template."&reportid=".$reportid."&sessid=".$_GET['sessid']."&dd=".$_GET['dd']."&tz=".$_GET['tz']);

				exit;
			}
			$arg_types[$args[$z]['ID']] = $args[$z]['Type'];
			$z++;
		}
	}

	# Parse the bitflags field to extract the various settings governing how the report should be displayed.
	$report_flags = $attribs[$index['REPORT'][0]]['attributes']['OPTIONS'];
	if ($report_flags)
	{
		$flag_edit = (($report_flags & 1) && !is_scheduled());		// Graph is editable
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

	# Pull the settings for the charts out of the DB or assign defaults if they are not present
	$Current_type_is_multi = preg_match("/<ChartType value=\"Multi/",$top_config);
	if ($flag_multihead)
	{
		if (!$top_config || ($flag_multihead xor $Current_type_is_multi)) $top_config = '<Config><Graphs><Graph name="TOP"><SizeX value="600"/><SizeY value="400"/><PlotX value="530"/><PlotY value="320"/><MarginLeft value="40"/><MarginTop value="25"/><ChartOffsetX value="0"/><ChartOffsetY value="0"/><PieScalingFactor value="50"/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="20"/><LineColor value="#DFDFDF"/><TextColor value="#000000"/><VLineVisible value=""/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value=""/><Depth value="50"/><Perspective value="45"/><Transparency value="1"/><Border value="1"/><Legend value="1"/><LegendX value="42"/><LegendY value="25"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value="1"/><ChartType value="Multi Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value=""/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="default"/><ExplodePie value=""/><ExplodeSector value="0"/><ExplodeDistance value="30"/><StartAngle value="300"/></Graph></Graphs></Config>';
		if (!$bot_config) $bot_config = '<Config><Graphs><Graph name="BOT"><SizeX value="250"/><SizeY value="250"/><PlotX value="170"/><PlotY value="160"/><MarginLeft value="45"/><MarginTop value="30"/><ChartOffsetX value=""/><ChartOffsetY value=""/><PieScalingFactor value=""/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="30"/><LineColor value=""/><TextColor value="#000000"/><VLineVisible value="1"/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value=""/><Depth value="5"/><Perspective value=""/><Transparency value=""/><Border value="1"/><Legend value=""/><LegendX value="0"/><LegendY value="0"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value=""/><ChartType value="3D Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value="Default Palette"/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="ValueDesc"/><ExplodePie value=""/><ExplodeSector value=""/><ExplodeDistance value=""/><StartAngle value=""/></Graph></Graphs></Config>';
	}
	else
	{
		if (!$top_config || ($flag_multihead xor $Current_type_is_multi)) $top_config = '<Config><Graphs><Graph name="TOP"><SizeX value="600"/><SizeY value="300"/><PlotX value="480"/><PlotY value="245"/><MarginLeft value="90"/><MarginTop value="25"/><ChartOffsetX value=""/><ChartOffsetY value=""/><PieScalingFactor value=""/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="0"/><LineColor value="#DFDFDF"/><TextColor value=""/><VLineVisible value="1"/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value="1"/><Depth value="5"/><Perspective value=""/><Transparency value=""/><Border value="1"/><Legend value=""/><LegendX value="0"/><LegendY value="0"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value=""/><ChartType value="3D Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value="Default Palette"/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="ValueDesc"/><ExplodePie value=""/><ExplodeSector value=""/><ExplodeDistance value=""/><StartAngle value=""/></Graph></Graphs></Config>';
		if (!$bot_config) $bot_config = '<Config><Graphs><Graph name="BOT"><SizeX value="250"/><SizeY value="250"/><PlotX value="170"/><PlotY value="160"/><MarginLeft value="45"/><MarginTop value="30"/><ChartOffsetX value=""/><ChartOffsetY value=""/><PieScalingFactor value=""/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="30"/><LineColor value=""/><TextColor value="#000000"/><VLineVisible value="1"/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value=""/><Depth value="5"/><Perspective value=""/><Transparency value=""/><Border value="1"/><Legend value=""/><LegendX value="0"/><LegendY value="0"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value=""/><ChartType value="3D Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value="Default Palette"/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="ValueDesc"/><ExplodePie value=""/><ExplodeSector value=""/><ExplodeDistance value=""/><StartAngle value=""/></Graph></Graphs></Config>';
	}

	# Find the height of the secondary (group) chart by shoving the config through a simple regular expression. This is
	# needed for a mighty clever way of working around HTML rendering anomolies later.
	preg_match("/<SizeY value=\"(\d+)\"\/>/",$bot_config,$matches);
	$bot_height = $matches[1];

	# Display diagnostics
//	include_once('rpt_incl_diags.php');

	# Empty Arrays
	$attribs = array();
	$index = array();

	# Time to extract & process any user defined arguments, the values for which should have arrived in the query string.
	include_once('rpt_incl_argparse.php');

	# SPECIFIC TO FILTER LIST, modify where clause to apply filters
	if ($flag_filter)
	{
		include_once('rpt_incl_filterparse.php');
	}

	# This populates the opts array and the $options string. These are needed only when creating a multi-dimensional chart.
	if ($flag_multihead)
	{
		# Build the query needed to extract just the options from the table.
		$query = "SELECT DISTINCT ".$statby_primary." AS opt FROM ".$table_to_query;
		for ($x = 0 ; $x < sizeof($joins) ; $x++)
		{
			$query .= " ".$joins[$x]['Cond'];
		}
		if ($where_clause) $query .= " WHERE ".$where_clause;
		$query .= " ORDER BY ".$statby_primary;

		if($data_conn->Query($query))
		{
			# Need to work out the column config options by counting up to the array element holds it.
			for($x=0 ; $x < $cols ; $x++) if ($cols_to_extract[$x]['Col'] == $statby_primary) break;

			# Build an options array and a ,,, delimited options string formatted depending on the RAW setting and the DD
			$op_count = 0;
			while($data_conn->FetchRow())
			{
				if ($cols_to_extract[$x]['Raw']) $val = $data_conn->row[0];
				else $val = FormatValue($cols_to_extract[$x]['Col'], $data_conn->row[0]);
				if (!strlen($val)) $val = "No Value";
				$opts[$val] = 0;
				if ($op_count == 0) $options = $val;
				else $options .= ',,,'.$val;
				$op_count++;
			}
			$options = str_replace("'","''",$options);
		}
	}
}
else
{
	print "Report config not found";
	exit;
}
	
# Right, now we should have everything we need to build the query that obtains the data required for the report in question.
$query = "SELECT ";
for ($x = 0 ; $x < $cols ; $x++)
{
	# $groupby_column and $statby_primary are the actual names, $group_col & $stat_pri are here set to the numbers
	# of those columns according to their positions in the result set.
	if ($cols_to_extract[$x]['Col'] == $groupby_column) $group_col = $x;
	if ($cols_to_extract[$x]['Col'] == $statby_primary) $stat_pri = $x;
	if ($cols_to_extract[$x]['Col'] == $statby_secondary) $stat_sec = $x;

	# Append column list to $query
	if ($x > 0) $query .= ",".$cols_to_extract[$x]['Col'];
	else $query .= $cols_to_extract[0]['Col'];
}

# Add on the table to query & any joins
$query .= " FROM ".$table_to_query;
for ($x = 0 ; $x < sizeof($joins) ; $x++)
{
	$query .= " ".$joins[$x]['Cond'];
}

# Add where clause if required
if ($where_clause) $query .= " WHERE ".$where_clause;

# Add any required ordering
if (($orderby_columns[0]) || ($_POST['sortby']))
{
	$query .= ' ORDER BY ';
	if (($orderby_columns[0]) && ($flag_descgroups)) $orderby_columns[0] = $orderby_columns[0].' DESC';

	# Handles the on-the-fly sorting when the user clicks the column head OR sorts using the config sort order
	# The orderby_columns[0] is the colum to be grouped by
	if ($_POST['sortby'])
	{
		if ($_POST['sortorder']=="DESC") $query .= $orderby_columns[0].",".$_POST['sortby']." DESC";
		else $query .= $orderby_columns[0].",".$_POST['sortby'];
	}
	else
	{
		for ($x = 0 ; $x < sizeof($orderby_columns) ; $x++)
		{
			if ($x > 0) $query .= ",".$orderby_columns[$x];
			else $query .= $orderby_columns[0];
		}
	}
}

# And finally a limit clause if needed
if ($limit_clause > 0) $query .= ' LIMIT '.$limit_clause;
$callref_target = $swcall_opennewwindow ? ' target="_NEW"' : ''; // Target attribute for when a callref is clicked

# WHOOPY-DOO! Finally we're ready to run the report and start displaying the data!
if(@$data_conn->Query($query,"Default",false))
{
	$rows = 0;
	while($data_conn->FetchRow())
	{

		for ($x = 0 ; $x < $cols ; $x++)
		{
			if ($cols_to_extract[$x]['Raw']) $tree[$rows][$x] = str_replace("<", "&lt;", $data_conn->row[$x]);
//			DTE:= Moving the Format value to after the str replace so that we can overide insert HTMLtags
//			else $tree[$rows][$x] = str_replace("<", "&lt;", FormatValue($cols_to_extract[$x]['Col'], $data_conn->row[$x]));

			else $tree[$rows][$x] = FormatValue($cols_to_extract[$x]['Col'], str_replace("<", "&lt;", $data_conn->row[$x]));
			
			// RJC 17.01.08 60394 Added str to lower because oracle stores db names in upper case
			
			if ((strtolower($cols_to_extract[$x]['Col']) == 'opencall.callref') && !is_scheduled())
			{
				if (!$nolinks)
				{
					$href_display = report_get_column_value($cols_to_extract,$data_conn->row, "opencall.h_formattedcallref");
					$tree[$rows][$x] = '<a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.$data_conn->row[$x].'" class="header2"'.$callref_target.'>'.$href_display.'</a>';
				}
			}
			else if (strtolower($cols_to_extract[$x]['Col']) == "opencall.h_formattedcallref" && !is_scheduled())
			{
				if (!$nolinks)
				{
					$href_link = report_get_column_value($cols_to_extract,$data_conn->row, "opencall.callref");
					$tree[$rows][$x] = '<a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.$href_link.'" class="header2"'.$callref_target.'>'.$tree[$rows][$x].'</a>';
				}
				
			}	
		}
		if (!$stats[$tree[$rows][$stat_col]]) $stats[$tree[$rows][$stat_col]] = 1;
		else $stats[$tree[$rows][$stat_col]]++;
		$rows++;
	}
}
else
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	include($theme.'rpt_incl_htmlhead.php');
	$error = 1;
	include('error.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}

if (!$rows)
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	include($theme.'rpt_incl_htmlhead.php');
	$error = 2;
	include('error.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}

# Create labels & data from the stats hash in the format required by papasmurf
$labels = "";
$data = "";
foreach ($stats as $key => $val)
{
	if (!$labels && $labels !== 0) $labels = $key;
	else $labels .= ',,,'.$key;
	if (!$data && $data !== 0) $data = $val;
	else $data .= ',,,'.$val;
}

# Time to start the HTML page output itself, the first part of which comes from an unencrypted include
if ($nocachpage) include_once('swnocachepage.php');
include_once($theme.'rpt_incl_htmlhead.php');

# Area to accept, validate and set values set in the Theme header files
$RESULT_INDENT = strlen($RESULT_INDENT) ? (INT)$RESULT_INDENT : $RESULT_INDENT = 75;
if ($RESULT_INDENT < 1) $RESULT_INDENT = 1;

# Build the HTML output for the page
$newgroupflag = true;
$running = 0;
$grows = 0;
$trows = 0;
$cellpadding = 4;
$lineheight = 16;
print '<br /><table cellpadding="'.$cellpadding.'" cellspacing="0" border="0">';

# The main loop executes once per row building the HTML. The HTML is stored in $temp until each group is
# complete. $temp is then appended to the main code in $html. This is done so that functions can be
# performed on a group before it is appended without any risk of affecting the previous groups.
for ($x = 0 ; $x < $rows ; $x++)
{
	# Place group title and column headers down if required (we're starting to display a new group or the first group)
	if (($newgroupflag))
	{
		if ($flag_groupname) $group_name = $tree[$x][$group_col];
		else $group_name = '&nbsp;';
		if ((!$group_name) && ($group_name !== 0) && ($group_name !== '0')) $group_name = "(No Value)";
		$temp = '<tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td colspan="2" class="header2"><br /><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="header2" align="left">'.$group_name.'</td></tr></table><hr class="divider"></td></tr>'."\n";

		$newgroupflag = false;
		$rowspan = 1;
	}

	# This loop executes once per field, skipping the excluded groupby column if needed.
	$temp .= '<tr><td><img src="images/blank.gif" alt="" width="1" height="'.$lineheight.'"></td><td class="data">&nbsp;</td><td valign="top">';

	$temp .= '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td><td bgcolor="#000000" width="100%"><img src="images/blank.gif" width="1" height="1"></td><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td><td><table border="0" cellspacing="0" cellpadding="2" bgcolor="#ffffff" width="100%"><tr><td colspan="2"><img src="images/blank.gif" width="1" height="1"></td></tr>';
	for ($y = 0 ; $y < $cols ; $y++)
	{
		if (!$cols_to_extract[$y]['Vis']) continue;

		# Actually places the value into a cell in the temp variable.
		$temp .= '<tr><td valign="top"'.$cols_to_extract[$y]['WrHD'].' class="colhead">&nbsp;&nbsp;&nbsp;'.$cols_to_extract[$y]['DDName'].'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td width="100%" valign="top"'.$cols_to_extract[$y]['WrDT'].' class="data">';
		$temp .= $tree[$x][$y];
		$temp .= '&nbsp;&nbsp;&nbsp;</td></tr>';
	}
	$temp .= '<tr><td colspan="2"><img src="images/blank.gif" width="1" height="1"></td></tr></table></td><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000" colspan="3"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';

	# Add the final html tag to that row, increase the grows and trows variables accordingly.
	# $grows contains the number of rows placed in the current group.
	# $trows contains the total number of rows output overall.
	$temp .= '</td></tr>'."\n";
	$grows++;
	$trows++;
	
	# Test if this is the last row in this group. If it is, we do all those finishing off things like adding
	# the summary data rows, resetting the flags so that the next iteration knows we're on the next group and
	# a few other bits & pieces.
	if ($tree[$x][$group_col] != $tree[$x+1][$group_col])
	{
		# Reset some more stuff before looping again
		$running = 0;
		$grows = 0;
		$newgroupflag = true;
	}
	print $temp;
	$temp = '';
}

# End the table in the HTML. Phew!!!
print '</table>'."\n";
?>
<button style="margin:1%" onclick="var value_h2 = $('.title').text();
				 var header_text ='<?=$header_table_text?>';
				 var total_elements = header_text.split(',').length;



				 /* If we don't have header does mean that we are going to use the data of the left side in the table as header*/
				 if (header_text.length == 0){
				 	header_text = $('.colhead');
				 	total_elements = header_text.length;
				
				 	var arr = [].slice.call(header_text);
					var flag=0;
					var content_header = '';
					
					for (var c = 0, m = arr.length; c < m; c++) {

					 		value = arr[c].innerText;

					 		to_check = String.fromCharCode(34) + value.trim() + String.fromCharCode(34)+',';
					 		
					 		//We adding the values in the header only if we don't have them from before
					 		if (content_header.indexOf(to_check) < 0)
					 			content_header += to_check;

					 		flag++;

			            	if (flag==total_elements){
			            		content_header += String.fromCharCode(13) + String.fromCharCode(10);
			            		flag=0;
			            	}

			        }

			        //How many elements no duplicated we have in the header
			        total_elements = content_header.match(/,/gi).length;
				 }
				
				 //last semi-colon
				 var last_semicolon = content_header.lastIndexOf(',');
    			 console.log(last_semicolon);

    			 var first_part = content_header.slice(0,last_semicolon);
    			 var second_part = content_header.slice(last_semicolon+1);
    			 
    			 content_header = first_part+second_part;


		         var datas = $('.data');
				 var arr = [].slice.call(datas);
				 var flag=0;
				 var content_text = '';

				 for (var c = 0, m = arr.length; c < m; c++) {

				 		value = arr[c].innerText;
				 		if (c<m-1)
				        	content_text += String.fromCharCode(34) + value.trim() + String.fromCharCode(34)+',';
				        else
				        	content_text += String.fromCharCode(34) + value.trim() + String.fromCharCode(34);
				        	
		            	flag++;
		            	

		            	if (flag==total_elements){
		            		content_text += String.fromCharCode(13) + String.fromCharCode(10);
		            		flag=0;
		            	}

		         }	

		         if(!content_text){
		         	alert('Display the table at least one time');
		     	 }
		     	 else{
		     	 	 var full_content = content_header+content_text;
		     	 	 var filename = value_h2+'.csv';

		     	 	 //We ask the version of the browser
		     	 	 var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
					     ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
					     ieEDGE = navigator.userAgent.match(/Edge/g),
					     ieVer=(ie ? ie[1] : (ie11 ? 11 : (ieEDGE ? 12 : -1)));

					 //Blob object is only allow from IE>10. firefox, chrome, safari, opera, ....
					 if (ieVer!=9) {
					 	 var textFileAsBlob = new Blob([full_content], {type: 'text/csv;charset=utf-8'});
						 var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
						 
						 //IE 10 an 11
					 	 if (!isChrome)
					 	 	window.navigator.msSaveBlob(textFileAsBlob, filename);
						 //Chrome
						 else
							{
							 var myURL = window.URL || window.webkitURL
						     var url = myURL.createObjectURL(textFileAsBlob);

							 var a = document.createElement('a');
							 a.setAttribute('href', url);
							 a.setAttribute('download', filename);

							 // Create Click event
							 var clickEvent = document.createEvent ('MouseEvent');
							 clickEvent.initMouseEvent ('click', true, true, window, 0, 
								event.screenX, event.screenY, event.clientX, event.clientY, 
								event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 
								0, null);

							 // dispatch click event to simulate download
							 a.dispatchEvent (clickEvent);

							}
						 
					  } 
					  //IE9 SaveAS
					  else {
					       var IEwindow = window.open();
					       IEwindow.document.write('sep=,\r\n' + full_content);
					       IEwindow.document.close();
					       IEwindow.document.execCommand('SaveAs', true, filename);
					       IEwindow.close();
					   	   }
					  //Be sure that the text of the button is the same as the beginning
					  $('button').text('Export Data');
			     }
				 "
>Export Data</button>
<?
print $html;
?>
<?php include_once($theme.'rpt_incl_htmlfoot.php'); ?>
<br /><br />
</body>
</html>
<?php
# Write back to the database details of how long the report took to run, who ran it
if (!$analystid) $analystid = 'Anonymous';
$end_time = time();
$query = "INSERT INTO ".$hist_table." (reportid,who,wen,how) VALUES (".$reportid.",'".$analystid."',".$start_time.",".($end_time - $start_time).")";
$conf_conn->Query($query);

# Make sure the run history table only contains the last 10 ($retain) results by deleting any that are older than the 10th entry
$retain = 10;
$query = "SELECT wen FROM ".$hist_table." WHERE reportid=".$reportid." ORDER BY wen DESC LIMIT ".($retain-1).",1";
$conf_conn->Query($query);
if ($conf_conn->FetchRow())
{
	$query = "DELETE FROM ".$hist_table." WHERE reportid=".$reportid." AND wen < ".$conf_conn->row[0];
	$conf_conn->Query($query);
}

# Script over, close database connections
$data_conn->Close();
$conf_conn->Close();
?>
