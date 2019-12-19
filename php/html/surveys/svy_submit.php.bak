<?php

include('stdinclude.php');
swphpGlobaliseRequestVars();
swCreateTemporarySession();

$id = gv("id");
	
//-- fetch question
$result = new swphpDatabaseQuery($query,'sw_systemdb');
$details = $result->fetch();
	
	

# This is just to get hold of survey data.
$syd=false;
$query = "SELECT * FROM survey_r WHERE srid='$id' AND cpltdate='0000-00-00 00:00:00' LIMIT 1";
$result = new swphpDatabaseQuery($query,'sw_systemdb');
$details = $result->fetch();
if($details)
{
	$syd = $details->sid;
}

if ($syd) 
{
	$query = "UPDATE survey_r SET status='2', cpltdate='20030616' WHERE srid='$id' AND status='1' LIMIT 1";
	$result = new swphpDatabaseQuery($query,'sw_systemdb');	
	
#	print $query.'<br><br>';
	
	foreach ($HTTP_POST_VARS as $key => $value){
		if (($key == "Submit") && ($value == "Submit")) continue;
		if ((!$key) || (!$value)) continue;
		if (is_array($value)){
			foreach ($value as $val){
				$query = "INSERT INTO survey_ra (srid, sid, qid, value) VALUES ('$id','$syd','".(str_replace("q", "", $key))."','$val')";
#				print $query.'<br>';
				$result = new swphpDatabaseQuery($query,'sw_systemdb');
				}
			}
		else {
			if ($id == $value) continue;
			$query = "INSERT INTO survey_ra (srid, sid, qid, value) VALUES ('$id','$syd','".(str_replace("q", "", $key))."','$value')";
#			print $query.'<br>';
			$result = new swphpDatabaseQuery($query,'sw_systemdb');
			}
		}
	
	$strdate = date('Y-m-d H:i:s');
	$query = 'UPDATE survey_r SET cpltdate="'.$strdate.'" WHERE srid="'.$id.'"';
	$result = new swphpDatabaseQuery($query,'sw_systemdb');
	$message = 'Thank you for your time';
	}
else {
	$message = 'Sorry, you have already completed this survey';
	}

	$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
	if (file_exists("customisation/override.php")) include('customisation/override.php'); //-- any overriding image paths (for logos)

?>
<html>
<head>
	<title>Survey Thanks</title>
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
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
  <tr> 
    <td width="22" bgcolor="#ccd4ee"><img src="images/space.gif" width="22" height="25"></td>
    <td bgcolor="#ccd4ee" align="left" valign="middle" class="company"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="left" class="company"><b>Thanks!</b></td><td align="right"><?php echo $nav?></td></tr></table></td>
  </tr>
  <tr>
  	<td colspan="2" bgcolor="#336699"><img src="images/space.gif" width="2" height="1" alt="" border="0"></td>
  </tr>
</table>

<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $message?>
<br><br>
</div>
</body>
</html>
<?php
	swCloseTemporarySession();
?>



