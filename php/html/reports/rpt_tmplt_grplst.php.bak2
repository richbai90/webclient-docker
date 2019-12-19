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


	sandra	17/08/07	Sandra	Samuels			Bug 50723 Convert Group column data to upper case in SQL query
	RJC		17.01.08	Ryan Cheriton			Bug 60394 Added str to lower because oracle stores db names in upper case

	NWJ		18.02.10	NeilWJ					Modified callref hyperlink to use _APPCODE in the href. This means reports will point to call detail php based on the installed application.
	RF		04/07/16	RickyF					The output was using  FormatValue() and passing it a formatted call reference this gemnerated an SQL query error for each record output.


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
$this_template = preg_replace("/\/*\w*\/+/", "", $_SERVER['PHP_SELF']);	// The name of the template file itself, for passing on to the chart editor

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
if (!$conf_conn->Query("SELECT reportconf, charttop, chartbot FROM ".$conf_table." WHERE reportid=".$reportid))
{
	print "Report config not found";
	exit;
}
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
	if ((file_exists("themes/".$theme."/rpt_incl_htmlhead.php")) && (file_exists("themes/".$theme."/rpt_incl_htmlhead.php"))) 
		$theme = "themes/".$theme."/";
	else 
		$theme = '';
}

//	<FN dt=30-June-2006>
//	Data dictionary specified in [$conf_table] MUST not be used for formatting the fields. 
//	Its purpose is to filter the reports to be displayed in helpdesk client and such it's in no relation with PHP!

//	$dd = $_GET['dd'] ? $_GET['dd'] : $attribs[$index['REPORT'][0]]['attributes']['DD'];
//	if ((!$dd) || ($dd=="All")) 
//		$dd = "Default";
//	swdti_load($dd);
//	</FN>


// Un-documented and unused for now due to incompatibility with MSSql
$limit_clause = $attribs[$index['QUERY'][0]]['attributes']['LIMIT'];

$x = 0;	

// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
// Check $index['COLUMN'] exists before we try to use it.
// </AI>



$have_opencall_callref = false;
$have_opencall_h_formattedcallref = false;


if(isset($index['COLUMN']))
{
	foreach ($index['COLUMN'] as $key)
	{
		$cols_to_extract[$x]['Col'] = $attribs[$key]['attributes']['NAME'];
		if ($cols_to_extract[$x]['Col'] == "opencall.callref")
			$have_opencall_callref = true;
		if ($cols_to_extract[$x]['Col'] == "opencall.h_formattedcallref")
			$have_opencall_h_formattedcallref = true;
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
	if ((!$have_opencall_callref and !$have_opencall_h_formattedcallref) || ($have_opencall_callref and $have_opencall_h_formattedcallref)) {
		
	}
	//But we need to include callref or h_formattedcallref in case there is one of them in the system reports
	else{
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


	/*$cols_to_extract[$x]['Col']  = "opencall.h_formattedcallref";
	$flags = 16;

	$cols_to_extract[$x]['Sum'] = $flags & 1;
	$cols_to_extract[$x]['Ave'] = $flags & 2;
	$cols_to_extract[$x]['Min'] = $flags & 4;
	$cols_to_extract[$x]['Max'] = $flags & 8;
	$cols_to_extract[$x]['Vis'] = $flags & 16;
	$cols_to_extract[$x]['Raw'] = $flags & 32;
	$cols_to_extract[$x]['WrHD'] = $flags & 64 ? " nowrap" : "";
	$cols_to_extract[$x]['WrDT'] = $cols_to_extract[$x]['WrHD'];
	if ($cols_to_extract[$x]['Sum']) $valid_sum = true;
	if ($cols_to_extract[$x]['Ave']) $valid_ave = true;
	if ($cols_to_extract[$x]['Min']) $valid_min = true;
	if ($cols_to_extract[$x]['Max']) $valid_max = true;
	*/
}


# A user could, in theory, set the report to diplay Sum, Ave, Min & Max data without applying the functions to
# any columns which would create blank aggregate footers. The valid flags are here to avoid the problem as they
# are set to true when at least one column has that function applied.

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
			if (!strlen($val))
			{
				if ($hadnoval) continue;
				$val = "(No Value)";
				$hadnoval = true;
			}
			$opts[$val] = 0;
			if ($op_count == 0) $options = $val;
			else $options .= ',,,'.$val;
			$op_count++;
		}
		$options = str_replace("'","''",$options);
	}
}

