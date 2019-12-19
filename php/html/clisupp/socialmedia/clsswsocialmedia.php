<?php

class SwSocialMedia
{
	var $swconn;
	var $swcacheconn;
	var $strProfileFilter;
	var $strAvailableSearches;
	var $swAnalystID;
	var $swAnalystIsAdmin;
	
	function SwSocialMedia()
	{
		//-- Control Function
		//-- Handle Social Media Function on Front end

		//-- Check session to get profile permissions, if no session id then exit;
		if(gv('sessid')!="")
		{
			$this->setProfileFilter(gv('sessid'));
			$this->setAnalystAvailableSearchIds();
		}
		elseif($_COOKIE['swsessid']!="")
		{
			$this->setProfileFilter($_COOKIE["swsessid"]);
			$this->setAnalystAvailableSearchIds();
		}
		else
		{
			echo "Supportworks Session Authentication Failure.";
		}
		
	}

	function setProfileFilter($sessid)
	{
		//echo $_SESSION['wc_analystid'];
		$strProfileFilter="";
		$this->swAnalystID = $_SESSION['wc_analystid'];
		$this->swAnalystIsAdmin = ($_SESSION['wc_privlevel']==3);
		//-- Get profiles permitted for analyst
		$rsPermittedProfiles = $this->getAnalystProfiles($this->swAnalystID);
		if(($rsPermittedProfiles!=false)&&(!$rsPermittedProfiles->eof))
		{
			while(!$rsPermittedProfiles->eof)
			{
				if($strProfileFilter!="") $strProfileFilter.=",";
				$strProfileFilter .= "'".$rsPermittedProfiles->f("fk_acc_id")."'";
				$rsPermittedProfiles->movenext();
			}

			if($strProfileFilter=="")
			$strProfileFilter="'-1'";
			$this->strProfileFilter = $strProfileFilter;
		}
	}

	function getAnalystProfiles($analystid)
	{
		$this->get_db_connection();
		$strSQL = "select fk_acc_id from socmed_analysts where fk_analyst_id='".pfs($analystid)."'";
		$rsResult = $this->swconn->Query($strSQL,true);	
		return $rsResult;
	}

	function setAnalystAvailableSearchIds()
	{
		$strAvailableSearches="";
		$this->get_db_connection();
		$strSQL = "select pk_id from socmed_monitors where search_analyst='".pfs($this->swAnalystID)."' or shared_search=1 or monitor_type='mention'";
		$rsPermittedSearches = $this->swconn->Query($strSQL,true);	
		if(($rsPermittedSearches!=false)&&(!$rsPermittedSearches->eof))
		{
			while(!$rsPermittedSearches->eof)
			{
				if($strAvailableSearches!="") $strAvailableSearches.=",";
				$strAvailableSearches .= $rsPermittedSearches->f("pk_id");
				$rsPermittedSearches->movenext();
			}

			if($strAvailableSearches=="")
				$strAvailableSearches="'-1'";
				
			$this->strAvailableSearches = $strAvailableSearches;
		}
	
		
	}

