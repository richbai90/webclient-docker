<?php
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange bpm
	$bpm = new bpmRights();	
	$accessGranted = $bpm->can_add_tasks_onfly();
	if($accessGranted===1)	{
		$strSelect = "select callclass from OPENCALL where callref = " . PrepareForSql($_POST['fk_callref']);
		$oRS = get_recordset($strSelect);
		$strCallclass = "";
		if($oRS->Fetch()) {
			$strCallclass = get_field($oRS,'callclass');
		}
		if($strCallclass=='Change Request'){
			//-- app right definitions
			
			$itsmCalls = new callFunctions();
			$itsmCalls->set_callref($_POST['fk_callref']);
			$accessGranted = $itsmCalls->can_edit($strCallclass);	
		}
	}

?>