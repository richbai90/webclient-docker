<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted=1;
	if (!HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
	{
    	$accessGranted="You do not have sufficient privileges to modify calls.  Please contact your system administrator";
	}
?>