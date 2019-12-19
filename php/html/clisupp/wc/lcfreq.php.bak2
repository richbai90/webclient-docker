<?php 
	include('_wcconfig.php');
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);
	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['lcfdata']['tmp_name'];
		if(swhd_sendcommand($con, "LOG CALL"))		// Start the transaction
		{
			if(swhd_sequencecommit($con, $source))
			{
				echo swhd_getlastresponse($con);	// Get the response
				exit;
			}
			else
			{
				$resp = swhd_getlastresponse($con);
				swdebug_print("Response: " . $resp);	// Get the response
				echo $resp;	// Get the response
				exit;
			}
		}
		else
		{
			echo swhd_getlastresponse($con);	// Get the response
			exit;
		}
		echo swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>