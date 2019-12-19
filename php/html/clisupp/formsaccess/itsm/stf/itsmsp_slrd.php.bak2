<?php
	$accessGranted = 1;
	
	if(!HaveRight(ANALYST_RIGHT_C_GROUP,ANALYST_RIGHT_C_CANMANAGESLAS))
	{
		$accessGranted = "You do not have permission to manage SLAs.";
	}
	//-- Check App Rights
	if($accessGranted == 1)
	{
		//-- app right definitions
		IncludePhpFile("ITSM/apprights.php");

		//-- can maange cmdb
		$admin = new adminRights();	
		$accessGranted = $admin->can_manage_slm();
	}
?>