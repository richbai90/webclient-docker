<?php

	//-- make sure running in context
	if(!isset($_core))
	{
		echo "This page is running outside of it's intended context. Please contact your Administrator";
		exit(0);
	}

	function sparkline_markup($arrData,$intThresholdLine, $idPrefix,$bHighIsGood = true)
	{

		$csDataString = implode(",",$arrData);

		if($bHighIsGood)
		{
			$minSpotColor = '#bf0000'; //--red
			$maxSpotColor = '#007f00'; //-- green
		}
		else
		{
			$minSpotColor = '#007f00'; //--green
			$maxSpotColor = '#bf0000'; //-- red
		}

		$markUp .= "$('#sl_".$idPrefix."').sparkline([".$csDataString."],{type: 'line', width: '200px',lineColor: '#000000',spotColor: '#0000ff',";
		$markUp .= "minSpotColor: '".$minSpotColor."',";
		$markUp .= "maxSpotColor: '".$maxSpotColor."',";

		$markUp .= "spotRadius: 3,";
		$markUp .= "fillColor: '',";
		$markUp .= "normalRangeMin: ".($intThresholdLine-1).",";
		$markUp .= "normalRangeMax: ".($intThresholdLine).",";
		$markUp .= "normalRangeColor: '#333333',";
		$markUp .= "drawNormalOnTop: true});";
		return $markUp;
	}


	//-- get column title for trenddata i.e. Last 7 days, last 6 weeks, last 4 months etc based on freqType and 
	function trenddata_columntitle($intLimit, $freqType)
	{		
		//--
		//-- contruct frequency message
		if($intLimit>1)
		{
			$freqMsg = "Last " . $intLimit . " " .$freqType ."s";
		}
		else
		{
			$freqMsg = "Last " . $intLimit . " " .$freqType;
		}
		return $freqMsg;
	}

	//-- draw scorecard data of trend data
	function trenddata_markup($arrData,$intThreshold, $freqType, $title = "", $bHighIsGood = true)
	{
		$strHTML = "<table border='0' cellpadding='0' cellspacing='0'>";
		if($title!="")$strHTML .= "<tr><td colspan='".count($arrData)."'>".$title."</td></tr><tr>";

		foreach($arrData as $value)
		{
			$diff = ($bHighIsGood)?($intThreshold-$value):($value-$intThreshold);
			$strClass = get_change_class($diff,$bHighIsgood);
			$strHTML .= "<td noWrap><div  class='".$strClass."'>".$value."</div></td><td>&nbsp;</td>";
		}

		$strHTML .= "</tr></table>";
		return $strHTML;
	}

	function get_trend_data($intMeasureId,$limit=0,$unittype="")
	{
		//-- limit of 0 means get all data for measure
		$strLimit="";
		if($limit>0) $strLimit = " limit 0,".$limit;
		
		switch ($unittype)
		{
			case "days":
				$intFactor = 86400;
				break;
			case "hrs":
				$intFactor = 3600;
				break;
			case "mins":
				$intFactor = 60;
				break;
			default:
				$intFactor = 1;
		}
		//--
		//-- select the lastest sample data (within limit)
		$arrData = Array();
		$rs = new SqlQuery();
		$strSql = "select h_value from h_dashboard_samples where h_fk_measure = " . $intMeasureId . " order by h_sampledate desc". $strLimit;
		$rs->Query($strSql,"sw_systemdb");
		while ($rs->Fetch())
		{
			$value = round($rs->GetValueAsNumber("h_value") / $intFactor,1);
			$arrData[] = $value;
		}

		//-- reverse array so latest value is last item in array
		return array_reverse($arrData);
	}

	function get_frequency_message($intDateEpoch,$freqType,$freqOcc)
	{
		if($intDateEpoch==-1)$intDateEpoch=time();
		$hour = date("H:i",$intDateEpoch);
		$dayName = date("D",$intDateEpoch);
		$dayNum = date("jS",$intDateEpoch);

		$weekNumber = intVal(date("W",$intDateEpoch)); 
		$monthName = date("M",$intDateEpoch);
		$monthNum = date("n",$intDateEpoch);
		$year = date("Y",$intDateEpoch); 

		
		
		//--
		//-- contruct frequency message
		if($freqOcc>1)
		{
			$freqMsg = "Sample taken every " . $freqOcc . " " .$freqType ."s";
		}
		else
		{
			$freqMsg = "Sample Taken every " .$freqType;
		}

		switch($freqType)
		{
			case "hour":
				$freqMsg .= " - " .$hour ." on ". $dayName." ".$dayNum.", ".$monthName." ".$year;
				break;

			case "day":
				$freqMsg .= " - ".$dayName." ".$dayNum.", ".$monthName." ".$year;
				break;

			case "week":
				$freqMsg .= " - Week ".$weekNumber.", ".$year;
				break;
			case "month":
				$freqMsg .= " - ".$monthName." ".$year;
				break;
			case "quarter":
				$freqMsg .= " - Quarter ".$monthName." ".$year;
				break;
			case "year":
				$freqMsg .= " - Year ".$monthName." ".$year;
				break;

		}

		return $freqMsg;
	}

	function get_target_tooltip($bHighIsgood, $diffInTarget)
	{
		$changeindicator="This is good, we are meeting our target";
		if($bHighIsgood)
		{

			if($diffInTarget<0)
			{
				$changeindicator="This is bad, we are missing our target.";
			}
			else if($diffInTarget>0)
			{
				$changeindicator="This is excellent, we are exceeding our target";
			}
		}
		else
		{
			if($diffInTarget<0)
			{
				$changeindicator ="This is excellent, we are exceeding our target";
			}
			else if($diffInTarget>0)
			{
				$changeindicator="This is bad, we are missing our target.";
			}
		}
		return $changeindicator;
	}


	function get_change_tooltip($diff, $bHighIsgood, $diffInTarget)
	{
		if($bHighIsgood)
		{
			$changeindicator = 'This is good, we are heading in the right direction with an improvement on last the sample.';
			if($diff<0)
			{
				$changeindicator = 'This is bad, we are going in the wrong direction.';
			}
			else if ($diff==0)
			{
				$changeindicator = 'There is no change in direction since the last sample.';
			}
			/*
			if($diffInTarget<0)
			{
				$changeindicator.=" Also note that we are still missing our target";
			}
			else if($diffInTarget>0)
			{
				$changeindicator.=" Also note that we are exceeding our target which is excellent";
			}
			else
			{
				$changeindicator.=" Also note we are meeting our target which is great";
			}
			*/
		}
		else
		{
			$changeindicator = 'This is bad, we are going in the wrong direction.';
			if($diff<0)
			{
			$changeindicator = 'This is good, we are heading in the right direction with an improvement on last the sample.';
			}
			else if ($diff==0)
			{
				$changeindicator = 'There is no change in direction since the last sample.';
			}

			/*
			if($diffInTarget<0)
			{
				$changeindicator.=" Also note we are exceeding our target which is excellent";
			}
			else if($diffInTarget>0)
			{
 				$changeindicator.=" Also note we are still missing our target";
			}
			else
			{
				$changeindicator.=" Also note we are meeting our target which is great";
			}
			*/
		}
		return $changeindicator;
	}

	function get_change_class($diff,$bHighIsgood)
	{
		if($bHighIsgood)
		{
			$changeindicator = 'kpi-green-small';
			if($diff<0)
			{
				$changeindicator = 'kpi-red-small';
			}
			else if ($diff==0)
			{
				$changeindicator = 'kpi-amber-small';
			}
		}
		else
		{
			$changeindicator = 'kpi-red-small';
			if($diff<0)
			{
				$changeindicator = 'kpi-green-small';
			}
			else if ($diff==0)
			{
				$changeindicator = 'kpi-amber-small';
			}
		}
		return $changeindicator;
	}

	function get_change_indicator($diff,$bHighIsgood, $diffInTarget)
	{
		$strTooltip = get_change_tooltip($diff,$bHighIsgood,$diffInTarget);
		if($bHighIsgood)
		{
			$changeindicator = " class='kpi-green-small'>&#9650;</div>";
			if($diff<0)
			{
				$changeindicator = " class='kpi-red-small'>&#9660;</div>";
			}
			else if ($diff==0)
			{
				$changeindicator = " class='kpi-amber-small'>&#9668;</div>";
			}
		}
		else
		{
			$changeindicator = " class='kpi-red-small'>&#9650;</div>";
			if($diff<0)
			{
				$changeindicator = " class='kpi-green-small'>&#9660;</div>";
			}
			else if ($diff==0)
			{
				$changeindicator = " class='kpi-amber-small'>&#9668;</div>";
			}
		}
		
		$changeindicator = "<div title='".$strTooltip."' " . $changeindicator;
		return $changeindicator;
	}



	$actions = 	'<button class="btn-edit-measure">manage measure properties and data</button><button class="btn-delete-measure">delete measure and related sample data</button><button class="btn-makenew-measure">create new measure based on this ones settings</button>';  
	$rs = get_measures();
	$tabledata="";
	$trendJson="";
	while ($rs->Fetch())
	{
		//-- basic fields that are stored against measure
		$id = $rs->GetValueAsString("h_id");
		$title = $rs->GetValueAsString("h_title");
		$freqType = $rs->GetValueAsString("h_frequency_type");
		$freqOcc = $rs->GetValueAsNumber("h_frequency");
		$threshold = $rs->GetValueAsNumber("h_threshold");
		$highIsGood = $rs->GetValueAsNumber("h_highisgood");
		$samplelimit = $rs->GetValueAsNumber("h_trendlimit");
		$unittype = $rs->GetValueAsString("h_unittype");
		switch ($unittype)
		{
			case "days":
				$value = $rs->GetValueAsNumber("h_actual") / 86400;
				$change = $rs->GetValueAsNumber("h_difference") / 86400;
				break;
			case "hrs":
				$value = $rs->GetValueAsNumber("h_actual") / 3600;
				$change = $rs->GetValueAsNumber("h_difference") / 3600;
				break;
			case "mins":
				$value = $rs->GetValueAsNumber("h_actual") / 60;
				$change = $rs->GetValueAsNumber("h_difference") / 60;
				break;
			default:
				$value = $rs->GetValueAsString("h_actual");
				$change = $rs->GetValueAsNumber("h_difference");
		}
		$lastSampleDate = $rs->GetValueAsNumber("h_lastsampledate");
		$owner = $rs->GetValueAsString("h_owner");


		$strDrilldownStyle = "";
		if($rs->GetValueAsString("h_drilldownprovider")=="")$strDrilldownStyle = "style='display:none;'";
		$drillDownTd ='<td valign="top"><button class="btn-widget-data" '.$strDrilldownStyle.'>View measure drill down data</button></td>';
		$RefreshDataTd ='<td valign="top"><button class="btn-widget-refresh">Re-collect the sample data for this measure</button></td>';


		$targetIndicator = ($highIsGood)?">":"<";

		$strClass = get_change_class(($value-$threshold),$highIsGood);

		//-- determine change indicator color red, green, amber if change has gone up down or static
		$overallChange = $value - $threshold;
		$changeindicator = get_change_indicator($change,$highIsGood,$overallChange);

		//-- freqMsg
		$freqMsg = get_frequency_message($lastSampleDate,$freqType,$freqOcc);

		//-- create trend graph
		$trendData = get_trend_data($id,$samplelimit,$unittype);
		$trendJson .= sparkline_markup($trendData,$threshold, $id,$highIsGood);
		$trendScoreboardTitle = trenddata_columntitle(count($trendData), $freqType);
		$trendScoreboard = trenddata_markup($trendData,$threshold, $freqType, "", $highIsGood);
		$tabledata.="<tr mid='".$id."'><td>".$actions."</td><td>".$title."<div class='f10 grey'>".$freqMsg."</div></td><td valign='top'>".$trendScoreboard."</td><td  valign='top'><div id='sl_".$id."' class='sparkline'></div></td><td valign='top' align='center'>".$targetIndicator." ".$threshold."</td><td valign='top' align='center' noWrap><div class='".$strClass."'>".round($value,1)."<span class='white'>".$unittype."</span></div></td><td valign='top' align='right'>".round($change,1)."</td><td valign='top'>".$changeindicator."</td>".$drillDownTd.$RefreshDataTd."</tr>";
	}

	include("../_css_switcher.php");

