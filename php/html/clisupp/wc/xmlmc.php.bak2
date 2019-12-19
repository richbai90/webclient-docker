<?php 
	$con = swhd_opensession("localhost", $SwAnalystWebSession);
	if($con && $con < 33)
	{
		$source = $HTTP_POST_FILES['xmldata']['tmp_name'];
 		$handle =  fopen($source, "r");
		$xml = fread($handle, filesize($source));
		fclose($handle);
		unlink($source);

		if(swhd_sendcommand($con, "XML METHOD CALL"))		// Start the transaction
		{
			// Bug Fix 70954. AP. ActiveX client failed to display analyst tree on the Call Assign dialog.AT
			swhd_sendtextvalue($con, "xmldata", $xml);
			if(swhd_commit($con))
			{
				echo swhd_getlastdata($con);
				exit;
			}
		}
		echo swhd_getlasterror($con);
		exit;
	}
	echo "-301 Your session has timed out or is invalid";
?>