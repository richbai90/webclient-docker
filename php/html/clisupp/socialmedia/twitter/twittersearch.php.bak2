<?php
	
	//-- for DB Access until API Calls implemented
	include_once('stdinclude.php');								//-- standard functions
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');		//-- data base access class
	include_once('itsm_default/xmlmc/xmlmc.php');		//-- data base access class
	include_once('itsm_default/xmlmc/helpers/language.php');			//- used for lang_decode_to_utf

	include('../lib_oauth.php');
	include('../lib_json.php');
	include('config.php');

	#############################################################################################
	######
	######	New functions for search class

class SwSocialMediaSearch
{
	var $swconn;
	var $searchURL;
	var $oSearchResults;
	var $pk_monitor_id;
	var $sw_user_id;
	var $sm_from_user_id;
	var $oCommunication;
	var $oActiveSearches;
	var $oSearch;
	var $dtSearchRun;
	var $max_id_last_search;
	var $arrProfiles = array();
	var $arrMentions = array();
	var $arrTimeline = array();
	var $arrConversation = array();
	var $arrDescConversation = array();

	function SwSocialMediaSearch()
	{
		include_once('itsm_default/xmlmc/classactivepagesession.php');
		$_SESSION['server_name'] = _SERVER_NAME;
		$session = new classActivePageSession(gv('sessid'));
		if(!$session->IsValidSession())
		{
			return false;
		}		

		//-- Control Function
		//-- Run a search for results on the api
		$this->dtSearchRun = time();
		$this->max_id_last_search = 0;

		#create_search_log()

		$this->create_profile_array();
		//echo "1<br>";
		//$this->getMentions();
		//echo "Mentions";
		//echo "<pre>";
			//echo "</pre>";

		$this->getTimeline();
		//echo "<pre>";
		//print_r($this->arrTimeline);
		//echo "</pre>";
		//echo "<Br>Timeline Tweet Count:".count($this->arrTimeline)."<BR>";

		//--TESTING ONLY
		//$this->buildConversation();

		$this->get_active_searches();
		
		foreach($this->oActiveSearches->recorddata as $this->oSearch)
		{
			$this->max_id_last_search=1;

			$this->get_search_settings();
		
			$this->pk_monitor_id = $this->oSearch["pk_id"]->value;

			//-- Check if search is a search or mention and run appropriate function
			if($this->oSearch["monitor_type"]->value=="mention")
			{
				echo "getmentions";
				$this->getMentions($this->oSearch["max_id_last_search"]->value,$this->oSearch["monitor_name"]->value);
			}
			else
			{
				$this->create_search_string();
				//echo "<BR>".$this->searchURL;
				$this->get_search_results();
			}
				
			foreach($this->oSearchResults as $this->oCommunication)
			{
				

				if($this->oSearch["monitor_type"]->value=="mention")
				{
					//$this->sm_from_user_id = $this->oCommunication->screen_name;
					$this->oCommunication->user->screen_name = $this->oCommunication->user->screen_name;
					$this->oCommunication->user->id = $this->oCommunication->user->id;
					//$this->oCommunication->to_user = $this->oCommunication->user->screen_name;
					//$this->oCommunication->to_user_id = $this->oCommunication->user->id;
					$this->oCommunication->user->profile_image_url = $this->oCommunication->user->profile_image_url;
					//$this->oCommunication->id_str = $this->oCommunication->id;
					
				}
				
				$this->sm_from_user_id = $this->oCommunication->user->screen_name;
				echo $this->sm_from_user_id;
				$this->get_sw_user();

				//-- ENABLE FOR PRODUCTION USE
				if($this->buildConversation())
				{
					//echo "<BR>Setting Has related msgs = 1<BR>";
					$this->oCommunication->has_related_msgs = 1;
					//echo "<pre>";
					//print_r($this->oCommunication);
					//echo "</pre>";
				}

				if(_SEARCH_ACTION == "LOGCOMM")
				{
					if(!$this->communication_exists($this->oCommunication->id_str))
					{
						//echo "create comm:".$this->oCommunication->text."<BR><BR>";
						$this->create_communication();
					}
					else
					{
						echo $this->oCommunication->text."<BR><BR>";
						//echo "ID_STR=".$this->oCommunication->id_str." res: ".$this->communication_exists($this->oCommunication->id_str)."<BR>";
						
					}
				}
				elseif(_SEARCH_ACTION == "LOGCALL")
				{
					$this->create_call();
				}

				//echo "<BR>".$this->oCommunication->id_str." > ".$this->max_id_last_search;
				if($this->oCommunication->id_str > $this->max_id_last_search)
					$this->max_id_last_search = $this->oCommunication->id_str;
				
				//create_search_result_log_entry();
			}

			//--record the comm id for the most recent item returned, this will be used as the earliest starting point for the next search
			if($this->max_id_last_search>1)
			{
				//echo "<br>Update max_search_id=".$this->max_id_last_search;
				$this->set_max_search_comm_id();
			}
		}
		#close_search_log()
	}
	
	

