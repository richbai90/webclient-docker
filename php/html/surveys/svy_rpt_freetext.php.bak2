<?php

include('swphpdll.php');
swphpGlobaliseRequestVars();

// Page ID for the navigation
$PAGEID = "FT";

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


$query = 'SELECT srid,custname FROM survey_r WHERE sid='.$surveyid;
$result = new swphpDatabaseQuery($query,'sw_systemdb');
while($cust = $result->fetch())
{
	$cust_srid = strtolower($cust->srid);
	if ($cust->custname) $customers[$cust_srid] = $cust->custname;
	else $customers[$cust->srid] = $cust->srid;
}


$query = "SELECT * FROM survey_q WHERE sid='$surveyid' AND type IN (7,8,24,25) ORDER BY qid";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
while($res = $result->fetch())
{
	$questions[$res->qid] = $res->qtext;
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
		<div class="header">Comment Report</div>

		<table border="0" cellspacing="0" cellpadding="0" width="770">
			<tr>
				<td align="left"><img src="images/blank.gif" height="1" width="703"><br>
				<?php
				$loopingflag = false;
				print '<br><table border="0" cellspacing="0" cellpadding="4">';
				if ($questions)
				{
					foreach ($questions as $key => $val)
					{
						print '<tr><td valign="top" colspan="3"><br><b>'.$val.'</b>&nbsp;&nbsp;&nbsp;<br><br></td></tr>';
						$query = "SELECT * FROM survey_ra WHERE sid='$surveyid' AND qid='$key' ORDER BY srid,qid";
						$result = new swphpDatabaseQuery($query,'sw_systemdb');
						while($res = $result->fetch())
						{
							if ($loopingflag) print '<tr><td valign="top" colspan="3"><table border="0" cellspacing="1" cellpadding="0" width="100%"><tr><td><img src="images/blank.gif" height="1" width="30"></td><td valign="top" width="100%" bgcolor="#99ccff"><img src="images/blank.gif" height="1" width="1"></td></tr></table></td></tr>';
							print '<tr><td><img src="images/blank.gif" height="1" width="30"></td><td valign="top" align="left"><a href="svy_rpt_full.php?srid='.$res->srid.'&surveyid='.$surveyid.'">'.$customers[$res->srid].'</a>&nbsp;&nbsp;&nbsp;&nbsp;</td><td valign="top" align="left">'.$res->value.'&nbsp;</td></tr>';
							$loopingflag = true;
						}
						$loopingflag = false;
						print '<tr><td colspan="3"><table border="0" cellspacing="0" cellpadding="0" width="100%"></table></td></tr>';
					}
				}
				else
				{
					print "<tr><td>No comment based or free text answers submitted to this survey!</td></tr>";
				}
				print '</table>';
				?>
				</td>
			</tr>
		</table>
	</div>
<br><br>
</div>
</body>
</html>


