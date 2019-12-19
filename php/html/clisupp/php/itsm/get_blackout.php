<?php

	include_once('stdinclude.php');
	include_once('itsm_default/xmlmc/classactivepagesession.php');
	include_once('itsm_default/xmlmc/classdatabaseaccess.php');
	include_once('itsm_default/xmlmc/xmlmc.php');
	include_once('itsm_default/xmlmc/helpers/language.php');

	$session = new classActivePageSession(gv('sessid'));

	//-- Initialise the session
	if(!$session->IsValidSession())
	{
		header("Content-Type: text/xml");
		echo "<params>";
		echo "<errorcode>".$session->error."</errorcode>";
		echo "<nextBlackoutStart>0</nextBlackoutStart>";
		echo "<nextBlackoutEnd>0</nextBlackoutEnd>";
		echo "<nextBlackoutKey>0</nextBlackoutKey>";
		echo "<iscurrentblackout>0</iscurrentblackout>";
		echo "</params>";
		exit;
	}

	$intNextBlackoutStart = 0;
	$intNextBlackoutEnd = 0;
	$keyNextBlackout = 0;
	$intCurrentBlackout = 0;
	//-- connect to swdata
	$connDB = new CSwDbConnection;
	if($connDB->SwDataConnect())
	{
		//select all blackouts
		$strQuery="select * from ci_blackout where is_inactive=0 and fk_ci_id = '" .pfs($_GET['ci_id'])."'";

		$rsBlackoutRecords = $connDB->query($strQuery,true);
		while(!($rsBlackoutRecords->eof || $rsBlackoutRecords==false))
		{
			$strType = $rsBlackoutRecords->f('type');
			if($strType=="Bespoke Time")
			{
				$thisStartTime = $rsBlackoutRecords->f('start_dayx');
				$thisEndTime = $rsBlackoutRecords->f('end_dayx');
				// start time is in future
				if($thisStartTime>time() && ($thisTime<$intNextBlackoutStart || $intNextBlackoutStart==0))
				{
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
				}
				elseif($thisStartTime<time() && $thisEndTime>time())
				{
					// start time is past, and end time is in future, so set is currently in blackout
					$intCurrentBlackout = 1;
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
				}
			}
			elseif($strType=="Weekly")
			{
				$intDay = $rsBlackoutRecords->f('start_day');
				$intNumberOfDays = $rsBlackoutRecords->f('no_of_days');
				$today = getdate(time());
					
				$offset = $intDay - $today["wday"];
				$thisStartTime =  mktime(0, 0, 0, $today["mon"], $today["mday"]+$offset , $today["year"]);
				$thisEndTime = strtotime("+".$intNumberOfDays." day",$thisStartTime);

				while($thisEndTime<time())
				{
					$thisStartTime = strtotime("+1 week",$thisStartTime);
					$thisEndTime = strtotime("+1 week",$thisEndTime);
				}

				if($thisStartTime>time() && ($thisStartTime<$intNextBlackoutStart || $intNextBlackoutStart==0))
				{
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
				}
				elseif($thisStartTime<time() && $thisEndTime>time())
				{
					$intCurrentBlackout = 1;
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
					break;
				}
			}elseif($strType=="Monthly")
			{
				$today = getdate();
				$intNumberOfDays = $rsBlackoutRecords->f('no_of_days');
				$month = $today["mon"];
				$year = $today["year"];
				$startOfMonth =  mktime(0, 0, 0, $month, 1, $year);

				$intWeek = $rsBlackoutRecords->f('start_week');
				$intDay = $rsBlackoutRecords->f('start_day');

				$thisStartTime = 0;			
				$thisEndTime = 0;			
				//while the end time is less than the current time
				while($thisEndTime<time())
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
						$thisStartTime = strtotime("+".$offset." day",$thisMonth);
					}
					else
						$thisStartTime = $thisMonth;
					$month++;
					$thisEndTime = strtotime("+".$intNumberOfDays." day",$thisStartTime);
					if($thisStartTime<time() && $thisEndTime>time())
						break;
				}

				if($thisStartTime>time() && ($thisStartTime<$intNextBlackoutStart || $intNextBlackoutStart==0))
				{
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
				}
				elseif($thisStartTime<time() && $thisEndTime>time())
				{
					$intCurrentBlackout = 1;
					$intNextBlackoutStart = $thisStartTime;
					$intNextBlackoutEnd = $thisEndTime;
					$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
				}

			}elseif($strType=="Periodical Time")
			{

				$intNumberOfDays = $rsBlackoutRecords->f('no_of_days');
				$fk_period = $rsBlackoutRecords->f('fk_period');
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
					$dOffset = $rsBlackoutRecords->f('day_offset');

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
						$thisStartTime =  gmmktime(0, 0, 0, $pStartMonth,$pStartDay-1, $checkCurrentYear);
						$thisStartTime = strtotime("+".$dOffset." day",$thisStartTime);
						$thisEndTime = strtotime("+".$intNumberOfDays." day",$thisStartTime);
						if($thisStartTime>time())
							$boolGreaterThanToday = true;
						elseif($thisStartTime<time() && $thisEndTime>time())
							$boolGreaterThanToday = true;
						else
						{
							if($checkCurrentYear<$checkEndYear)
							{
								$checkCurrentYear++;
							}else
							{
								$thisStartTime = 0;
								$boolGreaterThanToday = true;
							}
						}
					}

					if($thisStartTime>time() && ($thisStartTime<$intNextBlackoutStart || $intNextBlackoutStart==0))
					{
						$intNextBlackoutStart = $thisStartTime;
						$intNextBlackoutEnd = $thisEndTime;
						$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
					}
					elseif($thisStartTime<time() && $thisEndTime>time())
					{
						$intCurrentBlackout = 1;
						$intNextBlackoutStart = $thisStartTime;
						$intNextBlackoutEnd = $thisEndTime;
						$keyNextBlackout = $rsBlackoutRecords->f('pk_auto_id');
					}
			
				
				}
			}
			$rsBlackoutRecords->movenext();
		}
	}
	header("Content-Type: text/xml");
	echo "<params>";
	echo "<nextBlackoutStart>".$intNextBlackoutStart."</nextBlackoutStart>";
	echo "<nextBlackoutEnd>".$intNextBlackoutEnd."</nextBlackoutEnd>";
	echo "<nextBlackoutKey>".$keyNextBlackout."</nextBlackoutKey>";
	echo "<iscurrentblackout>".$intCurrentBlackout."</iscurrentblackout>";
	echo "</params>";
?>
