<?php
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
	<?php
		exit;
	}
	$_SESSION['sessid'] = gv('sessid');

	//echo "Last Refreshed: ".date('D d M, Y H:i:s',time());
	$SwSocialMedia = new SwSocialMedia();
	$SwSocialMedia->showMessageList('msgfeed',gv('feedtype'),gv('feedid'),gv('startFromCommsId'),gv('bShowHeader'),gv('strFeedName'));
?>