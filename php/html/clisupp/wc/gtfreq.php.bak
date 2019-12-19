<?php 
	include('_wcconfig.php');
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	swdebug_print("GTFREC.PHP SessionID: " . $SwAnalystWebSession);

	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['gtfdata']['tmp_name'];

		if(swhd_sendcommand($con, "GET CALL ATTACH FILES " . $callref))		// Start the transaction
		{
			if(swhd_sequencecommit($con, $source))
			{
				echo swhd_getlastdata($con);	// Get the response
				echo swhd_getlastresponse($con);	// Get the response
				exit;
			}
		}
		echo swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>