	function get_search_results()
	{
		//-- Run the search query URL and return result object
		foreach($this->arrProfiles as $profile)
		{
			$keys = array(
			'oauth_key'		=> OAUTH_CONSUMER_KEY,
			'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
			'user_key'		=> $profile["sm_acc_key"],
			'user_secret'	=> $profile["sm_acc_secret"],
			);
		}
		//$ret = oauth_request($keys, "http://search.twitter.com/search.json?q=@the_techies");
		$ret = oauth_request($keys, $this->searchURL);
		if (!strlen($ret)) dump_last_request();

		$oResults = json_decode($ret);
		$this->oSearchResults = $oResults->statuses;
		//print_r($oResults);
	}

	function getMentions($since_id,$strProfileName)
	{

		//-- check we have a starting id if this profile has been newly added
		if(is_null($since_id) || $since_id < 1)
			$since_id=1;

		//-- Get mentions sent to the authenticated profiles, used to build conversations timeline
		//foreach($this->arrProfiles as $profile)
		//{
			$profile = $this->arrProfiles[substr($strProfileName,1,strlen($strProfileName))];

			$keys = array(
				'oauth_key'		=> OAUTH_CONSUMER_KEY,
				'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
				'user_key'		=> $profile["sm_acc_key"],
				'user_secret'	=> $profile["sm_acc_secret"],
			);

			$params = array();
			$params['count'] = 200;	//-- Max is 200 per request, will only ever return last 800
			$params['since_id'] = $since_id;
			//echo "since-id=".$since_id."<BR><BR>";
			
			$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/mentions_timeline.json",$params,"GET");
			//$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/mentions.json");
			if (!strlen($ret)) dump_last_request();
			
			$oResults = json_decode($ret);
			$this->arrMentions = $oResults;
			$this->oSearchResults = $oResults;
			//ksort($this->oSearchResults);
			//echo "<BR><BR>mention: ".$profile["sm_acc_key"]."<br><BR>";
			//print_r($ret);
		//}
	}

	function getTimeline()
	{
		//-- Get timeline for the authenticated profiles, used to build conversations timeline
		foreach($this->arrProfiles as $profile)
		{
			$keys = array(
				'oauth_key'		=> OAUTH_CONSUMER_KEY,
				'oauth_secret'		=> OAUTH_CONSUMER_SECRET,
				'user_key'		=> $profile["sm_acc_key"],
				'user_secret'	=> $profile["sm_acc_secret"],
			);

			$params = array();
			$params['count'] = 40;	//-- Max is 200 per request, will only ever return last 3200
			
			//echo "<BR>GetTimeline: ".$profile["sm_acc_key"]."-".$profile["sm_acc_secret"];
			$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/user_timeline.json",$params,"GET");
			//$ret = oauth_request($keys, "https://api.twitter.com/1.1/statuses/user_timeline.json");
			if (!strlen($ret)) dump_last_request();
			
			$oResults = json_decode($ret);
			$this->arrTimeline = $oResults;
			//echo "<BR><BR>".$profile["sm_acc_key"]."<br><BR>";
			//print_r($ret);
		}
	}

	

