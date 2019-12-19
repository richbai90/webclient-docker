<?php
# Pull in required includes, functions & settings
include_once('rpt_incl_config.php');


//-- dump all request vars out into global space - function exists in swphpdll.php
swphpGlobaliseRequestVars();


//-- nwj - april 2015 - need to make a temp session
swCreateTemporarySession($sessid);
	
if ($lid)
{
	
	$url = 'chart_makeXML.php?lid='.$lid."&sessid=".$sessid;
	//if (!$conf_conn = new RptMK2DBConn($conf_type)) 
	if (!$conf_conn = new RptMK2DBConn($conf_db, $conf_user, $conf_pass)) 
	{
		print "Config Connection Failed<br />";
	}

	$query = "SELECT qry,xmlconf FROM tmp_graph_args WHERE id=".$lid;
	if (!$conf_conn->Query($query)) die("Query failed : " . htmlentities($conf_conn->error));
	$conf_conn->FetchRow();
	$qry = $conf_conn->row[0];
	
	if (!$type)
	{
		$p = xml_parser_create();
		xml_parse_into_struct($p, $conf_conn->row[1], $attribs, $index);
		xml_parser_free($p);
		$chart = 0;
		$sizex = $attribs[$index['SIZEX'][$chart]]['attributes']['VALUE'];
		$sizey = $attribs[$index['SIZEY'][$chart]]['attributes']['VALUE'];
		$plotx = $attribs[$index['PLOTX'][$chart]]['attributes']['VALUE'];
		$ploty = $attribs[$index['PLOTY'][$chart]]['attributes']['VALUE'];
		$margx = $attribs[$index['MARGINLEFT'][$chart]]['attributes']['VALUE'];
		$margy = $attribs[$index['MARGINTOP'][$chart]]['attributes']['VALUE'];
		$chartx = $attribs[$index['CHARTOFFSETX'][$chart]]['attributes']['VALUE'];
		$charty = $attribs[$index['CHARTOFFSETY'][$chart]]['attributes']['VALUE'];
		$radius = $attribs[$index['PIESCALINGFACTOR'][$chart]]['attributes']['VALUE'];
		$title = $attribs[$index['TITLE'][$chart]]['attributes']['VALUE'];
		$xtitle = $attribs[$index['XTITLE'][$chart]]['attributes']['VALUE'];
		$ytitle = $attribs[$index['YTITLE'][$chart]]['attributes']['VALUE'];
		$labelangle = $attribs[$index['LABELANGLE'][$chart]]['attributes']['VALUE'];
		$linecolor = str_replace("#","",$attribs[$index['LINECOLOR'][$chart]]['attributes']['VALUE']);
		$textcolor = str_replace("#","",$attribs[$index['TEXTCOLOR'][$chart]]['attributes']['VALUE']);
		$vlinevisible = $attribs[$index['VLINEVISIBLE'][$chart]]['attributes']['VALUE'];
		$hlinevisible = $attribs[$index['HLINEVISIBLE'][$chart]]['attributes']['VALUE'];
		$vlinecolor = str_replace("#","",$attribs[$index['VLINECOLOR'][$chart]]['attributes']['VALUE']);
		$hlinecolor = str_replace("#","",$attribs[$index['HLINECOLOR'][$chart]]['attributes']['VALUE']);
		$edgevisible = $attribs[$index['EDGEVISIBLE'][$chart]]['attributes']['VALUE'];
		$edgecolor = str_replace("#","",$attribs[$index['EDGECOLOR'][$chart]]['attributes']['VALUE']);
		$swap = $attribs[$index['SWAPXY'][$chart]]['attributes']['VALUE'];
		$depth = $attribs[$index['DEPTH'][$chart]]['attributes']['VALUE'];
		$perspective = $attribs[$index['PERSPECTIVE'][$chart]]['attributes']['VALUE'];
		$translucency = $attribs[$index['TRANSPARENCY'][$chart]]['attributes']['VALUE'];
		$border = $attribs[$index['BORDER'][$chart]]['attributes']['VALUE'];
		$leg = $attribs[$index['LEGEND'][$chart]]['attributes']['VALUE'];
		$legx = $attribs[$index['LEGENDX'][$chart]]['attributes']['VALUE'];
		$legy = $attribs[$index['LEGENDY'][$chart]]['attributes']['VALUE'];
		$disca = $attribs[$index['DISCABOVE'][$chart]]['attributes']['VALUE'];
		$discb = $attribs[$index['DISCBELOW'][$chart]]['attributes']['VALUE'];
		$trans = $attribs[$index['TRANSPOSE'][$chart]]['attributes']['VALUE'];
		$type = $attribs[$index['CHARTTYPE'][$chart]]['attributes']['VALUE'];
		$max = $attribs[$index['MAXRECORDS'][$chart]]['attributes']['VALUE'];
		$bkmode = $attribs[$index['BACKGROUNDTYPE'][$chart]]['attributes']['VALUE'];
		$bkcolor = str_replace("#","",$attribs[$index['BACKGROUNDCOLOR'][$chart]]['attributes']['VALUE']);
		$bkgrad = $attribs[$index['BACKGROUNDGRADIENT'][$chart]]['attributes']['VALUE'];
		$filltype = $attribs[$index['FILLTYPE'][$chart]]['attributes']['VALUE'];
		$elementcolor = str_replace("#","",$attribs[$index['ELEMENTCOLOR'][$chart]]['attributes']['VALUE']);
		$multidepth = $attribs[$index['MULTIDEPTH'][$chart]]['attributes']['VALUE'];
		$sort = $attribs[$index['SORTMETHOD'][$chart]]['attributes']['VALUE'];
		$explode = $attribs[$index['EXPLODEPIE'][$chart]]['attributes']['VALUE'];
		$sector = $attribs[$index['EXPLODESECTOR'][$chart]]['attributes']['VALUE'];
		$distance = $attribs[$index['EXPLODEDISTANCE'][$chart]]['attributes']['VALUE'];
		$start = $attribs[$index['STARTANGLE'][$chart]]['attributes']['VALUE'];
		}

	if (($sizex==='') || (!isset($sizex))) $sizex = 600;
	if (($sizey==='') || (!isset($sizey))) $sizey = 400;
	if (($margx==='') || (!isset($margx))) $margx = 40;
	if (($margy==='') || (!isset($margy))) $margy = 30;
	if (($plotx==='') || (!isset($plotx))) $plotx = (INT)($sizex - ($margx*2));
	if (($ploty==='') || (!isset($ploty))) $ploty = (INT)($sizey - ($margy*2));
	if (($chartx==='') || (!isset($chartx))) $chartx = 0;
	if (($charty==='') || (!isset($charty))) $charty = 0;
	if (($radius==='') || (!isset($radius))) $radius = 50;
	if (($depth==='') || (!isset($depth))) $depth = 10;
	if (($sector==='') || (!isset($sector))) $sector = 0;
	if (($distance==='') || (!isset($distance))) $distance = 30;
	if (($start==='') || (!isset($start))) $start = 300;
	if (($perspective==='') || (!isset($perspective))) $perspective = 45;
	if (!$labelangle) $labelangle = 0;
	if (!$legx) $legx = 0;
	if (!$legy) $legy = 0;

	$xml = '<Config><Graphs><Graph name="'.$which.'">';
	$xml .= '<SizeX value="'.$sizex.'"/>';
	$xml .= '<SizeY value="'.$sizey.'"/>';
	$xml .= '<PlotX value="'.$plotx.'"/>';
	$xml .= '<PlotY value="'.$ploty.'"/>';
	$xml .= '<MarginLeft value="'.$margx.'"/>';
	$xml .= '<MarginTop value="'.$margy.'"/>';
	$xml .= '<ChartOffsetX value="'.$chartx.'"/>';
	$xml .= '<ChartOffsetY value="'.$charty.'"/>';
	$xml .= '<PieScalingFactor value="'.$radius.'"/>';
	$xml .= '<Title value="'.$title.'"/>';
	$xml .= '<XTitle value="'.$xtitle.'"/>';
	$xml .= '<YTitle value="'.$ytitle.'"/>';
	$xml .= '<LabelAngle value="'.$labelangle.'"/>';
	$xml .= '<LineColor value="#'.$linecolor.'"/>';	// Axis Colour
	$xml .= '<TextColor value="#'.$textcolor.'"/>';
	$xml .= '<VLineVisible value="'.$vlinevisible.'"/>';
	$xml .= '<HLineVisible value="'.$hlinevisible.'"/>';
	$xml .= '<VLineColor value="'.$vlinecolor.'"/>';
	$xml .= '<HLineColor value="'.$hlinecolor.'"/>';
	$xml .= '<EdgeVisible value="'.$edgevisible.'"/>';
	$xml .= '<EdgeColor value="'.$edgecolor.'"/>';
	$xml .= '<SwapXY value="'.$swap.'"/>';
	$xml .= '<Depth value="'.$depth.'"/>';
	$xml .= '<Perspective value="'.$perspective.'"/>';
	$xml .= '<Transparency value="'.$translucency.'"/>';
	$xml .= '<Border value="'.$border.'"/>';
	$xml .= '<Legend value="'.$leg.'"/>';
	$xml .= '<LegendX value="'.$legx.'"/>';
	$xml .= '<LegendY value="'.$legy.'"/>';	
	$xml .= '<DiscAbove value="'.$disca.'"/>';
	$xml .= '<DiscBelow value="'.$discb.'"/>';
	$xml .= '<Transpose value="'.$trans.'"/>';
	$xml .= '<ChartType value="'.$type.'"/>';
	$xml .= '<MaxRecords value="'.$max.'"/>';
	$xml .= '<BackgroundType value="'.$bkmode.'"/>';
	$xml .= '<BackgroundColor value="#'.$bkcolor.'"/>';
	$xml .= '<BackgroundGradient value="'.$bkgrad.'"/>';
	$xml .= '<FillType value="'.$filltype.'"/>';
	$xml .= '<ElementColor value="#'.$elementcolor.'"/>';
	$xml .= '<MultiDepth value="'.$multidepth.'"/>';
	$xml .= '<SortMethod value="'.$sort.'"/>';
	$xml .= '<ExplodePie value="'.$explode.'"/>';
	$xml .= '<ExplodeSector value="'.$sector.'"/>';
	$xml .= '<ExplodeDistance value="'.$distance.'"/>';
	$xml .= '<StartAngle value="'.$start.'"/>';
	$xml .= '</Graph></Graphs></Config>';
	$query = "UPDATE tmp_graph_args SET xmlconf='$xml' WHERE id=".$lid;
	if (!$conf_conn->Query($query)) die("Query failed : " . htmlentities($conf_conn->error));

	$conf_conn->Close();
}
//else $url = 'chart_make.php?keys='.$labels.'&vals='.$values.'&opts='.$options.'&sizex='.$sizex.'&sizey='.$sizey.'&type='.$type.'&plotx='.$plotx.'&ploty='.$ploty.'&margx='.$margx.'&margy='.$margy.'&depth='.$depth.'&sort='.$sort.'&title='.$title.'&trans='.$trans.'&neg='.$neg.'&leg='.$leg.'&legx='.$legx.'&legy='.$legy.'&swap='.$swap.'&chartx='.$chartx.'&charty='.$charty;