	function showMessageList($oDivID, $strFeedType="", $strFeedId="", $startFromCommsId=0, $bShowHeader=false, $strFeedName="")
	{
		//-- Return a list of messages based on specified criteria
		$this->get_db_connection();
		$strDB = $this->swconn->get_database_type();
		$strSQL = "";
		$strLimit = "";
		if($strDB=="mssql")
		{
			$strSQL = "select top 30 * from socmed_comms where ";
		}
		else if($strDB=="oracle")
		{
			$strSQL = "select * from socmed_comms where rownum <=30 and";
		}
		else
		{
			$strSQL = "select * from socmed_comms where ";
			$strLimit = " limit 30";
		}
		
		$strSQL .= " (parent_comms_id is null or parent_comms_id='0' or parent_comms_id='') and status not in ('Disregarded','Closed') and fk_monitor_id IN (".$this->strAvailableSearches.")";
		if($strFeedType=="search")
		{
			$strSQL .= " and fk_monitor_id = ".pfs($strFeedId);
		}
		else if ($strFeedType=="mention")
		{
			$strSQL .= " and msg_text like '%".pfs($strFeedId)."%'";
		}
		if($startFromCommsId>0)
		{
			//$strSQL .= " and pk_comms_id < ".$startFromCommsId;
			$strSQL .= " and msg_id < ".pfs($startFromCommsId);
		}
		
		//$strSQL .= " order by msg_id desc";
		$strSQL .= " order by msg_datex desc";
		if($strLimit!="")
		{
			$strSQL .= $strLimit;
		}
		//echo $strSQL;
		
		$rsResult = $this->swconn->Query($strSQL,true);	

		//-- Need to create message container when first adding a filter
		if($bShowHeader=="true")
		{
			//-- Build Feed Title
			if(($strFeedName=="undefined") && ($strFeedId!=""))
			{
				$strFeedTitle = "Mentions of ".$strFeedId;
			}
			else if(($strFeedName!="undefined") && ($strFeedName!=""))
			{
				$strFeedTitle = "Search results for ".$strFeedName;
			}
			else
			{
				$strFeedTitle = "All Messages";
			}

			$strOutput = "<div class='messagelisttitlebar'><div class='messagelisttitlebarname'>".$strFeedTitle."</div><div class='messagelisttitlebaractions'><a href='Javascript:load_feed(\"$oDivID\",\"".gv('sessid')."\",\"$strFeedType\",\"$strFeedId\",0,true,\"$strFeedName\");loadHiddenIframeWA();'><img src=\"img/icons/reload.png\" alt=\"Refresh Messages\"/></a></div></div>";
			$strOutput .= "<div class='messagelist' id='messagelist'>";
			//$strOutput .= "Last Refreshed: ".SwFormatDateTimeColumn("socmed_comms.msg_datex",time());
		}

		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			$maxMsgId=0; //-- Use to track last viewed msg id so we know where to page from	
			$msgCount=0; //-- Track no of messages to determine whether to display "Show More" option
			while(!$rsResult->eof)
			{
				$user_name=$rsResult->f("user_name");
				$user_id=$rsResult->f("user_id");
				$strOutput .= "<div class='messagewrap' id='messagewrap".$rsResult->f("pk_comms_id")."'>";
					$strOutput .= "<div class='avatar'><img class='avatar' id='avatar' src='".$rsResult->f("imgurl")."'></div>";
				
					$strOutput .= "<div class='message'>";
					$strOutput .= "<div class='messageheader'><div class='messageauthor'><a class='messagelist' href='Javascript:showUser(\"infopanel\",".$rsResult->f("user_id").",\"$user_name\",\"".gv('sessid')."\");loadHiddenIframeWA();'>@".$rsResult->f("user_name")."</a></div>";
				$strOutput .= "<div class='messagelinks'>";
				$strOutput .= " &nbsp; <a id='rt".$rsResult->f("msg_id")."' href=\"Javascript:showRetweetProfileSelection('rtc".$rsResult->f("msg_id")."','".$rsResult->f("msg_id")."','".gv('sessid')."');\"><img src=\"./img/icons/arrow_refresh.png\" alt=\"Retweet\"></a>";
				$strOutput .= " &nbsp; <a href='Javascript:send_reply(".$rsResult->f("pk_comms_id").",\"$user_name\",".$rsResult->f("msg_id").",\"\",\"\",\"".gv('sessid')."\");'><img src=\"./img/icons/comment_edit.png\" alt='Reply'></a> &nbsp;<a href='Javascript:deleteTweet(".$rsResult->f("pk_comms_id").");'><img src=\"./img/icons/comment_delete.png\" alt='Delete'></a>";
				
				if($rsResult->f("fk_callref") > 0)
				{
					$strOutput .= " &nbsp; <a href='hsl:calldetails?callref=".$rsResult->f("fk_callref")."'>".swcallref_str($rsResult->f("fk_callref"))."</a>";
				}
				else
				{
					
					$strOutput .= " &nbsp; <a		href=\"hsl:logcall?userdb.keysearch=".$rsResult->f("fk_user_key")."&updatedb.updatetxt=".htmlentities($rsResult->f("msg_text")).$rsResult->f("fk_user_key")."\"><img src=\"./img/icons/application_form_add.png\" alt='Log a New Request'></a>";
					
				}
				$strOutput .= "</div></div>";
				$strOutput .= "<div id='rtc".$rsResult->f("msg_id")."' class='profilepicker'></div>";
						$strOutput .= "<div class='messagetext'>".$this->parseTwitterMessageText($rsResult->f("msg_text"),$rsResult->f("user_id"))."  </div>";
						$strOutput .= "<div class='messagetime'>".$this->parseDateToTweetTime($rsResult->f("msg_datex"),true)."</div>";
						
						if($rsResult->f("has_related_msgs")=="1")
						{
							$strOutput .= "<div class='messagefooter''><a href='Javascript:showConversation(\"".$rsResult->f("msg_id")."\",\"".gv('sessid')."\",\"".$user_name."\");'><img src=\"./img/icons/comments.png\" alt='Show/Hide Conversation'>Show/Hide Conversation</a></div>";
						}
						$strOutput .= "<div class='messageconv' id='messageconv".$rsResult->f("msg_id")."'>Related Tweets</div>";
						
					$strOutput .= "</div>";
				$strOutput .= "</div><div class='msgspacerbtm'></div>";
				
				//$maxMsgId = $rsResult->f("pk_comms_id");
				$maxMsgId = $rsResult->f("msg_id");
				$msgCount++;
				$rsResult->movenext();
			}

			//-- Display "Show More" option only if max tweets are returned in query
			if(!($msgCount<30))
				$strOutput .= "<div class='messageloadmore' id='messageloadmore$maxMsgId'><a href='Javascript:load_feed(\"messagelist\",\"".gv('sessid')."\",\"$strFeedType\", \"$strFeedId\", \"$maxMsgId\",false);'><b>Load More Results</b></a></div>";
			
		}
		else
		{
			$strOutput .= "<br/><br/><b>No Current Results Found</b>";
		}