	function buildConversation()
	{	
	//	echo "<br>Start Building Conversation Function";
		$bIsConversation=false;
		//$user_to = "davidjh_hb";
		$user_to = $this->sm_from_user_id;

		foreach ($this->arrMentions as $item) {
			//echo "<BR>Mention: ".$item->user->screen_name." == ".$user_to;
			if ($item->user->screen_name == $user_to) {
				//echo "<br>in";
				//Use status id as index so we can get the sequence correct
				$index = (string) $item->id_str;
				$this->arrConversation[$index]["screen_name"] = (string) $item->user->screen_name;
				$this->arrConversation[$index]["url"] = (string) $item->user->url;
				$this->arrConversation[$index]["profile_image_url"] = (string) $item->user->profile_image_url;
				$this->arrConversation[$index]["text"] = (string) $item->text;
				$this->arrConversation[$index]["id_str"] = (string) $item->id_str;
				$this->arrConversation[$index]["in_reply_to_status_id_str"] = (string) $item->in_reply_to_status_id_str;
				$this->arrConversation[$index]["from_user_id"] = (string) $item->user->id;
				$this->arrConversation[$index]["to_user"] = (string) $user_to;
				$this->arrConversation[$index]["to_user_id"] = (string) $item->in_reply_to_user_id;
				$this->arrConversation[$index]["created_at"] = (string) $item->created_at;
			}
		}

		echo "<br>Got Mentions";

		foreach ($this->arrTimeline as $item) {
			//echo "<BR>Reply: ".$item->in_reply_to_screen_name." == ".$user_to;
			if ($item->in_reply_to_screen_name == $user_to) {
				//echo "<br>rep";
				$index = (string) $item->id_str;
				$this->arrConversation[$index]["screen_name"] = (string) $item->user->screen_name;
				$this->arrConversation[$index]["url"] = (string) $item->user->url;
				$this->arrConversation[$index]["profile_image_url"] = (string) $item->user->profile_image_url;
				$this->arrConversation[$index]["text"] = (string) $item->text;
				$this->arrConversation[$index]["id_str"] = (string) $item->id_str;
				$this->arrConversation[$index]["in_reply_to_status_id_str"] = (string) $item->in_reply_to_status_id_str;
				$this->arrConversation[$index]["from_user_id"] = (string) $item->user->id;
				$this->arrConversation[$index]["to_user"] = (string) $user_to;
				$this->arrConversation[$index]["to_user_id"] = (string) $item->in_reply_to_user_id;
				$this->arrConversation[$index]["created_at"] = (string) $item->created_at;
			}
		}

		echo "<br>Got Timeline";
	
		//Sort array by key
		ksort($this->arrConversation);
		//echo "<pre>";
		//print_r($this->arrConversation);
		//echo "</pre>";
		echo "<br>Sorted conversation results";

		$intDescCount=count($this->arrConversation)-1;
		$output="";
		foreach ($this->arrConversation as $item) {
			
			$this->arrDescConversation[$intDescCount] = $item;
			$intDescCount--;

		 
		}
		//echo $output;
		ksort($this->arrDescConversation);
	/*	echo "<pre>";
		print_r($this->arrMentions);
		echo "<br><br>";
		print_r($this->arrTimeline);
		echo "<br><br>";
		echo "------ DESC CONVERSATION:--------<BR><BR>";
		print_r($this->arrDescConversation);
		echo "</pre>";
		echo "------ END DESC CONVERSATION:--------<BR><BR>";
		*/
		//foreach ($arrDescConversation as $citem) {
		//	echo "<BR>".$citem["id_str"];
		//	
		//}

		for($i=0; $i<count($this->arrDescConversation); $i++)
		{
			if($i==0)
			{
				if($this->arrDescConversation[$i]["in_reply_to_status_id_str"] == "")
				{
					$bIsConversation = false;
					break;
				}
				else
				{
					$this->get_db_connection();
					$strSQL = "update socmed_comms set has_related_msgs=1 where msg_id='".$this->arrDescConversation[$i]["id_str"]."' and fk_app_type='Twitter'";
					//echo $strSQL;
					$this->swconn->Query($strSQL);
				}
			}

			$bIsConversation = true;
			echo "<br>$bIsConversation=".$bIsConversation;
			
			//echo "<BR>".$arrDescConversation[$i]["id_str"]." in reply to ".$arrDescConversation[$i]["in_reply_to_status_id_str"];

			 //echo "<div style='padding:10px;width:500px;border-bottom:1px dotted #000;overflow:hidden;'>";
			  //echo "<img src='".$this->arrDescConversation[$i]["profile_image_url"]."' height='48px' width='48px' align='left'> ".$this->arrDescConversation[$i]["id_str"]." in reply to: ".$this->arrDescConversation[$i]["in_reply_to_status_id_str"]."<br>".$this->arrDescConversation[$i]["screen_name"].": ".$this->arrDescConversation[$i]["text"];
			  //echo "</div>";

			//-- Check if reply is stored in socmed_comms table, if not then add and reference it
			//echo "<br><br>Communication id: ".$this->arrDescConversation[$i]["id_str"]. "exists? ".(!$this->communication_exists($this->arrDescConversation[$i]["id_str"]));
			if(!$this->communication_exists($this->arrDescConversation[$i]["id_str"]))
			{
				$this->create_communication_reply($i);
				$this->relate_to_parent_communication($i);
			}
			else
			{
				$this->relate_to_parent_communication($i);
			}

			if(($i==0) && ($this->arrDescConversation[$i]["in_reply_to_status_id_str"] != ""))
			{
				
					$this->get_db_connection();
					$strSQL = "update socmed_comms set has_related_msgs=1 where msg_id='".$this->arrDescConversation[$i]["id_str"]."' and fk_app_type='Twitter'";
				//	echo "run after reply: ".$strSQL;
					$this->swconn->Query($strSQL);
				
			}

			//-- Only show chained replies (may need to make optional to see all conversational tweets
			if($this->arrDescConversation[$i]["in_reply_to_status_id_str"]=="")
				break;

			//echo "<br>after break reply=".($this->arrDescConversation[$i]["in_reply_to_status_id_str"]=="");

		}

		//echo "<br>End Building Conversation Function";
		return $bIsConversation;
	}

