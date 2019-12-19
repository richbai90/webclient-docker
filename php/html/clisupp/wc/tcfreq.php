<?php 
	include('_wcconfig.php');
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);
	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['tcfdata']['tmp_name'];

		if(swhd_sendcommand($con, "TAKE CALL OFF HOLD " . $callref))		// Start the transaction
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