		if($bShowHeader=="true")
			$strOutput .= "</div>";

		echo $strOutput;
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

	function parseDateToTweetTime($time, $bEpochIn=false) {
	  if(!$bEpochIn)
	  {
	    $time = $this->parseDateToEpoch($time);
		$fallbacktime = SwFormatDateTimeColumn("socmed_comms.msg_datex",$time);
	  }
	  $fallbacktime = SwFormatDateTimeColumn("socmed_comms.msg_datex",$time);
	  $minspassed = time() - $time;
	  if ($minspassed < 60) {
		return 'less than a minute ago.';
	  } else if ($minspassed < 120) {
		return 'about a minute ago.';
	  } else if ($minspassed < (45 * 60)) {
		return floor($minspassed / 60) . ' minutes ago.';
	  } else if ($minspassed < (90 * 60)) {
		return 'about an hour ago.';
	  } else if ($minspassed < (24 * 60 * 60)) {
		return 'about ' . floor($minspassed / 3600) . ' hours ago.';
	  } else if ($minspassed < (48 * 60 * 60)) {
		return '1 day ago.';
	  } else {
		//return floor($minspassed / 86400) . ' days ago.';
		return $fallbacktime;
	  }
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


	function showMainMenu()
	{
		$strOutput = "";

		//-- All Message Link
		$strOutput .= "<li class='listmenuitem'><a class='msgmenulink' href='Javascript:load_feed(\"msgfeed\",\"".gv('sessid')."\",\"\",\"\",0,true);'>View All Messages</a></li>";

		//-- New Update Link
		$strOutput .= "<li class='listmenuitem'><a class='msgmenulink' href='Javascript:send_update(\"".gv('sessid')."\");'>New Update</a></li>";

		//-- Profiles
		$strOutput .= $this->showProfiles();

		//-- Searches
		$strOutput .= $this->showSearches();

		echo $strOutput;
	}

	function showProfiles()
	{
		$strOutput="<ul>";
		$rsProfiles = $this->get_user();
		
		$strOutput="<li class='listmenuheading'>Profiles</li>";
		if(($rsProfiles!=false)&&(!$rsProfiles->eof))
		{
			while(!$rsProfiles->eof)
			{
				$screen_name = $rsProfiles->f("sm_acc_name");
				$screen_img = $rsProfiles->f("sm_acc_type_img");
				$strOutput.="<li class='listmenuitem'><div class='msgmenulink'><a class='msgmenulink' href='Javascript:load_feed(\"msgfeed\",\"".gv('sessid')."\",\"mention\",\"@$screen_name\",0,true);'><img src=\"$screen_img\" width='24' alt=\"@$screen_name\">@".$screen_name."</a></div></li>";
				//Direct Messages Inbox
				$strOutput.="<li class='listmenuitem'><a class='msgmenulink' href='Javascript:loadDMs(\"msgfeed\",\"".gv('sessid')."\",1,\"".$rsProfiles->f("sm_acc_id")."\");'>- Direct Message Inbox</a></li>";
				//Direct Messages Sent
				$strOutput.="<li class='listmenuitem'><a class='msgmenulink' href='Javascript:loadSentDMs(\"msgfeed\",\"".gv('sessid')."\",1,\"".$rsProfiles->f("sm_acc_id")."\");'>- Direct Messages Sent</a></li>";
				//User Home Timeline
				$strOutput.="<li class='listmenuitem'><a class='msgmenulink' href='Javascript:loadTimeline(\"msgfeed\",\"".gv('sessid')."\",1,\"".$rsProfiles->f("sm_acc_id")."\");'>- Home Timeline</a></li>";

				$rsProfiles->movenext();
			}
		}

		return $strOutput;
	}

	function showSearches()
	{
		//$strOutput="<ul>";
		$rsActiveSearches = $this->getSearches(true);
		$rsInactiveSearches = $this->getSearches(false);
		
		$strOutput.="<li class='listmenuheading'>Search</li>";
		$strOutput.="<li class='listmenuitem'><input type='text' name='searchquery' id='searchquery'>&nbsp;<a class='msgmenulink' href=\"Javascript:runSearch(document.getElementById('searchquery').value,document.getElementById('msgfeed'),'".gv('sessid')."');\"><img src='./img/icons/zoom.png' alt='Search'></a></li>";

		$strOutput.="<li class='listmenuheading'>Scheduled Searches&nbsp;&nbsp;</li>";
		if(($rsActiveSearches!=false)&&(!$rsActiveSearches->eof))
		{
			while(!$rsActiveSearches->eof)
			{
				if((strtolower($this->swAnalystID)==strtolower($rsActiveSearches->f("search_analyst"))) || ($rsActiveSearches->f("shared_search")==1))
				{
					$strMonitorName = $rsActiveSearches->f("monitor_name");
					$strOutput.="<li class='listmenuitem'><a class='msgmenulink' href='Javascript:load_feed(\"msgfeed\",\"".gv('sessid')."\",\"search\",".$rsActiveSearches->f("pk_id").",0,true,\"$strMonitorName\");'>".$rsActiveSearches->f("monitor_name")."</a>";
					
					if((strtolower($this->swAnalystID)==strtolower($rsActiveSearches->f("search_analyst"))) || $this->swAnalystIsAdmin)
					{
						$strOutput.=" - <a href='Javascript:edit_search(".$rsActiveSearches->f("pk_id").",\"".gv('sessid')."\");'><img src=\"./img/icons/bullet_edit.png\" alt='Edit'></a>&nbsp;<a href='Javascript:delete_search(".$rsActiveSearches->f("pk_id").", \"".gv('sessid')."\", \"navColum\");'><img src=\"./img/icons/control_cross.png\" alt='Delete'></a>";
					}
					$strOutput.="</li>";
				}
				$rsActiveSearches->movenext();
			}
		}

		//$strOutput.="</ul><ul>";

		$strOutput.="<li class='listmenuheading'>Inactive Searches</li>";
		if(($rsInactiveSearches!=false)&&(!$rsInactiveSearches->eof))
		{
			while(!$rsInactiveSearches->eof)
			{
				if((strtolower($this->swAnalystID)==strtolower($rsInactiveSearches->f("search_analyst"))) || ($rsInactiveSearches->f("shared_search")==1))
				{
					$strMonitorName = $rsInactiveSearches->f("monitor_name");
					$strOutput.="<li class='listmenuitem'><a class='msgmenulink' href='Javascript:load_feed(\"msgfeed\",\"".gv('sessid')."\",\"search\",".$rsInactiveSearches->f("pk_id").",0,true,\"$strMonitorName\");'>".$rsInactiveSearches->f("monitor_name")."</a>";
					
					if((strtolower($this->swAnalystID)==strtolower($rsInactiveSearches->f("search_analyst"))) || $this->swAnalystIsAdmin)
					{
						$strOutput.=" - <a href='Javascript:edit_search(".$rsInactiveSearches->f("pk_id").",\"".gv('sessid')."\");'><img src=\"./img/icons/bullet_edit.png\" alt='Edit'></a>&nbsp;<a href='Javascript:delete_search(".$rsInactiveSearches->f("pk_id").", \"".gv('sessid')."\", \"navColum\");'><img src=\"./img/icons/control_cross.png\" alt='Delete'></a>";
					}
					$strOutput.="</li>";
				}
				$rsInactiveSearches->movenext();
			}
		}

		$strOutput.="</ul>";
		
		return $strOutput;
	}

	function getSearch($pk_search_id)
	{
		$this->get_db_connection();
		if($pk_search_id!="")
		{
			$strSQL = "select * from socmed_monitors where pk_id=".pfs($pk_search_id);
			$rsResult = $this->swconn->Query($strSQL,true);	
			return $rsResult;
		}

		return false;
	}

	function getSearches($bActive=true, $type='search')
	{
		$this->get_db_connection();
		if($bActive)
		{
			$strSQL = "select pk_id, monitor_name,search_analyst, shared_search from socmed_monitors where monitor_type='".$type."' and start_datex <= ".time()." and end_datex > ".time();
		}
		else
		{
			$strSQL = "select pk_id, monitor_name,search_analyst, shared_search from socmed_monitors where monitor_type='".$type."' and start_datex > ".time()." or (start_datex <= ".time()." and end_datex < ".time().")";
		}
		
		$rsResult = $this->swconn->Query($strSQL,true);	
		return $rsResult;
	}

	function addSearch($sm_acc_name, $appid, $start_datex, $end_datex, $strSearchQry,$strCreatedBy,$bSharedSearch)
	{
		//-- Add a saved search
		$this->get_db_connection();
		$strSQL = "insert into socmed_monitors (monitor_name,flg_search_twitter,start_datex,end_datex,search_query,monitor_type,search_analyst,shared_search) values ('".pfs($sm_acc_name)."',1,".$start_datex.",".$end_datex.",'".pfs($strSearchQry)."','search','".pfs($strCreatedBy)."','".pfs($bSharedSearch)."')";
		$this->swconn->Query($strSQL,true);	
	}

	function updateSearch($pk_id, $sm_acc_name, $appid, $start_datex, $end_datex, $strSearchQry, $strCreatedBy, $bSharedSearch)
	{
		//-- Update a saved search
		$this->get_db_connection();
		$strSQL = "update socmed_monitors set monitor_name='".pfs($sm_acc_name)."', flg_search_twitter=1, start_datex=".$start_datex.", end_datex=".$end_datex.", search_query='".pfs($strSearchQry)."', monitor_type='search', search_analyst='".pfs($strCreatedBy)."', shared_search='".pfs($bSharedSearch)."' where pk_id=".$pk_id;
		$this->swconn->Query($strSQL,true);	
	}

	function deleteSearch($pk_id)
	{
		//-- Update a saved search
		$this->get_db_connection();
		$strSQL = "delete from socmed_monitors where pk_id=".$pk_id;
		$this->swconn->Query($strSQL,true);	
	}

	function deleteMessage($msgid)
	{
		//-- Mark a message as deleted so we can hide from views
		$this->get_db_connection();
		$strSQL = "update socmed_comms set status='Disregarded' where pk_comms_id = ".$msgid;
		$this->swconn->Query($strSQL,true);	
	}

	function get_user($userId="")
	{
		$this->get_db_connection();
		if($userId=="")
		{
			$strSQL = "select * from socmed_twitter_acts where sm_acc_id IN (".$this->strProfileFilter.")";
		}
		else
		{
			$strSQL = "select * from socmed_twitter_acts where sm_acc_id=".pfs($userId)." AND sm_acc_id IN (".$this->strProfileFilter.")";
		}
		$rsResult = $this->swconn->Query($strSQL,true);
		return $rsResult;
		
	}

	function get_sw_user($userId)
	{
		//-- Try to identify a Supportworks Customer
		$swkeysearch="";
		$this->get_db_connection();
		$strSQL = "select keysearch from userdb where twitter_id='".pfs($userId)."'";
		$rsResult = $this->swconn->Query($strSQL,true);
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			$swkeysearch = $rsResult->f("keysearch");
		}
		return $swkeysearch;
	}

