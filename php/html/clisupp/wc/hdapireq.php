<?php 
	include('_wcconfig.php');
	$source = $HTTP_POST_FILES['hdapidata']['tmp_name'];

	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);
	if($con && $con < 33)
	{
		// Get our command in from our temporary file
		$fp = fopen($source, "rb");
		if($fp)
		{
			$req = fread($fp, filesize("$source"));
			fclose($fp);
		}

		if(swhd_sendcommand($con, $req))		// Start the transaction
		{
			$res = swhd_getlastresponse($con);	// Get the response
			echo $res;
			exit;
		}
		echo swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>