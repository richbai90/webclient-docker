 <?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('../lib_oauth.php');
	include('../lib_json.php');
	include('config.php');
	include('itsm_default/xmlmc/common.php');
	include('../clsSwSocialMedia.php');
	include('./clsTwitter.php');

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

	//-- Get oAuth Credentials for selected account
	$SwSocialMedia = new SwSocialMedia();
	$strUserId = gv('strUserId');
	$rsUserAccounts = $SwSocialMedia->get_user($strUserId);
	if(!$rsUserAccounts->eof)
	{
		$my_req_key = $rsUserAccounts->f('sm_acc_key');
		$my_req_secret = $rsUserAccounts->f('sm_acc_secret');
	}

	//-- Run the Direct Message and return result object
	$keys = array(
	'oauth_key'		=> OAUTH_CONSUMER_KEY,
	'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
	'user_key'		=> $my_req_key,
	'user_secret'	=> $my_req_secret,
	);

	//-- Note need to use id_str rather than id	
	$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/retweet/".gv('in_msgidstr').".json", "", "POST");
	if (!strlen($ret)) dump_last_request();
	$oResults = json_decode($ret);
	
	
?>