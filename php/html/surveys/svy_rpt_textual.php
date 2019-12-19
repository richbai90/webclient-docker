<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();


// Page ID for the navigation
$PAGEID = "TR";

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


$TIMESTAMP = time();
$options = array();
$colours = array('#FF3333','#33FF33','#6666FF','#FFFF00','#FF66FF','#99FFFF','#FFCC33','#CCCCCC','#CC9999','#339966','#999900','#CC3300','#669999','#663333','#006600','#990099');


# If qid exists then config data from the chartbuilder has been passed in. This means the first thing we do
# is run a query to add this config to the correct table so that it is taken into account when this page is
# generated as normal.
if ($qid)
{
	$query = "UPDATE survey_q SET config='title=$title&sizex=$sizex&sizey=$sizey&margx=$margx&margy=$margy&plotx=$plotx&ploty=$ploty&sort=$sort&type=$type&border=$border&depth=$depth&trans=$trans&neg=$neg&leg=$leg&legx=$legx&legy=$legy&swap=$swap&piex=$piex&piey=$piey&bkg=$bkg&disc=$disc&discv=$discv' WHERE qid=$qid";
	$result = new swphpDatabaseQuery($query,'sw_systemdb');
}


$query = 'SELECT COUNT(DISTINCT srid) as cnt FROM survey_ra WHERE sid='.$surveyid;
$GlenConn = new swphpDatabaseQuery($query,'sw_systemdb');
$resp = $GlenConn->fetch()->cnt;



# Select the questions themselves, storing them in the $questions array for now.
$query = "SELECT * FROM survey_q WHERE sid='$surveyid' AND type NOT IN (6,7,8,9,11,20,24,25,26,28) ORDER BY qid";
if($GlenConn = new swphpDatabaseQuery($query,'sw_systemdb'))
{
	$x=0;
	$count=0;
	while($quest = $GlenConn->fetch()){
		$question[$x][ID] = $quest->qid;
		$question[$x][PID] = $quest->pqid;
		$question[$x][Type] = $quest->type;
		$question[$x][Text] = $quest->qtext;
		if ($quest->type < 41)
		{
			$chart[$count][QNum] = $quest->qid;
			$chart[$count][Question] = $quest->qtext;
			$chart[$count][Type] = $quest->type;
			if (!$quest->config) 
			{
				if ($quest->type < 40) $chart[$count][Config] = 'sizex=600&sizey=400&type=Pye&plotx=200&ploty=320&margx=0&margy=0&depth=50&border=1';
				else $chart[$count][Config] = 'sizex=600&sizey=400&type=MultiBar&plotx=510&ploty=320&margx=45&margy=35&depth=50&border=1&sort=transpose';
			}
			else $chart[$count][Config] = $quest->config;
			$count++;
		}
		$x++;
	}
}

# This SELECTS all valid choices for each question from the choices table and drops it into the $options array.
# This is done so we can find the order the results should be sorted into AND identify options for which there
# were no votes and include them in the final report.
$query = "SELECT *, type FROM survey_qc, survey_q WHERE survey_qc.sid='$surveyid' AND survey_q.sid='$surveyid' AND survey_qc.qid=survey_q.qid AND TYPE < 40 ORDER BY survey_qc.qid, cid";
if($GlenConn = new swphpDatabaseQuery($query,'sw_systemdb'))
{
	while($choice = $GlenConn->fetch())
	{
		$options[$choice->qid][] = $choice->ctext;
	}
}


#SELECT DISTINCT(COUNT(value)) AS ct,value,survey_ra.qid,survey_q.qtext,survey_q.type FROM survey_ra LEFT OUTER JOIN survey_q ON (survey_ra.qid = survey_q.qid) WHERE survey_ra.sid=1 GROUP BY qid,value
#SELECT DISTINCT(COUNT(value)) AS ct,value,survey_ra.qid FROM survey_ra WHERE sid=1 GROUP BY qid,value
#SELECT DISTINCT(COUNT(value)) AS ct,value,survey_ra.qid,type,qtext FROM survey_ra,survey_q WHERE survey_ra.qid=survey_q.qid AND survey_ra.sid=1 GROUP BY qid,value
#select survey_ra.qid,distinct(count(survey_ra.value)) as ct,survey_q.type,survey_q.qtext,survey_ra.value FROM survey_ra, survey_q WHERE survey_ra.qid = survey_q.qid AND sid=1 group by qid, value
# This routine pulls all the result data from the table and drops in into the $results structure.
#$query = "select distinct survey_ra.qid, count(distinct survey_ra.value) as ct, type, survey_q.qtext, value from survey_ra, survey_q where survey_ra.qid = survey_q.qid AND type NOT IN (6,7,8,9,11,20,24,25,26,28) AND survey_ra.sid = $surveyid group by survey_ra.qid, value order by survey_ra.qid;";
$results=array();
$query = 'SELECT DISTINCT(COUNT(value)) AS ct ,value,survey_ra.qid,survey_q.qtext,survey_q.type FROM survey_ra LEFT OUTER JOIN survey_q ON (survey_ra.qid = survey_q.qid AND survey_ra.sid = survey_q.sid) WHERE survey_ra.sid='.$surveyid.' AND type NOT IN (6,7,8,9,11,20,24,25,26,28) GROUP BY qid,value';
if($GlenConn = new swphpDatabaseQuery($query,'sw_systemdb')){
	$x = 0;
	while($choice = $GlenConn->fetch())
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
}
	
