<?php

	include('../lib_oauth.php');
	include('config.php');

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";

	include_once('itsm_default/xmlmc/common.php');
	
	##########################################################################################
	#
	# STEP 1 - get an access token and a URL at which the user can auth it
	#

	$keys = array(
		'oauth_key'		=> OAUTH_CONSUMER_KEY,
		'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
	);

	$ok = oauth_get_auth_token($keys, OAUTH_REQUEST_URL, array( 'oauth_callback' => OAUTH_CALLBACK_URL ));

	if ($ok){

		$url = oauth_get_auth_url($keys, OAUTH_AUTHORIZE_URL);


		setcookie("swsessid",		gv('sessid'),0,"/");
		setcookie("my_req_key",		$keys[request_key],	0,	"/");
		setcookie("my_req_secret",	$keys[request_secret],	0,	"/");
				
		//echo "request key: ".$keys[request_key]."<BR>";
		//echo "request secret: ".$keys[request_secret]."<BR>";
		//echo "access url is <a href=\"$url\">$url</a>\n";

		header("location: $url");
		setcookie("swsessid",		gv('sessid'),0,"/");
		exit;
	}else{
		handle_request_failure();
	}

?>