<?php

if(!class_exists('callFunctions'))
{
	define('CALL_ERROR','-107');
	//INCIDENT SETTINGS
	define('PG_INC','B');
	define('INC_CREATE',1);
	define('INC_EDIT',2);
	define('INC_CANCEL',3);
	define('INC_VIEW',5);
	define('INC_RESOLVE',12);
	define('INC_OLA_CREATE',6);
	define('INC_OLA_VIEW',7);
	define('INC_OLA_EDIT',8);
	define('INC_OLA_CANCEL',9);
	define('INC_OLA_RESOLVE',10);
	define('INC_MI_ALERT',11);
	define('INC_PP_ALERT',4);

	//PROBLEM SETTINGS
	define('PG_PRB','C');
	define('PRB_CREATE',1);
	define('PRB_EDIT',2);
	define('PRB_CANCEL',5);
	define('PRB_VIEW',8);

	define('PG_KE','C');
	define('KE_EDIT',3);
	define('KE_CREATE',4);
	define('KE_CANCEL',6);
	define('KE_RESOLVE',7);
	define('KE_VIEW',9);

	//CHANGE SETTINGS
	define('PG_RFC','D');
	define('RFC_CREATE',1);
	define('RFC_EDIT',2);
	define('RFC_CANCEL',3);
	define('RFC_RESOLVE',4);
	define('RFC_VIEW',5);
	define('RFC_BUS_AREA_ADD',6);
	define('RFC_BUS_AREA_REMOVE',7);
	define('RFC_CDF_ILA_ALTER',9);
	define('RFC_COORDINATOR',10);
	define('RFC_MANAGER',11);

	//RELEASE SETTINGS
	define('PG_REL','E');
	define('REL_CREATE',1);
	define('REL_EDIT',2);
	define('REL_CANCEL',3);
	define('REL_RESOLVE',4);
	define('REL_VIEW',5);

	//BPM SETTINGS
	define('PG_BPM','G');
	define('BPM_ADDTASK',1);
	define('BPM_ADDAUTH',2);
	define('BPM_CUSTAUTH',3);
	define('BPM_ANALYSTAUTH',4);
	define('BPM_SKIPTASK',5);
	define('BPM_SETSTATUS',6);
	define('BPM_CANMANAGE',7);

	//SERVICE CATALOG SETTINGS
	define('PG_SC','H');
	define('SC_VIEW',1);
	define('SC_EDIT',2);
	define('SC_ADD',3);
	define('SC_DELETE',4);
	define('SC_COST_SUBSCRIPTION',5);
	define('SC_DEMAND',7);
	define('SC_BASELINES',8);
	define('SC_PIPELINE',9);
	define('SC_RETIRED',10);
	define('SC_CREATE',11);
	define('SC_VIEW_CALL',12);
	define('SC_EDIT_CALL',13);
	define('SC_RESOLVE',14);
	define('SC_CANCEL',15);


	class callFunctions
	{
		var $_callref = 0;
		function throwError($strMessage)
		{
			//-- calls to main method in storedqueries/helpers.php
			throwError(CALL_ERROR, $strMessage);	
		}
		
		function set_callref($intCallref)
		{
			//-- calls to main method in storedqueries/helpers.php
			$this->_callref=$intCallref;
		}
		function can_edit($strCallclass,$boolMSG=false)
		{
			$boolEdit = true;
			switch(strtolower($strCallclass))
			{
				case "incident":
					$boolEdit = HaveAppRight(PG_INC, INC_EDIT);
					break;
				case "problem":
					$boolEdit = HaveAppRight(PG_PRB, PRB_EDIT);
					break;
				case "known error":
					$boolEdit = HaveAppRight(PG_PRB, KE_EDIT);
					break;
				case "change request":
					$boolEdit = HaveAppRight(PG_RFC, RFC_EDIT);
					if($boolEdit)
					{
						$boolEdit = $this->rfc_edit_level();
					}
					break;
				case "release request":
					$boolEdit = HaveAppRight(PG_REL, REL_EDIT);
					break;
				case "service request":
					$boolEdit = HaveAppRight(PG_SC, SC_EDIT_CALL);
					break;
				case "ola task":
					$boolEdit = HaveAppRight(PG_INC, INC_OLA_EDIT);
					break;
			}
			if(($boolMSG)&&(!$boolEdit))
			{
				$this->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
			}
			//-- user can 
			return $boolEdit;
		}	

		function rfc_edit_level()
		{
			$intCallref = $this->_callref;
			if($intCallref==0)
				return false;
				
			$intCanEdit = 0;
			$intRequestedByAnalyst = 1;
			$intCoordinator = 2;
			$intManager = 3;
			
			$boolGranted = false;
			$rs = new SqlQuery();
			
			$intBpmStageEditLevel = 0;
			
			$rs->Query('select bpm_stage.edit_level_reqd from opencall join bpm_stage on opencall.bpm_stage_id=bpm_stage.pk_stage_id where opencall.callref='.$intCallref);
			if($rs->Fetch())
			{
				$intBpmStageEditLevel = $rs->row->edit_level_reqd;
			}

			$strRequestByAnalystId = "";
			
			$rs->Query('select raised_by_analystid from itsm_opencall_rfc where callref='.$intCallref);
			if($rs->Fetch())
			{
				$strRequestByAnalystId = $rs->row->raised_by_analystid;
			}

			$intAnalystEditLevel = 0;
			// if the analyst hasn't got the Can Edit right, then nothing else should be possible
			if ($session->analyst->AnalystID == $strRequestByAnalystId)
				$intAnalystEditLevel = 1;
			if (HaveAppRight(PG_RFC, RFC_COORDINATOR))
				$intAnalystEditLevel = 2;
			if (HaveAppRight(PG_RFC, RFC_MANAGER))
				$intAnalystEditLevel = 3;
			
			if ($intAnalystEditLevel >= $intBpmStageEditLevel)
			{
				$boolGranted = true;
			}

			//-- user can 
			return $boolGranted;
		}	
	}
	
	global $call;
	$call = new callFunctions();
}	
?>