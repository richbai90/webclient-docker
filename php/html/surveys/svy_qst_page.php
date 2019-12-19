<?php

//
include('stdinclude.php');
swphpGlobaliseRequestVars();

$id = $creqid;
if (!$surveyid) $surveyid = $SURVEYID;
if (!$surveyid)
{
	header("Location: error.php?error=1");
	exit;
}

if(!swCreateTemporarySession())
{
	header("Location: error.php?error=10");
	exit;
}


//-- 04/2015  - nwj - use simple db wrapper
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

//-- fetch question
$result = new swphpDatabaseQuery("SELECT * FROM survey_q WHERE sid='$surveyid' AND qid=$qid",'sw_systemdb');
$quest = $result->fetch();
if (!$quest)
{
	if ($qid == 1)
	{
		header("Location: error.php?error=2");
		swCloseTemporarySession();
		exit;
	}
	else 
	{
		if (!$creqid)
		{
			if ($creqid) header("Location: error.php?error=6");
			else header("Location: error.php?error=9");
			
			swCloseTemporarySession();
			exit;
		}
	}
}

if (!$withheld){
	foreach($_POST as $key => $val){
		if (($key == 'Submit') || ($key == 'carry') || ($key == 'qid')) continue;
#		print $key.' = '.$val.'<br>';
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
$syd = false;
$result = new swphpDatabaseQuery("SELECT * FROM survey_r WHERE srid='$id' AND cpltdate='0000-00-00 00:00:00' LIMIT 1",'sw_systemdb');
$details = $result->fetch();
if($details)$syd = $details->sid;

if (($id) && (!$syd))
{
	header("Location: error.php?error=8");
	swCloseTemporarySession();
	exit;
}

	$_WSSM_SITE_TITLE = "Customer Survey";

	$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
	if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)
	

if (($qid < 0) || (!$quest->qid))
{
	if ($syd)
	{
		$questions = explode("#@!%",(str_replace("\\","",$carry)));
		foreach($questions as $str)
		{
			$temp = explode("^=^",$str);
			if (strpos($temp[1],"^^^"))
			{
				$temp2 = explode("^^^",$temp[1]);
				for ($x = 0 ; $x < sizeof($temp2) ; $x++)
				{
					$querys = "INSERT INTO survey_ra (srid, sid, qid, value) VALUES ('$id','$surveyid','".(str_replace('q','',$temp[0]))."','".(str_replace("'","\\'",$temp2[$x]))."')";
					$a = new swphpDatabaseQuery($querys,'sw_systemdb');

				}
			}
			else 
			{
				$querys = "INSERT INTO survey_ra (srid, sid, qid, value) VALUES ('$id','$surveyid','".(str_replace('q','',$temp[0]))."','".(str_replace("'","\\'",$temp[1]))."')";
				$a = new swphpDatabaseQuery($querys,'sw_systemdb');

			}
		}

		$strdate = date('Y-m-d H:i:s');
		$query = 'UPDATE survey_r SET status="2",cpltdate="'.$strdate.'" WHERE srid="'.$id.'" AND sid='.$surveyid;
		$a = new swphpDatabaseQuery($query,'sw_systemdb');
		$message = 'All questions answered, thank you for your time';
	}
	else 
	{
		$message = 'Sorry, you have already completed this survey OR have not been invited to take part';
	}
		
?>
<html>
<head>
	<title><?php echo $_WSSM_SITE_TITLE; ?></title>
	<LINK href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div id="pageArea">
<div id="topBanner">
		<div id="logoContainer"><span id="enterpriseLogo"><img src="<?php echo $_WSSM_HEADER_LOGO; ?>" id="logoImage" alt="" border="0" /></span></div>
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
				//echo "<ul id='ul_menulist'>";
				//echo $nav;
				//echo "</ul>";
			?>
		</div>
		<table border="0" cellpadding="50" cellspacing="0">
			<tr><td valign="top" class="plaintext">

	<?php
	print $message;
	?>
	</td></tr>
	</table>
	</div>
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
if ($quest->flags & 1) $withheld = '<input type="hidden" name="withheld" value="1">';
else $withheld = '';
if ($quest->flags & 2) $submitbutton = '<a href="javascript:validate();"><b>Next</b></a>';
else $submitbutton = '<a href="javascript:document.survey.submit();"><b>Next</b></a>';
if ($quest->nqid) $next_qid = $quest->nqid;

#print '<br><br>Carried = '.$carry.'<br>Text = '.$question[$x][Text].'<br>Type = '.$question[$x][Type].'<br><br>';
?>
<html>
<head>
<title><?php echo $_WSSM_SITE_TITLE;?></title>
<LINK REL=StyleSheet HREF="styles/mainstyles.php" TYPE="text/css">
<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
<script language="javascript">
<!--
function validate(){
	var valid = false;
	for (x = 0 ; x < document.survey.length ; x++){
		if ((document.survey.elements[x].name != 'carry') && (document.survey.elements[x].name != 'qid') && (document.survey.elements[x].name != 'withheld')){
			if (document.survey.elements[x].type == 'radio' || document.survey.elements[x].type == 'checkbox'){
				if (document.survey.elements[x].checked) valid = true;
				}
			else {
				if (document.survey.elements[x].value) valid = true;
				}
//			alert (document.survey.elements[x].type + " = " + document.survey.elements[x].name + " = " + valid);
			}
		}
	if (valid) document.survey.submit();
	else alert("Sorry: A required answer is missing.")
	}
	
function enforcenumeric(input, evt) {
	var theEvent = evt || window.event;
	var key = theEvent.keyCode || theEvent.which;
	// key = String.fromCharCode( key );	
	if(input.value.length == 0 && (key == 43 || key == 45))
	{
		// + or - at the start
		return;
	}
	if(key >= 48 && key <= 57)
	{
		// number ok
		return;
	}
	if(input.value.indexOf(".", 0) == -1 && key == 46)
	{
		// full stop when a full stop does not exist.
		return;
	}
	theEvent.returnValue = false;
	if(typeof theEvent.preventDefault == "function")
	{
		theEvent.preventDefault();
	}
}
//-->
</script>
</head>
<body>
<div id="pageArea">
<div id="topBanner">
		<div id="logoContainer"><span id="enterpriseLogo"><img src="<?php echo $_WSSM_HEADER_LOGO; ?>" id="logoImage" alt="" /></span></div>
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
				//echo "<ul id='ul_menulist'></ul>";
			?>
		</div>
<br><br>
<table align="center" width="700" border="0">
<tr>
	<td>
<?php
echo '<form name="survey" action="svy_qst_page.php?&surveyid='.$surveyid.'&creqid='.$creqid.'" method="post"><input type="hidden" name="carry" value="'.$carry.'">'.$withheld;
$x = 0;
	switch ($question[$x][Type])
	{
		case "1":								// Vertical radio buttons
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2">';
				$branchflag=false;
				$count = 0;
				while($choice = $result->fetch())
				{
					$choices[$count] = $choice->ctext;
					$target[$count] = $choice->tqid ? $choice->tqid : $qid + 1;
					if ($choice->tqid) $branchflag=true;
					$checked[$count] = $choice->defans ? ' checked' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$count++;
				}
				for ($z = 0 ; $z < $count ; $z++)
				{
					if ($branchflag) $question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'" onclick="javascript:setnext('.$target[$z].');"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td></tr>';
					else $question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td></tr>';
				}
				$question[$x][Html] .= '</table>';
			}
			print $question[$x][Html];
		break;
		case "2":								// Horizontal radio buttons
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>';
				$branchflag=false;
				$count = 0;
				while($choice = $result->fetch())
				{
					$choices[$count] = $choice->ctext;
					$target[$count] = $choice->tqid ? $choice->tqid : $qid + 1;
					if ($choice->tqid) $branchflag=true;
					$checked[$count] = $choice->defans ? ' checked' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$count++;
				}
				for ($z = 0 ; $z < $count ; $z++)
				{
					if ($branchflag) $question[$x][Html] .= '<td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'" onclick="javascript:setnext('.$target[$z].');"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
					else $question[$x][Html] .= '<td><input type="radio" name="q'.$question[$x][Num].'" value="'.$choices[$z].'"'.$checked[$z].'></td><td><span class="response">'.$choices[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
				}
				$question[$x][Html] .= '</td></tr></table>';
				}
			print $question[$x][Html];
		break;
		case "3":								// Horizontal checkbox buttons
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
				while($choice = $result->fetch())
				{
					$checked = $choice->defans ? ' checked' : '';
					$question[$x][Html] .= '<td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"'.$checked.'></td><td><span class="response">'.$choice->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
				}
				$question[$x][Html] .= '</tr></table>';
			}
			print $question[$x][Html];
		break;
		case "4":								// Vertical checkbox buttons
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2">';
				while($choice = $result->fetch())
				{
					$checked = $choice->defans ? ' checked' : '';
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="checkbox" name="q'.$question[$x][Num].'[]" value="'.$choice->ctext.'"'.$checked.'></td><td><span class="response">'.$choice->ctext.'</span></td></tr>';
				}
				$question[$x][Html] .= '</table>';
			}
			print $question[$x][Html];
		break;
		case "5":								// Dropdown select box
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'" onchange="javascript:setnext2(this.value);" class="selectstyle"><option value="" selected>Please Select</option>';
				$count = 0;
				$script = "var option = new Array();\nvar target = new Array();\n";
				while($choice = $result->fetch())
				{
					$checked = $choice->defans ? ' selected' : '';
					if (($choice->defans) && (!$defnext) && ($choice->tqid)) $defnext = 'document.survey.qid.value = '.$choice->tqid.';';
					$question[$x][Html] .= '<option value="'.$choice->ctext.'"'.$checked.'>'.$choice->ctext.'</option>';
					$script .= "option[".$count."] = '".(str_replace("'","\\'",$choice->ctext))."';\n";
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
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><input type="text" size="20" name="q'.$question[$x][Num].'" class="longtextbox" onkeypress=\'enforcenumeric(this, event)\'></td></tr></table>';
			print $question[$x][Html];
		break;
		case "10":								// Multi select box
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><select name="q'.$question[$x][Num].'[]" size="6" multiple class="selectstyle">';
				while($choice = $result->fetch())
				{
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
			$tests = '';
			$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;'.$question[$x][Text].'</span><br>';
			$query = "SELECT * FROM survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="formheaders">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$question[$x][Text].'</span><br><hr size="1" color="5Ba1E7" width="93%"><table border="0" cellspacing="0" cellpadding="2">';
				$y = 0;
				while($quest = $result->fetch())
				{
					$form_quest_text[$y] = $quest->qtext;
					$form_quest_id[$y] = $quest->qid;
					$form_quest_type[$y] = $quest->type;
					$form_quest_flags[$y] = $quest->flags;
					$y++;
				}
$last_qid = $quest->qid;
				for ($z = 0 ; $z < $y ; $z++)
				{
					$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td valign="top"><span class="question">'.$form_quest_text[$z].'</span></td><td>&nbsp;&nbsp;&nbsp;</td><td>';

					switch ($form_quest_type[$z])
					{
						case "21":				// Form Horizontal Radio Buttons
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$choice->count = 0;
								$test = '';
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								while($brightman = $result->fetch())
								{
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<td><div id="q'.$form_quest_id[$z].'_'.$choice->count.'"><input type="radio" name="q'.$form_quest_id[$z].'" value="'.$brightman->ctext.'"'.$checked.'></div></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
									if ($test) $test .= ' && (!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									else $test = '(!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									$choice->count++;
								}
								$question[$x][Html] .= '</tr></table>';
								if (($form_quest_flags[$z] & 2) && ($test)) $tests .= "\n".'if ('.$test.') status = false;';
							}
							else print 'Query failed';
						break;
						case "30":				// Form Vertical Radio Buttons
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{

								$choice->count = 0;
								$test = '';
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2">';
								while($brightman = $result->fetch())
								{
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<tr><td><div id="q'.$form_quest_id[$z].'_'.$choice->count.'"><input type="radio" name="q'.$form_quest_id[$z].'" value="'.$brightman->ctext.'"'.$checked.'></div></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td></tr>';
									if ($test) $test .= ' && (!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									else $test = '(!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									$choice->count++;
								}
								$question[$x][Html] .= '</table>';
								if (($form_quest_flags[$z] & 2) && ($test)) $tests .= "\n".'if ('.$test.') status = false;';
							}
							else print 'Query failed';
						break;
						case "22":				// Form Horizontal Check Boxes
							$WRAPAFTER = 4;
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$count = 0;
								$choice->count = 0;
								$test = '';
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr>';
								while($brightman = $result->fetch())
								{
									if ($count == $WRAPAFTER){
										$question[$x][Html] .= '</tr><tr>';
										$count = 0;
										}
									$count++;
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<td><div id="q'.$form_quest_id[$z].'_'.$choice->count.'"><input type="checkbox" name="q'.$form_quest_id[$z].'[]" value="'.$brightman->ctext.'"'.$checked.'></div></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td>';
									if ($test) $test .= ' && (!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									else $test = '(!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									$choice->count++;
								}
								for ($w = 0 ; $w < ($WRAPAFTER - $count) ; $w++)
								{
									$question[$x][Html] .= '<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>';
								}
								$question[$x][Html] .= '</tr></table>';
								if (($form_quest_flags[$z] & 2) && ($test)) $tests .= "\n".'if ('.$test.') status = false;';
							}
						break;
						case "29":				// Form Vertical Check Boxes
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$choice->count = 0;
								$test = '';
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2">';
								while($brightman = $result->fetch())
								{
									$checked = $brightman->defans ? ' checked' : '';
									$question[$x][Html] .= '<tr><td><div id="q'.$form_quest_id[$z].'_'.$choice->count.'"><input type="checkbox" name="q'.$form_quest_id[$z].'[]" value="'.$brightman->ctext.'"'.$checked.'></div></td><td><span class="response">'.$brightman->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;</td></tr>';
									if ($test) $test .= ' && (!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									else $test = '(!document.getElementById("q'.$form_quest_id[$z].'_'.$choice->count.'").firstChild.checked)';
									$choice->count++;
								}
								$question[$x][Html] .= '</table>';
								if (($form_quest_flags[$z] & 2) && ($test)) $tests .= "\n".'if ('.$test.') status = false;';
							}
							else print 'Query failed';
						break;
						case "23":				// Form Drop-down Menu select
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY qid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><select name="q'.$form_quest_id[$z].'" class="selectstyle"><option value="" selected>Please Select</option>';
								while($brightman = $result->fetch())
								{
									$checked = $brightman->defans ? ' selected' : '';
									$question[$x][Html] .= '<option value="'.$brightman->ctext.'"'.$checked.'>'.$brightman->ctext.'</option>';
								}
								$question[$x][Html] .= '</select></td></tr></table>';
								if ($form_quest_flags[$z] & 2) $tests .= "\n".'if (document.survey.q'.$form_quest_id[$z].'.value == "") status = false;';
							}
						break;
						case "24":				// Form Standard text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" name="q'.$form_quest_id[$z].'" size="40" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
							if ($form_quest_flags[$z] & 2) $tests .= "\n".'if (document.survey.q'.$form_quest_id[$z].'.value == "") status = false;';
						break;
						case "25":				// Form Free text area
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<textarea cols="42" rows="10" name="q'.$form_quest_id[$z].'" class="longtextarea"></textarea>';
							$question[$x][Html] .= '</td></tr></table>';
							if ($form_quest_flags[$z] & 2) $tests .= "\n".'if (document.survey.q'.$form_quest_id[$z].'.value == "") status = false;';
						break;
						case "26":				// Form small text field for numeric value
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="text" size="20" name="q'.$form_quest_id[$z].'" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
							if ($form_quest_flags[$z] & 2) $tests .= "\n".'if (document.survey.q'.$form_quest_id[$z].'.value == "") status = false;';
						break;
						case "27":				// Form Multi select dropdown
							$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$form_quest_id[$z]." ORDER BY cid";
							$result = new swphpDatabaseQuery($query,'sw_systemdb');
							if($result)
							{
								$choice->count = 0;
								$test = '';
								$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td><div id="q'.$form_quest_id[$z].'_0s"><select name="q'.$form_quest_id[$z].'[]" size="6" multiple class="selectstyle">';
								while($brightman = $result->fetch())
								{
									$question[$x][Html] .= '<option value="'.$brightman->ctext.'">'.$brightman->ctext.'</option>';
									if ($test) $test .= ' && (!document.getElementById("q'.$form_quest_id[$z].'_0s").firstChild.childNodes['.$choice->count.'].selected)';
									else $test = '(!document.getElementById("q'.$form_quest_id[$z].'_0s").firstChild.childNodes['.$choice->count.'].selected)';
									$choice->count++;
								}
								$question[$x][Html] .= '</select></div></td></tr></table>';
								if (($form_quest_flags[$z] & 2) && ($test)) $tests .= "\n".'if ('.$test.') status = false;';
							}
						break;
						case "28":				// Form password text box
							$question[$x][Html] .= '<table border="0" cellspacing="0" cellpadding="2"><tr><td>';
							$question[$x][Html] .= '<input type="password" name="q'.$form_quest_id[$z].'" size="30" class="longtextbox">';
							$question[$x][Html] .= '</td></tr></table>';
							if ($form_quest_flags[$z] & 2) $tests .= "\n".'if (document.survey.q'.$form_quest_id[$z].'.value == "") status = false;';
						break;
						}
					$question[$x][Html] .= '</td></tr>';
					}
				$question[$x][Html] .= '</table>';
				}
			print $question[$x][Html];
		break;
		case "40":								// Marix question Message (checkbox or radio variety)
			$query = "SELECT * FROM survey_qc WHERE sid=$surveyid and qid =".$question[$x][Num]." ORDER BY cid";
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			if($result)
			{
				$question[$x][Html] = '<br><span class="question">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$question[$x][Text].'</span><br><hr size="1" color="5Ba1E7" width="93%"><table border="0" cellspacing="0" cellpadding="2"><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;</td>';
				$y = 0;
				while($choice = $result->fetch())
				{
					$question[$x][Html] .= '<td><span class="matrixhead">'.$choice->ctext.'</span></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
					$multichoice[$y] = $choice->ctext;
					$y++;
				}
				$question[$x][Html] .= '</tr>';
				$query = "SELECT * FROM survey_q WHERE sid=$surveyid and pqid =".$question[$x][Num]." ORDER BY qid";
				$result = new swphpDatabaseQuery($query,'sw_systemdb');
				if($result)
				{
					while($brightman = $result->fetch())
					{
						$question[$x][Html] .= '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><span class="matrixrows">'.$brightman->qtext.'&nbsp;&nbsp;</span></td>';
						for ($z = 0 ; $z < $y ; $z++)
						{
							if ($brightman->type == "41") $question[$x][Html] .= '<td align="center"><input type="radio" name="q'.$brightman->qid.'" value="'.$multichoice[$z].'"></td><td>&nbsp;&nbsp;&nbsp;</td>';
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
if ($tests) $submitbutton = '<a href="javascript:validate2();"><b>Next</b></a>';
print '<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<center>'.$submitbutton.'</center><br><br><input type="hidden" value="'.$next_qid.'" name="qid"></form>';
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
<?php
if ($tests) { ?>
function validate2(){
	var status = true;
	<?php echo $tests?>

	if (status) document.survey.submit();
	else alert("Sorry: A required answer is missing.")
	}
<?php } ?>
//-->
</script>
</div>
</body>
</html>

<?php

swCloseTemporarySession();
?>