#print $query.'<br />'.$options;
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
	if ($x > 0) {
		// --sandra	17/08/07 Convert Group column data to upper case in SQL query
		if ($cols_to_extract[$x]['Col'] == $groupby_column) $query .= ", upper(". $cols_to_extract[$x]['Col'].")";
		else $query .= ",". $cols_to_extract[$x]['Col'];

	}else{
		// --sandra	17/08/07 Convert Group column data to upper case in SQL query
		if ($cols_to_extract[$x]['Col'] == $groupby_column) $query .= " upper(".$cols_to_extract[0]['Col'].")";
		else $query .= $cols_to_extract[0]['Col'];
		}
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

# WHOOPY-DOO! Finally we're ready to run the report and start displaying the data!

if(@$data_conn->Query($query))
{
	# Populate the numerical array $tree with numerical arrays that contain the data fields for each row. This also is where
	# the data is formatted according to the Data Dictionary unless the RAW flag is set for the column in question.
	# The $stats array counts unique occurences of particular strings (held as keys) in the statby column.
	$rows = 0;
	while($data_conn->FetchRow())
	{
		for ($x = 0 ; $x < $cols ; $x++)
		{
			$tree[$rows][$x] = $data_conn->row[$x];

			# This is needed to get rid of empty string that appear in group or stat columns as such values in these
			# places have caused tricky to spot bugs in previous templates. Stamping it out now should prevent this.
			if (($x == $group_col) && (strlen($tree[$rows][$x])==0)) $tree[$rows][$x] = '(No Value)';
			if (($x == $stat_pri) && (strlen($tree[$rows][$x])==0)) $tree[$rows][$x] = '(No Value)';
			if (($x == $stat_sec) && (strlen($tree[$rows][$x])==0)) $tree[$rows][$x] = '(No Value)';
		}
		if ($cols_to_extract[$stat_pri]['Raw'])
		{
			if (!$stats[$tree[$rows][$stat_pri]]) $stats[$tree[$rows][$stat_pri]] = 1;
			else $stats[$tree[$rows][$stat_pri]]++;
		}
		else
		{
			if (!$stats[FormatValue($cols_to_extract[$stat_pri]['Col'], $tree[$rows][$stat_pri])]) $stats[FormatValue($cols_to_extract[$stat_pri]['Col'], $tree[$rows][$stat_pri])] = 1;
			else $stats[FormatValue($cols_to_extract[$stat_pri]['Col'], $tree[$rows][$stat_pri])]++;
		}
		$rows++;
	}
}
else
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	include($theme.'rpt_incl_htmlhead.php');
	$error = "You have an error in your Query syntax:<br />".$query;
	include('rpt_page_filterlst_err.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}
if (!$rows)
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	include($theme.'rpt_incl_htmlhead.php');
	$error = "Sorry, No results found.";
	include('rpt_page_filterlst_err.php');
	include($theme.'rpt_incl_htmlfoot.php');
	exit;
}

# Here the Label & Data strings for the chart engine are constructed from the values now held in the $stats array or, in the
# case of a multi-chart, extracted by looping through the result set. Data & label strings are stored using ,,, delimited
# lists that are stored in the temporary table and parsed back into the array structures by the chart generator. Multi
# dimensional charts separate groups also using the  ___ delimiter.
if (!$flag_multihead)
{
	foreach ($stats as $key => $val)
	{
		if (!strlen($labels)) $labels = $key;
		else $labels .= ',,,'.$key;
		if (!strlen($data)) $data = $val;
		else $data .= ',,,'.$val;
	}
}
else
{
	# Opts is an array of possible stat_col values all set to zero. Temp is initialised to this after each group
	$temp = $opts;

	for($x = 0 ; $x < $rows ; $x++)
	{
		$temp[$tree[$x][$stat_pri]]++;
		if ($tree[$x][$group_col] != $tree[$x+1][$group_col])
		{
			if (strlen($labels)) $labels .= ',,,'.$tree[$x][$group_col];
			else $labels = $tree[$x][$group_col];

			if (strlen($data)) $data .= '___';

			foreach($temp as $key => $val)
			{
				if (!strlen($data)) $data = $val;
				else $data .= ',,,'.$val;
			}

			$temp = $opts;
		}
	}
	$data = str_replace("___,,,","___",$data);
}