# This routine sorts the result data back into the order the questions appear in the survey. Essential for
# occasions where the question perhaps invloved months of the year listed in order. You would want them
# reported back in order too. The complex method of assigning the values to the SChoices and SVotes arrays
# is necessary because foreach works on a copy of the array NOT the array itself grrrrr, inneficient function!
foreach ($results as $result)
{
	if ($result[Type] > 39) continue;
	for ($x = 0 ; $x < sizeof($options[$result[ID]]) ; $x++)
	{
		$results[$result[ID]][SChoices][$x] = $options[$result[ID]][$x];
		$results[$result[ID]][SVotes][$x] = 0;
		for ($y = 0 ; $y < sizeof($result[Choices]) ; $y++)
		{
			if ($results[$result[ID]][SChoices][$x] == $result[Choices][$y]) 
			{
				$results[$result[ID]][SVotes][$x] = $result[Votes][$y];
			}
		}
	}
}

# For now, this routine generates and HTML table for each question. The table includes the question text
# itself and all it's associated result data. Matrix and non matrix questions are handled seperately because
# They're completely different. The Matrix routine here also sorts the results back into the same order as
# the options appeared in the original survey. The non-matrix block is a straight forward iteration.
$chartcount = 0;
for ($x = 0 ; $x < sizeof($question) ; $x++)
{
	$answers = 0;
	$question[$x][HTML] = "";
// Matrix Result Generator
	if ($question[$x][Type]==40)
	{
		$matrix = array();
		$choices = array();
		$votes = array();
		$question[$x][HTML] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="1" width="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr>';
		$chart[$chartcount][Table] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3"><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td><img src="images/blank.gif" height="1" width="1"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr>';
		$z = 0;
		for ($y = 0 ; $y < sizeof($question) ; $y++){
			if ($question[$y][PID] == $question[$x][ID]){
				$matrix[$z] = $question[$y][Text];
				$matrix_id[$z] = $question[$y][ID];
				$z++;
				}
			}
		$query = "SELECT * FROM survey_qc WHERE sid='$surveyid' AND qid='".$question[$x][ID]."' ORDER BY cid";
		if($GlenConn = new swphpDatabaseQuery($query,'sw_systemdb'))
		{
			$count = 0;
			while($choice = $GlenConn->fetch()){
				$choices[] = $choice->ctext;
				$count++;
				}
				

				
		}
		for ($z = 0 ; $z < sizeof($matrix) ; $z++){
			$answers = 0;
			$question[$x][HTML] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td colspan="2" class="smallertext"><b>'.$matrix[$z].'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			$chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td colspan="2" class="smallertext"><b>'.$matrix[$z].'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			for ($y = 0 ; $y < sizeof($choices) ; $y++){
				$votes[$y] = 0;
				for ($a = 0 ; $a < sizeof($results[$matrix_id[$z]][Choices]) ; $a++){
					if ($choices[$y] == $results[$matrix_id[$z]][Choices][$a]) $votes[$y] = $results[$matrix_id[$z]][Votes][$a];
					}
				if (($z == 0) && ($y == 0)) $chart[$chartcount][Vals] = $votes[$y];
				$question[$x][HTML] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="smalltext">&nbsp;&nbsp;&nbsp;'.$choices[$y].'&nbsp;&nbsp;&nbsp;</td><td class="smalltext">'.$votes[$y].'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
				$chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="smalltext">&nbsp;&nbsp;&nbsp;'.$choices[$y].'&nbsp;&nbsp;&nbsp;</td><td class="smalltext">'.$votes[$y].'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
				$answers += $votes[$y];
				}
			if ($resp > $answers) $chart[$chartcount][Table] .= '<tr><td colspan="4"><img src="images/blank.gif" height="2" width="5"></td></tr><tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="data" colspan="2" align="center"><i>NA</i>&nbsp;&nbsp;:&nbsp;&nbsp;'.($resp - $answers).'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr><tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr>';
			}

		$question[$x][HTML] .= '<tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr></table></td><td><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td colspan="3"><img src="images/blank.gif" height="1" width="1"></td></tr></table>';
		$chart[$chartcount][Table] .= '<tr><td colspan="4"><img src="images/blank.gif" height="5" width="5"></td></tr></table></td><td><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td colspan="3"><img src="images/blank.gif" height="1" width="1"></td></tr></table>';

		$chartcount++;
		}

// Non Matrix result generator
	else if (($question[$x][Type] != 41) && ($question[$x][Type] != 42))
	{
		
		$chart[$chartcount][Table] = "";
		$hash = array();
		
		for ($z = 0 ; $z < sizeof($results[$question[$x][ID]][SChoices]) ; $z++)
		{

			$question[$x][HTML] .= '&nbsp;&nbsp;&nbsp;<i>'.$results[$question[$x][ID]][SChoices][$z].'</i>&nbsp;&nbsp;&nbsp;'.$results[$question[$x][ID]][SVotes][$z].'<br>';
			$hash[$results[$question[$x][ID]][SChoices][$z]] = $results[$question[$x][ID]][SVotes][$z];
		}
		arsort($hash);
		$chart[$chartcount][Table] = '<table border="0" cellspacing="0" cellpadding="0"><tr><td colspan="3"><img src="images/blank.gif" width="1" height="1"></td></tr><tr><td><img src="images/blank.gif" height="1" width="1"></td><td><img src="images/blank.gif" height="5" width="1"><br><table border="0" cellspacing="0" cellpadding="0">';
		$flag = 0;
		foreach ($hash as $key => $val)
		{
			if ((!$flag) && (!$val)) 
			{
				$chart[$chartcount][Table] .= '<tr><td colspan="5"><img src="images/blank.gif" height="5"></td></tr>';
				$flag = 1;
			}
			
			if ($val) $chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="bodytext"><b>'.$key.'</b></td><td class="bodytext">&nbsp;&nbsp;&nbsp;</td><td class="bodytext"><b>'.$val.'</b></td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			else $chart[$chartcount][Table] .= '<tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="bodytext">'.$key.'</td><td class="bodytext">&nbsp;&nbsp;&nbsp;</td><td class="bodytext">'.$val.'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';
			$answers += $val;
		}

		if ($resp > $answers) $chart[$chartcount][Table] .= '<tr><td colspan="5"><img src="images/blank.gif" height="2"></td></tr><tr><td><img src="images/blank.gif" height="1" width="5"></td><td class="data" colspan="3" align="center"><i>NA</i>&nbsp;&nbsp;:&nbsp;&nbsp;'.($resp - $answers).'</td><td><img src="images/blank.gif" height="1" width="5"></td></tr>';

		$chart[$chartcount][Table] .= '</table><img src="images/blank.gif" height="5" width="1"><br></td><td><img src="images/blank.gif" height="1" width="1"></td></tr><tr><td colspan="3"><img src="images/blank.gif" width="1" height="1"></td></tr></table>';
		$chart[$chartcount][URL] = 'chart_make.php?'.$chart[$chartcount][Config].'&keys='.$chart[$chartcount][Keys].'&vals='.$chart[$chartcount][Vals];

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
	<LINK href="styles/mainstyles.php" rel="stylesheet" type="text/css">
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
		<div class="header">Textual Report</div><br>
		<?php
		print '<table border="0" cellspacing="0" cellpadding="0">';
		//print '<tr><td width="72"><img src="images/blank.gif" alt="" width="72" height="1"></td>';
		print '<tr>';
		if($results)
		{
			for ($x = 0 ; $x < $chartcount ; $x++){
				if ($chart[$x][Type] > 40) continue;
				print '<td class="title"><b><li>'.$chart[$x][Question].'</b><br>';
				print '<table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" align="left">';
				print '<td class="bodytext">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td align="left" valign="top" class="bodytext"><br>'.$chart[$x][Table].'<br></td></tr></table>';
				print '<br><br><br></td></tr>';
			}
		}
		else {
				print "<td>No suitable answers for display in a textual report have been submitted to this survey!</td></tr>";
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
	document.chartmod.action = "../reports/chart_edit.php?" + config;
	document.chartmod.submit();
	}
//-->
</script>
<form name="chartmod" action="chart_edit.php" method="post">
<input type="hidden" name="surveyid" value="<?php echo $surveyid?>">
<input type="hidden" name="which" value="">
<input type="hidden" name="lid" value="">
<input type="hidden" name="qid" value="">
<input type="hidden" name="sessid" value="<?php echo $sessid?>">
<input type="hidden" name="pageid" value="../surveys/svy_rpt_graphical.php">
</form>
<br><br>
</div>
</body>
</html>


