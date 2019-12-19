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


	$iGID = trim($_POST["gid"]);
	if($iGID=="")
	{
		echo generateCustomErrorString("-777","Please specify a group to update",true);
		exit(0);
	}

	$arrUpdate = Array();
	if(isset($_POST["h_title"])) $arrUpdate[]= "h_title = '".pfs($_POST["h_title"])."'";
	if(isset($_POST["h_accessrights"])) $arrUpdate[]= "h_accessrights = '".pfs($_POST["h_accessrights"])."'";
	if(isset($_POST["h_owner"])) $arrUpdate[]= "h_owner = '".pfs($_POST["h_owner"])."'";
	if(isset($_POST["h_uidaccess"])) $arrUpdate[]= "h_uidaccess = '".pfs($_POST["h_uidaccess"])."'";
	if(isset($_POST["h_uraccess"])) $arrUpdate[]= "h_uraccess = ".pfs($_POST["h_uraccess"]);

	
	if(count($arrUpdate) == 0)
	{
		echo generateCustomErrorString("-777","There is nothing to update.",true);
		exit(0);
	}

	echo sqlAsJson("update h_dashboard_groups set ".implode(",",$arrUpdate)." where h_gid = ". pfs($iGID),"sw_systemdb");
	exit(0);
?>
