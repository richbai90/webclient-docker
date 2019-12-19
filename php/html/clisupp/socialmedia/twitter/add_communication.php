<?php

	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('clstwitter.php');
	include('../clsSwSocialMedia.php');
	include_once('../lib_oauth.php');
	include_once('../lib_json.php');
	include_once('config.php');

	if(gv('intTweetId')!="")
	{
		$SwSocialMedia = new SwSocialMedia();

		//-- Get Tweet Content
		$twitter = new Twitter();
		$oTweet = $twitter->getTweet(gv('intTweetId'));
		
		//-- Create New Communication Entry if it does not already exist
		$SwSocialMedia->get_db_connection();
		$intNewCommsID=0;
		$strSQL = "select pk_comms_id from socmed_comms where fk_app_type='".pfs(gv('strAppType'))."' and msg_id='".pfs(gv('intTweetId'))."'";
		$rsComm = $SwSocialMedia->swconn->Query($strSQL,true);	
		if(($rsComm!=false)&&(!$rsComm->eof))
		{
			$intNewCommsID = $rsComm->f("pk_comms_id");
		}

		if($intNewCommsID==0)
			$intNewCommsID = $SwSocialMedia->create_communication($oTweet, gv('strAppType'), gv('strAPICall'));

		echo $intNewCommsID;
	}

?>