if ($title) $url .= '&title='.$title;
$hidden = "";

include_once('swnocachepage.php');
?>
<html>
<head>
<title>Chart Constructor</title>
<LINK REL=StyleSheet HREF="styles/mainstyles.php" TYPE="text/css">
<script>
<!--
function chartbuilder(labels, options, values, config, qid, which){
//	document.chartmod.title.value = title;
	document.chartmod.which.value = which;
	document.chartmod.labels.value = labels;
	document.chartmod.options.value = options;
	document.chartmod.values.value = values;
	document.chartmod.qid.value = qid;
	document.chartmod.action = "chart_edit.php?" + config;
	document.chartmod.submit();
	}
//-->
</script>
<script language="javascript">
<!--
function getpopupvalue(box,col){
	var url = 'colour_picker.php?tobox=' + box;
	if (col) url = url + "&curcol=" + col;
	window.open(url,'','width=410,height=150,scrollbars=no,resizable=yes,status=0');
	}
//-->
</script>
	<script>
	<!--
	var type='<?php echo $type?>';
	
	// Because Pie and Bar/Line charts have very different size/shape configs, this javascript attempts to
	// minimise the dramatic effects of switch to pie charts with bar/line settings or vice versa.
	function newchart()
	{
		document.update.submit();
	}

	// This funtion makes the up/down controls on the numeric form elements function. Usability.
	function scroll(obj,num){
		var val = parseInt(obj.value);
		obj.value = val + num;
		}
	function save(){
<?php
if ($surveyid) print 		"document.update.action='".$pageid."';\n";
else print 		"document.update.action='".$pageid."?".$qry."';";
?>
		document.update.submit();
		}
	//-->
	</script>
	<style>     
	input {font-family: "Verdana"; font-size : 12;}
	select {font-family: "Verdana"; font-size : 12;}
	.smalltext{font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;font-size : 10;}
	.maintext{font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;font-size : 12; font-weight: bold;}
	</style>
