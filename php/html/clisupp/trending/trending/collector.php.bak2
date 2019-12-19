<?php	
	// -- Dashboard & Trending - Data Collector
	//error_reporting(E_ALL);
	set_time_limit(0);
	include("collector.helpers.php");

	// -- Variables
	$intSampleTime = time();
	
	// -- Determine whether the script should begin data collection
	logtofile("START","Dashboard & Trending Engine <> Data Collector");
	$boolRunCollector = determineRunCollector();
	if(!$boolRunCollector)
	{
		// -- ABORT DATA COLLECTION
		logtofile("END","Dashboard & Trending Engine <> Data Collector");
		exit(0);
	}
	else
	{
		// -- BEGIN DATA COLLECTION
		logtofile("Info","Starting Data Collection");
		updateCollectorRunTime($intSampleTime);
		
		// -- Loop through all Dashboard Measures and collect data
		$oMeasures = getDashboardMeasures("h_dashboard_measures");
		while($oMeasures->Fetch())
		{
			$measureID = $oMeasures->GetValue("h_id");
			$title = $oMeasures->GetValue("h_title");
			$freqType = $oMeasures->GetValue("h_frequency_type");
			$freqOcc = $oMeasures->GetValue("h_frequency");
			$freqCount = $oMeasures->GetValue("h_frequency_count") + 1;
			$currentvalue = $oMeasures->GetValue("h_actual");
			
			// -- Only continue if the Measure is due data collection
			$boolRun = bRequireCollection($freqType);
			if(!$boolRun)
			{
				logtofile("Info","Data collection not required for Measure [$title].");
			}
			else
			{
				// -- PROCESS DATA COLLECTION
				// -- Update the frequency if required
				if($freqCount<$freqOcc)
				{
					// -- ABORT DATA COLLECTION
					// -- Update h_frequency_count within the Measure record
					$strSetData = "h_frequency_count = ". $freqCount;
					if(!updateMeasureRecord($measureID,$strSetData,"h_dashboard_measures"))
					{
						logtofile("Info","Failed to update the Dashboard Measure [$title].");
					}
					else
					{
						logtofile("Info","Updated the Dashboard Measure [$title].");
					}
				}
				else
				{
					// -- COLLECT DATA FOR MEASURE
					logtofile("Info","Running data collection for the Measure [$title].");
					// -- Collect data through a custom script if a "Data Provider" is set within the Measure
					$dataprovider = trim(str_replace("//","/",$oMeasures->GetValue("h_dataprovider")));
					if($dataprovider!="")
					{
						// -- USE DATA PROVIDER SCRIPT
						if(file_exists("../".$dataprovider))
						{
							// -- Return startdatetime and enddatetime (used in sql to filter between dates)
							$sampleDateRange = get_sample_startend_timeobject($freqType,$intSampleTime);
							ob_start( );
							include("../".$dataprovider); //-- data provider does all of the processing - it should select a count,avg,prec,sum whatever fromrecords between a start and end range
							$output = ob_get_clean();
							logtofile("Info",$output);
						}
						else
						{
							logtofile("Warning","The Data Provider script for the Measure [$title] was not found.");
						}
					}
					else
					{
						// -- USE SAMPLE SETTINGS
						// -- Sample settings that are required for collecting data are Sample Table, Primary Key and Sample Epoch Start Column
						$sampletable = trim($oMeasures->GetValue("h_sampleon_table"));
						$valcol = $oMeasures->GetValue("h_sampleon_valcolname");
						$startdatecol = $oMeasures->GetValue("h_sampleon_datecolname1");
						if($sampletable!="" && $valcol!="" && $startdatecol!="")
						{
							// -- Store Sample Settings from the Measure
							// -- Sample Column
							$keycol = trim($oMeasures->GetValue("h_sampleon_keycolname"));
							if($keycol=="")$keycol=$valcol;
							// Sample Method
							$mathfunc = trim($oMeasures->GetValue("h_sampleon_mathfunc"));
							if($mathfunc=="")$mathfunc="count";
							// -- End Column
							$enddatecol = trim($oMeasures->GetValue("h_sampleon_datecolname2"));
							if($enddatecol=="")$enddatecol=$startdatecol;
							// -- Filter Data Where
							$whereclause = trim($oMeasures->GetValue("h_sampleon_whereclause"));
							if($whereclause!="") $whereclause = " and " . $whereclause;
							// -- Save Data Columns
							$savecols = trim($oMeasures->GetValue("h_sampleon_savecols"));
							if($savecols!="")$savecols=",".$savecols;
							//-- Clause to ensure that only usable/populated dates are used
							$dateClause="";
							if($startdatecol!=$enddatecol) $dateClause = " and $enddatecol > $startdatecol";
							// -- Return startdatetime and enddatetime (used in sql to filter between dates)
							$sampleDateRange = get_sample_startend_timeobject($freqType,$intSampleTime);
							// -- Only save 10 data columns
							$arrSaveDataCols = array_slice(explode(",",$savecols), 0, 10);
							
							// -- BUILDING SAMPLING QUERY
							// -- If the Sample Method is Percentage, then count all and fetch rows that meet % criteria
							$percentageTotalRecords = 0;
							if($mathfunc=="perc")
							{
								// -- SAMPLE QUERY
								$mathColPercWhere = $oMeasures->GetValue("h_sampleon_colwhere");
								$strSampleSelect = trim("select $keycol as samplekeyxx,$valcol as samplevalxx,$startdatecol as sampledate1xx,$enddatecol as sampledate2xx $savecols from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause and $mathColPercWhere");
								// -- Get the total records excluding the percentage where clause
								$strTotalCountSelect = trim("select count($keycol) as totalcount from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause");
								$percentageTotalRecords = getPercentageTotal($strTotalCountSelect);
							}
							else
							{
								// -- SAMPLE QUERY
								$strSampleSelect = trim("select $keycol as samplekeyxx,$valcol as samplevalxx,$startdatecol as sampledate1xx,$enddatecol as sampledate2xx $savecols from $sampletable where $startdatecol >= $sampleDateRange->startdatetime and $enddatecol <= $sampleDateRange->enddatetime $dateClause $whereclause");
							}
							
							// -- SAMPLE DATA
							/* DEBUG echo $strSampleSelect //SAMPLE QUERY */
							$oSampleData = getSampleData($strSampleSelect);
							$arrSampleData = Array();
							$rowsAffected=0;							
							// -- Booleans for each stage
							$boolComplete = false;
							$boolCollectionRequired = false;
							$boolUpdateMeasure = false;
							$boolInsertSampleMeasure = false;							
							// -- Collection required
							while($oSampleData->Fetch())
							{				
								$boolCollectionRequired = true;
								$rowsAffected++;
								// -- SAMPLE DATA - Create array (arrSampleData) of data for the affected rows
								$arrSampleData['h_sampledkeyvalue'] = $oSampleData->GetValue("samplekeyxx");
								$arrSampleData['h_sampledvalue'] = $oSampleData->GetValue("samplevalxx");
								// -- When samplevalxx returns 0, odbc_result returns a blank string. We need this to be set to 0 for avg func to work
								if($arrSampleData['h_sampledvalue'] == "")
									$arrSampleData['h_sampledvalue'] = 0;
								$arrSampleData['h_sampledcolumn'] = $valcol;
								$arrSampleData['h_sampledatecolumn1_value'] = $oSampleData->GetValue("sampledate1xx");
								$arrSampleData['h_sampledatecolumn2_value'] = $oSampleData->GetValue("sampledate2xx");
								$arrSampleData['h_data_col1_value'] = $valcol;
								$arrSampleData["h_fk_measure"] = $measureID;
								for($x=0;$x<count($arrSaveDataCols);$x++)
								{
									$colName = $arrSaveDataCols[$x];
									if($colName!="")
									{
										$saveTo = "h_data_col".($x+1)."_value";
										$arrSampleData[$saveTo] = $oSampleData->GetValue($colName);
									}
								}
								
								// -- SAMPLE DATA
								$arrMeasureData['h_value'] = runMathFunc($mathfunc,$rowsAffected,$arrSampleData['h_sampledvalue'],$percentageTotalRecords);
								$arrMeasureData['h_sampledate'] = $intSampleTime;
								$arrMeasureData["h_fk_measure"] = $measureID;
								// -- INSERT SAMPLE MEASURE DATAROWS
								if(insertSampleMeasureDataRow($arrSampleData))
								{
									$boolInsertSampleMeasure = true;
									$boolUpdateMeasure = true;
								}
								else
								{
									logtofile("Error","Failed to collect sample data for the Measure [".$measureID."].");
								}
							}
							
							// -- INSERT SAMPLE MEASURE - Create a Measure Sample after the datarows collection is complete
							if($boolInsertSampleMeasure)
							{
								insertSampleMeasure($arrMeasureData);
							}							
							// -- UPDATE MEASURE RECORD - Update Measure record if the sample datarows are collected
							if($boolUpdateMeasure)
							{
								// -- Update Measure record stats
								// -- If record is inserted into h_dashboard_samples and h_dahsboard_sample_datarow, then we can update Measure record stats
								$arrUpdateMeasureData = Array();
								$arrUpdateMeasureData['h_id'] = $measureID;
								$arrUpdateMeasureData['h_frequency_count'] = 0;
								$arrUpdateMeasureData['h_actual'] = $arrMeasureData['h_value'];
								$arrUpdateMeasureData['h_lastsampledate'] = $intSampleTime;
								$arrUpdateMeasureData['h_difference'] = $arrMeasureData['h_value'] - $currentvalue;
								if(updateMeasureStats($arrUpdateMeasureData))
								{
									$boolComplete = true;
								}
							}					
							// -- NO COLLECTION REQUIRED - When the Sample query ($strSampleSelect) finds no data to collect/process
							if(!$boolCollectionRequired)
							{
								// -- No data was due collection however we will need to add a new Measure sample and update Measure record stats
								// --- Create Measure sample								
								$arrNCMeasureData['h_value'] = runMathFunc($mathfunc,0,0,$percentageTotalRecords);
								$arrNCMeasureData['h_sampledate'] = $intSampleTime;
								$arrNCMeasureData["h_fk_measure"] = $measureID;
								insertSampleMeasure($arrNCMeasureData);								
								// --- Update Measure record stats
								$arrNCUpdateMeasureData = Array();
								$arrNCUpdateMeasureData['h_id'] = $measureID;
								$arrNCUpdateMeasureData['h_frequency_count'] = 0;
								$arrNCUpdateMeasureData['h_actual'] = runMathFunc($mathfunc,0,0,$percentageTotalRecords);
								$arrNCUpdateMeasureData['h_lastsampledate'] = $intSampleTime;
								$arrNCUpdateMeasureData['h_difference'] = $arrNCMeasureData['h_value'] - $currentvalue;
								updateMeasureStats($arrNCUpdateMeasureData);
								
								logtofile("Info","No sampling required for the Measure [$title]");
							}
							
							// -- Collection is complete
							if($boolComplete)
							{
								logtofile("Info","Collected [$rowsAffected] row(s) of sampling for the Measure [$title]");
							}
						}
						else
						{
							// -- All 3 sample settings (sampletable, valcol, startdatecol) for a Measure should be defined
							logtofile("Warning","The sampling settings for the Measure [$title] are incomplete.");
						}
					} // -- END - USE SAMPLE SETTINGS
				}
			}
		}
	} // -- END DATA COLLECTION
	
	logtofile("END","Dashboard & Trending Engine <> Data Collector");
?>