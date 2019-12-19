<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();

if (!$surveyid) $surveyid = $SURVEYID;
if (!$surveyid) {
	print 'No Report ID';
	exit;
}

swCreateTemporarySession();

if (!$pagenum) $pagenum = 0;

$_WSSM_SITE_TITLE = "Customer Survey";
$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)


$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid='$surveyid' AND qid>$pagenum ORDER BY qid";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
if($result)
{
	$x=0;
	while($quest = $result->fetch())
	{
#		print $quest->qid.'&nbsp;&nbsp;&nbsp;'.$quest->type.'&nbsp;&nbsp;&nbsp;'.$quest->qtext.'<br>';
		$question[$x][Num] = $quest->qid;
		$question[$x][Type] = $quest->type;
		$question[$x][Text] = $quest->qtext;
		$question[$x][PQID] = $quest->pqid;
		$x++;
	}
}
$question_count = $x;
?>
<html>
<head>
	<title><?php echo $_WSSM_SITE_TITLE;?></title>
	<LINK href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body id="body-qst">
<table align="center" width="700">
<tr>
	<td>
<?php
#for ($x = 1 ; $x < sizeof($question) ; $x++){
#	if ($question[$x][PQID] == 0){
	#	$pagenum = $question[$x][Num] - 1;
	#	break;
	#	}
	#}
$pagenum++;

foreach($HTTP_POST_VARS as $key => $val){
	if (($key == 'Submit') || ($key == 'carry')) continue;
	$str = '';
	if (is_array($val)){
		foreach($val as $value){
			if (($str) || ($str===0)) $str .= '^^^'.$value;
			else $str = $value;
			}
		}
	if ($str) $val = $str;
	else print $key.' = '.$val.'<br>';
	
	if ($carry) $carry .= '#@!%'.$key.'^=^'.$val;
	else $carry = $key.'^=^'.$val;
	}

print '<br><br>'.$carry.'<br><br>';

echo '<form name="survey" action="svy_qst_wizard.php?pagenum='.($pagenum).'&surveyid='.$surveyid.'&creqid='.$creqid.'" method="post"><input type="hidden" name="carry" value="'.$carry.'">';

