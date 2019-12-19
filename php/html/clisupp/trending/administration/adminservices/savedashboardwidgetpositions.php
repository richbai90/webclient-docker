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


	$dbid = $_POST["dbid"];
	$posinfo = $_POST["posinfo"];

	$arrPositionInfo = explode(",",$_POST["posinfo"]);
	foreach($arrPositionInfo as $widgetPosInfo)
	{
		$arrWidPosInfo = explode(":",$widgetPosInfo);
		$col = $arrWidPosInfo[0];
		$row = $arrWidPosInfo[1];
		$wid = $arrWidPosInfo[2];

		$rs = new SqlQuery();
		$strSql = "update h_dashboard_boardwidgets set h_col=".pfs($col).",h_row=".pfs($row)." where h_fk_wid = ".pfs($wid)." and h_fk_dbid = ".pfs($dbid);
		if(!$rs->Query($strSql,"sw_systemdb"))
		{
			echo $rs->GetLastErrorMessage();
			exit(0);
		}
	}
	echo "OK";
	exit(0);
?>