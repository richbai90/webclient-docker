<?php


//-- we have a $xmlWidget to hand - so we use this to get chart and data
$rsWidget = get_widgetrecord($_POST['wid']);
if($rsWidget->Fetch())
{
	$chartXml = $rsWidget->GetValueAsString("h_definition");
	$strDataFetchInclude = $rsWidget->GetValueAsString("h_dataprovider");
	$intSimpleMeasureID = $rsWidget->GetValueAsNumber("h_sql_measure");

	//-- are we using a custom provider?
	if($strDataFetchInclude!="")
	{
		include("../".$strDataFetchInclude);
	}
	else if($intSimpleMeasureID>0)
	{
		//-- we want to run chart off measured data - so select measure results for the # of samples they want to show
		$numSamples = $rsWidget->GetValueAsNumber("h_sql_samplecount");

		$rsMeasure = get_measurerecord($intSimpleMeasureID);
		$rsSample = get_measurerecord_samples($intSimpleMeasureID,$numSamples);
		if($rsSample && $rsMeasure)
		{
			//-- get the sample record so we can get the sample period (to create labelss i.e. monthly = dec, jan etc
			$rsMeasure->Fetch();
			$periodType = $rsMeasure->GetValueAsString("h_frequency_type");
			$unitType = $rsMeasure->GetValueAsString("h_unittype");
			$fusiondata = get_fusion_sampledataset($rsSample, $periodType, $unitType);
			$fusionData = &$fusiondata;
		}
	}
	else
	{
		//-- using simple sql grouping
		$rs = new SqlQuery();
		$fusiondata = $rs->GenerateFusionData($rsWidget->GetValueAsString("h_sql_groupcolumn"),$rsWidget->GetValueAsString("h_sql_countcolumn"),$rsWidget->GetValueAsString("h_sql_table"),$rsWidget->GetValueAsString("h_sql_clause"),$rsWidget->GetValueAsString("h_sql_dir"),"swdata",$rsWidget->GetValueAsNumber("h_sql_limit"));
		$fusionData = &$fusiondata;
	}


		
	$matches = Array();
	$pattern = '%\:\[(.*?)\]%'; //
	preg_match_all($pattern, $chartXml, $matches);
	foreach($matches[0] as $key =>$match)
	{
		$search = $match;
		$varName = $matches[1][$key];
		$replaceVal = (isset(${$varName}))?${$varName}:"";

		$chartXml = str_replace($search,$replaceVal,$chartXml);
	}

	echo $chartXml;
}
exit;
?>