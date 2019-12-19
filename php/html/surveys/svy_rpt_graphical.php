<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();

// Page ID for the navigation
$PAGEID = "GR";

# Which survey are we examining. Hard coded for now but ultimately dynamic.
if (!$surveyid)
{
  echo "No such survey!";
  exit;
}

if(!swCreateSessionFromID($sessid))
{
	header("Location: error.php?error=11");
	exit;
}


$TIMESTAMP = time();
$old_query = $GLOBALS[QUERY_STRING];
$options = array();
$colours = array('#FF3333','#33FF33','#6666FF','#FFFF00','#FF66FF','#99FFFF','#FFCC33','#CCCCCC','#CC9999','#339966','#999900','#CC3300','#669999','#663333','#006600','#990099');

$result = new swphpDatabaseQuery('SELECT SurveyName FROM survey_config WHERE SurveyID='.$surveyid,'sw_systemdb');
$surveyConfig = $result->fetch();
if ($surveyConfig)
{
	$rep_tit = $surveyConfig->surveyname;
}
else 
{
	header("Location: error.php?error=7");
	exit;
}


# If qid exists then config data from the chartbuilder has been passed in. This means the first thing we do
# is run a query to add this config to the correct table so that it is taken into account when this page is
# generated as normal.
if ($qid)
{
	$xml = '<Config><Graphs><Graph name="'.$which.'">';
	$xml .= '<SizeX value="'.$sizex.'"/>';
	$xml .= '<SizeY value="'.$sizey.'"/>';
	$xml .= '<PlotX value="'.$plotx.'"/>';
	$xml .= '<PlotY value="'.$ploty.'"/>';
	if (strlen($margx) > 0) $xml .= '<MarginLeft value="'.$margx.'"/>';
	if (strlen($margy) > 0) $xml .= '<MarginTop value="'.$margy.'"/>';
	if (strlen($chartx) > 0) $xml .= '<ChartOffsetX value="'.$chartx.'"/>';
	if (strlen($charty) > 0) $xml .= '<ChartOffsetY value="'.$charty.'"/>';
	if (strlen($radius) > 0) $xml .= '<PieScalingFactor value="'.$radius.'"/>';
	if (strlen($title) > 0) $xml .= '<Title value="'.$title.'"/>';
	if (strlen($xtitle) > 0) $xml .= '<XTitle value="'.$xtitle.'"/>';
	if (strlen($ytitle) > 0) $xml .= '<YTitle value="'.$ytitle.'"/>';
	if (strlen($labelangle) > 0) $xml .= '<LabelAngle value="'.$labelangle.'"/>';
	if (strlen($linecolor) > 0) $xml .= '<LineColor value="#'.$linecolor.'"/>';
	if (strlen($textcolor) > 0) $xml .= '<TextColor value="#'.$textcolor.'"/>';
	if (strlen($vlinevisible) > 0) $xml .= '<VLineVisible value="'.$vlinevisible.'"/>';
	if (strlen($hlinevisible) > 0) $xml .= '<HLineVisible value="'.$hlinevisible.'"/>';
	if (strlen($vlinecolor) > 0) $xml .= '<VLineColor value="#'.$vlinecolor.'"/>';
	if (strlen($hlinecolor) > 0) $xml .= '<HLineColor value="#'.$hlinecolor.'"/>';
	if (strlen($edgevisible) > 0) $xml .= '<EdgeVisible value="'.$edgevisible.'"/>';
	if (strlen($edgecolor) > 0) $xml .= '<EdgeColor value="#'.$edgecolor.'"/>';
	if (strlen($swap) > 0) $xml .= '<SwapXY value="'.$swap.'"/>';
	if (strlen($depth) > 0) $xml .= '<Depth value="'.$depth.'"/>';
	if (strlen($perspective) > 0) $xml .= '<Perspective value="'.$perspective.'"/>';
	if (strlen($translucency) > 0) $xml .= '<Transparency value="'.$translucency.'"/>';
	if (strlen($border) > 0) $xml .= '<Border value="'.$border.'"/>';
	if (strlen($leg) > 0) $xml .= '<Legend value="'.$leg.'"/>';
	if (strlen($legx) > 0) $xml .= '<LegendX value="'.$legx.'"/>';
	if (strlen($legy) > 0) $xml .= '<LegendY value="'.$legy.'"/>';	
	if (strlen($disca) > 0) $xml .= '<DiscAbove value="'.$disca.'"/>';
	if (strlen($discb) > 0) $xml .= '<DiscBelow value="'.$discb.'"/>';
	if (strlen($trans) > 0) $xml .= '<Transpose value="'.$trans.'"/>';
	$xml .= '<ChartType value="'.$type.'"/>';
	if (strlen($max) > 0) $xml .= '<MaxRecords value="'.$max.'"/>';
	if (strlen($bkmode) > 0) $xml .= '<BackgroundType value="'.$bkmode.'"/>';
	if (strlen($bkcolor) > 0) $xml .= '<BackgroundColor value="#'.$bkcolor.'"/>';
	if (strlen($bkgrad) > 0) $xml .= '<BackgroundGradient value="'.$bkgrad.'"/>';
	if (strlen($filltype) > 0) $xml .= '<FillType value="'.$filltype.'"/>';
	if (strlen($elementcolor) > 0) $xml .= '<ElementColor value="#'.$elementcolor.'"/>';
	if (strlen($multidepth) > 0) $xml .= '<MultiDepth value="'.$multidepth.'"/>';
	$xml .= '<SortMethod value="'.$sort.'"/>';
	if (strlen($explode) > 0) $xml .= '<ExplodePie value="'.$explode.'"/>';
	if (strlen($sector) > 0) $xml .= '<ExplodeSector value="'.$sector.'"/>';
	if (strlen($distance) > 0) $xml .= '<ExplodeDistance value="'.$distance.'"/>';
	if (strlen($start) > 0) $xml .= '<StartAngle value="'.$start.'"/>';
	$xml .= '</Graph></Graphs></Config>';
	$query = "UPDATE survey_q SET config='$xml' WHERE qid=$qid AND sid=$surveyid";
	$result = new swphpDatabaseQuery($query,'sw_systemdb');
}

