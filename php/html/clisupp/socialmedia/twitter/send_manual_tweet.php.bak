<?php

	include('clstwitter.php');
	include('clsbitly.php');

	$msg=$_GET["msgtxt"];

	$oTweet = new Twitter($_GET["my_req_key"], $_GET["my_req_secret"]);
	$oTweet->sendTweet($msg);
	

?>

