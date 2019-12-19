<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted=	1;
	if (!HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
	{
		$accessGranted="I am sorry, you do not have sufficient privileges to perform that action.  Please contact your system administrator";
	}
?>