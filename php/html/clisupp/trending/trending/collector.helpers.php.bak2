<?php
	// -- Dashboard & Trending - Data Collector Helpers
	
	// -- INCLUDES
	include("../services/dashboard.helpers.php");
	include_once('stdinclude.php');
	include_once('itsmf/xmlmc/classactivepagesession.php');
	include_once('itsmf/xmlmc/classdatabaseaccess.php');
	include_once('itsmf/xmlmc/xmlmc.php');
	include_once('itsmf/xmlmc/helpers/language.php');
	
	// -- LOGGING CONFIGURATION
	$LogFilePath = sw_getcfgstring("InstallPath")."\\log\\dtlogging.log";
	define('_PHP_LOGFILE',$LogFilePath);
	define('_LAST_RUN_DATAFILE',"lastexec.dat");
	
	// -- Get 'sessid' from VPME
	$sessid = gv('sessid');
	$session = new classActivePageSession($sessid);
	if(!$session->IsValidSession())
	{
		// -- ABORT DATA COLLECTION
		logtofile("ERROR","Unable to establish a session");
		logtofile("END","Dashboard & Trending Engine <> Data Collector");
		exit(0);
	}
	
	// -- VARIABLES
	// -- [SAMPLE DATE] - Get sample date info and determine whether the collector should run for each Time Period
	$intSampleTime = time();
	$currentRunDate = getSampleDateInfo($intSampleTime);
	$bRunHourlyCollector = true;
	$bRunDailyCollector = ($currentRunDate->hour==1); // -- Run between 1am and 2am
	$bRunWeeklyCollector = ($currentRunDate->day==1 && $currentRunDate->hour==2); // -- Run each monday between 2am and 3am
	$bRunMonthlyCollector = ($currentRunDate->dom==1 && $currentRunDate->hour==3); // -- Run on the first dsy of each month between 3am and 4am
	$bRunQuarterlyCollector = ($currentRunDate->dom==1 && $currentRunDate->hour==4 && ($currentRunDate->month==4 || $currentRunDate->month==7 || $currentRunDate->month==10 || $currentRunDate->month==1)); // -- Run on the first dsy of each month after qtr between 4am and 5am
	$bRunYearlyCollector = ($currentRunDate->dom==1 && $currentRunDate->hour==5 && $currentRunDate->month==1); // -- Run on the first dsy of each month after qtr between 5am and 6am
	// -- [SAMPLE DATE]
	
	// -- logtofile - Log error/info messages to a log file
	function logtofile($type,$message,$boolEcho = false)
	{
		$msg = date("Y-m-d H:i:s")." [DBOARD]:[".str_pad($type,5)."]:[SWSE] ".trim($message).chr(13).chr(10);
		sw_file_put_contents(_PHP_LOGFILE,$msg,true);
		if($boolEcho)
		{
			if(@$_GET["html"]=="1")
			{
				echo nl2br($msg);
			}
			else
			{
				echo ($msg);
			}
		}
	}
	
	// -- determineRunCollector - Determine whether to begin data collection, based on the last time it was run
	function determineRunCollector()
	{
		$boolRunCollector = true;
		$intLastRunTime = 0;
		$intSampleTime = time();
		if(file_exists(_LAST_RUN_DATAFILE))
		{
			$intLastRunTime = file_get_contents(_LAST_RUN_DATAFILE);
		}
		// -- Only run the script if it was not run within the last hour (3600 seconds)
		if($intLastRunTime>0 && ($intSampleTime - $intLastRunTime)<3000)
		{
			$boolRunCollector = false;
			logtofile("Info","The script has already been run within the last hour.");
		}
		return $boolRunCollector;		
	}
	
	// -- updateCollectorRunTime - Update the _LAST_RUN_DATAFILE file with the current time
	function updateCollectorRunTime($intSampleTime)
	{
		sw_file_put_contents(_LAST_RUN_DATAFILE,$intSampleTime);
	}
	
	// -- getDashboardMeasures - Return object containing Dashboard Measures recordset
	function getDashboardMeasures($strTable)
	{
		$strMeasureSQL = "SELECT * FROM " . $strTable;
		// -- Connect to sw_systemdb
		$rs = new CSwDbConnection;
		if(!$rs->CacheConnect(swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Dashboard Measures].");
			exit;
		}
		// -- Return the Query object
		if($rs->Query($strMeasureSQL))
			return $rs;
		else
			return false;
	}
	
	// -- bRequireCollection - Determine whether it is required to collect data based on the Time Period
	function bRequireCollection($freqType)
	{
		$boolRun = false;
		// -- Use variables that are already set within script
		global $bRunDailyCollector,$bRunHourlyCollector,$bRunWeeklyCollector,$bRunMonthlyCollector,$bRunQuarterlyCollector,$bRunQuarterlyCollector,$bRunYearlyCollector;
		switch($freqType)
		{
			case "hour":
				//-- get datetime for the previous hour
				$boolRun=$bRunHourlyCollector;
				break;
			case "day":
				$boolRun=$bRunDailyCollector;
				break;
			case "week":
				$boolRun=$bRunWeeklyCollector;
				break;
			case "month":
				$boolRun=$bRunMonthlyCollector;
				break;
			case "quarter":
				$boolRun=$bRunQuarterlyCollector;
				break;
			case "year":
				$boolRun=$bRunYearlyCollector;
				break;
		}
		return $boolRun;
	}
	
	// -- updateMeasureRecord - Function to update a Measure record
	function updateMeasureRecord($intMeasureId, $strUpdate, $strTable)
	{
		// -- Connect to sw_systemdb
		$rs = new CSwDbConnection;
		if(!$rs->CacheConnect(swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Update Dashboard Measures].");
			exit;
		}
		// -- Provided that the Measure ID (h_id) is valid, the measure will be updated
		$strUpdateSQL = "UPDATE ".$strTable." SET ".$strUpdate." WHERE h_id = " . $intMeasureId;
		if($rs->Query($strUpdateSQL))
			return true;
		else
			return false;		
	}
	
	// -- getPercentageTotal - Get percentage total when a Measure is using "Percentage" Sample Method 
	function getPercentageTotal($strSQL)
	{
		$percentageTotalRecords = 0;
		// -- Connect to swdata
		$rs = new CSwDbConnection;
		if(!$rs->Connect(swdsn(), swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Get Percentage Total].");
			exit;
		}
		if($rs->Query($strSQL))
		{
			$rs->Fetch();
			$percentageTotalRecords = $rs->GetValue("totalcount");
			return $percentageTotalRecords;
		}
		else
		{
			logtofile("Error","Failed to get Percentage total. Please check that Sample Settings are valid. \n\nSQL : " . $strSQL, true);
		}
		return $percentageTotalRecords;
	}
	
	// -- getSampleData
	function getSampleData($strSQL)
	{
		// -- Connect to swdata
		$rs = new CSwDbConnection;
		if(!$rs->Connect(swdsn(), swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Get Sample Data].");
			exit;
		}
		if($rs->Query($strSQL))
		{
			return $rs;
		}
		else
		{
			logtofile("Error","Unable to get sample data \n\nSQL : $strSampleSelect");
		}
	}
	
	// -- runMathFunc
	function runMathFunc($mathfunc,$rowsAffected,$mathColValue,$percentageTotalRecords)
	{
		$totalMathValue = 0;
		$tempValue = 0;
		switch($mathfunc)
		{
			case "count":
				$totalMathValue = $rowsAffected;
				break;
			case "avg":
				$tempValue = $tempValue + $mathColValue;
				$totalMathValue = $tempValue / $rowsAffected;
				if($rowsAffected == 0) $totalMathValue = 0;
				break;
			case "sum":
				$totalMathValue = $totalMathValue + $mathColValue;
				break;
			case "perc":
				$totalMathValue = round(($rowsAffected/$percentageTotalRecords) * 100,0);
				break;
		}
		return $totalMathValue;
	}
	
		
	// -- ePrepareForSql - Wrap string with single quote if not numeric
	function ePrepareForSql($strValue)
	{
		$strValue = str_replace("'","''",$strValue);
		if(!is_numeric($strValue))
		{
			$strValue = "'".$strValue."'";
		}
		return $strValue;
	}
	
	// -- ePrepareArrayForSql - Splits an array to find values and prepare them for SQL insert, then returns all as a comma seperated string
	function ePrepareArrayValues($arrData)
	{
		$strValues = "";
		foreach($arrData as $col => $value)
		{
			if($strValues != "") $strValues .= ",";
			$strValues .= ePrepareForSql($value);
		}
		return $strValues;
	}
	
	// -- ePrepareArrayColumns - Splits an array to find columns, then returns all as a comma seperated string
	function ePrepareArrayColumns($arrData)
	{
		$strCols = "";
		foreach($arrData as $col => $value)
		{
			if($strCols != "") $strCols .= ",";
			$strCols .= $col;
		}
		return $strCols;
	}
	
	function insertSampleMeasure($arrMeasureData)
	{
		// -- Connect to sw_systemdb
		$rs = new CSwDbConnection;
		if(!$rs->CacheConnect(swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Insert Measure Sample].");
			exit;
		}
		
		// -- Prepare insert statement using Array
		$strValues = ePrepareArrayValues($arrMeasureData);
		$strCols = ePrepareArrayColumns($arrMeasureData);
		
		$strSamplesTable = "h_dashboard_samples";
		$strInsertSQL = "INSERT INTO ".$strSamplesTable." (".$strCols.") VALUES (".$strValues.")";
		if($rs->Query($strInsertSQL))
		{
			return true;
		}
		return false;
	}
	
	// -- insertSampleMeasure
	function insertSampleMeasureDataRow($arrSampleData)
	{		
		// -- Connect to sw_systemdb
		$rs = new CSwDbConnection;
		if(!$rs->CacheConnect(swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Insert Measure Sample Datarow].");
			exit;
		}		
		// -- Create record in h_dahsboard_sample_datarow
		// -- Get ID from h_dashboard_samples insert and then insert the Array into h_dahsboard_sample_datarow
		// -- Use boolInsertOK to check that queries within this function are invoked successfully
		$boolInsertOK = false;
		$intMeasureID = $arrSampleData["h_fk_measure"];
		$intNewSampleID = "";
		$strSelectSampleID = "SELECT h_pk_sid FROM h_dashboard_samples WHERE h_fk_measure = ".$intMeasureID." order by h_pk_sid desc limit 1";
		if($rs->Query($strSelectSampleID))
		{
			if($rs->Fetch())
			{
				$intNewSampleID = $rs->GetValue("h_pk_sid");
			}
		}
		// -- Create record in h_dahsboard_sample_datarow
		$strSamplesDatarowTable = "h_dashboard_sample_datarow";
		$arrSampleData['h_fk_mid'] = $intMeasureID;
		$arrSampleData['h_fk_sid'] = $intNewSampleID;
		// -- Remove h_fk_measure from Array as this will not be inserted
		unset($arrSampleData["h_fk_measure"]);
		// -- Update columns and values, following the above additions to the array
		$strValues = ePrepareArrayValues($arrSampleData);
		$strCols = ePrepareArrayColumns($arrSampleData);
		$strInsertSDSQL = "INSERT INTO ".$strSamplesDatarowTable." (".$strCols.") VALUES (".$strValues.")";
		if($rs->Query($strInsertSDSQL))
		{
			$boolInsertOK = true;
		}
		// -- boolInsertOK will return true if the two inserts above were successful
		if($boolInsertOK)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	// -- updateMeasureStats - Update Measure stats
	function updateMeasureStats($arrUpdateMeasureData)
	{
		// -- Connect to sw_systemdb
		$rs = new CSwDbConnection;
		if(!$rs->CacheConnect(swuid(), swpwd()))
		{
			logtofile("Info","Failed to establish a Database connection [Update Measure Stats].");
			exit;
		}
		// -- Build set for update statement
		$strSet = "";
		foreach($arrUpdateMeasureData as $col => $value)
		{
			// -- Should not be updating h_id. This value will only be used in where clause for the update statement
			if($col!="h_id")
			{
				if($strSet!="") $strSet .= ",";
				$strSet .= $col ."=". $value;
			}
		}		
		$strSQL = "UPDATE h_dashboard_measures SET ".$strSet." WHERE h_id = " .$arrUpdateMeasureData['h_id'];
		if($rs->Query($strSQL))
		{
			return true;
		}
		else
		{
			logtofile("Error","Unable to update the Measure record \n\nSQL : $strSQL");
		}
	}
	
	function sw_file_put_contents($strFilepath,$strContent,$boolAppend=false)
	{
		$m = ($boolAppend)?"a":"w";
		$fp = fopen($strFilepath, $m);
		fwrite($fp,$strContent);
		fclose($fp);
	}
?>