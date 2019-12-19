<?php 
//error_reporting(E_ALL);

//--
//-- uses feedback on swdata
session_start();
$_SESSION['portalmode'] = "FATCLIENT";

include('stdinclude.php');
include('itsm_default/xmlmc/common.php');
include('itsm_default/xmlmc/classknowledgebase.php');
include_once("itsm_default/kb.global.settings.php");


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

swdti_load($_SESSION['current_dd']);

//-- check if doc is on swdata
$swkb = new CSwDbConnection;
$swkbalt = new CSwDbConnection;

//-- Connect to our swdata
if(!$swkb->SwDataConnect())
{
	print "Unable to connect to the Supportworks Database. Please contact your Administrator.";
	exit;
}
$swkbalt->SwDataConnect();

//-- select it from kbase
$syskb = new CSwKnowldgeBaseAccess;
$docref = gv('docref');

$boolLoadAgain = false;
if(!$swkb->Query("SELECT * FROM swkb_articles where docref = '".pfs($docref)."'"))
{
	$boolLoadAgain = true;
}
else
{
	//-- fetch kbase info
	if(!$swkb->Fetch("kbase"))
		$boolLoadAgain = true;
}

if($boolLoadAgain)
{
	//-- Connect to our knowledgebase
	//-- get article from sys
	$arr_catalogs = Array();

	$syskb->ConnectToKbApi($_SESSION['server_name'],$_SESSION['connector_instance'],false);
	$syskb->ListKnowledgeBaseCatalogs($arr_catalogs);

	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("docRef",$docref);
	$strServer = $_SESSION['server_name'];
	if($xmlmc->Invoke("knowledgebase","documentGetInfo",$strServer))
	{
		$arrValues = Array();
		$arrValues["docref"]=$docref;
		$arrValues["title"]= lang_encode_from_utf($xmlmc->GetParam("title"));
		$arrValues["problem"]= lang_encode_from_utf($xmlmc->GetParam("problem"));//$kbase_problem;
		$arrValues["solution"]= lang_encode_from_utf($xmlmc->GetParam("solution"));//$kbase_solution;
		$arrValues["docdatex"]= lang_encode_from_utf(_iso_to_epoch($xmlmc->GetParam("docDate")));
		$arrValues["sourcepath"]= lang_encode_from_utf($xmlmc->GetParam("docPath"));//$kbase_sourcepath;
		$arrValues["author"]= lang_encode_from_utf($xmlmc->GetParam("author"));//$kbase_author;
		$arrValues["catalog"]= lang_encode_from_utf($xmlmc->GetParam("catalogId"));//$kbase_catalog;
		$arrValues["docstatus"]= lang_encode_from_utf($xmlmc->GetParam("docStatus"));//$kbase_docstatus;
		$arrValues["docflags"]= lang_encode_from_utf($xmlmc->GetParam("docVisibleToCustomers"));//$kbase_docflags;
		$arrValues["callref"]= lang_encode_from_utf($xmlmc->GetParam("callref"));//$kbase_callref;
		$arrValues["callprobcode"]= lang_encode_from_utf($xmlmc->GetParam("callProbCode"));//$kbase_callprobcode;
		$arrValues["profiledesc"]= lang_encode_from_utf(FormatProblemCode($xmlmc->GetParam("callProbCode")));
		$arrValues["keywords"]= lang_encode_from_utf($xmlmc->GetParam("keywords"));//$kbase_keywords;
		$arrValues["template"]= lang_encode_from_utf($xmlmc->GetParam("template"));//$kbase_template;
		$arrValues["timesaccessed"]= 0;

		$strXML = _xmlmc_insertrecord("swkb_articles", $arrValues,$_SESSION['connector_instance']);
	}
	else
	{
		print "Unable to query the Knowledgebase Database. Please contact your Administrator.";
		exit;
	}
}

//--
//--
//-- Get child related document details
$docref = gv('docref');
if(!$swkb->Query("SELECT * FROM swkb_related where docref = '".pfs($docref)."'"))
{
	print "Unable to query the KB relations table. Please contact your Administrator.";
	exit;
}