</head>
<body ackground="images/gradient.gif" topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
	<td align="right" bgcolor="#dee8fe"><br /><br /><img src="images/html_reports.gif" width="160" height="30" alt="" border="0" hspace="0" vspace="0"></td>
</tr>
</table>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
  <tr> 
    <td width="22" bgcolor="#ccd4ee"><img src="images/space.gif" width="22" height="25"></td>
    <td bgcolor="#ccd4ee" align="left" valign="middle" class="company"><b>Report</b> : <span class="surveyname">Chart Constructor</span></td>
  </tr>
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
  <tr><td>&nbsp;</td><td valign="top" align="right"><img src="images/blank.gif" border="0" alt="" width="5" height="6">&nbsp;&nbsp;&nbsp;</td></tr>
</table>
<table border="0" cellspacing="0" cellpadding="0">
<form action="chart_edit.php" method="post" name="update">
<?php
# This code block has been added specifically to facilitate the preservation of temporary filters applied to the filter
# lists so that charts can be edited and saved without having to re-enter filters.
$filters = '';
foreach($_REQUEST as $key => $val)
{
	if (substr($key,0,5)=="filt_")
	{
		$filters .= '<input type="hidden" name="'.$key.'" value="'.$val.'">';
	}
}
print $filters;
?>
<input type="hidden" name="labels" value="<?php echo $labels?>">
<input type="hidden" name="options" value="<?php echo $options?>">
<input type="hidden" name="values" value="<?php echo $values?>">
<input type="hidden" name="which" value="<?php echo $which?>">
<input type="hidden" name="surveyid" value="<?php echo $surveyid?>">
<input type="hidden" name="REPORTID" value="<?php echo $REPORTID?>">
<input type="hidden" name="qid" value="<?php echo $qid?>">
<input type="hidden" name="lid" value="<?php echo $lid?>">
<input type="hidden" name="sessid" value="<?php echo $sessid;?>">
<input type="hidden" name="qry" value="<?php echo $qry?>">
<input type="hidden" name="pageid" value="<?php echo $pageid?>">
<tr>
	<td><img src="images/blank.gif" height="1" width="8"></td>
	<td colspan="5" align="left">
		<table border="0" cellspacing="0" cellpadding="0">
		<tr><td colspan="3" bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td></tr>
		<tr>
			<td bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td>
			<td bgcolor="#FFFFFF">
				<table border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="45"></td>
					<td align="left" class="header2">Chart Type</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="4" height="1"></td><td class="header2" rowspan="2" bgcolor="#dee8fe"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td><td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
					<td align="left" class="header2">Sort Order</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="4" height="1"></td><td class="header2" rowspan="2" bgcolor="#dee8fe"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td><td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
					<td align="left" class="header2" colspan="3">Canvas Size</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td><td class="header2" rowspan="2" bgcolor="#dee8fe"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td><td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
