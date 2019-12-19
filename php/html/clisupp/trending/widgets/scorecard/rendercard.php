<?php


	function sparkline_markup($arrData,$intThresholdLine, $idPrefix,$bHighIsGood = true, $width="100", $height="auto",$fillColor="")
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

		$markUp .= "$('#sl_".$idPrefix."').sparkline([".$csDataString."],{type: 'line', height:'".$height."',width: '".$width."',lineColor: '#000000',spotColor: '#0000ff',";
		$markUp .= "minSpotColor: '".$minSpotColor."',";
		$markUp .= "maxSpotColor: '".$maxSpotColor."',";

		$markUp .= "spotRadius: 3,";
		$markUp .= "fillColor: '".$fillColor."',";

		if($intThresholdLine>0)
		{
			$markUp .= "normalRangeMin: ".($intThresholdLine-1).",";
			$markUp .= "normalRangeMax: ".($intThresholdLine).",";	
			$markUp .= "normalRangeColor: '#333333',";
		}
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

	function get_trend_data($intMeasureId,$limit=0)
	{
		//-- limit of 0 means get all data for measure
		$strLimit="";
		if($limit>0) $strLimit = " limit 0,".$limit;

		//--
		//-- select the lastest sample data (within limit)
		$arrData = Array();
		$rs = new SqlQuery();
		$strSql = "select h_value from h_dashboard_samples where h_fk_measure = " . $intMeasureId . " order by h_sampledate desc". $strLimit;
		$rs->Query($strSql,"sw_systemdb");
		while ($rs->Fetch())
		{
			$value = $rs->GetValueAsNumber("h_value");
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
		}
		return $changeindicator;
	}

	function get_change_fontclass($diff,$bHighIsgood)
	{
		if($bHighIsgood)
		{
			$changeindicator = 'kpi--font-green';
			if($diff<0)
			{
				$changeindicator = 'kpi-font-red';
			}
			else if ($diff==0)
			{
				$changeindicator = 'kpi-font-amber';
			}
		}
		else
		{
			$changeindicator = 'kpi-font-red';
			if($diff<0)
			{
				$changeindicator = 'kpi-font-green';
			}
			else if ($diff==0)
			{
				$changeindicator = 'kpi-font-amber';
			}
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

	function get_change_indicator($diff,$bHighIsgood, $diffInTarget,$strSize="small")
	{

		$strTooltip = get_change_tooltip($diff,$bHighIsgood,$diffInTarget);
		if($bHighIsgood)
		{
			$changeindicator = " class='kpi-green-".$strSize."'>&#9650;</div>";
			if($diff<0)
			{
				$changeindicator = " class='kpi-red-".$strSize."'>&#9660;</div>";
			}
			else if ($diff==0)
			{
				$changeindicator = " class='kpi-amber-".$strSize."'>&#9668;</div>";
			}
		}
		else
		{
			$changeindicator = " class='kpi-red-".$strSize."'>&#9650;</div>";
			if($diff<0)
			{
				$changeindicator = " class='kpi-green-".$strSize."'>&#9660;</div>";
			}
			else if ($diff==0)
			{
				$changeindicator = " class='kpi-amber-".$strSize."'>&#9668;</div>";
			}
		}
		
		$changeindicator = "<div title='".$strTooltip."' " . $changeindicator;
		return $changeindicator;
	}



//-- we have a $xmlWidget to hand - so we use this to get php include
if(isset($_POST["um"]))
{
	$strShowMeasures = $_POST["um"];
	$csHideCols = $_POST["hc"];
}
else
{
	$rsWidget = get_widgetrecord($_POST['wid']);
	if($rsWidget->Fetch())
	{
		$strShowMeasures = $rsWidget->GetValueAsString("h_extra_1");
		$csHideCols = $rsWidget->GetValueAsString("h_extra_2");
	}
}


$rs = new SqlQuery();
$strSql = "select * from h_dashboard_measures where h_id in (".$strShowMeasures.")";
$tabledata="";
$trendJson="";
$nRows=0;
if($rs->Query($strSql,"sw_systemdb"))
{
	$nRows =$rs->RowCount();
	while ($rs->Fetch())
	{
		//-- basic fields that are stored against measure
		$id = $rs->GetValueAsString("h_id");
		$title = $rs->GetValueAsString("h_title");
		$freqType = $rs->GetValueAsString("h_frequency_type");
		$freqOcc = $rs->GetValueAsNumber("h_frequency");
		$unittype = $rs->GetValueAsString("h_unittype");
		switch ($unittype)
		{
			case "days":
				$value = $rs->GetValueAsNumber("h_actual") / 86400;
				break;
			case "hrs":
				$value = $rs->GetValueAsNumber("h_actual") / 3600;
				break;
			case "mins":
				$value = $rs->GetValueAsNumber("h_actual") / 60;
				break;
			default:
				$value = $rs->GetValueAsString("h_actual");
		}
		$change = $rs->GetValueAsString("h_difference");
		$threshold = $rs->GetValueAsNumber("h_threshold");
		$highIsGood = $rs->GetValueAsNumber("h_highisgood");
		$samplelimit = $rs->GetValueAsNumber("h_trendlimit");
	
		$lastSampleDate = $rs->GetValueAsNumber("h_lastsampledate");


		if($change>0)$change="+" . $change;
		$targetIndicator = ($highIsGood)?">":"<";


		//-- determine change indicator color red, green, amber if change has gone up down or static
		$overallChange = $value - $threshold;


		$strClass = get_change_class(($value-$threshold),$highIsGood);
		$strFontClass = get_change_fontclass(($value-$threshold),$highIsGood);
		$strTargetTitle =get_target_tooltip($highIsGood,$overallChange);

		//-- create trend graph
		$trendData = get_trend_data($id,$samplelimit);
		$trendScoreboardTitle = trenddata_columntitle(count($trendData), $freqType);
		$trendScoreboard = trenddata_markup($trendData,$threshold, $freqType, "",$highIsGood);
		
		$freqMsg="";
		$andFreq="";
		if (strpos($csHideCols,"freq")===false)
		{
			//-- freqMsg
			$andFreq = " & Frequency";
			$freqMsg = get_frequency_message($lastSampleDate,$freqType,$freqOcc);
		}

		$iDrill= ($rs->GetValueAsString("h_drilldownprovider")!="")?1:0;

		if($nRows>1)
		{

			if($iDrill)
			{
				$title = "<a href='#' class='anchor-drill-down'>".$title."</a>";
			}

			$changeindicator = get_change_indicator($change,$highIsGood,$overallChange,"small");

			//-- always show title
			$tableHeaders = "<td width='100%'>Name".$andFreq."</td>";
			$tabledata.="<tr mid='".$id."'><td class='f11'>".$title."<div class='f10 grey'>".$freqMsg."</div></td>";
			
			if (strpos($csHideCols,"scoreboard")===false)
			{
				$tableHeaders .= "<td>Scoreboard</td>";
				$tabledata.= "<td valign='top' class='f11'>".$trendScoreboard."</td>";
			}
			if (strpos($csHideCols,"trendline")===false)
			{
				$tableHeaders .= "<td>Trend</td>";
				$trendJson .= sparkline_markup($trendData,$threshold, $id,$highIsGood);
				$tabledata.= "<td  valign='top'><div id='sl_".$id."' class='sparkline'></div></td>";
			}
			if (strpos($csHideCols,"target")===false)
			{
				$tableHeaders .= "<td align='center'>Target</td>";
				$tabledata.= "<td valign='top' align='center' class='f11'>".$targetIndicator." ".$threshold."</td>";
			}
			if (strpos($csHideCols,"current")===false)
			{
				$tableHeaders .= "<td align='center'>Latest</td>";
				$tabledata.= "<td valign='top' align='center' noWrap class='f11'><div class='".$strClass." f11' title='".$strTargetTitle."'>".$value."<span>".$unittype."</span></div></td>";
			}
			if (strpos($csHideCols,"diff")===false)
			{
				$tableHeaders .= "<td align='center'>Diff</td>";
				$tabledata.= "<td valign='top' align='center' class='f11'>".$change."</td>";
			}
			if (strpos($csHideCols,"ind")===false)
			{
				$tableHeaders .= "<td></td>";
				$tabledata.= "<td valign='top'>".$changeindicator."</td></tr>";
			}
		}
		else
		{
			//-- single widget
			$changeindicator = get_change_indicator($change,$highIsGood,$overallChange,"large");
			$trendJson = sparkline_markup($trendData,0, $id,$highIsGood,200,50,'#efefef');
			$trendMarkup  = "<div id='sl_".$id."' class='sparkline'></div>";

		}
	}//eof while

	if($nRows>1)
	{
	//-- output table list
	?>
		<table border="0" width="100%" cellspacing='0' cellpadding='2'>
			<tr class='tbl-h'>
			<?=$tableHeaders;?>
			</tr>
			<?=$tabledata;?>
		</table>	
	<?
	}
	else
	{

		if($iDrill)
		{
			$title = "<a href='#' class='anchor-drill-down'>Our Target ".htmlentities($targetIndicator)." ".$threshold."</a>";
		}
		else
		{
			$title = "Our Target ". $targetIndicator." ".$threshold;
		}


		//-- showing only 1 item so do it as a big widget
		$prevScore = 0;
		$aSize = count($trendData);
		if($aSize>1)
		{
			$prevScore = $trendData[$aSize-2];
		}

	?>
		<table border="0" width="100%" cellspacing='0' cellpadding='0'>
			<tr>
				<tr mid='<?=$id;?>'>
					<td valign='top' align="center" colspan="3" class='f12 lightgray'><?=$title;?></td>
				</tr>
				<td align="center">
					<table cellspacing='5' cellpadding='5' border='0'>
						<tr>
							<td valign="middle" width="60px"><div class='f40 lightgray'><?=$prevScore;?><span><?=$unittype;?></span></div></td>
							<td align="center" class='f18 lightgray' valign="top"><?=$change ."<br>".$changeindicator;?></td>
							<td valign="middle" width="60px"><div class='f40 bold <?=$strFontClass;?>' title='<?=$strTargetTitle;?>'><?=$value;?><span><?=$unittype;?></span></div></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td align="center" colspan="3"><?=$trendMarkup;?></td>
			</tr>
		</table>	
	<?
	}
}
?>
<script>
	<?=$trendJson;?>
</script>
