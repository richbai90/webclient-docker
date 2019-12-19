<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted=	1;
	if (!HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANUPDATECALLS, false))
	{
		$accessGranted="I am sorry, you do not have the right to update calls.\n Please contact your administrator";
	}
?>