<?php
if (($type!="Pie") && ($type!="3D Pie")){
?>
					<td align="left" class="header2" colspan="3">Chart Size</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td><td class="header2" rowspan="2" bgcolor="#dee8fe"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td><td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
					<td align="left" class="header2" colspan="4">Top &amp; Left Margins</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
<?php
} else {
?>
					<td align="left" class="header2" colspan="3">Centre Offset X &amp; Y</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td><td class="header2" rowspan="2" bgcolor="#dee8fe"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td><td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
					<td align="left" class="header2">Scaling</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
<?php
} if (($type=="3D Pie") || ($type=="3D Bar") || ($type=="3D Line") || ($type=="3D Area")){
?>
					<td align="left" class="header2">Depth</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
<?php if ($type=="3D Pie") { ?>
					<td align="left" class="header2">Perspective</td>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="5" height="1"></td>
<?php } ?>
<?php } ?>
				</tr>
				<tr>
					<td align="left">
						<select name="type" onchange="javascript:newchart();" class="selectstyle">
							<?php
							if (($type == 'Multi Bar') || ($type == 'Multi Area') || ($type == 'Multi Stack') || ($type == 'Multi Line')) {
								if ($type=="Multi Bar") print '<option value="Multi Bar" selected>Multi Arranged Bar</option>'; else print '<option value="Multi Bar">Multi Arranged Bar</option>';
								if ($type=="Multi Area") print '<option value="Multi Area" selected>Multi Area</option>'; else print '<option value="Multi Area">Multi Area</option>';
								if ($type=="Multi Stack") print '<option value="Multi Stack" selected>Multi Stacked Bar</option>'; else print '<option value="Multi Stack">Multi Stacked Bar</option>';
								if ($type=="Multi Line") print '<option value="Multi Line" selected>Multi Line</option>'; else print '<option value="Multi Line">Multi Line</option>';
								}
							else {
								if ($type=="Pie") print '<option value="Pie" selected>Pie</option>'; else print '<option value="Pie">Pie</option>';
								if ($type=="3D Pie") print '<option value="3D Pie" selected>3D Pie</option>'; else print '<option value="3D Pie">3D Pie</option>';
								if ($type=="Area") print '<option value="Area" selected>Area</option>'; else print '<option value="Area">Area</option>';
								if ($type=="3D Area") print '<option value="3D Area" selected>3D Area</option>'; else print '<option value="3D Area">3D Area</option>';
								if ($type=="Line") print '<option value="Line" selected>Line</option>'; else print '<option value="Line">Line</option>';
								if ($type=="3D Line") print '<option value="3D Line" selected>3D Line</option>'; else print '<option value="3D Line">3D Line</option>';
								if ($type=="Bar") print '<option value="Bar" selected>Bar</option>'; else print '<option value="Bar">Bar</option>';
								if ($type=="3D Bar") print '<option value="3D Bar" selected>3D Bar</option>'; else print '<option value="3D Bar">3D Bar</option>';
								}
							?>
						</select>
					</td>
					<td align="left">
						<select name="sort" class="selectstyle">
							<?php
							if (($type == 'Multi Bar') || ($type == 'Multi Area') || ($type == 'Multi Stack')) {
								if ($sort=="Default") print '<option value="Default" selected>Default Values</option>'; else print '<option value="Default" selected>Default Values</option>';
								if ($sort=="Reverse") print '<option value="Reverse" selected>Reverse Values</option>'; else print '<option value="Reverse">Reverse Values</option>';
								if ($sort=="AlphabeticAsc") print '<option value="AlphabeticAsc" selected>Label Ascending</option>'; else print '<option value="AlphabeticAsc">Label Ascending</option>';
								if ($sort=="AlphabeticDesc") print '<option value="AlphabeticDesc" selected>Label Descending</option>'; else print '<option value="AlphabeticDesc">Label Descending</option>';
								}
							else {
								if ($sort=="Default") print '<option value="Default" selected>Default Values</option>'; else print '<option value="Default" selected>Default Values</option>';
								if ($sort=="Reverse") print '<option value="Reverse" selected>Reverse Values</option>'; else print '<option value="Reverse">Reverse Values</option>';
								if ($sort=="ValueAsc") print '<option value="ValueAsc" selected>Values Ascending</option>'; else print '<option value="ValueAsc">Values Ascending</option>';
								if ($sort=="ValueDesc") print '<option value="ValueDesc" selected>Values Descending</option>'; else print '<option value="ValueDesc">Values Descending</option>';
								if ($sort=="AlphabeticAsc") print '<option value="AlphabeticAsc" selected>Label Ascending</option>'; else print '<option value="AlphabeticAsc">Label Ascending</option>';
								if ($sort=="AlphabeticDesc") print '<option value="AlphabeticDesc" selected>Label Descending</option>'; else print '<option value="AlphabeticDesc">Label Descending</option>';
								if ($sort=="Staggered") print '<option value="Staggered" selected>Staggered Values</option>'; else print '<option value="Staggered">Staggered Values</option>';
								}
							?>
						</select>
					</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="sizex" size="4" maxlength="4" value="<?php echo $sizex?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.sizex,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.sizex,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
					<td align="center" class="header2">x</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="sizey" size="4" maxlength="4" value="<?php echo $sizey?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.sizey,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.sizey,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
