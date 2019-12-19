<?php 
	#
	# Config.php
	# Configuration Settings for Twitter API connections using oAuth
	#

	# Register your application at http://dev.twitter.com/apps/new in order to obtain your consumer
	# key and consumer secret.  Add these below so that authorisation requests will show your
	# application name when asking for permissions to read/write data from/to twitter

	define('OAUTH_CONSUMER_KEY',	'Ghwwaln4nFxSWNN21DKRiA'); //SW key
	define('OAUTH_CONSUMER_SECRET',	'HAH8NHcEr11nqd0xrikjUgjiZJkiS0UODUQ1kDAISe0');//SW Key
		
	# Set the Callback path on your Supportworks server, this is where twitter will return
	# after you authorise or reject an authorisation request
	# NOTE: This must use domain name url (e.g. http://swserver/twitter) and not IP address

	$strURL = 'http://'.gethostbyname(gethostname());
	
		if ($_SERVER['HTTPS'] =="on") $strURL=str_replace("http://","https://", $strURL);
	define('TWITTER_ROOT',	$strURL.'/sw/clisupp/socialmedia/twitter/');
	define('OAUTH_CALLBACK_URL',	TWITTER_ROOT.'callback.php');
	# Standard twitter api endpoints for authorising access, requesting token and exchanging for access token

	define('OAUTH_AUTHORIZE_URL',	'https://api.twitter.com/oauth/authorize');
	define('OAUTH_REQUEST_URL',	'https://api.twitter.com/oauth/request_token');
	define('OAUTH_ACCESS_URL',	'https://api.twitter.com/oauth/access_token');
	
	# Test URL for checking that authorisation has been successful, user_id supplied within code

	define('OAUTH_PROTECTED_URL',	'https://api.twitter.com/1.1/users/lookup.json?user_id=');

	# Selfservice settings used when building short links for twitter posts when logging/resolving/closing requests
	# Note: this should match the settings in Supportworks Server/html/_selfservice/<selfservice instance>/_ssconfig.php
	define('_INSTANCE_PATH', '/sw/selfservice/');
	define('_SERVER_NAME', '127.0.0.1');

	# Debug function to output HTTP request headers in the event of an error occuring

	function dump_last_request(){

		echo "<div style=\"background-color: #fee; border: 4px solid #900; padding: 1em; margin: 1em 0;\">";
		echo "Last HTTP Request:";
		echo "<pre>".htmlspecialchars(var_export($GLOBALS[oauth_last_request],1))."</pre>";
		echo "</div>";
		exit;
	}

	function handle_request_failure()
	{
		$strErrorMsg = "";
		$intErrorCode = $GLOBALS[oauth_last_request]['headers']['http_code'];
		echo $GLOBALS[oauth_last_request]['headers']['body'];
		switch($intErrorCode)
		{
			case 0:
				$strCustErrorMsg = "There may be some network connection issues. Please try again in a moment.";
				break;
			case 200:
				$strCustErrorMsg = "Twitter appears to be busy, please try again in a moment.";
				break;
			case 304:
				$strCustErrorMsg = "No new data to return.";
				break;
			case 400:
				$strCustErrorMsg = "The request was invalid or you have exceeded your Twitter rate limit for this hour.";
				break;
			case 401:
				$strCustErrorMsg = "Unauthorised action. User name and password were missing or incorrect.";
				break;
			case 403:
				$strCustErrorMsg = "Forbidden Request.  This request has been refused by Twitter.";
				break;
			case 404:
				$strCustErrorMsg = "Invalid URL.";
				break;
			case 406:
				$strCustErrorMsg = "Search request format is not valid.";
				break;
			case 420:
				$strCustErrorMsg = "You have exceeded your rate limit for this hour. Please wait a few moments and try again.";
				break;
			case 500:
				$strCustErrorMsg = "Unknown Twitter Issue. Please wait a few moments and try again.";
				break;
			case 502:
				$strCustErrorMsg = "Twitter is currently down or being upgraded. Please wait a few moments and try again.";
				break;
			case 503:
				$strCustErrorMsg = "Twitter is currently over capacity. Please wait a few moments and try again.";
				break;
			default:
				$strCustErrorMsg = "Unexpected Error Code: ".$intErrorCode;
		}

		return $strCustErrorMsg;
	}

?>