# Select the questions themselves, storing them in the $questions array for now.
$query = "SELECT * FROM survey_q WHERE sid='$surveyid' AND type NOT IN (6,7,8,9,11,20,24,25,26,28) ORDER BY qid";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
$x=0;
$count=0;
while($quest = $result->fetch())
{
	$question[$x][ID] = $quest->qid;
	$question[$x][PID] = $quest->pqid;
	$question[$x][Type] = $quest->type;
	$question[$x][Text] = $quest->qtext;
	if ($quest->type < 41){
		$chart[$count][QNum] = $quest->qid;
		$chart[$count][Question] = $quest->qtext;
		$chart[$count][Type] = $quest->type;

		if (strpos($quest->config,"&type=")) $quest->config = "";

		if (!$quest->config) {
			if ($quest->type < 40) $chart[$count][Config] = '<Config><Graphs><Graph name="TOP"><SizeX value="600"/><SizeY value="300"/><PlotX value="480"/><PlotY value="245"/><MarginLeft value="90"/><MarginTop value="25"/><ChartOffsetX value=""/><ChartOffsetY value=""/><PieScalingFactor value=""/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="0"/><LineColor value="#DFDFDF"/><TextColor value=""/><VLineVisible value="1"/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value="1"/><Depth value="5"/><Perspective value=""/><Transparency value=""/><Border value="1"/><Legend value=""/><LegendX value="0"/><LegendY value="0"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value=""/><ChartType value="3D Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value="Default Palette"/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="ValueDesc"/><ExplodePie value=""/><ExplodeSector value=""/><ExplodeDistance value=""/><StartAngle value=""/></Graph></Graphs></Config>';
			else $chart[$count][Config] = '<Config><Graphs><Graph name="TOP"><SizeX value="600"/><SizeY value="400"/><PlotX value="530"/><PlotY value="320"/><MarginLeft value="40"/><MarginTop value="25"/><ChartOffsetX value="0"/><ChartOffsetY value="0"/><PieScalingFactor value="50"/><Title value=""/><XTitle value=""/><YTitle value=""/><LabelAngle value="20"/><LineColor value="#DFDFDF"/><TextColor value="#000000"/><VLineVisible value=""/><HLineVisible value="1"/><EdgeVisible value="1"/><SwapXY value=""/><Depth value="50"/><Perspective value="45"/><Transparency value="1"/><Border value="1"/><Legend value="1"/><LegendX value="42"/><LegendY value="25"/><DiscAbove value=""/><DiscBelow value=""/><Transpose value="1"/><ChartType value="Multi Bar"/><BackgroundType value="Plain Colour"/><BackgroundColor value="#FFFFFF"/><BackgroundGradient value=""/><FillType value=""/><ElementColor value=""/><MultiDepth value=""/><SortMethod value="default"/><ExplodePie value=""/><ExplodeSector value="0"/><ExplodeDistance value="30"/><StartAngle value="300"/></Graph></Graphs></Config>';
			}
		else $chart[$count][Config] = $quest->config;
		$count++;
		}
	$x++;
}
	