//-- get related articles
$strRelatedArts = "";
while($swkb->Fetch("kbrel"))
{
	if($swkbalt->Query("SELECT title FROM swkb_articles where docref = '".pfs($kbrel_relateddocref)."'"))
	{
		if($swkbalt->Fetch("kbdoc"))
		{
			if($strRelatedArts != "")$strRelatedArts .= "<br>";	
			$strRelatedArts .= "<a href='swkbase.php?sessid=".$sessid."&docref=".$kbrel_relateddocref."' target='_self'>(".$kbrel_relateddocref.") ". $kbdoc_title ."</a>";
		}
	}
}

//-- get related parents
if(!$swkb->Query("SELECT * FROM swkb_related where relateddocref = '".pfs($docref)."'"))
{
	print "Unable to query the KB relations table. Please contact your Administrator.";
	exit;
}

//-- get related articles
while($swkb->Fetch("kbrel"))
{
	if($swkbalt->Query("SELECT title FROM swkb_articles where docref = '".pfs($kbrel_docref)."'"))
	{
		if($swkbalt->Fetch("kbdoc"))
		{
			if($strRelatedArts != "")$strRelatedArts .= "<br>";	
			$strRelatedArts .= "<a href='swkbase.php?sessid=".$sessid."&docref=".$kbrel_docref."' target='_self'>(".$kbrel_docref.") ". $kbdoc_title ."</a>";
		}
	}
}


//-- applies to
$strAppliesto = "";
if($swkb->Query("SELECT type_display FROM ci_type_relkb where kb_docref = '".pfs($docref)."'"))
{
	while($swkb->Fetch("kbapp"))
	{
		if($strAppliesto != "")$strAppliesto .= "<br>";	
		$strAppliesto .= $kbapp_type_display;
	}
}

//-- check if subscribed
$swkb->Query("SELECT count(*) as counter FROM swkb_subscription where fk_docref = '".pfs($docref)."' and subscriberid ='".pfs($_SESSION['wc_analystid'])."' and subscribertype='ANALYST'");
$intSubscribed = 0;
if($swkb->Fetch("kbsub"))
{
	$intSubscribed = $kbsub_counter;
}
$strSubscribed = ($intSubscribed==0)?"":"checked";

//-- update accesscount
$arrValues = Array();
$arrValues["docref"]=$_REQUEST['docref'];
$arrValues["timesaccessed"]= $kbase_timesaccessed + 1;
$strXML = _xmlmc_updaterecord("swkb_articles", $arrValues,$sessid);

//-- set defaults
$strCallrefLink="";
if($kbase_author=="")$kbase_author="N/A";
if($kbase_callref!="")
{
	//--
	$kbase_callref = preg_replace("/[^0-9]/", '', $kbase_callref);  
	if(is_numeric($kbase_callref))
	{
		$strDisplayValue =swdti_formatvalue("opencall.callref",$kbase_callref);
	}
	
	$strCallrefLink = " - Created From Request :";
	$strCallrefLink .= " <a href='hsl:calldetails?callref=".$kbase_callref."'>".$strDisplayValue."</a>";
}



?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Knowledgebase Document -<?php echo $docref; ?></title>

<!-- ES F0109085 -->
<link href="itsm_default/css/<?php echo $KBcssFile;?>" rel="stylesheet" type="text/css" />


	<script>
		function onload_events()
		{
		}

		var currentSpanID = "doc_problem";
		function load_section_detail(oSpan)
		{
			if(oSpan.className == "sectiontitle-hi")
			{
				oSpan.className = "sectiontitle";
				var arrEle = document.getElementsByName(oSpan.id);
				arrEle[1].style.display='block';

				//-- hide current
				var arrEle = document.getElementsByName(currentSpanID);
				arrEle[0].className = "sectiontitle-lo";
				arrEle[1].style.display='none';


				currentSpanID = oSpan.id
			}		
		}

		function highlight_title(oSpan)
		{
			if(oSpan.className == "sectiontitle-lo")
			{
				oSpan.className = "sectiontitle-hi";
			}
		}

		function lolight_title(oSpan)
		{
			if(oSpan.className == "sectiontitle-hi")
			{
				oSpan.className = "sectiontitle-lo";
			}
		}

		function check_comments()
		{
			var eQ = document.getElementById("idqrfc");
			var eC = document.getElementById("idqcomments");
			if(eQ.checked && eC.value=="")
			{
				alert("You have request this article be changed, but have not provided any comments. Please provide details of what you would like to see changed.");
				return false;
			}
			return true;
		}

	</script>