# Initialise a few variables & build & output the HTML for the page
$lineheight = 16;								// The height of the spacer gif that governs the minimum height of a row
$cellpadding = 2;								// The cellpadding value for the result table itself
$html_temp = '';								// Temporarily stores the HTML output for a group until it's ready to flush
$rowcount_group = 0;							// Keeps the number of rows in each group
$reccount_group = 0;							// Keeps the number of record in each group
$groupcount = 0;								// Keeps the number of groups in the report
$aggregate_rows = 0;							// Number of rows added to groups by turning on aggregate functions
if ($flag_groupfoot)
{
	if ($flag_sum && $valid_sum) $aggregate_rows++;	
	if ($flag_ave && $valid_ave) $aggregate_rows++;
	if ($flag_min && $valid_min) $aggregate_rows++;
	if ($flag_max && $valid_max) $aggregate_rows++;
	if ($flag_count) $aggregate_rows++;
}
$grp_stats = array();							// Keeps track of any required aggregate values
$grp_labels = '';								// Stores the labels for group charts
$grp_data = '';									// Stores the values for group charts
if ($flag_groupcharts) $span++;					// Contains the width of the results table in cells for spanning purposes
$callref_target = $swcall_opennewwindow ? ' target="_NEW"' : ''; // Target attribute for when a callref is clicked

# Generate the column headings table row with relevent sort settings & store it in $html_columnheads for further use.
# If headings are turned off it builds a blank row, this is needed to format any group charts correctly.
if ($flag_heads) $html_columnheads = '<td><img src="images/space.gif" width="1" height="'.$lineheight.'" alt="" border="0"></td>';
else $html_columnheads = '<td><img src="images/space.gif" width="1" height="1" alt="" border="0"></td>';
for ($y = 0 ; $y < $cols ; $y++)
{
	if (!$cols_to_extract[$y]['Vis']) continue;
	if ($flag_heads)
	{
		if ($nolinks) $html_columnheads .= '<td'.$cols_to_extract[$y]['WrHD'].'><b>'.$cols_to_extract[$y]['DDName'].'</b><img src="images/blank.gif" width="5" height="6" alt="" hspace="3" align="bottom" border="0"></td>';				
		else
		{
			if ($_POST['sortby'] != $cols_to_extract[$y]['Col']) $html_columnheads .= '<td'.$cols_to_extract[$y]['WrHD'].'><a href="javascript:document.filter.sortby.value=\''.$cols_to_extract[$y]['Col'].'\';document.filter.sortorder.value=\'ASCC\';document.filter.submit();" class="colhead"><b>'.$cols_to_extract[$y]['DDName'].'</b><img src="images/blank.gif" width="5" height="6" alt="" hspace="3" align="bottom" border="0"></a></td>';
			else
			{
				if ($_POST['sortorder']=='DESC') $html_columnheads .= '<td'.$cols_to_extract[$y]['WrHD'].'><a href="javascript:document.filter.sortby.value=\''.$cols_to_extract[$y]['Col'].'\';document.filter.sortorder.value=\'ASCC\';document.filter.submit();" class="colhead"><b>'.$cols_to_extract[$y]['DDName'].'</b><img src="images/downarrow.gif" width="5" height="6" alt="" hspace="3" align="bottom" border="0"></a></td>';
				else $html_columnheads .= '<td'.$cols_to_extract[$y]['WrHD'].'><a href="javascript:document.filter.sortby.value=\''.$cols_to_extract[$y]['Col'].'\';document.filter.sortorder.value=\'DESC\';document.filter.submit();" class="colhead"><b>'.$cols_to_extract[$y]['DDName'].'</b><img src="images/uparrow.gif" width="5" height="6" alt="" hspace="3" align="bottom" border="0"></a></td>';
			}
		}
	}
	else $html_columnheads .= '<td><img src="images/blank.gif" alt="" width="1" height="1"></td>';
}

# Time to start the HTML page output itself, the first part of which comes from an unencrypted include
if ($nocachpage) include_once('swnocachepage.php');
include_once($theme.'rpt_incl_htmlhead.php');

# Area to accept, validate and set values set in the Theme header files
$RESULT_INDENT = strlen($RESULT_INDENT) ? (INT)$RESULT_INDENT : $RESULT_INDENT = 75;
if ($RESULT_INDENT < 1) $RESULT_INDENT = 1;

# This just generates and prints out the top of the table which contains the filter form itself.
print '<form action="'.$this_template.'?'.$old_query.'" method="post" name="filter"><input type="hidden" name="sortby" value=""><input type="hidden" name="sortorder" value="">';
print '<table cellpadding="'.$cellpadding.'" cellspacing="0" border="0">';

