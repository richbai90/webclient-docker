<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	//-- can maange cmdb
	$itsmCalls = new callFunctions();
	$accessGranted = $itsmCalls->can_log('Known Error');	
			
	if($accessGranted ===1)
	{
		$accessGranted = $itsmCalls->can_edit('Problem');	
	}
?>