	function get_db_connection()		
	{
		//-- create our database connects to swdata
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
		$this->swconn = $swconn;
	}

	function get_cache_db_connection()		
	{
		//-- create our database connects to swdata
		$swcacheconn = new CSwDbConnection();
		$swcacheconn->Connect("sw_systemdb", swcuid(), swcpwd());
		$this->swcacheconn = $swcacheconn;
	}


	/********** 
	/* Communication Functions
	
		These may overlap with Search functions and may need a new consolidated class in future

	*/
	
	function format_communication($oCommunication, $strAppType, $apicall)
	{
		//-- Format values from API call into standard format for insert/update as each
		//-- api call returns values under different structures and variable names
		$arrSwComms = array();
		if($strAppType=="Twitter")
		{
			switch($apicall)
			{
				case "home_timeline":
					$arrSwComms["fk_app_type"] = $strAppType;
					$arrSwComms["status"]="New";
					$arrSwComms["user_id"]=$oCommunication->user->id;
					$arrSwComms["user_name"]=$oCommunication->user->screen_name;
					$arrSwComms["msg_id"]=$oCommunication->id_str;
					$arrSwComms["msg_text"]=$oCommunication->text;
					$arrSwComms["created_at"]=$this->parseDateToEpoch($oCommunication->created_at);
					$arrSwComms["profile_img_url"]=$oCommunication->user->profile_image_url;
					$arrSwComms["fk_user_key"]=$this->get_sw_user($oCommunication->user->id);
					$arrSwComms["fk_monitor_id"]="";
					$arrSwComms["has_related_msgs"]="";
					$arrSwComms["to_user_id"]="";
					$arrSwComms["to_user_name"]="";
					break;
				case "search":
					$arrSwComms["fk_app_type"] = $strAppType;
					$arrSwComms["status"]="New";
					$arrSwComms["user_id"]=$oCommunication->user->id;
					$arrSwComms["user_name"]=$oCommunication->user->screen_name;
					$arrSwComms["msg_id"]=$oCommunication->id_str;
					$arrSwComms["msg_text"]=$oCommunication->text;
					$arrSwComms["created_at"]=$this->parseDateToEpoch($oCommunication->created_at);
					$arrSwComms["profile_img_url"]=$oCommunication->user->profile_image_url;
					$arrSwComms["fk_user_key"]=$this->get_sw_user($oCommunication->from_user_id);
					$arrSwComms["fk_monitor_id"]="";
					$arrSwComms["has_related_msgs"]="";
					$arrSwComms["to_user_id"]="";
					$arrSwComms["to_user_name"]="";
					break;
			}
		}

		return $arrSwComms;
	}

