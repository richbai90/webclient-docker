<?php

//ADMIN SETTINGS
define('ADMIN_SETTINGS','A');
define('SLM_VIEW',1);
define('SLM_ADD',2);
define('SLM_EDIT',3);
define('SLM_DELETE',4);
define('SLM_ARCHIVE',5);
define('ADM_MANAGE',9);

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
define('CPR_CREATE',12);
define('CPR_EDIT',13);
define('CPR_CANCEL',14);
define('CPR_RESOLVE',15);
define('CPR_VIEW',16);

//RELEASE SETTINGS
define('PG_REL','E');
define('REL_CREATE',1);
define('REL_EDIT',2);
define('REL_CANCEL',3);
define('REL_RESOLVE',4);
define('REL_VIEW',5);

//-- CDMB Rights
define('PG_CMDB','F');
define('CMDB_VIEW',1);
define('CMDB_CREATE',2);
define('CMDB_EDIT',3);
define('CMDB_DELETE',4);
define('CMDB_BLINE',5);
define('CMDB_MNGTYPES',6);
define('CMDB_MNGSTAGE',7);
define('CMDB_SPECIALIST', 8);

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



class cmdbRights
{
	function can_view()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_CMDB, CMDB_VIEW); 
		return ($boolCan)?1:"You are not authorised to view configuration items in the CMDB.";
	}	

	function can_create()
	{
		//-- user can create
		$boolCan = HaveAppRight(PG_CMDB, CMDB_CREATE); 
		return ($boolCan)?1:"You are not authorised to create configuration items in the CMDB.";
	}	

	function can_update()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_EDIT); 
		return ($boolCan)?1:"You are not authorised to update configuration items in the CMDB.";
	}	


	function can_baseline()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_BLINE); 
		return ($boolCan)?1:"You are not authorised to baseline, or modify baselined, configuration items.";
	}	

	function is_specialist()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_SPECIALIST); 
		return ($boolCan)?1:"You are not an authorised CMDB specialist.";
	}	

	function can_manage()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_MNGTYPES); 
		return ($boolCan)?1:"You are not authorised to manage configuration types.";
	}	


	function can_managestage()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_MNGSTAGE); 
		return ($boolCan)?1:"You are not authorised to manage staging items.";
	}	

	function can_develop()
	{
		//-- Return develop ext forms security level for analyst
		return 1;
	}		


	function can_delete()
	{
		$boolCan = HaveAppRight(PG_CMDB, CMDB_DELETE); 
		return ($boolCan)?1:"You are not authorised to delete configuration items from the CMDB.";
	}
}

class adminRights
{
	function can_manage()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, ADM_MANAGE); 
		return ($boolCan)?1:"You do not have permission to manage general settings.";
	}
	function can_manage_slm()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, SLM_VIEW); 
		return ($boolCan)?1:"You do not have permission to view Service Level Management.";
	}
	function can_add_slm()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, SLM_ADD); 
		return ($boolCan)?1:"You do not have permission to add items in Service Level Management.";
	}
	function can_edit_slm()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, SLM_EDIT); 
		return ($boolCan)?1:"You do not have permission to edit items in Service Level Management.";
	}
	function can_delete_slm()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, SLM_DELETE); 
		return ($boolCan)?1:"You do not have permission to delete items in Service Level Management.";
	}
	function can_archive_slm()
	{
		$boolCan = HaveAppRight(ADMIN_SETTINGS, SLM_ARCHIVE); 
		return ($boolCan)?1:"You do not have permission to archive items in Service Level Management.";
	}
}

class bpmRights
{
	function can_manage()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_CANMANAGE); 
		return ($boolCan)?1:"You do not have permission to manage business processes.";
	}

	function can_add_tasks_onfly()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_ADDTASK); 
		return ($boolCan)?1:"You do not have permission to add tasks on the fly.";
	}

	function can_add_auth_onfly()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_ADDAUTH); 
		return ($boolCan)?1:"You do not have permission to add authorisers on the fly.";
	}

	function can_auth_for_analyst()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_ANALYSTAUTH); 
		return ($boolCan)?1:"You do not have permission to authorise on behalf of another analyst.";
	}

	function can_auth_for_customer()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_CUSTAUTH); 
		return ($boolCan)?1:"You do not have permission to authorise on behalf of a customer.";
	}
	
	function can_skip_task()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_SKIPTASK); 
		return ($boolCan)?1:"You do not have permission to skip a task.";
	}
	
	function can_set_status()
	{
		$boolCan = HaveAppRight(PG_BPM, BPM_SETSTATUS); 
		return ($boolCan)?1:"You do not have permission to set stage status.";
	}

}

