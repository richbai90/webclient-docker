<?php
	$accessGranted = 1;

	if($_POST['formmode']=='edit'){
		IncludePhpFile("ITSM/apprights.php");

		//-- can maange cmdb
		$service = new serviceRights();	
		$accessGranted = $service->can_update();
	}
?>