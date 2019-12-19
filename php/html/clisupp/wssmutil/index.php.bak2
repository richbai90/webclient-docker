<?php
	include_once("domxml-php4-to-php5.php");
	include('php/helpers/session_check.php');
	include("php/helpers/portal.navigation.php");
	include('php/helpers/helpers.php');

	if(!file_exists("menuset.xml"))
	{
		?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html>
		<head>
		<title>Hornbill Wizard Migration Utility (ITSM)</title>
		</head>
		<body>
				<br><br>
				<center>
					<span class="error">
						The functionality to Migrate Wizards is not available.<br>
						For further information please contact your account manager.
					</span>
				</center>
			</body>
		</html>
		<?php
		exit;
	}
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Hornbill Wizard Migration Utility (ITSM)</title>
<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="css/elements.css" rel="stylesheet" type="text/css" />
<script language="JavaScript" src="../jquery/jquery.min.js"></script>
<script language="JavaScript" src="../jquery/ui/jquery-ui.min.js"></script>
<script>

	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "index.php";
	var intViewCallref = "<?php echo gv('viewcallref');?>";

	//-- what action and content stuff we should load
	var strMainContent = "<?php echo gv('phpcontent');?>";

	var strActionContent = "<?php echo gv('phpactions');?>";
	var strLinkID = "<?php echo gv('link');?>";

</script>

<!-- system js -->
<script src="js/system/base64.js"></script>
<script src="js/system/portal.control.js"></script>
<script src="js/system/xmlhttp.control.js"></script>
<script src="js/system/datatable.control.js"></script>
<script src="js/system/toolbar.control.js"></script>
<script src="js/system/date.control.js"></script>
<script src="js/system/tab.control.js"></script>
<script src="js/system/custscript.control.js"></script>

<!-- instance specific js -->
<base target="_self" />
</head>
<body  onload="onload_portal();">

	<div id="pageArea">

		<!-- PORTAL HEADER -->
		<div id="topBanner">
				<img src="img/header/sw-logo-on-blue.png" width="260" height="45" alt="" border="0" /><br />
		</div>

		<!-- LEFT MENU AREA -->
		<div id="navColumn">
			<?php
				//-- php to construct the menu items
				echo create_navigation_menu("menuset.xml");
			?>
		</div>

		<!-- ACTIONS CONTENT COLUMN -->
		<div id="actionsColumn">
			<!-- loaded automatically -->
		</div>


		<!-- MAIN CONTENT COLUMN -->
		<div id="contentColumn">
			<!-- loaded automatically -->
		</div>

		<div id="export">
			
		</div>


		<!-- PORTAL FOOTER -->
		<div id="pageFooter">
			<p>Hornbill ITSM</p>
		</div>
	<a href="" id="goLocation" style="display:none;">
	</div>
</body>
</html>
