<?php

	include("../../services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("../../services/dashboard.helpers.php");

	$sessionID = gv("sessid");
	if(isset($_COOKIE['ESPSessionState']))
	{
		$_core['_nexttoken'] = $_COOKIE['ESPSessionState'];
	}
	else if($sessionID!=null)
	{
		//-- bind session
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionID);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}
	}
	else
	{
		echo generateCustomErrorString("-777","The Supportworks ESP session id was not found. Please contact your Administrator",true);
		exit(0);
	}

	//-- check if admin - wil lexit if not
	exit_ifnot_administrator();


	$strNewGroup = trim($_POST["gid"]);
	if($strNewGroup=="")
	{
		echo generateCustomErrorString("-777","Please specify a new group name",true);
		exit(0);

	}

	$rsDB = get_dashboard_group_by_title($strNewGroup);
	if($rsDB && $rsDB->Fetch())
	{
		echo generateCustomErrorString("-777","The group name [".$strNewGroup."] already exists. To work with it please select it from the listbox to the left",true);
		exit(0);
	}

	$rsNew = create_dashboard_group($strNewGroup,$_POST["h_access"],$_POST["h_owner"],$_POST["h_uidaccess"],$_POST["h_uraccess"]);
	if($rsNew && $rsNew->Fetch())
	{
		echo '{"groupId":'.$rsNew->GetValueAsNumber("h_gid").',"title":"'.$strNewGroup.'"}';
	}
	else
	{
		echo $rsNew;
		echo generateCustomErrorString("-777","Failed to create new group [".$strNewGroup."]. Please contact youre Administrator.",true);
	}
	exit(0);
	
?>