	function create_communication($oCommunication, $strAppType, $apicall)
	{
		//-- Format values from API call into standard format for insert/update
		$arrSwComms = $this->format_communication($oCommunication, $strAppType, $apicall);
		
		$intNewCommunicationID=0;

		if(count($arrSwComms) > 0)
		{
			//-- Create an entry for the result in our communication table (update to API call)
			$this->get_db_connection();

			$strSQL = "insert into socmed_comms (user_id,user_name,msg_id,msg_text,msg_datex,fk_app_type,status,imgurl,fk_user_key, fk_monitor_id, has_related_msgs, to_user_id, to_user_name) values ('".pfs($arrSwComms["user_id"])."','".pfs($arrSwComms["user_name"])."','".pfs($arrSwComms["msg_id"])."','".pfs($arrSwComms["msg_text"])."','".$arrSwComms["created_at"]."','".pfs($arrSwComms["fk_app_type"])."','".$arrSwComms["status"]."','".$arrSwComms["profile_img_url"]."','".pfs($arrSwComms["fk_user_key"])."','".$arrSwComms["fk_monitor_id"]."','".$arrSwComms["has_related_msgs"]."','".pfs($arrSwComms["to_user_id"])."','".pfs($arrSwComms["to_user_name"])."')";
			//echo $strSQL;
			$this->swconn->Query($strSQL);

			$strSQL = "select pk_comms_id from socmed_comms where fk_app_type='Twitter' and msg_id='".$arrSwComms["msg_id"]."'";
			$rsNewCommunication = $this->swconn->Query($strSQL,true);	
			if(($rsNewCommunication!=false)&&(!$rsNewCommunication->eof))
			{
				$intNewCommunicationID = $rsNewCommunication->f("pk_comms_id");
			}

			return $intNewCommunicationID;
		}
	}