# This SELECTS all valid choices for each question from the choices table and drops it into the $options array.
# This is done so we can find the order the results should be sorted into AND identify options for which there
# were no votes and include them in the final report.
$query = "SELECT *, type FROM survey_qc, survey_q WHERE survey_qc.sid='$surveyid' AND survey_q.sid='$surveyid' AND survey_qc.qid=survey_q.qid AND TYPE < 40 ORDER BY survey_qc.qid, cid";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
while($choice = $result->fetch())
{
		$options[$choice->qid][] = $choice->ctext;
}

# This routine pulls all the result data from the table and drops in into the $results structure.
$results=array();
$query = 'SELECT DISTINCT(COUNT(value)) AS ct ,value,survey_ra.qid,survey_q.qtext,survey_q.type FROM survey_ra LEFT OUTER JOIN survey_q ON (survey_ra.qid = survey_q.qid AND survey_ra.sid = survey_q.sid) WHERE survey_ra.sid='.$surveyid.' AND type NOT IN (6,7,8,9,11,20,24,25,26,28) GROUP BY qid,value';
$result = new swphpDatabaseQuery($query,'sw_systemdb');
$x = 0;
while($choice = $result->fetch())
{
	$results[$choice->qid][ID] = $choice->qid;
	$results[$choice->qid][Text] = $choice->qtext;
	if ($choice->type > 40) $choice->type = 40;
	$results[$choice->qid][Type] = $choice->type;
	$results[$choice->qid][Choices][] = $choice->value;
	$results[$choice->qid][Votes][] = $choice->ct;
	$lastqid = $choice->qid;
	$x++;
}

# This routine sorts the result data back into the order the questions appear in the survey. Essential for
# occasions where the question perhaps invloved months of the year listed in order. You would want them
# reported back in order too. The complex method of assigning the values to the SChoices and SVotes arrays
# is necessary because foreach works on a copy of the array NOT the array itself grrrrr, inneficient function!
foreach ($results as $result){
	if ($result[Type] > 39) continue;
	for ($x = 0 ; $x < sizeof($options[$result[ID]]) ; $x++){
		$results[$result[ID]][SChoices][$x] = $options[$result[ID]][$x];
		$results[$result[ID]][SVotes][$x] = 0;
		for ($y = 0 ; $y < sizeof($result[Choices]) ; $y++){
			if ($results[$result[ID]][SChoices][$x] == $result[Choices][$y]) $results[$result[ID]][SVotes][$x] = $result[Votes][$y];
			}
		}
	}

