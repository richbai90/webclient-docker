<?php

	//--
	//-- this script should be run when you first install or when you want to do a reset.
	//-- it will clear down sampling data per measure and re-collect based on he max number of samples set for each measure
	//-- depending on max sample setting for each measure and how many measures you have this could take a while so ensure you run this out of hours
	
	error_reporting(E_ALL);

	set_time_limit(0);

	include("../services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("../services/dashboard.helpers.php");
	include("sampling.helpers.php");

	// -- Log File
	$LogFilePath = sw_getcfgstring("InstallPath")."\\log\\resetandcollect.log";
	define('_PHP_LOGFILE',$LogFilePath);
	
	// -- Get Session ID from POST
	$sessid = $_POST['sessid'];	
	// -- Establish bindSession using Session ID from POST
	if($sessid!=null)
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessid);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			logtofile("info","Unable to establish XMLMC bindSession.");
			exit(0);
		}
		else
			logtofile("info","Successfully established XMLMC bindSession.");
	}
	else
	{
		logtofile("info","Session ID is blank.");
		exit(0);
	}
		
	function get_array_of_sampledateranges($freqType,$intNowTime,$maxSamples = 0)
	{
		$arrDateRanges = Array();

		//-- so if freqtype is hour and maxSamples is say 78 - then we need to go back 78 hours and then generate data range for each hour up to
		switch($freqType)
		{
			case "hour":
				//-- we start from last hour as cant collect full data for hour that is in progress
				for($x=$maxSamples;$x>0;$x--)
				{
					$historicSampleDateTime = $intNowTime - (($x-1) * 3600);
					$o = get_sample_startend_timeobject($freqType,$historicSampleDateTime);
					$o->sampletakendatetime = $historicSampleDateTime;
					$arrDateRanges[] = $o;
				}
				break;
			case "day":
				//-- we start from last week anyway as cant collect full data for day that is in progress
				for($x=$maxSamples;$x>-1;$x--)
				{
					$historicSampleDateTime = strtotime("-".$x." day",$intNowTime);					
					// -- Create an epoch value to ensure that the correct 'day' is displayed
					$intYear = date('y',$historicSampleDateTime);
					$intMonth = date('m',$historicSampleDateTime);
					$intDay = date('d',$historicSampleDateTime);
					$chartSampleDateTime = mktime(0,0,0,$intMonth,$intDay-1,$intYear);					
					// -- 
					$o = get_sample_startend_timeobject($freqType,$historicSampleDateTime);
					$o->sampletakendatetime = $chartSampleDateTime;
					$arrDateRanges[] = $o;
				}
				break;
			case "week":
				//-- we start from last week as cant collect full data for week that is in progress
				for($x=$maxSamples;$x>0;$x--)
				{
					$historicSampleDateTime = strtotime("-".$x." week",$intNowTime);
					$o = get_sample_startend_timeobject($freqType,$historicSampleDateTime);
					$o->sampletakendatetime = $historicSampleDateTime;
					$arrDateRanges[] = $o;
				}
				break;
			case "month":
				//-- we start from last week as cant collect full data for week that is in progress
				for($x=$maxSamples;$x>-1;$x--)
				{
					$historicSampleDateTime = strtotime("-".$x." month",$intNowTime);					
					// -- Create an epoch value that starts from the first day of the month
					$intYear = date('y',$historicSampleDateTime);
					$intMonth = date('m',$historicSampleDateTime);
					$historicSampleDateTime = mktime(0,0,0,$intMonth,1,$intYear);					
					$o = get_sample_startend_timeobject($freqType,$historicSampleDateTime);
					// -- Create an epoch value for the chart dates (samples). The month and year values are used in the chart
					$chartSampleDateTime = mktime(0,0,0,$intMonth-1,1,$intYear);
					$o->sampletakendatetime = $chartSampleDateTime;		
					$arrDateRanges[] = $o;
				}
				break;
			case "year":
				//-- we start from last week as cant collect full data for week that is in progress
				for($x=$maxSamples;$x>0;$x--)
				{
					$historicSampleDateTime = strtotime("-".$x." month",$intNowTime);
					$o = get_sample_startend_timeobject($freqType,$historicSampleDateTime);
					$o->sampletakendatetime = $historicSampleDateTime;
					$arrDateRanges[] = $o;
				}
				break;
		}
		
		return $arrDateRanges;
	}

	$intCurrentTime = time();


	sw_file_put_contents(_PHP_LOGFILE,"",false);
	logtofile("Info","START COLLECTION PROCESS",true);

	//--
	//-- RUN MEASURE SAMPLE DATA COLLECTORS
	$rs = new SqlQuery();
	$strSql = "select * from h_dashboard_measures";

	//-- check if doing it for just one measure
	if($_POST["mid"])
	{
		$strSql .= " where h_id = " . pfs($_POST["mid"]) ;
	}


	if($rs->Query($strSql,"sw_systemdb"))
	{
		while ($rs->Fetch())
		{
			//-- basic fields that are stored against measure
			$measureID = $rs->GetValueAsString("h_id");
			$title = $rs->GetValueAsString("h_title");
			$freqType = $rs->GetValueAsString("h_frequency_type");
			$freqOcc = $rs->GetValueAsNumber("h_frequency");
			$freqCount = $rs->GetValueAsNumber("h_frequency_count") + 1;
			$currentvalue = $rs->GetValueAsString("h_actual");
			$maxSamples = $rs->GetValueAsNumber("h_maxsamples_tostore");

			logtofile("info","Running full Backlog Sampling for measure [$title] - total samples to collect " . $maxSamples,true);

			//-- to enable us to save the sample and affected record data, clear down etc
			$sampler = new sample($measureID);
			if(!$sampler->resetSampledData())
			{
				logtofile("info","Data collection for measure [$title] cancelled as unable to clear down existing data",true);
				continue;
			}

		
			//-- work out the number of samples we need to take and the date range for each sample going back to max number of samples
			//-- returns an array of date range objects 0 to max samples - we can loop this and run sampler for each range for the given measure
			$arrSamplesRanges = get_array_of_sampledateranges($freqType,$intCurrentTime,$maxSamples);
			for($y=0;$y<count($arrSamplesRanges);$y++)
			{
				//-- var to hold the current date range object
				$sampleDateRange = $arrSamplesRanges[$y];

				//--
				//-- check if they are using a data provider - if so use that to collect sample data
				$dataprovider = trim(str_replace("//","/",$rs->GetValueAsString("h_dataprovider")));
				if($dataprovider!="")
				{
					if(file_exists("../".$dataprovider))
					{	
						ob_start( );
						include("../".$dataprovider); //-- data provider does all of the processing - it should select a count,avg,prec,sum whatever fromrecords between a start and end range
						$output = ob_get_clean();
						logtofile("info",$output);
					}
					else
					{
						//-- custom data provider does nto exist log error
						logtofile("warning","The data provider script was not found - sampling skipped");
					}
				}
				else
				{
					//-- they are not using a custom data provider so use the simple settings
					$sampletable = trim($rs->GetValueAsString("h_sampleon_table"));
					$valcol = $rs->GetValueAsString("h_sampleon_valcolname");
					$startdatecol = $rs->GetValueAsString("h_sampleon_datecolname1");
					if($sampletable!="" && $valcol!="" && $startdatecol!="")
					{
						$keycol = trim($rs->GetValueAsString("h_sampleon_keycolname"));
						if($keycol=="")$keycol=$valcol;

						$mathfunc = trim($rs->GetValueAsString("h_sampleon_mathfunc"));
						if($mathfunc=="")$mathfunc="count";
						
						$enddatecol = trim($rs->GetValueAsString("h_sampleon_datecolname2"));
						if($enddatecol=="")$enddatecol=$startdatecol;

						$whereclause = trim($rs->GetValueAsString("h_sampleon_whereclause"));
						if($whereclause!="") $whereclause = " and " . $whereclause;

						$savecols = trim($rs->GetValueAsString("h_sampleon_savecols"));
						if($savecols!="")$savecols=",".$savecols;


						//-- clause to ensure only work with record where dates are populate
						$dateClause = "";
						if($startdatecol!=$enddatecol)$dateClause = " and $enddatecol > $startdatecol";

						//-- if doing a percentage get count of all and then fetch rows that meet percentage criteria
						if($mathfunc=="perc")
						{
							$mathColPercWhere = $rs->GetValueAsString("h_sampleon_colwhere");

							//-- select data from table - loop record and do math - at the end insert sample and insert sample data records
							$strSampleSelect = trim("select $keycol as samplekeyxx,$valcol as samplevalxx,$startdatecol as sampledate1xx,$enddatecol as sampledate2xx $savecols from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause and $mathColPercWhere");

							//-- get the total records excluding the percentage where clause
							$percentageTotalRecords = 0;
							$strTotalCountSelect = trim("select count($keycol) as totalcount from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause");
							$rsCounter = new SqlQuery();
						
							if(!$rsCounter->Query($strTotalCountSelect,"swdata"))
							{
								logtofile("error","Failed To Get Percentage Total : " . $rsCounter->GetLastErrorMessage() . "\n\nSQL : $strTotalCountSelect", true);
							}
							else
							{
								$rsCounter->Fetch();
								$percentageTotalRecords = $rsCounter->GetValueAsNumber("totalcount");
							}
						}
						else
						{
							//-- select data from table - loop record and do math - at the end insert sample and insert sample data records
							$strSampleSelect = trim("select $keycol as samplekeyxx,$valcol as samplevalxx,$startdatecol as sampledate1xx,$enddatecol as sampledate2xx $savecols from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause");
						}

						$rsSample = new SqlQuery();
						if($rsSample->Query($strSampleSelect,"swdata"))
						{
							//-- only saving 10 data cols - so make sure jsut in case admin put in more cols
							$arrSaveDataCols = array_slice(explode(",",$savecols), 1, 11);

							$rowsAffected=0;
							$totalMathValue=0;
							$tempValue=0;

							$sampler->resetDataRecords();					

							while ($rsSample->Fetch())
							{
								$rowsAffected++;
								$keyColValue = $rsSample->GetValueAsNumber("samplekeyxx");
								$mathColValue = $rsSample->GetValueAsNumber("samplevalxx");
								$date1ColValue = $rsSample->GetValueAsNumber("sampledate1xx");
								$date2ColValue = $rsSample->GetValueAsNumber("sampledate2xx");

								//-- create data object to store affected row details
								$rowData = new stdClass();
								$rowData->h_sampledkeyvalue = $keyColValue;
								$rowData->h_sampledvalue = $mathColValue;
								$rowData->h_sampledcolumn = $valcol;
								$rowData->h_sampledatecolumn1_value = $date1ColValue;
								$rowData->h_sampledatecolumn2_value = $date2ColValue;
								$rowData->h_data_col1_value = $valcol;
								//-- store data col values
								for($x=0;$x<count($arrSaveDataCols);$x++)
								{
									$colName = $arrSaveDataCols[$x];							
									$saveTo = "h_data_col".($x+1)."_value";
									$rowData->{$saveTo} = $rsSample->GetValueAsString($colName);
								}
								//-- put into array of records
								$sampler->addDataRecord($rowData);

								//-- run the math function
								switch($mathfunc)
								{
									case "count":
										$totalMathValue = $rowsAffected;
										break;
									case "avg":
										$tempValue = $tempValue + $mathColValue;
										$totalMathValue = $tempValue / $rowsAffected;
										break;
									case "sum":
										$totalMathValue = $totalMathValue + $mathColValue;
										break;
									case "perc":
										$totalMathValue = round(($rowsAffected / $percentageTotalRecords) * 100,0);
										break;
								}
							}

							//-- set the main sample info
							$sampler->setSampleInfo($sampleDateRange->sampletakendatetime,$totalMathValue);
							if($sampler->commit())
							{
								logtofile("info","Backlog Sample [".($y+1)."][".$sampleDateRange->sampletakendatetime."] completed for [$title] - rows collected " . $rowsAffected);
							}
							else
							{
								logtofile("warning","There was an issue commiting Backlog Sample [".($y+1)."][".$sampleDateRange->sampletakendatetime."] for [$title]  - rows collected " . $rowsAffected,true);
							}
						}
						else
						{
							//-- sql error
							logtofile("error",$rsSample->GetLastErrorMessage() . "\n\nSQL : $strSampleSelect");
						}	//-- eof if($rsSample->Query($strSampleSelect,"swdata"))
						$rsSample = null;
						if(@$_GET["html"]=="1")flush();
					}
					else
					{
						//-- data collection fields not defined properly
						logtofile("warning","The simple data collection information is not set up - sampling skipped",true);
					}//-- if($sampletable!="" && $valcol!="" && $startdatecol!="")

				}//-- eof if($dataprovider!="")

			}//-- eof for($y=0;$y<count($arrSamplesRanges);$y++)

			logtofile("info","All Backlog Sampling completed for [$title]",true);
			sleep(5);

		}//-- eof while ($rs->Fetch())

	}
	
	logtofile("Info","COLLECTION COMPLETE",true);
	die();
?>