	/********** 
	/* Analyst Permission Functions
	*/

	function listSwGroups($strProfileID)
	{
		$arrGroups = array();
		$this->get_cache_db_connection();
		$strSQL = "select * from swgroups where id <> '_SYSTEM' order by name asc"; 
		$rsResult = $this->swcacheconn->Query($strSQL,true);
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			//$strOutput .= "<a href=\"Javascript:showProfileAnalysts('assocanalysts','".$strProfileID."','".gv('sessid')."','');\">All Support Groups</a><BR>";
			while(!$rsResult->eof)
			{
				if($rsResult->f("parent_id")=="")
				{
					$arrGroups[$rsResult->f("id")]['name'] = $rsResult->f("name");
				}
				else
				{
					
					$arrGroups[$rsResult->f("parent_id")]['subgroup'][$rsResult->f("id")] = $rsResult->f("name");
				}

				$rsResult->movenext();
			}

			foreach($arrGroups as $group=>$value)
			{
				//echo $group." : ".$value['name']."<BR>";
				if(isset($value['subgroup']))
				{
					$strOutput .= "<a href=\"Javascript:dataChange();showProfileAnalysts('assocanalysts','".$strProfileID."','".gv('sessid')."','".$group."');\">".$value['name']."</a><BR>";
					foreach($value['subgroup'] as $subgroup=>$subvalue)
					{
						//echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".$subgroup." : <a href=\"Javascript:alert('".$subgroup."');\">".$subvalue."</a><BR>";
						$strOutput .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<a href=\"Javascript:dataChange();showProfileAnalysts('assocanalysts','".$strProfileID."','".gv('sessid')."','".$subgroup."');\">".$subvalue."</a><BR>";
					}
				}
				else
				{
					$strOutput .= "<a href=\"Javascript:dataChange();showProfileAnalysts('assocanalysts','".$strProfileID."','".gv('sessid')."','".$group."');\">".$value['name']."</a><BR>";
				}
			}
		}

