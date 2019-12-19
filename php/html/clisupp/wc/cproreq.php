<?php 
	include('_wcconfig.php');

	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	if($con && $con < 33)
	{
		if(swhd_sendcommand($con, "CHANGE CALL PROBLEM PROFILE"))		// Start the transaction
		{
			swhd_sendstrvalue($con, "callref",$callref);
			swhd_sendstrvalue($con, "code",	$code);

			if(swhd_commit($con))		// Commit the transaction
			{
				echo swhd_getlastresponse($con);	// Get the response
				exit;
			}
		}
		echo swhd_getlasterror();
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>