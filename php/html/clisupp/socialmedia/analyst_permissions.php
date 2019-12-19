<?php 
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('clsswsocialmedia.php');

	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classactivepagesession.php');		
	
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
							There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
					</center>
				</body>
		</html>
	<?php 		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

	



?>
<html>
	<head>
		<title>Analyst Rights - Supportworks Social Media</title>
		<link rel="stylesheet" href="css/smstructure.css">
		<link href="css/structure.css" rel="stylesheet" type="text/css" />
		<link href="css/elements.css" rel="stylesheet" type="text/css" />

		<script src="./js/portal.control.js"></script>
		<script src="./js/xmlhttp.control.js"></script>
		<script src="./js/socialmedia.js"></script>
		<script>
			var app = top; //-- when call function from popup dforms use app.function to get to root functions below
			var portalroot= "<?php echo docURL();?>";
		</script>
		<script>
			var bFormChanged=false;
			function dataChange()
			{
				if (bFormChanged)
				{
					if (confirm("You have unsaved changes. Do you wish to save the changes?"))
					{
						submit_httpform('form_updatetable<?php echo gv('strProfileID');?>',false,'strupdmsg<?php echo gv('strProfileID');?>','profiles_updok()');
						bFormChanged=false;
						return false;
					}
					bFormChanged=false;
				}
			}

			function selectAllAnalysts(strForm, strCB)
			{
				var oCB = document.getElementById(strCB);
				var oForm = document.getElementById(strForm);
				for(i=0;i<oForm.elements.length;i++)
				{
					var field=oForm.elements[i];

					if (field.type=='checkbox')
					{
						if(oCB.checked)
						{
							field.checked = true;
						}
						else
						{
							field.checked = false;
						}
					}
				}
			}

		</script>
	</head>
	<body>
		<div id="IE6MinWidth">
			<div id="wrapper">
			
			
				<div id="contentColumn">
					
					<div id="contentWrapper">

		<!-- ********** page head **********-->
					
						<div id="swtPageTop" style="height:1px;"></div>
						
		<!-- ********** End page head **********-->

		<!-- ********** Start page body **********-->		

							<div id="swtInfoBody">
								<h2>Managing Analyst Rights for Social Media Profile: <b><font style="color:#555555">@<?php echo gv('strProfileName');?></font></b></h2>
								<p>Rights to use social support within Supportworks can be set here.  Select a support group, choose the analyst(s) that should have rights to use the "@<?php echo gv('strProfileName');?>" profile and then click to update the settings.</p>
								<table width="95%" border=0>
									<tr>
										<td><b>Support Groups</b></td><td></td>
									</tr>
									<tr>
										<td style="vertical-align:top;">
											<div id="swgroups" class="swgroups">
											<?php 												$SwSocialMedia = new SwSocialMedia();
												$SwSocialMedia->listSwGroups(gv('strProfileID'));
											?>
											</div>
										</td>
										<td style="vertical-align:top;">
											<div id="assocanalysts" class="assocanalysts"></div>
										</td>
									</tr>
								</table>
								<div style="width:97%;text-align:right;"><input type="button" value="Close" onclick="Javascript:window.close();"></div>
							</div> <!-- id="swtInfoBody"-->				
						<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
					</div>
			</div>
		</div>
	</div>
	</div>
	</body>
</html>