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
	$wids = $_POST["wids"];

	//-- select current ones
	$currentWidgets = array();
	$rs = new SqlQuery();
	$strSql = "select h_pid, h_fk_wid from h_dashboard_boardwidgets where h_fk_dbid = ".pfs($dbid);
	if($rs->Query($strSql,"sw_systemdb"))
	{
		while($rs->Fetch())
		{
			$currentWidgets[$rs->GetValueAsNumber("h_fk_wid")] = $rs->GetValueAsNumber("h_pid");
		}
	}

	//-- 
	if($wids!="")
	{
		//-- check which ones already exist
		$rs = new SqlQuery();
		
		$assignWidgets = explode(",",$wids);
		foreach($assignWidgets as $assignWID)
		{
			if(isset($currentWidgets[$assignWID]))
			{
				//-- exists so remove it from array (as we will delete whatever remains)
				unset($currentWidgets[$assignWID]);
			}
			else
			{
				//-- does not exist to add
				$strSql = "insert into h_dashboard_boardwidgets (h_fk_wid,h_fk_dbid,h_active) values (".pfs($assignWID).",".pfs($dbid).",1)";
				$rs->Reset();
				if(!$rs->Query($strSql,"sw_systemdb"))
				{
					echo $rs->GetLastErrorMessage();
					exit(0);
				}
			}
		}
	}

	$strDeleteRows = implode(",",$currentWidgets);
	if($strDeleteRows!="")
	{
		$rs->Reset();
		$strSql = "delete from h_dashboard_boardwidgets where h_pid in (".$strDeleteRows.")";
		if(!$rs->Query($strSql,"sw_systemdb"))
		{
			echo $rs->GetLastErrorMessage();
		}
	}
	echo "OK";
	exit(0);
?>