<?php 
	include('_wcconfig.php');
	// open a connection to the helpdesk server

	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['sardata']['tmp_name'];

		if(swhd_sendcommand($con, "SQL ADD RECORD"))		// Start the transaction
		{
			swhd_sendstrvalue($con, "table", $_GET['table']);

			if(swhd_sequencecommit($con, $source)) // Commit the transaction
			{
				// Get our last response
				echo swhd_getlastresponse($con);	// Get the response
			}
			else
			{
				$ret = swhd_getlasterror($con);		// Get the last error
				$this->LastError = $ret;
				echo $ret;
				swhd_close($con);
				return FALSE;
			}
		}
		else
		{
			$this->LastError = "Command NOT sent!";
			swhd_close($con);
			return FALSE;
		}

		swhd_close($con);
		return TRUE;
	}
?>