	function get_active_searches()
	{
		//-- Get the list of active searches for the current run
		$this->get_db_connection();
		$strSQL = "select * from socmed_monitors where start_datex <= ".$this->dtSearchRun." and end_datex >= ".$this->dtSearchRun." and monitor_type <> 'dm'";
		$rsResult = $this->swconn->Query($strSQL,true);
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			//$this->oActiveSearches = $rsResult->recorddata;
			$this->oActiveSearches = $rsResult;
		}
	
	}
	
	function get_search_settings()
	{
		//-- Get the details of the search e.g. name, query etc
		define("_SEARCH_ACTION","LOGCOMM");	//-- LOGCOMM / LOGCALL etc
	}

	function create_search_string()
	{
		//-- Create the URL to be used in the search
		$this->get_db_connection();
		$strSQL = "select * from socmed_monitors where pk_id=".$this->pk_monitor_id;
		$rsResult = $this->swconn->Query($strSQL,true);	
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			//if($rsResult->f("monitor_type")=="search")
			//{
				$search_query = $rsResult->f("search_query");
				$max_id_last_search = $rsResult->f("max_id_last_search");	//-- Used to prevent return previously searched results
				//$this->searchURL="http://search.twitter.com/search.json?result_type=recent&since_id=".$max_id_last_search."&q=".$search_query;
				$this->searchURL="https://api.twitter.com/1.1/search/tweets.json?count=100&result_type=recent&since_id=".$max_id_last_search."&q=".$search_query;
				//echo "<BR>Search URL: ".$this->searchURL;
			//}
			/*else if($rsResult->f("monitor_type")=="mention")
			{
				//$search_query = $rsResult->f("search_query");
				$max_id_last_search = $rsResult->f("max_id_last_search");	//-- Used to prevent return previously searched results
				//$this->searchURL="http://search.twitter.com/search.json?result_type=recent&since_id=".$max_id_last_search."&q=".$search_query;
				$this->searchURL="https://api.twitter.com/1.1/statuses/mentions.json?since_id=".$max_id_last_search."&count=200";
			}
			else if($rsResult->f("monitor_type")=="dm")
			{
				$search_query = $rsResult->f("search_query");
				$max_id_last_search = $rsResult->f("max_id_last_search");	//-- Used to prevent return previously searched results
				$this->searchURL="https://api.twitter.com/1.1/direct_messages.json?since_id=".$max_id_last_search."&count=200";
			}*/
		}
		//$this->searchURL="http://search.twitter.com/search.json?result_type=recent&since_id=".$max_id_last_search."&q=".$search_query;
	}

	function get_sw_user()
	{
		//-- Try to identify a Supportworks Customer
		$this->get_db_connection();
		$strSQL = "select keysearch from userdb where twitter_id='".pfs($this->sm_from_user_id)."'";
		echo $strSQL;
		$rsResult = $this->swconn->Query($strSQL,true);
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			$swkeysearch = $rsResult->f("keysearch");
			echo $swkeysearch;
		}
		$this->sw_user_id = $swkeysearch;
	}

	function create_communication()
	{
		//-- Create an entry for the result in our communication table (update to API call)
		
		
		$this->get_db_connection();

		$strSQL = "insert into socmed_comms (user_id,user_name,msg_id,msg_text,msg_datex,fk_app_type,status,imgurl,fk_user_key, fk_monitor_id, has_related_msgs, to_user_id, to_user_name) values ('".pfs($this->oCommunication->user->id)."','".pfs($this->oCommunication->user->screen_name)."','".$this->oCommunication->id_str."','".pfs($this->oCommunication->text)."','".$this->parseDateToEpoch($this->oCommunication->created_at)."','Twitter','New','".$this->oCommunication->user->profile_image_url."','".pfs($this->sw_user_id)."','".$this->pk_monitor_id."','".$this->oCommunication->has_related_msgs."','".pfs($this->oCommunication->to_user_id)."','".pfs($this->oCommunication->to_user)."')";
		//echo "<br>".$strSQL;
		$this->swconn->Query($strSQL);
	}

	function create_communication_reply($i)
	{
		//echo $this->arrDescConversation[$i]["text"];
		//print_r($this->arrDescConversation[$i]);
		
		//-- Create an entry for the reply in our communication table (update to API call for release)
		
		$this->get_db_connection();

		$strSQL = "insert into socmed_comms (user_id,user_name,msg_id,msg_text,msg_datex,fk_app_type,status,imgurl,fk_user_key, fk_monitor_id, has_related_msgs, to_user_id, to_user_name, parent_comms_id) values ('".pfs($this->arrDescConversation[$i]["from_user_id"])."','".pfs($this->arrDescConversation[$i]["screen_name"])."','".$this->arrDescConversation[$i]["id_str"]."','".pfs($this->arrDescConversation[$i]["text"])."','".$this->parseDateToEpoch($this->arrDescConversation[$i]["created_at"])."','Twitter','New','".$this->arrDescConversation[$i]["profile_image_url"]."','".pfs($this->sw_user_id)."','".$this->pk_monitor_id."','".$this->is_reply(pfs($this->oCommunication->to_user))."','".pfs($this->arrDescConversation[$i]["to_user_id"])."','".pfs($this->arrDescConversation[$i]["to_user"])."','".$this->arrDescConversation[$i-1]["in_reply_to_status_id_str"]."')";
		//echo "creating communication reply:";
		//echo "<br>".$strSQL."<BR><BR>";
		$this->swconn->Query($strSQL);
	}

	function relate_to_parent_communication($i)
	{
		//-- On finding a new tweet, if in reply to a previous tweet we update the parent communication to link to it
		$this->get_db_connection();
		//echo "<br><br>arrpos:".$i;
		$strSQL = "update socmed_comms set parent_comms_id = '".$this->arrDescConversation[$i-1]["id_str"]."' where msg_id='".$this->arrDescConversation[$i-1]["in_reply_to_status_id_str"]."' and fk_app_type='Twitter'";
		//echo $strSQL;
		$this->swconn->Query($strSQL);
	}

	function communication_exists($msgId)
	{
		//-- Check if communication already exists in the communication table
		$this->get_db_connection();

		//$strSQL = "select count(*) as msgcount from socmed_comms where msg_id='".$msgId."' and fk_app_type='Twitter'";
		$strSQL = "select count(*) as msgcount from socmed_comms where msg_id='".$msgId."' and fk_monitor_id=".$this->pk_monitor_id." and fk_app_type='Twitter'";
		//echo "msgcountsql: ".$strSQL."<BR>";
		$rsResult = $this->swconn->Query($strSQL,true);
		if(($rsResult!=false)&&(!$rsResult->eof))
		{
			if($rsResult->f("msgcount")>0)
			{
				return true;
			}
		}
		return false;

	}

	function create_call()
	{
		//-- Create a call in Supportworks for the specified communication
	}

	function create_search_log()
	{
		//-- Create an initial log detailing the search to run and parameters etc
	}

	function create_search_result_log_entry()
	{
		//-- Log an entry in our log db/file of the result and action performed.
	}

	function close_search_log()
	{
		//-- Close the log by recording final stats/outcomes, flag up failures to helpdesk via a notification
	}


	function get_db_connection()
	{
		//-- create our database connects to swdata
		$swconn = new CSwDbConnection();
		$swconn->Connect(swdsn(), swuid(), swpwd());
		$this->swconn = $swconn;
	}

	function set_max_search_comm_id()
	{
		if($this->max_id_last_search > 0)
		{
			$this->get_db_connection();
			$strSQL = "update socmed_monitors set max_id_last_search='".$this->max_id_last_search."' where pk_id=".$this->pk_monitor_id;
			//echo "<BR>SQL: ".$strSQL;
			$rsResult = $this->swconn->Query($strSQL,true);
		}
	}

	function is_reply($strToUser)
	{
		//-- Identify if an incoming tweet is a reply to one of the configured profile accounts
		if($strToUser=="")
			return 0;

		if(in_array($strToUser,$this->arrProfiles))
			return 1;

		return 0;
	}

	function create_profile_array()
	{
		//-- Build an array of all profile accounts authorised with Supportworks 
		$this->get_db_connection();
		$strSQL = "select sm_acc_name, sm_acc_key, sm_acc_secret from socmed_twitter_acts where sm_acc_type='Twitter'";
		$rsResult = $this->swconn->Query($strSQL,true);
		while(($rsResult!=false)&&(!$rsResult->eof))
		{
			$arrVals = array("sm_acc_key" => $rsResult->f("sm_acc_key"), "sm_acc_secret" => $rsResult->f("sm_acc_secret"));
			
			$this->arrProfiles[$rsResult->f("sm_acc_name")] = $arrVals;
			//$this->arrProfiles[$rsResult->f("sm_acc_name")]["sm_acc_secret"] = $rsResult->f("sm_acc_secret");
			$rsResult->movenext();
		}

		return;
	}

	function order_array_num ($array, $key, $order = "ASC") 
    { 
        $tmp = array(); 
        foreach($array as $akey => $array2) 
        { 
            $tmp[$akey] = $array2[$key]; 
        } 
        
        if($order == "DESC") 
        {arsort($tmp , SORT_NUMERIC );} 
        else 
        {asort($tmp , SORT_NUMERIC );} 

        $tmp2 = array();        
        foreach($tmp as $key => $value) 
        { 
            $tmp2[$key] = $array[$key]; 
        }        
        
        return $tmp2; 
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
	
} // End Class SwSocialMediaSearch

		
$SwSocialMediaSearch = new SwSocialMediaSearch();

?>

