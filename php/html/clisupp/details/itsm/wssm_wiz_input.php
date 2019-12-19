<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	//-- Include our standard include functions page
	include_once("global.settings.php");
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');

	//	error_reporting(E_ERROR | E_PARSE );
	$sessid = gv('sessid');
	
	if(empty($sessid))
		$sessid = gv('sessionid');

	if((!regex_match("/^[a-zA-Z0-9]{14}-[a-zA-Z0-9]{4,5}-[a-zA-Z0-9]{8}$/",$sessid)) && (!regex_match("/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}$/",$sessid)))
	{
		//-- call not found ?? in theory should never happen
		?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Call Search Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br></br>
					<center>
					<span class="error">
						A submitted variable was identified as a possible security threat.<br> 
						Please contact your system Administrator.
					</span>
					</center>
				</body>
		</html>
		<?php 		exit;
	}
	//-- Construct a new active page session
	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession())
	{
	?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br><br>
					<center>
					<span class="error">
						The Supportworks record could not be found<br>
						Please contact your system administrator.
					</span>
					</center>
				</body>
		</html>
	<?php 		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

	$callref = gv('fk_callref');
	if($callref=="")	$callref = gv('FK_CALLREF');
	if(!regex_match("/^[0-9]+$/",$callref))
	{
		//-- call not found ?? in theory should never happen
		?>
		<html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Call Search Failure</title>
					<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
			</head>
				<body>
					<br></br>
					<center>
					<span class="error">
						A submitted variable was identified as a possible security threat.<br> 
						Please contact your system Administrator.
					</span>
					</center>
				</body>
		</html>
		<?php 		exit;
	}


		//-- create our database connects to swdata and systemdb
	$swconn = new CSwDbConnection();
	$swconn->Connect(swdsn(), swuid(), swpwd());

	//-- try get call from cache
	$swconn->Query("SELECT * FROM itsm_oc_wiz where fk_callref = ".pfs($callref));
	$rsCall = $swconn->CreateRecordSet();
	if((!$rsCall)||($rsCall->eof))
	{
		?>
			<html>
				<head>
					<meta http-equiv="Pragma" content="no-cache">
					<meta http-equiv="Expires" content="-1">
					<title>Support-Works Search Failure</title>
						<link rel="stylesheet" href="sheets/maincss.css" type="text/css">
				</head>
					<body>
						<br><br>
						<center>
						<span class="error">
							The Supportworks record could not be found<br>
							Please contact your system administrator.
						</span>
						</center>
					</body>
			</html>
		<?php 	}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" >
<title><?php echo swcallref_str($callref);?>Selfservice Wizard Input</title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />

<script src="jscript/index.js"></script>
</head>

<!-- ES F0109085 -->
<body class="activepagebody">
<div id="activepagecontentColumn" >
	<div id="formArea" style="width:100%;">
			<div id="swtPageTop"><img src="img/structure/box_header_left.gif" id="swtImgTopLeft" /></div>
			<div id="swtInfoBody">
					<div class="sectionHead">
							<table class="sectionTitle">
									<tr>
										<td class="titleCell" noWrap><h1><center><?php echo swcallref_str($callref)." Input for Wizard :". $rsCall->xf('fk_wiz')?><center></h1></td>
										<td class="endCell"></td>
									</tr>
							</table>	
					</div>
			</div>
	</div>
</div>						

<style>
		.stage
		{
			font-weight:bold;
			font-size:14px;
			padding: 5px 0 0 5px;
		}
		.wssm_question
		{
			font-weight:bold;
			font-size:12px;
			padding: 5px 0 0 5px;
		}
		.wssm_question_answer
		{
			font-size:12px;
			padding: 5px 0 0 5px;
		}
</style>

<?php 	$fk_wiz_stage_title = "";
	while(!$rsCall->eof)
	{
		if($rsCall->f('fk_wiz_stage_title')!=$fk_wiz_stage_title)
		{
			echo "<div class='stage'>Stage: ". $rsCall->xf('fk_wiz_stage_title')."</div><br><br>";
			$fk_wiz_stage_title = $rsCall->f('fk_wiz_stage_title');
		}
		$strValue = $rsCall->xf('question_ans');
		$strBinding = $rsCall->xf('binding');
		if($strBinding=="opencall.probcode")
			$strValue = common_convert_field_value("probcode",$strValue,"");
		echo "<span class='wssm_question'>".$rsCall->f('question')."</span><br>";
		echo "<span class='wssm_question_answer'>".SwConvertDateTimeInText(nl2br($strValue))."</span><br>";
		echo "<br>";
		$rsCall->movenext();
	}
?>

</body>
</html>