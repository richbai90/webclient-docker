<?php 
	include('_wcconfig.php');

	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['ucfdata']['tmp_name'];

		if(swhd_sendcommand($con, "UPDATE CALL " . $callref))		// Start the transaction
		{
			if(swhd_sequencecommit($con, $source))
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