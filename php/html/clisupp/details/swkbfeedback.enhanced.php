<?php session_start();
$_SESSION['portalmode'] = "FATCLIENT";

include('stdinclude.php');
include('itsm_default/xmlmc/common.php');

include_once('itsm_default/xmlmc/classactivepagesession.php');
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
						There has been a session authentication error<br>
						Please contact your system administrator.
					</span>
				</center>
			</body>
	</html>
<?php 	exit;
}


$swkb = new CSwDbConnection;
$swcache = new CSwDbConnection;

//-- Connect to our swdata
if(!$swkb->SwDataConnect())
{
	$msg= "Unable to connect to the Supportworks Database. Please contact your Administrator.";

}
else
{
	//-- analystid
	if($swcache->SwCacheConnect())
	{
		if($swcache->Query("select analystid,analystname from swsessions where sessionid = '".pfs(gv('sessid'))."'"))
		{
			$swcache->fetch("sws");
		}
	}
	$arrValues = Array();
	$arrValues["fk_docref"]=$_REQUEST['docref'];
	$arrValues["comments"]=$_REQUEST['qcomments'];
	$arrValues["accessdatex"]=time();
	$arrValues["flg_raiserfc"]=$_REQUEST['qrfc'];
	$arrValues["fixedproblem"]=$_REQUEST['qsolve'];
	$arrValues["wasrelevant"]=$_REQUEST['qrelevant'];
	$arrValues["fk_analystid"]=$sws_analystid;
	$arrValues["personsname"]=$sws_analystname;
	if(($arrValues["comments"]=="" && $arrValues["fixedproblem"]=="" && $arrValues["wasrelevant"]=="" && $_REQUEST["qsubscribe"]==""))
	{
		$msg = "Please provide feedback information before trying to submit.";	
	}
	else
	{
		$boolInserted = _xmlmc_insertrecord("swkb_feedback", $arrValues,$_REQUEST['sessid']);
		if (!$boolInserted) 
		{
			$msg = "The system may not have submitted this feedback as the process returned back as invalid. Please contact your Administrator.";
		}
		else
		{
			//-- check if we need to add or remove subscription
			//-- create or delete sub
			if($_REQUEST["qsubscribe"]!="")
			{
				
				//-- remove as we will recreate if need be						
				$swkb->Query("delete from swkb_subscription where fk_docref = '".pfs(gv('docref'))."' and subscriberid='".pfs($sws_analystid)."' and subscribertype='ANALYST'");
				//-- create
				if($_REQUEST["qsubscribe"]=="1")
				{			
						$arrValues = Array();
						$arrValues["fk_docref"]=$_REQUEST['docref'];
						$arrValues["subscriberid"]=$sws_analystid;
						$arrValues["subscribertype"]="ANALYST";
						$arrValues["subscribername"]=$sws_analystname;
						 _xmlmc_insertrecord("swkb_subscription", $arrValues,$_REQUEST['sessid']);
				}
			}

			$msg = "Thankyou for providing feedback. Your feedback has been submitted to the Knowledgebase managers for review.";
		}
  
		//print_r($dom);
	}

}
?>
<script>
	alert("<?php echo $msg;?>");
</script>
