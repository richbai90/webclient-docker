<?php
	GLOBAL $session;
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted = "You do not have permission to manage administration settings.";
	//-- can maange bpm
	if($session->analyst->privilegeLevel==3)
	{
		$accessGranted =1;
	}
?>