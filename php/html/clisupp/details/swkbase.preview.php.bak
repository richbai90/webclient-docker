<?php 
//-- include any app specific config file - for example itsm swkbase.config.php will use swbase.enhanced.php then exit so the below is not executed
@include('swkbase.config.php');

//--

include('stdinclude.php');
include('itsm_default/xmlmc/classdatabaseaccess.php');
include_once("itsm/kb.global.settings.php");

//-- labelling anf formatting options
include('itsm_default/xmlmc/classknowledgebase.php');
swdti_load("Default");
 
//-- Create a new KnowledgeBase access class
$kb = new CSwKnowldgeBaseAccess;
$kbrel = new CSwKnowldgeBaseAccess;

//-- Connect to our knowledgebase
if(!$kb->SwKbCacheConnect())
{
	print "Unable to connect to the Knowledgebase Database. Please contact your Administrator.";
	exit;
}
else
{
	$kbrel->SwKbCacheConnect();
}

//-- get related areticles
if(!$kb->Query("SELECT * FROM kbrelated where DocRef = '".pfs($docref)."'"))
{
	print "Unable to query the Knowledgebase Database. Please contact your Administrator.";
	exit;
}

$strRelatedArts = "";
while($kb->Fetch("kbrel"))
{
	if($kbrel->Query("SELECT title FROM kbdocuments where DocRef = '".pfs($kbrel_relateddocref)."'"))
	{
		$kbrel->Fetch("kbdoc");
		if($strRelatedArts != "")$strRelatedArts .= "<br>";	
		$strRelatedArts .= "<a href='swkbase.php?docref=".$kbrel_relateddocref."' target='_self'>(".$kbrel_relateddocref.") ". $kbdoc_title ."</a>";
	}
}


//-- Get the document details
$docref = gv('docref');
if(!$kb->Query("SELECT * FROM kbdocuments where DocRef = '".pfs($docref)."'"))
{
	print "Unable to query the Knowledgebase Database. Please contact your Administrator.";
	exit;
}
$kb->Fetch("kbase");

//-- set defaults
if($kbase_author=="")$kbase_author="N/A";
if($kbase_callref=="")$kbase_callref="N/A";




?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Knowledgebase Document -<?php echo htmlentities($docref,ENT_QUOTES,"UTF-8"); ?></title>

<!-- ES F0109085 -->
<link href="itsm/css/<?php echo $KBcssFile;?>" rel="stylesheet" type="text/css" />

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
Article ID : <?php echo $kbase_docref; ?> - Created On : <?php echo substr($kbase_docdate,0,10); ?> - Author : <?php echo $kbase_author; ?> - Created From Call : <?php echo swdti_formatvalue("opencall.callref",$kbase_callref);?>
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
			<?php echo nl2br($kbase_problem); ?>
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
		<?php echo embedYoutube(nl2br($kbase_solution)); ?>
		</p>
	</div>
</div>
</p>

<div class="keywords">
<table>
	<tr>
		<td>
			<b>Category :</b>
		</td>
		<td>
			<?php echo $kbase_callprobcode; ?>
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
	<!--
	<tr>
		<td valign='top'>
			<b>Related Articles :</b>
		</td>
		<td>
			<?php  echo $strRelatedArts; ?>
		</td>
	</tr>
	-->
</table>
</div>
<!--
<br>
<form name='frmFeedback' action="kbasefeedback.php" method="post" target="if_feedback">
<div class='feedback'>

	<div class='feedback-title'>Provide feedback on this information</div>
	<br><br>

	<div class='feedback-question'>Did this article help solve your problem?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' name='qsolve' value='yes'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qsolve' value='no'></td><td>No</td></tr>
			<tr><td><input type='radio' name='qsolve' value='neither'></td><td>I don't know</td></tr>
		</table>
	</div>
	<div class='feedback-question'>Was this article relevant?</div>
	<div class='feedback-answer'>
		<table>
			<tr><td><input type='radio' name='qsolve' value='yes'></td><td>Yes</td></tr>
			<tr><td><input type='radio' name='qsolve' value='no'></td><td>No</td></tr>
		</table>
	</div>
	<div class='feedback-question'>Please provide any other comments to help improve this article:-</div>
	<div class='feedback-answer'>
		<textarea style='width:500px;height:100px;' name='qcomments'></textarea>
	</div>

	<input type='submit' value='Submit'>
</div>
</form>
<iframe name='if_feedback' style='display:none'></iframe>
-->
</body>
</html>
