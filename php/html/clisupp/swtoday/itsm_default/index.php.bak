<?php 	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/common.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	//--TK Check for Server Version
	$varServer = sw_getcfgstring("Version");
	$varServer = round($varServer, 2);
	if ($varServer < "7.6")
	{
		include('index_data.php');
		?><html>
			<head>
				<meta http-equiv="Pragma" content="no-cache">
				<meta http-equiv="Expires" content="-1">
				<title>Support-Works Session Authentication Failure</title>
				<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
			</head>
			<body>
				<div class='sectionHead'>
					<table class='sectionTitle'>
						<tr>
							<td class='titleCell'><h1>Supportworks Error</h1></td>
						</tr>
					</table>
				</div>
				<br><br>
				<center>
					<span class="error">
						Supportworks Client 7.6.0 or later is required.<br>
						Please contact your system administrator.
					</span>
				</center>
			</body>
		</html>
		<?php 		exit();
	}
	//-- TK End Server Version Check
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
	$_SESSION['sessid'] = gv('sessid');
	include('index_data.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">


<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Hornbill dev layout</title>

<!-- ES F0109085 -->
<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<script src="jscript/index.js"></script>

<!-- css to support tab set -->
<link href="css/panels.css" rel="stylesheet" type="text/css" />

<!-- system js to support tab set-->
<script src="jscript/base64.js"></script>
<script src="jscript/portal.control.js"></script>
<script src="jscript/xmlhttp.control.js"></script>
<script src="jscript/tab.control.js"></script>
<script src="jscript/hslaction.js"></script> <!-- 07.2010 - Functions to support hsl links in webclient-->

<!-- js to support fusion charts graphing -->
<script language="JavaScript" src="../../fce/FusionCharts.js"></script>
<script language="JavaScript">FusionCharts.setCurrentRenderer('javascript');</script>

<script>
	//alert(app.bWebClient);
	//FusionCharts.debugMode.enabled( function() { console.log(arguments); }, 'verbose');
	var app = this; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
	//-- Counter
	var counter = 0;
	function resize_charts()
	{
		var tabItem = document.getElementById('tabdata_tabs');
		counter++;
		if((tabItem!=null) && (counter != 1))
		{
			var tItem = get_child_by_att_value(tabItem, "class", "current");
			if(tItem!=null)
			{
				if(app.fireevent)
				{
					app.fireevent(tItem,'click');
				}
				else
				{
					fireevent(tItem,'click');
				}
			}
		}
	}
</script>

</head>
<body onresize="resize_charts();">


	<div id="IE6MinWidth">
	<div id="wrapper">
	
	
		<div id="contentColumn">
			
			<div id="contentWrapper">

<!-- ********** page head **********-->
			
				<div id="swtPageTop" style="height:1px;"><!--<img src="img/structure/swt_logo.gif" title="SupportWorks Today" / >--></div>
				
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		

					<div id="swtInfoBody">
	
						<?php 						//-- Load SWToday Settings Record into Recordset for use by functions below.	
						$rsSWTodaySettings = loadSWTodaySettings();

						if(count($rsSWTodaySettings)==0)
						{
							$strOutput="<div class='sectionHead'>";
							$strOutput.="	<table class='sectionTitle'>";
							$strOutput.="		<tr>";
							$strOutput.="			<td>To configure your SWToday page click <b>'File' -> 'Manage Settings' -> 'General Settings' </b>, click on <b>'System Settings'</b> tab and filter by <b> 'SWTODAY' </b> setting type.</td>";
							$strOutput.="		</tr>";
							$strOutput.="	</table>";
							$strOutput.="</div>";
							echo $strOutput;
						}
						?>
						<!-- Show Customer Notifications -->
						<?php echo  output_wss_notifications($connSwdata);?>

						<!-- Show Service Availability Data -->
						<?php echo  output_service_notifications($connSwdata)?>

						<!-- F0103274 - Show Major Incident Notification Data-->
						<?php echo  output_mi_notifications($connCache)?>
						
						<!-- Show Problem Notification Data-->
						<?php echo  output_problem_notifications($connSwdata)?>

						<!-- Show Known Error Notification Data-->
						<?php echo  output_error_notifications($connSwdata)?>
					
						<!-- Show Change Request Notification Data -->
                        <?php echo  output_fsc_notifications_overview($connSwdata)?>

						<!-- F0102566: Show BPM Authorisations Data -->
                        <?php echo  output_bpm_authorisations($connSwdata)?>
						
						<!-- Summary Report section to display dashboard style charts -->
						<?php 
							if(showReportTabs())
							{
							?>
								<div class="sectionHead">
									<table class="sectionTitle">
										<tr>
											<td class="titleCell"><h1>Summary Reports</h1></td>
											<td class="statusCell" width=100%>&nbsp;</td>
										</tr>
									</table>
									<br>
										<?php 
											$oTabControl = showCharts("swtodaycharts"); 
											echo $oTabControl->draw('800px','');
										?>
								</div>
							<?php 							}
						?>&nbsp;

					</div> <!-- id="swtInfoBody"-->								
<!-- ********** End page body **********-->
<!-- ********** Page base **********-->
				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>		
<!-- ********** End page base **********-->
			</div>
		</div>
<!-- ********** End left Column **********-->
	</div>
	</div>
	</div>
</body>
</html>