		echo $strOutput;
	}

	function listSwGroupsForGenSettings()
	{
		$arrGroups = array();
		$this->get_cache_db_connection();
		$strSQL = "select * from swgroups where id <> '_SYSTEM' order by name asc"; 
		$rsResult = $this->swcacheconn->Query($strSQL,true);	
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			while(!$rsResult->eof)
			{
				if($rsResult->f("parent_id")=="")
				{
					$arrGroups[$rsResult->f("id")]['name'] = $rsResult->f("name");
				}
				else
				{
					
					$arrGroups[$rsResult->f("parent_id")]['subgroup'][$rsResult->f("id")] = $rsResult->f("name");
				}

				$rsResult->movenext();
			}

			foreach($arrGroups as $group=>$value)
			{
				if(isset($value['subgroup']))
				{
					$strOutput .= "<a href=\"Javascript:dataChange();showGroupProfiles('assocprofiles','".$strProfileID."','".gv('sessid')."','".$group."');\">".$value['name']."</a><BR>";
					foreach($value['subgroup'] as $subgroup=>$subvalue)
					{
						$strOutput .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<a href=\"Javascript:dataChange();showGroupProfiles('assocprofiles','".$strProfileID."','".gv('sessid')."','".$subgroup."');\">".$subvalue."</a><BR>";
					}
				}
				else
				{
					$strOutput .= "<a href=\"Javascript:dataChange();showGroupProfiles('assocprofiles','".$strProfileID."','".gv('sessid')."','".$group."');\">".$value['name']."</a><BR>";
				}
			}
		}

		echo $strOutput;
	}

}
?>