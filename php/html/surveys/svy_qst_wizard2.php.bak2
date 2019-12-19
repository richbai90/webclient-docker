<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();

$id = $creqid;
if (!$surveyid) $surveyid = $SURVEYID;
if (!$surveyid)
{
	print 'Sorry, there has been an error, no survey id';
	exit;
}

swCreateTemporarySession();

$result = new swphpDatabaseQuery('SELECT SurveyName FROM survey_config WHERE SurveyID='.$surveyid,'sw_systemdb');
$surveyConfig = $result->fetch();
if ($surveyConfig)
{
	$rep_tit = $surveyConfig->surveyname;
	if (!$qid) $qid = 1;
}
else 
{
	header("Location: error.php?error=7");
	swCloseTemporarySession();
	exit;
}

$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid='$surveyid' AND qid=$qid";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
$quest =  $result->fetch();

$_WSSM_SITE_TITLE = "Customer Survey";

$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)



if (!$withheld)
{
	foreach($HTTP_POST_VARS as $key => $val)
	{
		if (($key == 'Submit') || ($key == 'carry') || ($key == 'qid')) continue;
		$str = '';
		if (is_array($val)){
			foreach($val as $value){
				if (($str) || ($str===0)) $str .= '^^^'.$value;
				else $str = $value;
				}
			}
		if ($str) $val = $str;

		if ($carry) $carry .= '#@!%'.$key.'^=^'.$val;
		else $carry = $key.'^=^'.$val;
		}
	}

# This is just to get hold of survey data.
$query = "SELECT * FROM sw_systemdb.survey_r WHERE srid='$id' AND cpltdate='0000-00-00 00:00:00' LIMIT 1";

if($result = new swphpDatabaseQuery($query,'sw_systemdb'))
{
	while($details = $result->fetch())
	{
		$syd = $details->sid;
	}
}
if (($qid < 0) || (!$quest->qid))
{
	if ($syd)
	{
		print 'All questions answered<br><br>';

		$questions = explode("#@!%",(str_replace("\\","",$carry)));
		foreach($questions as $str){
			$temp = explode("^=^",$str);
			if (strpos($temp[1],"^^^")){
				$temp2 = explode("^^^",$temp[1]);
				for ($x = 0 ; $x < sizeof($temp2) ; $x++){
					$querys = "INSERT INTO sw_systemdb.survey_ra (srid, sid, qid, value) VALUES ('$id','$surveyid','".(str_replace('q','',$temp[0]))."','".(str_replace("'","\\'",$temp2[$x]))."')";
					$result = new swphpDatabaseQuery($query,'sw_systemdb');
					}
				}
			else {
				$querys = "INSERT INTO sw_systemdb.survey_ra (srid, sid, qid, value) VALUES ('$id','$surveyid','".(str_replace('q','',$temp[0]))."','".(str_replace("'","\\'",$temp[1]))."')";
				$result = new swphpDatabaseQuery($query,'sw_systemdb');
				}
			}

		$strdate = date('Y-m-d H:i:s');
		$query = 'UPDATE sw_systemdb.survey_r SET status="2",cpltdate="'.$strdate.'" WHERE srid="'.$id.'" AND sid='.$surveyid;
		$result = new swphpDatabaseQuery($query,'sw_systemdb');
		$message = 'Thank you for your time';
		}
	else {
		$message = 'Sorry, you have already completed this survey OR have not been invited to take part';
		}
		?><html>
<head>
	<title><?php echo $_WSSM_SITE_TITLE;?></title>
	<link href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body>
<table id="survey_title_table">
<tr>
	<td><img src="images/survey_title.jpg" width="371" height="52" alt="" border="0"></td><td align="right" class="surveyname"><?php echo $rep_tit?></td>
</tr>
</table>
<table id="survey_headers_table">
  <tr>
    <td class="company" id="survey_headers_img">
	<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td id="survey_headers_space_img" alt="" /></tr></table></td>
  </tr>
</table>
		<table border="0" cellpadding="50" cellspacing="0">
			<tr><td valign="top" class="plaintext">

	<?php
	print $message;
	?>
	</td></tr>
	</table>
	</body>
	</html>
	<?php
	swCloseTemporarySession();
	exit;
	}

$x = 0;
$question_count = $x;

$question[$x][Num] = $quest->qid;
$question[$x][Type] = $quest->type;
$question[$x][Text] = $quest->qtext;
$question[$x][PQID] = $quest->pqid;
if ($quest->nooutput) $withheld = '<input type="hidden" name="withheld" value="1">';
else $withheld = '';
if ($quest->nqid) $next_qid = $quest->nqid;

#print '<br><br>Carried = '.$carry.'<br>Text = '.$question[$x][Text].'<br>Type = '.$question[$x][Type].'<br><br>';
?>
<html>
<head>
	<title><?php echo $_WSSM_SITE_TITLE;?></title>
	<link href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body>
