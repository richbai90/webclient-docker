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

	$ret = oauth_request($keys, "https://api.twitter.com/1.1/direct_messages/sent.json?count=100&page=".$maxMsgSearchPage);
	//if (!strlen($ret)) dump_last_request();
	$strErrorMsg = "";
	if ((!strlen($ret)) || (substr($ret,0,6)=="200OK.")) $strErrorMsg = handle_request_failure();

	$oSearchResults = json_decode($ret);
	

	if($maxMsgSearchPage==1)
	{
		if(gv('intPageId')!=-1)
		{
			$strOutput = "<div class='messagelisttitlebar'><div class='messagelisttitlebarname'>Direct Messages</div><div class='messagelisttitlebaractions'></div></div>";
			$strOutput .= "<div class='messagelist' id='messagelist'>";
		}
		//$strOutput .= "Last Refreshed: ".SwFormatDateTimeColumn("socmed_comms.msg_datex",time());
	}

	if($oSearchResults)
	{
		
		foreach($oSearchResults as $oCommunication)
		{
			
			$msgCount=0; //-- Track no of messages to determine whether to display "Show More" option
				
			$user_name=$oCommunication->sender_screen_name;
			$recipient_name=$oCommunication->recipient_screen_name;
			$strOutput .= "<div class='messagewrap' id='messagewrap".$oCommunication->id."'>";
				$strOutput .= "<div class='avatar'><img class='avatar' id='avatar' src='".$oCommunication->sender->profile_image_url."'></div>";
			
				$strOutput .= "<div class='message'>";
				$strOutput .= "<div class='messageheader'><div class='messageauthor'><a href='Javascript:showUser(\"infopanel\",".$oCommunication->sender_id.",\"$user_name\",\"".gv('sessid')."\");'>@".$oCommunication->sender_screen_name."</a> to <a href='Javascript:showUser(\"infopanel\",".$oCommunication->recipient_id.",\"$recipient_name\",\"".gv('sessid')."\");'>@".$oCommunication->recipient_screen_name."</a></div>";
				
				$strOutput .= "<div class='messagetext'>".parseTwitterMessageText($oCommunication->text,$oCommunication->sender_id)."  </div>";
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
			if((!$msgCount<100) && ($maxMsgSearchPage<16))
				$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadDMs('messagelist','".gv('sessid')."',".$maxMsgSearchPage.",'".$strUserId."');\"><b>Load More Results</b></a></div>";
	}
	else if($strErrorMsg!="")
	{
		$strOutput .= "<br/><br/><b>$strErrorMsg</b>";
		if($maxMsgSearchPage==1)
		{
			$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadDMs('messagelist','".gv('sessid')."',-1,'".$strUserId."');\"><b>Load More Results</b></a></div>";
		}
		else
		{
			$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgSearchPage'><a href=\"Javascript:loadDMs('messagelist','".gv('sessid')."',".$maxMsgSearchPage.",'".$strUserId."');\"><b>Load More Results</b></a></div>";
		}

	}
	else
	{
		$strOutput .= "<br/><br/><div class='messageloadmore'><b>No Current Results Found</b></div>";
	}
?>

<?php
	echo $strOutput;
?>