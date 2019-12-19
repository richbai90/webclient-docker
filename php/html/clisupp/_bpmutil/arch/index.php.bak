<?php 	include('php/helpers/session_check.php');
	include("php/helpers/portal.navigation.php");
	include('php/helpers/helpers.php');
	
	if (session_status() == PHP_SESSION_NONE) {
		session_start();
	}

	$_SESSION['boolApplications'] = false;
	if(!isset($_SESSION['boolApplications']) || !$_SESSION['boolApplications'])
	{
		$_SESSION['boolApplications'] = false;
		$_SESSION['arrApplications'] = explode(",",gv('datasetfilterlist'));
		$_SESSION['strFilterApplications'] = " WHERE APPCODE IN (" .pfs(gv('datasetfilterlist')). ")";

		include_once('itsm_default/xmlmc/classdatabaseaccess.php');
		$con = new CSwDbConnection;
		if(!$con->Connect("","",""))
		{
			echo "Failed to connect to database, please check ODBC connection";
			exit;
		}
		else
		{
			$strAppcodeFilter = getAppcodeFilter('FILTER.APPCODE.BPM');
			if($strAppcodeFilter!="")
				$_SESSION['boolApplications'] = true;
			
			$_SESSION['arrApplications'] = explode(",",$strAppcodeFilter);
			$_SESSION['strFilterApplications'] = " WHERE APPCODE IN (".$strAppcodeFilter.")";
		}
		
	}
	//-- Get Directory Setting
	$query = "SELECT setting_value FROM sw_sbs_settings where setting_name = 'BPM.IMPORT.DIRECTORY' and appcode = '".gv('dataset')."'";
	if($con->Query($query))
	{
			
		if($con->Fetch("settings"))	
		{
			if($settings_setting_value)
			{
				//-- Apply Setting to Session Variable
				
				$mydir = opendir($settings_setting_value);	
				if(!$mydir)
				{
					//-- If directory cannot be opened Alert Error and set to default
					$msg = "System Setting BPM.IMPORT.DIRECTORY value is incorrect. Please contact your Suppoworks Administator. ";
					// -- Alert Error Once Per Session
					if($_SESSION['error'] < 1)
					{
						echo '<script type="text/javascript">alert("' . $msg . '"); </script>';
						$_SESSION['error']++;
					}
					$_SESSION['strDirectory'] = "../workflows/";
				}else
				{
					//-- Get last Charicter of string					$lastchar = substr($settings_setting_value, -1);
					if($lastchar !== '\\')
					{
						//-- IF settings doesnt have backslash add one
						$settings_setting_value = $settings_setting_value.'\\';
						
					}
					//-- Set Session Varabiel 
					$_SESSION['strDirectory'] = $settings_setting_value;
				}
			}else
			{
				//-- If setting doesn't exisit default to workflows directory.
				$_SESSION['strDirectory'] = "../workflows/";
				
			}
		}else
		{
			$_SESSION['strDirectory'] = "../workflows/";
		}
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<title>Hornbill Business Process Utility (ITSM)</title>
<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />
<link href="css/elements.css" rel="stylesheet" type="text/css" />
<script language="JavaScript" src="../../jquery/jquery.min.js"></script>
<script language="JavaScript" src="../../jquery/ui/jquery-ui.min.js"></script>
<script>

	var app = top; //-- when call function from popup dforms use app.function to get to root functions below
	var portalroot= "index.php";
	var intViewCallref = "<?php echo  gv('viewcallref');?>";

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
			<?php 				//-- php to construct the menu items
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
