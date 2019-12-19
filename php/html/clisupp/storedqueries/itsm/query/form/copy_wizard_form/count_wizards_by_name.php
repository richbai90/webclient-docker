<?php
	
	// -- Query to count wssm_wiz records by a given Wizard name. This is used in copy_wizard_form
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(*) AS CNT_PKNAME FROM WSSM_WIZ WHERE PK_NAME = ':[nwn]'";
	
?>