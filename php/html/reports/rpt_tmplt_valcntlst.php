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
*/

# Set start time, used to calculate the time taken to run the report.
$start_time = time();
?>
<script type='text/javascript' src='../clisupp/jquery/jquery-1.7.1.min.js'></script>
<script type='text/javascript' src='../clisupp/jquery/jquery-ui-1.8.17.custom.min.js'></script>
<?php
# Pull in required includes, functions & settings
require_once("rpt_incl_config.php");

//  <AI bugref=75627 dt=20090827 release=7.3.11.RC4>
//  Check to see if any passed-in session ID is valid, if passed in at all. Exit with error if not.
//  Code provided by WB. Peer reviewed by AI.
$session = NULL;
swphpGlobaliseRequestVars();

if (isset($sessid))
{
	$session = new swClassActivePageSession($sessid);
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

//	load the data dictionary
//	In case the report is run by the helpdesk client, data dictionary comes from [swsessions] table - loaded by [CSwActivePageSession] ctor
//	In case the report is run in scheduled mode, data dictionary comes from the GET parameters passed in the URL by the scheduler.

swdti_load($_SESSION['wc_dd']);


# Check the existence of a report id and extract it from the query string & initialise a few other variables
$reportid = $_GET['REPORTID'] ? $_GET['REPORTID'] : $_GET['reportid'];
if (!$reportid)
{
	// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
	// Ensure themes also apply to errors
	// </AI>
	throw_reporterror(3);	
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

require_once("rpt_incl_config.php");

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
	$have_opencall_callref = false;
	$x = 0;
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
		if ($have_opencall_callref)
		{
			$aux['Col']  = "opencall.h_formattedcallref";
			$aux['DDName'] = "Call Reference";
			
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

			$cols_to_extract[0] = $aux;
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
				header("Location: rpt_page_getargs.php?webclientreporting=".$_GET["webclientreporting"]."&ColourScheme=".$_GET["ColourScheme"]."&tmplt=".$this_template."&reportid=".$reportid."&sessid=".$sessid."&dd=".$_GET['dd']."&tz=".$_GET['tz']);
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

	// <AI bugref=82633 dt=20100810 release=7.4.1.QA4>
	// Start building the query. Original code had errors.
	$query = 'SELECT ';
	
	if ( $cols_to_extract ) 
		$query .= 'DISTINCT '.$cols_to_extract[0]['Col'].', ';
		
	$query .= 'COUNT(*) FROM '.$table_to_query.' ';
	
	if ( $where_clause ) 
		$query .= 'WHERE ('.$where_clause.') ';
		
	if ( $cols_to_extract ) 
		$query .= 'GROUP BY '.$cols_to_extract[0]['Col'];	

	// Original code commented out.
	//if ($where_clause) $query = 'SELECT DISTINCT '.$cols_to_extract[0]['Col'].', COUNT(*) FROM '.$table_to_query.' WHERE %WHERECLAUSE% GROUP BY '.$cols_to_extract[0]['Col'];
	//else $query = 'SELECT DISTINCT '.$cols_to_extract[0]['Col'].', COUNT(*) FROM '.$table_to_query.' GROUP BY '.$cols_to_extract[0]['Col'];
	// End of building the query.
	// </AI>
		
	$query = str_replace('%WHERECLAUSE%',$where_clause,$query);
	if(@$data_conn->Query($query,"Default",false))
	{
		$x = 0;
		while($data_conn->FetchRow())
		{
			$tree[$x] = $data_conn->row;
			$tree[$x][0] = FormatValue($cols_to_extract[0]['Col'], $tree[$x][0]);
			$x++;
		}
		
	}
	else
	{
		// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
		// Ensure themes also apply to errors
		// </AI>
		throw_reporterror(2);		
		exit;
	}
	if (!$x)
	{
		// <AI bugref=82633 dt=20100425 release=7.4.1.QA1>
		// Ensure themes also apply to errors
		// </AI>
		throw_reporterror(2);		
		exit;
	}
}

# Time to start the HTML page output itself, the first part of which comes from an unencrypted include
if ($nocachpage) include_once('swnocachepage.php');
include_once($theme.'rpt_incl_htmlhead.php');

# Area to accept, validate and set values set in the Theme header files
$RESULT_INDENT = strlen($RESULT_INDENT) ? (INT)$RESULT_INDENT : $RESULT_INDENT = 75;
if ($RESULT_INDENT < 1) $RESULT_INDENT = 1;

# Initialise a few variables & build & output the HTML for the page
$cellpadding = 2;									// The cellpadding value for the result table itself
$pixel_spacer = 14;
$cellpadding = 4;
$extra_row = 0;
$grows = 0;
$html = '<table cellpadding="'.$cellpadding.'" cellspacing="0" border="0">';
for ($x = 0 ; $x < sizeof($tree) ; $x++)
{
	if (($flag_heads) && ($x == 0))
	{
		$temp = swdti_getcoldispname($config_statby);
		if (strpos($temp,'.')) $temp = substr($temp, (strrpos ($temp,'.'))+1);
		$html .= '<tr><td><img src="images/blank.gif" alt="" width="100" height="'.$pixel_spacer.'"></td><td><img src="images/blank.gif" alt="" width="1" height="1"></td><td><img src="images/blank.gif" alt="" width="1" height="1"></td><td><b>'.$temp.'</b></td><td><img src="images/blank.gif" alt="" width="20" height="1"></td><td>&nbsp;</td><td><img src="images/blank.gif" alt="" width="30" height="1"></td></tr>';
		$extra_row = 1;
	}
	$html .= '<tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="'.$pixel_spacer.'"></td><td><img src="images/blank.gif" alt="" width="1" height="1"></td><td><img src="images/blank.gif" alt="" width="1" height="1"></td><td'.$cols_to_extract[0]['WrDT'].' class="data">'.$tree[$x][0].'</td><td><img src="images/blank.gif" alt="" width="20" height="1"></td><td class="data">'.$tree[$x][1].'</td><td><img src="images/blank.gif" alt="" width="30" height="1"></td></tr>'."\n";
	$grows++;

	if ($x > 0)
	{
		$tot_sum += $tree[$x][1];
		$tot_min = ($tree[$x][1] < $tot_min) ? $tree[$x][1] : $tot_min;
		$tot_max = ($tree[$x][1] > $tot_max) ? $tree[$x][1] : $tot_max;
	}
	else
	{
		$tot_sum = $tree[$x][1];
		$tot_min = $tree[$x][1];
		$tot_max = $tree[$x][1];
	}

	if ($stats[$tree[$x][0]]) $stats[$tree[$x][0]] += $tree[$x][1];
	else $stats[$tree[$x][0]] = $tree[$x][1];
	if ($tree[$x][2] != $tree[$x+1][2])
	{
		$filler_height = $chart_height - (($cellpadding + $pixel_spacer)*$grows);
		
		if (($filler_height > 0) && ($flag_groupcharts)) 
			$html .= '<tr><td colspan="7"><img src="images/blank.gif" alt="" width="1" height="'.$filler_height.'"></td></tr>';
		else 
			$html .= '<tr><td colspan="7"><img src="images/blank.gif" alt="" width="1" height="1"></td></tr>';
		$html .= '<tr><td colspan="8"><img src="images/blank.gif" alt="" width="1" height="5"></td></tr>';

		$html = str_replace("!ROWSPAN!",($grows+1+$extra_row),$html);
		$html = str_replace("!CHART!","&nbsp;",$html);

		$extra_row = 0;
		$mlabels = '';
		$mdata = '';
	}
}

if ($valid_sum || $valid_ave || $valid_min || $valid_max )
{
	$html .= '<tr><td colspan="3"><img src="images/blank.gif" alt="" width="1" height="1"></td><td align="right" colspan="4"><hr class="divider"></td></tr>';
	if ($valid_sum) $html .= '<tr><td colspan="3"><img src="images/blank.gif" alt="" width="1" height="1"></td><td align="right" colspan="2"><b>Sum:</b>&nbsp;</td><td colspan="2">'.$tot_sum.'</td></tr>';
	if ($valid_ave) $html .= '<tr><td colspan="3"><img src="images/blank.gif" alt="" width="1" height="1"></td><td align="right" colspan="2"><b>Ave:</b>&nbsp;</td><td colspan="2">'.($tot_sum / $grows).'</td></tr>';
	if ($valid_min) $html .= '<tr><td colspan="3"><img src="images/blank.gif" alt="" width="1" height="1"></td><td align="right" colspan="2"><b>Min:</b>&nbsp;</td><td colspan="2">'.$tot_min.'</td></tr>';
	if ($valid_max) $html .= '<tr><td colspan="3"><img src="images/blank.gif" alt="" width="1" height="1"></td><td align="right" colspan="2"><b>Max:</b>&nbsp;</td><td colspan="2">'.$tot_max.'</td></tr>';
}
$html .= '</table>';

if ($flag_showhead)
{
	foreach ($stats as $key => $val)
	{
		if ($mstartflag)
		{
			$labels .= ',,,'.$key;
			$data .= ',,,'.$val;
		}
		else
		{
			$labels = $key;
			$data = $val;
			$mstartflag = true;
		}
	}
	$query = "INSERT INTO ".$conf_tmptable." (ckeys,cvals,copts,qry,xmlconf,timestamp) VALUES ('".(str_replace("'","''",$labels))."','".$data."','".$options."','".$old_query."','".$top_config."','".$start_time."')";
	if(!$conf_conn->Query($query))
	{
		throw_reporterror(5);
	}
	$lid = $conf_conn->LastInsertID();
	$url = 'chart_makeXML.php?lid='.$lid."&sessid=".$sessid;
	$link = '<a href="javascript:chartmod.lid.value='.$lid.';chartmod.which.value=\'TOP\';chartmod.submit();">';
}
?>
<table border="0" cellspacing="0" cellpadding="0">
<tr>
	<td align="left">
<?php
if ($url)
{
	if ($flag_edit)
	{
		if (strpos($top_config,'<Border value="1"/>')) print '<table border="0" cellpadding="0" cellspacing="0"><tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td>'.$link.'<img src="'.$url.'" border="0" alt=""></a></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr><tr><td></td><td><br /><br /><span class="header">Result Data<br /></span></td></tr><tr><td></td><td><hr class="divider"></td></tr></table>';
		else print '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td><br />'.$link.'<img src="'.$url.'" border="0" alt=""></a></td></tr><tr><td></td><td><br /><br /><span class="header">Result Data<br /></span></td></tr><tr><td></td><td><hr class="divider"></td></tr></table>'."\n"."\n";
	}
	else
	{
		if (strpos($top_config,'<Border value="1"/>')) print '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr><tr><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td><td><img src="'.$url.'" border="0" alt=""></td><td bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/space.gif" width="1" height="1" alt="" border="0"></td></tr></table></td></tr><tr><td></td><td><br /><br /><span class="header">Result Data<br /></span></td></tr><tr><td></td><td><hr class="divider"></td></tr></table>';
		else print '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td><br /><img src="'.$url.'" border="0" alt=""></td></tr><tr><td></td><td><br /><br /><span class="header">Result Data<br /></span></td></tr><tr><td></td><td><hr class="divider"></td></tr></table>'."\n"."\n";
	}
}
else echo '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="83"><img src="images/blank.gif" alt="" width="'.$RESULT_INDENT.'" height="1"></td><td width="100%"><br /><br /><span class="header">Result Data<br /></span></td></tr><tr><td></td><td width="100%"><hr class="divider"></td></tr></table>';
print $html;
?>
	</td>
</tr>
</table>
<button style="margin:1%" onclick="var value_h2 = $('.title').text();
				 var datas = $('.data');
				 var arr = [].slice.call(datas);
				 var content_text='';
				 var intermediate_step =''; 

				 for (var c = 0, m = arr.length; c < m; c++) {
				 	  if (c%2==0){
				 	  	 intermediate_step = content_text.substring(0, content_text.length-1);

		            	 content_text = intermediate_step + String.fromCharCode(13) + String.fromCharCode(10);
				 	  }

				 	  value = String.fromCharCode(34) + arr[c].innerText + String.fromCharCode(34);

				 	  if (c<m-1)
				 	  	content_text += value + ',';
				 	  else
				 	  	content_text += value;
		         }

		         if(!content_text){
		         	alert('Display the table at least one time');
		     	 }
		     	 else{
		     	 	 var full_content = content_text;
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
<input type="hidden" name="pageid" value="<?php echo $this_template;?>">
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


