<?php
	$strCMDBAction = $_POST['_frmcmdbaction'];
	if($strCMDBAction=="Update Status")
	{
		$prefix = 'mpcsts_';
		//-- check if key matches
		if(!check_secure_key($prefix.'key'))
		{
			//-- set uploading to zero (determines if action is being taken)
			$cmdbActionErrorMsg = "Authentication failure. The status was not updated.";
			$boolFailed=true;
		}	
		else
		{
			$strNewStatus = $_POST['_new_status'];
			$strNewCMDBStatus = $_POST['_new_cmdb_status'];

			$strUnavailable = 'No';
			$strDeactivated = 'No';
			$strFaulty = 'No';
			$strImpacted = 'No';
			$strActive = 'No';

			if (strtolower($strNewCMDBStatus)=="unavailable")
			{
				$strUnavailable = "Yes";
			}
			else if (strtolower($strNewCMDBStatus)=="deactivated")
			{
				$strDeactivated = "Yes";
			}
			else if (strtolower($strNewCMDBStatus)=="faulty")
			{
				$strFaulty = "Yes";
			}
			else if (strtolower($strNewCMDBStatus)=="impacted")
			{
				$strImpacted = "Yes";
			}	
			else 
			{
				//-- assume active
				$strActive = "Yes";
			}

			$strSQL = "update config_itemi set isunavailable='".$strUnavailable."', isdeactivated='".$strDeactivated."', isfaulty='".$strFaulty."', isimpacted='".$strImpacted."', isactive='".$strActive."', fk_status_level='"._swm_db_pfs($strNewStatus)."', cmdb_status='"._swm_db_pfs($strNewCMDBStatus)."' where pk_auto_id=".$_POST['cmdb_holder'];
			$xmlmc = new XmlMethodCall();
			$xmlmc->SetParam("database","swdata");
			$xmlmc->SetParam("query",$strSQL);
			if($xmlmc->Invoke("data","sqlQuery"))
			{	
				$boolFailed=false;
			}
			else
			{
				echo $xmlmc->GetLastErrorCode()." : ".$xmlmc->GetLastError();;
				$boolFailed=true;
			}
		}
	}

?>