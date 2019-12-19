<?php
	$accessGranted = 1;
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	//-- Can View Cmdb
	$cmdb = new cmdbRights();	
	if($_POST['formmode']=='edit'){
		$accessGranted = $cmdb->can_view();
	} else if($_POST['formmode']=='add') {
		$accessGranted = $cmdb->can_create();
	}
?>