<table id="survey_title_table">
<tr>
	<td><img src="images/survey_title.jpg" width="371" height="52" alt="" border="0"></td><td align="right" class="surveyname"><?php echo $rep_tit?></td>
</tr>
</table>
<table id="survey_headers_table">
  <tr>
    <td class="company" id="survey_headers_img">
	<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td id="survey_headers_space_img" alt="" /></tr></table></td>
  </tr>
</table>
<br><br>
<table align="center" width="700">
<tr>
	<td>
<?php
echo '<form name="survey" action="svy_qst_wizard2.php?&surveyid='.$surveyid.'&creqid='.$creqid.'" method="post"><input type="hidden" name="carry" value="'.$carry.'">'.$withheld;
$x = 0;
	switch ($question[$x][Type]){
		case "1":								// Vertical radio buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){			
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2">';
				$branchflag=false;
				$count = 0;
				while($choice = $result->fetch()){
					$choices[$count] = $choice->ctext;
					$target[$count] = $choice->tqid ? $choice->tqid : $qid + 1;
					if ($choice->tqid) $branchflag=true;
					$checked[$count] = $choice->defans ? ' checked' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$count++;
					}
				for ($z = 0 ; $z < $count ; $z++){
					if ($branchflag) $question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'" onclick="javascript:setnext('.$target[$z].');"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td></tr>';
					else $question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td></tr>';
					}
				$question[$x][Html] .= '</table>';
				}
			print $question[$x][Html];
		break;
		case "2":								// Horizontal radio buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>';
				$branchflag=false;
				$count = 0;
				while($choice = $result->fetch()){
					$choices[$count] = $choice->ctext;
					$target[$count] = $choice->tqid ? $choice->tqid : $qid + 1;
					if ($choice->tqid) $branchflag=true;
					$checked[$count] = $choice->defans ? ' checked' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$count++;
					}
				for ($z = 0 ; $z < $count ; $z++){
					if ($branchflag) $question[$x][Html] .= '<td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'" onclick="javascript:setnext('.$target[$z].');"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
					else $question[$x][Html] .= '<td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
					}
				$question[$x][Html] .= '</td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "3":								// Horizontal checkbox buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
				while($choice = $result->fetch()){
					$checked = $choice->defans ? ' checked' : '';
					$question[$x][Html] .= '<td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"'.$checked.'></td><td><span class="response">'.$choice->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
					}
				$question[$x][Html] .= '</tr></table>';
				}
			print $question[$x][Html];
		break;
		case "4":								// Vertical checkbox buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2">';
				while($choice = $result->fetch()){
					$checked = $choice->defans ? ' checked' : '';
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"'.$checked.'></td><td><span class="response">'.$choice->ctext.'</span></td></tr>';
					}
				$question[$x][Html] .= '</table>';
				}
			print $question[$x][Html];
		break;
		case "5":								// Dropdown select box
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'" onchange="javascript:setnext2(this.value);" class="selectstyle"><option value="" selected>Please Select</option>';
				$count = 0;
				$script = "var option = new Array();\nvar target = new Array();\n";
				while($choice = $result->fetch()){
					$checked = $choice->defans ? ' selected' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$question[$x][Html] .= '<option value="'.$choice->ctext.'"'.$checked.'>'.$choice->ctext.'</option>';
					$script .= "option[".$count."] = '".$choice->ctext."';\n";
					$script .= "target[".$count."] = '".($choice->tqid ? $choice->tqid : $qid + 1)."';\n";
					$count++;
					}
				$script .= "var items = ".$count.";\n";
				$question[$x][Html] .= '</td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "6":								// Text Message
			$question[$x][Html] = '<br><span class="textmessage">'.$question[$x][Text].'</span><br>';
			print $question[$x][Html];
		break;
		case "7":								// Single line free text input field
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="text" size="40" name="q'.$question[$x][Num].'" class="longtextbox"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "8":								// Multi line free text area
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><textarea cols="42" rows="10" name="q'.$question[$x][Num].'" class="longextarea"></textarea></td></tr></table>';
			print $question[$x][Html];
		break;
		case "9":								// Small text input field for a numeric value
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="text" size="20" name="q'.$question[$x][Num].'" class="longtextbox"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "10":								// Multi select box
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'[]" size="6" multiple class="selectstyle">';
				while($choice = $result->fetch()){
					$checked = $choice->defans ? ' selected' : '';
					$question[$x][Html] .= '<option value="'.$choice->ctext.'"'.$checked.'>'.$choice->ctext.'</option>';
					}
				$question[$x][Html] .= '</select></td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "11":								// Password input field
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="password" name="q'.$question[$x][Num].'" size="30" class="longtextbox"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "20":								// Form type questions
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br>';
			$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="formheaders">'.$question[$x][Text].'</span><br><hr size="1" color="5Ba1E7" width="93%"><table border="0" cellspacing="0" cellpadding="2">';
				$y = 0;
				while($quest = $result->fetch()){
					$form_quest_text[$y] = $quest->qtext;
					$form_quest_id[$y] = $quest->qid;
					$form_quest_type[$y] = $quest->type;
					$y++;
					}
