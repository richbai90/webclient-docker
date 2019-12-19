<?php
	session_start();
	//error_reporting(E_ALL);
	$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	@include_once("global.settings.php");
	@include_once('itsm_default/xmlmc/classactivepagesession.php');
	@include_once('itsm_default/xmlmc/common.php');

	//--error_reporting(E_ERROR | E_PARSE );

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
	<?php
		exit;
	}

	//-- user is not a system administrator
	if($GLOBALS['privlevel']<3)
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
		<?php
			exit;
	}

	$boolNotInUse = true;
	$con = new CSwDbConnection;
	if(!$con->Connect(swdsn(),swuid(),swpwd()))
	{
		echo "Failed to connect to database, please check ODBC connection";
		exit;
	}

	$strSelectSetting = "SELECT * FROM SW_SBS_SETTINGS WHERE SETTING_NAME = 'BPM.GPDINTEGRATION.ENABLED' and SETTING_VALUE='True' and appcode = '".gv('dataset')."'";		
	if($con->Query($strSelectSetting))
	{
		while($con->Fetch("query"))
		{
			$boolNotInUse = false;
		}
	}
	
	if($boolNotInUse)
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
								This functionality is not in use.<br>
								Please contact your system administrator.
							</span>
						</center>
					</body>
			</html>
		<?php
			exit;
	}
	$_SESSION['sessid'] = gv('sessid');
?>