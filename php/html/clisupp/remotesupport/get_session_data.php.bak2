<?php
	session_start();
	//error_reporting(E_ERROR);
	$_SESSION['portalmode'] = "FATCLIENT";

	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');		
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/helpers/lib_curl.php');

	$sessid = gv('sessid');

	//-- Construct a new active page session
	$session = new classActivePageSession($sessid);
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		header("Content-Type: text/xml");
		echo "<params>";
			echo "<success>false</success>";
			echo "<recordingenabled>false</recordingenabled>";
			echo "<message>Failed to login to Supportworks Server.</message>";
		echo "</params>";
		exit;
	}

	$swDBConn = database_connect("swdata");
	$swSysDBConn = database_connect("syscache");

	// ************** CUSTOMIZE THESE VALUES FOR YOUR ENVIRONMENT ******************
	// Query global Remote Support Settings from Supportworks...
	$strSQL = "select pk_setting, setting_value from sw_settings where pk_setting like 'REMOTESUPPORT.SESSIONEND.%'";
	$retRS1 = $swDBConn->query($strSQL,true);
	while(!$retRS1->eof && $retRS1)
	{
		$pk_setting = $retRS1->f('pk_setting');
		$setting_value = $retRS1->f('setting_value');
		switch($pk_setting)
		{
			case "REMOTESUPPORT.SESSIONEND.INCLUDE_SESSION_NOTES":
				$bGlobalIncludeSessionNotes = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.INCLUDE_CHAT_TRANSCRIPT":
				$bGlobalIncludeChatTranscript = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.INCLUDE_SESSION_RECORDING":
				$bGlobalIncludeSessionRecording = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.INCLUDE_SYSTEM_INFO":
				$bGlobalIncludeSystemInfo = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.ENABLED":
				$bGlobalProcessSessionEnabled = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.EXCLUDE_SYSTEM_CHAT_FROM_TRANSCRIPT":
				$bGlobalExcludeSystemChatTranscript = ($setting_value=="True")?1:0;  
				break;
			case "REMOTESUPPORT.SESSIONEND.LOG_SESSIONS_WITHOUT_EXTERNAL_KEY":
				$bGlobalLogSessionsWithoutExternalKey = ($setting_value=="True")?1:0;  
				break;
			default:
				break;
		}
		$retRS1->movenext();
	}
	
	
	// Query the Bomgar credentials from Supportworks...
	$toolName = gv('tool');
	$strSQL = "select * from remote_support where name='".pfs($toolName)."'";
	$strAuthStatus = "";

	$retRS = $swDBConn->query($strSQL,true);
	if(!$retRS->eof && $retRS)
	{
		$username = $retRS->f("api_username");
		$password = $retRS->f("api_password");
		$url = $retRS->f("url");
		$type = $retRS->f("type");
		$bIncludeSessionNotes = $retRS->f("flg_se_incl_notes");
		$bIncludeChatTranscript = $retRS->f("flg_se_incl_chat");
		$bIncludeSessionRecording = $retRS->f("flg_se_incl_record");
		$bIncludeSystemInfo = $retRS->f("flg_se_incl_sysinfo");
		$bProcessSessionEnabled = $retRS->f("flg_se_enabled");
		$bExcludeSystemChatTranscript = $retRS->f("flg_se_excl_sys_chat");
		$bLogSessionsWithoutExternalKey = $retRS->f("flg_se_log_new");
	}
	else
	{
		header("Content-Type: text/xml");
		echo "<params>";
		echo "<success>false</success>";
		echo "<recordingenabled>false</recordingenabled>";
		echo "<message>Remote Support configuration could not be loaded.</message>";
		echo "</params>";
		exit;
	}

	//date_default_timezone_set('America/Chicago'); // make PHP happy by settting the default timezone

	$lsid = $_REQUEST['lsid']; // get the unique ID of the Bomgar session that just ended

	// sleep for 10 seconds to let API data catch up to OB event
	sleep(10);  // fix this... to be sure, need to chech end_time value in XML report and requery if not there.
	//set these values to 1 to include in the session summary
	$includeSessionNotes = ((($bIncludeSessionNotes==0) && $bGlobalIncludeSessionNotes) || ($bIncludeSessionNotes==2))?1:0;  
	$includeChatTranscript = ((($bIncludeChatTranscript==0) && $bGlobalIncludeChatTranscript) || ($bIncludeChatTranscript==2))?1:0;  
	$includeSessionRecording = ((($bIncludeSessionRecording==0) && $bGlobalIncludeSessionRecording) || ($bIncludeSessionRecording==2))?1:0;  
	$includeSystemInfo = ((($bIncludeSystemInfo==0) && $bGlobalIncludeSystemInfo) || ($bIncludeSystemInfo==2))?1:0;  
	$ProcessSessionEnabled = ((($bProcessSessionEnabled==0) && $bGlobalProcessSessionEnabled) || ($bProcessSessionEnabled==2))?1:0;  
	$ExcludeSystemChatTranscript = ((($bExcludeSystemChatTranscript==0) && $bGlobalExcludeSystemChatTranscript) || ($bExcludeSystemChatTranscript==2))?1:0;  
	$LogSessionsWithoutExternalKey = ((($bLogSessionsWithoutExternalKey==0) && $bGlobalLogSessionsWithoutExternalKey) || ($bLogSessionsWithoutExternalKey==2))?1:0;  

	// Process Session Details if Enabled
	if($ProcessSessionEnabled)
	{
		// ************** CUSTOMIZE THESE VALUES FOR YOUR ENVIRONMENT ******************
			$fullURL = "";
			$recordingURL = "";
			switch($type)
			{
				case "BOMGAR":
					$fullURL = $url."/api/reporting.ns?username=".$username."&password=".$password."&generate_report=SupportSession&lsid=".$lsid;
					$recordingURL = $url."/api/reporting.ns?username=".$username."&password=".$password."&generate_report=SupportSessionRecording&lsid=".$lsid;
					break;
				default:
					 return "";
			}

		// Build the Bomgar reporting API URL to retrieve the XML report for this session / lsid
		#  access the protected resource
		$xmlResult = api_http_request($fullURL);
		if(strpos($xmlResult,"<error>Login failed</error>")>-1)
		{
			header("Content-Type: text/xml");
			echo "<params>";
			echo "<success>false</success>";
			echo "<recordingenabled>false</recordingenabled>";
			echo "<message>Failed to login to Bomgar Server.</message>";
			echo "</params>";
			exit;
		}
	///	echo htmlentities($xmlResult);
		if (!strlen($xmlResult)) dump_last_request();
		$xml = domxml_open_mem($xmlResult);
		$xml = $xml->document_element();

		//extract the ticket # from the Bomgar external_key field in the session details...
		$external_key =getResultVar('xml',$xmlResult,"external_key");
		if (isset($external_key))
			$external_key = (int)preg_replace("/[^0-9]/","",$external_key);

		// ************** CUSTOMIZE THESE VALUES FOR YOUR ENVIRONMENT ******************
		
		// Create a header for the comment update...
		$message = "BOMGAR Remote Support Session". "\n";
		$duration = "";
		$transferfilecount = "";
		$sessionGroup = getxml_childnodes($xml,"session");
		foreach($sessionGroup as $sessItem)
		{
			$rep_lists = getxml_childnodes($sessItem,"rep_list");
			foreach($rep_lists as $rep_list)
			{
				$reps = getxml_childnodes($rep_list,"representative");
				foreach($reps as $rep)
				{
					$repUsername = getxml_childnode_content($rep,"username");
					$strSQL = "select * from rmt_sup_logins where rs_name='".pfs($toolName)."' and username='".pfs($repUsername)."'";
					$retRS = $swDBConn->query($strSQL,true);
					if(!$retRS->eof && $retRS)
					{	
						$analystid = $retRS->f("analystid");
						if($analystid!="")
						{
							$strSQL = "select supportgroup from swanalysts where analystid='".pfs($analystid)."'";
							$retRS = $swSysDBConn->query($strSQL,true);
							$strAuthStatus = "";
							if(!$retRS->eof && $retRS)
							{	
								$suppGroup = $retRS->f("supportgroup");
							}
						}
					}
				}
			}

			$repNode = getxml_childnode($sessItem,"primary_rep");
			$rep_id = ""; // get the numeric id for this rep
			$rep_name = "";  //get the display name for this rep
			if(isset($repNode))
			{
				$rep_id = get_node_att($repNode,'id'); // get the numeric id for this rep
				$rep_name = $repNode->get_content();  //get the display name for this rep
			}
			$startTimeNode = getxml_childnode($sessItem,"start_time");
			$start_timestamp =get_node_att($startTimeNode,'timestamp');
			$endTimeNode = getxml_childnode($sessItem,"end_time");
			$end_timestamp =get_node_att($endTimeNode,'timestamp');
			$primaryCustomer = getxml_childnode_content($sessItem,"primary_customer");
			$duration = getxml_childnode_content($sessItem,"duration");
			$transferfilecount = getxml_childnode_content($sessItem,"file_transfer_count");
			$customer_lists = getxml_childnodes($sessItem,"customer_list");
			foreach($customer_lists as $customer_list)
			{
				$customers = getxml_childnodes($customer_list,"customer");
				foreach($customers as $customer)
				{
					$information = getxml_childnodes($customer,"info");
					foreach($information as $info)
					{
						$company = getxml_childnode_content($customer,"company");
						$issue = getxml_childnode_content($customer,"issue");
						$details = getxml_childnode_content($customer,"details");
						$company_code = getxml_childnode_content($customer,"company_code");
					}
					
					
					$CustName = getxml_childnode_content($customer,"username");
					$public_ip = getxml_childnode_content($customer,"public_ip");
					$private_ip = getxml_childnode_content($customer,"private_ip");
				}
			}
		}

		// Append desired session details to the message for the ticket comment... 
		$message .= "\n";
		$message = $message . "--------------------------------\n";
		$message = $message . "SUMMARY INFO\n";
		$message = $message . "--------------------------------\n";
		$message .= "Rep Name:  ". $rep_name . " (ID: " . $rep_id . ")\n";
		$message .= "Customer Name:  ". $primaryCustomer. "\n";
		$message .= "Ticket Number (external_key):  ". $external_key . "\n";
		$message .= "Customer's Public IP:  " . $public_ip . "\n";
		$message .= "Customer's Private IP:  " . $private_ip . "\n";
		$message .= "Session Start Time:  " . date("D, M j, Y G:i:s T", intval($start_timestamp)) . "\n";
		$message .= "Session End Time:  " . date("D, M j, Y G:i:s T", intval($end_timestamp)) . "\n";
		$message .= "Duration:  ". $duration .  "\n";
		$message .= "# Files Transferred:  ". $transferfilecount . "\n"; 
		$message .= "\n";
		
		$notes = '';   //var for gathering session notes entered by the Rep
		$chat = '';   //var for capturing all interactive chat messages
		$sysinfo = '';  //var for captured system information
		$sesion_details = getxml_childnodes($sessItem,"session_details");
		foreach($sesion_details as $sesion_detail)
		{
			$events = getxml_childnodes($sesion_detail,"event");
			foreach ($events as $Event) 
			{
				//Get the appropriate elements from this customer to include
				$Timestamp =get_node_att($Event,'timestamp');
				$EventType = get_node_att($Event,'event_type');
			
				if ($EventType == "Session Note Added")
				{
					$notes = $notes . "(" . date("D, M j, Y G:i:s T", intval($Timestamp)) .") ". getxml_childnode_content($Event,"performed_by") . " added the following note:\n" . getxml_childnode_content($Event,"body"). "\n";
				}
				elseif ($EventType == "Chat Message")
				{
					if ($Event->performed_by != "Bomgar") //optionally exclude system generated chat messages
					{
						$chat = $chat . "(" . date("D, M j, Y G:i:s T", intval($Timestamp)) .") ". getxml_childnode_content($Event,"performed_by") . " said to " . 
							getxml_childnode_content($Event,"destination") . ":\n" . getxml_childnode_content($Event,"body"). "\n\n";
					}
					else 
					{
						if(!$ExcludeSystemChatTranscript)
						{
							$chat = $chat . "(" . date("D, M j, Y G:i:s T", intval($Timestamp)) .") ". getxml_childnode_content($Event,"performed_by") . " said to " . 
							getxml_childnode_content($Event,"destination") . ":\n" . getxml_childnode_content($Event,"body"). "\n\n";
						}
					}	
				}
				elseif ($EventType == "System Information Retrieved")
				{
					//Get the appropriate elements from this customer to include
						$sysinfo .= "--------------------------------------------\n";
						$sysinfo .= "SYSTEM INFORMATION RETRIEVED\n";
						$sysinfo .= "--------------------------------------------\n";
						$categories = $Event->get_elements_by_tagname("category");
						$data = getxml_childnodes($categories[0],"data");
						$rows = getxml_childnodes($data[1],"row");
						$fields = getxml_childnodes($rows[1],"field");

						foreach ($fields as $SysInfoField)
						{
							$sysinfo .= get_node_att($SysInfoField,"id") ." = " . trim($SysInfoField->get_content()) . "\n";
						}
				}
			}
		}
		
		if ($sysinfo != '' & $includeSystemInfo) $message .= $sysinfo . "\n";  //append system info if it was logged
			
		if ($includeSessionNotes)
		{
			$message = $message . "--------------------------------\n";
			$message = $message . "SESSION NOTES\n";
			$message = $message . "--------------------------------\n";
			$message = $message . $notes ."\n";
			$message = $message . "--------------------------------\n";
		}
		
		if ($includeChatTranscript)
		{
			
			$message = $message . "CHAT TRANSCRIPT\n";
			$message = $message . "--------------------------------\n";
			$message = $message . $chat ."\n";
			//$message = $message . "Chat Transcript:  " . $xml->session->session_chat_view_url . "\n\n";
		}

		if ($includeSessionRecording)
		{
			$message = $message . "--------------------------------\n";
			$message .= "SESSION RECORDING URL\n";
			$message = $message . "--------------------------------\n";
			// This is the text chat url for download - not video
			$message .= $duration = getxml_childnode_content($sessItem,"session_chat_download_url"). "\n";

			// Build the Bomgar reporting API URL to retrieve the XML report for this session recording / lsid
			#  access the protected resource
			/*$xmlResult = api_http_request($recordingURL);
			if(strpos($xmlResult,"<error>Login failed</error>")>-1)
			{
				header("Content-Type: text/xml");
				echo "<params>";
				echo "<success>false</success>";
				echo "<message>Failed to login to Bomgar Server.</message>";
				echo "</params>";
				exit;
			}
			if(strpos($xmlResult,"<error>This recording has expired and can no longer be viewed or downloaded.</error>")>-1)
			{
				header("Content-Type: text/xml");
				echo "<params>";
				echo "<success>false</success>";
				echo "<message>This recording has expired and can no longer be viewed or downloaded.</message>";
				echo "</params>";
				exit;
			}
			if (!strlen($xmlResult)) dump_last_request();
			echo $xmlResult;
			exit;
			$xml = domxml_open_mem($xmlResult);
			$xml = $xml->document_element();*/
		}
		
		// Echo the body of the message to the browser (useful for testing)
		// Replace line breaks  with html breaks for better viewing in the browser.

		//echo str_replace("\n","<br />",$message); // used for in-browser testing
		$timeSpent = $end_timestamp -$start_timestamp;
		// Email the session report to the ticketing system via SMTP
		if ($external_key <> "")
		{
			header("Content-Type: text/xml");
			echo "<params>";
			echo "<success>true</success>";
			echo "<recordingenabled>true</recordingenabled>";
			echo "<updaterequest>true</updaterequest>";
			echo "<externalkey>".pfx($external_key)."</externalkey>";
			echo "<timespent>".pfx($timeSpent)."</timespent>";
			echo "<contextaid>".pfx($analystid)."</contextaid>";
			echo "<contextgid>".pfx($suppGroup)."</contextgid>";
			echo "<message>".pfx($message)."</message>";
			echo "</params>";
			exit;
		}
		else
		{
			if($LogSessionsWithoutExternalKey)
			{
				header("Content-Type: text/xml");
				echo "<params>";
				echo "<success>true</success>";
				echo "<recordingenabled>true</recordingenabled>";
				echo "<logrequest>true</logrequest>";
				echo "<callclass>Incident</callclass>";
				echo "<slaname>2 Hours Response</slaname>";
				echo "<customerid>".pfx($primaryCustomer)."</customerid>";
				echo "<timespent>".pfx($timeSpent)."</timespent>";
				echo "<contextaid>".pfx($analystid)."</contextaid>";
				echo "<contextgid>".pfx($suppGroup)."</contextgid>";
				echo "<message>".pfx($message)."</message>";
				echo "</params>";
				exit;
			}
			else
			{
				header("Content-Type: text/xml");
				echo "<params>";
				echo "<success>true</success>";
				echo "<recordingenabled>true</recordingenabled>";
				echo "<message>No processing required</message>";
				echo "</params>";
				exit;
			}
		}
 	}
	else
	{
		header("Content-Type: text/xml");
				echo "<params>";
				echo "<success>true</success>";
				echo "<recordingenabled>false</recordingenabled>";
				echo "</params>";
				exit;
	}

	function database_connect($strDSN, $strUID = "", $strPWD = "")
	{
		//-- create or share a connection
		$dsnName = strtolower($strDSN);
		if(isset($GLOBALS['activepageconnections'][$dsnName]))
		{
			//-- share conn
			$tableODBC = $GLOBALS['activepageconnections'][$dsnName];
		}
		else
		{
			//-- connect
			$tableODBC = new CSwDbConnection;
			if(strToLower($strDSN)=="swdata")
			{
				$strUID=swuid();
				$strPWD=swpwd();
			}
			else if(strToLower($strDSN)=="syscache")
			{
				$strDSN = "sw_systemdb";
				$strUID = swcuid();
				$strPWD = swcpwd();
			}

			if($tableODBC->Connect($strDSN,$strUID,$strPWD)==false)
			{
				return false;
			}		

			$GLOBALS['activepageconnections'][$dsnName] = $tableODBC;
		}

		return $tableODBC;
	}
/*	function _getxml_childnode_content($oXML,$strChildNodeName,$intChildPos = 0)
	{
		$childNode = _getxml_childnode($oXML,$strChildNodeName,$intChildPos);
		if($childNode!=null)
		{
			return $childNode->get_content();
		}
		return "";
	}

	function _getxml_childnode($oXML,$strChildNodeName,$intChildPos = 0)
	{
		$intcount=0;
		$childnodes = $oXML->child_nodes();
		foreach ($childnodes as $aNode)
		{
			if ($aNode->tagname==$strChildNodeName)
			{

				if(($intcount==$intChildPos)||($intChildPos==0))
				{
					return $aNode;
				}
				$intcount++;
			}
		}
		return null;
	}*/
?> 