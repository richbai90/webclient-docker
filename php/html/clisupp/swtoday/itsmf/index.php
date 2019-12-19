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
	include('index_data.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">


<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Hornbill dev layout</title>

<link href="css/<?php echo $cssFile;?>" rel="stylesheet" type="text/css" />
<script src="jscript/index.js"></script>
</head>
<body>

	<div id="IE6MinWidth">
	<div id="wrapper">
	
	
		<div id="contentColumn">
			
			<!--<div id="contentWrapper"><img src="img/structure/swt_logo.gif" title="SupportWorks Today" /></div>-->

<!-- ********** page head **********-->
			
				<div id="swtPageTop"></div>
				
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		
					
					<div id="swtInfoBody">
					
						<!-- NWJ - Call php function in itsm_index_data.php	to echo out problems -->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Reported Problems</h1></td>
									<td class="statusCell">Impact</td>
								</tr>
							</table>	
						</div>
						<?php echo  output_problem_notifications($connCache,'flg_ke <> 1')?>

						<!-- NWJ - Call php function in itsm_index_data.php	to echo out problems -->
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Known Errors</h1></td>
									<td class="statusCell">Impact</td>
								</tr>
							</table>	
						</div>
						<?php echo  output_problem_notifications($connCache,'flg_ke = 1')?>
						
						
						<div class="sectionHead">
							<table class="sectionTitle">
								<tr>
									<td class="titleCell"><h1>Change Schedule</h1></td>
									<td class="statusCell" width="100%">&nbsp;</td>
								</tr>
							</table>	
						</div>
                        <?php echo  output_fsc_notifications_overview($connCache)?>
					     <div class="spacer">&nbsp;</div>
					</div> <!-- id="swtInfoBody"-- >				
				
				
<!-- ********** End page body **********-->



<!-- ********** Page base **********-->

				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
				
<!-- ********** End page base **********-->


				
			</div>
			
		</div>

	</div>
	</div>
</body>
</html>
