<?php 
	include('_wcconfig.php');
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	swdebug_print("ATFREC.PHP SessionID: " . $SwAnalystWebSession);

	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['atfdata']['tmp_name'];

		if(swhd_sendcommand($con, "ATTACH FILES TO CALL " . $callref))		// Start the transaction
		{
			if(swhd_sequencecommit($con, $source))
			{
				echo swhd_getlastresponse($con);	// Get the response
				exit;
			}
		}
		echo swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>