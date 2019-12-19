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



	$arrInsertFields = Array();

	//-- basic fields that are stored against widget - that we allow for insert

	$arrInsertFields[]="h_title";
	$arrInsertFields[]="h_type";
	$arrInsertFields[]="h_category";
	$arrInsertFields[]="h_forddf";
	$arrInsertFields[]="h_description";
	$arrInsertFields[]="h_definition";
	$arrInsertFields[]="h_extra_1";
	$arrInsertFields[]="h_extra_2";
	$arrInsertFields[]="h_owner";
	$arrInsertFields[]="h_height";
	$arrInsertFields[]="h_dataprovider";
	$arrInsertFields[]="h_drilldownprovider";

	$arrInsertFields[]="h_drilldowncolumns";
	$arrInsertFields[]="h_sql_table";
	$arrInsertFields[]="h_sql_dir";
	$arrInsertFields[]="h_sql_countcolumn";
	$arrInsertFields[]="h_sql_groupcolumn";
	$arrInsertFields[]="h_sql_clause";

	$arrInsertFields[]="h_sql_measure.n";	
	$arrInsertFields[]="h_sql_samplecount.n";
	$arrInsertFields[]="h_sql_limit.n";

	$arrInsertCols = Array();
	$arrInsertValues = Array();
	foreach($arrInsertFields as  $fldName)
	{
		$arrInfo = explode(".",$fldName);
		$fldName = $arrInfo[0];
		$ctype = $arrInfo[1];

		if(isset($_POST[$fldName])) 
		{	
			$arrInsertCols[] = $fldName;
			$strValue = "'" . pfs($_POST[$fldName]) ."'";
			if($ctype=="n") 
			{
				$strValue = pfs($_POST[$fldName]);
				if($strValue=="")$strValue=0;
			}
			else if($ctype=="strtotime")$strValue = strtotime(pfs($_POST[$fldName]));

			$arrInsertValues[]= $strValue;
		}
	}

	if(count($arrInsertValues)==0)
	{
		echo generateCustomErrorString("-777","There are no fields to insert. Please contact your Administrator",true);
		exit(0);
	}

	$strSQL = "insert into h_dashboard_widgets (".implode(",",$arrInsertCols).") values(".implode(",",$arrInsertValues).")";
	$rs = new SqlQuery();
	if($rs->Query($strSQL,"sw_systemdb"))
	{
		echo get_widgetrecord_bytitleandtype($_POST["h_title"],$_POST["h_type"],true);
	}
	else
	{
		echo generateCustomErrorString("-777"," Failed to create new widget. Please contact your Administrator",true);
	}

	exit(0);
	


?>
