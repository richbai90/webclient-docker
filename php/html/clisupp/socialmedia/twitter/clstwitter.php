<?php 

include_once('../lib_oauth.php');
include_once('../lib_json.php');
include_once('config.php');


class Twitter
{
	var $user_key = "";
	var $user_secret = "";
		
	function Twitter($key, $secret)
	{
		$this->user_key = $key;
		$this->user_secret = $secret;
	}

	function parseDateToEpoch($time)
	{
		if(strtotime($time)==-1)
		{
			$arrDate=explode(" ",$time);
			$time=$arrDate[0].", ".$arrDate[2]." ".$arrDate[1]." ".$arrDate[5]." ".$arrDate[3]." ".$arrDate[4];
		}
		$epochtime = strtotime($time);
		
		return $epochtime;
	}

	function sendTweet($strMsg, $nTweetReplyMsgID=0, $nReplyMsgID=0, $analystid="")
	{
		$keys = array(
			'oauth_key'		=> OAUTH_CONSUMER_KEY,
			'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
			'user_key'		=> $this->user_key,
			'user_secret'	=> $this->user_secret,
		);

		$params = array();
		$params['status'] = $strMsg;
		$has_related_msgs=0;
		if($nTweetReplyMsgID>0)
		{
			$params['in_reply_to_status_id'] = $nTweetReplyMsgID;
			$params['in_reply_to_status_id_str'] = $nTweetReplyMsgID;
			$has_related_msgs=1;
		}
		$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/update.json",$params,"POST");
		if (!strlen($ret)) 
		{
			echo handle_request_failure();
			return;
		}
		
		$oResults = json_decode($ret); 

		//-- Implement API call on 5015 to insert into socmed_comms table or log a call
		//-- NOTE: This should be migrated to use the API calls rather than DB in future
		include_once('stdinclude.php');								//-- standard functions
		include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class

		//-- create our database connects to swdata and systemdb
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
					
		$strSQL = "insert into socmed_comms (user_id,user_name,user_fullname,msg_id,msg_text,msg_datex,fk_app_type,status,imgurl,parent_comms_id, has_related_msgs,analystid) values ('".pfs($oResults->user->id)."','".pfs($oResults->user->screen_name)."','".pfs($oResults->user->name)."','".$oResults->id_str."','".pfs($oResults->text)."','".$this->parseDateToEpoch($oResults->created_at)."','Twitter','New','".$oResults->user->profile_image_url."','".$nTweetReplyMsgID."',".$has_related_msgs.",'".pfs($analystid)."')";
		$swconn->Query($strSQL);

		//-- If a reply message then update parent message to indicate related messages
		if($nTweetReplyMsgID>0)
		{
			if($nReplyMsgID!="<div style")
			{
				$strSQL = "update socmed_comms set has_related_msgs=1, parent_comms_id='".$oResults->id_str."' where pk_comms_id=".$nReplyMsgID;
				$swconn->Query($strSQL);
			}
		}

		echo "Message Sent";
	}

	function getTweet($tweetid)
	{
		//-- Get Tweet Object by ID
		
			$keys = array(
				'oauth_key'		=> OAUTH_CONSUMER_KEY,
				'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
				'user_key'		=> "",
				'user_secret'	=> "",
			);

			$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/show/".$tweetid.".json");
			
			if (!strlen($ret)) dump_last_request();
			
			$oResults = json_decode($ret);
			return $oResults;
		
	}

	function sendDM($strSenderProfileScreenName, $strScreenName, $strUserId, $strMsg)
	{
		$keys = array(
			'oauth_key'		=> OAUTH_CONSUMER_KEY,
			'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
			'user_key'		=> $this->user_key,
			'user_secret'	=> $this->user_secret,
		);

		$params = array();
		$params['screen_name'] = $strScreenName;
		$params['user_id'] = $strUserId;
		$params['text'] = $strMsg;
		
		//-- Check if we follow the intended recipient and they follow us
		$ret = oauth_request($keys, "https://api.twitter.com/1.1/friendships/exists.json?user_a=".$strSenderProfileScreenName."&user_b=".$strUserId);
		if($ret=="true")
		{
			$ret = oauth_request($keys, "https://api.twitter.com/1.1/friendships/exists.json?user_a=".$strUserId."&user_b=".$strSenderProfileScreenName);
			if($ret=="true")
			{
				$ret = oauth_request($keys, "https://api.twitter.com/1.1/direct_messages/new.json",$params,"POST");
				if (!strlen($ret)) echo handle_request_failure();
			
				$oResults = json_decode($ret); 
				return $oResults;
			}
			else
			{
				echo "@".$strScreenName." is not following @".$strSenderProfileScreenName.".<br/>@".$strScreenName." must follow your profile in order to receive direct messages from you.<br>";
				return false;
			}
		}
		else
		{
			echo "@".$strSenderProfileScreenName." is not following @".$strScreenName.".<br/>@".$strSenderProfileScreenName." must follow this customer in order to send direct messages.<br>";
			return false;
		}
	}

	
}








?>