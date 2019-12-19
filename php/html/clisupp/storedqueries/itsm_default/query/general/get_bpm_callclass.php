<?php
	// -- Get the Callclass of a BPM Workflow
	
	$strFkWorkflowID = $_POST['wf_id'];
	
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT CALLCLASS FROM BPM_WORKFLOW WHERE PK_WORKFLOW_ID = '".$strFkWorkflowID."'";
?>