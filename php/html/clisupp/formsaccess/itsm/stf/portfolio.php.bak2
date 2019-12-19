<?php
	//-- app right definitions
	$accessGranted = 1;
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange cmdb
	$service = new serviceRights();	
	if($_POST['formmode']=='edit'){
		$accessGranted = $service->can_view();
	} else if($_POST['formmode']=='add') {
		$accessGranted = $service->can_add();
	}
?>