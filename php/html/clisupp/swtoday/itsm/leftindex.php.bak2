<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');

	$sessid = gv('sessid');
	//-- F0100079 - check session variable
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

	//$bInWebclient = $GLOBALS['_webclient'];
	$bInWebclient = gv('_webclient');

	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);
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
	<?php 		exit;
	}
	
	$strChartLocation = "charts/fc_my_requests_status.php";
	include($strChartLocation);
	$strClassName =  basename($strChartLocation,".php");
	$ofcMyRequestsStatus = new $strClassName;
	$strGraphXML = $ofcMyRequestsStatus->getXML();

	include('index_data.php');

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">


<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Hornbill dev layout</title>

<link href="css/leftstructure.css" rel="stylesheet" type="text/css" />
<script src="jscript/index.js"></script>
<script src="jscript/base64.js"></script>
<script src="jscript/hslaction.js"></script> <!-- 07.2010 - Functions to support hsl links in webclient-->

<script language="JavaScript" src="../../fce/FusionCharts.js"></script>
<script language="JavaScript">FusionCharts.setCurrentRenderer('javascript');</script>

<script>
	var fcRequestCount;
	function initialise_charts()
	{
		if(iCurrWidth == document.body.clientWidth) return;
		iCurrWidth = document.body.clientWidth;

		//--- my call status (all call classes)
		var oDivHolder = document.getElementById("fc_requeststatus");
		if(oDivHolder)
		{
			if(!fcRequestCount)
			{
				//initialise
				fcRequestCount = new FusionCharts("../../fce/Bar2D.swf", "chart_fc_requeststatus", oDivHolder.clientWidth, "100");
			}
			else
			{
				//-- Else the object is set to set the new width that will be beign called by resize_charts()
				fcRequestCount.width = oDivHolder.clientWidth;
			}
			fcRequestCount.autoInstallRedirect = false;
			fcRequestCount.setDataXML("<?php echo $strGraphXML;?>");	
			if(!fcRequestCount.render("fc_requeststatus"))
			{
				//-- show message in div, no need for link as should default to js
				oDivHolder.innerHTML = "Failed to load chart"; //-- TK oDiv renamed oDivHolder 
			}
		}
	}


	var iCurrWidth = 0;
	function resize_charts()
	{
		setTimeout("initialise_charts()",100);
	}

</script>


</head>
<body onload="initialise_charts();" onresize="resize_charts();" style="min-width:240px;">

	
	
	
	
		