# For now, this routine generates and HTML table for each question. The table includes the question text
# itself and all it's associated result data. Matrix and non matrix questions are handled seperately because
# They're completely different. The Matrix routine here also sorts the results back into the same order as
# the options appeared in the original survey. The non-matrix block is a straight forward iteration.
$chartcount = 0;
for ($x = 0 ; $x < sizeof($question) ; $x++){
	$question[$x][HTML] = "";
// Matrix Result Generator
	if ($question[$x][Type]==40){
		$matrix = array();
		$choices = array();
		$votes = array();
		$question[$x][HTML] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr><tr><td><img src="images/blank.gif" height="5" width="5"></td><td colspan="2" class="bodytext"><b><u>Complete&nbsp;Result&nbsp;Set</u></b><br><img src="images/blank.gif" height="5"></td><td><img src="images/blank.gif" height="5" width="5"></td></tr>';
		$chart[$chartcount][Table] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr><tr><td><img src="images/blank.gif" height="5" width="5"></td><td colspan="2" class="bodytext"><b><u>Complete&nbsp;Result&nbsp;Set</u></b><br><img src="images/blank.gif" height="5"></td><td><img src="images/blank.gif" height="5" width="5"></td></tr>';
		$chart[$chartcount][Labels] = "";
		$chart[$chartcount][Options] = "";
		$chart[$chartcount][Vals] = "";
		$z = 0;
		for ($y = 0 ; $y < sizeof($question) ; $y++){
			if ($question[$y][PID] == $question[$x][ID]){
				$matrix[$z] = $question[$y][Text];
				$matrix_id[$z] = $question[$y][ID];
				$z++;
				}
			}
		$query = "SELECT * FROM survey_qc WHERE sid='$surveyid' AND qid='".$question[$x][ID]."' ORDER BY cid";
		$result = new swphpDatabaseQuery($query,'sw_systemdb');
		$count = 0;
		while($choice = $result->fetch())
		{
			$choices[] = $choice->ctext;
			if ($count == 0) $chart[$chartcount][Options] = $choice->ctext;
			else $chart[$chartcount][Options] .= ',,,'.$choice->ctext;
			$count++;
		}
		for ($z = 0 ; $z < sizeof($matrix) ; $z++){
			$question[$x][HTML] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td colspan="2" class="smallertext"><b>'.$matrix[$z].'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			$chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td colspan="2" class="smallertext"><b>'.$matrix[$z].'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			if ($z == 0) $chart[$chartcount][Keys] = $matrix[$z];
			else $chart[$chartcount][Keys] .= ',,,'.$matrix[$z];
			for ($y = 0 ; $y < sizeof($choices) ; $y++){
				$votes[$y] = 0;
				for ($a = 0 ; $a < sizeof($results[$matrix_id[$z]][Choices]) ; $a++){
					if ($choices[$y] == $results[$matrix_id[$z]][Choices][$a]) $votes[$y] = $results[$matrix_id[$z]][Votes][$a];
					}
				if (($z == 0) && ($y == 0)) $chart[$chartcount][Vals] = $votes[$y];
				else if (($y == 0) && ($z > 0)) $chart[$chartcount][Vals] .= '___'.$votes[$y];
					else $chart[$chartcount][Vals] .= ',,,'.$votes[$y];
				$question[$x][HTML] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="smalltext">&nbsp;&nbsp;&nbsp;'.$choices[$y].'&nbsp;&nbsp;&nbsp;</td><td class="smalltext">'.$votes[$y].'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
				$chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="smalltext">&nbsp;&nbsp;&nbsp;'.$choices[$y].'&nbsp;&nbsp;&nbsp;</td><td class="smalltext">'.$votes[$y].'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
				}
			}
		$chart[$chartcount][URL] = 'chart_makeXML.php?lid='.$lid;
# Fix Options/URL non-char data Bug
$chart[$chartcount][Options] = str_replace("C/C++","C",$chart[$chartcount][Options]);
$chart[$chartcount][Options] = str_replace("C#","Java",$chart[$chartcount][Options]);
$chart[$chartcount][URL] = str_replace("C/C++","C",$chart[$chartcount][URL]);
$chart[$chartcount][URL] = str_replace("C#","Java",$chart[$chartcount][URL]);
		$question[$x][HTML] .= '<tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr></table></td><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr></table>';
		$chart[$chartcount][Table] .= '<tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr></table></td><td bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr></table>';

		$query = "INSERT INTO tmp_graph_args (ckeys,cvals,copts,qry,xmlconf,timestamp) VALUES ('".(str_replace("'","\'",$chart[$chartcount][Keys]))."','".(str_replace("'","\'",$chart[$chartcount][Vals]))."','".(str_replace("'","\'",$chart[$chartcount][Options]))."','$old_query','".$chart[$chartcount][Config]."','".$TIMESTAMP."')";
		$result = new swphpDatabaseQuery($query,'sw_systemdb');
		$lid = $result->last_insert_id();
		$chart[$chartcount][URL] = '<a href=\'javascript:chartbuilder('.$lid.',"x","'.$chart[$chartcount][QNum].'","TOP");\'><img src="../reports/chart_makeXML.php?lid='.$lid.'" border="0" alt="Click to Edit Chart"></a>';
		$chartcount++;
		}

// Non Matrix result generator
	else if (($question[$x][Type] != 41) && ($question[$x][Type] != 42)){
	$chart[$chartcount][Keys] = "";
	$chart[$chartcount][Vals] = "";
	$chart[$chartcount][Table] = "";
	$hash = array();
		for ($z = 0 ; $z < sizeof($results[$question[$x][ID]][SChoices]) ; $z++){
			$question[$x][HTML] .= '&nbsp;&nbsp;&nbsp;<i>'.$results[$question[$x][ID]][SChoices][$z].'</i>&nbsp;&nbsp;&nbsp;'.$results[$question[$x][ID]][SVotes][$z].'<br>';
			if ($z > 0) $chart[$chartcount][Keys] .= ',,,'.$results[$question[$x][ID]][SChoices][$z];
			else $chart[$chartcount][Keys] = $results[$question[$x][ID]][SChoices][$z];
			if ($z > 0) $chart[$chartcount][Vals] .= ',,,'.$results[$question[$x][ID]][SVotes][$z];
			else $chart[$chartcount][Vals] = $results[$question[$x][ID]][SVotes][$z];
			$hash[$results[$question[$x][ID]][SChoices][$z]] = $results[$question[$x][ID]][SVotes][$z];
			}
		arsort($hash);
		$chart[$chartcount][Table] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td><td><img src="images/blank.gif" height="5" width="1"><br><table border="0" cellspacing="0" cellpadding="0"><tr><td><img src="images/blank.gif" height="1" width="5"></td><td colspan="3" class="bodytext"><b><u>Complete&nbsp;Result&nbsp;Set</u></b><br><img src="images/blank.gif" height="5"></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
		$flag = 0;
		foreach ($hash as $key => $val){
			if ((!$flag) && (!$val)) {
				$chart[$chartcount][Table] .= '<tr><td colspan="5"><img src="images/blank.gif" height="5"></td></tr>';
				$flag = 1;
				}
			if ($val) $chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="bodytext"><b>'.$key.'</b></td><td class="bodytext">&nbsp;&nbsp;&nbsp;</td><td class="bodytext"><b>'.$val.'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			else $chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="bodytext">'.$key.'</td><td class="bodytext">&nbsp;&nbsp;&nbsp;</td><td class="bodytext">'.$val.'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			}
		$chart[$chartcount][Table] .= '</table><img src="images/blank.gif" height="5" width="1"><br></td><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';
		$chart[$chartcount][URL] = 'chart_makeXML.php?lid='.$lid;

		$query = "INSERT INTO tmp_graph_args (ckeys,cvals,copts,qry,xmlconf,timestamp) VALUES ('".(str_replace("'","\'",$chart[$chartcount][Keys]))."','".(str_replace("'","\'",$chart[$chartcount][Vals]))."','".(str_replace("'","\'",$chart[$chartcount][Options]))."','$old_query','".$chart[$chartcount][Config]."','".$TIMESTAMP."')";
		$result = new swphpDatabaseQuery($query,'sw_systemdb');
		$lid = $result->last_insert_id();	
		$chart[$chartcount][URL] = '<a href=\'javascript:chartbuilder('.$lid.',"x","'.$chart[$chartcount][QNum].'","TOP");\'><img src="../reports/chart_makeXML.php?lid='.$lid.'" border="0" alt="Click to Edit Chart"></a>';

		$chartcount++;
		}
	}

