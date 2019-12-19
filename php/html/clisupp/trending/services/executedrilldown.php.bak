<?php

include("data.helpers.php"); //-- xmlmethocall & sqlquery classes
include("dashboard.helpers.php");


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
	echo "The Supportworks ESP session id was not found. Please contact your Administrator";
	exit(0);
}


//-- check we have a passed in group id and portal id (this will give us the dashboard configuration to load
if(!isset($_POST['recid']))
{
	echo "The widget configuration identifier is missing. Please contact your Administrator";
	exit;
}


$rsWidget=false;
$intMID = 0;
if($_POST['rectype']=="widget")
{
	$rsWidget = get_widgetrecord($_POST['recid']);
}
else if($_POST['rectype']=="measure")
{
	$rsWidget = get_measurerecord($_POST['recid']);
	$intMID=$_POST['recid'];
}

if($rsWidget && $rsWidget->Fetch())
{
	if($_POST['rectype']=="widget")
	{
		$intMID= $rsWidget->GetValueAsNumber("h_sql_measure");
	}
	//-- get session ddf
	$rsSessDff = new SqlQuery();
	if($rsSessDff->Query("select currentdatadictionary from swsessions where sessionid ='".$sessionID."'", "sw_systemdb") && $rsSessDff->Fetch())
	{
		swdti_load($rsSessDff->GetValueAsString("currentdatadictionary"));
	}
	else
	{
		swdti_load("default");
	}
	
	//-- custom data provider
	$strDrilldown =  $rsWidget->GetValueAsString("h_drilldownprovider");
	if($strDrilldown!="")
	{
		$strDrilldownInclude = "../". $strDrilldown;
		include($strDrilldownInclude);
	}
	else if($intMID>0)
	{
		//-- drill down using measure save columns
		$rsMeasure = get_measurerecord($intMID);
		if(!$rsMeasure)
		{
			echo "Failed to fetch measure record. Please contact your Administrator";
			exit;
		}
		$rsMeasure->Fetch();
		
		//-- select save cols from the measure
		$trendLimit = $rsWidget->GetValueAsNumber("h_sql_samplecount");
		$cols = $rsMeasure->GetValueAsString("h_sampleon_savecols");
		$tbl = $rsMeasure->GetValueAsString("h_sampleon_table");
		//--
		//-- now collect all the data
		$arrSelectCols = explode(",",$cols);
		$arrColConversion = Array();

		//-- add the key col
		$arrColConversion["h_sampledkeyvalue"] = $rsMeasure->GetValueAsString("h_sampleon_keycolname");
		for($x=0;$x<10;$x++)
		{
			if(isset($arrSelectCols[$x]))
			{
				$arrColConversion["h_data_col".($x+1)."_value"] = $arrSelectCols[$x];
			}
		}

		$tableHeader = "<tr>";
		foreach($arrColConversion as $selectName => $convName)
		{
			$tableHeader .= "<td class='ui-widget-header'>$convName</td>";
		}
		$tableHeader .= "</tr>";

		//--
		//-- get the samples main records
		$strSelect = "select h_pk_sid from h_dashboard_samples where h_fk_measure = ".$intMID." order by h_sampledate desc limit ".$trendLimit;
		$rsSamples = new SqlQuery();
		if(!$rsSamples->Query($strSelect,"sw_systemdb"))
		{
			echo $rsSamples->GetLastError();
			exit(0);
		}

		$tableData = "";
		while($rsSamples->Fetch())
		{
			$sampleID	= $rsSamples->GetValueAsNumber("h_pk_sid");
			$sampleDate = $rsSamples->GetValueAsNumber("h_sampledate");

			$strSelect = "select * from h_dashboard_sample_datarow where h_fk_sid = ".$sampleID;
			$rsSampleData = new SqlQuery();
			if(!$rsSampleData->Query($strSelect,"sw_systemdb"))
			{
				echo $rsSampleData->GetLastError();
				exit(0);
			}
			
			while($rsSampleData->Fetch())
			{
				$tableData .= $rsSampleData->GetHtmlTableRow($arrColConversion,$tbl);
			}
		}

		echo "<table border='0' cellpadding='2' cellspacing='2'>$tableHeader $tableData</table>";
	}
	else if($rsWidget->GetValueAsString("h_sql_groupcolumn")!="")
	{
		//-- select using widget sql data
		$cols = $rsWidget->GetValueAsString("h_drilldowncolumns");
		$tbl = $rsWidget->GetValueAsString("h_sql_table");
		$groupby = $rsWidget->GetValueAsString("h_sql_groupcolumn");
		$filter = $rsWidget->GetValueAsString("h_sql_clause");
		echo $rsWidget->GenerateDrillDownData($groupby,$cols,$tbl,$filter);
	}
}
exit(0);
?>
