<?php //	error_reporting(E_ALL);
	session_start();
	$_SESSION['analystid'] = $analystid;
	$_SESSION['portalmode'] = "FATCLIENT";

	include_once('social_index_helpers.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('clsswsocialmedia.php');
	$SwSocialMedia = new SwSocialMedia();

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
	
	//-- As CURL is not enabled by default on Supportworks Core Services Build 3.1.1 
	//-- provide a function to check if it is enabled before we go any further
	function _iscurlsupported() {
	if  (in_array  ("curl", get_loaded_extensions())) {
		return true;
	}
	else{
		return false;
		}
	}





?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="css/smstructure.css">
<script src="js/socialmedia.js"></script>
<link href="css/structure.css" rel="stylesheet" type="text/css" />
<link href="css/elements.css" rel="stylesheet" type="text/css" />


<script src="js/index.js"></script>

<!-- css to support tab set -->
<link href="css/panels.css" rel="stylesheet" type="text/css" />

<!-- system js to support tab set-->
<script src="js/portal.control.js"></script>
<script src="js/xmlhttp.control.js"></script>
<script src="js/tab.control.js"></script>
<script src="js/base64.js"></script>
<script src="js/datatable.control.js"></script>

<script>
	var app = this; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "<?php echo docURL();?>";
</script>
</head>

<body>

	<div id="IE6MinWidth">
	<div id="wrapper">

	
		<div id="contentColumn" style="width:830px;">
			
			<div id="contentWrapper">

<!-- ********** page head **********-->
			
				<div id="swtPageTop" style="height:1px;"></div>
				 
<!-- ********** End page head **********-->

<!-- ********** Start page body **********-->		

					<div id="swtInfoBody">
						<br><img src="img/Supportworks_Social_Media.jpg" width="230" title="SupportWorks Social Media" / ><br><br>
						
	<?php 		if (_iscurlsupported()==false)
		{
			//-- Provide error message and correction steps
			?>
				<p>To use the Social Media Integration with Supportworks your Supportworks Administrator will need to enable the <b>cURL</b> library within Hornbill Core Services.</p>
				<p>To enable the <b>cURL</b> library:<br/>
				<ul>
					<li>Open the folder <b>C:\Program Files\Hornbill\Core Services\SwHttpServer\bin</b> (where C:\Program Files\Hornbill is the installation path of your Supportworks Server</li>
					<li>Using Notepad open the file <b>php.ini</b></li>
					<li>Search for the line <b>;extension=php_curl.dll</b></li>
					<li>Remove the semi-colon from the start of the line so that it now reads <b>extension=php_curl.dll</b></li>
					<li>Save the php.ini File</li>
					<li>Restart the SwHttpServer service via the Windows Service Control Manager</li>
					<li>Refresh this page, if cURL is correctly enabled this page will no longer be shown</li>
				</ul>
				</p>
			<?php 		}
		else
		{
			//-- Load the page content
			$oTabControl = showSMTabs("socialmedia"); 
			echo $oTabControl->draw('100%','');
		}									
	
	?>


					</div> <!-- id="swtInfoBody"-->				
				
				
<!-- ********** End page body **********-->



<!-- ********** Page base **********-->

				<div id="swtPageBottom"><img src="img/structure/swt_page_bl.gif" /></div>
				
<!-- ********** End page base **********-->


				
			</div>
			
		</div>
		</div>
	</div>
	</div>
	
	<iframe id='iframewa' name='iframewa' height=0 width=0 src="http://localhost"></iframe>

</body>

</html>

