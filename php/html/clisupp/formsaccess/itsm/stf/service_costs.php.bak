<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange cmdb
	$service = new serviceRights();	
	$accessGranted = $service->can_update();
	if($accessGranted === 1) {
		$accessGranted = $service->can_manage_costs();
	}
?>