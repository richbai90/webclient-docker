<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();

	//-- make sure has app rights
	$cmdb->can_delete(true); //-- true param means will exit if current aid does not have right

	//-- make sure has app rights
	$cmdb->can_baseline(true); //-- true param means will exit if current aid does not have right

	$configItemKeys = $_POST['cids'];

	//-- process ci delete and return final delete result to client
	$rs = $cmdb->delete_configitem($configItemKeys, $boolDeleteBaselines);
	echo $rs->xmlmc->xmlresult;
	exit(0);	
?>