<?php
if (($type!="Pie") && ($type!="3D Pie")){
?>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="plotx" size="4" maxlength="4" value="<?php echo $plotx?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.plotx,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.plotx,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
					<td align="center" class="header2">x</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="ploty" size="4" maxlength="4" value="<?php echo $ploty?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.ploty,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.ploty,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
					<td align="center" class="header2">T</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="margy" size="4" maxlength="4" value="<?php echo $margy?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.margy,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+5" border="0"></a><br /><a href="javascript:scroll(document.update.margy,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-5" border="0"></a><br /></td></tr></table></td>
					<td align="center" class="header2">&nbsp;L</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="margx" size="4" maxlength="4" value="<?php echo $margx?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.margx,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+5" border="0"></a><br /><a href="javascript:scroll(document.update.margx,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-5" border="0"></a><br /></td></tr></table></td>
<?php
} else {
?>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="chartx" size="4" maxlength="4" value="<?php echo $chartx?>"></td><td><a href="javascript:scroll(document.update.chartx,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+5" border="0"></a><br /><a href="javascript:scroll(document.update.chartx,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-5" border="0"><br /></td></tr></table></td>
					<td align="center" class="header2">x</td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="charty" size="4" maxlength="4" value="<?php echo $charty?>"></td><td><a href="javascript:scroll(document.update.charty,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+5" border="0"></a><br /><a href="javascript:scroll(document.update.charty,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-5" border="0"><br /></td></tr></table></td>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="radius" size="4" maxlength="4" value="<?php echo $radius?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.radius,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.radius,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
<?php
} if (($type=="3D Pie") || ($type=="3D Bar") || ($type=="3D Line") || ($type=="3D Area")){
?>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="depth" size="4" maxlength="4" value="<?php echo $depth?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.depth,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+5" border="0"></a><br /><a href="javascript:scroll(document.update.depth,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-5" border="0"></a><br /></td></tr></table></td>
<?php if ($type=="3D Pie") { ?>
					<td align="left"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="perspective" size="4" maxlength="4" value="<?php echo $perspective?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.perspective,10);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.perspective,-10);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
<?php } ?>
<?php } ?>
				</tr>
				</table>
			</td>
		<td bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td>
		</tr>
		<tr><td colspan="3" bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td></tr>
		<tr>
			<td bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td>
			<td bgcolor="#FFFFFF" align="left">
				<table border="0" cellspacing="0" cellpadding="0">
				<tr>
<?php if (($type!="Pie") && ($type!="3D Pie")){ ?>
					<td align="left" class="header2">&nbsp;Swap XY&nbsp;</td>
					<td align="left">
						<select name="swap" class="selectstyle">
						<option value="">Default</option>
						<?php
						if ($swap) print '<option value="1" selected>Swap XY</option>';
						else print '<option value="1">Swap XY</option>';
						?>
						</select>
					</td>
					<td align="left" class="header2"></td>
<?php }  if (($type == 'Multi Bar') || ($type == 'Multi Area') || ($type == 'Multi Stack')) {
					print '<td align="left" class="header2">&nbsp;&nbsp;&nbsp;Transpose&nbsp;</td>';
					if ($trans) print '<td align="left"><input type="checkbox" value="1" checked name="trans"></td>';
					else print '<td align="left"><input type="checkbox" value="1" name="trans"></td>'; 
 } ?>
					<td align="left" class="header2">&nbsp;&nbsp;&nbsp;Main&nbsp;Title&nbsp;</td>
					<td align="left"><input type="text" name="title" size="11" value="<?php echo $title?>" class="littletextarea"></td>
<?php if (($type!="Pie") && ($type!="3D Pie")){ ?>
					<td align="left" class="header2">&nbsp;&nbsp;&nbsp;X&nbsp;Axis&nbsp;Title&nbsp;</td>
					<td align="left"><input type="text" name="xtitle" size="10" value="<?php echo $xtitle?>" class="littletextarea"></td>
					<td align="left" class="header2">&nbsp;&nbsp;&nbsp;Y&nbsp;Axis&nbsp;Title&nbsp;</td>
					<td align="left"><input type="text" name="ytitle" size="10" value="<?php echo $ytitle?>" class="littletextarea">&nbsp;</td>
<?php } 
	if ($type == "3D Pie") { 
					print '<td align="left" class="header2">&nbsp;&nbsp;&nbsp;Multi Depth&nbsp;</td>';
					if ($multidepth) print '<td align="left"><input type="checkbox" value="1" checked name="multidepth"></td>';
					else print '<td align="left"><input type="checkbox" value="1" name="multidepth"></td>';
 } if (($type=="Pie") || ($type=="3D Pie")){
					print '<td align="left" class="header2">&nbsp;&nbsp;&nbsp;Explode Pie&nbsp;</td>';
					if ($explode) print '<td align="left"><input type="checkbox" value="1" checked name="explode"></td>';
					else print '<td align="left"><input type="checkbox" value="1" name="explode"></td>';
					print '<td align="left" class="smallertext">Segment&nbsp;<input type="text" name="sector" size="2" value="'.$sector.'" class="littletextarea"></td>';
					print '<td align="left" class="smallertext">&nbsp;Distance&nbsp;<input type="text" name="distance" size="2" value="'.$distance.'" class="littletextarea"></td>';
					print '<td align="left" class="header2">&nbsp;&nbsp;&nbsp;<b>Start Angle</b>&nbsp;<input type="text" name="start" size="3" value="'.$start.'" class="littletextarea">&nbsp;</td>';
 } ?>
					<td class="header2" rowspan="2"><img src="images/blank.gif" border="0" alt="" width="1" height="25"></td>
				</tr>
				</table>
			</td>
		<td bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td>
		</tr>
		<tr><td colspan="3" bgcolor="#336699"><img src="images/blank.gif" border="0" alt="" width="1" height="1"></td></tr>
		</table>
	</td>
