<?php
	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');

	$session = new classActivePageSession($_POST['sessid']);

	$intNextReview = 0;
	$keyNextReview = 0;
	$intSessionCheck = 1;
	
	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		header("Content-Type: text/xml");
		echo "<params>";
		echo "<errorcode>Session Error</errorcode>";
		echo "<nextReview>".$intNextReview."</nextReview>";
		echo "<nextreviewkey>".$keyNextReview."</nextreviewkey>";
		echo "<sessionCheck>".$intSessionCheck."</sessionCheck>";	
		echo "</params>";
		exit;
	}
	
	//-- connect to swdata
	$connDB = new CSwDbConnection;
	if($connDB->SwDataConnect())
	{
		$type = gv('flg_sla');
		if($type==2)
		{
			//select all reviews
			$strQuery="select * from itsmsp_slad_review where is_inactive=0 and fk_contract = '" .pfs($_REQUEST['contract_id'])."'";
		}elseif($type==3)
		{
			//select all reviews
			$strQuery="select * from contract_review where is_inactive=0 and fk_id = '" .pfs($_REQUEST['contract_id'])."'";
		}else
		{
			//select all reviews
			$strQuery="select * from itsmsp_slad_review where is_inactive=0 and flg_sla = " .pfs($type)." and fk_id = " .pfs($_REQUEST['sla_id']);
		}
		$rsReviewRecords = $connDB->query($strQuery,true);
		while(!($rsReviewRecords->eof || $rsReviewRecords==false))
		{
			$strType = $rsReviewRecords->f('type');
			if($strType=="Bespoke Time")
			{
				$thisTime = $rsReviewRecords->f('start_dayx');
				if($thisTime>time() && ($thisTime<$intNextReview || $intNextReview==0))
				{
					$intNextReview = $thisTime;
					$keyNextReview = $rsReviewRecords->f('pk_id');
				}
			}
			elseif($strType=="Weekly")
			{
				$intDay = $rsReviewRecords->f('start_day');
				$today = getdate(time());
				$thisTime =  mktime(0, 0, 0, $today["mon"], $today["mday"], $today["year"]);

				$wday = $today["wday"];
				if($wday != $intDay)
				{
					if($wday<$intDay)
						$offset = $intDay - $wday;
					else
						$offset = 7 - ($wday-$intDay);
					$thisTime = strtotime("+".$offset." day",$thisTime);
				}else			
				{
					$thisTime = strtotime("+1 week",$thisTime);
				}

				if($thisTime>time() && ($thisTime<$intNextReview || $intNextReview==0))
				{
					$intNextReview = $thisTime;
					$keyNextReview = $rsReviewRecords->f('pk_id');
				}

			}elseif($strType=="Monthly")
			{
				$today = getdate();

				$month = $today["mon"];
				$year = $today["year"];
				$startOfMonth =  mktime(0, 0, 0, $month, 1, $year);

				$intWeek = $rsReviewRecords->f('start_week');
				$intDay = $rsReviewRecords->f('start_day');

				$thisTime = 0;			
				//while next review is less than the current time
				while($thisTime<time())
				{
					$startOfMonth =  gmmktime(0, 0, 0, $month, 1, $year);
					$thisMonth = $startOfMonth;
					$thisWeek = $intWeek;
					
					while($thisWeek>1)
					{
						$thisMonth =  strtotime("+1 week",$thisMonth);
						$thisWeek--;
					}
					$today = getdate($thisMonth);
					$wday = $today["wday"];
					if($wday != $intDay)
					{
						if($wday<$intDay)
							$offset = $intDay - $wday;
						else
							$offset = 7 - ($wday-$intDay);
						$thisTime = strtotime("+".$offset." day",$thisMonth);
					}
					else
						$thisTime = $thisMonth;
					$month++;
				}

				if(($thisTime<$intNextReview || $intNextReview==0))
				{
					$intNextReview = $thisTime;
					$keyNextReview = $rsReviewRecords->f('pk_id');
				}

			}elseif($strType=="Periodical Time")
			{

				$fk_period = $rsReviewRecords->f('fk_period');
				$strSelectPeriod = "select * from tm_periods where pk_auto_id = ".$fk_period;
				$rsPeriods = $connDB->query($strSelectPeriod,true);
				if(!($rsPeriods->eof || $rsPeriods==false))
				{
					$pStartDay = $rsPeriods->f('from_dd');
					$pStartMonth = $rsPeriods->f('from_mm');
					$pStartYear = $rsPeriods->f('from_yyyy');
					$pEndDay = $rsPeriods->f('to_dd');
					$pEndMonth = $rsPeriods->f('to_mm');
					$pEndYear = $rsPeriods->f('to_yyyy');
					$dOffset = $rsReviewRecords->f('day_offset');

					$today = getdate();

					$checkCurrentYear = $today["year"];
					$checkEndYear = 2038;
					
					//if the period start year is greater than the user selected year, use the period start year as year to start checking from
					if($pStartYear>0)
					{
						if($checkCurrentYear<$pStartYear)
							$checkCurrentYear = $pStartYear;
					}
					
					//if the period end year is less than the selected year, use the period end year
					if($pEndYear>0)
					{
						//if($checkEndYear>$pEndYear)
						$checkEndYear = $pEndYear;
					}
					
					$thisTime = 0;

					$boolGreaterThanToday = false;
					while(!$boolGreaterThanToday)
					{
						$thisTime =  gmmktime(0, 0, 0, $pStartMonth,$pStartDay, $checkCurrentYear);
						$thisTime = strtotime("+".$dOffset." day",$thisTime);
						if($thisTime>time())
							$boolGreaterThanToday = true;
						else
						{
							if($checkCurrentYear<$checkEndYear)
							{
								$checkCurrentYear++;
							}else
							{
								$thisTime = 0;
								$boolGreaterThanToday = true;
							}
						}
					}
					if($thisTime>time() && ($thisTime<$intNextReview || $intNextReview==0))
					{
						$intNextReview = $thisTime;
						$keyNextReview = $rsReviewRecords->f('pk_id');
					}
			
				
				}
			}
			$rsReviewRecords->movenext();

		}
	}
	header("Content-Type: text/xml");
	echo "<params>";
	echo "<nextreviewkey>".$keyNextReview."</nextreviewkey>";
	echo "<nextReview>".$intNextReview."</nextReview>";
	echo "<sessionCheck>".$intSessionCheck."</sessionCheck>";
	echo "</params>";
?>
