<?php

	function logoff($strMessage ="")
	{
		$xmlmc = new XmlMethodCall();
		$xmlmc->invoke("session","analystLogoff");
		logtofile("info",$strMessage,true);
	}

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

	class sample
	{
		var $measureID = 0;
		var $measureRecord = null;
		var $arrRecords = Array();

		var $sampledate = 0;
		var $samplevalue = 0;
		var $lastsamplevalue = 0;
		var $rowsaffected = 0;
		var $lasterror = "";

		function sample($mid)
		{
			$this->measureID = $mid;

			//-- get the measure recrod and store for future use
			$rs = new SqlQuery();
			if($rs->Query("select * from h_dashboard_measures where h_id = " .sqlprep($mid,DT_NUMERIC),"sw_systemdb"))
			{
				$this->measureRecord = $rs->Fetch();
			}
			else
			{
				$this->SetError($rs->GetLastError());
			}
		}

		function resetDataRecords()
		{
			$this->arrRecords = Array();
		}

		function setSampleInfo($datex,$value)
		{
			$this->sampledate = $datex;
			$this->samplevalue = $value;
		}

		function addDataRecord($dataRecordObject)
		{
			$this->arrRecords[] = $dataRecordObject;
			$this->rowsaffected = count($this->arrRecords);
		}

		//-- inserts sample record and inserts the sample row data
		function commit()
		{
			//-- add sample to sys samples table
			$arrData = Array();
			$arrData["h_fk_measure"] = $this->measureID;
			$arrData["h_value"] = $this->samplevalue;
			$arrData["h_sampledate"] = $this->sampledate;

			$rs = new SqlQuery();
			if($rs->InsertTableRecord("h_dashboard_samples",$arrData,"sw_systemdb"))
			{
				//-- need to get the msample record id (so select the last record inserted for this measure
				$rs->Reset();
				$strSelectSampleID = "select h_pk_sid from h_dashboard_samples where h_fk_measure = $this->measureID order by h_pk_sid desc limit 1";
				if(!$rs->Query($strSelectSampleID,"sw_systemdb"))
				{
					$this->SetLastError($rs->GetLastErrorMessage());
				}
				else
				{
					//-- make sure could get new record
					if(!$rs->Fetch())
					{
						$this->SetLastError("unable to retrieve the new sasmple id. Please contact Support.");
						return false;
					}

					$newSampleID = $rs->GetValueAsNumber("h_pk_sid");
				
					//-- add the sampled records to h_dahsboard_sample_datarow
					for($x=0;$x<count($this->arrRecords);$x++)
					{
						$data = $this->arrRecords[$x];
						$this->insertSampleDataRow($data,$newSampleID,$this->measureID);
					}

					//-- reset
					$this->arrRecords=Array();

					//-- update the measure record stats
					$arrData = Array();
					$arrData["h_id"] = $this->measureID;
					$arrData["h_frequency_count"] = 0;
					$arrData["h_actual"] = $this->samplevalue;
					$arrData["h_lastsampledate"] = $this->sampledate;
					$arrData["h_difference"] = $this->samplevalue - $this->measureRecord->h_actual;
					$this->measureRecord->h_actual = $this->samplevalue;
				
					$rs->Reset();
					if(!$rs->UpdateTableRecord("h_dashboard_measures.h_id",$arrData,"sw_systemdb"))
					{
						$this->SetLastError($rs->GetLastErrorMessage());
					}
					else
					{
						return true;
					}
				}
			}
			else
			{
				$this->SetLastError($rs->GetLastErrorMessage());
			}
			return false;
		}

		function insertSampleDataRow($dataObject,$sampleID,$mid)
		{
			$arrData = Array();
			foreach($dataObject as $col => $value)
			{
				$arrData[$col] = sqlprep($value,DT_STRING);
			}

			$arrData["h_fk_mid"] = $mid;
			$arrData["h_fk_sid"] = $sampleID;
	
			$rs = new SqlQuery();
			if(!$rs->InsertTableRecord("h_dashboard_sample_datarow",$arrData,"sw_systemdb"))
			{
				logtofile("error","failed to write sample data row [".$rs->GetLastErrorMessage()."]");
				return false;
			}
			return true;
		}

		function resetSampledData()
		{
			$rs = new SqlQuery();
			if(!$rs->Query("delete from h_dashboard_samples where h_fk_measure = " .$this->measureID,"sw_systemdb"))
			{
				logtofile("error","failed to clear down measure samples [".$rs->GetLastErrorMessage()."]");
				return false;
			}
			else
			{
				$rs = new SqlQuery();
				if(!$rs->Query("delete from h_dashboard_sample_datarow where h_fk_mid = " .$this->measureID,"sw_systemdb"))
				{
					logtofile("error","failed to clear down measure samples datarows [".$rs->GetLastErrorMessage()."]");
					return false;
				}
				else
				{
					//-- update the measure record stats
					$arrData = Array();
					$arrData["h_id"] = $this->measureID;
					$arrData["h_frequency_count"] = 0;
					$arrData["h_actual"] = 0;
					$arrData["h_lastsampledate"] = 0;
					$arrData["h_difference"] = 0;
				
					$rs = new SqlQuery();
					if(!$rs->UpdateTableRecord("h_dashboard_measures.h_id",$arrData,"sw_systemdb"))
					{
						logtofile("error","failed to reset measure record to starting [".$rs->GetLastErrorMessage()."]");
						return false;
					}

				}
			}
			return true;
		}

		function SetLastError($strMsg)
		{
			$this->lasterror=$strMsg;
		}

		function GetLastError()
		{
			return $this->lasterror;
		}
	}



?>