</tr>
<tr>
	<td colspan="6"><img src="images/blank.gif" height="8" width="1"></td>
</tr>
<tr>
	<td><img src="images/blank.gif" height="1" width="8"></td>
	<td colspan="3" bgcolor="#336699"><img src="images/blank.gif" height="1" width="1"></td>
	<td rowspan="3">&nbsp;&nbsp;</td>
	<td valign="top" align="left" rowspan="3"><img src="<?php echo $url?>" border="<?php echo $border?>" alt=""><br /><img src="images/blank.gif" height="1" width="800"><br /></td>
</tr>
<tr>
	<td><img src="images/blank.gif" height="1" width="1"></td>
	<td bgcolor="#336699"><img src="images/blank.gif" height="1" width="1"></td>
	<td valign="top" bgcolor="#ffffff">
		<table border="0" cellspacing="0" cellpadding="0">
		<tr><td colspan="3"><img src="images/blank.gif" height="3" width="1"></td></tr>
<?php if (($type != 'Multi Bar') && ($type != 'Multi Area') && ($type != 'Multi Stack')) { ?>
		<tr>
			<td rowspan="26"><img src="images/blank.gif" height="1" width="5"></td>
			<td class="header2">Fill Type & Colour&nbsp;</td>
			<td rowspan="26"><img src="images/blank.gif" height="1" width="5"></td>
		</tr>
<?php } else { ?>
		<tr>
			<td rowspan="23"><img src="images/blank.gif" height="1" width="5"></td>
			<td class="header2">Fill Type & Colour&nbsp;</td>
			<td rowspan="26"><img src="images/blank.gif" height="1" width="5"></td>
		</tr>
<?php } ?>
		<tr>
			<td>
				<table border="0" cellspacing="0" cellpadding="0">