<!-- ********** Left Column **********-->

		<div id="contentColumn">
			<!-- Helpdesk Logo -->
			<div class="actionBox" style="border:0;text-align:center;vertical-align:middle;margin-top:5px;margin-bottom:5px;">
				<img style="margin-top:5px;margin-bottom:5px;" src="img/structure/hornbill.jpg" title="SupportWorks Today" / >
			</div>
			<!-- End Helpdesk Logo -->
			
			<div class="calendar" style="width:95%;text-align:center;">
		  
				<table border=0>
					<tr>
					<td class="calendarText">
						<?php echo $cal_weekday;?>, <?php echo $cal_day;?><?php echo $cal_thrdst;?>&nbsp;<?php echo $cal_month;?>,&nbsp;<?php echo $cal_year;?>
					</td>
					</tr>
				</table>
			  </div>
		</div>
		
		<div class="actionBox" style="padding-top:10px;border:0;">
			<div class='fcTitle' align='center' style="margin-left:5px;"><b>My Active Requests</b></div>
			<div id="fc_requeststatus" align="center" style="width:96%;"></div>
			
			
		</div>
		<div class="totalcalls">Total Calls&nbsp;&nbsp;&nbsp;<?php echo ($int_myincidentcount+$int_mymajorincidentcount+$int_mysrcount+$int_myproblemcount+$int_myerrorcount+$int_myrfccount+$int_myrelcount);?></div>
		<!-- 
	<div class="actionBox">	  
		<table >
			<tr>
				<td class="actionTitle"><a href="#" >My Requests</a></td>
				<td class="actionCount"></td>
			</tr>
		</table>
		
		<div class="actionItemWrapper">
			<div class='fcTitle' align='center'>&nbsp;</div>
			<div id="fc_requeststatus" align="center" style="width:96%;"></div> 
		</div>	
	 </div>
	  
	
	<div class="actionBox">	  
		<table >
			<tr>
				<td class="actionTitle"><a href="#" >My Requests</a></td>
				<td class="actionCount"></td>
			</tr>
		</table>
		
		<div class="actionItemWrapper">
			<div class='fcTitle' align='center'>&nbsp;</div>
			<div id="fc_requestcount" align="center" style="width:96%;"></div> 
		</div>	
	 </div>
	
	 <div class="actionBox">	  
		<table >
			<tr>
				<td class="actionTitle"><a href="#" >My Groups Requests</a></td>
				<td class="actionCount"></td>
			</tr>
		</table>
		
		<div class="actionItemWrapper">
			<div class='fcTitle'align='center'>&nbsp;</div>
			<div id="fc_grprequestcount" align="center" style="width:96%;"></div>  
		</div>	
	 </div>

	 <div class="actionBox">	  
		<table >
			<tr>
				<td class="actionTitle"><a href="#" >Escalated Requests</a></td>
				<td class="actionCount"></td>
			</tr>
		</table>
		
		<div class="actionItemWrapper">
			<div class='fcTitle'align='center'>&nbsp;</div>
			<div id="fc_escrequestcount" align="center" style="width:96%;"></div>
		</div>	
	 </div>
	-->
		  
	<!--
	   <div class="actionBox">
		  
		 	<table >
				<tr>
				<td class="actionTitle"><a href="#" >Major Incidents</a></td>
				<td class="actionCount"><?php echo $int_mymajorincidentcount?></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?tab=1&filter=Active">My Open Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_mymajorincidentcount?></td>
					</tr>

					<tr>
						<td><a href="hsl:mycalls?tab=1&filter=Escalated">My Escalated Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorescincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=1&filter=Active">My Group's Open Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorgroupincidentcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?tab=1&filter=Escalated">My Group's Escalated Major Incidents</a></td>
						<td class="actionItemCount"><?php echo $int_majorgroupescincidentcount?></td>
					</tr>
			</table>
		  </div>	
	  
	  </div>
		  
	   <div class="actionBox">
		  
		 	<table >
				<tr>
				<td class="actionTitle"><a href="#" >Service Requests</a></td>
				<td class="actionCount"><?php echo $int_mysrcount?></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=0&lfilter=Active">My Open Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_mysrcount?></td>
					</tr>

					<tr>
						<td><a href="hsl:mycalls?ltab=0&lfilter=Escalated">My Escalated Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_escsrcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=0&lfilter=Active">My Group's Open Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_groupsrcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=0&lfilter=Escalated">My Group's Escalated Service Requests</a></td>
						<td class="actionItemCount"><?php echo $int_groupescsrcount?></td>
					</tr>
			</table>
		  </div>	
	  
	  </div>

	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Problems</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myproblemcount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Active">My Open Problems</a></td>
						<td class="actionItemCount"><?php echo $int_myproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Escalated">My Escalated Problems</a></td>
						<td class="actionItemCount"><?php echo $int_escproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Active">My Group's Open Problems</a></td>
						<td class="actionItemCount"><?php echo $int_groupproblemcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Escalated">My Group's Escalated Problems</a></td>
						<td class="actionItemCount"><?php echo $int_groupescproblemcount?></td>
					</tr>
				</table>
			</div>	
	  </div>

	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Known Errors</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myerrorcount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Active">My Open Errors</a></td>
						<td class="actionItemCount"><?php echo $int_myerrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=1&lfilter=Escalated">My Escalated Errors</a></td>
						<td class="actionItemCount"><?php echo $int_escerrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Active">My Group's Open Errors</a></td>
						<td class="actionItemCount"><?php echo $int_grouperrorcount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=1&lfilter=Escalated">My Group's Escalated Errors</a></td>
						<td class="actionItemCount"><?php echo $int_groupescerrorcount?></td>
					</tr>
				</table>
			</div>	
	  </div>

		 
	   <div class="actionBox">
		 	<table>
				<tr>
				<td class="actionTitle"><a href="#" >Change Requests</a></td>
				<td class="actionCount"><span class="green"><?php echo $int_myrfccount?></span></td>
				</tr>
			</table>
			
			<div class="actionItemWrapper">
				<table class="actionItem">
					<tr>
						<td><a href="hsl:mycalls?ltab=2&lfilter=Active">My Open Changes </a></td>
						<td class="actionItemCount"><?php echo $int_myrfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mycalls?ltab=2&lfilter=Escalated">My Escalated Changes</a></td>
						<td class="actionItemCount"><?php echo $int_escrfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=2&lfilter=Active">My Group's Open Changes</a></td>
						<td class="actionItemCount"><?php echo $int_grouprfccount?></td>
					</tr>
					<tr>
						<td><a href="hsl:mygroupcalls?ltab=2&lfilter=Escalated">My Group's Escalated Changes</a></td>
						<td class="actionItemCount"><?php echo $int_groupescrfccount?></td>
					</tr>
				</table>
			</div>	
	  </div>-->


		  
<!-- ********** End left Column **********-->

	
	
	</div>
</body>
</html>
