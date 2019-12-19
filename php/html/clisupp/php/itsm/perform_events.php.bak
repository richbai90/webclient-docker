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
		echo "<errorcode>".$session->error."</errorcode>";
		exit;
	}
	$connDB = new CSwDbConnection;
	if($connDB->SwDataConnect())
	{
		$periodStart = 1264896000;//"";
		$periodEnd = 1265500740;//"";
		$slaID = 1;
		$strSQL = "select * from itsmsp_slad where pk_slad_id = ".pfs(gv('sla_id'));
		$rsSLA = $connDB->query($strSQL,true);
		if(!($rsSLA->eof || $rsSLA==false))
		{
			$threshold = $rsSLA->f('thresh_level');
			$warning = $rsSLA->f('thresh_warning');
			$strPeriod = $rsSLA->f('avail_period');
			$periodStart = get_period($strPeriod, true,gv('periodstart'));
			$periodEnd = get_period($strPeriod, false,gv('periodstart'));
			$boolCurrent=1;
			if($periodEnd<time())
				$boolCurrent=0;
			$fk_cmdb_id = $rsSLA->f('fk_cmdb_id');
			$rsSLA->movenext();
		}
		//select all depeandant CIs and Service that are monitored for availability
		$strSQL = "select config_itemi.* from config_typei, config_itemi,config_reli where (config_itemi.flg_availmntr=1 OR config_typei.flg_canmonitor=1) and config_itemi.ck_config_type = config_typei.pk_config_type and fk_child_id=config_itemi.pk_auto_id and fk_parent_id=".$fk_cmdb_id." and (fk_child_type not like 'ME->%' or fk_child_type like 'ME->SERVICE')";
		$rsRecords = $connDB->query($strSQL,true);
		$downtime = 0;

		while(!($rsRecords->eof || $rsRecords==false))
		{
			$intStartOnX = $rsRecords->f('startedonx');
			$intExpResolveByX = $rsRecords->f('expectresolvebyx');
			$intResolvedOnX = $rsRecords->f('resolvedonx');
			$intID = $rsRecords->f('pk_auto_id');

			//only calc current downtime if there is a start date
			if($intStartOnX > 0)
			{
				$intStart = $intStartOnX;
				// if started before period, use start of period
				if($intStart<$periodStart)
				{
					$intStart=$periodStart;
				}

				//use resolvd on date
				$intEnd = $intResolvedOnX;
				if($intEnd<1)
				{
					//use current time as down time
					$intEnd= time();
					if($intEnd>$periodEnd)
					{
						// if todays date is greater than period end, use period end
						$intEnd = $periodEnd;
					}
				}else
				{
					//if resolved on date is greater than period, use period end
					if($intEnd>$periodEnd)
						$intEnd = $periodEnd;
				}

				// do not include if ended before start of period, or started after period
				if($intEnd<$periodStart)
				{
				}else if($intStart>$intEnd)
				{
				}else
				{
					$val = cmdb_get_unavailable_workingtime($intID,$intStart,$intEnd);
					$downtime = $downtime+$val;
				}
			}

			$strSQL = "select * from ci_avail_hist where fk_ci_id = ".$intID;
			$rsAvail = $connDB->query($strSQL,true);
			while(!($rsAvail->eof || $rsAvail==false))
			{
				$startedOnX = $rsAvail->f('startedonx');
				$endOnX = $rsAvail->f('endedonx');

				//if started and within period
				if($startedOnX>$periodStart && $endOnX<$periodEnd)
				{
					$val = $rsAvail->f('opdowntime');
					$mins = substr($val,-2);
					$hrs = substr($val,0,-3);
					$val = $hrs*60+$mins;
				}

				//if started before period, but ended in period
				if($startedOnX<$periodStart && $endOnX<$periodEnd && $endOnX>$periodStart)
				{
					$val = cmdb_get_unavailable_workingtime($intID,$periodStart,$endOnX);
				}

				//if started in period, but ended after period
				if($startedOnX>$periodStart && $endOnX>$periodEnd && $startedOnX<$periodEnd)
				{
					$val = cmdb_get_unavailable_workingtime($intID,$startedOnX,$periodEnd);
				}

				//if started before period, but ended after period
				if($startedOnX<$periodStart && $endOnX>$periodEnd)
				{
					$val = cmdb_get_unavailable_workingtime($intID,$periodStart,$periodEnd);
				}

				$downtime = $downtime+$val;
				$rsAvail->movenext();
			}
			$rsRecords->movenext();
		}
	}
	$dtHrs = floor($downtime/60);
	$dtMins = ($downtime-($dtHrs*60));
	if(strlen($dtMins)==1)
	{
		$dtMins = "0".$dtMins;
	}	
	$formatteddowntime = $dtHrs.".".$dtMins;
	$boolBroken = 0;
	if($downtime>($threshold*60))
		$boolBroken = 1;
	$boolWarning = 0;
	if($downtime>($warning*60))
		$boolWarning = 1;

	header("Content-Type: text/xml");
	echo "<params>";
	echo "<minutes>".$downtime."</minutes>";
	echo "<broken>".$boolBroken."</broken>";
	echo "<warning>".$boolWarning."</warning>";
	echo "<startperiod>".$periodStart."</startperiod>";
	echo "<iscurrent>".$boolCurrent."</iscurrent>";
	echo "<downtime>".$formatteddowntime."</downtime>";
	echo "</params>";

	function cmdb_get_unavailable_workingtime($intCI, $intStartDatex, $intEndDatex)
	{
		$connDB = new CSwDbConnection;
		$connDB->SwDataConnect();

		if( is_nan($intEndDatex) || is_nan($intStartDatex) || ($intStartDatex > $intEndDatex) ) 
			return 0;

		$array_weeksdays = Array(0=>"sun",1=>"mon",2=>"tue",3=>"wed",4=>"thu",5=>"fri",6=>"sat");
		$array_days = Array();

		//-- load ci availability record
		$strSQL = "select * from config_itemi where pk_auto_id = ".$intCI;
		$oRS = $connDB->query($strSQL,true);

		//-- fetch rows
		if(!($oRS->eof || $oRS==false))
		{
			//-- get each day start time and end time and work out total minutes per day
			$mons		= $oRS->f('mon_s');//g.get_field(oRS,"mon_s");
			$mone		= $oRS->f('mon_e');//g.get_field(oRS,"mon_e");
			//$array_days["mon"] = new oDay($mons,$mone,calc_minutes($mons,$mone),"mon");
			$monDay = new oDay;
			$monDay->setData($mons,$mone,calc_minutes($mons,$mone),"mon");
			$array_days["mon"] = $monDay;
			
			$tues		= $oRS->f('tue_s');//g.get_field(oRS,"tue_s");
			$tuee		= $oRS->f('tue_e');//g.get_field(oRS,"tue_e");
			//$array_days["tue"] = new oDay($tues,$tuee,calc_minutes($tues,$tuee),"tue");
			$tueDay = new oDay;
			$tueDay->setData($tues,$tuee,calc_minutes($tues,$tuee),"tue");
			$array_days["tue"] = $tueDay;

			$weds		= $oRS->f('wed_s');//g.get_field(oRS,"wed_s");
			$wede		= $oRS->f('wed_e');//g.get_field(oRS,"wed_e");
			//$array_days["wed"] = new oDay($weds,$wede,calc_minutes($weds,$wede),"wed");
			$wedDay = new oDay;
			$wedDay->setData($weds,$wede,calc_minutes($weds,$wede),"wed");
			$array_days["wed"] = $wedDay;

			$thus		= $oRS->f('thu_s');//g.get_field(oRS,"thu_s");
			$thue		= $oRS->f('thu_e');//g.get_field(oRS,"thu_e");
		//	$array_days["thu"] = new oDay($thus,$thue,calc_minutes($thus,$thue),"thu");
			$thuDay = new oDay;
			$thuDay->setData($thus,$thue,calc_minutes($thus,$thue),"thu");
			$array_days["thu"] = $thuDay;

			$fris		= $oRS->f('fri_s');//g.get_field(oRS,"fri_s");
			$frie		= $oRS->f('fri_e');//g.get_field(oRS,"fri_e");
			//$array_days["fri"] = new oDay($fris,$frie,calc_minutes($fris,$frie),"fri");
			$friDay = new oDay;
			$friDay->setData($fris,$frie,calc_minutes($fris,$frie),"fri");
			$array_days["fri"] = $friDay;

			$sats		= $oRS->f('sat_s');//g.get_field(oRS,"sat_s");
			$sate		= $oRS->f('sat_e');//g.get_field(oRS,"sat_e");
		//	$array_days["sat"] = new oDay($sats,$sate,calc_minutes($sats,$sate),"sat");
			$satDay = new oDay;
			$satDay->setData($sats,$sate,calc_minutes($sats,$sate),"sat");
			$array_days["sat"] = $satDay;


			$suns		= $oRS->f('sun_s');//g.get_field(oRS,"sun_s");
			$sune		= $oRS->f('sun_e');//g.get_field(oRS,"sun_e");
			$sunDay = new oDay;
			$sunDay->setData($suns,$sune,calc_minutes($suns,$sune),"sun");
			$array_days["sun"] = $sunDay;
		}
		
		//-- make start and end date round down to nearest minute
		$dateStart = $intStartDatex;
		$dStart = getdate($dateStart);
		$dateStart =  $dateStart - $dStart["seconds"];

		$dateEnd = $intEndDatex;
		$dEnd = getdate($dateEnd);
		$dateEnd =  $dateEnd - $dEnd["seconds"];

		$intWorkingMinutes = 0;

		//-- invalid date start >= end date
		if($dateStart >= $dateEnd)
		{
			//alert("Cannot calculate availability down time as the start date is greater than the end date.");
			return $intWorkingMinutes;
		}

		//-- if start and end are on same date just diff times
		if (issamedate($dateStart, $dateEnd))
		{
			//-- get start time and end time as number i.e. 0900 - 1730
			$initStartTime = getdatetime($dateStart,false);
			$initEndTime = getdatetime($dateEnd,false);

			//-- get current day start and end time
			$strCurrDay = $dStart["wday"];
			$strDay = $array_weeksdays[$strCurrDay];
			$tmpDay = $array_days[$strDay];

			$intWorkingMinutes =  get_unavail_workingtime_onday($initStartTime,$initEndTime,$tmpDay);
		}
		else
		{
			$tmpDateStart = getdate($dateStart);
			$tmpDateStartEpoch = $dateStart;
			$tmpDateEnd = getdate($dateStart);
			$tmpDateEnd["hours"]=23;	//-- set to end of day
			$tmpDateEnd["minutes"]=59;	//-- set to end of day
			$tmpDateEnd["seconds"]=0;	//-- set to end of day
			$tmpDateEndEpoch = mktime($tmpDateEnd["hours"],$tmpDateEnd["minutes"],$tmpDateEnd["seconds"],$tmpDateEnd["mon"],$tmpDateEnd["mday"],$tmpDateEnd["year"]);

			//-- they span different dates
			$boolFirstLoop = true;
			$boolLoop = true;
			while($boolLoop)
			{
				//-- if tmpstartdate = original end date we are at end of cycle

				if (issamedate($tmpDateStartEpoch, $dateEnd))
				{
					//CHECK
					$tmpDateEnd = getdate($dateEnd);
					$tmpDateEndEpoch = mktime($tmpDateEnd["hours"],$tmpDateEnd["minutes"],$tmpDateEnd["seconds"],$tmpDateEnd["mon"],$tmpDateEnd["mday"],$tmpDateEnd["year"]);
					$boolLoop = false;
				}

				//-- get start time and end time as number i.e. 09:00 - 17:30
				$initStartTime = getdatetime($tmpDateStartEpoch,false);
				$initEndTime = getdatetime($tmpDateEndEpoch,false);

				//-- get current day start and end time
				$strCurrDay = $array_weeksdays[$tmpDateStart["wday"]];
				$tmpDay = $array_days[$strCurrDay];

				$dayMins = get_unavail_workingtime_onday($initStartTime,$initEndTime,$tmpDay);
				$intWorkingMinutes = floatval($intWorkingMinutes) + floatval($dayMins);

				if($boolFirstLoop)
				{
					//-- have to set start day to begining of the day as we will be working with next day from now on 
					//-- i.e. first day started at 14:56 so next day have to start at 0000
					$boolFirstLoop = false;
					$tmpDateStart["hours"] = 0;
					$tmpDateStart["minutes"] = 0;
					$tmpDateStart["seconds"] = 0;
				}

				//-- increment by one day
				//$tmpDateStart[];//setDate(tmpDateStart.getDate() + 1);
				$tmpDateStartEpoch = mktime($tmpDateStart["hours"],$tmpDateStart["minutes"],$tmpDateStart["seconds"],$tmpDateStart["mon"],$tmpDateStart["mday"]+1,$tmpDateStart["year"]);
				//$tmpDateStartEpoch = $tmpDateStart;
				$tmpDateStart = getdate($tmpDateStartEpoch);
				$tmpDateEnd = getdate($tmpDateStartEpoch);
				$tmpDateEnd["hours"] =23;	//-- set to end of day
				$tmpDateEnd["minutes"] =59;	//-- set to end of day
				$tmpDateEnd["seconds"] =0;	//-- set to end of day
				$tmpDateEndEpoch = mktime($tmpDateEnd["hours"],$tmpDateEnd["minutes"],$tmpDateEnd["seconds"],$tmpDateEnd["mon"],$tmpDateEnd["mday"],$tmpDateEnd["year"]);
			}
		}

		if(is_nan($intWorkingMinutes))$intWorkingMinutes=0;
		//-- work out working time elapsed
		return $intWorkingMinutes;
	}

	function get_unavail_workingtime_onday($initStartTime,$initEndTime,$tmpDayObject)
	{

		$intWorkingMinutes = 0;
		$checkStartTime = $tmpDayObject->start;
		$checkEndTime = $tmpDayObject->end;

		//-- convert to 0900 - 1730
		//	floatval(str_replace(":","",$checkStartTime);
		$slaStartTime =floatval(str_replace(":","",$checkStartTime));
		$slaEndTime = floatval(str_replace(":","",$checkEndTime));//new Number(g.string_replace(checkEndTime,":","",false));
		$unvStartTime = floatval(str_replace(":","",$initStartTime));//new Number(g.string_replace(initStartTime,":","",false));
		$unvEndTime = floatval(str_replace(":","",$initEndTime));//new Number(g.string_replace(initEndTime,":","",false));

		//-- split times into hh and mins	
		$temp = explode(":",$checkStartTime);
		$slaStartTimeHH = $temp[0];//$checkStartTime.split(":")[0];
		$slaStartTimeMM = $temp[1];//checkStartTime.split(":")[1];
		$temp = explode(":",$checkEndTime);
		$slaEndTimeHH = $temp[0];//checkEndTime.split(":")[0];
		$slaEndTimeMM = $temp[1];//checkEndTime.split(":")[1];

		//-- actual day times of unvail
		$temp = explode(":",$initStartTime);
		$unvStartTimeHH = $temp[0];//initStartTime.split(":")[0];
		$unvStartTimeMM = $temp[1];//initStartTime.split(":")[1];
		$temp = explode(":",$initEndTime);
		$unvEndTimeHH = $temp[0];//initEndTime.split(":")[0];
		$unvEndTimeMM = $temp[1];//initEndTime.split(":")[1];

		if($checkStartTime==$checkEndTime) 
		{
			return 0;
		}

		//-- unavail started and ended before sla start time
		if (($unvStartTime < $slaStartTime) && ($unvEndTime <  $slaStartTime))
		{
			//-- nothing

		}
		else if ($unvStartTime < $slaStartTime)
		{
			//-- started before sla start 
			$workingHoursMins=0;
			if ($unvEndTime > $slaEndTime)
			{
				//-- end after sla time (so full days sla time)
				$intWorkingMinutes = calc_minutesdiff($slaStartTimeHH,$slaStartTimeMM, $slaEndTimeHH,$slaEndTimeMM);
			}
			else
			{
				//-- ended during working hours
				$intWorkingMinutes = calc_minutesdiff($slaStartTimeHH,$slaStartTimeMM, $unvEndTimeHH,$unvEndTimeMM);
			}
		}
		else if ($unvStartTime >= $slaStartTime)
		{
			//-- started during workibng hours
			if ($unvEndTime >  $slaEndTime)
			{
				//-- ended after working hours
				$intWorkingMinutes = calc_minutesdiff($unvStartTimeHH,$unvStartTimeMM, $slaEndTimeHH,$slaEndTimeMM);
			}
			else
			{
				//-- ended during working hours
				$intWorkingMinutes = calc_minutesdiff($unvStartTimeHH,$unvStartTimeMM, $unvEndTimeHH,$unvEndTimeMM);
			}
		}

		return $intWorkingMinutes;
	}


	//--
	//-- returns true or false if two dates are on the same date
	function issamedate($dateOne, $dateTwo)
	{
		$d1 = getdate($dateOne);
		$d2 = getdate($dateTwo);
		return ( ($d1["mday"]==$d2["mday"]) && ($d1["mon"]==$d2["mon"]) && ($d1["year"]==$d2["year"]) );
	}

	//-- for a date returns 09:30 etc or if bool true 0930
	function getdatetime($someDate,$boolNum)
	{
		if($boolNum==undefined)$boolNum=false;

		//-- make time to check
		$someDay = getdate($someDate);
		$intMinutes = $someDay["minutes"];//someDate.getMinutes();
		$intMinutes = ($intMinutes<10)?"0".$intMinutes:$intMinutes;
		if($boolNum)
		{
			return floatval($someDay["hours"] . "" . $intMinutes);	
		}
		else
		{
			return $someDay["hours"]. ":" . $intMinutes;
		}
	}

	class oDay
	{
		var $day = "";//strDay;
		var $start = "";//starttime;
		var $end = "";//endtime;
		var $minutes = "";//workingminutes;

		function setData($starttime, $endtime, $workingminutes, $strDay)
		{
			if($starttime=="")$starttime="00:00";
			if($endtime=="")$endtime="00:00";
			if($workingminutes=="")$workingminutes=0;
			$this->day = $strDay;
			$this->start = $starttime;
			$this->end = $endtime;
			$this->minutes = $workingminutes;

		}
	}

	function calc_minutesdiff($startTimeHH,$startTimeMM, $endTimeHH,$endTimeMM)
	{
		$startDate = getdate();
		$endDate = getdate();

		$startDate["hours"]=($startTimeHH);
		$startDate["minutes"]=($startTimeMM);

		$endDate["hours"]=($endTimeHH);
		$endDate["minutes"]=($endTimeMM);
		$one_minute=60;
		$startEpoch = mktime($startDate["hours"],$startDate["minutes"],$startDate["seconds"],$startDate["mon"],$startDate["mday"],$startDate["year"]);
		$endEpoch = mktime($endDate["hours"],$endDate["minutes"],$endDate["seconds"],$endDate["mon"],$endDate["mday"],$endDate["year"]);
		return ceil(($endEpoch-$startEpoch)/($one_minute));
	}

	//-- given 08:30 and 18:00 will work out minutes between
	function calc_minutes($startTime,$endTime)
	{
		if($startTime=="")$startTime="00:00";
		if($endTime=="")$endTime="00:00";

		$startTime =str_replace(":","",$startTime);
		$startTime =str_replace("30","50",$startTime);
		$endTime =str_replace(":","",$endTime);
		$endTime =str_replace("30","50",$endTime);

		$totalTime = $endTime - $startTime;

		if($totalTime=="0") return 0;

		//-- add a . before last 2 chars
		if(strlen($totalTime)==2)
		{
			$totalTime = 30;
		}
		else
		{
			$boolHalf = false;
			if(strpos($totalTime,"50")!=-1) $boolHalf=true;
			$totalTime =str_replace("50","0",$totalTime);
			$totalTime =str_replace("0","",$totalTime);

			//-- got hours so convert to minutes
			if($boolHalf) $totalTime = $totalTime . ".5";

			$totalTime = $totalTime * 60;
		}
		
		return $totalTime;
	}

	function get_period($strPeriod, $boolStart, $startPeriod)
	{
		if($startPeriod>0)
			$time = getdate($startPeriod);
		else
			$time = getdate();
		if($boolStart)
		{
			if($strPeriod=="Weekly")
			{
				$time["mday"] = $time["mday"]-$time["wday"];
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Monthly")
			{
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Quarterly")
			{

				$time["mon"] = $time["mon"] - ($time["mon"] % 3);
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Yearly")
			{
				$time["mon"] = 1;
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
		}else
		{
			if($strPeriod=="Weekly")
			{
				$time["mday"] = $time["mday"]-$time["wday"]+7;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Monthly")
			{
				$time["mon"] = $time["mon"]+1;
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Quarterly")
			{
				$time["mon"] = $time["mon"] - ($time["mon"] % 3) + 3;
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
			elseif($strPeriod=="Yearly")
			{
				$time["year"] = $time["year"]+1;
				$time["mon"] = 1;
				$time["mday"] = 1;
				$time["hours"] = 0;
				$time["minutes"] = 0;
				$time["seconds"] = 0;
			}
		}
		$retTime = mktime($time["hours"],$time["minutes"],$time["seconds"],$time["mon"],$time["mday"],$time["year"]);
		if($boolStart)
			return $retTime;
		else
			return $retTime-1;
	}

?>