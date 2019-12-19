<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/common.php');


	$sessid = gv('sessid');
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

<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<style>
	body
	{
		padding:0px 0px 0px 4px;
		min-width:240px;
	}
</style>
<script src="jscript/index.js"></script>
<script src="jscript/base64.js"></script>
<script src="jscript/hslaction.js"></script> <!-- 07.2010 - Functions to support hsl links in webclient-->

<script language="JavaScript" src="../../fce/FusionCharts.js"></script>
<script language="JavaScript">FusionCharts.setCurrentRenderer('javascript');</script>

<script>

	var fcRequestCount;
	function initialise_charts()
	{
		if(iCurrWidth == document.body.offsetWidth) return;
		iCurrWidth = document.body.offsetWidth;


		//--- my call status (all call classes)
		var oDivHolder = document.getElementById("fc_requeststatus");
		if(oDivHolder)
		{
			//-- TK 12/12/12 FIx for New FusionCharts which trys to Duplicate Object name 
			if(!fcRequestCount)
			{
				//-- TK If Not Already Set then Create New Object
				fcRequestCount = new FusionCharts("../../fce/Bar2D.swf", "chart_fc_requeststatus", oDivHolder.offsetWidth, "100");
			}else
			{
				//-- Else the object is set to set the new width that will be beign called by resize_charts()
				fcRequestCount.width = oDivHolder.offsetWidth;
			}
			//--TK END
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
<body onload="initialise_charts();" onresize="resize_charts();" >

			
		<div class="calendar">  
			<table width="100%">
				<tr>
				<td class="calendarText">
					<?php echo $cal_weekday;?>
				<br/>
					<?php echo $cal_month;?>
				<br/>
					<?php echo $cal_year;?>
				</td>
				<td class="calendarDayText" ><?php echo $cal_day;?></td>
				<td class="calendarDayType" ><?php echo $cal_thrdst;?></td>
				</tr>
			</table>
		  </div>


			<div class="actionBox" style="padding-top:10px;border:0;width:96%;">
				<div class='fcTitle' align='center' style="margin-left:5px;"><b>My Active Requests</b></div>
				<div id="fc_requeststatus" align="center" style="width:100%;"></div>
			</div>

	  
		  
		   <div class="actionBox">
			  
				<table >
					<tr>
					<td class="actionTitle"><a href="#" >Incidents</a></td>
					<td class="actionCount"><?php echo $int_myincidentcount?></td>
					</tr>
				</table>
				
				<div class="actionItemWrapper">
					<table class="actionItem">
						<tr>
							<td><a href="hsl:mycalls?tab=0&filter=Active">My Open Incidents</a></td>
							<td class="actionItemCount"><?php echo $int_myincidentcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mycalls?tab=0&filter=Escalated">My Escalated Incidents</a></td>
							<td class="actionItemCount"><?php echo $int_escincidentcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?tab=0&filter=Active">My Group's Open Incidents</a></td>
							<td class="actionItemCount"><?php echo $int_groupincidentcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?tab=0&filter=Escalated">My Group's Escalated Incidents</a></td>
							<td class="actionItemCount"><?php echo $int_groupescincidentcount?></td>
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
							<td><a href="hsl:mycalls?ltab=0">My Open Problems</a></td>
							<td class="actionItemCount"><?php echo $int_myproblemcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mycalls?ltab=0">My Escalated Problems</a></td>
							<td class="actionItemCount"><?php echo $int_escproblemcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?ltab=0">My Group's Open Problems</a></td>
							<td class="actionItemCount"><?php echo $int_groupproblemcount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?ltab=0">My Group's Escalated Problems</a></td>
							<td class="actionItemCount"><?php echo $int_groupescproblemcount?></td>
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
							<td><a href="hsl:mycalls?ltab=1">My Open Changes </a></td>
							<td class="actionItemCount"><?php echo $int_myrfccount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mycalls?ltab=1">My Escalated Changes</a></td>
							<td class="actionItemCount"><?php echo $int_escrfccount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?ltab=1">My Group's Open Changes</a></td>
							<td class="actionItemCount"><?php echo $int_grouprfccount?></td>
						</tr>
						<tr>
							<td><a href="hsl:mygroupcalls?ltab=1">My Group's Escalated Changes</a></td>
							<td class="actionItemCount"><?php echo $int_groupescrfccount?></td>
						</tr>
					</table>
				</div>	
		  </div>

		   <div class="actionBox">
				<table>
					<tr>
					<td class="actionTitle"><a href="#" >Messages</a></td>
					<td class="actionCount"><span class="green"></span></td>
					</tr>
				</table>
				
				<div class="actionItemWrapper">
					<table class="actionItem">
						<?php echo output_mail_messages($connCache);?>
					</table>
				</div>	
		  </div>


</body>
</html>
