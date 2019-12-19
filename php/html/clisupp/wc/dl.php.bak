<?php 
	include('swdatabaseaccess.php');		// this defines classes needed to access and odbc database
//	include('swcookiesessionmanager.php');	// the session manager support classes
	include('_wcconfig.php');





//	$con = swhd_opensession(_SERVER_NAME, $SwAnalystWebSession);
	swdebug_print("DL.PHP SessionID: " . $sessionid);




	// Get our session information
	$con = odbc_connect("Supportworks Cache", swcuid(), swcpwd());

	$sessionok = FALSE;

	if($con)
	{
		$result = odbc_exec($con, "SELECT analystname, sessionid FROM swsessions WHERE sessiontype=2 AND sessionid = '" . $sessionid. "'");
		if($result)
		{
			while(odbc_fetch_row($result))
			{
				// Get the number of columns in our result set
				$ColumnCount = odbc_num_fields($result);
				$sessionok = TRUE;
			}
			odbc_free_result($result);
		}
		odbc_close($con);


		if ($sessionok == TRUE)
		{

			$filename = $file;

			$filesize = filesize($filename);

			Header("Content-Disposition: filename=\"" . $fname . "\"");
			Header("Content-Type: application/http");

			//Header("Content-Transfer-Encoding: binary");
			Header("Content-Length: " . $filesize);


			swdebug_print($filename);
			swdebug_print($filesize);

			readfile($filename);
		}
		else
		{
			swdebug_print("301 Invalid session id");
			echo "-301 Invalid session id";
		}
	}
	else
	{
		swdebug_print("301 odb_connect() failed");
		echo "-301 odb_connect() failed";
	}
?>
