<?php
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted=1;
	if (!HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANMODIFYCALLS))
	{
    	$accessGranted="You do not have sufficient privileges to modify calls.  Please contact your system administrator";
	}
	else
	{
		//-- make sure user is allowed to resolve or close calls
		if( (!HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANCLOSECALLS)) && (!HaveRight(ANALYST_RIGHT_A_GROUP,ANALYST_RIGHT_A_CANRESOLVECALLS)) )
		{
			$accessGranted="You do not have sufficient privileges to resolve or close calls.  Please contact your system administrator";	
		}
	}
?>