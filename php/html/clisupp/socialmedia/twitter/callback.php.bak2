<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	include('../lib_oauth.php');
	include('itsm_default/xmlmc/common.php');
	include('config.php');
	include('../lib_json.php');
	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classactivepagesession.php');		
	
	//-- Construct a new active page session
	$session = new classActivePageSession($_COOKIE['swsessid']);

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

	$keys = array(
		'oauth_key'		=> OAUTH_CONSUMER_KEY,
		'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
		'request_key'		=> $_COOKIE['my_req_key'],
		'request_secret'	=> $_COOKIE['my_req_secret'],
	);
	
	##########################################################################################
	#
	# STEP 2 - exchange the authorized access token for a request token
	#
	
	$params = array();
	# OAuth 1.0a servers will return an extra oauth_verifier argument
	if (isset($_GET[oauth_verifier])) $params[oauth_verifier] = $_GET[oauth_verifier];
	$ok = oauth_get_access_token($keys, OAUTH_ACCESS_URL, $params, "POST");
	
	if (!$ok){
		
		if(isset($_GET["denied"]))
		{
			//-- Redirect back to index page
			$url = "../social_index.php?error=denied";
			session_start();
			header("location: $url", false);
			setcookie('sessid', $_COOKIE["swsessid"],0,"/");
		}

		echo "Something didn't work!<hr />";
		//print_r($keys);
		dump_last_request();
		exit;
	}

	setcookie('my_acc_key',		$keys[user_key],0,"/");
	setcookie('my_acc_secret',	$keys[user_secret],0,"/");

	# Strip out userid from returned key
	$userid = substr($keys[user_key],0,strpos($keys[user_key],"-"));

	##########################################################################################
	#
	# STEP 3 - access the protected resource
	#
	
	$ret = oauth_request($keys, OAUTH_PROTECTED_URL.$userid);
	$oResults = json_decode($ret);
	if (!strlen($ret)) dump_last_request();

	# Retrieve Account ID from Twitter
	# Get User ID/Screen Name from XML
	//$sm_acc_id = getResultVar('xml',$ret,"id");
	//$sm_acc_name = getResultVar('xml',$ret,"screen_name");
	//$sm_acc_img = getResultVar('xml',$ret,"profile_image_url");
	$sm_acc_id = $oResults[0]->id;
	$sm_acc_name = $oResults[0]->screen_name;
	$sm_acc_img = $oResults[0]->profile_image_url;
	if($sm_acc_id=="")
	{
		echo "Unable to create new account.  Failed to retrieve account details.";
	}
	else
	{
		// Store Key and Secret Details in Supportworks
		//-- NOTE: This should be migrated to use the API calls rather than DB in future
		include_once('stdinclude.php');						//-- standard functions
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class

		//-- create profile entry
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
		$swconn->Query("insert into socmed_twitter_acts (sm_acc_id,sm_acc_name,sm_acc_type,sm_acc_key,sm_acc_secret,sm_acc_type_img) values ('".$sm_acc_id."','".$sm_acc_name."','Twitter','".$keys[user_key]."','".$keys[user_secret]."','".$sm_acc_img."')");

		//-- create default search entry for tracking mentions and DMs
		$swconn->Query("insert into socmed_monitors (monitor_name,flg_search_twitter,start_datex,end_datex,search_query,monitor_type) values ('@".$sm_acc_name."',1,".time().",1893499200,'@".$sm_acc_name."','mention')");
		
		$swconn->Query("insert into socmed_monitors (monitor_name,flg_search_twitter,start_datex,end_datex,search_query,monitor_type) values ('@".$sm_acc_name."',1,".time().",1893499200,'@".$sm_acc_name."','dm')");
				
		//echo "Account Verification Complete. Your twitter account @".$sm_acc_name." has now been authorised for use with Supportworks.";
		//-- Redirect back to index page
		$url = "../social_index.php";
		session_start();
		header("location: $url", false);
		setcookie('sessid', $_COOKIE["swsessid"],0,"/");
		
	
	}
?>
