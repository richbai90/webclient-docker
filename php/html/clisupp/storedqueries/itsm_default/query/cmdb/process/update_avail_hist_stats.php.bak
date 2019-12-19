<?php

	//-- global.js cmdb update_avail_hist_stats

	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();


	if($cmdb->update_avail_hist_stats($_POST['cid']))
	{
		throwSuccess(0);
	}
	else
	{
		$cmdb->throwError("Failed to update availability history statistics for configuration item. Please contact your Administrator"); 
	}

?>