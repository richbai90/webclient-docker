<?php 
	include('_wcconfig.php');
	// open a connection to the helpdesk server
	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);
	if($con && $con < 33)
	{
		if(swhd_sendcommand($con, "GET TABLE DESC"))		// Start the transaction
		{
			$query = base64_decode($query);

			swhd_sendstrvalue($con, "table", $_GET['table']);
			swhd_sendstrvalue($con, "cache", $_GET['cache']);

			if(swhd_commit($con))		// Commit the transaction
			{
				// Get our last response
				$ret = swhd_getlastresponse($con);	// Get the response

				// Strip off the "+OK ";
				$pos = strpos($ret,"+OK ");
				while(1==1)
				{
					$ret = substr($ret, 4);
					$pos = strpos($ret,"+OK ");
					if($pos===false)break;
				}

				// Make an arrat of item=value strings
				$values = explode(";", $ret);

				// Loop through our item=value strings and split them into a named array (map)
				for($x = 0; $x < sizeof($values); $x++)
				{
					$item = $values[$x];
					$pair = explode("=", trim($item));

					if($pair[0] == "filename")
						$filename = trim(strtr($pair[1], "\"", " "));
				}
			}
			else
			{
				$ret = swhd_getlasterror($con);		// Get the last error
				$this->LastError = $ret;
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

		Header("Content-Type: application/octet-stream");
		header("Content-Disposition: filename=" . $filename);
		Header("Content-Length: " . filesize($filename));
		readfile($filename);

		unlink($filename);

		return TRUE;
	}
?>