$nav = '<img src="images/space.gif" width="15" height="2" alt="" border="0">';
if ($PAGEID == "LR") $nav .= '<li><a href="#" class="selected">List Respondents</a></li>';
else $nav .= '<li><a href="svy_rpt_respondent.php?sessid='.$sessid.'&surveyid='.$surveyid.'">List Respondents</a></li>';
if ($PAGEID == "GR") $nav .= '<li><a href="#" class="selected">Graphical Report</a></li>';
else $nav .= '<li><a href="svy_rpt_graphical.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Graphical Report</a></li>';
if ($PAGEID == "TR") $nav .= '<li><a href="#" class="selected">Textual Report</a></li>';
else $nav .= '<li><a href="svy_rpt_textual.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Textual Report</a></li>';
if ($PAGEID == "FT") $nav .= '<li><a href="#" class="selected">Comment Report</a></li>';
else $nav .= '<li><a href="svy_rpt_freetext.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Comment Report</a></li>';
if ($PAGEID == "FR") $nav .= '<li><a href="#" class="selected">Full Report</a></li><ul><li><a href="Javascript:window.document.surveyxls.submit();">Export to Excel</a></li></ul>';
else $nav .= '<li><a href="svy_rpt_full.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Full Report</a></li>';


$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)

?>
<html>
<head>
	<title>Survey Reports</title>
	<link href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div id="pageArea">