# Output the main chart at the top of the page if required
if ($flag_showhead)
{
	# Add the chart data to the temporary table & extract the id
	$query = "INSERT INTO ".$conf_tmptable." (ckeys,cvals,copts,qry,xmlconf,timestamp) VALUES ('".(str_replace("'","''",$labels))."','".$data."','".$options."','".$old_query."','".$top_config."','".$start_time."')";
	$conf_conn->Query($query);
	$lid = $conf_conn->LastInsertID();

	# Make the chart according to the border and chart editable settings and output it
	$url = 'chart_makeXML.php?lid='.$lid."&sessid=".$sessid;
	if ($flag_edit) $html_chart = '<a href="javascript:chartmod.lid.value='.$lid.';chartmod.which.value=\'TOP\';chartmod.submit();"><img src="'.$url.'" border="0"></a>';
	else $html_chart = '<img src="'.$url.'" border="0">';
	if (strpos($top_config,'<Border value="1"/>')) $html_chart = '<table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#000000" colspan="3"><img src="images/space.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1"></td><td>'.$html_chart.'</td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000" colspan="3"><img src="images/space.gif" width="1" height="1"></td></tr></table>';
	print '<tr><td><img src="images/space.gif" width="'.$RESULT_INDENT.'" height="1"></td><td colspan="'.$span.'">';
	print $html_chart.'</td></tr>';

	# Small gap between the graph and the filter, for neatness.
	print '<tr><td colspan="'.($span+1).'"><img src="images/space.gif" width="1" height="10"></td></tr>';
}
else
{
	print '<tr><td><img src="images/space.gif" width="'.$RESULT_INDENT.'" height="1"></td><td colspan="'.$span.'"><img src="images/space.gif" width="1" height="1"></td></tr>';
}

# Output the filter form. $filter_fields stores hidden field equals of the standard filter fields to mirror the filter
# settings in the hidden form below that is used to pass data to the chart editor. The chart editor will replicate any
# filters and send them back to the template with any new chart configs. Without this, the action of editing a chart
# would have the annoying side effect of discarding any filter settings.
$filter_fields = '';
if ($flag_filter)
{
	if ($html_columnheads)
	{
		if ($flag_groupcharts) print '<tr>'.$html_columnheads.'<td>&nbsp;</td></tr>';
		else print '<tr>'.$html_columnheads.'</tr>';
	}
	print '<tr><td><input type="submit" value="Apply Filter" class="buttonstyle">&nbsp;</td>';
	for ($y = 0 ; $y < $cols ; $y++)
	{
		if (!$cols_to_extract[$y]['Vis']) continue;
		$name = "filt_".(str_replace(".","!DOT!",$cols_to_extract[$y]['Col']));
		print '<td><input type="text" name="filt_'.(str_replace(".","!DOT!",$cols_to_extract[$y]['Col'])).'" size="15" value="'.$_POST[$name].'" class="selectstyle"></td>';
		$filter_fields .= '<input type="hidden" name="filt_'.(str_replace(".","!DOT!",$cols_to_extract[$y]['Col'])).'" value="'.$_POST[$name].'">';
	}
	if ($flag_groupcharts) print '<td>&nbsp;</td></tr>';
	else print '</tr>';
	# A spacer between the filter and the first group
	print '<tr><td colspan="'.($span+1).'"><img src="images/space.gif" width="1" height="10"></td></tr>';
}

# The results are finally looped through and displayed. This is also where any groups are formatted, charts are generated
# and just about everything else relating to the overall look is done.


