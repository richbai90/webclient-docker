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

	function parseTwitterMessageText($strMsgText, $userId="")
	{
		$strMsgText = str_replace("--","-",$strMsgText);
		//-- http link
		$strMsgText = preg_replace("#(^|[\n ])([\w]+?://[\w]+[^ \"\n\r\t< ]*)#", "\\1<a href=\"\\2\" target=\"_blank\">\\2</a>", $strMsgText);
		//-- www/ftp link
		$strMsgText = preg_replace("#(^|[\n ])((www|ftp)\.[^ \"\t\n\r< ]*)#", "\\1<a href=\"http://\\2\" target=\"_blank\">\\2</a>", $strMsgText);
		//-- @user mentions
		$strMsgText = preg_replace("/@(\w+)/", "<a href=\"http://www.twitter.com/\\1\" target=\"_blank\">@\\1</a>", $strMsgText);
		$strMsgText = preg_replace("/@(\w+)/", "<a href='Javascript:showUser(\"infopanel\",".$userId.",\"\\1\",\"".gv('sessid')."\");'>@\\1</a>", $strMsgText);
		//-- # tags
		$strMsgText = preg_replace("/#(\w+)/", "<a href='Javascript:runSearch(\"\\1\",document.getElementById(\"msgfeed\"),\"".gv('sessid')."\");'>#\\1</a>", $strMsgText);

		return $strMsgText;
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

	//-- Start from result page 1 if no page specified
	$maxMsgSearchPage = 1;
	if(gv('intPageId')>1)
	{
		$maxMsgSearchPage=gv('intPageId'); //-- Use to track last viewed msg page so we know where to page from	
	}

	$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/home_timeline.json?page=".$maxMsgSearchPage);
	
	//if (!strlen($ret)) dump_last_request();
	$strErrorMsg = "";
	if ((!strlen($ret)) || (substr($ret,0,6)=="200OK.")) $strErrorMsg = handle_request_failure();
	
	$oSearchResults = json_decode($ret);
	
	if($maxMsgSearchPage==1)
	{
		if(gv('intPageId')!=-1)
		{
			$strOutput = "<div class='messagelisttitlebar'><div class='messagelisttitlebarname'>Timeline</div><div class='messagelisttitlebaractions'></div></div>";
			$strOutput .= "<div class='messagelist' id='messagelist'>";
		}
		//$strOutput .= "Last Refreshed: ".SwFormatDateTimeColumn("socmed_comms.msg_datex",time());
	}

	if($oSearchResults)
	{
		
		foreach($oSearchResults as $oCommunication)
		{
			
			$msgCount=0; //-- Track no of messages to determine whether to display "Show More" option
			
			$user_name=$oCommunication->user->screen_name;
			$fk_app_type="Twitter";
			$api_call="home_timeline";
			$strOutput .= "<div class='messagewrap' id='messagewrap".$oCommunication->id."'>";
				$strOutput .= "<div class='avatar'><img class='avatar' id='avatar' src='".$oCommunication->user->profile_image_url."'></div>";
			
				$strOutput .= "<div class='message'>";
				$strOutput .= "<div class='messageheader'><div class='messageauthor'><a href='Javascript:showUser(\"infopanel\",".$oCommunication->user->id.",\"$user_name\",\"".gv('sessid')."\");'>@".$oCommunication->user->screen_name."</a></div>";
			
			$strOutput .= "<div class='messagelinks'>";
			//echo "username:".$user_name." $oCommunication->id_str:".$oCommunication->id_str." $fk_app_type:".$fk_app_type." $api_call:".$api_call." session:".gv('sessid');
			$strOutput .= "<a href=\"Javascript:send_reply('','".$user_name."','".$oCommunication->id_str."','".$fk_app_type."','".$api_call."','".gv('sessid')."');\"><img src=\"./img/icons/comment_edit.png\" alt='Reply'></a> &nbsp;";
			
			//$strOutput .= "<a id='rt".$oCommunication->id_str."' href=\"Javascript:send_retweet('".$oCommunication->id."','".$oCommunication->id_str."',".$strUserId.",'".gv('sessid')."');\"><img src=\"./img/icons/arrow_refresh.png\" alt=\"Retweet\"></a>";
			$strOutput .= "<a id='rt".$oCommunication->id_str."' href=\"Javascript:showRetweetProfileSelection('rtc".$oCommunication->id_str."','".$oCommunication->id_str."','".gv('sessid')."');\"><img src=\"./img/icons/arrow_refresh.png\" alt=\"Retweet\"></a>";
			$strOutput .= "</div>";
			$strOutput .= "<br/><br/><div id='rtc".$oCommunication->id_str."' class='profilepicker'></div>";
			$strOutput .= "<div class='messagetext'>".parseTwitterMessageText($oCommunication->text,$oCommunication->user->id)."  </div>";
			$strOutput .= "<div class='messagetime'>".$SwSocialMedia->parseDateToTweetTime($oCommunication->created_at)."</div>";
										
				$strOutput .= "</div>";
			$strOutput .= "</div>";
				
			if($maxMsgSearchPage==1)
			{
				$strOutput .= "</div>";
			}

			$strOutput .= "<div class='msgspacerbtm'></div>";

			$msgCount++;
		}

		$maxMsgSearchPage++;

		//-- Display "Show More" option only if max tweets are returned in query
			if((!$msgCount<20) && ($maxMsgSearchPage<16))
				$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadTimeline('messagelist','".gv('sessid')."',".$maxMsgSearchPage.",'".$strUserId."');\"><b>Load More Results</b></a></div>";
	}
	else if($strErrorMsg!="")
	{
		$strOutput .= "<br/><br/><b>$strErrorMsg</b>";
		if($maxMsgSearchPage==1)
		{
			$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadTimeline('messagelist','".gv('sessid')."',-1,'".$strUserId."');\"><b>Load More Results</b></a></div>";
		}
		else
		{
			$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadTimeline('messagelist','".gv('sessid')."',".$maxMsgSearchPage.",'".$strUserId."');\"><b>Load More Results</b></a></div>";
		}

	}
	else
	{
		$strOutput .= "<br/><br/><b>No Current Results Found</b>";
	}
?>

<?php
	echo $strOutput;
?>