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

$recid = gv('recid');
$rectype = gv('rectype');

if($recid==null)
{
	echo "The widget configuration identifier is missing. Please contact your Administrator";
	exit;
}

$rsWidget=false;
$bExportToCsvMode = true;
$intMID = 0;

if($rectype=="fusion")
{
	$rsWidget = get_widgetrecord($recid);
}
else if($rectype=="measure")
{
	$rsWidget = get_measurerecord($recid);
	$intMID=$recid;
}

if($rsWidget && $rsWidget->Fetch())
{
	if($rectype=="fusion")
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
	$widgetName = $rsWidget->GetValueAsString("h_title");
	$strDrilldown =  $rsWidget->GetValueAsString("h_drilldownprovider");
	if($strDrilldown!="")
	{
		//-- this custom script should check for $bExportToCsvMode and if true generate csv data var $strCsvData or do its own thingggg
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
		
		//--
		//-- get csv headers
		$strCsvData = "";
		$arr_for_csv = Array();
		foreach($arrColConversion as $selectName => $convName)
		{
			$arr_for_csv[] = $convName;
		}

		$strCsvData = arraytocsvline($arr_for_csv);


		//--
		//-- get the samples main records
		$strSelect = "select h_pk_sid from h_dashboard_samples where h_fk_measure = ".$intMID." order by h_sampledate desc limit ".$trendLimit;
		$rsSamples = new SqlQuery();
		if(!$rsSamples->Query($strSelect,"sw_systemdb"))
		{
			echo $rsSamples->GetLastError();
			exit(0);
		}

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
				$strCsvData .= $rsSampleData->GetCsvTableRow($arrColConversion,$tbl);
			}
		}
	}
	else if($rsWidget->GetValueAsString("h_sql_groupcolumn")!="")
	{
		//-- select using widget sql data
		$cols = $rsWidget->GetValueAsString("h_drilldowncolumns");
		$tbl = $rsWidget->GetValueAsString("h_sql_table");
		$groupby = $rsWidget->GetValueAsString("h_sql_groupcolumn");
		$filter = $rsWidget->GetValueAsString("h_sql_clause");
		$strCsvData = $rsWidget->GenerateCsvData($groupby,$cols,$tbl,$filter);
	}

	//-- trigger download
	download_send_headers($widgetName.".csv");
	echo $strCsvData;
}
exit(0);
?>
