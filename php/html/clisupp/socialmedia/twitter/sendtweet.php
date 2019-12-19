<?php

	include_once('clstwitter.php');
	include_once('clsbitly.php');
	include_once('config.php');
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

	function get_short_url($url)
	{
		$shorturlreq = new bitly($url);
		if (!strlen($shorturlreq->shortURL)) dump_last_request();
		$oShortUrl = json_decode($shorturlreq->shortURL);
		return $oShortUrl->data->url;
	}

	$twitterid=$_POST["twitterid"];
	$intcallref=$_POST["intcallref"];
	$strcallref=$_POST["strcallref"];

	//-- Build URL
	$url = "http://"._SERVER_NAME._INSTANCE_PATH."index.php?viewcallref=".$intcallref;
	switch($_POST["callaction"])
	{
		case "LOG":
			$msg = "Your request ".$strcallref." has been logged.  To track this request, please visit SelfService ".get_short_url($url).".  Thank you.";
			break;
		case "UPDATE":
			$msg = "Your request ".$strcallref." has been updated.  To track this request, please visit SelfService ".get_short_url($url).".  Thank you.";
			break;
		case "CLOSE":
			$msg = "Your request ".$strcallref." has been closed.  To view this request, please visit SelfService ".get_short_url($url).".  Thank you.";
			break;
		case "RESOLVE":
			$msg = "Your request ".$strcallref." has been resolved.  To view this request, please visit SelfService ".get_short_url($url).".  Thank you.";
			break;
		default:
			$msg = "Your request ".$strcallref." has been updated.  To track this request, please visit SelfService ".get_short_url($url).".  Thank you.";
			break;
	}

	
	//$msg = "Your request ".$strcallref." has been logged.  To track this request, please visit SelfService ".get_short_url($url).".  Thank you.";

	$logCallConfirmTweet = new Twitter($_POST["my_req_key"], $_POST["my_req_secret"]);
	$logCallConfirmTweet->sendTweet("@".$twitterid." ".$msg,0,0,'vpme');
	

?>

