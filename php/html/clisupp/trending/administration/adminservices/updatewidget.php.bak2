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


	$iWID = trim($_POST["h_widget_id"]);
	if($iWID=="")
	{
		echo generateCustomErrorString("-777","Please specify a widget id to update",true);
		exit(0);
	}

	$arrUpdateFields = Array();

	//-- basic fields that are stored against measure - that we allow for update
	$arrUpdateFields[]="h_title";
	$arrUpdateFields[]="h_type";
	$arrUpdateFields[]="h_category";
	$arrUpdateFields[]="h_forddf";
	$arrUpdateFields[]="h_description";
	$arrUpdateFields[]="h_definition";
	$arrUpdateFields[]="h_extra_1";
	$arrUpdateFields[]="h_extra_2";
	$arrUpdateFields[]="h_owner";
	$arrUpdateFields[]="h_height";
	$arrUpdateFields[]="h_dataprovider";
	$arrUpdateFields[]="h_drilldownprovider";

	$arrUpdateFields[]="h_drilldowncolumns";
	$arrUpdateFields[]="h_sql_table";
	$arrUpdateFields[]="h_sql_dir";
	$arrUpdateFields[]="h_sql_countcolumn";
	$arrUpdateFields[]="h_sql_groupcolumn";
	$arrUpdateFields[]="h_sql_clause";
	$arrUpdateFields[]="h_sql_samplecount.n";
	$arrUpdateFields[]="h_sql_limit.n";
	$arrUpdateFields[]="h_sql_measure.n";

	$arrUpdate = Array();
	foreach($arrUpdateFields as  $fldName)
	{
		$arrInfo = explode(".",$fldName);
		$fldName = $arrInfo[0];
		$ctype = $arrInfo[1];

		if(isset($_POST[$fldName])) 
		{	
			$strUpdateFieldSql = $fldName . "= '" . pfs($_POST[$fldName]) ."'";
			if($ctype=="n") 
			{
				if($_POST[$fldName]=="")$_POST[$fldName]=0;
				$strUpdateFieldSql = $fldName . "= " . pfs($_POST[$fldName]);
			}
			else if($ctype=="strtotime")$strUpdateFieldSql = $fldName . "= " .strtotime(pfs($_POST[$fldName]));

			$arrUpdate[]= $strUpdateFieldSql;
		}
	}

	if(count($arrUpdate)==0)
	{
		echo generateCustomErrorString("-777","There are no fields to update. Please contact your Administrator",true);
		exit(0);
	}

	$strSQL = "update h_dashboard_widgets set ".implode(",",$arrUpdate)." where h_widget_id = ". pfs($iWID);
	echo sqlAsJson($strSQL,"sw_systemdb");
	exit(0);
?>