</head>

<body onLoad="window.focus();">

<!-- break into sections

	1. title, author, date, 

	2. problem

	3. solution

	4. related articles

	5. feedback

-->


<div class='header'>
Article ID : <?php echo $kbase_docref; ?> - Created On : <?php echo SwFormatDateTimeColumn("swkb_articles.docdatex",$kbase_docdatex); ?> - Author : <?php echo $kbase_author ." ".$strCallrefLink;?> 
</div>

<p>
<div class="title">
<?php echo $kbase_title; ?>
</div>
</p>

<p>
<div>
	<div class='sectiontitle'>PROBLEM</div>
	<div class='sectionline'></div>
	<div class='sectiondata'>
		<p>

			<?php 			// F0103835: Check if problem text is in html form before using nl2br function
			if(strpos($kbase_problem,"<html>")===false && strpos($kbase_problem,"<HTML>")===false)
			{
				echo nl2br($kbase_problem);
			}
			else
			{
				echo $kbase_problem;
			}
			?>		
		</p>
	</div>
</div>
</p>
<p>
<div>
	<div class='sectiontitle'>SOLUTION</div>
	<div class='sectionline'></div>	
	<div class='sectiondata'>
		<p>
			<?php 			// F0103835: Check if solution text is in html form before using nl2br function
			if(strpos($kbase_solution,"<html>")===false && strpos($kbase_solution,"<HTML>")===false)
			{
				echo embedYoutube(nl2br($kbase_solution)); 
			}
			else
			{
				echo $kbase_solution;
			}
			?>
		</p>
	</div>
</div>
</p>

<div class="keywords">
<table>
	<tr>
		<td>
			<b>Applies To :</b>
		</td>
		<td>
			<?php echo $strAppliesto; ?>
		</td>
	</tr>

	<tr>
		<td>
			<b>Category :</b>
		</td>
		<td>
			<?php echo $kbase_profiledesc; ?>
		</td>
	</tr>
	<tr>
		<td>
			<b>Keywords :</b>
		</td>
		<td>
			<?php echo $kbase_keywords; ?>
		</td>
	</tr>
	<tr>
		<td valign='top'>
			<b>Related Articles :</b>
		</td>
		<td>
			<?php echo $strRelatedArts; ?>
		</td>
	</tr>

</table>
</div>

<br>
<form name='frmFeedback' action="swkbfeedback.enhanced.php" method="post" target="if_feedback">
<input type='hidden' name='docref' value='<?php echo $_REQUEST['docref'];?>'>
<input type='hidden' name='sessid' value='<?php echo $_REQUEST['sessid'];?>'>
<div class='feedback'>
	
	<div class='feedback-title'>Provide feedback on this information</div>
	<br><br>

	<div class='feedback-question'>Did this article help solve your problem?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' name='qsolve' value='1'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qsolve' value='0'></td><td>No</td></tr>
			<tr><td><input type='radio' name='qsolve' value='2'></td><td>I don't know</td></tr>
		</table>
	</div>
	<div class='feedback-question'>Was this article relevant?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' name='qrelevant' value='1'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qrelevant' value='0'></td><td>No</td></tr>
		</table>
	</div>
	<div class='feedback-question'>Would you like to receive notifications when this article is modified?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' id='idsubscribe' value="1" <?php echo $strSubscribed?> name='qsubscribe'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qsubscribe' value='0'></td><td>No</td></tr>
		</table>
	</div>	
	<div class='feedback-question'>Would you like this article to be changed?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' id='idqrfc' name='qrfc' value='1'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qrfc' value='0'></td><td>No</td></tr>
		</table>
	</div>
	<div class='feedback-question'>Please provide any other comments to help improve this article:-</div>
	<div class='feedback-answer'>
		<textarea style='width:500px;height:100px;' id='idqcomments' name='qcomments'></textarea>
	</div>
	<input type='submit' onclick="return check_comments();" value='Submit'>
</div>
</form>
<iframe name='if_feedback' style='display:none'></iframe>

</body>
</html>