<?php if (($type != 'Multi Bar') && ($type != 'Multi Area') && ($type != 'Multi Stack')) { ?>
				<tr>
					<td>
						<img src="images/blank.gif" height="1" width="20"><br />
						<select name="filltype" class="selectstyle">
						<?php
						if ($filltype=="Default Palette") print '<option value="Default Palette" selected>Default Palette</option>';
						else print '<option value="Default Palette">Default Palette</option>';
						if ($filltype=="Plain Colour") print '<option value="Plain Colour" selected>One Colour</option>';
						else print '<option value="Plain Colour">One Colour</option>';
						if (($type!="Pie") && ($type!="3D Pie") && ($type!="Line") && ($type!="3D Line")){
							if ($filltype=="Gradient") print '<option value="Gradient" selected>Gradient</option>';
							else print '<option value="Gradient">Gradient</option>';
							}
						?>
						</select>
					</td>
					<td valign"top"><input type="text" name="elementcolor" value="<?php echo $elementcolor?>" size="6" class="littletextarea"></td>
					<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
					<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(1,document.update.elementcolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
				</tr>
<?php } ?>
				<tr>
					<td colspan="4" class="smallertext">
						<table border="0" cellspacing="0" cellpadding="0">
						<?php
						$translucency = $translucency ? '<input type="checkbox" value="1" checked name="translucency">' : '<input type="checkbox" value="1" name="translucency">';
						?>
						<tr>
							<td class="smallertext">&nbsp;&nbsp;</td>
							<td class="smallertext">Transparency</td>
							<td><?php echo $translucency?></td>
						</tr>
						</table>
					</td>
				</tr>
				</table>
			</td>
		</tr>
		<tr><td><img src="images/blank.gif" height="5" width="1"></td></tr><tr><td bgcolor="#dee8fe"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="4" width="1"></td></tr>
		<tr>
			<td class="header2">Background Style&nbsp;</td>
		</tr>
		<tr>
			<td>
				<table border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td>
						<img src="images/blank.gif" height="1" width="20"><br />
						<select name="bkmode" class="selectstyle">
						<option value="Plain Colour">Plain Colour</option>
						<?php
						if ($bkmode=="Gradient") print '<option value="Gradient" selected>Gradient</option>';
						else print '<option value="Gradient">Gradient</option>';
						if ($bkmode=="Transparent") print '<option value="Transparent" selected>Transparent</option>';
						else print '<option value="Transparent">Transparent</option>';
						?>
						</select>
					</td>
					<td valign"top"><input type="text" name="bkcolor" value="<?php echo $bkcolor?>" size="6" class="littletextarea"></td>
					<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
					<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(2,document.update.bkcolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
				</tr>
<?php if ($bkmode=="Gradient") { ?>
				<tr>
					<td colspan="4" class="smallertext">
						&nbsp;&nbsp;Gradient
						<select name="bkgrad" class="selectstyle">
						<option value="1">Gold</option>
						<?php
						if ($bkgrad==2) print '<option value="2" selected>Silver</option>';
						else print '<option value="2">Silver</option>';
						if ($bkgrad==3) print '<option value="3" selected>Red Metal</option>';
						else print '<option value="3">Red Metal</option>';
						if ($bkgrad==4) print '<option value="4" selected>Green Metal</option>';
						else print '<option value="4">Green Metal</option>';
						if ($bkgrad==5) print '<option value="5" selected>Blue Metal</option>';
						else print '<option value="5">Blue Metal</option>';
						?>
						</select>
					</td>
				</tr>
<?php } ?>
				</table>
			</td>
		</tr>
		<tr><td><img src="images/blank.gif" height="5" width="1"></td></tr><tr><td bgcolor="#dee8fe"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="4" width="1"></td></tr>
		<tr>
			<td class="header2">Show Lines&nbsp;</td>
		</tr>
		<tr>
			<td align="left">
				<table border="0" cellspacing="0" cellpadding="0">
				<?php
				$vlinevisible = $vlinevisible ? '<input type="checkbox" value="1" checked name="vlinevisible">' : '<input type="checkbox" value="1" name="vlinevisible">';
				$hlinevisible = $hlinevisible ? '<input type="checkbox" value="1" checked name="hlinevisible">' : '<input type="checkbox" value="1" name="hlinevisible">';
				$edgevisible = $edgevisible ? '<input type="checkbox" value="1" checked name="edgevisible">' : '<input type="checkbox" value="1" name="edgevisible">';
				$border = $border ? '<input type="checkbox" value="1" checked name="border">' : '<input type="checkbox" value="1" name="border">';
if (($type!="Pie") && ($type!="3D Pie")){ ?>
				<tr>
					<td rowspan="3" class="smallertext">&nbsp;&nbsp;</td>
					<td class="smallertext">Horizontal</td>
					<td><?php echo $hlinevisible?></td>
					<td rowspan="2" class="smallertext">&nbsp;&nbsp;&nbsp;</td>
					<td class="smallertext">Border</td>
					<td><?php echo $border?></td>
				</tr>
				<tr>
					<td class="smallertext">Vertical</td>
					<td><?php echo $vlinevisible?></td>
					<td class="smallertext">Edge</td>
					<td><?php echo $edgevisible?></td>
				</tr>
<?php } else { ?>
				<tr>
					<td rowspan="2" class="smallertext">&nbsp;&nbsp;</td>
					<td class="smallertext">Border</td>
					<td><?php echo $border?></td>
					<td class="smallertext">&nbsp;&nbsp;&nbsp;</td>
					<td class="smallertext">Edge</td>
					<td><?php echo $edgevisible?></td>
				</tr>
<?php } ?>
				<tr>
					<td colspan="5" align="left">
						<table border="0" cellspacing="0" cellpadding="0">
						<tr>
							<td valign"middle" class="smallertext">Edge Colour&nbsp;</td>
							<td valign"middle"><input type="text" name="edgecolor" value="<?php echo $edgecolor?>" size="6" class="littletextarea"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(5,document.update.edgecolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
						</tr>
<?php if (($type!="Pie") && ($type!="3D Pie")) { ?>
						<tr>
							<td valign"middle" class="smallertext">Horiz Line Colour&nbsp;</td>
							<td valign"middle"><input type="text" name="hlinecolor" value="<?php echo $hlinecolor?>" size="6" class="littletextarea"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(6,document.update.hlinecolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
						</tr>
						<tr>
							<td valign"middle" class="smallertext">Vert Line Colour&nbsp;</td>
							<td valign"middle"><input type="text" name="vlinecolor" value="<?php echo $vlinecolor?>" size="6" class="littletextarea"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(7,document.update.vlinecolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
						</tr>
						<tr>
							<td valign"middle" class="smallertext">Axis Colour&nbsp;</td>
							<td valign"middle"><input type="text" name="linecolor" value="<?php echo $linecolor?>" size="6" class="littletextarea"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(3,document.update.linecolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
						</tr>
<?php } ?>
						<tr>
							<td valign"middle" class="smallertext">Text Colour&nbsp;</td>
							<td valign"middle"><input type="text" name="textcolor" value="<?php echo $textcolor?>" size="6" class="littletextarea"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="2"></td>
							<td valign"middle"><img src="images/blank.gif" height="1" width="1"><br /><a href="javascript:getpopupvalue(4,document.update.textcolor.value);"><img src="images/colpick.gif" width="13" height="13" border="0" alt="Pick Colour"></a></td>
						</tr>
						</table>
					</td>
				</tr>
				</table>
			</td>
		</tr>
		<tr><td><img src="images/blank.gif" height="5" width="1"></td></tr><tr><td bgcolor="#dee8fe"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="4" width="1"></td></tr>
		<tr>
			<td class="header2">Labelling&nbsp;</td>
		</tr>
		<tr>
			<td align="left">
				<table border="0" cellspacing="0" cellpadding="0">
<?php if (($type!="Pie") && ($type!="3D Pie")){ ?>
				<tr>
					<td class="smallertext">&nbsp;&nbsp;</td>
					<td class="smallertext">Label Angle&nbsp;</td>
					<td><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="labelangle" size="4" maxlength="4" value="<?php echo $labelangle?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.labelangle,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.labelangle,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
				</tr>
<?php } ?>
<?php if (($type!="Bar") && ($type!="3D Bar") && ($type!="Line") && ($type!="3D Line") && ($type!="Area") && ($type!="3D Area")){ ?>
				<tr>
					<td rowspan="4" class="smallertext">&nbsp;&nbsp;</td>
					<td class="smallertext">Legend&nbsp;</td>
					<td>
						<table border="0" cellspacing="0" cellpadding="1"><tr><td>
						<select name="leg" class="selectstyle">
						<option value="1">Show</option>
						<?php
						if ($leg) print '<option value="">Hide</option>';
						else print '<option value="" selected>Hide</option>';
						?>
						</select>
						</td></tr></table>
					</td>
				</tr>
				<tr>
					<td colspan="2"><img src="images/blank.gif" height="3" width="1"></td>
				</tr>
				<tr>
					<td colspan="2" align="left" class="smallertext">
						Legend Coordinates
					</td>
				</tr>
				<tr>
					<td colspan="2" align="left">
						<table border="0" cellspacing="0" cellpadding="0">
						<tr>
							<td valign"middle"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="legx" size="4" maxlength="4" value="<?php echo $legx?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.legx,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.legx,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
							<td class="header2">x</td>
							<td valign"middle"><table border="0" cellspacing="0" cellpadding="1"><tr><td><input type="text" name="legy" size="4" maxlength="4" value="<?php echo $legy?>" class="littletextarea"></td><td><a href="javascript:scroll(document.update.legy,5);"><img src="images/button_up_10px.gif" width="16" height="10" alt="+10" border="0"></a><br /><a href="javascript:scroll(document.update.legy,-5);"><img src="images/button_down_10px.gif" width="16" height="10" alt="-10" border="0"></a><br /></td></tr></table></td>
						</tr>
						</table>
					</td>
				</tr>
<?php } ?>
				</table>
			</td>
		</tr>
<?php if (($type != 'Multi Bar') && ($type != 'Multi Area') && ($type != 'Multi Stack')) { ?>
		<tr><td><img src="images/blank.gif" height="5" width="1"></td></tr><tr><td bgcolor="#dee8fe"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="4" width="1"></td></tr>
		<tr>
			<td class="header2">Discard Results&nbsp;</td>
		</tr>
		<tr>
			<td align="left">
				<table border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td class="smallertext">&nbsp;&nbsp;</td>
					<td align="left">
						<table border="0" cellspacing="0" cellpadding="0">
						<tr><td><img src="images/blank.gif" height="3" width="1"></td></tr>
						<tr>
							<td align="left" class="smallertext">Above</td>
							<td align="left" class="smallertext">&nbsp;<input type="text" name="disca" size="4" maxlength="4" value="<?php echo $disca?>" class="littletextarea"></td>
							<td align="left" class="smallertext">&nbsp;&nbsp;Below</td>
							<td align="left" class="smallertext">&nbsp;<input type="text" name="discb" size="4" maxlength="4" value="<?php echo $discb?>" class="littletextarea"></td>
						</tr>
						<tr>
							<td align="right" class="smallertext" colspan="3">Maximum Records</td>
							<td align="left" class="smallertext">&nbsp;<input type="text" name="max" size="4" maxlength="4" value="<?php echo $max?>" class="littletextarea"></td>
						</tr>
						</table>
					</td>
				</tr>
				</table>
			</td>
		</tr>
<?php } ?>
		<tr><td><img src="images/blank.gif" height="5" width="1"></td></tr><tr><td bgcolor="#dee8fe"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="4" width="1"></td></tr>
		<tr><td align="center" class="header2"><br /><input type="submit" name="update" value="Update" class="buttonstyle"><img src="images/blank.gif" height="1" width="5"><input type="button" name="Save" Value="Save" onclick="javascript:save();" class="buttonstyle"><br /><br /><a href="javascript:document.backform.submit();"><b>Back</b></a></td></tr>
		<tr><td colspan="3"><img src="images/blank.gif" height="3" width="1"></td></tr>
		</table>
	</td>
	<td bgcolor="#336699"><img src="images/blank.gif" height="1" width="1"></td>
</tr>
<tr>
	<td><img src="images/blank.gif" height="1" width="1"></td>
	<td colspan="3" bgcolor="#336699"><img src="images/blank.gif" height="1" width="1"></td>
</tr>
<?php echo $hidden?>
</form>
</table>
<center><font color="#ffffff"><?php echo $lid?></font></center>
<form name="backform" action="<?php echo $pageid?>?<?php echo $qry?>" method="post">
<?php echo $filters?>
</form>
</body>
</html>