<div id="topBanner">
		<div id="logoContainer"><span id="enterpriseLogo"><img src="<?php echo $_WSSM_HEADER_LOGO;?>" id="logoImage" alt="" border="0" /></span></div>
		<div id="helpbox">
				<table height="63">
					<tr><td align="right" valign="bottom" class="title">
								<?php echo  htmlentities($rep_tit); ?>
						</td>
					</tr>
				</table>
			</div>
	</div>

	<!-- LEFT MENU AREA -->
		<div id="navColumn">
			<?php
				echo "<ul id='ul_menulist'>";
				echo $nav;
				echo "</ul>";
			?>
		</div>
<br>
	<div style="margin-left:220px;">
		<div class="header">Graphical Report</div>
		<?php
		print '<table border="0" cellspacing="0" cellpadding="0">';
		//print '<tr><td width="72"><img src="images/blank.gif" alt="" width="72" height="1"></td>';
		print '<tr>';
		if($results)
		{
			for ($x = 0 ; $x < $chartcount ; $x++){
				if ($chart[$x][Type] > 40) continue;
				print '<td class="title"><br><br><b><li>'.$chart[$x][Question].'</b><br><br>';
				print '<table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" align="left">';
				if (strpos($chart[$x][Config],'<Border value="1"/>')) print '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td><td>'.$chart[$x][URL].'<br></td><td bgcolor="#000000"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td colspan="3" bgcolor="#000000"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';
				else print $chart[$x][URL].'<br>';
				print '</td><td class="bodytext">&nbsp;&nbsp;</td><td align="left" valign="top" class="bodytext">'.$chart[$x][Table].'</td></tr></table>';
				print '<br><br><br></td></tr>';
				}
		}
		else {
				print "<td><br>No suitable answers for display in a graphical report have been submitted to this survey!</td></tr>";
		}
		print '</table>';
		?>
	</div>
<script>
<!--
function chartbuilder(lid, config, qid, which){
//	document.chartmod.title.value = title;
	document.chartmod.which.value = which;
	document.chartmod.lid.value = lid;
	document.chartmod.qid.value = qid;
	document.chartmod.action = "../reports/chart_edit.php?lid=" + lid;
	document.chartmod.submit();
	}
//-->
</script>
<form name="chartmod" action="chart_edit.php" method="post">
<input type="hidden" name="surveyid" value="<?php echo $surveyid?>">
<input type="hidden" name="sessid" value="<?php echo $sessid?>">
<input type="hidden" name="which" value="">
<input type="hidden" name="lid" value="">
<input type="hidden" name="qid" value="">
<input type="hidden" name="qry" value="<?php echo $old_query?>">
<input type="hidden" name="pageid" value="../surveys/svy_rpt_graphical.php">
</form>
<br><br>
</div>
</body>
</html>