?>
<!DOCTYPE html>
<html>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta charset="utf-8" />  

	<link rel="stylesheet" href="../css/smoothness/jquery-ui-1.10.2.custom.min.css" />  
	<link rel="stylesheet" href="../css/dashboard.css" />  
	<link rel="stylesheet" href="../css/scorecard.css" />  
	<link id='stylesheet' rel="stylesheet" href="../<?=$cssFile;?>" />  	

	<style>

		*{font-size:12px;font-family:Verdana,sans-serif;color:#696969;}
		body{overflow:hidden;min-width:800px;margin:0;padding:0;}

		td
		{
			font-size:14px;
		}


		.tableHolder
		{
			padding:10px;
		}

		.white
		{
			color:#ffffff;
		}

	</style>

<script src="../js/jquery-1.9.1.js"></script>  
<script src="../js/jquery-ui-1.10.2.custom.min.js"></script>  
<script src="../js/jquery.sparkline.min.js"></script>  
<script src="../js/jquery.maskedinput.js"></script>

<script>
	var ESP={};
	ESP.sessionid = "<?=$sessionID;?>";

	$(document).ready(function() 
	{

		$( ".btn-widget-refresh" ).button({text: false,icons: {primary: "ui-icon-refresh"}}).click(function()
		{

			if(!confirm("NOTE: depending on how much data there is to collect this process could take several minutes. Would you like to continue?")) return;

			//-- disable buttons
			$("BUTTON").button("disable");

			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.mid=tr.attr("mid");


			var serviceUrl = "../trending/resetandrecollect.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{
											alert(j);
											window.location.reload(0);
										}).error(function(a,b,c)
														{
															$("BUTTON").button("enable");
															alert(b+":"+c);
														});

		});

		$( ".btn-widget-data" ).button({text: false,icons: {primary: "ui-icon-bookmark"}}).click(function()
		{
			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.mid=tr.attr("mid");

			var serviceUrl = "adminservices/getmeasurerecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#drill-form").data("type","measure");
												$("#drill-form").data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		}); 


		$( ".btn-create-measure" ).button({text: false,icons: {primary: "ui-icon-calculator"}}).click(function()
		{
			$("#measure-form" ).data("datarecord",false).dialog( "open" );
		}); 

		$( ".btn-delete-measure" ).button({text: false,icons: {primary: "ui-icon-trash"}}).click(function()
		{
			if(confirm("Are you sure you want to delete the measure and the related data?"))
			{
				var tr = $(this).closest("TR");

				//-- fetch measure record then once fetched open form
				var p = {};
				p.sessid = ESP.sessionid;
				p.mid=tr.attr("mid");

				var serviceUrl = "adminservices/deletemeasure.php";
				$.post(serviceUrl, p, function(j, res,http) 
											{  
												if(j && j.state && j.state.error)
												{
													alert(j.state.error)
												}
												else
												{
													tr.remove();
												}
											},"json").error(function(a,b,c)
															{
																alert(b+":"+c);
															});
			
			}
		}); 

		$( ".btn-makenew-measure" ).button({text: false,icons: {primary: "ui-icon-copy"}}).click(function()
		{
			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.mid=tr.attr("mid");

			var serviceUrl = "adminservices/getmeasurerecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												j.data.rowData.row["h_title"] = j.data.rowData.row["h_title"] + " (copy)";
												$("#measure-form" ).data("datarecord",false).data("createfromrecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		});

		$( ".btn-edit-measure" ).button({text: false,icons: {primary: "ui-icon-gear"}}).click(function()
		{
			var tr = $(this).closest("TR");

			//-- fetch measure record then once fetched open form
			var p = {};
			p.sessid = ESP.sessionid;
			p.mid=tr.attr("mid");

			var serviceUrl = "adminservices/getmeasurerecord.php";
			$.post(serviceUrl, p, function(j, res,http) 
										{  
											if(j && j.state && j.state.error)
											{
												alert(j.state.error)
											}
											else
											{
												$("#measure-form" ).data("datarecord",j.data.rowData.row).dialog( "open" );
											}
										},"json").error(function(a,b,c)
														{
															alert(b+":"+c);
														});


		}); 

	});
	
</script>
<body>

<div class="tableHolder">
	<table border="0"  cellspacing='2' cellpadding='2'>
		<tr class='ui-widget-header'>
			<td class="swtheme-fontcolor ui-widget-header"><button class="btn-create-measure">create a new measure</button></td>
			<td  class="swtheme-fontcolor ui-widget-header">Name & Frequency</td>
			<td  class="swtheme-fontcolor ui-widget-header">Scoreboard</td>
			<td  class="swtheme-fontcolor ui-widget-header" width="200px">Trend</td>
			<td  class="swtheme-fontcolor ui-widget-header">Target</td>
			<td  class="swtheme-fontcolor ui-widget-header" align="right">Latest</td>
			<td  class="swtheme-fontcolor ui-widget-header" align="right">Diff</td>
			<td class="swtheme-fontcolor ui-widget-header" ></td>
			<td class="swtheme-fontcolor ui-widget-header"></td>
			<td class="swtheme-fontcolor ui-widget-header"></td>
		</tr>
		<?=$tabledata;?>
	</table>	
</div>


<script>
	<?=$trendJson;?>
</script>

<?php
	include('forms/drilldowncontainer.php');
	include('forms/frmmeasure.php');
?>

</body>
</html>
