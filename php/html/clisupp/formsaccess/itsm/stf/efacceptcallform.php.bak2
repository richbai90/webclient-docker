<?php

	GLOBAL $session;
	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$accessGranted=	1;
	if (!HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANUPDATECALLS, false))
	{
		$accessGranted="I am sorry, you do not have the right to update calls.\n Please contact your administrator";
	}
	else
	{
		if(!HaveRight(ANALYST_RIGHT_A_GROUP, ANALYST_RIGHT_A_CANMODIFYCALLS, false))
		{
			$accessGranted="I am sorry, you do not have the right to change call statuses.\n Please contact your administrator";
		}
		else
		{
			//if analyst is assigned blocked or has surpassed their maximum number of calls that can be assigned
			//to them, send an error and don't open form.
			if($session->analyst->MaxAssignedCalls > 0) 
			{	
				$sqlDatabase = "sw_systemdb";
				$sqlCommand = "select count(*) as cnt from opencall where status < 16 AND status != 6 and owner = '". PrepareForSql( $session->analyst->AnalystID) ."'";
				$aRS = get_recordset($sqlCommand, $sqlDatabase);
				if ($aRS->Fetch())
				{
					$nCount = get_field($aRS,"cnt");
				}
				if($nCount >= $session->analyst->MaxAssignedCalls)
				{
					$accessGranted="Your Maximum Call Assignment count has been reached. You cannot accept this call.";
				}
			}
		}
	}
?>