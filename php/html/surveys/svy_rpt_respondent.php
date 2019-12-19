<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();

// Page ID for the navigation
$PAGEID = "LR";

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

$query = "SELECT DISTINCT srid,custname,callref FROM survey_r WHERE sid='$surveyid' AND cpltdate>'0000-00-00 00-00-00'";
$GlenConn = new swphpDatabaseQuery($query,'sw_systemdb');


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
		<div class="header">List Respondents</div><br>
		<table border="0" cellspacing="0" cellpadding="0" width="770">
			<tr>
				<td align="left"><img src="images/blank.gif" height="1" width="703"><br>
				<table border="0" cellspacing="0" cellpadding="4">
				<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><span class="header">Customer&nbsp;Name</span></td>
					<td>&nbsp;&nbsp;&nbsp;&nbsp;</td><td><span class="header">Call&nbsp;Reference</span></td>
				</tr>
				<?php
					/////////////////////////////////////////////////////////
					// Bug Fixed: F00055125
					// Desc: Customer survey reports do not include custoemr information
					$count = 0;
					while($res = $GlenConn->fetch()){
						$count++;
						$name = $res->custname ? $res->custname : $res->srid;
						print '<tr><td align="left">'.$count.'</td><td align="left"><a href="svy_rpt_full.php?sessid='.$sessid.'&srid='.$res->srid.'&surveyid='.$surveyid.'">'.$name.'</a></td>
						<td></td><td align="left">' . swcallref_str($res->callref) . '</td></tr>';
						}
					/////////////////////////////////////////////////////////
				?>
				</table>
				</td>
			</tr>
		</table>
		<br><br>
		</div>
	</div>
</body>
</html>



