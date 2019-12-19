<?php 
	include('_wcconfig.php');
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);

	swdebug_print("DLFREC.PHP SessionID: " . $SwAnalystWebSession);

	if($con && $con < 33)
	{
		// Start the transaction
		if(swhd_sendcommand($con, "DOWNLOAD CALL ATTACH FILES"))		// Start the transaction
		{
			swhd_sendstrvalue($con, "callref", $_GET['callref']);
			swhd_sendstrvalue($con, "attachfileid", $_GET['attachfileid']);

			if(swhd_commit($con))
			{
				$fname = swhd_getlastresponse($con);
				swhd_close($con);

				// Strip off the "+OK ";
				$pos = strpos($fname,"+OK ");
				
				if($pos===false)
				{
					echo "-401 File not found ";
					exit;
				}

				while(1==1)
				{
					$fname = substr($fname, 4);
					$pos = strpos($fname,"+OK ");
					if($pos===false)break;
				}

				$fname = trim($fname);
				Header("Content-Type: application/octet-stream");
				header("Content-Disposition: filename=\"".basename($fname)."\"");
				Header("Content-Length: " .  filesize($fname));
				readfile($fname);
				exit;
			}
		}
		echo "-201 ".swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid.";
?>