//for ($x = 0 ; $x < $question_count ; $x++){
$x = 0;
	switch ($question[$x][Type]){
		case "1":								// Vertical radio buttons
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2">';
				while($choice = $result->fetch())
				{
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choice->ctext.'"></td><td>'.$choice->ctext.'</td></tr>';
				}
				$question[$x][Html] .= '</table>';
			}
			print $question[$x][Html];
		break;
		case "2":								// Horizontal radio buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{

				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
				while($GlenConn->Fetch("choice")){
					$question[$x][Html] .= '<td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choice->ctext.'"></td><td>'.$choice->ctext.'</td><td>&nbsp;&nbsp;&nbsp;</td>';
					}
				$question[$x][Html] .= '</tr></table>';
				}
			print $question[$x][Html];
		break;
		case "3":								// Horizontal checkbox buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{

				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
				while($GlenConn->Fetch("choice")){
					$question[$x][Html] .= '<td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"></td><td>'.$choice->ctext.'</td><td>&nbsp;&nbsp;&nbsp;</td>';
					}
				$question[$x][Html] .= '</tr></table>';
				}
			print $question[$x][Html];
		break;
		case "4":								// Vertical checkbox buttons
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{

				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2">';
				while($GlenConn->Fetch("choice")){
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"></td><td>'.$choice->ctext.'</td></tr>';
					}
				$question[$x][Html] .= '</table>';
				}
			print $question[$x][Html];
		break;
		case "5":								// Dropdown select box
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{

				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'">';
				while($GlenConn->Fetch("choice")){
					$question[$x][Html] .= '<option value="'.$choice->ctext.'">'.$choice->ctext.'</option>';
					}
				$question[$x][Html] .= '</td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "6":								// Text Message
			$question[$x][Html] = '<br>'.$question[$x][Text].'<br>';
			print $question[$x][Html];
		break;
		case "7":								// Single line free text input field
			$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="text" size="40" name="q'.$question[$x][Num].'"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "8":								// Multi line free text area
			$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><textarea cols="40" rows="10" name="q'.$question[$x][Num].'"></textarea></td></tr></table>';
			print $question[$x][Html];
		break;
		case "9":								// Small text input field for a numeric value
			$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="text" size="20" name="q'.$question[$x][Num].'"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "10":								// Multi select box
			$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{

				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'[]" size="6" multiple>';
				while($GlenConn->Fetch("choice")){
					$question[$x][Html] .= '<option value="'.$choice->ctext.'">'.$choice->ctext.'</option>';
					}
				$question[$x][Html] .= '</select></td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "11":								// Password input field
			$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="password" name="q'.$question[$x][Num].'" size="30"></td></tr></table>';
			print $question[$x][Html];
		break;
		case "20":								// Form type questions
			$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br>';
			$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br>'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2">';
				$y = 0;
				while($quest = $result->fetch())
				{
					$form_quest_text[$y] = $quest->qtext;
					$form_quest_id[$y] = $quest->qid;
					$form_quest_type[$y] = $quest->type;
					$y++;
				}
				for ($z = 0 ; $z < $y ; $z++)
				{
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td valign="top">'.$form_quest_text[$z].'</td><td>&nbsp;&nbsp;&nbsp;</td><td>';
					switch ($form_quest_type[$z]){
						case "21":				// Form Horizontal Radio Buttons
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								while($brightman = $result->fetch())
								{
									$question[$x][Html] .= '<td><input type="radio" name="q'.$form_quest_id[$z].'" value="'.$brightman->ctext.'"></td><td>'.$brightman->ctext.'</td><td>&nbsp;&nbsp;&nbsp;</td>';
								}
								$question[$x][Html] .= '</tr></table>';
							}
						break;
						case "22":				// Form Horizontal Check Boxes
							$WRAPAFTER = 4;
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								$count = 0;
								while($brightman = $result->fetch())
								{
									if ($count == $WRAPAFTER)
									{
										$question[$x][Html] .= '</tr><tr>';
										$count = 0;
									}
									$count++;
									$question[$x][Html] .= '<td><input type="checkbox" name="q'.$form_quest_id[$z].'[]" value="'.$brightman->ctext.'"></td><td>'.$brightman->ctext.'</td><td>&nbsp;&nbsp;&nbsp;</td>';
								}
								for ($z = 0 ; $z < ($WRAPAFTER - $count) ; $z++)
								{
									$question[$x][Html] .= '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
								}
								$question[$x][Html] .= '</tr></table>';
								}
						break;
						case "23":				// Form Drop-down Menu select
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><select name="q'.$form_quest_id[$z].'">';
								while($brightman = $result->fetch())
								{

									$question[$x][Html] .= '<option value="'.$brightman->ctext.'">'.$brightman->ctext.'</option>';
								}
								$question[$x][Html] .= '</select></td></tr></table>';
							}
						break;
						case "24":				// Form Standard text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" name="q'.$form_quest_id[$z].'" size="40">';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "25":				// Form Free text area
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<textarea cols="40" rows="10" name="q'.$form_quest_id[$z].'"></textarea>';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "26":				// Form small text field for numeric value
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" size="20" name="q'.$form_quest_id[$z].'">';
							$question[$x][Html] .= '</td></tr></table>';
						break;
						case "27":				// Form Multi select dropdown
							$query = "SELECT * FROM sw_systemdb.survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY cid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><select name="q'.$form_quest_id[$z].'[]" size="6" multiple>';
								while($brightman = $result->fetch())
								{
									$question[$x][Html] .= '<option value="'.$brightman->ctext.'">'.$brightman->ctext.'</option>';
								}
								$question[$x][Html] .= '</select></td></tr></table>';
							}
						break;						
						case "28":				// Form password text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="password" name="q'.$form_quest_id[$z].'" size="30">';
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
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><li>&nbsp;&nbsp;'.$question[$x][Text].'<br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;</td>';
				$y = 0;
				while($choice = $result->fetch())
				{
					$question[$x][Html] .= '<td>'.$choice->ctext.'</td><td>&nbsp;&nbsp;&nbsp;</td>';
					$multichoice[$y] = $choice->ctext;
					$y++;
				}
				$question[$x][Html] .= '</tr>';
				$query = "SELECT * FROM sw_systemdb.survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
				$result = new swphpDatabaseQuery($query,'sw_systemdb');
				if($result)
				{
					while($brightman = $result->fetch())
					{
						$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>'.$brightman->qtext.'&nbsp;&nbsp;</td>';
						for ($z = 0 ; $z < $y ; $z++){
							if ($brightman->type == "31") $question[$x][Html] .= '<td align="center"><input type="radio" name="q'.$brightman->qid.'" value="'.$multichoice[$z].'"></td><td>&nbsp;&nbsp;&nbsp;</td>';
							else $question[$x][Html] .= '<td align="center"><input type="checkbox" name="q'.$brightman->qid.'[]" value="'.$multichoice[$z].'"></td><td>&nbsp;&nbsp;&nbsp;</td>';
						}
						$question[$x][Html] .= "</tr>";
					}
					$question[$x][Html] .= "</table>";
				}
			}
			print $question[$x][Html];
		break;
		}
//	}
echo '<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" name="Submit" value="Submit"><br><br></form>';

#if (sizeof($question) > 1) print '<a href="svy_qst_wizard.php?pagenum='.($pagenum).'&surveyid='.$surveyid.'&creqid='.$creqid.'">Next Page</a>';

?>
	</td>
</tr>
</table>
</body>
</html>

<?php

	swCloseTemporarySession();
?>
