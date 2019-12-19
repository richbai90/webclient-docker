<?php 
	session_start();
	$_SESSION['portalmode'] = "FATCLIENT";
	//-- get data for # of customers requests raised and status - used in homepage.xml
	include('itsm_default/xmlmc/common.php');

	//-- connect and get those service stats
	$swData = database_connect("swdata");
	$strSelectService = "select * from sc_target where pk_auto_id=".$_GET['targetid'];
	$rsFolio = $swData->query($strSelectService,true);

	if(!$rsFolio->eof)
	{
		$startDatex = $rsFolio->f("start_onx");
		$endDatex = $rsFolio->f("end_onx");
		$rqTarget = $rsFolio->f("request_target");
		$sbTarget = $rsFolio->f("subsc_target");
		$serviceID = $rsFolio->f("fk_auto_id");
		$startMonth = $rsFolio->f("start_month");
		$startYear = $rsFolio->f("start_year");
	}

	$cnt = 0;
	$catXML = "<categories>";
	$seriesOne = '<dataset seriesName="Target" color="F6BD0F">';
	for($cnt=0;$cnt < 12; $cnt++)
	{
		$val = $cnt+$startMonth;
		$strDate = date("M", mktime(0, 0, 0, $val, 1));
		$tmp = strtolower($strDate."_r");

		$targetMonth = $rsFolio->f($tmp);
		$catXML .= "<category name=\"".$strDate."\"/>";
		$seriesOne .= "<set value=\"".$targetMonth."\"/>";
	}
	$catXML .= "</categories>";
	$seriesOne .= "</dataset>";


	$seriesTwo = '<dataset seriesName="Actual" color="AFD8F8">';
	//$seriesTwo .= "<set value=\"0\"/>";

	$currentDate = getdate();
	//$startMonth 
	$currMonth = $currentDate["mon"];

	if($currMonth<$startMonth)
	{
		$mOffset =($currMonth-(12-($startMonth-$currMonth)));
		$currentStart = mktime(0,0,0,$mOffset,1,$startYear);
	}
	else if($startMonth<=$currMonth)
	{
		$currentStart = mktime(0,0,0,($currMonth-($currMonth-$startMonth)),1,$startYear);
	}
	
	$currentStart = mktime(0,0,0,$startMonth,1,$startYear);

	$seriesTwo = '<dataset seriesName="Actual" color="AFD8F8">';
	//		$seriesTwo .= "<set value=\"0\"/>";

	$currentStartArr = getdate($currentStart);
	$currentEnd = mktime(0,0,0,$currentStartArr["mon"]+1,1,$currentStartArr["year"]);
	while($currentStart<time())
	{
		$strSelectService = "select count(callref) as cnt from opencall where itsm_fk_service=".$serviceID." and itsm_catreq_type='REQUEST' and logdatex between ".$currentStart." and ".$currentEnd;
		$rsActual = $swData->query($strSelectService,true);
		if(!$rsActual->eof)
		{
			$localCount = $rsActual->f("cnt");
			$seriesTwo .= "<set value=\"".$localCount."\"/>";
		}

		$currentStart = $currentEnd;
		$currentStartArr = getdate($currentStart);
		$currentEnd = mktime(0,0,0,$currentStartArr["mon"]+1,1,$currentStartArr["year"]);
	}
	$seriesTwo .= "</dataset>";
	
?>
<graph  caption="" 
                shownames="1" 
                showvalues="0" 
                numberPrefix="" 
                bgColor="E4E7D9" 
                bgAlpha='40' 
                showAlternateHGridColor='1' 
                AlternateHGridAlpha='30' 
                AlternateHGridColor='E4E7D9' 
                divLineColor='E4E7D9' 
                divLineAlpha='80' 
                canvasBorderThickness='1' 
                canvasBorderColor='114B78' 
                limitsDecimalPrecision='0' 
                divLineDecimalPrecision='0' 
                decimalPrecision="0">

<?php echo $catXML;?>

<?php echo $seriesOne;?>

<?php echo $seriesTwo;?>

</graph>
