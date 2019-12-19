<?php
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	include('itsm_default/xmlmc/common.php');
	include('clsswsocialmedia.php');

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

	$SwSocialMedia = new SwSocialMedia();
	if($in_msgid!="")
	{
		$strProfiles = "";
		
		$rsUserAccounts = $SwSocialMedia->get_user();
		while(!$rsUserAccounts->eof)
		{
			if($strProfiles!="")
				$strProfiles.=",";
			$strProfiles .= "'".$rsUserAccounts->f('sm_acc_name')."'";
			$rsUserAccounts->movenext();
		}

		$swConn = database_connect("swdata");
		$strSelect = "select * from socmed_comms where (user_name='".$in_username."' or user_name IN (".$strProfiles.")) and msg_id < '".$in_msgid."' order by msg_id desc";
		$rsMsg = $swConn->query($strSelect, true);
		$swConn->Close();
	}

	if($rsMsg)
	{
		$strParentCommsId=$in_msgid;
		$strOutput = "";
		while (!$rsMsg->eof)
		{
			if($rsMsg->f("parent_comms_id") == "")
				break;

			if($strParentCommsId==$rsMsg->f("parent_comms_id"))
			{
				$strOutput .= "<div class='convlist'>";
				$strOutput .= "<div class='convavatar'><img class='convavatarimg' src='".$rsMsg->f("imgurl")."'></div>";
				$strOutput .= "<div class='convtext'><a href='Javascript:showUser(\"infopanel\",".$rsMsg->f("user_id").",\"".$rsMsg->f('user_name')."\");'>@".$rsMsg->f('user_name')."</a>&nbsp;".$SwSocialMedia->parseTwitterMessageText($rsMsg->f('msg_text'),$rsMsg->f("user_id"))."<br/><br/>".$SwSocialMedia->parseDateToTweetTime($rsMsg->f('msg_datex'),true)."</div>";
				$strOutput .= "</div>";

				$strParentCommsId = $rsMsg->f("msg_id");
			}
			$rsMsg->movenext();
		}
	}

	if($strOutput=="")
		$strOutput = "Failed to display related messages";
	
	echo $strOutput;
	
?>