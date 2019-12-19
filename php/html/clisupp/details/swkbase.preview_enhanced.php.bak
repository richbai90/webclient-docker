<?php 
//error_reporting(E_ALL);

//--
//-- uses feedback on swdata
session_start();
$_SESSION['portalmode'] = "FATCLIENT";

include('stdinclude.php');
include('itsm_default/xmlmc/common.php');
include('itsm_default/xmlmc/classknowledgebase.php');
include_once("itsm/kb.global.settings.php");

swdti_load("ITSM");

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
//-- analystid
if($syskb->SwCacheConnect())
{
	if($syskb->Query("select analystid from swsessions where sessionid = '".pfs(gv('sessid'))."'"))
	{
		if(!$syskb->fetch("sws"))
		{
			echo "The system does not recognise your session. Please contact your Administrator.";
			exit;
		}
	}
}

if(!$swkb->Query("SELECT setting_value FROM sw_settings where PK_SETTING = 'KNOWLEDGE.PREVIEW.ENABLED'"))
{
	//-- Query unsuccessful 
}
else
{
	//-- Query successful, but no rows found
	//-- fetch kbase info
	if($swkb->Fetch("rs"))
	{
		if($rs_setting_value=="False")
		{
			print "Knowledegbase Preview functionality is disabled. Please contact your Supportworks Administrator.";
			exit;
		}
	}
}


$boolLoadAgain = false;
if(!$swkb->Query("SELECT * FROM swkb_articles where docref = '".pfs($docref)."'"))
{
	//-- Query unsuccessful 
	$boolLoadAgain = true;
}
else
{
	//-- Query successful, but no rows found
	//-- fetch kbase info
	if(!$swkb->Fetch("kbase"))
		$boolLoadAgain = true;
}

//-- load from alternate db
if($boolLoadAgain)
{
	$boolLoadAgain = false;
	//-- Connect to our knowledgebase
	if(!$syskb->SwKbCacheConnect())
	{
		print "Unable to connect to the Knowledgebase Database. Please contact your Administrator.";
		exit;
	}

	//-- get article from sys
	$arr_catalogs = Array();
	if($syskb->Query("SELECT * FROM kbcatalogs"))
	{
		while($syskb->Fetch('cats'))
		{
			$arr_catalogs[$cats_catalogid] = $cats_catalogname;
		}
	}


	//-- get article from sys
	if(!$syskb->Query("SELECT * FROM kbdocuments where DocRef = '".pfs($docref)."'"))
	{
		print "Unable to query the Knowledgebase Database. Please contact your Administrator.";
		exit;
	}

	//-- copy record into swdata
	if($syskb->Fetch("kbase"))
	{
		//-- update accesscount
		$arrValues = Array();
		$arrValues["docref"]=$_REQUEST['docref'];
		$arrValues["title"]= $kbase_title;
		$arrValues["problem"]= $kbase_problem;
		$arrValues["solution"]= $kbase_solution;
		$arrValues["docdate"]= $kbase_docdate;
		$arrValues["docdatex"]= strtotime($kbase_docdate);
		$arrValues["sourcepath"]= $kbase_sourcepath;
		$arrValues["author"]= $kbase_author;
		$arrValues["catalog"]= $kbase_catalog;
		$arrValues["catalogname"]= $arr_catalogs[$kbase_catalog];
		$arrValues["docstatus"]= $kbase_docstatus;
		$arrValues["docflags"]= $kbase_docflags;
		$arrValues["callref"]= $kbase_callref;
		$arrValues["callprobcode"]= $kbase_callprobcode;		
		$arrValues["profiledesc"]= FormatProblemCode($kbase_callprobcode);
		$arrValues["keywords"]= $kbase_keywords;
		$arrValues["template"]= $kbase_template;
		$arrValues["timesaccessed"]= 0;
		$strXML = _xmlmc_insertrecord("swkb_articles", $arrValues,$sessid);
	}
	else
	{
		$boolLoadAgain = true;
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
$swkb->Query("SELECT count(*) as counter FROM swkb_subscription where fk_docref = '".pfs($docref)."' and subscriberid ='".pfs($sws_analystid)."' and subscribertype='ANALYST'");
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
<title>Knowledgebase Document -<?php echo htmlentities($docref); ?></title>

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
<?php if($boolLoadAgain)
{
 echo "Article ID : ".htmlentities($docref,ENT_QUOTES,'UTF-8');
}
else
{
 echo "Article ID : ".htmlentities($kbase_docref,ENT_QUOTES,'UTF-8')." - Created On : ".substr($kbase_docdate,0,10)." - Author : ".htmlentities($kbase_author ,ENT_QUOTES,'UTF-8')." ".$strCallrefLink;
}
?>

</div>

<p>
<div class="title">
<?php echo htmlentities($kbase_title,ENT_QUOTES,'UTF-8'); ?>
</div>
</p>

<p>
<div>
	<div class='sectiontitle'>PROBLEM</div>
	<div class='sectionline'></div>
	<div class='sectiondata'>
		<p>
			<?php 			//-- 06.2011 - Google Chrome will not permit loading of frames with content from an alternative domain, hence if using chrome
			//-- the iframe is stripped out and replaced with a placeholder indicating the location of the iframe
			if(strpos(strtolower($_SERVER['HTTP_USER_AGENT']),"chrome")>0)
			{
				$strVideoPlaceholder = '<div style="width:640px;height:390px;background-color:black;color:white;">Your content will appear here but cannot be displayed in preview mode in this browser</div>';
				echo preg_replace("/(<iframe[^<]+<\/iframe>)/",$strVideoPlaceholder,$kbase_problem);
			}
			else
			{
				// F0103835: Check if problem text is in html form before using nl2br function
				if(strpos($kbase_problem,"<html>")===false && strpos($kbase_problem,"<HTML>")===false)
				{
					echo nl2br($kbase_problem);
				}
				else
				{
					echo $kbase_problem;
				}
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
		<?php 			//-- 06.2011 - Google Chrome will not permit loading of frames with content from an alternative domain, hence if using chrome
			//-- the iframe is stripped out and replaced with a placeholder indicating the location of the iframe
			if(strpos(strtolower($_SERVER['HTTP_USER_AGENT']),"chrome")>0)
			{
				$strVideoPlaceholder = '<div style="width:640px;height:390px;background-color:black;color:white;">Your content will appear here but cannot be displayed in preview mode in this browser</div>';
				echo preg_replace("/(<iframe[^<]+<\/iframe>)/",$strVideoPlaceholder,$kbase_solution);
			}
			else
			{
				// F0103835: Check if solution text is in html form before using nl2br function
				if(strpos($kbase_solution,"<html>")===false && strpos($kbase_solution,"<HTML>")===false)
				{
					echo nl2br($kbase_solution);
				}
				else
				{
					echo $kbase_solution;
				}
			}			
			?>
		</p>
	</div>
</div>
</p>



<br>

	

</body>
</html>