class incidentRights
{
	function can_view()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_VIEW); 
		return ($boolCan)?1:"You are not authorised to view Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_edit()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_EDIT); 
		return ($boolCan)?1:"You are not authorised to modify Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_create()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_CREATE); 
		return ($boolCan)?1:"You are not authorised to create Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_cancel()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_CANCEL); 
		return ($boolCan)?1:"You are not authorised to cancel Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_resolve()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_RESOLVE); 
		return ($boolCan)?1:"You are not authorised to resolve Incident records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function receive_mi_alert()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_MI_ALERT); 
		return ($boolCan)?1:"You are not authorised to recieve Major Incident alerts.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function receive_pp_alert()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_PP_ALERT); 
		return ($boolCan)?1:"You are not authorised to recieve Potential Problem alerts.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_view_ola()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_OLA_VIEW); 
		return ($boolCan)?1:"You are not authorised to view OLA Task records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_edit_ola()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_OLA_EDIT); 
		return ($boolCan)?1:"You are not authorised to modify OLA Task records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}	

	function can_create_ola()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_OLA_CREATE); 
		return ($boolCan)?1:"You are not authorised to create OLA Task records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}

	function can_cancel_ola()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_OLA_CANCEL); 
		return ($boolCan)?1:"You are not authorised to cancel OLA Task records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}
	
	function can_resolve_ola()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_INC, INC_OLA_RESOLVE); 
		return ($boolCan)?1:"You are not authorised to resolve OLA Task records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}
}

class serviceRights
{
	function can_view()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_SC, SC_VIEW); 
		return ($boolCan)?1:"You are not authorised to view services.";
	}	
	
	function can_update()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_SC, SC_EDIT); 
		return ($boolCan)?1:"You are not authorised to update this service.";
	}

	function can_log()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_SC, SC_CREATE);
		return ($boolCan)?1:"You are not authorised to create Service Request records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}	
	function can_add()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_SC, SC_ADD);
		return ($boolCan)?1:"You are not authorised to create Service records.\nIf you require authorisation please contact your Supportworks Administrator.";
	}	

	function can_manage_costs()
	{
		//-- user can view
		$boolCan = HaveAppRight(PG_SC, SC_COST_SUBSCRIPTION);
		return ($boolCan)?1:"You are not authorised to manage Service costs and subscriptions.\nIf you require authorisation please contact your Supportworks Administrator.";
	}	
}

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

	function can_log($strCallclass,$boolMSG=false)
	{
		$boolLog = true;
		switch(strtolower($strCallclass))
		{
			case "incident":
				$boolLog = HaveAppRight(PG_INC, INC_CREATE);
				break;
			case "problem":
				$boolLog = HaveAppRight(PG_PRB, PRB_CREATE);
				break;
			case "known error":
				$boolLog = HaveAppRight(PG_PRB, KE_CREATE);
				break;
			case "change request":
				$boolLog = HaveAppRight(PG_RFC, RFC_CREATE);
				break;
			case "release request":
				$boolLog = HaveAppRight(PG_REL, REL_CREATE);
				break;
			case "service request":
				$boolLog = HaveAppRight(PG_SC, SC_CREATE);
				break;
			case "ola task":
				$boolLog = HaveAppRight(PG_INC, INC_OLA_CREATE);
				break;
			case "change proposal":
				$boolLog = HaveAppRight(PG_RFC, CPR_CREATE);
				break;
		}

		return ($boolLog)?1:"You are not authorised to create ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.";
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
			case "change proposal":
				$boolEdit = HaveAppRight(PG_RFC, CPR_EDIT);
				if($boolEdit)
				{
					$boolEdit = $this->rfc_edit_level();
				}
				break;
		}

		return ($boolEdit)?1:"You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.";
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
		GLOBAL $session;
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
?>