for ($x = 0 ; $x < $rows ; $x++)
{
	# If this row is the start of a new group we need to do some things -> PRINT THE HEAD OF THE COLUMNS
	if (($x == 0) || ($tree[$x][$group_col] != $tree[$x-1][$group_col]))
	{
		if ($flag_groupname)
		{

			if ($cols_to_extract[$group_col]['Raw']) 
				$finalval = $tree[$x][$group_col];
			else 
				$finalval = FormatValue($cols_to_extract[$group_col]['Col'], $tree[$x][$group_col]);
			
			// RJC 17.01.08 60394 Added str to lower because oracle stores db names in upper case
			
			if (strtolower($cols_to_extract[$group_col]['Col']) == 'opencall.h_formattedcallref')
			{
				if (!$nolinks) $finalval = '<a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.$tree[$x][$group_col].'" class="header2"'.$callref_target.'>'.$finalval.'</a>';
			}
			$html_temp .= '<tr><td>&nbsp;</td><td colspan="'.$span.'"><br /><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="header2" align="left">'.$finalval.'</td><td class="header2" align="right">&nbsp;!RECCOUNT!</td></tr></table><hr class="divider"></td></tr>';
		}

		$html_temp .= '<tr>'.$html_columnheads;
		if ($flag_groupcharts) $html_temp .= '<td rowspan="!ROWSPAN!" valign="top">!CHART!</td>';
		$html_temp .= '</tr>';
		
		# Need to keep track of how many groups there are for future averaging purposes
		$groupcount++;
	}

	# Place the values in the HTML table & keep tabs on any aggregate sums -> PRINT THE VALUES OF THE COLUMNS
	if (!$flag_hiderows) $html_temp .= '<tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td>';
	for ($y = 0 ; $y < $cols ; $y++)
	{
		if (!$cols_to_extract[$y]['Vis']) continue;
		// Don't include the columns which were not included in the report definition. These were added artificially to enable correct display of call references
		//if ((strtolower($cols_to_extract[$y]['Col']) == "opencall.callref") && (!$have_opencall_callref)) continue;
		//if ((strtolower($cols_to_extract[$y]['Col']) == "opencall.h_formattedcallref") && (!$have_opencall_h_formattedcallref)) continue;
		if (!$flag_hiderows)
		{
			if ($cols_to_extract[$y]['Raw']) $html_temp .= '<td class="data" valign="top">'.$tree[$x][$y].'</td>';
			else
			{

				// ????? CATER FOR SCHEDULED REPORTS - do not display the HREF ?????

				// RJC 17.01.08 60394 Added str to lower because oracle stores db names in upper case
				if (strtolower($cols_to_extract[$y]['Col']) == "opencall.callref") {
					//$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target.'>'.(str_replace("<", "&lt;", FormatValue($cols_to_extract[$y]['Col'], $tree[$x][$y]))).'</a></td>';
					//$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target.'>'.report_get_column_value($cols_to_extract,$tree[$x]).'</a></td>';	
/*
					$href_link = '"../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target;
					$href_display = report_get_column_value($cols_to_extract,$tree[$x]);
*/
					$href_link = '../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).$callref_target;
					$href_display = report_get_column_value($cols_to_extract,$tree[$x], "opencall.h_formattedcallref");
					$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href='.$href_link.'>'.$href_display.'</a></td>';	

					//$y++;
				}
				else {

					 //In case we have h_formattedcallref but not callref -> add an href to the value 
					 //if ((strtolower($cols_to_extract[$y]['Col']) == "opencall.h_formattedcallref") && !$have_opencall_callref && $have_opencall_h_formattedcallref) {
					 if (strtolower($cols_to_extract[$y]['Col']) == "opencall.h_formattedcallref") {
							//$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target.'>'.(str_replace("<", "&lt;", FormatValue($cols_to_extract[$y]['Col'], $tree[$x][$y]))).'</a></td>';
							//$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target.'>'.( FormatValue($cols_to_extract[$y]['Col'], (str_replace("<", "&lt;",$tree[$x][$y])))).'</a></td>';	
							//$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href="../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.filter_var($tree[$x][$y], FILTER_SANITIZE_NUMBER_INT).'"'.$callref_target.'>'.report_get_column_value_formatted($cols_to_extract,$tree[$x]).'</a></td>';	

							$href_link = '../clisupp/details/'._APPCODE.'/'._CALLPHPFILE.'?sessid='.$sessid.'&callref='.report_get_column_value($cols_to_extract,$tree[$x], "opencall.callref");
							// $href_display = FormatValue($cols_to_extract[$y]['Col'], (str_replace("<", "&lt;",$tree[$x][$y])));
							// RickF - Passing the formatted callref to the FormatValue does not make any sense the value is already formatted correctly
							$href_display = str_replace("<", "&lt;",$tree[$x][$y]);
							$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top"><a href='.$href_link.'>'.$href_display.'</a></td>';	
					 }				

					 //DTE:-Moving the string replace to before the column overide so that we can force html tags
					 //else $html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top">'.(str_replace("<", "&lt;", FormatValue($cols_to_extract[$y]['Col'], $tree[$x][$y]))).'&nbsp;</td>';
					 else {
					 	  /*	$html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top">';
						 	$html_temp .= ( FormatValue($cols_to_extract[$y]['Col'], (str_replace("<", "&lt;",$tree[$x][$y]))));
						 	$html_temp .='</td>';*/
							
						  $html_temp .= '<td class="data"'.$cols_to_extract[$y]['WrDT'].' valign="top">'.( FormatValue($cols_to_extract[$y]['Col'], (str_replace("<", "&lt;",$tree[$x][$y])))).'</td>';
					 }
				}
			}
		}
		if (($cols_to_extract[$y]['Sum']) || ($cols_to_extract[$y]['Ave']))
		{
			$grp_sum[$y] += $tree[$x][$y];
			$tot_sum[$y] += $tree[$x][$y];
		}
		if ($cols_to_extract[$y]['Min'])
		{
			if (($tree[$x][$y] < $grp_min[$y]) || (!strlen($grp_min[$y]))) $grp_min[$y] = $tree[$x][$y];
			if (($tree[$x][$y] < $tot_min[$y]) || (!strlen($tot_min[$y]))) $tot_min[$y] = $tree[$x][$y];
		}
		if ($cols_to_extract[$y]['Max'])
		{
			if (($tree[$x][$y] > $grp_max[$y]) || (!strlen($grp_max[$y]))) $grp_max[$y] = $tree[$x][$y];
			if (($tree[$x][$y] > $tot_max[$y]) || (!strlen($tot_max[$y]))) $tot_max[$y] = $tree[$x][$y];
		}
	}
	if (!$flag_hiderows)
	{
		$html_temp .= "</tr>\n";
		$rowcount_group++;
	}
	$reccount_group++;

	# Keep track of data for the group charts
	if ($cols_to_extract[$stat_sec]['Raw'])
	{
		if (!$grp_stats[$tree[$x][$stat_sec]]) $grp_stats[$tree[$x][$stat_sec]] = 1;
		else $grp_stats[$tree[$x][$stat_sec]]++;
	}
	else
	{
		if (!$grp_stats[FormatValue($cols_to_extract[$stat_sec]['Col'], $tree[$x][$stat_sec])]) $grp_stats[FormatValue($cols_to_extract[$stat_sec]['Col'], $tree[$x][$stat_sec])] = 1;
		else $grp_stats[FormatValue($cols_to_extract[$stat_sec]['Col'], $tree[$x][$stat_sec])]++;
	}

	# If this row is the last in the group
	if (($x == $rows) || ($tree[$x][$group_col] != $tree[$x+1][$group_col]))
	{
		# Generate & add aggregate result rows to the group HTML if required
		if ($flag_groupfoot)
		{
			$html_sum = $html_min = $html_max = $html_ave = '';
			for ($y = 0 ; $y < $cols ; $y++)
			{
				if (!$cols_to_extract[$y]['Vis']) continue;
				if ($cols_to_extract[$y]['Raw'])
				{
					if ($cols_to_extract[$y]['Sum']) $html_sum .= '<td class="datasum">'.$grp_sum[$y].'</td>';
					else $html_sum .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Ave']) $html_ave .= '<td class="datasum">'.(sprintf("%.2f",$grp_sum[$y]/$reccount_group)).'</td>';
					else $html_ave .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Min']) $html_min .= '<td class="datasum">'.$grp_min[$y].'</td>';
					else $html_min .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Max']) $html_max .= '<td class="datasum">'.$grp_max[$y].'</td>';
					else $html_max .= '<td class="datasum">&nbsp;</td>';
				}
				else
				{
					if ($cols_to_extract[$y]['Sum']) $html_sum .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $grp_sum[$y])).'</td>';
					else $html_sum .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Ave']) $html_ave .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], sprintf("%.2f",$grp_sum[$y]/$reccount_group))).'</td>';
					else $html_ave .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Min']) $html_min .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $grp_min[$y])).'</td>';
					else $html_min .= '<td class="datasum">&nbsp;</td>';
					if ($cols_to_extract[$y]['Max']) $html_max .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $grp_max[$y])).'</td>';
					else $html_max .= '<td class="datasum">&nbsp;</td>';
				}
			}
			if ($flag_count)
			{
				if ($flag_groupcharts) $html_temp .= '<tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td align="center" colspan="'.($span-1).'" class="datasum"><b>Record Count : '.$reccount_group.'</b></td></tr>';
				else $html_temp .= '<tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td align="center" colspan="'.$span.'" class="datasum"><b>Record Count : '.$reccount_group.'</b></td></tr>';
			}
			if ($flag_sum && $valid_sum) $html_temp .= '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Sum&nbsp;&nbsp;</td></tr></table></td>'.$html_sum.'</tr>';
			if ($flag_ave && $valid_ave) $html_temp .= '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Average&nbsp;&nbsp;</td></tr></table></td>'.$html_ave.'</tr>';
			if ($flag_min && $valid_min) $html_temp .= '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Minimum&nbsp;&nbsp;</td></tr></table></td>'.$html_min.'</tr>';
			if ($flag_max && $valid_max) $html_temp .= '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Maximum&nbsp;&nbsp;</td></tr></table></td>'.$html_max.'</tr>';
		}

		if ($flag_groupcharts)
		{
			# Create the delimited strings that form the chart for this group
			foreach ($grp_stats as $key => $val)
			{
				if (!strlen($grp_labels)) $grp_labels = $key;
				else $grp_labels .= ',,,'.$key;
				if (!strlen($grp_data)) $grp_data = $val;
				else $grp_data .= ',,,'.$val;
			}
		}

		if ($flag_groupcharts)
		{
			# Add the chart data to the temporary table & extract the id
			$query = "INSERT INTO ".$conf_tmptable." (ckeys,cvals,copts,qry,xmlconf,timestamp) VALUES ('".(str_replace("'","''",$grp_labels))."','".$grp_data."','','".$old_query."','".$bot_config."','".$start_time."')";
			$conf_conn->Query($query);
			$lid = $conf_conn->LastInsertID();

			# Make the chart according to the border and chart editable settings and output it
			$url = 'chart_makeXML.php?lid='.$lid."&sessid=".$sessid;	
			if ($flag_edit) $html_chart = '<a href="javascript:chartmod.lid.value='.$lid.';chartmod.which.value=\'BOT\';chartmod.submit();"><img src="'.$url.'" border="0"></a>';
			else $html_chart = '<img src="'.$url.'" border="0">';
			if (strpos($bot_config,'<Border value="1"/>')) $html_chart = '<table border="0" cellspacing="0" cellpadding="0"><tr><td rowspan="3" class="datasum">&nbsp;&nbsp;</td><td bgcolor="#000000" colspan="3"><img src="images/space.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1"></td><td>'.$html_chart.'</td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000" colspan="3"><img src="images/space.gif" width="1" height="1"></td></tr></table>';
			else $html_chart = '<table border="0" cellspacing="0" cellpadding="0"><tr><td class="datasum">&nbsp;&nbsp;</td><td>'.$html_chart.'</td></tr></table>';

			# This adds a row to the group with a transparent gif in it. The idea is that we set the height of this gif to
			# whatever the difference is between the height of the group chart and the height of all the rows in the group.
			# This is needed because HTML will render the rows so that their combined height equals that of the chart which
			# in groups with only a couple of rows will cause the row height to be very large which will make the report
			# look uneven & shit.
			$spacer = $bot_height - ($rowcount_group + $aggregate_rows) * ($lineheight + ($cellpadding * 2));
			if ($flag_heads) $spacer -= ($lineheight + ($cellpadding * 2));
			else  $spacer -= (1+ ($cellpadding * 2));
			if ($spacer < 0) $spacer = 1;
			$html_temp .= '<tr><td colspan="'.$span.'"><img src="images/blank.gif" alt="" width="1" height="'.$spacer.'"></td></tr>'."\n";

			# Drop the chart, rowspan & any record count into the group HTML
			$html_temp = str_replace("!CHART!",$html_chart,str_replace("!ROWSPAN!",$rowcount_group+$aggregate_rows+2,$html_temp));
		}

		# Drop in the record count if needed and output group HTML
		if ($flag_counthead) print str_replace("!RECCOUNT!","Record Count : ".$reccount_group,$html_temp);
		else print str_replace("!RECCOUNT!","",$html_temp);

		# Reset variables ready for the next group
		$rowcount_group = 0;
		$reccount_group = 0;
		$grp_stats = $grp_sum = $grp_min = $grp_max = array();
		$html_temp = $grp_data = $grp_labels = '';
	}
}
if ($flag_totals)
{
	# Small gap to separate the totals from the report data. Then the Totals header
	print '<tr><td colspan="'.($span+1).'"><img src="images/space.gif" width="1" height="10"></td></tr>';
	print '<tr><td>&nbsp;</td><td colspan="'.$span.'"><br /><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="header2" align="left">Overall Totals</td><td class="header2" align="right">&nbsp;</td></tr></table><hr class="divider"></td></tr>';

	# If group charts are on we need a place holder to occupy the cell
	$emptycell = $flag_groupcharts ? '<td><img src="images/space.gif" width="1" height="1"></td>' : '';

	# Generate & add aggregate result rows to the group HTML
	$html_sum = $html_min = $html_max = $html_ave = '';
	for ($y = 0 ; $y < $cols ; $y++)
	{
		if (!$cols_to_extract[$y]['Vis']) continue;
		if ($cols_to_extract[$y]['Raw'])
		{
			if ($cols_to_extract[$y]['Sum']) $html_sum .= '<td class="datasum">'.$tot_sum[$y].'</td>';
			else $html_sum .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Ave']) $html_ave .= '<td class="datasum">'.(sprintf("%.2f",$tot_sum[$y]/$rows)).'</td>';
			else $html_ave .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Min']) $html_min .= '<td class="datasum">'.$tot_min[$y].'</td>';
			else $html_min .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Max']) $html_max .= '<td class="datasum">'.$tot_max[$y].'</td>';
			else $html_max .= '<td class="datasum">&nbsp;</td>';
		}
		else
		{
			if ($cols_to_extract[$y]['Sum']) $html_sum .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $tot_sum[$y])).'</td>';
			else $html_sum .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Ave']) $html_ave .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], sprintf("%.2f",$tot_sum[$y]/$rows))).'</td>';
			else $html_ave .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Min']) $html_min .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $tot_min[$y])).'</td>';
			else $html_min .= '<td class="datasum">&nbsp;</td>';
			if ($cols_to_extract[$y]['Max']) $html_max .= '<td class="datasum">'.(FormatValue($cols_to_extract[$y]['Col'], $tot_max[$y])).'</td>';
			else $html_max .= '<td class="datasum">&nbsp;</td>';
		}
	}
	if ($flag_sum && $valid_sum) print '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Sum&nbsp;&nbsp;</td></tr></table></td>'.$html_sum.$emptycell.'</tr>';
	if ($flag_ave && $valid_ave) print '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Average&nbsp;&nbsp;</td></tr></table></td>'.$html_ave.$emptycell.'</tr>';
	if ($flag_min && $valid_min) print '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Minimum&nbsp;&nbsp;</td></tr></table></td>'.$html_min.$emptycell.'</tr>';
	if ($flag_max && $valid_max) print '<tr><td align="right"><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td class="datasum">Maximum&nbsp;&nbsp;</td></tr></table></td>'.$html_max.$emptycell.'</tr>';
	if ($flag_count)
	{
		$avepergroup = $flag_avecount ? "&nbsp;&nbsp;(Average Per Group ".(sprintf("%.2f",$rows/$groupcount)).")" : "";
		if ($flag_groupcharts) print '<tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td align="center" colspan="'.($span-1).'" class="datasum"><b>Total Record Count : '.$rows.$avepergroup.'</b></td>'.$emptycell.'</tr>';
		else print '<tr><td><img src="images/space.gif" width="1" height="'.$lineheight.'"></td><td align="center" colspan="'.$span.'" class="datasum"><b>Total Record Count : '.$rows.$avepergroup.'</b></td></tr>';
	}
}
?>
</table>
</form>
<button style="margin:1%;" onclick="var value_h2 = $('.title').text();
				 var headers = $('.colhead');

				 var arr = [].slice.call(headers);

				 var result = [];
				 var contador =0;
				 var header_text = '';
				 var total_elements=0;
				 var header_seen= new Array();
				 var insert_header=1;


				 if (arr.length==0){
				 	total_elements = <?=$span?>;
				 }

				 else{
				 	 for (var c = 0, m = arr.length; c < m; c++) {
		             	value = arr[c].innerText;
		             	var l_header_seen = header_seen.length;

		             	for (var u=0; u<l_header_seen;u++){
		             	 	if (header_seen[u]==value){
		             	 		insert_header=0;
		             	 		break;
		             	 	}
		              	}

		              	if (insert_header==1){
		              	 	header_seen.push(value);
		              	 	header_text += value+',';
		              	 	total_elements++;
		              	}

		              	else{
		              	   	insert_header=1;
		              	   	continue;
		          	  	}
		         
		         	 }
				 	}
				 
				 var intermediate_step =''; 
		         intermediate_step = header_text.substring(0, header_text.length-1);
		         header_text = intermediate_step+String.fromCharCode(13) + String.fromCharCode(10);
		         var datas = $('.data');

				 var arr = [].slice.call(datas);
				 var flag=0;
				 var content_text = '';

				 for (var c = 0, m = arr.length; c < m; c++) {
		                value = String.fromCharCode(34) + arr[c].innerText + String.fromCharCode(34);

		                content_text += value + ',';
							
		            	flag++;
		            	

		            	if (flag==total_elements){
		            		 intermediate_step = content_text.substring(0, content_text.length-1);
		         			 content_text = intermediate_step+String.fromCharCode(13) + String.fromCharCode(10);
		            		flag=0;
		            	}

		         }		          

		         if(!content_text){
		         	alert('Display the table at least one time');
		     	 }
		     	 else{
		     	 	 var full_content = header_text+content_text;
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
<?php include_once($theme.'rpt_incl_htmlfoot.php'); ?>
<br /><br />
<form name="chartmod" action="chart_edit.php" method="post">
<input type="hidden" name="which" value="">
<input type="hidden" name="lid" value="">
<input type="hidden" name="sessid" value="<?php echo $sessid;?>">
<input type="hidden" name="pageid" value="<?php echo $this_template?>">
<?php echo $filter_fields?>
</form>
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
