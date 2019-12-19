<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange cmdb
	$bpm = new bpmRights();	
	$accessGranted = $bpm->can_manage();
	if($accessGranted!==1) 
	{
		$accessGranted = HaveRight(ANALYST_RIGHT_C_GROUP,ANALYST_RIGHT_C_CANMANAGESLAS);
	}
?>