$last_qid = $quest->qid;
				for ($z = 0 ; $z < $y ; $z++){
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td valign="top"><span class="question">'.$form_quest_text[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td><td>';
					switch ($form_quest_type[$z]){
						case "21":				// Form Horizontal Radio Buttons
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								while($brightman = $result->fetch()){
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<td><input type="radio" name="q'.$form_quest_id[$z].'" value="'.$brightman->ctext.'"'.$checked.'></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
									}
								$question[$x][Html] .= '</tr></table>';
								}
						break;
						case "22":				// Form Horizontal Check Boxes
							$WRAPAFTER = 4;
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								$count = 0;
								while($brightman = $result->fetch()){
									if ($count == $WRAPAFTER){
										$question[$x][Html] .= '</tr><tr>';
										$count = 0;
										}
									$count++;
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<td><input type="checkbox" name="q'.$form_quest_id[$z].'[]" value="'.$brightman->ctext.'"'.$checked.'></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
									}
								for ($z = 0 ; $z < ($WRAPAFTER - $count) ; $z++){
									$question[$x][Html] .= '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
									}
								$question[$x][Html] .= '</tr></table>';
								}
						break;
						case "23":				// Form Drop-down Menu select
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><select name="q'.$form_quest_id[$z].'" class="selectstyle">';
								while($brightman = $result->fetch()){
									$checked = $brightman->defans ? ' selected' : '';
									$question[$x][Html] .= '<option value="'.$brightman->ctext.'"'.$checked.'>'.$brightman->ctext.'</option>';
									}
								$question[$x][Html] .= '</select></td></tr></table>';
								}
						break;
						case "24":				// Form Standard text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" name="q'.$form_quest_id[$z].'" size="40" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "25":				// Form Free text area
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<textarea cols="42" rows="10" name="q'.$form_quest_id[$z].'" class="longtextarea"></textarea>';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "26":				// Form small text field for numeric value
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" size="20" name="q'.$form_quest_id[$z].'" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "27":				// Form Multi select dropdown
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY cid";
							if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><select name="q'.$form_quest_id[$z].'[]" size="6" multiple class="selectstyle">';
								while($brightman = $result->fetch()){
									$question[$x][Html] .= '<option value="'.$brightman->ctext.'">'.$brightman->ctext.'</option>';
									}
								$question[$x][Html] .= '</select></td></tr></table>';
								}
						break;
						case "28":				// Form password text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="password" name="q'.$form_quest_id[$z].'" size="30" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						}
					$question[$x][Html] .= '</td></tr>';
					}
				$question[$x][Html] .= '</table>';
				}
			print $question[$x][Html];
		break;
		case "30":								// Marix question Message (checkbox or radio variety)
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;</td>';
				$y = 0;
				while($choice = $result->fetch()){
					$question[$x][Html] .= '<td><span class="matrixhead">'.$choice->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
					$multichoice[$y] = $choice->ctext;
					$y++;
					}
				$question[$x][Html] .= '</tr>';
				$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
				if($result = new swphpDatabaseQuery($query,'sw_systemdb')){
					while($brightman = $result->fetch()){
						$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><span class="matrixrows">'.$brightman->qtext.'&nbsp;&nbsp;</span></td>';
						for ($z = 0 ; $z < $y ; $z++){
							if ($brightman->type == "31") $question[$x][Html] .= '<td align="center"><input type="radio" name="q'.$brightman->qid.'" value="'.$multichoice[$z].'"></td><td>&nbsp;&nbsp;&nbsp;</td>';
							else $question[$x][Html] .= '<td align="center"><input type="checkbox" name="q'.$brightman->qid.'[]" value="'.$multichoice[$z].'"></td><td>&nbsp;&nbsp;&nbsp;</td>';
							}
						$question[$x][Html] .= "</tr>";
						}
$last_qid = $brightman->qid;
					$question[$x][Html] .= "</table>";
					}
				}
			print $question[$x][Html];
		break;
		}

if (!$next_qid){
	if ($last_qid) $next_qid = $last_qid + 1;
	else $next_qid = $qid + 1;
	}
print '<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<center><input type="submit" name="Submit" value="Submit" class="buttonstyle"></center><br><br><input type="hidden" value="'.$next_qid.'" name="qid"></form>';
?>
	</td>
</tr>
</table>
<script language="javascript">
<!--
<?php
if ($script){
	print $script;
	?>
function setnext2(val){
	for(x = 0 ; x < items ; x++){
		if (val == option[x]) {
			document.survey.qid.value = target[x];
//			alert(target[x]);
			return;
			}
		}
	}
<?php } else { ?>
function setnext(nextqid){
	document.survey.qid.value = nextqid;
//	alert(nextqid);
	}
<?php }
print $defnext."\n";
?>
//-->
</script>
</body>
</html>

<?php

swCloseTemporarySession();

?>
