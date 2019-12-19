<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange cmdb
	$admin = new adminRights();	
	$accessGranted = $admin->can_manage_slm();
	
?>